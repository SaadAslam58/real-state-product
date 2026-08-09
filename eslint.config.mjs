import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    rules: {
      // The `lib/data` boundary is the API contract. Screens must read through it,
      // never reach past it into fixtures — otherwise swapping in the real backend
      // stops being a one-file change and becomes a nine-screen rewrite.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lib/data/fixtures", "**/data/fixtures"],
              message:
                "Import from lib/data/* instead. fixtures.ts sits behind the data boundary and must not be read directly by UI code.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
