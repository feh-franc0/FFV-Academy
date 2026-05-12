import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-sistema-c');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual critério de "pronto" para um tool de sistema em C em portfolio?',
    options: [
      'Só funcionar',
      'Compila sem warnings (-Wall -Wextra -Werror), zero leaks/UB com ASan+UBSan em suite de testes, CMake portátil, cobertura de testes > 70%, man page + README com exemplos, benchmarks se aplicável, CI automatizado',
      'Ter mil linhas',
      'Ser em inglês',
    ],
    correct: 1,
    explanation: 'Critério portfolio: qualquer dev sênior deve conseguir clonar, buildar, testar, e entender em 10 minutos. Isso requer build system padrão (CMake), testes que rodam em CI, sanitizers clean, e documentação de uso. Tamanho não importa — 500 LOC bem feitos valem mais que 5000 caóticos.',
  },
  {
    question: 'Por que epoll é idiomático para servidor HTTP em Linux?',
    options: [
      'É o único jeito',
      'Escala para dezenas de milhares de conexões concorrentes em um só thread com edge-triggered IO, custo O(1) por evento (vs O(N) do select/poll). Padrão em nginx, Redis, Node libuv. kqueue é análogo em BSD/macOS',
      'É mais simples',
      'Obrigatório POSIX',
    ],
    correct: 1,
    explanation: 'epoll_ctl registra fd + evento; epoll_wait retorna só os fds prontos. Sem varredura de array como select. Com EPOLLET (edge-triggered) + non-blocking sockets, um thread gerencia 100k+ conexões. Trade-off: código mais complexo, state machines por fd. Compensação: throughput brutal.',
  },
  {
    question: 'Como estruturar allocator custom para ganhar perf vs malloc?',
    options: [
      'Não vale a pena',
      'Pool/arena allocator: pré-aloca blocos grandes, distribui chunks de tamanho fixo. Zero fragmentação, alloc/free O(1) sem syscall. Útil em hot path com lifetime batch (ex: parse de uma request, limpa tudo no fim). jemalloc/mimalloc como referência',
      'Substitua malloc sempre',
      'É legado',
    ],
    correct: 1,
    explanation: 'malloc é geral e sofre com fragmentação e locks em multi-thread. Arena: aloca 1MB de uma vez, serve pedaços, descarta tudo no fim. Perfeito para request-scoped em servidor HTTP. jemalloc (Facebook) e mimalloc (Microsoft) resolveram isso em geral; estudar seu código é aula de C avançado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-sistema-c"
      title="Capstone: tool de sistema em C"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Missão" accent={accent}>
        <p>
          Escolha um dos três projetos abaixo e entregue um repositório polido, com testes sob sanitizers, CMake portátil e documentação de uso. Menos de 2000 linhas de código é alvo razoável — se passar muito disso, você está fazendo demais.
        </p>
      </Section>

      <Section title="Opção A: servidor HTTP minimalista (epoll)" accent={accent}>
        <p>
          Implemente um servidor HTTP/1.1 que serve arquivos estáticos, usando <code>epoll</code> + non-blocking sockets em um único thread. Inspire-se em libuv/nginx mas simplifique.
        </p>
        <CodeBlock lang="c">{`// Estrutura central
typedef struct Conn {
    int fd;
    char buf[8192];
    size_t len;
    enum { READING, WRITING, CLOSING } state;
} Conn;

// Loop principal
int epfd = epoll_create1(0);
// registra listen_fd em EPOLLIN
// loop: epoll_wait, accept/read/write, dispatch por state`}</CodeBlock>
        <p>
          Requisitos: GET de arquivo, Content-Length correto, keep-alive, 404/500. Benchmark com <code>wrk -t4 -c1000 -d30s</code>. Alvo: 100k+ req/s em máquina simples.
        </p>
      </Section>

      <Section title="Opção B: arena allocator" accent={accent}>
        <CodeBlock lang="c">{`// API proposta
typedef struct Arena Arena;

Arena *arena_create(size_t chunk_size);
void  *arena_alloc(Arena *a, size_t bytes, size_t align);
void   arena_reset(Arena *a);   // devolve tudo sem free
void   arena_destroy(Arena *a);`}</CodeBlock>
        <p>
          Entregue: versão single-thread + versão thread-local. Benchmark contra <code>malloc/free</code> em padrão batch (alocar 10k structs, liberar tudo). Espera-se 5-10x mais rápido. Testes cobrem alinhamento (16, 32, 64 bytes), overflow de chunk, reset entre usos.
        </p>
      </Section>

      <Section title="Opção C: shell minimalista" accent={accent}>
        <p>
          REPL simples que lê linha, parsea, executa comando com <code>fork</code> + <code>execvp</code>. Suporte: pipes (<code>|</code>), redirects (<code>&gt;</code>, <code>&lt;</code>), variáveis de ambiente, <code>cd</code> built-in, controle de jobs básico.
        </p>
        <CodeBlock lang="c">{`// Pipeline cmd1 | cmd2
int fd[2];
pipe(fd);
if (fork() == 0) {
    dup2(fd[1], STDOUT_FILENO);
    close(fd[0]); close(fd[1]);
    execvp(argv1[0], argv1);
}
if (fork() == 0) {
    dup2(fd[0], STDIN_FILENO);
    close(fd[0]); close(fd[1]);
    execvp(argv2[0], argv2);
}
close(fd[0]); close(fd[1]);
wait(NULL); wait(NULL);`}</CodeBlock>
      </Section>

      <Section title="Entregáveis (todas as opções)" accent={accent}>
        <CodeBlock lang="bash">{`# Repo layout
.
├── CMakeLists.txt
├── README.md           # build, uso, decisões
├── docs/
│   └── design.md       # arquitetura, trade-offs
├── src/
│   ├── main.c
│   └── *.c             # módulos
├── include/
│   └── *.h
├── tests/
│   ├── CMakeLists.txt
│   └── test_*.c        # unity ou unit test custom
├── bench/
│   └── bench_*.c       # benchmarks (se aplicável)
└── .github/workflows/ci.yml`}</CodeBlock>
      </Section>

      <Section title="CI e qualidade" accent={accent}>
        <CodeBlock lang="yaml">{`# .github/workflows/ci.yml (fragmento)
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        sanitizer: [address, undefined, thread]
    steps:
      - uses: actions/checkout@v4
      - run: cmake -S . -B build -DSAN=\${'$'}{{ matrix.sanitizer }}
      - run: cmake --build build
      - run: ctest --test-dir build --output-on-failure`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Evidência de sênior: CI matriz rodando a suite com ASan, UBSan e TSan. Falha em qualquer um bloqueia merge. Documentado no README.
        </Callout>
      </Section>

      <Section title="Checklist de pronto" accent={accent}>
        <Callout tone="info" icon="💡">
          (1) <code>-Wall -Wextra -Wpedantic -Werror</code> sem silenciamento. (2) Todos os testes passam sob ASan+UBSan. (3) Sem <code>TODO</code>/<code>FIXME</code> no código entregue. (4) README com gif/screenshot. (5) Man page ou <code>--help</code> claro. (6) Benchmark com número real (se aplicável). (7) Tag v0.1.0 no git.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
