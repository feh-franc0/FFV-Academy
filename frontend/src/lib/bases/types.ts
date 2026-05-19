// Tipos compartilhados pelas bases de conhecimento.
// Modelados pra que qualquer área (medvet, direito, design...) use o mesmo schema.

export type Section =
  | { kind: 'intro';    body: string }
  | { kind: 'concept';  title: string; body: string }
  | { kind: 'example';  title: string; body: string; metadata?: string }
  | { kind: 'formula';  title: string; formula: string; explanation: string }
  | { kind: 'table';    caption?: string; headers: string[]; rows: string[][] }
  | { kind: 'summary';  title?: string; bullets: string[] }
  | { kind: 'callout';  tone: 'info' | 'warning' | 'highlight' | 'note'; title?: string; body: string };

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;       // index in options
  explanation: string;
  /**
   * Dica opcional — texto que aponta o conceito/caminho sem entregar a resposta.
   * Usuário pode clicar pra ver antes de marcar; não é mostrada automaticamente.
   */
  hint?: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface Module {
  slug: string;
  num: number;
  icon: string;
  title: string;
  summary: string;
  estimatedMin: number;
  keyTerms: KeyTerm[];
  sections: Section[];
  quiz: QuizQuestion[];
}

export interface Trail {
  slug: string;
  title: string;
  description: string;
  icon: string;
  modules: Module[];
}

/**
 * Hub temático — agrupa módulos por área de afinidade dentro de uma base.
 * Aponta pra moduleSlugs em vez de embutir módulos (os módulos vivem na trilha).
 */
export interface Hub {
  slug: string;
  name: string;
  icon: string;
  description: string;
  /** Índice da cor no array `theme.hubColors` (0-3). */
  colorIndex: 0 | 1 | 2 | 3;
  moduleSlugs: string[];
}

export interface Base {
  slug: string;
  name: string;
  area: string;
  description: string;
  icon: string;
  attribution: string;
  trails: Trail[];
  /** Hubs temáticos — se omitido, BaseIndex mostra só a lista de trilhas. */
  hubs?: Hub[];
}
