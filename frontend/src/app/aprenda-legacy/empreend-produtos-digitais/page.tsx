import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('empreend-produtos-digitais');

const ACCENT = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia um produto digital de sucesso de um que não vende?',
    options: [
      'Qualidade do design e produção visual do produto',
      'Resolve um problema específico de uma pessoa específica — quanto mais nicho o problema e mais clara a promessa de resultado, maior a conversão. "Planilha de gestão financeira para freelas de design" vende mais que "planilha financeira completa"',
      'Preço competitivo — produtos digitais baratos vendem mais',
      'Presença em marketplaces como Hotmart e Gumroad',
    ],
    correct: 1,
    explanation:
      'A especificidade aumenta conversão. "Template de proposta para freelas de dev" converte melhor que "template de proposta profissional" porque o comprador se vê imediatamente no produto. O paradoxo do nicho: quanto mais específico, menor o mercado total mas maior a porcentagem que compra. Para produtos de R$27-97, a conversão supera a limitação do mercado menor.',
  },
  {
    question: 'Quais são os tipos de produtos digitais com melhor relação esforço/receita para criadores solo?',
    options: [
      'Aplicativos mobile — alto potencial de escala mesmo solo',
      'Templates (Notion, Figma, Canva), planilhas especializadas, e-books práticos, e packs de recursos (ícones, fontes, mockups) — baixo custo de criação, zero custo de entrega, margem de 95%+, e podem vender indefinidamente',
      'Cursos online — são os produtos digitais com maior margem e escalabilidade',
      'Newsletters pagas — recorrência é a melhor forma de receita digital',
    ],
    correct: 1,
    explanation:
      'Templates e recursos digitais têm o melhor CAC/LTV para criadores solo: você cria uma vez, vende N vezes sem suporte, sem atualização frequente obrigatória, e sem entrega manual. Exemplos de sucesso no BR: templates de contratos freela (R$27-47), planilhas de precificação para designers (R$37-67), packs de mockups para designers (R$47-97). Plataformas: Gumroad (internacional), Hotmart, Kiwify.',
  },
  {
    question: 'Como precificar um e-book ou template corretamente?',
    options: [
      'Pelo tempo que levou para criar — custo de produção define o preço',
      'Pelo valor do resultado que entrega ao comprador — um template que economiza 2h de trabalho por semana pode custar R$97 sem problema. Preço baseado em resultado, não em produção',
      'Pelo preço dos concorrentes — pesquisar e cobrar 20% menos para ganhar market share',
      'Tudo abaixo de R$50 para maximizar volume de vendas',
    ],
    correct: 1,
    explanation:
      'Precificação baseada em valor: identifique o tempo ou dinheiro que o comprador economiza usando seu produto. Template de proposta de freela que economiza 3h de trabalho = valor mínimo de R$150 (3h × R$50/h). Você pode cobrar R$37 e ainda parecer absurdamente barato para o comprador. Estratégia de preço de entrada: R$27-47 para primeiros 100 vendas, depois aumentar para R$67-97 com depoimentos.',
  },
  {
    question: 'O que é "bundling" e como aumenta receita de produtos digitais?',
    options: [
      'Oferecer desconto progressivo para quem compra mais de 1 produto',
      'Agrupar produtos complementares em um pacote por preço mais alto que a soma individual — cria percepção de mais valor e aumenta ticket médio. "Pack completo do freela" com contrato + proposta + planilha por R$97 quando individualmente seriam R$27+R$37+R$47',
      'Distribuir o produto em múltiplas plataformas simultaneamente',
      'Criar versões lite e premium do mesmo produto',
    ],
    correct: 1,
    explanation:
      'Bundling aumenta AOV (Average Order Value) sem aumentar o custo de aquisição de cliente. A percepção de valor do bundle supera a soma das partes individuais. Estratégia: criar 3 produtos individuais primeiro, validar quais vendem, depois criar bundle dos 3 mais populares. O bundle frequentemente se torna o produto mais vendido. Outra variação: bundle com bônus ("compre agora e ganhe template extra") para urgência.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="empreend-produtos-digitais"
      title="Produtos Digitais: templates, e-books e recursos que vendem enquanto você dorme"
      icon="📦"
      xp={65}
      readTime={11}
      trailName="Empreendedorismo Digital"
      trailColor={ACCENT}
      nextSlug="empreend-freelance-clientes"
      nextTitle="Conseguir Clientes: atrair e converter como freela"
      relatedSlugs={['empreend-curso-online', 'marketing-personal-branding', 'empreend-side-project']}
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
        Produtos digitais têm margem de 90-95% e escalam sem custo variável. Um template criado em um
        fim de semana pode vender por anos. Este módulo cobre os tipos de produtos com melhor ROI para
        criadores solo, como criar e precificar, e como distribuir para ter vendas consistentes.
      </p>

      <Section title="Tipos de produtos digitais por esforço e retorno" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Produto', 'Esforço de criação', 'Preço típico BR', 'Suporte necessário']}
          rows={[
            ['Template (Notion, Figma, Canva)', '4-16h', 'R$27-97', 'Mínimo'],
            ['Planilha especializada', '8-24h', 'R$37-127', 'Mínimo'],
            ['E-book prático (guia)', '20-60h', 'R$27-67', 'Zero'],
            ['Pack de recursos (ícones, mockups)', '10-30h', 'R$47-197', 'Zero'],
            ['Preset/filtro (Lightroom, etc)', '2-8h', 'R$27-47', 'Zero'],
            ['Curso mini (2-4h)', '20-40h', 'R$47-197', 'Baixo'],
            ['SaaS/ferramenta simples', '100-300h', 'R$29-97/mês', 'Alto no início'],
          ]}
        />
        <Callout tone="info">
          Templates e planilhas têm o melhor ROI para começar: criação rápida, zero custo de entrega,
          e o produto pode ser melhorado com feedback sem reiniciar do zero.
        </Callout>
      </Section>

      <Section title="Plataformas de venda e distribuição" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Plataforma', 'Taxa', 'Melhor para']}
          rows={[
            ['Gumroad', '10% por venda', 'Produtos em USD para audiência internacional'],
            ['Kiwify', '4.99% por venda', 'Produtos em BRL, fácil de configurar'],
            ['Hotmart', '9.9% + R$1', 'Produtos com afiliados e checkout otimizado BR'],
            ['Loja própria (Shopify/WooCommerce)', 'Taxa fixa + gateway', 'Depois de validar — escala sem % crescente'],
            ['Notion/Gumroad direto', 'Variável', 'Templates Notion — comunidade ativa de compradores'],
          ]}
        />
        <DecisionBox
          scenario="Criar primeiro produto digital — template de algo que você usa no trabalho"
          winner="Template de ferramenta que você mesmo usa + venda no Kiwify por R$37-47"
          winnerColor={ACCENT}
          why="Você já conhece o problema. O produto existe de fato (você usa). Kiwify tem taxa baixa e setup rápido. R$37-47 tem baixa barreira de compra e ainda gera R$35 de margem por venda."
          alternatives={[
            { name: 'E-book guia passo a passo', note: 'Converte bem para públicos que buscam no Google — SEO friendly' },
            { name: 'Bundle desde o início', note: 'Cria 3 produtos menores e vende como pack — ticket maior, esforço marginal' },
          ]}
        />
      </Section>

      <Section title="Distribuição: como ter vendas orgânicas consistentes" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Canal', 'Como funciona', 'Esforço']}
          rows={[
            ['LinkedIn', 'Post sobre o problema que o produto resolve + link na bio', 'Médio — postagem regular'],
            ['Google (SEO)', 'Página de produto otimizada para busca do problema', 'Alto inicial, passivo depois'],
            ['Comunidades nicho', 'Responder dúvidas + mencionar produto como solução', 'Baixo — value-first'],
            ['Pinterest', 'Pins com visual do produto + link direto', 'Baixo — funciona para visuais (templates, presets)'],
            ['Afiliados (10-30%)', 'Outros criadores promovem em troca de comissão', 'Setup único — escala automático'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso vender produtos digitais como MEI?"
          a={<>Sim. MEI pode vender produtos digitais dentro do limite de R$81k/ano. Use CNAE 4791-1/00 (comércio varejista por correspondência ou internet) para venda de produtos digitais. Emita NF de serviço quando plataformas como Hotmart solicitarem. Acima de R$81k/ano: migrar para ME no Simples Nacional é necessário. Dica: abra conta PJ separada para manter as finanças organizadas desde o primeiro real.</>}
        />
        <QAItem
          q="Como proteger produtos digitais de pirataria?"
          a={<>Proteção total é impossível, mas você pode dificultar: marca d'água em documentos PDF, licença de uso explícita (uso pessoal, não revenda), e watermark sutil em templates visuais. A realidade: quem pirateia raramente compraria. Quem paga valoriza o acesso legítimo e o suporte. Foque em vender para quem vai pagar, não em bloquear quem não vai. Plataformas como Hotmart têm proteção nativa contra downloads múltiplos.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Templates e planilhas especializadas têm o melhor ROI para começar.
        Nicho específico converte melhor que produto genérico. Precifique pelo valor do resultado, não
        pelo tempo de criação. Bundling aumenta ticket médio sem custo extra de aquisição. Kiwify para
        começar no BR, Gumroad para audiência internacional. SEO e comunidades são canais de distribuição
        passivos mais eficientes a longo prazo.
      </Callout>
    </div>
  );
}
