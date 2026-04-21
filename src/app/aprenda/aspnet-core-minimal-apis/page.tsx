import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('aspnet-core-minimal-apis');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando Minimal APIs superam Controllers clássicos?',
    options: [
      'Nunca',
      'Em APIs small-to-medium com handlers focados, endpoints de integração, microservices; reduz ~60% do boilerplate (atributos, classes), mantém DI/filtros/validação via endpoint filters e TypedResults. Controllers ainda vencem em apps com muitos handlers compartilhando convenções',
      'Só em Blazor',
      'Em tudo',
    ],
    correct: 1,
    explanation: 'Minimal APIs expoem rota como delegate: app.MapGet("/orders/{id}", ...). Menos ceremony, mais close-to-what-you-need. Equipes reportam 40-60% menos linhas em APIs de microservice. Controllers continuam relevantes em apps grandes com filtros MVC, routing por convenção, ou dependência de binding tradicional (multipart, XML, etc).',
  },
  {
    question: 'Como Minimal APIs lidam com validação e DI?',
    options: [
      'Não lidam',
      'DI: parâmetros de handler são resolvidos automaticamente do container (qualquer interface registrada). Validation: endpoint filters (C# 11+) ou libs como FluentValidation; TypedResults (Results.Ok, Results.BadRequest) para responses type-safe com OpenAPI',
      'Só atributos',
      'Sem DI',
    ],
    correct: 1,
    explanation: 'app.MapPost("/orders", async (Order o, IOrderService svc, CancellationToken ct) => await svc.CreateAsync(o, ct)) — Order vem do body, IOrderService do DI, ct do framework. Endpoint filters: .AddEndpointFilter<ValidationFilter<T>>() para validar. TypedResults: Results.Created(url, order) gera 201 + OpenAPI schema correto.',
  },
  {
    question: 'Por que OpenAPI é gerado automaticamente?',
    options: [
      'Reflection',
      'Metadata do endpoint (rota, body type, response types, produces) é registrada em tempo de build via source generators (Microsoft.AspNetCore.OpenApi). Resultado: /openapi/v1.json sem anotações manuais. Pode complementar com .WithName/.WithSummary fluentes',
      'Só em Swagger',
      'Manual sempre',
    ],
    correct: 1,
    explanation: '.NET 9+ adicionou Microsoft.AspNetCore.OpenApi com geração baseada em source generator — sem reflection em runtime, sem Swashbuckle. Endpoint Map retorna RouteHandlerBuilder fluente: .WithName("GetOrder").WithSummary("...").Produces<Order>(200). Scalar/Swagger UI consomem /openapi/v1.json.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="aspnet-core-minimal-apis"
      title="ASP.NET Core Minimal APIs (2026)"
      icon="🌐"
      xp={60}
      readTime={14}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="ef-core-moderno"
      nextTitle="EF Core moderno: DbContext, migrations, performance"
      quiz={quiz}
    >
      <Section title="Hello world de verdade" accent={accent}>
        <CodeBlock lang="csharp">{`var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDb>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Db")));
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();
app.MapOpenApi();

app.MapGet("/orders/{id:int}", async (int id, IOrderService svc, CancellationToken ct) =>
{
    var order = await svc.GetAsync(id, ct);
    return order is null ? Results.NotFound() : Results.Ok(order);
})
.WithName("GetOrder")
.Produces<Order>(200)
.Produces(404);

app.Run();`}</CodeBlock>
      </Section>

      <Section title="Grouping e convenções" accent={accent}>
        <CodeBlock lang="csharp">{`var orders = app.MapGroup("/orders")
    .RequireAuthorization()
    .WithTags("Orders")
    .AddEndpointFilter<ValidationFilter<Order>>();

orders.MapGet("/", ListAsync);
orders.MapGet("/{id:int}", GetAsync);
orders.MapPost("/", CreateAsync);
orders.MapDelete("/{id:int}", DeleteAsync).RequireAuthorization("Admin");`}</CodeBlock>
      </Section>

      <Section title="Binding rico" accent={accent}>
        <CodeBlock lang="csharp">{`// Body JSON automático
app.MapPost("/orders", (CreateOrderDto dto) => Results.Created(...));

// Query string tipada
app.MapGet("/search", (string? q, int page = 1, int size = 20) => ...);

// Route + Header
app.MapGet("/tenants/{tid}/items", (
    [FromRoute] Guid tid,
    [FromHeader(Name = "X-Api-Version")] string? version) => ...);

// AsParameters agrupa em record
record OrderQuery(string? Status, DateOnly? From, int Page = 1);
app.MapGet("/orders", ([AsParameters] OrderQuery q) => ...);`}</CodeBlock>
      </Section>

      <Section title="TypedResults: OpenAPI correto" accent={accent}>
        <CodeBlock lang="csharp">{`app.MapPost("/orders", async (CreateOrderDto dto, IOrderService svc, CancellationToken ct)
    -> Results<Created<Order>, ValidationProblem>
    =>
{
    var (ok, errors, order) = await svc.TryCreateAsync(dto, ct);
    return ok
        ? TypedResults.Created($"/orders/{order!.Id}", order)
        : TypedResults.ValidationProblem(errors);
});`}</CodeBlock>
        <p>
          <code>Results&lt;A, B&gt;</code> (discriminated union em runtime) permite declarar respostas possíveis e o OpenAPI ganha os schemas certos. Zero anotações redundantes.
        </p>
      </Section>

      <Section title="Middlewares essenciais 2026" accent={accent}>
        <CodeBlock lang="csharp">{`app.UseExceptionHandler();          // ProblemDetails
app.UseStatusCodePages();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseOutputCache();               // cache de response

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new() { Predicate = r => r.Tags.Contains("ready") });

// Rate limiting nativo
builder.Services.AddRateLimiter(o => o
    .AddFixedWindowLimiter("api", w =>
    {
        w.PermitLimit = 100;
        w.Window = TimeSpan.FromMinutes(1);
    }));`}</CodeBlock>
      </Section>

      <Section title="Autenticação JWT + Authorization policies" accent={accent}>
        <CodeBlock lang="csharp">{`builder.Services.AddAuthentication()
    .AddJwtBearer(o =>
    {
        o.Authority = builder.Configuration["Auth:Authority"];
        o.Audience  = builder.Configuration["Auth:Audience"];
    });

builder.Services.AddAuthorization(o =>
{
    o.AddPolicy("Admin", p => p.RequireRole("admin"));
    o.AddPolicy("Owner", p => p.RequireClaim("scope", "orders.write"));
});`}</CodeBlock>
      </Section>

      <Section title="Pontos fortes" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) Startup em 1 arquivo Program.cs &lt; 100 linhas cobre API pequena completa. (2) Source generators geram OpenAPI e binding sem reflection — melhor p/ AOT. (3) Endpoint filters dão ergonomia igual a middleware sem indentação global. (4) TypedResults documentam contrato sem duplicação.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
