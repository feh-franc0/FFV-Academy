import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '@/lib/curriculum';

/**
 * Cada página de trilha tem de abrir com texto DELA, vindo do dado.
 *
 * ## O defeito, achado rodando o site em 06/ago/2026
 *
 * `TrailBlogClient` tinha dois parágrafos escritos no código e escolhia entre
 * eles com `trail.id === 'trail1'`. As outras **39 trilhas** caíam no `else` e
 * mostravam todas o mesmo texto — "Para quem já sabe o básico… memória,
 * roteamento, ferramentas, agentes" —, que não descreve nenhuma delas, e menos
 * ainda as certificações AWS, o Postgres Internals ou o Go.
 *
 * Dois danos de uma vez: o leitor lia uma promessa que a trilha não cumpria, e 39
 * páginas de prioridade 0,9 no sitemap compartilhavam o primeiro parágrafo de
 * texto — conteúdo duplicado nas páginas que mais importam.
 *
 * Nenhum gate pegava, porque o texto era válido, estava presente e chegava à
 * tela. É a mesma família de defeito que o `arch_diagram` sem passo: forma
 * correta, substância errada.
 *
 * Ironia útil: o componente JÁ usava `trail.desc` para a descrição do `Course` em
 * JSON-LD. O rastreador recebia o texto certo; só o humano recebia o genérico.
 */

const COMP = join(process.cwd(), 'src', 'components', 'TrailBlogClient.tsx');

function semComentario(src: string): string {
  return src
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, ' ')  // comentário em JSX
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ');
}

/**
 * Literais de PROSA, por linha.
 *
 * A primeira versão deste teste usava `/'[^']{120,}'/` sobre o arquivo inteiro, e
 * `[^']` atravessa quebra de linha: o casamento ia do apóstrofo de um literal ao
 * de outro, dezenas de linhas depois, e acusou 18 "prosas" que não existiam. Por
 * linha, e exigindo espaços, separa prosa de nome de classe e de seletor.
 */
function prosaEmbutida(src: string): string[] {
  const achados: string[] = [];
  for (const linha of semComentario(src).split('\n')) {
    for (const m of linha.matchAll(/'([^'\n]{80,})'/g)) {
      const t = m[1];
      // Prosa tem pontuação de frase e vários espaços; classe CSS e estilo, não.
      if ((t.match(/ /g) ?? []).length >= 8 && /[.:,;]/.test(t)) achados.push(t.slice(0, 60) + '…');
    }
  }
  return achados;
}

describe('página de trilha abre com texto da própria trilha', () => {
  it('toda trilha tem `desc` própria e longa o bastante para ser parágrafo', () => {
    const rasas = CURRICULUM.filter(t => !t.desc || t.desc.trim().length < 70)
      .map(t => `${t.id} (${t.desc?.length ?? 0})`);
    expect(
      rasas,
      '`desc` é o parágrafo de abertura da página da trilha — precisa descrever a trilha',
    ).toEqual([]);
  });

  it('nenhuma `desc` de trilha é repetida', () => {
    // Duas trilhas com a mesma abertura reintroduz a duplicação por outro caminho.
    const vistas = new Map<string, string[]>();
    for (const t of CURRICULUM) {
      const k = t.desc.trim();
      vistas.set(k, [...(vistas.get(k) ?? []), t.id]);
    }
    const repetidas = [...vistas.entries()].filter(([, ids]) => ids.length > 1)
      .map(([k, ids]) => `${ids.join(' e ')}: "${k.slice(0, 60)}…"`);
    expect(repetidas).toEqual([]);
  });

  it('o componente renderiza trail.desc, e não prosa embutida', () => {
    const src = readFileSync(COMP, 'utf8');
    expect(semComentario(src), 'o parágrafo de abertura tem de vir de `trail.desc`').toMatch(/\{trail\.desc\}/);
    expect(
      prosaEmbutida(src),
      'texto de leitura pertence ao dado da trilha, não ao componente — foi assim que 39 trilhas ficaram com o mesmo parágrafo',
    ).toEqual([]);
  });

  it('nenhum componente de trilha ou hub embute prosa de leitura', () => {
    // Generaliza: o mesmo padrão em HubPageClient serviria 7 hubs com um texto.
    const dir = join(process.cwd(), 'src', 'components');
    const alvos = readdirSync(dir).filter(f => /^(TrailBlogClient|HubPageClient)\.tsx$/.test(f));
    expect(alvos.length, 'esperava achar os dois componentes').toBe(2);
    const achados = alvos.flatMap(f =>
      prosaEmbutida(readFileSync(join(dir, f), 'utf8')).map(p => `${f}: ${p}`),
    );
    expect(achados).toEqual([]);
  });

  it('o parágrafo de abertura não é escolhido por id de trilha', () => {
    /**
     * A assinatura exata do defeito: um ternário sobre `trail.id` cujos dois lados
     * são texto. Não proíbo QUALQUER `trail.id === '…'` no arquivo, porque existem
     * dois usos legítimos — os links "Ver também" de `trail1` e `trail2` —, e gate
     * que força mudança errada em caso legítimo é pior que gate ausente.
     *
     * Fica declarado: só 2 das 40 trilhas têm esse link no rodapé. É assimetria de
     * navegação, não conteúdo errado; generalizar exigiria trazer o currículo para
     * dentro deste componente `'use client'`, que é justamente o que a plataforma
     * evita (as descrições de SEO saíram do currículo por esse motivo).
     */
    const src = semComentario(readFileSync(COMP, 'utf8'));
    const ternario = /trail\.id\s*===?\s*['"][^'"]+['"]\s*\n?\s*\?\s*['"]/.test(src);
    expect(
      ternario,
      'texto escolhido por id deixa as outras 39 trilhas no `else` — leia de `trail.desc`',
    ).toBe(false);
  });
});
