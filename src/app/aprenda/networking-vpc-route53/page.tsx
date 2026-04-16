import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, ArchDiagram, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Networking AWS: VPC, Route 53, CloudFront — FFV Academy',
  description: 'VPC, subnets, Security Groups, NACLs, Internet Gateway, NAT, Route 53, CloudFront, Direct Connect. A rede na AWS explicada com diagramas.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre Security Groups e NACLs (Network ACLs) na AWS?',
    options: [
      'Security Groups operam na camada 4, NACLs na camada 2',
      'Security Groups são stateful (lembram conexões); NACLs são stateless',
      'Security Groups só funcionam em instâncias públicas',
      'Não há diferença — são sinônimos',
    ],
    correct: 1,
    explanation: 'Security Groups são stateful: se você permite tráfego de entrada, a resposta de saída é automaticamente permitida. NACLs são stateless: você precisa configurar explicitamente inbound E outbound. Security Groups atuam na ENI (instância); NACLs atuam na subnet.',
  },
  {
    question: 'Uma EC2 em subnet privada precisa baixar pacotes do repositório público (apt update). Qual recurso é necessário?',
    options: [
      'Internet Gateway diretamente',
      'NAT Gateway em subnet pública',
      'VPN Gateway',
      'VPC Endpoint',
    ],
    correct: 1,
    explanation: 'Um NAT Gateway em subnet pública permite que subnets privadas façam conexões de saída para a internet, mas impede conexões de entrada. É o padrão para instâncias privadas que precisam sair para a internet (patches, APIs externas).',
  },
  {
    question: 'Um site precisa entregar conteúdo estático com baixa latência para usuários em 5 continentes. Qual serviço usar?',
    options: [
      'Amazon EC2 em 5 regiões',
      'Amazon CloudFront (CDN)',
      'AWS Global Accelerator',
      'Route 53',
    ],
    correct: 1,
    explanation: 'CloudFront é o CDN global da AWS. Cacheia conteúdo estático em 600+ Edge Locations, reduzindo latência drasticamente. Global Accelerator otimiza TCP/UDP mas não cacheia conteúdo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="networking-vpc-route53"
      title="Networking: VPC, Route 53, CloudFront"
      icon="🌐"
      xp={55}
      readTime={11}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="seguranca-aws-servicos"
      nextTitle="Segurança AWS: KMS, GuardDuty, Shield, WAF"
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
        Networking é o tecido que conecta tudo na AWS. EC2, RDS, Lambda (quando em VPC), S3 (via endpoint), API Gateway — todos falam através de redes que VOCÊ define. O CLF-C02 cobre os conceitos essenciais: VPC, subnets, Security Groups, NACLs, Internet Gateway, NAT, DNS (Route 53) e CDN (CloudFront).
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 3 — Cloud Technology and Services" weight="34%" color={ACCENT} />
        <p>
          Networking é frequentemente cobrado em questões de cenário: "a EC2 não consegue acessar a internet — o que pode ser?". A resposta envolve saber a cascata: Security Group → NACL → Route Table → IGW/NAT. O CLF-C02 não pede que você escreva um NACL complexo, mas espera que você identifique o gargalo.
        </p>
      </Section>

      <Section title="Anatomia de uma VPC" accent={ACCENT}>
        <ArchDiagram title="VPC típica com subnets pública e privada" accent={ACCENT}>{`
┌──────────────────────────────────────────────────────────────┐
│                   VPC 10.0.0.0/16                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Subnet Pública  10.0.1.0/24  (AZ-a)                │   │
│  │   ┌──────────┐       ┌──────────┐                    │   │
│  │   │ EC2 web  │       │ NAT GW   │                    │   │
│  │   └──────────┘       └──────────┘                    │   │
│  │        │                  │                          │   │
│  │        └──────┬───────────┘                          │   │
│  └───────────────┼──────────────────────────────────────┘   │
│                  │                                           │
│                  ▼                                           │
│          ┌──────────────┐        ┌──────────────────┐       │
│          │Internet GW   │◀─────▶│     INTERNET     │       │
│          └──────────────┘        └──────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Subnet Privada  10.0.2.0/24  (AZ-a)                │   │
│  │   ┌──────────┐       ┌──────────┐                    │   │
│  │   │EC2 app   │       │  RDS     │                    │   │
│  │   └──────────┘       └──────────┘                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
`}</ArchDiagram>
      </Section>

      <Section title="Componentes de uma VPC" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'O que faz']}
          rows={[
            ['VPC', 'Rede virtual isolada em uma Região (bloco CIDR IPv4/IPv6)'],
            ['Subnet', 'Fração da VPC em uma AZ específica (pública ou privada)'],
            ['Internet Gateway (IGW)', 'Permite subnets da VPC comunicarem com a internet'],
            ['NAT Gateway', 'Permite subnets privadas SAÍREM para internet sem serem acessíveis de fora'],
            ['Route Table', 'Define para onde vai o tráfego de uma subnet'],
            ['Security Group', 'Firewall stateful a nível de instância'],
            ['Network ACL (NACL)', 'Firewall stateless a nível de subnet'],
            ['VPC Peering', 'Conecta duas VPCs diretamente (não transitivo)'],
            ['Transit Gateway', 'Hub central conectando múltiplas VPCs e on-prem'],
            ['VPN Gateway', 'Conecta VPC a rede on-prem via IPsec pela internet'],
            ['Direct Connect', 'Link dedicado físico (fibra) entre on-prem e AWS'],
            ['VPC Endpoint', 'Acesso privado a serviços AWS (S3, DynamoDB) sem passar na internet'],
          ]}
        />
      </Section>

      <Section title="Subnet pública vs privada" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Pública', 'Privada']}
          rows={[
            ['Rota default', 'Aponta para Internet Gateway', 'Aponta para NAT Gateway (ou nada)'],
            ['IP público', 'Instâncias recebem auto-assign', 'Sem IP público (só privado)'],
            ['Acesso da internet', 'Possível (se SG permitir)', 'Impossível diretamente'],
            ['Uso típico', 'Web servers, ALB, Bastion, NAT', 'App servers, bancos, caches'],
          ]}
        />
      </Section>

      <Section title="Security Group vs NACL" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Característica', 'Security Group', 'NACL']}
          rows={[
            ['Nível', 'ENI / Instância', 'Subnet'],
            ['Estado', 'Stateful (lembra conexões)', 'Stateless (regras separadas in/out)'],
            ['Regras', 'Allow apenas (sem deny)', 'Allow e Deny'],
            ['Avaliação', 'Todas as regras', 'Por ordem numerada'],
            ['Padrão novo', 'Bloqueia tudo inbound, libera tudo outbound', 'Libera tudo'],
          ]}
        />
        <Callout tone="info">
          <strong>Defensa em camadas:</strong> use Security Group como primeira defesa (simples, stateful). Use NACLs quando precisar bloquear IPs/subnets específicos em nível de subnet.
        </Callout>
      </Section>

      <Section title="Route 53 — DNS gerenciado" accent={ACCENT}>
        <p>
          DNS authoritative da AWS. Registra domínios, resolve nomes, e faz <strong>routing policies</strong> inteligentes:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Policy', 'Comportamento']}
          rows={[
            ['Simple', 'Retorna um único valor'],
            ['Weighted', 'Distribui por pesos (ex: 70/30 para A/B testing)'],
            ['Latency-based', 'Direciona para a Região com menor latência'],
            ['Failover', 'Primary + secondary (health check)'],
            ['Geolocation', 'Roteia pela origem geográfica do usuário'],
            ['Geoproximity', 'Baseado em distância geográfica (com bias)'],
            ['Multivalue Answer', 'Retorna múltiplos IPs com health check'],
          ]}
        />
      </Section>

      <Section title="CloudFront — CDN global" accent={ACCENT}>
        <p>
          Cacheia conteúdo em 600+ Edge Locations. Origem pode ser S3, ALB, EC2 ou qualquer HTTP endpoint. Features:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>TLS/HTTPS</InlineCode> com certificados ACM grátis</li>
          <li>• <InlineCode>Origin Access Control (OAC)</InlineCode> — proteção do bucket S3 para servir só via CloudFront</li>
          <li>• <InlineCode>Lambda@Edge / CloudFront Functions</InlineCode> — compute no edge</li>
          <li>• <InlineCode>Signed URLs / Signed Cookies</InlineCode> — acesso controlado a conteúdo privado</li>
          <li>• <InlineCode>AWS Shield Standard</InlineCode> (grátis) + <InlineCode>AWS WAF</InlineCode> (pago) integrados</li>
        </ul>
      </Section>

      <Section title="Conectando AWS ao seu data center" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Meio', 'Latência / Segurança']}
          rows={[
            ['Site-to-Site VPN', 'Internet pública (IPsec)', 'Latência variável, criptografado'],
            ['Client VPN', 'Usuários finais via OpenVPN', 'Acesso individual a VPC'],
            ['Direct Connect', 'Fibra dedicada', 'Latência baixa e previsível, altíssima banda'],
            ['Direct Connect Gateway', 'DX + múltiplas VPCs/Regiões', 'Hub de conectividade'],
          ]}
        />
      </Section>

      <Section title="Load Balancers" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Camada OSI', 'Uso']}
          rows={[
            ['Application LB (ALB)', '7 (HTTP/HTTPS)', 'Apps web, HTTP routing avançado, WebSocket'],
            ['Network LB (NLB)', '4 (TCP/UDP)', 'Alta performance, latência ultra-baixa, IPs estáticos'],
            ['Gateway LB (GWLB)', '3 (IP)', 'Insere appliances de segurança na camada de rede'],
            ['Classic LB (CLB)', '4 e 7 (legacy)', 'Evitar — só existe para compat'],
          ]}
        />
      </Section>

      <Section title="AWS Global Accelerator" accent={ACCENT}>
        <p>
          Anycast de dois IPs estáticos que entram na rede AWS no Edge mais próximo e roteiam por fibra privada até a Região. Diferente do CloudFront (que cacheia), Global Accelerator otimiza TCP/UDP em tempo real — ideal para jogos, VoIP, APIs.
        </p>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Web app simples: front-end + backend + banco. Como estruturar a VPC?"
          winner="1 VPC, 2 subnets públicas (ALB + NAT GW) + 2 subnets privadas (EC2 app + RDS) em 2 AZs"
          winnerColor={ACCENT}
          why="Padrão público/privado. ALB público expõe HTTPS. App em subnet privada acessa internet via NAT para patches/APIs externas. RDS isolado em subnet privada. Multi-AZ dá HA."
        />
        <DecisionBox
          scenario="Serviço global distribuir imagens estáticas com baixa latência"
          winner="S3 + CloudFront + OAC"
          winnerColor={ACCENT}
          why="S3 como origem. CloudFront cacheia globalmente. OAC protege o bucket para servir só via CloudFront (nunca direto)."
        />
        <DecisionBox
          scenario="Matriz corporativa + 3 filiais + AWS — conectividade estável"
          winner="Direct Connect + Transit Gateway"
          winnerColor={ACCENT}
          why="DX entrega link dedicado da matriz. Transit Gateway centraliza rotas para todas as VPCs e as 3 filiais (via VPN). Modelo hub-and-spoke escala."
        />
        <DecisionBox
          scenario="EC2 privada precisa acessar S3 sem passar pela internet"
          winner="VPC Endpoint (Gateway Endpoint para S3)"
          winnerColor={ACCENT}
          why="Gateway Endpoints (S3, DynamoDB) são gratuitos e roteiam tráfego dentro da rede AWS. Mais seguro, mais barato, mais rápido que sair por NAT + IGW."
        />
      </Section>

      <Section title="Exemplos de CLI" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Criar VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Criar subnet pública
aws ec2 create-subnet --vpc-id vpc-abc \\
  --cidr-block 10.0.1.0/24 \\
  --availability-zone sa-east-1a

# Security Group permitindo SSH só de um IP
aws ec2 create-security-group \\
  --group-name bastion-sg \\
  --description "SSH from office" \\
  --vpc-id vpc-abc
aws ec2 authorize-security-group-ingress \\
  --group-id sg-xyz \\
  --protocol tcp --port 22 \\
  --cidr 203.0.113.42/32

# Route 53 — criar um registro A
aws route53 change-resource-record-sets \\
  --hosted-zone-id Z1234 \\
  --change-batch file://change.json`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Pegadinha:</strong> "VPC Peering é transitivo?" — <strong>Não</strong>. Se A peering B e B peering C, A NÃO fala com C. Para conectar múltiplas VPCs, use <strong>Transit Gateway</strong>.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Quais são os 2 tipos de VPC Endpoints?"
          a={<><strong>Gateway Endpoint</strong> (S3, DynamoDB — grátis) e <strong>Interface Endpoint</strong> (PrivateLink, a maioria dos outros serviços — pago, com ENI em cada subnet).</>}
        />
        <QAItem
          q="Qual é o papel do Internet Gateway?"
          a={<>Componente horizontal escalável redundante, anexado à VPC, que permite comunicação entre instâncias na VPC e a internet. Sem IGW, a VPC é 100% isolada.</>}
        />
        <QAItem
          q="Diferença entre NAT Gateway e NAT Instance?"
          a={<>NAT Gateway é gerenciado pela AWS (HA automático em uma AZ, escala automática). NAT Instance é uma EC2 que você gerencia (mais barata para low-traffic mas você cuida de tudo). Padrão moderno: NAT Gateway.</>}
        />
        <QAItem
          q="Qual a menor VPC (bloco CIDR) permitida pela AWS?"
          a={<>/28 (16 IPs). A AWS reserva 5 IPs em cada subnet (network, VPC router, DNS, future use, broadcast), então uma /28 tem apenas 11 utilizáveis. Maior permitida: /16.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> VPC = rede isolada por Região. Subnet = por AZ. Pública (rota → IGW) vs privada (rota → NAT). SG = stateful na ENI. NACL = stateless na subnet. Route 53 = DNS + 7 policies. CloudFront = CDN em 600+ Edges. Global Accelerator = anycast TCP/UDP. VPC Endpoint = acesso privado a serviços AWS. DX = fibra dedicada. ALB/NLB/GWLB por camada.
      </Callout>
    </div>
  );
}
