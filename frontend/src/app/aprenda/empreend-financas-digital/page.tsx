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

export const metadata = getModuleMetadata('empreend-financas-digital');

const ACCENT = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que profissionais digitais autônomos precisam de reserva de emergência maior que CLTs?',
    options: [
      'Porque têm mais despesas com equipamento e infraestrutura digital',
      'Receita variável + ausência de seguro-desemprego = vacância entre projetos pode durar 1-3 meses. CLT tem colchão (FGTS + seguro-desemprego). Autônomo precisa de 6-12 meses de despesas fixas como reserva, vs 3-6 meses recomendados para CLT',
      'Porque a alíquota de imposto é maior para autônomos',
      'Não precisam — a variabilidade de renda compensa ao longo do ano',
    ],
    correct: 1,
    explanation:
      'CLT tem FGTS (8% do salário/mês) + seguro-desemprego. Autônomo não tem nenhum dos dois. Um projeto que cancela inesperadamente ou um cliente que atrasa 60 dias pode criar crise de caixa sem reserva adequada. A reserva de 6-12 meses não é exagero — é o equivalente ao colchão que o CLT tem embutido no sistema.',
  },
  {
    question: 'Qual estrutura tributária é mais vantajosa para freelas com faturamento de R$5k-15k/mês?',
    options: [
      'PF (Pessoa Física) — menos burocracia e sem custo de abertura de empresa',
      'MEI até R$6.75k/mês (limite de R$81k/ano). Acima disso, ME no Simples Nacional — alíquota de 6% sobre faturamento vs 27.5% de IRPF como PF. A diferença é R$10k+ anuais para quem fatura R$10k/mês',
      'LTDA — maior proteção jurídica justifica o custo de abertura',
      'Todas são equivalentes — a diferença é insignificante para faturamentos abaixo de R$20k/mês',
    ],
    correct: 1,
    explanation:
      'Comparação concreta: faturamento de R$10k/mês por ano = R$120k. Como PF: IRPF na tabela progressiva, chegando a R$20-25k de imposto. Como ME no Simples Nacional: ~R$7.2k (6% × R$120k). Diferença: ~R$15-17k por ano. A abertura de ME custa R$500-1000 em contador e tempo. Payback em menos de 1 mês de diferença tributária.',
  },
  {
    question: 'Qual é a estratégia de investimento mais adequada para renda variável?',
    options: [
      'Investir tudo na renda fixa — segurança é prioridade para quem tem renda variável',
      'Reserva de emergência em alta liquidez (Tesouro Selic ou CDB 100% CDI diário) primeiro, depois investimento de longo prazo em renda variável gradualmente. Nunca misturar reserva de emergência com investimentos de longo prazo',
      'Renda variável é inadequada para autônomos — foco exclusivo em renda fixa',
      'Reinvestir tudo no negócio até ter R$500k de faturamento acumulado',
    ],
    correct: 1,
    explanation:
      'Hierarquia de finanças para autônomo: (1) conta corrente com 2 meses de despesas para fluxo de caixa; (2) reserva de emergência com 6-12 meses em Tesouro Selic ou CDB liquidez diária; (3) previdência privada ou PGBL se alíquota de IR for alta; (4) renda variável para objetivos de longo prazo (5+ anos). A tentação de investir antes de ter reserva é o erro mais comum — na primeira crise de caixa, você resgata investimento de longo prazo com perdas.',
  },
  {
    question: 'Como separar finanças pessoais e do negócio como freela?',
    options: [
      'Não é necessário para MEI — a separação é apenas para empresas maiores',
      'Conta PJ separada para receber clientes, pagar fornecedores e impostos. Pró-labore mensal fixo transferido para conta pessoal. Isso elimina confusão contábil, facilita gestão de impostos, e revela lucro real do negócio',
      'Usar planilha de controle é suficiente — conta única simplifica a operação',
      'Separação só faz diferença após R$10k/mês de faturamento',
    ],
    correct: 1,
    explanation:
      'Misturar finanças pessoais e do negócio cria três problemas: (1) você não sabe se o negócio dá lucro real; (2) na declaração de IR, é impossível separar despesas dedutíveis; (3) clientes PJ frequentemente exigem CNPJ para transferência, e a conta PJ garante isso. Bancos com conta PJ gratuita para MEI/ME: Nubank PJ, Inter Empresas, Mercado Pago — zero de custo para começar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="empreend-financas-digital"
      title="Finanças do Profissional Digital: MEI, impostos e construção de patrimônio"
      icon="💰"
      xp={65}
      readTime={11}
      trailName="Empreendedorismo Digital"
      trailColor={ACCENT}
      nextSlug="empreend-curso-online"
      nextTitle="Curso Online: criar, lançar e escalar"
      relatedSlugs={['carreira-freelance-br', 'empreend-freelance-clientes', 'empreend-side-project']}
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
        Profissionais digitais autônomos ganham mais que CLTs equivalentes — mas também perdem mais se
        não gerenciarem bem. Sem FGTS, sem décimo-terceiro, sem seguro-desemprego e sem planejamento,
        a renda variável vira armadilha. Este módulo cobre o essencial: estrutura jurídica, impostos,
        reserva de emergência, e primeiros investimentos para quem tem renda variável.
      </p>

      <Section title="Estrutura jurídica: qual abrir e quando" accent={ACCENT}>
        <LayerStack
          title="Progressão de estrutura jurídica por faturamento"
          accent={ACCENT}
          separatorLabel="migra quando atingir limite →"
          layers={[
            { label: 'PF (até R$2k/mês)', content: 'Sem empresa, recolhe IRPF — aceitável para renda complementar muito baixa', note: 'evite acima de R$2k', tone: 'default' },
            { label: 'MEI (até R$6.75k/mês)', content: 'CNPJ, emissão de NF, DAS ~R$70/mês fixo — a melhor estrutura para começar', note: 'limite R$81k/ano', tone: 'writable' },
            { label: 'ME Simples Nacional (R$6.75k-33k/mês)', content: 'Alíquota 6-15.5% do faturamento, contador necessário (~R$150-300/mês)', tone: 'writable' },
            { label: 'EPP/Lucro Presumido (acima R$33k/mês)', content: 'Análise caso a caso — pode ser vantajoso com contador especializado', note: 'varia por atividade', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          MEI é o ponto de entrada ideal: zero complexidade, DAS fixo de ~R$70/mês, CNPJ para clientes
          PJ, e emissão de nota fiscal. Abra no gov.br em menos de 10 minutos, gratuitamente.
        </Callout>
      </Section>

      <Section title="Hierarquia financeira para autônomo digital" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Etapa', 'Meta', 'Onde guardar']}
          rows={[
            ['1. Conta corrente operacional', '2 meses de despesas fixas', 'Conta PJ (Nubank, Inter)'],
            ['2. Reserva de emergência', '6-12 meses de despesas', 'CDB liquidez diária 100%+ CDI ou Tesouro Selic'],
            ['3. Impostos provisionados', '15-20% de cada recebimento', 'Conta separada — não tocar'],
            ['4. Previdência (se IR alto)', 'PGBL até 12% da renda tributável', 'Fundo de previdência PGBL'],
            ['5. Investimentos longo prazo', 'Excedente após etapas 1-4', 'Renda variável, FIIs, CRIs/CRAs'],
          ]}
        />
      </Section>

      <Section title="Impostos: o que pagar e como não ser surpreendido" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estrutura', 'O que pagar', 'Quando']}
          rows={[
            ['MEI', 'DAS: ~R$70/mês (fixo)', 'Todo dia 20 do mês seguinte'],
            ['ME Simples', 'DAS: 6-15.5% do faturamento', 'Todo dia 20 do mês seguinte'],
            ['PF (complementar)', 'IRPF: carnê-leão mensal + DIRPF anual', 'Até dia 30 de cada mês'],
            ['Todos', 'IRPF anual (DIRPF): receitas + deduções', 'Até 31/maio de cada ano'],
          ]}
        />
        <DecisionBox
          scenario="Recebeu R$50k em um mês bom — como não perder para impostos e tentações"
          winner="Separar impostos + reserva imediatamente antes de qualquer gasto"
          winnerColor={ACCENT}
          why="Meses bons tentam o profissional a gastar mais. Mas meses ruins existem e os impostos do mês bom ainda vencem. Regra: ao receber, imediatamente transferir 15-20% para conta de impostos e ajustar reserva antes de calcular quanto sobrou para gastar."
          alternatives={[
            { name: 'Guardar tudo como reserva', note: 'Conservador demais — bloqueia capital que poderia trabalhar. Reserve o necessário, invista o resto' },
            { name: 'Pagar contador para cuidar de tudo', note: 'Para ME e acima: essencial — contador bom custa R$150-300/mês e economiza muito mais' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale a pena ter contador como MEI?"
          a={<>MEI não exige contador por lei — você mesmo pode emitir NF, pagar DAS, e fazer a declaração anual (DASN). No entanto, se você tem dúvidas sobre quais despesas são dedutíveis, se está considerando migrar para ME, ou se tem faturamento próximo do limite, um contador por R$100-150/mês é um bom investimento. Plataformas como ContaAzul e Nibo têm ferramentas de gestão financeira integradas que reduzem o trabalho de contador para MEI.</>}
        />
        <QAItem
          q="Como construir patrimônio com renda variável sem cair na armadilha do consumo?"
          a={<>Automatize antes de ter o dinheiro na mão: configure transferência automática para a conta de investimentos no mesmo dia em que recebe. Defina um "salário" fixo mensal para si mesmo via pró-labore — mesmo em meses bons, só "gaste" o pró-labore, não o faturamento total. Meses bons alimentam reserva e investimentos. Isso cria disciplina automática sem precisar de força de vontade. Objetivo inicial: 10% do faturamento mensal em investimentos de longo prazo.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> MEI para faturamento até R$81k/ano — abra no gov.br gratuitamente.
        ME Simples para acima disso — economiza R$15k+/ano vs PF. Reserva de emergência: 6-12 meses
        em liquidez diária antes de qualquer investimento. Separe 15-20% de cada recebimento para impostos
        imediatamente. Conta PJ separada da pessoal desde o primeiro real. Pró-labore fixo cria
        disciplina financeira automática.
      </Callout>
    </div>
  );
}
