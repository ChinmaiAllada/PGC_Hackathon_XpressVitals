// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
  
module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/no-positive-tabindex": "error",
      "@angular-eslint/template/click-events-have-key-events": "error",
      "@angular-eslint/template/mouse-events-have-key-events": "error",
      "@angular-eslint/template/no-autofocus": "error",
      "@angular-eslint/template/no-distracting-elements": "error",
      "@angular-eslint/template/alt-text": "error",
      "@angular-eslint/template/elements-content": "error",
      "@angular-eslint/template/label-for": "off",
      "@angular-eslint/template/table-scope": "error",
      "@angular-eslint/template/valid-aria": "error"
    },
  }
);
