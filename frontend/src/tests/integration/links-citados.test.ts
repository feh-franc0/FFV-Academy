import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Fontes citadas na documentação — o que dá para verificar sem rede.
 *
 * ## O defeito real
 *
 * O catálogo de 100 soluções nasceu com **15 fontes apontando para página de
 * LISTAGEM ou de CATEGORIA**: o blog de aprendizado de máquina da AWS em vez do
 * post específico, a página de on-demand do re:Invent em vez da sessão. Todas
 * respondiam 200, e nenhuma sustentava a afirmação ao lado.
 *
 * **Link que resolve e não sustenta é pior que link morto**: ele dá aparência de
 * verificabilidade a algo que ninguém pode conferir.
 *
 * ## Divisão de trabalho entre este teste e o script
 *
 * `scripts/validar_links_externos.py` faz a verificação de REDE — sob demanda,
 * porque depende de terceiro estar de pé e de não ser bloqueado por agente. Gate
 * que falha porque um blog caiu hoje ensina o time a desligar gate.
 *
 * Este teste faz a verificação de FORMA, que é determinística e cabe no CI:
 * nenhuma URL de listagem sustentando caso individual sem o rótulo que admite
 * isso, nenhum placeholder, e a data da última verificação de rede registrada.
 */

const RAIZ = join(process.cwd(), '..');
const CATALOGO = join(RAIZ, 'docs', 'seo', 'CATALOGO_100_SOLUCOES_AWS_IA.md');

const catalogo = readFileSync(CATALOGO, 'utf8');

/** Só a seção de fontes numeradas — o corpo tem links de navegação interna. */
const secaoFontes = catalogo.slice(catalogo.lastIndexOf('\n## Fontes'));

interface Fonte {
  numero: number;
  /** Texto do link — usado para descrição. */
  texto: string;
  /** A LINHA inteira — é onde o rótulo de ressalva mora quando há prosa em volta. */
  linha: string;
  url: string;
}

function fontes(): Fonte[] {
  const achadas: Fonte[] = [];
  for (const m of secaoFontes.matchAll(/^(\d+)\.\s+(.*)$/gm)) {
    const numero = Number(m[1]);
    const linha = m[2];
    const link = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/.exec(linha);
    // Fonte sem link é legítima quando identificada por outro meio (ID de sessão),
    // e o teste de rótulo abaixo cobra que ela diga como ser encontrada.
    achadas.push({
      numero,
      texto: link ? link[1] : linha,
      linha,
      url: link ? link[2] : '',
    });
  }
  return achadas;
}

const FONTES = fontes();

/**
 * URL que não aponta para um documento específico: raiz de blog, categoria,
 * listagem. Usá-la para sustentar caso individual exige rótulo que admita isso.
 */
const GENERICA = [
  /\/blogs\/[a-z-]+\/?$/,
  /\/blogs\/[a-z-]+\/category\//,
  /\/on-demand\/?$/,
  /\/customers\/?$/,
  /\/case-studies\/?$/,
  /aws\.amazon\.com\/?$/,
];

/** Rótulos que admitem que a fonte é listagem ou de terceiro. */
const ADMITE = /listagem|categoria|p[áa]gina de casos|parceiro|sess[ãa]o re:Invent|identificad[ao] por ID/i;

describe('fontes do catálogo de 100 soluções', () => {
  it('a seção de fontes existe e tem uma entrada por citação usada', () => {
    expect(FONTES.length).toBeGreaterThanOrEqual(40);
    // Numeração contínua: fonte pulada é citação sem fonte.
    const numeros = FONTES.map(f => f.numero);
    expect(numeros).toEqual(numeros.map((_, i) => i + 1));
  });

  it('toda referência [n] no corpo tem fonte correspondente', () => {
    const corpo = catalogo.slice(0, catalogo.lastIndexOf('\n## Fontes'));
    const citados = new Set(
      [...corpo.matchAll(/\[(\d+)\]/g)].map(m => Number(m[1])),
    );
    const declarados = new Set(FONTES.map(f => f.numero));
    const orfaos = [...citados].filter(n => !declarados.has(n)).sort((a, b) => a - b);
    expect(orfaos, 'citação sem fonte na lista').toEqual([]);
  });

  it('URL de listagem só aparece com rótulo que admite ser listagem', () => {
    // Era o defeito: 15 fontes de página de categoria sustentando caso individual,
    // sem dizer isso em lugar nenhum.
    // A ressalva é buscada na LINHA inteira, não no texto do link: nas fontes de
    // sessão de re:Invent o aviso está na prosa em volta, e a primeira versão deste
    // teste só olhava o texto entre colchetes — acusando duas fontes corretas.
    const enganosas = FONTES.filter(f =>
      f.url && GENERICA.some(re => re.test(f.url)) && !ADMITE.test(f.linha),
    ).map(f => `[${f.numero}] ${f.url}`);
    expect(enganosas).toEqual([]);
  });

  it('nenhuma fonte é placeholder', () => {
    for (const f of FONTES) {
      expect(f.url, `fonte ${f.numero}`).not.toMatch(/example\.com|localhost|TODO|PREENCHER|#$/);
      expect(f.texto.length, `fonte ${f.numero} sem descrição`).toBeGreaterThan(12);
    }
  });

  it('toda URL é https', () => {
    // http em citação de fonte é convite a conteúdo alterado no caminho.
    const insegura = FONTES.filter(f => f.url.startsWith('http://')).map(f => f.url);
    expect(insegura).toEqual([]);
  });

  it('a data da última verificação de rede está registrada', () => {
    // Sem data, "os links foram verificados" é afirmação sem prazo de validade.
    expect(catalogo).toMatch(/validar_links_externos\.py/);
    expect(catalogo).toMatch(/[úu]ltima execu[çc][ãa]o:\s*\d{2}\/[a-z]{3}\/\d{4}/);
  });

  it('a contagem de origem no cabeçalho é a medida, não estimativa', () => {
    // O cabeçalho dizia "28 · 34 · 38" escrito de cabeça; a contagem real era
    // 21 · 32 · 47. O gerador conta — e o documento tem de refletir a contagem.
    const corpo = catalogo.slice(0, catalogo.lastIndexOf('\n## Fontes'));
    // Só LINHA DE SOLUÇÃO (começa com o número), senão a legenda de origem no topo
    // entra na conta — foi o que fez o teste acusar 103 na primeira execução.
    const linhas = [...corpo.matchAll(/^\|\s*(\d+)\s*\|.*\|\s*\*\*([CAP])\*\*[^|]*\|\s*$/gm)];
    const conta = (letra: string) => linhas.filter(m => m[2] === letra).length;
    const c = conta('C'), a = conta('A'), pp = conta('P');
    expect(c + a + pp, 'o catálogo deve ter exatamente 100 soluções').toBe(100);
    const cabecalho = /\*\*(\d+) C · (\d+) A · (\d+) P\*\*/.exec(catalogo);
    expect(cabecalho, 'cabeçalho sem a contagem por origem').not.toBeNull();
    expect([Number(cabecalho![1]), Number(cabecalho![2]), Number(cabecalho![3])]).toEqual([c, a, pp]);
  });
});
