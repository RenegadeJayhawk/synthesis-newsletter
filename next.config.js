/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // SWC minification is enabled by default in Next.js 15
  
  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable experimental features for better performance
  experimental: {
    scrollRestoration: true,
  },

  // Required in Next.js 16 when custom webpack config is present.
  // This keeps the app compatible with the default Turbopack runtime.
  turbopack: {},
  
  // Compress responses
  compress: true,
  
  // Security headers
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://*.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://via.placeholder.com",
      "font-src 'self' data:",
      "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Bundle analyzer for production optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        three: {
          name: 'three',
          test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
          chunks: 'all',
          priority: 30,
        },
        framer: {
          name: 'framer',
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          chunks: 'all',
          priority: 25,
        },
      };
    }
    
    return config;
  },
  
  // Removed 'output: export' to enable API routes for Vercel deployment
  // This allows serverless functions to work properly
  
  // Trailing slash configuration
  trailingSlash: false,
  
  // Power by header removal for security
  poweredByHeader: false,
};

module.exports = nextConfig;
