/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from Eden AI providers and other sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for Konva canvas issue in Next.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    // Ignore canvas module on server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }
    return config;
  },
}

module.exports = nextConfig

