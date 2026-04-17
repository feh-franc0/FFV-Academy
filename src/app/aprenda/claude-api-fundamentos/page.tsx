import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata: Metadata = {
  title: 'API da Anthropic: messages, streaming, vision, batch e cache — FFV Academy',
  description: 'A API Messages da Anthropic: como enviar conversas, streaming de respostas, processar imagens, batch de milhares de requests e prompt caching para reduzir custo.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que usar streaming na API da Anthropic em vez de esperar a resposta completa?',
    options: [
      'Streaming é mais barato — a Anthropic cobra menos por tokens quando você usa stream: true',
      'Streaming reduz a latência percebida pelo usuário: o primeiro token aparece em ~300ms enquanto a resposta completa pode levar 10-30s para textos longos. Para interfaces de chat, o usuário começa a ler enquanto o modelo ainda gera.',
      'Streaming aumenta a qualidade da resposta — o modelo gera tokens melhores quando sabe que está sendo transmitido em tempo real',
      'Streaming é apenas para casos de teste — em produção sempre espere a resposta completa para evitar erros de parse',
    ],
    correct: 1,
    explanation: 'Time-to-first-token (TTFT) é a métrica chave em interfaces conversacionais. Com streaming, o usuário vê os primeiros tokens em ~300-500ms independente do tamanho da resposta. Sem streaming, ele espera o modelo terminar de gerar (pode ser 10-30s para respostas longas) antes de ver qualquer coisa. Em aplicações de produção com interface de usuário, streaming é praticamente obrigatório para UX aceitável. O custo de tokens é idêntico — streaming não muda o preço.',
  },
  {
    question: 'O que é prompt caching na API da Anthropic e quando ele reduz custo?',
    options: [
      'Prompt caching é um feature do cliente que salva respostas localmente — evita chamar a API para a mesma pergunta duas vezes',
      'Prompt caching permite marcar partes do prompt (system prompt, documentos de referência) para serem cacheadas por 5 minutos. Requests subsequentes que compartilham o mesmo prefix cacheado pagam apenas 10% do preço de input para essa parte.',
      'Prompt caching é automático — Anthropic cacheia automaticamente qualquer prompt repetido sem configuração necessária',
      'Prompt caching só funciona com Haiku — Sonnet e Opus não suportam o recurso',
    ],
    correct: 1,
    explanation: 'Prompt caching é explícito: você marca seções do prompt com `cache_control: {"type": "ephemeral"}`. O cache dura 5 minutos (renovado a cada hit). Requests que usam o cache pagam ~10% do preço normal de input para a parte cacheada. O caso ideal: system prompt longo + documentos de contexto (que raramente mudam) + mensagem do usuário (que muda sempre). Você cacheia o system + documentos (90% do input) e paga 10% por eles em requests subsequentes — economia de ~80-90% no custo de input para APIs com alto volume.',
  },
  {
    question: 'Qual é a diferença entre a Batch API e requests normais para processamento de grandes volumes?',
    options: [
      'Batch API não existe — o nome correto é Async API e funciona de forma completamente diferente',
      'Batch API processa múltiplos requests em paralelo imediato (< 1 segundo) versus requests normais que são sequenciais',
      'Batch API aceita até 10.000 requests por lote, processa em até 24 horas e custa 50% menos que requests síncronos. Ideal para análise offline: processar 10k documentos, gerar embeddings em lote, análise de sentimento de logs históricos — onde latência não importa.',
      'Batch API é apenas para clientes Enterprise — planos individuais só têm acesso a requests síncronos',
    ],
    correct: 2,
    explanation: 'A Messages Batch API é para trabalho assíncrono de alto volume: você envia um batch de até 10.000 requests, a Anthropic processa em background (até 24h, geralmente muito menos), e você busca os resultados. O desconto de 50% é o incentivo principal — para análise offline onde latência não importa, é a forma mais econômica de usar Claude em escala. Use síncronos para aplicações interativas; use Batch para pipelines de dados, análise histórica, geração de conteúdo em lote.',
  },
];

export default function ClaudeApiFundamentosPage() {
  return (
    <ModuleLayout
      slug="claude-api-fundamentos"
      title="API da Anthropic: messages, streaming, vision, batch e cache"
      icon="🔗"
      xp={75}
      readTime={15}
      trailName="Claude & Anthropic na Prática"
      trailColor="#cc785c"
      nextSlug="prompt-engineering-claude"
      nextTitle="Prompt engineering para Claude: técnicas que realmente funcionam"
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
        A API Messages da Anthropic é o primitivo fundamental para construir qualquer aplicação com Claude integrado. Não é um wrapper de chat — é uma API de geração de texto com primitivos para streaming, processamento de imagens, cache de prompts e processamento em lote. Entender cada um é o que separa uma integração amadora de uma que funciona em produção.
      </p>

      <Section accent={accent} title="Messages API: a estrutura básica">
        <CodeBlock>{`# SDK Python — pip install anthropic
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")

# Request básico
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    system="Você é um assistente técnico especialista em Python. Responda em PT-BR.",
    messages=[
        {"role": "user", "content": "Explique o GIL em 3 frases"}
    ]
)

print(response.content[0].text)
print(f"Tokens usados: {response.usage.input_tokens} in, {response.usage.output_tokens} out")

# Conversa multi-turno
messages = []
messages.append({"role": "user", "content": "O que é o GIL?"})
# (chamada à API retorna resposta)
messages.append({"role": "assistant", "content": response.content[0].text})
messages.append({"role": "user", "content": "E como isso afeta o asyncio?"})
# Nova chamada com o histórico completo

# IMPORTANTE: a API é stateless — você é responsável por enviar
# o histórico completo de mensagens a cada request.
# Não há sessão no servidor. Todo o estado fica no cliente.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Streaming: respostas em tempo real">
        <CodeBlock>{`# Streaming: o modelo envia tokens à medida que gera
import anthropic

client = anthropic.Anthropic()

# Context manager para streaming
with client.messages.stream(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Escreva um poema sobre o GIL"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
    print()  # nova linha ao final

# Com eventos completos (para saber quando termina, ver stop_reason, etc.)
with client.messages.stream(...) as stream:
    for event in stream:
        if event.type == "content_block_delta":
            print(event.delta.text, end="", flush=True)
        elif event.type == "message_stop":
            print(f"\n\nStop reason: {stream.get_final_message().stop_reason}")

# SDK TypeScript/JavaScript:
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const stream = await client.messages.stream({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});

for await (const chunk of stream) {
  if (chunk.type === "content_block_delta") {
    process.stdout.write(chunk.delta.text);
  }
}

# Para Next.js API Routes (streaming SSE):
export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const anthropicStream = await client.messages.stream({ ... });

  (async () => {
    for await (const chunk of anthropicStream) {
      if (chunk.type === "content_block_delta") {
        await writer.write(encoder.encode(\`data: \${chunk.delta.text}\n\n\`));
      }
    }
    await writer.close();
  })();

  return new Response(stream.readable, {
    headers: { "Content-Type": "text/event-stream" },
  });
}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Vision: processar imagens com Claude">
        <CodeBlock>{`# Claude Sonnet e Opus suportam imagens (Haiku tem suporte limitado)
# Formatos: JPEG, PNG, GIF, WebP
# Limite: até 20 imagens por request; cada imagem ≤ 5MB

import anthropic, base64

client = anthropic.Anthropic()

# Opção 1: URL pública (mais simples)
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "url",
                    "url": "https://exemplo.com/screenshot.png"
                }
            },
            {
                "type": "text",
                "text": "Descreva o que está nesta imagem e identifique eventuais problemas de UI."
            }
        ]
    }]
)

# Opção 2: Base64 (para imagens locais ou sem URL pública)
with open("screenshot.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": image_data
                }
            },
            {"type": "text", "text": "Existe algum erro ou warning neste screenshot de log?"}
        ]
    }]
)
print(response.content[0].text)

# Custo de imagem: aproximadamente 1.600 tokens base + tokens por dimensão
# 1080x1080 px ≈ 1.600 tokens ≈ $0.005 com Sonnet (input)
# Otimização: redimensione imagens para max 1.568px no lado maior antes de enviar`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Prompt Caching: reduzir custo em APIs de alto volume">
        <CodeBlock>{`# Prompt caching: marque seções que não mudam entre requests

# Caso ideal: system prompt longo + documentos de referência + pergunta do usuário
# O system + documentos ficam cacheados; apenas a pergunta varia

import anthropic

client = anthropic.Anthropic()

# Documento de referência longo (1000+ tokens) que é o mesmo em todos os requests
MANUAL_TECNICO = """
# Manual Técnico do Sistema de Pagamentos
[... milhares de linhas de documentação ...]
"""

def perguntar_sobre_manual(pergunta: str) -> str:
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": "Você é um assistente especialista no manual técnico abaixo.",
                "cache_control": {"type": "ephemeral"}  # ← cacheia esta parte
            },
            {
                "type": "text",
                "text": MANUAL_TECNICO,
                "cache_control": {"type": "ephemeral"}  # ← cacheia o manual também
            }
        ],
        messages=[{"role": "user", "content": pergunta}]  # ← não cacheado (varia)
    )

    # Verificar se o cache foi usado:
    usage = response.usage
    print(f"Input normal: {usage.input_tokens} tokens")
    print(f"Input cacheado: {usage.cache_read_input_tokens} tokens (10% do preço)")
    print(f"Cache criado: {usage.cache_creation_input_tokens} tokens (110% do preço, uma vez)")

    return response.content[0].text

# Primeiro request: paga 110% para criar o cache (uma vez)
# Requests subsequentes (dentro de 5min): paga 10% para a parte cacheada
# Economia real em 100 requests: ~80-90% do custo de input`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Batch API: processamento em lote com 50% de desconto">
        <CodeBlock>{`# Messages Batch API — para alto volume sem urgência de latência

import anthropic, json
from datetime import datetime

client = anthropic.Anthropic()

# Criar um batch de requests
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"analise-{i}",   # ID único para rastrear o resultado
            "params": {
                "model": "claude-haiku-4-5",  # Haiku + batch = custo mínimo
                "max_tokens": 500,
                "messages": [{
                    "role": "user",
                    "content": f"Classifique o sentimento deste review: {review}"
                }]
            }
        }
        for i, review in enumerate(lista_de_reviews)  # até 10.000 por batch
    ]
)

print(f"Batch criado: {batch.id}")
print(f"Status: {batch.processing_status}")  # "in_progress"

# Verificar status (polling — geralmente termina em minutos)
import time
while True:
    batch = client.messages.batches.retrieve(batch.id)
    if batch.processing_status == "ended":
        break
    print(f"Aguardando... {batch.request_counts}")
    time.sleep(30)

# Processar resultados
for result in client.messages.batches.results(batch.id):
    if result.result.type == "succeeded":
        texto = result.result.message.content[0].text
        print(f"{result.custom_id}: {texto}")
    else:
        print(f"{result.custom_id}: ERRO - {result.result.error}")
`}</CodeBlock>
        <ComparisonTable
          headers={['Abordagem', 'Latência', 'Custo', 'Ideal para']}
          rows={[
            ['Síncrono + streaming', '< 1s TTFT', '100%', 'Chat, interfaces interativas'],
            ['Síncrono sem stream', '5-30s', '100%', 'Scripts, automação simples'],
            ['Batch API', 'Minutos-horas', '50%', 'Análise em lote, pipelines offline'],
            ['Síncrono + cache', '< 1s', '~15-20%*', 'APIs com system prompt fixo'],
          ]}
          accent={accent}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>* Para a parte cacheada. Custo total depende do tamanho do cache vs mensagem do usuário.</p>
      </Section>

      <Callout tone="success">
        <strong>Decisão de API:</strong> interface de usuário → streaming obrigatório. System prompt longo e fixo → prompt caching obrigatório. Processamento em lote sem urgência → Batch API com Haiku = custo mínimo. Vision quando precisar processar screenshots, diagramas ou documentos escaneados. A combinação caching + Haiku para APIs internas de alto volume pode reduzir custo em 10-20x versus Opus síncrono sem cache.
      </Callout>

      <Callout>
        Próximo: <strong>Prompt engineering para Claude</strong> — as técnicas que realmente funcionam: XML tags, chain-of-thought, prefill, few-shot e como extrair JSON confiável.
      </Callout>
    </div>
  );
}
