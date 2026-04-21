import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mongodb-producao');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o principal risco de embedar subdocumentos grandes em MongoDB?',
    options: [
      'Não há risco',
      'Limite de 16MB por documento e custo de reescrita: atualizar um subdocumento em array cresce o documento, pode estourar o padding e forçar realocação. Padrão outlier (bucketing) ou referência é melhor quando o array cresce sem teto',
      'MongoDB só suporta até 10 chaves por documento',
      'Embedar é sempre mais rápido, não há risco',
    ],
    correct: 1,
    explanation: 'O limite hard é 16MB por documento e 100 níveis de aninhamento. Mais importante: arrays unbounded (ex: comments em post viral) corroem performance porque cada push reescreve o documento inteiro e invalida índices. Use bucketing (1 doc = 200 comments) ou separe em coleção referenciada. O princípio "embed what you read together" só vale quando o bound é conhecido.',
  },
  {
    question: 'Para que serve o estágio $lookup em aggregation pipeline?',
    options: [
      'Criar índice',
      'Fazer left outer join com outra coleção dentro do pipeline. Útil para enriquecer documentos sem round-trip extra ao app, mas caro: sem índice no campo alvo vira scan quadrático. Use sharded-aware ou troque por embed quando padrão é estável',
      'Deletar documentos',
      'Criar backup',
    ],
    correct: 1,
    explanation: '$lookup é o mecanismo de join do Mongo (foi adicionado na 3.2). Performa razoavelmente se o foreignField tem índice e o pipeline filtra antes. É lento em collections sharded e em cardinalidade alta — nesses casos, denormalize (embed ou field duplicado) ou faça join na aplicação com DataLoader.',
  },
  {
    question: 'Qual é o write concern correto para dados financeiros?',
    options: [
      'w: 0 (fire and forget)',
      'w: "majority" com journaled: true. Garante que o write foi aceito pela maioria do replica set e persistido em disco. Latência maior, mas evita perda em failover. Usar w:1 em dinheiro é negligência',
      'w: 1 sempre',
      'Write concern não importa',
    ],
    correct: 1,
    explanation: 'w:"majority" significa que o write foi replicado para (N/2)+1 nós e só então retorna sucesso. Combinado com j:true garante durability em disco. Em dinheiro, assinatura, e qualquer coisa auditável: majority é mandatório. w:1 aceita perda silenciosa em primary failover (rollback file). O custo é latência de ~10-30ms em vez de ~2ms.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mongodb-producao"
      title="MongoDB em produção"
      icon="🍃"
      xp={55}
      readTime={13}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Quando Mongo é a escolha certa" accent={accent}>
        <p>
          MongoDB vale a pena quando o domínio tem estrutura variável por natureza (configs de tenant, catálogo heterogêneo, eventos semi-estruturados) e o padrão de acesso é dominado por find por chave + aggregation. Se você está reescrevendo Postgres com joins em Mongo, errou a escolha.
        </p>
      </Section>

      <Section title="Aggregation pipeline real" accent={accent}>
        <p>
          Abaixo um pipeline que responde "top 5 categorias por receita nos últimos 30 dias, com ticket médio e quantidade de pedidos únicos". Esse é o tipo de query que mostra o poder do aggregation framework.
        </p>
        <CodeBlock lang="js">{`db.orders.aggregate([
  // 1. Filtra janela de 30 dias (usa indice em createdAt)
  { $match: {
      status: 'paid',
      createdAt: { $gte: new Date(Date.now() - 30 * 864e5) }
  }},

  // 2. Abre array de items (1 doc por item)
  { $unwind: '$items' },

  // 3. Agrupa por categoria
  { $group: {
      _id: '$items.category',
      receita: { $sum: { $multiply: ['$items.qty', '$items.price'] }},
      pedidos: { $addToSet: '$_id' },
      ticketTotal: { $sum: '$total' },
      docs: { $sum: 1 }
  }},

  // 4. Calcula metricas derivadas
  { $project: {
      categoria: '$_id',
      receita: 1,
      pedidosUnicos: { $size: '$pedidos' },
      ticketMedio: { $divide: ['$ticketTotal', { $size: '$pedidos' }] },
      _id: 0
  }},

  // 5. Ordena e limita
  { $sort: { receita: -1 }},
  { $limit: 5 }
], { allowDiskUse: true });`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Use <strong>explain(&quot;executionStats&quot;)</strong> em todo pipeline novo. Procure por COLLSCAN — sinal de índice ausente — e por estágios que não aproveitam o índice inicial (depois do primeiro $match, o índice perde efeito).
        </Callout>
      </Section>

      <Section title="Schema design: embed vs reference" accent={accent}>
        <CodeBlock lang="js">{`// Embed (leitura junta, bound conhecido)
{
  _id: ObjectId('...'),
  title: 'Post sobre Mongo',
  author: { id: 'u1', name: 'Fernando' },   // embed: raramente muda
  tags: ['nosql', 'mongo'],                 // bounded
  comments: [                                // RISCO se viral
    { user: 'u2', text: 'bom', at: ISODate() }
  ]
}

// Reference (unbounded ou reuso)
// posts:
{ _id: ObjectId('...'), title: '...', authorId: 'u1' }
// comments:
{ _id: ObjectId('...'), postId: 'p1', user: 'u2', text: 'bom' }`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Arrays ilimitados dentro de documento são armadilha clássica. Se o array pode crescer sem teto (comments em post viral, events por usuário), use bucketing ou coleção separada.
        </Callout>
      </Section>

      <Section title="Índices e production hygiene" accent={accent}>
        <CodeBlock lang="js">{`// Compound index segue regra ESR: Equality, Sort, Range
db.orders.createIndex(
  { status: 1, createdAt: -1, total: 1 },
  { background: true, name: 'orders_status_date_total' }
);

// TTL index para dados efemeros
db.sessions.createIndex(
  { lastSeen: 1 },
  { expireAfterSeconds: 86400 }
);

// Checar indices nao usados (em producao real)
db.orders.aggregate([{ $indexStats: {} }]);`}</CodeBlock>
      </Section>

      <Section title="Write concern e durability" accent={accent}>
        <Callout tone="danger" icon="🚨">
          Dados financeiros: sempre <strong>w: &quot;majority&quot;</strong> + <strong>j: true</strong>. w:1 aceita perda silenciosa em failover. Read concern &quot;majority&quot; para consistência entre réplicas.
        </Callout>
        <Callout tone="success" icon="✅">
          Mongo é excelente em document domain com acesso por chave. Ruim em joins complexos. Saiba diferenciar.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
