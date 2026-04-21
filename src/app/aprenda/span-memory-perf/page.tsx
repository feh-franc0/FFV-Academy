import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('span-memory-perf');
const accent = '#7c3aed';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Span<T> é ref struct e só vive na stack?',
    options: [
      'Limitação do CLR',
      'Segurança: se Span apontasse para stack memory e fosse capturado em heap (field de classe, closure, task), o frame poderia ter saído e o Span leria memória inválida. Ref struct proíbe esses cenários em compile-time',
      'Performance',
      'Legacy',
    ],
    correct: 1,
    explanation: 'Span<T> pode apontar para array managed, stack (stackalloc), unmanaged memory ou string. Se virasse campo de classe, poderia sobreviver ao frame. Ref struct = não pode ser boxed, armazenado em field de class, capturado por lambda, usado em async. O compilador garante segurança por construção. Para cenários heap-compat, use Memory<T>.',
  },
  {
    question: 'Quando usar stackalloc?',
    options: [
      'Sempre',
      'Buffers pequenos (<1KB tipicamente) conhecidos em compile time ou runtime limitado: evita heap allocation em hot path. Cuidado com stack overflow em loop ou recursion. Combinado com Span<byte> dá buffer zero-alloc',
      'Nunca',
      'Só para strings',
    ],
    correct: 1,
    explanation: 'Span<byte> buf = stackalloc byte[256]; reserva 256 bytes no stack sem touch no GC. Bom para parse, format, checksums de tamanho conhecido. Perigos: fora de hot loop o ganho é marginal, em loop você pode blow stack. Padrão seguro: if (size <= 256) stackalloc; else ArrayPool.Shared.Rent.',
  },
  {
    question: 'Qual a diferença entre Span<T> e Memory<T>?',
    options: [
      'Nenhuma',
      'Span: ref struct, stack-only, max perf, não async-compat. Memory: heap-safe, pode ser armazenado em field, funcionar em async, converter pra Span via .Span. Use Memory em APIs async; use Span internamente para processing',
      'Span é mais lento',
      'Memory é obsoleto',
    ],
    correct: 1,
    explanation: 'Memory<T> é struct (não ref struct) que envolve o mesmo conceito mas aceita heap. Assinatura async Task Process(Memory<byte> data) funciona; Span<byte> não. Dentro do método, .Span materializa Span efêmero para hot loop. Padrão: APIs públicas async recebem Memory<T>; hot processamento usa Span<T> local.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="span-memory-perf"
      title="Span<T>, Memory<T> e perf crítica"
      icon="⚡"
      xp={55}
      readTime={13}
      trailName="C# & .NET Moderno"
      trailColor={accent}
      nextSlug="dotnet-ecosystem"
      nextTitle=".NET ecosystem: CLR, GC, BCL, deployment"
      quiz={quiz}
    >
      <Section title="Motivação" accent={accent}>
        <p>
          Em hot path (parsing, serialização, crypto, protocolos binários), cada alocação vira pressão no GC. <code>Span&lt;T&gt;</code> permite fatiar arrays, strings e memória unmanaged com zero alocação e bounds check eficiente. É a ferramenta-chave de perf em .NET moderno.
        </p>
      </Section>

      <Section title="Span<T> basics" accent={accent}>
        <CodeBlock lang="csharp">{`byte[] data = GetBuffer();
Span<byte> header = data.AsSpan(0, 16);
Span<byte> body   = data.AsSpan(16);

// sobre string
ReadOnlySpan<char> email = "alice@x.io".AsSpan();
int at = email.IndexOf('@');
ReadOnlySpan<char> user   = email[..at];
ReadOnlySpan<char> domain = email[(at+1)..];`}</CodeBlock>
      </Section>

      <Section title="stackalloc para buffer temporário" accent={accent}>
        <CodeBlock lang="csharp">{`public static bool TryFormatId(int id, Span<char> dst, out int written)
{
    Span<char> scratch = stackalloc char[11]; // int.MinValue "-2147483648"
    if (!id.TryFormat(scratch, out var n)) { written = 0; return false; }
    if (n > dst.Length) { written = 0; return false; }
    scratch[..n].CopyTo(dst);
    written = n;
    return true;
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Evite <code>stackalloc</code> dentro de loop grande — cada iteração reserva novamente. Alocação é no prólogo da função em C# moderno, não por iteração, mas é fácil escrever código que crie uma sequência de frames enormes.
        </Callout>
      </Section>

      <Section title="ArrayPool para buffers grandes" accent={accent}>
        <CodeBlock lang="csharp">{`var pool = ArrayPool<byte>.Shared;
byte[] buf = pool.Rent(8192);
try
{
    var span = buf.AsSpan(0, 8192);
    await stream.ReadExactlyAsync(span);
    Process(span);
}
finally
{
    pool.Return(buf, clearArray: false);
}`}</CodeBlock>
        <p>
          Padrão canônico em código de alto throughput. <code>RecyclableMemoryStream</code> (lib Microsoft.IO) generaliza para streams reutilizáveis.
        </p>
      </Section>

      <Section title="Memory<T> em APIs async" accent={accent}>
        <CodeBlock lang="csharp">{`public async Task<int> ReadExactlyAsync(
    Memory<byte> buffer, CancellationToken ct)
{
    int total = 0;
    while (total < buffer.Length)
    {
        int n = await _stream.ReadAsync(buffer[total..], ct);
        if (n == 0) throw new EndOfStreamException();
        total += n;
    }
    return total;
}`}</CodeBlock>
      </Section>

      <Section title="ref struct e ref returns" accent={accent}>
        <CodeBlock lang="csharp">{`public ref struct Enumerator
{
    private readonly ReadOnlySpan<int> _span;
    private int _idx;
    public Enumerator(ReadOnlySpan<int> s) { _span = s; _idx = -1; }
    public bool MoveNext() => ++_idx < _span.Length;
    public ref readonly int Current => ref _span[_idx];
}`}</CodeBlock>
        <p>
          <code>ref readonly</code> evita copy de struct grande ao enumerar. Padrão em bibliotecas modernas (Utf8JsonReader, SequenceReader).
        </p>
      </Section>

      <Section title="Benchmark honesto" accent={accent}>
        <CodeBlock lang="csharp">{`// BenchmarkDotNet
[MemoryDiagnoser]
public class FormatBench
{
    [Benchmark(Baseline = true)]
    public string Boxed() => \$"id={_id}";

    [Benchmark]
    public int SpanFormat()
    {
        Span<char> buf = stackalloc char[32];
        _id.TryFormat(buf, out var n);
        return n;
    }
}`}</CodeBlock>
        <Callout tone="success" icon="✅">
          <code>BenchmarkDotNet</code> é padrão da indústria .NET — warm-up, GC measurement, statistical significance automático. Sem ele, microbenchmark é teatro.
        </Callout>
      </Section>

      <Section title="Quando investir" accent={accent}>
        <Callout tone="info" icon="💡">
          Span/Memory brilha em: protocolos binários, JSON/Utf8 parsing (System.Text.Json usa Span), crypto, servidores high-throughput (Kestrel). Em CRUD tradicional o ganho é irrelevante — não adianta trocar EF + HTTP por Span. Meça com BenchmarkDotNet e MemoryDiagnoser antes de otimizar.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
