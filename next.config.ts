import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ['image.mux.com'],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.mux.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig