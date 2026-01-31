import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Optional: Change the output directory `out` -> `docs`
  distDir: 'dist',
};

export default nextConfig;
