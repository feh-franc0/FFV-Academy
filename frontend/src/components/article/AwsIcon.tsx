import type { ReactElement } from 'react';

/**
 * Glifos vetoriais para diagramas de arquitetura AWS.
 *
 * NOTA DE LICENÇA: estes são glifos PRÓPRIOS, desenhados na linguagem visual
 * de categoria da AWS (cor por família de serviço). NÃO são os AWS Architecture
 * Icons oficiais — a arte oficial tem termos de uso próprios e redistribuí-la
 * dentro do repositório é uma decisão de licenciamento do dono do projeto.
 * Se um dia essa decisão for tomada, basta trocar o `glyph` de cada entrada
 * mantendo as chaves: nada mais no diagrama muda.
 *
 * Tudo é SVG inline por dois motivos: a CSP não faz requisição nenhuma
 * (`img-src` externo é bloqueado por allowlist) e o render funciona em SSR.
 */

// ─── Categorias (cores na família visual da AWS) ────────────────────────────

export type AwsCategory =
  | 'compute' | 'storage' | 'database' | 'network' | 'integration'
  | 'ai' | 'analytics' | 'security' | 'management' | 'external'
  | 'conceito';

export const CATEGORY: Record<AwsCategory, { color: string; label: string }> = {
  compute:     { color: '#ED7100', label: 'Compute' },
  storage:     { color: '#7AA116', label: 'Armazenamento' },
  database:    { color: '#2E73B8', label: 'Banco de dados' },
  network:     { color: '#8C4FFF', label: 'Rede e entrega' },
  integration: { color: '#E7157B', label: 'Integração de apps' },
  ai:          { color: '#01A88D', label: 'IA e machine learning' },
  analytics:   { color: '#8C4FFF', label: 'Analytics' },
  security:    { color: '#DD344C', label: 'Segurança e identidade' },
  management:  { color: '#E7157B', label: 'Gestão e governança' },
  external:    { color: '#5A6B7B', label: 'Fora da AWS' },
  // Conceito de arquitetura que não é serviço AWS — RLHF, HNSW, consenso,
  // feature store. O bloco de diagrama sempre foi agnóstico; o catálogo é que
  // limitava, e por isso as 8 trilhas de IA e produção ficaram sem desenho.
  conceito:    { color: '#4F8FBF', label: 'Conceito de arquitetura' },
};

// ─── Glifos (24x24, stroke-based; herdam currentColor) ──────────────────────

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const G = {
  func: <><path {...S} d="M7 5h4l6 14h-4L7 5Z" /><path {...S} d="M11 5 7 19" /></>,
  chip: <><rect {...S} x="6" y="6" width="12" height="12" rx="2" /><path {...S} d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>,
  container: <><rect {...S} x="3" y="9" width="8" height="6" rx="1" /><rect {...S} x="13" y="9" width="8" height="6" rx="1" /><rect {...S} x="8" y="3" width="8" height="5" rx="1" /></>,
  bucket: <><path {...S} d="M4 7h16l-1.6 12.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 7Z" /><ellipse {...S} cx="12" cy="6" rx="8" ry="2.4" /></>,
  db: <><ellipse {...S} cx="12" cy="6" rx="7" ry="2.8" /><path {...S} d="M5 6v12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8V6" /><path {...S} d="M5 12c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8" /></>,
  gateway: <><rect {...S} x="3" y="6" width="18" height="12" rx="2" /><path {...S} d="M7 12h4m-1.6-1.8L11 12l-1.6 1.8M13 12h4m-1.6-1.8L17 12l-1.6 1.8" /></>,
  globe: <><circle {...S} cx="12" cy="12" r="8.5" /><path {...S} d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5Z" /></>,
  balancer: <><circle {...S} cx="12" cy="5" r="2.2" /><circle {...S} cx="5" cy="19" r="2.2" /><circle {...S} cx="19" cy="19" r="2.2" /><path {...S} d="M12 7.2v4M12 11.2H5.6a.6.6 0 0 0-.6.6v4.9M12 11.2h6.4a.6.6 0 0 1 .6.6v4.9" /></>,
  queue: <><rect {...S} x="3" y="7" width="4.5" height="10" rx="1" /><rect {...S} x="9.8" y="7" width="4.5" height="10" rx="1" /><rect {...S} x="16.5" y="7" width="4.5" height="10" rx="1" /></>,
  // Alvos registrados DENTRO de um contorno: o grupo é o conjunto, e é do
  // conjunto que a drenagem é atributo. `balancer` (leque de saída) já descreve
  // o ALB — reusá-lo aqui apagaria a distinção que o L03 ensina.
  grupoalvo: <><rect {...S} x="2.5" y="5.5" width="19" height="13" rx="2" strokeDasharray="3 2" /><circle {...S} cx="8" cy="12" r="2" /><circle {...S} cx="16" cy="12" r="2" /><path {...S} d="M10 12h4" /></>,
  // Funil com gota: Firehose RECEBE do stream e ENTREGA formatado (buffer,
  // conversão, partição) — `wave` (ondas do Kinesis Data Stream) descreve o
  // fluxo contínuo de entrada, não a transformação de entrega na saída.
  funil: <><path {...S} d="M4 4.5h16l-5.5 8v6.2l-5 2.3v-8.5L4 4.5Z" /></>,
  // Certificado: documento com selo. `key` (o que `certificado` usava) desenha
  // chave, e chave é material criptográfico — certificado é a AFIRMAÇÃO assinada
  // sobre um nome, que é exatamente a distinção do L05.
  certificado: <><rect {...S} x="4" y="3" width="13" height="13" rx="1.5" /><path {...S} d="M7 7h7M7 10h5" /><circle {...S} cx="16.5" cy="16.5" r="3.4" /><path {...S} d="m14.6 19.3-.6 2.4 2.5-1.1 2.5 1.1-.6-2.4" /></>,
  // Escala: degraus subindo com seta. Auto Scaling é o controlador que ACRESCENTA
  // capacidade — `monitor` desenharia quem observa, não quem age.
  escala: <><path {...S} d="M3.5 20.5h17" /><rect {...S} x="4.5" y="14" width="3.6" height="6.5" /><rect {...S} x="10.2" y="10" width="3.6" height="10.5" /><rect {...S} x="15.9" y="5.5" width="3.6" height="15" /><path {...S} d="m17 2.5 2.6 2.6M19.6 5.1h-2.4" /></>,
  // Lupa sobre barras: instrumento que enxerga DENTRO do desempenho. `monitor` é
  // painel genérico e não comunica investigação, que é a função do Performance
  // Insights no L07 — separar consulta ruim de máquina pequena.
  lupa: <><path {...S} d="M4 18.5v-4M7.5 18.5v-7M11 18.5v-3" /><circle {...S} cx="16" cy="9" r="4.6" /><path {...S} d="m19.4 12.4 2.4 2.4" /></>,
  // Pool de conexões: N ligações mantidas abertas entre dois lados. Não é fila
  // (não há ordem) nem grupo de alvos — é a conta `tasks × pool` que estoura o
  // `max_connections`, e o glifo mostra as ligações.
  pool: <><path {...S} d="M4 4.5v15M20 4.5v15" /><path {...S} d="M4 8h16M4 12h16M4 16h16" /></>,
  // Cofre: recipiente com segredo de abertura. Um cofre de backup não é um bucket
  // — a diferença é a trava, e é ela que protege de credencial comprometida no L10.
  cofre: <><rect {...S} x="3" y="4" width="18" height="16" rx="2" /><circle {...S} cx="12" cy="12" r="3.6" /><path {...S} d="M12 8.4v-1.4M12 17v-1.4M8.4 12H7M17 12h-1.4" /></>,
  // Anomalia: a série se comporta e depois salta. Detecção de anomalia não é
  // orçamento (que é um teto escolhido) — é desvio do próprio histórico.
  anomalia: <><path {...S} d="M3 17.5h3.5l2-1.5 2 1.2 2.2-9 2.3 9.3 1.6-2h4" /><circle {...S} cx="14.9" cy="7" r="1.6" /></>,
  // NLB: passagem reta, sem bifurcar. `balancer` desenha o leque de distribuição do
  // ALB (camada 7, decide por conteúdo); o NLB é camada 4 e passa o pacote direto,
  // preservando IP de origem — o glifo mostra atravessar, não escolher.
  passagem: <><rect {...S} x="3" y="9.5" width="5" height="5" rx="1" /><rect {...S} x="16" y="9.5" width="5" height="5" rx="1" /><path {...S} d="M8 12h8m0 0-2.4-2.2M16 12l-2.4 2.2" /></>,
  event: <><path {...S} d="m12 2.8 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.2l6.1-.8L12 2.8Z" /></>,
  workflow: <><rect {...S} x="8.5" y="2.5" width="7" height="5" rx="1" /><rect {...S} x="2.5" y="16.5" width="7" height="5" rx="1" /><rect {...S} x="14.5" y="16.5" width="7" height="5" rx="1" /><path {...S} d="M12 7.5v4M12 11.5H6v5M12 11.5h6v5" /></>,
  broadcast: <><circle {...S} cx="12" cy="12" r="2.4" /><path {...S} d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" /></>,
  brain: <><path {...S} d="M12 4.5a3.2 3.2 0 0 0-3.2 3.2A3 3 0 0 0 6 10.6a3 3 0 0 0 1.4 2.5A3 3 0 0 0 9 18.6a3.1 3.1 0 0 0 3-1.3V4.5Z" /><path {...S} d="M12 4.5a3.2 3.2 0 0 1 3.2 3.2A3 3 0 0 1 18 10.6a3 3 0 0 1-1.4 2.5A3 3 0 0 1 15 18.6a3.1 3.1 0 0 1-3-1.3" /></>,
  sparkle: <><path {...S} d="m12 3 1.9 4.9L19 9.8l-5.1 1.9L12 16.6l-1.9-4.9L5 9.8l5.1-1.9L12 3Z" /><path {...S} d="m18.5 15.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" /></>,
  cube: <><path {...S} d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7L12 2.8Z" /><path {...S} d="M3.5 7 12 11.4 20.5 7M12 11.4v9.8" /></>,
  search: <><circle {...S} cx="10.5" cy="10.5" r="6.5" /><path {...S} d="m15.4 15.4 5 5" /></>,
  vector: <><circle {...S} cx="6" cy="7" r="1.8" /><circle {...S} cx="18" cy="6" r="1.8" /><circle {...S} cx="7" cy="18" r="1.8" /><circle {...S} cx="17" cy="17" r="1.8" /><circle {...S} cx="12" cy="12" r="1.8" /><path {...S} d="m7.4 8 3.2 2.7M16.5 7.3 13.3 10.8M8.4 16.7l2.4-3.1M15.7 15.7l-2.4-2.4" /></>,
  graph: <><circle {...S} cx="12" cy="5" r="2.2" /><circle {...S} cx="5" cy="17" r="2.2" /><circle {...S} cx="19" cy="17" r="2.2" /><path {...S} d="M10.4 6.7 6.4 15M13.6 6.7l4 8.3M7.2 17h9.6" /></>,
  doc: <><path {...S} d="M6 2.8h7.5L19 8.3v12.9H6V2.8Z" /><path {...S} d="M13.2 2.8v5.7H19M8.8 13h7M8.8 16.5h5" /></>,
  wave: <><path {...S} d="M3 12h2.2M7.4 12V8.2M7.4 15.8V12M10.6 12V5.4M10.6 18.6V12M13.8 12V7.4M13.8 16.6V12M17 12V9.6M17 14.4V12M19.2 12H21" /></>,
  mic: <><rect {...S} x="9.2" y="2.8" width="5.6" height="11" rx="2.8" /><path {...S} d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0M12 17.8v3.4" /></>,
  speaker: <><path {...S} d="M4 9.4h3.4L12 5.2v13.6L7.4 14.6H4V9.4Z" /><path {...S} d="M15.4 9.4a3.8 3.8 0 0 1 0 5.2M18 6.8a7.4 7.4 0 0 1 0 10.4" /></>,
  eye: <><path {...S} d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle {...S} cx="12" cy="12" r="2.8" /></>,
  chars: <><path {...S} d="M3.4 17.6 7.6 6.4l4.2 11.2M4.9 14h5.4" /><path {...S} d="M13.4 11.6h7.2M17 11.6v-2.4M20.6 11.6c0 3.6-2.6 6.6-6.2 7.6" /></>,
  shield: <><path {...S} d="M12 2.8 4.6 6v5.6c0 4.5 3.1 8.3 7.4 9.6 4.3-1.3 7.4-5.1 7.4-9.6V6L12 2.8Z" /><path {...S} d="m9 12.2 2.2 2.2 4-4.2" /></>,
  key: <><circle {...S} cx="7.6" cy="12" r="4" /><path {...S} d="M11.6 12h9.2M17.6 12v3.2M20.2 12v2.4" /></>,
  identity: <><circle {...S} cx="12" cy="8.2" r="3.6" /><path {...S} d="M5.4 20.4a6.9 6.9 0 0 1 13.2 0" /></>,
  audit: <><rect {...S} x="4.6" y="3" width="14.8" height="18" rx="2" /><path {...S} d="m8.2 9 1.6 1.6 3-3M8.2 15l1.6 1.6 3-3M15 9h1.6M15 15h1.6" /></>,
  monitor: <><rect {...S} x="2.8" y="4.6" width="18.4" height="14.8" rx="2" /><path {...S} d="m6.4 14.6 3.4-4 2.8 2.6 4.6-5.4" /></>,
  trace: <><circle {...S} cx="5" cy="6" r="1.8" /><circle {...S} cx="12" cy="12" r="1.8" /><circle {...S} cx="19" cy="18" r="1.8" /><path {...S} d="M6.5 7.2c3 .6 4 2.4 4.3 3.4M13.4 13.2c2.7 1.4 3.6 2.9 4 3.6" /></>,
  cost: <><circle {...S} cx="12" cy="12" r="8.6" /><path {...S} d="M14.6 9.2c-.6-.9-1.6-1.4-2.7-1.4-1.6 0-2.7.9-2.7 2.1 0 3 5.6 1.6 5.6 4.6 0 1.3-1.2 2.2-2.9 2.2-1.2 0-2.3-.5-2.9-1.5M12 6.2v11.6" /></>,
  window: <><rect {...S} x="2.8" y="4.2" width="18.4" height="15.6" rx="2" /><path {...S} d="M2.8 9h18.4M6 6.6h.01M8.6 6.6h.01" /></>,
  phone: <><rect {...S} x="6.6" y="2.6" width="10.8" height="18.8" rx="2.4" /><path {...S} d="M10.6 18.4h2.8" /></>,
  cloud: <><path {...S} d="M7.4 18.6a4.4 4.4 0 0 1-.6-8.8 5.6 5.6 0 0 1 10.8-1.2 3.9 3.9 0 0 1 .4 7.7" /><path {...S} d="M7.4 18.6h10.6" /></>,
};

// ─── Catálogo de serviços ───────────────────────────────────────────────────

interface ServiceDef { label: string; cat: AwsCategory; glyph: ReactElement }

export const AWS_SERVICES: Record<string, ServiceDef> = {
  // Compute
  lambda:          { label: 'Lambda',              cat: 'compute',     glyph: G.func },
  fargate:         { label: 'Fargate',             cat: 'compute',     glyph: G.container },
  ecs:             { label: 'ECS',                 cat: 'compute',     glyph: G.container },
  eks:             { label: 'EKS',                 cat: 'compute',     glyph: G.container },
  ec2:             { label: 'EC2',                 cat: 'compute',     glyph: G.chip },
  ecr:             { label: 'Amazon ECR',          cat: 'compute',     glyph: G.container },
  batch:           { label: 'Batch',               cat: 'compute',     glyph: G.queue },

  // Rede e entrega
  apigateway:      { label: 'API Gateway',         cat: 'network',     glyph: G.gateway },
  websocket:       { label: 'API GW WebSocket',    cat: 'network',     glyph: G.broadcast },
  appsync:         { label: 'AppSync',             cat: 'network',     glyph: G.broadcast },
  cloudfront:      { label: 'CloudFront',          cat: 'network',     glyph: G.globe },
  alb:             { label: 'Load Balancer',       cat: 'network',     glyph: G.balancer },
  vpc:             { label: 'VPC',                 cat: 'network',     glyph: G.cloud },
  privatelink:     { label: 'PrivateLink',         cat: 'network',     glyph: G.shield },
  route53:         { label: 'Route 53',            cat: 'network',     glyph: G.globe },
  amplify:         { label: 'AWS Amplify',         cat: 'network',     glyph: G.window },

  // Integração
  eventbridge:     { label: 'EventBridge',         cat: 'integration', glyph: G.event },
  sqs:             { label: 'SQS',                 cat: 'integration', glyph: G.queue },
  sns:             { label: 'SNS',                 cat: 'integration', glyph: G.broadcast },
  stepfunctions:   { label: 'Step Functions',      cat: 'integration', glyph: G.workflow },
  ses:             { label: 'SES',                 cat: 'integration', glyph: G.doc },
  connect:         { label: 'Amazon Connect',      cat: 'integration', glyph: G.mic },
  chime:           { label: 'Chime SDK',           cat: 'integration', glyph: G.mic },
  endusermessaging:{ label: 'End User Messaging',  cat: 'integration', glyph: G.broadcast },

  // Armazenamento
  s3:              { label: 'S3',                  cat: 'storage',     glyph: G.bucket },
  s3vectors:       { label: 'S3 Vectors',          cat: 'storage',     glyph: G.vector },
  efs:             { label: 'EFS',                 cat: 'storage',     glyph: G.bucket },

  // Banco de dados
  dynamodb:        { label: 'DynamoDB',            cat: 'database',    glyph: G.db },
  aurora:          { label: 'Aurora',              cat: 'database',    glyph: G.db },
  rds:             { label: 'RDS',                 cat: 'database',    glyph: G.db },

  /*
   * Peças pedidas pelos laboratórios L05, L06 e L07 (07/ago/2026). Todas
   * acrescentadas pelo mesmo critério dos casos anteriores: quando a peça é o
   * OBJETO DE ESTUDO do módulo, desenhá-la com o ícone do vizinho apaga a
   * distinção que o módulo existe para ensinar.
   *
   * `acm` — o L05 tem DOIS certificados em regiões diferentes, e a regra de que a
   * distribuição só aceita certificado de us-east-1 é a lição. Ganhou glifo de
   * documento com selo, não de chave: certificado é a afirmação assinada sobre um
   * nome, não material criptográfico.
   *
   * `autoscaling` — o L06 tinha três nós de política desenhados com `politica`,
   * cujo glifo é um CÉREBRO, num módulo que argumenta contra IA decorativa. O
   * próprio autor apontou o desconforto.
   *
   * `rdsproxy` — reusa `gateway` de propósito: proxy é exatamente uma caixa que
   * recebe e encaminha, e o glifo já diz isso. Aqui reusar não apaga distinção,
   * porque o vizinho no desenho é a instância do RDS (glifo de banco), não outro
   * gateway.
   *
   * `performanceinsights` — o L07 usava `monitor`, painel genérico, para o
   * instrumento que separa consulta ruim de máquina pequena. Lupa sobre barras
   * comunica investigação.
   *
   * `pool` — o L07 usava `fila`, e pool NÃO é fila: não há ordem, há N ligações
   * mantidas abertas. A conta `tasks × pool` é o núcleo do módulo.
   */
  acm:             { label: 'ACM (certificado)',   cat: 'security',    glyph: G.certificado },
  autoscaling:     { label: 'Auto Scaling',        cat: 'management',  glyph: G.escala },
  rdsproxy:        { label: 'RDS Proxy',           cat: 'database',    glyph: G.gateway },
  performanceinsights: { label: 'Performance Insights', cat: 'management', glyph: G.lupa },
  pool:            { label: 'Pool de conexões',    cat: 'conceito',    glyph: G.pool },

  /*
   * `awsbackup` e `backupvault` (L10) e `costanomalydetection` (L09).
   *
   * O cofre é o caso mais forte dos três: o L10 usava a chave genérica `storage`,
   * cujo glifo é um balde, e a lição do módulo é que um cofre de backup NÃO é um
   * balde — a diferença é a trava, que é o que protege de credencial comprometida.
   * Desenhá-lo como armazenamento apagava justamente isso.
   *
   * `costanomalydetection` sai de `costexplorer` porque as duas coisas respondem a
   * perguntas diferentes: orçamento é um teto que alguém escolheu; anomalia é
   * desvio do próprio histórico. O glifo mostra a série saltando.
   */
  awsbackup:       { label: 'AWS Backup',          cat: 'management',  glyph: G.cofre },
  backupvault:     { label: 'Cofre de backup',     cat: 'storage',     glyph: G.cofre },
  costanomalydetection: { label: 'Detecção de anomalia de custo', cat: 'management', glyph: G.anomalia },

  /*
   * `nlb` (L11) — o Network Load Balancer não existia como chave própria; o L11
   * usava `alb` para os dois nós, e a página serviria os dois glifos idênticos no
   * diagrama cuja lição é que VPC Link do API Gateway exige um NLB, não um ALB.
   * Mesmo defeito do `targetgroup` original: dois papéis diferentes, um glifo.
   */
  nlb:             { label: 'Network Load Balancer', cat: 'network',   glyph: G.passagem },
  pgvector:        { label: 'Aurora pgvector',     cat: 'database',    glyph: G.vector },
  elasticache:     { label: 'ElastiCache',         cat: 'database',    glyph: G.chip },
  neptune:         { label: 'Neptune Analytics',   cat: 'database',    glyph: G.graph },

  // Analytics
  opensearch:      { label: 'OpenSearch',          cat: 'analytics',   glyph: G.search },
  athena:          { label: 'Athena',              cat: 'analytics',   glyph: G.search },
  glue:            { label: 'Glue',                cat: 'analytics',   glyph: G.workflow },
  redshift:        { label: 'Redshift',            cat: 'analytics',   glyph: G.db },
  kinesis:         { label: 'Kinesis',             cat: 'analytics',   glyph: G.wave },
  /*
   * `firehose` (L64) — Amazon Data Firehose reusava a chave `kinesis`, e o
   * diagrama de produção tem os DOIS lado a lado (o stream de origem e o
   * Firehose que o consome, converte para Parquet e particiona) — mesmo
   * defeito do ALB/NLB no L11: dois papéis diferentes, um glifo idêntico, na
   * exata lição que distingue "ingestão contínua" de "entrega formatada".
   */
  firehose:        { label: 'Amazon Data Firehose', cat: 'analytics',  glyph: G.funil },
  lakeformation:   { label: 'Lake Formation',      cat: 'analytics',   glyph: G.shield },
  datazone:        { label: 'DataZone',            cat: 'analytics',   glyph: G.graph },
  quicksight:      { label: 'QuickSight',          cat: 'analytics',   glyph: G.monitor },
  // Formato de tabela aberto sobre o S3 — não é serviço, mas é a peça que decide
  // evolução de esquema e viagem no tempo, e aparece como nó em pipeline analítico.
  iceberg:         { label: 'Apache Iceberg',      cat: 'analytics',   glyph: G.cube },

  // IA e ML
  bedrock:         { label: 'Amazon Bedrock',      cat: 'ai',          glyph: G.cube },
  claude:          { label: 'Claude',              cat: 'ai',          glyph: G.sparkle },
  knowledgebases:  { label: 'Knowledge Bases',     cat: 'ai',          glyph: G.vector },
  guardrails:      { label: 'Guardrails',          cat: 'ai',          glyph: G.shield },
  agentcore:       { label: 'AgentCore',           cat: 'ai',          glyph: G.brain },
  dataautomation:  { label: 'Data Automation',     cat: 'ai',          glyph: G.doc },
  sagemaker:       { label: 'SageMaker',           cat: 'ai',          glyph: G.brain },
  textract:        { label: 'Textract',            cat: 'ai',          glyph: G.doc },
  comprehend:      { label: 'Comprehend',          cat: 'ai',          glyph: G.chars },
  transcribe:      { label: 'Transcribe',          cat: 'ai',          glyph: G.wave },
  polly:           { label: 'Polly',               cat: 'ai',          glyph: G.speaker },
  translate:       { label: 'Translate',           cat: 'ai',          glyph: G.chars },
  rekognition:     { label: 'Rekognition',         cat: 'ai',          glyph: G.eye },
  lex:             { label: 'Amazon Lex',          cat: 'ai',          glyph: G.mic },
  kendra:          { label: 'Kendra',              cat: 'ai',          glyph: G.search },
  personalize:     { label: 'Personalize',         cat: 'ai',          glyph: G.sparkle },
  a2i:             { label: 'Revisão humana',      cat: 'ai',          glyph: G.identity },
  frauddetector:   { label: 'Fraud Detector',      cat: 'ai',          glyph: G.eye },
  q:               { label: 'Amazon Q',            cat: 'ai',          glyph: G.sparkle },
  // Peças do Bedrock que são nó de arquitetura por si — versão de prompt,
  // avaliação e fluxo visual mudam a topologia, então precisam de chave própria.
  bedrockeval:     { label: 'Bedrock Evaluations', cat: 'ai',          glyph: G.audit },
  promptmgmt:      { label: 'Prompt Management',   cat: 'ai',          glyph: G.doc },
  bedrockflows:    { label: 'Bedrock Flows',       cat: 'ai',          glyph: G.workflow },
  transform:       { label: 'AWS Transform',       cat: 'ai',          glyph: G.sparkle },
  healthlake:      { label: 'HealthLake (FHIR)',   cat: 'database',    glyph: G.db },
  memorydb:        { label: 'MemoryDB',            cat: 'database',    glyph: G.chip },
  contactlens:     { label: 'Contact Lens',        cat: 'integration', glyph: G.eye },
  mcp:             { label: 'Gateway MCP',         cat: 'integration', glyph: G.gateway },
  transitgateway:  { label: 'Transit Gateway',     cat: 'network',     glyph: G.graph },

  /*
   * Primitivas de rede, acrescentadas para o laboratório L02 (07/ago/2026).
   *
   * Elas não são "serviços" no sentido de aparecerem numa fatura com nome próprio
   * — `subnet` e `routetable` são objetos de configuração. Mas num módulo cujo
   * OBJETO DE ESTUDO é por que o banco não tem rota para a internet, a tabela de
   * rotas é a peça central do desenho: é ela, e não uma flag na sub-rede, que
   * define público e privado. Desenhar isso com o ícone genérico de "rede"
   * apagaria justamente a distinção que o SAA cobra.
   *
   * `natgateway` e `internetgateway` têm glifos DIFERENTES de propósito: o IGW é
   * bidirecional (seta dupla) e o NAT é de saída (seta única). A diferença entre
   * os dois é o conteúdo do módulo, e o ícone não deve contradizê-la.
   */
  internetgateway: { label: 'Internet Gateway',    cat: 'network',     glyph: G.globe },
  natgateway:      { label: 'NAT Gateway',         cat: 'network',     glyph: G.gateway },
  routetable:      { label: 'Tabela de rotas',     cat: 'network',     glyph: G.workflow },
  subnet:          { label: 'Sub-rede',            cat: 'network',     glyph: G.cube },
  eip:             { label: 'Elastic IP',          cat: 'network',     glyph: G.chars },

  /*
   * `targetgroup`, acrescentado para o L03 (07/ago/2026), pela mesma razão que a
   * tabela de rotas ganhou ícone no L02: é onde a decisão mora.
   *
   * O balanceador não drena conexão — o GRUPO DE DESTINO drena, e
   * `deregistration_delay.timeout_seconds` é atributo dele, não do ALB. Quem desenha
   * os dois como uma caixa só não tem onde pendurar o prazo de drenagem, e o aluno
   * sai procurando a configuração no lugar errado.
   *
   * O glifo é PRÓPRIO, e não o `balancer` do ALB. A primeira versão reusava
   * `balancer`, e a página servida mostrou o defeito: os dois nós renderizavam
   * idênticos, lado a lado, no diagrama cuja lição é que eles são coisas
   * diferentes. É a mesma regra que deu glifos distintos a IGW e NAT no L02 — o
   * ícone não pode contradizer o conteúdo.
   */
  targetgroup:     { label: 'Grupo de destino',    cat: 'network',     glyph: G.grupoalvo },

  // Segurança e identidade
  iam:             { label: 'IAM',                 cat: 'security',    glyph: G.identity },
  cognito:         { label: 'Cognito',             cat: 'security',    glyph: G.identity },
  identitycenter:  { label: 'Identity Center',     cat: 'security',    glyph: G.identity },
  kms:             { label: 'KMS',                 cat: 'security',    glyph: G.key },
  secretsmanager:  { label: 'Secrets Manager',     cat: 'security',    glyph: G.key },
  waf:             { label: 'AWS WAF',             cat: 'security',    glyph: G.shield },
  macie:           { label: 'Macie',               cat: 'security',    glyph: G.eye },
  guardduty:       { label: 'GuardDuty',           cat: 'security',    glyph: G.shield },
  shield:          { label: 'AWS Shield',          cat: 'security',    glyph: G.shield },
  organizations:   { label: 'Organizations',       cat: 'security',    glyph: G.graph },
  controltower:    { label: 'Control Tower',       cat: 'security',    glyph: G.audit },
  securityhub:     { label: 'Security Hub',        cat: 'security',    glyph: G.shield },

  // Gestão e governança
  cloudwatch:      { label: 'CloudWatch',          cat: 'management',  glyph: G.monitor },
  cloudtrail:      { label: 'CloudTrail',          cat: 'management',  glyph: G.audit },
  xray:            { label: 'X-Ray',               cat: 'management',  glyph: G.trace },
  budgets:         { label: 'Budgets',             cat: 'management',  glyph: G.cost },
  costexplorer:    { label: 'Cost Explorer',       cat: 'management',  glyph: G.cost },
  config:          { label: 'AWS Config',          cat: 'management',  glyph: G.audit },
  auditmanager:    { label: 'Audit Manager',       cat: 'management',  glyph: G.audit },
  parameterstore:  { label: 'Parameter Store',     cat: 'management',  glyph: G.key },
  otel:            { label: 'OpenTelemetry',       cat: 'management',  glyph: G.trace },
  computeoptimizer:{ label: 'Compute Optimizer',   cat: 'management',  glyph: G.monitor },
  cdk:             { label: 'CDK / IaC',           cat: 'management',  glyph: G.cube },
  codepipeline:    { label: 'CodePipeline',        cat: 'management',  glyph: G.workflow },

  // Fora da AWS
  user:            { label: 'Usuário',             cat: 'external',    glyph: G.identity },
  browser:         { label: 'Navegador',           cat: 'external',    glyph: G.window },
  mobile:          { label: 'App mobile',          cat: 'external',    glyph: G.phone },
  whatsapp:        { label: 'WhatsApp',            cat: 'external',    glyph: G.broadcast },
  slack:           { label: 'Slack / Teams',       cat: 'external',    glyph: G.broadcast },
  legado:          { label: 'Sistema legado',      cat: 'external',    glyph: G.chip },
  erp:             { label: 'ERP / CRM',           cat: 'external',    glyph: G.db },
  ide:             { label: 'IDE / terminal',      cat: 'external',    glyph: G.window },

  // ─── Conceitos de arquitetura (não são serviços AWS) ──────────────────────
  //
  // Existem para as trilhas de IA e produção, onde o objeto de estudo é o
  // mecanismo e não o serviço: RLHF, HNSW, consenso, feature store. Reusam os
  // mesmos glifos — o que muda é o rótulo e a categoria.

  // RAG e recuperação
  chunker:         { label: 'Chunker',              cat: 'conceito',    glyph: G.doc },
  embedder:        { label: 'Modelo de embedding',  cat: 'conceito',    glyph: G.vector },
  retriever:       { label: 'Retriever',            cat: 'conceito',    glyph: G.search },
  reranker:        { label: 'Reranker',             cat: 'conceito',    glyph: G.chars },
  indice_invertido:{ label: 'Índice invertido',     cat: 'conceito',    glyph: G.doc },
  indice_ann:      { label: 'Índice ANN',           cat: 'conceito',    glyph: G.graph },
  hnsw:            { label: 'Grafo HNSW',           cat: 'conceito',    glyph: G.graph },
  ivf:             { label: 'Clusters IVF',         cat: 'conceito',    glyph: G.vector },
  bm25:            { label: 'BM25 / léxico',        cat: 'conceito',    glyph: G.chars },

  // LLM, prompt e agente
  llm:             { label: 'LLM',                  cat: 'conceito',    glyph: G.brain },
  prompt:          { label: 'Prompt',               cat: 'conceito',    glyph: G.chars },
  contexto:        { label: 'Janela de contexto',   cat: 'conceito',    glyph: G.window },
  laco_agente:     { label: 'Laço do agente',       cat: 'conceito',    glyph: G.workflow },
  ferramenta:      { label: 'Ferramenta (tool)',    cat: 'conceito',    glyph: G.func },
  orquestrador:    { label: 'Orquestrador',         cat: 'conceito',    glyph: G.workflow },
  subagente:       { label: 'Subagente',            cat: 'conceito',    glyph: G.brain },

  // Treino e alinhamento
  dataset:         { label: 'Dataset',              cat: 'conceito',    glyph: G.bucket },
  sft:             { label: 'SFT',                  cat: 'conceito',    glyph: G.chip },
  reward_model:    { label: 'Reward model',         cat: 'conceito',    glyph: G.sparkle },
  ppo:             { label: 'PPO / RL',             cat: 'conceito',    glyph: G.workflow },
  politica:        { label: 'Política (policy)',    cat: 'conceito',    glyph: G.brain },
  preferencia:     { label: 'Dado de preferência',  cat: 'conceito',    glyph: G.eye },
  checkpoint:      { label: 'Checkpoint',           cat: 'conceito',    glyph: G.cube },

  // Avaliação
  eval:            { label: 'Eval harness',         cat: 'conceito',    glyph: G.audit },
  golden_set:      { label: 'Golden set',           cat: 'conceito',    glyph: G.doc },
  juiz:            { label: 'LLM-as-judge',         cat: 'conceito',    glyph: G.eye },
  metrica:         { label: 'Métrica',              cat: 'conceito',    glyph: G.monitor },

  // MLOps
  feature_store:   { label: 'Feature store',        cat: 'conceito',    glyph: G.db },
  treinador:       { label: 'Job de treino',        cat: 'conceito',    glyph: G.chip },
  registro_modelo: { label: 'Model registry',       cat: 'conceito',    glyph: G.container },
  servidor_modelo: { label: 'Model serving',        cat: 'conceito',    glyph: G.balancer },
  drift:           { label: 'Detector de drift',    cat: 'conceito',    glyph: G.wave },
  pipeline:        { label: 'Pipeline',             cat: 'conceito',    glyph: G.workflow },

  // Sistemas distribuídos
  lider:           { label: 'Líder',                cat: 'conceito',    glyph: G.chip },
  seguidor:        { label: 'Seguidor',             cat: 'conceito',    glyph: G.chip },
  quorum:          { label: 'Quórum',               cat: 'conceito',    glyph: G.graph },
  log_replicado:   { label: 'Log replicado',        cat: 'conceito',    glyph: G.doc },
  shard:           { label: 'Shard / partição',     cat: 'conceito',    glyph: G.container },
  replica:         { label: 'Réplica',              cat: 'conceito',    glyph: G.db },
  relogio:         { label: 'Relógio lógico',       cat: 'conceito',    glyph: G.monitor },
  coordenador:     { label: 'Coordenador',          cat: 'conceito',    glyph: G.gateway },

  // Observabilidade
  span:            { label: 'Span / trace',         cat: 'conceito',    glyph: G.trace },
  coletor:         { label: 'Coletor',              cat: 'conceito',    glyph: G.queue },
  slo:             { label: 'SLO',                  cat: 'conceito',    glyph: G.monitor },
  error_budget:    { label: 'Error budget',         cat: 'conceito',    glyph: G.cost },
  alerta:          { label: 'Alerta',               cat: 'conceito',    glyph: G.broadcast },
  plantao:         { label: 'Plantão / on-call',    cat: 'conceito',    glyph: G.phone },

  // Dados
  fonte:           { label: 'Fonte de dado',        cat: 'conceito',    glyph: G.db },
  cdc:             { label: 'CDC',                  cat: 'conceito',    glyph: G.wave },
  bronze:          { label: 'Camada bronze',        cat: 'conceito',    glyph: G.bucket },
  prata:           { label: 'Camada silver',        cat: 'conceito',    glyph: G.bucket },
  ouro:            { label: 'Camada gold',          cat: 'conceito',    glyph: G.bucket },
  lote:            { label: 'Batch',                cat: 'conceito',    glyph: G.container },
  streaming:       { label: 'Streaming',            cat: 'conceito',    glyph: G.wave },
  catalogo:        { label: 'Catálogo',             cat: 'conceito',    glyph: G.search },

  // ─── Conceitos genéricos que também são nomes de glifo ────────────────────
  //
  // Completado em ago/2026 com TODOS os nomes de glifo restantes. O gate pegou
  // o mesmo erro seis vezes em sequência ao escrever os diagramas — sinal de que
  // a intuição do autor é escrever o nome do desenho. Registrar a lista inteira
  // resolve a classe; o fallback continua existindo para o erro de digitação de
  // verdade.
  audit:           { label: 'Auditoria',             cat: 'management',  glyph: G.audit },
  brain:           { label: 'Rede neural',           cat: 'ai',          glyph: G.brain },
  bucket:          { label: 'Bucket',                cat: 'storage',     glyph: G.bucket },
  chars:           { label: 'Texto / token',         cat: 'conceito',    glyph: G.chars },
  chip:            { label: 'Processamento',         cat: 'compute',     glyph: G.chip },
  cloud:           { label: 'Nuvem',                 cat: 'conceito',    glyph: G.cloud },
  container:       { label: 'Contêiner',             cat: 'compute',     glyph: G.container },
  cost:            { label: 'Custo',                 cat: 'management',  glyph: G.cost },
  cube:            { label: 'Artefato',              cat: 'conceito',    glyph: G.cube },
  db:              { label: 'Banco',                 cat: 'database',    glyph: G.db },
  event:           { label: 'Evento',                cat: 'integration', glyph: G.event },
  eye:             { label: 'Observação',            cat: 'management',  glyph: G.eye },
  func:            { label: 'Função',                cat: 'compute',     glyph: G.func },
  globe:           { label: 'Internet',              cat: 'network',     glyph: G.globe },
  graph:           { label: 'Grafo',                 cat: 'conceito',    glyph: G.graph },
  mic:             { label: 'Áudio de entrada',      cat: 'ai',          glyph: G.mic },
  phone:           { label: 'Dispositivo móvel',     cat: 'external',    glyph: G.phone },
  queue:           { label: 'Fila',                  cat: 'integration', glyph: G.queue },
  search:          { label: 'Busca',                 cat: 'conceito',    glyph: G.search },
  sparkle:         { label: 'Geração',               cat: 'ai',          glyph: G.sparkle },
  speaker:         { label: 'Áudio de saída',        cat: 'ai',          glyph: G.speaker },
  trace:           { label: 'Trace',                 cat: 'management',  glyph: G.trace },
  vector:          { label: 'Vetor',                 cat: 'conceito',    glyph: G.vector },
  wave:            { label: 'Sinal / fluxo',         cat: 'conceito',    glyph: G.wave },
  window:          { label: 'Interface',             cat: 'external',    glyph: G.window },
  workflow:        { label: 'Fluxo',                 cat: 'conceito',    glyph: G.workflow },

  //
  // `doc`, `broadcast`, `identity`, `monitor` e afins são nomes do mapa de
  // glifos, e é natural escrevê-los como `service` — foi o erro recorrente ao
  // escrever os diagramas de ago/2026, pego pelo gate todas as vezes. Como cada
  // um também é um conceito de arquitetura legítimo, registrá-los resolve a
  // classe inteira em vez de remapear caso a caso.
  doc:             { label: 'Documento',             cat: 'conceito',    glyph: G.doc },
  broadcast:       { label: 'Notificação',           cat: 'integration', glyph: G.broadcast },
  identity:        { label: 'Identidade',            cat: 'security',    glyph: G.identity },
  key:             { label: 'Chave / credencial',     cat: 'security',    glyph: G.key },
  monitor:         { label: 'Monitoramento',         cat: 'management',  glyph: G.monitor },
  evento:          { label: 'Evento',                cat: 'integration', glyph: G.event },
  fluxo:           { label: 'Fluxo de trabalho',     cat: 'conceito',    glyph: G.workflow },

  // ─── Infraestrutura genérica (não é serviço nomeado) ──────────────────────
  //
  // As trilhas de redes, segurança e system design desenham topologia sem citar
  // fornecedor: "um balanceador", "um proxy reverso", "uma fila". Sem estas
  // entradas, o autor escreve o nome do GLIFO (`balancer`, `gateway`, `queue`)
  // — que é intuitivo e não é chave de catálogo — e o nó cai no cubo cinza.
  // Aconteceu três vezes em ago/2026, sempre pego pelo gate.
  balancer:        { label: 'Balanceador',           cat: 'network',     glyph: G.balancer },
  gateway:         { label: 'Gateway / proxy',       cat: 'network',     glyph: G.gateway },
  fila:            { label: 'Fila',                  cat: 'integration', glyph: G.queue },
  cache:           { label: 'Cache',                 cat: 'database',    glyph: G.container },
  firewall:        { label: 'Firewall / WAF',        cat: 'security',    glyph: G.shield },
  certificado:     { label: 'Certificado',           cat: 'security',    glyph: G.certificado },
  servidor:        { label: 'Servidor',              cat: 'compute',     glyph: G.chip },
  cliente:         { label: 'Cliente',               cat: 'external',    glyph: G.window },

  // ─── Motores fora da AWS ──────────────────────────────────────────────────
  //
  // As trilhas de dados, NoSQL e Postgres Internals desenham topologia sobre
  // estes, e não sobre o serviço gerenciado equivalente. Ficam na cor da
  // categoria a que pertencem — o que importa no diagrama é o papel na
  // arquitetura, não quem opera.
  postgres:        { label: 'PostgreSQL',           cat: 'database',    glyph: G.db },
  mongodb:         { label: 'MongoDB',              cat: 'database',    glyph: G.db },
  redis:           { label: 'Redis',                cat: 'database',    glyph: G.container },
  sqlite:          { label: 'SQLite',               cat: 'database',    glyph: G.cube },
  clickhouse:      { label: 'ClickHouse',           cat: 'analytics',   glyph: G.graph },
  duckdb:          { label: 'DuckDB',               cat: 'analytics',   glyph: G.graph },
  elasticsearch:   { label: 'Elasticsearch',        cat: 'analytics',   glyph: G.search },
  kafka:           { label: 'Kafka',                cat: 'integration', glyph: G.queue },

  // ─── Genéricos por categoria ──────────────────────────────────────────────
  //
  // Existem porque 148 nós de diagrama já usavam o nome da categoria como
  // `service` — `{ service: 'network', label: 'Roteador de borda' }` — para
  // dizer "é rede, mas não é um serviço nomeado da AWS". Sem estas entradas
  // eles caíam no FALLBACK: cubo cinza de "Fora da AWS" num diagrama de rede
  // híbrida, com a cor da categoria perdida. O texto aparecia (vem do `label`
  // do nó), então nada indicava o defeito — só o desenho ficava errado.
  //
  // O gate `validate_serviços_diagrama` agora falha em chave desconhecida, para
  // que um erro de digitação pare no CI em vez de virar cubo cinza silencioso.
  compute:         { label: 'Compute',              cat: 'compute',     glyph: G.chip },
  storage:         { label: 'Armazenamento',        cat: 'storage',     glyph: G.bucket },
  database:        { label: 'Banco de dados',       cat: 'database',    glyph: G.db },
  network:         { label: 'Rede',                 cat: 'network',     glyph: G.globe },
  integration:     { label: 'Integração',           cat: 'integration', glyph: G.queue },
  ai:              { label: 'IA / ML',              cat: 'ai',          glyph: G.brain },
  analytics:       { label: 'Analytics',            cat: 'analytics',   glyph: G.graph },
  security:        { label: 'Segurança',            cat: 'security',    glyph: G.shield },
  management:      { label: 'Gestão',               cat: 'management',  glyph: G.monitor },
  external:        { label: 'Fora da AWS',          cat: 'external',    glyph: G.cube },
};

export type AwsServiceKey = keyof typeof AWS_SERVICES;

const FALLBACK: ServiceDef = { label: 'Serviço', cat: 'external', glyph: G.cube };

export function serviceDef(key: string): ServiceDef {
  return AWS_SERVICES[key] ?? FALLBACK;
}

/** Ícone quadrado de um serviço. `size` em px. */
export function AwsIcon({ service, size = 34 }: { service: string; size?: number }) {
  const def = serviceDef(service);
  const color = CATEGORY[def.cat].color;
  return (
    <span
      aria-hidden="true"
      style={{
        width: size, height: size, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: Math.round(size * 0.24),
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
        color,
      }}
    >
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} role="presentation">
        {def.glyph}
      </svg>
    </span>
  );
}
