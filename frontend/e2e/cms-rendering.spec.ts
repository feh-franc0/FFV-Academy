import { expect, test } from '@playwright/test';

/**
 * Testes E2E do pipeline CMS-driven.
 *
 * Valida que:
 *   1. Backend retorna metadata + blocks para cada slug
 *   2. Rota /aprenda/[slug] renderiza H1, hub, trail
 *   3. Banner sticky (hub/trail) está visível
 *   4. Pelo menos 1 bloco é renderizado (section, paragraph, callout, etc)
 *   5. Slug inexistente cai em 404
 *
 * Estes testes DEPENDEM do backend rodando em localhost:8080 com seeds
 * aplicados. No CI, o job de E2E pode pular se NEXT_PUBLIC_API_BASE_URL
 * não estiver configurado (degrade gracioso).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const BACKEND_AVAILABLE = !!process.env.NEXT_PUBLIC_API_BASE_URL || process.env.PLAYWRIGHT_FULL_CMS_TESTS === '1';

test.describe('CMS — Conteúdo do backend', () => {
  test.skip(!BACKEND_AVAILABLE, 'precisa NEXT_PUBLIC_API_BASE_URL configurado');

  test('módulo "o-que-e-ia" renderiza H1, hub, trail e blocos', async ({ page }) => {
    await page.goto('/aprenda/o-que-e-ia/?skipOnboarding=1');

    // H1 deve refletir o título do banco
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text!.toLowerCase()).toContain('inteligência');

    // Header com hub e trail (texto em uppercase via tailwind)
    // Hub "ia" sempre presente; trail é dinâmico (trail1, trail-X, etc).
    await expect(page.getByText(/\bia\b/i).first()).toBeVisible();

    // Pelo menos um bloco renderizado — caça por elementos típicos
    // (parágrafos, callouts, code blocks)
    const blockCount = await page.locator('p, h2, h3, pre, blockquote').count();
    expect(blockCount).toBeGreaterThan(2);
  });

  test('módulo "rag-fundamentos" renderiza', async ({ page }) => {
    await page.goto('/aprenda/rag-fundamentos/?skipOnboarding=1');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text!.toLowerCase()).toContain('rag');
  });

  test('slug inexistente cai em 404', async ({ page }) => {
    const res = await page.goto('/aprenda/este-slug-nao-existe-no-banco/?skipOnboarding=1');
    expect(res?.status()).toBe(404);
  });
});

test.describe('CMS — API health', () => {
  test.skip(!BACKEND_AVAILABLE, 'precisa backend rodando');

  test('GET /api/v1/curriculum/o-que-e-ia/blocks retorna 200 + blocks', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/curriculum/o-que-e-ia/blocks`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.slug).toBe('o-que-e-ia');
    expect(json.title).toBeTruthy();
    expect(Array.isArray(json.blocks)).toBe(true);
    expect(json.blocks.length).toBeGreaterThan(0);

    // Cada bloco tem type + position + data
    for (const block of json.blocks) {
      expect(block.id).toBeTruthy();
      expect(block.type).toBeTruthy();
      expect(typeof block.position).toBe('number');
      expect(block.data).toBeDefined();
    }
  });

  test('GET /api/v1/curriculum/nao-existe/blocks retorna 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/curriculum/nao-existe/blocks`);
    expect(res.status()).toBe(404);
  });

  test('GET /api/v1/curriculum retorna lista paginada', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/curriculum?limit=10`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.total).toBeGreaterThan(100); // sabemos que tem 764+
  });
});

test.describe('CMS — Amostra de 10 slugs aleatórios', () => {
  test.skip(!BACKEND_AVAILABLE, 'precisa backend rodando');

  test('todos respondem 200 e renderizam H1', async ({ page, request }) => {
    // Pega lista de slugs do backend
    const listRes = await request.get(`${API_BASE}/api/v1/curriculum?limit=100`);
    const listJson = await listRes.json();
    const slugs: string[] = (listJson.data ?? []).map((it: { slug: string }) => it.slug);

    // Amostra 10
    const sample = slugs.slice(0, 100).sort(() => Math.random() - 0.5).slice(0, 10);

    for (const slug of sample) {
      const res = await page.goto(`/aprenda/${slug}/?skipOnboarding=1`);
      expect(res?.status(), `slug ${slug}`).toBe(200);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1, `H1 em ${slug}`).toBeVisible({ timeout: 5_000 });
    }
  });
});
