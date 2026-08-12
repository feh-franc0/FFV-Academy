import { CURRICULUM, HUBS, JORNADA, getHubTrails, getTrailHref } from '@/lib/curriculum';
import manifesto from '@/lib/content-manifest.json';

/**
 * `/llms.txt` — mapa do conteúdo em texto, para agentes e ferramentas de IA.
 *
 * ## O que isto é, e o que NÃO é
 *
 * NÃO é um recurso de posicionamento em busca. Nenhuma das grandes plataformas de
 * IA se comprometeu publicamente a ler este arquivo como entrada de primeira
 * classe, e a adoção medida em 2026 gira em torno de 10% dos domínios. Quem
 * promete ranqueamento com ele está vendendo.
 *
 * O que ele É: a forma padronizada de publicar uma superfície legível por
 * máquina. Assistentes de código e agentes — os que a Anthropic recomenda
 * explicitamente que o procurem — buscam este arquivo antes de ingerir um site,
 * porque ele economiza rastreamento e diz o que importa. Para uma escola de
 * engenharia cujo público É desenvolvedor usando esses agentes, o custo é uma rota
 * e o ganho é ser citável com precisão em vez de por adivinhação.
 *
 * ## Por que gerado, e não um arquivo em `public/`
 *
 * Um arquivo estático com 39 trilhas e 415 módulos ficaria desatualizado no
 * primeiro módulo novo, em silêncio — o mesmo defeito que a lista de rotas do
 * sitemap já teve. Aqui ele é derivado do currículo, e só anuncia slug com
 * conteúdo escrito, pelo mesmo motivo do sitemap: URL que responde 404 gasta o
 * rastreamento de quem confiou no mapa.
 */

export const dynamic = 'force-static';

const BASE = 'https://fernandofrancovalle.com';
const COM_CONTEUDO = new Set(manifesto.slugs);

const NIVEL_PT: Record<string, string> = {
  foundational: 'fundamental',
  beginner: 'iniciante',
  intermediate: 'intermediário',
  advanced: 'avançado',
};

export async function GET() {
  const linhas: string[] = [];

  linhas.push('# FFV Academy');
  linhas.push('');
  linhas.push(
    '> Escola em português de **arquitetura de soluções AWS e IA em produção**. ' +
    'O eixo é a junção das duas coisas: desenhar a arquitetura e saber o que os ' +
    'serviços de IA da AWS fazem por baixo — Amazon Bedrock, Knowledge Bases, ' +
    'agents e AgentCore, Guardrails, mais 100 laboratórios reproduzíveis em ' +
    'Terraform e as certificações AWS. Conteúdo gratuito, com quizzes que ' +
    'alimentam revisão espaçada (SM-2) e diagramas de arquitetura percorríveis.',
  );
  linhas.push('');
  linhas.push(
    'Como o conteúdo está organizado: **hub** (área) → **trilha** (curso) → ' +
    '**módulo** (artigo). Cada módulo tem apoio visual e três perguntas de ' +
    'fixação com explicação que trata cada alternativa errada.',
  );
  linhas.push('');
  // A jornada é o eixo de LEITURA do site — a ordem em que o conteúdo foi feito
  // para ser consumido. Declará-la aqui dá ao assistente de IA a resposta para
  // "por onde começo?", que é a pergunta mais comum sobre uma escola técnica e
  // a que a estrutura hub/trilha/módulo sozinha não responde.
  linhas.push('## A jornada, em ordem');
  linhas.push('');
  linhas.push(
    'Além da hierarquia acima existe um PERCURSO recomendado, em ' +
    `${JORNADA.length} etapas — é ele que a página /jornada apresenta:`,
  );
  linhas.push('');
  for (const etapa of JORNADA) {
    const nomes = etapa.trilhas
      .map(id => CURRICULUM.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join(' → ');
    linhas.push(`${etapa.numero}. **${etapa.titulo}** — ${etapa.resultado}`);
    linhas.push(`   Ordem: ${nomes}`);
  }
  linhas.push('');
  linhas.push(`Caminho completo: ${BASE}/jornada`);
  linhas.push('');
  linhas.push('Idioma: português do Brasil. Licença de uso do conteúdo: leitura livre, atribuição esperada.');
  linhas.push('');

  const totalModulos = CURRICULUM.reduce(
    (acc, t) => acc + t.modules.filter(m => COM_CONTEUDO.has(m.slug)).length,
    0,
  );
  linhas.push(
    `Números atuais: ${HUBS.length} hubs, ${CURRICULUM.length} trilhas, ${totalModulos} módulos publicados.`,
  );
  linhas.push('');

  for (const hub of HUBS) {
    const trilhas = getHubTrails(hub);
    if (!trilhas.length) continue;

    linhas.push(`## ${hub.name}`);
    linhas.push('');
    if (hub.tagline) linhas.push(`${hub.tagline}`);
    linhas.push('');

    for (const trilha of trilhas) {
      const modulos = trilha.modules.filter(m => COM_CONTEUDO.has(m.slug));
      if (!modulos.length) continue;

      linhas.push(`### ${trilha.name} — [${BASE}${getTrailHref(trilha.id)}]`);
      if (trilha.desc) linhas.push(`${trilha.desc}`);
      linhas.push('');
      for (const m of modulos) {
        const nivel = m.level ? ` · ${NIVEL_PT[m.level] ?? m.level}` : '';
        const tempo = m.readTime ? ` · ${m.readTime} min` : '';
        // Descrição na MESMA linha do link: o agente que lê este arquivo decide
        // o que buscar por aqui, e link sem contexto obriga a baixar a página.
        linhas.push(`- [${m.title}](${BASE}/aprenda/${m.slug})${nivel}${tempo}${m.desc ? ` — ${m.desc}` : ''}`);
      }
      linhas.push('');
    }
  }

  linhas.push('## Recursos adicionais');
  linhas.push('');
  linhas.push(`- [Explorar por hub e trilha](${BASE}/explorar)`);
  linhas.push(`- [Mapa visual do currículo](${BASE}/mapa)`);
  linhas.push(`- [Simulados de certificação AWS](${BASE}/simulados)`);
  linhas.push(`- [Sitemap XML](${BASE}/sitemap.xml)`);
  linhas.push('');

  return new Response(linhas.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Muda a cada publicação de conteúdo, não a cada requisição.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
