import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('python-pra-dev-ts');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o GIL em Python?',
    options: [
      'Graphics Interface Library',
      'Global Interpreter Lock — mutex que garante que só uma thread executa bytecode Python por vez (no CPython). Limita paralelismo de CPU-bound. I/O-bound escapa (libera GIL durante I/O)',
      'Git In Local',
      'Não existe',
    ],
    correct: 1,
    explanation: 'GIL é por que Python "single-threaded" em CPU. I/O-bound escala bem com threads (GIL solta em syscalls). CPU-bound precisa multiprocessing ou async (I/O) ou subinterpreters (3.12+). Em 3.13+ há opção de disable GIL (experimental). Node.js não tem GIL mas é single-threaded event loop por default.',
  },
  {
    question: 'Python usa duck typing ou structural typing?',
    options: [
      'Nominal',
      'Duck typing por default ("se anda como pato..."). Mas desde 3.8 Protocol dá structural typing similar ao TS — e mypy/pyright checam em compile time',
      'Strict nominal',
      'Não tem tipos',
    ],
    correct: 1,
    explanation: 'Historicamente Python = duck: "não precisa isinstance, só chamar o método". Com type hints + Protocol (PEP 544), agora tem structural típing estático. mypy/pyright (Microsoft) validam em CI como tsc. Ecossistema moderno (FastAPI, Pydantic) exige type hints.',
  },
  {
    question: 'Qual é a diferença entre list, tuple, set e dict em Python?',
    options: [
      'Nomes diferentes pra arrays',
      'list [mutável, ordenada]; tuple (imutável, ordenada, hashable); set {mutável, única, não-ordenada}; dict {mutável, ordenada-por-insertion desde 3.7, chaves únicas}',
      'list e tuple são iguais',
      'set não existe',
    ],
    correct: 1,
    explanation: 'list = Array mutável. tuple = "record" imutável (hashable, pode ser chave de dict). set = Set JS. dict = Map JS (ordem de inserção garantida desde 3.7). Confundir list com tuple é erro comum — tuple vale pra retornar múltiplos valores e structural IDs.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="python-pra-dev-ts"
      title="Python pra dev TS: diferenças mentais críticas"
      icon="🔄"
      xp={40}
      readTime={10}
      trailName="Python para Engenheiros"
      trailColor={accent}
      nextSlug="uv-e-python-moderno"
      nextTitle="uv e Python moderno: chega de pip + venv manual"
      quiz={quiz}
    >
      <Section title="Mapa mental TS ↔ Python" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['TypeScript', 'Python', 'Observação']}
          rows={[
            ['interface User {}', 'TypedDict / dataclass / Pydantic', 'Pydantic é o Zod'],
            ['type Status = "ok" | "err"', 'Literal["ok", "err"]', 'Precisa importar typing.Literal'],
            ['async/await', 'async/await + asyncio', 'Similar; needs event loop explícito'],
            ['npm install', 'uv add', 'uv é o padrão moderno'],
            ['package.json', 'pyproject.toml', 'PEP 621'],
            ['node_modules', '.venv', 'Um por projeto, gitignored'],
            ['vitest', 'pytest', 'pytest domina Python'],
            ['eslint + prettier', 'ruff', 'ruff é tudo-em-um (Rust)'],
            ['tsc', 'mypy / pyright', 'pyright mais rápido'],
            ['zod', 'pydantic v2', 'Blazing (escrito em Rust)'],
          ]}
        />
      </Section>

      <Section title="Armadilhas comuns" accent={accent}>
        <CodeBlock lang="python">{`# Truthiness é mais agressivo
if []: ...       # False (array vazio é falsy)
if 0: ...        # False
if None: ...     # False
if '': ...       # False
# Em TS só null/undefined/false/0/""/NaN são falsy; array vazio é TRUTHY

# Default mutable é ARMADILHA CLÁSSICA
def add(item, items=[]):  # ❌ items é compartilhado entre calls
    items.append(item)
    return items

def add(item, items=None):  # ✅ correto
    if items is None: items = []
    items.append(item)
    return items

# Comprehensions em vez de map/filter
doubled = [x * 2 for x in nums if x > 0]  # pythonic
# map/filter existem mas comprehensions são idiomáticas`}</CodeBlock>
      </Section>

      <Section title="Escopo LEGB" accent={accent}>
        <p>
          Python resolve variáveis em ordem: Local → Enclosing → Global → Built-in. Diferente de TS onde <InlineCode>let</InlineCode> é block-scoped, Python variáveis em for/if ficam disponíveis fora do bloco.
        </p>
        <CodeBlock lang="python">{`for i in range(10):
    temp = i * 2
print(i)     # 9 — vazou
print(temp)  # 18 — vazou

# Use funções/comprehensions pra escopar`}</CodeBlock>
      </Section>

      <Section title="O que TS dev vai adorar em Python moderno" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Pydantic v2 — Zod blazing fast.</li>
          <li>FastAPI — OpenAPI automático, DI elegante.</li>
          <li>uv — pip/npm moderno em Rust.</li>
          <li>ruff — ESLint+Prettier num binário.</li>
          <li>pytest — DX superior a vitest em alguns aspectos (fixtures, parametrize).</li>
          <li>Jupyter — exploração que TS não tem equivalente bom.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
