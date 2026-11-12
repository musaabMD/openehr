import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import type { Plugin } from "vite";

// Dev-only stand-in for the Cloudflare Worker API so the connectivity chip works under `vite dev`.
const devApi = (): Plugin => ({
  name: "magic-dev-api",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith("/api/health")) {
        res.setHeader("content-type", "application/json");
        res.setHeader("cache-control", "no-store");
        res.end(JSON.stringify({ ok: true, app: "Magic EHR", version: "dev", time: new Date().toISOString(), syncConfigured: false, region: "local" }));
        return;
      }
      if (req.url?.startsWith("/api/sync")) { res.statusCode = 503; res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ error: "sync-not-configured" })); return; }
      next();
    });
  },
});

export default defineConfig({
  plugins: [
    devApi(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Magic EHR",
        short_name: "Magic EHR",
        description: "Free, open-source, offline-first electronic health record.",
        theme_color: "#17324D",
        background_color: "#F6F8FA",
        display: "standalone",
        start_url: "/app",
        scope: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/health/,
            handler: "NetworkOnly"
          }
        ]
      }
    })
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900
  },
  server: { port: 5173 }
});
