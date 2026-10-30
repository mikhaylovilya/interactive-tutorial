import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  // Relative base keeps the build portable: it can be served from any sub-path.
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: false
  }
});
