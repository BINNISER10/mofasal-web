const path = require('path');
const os = require('os');
const fs = require('fs');

const isNetlify = process.env.NETLIFY === 'true';

function resolveZodPath(appDir, sharedRoot, rootModules) {
  const candidates = [
    path.join(appDir, 'node_modules/zod'),
    path.join(sharedRoot, 'node_modules/zod'),
    path.join(rootModules, 'zod'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? path.join(appDir, 'node_modules/zod');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone فقط في production (Docker/Render)
  ...(process.env.NODE_ENV === 'production' && !isNetlify ? { output: 'standalone' } : {}),
  distDir: '.next',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@mufasal/shared', '@mufasal/ui'],
  images: {
    unoptimized: true,
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
    if (dev) {
      config.cache = false;
      config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
    }
    const sharedRoot = path.resolve(__dirname, '../../packages/shared');
    const uiRoot = path.resolve(__dirname, '../../packages/ui/src');
    const rootModules = path.resolve(__dirname, '../../node_modules');
    const zodPath = resolveZodPath(__dirname, sharedRoot, rootModules);
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mufasal/shared$': path.join(sharedRoot, 'index.ts'),
      '@mufasal/shared': sharedRoot,
      '@mufasal/ui$': path.join(uiRoot, 'index.ts'),
      '@mufasal/ui': uiRoot,
      zod: zodPath,
    };
    config.resolve.extensions = ['.ts', '.tsx', ...config.resolve.extensions];
    return config;
  },
};

module.exports = nextConfig;
