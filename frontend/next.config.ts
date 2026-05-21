import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el dev server desde la IP de red local (móvil, otra PC)
  allowedDevOrigins: [
    "192.168.1.13",
    "192.168.1.13:3000",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
