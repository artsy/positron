const path = require("path")

module.exports = {
  parser: "@typescript-eslint/parser",

  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 6,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/ban-ts-ignore": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/member-delimiter-style": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-inferrable-types": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-var-requires": 0,
    "react/display-name": 0,
    "react/prop-types": 0,

    // FIXME: Investigate / reenable these rules. Disabled to introduce eslint
    // into codebase.
    "no-async-promise-executor": 0,
    "no-case-declarations": 0,
    "no-console": 0,
    "no-constant-condition": 0,
    "no-empty-pattern": 0,
    "no-extra-boolean-cast": 0,
    "no-fallthrough": 0,
    "no-inner-declarations": 0,
    "no-irregular-whitespace": 0,
    "no-prototype-builtins": 0,
    "no-undef": 0,
    "no-unreachable": 0,
    "no-useless-escape": 0,
    "prefer-const": 0,
    "prefer-rest-params": 0,
    "react/jsx-key": 0,
    "react/jsx-no-target-blank": 0,
    "react/no-direct-mutation-state": 0,
    "react/no-find-dom-node": 0,
    "react/no-unescaped-entities": 0,
    "react/react-in-jsx-scope": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-empty-interface": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
  },
  overrides: [
    {
      files: ["webpack/**/*"],
      rules: {
        "no-console": "off",
      },
    },
  ],
}
