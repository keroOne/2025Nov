import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // ブラウザを自動で開く
    strictPort: false, // ポートが使用中の場合は次のポートを試す
  },
  // ソースマップを有効化（デバッグ用）
  build: {
    sourcemap: true,
  },
});

