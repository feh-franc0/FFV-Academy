import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('advanced-networking-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando Transit Gateway é melhor que VPC peering?',
    options: [
      'Nunca',
      'A partir de ~5 VPCs ou qualquer cenário multi-account/multi-region. Peering é mesh (N·(N-1)/2) que explode em complexidade; TGW é hub-and-spoke com route tables centralizadas, suporta VPN/DX attach, cross-region peering',
      'Sempre peering',
      'Só em 1 região',
    ],
    correct: 1,
    explanation: 'Peering é ótimo até 3-4 VPCs. Acima disso, route tables viram pesadelo e peering não é transitivo (A↔B, B↔C não dá A↔C). TGW resolve com hub central, route tables por attachment, integração nativa com DX Gateway e TGW peering cross-region. Custo: ~$36/mês por attachment + data processing.',
  },
  {
    question: 'Qual é o papel do AWS RAM nesse contexto?',
    options: [
      'Só memória EC2',
      'Resource Access Manager compartilha recursos (subnets, TGW, License Manager configs, Route 53 Resolver rules) entre contas da Organization. Padrão: conta Network "dona" do TGW + subnets, compartilha via RAM com contas Workload, elimina NAT Gateways duplicados',
      'Versão do S3',
      'Billing',
    ],
    correct: 1,
    explanation: 'RAM viabiliza o padrão "shared VPC": conta Network cria VPC + subnets + TGW, compartilha com contas Workload que lançam ENIs nessas subnets. Benefícios: 1 NAT Gateway serve N contas, routing centralizado, IP space unificado. Billing: recurso roda na conta owner, uso na conta participant.',
  },
  {
    question: 'Quando VPC Lattice faz mais sentido que Transit Gateway?',
    options: [
      'É equivalente',
      'Lattice opera na camada de aplicação (HTTP/gRPC) pra service-to-service com auth IAM nativo, health checks e routing por path. TGW opera na L3/L4 (roteamento IP puro). Use Lattice pra malha de microserviços cross-VPC/account, TGW pra conectividade de rede',
      'Substitui TGW',
      'Só L1',
    ],
    correct: 1,
    explanation: 'Lattice é service mesh managed simplificado (não é App Mesh). Expõe serviço por nome DNS lattice-specific, com routing L7 e auth SigV4. TGW continua necessário pra conectividade de rede ampla (on-prem, cross-region, bulk traffic). Usa-se os dois — papéis complementares.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="advanced-networking-sap"
      title="Advanced networking: RAM, Cloud WAN, Transit Gateway"
      icon="🌐"
      xp={65}
      readTime={15}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="migracao-7rs-sap"
      nextTitle="Migration strategy: os 7 Rs + DMS + SMS"
      quiz={quiz}
    >
      <Section title="Transit Gateway: o hub" accent={accent}>
        <p>
          TGW é o hub de roteamento regional. Cada VPC, VPN, Direct Connect Gateway vira um "attachment". Route tables dentro do TGW decidem quais attachments se enxergam — permite segmentação (prod não fala com dev) sem precisar de security groups adicionais. Scale: até 5.000 attachments por TGW, 50 Gbps por attachment (burstable).
        </p>
        <CodeBlock lang="yaml">{`Padrão hub-and-spoke com segmentação:

TGW route tables:
  prod-rt:
    associations: [prod-vpc-a, prod-vpc-b]
    routes:
      10.0.0.0/8   → tgw-attachment-shared-services
      0.0.0.0/0    → tgw-attachment-egress-vpc

  nonprod-rt:
    associations: [dev-vpc, staging-vpc]
    routes:
      10.0.0.0/8   → tgw-attachment-shared-services
      0.0.0.0/0    → tgw-attachment-egress-vpc

  (prod-rt não tem rota pra nonprod — isolamento L3)`}</CodeBlock>
      </Section>

      <Section title="RAM + shared VPC: economia em escala" accent={accent}>
        <p>
          Sem RAM, cada conta cria sua VPC, NAT Gateway ($32/mês + $0.045/GB), VPC endpoints. 50 contas = 50 NAT Gateways. Com shared VPC via RAM: conta Network mantém 2 NATs (uma por AZ), 50 contas lançam workloads nas mesmas subnets. Economia tangível + governance centralizada.
        </p>
        <CodeBlock lang="bash">{`# Conta Network compartilha subnets com Workloads OU
aws ram create-resource-share \
  --name shared-subnets-prod \
  --resource-arns arn:aws:ec2:us-east-1:111111111111:subnet/subnet-a,arn:aws:ec2:us-east-1:111111111111:subnet/subnet-b \
  --principals arn:aws:organizations::111111111111:ou/o-xxx/ou-yyy \
  --allow-external-principals false

# Na conta Workload: subnets aparecem como "shared", usáveis em EC2/RDS/ECS
aws ec2 describe-subnets --filters Name=owner-id,Values=111111111111`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Security groups em shared VPC: conta participant cria seus próprios SGs. Você pode referenciar SG de outra conta como source — padrão para microserviços cross-account na mesma VPC compartilhada.
        </Callout>
      </Section>

      <Section title="Cloud WAN: global WAN como serviço" accent={accent}>
        <p>
          Para topologias globais (5+ regiões, dezenas de sites on-prem), Cloud WAN unifica configuração. Você define "core network" declarativo (YAML) com segments (equivalente a route tables), attachments (VPCs/VPNs/DX), policies. AWS propaga automaticamente entre regiões. Substitui arquitetura "TGW por região + TGW peering mesh" que vira ingovernável.
        </p>
        <Callout tone="success" icon="✅">
          Regra de bolso: 1-2 regiões com até 20 VPCs → Transit Gateway suficiente. 3+ regiões globais ou 50+ VPCs → considere Cloud WAN pra reduzir operational overhead.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
