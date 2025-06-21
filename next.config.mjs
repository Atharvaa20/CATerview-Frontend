// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  productionBrowserSourceMaps: true,
  
  // Enable React 18 concurrent features
  react: {
    // Add the new JSX transform
    runtime: 'automatic',
  },

  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Configure images
  images: {
    domains: ['localhost'], // Add your production domain
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configure webpack
  webpack: (config, { isServer, dev }) => {
    // Add custom webpack configurations here
    
    // Important: return the modified config
    return config;
  },

  // Configure headers
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

  // Configure redirects
  async redirects() {
    return [
      // Add your redirects here
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Configure rewrites
  async rewrites() {
    return [
      // Add your rewrites here
    ];
  },

  // Configure environment variables
  env: {
    // Add environment variables that should be available on the server and client
    // NEXT_PUBLIC_* variables will be exposed to the browser
  },
};

export default nextConfig;
