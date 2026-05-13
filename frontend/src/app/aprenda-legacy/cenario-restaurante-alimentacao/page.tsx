import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-restaurante-alimentacao');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'Você tem alergia grave a amendoim. Qual é a frase mais importante para dizer ao garçom?',
    options: [
      '"I do not like peanuts."',
      '"I have a severe peanut allergy — this is life-threatening. Please make sure there are no peanuts or peanut oil in my dish."',
      '"No peanuts please."',
      '"Can you check if there are peanuts in this?"',
    ],
    correct: 1,
    explanation:
      '⚠️ CRÍTICO: Alergias graves requerem linguagem explícita. "I do not like" soa como preferência — o cozinheiro pode ignorar. "Severe allergy" + "life-threatening" comunicam a urgência real. Muitos restaurantes têm protocolo especial para alergias — ative esse protocolo sendo explícito.',
  },
  {
    question: 'No drive-thru, o atendente diz "Is that for here or to go?" — o que ele quer saber?',
    options: [
      'Se você quer um combo ou item individual',
      'Se você vai comer no local ou levar para viagem',
      'Se você vai pagar com cartão ou dinheiro',
      'Qual tamanho você quer',
    ],
    correct: 1,
    explanation:
      '"For here" = comer no local (dine-in). "To go" = para viagem (takeout). No drive-thru a resposta óbvia é "to go", mas a pergunta é feita por padrão. Equivalente no UK: "eat in or take away?"',
  },
  {
    question: 'A conta chegou e você quer dividir igualmente entre 4 pessoas — o que você diz?',
    options: [
      '"Split in four please."',
      '"Can we split the bill four ways?"',
      '"Divide this by four."',
      '"Four bills please."',
    ],
    correct: 1,
    explanation:
      '"Split the bill" = dividir a conta. "Four ways" = quatro partes iguais. Você também pode dizer "Can we each pay separately?" se quiser pagar cada um pelo seu pedido individualmente. Nos EUA, dividir a conta é absolutamente normal — não é grosseria.',
  },
  {
    question: 'Quanto de gorjeta você deve deixar num restaurante americano?',
    options: [
      '5% — o mesmo que no Brasil',
      '15-20% do total antes do imposto — e 20-25% para excelente serviço',
      'Não é obrigatório nos EUA',
      '10% sempre, independente do serviço',
    ],
    correct: 1,
    explanation:
      'Nos EUA, gorjeta (tip) de 15-20% é o mínimo social esperado. 20% é considerado bom. 25%+ para serviço excepcional. Deixar menos de 15% é sinal de insatisfação grave. Muitos garçons ganham abaixo do salário mínimo porque o sistema assume que a gorjeta vai completar o salário.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-restaurante-alimentacao"
      title="Cenário: Restaurante e Alimentação"
      icon="🍽️"
      xp={85}
      readTime={32}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="cenario-trabalho-escritorio"
      nextTitle="Cenário: Trabalho e Escritório"
      relatedSlugs={['cenario-supermercado-compras', 'cenario-trabalho-escritorio', 'ingles-1000-palavras']}
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
        Comer fora nos EUA tem suas próprias regras: gorjeta obrigatória, alergias levadas a sério, drive-thru
        impossível de entender na primeira vez, bar com sistema de tab. Este módulo cobre 100 trocas reais em
        10 sub-situações para você nunca passar fome por não saber o que pedir.
      </p>

      <Section title="1. Chegando ao restaurante: reservation e espera" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Tenho uma reserva para dois.', 'I have a reservation for two.', '"Reservation" = "rézze-vêi-chen". No nome "Silva"'],
            ['Não tenho reserva — tem mesa?', 'We do not have a reservation — do you have a table available?', '"Walk-in" = sem reserva. Peça para colocar na fila de espera'],
            ['Quanto tempo de espera?', 'What is the wait time?', '"Wait time" = "wêit táim" — tempo de espera'],
            ['Pode colocar meu nome na lista?', 'Can you put my name on the waitlist?', '"Waitlist" = "wêitlist" — lista de espera'],
            ['Prefiro sentar no bar enquanto espero.', 'We would prefer to sit at the bar while we wait.', 'Bom para casais — o bartender costuma atender bem'],
            ['Tem mesa no pátio?', 'Do you have outdoor seating available?', '"Outdoor seating" = mesas do lado de fora'],
            ['Somos 6 pessoas.', 'We have a party of six.', '"Party of" = grupo de. "Party of two" = 2 pessoas'],
            ['Pode nos colocar longe do barulho?', 'Could we get a quieter table?', '"Quieter" = "kwáieter" — mais silencioso'],
            ['A mesa está pronta.', 'Your table is ready.', 'O host vai te acompanhar: "Right this way"'],
            ['Tem cadeira de bebê?', 'Do you have a high chair?', '"High chair" = "hái tchêr" — cadeirinha de bebê'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica cultural:</strong> Nos EUA, você não se senta sozinho — espere o host (anfitriã/o) te
          acompanhar até a mesa. Sentar em qualquer lugar disponível é considerado rude. Se não houver host
          visível, pergunte: "Should we seat ourselves?"
        </Callout>
      </Section>

      <Section title="2. Pedindo no cardápio — perguntas sobre o prato" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['O que é esse prato?', 'What is this dish?', '"Dish" = "dísh" — prato'],
            ['O que vem com o prato?', 'What does this come with?', '"Come with" = acompanha. "Sides" = acompanhamentos'],
            ['Posso trocar as batatas por salada?', 'Can I substitute the fries for a salad?', '"Substitute" = "sábstituiút" — trocar, substituir'],
            ['O molho vem separado?', 'Can I have the dressing on the side?', '"On the side" = servido separado — muito útil para controlar quantidade'],
            ['Tem opção vegetariana?', 'Do you have vegetarian options?', '"Vegetarian" = sem carne. "Vegan" = sem produtos animais'],
            ['Como é preparado?', 'How is this prepared?', 'Ex: grilled = grelhado, fried = frito, baked = assado, steamed = cozido no vapor'],
            ['Está incluso o pão?', 'Is bread included?', 'Em muitos restaurantes americanos, pão é grátis. Em outros, não'],
            ['Qual é o prato do dia?', 'What is the special today?', '"Special" ou "daily special" = prato do dia'],
            ['Posso ver o menu de sobremesas?', 'Can I see the dessert menu?', '"Dessert menu" = "dizért meniú"'],
            ['O que você recomenda?', 'What do you recommend?', 'Garçons americanos adoram recomendar — aproveite'],
          ]}
        />
      </Section>

      <Section title="3. Alergias e restrições alimentares (CRÍTICO)" accent={ACCENT}>
        <Callout tone="warn">
          <strong>⚠️ NUNCA subestime alergias:</strong> Nos EUA, alergias alimentares são tratadas com seriedade
          legal e médica. Use linguagem explícita. "I do not like" soa como preferência — use "I am allergic to"
          ou "I have a severe allergy."
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Tenho alergia grave a amendoim.', 'I have a severe peanut allergy — it is life-threatening.', '"Severe" = "sevíir" — grave. "Life-threatening" = risco de vida'],
            ['Sou alérgico a frutos do mar.', 'I am allergic to shellfish / seafood.', '"Shellfish" = crustáceos (camarão, caranguejo). "Seafood" = frutos do mar em geral'],
            ['Tem glúten nesse prato?', 'Does this dish contain gluten?', '"Gluten" = "glúten". "Celiac disease" = doença celíaca'],
            ['Sou intolerante à lactose.', 'I am lactose intolerant.', '"Lactose intolerant" = "léktouss intólerant"'],
            ['Não posso comer soja.', 'I cannot have soy.', '"Cannot have" = não posso consumir'],
            ['Esse prato contém ovos?', 'Does this contain eggs?', 'Ovos estão em muitos pratos escondidos — pergunte'],
            ['Pode preparar sem nozes?', 'Can this be prepared without nuts?', '"Nuts" = "náts" — nozes, castanhas em geral. "Tree nuts" = nozes de árvore'],
            ['Preciso que usem utensílios limpos.', 'Please use clean utensils to prepare my dish.', 'Contaminação cruzada é real — peça com clareza para alérgicos graves'],
            ['Tem opção sem glúten no menu?', 'Do you have a gluten-free menu?', 'Muitos restaurantes americanos têm menu separado para alergias'],
            ['Posso falar com o chef sobre minha alergia?', 'Can I speak with the chef about my allergy?', 'Muitos chefs preferem falar diretamente — pedido razoável e eficaz'],
          ]}
        />
      </Section>

      <Section title="4. Problemas com o pedido: prato errado, frio, mal cozido" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Esse não é o prato que pedi.', 'This is not what I ordered.', 'Diga com calma — erros acontecem'],
            ['Pedi ao ponto e veio mal passado.', 'I ordered medium but this is rare.', '"Rare" = mal passado (vermelho). Peça para retornar à cozinha'],
            ['A comida está fria.', 'The food is cold.', '"Could you warm this up for me?" = pode esquentar?'],
            ['O peixe não está bem cozido.', 'The fish does not seem fully cooked.', '⚠️ SEGURANÇA ALIMENTAR — não coma peixe cru não intencional'],
            ['Tem um cabelo na minha comida.', 'There is a hair in my food.', 'Chame o garçom discretamente e mostre. Eles vão trazer um novo prato'],
            ['A sopa está com gosto estranho.', 'The soup tastes off.', '"Tastes off" = "têists óf" — tem um gosto estranho/azedo'],
            ['Posso pedir um substituto?', 'Could I get a replacement dish?', '"Replacement" = "rriplêisment" — substituto'],
            ['Isso não estava no prato conforme o menu.', 'This was not included in the dish as described.', 'Aponte para o menu — prova objetiva do que foi prometido'],
            ['Pode retirar esse item e tirar da conta?', 'Can you remove this from my bill?', '"Remove from my bill" = retirar da conta'],
            ['Vou falar com o gerente.', 'I would like to speak with the manager.', 'Último recurso — diga com calma e razão'],
          ]}
        />
      </Section>

      <Section title="5. Gorjeta: quanto dar e como falar sobre ela" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Quanto devo deixar de gorjeta?', 'How much should I tip?', 'Regra geral: 18-20% para serviço normal'],
            ['A gorjeta está incluída na conta?', 'Is the gratuity included in the bill?', '"Gratuity" = "gratiúiti" — gorjeta (formal). "Tip" = informal'],
            ['A gorjeta já foi adicionada.', 'Gratuity has been added automatically.', 'Comum para grupos grandes — geralmente 18-20%'],
            ['Vou deixar USD 10 de gorjeta.', 'I will leave a USD 10 tip.', 'Dinheiro em cima da mesa ou adicione no cartão no recibo'],
            ['Serviço excelente — merecem 25%.', 'The service was excellent — I am leaving 25%.', 'Reconhecer bom serviço generosamente é bem visto nos EUA'],
            ['O serviço foi péssimo.', 'The service was really poor.', 'Mesmo em serviço ruim, 10-15% é o mínimo — reclame ao gerente em vez de não dar gorjeta'],
            ['Como calculo rápido 20%?', 'How do I calculate 20% quickly?', 'Calcule 10% (move o decimal) e dobre. Ex: conta USD 45 → 10% = USD 4.50 → 20% = USD 9'],
            ['Gorjeta em dinheiro ou cartão?', 'Should I tip in cash or on the card?', 'Gorjeta em dinheiro vai direto ao garçom. No cartão, às vezes é dividida com a casa'],
            ['Preciso dar gorjeta no balcão?', 'Do I need to tip at a counter-service restaurant?', 'Counter-service (Chipotle, etc.): opcional mas 10% é gentil. Fast food: não esperado'],
            ['Gorjeta para delivery?', 'How much should I tip for delivery?', '"Delivery tip" = 15-20% do pedido. Mínimo USD 3-5 para pedidos pequenos'],
          ]}
        />
        <Callout tone="warn">
          <strong>A realidade dos garçons americanos:</strong> muitos estados permitem pagar garçons apenas
          USD 2.13/hora — o resto vem de gorjetas. Não deixar gorjeta por insatisfação com a comida (e não o
          serviço) pune a pessoa errada. Reclame ao gerente sobre a comida; dê gorjeta pelo serviço.
        </Callout>
      </Section>

      <Section title="6. Conta e divisão (splitting the bill)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Pode trazer a conta?', 'Can we get the check, please?', '"Check" nos EUA = conta do restaurante. UK = "bill"'],
            ['Pode dividir em 4?', 'Can we split this four ways?', '"Four ways" = quatro partes iguais'],
            ['Posso pagar separado?', 'Can I pay separately?', '"Separately" = "sépparritli"'],
            ['Cada um paga o seu.', 'We would each like to pay for our own.', '"Each pay for our own" = cada um paga o seu'],
            ['Ele paga tudo — é o aniversário dele.', 'He is paying for everything — it is his birthday.', 'Comum nos EUA tratar o aniversariante'],
            ['Vou pagar o meu e o dela.', 'I will cover mine and hers.', '"Cover" = cobrir, pagar por'],
            ['Pode colocar dois cartões?', 'Can you split it between two cards?', 'Muitos restaurantes aceitam split entre 2 cartões'],
            ['Quanto fica por pessoa?', 'How much is it per person?', '"Per person" = por pessoa'],
            ['Pode separar o vinho da comida na conta?', 'Can you itemize the drinks separately?', '"Itemize" = "áitemaiz" — detalhar por item'],
            ['A conta parece errada.', 'Something seems off on the bill.', '"Seems off" = parece errado. Confira item por item'],
          ]}
        />
      </Section>

      <Section title="7. Drive-thru — o mais difícil para brasileiros" accent={ACCENT}>
        <Callout tone="info">
          <strong>Por que o drive-thru é difícil:</strong> o áudio é ruim, o atendente fala rápido, tem ruído de
          fundo, e você precisa responder sem ver o cardápio. Estratégia: saiba seu pedido antes de chegar ao
          microfone. Fale devagar e confirme antes de pagar.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Olá, pode me ouvir?', 'Hello, can you hear me?', 'Se o áudio falhar: "Sorry, could you repeat that?"'],
            ['Quero um combo número 2.', 'I would like a number 2 combo.', '"Combo" = "cómbo" — combo'],
            ['Com Coca grande.', 'With a large Coke.', '"Large" = grande. "Medium" = médio. "Small" = pequeno'],
            ['Pode trocar por suco de laranja?', 'Can I substitute the drink for orange juice?', '"Substitute the drink" = trocar a bebida'],
            ['Pode repetir o total?', 'Could you repeat the total?', 'Peça sem vergonha — o áudio é realmente ruim'],
            ['Vai comer aqui ou levar?', 'Is that for here or to go?', 'No drive-thru: sempre "to go"'],
            ['Quero extra picles.', 'I would like extra pickles.', '"Extra pickles" = mais pepino em conserva'],
            ['Sem cebola.', 'No onions, please.', 'Modificações: "no [ingredient]" + "extra [ingredient]"'],
            ['Tem desconto com o app?', 'Do you have a deal on the app?', 'McDonald\'s, Burger King e Wendy\'s têm descontos exclusivos no app'],
            ['Pode verificar meu pedido antes de fechar?', 'Could you confirm my order before I pull up?', '"Pull up" = avançar para a janela. Confirme antes de pagar'],
          ]}
        />
      </Section>

      <Section title="8. Food truck e pedido em balcão" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Qual é a especialidade aqui?', 'What is your specialty here?', '"Specialty" = "spéshielti" — especialidade da casa'],
            ['Tem algo vegetariano?', 'Do you have anything vegetarian?', '"Anything" = qualquer coisa — pergunta aberta'],
            ['Quanto tempo demora?', 'How long is the wait?', '"Wait" = "wêit" — espera'],
            ['Posso pagar com cartão?', 'Do you take cards?', 'Food trucks: cada vez mais aceitam — mas leve dinheiro por precaução'],
            ['Pode colocar meu nome?', 'Can I give you my name for the order?', 'Ou podem dar um número: "You are order number 47"'],
            ['Qual é o molho mais picante?', 'Which sauce is the spiciest?', '"Spiciest" = "spáissiest" — mais picante (superlativo)'],
            ['Tem porção pequena?', 'Do you have a smaller portion?', 'Muitos food trucks têm só uma versão — pergunte'],
            ['Pode tirar o coentro?', 'Can you hold the cilantro?', '"Hold the [ingredient]" = tirar o ingrediente do prato'],
            ['Está incluso o garfo / talher?', 'Are utensils included?', '"Utensils" = "iuténsils" — talheres'],
            ['Isso é picante por padrão?', 'Is this spicy by default?', '"By default" = por padrão, como vem normalmente'],
          ]}
        />
      </Section>

      <Section title="9. Delivery por app: problemas e reclamações" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Meu pedido está atrasado há 1 hora.', 'My order is over an hour late.', 'Reporte no app — DoorDash e Uber Eats reembolsam por atrasos graves'],
            ['O entregador não achou meu endereço.', 'The driver cannot find my address.', 'Ligue ou mande mensagem no app com referência ("white building, apt 3B")'],
            ['Veio um item errado.', 'I received the wrong item.', 'Documente com foto e reporte imediatamente'],
            ['Faltou um item no pedido.', 'An item is missing from my order.', '"Missing item" = "míssing áitem" — item faltando'],
            ['A comida chegou fria.', 'The food arrived cold.', 'Tire foto e reporte — crédito ou reembolso geralmente concedido'],
            ['Quero cancelar o pedido.', 'I would like to cancel my order.', 'Só cancelar antes do restaurante aceitar — depois tem custo'],
            ['Quero reembolso.', 'I would like a refund.', '"Refund" pelo app. Pode demorar 5-7 dias úteis'],
            ['O entregador marcou como entregue mas não entregou.', 'The driver marked it as delivered but I never received it.', 'Reporte com urgência — suspeita de fraude'],
            ['Posso dar feedback sobre o entregador?', 'Can I rate the delivery driver?', '"Rate" = avaliar. Avaliações afetam diretamente a renda do entregador'],
            ['Tem crédito por ser cliente fiel?', 'Do you have loyalty rewards?', 'DoorDash tem DashPass. Uber Eats tem Uber One. Ambos valem para quem pede frequente'],
          ]}
        />
      </Section>

      <Section title="10. Bar americano: pedir drinks, tabs e ID" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Posso ver o cardápio de drinks?', 'Can I see the drink menu?', '"Drink menu" = cardápio de bebidas'],
            ['Uma cerveja, por favor.', 'Can I get a beer?', '"On tap" = chope/pressão. "Bottled" = garrafa. "Draft" = chope'],
            ['Qual cerveja artesanal você tem?', 'What craft beers do you have on tap?', '"Craft beer" = "kráft bíir" — cerveja artesanal'],
            ['Pode abrir uma comanda?', 'Can I open a tab?', '"Tab" = "téb" — comanda. Você deixa o cartão, paga ao sair'],
            ['Quero fechar a comanda.', 'I would like to close my tab.', '"Close my tab" = fechar a comanda'],
            ['Pode me pedir um ID?', 'Can I see your ID?', 'Sinal positivo — você parece jovem! Mostre passaporte ou carteira'],
            ['Que gin vocês usam no martini?', 'What gin do you use in your martini?', 'Bartenders americanos adoram falar sobre o que usam'],
            ['Quero algo sem álcool.', 'I would like something non-alcoholic.', '"Mocktail" = versão sem álcool de um coquetel'],
            ['Pode fazer mais fraco?', 'Can you make it lighter / less strong?', '"Less strong" = menos forte. "Light on the [spirit]" = pouco da bebida alcoólica'],
            ['Gorjeta para o bartender?', 'What is a good tip for the bartender?', 'USD 1-2 por drink simples. 15-20% em bares com serviço de mesa. Gorjeta faz você ser lembrado'],
          ]}
        />
        <Callout tone="info">
          <strong>Sistema de "tab" nos EUA:</strong> em bares americanos, é comum deixar o cartão de crédito no
          balcão ao chegar — o bartender abre uma "tab" (comanda). Você pede à vontade e fecha só ao sair. Prático,
          mas não esqueça de fechar a tab antes de ir embora — e adicione a gorjeta no papel.
        </Callout>
      </Section>
    </div>
  );
}
