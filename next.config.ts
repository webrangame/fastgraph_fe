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
    domains: ['example.com', 'storage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/fastgraph-images-geodirectory-2025/**',
      },
    ],
  },
  // Vercel optimizations
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  webpack: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any,
    { isServer }: { isServer: boolean }
  ) => {
    return config;
  },
};

export default nextConfig;