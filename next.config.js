/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Auto-configure environment
  env: {
    // Auto-detect or use smart defaults
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 
                         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002',
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        'better-sqlite3': false,
      };
    }
    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['recharts', 'd3', 'reactflow'],
  },
};

module.exports = nextConfig;
