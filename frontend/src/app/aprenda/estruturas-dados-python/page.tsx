import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('estruturas-dados-python');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que `x in minha_lista` é O(n) mas `x in meu_set` é O(1)?',
    options: [
      'Porque sets são mais novos e foram otimizados',
      'list verifica elementos um por um até encontrar (busca linear). set usa uma hash table — calcula hash(x) para encontrar o bucket diretamente, sem verificar outros elementos. Dict também tem O(1) para `in` pelo mesmo motivo. A troca: set ocupa mais memória e requer elementos hashable.',
      'Porque list suporta duplicatas e precisa verificar todos',
      'set usa cache enquanto list não',
    ],
    correct: 1,
    explanation: 'Hash tables são a estrutura de dados mais importante para buscas. Python dict e set são implementados como hash tables. O custo médio de busca é O(1) — no pior caso (muitas colisões) pode ser O(n), mas isso é raro com boas funções hash. Para buscas frequentes em grandes coleções, converter list para set antes do loop pode mudar O(n²) para O(n).',
  },
  {
    question: 'Qual a complexidade de `list.insert(0, x)` (inserção no início) vs `list.append(x)` (inserção no final)?',
    options: [
      'Ambas são O(1) — list é otimizado para ambas as extremidades',
      'insert(0, x) é O(n) — todos os elementos precisam ser deslocados uma posição para abrir espaço no início. append(x) é O(1) amortizado — insere no final sem deslocar nada. Para fila com inserções no início: use collections.deque que é O(1) em ambas as extremidades.',
      'insert(0, x) é O(log n) porque usa busca binária',
      'Ambas são O(n) — list sempre recalcula índices',
    ],
    correct: 1,
    explanation: 'List Python é um array dinâmico (como ArrayList em Java ou vector em C++). O(1) amortizado para append porque quando a capacidade esgota, duplica o espaço (1, 2, 4, 8... elementos extras). Inserção/remoção no meio ou início é O(n) — desloca todos. collections.deque é uma lista duplamente encadeada: O(1) em ambas as extremidades, mas O(n) para acesso por índice.',
  },
  {
    question: 'Por que `dict` em Python 3.7+ mantém ordem de inserção, mas `set` não?',
    options: [
      'Porque dict é implementado diferente de set em Python 3.7',
      'dict foi redesenhado no Python 3.6/3.7 para usar uma estrutura compacta que preserva ordem de inserção como detalhe de implementação (CPython 3.6) e depois como garantia da linguagem (3.7+). set permanece como hash table puro sem tracking de ordem — adicionar order tracking teria custo extra sem benefício claro para um tipo que representa um conjunto matemático.',
      'Porque set é mais antigo e não foi atualizado ainda',
      'Ambos preservam ordem — você deve estar confundindo',
    ],
    correct: 1,
    explanation: 'dict compacto (Python 3.6, Raymond Hettinger) usa um array de índices + array de entradas separado. As entradas ficam na ordem de inserção. O array de índices é a hash table. Isso usa menos memória E preserva ordem. set não tem essa estrutura — é apenas a hash table, sem array de entradas ordenado.',
  },
];

export default function EstruturasDadosPythonPage() {
  return (
    <ModuleLayout
      slug="estruturas-dados-python"
      title="dict, list, set, tuple: quando cada um e por quê"
      icon="🗂️"
      xp={60}
      readTime={12}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="iteradores-generators"
      nextTitle="Iteradores, generators e lazy evaluation"
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
        Escolher a estrutura de dados errada pode transformar um algoritmo O(n) em O(n²). Entender a complexidade real de cada operação em list, dict, set e tuple não é teoria — é o que diferencia código que escala de código que trava.
      </p>

      <Section accent={accent} title="Complexidade de operações: tabela de referência">
        <ComparisonTable
          headers={['Operação', 'list', 'dict', 'set', 'deque']}
          rows={[
            ['Acesso por índice [i]', 'O(1)', 'N/A', 'N/A', 'O(n)'],
            ['Busca (x in ...)', 'O(n)', 'O(1)', 'O(1)', 'O(n)'],
            ['Inserção no final', 'O(1) amort.', 'O(1)', 'O(1)', 'O(1)'],
            ['Inserção no início', 'O(n)', 'N/A', 'N/A', 'O(1)'],
            ['Inserção no meio', 'O(n)', 'N/A', 'N/A', 'O(n)'],
            ['Remoção do final', 'O(1)', 'O(1)', 'O(1)', 'O(1)'],
            ['Remoção do início', 'O(n)', 'N/A', 'N/A', 'O(1)'],
            ['Remoção por valor', 'O(n)', 'N/A', 'O(1)', 'O(n)'],
            ['len()', 'O(1)', 'O(1)', 'O(1)', 'O(1)'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="list: array dinâmico">
        <CodeBlock>{`# list é um array dinâmico — acesso por índice O(1), busca O(n)

# BOAS práticas:
numeros = [1, 2, 3, 4, 5]
numeros.append(6)        # O(1) amortizado
ultimo = numeros.pop()   # O(1) — remove do final

# List comprehension é mais rápido que loop + append:
quadrados = [x**2 for x in range(1000)]  # rápido — C interno
# vs:
quadrados = []
for x in range(1000):
    quadrados.append(x**2)  # mais lento — overhead Python

# sorted() cria nova lista, .sort() é in-place:
nova = sorted(numeros, key=lambda x: -x)  # nova lista
numeros.sort(reverse=True)                 # in-place, usa menos memória

# PROBLEMA: busca em list grande é O(n)
dados = list(range(1_000_000))
# ❌ Lento — verifica um por um
for x in dados:
    if x in dados:   # O(n) a cada iteração = O(n²) total
        pass

# ✅ Converter para set se vai fazer muitas buscas
dados_set = set(dados)
for x in dados:
    if x in dados_set:  # O(1) = O(n) total
        pass

# bisect para busca em lista ORDENADA — O(log n)
import bisect
pos = bisect.bisect_left(dados, 500_000)  # log(1_000_000) ≈ 20 operações`}</CodeBlock>
      </Section>

      <Section accent={accent} title="dict: hash table com ordem de inserção">
        <CodeBlock>{`# dict: O(1) para acesso, inserção, busca, remoção

d = {"nome": "Fernando", "xp": 500}
d["nivel"] = 4            # O(1) inserção
valor = d.get("xp", 0)   # O(1) com default

# Padrões úteis:
# defaultdict — cria valor default automaticamente
from collections import defaultdict
contagem = defaultdict(int)
for palavra in texto.split():
    contagem[palavra] += 1  # não precisa verificar se existe

# Counter — contagem especializada com métodos extras
from collections import Counter
c = Counter(["a", "b", "a", "c", "a"])
print(c.most_common(2))   # [('a', 3), ('b', 1)]

# dict comprehension
quadrados = {x: x**2 for x in range(10)}

# Merge de dicts (Python 3.9+)
config_base = {"timeout": 30, "retries": 3}
config_extra = {"timeout": 60, "debug": True}
merged = config_base | config_extra   # {timeout: 60, retries: 3, debug: True}

# setdefault — inicializa se não existe, retorna existente
d.setdefault("tags", []).append("python")

# Iteração eficiente
for chave, valor in d.items():    # mais eficiente que d[k] no loop
    pass

# Verificar se chave existe — CORRETO
if "nome" in d:       # O(1) — usa hash
    pass
# NÃO fazer:
try:
    x = d["nome"]     # EAFP (ask forgiveness) — OK em Python, mas lento se miss frequente
except KeyError:
    x = default`}</CodeBlock>
      </Section>

      <Section accent={accent} title="set: conjunto com busca O(1)">
        <CodeBlock>{`# set: elementos únicos, hashable, busca O(1)

s = {1, 2, 3, 4, 5}
s.add(6)           # O(1)
s.discard(10)      # O(1), não gera erro se não existe
s.remove(1)        # O(1), gera KeyError se não existe
3 in s             # O(1)

# Operações de conjunto:
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
a | b   # união: {1, 2, 3, 4, 5, 6}
a & b   # interseção: {3, 4}
a - b   # diferença: {1, 2}
a ^ b   # diferença simétrica: {1, 2, 5, 6}

# Caso de uso clássico — remover duplicatas mantendo unicidade:
lista_com_dupes = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
unicos = list(set(lista_com_dupes))      # perde ordem
# Para manter ordem (Python 3.7+):
from dict import fromkeys
unicos_ordenados = list(dict.fromkeys(lista_com_dupes))  # dict preserva ordem

# Verificar subconjunto:
{1, 2}.issubset({1, 2, 3})   # True
{1, 2} <= {1, 2, 3}          # equivalente

# frozenset — set imutável e hashable (pode ser chave de dict)
config = frozenset({"debug", "verbose"})
cache = {config: "resultado"}   # OK — frozenset é hashable`}</CodeBlock>
      </Section>

      <Section accent={accent} title="collections: estruturas especializadas">
        <CodeBlock>{`from collections import deque, OrderedDict, namedtuple, ChainMap

# deque — fila dupla, O(1) em ambas as extremidades
fila = deque([1, 2, 3])
fila.append(4)       # O(1) — fim
fila.appendleft(0)   # O(1) — início
fila.pop()           # O(1) — remove do fim
fila.popleft()       # O(1) — remove do início

# deque com maxlen — janela deslizante
ultimas_10 = deque(maxlen=10)
for item in stream:
    ultimas_10.append(item)  # quando cheia, remove o mais antigo

# namedtuple — tupla com campos nomeados (imutável, sem overhead de dict)
Ponto = namedtuple("Ponto", ["x", "y"])
p = Ponto(3.0, 4.0)
p.x, p.y             # acesso por nome
p[0], p[1]           # acesso por índice
# Versão moderna: dataclass ou typing.NamedTuple com type hints:
from typing import NamedTuple
class Ponto3D(NamedTuple):
    x: float
    y: float
    z: float = 0.0

# ChainMap — múltiplos dicts com precedência
import os
defaults = {"debug": False, "timeout": 30}
env_vars = {"timeout": 60}
config = ChainMap(env_vars, defaults)
config["timeout"]   # 60 — env_vars tem precedência
config["debug"]     # False — cai para defaults`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regra prática:</strong> usa list quando precisa de ordem e acesso por índice. dict para mapeamentos. set para unicidade e busca eficiente. deque para fila/pilha com inserção/remoção em ambas as extremidades. tuple para dados heterogêneos imutáveis (coordenadas, registros).
      </Callout>

      <Callout>
        Próximo: <strong>Iteradores e generators</strong> — processamento lazy que evita carregar dados inteiros na memória.
      </Callout>
    </div>
  );
}
