import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // ブラウザを自動で開く
    strictPort: false, // ポートが使用中の場合は次のポートを試す
    fs: {
      // node_modules/tinymceへのアクセスを許可
      allow: ['..'],
    },
  },
  // ソースマップを有効化（デバッグ用）
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      // TinyMCEのリソースへのエイリアス
      tinymce: resolve(__dirname, 'node_modules/tinymce'),
    },
  },
});

