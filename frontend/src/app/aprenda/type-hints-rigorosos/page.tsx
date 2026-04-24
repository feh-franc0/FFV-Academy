import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('type-hints-rigorosos');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'O que mudou com PEP 695 (Python 3.12+)?',
    options: [
      'Substituiu type hints',
      'Syntax nativa pra generics mais limpa: `def first[T](xs: list[T]) -> T | None` em vez de TypeVar + declaração separada. Similar ao TS',
      'Removeu tipos',
      'Só runtime checking',
    ],
    correct: 1,
    explanation: 'Antes: precisava declarar `T = TypeVar("T")` no módulo. PEP 695: `def first[T](...)` ou `class Stack[T]:`. Mais limpo, próximo do TS. Também introduziu `type` statement pra aliases: `type Result[T] = Ok[T] | Err`.',
  },
  {
    question: 'O que Protocol resolve em Python?',
    options: [
      'Rede',
      'Structural typing (duck typing checado estaticamente) — permite definir "qualquer coisa que tem método X" sem hierarquia explícita. Equivalente às interfaces do TS',
      'Serialização',
      'Async',
    ],
    correct: 1,
    explanation: 'typing.Protocol (PEP 544) adiciona structural typing. `class Readable(Protocol): def read(self) -> str: ...`. Qualquer classe com método read() satisfaz, sem herdar. Python era nominal→duck-runtime; Protocol permite structural-compile-time.',
  },
  {
    question: 'Qual é o uso ideal de TypedDict?',
    options: [
      'Substituir dataclass',
      'Tipar dicts com shape conhecido (típico em JSON de API) sem criar classe: `class User(TypedDict): id: str; name: str`. Mantém API do dict mas o checker verifica keys e types',
      'Só pra API REST',
      'Não usar',
    ],
    correct: 1,
    explanation: 'TypedDict existe pra casos onde você REALMENTE quer dict (JSON, config, dict literal) mas precisa de type safety. Diferente de dataclass/Pydantic (objetos). Útil em integrações onde o shape vem de externo e você só tipa pra checker.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="type-hints-rigorosos"
      title="Type hints rigorosos: PEP 695, Protocol, TypedDict"
      icon="📝"
      xp={55}
      readTime={13}
      trailName="Python para Engenheiros"
      trailColor={accent}
      nextSlug="pydantic-v2-serio"
      nextTitle="Pydantic v2 sério: modelos, validação e settings"
      quiz={quiz}
    >
      <Section title="PEP 695 generics (3.12+)" accent={accent}>
        <CodeBlock lang="python">{`# Antes (legacy)
from typing import TypeVar
T = TypeVar("T")
def first(xs: list[T]) -> T | None:
    return xs[0] if xs else None

# Agora (PEP 695)
def first[T](xs: list[T]) -> T | None:
    return xs[0] if xs else None

# Classes
class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None: self._items.append(item)
    def pop(self) -> T | None: return self._items.pop() if self._items else None

# Aliases
type Result[T] = tuple[bool, T | None]`}</CodeBlock>
      </Section>

      <Section title="Protocol — structural typing" accent={accent}>
        <CodeBlock lang="python">{`from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

def safe_close(resource: SupportsClose) -> None:
    resource.close()

# Qualquer classe com .close() passa — sem herdar
class File:
    def close(self) -> None: print("closed")

class DBConnection:
    def close(self) -> None: print("db closed")

safe_close(File())
safe_close(DBConnection())  # ambos OK, zero herança`}</CodeBlock>
      </Section>

      <Section title="TypedDict + NotRequired" accent={accent}>
        <CodeBlock lang="python">{`from typing import TypedDict, NotRequired

class UserDict(TypedDict):
    id: str
    email: str
    name: NotRequired[str]  # opcional

def handle(user: UserDict) -> None:
    print(user["email"])
    if "name" in user:
        print(user["name"])`}</CodeBlock>
      </Section>

      <Section title="mypy strict em CI" accent={accent}>
        <CodeBlock lang="toml">{`# pyproject.toml
[tool.mypy]
python_version = "3.12"
strict = true
# strict = disallow_untyped_defs + check_untyped_defs + warn_unused + etc.

# CI
# - name: Type check
#   run: uv run mypy src/`}</CodeBlock>
        <Callout tone="info" icon="💡">
          pyright (Microsoft) é mais rápido que mypy e roda no VSCode por default (via Pylance). Use pyright no editor, mypy no CI (ou só pyright se time alinha).
        </Callout>
      </Section>

      <Section title="Annotated + metadata" accent={accent}>
        <CodeBlock lang="python">{`from typing import Annotated
from pydantic import Field

# Tipo + validação FastAPI/Pydantic inline
UserId = Annotated[str, Field(pattern=r"^u_[a-z0-9]+$")]

def get_user(id: UserId) -> User: ...`}</CodeBlock>
      </Section>
    </ModuleLayout>
  );
}
