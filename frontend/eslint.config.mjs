import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ─── Regras customizadas ────────────────────────────────────────────────────
  {
    rules: {
      // Texto editorial em português usa apostrofes naturalmente (ex: "você's", "don't").
      // Escapar cada apóstrofe em JSX text degradaria legibilidade sem ganho de segurança
      // (JSX auto-escapa conteúdo de texto — não é vetor XSS). Desabilitado propositalmente.
      "react/no-unescaped-entities": "off",

      // Permite require() com aviso — código de app não deve usar require, mas testes podem.
      "@typescript-eslint/no-require-imports": "warn",

      // React Compiler (experimental) incluído pelo eslint-config-next gera falsos positivos
      // em código React corretamente escrito que não foi desenvolvido com o compilador em mente.
      // Desabilitados até adotar o React Compiler explicitamente no projeto.
      // Ref: https://react.dev/learn/react-compiler
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "react-hooks/refs": "off",
    },
  },

  // ─── Override para testes — regras mais permissivas ─────────────────────────
  // Testes usam require() para mocking de módulos CJS e variáveis não usadas
  // são comuns em fixtures de teste que documentam a estrutura esperada.
  {
    files: ["src/tests/**/*.ts", "src/tests/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  // ─── Ignores globais ────────────────────────────────────────────────────────
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
