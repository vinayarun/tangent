import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from 'path';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@tangent/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@tangent/event-bus': path.resolve(__dirname, '../../packages/event-bus/src'),
      '@tangent/conversation-engine': path.resolve(__dirname, '../../packages/conversation-engine/src'),
      '@tangent/knowledge-graph': path.resolve(__dirname, '../../packages/knowledge-graph/src'),
      '@tangent/ai-context': path.resolve(__dirname, '../../packages/ai-context/src'),
      '@tangent/plugin-system': path.resolve(__dirname, '../../packages/plugin-system/src'),
      '@tangent/persistence': path.resolve(__dirname, '../../packages/persistence/src'),
    }
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
