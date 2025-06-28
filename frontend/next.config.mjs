/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/r/:slug',
        destination: 'http://localhost:3001/r/:slug', // Proxy to Backend
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
