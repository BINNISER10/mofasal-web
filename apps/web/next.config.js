/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.mufasal.com' },
      { protocol: 'https', hostname: 'mufasal.s3.**.amazonaws.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    optimizeCss: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mufasal/shared': require('path').resolve(__dirname, '../../packages/shared/src'),
      '@mufasal/ui': require('path').resolve(__dirname, '../../packages/ui/src'),
    };
    return config;
  },
};

module.exports = nextConfig;
