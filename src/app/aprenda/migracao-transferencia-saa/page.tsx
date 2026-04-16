import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Migração para o Arquiteto AWS: DMS, SCT, MGN e DRS — FFV Academy',
  description: 'Padrões arquiteturais de migração para o SAA-C03: DMS + Schema Conversion Tool, AWS MGN lift-and-shift, AWS DRS, DataSync, Transfer Family e Snow Family.',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa precisa migrar 50 TB de um banco Oracle on-prem com ~1000 stored procedures para Aurora PostgreSQL com downtime ≤ 15 minutos. Qual arquitetura funciona?',
    options: [
      'Dump com pg_dump e restore em Aurora',
      'DMS homogêneo direto',
      'SCT para converter schema + DMS com full-load + CDC, cutover após lag zerar',
      'MGN para replicar o servidor Oracle e reconfigurar',
    ],
    correct: 2,
    explanation: 'Migração heterogênea (Oracle → PostgreSQL) exige SCT para converter schema + stored procedures. DMS faz full-load inicial e depois CDC (Change Data Capture) replicando alterações. Cutover é feito quando o lag de CDC estabiliza em zero. MGN não traduz o dialeto SQL. pg_dump não entende Oracle.',
  },
  {
    question: 'Sua empresa quer um DR cross-region com RPO de segundos e RTO de minutos, para workloads EC2 críticas on-prem e em outra região AWS. Qual serviço?',
    options: [
      'AWS Backup com cross-region copy',
      'AWS Elastic Disaster Recovery (DRS)',
      'AWS DataSync',
      'EBS Snapshots manuais',
    ],
    correct: 1,
    explanation: 'AWS DRS (ex-CloudEndure DR) replica continuamente volumes de EC2/on-prem para uma região de destino, mantendo instâncias em standby de baixo custo. RPO de segundos, RTO de minutos. Failover e failback são gerenciados. Backup é para recuperação pontual (RPO/RTO maiores).',
  },
  {
    question: 'Você precisa manter 50 usuários remotos trocando arquivos via SFTP com buckets S3 sem gerenciar servidor EC2. Qual serviço?',
    options: [
      'AWS DataSync',
      'AWS Transfer Family',
      'AWS Storage Gateway',
      'Amazon FSx for OpenZFS',
    ],
    correct: 1,
    explanation: 'AWS Transfer Family oferece SFTP, FTPS e FTP totalmente gerenciados com endpoint público ou privado, integrando com S3 e EFS. Sem EC2. DataSync é para transferências agendadas; Storage Gateway é gateway híbrido com iSCSI/NFS/SMB; FSx é file system.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="migracao-transferencia-saa"
      title="Migração para o Arquiteto: DMS, SCT, MGN e DRS"
      icon="🚚"
      xp={65}
      readTime={12}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="rede-hibrida-saa"
      nextTitle="Rede Híbrida: Direct Connect, VPN, PrivateLink e VPC Endpoints"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        No Practitioner vimos os serviços de migração na altura do nome. Aqui vamos ao nível em que o SAA-C03 cobra: <strong>padrões arquiteturais</strong>.
        Qual combinação de MGN + DMS + DataSync faz sentido pra um cenário específico? Como dimensionar replication instance do DMS? Quando usar DRS em vez de
        Backup para DR? Qual a diferença real entre Transfer Family, DataSync e Storage Gateway? Essas decisões são o coração do domínio <em>Resilient</em> +
        <em> Cost-Optimized</em> do exame.
      </p>

      <ExamDomainBadge domain="Resilient + Cost-Optimized" weight="~26% + 20% do SAA-C03" color={ACCENT} />

      <Section title="As 7 estratégias (7 Rs) — o framework" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'O que faz', 'Esforço', 'Exemplo']}
          rows={[
            ['Retire', 'Descontinua a aplicação', 'Nenhum', 'App legado sem uso'],
            ['Retain', 'Mantém on-prem por ora', 'Nenhum', 'Sistema com compliance restrita'],
            ['Rehost', 'Lift-and-shift para EC2', 'Baixo', 'MGN replica VM para EC2 sem mudar código'],
            ['Relocate', 'Move hypervisor para AWS sem mudanças', 'Baixo', 'VMware Cloud on AWS'],
            ['Replatform', 'Lift-and-reshape com pequenas otimizações', 'Médio', 'Oracle em EC2 → Aurora PostgreSQL'],
            ['Repurchase', 'Migra para SaaS', 'Médio', 'CRM custom → Salesforce'],
            ['Refactor', 'Reescreve cloud-native', 'Alto', 'Monolito Java → Lambda + DynamoDB'],
          ]}
        />
        <Callout tone="info">
          O exame cobra muito a diferença <strong>Rehost vs Replatform vs Refactor</strong> — quase sempre aparece num caso de uso com restrição de tempo ou
          budget. Menor esforço = Rehost. Melhor custo-benefício a médio prazo = Replatform. Melhor longo prazo e elasticidade = Refactor.
        </Callout>
      </Section>

      <Section title="DMS + SCT: migração de bancos heterogêneos" accent={ACCENT}>
        <ArchDiagram title="DMS + SCT + CDC" accent={ACCENT}>{`
  On-prem Oracle                                  AWS Aurora PostgreSQL
  ┌──────────────┐                                ┌──────────────┐
  │   Source     │    1. SCT converte schema      │   Target     │
  │   Database   │ ─────────────────────────────→ │  (pronto)    │
  └──────┬───────┘                                └──────┬───────┘
         │                                               ▲
         │  2. DMS Full Load (dados iniciais)            │
         └─────────────────────────────────────────────→ │
         │                                               │
         │  3. DMS CDC (change data capture contínuo)    │
         └─────────────────────────────────────────────→ │
         │                                               │
         │  4. Cutover quando lag de CDC = 0             │
         └─── redireciona aplicação ────────────────────→
        `}</ArchDiagram>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Papel']}
          rows={[
            ['SCT (Schema Conversion Tool)', 'Converte schema, stored procedures, triggers, views, índices entre dialetos (Oracle → PostgreSQL, SQL Server → Aurora MySQL, etc.). Gera assessment report com tudo que precisa conversão manual.'],
            ['DMS Replication Instance', 'EC2 gerenciada que executa o job. Dimensionar: memória para tabelas largas, rede para alto throughput. Classes dms.r5/r6 para heavy workloads.'],
            ['DMS Task Full Load', 'Carga inicial das tabelas. Pode rodar em paralelo (LOB mode: inline, full, limited).'],
            ['DMS Task CDC', 'Replica log transacional (redo log Oracle, binlog MySQL) em tempo quase-real.'],
            ['DMS Fleet Advisor', 'Recomenda dimensionamento e estima custo a partir de métricas do banco origem.'],
          ]}
        />
        <Callout tone="warn">
          Armadilha: DMS <strong>não migra</strong> stored procedures em migração heterogênea. SCT é obrigatório antes. Em migração homogênea
          (Oracle → Oracle), SCT é opcional e você pode usar <InlineCode>native tools</InlineCode> (Data Pump) combinado com DMS CDC.
        </Callout>
      </Section>

      <Section title="AWS MGN: lift-and-shift em escala" accent={ACCENT}>
        <p>
          MGN (Application Migration Service) substitui o antigo SMS/CloudEndure Migration. Replica servidores inteiros (Windows/Linux, VMware/Hyper-V/físico)
          para AWS com downtime mínimo. Fluxo:
        </p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Instala <strong>replication agent</strong> no servidor origem</li>
          <li>Replica blocos para área de staging (EBS) na AWS continuamente</li>
          <li>Configura <strong>Launch Template</strong> (instance type, VPC, SG, IAM profile)</li>
          <li><strong>Test launch</strong>: sobe EC2 de teste a partir da réplica sem afetar produção</li>
          <li><strong>Cutover</strong>: janela de manutenção, sobe EC2 final, redireciona tráfego</li>
        </ol>
        <Callout tone="info">
          Os primeiros <strong>90 dias de replicação são gratuitos</strong> — paga só EBS + EC2 do teste. MGN também pode ser usado como DR barato (manter
          réplicas em standby).
        </Callout>
      </Section>

      <Section title="AWS DRS: Disaster Recovery contínuo" accent={ACCENT}>
        <p>
          AWS Elastic Disaster Recovery (ex-CloudEndure DR) é o <strong>primo do MGN</strong> focado em DR. Diferença prática:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'MGN (migração)', 'DRS (DR)']}
          rows={[
            ['Objetivo', 'Uma vez — cutover e parar', 'Contínuo — failover sempre disponível'],
            ['Custo', 'Grátis 90 dias + EBS staging', 'Contínuo: EBS staging pequeno + licenças'],
            ['RTO', 'Minutos no cutover', 'Minutos no failover'],
            ['RPO', 'Segundos', 'Segundos (sub-segundo em média)'],
            ['Failback', '—', 'Sim — volta para origem após incidente'],
          ]}
        />
        <Callout tone="success">
          DRS é a recomendação atual da AWS para DR de EC2 e on-prem em Pilot Light / Warm Standby. Para <strong>Backup &amp; Restore</strong> pura use AWS
          Backup. Para <strong>Multi-Site Active/Active</strong> use replicação nativa do banco (Aurora Global, DynamoDB Global Tables).
        </Callout>
      </Section>

      <Section title="Transferência de dados: matriz de decisão" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Uso', 'Protocolo / Interface']}
          rows={[
            ['DataSync', 'Transferência contínua/agendada on-prem ↔ AWS ou AWS ↔ AWS', 'NFS, SMB, HDFS, S3, EFS, FSx'],
            ['Storage Gateway — File Gateway', 'Expor buckets S3 localmente como NFS/SMB (cache local)', 'NFS v3/v4.1, SMB'],
            ['Storage Gateway — Volume Gateway', 'Volume iSCSI respaldado por S3 (cache ou stored mode)', 'iSCSI'],
            ['Storage Gateway — Tape Gateway', 'Substitui tape library física (VTL backup)', 'iSCSI VTL'],
            ['Storage Gateway — FSx File Gateway', 'Acesso cache local a shares FSx for Windows', 'SMB'],
            ['Transfer Family', 'Usuários externos trocando arquivos via SFTP/FTPS/FTP/AS2', 'SFTP, FTPS, FTP, AS2'],
            ['Snowball Edge', 'Transferir PB sem rede — appliance que AWS envia', 'NFS · S3 API local'],
            ['Snowcone', 'Edge compute + storage leve (2TB SSD · 8TB HDD)', 'NFS · batch'],
            ['Snowmobile', 'Caminhão com 100 PB (casos especiais)', '—'],
          ]}
        />
      </Section>

      <Section title="Cenários arquiteturais" accent={ACCENT}>
        <DecisionBox
          scenario="Migrar 500 servidores VMware para EC2 em 6 meses com cutover programado por wave"
          winner="AWS MGN + Migration Hub Orchestrator"
          winnerColor={ACCENT}
          why="MGN automatiza replicação por bloco para 500 servidores. Migration Hub Orchestrator agenda waves, validações e cutover. Grátis 90 dias."
          alternatives={[{ name: 'VMware HCX + VMware Cloud on AWS', note: 'se quer manter vSphere.' }, { name: 'Refactor por onda', note: 'muito mais longo e caro.' }]}
        />
        <DecisionBox
          scenario="DR cross-region para aplicações críticas com RTO de 5 minutos e RPO de 30 segundos"
          winner="AWS DRS (Pilot Light/Warm Standby) + Aurora Global Database"
          winnerColor={ACCENT}
          why="DRS mantém réplicas EC2 em standby de baixo custo com failover rápido. Aurora Global replica banco com RPO < 1s. Backup & Restore não atenderia RTO."
          alternatives={[{ name: 'Multi-Site Active/Active', note: 'RPO ~0 mas muito mais caro.' }, { name: 'AWS Backup + manual restore', note: 'RPO/RTO altos.' }]}
        />
        <DecisionBox
          scenario="Fornecedor externo precisa enviar arquivos CSV diariamente para processamento"
          winner="AWS Transfer Family (SFTP) + Lambda + S3"
          winnerColor={ACCENT}
          why="Transfer Family expõe endpoint SFTP gerenciado com autenticação IAM/Active Directory/service-managed. Arquivo cai em S3, EventBridge dispara Lambda."
          alternatives={[{ name: 'EC2 rodando OpenSSH', note: 'overhead operacional.' }, { name: 'DataSync', note: 'não expõe endpoint externo.' }]}
        />
        <DecisionBox
          scenario="Backup de fita legado (LTO) precisa ser substituído por storage em nuvem sem mudar app"
          winner="Storage Gateway — Tape Gateway (VTL)"
          winnerColor={ACCENT}
          why="Tape Gateway apresenta endpoints iSCSI VTL compatíveis com NetBackup/Veeam. Fitas virtuais vão para S3/Glacier automaticamente."
          alternatives={[{ name: 'AWS Backup', note: 'se pode reescrever o fluxo.' }, { name: 'Custom com S3 direto', note: 'mais trabalho.' }]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="MGN ou DRS para mover workloads para AWS?"
          a={<><strong>MGN</strong> se o objetivo final é migrar e parar. <strong>DRS</strong> se a replicação será <em>contínua</em> para DR mesmo após a migração. Ambos usam a mesma tecnologia base.</>}
        />
        <QAItem
          q="Como dimensionar a DMS Replication Instance?"
          a="Depende de: volume total, tamanho de LOBs, throughput de escrita no origem e tipo de engine. Como regra: dms.r5.large para carga ≤ 500 GB, dms.r5.xlarge/2xlarge para 1-5 TB, dms.r6i.4xlarge+ para workloads heavy com CDC. Use Fleet Advisor para recomendação data-driven."
        />
        <QAItem
          q="Qual diferença entre Snowball Edge Storage Optimized e Compute Optimized?"
          a={<>Storage Optimized: 80 TB usáveis, para transferência de grandes volumes. Compute Optimized: 42 TB + CPU/GPU para rodar Lambda e EC2 no edge (ambientes desconectados — navios, bases militares, minas).</>}
        />
        <QAItem
          q="DMS suporta NoSQL?"
          a={<>Como <strong>target</strong>: sim (DynamoDB, DocumentDB, OpenSearch, Kinesis, Kafka, Redis). Como <strong>source</strong>: MongoDB e DocumentDB nativamente. Para outros NoSQL use custom ETL com Glue.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> 7 Rs = framework de escolha · MGN = migrar servidores · DRS = DR contínuo · DMS+SCT+CDC = bancos heterogêneos ·
        Transfer Family = SFTP gerenciado · DataSync = transferência em rede · Storage Gateway = acesso híbrido · Snow Family = petabytes offline · Migration
        Hub = painel central.
      </Callout>
    </div>
  );
}
