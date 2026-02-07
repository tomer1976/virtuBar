import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze'
      ? visualizer({ filename: 'stats/bundle.html', gzipSize: true, brotliSize: true, open: false })
      : null,
  ].filter(Boolean),
  server: {
    port: 5173,
  },
}));
