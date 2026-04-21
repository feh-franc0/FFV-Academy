import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('error-handling-explicito');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre errors.Is e errors.As?',
    options: [
      'Nenhuma',
      'Is compara valor (sentinel: err é esse erro conhecido?), As extrai tipo (é deste tipo? preenche a variável) — ambos atravessam wrap chain transparentemente',
      'As é mais rápido',
      'São sinônimos',
    ],
    correct: 1,
    explanation: 'Is: if errors.Is(err, sql.ErrNoRows) — compara com valor sentinel. As: var pe *os.PathError; if errors.As(err, &pe) — extrai tipo para inspecionar campos. Os dois funcionam mesmo com err embrulhado via %w, o que substitui hierarquia de exceptions.',
  },
  {
    question: 'Quando panic é apropriado em Go?',
    options: [
      'Em qualquer erro',
      'Em programmer error (nil pointer impossível, invariante violada em init, configuração ausente em boot) — não em falha de I/O, rede ou validação, que são valores de retorno',
      'Sempre',
      'Nunca',
    ],
    correct: 1,
    explanation: 'Panic é sinal para "estado impossível foi alcançado". Tipo: map nil passado para função que documentou não-nil, ou config obrigatória faltando no startup. Erro de negócio (user not found, timeout) devolve error. Regra: se recuperar faz sentido, é error; se é bug, é panic.',
  },
  {
    question: 'Como errors.Join (Go 1.20) é útil?',
    options: [
      'Não é',
      'Combina múltiplos erros em um só error que errors.Is/As atravessa — útil em shutdown que pode falhar em várias dependências simultaneamente, sem perder nenhum',
      'Só formata string',
      'Desabilita wrap',
    ],
    correct: 1,
    explanation: 'Ex: err := errors.Join(db.Close(), redis.Close(), tracer.Shutdown(ctx)). Se os três falharem, você devolve os três e errors.Is cada um individualmente continua funcionando. Antes disso era multiError customizado — agora stdlib resolve.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="error-handling-explicito"
      title="Error handling: explicit + errors.Is/As"
      icon="⚠️"
      xp={50}
      readTime={12}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="generics-go"
      nextTitle="Generics em Go (1.18+)"
      quiz={quiz}
    >
      <Section title="Erros são valores, não exceções" accent={accent}>
        <p>
          Go trata erro como tipo de retorno. Cada chamada que pode falhar retorna (resultado, error). A ausência de exceptions é decisão de design: o fluxo é linear, visível, e o compilador não deixa você esquecer de tratar. O "custo" é o famoso if err != nil — o benefício é controle total sobre comportamento de falha.
        </p>
      </Section>

      <Section title="Padrão base" accent={accent}>
        <CodeBlock lang="go">{`func loadConfig(path string) (Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return Config{}, fmt.Errorf("read config: %w", err)
    }
    var c Config
    if err := json.Unmarshal(data, &c); err != nil {
        return Config{}, fmt.Errorf("parse config: %w", err)
    }
    return c, nil
}`}</CodeBlock>
        <p>%w faz wrap (cadeia), %v só formata. Use %w sempre que quiser manter a cadeia inspecionável por errors.Is/As.</p>
      </Section>

      <Section title="Sentinel errors e tipos customizados" accent={accent}>
        <CodeBlock lang="go">{`// Sentinel: valor de erro conhecido, comparado por identidade
var ErrNotFound = errors.New("not found")

// Tipo: quando precisa de dados extras
type ValidationError struct {
    Field   string
    Message string
}
func (e *ValidationError) Error() string {
    return "invalid " + e.Field + ": " + e.Message
}`}</CodeBlock>
      </Section>

      <Section title="errors.Is e errors.As na prática" accent={accent}>
        <CodeBlock lang="go">{`row, err := db.QueryRowContext(ctx, q, id).Scan(&u.Name)
if err != nil {
    if errors.Is(err, sql.ErrNoRows) {
        return User{}, ErrNotFound
    }
    var pqErr *pq.Error
    if errors.As(err, &pqErr) && pqErr.Code == "23505" {
        return User{}, ErrDuplicate
    }
    return User{}, fmt.Errorf("scan user: %w", err)
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Is para comparar valor, As para inspecionar tipo e campos. Ambos caminham pela cadeia criada por %w — você não precisa desembrulhar manualmente.
        </Callout>
      </Section>

      <Section title="errors.Join (Go 1.20)" accent={accent}>
        <CodeBlock lang="go">{`func (a *App) Shutdown(ctx context.Context) error {
    return errors.Join(
        a.http.Shutdown(ctx),
        a.db.Close(),
        a.cache.Close(),
        a.tracer.Shutdown(ctx),
    )
}`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Antes você escrevia multiError custom em cada projeto. Hoje a stdlib resolve, e errors.Is continua atravessando cada um deles.
        </Callout>
      </Section>

      <Section title="panic/recover com cuidado" accent={accent}>
        <CodeBlock lang="go">{`// recover em middleware de HTTP protege servidor de panic em handler
func recoverMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if p := recover(); p != nil {
                slog.Error("panic", "val", p, "stack", string(debug.Stack()))
                http.Error(w, "internal", 500)
            }
        }()
        next.ServeHTTP(w, r)
    })
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          recover é aceitável em fronteira (servidor HTTP, worker pool). Dentro da lógica de domínio, trate erro como valor. Panic como fluxo normal é antipadrão e confunde leitor.
        </Callout>
      </Section>

      <Section title="Regra prática" accent={accent}>
        <Callout tone="success" icon="✅">
          Sentinel para erro sem dado. Tipo para erro com dado. %w sempre que embrulhar. errors.Is/As na comparação. panic só para bug. Esse conjunto escala de CLI até microsserviço sem surpresa.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
