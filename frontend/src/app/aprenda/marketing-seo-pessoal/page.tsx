import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('marketing-seo-pessoal');

const ACCENT = '#a78bfa';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é SEO pessoal e por que importa para profissionais?',
    options: [
      'Apenas para empresas e e-commerce — não se aplica a pessoas',
      'Otimizar a presença digital para que seu nome + nicho apareça no Google quando recrutadores, clientes ou parceiros pesquisam. "Quem é fulano?" é a primeira pesquisa antes de qualquer contato profissional sério',
      'Pagar Google Ads com seu nome para aparecer no topo',
      'Comprar links pagos em sites de referência',
    ],
    correct: 1,
    explanation:
      'Pesquisa de comportamento mostra que 87% dos recrutadores e 76% de clientes B2B pesquisam o nome no Google antes de fazer contato. O que aparece define percepção. Sem SEO pessoal, o Google mostra o que outros publicam (LinkedIn, posts antigos, perfis abandonados). Com SEO pessoal, você controla a narrativa: site pessoal, presença no GitHub, palestras, podcasts, artigos — tudo apontando para o seu nicho.',
  },
  {
    question: 'Qual é a estratégia mais eficaz para ranquear o seu nome no Google?',
    options: [
      'Pagar SEO especialista para fazer link building agressivo',
      'Site pessoal com domínio .com.br ou .dev contendo seu nome (joaosilva.dev), conteúdo regular focado no nicho (artigos, projetos, sobre), e perfis profissionais (LinkedIn, GitHub) bem otimizados — Google indexa naturalmente após 2-6 meses',
      'Postar diariamente em todas as redes sociais',
      'Comprar domínios com seu nome em todas as extensões',
    ],
    correct: 1,
    explanation:
      'Receita de SEO pessoal: (1) domínio próprio com nome (joaosilva.com.br ou joao.dev) — sites pessoais ranqueiam alto naturalmente; (2) conteúdo evergreen sobre seu nicho — Google adora artigos longos com profundidade; (3) backlinks de fontes boas (palestras, podcasts, posts em blogs grandes); (4) consistência por 6-12 meses. Em 1 ano, busca pelo seu nome mostra: site → LinkedIn → GitHub → podcasts/palestras — tudo controlado por você.',
  },
  {
    question: 'Como descobrir as palavras-chave que sua audiência busca em 2026?',
    options: [
      'Usar apenas intuição sobre o que é relevante',
      'Google Search Console (depois de ter site ativo), Ubersuggest grátis (3 buscas/dia), Answer The Public (perguntas reais sobre o tema), Ahrefs Keyword Generator gratuito, e o próprio Google "Pessoas também perguntam" e "Pesquisas relacionadas"',
      'Comprar listas prontas de keywords',
      'Apenas palavras-chave de cauda curta (1-2 palavras)',
    ],
    correct: 1,
    explanation:
      'Stack gratuito de keyword research em 2026: (1) Google Trends para sazonalidade; (2) Ubersuggest 3 buscas grátis/dia; (3) Answer The Public para perguntas reais; (4) Ahrefs Free Keyword Generator (10 keywords sem custo); (5) Google autocomplete + "People also ask". Foco em long-tail (3-5 palavras): menos volume mas menos concorrência e maior intenção de compra. "Como aprender Go para backend" supera "programação".',
  },
  {
    question: 'O que é E-E-A-T e como afeta SEO em 2026?',
    options: [
      'Acrônimo de Experience, Expertise, Authoritativeness, Trustworthiness — Google usa esses 4 critérios para julgar qualidade de conteúdo desde 2022 (atualizado com novo "E" de Experience em 2023). Conteúdo com experiência real declarada ranqueia melhor que conteúdo genérico de IA',
      'Sigla de e-mail marketing avançado',
      'Algoritmo descontinuado em 2024',
      'Tipo de schema markup específico',
    ],
    correct: 0,
    explanation:
      'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) é o framework do Google para avaliar qualidade de conteúdo. Em 2026, com explosão de conteúdo gerado por IA, E-E-A-T ficou ainda mais importante. Sinais positivos: nome do autor com credenciais, biografia clara, casos reais, experiência declarada, links para outros conteúdos do autor. Sinais negativos: conteúdo sem autoria clara, factualmente impreciso, ou genérico demais (estilo IA pura). Para SEO pessoal: site com /sobre detalhado + autoria clara em cada post.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="marketing-seo-pessoal"
      title="SEO Pessoal: ser encontrado no Google em 2026"
      icon="🔍"
      xp={65}
      readTime={12}
      trailName="Marketing Digital"
      trailColor={ACCENT}
      nextSlug="marketing-email-newsletter"
      nextTitle="Email & Newsletter: o canal de relacionamento mais valioso"
      relatedSlugs={['marketing-personal-branding', 'marketing-conteudo-autoridade', 'marketing-metricas']}
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
        Antes de qualquer contato profissional sério, alguém vai pesquisar seu nome no Google. O que
        aparece define se você é uma opção considerada ou descartada. SEO pessoal em 2026 é controle
        de narrativa: você decide o que aparece quando alguém busca seu nome + nicho. Esta aula mostra
        como fazer isso na prática.
      </p>

      <Section title="Auditoria do que o Google mostra do seu nome hoje" accent={ACCENT}>
        <CodeBlock lang="markdown">{`# Auditoria de presença digital — faça isso AGORA

[1] Aba anônima do navegador
- Buscar: "Seu Nome Completo"
- Buscar: "Seu Nome Completo + sua área"
- Buscar: "Seu Nome + sua cidade"

[2] Anote os 10 primeiros resultados
- Quais são positivos para você?
- Quais são neutros?
- Quais são negativos ou desatualizados?
- Quais NÃO são você (homônimos)?

[3] Avalie qualidade
✓ LinkedIn está atualizado e profissional?
✓ GitHub aparece e tem projetos?
✓ Há perfis antigos abandonados aparecendo?
✓ Posts ou comentários inadequados de anos atrás?

[4] Plano de ação
- Atualizar perfis ativos
- Deletar perfis abandonados (Twitter antigo, Facebook)
- Criar conteúdo positivo para empurrar conteúdo ruim
- Site pessoal para dominar primeira página`}</CodeBlock>
      </Section>

      <Section title="Site pessoal: a base do SEO pessoal" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Elemento', 'Boas práticas', 'Por que']}
          rows={[
            ['Domínio', 'nome.com.br ou nome.dev (R$50-100/ano)', 'Personalizado e indexável'],
            ['Stack', 'Next.js + Vercel ou Astro + Vercel (grátis)', 'SEO-friendly + rápido'],
            ['Sobre', 'Bio completa, experiência, especialidades', 'Google E-E-A-T'],
            ['Blog/Posts', '1-2 posts/mês com profundidade real', 'Conteúdo evergreen ranking'],
            ['Projetos', 'Cases com problema, solução, resultado', 'Provas de competência'],
            ['Contato', 'Email + LinkedIn + agenda (Cal.com)', 'Reduzir fricção para procurar'],
            ['Speed', 'Lighthouse 90+ em mobile', 'Core Web Vitals afetam ranking'],
          ]}
        />
        <Callout tone="info">
          <strong>Stack gratuito recomendado:</strong> Astro ou Next.js + Vercel (deploy gratuito) +
          domínio R$50-100/ano. Templates: Astro Theme Pro, Tailwind Nextjs Starter Blog. Tempo para
          ter site no ar: 4-8h sem experiência prévia.
        </Callout>
      </Section>

      <Section title="On-page SEO: o que cada artigo precisa" accent={ACCENT}>
        <LayerStack
          title="Checklist de SEO em cada artigo do site"
          accent={ACCENT}
          separatorLabel="otimizar tudo →"
          layers={[
            { label: 'Title tag (60 chars)', content: 'Palavra-chave principal nos primeiros 30 chars + benefício', note: 'aparece no Google', tone: 'writable' },
            { label: 'Meta description (155 chars)', content: 'Resumo + call to action — afeta CTR no Google', tone: 'writable' },
            { label: 'H1 único + H2/H3 estruturados', content: 'Hierarquia clara, palavras-chave naturais', tone: 'writable' },
            { label: 'URL slug curto', content: '/como-aprender-go-backend (não /post-123)', tone: 'writable' },
            { label: 'Alt text em imagens', content: 'Descrição real, palavra-chave se natural', tone: 'writable' },
            { label: 'Internal links', content: 'Linkar para outros posts do site', tone: 'writable' },
            { label: 'Schema markup', content: 'JSON-LD para Author, Article, BreadcrumbList', note: 'aparece em rich snippets', tone: 'success' },
          ]}
        />
        <CodeBlock lang="html">{`<!-- Schema.org Author + Article para SEO E-E-A-T -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Como Escalar Postgres em Produção",
  "author": {
    "@type": "Person",
    "name": "Fernando Franco",
    "url": "https://fernandofrancovalle.com",
    "jobTitle": "Senior Backend Engineer",
    "sameAs": [
      "https://linkedin.com/in/fernandofranco",
      "https://github.com/feh-franc0",
      "https://twitter.com/fernando_dev"
    ]
  },
  "datePublished": "2026-05-01",
  "dateModified": "2026-05-15"
}
</script>`}</CodeBlock>
      </Section>

      <Section title="Off-page SEO: backlinks que importam em 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de backlink', 'Esforço', 'Valor SEO']}
          rows={[
            ['Palestra em conferência (gravada)', 'Alto', 'Muito alto — autoridade'],
            ['Podcast como convidado', 'Médio', 'Alto — backlink + audiência'],
            ['Guest post em blog grande', 'Alto', 'Alto — domínio autoritativo'],
            ['Artigo no DEV.to ou Medium', 'Baixo', 'Médio — alta autoridade dos sites'],
            ['Comentário substancial em blog grande', 'Baixo', 'Baixo-médio — varia'],
            ['Citação em outros posts', 'Indireto', 'Alto — natural'],
            ['Listagem em "top 10 brazilian devs"', 'Variável', 'Alto — autoridade categórica'],
          ]}
        />
        <DecisionBox
          scenario="Construir SEO pessoal forte em 12 meses (do zero)"
          winner="Site próprio + 1 post/mês profundo + 2 podcasts/palestras por trimestre"
          winnerColor={ACCENT}
          why="Site dá controle total e indexa todo seu conteúdo. 1 post/mês profundo (3000+ palavras) é sustentável e gera ranking long-tail. Podcasts e palestras geram backlinks naturais de fontes autoritativas. Em 12 meses: primeira página do Google para nome + nicho."
          alternatives={[
            { name: 'Foco apenas em LinkedIn', note: 'Domina busca por "nome + LinkedIn" mas você não controla — risco de mudanças de algoritmo' },
            { name: 'Newsletter como canal principal', note: 'Audiência mais engajada, mas SEO depende dos arquivos públicos da newsletter' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="O Google penaliza conteúdo gerado por IA em 2026?"
          a={<>Não diretamente — o Google declarou em 2023 que conteúdo de IA é aceitável SE tiver E-E-A-T (qualidade, autoria, expertise). Na prática: conteúdo 100% IA sem revisão humana ranqueia mal porque tende a ser genérico, factualmente impreciso, e sem perspectiva única. Conteúdo de IA + edição substancial + adição de experiência pessoal funciona. Use IA como acelerador (outline, brainstorm, primeira versão), nunca como substituto da sua perspectiva e experiência. Sempre revise factualmente — IA inventa estatísticas e referências.</>}
        />
        <QAItem
          q="Como lidar com homônimos que aparecem no Google?"
          a={<>Estratégias: (1) site com seu nome + cidade ou nicho no domínio (joaosilva.dev, joaosilvasaopaulo.com.br); (2) conteúdo consistente que cria associação clara entre seu nome e nicho — Google entende contexto; (3) Schema.org Person markup com Job Title e Location explícitos; (4) construir presença em comunidades específicas do nicho (DEV.to, GitHub, GDG); (5) tempo — em 12-24 meses de conteúdo consistente, você domina busca pelo seu nome no contexto profissional, mesmo com homônimos.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> 87% dos recrutadores pesquisam seu nome antes de contato. SEO
        pessoal = controlar narrativa. Site próprio com domínio (.com.br ou .dev) é a base. E-E-A-T
        importa mais em 2026 com explosão de conteúdo IA. Stack gratuito: Astro + Vercel + Cloudflare.
        Backlinks de palestras e podcasts são os mais valiosos. Audite seu nome no Google hoje em
        aba anônima — descubra o que outros veem. 12 meses de conteúdo consistente = primeira página
        do Google.
      </Callout>
    </div>
  );
}
