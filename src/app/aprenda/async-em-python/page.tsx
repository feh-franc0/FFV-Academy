import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('async-em-python');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "function coloring" e por que atrapalha em Python?',
    options: [
      'Bug só do Python',
      'Problema geral de async: funções async "contaminam" chamadores — só podem ser chamadas com await dentro de outra async. Sync não pode chamar async direto. Força duplicação (versão sync + async)',
      'Tema de theming',
      'Linter warning',
    ],
    correct: 1,
    explanation: 'Coloring é crítica clássica de async em linguagens (What Color is Your Function? — Bob Nystrom, 2015). Node/JS sofrem igual. Mitigação: asyncio.run() pra chamar async do sync, asyncio.to_thread pra rodar sync em thread pool. trio/anyio tentam resolver via structured concurrency.',
  },
  {
    question: 'O que acontece se você fizer operação SYNC bloqueante dentro de função async?',
    options: [
      'Nada — funciona',
      'Trava o event loop inteiro — nenhuma outra coroutine progride. Use `await asyncio.to_thread(sync_fn)` pra delegar ao thread pool',
      'Python crash',
      'Warning silencioso',
    ],
    correct: 1,
    explanation: '`time.sleep(5)` dentro de async função bloqueia o loop. `requests.get()` idem (use httpx async). Pra I/O legado sync: `await asyncio.to_thread(blocking_fn, args)`. Pra CPU-bound: ProcessPoolExecutor. Se você vê latência anormal em Node/Python async, procure call sync embutida.',
  },
  {
    question: 'Qual a diferença entre asyncio.gather e asyncio.as_completed?',
    options: [
      'Sinônimos',
      'gather() espera todas e retorna lista na mesma ordem; as_completed() é iterador que entrega resultados conforme completam (order não-determinística). Use gather se precisa de ordem; as_completed se quer começar processar quando primeiro retornar',
      'gather não existe',
      'as_completed é mais lento',
    ],
    correct: 1,
    explanation: 'gather(*coros): espera tudo, retorna lista ordenada. as_completed: gera iterator que yield conforme completion — útil pra streaming de resultados, early bail. Exceção em gather (com return_exceptions=False) cancela tudo; as_completed isola falhas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="async-em-python"
      title="Async em Python: asyncio, trio e trade-offs vs Node"
      icon="⏳"
      xp={55}
      readTime={13}
      trailName="Python para Engenheiros"
      trailColor={accent}
      nextSlug="fastapi-na-pratica"
      nextTitle="FastAPI na prática: routers, DI e auth"
      quiz={quiz}
    >
      <Section title="asyncio basics" accent={accent}>
        <CodeBlock lang="python">{`import asyncio
import httpx

async def fetch_user(id: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(f"/users/{id}")
        return r.json()

# Run (top-level)
async def main():
    # Sequential — ruim
    user_a = await fetch_user("a")
    user_b = await fetch_user("b")

    # Parallel — bom
    user_a, user_b = await asyncio.gather(
        fetch_user("a"),
        fetch_user("b"),
    )

asyncio.run(main())`}</CodeBlock>
      </Section>

      <Section title="Evitar operação sync no event loop" accent={accent}>
        <CodeBlock lang="python">{`# ❌ Trava o loop
async def bad():
    import time
    time.sleep(5)  # loop morto por 5s

# ✅ Cede controle
async def good():
    await asyncio.sleep(5)

# I/O legado sync:
async def with_legacy():
    result = await asyncio.to_thread(legacy_blocking_fn, arg)
    return result

# CPU-bound (processamento pesado):
from concurrent.futures import ProcessPoolExecutor
async def cpu_bound():
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, heavy_fn, arg)`}</CodeBlock>
      </Section>

      <Section title="Structured concurrency (trio, anyio)" accent={accent}>
        <CodeBlock lang="python">{`import anyio

# Task group — cancelamento estruturado
async def main():
    async with anyio.create_task_group() as tg:
        tg.start_soon(worker1)
        tg.start_soon(worker2)
    # Sai daqui APÓS ambos terminarem OU um falhar (cancelamento automático)

# anyio roda em cima de asyncio OU trio — backend-agnóstico
# Lib moderna (FastAPI usa anyio) prefere essa abordagem`}</CodeBlock>
        <Callout tone="info" icon="💡">
          trio popularizou structured concurrency (inspirou Swift async let). anyio unificou API pra escrever lib agnóstico do runtime. Em apps app, asyncio direto resolve; em libs, anyio.
        </Callout>
      </Section>

      <Section title="Comparação Node ↔ Python async" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Node</strong>: event loop embutido, todo I/O é async por default. Promise &lt;-&gt; async/await.</li>
          <li><strong>Python</strong>: loop explícito (asyncio.run). Biblioteca split entre sync e async versões (requests vs httpx.AsyncClient, psycopg vs asyncpg).</li>
          <li><strong>Overhead</strong>: Python async é mais lento que Node em request/s raw. Mas para FastAPI + pydantic + DB, diferença some em workloads reais.</li>
          <li><strong>GIL</strong>: I/O-bound libera GIL, paralelismo real. CPU-bound precisa de multiprocessing.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
