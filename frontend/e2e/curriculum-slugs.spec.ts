import { test, expect } from '@playwright/test';

/**
 * E2E — slugs do curriculum (/aprenda/<slug>) renderizam sem 404.
 *
 * Previne regressão crítica: em maio/2026, /aprenda/o-que-e-cloud (e
 * 766+ outros slugs) retornavam 404 porque curriculum_articles tinha 0
 * rows no Postgres em prod — o importer nunca havia rodado.
 *
 * Estratégia:
 *  - Lista de slugs canônicos cobrindo diferentes hubs/trails.
 *  - Cada teste navega pra URL e valida:
 *      1. HTTP 200 (não 404)
 *      2. <h1> presente (conteúdo renderizou, não shell vazio)
 *      3. Texto "This page could not be found" NÃO aparece no DOM
 *
 * Em build E2E (com NEXT_PUBLIC_API_BASE_URL não definido), o fallback
 * em aprenda/[slug]/page.tsx mostra o metadata vindo do curriculum.ts
 * local — então o teste valida que o frontend nunca dá 404 mesmo sem
 * banco. Em prod, o backend deve responder os blocks reais.
 */

const CRITICAL_SLUGS = [
  // Hub IA — entry-level
  'o-que-e-ia',
  // Hub IA — LLM intro
  'o-que-e-llm',
  // Hub AWS — historicamente o que estava bugado em prod
  'o-que-e-cloud',
  // Hub AWS — shared responsibility (essencial pra CLF)
  'modelo-responsabilidade-compartilhada',
];

for (const slug of CRITICAL_SLUGS) {
  test(`/aprenda/${slug} renderiza sem 404`, async ({ page }) => {
    const response = await page.goto(`/aprenda/${slug}/`, {
      waitUntil: 'domcontentloaded',
    });

    expect(response, `request pra /aprenda/${slug}/ retornou null`).not.toBeNull();
    expect(
      response!.status(),
      `slug ${slug} retornou HTTP ${response!.status()} — espera 200`,
    ).toBe(200);

    const h1 = page.locator('h1').first();
    await expect(h1, `${slug}: sem <h1>`).toBeVisible({ timeout: 10_000 });

    const h1Text = (await h1.textContent())?.trim() ?? '';
    expect(h1Text.length, `${slug}: <h1> vazio`).toBeGreaterThan(0);

    const bodyText = (await page.locator('body').textContent()) ?? '';
    expect(
      bodyText,
      `${slug}: pagina renderizou como 404 (Next 'This page could not be found')`,
    ).not.toContain('This page could not be found');
  });
}
