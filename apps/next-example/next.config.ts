import type { NextConfig } from 'next';

/** Consume packed tarballs only. Do not alias to monorepo src/. */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
