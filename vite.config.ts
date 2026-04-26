// Uses @tanstack/react-start/config directly with the Vercel preset (Nitro-based SSR).
// Explicitly adding: tailwindcss, tsConfigPaths.
// Intentionally omitted (not needed for Vercel): @cloudflare/vite-plugin, componentTagger,
// sandbox detection, and Lovable dev-only tooling.
import { defineConfig } from "@tanstack/react-start/config";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "vercel",
  },
  vite: {
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
