import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, ArchDiagram, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vpc-avancado');

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa precisa conectar 50 VPCs em uma topologia full-mesh. Qual solução é mais gerenciável?',
    options: [
      'VPC Peering entre todas as VPCs (N*(N-1)/2 conexões)',
      'Um Transit Gateway central conectado a todas as VPCs',
      'Site-to-Site VPN entre cada par de VPCs',
      'NAT Gateway em cada VPC',
    ],
    correct: 1,
    explanation: 'VPC Peering em full-mesh exige 50*49/2 = 1.225 conexões pontuais, não-transitivo (se A↔B e B↔C, A NÃO fala com C). Transit Gateway é hub-and-spoke nativo: cada VPC conecta ao TGW, routing centralizado, suporta até milhares de VPCs. Padrão moderno para multi-VPC.',
  },
  {
    question: 'Qual é a diferença fundamental entre Security Group e Network ACL?',
    options: [
      'SG é stateful (permite resposta automática); NACL é stateless (precisa regra ida+volta)',
      'SG opera em subnet; NACL opera em instância',
      'NACL permite apenas tráfego interno da VPC',
      'SG não suporta regras de deny',
    ],
    correct: 0,
    explanation: 'SG é stateful e aplicado à ENI (instância) — se você permite inbound, o outbound de resposta é automaticamente permitido. NACL é stateless, aplicado à subnet — precisa regra explícita para cada direção. SG só tem allow rules; NACL tem allow e deny (numeradas, avaliadas em ordem).',
  },
  {
    question: 'Uma instância em subnet privada precisa chamar API do S3 sem passar pela internet. Qual solução?',
    options: [
      'NAT Gateway + Internet Gateway',
      'VPC Endpoint Gateway para S3 (grátis)',
      'Site-to-Site VPN',
      'Transit Gateway',
    ],
    correct: 1,
    explanation: 'VPC Endpoint Gateway (S3 e DynamoDB) permite acesso privado a estes serviços sem IGW/NAT, totalmente dentro da rede AWS, GRATUITO. Para outros serviços (SQS, SNS, etc), use Interface Endpoint (PrivateLink), pago por hora + GB. NAT Gateway custa ~$0.045/h + data transfer — desnecessário para este caso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vpc-avancado"
      title="VPC em Profundidade: NAT, Peering, Transit Gateway"
      icon="🕸️"
      xp={85}
      readTime={16}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="dns-cdn-edge"
      nextTitle="Route 53, CloudFront e Global Accelerator"
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
        VPC é onde o SAA-C03 separa os candidatos. Não basta &ldquo;saber o que é&rdquo;: você precisa desenhar, escolher entre NAT Gateway e VPC Endpoint, entender quando Transit Gateway vence Peering, saber quando PrivateLink é a única opção. Este módulo é denso — relê se precisar.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 2 — Design Resilient Architectures" weight="26%" color={ACCENT} />
        <p>
          Networking é transversal: aparece em Resilient (multi-AZ, DR), Secure (SG/NACL, VPC Endpoints), High-Performing (Transit Gateway, Direct Connect) e Cost (escolha entre NAT Gateway e VPC Endpoint).
        </p>
      </Section>

      <Section title="Anatomia de uma VPC" accent={ACCENT}>
        <ArchDiagram title="VPC padrão com subnets pública e privada em 2 AZs" accent={ACCENT}>{`
           VPC  10.0.0.0/16
  ┌──────────────────────────────────────────┐
  │                                          │
  │   AZ us-east-1a         AZ us-east-1b    │
  │   ┌──────────┐          ┌──────────┐     │
  │   │ Public   │          │ Public   │ ← IGW
  │   │ Subnet   │          │ Subnet   │     │
  │   │ 10.0.1.0 │          │ 10.0.2.0 │     │
  │   │ /24      │          │ /24      │     │
  │   │          │          │          │     │
  │   │ NAT-GW ──┼──────────┤ ALB      │     │
  │   └─────┬────┘          └─────┬────┘     │
  │         │                     │          │
  │   ┌─────▼────┐          ┌─────▼────┐     │
  │   │ Private  │          │ Private  │     │
  │   │ Subnet   │          │ Subnet   │     │
  │   │ 10.0.10.0│          │ 10.0.11.0│     │
  │   │ /24      │          │ /24      │     │
  │   │ EC2 app  │          │ EC2 app  │     │
  │   └──────────┘          └──────────┘     │
  │                                          │
  │   ┌─────────────┐     ┌─────────────┐    │
  │   │ DB Subnet   │     │ DB Subnet   │    │
  │   │ 10.0.20.0/24│     │ 10.0.21.0/24│    │
  │   │  RDS primary│     │ RDS standby │    │
  │   └─────────────┘     └─────────────┘    │
  └──────────────────────────────────────────┘
`}</ArchDiagram>
        <p><strong>Componentes essenciais:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>CIDR block</strong> — range IPv4 privado (ex: 10.0.0.0/16 = 65k IPs)</li>
          <li>• <strong>Subnets</strong> — subdivisões da VPC, cada uma em UMA AZ específica</li>
          <li>• <strong>Route Tables</strong> — definem destino do tráfego; associadas a subnets</li>
          <li>• <strong>Internet Gateway (IGW)</strong> — acesso bidirecional à internet (1 por VPC)</li>
          <li>• <strong>NAT Gateway</strong> — acesso outbound-only à internet para subnets privadas</li>
          <li>• <strong>Security Groups</strong> — firewall stateful em nível de ENI</li>
          <li>• <strong>Network ACLs</strong> — firewall stateless em nível de subnet</li>
        </ul>
      </Section>

      <Section title="Subnet pública vs privada — a diferença técnica" accent={ACCENT}>
        <p>
          Não existe flag "public" em subnet. Uma subnet é <strong>pública</strong> se sua route table tem rota <InlineCode>0.0.0.0/0 → IGW</InlineCode> E as instâncias têm IP público (ou Elastic IP). Privada = sem rota direta para IGW.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de subnet', 'Route table aponta para', 'Uso']}
          rows={[
            ['Pública', 'IGW em 0.0.0.0/0', 'ALB/NLB frontais, Bastion, NAT Gateway'],
            ['Privada (com NAT)', 'NAT Gateway em 0.0.0.0/0', 'EC2 app que precisa updates/APIs'],
            ['Privada isolada', 'Sem 0.0.0.0/0 (só local VPC)', 'RDS, ElastiCache, bastiões sensíveis'],
          ]}
        />
      </Section>

      <Section title="NAT Gateway vs NAT Instance" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'NAT Gateway (recomendado)', 'NAT Instance (legacy)']}
          rows={[
            ['Gerenciamento', 'Totalmente gerenciado pela AWS', 'Você gerencia (EC2 + AMI)'],
            ['Bandwidth', 'Até 100 Gbps automaticamente', 'Limitada pela instance type'],
            ['HA', 'HA dentro da AZ (deploy 1 por AZ para Multi-AZ)', 'Manual via failover scripts'],
            ['Custo', '$0,045/h + $0,045/GB', 'Custo da EC2 + data transfer'],
            ['Security Groups', '❌ Não suporta', '✅ Suporta'],
            ['Port Forwarding', '❌', '✅'],
            ['Usar como Bastion', '❌', '✅'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra prática:</strong> use NAT Gateway em 99% dos casos. NAT Instance só aparece em questões "legacy/custom" ou onde port forwarding é requerido.
        </Callout>
      </Section>

      <Section title="Security Groups vs NACLs" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Security Group', 'Network ACL']}
          rows={[
            ['Nível', 'ENI (instância)', 'Subnet'],
            ['Stateful?', 'Sim — retorno automático', 'Não — precisa regra ida + volta'],
            ['Allow/Deny', 'Só allow (implicit deny)', 'Allow e Deny'],
            ['Regras avaliadas', 'Todas (union)', 'Em ordem numérica (primeiro match ganha)'],
            ['Max rules', '60 inbound + 60 outbound', '20 inbound + 20 outbound (soft limit 40)'],
            ['Attach a', 'Instâncias (até 5 SGs por ENI)', '1 NACL por subnet'],
            ['Uso típico', 'Controle fine-grained por app/tier', 'Bloqueio amplo (ex: IP banido)'],
          ]}
        />
        <Callout tone="warn">
          <strong>NACL ephemeral ports:</strong> como é stateless, resposta de uma request sai por porta ephemeral (1024-65535). Se NACL não permitir outbound nessas portas, a resposta é bloqueada — e você fica sem entender por quê.
        </Callout>
      </Section>

      <Section title="Conectividade entre VPCs — opções" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Solução', 'Uso', 'Limitações']}
          rows={[
            ['VPC Peering', '2 VPCs, 1-a-1', 'Não-transitivo. CIDRs não podem overlap.'],
            ['Transit Gateway', 'Hub-and-spoke para muitas VPCs + on-prem', 'Custo por attachment + data processing'],
            ['VPC Endpoint / PrivateLink', 'Expor serviço de uma VPC para outras (sem peering)', 'Unidirecional (consumer → provider)'],
            ['Site-to-Site VPN', 'VPC ↔ on-prem via IPSec', 'Passa pela internet (encrypted)'],
            ['Direct Connect', 'VPC ↔ on-prem via link físico dedicado', 'Alto custo, setup em semanas/meses'],
            ['Client VPN', 'Usuários individuais ↔ VPC', 'OpenVPN-based, por usuário'],
          ]}
        />
      </Section>

      <Section title="VPC Peering — detalhes" accent={ACCENT}>
        <ArchDiagram title="VPC Peering é 1-a-1, não-transitivo" accent={ACCENT}>{`
   VPC-A ══peer══ VPC-B ══peer══ VPC-C
     │              │              │
     └──────── ❌ não fala ────────┘
   (A e C NÃO se conectam via B)

   Para A ↔ C: crie peering A↔C também (full mesh)
`}</ArchDiagram>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Conexão lógica entre 2 VPCs (mesma conta ou cross-account)</li>
          <li>• Funciona cross-region desde 2018 (Inter-Region Peering)</li>
          <li>• CIDRs não podem se sobrepor</li>
          <li>• Não-transitivo — cada par precisa peering próprio</li>
          <li>• Atualize route tables de AMBAS as VPCs manualmente</li>
          <li>• Custo: só data transfer ($0,01/GB same-AZ, $0,02/GB cross-AZ)</li>
        </ul>
      </Section>

      <Section title="Transit Gateway — a solução moderna" accent={ACCENT}>
        <ArchDiagram title="Transit Gateway centraliza roteamento" accent={ACCENT}>{`
                    ┌────────────────┐
                    │ Transit Gateway│
                    └────┬───────────┘
         ┌───────────────┼───────────────┐
         │        │      │       │       │
      VPC-A    VPC-B  VPC-C   VPN      Direct
      (prod)  (dev)  (shared) on-prem  Connect
`}</ArchDiagram>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Hub central que conecta VPCs + VPNs + Direct Connect</li>
          <li>• Suporta <strong>milhares</strong> de VPCs</li>
          <li>• Roteamento por <strong>TGW Route Tables</strong> (pode segregar: prod-TGW-RT não fala com dev-TGW-RT)</li>
          <li>• Cross-region: TGW Peering</li>
          <li>• Multicast support (único AWS service nativamente)</li>
          <li>• Custo: $0,05/h por attachment + $0,02/GB processamento</li>
        </ul>
        <Callout tone="info">
          <strong>Quando escolher TGW vs Peering:</strong> se você tem &gt;3 VPCs ou prevê crescimento, Transit Gateway vale a pena. Full-mesh com peering é insustentável acima de ~5 VPCs.
        </Callout>
      </Section>

      <Section title="VPC Endpoints — dois tipos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Serviços', 'Custo', 'Como funciona']}
          rows={[
            ['Gateway Endpoint', 'S3 e DynamoDB (apenas)', 'GRÁTIS', 'Rota adicionada à route table para prefix-list do serviço'],
            ['Interface Endpoint (PrivateLink)', 'Todos os outros (SQS, SNS, KMS, API GW, ECS, etc.)', '$0,01/h + $0,01/GB', 'ENI criada na subnet com DNS privado'],
          ]}
        />
        <ArchDiagram title="Gateway Endpoint (S3)" accent={ACCENT}>{`
   Private Subnet              ┌─────────────┐
   ┌────────────┐              │ S3 Service  │
   │    EC2     │─────tráfego──┤ (AWS)       │
   └────────────┘   via rota    └─────────────┘
                    para
                    Gateway
                    Endpoint
   (sem IGW, sem NAT, sem passar na internet)
`}</ArchDiagram>
        <Callout tone="success">
          <strong>Economia concreta:</strong> se sua app em subnet privada faz muito S3/DynamoDB, troque NAT Gateway por Gateway Endpoint. Elimina $0,045/GB de data transfer do NAT — pode economizar milhares/mês.
        </Callout>
      </Section>

      <Section title="AWS PrivateLink — serviço privado seu" accent={ACCENT}>
        <p>
          PrivateLink permite expor um serviço (atrás de NLB) em uma VPC para consumidores em outras VPCs/contas, via Interface Endpoint. Unidirecional: consumer chama provider, provider não enxerga consumer de volta.
        </p>
        <ArchDiagram title="PrivateLink pattern SaaS" accent={ACCENT}>{`
   VPC Consumer A         VPC Consumer B
   ┌──────────┐           ┌──────────┐
   │ EC2      │           │ EC2      │
   └────┬─────┘           └────┬─────┘
        │                      │
   [VPC Endpoint]         [VPC Endpoint]
        │                      │
        └──────► NLB ◄─────────┘
                │
          VPC Provider (SaaS)
`}</ArchDiagram>
      </Section>

      <Section title="VPN vs Direct Connect" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Site-to-Site VPN', 'Direct Connect']}
          rows={[
            ['Meio físico', 'Internet (IPSec tunnel)', 'Link físico dedicado (fibra 1/10/100 Gbps)'],
            ['Latência', 'Variável (depende da internet)', 'Consistente, baixa'],
            ['Banda', 'Até ~1,25 Gbps por tunnel', '1/10/100 Gbps dedicada'],
            ['Setup', 'Minutos', 'Semanas a meses'],
            ['Custo', '$0,05/h + data transfer', '$$$ taxa de porta + datacenter partner'],
            ['Criptografia', 'Nativa (IPSec)', 'NÃO criptografada por padrão (use DX + VPN)'],
            ['Uso típico', 'Small/medium, burst, DR', 'Throughput sustentado, compliance'],
          ]}
        />
        <Callout tone="info">
          <strong>Direct Connect + VPN:</strong> combo comum — DX para banda/latência, VPN por cima para criptografia. Também serve de failover (DX cai → VPN assume).
        </Callout>
      </Section>

      <Section title="VPC Flow Logs, Reachability Analyzer, Network Access Analyzer" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>VPC Flow Logs</strong> — metadata de tráfego (src, dst, port, ACCEPT/REJECT). Entregue a CloudWatch Logs ou S3.</li>
          <li>• <strong>Reachability Analyzer</strong> — testa se A consegue chegar em B (considera SG, NACL, routes). Útil para debug.</li>
          <li>• <strong>Network Access Analyzer</strong> — audita postura: "liste todas as EC2 que podem alcançar a internet" — ótimo para compliance.</li>
        </ul>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Startup com 2 VPCs (prod + analytics) que precisam se comunicar"
          winner="VPC Peering"
          winnerColor={ACCENT}
          why="2 VPCs = peering direto, barato, simples. Transit Gateway seria overkill e custaria $0,05/h por attachment + processing."
        />
        <DecisionBox
          scenario="Empresa com 30 VPCs em 3 regiões, precisando conectar todas + on-prem"
          winner="Transit Gateway em cada região + TGW Peering entre regiões + Direct Connect para on-prem"
          winnerColor={ACCENT}
          why="30 VPCs em peering seriam 435 conexões. TGW centraliza, simplifica routing via TGW Route Tables. DX para on-prem se throughput justifica."
        />
        <DecisionBox
          scenario="App em subnet privada faz 5TB/mês de leituras do S3"
          winner="Gateway VPC Endpoint para S3"
          winnerColor={ACCENT}
          why="5TB via NAT Gateway = 5000 × $0,045 = $225/mês só de processamento + bandwidth. Gateway Endpoint = $0."
        />
        <DecisionBox
          scenario="SaaS precisa expor seu serviço a múltiplos clientes de forma privada (sem internet)"
          winner="PrivateLink (VPC Endpoint Service) com NLB na frente"
          winnerColor={ACCENT}
          why="Cada cliente cria um Interface Endpoint na sua VPC, conecta via NLB do provedor. Sem roteamento complexo, sem CIDR overlap, isolamento total."
        />
        <DecisionBox
          scenario="Backup semanal de 50 TB de on-prem → S3"
          winner="Direct Connect"
          winnerColor={ACCENT}
          why="50 TB via VPN levaria semanas. DX 10 Gbps entrega em ~11h. Se é único/infrequente, use Snowball em vez."
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinhas VPC no SAA:</strong>
        <ul className="flex flex-col gap-1 mt-1">
          <li>• Subnet vive em <strong>UMA</strong> AZ (não abrange múltiplas).</li>
          <li>• CIDR mínimo /28 (16 IPs) e máximo /16 (65k IPs) na VPC.</li>
          <li>• AWS reserva 5 IPs por subnet (primeiro .0 network, .1 VPC router, .2 DNS, .3 futuro, .255 broadcast).</li>
          <li>• NAT Gateway é <strong>por AZ</strong> — deploy 1 em cada AZ para HA real.</li>
          <li>• Security Groups permitem referenciar OUTROS SGs como source/dest (pattern para micro-segmentação).</li>
          <li>• VPC Peering e TGW não suportam CIDRs sobrepostos.</li>
          <li>• Default VPC vem com subnets públicas em cada AZ. Production sempre cria VPC custom.</li>
        </ul>
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Como permitir que uma EC2 em subnet privada faça download de patches do OS?"
          a={<>NAT Gateway em subnet pública + route 0.0.0.0/0 → NAT-GW na route table da subnet privada. A instância inicia conexão outbound; tráfego inbound é bloqueado.</>}
        />
        <QAItem
          q="Quais serviços suportam Gateway VPC Endpoint (grátis)?"
          a={<>Apenas <strong>S3</strong> e <strong>DynamoDB</strong>. Todos os outros (SQS, SNS, KMS, Lambda, API Gateway, ECS, SSM, etc.) usam Interface Endpoint via PrivateLink (pago).</>}
        />
        <QAItem
          q="Minha instância privada em subnet X consegue fazer ping em outra instância privada na subnet Y mesma VPC?"
          a={<>Sim, por padrão rotas locais da VPC permitem tráfego entre subnets. O que decide é: SGs de ambas as instâncias permitem? NACL de ambas permitem? Regra do SG geralmente é o que bloqueia.</>}
        />
        <QAItem
          q="Como garantir que certas subnets nunca tenham internet mesmo se alguém tentar criar uma rota por acidente?"
          a={<>Use SCPs no Organizations negando <InlineCode>ec2:CreateRoute</InlineCode> para destinos que envolvam IGW. Complementar: NACLs rígidas bloqueando 0.0.0.0/0 outbound. Combinação dá defense-in-depth.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> VPC = rede isolada com CIDR próprio. Subnets ficam em 1 AZ. Pública = rota IGW; privada = rota NAT ou isolada. SG é stateful (allow-only); NACL é stateless (allow/deny numeradas). Peering = 1-a-1 não-transitivo; Transit Gateway = hub-and-spoke para muitas. Gateway Endpoint (S3/DynamoDB) é grátis; Interface Endpoint (PrivateLink) é pago mas cobre quase tudo. VPN via internet; DX via fibra dedicada. Use Reachability Analyzer para debug de conectividade.
      </Callout>
    </div>
  );
}
