import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import { readFile, stat } from 'node:fs/promises';
import { request } from 'node:https';
import { BlockList, isIP } from 'node:net';
import { basename, resolve } from 'node:path';

export type SourceKind = 'png' | 'jpeg' | 'svg' | 'pdf' | 'webp' | 'gif' | 'unknown';
export type Source = { bytes: Buffer; kind: SourceKind; label: string };
export type SourceInput = { path?: string; url?: string; base64?: string };

/** Brand manuals run to tens of pages of images; logos are far smaller. */
const maxBytes = 25 * 1024 * 1024;
const timeoutMs = 15_000;
const maxRedirects = 5;

/** Detect the format from the bytes, never from the file name or Content-Type. */
export function detectKind(bytes: Buffer): SourceKind {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.subarray(0, 5).toString('latin1') === '%PDF-') return 'pdf';
  if (
    bytes.subarray(0, 4).toString('latin1') === 'RIFF' &&
    bytes.subarray(8, 12).toString('latin1') === 'WEBP'
  )
    return 'webp';
  if (bytes.subarray(0, 4).toString('latin1') === 'GIF8') return 'gif';
  const head = bytes.subarray(0, 4096).toString('utf8').replace(/^﻿/, '').trimStart();
  if (
    (head.startsWith('<?xml') ||
      head.startsWith('<svg') ||
      head.startsWith('<!--') ||
      head.startsWith('<!DOCTYPE svg')) &&
    /<svg[\s>]/i.test(head)
  )
    return 'svg';
  return 'unknown';
}

/**
 * Addresses a URL fetch must never reach: loopback, private, link-local (cloud metadata),
 * carrier-grade NAT, multicast, reserved, and their IPv4-mapped IPv6 forms.
 */
const blocked = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
  ['2001:db8::', 32],
  ['64:ff9b::', 96],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv6');
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 0) return false;
  if (family === 4) return !blocked.check(address, 'ipv4');
  // IPv4-mapped IPv6 (::ffff:127.0.0.1, ::ffff:7f00:1) is the IPv4 host underneath. The URL
  // parser normalizes every spelling to the hex form.
  const mapped = new URL(`http://[${address}]`).hostname.match(
    /^\[::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})\]$/,
  );
  if (mapped) {
    const [high, low] = [Number.parseInt(mapped[1], 16), Number.parseInt(mapped[2], 16)];
    return isPublicAddress([high >> 8, high & 255, low >> 8, low & 255].join('.'));
  }
  return !blocked.check(address, 'ipv6');
}

/** Every URL, the first and each redirect, is checked here before it's requested. */
function download(raw: string, redirects: number): Promise<Buffer> {
  return new Promise((resolvePromise, reject) => {
    // A throw in here rejects the promise.
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new Error(`"${raw}" isn't a URL.`);
    }
    if (url.protocol !== 'https:')
      throw new Error(`Only https URLs are fetched, not ${url.protocol}//.`);
    if (url.username || url.password) throw new Error('URLs with credentials are refused.');
    const host = url.hostname.replace(/^\[|\]$/g, '');
    if (isIP(host) && !isPublicAddress(host))
      throw new Error(
        `${host} is a private or reserved address; only public https URLs are fetched.`,
      );
    if (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      throw new Error(`${host} is a local host name; only public https URLs are fetched.`);
    }

    const req = request(
      url,
      {
        // Resolve, then refuse private addresses. This runs at connect time, so a DNS answer that
        // changes between a check and the request (rebinding) can't reach an internal host.
        lookup: (hostname, options, callback) => {
          dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
            if (error) return callback(error, '', 0);
            // With `all: true` Node passes an array, but its callback type only models the
            // single-address form; the same goes for the reply below.
            const list = addresses as unknown as LookupAddress[];
            const refused = list.find((entry) => !isPublicAddress(entry.address));
            if (refused || list.length === 0) {
              return callback(
                new Error(
                  `${hostname} resolves to a private or reserved address (${refused?.address ?? 'none'}); only public https URLs are fetched.`,
                ),
                '',
                0,
              );
            }
            if (options.all) {
              // See above: the all-addresses reply isn't in Node's callback type.
              return (callback as unknown as (error: null, addresses: LookupAddress[]) => void)(
                null,
                list,
              );
            }
            return callback(null, list[0].address, list[0].family);
          });
        },
        timeout: timeoutMs,
        headers: { accept: 'image/*, application/pdf', 'user-agent': '@becket-ui/mcp' },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if (status >= 300 && status < 400 && response.headers.location) {
          response.resume();
          if (redirects >= maxRedirects)
            return reject(new Error(`More than ${maxRedirects} redirects.`));
          try {
            return resolvePromise(
              download(new URL(response.headers.location, url).toString(), redirects + 1),
            );
          } catch (error) {
            // A Location that can't be read as a URL.
            return reject(error);
          }
        }
        if (status !== 200) {
          response.resume();
          return reject(new Error(`The server answered ${status}.`));
        }
        const declared = Number(response.headers['content-length'] ?? 0);
        if (declared > maxBytes) {
          response.destroy();
          return reject(
            new Error(
              `The file is ${(declared / 1048576).toFixed(1)} MB; the limit is ${maxBytes / 1048576} MB.`,
            ),
          );
        }
        const chunks: Buffer[] = [];
        let size = 0;
        response.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > maxBytes) {
            response.destroy();
            reject(new Error(`The file is over the ${maxBytes / 1048576} MB limit.`));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => resolvePromise(Buffer.concat(chunks)));
        response.on('error', reject);
      },
    );
    req.on('timeout', () => req.destroy(new Error(`No answer within ${timeoutMs / 1000} s.`)));
    req.on('error', reject);
    req.end();
  });
}

/** Read an image or PDF from a local path, an https URL or base64 (a data: URL works too). */
export async function loadSource(input: SourceInput): Promise<Source> {
  if ([input.path, input.url, input.base64].filter(Boolean).length !== 1)
    throw new Error('Pass exactly one of path, url or base64.');

  let bytes: Buffer;
  let label: string;
  if (input.path) {
    const path = resolve(input.path);
    const info = await stat(path).catch(() => null);
    if (!info?.isFile()) throw new Error(`No file at ${path}.`);
    if (info.size > maxBytes)
      throw new Error(
        `${basename(path)} is ${(info.size / 1048576).toFixed(1)} MB; the limit is ${maxBytes / 1048576} MB.`,
      );
    bytes = await readFile(path);
    label = basename(path);
  } else if (input.url) {
    bytes = await download(input.url, 0);
    label = input.url;
  } else {
    const data = (input.base64 ?? '').replace(/^data:[^;,]+;base64,/, '').replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) throw new Error("base64 isn't valid base64.");
    if ((data.length * 3) / 4 > maxBytes)
      throw new Error(`The data is over the ${maxBytes / 1048576} MB limit.`);
    bytes = Buffer.from(data, 'base64');
    label = 'base64 data';
  }
  if (bytes.length === 0) throw new Error('The file is empty.');
  return { bytes, kind: detectKind(bytes), label };
}
