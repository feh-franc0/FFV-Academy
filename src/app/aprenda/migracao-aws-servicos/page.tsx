import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Migração AWS: Migration Hub, DMS, MGN e DataSync — FFV Academy',
  description: 'Os serviços de migração da AWS explicados: Migration Hub, Application Migration Service (MGN), Database Migration Service (DMS), Application Discovery, DataSync e Mainframe Modernization.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa quer migrar um banco Oracle on-premises para Aurora PostgreSQL na AWS com o mínimo de downtime. Qual combinação de serviços é correta?',
    options: [
      'MGN para replicar disco + Aurora pronto do outro lado',
      'DataSync para copiar dados + Aurora depois',
      'DMS com SCT (Schema Conversion Tool) + CDC (Change Data Capture)',
      'Snowball Edge para mover em caminhão',
    ],
    correct: 2,
    explanation: 'DMS (Database Migration Service) + SCT (Schema Conversion Tool) é a combinação oficial para migração heterogênea. O SCT converte schema e stored procedures de Oracle para PostgreSQL. O CDC replica mudanças contínuas enquanto a aplicação ainda roda no origem, permitindo cutover com segundos de downtime.',
  },
  {
    question: 'O que o AWS Application Discovery Service faz?',
    options: [
      'Faz a migração propriamente dita dos servidores',
      'Coleta dados de CPU, memória, storage e dependências do ambiente on-premises para planejar a migração',
      'Substitui o CloudTrail para auditoria',
      'É um catálogo de aplicações Marketplace',
    ],
    correct: 1,
    explanation: 'Application Discovery é a etapa de descoberta — coleta inventário, utilização e dependências de rede do ambiente on-prem. Os dados vão para o Migration Hub e podem ser analisados com Athena. A migração em si é feita por MGN, DMS, etc.',
  },
  {
    question: 'Você precisa mover 500 TB de um NAS on-prem para o S3 de forma contínua e segura via rede. Qual serviço é melhor?',
    options: [
      'AWS Snowball Edge',
      'AWS DataSync',
      'AWS Storage Gateway',
      'AWS DMS',
    ],
    correct: 1,
    explanation: 'DataSync é o serviço de transferência contínua e agendada entre storage on-prem (NFS/SMB/HDFS) e AWS (S3, EFS, FSx). Para volumes acima de ~petabyte sem link WAN disponível, Snowball Edge faz sentido. Storage Gateway é para acesso híbrido contínuo, não migração pontual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="migracao-aws-servicos"
      title="Migração: Migration Hub, DMS, MGN e DataSync"
      icon="🚚"
      xp={45}
      readTime={9}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="ai-ml-aws-servicos"
      nextTitle="IA e ML na AWS: Bedrock, SageMaker, Q e Amigos"
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
        Quase nenhuma empresa nasce direto na nuvem — a maioria chega até a AWS carregando datacenters, servidores Windows antigos, bancos Oracle de 2 TB e
        NAS com 300 TB de arquivos. A AWS entende isso e oferece um <strong>arsenal dedicado</strong> de serviços para cada etapa: descobrir o que existe,
        planejar a onda, migrar servidores, migrar bancos e transferir dados. No CLF-C02 aparecem perguntas de &ldquo;qual serviço usar para X&rdquo; — e a
        diferença entre MGN, DMS e DataSync precisa estar afiada.
      </p>

      <ExamDomainBadge domain="Cloud Concepts" weight="~24% do CLF-C02" color={ACCENT} />

      <Section title="O fluxo de migração em 4 fases" accent={ACCENT}>
        <ArchDiagram title="Ciclo de migração AWS" accent={ACCENT}>{`
  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌────────────┐
  │  DISCOVER   │→ │    PLAN      │→ │   MIGRATE    │→ │  VALIDATE   │
  │ Application │   │ Migration    │   │ MGN · DMS    │   │ Logs, Cost  │
  │ Discovery   │   │ Hub          │   │ DataSync     │   │ CloudWatch  │
  └─────────────┘   └──────────────┘   └──────────────┘   └────────────┘
                         ▲                     ▲
                         │                     │
                    visibilidade         7 Rs decididos
                       central              por app
        `}</ArchDiagram>
        <p>
          Cada etapa tem serviços específicos. O <strong>Migration Hub</strong> é o painel que amarra tudo: você vê progresso de dezenas de servidores
          sendo migrados por MGN, bancos por DMS e dados por DataSync em uma tela só.
        </p>
      </Section>

      <Section title="AWS Migration Hub" accent={ACCENT}>
        <p>
          Painel central de rastreamento. Consolida progresso de <strong>MGN</strong>, <strong>DMS</strong>, <strong>Application Discovery</strong> e
          ferramentas de parceiros em um único dashboard. <InlineCode>Migration Hub Orchestrator</InlineCode> permite automatizar sequências (ex: migrar o
          banco primeiro, depois os app servers que dependem dele).
        </p>
        <Callout tone="info">
          Migration Hub <strong>não cobra</strong> pelo rastreamento — você paga só pelos serviços subjacentes (MGN, DMS, etc.).
        </Callout>
      </Section>

      <Section title="AWS Application Discovery Service" accent={ACCENT}>
        <p>A etapa zero da migração: entender o que existe on-prem antes de mover qualquer coisa.</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modo', 'Como funciona', 'Quando usar']}
          rows={[
            ['Agentless Discovery (Connector)', 'VM appliance no VMware vCenter coleta dados de VMs sem agente', 'Ambiente VMware, quer inventário rápido'],
            ['Agent-based Discovery', 'ADS Agent instalado em cada servidor (Linux/Windows)', 'Precisa de dados detalhados: processos, conexões de rede, dependências'],
          ]}
        />
        <p>
          Dados são exportados para Migration Hub ou para S3 (analisáveis com <InlineCode>Athena</InlineCode>). Permite construir um <em>wave plan</em> — quais
          apps migrar juntas porque têm dependência forte entre si.
        </p>
      </Section>

      <Section title="AWS Application Migration Service (MGN)" accent={ACCENT}>
        <p>
          Substituto oficial do antigo Server Migration Service (SMS). É o serviço de <strong>rehost (lift-and-shift)</strong> padrão da AWS — replica
          servidores on-prem inteiros para EC2 com downtime mínimo.
        </p>
        <ArchDiagram title="Como o MGN funciona" accent={ACCENT}>{`
  On-prem Server (VM, físico, Hyper-V, VMware)
     │
     ├── MGN Replication Agent instalado
     │     └── Replica blocos de disco continuamente → EBS snapshots na AWS
     │
     ├── Launch Template pré-configurado (instance type, VPC, SG)
     │
     └── Test Launch → Cutover → EC2 em produção
              RTO ≈ minutos · RPO ≈ segundos
        `}</ArchDiagram>
        <Callout tone="success">
          MGN é <strong>gratuito por 90 dias</strong> após a primeira replicação — você só paga EBS + EC2 do destino. Serve também como DR econômico (mantém
          réplicas em standby).
        </Callout>
      </Section>

      <Section title="AWS Database Migration Service (DMS)" accent={ACCENT}>
        <p>Migração de bancos com mínimo downtime, suportando replicação contínua.</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Exemplo', 'Ferramenta extra']}
          rows={[
            ['Homogênea', 'Oracle → Oracle · MySQL → RDS MySQL', 'Não precisa'],
            ['Heterogênea', 'Oracle → Aurora · SQL Server → PostgreSQL', 'SCT (Schema Conversion Tool)'],
          ]}
        />
        <p>
          <strong>SCT</strong> (Schema Conversion Tool) converte schema + stored procedures + triggers para o dialeto destino. <strong>CDC</strong> (Change
          Data Capture) replica mudanças em curso <em>após</em> a carga inicial — é o que permite cutover com downtime de segundos.
        </p>
        <Callout tone="warn">
          Armadilha clássica: DMS <strong>não migra</strong> stored procedures sozinho em migrações heterogêneas — você <strong>precisa</strong> do SCT
          antes. Para homogênea, SCT é opcional.
        </Callout>
      </Section>

      <Section title="AWS DataSync" accent={ACCENT}>
        <p>
          Transferência de arquivos e objetos entre storage on-prem (NFS, SMB, HDFS) e AWS (S3, EFS, FSx). Faz <strong>verificação de integridade</strong>,
          criptografia em trânsito e pode rodar continuamente ou agendado.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['DataSync', 'Storage Gateway', 'Snow Family']}
          rows={[
            ['Transferência em rede (contínua/agendada)', 'Acesso híbrido contínuo (mantém on-prem ativo)', 'Transferência física offline'],
            ['TB até centenas de TB', 'Cache local + storage na AWS', 'PB · TB volume sem boa conectividade'],
            ['NFS/SMB/HDFS ↔ S3/EFS/FSx', 'iSCSI, NFS, SMB, VTL', 'Snowcone · Snowball Edge · Snowmobile'],
          ]}
        />
      </Section>

      <Section title="AWS Mainframe Modernization" accent={ACCENT}>
        <p>
          Serviço gerenciado para migrar e modernizar aplicações mainframe (COBOL, Micro Focus) para cloud. Suporta dois padrões: <strong>replataforma</strong>
          (roda o código como está em AWS) ou <strong>refactor</strong> (transpila COBOL → Java). Aparece pouco no CLF-C02 além do nome, mas pode cair em
          questões de &ldquo;qual serviço para migrar mainframe&rdquo;.
        </p>
      </Section>

      <Section title="Decisão: qual serviço usar?" accent={ACCENT}>
        <DecisionBox
          scenario="Migrar 200 servidores Windows/Linux on-prem para EC2 com menor esforço"
          winner="AWS MGN (Application Migration Service)"
          winnerColor={ACCENT}
          why="Rehost automatizado, replicação contínua por blocos, cutover em minutos, gratuito por 90 dias."
          alternatives={[{ name: 'VMware HCX', note: 'se já usa VMware Cloud on AWS.' }, { name: 'Scripts custom com AMI Import', note: 'menos automatizado.' }]}
        />
        <DecisionBox
          scenario="Migrar banco Oracle 2 TB para Aurora PostgreSQL com downtime < 1 hora"
          winner="DMS + SCT + CDC"
          winnerColor={ACCENT}
          why="SCT converte schema Oracle → PostgreSQL; DMS faz carga inicial; CDC replica mudanças enquanto app ainda escreve em Oracle; cutover: redireciona conexões."
          alternatives={[{ name: 'Aurora native import', note: 'homogêneo PostgreSQL → Aurora PostgreSQL.' }, { name: 'Backup lógico + restore', note: 'offline — downtime grande.' }]}
        />
        <DecisionBox
          scenario="Transferir 300 TB de arquivos NAS para S3 via rede em 2 semanas"
          winner="AWS DataSync"
          winnerColor={ACCENT}
          why="DataSync paraleliza transferência, verifica integridade, agenda jobs. Se a conectividade for ruim, considere Snowball Edge (caminhão AWS)."
          alternatives={[{ name: 'Snowball Edge', note: 'offline, melhor acima de 500 TB ou link lento.' }, { name: 'Storage Gateway', note: 'não é migração — é acesso híbrido contínuo.' }]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual a diferença entre DMS e MGN?"
          a={<>DMS migra <strong>bancos de dados</strong> (Oracle, SQL Server, MySQL, etc.). MGN migra <strong>servidores inteiros</strong> (VM ou físico) para EC2 com seus discos. São serviços complementares.</>}
        />
        <QAItem
          q="Quando escolher Snow Family em vez de DataSync?"
          a={<>Quando o volume é muito grande (&gt;100 TB) <em>e</em> a conectividade WAN é limitada. Snowball Edge chega fisicamente, você copia os dados localmente e devolve. Há também Snowmobile (caminhão) para 100 PB+.</>}
        />
        <QAItem
          q="O Migration Hub cobra à parte?"
          a="Não. É gratuito — cobra só os serviços subjacentes que ele rastreia (MGN, DMS, Discovery, etc.)."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> MGN = servidores · DMS = bancos · DataSync = arquivos via rede · Snow Family = arquivos offline · Application Discovery
        = descobrir antes de migrar · Migration Hub = painel central. O SCT é obrigatório em migrações heterogêneas de banco.
      </Callout>
    </div>
  );
}
