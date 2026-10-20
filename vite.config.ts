/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from the custom domain root (see public/CNAME), so base stays '/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    environment: 'jsdom',
  },
});
