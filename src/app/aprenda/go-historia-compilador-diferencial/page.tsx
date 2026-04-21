import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('go-historia-compilador-diferencial');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que DevOps tooling (Docker, Kubernetes, Terraform, Prometheus) convergiu para Go?',
    options: [
      'Porque foi moda no Google',
      'Go compila para binário estático sem dependências (um único executável que roda em qualquer Linux), tem goroutines baratíssimas para concorrência, cross-compile trivial (GOOS=linux GOARCH=arm64), e stdlib robusta em rede/HTTP/JSON. Esse conjunto casa perfeitamente com ferramentas de infra que precisam rodar em todo lugar, escalar IO e ser distribuídas como single binary',
      'Porque Go é a linguagem mais antiga para infra',
      'Porque Docker foi forçado a adotar Go',
    ],
    correct: 1,
    explanation: 'Três propriedades convergem: (1) static binary — sem runtime separado, sem libc dinâmica (com CGO_ENABLED=0), deploy é scp do binário; (2) goroutines com scheduler M:N — milhares de conexões concorrentes sem complexidade async/await; (3) cross-compile em uma flag — build Linux/macOS/Windows/ARM64 da mesma máquina. Docker (2013), Kubernetes (2014), Terraform (2014), Prometheus (2012) nasceram em Go pelos mesmos motivos. Hoje é o default de facto em infra.',
  },
  {
    question: 'Como o compilador Go transforma source em binário?',
    options: [
      'Go é interpretado como Python',
      'O compilador gc (compilador oficial Go, escrito em Go desde 1.5) faz lex → parse → typecheck → SSA IR → otimizações → asm → link. O resultado é binário estático com runtime embutido (scheduler de goroutines, GC concurrent, map, channels). Build é famoso pela velocidade — segundos mesmo em projetos grandes',
      'Usa LLVM como Rust e Swift',
      'Gera bytecode para uma VM',
    ],
    correct: 1,
    explanation: 'O toolchain Go é auto-hospedado (desde Go 1.5): compilador, linker e runtime escritos em Go. Pipeline: source → AST → typed AST → SSA (desde 1.7) → platform asm → object → linker produz executável com runtime embutido (~2MB overhead). Runtime traz scheduler M:N (M goroutines sobre N OS threads), GC concurrent tri-color mark-and-sweep, allocator com size classes, netpoller. Compilação rápida é design goal explícito — Go abdica de otimizações globais pesadas em troca de iteração rápida.',
  },
  {
    question: 'Qual versão de Go é a padrão realista em produção em 2026?',
    options: [
      'Go 1.0 ainda é o padrão',
      'Go 1.22+ é o padrão em 2026, com 1.24 como versão atual. Generics (1.18, 2022), loop variable scoping fix (1.22), range over func (1.23), PGO (profile-guided optimization) estável. Política oficial: duas últimas majors suportadas — então em 2026 você deve estar em 1.23 ou 1.24. Compatibilidade backward é sagrada desde o Go 1 compatibility promise',
      'Todo mundo usa Go 2',
      'Go 1.10 é o default',
    ],
    correct: 1,
    explanation: 'Cadência de Go: release a cada 6 meses, suporte para as duas últimas majors. Em 2026: Go 1.23 e 1.24 são as suportadas. Generics (1.18) foi a maior adição da história. Loop variable scoping em 1.22 (mudança semântica incomum, corrigiu bug comum de goroutines). PGO estável desde 1.21. A promise de compatibilidade do Go 1 (Pike, 2012) garante que código Go 1.0 ainda compila em 1.24 — filosofia oposta ao "move fast, break things" de ecossistemas JS.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="go-historia-compilador-diferencial"
      title="Go: história, compilador e diferencial 2026"
      icon="🐹"
      xp={50}
      readTime={12}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="go-mental-model"
      nextTitle="Go mental model: simplicity first"
      quiz={quiz}
    >
      <Section title="2007, Google: uma reação deliberada a C++ e Java" accent={accent}>
        <p>
          Go nasceu em <strong>2007</strong> dentro do Google, numa conversa entre <strong>Rob Pike</strong>, <strong>Ken Thompson</strong> (inventor de Unix e de B, predecessor de C) e <strong>Robert Griesemer</strong>. A motivação era frustração concreta: builds C++ que levavam 45 minutos, complexidade template hell, Java verboso e com startup lento. Eles queriam uma linguagem que combinasse a simplicidade de C, concorrência como cidadã de primeira classe (inspirada em CSP de Tony Hoare), e build em segundos mesmo em codebase enorme.
        </p>
        <p>
          Marcos: <strong>Go 1.0</strong> (março/2012, com a <em>Go 1 compatibility promise</em>: código escrito hoje continuará compilando em Go 1.x), <strong>1.5</strong> (2015, toolchain 100% em Go, fim da dependência de C), <strong>1.7</strong> (2016, SSA backend, ganho de perf), <strong>1.11</strong> (2018, Go modules — fim do GOPATH), <strong>1.18</strong> (2022, generics — maior adição desde 1.0), <strong>1.21</strong> (2023, PGO estável), <strong>1.22</strong> (2024, loop variable scoping fix), <strong>1.23</strong> (range over func), <strong>1.24</strong> (2025).
        </p>
      </Section>

      <Section title="Filosofia: simplicidade deliberada como feature" accent={accent}>
        <Callout tone="info" icon="🎯">
          <strong>Go rejeita complexidade de propósito.</strong> Menos de 25 keywords. Sem herança, sem generics até 2022 (adicionados com hesitação), sem exceptions, sem macros. Um formato único (<code>gofmt</code>) que mata debates de estilo. A premissa: grande parte do custo de software é manutenção, e código simples sobrevive melhor.
        </Callout>
        <p>
          Isso frustra quem vem de C++ ou Haskell — mas é a razão da produtividade em times grandes. Um engenheiro novo lê um codebase Go de um mês em um dia; o mesmo não vale para C++ moderno. A escolha é consciente e documentada por Pike em <em>Less is Exponentially More</em> (2012).
        </p>
      </Section>

      <Section title="Pipeline: do .go ao binário estático" accent={accent}>
        <CodeBlock lang="bash">{'# toolchain oficial (gc), escrito em Go desde 1.5\nmain.go\n  |-- parse       --> AST\n  |-- typecheck   --> typed AST\n  |-- SSA         --> SSA IR (desde Go 1.7)\n  |-- opt + gen   --> assembly especifico da arch (amd64, arm64, ...)\n  |-- link        --> binario estatico com runtime embutido\n\n# build e instantaneo mesmo em projetos grandes\ngo build -o app ./cmd/app           # ~segundos\nGOOS=linux GOARCH=arm64 go build    # cross-compile trivial\nCGO_ENABLED=0 go build              # binario totalmente static (sem libc)\n\n# runtime embutido no binario (~2MB overhead):\n#   - scheduler M:N (goroutines multiplexadas em OS threads)\n#   - GC concurrent tri-color mark-and-sweep (pause < 1ms tipico)\n#   - allocator com size classes (similar a tcmalloc)\n#   - netpoller (epoll Linux, kqueue BSD, IOCP Windows)'}</CodeBlock>
        <p>
          Compilador oficial é único (<code>gc</code>). Existe <code>gccgo</code> (GCC frontend, melhores otimizações, releases mais lentos) e <code>tinygo</code> (LLVM-based, para WASM e embedded). Em 2026, 99% do uso profissional é toolchain oficial.
        </p>
      </Section>

      <Section title="Versões que importam até 2026" accent={accent}>
        <CodeBlock lang="go">{'// Go 1.0 (2012): a base. Garantia de compatibilidade backward.\n\n// Go 1.5 (2015): toolchain 100% em Go (self-hosted)\n// Go 1.7 (2016): SSA backend, perf real\n\n// Go 1.11 (2018): Go modules (go.mod, go.sum) — fim do GOPATH\nmodule github.com/user/app\ngo 1.22\nrequire github.com/go-chi/chi/v5 v5.1.0\n\n// Go 1.13 (2019): errors.Is, errors.As, errors.Unwrap\nif errors.Is(err, sql.ErrNoRows) { ... }\n\n// Go 1.18 (2022): generics — maior adicao desde 1.0\nfunc Map[T, U any](s []T, f func(T) U) []U {\n    r := make([]U, len(s))\n    for i, v := range s { r[i] = f(v) }\n    return r\n}\n\n// Go 1.21 (2023): slices e maps packages, PGO estavel,\n//                 min/max/clear builtins\nn := max(a, b, c)\n\n// Go 1.22 (2024): loop variable scoping fix (semantica nova)\n// cada iteracao tem sua propria copia de i, v — bug classico de closures some\nfor _, v := range itens {\n    go func() { processar(v) }()  // agora captura o v correto\n}\n\n// Go 1.23 (2024): range over function (iteradores custom)\nfor v := range meuIterador { ... }\n\n// Go 1.24 (2025): melhorias de perf e tooling'}</CodeBlock>
      </Section>

      <Section title="Diferencial técnico: o que só Go entrega" accent={accent}>
        <p>
          Três atributos combinados: <strong>goroutines + channels</strong>, <strong>static binary</strong> e <strong>build speed</strong>.
        </p>
        <CodeBlock lang="go">{'// 1. Goroutines + channels (CSP de Tony Hoare aplicado)\n// goroutines tem stack inicial de 2KB (cresce dinamicamente)\n// scheduler multiplexa em OS threads (modelo M:N)\nfunc worker(jobs <-chan int, results chan<- int) {\n    for j := range jobs {\n        results <- j * 2\n    }\n}\n// milhares de goroutines sem esforco, sintaxe sincrona simples\n\n// 2. Context para cancellation (canonical)\nfunc Fetch(ctx context.Context, url string) error {\n    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)\n    _, err := http.DefaultClient.Do(req)\n    return err\n}\n\n// 3. Interfaces implicitas + composition\n// aceita interfaces, retorna structs; nada a declarar, a struct implementa\n// se tiver os metodos certos (duck typing estrutural verificado em compile-time)\ntype Reader interface { Read(p []byte) (n int, err error) }\n\n// 4. Build speed + static binary + cross-compile\n// "go build" gera single binary self-contained. Deploy = scp.'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Em 2026, Go é a linguagem default para DevOps/Platform: Docker, Kubernetes, containerd, Terraform, Prometheus, Grafana, etcd, Consul, Vault, Helm, Istio, ArgoCD, Caddy, Traefik, cilium, Tailscale, CockroachDB. Também forte em backend high-scale: Uber (tchannel), Cloudflare (workerd runtime em parte), Netflix (edge), Twitch (chat), Cloudflare Pingora (parte).
        </Callout>
      </Section>

      <Section title="Versão mais usada no mercado em 2026" accent={accent}>
        <Callout tone="neutral" icon="🧭">
          <strong>Go 1.22+</strong> é o padrão (política oficial: duas últimas majors suportadas = 1.23 e 1.24 em 2026). A compatibilidade backward do Go 1 promise facilita upgrades — a maioria dos projetos acompanha releases sem fricção. Generics de 1.18 já permearam as libs principais (slices, maps, samber/lo, sync.OnceValue). PGO em produção dá 2-15% de perf gratuita.
        </Callout>
        <p>
          Stack 2026: Go 1.24 + Go modules + <code>go workspaces</code> (monorepos). Framework web: stdlib + chi ou gin, fiber em uso crescente. ORM: sqlc (SQL → Go typado) ou GORM. CLI: cobra + viper. Testing: stdlib <code>testing</code> + <code>testify</code>. Container: imagem <code>FROM scratch</code> com binário estático (~10MB). Observability: OpenTelemetry Go SDK.
        </p>
      </Section>

      <Section title="O que esperar desta trilha" accent={accent}>
        <Callout tone="info" icon="🗺️">
          Próximos módulos: mental model Go (simplicity first), goroutines + channels, context para cancelation, interfaces pequenas + composition, error handling explícito, generics (1.18+), performance (pprof, escape analysis), e capstone de CLI + API Go idiomática.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
