import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // ✅ desliga o double-mount no dev

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aumenta o limite para aceitar PDFs de múltiplas páginas
    },
  },
};

export default nextConfig;