import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "fly.storage.tigris.dev" },
      { protocol: "https", hostname: "t3.storage.dev" },
      { protocol: "https", hostname: "**.t3.storage.dev" },
      { protocol: "https", hostname: "**.tigris.dev" },
    ],
  },
}

export default nextConfig
