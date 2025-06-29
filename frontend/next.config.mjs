const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
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
