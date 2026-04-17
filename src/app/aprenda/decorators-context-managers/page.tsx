import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata: Metadata = {
  title: 'Decorators e context managers: o que são de verdade — FFV Academy',
  description: 'Decorators são funções que recebem funções. Context managers garantem cleanup. functools.wraps, @property, @classmethod, @staticmethod, contextlib.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que `@functools.wraps(func)` é necessário ao escrever um decorator?',
    options: [
      'Porque sem ele o decorator não funciona corretamente',
      'Sem @wraps, a função decorada perde seus metadados (__name__, __doc__, __annotations__). `help(fn)` mostra o nome do wrapper interno, não da função original. `@wraps` copia os metadados da função original para o wrapper — essencial para debugging, introspection e ferramentas como pytest.',
      'Porque @wraps é necessário apenas em Python 3.10+',
      '@wraps serve para fazer o decorator funcionar com funções assíncronas',
    ],
    correct: 1,
    explanation: 'Quando você escreve `def wrapper(*args, **kwargs)`, o wrapper tem `wrapper.__name__ == "wrapper"`. Sem @wraps, todas as funções decoradas pareceriam chamar-se "wrapper" no traceback. @wraps(func) executa `wrapper.__wrapped__ = func`, copia __name__, __qualname__, __doc__, __dict__, __annotations__. Sem isso, ferramentas como pytest e FastAPI que inspecionam anotações de tipo param quebram.',
  },
  {
    question: 'Qual a diferença entre `@classmethod` e `@staticmethod`?',
    options: [
      'São equivalentes — ambos criam métodos sem acesso à instância',
      '@classmethod recebe a CLASSE como primeiro argumento (por convenção `cls`) — tem acesso à classe e pode criar instâncias ou acessar class vars. @staticmethod não recebe argumento implícito — é uma função normal dentro do namespace da classe, sem acesso à classe ou instância.',
      '@staticmethod é mais rápido porque não passa argumentos extras',
      '@classmethod só pode ser chamado na classe, nunca na instância',
    ],
    correct: 1,
    explanation: '`@classmethod` é o padrão para factory methods: `def from_dict(cls, data): return cls(**data)` — funciona em subclasses porque recebe a classe correta. `@staticmethod` agrupa funções utilitárias que logicamente pertencem à classe mas não precisam de estado. Um método normal sem `@staticmethod` receberia a instância como self mesmo que não a use — staticmethod evita esse overhead.',
  },
  {
    question: 'Como um context manager implementado com `contextlib.contextmanager` garante cleanup mesmo em caso de exceção?',
    options: [
      'Usando um bloco try/finally ao redor do yield — o finally sempre executa, independente de exceção. O yield divide o generator em setup (antes) e cleanup (depois). O `with` injeta a exceção via throw() se houver, e o generator pode re-lançar ou suprimir.',
      'O contextmanager captura todas as exceções automaticamente',
      'Só funciona sem exceções — para cleanup garantido use __enter__/__exit__',
      'O finally só roda se a exceção for capturada dentro do bloco with',
    ],
    correct: 0,
    explanation: '`contextlib.contextmanager` transforma um generator em context manager. O código antes do yield = __enter__. O código depois do yield = __exit__. O try/finally garante que o cleanup sempre roda. Se houver exceção no bloco `with`, ela é injetada no generator via throw(). Se o generator não capturar, a exceção propaga normalmente. Se capturar e não re-lançar, a exceção é suprimida.',
  },
];

export default function DecoratorsContextManagersPage() {
  return (
    <ModuleLayout
      slug="decorators-context-managers"
      title="Decorators e context managers: o que são de verdade"
      icon="🎭"
      xp={70}
      readTime={14}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="async-asyncio"
      nextTitle="asyncio explicado: event loop, coroutines, gather"
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
        Decorators e context managers são as ferramentas de metaprogramação mais usadas no Python real. Decorators modificam comportamento de funções sem tocar no código delas. Context managers garantem que recursos sejam liberados corretamente — mesmo com exceções.
      </p>

      <Section accent={accent} title="Decorators: funções que recebem funções">
        <p>
          Um decorator é uma função que recebe uma função e retorna uma função. A sintaxe <code>@decorator</code> é açúcar para <code>fn = decorator(fn)</code>. Qualquer callable que aceite uma função e retorne outra é um decorator válido.
        </p>
        <CodeBlock>{`import functools
import time

# Decorator básico — sempre use @functools.wraps
def cronometrar(func):
    @functools.wraps(func)          # preserva __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        inicio = time.perf_counter()
        resultado = func(*args, **kwargs)
        fim = time.perf_counter()
        print(f"{func.__name__} levou {fim - inicio:.3f}s")
        return resultado
    return wrapper

@cronometrar
def processar(n):
    """Processa n itens."""
    return sum(range(n))

processar(1_000_000)     # processar levou 0.023s
print(processar.__name__)   # "processar" (não "wrapper" — graças ao @wraps)
print(processar.__doc__)    # "Processa n itens."

# Decorator com parâmetros — factory de decorators
def retry(tentativas=3, espera=1.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ultimo_erro = None
            for i in range(tentativas):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    ultimo_erro = e
                    if i < tentativas - 1:
                        time.sleep(espera)
            raise ultimo_erro
        return wrapper
    return decorator

@retry(tentativas=5, espera=0.5)
def chamar_api(url: str) -> dict:
    # tenta 5 vezes com 0.5s de espera entre tentativas
    ...

# Decorators empilhados — executam de baixo pra cima:
@cronometrar          # aplicado por último
@retry(tentativas=3)  # aplicado primeiro
def operacao_critica():
    ...
# Equivalente a: operacao_critica = cronometrar(retry(3)(operacao_critica))`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Decorators de classe: @property, @classmethod, @staticmethod">
        <ComparisonTable
          headers={['Decorator', 'Primeiro arg', 'Acessa instância?', 'Acessa classe?', 'Uso típico']}
          rows={[
            ['método normal', 'self', 'Sim', 'Via self.__class__', 'Comportamento da instância'],
            ['@property', 'self', 'Sim', 'Via self.__class__', 'Atributo calculado, getter/setter'],
            ['@classmethod', 'cls', 'Via instância', 'Sim (cls)', 'Factory methods, herança polimórfica'],
            ['@staticmethod', 'nenhum', 'Não', 'Não', 'Utilitários relacionados à classe'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`class Circulo:
    def __init__(self, raio: float):
        self._raio = raio

    @property
    def raio(self) -> float:
        return self._raio

    @raio.setter
    def raio(self, valor: float) -> None:
        if valor < 0:
            raise ValueError("raio não pode ser negativo")
        self._raio = valor

    @property
    def area(self) -> float:            # só getter — atributo calculado
        import math
        return math.pi * self._raio ** 2

    @classmethod
    def de_diametro(cls, diametro: float) -> "Circulo":
        return cls(diametro / 2)        # factory method — cls funciona com subclasses

    @staticmethod
    def eh_valido(raio: float) -> bool:
        return raio >= 0                # utilitário — sem acesso a self/cls

c = Circulo(5)
print(c.area)           # 78.54... — sem parênteses!
c.raio = 10             # chama @raio.setter
Circulo.de_diametro(20) # Circulo com raio=10
Circulo.eh_valido(-1)   # False

# Decorator customizado de classe (cache de propriedade)
class cached_property:
    def __init__(self, func):
        self.func = func
        self.attrname = None

    def __set_name__(self, owner, name):
        self.attrname = name

    def __get__(self, instance, owner=None):
        if instance is None:
            return self
        val = self.func(instance)
        instance.__dict__[self.attrname] = val   # sobrescreve no __dict__
        return val                                # próxima leitura não chama __get__

# Python 3.8+ tem functools.cached_property built-in!
from functools import cached_property
class Dataset:
    @cached_property
    def estatisticas(self):
        print("calculando (uma vez só)...")
        return {"media": 42, "std": 7}`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Context managers: __enter__ e __exit__">
        <CodeBlock>{`# O que o 'with' faz:
# with expr as var:
#     bloco
# Equivale a:
# mgr = expr
# var = mgr.__enter__()
# try:
#     bloco
# except:
#     if not mgr.__exit__(*sys.exc_info()): raise
# else:
#     mgr.__exit__(None, None, None)

# Implementação via classe
class TempDir:
    def __init__(self, prefixo="tmp"):
        self.prefixo = prefixo
        self.path = None

    def __enter__(self):
        import tempfile
        self.path = tempfile.mkdtemp(prefix=self.prefixo)
        return self.path        # o que fica em `as`

    def __exit__(self, exc_type, exc_val, exc_tb):
        import shutil
        shutil.rmtree(self.path, ignore_errors=True)
        return False            # False = não suprimir exceção

with TempDir("meu_app_") as tmp:
    # faz coisas com tmp/
    pass
# diretório deletado aqui — mesmo se houver exceção

# __exit__ recebe info da exceção:
# exc_type = tipo (ex: ValueError), None se não houver
# exc_val = instância, None se não houver
# exc_tb = traceback, None se não houver
# retornar True supprime a exceção — geralmente não é o que se quer`}</CodeBlock>
      </Section>

      <Section accent={accent} title="contextlib: context managers funcionais">
        <CodeBlock>{`from contextlib import contextmanager, suppress, nullcontext

# contextmanager — generator como context manager
@contextmanager
def cronometrar_bloco(nome: str):
    import time
    inicio = time.perf_counter()
    try:
        yield                           # o bloco 'with' executa aqui
    finally:
        fim = time.perf_counter()
        print(f"{nome}: {fim-inicio:.3f}s")   # sempre executa

with cronometrar_bloco("processamento"):
    dados = [x**2 for x in range(1_000_000)]

# Yielding um valor — disponível no 'as'
@contextmanager
def transacao(conn):
    try:
        yield conn.cursor()     # cursor disponível no 'as'
        conn.commit()
    except Exception:
        conn.rollback()
        raise

with transacao(db) as cursor:
    cursor.execute("INSERT INTO ...")

# suppress — silencia exceções específicas
from contextlib import suppress
with suppress(FileNotFoundError):
    os.remove("arquivo_que_pode_nao_existir.tmp")

# nullcontext — context manager que não faz nada (útil para condicionais)
from contextlib import nullcontext
ctx = cronometrar_bloco("op") if debug else nullcontext()
with ctx:
    operacao()

# ExitStack — composição dinâmica de context managers
from contextlib import ExitStack
arquivos = ["a.txt", "b.txt", "c.txt"]
with ExitStack() as stack:
    handles = [stack.enter_context(open(f)) for f in arquivos]
    # todos abertos, todos serão fechados ao sair`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regras práticas:</strong> sempre use <code>@functools.wraps</code> em decorators. Use <code>@contextmanager</code> com <code>try/finally</code> para context managers simples. Use classe com <code>__enter__/__exit__</code> quando precisar de estado mais complexo. <code>@property</code> para atributos calculados. <code>@classmethod</code> para factory methods polimórficos.
      </Callout>

      <Callout>
        Próximo: <strong>asyncio explicado</strong> — event loop, coroutines, gather e como Python faz I/O concorrente sem threads.
      </Callout>
    </div>
  );
}
