import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('python-modelo-mental');

const quiz: QuizQuestion[] = [
  {
    question: 'O que acontece quando você executa `a = [1, 2]; b = a; b.append(3); print(a)`?',
    options: [
      'Imprime [1, 2] — b é uma cópia independente de a',
      'Imprime [1, 2, 3] — a e b são referências para o mesmo objeto lista. b.append(3) modifica o objeto in-place, e a também aponta para ele.',
      'Gera um erro porque não se pode ter duas variáveis com o mesmo valor',
      'Imprime [1, 2] — Python cria cópias automaticamente ao atribuir',
    ],
    correct: 1,
    explanation: 'Em Python, variáveis são rótulos que apontam para objetos. `b = a` não cria uma nova lista — faz b apontar para o mesmo objeto lista que a. `b.append(3)` modifica esse objeto. Para uma cópia independente: `b = a.copy()` ou `b = a[:]` (shallow copy) ou `copy.deepcopy(a)` (deep copy).',
  },
  {
    question: 'Qual a diferença entre `==` e `is` em Python?',
    options: [
      'São equivalentes — ambos verificam igualdade de valor',
      '`==` chama __eq__ e verifica igualdade de valor. `is` verifica identidade — se são o MESMO objeto (mesmo id()). Dois objetos podem ser iguais (==) sem ser o mesmo objeto (is). Exceção: inteiros pequenos (-5 a 256) e strings curtas são internados (cached), então is pode ser True.',
      '`is` é mais rápido portanto sempre preferível',
      '`is` só funciona para strings, `==` para qualquer tipo',
    ],
    correct: 1,
    explanation: 'CPython internamente faz "interning" de inteiros de -5 a 256 e muitas strings. Por isso `1 is 1` é True mas `1000 is 1000` pode ser False fora de contexto de módulo. Nunca use `is` para comparar valores — use apenas para verificar identidade específica (ex: `if x is None`). `is None` é sempre correto (None é singleton).',
  },
  {
    question: 'Por que usar uma lista como valor default de parâmetro é um bug clássico em Python?',
    options: [
      'Porque listas não podem ser passadas como argumentos',
      'Porque o objeto default é criado UMA VEZ quando a função é definida (não a cada chamada). Todas as chamadas sem argumento compartilham o MESMO objeto lista. Mutações acumulam entre chamadas. Fix: usar None como default e criar a lista dentro da função.',
      'Porque Python não suporta listas como argumentos default',
      'Porque listas causam memory leaks quando usadas como defaults',
    ],
    correct: 1,
    explanation: 'def f(lst=[]): lst.append(1); return lst → primeira chamada retorna [1], segunda retorna [1, 1], terceira [1, 1, 1]. O objeto lista do default persiste entre chamadas. Correção: def f(lst=None): if lst is None: lst = []; lst.append(1); return lst. Esse bug afeta qualquer tipo mutável como default (dict, set, objetos customizados).',
  },
];

export default function PythonModeloMentalPage() {
  return (
    <ModuleLayout
      slug="python-modelo-mental"
      title="Modelo mental do Python: tudo é objeto, referência, mutabilidade"
      icon="🧩"
      xp={55}
      readTime={11}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="venv-pip-uv"
      nextTitle="venv, pip, uv: isolamento de dependências sem dor"
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
        Python parece simples, mas seu modelo de objetos e referências causa bugs difíceis de rastrear quando mal compreendido. Entender como Python realmente funciona por baixo elimina uma categoria inteira de erros.
      </p>

      <Section accent={accent} title="Tudo é objeto — sem exceção">
        <p>
          Em Python, <em>tudo</em> é um objeto: inteiros, strings, funções, classes, módulos, None. Cada objeto tem uma <strong>identidade</strong> (id()), um <strong>tipo</strong> (type()), e um <strong>valor</strong>. Variáveis são apenas rótulos que apontam para objetos.
        </p>
        <CodeBlock>{`# Verificando objetos
x = 42
print(id(x))       # endereço do objeto na memória (ex: 140234567890)
print(type(x))     # <class 'int'>
print(x.__class__) # int

# Funções são objetos
def soma(a, b): return a + b
print(type(soma))  # <class 'function'>
print(id(soma))    # tem um id também
fn = soma          # fn aponta para o mesmo objeto função
fn(1, 2)           # funciona igual a soma(1, 2)

# Até None é um objeto
print(type(None))  # <class 'NoneType'>
print(id(None))    # sempre o mesmo (None é singleton)

# Classes são objetos
print(type(int))   # <class 'type'>
print(type(list))  # <class 'type'>`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Referências: variáveis são rótulos, não caixas">
        <p>
          Diferente de linguagens como C, variáveis Python não armazenam valores — armazenam <em>referências</em> (ponteiros) para objetos. A atribuição <code>=</code> faz a variável apontar para um objeto.
        </p>
        <CodeBlock>{`a = [1, 2, 3]   # cria uma lista, 'a' aponta para ela
b = a           # 'b' aponta para o MESMO objeto lista
print(a is b)   # True — mesmo objeto

b.append(4)
print(a)        # [1, 2, 3, 4] — a lista foi modificada!

# Para cópia rasa (shallow copy):
b = a.copy()     # ou a[:] ou list(a)
b.append(5)
print(a)         # [1, 2, 3, 4] — não afetado

# Para cópia profunda (deep copy) — objetos aninhados:
import copy
original = [[1, 2], [3, 4]]
rasa = original.copy()
profunda = copy.deepcopy(original)

rasa[0].append(99)     # afeta original (mesmo objeto interno)
profunda[0].append(88) # NÃO afeta original (objeto novo)
print(original)        # [[1, 2, 99], [3, 4]]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Mutabilidade: o que pode ser modificado in-place">
        <ComparisonTable
          headers={['Tipo', 'Mutável?', 'Criação', 'Exemplos']}
          rows={[
            ['list', 'Sim', '[]', 'append, extend, remove, sort'],
            ['dict', 'Sim', '{}', 'update, pop, del d[k]'],
            ['set', 'Sim', 'set()', 'add, discard, union'],
            ['bytearray', 'Sim', 'bytearray()', 'b[0] = 65'],
            ['int, float', 'Não', 'literal', 'criar novo objeto ao operar'],
            ['str', 'Não', '"..."', 'operações criam nova string'],
            ['tuple', 'Não', '()', 'não tem métodos de modificação'],
            ['frozenset', 'Não', 'frozenset()', 'versão imutável de set'],
            ['bytes', 'Não', 'b"..."', 'operações criam novos bytes'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Imutabilidade de strings — operações criam novos objetos
s = "hello"
print(id(s))
s += " world"   # NÃO modifica a string original — cria nova
print(id(s))    # id diferente! objeto diferente

# Por isso concatenar strings em loop é O(n²) — use join:
# ❌ Lento para muitos itens:
result = ""
for palavra in palavras:
    result += palavra + " "

# ✅ Eficiente — join é O(n):
result = " ".join(palavras)

# Tuplas não são listas imutáveis — são estruturas heterogêneas:
ponto = (3.14, 2.72)      # coordenadas — semântica de posição
lista = [1, 2, 3, 4, 5]   # coleção homogênea — semântica de sequência
# Use tuple para dados que não devem mudar estruturalmente
# Use tuple como chave de dict (hashable), lista não pode`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Identidade vs Igualdade: is vs ==">
        <CodeBlock>{`# == verifica valor (chama __eq__)
# is verifica identidade (mesmo objeto, mesmo id())

a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)   # True — mesmo valor
print(a is b)   # False — objetos diferentes

# CORRETO: usar is apenas para None, True, False (singletons)
if x is None:   # ✅ correto
    pass
if x == None:   # ⚠️ funciona mas não idiomático

# ARMADILHA: inteiros de -5 a 256 são cacheados pelo CPython
a = 256; b = 256
print(a is b)   # True — mesmo objeto (cacheado)
a = 257; b = 257
print(a is b)   # False em geral — objetos diferentes
                # (dependente da implementação e contexto)

# Strings curtas e simples também são internadas:
a = "hello"; b = "hello"
print(a is b)   # provavelmente True (interning)
a = "hello world!"; b = "hello world!"
print(a is b)   # pode ser True ou False — não confie`}</CodeBlock>
      </Section>

      <Section accent={accent} title="O bug dos mutable defaults">
        <CodeBlock>{`# BUG CLÁSSICO — default list criada uma vez, compartilhada
def adicionar_item(item, lista=[]):
    lista.append(item)
    return lista

print(adicionar_item("a"))  # ['a']
print(adicionar_item("b"))  # ['a', 'b']  ← bug! esperava ['b']
print(adicionar_item("c"))  # ['a', 'b', 'c']

# Por que? O objeto [] é criado quando a função é definida,
# não quando é chamada. Inspecione:
print(adicionar_item.__defaults__)  # (['a', 'b', 'c'],)

# CORREÇÃO — use None como sentinela
def adicionar_item_correto(item, lista=None):
    if lista is None:
        lista = []   # nova lista a cada chamada
    lista.append(item)
    return lista

# Isso vale para qualquer tipo mutável como default:
# dict, set, objetos, etc.

# EXCEÇÃO ÚTIL: quando você QUER estado compartilhado (cache)
def fibonacci(n, cache={}):
    if n in cache: return cache[n]
    if n <= 1: return n
    cache[n] = fibonacci(n-1, cache) + fibonacci(n-2, cache)
    return cache[n]
# O dict compartilhado funciona como cache entre chamadas — intencional`}</CodeBlock>
        <Callout tone="warn">
          Ferramentas de linting (pylint, ruff) detectam o bug do mutable default automaticamente. Configure-as no seu projeto — elas pegam essa e dezenas de outras armadilhas antes do runtime.
        </Callout>
      </Section>

      <Section accent={accent} title="Como a atribuição realmente funciona">
        <CodeBlock>{`# Operações que NÃO modificam o objeto original (criam novo):
x = 5
x = x + 1    # cria novo int 6, x passa a apontar para ele
y = x        # y aponta para 6

# Operações que modificam o objeto in-place (mutáveis):
lst = [1, 2, 3]
lst.append(4)      # modifica a lista em si
lst += [5]         # atenção: list += é in-place (lst.__iadd__)
lst = lst + [6]    # ← este cria uma NOVA lista

# += em listas vs += em strings:
a = [1, 2]; b = a
a += [3]           # in-place — b também vira [1, 2, 3]
print(a is b)      # True

a = "hello"; b = a
a += " world"      # cria nova string — b ainda é "hello"
print(a is b)      # False`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> Python = rótulos que apontam para objetos. Atribuição = redirecionar o rótulo. Mutáveis = modificam o objeto. Imutáveis = criam objetos novos. <code>is</code> = mesmo objeto. <code>==</code> = mesmo valor.
      </Callout>

      <Callout>
        Próximo: <strong>venv, pip, uv</strong> — por que ambientes virtuais existem e como configurar um setup profissional de dependências Python.
      </Callout>
    </div>
  );
}
