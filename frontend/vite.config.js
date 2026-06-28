import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        todo: resolve(__dirname, 'todo.html'),
        add: resolve(__dirname, 'add.html'),
        stats: resolve(__dirname, 'stats.html'),
        settings: resolve(__dirname, 'settings.html')
      },
    },
  },
});
