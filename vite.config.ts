import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to work in the code after build
    'process.env': {
      API_KEY: process.env.API_KEY
    }
  }
});