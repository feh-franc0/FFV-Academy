import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('adrs-decisoes-reversiveis');
const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença prática entre decisão Type 1 (irreversível) e Type 2 (reversível) na hora de escrever ADR?',
    options: [
      'Type 1 pode ser mudada depois; Type 2 não',
      'Type 1 exige mais due diligence (várias opções, pros/cons, fallback plan) porque o custo de errar é alto; Type 2 aceita "decide rápido, iterar" — ADR menor, foco no aprendizado',
      'Não existe diferença prática, só semântica',
      'Type 2 é usada só em startups',
    ],
    correct: 1,
    explanation: 'Bezos popularizou o framework: Type 1 são portas de via única (migrar banco, vendor lock-in, breaking change público) — merecem análise profunda, múltiplos revisores, plano de reversão custoso. Type 2 são portas de duas vias (escolher lib interna, naming convention) — decidir rápido vale mais que decidir perfeito. Confundir os dois causa ou paralisia de análise em coisas triviais ou rollbacks dolorosos em coisas sérias.',
  },
  {
    question: 'Por que ADR deve ser imutável (superseded em vez de editado)?',
    options: [
      'Convenção estética',
      'ADR é registro histórico do raciocínio naquele momento. Editar apaga o contexto que levou à decisão e torna impossível aprender com o passado — o ADR novo marca "supersedes ADR-007" e explica o que mudou',
      'Porque o Git não permite edições',
      'Editar quebra o número sequencial',
    ],
    correct: 1,
    explanation: 'O valor do ADR está no contexto: quem mais vai chegar em 2 anos precisa entender "por que decidimos isso naquele momento". Se editar, perde-se o trail histórico. Padrão Nygard: status muda de Accepted para Superseded, e um ADR novo referencia o antigo. Arqueologia de decisões é como times seniores evitam repetir erros.',
  },
  {
    question: 'Qual o conteúdo mínimo de um ADR útil?',
    options: [
      'Só a decisão final',
      'Contexto (problema + forças em jogo), Opções consideradas (com pros/cons honestos, incluindo a rejeitada), Decisão (a escolhida + por quê), Consequências (positivas, negativas, riscos), e quando aplicável plano de rollback',
      'Diagrama de arquitetura',
      'Apenas pros e cons',
    ],
    correct: 1,
    explanation: 'Template Nygard clássico. O campo "Opções consideradas" é o mais subestimado — mostrar que você avaliou 3 alternativas e rejeitou 2 com motivos sinaliza rigor. Consequências negativas explícitas são sinal de senioridade: toda decisão tem trade-off, fingir que não tem é ingenuidade. Em Type 1 sempre incluir rollback plan mesmo que caro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="adrs-decisoes-reversiveis"
      title="ADRs: decisões reversíveis vs irreversíveis"
      icon="📋"
      xp={50}
      readTime={12}
      trailName="Tech Leadership & Staff Engineering"
      trailColor={accent}
      nextSlug="mentoria-tecnica"
      nextTitle="Mentoria técnica: multiplicar sem gargalar"
      quiz={quiz}
    >
      <Section title="Por que ADRs existem" accent={accent}>
        <p>
          Toda base de código tem decisões fantasmas: &quot;por que usamos Kafka aqui em vez de SQS?&quot;, &quot;por que esse módulo é Python e o resto é TypeScript?&quot;. Sem registro, o raciocínio morre com quem saiu do time. ADR (Architecture Decision Record), proposto por Michael Nygard em 2011, é um documento curto versionado no próprio repo que captura <strong>contexto, alternativas, decisão e consequências</strong> de uma escolha arquitetural.
        </p>
        <p>
          Não é documentação de arquitetura (isso é <em>o que</em> existe). ADR é <em>por que</em> existe.
        </p>
      </Section>

      <Section title="Reversível vs irreversível (Bezos/Amazon)" accent={accent}>
        <p>
          Jeff Bezos popularizou a distinção em carta aos acionistas: decisões são portas de <strong>uma via</strong> ou de <strong>duas vias</strong>. Essa distinção muda como você escreve o ADR.
        </p>
        <Callout tone="info" icon="🚪">
          <strong>Type 1 (irreversível):</strong> migração de banco de dados produção, contrato público quebrando, lock-in de vendor caro, arquitetura que leva 6+ meses pra trocar. Exige due diligence profunda, múltiplos revisores, plano de rollback explícito.
          <br /><br />
          <strong>Type 2 (reversível):</strong> naming convention, biblioteca interna de utils, estrutura de pastas. Decide rápido, itera. ADR menor, foco no aprendizado caso mude.
        </Callout>
      </Section>

      <Section title="Template mínimo Nygard" accent={accent}>
        <CodeBlock lang="markdown">{`# ADR-014: Adotar PostgreSQL como banco primário

## Status
Accepted — 2026-04-12

## Context
Hoje temos MongoDB. Problemas: transactions cross-collection são frágeis,
joins em reports são lentos, modelagem foi esticada até virar SQL mal feito.
Time tem experiência SQL. Volume atual: 50GB, 2M req/dia.

## Decision
Migrar para PostgreSQL 16 em 3 fases ao longo de 2 sprints.
Manter MongoDB temporariamente para coleção "events" (append-only).

## Options considered
1. Manter MongoDB + schema validation — rejeitado: não resolve joins
2. PostgreSQL — escolhido
3. CockroachDB — rejeitado: overkill pro volume, ops cara

## Consequences
+ Transactions reais, joins baratos, ecossistema maduro
- Esforço de migração ~3 semanas, retraining do time em índices SQL
- Risco: downtime na cutover; mitigação via dual-write temporário

## Rollback plan (Type 1)
Snapshot Mongo pré-cutover mantido 30 dias.
Feature flag por rota permite voltar leituras ao Mongo em minutos.`}</CodeBlock>
      </Section>

      <Section title="Operando ADRs no dia-a-dia" accent={accent}>
        <p>
          Pasta <code>docs/adr/</code> no repo. Arquivo numerado (<code>0014-postgres-primario.md</code>). Nunca edite ADR aceito — crie um novo com status <code>Supersedes ADR-014</code>. Pull request do ADR vira a discussão — comentários no PR documentam divergência antes do merge.
        </p>
        <Callout tone="warn" icon="⚠️">
          Anti-padrão: ADR escrito depois da decisão já implementada, só pra &quot;cumprir tabela&quot;. Perde 100% do valor. ADR é instrumento de decisão, não relatório pós-fato.
        </Callout>
        <Callout tone="success" icon="✅">
          Staff/Principal engineer reconhecido no mercado é quem escreve ADRs lidos por times inteiros meses depois. É o artefato mais barato de produzir com maior alavancagem organizacional.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
