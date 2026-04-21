import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('csharp-historia-compilador-diferencial');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que C# é lembrado como pioneiro em async/await e como isso influenciou outras linguagens?',
    options: [
      'Porque inventou callbacks',
      'C# 5 (2012) introduziu async/await como feature de linguagem integrada ao compilador, com transformação em state machine e Task-based Async Pattern — esse modelo foi copiado por TypeScript, JavaScript (ES2017), Python (PEP 492), Rust, Swift e Kotlin. A sintaxe async Task<T> + await viraram padrão de fato para IO assíncrono moderno',
      'Porque é a linguagem mais antiga do mundo',
      'Porque C# sempre teve GIL como Python',
    ],
    correct: 1,
    explanation: 'Anders Hejlsberg e o time de C# pegaram o padrão TPL (Task Parallel Library, 2010) e elevaram await à linguagem em 2012, gerando automaticamente uma state machine que preserva o fluxo sequencial do código. JavaScript, Python, Rust, Swift e Kotlin copiaram a abordagem quase literalmente. É um dos maiores legados de design de linguagem do século — e por isso C# async é maduro: ConfigureAwait, ValueTask, IAsyncEnumerable, CancellationToken.',
  },
  {
    question: 'Como o pipeline de compilação .NET funciona em 2026?',
    options: [
      'C# é interpretado linha a linha',
      'Roslyn (compilador C# open-source em C#) gera IL (Intermediate Language) e metadata empacotados em assembly .dll/.exe. Em runtime, o CoreCLR JIT (RyuJIT) compila IL para código nativo sob demanda. Desde .NET 7 há Native AOT: compila tudo em build-time para binário nativo sem JIT, ideal para cold start e serverless',
      'Compila direto para assembly x86',
      'Usa a JVM como runtime',
    ],
    correct: 1,
    explanation: 'O fluxo tradicional é C# → Roslyn → IL → CoreCLR JIT (RyuJIT) → asm em runtime, com GC gerational, reflection e metadata ricos. Native AOT (estável em .NET 8) muda o jogo: AOT em build-time, binário self-contained, startup instantâneo, footprint menor — troca-se flexibilidade de reflection por performance de edge/serverless. ReadyToRun é meio-termo: pré-JIT para reduzir cold start sem perder dinamismo.',
  },
  {
    question: 'Qual é o padrão realista de produção .NET em 2026?',
    options: [
      '.NET Framework 4.x ainda é default',
      '.NET 8 LTS é o padrão em produção enterprise (suporte até nov/2026), com .NET 9 STS entrando em greenfield e .NET 10 LTS previsto para nov/2025. C# 12 (primary constructors, collection expressions) e C# 13 são as versões modernas. .NET Framework 4.x sobrevive em legado Windows, mas todo investimento novo é .NET Core/.NET moderno',
      '.NET 5 é LTS',
      'Todo mundo usa Mono em produção',
    ],
    correct: 1,
    explanation: 'A Microsoft unificou a plataforma em .NET 5 (2020) e abandonou .NET Framework. O ciclo LTS é a cada 2 anos (mesmo cadence do Node): .NET 6 LTS, 8 LTS, 10 LTS. STS (Short-Term Support) no meio. Em 2026, .NET 8 é o default estável em produção. C# 12 trouxe primary constructors e collection expressions — mudam a ergonomia do dia a dia. .NET Framework 4.8.x recebe só security fixes.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="csharp-historia-compilador-diferencial"
      title="C# e .NET: história, CLR e por que bate produtividade em 2026"
      icon="🔷"
      xp={50}
      readTime={12}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="csharp-12-features"
      nextTitle="C# 12+ features: records, pattern matching, primary ctors"
      quiz={quiz}
    >
      <Section title="2000, Anders Hejlsberg, e a resposta da Microsoft ao Java" accent={accent}>
        <p>
          C# nasceu em <strong>2000</strong> dentro da Microsoft, liderado por <strong>Anders Hejlsberg</strong> — o mesmo designer de Turbo Pascal e Delphi — como parte da iniciativa .NET Framework. A motivação era direta: a Microsoft precisava de resposta ao boom do Java sem depender da Sun, e queria uma linguagem moderna, fortemente tipada, com interop nativa com Windows e COM.
        </p>
        <p>
          Marcos marcantes: <strong>C# 1.0</strong> (2002, .NET Framework 1.0), <strong>C# 2</strong> (2005, generics reais — não type erasure como Java), <strong>C# 3</strong> (2007, LINQ e expression trees, mudou a forma de pensar coleções), <strong>C# 5</strong> (2012, async/await pioneiro), <strong>C# 6-7</strong> (expression-bodied, tuples, pattern matching básico), <strong>C# 8</strong> (2019, nullable reference types), <strong>C# 10-11</strong> (file-scoped namespaces, raw strings), <strong>C# 12</strong> (2023, primary constructors, collection expressions), <strong>C# 13</strong> (2024, params collections). Hejlsberg depois criou TypeScript — e você reconhece ecos de C# em cada decisão de design do TS.
        </p>
      </Section>

      <Section title=".NET Framework → .NET Core → .NET unificado" accent={accent}>
        <Callout tone="info" icon="🎯">
          <strong>2016–2020 foi o divisor de águas.</strong> .NET Core nasceu open-source, cross-platform (Linux, macOS, Windows), e em .NET 5 (2020) a Microsoft fundiu tudo em uma única plataforma: apenas <strong>.NET</strong> (sem "Core" ou "Framework"). .NET Framework 4.8.x continua só para legado Windows.
        </Callout>
        <p>
          Ciclo de releases hoje: LTS a cada 2 anos (3 anos de suporte), STS no meio (18 meses). Em 2026: <strong>.NET 8 LTS</strong> é o padrão em produção, <strong>.NET 9 STS</strong> roda em early-adopters, <strong>.NET 10 LTS</strong> (nov/2025) entra como próximo default enterprise.
        </p>
      </Section>

      <Section title="Como o .cs vira binário em 2026" accent={accent}>
        <CodeBlock lang="bash">{'# pipeline tradicional (JIT em runtime)\nProgram.cs\n  |-- Roslyn (csc)  --> IL + metadata (empacotados em .dll/.exe PE)\n  |-- [deploy]      --> app.dll\n  |-- CoreCLR + RyuJIT em runtime --> codigo nativo sob demanda\n         + GC generational (gen 0/1/2 + LOH + POH)\n         + tiered compilation (quick JIT -> optimized JIT)\n\n# pipeline Native AOT (desde .NET 7, estavel no 8)\ndotnet publish -c Release -r linux-x64 --aot\n  |-- Roslyn --> IL\n  |-- ILCompiler --> binario nativo self-contained (~10-30MB)\n  |-- zero JIT em runtime, zero reflection dinamica\n  |-- ideal pra Lambda, containers slim, CLIs'}</CodeBlock>
        <p>
          <strong>Roslyn</strong> é o compilador oficial desde 2015 — open-source, escrito em C#, expõe APIs de análise para linters (Roslyn Analyzers), refactorings e source generators. <strong>RyuJIT</strong> é o JIT atual com tiered compilation. <strong>Native AOT</strong> + <strong>ReadyToRun</strong> atacam o problema histórico de cold start do .NET.
        </p>
      </Section>

      <Section title="Versões que importam até 2026" accent={accent}>
        <CodeBlock lang="csharp">{'// C# 1-2: base + generics reais (2005). Diferencial vs Java (type erasure).\n\n// C# 3 (2007): LINQ e expression trees\nvar pares = nums.Where(n => n % 2 == 0).Select(n => n * n).ToList();\n\n// C# 5 (2012): async/await pioneiro\nasync Task<string> FetchAsync(string url) {\n    var resp = await http.GetStringAsync(url);\n    return resp;\n}\n\n// C# 8 (2019): nullable reference types\nstring? nome = null;   // explicitamente nullable\nstring nome2 = "ok";   // nunca null (compilador garante)\n\n// C# 9 (2020): records (immutable value semantics)\npublic record Usuario(string Nome, int Idade);\n\n// C# 10 (2021): file-scoped namespace, global usings\nnamespace App;   // sem chaves, afeta arquivo inteiro\n\n// C# 11 (2022): raw string literals, required members\nvar json = """{ "nome": "Ana" }""";\n\n// C# 12 (2023): primary constructors, collection expressions\npublic class Servico(ILogger log, IConfig cfg) {\n    public void Run() => log.Info(cfg.Url);\n}\nint[] numeros = [1, 2, 3, 4];   // collection expression\n\n// C# 13 (2024): params collections, lock object type-safe'}</CodeBlock>
      </Section>

      <Section title="Diferencial técnico: o que só C#/.NET entrega" accent={accent}>
        <p>
          Três eixos combinados: <strong>produtividade enterprise</strong>, <strong>async first-class</strong> e <strong>span de ecossistema</strong>.
        </p>
        <CodeBlock lang="csharp">{'// 1. async/await maduro (12+ anos de polish)\npublic async IAsyncEnumerable<Pedido> StreamPedidosAsync(\n    [EnumeratorCancellation] CancellationToken ct) {\n    await foreach (var row in db.Query(ct).ConfigureAwait(false)) {\n        yield return Map(row);\n    }\n}\n\n// 2. LINQ (expression trees + composable queries)\n// A mesma sintaxe vai pra in-memory (IEnumerable) ou SQL (IQueryable)\nvar q = db.Usuarios\n    .Where(u => u.Ativo && u.Idade > 18)\n    .OrderBy(u => u.Nome)\n    .Take(50);\n\n// 3. Span<T> e Memory<T>: zero-alloc slices em perf-critical\nSpan<byte> buf = stackalloc byte[256];\nReadOnlySpan<char> slice = texto.AsSpan(0, 10);\n// usado em System.Text.Json, pipelines de rede, parsers'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Em 2026, C#/.NET é escolha forte em: enterprise backend (bancos, seguradoras, governo), ASP.NET Core Minimal APIs (um dos frameworks web mais rápidos em benchmarks TechEmpower), Unity game dev (scripting padrão), Blazor (SPA em C# via WebAssembly), MAUI (mobile/desktop cross-platform), e integrações Azure (SDK first-party). Stack Overflow Survey 2025 colocou .NET entre frameworks mais amados.
        </Callout>
      </Section>

      <Section title="Versão mais usada no mercado em 2026" accent={accent}>
        <Callout tone="neutral" icon="🧭">
          <strong>.NET 8 LTS com C# 12</strong> é o padrão absoluto em produção enterprise. Greenfield e early-adopters rodam .NET 9 STS. <strong>.NET 10 LTS</strong> (nov/2025) entra como próximo default. Legacy em .NET Framework 4.8.x existe, mas recebe apenas security fixes — migração é o caminho. Em cold start crítico (serverless, CLI), Native AOT vira sério competidor de Go.
        </Callout>
        <p>
          Ferramental 2026: <code>dotnet</code> CLI (build/run/test/publish), Visual Studio 2022/2024 (Windows), Rider (JetBrains, cross-platform), VS Code + C# Dev Kit. Testing: xUnit + FluentAssertions + Testcontainers. Observability: OpenTelemetry .NET SDK first-class, Serilog + Application Insights.
        </p>
      </Section>

      <Section title="O que esperar desta trilha" accent={accent}>
        <Callout tone="info" icon="🗺️">
          Próximos módulos: C# 12+ features (records, pattern matching, primary ctors), async/await rigoroso (ConfigureAwait, ValueTask, cancellation), LINQ produtivo, ASP.NET Core Minimal APIs, EF Core moderno, Span&lt;T&gt; para perf crítica, ecossistema .NET (CLR, GC, Native AOT), e capstone de ASP.NET Core API production-ready.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
