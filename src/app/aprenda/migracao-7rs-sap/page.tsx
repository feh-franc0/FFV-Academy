import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('migracao-7rs-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre Rehost e Replatform?',
    options: [
      'Igual',
      'Rehost ("lift and shift") move VM inalterada pra EC2 via Application Migration Service — rápido, risco baixo, nenhum ganho cloud-native. Replatform mantém código mas troca plataforma (ex: MySQL on-prem → RDS MySQL, JVM → Elastic Beanstalk) ganhando managed services sem reescrever',
      'Só nomenclatura',
      'Refactor é Rehost',
    ],
    correct: 1,
    explanation: 'Rehost é túnel: IP muda, resto não. Replatform é "trocar motor mantendo carroceria" — típico DB on-prem pra RDS, filesystem pra EFS. Refactor é reescrever pra cloud-native (monolito → microserviços Lambda). Custo/risco cresce: Rehost < Replatform < Refactor.',
  },
  {
    question: 'Quando DMS + SCT é a combinação correta?',
    options: [
      'Só homogêneas',
      'Migração heterogênea (Oracle → Aurora PostgreSQL, SQL Server → Aurora MySQL). SCT (Schema Conversion Tool) converte schema + stored procedures + triggers com relatório de incompatibilidades. DMS replica os dados com CDC pra minimizar downtime de cutover',
      'Só homogêneas',
      'Nunca usar',
    ],
    correct: 1,
    explanation: 'SCT trata o schema (DDL + PL/SQL → PL/pgSQL), DMS trata os dados. CDC (Change Data Capture) permite que a fonte continue recebendo writes enquanto a réplica AWS sincroniza — cutover vira janela de minutos, não horas. Homogêneas (Oracle → Oracle RDS) podem dispensar SCT.',
  },
  {
    question: 'O que Migration Hub agrega?',
    options: [
      'Nada',
      'Pane única pra portfolio: descoberta (Application Discovery Service coleta de agentes on-prem), catálogo de servidores/apps, tracking de progresso de migração, integração com MGN/DMS. Pra migração de 100+ servidores vira obrigatório pra não perder visibilidade',
      'Só DNS',
      'É o MGN',
    ],
    correct: 1,
    explanation: 'Migration Hub não migra nada — orquestra. Você vê todos os movimentos (MGN jobs, DMS tasks, SMS imports) numa view consolidada, agrupa servidores em "applications", exporta relatórios pra PMO. Sem Hub, times perdem track em migrações complexas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="migracao-7rs-sap"
      title="Migration strategy: os 7 Rs + DMS + SMS"
      icon="📦"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="cost-allocation-em-escala"
      nextTitle="Cost allocation tags em escala + Cost Categories"
      quiz={quiz}
    >
      <Section title="Os 7 Rs em ordem crescente de esforço" accent={accent}>
        <CodeBlock lang="yaml">{`Retire:      Desliga — sistema obsoleto, ninguém usa. Economia imediata.
Retain:      Mantém on-prem por ora (compliance, latency, contrato).
Relocate:    VMware Cloud on AWS — move vSphere inteiro sem mudar ferramentas.
Rehost:      Lift-and-shift com Application Migration Service (MGN).
Repurchase:  Troca por SaaS (ex: Exchange on-prem → Microsoft 365).
Replatform:  Mantém código, ganha managed (MySQL → RDS, Tomcat → Beanstalk).
Refactor:    Reescreve cloud-native (monolito → serverless + microserviços).`}</CodeBlock>
        <p>
          Em migração real 1.000 servidores: ~30% Retire (surpreendentemente alto após descoberta), 40% Rehost (quick wins), 20% Replatform, 5% Refactor, 5% Retain. Refactor é caro, faça só onde ROI é claro (app crítico que se beneficia de serverless scale).
        </p>
      </Section>

      <Section title="Ferramentas de migração" accent={accent}>
        <CodeBlock lang="yaml">{`Application Migration Service (MGN):
  - Sucessor do SMS + CloudEndure
  - Replica bloco-nível de VM on-prem → EBS em AWS
  - Cutover em minutos; rollback simples
  - Free por 90 dias pra cada servidor

Database Migration Service (DMS):
  - Origem: Oracle, SQL Server, MySQL, PostgreSQL, MongoDB
  - Destino: RDS, Aurora, Redshift, S3, DynamoDB
  - Full load + CDC contínuo
  - Serverless DMS disponível (escalar on-demand)

Schema Conversion Tool (SCT):
  - Converte schema + código procedural heterogêneo
  - Relatório de items não-convertíveis (com sugestão)
  - Funciona standalone ou integrado a DMS

DataSync:
  - Transfer de dados em file-level (NFS/SMB → S3/EFS/FSx)
  - 10x mais rápido que rsync/scp em escala

Snow Family (Snowcone/Snowball/Snowmobile):
  - Transfer offline pra volumes maciços ou locais
    sem largura de banda`}</CodeBlock>
      </Section>

      <Section title="Cutover estratégico sem downtime zero" accent={accent}>
        <p>
          Zero downtime é miragem cara. Objetivo real: cutover curto (&lt;15min pra apps críticos, &lt;2h pra batch). Receita: DMS CDC mantendo réplica sincronizada → Route 53 weighted routing gradualmente deslocando tráfego → monitoring com rollback pronto. Se algo quebra na primeira hora pós-cutover, volta tráfego pra on-prem em minutos.
        </p>
        <Callout tone="warn" icon="⚠️">
          Antipattern clássico: cutover de sexta à noite, engenheiros de plantão, sem plano de rollback. Faça wave migrations (apps em grupos), rehearsals em staging clone da prod, e mantenha on-prem por 2-4 semanas após cutover como fallback.
        </Callout>
        <Callout tone="success" icon="✅">
          Ordem didática: descoberta (Application Discovery Service 2-4 sem) → portfolio analysis (decidir R de cada app) → foundation AWS (Landing Zone, networking) → wave 1 (menos crítico) → rehearsals → waves de produção → decom on-prem.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
