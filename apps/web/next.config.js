/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@mufasal/shared', '@mufasal/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.mufasal.com' },
      { protocol: 'https', hostname: 'mufasal.s3.**.amazonaws.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: { optimizeCss: false, externalDir: true },
  webpack: (config) => {
    const sharedRoot = path.resolve(__dirname, '../../packages/shared');
    const uiRoot = path.resolve(__dirname, '../../packages/ui/src');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mufasal/shared': sharedRoot,
      '@mufasal/ui': uiRoot,
      zod: path.resolve(__dirname, 'node_modules/zod'),
    };
    config.resolve.extensions = ['.ts', '.tsx', ...config.resolve.extensions];
    return config;
  },
};

module.exports = nextConfig;
