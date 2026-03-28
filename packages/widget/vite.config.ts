import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["iife"],
      name: "ConversioWidget",
      fileName: () => "widget.js",
    },
    minify: "terser",
    target: "es2019",
    rollupOptions: {
      external: [],
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"] ?? "production"),
  },
});
