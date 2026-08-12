import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CURRICULUM } from '@/lib/curriculum';
import { SEO_DESCRIPTIONS, getSeoDescription } from '@/lib/seo-descriptions';

/**
 * As descrições de SEO saíram do curriculum.ts para um módulo `server-only`.
 *
 * Motivo: `curriculum.ts` é importado por 35 componentes de cliente, então os 415
 * `seoDesc` (38 KB de fonte, ~16 KB comprimidos — cerca de 19% do chunk do
 * currículo) eram baixados por todo visitante sem nenhum código de cliente lê-los.
 * São meta tags; só o `generateMetadata` no servidor precisa delas.
 *
 * Este teste garante as duas pontas: que a cobertura não caia, e que o campo não
 * volte para o currículo por hábito.
 */

describe('descrições de SEO', () => {
  const slugs = CURRICULUM.flatMap(t => t.modules.map(m => m.slug));

  it('todo módulo do currículo tem descrição de SEO', () => {
    const faltando = slugs.filter(s => !getSeoDescription(s));
    expect(faltando).toEqual([]);
  });

  it('não há descrição órfã (slug que saiu do currículo)', () => {
    const conhecidos = new Set(slugs);
    const orfas = Object.keys(SEO_DESCRIPTIONS).filter(s => !conhecidos.has(s));
    expect(orfas).toEqual([]);
  });

  it('toda descrição cabe na faixa que o Google mostra: 70 a 165 caracteres', () => {
    /**
     * O piso era 40, e por isso 77 descrições de 42 a 69 caracteres passavam —
     * medido em 05/ago/2026, mediana de 89. O Google mostra cerca de 155
     * caracteres: abaixo de 70 o resultado desperdiça a linha que ganha o clique,
     * acima de 165 ele corta no meio da frase. As 11 mais longas tinham 204 a 239
     * e eram truncadas todas.
     *
     * A faixa é o contrato; 70 não é número redondo escolhido por gosto, é onde
     * uma frase em português passa a caber com sujeito, verbo e o que se aprende.
     */
    const curtas = Object.entries(SEO_DESCRIPTIONS)
      .filter(([, d]) => d.trim().length < 70)
      .map(([s, d]) => `${s} (${d.trim().length})`);
    const longas = Object.entries(SEO_DESCRIPTIONS)
      .filter(([, d]) => d.trim().length > 165)
      .map(([s, d]) => `${s} (${d.trim().length})`);
    expect(curtas, 'descrição curta demais para o snippet').toEqual([]);
    expect(longas, 'descrição que o Google vai truncar').toEqual([]);
  });

  it('nenhuma descrição é lista de palavra-chave com selo de idioma no fim', () => {
    /**
     * A assinatura do gerador antigo: `Tópico: palavra, palavra, palavra — guia
     * PT-BR.` Não é frase, não diz o que o leitor vai saber depois de ler, e gasta
     * o fim do snippet — a parte que o Google mostra por último — num token que
     * ninguém busca. Eram 165 descrições assim.
     *
     * `em PT-BR` no MEIO da frase continua permitido: ali ele sinaliza idioma numa
     * página de resultado misturada, e lê como português de verdade.
     */
     const selo = Object.entries(SEO_DESCRIPTIONS)
      .filter(([, d]) => /\bPT-BR\b[\s\w]{0,14}\.?\s*$/.test(d.trim()))
      .map(([s]) => s);
    expect(
      selo,
      'termine a descrição com o que se aprende, não com "— guia PT-BR."',
    ).toEqual([]);
  });

  it('toda descrição é uma frase, não uma enumeração solta', () => {
    /**
     * Proxy estrutural, escolhido depois de medir: salada de palavra-chave em
     * Title Case quase não tem palavra funcional minúscula, enquanto frase em
     * português tem várias ("o que é", "por que", "quando usar"). Duas ou mais é o
     * limiar que separa os dois grupos no corpus real sem falso positivo.
     */
    const FUNCIONAIS = /\b(?:o|a|os|as|de|do|da|dos|das|em|no|na|que|com|para|por|é|são|e|um|uma|quando|como|sem|entre|ao|à)\b/gi;
    const enumeracoes = Object.entries(SEO_DESCRIPTIONS)
      .filter(([, d]) => (d.match(FUNCIONAIS) ?? []).length < 2)
      .map(([s, d]) => `${s}: ${d}`);
    expect(enumeracoes, 'escreva uma frase, não uma lista de termos').toEqual([]);
  });

  it('seoDesc NÃO voltou para o módulo de currículo', () => {
    // Passou a varrer o DIRETÓRIO: o currículo deixou de ser um arquivo único em
    // ago/2026 e virou `curriculum/` com um arquivo por trilha. Ler só o antigo
    // caminho faria o teste quebrar por ENOENT — e, pior, se alguém recriasse um
    // `curriculum.ts` vazio, ele voltaria a passar sem verificar nada.
    const raiz = join(process.cwd(), 'src', 'lib', 'curriculum');
    const arquivos: string[] = [];
    const andar = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const caminho = join(dir, e.name);
        if (e.isDirectory()) andar(caminho);
        else if (e.name.endsWith('.ts')) arquivos.push(caminho);
      }
    };
    andar(raiz);

    const vazando = arquivos.filter(f => readFileSync(f, 'utf8').includes('seoDesc'));
    expect(
      vazando,
      'seoDesc pertence a seo-descriptions.ts (só servidor) — dentro de curriculum/ ele viaja para o navegador',
    ).toEqual([]);
  });

  it('nenhuma descrição expõe identificador interno de trilha ou hub', () => {
    // A description dos artigos era gerada por máquina e dizia "na trilha trail1
    // do hub hub-ia" — ID interno aparecendo no snippet do Google.
    const vazando = Object.entries(SEO_DESCRIPTIONS)
      .filter(([, d]) => /\btrail\d+\b|\bhub-[a-z]+\b/.test(d))
      .map(([s]) => s);
    expect(vazando).toEqual([]);
  });
});
