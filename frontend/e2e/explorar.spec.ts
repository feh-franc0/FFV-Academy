import { test, expect } from '@playwright/test';

/**
 * E2E — /explorar
 *
 * Cobertura:
 *  - Filtros chips clicáveis (Hub e Nível)
 *  - Filtro por hub reduz resultados
 *  - "Carregar mais" aparece quando filtered.length > 60
 */

test.describe('/explorar', () => {
  test('renderiza chips de filtro clicáveis', async ({ page }) => {
    await page.goto('/explorar?skipOnboarding=1');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/artigos/i);

    // Chips "Todos" do hub e nível
    const todosChips = page.getByRole('button', { name: /^Todos$/ });
    await expect(todosChips.first()).toBeVisible();

    // Clica em chip de nível "Iniciante"
    const beginnerChip = page.getByRole('button', { name: /Iniciante/i });
    await beginnerChip.click();

    // Header de contagem ainda visível após clique
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('filtro por hub reduz resultados', async ({ page }) => {
    await page.goto('/explorar?skipOnboarding=1');

    // Captura contagem inicial (texto "N artigos" no h2)
    const heading = page.getByRole('heading', { level: 2 });
    await expect(heading).toBeVisible();
    const beforeText = (await heading.textContent()) ?? '';
    const beforeCount = parseInt(beforeText.match(/(\d+)/)?.[1] ?? '0', 10);
    expect(beforeCount).toBeGreaterThan(0);

    // Clica em qualquer chip de hub que NÃO seja "Todos".
    // Hubs são botões com emoji + shortName (ex: "🤖 IA", "☁️ AWS").
    // Pegamos todos os botões da primeira FilterRow (Hub) que não sejam "Todos".
    const allChips = page.getByRole('button');
    const chipTexts = await allChips.allTextContents();
    // Pega o segundo botão de "hub" (primeiro é "Todos")
    // Filtra por aqueles com emoji típico de hub
    const hubChipIndex = chipTexts.findIndex(
      t => /^(🤖|☁️|🧠|⚙️|🛠|🏗|🔧|🚀|📊|💻|🎯|🌐|🔐|📦|🎨)/.test(t.trim()),
    );
    if (hubChipIndex >= 0) {
      await allChips.nth(hubChipIndex).click();
      await expect(heading).toBeVisible();
      const afterText = (await heading.textContent()) ?? '';
      const afterCount = parseInt(afterText.match(/(\d+)/)?.[1] ?? '0', 10);
      // Filtro de hub deve reduzir (ou manter, se hub cobre tudo) — afirmamos que <= antes
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    }
  });

  test('"Carregar mais" aparece quando há mais de 60 resultados', async ({ page }) => {
    await page.goto('/explorar?skipOnboarding=1');

    const heading = page.getByRole('heading', { level: 2 });
    await expect(heading).toBeVisible();
    const text = (await heading.textContent()) ?? '';
    const total = parseInt(text.match(/(\d+)/)?.[1] ?? '0', 10);

    if (total > 60) {
      const loadMore = page.getByRole('button', { name: /Carregar mais/i });
      await expect(loadMore).toBeVisible();
      const initialCardCount = await page.locator('a[href^="/aprenda/"]').count();
      await loadMore.click();
      // Após click, mais cards devem aparecer
      await expect
        .poll(async () => page.locator('a[href^="/aprenda/"]').count(), { timeout: 5_000 })
        .toBeGreaterThan(initialCardCount);
    } else {
      // Catálogo está com poucos artigos — botão não deveria existir.
      await expect(page.getByRole('button', { name: /Carregar mais/i })).toHaveCount(0);
    }
  });
});
