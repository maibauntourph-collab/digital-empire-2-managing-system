import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'digital-empire-2-managing-system';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'docs',
  images: {
    unoptimized: true,
  },
  // GitHub Pages repository name configuration
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
