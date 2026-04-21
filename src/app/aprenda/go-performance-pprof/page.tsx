import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('go-performance-pprof');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'O que escape analysis determina?',
    options: [
      'Tamanho do binário',
      'Se uma variável pode ficar na stack (barata) ou precisa ir para a heap (GC) — decisão do compilador baseada em se o endereço "escapa" para fora da função',
      'Race conditions',
      'Versões de CPU',
    ],
    correct: 1,
    explanation: 'Stack é barata: cresce/encolhe sem GC. Heap exige alocação, GC scan, eventual pause. Escape analysis roda em compile-time; go build -gcflags="-m" mostra exatamente o que escapa. Reduzir escapes = menos alocação = menos trabalho para o GC.',
  },
  {
    question: 'Como pprof é habilitado em serviço web?',
    options: [
      'Com flag no GC',
      'Importando net/http/pprof (registra handlers em /debug/pprof/) atrás de mux interno e coletando com go tool pprof http://host/debug/pprof/profile',
      'Só em debug build',
      'Via terceiros',
    ],
    correct: 1,
    explanation: 'import _ "net/http/pprof" registra automaticamente rotas de CPU, heap, goroutine, block e mutex profiles. Exponha essa mux em porta management separada, nunca pública. Depois: go tool pprof -http=:9000 http://prod/debug/pprof/profile?seconds=30 abre UI web de flamegraph.',
  },
  {
    question: 'Quando sync.Pool vale a pena?',
    options: [
      'Sempre',
      'Em objetos criados e descartados em alta frequência dentro do mesmo tipo de operação (buffers, parsers, encoders) — reduz pressão no GC em hot path; para objetos raros, é apenas complicação',
      'Só em main',
      'Nunca',
    ],
    correct: 1,
    explanation: 'sync.Pool é cache de objetos reutilizáveis por goroutine. Útil em bufio.NewWriter, gzip.NewReader, json.Encoder reutilizáveis. O trade-off: complexidade de Reset() e risco de compartilhar estado. Se seu profile mostra alocações altas do mesmo tipo, é candidato; senão, ignore.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="go-performance-pprof"
      title="Go performance: pprof + escape analysis"
      icon="⚡"
      xp={55}
      readTime={13}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="capstone-go-cli-api"
      nextTitle="Capstone: CLI tool + API Go idiomática"
      quiz={quiz}
    >
      <Section title="Ferramentas built-in são surpreendentemente boas" accent={accent}>
        <p>
          pprof, benchmark (testing.B), race detector, trace, escape analysis, flight-style tracing — tudo vem no binário do go. Você não precisa de APM pago para diagnosticar 90% dos gargalos. Basta saber ler o output.
        </p>
      </Section>

      <Section title="Benchmark no testing.B" accent={accent}>
        <CodeBlock lang="go">{`func BenchmarkParseJSON(b *testing.B) {
    data := []byte(sample)
    b.ReportAllocs()
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        var u User
        if err := json.Unmarshal(data, &u); err != nil {
            b.Fatal(err)
        }
    }
}

// go test -bench=. -benchmem
// BenchmarkParseJSON-8   500000   3120 ns/op   512 B/op   7 allocs/op`}</CodeBlock>
        <p>B/op e allocs/op são mais reveladores que ns/op. Alocação domina custo em serviços de alto throughput.</p>
      </Section>

      <Section title="Escape analysis" accent={accent}>
        <CodeBlock lang="go">{`// go build -gcflags="-m=2" ./...
func makeUser(name string) *User {
    u := User{Name: name}
    return &u          // "moved to heap: u" (escapa via return)
}

func usesUser(name string) int {
    u := User{Name: name}
    return len(u.Name) // "u does not escape" → stack
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Interfaces fazem escape (valor precisa ir para heap para caber no par tipo/valor). Passar slice por valor copia header (barato), passar struct grande por valor copia tudo — use ponteiro em struct &gt; 64 bytes.
        </Callout>
      </Section>

      <Section title="pprof: CPU profile" accent={accent}>
        <CodeBlock lang="go">{`// Em main.go
import _ "net/http/pprof"

go func() {
    log.Println(http.ListenAndServe("127.0.0.1:6060", nil))
}()`}</CodeBlock>
        <CodeBlock lang="bash">{`# Coletar 30s de CPU profile em produção
go tool pprof -http=:9000 http://prod:6060/debug/pprof/profile?seconds=30

# Heap live
go tool pprof -http=:9000 http://prod:6060/debug/pprof/heap

# Goroutines (detectar leak)
curl http://prod:6060/debug/pprof/goroutine?debug=1 | less`}</CodeBlock>
      </Section>

      <Section title="sync.Pool no caminho certo" accent={accent}>
        <CodeBlock lang="go">{`var bufPool = sync.Pool{
    New: func() any { return new(bytes.Buffer) },
}

func writeResponse(w io.Writer, v any) error {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufPool.Put(buf)
    }()
    if err := json.NewEncoder(buf).Encode(v); err != nil {
        return err
    }
    _, err := buf.WriteTo(w)
    return err
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Pool esquece objetos entre GC runs — não conte com identidade. Reset obrigatório no Put, senão vaza estado entre requests.
        </Callout>
      </Section>

      <Section title="sync/atomic para contadores lock-free" accent={accent}>
        <CodeBlock lang="go">{`type Metrics struct {
    Requests atomic.Int64
    Errors   atomic.Int64
}

m.Requests.Add(1)
r := m.Requests.Load()`}</CodeBlock>
      </Section>

      <Section title="Fluxo real de otimização" accent={accent}>
        <Callout tone="success" icon="✅">
          1) Meça com benchmark ou pprof em staging. 2) Leia o flamegraph, encontre top CPU/alocação. 3) Corrija o hot path (reduzir escape, pool, atomic, evitar interface em loop). 4) Re-benchmark. Sem medir, você adivinha — e geralmente erra.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
