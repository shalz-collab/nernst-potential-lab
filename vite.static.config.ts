// Static build config for GitHub Pages deployment.
// Builds the app as a pure client-side SPA (no SSR/server functions).
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

const base = process.env.BASE_URL ?? "/";

export default defineConfig({
  base,
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.static.html",
    },
  },
});
