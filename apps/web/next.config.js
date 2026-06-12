const path = require('path');
const os = require('os');

const isNetlify = process.env.NETLIFY === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone للـ Docker/Render — Netlify يستخدم runtime الخاص به
  ...(isNetlify ? {} : { output: 'standalone' }),
  // على Google Drive محلياً: .next خارج المجلد؛ على Netlify: المسار الافتراضي
  distDir: isNetlify ? '.next' : path.join(os.tmpdir(), 'mufasal-web-next'),
  outputFileTracingRoot: path.join(__dirname, '../../'),
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
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
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: false,
    externalDir: true,
  },
  webpack: (config, { dev }) => {
    if (dev) config.cache = false;
    const sharedRoot = path.resolve(__dirname, '../../packages/shared');
    const uiRoot = path.resolve(__dirname, '../../packages/ui/src');
    const rootModules = path.resolve(__dirname, '../../node_modules');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mufasal/shared$': path.join(sharedRoot, 'index.ts'),
      '@mufasal/shared': sharedRoot,
      '@mufasal/ui$': path.join(uiRoot, 'index.ts'),
      '@mufasal/ui': uiRoot,
      zod: path.join(rootModules, 'zod'),
    };
    config.resolve.extensions = ['.ts', '.tsx', ...config.resolve.extensions];
    return config;
  },
};

module.exports = nextConfig;
