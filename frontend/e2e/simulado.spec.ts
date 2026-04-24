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

    // Simula salto pra 11ª questão escrevendo attempt direto; o SimuladoRunner
    // navega por grid — mas o gate de acessibilidade é declarativo:
    // isQuestionAccessible(index) retorna false p/ index >= 10 sem pagamento.
    // Clicar no item 11 do grid abre o paywall.
    // Procura pelo botão que seleciona questão 11 — número visível no grid.
    const q11 = page.getByRole('button', { name: /^11$/ });
    if (await q11.count() > 0) {
      await q11.first().click();
    }

    // Paywall deve aparecer (PaywallCard contém texto sobre desbloquear).
    await expect(page.getByText(/Desbloquear|paywall|desbloqueie|10 questões/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
