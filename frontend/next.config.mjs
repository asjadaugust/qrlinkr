const backendHost =
  process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Only use rewrites in development when NEXT_PUBLIC_BACKEND_HOST is set
  // and NEXT_PUBLIC_API_BASE_URL is NOT set (production uses direct API calls)
  async rewrites() {
    // In production, NEXT_PUBLIC_API_BASE_URL is set for direct API calls - no proxy needed
    // In development, NEXT_PUBLIC_BACKEND_HOST is set for Docker network proxy
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      // Production mode: use direct API calls, no proxy
      return [];
    }

    if (process.env.NEXT_PUBLIC_BACKEND_HOST) {
      // Development mode: use Next.js proxy
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

    // Local development fallback
    return [
      {
        source: '/api/:path*',
        destination: `${backendHost}/api/:path*`,
      },
      {
        source: '/r/:slug',
        destination: `${backendHost}/r/:slug`,
      },
    ];
  },
};

export default nextConfig;
