import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, LayerStack, NodeGraph, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('aws-global-infra');

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma aplicação crítica precisa de alta disponibilidade em caso de falha de data center. Qual é a melhor prática arquitetural da AWS?',
    options: [
      'Replicar a aplicação em múltiplas Regiões geograficamente distantes',
      'Replicar a aplicação em múltiplas Availability Zones (AZs) dentro da mesma Região',
      'Usar uma única AZ com múltiplas instâncias EC2',
      'Usar um único Edge Location',
    ],
    correct: 1,
    explanation: 'A prática padrão para HA é Multi-AZ dentro de uma Região. AZs são data centers fisicamente separados (km de distância) com alimentação, rede e refrigeração independentes, mas conectados por fibra de baixa latência. Multi-Region é para DR global, não HA básica.',
  },
  {
    question: 'Um usuário em Tóquio acessa um site hospedado em São Paulo. Qual serviço AWS reduz a latência entregando conteúdo estático de um Edge Location próximo a Tóquio?',
    options: [
      'Amazon EC2',
      'Amazon CloudFront',
      'AWS Direct Connect',
      'Amazon VPC',
    ],
    correct: 1,
    explanation: 'CloudFront é o CDN da AWS. Ele usa Edge Locations (mais de 600 globalmente) para cachear conteúdo próximo ao usuário final, reduzindo latência drasticamente.',
  },
  {
    question: 'Uma empresa precisa rodar workloads AWS dentro do próprio data center por requisitos regulatórios, mantendo API unificada com a nuvem. Qual serviço?',
    options: [
      'AWS CloudFront',
      'AWS Local Zones',
      'AWS Outposts',
      'AWS Wavelength',
    ],
    correct: 2,
    explanation: 'AWS Outposts leva hardware e serviços AWS (EC2, EBS, RDS, ECS) para dentro do seu data center. A API é a mesma da AWS pública, permitindo extensão híbrida sem refatoração.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="aws-global-infra"
      title="Infraestrutura Global: Regiões, AZs e Edge"
      icon="🌎"
      xp={40}
      readTime={8}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="modelo-responsabilidade-compartilhada"
      nextTitle="Modelo de Responsabilidade Compartilhada"
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
        Toda arquitetura AWS existe dentro de um mapa geográfico real: data centers físicos espalhados pelo mundo. Saber a hierarquia — Região → AZ → Data Center → Edge — é pré-requisito para escolher onde colocar seus workloads, entender latência, compliance e alta disponibilidade. Sem esse mapa mental, você lê "Multi-AZ" e não entende o valor real.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 1 — Cloud Concepts" weight="24%" color={ACCENT} />
        <p>
          Questões de infraestrutura global aparecem em todos os domínios, mas a definição pura é cobrada no domínio 1. Espera-se que você saiba: o que é uma Região, uma AZ, um Edge Location, quando usar cada um e como a escolha afeta custo, latência e compliance.
        </p>
      </Section>

      <Section title="Hierarquia visual da infraestrutura AWS" accent={ACCENT}>
        <LayerStack
          title="Hierarquia física da AWS"
          accent={ACCENT}
          layers={[
            { label: 'GLOBAL', content: 'Conta única + serviços globais', note: 'IAM · Route 53 · CloudFront · WAF', tone: 'base' },
            { label: 'REGION', content: 'sa-east-1 (São Paulo)', note: '3 AZs isoladas', tone: 'default' },
            { label: 'AZ', content: 'sa-east-1a · 1b · 1c', note: 'Cada AZ = 1+ data center físico (racks, servidores, discos)', tone: 'writable' },
            { label: 'REGION', content: 'us-east-1 (N. Virginia)', note: '6 AZs', tone: 'default' },
            { label: 'EDGE', content: '600+ Edge Locations', note: 'Cache/DNS próximos ao usuário (CloudFront, Route 53, Shield)', tone: 'base' },
          ]}
        />
      </Section>

      <Section title="Região (Region)" accent={ACCENT}>
        <p>
          Uma <strong>Região</strong> é um agrupamento físico de data centers em uma localização geográfica específica. Em abril/2026 a AWS tem 33+ Regiões comerciais ativas e mais anunciadas.
        </p>
        <p>Características:</p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Cada Região é <strong>isolada</strong> das outras — falha em us-east-1 não afeta sa-east-1</li>
          <li>• Identificada por código: <InlineCode>us-east-1</InlineCode> (Virgínia), <InlineCode>sa-east-1</InlineCode> (São Paulo), <InlineCode>eu-west-1</InlineCode> (Irlanda)</li>
          <li>• Dados <strong>não</strong> saem da Região a menos que você explicitamente configure replicação</li>
          <li>• Preços variam por Região — us-east-1 costuma ser o mais barato, sa-east-1 entre os mais caros</li>
          <li>• Nem todo serviço está em toda Região — verificar <InlineCode>aws.amazon.com/about-aws/global-infrastructure/regional-product-services</InlineCode></li>
        </ul>
      </Section>

      <Section title="Critérios para escolher uma Região" accent={ACCENT}>
        <NodeGraph
          title="4 fatores decisivos na escolha de Região"
          accent={ACCENT}
          columns={[
            { label: 'Compliance', nodes: [{ icon: '📋', label: 'Soberania de dados', sub: 'LGPD · GDPR · HIPAA · PCI' }] },
            { label: 'Latência', nodes: [{ icon: '⚡', label: 'Proximidade dos usuários', sub: 'Round-trip ms conta em workloads interativos', tone: 'emphasis' }] },
            { label: 'Preço', nodes: [{ icon: '💰', label: 'Custo por região', sub: 'us-east-1 barato; sa-east-1 entre os mais caros' }] },
            { label: 'Serviços', nodes: [{ icon: '🧩', label: 'Disponibilidade', sub: 'Nem todo serviço chega a todas regiões' }] },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Fator', 'Pergunta prática', 'Regra geral']}
          rows={[
            ['Compliance / soberania', 'Dados podem sair do país/bloco?', 'LGPD: preferir sa-east-1. GDPR: eu-central-1, eu-west-1.'],
            ['Latência', 'Onde estão os usuários?', 'Público BR → sa-east-1. Público global → CloudFront + múltiplas Regiões.'],
            ['Preço', 'Workload é sensível a custo?', 'us-east-1 é a mais barata. sa-east-1 pode ser ~50% mais cara.'],
            ['Disponibilidade de serviço', 'A feature que preciso está aqui?', 'Serviços novos lançam primeiro em us-east-1. Verifique matriz.'],
          ]}
        />
      </Section>

      <Section title="Availability Zone (AZ)" accent={ACCENT}>
        <p>
          Uma <strong>AZ</strong> é um ou mais data centers dentro de uma Região, com <strong>alimentação, rede e refrigeração independentes</strong>. AZs de uma mesma Região são:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Fisicamente separadas (muitos km de distância) para evitar falhas correlacionadas</li>
          <li>• Conectadas entre si por fibra privada de <strong>baixa latência</strong> (&lt;10ms)</li>
          <li>• Identificadas por sufixo: <InlineCode>sa-east-1a</InlineCode>, <InlineCode>sa-east-1b</InlineCode>, <InlineCode>sa-east-1c</InlineCode></li>
          <li>• Cada Região tem <strong>pelo menos 3</strong> AZs (geralmente 3-6)</li>
        </ul>
        <Callout tone="info">
          <strong>Alta disponibilidade = Multi-AZ.</strong> Se um tornado, incêndio ou queda de energia derrubar uma AZ, sua aplicação continua respondendo pelas outras. Quase todo serviço gerenciado da AWS (RDS, ALB, Lambda) já roda Multi-AZ por trás dos panos.
        </Callout>
      </Section>

      <Section title="Edge Locations e PoPs" accent={ACCENT}>
        <p>
          <strong>Edge Locations</strong> (também chamadas de Points of Presence — PoPs) são instalações menores e mais numerosas, espalhadas por 100+ cidades. Não rodam EC2 nem bancos de dados — servem apenas alguns serviços específicos:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'O que faz no Edge']}
          rows={[
            ['CloudFront', 'Cache de conteúdo estático (HTML, imagens, vídeos)'],
            ['Route 53', 'Resolução DNS global com baixa latência'],
            ['AWS Shield', 'Mitigação DDoS próxima à origem do tráfego'],
            ['AWS WAF', 'Firewall de aplicação web no edge'],
            ['Lambda@Edge', 'Funções serverless executadas no Edge (antes de chegar à origem)'],
            ['Global Accelerator', 'Anycast IP que entra na rede AWS no edge mais próximo'],
          ]}
        />
      </Section>

      <Section title="Outros tipos de localização (híbridos)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'O que é', 'Uso típico']}
          rows={[
            ['AWS Local Zones', 'Subconjunto de serviços em cidades sem Região completa (Miami, Dallas, LA)', 'Gaming, mídia, workloads que precisam &lt;10ms para usuários em metrópoles'],
            ['AWS Wavelength', 'AWS dentro de redes 5G das telcos', 'Aplicações ultra-baixa latência: AR/VR, veículos autônomos'],
            ['AWS Outposts', 'Rack AWS físico instalado no seu DC', 'Compliance rígido, workloads que não podem sair do DC'],
            ['AWS Snow Family', 'Dispositivos físicos para migrar petabytes offline', 'Migração inicial quando a banda é insuficiente'],
          ]}
        />
      </Section>

      <Section title="Cenários reais de escolha de arquitetura" accent={ACCENT}>
        <DecisionBox
          scenario="E-commerce brasileiro, público 100% no Brasil, quer o menor custo"
          winner="Região única: sa-east-1 + CloudFront"
          winnerColor={ACCENT}
          why="sa-east-1 entrega baixa latência local. CloudFront absorve picos (Black Friday) e cacheia estáticos em Edge Locations espalhados no BR. Multi-AZ dá HA suficiente."
          alternatives={[
            { name: 'Multi-Region', note: 'Exagero: duplica custo sem ganho real para público local' },
          ]}
        />
        <DecisionBox
          scenario="Fintech global com usuários em BR, EUA e Europa"
          winner="Multi-Region (sa-east-1 + us-east-1 + eu-west-1)"
          winnerColor={ACCENT}
          why="Cada mercado regulado separadamente. Dados brasileiros ficam em sa-east-1 (LGPD), europeus em eu-west-1 (GDPR). CloudFront + Route 53 latency-based routing direcionam cada usuário à Região mais próxima."
        />
        <DecisionBox
          scenario="Hospital com dados de pacientes que não podem sair do DC próprio"
          winner="AWS Outposts + Região mais próxima"
          winnerColor={ACCENT}
          why="Outposts instala hardware AWS dentro do hospital. Dados sensíveis permanecem lá. Backups não-sensíveis sobem para a Região mais próxima via link privado."
        />
        <DecisionBox
          scenario="Startup SaaS B2B com MVP pago por cartão brasileiro"
          winner="us-east-1 puro inicialmente"
          winnerColor={ACCENT}
          why="Preço mais baixo + todos os serviços disponíveis + docs e comunidade massiva. Latência de 120ms do BR é aceitável para SaaS B2B. Migra para sa-east-1 quando a base justificar."
        />
      </Section>

      <Section title="Como olhar a infraestrutura na prática" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Listar todas as Regiões disponíveis
aws ec2 describe-regions --query 'Regions[].RegionName' --output table

# Listar AZs da sa-east-1
aws ec2 describe-availability-zones \\
  --region sa-east-1 \\
  --query 'AvailabilityZones[].{Name:ZoneName,State:State,Type:ZoneType}'

# Resultado típico:
# sa-east-1a  available  availability-zone
# sa-east-1b  available  availability-zone
# sa-east-1c  available  availability-zone`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Armadilha:</strong> "us-east-1a" da conta A pode ser um data center FÍSICO diferente de "us-east-1a" da conta B. A AWS aleatoriza a atribuição letra↔DC por conta para balancear carga. Para identificar uma AZ fisicamente única, use <InlineCode>AZ ID</InlineCode> (ex: <InlineCode>use1-az1</InlineCode>), não o nome.
      </Callout>

      <Section title="Perguntas típicas de exame (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual é a diferença entre Região e Availability Zone?"
          a={<>Região = agrupamento geográfico (ex: São Paulo). AZ = data center isolado dentro da Região. Uma Região tem <strong>pelo menos 3 AZs</strong> para permitir arquiteturas HA com quorum.</>}
        />
        <QAItem
          q="Um serviço 'global' como CloudFront — como ele se distribui?"
          a={<>Serviços globais operam fora da noção de Região. CloudFront usa Edge Locations. IAM é replicado globalmente. Route 53 tem anycast. Pontos globais aparecem no console sem seletor de Região.</>}
        />
        <QAItem
          q="Qual é o mínimo de AZs recomendado para uma arquitetura altamente disponível na AWS?"
          a={<><strong>Duas AZs</strong> é o mínimo absoluto para HA. Três é recomendado para quorum em serviços distribuídos (Kafka, Zookeeper, etcd). A AWS costuma projetar para 3 por padrão.</>}
        />
        <QAItem
          q="Qual serviço garante latência &lt;10ms em metrópoles sem Região AWS completa?"
          a={<>AWS Local Zones. São subconjuntos da AWS em cidades como Miami, Boston, Houston. Para 5G ultra-baixa latência, Wavelength. Para dentro do seu DC, Outposts.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Hierarquia: Região &gt; AZ &gt; Data Center. Edge Locations são diferentes — só servem CloudFront/Route 53/Shield/WAF/Lambda@Edge. Escolha de Região = compliance + latência + preço + serviços. Multi-AZ = HA barata. Multi-Region = DR global. Outposts/Local Zones/Wavelength = extensões híbridas para casos específicos.
      </Callout>
    </div>
  );
}
