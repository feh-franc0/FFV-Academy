import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata: Metadata = {
  title: 'asyncio explicado: event loop, coroutines, gather — FFV Academy',
  description: 'Como asyncio funciona por dentro. Event loop, coroutines, await, gather, TaskGroup, asyncio.run — e quando usar async vs threads vs multiprocessing.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que `asyncio.gather()` é muito mais eficiente que `await` sequencial para múltiplas chamadas de I/O?',
    options: [
      'gather() usa múltiplas threads internamente',
      'Com await sequencial, cada I/O aguarda o anterior terminar — tempo total = soma das latências. gather() agenda todas as coroutines concorrentemente: enquanto uma aguarda a rede, o event loop executa outra. Tempo total ≈ latência do mais lento (não a soma). Para 10 requests de 100ms: sequencial=1s, gather≈100ms.',
      'gather() faz cache das respostas automaticamente',
      'gather() só funciona com chamadas HTTP, não com outros tipos de I/O',
    ],
    correct: 1,
    explanation: 'asyncio é concorrência single-threaded via cooperative multitasking. O event loop executa uma coroutine por vez, mas quando ela faz `await` numa operação de I/O (rede, disco), o event loop passa para outra coroutine enquanto espera. gather() agenda N coroutines para rodar concorrentemente no mesmo thread — sem overhead de threading. O bottleneck é CPU, não I/O.',
  },
  {
    question: 'O que acontece se você chamar uma função síncrona bloqueante (ex: `time.sleep(5)`) dentro de uma coroutine async?',
    options: [
      'Python converte automaticamente para versão async',
      'Bloqueia o event loop inteiro por 5 segundos — nenhuma outra coroutine pode executar durante esse tempo. Para código CPU-bound ou chamadas síncronas bloqueantes, use asyncio.to_thread() (run in thread pool) ou loop.run_in_executor() — isso libera o event loop.',
      'Gera um erro imediatamente — sleep não funciona em async',
      'Funciona normalmente porque asyncio detecta bloqueio e cria thread',
    ],
    correct: 1,
    explanation: 'asyncio é single-threaded — se você bloqueia o thread, bloqueia tudo. `time.sleep(5)` vs `await asyncio.sleep(5)`: o primeiro bloqueia o evento loop, o segundo suspende a coroutine e libera o event loop para outras tarefas. Para chamar código síncrono bloqueante: `await asyncio.to_thread(funcao_sincrona, args)` — roda em thread pool e não bloqueia o event loop.',
  },
  {
    question: 'Qual a vantagem de `asyncio.TaskGroup` (Python 3.11+) sobre `asyncio.gather()`?',
    options: [
      'TaskGroup é mais rápido que gather()',
      'TaskGroup cancela automaticamente todas as tasks pendentes se qualquer uma falhar (fail-fast semantics), levanta ExceptionGroup com todos os erros, e garante que nenhuma task fica orphan. gather() com return_exceptions=False cancela as outras, mas o tratamento de erros é menos robusto. TaskGroup é o padrão moderno.',
      'TaskGroup suporta mais de 10 tasks simultâneas',
      'gather() não pode ser cancelado, TaskGroup pode',
    ],
    correct: 1,
    explanation: 'TaskGroup implementa "nursery" pattern (borrowado de Trio). Se qualquer task falha, as demais são canceladas imediatamente e um ExceptionGroup é levantado com todos os erros. gather() depende do parâmetro return_exceptions para controlar comportamento em falha. TaskGroup também garante que ao sair do bloco `async with`, todas as tasks estão concluídas — sem task leak.',
  },
];

export default function AsyncAsyncioPage() {
  return (
    <ModuleLayout
      slug="async-asyncio"
      title="asyncio explicado: event loop, coroutines, gather"
      icon="⚡"
      xp={85}
      readTime={17}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="gil-threads-processos"
      nextTitle="GIL, threading e multiprocessing: quando cada um"
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
        asyncio resolve o problema de I/O concorrente sem o overhead de threads. Entender o event loop — não apenas a sintaxe async/await — é o que separa quem escreve código async correto de quem escreve código sync com palavras-chave novas.
      </p>

      <Section accent={accent} title="O event loop: como asyncio funciona por dentro">
        <p>
          O event loop é um loop que gerencia uma fila de coroutines prontas para executar. Quando uma coroutine faz <code>await</code>, ela <em>suspende</em> e devolve o controle ao event loop. O event loop registra que quando a operação de I/O completar, deve resumir a coroutine. Enquanto isso, executa outra coroutine.
        </p>
        <CodeBlock>{`import asyncio

# async def define uma coroutine function
# chamar asyncio.run() cria o event loop e executa a coroutine
async def main():
    print("inicio")
    await asyncio.sleep(1)   # suspende, event loop pode rodar outros
    print("fim")             # retoma após 1s

asyncio.run(main())          # cria event loop, roda main, fecha

# O que asyncio.run() faz por baixo (simplificado):
# loop = asyncio.new_event_loop()
# try:
#     return loop.run_until_complete(main())
# finally:
#     loop.close()

# Coroutines são objetos — não executam ao ser chamadas
coro = main()           # NADA acontece — retorna coroutine object
# await coro            # SÓ assim executa

# await suspende a coroutine atual e agenda a coro esperada
async def buscar(url):
    print(f"buscando {url}")
    await asyncio.sleep(0.5)    # simula latência de rede
    return f"resposta de {url}"

async def main():
    # SEQUENCIAL — cada await espera o anterior
    r1 = await buscar("url1")   # 0.5s
    r2 = await buscar("url2")   # mais 0.5s = 1s total
    print(r1, r2)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="gather e TaskGroup: concorrência real">
        <CodeBlock>{`import asyncio
import httpx    # client HTTP async (pip install httpx)

# gather — executa coroutines concorrentemente
async def main():
    # CONCORRENTE — todas rodam ao mesmo tempo
    r1, r2, r3 = await asyncio.gather(
        buscar("url1"),
        buscar("url2"),
        buscar("url3"),
    )
    # tempo ≈ 0.5s (não 1.5s)

# TaskGroup (Python 3.11+) — padrão moderno
async def main_moderno():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(buscar("url1"))
        task2 = tg.create_task(buscar("url2"))
    # aqui todas as tasks terminaram (ou falharam com ExceptionGroup)
    print(task1.result(), task2.result())

# Exemplo real: buscar N URLs concorrentemente
async def buscar_multiplos(urls: list[str]) -> list[str]:
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        respostas = await asyncio.gather(*tasks)
        return [r.text for r in respostas]

# Limitando concorrência com Semaphore (evitar overload)
async def buscar_com_limite(urls: list[str], max_concorrente: int = 10):
    sem = asyncio.Semaphore(max_concorrente)

    async def buscar_limitado(url):
        async with sem:
            async with httpx.AsyncClient() as client:
                return await client.get(url)

    return await asyncio.gather(*[buscar_limitado(u) for u in urls])`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Tasks, cancelamento e timeouts">
        <CodeBlock>{`import asyncio

# Task — coroutine agendada para rodar concorrentemente
async def main():
    # create_task agenda a coroutine imediatamente
    task = asyncio.create_task(buscar("url"))
    print("task criada, ainda não terminou")
    resultado = await task    # aguarda completar
    return resultado

# Cancelamento
async def cancelavel():
    try:
        await asyncio.sleep(10)
    except asyncio.CancelledError:
        print("fui cancelado — posso fazer cleanup aqui")
        raise   # re-lançar é boa prática

async def main():
    task = asyncio.create_task(cancelavel())
    await asyncio.sleep(1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("task cancelada com sucesso")

# Timeout — asyncio.timeout (3.11+) ou wait_for (3.8+)
async def operacao_lenta():
    await asyncio.sleep(5)

# Moderno (3.11+):
async def com_timeout():
    try:
        async with asyncio.timeout(2.0):
            resultado = await operacao_lenta()
    except TimeoutError:
        print("operação excedeu 2s")

# Compatível (3.8+):
async def com_wait_for():
    try:
        resultado = await asyncio.wait_for(operacao_lenta(), timeout=2.0)
    except asyncio.TimeoutError:
        print("timeout!")`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Código bloqueante em async: to_thread">
        <ComparisonTable
          headers={['Situação', 'Problema', 'Solução']}
          rows={[
            ['time.sleep(n) em async', 'Bloqueia event loop', 'await asyncio.sleep(n)'],
            ['requests.get() em async', 'Bloqueia event loop', 'httpx.AsyncClient() ou to_thread'],
            ['Computação CPU-heavy em async', 'Bloqueia event loop', 'loop.run_in_executor (ProcessPool)'],
            ['Código sync de terceiros em async', 'Bloqueia event loop', 'await asyncio.to_thread(fn, args)'],
            ['open()/read() em async', 'Bloqueia event loop', 'aiofiles ou to_thread'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`import asyncio

# to_thread — roda função síncrona em thread pool (não bloqueia event loop)
def operacao_sincrona_pesada(n: int) -> int:
    import time
    time.sleep(2)    # bloqueante — mas roda em thread separada
    return n ** 2

async def main():
    # to_thread coloca a função síncrona em ThreadPoolExecutor
    resultado = await asyncio.to_thread(operacao_sincrona_pesada, 100)
    print(resultado)    # 10000 — depois de 2s sem bloquear event loop

# Para CPU-bound real — use ProcessPoolExecutor
async def cpu_bound():
    loop = asyncio.get_event_loop()
    from concurrent.futures import ProcessPoolExecutor
    with ProcessPoolExecutor() as pool:
        resultado = await loop.run_in_executor(pool, calcular_primos, 100_000)
    return resultado

# Padrão real — servidor async com múltiplos workers
async def processar_request(request):
    # I/O async — não bloqueia
    dados = await banco.fetch("SELECT ...")
    # Processamento síncrono pesado — não bloqueia event loop
    resultado = await asyncio.to_thread(transformar_dados, dados)
    return resultado`}</CodeBlock>
      </Section>

      <Section accent={accent} title="asyncio na prática: padrões comuns">
        <CodeBlock>{`import asyncio

# Queue — produtor/consumidor async
async def produtor(queue: asyncio.Queue):
    for i in range(10):
        await queue.put(i)
        await asyncio.sleep(0.1)    # simula produção lenta
    await queue.put(None)           # sentinel para parar consumidor

async def consumidor(queue: asyncio.Queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"consumindo: {item}")
        queue.task_done()

async def main():
    queue = asyncio.Queue(maxsize=5)    # back-pressure com maxsize
    await asyncio.gather(
        produtor(queue),
        consumidor(queue),
    )

# Event — sincronização entre coroutines
async def esperar_evento():
    evento = asyncio.Event()

    async def produtor():
        await asyncio.sleep(1)
        evento.set()            # notifica todos que aguardam

    async def consumidor(nome):
        await evento.wait()     # bloqueia até evento.set()
        print(f"{nome} recebeu evento")

    await asyncio.gather(
        produtor(),
        consumidor("A"),
        consumidor("B"),
    )

# Lock — exclusão mútua async
async def com_lock():
    lock = asyncio.Lock()
    contador = [0]

    async def incrementar():
        async with lock:
            v = contador[0]
            await asyncio.sleep(0)  # yield ao event loop
            contador[0] = v + 1

    await asyncio.gather(*[incrementar() for _ in range(100)])
    print(contador[0])  # 100 (sem race condition)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Quando usar async:</strong> I/O-bound com muitas operações concorrentes (servidores web, scrapers, clientes de API). <strong>Quando não usar:</strong> CPU-bound (use multiprocessing), scripts simples, código que usa apenas libs síncronas. FastAPI, aiohttp, SQLAlchemy async são os ecosistemas. Use <code>httpx</code> para HTTP, <code>aiofiles</code> para arquivos, <code>asyncpg</code> ou <code>SQLAlchemy async</code> para banco.
      </Callout>

      <Callout>
        Próximo: <strong>GIL, threading e multiprocessing</strong> — quando Python realmente roda em paralelo e quando o GIL impede isso.
      </Callout>
    </div>
  );
}
