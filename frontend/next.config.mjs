const backendHost =
  process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Only use rewrites in development when NEXT_PUBLIC_BACKEND_HOST is set
  async rewrites() {
    // In production, we prefer direct API calls instead of proxy
    if (process.env.NEXT_PUBLIC_BACKEND_HOST) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendHost}/api/:path*`, // Proxy to Backend
        },
        {
          source: '/r/:slug',
          destination: `${backendHost}/r/:slug`, // Proxy to Backend
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
