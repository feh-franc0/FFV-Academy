import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('threads-pthreads');
const accent = '#a8b1c0';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que `int contador++;` em múltiplas threads é bug?',
    options: [
      'Não é bug',
      '++ não é atômico: vira load/add/store em assembly. Duas threads podem ler o mesmo valor, incrementar, escrever o mesmo — perde uma. Isso é data race, UB em C11. Solução: mutex, ou _Atomic int, ou atomic_fetch_add',
      'Bug só em ARM',
      'É lento mas correto',
    ],
    correct: 1,
    explanation: 'Mesmo que ++ pareça uma operação, o processador executa 3 passos separados. Entre eles outra thread pode agir. Data race é UB em C11 — compilador pode reorder/otimizar assumindo acesso exclusivo. _Atomic int ou atomic_fetch_add(&x, 1) resolvem sem mutex.',
  },
  {
    question: 'Para que serve condition variable além de mutex?',
    options: [
      'Substitui mutex',
      'Permite dormir eficientemente esperando uma condição (ex: fila não-vazia) e ser acordado quando outra thread sinaliza (signal/broadcast). Evita busy-wait. Sempre usado em par com mutex que protege a condição e em loop (spurious wakeup)',
      'Só para logs',
      'Igual a semáforo',
    ],
    correct: 1,
    explanation: 'Padrão producer-consumer: consumer trava mutex, testa "fila vazia?" em while (não if — spurious wakeup), se vazia chama pthread_cond_wait que libera o mutex + dorme atomicamente. Producer trava, empilha, chama pthread_cond_signal. Sem cond var teria que pollar em busy-wait queimando CPU.',
  },
  {
    question: 'O que é thread-local storage e quando usar?',
    options: [
      'Variável privada igual local',
      'Storage por thread, visível em qualquer escopo dentro dela mas distinto entre threads. Em C11: thread_local int cache. Útil pra accumulators, buffers reutilizáveis, errno-like. Substitui globais em código que precisa ser thread-safe',
      'Sempre ruim',
      'Só em Windows',
    ],
    correct: 1,
    explanation: 'TLS resolve o problema de variáveis globais em código multi-thread: cada thread tem sua cópia. Ex: cada thread tem seu buffer de 64KB reutilizado em hot path sem alocar/free. errno no POSIX é thread-local por definição. Custo: pointer indirection implícita no acesso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="threads-pthreads"
      title="Threads: pthreads e C11 threads"
      icon="🧵"
      xp={60}
      readTime={14}
      trailName="C Moderno: Systems Programming"
      trailColor={accent}
      nextSlug="c-moderno-c23"
      nextTitle="C moderno: C11, C23, e o futuro"
      quiz={quiz}
    >
      <Section title="pthreads: POSIX, universal" accent={accent}>
        <p>
          pthreads é o padrão Unix para threads desde os anos 90. Roda em Linux, macOS, BSD, e via pthreads-win32 no Windows. API verbosa, mas estável.
        </p>
        <CodeBlock lang="c">{`#include <pthread.h>
#include <stdio.h>

void *worker(void *arg) {
    int id = *(int*)arg;
    printf("thread %d rodando\\n", id);
    return NULL;
}

int main(void) {
    pthread_t t[4];
    int ids[4] = {0,1,2,3};
    for (int i = 0; i < 4; i++)
        pthread_create(&t[i], NULL, worker, &ids[i]);
    for (int i = 0; i < 4; i++)
        pthread_join(t[i], NULL);
}`}</CodeBlock>
      </Section>

      <Section title="Mutex: acesso exclusivo" accent={accent}>
        <CodeBlock lang="c">{`pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;
int saldo = 0;

void *deposito(void *arg) {
    pthread_mutex_lock(&mtx);
    saldo += 100;
    pthread_mutex_unlock(&mtx);
    return NULL;
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Regra de ouro: trava e destrava no mesmo fluxo. Usar goto cleanup ou wrappers RAII-like evita esquecer unlock em branch de erro.
        </Callout>
      </Section>

      <Section title="Condition variable: espera eficiente" accent={accent}>
        <CodeBlock lang="c">{`pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cv = PTHREAD_COND_INITIALIZER;
int pronto = 0;

void *consumer(void *_) {
    pthread_mutex_lock(&mtx);
    while (!pronto) pthread_cond_wait(&cv, &mtx);  // libera+dorme
    // ... consome ...
    pthread_mutex_unlock(&mtx);
    return NULL;
}

void *producer(void *_) {
    pthread_mutex_lock(&mtx);
    pronto = 1;
    pthread_cond_signal(&cv);
    pthread_mutex_unlock(&mtx);
    return NULL;
}`}</CodeBlock>
      </Section>

      <Section title="Atomics C11: sem mutex para operações simples" accent={accent}>
        <CodeBlock lang="c">{`#include <stdatomic.h>

_Atomic int contador = 0;

void *worker(void *_) {
    for (int i = 0; i < 1000; i++)
        atomic_fetch_add(&contador, 1);
    return NULL;
}`}</CodeBlock>
        <p>
          <code>_Atomic</code> torna loads/stores atômicos e cria barreiras de memória por default (seq_cst). Para hot paths, variantes com <code>memory_order_relaxed</code> ou <code>acquire</code>/<code>release</code> reduzem custo.
        </p>
      </Section>

      <Section title="C11 threads: padrão, mas pouco suportado" accent={accent}>
        <p>
          C11 introduziu <code>&lt;threads.h&gt;</code> com API mais limpa (<code>thrd_create</code>, <code>mtx_t</code>, <code>cnd_t</code>). Problema: glibc só adicionou em 2018, Windows/macOS nunca implementaram direito. Na prática, código portátil ainda usa pthreads.
        </p>
      </Section>

      <Section title="Thread-local storage" accent={accent}>
        <CodeBlock lang="c">{`#include <threads.h>   // ou __thread em GCC

thread_local char buf[64 * 1024];

void hot_path(void) {
    // cada thread tem seu buf — sem malloc no hot loop
    format_response(buf, sizeof buf);
}`}</CodeBlock>
      </Section>

      <Section title="ThreadSanitizer" accent={accent}>
        <CodeBlock lang="bash">{`# Compila com TSan e roda suite de testes
clang -fsanitize=thread -g -O1 *.c -o tsan.bin
./tsan.bin`}</CodeBlock>
        <Callout tone="success" icon="✅">
          TSan detecta data race em runtime com shadow memory. Fundamental em código multi-thread novo — pega bugs que mutex mal-posicionado esconde em 99% das execuções.
        </Callout>
      </Section>

      <Section title="Receita pragmática" accent={accent}>
        <Callout tone="info" icon="💡">
          (1) Prefira atomic quando a operação é simples. (2) Use mutex + condition variable para filas/pipelines. (3) Minimize seções críticas. (4) Evite lock aninhado — fonte de deadlock. (5) TSan em CI obrigatório.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
