import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ml-ia-arquiteto-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando Bedrock vs SageMaker?',
    options: [
      'São iguais',
      'Bedrock: foundation models via API (Claude, Llama, Titan), serverless, zero gestão — ideal quando precisa inference rápida sem treinar. SageMaker: MLOps completo (train, tune, deploy, monitor modelos próprios), pipelines, feature store — quando você treina/fine-tune modelo customizado',
      'Bedrock só OpenAI',
      'SageMaker é grátis',
    ],
    correct: 1,
    explanation: 'Bedrock democratiza LLM sem infra — chama modelo Claude/Llama por API, paga por token, zero ops. SageMaker é a fábrica: training jobs distribuídos, hyperparameter tuning, model registry, endpoints com autoscaling, monitoring de drift. Não concorrentes — um resolve "usar LLM pronto", o outro "construir/operar ML custom".',
  },
  {
    question: 'Comprehend, Textract, Rekognition: quando managed ganha?',
    options: [
      'Nunca',
      'Quando o caso de uso se encaixa no domínio do serviço (NLP genérico, OCR estruturado, classificação de imagens/objetos) e o volume não justifica treinar modelo proprietário. Time-to-market em dias vs meses, acurácia "good enough" para a maioria dos casos, pagamento por API call',
      'Sempre self-host',
      'Só legado',
    ],
    correct: 1,
    explanation: 'Managed AI ganha em 80% dos casos: chatbot básico, extração de entidades em texto, OCR de documento padrão, face detection. Self-host/fine-tune só quando o problema é específico o suficiente pra justificar o investimento. Em SAP, a resposta correta frequentemente é Comprehend/Textract/Rekognition — AWS tem viés nisso.',
  },
  {
    question: 'Bedrock Guardrails + Knowledge Bases servem pra quê?',
    options: [
      'Marketing',
      'Guardrails: policies (conteúdo bloqueado, PII mask, topic denial, prompt injection defense) aplicadas ao LLM sem custo de re-treino. Knowledge Bases: RAG managed (ingestion de docs, chunking, embedding, retrieval) conectado ao modelo — útil pra chatbot corporativo',
      'Treinar modelo',
      'Só export',
    ],
    correct: 1,
    explanation: 'Guardrails é layer de segurança declarativa aplicada em cima do modelo (bloquear "como fazer bomba", mascarar CPF em output, rejeitar tópicos off-brand). Knowledge Bases é RAG plug-and-play — aponta pra bucket S3 com docs, Bedrock indexa em vector DB, retrieval automático. Juntos encurtam MVPs de assistente corporativo em semanas pra dias.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ml-ia-arquiteto-sap"
      title="ML/IA sob ótica de arquiteto: Bedrock, SageMaker, Comprehend"
      icon="🤖"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="containers-serverless-sap"
      nextTitle="Containers e serverless em arquitetura enterprise"
      quiz={quiz}
    >
      <Section title="Stack ML/IA AWS por camada" accent={accent}>
        <CodeBlock lang="yaml">{`Foundation Models (managed inference):
  Bedrock (Claude, Llama, Titan, Mistral, Cohere)
  Bedrock Agents (tool use managed)
  Bedrock Knowledge Bases (RAG managed)
  Bedrock Guardrails (safety policies)

Custom ML (build/train/deploy):
  SageMaker Studio / Notebooks
  SageMaker Training + HPO + Distributed
  SageMaker Model Registry + Pipelines
  SageMaker Endpoints + Serverless Inference
  SageMaker Model Monitor (drift detection)
  SageMaker Feature Store

High-level APIs (managed AI):
  Comprehend (NLP: entities, sentiment, classification)
  Textract (OCR estruturado, forms, tables)
  Rekognition (vision: objects, faces, moderation)
  Transcribe (speech-to-text)
  Polly (text-to-speech)
  Translate
  Kendra (enterprise search)`}</CodeBlock>
      </Section>

      <Section title="Decisão típica de arquiteto" accent={accent}>
        <p>
          Pergunta frequente em SAP: "empresa quer chatbot pra atendimento ao cliente, com base de conhecimento de 10k docs PDF, orçamento limitado, go-live em 2 meses". Resposta correta = Bedrock + Knowledge Bases (RAG managed) + Guardrails (mask PII, topic denial). Errado: SageMaker + train custom LLM (meses, caro, sem ganho concreto). Managed vence quando requisito é padrão.
        </p>
        <CodeBlock lang="python">{`# Exemplo mínimo: Bedrock Knowledge Base + Claude via Converse API
import boto3

bedrock = boto3.client('bedrock-agent-runtime')

resp = bedrock.retrieve_and_generate(
    input={'text': 'Qual a política de reembolso?'},
    retrieveAndGenerateConfiguration={
        'type': 'KNOWLEDGE_BASE',
        'knowledgeBaseConfiguration': {
            'knowledgeBaseId': 'KB-XYZ',
            'modelArn': 'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0'
        }
    }
)

print(resp['output']['text'])
for cit in resp['citations']:
    print('source:', cit['retrievedReferences'][0]['location'])`}</CodeBlock>
      </Section>

      <Section title="Quando SageMaker é a resposta" accent={accent}>
        <p>
          Casos em que SageMaker ganha: modelo proprietário de fraud detection treinado em dados privados, forecasting com features customizadas, recomendação específica do negócio, LoRA fine-tuning de modelo base. SageMaker Pipelines + Model Registry + Endpoints compõem MLOps real (train → eval → register → deploy → monitor → retrain loop).
        </p>
        <Callout tone="success" icon="✅">
          Regra pragmática pro SAP-C03: se o enunciado descreve caso padrão (chatbot, OCR de fatura, classificação de sentimento), vá de managed (Bedrock/Comprehend/Textract). Se descreve fine-tune, custom model, MLOps end-to-end, vá de SageMaker. Raro ser as duas respostas corretas — o enunciado pende pra uma.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
