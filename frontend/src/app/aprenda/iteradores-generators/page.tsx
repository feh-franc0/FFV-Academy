import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('iteradores-generators');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença principal entre uma list comprehension `[x**2 for x in range(1_000_000)]` e uma generator expression `(x**2 for x in range(1_000_000))`?',
    options: [
      'São equivalentes — a sintaxe é diferente mas o comportamento é idêntico',
      'A list comprehension cria todos os 1 milhão de valores na memória imediatamente. A generator expression cria um objeto gerador que produz cada valor sob demanda (lazy), consumindo memória constante O(1) independente do tamanho. Para processar sem materializar, use generator.',
      'Generator expressions são mais lentas por causa do overhead de lazy evaluation',
      'Generator expressions só funcionam com funções built-in como map e filter',
    ],
    correct: 1,
    explanation: 'Generators implementam avaliação lazy: nenhum valor é computado até ser solicitado. Ideal para pipelines de dados grandes onde você processa elemento por elemento. `sum(x**2 for x in range(1_000_000))` usa O(1) de memória — nunca há 1 milhão de valores em RAM simultaneamente. A list comprehension usa O(n) de memória para armazenar todos os resultados.',
  },
  {
    question: 'O que acontece quando você chama `next()` num generator depois que ele exauriu todos os valores?',
    options: [
      'Retorna None automaticamente',
      'Levanta StopIteration — a mesma exceção que o for loop usa internamente para saber quando parar. Você pode capturar com try/except StopIteration, ou usar next(gen, valor_default) para retornar um default em vez de exceção.',
      'O generator reinicia do começo automaticamente',
      'Bloqueia até ter um novo valor disponível',
    ],
    correct: 1,
    explanation: 'O protocolo de iteração em Python usa StopIteration como sinal de esgotamento. O `for` loop chama `next()` repetidamente e para quando captura StopIteration. Você pode usar `next(gen, default)` para safe next: `next(iter([]), "vazio")` retorna "vazio" em vez de StopIteration. Generators são one-shot — esgotados, precisam ser recriados.',
  },
  {
    question: 'O que `yield from` faz em um generator que delega para outro iterável?',
    options: [
      'É açúcar sintático para `for item in iteravel: yield item` — delega a iteração para outro iterável, propagando StopIteration e valores bidiretamente (incluindo send() e throw()). É mais eficiente e correto do que um loop manual.',
      'Cria uma cópia completa do iterável na memória',
      'Funciona apenas com outros generators, não com listas ou tuplas',
      'É equivalente a return — encerra o generator imediatamente',
    ],
    correct: 0,
    explanation: '`yield from` implementa delegação completa: propaga `send()` values, `throw()` exceptions, e o valor de `return` do sub-generator fica disponível como valor da expressão `yield from`. Essencial para generators recursivos (ex: traversal de árvore) e para compor pipelines. `yield from range(10)` é equivalente a `for i in range(10): yield i`, mas mais eficiente.',
  },
];

export default function IteradoresGeneratorsPage() {
  return (
    <ModuleLayout
      slug="iteradores-generators"
      title="Iteradores, generators e lazy evaluation"
      icon="🔄"
      xp={65}
      readTime={13}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="decorators-context-managers"
      nextTitle="Decorators e context managers: o que são de verdade"
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
        Iteradores e generators são a base da eficiência em Python. Entender o protocolo de iteração explica por que `for`, `in`, `list()`, `sum()`, e `zip()` funcionam com qualquer objeto — e generators permitem processar dados massivos sem carregar nada na memória.
      </p>

      <Section accent={accent} title="O protocolo de iteração: __iter__ e __next__">
        <p>
          Qualquer objeto <strong>iterável</strong> em Python implementa <code>__iter__()</code> que retorna um <strong>iterador</strong>. O iterador implementa <code>__next__()</code> que retorna o próximo valor ou levanta <code>StopIteration</code>.
        </p>
        <CodeBlock>{`# O que o for loop faz por baixo:
numeros = [1, 2, 3]

# Equivalente manual ao: for x in numeros:
iterador = iter(numeros)        # chama numeros.__iter__()
while True:
    try:
        x = next(iterador)      # chama iterador.__next__()
        print(x)
    except StopIteration:
        break                   # for termina aqui

# Implementando um iterável customizado
class Countdown:
    def __init__(self, start):
        self.start = start

    def __iter__(self):
        # retorna o próprio objeto se ele for o iterador
        self.current = self.start
        return self

    def __next__(self):
        if self.current < 0:
            raise StopIteration
        val = self.current
        self.current -= 1
        return val

for n in Countdown(3):
    print(n)    # 3, 2, 1, 0

# Qualquer objeto com __iter__ e __next__ funciona com:
list(Countdown(3))      # [3, 2, 1, 0]
sum(Countdown(3))       # 6
max(Countdown(3))       # 3
"2" in Countdown(3)     # False (verifica via iteração)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Generators: funções que pausam">
        <p>
          Uma função com <code>yield</code> é um <strong>generator function</strong>. Chamá-la não executa o corpo — retorna um objeto generator. Cada chamada a <code>next()</code> executa até o próximo <code>yield</code> e pausa, preservando o estado local (variáveis, posição no código, call stack).
        </p>
        <CodeBlock>{`# Generator function — yield pausa a execução
def fibonacci():
    a, b = 0, 1
    while True:         # infinito! não tem problema — lazy
        yield a
        a, b = b, a + b

gen = fibonacci()
print(next(gen))    # 0
print(next(gen))    # 1
print(next(gen))    # 1
print(next(gen))    # 2

# Pegar os primeiros N:
from itertools import islice
primeiros_10 = list(islice(fibonacci(), 10))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# Generator finito — processa arquivo linha por linha sem carregar tudo
def linhas_nao_vazias(arquivo):
    with open(arquivo) as f:
        for linha in f:             # f já é um iterador
            linha = linha.strip()
            if linha:
                yield linha

# Processa um arquivo de 10GB linha a linha — O(1) de memória
for linha in linhas_nao_vazias("dados.txt"):
    processar(linha)

# yield from — delega para sub-generator
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)    # recursão elegante
        else:
            yield item

list(flatten([1, [2, [3, 4]], [5]]))  # [1, 2, 3, 4, 5]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Generator expressions vs list comprehensions">
        <ComparisonTable
          headers={['Aspecto', 'List comprehension [...]', 'Generator expression (...)']}
          rows={[
            ['Sintaxe', '[expr for x in it]', '(expr for x in it)'],
            ['Memória', 'O(n) — todos na memória', 'O(1) — um por vez'],
            ['Velocidade (iteration)', 'Mais rápida (array C)', 'Ligeiramente mais lenta'],
            ['Reutilizável', 'Sim — é uma lista', 'Não — one-shot'],
            ['len() disponível', 'Sim', 'Não'],
            ['Indexação [i]', 'Sim', 'Não'],
            ['Uso ideal', 'Resultado pequeno/reutilizado', 'Pipeline / dados grandes'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# List comprehension — cria lista em memória
quadrados = [x**2 for x in range(1_000_000)]    # usa ~8MB de RAM
print(quadrados[500])   # acesso direto por índice: O(1)
print(len(quadrados))   # sabe o tamanho

# Generator expression — lazy
gen_quadrados = (x**2 for x in range(1_000_000))   # ~100 bytes!
# Não pode indexar — é uma sequência one-shot
print(next(gen_quadrados))   # 0
print(next(gen_quadrados))   # 1

# Passar generator direto para funções que consomem iterável:
total = sum(x**2 for x in range(1_000_000))     # O(1) memória
maximo = max(len(s) for s in ["ab", "c", "xyz"]) # 3

# Pipeline — composição de generators
def ler_csv(arquivo):
    with open(arquivo) as f:
        next(f)                         # pula header
        for linha in f:
            yield linha.strip().split(",")

def filtrar_ativos(registros):
    for registro in registros:
        if registro[2] == "ativo":
            yield registro

def calcular_total(registros):
    for registro in registros:
        yield float(registro[1]) * int(registro[3])

# Pipeline 100% lazy — lê uma linha por vez
arquivo = "transacoes.csv"
total = sum(calcular_total(filtrar_ativos(ler_csv(arquivo))))`}</CodeBlock>
      </Section>

      <Section accent={accent} title="send() e generators bidirecionais">
        <CodeBlock>{`# Generators podem receber valores via send()
def acumulador():
    total = 0
    while True:
        valor = yield total    # yield retorna total E recebe novo valor
        if valor is None:
            break
        total += valor

gen = acumulador()
next(gen)           # deve iniciar o generator (avança até o primeiro yield)
gen.send(10)        # envia 10, recebe 10 de volta
gen.send(20)        # envia 20, recebe 30
gen.send(5)         # envia 5, recebe 35

# Caso de uso real: co-rotinas simples para parsing
def parser_csv():
    campos = None
    while True:
        linha = yield campos
        if linha is None:
            return
        campos = linha.strip().split(",")

p = parser_csv()
next(p)                         # inicializa
p.send("nome,idade,cidade")     # ['nome', 'idade', 'cidade']
p.send("Fernando,30,SP")        # ['Fernando', '30', 'SP']

# throw() — injeta exceção no generator
# close() — lança GeneratorExit, generator pode cleanup com try/finally
def generator_com_cleanup():
    try:
        while True:
            yield
    finally:
        print("limpeza executada")  # roda quando gen.close() é chamado`}</CodeBlock>
      </Section>

      <Section accent={accent} title="itertools: pipelines funcionais">
        <CodeBlock>{`from itertools import (
    count, cycle, repeat,           # infinitos
    chain, chain_from_iterable,     # concatenação
    islice, takewhile, dropwhile,   # filtro/fatiamento
    groupby,                        # agrupamento
    product, permutations,          # combinatórios
    accumulate, starmap,            # transformação
    zip_longest, pairwise,          # zip avançado
)

# count — inteiros infinitos (substituí range quando não tem fim)
from itertools import count
for i in count(start=10, step=2):
    if i > 20: break    # 10, 12, 14, 16, 18, 20

# chain — concatena iteráveis sem criar lista intermediária
from itertools import chain
letras = chain("ABC", "DEF", [1, 2])   # A B C D E F 1 2

# islice — fatia iterável lazy (como slice mas para qualquer iterável)
from itertools import islice
gen = (x**2 for x in count())
print(list(islice(gen, 5)))    # [0, 1, 4, 9, 16]

# groupby — agrupa elementos consecutivos por chave
from itertools import groupby
dados = [("a", 1), ("a", 2), ("b", 3), ("b", 4), ("c", 5)]
for chave, grupo in groupby(dados, key=lambda x: x[0]):
    print(chave, list(grupo))
# a [('a', 1), ('a', 2)]
# b [('b', 3), ('b', 4)]
# ⚠️ groupby só agrupa consecutivos — ordene antes se necessário

# accumulate — running total / prefix sum
from itertools import accumulate
import operator
list(accumulate([1, 2, 3, 4, 5]))                     # [1, 3, 6, 10, 15]
list(accumulate([1, 2, 3, 4, 5], operator.mul))        # [1, 2, 6, 24, 120]

# pairwise (Python 3.10+) — pares consecutivos
from itertools import pairwise
list(pairwise("ABCD"))   # [('A','B'), ('B','C'), ('C','D')]
# útil para calcular diferenças: diff = [b-a for a, b in pairwise(valores)]

# Pipeline funcional completo
from itertools import chain, islice, takewhile
# Primeiros 100 números primos de forma lazy:
def eh_primo(n):
    return n > 1 and all(n % i != 0 for i in range(2, int(n**0.5)+1))

primos = islice(filter(eh_primo, count(2)), 100)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regra prática:</strong> use generator expression quando processar sequências grandes elemento por elemento. Use list comprehension quando precisar do resultado completo (indexar, len, iterar múltiplas vezes). <code>itertools</code> tem todos os combinadores lazy que você precisa — aprenda <code>chain</code>, <code>islice</code>, <code>groupby</code> e <code>accumulate</code>.
      </Callout>

      <Callout>
        Próximo: <strong>Decorators e context managers</strong> — as ferramentas de metaprogramação que mudam comportamento de funções sem modificar seu código.
      </Callout>
    </div>
  );
}
