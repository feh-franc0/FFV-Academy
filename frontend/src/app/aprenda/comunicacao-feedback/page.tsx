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

export const metadata = getModuleMetadata('comunicacao-feedback');

const ACCENT = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o modelo "sandwich feedback" (elogio-crítica-elogio) não funciona?',
    options: [
      'Porque é desrespeitoso com quem recebe',
      'Porque o cérebro foca no elogio e minimiza a crítica — estudos mostram que a mensagem de melhoria é ignorada ou esquecida quando embrulhada em validação positiva. A crítica precisa de clareza, não de amortecimento',
      'Porque o modelo é muito antigo e modelos mais modernos já substituíram',
      'Porque cria constrangimento quando o elogio é artificial',
    ],
    correct: 1,
    explanation:
      'O "sandwich" foi popularizado com boa intenção — reduzir a carga emocional da crítica. O problema é que o cérebro humano prioriza informação positiva (viés de positividade) e tende a ignorar o ponto negativo no meio. Resultado: a pessoa sai do feedback se sentindo bem sem nenhuma clareza sobre o que precisa mudar. Feedback eficaz é direto, específico e empático — não suavizado.',
  },
  {
    question: 'O que o modelo SBI (Situation-Behavior-Impact) inclui que feedback comum não tem?',
    options: [
      'Mais elogios para equilibrar a crítica',
      'Situação específica + comportamento observável (não julgamento) + impacto real mensurável — sem inferência sobre intenção ou caráter. Isso remove defensividade porque descreve fatos, não julgamentos',
      'Linguagem mais formal para dar peso à mensagem',
      'Referência a políticas e regras da empresa',
    ],
    correct: 1,
    explanation:
      'SBI separa o que aconteceu (situação + comportamento) do julgamento sobre a pessoa. "Você é desorganizado" é julgamento que gera defensividade. "Na terça-feira, o relatório chegou 2 dias após o prazo acordado, e a equipe teve que refazer o cronograma" é observação de fato + impacto. A pessoa pode discordar do impacto, mas não pode negar o comportamento descrito factualmente.',
  },
  {
    question: 'Como receber feedback crítico sem reagir defensivamente?',
    options: [
      'Concordar com tudo para demonstrar abertura',
      '"Obrigado pelo feedback. Posso pensar sobre isso e conversar mais na semana?" — você agradece (valida que a pessoa se arriscou ao dar), pede tempo para processar (evita reação emocional imediata) e mantém a porta aberta para aprofundar',
      'Pedir exemplos específicos imediatamente para contestar',
      'Anotar sem comentar e avaliar depois sozinho',
    ],
    correct: 1,
    explanation:
      'O impulso defensivo é biológico — feedback crítico ativa a amígdala como ameaça. Resposta imediata sob ativação emocional raramente é a melhor. Agradecer primeiro (mesmo que discorde) é contra-intuitivo mas eficaz: demonstra maturidade, reduz a tensão da conversa e dá espaço para processar. O tempo para pensar não é fraqueza — é inteligência emocional aplicada.',
  },
  {
    question: 'Quando feedback deve ser dado de forma ascendente (para quem tem poder sobre você)?',
    options: [
      'Nunca — o risco é muito alto para a relação',
      'Quando há comportamento com impacto real e recorrente, quando há confiança mínima na relação, e quando você tem exemplo específico e SBI preparado. Feedback ascendente bem dado fortalece a relação — mal dado a destrói',
      'Somente em avaliações formais de 360 graus',
      'Apenas quando solicitado explicitamente pelo gestor',
    ],
    correct: 1,
    explanation:
      'Feedback ascendente é necessário para organizações saudáveis e para sua própria credibilidade como profissional que tem perspectiva própria. A chave é timing e preparação: escolha momento privado e calmo, tenha exemplo específico (SBI), foque no impacto no trabalho (não no comportamento pessoal), e enquadre como informação que você quer dar, não julgamento.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comunicacao-feedback"
      title="Dar e receber feedback de verdade"
      icon="🔁"
      xp={50}
      readTime={12}
      trailName="Comunicação Humana"
      trailColor={ACCENT}
      nextSlug="comunicacao-escuta-ativa"
      nextTitle="Escuta ativa: a habilidade mais subestimada"
      relatedSlugs={['comunicacao-storytelling', 'comunicacao-escuta-ativa', 'comunicacao-inteligencia-emocional']}
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
        Feedback é a ferramenta mais poderosa e mais mal usada do ambiente de trabalho. A maioria das pessoas ou evita
        completamente ou dá feedback tão vago que não gera nenhuma mudança. Aprender a dar e receber feedback real é{' '}
        <strong>uma das habilidades que mais aceleram crescimento profissional e de time</strong>.
      </p>

      <Section title="Por que a maioria do feedback não funciona" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Feedback vago é pior do que ausência de feedback. "Bom trabalho" não ensina o que repetir. "Precisa melhorar"
          não ensina o que mudar. E o timing errado transforma feedback em pós-mortem.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Problema', 'Por que falha', 'Consequência']}
          rows={[
            ['"Bom trabalho"', 'Não especifica o que foi bom — não é replicável', 'Pessoa não sabe o que repetir'],
            ['"Precisa melhorar"', 'Não especifica o quê nem como — não é acionável', 'Pessoa não sabe o que mudar'],
            ['Feedback anual ou semestral', 'Muito longe do evento — contexto perdido, sem como corrigir no momento', 'Pós-mortem, não desenvolvimento'],
            ['Sandwich (elogio-crítica-elogio)', 'Cérebro foca no elogio e minimiza crítica', 'Crítica é ignorada ou esquecida'],
            ['Feedback em grupo', 'Vergonha pública ativa resposta de ameaça', 'Defensividade e ressentimento'],
          ]}
        />
        <Callout tone="warn">
          Feedback eficaz tem três características inegociáveis: <strong>específico</strong> (evento concreto),
          <strong> próximo ao evento</strong> (horas ou dias, não meses) e <strong>acionável</strong> (o que a pessoa
          pode fazer diferente). Sem os três, é desabafo, não feedback.
        </Callout>
      </Section>

      <Section title="O modelo SBI: Situation-Behavior-Impact" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          SBI separa observação de julgamento. Isso é crítico porque julgamento ativa defesa imediata, enquanto
          observação de fatos abre espaço para reflexão.
        </p>
        <LayerStack
          title="Estrutura SBI"
          accent={ACCENT}
          separatorLabel="COMPONENTES"
          layers={[
            { label: 'S — Situation (situação)', content: 'Onde e quando aconteceu. "Na reunião de alinhamento de terça-feira..." — específico, não genérico', note: '← "sempre" e "nunca" são generalizações que geram defensividade', tone: 'default' },
            { label: 'B — Behavior (comportamento)', content: 'O que foi observável, não interpretações. "Você interrompeu três colegas antes que terminassem..." — não "você é impaciente"', note: '← comportamento, não caráter', tone: 'default' },
            { label: 'I — Impact (impacto)', content: 'O efeito real e concreto. "...e dois colegas pararam de contribuir na discussão seguinte" — mensurável ou observável', note: '← impacto, não intenção inferida', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Feedback comum', 'Feedback SBI']}
          rows={[
            ['"Você é desorganizado"', '"Na entrega de sexta, o relatório chegou sem sumário executivo. O cliente teve que pedir para remarcar a reunião."'],
            ['"Você tem atitude negativa"', '"Nas três últimas retrospectivas, você saiu antes do fechamento. O time ficou sem sua perspectiva nos próximos passos."'],
            ['"Você precisa se comunicar melhor"', '"No update de ontem, você não mencionou o bloqueio técnico que sabia desde segunda. A decisão foi tomada com informação incompleta."'],
            ['"Ótimo trabalho!"', '"A apresentação para o cliente na terça foi objetiva e respondeu exatamente o que eles precisavam — eles confirmaram o contrato no dia seguinte."'],
          ]}
        />
      </Section>

      <Section title="Como receber feedback sem reagir defensivamente" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Receber feedback bem é tão importante quanto dar bem. O impulso defensivo é neurobiológico — não é falha de
          caráter. Mas pode ser gerenciado com técnica.
        </p>
        <LayerStack
          title="Protocolo de recebimento de feedback"
          accent={ACCENT}
          separatorLabel="SEQUÊNCIA"
          layers={[
            { label: '1. Ouça sem interromper', content: 'Resistir ao impulso de explicar, justificar ou corrigir enquanto a pessoa ainda está falando', note: '← interromper encerra o feedback imediatamente', tone: 'default' },
            { label: '2. Agradeça antes de processar', content: '"Obrigado — fico feliz que você trouxe isso" — mesmo que discorde. Valida a coragem de dar feedback', note: '← isso é difícil e contra-intuitivo', tone: 'default' },
            { label: '3. Peça tempo se precisar', content: '"Posso pensar sobre isso e voltar para conversar mais?" — não reaja no estado emocional ativado', note: '← tempo não é evitação', tone: 'writable' },
            { label: '4. Processe separando identidade de comportamento', content: 'O feedback é sobre o que você fez, não sobre quem você é. "Minha apresentação foi confusa" ≠ "Eu sou incompetente"', tone: 'writable' },
            { label: '5. Volte com perguntas', content: '"Pode me dar um exemplo específico?" / "O que você teria feito diferente?" — aprofunda o feedback e demonstra abertura real', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          Separar identidade de comportamento é o princípio central. Feedback ataca comportamentos — mas o cérebro
          interpreta como ataque à pessoa. Praticar a reformulação interna: "Isso diz algo sobre o que fiz nesse
          contexto, não sobre quem eu sou" reduz a ativação emocional e abre espaço para aprendizado.
        </Callout>
      </Section>

      <Section title="Feedback contínuo vs avaliação formal" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A avaliação anual ou semestral é o sistema mais ineficaz para desenvolvimento — os eventos que deram origem
          ao feedback ocorreram meses atrás, o contexto foi perdido e não há como corrigir retroativamente.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feedback contínuo', 'Avaliação formal anual']}
          rows={[
            ['Próximo ao evento — dentro de 24-72h', 'Meses depois do evento'],
            ['Específico e acionável imediatamente', 'Generalizado por necessidade de síntese'],
            ['Baixa carga emocional — evento recente', 'Alta carga — impacto em salário/promoção'],
            ['Permite ajuste no mesmo projeto', 'Post-mortem de projeto encerrado'],
            ['Frequência: diário ou semanal (informal)', 'Frequência: 2x por ano'],
          ]}
        />
        <Callout tone="success">
          O modelo mais eficaz de feedback contínuo: "continue/pare/comece" em retrospectivas quinzenais de 15 minutos.
          Continue: o que está funcionando e deve ser mantido. Pare: o que está criando atrito ou custo. Comece: o que
          ainda não existe e faria diferença. Simples, acionável, sem drama.
        </Callout>
      </Section>

      <Section title="Conversas difíceis: o protocolo" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Feedback se torna "conversa difícil" quando o comportamento é recorrente, o impacto é sério, ou há componente
          emocional relevante para uma das partes. Essas conversas têm protocolo.
        </p>
        <LayerStack
          title="Preparação para conversa difícil"
          accent={ACCENT}
          separatorLabel="PREP"
          layers={[
            { label: 'Defina o comportamento específico', content: 'Qual comportamento concreto (não julgamento) você vai abordar? Tenha 2-3 exemplos recentes', tone: 'default' },
            { label: 'Defina o impacto mensurável', content: 'Qual é o impacto real no trabalho, no time ou no cliente? Não use impacto emocional seu como argumento central', tone: 'default' },
            { label: 'Defina o que você quer que mude', content: 'Qual é o comportamento alternativo que você está pedindo? Seja específico — não "seja mais proativo"', tone: 'writable' },
            { label: 'Escolha local, hora e formato', content: 'Privado, momento calmo, nunca na sexta às 18h, nunca após conflito emocional recente', tone: 'writable' },
            { label: 'Abertura da conversa', content: '"Tenho algo importante para compartilhar com você. Você tem 15 minutos agora?" — sem surpresa, sem emboscada', tone: 'success' },
          ]}
        />
        <DecisionBox
          scenario="Comportamento recorrente com impacto negativo no time"
          winner="Conversa direta com SBI preparado"
          winnerColor={ACCENT}
          why="Feedback direto e específico é a única via que dá à pessoa a informação necessária para mudar. Outras opções contornam o problema sem resolvê-lo."
          alternatives={[
            { name: 'Escalada imediata para gestor', note: 'Válida apenas se você já tentou a conversa direta ou se há questão de segurança psicológica' },
            { name: 'Ignorar e esperar melhorar sozinho', note: 'O comportamento que não recebe feedback geralmente piora ou permanece — raramente melhora' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como dar feedback para alguém mais sênior ou mais experiente?"
          a={<>O SBI funciona independentemente de hierarquia — você está descrevendo um comportamento observável e seu impacto, não julgando a competência da pessoa. Enquadre como informação que você tem e acha que pode ser útil: "Observei algo que quero compartilhar, me diga se faz sentido para você." A postura de humildade na entrega não dilui a clareza do conteúdo.</>}
        />
        <QAItem
          q="O que fazer quando alguém fica na defensiva mesmo com SBI?"
          a={<>Defensividade imediata é normal — não é falha do feedback nem da pessoa. Não tente convencer no mesmo momento. Plante a semente e dê tempo: "Entendo que pode ser diferente da sua perspectiva. Não precisa responder agora — fica como reflexão." Em muitos casos, a pessoa volta dias depois tendo processado e aceita o feedback que recusou na hora.</>}
        />
        <QAItem
          q="Qual é a frequência ideal de feedback para um liderado?"
          a={<>Feedback positivo: imediatamente quando acontece o comportamento que você quer ver repetido. Feedback de desenvolvimento: dentro de 48-72h do evento, em 1:1 regular. Feedback de carreira: mensalmente, sobre padrões de longo prazo. Avaliação formal: 2x por ano, sem surpresas — tudo já foi discutido antes.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Feedback vago não gera mudança — especificidade e proximidade ao evento são
        inegociáveis. SBI separa observação de julgamento e remove defensividade. Receber bem é habilidade: agradeça
        primeiro, processe depois, separe identidade de comportamento. Feedback contínuo supera avaliação formal em
        qualquer métrica de desenvolvimento. Conversas difíceis têm protocolo — preparação é o que as torna possíveis.
      </Callout>
    </div>
  );
}
