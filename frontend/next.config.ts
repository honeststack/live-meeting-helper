import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google-cloud/speech', 'ws'],
}

export default nextConfig
