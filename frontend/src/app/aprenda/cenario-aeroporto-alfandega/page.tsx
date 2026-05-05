import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-aeroporto-alfandega');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'No controle de passaporte americano, o agente pergunta "What is the purpose of your visit?" — o que ele quer saber?',
    options: [
      'Quanto tempo você vai ficar',
      'O motivo da sua viagem (turismo, negócios, visita a família)',
      'Onde você vai se hospedar',
      'Se você já veio antes aos EUA',
    ],
    correct: 1,
    explanation:
      '"Purpose of visit" = motivo/objetivo da visita. Responda claramente: "Tourism" (turismo), "Business" (negócios) ou "Visiting family/friends" (visitar família/amigos). Nunca minta ao agente de imigração.',
  },
  {
    question: 'Na alfândega americana, o formulário pergunta "Do you have anything to declare?" — quando você deve dizer "Yes"?',
    options: [
      'Sempre, para ser seguro',
      'Quando você carrega alimentos, plantas, animais, ou mais de USD 10.000 em dinheiro',
      'Somente quando carrega mais de 5 garrafas de bebida alcoólica',
      'Nunca — diga sempre "No" para passar mais rápido',
    ],
    correct: 1,
    explanation:
      'Você deve declarar: alimentos, plantas, animais vivos, carnes, frutas, mais de USD 10.000 em dinheiro ou equivalente, e mercadorias acima do limite de isenção (~USD 800). Não declarar quando deveria é crime federal.',
  },
  {
    question: 'Sua mala não apareceu no carrossel — o que você faz primeiro?',
    options: [
      'Esperar na saída do aeroporto',
      'Ir ao balcão "Baggage Claim / Lost and Found" e relatar a bagagem perdida',
      'Ligar para a companhia aérea pelo celular',
      'Abrir um boletim de ocorrência na polícia',
    ],
    correct: 1,
    explanation:
      'O primeiro passo é ir ao balcão de "Lost and Found" ou "Baggage Services" da sua companhia aérea antes de sair do aeroporto. Tenha em mãos o cartão de embarque (boarding pass) e a etiqueta da bagagem (baggage claim tag). O agente vai abrir um "Property Irregularity Report" (PIR).',
  },
  {
    question: 'Qual dessas frases é a forma mais natural de perguntar sobre uma conexão perdida?',
    options: [
      '"My connection is lost, please help me."',
      '"I missed my connecting flight — what are my options?"',
      '"I don\'t have my second plane, what to do?"',
      '"My second flight is gone, I need another."',
    ],
    correct: 1,
    explanation:
      '"I missed my connecting flight" é a expressão nativa para "perdi minha conexão". "What are my options?" (quais são minhas opções?) é a forma mais assertiva e natural de perguntar o que fazer a seguir. O agente vai verificar disponibilidade de voos alternativos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-aeroporto-alfandega"
      title="Cenário: Aeroporto e Alfândega"
      icon="✈️"
      xp={90}
      readTime={35}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="cenario-moradia-vizinhanca"
      nextTitle="Cenário: Moradia e Vizinhança"
      relatedSlugs={['cenario-moradia-vizinhanca', 'cenario-restaurante-alimentacao', 'ingles-1000-palavras']}
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
        O aeroporto internacional é o primeiro teste real do seu inglês. Cada interação tem consequências reais:
        perder um voo, ser retido na imigração, não receber sua mala. Este módulo cobre 100 trocas reais organizadas
        em 10 sub-situações, do check-in no Brasil até a saída do aeroporto americano.
      </p>

      <Section title="1. Check-in no aeroporto brasileiro (antes de embarcar)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Mesmo em aeroportos brasileiros, os funcionários de companhias internacionais frequentemente abordam em inglês.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Aqui está meu passaporte.', 'Here is my passport.', '"passport" = "páss-port"'],
            ['Tenho uma mala para despachar.', 'I have one bag to check in.', '"check in" = despachar mala (diferente de check-in do hotel)'],
            ['Essa mala é de mão.', 'This is my carry-on.', '"carry-on" = "kérri-on" — bagagem de cabine'],
            ['Posso sentar na janela?', 'Can I get a window seat?', '"aisle seat" = assento no corredor'],
            ['Prefiro o corredor, por favor.', 'I would prefer an aisle seat, please.', '"aisle" se pronuncia "ail" (como "ailé")'],
            ['Quantos quilos posso despachar?', 'What is the baggage allowance?', '"allowance" = "aláuens" — cota permitida'],
            ['Minha mala está acima do peso.', 'My bag is overweight.', '"overweight fee" = taxa de excesso de bagagem'],
            ['Posso pagar pela bagagem extra agora?', 'Can I pay for the extra bag now?', 'Sempre melhor pagar antes do aeroporto — é mais barato'],
            ['A que horas começa o embarque?', 'What time does boarding start?', '"boarding" = "bórding" — embarque'],
            ['Qual é o portão de embarque?', 'What is the gate number?', '"gate" = "gueit" — portão'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica cultural:</strong> Nos EUA, "checking a bag" (despachar mala) quase sempre tem custo extra —
          em geral USD 30-35 na primeira mala. Muitos americanos viajam só com carry-on para economizar. Verifique sua
          franquia antes de viajar.
        </Callout>
      </Section>

      <Section title="2. Controle de passaporte / Imigração nos EUA" accent={ACCENT}>
        <Callout tone="warn">
          <strong>⚠️ CRÍTICO:</strong> O agente de imigração americano tem autoridade para negar sua entrada. Seja
          direto, honesto e breve. Não faça piadas. Não fale mais do que o necessário. Um "yes" ou "no" seguido de uma
          frase curta é suficiente.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Qual é o motivo da sua visita?', 'What is the purpose of your visit?', 'Responda: "Tourism" / "Business" / "Visiting family"'],
            ['Vim a turismo.', 'I am here for tourism. / I am on vacation.', '"vacation" nos EUA = "holiday" no UK'],
            ['Quanto tempo vai ficar?', 'How long will you be staying?', 'Diga exatamente: "Ten days" / "Two weeks"'],
            ['Vou ficar duas semanas.', 'I will be staying for two weeks.', 'Nunca diga mais do que o prazo do seu visto'],
            ['Onde vai se hospedar?', 'Where will you be staying?', 'Tenha o endereço do hotel na tela do celular'],
            ['Vou ficar num hotel em Miami.', 'I will be staying at a hotel in Miami.', 'Ou: "I will be staying with family at [address]"'],
            ['Já veio aos EUA antes?', 'Have you visited the United States before?', '"Yes, in 2019" ou "No, this is my first time"'],
            ['Tem passagem de volta?', 'Do you have a return ticket?', 'Tenha o QR code pronto para mostrar'],
            ['Pode colocar o dedo aqui.', 'Please place your finger on the scanner.', 'Siga as instruções sem questionar'],
            ['Bem-vindo aos Estados Unidos.', 'Welcome to the United States.', 'Essa é a frase mais bonita do aeroporto!'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica de pronúncia:</strong> "Purpose" = "pérr-pus". "Staying" = "stêi-ing". Fale devagar e com
          clareza — o agente prefere pausas a mumbling (murmúrio incompreensível).
        </Callout>
      </Section>

      <Section title="3. Alfândega — Customs Declaration" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Tenho algo a declarar?', 'Do you have anything to declare?', 'Se não tiver: "No, I do not."'],
            ['Trouxe comida do Brasil.', 'I brought some food from Brazil.', 'Declare sempre — mesmo que seja permitido'],
            ['São biscoitos industrializados.', 'These are commercially packaged cookies.', '"Commercially packaged" = embalados industrialmente (liberado)'],
            ['Quanto vale isso?', 'What is the value of this item?', 'Tenha o recibo — "receipt" = "rissít"'],
            ['Comprei presentes no valor de USD 400.', 'I purchased gifts worth USD 400.', 'Abaixo de ~USD 800 = geralmente isento de taxa'],
            ['Não trouxe frutas nem carnes.', 'I am not carrying any fruits or meats.', '⚠️ Frutas e carnes frescas são proibidas'],
            ['Pode abrir a mala?', 'Can you open your bag, please?', 'Diga "Of course" e abra sem hesitar'],
            ['O que é isso?', 'What is this?', 'Explique calmo: "It is a traditional Brazilian snack"'],
            ['Isso vai ser confiscado.', 'This item will be confiscated.', '"Confiscated" = "con-fís-quei-tid" — apreendido'],
            ['Pode ir. Boa viagem.', 'You are free to go. Have a good trip.', 'Um sorriso e "Thank you!" funcionam bem aqui'],
          ]}
        />
        <Callout tone="warn">
          <strong>⚠️ Não tente passar produtos proibidos:</strong> carne bovina, frango, frutas frescas, vegetais não
          processados, terra e plantas com raiz são proibidos. A multa começa em USD 300 para viajantes que
          tentam esconder. O cão farejador não mente.
        </Callout>
      </Section>

      <Section title="4. Bagagem perdida ou danificada" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Minha mala não chegou.', 'My bag did not arrive. / My luggage is missing.', '"luggage" = "láguidj" — bagagem'],
            ['Esperei em todos os carrosséis.', 'I waited at all the carousels and it was not there.', '"carousel" = "kérru-sel" — esteira de bagagem'],
            ['Tenho a etiqueta da bagagem aqui.', 'I have my baggage claim tag here.', 'NUNCA jogue fora a etiqueta antes de pegar a mala'],
            ['Qual é o código do seu voo?', 'What is your flight number?', 'Tenha o boarding pass no celular'],
            ['Quando minha mala chega?', 'When will my bag be delivered?', 'Eles entregam no seu endereço — grátis'],
            ['Você pode entregar no hotel?', 'Can you deliver it to my hotel?', 'Dê o nome e endereço completo do hotel'],
            ['Minha mala está danificada.', 'My bag is damaged.', '"Damaged" = "démidgd" — danificada'],
            ['A roda quebrou.', 'The wheel is broken.', 'Registre antes de sair do aeroporto'],
            ['Preciso de um formulário de reclamação.', 'I need to file a damage report.', '"File a report" = registrar uma reclamação'],
            ['Qual é o número do protocolo?', 'What is the reference / claim number?', 'Anote ou tire foto — você vai precisar depois'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica prática:</strong> Fotografe sua mala ANTES de despachar. Se chegar danificada, você tem
          prova do estado original. A companhia aérea tem responsabilidade legal pela bagagem despachada.
        </Callout>
      </Section>

      <Section title="5. Conexão perdida ou cancelamento de voo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Perdi minha conexão.', 'I missed my connecting flight.', '"Missed" = "míst" — perdi (por atraso, não por escolha)'],
            ['O voo atrasou e perdi a conexão.', 'My first flight was delayed and I missed my connection.', 'Enfatize que foi culpa da companhia aérea'],
            ['Quais são as minhas opções?', 'What are my options?', 'Frase-chave — assertiva e direta'],
            ['Tem outro voo para Dallas hoje?', 'Is there another flight to Dallas today?', 'Sempre pergunte por alternativas no mesmo dia'],
            ['A companhia vai pagar o hotel?', 'Will the airline cover the hotel?', 'Se o atraso foi culpa deles: sim, geralmente sim'],
            ['Preciso de um voucher de hotel.', 'I need a hotel voucher.', '"Voucher" = "váucher" — comprovante/vale'],
            ['Meu voo foi cancelado.', 'My flight was canceled.', '"Canceled" = "kénseld"'],
            ['Quero ser reacomodado no próximo voo.', 'I would like to be rebooked on the next available flight.', '"Rebooked" = reagendado — palavra chave em aeroportos'],
            ['Tenho direito a reembolso?', 'Am I entitled to a refund?', '"Entitled to" = "tenho direito a"'],
            ['Pode imprimir meu novo cartão de embarque?', 'Can you print my new boarding pass?', 'Ou: "Can you send it to my email?"'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica de sobrevivência:</strong> Se o voo atrasar por culpa da companhia, você tem direito a
          refeição, hotel e transporte. Vá direto ao balcão da companhia aérea (não ao balcão do aeroporto) e use
          a frase "I was involuntarily denied boarding" se for o caso — isso tem peso legal nos EUA.
        </Callout>
      </Section>

      <Section title="6. Sala de embarque e embarque no avião" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Onde fica o portão B12?', 'Where is gate B12?', '"Gate" = "gueit"'],
            ['Estamos chamando os passageiros do grupo 2.', 'We are now boarding group 2.', 'Fique de olho no display — grupos variam por classe/fidelidade'],
            ['Pode ver meu cartão de embarque?', 'Can I see your boarding pass?', 'O agente vai dizer isso — você responde "Sure, here it is"'],
            ['Posso colocar na bagageira?', 'Can I put this in the overhead bin?', '"Overhead bin" = "óverhéd bin" — compartimento acima do assento'],
            ['A bagageira está cheia.', 'The overhead bin is full.', 'Eles vão despachar sua mala de graça nesse caso'],
            ['Esse é meu assento.', 'This is my seat.', 'Assento: "síit"'],
            ['Alguém está sentado aqui?', 'Is anyone sitting here?', 'Para sentar em assento aparentemente vazio'],
            ['Posso trocar de assento com você?', 'Would you mind switching seats with me?', '"Would you mind" = "você se importaria" — mais educado que "Can you"'],
            ['Preciso colocar minha mochila aqui.', 'I need to put my backpack here.', '"Backpack" = mochila'],
            ['Pode empurrar um pouco?', 'Can you scoot over a little?', '"Scoot over" = "sküt óver" — dar espaço, se mover para o lado'],
          ]}
        />
      </Section>

      <Section title="7. A bordo: pedidos e necessidades" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Pode me dar uma água?', 'Could I get some water, please?', '"Could I get" é mais educado que "Can I have" nos EUA'],
            ['Frango ou massa?', 'Chicken or pasta?', 'Diga sua escolha claramente: "Chicken, please."'],
            ['Não como carne.', 'I do not eat meat.', 'Para refeição especial, avise com 24h de antecedência'],
            ['Está frio aqui.', 'It is a bit chilly in here.', '"Chilly" = "tchíli" — friozinho'],
            ['Pode me dar um cobertor?', 'Can I get a blanket?', '"Blanket" = "blénket" — cobertor'],
            ['Meu fone não está funcionando.', 'My headphones are not working.', '"Headphones" = "hédfounz"'],
            ['Posso reclinar meu assento?', 'Is it okay to recline my seat?', 'Pergunte ao passageiro atrás se o espaço for pequeno'],
            ['Preciso usar o banheiro.', 'I need to use the restroom.', '"Restroom" nos EUA = banheiro. "Lavatory" na aviação'],
            ['Não me sinto bem.', 'I am not feeling well.', '"I feel sick" = estou com náusea'],
            ['Preciso de ajuda médica.', 'I need medical assistance.', '⚠️ CRÍTICO — diga imediatamente a um comissário'],
          ]}
        />
        <Callout tone="warn">
          <strong>⚠️ CRÍTICO — Emergência a bordo:</strong> Se você ou alguém precisar de ajuda médica, pressione
          o botão de chamada (call button) imediatamente e diga "I need medical assistance" ou "There is a medical
          emergency." Nunca demore por vergonha ou por não saber as palavras certas.
        </Callout>
      </Section>

      <Section title="8. Chegada e primeira saída do aeroporto" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Onde fica o metrô / trem?', 'Where is the subway / train?', '"Subway" nos EUA, "Tube" em Londres, "Metro" em outras cidades'],
            ['Onde fico o ponto de táxi?', 'Where is the taxi stand?', '"Taxi stand" = "téksi stend" — ponto de táxi'],
            ['Preciso de um Uber.', 'I need to get an Uber / rideshare.', '"Rideshare pickup area" = área de embarque de apps'],
            ['Quanto custa até o centro?', 'How much is it to downtown?', '"Downtown" = centro da cidade'],
            ['Pode me dar um recibo?', 'Can I get a receipt?', '"Receipt" = "rissít" — recibo'],
            ['O motorista está com meu nome errado.', 'The driver has the wrong name.', 'Confirme placa E nome antes de entrar no carro'],
            ['Onde fica o information desk?', 'Where is the information desk?', '"Information desk" = balcão de informações'],
            ['Tem WiFi gratuito aqui?', 'Is there free WiFi here?', '"Free WiFi" = "fri wái-fai"'],
            ['Onde posso trocar dinheiro?', 'Where can I exchange currency?', '"Currency exchange" = "kérrenssi ikstchêindj"'],
            ['Tem loja de conveniência aqui?', 'Is there a convenience store here?', '"Convenience store" = "convíiniiens stóorr"'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica cultural:</strong> Nos EUA, evite trocar dinheiro no aeroporto — as taxas são péssimas.
          Use caixas eletrônicos (ATM) da sua rede bancária ou leve cartões internacionais. "ATM" nos EUA =
          "caixa eletrônico". No UK = "cash machine".
        </Callout>
      </Section>

      <Section title="9. Aluguel de carro no aeroporto" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Tenho uma reserva.', 'I have a reservation.', '"Reservation" = "rézze-vêi-chen"'],
            ['Meu nome é Fernando Franco.', 'My name is Fernando Franco.', 'Soletre se necessário: "F-R-A-N-C-O"'],
            ['Quero um carro compacto.', 'I would like a compact car.', 'Categorias: compact, mid-size, full-size, SUV'],
            ['Vai precisar do meu cartão de crédito?', 'Will you need my credit card?', 'Cartão de débito muitas vezes NÃO é aceito — leve crédito'],
            ['O seguro está incluído?', 'Is insurance included?', 'Pergunte sobre "CDW" — Collision Damage Waiver'],
            ['Não quero seguro adicional.', 'I do not need additional insurance.', 'Se seu cartão de crédito já cobre, rejeite o deles'],
            ['O carro já tem GPS?', 'Does the car come with GPS?', 'Muitos têm. Ou use seu celular com suporte no para-brisa'],
            ['Onde fica o estacionamento da locadora?', 'Where is the rental car lot?', '"Lot" = "lót" — estacionamento/pátio'],
            ['Devo devolver com o tanque cheio?', 'Should I return the car with a full tank?', '"Full tank" = tanque cheio — quase sempre sim'],
            ['E se eu arranhar o carro?', 'What if there is minor damage?', 'Fotografe o carro 360° antes de sair do pátio'],
          ]}
        />
        <Callout tone="warn">
          <strong>⚠️ Atenção com cartão de débito:</strong> nos EUA, a maioria das locadoras exige cartão de
          crédito (não débito) para alugar. Algunas aceitam débito mas bloqueiam um valor alto como caução
          (até USD 500). Confira antes de viajar.
        </Callout>
      </Section>

      <Section title="10. Situações de emergência no aeroporto" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Me roubaram a carteira.', 'My wallet was stolen.', '"Stolen" = "stóulen" — roubado'],
            ['Perdi meu passaporte.', 'I lost my passport.', 'Vá à polícia do aeroporto + consulado brasileiro'],
            ['Preciso de socorro policial.', 'I need police assistance.', 'Ou simplesmente: "Call the police, please."'],
            ['Preciso ir ao hospital.', 'I need to go to the hospital.', '"Hospital" = "hóspital" — pronúncia parecida'],
            ['Estou me sentindo muito mal.', 'I am feeling very ill.', '"Ill" = doente (mais sério que "sick")'],
            ['Tem desfibrilador aqui?', 'Is there an AED here?', 'AED = Automated External Defibrillator'],
            ['Ligar para o número de emergência.', 'Call 911.', '911 = emergência nos EUA. UK = 999. Aus = 000'],
            ['Perdi meu grupo / família.', 'I lost my travel group.', 'Vá ao information desk — eles fazem chamada interna'],
            ['Meu celular morreu.', 'My phone is dead.', '"Dead" para bateria = descarregado'],
            ['Preciso carregar meu celular.', 'I need to charge my phone.', '"Charging station" = estação de carregamento — tem em todo aeroporto'],
          ]}
        />
        <Callout tone="warn">
          <strong>⚠️ Emergência nos EUA — ligue 911:</strong> incêndio, crime em andamento, emergência médica grave.
          O atendente fala inglês mas também pode acionar intérprete. Diga: "I need help at [location]. I am
          Brazilian and my English is limited." Eles vão ajudar.
        </Callout>
      </Section>
    </div>
  );
}
