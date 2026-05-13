import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-transporte-direcoes');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'Você está no metrô e não sabe onde descer. Qual frase usar com um passageiro?',
    options: [
      '"Where is my stop?"',
      '"Excuse me, which stop should I get off for [lugar]?" — direto e específico',
      '"Stop, stop, stop!"',
      '"I am lost in the metro."',
    ],
    correct: 1,
    explanation:
      '"Which stop should I get off for [lugar]?" é a frase mais útil — você diz o destino e a pessoa indica a estação. Sempre tenha o nome da estação de destino visível no celular para mostrar se necessário.',
  },
  {
    question: 'Como confirmar que entrou no Uber certo antes de fechar a porta?',
    options: [
      'Perguntar "Uber?"',
      '"Are you [nome do motorista]?" e verificar a placa no app — confirmar ANTES de entrar',
      'Verificar depois de andar um quarteirão',
      'Confiar no nome do carro',
    ],
    correct: 1,
    explanation:
      'Confirme o nome do motorista E a placa antes de entrar. O app mostra os dois. Golpistas em aeroportos e centros movimentados fingem ser motoristas de apps. Nunca entre sem confirmar.',
  },
  {
    question: 'Como pedir direções na rua de forma natural?',
    options: [
      '"Where pharmacy?"',
      '"Excuse me, how do I get to [lugar]? / Is there a pharmacy nearby?" — com "Excuse me" para abordar educadamente',
      '"Pharmacy direction please."',
      '"Tell me where pharmacy is."',
    ],
    correct: 1,
    explanation:
      '"Excuse me" é o marcador padrão para abordar estranhos educadamente. "How do I get to..." é a estrutura mais natural para pedir direções. Se não entender a resposta: "Could you go more slowly?" ou peça para mostrar no mapa do celular.',
  },
  {
    question: 'O que fazer ao bater levemente em carro estacionado no parking lot?',
    options: [
      'Sair rapidamente — danos pequenos não precisam ser reportados',
      'Tirar fotos, deixar bilhete com nome e telefone no carro danificado, avisar a locadora (se for carro alugado)',
      'Esperar o dono aparecer indefinidamente',
      'Ligar para 911 imediatamente',
    ],
    correct: 1,
    explanation:
      'Sair sem avisar após bater em carro estacionado é crime ("hit and run") em todos os estados americanos. O correto: tirar fotos dos danos e placas, deixar bilhete com seus dados, e se for carro alugado, ligar para a locadora imediatamente. Para danos maiores, chame a polícia para o accident report.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-transporte-direcoes"
      title="Cenário: Transporte, Direções e Mobilidade"
      icon="🚇"
      xp={60}
      readTime={15}
      trailName="Inglês para Brasileiros na Gringa"
      trailColor={ACCENT}
      nextSlug="cenario-situacoes-sociais"
      nextTitle="Cenário: Situações Sociais e Fazer Amigos"
      relatedSlugs={['cenario-banco-financas', 'cenario-aeroporto-alfandega', 'ingles-1000-frases']}
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
        Transporte e mobilidade são a base da independência na gringa. Este módulo cobre as trocas
        mais comuns: metrô, ônibus, Uber/Lyft, pedir direções na rua, situações com carro (aluguel,
        acidente, pneu furado) e como se virar quando o Google Maps não funciona.
      </p>

      <Section title="Metrô e transporte público" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Comprar ou recarregar bilhete', '"Where can I buy / reload a Metro card?"'],
            ['Confirmar linha correta', '"Does this train go to [estação / bairro]?"'],
            ['Confirmar direção', '"Is this the train toward downtown / uptown?"'],
            ['Saber onde descer', '"Which stop should I get off for [lugar]?"'],
            ['Pedir baldeação', '"Where do I transfer to the [linha] line?"'],
            ['Trem atrasado', '"Is this line running? I have been waiting 20 minutes."'],
            ['Pedir espaço na saída', '"Excuse me, this is my stop." — diga com firmeza'],
            ['Perguntar conexão de ônibus', '"Which bus goes to [bairro] from here?"'],
            ['Perder a estação', '"I missed my stop. How do I get back to [estação]?"'],
            ['Solicitar mapa impresso', '"Do you have a system map I can keep?"'],
          ]}
        />
        <Callout tone="info">
          <strong>Vocabulário essencial:</strong> "Uptown/Downtown" = norte/sul (em NYC); "Rush hour"
          = horário de pico; "Transfer" = baldeação; "Turnstile" = catraca; "Platform" = plataforma;
          "All aboard!" = todos a bordo; "Next stop" = próxima parada.
        </Callout>
      </Section>

      <Section title="Uber, Lyft e táxi" accent={ACCENT}>
        <Callout tone="warn">
          <strong>Segurança primeiro:</strong> SEMPRE confirme nome do motorista + placa antes de
          entrar. Nunca entre em carro que para espontaneamente dizendo ser seu Uber — verifique no app.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Confirmar motorista', '"Are you [nome]? I have a ride to [destino]."'],
            ['Confirmar destino', '"We are going to [endereço], right?"'],
            ['Pedir para esperar', '"Could you wait here for a moment? I will be right back."'],
            ['Parada extra', '"Could you stop at [lugar] on the way?"'],
            ['Temperatura', '"Could you turn up / down the AC?"'],
            ['Rota diferente', '"The app shows a different route. Is there a reason for this way?"'],
            ['Deixar na entrada exata', '"Please drop me off in front of the main entrance."'],
            ['Ajuda com bagagem', '"Could you help me with my bags, please?"'],
            ['Recibo de corrida', '"Can I get a receipt? / The receipt will be sent to my email automatically."'],
            ['Problema com cobrança', '"I was charged incorrectly. How do I dispute this in the app?"'],
          ]}
        />
      </Section>

      <Section title="Pedir direções na rua" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Abordar alguém', '"Excuse me, could you help me? I seem to be a bit lost."'],
            ['Direção geral', '"How do I get to [lugar / endereço]?"'],
            ['Lugar próximo', '"Is there a [farmácia / supermercado / banco] nearby?"'],
            ['Distância a pé', '"Is it within walking distance?" / "How many blocks is it?"'],
            ['Confirmar que entendeu', '"So I turn left at the traffic light, then right at the park?"'],
            ['Não entendeu', '"Could you go more slowly, please?" / "Could you show me on the map?"'],
            ['Mostrar endereço no celular', '"Here is the address — could you point me in the right direction?"'],
            ['Perguntar sobre ônibus', '"Is there a bus I can take?" / "Is there a subway nearby?"'],
            ['Marcos de referência', '"What is a landmark I can look for near there?"'],
            ['Agradecer', '"Thank you so much, that was very helpful!"'],
          ]}
        />
      </Section>

      <Section title="Acidente de carro e emergências na estrada" accent={ACCENT}>
        <Callout tone="warn">
          <strong>Em acidente com feridos: ligue 911 imediatamente.</strong>{' '}
          "There has been a car accident at [local]. Someone is injured. Please send help."
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Checar feridos após batida', '"Are you okay? Is everyone alright?"'],
            ['Registrar acidente', '"We need a police report. Can you call the police?"'],
            ['Trocar dados com outro motorista', '"Can I get your name, phone number, insurance, and license plate?"'],
            ['Pneu furado', '"I have a flat tire. Is there a tire shop nearby?"'],
            ['Carro quebrado', '"My car broke down. I need roadside assistance."'],
            ['Sem gasolina', '"I ran out of gas. Where is the nearest gas station?"'],
            ['Chave trancada no carro', '"I locked my keys inside the car. Can you help?"'],
            ['Acionar seguro', '"I need to file a claim. I was involved in an accident."'],
            ['Dano em carro alugado', '"I need to report damage to my rental. Here is my contract number."'],
            ['Pedir guincho', '"I need a tow truck. The car will not start."'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso dirigir nos EUA com habilitação brasileira?"
          a={<>Sim — a CNH é válida como visitante por até 1 ano na maioria dos estados. Recomenda-se ter também a Permissão Internacional para Dirigir (PID), emitida pelo DETRAN antes de viajar. Se você se tornar residente, terá entre 30 e 90 dias para tirar a habilitação local, dependendo do estado.</>}
        />
        <QAItem
          q="Como agir em uma abordagem policial no trânsito?"
          a={<>Encoste com segurança no lado direito, desligue o motor, coloque as mãos no volante (visíveis). Espere o policial se aproximar — não mexa em documentos sem avisar: "My registration is in the glove box. May I reach for it?" Seja respeitoso mesmo se discordar da multa — conteste depois no sistema judicial, não no local.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Metrô: confirme sempre a direção (uptown/downtown) antes de
        embarcar. Uber: verifique nome e placa antes de entrar. Direções: "Excuse me, how do I
        get to [lugar]?" funciona sempre. Acidentes: fotos + dados do outro motorista + police
        report. Habilitação brasileira válida como visitante por até 1 ano na maioria dos estados.
      </Callout>
    </div>
  );
}
