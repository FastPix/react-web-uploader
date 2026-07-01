import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  treeshake: false,
  external: ["react", "react-dom"],
  banner: { js: '"use client";' },
  onSuccess: "copyfiles -f src/styles/styles.css dist",
});