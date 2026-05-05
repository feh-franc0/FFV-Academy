import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-supermercado-compras');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'Você está na seção de carnes e quer um bife bem passado. O que você diz?',
    options: [
      '"I want my steak very cooked."',
      '"I would like my steak well-done, please."',
      '"Give me a burned steak."',
      '"My steak should be full cooked."',
    ],
    correct: 1,
    explanation:
      'Os pontos de carne em inglês são: rare (mal passado / "vermelho"), medium-rare (ao ponto para mal), medium (ao ponto), medium-well (ao ponto para bem) e well-done (bem passado). "Well-done" é o termo correto para bem passado.',
  },
  {
    question: 'Na farmácia americana, você tem dor de garganta mas não sabe o nome do remédio. O que você faz?',
    options: [
      'Comprar o remédio mais caro',
      'Descrever o sintoma ao farmacêutico: "My throat hurts a lot and I have trouble swallowing — what do you recommend?"',
      'Procurar no Google e mostrar o nome em inglês',
      'Comprar só analgésico genérico sem perguntar',
    ],
    correct: 1,
    explanation:
      'O farmacêutico americano (pharmacist) é um profissional altamente treinado e pode recomendar medicamentos OTC (over the counter = sem receita). Descreva seus sintomas com clareza. "My throat hurts" = minha garganta dói. "Trouble swallowing" = dificuldade para engolir.',
  },
  {
    question: 'Qual é a frase correta para devolver um produto no Walmart?',
    options: [
      '"I want my money back for this."',
      '"I would like to return this item — I have the receipt."',
      '"This product is bad, take it back."',
      '"Refund me please."',
    ],
    correct: 1,
    explanation:
      '"I would like to return this item" é a frase padrão e educada para devolução. Sempre tenha o "receipt" (recibo/nota). A maioria das lojas americanas tem política de devolução de 30-90 dias. "Exchange" = trocar por outro produto. "Refund" = devolução em dinheiro/crédito.',
  },
  {
    question: 'No self-checkout, a máquina diz "Unexpected item in the bagging area" — o que aconteceu?',
    options: [
      'Você esqueceu de passar um item',
      'Você colocou algo na sacola antes de a máquina registrar o peso correto, ou a balança detectou um item que não foi escaneado',
      'Seu cartão foi recusado',
      'O código de barras não leu',
    ],
    correct: 1,
    explanation:
      'O self-checkout usa uma balança na área de embalagem. Se o peso não bater com o item escaneado — seja porque você colocou uma bolsa pesada, apoiou o cotovelo ou colocou um item extra — a máquina trava. Tire o item, espere a mensagem desaparecer, ou chame o atendente com "Excuse me, the machine is frozen."',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-supermercado-compras"
      title="Cenário: Supermercado e Compras"
      icon="🛒"
      xp={85}
      readTime={32}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="cenario-restaurante-alimentacao"
      nextTitle="Cenário: Restaurante e Alimentação"
      relatedSlugs={['cenario-restaurante-alimentacao', 'cenario-moradia-vizinhanca', 'ingles-1000-palavras']}
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
        Compras do dia a dia parecem simples mas escondem armadilhas: embalagens com termos confusos, diferença entre
        lojas, self-checkout que trava, farmácia sem saber o nome do remédio. Este módulo cobre 100 trocas reais
        em 10 sub-situações para você nunca ficar sem saber o que dizer no supermercado americano.
      </p>

      <Section title="1. Navegando o supermercado e pedindo ajuda" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Com licença, onde fica o azeite?', 'Excuse me, where is the olive oil?', '"Excuse me" sempre antes de abordar um funcionário'],
            ['Está no corredor 5, do lado direito.', 'It is in aisle 5, on the right side.', '"Aisle" = "ail" — corredor do supermercado'],
            ['Tem versão sem glúten?', 'Do you have a gluten-free version?', '"Gluten-free" = "glúten-fri"'],
            ['Onde ficam os produtos orgânicos?', 'Where is the organic section?', '"Organic" = "orgénik" — orgânico'],
            ['Esse produto está em falta?', 'Is this item out of stock?', '"Out of stock" = "aut ov stók" — esgotado'],
            ['Quando vai ter estoque?', 'When will it be back in stock?', '"Back in stock" = volta ao estoque'],
            ['Tem algo parecido?', 'Do you have something similar?', '"Similar" = "símilár"'],
            ['Onde ficam os produtos congelados?', 'Where is the frozen food section?', '"Frozen food" = "fróuzen fúud" — comida congelada'],
            ['Estou procurando feijão preto.', 'I am looking for black beans.', 'Nos EUA, feijão preto = "black beans". Procure no corredor de comida latina'],
            ['Tem seção de comida latina?', 'Do you have a Latin / Hispanic food section?', 'Maioria dos grandes supermercados tem. Pergunta vale muito'],
          ]}
        />
        <Callout tone="info">
          <strong>Layout típico de supermercado americano:</strong> Produce (frutas/legumes) → Bakery (padaria) →
          Deli (frios/pronto) → Meat/Seafood (carnes/frutos do mar) → Dairy (laticínios) → Frozen (congelados) →
          Center aisles (enlatados, secos, bebidas). Leite e ovos quase sempre no fundo — estratégia para te fazer
          andar por tudo.
        </Callout>
      </Section>

      <Section title="2. Entendendo embalagens e validade" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Data de validade', '"Best by" / "Use by" / "Sell by"', '"Best by" = melhor até. "Use by" = use até. "Sell by" = venda até (para a loja)'],
            ['Pode comer depois do "best by"?', 'Is it okay to eat after the "best by" date?', '"Best by" é qualidade, não segurança. "Use by" em carnes = siga à risca'],
            ['Qual é o tamanho da porção?', 'What is the serving size?', '"Serving size" = tamanho da porção no rótulo nutricional'],
            ['Quantas calorias por porção?', 'How many calories per serving?', '"Calories" na embalagem = kcal no padrão brasileiro'],
            ['Tem alérgenos?', 'Does it contain any allergens?', '"Contains: wheat, milk, eggs" = contém: trigo, leite, ovos'],
            ['O que é "non-GMO"?', 'What does non-GMO mean?', '"Non-GMO" = não transgênico — comum em produtos naturais'],
            ['O que é "cage-free"?', 'What does cage-free mean?', '"Cage-free" = galinhas criadas sem gaiola — não garante pasto livre'],
            ['O que é "grass-fed"?', 'What does grass-fed mean?', '"Grass-fed" = alimentado com pasto — geralmente mais caro e mais nutritivo'],
            ['É diet ou zero açúcar?', 'Is this sugar-free or diet?', '"Sugar-free" = sem açúcar. "Diet" = versão light (pode ter adoçante)'],
            ['Quantos gramas tem?', 'How many ounces is this?', 'EUA usa oz e lb — 1 lb = 453g. 1 oz = 28g'],
          ]}
        />
        <Callout tone="warn">
          <strong>Medidas nos EUA:</strong> tudo é em ounces (oz), pounds (lb), cups e tablespoons. Para cozinhar
          com receitas americanas: 1 cup = 240ml, 1 tablespoon = 15ml, 1 teaspoon = 5ml. Compre uma xícara
          medidora americana — faz toda a diferença.
        </Callout>
      </Section>

      <Section title="3. Seção de carnes: como pedir o corte certo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Quero um bife ao ponto.', 'I would like a medium steak, please.', 'Pontos: rare / medium-rare / medium / medium-well / well-done'],
            ['Pode cortar mais fino?', 'Can you slice it thinner?', '"Slice" = "sláis" — fatiar'],
            ['Quanto custa por libra?', 'How much is it per pound?', '"Per pound" = por libra. 1 lb = 453g'],
            ['Qual é o corte mais macio?', 'Which cut is the most tender?', '"Tender" = "ténder" — macio, suculento'],
            ['Picanha em inglês', 'Picanha is called "top sirloin cap" or "coulotte"', 'Não é fácil de achar — açougue latino tem mais chances'],
            ['Frango inteiro ou pedaços?', 'Do you have whole chicken or just parts?', '"Parts" = pedaços. "Bone-in" = com osso. "Boneless" = sem osso'],
            ['Tem linguiça brasileira?', 'Do you carry any Brazilian sausage?', 'Lojas latinas têm "linguiça". Supermercados normais: "chorizo" é o mais próximo'],
            ['Pode moer esse bife?', 'Can you grind this for me?', '"Grind" = "gráind" — moer. "Ground beef" = carne moída'],
            ['Qual é a porcentagem de gordura?', 'What is the fat content / fat percentage?', '"80/20 ground beef" = 80% carne, 20% gordura — padrão para hambúrguer'],
            ['Tem carne de cordeiro?', 'Do you carry lamb?', '"Lamb" = "lém" — cordeiro. Mais comum em açougues étnicos'],
          ]}
        />
      </Section>

      <Section title="4. Self-checkout e caixa normal" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['A máquina travou.', 'The machine is frozen / not responding.', '"Frozen" para máquina = travada. Chame o atendente'],
            ['Meu cupom não funcionou.', 'My coupon did not scan.', '"Scan" = "scén" — ler pelo leitor. "Coupon" = "kiúpon"'],
            ['Tem sacolas?', 'Do you have bags?', 'Muitos estados cobram por sacola — traga a sua'],
            ['Pode passar no débito?', 'Can I pay with debit?', '"Debit" = "débit". "Credit" = "crédit". "Cash" = dinheiro'],
            ['Pode dividir no cartão?', 'Can I split it between two cards?', '"Split" = dividir. Muitos caixas aceitam split payment'],
            ['Qual é o total?', 'What is the total?', 'O imposto (tax) é adicionado na hora — não está no preço da etiqueta'],
            ['Preciso de nota fiscal.', 'Can I get a receipt?', '"Receipt" = "rissít" — recibo/nota'],
            ['Tem desconto de clube?', 'Do you have a store loyalty card discount?', '"Loyalty card" = cartão fidelidade da rede'],
            ['Como funciona o cashback?', 'How does cashback work here?', 'Muitos supermercados permitem sacar dinheiro no débito'],
            ['Posso pagar com Apple Pay?', 'Do you accept Apple Pay / Google Pay?', 'Quase todos aceitam — aproxime o celular do terminal'],
          ]}
        />
        <Callout tone="info">
          <strong>Tax nos EUA:</strong> o preço na etiqueta NÃO inclui o imposto (sales tax). Varia por estado:
          Oregon = 0%, Califórnia = ~10%, Texas = ~8%. Alimentos básicos geralmente têm tax reduzida ou zero.
          Itens preparados (comida pronta) quase sempre têm tax cheia.
        </Callout>
      </Section>

      <Section title="5. Farmácia: descrevendo o problema sem saber o nome do remédio" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Minha garganta está doendo muito.', 'My throat really hurts.', '"Throat" = "tróut" — garganta'],
            ['Estou com febre e dor de cabeça.', 'I have a fever and a headache.', '"Fever" = "fíver". "Headache" = "hédêik"'],
            ['Tenho tosse seca há 3 dias.', 'I have had a dry cough for 3 days.', '"Dry cough" = tosse seca. "Wet/productive cough" = tosse com catarro'],
            ['Estou com nariz entupido.', 'My nose is stuffy / congested.', '"Stuffy" = "stáfi" — entupido. "Runny nose" = nariz escorrendo'],
            ['O que você recomenda para isso?', 'What do you recommend for this?', 'O farmacêutico (pharmacist) pode recomendar — pergunte sempre'],
            ['Isso precisa de receita?', 'Does this require a prescription?', '"Prescription" = "preskriípchen" — receita médica'],
            ['Tem genérico mais barato?', 'Is there a generic version?', 'Genéricos americanos têm a mesma fórmula — muito mais baratos'],
            ['Posso tomar com esse outro remédio?', 'Can I take this with [nome do outro remédio]?', 'SEMPRE pergunte sobre interações medicamentosas'],
            ['Qual é a dosagem para adultos?', 'What is the adult dosage?', '"Dosage" = "dóusidj" — posologia/dosagem'],
            ['Posso tomar se estiver grávida?', 'Is this safe to take during pregnancy?', '⚠️ CRÍTICO — sempre pergunte ao farmacêutico ou médico'],
          ]}
        />
        <Callout tone="warn">
          <strong>⚠️ Medicamentos nos EUA:</strong> muitos remédios que são vendidos livremente no Brasil precisam
          de receita nos EUA (antibióticos, certos ansiolíticos). Não tente importar pelo mala — é crime federal.
          Para consultas rápidas sem seguro, use "urgent care" ou apps como Teladoc.
        </Callout>
      </Section>

      <Section title="6. Devolução de produto (return/exchange)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Quero devolver esse produto.', 'I would like to return this item.', '"Return" = devolução. Vá ao balcão de "Customer Service"'],
            ['Tenho o recibo.', 'I have the receipt.', 'Sempre guarde recibos por pelo menos 30 dias'],
            ['Não tenho o recibo.', 'I do not have the receipt.', 'Muitas lojas aceitam devolução pelo número do cartão usado'],
            ['O produto estava com defeito.', 'The product was defective.', '"Defective" = "diféktiv" — com defeito'],
            ['Não era o que eu queria.', 'It was not what I was looking for.', '"Not what I was looking for" — não culpa a loja, mais educado'],
            ['Quero trocar por outro tamanho.', 'I would like to exchange this for a different size.', '"Exchange" = "ikstchêindj" — troca'],
            ['Quero o reembolso no cartão.', 'I would like the refund back to my card.', '"Refund" = "rrifiánd" — devolução do valor'],
            ['Qual é o prazo de devolução?', 'What is your return policy?', '"Return policy" = política de devolução'],
            ['Isso está dentro do prazo de devolução?', 'Is this still within the return window?', '"Return window" = janela/prazo de devolução'],
            ['O gerente pode me ajudar?', 'Can I speak with the manager?', 'Escalate com calma — managers têm mais poder para aprovar exceções'],
          ]}
        />
      </Section>

      <Section title="7. Walmart / Target / Costco — diferenças e como usar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Onde fica o setor de eletrônicos?', 'Where is the electronics section?', 'No Walmart: fundos à direita. No Target: geralmente ao centro'],
            ['Tem associação no Costco?', 'Do I need a membership for Costco?', '"Membership" = "mémbership" — associação. Custa ~USD 65/ano'],
            ['Vale a pena o Costco para uma pessoa só?', 'Is Costco worth it for a single person?', 'Para solteiro: difícil. Para família ou dividindo com vizinho: sim'],
            ['O que é o Walmart+ ?', 'What is Walmart+?', '"Walmart+" = programa de assinatura com frete grátis e descontos. Similar ao Amazon Prime'],
            ['Tem marca própria?', 'Do you have store brand / generic brand?', '"Store brand" = marca do supermercado — mais barato, mesma qualidade'],
            ['A Target tem Starbucks dentro?', 'Does this Target have a Starbucks inside?', 'Sim — muitas Targets têm Starbucks e outras lojas dentro'],
            ['Qual é a fila menor?', 'Which checkout line is shorter?', '"Checkout line" = fila do caixa'],
            ['Tem pickup de compras online?', 'Do you offer curbside pickup?', '"Curbside pickup" = você pede online e retira no estacionamento'],
            ['Tem entrega para casa?', 'Do you offer home delivery?', 'Walmart, Target e Costco têm delivery — verifique disponibilidade pelo CEP'],
            ['Posso devolver na loja algo comprado online?', 'Can I return an online order in-store?', 'Geralmente sim — leve o email de confirmação'],
          ]}
        />
        <Callout tone="info">
          <strong>Hierarquia de preço:</strong> Costco (menor preço por unidade, mas compra em volume) {'>'} Walmart
          (menor preço unitário em geral) {'>'} Target (preço similar ao Walmart, mas ambiente mais premium) {'>'} Whole
          Foods (premium/orgânico). Aldi e Lidl têm preços de Costco sem necessidade de associação.
        </Callout>
      </Section>

      <Section title="8. Thrift store e garage sale" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Onde ficam as roupas de segunda mão?', 'Where is the used clothing section?', '"Thrift store" = brechó. Goodwill e Salvation Army são os maiores'],
            ['Esse item tem defeito?', 'Does this item have any damage?', 'Examine bem — "as-is" = sem garantia de devolução em thrift stores'],
            ['Qual é o preço desse?', 'How much is this?', 'Muitos itens de garage sale não têm etiqueta — pergunte'],
            ['Pode fazer um desconto?', 'Can you do any better on the price?', '"Can you do better" = pode melhorar o preço? — negociação é esperada em garage sales'],
            ['Esse ainda funciona?', 'Does this still work?', 'Sempre teste eletrônicos antes de comprar em garage sale'],
            ['Tem mais itens de cozinha?', 'Do you have more kitchen items?', '"Kitchen items" = utensílios de cozinha'],
            ['Aceita dinheiro?', 'Do you take cash?', 'Garage sales: geralmente só cash. Thrift stores: aceitam cartão'],
            ['Que dia saem itens novos?', 'What day do new items come out?', 'Goodwill geralmente tem novidades no meio da semana'],
            ['Tem desconto de cor da etiqueta?', 'What does the tag color discount mean?', 'Goodwill tem sistema de cores — determinadas cores dão 50% de desconto'],
            ['Posso reservar esse item?', 'Can I put this on hold?', '"On hold" = reservado. Maioria dos thrift stores não aceita — compra na hora'],
          ]}
        />
      </Section>

      <Section title="9. Mercado online (Amazon, Instacart) e recebimento" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Meu pedido não chegou.', 'My order has not arrived yet.', 'Track pelo app primeiro antes de contatar o suporte'],
            ['O rastreamento diz "entregue" mas não recebi.', 'The tracking says delivered but I did not receive it.', '"Package theft" = roubo de pacote. Comum nos EUA — documente e reporte'],
            ['Quero cancelar o pedido.', 'I would like to cancel my order.', 'Se já enviado: solicite return label para devolver'],
            ['O produto chegou danificado.', 'The item arrived damaged.', 'Tire foto e reporte imediatamente — Amazon reembolsa na hora na maioria dos casos'],
            ['Meu produto está atrasado.', 'My delivery is late.', 'Amazon Prime promete 2 dias — se atrasar, às vezes dão crédito'],
            ['Posso substituir um item?', 'Can you substitute this item?', 'No Instacart: você pode aprovar ou rejeitar substituições pelo app'],
            ['Não gostei da substituição.', 'I am not happy with this substitution.', 'No Instacart você tem opção "no substitution" por item'],
            ['Como pago a gorjeta do entregador?', 'How do I tip the delivery driver?', 'Instacart sugere 5% — 10-15% é o padrão gentil'],
            ['Onde deixar as instruções de entrega?', 'Where do I add delivery instructions?', '"Delivery instructions" — no checkout. Ex: "Leave at door, ring bell"'],
            ['Posso devolver na Amazon sem caixa?', 'Can I return to Amazon without the original box?', 'Sim — Amazon tem parceria com Kohl\'s e UPS para return sem embalagem'],
          ]}
        />
      </Section>

      <Section title="10. Lidando com preço errado ou cupom" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['O preço cobrado foi diferente do anunciado.', 'The price charged was different from the advertised price.', '"Advertised price" = preço no anúncio/etiqueta da prateleira'],
            ['A etiqueta da prateleira diz USD 3.99.', 'The shelf label says USD 3.99.', '"Shelf label" = "chelf léibel" — etiqueta na prateleira'],
            ['Me cobraram errado.', 'I was overcharged.', '"Overcharged" = cobrado a mais'],
            ['Meu cupom não funcionou no caixa.', 'My coupon did not apply at checkout.', '"Did not apply" = não foi aplicado'],
            ['Esse cupom expirou?', 'Has this coupon expired?', '"Expired" = "ikspáird" — vencido'],
            ['Pode aplicar o cupom manualmente?', 'Can you manually apply the coupon?', '"Manually" = "méniiueli"'],
            ['Tem o anúncio do preço?', 'Do you have the advertisement for this price?', 'Guarde screenshots de promoções — muitas lojas honram o preço anunciado'],
            ['Política de honrar preço mais baixo do concorrente.', 'Do you have a price match policy?', '"Price match" = igualar o preço do concorrente. Walmart, Target e Best Buy têm'],
            ['Posso mostrar o preço no meu celular?', 'Can I show you the price on my phone?', 'Mostre o site do concorrente — a maioria aceita screenshot'],
            ['Quanto de desconto vou receber?', 'How much of a discount will I receive?', '"Discount" = "díscaunt" — desconto'],
          ]}
        />
        <Callout tone="info">
          <strong>Price match nos EUA:</strong> Walmart, Target, Best Buy e Home Depot têm política de price
          match — se você encontrar mais barato no concorrente, eles igualam o preço na hora. Pesquise antes de
          comprar itens caros. Apps como Honey e Capital One Shopping fazem isso automaticamente online.
        </Callout>
      </Section>
    </div>
  );
}
