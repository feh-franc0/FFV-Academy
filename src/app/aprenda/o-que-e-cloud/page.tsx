import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, MindMap, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'O que é Cloud Computing? — FFV Academy',
  description: 'IaaS, PaaS, SaaS, modelos de deployment, economia de escala. O conceito que originou a AWS, explicado do zero ao nível CLF-C02.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma startup precisa testar uma ideia sem investir em servidores físicos e quer poder cancelar a qualquer momento. Qual vantagem da nuvem essa decisão melhor ilustra?',
    options: [
      'Capital expenditure (CapEx) ilimitado',
      'Trocar CapEx (investimento fixo em hardware) por OpEx (custos variáveis, pague pelo que usar)',
      'Economia de escala do fornecedor de hardware',
      'Maior segurança física',
    ],
    correct: 1,
    explanation: 'Uma das 6 vantagens oficiais da AWS é "Trade capital expense for variable expense". Em vez de comprar servidores (CapEx), você paga apenas pelo tempo de uso (OpEx), podendo parar a qualquer momento — ideal para validação de ideias.',
  },
  {
    question: 'Uma empresa SaaS oferece um CRM acessado via navegador. Os usuários não gerenciam servidores, sistema operacional nem o runtime — apenas usam o software. Qual modelo de serviço é esse?',
    options: [
      'IaaS (Infrastructure as a Service)',
      'PaaS (Platform as a Service)',
      'SaaS (Software as a Service)',
      'On-premises',
    ],
    correct: 2,
    explanation: 'SaaS entrega a aplicação completa pronta para uso. O cliente só consome o software via web. Exemplos AWS: Amazon Chime, WorkMail. Fora da AWS: Salesforce, Gmail, Dropbox.',
  },
  {
    question: 'Um hospital tem dados de pacientes que por lei não podem sair do data center próprio, mas quer usar AWS para analytics não-sensível. Qual modelo de deployment atende isso?',
    options: [
      'Cloud pública pura',
      'Cloud privada pura',
      'Cloud híbrida (parte on-prem, parte nuvem)',
      'On-premises puro',
    ],
    correct: 2,
    explanation: 'Cloud híbrida conecta o data center local à AWS via serviços como AWS Direct Connect, Storage Gateway ou AWS Outposts. Dados sensíveis ficam on-prem, workloads elásticas sobem para a nuvem.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="o-que-e-cloud"
      title="O que é Cloud Computing?"
      icon="☁️"
      xp={30}
      readTime={8}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="aws-global-infra"
      nextTitle="Infraestrutura Global: Regiões, AZs e Edge"
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
        Antes de falar de EC2, S3, Lambda ou qualquer outro serviço, você precisa entender <strong>por que</strong> a nuvem existe. Cloud Computing não é "colocar servidor na internet" — é um modelo econômico e operacional que muda como empresas lidam com TI. O exame CLF-C02 começa por aqui, e com razão: sem esse alicerce, os outros domínios não fazem sentido.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 1 — Cloud Concepts" weight="24%" color={ACCENT} />
        <p>
          O domínio 1 do CLF-C02 cobre: definição de nuvem, benefícios, modelos (IaaS/PaaS/SaaS), modelos de deployment (pública/privada/híbrida) e os 6 pilares do Well-Architected. Esse artigo cobre as 3 primeiras áreas — os pilares vêm em um artigo dedicado mais à frente.
        </p>
      </Section>

      <Section title="A definição oficial (NIST)" accent={ACCENT}>
        <p>
          O NIST (National Institute of Standards and Technology) define cloud computing como um modelo que permite acesso sob demanda, via rede, a um pool compartilhado de recursos de computação configuráveis (servidores, storage, networking, aplicações) que podem ser provisionados e liberados rapidamente com <strong>mínimo esforço de gerenciamento</strong>.
        </p>
        <p>
          Na prática, isso significa 5 características essenciais. A AWS usa exatamente essa base conceitual:
        </p>
        <MindMap
          root="Cloud Computing — 5 características essenciais (NIST)"
          accent={ACCENT}
          branches={[
            { title: 'On-demand self-service', items: ['Usuário provisiona recursos sem intervenção humana do fornecedor', 'Ex.: lançar uma EC2 em 30s pelo console'] },
            { title: 'Broad network access', items: ['Recursos acessíveis via rede padrão (HTTP/HTTPS)', 'Desktop, mobile, IoT — qualquer cliente com TCP/IP'] },
            { title: 'Resource pooling', items: ['Multi-tenancy: muitos clientes compartilhando o mesmo hardware físico', 'Recursos alocados dinamicamente conforme demanda'] },
            { title: 'Rapid elasticity', items: ['Escala para cima e para baixo automaticamente', 'Do ponto de vista do cliente, recursos "parecem" ilimitados'] },
            { title: 'Measured service', items: ['Uso monitorado, controlado e reportado', 'Cobrança granular (pay-as-you-go)'] },
          ]}
        />
      </Section>

      <Section title="Os 6 benefícios da nuvem (AWS oficial)" accent={ACCENT}>
        <p>
          A AWS documenta 6 vantagens principais. Saber essas 6 de cor é regra para o CLF-C02 — aparecem literalmente transcritas em questões:
        </p>
        <div className="flex flex-col gap-3">
          <BenefitCard
            num="1"
            title="Trade CapEx for variable expense"
            desc="Em vez de investir milhões em data centers que podem ficar ociosos, você paga apenas pelo que usar — hora de EC2, GB transferido, requisição feita."
          />
          <BenefitCard
            num="2"
            title="Benefit from massive economies of scale"
            desc="A AWS compra hardware em escala global. Esse desconto de volume é repassado para o cliente — por isso os preços caem ano após ano (já houve mais de 100 reduções desde 2006)."
          />
          <BenefitCard
            num="3"
            title="Stop guessing capacity"
            desc="Sem nuvem, você compra servidores antecipando pico de demanda (caro e ocioso) ou subdimensiona (fica fora no Black Friday). Com nuvem, Auto Scaling ajusta a capacidade em tempo real."
          />
          <BenefitCard
            num="4"
            title="Increase speed and agility"
            desc="Um ambiente de testes que antes demorava semanas para ser provisionado agora sobe em minutos. Time-to-market de features despenca."
          />
          <BenefitCard
            num="5"
            title="Stop spending money running and maintaining data centers"
            desc="Geração, refrigeração, rede, segurança física, substituição de discos — tudo isso deixa de ser problema seu. Seu time foca em produto, não em infra."
          />
          <BenefitCard
            num="6"
            title="Go global in minutes"
            desc="Com um clique você sobe uma aplicação em Regiões em São Paulo, Tóquio, Frankfurt e Ohio simultaneamente. Isso seria inviável com data centers físicos."
          />
        </div>
      </Section>

      <Section title="Modelos de serviço: IaaS, PaaS, SaaS" accent={ACCENT}>
        <p>
          Os 3 modelos diferenciam-se por <strong>quanto da pilha</strong> o cliente gerencia. Quanto mais alto no stack, menos responsabilidade do cliente.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Camada do stack', 'On-premises', 'IaaS', 'PaaS', 'SaaS']}
          rows={[
            ['Aplicações', 'Você', 'Você', 'Você', 'Fornecedor'],
            ['Dados', 'Você', 'Você', 'Você', 'Fornecedor'],
            ['Runtime', 'Você', 'Você', 'Fornecedor', 'Fornecedor'],
            ['Middleware', 'Você', 'Você', 'Fornecedor', 'Fornecedor'],
            ['Sistema operacional', 'Você', 'Você', 'Fornecedor', 'Fornecedor'],
            ['Virtualização', 'Você', 'Fornecedor', 'Fornecedor', 'Fornecedor'],
            ['Servidor', 'Você', 'Fornecedor', 'Fornecedor', 'Fornecedor'],
            ['Storage', 'Você', 'Fornecedor', 'Fornecedor', 'Fornecedor'],
            ['Rede', 'Você', 'Fornecedor', 'Fornecedor', 'Fornecedor'],
          ]}
        />

        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Você gerencia', 'AWS gerencia', 'Exemplo AWS']}
          rows={[
            ['IaaS', 'Apps, dados, runtime, SO, patches', 'Hardware, hipervisor, rede', 'EC2, EBS, VPC'],
            ['PaaS', 'Apps e dados apenas', 'SO, runtime, middleware, infra', 'Elastic Beanstalk, RDS'],
            ['SaaS', 'Nada — só usa', 'Tudo, até a UI', 'Amazon Chime, WorkMail'],
          ]}
        />

        <Callout tone="info">
          <strong>Regra de ouro do exame:</strong> se a questão fala "você instala o SO e aplica patches" → IaaS. Se fala "plataforma gerenciada onde você só faz deploy do código" → PaaS. Se fala "aplicação pronta acessada via web" → SaaS.
        </Callout>
      </Section>

      <Section title="Modelos de deployment" accent={ACCENT}>
        <p>
          Onde a infraestrutura de nuvem roda fisicamente? Três opções:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Onde roda', 'Uso típico']}
          rows={[
            ['Pública (Cloud)', 'Data centers da AWS, Azure, GCP', 'Startups, web apps modernas, analytics'],
            ['Privada (On-premises)', 'Data center da própria empresa', 'Bancos legados, órgãos militares, compliance estrito'],
            ['Híbrida', 'Combinação on-prem + pública', 'Migração gradual, compliance parcial, burst para cloud'],
          ]}
        />
        <p>
          A AWS oferece serviços específicos para cada modelo híbrido:
        </p>
        <ul className="flex flex-col gap-2 text-xs pl-4">
          <li>• <InlineCode>AWS Outposts</InlineCode> — racks AWS dentro do seu data center</li>
          <li>• <InlineCode>AWS Direct Connect</InlineCode> — link dedicado (fibra) entre on-prem e VPC</li>
          <li>• <InlineCode>AWS Storage Gateway</InlineCode> — cache local com replicação para S3</li>
          <li>• <InlineCode>AWS Snow Family</InlineCode> (Snowcone/Snowball/Snowmobile) — migração física de petabytes</li>
          <li>• <InlineCode>VMware Cloud on AWS</InlineCode> — estende clusters VMware para a nuvem</li>
        </ul>
      </Section>

      <Section title="Cenários reais: qual modelo escolher" accent={ACCENT}>
        <DecisionBox
          scenario="Startup fintech precisa lançar MVP em 3 semanas"
          winner="Cloud pública pura (AWS)"
          winnerColor={ACCENT}
          why="Velocidade > tudo. Sem CapEx, provisiona em minutos, ajusta capacidade no voo, paga só pelo que usa. CapEx zero preserva runway."
          alternatives={[
            { name: 'Cloud híbrida', note: 'Exagero para MVP; burocracia sem benefício' },
          ]}
        />
        <DecisionBox
          scenario="Banco com sistema mainframe COBOL que roda há 30 anos"
          winner="Cloud híbrida"
          winnerColor={ACCENT}
          why="Migrar mainframe puro é arriscado e caro. Mantém-se o core on-prem via Direct Connect e move-se o que faz sentido (analytics, web front, mobile backend) para AWS."
          alternatives={[
            { name: 'On-prem', note: 'Fica para trás em inovação e custo' },
            { name: 'Cloud pura', note: 'Big-bang migration é risco desnecessário' },
          ]}
        />
        <DecisionBox
          scenario="Órgão militar com dados classificados de defesa nacional"
          winner="Cloud privada (ou AWS GovCloud)"
          winnerColor={ACCENT}
          why="Regulação pode exigir que os dados não deixem território soberano com garantias específicas. AWS GovCloud é uma região isolada da AWS para esse fim."
        />
      </Section>

      <Section title="Exemplos práticos: o que cada modelo parece" accent={ACCENT}>
        <CodeBlock lang="exemplo — IaaS (EC2)">{`# Você recebe: servidor virtual vazio
# Você instala: Ubuntu, Nginx, sua app, patches, firewall
aws ec2 run-instances \\
  --image-id ami-0c55b159cbfafe1f0 \\
  --instance-type t3.micro \\
  --key-name minha-chave`}</CodeBlock>
        <CodeBlock lang="exemplo — PaaS (Elastic Beanstalk)">{`# Você entrega: código da aplicação
# AWS gerencia: SO, runtime, load balancer, auto-scaling, patches
eb init -p python-3.11 minha-app
eb create meu-ambiente
eb deploy`}</CodeBlock>
        <CodeBlock lang="exemplo — SaaS (Chime)">{`# Você só usa. Não há provisionamento.
# Abre o navegador em https://app.chime.aws → login → reunião.`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Armadilha frequente:</strong> "DynamoDB é IaaS?" — Não. DynamoDB é totalmente gerenciado (você não gerencia SO, storage, réplicas). Tecnicamente é considerado <strong>PaaS</strong> ou "managed service". O exame pode chamar de "managed database service" — fique atento à terminologia.
      </Callout>

      <Section title="Perguntas típicas do exame (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual característica descreve a elasticidade da nuvem?"
          a={<>A capacidade de provisionar e liberar recursos automaticamente conforme a demanda, para cima e para baixo. Diferente de <em>scalability</em> (capacidade de crescer), elasticidade enfatiza o <strong>ajuste dinâmico</strong> — inclui reduzir recursos quando a demanda cai.</>}
        />
        <QAItem
          q="Um cliente quer reduzir o custo de TI mantendo controle total sobre o hardware. Qual modelo?"
          a={<>Cloud privada on-premises. Ele mantém controle total, mas continua com CapEx alto. Se ele também quer reduzir CapEx, considere cloud híbrida.</>}
        />
        <QAItem
          q="Qual serviço AWS representa o benefício 'go global in minutes'?"
          a={<>Qualquer serviço com distribuição global: <InlineCode>CloudFront</InlineCode> (CDN), <InlineCode>Route 53</InlineCode> (DNS global), ou simplesmente lançar uma aplicação em múltiplas Regiões. O ponto é que isso leva minutos, não meses.</>}
        />
        <QAItem
          q="Diferença entre 'scalability' e 'elasticity' para o exame?"
          a={<>Scalability = capacidade de crescer (pode ser manual). Elasticity = ajuste automático e bidirecional (cresce e encolhe). O CLF-C02 cobra essa distinção em múltiplas questões.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Cloud é um modelo econômico (OpEx &gt; CapEx) + operacional (elástico, sob demanda, medido). IaaS/PaaS/SaaS diferem pelo nível de gerenciamento do cliente. Deployment pode ser público, privado ou híbrido. A AWS defende 6 benefícios oficiais — decore-os literalmente. Esse é o alicerce dos outros 3 domínios.
      </Callout>
    </div>
  );
}

function BenefitCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="p-3 rounded-lg flex gap-3" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
      <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${ACCENT}18`, color: ACCENT }}>
        {num}
      </span>
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{title}</p>
        <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{desc}</p>
      </div>
    </div>
  );
}
