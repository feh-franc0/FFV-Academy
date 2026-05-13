import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vision-models-claude-gpt');
const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que redimensionar imagem antes de enviar para vision API?',
    options: [
      'Para ficar mais bonita',
      'Porque o provider cobra por tokens visuais calculados a partir de dimensões. Imagem 4000x3000 é cobrada muito mais que 1024x768 sem ganho de acurácia na maioria das tarefas (UI, documentos, diagramas). Padrão: redimensionar para o "sweet spot" do provider antes do upload',
      'Para melhorar a qualidade',
      'Não precisa',
    ],
    correct: 1,
    explanation: 'OpenAI cobra em tiles de 512px, Anthropic em área (cap 1568 tokens). Uma foto 12MP enviada crua pode custar 3-5x uma versão redimensionada sem perder accuracy em OCR ou UI understanding. Sempre faça resize no pre-processing.',
  },
  {
    question: 'Qual vision model escolher para extrair tabelas complexas de PDFs scaneados?',
    options: [
      'Qualquer um, todos funcionam igual',
      'Claude 3.5 Sonnet ou GPT-4o para raciocínio sobre a tabela com contexto, mas para extração pura em escala vale usar Azure Document Intelligence ou AWS Textract — modelos especializados em documentos têm F1 maior em tabelas mescladas e scaneadas ruins',
      'Sempre Gemini Flash',
      'Sempre GPT-4V',
    ],
    correct: 1,
    explanation: 'LLMs multimodais generalistas alucinam em tabelas com células mescladas ou scans de baixa qualidade. Para extração estruturada em escala, serviços especializados (Textract, Azure Doc Intelligence, LandingAI) ganham em F1 e custo. Use vision LLM por cima quando precisa de reasoning sobre o conteúdo extraído.',
  },
  {
    question: 'O que é "UI understanding" com vision model e quando aplicar?',
    options: [
      'Design bonito',
      'É passar screenshot + pergunta tipo "onde clico para cancelar a assinatura?" e receber coordenadas ou próximo passo. Usado em testes visuais de regressão, automação tipo Playwright+vision e agents que navegam interfaces. Requer resolução alta e prompt com grid de referência',
      'Gerar UI nova',
      'Traduzir texto',
    ],
    correct: 1,
    explanation: 'UI understanding é a base de browser agents (Claude Computer Use, OpenAI Operator). Você envia screenshot completo, pede ação e o modelo retorna coordenadas ou seletores. A accuracy sobe muito com resolução adequada (1280px+) e com dicas no prompt (grid, annotations). Abaixo disso, o modelo confunde botões próximos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vision-models-claude-gpt"
      title="Vision models: Claude Vision, GPT-4V, Gemini"
      icon="👁️"
      xp={55}
      readTime={13}
      trailName="Voice, Vision & Multimodal"
      trailColor={accent}
      nextSlug="ocr-doc-intelligence"
      nextTitle="OCR moderno: Azure Doc Intelligence, Textract, LandingAI"
      quiz={quiz}
    >
      <Section title="Três modelos, comportamentos diferentes" accent={accent}>
        <p>
          <strong>Claude 3.5 Sonnet / 3.7 Sonnet</strong> lidera em UI understanding e reasoning sobre diagramas — é a escolha para Computer Use e interpretação de screenshots complexos. <strong>GPT-4o</strong> ganha em velocidade e OCR de texto em imagens comuns. <strong>Gemini 1.5/2.0</strong> aceita arquivos massivos (PDF até 1000 páginas, vídeo até horas) sem pipeline externo. A escolha depende do formato de entrada e do tipo de raciocínio.
        </p>
      </Section>

      <Section title="Passando imagem: três formas" accent={accent}>
        <CodeBlock lang="ts">{`// 1. Base64 inline (Anthropic e OpenAI)
const b64 = fs.readFileSync('screenshot.png').toString('base64');

await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } },
      { type: 'text', text: 'Descreva em PT-BR o que o usuário está vendo nesta tela.' },
    ],
  }],
});

// 2. URL pública (OpenAI aceita; Anthropic tem 'url' source)
await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Liste os campos deste formulário.' },
      { type: 'image_url', image_url: { url: 'https://exemplo.com/form.png', detail: 'high' } },
    ],
  }],
});

// 3. Files API (Gemini para arquivos grandes)
const file = await genAI.files.upload({ file: 'relatorio_100p.pdf', mimeType: 'application/pdf' });
await genAI.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: [{ role: 'user', parts: [{ fileData: { fileUri: file.uri, mimeType: file.mimeType } }, { text: 'Resuma.' }] }],
});`}</CodeBlock>
      </Section>

      <Section title="Pre-processing: o que economiza dinheiro" accent={accent}>
        <p>
          Padrão profissional: nunca envie imagem crua do celular. Redimensione, comprima, e corte áreas irrelevantes antes de subir.
        </p>
        <CodeBlock lang="ts">{`import sharp from 'sharp';

async function prepareForVision(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize(1568, 1568, { fit: 'inside', withoutEnlargement: true }) // sweet spot Anthropic
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

// Para OCR de documento, preserve contraste com grayscale + normalize
async function prepareForOCR(inputPath: string): Promise<Buffer> {
  return sharp(inputPath)
    .resize(2048, null, { withoutEnlargement: true })
    .grayscale()
    .normalize()
    .png()
    .toBuffer();
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Para <code>detail: 'high'</code> no OpenAI, cada tile de 512px custa 170 tokens. Uma imagem 2048x2048 vira 16 tiles + base 85 = 2805 tokens. Reduzir para 1024x1024 = 4 tiles + base = 765 tokens. Mesmo conteúdo, custo 3.6x menor.
        </Callout>
      </Section>

      <Section title="UI understanding: a fronteira de 2026" accent={accent}>
        <p>
          Claude Computer Use e similares funcionam porque o modelo entende coordenadas em screenshot. Mas sem prompt certo ele chuta. Padrão que funciona: enviar screenshot + pedir bounding box + fazer follow-up para executar.
        </p>
        <CodeBlock lang="ts">{`const prompt =
  'A tela acima é um app de banco. O usuário quer cancelar a assinatura premium. ' +
  'Retorne JSON estrito: ' +
  '{ "elemento": "...", "bbox": [x1, y1, x2, y2], "acao": "click|type", "rationale": "..." } ' +
  'As coordenadas são em pixels, origem no canto superior esquerdo da imagem.';

const resp = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 512,
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshotB64 } },
      { type: 'text', text: prompt },
    ],
  }],
});`}</CodeBlock>
      </Section>

      <Section title="Charts e diagramas: onde vision LLM brilha" accent={accent}>
        <p>
          Extrair dados de gráfico (chart-to-data) é um caso onde vision LLM bate OCR tradicional facilmente. Pergunte dados estruturados com schema claro:
        </p>
        <CodeBlock lang="ts">{`const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    chart_type: { type: 'string', enum: ['bar', 'line', 'pie', 'scatter'] },
    x_axis: { type: 'string' },
    y_axis: { type: 'string' },
    series: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          points: { type: 'array', items: { type: 'object', properties: { x: {}, y: { type: 'number' } } } },
        },
      },
    },
  },
};

// Claude: use tool_use para forçar JSON; OpenAI: response_format json_schema`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Sempre rode sanity checks: soma dos valores bate com legenda? Eixo Y é linear ou log? Vision LLM erra em gráficos log sem aviso — ele "normaliza" os valores. Teste com gráficos conhecidos antes de confiar em prod.
        </Callout>
      </Section>

      <Section title="Custo operacional" accent={accent}>
        <CodeBlock lang="yaml">{`# Comparativo aproximado (Abril 2026)
claude_3_5_sonnet:
  por_imagem_1024x1024: ~1400 tokens
  custo_usd: 0.0042     # $3/M input

gpt_4o_high_detail:
  tiles_512: 4 + 85 base = 425 tokens
  custo_usd: 0.0011     # $2.5/M input (alteração 2025)

gemini_1_5_pro:
  fixo_por_imagem: 258 tokens
  custo_usd: 0.0003     # baratíssimo para vision em lote`}</CodeBlock>
      </Section>

      <Section title="Resumo decisivo" accent={accent}>
        <Callout tone="success" icon="✅">
          UI understanding / agents: Claude 3.5/3.7 Sonnet. Chart-to-data em escala: Gemini 1.5 Flash (custo). Reasoning rico sobre imagem única: GPT-4o ou Claude. Documentos escaneados em volume: serviço especializado (próximo módulo). Sempre redimensionar antes, sempre sanity-check output, sempre forçar schema JSON quando precisar de estrutura.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
