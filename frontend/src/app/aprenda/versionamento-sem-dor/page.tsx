import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('versionamento-sem-dor');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a principal vantagem de URL versioning (/v1/users) vs header versioning?',
    options: [
      'Mais rápido no servidor',
      'Visível, caching-friendly, debuggável com curl — custo: parece duplicar URLs. Na prática venceu por simplicidade operacional',
      'Obrigatório em REST',
      'Só funciona em HTTPS',
    ],
    correct: 1,
    explanation: 'URL versioning é debuggável (vê no log, Ctrl+F) e caching-friendly (CDN trata /v1 e /v2 como recursos distintos). Header versioning (Accept: application/vnd.api+json; version=2) é elegante mas esconde complexidade — dev não vê versão, cache precisa entender o header. Stripe, GitHub, Twilio todos usam URL versioning.',
  },
  {
    question: 'O que o header `Sunset` comunica?',
    options: [
      'Horário que a API desliga',
      'Data futura em que o endpoint vai ser desativado — alerta clientes pra migrarem antes',
      'Versão do servidor',
      'Timezone',
    ],
    correct: 1,
    explanation: 'Sunset: Sat, 31 Dec 2026 23:59:59 GMT diz "depois dessa data este endpoint some". Combinado com Deprecation: true e Link: rel="successor-version" dá comunicação formal (RFC 8594). Clientes bem comportados alertam dev ops.',
  },
  {
    question: 'Qual é a regra de ouro de breaking changes em API?',
    options: [
      'Quebrar sempre que der — clientes se viram',
      'Nunca remover endpoint ou campo — deprecar com Sunset; adicionar campos opcionais é sempre seguro; só remover em nova major version após período longo',
      'Avisar no Twitter',
      'Deixar o cliente descobrir',
    ],
    correct: 1,
    explanation: 'Backward compat é sagrado. Adicionar campo opcional = não-breaking. Remover campo = breaking. Mudar tipo = breaking. Mudar default = breaking. Quando precisa de breaking: nova major version + período de coexistência + Sunset + comunicação. Stripe mantém v1 de 2011 até hoje.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="versionamento-sem-dor"
      title="Versionamento sem dor: URL, header, sunset e estratégia de migração"
      icon="🔀"
      xp={45}
      readTime={10}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="graphql-quando-faz-sentido"
      nextTitle="GraphQL quando faz sentido: N+1, DataLoader e federation"
      quiz={quiz}
    >
      <Section title="Estratégias: qual escolher" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Estratégia', 'Exemplo', 'Prós', 'Contras']}
          rows={[
            ['URL', '/v1/users', 'Visível, simples, CDN-friendly', 'Parece duplicar URLs'],
            ['Header', 'Accept: vnd.api+json;v=2', 'URLs limpas', 'Invisível, cache complexo'],
            ['Query param', '?version=2', 'Trivial testar', 'Confundido com filtro'],
            ['Content negotiation', 'application/vnd.app.user-v2+json', 'Granular por recurso', 'Complexidade'],
          ]}
        />
        <Callout tone="info" icon="💡">
          Default pragmático: <strong>URL versioning</strong>. Stripe, GitHub, Twilio, AWS — todos usam. Simples de operar vence elegância.
        </Callout>
      </Section>

      <Section title="Quando é breaking?" accent={accent}>
        <p><strong>Não-breaking (seguro):</strong></p>
        <ul className="list-disc pl-5 my-2 text-sm">
          <li>Adicionar campo opcional na resposta</li>
          <li>Adicionar novo endpoint</li>
          <li>Adicionar header opcional</li>
          <li>Relaxar validação (aceitar mais inputs)</li>
        </ul>
        <p><strong>Breaking (precisa v2):</strong></p>
        <ul className="list-disc pl-5 my-2 text-sm">
          <li>Remover ou renomear campo</li>
          <li>Mudar tipo de campo existente</li>
          <li>Tornar campo opcional → obrigatório</li>
          <li>Mudar default</li>
          <li>Mudar código de status retornado</li>
          <li>Apertar validação (rejeitar inputs antes aceitos)</li>
        </ul>
      </Section>

      <Section title="Sunset: comunicação formal" accent={accent}>
        <CodeBlock lang="http">{`HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Link: </v2/users/123>; rel="successor-version"

{ "id": 123, "name": "..." }`}</CodeBlock>
        <p>
          RFC 8594 (Sunset) + RFC 9745 (Deprecation). Clientes bem comportados (SDKs gerados a partir de OpenAPI) alertam dev no build. Scanner simples em API gateway detecta clientes ainda usando v1 pra CS entrar em contato.
        </p>
      </Section>

      <Section title="Estratégia de migração: coexistência" accent={accent}>
        <ol className="list-decimal pl-5 my-3 text-sm space-y-2">
          <li><strong>Lançar /v2 com melhorias</strong>, mantendo /v1 100% funcional.</li>
          <li><strong>Documentar mudanças</strong> em migration guide (diff-style: &quot;campo X agora é Y&quot;).</li>
          <li><strong>Enviar Deprecation + Sunset</strong> nas respostas de /v1 (data mínima: 6 meses no futuro).</li>
          <li><strong>Métricas</strong>: dashboard de uso v1 vs v2 por cliente. Comunicar top-N clientes que ainda usam v1 pessoalmente.</li>
          <li><strong>Só desligar v1 quando uso &lt; 1%</strong> ou após data de Sunset.</li>
        </ol>
      </Section>
    </ModuleLayout>
  );
}
