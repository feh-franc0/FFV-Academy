import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('csharp-async-await');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que `.Result` ou `.Wait()` em código async quase sempre é bug?',
    options: [
      'Só estilo',
      'Bloqueia thread chamadora; em ASP.NET clássico (SynchronizationContext) causa deadlock clássico porque o continuation precisa da mesma thread. Mesmo em ASP.NET Core reduz throughput. Correto: await na cadeia inteira até Main/handler',
      'Obsoleto',
      'Só em Windows',
    ],
    correct: 1,
    explanation: 'Sync-over-async é antipadrão. Em ASP.NET legado causa deadlock: o await default marca continuation pra voltar no mesmo sync context, que está bloqueado pelo .Result. Em ASP.NET Core não há sync context, mas thread pool starvation reduz throughput. Regra: async all the way. .GetAwaiter().GetResult() só em Main/test setup.',
  },
  {
    question: 'Quando usar ValueTask em vez de Task?',
    options: [
      'Sempre',
      'Em APIs hot-path onde a maioria das chamadas completa sincronamente (cache hit, já-pronto). ValueTask evita alocação de Task. Trade-off: consumer só pode await UMA vez, não pode armazenar. Uso canônico: IAsyncEnumerable, ReadAsync/WriteAsync',
      'Em tudo',
      'Obsoleto',
    ],
    correct: 1,
    explanation: 'ValueTask é struct: zero-alloc quando completa síncrono. Útil em APIs hot como MemoryStream.ReadAsync que frequentemente tem dados em buffer (síncrono). Restrição importante: não await duas vezes, não armazenar em variável e await depois — undefined behavior. Para Tasks normais (HTTP, DB), Task alloca mas é negligível.',
  },
  {
    question: 'Qual o papel correto de ConfigureAwait(false)?',
    options: [
      'Sempre usar',
      'Em biblioteca (código que não sabe o contexto do chamador) para evitar capturar SynchronizationContext: libera aplicação UI/ASP.NET legado de deadlock e melhora perf. Em aplicação (ASP.NET Core, console) não faz diferença — contexto não existe',
      'Nunca',
      'Obsoleto',
    ],
    correct: 1,
    explanation: 'ConfigureAwait(false) diz "não preciso voltar no contexto original". Essencial em libs reusáveis pois consumer pode estar em WinForms/ASP.NET clássico. Em ASP.NET Core (sem sync context) e console, é no-op — código de app pode ignorar. Analyzers (CA2007) flagam em libs; para apps geralmente silencia com .editorconfig.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="csharp-async-await"
      title="C# async/await rigoroso + ConfigureAwait"
      icon="⏳"
      xp={55}
      readTime={13}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="linq-produtivo"
      nextTitle="LINQ produtivo: method vs query syntax, deferred"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>
          <code>async</code> é açúcar do compilador: função vira state machine que suspende em <code>await</code> e resume quando o <code>Task</code> completa. Não cria threads — libera a thread atual pra fazer outra coisa. Eficiência em I/O vem daí.
        </p>
        <CodeBlock lang="csharp">{`public async Task<string> FetchAsync(string url, CancellationToken ct)
{
    using var http = new HttpClient();
    var resp = await http.GetAsync(url, ct);
    resp.EnsureSuccessStatusCode();
    return await resp.Content.ReadAsStringAsync(ct);
}`}</CodeBlock>
      </Section>

      <Section title="CancellationToken não é opcional" accent={accent}>
        <CodeBlock lang="csharp">{`// API correta aceita e propaga
public async Task<Order?> GetAsync(int id, CancellationToken ct = default)
{
    await using var conn = await _factory.CreateConnectionAsync(ct);
    return await conn.QueryFirstOrDefaultAsync<Order>(
        "SELECT * FROM orders WHERE id = @id",
        new { id },
        cancellationToken: ct);
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Ignorar <code>CancellationToken</code> em loop async é fonte de leaks em produção (cliente desconectou, servidor continua trabalhando). ASP.NET Core injeta <code>HttpContext.RequestAborted</code> automaticamente em controllers/endpoints.
        </Callout>
      </Section>

      <Section title="async void: só em event handlers" accent={accent}>
        <CodeBlock lang="csharp">{`// ❌ exceção vira crash do processo, não pode await
public async void ProcessAll() { await ... }

// ✅ retorna Task sempre
public async Task ProcessAllAsync() { await ... }

// ✅ exceção: event handler de framework (UI, timer)
private async void Button_Click(object sender, EventArgs e)
{
    await DoWorkAsync();
}`}</CodeBlock>
      </Section>

      <Section title="IAsyncEnumerable: streams" accent={accent}>
        <CodeBlock lang="csharp">{`public async IAsyncEnumerable<Order> StreamOrdersAsync(
    [EnumeratorCancellation] CancellationToken ct)
{
    await foreach (var row in _db.QueryAsync<Order>("...", ct))
    {
        yield return row;
    }
}

await foreach (var order in svc.StreamOrdersAsync(ct))
{
    Console.WriteLine(order);
}`}</CodeBlock>
        <p>
          Ideal para paginação de DB, streaming de HTTP. Cada item disponibilizado sem esperar batch inteiro. Marque o token com <code>[EnumeratorCancellation]</code> para cooperar com <code>WithCancellation</code>.
        </p>
      </Section>

      <Section title="ValueTask em hot path" accent={accent}>
        <CodeBlock lang="csharp">{`private readonly Dictionary<int, User> _cache = new();

public ValueTask<User> GetAsync(int id, CancellationToken ct)
{
    if (_cache.TryGetValue(id, out var u))
        return ValueTask.FromResult(u);   // sync, zero alloc
    return new(LoadAsync(id, ct));        // converte Task em ValueTask
}`}</CodeBlock>
      </Section>

      <Section title="Paralelismo: Task.WhenAll, Parallel, Channels" accent={accent}>
        <CodeBlock lang="csharp">{`// Fan-out/fan-in
var tasks = urls.Select(u => FetchAsync(u, ct));
var results = await Task.WhenAll(tasks);

// Throttle com SemaphoreSlim
var gate = new SemaphoreSlim(10);
async Task Throttled(string url) {
    await gate.WaitAsync(ct);
    try { return await FetchAsync(url, ct); }
    finally { gate.Release(); }
}

// Pipeline com Channel<T>
var channel = Channel.CreateBounded<WorkItem>(100);`}</CodeBlock>
      </Section>

      <Section title="Analyzers obrigatórios" accent={accent}>
        <Callout tone="success" icon="✅">
          Ligar <code>TreatWarningsAsErrors=true</code> em csproj, ativar regra <code>CA1849</code> (async call from sync), <code>CA2012</code> (ValueTask misuse), <code>CA2016</code> (propagar CancellationToken). Microsoft.VisualStudio.Threading.Analyzers pega sync-over-async. Em PR, bugs async viram red.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
