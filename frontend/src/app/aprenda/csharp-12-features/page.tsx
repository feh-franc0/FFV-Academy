import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('csharp-12-features');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'O que records resolvem em C#?',
    options: [
      'Só sintaxe',
      'Types imutáveis com value equality gerada automaticamente: ToString, Equals/GetHashCode, Deconstruct, with-expression. Ideais para DTOs, eventos, snapshots. Record struct (C# 10) tem variante por valor sem heap allocation',
      'Substituem class',
      'Só em Blazor',
    ],
    correct: 1,
    explanation: 'record Person(string Name, int Age); gera: ctor, properties init-only, Equals/GetHashCode baseados em valor, ToString legível, with-expression para "copy with mutation" (novo record com alguns campos alterados). Ideal para DTO de API, eventos event-sourced, entidades imutáveis. record struct evita heap pra objetos pequenos.',
  },
  {
    question: 'Qual vantagem de pattern matching exaustivo em switch expressions?',
    options: [
      'Só estético',
      'Compilador verifica que todos os casos foram cobertos e emite warning se faltar padrão; switch retorna valor (não statement); suporta property patterns, positional patterns, list patterns. Elimina boilerplate de if/else e reduz bugs',
      'Mais lento',
      'Só C# 13',
    ],
    correct: 1,
    explanation: 'switch expression (C# 8+) é expressão: return shape switch { Circle { Radius: var r } => Math.PI*r*r, Square s => s.Side*s.Side, _ => throw new() }. Compilador exige discard (_) ou exaustividade quando detecta. Property/positional/list patterns permitem desestruturar sem boilerplate.',
  },
  {
    question: 'Para que servem primary constructors em classes (C# 12)?',
    options: [
      'Só para records',
      'Declaram parâmetros no cabeçalho da classe disponíveis no corpo inteiro, sem escrever campos + ctor explícitos. Útil em classes com DI ou valores capturados. Valor fica como parâmetro acessível, não vira campo automaticamente (a menos que usado)',
      'Funcionam só em struct',
      'Obsoleto',
    ],
    correct: 1,
    explanation: 'public class Service(ILogger log, IRepo repo) { public void Run() => log.Info(repo.All()); } — log e repo são parâmetros do ctor primário, visíveis no corpo. Compilador gera campo escondido apenas se você capturar. Reduz boilerplate em serviços com DI — código fica próximo de records + Kotlin.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="csharp-12-features"
      title="C# 12+ features: records, pattern matching, primary ctors"
      icon="✨"
      xp={55}
      readTime={13}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="csharp-async-await"
      nextTitle="C# async/await rigoroso + ConfigureAwait"
      quiz={quiz}
    >
      <Section title="Records: DTO sem boilerplate" accent={accent}>
        <CodeBlock lang="csharp">{`public record Person(string Name, int Age);

var alice = new Person("Alice", 30);
var older = alice with { Age = 31 };   // novo record
Console.WriteLine(alice == older);      // False, value equality
Console.WriteLine(alice);               // Person { Name = Alice, Age = 30 }`}</CodeBlock>
        <p>
          <code>record struct</code> para casos onde heap allocation custa. <code>record class</code> é padrão. Ambos geram Equals/GetHashCode baseados em valor, Deconstruct, ToString.
        </p>
      </Section>

      <Section title="Pattern matching exaustivo" accent={accent}>
        <CodeBlock lang="csharp">{`public abstract record Shape;
public record Circle(double Radius) : Shape;
public record Rectangle(double W, double H) : Shape;
public record Triangle(double Base, double Height) : Shape;

double Area(Shape s) => s switch
{
    Circle { Radius: var r }      => Math.PI * r * r,
    Rectangle { W: var w, H: var h } => w * h,
    Triangle(var b, var h)        => 0.5 * b * h,
    _                              => throw new ArgumentException()
};`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Sealed hierarchy + switch expression sem discard pattern gera warning de não-exaustividade. Compilador vira aliado.
        </Callout>
      </Section>

      <Section title="Property patterns e list patterns" accent={accent}>
        <CodeBlock lang="csharp">{`string Classify(Order o) => o switch
{
    { Status: "paid", Total: > 1000 } => "VIP",
    { Status: "paid" }                 => "OK",
    { Status: "pending", CreatedAt: var t } when t < DateTime.UtcNow.AddDays(-7)
                                       => "Abandonado",
    _                                  => "Novo"
};

// list patterns (C# 11+)
int[] arr = { 1, 2, 3 };
bool match = arr is [1, _, > 2];   // true`}</CodeBlock>
      </Section>

      <Section title="Primary constructors em class" accent={accent}>
        <CodeBlock lang="csharp">{`public class OrderService(IOrderRepo repo, ILogger<OrderService> log)
{
    public async Task<Order?> GetAsync(int id)
    {
        log.LogDebug("Fetching order {Id}", id);
        return await repo.FindAsync(id);
    }
}`}</CodeBlock>
        <p>
          Equivalente ao idioma Kotlin de ctor no cabeçalho. Compilador captura em campos gerados apenas se usados no corpo — zero overhead desnecessário.
        </p>
      </Section>

      <Section title="Collection expressions (C# 12)" accent={accent}>
        <CodeBlock lang="csharp">{`int[] a = [1, 2, 3];
List<int> b = [1, 2, 3];
Span<int> c = [1, 2, 3];
ImmutableArray<int> d = [1, 2, 3];

// spread
int[] merged = [..a, ..b, 99];`}</CodeBlock>
      </Section>

      <Section title="Required properties" accent={accent}>
        <CodeBlock lang="csharp">{`public class User
{
    public required string Email { get; init; }
    public required string Name { get; init; }
    public int? Age { get; init; }
}

var u = new User { Email = "x@y", Name = "x" };   // Age opcional`}</CodeBlock>
        <p>
          <code>required</code> substitui ctor para init-only props e mantém object initializer legível. Compilador rejeita construção incompleta.
        </p>
      </Section>

      <Section title="File-scoped namespaces" accent={accent}>
        <CodeBlock lang="csharp">{`namespace MyApp.Services;

public class Foo { /* ... */ }
public class Bar { /* ... */ }`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Menos indentação, diff mais limpo. Padrão em C# 10+. Combine com <code>global using</code> (<code>global using System.Linq;</code> num arquivo <code>Usings.cs</code>) para remover imports repetitivos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
