import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('pydantic-v2-serio');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre Pydantic v1 e v2?',
    options: [
      'Cosmética',
      'v2 foi reescrita em Rust (pydantic-core): ~10x mais rápida em validação, API ligeiramente diferente (model_dump em vez de dict, field_validator em vez de validator)',
      'v2 é mais lenta',
      'v2 removeu generics',
    ],
    correct: 1,
    explanation: 'Pydantic v2 (2023) reescreveu o core em Rust — PyO3. Performance transformativa em apps FastAPI/LangChain. API atualizada: Config→model_config (dict), .dict()→.model_dump(), @validator→@field_validator. v1 deprecated; libs modernas em v2.',
  },
  {
    question: 'O que é discriminated union em Pydantic?',
    options: [
      'Union type complicado',
      'Union de BaseModels distinguidos por FIELD discriminador (Field(discriminator="kind")) — Pydantic usa o campo pra escolher qual subclass instantiar. Similar a tagged union no TS',
      'Classe abstrata',
      'Não existe',
    ],
    correct: 1,
    explanation: '`class Shape(BaseModel): kind: Literal["circle","square"] = Field(discriminator=True)`. Pydantic faz routing correto ao parse. Crucial pra APIs com polimórficas (ex: webhook events, message types).',
  },
  {
    question: 'Pra que serve BaseSettings?',
    options: [
      'Config estático em arquivo',
      'Ler config de env vars + .env com tipos validados automaticamente — zero boilerplate, erro em missing/wrong type no startup',
      'Salvar estado em disco',
      'Apenas testes',
    ],
    correct: 1,
    explanation: 'pydantic-settings: `class Settings(BaseSettings): db_url: str; debug: bool = False`. Carrega DB_URL/DEBUG de env. Falha rápido se missing. Tipado. Integra com dotenv. É o default em FastAPI profissional.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="pydantic-v2-serio"
      title="Pydantic v2 sério: modelos, validação e settings"
      icon="🛡️"
      xp={60}
      readTime={14}
      trailName="Python para Engenheiros"
      trailColor={accent}
      nextSlug="async-em-python"
      nextTitle="Async em Python: asyncio, trio e trade-offs vs Node"
      quiz={quiz}
    >
      <Section title="Basic model + validation" accent={accent}>
        <CodeBlock lang="python">{`from pydantic import BaseModel, EmailStr, Field, field_validator

class User(BaseModel):
    id: str
    email: EmailStr
    age: int = Field(ge=0, le=150)
    tags: list[str] = Field(default_factory=list)

    @field_validator("id")
    @classmethod
    def id_prefix(cls, v: str) -> str:
        if not v.startswith("u_"):
            raise ValueError("id must start with u_")
        return v

# Parse (raises ValidationError)
user = User.model_validate({"id": "u_1", "email": "a@b.com", "age": 30})

# Safe (returns tuple-ish)
from pydantic import ValidationError
try:
    User.model_validate({...})
except ValidationError as e:
    print(e.errors())  # list of {loc, msg, type}

# Serialization
user.model_dump()        # dict
user.model_dump_json()   # JSON string`}</CodeBlock>
      </Section>

      <Section title="Discriminated union" accent={accent}>
        <CodeBlock lang="python">{`from typing import Literal, Annotated, Union
from pydantic import BaseModel, Field

class EmailEvent(BaseModel):
    kind: Literal["email"]
    to: str

class SmsEvent(BaseModel):
    kind: Literal["sms"]
    phone: str

Event = Annotated[Union[EmailEvent, SmsEvent], Field(discriminator="kind")]

class Webhook(BaseModel):
    event: Event

w = Webhook.model_validate({"event": {"kind": "sms", "phone": "+55..."}})
# w.event: SmsEvent — tipado corretamente`}</CodeBlock>
      </Section>

      <Section title="Settings" accent={accent}>
        <CodeBlock lang="python">{`from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

    db_url: str
    debug: bool = False
    openai_api_key: str | None = None

settings = Settings()  # lê APP_DB_URL, APP_DEBUG, APP_OPENAI_API_KEY`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Padrão: chame Settings() no startup, falha rápido se env inválida. Injetar via FastAPI Depends — testes mockam fácil.
        </Callout>
      </Section>

      <Section title="Performance e Rust" accent={accent}>
        <p>
          Pydantic v2 usa <InlineCode>pydantic-core</InlineCode> em Rust (via PyO3). Validação de payload de API fica 5-50x mais rápida que v1. Em FastAPI com milhões de requests, diferença entre v1 e v2 é brutal em CPU cost. Atualizar é ganho grátis.
        </p>
      </Section>
    </ModuleLayout>
  );
}
