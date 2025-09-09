import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force cache busting
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  optimizeDeps: {
    force: true, // Force re-optimization
    esbuildOptions: {
      define: {
        global: 'globalThis', // polyfill for global
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
    // explicitly include problematic packages if needed
    // include: ['uniqid', 'some-other-package'],
  },
  build: {
    rollupOptions: {
      output: {
        // prevent Rollup from freezing objects (fixes "Cannot add property 0" error)
        freeze: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
