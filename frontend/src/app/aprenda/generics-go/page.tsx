import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('generics-go');
const accent = '#0891b2';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Go demorou a adicionar generics?',
    options: [
      'Preguiça',
      'Equipe queria uma solução que combinasse com a filosofia minimalista — design passou por anos de propostas rejeitadas até 1.18 entregar type parameters simples com constraint sets via interface',
      'Faltava equipe',
      'Problema com CGO',
    ],
    correct: 1,
    explanation: 'Go rejeitou dezenas de propostas ao longo de 10+ anos porque cada uma adicionava complexidade significativa. 1.18 entregou type parameters com constraints via interface — sintaxe mínima, zero monomorphization visível. A lentidão foi recusa deliberada de importar C++ templates ou Java generics.',
  },
  {
    question: 'O que o constraint comparable permite?',
    options: [
      'Nada',
      'Restringir o type parameter a tipos que suportam == e != — habilita funções genéricas sobre map keys, Equal, Contains, sem precisar passar função de comparação',
      'Ordenar',
      'Serializar',
    ],
    correct: 1,
    explanation: 'Ex: func Contains[T comparable](s []T, v T) bool. Funciona para string, int, struct com campos comparáveis. Não funciona para slices, maps, functions — que não têm == em Go. Para ordenação (<) existe o constraint cmp.Ordered do pacote cmp (Go 1.21).',
  },
  {
    question: 'Quando generics são exagero em Go?',
    options: [
      'Nunca',
      'Quando o uso é específico de um tipo concreto — reescrever tudo em generics torna o código mais abstrato sem ganho; use generics só quando há duplicação real entre tipos',
      'Em funções curtas',
      'Em métodos',
    ],
    correct: 1,
    explanation: 'Generics brilham em containers (slice helpers, set, queue), funções de map/filter/reduce e cache type-safe. Se você tem uma função que só trabalha com User, deixe concreta. A filosofia Go continua: use generics para resolver duplicação, não para parecer moderno.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="generics-go"
      title="Generics em Go (1.18+)"
      icon="📐"
      xp={55}
      readTime={13}
      trailName="Go Profissional"
      trailColor={accent}
      nextSlug="go-performance-pprof"
      nextTitle="Go performance: pprof + escape analysis"
      quiz={quiz}
    >
      <Section title="Generics chegaram em 1.18 com sintaxe enxuta" accent={accent}>
        <p>
          Type parameters entram entre colchetes após o nome da função ou tipo. Constraints são interfaces que listam tipos ou métodos permitidos. Em 1.21 entrou slices, maps e cmp na stdlib, com operações genéricas prontas. Em 2026 o uso maduro é: container e utilitários genéricos, código de domínio concreto.
        </p>
      </Section>

      <Section title="Primeiros exemplos" accent={accent}>
        <CodeBlock lang="go">{`func Map[T, U any](s []T, f func(T) U) []U {
    out := make([]U, len(s))
    for i, v := range s {
        out[i] = f(v)
    }
    return out
}

doubled := Map([]int{1, 2, 3}, func(n int) int { return n * 2 })
names   := Map(users, func(u User) string { return u.Name })`}</CodeBlock>
      </Section>

      <Section title="Constraints" accent={accent}>
        <CodeBlock lang="go">{`// any é alias de interface{}
func Reduce[T, A any](s []T, init A, f func(A, T) A) A { ... }

// comparable habilita == e !=
func Contains[T comparable](s []T, v T) bool {
    for _, x := range s {
        if x == v { return true }
    }
    return false
}

// Constraint custom com union de tipos (Go 1.18+)
type Numeric interface {
    ~int | ~int32 | ~int64 | ~float32 | ~float64
}
func Sum[T Numeric](s []T) T {
    var total T
    for _, v := range s { total += v }
    return total
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          O ~ permite tipos derivados: type Money int64 ainda satisfaz ~int64. Sem ~ aceitaria apenas o tipo exato.
        </Callout>
      </Section>

      <Section title="Pacotes slices, maps e cmp (1.21+)" accent={accent}>
        <CodeBlock lang="go">{`import (
    "cmp"
    "slices"
    "maps"
)

s := []int{3, 1, 4, 1, 5}
slices.Sort(s)                       // ordena in place
i, ok := slices.BinarySearch(s, 4)   // busca binária
s = slices.Compact(s)                // remove duplicados consecutivos

m := map[string]int{"a": 1, "b": 2}
keys := slices.Sorted(maps.Keys(m))  // keys ordenadas

type User struct{ Name string; Age int }
slices.SortFunc(users, func(a, b User) int {
    return cmp.Compare(a.Age, b.Age)
})`}</CodeBlock>
      </Section>

      <Section title="Quando usar, quando não usar" accent={accent}>
        <Callout tone="success" icon="✅">
          Use: container genérico (queue, set, LRU), helpers de slice/map, funções matemáticas, cache tipado. Stdlib do 1.21+ resolve a maior parte sem precisar escrever seu próprio.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          Evite: transformar toda função utility em generic só por hábito de outra linguagem. Se o tipo está fixo (User, Order), concreto é mais legível. Se a abstração "funciona pra qualquer T" é real, aí generics valem.
        </Callout>
      </Section>

      <Section title="Performance" accent={accent}>
        <p>
          Go não faz monomorphization completa como C++/Rust. Usa mistura de dictionary passing e gcshape stenciling — um pouco mais lento que monomorphization em micro benchmark, mas quase imperceptível em código real. Se perf importa num hot path, benchmark sempre.
        </p>
      </Section>
    </ModuleLayout>
  );
}
