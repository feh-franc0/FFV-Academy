import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('hibrido-direct-connect');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Direct Connect vs Site-to-Site VPN: trade-off?',
    options: [
      'VPN sempre ganha',
      'DX: dedicated physical link, latência consistente, maior throughput (1/10/100 Gbps), SLA previsível — custo alto + setup semanas. VPN: over-the-internet IPsec, deploy em minutos, custo baixo — latência e jitter variam. Produção crítica = DX; backup/dev = VPN; DX + VPN backup = padrão enterprise',
      'DX é grátis',
      'São iguais',
    ],
    correct: 1,
    explanation: 'DX exige colocation em provider (Equinix, Level3) ou partner, meses de provisioning. VPN usa internet pública com IPsec, latência e jitter imprevisíveis. Melhor prática: DX como primário + VPN como failover automático (mesmo virtual interface via BGP). Em prova SAP, cenários de latência consistente + throughput alto apontam pra DX.',
  },
  {
    question: 'Storage Gateway: quando cada modo?',
    options: [
      'É tudo igual',
      'File Gateway: expõe S3 como NFS/SMB pra servidores/workstations on-prem (arquivos, backup). Volume Gateway: expõe S3 como iSCSI block volume (DB backup, snapshots EBS-like). Tape Gateway: substitui VTL de fitas físicas por S3 Glacier — economiza fisicalmente infra de backup',
      'Só arquivos',
      'Só backup',
    ],
    correct: 1,
    explanation: 'File Gateway é o mais comum — compartilhamento de arquivos on-prem sincronizando com S3. Volume Gateway serve workloads que exigem block storage tradicional mas querem backup em S3. Tape Gateway é nicho de migração: bancos com investimento em software de backup VTL (Veeam, NetBackup) tradicional sem querer mudar ferramenta.',
  },
  {
    question: 'DataSync resolve quê exatamente?',
    options: [
      'CDN',
      'Bulk transfer de arquivos de alto throughput entre on-prem (NFS/SMB/HDFS/object) e AWS (S3/EFS/FSx/S3 on Outposts) com paralelismo, verificação de integridade, bandwidth throttling. 10x mais rápido que rsync/scp em escala. Agendável por cron, incremental',
      'Streaming',
      'VPN',
    ],
    correct: 1,
    explanation: 'DataSync é otimizado para transferência bulk — agente no on-prem paraleliza reads, compacta na rede, verifica checksums. Casos: migração inicial de 100TB, sync incremental diário de backup, archive contínuo de logs em S3. Não é substituto de Kafka/Kinesis (tempo real); é batch de alta performance.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="hibrido-direct-connect"
      title="Híbrido: Direct Connect, Site-to-Site VPN, Storage Gateway"
      icon="🔗"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="cicd-enterprise-sap"
      nextTitle="CI/CD enterprise multi-account com CDK Pipelines"
      quiz={quiz}
    >
      <Section title="Direct Connect em detalhe" accent={accent}>
        <CodeBlock lang="yaml">{`Tipos de conexão DX:
  Dedicated:    porta física 1/10/100 Gbps em DX location
  Hosted:       sub-conexão via AWS Direct Connect Partner
                (velocidades fracionadas 50Mbps-10Gbps)

Virtual Interfaces (VIF):
  Private VIF:  conecta a VPC (via VGW ou DX Gateway)
  Public VIF:   conecta a serviços públicos AWS (S3, etc)
  Transit VIF:  conecta a Transit Gateway (multi-VPC)

Topologia enterprise:
  On-prem  ──DX (10Gbps)──  DX Gateway  ──  Transit Gateway
    │                                             │
    └──VPN backup (IPsec)────────────────────────┘

  BGP dinâmico: DX preferred, VPN como failover automático`}</CodeBlock>
      </Section>

      <Section title="Storage Gateway + DataSync + Transfer Family" accent={accent}>
        <p>
          Storage Gateway é a camada de protocolo (NFS/SMB/iSCSI/VTL) para on-prem consumir S3 transparentemente. DataSync é o bulk mover (migração ou sync regular). Transfer Family entrega SFTP/FTPS/FTP-as-a-service para parceiros externos enviarem arquivos direto para S3 sem pipeline customizado. Os três podem coexistir em arquitetura híbrida real.
        </p>
        <CodeBlock lang="bash">{`# DataSync task: on-prem NFS → S3, diário, incremental
aws datasync create-task \
  --source-location-arn arn:aws:datasync:...:location/nfs-onprem \
  --destination-location-arn arn:aws:datasync:...:location/s3-archive \
  --options VerifyMode=POINT_IN_TIME_CONSISTENT,TaskQueueing=ENABLED \
  --schedule ScheduleExpression="cron(0 2 * * ? *)"

# Transfer Family: endpoint SFTP managed pra parceiros
aws transfer create-server \
  --protocols SFTP \
  --identity-provider-type AWS_DIRECTORY_SERVICE \
  --endpoint-type VPC \
  --tags Key=team,Value=edi`}</CodeBlock>
      </Section>

      <Section title="Patterns híbridos reais" accent={accent}>
        <p>
          "Rack on-prem com servidores legados conversando com Aurora em AWS" = DX + VGW na VPC, Aurora acessível via private endpoint, encryption in-transit com TLS. "Backup centralizado de 50 filiais na AWS" = Storage Gateway File nas filiais + S3 Lifecycle pra Glacier + cross-region replication para DR. "Parceiros B2B mandando arquivos" = Transfer Family SFTP + S3 bucket com event trigger Lambda de processamento.
        </p>
        <Callout tone="success" icon="✅">
          Checklist de hybrid maduro: DX + VPN backup com BGP, Transit Gateway como hub, Storage Gateway onde há legado dependente de NFS/SMB/iSCSI, DataSync pra migração e backup recorrente, Transfer Family pra parceiros. Criptografia em trânsito e at-rest obrigatória pra compliance.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
