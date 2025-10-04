// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  // ESM-only build (matches your package.json "type": "module")
  format: ["esm"],
  clean: true,
  sourcemap: true,
  target: "es2020",
  // Force-bundle Ajv (and its helper) so its JSON refs are inlined
  noExternal: ["ajv", "ajv-formats"],
  // Make sure both YAML and JSON get bundled correctly
  loader: {
    ".yml": "text",
    ".yaml": "text",
    ".json": "json",
  },
});
