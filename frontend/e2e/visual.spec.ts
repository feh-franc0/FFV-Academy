// Run `npx playwright test e2e/visual.spec.ts --update-snapshots` once to generate baselines.
// After that, CI will compare against those snapshots.

import { test, expect } from '@playwright/test';

// Baseline snapshots — run once with --update-snapshots to generate
test.describe('Visual regression', () => {
  test('home page hero renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('section').first()).toHaveScreenshot('home-hero.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('ranking page podium renders correctly', async ({ page }) => {
    await page.goto('/ranking');
    await page.waitForLoadState('networkidle');
    // Wait for leaderboard to load (it fetches async)
    await page.waitForSelector('[data-testid="podium"]', { timeout: 10000 }).catch(() => {});
    await expect(page.locator('main')).toHaveScreenshot('ranking-main.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('/aprenda page renders correctly', async ({ page }) => {
    // Use a stable, simple module
    await page.goto('/aprenda/o-que-e-ia');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('article, main').first()).toHaveScreenshot('aprenda-article.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
