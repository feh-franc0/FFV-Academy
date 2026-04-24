import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    // Exclude Playwright e2e — rodam com `npm run e2e`, não com vitest.
    exclude: ['**/node_modules/**', '**/e2e/**', '**/playwright-report/**', '**/test-results/**'],

    /**
     * Configuração de coverage via @vitest/coverage-v8.
     *
     * Thresholds em 65% — valor realista para o estado atual do projeto.
     * À medida que novos testes forem adicionados, aumentar gradualmente.
     * Meta de longo prazo: 80%+ em lines/functions.
     *
     * provider: 'v8' usa o coverage nativo do Node (mais rápido que istanbul).
     * reporter: ['text', 'html'] — texto no terminal + relatório HTML em coverage/.
     */
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      // Pasta de saída do relatório HTML
      reportsDirectory: './coverage',
      // Inclui apenas arquivos da src/ (exclui gerados, configs, testes)
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/tests/**',
        'src/**/*.d.ts',
        // Arquivos de config e tipos puros que não precisam de testes
        'src/app/**',
        'src/lib/tutor-responses.ts', // dados estáticos
        'src/lib/simulados-catalog.ts', // dados estáticos
        'src/data/**',
      ],
      thresholds: {
        // Thresholds realistas para o estado atual (abril/2026).
        // Aumentar conforme cobertura crescer: meta Q3 → 75%, Q4 → 80%.
        lines: 65,
        functions: 65,
        branches: 55,
        statements: 65,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
