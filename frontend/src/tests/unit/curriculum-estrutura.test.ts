import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CURRICULUM, HUBS } from '@/lib/curriculum';

/**
 * Trava da divisão do currículo (ago/2026).
 *
 * O currículo era um arquivo de 4.093 linhas com tipos, 39 trilhas, hubs,
 * níveis, badges e consultas. Virou `src/lib/curriculum/`, com um arquivo por
 * trilha. Duas coisas passaram a poder quebrar em silêncio, e este arquivo
 * existe para as duas:
 *
 * 1. **Ordem.** A sequência das trilhas define o que a navegação e as páginas
 *    de hub mostram como "próxima". Antes ela era consequência da posição no
 *    arquivo; agora é uma lista de imports em `trails/index.ts` — fácil de
 *    reordenar sem perceber, e o efeito aparece só na tela do usuário.
 *
 * 2. **Trilha esquecida.** Criar `trails/trailX.ts` e não importá-lo produz uma
 *    trilha que existe no repositório e não existe no produto. Nada acusaria:
 *    o TypeScript compila, os testes de conteúdo não a veem, e ela some.
 */

const DIR_TRILHAS = join(process.cwd(), 'src', 'lib', 'curriculum', 'trails');

describe('estrutura do currículo dividido', () => {
  it('todo arquivo de trilha está montado no CURRICULUM', () => {
    const arquivos = readdirSync(DIR_TRILHAS)
      .filter(f => f.endsWith('.ts') && f !== 'index.ts')
      .map(f => f.replace(/\.ts$/, ''))
      .sort();

    const montadas = CURRICULUM.map(t => t.id).sort();

    // Arquivo sem import é trilha que existe no disco e não no produto.
    expect(arquivos, 'arquivo de trilha sem entrada em trails/index.ts').toEqual(montadas);
  });

  it('a ordem do CURRICULUM é a ordem dos imports, e não a alfabética', () => {
    const indice = readFileSync(join(DIR_TRILHAS, 'index.ts'), 'utf8');
    const ordemImports = [...indice.matchAll(/from '\.\/(trail[a-z0-9-]*)'/g)].map(m => m[1]);

    expect(ordemImports).toEqual(CURRICULUM.map(t => t.id));

    // Se um dia a lista virar alfabética, é sinal de que alguém "organizou" os
    // imports com uma ferramenta — e mudou a navegação sem saber.
    const alfabetica = [...ordemImports].sort();
    expect(
      ordemImports,
      'a ordem virou alfabética: confira se isso foi intencional, porque ela define ' +
      'a sequência de trilhas que o usuário vê',
    ).not.toEqual(alfabetica);
  });

  it('todo trailId citado por um hub existe no CURRICULUM', () => {
    const existentes = new Set(CURRICULUM.map(t => t.id));
    const fantasmas = HUBS.flatMap(h =>
      h.trailIds.filter(id => !existentes.has(id)).map(id => `${h.slug} → ${id}`),
    );
    // Hub apontando para trilha inexistente rende página de hub com buraco.
    expect(fantasmas).toEqual([]);
  });

  // Trilhas deliberadamente listadas em mais de um hub, com o motivo. A lista
  // existe para que a duplicação ACIDENTAL continue sendo pega — sem ela, o
  // teste teria de ser desligado por causa de um caso legítimo, e aí deixaria
  // de proteger os ilegítimos.
  // Vazia desde ago/2026: `trail-bedrock` era a única cruzada, e deixou de ser
  // quando `ia-aws` virou hub próprio. A trilha é o CENTRO daquele hub agora, e
  // não a ponte entre dois — repetir a ponte seria duplicar o centro.
  const CRUZADAS: Record<string, string> = {};

  it('toda trilha pertence a um hub, e as cruzadas são declaradas', () => {
    const contagem = new Map<string, number>();
    for (const h of HUBS) for (const id of h.trailIds) {
      contagem.set(id, (contagem.get(id) ?? 0) + 1);
    }

    // Órfã não aparece em navegação nenhuma — é conteúdo escrito e inalcançável.
    const orfas = CURRICULUM.filter(t => !contagem.has(t.id)).map(t => t.id);
    const duplicadas = [...contagem]
      .filter(([id, n]) => n > 1 && !(id in CRUZADAS))
      .map(([id]) => id);

    expect({ orfas, duplicadas }).toEqual({ orfas: [], duplicadas: [] });
  });

  it('trilha declarada como cruzada realmente está em mais de um hub', () => {
    // Sem esta checagem, a lista de exceções vira lixo: alguém remove a trilha
    // de um hub e a exceção fica lá, silenciosamente autorizando uma duplicação
    // futura que ninguém decidiu.
    const contagem = new Map<string, number>();
    for (const h of HUBS) for (const id of h.trailIds) {
      contagem.set(id, (contagem.get(id) ?? 0) + 1);
    }
    const desatualizadas = Object.keys(CRUZADAS).filter(id => (contagem.get(id) ?? 0) < 2);
    expect(desatualizadas, 'exceção que não corresponde mais à realidade').toEqual([]);
  });

  it('os totais globais não contam a trilha cruzada duas vezes', () => {
    // O risco real da listagem cruzada: um total somado por hub contaria os 31
    // módulos de Bedrock duas vezes. Os totais derivam de CURRICULUM, onde cada
    // trilha aparece uma única vez — este teste trava essa propriedade.
    const ids = CURRICULUM.map(t => t.id);
    expect(new Set(ids).size, 'CURRICULUM tem trilha repetida').toBe(ids.length);
  });

  it('nenhum arquivo de trilha ficou vazio ou sem a trilha exportada', () => {
    const vazios = readdirSync(DIR_TRILHAS)
      .filter(f => f.endsWith('.ts') && f !== 'index.ts')
      .filter(f => {
        const src = readFileSync(join(DIR_TRILHAS, f), 'utf8');
        return !/export const trilha_\w+: Trail =/.test(src);
      });
    expect(vazios).toEqual([]);
  });
});
