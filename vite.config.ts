import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isAdminBuild = mode === 'admin';
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_PUBLIC_BUILD': JSON.stringify(!isAdminBuild)
    },
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: isAdminBuild ? 'dist-admin' : 'dist',
      emptyOutDir: true,
      rollupOptions: {
        // Give both builds a stable /index.html entry point. Without the
        // explicit key, Vite preserves index.admin.html in dist-admin and
        // the Worker root URL returns 404.
        input: {
          index: isAdminBuild ? 'index.admin.html' : 'index.html'
        }
      }
    }
  };
});
