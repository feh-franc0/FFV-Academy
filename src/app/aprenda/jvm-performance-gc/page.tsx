import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('jvm-performance-gc');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando trocar G1 por ZGC faz diferença mensurável?',
    options: [
      'Sempre que der',
      'Quando pause-time p99 > 50 ms já é gargalo do seu SLO — ZGC mantém pauses sub-10 ms mesmo em heap de 100 GB, custando um pouco mais de CPU e throughput',
      'Em apps CPU-bound',
      'Em batch',
    ],
    correct: 1,
    explanation: 'G1 é default balanced: pauses de dezenas de ms em heap médio. ZGC é colector concorrente com pauses sub-10 ms mesmo em heap grande. O custo é ~5–15% de throughput e um pouco mais de CPU. Vale quando latency p99 importa (trading, gaming, latência de API crítica).',
  },
  {
    question: 'JFR (Flight Recorder) é adequado para produção?',
    options: [
      'Não, custa caro',
      'Sim — overhead <2% no perfil default, streaming contínuo, rotação circular de arquivos e análise depois no Mission Control. É a forma canônica de profiling em JVM moderna',
      'Só em dev',
      'Só com flag -XX:+DebugAll',
    ],
    correct: 1,
    explanation: 'JFR foi feito para ser always-on em produção. Overhead mínimo no profile default. Ligar com -XX:+FlightRecorder -XX:StartFlightRecording=filename=app.jfr,maxsize=1g,maxage=24h. Abre no JMC (Mission Control) e gera análise de alocações, lock contention, CPU hotspots.',
  },
  {
    question: 'O que JIT C2 faz que C1 não faz?',
    options: [
      'Nada',
      'C1 compila rápido com otimizações básicas; C2 recompila métodos hot com otimizações agressivas (inlining profundo, escape analysis, loop unrolling) — é o tiered compilation que a JVM usa por default',
      'Só garbage collect',
      'Gera bytecode',
    ],
    correct: 1,
    explanation: 'Tiered compilation: interpretar → C1 (client compiler) → C2 (server compiler, profile-guided). C2 entra quando o método atinge threshold de chamadas. Por isso Java "esquenta" — em benchmark curto, você mede C1; em produção steady-state, mede C2, que muitas vezes rivaliza com C otimizado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="jvm-performance-gc"
      title="JVM performance: G1, ZGC, Shenandoah"
      icon="⚡"
      xp={60}
      readTime={14}
      trailName="Java Moderno (17/21 LTS)"
      trailColor={accent}
      nextSlug="capstone-spring-boot-production"
      nextTitle="Capstone: serviço Spring Boot production-ready"
      quiz={quiz}
    >
      <Section title="GC não é commodity" accent={accent}>
        <p>
          JVM moderna (17/21) oferece três coletores sérios: G1 (default), ZGC (pauses sub-10 ms) e Shenandoah (Red Hat, sub-10 ms). A escolha depende do SLO de latência. Rodar sempre no default é deixar performance na mesa quando p99 importa.
        </p>
      </Section>

      <Section title="Como decidir" accent={accent}>
        <CodeBlock lang="bash">{`# G1 (default)
-XX:+UseG1GC
# Pause típica: 10-50 ms (depende do heap)
# Bom para heap 4-32 GB, throughput balanceado

# ZGC (Java 15+ production)
-XX:+UseZGC
# Pause p99: < 10 ms, mesmo em heap 100+ GB
# Custo: ~5-15% throughput

# Shenandoah (OpenJDK)
-XX:+UseShenandoahGC
# Concorrente, sub-10ms
# Throughput ~= ZGC`}</CodeBlock>
      </Section>

      <Section title="Flags que importam em 2026" accent={accent}>
        <CodeBlock lang="bash">{`# Heap
-Xms4g -Xmx4g               # fixe min=max pra evitar resize pause
-XX:MaxRAMPercentage=75.0   # em container, respeite cgroup

# GC logs (formato unificado desde Java 9)
-Xlog:gc*,gc+heap=debug:file=gc.log:time,uptime:filecount=10,filesize=20m

# Flight Recorder always-on
-XX:+FlightRecorder
-XX:StartFlightRecording=filename=app.jfr,maxsize=1g,maxage=24h,settings=profile

# Container
-XX:+UseContainerSupport
-XX:+ExitOnOutOfMemoryError`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          -Xmx sem -Xms ativo causa resize e pauses. -XX:+HeapDumpOnOutOfMemoryError é barato em staging e caro em produção — deixe condicional.
        </Callout>
      </Section>

      <Section title="JFR + JMC, o fluxo real de profiling" accent={accent}>
        <CodeBlock lang="bash">{`# 1. Liga JFR em produção (overhead <2%)
java -XX:StartFlightRecording=duration=5m,filename=prod.jfr App

# 2. Copia arquivo
scp prod-host:/app/prod.jfr .

# 3. Abre no Mission Control (gratuito)
jmc prod.jfr

# Telas úteis:
# - Method Profiling (CPU hotspots)
# - Memory > Allocation in New TLAB (alocação por stack)
# - Lock Instances (contention)
# - Garbage Collections (pause breakdown)`}</CodeBlock>
      </Section>

      <Section title="JIT: o segredo do steady-state" accent={accent}>
        <p>
          Java começa interpretado, C1 compila rápido com otimização básica, C2 entra em hot path com inlining agressivo e escape analysis. Warmup demora 10–60 s em serviço real. Por isso benchmark curto mente. Em produção, deixe o serviço receber tráfego de teste antes de medir latência de interesse.
        </p>
        <Callout tone="info" icon="💡">
          CDS (Class Data Sharing) e AppCDS diminuem warmup pré-aquecendo archive. GraalVM native image pula o warmup mas perde JIT adaptativo — em steady-state alto, JVM tradicional com C2 costuma ganhar.
        </Callout>
      </Section>

      <Section title="Métricas para observar" accent={accent}>
        <Callout tone="success" icon="✅">
          p99 pause GC, count de Full GC (deve ser zero em steady-state), allocation rate (MB/s), survivor ratio, e tempo em Safepoint. Micrometer expõe tudo isso; dashboard pronto em Grafana cobre 90% dos casos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
