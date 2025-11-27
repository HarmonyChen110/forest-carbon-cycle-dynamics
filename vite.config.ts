import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Determine base path: use repo name for GitHub Pages, relative path for Electron/local
  const base = mode === 'production' && process.env.GITHUB_PAGES === 'true'
    ? '/forest-carbon-cycle-dynamics/'
    : './';

  return {
    base: base,
    server: {
      port: 5777,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
