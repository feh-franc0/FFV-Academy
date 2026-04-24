import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ocr-doc-intelligence');
const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Tesseract continua relevante mesmo em 2026?',
    options: [
      'Não é mais — é obsoleto',
      'Porque é 100% local, gratuito, e para texto impresso limpo em idiomas treinados (pt, en) entrega accuracy suficiente sem custo por página. Para compliance / dados sensíveis que não podem sair da rede e volume baixo, ainda é a escolha certa',
      'Roda mais rápido que tudo',
      'É o mais preciso',
    ],
    correct: 1,
    explanation: 'Tesseract perde feio em documentos complexos (tabelas, forms, handwriting), mas em texto impresso limpo chega a 95%+ e é totalmente local. Para casos de privacidade extrema (legal, saúde, dados pessoais sem pipeline cloud), continua sendo ferramenta válida junto com preprocessing (OpenCV).',
  },
  {
    question: 'Qual a vantagem de Azure Document Intelligence sobre um vision LLM genérico para extração de forms?',
    options: [
      'Nenhuma',
      'Retorna schema tipado (key-value pairs, tables, selection marks) com bounding boxes e confidence score por campo. LLM genérico devolve prosa livre — você ainda precisaria estruturar. Doc Intelligence já entrega estrutura pronta, com modelo pré-treinado em layouts comuns (invoices, receipts, IDs)',
      'É mais barato',
      'É mais rápido',
    ],
    correct: 1,
    explanation: 'A diferença fundamental é o output. Vision LLM = texto livre + raciocínio. Doc Intelligence = JSON estruturado com confidence por célula + coordenadas. Para pipeline de extração financeira, jurídica ou médica, onde cada campo precisa de auditabilidade, a saída tipada é o que torna o produto possível.',
  },
  {
    question: 'Quando combinar OCR especializado + vision LLM num pipeline?',
    options: [
      'Nunca, um deles basta',
      'Quando você precisa de extração estruturada confiável (OCR especializado) + reasoning sobre o conteúdo extraído (LLM). Ex: Textract extrai todos os campos de uma nota fiscal, depois Claude decide "esta despesa é reembolsável segundo a política?" usando o JSON tipado + contexto',
      'Sempre que houver texto',
      'Apenas em inglês',
    ],
    correct: 1,
    explanation: 'Esse sandwich (OCR estruturado → LLM para raciocínio) é o padrão de produção 2026. Você paga pela auditabilidade do OCR (confidence, bbox, campos tipados) e pela inteligência do LLM (decisões, classificação, resumo). Tentar fazer tudo no LLM economiza uma call e ganha bugs não-determinísticos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ocr-doc-intelligence"
      title="OCR moderno: Azure Doc Intelligence, Textract, LandingAI"
      icon="📄"
      xp={50}
      readTime={12}
      trailName="Voice, Vision & Multimodal"
      trailColor={accent}
      nextSlug="capstone-voice-assistant"
      nextTitle="Capstone: assistente de voz end-to-end"
      quiz={quiz}
    >
      <Section title="Três gerações coexistem" accent={accent}>
        <p>
          OCR não é um mercado uniforme. Três gerações convivem em 2026. <strong>Tesseract</strong> (CLI local, gratuito) cobre texto impresso simples. <strong>OCR estruturado cloud</strong> (Azure Document Intelligence, AWS Textract, Google Document AI) entrega schema tipado com confidence. <strong>LLM-powered Agentic OCR</strong> (LandingAI, Mistral OCR, Reducto) usa vision LLM por baixo e é melhor em layouts irregulares e handwriting. Cada um tem seu nicho real.
        </p>
      </Section>

      <Section title="Tesseract: quando local e grátis importam" accent={accent}>
        <p>
          Sempre descartado cedo demais. Para texto impresso limpo em volume baixo ou dados que não podem sair do ambiente, Tesseract + preprocessing resolve.
        </p>
        <CodeBlock lang="python">{`import cv2
import pytesseract

img = cv2.imread('boleto.png')
# Preprocessing melhora muito o resultado
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 31, 2)

texto = pytesseract.image_to_string(thresh, lang='por', config='--psm 6')
# psm 6: assume um único bloco uniforme de texto
# psm 4: colunas; psm 11: linha esparsa`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Tesseract cai muito em scan ruim. Se accuracy importa e você não controla a qualidade do scan, suba para serviço cloud — o custo por página se paga em horas de correção manual economizadas.
        </Callout>
      </Section>

      <Section title="Azure Document Intelligence: forms e tabelas sérias" accent={accent}>
        <p>
          Azure Doc Intelligence oferece modelos pré-treinados (<code>prebuilt-invoice</code>, <code>prebuilt-receipt</code>, <code>prebuilt-idDocument</code>, <code>prebuilt-layout</code>) e suporte a custom models. Output JSON tipado, confidence por campo, bounding boxes.
        </p>
        <CodeBlock lang="ts">{`import DocumentIntelligence, { getLongRunningPoller } from '@azure-rest/ai-document-intelligence';
import { AzureKeyCredential } from '@azure/core-auth';

const client = DocumentIntelligence(endpoint, new AzureKeyCredential(key));

const init = await client
  .path('/documentModels/{modelId}:analyze', 'prebuilt-invoice')
  .post({ contentType: 'application/json', body: { urlSource: pdfUrl } });

const poller = getLongRunningPoller(client, init);
const result = (await poller.pollUntilDone()).body.analyzeResult;

for (const doc of result.documents ?? []) {
  const total = doc.fields?.['InvoiceTotal'];
  console.log('Total:', total?.valueCurrency, 'confidence:', total?.confidence);
}`}</CodeBlock>
      </Section>

      <Section title="AWS Textract: ecossistema AWS" accent={accent}>
        <p>
          Se sua stack está na AWS, Textract integra com S3 event triggers, Step Functions e SageMaker. Bom em tabelas e forms, operation <code>AnalyzeExpense</code> específica para notas fiscais.
        </p>
        <CodeBlock lang="ts">{`import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';

const client = new TextractClient({ region: 'us-east-1' });

const resp = await client.send(new AnalyzeDocumentCommand({
  Document: { S3Object: { Bucket: 'docs-in', Name: 'fatura.pdf' } },
  FeatureTypes: ['FORMS', 'TABLES'],
}));

// Blocks: KEY_VALUE_SET, TABLE, CELL, WORD — reconstrua a estrutura`}</CodeBlock>
      </Section>

      <Section title="LandingAI Agentic OCR e Mistral OCR: nova geração" accent={accent}>
        <p>
          A onda de 2025 trouxe OCR feito em cima de vision LLM com raciocínio sobre layout. <strong>LandingAI Agentic Document Extraction</strong> e <strong>Mistral OCR</strong> processam handwriting, layouts criativos e documentos escaneados ruins melhor que a geração anterior — a custo mais alto, mas muitas vezes substituindo pipeline manual.
        </p>
        <CodeBlock lang="python">{`# Mistral OCR API
from mistralai import Mistral

client = Mistral(api_key=api_key)

resp = client.ocr.process(
    model='mistral-ocr-latest',
    document={'type': 'document_url', 'document_url': pdf_url},
    include_image_base64=False,
)

for page in resp.pages:
    print('Page', page.index, 'markdown:\\n', page.markdown)
    # Saída já em markdown estruturado, preservando tabelas e ordem de leitura`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Novidade importante: muitos desses serviços entregam <strong>Markdown pronto</strong> (tabelas preservadas, hierarquia de títulos). Isso é ótimo para RAG — pula a etapa de reconstruir estrutura do output cru.
        </Callout>
      </Section>

      <Section title="Árvore de decisão prática" accent={accent}>
        <CodeBlock lang="yaml">{`documento_limpo_impresso:
  volume_baixo_local: tesseract + opencv preprocess
  volume_alto_cloud: azure doc intelligence (prebuilt) ou textract

forms_com_checkboxes_e_assinaturas:
  - azure doc intelligence prebuilt-document
  - textract FORMS
  (ambos retornam selection marks + signature detection)

handwriting_ou_layout_irregular:
  - mistral ocr
  - landingai agentic extraction
  - vision llm (claude/gpt-4o) com schema forçado

tabelas_complexas_celulas_mescladas:
  - azure doc intelligence prebuilt-layout
  - landingai (state of art)
  + validar com LLM por cima

pipeline_rag_conteudo_em_pdf:
  - mistral ocr -> markdown -> chunker
  - ou textract -> raw text -> llm layout-aware chunker`}</CodeBlock>
      </Section>

      <Section title="Sandwich OCR + LLM: o padrão 2026" accent={accent}>
        <p>
          O arquétipo de produção hoje é: <strong>OCR especializado extrai → LLM raciocina sobre o JSON extraído</strong>. Benefícios: extração auditável (confidence por campo), reasoning flexível do LLM, custo controlado, separação de responsabilidades para debug.
        </p>
        <CodeBlock lang="ts">{`// Etapa 1: extração estruturada (Azure Doc Intelligence)
const extracted = await extractInvoice(pdfBuffer);
// => { vendor, total, lineItems, dueDate, ... } com confidence

// Etapa 2: LLM decide regra de negócio com base no JSON + política
const decision = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 512,
  messages: [{
    role: 'user',
    content: 'Política de reembolso:\\n' + policyText + '\\n\\nFatura extraída:\\n' +
             JSON.stringify(extracted) + '\\n\\nRetorne JSON { reembolsavel: boolean, motivo: string }',
  }],
});`}</CodeBlock>
      </Section>

      <Section title="Fechamento" accent={accent}>
        <Callout tone="success" icon="✅">
          OCR em 2026 é escolher a ferramenta certa por caso: Tesseract local, Azure/Textract para estrutura, LandingAI/Mistral para layout difícil. Sandwich OCR + LLM é padrão. Nunca confie em accuracy sem medir no seu dataset real — confidence score do provider é guia, não garantia.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
