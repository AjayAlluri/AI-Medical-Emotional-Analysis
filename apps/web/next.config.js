/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_INGEST_URL: process.env.NEXT_PUBLIC_INGEST_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
