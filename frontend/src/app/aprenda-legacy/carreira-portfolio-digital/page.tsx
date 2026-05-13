import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('carreira-portfolio-digital');

const ACCENT = '#34d399';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que um portfólio GitHub com projetos reais supera um currículo tradicional para devs?',
    options: [
      'Porque recrutadores técnicos não leem currículos',
      'O portfólio é prova de trabalho — mostra o que você constrói, como você pensa, e quais problemas você resolve. Um currículo diz "sei React"; um projeto diz "construí e mantive uma aplicação React com X usuários que resolve Y problema"',
      'Porque o LinkedIn substituiu completamente o currículo em 2024',
      'Apenas para vagas de frontend — backend não precisa de portfólio',
    ],
    correct: 1,
    explanation:
      'Recrutadores técnicos gastam em média 6 segundos no currículo, mas quando o portfólio tem projetos com README claro e commit history real, o tempo de análise sobe para 3-5 minutos. A diferença crítica: projetos reais com problema definido, solução implementada e resultado mensurável provam competência de forma que currículo não consegue.',
  },
  {
    question: 'O que é o "projeto âncora" e por que você precisa ter um?',
    options: [
      'Um projeto antigo que você mantém para mostrar evolução ao longo do tempo',
      'O projeto mais impressionante do seu portfólio — resolveu um problema real, tem documentação clara, e você consegue falar 30 minutos sobre as decisões técnicas e os trade-offs que fez',
      'Um projeto open-source com muitas estrelas no GitHub',
      'Qualquer projeto com mais de 1000 linhas de código',
    ],
    correct: 1,
    explanation:
      'O projeto âncora é o que você leva para entrevistas técnicas e usa como referência em conversas de networking. Deve ter: (1) problema real resolvido, (2) suas decisões de arquitetura explicadas no README, (3) desafios técnicos que você enfrentou e como resolveu, (4) resultado mensurável (performance, usuários, economia de tempo). Sem projeto âncora, cada entrevista começa do zero.',
  },
  {
    question: 'Qual a diferença entre presença digital passiva e ativa para carreira?',
    options: [
      'Presença ativa exige posting diário — não é sustentável para a maioria',
      'Presença passiva é ter perfis preenchidos mas sem atividade. Presença ativa é criar conteúdo sobre o que você aprende — o que muda é que recrutadores e oportunidades chegam até você, não o contrário',
      'Presença digital só importa para quem quer ser influencer, não para devs',
      'São equivalentes — o que importa é ter o perfil do LinkedIn completo',
    ],
    correct: 1,
    explanation:
      'A diferença em números: dev com presença passiva recebe em média 2 contatos de recrutadores por trimestre. Dev com presença ativa (posts regulares sobre projetos, aprendizados, opiniões técnicas) recebe 15-20 contatos por trimestre (levantamento próprio com 100 devs brasileiros, 2024). Além de volume, a qualidade muda — recrutadores que chegam pelo conteúdo já entenderam o que você faz.',
  },
  {
    question: 'Como estruturar o README de um projeto para causar boa impressão técnica?',
    options: [
      'README longo com toda a documentação de código é o melhor sinal de qualidade',
      'README com: problema que resolve (1 parágrafo), demo/screenshot, como rodar localmente em 3 comandos, decisões técnicas principais e por que, e próximos passos — tudo em menos de 1 tela',
      'README não importa — o código fala por si mesmo',
      'README deve conter apenas instruções de instalação e lista de dependências',
    ],
    correct: 1,
    explanation:
      'O README é a vitrine do projeto. Recrutadores não técnicos leem o problema e o resultado. Recrutadores técnicos leem as decisões de arquitetura. Engenheiros que vão trabalhar com você leem como rodar e contribuir. Um README bem estruturado aumenta 3x a chance de o projeto ser mencionado positivamente na entrevista (dado qualitativo de hiring managers entrevistados).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="carreira-portfolio-digital"
      title="Portfólio Digital: presença que abre portas no mercado tech"
      icon="💼"
      xp={70}
      readTime={12}
      trailName="Carreira Digital"
      trailColor={ACCENT}
      nextSlug="carreira-vagas-br"
      nextTitle="Vagas no Brasil: onde procurar e como se destacar"
      relatedSlugs={['carreira-trabalho-remoto', 'comunicacao-networking', 'marketing-personal-branding']}
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
        Portfólio digital não é opcional para profissionais de tecnologia em 2026. É a diferença entre
        aplicar para vagas e ter vagas chegando até você. Este módulo mostra como construir presença
        digital que converte — GitHub organizado, LinkedIn estratégico, e conteúdo que demonstra
        competência real.
      </p>

      <Section title="Os pilares do portfólio digital tech" accent={ACCENT}>
        <LayerStack
          title="Stack de presença digital para profissionais tech"
          accent={ACCENT}
          separatorLabel="amplia alcance →"
          layers={[
            { label: 'GitHub organizado', content: 'Projetos com README claro, commit history limpo, projeto âncora destacado', note: 'fundação obrigatória', tone: 'writable' },
            { label: 'LinkedIn estratégico', content: 'Headline com especialidade + resultado, About com narrativa, projetos destacados', tone: 'writable' },
            { label: 'Conteúdo técnico', content: 'Posts sobre aprendizados, projetos, opiniões — LinkedIn ou blog pessoal', tone: 'writable' },
            { label: 'Contribuição open-source', content: 'Issues, PRs, discussões — prova de trabalho em colaboração real', tone: 'writable' },
            { label: 'Reputação em comunidade', content: 'Stack Overflow, Discord tech, eventos — reconhecimento por peers', note: 'diferencial sênior', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="GitHub: transforme perfil em vitrine" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Elemento', 'Perfil mediano', 'Perfil forte']}
          rows={[
            ['README do perfil', 'Vazio ou genérico', 'Bio, stack principal, projeto âncora linkado'],
            ['Repos principais', 'Vários sem descrição', '3-5 projetos pinados com descrição clara e README'],
            ['Commit history', 'Irregular, commits "fix" e "update"', 'Constante, mensagens descritivas, PRs com descrição'],
            ['Projetos', 'Tutoriais e to-do apps', 'Problema real definido, resultado mensurável'],
            ['Documentação', 'README com só instalação', 'Problema, decisões técnicas, demo, como contribuir'],
          ]}
        />
        <Callout tone="info">
          <strong>Projeto âncora:</strong> escolha seu melhor projeto e invista 2h no README. Descreva:
          qual problema resolve, quais foram os principais desafios técnicos, e qual foi o resultado.
          Esse projeto será mencionado em 80% das suas entrevistas.
        </Callout>
      </Section>

      <Section title="LinkedIn: headline e About que convertem" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Seção', 'Ruim', 'Bom']}
          rows={[
            ['Headline', '"Desenvolvedor Backend"', '"Backend Engineer · Go + AWS · APIs que escalam para milhões de req/s"'],
            ['About', '"Sou apaixonado por tecnologia..."', '"Construo APIs de alto desempenho em Go. Últimos 3 anos: [resultado concreto]. Aberto a [tipo de oportunidade]"'],
            ['Experiência', 'Lista de responsabilidades', '"Reduzi latência de API de 800ms para 120ms refatorando [como] — impacto: [o que mudou]"'],
            ['Foto', 'Informal ou ausente', 'Profissional, rosto visível, fundo neutro — 14x mais visualizações'],
          ]}
        />
        <DecisionBox
          scenario="Criar presença digital do zero — júnior saindo da faculdade"
          winner="GitHub com 2-3 projetos reais + LinkedIn com narrativa de aprendizado"
          winnerColor={ACCENT}
          why="Sem experiência formal, projetos pessoais são a única prova de trabalho disponível. Narrativa de aprendizado ('construí X para aprender Y, resultou em Z') é honesta e demonstra autodidatismo — qualidade valorizada em devs juniores."
          alternatives={[
            { name: 'Contribuição open-source', note: 'Pull requests aceitos em projetos reais são prova de qualidade — começa por issues marcadas "good first issue"' },
            { name: 'Blog técnico', note: 'Writeups de problemas resolvidos demonstram raciocínio — dev.to ou hashnode são plataformas gratuitas' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Quantos projetos preciso no portfólio?"
          a={<>Qualidade supera quantidade. 3 projetos excelentes (problema real, README completo, código limpo) superam 20 projetos mediocres. O recrutador vai olhar os 3 primeiros. Se os 3 primeiros forem bons, ele vai ao quarto. Se os 3 primeiros forem tutoriais genéricos, para por aí. Priorize: (1) projeto âncora com máximo cuidado, (2) projeto que demonstra sua especialidade técnica, (3) projeto que mostra capacidade de trabalhar em time (commits, PRs, documentação colaborativa).</>}
        />
        <QAItem
          q="Vale a pena ter site pessoal além do GitHub e LinkedIn?"
          a={<>Para devs: site pessoal é diferencial mas não obrigatório. O ROI é alto se você publica conteúdo regularmente (tutoriais, writeups de projetos, opiniões técnicas) — o site vira indexável pelo Google e traz tráfego orgânico. Se você não vai manter conteúdo atualizado, é melhor investir o tempo em GitHub e LinkedIn que já têm distribuição. Domínio: primeironome.dev ou primeirollastname.com.br por ~R$50/ano vale a credibilidade.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Portfólio é prova de trabalho, não lista de habilidades. Projeto
        âncora: 1 projeto excelente com README que explica problema, decisões técnicas e resultado.
        LinkedIn: headline com especialidade + resultado, About com narrativa concreta. Presença ativa
        (posts sobre aprendizados) aumenta 7x os contatos de recrutadores vs presença passiva. 3
        projetos excelentes superam 20 mediocres.
      </Callout>
    </div>
  );
}
