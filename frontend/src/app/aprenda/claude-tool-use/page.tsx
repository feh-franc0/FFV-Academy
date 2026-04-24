import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#a78bfa';

export const metadata = getModuleMetadata('claude-tool-use');

const quiz: QuizQuestion[] = [
  {
    question: 'No fluxo de tool use com Claude, o que acontece quando Claude retorna um bloco tool_use na resposta?',
    options: [
      'Claude executou a ferramenta internamente e o resultado já está na resposta — você só precisa ler o output',
      'Claude indica que quer chamar uma ferramenta com argumentos específicos. Você é responsável por executar a ferramenta no seu código e retornar o resultado para Claude em uma nova mensagem com role "user" contendo um bloco tool_result.',
      'O servidor da Anthropic executa a ferramenta automaticamente se ela estiver registrada na API',
      'Claude fez uma sugestão — você pode ignorar o tool_use e responder normalmente sem executar',
    ],
    correct: 1,
    explanation: 'Tool use na API do Claude é um protocolo de turno: (1) Claude decide usar uma ferramenta e retorna `stop_reason: "tool_use"` com um bloco `tool_use` contendo `name` e `input`; (2) você executa a ferramenta no seu código; (3) você retorna o resultado para Claude em uma mensagem `user` com `tool_result`; (4) Claude usa o resultado para formular a resposta final. Claude não executa nada — é um protocolo de handshake entre Claude e o seu código.',
  },
  {
    question: 'Qual é o papel do JSON Schema na definição de ferramentas para Claude?',
    options: [
      'JSON Schema é apenas documentação — Claude usa linguagem natural para entender a ferramenta, não o schema',
      'JSON Schema define os parâmetros aceitos pela ferramenta. Claude usa o schema para validar seus próprios argumentos antes de chamar, garantindo que os tipos e campos obrigatórios estejam corretos. Um schema bem definido reduz erros de argumento significativamente.',
      'JSON Schema é obrigatório apenas para ferramentas com mais de 3 parâmetros',
      'Claude ignora o JSON Schema e usa apenas o campo "description" para entender como chamar a ferramenta',
    ],
    correct: 1,
    explanation: 'O JSON Schema no `input_schema` da definição da ferramenta é fundamental: Claude o usa para saber exatamente quais parâmetros passar, quais são obrigatórios, e quais os tipos esperados. Um schema vago produz argumentos imprevisíveis. Um schema preciso — com `required`, `description` de cada campo, e tipos específicos — faz Claude passar argumentos corretos na primeira tentativa. O treinamento do Claude inclui seguir schemas JSON corretamente: é uma das capacidades mais confiáveis do modelo.',
  },
  {
    question: 'Em uma chamada multi-turn com tool use, Claude chama uma ferramenta get_weather("São Paulo"). A ferramenta retorna um erro 404 porque a cidade não foi encontrada. Como tratar corretamente?',
    options: [
      'Lance uma exceção Python/JS — Claude detecta a exceção automaticamente e tenta de novo',
      'Retorne o resultado como tool_result com `is_error: true` e o conteúdo do erro. Claude receberá isso, entenderá que houve um erro, e poderá tentar corrigir (ex: usar "Sao Paulo" sem acento) ou informar o usuário.',
      'Não retorne nada — o timeout da ferramenta indica para Claude que houve um erro',
      'Retorne uma mensagem de sucesso com corpo vazio — Claude infere o erro pelo conteúdo vazio',
    ],
    correct: 1,
    explanation: 'A forma correta de sinalizar erros de ferramenta é via `is_error: true` no bloco `tool_result`. Claude foi treinado para lidar com esse padrão: ao receber um tool_result com `is_error: true`, ele entende que a chamada falhou, lê o conteúdo do erro para diagnóstico, e pode tentar alternativas (buscar com nome diferente, pedir esclarecimento ao usuário, ou retornar uma mensagem informativa). Não retornar nada ou lançar exceção não comunicada quebra o protocolo de multi-turn.',
  },
];

export default function ClaudeToolUsePage() {
  return (
    <ModuleLayout
      slug="claude-tool-use"
      title="Tool Use com Claude: definir, chamar e orquestrar ferramentas"
      icon="🔧"
      xp={80}
      readTime={16}
      trailName="API Claude & Agents"
      trailColor="#a78bfa"
      nextSlug="claude-prompt-evaluation"
      nextTitle="Prompt Evaluation: datasets, grading automático e eval harness"
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
        Tool use é o que transforma Claude de chatbot em agente. Em vez de responder apenas com texto, Claude pode chamar funções do seu código — buscar dados, executar ações, consultar APIs — e usar os resultados para formular uma resposta fundamentada. É o mecanismo central de qualquer sistema de agente real.
      </p>

      <Section accent={accent} title="O protocolo de tool use">
        <CodeBlock>{`# Anatomia de uma ferramenta bem definida:

import anthropic

client = anthropic.Anthropic()

# Definição da ferramenta com JSON Schema preciso
tools = [
  {
    "name": "buscar_produto",
    "description": "Busca informações de um produto pelo ID ou nome.
                    Retorna preço, estoque e detalhes do produto.
                    Use quando o usuário perguntar sobre preço,
                    disponibilidade ou detalhes de um produto específico.",
    "input_schema": {
      "type": "object",
      "properties": {
        "identificador": {
          "type": "string",
          "description": "ID do produto (ex: 'PROD-123') ou nome parcial"
        },
        "tipo_busca": {
          "type": "string",
          "enum": ["id", "nome"],
          "description": "Tipo de identificador: 'id' para código exato, 'nome' para busca parcial"
        }
      },
      "required": ["identificador", "tipo_busca"]
    }
  }
]

# Conversa com tool use
response = client.messages.create(
  model="claude-opus-4-6",
  max_tokens=1024,
  tools=tools,
  messages=[
    {"role": "user", "content": "Qual o preço do produto PROD-456?"}
  ]
)

print(response.stop_reason)  # "tool_use"
print(response.content)
# [TextBlock("Vou buscar as informações desse produto."),
#  ToolUseBlock(id="toolu_01...", name="buscar_produto",
#               input={"identificador": "PROD-456", "tipo_busca": "id"})]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Multi-turn: o loop completo">
        <CodeBlock>{`# Função que executa a ferramenta do seu lado:
def executar_ferramenta(tool_name: str, tool_input: dict) -> str:
    if tool_name == "buscar_produto":
        # Aqui você chama seu banco, API, etc.
        produto = db.buscar(tool_input["identificador"])
        if not produto:
            return '{"erro": "Produto não encontrado"}'
        return f'{{"id": "{produto.id}", "nome": "{produto.nome}", "preco": {produto.preco}, "estoque": {produto.estoque}}}'
    raise ValueError(f"Ferramenta desconhecida: {tool_name}")

# Loop de multi-turn com tool use:
messages = [{"role": "user", "content": "Qual o preço do produto PROD-456?"}]

while True:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages
    )

    if response.stop_reason == "end_turn":
        # Claude respondeu sem usar ferramenta (ou após receber resultado)
        print("Resposta final:", response.content[0].text)
        break

    if response.stop_reason == "tool_use":
        # Adicionar a resposta de Claude ao histórico
        messages.append({"role": "assistant", "content": response.content})

        # Processar cada chamada de ferramenta
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                resultado = executar_ferramenta(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,  # ← obrigatório: liga ao tool_use
                    "content": resultado
                })

        # Retornar resultados para Claude
        messages.append({"role": "user", "content": tool_results})
        # Loop continua → Claude recebe o resultado e responde`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Chamadas paralelas de ferramentas">
        <CodeBlock>{`# Claude pode chamar múltiplas ferramentas em paralelo
# quando as dependências permitem:

tools_paralelos = [
    {"name": "get_weather", ...},
    {"name": "get_stocks", ...},
    {"name": "get_news", ...}
]

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools_paralelos,
    messages=[{
        "role": "user",
        "content": "Me dê um briefing matinal: tempo em SP, Ibovespa e notícias de tecnologia"
    }]
)

# Claude pode retornar MÚLTIPLOS tool_use blocks de uma vez:
# [ToolUseBlock(name="get_weather", ...),
#  ToolUseBlock(name="get_stocks", ...),
#  ToolUseBlock(name="get_news", ...)]

# Você executa as 3 em paralelo:
import asyncio

async def executar_paralelo(tool_calls):
    resultados = await asyncio.gather(*[
        executar_ferramenta_async(tc.name, tc.input)
        for tc in tool_calls
    ])
    return [
        {"type": "tool_result", "tool_use_id": tc.id, "content": res}
        for tc, res in zip(tool_calls, resultados)
    ]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Tratamento de erros robusto">
        <CodeBlock>{`# Padrão de error handling para tool use em produção:

def executar_ferramenta_seguro(tool_name: str, tool_input: dict) -> dict:
    try:
        resultado = executar_ferramenta(tool_name, tool_input)
        return {
            "type": "tool_result",
            "tool_use_id": tool_call_id,
            "content": resultado
        }
    except ResourceNotFoundError as e:
        # Erro de negócio — Claude pode tentar alternativa
        return {
            "type": "tool_result",
            "tool_use_id": tool_call_id,
            "is_error": True,
            "content": f"Não encontrado: {str(e)}. Tente buscar por nome."
        }
    except RateLimitError as e:
        # Erro temporário — Claude deve informar usuário
        return {
            "type": "tool_result",
            "tool_use_id": tool_call_id,
            "is_error": True,
            "content": f"Serviço temporariamente indisponível. Tente novamente em 30s."
        }
    except Exception as e:
        # Erro inesperado — log interno, resposta genérica para Claude
        logger.error(f"Tool error: {tool_name}", exc_info=True)
        return {
            "type": "tool_result",
            "tool_use_id": tool_call_id,
            "is_error": True,
            "content": "Erro interno ao executar a ferramenta."
        }`}</CodeBlock>
        <ComparisonTable
          headers={['Tipo de erro', 'Usar is_error', 'Conteúdo recomendado']}
          rows={[
            ['Não encontrado', 'Sim', 'O que buscou + sugestão de alternativa'],
            ['Permissão negada', 'Sim', 'O que não pode + por quê'],
            ['Timeout/indisponível', 'Sim', 'Temporário + quanto tempo esperar'],
            ['Erro interno do sistema', 'Sim', 'Mensagem genérica (não exponha internals)'],
            ['Sucesso com zero resultados', 'Não', 'JSON vazio ou lista vazia — não é erro'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>Tool use bem implementado é a base de qualquer agente confiável.</strong> O protocolo em si é simples — o diferencial é a qualidade dos schemas (descrições precisas), o tratamento correto de erros (is_error com contexto útil), e a orquestração do loop multi-turn. Com essa base, você pode construir desde assistentes simples até sistemas agênticos complexos.
      </Callout>

      <Callout>
        Próximo: <strong>Prompt Evaluation</strong> — como criar datasets de teste, grading automático com LLM-as-judge e um eval harness que detecta regressões antes de chegar em produção.
      </Callout>
    </div>
  );
}
