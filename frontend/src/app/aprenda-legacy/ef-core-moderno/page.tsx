import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ef-core-moderno');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que DbContext deve ter lifetime scoped e nunca singleton?',
    options: [
      'Só convenção',
      'DbContext não é thread-safe e mantém change tracker por instância: compartilhar entre requests vaza estado, bloqueia, e quebra em concorrência. Scoped (1 por request) é o default correto em ASP.NET Core, alinhado ao ciclo request/response',
      'Só em EF6',
      'Singleton é melhor',
    ],
    correct: 1,
    explanation: 'DbContext armazena snapshots de entidades carregadas para detectar mudanças. Singleton = todos os requests compartilham esse cache + conexão = corrupção garantida. Scoped = container cria/dispõe por request. DbContextFactory é a alternativa quando precisa criar fora de escopo HTTP (background job).',
  },
  {
    question: 'Quando usar migrations vs script SQL manual?',
    options: [
      'Sempre manual',
      'Migrations versionam schema junto do código, geram SQL reproduzível, suportam up/down, integram com CI/CD. Para schema EF-first ou time-sem-DBA, preferidas. Script manual pertence a DBs legados ou operações impossíveis pro migrator (reorg, particionamento, triggers complexas)',
      'Sempre migrations',
      'Nunca importa',
    ],
    correct: 1,
    explanation: 'dotnet ef migrations add AddOrderStatus gera classe C# com Up/Down e um diff de SQL. dotnet ef database update aplica. Em CI, dotnet ef migrations script gera idempotent.sql para revisão por DBA. Script ad-hoc ainda é necessário para mudanças fora do escopo do EF: índices especiais, particionamento, triggers.',
  },
  {
    question: 'Como melhorar throughput em bulk insert com EF Core 7+?',
    options: [
      'Loop de Add',
      'ExecuteUpdate/ExecuteDelete (SQL direto, 1 comando para N linhas), BulkExtensions/EFCore.BulkExtensions (lib terceira), ou AddRange + SaveChanges com AutoDetectChangesEnabled=false em batches. Conscientemente fora do change tracker para perf',
      'Só SaveChanges',
      'Obsoleto',
    ],
    correct: 1,
    explanation: 'Add+SaveChanges gera N INSERTs individuais + tracking overhead. Para bulk, ExecuteUpdate/Delete (EF 7+) emite 1 comando SQL. Para insert massivo, libs terceiras fazem BulkInsert nativo. Alternativa manual: AddRange em batches de 1000 + ChangeTracker.AutoDetectChangesEnabled=false reduz CPU drasticamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ef-core-moderno"
      title="EF Core moderno: DbContext, migrations, performance"
      icon="🗄️"
      xp={55}
      readTime={13}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="span-memory-perf"
      nextTitle="Span<T>, Memory<T> e perf crítica"
      quiz={quiz}
    >
      <Section title="DbContext bem configurado" accent={accent}>
        <CodeBlock lang="csharp">{`public class AppDb(DbContextOptions<AppDb> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Order>(e =>
        {
            e.HasKey(o => o.Id);
            e.Property(o => o.Total).HasPrecision(18, 2);
            e.HasIndex(o => new { o.CustomerId, o.CreatedAt });
            e.HasOne(o => o.Customer)
             .WithMany(c => c.Orders)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}`}</CodeBlock>
        <CodeBlock lang="csharp">{`// Program.cs
builder.Services.AddDbContext<AppDb>(opt => opt
    .UseNpgsql(builder.Configuration.GetConnectionString("Db"),
               npg => npg.EnableRetryOnFailure()));`}</CodeBlock>
      </Section>

      <Section title="Migrations no fluxo diário" accent={accent}>
        <CodeBlock lang="bash">{`# Adicionar migration
dotnet ef migrations add AddOrderStatus

# Aplicar em dev
dotnet ef database update

# Gerar SQL idempotente pra CI/CD
dotnet ef migrations script --idempotent -o out.sql

# Reverter última
dotnet ef migrations remove`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Política sã: revisor de PR abre o <code>out.sql</code> gerado e confere. Migration ruim em produção é caro; revisar SQL antes do merge vira rotina.
        </Callout>
      </Section>

      <Section title="Tracking vs NoTracking" accent={accent}>
        <CodeBlock lang="csharp">{`// Read-only list: AsNoTracking
var list = await db.Orders
    .AsNoTracking()
    .Where(o => o.Status == "paid")
    .ToListAsync(ct);

// Update: tracking (default)
var order = await db.Orders.FirstAsync(o => o.Id == id, ct);
order.Status = "shipped";
await db.SaveChangesAsync(ct);`}</CodeBlock>
      </Section>

      <Section title="Include vs projection" accent={accent}>
        <CodeBlock lang="csharp">{`// Include: carrega entidade inteira
var full = await db.Orders
    .Include(o => o.Items)
    .ThenInclude(i => i.Product)
    .ToListAsync();

// Projection: só o que precisa — SQL mais rápido, menos alocação
var dtos = await db.Orders
    .Select(o => new OrderListItem(
        o.Id,
        o.CreatedAt,
        o.Total,
        o.Items.Count()))
    .ToListAsync();`}</CodeBlock>
      </Section>

      <Section title="ExecuteUpdate / ExecuteDelete (EF 7+)" accent={accent}>
        <CodeBlock lang="csharp">{`// 1 UPDATE em SQL, sem materializar entidades
await db.Orders
    .Where(o => o.Status == "pending" && o.CreatedAt < cutoff)
    .ExecuteUpdateAsync(u => u.SetProperty(o => o.Status, "expired"), ct);

await db.Orders
    .Where(o => o.Status == "cancelled")
    .ExecuteDeleteAsync(ct);`}</CodeBlock>
      </Section>

      <Section title="Compiled queries" accent={accent}>
        <CodeBlock lang="csharp">{`private static readonly Func<AppDb, int, Task<Order?>> _getById =
    EF.CompileAsyncQuery((AppDb db, int id) =>
        db.Orders.FirstOrDefault(o => o.Id == id));

public Task<Order?> GetAsync(int id) => _getById(_db, id);`}</CodeBlock>
        <p>
          Evita recompilar expression tree em cada chamada. Ganho mensurável em hot path.
        </p>
      </Section>

      <Section title="Logging em dev" accent={accent}>
        <CodeBlock lang="csharp">{`.UseNpgsql(conn)
.LogTo(Console.WriteLine, LogLevel.Information)
.EnableSensitiveDataLogging()   // mostra parâmetros — só dev
.EnableDetailedErrors();`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <code>EnableSensitiveDataLogging</code> expõe valores de parâmetros: ótimo em dev, catástrofe em prod. Proteja com <code>if (env.IsDevelopment())</code>.
        </Callout>
      </Section>

      <Section title="Armadilhas" accent={accent}>
        <Callout tone="danger" icon="🚨">
          (1) <code>Include</code> cascata causa Cartesian explosion — prefira split queries (<code>.AsSplitQuery()</code>) ou projection. (2) Lazy loading está desligado por default em EF Core; não ligue sem entender o N+1 que vem junto. (3) DbContext não é thread-safe — nunca share entre tasks concorrentes.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
