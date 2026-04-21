import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-perf-investigacao-real');

const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o núcleo do writeup de perf investigation que vale pra portfolio?',
    options: [
      'Só o fix',
      'Hipótese explícita, evidência (flamegraph, perf stat, benchmark), root cause explicado com mecanismo (não só "era lento"), fix com justificativa, medição antes/depois com intervalo de confiança, limitações e trade-offs admitidos',
      'Código bruto',
      'Screenshots bonitos',
    ],
    correct: 1,
    explanation: 'Recruiter sênior busca raciocínio científico. Writeup forte mostra: problema mensurável -&gt; hipóteses alternativas consideradas -&gt; dados que descartaram erradas -&gt; fix que seguiu do mecanismo -&gt; delta medido com rigor. Estilo Gergely Orosz, Marc Brooker (AWS), Dan Luu — posts densos em dado, honestos em trade-off.',
  },
  {
    question: 'Como apresentar benchmark sem mentir?',
    options: [
      'Média de 3 runs',
      'Rodar N=30+ com warmup, reportar p50/p90/p99 com IC 95% (bootstrap ou t-test), descrever hardware e kernel, incluir workload generator reproduzível, idealmente rodar em máquina &quot;isolada&quot; (cpuset, tuned-adm latency-performance)',
      'Screenshot do melhor run',
      'Só o número final',
    ],
    correct: 1,
    explanation: 'Benchmarking honesto é difícil. Aleksey Shipilev (JMH author) e Brendan Gregg alertam contra: run único, sem warmup, sem controle térmico, máquina compartilhada. wrk2 fornece HDR histogram; JMH cuida de warmup/fork em JVM. Reportar distribuição + setup = confiável; média única = suspeito.',
  },
  {
    question: 'Qual diferencial de engineer que domina perf vs um que só &quot;otimiza&quot;?',
    options: [
      'Velocidade de digitação',
      'Método científico: mede primeiro, formula hipótese baseada em mecanismo (cache miss? lock? I/O?), testa com ferramenta certa, reporta honestamente mesmo quando fix não funcionou. Comunica trade-off (CPU vs memória, latência vs throughput)',
      'Saber mais linguagens',
      'Conhecer mais frameworks',
    ],
    correct: 1,
    explanation: 'Staff+ engineer em perf pensa como cientista: dados antes de opinião, mecanismo antes de heurística, humildade sobre incerteza. Diferença entre &quot;tentei 5 coisas, uma funcionou&quot; e &quot;hipótese A previa X, medi X em 3 cenários, fix seguiu, delta 2.3x ± 0.1 com p&lt;0.01&quot;. Segundo é o que vale carreira.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-perf-investigacao-real"
      title="Capstone: investigação de perf real"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Performance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Missão do capstone" accent={accent}>
        <p>
          Pegue um sistema com problema de performance real — pode ser produção própria, repo open source com issue de perf aberto (Postgres, Kafka, Redis, ClickHouse têm muitos), ou workload sintético reprodutível. Aplique o método completo da trilha e publique um writeup estilo Gergely Orosz / Dan Luu. Esse é o entregável que define engineer sênior de perf em 2026.
        </p>
      </Section>

      <Section title="Entregáveis obrigatórios" accent={accent}>
        <CodeBlock lang="bash">{`# Perf Investigation Capstone — checklist de entrega

## 1. Repo público
- README com problema, setup de reprodução (docker-compose ou make bench)
- Workload generator (wrk2, k6, ou script custom) versionado
- Hardware &amp; kernel descritos (/proc/cpuinfo, uname -a)

## 2. Baseline antes do fix
- perf stat output completo (IPC, cache-misses, branch-misses)
- Flamegraph on-CPU (SVG) em commit baseline
- Flamegraph off-CPU se aplicável
- Latency histogram (HDR) p50/p90/p99/p99.9

## 3. Investigação documentada
- Hipóteses consideradas (lista com justificativa de descarte)
- Ferramentas usadas (perf, async-profiler, bpftrace, py-spy, pprof)
- Mecanismo do root cause (cache line, lock, I/O sync, algoritmo)
- Por que esse mecanismo gera o sintoma observado

## 4. Fix
- PR ou patch com explicação
- Justificativa: por que esse fix resolve o mecanismo identificado
- Trade-off admitido (ex: fix usa mais memória)

## 5. Depois do fix
- perf stat novo
- Diff flamegraph (antes vs depois)
- Latency histogram novo
- Delta reportado com intervalo de confiança

## 6. Writeup
- Blog post ou README denso (estilo Gergely Orosz)
- Seções: Contexto, Sintoma, Investigação, Root cause, Fix, Resultados, Limitações
- Charts (matplotlib/Plotly) embutidos
- Links pro repo, PR, dashboards`}</CodeBlock>
      </Section>

      <Section title="Exemplos de target válidos" accent={accent}>
        <p>
          Qualquer um dos cenários abaixo rende capstone forte se investigação for rigorosa.
        </p>
        <CodeBlock lang="bash">{`# Opção A — repo open source com issue
# Postgres, ClickHouse, Kafka, Redis, Cassandra têm issues
# Exemplo: "SELECT com ORDER BY em tabela grande degrada após N rows"

# Opção B — microserviço próprio com gargalo
# App web que degradou sob carga, sem causa óbvia
# Use wrk2 ou k6 pra reproduzir

# Opção C — workload sintético específico
# Ex: "JSON parser em Go é 3x mais lento que em Rust — por quê?"
# Benchmark controlado, microbenchmark com profile completo

# Opção D — bug de escalabilidade
# Sistema escala linear até N threads, cai depois
# Classicamente: false sharing, lock contention, GC pressure`}</CodeBlock>
      </Section>

      <Section title="Template de workload + medição reproduzível" accent={accent}>
        <CodeBlock lang="bash">{`# Script de bench padronizado
#!/usr/bin/env bash
set -euo pipefail

TARGET=${'{'}TARGET:-http://localhost:8080/api${'}'}
DURATION=${'{'}DURATION:-60s${'}'}
RPS=${'{'}RPS:-5000${'}'}
THREADS=${'{'}THREADS:-8${'}'}

# Warmup
wrk2 -t$THREADS -c200 -d30s -R$RPS "$TARGET" &gt; /dev/null

# Medição real
wrk2 -t$THREADS -c200 -d$DURATION -R$RPS --latency "$TARGET" \\
  | tee results-$(date +%s).txt

# Simultaneamente coletar perf stat e flamegraph
sudo perf stat -d -p $(pgrep meu_app) sleep $DURATION &amp;
sudo perf record -F 99 -p $(pgrep meu_app) -g --call-graph dwarf \\
  -o perf-$(date +%s).data -- sleep $DURATION`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Isole a máquina: taskset/cpuset para pinar workload em cores específicos, tuned-adm profile latency-performance, desligue Turbo Boost se quer consistência, rode 3+ vezes e reporte variance. &quot;Statistics for Engineers&quot; (Heiner Litz) cobre bem.
        </Callout>
      </Section>

      <Section title="Estrutura do writeup (template)" accent={accent}>
        <CodeBlock lang="bash">{`# Título descritivo
"Reduzi p99 de 480ms para 90ms no serviço X — investigação completa"

## Contexto
1 parágrafo: qual sistema, qual workload, qual SLA.

## Sintoma
- Latency histogram inicial
- &quot;Normal até 3000 RPS, p99 explode depois&quot;
- CPU em 40% (não era CPU-bound)

## Hipóteses consideradas
1. GC pressure — descartada por JFR (GC &lt; 2% tempo)
2. DB slow query — descartada por pg_stat_statements (queries &lt; 5ms)
3. Lock contention — CONFIRMADA por async-profiler -e lock

## Root cause (com mecanismo)
Método synchronized em ConnectionPool.getConnection() virou bottleneck.
Explicação do mecanismo: cada request pega lock global, 3000 RPS * 4ms
= 12000ms de lock time/s em 8 cores = 1.5x saturation.

## Fix
Substituído por HikariCP (lock-striped pool).
PR: [link]

## Resultados
- p50: 12ms -&gt; 11ms (esperado, lock não dominava média)
- p99: 480ms -&gt; 90ms (5.3x melhoria)
- Throughput pico: 3200 RPS -&gt; 11000 RPS
- Variance: ± 3ms em p99, n=30 runs

## Limitações / trade-offs
- HikariCP usa 40MB extras de heap
- Não testei sob failover de DB
- Resultado pode variar com workload bursty

## Próximos passos
- Investigar p99.9 (ainda em 200ms)
- Avaliar impacto em cold start`}</CodeBlock>
      </Section>

      <Section title="Referências que elevam seu writeup" accent={accent}>
        <p>
          Para inspiração de formato: Gergely Orosz (pragmaticengineer.com), Dan Luu (danluu.com), Marc Brooker (brooker.co.za), Brendan Gregg (brendangregg.com), Tanel Poder (tanelpoder.com). Todos escrevem perf writeups densos em dado e honestos em limitação. Ler 5 deles antes de escrever o seu é investimento que se paga.
        </p>
        <Callout tone="success" icon="🎓">
          Capstone aprovado = você consegue pegar sistema lento arbitrário, aplicar método científico, entregar fix mensurável e comunicar de forma que outro engineer reproduza. Esse é exatamente o skillset que Staff+ em Netflix, Meta, Cloudflare, Stripe e AWS busca em perf engineering em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
