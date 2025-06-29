const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Always use rewrites when NEXT_PUBLIC_BACKEND_HOST is set
  async rewrites() {
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
  },
};

export default nextConfig;
