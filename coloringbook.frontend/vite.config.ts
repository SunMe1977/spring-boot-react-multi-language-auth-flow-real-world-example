import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Ensure all PWA related assets are included for precaching
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png',
        'robots.txt',
        // Add any other static assets that should be precached
      ],
      manifest: {
        name: 'AI SelfPub ColoringBook Studio',
        short_name: 'AI SelfPub ColoringBook Studio',
        description: 'AI SelfPub ColoringBook Studio - Easily create personalized coloring books with AI assistance.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/', // Recommended to use '/' for start_url
        icons: [
          {
            src: '/web-app-manifest-192x192.png', // Corrected icon path to match existing public assets
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/web-app-manifest-512x512.png', // Corrected icon path to match existing public assets
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      // Configure workbox to generate service worker
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Ensure the generated service worker is named service-worker.js
        // This will output to dist/service-worker.js
        swDest: 'dist/service-worker.js',
        // Allow all navigation routes to be handled by the service worker
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/.*/], // This will allow all routes
      },
      devOptions: {
        enabled: true, // Enable PWA in development for easier testing
      },
      // Configure the manifest filename to match what index.html expects
      manifestFilename: 'site.webmanifest',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@constants': path.resolve(__dirname, 'src/constants/index.ts'),
      '@home': path.resolve(__dirname, 'src/home'),
      '@util': path.resolve(__dirname, 'src/util'),
      '@user': path.resolve(__dirname, 'src/user'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      strict: false,
    },
  },
  base: '/',
});