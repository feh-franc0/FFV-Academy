import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, MindMap, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'SAA-C03: Da Teoria à Arquitetura Real — FFV Academy',
  description: 'Introdução ao AWS Solutions Architect Associate (SAA-C03): os 4 domínios do exame, diferenças do Practitioner e mentalidade de arquiteto.',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o maior peso entre os 4 domínios do SAA-C03?',
    options: [
      'Design Secure Architectures',
      'Design Resilient Architectures',
      'Design High-Performing Architectures',
      'Design Cost-Optimized Architectures',
    ],
    correct: 0,
    explanation: 'O SAA-C03 tem 4 domínios: Secure (30%), Resilient (26%), High-Performing (24%), Cost-Optimized (20%). "Design Secure Architectures" lidera — dobre estudo em IAM, KMS, WAF, VPC e redes.',
  },
  {
    question: 'Qual é a principal diferença de mindset entre o Cloud Practitioner (CLF-C02) e o SAA-C03?',
    options: [
      'SAA exige escrever código em Python e Java',
      'SAA exige escolher a MELHOR arquitetura entre várias válidas, sob restrições',
      'SAA não cobra mais IAM',
      'SAA testa apenas serviços novos lançados no último ano',
    ],
    correct: 1,
    explanation: 'Practitioner testa "o que é cada serviço". SAA testa "qual combinação de serviços resolve MELHOR este cenário — sob custo X, SLA Y, e latência Z". Trade-offs e decisões arquiteturais, não memorização.',
  },
  {
    question: 'Quantas questões tem o exame SAA-C03 e qual o score mínimo de aprovação?',
    options: [
      '50 questões / 70%',
      '65 questões / 72% (720/1000)',
      '75 questões / 80%',
      '100 questões / 65%',
    ],
    correct: 1,
    explanation: 'SAA-C03 tem 65 questões (15 "unscored" para pesquisa — você não sabe quais), 130 minutos, score mínimo 720/1000 (~72%). Custo $150 USD. Cloud Practitioner é $100 e 65 questões / 700.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="saa-c03-intro"
      title="SAA-C03: Da Teoria à Arquitetura Real"
      icon="🎓"
      xp={40}
      readTime={8}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="iam-avancado-organizations"
      nextTitle="IAM Avançado: Policies JSON, STS e Organizations"
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
        Se o Cloud Practitioner (CLF-C02) prova que você <em>entende</em> a AWS, o <strong>Solutions Architect Associate (SAA-C03)</strong> prova que você sabe <em>projetar</em> soluções reais nela. Este módulo introduz a mentalidade, os 4 domínios oficiais, a estrutura do exame e o plano de estudo da Trilha 5.
      </p>

      <Section title="Sobre o SAA-C03" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Item', 'Detalhe']}
          rows={[
            ['Código oficial', 'SAA-C03 (em vigor desde agosto/2022)'],
            ['Questões', '65 (15 unscored, não contam)'],
            ['Duração', '130 minutos (cerca de 2 min por questão)'],
            ['Formato', 'Múltipla escolha + múltipla resposta'],
            ['Score mínimo', '720 / 1000 (~72% de acerto)'],
            ['Custo', 'US$ 150 (voucher, reembolsável em programas AWS)'],
            ['Idiomas', 'Inglês, japonês, coreano, chinês simplificado (PT-BR recebe +30 min)'],
            ['Validade', '3 anos'],
            ['Formatos de prova', 'Pearson VUE (test center ou online com proctor)'],
          ]}
        />
      </Section>

      <Section title="Os 4 domínios oficiais do SAA-C03" accent={ACCENT}>
        <ExamDomainBadge domain="SAA-C03 Blueprint" weight="100%" color={ACCENT} />
        <MindMap
          root="SAA-C03 — 4 domínios"
          accent={ACCENT}
          branches={[
            { title: '1. Design Secure Architectures — 30%', items: [
              'IAM avançado: policies JSON, STS, cross-account, Organizations/SCPs',
              'Criptografia: KMS (envelope, CMK), Secrets Manager, ACM, CloudHSM',
              'Redes seguras: VPC, SG, NACL, PrivateLink, WAF, Shield',
              'Detecção: GuardDuty, Security Hub, Inspector, Macie',
              'Compliance: Config Rules, Control Tower, Artifact',
            ] },
            { title: '2. Design Resilient Architectures — 26%', items: [
              'Multi-AZ vs Multi-Region strategies',
              'Auto Scaling Groups, ELB (ALB/NLB), Route 53 failover',
              'Backup/Restore, Pilot Light, Warm Standby, Multi-Site',
              'Desacoplamento: SQS, SNS, EventBridge',
              'RDS Multi-AZ, Read Replicas, Aurora Global',
            ] },
            { title: '3. Design High-Performing Architectures — 24%', items: [
              'Escolha certa de compute (EC2 family, Lambda, Fargate)',
              'Storage adequado (EBS tipos, EFS modes, FSx, S3)',
              'Caching: CloudFront, ElastiCache, DAX',
              'Escolha de banco: RDS, DynamoDB, Redshift, Aurora',
              'Optimized networking: Global Accelerator, Direct Connect',
            ] },
            { title: '4. Design Cost-Optimized Architectures — 20%', items: [
              'Pricing models: On-Demand, Spot, Reserved, Savings Plans',
              'Storage lifecycle (S3 Intelligent-Tiering, Glacier)',
              'Compute right-sizing, Compute Optimizer',
              'Serverless quando faz sentido (pay-per-use)',
              'Cost allocation tags, Budgets, Trusted Advisor',
            ] },
          ]}
        />
      </Section>

      <Section title="Practitioner vs Associate — o salto" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'CLF-C02 Practitioner', 'SAA-C03 Associate']}
          rows={[
            ['Pergunta típica', '"O que é X?"', '"Qual combinação de X+Y resolve MELHOR Z sob restrição W?"'],
            ['Profundidade', 'Superficial (conceitos)', 'Profunda (configuração + trade-offs)'],
            ['Serviços cobrados', '~50 serviços', '~100+ serviços'],
            ['Exemplo de questão', '"Qual serviço hospeda websites estáticos?"', '"Como servir globalmente site estático com TLS + DDoS + cache + baixo custo?"'],
            ['Tempo/questão', '~1,4 min', '~2 min'],
            ['Foco central', 'Vocabulário e billing', 'Arquitetura e decisões de design'],
          ]}
        />
        <Callout tone="info">
          A questão clássica do SAA-C03 tem formato: &ldquo;<em>A company needs X. Which solution MOST cost-effectively/resiliently/securely achieves this?</em>&rdquo;. Duas das 4 opções são tecnicamente corretas; a certa é a <strong>melhor sob o critério pedido</strong>.
        </Callout>
      </Section>

      <Section title="A mentalidade do arquiteto AWS" accent={ACCENT}>
        <p>Uma questão do SAA não testa <em>se você conhece o serviço</em> — testa <em>se você sabe quando usá-lo</em>. Três eixos de decisão que aparecem sempre:</p>
        <MindMap
          root="3 eixos de decisão arquitetural"
          accent={ACCENT}
          branches={[
            { title: 'Eixo 1 — Custo vs Performance vs Resiliência', items: [
              'Single-AZ é barato mas vulnerável; Multi-AZ dobra custo e elimina single-point-of-failure',
              'Provisioned IOPS (io2) > gp3 em latência crítica, mas 10x o custo',
              'DynamoDB on-demand > provisioned em cargas irregulares; provisioned ganha em cargas estáveis',
            ] },
            { title: 'Eixo 2 — Managed vs Self-Managed', items: [
              'Aurora gerencia failover; EC2+MySQL exige você orquestrar',
              'Fargate evita gerenciar EC2 do cluster; EC2 launch type dá mais controle + mais trabalho',
              'Managed reduz operational burden — quase sempre a resposta correta em SAA-C03',
            ] },
            { title: 'Eixo 3 — Acoplamento vs Orquestração', items: [
              'SQS desacopla produtor e consumidor (buffer, retry); SNS faz fanout',
              'EventBridge > SNS quando precisa filtrar por schema ou rotear por atributos',
              'Step Functions quando o fluxo tem estados e decisões complexas',
            ] },
          ]}
        />
      </Section>

      <Section title="Serviços que aparecem quase em toda questão" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Categoria', 'Serviços core']}
          rows={[
            ['Identity', 'IAM, STS, Organizations, Identity Center'],
            ['Compute', 'EC2, Auto Scaling, Lambda, ECS, EKS, Fargate'],
            ['Storage', 'S3, EBS, EFS, FSx, Storage Gateway'],
            ['Database', 'RDS, Aurora, DynamoDB, ElastiCache, Redshift'],
            ['Network', 'VPC, Route 53, CloudFront, API Gateway, ELB, PrivateLink, Transit Gateway'],
            ['Security', 'KMS, Secrets Manager, WAF, Shield, GuardDuty, Macie, Inspector'],
            ['Integration', 'SQS, SNS, EventBridge, Step Functions, Kinesis'],
            ['Observability', 'CloudWatch, CloudTrail, Config, X-Ray'],
            ['DR / Backup', 'AWS Backup, Cross-Region Replication, Route 53 failover'],
          ]}
        />
      </Section>

      <Section title="Plano de estudo — Trilha 5 em 4 semanas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Semana', 'Foco', 'Módulos']}
          rows={[
            ['1 — Identidade e Rede', 'Base de segurança e VPC', 'iam-avancado-organizations · vpc-avancado · dns-cdn-edge'],
            ['2 — Compute e Storage', 'Escalabilidade e dados', 'ec2-autoscaling-elb · containers-ecs-eks · serverless-lambda-avancado · s3-avancado · block-file-storage'],
            ['3 — Dados, Cache e Mensageria', 'Bancos + performance + desacoplamento', 'rds-aurora-dynamodb · caching-performance · messaging-eventos'],
            ['4 — Segurança, DR, Custo, Analytics', 'Fechar os domínios e simulado', 'seguranca-avancada · disaster-recovery · cost-optimization-saa · analytics-bigdata · simulado-saa-c03'],
          ]}
        />
      </Section>

      <Callout tone="warn">
        <strong>Pré-requisito honesto:</strong> O SAA-C03 não <em>exige</em> o Practitioner, mas assume que você domina: IAM básico, Regions/AZs, serviços core (EC2, S3, RDS) e o modelo de responsabilidade compartilhada. Se algum desses pontos te faz hesitar, revise a Trilha 4 antes.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Vale mais a pena tirar SAA-C03 ou Developer Associate (DVA-C02)?"
          a={<>Para arquitetos de solução, plataforma, SRE: SAA. Para devs que querem aprofundar em Lambda, DynamoDB, Step Functions, ECS, CI/CD: DVA. SAA é MAIS amplo; DVA é mais profundo em build/deploy. SAA é o Associate mais popular e o melhor "segundo passo" depois do Practitioner.</>}
        />
        <QAItem
          q="Quantas horas de estudo para passar?"
          a={<>Para quem já tem o Practitioner: 40–80h distribuídas em 4–8 semanas. Para quem vem do zero: 120–150h. A Trilha 5 foi dimensionada em ~240 min (4h) de leitura pura — mas para DOMINAR, conte com prática em laboratório (AWS Skill Builder) + questões de simulado.</>}
        />
        <QAItem
          q="Preciso configurar coisas no console da AWS durante os estudos?"
          a={<>Recomenda-se FORTEMENTE. Teoria sem prática trava em questões de cenário. Use uma conta AWS com Free Tier: crie uma VPC do zero, suba uma EC2 atrás de ALB com Auto Scaling, configure Route 53 failover, crie um Lambda com DynamoDB. A memória muscular ajuda a eliminar opções absurdas na prova.</>}
        />
        <QAItem
          q="O SAA-C03 tem labs práticos como outras provas?"
          a={<>Não. SAA-C03 é 100% múltipla escolha (single + multi-select). AWS Certified Solutions Architect Professional (SAP-C02) também é só MCQ. Labs aparecem em certificações novas como SysOps (SOA-C02) que tem seção prática.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> SAA-C03 = 65 questões, 130 min, 720/1000. 4 domínios com pesos (Secure 30% · Resilient 26% · High-Perf 24% · Cost 20%). Foco em <strong>arquitetura e trade-offs</strong>, não memorização. Managed services quase sempre vencem em "menor esforço operacional". Plano de 4 semanas + prática hands-on em Free Tier = receita testada. Próximo módulo: IAM avançado — a fundação de 30% do exame.
      </Callout>
    </div>
  );
}
