import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('linq-produtivo');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre IEnumerable e IQueryable?',
    options: [
      'Nenhuma',
      'IEnumerable executa LINQ em memória (Func<T>). IQueryable constrói expression tree (Expression<Func<T>>) que o provider (EF Core) traduz pra SQL. Mudar IQueryable → IEnumerable no meio da query força materialização e perde filtro no banco',
      'IQueryable é mais lento',
      'Só em C# 13',
    ],
    correct: 1,
    explanation: 'IQueryable é central em EF Core: db.Orders.Where(o => o.Total > 100) vira WHERE Total > 100 no SQL. Se você fizer .AsEnumerable() antes do Where, o EF traz TUDO e filtra em memória. Diferença em dataset grande é minutos vs milissegundos. Assinatura da API importa: retornar IQueryable permite composição; retornar IEnumerable materializa.',
  },
  {
    question: 'Por que deferred execution pode causar bugs sutis?',
    options: [
      'Não causa',
      'Query não executa até iterar; chamá-la múltiplas vezes reexecuta. Se origem é EF, dispara SQL cada vez. Se origem captura variável por closure, resultado muda. Materializar com ToList/ToArray congela o resultado',
      'Só em Web',
      'Obsoleto',
    ],
    correct: 1,
    explanation: 'var q = list.Where(x => x.Active); executa a lambda toda vez que iteramos q. Em loop com foreach + foreach, reavalia. Com IQueryable, cada iteração bate no banco. Bug clássico: capturar variável que muda no loop. Fix: .ToList() para snapshot. Regra: em hot path, materialize quando terminou de compor.',
  },
  {
    question: 'Como evitar N+1 em LINQ com EF Core?',
    options: [
      'Usar .Count()',
      'Include/ThenInclude para eager loading de navegação, ou projetar com Select para campos necessários (db.Orders.Select(o => new { o.Id, ItemsCount = o.Items.Count() })). Logging de SQL em dev revela queries escondidas',
      'Desativar LINQ',
      'Reinstalar EF',
    ],
    correct: 1,
    explanation: 'N+1 aparece quando você itera Orders e acessa o.Items (lazy): EF dispara 1 query por order. Fix 1: db.Orders.Include(o => o.Items). Fix 2 (melhor): projetar só o que precisa com Select — SQL vira 1 JOIN ou 1 subquery. Ligar logging (.LogTo(Console.WriteLine)) em dev expõe queries não intencionais.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="linq-produtivo"
      title="LINQ produtivo: method vs query syntax, deferred"
      icon="🔗"
      xp={50}
      readTime={12}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="aspnet-core-minimal-apis"
      nextTitle="ASP.NET Core Minimal APIs (2026)"
      quiz={quiz}
    >
      <Section title="Method syntax venceu a disputa" accent={accent}>
        <CodeBlock lang="csharp">{`// Method syntax (dominante em 2026)
var adults = people
    .Where(p => p.Age >= 18)
    .OrderBy(p => p.Name)
    .Select(p => new { p.Name, p.Age })
    .ToList();

// Query syntax (raro em código moderno)
var adults = (from p in people
              where p.Age >= 18
              orderby p.Name
              select new { p.Name, p.Age }).ToList();`}</CodeBlock>
        <p>
          Method syntax compõe melhor em projeções complexas e encaixa em chains fluentes. Query syntax sobrevive em joins múltiplos onde fica mais legível.
        </p>
      </Section>

      <Section title="Deferred execution" accent={accent}>
        <CodeBlock lang="csharp">{`var q = numbers.Where(n => {
    Console.WriteLine($"check {n}");
    return n % 2 == 0;
});

// nada imprimiu ainda
foreach (var x in q) { }   // imprime check 1, 2, 3...
foreach (var x in q) { }   // IMPRIME DE NOVO — re-executa

var materialized = q.ToList();   // executa UMA vez e congela`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Em APIs que retornam <code>IEnumerable&lt;T&gt;</code> vinda de EF, o consumer pode iterar 3x e disparar 3 queries. Documente ou materialize.
        </Callout>
      </Section>

      <Section title="IQueryable: composição no banco" accent={accent}>
        <CodeBlock lang="csharp">{`public IQueryable<Order> PaidOrders(AppDb db) =>
    db.Orders.Where(o => o.Status == "paid");

public async Task<List<Order>> TopToday(AppDb db, CancellationToken ct) =>
    await PaidOrders(db)
        .Where(o => o.CreatedAt >= DateTime.UtcNow.Date)
        .OrderByDescending(o => o.Total)
        .Take(10)
        .ToListAsync(ct);
// EF traduz tudo em 1 SQL: WHERE Status='paid' AND CreatedAt>=... ORDER BY Total DESC LIMIT 10`}</CodeBlock>
      </Section>

      <Section title="Projections para performance" accent={accent}>
        <CodeBlock lang="csharp">{`// ❌ traz a linha inteira + N+1 em Items
var list = await db.Orders
    .Include(o => o.Items)
    .ToListAsync();

// ✅ projeta só o necessário — SQL único e enxuto
var list = await db.Orders
    .Select(o => new OrderSummary(
        o.Id,
        o.Total,
        o.Items.Count(),
        o.Items.Sum(i => i.Quantity)))
    .ToListAsync();`}</CodeBlock>
      </Section>

      <Section title="AsNoTracking para read-only" accent={accent}>
        <CodeBlock lang="csharp">{`// Tracking caro se for read-only: EF guarda snapshot pra change detection
var readOnly = await db.Orders
    .AsNoTracking()
    .Where(o => o.Status == "paid")
    .ToListAsync();`}</CodeBlock>
        <p>
          <code>AsNoTracking</code> economiza memória e CPU em endpoints GET. Para escrita ou update, mantenha tracking.
        </p>
      </Section>

      <Section title="Aggregation idiomático" accent={accent}>
        <CodeBlock lang="csharp">{`var totals = orders
    .GroupBy(o => o.CustomerId)
    .Select(g => new {
        CustomerId = g.Key,
        Count = g.Count(),
        Total = g.Sum(o => o.Total)
    })
    .OrderByDescending(x => x.Total)
    .Take(100);`}</CodeBlock>
      </Section>

      <Section title="Debug: ver o SQL gerado" accent={accent}>
        <CodeBlock lang="csharp">{`// Program.cs
builder.Services.AddDbContext<AppDb>(opt => opt
    .UseNpgsql(conn)
    .LogTo(Console.WriteLine, LogLevel.Information)
    .EnableSensitiveDataLogging());  // apenas dev`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Ver SQL em dev é não-negociável — expõe N+1 e queries mal traduzidas antes de chegar em produção.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
