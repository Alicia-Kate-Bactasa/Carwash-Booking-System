/**
 * Vite configuration for Montage Auto Studio.
 * Handles Vue plugin registration, path aliases (@ -> ./src), dev server port, and API proxies.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  // Vue Single File Component plugin
  plugins: [vue()],

  // Path alias configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Development server configuration and API proxy rules
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});


