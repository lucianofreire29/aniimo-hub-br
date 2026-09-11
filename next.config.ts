import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "worldx-website-cdn.aniimo.com",
      },
    ],
  },
};

export default nextConfig;
