import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, ArchDiagram, StackFlow, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Route 53, CloudFront e Global Accelerator — FFV Academy',
  description: 'Route 53 routing policies, CloudFront behaviors, Global Accelerator — a borda da AWS para o SAA-C03.',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma app web global precisa servir usuários da região que oferece menor latência entre us-east-1 e eu-west-1. Qual routing policy do Route 53?',
    options: [
      'Simple routing',
      'Weighted routing',
      'Latency-based routing',
      'Geolocation routing',
    ],
    correct: 2,
    explanation: 'Latency-based direciona o usuário para a Region com menor latência medida (não geografia). Geolocation roteia por PAÍS/continente do usuário (diferente — pode mandar alguém da Espanha para a América se configurado assim). Weighted é split percentual. Simple é IP único.',
  },
  {
    question: 'Qual a diferença principal entre CloudFront e Global Accelerator?',
    options: [
      'CloudFront usa anycast, Global Accelerator usa unicast',
      'CloudFront cacheia conteúdo em edges (HTTP/S); Global Accelerator roteia TCP/UDP via rede AWS para ALBs/NLBs',
      'São o mesmo serviço com nomes diferentes',
      'Global Accelerator é só para gaming',
    ],
    correct: 1,
    explanation: 'CloudFront é CDN — cacheia HTTP/HTTPS perto do usuário. Global Accelerator é rede — pega IP anycast estático, roteia qualquer TCP/UDP pela backbone AWS até endpoint (ALB/NLB/EC2/EIP). Ambos usam Edge Locations mas com propósitos diferentes. CloudFront para conteúdo web; GA para apps stateful, gaming, IoT, non-HTTP.',
  },
  {
    question: 'Uma empresa precisa configurar failover DNS: site primário em us-east-1, DR em us-west-2. Se o primário ficar down (health check falha), Route 53 deve mandar para DR. Qual routing policy?',
    options: [
      'Simple',
      'Weighted',
      'Failover',
      'Multi-value answer',
    ],
    correct: 2,
    explanation: 'Failover routing: associa health check ao registro primário. Se health check falhar, Route 53 responde com o secondary automaticamente. Multi-value pode retornar múltiplos IPs mas sem prioridade estruturada de failover como o Failover policy.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dns-cdn-edge"
      title="Route 53, CloudFront e Global Accelerator"
      icon="🌐"
      xp={70}
      readTime={13}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="ec2-autoscaling-elb"
      nextTitle="EC2 Profissional: Auto Scaling e Load Balancers"
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
        Performance global e resiliência começam na borda. Route 53 (DNS), CloudFront (CDN) e Global Accelerator (rede anycast) são os 3 serviços de edge da AWS — com papéis complementares. O SAA-C03 testa quando usar cada um, as routing policies do Route 53, e como combinar para HA global.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 3 — Design High-Performing Architectures" weight="24%" color={ACCENT} />
        <p>
          Edge services cobrem performance E resiliência. Questões típicas: escolher routing policy, decidir CloudFront vs Global Accelerator, configurar failover cross-region, bloquear ataques com WAF na borda.
        </p>
      </Section>

      <Section title="Amazon Route 53 — muito mais que DNS" accent={ACCENT}>
        <p>Route 53 é DNS altamente disponível (SLA 100%) com health checks e 7 routing policies. É o único serviço AWS com SLA de 100% de uptime.</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de registro', 'Uso']}
          rows={[
            ['A', 'IPv4 → domínio'],
            ['AAAA', 'IPv6 → domínio'],
            ['CNAME', 'Alias para outro domínio (NÃO pode ser root/apex)'],
            ['Alias (AWS)', 'Alias nativo AWS — pode ser no apex (exemplo.com); sem custo de query'],
            ['MX', 'Mail exchanger'],
            ['TXT', 'Texto (SPF, DKIM, domain verification)'],
            ['NS', 'Nameservers autoritativos da zona'],
            ['SOA', 'Start of Authority — metadata da zona'],
          ]}
        />
        <Callout tone="info">
          <strong>CNAME vs Alias:</strong> CNAME não pode ser usado no apex (root) de um domínio. Alias (tipo AWS) pode — é como um CNAME mágico para recursos AWS (ALB, CloudFront, S3 website, API GW), sem custo de query DNS.
        </Callout>
      </Section>

      <Section title="As 7 Routing Policies do Route 53" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Policy', 'Quando usar']}
          rows={[
            ['Simple', '1 registro, 1 ou mais IPs (retorna todos aleatoriamente)'],
            ['Weighted', 'Split de tráfego por peso (ex: 90% v1, 10% v2 para canary)'],
            ['Latency-based', 'Menor latência entre múltiplas regiões'],
            ['Failover', 'Active-passive DR (primário + secundário via health check)'],
            ['Geolocation', 'Baseado em país/continente do usuário'],
            ['Geoproximity', 'Geografia + bias (aumentar/diminuir "atração" de uma região)'],
            ['Multi-value answer', 'Retorna até 8 healthy records, simulando LB com health check'],
          ]}
        />
      </Section>

      <Section title="Health Checks do Route 53" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Endpoint</strong> — HTTP/HTTPS/TCP a um domínio/IP com intervalo 10s ou 30s</li>
          <li>• <strong>CloudWatch Alarm</strong> — health baseado em estado de um alarme CW</li>
          <li>• <strong>Calculated</strong> — combinação lógica (AND/OR) de outros health checks</li>
          <li>• Global, executados de vários pontos — você configura quantos devem falhar para marcar unhealthy</li>
          <li>• SNS integration: notifica quando estado muda</li>
        </ul>
      </Section>

      <Section title="Amazon CloudFront — CDN da AWS" accent={ACCENT}>
        <ArchDiagram title="CloudFront: conteúdo cacheado perto do usuário" accent={ACCENT}>{`
   Usuário (São Paulo)         Usuário (Londres)
        │                           │
        ▼                           ▼
   Edge Location (GRU)        Edge Location (LHR)
        │  cache hit?              │  cache hit?
        │  sim → responde          │  sim → responde
        │  não → busca origin      │  não → busca origin
        │                          │
        └─────────► Origin ◄───────┘
              (S3 bucket, ALB, EC2, on-prem)
`}</ArchDiagram>
        <p><strong>Conceitos-chave:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Distribution</strong> — configuração central (domínio, origin, behaviors)</li>
          <li>• <strong>Origin</strong> — de onde vem o conteúdo (S3, ALB, EC2, on-prem)</li>
          <li>• <strong>Behavior</strong> — regra por path pattern (/*.jpg cachear 1 dia, /api/* nunca cachear)</li>
          <li>• <strong>Cache key</strong> — o que identifica um cache hit (URL + headers + cookies selecionados)</li>
          <li>• <strong>TTL</strong> — tempo que o objeto fica no cache (min/default/max)</li>
          <li>• <strong>OAC (Origin Access Control)</strong> — força acesso ao S3 apenas via CloudFront (bloqueia direct access)</li>
          <li>• <strong>Signed URLs / Cookies</strong> — conteúdo privado com expiração</li>
          <li>• <strong>Lambda@Edge / CloudFront Functions</strong> — lógica customizada na borda</li>
          <li>• <strong>Invalidation</strong> — força remoção de cache antes do TTL (primeiros 1000/mês grátis)</li>
        </ul>
      </Section>

      <Section title="CloudFront Functions vs Lambda@Edge" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'CloudFront Functions', 'Lambda@Edge']}
          rows={[
            ['Runtime', 'JavaScript (ES5) minimalista', 'Node.js ou Python'],
            ['Duração max', '1 ms', 'Viewer 5s / Origin 30s'],
            ['Memória', '2 MB', 'Até 10 GB (origin) / 128 MB (viewer)'],
            ['Onde roda', 'Edge Locations (global)', 'Regional Edge Caches'],
            ['Custo', '$0,10 por milhão requests', '$0,60 + duração'],
            ['Uso típico', 'Header manipulation, URL rewrite, auth leve', 'Lógica complexa, chamadas a APIs, MD5'],
          ]}
        />
      </Section>

      <Section title="AWS Global Accelerator" accent={ACCENT}>
        <ArchDiagram title="Global Accelerator: 2 IPs anycast globais" accent={ACCENT}>{`
   Usuário em ────► IP estático anycast ───► Edge AWS ───► Backbone AWS ───► ALB/NLB/EC2
   qualquer lugar    (2 IPs globais)        (mais próximo)                  (em região específica)
`}</ArchDiagram>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Fornece 2 <strong>IPs anycast estáticos</strong> — mesmos IPs globalmente</li>
          <li>• Tráfego entra no Edge mais próximo, atravessa a backbone AWS até o endpoint</li>
          <li>• Health checks automáticos — failover para endpoints saudáveis</li>
          <li>• Endpoints: ALB, NLB, EC2, Elastic IP</li>
          <li>• Suporta <strong>qualquer TCP/UDP</strong> (ideal para gaming, IoT, VoIP, non-HTTP)</li>
          <li>• Custo: $0,025/h + premium de data transfer</li>
        </ul>
        <Callout tone="info">
          <strong>Global Accelerator vs CloudFront:</strong> CloudFront é HTTP/HTTPS + cache. Global Accelerator é TCP/UDP + roteamento ótimo pela backbone (não cacheia). Para sites: CloudFront. Para gaming/VoIP/APIs com tráfego dinâmico que beneficia de redução de jitter: GA.
        </Callout>
      </Section>

      <Section title="Padrões de arquitetura de edge" accent={ACCENT}>
        <StackFlow
          title="Stack típico para app web global"
          accent={ACCENT}
          items={[
            { icon: '🌎', label: 'Usuário', sub: 'de qualquer geografia', detail: 'Resolver DNS aponta para Route 53.' },
            { icon: '🗺️', label: 'Route 53', sub: 'latency routing', detail: 'Escolhe o endpoint mais rápido para aquele usuário. Pode retornar CloudFront estático ou dinâmico.' },
            { icon: '⚡', label: 'CloudFront', sub: 'estático + dinâmico', detail: 'Cache de HTML/CSS/JS no edge. APIs passam sem cache, mas aproveitam a rede AWS.' },
            { icon: '🪣', label: 'S3 / ALB', sub: 'origem', detail: 'Estático: S3 (HTML/CSS/JS). Dinâmico: ALB em us-east-1 (ou outra região).' },
            { icon: '⚙️', label: 'EC2 / ECS / Lambda', sub: 'compute', detail: 'Responde as requisições dinâmicas atrás do ALB.' },
          ]}
        />
      </Section>

      <Section title="CloudFront + WAF + Shield" accent={ACCENT}>
        <p>
          Combo padrão para proteção na borda: Shield (DDoS L3/L4) é grátis e automático. WAF (L7) filtra requests maliciosos antes de chegarem no origin. CloudFront absorve picos antes do ALB. Reduz custo do origin e protege contra ataques.
        </p>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Blog estático em S3, quer servir globalmente com HTTPS e custom domain"
          winner="CloudFront + ACM certificate + Alias Route 53 para distribution"
          winnerColor={ACCENT}
          why="CloudFront cacheia HTML/assets perto do usuário, suporta HTTPS com ACM grátis, integra direto com S3 via OAC. Route 53 Alias aponta apex sem custo."
        />
        <DecisionBox
          scenario="Game online que precisa de baixa latência UDP e failover entre regiões"
          winner="AWS Global Accelerator com endpoints em múltiplas regiões"
          winnerColor={ACCENT}
          why="UDP não passa por CloudFront. GA oferece 2 IPs anycast, roteamento pela backbone (estável), health checks com failover automático. Ideal para jogo stateful."
        />
        <DecisionBox
          scenario="Site SaaS com usuários globais precisa preferir us-east-1 mas ir para eu-west-1 se us cair"
          winner="Route 53 com Failover routing + health checks"
          winnerColor={ACCENT}
          why="Failover policy é purpose-built para active-passive. Health check no primário; se unhealthy, Route 53 responde com secundário automaticamente."
        />
        <DecisionBox
          scenario="Canary deploy — mandar 5% do tráfego para nova versão, 95% para estável"
          winner="Route 53 Weighted routing"
          winnerColor={ACCENT}
          why="Weighted policy com weights 5 e 95 faz split percentual por DNS. Ajuste gradual aumentando weight da nova versão."
        />
        <DecisionBox
          scenario="Streaming de vídeo com usuários em 40 países — deve servir do ponto mais próximo geograficamente"
          winner="CloudFront (com Regional Edge Caches)"
          winnerColor={ACCENT}
          why="CloudFront cacheia vídeo segmentado em Edge Locations. Usuário baixa chunks do Edge mais próximo. Streaming ganha 10x em latência e bandwidth vs origin direto."
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinhas de edge no SAA:</strong>
        <ul className="flex flex-col gap-1 mt-1">
          <li>• <strong>CNAME não no apex</strong> — use Alias para exemplo.com.</li>
          <li>• <strong>Latency routing ≠ Geolocation</strong> — latency é medido; geolocation é por país.</li>
          <li>• <strong>CloudFront não acelera APIs stateful bem</strong> — para WebSocket/gRPC/UDP, use Global Accelerator.</li>
          <li>• <strong>Shield Advanced</strong> é pago ($3k/mês) e inclui cobertura de scaling costs durante DDoS, DRT 24/7.</li>
          <li>• <strong>CloudFront é HTTPS-capable</strong> — via ACM (grátis) no certificado. Origins podem ser HTTP.</li>
          <li>• <strong>OAI está deprecated</strong> — use OAC para S3. Para ALB, use secret header + WAF rule.</li>
        </ul>
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Como bloquear o acesso direto ao S3 e forçar tráfego via CloudFront?"
          a={<>Use <strong>Origin Access Control (OAC)</strong>. CloudFront assina requests ao S3; bucket policy permite apenas requests com assinatura válida do distribution. Acesso direto ao S3 retorna 403.</>}
        />
        <QAItem
          q="Route 53 pode hospedar domínio comprado em outro registrar (ex: GoDaddy)?"
          a={<>Sim. Crie a Hosted Zone no Route 53; você recebe 4 nameservers (NS records). No registrar de origem, aponte os NS para esses — zero downtime se bem feito.</>}
        />
        <QAItem
          q="Diferença entre private e public Hosted Zone?"
          a={<>Public = resolve na internet. Private = associada a VPCs, resolve apenas dentro delas. Ideal para domínios internos (ex: db.internal.corp) que não devem aparecer publicamente.</>}
        />
        <QAItem
          q="Como reduzir custo de transferência de dados em CloudFront?"
          a={<>(1) Aumentar TTL para reduzir origin fetches. (2) Usar <InlineCode>Price Class 100</InlineCode> ou <InlineCode>200</InlineCode> para servir só de regiões mais baratas (sacrifica latência para regiões caras). (3) Compressão automática (Brotli/Gzip). (4) Origin Shield (adiciona camada intermediária reduzindo origin load).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Route 53 = DNS com health checks + 7 routing policies (Simple, Weighted, Latency, Failover, Geo, Geoproximity, Multi-value). Alias permite registros no apex. CloudFront = CDN HTTP/S com edges globais, OAC para S3, WAF/Shield na borda. Global Accelerator = 2 IPs anycast + backbone AWS, ideal para TCP/UDP non-HTTP. Stack típico: Route 53 → CloudFront (cache) → ALB → compute. Para non-HTTP: Route 53 → GA → NLB/EC2.
      </Callout>
    </div>
  );
}
