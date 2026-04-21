import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('promo-docs-brag-doc');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que brag doc (Julia Evans) muda o jogo em promocao?',
    options: [
      'E bonito',
      'Porque manager esquece detalhes ate 6 meses atras. Doc continuo com impacto quantificado vira insumo direto para promo packet, 1:1, review anual e entrevista externa. Voce tira do ombro do manager a carga de lembrar',
      'Impressiona colegas',
      'E obrigatorio',
    ],
    correct: 1,
    explanation: 'Julia Evans (jvns.ca) popularizou o brag doc em 2019. Ideia central: nao existe manager que lembra de tudo que voce fez. Se voce documenta semanalmente, na hora da promo o packet monta sozinho. Manager agradece porque facilita calibracao com staff engineers do time.',
  },
  {
    question: 'O que um promo packet senior+ precisa demonstrar?',
    options: [
      'Esforco e tempo na empresa',
      'Scope + impacto + leadership + influencia fora do time — cada um com 2-3 exemplos concretos e metricas. Staff/Principal tem que mostrar mudanca em nivel de area/organizacao, nao so sistema proprio',
      'Codigo escrito',
      'Horas extras',
    ],
    correct: 1,
    explanation: 'Ladders publicas (Dropbox, CircleCI, Rent the Runway) descrevem criterios de promocao staff: scope (cross-team/area), impact (mensurado em dolar/tempo), craft (qualidade tecnica), leadership (mentorou, conduziu). Packet sem esses eixos vira diario, nao evidencia.',
  },
  {
    question: 'Qual anti-pattern de timing arruina promocao?',
    options: [
      'Pedir cedo demais',
      'Esperar manager lembrar sozinho. Promocoes em empresa seria sao decididas em calibration reuniao fechada com staff engineers; se voce nao entregou packet claro + alinhou com seu manager 3-6 meses antes, voce nao entra na pauta',
      'Falar com manager',
      'Escrever doc',
    ],
    correct: 1,
    explanation: 'Gergely Orosz tem ensaio inteiro sobre isso. Ciclo real: voce sinaliza intencao 6 meses antes, manager lista gaps, voce fecha gaps e documenta, packet sobe em janela formal. Manager nao promove &quot;quando achar&quot; — existe ritmo, calibration, budget de promocoes por nivel.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="promo-docs-brag-doc"
      title="Promo docs que avancam"
      icon="📈"
      xp={50}
      readTime={12}
      trailName="Career Engineering"
      trailColor={accent}
      nextSlug="capstone-portfolio-tecnico"
      nextTitle="Capstone: portfolio tecnico publico"
      quiz={quiz}
    >
      <Section title="Brag doc — formato Julia Evans" accent={accent}>
        <CodeBlock lang="markdown">{`# Brag doc — Fernando — 2026

## Q1 2026

### Projeto: migracao feature flags
- Contexto: 40+ flags zumbis em Unleash, sem analise estatistica.
- Decisao: migrei para GrowthBook self-hosted com CUPED built-in.
- Impacto: experimentos/mes de 3 -&gt; 12, time-to-decision de
  4 semanas -&gt; 1 semana.
- Lideranca: RFC revisado com 2 staff engineers, mentorei 2
  engineers no novo stack.

### Aprendizados tecnicos
- Peeking problem + Alpha-spending (paper Microsoft 2018).
- Implementei mSPRT no harness interno.

### Feedback recebido
- Staff eng X: &quot;design doc claro, trade-offs honestos&quot;.
- Manager: &quot;nivel de comunicacao fora do time cresceu&quot;.

### Falhas e correcao
- Experiment de pricing rodou 2 semanas com SRM detectado
  tarde. Adicionei SRM check diario automatico.

## Q2 2026
[...]`}</CodeBlock>
        <Callout tone="info">
          Atualize semanalmente. 10 minutos na sexta-feira. Em 3 meses voce tem material para promo, review, entrevista externa e resume ao mesmo tempo. Formato Notion/Obsidian/Markdown — o que voce mantem.
        </Callout>
      </Section>

      <Section title="Promo packet — outline para senior+" accent={accent}>
        <CodeBlock lang="markdown">{`# Promo Packet — Fernando — Senior -&gt; Staff Engineer

## 1. Sumario executivo (1 paragrafo)
Nos ultimos 12 meses atuei como tech lead em [area], conduzi 3
projetos de impacto cross-team e mentorei 4 engineers.

## 2. Scope (evidencias)
- Projeto A (cross-team): [descricao, impacto, papel]
- Projeto B (area): [descricao, impacto, papel]
- Projeto C (tecnica profunda): [descricao, impacto]

## 3. Impacto quantificado
- Revenue/cost: USD Xm economizado, Yk novos clientes
- Reliability: p95 -Xms, incidentes -Y%
- Produtividade do time: ciclo de release de Nd -&gt; Md

## 4. Leadership (sem autoridade formal)
- Mentorei 2 juniors que foram promovidos a pleno
- Conduzi RFC adotado por 3 times
- Representei eng em decisao de arquitetura com VP

## 5. Craft tecnico
- Design docs (links): A, B, C
- Open source: contribuicao X, Y
- Talks internas: 2 apresentacoes, review em public channel

## 6. Calibracao
- Feedback de 3 staff engineers (anexados)
- Feedback de manager (anexado)
- Peer reviews (anexados)

## 7. Proximos 6 meses
Se promovido, planejo conduzir [iniciativa cross-area Z] em
parceria com [time/pessoa].`}</CodeBlock>
      </Section>

      <Section title="Timing e calibracao" accent={accent}>
        <CodeBlock lang="markdown">{`6 meses antes: sinalize para manager que quer promocao.
               Peca lista clara de gaps.

3-6 meses antes: feche gaps documentando no brag doc.
                 Alinhe com 2-3 staff engineers do time
                 para que eles tenham contexto na calibration.

1 mes antes: entregue packet ao manager com tempo para ele
             revisar e dar feedback antes da submissao formal.

Calibration: voce nao esta na sala. Seu packet + manager
             falam por voce. Se o packet for fraco, manager
             nao consegue defender.`}</CodeBlock>
      </Section>

      <Section title="Referencias" accent={accent}>
        <Callout tone="success">
          Julia Evans — jvns.ca/blog/brag-documents. Gergely Orosz — Pragmatic Engineer (ensaios sobre promotion). Will Larson — lethain.com/promotion-packets. Tanya Reilly — The Staff Engineer Path. StaffEng.com tem casos reais com packets reais.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
