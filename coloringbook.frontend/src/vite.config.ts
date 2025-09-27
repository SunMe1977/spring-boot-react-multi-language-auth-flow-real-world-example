import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Corrected: __dirname is project root, so './src' refers to 'src' folder
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@constants': path.resolve(__dirname, 'src/constants/index.ts'), // Explicitly point to index.ts
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