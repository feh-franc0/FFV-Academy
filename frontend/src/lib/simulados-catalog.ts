/**
 * Catálogo de simulados pagos.
 *
 * Cada Simulado inclui questões com explicações em estilo "tutor":
 * - Por que a alternativa correta é correta
 * - Por que cada distrator está errado
 * - Quando aplicável, link pra artigo da FFV
 *
 * Questões são inspiradas em tópicos reais das certificações mas escritas
 * por nós — não são cópias de dumps oficiais (legal/ético).
 */

import type { Simulado } from './simulados';

const AWS_PRACTITIONER: Simulado = {
  id: 'simulado-aws-practitioner',
  dbBankId: 'aws-clf',
  certification: 'AWS Certified Cloud Practitioner (CLF-C02)',
  title: 'Simulado AWS Cloud Practitioner',
  description:
    'Avalie seu preparo para a prova oficial AWS CLF-C02 com 65 questões aleatórias nos domínios do exame real: Cloud Concepts, Security & Compliance, Cloud Technology & Services e Billing. Banco com 1000+ questões — cada tentativa é única.',
  price: 47,
  questionCount: 65,
  timeLimitMin: 90,
  passingScore: 70,
  studyModeUrl: '/simulados/cloud-practitioner/estudo',
  topics: [
    'IAM & Segurança',
    'Compute (EC2)',
    'Storage (S3/EBS)',
    'Billing & Pricing',
    'Global Infrastructure',
    'Shared Responsibility',
    'Databases',
    'Networking',
  ],
  // Questões servidas pelo backend Postgres via /api/v1/simulados/aws-clf/study/random.
  // Hardcoded array removido — fonte de verdade é o banco (rodar `make seed-questions` no backend).
  questions: [],
};

const AWS_SAA: Simulado = {
  id: 'simulado-aws-saa',
  dbBankId: 'aws-saa',
  certification: 'AWS Solutions Architect Associate (SAA-C03)',
  title: 'Simulado AWS SAA-C03',
  description:
    'Simulado da SAA-C03 com banco de 65 questões originais em PT-BR, nas proporções oficiais dos quatro domínios: Arquiteturas Seguras (30%), Resilientes (26%), de Alta Performance (24%) e Otimizadas em Custo (20%). Cada questão declara o enunciado de tarefa que exercita, com explicação que trata cada alternativa errada.',
  // Restaurado em ago/2026 com banco real: antes eram 5 questões de prévia
  // inline, 2 sem tratamento de distrator, a R$97 — o produto mais caro do
  // catálogo com o menor banco. Preço só volta quando o banco existe de verdade.
  price: 67,
  // 65 por tentativa — o banco tem exatamente 65, então toda tentativa cobre
  // o banco inteiro na proporção oficial dos domínios.
  questionCount: 65,
  timeLimitMin: 130,
  passingScore: 72,
  studyModeUrl: '/simulados/aws-saa/estudo',
  topics: [
    'Design de Arquiteturas Seguras',
    'Design de Arquiteturas Resilientes',
    'Design de Arquiteturas de Alta Performance',
    'Design de Arquiteturas Otimizadas em Custo',
  ],
  questions: [],
};

const AWS_DEVELOPER: Simulado = {
  id: 'simulado-aws-developer',
  dbBankId: 'aws-dva',
  studyModeUrl: '/simulados/aws-developer/estudo',
  certification: 'AWS Developer Associate (DVA-C02)',
  title: 'Simulado AWS Developer Associate',
  description:
    'Simulado da DVA-C02 com banco de 435 questões em PT-BR cobrindo os quatro domínios: desenvolvimento com serviços AWS, segurança, implantação, e solução de problemas com otimização. Cada tentativa sorteia 65 questões, então repetir não repete a prova.',
  price: 67,
  // 65 por tentativa, sorteadas de um banco de 435 no Postgres — alimentado por
  // `frontend/data/question-bank/dva-c02-*.json` via `make gen-seed-migration`.
  //
  // Até 09/ago/2026 este simulado mostrava 15 questões de esboço a R$67 enquanto
  // as 435 estavam escritas no repositório e nunca chegavam ao banco: o gerador
  // de migration só lia `clf-c02-*`, e ignorava o resto em silêncio.
  questionCount: 65,
  timeLimitMin: 130,
  passingScore: 72,
  topics: [
    'Desenvolvimento com serviços AWS',
    'Segurança',
    'Implantação',
    'Solução de problemas e otimização',
  ],
  questions: [],
};

const AWS_AI_PRACTITIONER: Simulado = {
  id: 'simulado-aws-aif',
  dbBankId: 'aws-aif',
  certification: 'AWS Certified AI Practitioner (AIF-C01)',
  title: 'Simulado AWS AI Practitioner',
  description:
    'Simulado da AIF-C01 nas proporções oficiais dos cinco domínios: Fundamentos de IA e ML (20%), Fundamentos de GenAI (24%), Aplicações de foundation models (28%), IA responsável (14%) e Segurança e governança (14%). Questões originais escritas a partir dos enunciados de tarefa publicados pela AWS, com explicação que trata cada alternativa errada.',
  price: 47,
  // 65 questões por tentativa, sorteadas de um banco de 115 no Postgres.
  questionCount: 65,
  timeLimitMin: 90,
  passingScore: 70,
  // Restaurado em ago/2026: o EstudoClient agora aceita `dbBankId` e a rota
  // dinâmica /simulados/[slug]/estudo resolve pelo catálogo. O slug é
  // `aws-aif` (= id sem o prefixo `simulado-`), não `aws-ai-practitioner`,
  // que era a rota inexistente que causava o 404 original.
  studyModeUrl: '/simulados/aws-aif/estudo',
  topics: [
    'Fundamentos de IA e ML',
    'Fundamentos de GenAI',
    'Aplicações de foundation models',
    'Engenharia de prompt',
    'Avaliação de modelos',
    'IA responsável',
    'Segurança e governança',
    'Agentes e MCP',
  ],
  // Vazio de propósito, como no CLF-C02: o banco vive no Postgres, alimentado por
  // `frontend/data/question-bank/aif-c01-*.json` via `make gen-seed-migration`.
  //
  // Chegaram a ficar 65 questões INLINE aqui em 09/ago/2026, e a medição mandou
  // desfazer: o arquivo foi a 128 KB, a suíte de testes saiu de 10 s para 915 s
  // com 8 arquivos estourando por tempo, e este módulo é importado por componente
  // de CLIENTE — os 128 KB iriam para o navegador de todo visitante.
  questions: [],
};

export const SIMULADOS_CATALOG: readonly Simulado[] = [
  AWS_PRACTITIONER,
  AWS_DEVELOPER,
  AWS_SAA,
  AWS_AI_PRACTITIONER,
] as const;
