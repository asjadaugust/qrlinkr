// Use rewrites only in development mode
// In production with Docker, we want to use runtime config exclusively
const shouldUseRewrites = process.env.NODE_ENV === 'development' && 
  (!process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL === '/api');

// For Docker environments, default to 'backend' service name
const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || 
  (process.env.NODE_ENV === 'production' ? 'http://backend:3001' : 'http://localhost:3001');

console.log('=== Next.js Configuration ===');
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('NEXT_PUBLIC_BACKEND_HOST:', process.env.NEXT_PUBLIC_BACKEND_HOST);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Should use rewrites:', shouldUseRewrites);
console.log('Backend host for proxy:', backendHost);
console.log('==============================');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  async rewrites() {
    // Use rewrites if we should proxy requests
    if (!shouldUseRewrites) {
      console.log('Next.js Config - Rewrites disabled, runtime config should handle API calls');
      return [];
    }

    // Enable rewrites for development or when NEXT_PUBLIC_BACKEND_HOST is set
    console.log('Next.js Config - Enabling rewrites to:', backendHost);
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
