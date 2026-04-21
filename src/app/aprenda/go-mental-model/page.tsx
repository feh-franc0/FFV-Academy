import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('go-mental-model');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Go omite features comuns como herança e generics históricos?',
    options: [
      'Esqueceram',
      'Decisão consciente: linguagem pequena tem menos formas de fazer a mesma coisa, leitura fica previsível e novos devs chegam à produtividade em dias — é o eixo de design explícito',
      'Para economizar binário',
      'Por compatibilidade com C',
    ],
    correct: 1,
    explanation: 'Go deliberadamente rejeita features que adicionam poder ao custo de variedade de estilo. O resultado é código que qualquer dev Go lê sem dicionário. Generics entraram em 1.18 somente quando havia caso de uso claro (funções de container). A filosofia "less is more" é estética e prática.',
  },
  {
    question: 'O que significa "share memory by communicating"?',
    options: [
      'Nada em particular',
      'Preferir channels (passagem de mensagem) a mutex — em vez de proteger dado compartilhado com lock, você transfere posse do dado por um channel e apenas um goroutine o acessa por vez',
      'Usar mais RAM',
      'Evitar goroutines',
    ],
    correct: 1,
    explanation: 'Frase de Rob Pike. Modelo CSP: dado viaja por channel, evitando lock contention. Na prática, mutex é válido para estrutura pequena (map de cache), e channel é melhor para pipelines e handoff de trabalho. Entender os dois evita dogmatismo — o livro é guia, não bíblia.',
  },
  {
    question: 'Qual a função do arquivo go.mod?',
    options: [
      'Documentação',
      'Declara o módulo (caminho canônico de import), a versão mínima de Go e as dependências com versões fixas — é o manifesto reprodutível que substituiu o GOPATH antigo',
      'Só um comentário',
      'Lista testes',
    ],
    correct: 1,
    explanation: 'go.mod + go.sum formam o sistema de módulos moderno (Go 1.11+, maduro em 1.17+). module define o path, require lista dependências, go.sum fixa hashes. GOPATH morreu em 2019 para código novo — fluxo atual é go mod init, go get, go build em qualquer diretório.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="go-mental-model"
      title="Go mental model: simplicity first"
      icon="🎯"
      xp={50}
      readTime={12}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="goroutines-channels"
      nextTitle="Goroutines e channels: concurrency model"
      quiz={quiz}
    >
      <Section title="Go é uma linguagem pequena de propósito" accent={accent}>
        <p>
          A spec de Go cabe em uma tarde. Não há herança, não há method overloading, não há generics complexos (os que existem são restritos), não há exceptions. Cada ausência foi decidida — a aposta é que código uniforme é mais produtivo em times grandes do que código expressivo em times pequenos.
        </p>
      </Section>

      <Section title="Hello Go idiomático" accent={accent}>
        <CodeBlock lang="go">{`package main

import (
    "fmt"
    "os"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Fprintln(os.Stderr, "uso: hello <nome>")
        os.Exit(1)
    }
    fmt.Printf("olá, %s\\n", os.Args[1])
}`}</CodeBlock>
        <p>Sem classe. Função main é entry. Import explícito. Erro tratado com early return. Esse estilo se estende para programas de 100 mil linhas.</p>
      </Section>

      <Section title="Módulos e layout" accent={accent}>
        <CodeBlock lang="bash">{`go mod init github.com/ffv/orders
# cria go.mod

# layout convencional
orders/
├── go.mod
├── go.sum
├── cmd/
│   └── orders/
│       └── main.go          # entry point
├── internal/                # privado ao módulo
│   ├── order/
│   │   ├── order.go
│   │   └── order_test.go
│   └── http/
│       └── handler.go
└── pkg/                     # exportável (opcional)
    └── pricing/
        └── pricing.go`}</CodeBlock>
        <Callout tone="info" icon="💡">
          internal/ é regra do compilador: pacotes dentro só podem ser importados pelo próprio módulo. Excelente para esconder detalhe e não poluir a API pública.
        </Callout>
      </Section>

      <Section title="Convenções que valem como regra" accent={accent}>
        <CodeBlock lang="go">{`// gofmt/goimports é obrigatório — roda no save
// Nomes curtos em escopo pequeno: i, ctx, err
// ExportedNames em CamelCase, unexported em camelCase
// Interfaces com sufixo -er: Reader, Writer, Closer
// Errors minúsculo: "file not found", não "File Not Found."
// Comment em todo Exported começa com o nome

// New cria um servidor configurado com timeouts padrão.
func NewServer(addr string) *Server { ... }`}</CodeBlock>
      </Section>

      <Section title="O que Go não tem (e por quê)" accent={accent}>
        <CodeBlock lang="go">{`// Sem classes → struct + funções/methods
// Sem herança → composition via embedding
// Sem exceptions → erros como valores
// Sem overloading → nome explícito (Dial vs DialContext)
// Sem ternário → if/else explícito
// Sem macros → gerar código com 'go generate' se precisar`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Quem chega de Java/C# sente falta das features. Resista à vontade de reintroduzir padrões de outras linguagens — o idiomático Go costuma ser mais direto quando você aceita a restrição.
        </Callout>
      </Section>

      <Section title="O que você leva desse módulo" accent={accent}>
        <Callout tone="success" icon="✅">
          Go aposta em simplicidade como feature. Módulos, gofmt, structure internal/ e convenção de nomes são a base. Os próximos módulos mostram como essa simplicidade escala em concorrência, erro e generics.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
