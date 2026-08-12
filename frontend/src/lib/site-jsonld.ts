/**
 * O grafo de entidades do site — quem publica, quem escreve, o que é o site.
 *
 * ## O que faltava
 *
 * Até ago/2026 o único dado estruturado de identidade era um `publisher` inline
 * repetido em cada página de artigo: `{'@type': 'Organization', name: 'FFV
 * Academy'}`. Sem `@id`, sem logo, sem `sameAs`, sem nada que ligue as 415
 * páginas a uma mesma entidade. Para o buscador, isso são 415 organizações com o
 * mesmo nome, não uma escola com 415 artigos.
 *
 * Um `@graph` com `@id` estável resolve: cada página passa a REFERENCIAR a
 * entidade em vez de redeclará-la, e a autoria acumula num nó só.
 *
 * ## Por que `EducationalOrganization`, e não só `Organization`
 *
 * Porque descreve o que a plataforma é. É subtipo de `Organization`, então nada
 * se perde, e acrescenta a semântica que o `Course` das trilhas já pressupõe —
 * curso sem instituição é curso sem provedor.
 *
 * ## Por que NÃO há `SearchAction`
 *
 * A caixa de busca em resultado exige uma URL de busca que aceite o termo como
 * parâmetro. A plataforma tem paleta de comandos no cliente, e **não tem rota de
 * busca** — a `/search` foi removida no pivot de jul/2026. Declarar `SearchAction`
 * apontando para rota inexistente descreveria um recurso que não existe e
 * entregaria 404 a quem seguisse. Quando existir `/busca?q=`, entra aqui.
 *
 * ## Por que o `Person` tem `sameAs`
 *
 * É o sinal de experiência mais direto que um site de autor único tem: liga o
 * autor declarado a perfis verificáveis. Os três endereços abaixo são os que já
 * aparecem no site — não há perfil inventado aqui.
 */

export const BASE_URL = 'https://fernandofrancovalle.com';

/** `@id` estáveis. Mudar qualquer um destes quebra a ligação acumulada. */
export const ID = {
  organizacao: `${BASE_URL}/#organizacao`,
  site: `${BASE_URL}/#site`,
  autor: `${BASE_URL}/#fernando`,
} as const;

const ORGANIZACAO = {
  '@type': 'EducationalOrganization',
  '@id': ID.organizacao,
  name: 'FFV Academy',
  alternateName: 'Fernando Franco Valle Academy',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/icons/icon-512.png`,
    width: 512,
    height: 512,
  },
  description:
    'Escola em português de arquitetura de soluções AWS e IA em produção: Amazon Bedrock, ' +
    'Knowledge Bases, agents e AgentCore, 100 laboratórios de arquitetura e as certificações AWS. ' +
    'Conteúdo gratuito, com revisão espaçada e diagramas de arquitetura percorríveis.',
  inLanguage: 'pt-BR',
  founder: { '@id': ID.autor },
  sameAs: ['https://github.com/feh-franc0'],
};

const AUTOR = {
  '@type': 'Person',
  '@id': ID.autor,
  name: 'Fernando Franco Valle',
  url: `${BASE_URL}/sobre`,
  jobTitle: 'Engenheiro de software',
  description:
    'Engenheiro de software que escreve sobre arquitetura de soluções na AWS e IA em produção — ' +
    'o que está por baixo da abstração, não o hype em volta dela.',
  worksFor: { '@id': ID.organizacao },
  sameAs: [
    'https://github.com/feh-franc0',
    'https://www.linkedin.com/in/fehfranco/',
    'https://twitter.com/feh_franc0',
  ],
};

const SITE = {
  '@type': 'WebSite',
  '@id': ID.site,
  url: BASE_URL,
  name: 'FFV Academy',
  description:
    'Arquitete soluções de IA na AWS como engenheiro — Bedrock, Knowledge Bases, agents e os 100 ' +
    'laboratórios que provam cada decisão. Gratuito, gamificado e com revisão espaçada real.',
  inLanguage: 'pt-BR',
  publisher: { '@id': ID.organizacao },
  // `SearchAction` ausente de propósito — ver a nota no topo do arquivo.
};

/** O grafo do site. Emitido uma vez, no layout raiz. */
export const SITE_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [ORGANIZACAO, AUTOR, SITE],
};

/**
 * Referências para uso nas páginas.
 *
 * Página de conteúdo usa `{'@id': ...}` em vez de repetir o objeto — é o que faz
 * o buscador tratar as 415 páginas como obra da mesma escola e do mesmo autor.
 */
export const REF = {
  organizacao: { '@id': ID.organizacao },
  autor: { '@id': ID.autor },
  site: { '@id': ID.site },
} as const;
