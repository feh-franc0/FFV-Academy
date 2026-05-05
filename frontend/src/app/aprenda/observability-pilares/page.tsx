import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  StackFlow,
  NodeGraph,
  InlineCode,
} from '@/components/article/primitives';

const ACCENT = '#79c0ff';

export const metadata = getModuleMetadata('observability-pilares');

const quiz = [
  {
    question:
      'A diferença fundamental entre "monitoring" e "observability" é:',
    options: [
      'Monitoring é mais caro que observability',
      'Monitoring responde perguntas que você previu; observability te permite responder perguntas que você nunca pensou em fazer',
      'Observability só funciona em microserviços',
      'Monitoring usa Prometheus; observability usa Grafana',
    ],
    correct: 1,
    explanation:
      'Monitoring clássico = dashboards com métricas pré-definidas (CPU, latência p99, error rate). Observability (termo da teoria de controle) = capacidade de inferir o estado interno do sistema a partir das saídas. Com logs/traces de alta cardinalidade, você pode decompor qualquer métrica por qualquer dimensão ad-hoc, respondendo perguntas novas sem código novo.',
  },
  {
    question:
      'Cardinalidade alta em uma métrica é:',
    options: [
      'Sempre desejável — mais dimensões = melhor',
      'Caro em TSDBs tradicionais (Prometheus) porque cada combinação única de labels cria uma série temporal separada',
      'Exclusivo de logs, não afeta métricas',
      'Um bug que deve ser evitado a todo custo',
    ],
    correct: 1,
    explanation:
      'Cardinalidade = número de combinações únicas de labels. Ex: "http_requests_total" com labels {method, path, status, user_id} — se user_id tem 1M valores, você tem 1M+ séries só pra isso. Prometheus fica lento, storage explode. Soluções: agregação (sem user_id), event-based tools (Honeycomb, Grafana Tempo) ou TSDBs modernos (VictoriaMetrics, Mimir).',
  },
  {
    question:
      'Por que eventos ("wide events") são às vezes chamados de "4º pilar" da observability?',
    options: [
      'Porque são maiores que logs',
      'Porque carregam contexto multidimensional (dezenas de campos por evento) que permite análise ad-hoc sem pré-agregar em métricas',
      'Porque substituem completamente métricas',
      'Porque são armazenados em JSON',
    ],
    correct: 1,
    explanation:
      'Wide events (Honeycomb, Datadog CI Visibility) são logs estruturados com alta cardinalidade (30-100+ fields) — você pode decompor latência por endpoint E user_id E region E feature_flag simultaneamente sem pré-agregar. Métricas são lossy (agregadas); traces são individuais; wide events ficam no meio, preservando contexto.',
  },
  {
    question:
      'Continuous profiling (Pyroscope, Parca, Grafana Profiles) mede:',
    options: [
      'Taxa de requisições',
      'Consumo de CPU e memória por linha de código/função continuamente em produção, com baixo overhead',
      'Tempo de resposta do DB',
      'Apenas heap dumps quando a app crasha',
    ],
    correct: 1,
    explanation:
      'Continuous profiling = profile sampling em produção (tipicamente 1-3% overhead via eBPF ou instrumentação). Mostra onde CPU/memória é gasto, por função, ao longo do tempo. Permite responder "por que essa query ficou lenta?" ou "onde está vazando memória?" sem subir ambiente de dev. É considerado o 5º pilar, depois de logs/metrics/traces/events.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="observability-pilares"
      title="Observability: os 3 pilares (logs, métricas, traces) e por que não basta"
      icon="🔍"
      xp={75}
      readTime={15}
      trailName="Observabilidade & SRE"
      trailColor={ACCENT}
      nextSlug="metricas-red-use"
      nextTitle="Métricas RED e USE: os frameworks que cobrem 90% dos casos"
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
        Toda empresa acha que tem "monitoring". Poucas têm <strong>observability</strong>. A
        diferença aparece no pior momento: 3 da manhã, alerta disparado, dashboard verde, mas
        os usuários falam que algo está quebrado. Monitoring te diz "o que foi quebrou?" somente
        se você pensou antes em medir essa coisa. Observability te deixa <em>fazer perguntas
        novas</em> sobre o sistema em tempo real.
      </p>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Este módulo abre a trilha de observabilidade com os conceitos-chave: <strong>os 3 pilares</strong>
        clássicos (logs, métricas, traces), por que essa separação está mudando, o conceito de
        <strong> cardinalidade</strong> (e por que ela é cara), <strong>events</strong> como 4º pilar,
        e <strong>continuous profiling</strong> como 5º. Sem hype — o que efetivamente você deve
        ter no seu stack em 2026.
      </p>

      <Section title="Monitoring vs Observability: a mudança conceitual" accent={ACCENT}>
        <p>
          Monitoring é velho — vem dos anos 90, de sistemas monolíticos onde o operador sabia
          exatamente o que podia dar errado (disk cheio, CPU em 100%, serviço caiu). Você
          configurava alertas pra esses N cenários e pronto.
        </p>
        <p>
          Observability (conceito da teoria de controle, Kalman 1960) começou a ser importada pra
          software em ~2017 (Honeycomb, Charity Majors). A tese: sistemas distribuídos modernos
          têm <strong>muito mais estados possíveis</strong> do que qualquer engenheiro consegue antecipar.
          Em vez de alertar sobre N coisas conhecidas, você instrumenta tudo o suficiente pra
          <em> descobrir</em> o que deu errado.
        </p>

        <ComparisonTable
          headers={['Dimensão', 'Monitoring', 'Observability']}
          rows={[
            ['Perguntas', 'As que você previu', 'Qualquer pergunta ad-hoc'],
            ['Dashboards', 'Fixos, por dashboard', 'Exploratórios, drill-down livre'],
            ['Cardinalidade', 'Baixa (agregada)', 'Alta (contexto preservado)'],
            ['Alertas', 'Baseados em thresholds absolutos', 'Baseados em SLO burn rates'],
            ['Debugging', 'Grep em logs', 'Decompor evento por dimensão'],
            ['Ferramentas típicas', 'Nagios, Zabbix, Prom', 'Honeycomb, Datadog, Tempo'],
          ]}
        />

        <Callout tone="info">
          <strong>Frase canônica</strong>: "Monitoring is for known unknowns; observability is for
          unknown unknowns." — Charity Majors. Sistemas distribuídos modernos falham de formas
          que ninguém previu no dia do deploy.
        </Callout>
      </Section>

      <Section title="Os 3 pilares clássicos" accent={ACCENT}>
        <StackFlow
          items={[
            { label: 'Logs', sub: '"o que aconteceu" — evento textual/JSON por linha' },
            { label: 'Metrics', sub: '"quanto" — números agregados no tempo: rate, latência, count' },
            { label: 'Traces', sub: '"como" — path de uma request atravessando N serviços' },
          ]}
        />

        <ComparisonTable
          headers={['Pilar', 'Granularidade', 'Uso típico', 'Custo']}
          rows={[
            [
              'Metrics',
              'Agregado (contadores, histogramas)',
              'Dashboards, alertas, SLOs',
              'Barato — timeseries compactas',
            ],
            [
              'Logs',
              'Por evento (texto/JSON)',
              'Debugging detalhado, audit, forensics',
              'Alto — volume cresce com tráfego',
            ],
            [
              'Traces',
              'Por request (span tree)',
              'Entender latência distribuída, root cause em microserviços',
              'Médio — com sampling',
            ],
          ]}
        />

        <p><strong>Exemplo: mesmo incidente visto pelos 3 pilares</strong>.</p>

        <NodeGraph
          columns={[
            {
              label: 'Métricas (Prometheus)',
              nodes: [
                { label: 'p99 checkout = 4.2s', sub: 'era 200ms ontem → anomalia clara' },
                { label: 'Pergunta não respondida', sub: '"por quê?" — métricas não sabem' },
              ],
            },
            {
              label: 'Logs (JSON)',
              nodes: [
                { label: 'slow query warn', sub: 'SELECT * FROM carts · dur_ms: 3800' },
                { label: 'Hipótese', sub: 'query lenta — mas qual cart? Quantos afetados?' },
              ],
            },
            {
              label: 'Traces (Jaeger)',
              nodes: [
                { label: 'POST /checkout (4.1s)', sub: '' },
                { label: 'CartService.getCart (3.8s)', sub: '← gargalo!' },
                { label: 'db.query (3.7s)', sub: 'cart_items_join → conclusão: N+1 no join' },
              ],
            },
          ]}
        />

        <p>
          Os 3 pilares são complementares. Sozinhos, cada um é limitado. Juntos, permitem ir do
          "algo está lento" pro "essa query específica, nesse código, nesse deploy" em minutos.
        </p>
      </Section>

      <Section title="Cardinalidade: o imposto oculto" accent={ACCENT}>
        <p>
          Cardinalidade de uma métrica = número de combinações únicas de labels. Em Prometheus e
          similares, <strong>cada combinação é uma série temporal separada</strong> — com seu
          próprio buffer, índice e retenção.
        </p>
        <CodeBlock lang="text">{`# baixa cardinalidade — ok
http_requests_total{method="GET", status="200"} 12345
http_requests_total{method="POST", status="500"} 42
# ~ 6 métodos × 10 status = 60 séries, ok

# alta cardinalidade — PERIGO
http_requests_total{method, status, path, user_id} 1
# 5 métodos × 10 status × 500 paths × 1_000_000 user_ids = 25 bilhões de séries
# Prometheus capota. Latência de query em minutos.`}</CodeBlock>
        <p><strong>Regras práticas pra labels de métricas</strong>:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Nunca use</strong>: user_id, email, session_id, trace_id, uuid, timestamp, URL completa com query params</li>
          <li><strong>OK</strong>: enum-like (method, status, region), low-cardinality features (tier: free/pro/ent, os: ios/android)</li>
          <li><strong>Máximo</strong>: 10-50k séries únicas por métrica em Prometheus</li>
          <li><strong>Se precisa alta cardinalidade</strong>: use events/traces (não métricas) ou TSDB moderno (VictoriaMetrics, Mimir, Cortex)</li>
        </ul>

        <Callout tone="danger">
          <strong>"Cardinality explosion" é o bug mais comum de observability</strong>. Dev adiciona
          label <InlineCode>request_id</InlineCode> numa métrica ("seria legal ver por request"),
          deploy vai, 3h depois Prometheus OOMs. Investigue queries pesadas com
          <InlineCode>{'topk(10, count by (__name__) ({__name__=~".+"}))'}</InlineCode>.
        </Callout>
      </Section>

      <Section title="Events: o 4º pilar (wide events, high cardinality)" accent={ACCENT}>
        <p>
          Metrics são lossy (agregadas). Logs são textuais (difíceis de consultar estruturado). Traces
          são hierárquicos (bom pra latência). <strong>Wide events</strong> ficam no meio: cada
          request gera <em>um evento JSON</em> com 30-100 fields — user, tenant, version, region,
          cache hit, status, latency, feature flags, db stats, etc.
        </p>

        <CodeBlock lang="json">{`// um wide event por request (exemplo Honeycomb-style)
{
  "timestamp": "2026-04-16T14:23:45.123Z",
  "service": "checkout-api",
  "version": "v2.3.1-a4f8",
  "env": "production",
  "region": "us-east-1",
  "endpoint": "POST /checkout",
  "status": 200,
  "duration_ms": 423,
  "user_id": "u_42",
  "user_tier": "pro",
  "tenant_id": "acme-corp",
  "feature_flag.new_payment_flow": true,
  "feature_flag.cdn_enabled": false,
  "cart_items_count": 12,
  "cart_total_cents": 15000,
  "db.query_count": 5,
  "db.cache_hit_ratio": 0.8,
  "trace_id": "abc123...",
  "request_id": "req_xyz"
}`}</CodeBlock>

        <p>
          Com wide events, em 1 minuto no dashboard você pode: "mostre latência p99 por region E
          feature_flag.new_payment_flow E user_tier". Sem pré-agregação, sem dashboards pré-configurados.
          Honeycomb e Datadog (Continuous Profiler + RUM) são lideres; ferramentas open-source
          crescendo (Grafana Tempo aceita span events, ClickHouse + Vector é stack DIY popular).
        </p>

        <Callout tone="info">
          <strong>"Wide events are all you need"</strong>: artigo polêmico da Charity Majors (2024)
          argumenta que com wide events + ferramenta de query decente, você pode derivar métricas,
          replicar traces, e substitui 80% dos dashboards tradicionais. Extremo, mas reflete o movimento:
          cardinalidade alta + query flexível {'>'} N sistemas separados.
        </Callout>
      </Section>

      <Section title="Continuous profiling: o 5º pilar" accent={ACCENT}>
        <p>
          Profiling tradicional: você liga em ambiente de staging, roda carga, analisa offline.
          Problema: bugs de performance em produção raramente reproduzem fora dela. Continuous
          profiling roda <em>em produção</em> com overhead &lt;3% (via eBPF, instrumentação em runtime),
          gerando flamegraphs sempre disponíveis.
        </p>

        <StackFlow
          items={[
            { label: '100% CPU — root', sub: 'processo inteiro' },
            { label: '65% — checkout_handler', sub: 'maior consumidor' },
            { label: '42% — getCartItems', sub: 'função chamada dentro do handler' },
            { label: '28% — db.query', sub: 'N+1 detectado!' },
            { label: '13% — paymentClient.charge', sub: '' },
            { label: '8% — json.serialize', sub: '' },
            { label: '25% — rateLimiter.check', sub: 'chamado fora do handler' },
          ]}
        />

        <ComparisonTable
          headers={['Ferramenta', 'Tech', 'Uso']}
          rows={[
            ['Pyroscope (Grafana)', 'eBPF + agents', 'Open-source, multi-lang, integrado com Grafana'],
            ['Parca', 'eBPF puro', 'Open-source, foco em infra estilo K8s'],
            ['Datadog Continuous Profiler', 'Agent proprietário', 'Enterprise, deep integration com APM'],
            ['Google Cloud Profiler', 'SDK por language', 'Low-overhead, GCP native'],
            ['Polar Signals', 'Parca commercial', 'Empresa por trás do Parca'],
          ]}
        />

        <Callout tone="warn">
          <strong>Quando vale a pena</strong>: sua app tem bottlenecks intermitentes que não reproduzem
          em dev/staging. Traces mostram "db.query took 3s" mas você não sabe qual query. Com
          profiler, você vê o stack completo naquele momento.
        </Callout>
      </Section>

      <Section title="O que montar em 2026: stack mínimo" accent={ACCENT}>
        <ComparisonTable
          headers={['Pilar', 'Open-source', 'Managed']}
          rows={[
            ['Metrics', 'Prometheus + Grafana', 'Datadog, New Relic, Honeycomb, Chronosphere, Grafana Cloud'],
            ['Logs', 'Loki, ELK stack, Vector + ClickHouse', 'Datadog Logs, Elastic Cloud, Grafana Cloud Logs'],
            ['Traces', 'Tempo, Jaeger, Zipkin (legacy)', 'Honeycomb, Datadog APM, Lightstep'],
            ['Events', 'ClickHouse + Vector + Grafana', 'Honeycomb (pioneer), Datadog CI, Axiom'],
            ['Profiling', 'Pyroscope, Parca', 'Datadog, Polar Signals, GCP'],
            ['Instrumentação', 'OpenTelemetry SDK + Collector', '(mesma, padrão do mercado)'],
          ]}
        />

        <Callout tone="info">
          <strong>Escolha de 2026</strong>: se você está começando, <strong>OpenTelemetry</strong> pra
          instrumentar (SDK unificado, export pra qualquer backend) + um dos "3 caminhos":
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><strong>Grafana LGTM stack</strong> (Loki + Grafana + Tempo + Mimir) — open-source, self-host ou Grafana Cloud</li>
            <li><strong>Datadog</strong> — plug-and-play, caro mas completo</li>
            <li><strong>Honeycomb</strong> — aposta forte em events/cardinalidade, menos dashboards tradicionais</li>
          </ol>
        </Callout>
      </Section>

      <Section title="Custo: observability é cara (atente-se)" accent={ACCENT}>
        <p>
          O maior trauma operacional pós-K8s é a <strong>fatura do Datadog</strong>. Alguns padrões
          pra não quebrar:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Sampling em traces</strong>: 1-10% em produção, 100% em staging. Rejeite spans de health checks.</li>
          <li><strong>Log levels apropriados</strong>: DEBUG nunca em prod. INFO moderado. Truncar fields gigantes.</li>
          <li><strong>Retention tiered</strong>: hot 7d, warm 30d, cold S3 90d+. Datadog permite; self-host precisa configurar.</li>
          <li><strong>Cardinalidade cap</strong>: Prometheus <InlineCode>label_limit</InlineCode>, Grafana Mimir limits per tenant.</li>
          <li><strong>Drop filtering</strong>: OTel Collector processor pra dropar spans/logs irrelevantes antes do backend.</li>
          <li><strong>Derived metrics</strong>: extrair métricas de logs (se é a <em>mesma info</em>, não duplique).</li>
        </ul>

        <Callout tone="danger">
          <strong>Regra prática</strong>: monitore o <em>custo do monitoring</em>. Dashboard com
          fatura mensal por pilar, alerta se passar do budget. Já teve startup que gastou mais em
          Datadog que em AWS compute.
        </Callout>
      </Section>

      <Section title="Decisões reais" accent={ACCENT}>
        <DecisionBox
          scenario="Empresa small/mid começando do zero, equipe de 5-20 devs"
          winner="OpenTelemetry SDK + Grafana Cloud (LGTM) free tier"
          winnerColor={ACCENT}
          why="OTel te dá portabilidade — pode trocar backend sem recódigo. Grafana Cloud free tier é generoso (10k active series, 50GB logs/mês) pra começar. Quando escalar, upgrade ou self-host LGTM."
          alternatives={[
            { label: 'Datadog', note: 'Menor curva mas cara fácil: 5k/mês sobe rápido.' },
            { label: 'Honeycomb', note: 'Ótima se foco em events/debugging distribuído.' },
          ]}
        />
        <DecisionBox
          scenario="Enterprise com compliance pesado, workloads sensíveis"
          winner="Self-host LGTM ou ELK + Jaeger, com access control granular"
          winnerColor={ACCENT}
          why="Data sensível não sai da nuvem. LGTM (ou ELK legacy) dá controle total. Custo operacional é alto — precisa de time dedicado. Mas é o único caminho pra workloads regulados (banking, health, defesa)."
          alternatives={[
            { label: 'Datadog com private cloud', note: 'Existe mas caro e ainda compartilhado.' },
          ]}
        />
        <DecisionBox
          scenario="App tem bottlenecks que só aparecem em produção com carga real"
          winner="Continuous profiling (Pyroscope ou Datadog Profiler)"
          winnerColor={ACCENT}
          why="Traces mostram 'db.query took 3s' mas não qual função chamou. Profiler mostra o stack completo com flamegraph. &lt;3% overhead é negligível comparado ao tempo de debug economizado."
          alternatives={[
            { label: 'pprof manual', note: 'Funciona mas é evento pontual, não contínuo.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <div className="flex flex-col gap-4">
          <div>
            <p><strong>Preciso dos 3 pilares desde o dia 1?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Sim, mas na ordem: métricas pra SLOs e alertas (sem isso não sabe se app tá viva),
              logs estruturados desde sempre (JSON com correlation id), traces quando tiver mais
              de 2 serviços. Profiling quando problemas ficam sutis.
            </p>
          </div>
          <div>
            <p><strong>OpenTelemetry é mandatório?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Se começa novo em 2026: sim, é o padrão da CNCF. Auto-instrumentação pra maioria
              das libs existe. Permite trocar backend sem tocar código. Legado: considere migração
              gradual via OTel Collector que aceita formatos antigos.
            </p>
          </div>
          <div>
            <p><strong>High cardinality sempre é problema?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Em <em>métricas</em> tradicionais (Prometheus), sim. Em eventos/traces, é o que
              dá poder — você quer contexto rico. A distinção é crucial: não meta user_id em
              Prometheus metric, mas meta sim em todo span/evento.
            </p>
          </div>
          <div>
            <p><strong>Logs ainda importam ou só eventos?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Logs estruturados <em>são</em> eventos. A distinção antiga (logs = text file) virou
              histórica. JSON logs com os fields certos = events. A indústria tá convergindo —
              OTel Logs é basicamente "wide event" padronizado.
            </p>
          </div>
          <div>
            <p><strong>Como testar observability em pre-prod?</strong></p>
            <p style={{ color: 'var(--ffv-muted)' }}>
              Injete falhas intencionalmente (Chaos Engineering: Gremlin, Litmus). Se você simula
              disco cheio, DB lento, pod mort — todas as dimensões do dashboard devem acender. Se
              algo passa despercebido, falta instrumentação ou alerta.
            </p>
          </div>
        </div>
      </Section>

      <Callout tone="success">
        <strong>Take-aways</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Observability &gt; Monitoring</strong>: não só "alertas conhecidos", mas capacidade de responder perguntas novas.</li>
          <li>Os <strong>3 pilares</strong> (logs, metrics, traces) são complementares — nenhum sozinho basta.</li>
          <li><strong>Cardinalidade</strong> é o pecado oculto: meta rica em eventos/traces, parcimoniosa em métricas clássicas.</li>
          <li><strong>Wide events</strong> (4º pilar): logs estruturados com 30-100 fields permitem drill-down sem pré-agregar.</li>
          <li><strong>Continuous profiling</strong> (5º): CPU/heap em produção, baixo overhead, explica "onde o tempo vai".</li>
          <li>Stack 2026: <strong>OpenTelemetry SDK</strong> + Collector + backend (Grafana LGTM / Datadog / Honeycomb).</li>
          <li>Observability é cara — monitor a fatura. Sampling, tiered retention, cardinality limits.</li>
        </ul>
      </Callout>

      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Próximo módulo: os frameworks que te dizem <em>o que medir</em> — RED e USE.
      </p>
    </div>
  );
}
