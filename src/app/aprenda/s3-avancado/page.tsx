import type { Metadata } from 'next';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  ArchDiagram,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'S3 Profundo: Classes, Lifecycle, Replication e Criptografia — SAA-C03',
  description: 'Mergulho profissional no S3 para o exame SAA-C03: 8 storage classes, lifecycle policies, versioning, replication CRR/SRR, Object Lock, encryption SSE-S3/KMS/C/CSE, multipart e performance.',
  keywords: 'S3, storage classes, intelligent tiering, glacier, lifecycle, replication, object lock, SSE-KMS, multipart, SAA-C03',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Objetos precisam ser acessados uma vez por trimestre, com recuperação em minutos, e o custo de armazenamento deve ser o menor possível. Qual storage class escolher?',
    options: [
      'S3 Standard',
      'S3 Standard-IA',
      'S3 Glacier Instant Retrieval',
      'S3 Glacier Deep Archive',
    ],
    correct: 2,
    explanation: 'Glacier Instant Retrieval é a classe ideal para dados acessados raramente (uma vez por trimestre) mas que precisam de recuperação em milissegundos. Standard-IA cobra mínimo 30 dias e tem custo maior; Glacier Deep Archive tem retrieval de horas (não minutos); Standard é caro demais.',
  },
  {
    question: 'Você precisa garantir que arquivos de auditoria financeira NÃO possam ser deletados nem modificados por 7 anos, atendendo exigência regulatória. Qual recurso usar?',
    options: [
      'S3 Versioning com MFA Delete',
      'Bucket Policy com Deny Delete',
      'S3 Object Lock em modo Compliance com retenção de 7 anos',
      'Glacier Vault Lock',
    ],
    correct: 2,
    explanation: 'Object Lock em modo Compliance implementa WORM (Write Once Read Many) e nem a conta root pode remover a retenção antes do prazo — atende SEC 17a-4, FINRA e similares. Versioning + MFA Delete pode ser burlado pela root; Bucket Policy pode ser alterada; Glacier Vault Lock é para o Glacier clássico (legado).',
  },
  {
    question: 'Uma aplicação global (usuários em SP, Tóquio e Londres) precisa fazer upload de vídeos de até 50GB para um bucket em us-east-1 com a maior velocidade possível. Qual combinação resolve?',
    options: [
      'CloudFront como proxy de upload + S3 Standard',
      'S3 Transfer Acceleration + Multipart Upload',
      'Gateway VPC Endpoint + S3 Standard',
      'Replicar o bucket em múltiplas regiões e escrever no mais próximo',
    ],
    correct: 1,
    explanation: 'Transfer Acceleration usa a rede edge da CloudFront para absorver o tráfego de upload perto do usuário e entregar via backbone AWS até o bucket. Multipart Upload é obrigatório para objetos >100MB (recomendado) e >5GB (requerido) — permite paralelismo e resume de partes. VPC Endpoint só resolve tráfego dentro de uma VPC; CloudFront não faz upload aceleração por si; replicar é caro e não resolve upload original.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="s3-avancado"
      title="S3 Profundo: Classes, Lifecycle, Replication e Criptografia"
      icon="🪣"
      xp={80}
      readTime={15}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="block-file-storage"
      nextTitle="EBS, EFS e FSx: Quando Usar Cada Um"
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
        S3 é o serviço mais antigo da AWS (2006) e, provavelmente, o mais cobrado no SAA-C03. Não é só &ldquo;um bucket onde
        jogo arquivo&rdquo;: é object store com 8 storage classes, lifecycle transitions, replicação cross-region/cross-account,
        WORM para compliance, 4 modos de criptografia e performance tuning. Saber escolher a classe certa pode reduzir
        o custo em <strong>80%</strong> — e cair em pegadinha de classe errada é quase garantido na prova.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
        <ExamDomainBadge domain="Secure" weight="30%" color={ACCENT} />
        <ExamDomainBadge domain="Resilient" weight="26%" color={ACCENT} />
      </div>

      <Section title="Modelo mental: S3 é object store, não file system" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Cada <strong>objeto</strong> é um blob imutável com <em>key</em> (caminho completo tipo{' '}
          <InlineCode>fotos/2026/abril/ana.jpg</InlineCode>), metadados e tags. O &ldquo;/&rdquo; no nome é só visual — S3 não
          tem pastas reais, só prefixos. Você não edita objeto; você sobrescreve. E se Versioning estiver ligado, cada
          sobrescrita cria uma nova versão.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Bucket', v: 'Container global único. Nome precisa ser único no mundo. Vive em 1 região.' },
            { k: 'Object', v: 'Arquivo + metadata + tags. Até 5 TB. Key até 1024 bytes.' },
            { k: 'Key', v: 'Nome completo incluindo prefixos. S3 ordena lexicograficamente.' },
            { k: 'Prefix', v: 'Substring da key. Define paralelismo de I/O e escopo de policies.' },
            { k: 'ETag', v: 'Hash do objeto (MD5 para single PUT; hash-of-hashes para multipart).' },
            { k: 'Version ID', v: 'Identificador único quando Versioning está ligado. null se desligado.' },
          ]}
        />
      </Section>

      <Section title="As 8 storage classes — a pegadinha mais comum do SAA" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Decorar classes não é suficiente — você precisa saber quando cada uma <em>ganha</em>. Os vetores de decisão são:
          (1) frequência de acesso, (2) latência tolerada, (3) duração mínima cobrada, (4) custo de retrieval, (5) durabilidade
          multi-AZ ou single-AZ.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Classe', 'Casos de uso', 'Latência', 'Mínimo cobrado', 'Custo armazenamento*']}
          rows={[
            ['S3 Standard', 'Dados quentes, aplicações, conteúdo web', 'ms', 'Nenhum', '$$$$ (0,023/GB)'],
            ['S3 Intelligent-Tiering', 'Padrão de acesso desconhecido/mutável', 'ms', '30 dias', '$$$ + $0,0025/1k obj monitor'],
            ['S3 Standard-IA', 'Backups, DR secundário, acesso mensal', 'ms', '30 dias + 128KB', '$$ (0,0125/GB)'],
            ['S3 One Zone-IA', 'Réplica secundária de dados já replicados', 'ms', '30 dias + 128KB', '$ (0,01/GB) — 1 AZ só'],
            ['S3 Glacier Instant Retrieval', 'Imagens médicas, mídia acessada 1x/trimestre', 'ms', '90 dias + 128KB', '$ (0,004/GB)'],
            ['S3 Glacier Flexible Retrieval', 'Arquivamento, compliance com acesso mensal', '1min–12h', '90 dias + 40KB', '$ (0,0036/GB)'],
            ['S3 Glacier Deep Archive', 'Arquivamento long-term 7–10 anos', '12h ou 48h', '180 dias + 40KB', '¢ (0,00099/GB)'],
            ['S3 Express One Zone', 'ML training, analytics high-IOPS single-AZ', 'sub-ms', 'Nenhum', '$$$$$ — 10× mais rápido'],
          ]}
        />
        <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          * Preços us-east-1 referência abril/2026, podem variar. Foco no ordenamento relativo, não no número absoluto.
        </p>
      </Section>

      <Section title="Intelligent-Tiering: quando o padrão é imprevisível" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Esta classe monitora acessos por objeto e move automaticamente entre tiers. Cobra um pequeno fee de monitoramento
          ($0,0025 por 1.000 objetos), mas elimina o risco de pagar Standard para dados frios. Tiers internos:
        </p>
        <MindMapLocal />
      </Section>

      <Section title="Lifecycle policies — automatize a redução de custo" accent={ACCENT}>
        <p className="text-sm leading-6" style={{ color: 'var(--ffv-muted)' }}>
          Regras de lifecycle aplicam transições e expirações a objetos baseados em idade, tags ou prefixo. Você não paga
          pela transição de forma gratuita — cada transição entre classes tem um custo por 1.000 requisições (além do
          mínimo de dias da classe de destino). Por isso, transitions sem critério podem <em>aumentar</em> custo.
        </p>
        <CodeBlock lang="json">{`{
  "Rules": [{
    "ID": "arquivar-logs-antigos",
    "Status": "Enabled",
    "Filter": { "Prefix": "logs/" },
    "Transitions": [
      { "Days": 30,  "StorageClass": "STANDARD_IA" },
      { "Days": 90,  "StorageClass": "GLACIER_IR" },
      { "Days": 365, "StorageClass": "DEEP_ARCHIVE" }
    ],
    "Expiration": { "Days": 2555 },
    "NoncurrentVersionExpiration": { "NoncurrentDays": 30 }
  }]
}`}</CodeBlock>
        <Callout tone="warn">
          <strong>Pegadinha:</strong> você não pode pular direto de Standard para Glacier Flexible e depois <em>voltar</em>
          para IA — transitions são sempre &ldquo;descendo&rdquo; na hierarquia de custo. Também não faz sentido transitar
          para uma classe mais cara (e a API rejeita).
        </Callout>
      </Section>

      <Section title="Versioning e Object Lock — duas camadas diferentes de proteção" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Recurso', 'Versioning', 'Object Lock']}
          rows={[
            ['Objetivo', 'Recuperar sobrescrita/delete acidental', 'Compliance WORM, ninguém deleta'],
            ['Delete', 'Cria delete marker; versão anterior acessível', 'Bloqueia delete até retention expirar'],
            ['MFA Delete', 'Exige MFA para remover versão ou desligar', 'N/A'],
            ['Pré-requisito', 'Opcional', 'Versioning obrigatório; bucket criado com Object Lock ON'],
            ['Modos', 'N/A', 'Governance (admin pode override) ou Compliance (ninguém, nem root)'],
            ['Holds', 'N/A', 'Legal Hold (indefinido) + Retention period'],
            ['Uso típico', 'Qualquer bucket com dados importantes', 'SEC 17a-4, HIPAA, logs imutáveis'],
          ]}
        />
        <ArchDiagram title="Fluxo de delete com Versioning ligado" accent={ACCENT}>
{`Estado inicial:
  foto.jpg  version=v1  (current)

Após DELETE foto.jpg (sem version-id):
  foto.jpg  version=null  isLatest=true   type=DeleteMarker
  foto.jpg  version=v1    isLatest=false  type=Object
  → GET foto.jpg retorna 404
  → GET foto.jpg?versionId=v1 retorna o arquivo original

Recuperar:
  DELETE foto.jpg?versionId=<delete-marker-id>
  → v1 volta a ser current`}
        </ArchDiagram>
      </Section>

      <Section title="Replication — CRR e SRR em profundidade" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Descrição', 'Caso de uso']}
          rows={[
            ['SRR (Same-Region)', 'Réplica no mesmo região, bucket diferente', 'Agregar logs de múltiplas contas em um bucket central'],
            ['CRR (Cross-Region)', 'Réplica em outra região', 'DR, baixa latência de leitura em múltiplas geografias, compliance de localização de dados'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Async', v: 'Replicação é assíncrona — S3 garante eventual consistency.' },
            { k: 'Versioning', v: 'Obrigatório em source E destination.' },
            { k: 'Objetos novos apenas', v: 'Por padrão, só replica o que foi escrito após a regra ser criada. Use S3 Batch Replication para retroativa.' },
            { k: 'Cross-account', v: 'Suporta replicação entre contas — bucket policy do destino precisa conceder s3:ReplicateObject.' },
            { k: 'RTC', v: 'Replication Time Control garante 99,99% das réplicas em <15min (SLA pago).' },
            { k: 'Delete markers', v: 'Por padrão NÃO replica delete markers. Ative explicitamente se quiser. Tombstone rules se aplicam.' },
            { k: 'No-chain', v: 'Réplica não replica de novo. Se bucket B é réplica de A, objetos que chegam em B via replicação não vão para bucket C (a menos que escritos diretamente em B).' },
            { k: 'Classes permitidas', v: 'Você pode forçar a classe do destino (ex: Standard → Standard-IA) para economizar em DR.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Preciso atender compliance que exige cópia imutável em outra região + storage barato para DR"
          winner="CRR + Object Lock no destino + classe Glacier Instant no destino"
          why="Cross-region cobre requisito geográfico; Object Lock garante imutabilidade; Glacier IR mantém leitura ms para recuperação rápida sem custo de Standard."
          alternatives={[
            { name: 'CRR + Standard-IA', note: 'mais barato que Standard mas sem imutabilidade garantida.' },
            { name: 'AWS Backup', note: 'abstração mais alta, mas menos controle sobre classes.' },
          ]}
        />
      </Section>

      <Section title="Criptografia — 4 modos com diferenças sutis" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modo', 'Quem tem a chave', 'Quem criptografa', 'Auditoria']}
          rows={[
            ['SSE-S3 (AES-256)', 'AWS (chave gerenciada por S3)', 'S3 server-side', 'Nenhuma visibilidade da chave'],
            ['SSE-KMS', 'AWS KMS (CMK customer-managed ou aws-managed)', 'S3 server-side via KMS', 'CloudTrail loga cada Decrypt/Encrypt — controle granular'],
            ['SSE-C (customer-provided)', 'Você envia a chave em cada request (header)', 'S3 server-side com sua chave', 'S3 não armazena a chave — você é responsável'],
            ['CSE (Client-Side)', 'Você (S3 Encryption Client ou próprio)', 'Cliente antes do PUT', 'Objeto já chega criptografado em S3'],
          ]}
        />
        <Callout tone="info">
          <strong>Desde janeiro/2023:</strong> SSE-S3 é <em>default</em> para TODO bucket novo. Não existe mais objeto &ldquo;em
          claro&rdquo; em S3. Se você não especificar nada, AES-256 é aplicado. Para ter controle/auditoria via KMS, você
          precisa ativar SSE-KMS explicitamente.
        </Callout>
        <Callout tone="warn">
          <strong>SSE-KMS tem limite de TPS:</strong> cada GET/PUT em objeto SSE-KMS chama{' '}
          <InlineCode>kms:Decrypt</InlineCode>/<InlineCode>Encrypt</InlineCode>. O limite default do KMS é 5.500–30.000
          req/s dependendo da região — se você tem workload de altíssimo throughput em S3, ative{' '}
          <strong>S3 Bucket Keys</strong> (reduz chamadas KMS em ~99%) ou vá para SSE-S3.
        </Callout>
        <CodeBlock lang="bash">{`# Subir com SSE-KMS usando CMK específica
aws s3 cp relatorio.pdf s3://meu-bucket/ \\
  --sse aws:kms \\
  --sse-kms-key-id arn:aws:kms:us-east-1:111111111111:key/abc-123

# Negar uploads sem SSE-KMS via bucket policy
# "Condition": { "StringNotEquals": { "s3:x-amz-server-side-encryption": "aws:kms" } }`}</CodeBlock>
      </Section>

      <Section title="Controle de acesso — as 4 camadas que somam (não substituem)" accent={ACCENT}>
        <ArchDiagram title="Ordem de avaliação de acesso a objeto S3" accent={ACCENT}>
{`Request PUT/GET s3://bucket/key
         │
         ▼
  ┌──────────────────┐   NÃO   ┌──────────┐
  │ Block Public     │────────▶│ Bloqueia │
  │ Access ativo?    │         │ se for   │
  └────────┬─────────┘         │ público  │
           │ OK                 └──────────┘
           ▼
  ┌──────────────────┐
  │ IAM Policy da    │── Deny explicit  → NEGA
  │ identidade chama │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ Bucket Policy    │── Deny explicit  → NEGA
  │ (resource-based) │── Allow          → continua
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ ACL (legado)     │── Allow (não recomendado hoje)
  └────────┬─────────┘
           │
           ▼
      PERMITE se ao menos um Allow e nenhum Deny`}
        </ArchDiagram>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Block Public Access', v: 'Flag de 4 configurações a nível de conta + bucket. Liga por padrão em buckets novos. Override de qualquer policy que tentar expor público.' },
            { k: 'IAM Policy', v: 'Identity-based. Quem é o principal e o que pode fazer.' },
            { k: 'Bucket Policy', v: 'Resource-based (JSON). Mais comum para cross-account e requisitos como forçar HTTPS, exigir criptografia etc.' },
            { k: 'ACL', v: 'Legado (pre-IAM). AWS recomenda desabilitar (Object Ownership = Bucket owner enforced). Ainda útil para alguns casos de delivery.' },
            { k: 'Access Points', v: 'Endpoints nomeados com policy própria. Útil para dezenas de equipes com escopos distintos no mesmo bucket.' },
            { k: 'Pre-signed URLs', v: 'URL temporária com credenciais encodadas. Ideal para download direto via browser sem expor credenciais.' },
          ]}
        />
      </Section>

      <Section title="Performance — multipart, prefix parallelism e Transfer Acceleration" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Multipart Upload', v: 'Recomendado > 100MB, obrigatório > 5GB. Parte de 5MB–5GB. Até 10.000 partes. Permite retry por parte, paralelismo e resume.' },
            { k: 'Byte-range fetches', v: 'Paralelize DOWNLOADS quebrando um objeto grande em faixas de bytes com Range: bytes=X-Y.' },
            { k: 'Prefix paralelism', v: 'S3 escala automaticamente ~3.500 PUT/s e ~5.500 GET/s por prefixo. Distribua keys em muitos prefixos para throughput massivo.' },
            { k: 'Transfer Acceleration', v: 'Usa POPs CloudFront como entrada. Custo extra $0,04/GB mas pode acelerar uploads globais em 50–500%.' },
            { k: 'S3 Select', v: 'Executa SQL simples sobre CSV/JSON/Parquet e retorna só as colunas filtradas — reduz dados transferidos e custo de compute no client.' },
            { k: 'Requester Pays', v: 'Quem faz download paga transferência. Use para distribuir datasets públicos sem arcar com egress.' },
          ]}
        />
        <Callout tone="success">
          <strong>Padrão de alto throughput:</strong> hash do hora/id no início da key para distribuir em múltiplos prefixos.
          Em vez de <InlineCode>2026/04/16/log-001</InlineCode>, use{' '}
          <InlineCode>a7f/2026/04/16/log-001</InlineCode> onde a7f é hash dos primeiros bytes — garante paralelismo
          horizontal no I/O interno do S3.
        </Callout>
      </Section>

      <Section title="Eventos, inventário e observabilidade" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'S3 Event Notifications', v: 'Dispara para SNS/SQS/Lambda/EventBridge em PUT/DELETE/Replication/Restore. Base de pipelines serverless.' },
            { k: 'EventBridge', v: 'Destino mais moderno — suporta filtros, regras cross-account e entrega para 20+ targets nativos.' },
            { k: 'S3 Inventory', v: 'Relatório CSV/ORC/Parquet diário ou semanal com lista de objetos + metadata. Usado para auditoria, reconciliação e input de Batch Operations.' },
            { k: 'S3 Storage Lens', v: 'Dashboard com métricas de uso, custo, atividade — 28 dias grátis, advanced 15 meses ($).' },
            { k: 'S3 Batch Operations', v: 'Executa operação em milhões de objetos (copy, tag, invoke Lambda, restore Glacier) com um único job managed.' },
          ]}
        />
      </Section>

      <Section title="Decisões arquiteturais típicas do SAA" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Website estático servido globalmente com latência baixa e HTTPS + domínio custom"
          winner="S3 + CloudFront + Route 53 + ACM"
          why="S3 Static Website hosting sozinho não faz HTTPS com domínio custom. CloudFront resolve HTTPS, cache global, WAF opcional, e usa OAC para restringir o bucket a tráfego só via CF."
          alternatives={[
            { name: 'S3 Static Website direto', note: 'HTTP apenas, sem CDN. Não passa em exame moderno.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Data lake com Parquet particionado — analistas rodam queries ad-hoc"
          winner="S3 Standard + Athena + Glue Data Catalog + S3 Select/Intelligent-Tiering"
          why="Athena paga por TB escaneado. Parquet colunar + S3 Select reduzem scan. Intelligent-Tiering move partições frias sem quebrar queries."
          alternatives={[
            { name: 'Redshift', note: 'caro se queries são esporádicas; faz sentido em workload dedicado.' },
          ]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Upload de 5TB on-prem para S3, link de 100 Mbps"
          winner="AWS Snowball Edge (ou DataSync em rede adequada)"
          why="5TB em 100Mbps = ~5 dias 24h contínuos. Snowball chega em 1 semana e transfere em horas. DataSync faz sentido se o link aguentar + agendamento incremental."
          alternatives={[
            { name: 'CLI com multipart + TA', note: 'viável para dezenas de GB, não TB sobre 100Mbps.' },
          ]}
        />
      </Section>

      <Section title="Armadilhas clássicas do exame" accent={ACCENT}>
        <Callout tone="danger">
          <strong>Standard-IA vs One Zone-IA:</strong> One Zone é single-AZ. Se a AZ for perdida, dados somem. Use SOMENTE
          para réplicas secundárias de dados já duráveis em outro lugar. Exame tenta te fazer escolher One Zone para
          &ldquo;primário de backup&rdquo; — é pegadinha, não passe.
        </Callout>
        <Callout tone="danger">
          <strong>Glacier ≠ S3 Glacier storage class:</strong> o exame ainda cita &ldquo;S3 Glacier&rdquo; como classe dentro
          de S3 (não o serviço standalone antigo). Glacier Flexible Retrieval = antigo &ldquo;Glacier&rdquo;. Glacier Instant
          Retrieval é classe nova com latência ms. Glacier Deep Archive é a mais barata com retrieval de horas.
        </Callout>
        <Callout tone="danger">
          <strong>Encryption in transit:</strong> S3 aceita HTTP e HTTPS por padrão. Para forçar HTTPS only, bucket policy
          com <InlineCode>{'"aws:SecureTransport": "false"'}</InlineCode> em Deny. Questões de compliance sempre esperam
          essa policy.
        </Callout>
        <Callout tone="danger">
          <strong>Bucket Names são globais:</strong> não pode ter dois buckets com o mesmo nome no mundo. Por isso não
          há namespace por conta. Exame pergunta sobre conflitos de nome quando alguém tenta recriar.
        </Callout>
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="A aplicação escreve 10.000 objetos/s em um único prefixo e está recebendo 503 SlowDown. Solução mais barata?"
          a={
            <span>
              Distribuir as keys em múltiplos prefixos (hash ou partição temporal reversa). S3 escala por prefixo — 3.500
              PUT/s é o limite aproximado por prefix, mas você pode ter <strong>milhares</strong> de prefixos no bucket
              automaticamente. Nada precisa ser provisionado.
            </span>
          }
        />
        <QAItem
          q="Preciso que arquivos expirem automaticamente após 30 dias exceto os marcados com tag 'legal-hold'."
          a={
            <span>
              Lifecycle rule com filtro por tag: a regra de expiração aplica-se quando <em>todas</em> as condições batem.
              Para excluir tag específica, crie duas regras: uma geral de expiração em 30d sem filtro de tag, e uma regra
              mais específica com filtro <InlineCode>legal-hold=true</InlineCode> que NÃO expira — na verdade, o jeito
              correto é filtrar positivamente no prefixo/tag alvo. Object Lock Legal Hold é alternativa mais forte.
            </span>
          }
        />
        <QAItem
          q="Bucket privado tem public read via Block Public Access desligado e bucket policy allow *. Alguém consegue acessar?"
          a={
            <span>
              Depende do BPA da conta. Se BPA de <em>conta</em> está ativo, override. Se nem conta nem bucket bloqueiam,
              a policy public allow vale e qualquer um acessa anonimamente. Lição: sempre deixe BPA ligado e use Access
              Points ou pre-signed URLs para exposição pontual.
            </span>
          }
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> (1) escolha de storage class = custo × latência × duração mínima; (2) Versioning + Object
        Lock + Replication são camadas independentes e combináveis; (3) SSE-KMS dá auditoria mas escala via Bucket Keys;
        (4) BPA é seu backstop; (5) multipart + prefix paralelism + Transfer Acceleration resolvem 95% dos casos de
        performance. Entenda esses cinco vetores e S3 deixa de ser pegadinha.
      </Callout>
    </div>
  );
}

function MindMapLocal() {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
      <p className="text-sm font-bold mb-3" style={{ color: ACCENT }}>🧠 Intelligent-Tiering tiers (automáticos)</p>
      <ul className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--ffv-muted)' }}>
        <li><span style={{ color: ACCENT }}>→</span> <strong>Frequent Access</strong> — default, objeto recém-escrito ou acessado nos últimos 30d</li>
        <li><span style={{ color: ACCENT }}>→</span> <strong>Infrequent Access</strong> — sem acesso por 30d, custo ~40% menor</li>
        <li><span style={{ color: ACCENT }}>→</span> <strong>Archive Instant Access</strong> — sem acesso por 90d, custo ~68% menor, latência ms</li>
        <li><span style={{ color: ACCENT }}>→</span> <strong>Archive Access (opt-in)</strong> — sem acesso por 90–730d, minutos para recuperar</li>
        <li><span style={{ color: ACCENT }}>→</span> <strong>Deep Archive Access (opt-in)</strong> — sem acesso por 180–730d, horas para recuperar</li>
      </ul>
    </div>
  );
}
