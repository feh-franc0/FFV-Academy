import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('behavioral-interview-prep');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'O que STAR resolve em behavioral interview?',
    options: [
      'Nada',
      'Estrutura resposta em Situation/Task/Action/Result evitando resposta vaga. Entrevistador precisa entender CONTEXTO, O QUE VOCE FEZ especificamente e IMPACTO mensuravel — STAR forca essa cobertura',
      'Mede IQ',
      'Substitui live coding',
    ],
    correct: 1,
    explanation: 'Amazon formalizou Leadership Principles com STAR como estrutura. Sem ela, candidatos divagam ou falam do time sem mostrar contribuicao propria. Entrevistador tomando notas precisa extrair: quando? qual desafio? o que VOCE fez (nao o time)? resultado mensurado?',
  },
  {
    question: 'O que e brag doc e por que mantê-lo?',
    options: [
      'Rede social',
      'Documento continuo onde voce registra conquistas, decisoes, aprendizados, feedback recebido — vira insumo para behavioral, promo packet, review anual. Julia Evans popularizou o conceito em jvns.ca',
      'CV rapido',
      'Ferramenta paga',
    ],
    correct: 1,
    explanation: 'Memoria humana e ruim com detalhe especifico depois de 3+ meses. Brag doc atualizado semanalmente vira tesouro: voce extrai 6-8 historias cobrindo conflict, ownership, failure, leadership, ambiguity, delivery. Em promo, seu manager agradece porque facilita calibracao.',
  },
  {
    question: 'Como responder pergunta de failure sem se queimar?',
    options: [
      'Nao dar exemplo',
      'Escolher failure real com impacto contido, mostrar deteccao, acao corretiva e aprendizado aplicado desde entao. Evitar failures catastroficos sem learning, ou falso failure (&quot;sou muito perfeccionista&quot;)',
      'Dizer que nunca errou',
      'Culpar o time',
    ],
    correct: 1,
    explanation: 'Entrevistador experiente detecta evitacao em 10 segundos. Boa resposta de failure mostra: (1) voce reconhece o erro, (2) impacto real foi medido, (3) correcao estruturada, (4) aprendizado aplicado em outro contexto depois. Staff+ esperam que voce pegou algo tecnico ou de decisao, nao &quot;esqueci uma reuniao&quot;.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="behavioral-interview-prep"
      title="Behavioral interview: STAR + brag doc"
      icon="🗣️"
      xp={50}
      readTime={12}
      trailName="Career Engineering"
      trailColor={accent}
      nextSlug="negotiation-salario-equity"
      nextTitle="Negotiation: salario, equity, signing"
      quiz={quiz}
    >
      <Section title="STAR: a estrutura minima" accent={accent}>
        <CodeBlock lang="markdown">{`S — Situation  contexto breve (1-2 frases)
T — Task       qual era o desafio especifico para VOCE
A — Action     o que VOCE fez (nao o time) — passos concretos
R — Result     impacto mensurado + aprendizado

Tempo tipico: 2-3 minutos por historia. Menos que isso fica raso.
Mais que 4 minutos o entrevistador se perde.`}</CodeBlock>
      </Section>

      <Section title="Exemplo real de STAR response" accent={accent}>
        <CodeBlock lang="markdown">{`Pergunta: &quot;Conte uma situacao onde voce discordou do seu manager.&quot;

S: No inicio de 2025 meu time decidiu migrar o servico de checkout
   de um monolito Node para microsservicos Go. Meu engineering
   manager queria cortar o projeto em 6 meses.

T: Eu avaliei o plano e vi que migraria DB em paralelo com refactor
   arquitetural, violando o principio de uma mudanca de cada vez.
   Precisava convencer o manager a sequenciar.

A: Escrevi um design doc de 3 paginas com dois planos: opcao A
   (planejada, 6 meses, riscos X/Y/Z) e opcao B (sequencial, 7
   meses, riscos mitigados). Agendei 1:1 com o manager, apresentei
   dados de incidentes de migracoes anteriores no historico da
   empresa (30% tiveram outage no segundo mes). Tambem pedi
   review de um staff engineer externo ao time.

R: Manager aceitou opcao B. Migracao terminou em 7.5 meses sem
   incidente grave (vs 3-4 esperados estatisticamente). Depois
   disso ele passou a pedir minha review em outros planos.
   Aprendi que design doc com dados beats opiniao em reuniao.`}</CodeBlock>
        <Callout tone="info">
          Note o uso de numeros (6 vs 7 meses, 30% de outage historico, 3 paginas). Entrevistador lembra do numero depois. Tambem note que R inclui aprendizado — fecha a historia com maturidade.
        </Callout>
      </Section>

      <Section title="Brag doc — template" accent={accent}>
        <CodeBlock lang="markdown">{`# Brag doc — Fernando — 2026

## Q1 2026
### Projetos
- Feature flags v2: migracao de Unleash para GrowthBook.
  Contexto: 40+ flags zumbis, sem analise estatistica.
  Impacto: 12 experimentos/mes (era 3), decisao em 1 semana (era 4+).
  Lideranca: conduzi RFC, mentorei 2 engineers no novo stack.

### Aprendizados
- Peeking problem em A/B: li Microsoft Alpha-spending paper.
  Implementei mSPRT no harness interno.

### Feedback recebido
- Staff engineer X: &quot;design doc claro, trade-offs honestos&quot;.
- Manager: &quot;nivel de comunicacao fora do time cresceu muito&quot;.

### Falhas e correcao
- Experimento de pricing rodou 2 semanas com SRM detectado
  tarde. Depois disso adicionei SRM check diario automatico.`}</CodeBlock>
      </Section>

      <Section title="Cobertura de categorias" accent={accent}>
        <CodeBlock lang="markdown">{`Prepare 1-2 historias fortes para cada categoria:

  Ownership       (dei a cara a tapa, nao deleguei)
  Conflict        (discordancia tratada com dado)
  Failure         (errei, detectei, corrigi, aprendi)
  Leadership      (mentorei, conduzi sem autoridade formal)
  Ambiguity       (defini problema antes de atacar)
  Delivery        (shipped sob pressao)
  Cross-team      (desbloqueei outro time)
  Technical       (decisao tecnica com trade-off explicito)`}</CodeBlock>
      </Section>

      <Section title="Amazon Leadership Principles — se aplica" accent={accent}>
        <Callout tone="warn">
          Amazon, AWS e alguns ex-Amazon rodando em outras empresas explicitamente pontuam via LP. Estude Customer Obsession, Ownership, Dive Deep, Have Backbone, Deliver Results. Sua historia precisa casar com 1-2 LPs por pergunta. Sem LP-fluency, entrevistador Amazon pontua em &quot;does not raise bar&quot;.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
