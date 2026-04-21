import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dotnet-ecosystem');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'O que Native AOT oferece vs JIT tradicional?',
    options: [
      'Só mais lento',
      'Compilação ahead-of-time para binário nativo: startup instantâneo (~10ms), footprint menor (10-20MB), sem JIT em runtime, ideal para serverless/CLI/container. Restrições: sem reflection pesada, sem emit dinâmico, bibliotecas precisam declarar trim-safety',
      'Obsoleto',
      'Só Windows',
    ],
    correct: 1,
    explanation: 'JIT compila IL em runtime (primeiro hit paga custo); Native AOT compila tudo em compile-time para código nativo stand-alone. Trade-off: startup 100x mais rápido e imagem Docker bem menor, mas perde flexibilidade. ASP.NET Core Minimal APIs são AOT-compatíveis. EF Core tem limitações. Libs que usam Reflection.Emit (Newtonsoft) quebram.',
  },
  {
    question: 'Quais generations o GC do .NET usa e por quê?',
    options: [
      'Uma só',
      'Gen 0 (curta, coletada frequentemente — maioria dos objetos morre aqui), Gen 1 (sobreviventes, coletada menos frequente), Gen 2 (longa vida, coletada raramente, stop-the-world mais caro). LOH (Large Object Heap) para objetos >85KB. Server GC em alta concorrência',
      'Aleatório',
      'Só Gen 2',
    ],
    correct: 1,
    explanation: 'Generational hypothesis: objetos novos morrem jovens. Gen 0 é pool pequeno, coletado rápido, sobreviventes promovidos. LOH trata objetos grandes sem realocação custosa. Server GC dedica thread por core, Workstation GC para desktop. Background GC reduz pauses — tuning via <ServerGarbageCollection>true em csproj.',
  },
  {
    question: 'Self-contained vs framework-dependent deploy?',
    options: [
      'Iguais',
      'Framework-dependent: precisa .NET runtime instalado na máquina (imagem menor, mas dependência externa). Self-contained: inclui runtime dentro da publish (~60MB+, mas sem deps). Native AOT: binário único nativo (~15MB, sem runtime). Docker moderno usa AOT quando possível',
      'Só local',
      'Só produção',
    ],
    correct: 1,
    explanation: 'dotnet publish -c Release -r linux-x64 --self-contained false → binário pequeno, runtime instalado no host. Self-contained inclui tudo — útil em máquinas sem .NET (ex: servidores legacy). Native AOT (--publish-aot) gera executável nativo único. Para container imutável em prod, AOT ou self-contained + trim são recomendados.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dotnet-ecosystem"
      title=".NET ecosystem: CLR, GC, BCL, deployment"
      icon="🏭"
      xp={55}
      readTime={13}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="capstone-aspnet-api-completa"
      nextTitle="Capstone: ASP.NET Core API completa production-ready"
      quiz={quiz}
    >
      <Section title="CLR: o motor" accent={accent}>
        <p>
          Common Language Runtime executa IL (Intermediate Language) compilado do C#. Serviços: JIT compilation, garbage collection, type safety, exception handling, reflection, interop nativo. RyuJIT (2015+) é o compilador JIT atual; tiered compilation otimiza hot methods em background.
        </p>
      </Section>

      <Section title="Garbage Collector" accent={accent}>
        <CodeBlock lang="xml">{`<!-- csproj tuning -->
<PropertyGroup>
    <ServerGarbageCollection>true</ServerGarbageCollection>
    <ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>
    <RetainVMGarbageCollection>true</RetainVMGarbageCollection>
</PropertyGroup>`}</CodeBlock>
        <p>
          Server GC é default em ASP.NET Core — otimizado para throughput em múltiplos cores. GC tem 3 gerações (0/1/2) + LOH. Objetos grandes (&gt;85KB) vão pra LOH e não são realocados (caro). Para reduzir GC pressure em hot path: <code>ArrayPool</code>, <code>struct</code>, <code>Span&lt;T&gt;</code>.
        </p>
      </Section>

      <Section title="Native AOT (.NET 7+)" accent={accent}>
        <CodeBlock lang="xml">{`<PropertyGroup>
    <PublishAot>true</PublishAot>
    <InvariantGlobalization>true</InvariantGlobalization>
    <StripSymbols>true</StripSymbols>
</PropertyGroup>`}</CodeBlock>
        <CodeBlock lang="bash">{`dotnet publish -c Release -r linux-x64
# Gera binário nativo único em bin/Release/net9.0/linux-x64/publish/`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Use AOT quando startup e imagem Docker importarem (serverless, Lambdas, CLIs). Para APIs grandes com EF Core e reflexão pesada, fique no JIT — AOT pode exigir trabalho extra em trim warnings.
        </Callout>
      </Section>

      <Section title="Ready2Run: middle ground" accent={accent}>
        <CodeBlock lang="xml">{`<PublishReadyToRun>true</PublishReadyToRun>`}</CodeBlock>
        <p>
          Compila IL para código nativo ahead-of-time, mas mantém fallback JIT. Startup mais rápido que JIT puro sem as restrições de AOT. Boa opção para APIs ASP.NET Core que não comportam AOT completo.
        </p>
      </Section>

      <Section title="Docker de produção" accent={accent}>
        <CodeBlock lang="yaml">{`# Dockerfile multi-stage para app AOT
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -r linux-x64 -o /out \\
    /p:PublishAot=true

FROM mcr.microsoft.com/dotnet/runtime-deps:9.0-jammy-chiseled
WORKDIR /app
COPY --from=build /out/MyApi ./MyApi
ENTRYPOINT ["./MyApi"]`}</CodeBlock>
        <p>
          <code>runtime-deps:chiseled</code> é imagem mínima (sem shell, sem gerenciador de pacotes). AOT gera binário estático. Container final fica &lt;60MB.
        </p>
      </Section>

      <Section title="Blazor, MAUI, Aspire (panorama)" accent={accent}>
        <Callout tone="neutral" icon="📌">
          <strong>Blazor</strong>: SPA em C# via WebAssembly (client-side) ou Server (SignalR). <strong>MAUI</strong>: apps mobile/desktop cross-platform unificando Xamarin.Forms. <strong>Aspire</strong>: orquestração para microservices em .NET (dashboard, service discovery, observability opinado). Não substitui Kubernetes — complementa local dev e composição.
        </Callout>
      </Section>

      <Section title="Observability padrão" accent={accent}>
        <CodeBlock lang="csharp">{`// OpenTelemetry em 2026
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddOtlpExporter())
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddOtlpExporter());`}</CodeBlock>
        <Callout tone="success" icon="✅">
          .NET é cidadão first-class em OpenTelemetry. Traces HTTP + DB + custom spans saem com ~10 linhas. Exporta para qualquer backend OTLP (Jaeger, Tempo, Datadog, New Relic).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
