/**
 * Montagem do currículo a partir dos arquivos por trilha.
 *
 * A ORDEM importa e é a mesma do arquivo único original: páginas de hub e a
 * navegação derivam a sequência daqui. Reordenar esta lista muda o que o
 * usuário vê como "próxima trilha" — `curriculum-ordem.test.ts` trava isso.
 */
import type { Trail } from '../types';
import { trilha_trail1 } from './trail1';
import { trilha_trail2 } from './trail2';
import { trilha_trail3 } from './trail3';
import { trilha_trail4 } from './trail4';
import { trilha_trail5 } from './trail5';
import { trilha_trail9 } from './trail9';
import { trilha_trail10 } from './trail10';
import { trilha_trail11 } from './trail11';
import { trilha_trail12 } from './trail12';
import { trilha_trail14 } from './trail14';
import { trilha_trail16 } from './trail16';
import { trilha_trail19 } from './trail19';
import { trilha_trail22 } from './trail22';
import { trilha_trail23 } from './trail23';
import { trilha_trail36 } from './trail36';
import { trilha_trail38 } from './trail38';
import { trilha_trail24 } from './trail24';
import { trilha_trail25 } from './trail25';
import { trilha_trail26 } from './trail26';
import { trilha_trail27 } from './trail27';
import { trilha_trail28 } from './trail28';
import { trilha_trail29 } from './trail29';
import { trilha_trail30 } from './trail30';
import { trilha_trail47 } from './trail47';
import { trilha_trail50 } from './trail50';
import { trilha_trail51 } from './trail51';
import { trilha_trail52 } from './trail52';
import { trilha_trail54 } from './trail54';
import { trilha_trail55 } from './trail55';
import { trilha_trail_ai_rlhf_agents } from './trail-ai-rlhf-agents';
import { trilha_trail_diffusion_multimodal } from './trail-diffusion-multimodal';
import { trilha_trail_local_llms_edge } from './trail-local-llms-edge';
import { trilha_trail_search_ir_deep } from './trail-search-ir-deep';
import { trilha_trail_aws_aif } from './trail-aws-aif';
import { trilha_trail_mla } from './trail-mla';
import { trilha_trail_bedrock } from './trail-bedrock';
import { trilha_trail_arq_ia_aws } from './trail-arq-ia-aws';
import { trilha_trail_labs_aws } from './trail-labs-aws';

export const CURRICULUM: Trail[] = [
  trilha_trail1,
  trilha_trail2,
  trilha_trail3,
  trilha_trail4,
  trilha_trail5,
  trilha_trail9,
  trilha_trail10,
  trilha_trail11,
  trilha_trail12,
  trilha_trail14,
  trilha_trail16,
  trilha_trail19,
  trilha_trail22,
  trilha_trail23,
  trilha_trail36,
  trilha_trail38,
  trilha_trail24,
  trilha_trail25,
  trilha_trail26,
  trilha_trail27,
  trilha_trail28,
  trilha_trail29,
  trilha_trail30,
  trilha_trail47,
  trilha_trail50,
  trilha_trail51,
  trilha_trail52,
  trilha_trail54,
  trilha_trail55,
  trilha_trail_ai_rlhf_agents,
  trilha_trail_diffusion_multimodal,
  trilha_trail_local_llms_edge,
  trilha_trail_search_ir_deep,
  trilha_trail_aws_aif,
  // Depois da AIF: a MLA-C01 é o degrau seguinte da mesma escada de credencial —
  // a AIF verifica entendimento, esta verifica capacidade de operar.
  trilha_trail_mla,
  trilha_trail_bedrock,
  // Depois do Bedrock de propósito: as 100 arquiteturas são a aplicação do que
  // aquela trilha ensina, e o módulo-catálogo (`aws-ia-100-solucoes`) fecha o
  // Bedrock apontando para cá.
  trilha_trail_arq_ia_aws,
  // Depois das 100 arquiteturas: aquela mostra a topologia de cada solução de
  // IA; esta constrói a competência que faz uma topologia dessas sobreviver em
  // produção, começando no básico.
  trilha_trail_labs_aws,
];
