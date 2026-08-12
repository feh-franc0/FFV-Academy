import { describe, expect, it } from 'vitest';

import { CURRICULUM } from '@/lib/curriculum';
import { CURRICULO_LEVE, TOTAL_MODULOS } from '@/lib/curriculum/indice-leve';

/**
 * O índice leve é GERADO e COMMITADO — o mesmo arranjo do `content-manifest`, e
 * a mesma forma de apodrecer: quem edita uma trilha não tem por que lembrar de
 * rodar o gerador, e nada quebra quando esquece. O índice simplesmente passa a
 * descrever um currículo do passado.
 *
 * O sintoma seria pior que um número errado num painel: `useGameState` calcula
 * progresso e recomendações a partir dele. Índice velho significa progresso
 * percentual errado e recomendação de módulo que não existe mais.
 *
 * Se este teste falhar, o conserto é uma linha:
 *
 *     node scripts/gerar-indice-leve.mjs
 */

describe('índice leve do currículo', () => {
  it('tem as mesmas trilhas, na mesma ordem', () => {
    expect(CURRICULO_LEVE.map(t => t.id)).toEqual(CURRICULUM.map(t => t.id));
  });

  it('tem os mesmos módulos, na mesma ordem, em cada trilha', () => {
    const esperado = Object.fromEntries(CURRICULUM.map(t => [t.id, t.modules.map(m => m.slug)]));
    const atual = Object.fromEntries(CURRICULO_LEVE.map(t => [t.id, t.modules.map(m => m.slug)]));
    expect(atual).toEqual(esperado);
  });

  it('preserva os campos que o cálculo de progresso usa', () => {
    // Título, XP e tempo saem daqui para a tela de recomendação. Um valor
    // divergente aparece como "+50 XP" numa trilha que dá 70 — erro pequeno,
    // visível, e que corrói a confiança no número.
    const divergentes: string[] = [];
    for (const trilha of CURRICULUM) {
      const leve = CURRICULO_LEVE.find(t => t.id === trilha.id)!;
      if (leve.name !== trilha.name) divergentes.push(`${trilha.id}.name`);
      if (leve.color !== trilha.color) divergentes.push(`${trilha.id}.color`);
      for (const m of trilha.modules) {
        const lm = leve.modules.find(x => x.slug === m.slug)!;
        if (lm.title !== m.title) divergentes.push(`${m.slug}.title`);
        if (lm.xp !== m.xp) divergentes.push(`${m.slug}.xp`);
        if (lm.readTime !== m.readTime) divergentes.push(`${m.slug}.readTime`);
      }
    }
    expect(divergentes).toEqual([]);
  });

  it('o total bate com a soma real', () => {
    expect(TOTAL_MODULOS).toBe(CURRICULUM.reduce((a, t) => a + t.modules.length, 0));
  });
});
