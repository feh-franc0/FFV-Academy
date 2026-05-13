import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('goroutines-channels');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre channel unbuffered e buffered?',
    options: [
      'Nada',
      'Unbuffered sincroniza emissor e receptor (send bloqueia até alguém receber); buffered aceita N envios sem bloquear — use unbuffered para handoff, buffered para desacoplar produtor/consumidor',
      'Buffered é mais rápido',
      'Só buffered é seguro',
    ],
    correct: 1,
    explanation: 'Unbuffered é um rendezvous: emissor e receptor se encontram em tempo real. Buffered faz o papel de fila com capacidade N — útil quando picos curtos podem ser absorvidos sem bloquear. Escolha errada causa deadlock ou memória inchada.',
  },
  {
    question: 'O que o race detector detecta?',
    options: [
      'Uso de memória',
      'Acessos concorrentes ao mesmo endereço sem sincronização explícita (read+write ou write+write) — instrumenta o binário e reporta stack trace exato da corrida',
      'Goroutines lentas',
      'Deadlocks',
    ],
    correct: 1,
    explanation: 'go run -race e go test -race instrumentam o código. Qualquer corrida real dispara relatório com as duas goroutines envolvidas, endereço e stack. Overhead 2–10x — rode em CI e em staging, não em produção hot path. Sem race detector você está navegando às escuras.',
  },
  {
    question: 'Qual padrão usa select para timeout idiomático?',
    options: [
      'time.Sleep',
      'select com case result := <-ch e case <-time.After(d) ou case <-ctx.Done() — o primeiro dos três vence, implementando timeout/cancel sem thread extra',
      'goroutine de relógio',
      'runtime.Gosched',
    ],
    correct: 1,
    explanation: 'select escolhe o primeiro case pronto. Combinar leitura de canal com time.After ou ctx.Done é a forma canônica de timeout. time.After aloca timer novo cada chamada — em hot path, prefira time.NewTimer com Stop no defer.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="goroutines-channels"
      title="Goroutines e channels: concurrency model"
      icon="🔀"
      xp={60}
      readTime={14}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="context-cancelation"
      nextTitle="Context package: cancellation, timeout, values"
      quiz={quiz}
    >
      <Section title="Goroutine: thread barata do Go" accent={accent}>
        <p>
          Goroutine nasce com ~2 KB de stack e cresce sob demanda. O runtime Go escala M goroutines em N threads do SO (modelo M:N). Um processo Go segura milhões de goroutines em RAM moderada — esse é o superpoder do modelo.
        </p>
      </Section>

      <Section title="Channels em três sabores" accent={accent}>
        <CodeBlock lang="go">{`// Unbuffered: rendezvous
ch := make(chan int)
go func() { ch <- 42 }()   // bloqueia até alguém receber
v := <-ch                  // desbloqueia o sender

// Buffered: fila com capacidade
jobs := make(chan Job, 100)
jobs <- j                   // não bloqueia até encher

// Channel direcional em assinatura (melhora API)
func producer(out chan<- int) { out <- 1 }
func consumer(in <-chan int)  { v := <-in; _ = v }`}</CodeBlock>
      </Section>

      <Section title="select: o heart do Go concorrente" accent={accent}>
        <CodeBlock lang="go">{`func fetchWithTimeout(ctx context.Context, url string) (string, error) {
    result := make(chan string, 1)
    errCh  := make(chan error, 1)

    go func() {
        body, err := doFetch(url)
        if err != nil {
            errCh <- err
            return
        }
        result <- body
    }()

    select {
    case body := <-result:
        return body, nil
    case err := <-errCh:
        return "", err
    case <-ctx.Done():
        return "", ctx.Err()
    }
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Esse é o padrão canônico: goroutine worker escreve em channel buffered 1 (evita leak se ninguém ler), select aguarda primeiro evento, ctx.Done oferece cancelamento cooperativo.
        </Callout>
      </Section>

      <Section title="Fan-out / fan-in" accent={accent}>
        <CodeBlock lang="go">{`func fanOutFanIn(urls []string) []Result {
    jobs    := make(chan string, len(urls))
    results := make(chan Result, len(urls))

    const workers = 8
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for u := range jobs {
                results <- fetch(u)
            }
        }()
    }
    for _, u := range urls { jobs <- u }
    close(jobs)

    go func() { wg.Wait(); close(results) }()

    out := make([]Result, 0, len(urls))
    for r := range results { out = append(out, r) }
    return out
}`}</CodeBlock>
      </Section>

      <Section title="Armadilhas comuns" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          1) goroutine que nunca retorna = leak (cada URL acima poderia vazar se alguém não fechasse jobs). 2) Escrever em channel fechado = panic. 3) Ler de channel nil = bloqueia para sempre. 4) range sobre channel só termina com close. Disciplina de lifecycle é meio caminho.
        </Callout>
      </Section>

      <Section title="Race detector em CI" accent={accent}>
        <CodeBlock lang="bash">{`go test -race -count=1 ./...
# 2-10x mais lento, mas captura corridas escondidas
# rode sempre em PR, é o teste mais barato contra bug intermitente`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra prática: se o teste passa sem -race e falha com -race, você tem bug real. Corrija com mutex, channel ou atomic — nunca ignore.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
