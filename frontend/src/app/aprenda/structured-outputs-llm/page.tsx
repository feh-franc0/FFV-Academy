import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('structured-outputs-llm');

const ACCENT = '#6366f1';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre JSON mode e Structured Outputs (constrained decoding)?',
    options: [
      'São termos intercambiáveis — ambos garantem JSON válido com schema específico',
      'JSON mode garante JSON sintaticamente válido mas sem schema. Structured Outputs usa constrained decoding para garantir que o output corresponde exatamente ao JSON Schema fornecido, incluindo campos obrigatórios e tipos',
      'JSON mode é exclusivo para modelos GPT; Structured Outputs é apenas para Claude',
      'Structured Outputs é mais lento porque valida o output depois da geração completa',
    ],
    correct: 1,
    explanation:
      'JSON mode instrui o modelo a gerar JSON válido mas não garante o schema. Structured Outputs usa constrained decoding (grammar-based sampling): durante a geração, tokens inválidos para o schema atual são mascarados — garantia matemática de conformidade. Resultado: zero casos de schema inválido, com ligeira latência extra na primeira chamada (compilação da grammar).',
  },
  {
    question: 'O que é a biblioteca Instructor e qual problema específico resolve?',
    options: [
      'Instructor é um framework de treinamento para fine-tuning de LLMs com Pydantic',
      'Wrapper em cima de LLM clients que integra Pydantic: você define um modelo Pydantic, Instructor gera o schema, faz a chamada LLM, valida o output, e automaticamente faz retry com mensagem de erro se a validação Pydantic falhar',
      'Instructor é uma biblioteca de prompts para ensinar LLMs a seguir instruções mais precisas',
      'Framework para orquestração de agentes similar ao LangChain, mas com foco em tipagem',
    ],
    correct: 1,
    explanation:
      'Instructor abstrai o ciclo: define schema Pydantic → gera prompt com schema → chama LLM → parseia JSON → valida com Pydantic → se inválido, retry automático com o erro de validação como feedback. Funciona com OpenAI, Anthropic, Gemini e mais. Elimina boilerplate de validação e retry, e melhora a qualidade do output ao incluir o erro Pydantic no retry.',
  },
  {
    question: 'Por que validação com retry é superior a ignorar campos inválidos?',
    options: [
      'Ignorar é mais eficiente — deve ser a estratégia padrão em sistemas de alto volume',
      'Retry com mensagem de erro de validação dá ao LLM feedback específico sobre o que errou — o modelo frequentemente corrige o erro na segunda tentativa. Ignorar silencia o problema e produz dados incompletos que causam bugs sutis downstream',
      'A diferença é irrelevante — LLMs modernos nunca geram JSON inválido em produção',
      'Retry sempre melhora a qualidade mas não é prático devido ao custo dobrado de tokens',
    ],
    correct: 1,
    explanation:
      'Quando o LLM gera um campo com tipo errado, ignorar silencia o erro. Retry com o erro Pydantic ("field count must be integer, got string five") dá contexto específico ao modelo, que então corrige o campo. Taxa de sucesso em retry 1: >95% em modelos modernos para erros simples. Para erros recorrentes, o padrão indica que o schema precisa ser reformulado.',
  },
  {
    question: 'Qual a vantagem de function calling vs prompt "retorne JSON" na prática?',
    options: [
      'Não há diferença prática — ambos produzem JSON de qualidade similar em modelos modernos',
      'Function calling coloca o schema fora do prompt (não consome tokens do usuário), o modelo foi treinado especificamente para schemas de function calling, e o parser é nativo — resulta em maior compliance e menos tokens desperdiçados em formatação',
      'Function calling é mais lento porque exige parsing adicional no lado do servidor',
      'JSON mode com prompt suporta schemas mais complexos e aninhados que function calling',
    ],
    correct: 1,
    explanation:
      'Com "retorne JSON" no prompt: o schema ocupa tokens de contexto, o modelo não foi fine-tuned especificamente para esse formato. Com function calling: o schema vai num campo separado (tools), o modelo foi treinado com pares (instruction, function call), e o provider retorna JSON já parseado no campo tool_use. Compliance é sistematicamente maior com function calling para schemas médios/complexos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="structured-outputs-llm"
      title="Structured Outputs: JSON mode, function calling e Instructor"
      icon="📐"
      xp={75}
      readTime={14}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="tool-calling"
      nextTitle="Tool Calling: ferramentas para agentes LLM"
      relatedSlugs={['tool-calling', 'claude-api-fundamentos', 'prompt-engineering-claude']}
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
        LLMs em produção precisam retornar dados que código pode processar — não texto livre. Extrair campos
        de uma resposta em prosa via regex é frágil e não escala. Structured Outputs, function calling e
        Instructor transformam LLMs em componentes que se integram limpos em sistemas de software, com
        garantias de schema e validação automática.
      </p>

      <Section title="Formas de obter saída estruturada" accent={ACCENT}>
        <LayerStack
          title="Evolução de abordagens para output estruturado"
          accent={ACCENT}
          separatorLabel="mais confiável →"
          layers={[
            { label: 'Parsing de texto livre', content: 'Regex/heurísticas para extrair campos de resposta em prosa', note: 'frágil, não recomendado', tone: 'default' },
            { label: 'Prompt "retorne JSON"', content: 'Instrução no prompt + json.loads() com try/except', note: 'melhor mas ainda falha', tone: 'default' },
            { label: 'JSON mode', content: 'Provider garante JSON sintático — schema não garantido', tone: 'writable' },
            { label: 'Function calling', content: 'Schema declarado via tools — compliance alta, nativo nos providers', tone: 'writable' },
            { label: 'Structured Outputs + Instructor', content: 'Constrained decoding ou Pydantic + retry automático', note: 'máxima confiabilidade', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Abordagem', 'Garante JSON?', 'Garante schema?', 'Retry automático?']}
          rows={[
            ['Texto livre + regex', 'Não', 'Não', 'Não'],
            ['Prompt + json.loads', 'Às vezes', 'Não', 'Manual'],
            ['JSON mode', 'Sim', 'Não', 'Manual'],
            ['Function calling', 'Sim', 'Alta', 'Manual'],
            ['OpenAI Structured Outputs', 'Sim', 'Garantida', 'Manual'],
            ['Instructor + Pydantic', 'Sim', 'Garantida + validators', 'Automático'],
          ]}
        />
      </Section>

      <Section title="Function Calling com Anthropic" accent={ACCENT}>
        <CodeBlock lang="python">{`from anthropic import Anthropic
client = Anthropic()

EXTRACTION_TOOL = {
    "name": "extract_issue_data",
    "description": "Extrai dados estruturados de um relatório de bug",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Título conciso do bug"},
            "severity": {
                "type": "string",
                "enum": ["critical", "high", "medium", "low"],
            },
            "affected_components": {
                "type": "array",
                "items": {"type": "string"},
            },
            "steps_to_reproduce": {
                "type": "array",
                "items": {"type": "string"},
            },
            "is_regression": {"type": "boolean"},
        },
        "required": ["title", "severity", "affected_components",
                     "steps_to_reproduce", "is_regression"],
    },
}

def extract_bug_report(raw_text: str) -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=[EXTRACTION_TOOL],
        tool_choice={"type": "tool", "name": "extract_issue_data"},  # forçar tool
        messages=[{
            "role": "user",
            "content": f"Extraia os dados estruturados:\\n\\n{raw_text}"
        }]
    )
    for block in response.content:
        if block.type == "tool_use" and block.name == "extract_issue_data":
            return block.input
    raise ValueError("LLM não chamou a ferramenta de extração")`}</CodeBlock>

        <CodeBlock lang="python">{`# OpenAI Structured Outputs — constrained decoding com Pydantic
from openai import OpenAI
from pydantic import BaseModel
from typing import Literal

client = OpenAI()

class BugReport(BaseModel):
    title: str
    severity: Literal["critical", "high", "medium", "low"]
    affected_components: list[str]
    steps_to_reproduce: list[str]
    is_regression: bool

def extract_with_structured_output(raw_text: str) -> BugReport:
    response = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[{"role": "user", "content": f"Extraia os dados:\\n\\n{raw_text}"}],
        response_format=BugReport,  # Pydantic model → JSON schema
    )
    # response.choices[0].message.parsed é um BugReport validado garantidamente
    return response.choices[0].message.parsed`}</CodeBlock>
      </Section>

      <Section title="Instructor: o padrão de produção com Pydantic" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Instructor unifica Pydantic + LLM com retry automático, suporte a múltiplos providers e logging.
          É o padrão de facto para structured outputs em produção Python em 2026.
        </p>
        <CodeBlock lang="python">{`# pip install instructor
import instructor
from anthropic import Anthropic
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re

client = instructor.from_anthropic(Anthropic())

class ExtractedPerson(BaseModel):
    name: str = Field(description="Nome completo da pessoa")
    role: str = Field(description="Cargo ou função")
    email: Optional[str] = Field(None, description="Email se mencionado")
    years_experience: int = Field(ge=0, le=50)
    skills: list[str] = Field(min_length=1, max_length=10)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r"[^@]+@[^@]+\\.[^@]+", v):
            raise ValueError(f"Email inválido: {v}")
        return v.lower()

def extract_person(text: str) -> ExtractedPerson:
    # max_retries: retry automático com feedback do erro Pydantic
    return client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        max_retries=3,
        messages=[{
            "role": "user",
            "content": f"Extraia as informações da pessoa mencionada:\\n{text}"
        }],
        response_model=ExtractedPerson,
    )

# Instructor suporta múltiplos providers
import instructor
from openai import OpenAI as OpenAIClient

oai_client = instructor.from_openai(OpenAIClient())`}</CodeBlock>

        <Callout tone="info">
          O retry automático do Instructor inclui o erro Pydantic na mensagem: "ValidationError:
          years_experience must be {'>'}= 0, got -5". Isso dá ao LLM contexto específico para corrigir.
          Taxa de sucesso após retry 1: ~97% para erros simples de tipo/range em modelos modernos.
        </Callout>
      </Section>

      <Section title="Schemas avançados: discriminated unions e aninhamento" accent={ACCENT}>
        <CodeBlock lang="python">{`from pydantic import BaseModel, Field
from typing import Union, Literal, Optional
import instructor
from anthropic import Anthropic

client = instructor.from_anthropic(Anthropic())

# Discriminated Union — um de vários tipos possíveis
class SearchEvent(BaseModel):
    event_type: Literal["search"] = "search"
    query: str
    filters: dict[str, str] = {}

class PurchaseEvent(BaseModel):
    event_type: Literal["purchase"] = "purchase"
    product_id: str
    amount_cents: int = Field(gt=0)
    currency: str = Field(pattern="^[A-Z]{3}$")

class PageViewEvent(BaseModel):
    event_type: Literal["page_view"] = "page_view"
    url: str
    duration_seconds: float = Field(ge=0)

class ClassifiedEvent(BaseModel):
    event: Union[SearchEvent, PurchaseEvent, PageViewEvent] = Field(
        discriminator="event_type"
    )

def classify_user_event(description: str) -> ClassifiedEvent:
    return client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"Classifique este evento de usuário:\\n{description}"
        }],
        response_model=ClassifiedEvent,
    )

# Extrair lista de entidades (iterable streaming)
from instructor import from_anthropic
import instructor

client_stream = instructor.from_anthropic(Anthropic())

class Skill(BaseModel):
    name: str
    proficiency: Literal["beginner", "intermediate", "advanced", "expert"]

class Developer(BaseModel):
    name: str
    skills: list[Skill]

# Streaming com Instructor
developers = client_stream.messages.create_iterable(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    messages=[{"role": "user", "content": "Liste os devs e suas skills: Alice é expert em Python..."}],
    response_model=Developer,
)`}</CodeBlock>

        <DecisionBox
          scenario="Extrair dados estruturados de documentos jurídicos para indexação automática"
          winner="Instructor com Pydantic + validators customizados"
          winnerColor={ACCENT}
          why="Retry automático com feedback Pydantic resolve falhas silenciosamente. Validators capturam regras de negócio (datas, CNPJs). Claude com Instructor tem compliance >99% após 2 retries para schemas típicos."
          alternatives={[
            { name: 'OpenAI Structured Outputs', note: 'Zero falhas de schema por constrained decoding — mas preso ao OpenAI' },
            { name: 'Function calling direto', note: 'Mais controle, menos abstração — bom com infra de retry própria' },
            { name: 'DSPy com asserções', note: 'Para pipelines onde o schema muda dinamicamente' },
          ]}
        />
        <QAItem
          q="Structured Outputs funciona com modelos locais (Ollama, llama.cpp)?"
          a={<>Sim, com grammar-based sampling. llama.cpp suporta grammar GBNF — você define a grammar e o modelo só gera tokens válidos. Ollama expõe "format": "json" para JSON válido e "format": schema_dict para JSON Schema. Instructor tem suporte experimental para Ollama. A qualidade de compliance em modelos locais é menor que em GPT-4o/Claude para schemas complexos — funciona bem com schemas simples em Mistral-7B ou Phi-4.</>}
        />
        <QAItem
          q="Como tratar campos opcionais que o modelo preenche incorretamente com frequência?"
          a={<>Estratégias: (1) Torne Optional[X] = None e descreva "preencha APENAS se explicitamente mencionado"; (2) Adicione validator que aceita valores incoerentes e converte para None; (3) Separe em dois schemas: "confident" com apenas campos claros, "full" com todos — use o confident como default e full apenas quando a pergunta é específica sobre esses campos; (4) Inclua exemplos negativos na description: "se o email não aparecer no texto, deixe null".</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Nunca use regex para parsear output de LLM em produção — é frágil.
        Function calling garante compliance alta sem código extra. Instructor + Pydantic é o padrão de
        produção: schema declarativo, validação automática, retry com feedback. OpenAI Structured Outputs
        (constrained decoding) garante matematicamente o schema. Discriminated unions com Literal são
        a melhor forma de modelar outputs com múltiplos tipos possíveis. Para modelos locais: grammar
        GBNF no llama.cpp.
      </Callout>
    </div>
  );
}
