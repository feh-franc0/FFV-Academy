import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata: Metadata = {
  title: 'Bytecode e dis: o que Python realmente executa — FFV Academy',
  description: 'Como Python compila para bytecode, como ler o output do módulo dis, o que são .pyc files, e como o CPython executa instruções na VM.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que são arquivos `.pyc` e onde o Python os armazena?',
    options: [
      '.pyc são arquivos de configuração do Python',
      '.pyc são arquivos de bytecode compilado. Python os gera automaticamente em `__pycache__/` com nome `modulo.cpython-312.pyc` (versão do interpretador no nome). Na próxima importação, se .pyc for mais recente que .py, Python usa o bytecode diretamente — evita recompilar. O bytecode não é código de máquina — ainda é executado pela VM do CPython.',
      '.pyc são arquivos executáveis que rodam sem o Python instalado',
      '.pyc são arquivos temporários que Python sempre recria',
    ],
    correct: 1,
    explanation: 'O formato .pyc inclui: magic number (versão do interpretador), timestamp do .py fonte, tamanho do arquivo, e o objeto code serializado via marshal. Se você distribuir apenas .pyc (sem .py), o código ainda roda mas não é descompilado facilmente. pyinstaller/cx_freeze empacotam o interpretador + bytecode em executável. Em Python 3.8+, arquivos .pyc podem usar hash do fonte em vez de timestamp (flag --check-hash-based-pycs).',
  },
  {
    question: 'O que o módulo `dis` mostra e por que é útil para performance?',
    options: [
      'dis mostra o código-fonte formatado — é apenas um pretty-printer',
      'dis desassembla bytecode Python em instruções legíveis (opcodes como LOAD_FAST, CALL, BINARY_OP). Cada instrução tem custo diferente. Ver o bytecode explica por que `x in set` é mais rápido que `x in list` (SET_CONTAINS vs list iteration), por que list comprehension é mais rápida que loop + append (instruções C vs Python), e revela otimizações do compilador (constant folding, dead code elimination).',
      'dis executa o código em modo debug com breakpoints automáticos',
      'dis converte código Python em código C equivalente',
    ],
    correct: 1,
    explanation: 'dis.dis(func) mostra cada instrução de bytecode com: offset, linha do fonte, instrução, argumento. Exemplos de insights: `a + b + c` gera 2 BINARY_ADD. `f"{x}"` gera FORMAT_VALUE + BUILD_STRING. `x = x + 1` gera LOAD, BINARY_ADD, STORE vs `x += 1` gera LOAD, INPLACE_ADD, STORE — mesmos opcodes para tipos imutáveis. Variáveis locais (LOAD_FAST) são mais rápidas que globais (LOAD_GLOBAL) por uma tabela de índices.',
  },
  {
    question: 'Por que variáveis locais são mais rápidas que variáveis globais em Python?',
    options: [
      'Variáveis locais são armazenadas em memória mais próxima do processador',
      'LOAD_FAST (variável local) indexa diretamente numa array de ponteiros (`fastlocals`) — O(1) com índice inteiro. LOAD_GLOBAL precisa fazer lookup no dict do módulo (`LOAD_GLOBAL name`) — hash lookup. Para loops com muitas iterações, `local = alguma_funcao_global; for x in data: local(x)` é ~10-20% mais rápido que chamar diretamente.',
      'Variáveis locais são compiladas estaticamente para o código de máquina',
      'Não há diferença de velocidade — o Python otimiza automaticamente',
    ],
    correct: 1,
    explanation: 'Frames Python têm um array `f_localsplus` onde variáveis locais são acessadas por índice (determinado em compile time). LOAD_FAST simplesmente indexa esse array: `frame->localsplus[oparg]`. LOAD_GLOBAL faz `PyDict_GetItemWithError(globals, name)` — hash computation + dict lookup. A diferença é pequena (~50ns) mas acumula em loops de milhões de iterações. Você pode "localizar" funções globais antes de loops críticos.',
  },
];

export default function BytecodeDisPage() {
  return (
    <ModuleLayout
      slug="bytecode-dis"
      title="Bytecode e dis: o que Python realmente executa"
      icon="🔍"
      xp={55}
      readTime={11}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="pytest-profissional"
      nextTitle="pytest profissional: fixture, parametrize, mock, coverage"
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
        Python não executa código-fonte diretamente — compila para bytecode, que a VM do CPython interpreta. Entender esse pipeline, ler o output do <code>dis</code>, e conhecer os opcodes principais é o que torna intuições de performance em fatos verificáveis.
      </p>

      <Section accent={accent} title="O pipeline: fonte → bytecode → execução">
        <p>
          Quando você importa ou executa um módulo Python, o interpretador faz: <strong>tokenização → parsing → AST → compilação → bytecode</strong>. O bytecode é armazenado em <code>.pyc</code> e executado pela VM (ceval.c no CPython).
        </p>
        <CodeBlock>{`import py_compile
import dis
import ast

# Ver AST (Abstract Syntax Tree)
codigo = "x = 1 + 2"
arvore = ast.parse(codigo)
print(ast.dump(arvore, indent=2))
# Module(body=[Assign(targets=[Name(id='x')],
#   value=BinOp(left=Constant(1), op=Add(), right=Constant(2)))])

# O compilador otimiza em compile-time: 1 + 2 vira 3 (constant folding)
code = compile(codigo, "<string>", "exec")
dis.dis(code)
# LOAD_CONST  3        ← 1+2 calculado em compile time, não runtime!
# STORE_NAME  x

# Compilar arquivo manualmente
py_compile.compile("meu_modulo.py")
# gera __pycache__/meu_modulo.cpython-312.pyc

# Inspecionar objeto code
def soma(a, b):
    return a + b

co = soma.__code__
print(co.co_varnames)    # ('a', 'b') — variáveis locais
print(co.co_consts)      # (None,) — constantes
print(co.co_argcount)    # 2
print(co.co_flags)       # flags de otimização
print(co.co_filename)    # arquivo fonte
print(co.co_firstlineno) # linha de definição`}</CodeBlock>
      </Section>

      <Section accent={accent} title="dis: lendo bytecode">
        <CodeBlock>{`import dis

# dis.dis() — desassembla função ou método
def calcular(lst):
    total = 0
    for x in lst:
        total += x
    return total

dis.dis(calcular)
# Output (Python 3.12):
#   2           0 RESUME           0
#   3           2 LOAD_CONST       1 (0)          ← push 0
#               4 STORE_FAST       0 (total)       ← total = 0
#   4           6 LOAD_FAST        1 (lst)         ← push lst
#               8 GET_ITER                          ← iter(lst)
#   5    >>     10 FOR_ITER         4 (to 20)       ← next() ou pula
#               12 STORE_FAST      2 (x)            ← x = next()
#   6           14 LOAD_FAST       0 (total)
#               16 LOAD_FAST       2 (x)
#               18 BINARY_OP       13 (+=)          ← total += x
#               22 STORE_FAST      0 (total)
#               24 JUMP_BACKWARD   8 (to 10)
#   7    >>     26 LOAD_FAST       0 (total)
#               28 RETURN_VALUE

# Colunas: linha_fonte | offset | instrução | argumento | (valor)

# Comparar implementações:
def soma_loop(lst):
    total = 0
    for x in lst:
        total += x
    return total

def soma_builtin(lst):
    return sum(lst)

dis.dis(soma_loop)     # muitas instruções Python
dis.dis(soma_builtin)  # LOAD_GLOBAL sum + CALL_FUNCTION → 2 instruções C!
# sum() é C puro — muito mais rápido para listas grandes`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Opcodes importantes e o que revelam">
        <ComparisonTable
          headers={['Opcode', 'O que faz', 'Exemplo Python']}
          rows={[
            ['LOAD_FAST', 'Carrega variável local (array index)', 'x dentro de função'],
            ['LOAD_GLOBAL', 'Carrega variável global (dict lookup)', 'len, print no módulo'],
            ['LOAD_CONST', 'Carrega constante literal', '42, "texto", None'],
            ['CALL', 'Chama função (+ overhead Python)', 'f(), obj.method()'],
            ['BINARY_OP', 'Operação binária (+,-,*,/)', 'a + b'],
            ['GET_ITER / FOR_ITER', 'Protocolo de iteração', 'for x in iterable'],
            ['BUILD_LIST/DICT/SET', 'Constrói container', '[], {}, set()'],
            ['MAKE_FUNCTION', 'Cria objeto função', 'def f(): ... ou lambda'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`import dis

# Por que local é mais rápido que global em loops:
import math

def com_global():
    resultado = []
    for i in range(1000):
        resultado.append(math.sqrt(i))   # LOAD_GLOBAL math cada iteração
    return resultado

def com_local():
    sqrt = math.sqrt        # localiza uma vez
    resultado = []
    for i in range(1000):
        resultado.append(sqrt(i))        # LOAD_FAST sqrt — mais rápido
    return resultado

dis.dis(com_global)  # vê LOAD_GLOBAL e LOAD_ATTR em cada iteração
dis.dis(com_local)   # só LOAD_FAST no loop

# Por que list comprehension é mais rápida que loop + append:
def loop_append(n):
    result = []
    for i in range(n):
        result.append(i**2)   # LOAD_ATTR append + CALL em cada iteração
    return result

def list_comp(n):
    return [i**2 for i in range(n)]  # LIST_APPEND (C) — sem LOAD_ATTR

dis.dis(loop_append)   # vê o overhead de .append lookup
dis.dis(list_comp)     # LIST_APPEND é instrução nativa da VM

# Constant folding — Python calcula em compile time:
def constantes():
    return 1 + 2 * 3   # LOAD_CONST 7 — não 3 instruções!

dis.dis(constantes)
# LOAD_CONST  7   ← compilador calculou 1+2*3=7`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Otimizações do compilador Python">
        <CodeBlock>{`import dis

# Peephole optimizer — otimizações locais em bytecode

# 1. Constant folding
def f1(): return 2 ** 10          # LOAD_CONST 1024
def f2(): return "hello " + "world"  # LOAD_CONST 'hello world'
def f3(): return (1, 2, 3)        # LOAD_CONST (1, 2, 3)

# 2. Dead code elimination
def f4(x):
    if True:         # condição constante
        return x
    return x + 1     # nunca alcançado — pode ser removido

# 3. Tuple em vez de lista para constantes (lookup mais rápido):
# if x in [1, 2, 3]:  → compilador converte para frozenset/tuple
# if x in (1, 2, 3):  → LOAD_CONST (1, 2, 3) + CONTAINS_OP

# Medição de performance: timeit
import timeit

# Comparar implementações com dados reais
setup = "data = list(range(1000))"
t1 = timeit.timeit("[x**2 for x in data]", setup, number=10000)
t2 = timeit.timeit(
    "result = []\nfor x in data:\n    result.append(x**2)",
    setup, number=10000
)
print(f"comprehension: {t1:.3f}s")
print(f"loop+append:   {t2:.3f}s")   # ~30-50% mais lento

# cProfile para profiling real
import cProfile
cProfile.run("sum(x**2 for x in range(1_000_000))")
# ncalls  tottime  percall  cumtime  percall  filename:lineno(function)
# ...`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Quando usar dis:</strong> antes de otimizar, confirme que o bytecode faz o que você espera. <code>dis.dis(f)</code> em funções críticas. <code>timeit</code> para comparar. <code>cProfile</code> para encontrar gargalos reais. Optimize o que mede, não o que acha lento.
      </Callout>

      <Callout>
        Próximo: <strong>pytest profissional</strong> — fixtures, parametrize, mocking e coverage para projetos reais.
      </Callout>
    </div>
  );
}
