import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // Relative asset paths so the built dist/ folder works from any host or subfolder.
  base: "./",
  server: {
    port: 5173,
    open: true
  },
  build: {
    // Two pages: the petitioner tool at / and the court triage queue at /court/
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        court: resolve(import.meta.dirname, "court/index.html")
      }
    }
  }
});
