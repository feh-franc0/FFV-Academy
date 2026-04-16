import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, MindMap, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'AWS CAF e os 7 Rs da Migração — FFV Academy',
  description: 'AWS Cloud Adoption Framework (CAF), as 6 perspectivas e as 7 estratégias de migração (Rehost, Replatform, Refactor, Retire, Retain, Relocate, Repurchase).',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma empresa quer migrar rapidamente para AWS com mínimo de mudança no código, apenas mudando servidores físicos por EC2. Qual estratégia dos 7 Rs?',
    options: [
      'Rehost (lift-and-shift)',
      'Replatform',
      'Refactor',
      'Retire',
    ],
    correct: 0,
    explanation: 'Rehost (lift-and-shift) copia o workload on-premises para AWS com o mínimo de mudanças. Usa serviços como AWS Application Migration Service (MGN). É a estratégia mais rápida mas deixa para depois a modernização.',
  },
  {
    question: 'Em qual perspectiva do AWS CAF estão capacidades como "risk management", "security governance" e "compliance"?',
    options: [
      'Business',
      'People',
      'Governance',
      'Security',
    ],
    correct: 3,
    explanation: 'A perspectiva Security do CAF agrupa capacidades de segurança: identity and access, threat detection, vulnerability management, application security, incident response. Governance é outra perspectiva, focada em organizational planning.',
  },
  {
    question: 'Qual estratégia dos 7 Rs significa "migrar de um banco Oracle on-prem para Aurora PostgreSQL (mudança de engine)"?',
    options: [
      'Rehost',
      'Replatform',
      'Refactor',
      'Repurchase',
    ],
    correct: 1,
    explanation: 'Replatform ("lift-tinker-and-shift") mantém a arquitetura da aplicação, mas altera componentes para serviços gerenciados AWS (ex: trocar Oracle por Aurora). Benefícios imediatos sem reescrever toda a app. Refactor seria reescrever a arquitetura.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cloud-adoption-framework"
      title="Cloud Adoption Framework e os 7 Rs da Migração"
      icon="🗺️"
      xp={45}
      readTime={9}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="precificacao-suporte"
      nextTitle="Precificação, Free Tier e Planos de Suporte"
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
        Migrar para a nuvem é mais que copiar servidores — envolve pessoas, processos e tecnologia. O <strong>AWS Cloud Adoption Framework (CAF)</strong> estrutura essa jornada em 6 perspectivas, e as <strong>7 estratégias de migração (7 Rs)</strong> definem <em>como</em> cada workload deve ser tratada. O CLF-C02 cobra ambos em questões de cenário.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 1 — Cloud Concepts" weight="24%" color={ACCENT} />
        <p>
          CAF e 7 Rs aparecem em questões de estratégia. A banca testa se você reconhece: (1) as 6 perspectivas do CAF e seus focos; (2) cada uma das 7 estratégias de migração e quando aplicar. Não exige configurar tools, mas exige identificar o <em>R</em> certo para um cenário descrito.
        </p>
      </Section>

      <Section title="AWS Cloud Adoption Framework (CAF) — 6 perspectivas" accent={ACCENT}>
        <MindMap
          root="AWS CAF — 6 Perspectivas"
          accent={ACCENT}
          branches={[
            { title: '1. Business', items: ['Garantir que investimentos em cloud acelerem outcomes de negócio', 'Capacidades: strategy management, portfolio management, innovation, data monetization'] },
            { title: '2. People', items: ['Cultura, treinamento, liderança, organização', 'Capacidades: culture evolution, transformational leadership, cloud fluency, workforce transformation'] },
            { title: '3. Governance', items: ['Gerenciar, medir e melhorar iniciativas cloud', 'Capacidades: program / project management, risk management, data governance, people analytics'] },
            { title: '4. Platform', items: ['Criar plataforma escalável e provisionada por código', 'Capacidades: platform architecture, data architecture, CI/CD, IaC'] },
            { title: '5. Security', items: ['Proteger confidencialidade, integridade e disponibilidade', 'Capacidades: identity & access, threat detection, vulnerability, compliance, incident response'] },
            { title: '6. Operations', items: ['Entregar serviços cloud alinhados com expectativas do negócio', 'Capacidades: observability, event management, incident & problem, change & release'] },
          ]}
        />
        <Callout tone="info">
          <strong>Mnemônica:</strong> <em>"Business People Govern Platforms with Security and Operations"</em>. Perspectives = áreas organizacionais impactadas pela adoção.
        </Callout>
      </Section>

      <Section title="AWS Migration Evaluator (antes TSO Logic)" accent={ACCENT}>
        <p>
          Ferramenta gratuita da AWS que analisa a infra on-prem (via um coletor rodando no ambiente) e gera um business case de migração: TCO atual vs AWS, recomendação de instâncias, ROI. Usada nas fases iniciais da jornada descrita pelo CAF.
        </p>
      </Section>

      <Section title="AWS Migration Hub" accent={ACCENT}>
        <p>
          Hub central que rastreia o progresso de migração de workloads por múltiplas ferramentas AWS e parceiras. Integra com:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>AWS Application Migration Service (MGN)</InlineCode> — replica servidores para AWS (lift-and-shift)</li>
          <li>• <InlineCode>AWS Database Migration Service (DMS)</InlineCode> — migra bancos homogêneos e heterogêneos</li>
          <li>• <InlineCode>AWS Schema Conversion Tool (SCT)</InlineCode> — converte schemas e stored procedures</li>
          <li>• <InlineCode>AWS DataSync</InlineCode> — migra dados em larga escala via rede</li>
          <li>• <InlineCode>AWS Snow Family</InlineCode> — migração física offline</li>
        </ul>
      </Section>

      <Section title="As 7 estratégias de migração (7 Rs)" accent={ACCENT}>
        <p>
          Também conhecidas como as "7 Rs da migração". Originalmente eram 5 (Gartner), depois 6, agora 7. Decore cada uma:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'Descrição', 'Exemplo']}
          rows={[
            ['1. Rehost ("lift-and-shift")', 'Mover sem mudanças. Rápido, barato inicialmente.', 'VM VMware on-prem → EC2 equivalente via MGN'],
            ['2. Replatform ("lift-tinker-and-shift")', 'Pequenas otimizações para aproveitar AWS.', 'Trocar MySQL on-prem por Aurora MySQL (mesma interface)'],
            ['3. Refactor / Re-architect', 'Reescrever a aplicação para cloud-native.', 'Monólito → microservices em ECS + Lambda + DynamoDB'],
            ['4. Repurchase ("drop-and-shop")', 'Abandonar e adotar produto SaaS.', 'Sair do Siebel CRM on-prem para Salesforce'],
            ['5. Retire', 'Descomissionar. A app não é mais necessária.', 'App interno usado por 3 pessoas que já usam outra ferramenta'],
            ['6. Retain ("revisit later")', 'Manter on-prem por enquanto (mainframe, compliance).', 'Sistema COBOL crítico ainda não migrado'],
            ['7. Relocate', 'Mover sem mudanças para VMware Cloud on AWS.', 'Cluster VMware → VMware Cloud on AWS (mesmo hypervisor)'],
          ]}
        />
      </Section>

      <Section title="Árvore de decisão — qual R escolher" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pergunta', 'Se sim → estratégia']}
          rows={[
            ['A aplicação ainda é usada?', 'Não → Retire'],
            ['Existe SaaS equivalente que atende?', 'Sim → Repurchase'],
            ['Precisa ficar on-prem por compliance/técnico?', 'Sim → Retain'],
            ['Usa VMware e quer menor atrito possível?', 'Sim → Relocate'],
            ['Quer modernizar para cloud-native?', 'Sim → Refactor'],
            ['Quer ganhos rápidos sem reescrever?', 'Sim → Replatform'],
            ['Quer o caminho mais rápido possível?', 'Sim → Rehost'],
          ]}
        />
      </Section>

      <Section title="Trade-offs entre estratégias" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'Velocidade', 'Esforço', 'Benefícios cloud-native']}
          rows={[
            ['Rehost', '⚡⚡⚡ Rápido', '🟢 Baixo', '🔴 Mínimo'],
            ['Replatform', '⚡⚡ Médio', '🟡 Médio', '🟡 Médio'],
            ['Refactor', '🐢 Lento', '🔴 Alto', '🟢 Máximo'],
            ['Repurchase', '⚡⚡ Médio', '🟡 Médio', '🟢 Alto (SaaS já é cloud-native)'],
            ['Retire', '⚡⚡⚡ Imediato', '🟢 Mínimo', 'N/A'],
            ['Retain', '🟢 N/A', '🟢 N/A', '🔴 Zero'],
            ['Relocate', '⚡⚡⚡ Rápido', '🟢 Baixo', '🔴 Baixo'],
          ]}
        />
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="ERP monolítico Oracle on-prem, a empresa precisa migrar em 4 meses por fim do contrato do DC"
          winner="Rehost (MGN) + backlog de Replatform"
          winnerColor={ACCENT}
          why="Tempo é crítico — Rehost via MGN replica servidores para EC2 em semanas. Após migração, modernize incrementalmente (Oracle → Aurora, batch → Lambda)."
        />
        <DecisionBox
          scenario="App legada Windows .NET Framework 4.5 que está virando problema"
          winner="Refactor gradual — Strangler Pattern"
          winnerColor={ACCENT}
          why="Reescreva pedaços em .NET moderno (ou outra stack) atrás de um API Gateway, desativando funcionalidades legacy progressivamente. Reduz risco vs big-bang."
        />
        <DecisionBox
          scenario="Sistema de RH on-prem com licenças ExpensePaolo a vencer"
          winner="Repurchase — adotar Workday ou similar"
          winnerColor={ACCENT}
          why="Por que rodar HRIS próprio quando existe SaaS maduro? Elimina manutenção, updates, backup, DR. Custo previsível por usuário."
        />
        <DecisionBox
          scenario="Cluster VMware de 300 VMs — empresa quer mover rapidamente sem mudanças"
          winner="Relocate para VMware Cloud on AWS"
          winnerColor={ACCENT}
          why="Mesmo vCenter, mesmos tools, mesmas VMs. Migração em horas via vMotion. Ideal para sair do DC físico sem refactor. Posteriormente, Rehost/Replatform individualmente."
        />
      </Section>

      <Section title="Six advantages of cloud — revisão" accent={ACCENT}>
        <p>
          Ao planejar migração, a AWS reforça os 6 benefícios (já vistos em "O que é Cloud Computing") como driver de ROI:
        </p>
        <ol className="flex flex-col gap-1 text-xs pl-6 list-decimal">
          <li>Trade CapEx for variable expense</li>
          <li>Benefit from massive economies of scale</li>
          <li>Stop guessing capacity</li>
          <li>Increase speed and agility</li>
          <li>Stop spending money running data centers</li>
          <li>Go global in minutes</li>
        </ol>
      </Section>

      <Callout tone="warn">
        <strong>Pegadinha clássica:</strong> "Rehost" é o mesmo que "Lift-and-shift". "Replatform" é "Lift-tinker-and-shift". "Refactor" é "Re-architect". Questões podem usar qualquer variante dos nomes.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual ferramenta AWS ajuda a construir um business case para migração?"
          a={<><strong>AWS Migration Evaluator</strong> (antes chamado TSO Logic). Analisa a infra on-prem e gera TCO comparado à AWS.</>}
        />
        <QAItem
          q="Diferença entre Refactor e Replatform?"
          a={<>Refactor = reescrever a arquitetura (monólito → microservices). Replatform = pequenos ajustes para aproveitar AWS (trocar Oracle por Aurora, mas manter estrutura do app).</>}
        />
        <QAItem
          q="Qual perspectiva do CAF trata de 'treinamento e cultura'?"
          a={<>People. Aborda cloud fluency, transformational leadership, workforce transformation, organizational design.</>}
        />
        <QAItem
          q="Uma empresa VMware quer migrar rapidamente mantendo todo o ambiente VMware. Estratégia?"
          a={<>Relocate — usa VMware Cloud on AWS para mover sem mudanças no hypervisor, mantendo vCenter/vSphere.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> CAF = 6 perspectivas (Business, People, Governance, Platform, Security, Operations) — roteiro organizacional. 7 Rs = 7 estratégias (Rehost, Replatform, Refactor, Repurchase, Retire, Retain, Relocate) — decisão por workload. Rehost = mais rápido, menos benefícios. Refactor = mais lento, mais benefícios cloud-native. Migration Evaluator = TCO; Migration Hub = orchestration; MGN = replicação server-level; DMS = bancos.
      </Callout>
    </div>
  );
}
