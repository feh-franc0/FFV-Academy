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
  // In the e2e job in CI, exclude visual.spec.ts until baselines are committed:
  testIgnore: process.env.CI && !process.env.VISUAL_REGRESSION ? ['**/visual.spec.ts'] : [],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
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
  webServer: process.env.CI
    ? {
        command: 'npx serve out -l 3000 --single',
        url: 'http://localhost:3000',
        timeout: 120_000,
      }
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
