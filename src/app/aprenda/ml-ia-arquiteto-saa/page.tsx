import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'ML/IA para Arquiteto AWS: SageMaker, Bedrock e Pipelines — FFV Academy',
  description: 'Arquiteturas de inferência (real-time, serverless, async, batch), SageMaker endpoints, integração com Bedrock, MLOps pipelines e data lake alimentando ML para o SAA-C03.',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma aplicação precisa classificar imagens (100ms p99) com 5.000 requests/seg. Qual tipo de deployment SageMaker?',
    options: [
      'Batch Transform',
      'Serverless Inference',
      'Real-time Endpoint com Auto Scaling',
      'Async Inference',
    ],
    correct: 2,
    explanation: 'Real-time Endpoint sustenta latência baixa com SLA previsível. Auto Scaling ajusta capacidade por métricas. Batch Transform é offline sobre S3. Serverless Inference tem cold start (não atende 100ms p99 confiavelmente). Async é para jobs longos (até 1h).',
  },
  {
    question: 'Qual serviço permite consumir Claude, Llama e Titan via API única sem treinar nada?',
    options: [
      'SageMaker JumpStart',
      'Amazon Bedrock',
      'SageMaker Canvas',
      'Comprehend Custom',
    ],
    correct: 1,
    explanation: 'Bedrock é o serviço gerenciado para foundation models com API unificada (InvokeModel). JumpStart tem modelos prontos mas você provisiona endpoint SageMaker próprio. Canvas é AutoML no-code. Comprehend Custom é NLP.',
  },
  {
    question: 'Como garantir que dados sensíveis usados em inferência Bedrock NÃO sejam usados para treinar modelos de terceiros?',
    options: [
      'Criptografar com KMS (não resolve)',
      'Usar VPC Endpoint privado (não resolve)',
      'Nada — Bedrock por padrão não usa seus dados para treinar modelos',
      'Apenas Bedrock Guardrails',
    ],
    correct: 2,
    explanation: 'Por design, Bedrock NÃO usa inputs/outputs para treinar modelos (AWS garante contratualmente). Dados não saem da sua conta. Guardrails filtram conteúdo sensível/indesejado. KMS criptografa em repouso. VPC Endpoint evita tráfego pela internet. Todos somam à segurança, mas a resposta de privacidade de treino é a garantia nativa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ml-ia-arquiteto-saa"
      title="ML/IA para Arquiteto: SageMaker, Bedrock e Pipelines"
      icon="🧬"
      xp={60}
      readTime={12}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="simulado-saa-c03"
      nextTitle="Simulado SAA-C03 Comentado (25 questões)"
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
        O Practitioner cobre o catálogo de serviços AI/ML. No SAA-C03 a pergunta muda: <em>como arquitetar</em> uma pipeline de inferência que entrega latência
        previsível com custo sob controle? Quando Real-time Endpoint, quando Serverless Inference, quando Async, quando Batch? Como Bedrock se encaixa em um
        data lake? Como deployar modelos em produção com blue/green ou canary? Aqui vamos ao nível de decisão arquitetural — o que o exame realmente cobra.
      </p>

      <ExamDomainBadge domain="High-Performing" weight="~24% do SAA-C03" color={ACCENT} />

      <Section title="As 4 opções de deployment SageMaker" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modo', 'Latência', 'Custo', 'Caso de uso']}
          rows={[
            ['Real-time Endpoint', 'ms (10-100)', 'Pago por hora (instância provisionada 24/7)', 'App interativa, alta QPS sustentada'],
            ['Serverless Inference', 'Varia com cold start', 'Pago por invocação + memória', 'Tráfego intermitente/imprevisível'],
            ['Async Inference', 'Até 1 hora', 'Pago por instância quando ativa; escala a zero', 'Payloads grandes (até 1 GB) · processamento longo'],
            ['Batch Transform', 'Offline', 'Pago por job', 'Inferência em lote sobre S3 (ex: scoring mensal)'],
          ]}
        />
        <Callout tone="info">
          <strong>Serverless Inference</strong> é ideal para APIs internas com QPS baixo ou irregular — não paga instância parada. Mas tem <em>cold start</em>
          (~1-5s no primeiro request após idle), então não serve para latência de UI crítica.
        </Callout>
      </Section>

      <Section title="Arquitetura de referência: inferência em produção" accent={ACCENT}>
        <ArchDiagram title="Pipeline de inferência Real-time" accent={ACCENT}>{`
  Client (App)
     │ HTTPS
     ▼
  ┌─────────────────┐
  │  API Gateway    │  (rate limit, API key, WAF)
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │  Lambda         │  (pré-processa input, auth)
  └────────┬────────┘
           │ InvokeEndpoint
           ▼
  ┌─────────────────────────────────┐
  │  SageMaker Real-time Endpoint   │
  │  ├── Instance1 (ml.g5.xlarge)   │
  │  ├── Instance2 (ml.g5.xlarge)   │  ←  Auto Scaling
  │  └── Instance3 (ml.g5.xlarge)   │
  │                                 │
  │  Production Variants:           │
  │    ModelA (Blue)  90%           │
  │    ModelB (Green) 10% ← Canary  │
  └─────────────────────────────────┘
        `}</ArchDiagram>
        <p>
          <strong>Production Variants</strong> permitem hospedar múltiplos modelos atrás do mesmo endpoint com tráfego dividido por percentual. É como o
          SageMaker implementa Blue/Green e Canary. Auto Scaling usa métrica <InlineCode>SageMakerVariantInvocationsPerInstance</InlineCode>.
        </p>
      </Section>

      <Section title="Bedrock em arquiteturas corporativas" accent={ACCENT}>
        <p>Bedrock é mais que um playground — ele tem primitivos para GenAI de produção:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'Para quê']}
          rows={[
            ['InvokeModel API', 'Chamada síncrona para qualquer foundation model'],
            ['InvokeModelWithResponseStream', 'Streaming de tokens (UX estilo ChatGPT)'],
            ['Knowledge Bases', 'RAG gerenciado: S3 → vector store (OpenSearch, Aurora, Pinecone) → recupera contexto automaticamente'],
            ['Agents', 'Tool calling gerenciado: conecta LLM a APIs externas com orquestração'],
            ['Guardrails', 'Filtros de conteúdo (PII, tópicos proibidos, prompt injection detection)'],
            ['Model Evaluation', 'Benchmark automático de modelos contra dataset custom'],
            ['Provisioned Throughput', 'Capacidade reservada para SLA (em vez de pay-per-token)'],
            ['Fine-tuning', 'Adapta modelo base ao domínio com dataset proprietário'],
          ]}
        />
        <Callout tone="success">
          Bedrock <strong>não usa seus inputs/outputs para treinar modelos</strong> de terceiros por padrão — garantia contratual AWS. Use
          <strong> VPC Endpoints</strong> para manter tráfego dentro da sua VPC.
        </Callout>
      </Section>

      <Section title="Arquitetura: chatbot corporativo com RAG" accent={ACCENT}>
        <ArchDiagram title="Bedrock + Knowledge Bases + OpenSearch" accent={ACCENT}>{`
  Doc corporativos                   Usuário pergunta
  (SharePoint, S3, Confluence)           │
           │                              ▼
           ▼                       ┌──────────────┐
  ┌───────────────┐                │   App Web    │
  │  Data Sources │                └──────┬───────┘
  │  (Knowledge   │                       │
  │   Base)       │                       ▼
  └──────┬────────┘                ┌──────────────┐
         │ indexa                   │   Bedrock    │
         ▼                          │   Agent      │
  ┌───────────────┐    retrieves   │              │
  │   OpenSearch  │←─────────────── │   + Claude   │
  │  Serverless   │                 │   /Titan     │
  │  (vectors)    │                 └──────┬───────┘
  └───────────────┘                        │
                                            ▼
                                    Resposta contextual
        `}</ArchDiagram>
        <p>
          Knowledge Bases abstrai todo o pipeline RAG: upload docs → chunking → embeddings → vector DB → retrieval → augmentação de prompt. Você chama
          <InlineCode>RetrieveAndGenerate</InlineCode> e pronto.
        </p>
      </Section>

      <Section title="MLOps com SageMaker Pipelines" accent={ACCENT}>
        <p>
          SageMaker Pipelines é CI/CD para modelos — define DAG de steps (data prep → treino → avaliação → registro → aprovação → deploy). Integra com
          <strong> Model Registry</strong> (versionamento) e <strong>Model Monitor</strong> (drift detection).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Papel']}
          rows={[
            ['Processing Jobs', 'Preparação de dados (pandas, Spark)'],
            ['Training Jobs', 'Treino em instância gerenciada (GPU opcional)'],
            ['Model Registry', 'Versiona modelos, aprovação manual/automática'],
            ['Model Monitor', 'Detecta drift de dados/modelo em endpoint de produção'],
            ['Clarify', 'Bias + explainability'],
            ['Feature Store', 'Armazena features online (baixa latência) e offline (para treino)'],
          ]}
        />
      </Section>

      <Section title="Data lake alimentando ML" accent={ACCENT}>
        <ArchDiagram title="Pipeline end-to-end: ingestão → ML → inferência" accent={ACCENT}>{`
  Kinesis Streams                Glue ETL
       │                            │
       ▼                            ▼
  S3 (raw zone) ──── Athena ──→ S3 (curated)
       │                            │
       │ glue crawler               │
       ▼                            ▼
  Glue Data Catalog        SageMaker Processing Job
                                    │
                                    ▼
                           SageMaker Training Job
                                    │
                                    ▼
                           SageMaker Model Registry
                                    │
                                    ▼
                           SageMaker Endpoint (produção)
                                    │
                                    ▼
                           CloudWatch + Model Monitor
        `}</ArchDiagram>
      </Section>

      <Section title="Cenários arquiteturais" accent={ACCENT}>
        <DecisionBox
          scenario="App de e-commerce precisa de recomendação personalizada com QPS variável (100 → 10.000)"
          winner="Amazon Personalize OU SageMaker Real-time Endpoint com Auto Scaling"
          winnerColor={ACCENT}
          why="Personalize é serviço gerenciado (menor esforço) específico para recommendation. Se precisa modelo custom, Real-time Endpoint + Auto Scaling + Production Variants entrega latência previsível."
          alternatives={[{ name: 'Serverless Inference', note: 'cold start prejudica UX no pico.' }, { name: 'Batch Transform', note: 'atraso de minutos não serve.' }]}
        />
        <DecisionBox
          scenario="Scoring de risco de crédito processado 1x/dia sobre tabela com 10M linhas"
          winner="SageMaker Batch Transform"
          winnerColor={ACCENT}
          why="Job offline sobre S3 — paga só pelo processamento. Não faz sentido manter endpoint ativo 24/7 para uso pontual."
          alternatives={[{ name: 'Async Inference', note: 'mais indicado para payload grande pontual.' }, { name: 'Real-time Endpoint', note: 'desperdício de custo.' }]}
        />
        <DecisionBox
          scenario="Chatbot interno consulta base de 500.000 documentos técnicos"
          winner="Amazon Q Business OU Bedrock Knowledge Bases + OpenSearch Serverless"
          winnerColor={ACCENT}
          why="Q Business já integra conectores (SharePoint, Confluence, S3) + search + GenAI. Alternativamente, Knowledge Bases + OpenSearch dá mais controle para pipeline RAG custom."
          alternatives={[{ name: 'Kendra + Lex', note: 'mais legado, mais engenharia.' }, { name: 'Self-hosted com OpenSearch + Llama', note: 'overhead operacional alto.' }]}
        />
        <DecisionBox
          scenario="Processar PDFs de contratos (50 páginas cada) com GenAI — 1-2 min por doc, 1000 docs/dia"
          winner="SageMaker Async Inference"
          winnerColor={ACCENT}
          why="Payload grande, latência longa, throughput moderado. Async coloca na fila SQS-like e devolve resultado em S3. Endpoint escala a zero quando ocioso."
          alternatives={[{ name: 'Real-time', note: 'timeout em 60s — não serve.' }, { name: 'Step Functions + Bedrock', note: 'válido para ≤ 29s por invocação.' }]}
        />
      </Section>

      <Section title="Segurança ML/IA no SAA" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ameaça', 'Defesa AWS']}
          rows={[
            ['Vazamento de PII em prompts', 'Bedrock Guardrails · Comprehend PII Redaction'],
            ['Prompt injection', 'Guardrails de input · validation na camada de app'],
            ['Dados de treino expostos', 'SageMaker em VPC + KMS · S3 privado + Lake Formation'],
            ['Modelo enviesado', 'SageMaker Clarify · Model Monitor bias drift'],
            ['Tráfego de inferência pela internet', 'VPC Endpoint para Bedrock/SageMaker (PrivateLink)'],
            ['Auditoria', 'CloudTrail + Bedrock Model Invocation Logging'],
          ]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Quando SageMaker em vez de Bedrock?"
          a={<><strong>SageMaker</strong> quando precisa treinar/ajustar modelo próprio ou ter controle fino (MLOps, Feature Store). <strong>Bedrock</strong> quando quer consumir foundation models prontos com API única e pagar por uso.</>}
        />
        <QAItem
          q="Real-time Endpoint cobra quando ocioso?"
          a="SIM. Instância fica provisionada 24/7 — paga por hora mesmo sem invocações. Se o tráfego é intermitente, Serverless Inference ou Async Inference é mais econômico."
        />
        <QAItem
          q="Como garantir que Bedrock funcione dentro de VPC privada?"
          a={<>Criar um <strong>Interface Endpoint (PrivateLink)</strong> para Bedrock na VPC. Assim o tráfego de invocação não passa pela internet.</>}
        />
        <QAItem
          q="SageMaker JumpStart vs Bedrock — qual escolher?"
          a={<>JumpStart te dá modelo pré-treinado (ex: Llama) deployado em <strong>seu endpoint SageMaker</strong> — você paga instância e tem controle total. Bedrock é API gerenciada pay-per-token sem gerenciar infra. JumpStart quando quer customizar/fine-tuning profundo; Bedrock quando quer só consumir.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> 4 tipos de endpoint = Real-time · Serverless · Async · Batch · Bedrock = foundation models gerenciados · Knowledge Bases
        = RAG gerenciado · Q Business = chatbot corporativo pronto · SageMaker Pipelines = MLOps · VPC Endpoint = tráfego privado · Guardrails + Clarify
        + Model Monitor = segurança e qualidade em produção.
      </Callout>
    </div>
  );
}
