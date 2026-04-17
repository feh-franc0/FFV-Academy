import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata: Metadata = {
  title: 'Threads vs processos vs fibras: modelo de concorrência — FFV Academy',
  description: 'O que diferencia um thread de um processo no SO, context switch, por que green threads existem, e como Go goroutines e Python asyncio resolvem diferente.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que os threads compartilham com o processo pai e o que é privado?',
    options: [
      'Threads compartilham tudo — são idênticos a processos em termos de memória',
      'Threads compartilham: espaço de endereçamento virtual (mesma memória), file descriptors, heap, segmento de código e dados globais. Cada thread tem privado: stack (execução), registradores da CPU (estado de execução), thread-local storage (TLS). Por compartilharem memória, comunicação é rápida (sem IPC) mas race conditions são possíveis — exige sincronização explícita.',
      'Threads não compartilham nada — são isolados como processos',
      'Threads compartilham apenas o código do programa, não a memória',
    ],
    correct: 1,
    explanation: 'Em Linux, threads são criados com clone(CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND) — compartilhando espaço de memória e file descriptors. Process = clone sem esses flags (fork). A estrutura task_struct do kernel representa ambos. `ps -eLf` lista todos os threads como tarefas separadas. `top -H` mostra threads individuais. Uma thread que corrompe memória afeta todos os outros threads do processo.',
  },
  {
    question: 'O que é context switch e quanto custa?',
    options: [
      'Context switch é apenas mudar o ponteiro de instrução — é instantâneo',
      'Context switch salva o estado completo da CPU atual (registradores, PC, stack pointer, flags) da task em execução e restaura o estado da próxima task. Custo: ~1-10 µs para troca pura + invalidação de TLB (se processo diferente) + cache pollution (nova task usa diferentes endereços). O SO faz context switch a cada ~1-10ms (timeslice) — 100-1000 switches/segundo.',
      'Context switch só acontece entre processos, não entre threads',
      'Context switch é feito pelo programa, não pelo kernel',
    ],
    correct: 1,
    explanation: 'Custo real do context switch: troca de thread no mesmo processo (~1-2µs — sem TLB flush porque mesma memória). Troca entre processos (~3-10µs — TLB flush, cache miss em memória do novo processo). Go goroutines usam user-space scheduling para minimizar context switches do kernel. asyncio elimina context switches — cooperativo single-threaded.',
  },
  {
    question: 'O que são goroutines e como diferem de threads do SO?',
    options: [
      'Goroutines são apenas threads normais com sintaxe Go especial',
      'Goroutines são green threads (M:N threading): N goroutines mapeadas para M threads do SO (M << N). O runtime Go faz scheduling em userspace — context switch entre goroutines é ~100 ns (vs ~1-10µs de kernel thread). Stack inicial de 2KB (vs ~8MB de kernel thread) — suporta milhões de goroutines. GOMAXPROCS controla M (threads do kernel usadas).',
      'Goroutines são processos leves do Linux sem stack',
      'Goroutines usam apenas 1 thread do SO independente de GOMAXPROCS',
    ],
    correct: 1,
    explanation: 'Go runtime implementa work-stealing scheduler: se um goroutine bloqueia em I/O, o runtime usa goroutines assíncronas (netpoller) internamente para não bloquear a thread do kernel. Similar: Erlang/Elixir processes (leves, isolados, message-passing). Fibras/corrotinas (async/await) são cooperativas — não preemptivas. Stackful coroutines (goroutines, Erlang) vs stackless coroutines (asyncio, async/await em Rust).',
  },
];

export default function ThreadsVsProcessosPage() {
  return (
    <ModuleLayout
      slug="threads-vs-processos"
      title="Threads vs processos vs fibras: modelo de concorrência"
      icon="🔀"
      xp={75}
      readTime={15}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="containers-namespaces-cgroups"
      nextTitle="Containers por baixo: namespaces e cgroups no Linux"
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
        Concorrência pode ser implementada de formas radicalmente diferentes: threads do SO, processos, goroutines e event loops. Cada modelo tem trade-offs de custo de criação, overhead de comunicação e complexidade de sincronização.
      </p>

      <Section accent={accent} title="Processo vs Thread: o que o kernel vê">
        <ComparisonTable
          headers={['Aspecto', 'Processo', 'Thread (mesm. processo)']}
          rows={[
            ['Memória', 'Espaço virtual próprio', 'Compartilhada com todos do processo'],
            ['File descriptors', 'Próprios (herdados no fork)', 'Compartilhados'],
            ['Criação (Linux)', 'fork() ~1ms', 'pthread_create() ~0.1ms'],
            ['Context switch', '3-10µs (TLB flush)', '1-2µs (mesma tabela de páginas)'],
            ['Comunicação', 'IPC (pipe, socket, shm)', 'Memória compartilhada direta'],
            ['Isolamento', 'Total — crash não afeta outros', 'Partial — crash mata todos os threads'],
            ['GIL Python', 'Não compartilhado (cada processo tem o seu)', 'Compartilhado (um thread por vez)'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Green threads e M:N threading">
        <CodeBlock>{`# Comparação de custo de criação e context switch:

import threading, time, asyncio

# Thread do SO — ~0.1ms para criar, ~1-2µs para context switch
def tarefa_thread():
    time.sleep(0.001)    # bloqueia thread

inicio = time.time()
threads = [threading.Thread(target=tarefa_thread) for _ in range(1000)]
for t in threads: t.start()
for t in threads: t.join()
print(f"1000 threads: {time.time()-inicio:.2f}s")   # ~1-2s de overhead

# Coroutine asyncio — ~0µs para criar, zero context switch de kernel
async def tarefa_async():
    await asyncio.sleep(0.001)    # cede controle, não bloqueia

async def main():
    inicio = time.time()
    await asyncio.gather(*[tarefa_async() for _ in range(10_000)])
    print(f"10000 coroutines: {time.time()-inicio:.2f}s")   # ~0.01s!

asyncio.run(main())

# Go goroutines (conceito — Python não tem equivalente nativo):
# go minha_funcao()   # cria goroutine com 2KB de stack
# São M:N: N goroutines mapeadas para M threads do OS
# runtime.GOMAXPROCS(4) = 4 threads do OS para N goroutines
# Go scheduler: work-stealing, preemptivo, cooperativo em I/O

# Erlang/Elixir processes (similar a goroutines mas com isolamento de memória):
# spawn(fn -> ... end)  # processo Erlang leve, ~300 bytes
# Comunicação por message passing — sem memória compartilhada
# Crash de um processo não afeta outros (fault isolation)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Escolhendo o modelo de concorrência">
        <CodeBlock>{`# DECISION TREE:
#
# Preciso de paralelismo CPU-bound?
#   └── Sim → multiprocessing.Process ou ProcessPoolExecutor
#              (cada processo tem seu GIL em Python)
#
# Preciso de I/O concorrente (muitas conexões/requests)?
#   ├── Código existente síncrono → ThreadPoolExecutor
#   └── Código novo → asyncio + httpx/aiohttp/asyncpg
#
# Muitas conexões leves (>1000)?
#   └── asyncio (event loop sobre epoll)
#
# Comunicação entre workers sem overhead de pickle/IPC?
#   └── threads (memória compartilhada) — cuidado com race conditions
#
# Isolamento de falhas crítico?
#   └── processos separados (crash de um não afeta outros)

# Python multiprocessing (processos reais):
from multiprocessing import Process

def worker(n):
    print(f"Worker {n}, PID: {os.getpid()}")
    # Memória isolada — crash aqui não afeta main

processos = [Process(target=worker, args=(i,)) for i in range(4)]
for p in processos: p.start()
for p in processos: p.join()

# Verificar threads de um processo (em Linux):
# ps -eLf | grep python
# cat /proc/$(pgrep python)/status | grep Threads`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Resumo prático:</strong> threads para I/O concorrente com código síncrono. asyncio para I/O concorrente com código novo. multiprocessing para paralelismo CPU real. Goroutines/Erlang processes para sistemas com muita concorrência leve e isolamento de falhas. O GIL Python torna threads inadequadas para CPU-bound — use multiprocessing.
      </Callout>

      <Callout>
        Próximo: <strong>Containers por baixo</strong> — namespaces e cgroups do Linux que o Docker usa.
      </Callout>
    </div>
  );
}
