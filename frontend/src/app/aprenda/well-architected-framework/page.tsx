import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, MindMap, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('well-architected-framework');

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quantos pilares tem o AWS Well-Architected Framework hoje?',
    options: [
      '4 pilares',
      '5 pilares',
      '6 pilares',
      '7 pilares',
    ],
    correct: 2,
    explanation: 'Desde dezembro de 2021, o Well-Architected Framework tem 6 pilares: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization e Sustainability (este último adicionado em 2021).',
  },
  {
    question: 'Uma empresa quer reduzir o impacto ambiental de suas workloads AWS. Qual pilar do Well-Architected Framework endereça isso?',
    options: [
      'Operational Excellence',
      'Performance Efficiency',
      'Cost Optimization',
      'Sustainability',
    ],
    correct: 3,
    explanation: 'O pilar Sustainability (adicionado em dez/2021) foca em minimizar o impacto ambiental: escolher Regiões com energia mais limpa, otimizar uso de recursos, usar serviços serverless quando possível, descomissionar recursos ociosos.',
  },
  {
    question: 'Qual princípio do Well-Architected é mais associado ao pilar de Reliability?',
    options: [
      'Criptografar dados em repouso e em trânsito',
      'Testar procedimentos de recuperação automaticamente',
      'Implementar Auto Scaling para picos imprevisíveis',
      'Usar Spot Instances para reduzir custos',
    ],
    correct: 1,
    explanation: 'Testar procedimentos de recuperação é central ao pilar Reliability. Outros princípios: escalar horizontalmente para reduzir blast radius, parar de adivinhar capacidade, automatizar mudanças. Criptografia → Security. Auto Scaling → Performance/Reliability. Spot → Cost.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="well-architected-framework"
      title="Well-Architected: os 6 Pilares"
      icon="🏛️"
      xp={50}
      readTime={10}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="cloud-adoption-framework"
      nextTitle="Cloud Adoption Framework e os 7 Rs da Migração"
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
        O AWS Well-Architected Framework é o guia oficial para desenhar e operar cargas na nuvem. Começou com 4 pilares em 2012, cresceu para 5, e em dezembro/2021 ganhou o sexto — Sustainability. É cobrado no CLF-C02 de forma direta: você precisa conhecer os 6 pilares, saber reconhecer princípios de cada um e usar a <InlineCode>Well-Architected Tool</InlineCode> como recurso de avaliação.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 1 — Cloud Concepts" weight="24%" color={ACCENT} />
        <p>
          O Well-Architected Framework é um dos tópicos mais previsíveis do CLF-C02. Espera-se memorização dos 6 pilares e capacidade de mapear cenários a pilares (ex: "automatizar mudanças" → Operational Excellence; "descomissionar recursos ociosos" → Sustainability).
        </p>
      </Section>

      <Section title="Visão geral — os 6 pilares" accent={ACCENT}>
        <MindMap
          root="AWS Well-Architected Framework"
          accent={ACCENT}
          branches={[
            { title: '1. Operational Excellence', items: ['Executar e monitorar sistemas para entregar valor', 'Melhorar processos continuamente'] },
            { title: '2. Security', items: ['Proteger dados, sistemas e ativos', 'Leverage tecnologias de nuvem para melhorar segurança'] },
            { title: '3. Reliability', items: ['Performar a função pretendida corretamente e consistentemente', 'Recuperar-se automaticamente de falhas'] },
            { title: '4. Performance Efficiency', items: ['Usar recursos computacionais eficientemente', 'Manter eficiência enquanto demanda evolui'] },
            { title: '5. Cost Optimization', items: ['Evitar custos desnecessários', 'Entender e controlar onde o dinheiro é gasto'] },
            { title: '6. Sustainability', items: ['Minimizar o impacto ambiental das cargas', 'Energy efficiency, resource utilization'] },
          ]}
        />
      </Section>

      <Section title="Pilar 1 — Operational Excellence" accent={ACCENT}>
        <p>A capacidade de rodar e monitorar sistemas, melhorar processos e procedimentos continuamente.</p>
        <p><strong>Princípios de design:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Realizar operações como código (IaC, runbooks automatizados)</li>
          <li>• Fazer mudanças frequentes, pequenas e reversíveis</li>
          <li>• Refinar procedimentos de operação frequentemente</li>
          <li>• Antecipar falhas (game days, chaos engineering)</li>
          <li>• Aprender de todos os incidentes e falhas operacionais</li>
        </ul>
        <p><strong>Serviços AWS associados:</strong></p>
        <p className="text-xs">CloudFormation, CDK, Systems Manager, OpsWorks, CloudWatch, X-Ray, AWS Config.</p>
      </Section>

      <Section title="Pilar 2 — Security" accent={ACCENT}>
        <p>Proteção de dados, sistemas e ativos através de práticas defensivas.</p>
        <p><strong>Princípios de design:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Implementar base identity e acesso fortes (IAM, MFA)</li>
          <li>• Habilitar rastreabilidade (CloudTrail, Config)</li>
          <li>• Aplicar segurança em todas as camadas (defense in depth)</li>
          <li>• Automatizar boas práticas de segurança</li>
          <li>• Proteger dados em trânsito e em repouso (TLS, KMS)</li>
          <li>• Manter pessoas longe de dados (automação reduz erro humano)</li>
          <li>• Preparar-se para eventos de segurança (playbooks)</li>
        </ul>
      </Section>

      <Section title="Pilar 3 — Reliability" accent={ACCENT}>
        <p>Capacidade de uma workload cumprir sua função corretamente e consistentemente.</p>
        <p><strong>Princípios de design:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Automaticamente recuperar de falhas (health checks, self-healing)</li>
          <li>• Testar procedimentos de recuperação regularmente</li>
          <li>• Escalar horizontalmente (múltiplas instâncias pequenas &gt; uma grande)</li>
          <li>• Parar de adivinhar capacidade (Auto Scaling)</li>
          <li>• Gerenciar mudanças via automação</li>
        </ul>
        <p><strong>Serviços AWS associados:</strong></p>
        <p className="text-xs">Auto Scaling, ELB, Route 53 health checks, Multi-AZ/Region, Backup, Disaster Recovery.</p>
      </Section>

      <Section title="Pilar 4 — Performance Efficiency" accent={ACCENT}>
        <p>Usar recursos computacionais de forma eficiente para atender requisitos do sistema.</p>
        <p><strong>Princípios de design:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Democratizar tecnologias avançadas (usar serviços gerenciados)</li>
          <li>• Tornar-se global em minutos (CloudFront, múltiplas Regiões)</li>
          <li>• Usar arquiteturas serverless</li>
          <li>• Experimentar com mais frequência (testes A/B baratos na nuvem)</li>
          <li>• Considerar mechanical sympathy (escolher serviço certo)</li>
        </ul>
      </Section>

      <Section title="Pilar 5 — Cost Optimization" accent={ACCENT}>
        <p>Capacidade de rodar sistemas que entregam valor pelo menor custo possível.</p>
        <p><strong>Princípios de design:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Implementar cloud financial management (FinOps)</li>
          <li>• Adotar consumption model (paga pelo que usa)</li>
          <li>• Medir eficiência geral</li>
          <li>• Parar de gastar em trabalho pesado indiferenciado (managed services)</li>
          <li>• Analisar e atribuir despesas (tags, Cost Allocation)</li>
        </ul>
        <p><strong>Serviços AWS associados:</strong></p>
        <p className="text-xs">Cost Explorer, Budgets, Trusted Advisor, Savings Plans, Reserved Instances, S3 Intelligent-Tiering.</p>
      </Section>

      <Section title="Pilar 6 — Sustainability (adicionado 2021)" accent={ACCENT}>
        <p>Minimizar impactos ambientais de rodar workloads na nuvem.</p>
        <p><strong>Princípios de design:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Entender o impacto (measure, não estime)</li>
          <li>• Estabelecer metas de sustentabilidade</li>
          <li>• Maximizar utilização (servidores ociosos = waste)</li>
          <li>• Antecipar e adotar hardware e software mais eficientes</li>
          <li>• Usar serviços gerenciados (AWS otimiza em escala)</li>
          <li>• Reduzir impacto downstream (clientes e usuários)</li>
        </ul>
        <p><strong>Boas práticas AWS:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Escolher Regiões com mix de energia mais limpo</li>
          <li>• Usar ARM (Graviton) — até 60% menos energia por operação</li>
          <li>• Serverless e spot — só consome quando há trabalho</li>
          <li>• Descomissionar recursos ociosos</li>
          <li>• Comprimir e cachear dados</li>
        </ul>
      </Section>

      <Section title="AWS Well-Architected Tool" accent={ACCENT}>
        <p>
          Ferramenta gratuita no console AWS que aplica um questionário estruturado a uma workload e gera um relatório de gaps. Após responder, você tem uma lista priorizada de <strong>High Risk Issues (HRIs)</strong> e <strong>Medium Risk Issues (MRIs)</strong>.
        </p>
        <p>
          Parceiros da AWS certificados em "Well-Architected Partner Program" podem conduzir review formal. Clientes que completam reviews ganham acesso a programas de financiamento para remediation (WAR credits).
        </p>
      </Section>

      <Section title="Mapeamento rápido: cenário → pilar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Cenário', 'Pilar']}
          rows={[
            ['Auto Scaling para picos imprevisíveis', 'Performance / Reliability'],
            ['Habilitar MFA em conta root', 'Security'],
            ['Migrar para Graviton para reduzir consumo de energia', 'Sustainability'],
            ['Usar CloudFormation para provisionar infra', 'Operational Excellence'],
            ['Comprar Savings Plans', 'Cost Optimization'],
            ['Configurar Route 53 failover para DR', 'Reliability'],
            ['Habilitar CloudTrail em todas as Regiões', 'Security / Operational Excellence'],
            ['Usar S3 Intelligent-Tiering', 'Cost / Sustainability'],
            ['Game day para testar response a incidente', 'Operational Excellence / Reliability'],
          ]}
        />
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="CFO quer reduzir a fatura mensal AWS em 30%"
          winner="Trusted Advisor + Cost Explorer + Savings Plans"
          winnerColor={ACCENT}
          why="Trusted Advisor identifica recursos subutilizados (right-sizing). Cost Explorer revela categorias de gasto. Savings Plans garante desconto em uso previsível. Combinação aplica pilar Cost Optimization."
        />
        <DecisionBox
          scenario="CTO quer reduzir MTTR (mean time to recover) em incidentes"
          winner="Operational Excellence — runbooks em código + testes regulares + game days"
          winnerColor={ACCENT}
          why="Automatize response, teste regularmente (não espere o incidente real), documente aprendizados. Systems Manager Runbooks materializa runbooks automatizados."
        />
        <DecisionBox
          scenario="Responsável por ESG quer reportar redução de emissões de carbono das workloads"
          winner="AWS Customer Carbon Footprint Tool + otimizações do pilar Sustainability"
          winnerColor={ACCENT}
          why="Ferramenta gratuita mostra CO2 atribuível às suas workloads. Migrar para Graviton, consolidar, descomissionar ociosos — todos reduzem footprint mensurável."
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinha comum:</strong> "Criptografia é qual pilar?" → <strong>Security</strong>. "Ter backup é qual pilar?" → <strong>Reliability</strong>. "Usar Graviton é qual pilar?" → pode ser <strong>Cost, Performance E Sustainability</strong> (dependendo do ângulo). Em dúvida, leia o foco da questão (custo? impacto ambiental? velocidade?).
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual ferramenta AWS permite avaliar uma workload contra os 6 pilares?"
          a={<><strong>AWS Well-Architected Tool</strong> — gratuita, no console. Gera relatório com riscos HRI/MRI.</>}
        />
        <QAItem
          q="Qual princípio enfatiza 'fazer mudanças pequenas e reversíveis'?"
          a={<>Operational Excellence. Mudanças pequenas reduzem blast radius e permitem rollback rápido se algo der errado.</>}
        />
        <QAItem
          q="Em Reliability, qual é a recomendação para lidar com falhas?"
          a={<>Recuperação automática via health checks, self-healing, Auto Scaling. Testar procedimentos de recuperação regularmente (não esperar o incidente real).</>}
        />
        <QAItem
          q="Qual pilar cobriu a adição mais recente do framework?"
          a={<>Sustainability, adicionado em dezembro de 2021 na re:Invent. Foca em reduzir impacto ambiental das cargas.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> 6 pilares — Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability. Cada um tem princípios de design e serviços associados. Well-Architected Tool é gratuita e estrutura reviews. Mapeie cenários a pilares pelo foco da pergunta. Sustainability é o mais novo (2021).
      </Callout>
    </div>
  );
}
