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
    proxy: {
      '/api': { // Adjust this path to match your backend API route
        target: 'https://socialmedia-phuz.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  }
});