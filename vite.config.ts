import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5169,
    host: true,
    strictPort: true
  },
  preview: {
    port: 5169,
    host: true,
    strictPort: true
  }
});
