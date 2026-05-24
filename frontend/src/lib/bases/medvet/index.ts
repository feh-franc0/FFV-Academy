import type { Base, Trail } from '../types';
import {
  MOD_1_POPULACOES,
  MOD_2_MENDEL,
  MOD_3_ACAO_GENICA,
  MOD_4_ALELISMO_MULTIPLO,
} from './genetica-modules-1';
import {
  MOD_5_GENES_LETAIS,
  MOD_6_NAO_ALELOS,
  MOD_7_GATOS,
  MOD_8_MAMIFEROS,
} from './genetica-modules-2';
import {
  MOD_9_PADROES,
  MOD_10_HARDY,
  MOD_11_MELHORAMENTO,
  MOD_12_ENDOGAMIA,
} from './genetica-modules-3';
import {
  MOD_13_METODOS_SELECAO,
  MOD_14_REPETIBILIDADE_CPP,
  MOD_15_TESTE_PEDIGREE,
  MOD_16_TESTE_PROGENIE,
} from './metodos-selecao-modules';

export const GENETICA_TRAIL: Trail = {
  slug: 'genetica',
  title: 'Genética Veterinária',
  description:
    'A trilha completa de Genética e Melhoramento Animal. Do conceito básico de gene aos cálculos de progresso genético — 12 módulos sequenciais com exercícios.',
  icon: '🧬',
  modules: [
    MOD_1_POPULACOES,
    MOD_2_MENDEL,
    MOD_3_ACAO_GENICA,
    MOD_4_ALELISMO_MULTIPLO,
    MOD_5_GENES_LETAIS,
    MOD_6_NAO_ALELOS,
    MOD_7_GATOS,
    MOD_8_MAMIFEROS,
    MOD_9_PADROES,
    MOD_10_HARDY,
    MOD_11_MELHORAMENTO,
    MOD_12_ENDOGAMIA,
  ],
};

/**
 * Trilha de aprofundamento em melhoramento prático — métodos de seleção +
 * testes de avaliação genética. Conteúdo da Aula 13 da Profa. Rafaella Olivieri.
 *
 * Foco aplicado: como o melhorista DECIDE quais animais usar como pais,
 * combinando estatística (CPP/CPT, Pedigree, Progênie) com economia (Índice
 * de Seleção). Sequencial após a trilha Genética principal.
 */
export const METODOS_SELECAO_TRAIL: Trail = {
  slug: 'metodos-selecao-e-testes',
  title: 'Métodos de Seleção e Testes',
  description:
    'A engenharia do melhoramento animal: como escolher reprodutores combinando estatística e economia. 4 módulos com fórmulas trabalhadas e exercícios resolvidos passo-a-passo.',
  icon: '🎯',
  modules: [
    MOD_13_METODOS_SELECAO,
    MOD_14_REPETIBILIDADE_CPP,
    MOD_15_TESTE_PEDIGREE,
    MOD_16_TESTE_PROGENIE,
  ],
};

export const MEDVET_BASE: Base = {
  slug: 'medicina-veterinaria',
  name: 'Medicina Veterinária',
  area: 'Genética · Anatomia · Clínica · Farmacologia',
  description:
    'Base de conhecimento de Medicina Veterinária. Trilhas profundas com módulos sequenciais, exercícios e revisão — feitas no mesmo padrão da nossa base de Tecnologia.',
  icon: '🐾',
  attribution: 'Conteúdo da trilha Genética baseado nos materiais da Profa. Dra. Rafaella Olivieri (Zootecnista, Dra. em Ciência Animal).',
  trails: [GENETICA_TRAIL, METODOS_SELECAO_TRAIL],
  hubs: [
    {
      slug: 'fundamentos',
      name: 'Fundamentos',
      icon: '🧬',
      description: 'A base de toda a genética: vocabulário, leis de Mendel, ações entre alelos.',
      colorIndex: 0,
      moduleSlugs: ['genetica-de-populacoes', 'leis-de-mendel', 'acoes-genicas-entre-alelos', 'alelismo-multiplo'],
    },
    {
      slug: 'interacao',
      name: 'Interação Gênica',
      icon: '🧩',
      description: 'Quando genes letais e interações entre múltiplos genes complicam a herança.',
      colorIndex: 1,
      moduleSlugs: ['genes-letais', 'interacao-genica-entre-nao-alelos', 'interacao-genica-pelagem-gatos', 'cor-pelagem-mamiferos'],
    },
    {
      slug: 'herancas',
      name: 'Heranças e Populações',
      icon: '📊',
      description: 'Doenças hereditárias, padrões de herança e cálculos de Hardy-Weinberg.',
      colorIndex: 2,
      moduleSlugs: ['padroes-de-heranca', 'frequencia-genica-hardy-weinberg'],
    },
    {
      slug: 'melhoramento',
      name: 'Melhoramento Animal — Fundamentos',
      icon: '🐄',
      description: 'O "porquê" e o "como cruzar" do melhoramento: princípios, endogamia × exogamia, heterose.',
      colorIndex: 3,
      moduleSlugs: [
        'introducao-ao-melhoramento-genetico',
        'endogamia-x-exogamia',
      ],
    },
    {
      slug: 'avaliacao-selecao',
      name: 'Avaliação e Seleção Genética',
      icon: '📊',
      description: 'Os métodos práticos pra escolher reprodutores: Tandem/Níveis/Índice, CPP/CPT, Pedigree e Progênie. Com fórmulas trabalhadas.',
      colorIndex: 4,
      moduleSlugs: [
        'metodos-de-selecao-melhoramento',
        'repetibilidade-capacidade-provavel-producao',
        'teste-de-pedigree-avaliacao-genetica',
        'teste-de-progenie-avaliacao-genetica',
      ],
    },
  ],
};

// Helpers de lookup
export function getTrailBySlug(trailSlug: string): Trail | undefined {
  return MEDVET_BASE.trails.find(t => t.slug === trailSlug);
}

export function getModuleBySlug(moduleSlug: string): { trail: Trail; module: import('../types').Module } | undefined {
  for (const trail of MEDVET_BASE.trails) {
    const mod = trail.modules.find(m => m.slug === moduleSlug);
    if (mod) return { trail, module: mod };
  }
  return undefined;
}

export function getAllModuleSlugs(): string[] {
  return MEDVET_BASE.trails.flatMap(t => t.modules.map(m => m.slug));
}
