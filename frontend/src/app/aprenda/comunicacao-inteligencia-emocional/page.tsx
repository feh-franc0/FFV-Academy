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

export const metadata = getModuleMetadata('comunicacao-inteligencia-emocional');

const ACCENT = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o "sequestro da amígdala" e como afeta profissionais?',
    options: [
      'Uma técnica de persuasão que ativa emoções do interlocutor',
      'Quando a amígdala (sistema límbico) assume o controle do comportamento em resposta a ameaça percebida — o córtex pré-frontal fica offline. Você age impulsivamente antes de pensar. Em profissionais: reação agressiva em reunião tensa, e-mail ríspido enviado no calor do momento',
      'Estado de flow onde emoções e razão trabalham juntos de forma ótima',
      'Técnica de mindfulness para controlar emoções em situações de pressão',
    ],
    correct: 1,
    explanation:
      'O sequestro da amígdala dura 6-20 minutos. Durante esse período, sua capacidade de raciocínio complexo e empatia está reduzida. Sinais físicos: batimento cardíaco acima de 100bpm, tensão muscular, pensamento em túnel. A solução não é suprimir a emoção, mas criar pausa: "preciso de 5 minutos para pensar nisso" é a resposta mais inteligente em qualquer conflito profissional.',
  },
  {
    question: 'Quais são os 4 componentes da Inteligência Emocional segundo Goleman?',
    options: [
      'Felicidade, empatia, autocontrole e motivação',
      'Autoconsciência (reconhecer suas emoções), autorregulação (gerenciar reações), empatia (reconhecer emoções nos outros), e habilidades sociais (gerenciar relacionamentos)',
      'QI emocional, QI social, QI relacional e QI situacional',
      'Resiliência, adaptabilidade, comunicação e liderança',
    ],
    correct: 1,
    explanation:
      'Autoconsciência é a base: sem saber o que você está sentindo, não é possível regular. Autorregulação permite escolher como responder em vez de reagir automaticamente. Empatia é reconhecer o estado emocional do outro sem necessariamente concordar. Habilidades sociais integram tudo para gerenciar conversas difíceis, conflitos e motivação de equipe. IE prediz sucesso profissional melhor que QI acima de um limiar básico (Goleman, 1995 — replicado em dezenas de estudos).',
  },
  {
    question: 'Como dar feedback negativo de forma emocionalmente inteligente?',
    options: [
      'Usar o método sanduíche: elogio + crítica + elogio',
      'Foco no comportamento específico (não na pessoa), no impacto observável, e perguntar a perspectiva do outro antes de concluir — "Quando X aconteceu, o impacto foi Y. O que estava acontecendo do seu lado?"',
      'Ser direto e objetivo sem rodeios — emoção não tem lugar em feedback profissional',
      'Aguardar o momento ideal — nunca dar feedback negativo quando há pressão de prazo',
    ],
    correct: 1,
    explanation:
      'Feedback emocionalmente inteligente segue SBI + curiosidade: Situation (situação específica), Behavior (comportamento observável, não interpretação), Impact (impacto concreto), + pergunta curiosa. "Na reunião de ontem (S), quando você interrompeu Ana três vezes (B), ela parou de contribuir e o grupo perdeu perspectiva importante (I). O que estava acontecendo do seu lado?" Isso convida reflexão, não defensividade.',
  },
  {
    question: 'Qual a diferença entre empatia e simpatia na prática profissional?',
    options: [
      'São sinônimos — ambas envolvem se importar com o outro',
      'Simpatia é "sinto muito por você" — você olha de fora para o problema da pessoa. Empatia é "eu entendo de dentro" — você reconhece o sentimento sem julgamento. Empatia conecta; simpatia frequentemente minimiza',
      'Empatia é mais adequada para contextos pessoais; simpatia para profissionais',
      'Simpatia é mais eficaz em situações de alto estresse pois é mais direta',
    ],
    correct: 1,
    explanation:
      'Brené Brown explica: simpatia tende a começar com "pelo menos..." ("pelo menos você ainda tem emprego") — isso minimiza a experiência do outro. Empatia começa com "eu entendo que isso é difícil" sem tentar consertar ou relativizar. Em gestão de equipes, emprego de empatia em conversas difíceis está correlacionado com 31% maior retenção de talentos (Gallup 2023).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comunicacao-inteligencia-emocional"
      title="Inteligência Emocional: a habilidade que diferencia líderes"
      icon="🧠"
      xp={70}
      readTime={12}
      trailName="Comunicação Humana"
      trailColor={ACCENT}
      nextSlug="carreira-portfolio-digital"
      nextTitle="Portfólio Digital: presença que abre portas"
      relatedSlugs={['comunicacao-feedback', 'comunicacao-escuta-ativa', 'comunicacao-networking']}
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
        Inteligência Emocional (IE) prediz sucesso profissional melhor que QI para a maioria das funções
        acima de um nível técnico básico. 90% dos top performers têm IE alta (TalentSmart, 2023). No
        ambiente digital — com pressão constante, trabalho remoto e comunicação assíncrona — IE é a
        habilidade que separa quem sobe de quem estagna.
      </p>

      <Section title="Os 4 componentes da IE na prática" accent={ACCENT}>
        <LayerStack
          title="Pilares da Inteligência Emocional"
          accent={ACCENT}
          separatorLabel="constrói sobre →"
          layers={[
            { label: 'Autoconsciência', content: 'Reconhecer suas emoções no momento em que ocorrem', note: 'fundação — sem isso o resto não funciona', tone: 'writable' },
            { label: 'Autorregulação', content: 'Escolher como responder em vez de reagir automaticamente', tone: 'writable' },
            { label: 'Empatia', content: 'Reconhecer e compreender emoções nos outros', tone: 'writable' },
            { label: 'Habilidades sociais', content: 'Gerenciar relacionamentos, conflitos e influência', note: 'aplicação final', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Baixa IE', 'Alta IE']}
          rows={[
            ['Autoconsciência', 'Surpreendido por próprias reações', 'Identifica emoção antes de agir'],
            ['Autorregulação', 'E-mail ríspido enviado no calor', 'Pausa, processa, responde com intenção'],
            ['Empatia', '"Não entendo por que ela ficou assim"', '"Faz sentido ela estar frustrada — isso"'],
            ['Habilidades sociais', 'Conflitos escalam, equipe tensa', 'Conflitos resolvidos, equipe alinhada'],
          ]}
        />
      </Section>

      <Section title="Autorregulação: como não explodir em situações difíceis" accent={ACCENT}>
        <Callout tone="info">
          <strong>Técnica do "espaço entre estímulo e resposta":</strong> Quando sentir o sequestro
          da amígdala (coração acelerado, tensão, pensamento em túnel), diga: "Preciso de 5 minutos
          para pensar nisso." Essa frase nunca soa fraca — soa madura.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Como funciona', 'Quando usar']}
          rows={[
            ['Pausa intencional', '"Preciso de 5min para pensar" — cria espaço', 'Qualquer conflito ou provocação'],
            ['Nomeação emocional', '"Estou me sentindo frustrado com X" — nomear reduz intensidade', 'Quando emoção intensa surgir'],
            ['Respiração 4-7-8', 'Inspire 4s, segure 7s, expire 8s — ativa parassimpático', 'Antes de conversa difícil'],
            ['Reframing', '"Esse problema é uma oportunidade de X"', 'Situações de alto estresse'],
            ['Distância temporal', '"Como verei isso em 5 anos?"', 'Conflitos que parecem enormes no momento'],
          ]}
        />
      </Section>

      <Section title="IE em ambientes de trabalho remoto e digital" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Desafio remoto', 'Impacto emocional', 'Solução de IE']}
          rows={[
            ['Ausência de sinais não-verbais', 'Mal-entendidos frequentes em texto', 'Assumir boa intenção, clarificar antes de concluir'],
            ['Isolamento social', 'Diminuição de pertencimento', '1:1s regulares, não só sobre trabalho'],
            ['Notificações constantes', 'Hiperativação do sistema nervoso', 'Blocos de foco, notificações desligadas'],
            ['Reuniões excessivas', 'Fadiga de videoconferência', 'Check-in emocional de 2min no início de 1:1s'],
            ['Feedback assíncrono', 'Tom interpretado como ríspido', 'Emojis estratégicos, vídeo para feedback sensível'],
          ]}
        />
        <DecisionBox
          scenario="Como usar IE ao dar feedback negativo para um colega sênior que reagiu mal antes"
          winner="SBI + curiosidade empática"
          winnerColor={ACCENT}
          why="Foco no comportamento específico (não na pessoa), impacto observável, e pergunta curiosa cria abertura em vez de defensividade. Funciona mesmo com pessoas que resistem a feedback."
          alternatives={[
            { name: 'Conversa com gestor mediando', note: 'Para situações onde o histórico de conflito impossibilita conversa direta' },
            { name: 'Feedback por escrito primeiro', note: 'Permite processamento emocional antes da conversa ao vivo' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="IE pode ser desenvolvida ou é um traço fixo de personalidade?"
          a={<>IE é altamente desenvolvível — diferente de QI, que tem forte componente genético. Estudos com neuroplasticidade mostram que práticas deliberadas (mindfulness, diário emocional, prática de escuta ativa) aumentam IE mensurável em 6-12 semanas. O livro "Primal Leadership" de Goleman e a certificação de EQ-i são recursos práticos para quem quer desenvolver de forma estruturada.</>}
        />
        <QAItem
          q="Como usar IE para lidar com colega ou gestor difícil sem confronto direto?"
          a={<>Primeiro: separe intenção de impacto — a pessoa provavelmente não acorda querendo dificultar sua vida; o comportamento difícil geralmente é sintoma de insegurança ou pressão não gerenciada. Segundo: identifique o que você precisa e peça de forma clara e não acusatória ("Quando X acontece, eu fico travado em Y. Posso contar com você para Z?"). Terceiro: documente padrões e envolva gestor apenas se afeta entregas — com dados, não com queixas emocionais.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> IE prediz sucesso profissional melhor que QI acima de um nível
        técnico básico. Os 4 pilares: autoconsciência → autorregulação → empatia → habilidades sociais.
        Para sequestro da amígdala: "preciso de 5 minutos" é a frase mais inteligente. Empatia conecta;
        simpatia minimiza. Feedback eficaz: comportamento específico + impacto observável + curiosidade
        ("o que estava acontecendo do seu lado?"). IE é desenvolvível — pratique de forma deliberada.
      </Callout>
    </div>
  );
}
