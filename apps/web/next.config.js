const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.booking\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'booking-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.agoda\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'agoda-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.skyscanner\.net\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'skyscanner-api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 2, // 2 hours for flight data
        },
      },
    },
    {
      urlPattern: /^http:\/\/free\.rome2rio\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'rome2rio-api-cache',
        expiration: {
          maxEntries: 24,
          maxAgeSeconds: 60 * 60 * 6, // 6 hours for transport data
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.uber\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'uber-api-cache',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 60 * 15, // 15 minutes for ride estimates
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.getyourguide\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'getyourguide-api-cache',
        expiration: {
          maxEntries: 48,
          maxAgeSeconds: 60 * 60 * 12, // 12 hours for activities
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.revolut\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'revolut-api-cache',
        expiration: {
          maxEntries: 8,
          maxAgeSeconds: 60 * 5, // 5 minutes for financial data
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.wise\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'wise-api-cache',
        expiration: {
          maxEntries: 8,
          maxAgeSeconds: 60 * 5, // 5 minutes for financial data
        },
      },
    },
    {
      urlPattern: /^https:\/\/xecdapi\.xe\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'xe-currency-cache',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 60 * 30, // 30 minutes for exchange rates
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: true,
  },
  images: {
    domains: [
      'images.booking.com',
      'pix6.agoda.net',
      'media.skyscanner.net',
      'content.r9cdn.net',
      'cache.graphicslib.viator.com',
      'cdn.getyourguide.com',
      'd1a3f4spazzrp4.cloudfront.net', // Uber car images
      'logos.rome2rio.com', // Transport provider logos
      'revolut.com',
      'wise.com',
      'xe.com',
      'images.unsplash.com', // Unsplash for travel photos
    ],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
}

module.exports = withPWA(nextConfig)
