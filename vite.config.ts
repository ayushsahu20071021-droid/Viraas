import path from "path";
import { tryOnDev } from "./scripts/try-on-dev";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { name: 'viraas-lean-catalog-delivery', enforce: 'pre', transform(code, id) {
      if (!/src\/data\/catalog\/(products|couples)\.json$/.test(id)) return;
      // Generation prompts and audit metadata stay in source; browsers need only storefront fields.
      const rows = JSON.parse(code).map(({ imagePrompt, metadata, generatedImageUrl, ...row }: Record<string, unknown>) => row);
      return { code: JSON.stringify(rows), map: null };
    } },
    tryOnDev(), react(), tailwindcss()
  ],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
