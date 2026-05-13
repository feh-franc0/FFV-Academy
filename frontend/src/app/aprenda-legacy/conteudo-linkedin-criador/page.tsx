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

export const metadata = getModuleMetadata('conteudo-linkedin-criador');

const ACCENT = '#fb923c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o algoritmo do LinkedIn em 2026 e o que ele prioriza?',
    options: [
      'Cronológico — mostra os posts mais recentes primeiro',
      'Algoritmo baseado em "dwell time" (tempo que cada usuário fica no post) e "meaningful interactions" (comentários longos > likes). Posts com 3+ comentários nos primeiros 60 minutos são amplificados para 10x mais alcance',
      'Apenas posts pagos têm alcance significativo',
      'O algoritmo prioriza vídeos sobre todos os outros formatos',
    ],
    correct: 1,
    explanation:
      'LinkedIn 2026 mede engajamento por qualidade: dwell time (3+ segundos lendo), comentários longos (15+ palavras), saves e shares. Likes têm peso baixo. A "Golden Hour": primeiros 60min após publicação determinam alcance final. Posts que recebem 5-10 comentários substantivos no início viralizam. Estratégia: peça pergunta no fim do post, responda TODOS os comentários nas primeiras 2h.',
  },
  {
    question: 'Qual formato de post tem melhor performance no LinkedIn em 2026?',
    options: [
      'Imagens com frases motivacionais — sempre funcionou',
      'Texto longo (1300-2000 caracteres), formato de "story" pessoal com aprendizado profissional. Carrosséis em PDF (máx 12 slides) também performam muito bem para conteúdo educacional',
      'Vídeos curtos no estilo TikTok',
      'Apenas posts compartilhando links de artigos',
    ],
    correct: 1,
    explanation:
      'Dados internos LinkedIn 2024-2025: text-only posts têm 2x mais alcance médio que posts com link externo (LinkedIn penaliza links que tiram usuário da plataforma). Carrosséis (PDF) têm o maior dwell time pois forçam swipe. Vídeo nativo curto (30-90s) cresce mas ainda atrás de texto+carrossel. Pior: link externo no corpo do post (penalização). Solução: link no primeiro comentário, não no post.',
  },
  {
    question: 'Qual é a estrutura de "hook" que faz LinkedIn parar o scroll?',
    options: [
      'Começar com "Olá, pessoal!" e contexto profissional',
      'Primeira linha curta (5-10 palavras), provocativa ou contraintuitiva, que faz o usuário clicar "ver mais". As 3 primeiras linhas aparecem antes do "see more" — devem criar tensão ou curiosidade',
      'Sempre começar com emoji para chamar atenção',
      'Listar credenciais profissionais nas primeiras linhas',
    ],
    correct: 1,
    explanation:
      'Apenas as primeiras 2-3 linhas aparecem no feed antes do "ver mais". Hook ruim: "Hoje quero compartilhar minha experiência sobre liderança". Hook bom: "Demitimos um sênior e a equipe ficou mais produtiva." Padrões testados: contradição ("o que parece óbvio é falso"), número específico ("ganhei R$23k em um mês fazendo X"), pergunta provocativa ("você está cometendo este erro de carreira?"), confissão ("errei feio em 2024").',
  },
  {
    question: 'Como crescer de 0 a 10k seguidores no LinkedIn em 2026?',
    options: [
      'Postar todos os dias por 6 meses sem interromper',
      'Consistência (3-5 posts/semana), comentários em posts grandes da sua área (pré-aquecimento de algoritmo), e foco em 1 nicho específico — não posts genéricos. Crescimento típico: 0→1k em 3 meses, 1k→10k em 9-15 meses',
      'Comprar seguidores e engajamento — algoritmo não detecta',
      'Pagar promoções no LinkedIn Ads para acelerar',
    ],
    correct: 1,
    explanation:
      'Crescimento orgânico no LinkedIn é mais previsível que outras plataformas. Receita: (1) bio clara com especialidade + público-alvo; (2) 3-5 posts/semana, mesmo horário (manhã 7-9h ou início tarde 12-14h, BR); (3) comentários substanciais em 5 posts grandes da sua área POR DIA (algoritmo associa você ao tópico); (4) DMs personalizadas para quem comenta seus posts; (5) nicho ESPECÍFICO — "dev backend Go" cresce mais rápido que "tecnologia em geral".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="conteudo-linkedin-criador"
      title="LinkedIn Criador: posicionamento, algoritmo e crescimento em 2026"
      icon="💼"
      xp={70}
      readTime={13}
      trailName="Criação de Conteúdo"
      trailColor={ACCENT}
      nextSlug="conteudo-youtube"
      nextTitle="YouTube: criar canal técnico que cresce em 2026"
      relatedSlugs={['marketing-personal-branding', 'marketing-conteudo-autoridade', 'comunicacao-storytelling']}
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
        LinkedIn passou de 1.2 bilhão de usuários em 2026, com 480 milhões ativos mensais. É a plataforma
        com maior ROI para profissionais B2B, recrutamento e personal branding. Mas a maioria posta com
        estratégia errada e consegue zero alcance. Esta aula mostra o que funciona em 2026, com exemplos
        concretos e métricas reais.
      </p>

      <Section title="Como o algoritmo do LinkedIn funciona em 2026" accent={ACCENT}>
        <LayerStack
          title="Pipeline de distribuição de um post no LinkedIn"
          accent={ACCENT}
          separatorLabel="próxima fase →"
          layers={[
            { label: 'Triagem inicial (0-30min)', content: 'Mostrado para 5-10% das suas conexões. Mede dwell time, comentários, saves', note: 'Golden Hour', tone: 'writable' },
            { label: 'Amplificação (30min-3h)', content: 'Se métricas iniciais boas → mostra para conexões 2º grau, depois 3º grau', tone: 'writable' },
            { label: 'Distribuição expandida (3-24h)', content: 'Pode chegar a usuários totalmente fora da sua rede se for muito relevante', tone: 'writable' },
            { label: 'Cauda longa (24h-7 dias)', content: 'Posts com saves continuam aparecendo em "para você" semanas depois', note: 'pesquise por evergreen', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          <strong>Sinais que o algoritmo prioriza:</strong> (1) dwell time {'>'} 3s; (2) comentários
          com {'>'} 15 palavras; (3) saves; (4) shares com texto adicionado; (5) reply rate (você
          responde comentários). Sinais negativos: links externos, edição após publicar (penaliza
          em 30%), engagement fake (likes em massa de bots).
        </Callout>
      </Section>

      <Section title="Anatomia de um post viral no LinkedIn" accent={ACCENT}>
        <CodeBlock lang="markdown">{`[HOOK — 5-10 palavras provocativas]
Demitimos nosso melhor sênior em 2024.

[CONTEXTO — 2-3 linhas]
Ele entregava 2x mais que o time. Mas custou 3 saídas de bons devs.

[CORPO — 3-5 parágrafos curtos com aprendizado]
Lição 1: Performance individual ≠ performance de time...
Lição 2: Tóxico não compensa entrega...
Lição 3: Cultura é construída ou destruída diariamente...

[INSIGHT FINAL]
A pergunta certa não é "ele entrega?" — é "ele faz os outros entregarem mais?"

[CTA — pergunta para gerar comentários]
Você já demitiu alguém de alta performance? O que aconteceu?

[HASHTAGS — 3-5 específicas]
#Lideranca #GestaoDePessoas #CulturaDeEmpresa`}</CodeBlock>
        <Callout tone="info">
          <strong>Estrutura validada:</strong> Hook + Contexto + 3 lições + Insight + Pergunta. Uso
          de quebras de linha frequentes (cada 1-2 frases). Espaços em branco facilitam leitura mobile
          (70% do tráfego LinkedIn é mobile).
        </Callout>
      </Section>

      <Section title="Tipos de post e quando usar cada um" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Formato', 'Alcance médio', 'Quando usar']}
          rows={[
            ['Texto longo (1300-2000 chars)', 'Mais alto', 'Story pessoal com aprendizado'],
            ['Carrossel PDF (máx 12 slides)', 'Alto', 'Conteúdo educacional estruturado'],
            ['Imagem única + texto', 'Médio-alto', 'Insight visual ou screenshot'],
            ['Vídeo nativo (30-90s)', 'Médio', 'Demo de produto ou opinião direta'],
            ['Poll (enquete)', 'Médio-alto', 'Geração de engagement rápido'],
            ['Texto + link externo', 'Mais baixo', 'Evite — coloque link no comentário'],
            ['Reshare com comentário', 'Variável', 'Apenas se comentário tem valor real'],
          ]}
        />
        <DecisionBox
          scenario="Começando do zero — qual estratégia de conteúdo escolher?"
          winner="3 posts/semana de texto longo + 1 carrossel/semana + comentários diários"
          winnerColor={ACCENT}
          why="Texto domina alcance. Carrossel domina dwell time e saves. Comentários em posts grandes pré-aquecem o algoritmo a te associar com tópicos da área. Esta combinação atinge 1k seguidores em 3 meses para profissional com nicho claro."
          alternatives={[
            { name: 'Foco em vídeo curto', note: 'Funciona se você já tem habilidade de câmera — mas tem ROI menor que texto no LinkedIn' },
            { name: 'Newsletter LinkedIn', note: 'Para quem já tem 1000+ seguidores — gera notificação push para todos os assinantes' },
          ]}
        />
      </Section>

      <Section title="Ferramentas e fluxo de trabalho de criador LinkedIn" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'Função', 'Preço']}
          rows={[
            ['Taplio', 'Análise + scheduler + IA inspiração', 'US$39-65/mês'],
            ['AuthoredUp', 'Editor com preview + analytics', 'US$19-37/mês'],
            ['Shield Analytics', 'Métricas profundas do seu perfil', 'US$8-25/mês'],
            ['Canva (Pro)', 'Carrosséis com templates', 'R$48/mês'],
            ['Notion', 'Banco de ideias + calendário editorial', 'Grátis'],
            ['Buffer / Hootsuite', 'Scheduler básico', 'US$6-15/mês'],
            ['ChatGPT / Claude', 'Brainstorm + revisão de copy', 'US$20/mês'],
          ]}
        />
        <Callout tone="info">
          <strong>Stack mínimo profissional:</strong> Notion (grátis) para banco de ideias + Canva
          Pro (R$48) para carrosséis + Taplio (US$39) para scheduler e analytics = R$280/mês total.
          Pago em 1-2 oportunidades de freelance que vêm do LinkedIn.
        </Callout>
      </Section>

      <Section title="Crescimento: do 0 ao 10k em 12 meses" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Mês', 'Meta', 'Foco']}
          rows={[
            ['1-2', '0 → 200', 'Otimizar perfil, postar 3x/semana, comentar 5/dia'],
            ['3-4', '200 → 1.000', 'Achar 1-2 formatos que funcionam, dobrar neles'],
            ['5-6', '1.000 → 3.000', 'Posts virais ocasionais, networking ativo'],
            ['7-9', '3.000 → 6.000', 'Newsletter LinkedIn, parcerias com pares'],
            ['10-12', '6.000 → 10.000+', 'Conteúdo signature, consistência absoluta'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Quanto tempo gasto por dia para crescer no LinkedIn?"
          a={<>Profissionais que crescem investem 30-60min/dia: 15min comentando em posts grandes da área (pré-aquecimento de algoritmo + visibilidade), 15min escrevendo o post do dia, 15-30min respondendo comentários nos seus posts. Não precisa postar 7x/semana — 3-4 posts excelentes superam 7 posts medianos. Domingo geralmente é dia ruim para postar (engagement baixo). Melhores horários BR: terça-quinta, 7-9h ou 12-14h.</>}
        />
        <QAItem
          q="Como achar ideias de conteúdo todo dia sem repetir?"
          a={<>Banco de ideias contínuo: anote toda dúvida que recebe (whatsapp, slack, dm), todo erro que vê alguém cometendo, todo aprendizado da semana, toda conversa interessante com cliente/colega. Ferramenta: Notion com tags por tema. Em 1 mês, terá 60-100 ideias. Estrutura validada para nunca travar: "erro comum + lição aprendida + insight contraintuitivo + pergunta para audiência". Cada ideia rende 1 post.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Algoritmo prioriza dwell time + comentários longos + saves —
        likes valem pouco. Hook nas primeiras 5-10 palavras decide tudo. Texto longo + carrossel são
        formatos campeões em 2026. Link externo penaliza alcance — coloque no primeiro comentário.
        Golden Hour (60min iniciais) define alcance — responda todos comentários. 30-60min/dia +
        consistência de 12 meses = 10k+ seguidores. Stack: Notion + Canva + Taplio = R$280/mês.
      </Callout>
    </div>
  );
}
