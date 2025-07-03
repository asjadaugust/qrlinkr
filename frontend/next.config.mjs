/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['./shared/**/*'],
    },
  },
  output: 'standalone',
  // API proxy for development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
        {
          source: '/r/:path*',
          destination: 'http://localhost:3001/r/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
