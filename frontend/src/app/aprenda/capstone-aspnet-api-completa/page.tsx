import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-aspnet-api-completa');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'O que "production-ready" significa em API ASP.NET Core?',
    options: [
      'Só deploy',
      'Observability (logs estruturados + traces + métricas), health checks (/health + /ready), auth (JWT ou cookie), rate limiting, migrations versionadas, testes (unit + integração com TestContainers), Dockerfile chiseled/AOT, CI/CD automatizado, error handling com ProblemDetails',
      'Só auth',
      'Só tests',
    ],
    correct: 1,
    explanation: 'Production-ready é checklist operacional, não só funcional. Sem health checks, orquestrador não sabe se deve restart. Sem logs estruturados, debugging em prod é tortura. Sem migrations versionadas, schema drift. Sem testes de integração, bugs de serialização/EF só aparecem em prod. Capstone portfolio demonstra domínio desse checklist inteiro.',
  },
  {
    question: 'Por que TestContainers em testes de integração?',
    options: [
      'Mock',
      'Sobe Postgres/Redis/Kafka real em Docker durante o teste — mesmo binário que produção, zero divergência de comportamento (SQL dialect, índices, triggers). Mais lento que mock mas pega bugs que mock esconde. Descarta o container no fim, isolamento garantido',
      'Obsoleto',
      'Só Windows',
    ],
    correct: 1,
    explanation: 'Mock de DB esconde diferenças de dialect, constraints, performance. TestContainers sobe Postgres real, roda migrations, executa testes contra ele, derruba. Isolamento por container. Lento (~2s startup), mas 100% fiel. Combinado com IAsyncLifetime em xUnit vira canônico — cada fixture tem seu DB limpo.',
  },
  {
    question: 'Qual formato de log é adequado para produção?',
    options: [
      'Texto livre',
      'JSON estruturado (Serilog + Microsoft.Extensions.Logging) com TraceId/SpanId correlacionados do OpenTelemetry, scopes por request, campos tipados (OrderId, CustomerId). Ingestão por Loki/ELK/Datadog permite query por campo, não regex',
      'Console.WriteLine',
      'Binário',
    ],
    correct: 1,
    explanation: 'Log JSON permite buscar por campo ({"OrderId":"123"}) em vez de regex frágil. TraceId correlaciona log, trace distribuído e métrica. Serilog.Formatting.Json.JsonFormatter + Enrichers (FromLogContext, ThreadId) é padrão. Backend (Loki, Elastic) indexa e filtra em segundos, mesmo em TBs de log.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-aspnet-api-completa"
      title="Capstone: ASP.NET Core API completa production-ready"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Missão" accent={accent}>
        <p>
          Entregue uma API REST ASP.NET Core 9 "production-ready" para um domínio real (ex: gestão de pedidos, biblioteca, cadastro de eventos). O critério não é complexidade de negócio — é rigor operacional.
        </p>
      </Section>

      <Section title="Stack mandatória" accent={accent}>
        <Callout tone="info" icon="💡">
          ASP.NET Core 9 Minimal APIs · EF Core com migrations · Postgres · Serilog em JSON · OpenTelemetry (OTLP) · JWT auth · Rate limiting · HealthChecks · xUnit + TestContainers · Dockerfile multi-stage · GitHub Actions CI · docker-compose para dev local.
        </Callout>
      </Section>

      <Section title="Layout de repo" accent={accent}>
        <CodeBlock lang="bash">{`.
├── src/
│   ├── MyApi/
│   │   ├── Program.cs
│   │   ├── Endpoints/
│   │   ├── Domain/
│   │   ├── Infrastructure/
│   │   │   ├── AppDb.cs
│   │   │   └── Migrations/
│   │   └── appsettings.json
│   └── MyApi.Contracts/         # DTOs públicos
├── tests/
│   ├── MyApi.UnitTests/
│   └── MyApi.IntegrationTests/  # TestContainers
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml       # api + postgres + jaeger
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
└── README.md`}</CodeBlock>
      </Section>

      <Section title="Program.cs mínimo" accent={accent}>
        <CodeBlock lang="csharp">{`var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(new JsonFormatter()));

builder.Services.AddDbContext<AppDb>(o => o
    .UseNpgsql(builder.Configuration.GetConnectionString("Db")));
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(o => o.AddFixedWindowLimiter("api", w => {
    w.PermitLimit = 100; w.Window = TimeSpan.FromMinutes(1);
}));
builder.Services.AddHealthChecks().AddDbContextCheck<AppDb>();
builder.Services.AddOpenApi();
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation()
                       .AddEntityFrameworkCoreInstrumentation()
                       .AddOtlpExporter())
    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddOtlpExporter());

var app = builder.Build();
app.UseExceptionHandler();
app.UseSerilogRequestLogging();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapOpenApi();
app.MapHealthChecks("/health");
app.MapOrderEndpoints();

await app.MigrateDatabaseAsync();
app.Run();`}</CodeBlock>
      </Section>

      <Section title="Teste de integração com TestContainers" accent={accent}>
        <CodeBlock lang="csharp">{`public class OrdersApiFixture : IAsyncLifetime
{
    public PostgreSqlContainer Db { get; } = new PostgreSqlBuilder()
        .WithImage("postgres:16")
        .Build();

    public WebApplicationFactory<Program> Factory = null!;

    public async Task InitializeAsync()
    {
        await Db.StartAsync();
        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(b => b.ConfigureAppConfiguration((_, cfg) =>
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:Db"] = Db.GetConnectionString()
                })));
    }

    public async Task DisposeAsync() => await Db.DisposeAsync();
}

public class OrdersApiTests(OrdersApiFixture fx) : IClassFixture<OrdersApiFixture>
{
    [Fact]
    public async Task PostOrder_Creates_And_Returns_201()
    {
        var client = fx.Factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/orders", new { Total = 99.9m });
        resp.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}`}</CodeBlock>
      </Section>

      <Section title="Dockerfile chiseled" accent={accent}>
        <CodeBlock lang="yaml">{`FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY src/MyApi/*.csproj MyApi/
RUN dotnet restore MyApi/MyApi.csproj
COPY src/MyApi MyApi
RUN dotnet publish MyApi/MyApi.csproj -c Release -o /out \\
    /p:PublishReadyToRun=true

FROM mcr.microsoft.com/dotnet/aspnet:9.0-jammy-chiseled
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApi.dll"]`}</CodeBlock>
      </Section>

      <Section title="CI GitHub Actions" accent={accent}>
        <CodeBlock lang="yaml">{`name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      docker:
        image: docker:dind
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '9.0.x' }
      - run: dotnet build -c Release --nologo
      - run: dotnet test -c Release --logger "trx;LogFileName=test.trx"
      - uses: dorny/test-reporter@v1
        if: always()
        with:
          name: dotnet tests
          path: '**/test.trx'
          reporter: dotnet-trx`}</CodeBlock>
      </Section>

      <Section title="Checklist final" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) README com setup em &lt;5 min (clone + docker-compose up). (2) <code>/health</code> e <code>/health/ready</code> respondendo. (3) OpenAPI em <code>/openapi/v1.json</code>. (4) Migrations aplicadas automaticamente no startup. (5) Logs em JSON com TraceId. (6) Testes passam em CI com TestContainers. (7) Imagem Docker &lt;100MB. (8) Rate limit por endpoint crítico. (9) Load test com <code>k6</code> ou <code>NBomber</code> documentado. (10) Tag v0.1.0.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
