import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('negotiation-salario-equity');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que &quot;never give first number&quot; de Haseeb Qureshi funciona?',
    options: [
      'Magia',
      'Porque quem da primeiro ancora a negociacao perto do proprio numero. Deixar recruiter falar primeiro da teto mais alto que o esperado. Mesmo perguntado, deflect para range pesquisado em Levels.fyi ou pedir para ouvir a oferta primeiro',
      'Recruiter vai embora',
      'Somente em USA',
    ],
    correct: 1,
    explanation: 'Haseeb Qureshi (ex-poker pro) publicou o playbook canonico em haseebq.com. Ancoragem e efeito cognitivo robusto em 50+ anos de pesquisa. Empresa tem range aprovado — seu trabalho e descobrir o teto, nao declarar seu piso.',
  },
  {
    question: 'RSU vs options — qual diferenca importa na decisao?',
    options: [
      'Nenhuma',
      'RSU sao acoes entregues no vesting (valor = preco da acao). Stock options dao direito de COMPRAR por strike — so valem se acao subir acima do strike. Options tem upside maior em startup pre-IPO e risco de virar zero; RSU sao previsiveis em empresa publica',
      'RSU so na AWS',
      'Options pagam mensal',
    ],
    correct: 1,
    explanation: 'Em empresa publica (FAANG, Stripe publica) RSU e o padrao — voce recebe acoes, paga imposto no vesting. Em startup pre-IPO, options (ISOs/NSOs) dominam. Vesting cliff tipico: 1 ano cliff + 4 anos total, mensal apos cliff.',
  },
  {
    question: 'O que e competing offer e como usar com integridade?',
    options: [
      'Bluff',
      'Oferta real de outra empresa em mao ou adiantada. Usa-se mencionando range e prazo para demonstrar leverage REAL. Bluffar e risco de perder a vaga — recruiters conversam entre si',
      'Inventar propostas',
      'Ameacar sair',
    ],
    correct: 1,
    explanation: 'Ter 2-3 ofertas em paralelo muda a matematica em 15-30% tipicamente. Levels.fyi mostra casos reais. Bluff nao compensa: recruiters compartilham notas em networks privadas. Use integridade como ativo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="negotiation-salario-equity"
      title="Negotiation: salario, equity, signing"
      icon="💰"
      xp={55}
      readTime={13}
      trailName="Career Engineering"
      trailColor={accent}
      nextSlug="promo-docs-brag-doc"
      nextTitle="Promo docs que avancam"
      quiz={quiz}
    >
      <Section title="Regras de Haseeb Qureshi (condensadas)" accent={accent}>
        <CodeBlock lang="markdown">{`1. Seja friendly e aberto — negotiation nao e briga.
2. Nunca de o primeiro numero. Se perguntado, deflect.
3. Tenha alternative (competing offer ou BATNA forte).
4. Peca mais do que imagina merecer.
5. Seja especifico em pedidos (base X, equity Y, sign Z).
6. Justifique com valor que voce traz, nao com necessidade.
7. Negocie pacote inteiro (sign, equity, PTO, relocation).
8. Tudo por escrito. Email > ligacao.
9. Saiba seu walk-away number antes de comecar.
10. Nao aceite na hora. Pedir 2-5 dias e padrao.`}</CodeBlock>
        <p>
          Playbook completo em haseebq.com/how-not-to-bomb-your-offer-negotiation. Leia antes de entrar em qualquer processo avancado.
        </p>
      </Section>

      <Section title="Componentes do pacote" accent={accent}>
        <CodeBlock lang="markdown">{`Base salary       pago mensal, mais previsivel
Annual bonus      % da base, atrelado a perf
Signing bonus     pago no mes 1, as vezes clawback em 12m
Equity (RSU)      grant vestido em 4 anos (1y cliff)
Equity (ISO/NSO)  options, valor depende do exit
Relocation        reembolso mudanca (5-15k USD)
PTO               dias de ferias (22+ bom, 30+ excelente)
Remote / hybrid   valor implicito em tempo e custo vida
Titulo            impacta proxima empresa mais que essa`}</CodeBlock>
      </Section>

      <Section title="Fluxo completo" accent={accent}>
        <CodeBlock lang="markdown">{`1. Recruiter pergunta expectativa
   -&gt; &quot;Quero focar em fit tecnico primeiro, podemos discutir
       comp depois que eu entender o escopo?&quot;

2. Apos oferta inicial
   -&gt; Agradeca. NAO aceite na hora. Peca 2-5 dias.

3. Contra-proposta
   -&gt; Email com pedido especifico em cada componente.
   -&gt; Justifique com: competing offers, Levels.fyi, escopo.

4. Volta do recruiter
   -&gt; Pode ser yes/partial/no. Em partial, push em signing
      ou equity refresh.

5. Fechamento
   -&gt; Quando aceitar, peca oferta final por escrito ANTES de
       avisar outras empresas.`}</CodeBlock>
      </Section>

      <Section title="Email de contra-proposta" accent={accent}>
        <CodeBlock lang="markdown">{`Assunto: Re: Oferta — Senior Engineer

Oi [recruiter],

Obrigado pela oferta. Fiquei animado com o time e o escopo em
plataforma de pagamentos.

Apos revisar e comparar com outras opcoes em andamento, proponho
um ajuste no pacote:

- Base: de USD 180k para USD 210k
- Signing bonus: USD 40k (atual USD 25k)
- RSU 4 anos: de USD 280k para USD 360k

Esses numeros refletem:
- Oferta competitiva de [empresa Y] em nivel equivalente
- Dados de Levels.fyi para senior em [cidade/stack]
- 8 anos em distributed systems e payments

Feliz em fechar essa semana nesses termos.

Obrigado,
Fernando`}</CodeBlock>
        <Callout tone="info">
          Tom amigavel, especifico, justificado. Sem ultimatum. Se tem competing offer real, mencione empresa. Sem competing, justifique com Levels.fyi + escopo.
        </Callout>
      </Section>

      <Section title="Levels.fyi como benchmark" accent={accent}>
        <Callout tone="success">
          Levels.fyi tem filtros por empresa, nivel, cidade, anos. Use P50 como referencia, P75 como ancora, P90 como stretch. Para empresa nao listada, triangule com Glassdoor + teamblind + contatos via LinkedIn.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
