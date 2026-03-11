import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dhgnfqqtwnbebikkaoyo.supabase.co',
      },
    ],
  },
}

export default nextConfig
