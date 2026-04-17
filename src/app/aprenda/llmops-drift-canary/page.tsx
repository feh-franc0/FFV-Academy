import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  ArchDiagram,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'LLMOps: eval harness, drift detection e canary de prompts — FFV Academy',
  description:
    'LLMOps profissional: eval harness (promptfoo, LangSmith, custom), regressão de prompt, canary/A-B de prompts, drift detection, cost attribution e SLO de qualidade.',
};

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que LLMOps não é só MLOps rebatizado?',
    options: [
      'É só uma palavra nova',
      'Porque LLMs não são treinados por você (na maioria dos casos) — o modelo é external dependency que muda silenciosamente. Artefatos a versionar são prompts, schemas, tools, eval datasets e rags. Drift vem do provider (novo snapshot), do dado (distribuição de queries) e do prompt (mudança interna). MLOps clássico versiona modelos; LLMOps versiona a cadeia de instruções ao redor de modelos de terceiros',
      'Por exigir GPU',
      'Porque é só marketing',
    ],
    correct: 1,
    explanation:
      'MLOps assume que você treina/serve o modelo. Em LLMOps, o modelo é SaaS; você controla o prompt, os tools, o retrieval, o pós-processamento. Os artefatos versionados mudam: versão do system prompt, hash do golden set, revisão dos embedders, schema das tools. Drift tem fontes novas — o provider pode ajustar o modelo sem avisar. O playbook é diferente.',
  },
  {
    question: 'Qual a diferença entre eval offline e monitoring online?',
    options: [
      'São iguais',
      'Eval offline roda antes do deploy contra golden set curado e compara com baseline (bloqueante em CI). Monitoring online coleta sinal em produção (thumbs, copy-rate, tempo até refinamento) e detecta degradação real de usuário, com lag. Os dois são necessários — offline pega regressão conhecida, online pega drift do mundo real',
      'Só offline importa',
      'Só online importa',
    ],
    correct: 1,
    explanation:
      'Offline: "meu pipeline ficou pior numa amostra conhecida?" — rápido, reproduzível, bloqueia deploy ruim. Online: "usuários estão satisfeitos?" — lag, ruído, mas captura cenários não previstos. Produto maduro tem os dois, com feedback online alimentando novas entradas no golden set offline.',
  },
  {
    question: 'Como fazer canary de prompt sem quebrar usuários?',
    options: [
      'Deploy direto em 100%',
      'Rotear 1-10% de tráfego para o novo prompt (canary), comparar métricas (latência, custo, quality scores online, taxa de refinamento) com grupo controle. Se OK por 24-72h, aumentar para 50% e depois 100%. Se degradar em qualquer eixo, rollback automático (sticky assignment para consistência por usuário)',
      'Mudar só em dev',
      'Fazer A/B mas não medir',
    ],
    correct: 1,
    explanation:
      'Canary de prompt é idêntico a canary de código: tráfego gradual, métricas comparadas com controle, rollback automático. Sticky assignment (mesmo usuário sempre no mesmo grupo durante teste) evita inconsistência percebida. Decisão baseada em score agregado (ex: quality score + custo + latência + satisfação) — não em métrica única.',
  },
  {
    question: 'O que mais causa drift de qualidade em LLM produtivo, em 2026?',
    options: [
      'Quebra do LLM em si',
      'Provider lançar novo snapshot/default do modelo sem aviso explícito, distribuição de queries mudando (novas features, sazonalidade, novos segmentos de usuários) e RAG ficando obsoleto (base não reindexada). Três causas diferentes que exigem sensores diferentes — pinar versão do modelo, monitorar distribuição de queries, agendar re-indexação',
      'Só bugs no prompt',
      'Latência de rede',
    ],
    correct: 1,
    explanation:
      'Pinar modelo por snapshot explícito (ex: claude-sonnet-4-6 em vez de "latest") é obrigatório — aliases mudam. Distribuição de queries muda com lançamentos e sazonalidade; monitore tamanho médio, categorias, tópicos. RAG degrada sem reindexação quando conteúdo muda. Os três vão em dashboards separados; alert quando cada um sai do baseline.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="llmops-drift-canary"
      title="LLMOps: eval harness, drift detection e canary de prompts"
      icon="📈"
      xp={90}
      readTime={18}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        LLMOps é o que separa "demo de IA" de "sistema AI-native em produção". Este módulo fecha a trilha juntando os
        ingredientes operacionais: <strong>eval harness</strong> bloqueando deploy ruim, <strong>canary de
        prompts</strong>, <strong>drift detection</strong> (modelo, dado, RAG), <strong>cost attribution</strong> e
        <strong> SLO de qualidade</strong>. Como saber que o pipeline continua entregando.
      </p>

      <Section title="LLMOps ≠ MLOps: o que muda" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'MLOps clássico', 'LLMOps']}
          rows={[
            ['Artefato versionado', 'Pesos do modelo', 'Prompts, tools, RAG config, eval sets'],
            ['Quem treina', 'Você', 'Provider (Anthropic/OpenAI/Google)'],
            ['Origem de drift', 'Dado ou pipeline', 'Provider muda snapshot, dado muda, prompt muda'],
            ['Eval', 'Test set estático', 'Eval harness com LLM-as-judge + métricas online'],
            ['Custo', 'Treino (capex) + inferência', 'Inferência variável + cache + batch'],
            ['Rollback', 'Voltar pesos antigos', 'Voltar prompt + pin de snapshot'],
          ]}
        />
        <Callout tone="info">
          Algumas dores são as mesmas (observability, deploy gradual, SLO), mas os <em>artefatos</em> diferem. Um PR
          que muda 3 linhas de system prompt é um "modelo novo" em LLMOps — merece eval e canary como qualquer
          release de modelo.
        </Callout>
      </Section>

      <Section title="Arquitetura de plataforma LLMOps" accent={ACCENT}>
        <ArchDiagram title="Stack mínima de LLMOps" accent={ACCENT}>{`
  ┌────────────────────────────────────────────────────┐
  │ PROMPT / CONFIG REGISTRY                           │
  │ Git + versionado: system, tools, rag_version       │
  └────────────────────┬───────────────────────────────┘
                       │ referência por hash
  ┌────────────────────▼───────────────────────────────┐
  │ EVAL HARNESS (CI)                                  │
  │ golden set (100-500) · retrieval + gen metrics     │
  │ bloqueia PR se regressão > threshold               │
  └────────────────────┬───────────────────────────────┘
                       │ passa → deploy
  ┌────────────────────▼───────────────────────────────┐
  │ CANARY ROUTER                                      │
  │ 1% → 10% → 50% → 100%    rollback automático       │
  └────────────────────┬───────────────────────────────┘
                       │
  ┌────────────────────▼───────────────────────────────┐
  │ OBSERVABILITY                                      │
  │ traces (Langfuse/LangSmith) · metrics (p50/p95,    │
  │ tokens, cost, cache ratio) · online signals        │
  └────────────────────┬───────────────────────────────┘
                       │ feedback → golden set
  ┌────────────────────▼───────────────────────────────┐
  │ DRIFT MONITORS                                     │
  │ modelo · distribuição de queries · RAG staleness   │
  └────────────────────────────────────────────────────┘
`}</ArchDiagram>
      </Section>

      <Section title="Prompt registry: versionar prompts como código" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Prompts devem viver em repo, revisados em PR, versionados por hash. Nunca edite prompt direto em dashboard
          "sem deploy" — reproduzibilidade é perdida.
        </p>
        <CodeBlock lang="python">{`# Estrutura simples
#   prompts/
#     extract_ticket/
#       v3.md          ← prompt em markdown com frontmatter YAML
#       v3.json        ← schema de input/output
#       v3.eval.jsonl  ← golden set opcional específico deste prompt
from pathlib import Path
import hashlib, yaml, json

class Prompt:
    def __init__(self, path: Path):
        text = path.read_text()
        if text.startswith("---"):
            meta_block, body = text.split("---", 2)[1:]
            self.meta = yaml.safe_load(meta_block)
        else:
            self.meta, body = {}, text
        self.body = body.strip()
        self.hash = hashlib.sha256(self.body.encode()).hexdigest()[:12]

    def format(self, **kwargs) -> str:
        return self.body.format(**kwargs)

# Uso
p = Prompt(Path("prompts/extract_ticket/v3.md"))
prompt_text = p.format(ticket=ticket_text)
# Log: prompt_hash=p.hash, version=p.meta.get("version"), model=p.meta.get("model")`}</CodeBlock>
      </Section>

      <Section title="Eval harness em CI: bloqueie PR ruim" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Coberto no módulo de RAG evaluation. Princípio operacional: <strong>golden set ≥ 100 itens</strong>,{' '}
          <strong>baseline committed no repo</strong>, <strong>CI compara current vs baseline</strong>,{' '}
          <strong>falha se regressão &gt; threshold</strong>.
        </p>
        <CodeBlock lang="yaml">{`# promptfoo é uma das opções prontas — config declarativa
prompts: [file://prompts/extract_ticket/v3.md]
providers:
  - id: anthropic:messages:claude-sonnet-4-6
    config: { temperature: 0 }

tests:
  - description: ticket simples
    vars: { ticket: "Meu cartão não passou na renovação" }
    assert:
      - type: javascript
        value: output.includes("billing") && output.includes("card_declined")
      - type: latency
        threshold: 3000
      - type: cost
        threshold: 0.01

defaultTest:
  assert:
    - type: llm-rubric
      value: A resposta deve ser JSON válido com campos category, urgency (1-5), summary.
      provider: openai:chat:gpt-4o-mini`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'Forte em', 'Fraco em']}
          rows={[
            ['promptfoo', 'Config declarativa, fácil CI, múltiplos providers', 'Golden set grande vira YAML gigante'],
            ['LangSmith (LangChain)', 'Traces + datasets integrados; UI rica', 'Ecosistema LangChain; pricing'],
            ['Langfuse (open-source)', 'Self-host, traces, datasets, scores', 'Menos batteries-included que LangSmith'],
            ['RAGAS', 'Métricas RAG canônicas em código', 'Menos infra de dataset e CI'],
            ['Custom (pytest + jsonl)', 'Máximo controle', 'Você reimplementa tudo'],
          ]}
        />
      </Section>

      <Section title="Canary de prompt: rollout gradual e automático" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Novo prompt entra em produção atendendo a uma fração de tráfego. Comparamos métricas com grupo de controle
          (prompt atual). Se degradação, rollback. Se OK, subimos o percentual.
        </p>
        <CodeBlock lang="python">{`# Rota simples com sticky assignment por user_id
import hashlib

def canary_prompt(user_id: str, percent: int, control_hash: str, canary_hash: str) -> str:
    bucket = int(hashlib.sha256(user_id.encode()).hexdigest(), 16) % 100
    return canary_hash if bucket < percent else control_hash

# Ao chamar LLM, log:
#   variant = "control" | "canary"
#   quality_score (estimado via eval online ou modelo judge)
#   cost_usd
#   latency_ms

# Regra de promoção (pseudo)
#   se canary_sample > 1000 E
#      quality_delta > -2pp E
#      cost_delta < +15% E
#      latency_p95_delta < +200ms:
#     promover percent +20 até 100
#   senão:
#     rollback para 0`}</CodeBlock>
        <DecisionBox
          scenario="Mudança de system prompt em endpoint de alto tráfego (customer support)"
          winner="Canary 1% → 10% → 50% → 100% em 48-72h com rollback automático"
          winnerColor={ACCENT}
          why="Mudança parece inofensiva mas pode quebrar edge cases invisíveis ao eval offline (ex: novas intents). Canary expõe gradualmente e rollback em minutos protege receita."
          alternatives={[
            { name: 'Deploy direto após eval offline', note: 'ok só em endpoints de baixo risco com eval forte' },
            { name: 'A/B 50/50 fixo', note: 'experimentação estatística; não é o mesmo que safety canary' },
          ]}
        />
      </Section>

      <Section title="Drift detection: o sinal que aparece antes do ticket" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Fonte de drift', 'Sensor', 'Alert']}
          rows={[
            ['Modelo (provider mudou)', 'Pin de snapshot (não usar "latest"); re-eval semanal contra golden', 'Diff de quality vs baseline > 3pp'],
            ['Query distribution', 'Distância (KL/PSI) entre vetores/tópicos de queries hoje vs semana passada', 'Distância acima de threshold'],
            ['RAG staleness', 'Data média dos chunks usados; hit ratio em novas queries', 'Hit ratio caindo ou data média muito antiga'],
            ['Tool drift', 'Taxa de tool_use errada ou validation error', 'Aumento súbito de tool errors'],
            ['Usuário refina muito', 'Taxa de follow-up/re-prompt em conversa', 'Sobe = qualidade caiu'],
            ['Custo por task', 'Tokens médios/query', 'Jump sugere loops ou context growth'],
          ]}
        />
        <CodeBlock lang="python">{`# Exemplo simples de drift por distribuição de tópicos (PSI)
import numpy as np

def psi(expected: np.ndarray, actual: np.ndarray, eps=1e-6) -> float:
    expected = np.clip(expected, eps, None); expected /= expected.sum()
    actual   = np.clip(actual,   eps, None); actual   /= actual.sum()
    return float(np.sum((actual - expected) * np.log(actual / expected)))

# Usa topic distribution (cluster de embeddings) em janela móvel
# PSI < 0.1 estável, 0.1-0.25 atenção, > 0.25 drift significativo`}</CodeBlock>
      </Section>

      <Section title="Cost attribution e FinOps de LLM" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Tag / label', 'Pra que serve']}
          rows={[
            ['endpoint / rota', 'endpoint=search_rag', 'Identificar endpoint caro'],
            ['feature / produto', 'feature=summarize_monthly', 'Quanto cada feature custa'],
            ['tenant / cliente', 'tenant=acme (se multi-tenant)', 'Chargeback ou ROI por cliente'],
            ['model', 'model=sonnet-4-6', 'Impacto de mudança de modelo'],
            ['prompt_hash', 'prompt_hash=ab12cd34', 'Correlacionar custo com versão de prompt'],
            ['variant', 'variant=canary', 'Comparar canary vs control'],
          ]}
        />
        <Callout tone="success">
          Com essas labels em logs/traces, você responde "feature X custou quanto por usuário em abril?" em um
          dashboard. Sem labels, fica "uma conta só" e FinOps vira brigar com o fornecedor.
        </Callout>
      </Section>

      <Section title="SLO de qualidade: o que prometer" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          SLO de LLM combina três famílias de métricas: <strong>qualidade</strong>, <strong>performance</strong>,
          <strong> custo</strong>. Cada uma com objetivo e janela clara. Exemplo para um assistente de suporte:
        </p>
        <ul className="flex flex-col gap-1 pl-5 list-disc" style={{ color: 'var(--ffv-muted)' }}>
          <li><strong>Qualidade:</strong> faithfulness ≥ 0.90 (LLM-as-judge, amostra diária de 50 conversas) em janela de 30 dias.</li>
          <li><strong>Qualidade online:</strong> thumbs-up rate ≥ 75% nas respostas avaliadas pelo usuário.</li>
          <li><strong>Latência:</strong> TTFT p95 ≤ 1200ms; total p95 ≤ 8s.</li>
          <li><strong>Custo:</strong> USD por conversa resolvida ≤ 0.05 (mediana mensal).</li>
          <li><strong>Disponibilidade:</strong> ≥ 99.5% (provider fail + retry transparente).</li>
        </ul>
        <Callout tone="info">
          SLO sem error budget é aspiracional. Defina budget mensal ("podemos ter até 1% abaixo do threshold"); quando
          consumir, congele deploys de prompt/config até restaurar.
        </Callout>
      </Section>

      <Section title="Incident playbook: o que fazer quando cai" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sintoma', 'Primeira ação', 'Investigação']}
          rows={[
            ['Quality score caiu em dashboard', 'Rollback do último prompt release', 'Diff de prompt, snapshot do modelo, composição de queries'],
            ['Custo pulou 2×', 'Verificar token/query por endpoint', 'Loops? Context growth? Cache invalidado?'],
            ['Latência estourou', 'Checar provider status; fallback para outro modelo/provider', 'Rate limit? Upstream? Streaming quebrou?'],
            ['Usuário reporta resposta errada', 'Pegar trace pelo request_id', 'Reprovar em golden set; adicionar caso ao set'],
            ['429 em massa', 'Ligar rate limiter local; considerar batch para jobs não-críticos', 'Subir quota no provider'],
          ]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Preciso mesmo pinar snapshot de modelo?"
          a={<>Sim. "claude-sonnet-4" (alias) pode passar para nova versão silenciosamente. "claude-sonnet-4-6" (snapshot) é estável até ser descontinuado com aviso. Canary de upgrade de snapshot é uma operação — não deixe a decisão com o alias.</>}
        />
        <QAItem
          q="Quando vale investir em plataforma LLMOps própria?"
          a={<>Quando você tem múltiplas features críticas de LLM (3+), múltiplos times mexendo em prompts, e gasta &gt;US$5k/mês em API. Antes disso, Langfuse self-host + promptfoo + um golden set bem curado cobre 80% pelo custo de uma tarde de setup.</>}
        />
        <QAItem
          q="LLM-as-judge em produção é confiável para alertar?"
          a={<>Para alertar, sim, desde que calibrado com humanos e com rubrica. Para acionar rollback automático sem humano no loop, recomendo calibração mais forte e combinação com sinal online (thumbs, refinement rate). Nunca confie em um juiz só para decisão crítica.</>}
        />
        <QAItem
          q="Como convenço o time a investir em eval harness antes de feature nova?"
          a={<>Com um incident. Meio sério: trace o último bug crítico em LLM, calcule o custo de MTTR, mostre que eval harness teria pegado antes. Se não tiver incident, faça um exercício: aplique eval em uma versão antiga de prompt — a chance de achar regressões esquecidas é altíssima.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> LLMOps versiona prompts/tools/configs, não pesos. Eval harness em CI bloqueia
        regressão conhecida; monitoring online captura drift do mundo. Canary (1→10→50→100%) com rollback automático
        é obrigatório em tráfego de produção. Drift vem do modelo (pin snapshot), da query (distribuição), do RAG
        (staleness) — três sensores separados. Cost attribution com labels responde FinOps em minutos. SLO de
        qualidade + error budget separa engenharia séria de "deploy and pray". Com isso a trilha fecha: do RAG
        fundamental ao sistema AI-native em produção, rodando com eval, canary e SLO.
      </Callout>
    </div>
  );
}
