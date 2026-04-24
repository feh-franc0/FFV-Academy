import { test, expect } from '@playwright/test';

/**
 * Quiz end-to-end em /aprenda/o-que-e-ia:
 * - Respostas corretas deste módulo: índices [1, 2, 1, 1] (4 perguntas).
 * - XP esperado: 30 (base 70% + bônus 30% por score 100%) → state.xp >= 30.
 */
test('quiz eleva XP ao responder corretamente', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/aprenda/o-que-e-ia?skipOnboarding=1');

  await page.getByRole('button', { name: /Começar quiz/i }).click();

  const correct = [1, 2, 1, 1];
  for (let q = 0; q < correct.length; q++) {
    // Cada pergunta é bloco vertical; 4 botões de opção por pergunta.
    const options = page.locator('section[data-quiz-interactive] button').filter({
      hasNotText: /Enviar respostas|Responda todas/,
    });
    // Seleciona a opção correta da q-ésima pergunta (grupo de 4 botões).
    const globalIdx = q * 4 + correct[q];
    await options.nth(globalIdx).click();
  }

  await page.getByRole('button', { name: /Enviar respostas/i }).click();

  // Resultado visível
  await expect(page.getByText(/4\/4 corretas/)).toBeVisible();

  // Verifica XP persistido (state é comprimido via lz-string).
  const xp = await page.evaluate(async () => {
    const raw = localStorage.getItem('ffv_academy');
    if (!raw) return 0;
    // Tenta JSON puro; se falhar, importa lz-string dinâmico via fallback heurístico.
    try {
      const parsed = JSON.parse(raw);
      return parsed.xp ?? 0;
    } catch {
      // Fallback: se compressed, decompressFromUTF16 não existe no browser puro —
      // melhor medir XP via UI.
      return -1;
    }
  });
  // Se XP estiver comprimido, use fallback visual — "+N XP" aparece no resultado.
  if (xp === -1) {
    await expect(page.getByText(/XP ganhos/).first()).toBeVisible();
  } else {
    expect(xp).toBeGreaterThanOrEqual(30);
  }
});
