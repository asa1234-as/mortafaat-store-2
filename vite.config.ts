import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isAdminBuild = mode === 'admin';
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    },
    build: {
      outDir: isAdminBuild ? 'dist-admin' : 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: isAdminBuild ? 'index.admin.html' : 'index.html'
      }
    }
  };
});
