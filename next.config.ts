import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  devIndicators: false,
  // Lets the dev server respond to requests from phones/tablets on the same
  // Wi-Fi network (e.g. http://192.168.1.194:3000) instead of only localhost.
  allowedDevOrigins: ["192.168.1.194"],
};

export default nextConfig;
