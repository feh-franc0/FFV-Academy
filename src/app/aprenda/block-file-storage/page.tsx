import type { Metadata } from 'next';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  NodeGraph,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'EBS, EFS e FSx: Quando Usar Cada Um — SAA-C03',
  description: 'Block, file e specialty storage no SAA-C03: EBS gp3/io2/st1/sc1, EFS Standard/IA, FSx Windows/Lustre/NetApp/OpenZFS, Storage Gateway e quando usar cada um.',
  keywords: 'EBS, EFS, FSx, gp3, io2, Lustre, NetApp ONTAP, Windows File Server, Storage Gateway, SAA-C03',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Um cluster de ML precisa ler 500GB de datasets por cada job de treinamento, com throughput de vários GB/s, e os mesmos arquivos são acessados por dezenas de instâncias GPU simultaneamente. Qual serviço escolher?',
    options: [
      'EBS io2 Block Express anexado a cada instância',
      'EFS em modo Max I/O',
      'FSx for Lustre integrado ao S3',
      'S3 com Mountpoint',
    ],
    correct: 2,
    explanation: 'FSx for Lustre é filesystem POSIX otimizado para HPC/ML com throughput de centenas de GB/s, hidratação lazy de dados do S3 e compartilhamento multi-cliente. EBS é block, single-attach (mesmo io2 Block Express tem multi-attach limitado a mesmo AZ). EFS escala mas não atinge a largura de banda do Lustre para ML intensivo. Mountpoint/S3 não oferece lock POSIX necessário para alguns frameworks.',
  },
  {
    question: 'Uma aplicação .NET legada precisa de compartilhamento SMB com Active Directory, ACLs NTFS e DFS-R. Qual serviço AWS é o match exato?',
    options: [
      'EFS com CIFS gateway',
      'FSx for Windows File Server',
      'FSx for NetApp ONTAP',
      'Storage Gateway File Gateway',
    ],
    correct: 1,
    explanation: 'FSx for Windows File Server é nativamente SMB + NTFS ACLs + integração com AD + DFS Namespaces. EFS é NFS (Linux-first). FSx ONTAP suporta SMB e NFS mas é marketed para migração de NetApp on-prem. Storage Gateway File Gateway é para cenários híbridos, não para aplicação cloud-native.',
  },
  {
    question: 'Você tem um volume EBS gp2 de 100GB entregando ~300 IOPS e precisa aumentar para 6000 IOPS sem pagar pela provisão proporcional. Qual a opção mais eficiente em custo?',
    options: [
      'Aumentar o gp2 para 2000GB (pois gp2 dá 3 IOPS/GB)',
      'Migrar para io2 com 6000 IOPS provisionados',
      'Migrar para gp3 e provisionar 6000 IOPS separadamente',
      'Usar instance store (ephemeral)',
    ],
    correct: 2,
    explanation: 'gp3 desacopla tamanho de IOPS: baseline 3000 IOPS grátis + compra de IOPS/throughput extra sob demanda. Muito mais barato que aumentar gp2 para 2TB só para pegar IOPS. io2 é para workloads que precisam de >16k IOPS sustentados e sub-ms latency consistentes (databases críticas) — overkill para 6k IOPS.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="block-file-storage"
      title="EBS, EFS e FSx: Quando Usar Cada Um"
      icon="💾"
      xp={60}
      readTime={12}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="rds-aurora-dynamodb"
      nextTitle="Bancos: Multi-AZ, Read Replicas, DynamoDB"
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
        S3 resolve object storage. Mas aplicações precisam muitas vezes de block (disco que uma instância formata) ou
        file (compartilhado entre várias máquinas com protocolo NFS/SMB). AWS tem um portfólio confuso aqui — EBS, EFS,
        quatro variantes de FSx, instance store, Storage Gateway — e o SAA adora testar a escolha certa em cenários
        específicos. Vamos alinhar os cinco vetores: protocolo, multi-attach, performance, custo e caso de uso.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="High-Performing" weight="24%" color={ACCENT} />
        <ExamDomainBadge domain="Resilient" weight="26%" color={ACCENT} />
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
      </div>

      <Section title="Mapa mental de storage para compute" accent={ACCENT}>
        <NodeGraph
          title="Taxonomia: qual storage para qual uso?"
          accent={ACCENT}
          columns={[
            {
              label: 'BLOCK',
              nodes: [
                { icon: '💽', label: 'EBS', sub: 'gp3 · io2 · st1 · sc1 — volume persistente anexado a 1 EC2' },
                { icon: '⚡', label: 'Instance Store', sub: 'SSD efêmero, perde ao stop/terminate — cache, buffers' },
              ],
            },
            {
              label: 'FILE',
              nodes: [
                { icon: '📁', label: 'EFS', sub: 'NFS para Linux, elástico, multi-AZ', tone: 'emphasis' },
                { icon: '🪟', label: 'FSx for Windows', sub: 'SMB, AD-integrado, Windows workloads', tone: 'emphasis' },
                { icon: '🚀', label: 'FSx for Lustre', sub: 'HPC/ML — sub-ms, integra com S3', tone: 'emphasis' },
                { icon: '🧬', label: 'FSx for NetApp ONTAP', sub: 'NFS/SMB/iSCSI, snapshots, migração lift-and-shift', tone: 'emphasis' },
                { icon: '🧊', label: 'FSx for OpenZFS', sub: 'NFS com snapshots/clones instantâneos', tone: 'emphasis' },
              ],
            },
            {
              label: 'OBJECT',
              nodes: [
                { icon: '🪣', label: 'S3', sub: 'API HTTP — qualquer cliente, qualquer região. Ilimitado.' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="EBS — block storage anexado à EC2" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          EBS é volume que você anexa a uma EC2 na mesma AZ. Formata, monta, usa como disco local. Persiste após stop,
          snapshot vai para S3, criptografia via KMS é transparente.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Família', 'IOPS máx', 'Throughput máx', 'Caso de uso']}
          rows={[
            ['gp3', 'SSD genérico', '16.000', '1.000 MB/s', 'Padrão moderno — desacopla IOPS de tamanho, 20% mais barato que gp2'],
            ['gp2', 'SSD genérico (legado)', '16.000', '250 MB/s', 'Legado. 3 IOPS/GB até 16k máx.'],
            ['io2 Block Express', 'SSD premium', '256.000', '4.000 MB/s', 'SAP HANA, Oracle, SQL Server críticos'],
            ['io2', 'SSD premium', '64.000', '1.000 MB/s', 'DBs críticos com SLA de durabilidade 99,999%'],
            ['st1', 'HDD throughput', '500', '500 MB/s', 'Big Data, data warehouses, logs sequenciais'],
            ['sc1', 'HDD cold', '250', '250 MB/s', 'Arquivamento acessado menos de 1x/dia'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'AZ-bound', v: 'Volume existe em uma AZ. Para mover, faça snapshot → crie volume na outra AZ a partir do snapshot.' },
            { k: 'Snapshots', v: 'Incrementais em S3 (não acessível diretamente). Cross-region copy suportado. Fast Snapshot Restore elimina hydrate latency.' },
            { k: 'Multi-Attach', v: 'Apenas io1/io2 permitem anexar a até 16 instâncias na MESMA AZ. Precisa de cluster-aware FS (não ext4 padrão).' },
            { k: 'Elastic Volumes', v: 'Pode mudar tipo/tamanho/IOPS ao vivo sem stop. Limite: uma mudança a cada 6h no mesmo volume.' },
            { k: 'Encryption', v: 'KMS. Se habilitada por default na conta, todo volume novo é criptografado. Snapshot de volume encrypted herda encryption.' },
          ]}
        />
        <Callout tone="warn">
          <strong>Instance Store ≠ EBS.</strong> Instance store é SSD/NVMe local ao hypervisor, altíssima performance
          (milhões de IOPS) mas <strong>efêmero</strong> — stop ou failure apaga tudo. Usado para cache, shuffle de
          Spark, scratch de ML. Disponibilidade por família (i3, i4i, m5d, r5d, etc.).
        </Callout>
      </Section>

      <Section title="EFS — NFS gerenciado para Linux" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          EFS é filesystem POSIX compatível com NFSv4, multi-AZ, elastic (cresce e encolhe automaticamente). Qualquer
          instância EC2 (ou ECS/EKS/Lambda) monta e compartilha.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'EFS Standard', 'EFS One Zone']}
          rows={[
            ['Durabilidade', 'Multi-AZ na região', 'AZ única'],
            ['Custo', '$$$', '$ (~47% menor)'],
            ['Caso', 'Produção', 'Dev/test, backups secundários'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Performance modes', v: 'General Purpose (default, baixa latência) vs Max I/O (escala > 7k ops/s mas latência mais alta). Nova geração Elastic Throughput torna essa escolha menos crítica.' },
            { k: 'Throughput modes', v: 'Bursting (grátis, escala com tamanho) | Provisioned (pago fixo) | Elastic (auto-scale pay-per-use, recomendado).' },
            { k: 'IA + Lifecycle', v: 'Move arquivos não acessados para EFS-IA automaticamente após 7/14/30/60/90 dias. Reduz custo em até 92%.' },
            { k: 'Access Points', v: 'Endpoints com POSIX user enforcement + root directory — isola múltiplas apps no mesmo FS.' },
            { k: 'Cross-region', v: 'Replicação para outra região para DR, RPO < 1h.' },
          ]}
        />
        <Callout tone="info">
          <strong>Lambda + EFS:</strong> Lambda pode montar EFS via Access Point na VPC. Útil para modelos ML grandes
          que não cabem no pacote de 250MB da Lambda. Cold start +1–2s ao montar.
        </Callout>
      </Section>

      <Section title="FSx — 4 filesystems especializados" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Variante', 'Protocolo', 'Caso de uso']}
          rows={[
            ['FSx for Windows File Server', 'SMB + NTFS ACL + AD', 'Apps Windows, share de departamento, home folders'],
            ['FSx for Lustre', 'POSIX (Linux) + S3-backed', 'HPC, ML training, genômica, mídia (centenas de GB/s)'],
            ['FSx for NetApp ONTAP', 'SMB + NFS + iSCSI', 'Lift-and-shift de NetApp, snapshots FlexClone, multi-protocolo'],
            ['FSx for OpenZFS', 'NFS (v3/v4)', 'Apps Linux/Unix que querem snapshots baratos + clones instantâneos'],
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Cluster HPC de simulação física, 200 nós, lê 10TB de inputs por job"
          winner="FSx for Lustre linked ao bucket S3"
          why="Lustre é filesystem paralelo nativo para HPC. Linkar ao S3 permite hidratar dados sob demanda e devolver resultados sem copiar manualmente."
          alternatives={[
            { name: 'EFS Max I/O', note: 'escala mas não atinge centenas de GB/s sustentados.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Migração de NetApp on-prem (iSCSI + NFS + SnapMirror) para AWS"
          winner="FSx for NetApp ONTAP"
          why="Mantém APIs, features (SnapMirror, FlexClone, Deduplication) e compatibilidade binária. Redução de risco na migração."
          alternatives={[
            { name: 'Refatorar para EFS + EBS', note: 'viável mas muito mais trabalho.' },
          ]}
        />
      </Section>

      <Section title="Storage Gateway — ponte híbrida on-prem ↔ AWS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Protocolo local', 'Backend AWS', 'Caso de uso']}
          rows={[
            ['File Gateway', 'NFS/SMB', 'S3', 'On-prem vê um share, dados vão para S3 (com classes/lifecycle).'],
            ['Volume Gateway', 'iSCSI', 'EBS Snapshots', 'Cached Mode (hot on-prem + cold AWS) ou Stored Mode (tudo on-prem + snapshot cloud).'],
            ['Tape Gateway', 'VTL (iSCSI)', 'Glacier/Deep Archive', 'Substituir biblioteca física de fitas (backup software existente).'],
            ['Amazon FSx File Gateway', 'SMB', 'FSx for Windows', 'Acesso local em branch offices a files em FSx central.'],
          ]}
        />
      </Section>

      <Section title="Comparação final — cheat sheet do exame" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Requisito', 'Escolha']}
          rows={[
            ['Disco para EC2, single-host, alta IOPS', 'EBS io2 Block Express'],
            ['Disco para EC2, padrão, custo-benefício', 'EBS gp3'],
            ['Filesystem compartilhado Linux', 'EFS'],
            ['Filesystem compartilhado Windows + AD', 'FSx for Windows File Server'],
            ['HPC / ML training com S3 dataset', 'FSx for Lustre'],
            ['Migração de NetApp', 'FSx for NetApp ONTAP'],
            ['Snapshots baratos + clones para teste', 'FSx for OpenZFS'],
            ['Scratch disk ultra-rápido e descartável', 'Instance Store'],
            ['On-prem quer usar S3 como se fosse NFS', 'File Gateway'],
            ['Object storage global', 'S3'],
          ]}
        />
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="Volume EBS não anexa à instância — qual a primeira coisa a verificar?"
          a={
            <span>
              Mesma AZ. EBS é AZ-scoped. Se instância está em us-east-1a e o volume foi criado em us-east-1b, attach
              falha. Snapshot → create volume na AZ correta → attach.
            </span>
          }
        />
        <QAItem
          q="Quero que snapshots EBS existam também em outra região para DR. Como?"
          a={
            <span>
              <InlineCode>aws ec2 copy-snapshot --source-region ...</InlineCode> ou use <strong>Data Lifecycle Manager</strong>
              com policy cross-region. DLM automatiza snapshot + retention + copy.
            </span>
          }
        />
        <QAItem
          q="EFS em Lambda — quais limites devo saber?"
          a={
            <span>
              Lambda precisa estar em VPC com acesso ao mount target. 25.000 conexões concorrentes por mount target.
              IAM deve permitir <InlineCode>elasticfilesystem:ClientMount</InlineCode> e{' '}
              <InlineCode>ClientWrite</InlineCode>.
            </span>
          }
        />
        <QAItem
          q="Preciso criptografar um volume EBS já existente que não estava criptografado."
          a={
            <span>
              Snapshot → copy snapshot com flag <InlineCode>--encrypted</InlineCode> + KMS key → create volume do novo
              snapshot → detach antigo, attach novo. Não tem encryption in-place no EBS.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinhas frequentes:</strong> (1) EBS é AZ-scoped, esqueceu e vai errar; (2) gp2 &ldquo;parece&rdquo; mais barato
        mas gp3 ganha em custo × performance quase sempre; (3) EFS é Linux/NFS — se viu Windows no enunciado, pense
        FSx for Windows; (4) Multi-Attach do io2 é limitado à mesma AZ e exige cluster-aware FS; (5) Instance Store
        some no stop, não no reboot.
      </Callout>

      <CodeBlock lang="bash">{`# Criar EBS gp3 com IOPS e throughput customizados
aws ec2 create-volume \\
  --availability-zone us-east-1a \\
  --size 100 --volume-type gp3 \\
  --iops 6000 --throughput 250 \\
  --encrypted --kms-key-id alias/ebs-default

# Montar EFS em instância Linux
sudo mount -t efs -o tls fs-0abc123:/ /mnt/efs

# Criar FSx for Lustre linkado a bucket S3
aws fsx create-file-system --file-system-type LUSTRE \\
  --storage-capacity 1200 --subnet-ids subnet-xxx \\
  --lustre-configuration DataRepositoryAssociations=\\
  [{DataRepositoryPath=s3://meu-bucket,FileSystemPath=/data}]`}</CodeBlock>

      <Callout tone="success">
        <strong>Take-aways:</strong> escolha guiada por (1) quem acessa — 1 host = EBS, muitos = EFS/FSx; (2) protocolo
        — NFS vs SMB vs POSIX; (3) performance — gp3/io2 para latência, Lustre para throughput; (4) persistência — Instance
        Store nunca em produção crítica.
      </Callout>
    </div>
  );
}
