import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-adr-completo');
const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o campo do ADR que mais distingue júnior de senior?',
    options: [
      'Status',
      '"Options considered" com pros/cons honestos incluindo a(s) rejeitada(s): mostra que você avaliou alternativas, entende trade-offs reais, e não escolheu a primeira ideia. Junior pula; senior dedica tempo real',
      'Data',
      'Autor',
    ],
    correct: 1,
    explanation: 'ADR sem alternativas rejeitadas é só justificativa pós-fato. Senior dedica parágrafos iguais às opções rejeitadas — explica por que não serviram. Isso demonstra rigor, protege contra bike-shedding futuro ("e se tivéssemos usado X?" — já respondido no ADR) e ensina times menos seniors a pensar em opções.',
  },
  {
    question: 'Por que incluir "consequências negativas" explícitas é sinal de maturidade?',
    options: [
      'Engordar o documento',
      'Toda decisão tem trade-off. Pessoa imatura esconde o custo; senior admite "essa decisão piora X, aceitamos porque Y vale mais". Documento honesto protege time contra surpresas futuras e contra revisão injusta quando o trade-off se manifesta',
      'Covering your ass',
      'Obrigatório no template',
    ],
    correct: 1,
    explanation: 'ADR que só lista vantagens cheira a vendedor. Realidade: qualquer escolha técnica séria tem custo. PostgreSQL ganhou MongoDB em consistência, mas piorou schema flexibility. Microserviços ganharam isolamento, pioraram observability. Declarar explicitamente protege: 6 meses depois quando alguém questiona, a resposta é "sim, sabíamos desse custo, aceitamos pelo ganho Y". Sem essa linha, a decisão parece erro.',
  },
  {
    question: 'O que deve ter um bom "rollback plan" em ADR de decisão irreversível?',
    options: [
      'Uma frase genérica',
      'Plano executável: gatilho claro ("se p99 passar de 500ms por 48h"), passos específicos ("reverter feature flag, re-habilitar rota legacy, restaurar snapshot Y"), estimativa de tempo e custo, e quem decide disparar',
      'Só o nome do responsável',
      '"Cuidaremos se der problema"',
    ],
    correct: 1,
    explanation: 'Rollback vago é rollback inexistente. Em Type 1 (irreversível), mesmo quando rollback é caro, precisa estar escrito: gatilho quantitativo, passos concretos, custo estimado, decisor nomeado. Isso força o time a pensar antes se o plano é viável — muitas decisões morrem aqui, quando percebe que rollback custa 3 semanas e não tem. Bom ADR mata planos irrealistas antes de produção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-adr-completo"
      title="Capstone: ADR completo de decisão real"
      icon="🏁"
      xp={85}
      readTime={18}
      trailName="Tech Leadership & Staff Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Escolha uma decisão arquitetural real: atual (que você está enfrentando no trabalho), passada (que já implementou), ou fictícia plausível (baseada em contexto que conhece). Escreva ADR completo, publique no GitHub, compartilhe com peer senior pra crítica. Meta: produzir documento que qualquer engenheiro senior leia e reconheça como maduro.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone Tech Leadership — Checklist

## 1. Decisão escolhida
- [ ] Escopo real (não "escolher framework" genérico)
- [ ] Type classificado (1 irreversível / 2 reversível)
- [ ] Contexto específico documentado

## 2. ADR no formato Nygard
- [ ] Status (Proposed / Accepted / Superseded)
- [ ] Context: problema + forças + constraints
- [ ] Decision: o que foi decidido, em 2–5 frases
- [ ] Options considered: >= 3 opções com pros/cons
- [ ] Consequences: positivas E negativas explícitas
- [ ] Rollback plan (obrigatório em Type 1)

## 3. Qualidade do raciocínio
- [ ] Opção rejeitada recebe parágrafo próprio
- [ ] Números específicos (latency, custo, volume)
- [ ] Premissas explicitadas (o que precisa ser verdade)
- [ ] Riscos identificados com mitigação

## 4. Artefatos complementares
- [ ] Diagrama (Mermaid ou draw.io) se ajuda
- [ ] Link pra POC / spike se houve
- [ ] Referências (blog posts, papers, docs oficiais)

## 5. Peer review
- [ ] Pelo menos 1 peer senior revisou
- [ ] Incorporou feedback ou registrou divergência
- [ ] Publicado em repo público (GitHub gist ou repo próprio)`}</CodeBlock>
      </Section>

      <Section title="Estrutura recomendada do ADR" accent={accent}>
        <CodeBlock lang="markdown">{`# ADR-001: <Título da decisão>

## Status
Accepted — 2026-04-19
Author: <seu nome>
Type: 1 (irreversível) | 2 (reversível)

## Context
<1–3 parágrafos: problema que motivou, forças em jogo, constraints
de negócio/técnicas/time. Inclua números: volume, latência atual,
custo, deadline se houver.>

## Decision
<2–5 frases: o que foi escolhido. Direto, sem hedge. "Vamos migrar
de X para Y em 3 fases ao longo de N sprints, mantendo Z em dual-run
durante 30 dias.">

## Options considered

### Opção A — <nome> (escolhida)
Pros: ...
Cons: ...
Estimativa: ...

### Opção B — <nome> (rejeitada)
Pros: ...
Cons: ...
Por que rejeitada: ... (específico, não "não cabe")

### Opção C — <nome> (rejeitada)
...

## Consequences

### Positivas
- Reduz latência p99 de 800ms para ~150ms (estimado)
- Remove dependência Z, simplifica pipeline
- Time ganha familiaridade com stack Y, investimento estratégico

### Negativas
- Retraining de 3 devs em ~2 semanas, perda temporária de velocity
- Custo mensal aumenta ~30% no primeiro trimestre
- Risco: integração X não foi testada em escala > 500 req/s

## Rollback plan
Gatilho: p99 > 500ms por 48h consecutivas OU error rate > 2%.
Passos:
1. Reverter feature flag migration_v2 (segundos)
2. Re-habilitar rota legacy no gateway (minutos)
3. Restaurar snapshot Mongo se dados divergiram (~30 min)
4. Post-mortem em 72h
Custo: ~4h de time, downtime máximo 30min.
Decisor: <on-call lead>.

## Referências
- Link pro RFC
- Post-mortem de incidente relacionado
- Paper / blog post que embasa`}</CodeBlock>
      </Section>

      <Section title="Critério de qualidade" accent={accent}>
        <Callout tone="info" icon="🎯">
          Teste: dê o ADR pronto pra alguém fora do time ler em 10 minutos. Ao final, a pessoa deve conseguir responder: (1) qual problema, (2) qual decisão, (3) que outras opções foram avaliadas, (4) qual o custo aceito. Se falha em qualquer uma, o ADR ainda não está pronto.
        </Callout>
      </Section>

      <Section title="Publicação e portfólio" accent={accent}>
        <p>
          ADRs bem escritos são parte do portfólio de staff/principal engineer. Publique em repo público (&quot;adr-portfolio&quot; com 3–5 ADRs reais anonimizados). Recrutador técnico sério lê isso e reconhece nível. Em entrevista de Staff role, pedir pra mostrar ADR escrito é prática comum — se você já tem, parte saindo na frente.
        </p>
        <Callout tone="success" icon="🎓">
          Um único ADR escrito com rigor pesa mais no portfólio de senior/staff do que 10 projetos toy em GitHub. Demonstra pensamento, comunicação e maturidade — exatamente o que diferencia o nível acima.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
