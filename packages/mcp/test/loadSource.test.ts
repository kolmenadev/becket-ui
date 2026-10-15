import { describe, expect, it } from 'vitest';

import { detectKind, isPublicAddress, loadSource } from '../src/theme/loadSource';

describe('URL policy', () => {
  it.each([
    ['http://example.com/logo.png', /Only https URLs are fetched, not http:/],
    ['file:///etc/passwd', /Only https URLs are fetched, not file:/],
    ['https://127.0.0.1/logo.png', /127\.0\.0\.1 is a private or reserved address/],
    ['https://169.254.169.254/latest/meta-data', /169\.254\.169\.254 is a private or reserved address/],
    ['https://10.1.2.3/x.png', /private or reserved/],
    ['https://[::1]/x.png', /::1 is a private or reserved address/],
    ['https://[::ffff:127.0.0.1]/x.png', /private or reserved/],
    ['https://localhost/x.png', /localhost is a local host name/],
    ['https://printer.local/x.png', /local host name/],
    ['https://user:secret@example.com/x.png', /credentials are refused/],
    ['not a url', /isn't a URL/],
  ])('refuses %s before connecting', async (url, message) => {
    await expect(loadSource({ url })).rejects.toThrow(message);
  });

  it.each([
    ['127.0.0.1', false],
    ['10.0.0.8', false],
    ['172.16.5.4', false],
    ['192.168.1.1', false],
    ['100.64.0.1', false],
    ['169.254.169.254', false],
    ['0.0.0.0', false],
    ['224.0.0.1', false],
    ['::1', false],
    ['fd00::1', false],
    ['fe80::1', false],
    ['::ffff:10.0.0.1', false],
    ['::ffff:7f00:1', false],
    ['8.8.8.8', true],
    ['151.101.1.69', true],
    ['2606:4700:4700::1111', true],
    ['example.com', false],
  ])('isPublicAddress(%s) is %s', (address, expected) => {
    expect(isPublicAddress(address)).toBe(expected);
  });
});

describe('sources', () => {
  it('detects formats from bytes, not names', () => {
    expect(detectKind(Buffer.from('%PDF-1.7\n'))).toBe('pdf');
    expect(detectKind(Buffer.from('﻿<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe('svg');
    expect(detectKind(Buffer.from('<html><body>not an svg</body></html>'))).toBe('unknown');
    expect(detectKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg');
  });

  it('refuses bad base64 and empty input', async () => {
    await expect(loadSource({ base64: 'not base64!' })).rejects.toThrow("base64 isn't valid base64.");
    await expect(loadSource({})).rejects.toThrow('Pass exactly one of path, url or base64.');
  });
});
