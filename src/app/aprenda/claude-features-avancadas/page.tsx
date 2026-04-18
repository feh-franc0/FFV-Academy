import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#a78bfa';

export const metadata = getModuleMetadata('claude-features-avancadas');

const quiz: QuizQuestion[] = [
  {
    question: 'No extended thinking, o que acontece quando você configura display: "omitted"?',
    options: [
      'Claude não pensa — o extended thinking é desligado e os tokens de raciocínio não são gerados',
      'O campo thinking volta vazio (com signature para multi-turn), mas você paga pelo thinking completo — o modelo pensou, só não mostra',
      'Apenas as primeiras 100 palavras do raciocínio são retornadas, com economia de tokens',
      'O thinking é convertido em comentários dentro do texto da resposta final',
    ],
    correct: 1,
    explanation: 'Com display: "omitted", Claude faz o raciocínio interno normalmente (e você paga por todos os tokens de thinking), mas a API retorna o campo thinking vazio — apenas a signature criptografada é incluída, necessária para continuidade em multi-turn. Benefício: time-to-first-text-token mais rápido porque o servidor não precisa streamar os tokens de thinking. É útil quando você não vai mostrar o raciocínio ao usuário mas quer a qualidade do extended thinking.',
  },
  {
    question: 'Qual a vantagem concreta do recurso de citations da API sobre pedir "cite suas fontes" no prompt?',
    options: [
      'Citations por prompt são mais baratas porque não requerem processamento adicional do documento',
      'A feature de citations garante citações válidas com ponteiros para localizações exatas no documento, e o cited_text não conta como output token — prompt-based pode inventar citações',
      'Não há vantagem — é a mesma funcionalidade com interface diferente',
      'Citations da API funcionam apenas com PDFs; prompts funcionam com qualquer formato',
    ],
    correct: 1,
    explanation: 'A feature de citations tem 3 vantagens concretas sobre prompt-based: (1) economia de output tokens — cited_text é extraído automaticamente e não conta na cobrança; (2) confiabilidade — citations apontam para localizações reais (char index, page number, block index) em vez de texto inventado; (3) qualidade superior — em avaliações da Anthropic, a feature citou trechos mais relevantes que abordagens baseadas em prompt. O custo é um pequeno aumento de input tokens para chunking.',
  },
  {
    question: 'Você quer usar extended thinking com tool use. Qual limitação é obrigatória?',
    options: [
      'Extended thinking e tool use são incompatíveis — não podem ser usados na mesma request',
      'Você pode usar qualquer tool_choice, mas o thinking é desligado automaticamente durante chamadas de ferramenta',
      'Só funciona com tool_choice: "auto" (ou "none") — forçar uma ferramenta específica retorna erro',
      'O budget_tokens deve ser maior que max_tokens quando usando ferramentas',
    ],
    correct: 2,
    explanation: 'Extended thinking com tool use só aceita tool_choice: "auto" (default) ou "none". Usar tool_choice: "any" ou forçar uma ferramenta específica retorna erro 400. Além disso, você DEVE passar os thinking blocks completos e inalterados de volta na mensagem do assistant quando enviar tool_results — se omitir ou modificar, o contexto de raciocínio se perde. Com interleaved thinking (Claude 4+), o modelo pode pensar entre chamadas de ferramentas para raciocínio mais sofisticado.',
  },
];

export default function ClaudeFeaturesAvancadasPage() {
  return (
    <ModuleLayout
      slug="claude-features-avancadas"
      title="Features avançadas: extended thinking, citations, code execution"
      icon="🧪"
      xp={75}
      readTime={15}
      trailName="API Claude & Agents"
      trailColor="#a78bfa"
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
        A API Messages cobre o básico — enviar texto, receber texto. Mas Claude tem features que transformam a qualidade da resposta e abrem casos de uso impossíveis com chatbots genéricos. <strong>Extended thinking</strong> dá raciocínio profundo. <strong>Citations</strong> dá respostas verificáveis. <strong>Vision e PDF</strong> processam documentos nativamente. <strong>Code execution</strong> roda código real num sandbox. Cada feature tem custo, benefício e trade-offs concretos.
      </p>

      <Section accent={accent} title="Extended thinking: quando Claude precisa pensar antes de responder">
        <p>
          Extended thinking cria blocos de raciocínio interno (<code>thinking</code>) antes da resposta final. Claude literalmente para, analisa passo a passo, e só então responde. É a diferença entre responder de imediato e resolver um problema complexo no papel antes de falar.
        </p>

        <CodeBlock lang="python">{`import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000  # máx tokens para raciocínio
    },
    messages=[{
        "role": "user",
        "content": "Prove que existem infinitos primos p onde p mod 4 == 3"
    }],
)

for block in response.content:
    if block.type == "thinking":
        print(f"Raciocínio: {block.thinking}")
    elif block.type == "text":
        print(f"Resposta: {block.text}")`}</CodeBlock>

        <Callout tone="warn" icon="⚠️">
          <strong>budget_tokens controla o teto.</strong> <code>budget_tokens</code> define o máximo de tokens que Claude pode gastar pensando. Deve ser menor que <code>max_tokens</code>. Se o problema for simples, Claude usa menos — o budget é um teto, não um alvo.
        </Callout>

        <ComparisonTable
          headers={['Modelo', 'Output máximo', 'Thinking']}
          rows={[
            ['Opus 4.7', '128k tokens', 'Adaptive thinking (obrigatório)'],
            ['Opus 4.6', '128k tokens', 'Manual ou adaptive'],
            ['Sonnet 4.6', '64k tokens', 'Manual ou adaptive'],
            ['Haiku 4.5', '64k tokens', 'Manual'],
          ]}
        />

        <p>
          <strong>Display modes</strong> — você controla o que volta na resposta:
        </p>

        <ComparisonTable
          headers={['Mode', 'O que retorna', 'Custo', 'Quando usar']}
          rows={[
            ['summarized (default)', 'Resumo do raciocínio', 'Paga pelo thinking completo', 'Debug, UX transparente'],
            ['omitted', 'Campo vazio + signature', 'Mesmo custo, TTFT mais rápido', 'Produção (não mostra thinking)'],
          ]}
        />

        <Callout tone="warn" icon="⚠️">
          <strong>Thinking + Tool Use: regra crítica.</strong> Com extended thinking e tool use juntos, só funciona <code>tool_choice: &quot;auto&quot;</code> ou <code>&quot;none&quot;</code>. Forçar uma ferramenta específica dá erro 400. E você <strong>deve</strong> passar os thinking blocks inalterados de volta ao enviar tool_results.
        </Callout>
      </Section>

      <Section accent={accent} title="Interleaved thinking: raciocínio entre ferramentas">
        <p>
          Nos modelos Claude 4+, o thinking pode acontecer <em>entre</em> chamadas de ferramentas — não só antes da primeira resposta. Isso permite raciocínio multi-step sofisticado:
        </p>

        <CodeBlock lang="text">{`User: "Analise a performance do auth.py e sugira otimizações"

[thinking] "Preciso primeiro ler o arquivo para entender a estrutura..."
[tool_use: Read("auth.py")]
[tool_result: conteúdo do arquivo]
[thinking] "Vejo um N+1 query na linha 42. Preciso verificar se há índice..."
[tool_use: Read("models.py")]
[tool_result: conteúdo do arquivo]
[thinking] "Confirmado — não há índice no campo user_id. A solução é..."
[text] "Encontrei 3 problemas de performance: ..."}`}</CodeBlock>

        <p>
          Com interleaved thinking, o <code>budget_tokens</code> é o total de <em>todos</em> os blocos de thinking no turn — pode ser maior que <code>max_tokens</code> porque thinking tokens e text tokens são contados separadamente.
        </p>
      </Section>

      <Section accent={accent} title="Citations: respostas com referências verificáveis">
        <p>
          Citations transformam Claude de &quot;confie em mim&quot; para &quot;aqui está exatamente de onde tirei isso&quot;. Você envia documentos com <code>citations.enabled: true</code>, e a resposta volta com ponteiros exatos para trechos do documento original.
        </p>

        <CodeBlock lang="python">{`response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "text",
                    "media_type": "text/plain",
                    "data": "O custo do S3 Standard é $0.023/GB. "
                            "O S3 Glacier Deep Archive custa $0.00099/GB.",
                },
                "title": "Preços AWS S3",
                "citations": {"enabled": True},
            },
            {
                "type": "text",
                "text": "Qual a diferença de custo entre S3 Standard e Glacier?"
            },
        ],
    }],
)`}</CodeBlock>

        <p>A resposta volta com blocos de texto interligados por citações:</p>

        <CodeBlock lang="json">{`{
  "content": [
    {"type": "text", "text": "O S3 Standard custa "},
    {
      "type": "text",
      "text": "$0.023/GB",
      "citations": [{
        "type": "char_location",
        "cited_text": "O custo do S3 Standard é $0.023/GB.",
        "document_index": 0,
        "start_char_index": 0,
        "end_char_index": 36
      }]
    },
    {"type": "text", "text": " enquanto o Glacier Deep Archive custa "},
    {
      "type": "text",
      "text": "$0.00099/GB",
      "citations": [{
        "type": "char_location",
        "cited_text": "O S3 Glacier Deep Archive custa $0.00099/GB.",
        "document_index": 0,
        "start_char_index": 37,
        "end_char_index": 82
      }]
    }
  ]
}`}</CodeBlock>

        <ComparisonTable
          headers={['Tipo de documento', 'Formato de citação', 'Granularidade']}
          rows={[
            ['Plain text', 'char_location (start/end char index)', 'Sentença (chunking automático)'],
            ['PDF', 'page_location (start/end page number)', 'Sentença por página'],
            ['Custom content', 'content_block_location (start/end block index)', 'Blocos que você define'],
          ]}
        />

        <Callout tone="info" icon="💡">
          <strong>cited_text não conta como output token.</strong> O texto citado é extraído automaticamente e <strong>não conta na cobrança de output tokens</strong>. Quando passado de volta em conversas multi-turn, também não conta como input token. Isso torna citations mais barato que pedir &quot;cite suas fontes&quot; no prompt.
        </Callout>
      </Section>

      <Section accent={accent} title="Vision e PDF: processamento nativo de documentos">
        <p>
          Claude processa imagens e PDFs diretamente na API — sem OCR externo, sem conversão manual:
        </p>

        <CodeBlock lang="python">{`import base64

with open("architecture-diagram.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": image_data,
                },
            },
            {
                "type": "text",
                "text": "Descreva esta arquitetura. Identifique SPOFs."
            },
        ],
    }],
)`}</CodeBlock>

        <p>
          Para PDFs, a API extrai texto automaticamente e permite citations por página:
        </p>

        <CodeBlock lang="python">{`with open("contract.pdf", "rb") as f:
    pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=2048,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": pdf_data,
                },
                "title": "Contrato de serviço",
                "citations": {"enabled": True},
            },
            {
                "type": "text",
                "text": "Resuma as cláusulas de SLA e penalidades."
            },
        ],
    }],
)`}</CodeBlock>

        <ComparisonTable
          headers={['Formato', 'Suporte', 'Limites']}
          rows={[
            ['Imagens (PNG, JPEG, GIF, WebP)', 'Todos os modelos', '~1600 tokens por imagem'],
            ['PDF', 'Todos os modelos ativos', 'Texto extraído automaticamente'],
            ['CSV, XLSX, DOCX', 'Não suportado direto', 'Converter para texto e enviar inline'],
          ]}
        />
      </Section>

      <Section accent={accent} title="Code execution e Files API">
        <p>
          O code execution permite que Claude escreva e rode código Python num sandbox seguro — útil para cálculos, geração de gráficos e transformações de dados:
        </p>

        <CodeBlock lang="python">{`response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    tools=[{
        "type": "computer_20241022",
        "name": "code_execution",
    }],
    messages=[{
        "role": "user",
        "content": "Calcule o desvio padrão de [23, 45, 12, 67, 34, 89, 56] "
                   "e gere um histograma."
    }],
)`}</CodeBlock>

        <p>
          A <strong>Files API</strong> permite upload de arquivos que podem ser referenciados em múltiplas conversas:
        </p>

        <CodeBlock lang="python">{`# Upload do arquivo
file = client.files.create(
    file=open("dataset.csv", "rb"),
    purpose="assistants",
)

# Referenciar por file_id em qualquer conversa
response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=2048,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {"type": "file", "file_id": file.id},
                "citations": {"enabled": True},
            },
            {"type": "text", "text": "Analise as tendências neste dataset."},
        ],
    }],
)`}</CodeBlock>

        <Callout tone="info" icon="💡">
          <strong>Quando usar code execution vs ferramentas externas:</strong> Code execution é ideal para cálculos, visualizações e transformações de dados simples. Para operações complexas (acessar banco de dados, chamar APIs, manipular filesystem), use tool use ou MCP — code execution roda num sandbox isolado sem acesso externo.
        </Callout>
      </Section>

      <Section accent={accent} title="Mapa de decisão: quando usar cada feature">
        <ComparisonTable
          headers={['Preciso de...', 'Feature', 'Custo extra']}
          rows={[
            ['Raciocínio profundo em problemas complexos', 'Extended thinking', 'Tokens de thinking (pode ser alto)'],
            ['Respostas verificáveis com fontes', 'Citations', 'Leve aumento de input tokens'],
            ['Analisar imagens ou diagramas', 'Vision', '~1600 tokens por imagem'],
            ['Extrair informação de PDFs', 'PDF + Citations', 'Input tokens do documento'],
            ['Executar cálculos e gerar gráficos', 'Code execution', 'Tokens do código + resultado'],
            ['Reusar documentos em várias conversas', 'Files API', 'Storage + input por referência'],
            ['Máxima qualidade em tarefa difícil', 'Thinking + Citations + Vision', 'Combinação dos custos'],
          ]}
        />

        <Callout tone="warn" icon="⚠️">
          <strong>Incompatibilidade: Citations + Structured Outputs.</strong> Citations e Structured Outputs (output_format com JSON schema) <strong>não podem ser usados juntos</strong>. Citations intercalam blocos de texto com citações, o que é incompatível com schema JSON estrito. Se precisar de ambos, faça em duas chamadas separadas.
        </Callout>
      </Section>
    </div>
  );
}
