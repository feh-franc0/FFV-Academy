import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'IA e ML na AWS: Bedrock, SageMaker, Q e amigos — FFV Academy',
  description: 'Stack de IA e ML da AWS: SageMaker, Rekognition, Comprehend, Polly, Transcribe, Translate, Lex, Kendra, Bedrock e Amazon Q. Quando usar cada um.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa precisa criar um chatbot corporativo que responda perguntas usando documentos internos em PDF. Qual combinação de serviços AWS é mais direta?',
    options: [
      'SageMaker + EC2 com GPU',
      'Amazon Kendra + Amazon Lex (ou Amazon Q Business)',
      'Amazon Rekognition + Translate',
      'Comprehend + Polly',
    ],
    correct: 1,
    explanation: 'Amazon Kendra é search empresarial com NLU que indexa PDFs/SharePoint/etc. Amazon Lex fornece a interface conversacional. Desde 2024, a resposta mais moderna é Amazon Q Business, que já integra tudo (search + GenAI + conectores). SageMaker seria overkill; Rekognition é visão computacional.',
  },
  {
    question: 'Você quer construir uma aplicação GenAI usando Claude ou Llama sem gerenciar infra de GPU. Qual serviço usar?',
    options: [
      'Amazon SageMaker',
      'Amazon Bedrock',
      'Amazon Rekognition',
      'Amazon Comprehend',
    ],
    correct: 1,
    explanation: 'Amazon Bedrock é o serviço gerenciado para foundation models (Claude, Llama, Titan, Mistral, Cohere, Stable Diffusion) via API única. Sem provisionar instância, sem gerenciar modelo. SageMaker é para treinar/deployar modelos customizados.',
  },
  {
    question: 'Qual serviço transcreve áudio em texto com timestamps e detecção de múltiplos falantes?',
    options: [
      'Amazon Polly',
      'Amazon Transcribe',
      'Amazon Comprehend',
      'Amazon Lex',
    ],
    correct: 1,
    explanation: 'Transcribe é speech-to-text. Polly é o inverso (text-to-speech). Comprehend analisa texto (sentimento, entidades). Lex constrói chatbots. Transcribe suporta speaker diarization, channel identification, custom vocabulary e language detection.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ai-ml-aws-servicos"
      title="IA e ML na AWS: Bedrock, SageMaker, Q e Amigos"
      icon="🧠"
      xp={50}
      readTime={10}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="developer-tools-aws"
      nextTitle="Developer Tools: CodePipeline, CDK, CloudFormation e SAM"
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
        A AWS tem um zoológico de serviços de IA — e o CLF-C02 (versão 2024+) cobra que você saiba escolher entre eles. A regra de ouro: <strong>serviços
        prontos por domínio</strong> (imagem, voz, texto) resolvem 80% dos casos sem escrever modelo nenhum. <strong>SageMaker</strong> aparece quando você
        precisa treinar algo específico. <strong>Bedrock</strong> e <strong>Amazon Q</strong> são a aposta de GenAI. Entender essa camada evita que você use um
        canhão pra matar mosquito.
      </p>

      <ExamDomainBadge domain="Technology" weight="~34% do CLF-C02" color={ACCENT} />

      <Section title="As 3 camadas de IA/ML na AWS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Camada', 'Serviços', 'Quando usar']}
          rows={[
            ['AI Services (prontos)', 'Rekognition · Comprehend · Polly · Transcribe · Translate · Lex · Kendra · Textract · Bedrock · Q', 'Você não tem ciência de dados — quer resolver problema de negócio com API pronta'],
            ['ML Platform', 'Amazon SageMaker (Studio, Training, Endpoints, Pipelines, Canvas, JumpStart)', 'Precisa treinar modelo customizado com seus dados'],
            ['ML Frameworks + Infra', 'EC2 GPU (p5, g6) · Deep Learning AMI · EKS + Karpenter · Trn1/Inf2 (Trainium/Inferentia)', 'Equipe de ML madura quer controle total'],
          ]}
        />
        <Callout tone="info">
          Regra prática: <strong>comece de cima</strong>. Só desça uma camada se a anterior não atender.
        </Callout>
      </Section>

      <Section title="Amazon SageMaker" accent={ACCENT}>
        <p>Plataforma completa de ML gerenciada. Cobre do notebook ao endpoint de produção.</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Recurso', 'Para que serve']}
          rows={[
            ['Studio', 'IDE Jupyter-based, o &ldquo;VS Code do ML&rdquo;'],
            ['Autopilot', 'AutoML — encontra o melhor modelo sozinho'],
            ['Canvas', 'AutoML no-code (para analistas, não engenheiros)'],
            ['Ground Truth', 'Labeling de dados com humanos (público ou privado)'],
            ['Feature Store', 'Banco de features compartilhado entre treino e inferência'],
            ['JumpStart', 'Modelos pré-treinados e soluções prontas'],
            ['Clarify', 'Detecta bias e explica decisões do modelo'],
            ['Pipelines', 'MLOps (CI/CD para modelos)'],
            ['Model Registry', 'Versionamento e aprovação de modelos'],
          ]}
        />
        <p>
          Opções de deployment: <strong>Real-time Endpoint</strong> (ms de latência), <strong>Serverless Inference</strong> (paga por invocação),
          <strong> Async Inference</strong> (jobs longos, resultado em S3), <strong>Batch Transform</strong> (processamento em lote).
        </p>
      </Section>

      <Section title="Amazon Bedrock" accent={ACCENT}>
        <p>
          Serviço gerenciado para <strong>foundation models</strong> (LLMs, modelos de imagem). API única, sem gerenciar GPU. Modelos disponíveis:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Anthropic Claude</strong> (Sonnet, Opus, Haiku)</li>
          <li><strong>Meta Llama</strong></li>
          <li><strong>Amazon Titan</strong> (texto, embeddings, imagem)</li>
          <li><strong>Mistral</strong> (Large, 7B, 8x7B)</li>
          <li><strong>Cohere Command R</strong></li>
          <li><strong>Stability AI</strong> (imagem)</li>
        </ul>
        <Callout tone="info">
          Recursos extras: <strong>Knowledge Bases</strong> (RAG gerenciado), <strong>Agents</strong> (tool calling), <strong>Guardrails</strong>
          (filtros de segurança), <strong>Model Evaluation</strong>, <strong>Fine-tuning</strong> e <strong>Provisioned Throughput</strong>.
        </Callout>
      </Section>

      <Section title="Amazon Q" accent={ACCENT}>
        <p>Assistente GenAI corporativo com duas variantes que caem no exame:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Variante', 'Para quem', 'Exemplo']}
          rows={[
            ['Amazon Q Business', 'Usuários de negócio', 'Chatbot sobre docs corporativos (SharePoint, Confluence, S3), conectores prontos'],
            ['Amazon Q Developer', 'Desenvolvedores', 'Plugin IDE (VS Code/JetBrains) que escreve código, sugere correções, explica AWS'],
          ]}
        />
      </Section>

      <Section title="Serviços de domínio específico" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Domínio', 'Caso de uso típico']}
          rows={[
            ['Rekognition', 'Visão (imagem/vídeo)', 'Detectar rostos, objetos, texto em imagem, moderação de conteúdo, PPE detection'],
            ['Textract', 'Documentos', 'Extrai texto + tabelas + formulários de PDFs/imagens (OCR estrutural)'],
            ['Comprehend', 'NLP', 'Sentimento, entidades, tópicos, PII detection/redaction'],
            ['Polly', 'Text-to-Speech', 'Gera áudio natural em 30+ vozes/idiomas'],
            ['Transcribe', 'Speech-to-Text', 'Transcreve áudio com speaker diarization, timestamps, vocabulário custom'],
            ['Translate', 'Tradução', 'Tradução neural em 75+ idiomas'],
            ['Lex', 'Chatbot conversacional', 'Mesmo engine da Alexa — bots de voz/texto com intents'],
            ['Kendra', 'Search empresarial', 'Busca NLU sobre SharePoint, S3, Salesforce, Confluence'],
            ['Forecast', 'Séries temporais', 'Previsão de demanda, vendas, energia'],
            ['Personalize', 'Recomendação', 'Sistema de recommendation estilo Amazon.com'],
            ['Fraud Detector', 'Detecção de fraude', 'Score de risco para transações, sign-ups'],
          ]}
        />
      </Section>

      <Section title="Decisão rápida" accent={ACCENT}>
        <DecisionBox
          scenario="Construir um chatbot que responde sobre docs internos"
          winner="Amazon Q Business (ou Kendra + Bedrock com Knowledge Bases)"
          winnerColor={ACCENT}
          why="Q Business já integra conectores (SharePoint, Confluence, S3), search e GenAI em um produto só. Montar na mão exige Kendra + Bedrock + orquestração."
          alternatives={[{ name: 'Kendra + Lex', note: 'mais tradicional, mais trabalho.' }, { name: 'SageMaker com modelo próprio', note: 'só se precisa fine-tuning muito específico.' }]}
        />
        <DecisionBox
          scenario="App mobile que identifica pragas em plantas por foto"
          winner="Rekognition Custom Labels (ou SageMaker JumpStart)"
          winnerColor={ACCENT}
          why="Rekognition Custom Labels permite treinar com 10-100 imagens por classe sem escrever código de ML. JumpStart tem modelos pré-treinados para vision."
          alternatives={[{ name: 'SageMaker + ResNet custom', note: 'se já tem time de ML.' }, { name: 'API Rekognition base', note: 'se for objeto comum, não precisa treino.' }]}
        />
        <DecisionBox
          scenario="Redigir PII automaticamente de logs e tickets antes de armazenar"
          winner="Amazon Comprehend (PII Detection + Redaction)"
          winnerColor={ACCENT}
          why="Comprehend detecta e redige CPF, email, telefone, cartão nativamente. Sem treinar nada."
          alternatives={[{ name: 'Macie', note: 'para PII em S3, escaneamento.' }, { name: 'Regex caseiro', note: 'sempre deixa passar algo.' }]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual a diferença entre Bedrock e SageMaker?"
          a={<>Bedrock serve foundation models prontos via API (não treina, consome). SageMaker é plataforma completa de ML — você traz seus dados, treina modelos customizados, deploya endpoints. Bedrock = &ldquo;usar GenAI&rdquo;, SageMaker = &ldquo;criar ML&rdquo;.</>}
        />
        <QAItem
          q="Quando usar Kendra em vez de OpenSearch?"
          a="Kendra é search baseado em NLU — entende pergunta em linguagem natural (&ldquo;qual a política de férias?&rdquo;) e retorna resposta contextual. OpenSearch é search full-text tradicional (keywords, BM25). Kendra custa mais mas exige menos engenharia."
        />
        <QAItem
          q="Macie, Comprehend e Rekognition podem detectar PII?"
          a={<>Sim, todos os três — mas com escopos diferentes. <strong>Macie</strong> escaneia PII em buckets S3. <strong>Comprehend</strong> detecta e redige PII em texto via API. <strong>Rekognition</strong> detecta PII em imagens (placas, documentos).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> SageMaker = plataforma · Bedrock = foundation models · Q = assistente corporativo · Rekognition = imagem · Textract = docs
        · Comprehend = texto · Polly/Transcribe = voz · Translate = tradução · Lex = chatbot · Kendra = search empresarial. Vá sempre pela camada mais alta
        que resolve o problema.
      </Callout>
    </div>
  );
}
