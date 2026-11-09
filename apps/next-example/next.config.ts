import type { NextConfig } from 'next';

// Packed tarballs only, never an alias to monorepo src/: the example proves what consumers install.
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
