/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // Enable SWC for better performance
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  // Disable experimental features for stability
  experimental: {
    esmExternals: false,
  },
  // Enable production source maps for better debugging
  productionBrowserSourceMaps: true,
  // Enable compression
  compress: true,
  // Disable static optimization for now to prevent build issues
  output: 'standalone',
  // Handle API routes properly
  async rewrites() {
    return [
      {
        source: '/api/experience/:path*',
        destination: '/api/experience/:path*',
      },
    ];
  },
  // Environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  // Image optimization
  images: {
    domains: ['localhost'], // Add your production domain here
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    if (!isServer) {
      // Fixes npm packages that depend on `node:` protocol
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        dgram: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
