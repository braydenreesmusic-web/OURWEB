import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components/ui': path.resolve(__dirname, './Components/ui'),
      '@/api': path.resolve(__dirname, './api'),
      '@': path.resolve(__dirname, './'),
    }
  }
});
