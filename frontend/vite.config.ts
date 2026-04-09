import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Replit 환경: REPL_ID가 있으면 Replit 특화 플러그인 사용
// 로컬(VS Code): 이 플러그인들은 설치되지 않아도 되며, 없으면 자동으로 스킵됩니다
const isReplit = !!process.env.REPL_ID;

const rawPort = process.env.PORT ?? "5173";
const port = Number(rawPort);
const basePath = process.env.BASE_PATH ?? "/";

const plugins: any[] = [react(), tailwindcss()];

if (isReplit) {
  try {
    const { default: runtimeErrorOverlay } = await import(
      "@replit/vite-plugin-runtime-error-modal"
    );
    plugins.push(runtimeErrorOverlay());
  } catch {}

  if (process.env.NODE_ENV !== "production") {
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      plugins.push(cartographer({ root: path.resolve(import.meta.dirname, "..") }));
    } catch {}
    try {
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");
      plugins.push(devBanner());
    } catch {}
  }
}

export default defineConfig({
  base: basePath,
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-router": ["wouter"],
          "vendor-query":  ["@tanstack/react-query"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
