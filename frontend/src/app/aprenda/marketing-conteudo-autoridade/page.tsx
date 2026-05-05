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

export const metadata = getModuleMetadata('marketing-conteudo-autoridade');

const ACCENT = '#a78bfa';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia conteúdo de autoridade de conteúdo comum?',
    options: [
      'Tamanho — autoridade exige conteúdo longo sempre',
      'Profundidade + experiência prática + opinião fundamentada. Conteúdo comum repete o que está no Google. Conteúdo de autoridade compartilha o que só quem fez DE VERDADE sabe — erros que cometeu, exceções aos padrões, edge cases reais',
      'Frequência — autoridade exige posts diários',
      'Volume de seguidores do criador',
    ],
    correct: 1,
    explanation:
      'Conteúdo de autoridade é "experience-based", não "research-based". Um post sobre "como escalar Postgres" escrito por alguém que escalou para 100M de rows com problema X específico vale infinitamente mais que post genérico de tutorial. Sinais de autoridade: números reais ("reduzimos latência de 800ms para 80ms"), erros específicos compartilhados, opiniões impopulares fundamentadas, e disposição para discordar do consenso quando a experiência mostra outra coisa.',
  },
  {
    question: 'Qual é o framework de criação de conteúdo educacional que mais converte autoridade?',
    options: [
      'Listicles — "10 dicas para X"',
      'Problem-Agitate-Solution-Proof: descreva problema específico que público tem, agite consequências de não resolver, mostre solução com método claro, prove com caso real ou números. Cada post deve seguir essa estrutura',
      'Inspiração + motivação',
      'Compartilhar notícias do mercado',
    ],
    correct: 1,
    explanation:
      'PASP (Problem-Agitate-Solution-Proof) é estrutura clássica de copywriting aplicada a conteúdo educacional. Funciona porque: problema específico atrai quem tem aquele problema, agitação ativa emoção (não só razão), solução entrega valor, prova torna conteúdo memorável e crível. Exemplo: "Seu deploy demora 40min? (problema). Isso gasta 5h/semana do time inteiro (agita). Resolva com cache de Docker layers (solução). Reduzimos para 8min seguindo passos X, Y, Z (prova)."',
  },
  {
    question: 'Como construir biblioteca de conteúdo evergreen que continua trazendo audiência por anos?',
    options: [
      'Postar sobre tendências do momento sempre',
      'Criar conteúdo focado em problemas perenes (não trends): tutoriais técnicos, frameworks de pensamento, guias completos. Otimizar para SEO + manter atualizado. Conteúdo evergreen tem cauda longa de meses ou anos — investimento único, retorno contínuo',
      'Apenas vídeos curtos — eles têm vida mais longa',
      'Republicar mesmo conteúdo várias vezes',
    ],
    correct: 1,
    explanation:
      'Conteúdo evergreen: aborda problemas que não mudam ao longo do tempo. Exemplos: "Como pensar sobre arquitetura de microsserviços", "Princípios de escalabilidade", "Como entrevistar para senior dev". Vs trends que duram semanas. Estratégia: 70% evergreen + 30% trends. SEO é essencial para evergreen — palavra-chave certa traz tráfego anos depois. Atualize anualmente: revise conteúdo do ano passado, atualize números, screenshots, exemplos. Conteúdo de 2 anos atrás bem mantido pode trazer mais tráfego que post novo.',
  },
  {
    question: 'Como medir se seu conteúdo está construindo autoridade real?',
    options: [
      'Número de likes e seguidores',
      'Indicadores de autoridade: convites para palestrar, citações em outros conteúdos, DMs perguntando opinião sobre temas complexos, oportunidades de consultoria, e taxa de "save" alta nos posts. Likes são vaidade, esses são autoridade',
      'Volume total de visualizações',
      'Tempo gasto criando conteúdo',
    ],
    correct: 1,
    explanation:
      'Métricas de vaidade: likes, seguidores, views. Métricas de autoridade: convites para palestrar (alguém te quer no palco da conferência), citações ("como o X disse..."), oportunidades inbound qualificadas (clientes/empregos chegam até você), conversões em produtos (curso, mentoria), savings rate (pessoas salvam para ler depois indica valor real). Foco: maximizar autoridade, não vaidade. Post com 50 likes e 200 saves vale mais que post com 5000 likes e 0 saves.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="marketing-conteudo-autoridade"
      title="Conteúdo de Autoridade: virar referência no nicho em 2026"
      icon="🎯"
      xp={70}
      readTime={12}
      trailName="Marketing Digital"
      trailColor={ACCENT}
      nextSlug="marketing-seo-pessoal"
      nextTitle="SEO Pessoal: ser encontrado no Google em 2026"
      relatedSlugs={['marketing-personal-branding', 'conteudo-linkedin-criador', 'comunicacao-storytelling']}
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
        Mercado saturado de conteúdo, mas escassez de conteúdo COM AUTORIDADE. Em 2026, com IA gerando
        infinito conteúdo medíocre, a vantagem competitiva é experiência real + perspectiva única.
        Esta aula mostra como criar conteúdo que faz pessoas pararem o scroll, salvarem para reler,
        e compartilharem com seus times — porque traz insights que IA não consegue.
      </p>

      <Section title="Anatomia do conteúdo de autoridade" accent={ACCENT}>
        <CodeBlock lang="markdown">{`# Framework PASP — Problem, Agitate, Solution, Proof

[PROBLEM] Específico, sentido pelo público
"Seu time gasta 5h/dia em reuniões mas decisões não saem."

[AGITATE] Consequências de não resolver
"Cada decisão atrasada custa em motivação,
deadline perdido e talentos pedindo demissão."

[SOLUTION] Método específico, executável
"Implemente o RAPID framework:
- Recommend (1 pessoa)
- Agree (vetos críticos)
- Perform (executores)
- Input (consultores)
- Decide (decisor único)"

[PROOF] Caso real, números, antes/depois
"Aplicamos no time de 12 devs em 2024.
Reuniões caíram de 18h/semana para 6h.
Decisões saem em 1-3 dias vs 2-3 semanas."`}</CodeBlock>
      </Section>

      <Section title="Os 7 tipos de conteúdo que constroem autoridade" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Exemplo de título', 'Por que funciona']}
          rows={[
            ['Caso real (B/A)', '"De 800ms para 80ms: como reescrevemos a query principal"', 'Números + processo + resultado'],
            ['Opinião contraintuitiva', '"Microsserviços para 3 devs é overengineering"', 'Polariza, gera debate'],
            ['Framework próprio', '"O ciclo PASP de criação de conteúdo"', 'Modelo nomeado por você'],
            ['Erro caro compartilhado', '"O bug que custou 200k em produção"', 'Vulnerabilidade + lição'],
            ['Comparação detalhada', '"Postgres vs MySQL: 5 diferenças que importam em 2026"', 'Útil para decisão real'],
            ['Predição com base', '"3 mudanças que IA vai trazer para devs em 2026"', 'Tese forte fundamentada'],
            ['Tutorial avançado', '"Configurando observabilidade completa em Go com OpenTelemetry"', 'Profundidade técnica'],
          ]}
        />
      </Section>

      <Section title="Pipeline de produção de conteúdo de autoridade" accent={ACCENT}>
        <LayerStack
          title="Da ideia ao post viral"
          accent={ACCENT}
          separatorLabel="próxima fase →"
          layers={[
            { label: 'Banco de ideias contínuo', content: 'Notion com 100+ ideias — conversas, dúvidas, erros, insights da semana', note: 'nunca trave por falta de tema', tone: 'writable' },
            { label: 'Validação rápida', content: 'Tweet/comentário curto sobre o tema — se gera engagement, vira post longo', tone: 'writable' },
            { label: 'Estrutura (PASP)', content: '15 minutos para esqueletar o post seguindo framework', tone: 'writable' },
            { label: 'Primeira versão (90min)', content: 'Escrever sem editar — depois revisar', tone: 'writable' },
            { label: 'Edição agressiva', content: 'Cortar 30% — frases longas → curtas, jargão → simples', tone: 'writable' },
            { label: 'Publicação otimizada', content: 'Hook testado + horário ideal + responder comentários', note: 'Golden Hour é crítica', tone: 'success' },
          ]}
        />
        <DecisionBox
          scenario="Criar conteúdo de autoridade trabalhando full-time como CLT"
          winner="2 posts substanciais por semana + 5 comentários/dia em posts grandes"
          winnerColor={ACCENT}
          why="2 posts profundos superam 7 superficiais. Comentários substantivos em posts grandes da área pré-aquecem o algoritmo a te associar com tópicos. Total: 5-7h/semana de investimento real, sustentável por anos. Quem tenta 7 posts/semana queima em 2 meses."
          alternatives={[
            { name: 'Newsletter mensal profunda', note: '1 post longo e completo por mês — para quem prefere texto longo e domínio mais lento mas profundo' },
            { name: 'Dupla de criação (parceiro)', note: 'Dividir produção com pessoa do mesmo nicho — feedback mútuo e mais consistência' },
          ]}
        />
      </Section>

      <Section title="Ferramentas para acelerar produção" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'Função', 'Preço']}
          rows={[
            ['Notion', 'Banco de ideias + calendário editorial', 'Grátis'],
            ['ChatGPT/Claude', 'Brainstorm + revisão de copy + outline', 'US$20/mês'],
            ['Hemingway Editor', 'Análise de legibilidade do texto', 'Grátis (web)'],
            ['Grammarly', 'Correção de gramática (PT-BR limitado)', 'Grátis-US$30/mês'],
            ['LanguageTool', 'Correção PT-BR superior', 'Grátis-US$60/ano'],
            ['Otter.ai', 'Transcrição para reaproveitar áudio em texto', 'Grátis-US$17/mês'],
            ['Tweet Hunter / Taplio', 'Análise de competidores + scheduler', 'US$39+/mês'],
          ]}
        />
      </Section>

      <Section title="Reaproveitamento (1 ideia → 5 conteúdos)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Origem', 'Reaproveitamentos possíveis']}
          rows={[
            ['Post LinkedIn longo', 'Carrossel visual + Tweet thread + Reel falado + Newsletter + Vídeo YouTube'],
            ['Live de 1h', '5-10 cortes para Reels/Shorts + Post LinkedIn + Newsletter + Artigo de blog'],
            ['Conversa com cliente', 'Story personal + framework + post de aprendizado + caso de estudo'],
            ['Tutorial em vídeo', 'Artigo blog SEO + thread Twitter + carrossel resumo + post LinkedIn'],
            ['Erro caro', 'Post de aprendizado + framework para evitar + tutorial de prevenção'],
          ]}
        />
        <Callout tone="info">
          <strong>Princípio do reaproveitamento:</strong> 1 ideia profunda gera conteúdo para 1-2
          semanas em todas as redes. Trabalhe em ideias profundas, não em volume superficial.
          Criadores que reaproveitam ganham 5-10x mais output sem mais tempo.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como criar conteúdo de autoridade sem ter anos de experiência ainda?"
          a={<>Autoridade não exige seniority — exige perspectiva única. Junior pode ter autoridade em "como aprender X rapidamente" ou "armadilhas que eu cometi sendo júnior". Documente sua jornada de aprendizado em tempo real. Pesquisas mostram que conteúdo de "build in public" (construindo em público) gera 3x mais engagement que conteúdo de "expert teaching". Exceção: temas onde experiência é literalmente requisito (gestão de crise, liderança em escala) — espere ter histórias reais antes de opinar.</>}
        />
        <QAItem
          q="Como reagir quando alguém discorda agressivamente do meu conteúdo?"
          a={<>Discórdia é sinal de que seu conteúdo tem opinião — bom. Estratégia: (1) responda apenas argumentos com substância; (2) ignore ataques pessoais (drenam energia, não convertem); (3) se você estava errado, admita publicamente — admitir erro publicamente AUMENTA autoridade; (4) se a discórdia traz nuance que enriquece o tema, agradeça e incorpore na próxima versão. Nunca delete comentários discordantes (apenas ofensas). Discussão pública saudável atrai audiência qualificada.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Conteúdo de autoridade = experiência real + perspectiva única.
        Framework PASP (Problem-Agitate-Solution-Proof) estrutura cada post. Casos reais com números
        valem mais que opinião abstrata. Métricas de autoridade (saves, DMs qualificadas, convites)
        importam mais que likes. 1 ideia profunda → 5-10 conteúdos por reaproveitamento. Polarize
        com opinião fundamentada. Atualizar conteúdo evergreen anualmente multiplica vida útil.
      </Callout>
    </div>
  );
}
