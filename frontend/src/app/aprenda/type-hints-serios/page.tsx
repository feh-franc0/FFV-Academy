import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('type-hints-serios');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre `list[int]` e `List[int]` em Python moderno?',
    options: [
      'São completamente diferentes — list[int] não é válido',
      'São equivalentes em Python 3.9+. `list[int]` é a sintaxe moderna nativa (PEP 585). `List[int]` de `typing` existe para compatibilidade com Python 3.8. Em código novo (3.10+), prefira `list[int]`, `dict[str, int]`, `tuple[int, ...]` sem importar typing.',
      'List[int] é mais eficiente em runtime',
      'list[int] é somente para anotação de variáveis, List[int] para parâmetros de função',
    ],
    correct: 1,
    explanation: 'Python 3.9 (PEP 585) permitiu usar built-ins como genéricos direto: list[int], dict[str, int], tuple[int, str]. Python 3.10 (PEP 604) adicionou X | Y para union (antes: Optional[X] = Union[X, None]). Python 3.12 (PEP 695) adicionou `type X = list[int]` e sintaxe `def f[T](x: T) -> T`. O módulo typing ainda é necessário para TypeVar, Protocol, etc.',
  },
  {
    question: 'O que é um Protocol em Python e quando usar em vez de ABC (Abstract Base Class)?',
    options: [
      'Protocol é o mesmo que ABC, apenas com nome diferente',
      'Protocol define uma interface por estrutura (duck typing estático): qualquer classe que tenha os métodos/atributos requeridos é compatível, sem precisar herdar explicitamente. ABC exige herança explícita. Use Protocol quando quer duck typing verificado estaticamente; ABC quando quer enforcement explícito.',
      'Protocol só funciona para classes com um único método',
      'ABC é preferível sempre que possível — Protocol é apenas para código legado',
    ],
    correct: 1,
    explanation: 'Protocol implementa "structural subtyping" (tipagem estrutural). A classe Duck não precisa herdar de Quackable — basta ter o método quack(). mypy/pyright verificam isso estaticamente. Isso é poderoso para código que trabalha com bibliotecas de terceiros que não usam sua hierarquia de classes. Ex: `class Readable(Protocol): def read(self) -> str: ...` aceita qualquer objeto com método read(), independente de herança.',
  },
  {
    question: 'O que TypeVar garante em `def first[T](lst: list[T]) -> T`?',
    options: [
      'Que a lista deve conter apenas inteiros',
      'Que o tipo retornado é o MESMO tipo que os elementos da lista. Se você passa list[str], retorna str. Se passa list[int], retorna int. TypeVar cria uma variável de tipo que o type checker usa para propagar tipos através da função, permitindo funções genéricas type-safe.',
      'Que a lista não pode estar vazia',
      'Que T deve ser um tipo primitivo (int, str, float)',
    ],
    correct: 1,
    explanation: 'TypeVar (ou a sintaxe nova [T] em Python 3.12) permite escrever funções que são polimórficas mas ainda type-safe. `def first[T](lst: list[T]) -> T` diz: "para qualquer tipo T, se você me der list[T], eu retorno T". Sem TypeVar, você escreveria `-> Any` e perderia type safety. Bounded TypeVar: `[T: Numeric]` restringe a subtipos de Numeric.',
  },
];

export default function TypeHintsSériosPage() {
  return (
    <ModuleLayout
      slug="type-hints-serios"
      title="Type hints sérios: mypy, pyright, Protocol, Generic"
      icon="🔠"
      xp={70}
      readTime={14}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="estruturas-dados-python"
      nextTitle="dict, list, set, tuple: quando cada um e por quê"
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
        Type hints em Python não tornam a linguagem estática em runtime — mas permitem que ferramentas como mypy e pyright detectem erros antes de você executar o código. Em projetos grandes, isso é o que separa "funciona" de "funciona de forma confiável".
      </p>

      <Section accent={accent} title="Sintaxe moderna de type hints (3.10+)">
        <CodeBlock>{`# Python moderno — sem importar typing para o básico
def processar(nome: str, idade: int, ativo: bool = True) -> str:
    return f"{nome} ({idade})"

# Coleções genéricas (Python 3.9+, PEP 585)
def media(numeros: list[float]) -> float:
    return sum(numeros) / len(numeros)

def contagem(texto: str) -> dict[str, int]:
    return {}

# Union com | (Python 3.10+, PEP 604)
def buscar(id: int | str) -> dict | None:
    return None

# Antes (ainda válido, necessário para 3.8/3.9):
from typing import Optional, Union, List, Dict
def buscar_v2(id: Union[int, str]) -> Optional[dict]:
    return None

# Variáveis
nome: str = "Fernando"
lista: list[int] = [1, 2, 3]
mapa: dict[str, list[int]] = {"a": [1, 2]}

# Callable
from collections.abc import Callable
def aplicar(fn: Callable[[int, int], int], a: int, b: int) -> int:
    return fn(a, b)

# Literal — restringe a valores específicos
from typing import Literal
def definir_nivel(nivel: Literal["debug", "info", "warn", "error"]) -> None:
    pass

# TypedDict — dicts com estrutura conhecida
from typing import TypedDict
class Usuario(TypedDict):
    nome: str
    idade: int
    email: str | None`}</CodeBlock>
      </Section>

      <Section accent={accent} title="mypy vs pyright: qual usar">
        <ComparisonTable
          headers={['Aspecto', 'mypy', 'pyright/pylance']}
          rows={[
            ['Linguagem', 'Python', 'TypeScript (mais rápido)'],
            ['Velocidade', 'Mais lento', 'Significativamente mais rápido'],
            ['Rigor padrão', 'Moderado (configurável)', 'Strict por padrão opcional'],
            ['IDE integration', 'Via extensão', 'Nativo no VSCode (Pylance)'],
            ['Configuração', 'mypy.ini / pyproject.toml', 'pyrightconfig.json / pyproject.toml'],
            ['Usado por', 'Django, FastAPI, Dropbox', 'Microsoft, Pydantic v2'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Configurar mypy no pyproject.toml
[tool.mypy]
python_version = "3.11"
strict = true          # habilita todas as verificações rigorosas
# Equivalente a: disallow_untyped_defs, warn_return_any, etc.

ignore_missing_imports = true   # para libs sem stubs de tipos
exclude = ["tests/", "migrations/"]

# Rodar mypy
uv run mypy src/

# Configurar pyright
# pyrightconfig.json
{
  "typeCheckingMode": "strict",  # "off", "basic", "standard", "strict"
  "pythonVersion": "3.11",
  "reportMissingImports": "error",
  "reportMissingTypeStubs": "warning"
}

# Inline type ignores (use com moderação)
x: int = "oops"  # type: ignore[assignment]  ← comenta o motivo
from lib import algo  # type: ignore[import]  ← lib sem stubs`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Protocol: duck typing estático">
        <CodeBlock>{`from typing import Protocol, runtime_checkable

# Define interface por estrutura (não por herança)
@runtime_checkable  # permite isinstance() em runtime
class Serializable(Protocol):
    def to_dict(self) -> dict: ...
    def from_dict(cls, data: dict) -> "Serializable": ...

class Usuario:
    def __init__(self, nome: str):
        self.nome = nome

    def to_dict(self) -> dict:
        return {"nome": self.nome}

    def from_dict(cls, data: dict) -> "Usuario":
        return cls(data["nome"])

class Produto:
    def to_dict(self) -> dict:
        return {"id": self.id}

    def from_dict(cls, data: dict) -> "Produto":
        return cls(data["id"])

# Ambos são compatíveis com Serializable SEM herdar
def salvar(obj: Serializable) -> str:
    return str(obj.to_dict())

salvar(Usuario("Fernando"))  # ✅ type checker aprova
salvar(Produto(1))           # ✅ type checker aprova
salvar("string")             # ❌ type checker rejeita

# Protocols práticos — evitam acoplamento a hierarquias específicas:
class Readable(Protocol):
    def read(self) -> bytes: ...

class Writable(Protocol):
    def write(self, data: bytes) -> int: ...

def copiar(origem: Readable, destino: Writable) -> None:
    destino.write(origem.read())
# Funciona com arquivo, socket, BytesIO, qualquer "file-like object"`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Generic: código reutilizável type-safe">
        <CodeBlock>{`from typing import Generic, TypeVar

T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")

# Função genérica (Python 3.12: def first[T])
def primeiro(lst: list[T]) -> T:
    if not lst:
        raise IndexError("lista vazia")
    return lst[0]

primeiro([1, 2, 3])     # → int
primeiro(["a", "b"])    # → str
primeiro([1.0, 2.0])    # → float

# Classe genérica
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        if not self._items:
            raise IndexError("stack vazia")
        return self._items.pop()

    def __len__(self) -> int:
        return len(self._items)

pilha: Stack[int] = Stack()
pilha.push(42)     # ✅
pilha.push("x")    # ❌ type checker rejeita — pilha é Stack[int]

# TypeVar com bound — restringe a subtipos
from typing import TypeVar
Comparable = TypeVar("Comparable", bound="SupportsLessThan")

# Python 3.12 syntax mais limpa:
def maximo[T: (int, float, str)](a: T, b: T) -> T:
    return a if a > b else b`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Tipos especiais úteis">
        <CodeBlock>{`from typing import Final, ClassVar, Annotated, Never, Self

# Final — constante que não pode ser reatribuída
MAX_RETRIES: Final = 3
MAX_RETRIES = 4  # ❌ type checker rejeita

# ClassVar — atributo de classe, não de instância
class Config:
    DEBUG: ClassVar[bool] = False  # type checker sabe que é de classe

# Annotated — adiciona metadados ao tipo (usado por Pydantic, FastAPI)
from typing import Annotated
from pydantic import Field
Positivo = Annotated[int, Field(gt=0)]

def criar_usuario(idade: Annotated[int, Field(ge=0, le=120)]) -> None:
    pass

# Never — função que nunca retorna (raise, sys.exit)
def falhar(msg: str) -> Never:
    raise RuntimeError(msg)

# Self — referência à classe atual (útil em herança)
class Builder:
    def set_nome(self, nome: str) -> Self:
        self.nome = nome
        return self  # type checker sabe que retorna a subclasse correta`}</CodeBlock>
        <Callout tone="info">
          Type stubs (<code>.pyi</code> files) são necessários para bibliotecas sem type hints nativos. O repositório <code>typeshed</code> mantém stubs para a stdlib e libs populares. Para libs sem stubs: <code>pip install types-requests</code>, etc.
        </Callout>
      </Section>

      <Callout tone="success">
        <strong>Estratégia de adoção:</strong> comece com <code>mypy --ignore-missing-imports</code> no CI. Adicione hints progressivamente (funções públicas primeiro). Use <code># type: ignore</code> com moderação e sempre com comentário. Objetivo: <code>strict = true</code> no pyproject.toml.
      </Callout>

      <Callout>
        Próximo: <strong>dict, list, set, tuple</strong> — complexidade de operações, quando cada estrutura ganha e casos que destroem performance.
      </Callout>
    </div>
  );
}
