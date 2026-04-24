import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('arquitetura-software-moderna');

const ACCENT = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question:
      'Em qual cenário o MONOLITO MODULAR ainda é a escolha padrão em 2026?',
    options: [
      'Nunca — microserviços sempre',
      'Empresas abaixo de ~50 engenheiros e/ou domínio pouco fragmentado. Deploy único, um banco, um processo — reduz custo operacional e complexidade de rede. Vira microserviço quando o TIME cresce e o LIMITE de contexto aperta, não porque "é moderno"',
      'Só em startups',
      'Apenas em Java',
    ],
    correct: 1,
    explanation:
      'Shopify, GitHub, Stack Overflow rodam monolito modular até hoje com bilhões de requests. Microserviços têm custo: rede, observabilidade, versionamento, consistency. Quebre o monolito quando o CUSTO ORGANIZACIONAL do monolito > custo da distribuição. Quase sempre é antes do que você pensa e depois do que o hype te vende.',
  },
  {
    question:
      'O que é um ADR (Architecture Decision Record)?',
    options: [
      'Um backup de banco',
      'Documento curto (1-2 pg) que registra UMA decisão de arquitetura: contexto, opções consideradas, escolha, consequências. Versiona no repo como código. Quando alguém pergunta "por que fizemos X?", a resposta está lá — não na cabeça de quem saiu da empresa',
      'Um tipo de rede',
      'Um lint',
    ],
    correct: 1,
    explanation:
      'ADRs resolvem o problema de "ninguém lembra por que essa decisão foi tomada". Formato padrão: título, status (proposed/accepted/deprecated/superseded), contexto, opções, decisão, consequências. Fica em docs/adr/NNNN-titulo.md. Mudou decisão? Cria ADR novo com status superseded.',
  },
  {
    question:
      'Qual é o valor prático do modelo C4?',
    options: [
      'Nenhum',
      'Dar 4 níveis de diagrama (Context, Container, Component, Code) para comunicar arquitetura em profundidade apropriada pra cada audiência — stakeholder vê Context, devs veem Component. Evita diagramas misturando detalhes e big picture',
      'Substituir UML',
      'É formato de arquivo',
    ],
    correct: 1,
    explanation:
      'C4 (Simon Brown) é o padrão prático de arquitetura visual em 2026. Usa notação simples (caixas e setas) em 4 zooms: Context (sistema + atores), Container (deployables: web, api, db), Component (dentro de um container), Code (opcional, raro). Ferramentas: Structurizr, diagrams.net.',
  },
  {
    question:
      'O que são "fitness functions" em arquitetura evolucionária?',
    options: [
      'Exercícios para o time',
      'Testes automatizados que validam características arquiteturais ao longo do tempo: tempo de build < 5 min, nenhuma camada "features" depende de "infra", acoplamento < X. Rodam em CI e mantêm a arquitetura no trilho à medida que o código evolui',
      'Funções que usam IA',
      'Métrica de produto',
    ],
    correct: 1,
    explanation:
      'Do livro "Building Evolutionary Architectures" (Ford, Parsons, Kua). Exemplo: test que falha se algum módulo de domínio importa infra HTTP; test que falha se build passa de X segundos. Evita erosão arquitetural silenciosa entre refactors.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="arquitetura-software-moderna"
      title="Arquitetura Moderna: trade-offs, ADRs, C4 e evolução"
      icon="🏛️"
      xp={95}
      readTime={20}
      trailName="Engenharia de Software Moderna"
      trailColor={ACCENT}
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
        Arquitetura é a arte de <strong>organizar trade-offs</strong>. Não existe &ldquo;melhor arquitetura&rdquo; absoluta: existe
        a escolha mais honesta dadas as restrições atuais (time, domínio, escala, dinheiro) e as mudanças previsíveis. Em 2026,
        com agents gerando código e distribuindo stack por 10 vendors, o papel do arquiteto sênior não é desenhar UML bonito —
        é <em>decidir bem</em>, <em>documentar com ADR</em>, <em>comunicar com C4</em> e <em>defender a qualidade com fitness
        functions</em>.
      </p>

      <Section title="Quatro forças a balancear" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '1. Time', v: 'Tamanho, expertise, localização. Microserviços exige maturidade operacional.' },
            { k: '2. Domínio', v: 'Simples (CRUD) ou complexo (regras de negócio fragmentadas). DDD ajuda no complexo; exagero no simples.' },
            { k: '3. Escala', v: 'Usuários, tráfego, dados. Prematuramente otimizar pra escala fantasma é o maior erro.' },
            { k: '4. Dinheiro/Prazo', v: 'Startup com 6 meses de runway: simplicidade vence elegância. Corp com 5 anos: debt vale revisitar.' },
          ]}
        />
        <Callout tone="info">
          <strong>Regra de Gall.</strong> &ldquo;Todo sistema complexo que funciona evoluiu de um sistema simples que
          funcionava. Tentar projetar sistema complexo do zero nunca funciona.&rdquo; Comece pequeno, evolua por sinal.
        </Callout>
      </Section>

      <Section title="Monolito modular: o padrão negligenciado" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Um monolito bem modularizado é muitas vezes a melhor arquitetura até ~100 devs. Um binário, um deploy, um banco. Por
          dentro, módulos com fronteira clara.
        </p>
        <CodeBlock lang="bash">{`# Exemplo de monolito modular em Node (estrutura típica)
src/
├── modules/
│   ├── billing/
│   │   ├── domain/            # entities, value objects, business rules
│   │   ├── use-cases/         # application services
│   │   ├── adapters/          # in/out: HTTP controller, DB repo, events
│   │   └── index.ts           # ONLY public API of this module
│   ├── catalog/
│   │   └── ... mesma estrutura
│   ├── identity/
│   │   └── ...
│   └── shared/
│       └── ...                # kernel: errors, clock, logger, IDs
├── infrastructure/
│   ├── db/                    # postgres client, migrations
│   ├── queue/                 # sqs/rabbit/kafka client
│   └── http/                  # fastify app setup
├── main.ts                    # composition root
└── fitness/                   # testes arquiteturais`}</CodeBlock>
        <Callout tone="warn">
          <strong>Regra do monolito modular.</strong> Módulos comunicam entre si SÓ pela API pública (<InlineCode>index.ts</InlineCode>),
          nunca por import direto de &ldquo;internals&rdquo;. Fitness function garante isso.
        </Callout>
      </Section>

      <Section title="Microserviços: quando fazem sentido" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sinal', 'Monolito modular', 'Microserviços']}
          rows={[
            ['Time', '1-50 engs', '50+ distribuídos em múltiplos squads'],
            ['Deploy cadence', 'Diário/semanal', 'Várias vezes por dia por serviço'],
            ['Domínios independentes', 'Pouco', 'Muitos (payments, catalog, inventory...)'],
            ['Ops capability', 'Baixa-média', 'Alta (SRE, observabilidade, gitops)'],
            ['Acoplamento de mudança', 'Aceitável', 'Ruim — mesma feature toca 5 serviços'],
            ['Stack heterogênea', 'Não precisa', 'Uma linguagem por serviço OK'],
            ['Custo de infra', 'Baixo', 'Alto (rede, observabilidade, versioning)'],
            ['Quando migrar', 'Quando dor organizacional > custo de distribuir', 'Depois do monolito comprovar o domínio'],
          ]}
        />
        <Callout tone="danger">
          <strong>Anti-padrão do hype.</strong> Começar projeto novo já em microserviços &ldquo;porque é moderno&rdquo; é receita
          pra fracasso. Você paga o custo de distribuição antes de entender o domínio — e o domínio ainda vai mudar 10 vezes.
        </Callout>
      </Section>

      <Section title="DDD pragmático" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Ubiquitous language', v: 'Mesmos termos entre negócio e código. Se o time diz "carrinho", código diz Cart, não ShoppingBasket.' },
            { k: 'Bounded context', v: 'Fronteira de linguagem. "Customer" em Billing pode significar algo diferente de "Customer" em Catalog. Cada contexto é um módulo.' },
            { k: 'Aggregate', v: 'Grupo de entidades com invariante comum e uma raiz. Transações respeitam o aggregate.' },
            { k: 'Value object', v: 'Objeto sem identidade (Money, Email, Address). Imutável, comparação por valor.' },
            { k: 'Domain event', v: 'Fato do passado ("OrderPlaced"). Outros contexts reagem.' },
            { k: 'Repository', v: 'Abstrai persistência. Domain não sabe de SQL.' },
            { k: 'Onde NÃO aplicar', v: 'CRUD simples sem regra de negócio. DDD tem overhead — só paga em domínio complexo.' },
          ]}
        />
      </Section>

      <Section title="ADR: Architecture Decision Record" accent={ACCENT}>
        <CodeBlock lang="markdown">{`# ADR 0007: Adotar monolito modular para o backend V1

**Status:** Accepted
**Data:** 2026-04-16
**Deciders:** @fernando, @maria, @joao

## Contexto
Vamos começar o backend do produto Y. Time atual: 4 engs. Domínio
claro (CRM para pequenas empresas) mas ainda imaturo. Prazo: MVP em
3 meses.

## Opções consideradas
1. Monolito tradicional (tudo misturado)
2. Monolito modular (módulos com fronteira, 1 deploy)
3. Microserviços desde o dia 1
4. Serverless first (Lambda + DynamoDB)

## Decisão
Opção 2: monolito modular. Node 20 + Fastify + Postgres + Redis.
Módulos: identity, billing, deals, contacts.

## Justificativa
- Time pequeno: operar >1 deploy seria overhead.
- Domínio imaturo: muita fronteira vai mudar; modular reduz custo de
  reorganizar.
- Prazo curto: otimizar pra velocidade de aprender, não pra escala.
- Quando crescer (100k users ou 15+ devs): reavaliamos em novo ADR.

## Consequências
- + Simplicidade operacional.
- + Uma stack só.
- + Consistência transacional dentro do monolito.
- - Escalabilidade horizontal por módulo mais difícil.
- - Release acoplado entre módulos (ao menos para V1).

## Referências
- "Modular monolith" (Kamil Grzybek)
- Shopify case study
- Related ADRs: 0005 (stack), 0006 (Postgres)`}</CodeBlock>
        <Callout tone="info">
          <strong>Onde armazenar.</strong> <InlineCode>docs/adr/NNNN-titulo.md</InlineCode> no repo, numerado. Use{' '}
          <InlineCode>adr-tools</InlineCode> se quiser CLI (<InlineCode>adr new &quot;titulo&quot;</InlineCode>). Status muda
          via novo ADR que &ldquo;supersede&rdquo; o anterior — nunca reescreva history.
        </Callout>
      </Section>

      <Section title="Modelo C4: comunicar em 4 zooms" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '🌍', label: 'C1 Context', sub: 'quem usa o sistema', detail: 'Diagrama de alto nível: sistema + atores humanos + sistemas externos. 1 por produto.', connector: 'zoom in' },
            { icon: '📦', label: 'C2 Container', sub: 'o que se deploya', detail: 'Web app, API, banco, queue, worker. 1 por sistema. Mostra protocolos entre containers.', connector: 'zoom in' },
            { icon: '🧩', label: 'C3 Component', sub: 'dentro do container', detail: '(Se útil) controllers, services, repositories de 1 container. 1 por container complexo.', connector: 'zoom in' },
            { icon: '⌨️', label: 'C4 Code', sub: 'raro', detail: 'Classes/funções. Raramente vale o esforço — IDE já mostra. Pule em 99% dos casos.' },
          ]}
        />
        <CodeBlock lang="plantuml">{`@startuml
!include <C4/C4_Container>

Person(user, "Cliente", "Usuário final da loja")
System_Boundary(store, "E-commerce") {
  Container(web, "Web app", "Next.js", "UI pública")
  Container(api, "API", "Fastify/Node", "Regras de negócio")
  ContainerDb(db, "Postgres", "RDS Aurora", "Pedidos, usuários, catálogo")
  Container(queue, "Queue", "SQS", "Eventos de pagamento")
  Container(worker, "Worker", "Node", "Processa pagamentos async")
}
System_Ext(stripe, "Stripe", "Gateway de pagamento")

Rel(user, web, "usa", "HTTPS")
Rel(web, api, "chama", "HTTPS/JSON")
Rel(api, db, "lê/escreve", "SQL")
Rel(api, queue, "publica", "AWS SDK")
Rel(worker, queue, "consome", "AWS SDK")
Rel(worker, stripe, "chama", "HTTPS")
@enduml`}</CodeBlock>
        <Callout tone="success">
          <strong>Ferramentas.</strong> <InlineCode>Structurizr DSL</InlineCode> (oficial, texto),{' '}
          <InlineCode>PlantUML</InlineCode> com C4 macros (em código), <InlineCode>diagrams.net</InlineCode> (drag-and-drop),
          <InlineCode>likec4</InlineCode> (typescript-based). Escolha o que seu time consegue manter — diagrama desatualizado
          mente.
        </Callout>
      </Section>

      <Section title="Fitness Functions" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Exemplo real em um monorepo TypeScript — teste arquitetural que roda no CI:
        </p>
        <CodeBlock lang="typescript">{`// fitness/no-cross-module-imports.test.ts
import { describe, it, expect } from 'vitest';
import fg from 'fast-glob';
import fs from 'node:fs/promises';
import path from 'node:path';

// Regra: módulo X só pode importar de shared/ ou do próprio X.
// Nunca de internals de módulo Y.

describe('fitness: module boundaries', () => {
  const modules = ['billing', 'catalog', 'identity'];

  for (const mod of modules) {
    it(\`\${mod} does not import other modules' internals\`, async () => {
      const files = await fg(\`src/modules/\${mod}/**/*.ts\`);
      const violations: string[] = [];
      for (const f of files) {
        const src = await fs.readFile(f, 'utf8');
        const m = src.match(/from ['"]@\\/modules\\/([a-z]+)\\/(?!index['"])[^'"]+['"]/g);
        if (m) violations.push(\`\${f}: \${m.join(', ')}\`);
      }
      expect(violations).toEqual([]);
    });
  }
});

// fitness/build-time.test.ts
import { execSync } from 'node:child_process';
it('build completes in under 90 seconds', () => {
  const t0 = Date.now();
  execSync('npm run build', { stdio: 'ignore' });
  const elapsed = Date.now() - t0;
  expect(elapsed).toBeLessThan(90_000);
});`}</CodeBlock>
      </Section>

      <Section title="Estratégias de evolução (sem big-rewrite)" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Strangler Fig (Fowler)', v: 'Nova impl cresce em volta da antiga. Reverse proxy roteia gradualmente. Desliga a velha só quando zero tráfego. Zero downtime.' },
            { k: 'Branch by Abstraction', v: 'Cria interface entre código antigo e novo. Implementações coexistem. Troca por feature flag.' },
            { k: 'Parallel Run', v: 'Roda impl nova em paralelo com a antiga, compara resultados (em especial em migração de pricing, scoring, risk).' },
            { k: 'Event Interception', v: 'Captura eventos do sistema antigo, alimenta o novo. Útil pra CDC (change data capture) em migração de banco.' },
            { k: 'Anti-Corruption Layer', v: 'Camada de tradução entre sistemas com modelos incompatíveis. Protege o domínio novo de legado sujo.' },
            { k: 'Big-rewrite', v: 'Quase sempre fracasso. Só quando o sistema não tem como evoluir (tech morto, security insolúvel) e orçamento+time comprovadamente gigantes.' },
          ]}
        />
      </Section>

      <Section title="Cenários reais de decisão" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Startup série A, 8 engs, domínio CRM ainda fluido"
          winner="Monolito modular + ADRs + C4"
          why="Otimize pra aprender. Monolito modular com módulos bem delimitados acomoda mudança de modelo. ADRs garantem que não repetem discussões. C4 comunica com novos devs e investidores."
          alternatives={[{ name: 'Microserviços', note: 'custo operacional mata a startup antes do PMF.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Empresa com monolito de 8 anos em Rails; 80 devs; deploys lentos; features atrasam"
          winner="Strangler Fig + Bounded Contexts"
          why="Não reescreva tudo. Identifique os 2-3 bounded contexts com mais dor (ex.: billing, fulfillment), extraia para serviços separados via strangler. Reduza custo operacional desses serviços com platform interna."
          alternatives={[{ name: 'Big-rewrite', note: 'lore de fracasso. Evite a todo custo.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="SaaS B2B multi-tenant crescendo, time querendo adicionar &ldquo;IA&rdquo; por todo lado"
          winner="Arquitetura orientada a eventos + AI gateway"
          why="Eventos de domínio ficam em um bus (Kafka/EventBridge). Features de IA consomem eventos e publicam resultados. AI Gateway (Kong AI, LiteLLM) centraliza chamadas a modelos, controla custo, auditoria e fallback. Evita IA colada com fita em 10 lugares."
        />
      </Section>

      <Section title="Princípios pra durar" accent={ACCENT}>
        <ul className="flex flex-col gap-2" style={{ color: 'var(--ffv-muted)' }}>
          <li>• <strong>Simplicity beats cleverness.</strong> Cada camada de abstração cobra imposto eternamente.</li>
          <li>• <strong>Conway&apos;s Law.</strong> Arquitetura reflete comunicação do time. Mude org antes de mudar arquitetura.</li>
          <li>• <strong>Premature optimization is the root...</strong> ainda vale. Meça antes de otimizar.</li>
          <li>• <strong>Postel&apos;s Law.</strong> Seja liberal no que aceita, conservador no que envia.</li>
          <li>• <strong>YAGNI.</strong> You Ain&apos;t Gonna Need It. Feature flag, cache, retry só quando a dor surgir.</li>
          <li>• <strong>DRY com moderação.</strong> 3 repetições &gt; 1 abstração errada. Abstração errada é mais cara que copiar.</li>
          <li>• <strong>Boundaries preservam opções.</strong> Repositório bem isolado permite trocar Postgres por Dynamo. Módulo bem fechado permite extrair pra serviço.</li>
          <li>• <strong>Arquitetura é viva.</strong> Revise ADRs principais a cada 6-12 meses. Decisões envelhecem.</li>
        </ul>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Preciso de arquiteto dedicado?"
          a={
            <>
              Em time &lt; 30 devs, não. Um ou dois sêniores conduzem as decisões via ADR + RFC. Em time maior, um{' '}
              <em>Tech Lead/Staff</em> por domínio + guilda de arquitetura faz mais sentido que papel top-down.
            </>
          }
        />
        <QAItem
          q="CQRS, Event Sourcing valem a pena?"
          a="Em domínio complexo com auditoria crítica (pagamentos, trading, healthcare) — sim. Em CRUD normal — overhead. Aplique onde paga."
        />
        <QAItem
          q="Serverless é sempre mais barato?"
          a="Não. Spike curto: sim. Carga estável e alta: EC2/K8s ficam baratos. Faça cálculo (lambda pricing + requests/mês + duração) antes de adotar como padrão."
        />
        <QAItem
          q="Como evito &ldquo;architecture astronauts&rdquo; no meu time?"
          a="Prazo curto + demonstrar valor rápido + fitness functions medindo simplicidade (linhas, profundidade de call, tempo de build). Arquiteto que não escreve código perde contato com dor real."
        />
        <QAItem
          q="Agent pode propor arquitetura?"
          a="Pode (vimos architect subagent). Útil pra levantar opções, trade-offs, referências. Decisão final é humana e registrada em ADR. Quem responde pelo sistema é pessoa, não modelo."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Arquitetura é trade-off consciente, não &ldquo;melhor prática&rdquo; absoluta. (2)
        Monolito modular ainda é o padrão default abaixo de ~50 engs. (3) Microserviços quando o custo organizacional do monolito
        passar o custo da distribuição. (4) ADR registra o &ldquo;por quê&rdquo;; C4 comunica o &ldquo;o quê&rdquo;; fitness
        function defende o &ldquo;ainda vale&rdquo;. (5) Evolua por strangler fig, nunca por big-rewrite. (6) Trilha fechada —
        você saiu do &ldquo;coder&rdquo; e virou engenheiro.
      </Callout>
    </div>
  );
}
