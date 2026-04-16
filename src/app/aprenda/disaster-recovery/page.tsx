import type { Metadata } from 'next';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  Timeline,
  NodeGraph,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Disaster Recovery: RPO, RTO e 4 Estratégias — SAA-C03',
  description: 'Disaster Recovery para SAA-C03: conceitos RPO/RTO, as 4 estratégias (Backup & Restore, Pilot Light, Warm Standby, Multi-Site), AWS Backup, Route 53 failover e testes de DR.',
  keywords: 'disaster recovery, RPO, RTO, pilot light, warm standby, multi-site, backup, SAA-C03',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Negócio tolera no máximo 15 minutos de dados perdidos (RPO) e 1 hora para voltar online (RTO). Qual estratégia de DR é adequada com menor custo?',
    options: [
      'Backup & Restore',
      'Pilot Light',
      'Warm Standby',
      'Multi-Site Active-Active',
    ],
    correct: 2,
    explanation: 'Warm Standby tem stack reduzida rodando na região secundária com dados replicados. RPO de segundos/minutos e RTO de minutos. Backup & Restore teria RTO de horas. Pilot Light tem RPO baixo mas RTO de 10–30min — pode não bater 1h dependendo da complexidade. Multi-Site Active-Active resolve mas é mais caro do que necessário.',
  },
  {
    question: 'RDS em Multi-AZ já é DR?',
    options: [
      'Sim, Multi-AZ é considerada DR completa',
      'Não, Multi-AZ é HA dentro de uma região. DR exige cross-region',
      'Apenas se combinado com Read Replica na mesma AZ',
      'Depende do RPO',
    ],
    correct: 1,
    explanation: 'Multi-AZ protege contra falha de AZ (ex: queda de data center) dentro da mesma região AWS. Se a região inteira sair do ar (raro mas possível), Multi-AZ não ajuda. DR exige replicação cross-region: Read Replica cross-region, Aurora Global Database, snapshots copiados, ou Backup com cópia para outra região.',
  },
  {
    question: 'Qual serviço AWS fornece orquestração centralizada de backups de múltiplos serviços (EBS, RDS, DynamoDB, EFS, FSx) com policies unificadas?',
    options: [
      'AWS Backup',
      'AWS Elastic Disaster Recovery (DRS)',
      'Data Lifecycle Manager',
      'AWS Storage Gateway',
    ],
    correct: 0,
    explanation: 'AWS Backup unifica backups de EBS, RDS, DynamoDB, EFS, FSx, Storage Gateway, VMware, S3 com backup plans centralizados, retention, cross-region/cross-account copy e compliance reports. DLM é especificamente EBS snapshots. DRS é recuperação de servers on-prem. Storage Gateway é bridge híbrida, não orquestrador.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="disaster-recovery"
      title="Disaster Recovery: RPO, RTO e 4 Estratégias"
      icon="🆘"
      xp={70}
      readTime={13}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="cost-optimization-saa"
      nextTitle="Otimização de Custos: RI, Savings Plans, Spot"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        DR não é &ldquo;fazer backup&rdquo;. É a capacidade de reconstruir a operação após desastre maior (região AWS offline,
        ataque ransomware, deleção massiva). Negócio define duas constantes: <strong>RPO</strong> (quanta perda de
        dado é aceitável) e <strong>RTO</strong> (quanto tempo pode ficar fora). Essas duas medidas direcionam qual das
        4 estratégias implementar.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="Resilient" weight="26%" color={ACCENT} />
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
      </div>

      <Section title="Definições que caem no exame" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'RPO (Recovery Point Objective)', v: 'Quanto de DADO você pode perder. Se RPO = 1h, backup deve rodar pelo menos a cada hora.' },
            { k: 'RTO (Recovery Time Objective)', v: 'Quanto TEMPO máximo para restaurar operação. Se RTO = 30min, restore e failover devem completar nesse prazo.' },
            { k: 'BCP (Business Continuity Plan)', v: 'Plano amplo incluindo processos humanos, comunicação com clientes. DR é a parte técnica.' },
            { k: 'MTBF / MTTR', v: 'Mean Time Between Failures / Mean Time To Recover — métricas operacionais.' },
          ]}
        />
        <Timeline
          title="Linha do tempo do desastre"
          accent={ACCENT}
          events={[
            { when: 't = -RPO', label: 'Último backup válido', detail: 'Dados replicados/backupeados até esse momento. Tudo depois será perdido se o desastre ocorrer agora.' },
            { when: 't = 0', label: 'Desastre', detail: 'Sistema cai. Janela de dados perdidos = RPO. Começa a contagem do RTO.', highlight: true },
            { when: 't = +RTO', label: 'Sistema restaurado', detail: 'Operação volta. Janela entre desastre e restore = RTO. Tempo máximo aceitável pelo negócio.' },
          ]}
        />
      </Section>

      <Section title="As 4 estratégias de DR" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'RPO típico', 'RTO típico', 'Custo', 'Como funciona']}
          rows={[
            ['Backup & Restore', 'horas', 'horas', '$', 'Backups regulares para outra região. Restaurar infra + dados sob demanda.'],
            ['Pilot Light', 'minutos', '10–30 min', '$$', 'Dados replicados + infra crítica mínima rodando. Escala em disaster.'],
            ['Warm Standby', 'segundos–minutos', 'minutos', '$$$', 'Stack funcional com capacidade reduzida. Failover + scale up.'],
            ['Multi-Site Active-Active', '~zero', 'segundos', '$$$$', 'Duas (ou mais) regiões rodando plena capacidade, balanceando tráfego.'],
          ]}
        />
        <NodeGraph
          title="Infraestrutura rodando na região secundária"
          accent={ACCENT}
          legend="Quanto mais à direita, mais rápida (e mais cara) a recuperação"
          columns={[
            {
              label: 'Backup & Restore',
              nodes: [
                { icon: '📦', label: 'Só snapshots', sub: 'Secondary vazia', tone: 'muted' },
                { icon: '⏳', label: 'Construir do zero', sub: 'RTO: horas', tone: 'muted' },
              ],
            },
            {
              label: 'Pilot Light',
              nodes: [
                { icon: '🔥', label: 'DB replicando', sub: 'AMIs prontas' },
                { icon: '⚡', label: 'Acender resto', sub: 'RTO: 10-30 min' },
              ],
            },
            {
              label: 'Warm Standby',
              nodes: [
                { icon: '♨️', label: 'App rodando ~20%', sub: 'Capacidade reduzida', tone: 'emphasis' },
                { icon: '📈', label: 'Só scale up', sub: 'RTO: minutos', tone: 'emphasis' },
              ],
            },
            {
              label: 'Multi-Site Active',
              nodes: [
                { icon: '🚀', label: '100% ativa', sub: 'Recebendo tráfego', tone: 'success' },
                { icon: '⚡', label: 'Zero downtime', sub: 'RTO: segundos', tone: 'success' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Backup & Restore — simples e barato" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'O que replicar', v: 'Snapshots EBS, RDS automated backups, DynamoDB PITR ou backups, S3 com Replication ou Versioning + Cross-Region.' },
            { k: 'Como', v: 'AWS Backup com cross-region copy. Data Lifecycle Manager para EBS. S3 CRR. Aurora automated backups replicam cross-region.' },
            { k: 'Testar', v: 'Exercício trimestral: restaurar snapshot, validar, derrubar. Sem teste, RTO "real" pode virar dias.' },
            { k: 'Usado quando', v: 'Dados não-críticos; negócios que toleram horas fora; dev/staging.' },
          ]}
        />
      </Section>

      <Section title="Pilot Light — mínimo aquecido" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Metáfora: chama mínima aguardando para acender o resto. Banco replicando em tempo real, AMIs prontas, mas sem
          instâncias rodando (exceto DB). Em caso de desastre, escalar compute layer rapidamente.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Data layer', v: 'RDS cross-region read replica; Aurora Global Database; DynamoDB Global Tables.' },
            { k: 'Compute', v: 'AMIs atualizadas + Launch Templates prontos + ASG com desired=0.' },
            { k: 'Network', v: 'VPC + subnets + SGs já provisionados via IaC (CloudFormation/CDK).' },
            { k: 'Trigger', v: 'Route 53 health check + failover record OU operação manual pela runbook.' },
          ]}
        />
      </Section>

      <Section title="Warm Standby — stack reduzida ativa" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Secondary região tem aplicação rodando com capacidade reduzida (ex: 20% da primary). Pode receber tráfego de
          teste constante (canary). Em failover, Route 53 muda DNS e ASG escala para capacidade total.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Vantagem', v: 'RTO de minutos, confiança alta (stack já testada).' },
            { k: 'Trade-off', v: 'Custo permanente ~25% da primary.' },
            { k: 'Padrão', v: 'ALB + ASG + RDS read replica + S3 CRR + Route 53 failover com TTL baixo.' },
          ]}
        />
      </Section>

      <Section title="Multi-Site Active-Active — zero downtime" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Duas regiões em capacidade plena, balanceando tráfego via Route 53 (latency/geo routing) ou Global Accelerator.
          Se uma cair, a outra absorve tudo. Exige data layer multi-master (DynamoDB Global Tables, Aurora Global com
          promotion rápida ou eventual consistency tolerada).
        </p>
        <Callout tone="warn">
          <strong>Trade-off crítico:</strong> Multi-Site é caro (2× infra) e introduz complexidade de consistência
          (conflict resolution em Global Tables, last-writer-wins). Use só quando RTO = segundos é requisito de negócio
          (financeiro crítico, trading, saúde).
        </Callout>
      </Section>

      <Section title="AWS Backup — o orquestrador" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Backup Plans', v: 'Regras declarativas (frequência, retention, lifecycle para cold storage).' },
            { k: 'Recursos cobertos', v: 'EBS, RDS, Aurora, DynamoDB, EFS, FSx, Storage Gateway, VMware, EC2 (completo), S3, Neptune, DocumentDB, Redshift.' },
            { k: 'Backup Vault', v: 'Repositório lógico com policies + encryption KMS.' },
            { k: 'Vault Lock', v: 'WORM para backups — compliance SEC 17a-4. Ninguém, nem root, pode deletar antes do prazo.' },
            { k: 'Cross-region', v: 'Copy rule no plan. Backup original + réplica em outra região.' },
            { k: 'Cross-account', v: 'Delegated account em Organizations recebe cópias centralmente. Isola backups de ataques à conta de produção.' },
            { k: 'Backup Audit Manager', v: 'Relatórios de compliance (quem está protegido, que não está).' },
          ]}
        />
      </Section>

      <Section title="Route 53 — o DNS que faz failover" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Health Checks', v: 'Monitora endpoint (TCP/HTTP/HTTPS). Pode usar CloudWatch alarm como fonte.' },
            { k: 'Failover routing', v: 'Primary + secondary records. Se primary unhealthy, responde secondary.' },
            { k: 'TTL baixo', v: 'Diminua TTL antes do maintenance para acelerar propagação do failover (60s comum).' },
            { k: 'Multi-value answer', v: 'Retorna até 8 IPs saudáveis. Client-side load balance rudimentar.' },
            { k: 'Geolocation / Latency', v: 'Roteia para região mais próxima / menor latência. Fallback se regional unhealthy.' },
          ]}
        />
      </Section>

      <Section title="AWS Elastic Disaster Recovery (DRS)" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          DRS replica continuamente servers on-premises ou em outra cloud para EC2 dormente. Em failover, lança as
          instâncias replicadas. RPO em segundos, RTO em minutos. Custo baixo pois compute só roda em drill/failover.
        </p>
        <Callout tone="info">
          <strong>Evolução do CloudEndure:</strong> DRS substituiu CloudEndure Disaster Recovery. É a ferramenta
          recomendada para DR de workloads x86 on-prem para AWS.
        </Callout>
      </Section>

      <Section title="Cenários arquiteturais comuns" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Plataforma de saúde — nunca pode perder consulta marcada (RPO ~0) e tolera 2 minutos de downtime"
          winner="Aurora Global Database + Multi-Site Active-Passive com Route 53 failover"
          why="Aurora Global RPO <1s. Multi-Site garante infra já provisionada. Route 53 com health check automatiza switch."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Blog de conteúdo — tolera 24h de dados perdidos e 4h offline"
          winner="Backup & Restore com AWS Backup + cross-region copy"
          why="Baixo custo, RPO/RTO folgados. Blog pode ser restaurado do snapshot."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Data center on-prem com 50 VMs críticas, negócio quer migrar DR para AWS"
          winner="AWS Elastic Disaster Recovery (DRS)"
          why="DRS replica continuamente para EC2 dormente. Drill de failover sem impactar primary. Custo baixo até ativar."
        />
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="Como reduzir RTO em cenário Pilot Light que hoje leva 45min?"
          a={
            <span>
              Automatize o playbook com CloudFormation/CDK + SSM Automation. Pre-warm AMIs (copiadas ao invés de
              construídas). Reduza Route 53 TTL. Mantenha ASG com min &gt; 0 (convertendo para Warm Standby).
            </span>
          }
        />
        <QAItem
          q="AWS Backup vs snapshot nativo: quando escolher qual?"
          a={
            <span>
              Para orquestração multi-serviço + compliance + cross-region/cross-account, AWS Backup ganha. Para um
              volume EBS isolado, Data Lifecycle Manager (snapshots nativos) é suficiente e mais simples.
            </span>
          }
        />
        <QAItem
          q="Como testar DR sem impactar produção?"
          a={
            <span>
              Game day: failover planejado em janela fora de pico, medindo RTO real. AWS Backup permite restore em
              vault separado. DRS tem recovery drills com ambiente isolado.
            </span>
          }
        />
        <QAItem
          q="Route 53 failover respondeu secondary mesmo com primary healthy. Por quê?"
          a={
            <span>
              Health check pode ter falso-positivo (timeout baixo, network hiccup). Aumente threshold de failures e o
              intervalo. Check de HTTPS em endpoint privado pode falhar se sem rota pública.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas:</strong> (1) Multi-AZ ≠ DR — é HA intra-region; (2) Backup não testado = backup não existe;
        (3) RPO não é frequência de backup, é &ldquo;quanto pode perder&rdquo;; (4) failover manual tem RTO enorme — automatize;
        (5) eventual consistency em Global Tables pode gerar dados divergentes em multi-site.
      </Callout>

      <Callout tone="success">
        <strong>Take-aways:</strong> mapeie negócio → RPO/RTO → estratégia. Backup & Restore barato mas lento; Pilot
        Light e Warm Standby ótimo custo-benefício; Multi-Site para SLA crítico. Use AWS Backup centralizado, Route 53
        health check para failover, e TESTE trimestralmente.
      </Callout>
    </div>
  );
}
