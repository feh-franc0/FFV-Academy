import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('perf-eng-mental-model');

const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Na USE method de Brendan Gregg, o que cada letra significa?',
    options: [
      'Usage, Speed, Errors',
      'Utilization (% do tempo ocupado), Saturation (fila/backlog), Errors (contagem de falhas) — aplicado a cada recurso (CPU, memória, disco, rede)',
      'User, System, Environment',
      'Uptime, Stress, Exception',
    ],
    correct: 1,
    explanation: 'USE é checklist cross-resource: para cada device (CPU, mem, disk, NIC), meça utilization, saturation e errors. Saturation é o detalhe que média não mostra — disco 80% util pode ter runq cheia e p99 péssimo. Gregg propôs em 2013 como antídoto ao "adivinhar primeiro, medir depois".',
  },
  {
    question: 'Por que p99 importa mais que média em latência?',
    options: [
      'Média é sempre errada',
      'Média esconde cauda. Sistema com média 50ms e p99 2s frustra 1% das requests — e 1% pode ser seu cliente VIP. Tail latency é a experiência real quando request faz fan-out para N serviços',
      'p99 é mais fácil de calcular',
      'Média é só para CPUs antigas',
    ],
    correct: 1,
    explanation: 'Em arquitetura fan-out (1 request dispara 10 subchamadas), p99 individual vira p90 agregado — tail amplifica. Google SRE book e Gil Tene ("how NOT to measure latency") defendem HDR histograms + p50/p90/p99/p99.9. Média só serve para capacity planning grosseiro.',
  },
  {
    question: 'Qual lei limita o speedup que paralelização pode trazer?',
    options: [
      'Moore',
      'Amdahl: speedup máximo = 1 / (s + p/N), onde s é fração serial. Se 10% do código é serial, speedup máximo com N=infinito é 10x. Gustafson relaxa assumindo problema cresce com N',
      'Nyquist',
      'Shannon',
    ],
    correct: 1,
    explanation: 'Amdahl mostra por que adicionar cores tem retorno decrescente se parte do código não paraleliza. Gustafson observa que workloads reais crescem com hardware (benchmark 2x maior em máquina 2x mais rápida) — então speedup prático é maior que Amdahl sugere. Saber qual aplica evita promessas furadas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="perf-eng-mental-model"
      title="Perf engineering: método"
      icon="🔬"
      xp={45}
      readTime={11}
      trailName="Performance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Por que método importa mais que trick" accent={accent}>
        <p>
          Performance é a disciplina onde mais gente erra por chutar. Trocar lista por array, adicionar cache, rodar em Rust — sem medir antes vira cargo cult. Brendan Gregg (Netflix, ex-Sun) formalizou o Method R e o USE method para tirar adivinhação do meio. A regra é: formular hipótese → medir → otimizar o gargalo identificado → remedir. Sem medição, você está depurando o código errado.
        </p>
        <Callout tone="warn" icon="⚠️">
          Knuth escreveu "premature optimization is the root of all evil" em 1974, mas a citação completa continua: "Yet we should not pass up our opportunities in that critical 3%". O bug é pessoas otimizarem os outros 97% sem profiler.
        </Callout>
      </Section>

      <Section title="USE method — checklist por recurso" accent={accent}>
        <p>
          Para cada recurso (CPU, memória, disco, NIC), colete três números. O primeiro que estourar é o gargalo provável.
        </p>
        <CodeBlock lang="bash">{`# CPU
vmstat 1           # coluna r (runq) = saturation; us+sy = utilization
sar -u 1           # utilization %
dmesg | grep -i throttle   # errors

# Memória
free -m            # used vs available
vmstat 1           # si/so = swap in/out (saturation)
dmesg | grep -i oom

# Disco
iostat -xz 1       # %util, avgqu-sz (saturation), await (latency)
dmesg | grep -i "I/O error"

# Rede
sar -n DEV 1       # rxkB, txkB
ss -s              # sockets em estado TIME_WAIT / LISTEN overflow
nstat              # TcpExtListenOverflows, TcpRetransSegs (errors)`}</CodeBlock>
      </Section>

      <Section title="Latência: sempre distribuição, nunca média" accent={accent}>
        <p>
          Medir latência como média é erro de engenharia. Distribuição mostra a cauda — onde mora o problema. Gil Tene criou o HdrHistogram para registrar percentis sem perder resolução em bilhões de samples.
        </p>
        <CodeBlock lang="bash">{`# perf stat com latência de syscalls
sudo perf trace -s -- ./meu-app

# Gerar histograma de latência (wrk2 com HDR embedded)
wrk2 -t4 -c100 -d30s -R10000 --latency http://localhost:8080/

# Saída típica:
#   50.000%    2.14ms
#   90.000%    5.82ms
#   99.000%   48.31ms
#   99.900%  284.50ms    <- cauda
#   99.990%  612.00ms
# Se SLA é 100ms em p99, esse app falha.`}</CodeBlock>
        <Callout tone="info" icon="📊">
          Em fan-out (1 request =&gt; 10 backends), p99 de cada backend vira ~p90 agregado. Google SRE calcula: se cada serviço tem p99 de 10ms e fan-out é 100, a request final tem cauda de ~63ms. Conhecer isso evita &quot;mas meu p99 está bom&quot; quando o cliente reclama.
        </Callout>
      </Section>

      <Section title="Perf budget: número antes do código" accent={accent}>
        <p>
          Antes de otimizar, defina o budget. Quantos ms cabem no p99? Quantos bytes no payload? Se budget é 200ms e você gasta 180ms em rede, sobram 20ms para CPU. Budget transforma discussão subjetiva em checklist binário.
        </p>
        <CodeBlock lang="bash">{`# Exemplo de budget declarado
# SLA: /api/checkout p99 &lt; 300ms
#   - Network (client -&gt; LB -&gt; app): 40ms
#   - Auth middleware: 5ms
#   - DB query (idx hit):     15ms
#   - Payment gateway call:  180ms   &lt;- dominante
#   - Response serialize:     10ms
#   - Buffer (p99 variance):  50ms
#   Total budget: 300ms

# Medição real com perf stat ou eBPF mostra qual etapa estourou.`}</CodeBlock>
      </Section>

      <Section title="Amdahl vs Gustafson" accent={accent}>
        <p>
          Amdahl (1967) é pessimista: fração serial limita speedup. Gustafson (1988) observa que problemas reais crescem com hardware — se máquina dobra, dataset dobra e fração paralela vira dominante. Na prática, saber qual modelo aplica evita propor &quot;vou paralelizar&quot; onde a lei te trai.
        </p>
        <Callout tone="success" icon="✅">
          Checklist antes de paralelizar: (1) profiler mostrou onde está 80% do tempo? (2) essa parte é embarrassingly parallel ou tem sincronização? (3) quanto do trabalho é serial (I/O, lock, allocator)? Sem responder os 3, speedup prometido é fantasia.
        </Callout>
      </Section>

      <Section title="Referências honestas" accent={accent}>
        <p>
          Systems Performance 2ed (Brendan Gregg, 2020) é a bíblia. BPF Performance Tools (mesmo autor, 2019) para eBPF. &quot;How NOT to measure latency&quot; (Gil Tene, YouTube) muda como você vê percentis. Google SRE book cap. 4 define SLO/SLI com rigor.
        </p>
      </Section>
    </ModuleLayout>
  );
}
