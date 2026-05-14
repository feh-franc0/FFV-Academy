import { test, expect } from '@playwright/test';

/**
 * Quiz end-to-end em /aprenda/o-que-e-ia:
 * - Respostas corretas deste módulo: índices [1, 2, 1, 1] (4 perguntas).
 * - XP esperado: 30 (base 70% + bônus 30% por score 100%) → state.xp >= 30.
 *
 * SKIPADO pós-migração CMS: a rota /aprenda/[slug] agora é dinâmica e
 * renderiza blocks do backend via BlockRenderer. A interatividade do quiz
 * (botão "Começar quiz", validação de respostas, contagem XP) vivia no
 * ModuleLayout legado e ainda não foi portada pro novo renderer.
 *
 * Plano: re-habilitar este teste quando QuizBlock for implementado no
 * BlockRenderer (Sprint CMS Editor v2). Slug "o-que-e-ia" tem block do
 * tipo `quiz` no banco — falta só o componente cliente que escuta.
 */
test.skip('quiz eleva XP ao responder corretamente', async ({ page }) => {
  await page.goto('/?skipOnboarding=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/aprenda/o-que-e-ia?skipOnboarding=1');

  await page.getByRole('button', { name: /Começar quiz/i }).click();

  const correct = [1, 2, 1, 1];
  // Localiza pelos grupos role=group (cada pergunta é um group com label) — robusto a
  // mudanças no número de botões auxiliares (ex: 💡 Dica) por pergunta.
  for (let q = 0; q < correct.length; q++) {
    const questionGroup = page.locator('section[data-quiz-interactive] [role="group"]').nth(q);
    // Filtra hints e outros botões auxiliares — só pega botões de opção.
    const optionButtons = questionGroup.locator('button').filter({
      hasNotText: /Dica|Enviar|Responda|💡/,
    });
    await optionButtons.nth(correct[q]).click();
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
