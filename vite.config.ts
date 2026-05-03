import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      global: 'window',
      'global.Buffer': 'window.Buffer',
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        GEMINI_API_KEY: env.GEMINI_API_KEY,
      }),
      process: JSON.stringify({
        env: {
          NODE_ENV: mode,
          GEMINI_API_KEY: env.GEMINI_API_KEY,
        },
        browser: true,
        version: 'v16.0.0',
        nextTick: '(function(fn) { setTimeout(fn, 0); })',
      }),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@google/genai': path.resolve(__dirname, 'node_modules/@google/genai/dist/web/index.mjs'),
        util: 'util',
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
