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

export const metadata = getModuleMetadata('carreira-freelance-br');

const ACCENT = '#34d399';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que a maioria dos freelas no Brasil cobra abaixo do mercado?',
    options: [
      'Porque o mercado brasileiro paga menos que o internacional por natureza',
      'Porque calculam apenas tempo de execução, ignorando: impostos (~15-27.5% PF ou MEI), tempo improdutivo (vendas, reuniões, admin), férias e décimo-terceiro que não recebem, e riscos de inadimplência — a taxa horária real precisa ser 2-3x a CLT equivalente',
      'Porque há excesso de freelas no Brasil, o que derruba os preços',
      'Porque freelas novos devem cobrar menos para conseguir clientes — depois aumentam',
    ],
    correct: 1,
    explanation:
      'Cálculo correto da taxa horária freelance: salário CLT desejado ÷ 0.6 (para cobrir impostos e encargos) ÷ horas faturáveis reais (não horas trabalhadas — em média 60-70% do tempo total é faturável). Exemplo: quer equivalente a R$10k CLT → precisa faturar R$16.5k/mês → com 120h faturáveis = R$137/h mínimo. Quem cobra R$50/h achando que é R$50/h CLT está perdendo dinheiro.',
  },
  {
    question: 'Qual a diferença entre ser MEI e trabalhar como PF para freelas no Brasil?',
    options: [
      'MEI e PF são equivalentes para freelas — a escolha é apenas preferência pessoal',
      'MEI: limite de R$81k/ano, impostos fixos (~R$70/mês), emite NF de serviço, mais credibilidade com clientes PJ. PF: sem limite de faturamento, mas IRPF de 27.5% sobre o excedente, sem NF, muitos clientes PJ não contratam PF',
      'MEI é obrigatório para qualquer freela com faturamento acima de R$1k/mês',
      'PF paga menos impostos que MEI — sempre mais vantajoso para iniciantes',
    ],
    correct: 1,
    explanation:
      'MEI é a estrutura mais comum para freelas brasileiros começando. Limite de R$81k/ano (2025), DAS único de ~R$70/mês, emite NF de serviço, CNPJ facilita abrir conta PJ e contratar clientes empresariais. Para faturamento acima de R$81k, migrar para ME (Microempresa) com Simples Nacional. Importante: MEI não pode ter sócio nem contratar funcionários CLT.',
  },
  {
    question: 'Qual é a melhor forma de conseguir os primeiros clientes como freela?',
    options: [
      'Cadastrar em plataformas como Workana e 99Freelas e competir por preço',
      'Resolver problema real de alguém da sua rede (ex-colega, empresa onde trabalhou, indicação) — o primeiro cliente quase sempre vem de rede próxima, não de plataforma. Plataformas são para depois de ter cases reais',
      'Criar site profissional e aguardar clientes encontrarem via Google',
      'Oferecer trabalho gratuito inicialmente para construir portfólio',
    ],
    correct: 1,
    explanation:
      'Plataformas de freela têm guerra de preços e clientes que querem o mais barato. Primeiros 3 clientes quase sempre vêm de: (1) rede pessoal direta — ex-colegas, amigos, ex-empregadores; (2) indicação de quem já trabalhou com você; (3) comunidade onde você é conhecido (Discord, grupos de WhatsApp de tech). A abordagem: "estou abrindo agenda para projetos freelance — você conhece alguém que precisa de X?" é mais eficaz que plataforma.',
  },
  {
    question: 'Como estruturar um contrato de freela para evitar calote?',
    options: [
      'Contratos complicam a relação com o cliente — trabalhe na base da confiança',
      '50% upfront antes de começar, 50% na entrega. Contrato com escopo definido (o que está incluído E o que não está), prazo explícito, processo de aprovação, e o que acontece em caso de mudanças de escopo — isso previne 90% dos conflitos',
      'Pedir 100% adiantado para garantir pagamento — clientes sérios aceitam',
      'Receber apenas na entrega final — demonstra confiança no próprio trabalho',
    ],
    correct: 1,
    explanation:
      '50% upfront filtra clientes ruins (quem não paga 50% não pagaria nada) e garante que você não trabalha de graça. O escopo detalhado previne "mas eu pensei que incluía..." que causa calote ou conflito. Para projetos maiores: 30% início, 30% marco intermediário, 40% entrega. Contrato simples de 1 página em Word ou Docusign serve — não precisa de advogado para projetos pequenos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="carreira-freelance-br"
      title="Freelance no Brasil: como começar, cobrar bem e ter clientes recorrentes"
      icon="🧑‍💻"
      xp={70}
      readTime={13}
      trailName="Carreira Digital"
      trailColor={ACCENT}
      nextSlug="carreira-crescimento-junior-senior"
      nextTitle="Crescimento Junior a Sênior: o que ninguém te conta"
      relatedSlugs={['carreira-trabalho-remoto', 'empreend-freelance-clientes', 'empreend-financas-digital']}
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
        O mercado freelance tech brasileiro movimentou R$4.2 bilhões em 2024 (SEBRAE). Com a consolidação
        do trabalho remoto, freelas com especialidade clara ganham mais que CLT equivalente — sem chefe
        e com liberdade de horário. Mas a maioria cobra errado, pega clientes errados, e sai do freelance
        antes de ver o potencial real. Este módulo mostra o caminho certo.
      </p>

      <Section title="Quanto cobrar: a matemática real" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Descrição', 'Exemplo prático']}
          rows={[
            ['Salário CLT desejado', 'Quanto você quer ter no bolso', 'R$8.000/mês'],
            ['Fator impostos + encargos', 'Divide por 0.6 para cobrir impostos + FGTS equivalente', 'R$8k ÷ 0.6 = R$13.333'],
            ['Horas faturáveis reais', '60-70% do tempo total (resto é admin, vendas, aprendizado)', '120h/mês de 160h totais'],
            ['Taxa horária mínima', 'Faturamento necessário ÷ horas faturáveis', 'R$13.333 ÷ 120h = R$111/h'],
            ['Margem de risco', '+20-30% para vacância entre projetos', 'R$130-145/h'],
          ]}
        />
        <Callout tone="info">
          Para 2026, taxa média de dev backend sênior freela no Brasil: R$120-180/h. Frontend sênior:
          R$100-150/h. Designer UI/UX sênior: R$90-140/h. Não confunda com salário CLT — o freela
          cobre o que o empregador pagaria em encargos.
        </Callout>
      </Section>

      <Section title="Como conseguir e manter clientes de qualidade" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Canal', 'Eficácia', 'Para quem']}
          rows={[
            ['Rede pessoal direta', 'Mais alta', 'Primeiros clientes — sempre comece aqui'],
            ['LinkedIn com conteúdo', 'Alta a médio prazo', 'Especialistas com presença ativa'],
            ['Indicação de clientes atuais', 'Mais alta depois da 1a', 'Peça explicitamente: "conhece alguém que precisa?"'],
            ['Workana/99Freelas', 'Baixa — guerra de preços', 'Evite ou use apenas para portfólio inicial'],
            ['Toptal/Turing (internacional)', 'Alta em USD', 'Inglês fluente + processo seletivo rigoroso'],
            ['Comunidade Discord/Slack', 'Média-alta', 'Responder dúvidas gera credibilidade e indicações'],
          ]}
        />
        <DecisionBox
          scenario="Primeira semana como freela: onde buscar o primeiro cliente"
          winner="Lista de 20 contatos + mensagem personalizada a cada um"
          winnerColor={ACCENT}
          why="90% dos primeiros clientes freela vêm de rede existente. Plataformas têm barreira alta e guerra de preço. Rede pessoal tem contexto, confiança, e você não precisa competir por preço."
          alternatives={[
            { name: 'LinkedIn mensagem fria', note: 'Funciona com especialidade clara e portfólio demonstrável' },
            { name: 'Parceria com agência', note: 'Agências web frequentemente precisam de devs/designers para overflow — buscar agências locais' },
          ]}
        />
      </Section>

      <Section title="Gestão: o que freelas negligenciam" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Área', 'Erro comum', 'Prática correta']}
          rows={[
            ['Contratos', 'Trabalhar sem contrato ou escopo', '50% upfront + escopo escrito + processo de mudanças'],
            ['Impostos', 'Não separar dinheiro para impostos', 'Conta separada PJ, separar 15-20% de cada pagamento'],
            ['Precificação', 'Cobrar por hora sem teto', 'Migrar para projeto fixo com escopo claro — mais previsível'],
            ['Diversificação', '1-2 clientes grandes', 'Nenhum cliente representa mais de 40% do faturamento'],
            ['Reserva de emergência', 'Gastar tudo no mês', '3-6 meses de despesas em conta separada'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale a pena fazer freela em paralelo com CLT?"
          a={<>Sim, com cuidados. Verifique seu contrato CLT: alguns proíbem prestação de serviço para concorrentes ou têm cláusula de não-competição. Para clientes em áreas diferentes da sua empresa CLT, geralmente não há problema. Abrir MEI não cria conflito com CLT. Benefício: você constrói portfólio e clientes antes de depender 100% do freela — reduz o risco da transição. Limite aceitável: 8-12h/semana de freela em paralelo com CLT full-time.</>}
        />
        <QAItem
          q="Como escalar freela além de trocar tempo por dinheiro?"
          a={<>A escada: (1) freela de execução (você faz tudo), (2) freela com assistente ou subcontratado (você vende + coordena), (3) agência/consultoria pequena (você vende, time executa), (4) produtos digitais (curso, template, SaaS) que vendem enquanto você dorme. A transição de 1 para 2 exige aprender a delegar e a precificar o projeto (não hora) — muitos ficam presos no passo 1 por não desenvolver essas habilidades.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Calcule taxa horária real: salário desejado ÷ 0.6 ÷ horas faturáveis
        reais. Primeiros clientes vêm da rede — não de plataformas. 50% upfront + contrato com escopo
        previnem calote. Nenhum cliente deve representar mais de 40% do faturamento. Abra MEI para
        emitir NF e ter CNPJ. Separe 15-20% de cada pagamento para impostos.
      </Callout>
    </div>
  );
}
