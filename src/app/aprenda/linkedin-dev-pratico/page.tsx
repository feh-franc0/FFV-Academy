import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('linkedin-dev-pratico');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Como escrever headline que nao soa hype?',
    options: [
      'Listar emojis e frases de guru',
      'Descrever o que voce faz e para quem, sem adjetivos inflados: &quot;Staff Engineer @ Nubank — plataforma de pagamentos, distributed systems em Go/Kotlin&quot;',
      '&quot;Rockstar ninja developer&quot;',
      'Deixar em branco',
    ],
    correct: 1,
    explanation: 'Headline = primeira impressao em busca de recruiter. Objetivo: contexto + stack + dominio. Headlines hiperboles (&quot;passionate transformational leader&quot;) sinalizam marketing vazio para engenheiro tecnico. Linguagem direta converte melhor para perfil dev senior.',
  },
  {
    question: 'Qual a estrategia de engagement mais saudavel?',
    options: [
      'Postar diariamente sem parar',
      'Engajamento genuino: comentarios substantivos em posts de tecnicos que voce respeita, compartilhar aprendizado real (post/reply/replay) com cadencia sustentavel — melhor 2 posts/mes densos do que 30 rasos',
      'Seguir 10k pessoas',
      'So curtir',
    ],
    correct: 1,
    explanation: 'Gergely Orosz, Will Larson e Tanya Reilly cresceram audiencia tecnica sem farming. Padrao: share de aprendizado real (curto ou longo), comentar em posts tecnicos sem self-promotion, evitar ragebait. Algoritmo LinkedIn favorece engagement — mas hiring manager filtra ragebait como red flag.',
  },
  {
    question: 'Open to work badge roxo — quando usar?',
    options: [
      'Sempre',
      'Evitar em geral para senior+. Sinaliza desespero mesmo quando nao e. Prefira configurar visibilidade so para recruiters (opcao invisivel), editar About indicando disponibilidade discretamente',
      'Pagar para usar',
      'Obrigatorio',
    ],
    correct: 1,
    explanation: 'O badge publico reduz leverage em negotiation (recruiter sabe que voce busca) e gera pool de contatos com qualidade baixa. A opcao privada (&quot;share with recruiters only&quot;) oferece sinal sem comprometer percebida opcionalidade. Usar badge publico faz sentido em transicoes agressivas de nivel junior/mid.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="linkedin-dev-pratico"
      title="LinkedIn dev pratico (sem hype)"
      icon="💼"
      xp={40}
      readTime={9}
      trailName="Career Engineering"
      trailColor={accent}
      nextSlug="behavioral-interview-prep"
      nextTitle="Behavioral interview: STAR + brag doc"
      quiz={quiz}
    >
      <Section title="Perfil minimo viavel" accent={accent}>
        <CodeBlock lang="markdown">{`Foto       headshot recente, fundo neutro, 400x400+
Headline   cargo + empresa + stack + dominio
           ex: Senior Engineer @ Stripe — Go, k8s, payments infra
Banner     simples (codigo borrado, cidade, logo discreto)
About      3-4 paragrafos: quem e, trajetoria, o que busca
Featured   3-5 links (projetos, talks, posts, open source)
Experiencia mesma linguagem do resume, bullets quantificados
Skills     endorsements de colegas (reais, nao troca)
Education  instituicao + ano, sem notas`}</CodeBlock>
      </Section>

      <Section title="About: template direto" accent={accent}>
        <CodeBlock lang="markdown">{`Sou engenheiro de software com 8 anos focado em distributed systems
e plataforma interna. Hoje trabalho no time de [area] na [empresa],
onde conduzi [projeto concreto] com impacto [metrica].

Fluencia tecnica: Go, Rust, Kafka, Postgres, k8s, AWS. Leitor
constante em areas de SRE, platform engineering e eval de LLM.

Escrevo sobre o que aprendo em [blog/link]. Contribuicoes open
source em [projeto], palestras em [evento].

Disponibilidade: aberto a conversar sobre papeis staff+ remotos
ou hibridos em SP. Prefiro contato via email [email].`}</CodeBlock>
        <Callout tone="info">
          About escrito em primeira pessoa soa humano. Evite terceira pessoa estilo &quot;Fernando e um&quot;, soa curriculo corporativo dos anos 2000. Termine com CTA claro de contato.
        </Callout>
      </Section>

      <Section title="Engagement sustentavel" accent={accent}>
        <CodeBlock lang="markdown">{`CADENCIA SAUDAVEL
  1-2 posts densos por mes (aprendizado real, lesson learned)
  5-10 comentarios substantivos em posts tecnicos por semana
  1 share com comentario proprio por semana (bom recurso que
  voce endossa)

FORMATOS QUE FUNCIONAM
  - Lesson learned apos incidente/projeto (sem NDA quebrado)
  - Review tecnica curta de ferramenta/livro
  - Thread sobre decisao de arquitetura com trade-off honesto

FORMATOS QUE QUEIMAM REPUTACAO
  - Ragebait (&quot;90% dos devs nao sabem X&quot;)
  - Humble brag (&quot;acabei de receber oferta de 7 digitos&quot;)
  - Tutorial generico reciclado (ChatGPT spam)`}</CodeBlock>
      </Section>

      <Section title="Sinalizar disponibilidade sem queimar leverage" accent={accent}>
        <Callout tone="warn">
          Open to work visivel a todos reduz margem em negotiation. Opcao recomendada: ativar &quot;let recruiters know&quot; (visivel so a recruiters), mencionar discretamente em About (&quot;aberto a conversar&quot;), manter perfil ativo. Recruiters veem, network nao sabe que voce esta saindo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
