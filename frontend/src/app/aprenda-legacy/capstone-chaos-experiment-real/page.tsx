import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-chaos-experiment-real');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia capstone chaos "portfolio-grade" de exercício de curso?',
    options: [
      'Cor do slide',
      'Hypothesis baseada em SLO real do sistema, scope delimitado com blast radius calculado, abort criteria automático via alarm, runbook versionado em repo, execução em ambiente real (staging full-fidelity ou prod canary) e postmortem com action items que efetivamente foram mergeados',
      'Tamanho do README',
      'Nome fancy',
    ],
    correct: 1,
    explanation: 'Portfolio-grade = artefatos reais: link pra PR do runbook, link pra ExperimentTemplate no Git, link pra dashboard Grafana durante o experiment, link pros PRs que resolveram os action items. Recruiter vê evidência de rigor. Exercício de curso = PDF bonito sem link pra nada.',
  },
  {
    question: 'Como escolher a primeira falha a injetar no capstone?',
    options: [
      'A mais épica',
      'A mais provável e barata de aprender: dependência externa (payment gateway, OAuth) com timeout/latency elevada. Tem alta frequência real, baixo blast radius se bem isolada e gera quase sempre algum gap em retry/timeout/circuit-breaker — aprendizado garantido',
      'Região inteira',
      'Aleatório',
    ],
    correct: 1,
    explanation: 'Primeiro experiment deve ter alta probabilidade de ensinar algo, baixo risco e custo barato de rollback. Dependency latency é perfeita: super comum na vida real, fácil de injetar (Istio/Toxiproxy/FIS), quase sempre revela timeout default errado, retry storm ou ausência de circuit breaker. Chaos Kong no primeiro dia é autossabotagem.',
  },
  {
    question: 'O que precisa estar no writeup final?',
    options: [
      'Só gráfico',
      'Contexto (sistema + SLO), hypothesis explícita, experiment design (target, método, scope, abort), execução (timeline factual com timestamps), findings (o que quebrou, MTTD/MTTR), action items merged (link pros PRs), next iterations e honest limitations',
      'Foto do time',
      'Vídeo viral',
    ],
    correct: 1,
    explanation: 'Writeup de engineer sênior: contexto (por que esse sistema, qual SLO), método (hypothesis + design), resultado (factual, com timestamps reais), consequência (action items com evidência de merge), honestidade (o que não foi testado, limitations). Esse é o artefato que separa "fiz curso de chaos" de "opero chaos".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-chaos-experiment-real"
      title="Capstone: chaos experiment end-to-end"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="Chaos Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Escolha um sistema próprio (side-project, serviço do trabalho com autorização, ou app demo deployado). Rode UM experiment end-to-end: hypothesis → scope → runbook → execução → postmortem → action items merged. Entregue em repositório público com links pros artefatos reais.
        </p>
        <Callout tone="info" icon="🎯">
          Objetivo pedagógico: provar que você opera chaos como disciplina. Não é sobre derrubar região. É sobre mostrar rigor em toda a cadeia — do dashboard de steady-state até o PR que fecha o action item.
        </Callout>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Chaos Capstone — Entregáveis mínimos

## 1. Contexto do sistema (README)
- Arquitetura (diagrama ou mermaid)
- SLO definido (success rate + latency p99)
- Observability stack (Prometheus, Grafana, Langfuse, etc)

## 2. Hypothesis document (docs/hypothesis.md)
- Steady-state metric com baseline medido (últimos 7 dias)
- Falha a injetar (o porquê: frequência real + gap suspeito)
- Comportamento esperado se resiliente
- Critérios de abort (thresholds numéricos)

## 3. Experiment artifact
- Se AWS: ExperimentTemplate FIS em IaC (Terraform/CDK)
- Se K8s: ChaosEngine LitmusChaos em YAML
- Se Istio: VirtualService fault
- Se bare: script tc/stress-ng + watchdog de rollback

## 4. Runbook (docs/runbook.md)
- Pré-checklist (baseline OK, comunicação enviada, rollback testado)
- Timeline minuto a minuto
- Comandos exatos (copy-pasteable)
- Abort criteria + rollback steps

## 5. Execução documentada
- Screenshots dos dashboards ANTES, DURANTE, DEPOIS
- Logs dos comandos executados (timestamps reais)
- Output dos alertas (quais dispararam, quando)

## 6. Postmortem blameless (docs/postmortem.md)
- Timeline factual
- O que funcionou
- O que falhou (gaps)
- Action items com OWNER, PRAZO e LINK DO PR

## 7. Action items fechados
- Pelo menos 1 PR merged resolvendo um gap encontrado
- Link no postmortem

## 8. Writeup final (blog post ou README.md rico)
- Contexto, hypothesis, método, resultado, ação, aprendizado
- Charts (Grafana export PNG ou mermaid)
- Honest limitations e next experiments`}</CodeBlock>
      </Section>

      <Section title="Exemplo de hypothesis doc" accent={accent}>
        <CodeBlock lang="markdown">{`# Hypothesis: checkout resiliente a latência do gateway de pagamento

## Contexto
Checkout depende de payments-gateway (external SaaS). SLO interno:
- checkout_success_rate_5m >= 99.0%
- checkout_p99_latency_ms < 1500ms

Baseline medido (últimos 7 dias, via Prometheus):
- success_rate: 99.7% (desvio 0.1pp)
- p99: 820ms (desvio 60ms)

## Falha a injetar
Latência adicional de 800ms em 100% das chamadas pra payments-gateway,
por 10 minutos, via Istio VirtualService fault.delay, em canary cell (5%
do tráfego, match por header x-chaos-ring=canary).

## Por que essa falha
- Gateway teve 3 incidents nos últimos 90 dias com latência elevada
- Timeout do cliente HTTP atual é 30s (suspeita: alto demais)
- Não há circuit breaker implementado

## Comportamento esperado se resiliente
- success_rate_canary mantém >= 98.5% (fallback graceful degradation)
- p99_latency_canary fica < 2000ms (timeout curto + retry)
- Alerta "gateway-latency-high" dispara em <= 2min

## Abort criteria (qualquer dispara rollback automático)
- success_rate_canary < 97% por 2min consecutivos
- p99_latency_canary > 5000ms por 1min
- qualquer alerta SEV-1 em outro serviço
- facilitator trump card`}</CodeBlock>
      </Section>

      <Section title="Rubrica de avaliação" accent={accent}>
        <CodeBlock lang="markdown">{`Iniciante (0-40)
- Injetou falha, mediu algo, escreveu parágrafo
- Sem hypothesis formal, sem abort criteria automático

Intermediário (40-70)
- Hypothesis com steady-state baseline real
- Runbook com abort criteria, mas rollback manual
- Postmortem com findings, action items sem PR

Avançado (70-100)
- Experiment artifact versionado (FIS/Litmus/Istio)
- Abort automático via alarm
- Postmortem com action items MERGED (link dos PRs)
- Writeup honesto com limitations e next experiments
- Blog post público ou README rico`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Termine com uma pergunta pro próximo experiment: "qual a próxima falha menos testada do meu sistema, e qual hypothesis eu escreveria agora?". Chaos engineering é hábito de iteração, não projeto de final de curso.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
