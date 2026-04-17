import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata: Metadata = {
  title: 'GIL, threading e multiprocessing: quando cada um — FFV Academy',
  description: 'O que é o GIL e quando ele importa. threading para I/O-bound, multiprocessing para CPU-bound, concurrent.futures como interface unificada.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que usar `threading` em Python não acelera código CPU-bound, mas acelera código I/O-bound?',
    options: [
      'threading sempre acelera — o problema é a implementação do código',
      'O GIL (Global Interpreter Lock) permite que apenas um thread execute bytecode Python por vez. Para CPU-bound, threads Python alternam rapidamente mas nunca rodam em paralelo — overhead sem ganho. Para I/O-bound, quando um thread aguarda I/O (rede, disco), o GIL é liberado e outro thread pode executar Python. Paralelismo real de CPU exige multiprocessing.',
      'threading funciona para CPU-bound apenas com Python 3.12+',
      'O problema é que threads Python são "green threads" — não são threads reais do SO',
    ],
    correct: 1,
    explanation: 'O GIL é um mutex que protege o estado interno do CPython. Threads Python são threads reais do SO, mas o GIL garante que apenas uma execute bytecode por vez. Operações I/O liberam o GIL (o sistema operacional cuida da espera). Operações C em NumPy/scikit-learn também liberam o GIL — por isso código NumPy multithreaded escala. Para paralelismo Python puro: multiprocessing (processos separados, cada um com seu GIL).',
  },
  {
    question: 'Qual a principal diferença prática entre `concurrent.futures.ThreadPoolExecutor` e `ProcessPoolExecutor`?',
    options: [
      'São intercambiáveis — a diferença é só na nomenclatura',
      'ThreadPoolExecutor cria threads no mesmo processo (GIL compartilhado — bom para I/O-bound). ProcessPoolExecutor cria processos separados (cada um com seu GIL — bom para CPU-bound). A interface é idêntica: submit(), map(), as_completed(). Trocar um pelo outro é uma linha de código.',
      'ProcessPoolExecutor não suporta o método map()',
      'ThreadPoolExecutor é mais rápido em todos os casos porque evita overhead de IPC',
    ],
    correct: 1,
    explanation: 'concurrent.futures oferece interface unificada para ambos os modelos. A decisão é: I/O-bound (lendo arquivos, chamadas de rede, banco) → ThreadPoolExecutor. CPU-bound (computação matemática, parsing, ML inference puro Python) → ProcessPoolExecutor. ProcessPoolExecutor tem overhead de serialização (pickle) para passar dados entre processos — objetos não-picklable (lambdas, closures locais) causam problemas.',
  },
  {
    question: 'O que o Python 3.13 mudou em relação ao GIL com a opção "free-threaded"?',
    options: [
      'Removeu o GIL completamente e de forma permanente',
      'Python 3.13 introduziu build experimental "free-threaded" (PEP 703) que pode ser habilitado com --disable-gil. Remove o GIL, permitindo paralelismo real de threads. O custo: código que assumia GIL como proteção implícita pode ter race conditions, e há overhead de 10-40% no modo single-threaded. Ainda experimental — não é o default.',
      'O GIL foi substituído por um lock mais eficiente mas ainda existe',
      'O GIL foi removido apenas para operações NumPy e Pandas',
    ],
    correct: 1,
    explanation: 'PEP 703 (Sam Gross, "nogil") foi aceito para Python 3.13 como feature experimental. O interpretador free-threaded usa fine-grained locking e reference counting atômico em vez do GIL. Benchmarks mostram 3-5x speedup em código CPU-bound multithreaded. O custo é regressão em single-thread e incompatibilidade com extensões C que assumem o GIL. A remoção permanente do GIL default está prevista para Python 3.16+ após período de transição.',
  },
];

export default function GilThreadsProcessosPage() {
  return (
    <ModuleLayout
      slug="gil-threads-processos"
      title="GIL, threading e multiprocessing: quando cada um"
      icon="🔀"
      xp={75}
      readTime={15}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="memoria-gc-python"
      nextTitle="Memória em Python: refcount, GC, __slots__, weakref"
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
        O GIL é a peça mais mal-compreendida do Python. Não é um bug — é uma decisão de design que simplifica o runtime às custas de paralelismo. Entender quando o GIL importa (e quando não importa) é o que permite escolher entre threading, multiprocessing e asyncio corretamente.
      </p>

      <Section accent={accent} title="O GIL: o que é e por que existe">
        <p>
          O <strong>Global Interpreter Lock (GIL)</strong> é um mutex no CPython que garante que apenas um thread execute bytecode Python por vez. Existe porque o gerenciamento de memória do CPython (contagem de referências) não é thread-safe — sem o GIL, dois threads poderiam corromper o contador de referências de um objeto simultaneamente.
        </p>
        <CodeBlock>{`# O GIL NÃO ajuda para CPU-bound:
import threading
import time

def contar_ate(n):
    i = 0
    while i < n:
        i += 1

# Sequencial
inicio = time.time()
contar_ate(50_000_000)
contar_ate(50_000_000)
print(f"Sequencial: {time.time()-inicio:.2f}s")   # ~4s

# Com 2 threads — NÃO é 2x mais rápido (GIL!)
inicio = time.time()
t1 = threading.Thread(target=contar_ate, args=(50_000_000,))
t2 = threading.Thread(target=contar_ate, args=(50_000_000,))
t1.start(); t2.start()
t1.join(); t2.join()
print(f"2 threads: {time.time()-inicio:.2f}s")    # ~4-5s (overhead!)

# O GIL libera para I/O e operações C:
import requests    # I/O libera o GIL

def buscar(url):
    return requests.get(url)

# Com threads — É mais rápido para I/O-bound:
urls = ["http://example.com"] * 10
inicio = time.time()
threads = [threading.Thread(target=buscar, args=(url,)) for url in urls]
for t in threads: t.start()
for t in threads: t.join()
print(f"10 requests paralelos: {time.time()-inicio:.2f}s")  # ~0.3s vs 3s sequencial`}</CodeBlock>
      </Section>

      <Section accent={accent} title="threading: quando e como usar">
        <CodeBlock>{`import threading
from concurrent.futures import ThreadPoolExecutor
import queue

# ThreadPoolExecutor — interface moderna (preferível a Thread diretamente)
def processar_url(url: str) -> str:
    import requests
    return requests.get(url).text[:100]

urls = ["http://example.com"] * 20

# submit — uma task por vez
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(processar_url, url) for url in urls]
    resultados = [f.result() for f in futures]

# map — equivalente mas sequência ordenada
with ThreadPoolExecutor(max_workers=10) as executor:
    resultados = list(executor.map(processar_url, urls, timeout=30))

# as_completed — processa resultados na ordem que terminam
from concurrent.futures import as_completed
with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_url = {executor.submit(processar_url, url): url for url in urls}
    for future in as_completed(future_to_url):
        url = future_to_url[future]
        try:
            resultado = future.result()
        except Exception as exc:
            print(f"{url} gerou exceção: {exc}")

# Thread-safe: usar Lock para dados compartilhados
contador = 0
lock = threading.Lock()

def incrementar():
    global contador
    with lock:
        contador += 1   # operação atômica com lock

# threading.local() — dados por-thread (sem compartilhamento)
local = threading.local()

def worker():
    local.id = threading.current_thread().ident
    print(f"thread {local.id}")`}</CodeBlock>
      </Section>

      <Section accent={accent} title="multiprocessing: paralelismo real de CPU">
        <CodeBlock>{`from concurrent.futures import ProcessPoolExecutor
import multiprocessing as mp

# CPU-bound que se beneficia de multiprocessing
def calcular_soma(n: int) -> int:
    return sum(i**2 for i in range(n))

numeros = [10_000_000] * 8   # 8 tarefas pesadas

# ProcessPoolExecutor — usa processos separados (não GIL!)
import os
n_cpus = os.cpu_count()    # número de CPUs lógicas
print(f"CPUs disponíveis: {n_cpus}")

with ProcessPoolExecutor(max_workers=n_cpus) as executor:
    resultados = list(executor.map(calcular_soma, numeros))

# ⚠️ Serialização — dados passam entre processos via pickle
# Funciona: int, float, str, list, dict, tuple
# NÃO funciona: lambda, closures locais, sockets abertos, locks

# Pool (multiprocessing diretamente) para controle fino
def worker(args):
    x, y = args
    return x ** y

with mp.Pool(processes=4) as pool:
    resultados = pool.map(worker, [(2, 10), (3, 8), (4, 6)])

# Shared memory — compartilhar dados sem pickle (Python 3.8+)
from multiprocessing import shared_memory
import numpy as np

# Criar array compartilhado:
shm = shared_memory.SharedMemory(create=True, size=1000 * 8)
array = np.ndarray((1000,), dtype=np.float64, buffer=shm.buf)
array[:] = range(1000)

# Outro processo pode acessar pelo nome:
# shm2 = shared_memory.SharedMemory(name=shm.name)
# array2 = np.ndarray((1000,), dtype=np.float64, buffer=shm2.buf)
shm.close()
shm.unlink()`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Comparação: quando usar cada modelo">
        <ComparisonTable
          headers={['Modelo', 'Melhor para', 'GIL libera?', 'Overhead', 'Dados compartilhados']}
          rows={[
            ['threading', 'I/O-bound concorrente', 'Para I/O e C', 'Baixo (~1MB/thread)', 'Shared memory (cuidado com race)'],
            ['asyncio', 'I/O-bound, muitas conexões', 'N/A (single thread)', 'Mínimo', 'Tudo compartilhado, cooperativo'],
            ['multiprocessing', 'CPU-bound paralelo', 'Não (processo separado)', 'Alto (fork + pickle)', 'Explícito (Queue, Pipe, SharedMemory)'],
            ['concurrent.futures', 'Interface unificada', 'Depende do executor', 'Depende', 'Depende do executor'],
            ['NumPy/Pandas multi-thread', 'Álgebra linear paralela', 'Sim (C extension)', 'Baixo', 'Shared memory via arrays'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Diagrama de decisão:
#
# Precisa de paralelismo?
#   ↓
# É I/O-bound? (rede, disco, banco)
#   ├── Sim + muitas conexões → asyncio (escala melhor)
#   └── Sim + código síncrono existente → ThreadPoolExecutor
#
# É CPU-bound? (cálculo, parsing, ML)
#   ├── Python puro → ProcessPoolExecutor
#   ├── NumPy/scikit-learn → threading (libera GIL internamente)
#   └── Precisa de máxima performance → Cython / numba / rust

# Padrão híbrido real — FastAPI com processamento heavy
import asyncio
from concurrent.futures import ProcessPoolExecutor

executor = ProcessPoolExecutor(max_workers=4)

async def endpoint_heavy(data):
    loop = asyncio.get_event_loop()
    # não bloqueia o event loop — roda em processo separado
    resultado = await loop.run_in_executor(executor, calcular_algo_pesado, data)
    return resultado`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regra de ouro:</strong> I/O-bound com código existente → <code>ThreadPoolExecutor</code>. I/O-bound com código novo → <code>asyncio</code>. CPU-bound Python → <code>ProcessPoolExecutor</code>. CPU-bound NumPy → <code>threads</code> (GIL liberado em C). O GIL deixa de importar quando você usa NumPy, pandas, scikit-learn — eles liberam o GIL em operações C.
      </Callout>

      <Callout>
        Próximo: <strong>Memória em Python</strong> — como refcount funciona, quando o GC entra, <code>__slots__</code> para economizar memória e <code>weakref</code> para evitar vazamentos.
      </Callout>
    </div>
  );
}
