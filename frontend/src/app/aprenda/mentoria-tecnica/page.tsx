import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mentoria-tecnica');
const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o risco do senior que sempre "resolve" o problema do júnior em vez de ensinar?',
    options: [
      'Economiza tempo a longo prazo',
      'Vira gargalo organizacional: nada progride sem ele, o júnior não aprende a pensar sozinho, e quando o senior sai o conhecimento vai junto. Mentoria de verdade é transferência de modelo mental, não de solução',
      'Não há risco, é eficiência',
      'Deixa o júnior mais feliz',
    ],
    correct: 1,
    explanation: 'Staff engineer é avaliado por força do time, não por heroismo individual. Resolver o ticket agora parece rápido, mas custa na escala: mesmo problema aparece repetido, ninguém além de você consegue atacar, você fica presa em tático sem tempo pra estratégico. Teach pattern (explain, do together, solo with review) multiplica capacidade do time.',
  },
  {
    question: 'Por que office hours estruturado funciona melhor que "me chama quando precisar"?',
    options: [
      'Parece mais profissional',
      'Janela previsível reduz o custo de interromper (júnior sabe que amanhã 15h tem 30min com você), acumula perguntas em bateladas, e remove o viés de só procurar quem tem personalidade mais extrovertida',
      'Força reuniões desnecessárias',
      'Otimiza agenda do senior',
    ],
    correct: 1,
    explanation: 'Open door policy sofre de dois problemas: interrupção aleatória destrói foco (custo ~23min pra voltar ao deep work) e introvertidos evitam pedir ajuda. Office hours recorrente (30–60min 2x por semana) cria canal explícito, previsível, igualitário. Se vazio, use pra trabalho próprio — zero custo.',
  },
  {
    question: 'O que significa "delegar responsabilidade, não tarefa"?',
    options: [
      'Delegar é ruim',
      'Em vez de dar instruções ("faça X do jeito Y até Z"), entrega o problema e o outcome esperado ("precisamos reduzir p99 dessa API em 50% até fim do mês, você lidera"). Pessoa escolhe o como, cresce, e assume ownership real',
      'Significa micromanagement',
      'Delegar tarefas é a melhor opção',
    ],
    correct: 1,
    explanation: 'Delegar tarefa é transferir execução (útil, mas cria subordinado permanente). Delegar responsabilidade é transferir decisão (constrói peer). A pessoa erra no caminho — tudo bem, isso é o aprendizado. Seu papel vira coach: perguntar "quais opções você considerou?" em vez de dar a resposta. Em 6 meses você tem um engenheiro autônomo; em 12, um multiplicador.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mentoria-tecnica"
      title="Mentoria técnica: multiplicar sem gargalar"
      icon="🧑‍🏫"
      xp={55}
      readTime={13}
      trailName="Tech Leadership & Staff Engineering"
      trailColor={accent}
      nextSlug="code-review-pedagogico"
      nextTitle="Code review como ferramenta pedagógica"
      quiz={quiz}
    >
      <Section title="Mentoria não é tutoria" accent={accent}>
        <p>
          Tutoria resolve o problema de hoje. Mentoria constrói quem resolve o problema de amanhã sem você. Staff e Principal engineers são avaliados pelo quanto o time cresce ao lado deles, não por commits individuais. Isso muda a função: você deixa de ser o melhor executor e passa a ser multiplicador.
        </p>
      </Section>

      <Section title="Teach pattern: 4 estágios" accent={accent}>
        <CodeBlock lang="bash">{`# Estágio 1 — Explain
# Você explica o modelo mental, mostra o "porquê"
# Evite dar o código pronto; mostre o diagrama, a trade-off

# Estágio 2 — Do together (pair)
# Pairing real: pessoa dirige o teclado, você navega
# Perguntas socráticas: "o que acontece se esse request falhar?"

# Estágio 3 — They solo, you review
# Pessoa implementa, você revisa com zoom menor a cada iteração
# Primeiro review pega detalhes; terceiro só o trade-off macro

# Estágio 4 — Reverse: they teach
# Pessoa ensina outra pessoa. É aí que sabemos que dominou.`}</CodeBlock>
        <Callout tone="info" icon="🎯">
          O erro comum é pular direto do estágio 1 pro 3 porque é mais rápido. O estágio 2 (pair) é onde o modelo mental se transfere — vale 10x o tempo investido.
        </Callout>
      </Section>

      <Section title="Office hours estruturado" accent={accent}>
        <p>
          Bloco recorrente no calendário (ex: terças e quintas, 15h–16h). Qualquer pessoa do time entra sem pedir. Sem pauta pré-definida — flui com o que chegar. Regras simples:
        </p>
        <CodeBlock lang="markdown">{`# Office hours — protocolo
- Entra quem quiser; fila informal se tiver mais de uma pessoa
- 15 min médio por tópico; pode estender se produtivo
- Sem pauta é OK; traz o problema, discutimos juntos
- Nada é "pergunta idiota" — se veio aqui, vale discutir
- Se sobrou tempo, eu trabalho em algo meu; zero pressão`}</CodeBlock>
        <Callout tone="success" icon="🕐">
          Depois de 4–6 semanas o office hours se auto-regula: o time aprende a agrupar perguntas na janela e aprendem entre si na espera. A frequência de interrupções assíncronas cai.
        </Callout>
      </Section>

      <Section title="Unblocking sem fazer pela pessoa" accent={accent}>
        <p>
          Quando o júnior trava, a tentação é digitar a solução. Resista. Pergunta-chave: &quot;quais três opções você já considerou?&quot;. Se respondeu zero, ainda está cedo — volte ao problema. Se respondeu três, provavelmente já resolveu sozinho só explicando.
        </p>
        <Callout tone="warn" icon="⚠️">
          Sinal de alerta pra você: toda sprint tem um ticket &quot;bloqueado esperando seu review&quot;. Ou seu review é gargalo (resolva automatizando, veja aula de code review) ou o time virou dependente — reverse the pattern.
        </Callout>
      </Section>

      <Section title="Career laddering: converse carreira, não só tarefa" accent={accent}>
        <p>
          1:1 que só fala sobre backlog é desperdício. A cada 2–3 semanas, use uma 1:1 pra conversar carreira: &quot;onde quer estar em 18 meses?&quot;, &quot;qual skill falta no seu próximo nível?&quot;, &quot;qual projeto atual te aproxima disso?&quot;. Documento visível (career ladder da empresa) abre conversa adulta sobre o gap.
        </p>
        <Callout tone="success" icon="🚀">
          Mentores que mudam carreira ficam na memória. Engenheiros que você mentorou viram referência, te puxam pra oportunidades, mantêm a rede viva. Investimento pedagógico é investimento em rede de longo prazo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
