import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#6e7681';

export const metadata: Metadata = {
  title: 'I/O bloqueante, não-bloqueante, async: select/poll/epoll — FFV Academy',
  description: 'Por que servidores web usam epoll em vez de um thread por conexão. Blocking vs non-blocking vs async I/O — o fundamento de event loops como asyncio e Node.js.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o modelo "um thread por conexão" não escala para 10.000 conexões simultâneas?',
    options: [
      'Threads são mais lentas que processes para I/O',
      'Cada thread consome ~1-8MB de stack + overhead de scheduling. 10.000 threads = 10-80GB de RAM apenas em stacks. Context switch entre threads tem custo (~1-10µs). O kernel gasta mais tempo fazendo scheduling do que trabalho real. epoll permite 1 thread monitorar 10.000 conexões simultâneas — só acorda quando uma tem dados, sem polling.',
      'O Linux suporta no máximo 100 threads por processo',
      'Threads não funcionam com I/O de rede, apenas com I/O de arquivo',
    ],
    correct: 1,
    explanation: 'O "C10K problem" (1999, Dan Kegel) articulou o problema de 10.000 conexões concorrentes. Apache usava processo/thread por conexão → inviável em escala. Nginx e Node.js usam event loop com epoll — chamados de "async" ou "non-blocking". asyncio Python, libuv (Node.js), Netty (Java) são event loops construídos sobre epoll (Linux), kqueue (BSD/macOS), IOCP (Windows).',
  },
  {
    question: 'Qual a diferença entre I/O não-bloqueante (O_NONBLOCK) e I/O assíncrono (io_uring/aio)?',
    options: [
      'São a mesma coisa com nomes diferentes',
      'I/O não-bloqueante: read() retorna EAGAIN imediatamente se não há dados — o processo precisa tentar de novo ou usar epoll para saber quando tentar. I/O assíncrono (io_uring): o processo submete a operação e continua — o kernel avisa quando completou via completion queue. Async real = zero tempo do processo esperando. epoll ainda exige que o processo chame read() depois do evento.',
      'I/O assíncrono só funciona para arquivos, não para sockets',
      'I/O não-bloqueante é mais rápido que I/O assíncrono',
    ],
    correct: 1,
    explanation: 'io_uring (Linux 5.1+, 2019) é a interface de I/O assíncrono moderna: submissão e completion em filas compartilhadas entre kernel e userspace, sem syscalls por operação. Usado por Tokio (Rust), io_uring Python bindings, PostgreSQL 15+. Performance: 2-3x mais throughput que epoll para I/O intensivo. Para arquivo: read() com O_NONBLOCK em arquivos locais nunca retorna EAGAIN — arquivos sempre "prontos" (diferente de sockets).',
  },
  {
    question: 'Como o asyncio Python usa epoll internamente?',
    options: [
      'asyncio não usa epoll — usa threads para simular async',
      'asyncio.get_event_loop() cria um DefaultEventLoop que usa epoll no Linux. Quando você `await asyncio.open_connection()`, o socket é registrado no epoll com EPOLLIN. O event loop chama epoll_wait() — bloqueia até algum socket ter evento. Quando epoll_wait() retorna, o loop processa os callbacks das coroutines esperando aqueles sockets. O thread não fica bloqueado em I/O — fica no epoll_wait.',
      'asyncio usa select() que é equivalente ao epoll',
      'asyncio cria um thread por coroutine para simular concorrência',
    ],
    correct: 1,
    explanation: 'asyncio.BaseEventLoop._run_once() chama self._selector.select(timeout) que mapeia para epoll_wait(). Quando um fd fica pronto (dados disponíveis), asyncio encontra o callback registrado e o agenda. `await asyncio.sleep(n)` registra um timer no event loop — não usa epoll, mas usa a mesma infraestrutura de callbacks. O loop é single-threaded: um asyncio.Task por vez, mas multiplexação de I/O eficiente.',
  },
];

export default function IoBlocanteNaoBlocanttePage() {
  return (
    <ModuleLayout
      slug="io-bloqueante-nao-bloqueante"
      title="I/O bloqueante, não-bloqueante, async: select/poll/epoll"
      icon="⚡"
      xp={85}
      readTime={17}
      trailName="Como o Computador Funciona"
      trailColor="#6e7681"
      nextSlug="threads-vs-processos"
      nextTitle="Threads vs processos vs fibras: modelo de concorrência"
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
        O problema de servidores que precisam lidar com milhares de conexões simultâneas se resolve entendendo os modelos de I/O: bloqueante, não-bloqueante, e multiplexação com epoll. É o fundamento de asyncio, Node.js e Nginx.
      </p>

      <Section accent={accent} title="Os modelos de I/O: evolução histórica">
        <ComparisonTable
          headers={['Modelo', 'Como funciona', 'Throughput', 'Complexidade']}
          rows={[
            ['Bloqueante', 'read() espera até ter dados', 'Baixo (1 thread bloqueada)', 'Simples'],
            ['1 Thread/conexão', 'Thread bloqueada por conexão', 'Moderado (até ~1000)', 'Moderada'],
            ['select()', 'Monitora N fds, max 1024', 'Moderado', 'Moderada'],
            ['poll()', 'Igual select, sem limite de 1024', 'Moderado', 'Moderada'],
            ['epoll()', 'Event-driven, escala O(1)', 'Alto (10k+ conexões)', 'Moderada'],
            ['io_uring', 'Zero-copy async I/O real', 'Muito alto', 'Alta'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Bloqueante vs não-bloqueante: a diferença fundamental">
        <CodeBlock>{`import socket
import os

# I/O BLOQUEANTE (padrão):
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(("example.com", 80))
sock.send(b"GET / HTTP/1.0\r\n\r\n")
dados = sock.recv(4096)   # BLOQUEIA até receber dados — thread fica parada
sock.close()

# I/O NÃO-BLOQUEANTE:
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setblocking(False)    # ou os.O_NONBLOCK
sock.connect_ex(("example.com", 80))   # connect_ex não lança exceção

try:
    dados = sock.recv(4096)   # retorna imediatamente com dados ou...
except BlockingIOError:        # ...levanta se não há dados ainda
    print("sem dados ainda, tente depois")

# Problema: como saber quando tentar de novo?
# Solução: epoll monitora quando o fd ficou pronto`}</CodeBlock>
      </Section>

      <Section accent={accent} title="epoll: multiplexação de I/O eficiente">
        <CodeBlock>{`import select
import socket

# select() — funciona em qualquer SO mas tem limitações:
# - max 1024 fds no Linux (FD_SETSIZE)
# - O(n) para verificar quais fds ficaram prontos
# - tem que repassar toda a lista a cada chamada

# epoll() — Linux, O(1), sem limite prático
# selectors.EpollSelector encapsula epoll para Python

import selectors

seletor = selectors.DefaultSelector()    # usa epoll no Linux, kqueue no macOS

def aceitar(sock, mascara):
    conn, addr = sock.accept()
    conn.setblocking(False)
    seletor.register(conn, selectors.EVENT_READ, ler)

def ler(conn, mascara):
    dados = conn.recv(1024)
    if dados:
        conn.send(dados)    # echo
    else:
        seletor.unregister(conn)
        conn.close()

servidor = socket.socket()
servidor.bind(("", 8080))
servidor.listen()
servidor.setblocking(False)
seletor.register(servidor, selectors.EVENT_READ, aceitar)

# Event loop simples (o que asyncio faz internamente):
while True:
    eventos = seletor.select(timeout=None)   # epoll_wait — bloqueia até evento
    for chave, mascara in eventos:
        callback = chave.data
        callback(chave.fileobj, mascara)     # chama aceitar() ou ler()`}</CodeBlock>
      </Section>

      <Section accent={accent} title="asyncio internamente: event loop + epoll">
        <CodeBlock>{`import asyncio

# asyncio abstrai o event loop + epoll em coroutines
async def handle_client(reader, writer):
    while True:
        data = await reader.read(1024)    # asyncio registra socket no epoll
        # Event loop faz epoll_wait() enquanto await está pendente
        # Outras coroutines rodam enquanto isso
        if not data:
            break
        writer.write(data)
        await writer.drain()
    writer.close()

async def main():
    server = await asyncio.start_server(handle_client, "0.0.0.0", 8080)
    async with server:
        await server.serve_forever()

asyncio.run(main())

# Como verificar que asyncio usa epoll:
import asyncio
loop = asyncio.new_event_loop()
print(type(loop._selector))   # <class 'selectors.EpollSelector'>

# Exemplo real com httpx async (10k requests simultâneos):
import asyncio, httpx

async def buscar(client, url):
    return await client.get(url)

async def main():
    urls = ["http://example.com"] * 100
    async with httpx.AsyncClient() as client:
        # 100 requests simultâneos — apenas 1 thread, 1 epoll
        respostas = await asyncio.gather(*[buscar(client, u) for u in urls])
    print(f"{len(respostas)} respostas recebidas")`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> bloqueante = thread parada esperando. epoll = thread acordada só quando há trabalho. asyncio/Node.js = event loop em cima de epoll. Para I/O-bound com muitas conexões: async/event loop escala melhor que threads. io_uring é o futuro — zero-copy async I/O que o Tokio (Rust) e futuras versões do Python usarão amplamente.
      </Callout>

      <Callout>
        Próximo: <strong>Threads vs processos</strong> — modelos de concorrência no SO e como linguagens modernos os aproveitam.
      </Callout>
    </div>
  );
}
