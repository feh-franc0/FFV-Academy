import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('memoria-gc-python');

const quiz: QuizQuestion[] = [
  {
    question: 'O que acontece com a memória de um objeto Python quando seu `sys.getrefcount()` chega a zero?',
    options: [
      'O objeto fica na memória até o garbage collector rodar',
      'O destrutor `__del__` é chamado imediatamente e a memória é devolvida ao allocator Python (não ao OS imediatamente — Python mantém pool de memória interna para reutilização). Com contagem de referências, a liberação é determinística: acontece quando a última referência é removida, não em momento indeterminado.',
      'Python marca o objeto como "morto" mas não libera memória',
      'O objeto só é liberado quando o programa termina',
    ],
    correct: 1,
    explanation: 'CPython usa contagem de referências como mecanismo primário. Quando refcount = 0, `Py_DECREF` chama `tp_dealloc` do tipo, que chama `__del__` se definido, depois devolve a memória ao memory allocator do Python (pymalloc). O pymalloc mantém pools de objetos pequenos (<512 bytes) para reutilização eficiente — ele pode ou não devolver ao OS. O GC cíclico lida com referências circulares que nunca chegam a zero.',
  },
  {
    question: 'Por que referências circulares (`a.filho = b; b.pai = a`) não são coletadas pela contagem de referências, mas o garbage collector resolve?',
    options: [
      'Referências circulares causam erros em Python',
      'Com referência circular, mesmo sem referências externas, cada objeto ainda aponta para o outro — ambos têm refcount=1. O refcount nunca chega a zero. O GC cíclico (módulo `gc`) executa periodicamente e detecta ilhas de objetos mutuamente referenciados sem referências externas, coletando-os.',
      'O GC não resolve referências circulares — elas nunca são coletadas',
      'Referências circulares são automaticamente quebradas pelo Python ao sair do escopo',
    ],
    correct: 1,
    explanation: 'O GC cíclico do CPython (implementado em Objects/gcmodule.c) usa o algoritmo de tricoloração adaptado. Ele rastreia "container objects" (list, dict, set, instâncias de classe) em 3 gerações. Objetos sobrevivem para gerações mais velhas. O GC procura cliques de objetos onde a soma das referências externas é zero — esses podem ser coletados. Ter `__del__` em objetos em ciclo impede coleta (até Python 3.4 — depois foi resolvido).',
  },
  {
    question: 'Qual a vantagem de usar `__slots__` numa classe com muitas instâncias?',
    options: [
      '__slots__ torna os atributos imutáveis',
      '__slots__ evita a criação do `__dict__` por instância. Sem __slots__, cada instância tem um dict Python completo (~232 bytes em 64-bit) para armazenar atributos. Com __slots__, os atributos são armazenados em um array C compacto. Para 1 milhão de instâncias simples, a diferença pode ser 200-500MB de RAM. O custo: sem herança múltipla fácil, sem atributos dinâmicos.',
      '__slots__ melhora a velocidade de acesso mas não afeta memória',
      '__slots__ só funciona se a classe não herdar de nenhuma outra',
    ],
    correct: 1,
    explanation: 'sys.getsizeof() mostra: instância simples sem __slots__ ≈ 48 bytes + 232 bytes do __dict__ = 280 bytes. Com __slots__: 48 bytes apenas. Para dataclasses ou classes com muitos atributos, o ganho é proporcional. Use __slots__ quando: criar muitas instâncias (>10k), conhecer todos os atributos em tempo de definição, e não precisar de adição dinâmica de atributos.',
  },
];

export default function MemoriaGcPythonPage() {
  return (
    <ModuleLayout
      slug="memoria-gc-python"
      title="Memória em Python: refcount, GC, __slots__, weakref"
      icon="🧹"
      xp={65}
      readTime={13}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="bytecode-dis"
      nextTitle="Bytecode e dis: o que Python realmente executa"
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
        Python gerencia memória automaticamente, mas entender o mecanismo é o que permite escrever código que não vaza memória, não pressiona o GC e usa o mínimo de RAM. Refcount, GC cíclico, slots e weakref são as peças.
      </p>

      <Section accent={accent} title="Contagem de referências: o mecanismo primário">
        <CodeBlock>{`import sys

# Cada objeto tem um contador de referências
x = [1, 2, 3]
print(sys.getrefcount(x))   # 2 (x + argumento de getrefcount)

y = x               # +1 ref
print(sys.getrefcount(x))   # 3

del y               # -1 ref
print(sys.getrefcount(x))   # 2

# Quando refcount = 0 → objeto é destruído imediatamente
class Observer:
    def __init__(self, nome):
        self.nome = nome
        print(f"{nome} criado")

    def __del__(self):
        print(f"{self.nome} destruído")   # chamado quando refcount=0

a = Observer("A")   # "A criado"
b = a               # ref adicional
del a               # refcount ainda > 0, __del__ NÃO chamado
del b               # refcount = 0 → "A destruído" imediatamente

# Verificar refcount de inteiros cacheados:
print(sys.getrefcount(42))   # muito alto — inteiro cacheado pelo Python
print(sys.getrefcount(99999))  # 3 (menos referencias)

# Rastrear quem referencia um objeto
import gc
obj = [1, 2, 3]
referenciadores = gc.get_referrers(obj)
# Retorna: frame atual, a própria lista em gc tracking, etc.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Referências circulares e o GC cíclico">
        <CodeBlock>{`import gc

# Referência circular — refcount nunca chega a 0
class No:
    def __init__(self, valor):
        self.valor = valor
        self.proximo = None

a = No(1)
b = No(2)
a.proximo = b
b.proximo = a    # ciclo: a → b → a

del a            # refcount de a = 1 (b.proximo ainda aponta)
del b            # refcount de b = 1 (a.proximo ainda aponta)
# Ambos ainda existem na memória! O GC precisa coletar.

# Forçar coleta (normalmente automático)
coletados = gc.collect()
print(f"objetos coletados: {coletados}")

# Controle do GC:
gc.disable()     # desabilitar (perigoso — use em hot paths curtos)
gc.enable()      # reabilitar
gc.isenabled()   # verificar estado

# Thresholds — quando o GC roda cada geração:
print(gc.get_threshold())   # (700, 10, 10) por default
# gen0 coleta após 700 alocações líquidas
# gen1 coleta após 10 coletas de gen0
# gen2 coleta após 10 coletas de gen1

# Debugging: rastrear objetos não coletados
gc.set_debug(gc.DEBUG_LEAK)    # logar objetos que vazam

# Verificar quais objetos estão sob controle do GC:
containers = gc.get_objects()  # todos os "container objects"
# ⚠️ Isso em si cria referências — use com cuidado`}</CodeBlock>
      </Section>

      <Section accent={accent} title="__slots__: reduzindo uso de memória">
        <ComparisonTable
          headers={['Aspecto', 'Sem __slots__', 'Com __slots__']}
          rows={[
            ['Memória por instância', '~280 bytes (48 + 232 dict)', '~56 bytes (48 + 8/attr)'],
            ['Atributos dinâmicos', 'Sim — a.foo = "bar" funciona', 'Não — AttributeError'],
            ['Acesso a atributo', 'Ligeiramente mais lento (dict lookup)', 'Mais rápido (array direto)'],
            ['__dict__ disponível', 'Sim', 'Não (a menos que declarado em slots)'],
            ['Pickling', 'Automático', 'Requer __getstate__/__setstate__'],
            ['Herança múltipla', 'Funciona', 'Restrições (cada classe define seus slots)'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`import sys

# Sem __slots__
class PontoSemSlots:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# Com __slots__
class PontoComSlots:
    __slots__ = ("x", "y")    # tuple ou list de nomes de atributos

    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = PontoSemSlots(1.0, 2.0)
p2 = PontoComSlots(1.0, 2.0)

print(sys.getsizeof(p1))   # ~48 bytes (+ dict separado)
print(sys.getsizeof(p2))   # ~48 bytes (mais compacto)
print(sys.getsizeof(p1.__dict__))  # ~232 bytes

# p1.z = 3.0   # funciona
# p2.z = 3.0   # AttributeError — z não está em __slots__

# Para 1 milhão de pontos:
import tracemalloc
tracemalloc.start()

pontos_sem = [PontoSemSlots(i, i) for i in range(1_000_000)]
snapshot = tracemalloc.take_snapshot()
# ~280MB

del pontos_sem
pontos_com = [PontoComSlots(i, i) for i in range(1_000_000)]
# ~56MB — 5x menos memória

# Dataclass com __slots__ (Python 3.10+)
from dataclasses import dataclass

@dataclass(slots=True)    # gera __slots__ automaticamente
class Produto:
    nome: str
    preco: float
    estoque: int = 0`}</CodeBlock>
      </Section>

      <Section accent={accent} title="weakref: referências sem impedir coleta">
        <CodeBlock>{`import weakref

# Problema: cache que impede GC de coletar objetos
class Cache:
    def __init__(self):
        self._cache = {}    # referências fortes — impede coleta

    def guardar(self, chave, obj):
        self._cache[chave] = obj    # mantém obj vivo!

# Solução: WeakValueDictionary — referências fracas
class CacheSeguro:
    def __init__(self):
        self._cache = weakref.WeakValueDictionary()

    def guardar(self, chave, obj):
        self._cache[chave] = obj    # não impede coleta

    def buscar(self, chave):
        return self._cache.get(chave)   # None se coletado

cache = CacheSeguro()
dados = {"conteudo": "importante"}
cache.guardar("key1", dados)

print(cache.buscar("key1"))   # {'conteudo': 'importante'}
del dados                      # remove única referência forte
# dados agora pode ser coletado
import gc; gc.collect()
print(cache.buscar("key1"))   # None — foi coletado

# weakref.ref — referência fraca individual
class Widget:
    def __init__(self, nome):
        self.nome = nome

w = Widget("botão")
ref = weakref.ref(w)    # cria referência fraca
print(ref())            # Widget("botão") — objeto ainda existe
del w
print(ref())            # None — objeto coletado

# Callback quando objeto é coletado
def objeto_coletado(ref):
    print(f"objeto {ref} foi coletado!")

w2 = Widget("janela")
ref2 = weakref.ref(w2, objeto_coletado)
del w2   # "objeto <weakref at ...> foi coletado!"

# WeakSet — set com referências fracas (útil para observadores)
listeners = weakref.WeakSet()
# listeners.add(callback)  # callback coletado quando não há mais referências fortes`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Profiling de memória: encontrar vazamentos">
        <CodeBlock>{`# tracemalloc — rastreamento de alocações (stdlib)
import tracemalloc

tracemalloc.start()

# ... código a ser monitorado ...
dados = [list(range(1000)) for _ in range(1000)]

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics("lineno")

for stat in top_stats[:5]:
    print(stat)

# memory_profiler (pip install memory-profiler)
# @profile decora função para rastrear linha por linha:
# from memory_profiler import profile
# @profile
# def minha_funcao():
#     lista = [1] * 1_000_000    # line 2: +7.6MB
#     del lista                   # line 3: -7.6MB
#     return {}

# objgraph (pip install objgraph) — encontrar vazamentos
import objgraph
objgraph.show_growth()   # objetos que cresceram desde a última chamada
objgraph.most_common_types(10)   # tipos mais comuns na memória
# objgraph.show_backrefs(obj) — quem referencia este objeto?

# Verificar memory leak em loop:
import os, psutil
process = psutil.Process(os.getpid())
print(f"RSS: {process.memory_info().rss / 1024**2:.1f} MB")`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Checklist anti-memory-leak:</strong> evite referências circulares (use weakref para observadores/caches). Use <code>__slots__</code> em classes com muitas instâncias. Feche recursos com <code>with</code> (context manager). Monitore com <code>tracemalloc</code> em produção. Cuidado com closures que capturam objetos grandes desnecessariamente.
      </Callout>

      <Callout>
        Próximo: <strong>Bytecode e dis</strong> — o que Python realmente executa por baixo e como ler o disassembly para entender performance.
      </Callout>
    </div>
  );
}
