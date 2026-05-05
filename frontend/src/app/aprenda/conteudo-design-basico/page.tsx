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

export const metadata = getModuleMetadata('conteudo-design-basico');

const ACCENT = '#fb923c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual ferramenta tem melhor custo-benefício para criadores não-designers em 2026?',
    options: [
      'Adobe Photoshop — padrão profissional para tudo',
      'Canva Pro (R$48/mês ou R$420/ano) — 600k+ templates, IA generativa integrada, redimensionamento automático para todas as redes, e Magic Resize. Para 95% dos criadores, é mais que suficiente. Figma é gratuito e melhor para UI/UX',
      'Photopea (versão grátis do Photoshop)',
      'Apenas ferramentas pagas profissionais',
    ],
    correct: 1,
    explanation:
      'Canva Pro em 2026 tem: 600k+ templates, biblioteca de 100M+ assets (fotos, vídeos, ícones), Magic Resize (transforma post Instagram em LinkedIn em 1 clique), Brand Kit (paleta + fontes salvas), Background Remover (1 clique), Magic Studio (IA para gerar imagens, textos, presentations). Para criador solo: cobre 99% das necessidades. Figma (gratuito plano pessoal) é superior para UI/UX e gráficos vetoriais editáveis.',
  },
  {
    question: 'Quais são os princípios fundamentais de design que todo criador precisa dominar?',
    options: [
      'Cores vibrantes e fontes diferentes para destacar',
      'Hierarquia visual (1 elemento dominante, outros secundários), contraste alto (texto deve ler em mobile), alinhamento (grid invisível), e espaço em branco (não preencher tudo). Esses 4 princípios resolvem 80% dos problemas visuais',
      'Usar muitos elementos para parecer rico',
      'Seguir apenas templates sem customizar',
    ],
    correct: 1,
    explanation:
      'Princípios CRAP de design (Contrast, Repetition, Alignment, Proximity) resolvem a maioria dos problemas. Hierarquia: tamanho da fonte do título 3x maior que corpo. Contraste: cor do texto vs fundo deve passar no WCAG AA (use coolors.co contrast checker). Alinhamento: tudo em grid de 8px. Proximidade: elementos relacionados próximos, não relacionados distantes. Espaço em branco: 60% do design não precisa de elemento.',
  },
  {
    question: 'Como escolher cores para identidade visual sem ser designer?',
    options: [
      'Usar as cores favoritas pessoais',
      'Paleta com 3-5 cores: 1 primária (logo, CTAs), 1 secundária (acentos), 1-2 neutras (texto, fundos), e 1 cor de destaque para CTAs específicos. Ferramentas: Coolors.co (gera paletas), Adobe Color (extrai de imagens), Realtime Colors (testa em mockup)',
      'Apenas preto e branco para simplicidade',
      'Copiar exatamente a paleta de um concorrente',
    ],
    correct: 1,
    explanation:
      'Paleta funcional: 60-30-10 rule. 60% cor neutra (fundo), 30% cor primária (estrutura), 10% cor de destaque (CTAs, links). Coolors.co (https://coolors.co) gera paletas com clique no espaço. Adobe Color (color.adobe.com) extrai paleta de qualquer foto. Sites de referência: Klart.io (paletas curadas), Refero.design (inspirações). Para acessibilidade: contraste mínimo 4.5:1 (WebAIM checker).',
  },
  {
    question: 'Como criar carrosséis para LinkedIn/Instagram que performam?',
    options: [
      'Slides com muito texto explicativo em cada um',
      'Slide 1 (cover): hook visual + promessa. Slides 2-9: 1 ideia por slide + visual de apoio. Último slide: CTA. Tamanho 1080×1080 (quadrado) ou 1080×1350 (vertical). Texto grande (mínimo 24pt mobile-readable). 8-10 slides ideal — mais que isso, audiência abandona',
      'Slides com fundo branco e texto preto sempre',
      'Cada slide deve ter o mesmo template repetido',
    ],
    correct: 1,
    explanation:
      'Carrossel de alta performance: cover com hook irresistível (esse slide é a thumbnail), conteúdo dividido em ideias atômicas (1 por slide), visual diferente entre slides (não fica monotonia), e payoff/CTA no último. Templates Canva: busque "LinkedIn carousel" ou "Instagram carousel professional". Use o Brand Kit para manter consistência entre carrosséis. Exporte como PDF para LinkedIn (não como imagens individuais).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="conteudo-design-basico"
      title="Design Básico: Canva e Figma para criadores não-designers"
      icon="🎨"
      xp={60}
      readTime={11}
      trailName="Criação de Conteúdo"
      trailColor={ACCENT}
      nextSlug="marketing-personal-branding"
      nextTitle="Personal Branding: construir autoridade em 2026"
      relatedSlugs={['conteudo-linkedin-criador', 'conteudo-youtube', 'marketing-personal-branding']}
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
        Você não precisa ser designer para criar conteúdo visual de qualidade. Em 2026, ferramentas
        como Canva e Figma democratizaram design — e quem domina o básico tem vantagem gigante. Esta
        aula cobre princípios fundamentais, ferramentas práticas, e templates que funcionam.
      </p>

      <Section title="Ferramentas: qual usar para o quê" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'Melhor para', 'Custo']}
          rows={[
            ['Canva Pro', 'Posts, carrosséis, thumbnails, apresentações', 'R$48/mês'],
            ['Figma', 'UI/UX, mockups, wireframes, design colaborativo', 'Grátis (pessoal)'],
            ['Photoshop', 'Edição complexa de fotos, manipulação avançada', 'R$112/mês'],
            ['Photopea', 'Photoshop alternative grátis (web)', 'Grátis'],
            ['Affinity Suite', 'Photoshop + Illustrator + InDesign', 'R$1.200 vitalício'],
            ['Procreate (iPad)', 'Ilustração digital, lettering', 'R$60 vitalício'],
            ['Adobe Express', 'Posts rápidos com IA', 'R$48/mês'],
          ]}
        />
        <Callout tone="info">
          <strong>Stack 2026 recomendado para criadores:</strong> Canva Pro (R$48/mês) para 90% do
          conteúdo + Figma (grátis) para mockups e materiais que serão re-editados várias vezes +
          Photopea (grátis) quando precisar de Photoshop. Total: R$48/mês para estúdio completo.
        </Callout>
      </Section>

      <Section title="Os 4 princípios que resolvem 80% dos problemas de design" accent={ACCENT}>
        <LayerStack
          title="CRAP — princípios fundamentais aplicados"
          accent={ACCENT}
          separatorLabel="aplicar em ordem →"
          layers={[
            { label: 'Contrast (Contraste)', content: 'Texto vs fundo: razão 4.5:1 mínimo (WCAG AA). Title 3x tamanho do body. Cor de CTA destoa do resto', note: 'sem isso, ilegível', tone: 'writable' },
            { label: 'Repetition (Repetição)', content: 'Mesmas cores, fontes, espaçamentos em todo material — cria identidade visual', tone: 'writable' },
            { label: 'Alignment (Alinhamento)', content: 'Tudo em grid de 8px. Esquerda > centro para texto longo. Centro só para destaques', tone: 'writable' },
            { label: 'Proximity (Proximidade)', content: 'Elementos relacionados próximos. Espaço em branco entre grupos diferentes', note: 'separa visualmente conceitos', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Tipografia: regras práticas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Regra', 'Como aplicar', 'Por que']}
          rows={[
            ['Máximo 2 fontes por design', '1 para títulos, 1 para corpo', 'Mais que isso = caos visual'],
            ['Hierarquia clara', 'Title 32-48pt, Subtitle 20-24pt, Body 14-18pt', 'Olho sabe onde ir'],
            ['Line height 1.4-1.6', 'Texto não cola entre linhas', 'Legibilidade'],
            ['Largura máxima 60-75 chars', 'Linha não pode ser longa demais', 'Olho cansa em linhas longas'],
            ['Sans-serif para tela', 'Inter, Manrope, Plus Jakarta Sans', 'Renderiza melhor em pixels'],
            ['Serif para impressão', 'Lora, Source Serif Pro', 'Tradição + legibilidade em papel'],
          ]}
        />
        <Callout tone="info">
          <strong>Fontes gratuitas profissionais (Google Fonts):</strong> Inter (universal moderna),
          Manrope (geometric com personalidade), Plus Jakarta Sans (boa para tech), Space Grotesk
          (techy/quirky), Lora (serif elegante), Playfair Display (serif dramática). Pareamentos
          testados: Inter + Lora, Manrope + Playfair, Space Grotesk + IBM Plex Serif.
        </Callout>
      </Section>

      <Section title="Cores: paletas que funcionam em 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estilo', 'Paleta exemplo', 'Para quem']}
          rows={[
            ['Tech moderno', '#0f172a + #38bdf8 + #f8fafc', 'Devs, startups, B2B'],
            ['Energético', '#fb923c + #f43f5e + #fff7ed', 'Criadores de conteúdo, lifestyle'],
            ['Sério/financeiro', '#1e293b + #84cc16 + #f1f5f9', 'Finanças, consultoria, B2B'],
            ['Criativo', '#a855f7 + #ec4899 + #fffbeb', 'Designers, artes, fashion'],
            ['Minimalista', '#000 + #fff + 1 cor de destaque', 'Premium, luxury, serious brands'],
          ]}
        />
        <DecisionBox
          scenario="Criar identidade visual para canal/perfil profissional do zero"
          winner="Coolors.co + Brand Kit do Canva + 2 fontes do Google Fonts"
          winnerColor={ACCENT}
          why="Coolors gera paleta em 30s (clique 'spacebar' até gostar). Salve no Brand Kit do Canva — todos os designs futuros usam automaticamente. 2 fontes (uma para título, outra para corpo) cria consistência. Total de tempo para identidade visual completa: 2h."
          alternatives={[
            { name: 'Contratar designer freelance', note: 'R$500-2k para identidade completa em Workana ou direta — vale para negócios sérios' },
            { name: 'Usar template Canva existente', note: 'Mais rápido para começar — depois evolui com Brand Kit personalizado' },
          ]}
        />
      </Section>

      <Section title="Atalhos e fluxos no Canva (acelera 5x)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Atalho/Função', 'O que faz', 'Onde clicar']}
          rows={[
            ['Magic Resize', 'Redimensiona post para todas redes em 1 clique', 'Botão roxo no topo (Pro)'],
            ['Background Remover', 'Remove fundo de qualquer foto', 'Selecione imagem → Edit Image'],
            ['Brand Kit', 'Salva paleta + fontes + logos', 'Settings → Brand Hub'],
            ['Magic Write', 'IA gera texto e copy', 'Apps → Magic Write'],
            ['Magic Edit', 'IA edita partes específicas da imagem', 'Selecione imagem → Edit Image'],
            ['Templates pesquisáveis', 'Filtre por "LinkedIn carousel professional"', 'Caixa de busca'],
            ['Atalho T', 'Adiciona texto rapidamente', 'Tecla T'],
            ['Atalho R', 'Adiciona retângulo', 'Tecla R'],
            ['Cmd/Ctrl + D', 'Duplica elemento selecionado', 'Atalho universal'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale a pena pagar Canva Pro vs versão gratuita?"
          a={<>Para criador sério, sim. Pro desbloqueia: Magic Resize (economiza horas), Background Remover (vale o preço sozinho), 100M+ assets (vs ~250k grátis), Brand Kit (consistência em toda criação), Magic Studio (IA generativa). R$420/ano = R$35/mês. Se você cria 5+ designs por semana, paga em produtividade no primeiro mês. Versão gratuita serve para uso casual, mas trava em features que aceleram o trabalho.</>}
        />
        <QAItem
          q="Devo aprender Photoshop ou Figma além do Canva?"
          a={<>Depende do objetivo. Para 95% dos criadores: Canva é suficiente. Aprenda Figma (gratuito) se: (1) quer design de UI/UX no futuro; (2) trabalha em time onde colaboração é essencial; (3) precisa criar componentes reutilizáveis (sistema de design). Aprenda Photoshop apenas se: edição de fotos avançada é central no seu trabalho. Photopea (photopea.com) é gratuito e tem 90% das features do Photoshop — bom para começar sem custo.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Canva Pro (R$48/mês) cobre 90% das necessidades de criador.
        Figma gratuito para UI/UX e materiais reeditáveis. Princípios CRAP (Contrast, Repetition,
        Alignment, Proximity) resolvem 80% dos problemas. Máximo 2 fontes + paleta de 3-5 cores.
        Brand Kit no Canva mantém consistência automaticamente. Coolors.co + Adobe Color para
        paletas. Templates de "LinkedIn carousel" já validados — customize com seu Brand Kit.
      </Callout>
    </div>
  );
}
