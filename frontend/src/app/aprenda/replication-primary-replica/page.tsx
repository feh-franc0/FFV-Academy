import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('replication-primary-replica');

const accent = '#336791';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre streaming e logical replication?',
    options: [
      'Nomes',
      'Streaming: envia WAL binário row-by-row, replica é CÓPIA quase idêntica. Logical: decoded WAL pra formato semântico, permite selective (tabela-a-tabela), cross-version, cross-engine. CDC usa logical',
      'Streaming é deprecated',
      'Logical é mais lento',
    ],
    correct: 1,
    explanation: 'Streaming (physical): byte-a-byte da WAL. Replica precisa mesma major version. Failover fácil — promote replica = primary. Logical: decode WAL em INSERT/UPDATE/DELETE declaravos. Permite replicar SOMENTE table X, cross-version, usar pra CDC (Debezium, pgsync). Em 2026 logical ganhou space.',
  },
  {
    question: 'O que synchronous_commit = on garante?',
    options: [
      'Nada especial',
      'Que COMMIT não retorna até WAL ser FLUSHED em replica(s). Garante zero dataloss em failover. Trade: latency adicional',
      'Replication off',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'synchronous_commit = on (default): espera replica ACK antes de retornar commit. Zero RPO. Trade: se replica cai, commits travam. synchronous_standby_names controla quais replicas entram no quorum. remote_apply ainda mais rigoroso: replica aplicou tx. off = async (padrão em PG 9.1-, risk dataloss em crash primary).',
  },
  {
    question: 'O que é split-brain em replication?',
    options: [
      'Bug',
      'Quando primary perde contato com replica mas ambos acham que são master — cada um aceita writes, divergem. Causa data inconsistency impossível de reconciliar. STONITH (shoot the other in the head) é pattern pra evitar',
      'Deprecated',
      'Só em MySQL',
    ],
    correct: 1,
    explanation: 'Split-brain é pesadelo. Rede particiona, ambos nós acham que são primary, commits divergem. Soluções: quorum (3+ nodes, só majoritário manda), fencing (STONITH — matar o outro antes de assumir), Patroni com DCS (etcd/Consul) pra consenso. Nunca tente construir failover manual em prod.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="replication-primary-replica"
      title="Replication: streaming, logical, failover"
      icon="🔁"
      xp={55}
      readTime={13}
      trailName="Database Deep — Postgres Internals"
      trailColor={accent}
      nextSlug="particionamento-e-sharding"
      nextTitle="Particionamento e sharding: quando e como"
      quiz={quiz}
    >
      <Section title="Tipos comparados" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Streaming (physical)', 'Logical']}
          rows={[
            ['Granularidade', 'Cluster inteiro', 'Tabela/schema selecionável'],
            ['Major version', 'Deve bater', 'Cross-version OK'],
            ['Latency', 'Muito baixa', 'Baixa (decode overhead)'],
            ['Use case', 'Standby pra failover', 'CDC, ETL, multi-master'],
            ['Failover fácil', '✅', 'Extra setup'],
            ['DDL replicado', '✅ auto', '❌ manual'],
          ]}
        />
      </Section>

      <Section title="synchronous_commit options" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>off</strong>: commit retorna imediatamente, WAL async — rápido mas pode perder tx em crash</li>
          <li><strong>local</strong>: espera local WAL flush (default se async replica)</li>
          <li><strong>remote_write</strong>: espera replica receber (não aplicar ainda)</li>
          <li><strong>on / remote_flush</strong>: espera replica FLUSH pra disk</li>
          <li><strong>remote_apply</strong>: espera replica APLICAR + query nela vê</li>
        </ul>
      </Section>

      <Section title="Failover com Patroni" accent={accent}>
        <Callout tone="info" icon="💡">
          Patroni é o solution moderno: high availability + automatic failover pra Postgres. Usa etcd/Consul/ZooKeeper como DCS (Distributed Configuration Store). Detecta primary down, elege novo via consenso, promote replica, reconfigura replication. Opsmanuais: nuncA. stolon é alternativa similar.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
