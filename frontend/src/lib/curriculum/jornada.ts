import { CURRICULUM } from './trails';
import type { Trail } from './types';

/**
 * A jornada de ponta a ponta — a espinha que faltava.
 *
 * ## O defeito que este arquivo corrige
 *
 * Medido em 09/ago/2026: **31 das 38 trilhas terminavam em beco sem saída** —
 * o último módulo não apontava para nada fora da própria trilha. O currículo
 * tinha 38 cursos soltos e nenhum CAMINHO, embora o objetivo declarado da
 * plataforma seja exatamente um percurso: AWS do básico ao avançado, depois IA
 * do básico ao avançado, depois a união dos dois em solução real.
 *
 * O prejuízo era duplo. Pedagógico: quem termina uma trilha não sabe o que vem
 * depois, e a decisão de continuar vira pesquisa em vez de sugestão. E de busca:
 * link interno é o sinal mais forte que o site controla sobre a própria
 * estrutura, e página que não recebe nem emite link é página que o rastreador
 * trata como folha isolada.
 *
 * ## Por que a jornada é DADO e não uma página escrita à mão
 *
 * Porque ela precisa alimentar quatro coisas ao mesmo tempo, sem divergir entre
 * elas: o `nextSuggested` do último módulo de cada trilha, a página `/jornada`,
 * o JSON-LD com `coursePrerequisites`, e o texto de navegação. Escrever a ordem
 * em quatro lugares é como o currículo já divergiu antes — ver o histórico de
 * contagens defasadas em `numeros-publicos.test.ts`.
 *
 * `jornada-ligacao.test.ts` cobra a consistência: toda trilha citada existe,
 * nenhuma aparece duas vezes, e o `nextSuggested` do último módulo de cada
 * trilha aponta para o primeiro módulo da trilha seguinte.
 */

export interface EtapaJornada {
  id: string;
  numero: number;
  titulo: string;
  /** A pergunta que o aluno tem quando chega nesta etapa. */
  pergunta: string;
  /** O que ele consegue fazer ao sair dela — resultado, não conteúdo. */
  resultado: string;
  icone: string;
  cor: string;
  /** A sequência principal, em ordem. É ela que gera a cadeia de `nextSuggested`. */
  trilhas: string[];
  /** Aprofundamentos que não bloqueiam o avanço para a etapa seguinte. */
  opcionais: string[];
}

export const JORNADA: EtapaJornada[] = [
  {
    id: 'base',
    numero: 0,
    titulo: 'Base técnica',
    pergunta: 'Eu tenho o chão para construir na nuvem?',
    resultado:
      'Você lê um erro de rede, escreve o SQL que a consulta precisa e navega um servidor pelo terminal sem depender de tutorial.',
    icone: '🧱',
    cor: '#8b949e',
    trilhas: ['trail12', 'trail16', 'trail14', 'trail36'],
    opcionais: ['trail19', 'trail47'],
  },
  {
    id: 'aws',
    numero: 1,
    titulo: 'AWS do básico ao avançado',
    pergunta: 'Eu consigo desenhar e operar uma arquitetura de verdade na AWS?',
    resultado:
      'Você constrói do primeiro deploy à arquitetura multirregional, em Terraform, e sustenta cada decisão com segurança, custo, escala e revisão Well-Architected.',
    icone: '☁️',
    cor: '#f78166',
    trilhas: ['trail4', 'trail-labs-aws', 'trail5', 'trail23', 'trail27'],
    opcionais: [],
  },
  {
    id: 'ia',
    numero: 2,
    titulo: 'IA do básico ao avançado',
    pergunta: 'Eu entendo o que acontece por dentro de um modelo?',
    resultado:
      'Você explica por que um LLM alucina, desenha um RAG que não depende de sorte, mede qualidade com eval em vez de opinião e sabe quando fine-tuning é a resposta errada.',
    icone: '🧠',
    cor: '#58a6ff',
    trilhas: ['trail1', 'trail2', 'trail9', 'trail26', 'trail25', 'trail30'],
    opcionais: [
      'trail3',
      'trail29',
      'trail50',
      'trail55',
      'trail-ai-rlhf-agents',
      'trail-diffusion-multimodal',
      'trail-local-llms-edge',
    ],
  },
  {
    id: 'uniao',
    numero: 3,
    titulo: 'A união: IA na AWS',
    pergunta: 'Eu consigo colocar IA em produção sobre serviços AWS?',
    resultado:
      'Você escolhe entre Knowledge Bases e retrieval próprio com critério, opera agents com autorização por operação, controla custo por token e prova a competência com AIF-C01 e MLA-C01.',
    icone: '◈',
    cor: '#ff9900',
    trilhas: ['trail-bedrock', 'trail-arq-ia-aws', 'trail-aws-aif', 'trail-mla'],
    opcionais: [],
  },
  {
    id: 'producao',
    numero: 4,
    titulo: 'Sustentar em produção',
    pergunta: 'O que acontece depois que o sistema está no ar?',
    resultado:
      'Você opera o que construiu: SRE e observabilidade, sistemas distribuídos, FinOps, segurança e a camada de dados que alimenta todo retrieval.',
    icone: '⚙️',
    cor: '#e3b341',
    trilhas: [
      'trail51',
      'trail11',
      'trail10',
      'trail28',
      'trail22',
      'trail38',
      'trail54',
      'trail-search-ir-deep',
      'trail24',
    ],
    opcionais: ['trail52'],
  },
];

/** Sequência linear de trilhas ao longo de toda a jornada, ignorando opcionais. */
export function sequenciaPrincipal(): string[] {
  return JORNADA.flatMap(e => e.trilhas);
}

/** A trilha que vem depois desta na jornada — `undefined` no fim de tudo. */
export function proximaTrilha(trailId: string): string | undefined {
  const seq = sequenciaPrincipal();
  const i = seq.indexOf(trailId);
  return i >= 0 && i < seq.length - 1 ? seq[i + 1] : undefined;
}

/** A etapa a que uma trilha pertence, principal ou opcional. */
export function etapaDaTrilha(trailId: string): EtapaJornada | undefined {
  return JORNADA.find(e => e.trilhas.includes(trailId) || e.opcionais.includes(trailId));
}

/** Resolve os ids de uma etapa em objetos de trilha, na ordem declarada. */
export function trilhasDaEtapa(etapa: EtapaJornada): { principais: Trail[]; opcionais: Trail[] } {
  const buscar = (ids: string[]) =>
    ids.map(id => CURRICULUM.find(t => t.id === id)).filter((t): t is Trail => Boolean(t));
  return { principais: buscar(etapa.trilhas), opcionais: buscar(etapa.opcionais) };
}
