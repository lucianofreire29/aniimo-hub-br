import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "worldx-website-cdn.aniimo.com",
      },
      {
        protocol: "https",
        hostname: "aniimoguide.com",
      },
      {
        protocol: "https",
        hostname: "aniimotools.dev",
      },
      {
        protocol: "https",
        hostname: "cdn.aniimoverse.com",
      },
    ],
  },
};

export default nextConfig;
