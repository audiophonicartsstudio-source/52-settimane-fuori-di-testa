import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "admin-development-csp",
      apply: "serve",
      transformIndexHtml(html) {
        return html.replace(
          /<meta http-equiv="Content-Security-Policy"[^>]*>/,
          "",
        );
      },
    },
  ],
  base: process.env.BASE_PATH || "./",
  build: { rollupOptions: { input: ["index.html", "gestione.html"] } },
  test: { include: ["tests/**/*.test.ts"] },
});
