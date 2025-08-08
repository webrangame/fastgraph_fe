import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript errors enforced
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  images: {
    domains: ['example.com'],
  },
  webpack: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any,
    { isServer }: { isServer: boolean }
  ) => {
    return config;
  },
  swcMinify: true,
};

export default nextConfig;