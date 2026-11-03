import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths so the built dist/ folder works from any host or subfolder.
  base: "./",
  server: {
    port: 5173,
    open: true
  }
});
