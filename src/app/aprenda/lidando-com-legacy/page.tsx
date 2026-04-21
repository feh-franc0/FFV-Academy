import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lidando-com-legacy');
const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Chesterton\'s Fence e por que importa em legacy?',
    options: [
      'Uma técnica de refatoração',
      'Princípio de Chesterton: antes de remover uma cerca no meio do caminho, descubra por que ela foi construída. Código legacy tem cercas — hacks estranhos, condições exóticas — que parecem "burras" até você descobrir o bug em produção que elas previnem',
      'Padrão de arquitetura',
      'Sinônimo de dead code',
    ],
    correct: 1,
    explanation: 'G.K. Chesterton, ~1929: "não remova a cerca até saber por que foi posta lá". Aplicado a código: aquele if (x === "" || x === null || x === undefined) que parece redundante provavelmente foi adicionado após bug real. Antes de limpar, rode git blame, leia o commit, busque o ticket. Se não entende o motivo, você é quem ainda não sabe o suficiente — não o autor original.',
  },
  {
    question: 'Por que characterization tests vêm antes da refatoração de legacy?',
    options: [
      'Para documentar',
      'Legacy geralmente não tem testes. Characterization tests capturam o comportamento ATUAL (mesmo bugs preservados, se usuários dependem) pra servir de rede de segurança — só depois disso você muda implementação com confiança',
      'Para aumentar cobertura',
      'São obrigatórios por lei',
    ],
    correct: 1,
    explanation: 'Conceito do Feathers ("Working Effectively with Legacy Code"). Diferente de unit test tradicional (que valida comportamento desejado), characterization test grava o que o sistema FAZ hoje — mesmo que errado, se produção depende disso. Você executa contra a implementação, captura saída, vira asserção. Depois refatora: se test quebra, é porque mudou comportamento observável. Rede de segurança real antes de tocar em qualquer linha.',
  },
  {
    question: 'O que é strangler fig pattern?',
    options: [
      'Reescrita big bang',
      'Padrão de Martin Fowler inspirado na figueira estranguladora: novo sistema cresce em torno do legacy interceptando rotas uma a uma; legacy fica menor a cada release até ser removido. Evita risco do big bang rewrite',
      'Refatoração agressiva',
      'Sinônimo de branch by abstraction',
    ],
    correct: 1,
    explanation: 'Fowler, 2004. Figueira estranguladora cresce em torno da árvore hospedeira até substituí-la. Em software: proxy/gateway na frente do legacy, cada rota nova ou migrada vai pro sistema novo, legacy perde responsabilidade gradualmente. Vantagem: sistema sempre funciona, risco distribuído, rollback por rota trivial. Big bang rewrite (Joel Spolsky: "pior erro estratégico possível") quase sempre atrasa, perde features implícitas e quebra clientes.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lidando-com-legacy"
      title="Lidar com legacy: Chesterton fence + strangler"
      icon="🏛️"
      xp={55}
      readTime={13}
      trailName="Tech Leadership & Staff Engineering"
      trailColor={accent}
      nextSlug="carreira-tecnica-vs-gestao"
      nextTitle="Carreira técnica vs gestão: escolha consciente"
      quiz={quiz}
    >
      <Section title="Legacy é código que gera dinheiro" accent={accent}>
        <p>
          Definição honesta: legacy é código em produção sem testes adequados ou sem quem entenda inteiramente. Quase sempre é também o código que gera receita — por isso está em produção. Senior engineer encara legacy com humildade: é testemunho de decisões feitas sob pressão por pessoas que talvez soubessem mais do que você sabe hoje.
        </p>
      </Section>

      <Section title="Chesterton's Fence" accent={accent}>
        <CodeBlock lang="ts">{`// Você chega no código e vê:
function parseAmount(raw: string): number {
  // Eita, por que essa normalização esquisita?
  const cleaned = raw
    .replace(/\\u00A0/g, ' ')     // non-breaking space
    .replace(/\\u2009/g, ' ')     // thin space
    .replace(/[,\\.](?=\\d{3})/g, ''); // separador de milhar
  return Number(cleaned.replace(',', '.'));
}

// Instinto: "que gambiarra, vou simplificar pra Number(raw)"
// Chesterton: git blame
// Commit: "fix: parsing de PDFs do Banco Central usa NBSP/thin space"
// Ticket: #4721 — financeiro perdendo lançamentos silenciosamente

// Conclusão: cerca foi construída por motivo real.
// Mantenha. Só simplifique depois de entender por completo.`}</CodeBlock>
      </Section>

      <Section title="Characterization tests primeiro" accent={accent}>
        <p>
          Legacy sem testes é caixa preta. Regra: antes de qualquer refatoração, escreva testes que <em>documentam o que o sistema faz hoje</em>, mesmo que pareça bug. Técnica: rode função com input real, capture saída, transforme em asserção. Em 1–2 dias você tem 50–100 testes cobrindo casos reais de produção.
        </p>
        <CodeBlock lang="python">{`# Golden master technique (characterization)
def test_characterize_parse_amount():
    fixtures = load_real_production_samples()  # 500 entradas de log
    for sample in fixtures:
        actual = parse_amount(sample.input)
        assert actual == sample.expected_output  # gravado da execução atual

# Rede de segurança: qualquer refatoração futura
# que quebre esses testes mudou comportamento observável.`}</CodeBlock>
      </Section>

      <Section title="Strangler fig na prática" accent={accent}>
        <CodeBlock lang="yaml">{`# Exemplo: migrar monolito PHP -> serviço Go
# Fase 1: proxy reverso na frente (Nginx/Envoy)
#   100% do tráfego ainda bate no monolito

# Fase 2: rota /api/v2/users vai pro serviço novo
#   Dual-write temporário no monolito
#   Compara saídas em sombra (canary compare)

# Fase 3: rotas migradas crescem; monolito encolhe
#   Feature flag por tenant permite rollback cirúrgico

# Fase 4: monolito vira leitura-apenas, depois arquivo
#   Morte cerimonial: commit final removendo o repo`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Cada rota migrada é release independente com rollback trivial. Risco nunca acumula. Clientes nunca percebem. Isso é engenharia de verdade — big bang rewrite é teatro.
        </Callout>
      </Section>

      <Section title="Fix-forward vs rollback" accent={accent}>
        <p>
          Em incident no legacy, instinto é rollback. Nem sempre é certo: se o commit que quebrou já tem dados novos dependentes, rollback causa corrupção. Fix-forward (patch rápido pra frente) pode ser mais seguro. Discussão no calor do incident é ruim — defina política em runbook antes.
        </p>
        <Callout tone="warn" icon="⚠️">
          Nunca prometa &quot;vou reescrever inteiro&quot; num projeto que gera receita. Promessa irrealista. Estime em meses o MVP funcional, multiplique por 3 pra paridade real de features. Então proponha strangler.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
