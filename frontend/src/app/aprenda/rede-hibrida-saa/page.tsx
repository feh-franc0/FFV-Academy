import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge, ArchDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rede-hibrida-saa');

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Sua empresa quer conectar um datacenter on-prem à AWS com link previsível de 10 Gbps, baixa latência e backup automático caso o link caia. Qual arquitetura?',
    options: [
      'Apenas Site-to-Site VPN (barato e rápido)',
      'Direct Connect com 2 conexões redundantes em locais diferentes',
      'Direct Connect como principal + Site-to-Site VPN como failover',
      'Apenas Transit Gateway inter-region',
    ],
    correct: 2,
    explanation: 'O padrão AWS oficial é Direct Connect como link primário (latência estável, alto throughput) + Site-to-Site VPN como backup (rota pela internet via IPSec). Se o DX cair, BGP faz failover automático para o túnel VPN. Duas conexões DX dão alta disponibilidade mas sem a resiliência contra falha regional do DX inteiro.',
  },
  {
    question: 'Você precisa permitir que EC2 em subnet privada acesse S3 sem passar por NAT Gateway e sem tráfego cruzar a internet. Qual recurso?',
    options: [
      'Interface Endpoint (PrivateLink) para S3',
      'Gateway Endpoint para S3',
      'Transit Gateway',
      'NAT Gateway em subnet privada',
    ],
    correct: 1,
    explanation: 'S3 e DynamoDB usam GATEWAY Endpoints (rota adicionada à route table, gratuito, só dentro da mesma região). Os demais serviços (incluindo S3 Express One Zone, mas não S3 Standard) usam INTERFACE Endpoints via PrivateLink (ENI em cada AZ, pago por hora + GB). Gateway Endpoint é a escolha para S3 Standard — zero custo.',
  },
  {
    question: 'Sua aplicação em VPC-A precisa consumir um serviço privado de um parceiro em VPC-B (outra conta AWS), mas sem expor toda a VPC-B. Melhor solução?',
    options: [
      'VPC Peering entre A e B',
      'Transit Gateway compartilhado',
      'AWS PrivateLink (endpoint service em B, interface endpoint em A)',
      'VPN entre as VPCs',
    ],
    correct: 2,
    explanation: 'PrivateLink é feito exatamente para isso — expor um único serviço (atrás de NLB ou GWLB) sem compartilhar CIDRs. O parceiro cria um Endpoint Service em VPC-B; você cria um Interface Endpoint em VPC-A. Não há roteamento entre as VPCs — só comunicação no ENI do endpoint.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rede-hibrida-saa"
      title="Rede Híbrida: Direct Connect, VPN, PrivateLink e VPC Endpoints"
      icon="🌉"
      xp={70}
      readTime={13}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="ml-ia-arquiteto-saa"
      nextTitle="ML/IA para Arquiteto: SageMaker, Bedrock e Pipelines"
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
        Rede é o tópico mais denso do SAA-C03. Você viu VPC básico e roteamento — agora entra a parte <em>híbrida</em>: como conectar datacenters on-prem,
        expor serviços privados entre contas, economizar dinheiro com VPC Endpoints e decidir quando usar Direct Connect vs VPN. Essa é a camada que
        aparece em 4-6 questões de toda prova SAA — e as respostas erradas sempre parecem convincentes.
      </p>

      <ExamDomainBadge domain="Resilient + Secure" weight="~26% + 30% do SAA-C03" color={ACCENT} />

      <Section title="Os 5 componentes-chave" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Para quê', 'Nível']}
          rows={[
            ['Site-to-Site VPN', 'Túnel IPSec on-prem ↔ VPC via internet', 'Rede pública, criptografada'],
            ['Direct Connect (DX)', 'Link dedicado (1/10/100 Gbps) on-prem ↔ AWS via parceiro/colo', 'Rede privada, baixa variabilidade'],
            ['Client VPN', 'Endpoint OpenVPN para usuários remotos (laptop) acessarem VPC', 'Usuário final ↔ VPC'],
            ['PrivateLink', 'Expor serviço de VPC A para VPC B (outra conta) sem compartilhar CIDR', 'Serviço ↔ Serviço'],
            ['VPC Endpoints (Gateway/Interface)', 'Acesso privado a serviços AWS (S3, DynamoDB, Secrets Manager...) sem NAT', 'VPC ↔ AWS Service'],
          ]}
        />
      </Section>

      <Section title="Direct Connect (DX)" accent={ACCENT}>
        <p>
          Link físico dedicado entre seu datacenter e um AWS Direct Connect Location (colo) via parceiro (Equinix, DigitalRealty). Capacidades padrão:
          50/100/200/300/400/500 Mbps (via partner) ou 1/10/100 Gbps (dedicado).
        </p>
        <ArchDiagram title="Topologia Direct Connect" accent={ACCENT}>{`
  On-prem Router ←───── Colo (DX Location) ─────→ AWS
       │                     │                      │
       │ Cross-connect        │                      │
       └─────────────────────┼───── DX Connection ───┘
                             │
                 Virtual Interfaces (VIFs)
                       │
          ┌────────────┼──────────────┐
          ▼            ▼              ▼
       Private VIF  Public VIF     Transit VIF
       (1 VPC)      (AWS públicos) (TGW = muitas VPCs)
        `}</ArchDiagram>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de VIF', 'Acessa']}
          rows={[
            ['Private VIF', 'Uma VPC via Virtual Private Gateway (VGW)'],
            ['Public VIF', 'Endpoints públicos da AWS (S3, DynamoDB, EC2 APIs) via IP público'],
            ['Transit VIF', 'Transit Gateway — uma VIF atinge dezenas de VPCs'],
          ]}
        />
        <Callout tone="warn">
          DX <strong>sozinho não é criptografado</strong> (é link privado, não internet). Para compliance que exige criptografia em trânsito, use
          <strong> MACsec</strong> (em DX dedicado 10/100 Gbps) ou <strong>VPN por cima do DX</strong> (IPSec sobre Public VIF).
        </Callout>
      </Section>

      <Section title="Site-to-Site VPN" accent={ACCENT}>
        <p>
          Túnel IPSec entre Customer Gateway (roteador on-prem) e Virtual Private Gateway (VGW) ou Transit Gateway. A AWS sempre cria <strong>2
          túneis redundantes</strong> em AZs diferentes para cada VPN connection.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Site-to-Site VPN', 'Direct Connect']}
          rows={[
            ['Setup', 'Minutos', 'Semanas a meses (cross-connect físico)'],
            ['Throughput por túnel', 'Até 1.25 Gbps', '1/10/100 Gbps garantidos'],
            ['Latência', 'Variável (internet)', 'Baixa e estável'],
            ['Custo', '~$0.05/hora + transferência', 'Mensal + port hours + transferência'],
            ['Criptografia', 'IPSec (nativa)', 'Não (use MACsec ou VPN over DX)'],
          ]}
        />
        <Callout tone="info">
          Padrão &ldquo;cinto e suspensórios&rdquo;: <strong>Direct Connect primary + VPN backup</strong>. BGP failover automático se o DX cair.
        </Callout>
      </Section>

      <Section title="Client VPN" accent={ACCENT}>
        <p>
          Endpoint OpenVPN gerenciado para <strong>usuários remotos</strong> (laptop de home office) acessarem VPC/on-prem. Autenticação via Active Directory,
          certificados mútuos ou Federated SSO (SAML). Suporta até 20.000 conexões simultâneas por endpoint.
        </p>
      </Section>

      <Section title="VPC Endpoints: Gateway vs Interface" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['', 'Gateway Endpoint', 'Interface Endpoint (PrivateLink)']}
          rows={[
            ['Serviços', 'APENAS S3 e DynamoDB', 'Quase todos os outros (KMS, Secrets Manager, SNS, SQS, ECR, SageMaker, etc.)'],
            ['Como funciona', 'Rota na Route Table apontando para o endpoint', 'ENI com IP privado em cada AZ da subnet'],
            ['Custo', 'GRÁTIS', '$0.01/hora por AZ + $0.01/GB processado'],
            ['DNS', 'Usa endpoint público normal, AWS routing faz o resto', 'DNS privado: resolve nome público para IP privado do ENI'],
            ['Escopo', 'Dentro da mesma região', 'Dentro da mesma região'],
          ]}
        />
        <Callout tone="success">
          Optimização clássica de custo: <strong>substituir NAT Gateway por VPC Endpoints</strong>. Se a VPC privada só acessa S3 + DynamoDB, dois Gateway
          Endpoints gratuitos tiram a necessidade de NAT (que custa $0.045/hora + $0.045/GB).
        </Callout>
      </Section>

      <Section title="PrivateLink" accent={ACCENT}>
        <p>
          Mecanismo por baixo dos Interface Endpoints — também usado para <strong>expor seu próprio serviço</strong> a outras VPCs/contas:
        </p>
        <ArchDiagram title="PrivateLink: expor serviço entre contas" accent={ACCENT}>{`
  Conta Produtor (VPC-B)                       Conta Consumidor (VPC-A)
  ┌─────────────────────┐                      ┌─────────────────────┐
  │  Serviço (EC2/ECS)  │                      │  App precisa consumir│
  │         ▲            │                      │         │            │
  │         │ (TCP)      │                      │         ▼            │
  │  Network Load        │                      │  Interface Endpoint  │
  │  Balancer (privado)  │                      │  (ENI com IP privado)│
  │         ▲            │                      │         │            │
  │  Endpoint Service    │←─────── cross-account ───────┘            │
  └─────────────────────┘     comunicação privada  └─────────────────────┘

  Vantagem: sem peering, sem CIDR compartilhado, só o endpoint enxerga.
        `}</ArchDiagram>
        <p>
          Alternativa a VPC Peering quando você <strong>não quer</strong> compartilhar o CIDR inteiro — só um serviço específico. Marketplace privado de
          APIs entre contas.
        </p>
      </Section>

      <Section title="Route 53 Resolver para DNS híbrido" accent={ACCENT}>
        <p>DNS híbrido é a peça esquecida da rede híbrida. Dois tipos de endpoint:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Endpoint', 'Fluxo']}
          rows={[
            ['Inbound Resolver Endpoint', 'On-prem → AWS: servidor DNS on-prem consulta hosted zones privadas da AWS'],
            ['Outbound Resolver Endpoint', 'AWS → on-prem: EC2 na VPC resolve nomes DNS do datacenter on-prem'],
          ]}
        />
        <Callout tone="info">
          Combine com <strong>Resolver Rules</strong> para forwardar queries específicas. Exemplo: <InlineCode>*.corp.empresa.com</InlineCode> vai para DNS
          on-prem, tudo mais resolve normal pela AWS.
        </Callout>
      </Section>

      <Section title="Transit Gateway inter-region" accent={ACCENT}>
        <p>
          Transit Gateways podem ser <strong>pareados entre regiões</strong> (TGW Peering). Isso cria uma malha global onde VPCs em regiões diferentes,
          datacenters on-prem via DX e VPNs convergem em um único ponto de controle. Roteamento é feito em route tables do TGW.
        </p>
        <Callout tone="warn">
          TGW inter-region Peering <strong>não suporta multicast</strong> e tem latência da WAN da AWS. Para apps ultra-low-latency inter-region, considere
          Global Accelerator.
        </Callout>
      </Section>

      <Section title="Cenários arquiteturais" accent={ACCENT}>
        <DecisionBox
          scenario="Conectar 3 datacenters (São Paulo, Santiago, Cidade do México) a 12 VPCs em 3 regiões AWS"
          winner="Direct Connect + Transit Gateway inter-region (TGW Peering)"
          winnerColor={ACCENT}
          why="DX dedica banda por datacenter. TGW em cada região consolida as VPCs. TGW Peering conecta as regiões. Escala bem com mais VPCs/datacenters — adicionar um novo é só criar uma route."
          alternatives={[{ name: 'Mesh de VPC Peering + VPN individual', note: 'não transitivo, vira pesadelo com 12+ VPCs.' }, { name: 'Cloud WAN', note: 'mais novo, camada de automação sobre TGW.' }]}
        />
        <DecisionBox
          scenario="Subnet privada (sem NAT) precisa fazer download de imagens ECR, ler Secrets Manager e escrever em S3"
          winner="Interface Endpoints (ECR, Secrets Manager) + Gateway Endpoint (S3)"
          winnerColor={ACCENT}
          why="Interface Endpoints custam mas evitam tráfego pela internet e NAT. Gateway Endpoint para S3 é grátis. Zero acesso à internet mantém conformidade."
          alternatives={[{ name: 'NAT Gateway', note: '~$33/mês + $0.045/GB — caro em alta transferência.' }, { name: 'Proxy custom em EC2', note: 'overhead operacional.' }]}
        />
        <DecisionBox
          scenario="SaaS publica API privada que 40 clientes AWS querem consumir"
          winner="PrivateLink (Endpoint Service do provedor)"
          winnerColor={ACCENT}
          why="Cada cliente cria Interface Endpoint na própria VPC. Sem peering, sem CIDR overlap, sem exposição à internet. Escalável a milhares de clientes."
          alternatives={[{ name: 'API pública com WAF', note: 'expõe à internet.' }, { name: 'VPC Peering com cada cliente', note: 'O(N) trabalho, impossível na prática.' }]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Gateway Endpoint funciona entre regiões?"
          a="Não. Gateway Endpoints são regionais e acessam S3/DynamoDB apenas na mesma região. Para cross-region use acesso público ou Interface Endpoint (suporta alguns cross-region com DNS privado)."
        />
        <QAItem
          q="VPC Peering é transitivo?"
          a="NÃO. Se A ↔ B e B ↔ C, A não fala com C. Use Transit Gateway para trânsito multi-VPC."
        />
        <QAItem
          q="DX suporta criptografia nativa?"
          a={<>Não — é link privado mas sem criptografia por padrão. Opções: <strong>MACsec</strong> (em conexões dedicadas 10/100 Gbps), <strong>VPN over DX</strong> (IPSec tunelado sobre Public VIF) ou criptografia na camada de aplicação (TLS/HTTPS).</>}
        />
        <QAItem
          q="Quando usar Global Accelerator em vez de CloudFront?"
          a={<><strong>CloudFront</strong> é para conteúdo cacheável (HTTP/HTTPS). <strong>Global Accelerator</strong> é para TCP/UDP não-cacheável — jogos, VoIP, APIs latency-sensitive — e roteia pelo backbone privado da AWS desde o ponto de presença mais próximo do cliente.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> DX = dedicado privado · VPN = túnel IPSec pela internet · Client VPN = usuários remotos · PrivateLink = expor serviço
        entre VPCs/contas · Gateway Endpoint = grátis (só S3 e DynamoDB) · Interface Endpoint = pago (demais) · Route 53 Resolver = DNS híbrido · TGW
        inter-region = malha global. HA = DX + VPN backup.
      </Callout>
    </div>
  );
}
