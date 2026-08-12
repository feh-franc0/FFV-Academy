import { describe, expect, it } from 'vitest';

import { CURRICULUM } from '@/lib/curriculum';
import { temConteudo } from '@/lib/content-availability';
import { MODULOS_POR_TEMA } from '@/lib/curriculum/temas-mapa';
import {
  MINIMO_PARA_PAGINA,
  TEMAS,
  getTema,
  getTemaModules,
  getTemaStats,
  getTemasDoModulo,
} from '@/lib/curriculum/temas';

/**
 * Temas — a terceira classificação do currículo.
 *
 * ## O que este arquivo protege
 *
 * `temas-mapa.ts` é GERADO por `scripts/seo/gerar_corpus.py` a partir do texto de
 * cada módulo. Arquivo gerado tem duas formas de apodrecer em silêncio:
 *
 *  1. **Slug fantasma.** Módulo renomeado ou removido no currículo continua no
 *     mapa. A página do tema passa a listar menos módulos do que anuncia, ou
 *     linka para 404 — o mesmo defeito que o sitemap já teve com três rotas
 *     deletadas no pivot de jul/2026.
 *  2. **Mapa velho.** Trilha nova entra e ninguém regera. O tema fica com
 *     cobertura de mês passado, e nada quebra.
 *
 * A defesa é a mesma dos outros gates do repositório: o teste compara o gerado
 * com a fonte, e falha na hora em que divergem.
 */

const SLUGS_DO_CURRICULO = new Set(CURRICULUM.flatMap(t => t.modules).map(m => m.slug));
const IDS = new Set(TEMAS.map(t => t.id));

describe('definição dos temas', () => {
  it('id e slug são iguais em todos', () => {
    // Id que difere de slug é fonte de link quebrado: a rota usa um, o mapa usa
    // o outro, e a divergência só aparece em produção.
    for (const tema of TEMAS) {
      expect(tema.slug).toBe(tema.id);
    }
  });

  it('não há id duplicado', () => {
    expect(IDS.size).toBe(TEMAS.length);
  });

  it('todo tema tem nome, tagline e descrição substanciais', () => {
    for (const tema of TEMAS) {
      expect(tema.name.length).toBeGreaterThan(4);
      // A tagline vira a descrição de metadados. Curta demais não descreve nada,
      // longa demais é truncada pelo buscador.
      expect(tema.tagline.length).toBeGreaterThanOrEqual(40);
      expect(tema.tagline.length).toBeLessThanOrEqual(160);
      expect(tema.desc.length).toBeGreaterThanOrEqual(200);
    }
  });

  it('nenhuma tagline ou descrição vaza identificador interno', () => {
    // Era o defeito real da auditoria de ago/2026: descrição montada por máquina
    // exibindo `trail1` e `hub-ia` nas 415 páginas de módulo.
    for (const tema of TEMAS) {
      const texto = `${tema.tagline} ${tema.desc}`;
      expect(texto).not.toMatch(/\btrail\d/);
      expect(texto).not.toMatch(/\bhub-[a-z]/);
    }
  });

  it('getTema resolve por slug e devolve undefined para desconhecido', () => {
    expect(getTema('agentes')?.name).toBe('Agentes e orquestração');
    expect(getTema('nao-existe')).toBeUndefined();
  });
});

describe('mapa gerado × currículo', () => {
  it('toda chave do mapa é um tema declarado', () => {
    for (const chave of Object.keys(MODULOS_POR_TEMA)) {
      expect(IDS, `tema desconhecido no mapa: ${chave}`).toContain(chave);
    }
  });

  it('todo tema declarado existe no mapa', () => {
    // Tema sem entrada no mapa significa gerador que não conhece o tema — ou
    // `temas.ts` editado à mão sem regerar.
    for (const tema of TEMAS) {
      expect(MODULOS_POR_TEMA, `tema ausente no mapa: ${tema.id}`).toHaveProperty(tema.id);
    }
  });

  it('todo slug do mapa existe no currículo', () => {
    const fantasmas: string[] = [];
    for (const [tema, slugs] of Object.entries(MODULOS_POR_TEMA)) {
      for (const slug of slugs) {
        if (!SLUGS_DO_CURRICULO.has(slug)) fantasmas.push(`${tema}/${slug}`);
      }
    }
    expect(fantasmas, 'slugs no mapa que não existem no currículo — regere o mapa').toEqual([]);
  });

  it('não há slug repetido dentro de um tema', () => {
    for (const [tema, slugs] of Object.entries(MODULOS_POR_TEMA)) {
      expect(new Set(slugs).size, `slug repetido em ${tema}`).toBe(slugs.length);
    }
  });

  it('todo módulo com conteúdo tem pelo menos um tema', () => {
    // Módulo sem tema é módulo invisível para a navegação por assunto — e o
    // classificador tem fallback justamente para que isso não aconteça.
    const orfaos = CURRICULUM.flatMap(t => t.modules)
      .filter(m => temConteudo(m.slug))
      .filter(m => getTemasDoModulo(m.slug).length === 0)
      .map(m => m.slug);
    expect(orfaos).toEqual([]);
  });
});

describe('consultas', () => {
  it('getTemaModules devolve só módulo com conteúdo escrito', () => {
    for (const tema of TEMAS) {
      for (const { modulo } of getTemaModules(tema.id)) {
        expect(temConteudo(modulo.slug), `${modulo.slug} sem conteúdo em ${tema.id}`).toBe(true);
      }
    }
  });

  it('getTemaModules preserva a ordem do currículo', () => {
    const ordem = CURRICULUM.flatMap(t => t.modules).map(m => m.slug);
    const itens = getTemaModules('agentes').map(i => i.modulo.slug);
    const posicoes = itens.map(s => ordem.indexOf(s));
    expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b));
  });

  it('getTemaStats soma tempo e XP dos módulos do tema', () => {
    const itens = getTemaModules('rag-retrieval');
    const stats = getTemaStats('rag-retrieval');
    expect(stats.modules).toBe(itens.length);
    expect(stats.minutes).toBe(itens.reduce((a, i) => a + i.modulo.readTime, 0));
    expect(stats.xp).toBe(itens.reduce((a, i) => a + i.modulo.xp, 0));
    expect(stats.trails).toBeLessThanOrEqual(itens.length);
  });

  it('os dois temas sem ensino seguem abaixo do limiar', () => {
    // Conformidade tinha 5 módulos e ficou com 3 depois de remover falso
    // positivo de "compliance" — está no limiar, publicável e raso. Estes dois
    // não chegam lá.
    //
    // Registra o estado medido em ago/2026 e o que se espera dele: quando alguém
    // escrever a trilha de GEO/AEO, este teste falha e a linha sai. Falhar ao
    // GANHAR cobertura é o comportamento certo — obriga a atualizar o plano em
    // `PESQUISA_DEMANDA_BUSCA_2026-08.md` junto com o conteúdo.
    expect(getTemaStats('busca-ia-geo').modules).toBeLessThan(MINIMO_PARA_PAGINA);
    expect(getTemaStats('carreira').modules).toBeLessThan(MINIMO_PARA_PAGINA);
  });

  it('a maioria dos temas está publicável', () => {
    const publicaveis = TEMAS.filter(t => getTemaStats(t.id).modules >= MINIMO_PARA_PAGINA);
    expect(publicaveis.length).toBeGreaterThanOrEqual(TEMAS.length - 3);
  });
});
