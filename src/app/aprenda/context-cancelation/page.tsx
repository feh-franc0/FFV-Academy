import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('context-cancelation');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que context é primeiro argumento por convenção?',
    options: [
      'Estética',
      'Porque cancelamento, deadline e request-scoped values precisam propagar por toda a cadeia de chamadas — colocar em posição fixa facilita review, lint (govet) e evita esquecer',
      'Só para docs',
      'Questão histórica',
    ],
    correct: 1,
    explanation: 'Convenção é ctx context.Context como primeiro arg. govet avisa quando fora do padrão. A propagação não pode ser opcional — se um handler recebe ctx e chama DB sem passar ctx adiante, o cancelamento morre ali e a goroutine vaza.',
  },
  {
    question: 'O que context.WithValue deve ou não transportar?',
    options: [
      'Qualquer coisa',
      'Apenas dados request-scoped e pequenos (request-id, user-id autenticado) — não passe dependências nem parâmetros funcionais, isso esconde API e vira antipadrão',
      'Toda dependência',
      'Logger e config',
    ],
    correct: 1,
    explanation: 'Doc oficial: "request-scoped values only". Request-ID, trace-ID, user autenticado — sim. Repository, logger, HTTP client — não (passe explicitamente, fica testável e claro). Usar WithValue como service locator esconde acoplamento e torna teste difícil.',
  },
  {
    question: 'O que acontece se você não cancelar um ctx com WithCancel?',
    options: [
      'Nada',
      'O pai segue com filho vivo na árvore, consumindo struct e timer associado — vet/staticcheck alertam "cancel is never called"; sempre use defer cancel()',
      'GC resolve',
      'Só em produção vaza',
    ],
    correct: 1,
    explanation: 'WithCancel retorna (ctx, cancel). O cancel é obrigatório. Sem ele, a struct interna e o timer ficam na árvore até o pai morrer — em handler HTTP, isso é leak por request. Padrão: defer cancel() imediatamente após criar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="context-cancelation"
      title="Context package: cancellation, timeout, values"
      icon="⏱️"
      xp={55}
      readTime={13}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="interfaces-pequenas"
      nextTitle="Interfaces pequenas + composition"
      quiz={quiz}
    >
      <Section title="Por que context existe" accent={accent}>
        <p>
          Request distribuída precisa de três coisas: cancelamento propagado ("o cliente desistiu, pare"), deadline absoluto ("cut em 500 ms") e valores request-scoped (trace-id). context.Context é a estrutura canônica para carregar os três por toda a stack — handler, service, repository, driver.
        </p>
      </Section>

      <Section title="Construtores e lifecycle" accent={accent}>
        <CodeBlock lang="go">{`// Base
ctx := context.Background()       // root (main, test)
ctx  = context.TODO()             // placeholder em refactor

// Cancelamento manual
ctx, cancel := context.WithCancel(parent)
defer cancel()

// Deadline absoluto
ctx, cancel := context.WithDeadline(parent, time.Now().Add(500*time.Millisecond))
defer cancel()

// Timeout relativo (atalho para WithDeadline)
ctx, cancel := context.WithTimeout(parent, 500*time.Millisecond)
defer cancel()

// Values (request-id, trace-id, user autenticado — só isso)
type ctxKey string
const userKey ctxKey = "user"
ctx = context.WithValue(ctx, userKey, user)
u, _ := ctx.Value(userKey).(User)`}</CodeBlock>
      </Section>

      <Section title="Propagação correta" accent={accent}>
        <CodeBlock lang="go">{`func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()                      // herda cancel/deadline do servidor
    u, err := h.svc.Find(ctx, id)           // passa adiante
    if err != nil {
        if errors.Is(err, context.Canceled) { return }
        http.Error(w, err.Error(), 500); return
    }
    json.NewEncoder(w).Encode(u)
}

func (s *Service) Find(ctx context.Context, id string) (User, error) {
    return s.repo.Get(ctx, id)              // até o driver
}

func (r *Repo) Get(ctx context.Context, id string) (User, error) {
    // database/sql, redis e HTTP aceitam ctx
    return r.db.QueryRowContext(ctx, "select ..."), nil
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Toda lib séria (database/sql, net/http, grpc-go, redis clients) tem variante Context das operações. Usar as não-Context é sinônimo de ignorar cancelamento.
        </Callout>
      </Section>

      <Section title="Observando ctx.Done" accent={accent}>
        <CodeBlock lang="go">{`func work(ctx context.Context, ch <-chan Job) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()     // Canceled ou DeadlineExceeded
        case j, ok := <-ch:
            if !ok { return nil }
            process(ctx, j)
        }
    }
}`}</CodeBlock>
      </Section>

      <Section title="Goroutine leak por ctx esquecido" accent={accent}>
        <Callout tone="danger" icon="🚨">
          O padrão mais comum de leak em Go: goroutine que não escuta ctx.Done e fica esperando um channel que ninguém mais alimenta. Resultado: métrica go_goroutines sobe monotonicamente até OOM. Cheque sempre com pprof goroutine profile.
        </Callout>
      </Section>

      <Section title="Quando usar WithValue" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Só para request-scoped data (request-id, trace-id, user autenticado por middleware). Nunca para logger, repository ou config — esses vão por struct injetada. Se começar a usar WithValue para tudo, você reinventou service locator; teste fica pesado.
        </Callout>
      </Section>

      <Section title="Resumo operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          ctx primeiro arg, defer cancel sempre, propagação obrigatória até o driver, errors.Is(err, context.Canceled) para não gritar em log quando é cancelamento saudável. Disciplina simples, ganho enorme em estabilidade.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
