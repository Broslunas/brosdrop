import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize bundle size and performance
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Configure images for better loading
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.broslunas.com',
      },
    ],
  },
};

export default nextConfig;
