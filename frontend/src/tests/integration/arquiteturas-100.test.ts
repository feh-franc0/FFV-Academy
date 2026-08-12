import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '@/lib/curriculum';
import { ArchDiagramSchema } from '@/components/article/blocks/schemas';

/**
 * As 100 arquiteturas: uma por solução do catálogo, e todas visíveis na página.
 *
 * ## Por que este teste existe
 *
 * O gerador (`scripts/seo/gerar_arquiteturas_100.py`) valida forma no momento da
 * geração. Isso protege contra o erro de quem gera — não contra o seed ser
 * editado à mão depois, contra o schema do bloco mudar, nem contra o catálogo
 * ganhar uma solução que ninguém desenhou.
 *
 * O que ele checa é o que dá para perder em silêncio:
 *
 * 1. **Cobertura**: as 100 soluções do catálogo têm diagrama. Solução sem desenho
 *    é débito invisível — o catálogo continua dizendo 100.
 * 2. **Validade pelo Zod real**: é o mesmo schema que o `BlockRenderer` usa. Um
 *    diagrama que o Zod recusa não aparece como diagrama quebrado; aparece como
 *    diagrama AUSENTE, sem erro no build.
 * 3. **Passos percorríveis**: 5 a 6, com nós e arestas que existem. Aresta de
 *    passo que não casa com aresta declarada acende o passo sem destacar nada.
 * 4. **Nenhum diagrama repetido**: o antipadrão registrado na skill é "diagrama
 *    igual em dois módulos" — se a topologia é a mesma, o módulo é o mesmo.
 */

const RAIZ = join(process.cwd(), '..');
const SEEDS = join(RAIZ, 'scripts', 'seeds', 'articles');
const CATALOGO = join(RAIZ, 'docs', 'seo', 'CATALOGO_100_SOLUCOES_AWS_IA.md');

const TRILHA = 'trail-arq-ia-aws';

interface Bloco { type: string; data: unknown; children?: Bloco[] }

function blocos(slug: string): Bloco[] {
  const doc = JSON.parse(readFileSync(join(SEEDS, `${slug}.json`), 'utf8'));
  const saida: Bloco[] = [];
  const andar = (bs: Bloco[]) => {
    for (const b of bs) {
      saida.push(b);
      if (b.children) andar(b.children);
    }
  };
  andar(doc.blocks);
  return saida;
}

const trilha = CURRICULUM.find(t => t.id === TRILHA);
const slugs = trilha?.modules.map(m => m.slug) ?? [];
const diagramas = slugs.flatMap(slug =>
  blocos(slug).filter(b => b.type === 'arch_diagram').map(b => ({ slug, data: b.data })),
);

describe('as 100 arquiteturas de IA na AWS', () => {
  it('a trilha existe com dez módulos', () => {
    expect(trilha, `trilha ${TRILHA} ausente do currículo`).toBeDefined();
    expect(slugs).toHaveLength(10);
  });

  it('são exatamente 100 diagramas, dez por módulo', () => {
    expect(diagramas).toHaveLength(100);
    for (const slug of slugs) {
      const n = diagramas.filter(d => d.slug === slug).length;
      expect(n, `${slug} tem ${n} diagramas`).toBe(10);
    }
  });

  it('toda solução do catálogo tem arquitetura desenhada', () => {
    // O catálogo é a fonte: se ele ganhar a solução 101, este teste cobra o desenho.
    const md = readFileSync(CATALOGO, 'utf8');
    const corpo = md.slice(0, md.lastIndexOf('\n## Fontes'));
    const numeros = [...corpo.matchAll(/^\|\s*(\d+)\s*\|.*\|\s*\*\*[CAP]\*\*[^|]*\|\s*$/gm)]
      .map(m => Number(m[1]));
    expect(new Set(numeros).size, 'o catálogo deve ter 100 soluções numeradas').toBe(100);

    // Cada seção de solução começa com "N. " no título — é o vínculo com o catálogo.
    const desenhadas = new Set<number>();
    for (const slug of slugs) {
      for (const b of blocos(slug)) {
        if (b.type !== 'section') continue;
        const t = (b.data as { title?: string }).title ?? '';
        const m = /^(\d+)\.\s/.exec(t);
        if (m) desenhadas.add(Number(m[1]));
      }
    }
    const faltando = numeros.filter(n => !desenhadas.has(n)).sort((a, b) => a - b);
    expect(faltando, 'solução do catálogo sem arquitetura desenhada').toEqual([]);
  });

  it('todo diagrama passa no schema que o renderizador usa', () => {
    // Zod recusando devolve null e o bloco NÃO renderiza — sem erro no build.
    const recusados: string[] = [];
    for (const d of diagramas) {
      const r = ArchDiagramSchema.safeParse(d.data);
      if (!r.success) {
        const titulo = (d.data as { title?: string }).title ?? '(sem título)';
        recusados.push(`${d.slug} → "${titulo}": ${r.error.issues[0]?.message}`);
      }
    }
    expect(recusados).toEqual([]);
  });

  it('todo diagrama tem legenda com a decisão e 5 a 6 passos', () => {
    const problemas: string[] = [];
    for (const d of diagramas) {
      const dd = d.data as {
        title?: string;
        caption?: string;
        steps?: { label: string; detail?: string }[];
      };
      const onde = `${d.slug} → "${dd.title ?? '?'}"`;
      // Legenda é onde a decisão mora; diagrama sem ela é figura.
      if (!dd.caption || dd.caption.length < 80) {
        problemas.push(`${onde}: legenda ausente ou curta demais para carregar uma decisão`);
      }
      const passos = dd.steps ?? [];
      if (passos.length < 5 || passos.length > 6) {
        problemas.push(`${onde}: ${passos.length} passos (o PADRAO_ENSINO.md exige 5 a 6)`);
      }
      for (const p of passos) {
        if (!p.detail || p.detail.length < 60) {
          problemas.push(`${onde}: passo "${p.label}" sem detalhe que explique por que existe`);
        }
      }
    }
    expect(problemas).toEqual([]);
  });

  it('todo nó explica o que decide e toda aresta diz o que trafega', () => {
    /**
     * O `note` do nó é onde mora "o que este serviço decide AQUI"; o `label` da
     * aresta é a LIGAÇÃO — o que passa por ela. Sem os dois, o diagrama mostra a
     * topologia e não explica o uso de cada peça: o nó vira um ícone com nome, e
     * a seta deixa o leitor supondo o que trafega.
     *
     * Era o caso de 93 nós (63 deles serviço AWS) e 320 arestas antes de a regra
     * existir. Zod aceita os dois como opcionais, e o render desenha bonito sem
     * eles — então só uma checagem explícita cobra.
     */
    const mudos: string[] = [];
    for (const d of diagramas) {
      const dd = d.data as {
        title?: string;
        groups: { nodes: { id: string; service: string; note?: string }[] }[];
        edges?: { from: string; to: string; label?: string }[];
      };
      for (const g of dd.groups) {
        for (const n of g.nodes) {
          if (!n.note?.trim()) {
            mudos.push(`${d.slug} "${dd.title}": nó ${n.id} (${n.service}) sem note`);
          }
        }
      }
      for (const e of dd.edges ?? []) {
        if (!e.label?.trim()) {
          mudos.push(`${d.slug} "${dd.title}": aresta ${e.from}>${e.to} sem label`);
        }
      }
    }
    expect(mudos).toEqual([]);
  });

  it('nós e arestas de cada passo existem no diagrama', () => {
    // Referência que não casa acende o passo sem destacar nada — em silêncio.
    const orfas: string[] = [];
    for (const d of diagramas) {
      const dd = d.data as {
        title?: string;
        groups: { nodes: { id: string }[] }[];
        edges?: { from: string; to: string }[];
        steps?: { label: string; nodes?: string[]; edges?: string[] }[];
      };
      const ids = new Set(dd.groups.flatMap(g => g.nodes.map(n => n.id)));
      const pares = new Set((dd.edges ?? []).map(e => `${e.from}>${e.to}`));
      for (const p of dd.steps ?? []) {
        for (const n of p.nodes ?? []) {
          if (!ids.has(n)) orfas.push(`${d.slug} → passo "${p.label}": nó ${n} inexistente`);
        }
        for (const e of p.edges ?? []) {
          if (!pares.has(e)) orfas.push(`${d.slug} → passo "${p.label}": aresta ${e} não declarada`);
        }
      }
    }
    expect(orfas).toEqual([]);
  });

  it('nenhum diagrama é igual a outro', () => {
    // Antipadrão registrado na skill: se a topologia é a mesma, o módulo é o mesmo.
    const vistos = new Map<string, string>();
    const repetidos: string[] = [];
    for (const d of diagramas) {
      const dd = d.data as {
        title?: string;
        groups: { nodes: { id: string; service: string }[] }[];
        edges?: { from: string; to: string }[];
      };
      const servicos = dd.groups.flatMap(g => g.nodes.map(n => n.service)).sort().join(',');
      const arestas = (dd.edges ?? []).map(e => `${e.from}>${e.to}`).sort().join(',');
      const chave = `${servicos}|${arestas}`;
      const antes = vistos.get(chave);
      if (antes) repetidos.push(`${d.slug} "${dd.title}" repete a topologia de ${antes}`);
      else vistos.set(chave, `${d.slug} "${dd.title}"`);
    }
    expect(repetidos).toEqual([]);
  });

  it('cada módulo declara a cadeia e a origem de cada solução', () => {
    // A origem rotulada é o que impede padrão composto passar por caso de cliente.
    for (const slug of slugs) {
      const kv = blocos(slug).filter(b => b.type === 'key_value');
      expect(kv, `${slug} sem os blocos de cadeia/origem`).toHaveLength(10);
      for (const b of kv) {
        const itens = (b.data as { items: { k: string; v: string }[] }).items;
        const chaves = itens.map(i => i.k);
        expect(chaves).toContain('Cadeia de serviços');
        expect(chaves).toContain('Origem da informação');
        const origem = itens.find(i => i.k === 'Origem da informação')!.v;
        expect(origem, `${slug}: origem vaga`).toMatch(
          /Caso público documentado|Arquitetura de referência publicada pela AWS|Padrão composto/,
        );
      }
    }
  });
});
