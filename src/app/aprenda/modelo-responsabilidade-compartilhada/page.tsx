import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, LayerStack, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Modelo de Responsabilidade Compartilhada — FFV Academy',
  description: 'Security "of" the cloud vs. security "in" the cloud. A linha divisória entre AWS e cliente — o que cada lado faz e por que isso cai em toda prova de certificação AWS.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Um cliente da AWS configurou incorretamente um Security Group permitindo acesso SSH de 0.0.0.0/0, resultando em invasão. Quem é responsável?',
    options: [
      'AWS — a configuração de rede é responsabilidade da AWS',
      'AWS — security groups são serviços gerenciados',
      'O cliente — configuração de Security Groups, IAM e dados é "security in the cloud"',
      'Responsabilidade compartilhada — metade AWS, metade cliente',
    ],
    correct: 2,
    explanation: 'No modelo de responsabilidade compartilhada, configurar redes, IAM, Security Groups, criptografia de dados e patching do SO é responsabilidade do CLIENTE (security IN the cloud). A AWS cuida do hardware, hipervisor, instalações físicas (security OF the cloud).',
  },
  {
    question: 'Em um banco de dados RDS gerenciado, quem aplica patches de segurança no sistema operacional subjacente?',
    options: [
      'O cliente, via SSH na instância',
      'A AWS, automaticamente durante a janela de manutenção',
      'Um terceiro vendor',
      'Ninguém — RDS não precisa de patches',
    ],
    correct: 1,
    explanation: 'RDS é um serviço gerenciado. A AWS cuida do SO, patching, backups automatizados e replicação. O cliente é responsável apenas pela configuração do DB, schema, queries e dados. Já em EC2 (não-gerenciado), o patching do SO é do cliente.',
  },
  {
    question: 'Qual dos itens abaixo é SEMPRE responsabilidade do cliente na AWS, independentemente do serviço usado?',
    options: [
      'Manutenção física dos data centers',
      'Configuração do hipervisor',
      'Gestão de identidades e permissões (IAM) dos próprios usuários',
      'Substituição de hardware defeituoso',
    ],
    correct: 2,
    explanation: 'IAM — quem tem acesso, a quê, com que permissões — é SEMPRE responsabilidade do cliente. A AWS não sabe quem são seus funcionários nem que permissões cada um deve ter. Essa é a parte de "customer data and identity" do modelo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="modelo-responsabilidade-compartilhada"
      title="Modelo de Responsabilidade Compartilhada"
      icon="🤝"
      xp={35}
      readTime={7}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="iam-fundamentos"
      nextTitle="IAM: Identidade, Grupos, Roles e Policies"
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
        Em cloud computing, nada é mais mal interpretado do que "quem é responsável pela segurança". A resposta: <strong>é compartilhada</strong> — e a linha divisória depende do serviço. A AWS chama essa linha de <em>Shared Responsibility Model</em>, e você precisa entendê-la de forma cirúrgica: o exame CLF-C02 dedica <strong>30% das questões</strong> ao domínio de segurança, e quase todas começam perguntando "quem é responsável por isso?".
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 2 — Security and Compliance" weight="30%" color={ACCENT} />
        <p>
          Este é o domínio de maior peso do CLF-C02 e o modelo de responsabilidade compartilhada é o primeiro tópico. Esperam-se questões de cenário: "X aconteceu, quem é responsável?". A regra mental é simples — mas aplicá-la em cada serviço exige saber o quão "gerenciado" ele é.
        </p>
      </Section>

      <Section title="A grande divisão: of vs. in" accent={ACCENT}>
        <LayerStack
          title="Shared Responsibility Model"
          accent={ACCENT}
          separatorLabel="Linha divisória"
          layers={[
            { label: 'CLIENTE', content: 'Dados do cliente', note: 'security IN the cloud', tone: 'writable' },
            { label: 'CLIENTE', content: 'Plataforma · Aplicações · IAM', tone: 'writable' },
            { label: 'CLIENTE', content: 'Config de SO · Rede · Firewall · Security Groups', tone: 'writable' },
            { label: 'CLIENTE', content: 'Criptografia client-side + integridade dos dados', tone: 'writable' },
            { label: 'CLIENTE', content: 'Criptografia server-side (cliente habilita/configura)', tone: 'writable' },
            { label: 'CLIENTE', content: 'Tráfego de rede (proteção, firewall de app)', tone: 'writable', separatorAfter: true },
            { label: 'AWS', content: 'Software: compute · storage · database · networking', note: 'security OF the cloud', tone: 'base' },
            { label: 'AWS', content: 'Hardware · Global Infrastructure (servidores, discos, racks)', tone: 'base' },
            { label: 'AWS', content: 'Regiões · AZs · Edge Locations · Physical Security', tone: 'base' },
          ]}
        />
        <p>
          A mnemônica do exame: <strong>AWS protege a cloud; você protege o que está DENTRO da cloud</strong>.
        </p>
      </Section>

      <Section title="O que a AWS SEMPRE faz" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Segurança física dos data centers (24/7, controle de acesso, câmeras, guardas)</li>
          <li>• Manutenção do hardware (troca de discos, servidores, racks)</li>
          <li>• Manutenção do hipervisor (virtualização)</li>
          <li>• Segurança da rede global da AWS (backbone, DDoS Shield Standard gratuito)</li>
          <li>• Patching e atualização de serviços gerenciados (RDS, Lambda, DynamoDB, S3)</li>
          <li>• Descomissionamento seguro de mídia (discos destruídos ao falhar)</li>
          <li>• Compliance das instalações (SOC 1/2/3, ISO 27001, PCI-DSS Level 1, HIPAA-eligible)</li>
        </ul>
      </Section>

      <Section title="O que VOCÊ (cliente) SEMPRE faz" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Gerenciar contas, usuários, grupos e permissões (<InlineCode>IAM</InlineCode>)</li>
          <li>• Classificar seus dados e definir quem pode acessar</li>
          <li>• Configurar <InlineCode>Security Groups</InlineCode> e NACLs</li>
          <li>• Habilitar criptografia em repouso e em trânsito (AWS fornece ferramentas, mas você ativa)</li>
          <li>• Configurar e rotacionar credenciais</li>
          <li>• Monitorar atividade (CloudTrail, GuardDuty) e responder a alertas</li>
          <li>• Garantir compliance das suas aplicações com leis (LGPD, GDPR, HIPAA)</li>
        </ul>
      </Section>

      <Section title="A linha divisória muda conforme o serviço" accent={ACCENT}>
        <p>
          Esse é o ponto mais importante — e o mais cobrado. Quanto mais gerenciado o serviço, mais responsabilidade fica com a AWS:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Exemplo', 'AWS cuida de', 'Você cuida de']}
          rows={[
            ['IaaS', 'EC2', 'Hardware, hipervisor', 'SO, patches, firewall, app, dados'],
            ['Container gerenciado', 'ECS Fargate', 'Hardware, SO, runtime', 'Imagem de container, app, dados, IAM'],
            ['PaaS (managed)', 'RDS, Elastic Beanstalk', 'Hardware, SO, runtime, patches', 'Schema, queries, dados, IAM'],
            ['SaaS', 'Chime, WorkMail', 'Praticamente tudo', 'Apenas como usa + usuários'],
          ]}
        />
        <Callout tone="warn">
          <strong>Padrão do exame:</strong> "Quem aplica patches no SO do RDS?" → <strong>AWS</strong>. "Quem aplica patches no SO de uma EC2?" → <strong>cliente</strong>. Não memorize por cor — raciocine pelo tipo de serviço.
        </Callout>
      </Section>

      <Section title="Exemplos clarinhos — quem faz o quê" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Cenário', 'Responsável']}
          rows={[
            ['Disco físico do servidor falha e precisa ser trocado', 'AWS'],
            ['Vulnerabilidade Log4Shell no código da sua aplicação Java', 'Cliente'],
            ['Senha de admin foi deixada em código-fonte público no GitHub', 'Cliente'],
            ['Hipervisor da EC2 tem CVE crítica (ex: Meltdown)', 'AWS'],
            ['Security Group permite SSH aberto para a internet', 'Cliente'],
            ['Bucket S3 foi tornado público por engano', 'Cliente'],
            ['DDoS de camada 4 na rede global da AWS', 'AWS (Shield Standard)'],
            ['DDoS de camada 7 (HTTP flood) na sua aplicação', 'Cliente (usar Shield Advanced + WAF)'],
            ['Funcionário demitido ainda tem acesso IAM ativo', 'Cliente'],
            ['Dados do cliente precisam ser apagados definitivamente ao encerrar conta', 'AWS garante + cliente solicita'],
          ]}
        />
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Empresa migra app PHP legada para AWS. Quer menor responsabilidade operacional"
          winner="Serverless (Lambda) ou Elastic Beanstalk"
          winnerColor={ACCENT}
          why="Quanto mais gerenciado o serviço, menos responsabilidade do cliente sobre patching, runtime e SO. Lambda é o extremo: você só cuida do código."
          alternatives={[
            { name: 'EC2 + Apache', note: 'Viável, mas exige patching do SO, Apache, PHP e configuração de ALB + Auto Scaling manual' },
          ]}
        />
        <DecisionBox
          scenario="Banco precisa provar que só ele acessa suas chaves de criptografia"
          winner="AWS KMS com custom key material (BYOK) ou AWS CloudHSM"
          winnerColor={ACCENT}
          why="No modelo de responsabilidade compartilhada, o banco é dono das chaves e do acesso. CloudHSM permite controle total (ninguém da AWS tem acesso). KMS com BYOK também é aceito em regimes de compliance exigentes."
        />
        <DecisionBox
          scenario="Startup precisa compliance PCI-DSS para processar cartões"
          winner="Usar herança de compliance da AWS + configurar a camada do cliente"
          winnerColor={ACCENT}
          why="A AWS é PCI-DSS Level 1 para a infra física. Mas o cliente ainda precisa implementar segmentação de rede, criptografia, IAM mínimo, auditoria (CloudTrail) e revisão de código. Compliance herdada reduz escopo, mas não elimina."
        />
      </Section>

      <Callout tone="danger">
        <strong>Erro comum fatal:</strong> confundir "AWS é segura" com "minha aplicação na AWS é segura". A AWS pode ser perfeitamente segura e ainda assim você sofrer um vazamento porque configurou S3 como público. O cliente é responsável por 100% das decisões de configuração que afetam seus dados.
      </Callout>

      <Section title="Perguntas típicas de exame (Q&A)" accent={ACCENT}>
        <QAItem
          q="Quem é responsável por criar, manter e rotacionar as credenciais IAM?"
          a={<>Sempre o cliente. A AWS só fornece o serviço IAM — decidir quem tem acesso e quando rotacionar é responsabilidade do cliente. Boas práticas: rotacionar a cada 90 dias, usar roles em vez de access keys, habilitar MFA.</>}
        />
        <QAItem
          q="Em Lambda (serverless), quem cuida do patching do sistema operacional?"
          a={<>A AWS. Lambda é totalmente gerenciada — você só entrega o código. Tudo abaixo disso (runtime, SO, hardware) é responsabilidade da AWS.</>}
        />
        <QAItem
          q="Em EC2, quem instala o antivírus se a empresa exige?"
          a={<>O cliente. EC2 é IaaS — tudo acima do hipervisor é problema do cliente, incluindo antivírus, EDR, hardening do SO.</>}
        />
        <QAItem
          q="Quem é responsável se um funcionário compartilhar uma access key no Slack e houver uso indevido?"
          a={<>O cliente. Treinamento, política de uso, rotação de credenciais e monitoramento (GuardDuty, CloudTrail) são todos responsabilidade da empresa cliente.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> AWS protege a nuvem (hardware, hipervisor, DCs físicos, serviços gerenciados). Você protege o que está dentro (IAM, dados, configurações, código). A linha muda conforme o serviço — mais gerenciado = mais responsabilidade da AWS. Dados e identidades são SEMPRE do cliente. Compliance é herdada em parte, mas nunca 100% garantida só pela AWS.
      </Callout>
    </div>
  );
}
