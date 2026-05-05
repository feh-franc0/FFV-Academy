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

export const metadata = getModuleMetadata('empreend-curso-online');

const ACCENT = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o maior erro de quem cria seu primeiro curso online?',
    options: [
      'Gravar com qualidade de câmera insuficiente',
      'Criar o curso antes de validar se há demanda e disposição de pagar. Meses de gravação para descobrir que ninguém quer comprar — validar com pré-venda de 10 alunos antes de gravar uma aula sequer',
      'Colocar preço muito baixo para atrair mais alunos inicialmente',
      'Hospedar em plataforma própria em vez de Hotmart ou Kiwify',
    ],
    correct: 1,
    explanation:
      'A armadilha do "vou criar e depois vender" destrói mais projetos de cursos online do que qualquer outro fator. Validação mínima: landing page simples com proposta do curso + botão de pré-venda a 30-50% do preço final. Se conseguir 10-20 compradores antes de gravar, você tem validação de mercado. Se não conseguir, pivota o tema sem ter desperdiçado meses de gravação.',
  },
  {
    question: 'Por que cursos de R$197-497 vendem mais que cursos de R$47 no Brasil?',
    options: [
      'Porque cursos mais caros têm melhor produção e mais conteúdo',
      'Preço mais alto sinaliza maior valor percebido — compradores de cursos baratos frequentemente não completam. O preço cria comprometimento. Além disso, o custo de aquisição de cliente é similar para R$47 e R$497, então a margem de R$497 financia marketing que R$47 não sustenta',
      'Porque o público brasileiro tem mais poder de compra do que se imagina',
      'Apenas cursos de programação conseguem justificar preços acima de R$200',
    ],
    correct: 1,
    explanation:
      'Psicologia de preço em cursos: preço baixo = baixo comprometimento = baixa conclusão = nenhum resultado = nenhum depoimento = nenhuma indicação. Preço alto = comprometimento + percepção de valor + resultados + depoimentos + indicações. O modelo de precificação da Hotmart mostra que cursos de R$297-997 têm conversão e LTV melhores que R$47-97 para o mesmo público qualificado.',
  },
  {
    question: 'O que é o lançamento PLF (Product Launch Formula) e como se aplica ao Brasil?',
    options: [
      'Uma fórmula de produção de conteúdo para criar aulas em série rápida',
      'Sequência de conteúdo gratuito de valor crescente (3-5 vídeos ou lives) que aquece a audiência, cria antecipação, e abre carrinho por janela curta (7 dias). Cria urgência real e concentra compras. Funciona bem no BR especialmente no formato de lives no YouTube/Instagram',
      'Um método de precificação baseado em pesquisa de mercado',
      'Framework específico para lançar cursos em plataformas internacionais como Udemy',
    ],
    correct: 1,
    explanation:
      'PLF adaptado ao Brasil: semana 1 — conteúdo gratuito resolvendo um problema real do público-alvo; semana 2 — conteúdo avançando no tema, mostrando o que é possível; semana 3 — abertura de carrinho com bônus de early bird + escassez real (vagas limitadas ou prazo). Lives no YouTube ou Instagram funcionam melhor que vídeos gravados no BR — interação cria urgência e social proof em tempo real.',
  },
  {
    question: 'Qual métrica é mais importante para saber se um curso está indo bem?',
    options: [
      'Número de alunos matriculados',
      'Taxa de conclusão e NPS dos alunos — são indicadores lagging do que o LTV e as indicações serão. Curso com 100 alunos e 80% de conclusão supera curso com 1000 alunos e 5% de conclusão em receita recorrente e reputação',
      'Faturamento total do lançamento',
      'Número de avaliações 5 estrelas na plataforma',
    ],
    correct: 1,
    explanation:
      'Taxa de conclusão alta significa: alunos estão tendo resultado, o que gera depoimentos, que geram indicações, que geram novos alunos. Alunos que não concluem pedem reembolso ou deixam avaliações ruins. Plataformas como Hotmart exibem publicamente o percentual de conclusão — isso impacta diretamente a conversão de novos alunos. Métricas de saúde: conclusão > 40%, NPS > 50, taxa de reembolso < 5%.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="empreend-curso-online"
      title="Curso Online: criar, lançar e escalar no mercado brasileiro"
      icon="🎓"
      xp={75}
      readTime={13}
      trailName="Empreendedorismo Digital"
      trailColor={ACCENT}
      nextSlug="empreend-produtos-digitais"
      nextTitle="Produtos Digitais: templates, ferramentas e infoprodutos"
      relatedSlugs={['empreend-freelance-clientes', 'conteudo-youtube', 'marketing-personal-branding']}
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
        O mercado de cursos online no Brasil faturou R$6.7 bilhões em 2024 (Hotmart/FGV). 42% dos criadores
        de conteúdo têm curso como principal fonte de renda. A barreira de entrada nunca foi tão baixa —
        um smartphone, microfone de R$200, e conhecimento real são suficientes para começar. O que diferencia
        quem vende de quem não vende é estratégia, não produção.
      </p>

      <Section title="Validação antes de gravar: a etapa que a maioria pula" accent={ACCENT}>
        <LayerStack
          title="Processo de validação de curso antes da produção"
          accent={ACCENT}
          separatorLabel="confirma antes de investir →"
          layers={[
            { label: 'Pesquisa de dor (semana 1)', content: 'Conversar com 10 pessoas do público-alvo sobre o problema que o curso resolve', note: 'não pergunte se comprariam — pergunte sobre o problema', tone: 'writable' },
            { label: 'Landing page de pré-venda (semana 2)', content: 'Página simples com proposta + preço com 40% de desconto + "turma inaugural"', tone: 'writable' },
            { label: 'Divulgação orgânica (semana 2-3)', content: 'Postagem nas suas redes + mensagem direta para os 10 que você entrevistou', tone: 'writable' },
            { label: 'Meta de validação', content: '10+ compradores antes de gravar qualquer aula = curso validado', note: 'se não atingir: pivota o tema ou o público', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          Pré-venda honesta: explique que é turma inaugural, que o curso será gravado com base nas
          necessidades da turma, e que eles terão acesso antecipado e acesso a você. Preço 40% menor
          compensa o risco de ser primeiro. Reembolso garantido se não ficar satisfeito.
        </Callout>
      </Section>

      <Section title="Plataformas de hospedagem no Brasil" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Plataforma', 'Taxa', 'Ponto forte', 'Quando usar']}
          rows={[
            ['Hotmart', '9.9% + R$1 por venda', 'Marketplace + afiliados', 'Curso com afiliados e audiência nacional'],
            ['Kiwify', '4.99% por venda', 'Taxa menor, interface simples', 'Começando ou vendendo direto (sem afiliados)'],
            ['Eduzz', '4.99% por venda', 'Opções de upsell avançadas', 'Quem quer funil de vendas mais complexo'],
            ['Teachable', 'US$29/mês + taxas', 'Experiência do aluno superior', 'Audiência internacional ou premium BR'],
            ['Próprio (Memberkit)', 'Plano fixo ~R$97/mês', 'Controle total, zero taxas por venda', 'Depois de validar — escala sem % crescente'],
          ]}
        />
      </Section>

      <Section title="Precificação e estrutura de produto" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Faixa de preço', 'Tipo de produto', 'Exemplo']}
          rows={[
            ['R$47-97', 'Mini-curso ou workshop gravado', 'Curso de 2h: "Excel para Devs"'],
            ['R$197-497', 'Curso completo com suporte limitado', '"Python para automação do zero"'],
            ['R$497-997', 'Curso + comunidade + mentoria em grupo', '"Carreira Dev em 90 dias"'],
            ['R$997-2997', 'Mentoria em grupo intensiva', '"Bootcamp Go Backend com projeto real"'],
            ['R$3k-10k+', 'Mentoria individual ou cohort premium', '"Aceleração para sênior — 6 meses"'],
          ]}
        />
        <DecisionBox
          scenario="Primeiro curso — qual preço e formato escolher?"
          winner="R$197-297, curso de 4-6h com comunidade no WhatsApp/Discord"
          winnerColor={ACCENT}
          why="Preço suficiente para criar comprometimento do aluno, baixo o suficiente para ter primeiros 20-30 compradores sem audiência grande. Comunidade de WhatsApp/Discord não exige produção extra e cria pertencimento que aumenta conclusão e depoimentos."
          alternatives={[
            { name: 'Mini-curso R$47-97', note: 'Serve para validação rápida de tema — depois eleva preço na versão completa' },
            { name: 'Workshop ao vivo + gravação', note: 'Receita imediata + conteúdo gravado para vender depois — melhor ROI de tempo' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Preciso de grande audiência para lançar curso?"
          a={<>Não — a maioria dos primeiros lançamentos bem-sucedidos começa com menos de 500 seguidores. O que importa é audiência qualificada: 500 pessoas que têm o problema que seu curso resolve valem mais que 50 mil seguidores genéricos. Estratégia para audiência pequena: venda direta (mensagem pessoal para leads qualificados), parceria com criadores do mesmo nicho, e grupos de WhatsApp/Discord onde seu público se concentra. O primeiro lançamento é sempre o mais difícil — depois, depoimentos e indicações alimentam os próximos.</>}
        />
        <QAItem
          q="Como criar conteúdo de qualidade sem estúdio?"
          a={<>Setup mínimo para gravação de curso com qualidade aceitável: microfone USB (R$180-250), luz de anel LED (R$60-100), e fundo neutro ou virtual. Gravação de tela com voz tem qualidade mais que suficiente para cursos técnicos (programação, planilhas, ferramentas). Para cursos de câmera: notebook moderno tem webcam aceitável para começar. O audio é o mais importante — ruim aí, o aluno desiste. Invista no microfone antes de qualquer outro equipamento.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Valide com pré-venda antes de gravar — 10 compradores antes de
        gravar uma aula. Preço R$197-497 supera R$47 em comprometimento, conclusão e margem. Hotmart
        para afiliados, Kiwify para venda direta. Taxa de conclusão {'>'} 40% é mais importante que
        número de alunos. Primeiro lançamento: audiência pequena qualificada {'>'} audiência grande
        desalinhada.
      </Callout>
    </div>
  );
}
