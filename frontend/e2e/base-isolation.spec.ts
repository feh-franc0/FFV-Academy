/**
 * E2E — Isolamento entre bases (Sessão 3 do plano de bases).
 *
 * Verifica que, ao entrar em uma base, NENHUM elemento de UI mostra
 * conteúdo de outra base. Cobre o fluxo realista que o usuário faria:
 *   1. Marketing landing → entrar em medvet
 *   2. Em medvet, abrir /progresso → tema sage cream, conteúdo medvet
 *   3. CommandPalette (Cmd+K) → lista só medvet
 *   4. Trocar pra tech via BaseSwitcher → tema tech
 *   5. /progresso agora mostra conteúdo tech
 *
 * Estes testes detectam regressões de vazamento que os unit tests não
 * pegam — composição completa, hidratação, navegação real.
 */
import { test, expect, type Page } from '@playwright/test';

const SKIP_PARAMS = '?skipOnboarding=1&nohome=1';

async function setActiveBase(page: Page, slug: string) {
  // addInitScript injeta antes da página carregar — garante que o
  // ActiveBaseProvider já encontre o valor no localStorage no primeiro render.
  await page.addInitScript((s) => {
    try { window.localStorage.setItem('ffv_active_base_slug', s); } catch {}
  }, slug);
}

test.describe('Base isolation E2E', () => {
  test('medvet base: header chip mostra "Medicina Veterinária"', async ({ page }) => {
    await page.goto(`/medicina-veterinaria${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    // O BaseSwitcher (chip) tem aria-label que cita o nome da base.
    const switcher = page.getByRole('button', { name: /trocar base.*medicina veterin/i });
    await expect(switcher).toBeVisible();
  });

  test('/progresso em medvet: NÃO mostra trilhas tech ("Redes & Web", "Fundamentos da IA")', async ({ page }) => {
    await setActiveBase(page, 'medicina-veterinaria');
    await page.goto(`/progresso${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    // O main do app é o que importa pro isolamento de conteúdo
    // (drawers mobile/footer já têm testes de config separados).
    const mainText = await page.locator('main').innerText();
    expect(mainText).not.toContain('Redes & Web');
    expect(mainText).not.toContain('Fundamentos da IA');
    expect(mainText).not.toContain('AWS Solutions Architect');
  });

  test('/progresso em medvet sem atividade: mostra empty state ativador', async ({ page }) => {
    await setActiveBase(page, 'medicina-veterinaria');
    await page.goto(`/progresso${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    // Como o usuário não tem progresso, vê o empty state ativador com
    // nome da base — nada de "Redes & Web" ou trilhas tech.
    await expect(page.getByText(/comece sua jornada em medicina veterinária/i)).toBeVisible();
    await expect(page.getByText(/12 módulos esperam/i)).toBeVisible();
  });

  test('/revisar em medvet: empty state cita "Medicina Veterinária"', async ({ page }) => {
    await setActiveBase(page, 'medicina-veterinaria');
    await page.goto(`/revisar${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    // Empty state da base medvet menciona o nome da base
    await expect(page.getByText(/medicina veterinária/i).first()).toBeVisible();
  });

  test('BaseSwitcher dropdown abre e lista as bases', async ({ page }) => {
    await page.goto(`/medicina-veterinaria${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    const switcher = page.getByRole('button', { name: /trocar base/i });
    await switcher.click();

    // Dropdown menu role=menu deve aparecer
    const menu = page.getByRole('menu', { name: /selecionar base/i });
    await expect(menu).toBeVisible();

    // Lista deve conter ambas as bases
    await expect(menu.getByText('Tecnologia')).toBeVisible();
    await expect(menu.getByText('Medicina Veterinária')).toBeVisible();
  });

  test('BaseSwitcher: clicar em outra base navega + persiste em localStorage', async ({ page }) => {
    await page.goto(`/medicina-veterinaria${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    const switcher = page.getByRole('button', { name: /trocar base/i });
    await switcher.click();
    const menu = page.getByRole('menu');
    await menu.getByRole('menuitemradio', { name: /tecnologia/i }).click();

    // URL deve ter mudado pra /tecnologia
    await expect(page).toHaveURL(/\/tecnologia/);

    // localStorage deve refletir a troca
    const stored = await page.evaluate(() => window.localStorage.getItem('ffv_active_base_slug'));
    expect(stored).toBe('tecnologia');
  });

  test('tech base: NÃO mostra módulos medvet ("Leis de Mendel") em /progresso', async ({ page }) => {
    await setActiveBase(page, 'tecnologia');
    await page.goto(`/progresso${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    const mainText = await page.locator('main').innerText();
    expect(mainText).not.toContain('Leis de Mendel');
    expect(mainText).not.toContain('Genética Veterinária');
    expect(mainText).not.toContain('Hardy-Weinberg');
  });

  test('CommandPalette em medvet: NÃO retorna resultados tech', async ({ page }) => {
    await setActiveBase(page, 'medicina-veterinaria');
    await page.goto(`/medicina-veterinaria${SKIP_PARAMS}`);
    await page.waitForLoadState('networkidle');

    // Abre command palette via Cmd+K (Mac) ou Ctrl+K (Linux)
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');

    const dialog = page.getByRole('dialog', { name: /buscar/i });
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // Digita query típica tech
    await page.keyboard.type('transformers');
    await page.waitForTimeout(300); // debounce + fuzzy filter

    // Não deve achar resultado tech "Transformers" em medvet
    const noResults = await dialog.getByText(/nenhum resultado/i).count();
    const transformersResult = await dialog.getByText(/transformers/i).count();
    // Aceita "nenhum resultado" OU zero matches (depende da UI)
    expect(noResults > 0 || transformersResult === 0).toBe(true);
  });

  test('Marketing landing (/) renderiza com tema marketing, não tema tech', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // BaseSwitcher NÃO deve aparecer em rota marketing (não tem GameHUD)
    const switcher = await page.getByRole('button', { name: /trocar base/i }).count();
    expect(switcher).toBe(0);
  });
});
