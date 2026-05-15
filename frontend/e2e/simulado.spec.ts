import { test, expect } from '@playwright/test';

/**
 * Simulado AWS Practitioner — modo gratuito tem 10 questões liberadas;
 * da 11ª em diante aparece PaywallCard.
 *
 * Prep: injeta UserProfile direto em localStorage pra pular o LoginModal
 * (já coberto em auth.spec). Economiza tempo de bootstrap.
 */
test.describe('simulado aws-practitioner', () => {
  test('questão 11 mostra paywall para usuário não pago', async ({ page }) => {
    await page.goto('/?skipOnboarding=1');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('ffv_user', JSON.stringify({
        name: 'Teste E2E',
        email: 'teste@ffv.dev',
        phone: '+5511987654321',
        createdAt: new Date().toISOString(),
        marketingConsent: false,
        paidProducts: [],
      }));
    });

    await page.goto('/simulados/aws-practitioner?skipOnboarding=1');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Inicia o simulado (requer login, já injetamos acima).
    const startBtn = page.getByRole('button', { name: /Começar|Fazer|Iniciar/i }).first();
    await startBtn.click();

    await page.waitForURL(/\/simulados\/aws-practitioner\/fazer/, { timeout: 15_000 });

    // Navega para a 11ª questão via grid de navegação (aria-label="Questão 11").
    // isQuestionAccessible(10, false) retorna false → SimuladoRunner exibe PaywallCard.
    const q11 = page.getByRole('button', { name: 'Questão 11' });
    await expect(q11).toBeVisible({ timeout: 10_000 });
    await q11.click();

    // PaywallCard contém "Você terminou as 10 questões grátis" e "Desbloqueie…"
    await expect(page.getByText(/Desbloqueie|10 questões grátis/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
