import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('interfaces-pequenas');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'O que significa "accept interfaces, return structs"?',
    options: [
      'Detalhe estético',
      'Funções recebem o menor contrato que usam (interface pequena) e retornam tipos concretos — consumidores podem mock ou substituir entrada, e saída mantém API rica sem quebrar evolução',
      'Só para APIs HTTP',
      'Nada relevante',
    ],
    correct: 1,
    explanation: 'Se você recebe io.Reader, qualquer tipo que tenha Read satisfaz: arquivo, bytes.Buffer, gzip.Reader, http.Response.Body. Se retornasse interface, forçaria o consumidor a lidar com menos métodos. A assimetria é intencional: entrada minimal, saída rica.',
  },
  {
    question: 'Por que Go tem interface implícita (structural) em vez de implements?',
    options: [
      'Descuido',
      'Para permitir adaptar tipos de pacotes externos a contratos seus sem wrapper — qualquer tipo que tenha os métodos já satisfaz a interface, o que evita acoplamento ao autor da interface',
      'Para rodar mais rápido',
      'Problema com C',
    ],
    correct: 1,
    explanation: 'Você define interface Closer em seu código. Qualquer tipo já existente com Close() error (os.File, sql.DB, http.Response.Body) satisfaz automaticamente. Em Java/C# você precisaria de implements declarado ou adapter. Structural duck typing é o que dá flexibilidade a Go.',
  },
  {
    question: 'Qual é o "wart" de interfaces em Go que o iniciante erra?',
    options: [
      'Sintaxe',
      'Comparar interface contendo ponteiro nil com nil: (var e error = (*MyErr)(nil); e == nil → false). A interface só é nil se nem tipo nem valor — devolva sempre nil explícito em caso de sucesso',
      'Nome',
      'Tamanho',
    ],
    correct: 1,
    explanation: 'Interface em Go é par (type, value). Se você atribui (*MyErr)(nil) a error, o tipo é *MyErr (não nil) e a comparação com nil falha. Bug clássico: retornar "err" de variável typed e o caller checar != nil achando que deu ruim. Sempre return nil diretamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="interfaces-pequenas"
      title="Interfaces pequenas + composition"
      icon="🧩"
      xp={50}
      readTime={12}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="error-handling-explicito"
      nextTitle="Error handling: explicit + errors.Is/As"
      quiz={quiz}
    >
      <Section title='"The bigger the interface, the weaker the abstraction"' accent={accent}>
        <p>
          Rob Pike resume Go numa frase. Interface grande fica impossível de satisfazer fora da implementação original. Interface pequena (1–3 métodos) é reaproveitável, testável e composável. A stdlib é exemplo permanente: io.Reader, io.Writer, io.Closer, fmt.Stringer, error — todos com uma ou duas operações.
        </p>
      </Section>

      <Section title="Interfaces da stdlib que valem memorizar" accent={accent}>
        <CodeBlock lang="go">{`type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }
type Closer interface { Close() error }
type Stringer interface { String() string }

// Composição por embedding
type ReadCloser interface {
    Reader
    Closer
}`}</CodeBlock>
      </Section>

      <Section title="Accept interfaces, return structs" accent={accent}>
        <CodeBlock lang="go">{`// Bom: recebe contrato mínimo, retorna tipo rico
func Copy(src io.Reader, dst io.Writer) (int64, error) { ... }

type Server struct { ... }
func NewServer(cfg Config) *Server { return &Server{...} }

// Ruim: obriga caller a satisfazer contrato grande pra chamar
func Copy(src LocalFileReader, dst LocalFileWriter) { ... }
// E: retornar interface empobrece API
func NewServer(cfg Config) ServerLike { ... }  // anti-padrão`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Ao retornar *Server, você expõe métodos concretos (Shutdown, SetTimeout). Se retornasse uma interface, cada método extra exigiria uma nova versão do contrato.
        </Callout>
      </Section>

      <Section title="Composition via embedding" accent={accent}>
        <CodeBlock lang="go">{`type Logger struct { level int }
func (l *Logger) Info(msg string)  { ... }
func (l *Logger) Error(msg string) { ... }

type Server struct {
    *Logger            // embed: métodos promovidos
    addr string
}

s := &Server{Logger: &Logger{level: 1}, addr: ":8080"}
s.Info("starting")     // chamada direta, sem delegação manual`}</CodeBlock>
      </Section>

      <Section title="Mock via interface pequena" accent={accent}>
        <CodeBlock lang="go">{`type UserStore interface {
    Get(ctx context.Context, id string) (User, error)
}

// Produção
type pgStore struct { db *sql.DB }
func (s *pgStore) Get(ctx context.Context, id string) (User, error) { ... }

// Teste
type fakeStore struct { users map[string]User }
func (f *fakeStore) Get(_ context.Context, id string) (User, error) {
    u, ok := f.users[id]
    if !ok { return User{}, ErrNotFound }
    return u, nil
}`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Uma interface de um método substitui toda a ginástica de mock framework. Teste fica rápido, claro e sem dependência externa.
        </Callout>
      </Section>

      <Section title="Armadilha: interface nil vs ponteiro nil" accent={accent}>
        <CodeBlock lang="go">{`var perr *MyError = nil
var err error = perr       // err tem (tipo=*MyError, valor=nil)
fmt.Println(err == nil)    // false! <<< bug

// Correto:
func op() error {
    if someCondition {
        return &MyError{...}
    }
    return nil              // nil explícito, não variável typed
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Esse é o tropeço número 1 de quem chega em Go. A regra segura: no sucesso, return nil literal. Nunca retorne variável de ponteiro typed supostamente nula.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
