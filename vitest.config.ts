import { defineConfig } from "vitest/config";
import fs from "node:fs";

export default defineConfig({
  test: {
    // your defaults are fine
  },
  plugins: [
    // Minimal inline loader: import .yml/.yaml returns string content
    {
      name: "yml-raw-loader",
      enforce: "pre",
      load(id: string) {
        if (id.endsWith(".yml") || id.endsWith(".yaml")) {
          const txt = fs.readFileSync(id, "utf8");
          return `export default ${JSON.stringify(txt)};`;
        }
        return null;
      },
    },
  ],
});
