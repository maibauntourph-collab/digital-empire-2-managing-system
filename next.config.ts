import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages repository name
  basePath: '/digital-empire-2-managing-system',
  assetPrefix: '/digital-empire-2-managing-system/',
};

export default nextConfig;
