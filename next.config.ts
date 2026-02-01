import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'digital-empire-2-managing-system';

const nextConfig: NextConfig = {
  // output: 'export', // Disabled for MongoDB (requires server/API routes)
  // distDir: 'docs',
  images: {
    unoptimized: true,
  },
  // GitHub Pages repository name configuration
  // basePath: isProd ? `/${repoName}` : '',
  // assetPrefix: isProd ? `/${repoName}/` : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;
