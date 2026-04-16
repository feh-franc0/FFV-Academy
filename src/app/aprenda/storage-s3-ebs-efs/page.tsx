import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, ArchDiagram, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Storage AWS: S3, EBS, EFS e Glacier — FFV Academy',
  description: 'Object vs Block vs File storage na AWS. S3 storage classes, EBS volume types, EFS vs FSx, ciclos de vida e arquivamento com Glacier.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa tem 50 TB de backups raramente acessados (média: 1 vez por ano) mas precisa recuperá-los em minutos se houver incidente. Qual storage class S3 é ideal?',
    options: [
      'S3 Standard',
      'S3 Standard-IA (Infrequent Access)',
      'S3 Glacier Instant Retrieval',
      'S3 Glacier Deep Archive',
    ],
    correct: 2,
    explanation: 'Glacier Instant Retrieval tem acesso em milissegundos (como Standard-IA) mas custo de armazenamento menor. Ideal para dados raramente acessados que ainda exigem latência baixa quando necessário. Deep Archive é mais barato mas leva 12h para recuperar.',
  },
  {
    question: 'Uma EC2 precisa de 500 GB de storage de alta performance para banco de dados transacional. Qual escolher?',
    options: [
      'EFS (Elastic File System)',
      'S3',
      'EBS gp3 ou io2',
      'Instance Store',
    ],
    correct: 2,
    explanation: 'EBS é o storage de bloco para EC2 (persistente, volume único anexado a uma instância). gp3 é o padrão moderno (SSD); io2 para workloads que precisam IOPS altíssimo (>16k). EFS é file system compartilhado, inadequado para bancos relacionais.',
  },
  {
    question: 'Múltiplas EC2s Linux precisam acessar o MESMO file system simultaneamente. Qual serviço usar?',
    options: [
      'EBS',
      'EFS (Elastic File System)',
      'S3',
      'Instance Store',
    ],
    correct: 1,
    explanation: 'EFS é NFS v4 gerenciado — múltiplas EC2s (ou Lambda, ECS) em uma VPC podem montar o mesmo file system simultaneamente. EBS é bloco e só anexa a 1 EC2 por vez (exceto volumes Multi-Attach para casos raros).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="storage-s3-ebs-efs"
      title="Storage: S3, EBS, EFS, Glacier"
      icon="💾"
      xp={55}
      readTime={11}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="databases-aws-basico"
      nextTitle="Databases: RDS, Aurora, DynamoDB, Redshift"
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
        Storage na AWS não é "um disco na nuvem" — é uma família inteira de serviços com casos de uso distintos. Escolher errado custa caro: storage mal escolhido pode multiplicar a fatura por 10 ou criar gargalos de performance. O CLF-C02 cobra fundamentos de object storage (S3), block storage (EBS) e file storage (EFS/FSx).
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 3 — Cloud Technology and Services" weight="34%" color={ACCENT} />
        <p>
          Storage é o segundo maior sub-tópico do domínio 3. As questões testam: diferença entre object/block/file; storage classes do S3 e quando usar cada uma; EBS volume types; e escolha correta dado um cenário.
        </p>
      </Section>

      <Section title="As 3 famílias de storage" accent={ACCENT}>
        <ArchDiagram title="Object vs Block vs File" accent={ACCENT}>{`
┌────────────────┬────────────────┬────────────────┐
│    OBJECT      │    BLOCK       │    FILE        │
├────────────────┼────────────────┼────────────────┤
│ "arquivos +    │ "disco"        │ "share NFS/    │
│  metadata via  │                │  SMB"          │
│  API HTTP"     │                │                │
├────────────────┼────────────────┼────────────────┤
│  Exemplo:      │  Exemplo:      │  Exemplo:      │
│  S3            │  EBS           │  EFS (Linux),  │
│                │                │  FSx (Win/Lustre)│
├────────────────┼────────────────┼────────────────┤
│  Ilimitado     │  Até 64 TiB    │  Até PB        │
├────────────────┼────────────────┼────────────────┤
│  Acesso API    │  1 EC2 por vez │  N clientes    │
│  (HTTPS)       │  (Multi-Attach │  simultâneos   │
│                │   raro)        │                │
├────────────────┼────────────────┼────────────────┤
│  Paga por GB   │  Paga por GB   │  Paga por GB   │
│  + reqs        │  provisionado  │  usado         │
└────────────────┴────────────────┴────────────────┘
`}</ArchDiagram>
      </Section>

      <Section title="Amazon S3 (Simple Storage Service)" accent={ACCENT}>
        <p>
          Object storage. Ilimitado, 11 9s de durabilidade (99,999999999%), acessado via HTTPS. Organizado em <strong>buckets</strong> (nomes globalmente únicos) contendo <strong>objetos</strong> (arquivo + metadata, até 5 TB cada). Não há estrutura de diretórios real — "pastas" são só um prefixo no nome da chave (<InlineCode>fotos/2026/abril/x.jpg</InlineCode>).
        </p>
        <p><strong>Principais features:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Versioning</InlineCode> — mantém versões históricas de cada objeto</li>
          <li>• <InlineCode>Replication</InlineCode> — CRR (cross-region) ou SRR (same-region)</li>
          <li>• <InlineCode>Lifecycle</InlineCode> — transita entre storage classes ou deleta automaticamente</li>
          <li>• <InlineCode>Encryption</InlineCode> — SSE-S3, SSE-KMS, SSE-C, client-side</li>
          <li>• <InlineCode>Object Lock</InlineCode> — WORM (Write Once Read Many) para compliance</li>
          <li>• <InlineCode>Event Notifications</InlineCode> — dispara Lambda, SQS, SNS em upload/delete</li>
          <li>• <InlineCode>Transfer Acceleration</InlineCode> — upload acelerado via CloudFront</li>
          <li>• <InlineCode>Multi-part upload</InlineCode> — obrigatório para arquivos &gt;5 GB</li>
        </ul>
      </Section>

      <Section title="S3 Storage Classes (cobrado no exame)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Classe', 'Acesso', 'Durabilidade', 'Preço relativo', 'Uso']}
          rows={[
            ['S3 Standard', 'Frequente (ms)', '99,999999999%', '$$$', 'Dados ativos, websites, analytics'],
            ['S3 Intelligent-Tiering', 'Frequente → raro automático', '99,999999999%', 'Auto', 'Acesso imprevisível'],
            ['S3 Standard-IA', 'Raro (ms)', '99,999999999%', '$$', 'Backups, DR secundário'],
            ['S3 One Zone-IA', 'Raro (ms)', '99,999999999% em 1 AZ', '$', 'Backups recriáveis'],
            ['S3 Glacier Instant Retrieval', 'Raro (ms)', '99,999999999%', '$', 'Arquivos médicos, logs acessados 1x/ano'],
            ['S3 Glacier Flexible', 'Minutos a horas', '99,999999999%', '¢¢', 'Backups long-term'],
            ['S3 Glacier Deep Archive', '12 horas', '99,999999999%', '¢', 'Compliance 7+ anos'],
          ]}
        />
        <Callout tone="info">
          <strong>Trade-off central:</strong> quanto menor o preço de storage, maior o custo de <em>retrieval</em> (recuperar) e maior o tempo de acesso. Glacier Deep Archive custa centavos/GB mas cobra alto para recuperar + leva 12h.
        </Callout>
      </Section>

      <Section title="Amazon EBS (Elastic Block Store)" accent={ACCENT}>
        <p>
          Volumes de bloco anexados a EC2 — "o HD virtual". Persistente (sobrevive ao desligamento da EC2). Uma AZ apenas (backup para outra AZ via snapshot).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Mídia', 'Uso', 'IOPS máximo']}
          rows={[
            ['gp3', 'SSD', 'Padrão general purpose (boot, DB)', '16.000 (baseline) até 80.000'],
            ['gp2', 'SSD', 'Legado general purpose', '3.000 baseline até 16.000'],
            ['io2 Block Express', 'SSD NVMe', 'Workloads críticos (Oracle, SAP)', '256.000'],
            ['io1', 'SSD', 'Legado alto-IOPS', '64.000'],
            ['st1', 'HDD', 'Throughput sequencial (big data)', 'Baseline 40 MB/s por TB'],
            ['sc1', 'HDD', 'Arquivamento barato (raro acesso)', 'Baseline 12 MB/s por TB'],
          ]}
        />
        <Callout tone="warn">
          <strong>EBS é na mesma AZ da EC2.</strong> Para usar em outra AZ ou outra Região, você cria um <strong>snapshot</strong> (armazenado em S3), e restaura o snapshot na nova AZ/Região.
        </Callout>
      </Section>

      <Section title="Instance Store (ephemeral)" accent={ACCENT}>
        <p>
          Storage físico acoplado ao host. Altíssima performance (NVMe local) mas <strong>perde todos os dados</strong> quando a EC2 é parada/terminada. Incluído no preço de certas instâncias (i3, d3).
        </p>
        <p>Uso: caches, dados temporários, swap. Nunca dados que você não pode perder.</p>
      </Section>

      <Section title="Amazon EFS e FSx" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Protocolo', 'SO', 'Uso']}
          rows={[
            ['Amazon EFS', 'NFS v4', 'Linux', 'Compartilhamento entre EC2 Linux, Lambda, ECS'],
            ['FSx for Windows', 'SMB', 'Windows', 'Active Directory, apps Windows legadas'],
            ['FSx for Lustre', 'Lustre', 'Linux', 'HPC, ML training (integra com S3)'],
            ['FSx for NetApp ONTAP', 'NFS, SMB, iSCSI', 'Linux/Win', 'Enterprise NAS (snapshots, dedup)'],
            ['FSx for OpenZFS', 'NFS v3/v4.x', 'Linux', 'Alternativa ZFS (clone instantâneo, compressão)'],
          ]}
        />
      </Section>

      <Section title="AWS Backup — backup centralizado" accent={ACCENT}>
        <p>
          Serviço gerenciado que faz backup de EBS, EFS, FSx, RDS, DynamoDB, Storage Gateway, EC2 (via snapshot) com políticas centralizadas. Substitui scripts manuais. Cross-region e cross-account suportados.
        </p>
      </Section>

      <Section title="AWS Snow Family — migração física" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dispositivo', 'Capacidade', 'Uso']}
          rows={[
            ['Snowcone', '8 TB', 'Edge computing leve + migração pequena'],
            ['Snowball Edge Storage', '80 TB', 'Migração média'],
            ['Snowball Edge Compute', '42 TB + GPU', 'Compute em ambiente disconnected'],
            ['Snowmobile', '100 PB', 'Container de caminhão para mudanças gigantescas (descontinuado 2024 — agora multi-Snowball)'],
          ]}
        />
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Fotos de usuários de um app de rede social (mix de acesso)"
          winner="S3 Intelligent-Tiering"
          winnerColor={ACCENT}
          why="Fotos recentes são acessadas muito, fotos antigas ocasionalmente. Intelligent-Tiering move automaticamente entre classes, otimizando custo sem retrieval fees."
        />
        <DecisionBox
          scenario="Compliance bancário: guardar logs por 10 anos com acesso quase zero"
          winner="S3 Glacier Deep Archive + Object Lock"
          winnerColor={ACCENT}
          why="$1/TB/mês é o menor custo da AWS. Object Lock em modo Compliance garante WORM — nem a root account pode deletar. 12h de retrieval é aceitável para auditoria."
        />
        <DecisionBox
          scenario="Banco de dados PostgreSQL em EC2 com 10k TPS"
          winner="EBS io2 Block Express"
          winnerColor={ACCENT}
          why="Workloads transacionais exigem IOPS previsíveis e baixa latência. io2 suporta até 256k IOPS por volume. Para escala horizontal, considere RDS/Aurora em vez de EC2 manual."
          alternatives={[
            { name: 'EBS gp3', note: 'Ok para cargas menores; limite de 80k IOPS' },
          ]}
        />
        <DecisionBox
          scenario="Cluster EC2 Linux compartilhando diretório /var/data"
          winner="Amazon EFS"
          winnerColor={ACCENT}
          why="Múltiplas EC2s montam o mesmo FS via NFS. Escala elástica. IAM controla acesso. Backup via AWS Backup."
        />
        <DecisionBox
          scenario="Migração de 500 TB de dados on-prem com link ADSL de 20 Mbps"
          winner="AWS Snowball Edge"
          winnerColor={ACCENT}
          why="Via rede levaria ~60 dias. Snowball chega em 1 semana, copia localmente, retorna à AWS. Mais rápido e barato."
        />
      </Section>

      <Section title="Exemplos de CLI" accent={ACCENT}>
        <CodeBlock lang="bash">{`# S3 — criar bucket, upload, listar
aws s3 mb s3://meu-bucket-unico-123
aws s3 cp arquivo.pdf s3://meu-bucket-unico-123/
aws s3 ls s3://meu-bucket-unico-123/

# S3 — habilitar versioning
aws s3api put-bucket-versioning \\
  --bucket meu-bucket-unico-123 \\
  --versioning-configuration Status=Enabled

# S3 — aplicar lifecycle (mover p/ Glacier após 90d)
aws s3api put-bucket-lifecycle-configuration \\
  --bucket meu-bucket-unico-123 \\
  --lifecycle-configuration file://lifecycle.json

# EBS — criar volume gp3 e anexar
aws ec2 create-volume --size 100 --volume-type gp3 \\
  --availability-zone sa-east-1a
aws ec2 attach-volume --volume-id vol-xxx \\
  --instance-id i-yyy --device /dev/sdf

# Snapshot para backup / mover de AZ
aws ec2 create-snapshot --volume-id vol-xxx \\
  --description "Backup diário"`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Pegadinha:</strong> S3 é "eventually consistent" para deletes? — <strong>Não</strong>. Desde dez/2020, S3 é <em>strong read-after-write consistency</em> para todas as operações. Se a questão mencionar "eventually consistent", é desatualizada ou a resposta errada.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual storage é o mais durável da AWS?"
          a={<>S3 com 99,999999999% (11 9s) de durabilidade para todas as classes exceto One Zone-IA. Isso significa que em 10 milhões de objetos, você perderia estatisticamente 1 a cada 10.000 anos.</>}
        />
        <QAItem
          q="Em S3, qual é o tamanho máximo de um único objeto?"
          a={<>5 TB por objeto. Acima de 5 GB é obrigatório usar Multipart Upload. Upload simples (PUT único) é limitado a 5 GB.</>}
        />
        <QAItem
          q="Qual feature do S3 permite pagar pelo tráfego de saída em vez de quem baixa?"
          a={<>Nenhuma padrão — o dono do bucket paga egress. Mas <InlineCode>Requester Pays</InlineCode> permite repassar esse custo para quem faz o download (comum em datasets públicos grandes).</>}
        />
        <QAItem
          q="EBS snapshot é armazenado onde?"
          a={<>Em S3, internamente, mas você NÃO vê o bucket. É gerenciado pelo EBS. Incremental: só os blocos alterados desde o último snapshot são copiados.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Object (S3) / Block (EBS) / File (EFS, FSx). S3 tem 7 storage classes com trade-off storage↔retrieval. EBS é por AZ, snapshots vão para S3. EFS para Linux compartilhado, FSx para Windows ou HPC. Lifecycle + Intelligent-Tiering automatizam economia. Object Lock = WORM para compliance. Snow Family = migração física.
      </Callout>
    </div>
  );
}
