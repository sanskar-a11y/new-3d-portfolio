import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", ".agents/**"],
  },
  {
    extends: [...next],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);


