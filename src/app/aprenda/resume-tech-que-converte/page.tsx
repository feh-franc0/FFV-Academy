import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('resume-tech-que-converte');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual estrutura de bullet converte em entrevista?',
    options: [
      'Verbo + tarefa',
      'Action + contexto + metrica quantificada: "migrei pipeline ETL de Airflow para dbt reduzindo tempo de ingestao de 6h para 40min e custo cloud em 35%"',
      'Apenas tecnologia usada',
      'Descricao floreada',
    ],
    correct: 1,
    explanation: 'Recruiter tecnico escaneia resume em 20-40 segundos. Bullet sem metrica vira ruido. Padrao X-Y-Z do Google (accomplished X as measured by Y by doing Z) ou Action-Impact-How sao equivalentes. Sem numero, palavra de hype vira vazio.',
  },
  {
    question: 'Qual erro mais comum em resume tech?',
    options: [
      'Usar LaTeX',
      'Listar stack inteira sem recorte: 40 tecnologias sem indicar fluencia real — sinaliza buzzword spam. Limite a 8-12 que voce sustenta em entrevista tecnica',
      'Colocar email',
      '1 pagina',
    ],
    correct: 1,
    explanation: 'Recruiter senior filtra resume com stack enorme porque sabe que e ruido. Melhor 8 tecnologias que voce domina + 3 de familiaridade declaradas explicitamente. ATS (Workday, Greenhouse, Lever) ranqueia por keyword — mas o humano decide, entao honestidade vence.',
  },
  {
    question: 'O que e ATS-friendly sem sacrificar design?',
    options: [
      'Usar Word 2003',
      'PDF gerado de LaTeX ou HTML com tipografia classica, sem tabelas complexas, sem coluna dupla em secoes densas, fontes padrao (Inter, Helvetica, Computer Modern). Texto continua selecionavel e parseavel',
      'Apenas texto puro',
      'Imagem scaneada',
    ],
    correct: 1,
    explanation: 'ATS moderno (Greenhouse, Lever, Workday) parseia PDF bem se layout nao e desenho. Evite imagens, icones decorativos, colunas duplas em Experience. Exporte de overleaf.com/awesome-cv ou typst. Teste abrindo o PDF e fazendo Ctrl+A — se o texto vem fora de ordem, ATS vai ler errado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="resume-tech-que-converte"
      title="Resume tech que converte"
      icon="📄"
      xp={45}
      readTime={10}
      trailName="Career Engineering"
      trailColor={accent}
      nextSlug="linkedin-dev-pratico"
      nextTitle="LinkedIn dev pratico (sem hype)"
      quiz={quiz}
    >
      <Section title="Estrutura de uma pagina" accent={accent}>
        <CodeBlock lang="markdown">{`Header              nome | email | github | linkedin | site | cidade
Sumario (opcional)  2 linhas descrevendo perfil senior+
Experiencia         3-5 cargos, 3-5 bullets cada
Projetos            2-3 com link e 1-2 bullets de impacto
Educacao            instituicao + ano (1 linha)
Skills              8-12 tecnologias que voce sustenta em live coding`}</CodeBlock>
        <Callout tone="info">
          Para senior+ com 5+ anos, educacao vira rodape. Experiencia e projetos sao o que converte. Se voce e junior/early career, invert — educacao + projetos + trabalhos curtos.
        </Callout>
      </Section>

      <Section title="Template de bullet com impacto quantificado" accent={accent}>
        <CodeBlock lang="markdown">{`Padrao X-Y-Z (Google):
  Accomplished [X] as measured by [Y] by doing [Z].

Exemplos reais (portugues):
  - Reduzi p95 de checkout de 820ms para 180ms reescrevendo
    camada de agregacao em Go, sustentando 3x o trafego durante
    Black Friday.
  - Migrei 40 servicos Node de AWS Lambda para ECS Fargate,
    cortando custo mensal em USD 18k e reduzindo cold start p99
    de 3.2s para 120ms.
  - Lancei sistema de feature flags in-house integrado a
    PostHog, permitindo 12 experimentos simultaneos e
    acelerando decisoes de produto em 40% (time-to-decision
    medido em sprints).
  - Reescrevi job de dedup de eventos (Kafka -> ClickHouse)
    em Rust, reduzindo lag de 15min para &lt; 30s e CPU em 60%.`}</CodeBlock>
      </Section>

      <Section title="Bullet anti-pattern (nao fazer)" accent={accent}>
        <CodeBlock lang="markdown">{`RUIM
  - Team player que trabalhou em varios projetos.
  - Responsavel pelo backend.
  - Utilizei React, Node, Python, Go, Rust, Java, C#, Kotlin,
    Swift, Elixir, Haskell, AWS, GCP, Azure, k8s, terraform,
    docker, kafka, redis, postgres, mongo, cassandra.

POR QUE RUIM
  - &quot;Team player&quot; = adjetivo vazio, nao mede nada.
  - &quot;Responsavel pelo backend&quot; = qual sistema? com que impacto?
  - Stack dump sinaliza buzzword farming, reduz credibilidade.`}</CodeBlock>
      </Section>

      <Section title="Formato tecnico (LaTeX/typst/HTML)" accent={accent}>
        <CodeBlock lang="markdown">{`Opcoes testadas:
  - awesome-cv (LaTeX, overleaf.com) — classico, ATS-friendly
  - typst-resume (typst) — moderno, compila em 200ms local
  - resume.io / standardresume — rapido, exporta PDF limpo
  - HTML + wkhtmltopdf — total controle, exige design eye

Regras:
  - 1 pagina para ate ~10 anos de carreira
  - 2 paginas so se principal/staff com muitos papers/patents
  - Fonte 10-11pt corpo, 12-14pt titulos, margens 0.75in
  - Data no formato mes-ano (Mar 2024 - Jan 2026)
  - URLs encurtadas mas verificaveis (github.com/user, nao bit.ly)`}</CodeBlock>
      </Section>

      <Section title="Checklist antes de enviar" accent={accent}>
        <Callout tone="success">
          (1) Cada bullet tem verbo de acao e numero. (2) Stack tem no max 12 items. (3) PDF com Ctrl+A preserva ordem. (4) Nome e email legiveis em 200% zoom. (5) Ate 600kb. (6) Filename: NomeSobrenome-Resume-2026.pdf.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
