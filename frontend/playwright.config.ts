import { defineConfig, devices } from '@playwright/test';

/**
 * Config Playwright — E2E do FFV Academy frontend.
 *
 * - webServer reutiliza `npm run dev` se já rodando (evita stampede local).
 * - Apenas chromium pra manter CI/local rápidos.
 * - retain-on-failure pra forense quando flakier.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
