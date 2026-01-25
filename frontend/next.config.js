/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable WebSocket support
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
