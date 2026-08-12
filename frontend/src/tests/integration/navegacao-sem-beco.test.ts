import { describe, expect, it } from 'vitest';

import {
  CURRICULUM,
  getModuleNextSteps,
  getModulePrerequisites,
} from '@/lib/curriculum';
import { temConteudo } from '@/lib/content-availability';
import manifesto from '@/lib/content-manifest.json';

/**
 * Nenhum caminho de navegação pode terminar num 404.
 *
 * O currículo declara 415 módulos e 393 têm conteúdo escrito. Antes deste
 * filtro, `nextSuggested` e `prerequisites` apontavam para os declarados sem
 * distinção — 39 links levando a 404 na auditoria de jul/2026. O caso visível:
 * quem terminava `aif-bedrock-overview` (que funciona) clicava em "próximo" e
 * caía no vazio.
 *
 * Este teste é o que impede a regressão. Ele vale para sempre, não só para os
 * 22 slugs vazios de hoje: módulo declarado antes de ser escrito continua sendo
 * ignorado pela navegação em vez de virar beco.
 */

describe('navegação contextual não leva a 404', () => {
  const todosOsSlugs = CURRICULUM.flatMap(t => t.modules.map(m => m.slug));

  it('o manifesto cobre uma fração plausível do currículo', () => {
    expect(manifesto.slugs.length).toBeGreaterThan(300);
    expect(manifesto.slugs.length).toBeLessThanOrEqual(todosOsSlugs.length);
  });

  it('getModuleNextSteps nunca devolve módulo sem conteúdo', () => {
    const vazados: string[] = [];
    for (const slug of todosOsSlugs) {
      for (const passo of getModuleNextSteps(slug)) {
        if (!temConteudo(passo.module.slug)) {
          vazados.push(`${slug} → ${passo.module.slug}`);
        }
      }
    }
    expect(vazados).toEqual([]);
  });

  it('getModulePrerequisites nunca devolve módulo sem conteúdo', () => {
    const vazados: string[] = [];
    for (const slug of todosOsSlugs) {
      for (const pre of getModulePrerequisites(slug, [])) {
        if (!temConteudo(pre.module.slug)) {
          vazados.push(`${slug} ← ${pre.module.slug}`);
        }
      }
    }
    expect(vazados).toEqual([]);
  });

  it('o filtro de conteúdo distingue slug escrito de slug inexistente', () => {
    // Esta asserção antes exigia que EXISTISSEM módulos sem conteúdo, para provar
    // que havia o que filtrar. Em ago/2026 o débito foi zerado (AIF-C01 e
    // Anthropic AI Practitioner escritas) e ela passou a falhar por sucesso — o
    // que é um jeito ruim de um teste envelhecer: ele media a doença, não a cura.
    //
    // Agora verifica o que realmente importa e não depende de débito: que
    // `temConteudo` diz "não" para o que não existe e "sim" para o que existe.
    expect(temConteudo('slug-que-nunca-foi-escrito-xyz')).toBe(false);
    expect(temConteudo(todosOsSlugs[0])).toBe(true);
  });

  it('todo slug declarado no currículo tem conteúdo', () => {
    // O estado alcançado em ago/2026, agora protegido: nenhuma rota /aprenda
    // declarada responde 404. O gate equivalente no CI é
    // `check-curriculum-seed-drift.mjs --strict`.
    const semConteudo = todosOsSlugs.filter(s => !temConteudo(s));
    expect(semConteudo).toEqual([]);
  });

  it('as sugestões de próximo passo apontam só para módulos escritos', () => {
    const passos = getModuleNextSteps('aif-bedrock-overview');
    for (const p of passos) expect(temConteudo(p.module.slug)).toBe(true);
  });
});
