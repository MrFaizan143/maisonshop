import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  environments: {
    ssr: {
      resolve: {
        noExternal: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("@radix-ui")) return "ui";
          if (id.includes("react-dom")) return "react-dom";
          if (id.includes("/react/")) return "react";
        },
      },
    },
  },
});
