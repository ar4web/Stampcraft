import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// base: "./" keeps asset paths relative so the build works on
// GitHub Pages, Vercel, or even opened straight from the file system.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  // Note: deliberately no `open: true` — it crashes with
  // "spawn xdg-open ENOENT" on headless servers, containers and some WSL setups.
  server: {
    port: 5173,
    host: true,
    allowedHosts: [".monkeycode-ai.live"],
  },
});
