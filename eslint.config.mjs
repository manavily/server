import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error"
    }
  },
  { languageOptions: { globals: globals.node } },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
