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

export const metadata = getModuleMetadata('conteudo-youtube');

const ACCENT = '#fb923c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a métrica mais importante para o algoritmo do YouTube em 2026?',
    options: [
      'Número total de visualizações',
      'CTR (click-through rate da thumbnail) + AVD (average view duration). YouTube quer manter usuário na plataforma — vídeos que fazem usuário clicar E assistir até o fim ganham impulso massivo. Vídeo com CTR 8% e retention 50% supera vídeo com 100k views e CTR 3%',
      'Número de inscritos no canal',
      'Quantidade de comentários no vídeo',
    ],
    correct: 1,
    explanation:
      'YouTube optimiza pelo "watch time impact" — quanto tempo o vídeo mantém usuários na plataforma. CTR de 4-8% + AVD acima de 50% é a fórmula campeã. Thumbnail é 50% do CTR, título é os outros 50%. Vídeos com primeira frase ("hook") fraca perdem 30% da audiência nos primeiros 30 segundos. Métrica de saúde: AVD > 50%, CTR > 5%, audience retention curve sem cliffs (quedas bruscas).',
  },
  {
    question: 'Como criar thumbnail que tem CTR alto sem clickbait enganoso?',
    options: [
      'Usar imagens chocantes e títulos exagerados — clickbait funciona',
      'Rosto com expressão (ou objeto único e claro), 3-5 palavras grandes em alto contraste, e curiosidade visual (algo "errado", inesperado, ou que cria pergunta). Formula: prometer algo específico que o vídeo realmente entrega',
      'Imagens de stock genéricas com texto simples',
      'Apenas texto em fundo colorido — mais limpo',
    ],
    correct: 1,
    explanation:
      'Thumbnail testada e aprovada (Mr Beast, Veritasium): rosto com emoção forte ou objeto isolado + 3-5 palavras grandes (mobile readable) + cor que contrasta com YouTube (laranja, verde neon, vermelho intenso). Curiosity gap: thumbnail mostra parte da história, força clique para resolver. Ferramentas: Photoshop, Canva (templates de thumbnail), Tubebuddy (testes A/B de thumbnail). Pegue 3 thumbnails de canais bem-sucedidos da sua área e analise padrões antes de criar a sua.',
  },
  {
    question: 'Qual a duração ideal de vídeo no YouTube em 2026?',
    options: [
      'Sempre abaixo de 10 minutos para máximo engagement',
      'Depende: tutoriais técnicos performam bem em 15-25min, vídeos opinativos/lifestyle em 8-15min, deep dives em 30-60min para audiências engajadas. YouTube paga melhor por vídeos de 8min+ (mid-roll ads). Evite forçar duração — vídeo bom é o tempo necessário para entregar valor',
      'Vídeos curtos abaixo de 5 minutos sempre — atenção do espectador é curta',
      'Acima de 30 minutos sempre — algoritmo prioriza watch time absoluto',
    ],
    correct: 1,
    explanation:
      'YouTube de 2026: Shorts (até 60s) para descoberta, vídeos longos (10min+) para retenção e monetização. Mid-roll ads (anúncios no meio) só desbloqueiam em vídeos acima de 8min — diferença de receita gigante. Para canal técnico: tutorial 15-25min é o sweet spot. Para vlog/opinião: 8-12min. AVD absoluto importa: 50% de retention em 20min (10min absolutos) supera 80% em 5min (4min). Mas alongar vídeo só por alongar destrói retention.',
  },
  {
    question: 'Como crescer canal YouTube de 0 a 1000 inscritos (limite para monetização)?',
    options: [
      'Postar todos os dias por 6 meses sem parar',
      'Foco em nicho específico, 1 vídeo/semana com qualidade alta, hooks de 15s validados, e usar Shorts para descoberta (algoritmo dos Shorts é mais permissivo que vídeos longos). Tempo médio: 6-18 meses para 1k. Atalho real: vídeo "tutorial" sobre tópico subatendido com SEO bem feito',
      'Comprar inscritos para acelerar — algoritmo detecta retention real depois',
      'Apenas Shorts até atingir 1k — vídeos longos vêm depois',
    ],
    correct: 1,
    explanation:
      'YouTube exige 1.000 inscritos + 4.000h de watch time (vídeos) ou 10M views (Shorts) para monetizar. Estratégia validada: (1) escolher nicho com demanda mas baixa concorrência (use vidIQ ou TubeBuddy para keyword research); (2) primeiro vídeo deve responder pergunta específica que pessoas buscam; (3) Shorts trazem inscritos descobertos, vídeos longos trazem watch time; (4) estabelecer cadência consistente — 1 vídeo/semana batendo na hora certa supera 3 vídeos esporádicos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="conteudo-youtube"
      title="YouTube: criar canal técnico que cresce em 2026"
      icon="📺"
      xp={75}
      readTime={14}
      trailName="Criação de Conteúdo"
      trailColor={ACCENT}
      nextSlug="conteudo-design-basico"
      nextTitle="Design Básico: Canva e Figma para criadores"
      relatedSlugs={['conteudo-edicao-video', 'conteudo-tutorial-tecnico', 'conteudo-setup-gravacao']}
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
        YouTube paga melhor que qualquer outra plataforma por hora de conteúdo (RPM médio R$8-30 no BR
        em 2026, vs R$2-8 no TikTok/Instagram). Mas é também a mais difícil para crescer. Esta aula
        mostra como pensar como criador profissional: nicho, SEO, thumbnails, retention, monetização —
        com táticas validadas em 2026.
      </p>

      <Section title="Como o algoritmo do YouTube funciona em 2026" accent={ACCENT}>
        <LayerStack
          title="Pipeline de descoberta de um vídeo no YouTube"
          accent={ACCENT}
          separatorLabel="próxima fase →"
          layers={[
            { label: 'Triagem (primeiras 24h)', content: 'Mostrado para inscritos + busca/sugeridos por palavras-chave do título', note: 'CTR e AVD são medidos aqui', tone: 'writable' },
            { label: 'Test expansion (1-7 dias)', content: 'Se métricas boas → mostra para audiências adjacentes, "Para você", trending', tone: 'writable' },
            { label: 'Distribuição massiva (7-90 dias)', content: 'Top performers viram "evergreen" — recomendados meses/anos depois', tone: 'writable' },
            { label: 'Cauda longa (90+ dias)', content: 'Vídeos de busca SEO continuam trazendo views indefinidamente', note: 'tutorial técnico = ouro', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          <strong>Métricas que o algoritmo prioriza:</strong> CTR (8%+ é excelente, 4%+ é bom),
          AVD (50%+ excelente, 30%+ aceitável), audience retention curve sem quedas bruscas,
          comentários, likes, shares. Sinais negativos: dislikes, "not interested", abandono nos
          primeiros 30s.
        </Callout>
      </Section>

      <Section title="Anatomia de vídeo de alta retenção" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Segmento', 'Duração', 'Função']}
          rows={[
            ['Hook', '0-15s', 'Promessa específica + razão para ficar'],
            ['Setup', '15s-1min', 'Contexto mínimo necessário'],
            ['Re-hook', '1min', 'Lembrar o resultado prometido'],
            ['Conteúdo principal', '1-15min', 'Entrega + sub-promessas mantendo curiosidade'],
            ['Climax / payoff', '12-18min', 'Revelação principal ou resultado final'],
            ['CTA + outro', '18-20min', 'Inscrição, próximo vídeo, comentário'],
          ]}
        />
        <CodeBlock lang="markdown">{`# Estrutura validada de hook (primeiros 15 segundos)

[0-3s] PATTERN INTERRUPT
"Demitiram nosso melhor dev — e a equipe melhorou 40%."

[3-8s] PROMESSA ESPECÍFICA
"Vou mostrar os 3 erros de gestão técnica que destroem times."

[8-15s] PREVIEW DO VALOR
"Funciona em qualquer empresa de 5 a 500 pessoas."
[corte para resultado/exemplo concreto]

# Anti-padrões que matam retention nos primeiros 30s
✗ "Olá pessoal, tudo bem? Espero que sim..."
✗ "Antes de começar, se inscreve no canal!"
✗ "Bom, hoje eu queria falar sobre..."
✗ Música longa de abertura sem voz`}</CodeBlock>
      </Section>

      <Section title="SEO e ranking de vídeos no YouTube" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Elemento', 'Boas práticas 2026']}
          rows={[
            ['Título', '60-70 caracteres, palavra-chave principal nos primeiros 30 chars'],
            ['Thumbnail', 'Rosto + texto grande (3-5 palavras), contraste alto, mobile-first'],
            ['Descrição', '200+ palavras, palavras-chave naturais, links + chapters'],
            ['Tags', '5-10 tags relevantes, mix de específicas e amplas'],
            ['Chapters', 'Timestamps no formato 00:00 — YouTube indexa cada chapter'],
            ['Closed Captions', 'YouTube indexa transcrição inteira — adicione legendas'],
            ['End screens', 'Direcionar para próximo vídeo + inscrição últimos 20s'],
            ['Cards', 'Sugestões em momentos estratégicos do vídeo'],
          ]}
        />
        <DecisionBox
          scenario="Escolher nicho do canal — tech, lifestyle, educação?"
          winner="Nicho específico de tech/educação com baixa concorrência mensurável"
          winnerColor={ACCENT}
          why="vidIQ ou TubeBuddy permitem ver volume de busca + concorrência por palavra-chave. Nicho ideal: 1k-50k buscas/mês + concorrência média/baixa. Exemplo: 'Postgres replicação em produção' bate 'tutorial Postgres'. Específico cresce mais rápido que generalista."
          alternatives={[
            { name: 'Nicho amplo com personalidade forte', note: 'Funciona para criadores com presença muito carismática — mas curva mais lenta' },
            { name: 'Tutoriais buscáveis (SEO)', note: 'Crescimento mais previsível, watch time menor por vídeo, mas evergreen' },
          ]}
        />
      </Section>

      <Section title="Monetização YouTube em 2026 (BR)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Fonte', 'Quando desbloqueia', 'Receita típica']}
          rows={[
            ['AdSense (anúncios)', '1k inscritos + 4k h watch time', 'R$8-30 por 1k views (RPM BR)'],
            ['YouTube Premium', 'Mesmo requisito', 'Bônus 5-15% via assinantes Premium'],
            ['Super Thanks', 'Após monetização', 'Variável — engajamento da audiência'],
            ['Membership do canal', '1k inscritos + idade 18+', 'R$5-50/membro/mês'],
            ['Patrocínios', 'Geralmente {'>'} 10k inscritos', 'R$2-20 por 1k views (paid)'],
            ['Affiliate links', 'Imediato', '5-30% comissão via Hotmart, Kiwify, Amazon'],
            ['Produtos próprios', 'Imediato', 'Curso, e-book, mentoria — maior margem'],
          ]}
        />
        <Callout tone="info">
          <strong>Realidade da monetização BR:</strong> 1.000 inscritos não significa receita
          significativa. Marco real é 10k inscritos + vídeos consistentes — geralmente R$1-3k/mês de
          AdSense. Patrocínios + produtos próprios multiplicam isso em 3-10x. RPM BR é metade do dos EUA,
          mas custos de produção também são menores.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale começar canal pequeno em 2026 com tantos criadores estabelecidos?"
          a={<>Sim — 2026 é melhor que 2020 para começar. Audiência total cresceu 3x desde 2020 (mais nichos viáveis). Algoritmo de 2026 prioriza relevância sobre tamanho do canal — vídeos de canais novos com bom CTR/AVD aparecem em "Para você" mesmo com poucos inscritos. Atalho real: nichos sub-atendidos. Use vidIQ keyword research para encontrar palavras-chave com 1k-10k buscas/mês com poucos vídeos respondendo bem. Crie vídeo de qualidade superior aos top 3 atuais e ganhe ranking em 1-3 meses.</>}
        />
        <QAItem
          q="Quanto tempo gasto produzindo 1 vídeo de 15min?"
          a={<>Para criador iniciante: 15-25h por vídeo (planejamento 3h + roteiro 4h + gravação 4h + edição 8h + thumbnail 1h + upload/SEO 1h). Para criador experiente: 6-10h. Investimentos que reduzem tempo: roteiro estruturado (evita refilmagem), atalhos de edição decorados, IA para legendas (Submagic), templates de thumbnail (Canva). Quem cresce de verdade trata YouTube como negócio: 8-15h/semana consistentes durante 1-2 anos antes de ver retorno significativo.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> CTR + AVD são as métricas que importam — não inscritos.
        Thumbnail + título = 50%/50% do CTR. Hook em 15s define retention. Tutoriais técnicos:
        15-25min é sweet spot. Vídeos {'>'}8min desbloqueiam mid-roll ads (receita 2-3x maior).
        Nicho específico cresce mais rápido que generalista. SEO + chapters + legendas multiplicam
        descoberta. 1k inscritos não é meta — 10k é o marco real. Patrocínios + produtos próprios
        superam AdSense.
      </Callout>
    </div>
  );
}
