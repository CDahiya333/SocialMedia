import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  root: '.',  // Ensures Vite looks in the right place for index.html
  build: {
    outDir: 'dist', // Ensures build output goes to "dist"
  },
  server: {
    port:5000,
    proxy: {
      '/api': { // Adjust this path to match your backend API route
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
});