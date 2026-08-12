/**
 * Currículo — ponto de entrada único.
 *
 * O arquivo original tinha 4.093 linhas e concentrava tipos, as 39 trilhas, os
 * hubs, os níveis, os badges e as funções de consulta. Duas consequências
 * concretas: qualquer edição de conteúdo colidia com qualquer outra no mesmo
 * arquivo, e mexer numa função de consulta obrigava a rolar por milhares de
 * linhas de dado.
 *
 * A divisão é por RESPONSABILIDADE, e o dado por TRILHA — um arquivo por
 * trilha, montados em ordem por `trails/index.ts`. Editar uma trilha passou a
 * tocar um arquivo de algumas dezenas de linhas.
 *
 * Este arquivo reexporta tudo com os mesmos nomes de antes, porque 93 arquivos
 * importam daqui. Refatoração que obriga a mexer em 93 lugares para provar que
 * nada quebrou não é refatoração de baixo risco — é uma migração, e ela seria
 * arriscada sem necessidade.
 */

export type { Level, Module, Trail, Hub } from './types';
export type { BadgeDef } from './badges';
export type { PrereqInfo, NextStepInfo } from './queries';

export { CURRICULUM } from './trails';
export { HUBS } from './hubs';
export { JORNADA, sequenciaPrincipal, proximaTrilha, etapaDaTrilha, trilhasDaEtapa } from './jornada';
export type { EtapaJornada } from './jornada';
export { LEVELS } from './levels';
export { BADGES_DEF } from './badges';

export {
  getLevelInfo,
  getTrailProgress,
  getHubBySlug,
  getHubForTrail,
  getTrailHref,
  getTrailByHref,
  getHubTrails,
  getHubStats,
  getModuleBySlug,
  getTrailForModule,
  getModulePrerequisites,
  getModuleNextSteps,
} from './queries';
