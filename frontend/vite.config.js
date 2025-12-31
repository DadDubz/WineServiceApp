// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    // ✅ Keep local HMR default (fixes the wss/443 websocket issues)
    // allowedHosts is optional for local; include if you use preview environments
    allowedHosts: "all",
  },
});
