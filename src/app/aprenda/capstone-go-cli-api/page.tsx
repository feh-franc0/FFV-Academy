import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-go-cli-api');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'O que compõe um "graceful shutdown" em serviço Go?',
    options: [
      'os.Exit(0)',
      'signal.NotifyContext para receber SIGTERM, http.Server.Shutdown passando ctx com deadline, esperar workers em sync.WaitGroup e fechar dependências (DB, kafka) em ordem reversa',
      'Só time.Sleep',
      'Matar com SIGKILL',
    ],
    correct: 1,
    explanation: 'k8s envia SIGTERM e espera grace period antes de SIGKILL. Um bom shutdown: 1) para de aceitar novas conexões (Shutdown para Serve), 2) aguarda requests em voo terminarem dentro do ctx, 3) fecha DB/queue/tracer, 4) retorna. Isso evita connection reset em produção e deadlock em rolling update.',
  },
  {
    question: 'Por que usar chi router em vez de mux padrão?',
    options: [
      'Nada técnico',
      'Suporte nativo a path params tipados, middleware chain composável e subrouter — API familiar a quem vem de Express/Fiber, sem adicionar reflection ou custo runtime mensurável',
      'Mais rápido em 10x',
      'É obrigatório',
    ],
    correct: 1,
    explanation: 'net/http mux cobre casos simples mas não faz routing com params (/users/{id}) ou chain de middleware ergonômica. chi é zero-dep, usa net/http nativo por baixo e adiciona ergonomia sem custo runtime significativo. gorilla/mux e gin são outras opções válidas.',
  },
  {
    question: 'Qual tamanho de imagem Docker mínimo para binário Go?',
    options: [
      'Distroless é o único',
      'FROM scratch com binário estático compilado com CGO_ENABLED=0 — resulta em ~10-20 MB total sem sistema operacional, reduzindo surface de ataque e cold start',
      '200 MB',
      'Alpine é mandatório',
    ],
    correct: 1,
    explanation: 'Binário Go estático roda em scratch. CGO_ENABLED=0 go build -ldflags="-s -w" gera executável self-contained. Dockerfile fica: FROM scratch; COPY bin; CMD. Precisa CA certs e /tmp? Use distroless/static (copia esses recursos). scratch é o mínimo absoluto, distroless é mais seguro na prática.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-go-cli-api"
      title="Capstone: CLI tool + API Go idiomática"
      icon="🏁"
      xp={85}
      readTime={18}
      trailName="Go Profissional"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construir um serviço de gerenciamento de links curtos (shortener): API REST + CLI administrativa no mesmo repo. API com chi router, Postgres, context em toda a stack, graceful shutdown, health/ready probes, métricas Prometheus. CLI em cobra que fala com a API. Dockerfile scratch, testes com Testcontainers, pprof habilitado.
        </p>
      </Section>

      <Section title="Layout" accent={accent}>
        <CodeBlock lang="bash">{`shorty/
├── go.mod
├── cmd/
│   ├── shorty/          # API server
│   │   └── main.go
│   └── shortyctl/       # CLI admin
│       └── main.go
├── internal/
│   ├── link/
│   │   ├── link.go       # domain
│   │   ├── service.go
│   │   ├── repo.go       # interface
│   │   └── pg_repo.go    # impl Postgres
│   ├── http/
│   │   ├── handler.go
│   │   └── middleware.go
│   └── config/
│       └── config.go
├── migrations/
│   └── 001_init.sql
├── Dockerfile
└── loadtest/
    └── bench.go`}</CodeBlock>
      </Section>

      <Section title="main.go com graceful shutdown" accent={accent}>
        <CodeBlock lang="go">{`func main() {
    cfg := config.Load()
    logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

    db, err := sql.Open("pgx", cfg.DatabaseURL)
    if err != nil { logger.Error("db open", "err", err); os.Exit(1) }
    defer db.Close()

    repo := link.NewPGRepo(db)
    svc  := link.NewService(repo)

    r := chi.NewRouter()
    r.Use(middleware.RequestID, middleware.Recoverer, httpmw.Logging(logger))
    r.Mount("/api/v1", httpapi.Routes(svc))
    r.Handle("/metrics", promhttp.Handler())
    r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(200) })

    srv := &http.Server{
        Addr: cfg.Addr, Handler: r,
        ReadHeaderTimeout: 5*time.Second,
        WriteTimeout:     10*time.Second,
    }

    ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
    defer stop()

    go func() {
        logger.Info("listening", "addr", cfg.Addr)
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            logger.Error("listen", "err", err)
        }
    }()

    <-ctx.Done()
    logger.Info("shutting down")
    shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
    defer cancel()
    if err := srv.Shutdown(shutdownCtx); err != nil {
        logger.Error("shutdown", "err", err)
    }
}`}</CodeBlock>
      </Section>

      <Section title="CLI com cobra" accent={accent}>
        <CodeBlock lang="go">{`var rootCmd = &cobra.Command{Use: "shortyctl"}

var createCmd = &cobra.Command{
    Use: "create <url>",
    Args: cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
        body, _ := json.Marshal(map[string]string{"url": args[0]})
        resp, err := http.Post(apiURL+"/api/v1/links", "application/json", bytes.NewReader(body))
        if err != nil { return err }
        defer resp.Body.Close()
        _, err = io.Copy(os.Stdout, resp.Body)
        return err
    },
}

func main() {
    rootCmd.AddCommand(createCmd)
    if err := rootCmd.Execute(); err != nil { os.Exit(1) }
}`}</CodeBlock>
      </Section>

      <Section title="Dockerfile scratch" accent={accent}>
        <CodeBlock lang="bash">{`FROM golang:1.23-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/shorty ./cmd/shorty

FROM gcr.io/distroless/static
COPY --from=build /out/shorty /shorty
EXPOSE 8080
ENTRYPOINT ["/shorty"]`}</CodeBlock>
      </Section>

      <Section title="Teste de integração com Testcontainers" accent={accent}>
        <CodeBlock lang="go">{`func TestCreateAndResolve(t *testing.T) {
    ctx := context.Background()
    pg, err := postgres.Run(ctx, "postgres:16-alpine")
    if err != nil { t.Fatal(err) }
    defer pg.Terminate(ctx)

    db := openAndMigrate(t, pg)
    repo := link.NewPGRepo(db)
    svc  := link.NewService(repo)

    l, err := svc.Create(ctx, "https://ffv.com")
    if err != nil { t.Fatal(err) }
    got, err := svc.Resolve(ctx, l.Code)
    if err != nil { t.Fatal(err) }
    if got.URL != "https://ffv.com" { t.Fatalf("got %s", got.URL) }
}`}</CodeBlock>
      </Section>

      <Section title="Entregáveis finais" accent={accent}>
        <Callout tone="success" icon="✅">
          Repo público com README explicando decisões (chi vs gin, pgx vs database/sql, scratch vs distroless). CI verde: go test -race, go vet, staticcheck, build container. Screenshot de pprof mostrando CPU profile saudável. Binário ~15 MB. Esse é o pacote que convence recrutador sênior de Go.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
