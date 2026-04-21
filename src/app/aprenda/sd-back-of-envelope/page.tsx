import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';
import { CodePlayground } from '@/components/article/CodePlayground';

export const metadata = getModuleMetadata('sd-back-of-envelope');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Em 2 minutos, um serviço recebe 10k requests/s e cada request grava 4KB. Qual o throughput de escrita por dia?',
    options: [
      '~400 MB/dia',
      '~3.3 TB/dia — 10k/s × 4KB = 40 MB/s; × 86400s ≈ 3.46 TB/dia. Esse número muda a decisão de DB (S3 + compaction vs Postgres direto)',
      '~40 GB/dia',
      'Depende do DB',
    ],
    correct: 1,
    explanation: '10.000 req/s × 4KB = 40.000 KB/s = 40 MB/s. 40 MB/s × 86.400s/dia ≈ 3.456.000 MB/dia = 3,45 TB/dia. Em 1 ano ≈ 1,26 PB. Entende o tamanho rapidamente muda sua proposta: 3TB/dia não é Postgres single-node, é stream + object storage + warehouse.',
  },
  {
    question: 'Você vai armazenar 1 bilhão de usuários com perfil médio 1KB. Quanto de storage precisa?',
    options: [
      '1 TB',
      '~1 TB para o perfil bruto. Mas some: index (200-500 GB), replica 2-3x, hot/cold tiering. Total realista 3-5 TB replicado. O "1TB" inicial esconde o real',
      '10 TB',
      '100 GB',
    ],
    correct: 1,
    explanation: '10^9 × 10^3 B = 10^12 B = 1 TB bruto. Mas produção real: índices secundários (~30% extra), replicação 3x (Raft/SSTable), hot/cold tiering. "1 bilhão de usuários = 1 TB" é resposta de entrevista ruim — "1 TB bruto, 3-5 TB na realidade com replicação e índices" é resposta sênior.',
  },
  {
    question: 'Qual é a latência típica de um SSD NVMe vs HDD em leitura aleatória?',
    options: [
      'Iguais',
      'NVMe: ~100 µs (microssegundos). HDD: ~10 ms (milissegundos). Diferença de ~100x. Isso muda se cache secundário vale a pena, se busca "paralela em disco" escala, se batch-per-query faz sentido',
      'HDD é mais rápido em leitura aleatória',
      'Depende só do tamanho',
    ],
    correct: 1,
    explanation: 'SSD NVMe: 50-150 µs em leitura 4K aleatória. HDD spinning: 5-15 ms (seek + rotational latency). 100x de diferença. Em system design, isso significa: HDD exige batch + sequential access, SSD permite queries random-access. Warehouses modernos (Snowflake, BigQuery) assumem SSD; sistemas legados em HDD precisam padrões diferentes (LSM-tree vs B-tree).',
  },
  {
    question: 'Você precisa servir imagens. 1 milhão de usuários, média 10 imagens cada, 500KB/imagem. Qual a primeira decisão?',
    options: [
      'Postgres BLOB',
      'Calcule storage: 10^6 × 10 × 500KB = 5 TB. Saia de DB relacional — vai pra object storage (S3/GCS) + CDN. DB guarda só a URL. Qualquer BLOB em DB relacional com 5TB é anti-padrão',
      'Mongo GridFS',
      'Arquivos no servidor',
    ],
    correct: 1,
    explanation: '5 TB de imagens em Postgres BLOB destrói backup, replica, query performance. Object storage (S3, GCS, R2) é $0.023/GB/mês, serve via CDN em edge, escala infinitamente. DB armazena metadata (URL, dimensões, owner). Essa é decisão de 2 minutos com back-of-envelope, não 2 semanas de discussão.',
  },
  {
    question: 'Qual o maior erro em entrevista ao usar back-of-envelope?',
    options: [
      'Errar na conta',
      'Fazer conta certa mas não conectar com decisão arquitetural. "3 TB/dia" sem seguir com "portanto, não cabe em um single node MySQL — sugiro X" é número sem insight',
      'Usar calculadora',
      'Não memorizar latency numbers',
    ],
    correct: 1,
    explanation: 'Entrevistador não quer ver cálculo mental impressivo — quer ver você raciocinando sobre escala. Erro comum: "10k QPS, 4KB/req, logo 40MB/s" e segue pro próximo tópico sem concluir. Correto: "40MB/s = 3TB/dia = single-node MySQL inviável, portanto proponho Kafka + Cassandra OU S3 + Spark batch". O número existe pra justificar a decisão seguinte.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-back-of-envelope"
      title="Back-of-envelope: cálculos que convencem"
      icon="🧮"
      xp={60}
      readTime={14}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-url-shortener"
      nextTitle="Case: URL shortener"
      quiz={quiz}
    >
      <Section title="Por que back-of-envelope é a skill mais importante em System Design" accent={accent}>
        <p>
          Em uma entrevista de System Design de 45 minutos, você <strong>não vai escrever código</strong>. Você vai fazer trade-offs. E todo trade-off bom começa com <em>magnitude</em>: 100 QPS é diferente de 100k QPS. 1 TB é diferente de 1 PB. Quem não sabe calcular isso em 30 segundos, perde 10 minutos discutindo coisa errada.
        </p>
        <p>
          Mas o ponto <strong>não é</strong> memorizar números ou fazer aritmética impressiva. O ponto é <strong>usar o número pra tomar decisão arquitetural</strong>. "3 TB/dia de escrita" só vale se você concluir com "portanto, não é single-node MySQL".
        </p>
        <Callout tone="info" icon="🎯">
          <strong>Teste de ouro</strong>: se você fez uma conta e não disse a próxima decisão a partir dela, você <em>ainda não terminou o raciocínio</em>.
        </Callout>
      </Section>

      <Section title="Os 3 pilares: latência, throughput, storage" accent={accent}>
        <p>Todo sistema responde a 3 perguntas de magnitude. Saiba responder cada uma em ≤ 60 segundos.</p>

        <h3 className="font-bold mt-4 mb-2">1. Latência — quanto demora uma operação</h3>
        <KeyValue
          accent={accent}
          items={[
            { k: 'L1 cache', v: '~0.5 ns' },
            { k: 'L2 cache', v: '~7 ns' },
            { k: 'RAM acesso random', v: '~100 ns' },
            { k: 'Compress 1KB (zlib)', v: '~3 µs' },
            { k: 'SSD NVMe read 4K', v: '~100 µs' },
            { k: 'Datacenter round-trip', v: '~500 µs' },
            { k: 'HDD seek', v: '~10 ms' },
            { k: 'Cross-region (US-EU)', v: '~100-150 ms' },
            { k: 'Cross-continent (US-ASIA)', v: '~180-250 ms' },
            { k: 'HTTPS handshake', v: '~50-200 ms' },
          ]}
        />
        <Callout tone="warn">
          <strong>Regra de ouro</strong>: RAM é ~1000x mais rápida que SSD, que é ~100x mais rápida que HDD, que é ~10x mais rápida que cross-region. <em>Três ordens de magnitude</em> separam cada camada.
        </Callout>

        <h3 className="font-bold mt-4 mb-2">2. Throughput — quanto cabe por segundo</h3>
        <KeyValue
          accent={accent}
          items={[
            { k: 'QPS típico read-heavy por node', v: '~10k-50k' },
            { k: 'QPS típico write-heavy por node', v: '~1k-5k' },
            { k: 'Postgres single-node', v: '~10k-20k tx/s em hardware médio' },
            { k: 'Redis single-node', v: '~100k-500k ops/s' },
            { k: 'Kafka por broker', v: '~100 MB/s escrita sustentada' },
            { k: 'S3 por prefix', v: '~3500 PUT/s, 5500 GET/s (auto-split)' },
            { k: 'Load balancer L7', v: '~100k conn/s' },
            { k: 'Rede 10Gbps', v: '~1.25 GB/s em teórico' },
          ]}
        />

        <h3 className="font-bold mt-4 mb-2">3. Storage — quanto ocupa</h3>
        <KeyValue
          accent={accent}
          items={[
            { k: 'char ASCII', v: '1 byte' },
            { k: 'int32', v: '4 bytes' },
            { k: 'UUID string', v: '36 bytes' },
            { k: 'timestamp ISO', v: '20 bytes' },
            { k: 'linha user profile média', v: '~1 KB' },
            { k: 'tweet / post curto', v: '~500 B' },
            { k: 'imagem thumbnail', v: '~50 KB' },
            { k: 'imagem HD', v: '~500 KB - 2 MB' },
            { k: 'vídeo 1min 720p', v: '~50-100 MB' },
            { k: 'overhead index B-tree', v: '~30% do dataset' },
          ]}
        />
      </Section>

      <Section title="Powers of 10 — a única multiplicação que você precisa dominar" accent={accent}>
        <p>
          Engenheiros sêniores convertem <code>10^6 × 10^3 = 10^9</code> em milésimo de segundo. Se você faz "10 milhões vezes 5 mil" no dedo, perdeu o ritmo da entrevista.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Expoente', 'Nome', 'Bytes', 'Contexto']}
          rows={[
            ['10³', 'kilo (K)', 'KB', '1 linha de DB ≈ 1 KB'],
            ['10⁶', 'mega (M)', 'MB', '1M users × 1KB = 1 GB'],
            ['10⁹', 'giga (G)', 'GB', '1B rows × 1KB = 1 TB'],
            ['10¹²', 'tera (T)', 'TB', '1 dia de logs web-scale'],
            ['10¹⁵', 'peta (P)', 'PB', '1 ano de logs Netflix-scale'],
          ]}
        />
        <p><strong>Segundos em expoentes</strong>:</p>
        <KeyValue
          accent={accent}
          items={[
            { k: '1 minuto', v: '60 s' },
            { k: '1 hora', v: '3.600 s ≈ 3.6 × 10³' },
            { k: '1 dia', v: '86.400 s ≈ 10⁵' },
            { k: '1 mês', v: '~2.6 × 10⁶ s' },
            { k: '1 ano', v: '~3.15 × 10⁷ s' },
          ]}
        />
        <Callout tone="info" icon="🧠">
          <strong>Truque canônico</strong>: <code>10k QPS × 1 dia ≈ 1 bilhão de requests</code>. Vale memorizar. "10 mil/s durante um dia = 1B" aparece em toda entrevista de scale.
        </Callout>
      </Section>

      <Section title="Framework de 4 passos na entrevista" accent={accent}>
        <p>Todo exercício de back-of-envelope em entrevista segue a mesma estrutura. Pratique até virar automático.</p>
        <ol className="list-decimal pl-5 my-3 text-sm space-y-2">
          <li>
            <strong>Pergunte premissas antes de calcular</strong> — "Quantos usuários? DAU ou MAU? Média ou pico? Leitura ou escrita dominante?" Sem premissa, conta não convence.
          </li>
          <li>
            <strong>Calcule em voz alta com unidades</strong> — "100M DAU, cada um faz 20 requests/dia: 2B req/dia ÷ 86k s/dia ≈ 23k QPS média. Pico 3x = 70k QPS". Explicite cada passo.
          </li>
          <li>
            <strong>Arredonde agressivamente</strong> — 86.400 vira 10⁵, 365 vira 3×10². Precisão vira inimiga da velocidade. Erro de ±2x é aceitável.
          </li>
          <li>
            <strong>Conecte com decisão arquitetural</strong> — "70k QPS de escrita é &gt; que 1 MySQL primary. Preciso sharding OU log-structured store como Cassandra OU stream Kafka + processamento async".
          </li>
        </ol>
      </Section>

      <Section title="Exemplo ao vivo: Twitter-like feed" accent={accent}>
        <p>Pergunta: "Desenhe um sistema tipo Twitter. Assuma 200M DAU, cada um vê 50 tweets/dia e posta 2 tweets/dia."</p>

        <p><strong>Cálculo canônico</strong>:</p>
        <CodePlayground
          lang="python"
          title="Back-of-envelope interativo"
          accent={accent}
          initial={`# Dimensionamento Twitter-like
DAU = 200_000_000
TWEETS_LIDOS_POR_USER_DIA = 50
TWEETS_POSTADOS_POR_USER_DIA = 2
TAMANHO_TWEET_BYTES = 300     # média: 280 chars + metadata
SEGUNDOS_DIA = 86_400

# Leitura
reads_dia = DAU * TWEETS_LIDOS_POR_USER_DIA
read_qps_media = reads_dia / SEGUNDOS_DIA
read_qps_pico = read_qps_media * 3            # pico 3x em horário nobre
print(f"Reads médio: {read_qps_media:>12,.0f} QPS")
print(f"Reads pico : {read_qps_pico:>12,.0f} QPS")

# Escrita
writes_dia = DAU * TWEETS_POSTADOS_POR_USER_DIA
write_qps_media = writes_dia / SEGUNDOS_DIA
write_qps_pico = write_qps_media * 3
print(f"Writes médio:{write_qps_media:>12,.0f} QPS")
print(f"Writes pico :{write_qps_pico:>12,.0f} QPS")

# Storage de tweets/dia
storage_dia_bytes = writes_dia * TAMANHO_TWEET_BYTES
storage_dia_tb = storage_dia_bytes / (1024**4)
print(f"Storage/dia: {storage_dia_tb:>9.2f} TB (só tweets, sem índice/replica)")

# Com replicação 3x + índices + metadata ~30% overhead
storage_real = storage_dia_tb * 3 * 1.3
print(f"Storage real/dia: {storage_real:.2f} TB (replicado + indexado)")

# Ano
storage_ano_pb = storage_real * 365 / 1024
print(f"Storage/ano: {storage_ano_pb:.2f} PB")
`}
        />

        <p><strong>Decisões arquiteturais que decorrem</strong>:</p>
        <ul className="list-disc pl-5 my-2 text-sm space-y-1">
          <li><strong>~350k reads QPS pico</strong> → cache agressivo (Redis/Memcached), tweets em memória, fan-out no write pra timelines de usuário ativo</li>
          <li><strong>~14k writes QPS pico</strong> → fila (Kafka) + workers assíncronos populando feed, não grava sincronamente pros seguidores</li>
          <li><strong>~0.5 PB/ano</strong> → impossível em SQL single-node; Cassandra pra tweet store + S3 pra mídias + Redshift/BigQuery pra analytics</li>
          <li><strong>Hot tweets</strong> (Kardashian com 100M followers): fan-out on read, não on write. Senão 100M escritas por 1 post</li>
        </ul>
      </Section>

      <Section title="Os 5 erros mortais em back-of-envelope" accent={accent}>
        <ol className="list-decimal pl-5 my-2 text-sm space-y-2">
          <li>
            <strong>Confundir bit e byte</strong>. "10 Gbps" é 10 gigabits/s = 1.25 GB/s. Rede vem em bits; storage em bytes. Confundir = off-by-8.
          </li>
          <li>
            <strong>Usar média quando importa o pico</strong>. "Facebook tem 1B QPS médio" é inútil — pico real é 3-10x maior e define a capacidade.
          </li>
          <li>
            <strong>Esquecer replicação e índice</strong>. Dataset bruto "é 1 TB" — mas com replica 3x + índice ~30% + hot/cold tier, real ≈ 4-5 TB.
          </li>
          <li>
            <strong>Calcular storage sem considerar compactação</strong>. Logs compactados chegam a 10x menores. Parquet + snappy reduz 3-5x textual data.
          </li>
          <li>
            <strong>Não levar a decisão arquitetural</strong>. Número sem conclusão é trivia, não engenharia.
          </li>
        </ol>
      </Section>

      <Section title="Take-away: números que entrevistador espera que você saiba" accent={accent}>
        <p>Memorize essa tabela. Ela cobre 90% dos cálculos que aparecem em entrevista sênior.</p>
        <ComparisonTable
          accent={accent}
          headers={['Grandeza', 'Valor memorizar', 'Uso']}
          rows={[
            ['Segundos/dia', '~10⁵ (86.4k)', 'Converter req/s ↔ req/dia'],
            ['RAM read', '~100 ns', 'Cache hit latência'],
            ['SSD read 4K', '~100 µs', 'DB sem cache latência'],
            ['Network 1KB mesmo DC', '~250 µs', 'Service mesh RTT'],
            ['Cross-region RTT', '~100 ms', 'Disaster recovery design'],
            ['Postgres single-node', '~10k tx/s, ~2TB', 'Quando partir pra sharding'],
            ['Kafka por broker', '~100 MB/s', 'Tamanho do cluster de ingestão'],
            ['S3 $/GB/mês', '~$0.023', 'Cost vs EBS (~$0.10) / RDS (~$0.30)'],
            ['Redis latência', '~1 ms mesmo DC', 'Cache layer design'],
          ]}
        />
        <Callout tone="success" icon="🎓">
          Back-of-envelope virtuoso em entrevista &ne; memorização bruta. É <strong>usar números pra narrar decisões</strong>: "Esse volume cabe em X, logo proponho Y". A conta é só a legenda da decisão arquitetural que vem depois.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
