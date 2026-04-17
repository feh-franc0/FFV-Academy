import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, DecisionBox, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'SLOs e Error Budgets: da definição ao burn rate alert | FFV Academy',
  description: 'SLI, SLO, SLA — diferenças e como definir. Error budget como recurso de engenharia. Multi-window multi-burn rate alerts. Toil budget e freeze policy.',
  keywords: 'SLO, SLA, SLI, error budget, burn rate, alertas, SRE, confiabilidade, observabilidade',
};

const ACCENT = '#79c0ff';

const quiz = [
  {
    question: 'Qual a diferença entre SLI, SLO e SLA?',
    options: [
      'São sinônimos — diferentes empresas usam termos diferentes para a mesma coisa',
      'SLI é a métrica medida, SLO é o alvo interno de confiabilidade, SLA é o contrato externo com penalidades',
      'SLA é definido pela engenharia, SLO pelo produto, SLI pelo cliente',
      'SLO é mais rígido que SLA — SLA é sempre um percentual menor',
    ],
    correct: 1,
    explanation: 'SLI (Service Level Indicator): a métrica real medida (ex: % de requests com latência < 300ms). SLO (Service Level Objective): o alvo interno (ex: SLI ≥ 99.5%). SLA (Service Level Agreement): contrato com cliente com penalidades financeiras se violado. SLA deve ser sempre menor que SLO — se o SLO for 99.5%, o SLA pode ser 99%. A folga protege contra violações de SLA.',
  },
  {
    question: 'O que significa "queimar 10% do error budget em 1 hora" num SLO de 30 dias?',
    options: [
      'O sistema teve 10% de erros nos últimos 60 minutos',
      'Se o padrão atual continuar, o error budget de 30 dias se esgotará em 10 horas',
      'O SLA foi violado e penalidades serão aplicadas',
      'O time deve pausar todo desenvolvimento por 3 dias',
    ],
    correct: 1,
    explanation: 'Error budget é o "crédito" de falha permitido no período. Se você tem 30 dias de janela e queimou 10% em 1 hora, a taxa é 72× mais rápida que o normal (30d / (1h × 10%) = ~300h de budget ÷ taxa). Se continuar, o budget se esgota em ~10h. Isso é exatamente o que o burn rate alerta captura.',
  },
  {
    question: 'Por que alertas baseados em "porcentagem de erros na última hora" são problemáticos para SLOs?',
    options: [
      'Porcentagens são difíceis de calcular em tempo real',
      'Podem disparar por erros transitórios e ignorar degradação lenta que esgota o budget ao longo de dias',
      'Sistemas de alerta não suportam métricas percentuais',
      'Erros de curto prazo nunca afetam SLOs de longo prazo',
    ],
    correct: 1,
    explanation: 'Um erro de 5 minutos dispara "% de erros alta" mas consome pouco do budget de 30 dias. Degradação de 0.5% constante por 10 dias não dispara "% alta" mas esgota o budget silenciosamente. Multi-window multi-burn rate resolve isso: janela curta (1h) captura incidentes críticos, janela longa (3d) captura degradação silenciosa.',
  },
  {
    question: 'Qual o propósito do "toil budget" em SRE?',
    options: [
      'Medir quanto tempo o time gasta em reuniões',
      'Limitar o trabalho manual repetitivo sem valor duradouro para liberar tempo para engenharia',
      'Calcular o custo de operação de serviços em produção',
      'Definir quantos incidentes por mês são aceitáveis',
    ],
    correct: 1,
    explanation: 'Toil = trabalho manual, repetitivo, tático e sem valor de engenharia duradouro (ex: restart manual de serviços, atualização manual de configurações, on-call pagers por falta de alertas). SRE define: máximo 50% do tempo de trabalho em toil. Se ultrapassar, o time não tem capacidade para automação e projetos de confiabilidade.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="slos-error-budgets"
      title="SLOs e Error Budgets: da definição ao burn rate alert"
      icon="🎯"
      xp={80}
      readTime={16}
      trailName="Observabilidade & SRE"
      trailColor={ACCENT}
      nextSlug="incident-response-postmortem"
      nextTitle="Incident Response e Postmortem: do pager ao aprendizado"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Confiabilidade não é "servidor no ar". É ter uma definição clara e mensurável do que significa
        o sistema funcionar bem para o usuário — e honrá-la. SLOs (Service Level Objectives) são essa
        definição. Error budgets são o que transforma confiabilidade numa ferramenta de decisão de negócio.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        A ideia central do SRE (Site Reliability Engineering) do Google: se você nunca está abaixo do SLO,
        você está sendo conservador demais — poderia lançar features mais rápido. Se está constantemente
        violando, você tem um problema de confiabilidade. O error budget é o saldo entre esses extremos.
        Neste módulo você vai do conceito à implementação real de alertas inteligentes.
      </p>

      <Section title="SLI → SLO → SLA: a hierarquia">
        <ArchDiagram>{`
  ┌─────────────────────────────────────────────────────────────────┐
  │  SLI — Service Level Indicator                                  │
  │  "O que eu meço"                                                │
  │                                                                 │
  │  Ex: proportion of requests where latency < 300ms               │
  │      = successful_requests / total_requests                     │
  └────────────────────┬────────────────────────────────────────────┘
                       │ define alvo para
  ┌────────────────────▼────────────────────────────────────────────┐
  │  SLO — Service Level Objective                                  │
  │  "O alvo interno de confiabilidade"                             │
  │                                                                 │
  │  Ex: SLI ≥ 99.5% medido em janela rolling de 30 dias           │
  │      (= máx 0.5% de requests lentas ou com erro)               │
  └────────────────────┬────────────────────────────────────────────┘
                       │ base para (sempre mais frouxo)
  ┌────────────────────▼────────────────────────────────────────────┐
  │  SLA — Service Level Agreement                                  │
  │  "O contrato com penalidades"                                   │
  │                                                                 │
  │  Ex: ≥ 99.0% (folga de 0.5% em relação ao SLO)                │
  │      Se violar: crédito de 10% na fatura do cliente            │
  └─────────────────────────────────────────────────────────────────┘

  Regra: SLA < SLO < 100%
  Por quê: se o SLO = SLA, qualquer pequena falha interna gera
  penalidade financeira sem buffer de aviso.
`}</ArchDiagram>
      </Section>

      <Section title="Como definir um bom SLI">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          SLI mede a experiência do usuário — não métricas de sistema. "CPU &lt; 80%" não é um SLI.
          "% de requests completados em &lt; 300ms" é.
        </p>
        <ComparisonTable
          headers={['Tipo de SLI', 'Fórmula', 'Quando usar']}
          rows={[
            ['Availability', 'successful_requests / total_requests', 'APIs, serviços HTTP — mede se o sistema está respondendo corretamente'],
            ['Latency', 'requests_under_threshold / total_requests', 'UX-críticos — "% de buscas respondidas em < 200ms"'],
            ['Throughput', 'requests_processed / target_rate', 'Pipelines de dados — "% de batches completados no tempo esperado"'],
            ['Error rate', '1 - (error_requests / total_requests)', 'Alternativa a availability — foca em erros de aplicação, não infraestrutura'],
            ['Quality', 'good_quality_responses / total_responses', 'Sistemas com degradação graciosa — recomendações com fallback ainda são "sucesso"'],
          ]}
        />
        <CodeBlock lang="python">{`# Definindo SLIs em Prometheus
# Métrica base: contador de requests por status
# Instrumentado pelo servidor HTTP automaticamente (ou manualmente):

from prometheus_client import Counter

REQUEST_COUNTER = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'handler', 'status_code']
)

# SLI de Availability: requests com 5xx são falhas
# PromQL:
availability_sli = """
  sum(rate(http_requests_total{status_code!~"5.."}[5m]))
  /
  sum(rate(http_requests_total[5m]))
"""

# SLI de Latência: requests abaixo de 300ms (histograma)
from prometheus_client import Histogram

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['handler'],
    buckets=[0.1, 0.3, 0.5, 1.0, 2.0, 5.0]
)

# PromQL para latency SLI:
latency_sli = """
  sum(rate(http_request_duration_seconds_bucket{handler="/checkout",le="0.3"}[5m]))
  /
  sum(rate(http_request_duration_seconds_count{handler="/checkout"}[5m]))
"""`}</CodeBlock>
      </Section>

      <Section title="Error budget: o saldo de falha permitido">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Se o SLO é 99.5% em 30 dias, o error budget é os 0.5% restantes — convertido em tempo absoluto:
        </p>
        <ArchDiagram>{`
  SLO = 99.5%  →  Error budget = 0.5%

  Janela de 30 dias = 43.200 minutos
  Error budget = 0.5% × 43.200 = 216 minutos = 3h36min

  ┌─────────────────────────────────────────────────────────┐
  │ ERROR BUDGET TRACKER — Checkout Service — Jan 2024      │
  │                                                         │
  │ Budget total: 216 min                                   │
  │ ████████████████████░░░░░░░░░░░░░░░░░░░░  45% usado    │
  │                                                         │
  │ Consumido: 97 min                                       │
  │  • Incidente DB 03/Jan: 45 min                          │
  │  • Deploy canário com bug 11/Jan: 32 min                │
  │  • Degradação CDN 18/Jan: 20 min                        │
  │                                                         │
  │ Restante: 119 min (55%)                                 │
  │ Dias restantes no mês: 13                               │
  │                                                         │
  │ ✅ Budget disponível — time pode fazer releases         │
  └─────────────────────────────────────────────────────────┘

  Se budget esgota antes do fim do mês:
  → Feature freeze: sem novos deploys de features
  → Time foca 100% em confiabilidade
  → Investigar o que está causando consumo anormal
`}</ArchDiagram>
        <Callout tone="info">
          <strong>Error budget como ferramenta de decisão:</strong> O budget não é punitivo — é um contrato
          entre produto e engenharia. Produto quer lançar features rápido (consome budget). Engenharia
          quer sistema confiável (protege budget). Quando o budget acabar, a conversa é objetiva:
          "matemática diz que precisamos parar de lançar e estabilizar".
        </Callout>
      </Section>

      <Section title="Multi-window multi-burn rate alerts">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          O Google SRE Workbook definiu a estratégia de alertas mais eficaz para SLOs. A ideia:
          alertar quando a taxa de consumo do error budget é anormalmente alta — não só quando há erros.
        </p>
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          <strong>Burn rate</strong> = taxa atual de consumo ÷ taxa normal esperada.
          Burn rate de 1 = consome o budget exatamente na janela. Burn rate de 2 = esgota o budget em
          metade do tempo.
        </p>
        <ArchDiagram>{`
  SLO = 99.5%  →  error rate alvo = 0.5%

  Burn rate = current_error_rate / target_error_rate
  Ex: error rate atual = 5%  →  burn rate = 5% / 0.5% = 10×

  TABELA DE ALERTAS (Google SRE Workbook):
  ─────────────────────────────────────────────────────────────────
  Alerta  │ Burn Rate │ Janela Curta │ Janela Longa │ Severidade
  ─────────┼───────────┼──────────────┼──────────────┼───────────
  P1       │ 14.4×     │ 1h           │ 5min         │ PagerDuty
  P2       │ 6×        │ 6h           │ 30min        │ Slack urgente
  P3       │ 3×        │ 3 dias       │ 6h           │ Ticket/email
  P4       │ 1×        │ 30 dias      │ -            │ Weekly review
  ─────────────────────────────────────────────────────────────────

  P1 (14.4×): burn rate de 14.4 esgota budget em 30d/14.4 = 2 dias
  → Requer resposta imediata (pager)

  P3 (3×): burn rate de 3 esgota budget em 10 dias
  → Degradação silenciosa — ticket para investigar
`}</ArchDiagram>
        <CodeBlock lang="yaml">{`# Prometheus alerting rules — multi-window multi-burn rate
# SLO: 99.5% availability no checkout em janela de 30 dias

groups:
  - name: slo.checkout.availability
    rules:
      # SLI: proporção de requests bem-sucedidos
      - record: job:slo_checkout_success_rate:ratio_rate5m
        expr: |
          sum(rate(http_requests_total{job="checkout",status!~"5.."}[5m]))
          /
          sum(rate(http_requests_total{job="checkout"}[5m]))

      - record: job:slo_checkout_success_rate:ratio_rate1h
        expr: |
          sum(rate(http_requests_total{job="checkout",status!~"5.."}[1h]))
          /
          sum(rate(http_requests_total{job="checkout"}[1h]))

      - record: job:slo_checkout_success_rate:ratio_rate6h
        expr: |
          sum(rate(http_requests_total{job="checkout",status!~"5.."}[6h]))
          /
          sum(rate(http_requests_total{job="checkout"}[6h]))

      - record: job:slo_checkout_success_rate:ratio_rate3d
        expr: |
          sum(rate(http_requests_total{job="checkout",status!~"5.."}[3d]))
          /
          sum(rate(http_requests_total{job="checkout"}[3d]))

      # P1: Burn rate 14.4× — incidente crítico
      # Janela curta (5m) E janela longa (1h) devem satisfazer
      # Reduz false positives de spikes breves
      - alert: CheckoutSLOBurnRateCritical
        expr: |
          (
            (1 - job:slo_checkout_success_rate:ratio_rate5m) > (14.4 * 0.005)
            AND
            (1 - job:slo_checkout_success_rate:ratio_rate1h) > (14.4 * 0.005)
          )
        for: 2m
        labels:
          severity: critical
          team: checkout
        annotations:
          summary: "Checkout SLO: burn rate crítico (14.4×)"
          description: |
            Error rate atual: {{ $value | humanizePercentage }}
            Budget consumido em: ~2 dias se continuar.
            Runbook: https://wiki/checkout-slo-runbook

      # P2: Burn rate 6× — degradação significativa
      - alert: CheckoutSLOBurnRateHigh
        expr: |
          (
            (1 - job:slo_checkout_success_rate:ratio_rate30m) > (6 * 0.005)
            AND
            (1 - job:slo_checkout_success_rate:ratio_rate6h) > (6 * 0.005)
          )
        for: 15m
        labels:
          severity: warning
          team: checkout
        annotations:
          summary: "Checkout SLO: burn rate elevado (6×)"

      # P3: Burn rate 3× — degradação lenta (só janela longa)
      - alert: CheckoutSLOBurnRateSlow
        expr: |
          (1 - job:slo_checkout_success_rate:ratio_rate3d) > (3 * 0.005)
        for: 1h
        labels:
          severity: warning
          team: checkout
        annotations:
          summary: "Checkout SLO: degradação silenciosa nos últimos 3 dias"`}</CodeBlock>
      </Section>

      <Section title="SLO vs uptime puro: por que 99.9% não é suficiente como alvo">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          "Uptime de 99.9%" (three-nines) parece ótimo mas disfarça problemas reais:
        </p>
        <ComparisonTable
          headers={['Uptime', 'Downtime por mês', 'Downtime por ano', 'Adequado para']}
          rows={[
            ['99%', '7h 18min', '3d 15h', 'Sites internos, ferramentas não-críticas'],
            ['99.5%', '3h 39min', '1d 19h', 'APIs com baixa criticidade de negócio'],
            ['99.9%', '43 min', '8h 45min', 'APIs de produção consumer-grade'],
            ['99.95%', '21 min', '4h 22min', 'Plataformas B2B com SLA financeiro'],
            ['99.99%', '4 min', '52 min', 'Serviços de pagamento, infraestrutura crítica'],
            ['99.999%', '26 seg', '5 min', 'Telecoms, sistemas de segurança — requer arquitetura especial'],
          ]}
        />
        <Callout tone="warn">
          <strong>Cuidado com SLOs "aspiracionais":</strong> SLO de 99.99% para um serviço que tem
          deploy manual semanal e sem canary releases é impossível de manter. Um deploy ruim já come
          4 minutos do budget anual. SLO deve refletir a arquitetura real — não o desejo. Comece
          conservador (99.5%) e aperte conforme a maturidade aumenta.
        </Callout>
      </Section>

      <Section title="Toil budget: o outro lado do SRE">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          <strong>Toil</strong> (do inglês "lida") é o trabalho manual, repetitivo, tático que não tem
          valor de engenharia duradouro. A regra do SRE: máximo 50% do tempo de trabalho.
        </p>
        <ComparisonTable
          headers={['É Toil', 'NÃO é Toil']}
          rows={[
            ['Restart manual de serviço após crash', 'Criar runbook automatizado para o crash'],
            ['Aprovar manualmente deploys um a um', 'Implementar pipeline de deploy automático com canary'],
            ['Responder alertas de disco cheio ad hoc', 'Implementar auto-scaling ou limpeza automática de logs'],
            ['Atualizar configurações em 20 servidores manualmente', 'Criar playbook Ansible/Terraform para a mudança'],
            ['Resetar senha de usuário toda semana via ticket', 'Implementar self-service de reset de senha'],
          ]}
        />
        <DecisionBox
          scenario="Time de SRE gasta 70% do tempo respondendo alertas e fazendo tarefas manuais recorrentes"
          winner="Toil reduction project + freeze em novas features de confiabilidade"
          winnerColor={ACCENT}
          why="Com 70% em toil, o time não tem capacidade para automação. O ciclo vicioso: mais toil → menos automação → mais toil. Quebrar o ciclo requer alocar Sprint completo para eliminar as 3-5 maiores fontes de toil com automação (runbooks automatizados, auto-healing, alertas melhores)."
          alternatives={[
            { label: 'Contratar mais SREs', when: 'Pode escalar a curto prazo mas não resolve o problema estrutural — mais SREs = mais toil sem automação' },
            { label: 'Delegar toil para times de dev', when: 'Distribui o problema mas não o elimina — desenvolvedores também têm tempo limitado' },
            { label: 'Aceitar o toil como custo', when: 'Anti-pattern absoluto — aumenta burnout e rotatividade de engenheiros de SRE' },
          ]}
        />
      </Section>

      <Section title="Error budget policy: o contrato entre produto e SRE">
        <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
          Uma política de error budget documenta o que acontece quando o budget é consumido. Sem uma
          política escrita, a decisão de pausar features vs continuar é sempre política — não dados.
        </p>
        <CodeBlock lang="markdown">{`# Error Budget Policy — Checkout Service
Documento: v1.2 | Owner: SRE Platform | Aprovado: 2024-01-10

## SLO
- Availability: ≥ 99.5% em janela rolling de 30 dias
- Latência P95: ≤ 500ms em janela rolling de 30 dias

## Estados do Error Budget

### 🟢 Verde (> 50% budget restante)
- Time pode lançar features normalmente
- Deploy a qualquer momento dentro da janela de mudança (Ter-Qui 10h-16h)
- Post-deployment monitoring: 30 min

### 🟡 Amarelo (10-50% budget restante)
- Deploy limitado: máximo 1 feature/semana
- Código de alto risco (mudança de DB, integração externa) requer revisão adicional
- SRE co-aprova PRs de infra
- Post-deployment monitoring: 2h com rollback automático disponível

### 🔴 Vermelho (< 10% budget restante)
- Feature freeze: ZERO novos deploys de features
- Apenas hotfixes de confiabilidade e segurança crítica
- Daily standup inclui SRE lead obrigatoriamente
- Time de produto notificado e impacto comunicado em roadmap
- Revisão de causa raiz obrigatória antes de retornar ao amarelo

### 🚨 Budget esgotado (0%)
- Freeze total: apenas rollbacks e hotfixes de segurança P0
- Post-mortem obrigatório em 48h
- Plano de ação com milestones em 7 dias
- Escalonamento para VP Engineering se não resolver em 14 dias

## Exceções
- Patches de segurança crítica (CVE CVSS ≥ 9.0): sempre permitidos
- Releases regulatórios (compliance, LGPD): aprovação explícita de VP Eng + CTO`}</CodeBlock>
      </Section>

      <Section title="Grafana: dashboard de SLO">
        <CodeBlock lang="yaml">{`# Grafana dashboard: SLO tracker (JSON model resumido)
# Panels principais para um dashboard de SLO:

panels:
  # 1. SLO Gauge — "Estamos dentro do SLO?"
  - title: "SLO Compliance (30d)"
    type: gauge
    query: |
      sum(increase(http_requests_total{job="checkout",status!~"5.."}[30d]))
      /
      sum(increase(http_requests_total{job="checkout"}[30d]))
    thresholds: [0.995: green, 0.99: yellow, 0: red]

  # 2. Error Budget Remaining
  - title: "Error Budget Restante"
    type: stat
    query: |
      (
        sum(increase(http_requests_total{job="checkout",status!~"5.."}[30d]))
        /
        sum(increase(http_requests_total{job="checkout"}[30d]))
        - 0.995
      ) / 0.005 * 100
    unit: percent

  # 3. Burn Rate (1h)
  - title: "Burn Rate (1h)"
    type: timeseries
    query: |
      (1 - job:slo_checkout_success_rate:ratio_rate1h) / 0.005
    alert_threshold: 14.4

  # 4. Error rate breakdown por status code
  - title: "Errors por Status Code"
    type: timeseries
    query: |
      sum by(status_code) (
        rate(http_requests_total{job="checkout",status=~"5.."}[5m])
      )`}</CodeBlock>
      </Section>

      <Section title="Q&A — perguntas típicas de entrevista SRE">
        <div className="flex flex-col gap-4">
          {[
            {
              q: 'Como você explica error budget para um gerente de produto que quer lançar uma feature urgente com o budget quase esgotado?',
              a: 'O error budget é como crédito: quando acabar, qualquer deploy de feature aumenta o risco de uma nova falha que violará o SLA com penalidades financeiras. Lançar com budget quase esgotado é como dirigir com pneu furado — pode funcionar, mas o próximo problema vira crise. Proposta concreta: lançar via feature flag para 1% dos usuários (canary), monitorar por 24h, e só expandir se o budget não cair. Isso fecha a urgência do produto sem arriscar o SLA.',
            },
            {
              q: 'Qual é a janela ideal para um SLO — semanal, mensal ou trimestral?',
              a: '30 dias rolling é o padrão do mercado. Janelas muito curtas (7d) tornam o budget muito sensível a um único incidente. Janelas muito longas (90d) demoram para dar sinal. Rolling window é melhor que janela fixa (Janeiro 1–31) porque evita comportamentos perversos no final do mês onde times correm para recuperar budget antes do reset.',
            },
            {
              q: 'Como lidar com SLO de serviço que depende de terceiro (AWS, Stripe)?',
              a: 'Separar o SLI: medir separadamente a taxa de falhas atribuível ao serviço próprio vs ao terceiro. Adicionar timeout + circuit breaker (módulo anterior). Excluir do error budget eventos de force majeure documentados (outage de cloud, falha de backbone de rede) — mas isso deve estar explícito na error budget policy, não ser decidido ad hoc. Nunca definir SLO mais alto que o SLA do fornecedor crítico.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-lg p-4" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>P: {q}</p>
              <p className="text-sm leading-7" style={{ color: 'var(--ffv-muted)' }}>R: {a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>SLI = o que medir. SLO = alvo interno. SLA = contrato com penalidade. Sempre: SLA &lt; SLO &lt; 100%.</li>
          <li>Error budget transforma confiabilidade em decisão de negócio objetiva — sem política, é sempre briga política.</li>
          <li>Alertas simples de "% de erros" falham: disparam em spikes curtos e ignoram degradação silenciosa. Use multi-window multi-burn rate.</li>
          <li>Burn rate 14.4× esgota budget de 30d em 2 dias → P1. Burn rate 3× esgota em 10d → investigação assíncrona.</li>
          <li>Toil &gt; 50% do tempo = time não consegue criar automação = ciclo vicioso. Projetos de redução de toil têm ROI direto em confiabilidade.</li>
          <li>SLO deve refletir a arquitetura real, não aspirações. Comece conservador e aperte com maturidade.</li>
        </ul>
      </Callout>
    </div>
  );
}
