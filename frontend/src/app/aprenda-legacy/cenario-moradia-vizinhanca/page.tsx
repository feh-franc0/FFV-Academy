import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-moradia-vizinhanca');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'O landlord pede um "security deposit" — o que é isso?',
    options: [
      'Uma taxa de seguro obrigatória do imóvel',
      'Um depósito caução devolvido no fim do contrato se o imóvel estiver em boas condições',
      'O primeiro mês de aluguel pago antecipado',
      'Uma taxa de cadastro não reembolsável',
    ],
    correct: 1,
    explanation:
      '"Security deposit" é o equivalente à caução brasileira — em geral 1 a 2 meses de aluguel. Será devolvido ao sair (com juros, em alguns estados) desde que o apartamento não tenha danos além do desgaste normal ("normal wear and tear").',
  },
  {
    question: 'Você quer reclamar do vazamento na cozinha — como você diz isso ao landlord?',
    options: [
      '"The water is broken in my kitchen."',
      '"There is a leak under the kitchen sink — it needs to be fixed."',
      '"My kitchen has a water problem, please help."',
      '"The kitchen is wet and broken."',
    ],
    correct: 1,
    explanation:
      '"There is a leak" = tem um vazamento. "Under the kitchen sink" = embaixo da pia da cozinha. "It needs to be fixed" = precisa ser consertado. Seja específico sobre a localização — o landlord vai mandar um profissional.',
  },
  {
    question: 'Seu vizinho faz barulho todo dia à meia-noite. Qual é a forma mais eficaz de abordar?',
    options: [
      'Bater na porta e gritar "Shut up!"',
      'Ir educadamente e dizer "Hey, I hate to bother you, but the noise is keeping me up — could you keep it down after 10?"',
      'Chamar a polícia imediatamente',
      'Ignorar e não falar nada',
    ],
    correct: 1,
    explanation:
      'A abordagem mais eficaz é educada mas direta. "I hate to bother you" = odeio incomodar (suaviza o pedido). "Keeping me up" = me mantendo acordado. "Keep it down" = fazer menos barulho. Isso funciona na maioria dos casos antes de escalar para o landlord ou polícia.',
  },
  {
    question: 'O que é um "lease agreement"?',
    options: [
      'Um acordo verbal entre vizinhos',
      'O contrato formal de locação assinado entre inquilino e proprietário',
      'A lista de regras do condomínio',
      'O comprovante de pagamento do aluguel',
    ],
    correct: 1,
    explanation:
      '"Lease agreement" é o contrato de aluguel. Ele define: valor do aluguel, prazo (geralmente 12 meses), regras sobre pets, guests, subalocação, e o que acontece ao sair antes do prazo. LEIA ANTES DE ASSINAR — leve para um advogado se necessário.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-moradia-vizinhanca"
      title="Cenário: Moradia e Vizinhança"
      icon="🏠"
      xp={90}
      readTime={35}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="cenario-supermercado-compras"
      nextTitle="Cenário: Supermercado e Compras"
      relatedSlugs={['cenario-aeroporto-alfandega', 'cenario-trabalho-escritorio', 'ingles-1000-palavras']}
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
        Morar num país anglófono é diferente de visitar. Você vai precisar negociar com landlords, lidar com vizinhos
        difíceis, entender contratos e resolver problemas reais. Este módulo cobre 100 trocas organizadas em
        10 sub-situações — do anúncio de apartamento até a devolução da caução.
      </p>

      <Section title="1. Procurando apartamento / casa para alugar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Vi seu anúncio online.', 'I saw your listing online.', '"Listing" = "lísting" — anúncio de imóvel'],
            ['O apartamento ainda está disponível?', 'Is the apartment still available?', '"Available" = "avéilabol"'],
            ['Qual é o valor do aluguel mensal?', 'What is the monthly rent?', '"Rent" = aluguel. "Lease" = contrato de aluguel'],
            ['As contas estão inclusas?', 'Are utilities included?', '"Utilities" = "iutílitiz" — luz, água, gás'],
            ['Aceita pets?', 'Is the apartment pet-friendly?', 'Ou: "Do you allow pets?"'],
            ['Tem estacionamento?', 'Is parking included?', 'Nos EUA, parking pode custar extra USD 100-300/mês'],
            ['Quando posso visitar?', 'When can I schedule a viewing?', '"Viewing" = "viúing" — visita ao imóvel'],
            ['Quantos quartos?', 'How many bedrooms?', '"Studio" = kitnet. "1BR" = 1 bedroom (1 quarto)'],
            ['Quantos banheiros?', 'How many bathrooms?', '"Full bath" = banheiro completo. "Half bath" = só bacia/pia'],
            ['Tem máquina de lavar na unidade?', 'Does the unit have in-unit laundry?', '"In-unit" = dentro do apartamento. "Shared laundry" = área comum'],
          ]}
        />
        <Callout tone="info">
          <strong>Vocabulário de imóveis:</strong> "Studio" = kitnet. "1BR/2BR" = 1 ou 2 quartos. "Condo" =
          apartamento em condomínio. "Townhouse" = casa geminada. "Single-family home" = casa unifamiliar.
          "Duplex" = duas unidades numa mesma construção.
        </Callout>
      </Section>

      <Section title="2. Entrevista com o landlord e perguntas sobre o imóvel" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Você precisa de referências?', 'Do you require references?', '"References" = referências de ex-landlords ou empregadores'],
            ['Você verifica o crédito?', 'Do you run a credit check?', 'Sem histórico de crédito americano = problema. Explique sua situação'],
            ['Sou novo nos EUA e não tenho crédito aqui.', 'I am new to the US and do not have a credit history here yet.', 'Ofereça pagar mais meses adiantado ou apresentar carta do empregador'],
            ['O telhado tem algum problema?', 'Are there any issues with the roof?', '"Issues" = "íshuz" — problemas, questões'],
            ['A fiação elétrica é atualizada?', 'Is the electrical wiring up to date?', '"Up to date" = atualizado, em dia'],
            ['O bairro é seguro?', 'Is this a safe neighborhood?', '"Neighborhood" = "néiberhud" — bairro, vizinhança'],
            ['Qual é o prazo mínimo de contrato?', 'What is the minimum lease term?', '"Term" = prazo'],
            ['Posso sublocar se precisar sair antes?', 'Am I allowed to sublease if I need to leave early?', '"Sublease" = "sablíis" — sublocar'],
            ['Vocês fazem manutenção rapidamente?', 'How quickly do you respond to maintenance requests?', 'Pergunta essencial — landlord ruim = pesadelo'],
            ['Tem algum aumento de aluguel previsto?', 'Are there any planned rent increases?', 'Pergunte antes de assinar — em alguns estados é regulado'],
          ]}
        />
        <Callout tone="warn">
          <strong>Crédito nos EUA:</strong> sem histórico de crédito americano (credit history), muitos landlords
          vão recusar. Estratégias: ofereça 3-6 meses adiantado, apresente carta do empregador, use um cosigner
          (fiador americano), ou use plataformas como Rhino que substituem o security deposit tradicional.
        </Callout>
      </Section>

      <Section title="3. Assinando o contrato (lease agreement)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Posso ler o contrato com calma?', 'Can I take some time to read the lease?', 'NUNCA assine na hora. Peça 24-48h para revisar'],
            ['O que significa essa cláusula?', 'What does this clause mean?', '"Clause" = "clóz" — cláusula'],
            ['O depósito é reembolsável?', 'Is the security deposit refundable?', '"Refundable" = "riféndabol" — reembolsável'],
            ['Quando o aluguel vence?', 'When is the rent due?', '"Due" = "diú" — vencimento. "Due date" = data de vencimento'],
            ['Tem multa por atraso?', 'Is there a late fee?', '"Late fee" = multa por atraso — em geral 5-10% do aluguel'],
            ['Com quanto de antecedência devo avisar ao sair?', 'How much notice do you require before moving out?', '"Notice" = aviso prévio. Geralmente 30-60 dias'],
            ['Posso fazer pequenas reformas?', 'Am I allowed to make minor modifications?', 'Ex: furar parede, trocar maçaneta — pergunte antes'],
            ['Posso ter um roommate?', 'Can I have a roommate?', '"Roommate" = colega de quarto/apartamento'],
            ['O contrato renova automaticamente?', 'Does the lease auto-renew?', '"Auto-renew" = renovar automaticamente'],
            ['Prefiro assinar digitalmente.', 'I can sign digitally — do you accept DocuSign?', '"Digitally" = digitalmente — maioria aceita DocuSign'],
          ]}
        />
        <Callout tone="info">
          <strong>O que checar no lease:</strong> (1) rent amount e due date, (2) lease term (início e fim),
          (3) security deposit amount e condições de devolução, (4) pet policy, (5) guest policy,
          (6) maintenance responsibilities, (7) early termination penalty, (8) rent increase policy.
        </Callout>
      </Section>

      <Section title="4. Problemas com o apartamento (manutenção)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Tem um vazamento no banheiro.', 'There is a leak in the bathroom.', '"Leak" = "líik" — vazamento'],
            ['O aquecedor não está funcionando.', 'The heater is not working.', '"Heater" = "híiter" — aquecedor. URGENTE no inverno'],
            ['O ar-condicionado quebrou.', 'The AC is not working.', '"AC" = "êi-síi" — air conditioning'],
            ['Tem uma praga de baratas.', 'There is a cockroach infestation.', '"Cockroach" = "cócroutch" — barata. Landlord é responsável'],
            ['A fechadura da porta principal está com problema.', 'The front door lock is not working properly.', '⚠️ URGENTE — questão de segurança'],
            ['O fogão não está acendendo.', 'The stove is not lighting.', '"Stove" = "stóuv" — fogão'],
            ['Tem mofo no banheiro.', 'There is mold in the bathroom.', '"Mold" = "móuld" — mofo. ⚠️ Problema de saúde'],
            ['A geladeira está com defeito.', 'The refrigerator is malfunctioning.', '"Fridge" (informal) = geladeira'],
            ['O ralo está entupido.', 'The drain is clogged.', '"Drain" = "drêin". "Clogged" = "clógd" — entupido'],
            ['Posso mandar a solicitação por escrito?', 'Can I submit a maintenance request in writing?', 'SEMPRE documente por escrito — email ou app do landlord'],
          ]}
        />
        <Callout tone="warn">
          <strong>⚠️ Documente TUDO:</strong> envie sempre as solicitações de manutenção por escrito (email, app
          ou texto) e guarde as respostas. Se o landlord não resolver em prazo razoável, você pode ter direito a
          descontar do aluguel ou rescindir o contrato — dependendo do estado.
        </Callout>
      </Section>

      <Section title="5. Apresentar-se aos vizinhos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Oi, acabei de me mudar para cá.', 'Hi, I just moved in next door.', '"Next door" = ao lado. "Downstairs" = abaixo. "Upstairs" = acima'],
            ['Meu nome é Ana.', 'My name is Ana — nice to meet you!', 'Aperto de mão ainda é comum nos EUA'],
            ['Sou do Brasil.', 'I am from Brazil.', '"Oh, Brazil! Carnival!" — prepare-se para esse comentário'],
            ['Ainda estou me acostumando com tudo.', 'I am still getting used to everything here.', '"Getting used to" = se acostumando com'],
            ['Me avise se eu fizer muito barulho.', 'Please let me know if I am ever too loud.', 'Proatividade cultural — americanos apreciam isso'],
            ['Tem algum dia de coleta de lixo?', 'What day is trash pickup?', '"Trash pickup" = "tréch pícap" — coleta de lixo'],
            ['Onde fica a lavanderia?', 'Where is the laundry room?', '"Laundry room" = "lóndri ruum"'],
            ['Pode me ensinar como funciona o lixo reciclável?', 'Can you show me how the recycling works here?', 'Reciclagem varia muito por cidade/condado nos EUA'],
            ['Tem alguma regra de condomínio que devo saber?', 'Are there any building rules I should know about?', '"Building rules" = regras do edifício/condomínio'],
            ['Se precisar de qualquer coisa, pode bater aqui.', 'If you ever need anything, feel free to knock.', '"Feel free to" = fique à vontade para'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica cultural:</strong> Nos EUA, vizinhos geralmente não se visitam sem aviso. Apresentar-se
          na primeira semana é bem-visto. Trazer um pequeno presente (cookies, por exemplo) é gesto apreciado mas
          não obrigatório. Após isso, é comum ter contato apenas quando necessário.
        </Callout>
      </Section>

      <Section title="6. Situações com vizinhos difíceis (barulho, lixo)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Odeio incomodar, mas o barulho está muito alto.', 'I hate to bother you, but the noise is really loud.', 'Comece sempre suave — "I hate to bother you"'],
            ['Você consegue baixar o volume depois das 22h?', 'Could you keep it down after 10 PM?', '"Keep it down" = fazer menos barulho'],
            ['O som está passando pela parede.', 'The sound is coming through the walls.', '"Coming through the walls" — imagem visual ajuda'],
            ['Você tem deixado o lixo no corredor.', 'You have been leaving your trash in the hallway.', '"Hallway" = "hólwei" — corredor'],
            ['Isso viola as regras do edifício.', 'That is against building policy.', 'Use as regras a seu favor — menos confronto pessoal'],
            ['Vou precisar falar com o landlord sobre isso.', 'I may need to bring this up with the landlord.', 'Escalation — usar com cuidado mas com firmeza'],
            ['Você estacionou no meu lugar.', 'You are parked in my spot.', '"Spot" = vaga reservada'],
            ['Seu cachorro late a noite toda.', 'Your dog barks all night.', '"Barks" = "báarks" — late'],
            ['Pode ser mais cuidadoso com o fumo?', 'Could you be more careful about smoking near my window?', 'Smoke drifting into units é problema legal em muitos estados'],
            ['Prefiro resolver isso entre nós antes de chamar a polícia.', 'I would rather settle this between us before calling the police.', '"Settle" = resolver. Mencionar polícia = escalation final'],
          ]}
        />
      </Section>

      <Section title="7. Pagando contas: luz, internet, gás" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Preciso configurar a conta de luz.', 'I need to set up my electricity account.', '"Electric company" = concessionária de energia. Procure pelo seu bairro'],
            ['Qual é a empresa de gás da região?', 'Which gas company services this area?', '"Services this area" = atende esta área'],
            ['Quero contratar internet.', 'I would like to set up internet service.', '"Set up" = contratar, configurar'],
            ['Qual é a velocidade do plano?', 'What is the download speed for this plan?', '"Download speed" = velocidade de download. Pergunte por Mbps'],
            ['Tem fidelidade mínima?', 'Is there a minimum contract term?', '"Contract term" = prazo mínimo de fidelidade'],
            ['Minha conta de luz está muito alta.', 'My electricity bill is very high this month.', '"Bill" = conta, fatura'],
            ['Como pago a conta?', 'How do I pay my bill?', 'Opções: online, autopay, phone, mail'],
            ['Posso configurar débito automático?', 'Can I set up autopay?', '"Autopay" = "ótopêi" — débito automático'],
            ['A internet caiu.', 'The internet is down.', '"Down" para serviços = fora do ar'],
            ['Quando vem o técnico?', 'When can a technician come?', '"Technician" = "tecnítchen"'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica prática:</strong> Nos EUA, utilities (luz, gás, água) geralmente são separadas do aluguel.
          Configure as contas no seu nome no primeiro dia — algumas empresas cobram depósito de quem não tem
          histórico de crédito americano. Internet: Xfinity, AT&T e Spectrum são as maiores; compare pelo CEP.
        </Callout>
      </Section>

      <Section title="8. Saindo do apartamento e devolução do depósito" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Vou sair no dia 30 do mês que vem.', 'I will be moving out on the 30th of next month.', 'Aviso por escrito — "written notice"'],
            ['Estou dando o aviso de 30 dias.', 'I am giving my 30-day notice.', '"30-day notice" = aviso prévio de 30 dias — geralmente obrigatório'],
            ['Como fica a devolução do depósito?', 'How does the security deposit return process work?', 'Pergunte o prazo legal — varia por estado'],
            ['Em quantos dias o depósito será devolvido?', 'Within how many days will the deposit be returned?', 'Prazo legal: geralmente 14-30 dias após a saída'],
            ['Preciso deixar o apartamento limpo?', 'Do I need to have the apartment professionally cleaned?', 'Alguns contratos exigem limpeza profissional'],
            ['Quero fazer uma vistoria antes de sair.', 'I would like to do a walkthrough before I move out.', '"Walkthrough" = "wóktruu" — vistoria presencial'],
            ['Isso é desgaste normal.', 'That is normal wear and tear.', '"Wear and tear" = desgaste normal de uso — não pode ser descontado do depósito'],
            ['Esse dano já estava aqui quando entrei.', 'This damage was already here when I moved in.', 'POR ISSO fotografie o imóvel no dia 1'],
            ['Discordo dos descontos feitos.', 'I dispute these deductions.', '"Deductions" = descontos feitos no depósito'],
            ['Vou escalar para o tribunal de pequenas causas.', 'I will take this to small claims court.', '"Small claims court" = juizado especial — funciona e é barato nos EUA'],
          ]}
        />
      </Section>

      <Section title="9. Mudança: ajuda e comunicação com transportadora" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Preciso de um orçamento para mudança.', 'I need a moving quote.', '"Moving company" = empresa de mudança. "Quote" = orçamento'],
            ['Tenho umas 30 caixas e alguns móveis.', 'I have about 30 boxes and a few pieces of furniture.', '"Furniture" = "férnicher" — móveis'],
            ['Qual é a data da mudança?', 'What is the moving date?', '"Moving date" = data da mudança'],
            ['O elevador de serviço está disponível?', 'Is the service elevator available on moving day?', 'Reserve com antecedência — alguns prédios exigem'],
            ['Tem estacionamento para o caminhão?', 'Is there a place for the moving truck to park?', '"Moving truck" = caminhão de mudança'],
            ['Pode embalar os itens frágeis?', 'Can you pack the fragile items?', '"Pack" = embalar. "Fragile" = "frédjiil"'],
            ['Esse item precisa de cuidado especial.', 'This item needs extra care.', '"Extra care" = cuidado especial'],
            ['A mudança está segurada?', 'Is the move insured?', '"Insured" = segurado — essencial para itens de valor'],
            ['Quando chegam?', 'What time will you arrive?', '"Arrive" = "arráiv" — chegar'],
            ['Podem me dar o comprovante de entrega?', 'Can I get the delivery receipt?', '"Bill of Lading" = documento oficial de entrega na mudança'],
          ]}
        />
      </Section>

      <Section title="10. HOA / Condomínio — regras e reuniões" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Qual é a taxa de condomínio?', 'What is the HOA fee?', 'HOA = Homeowners Association. "Fee" = taxa'],
            ['O que a taxa cobre?', 'What does the HOA fee cover?', 'Geralmente: piscina, academia, jardinagem, segurança'],
            ['Quando é a reunião de condôminos?', 'When is the next HOA meeting?', '"HOA meeting" = reunião do condomínio'],
            ['Posso instalar câmera na porta?', 'Am I allowed to install a camera on my door?', 'Pergunte ao HOA — regras variam muito'],
            ['Posso pintar a porta de outra cor?', 'Can I paint my front door a different color?', 'HOA costuma controlar cores externas — sim, é assim lá'],
            ['Recebi uma notificação de violação.', 'I received an HOA violation notice.', '"Violation notice" = notificação de infração'],
            ['Discordo dessa multa.', 'I would like to appeal this fine.', '"Appeal" = recorrer. Você tem direito em todos os estados'],
            ['A piscina fechou quando?', 'When did the pool close?', '"Pool" = piscina'],
            ['Posso reservar a área de churrasco?', 'Can I reserve the BBQ area?', '"BBQ area" = churrasqueira comunitária'],
            ['Tem regras sobre animais?', 'Are there pet restrictions?', '"Restrictions" = "rristríktchens" — restrições'],
          ]}
        />
        <Callout tone="info">
          <strong>HOA nos EUA:</strong> muitos condomínios e comunidades fechadas têm uma HOA (Homeowners
          Association) com regras rigorosas — cores de porta, altura do gramado, tipo de caixa de correio, horário
          de barulho. Leia o "CC&Rs" (Covenants, Conditions and Restrictions) antes de comprar ou alugar em um
          condomínio com HOA.
        </Callout>
      </Section>
    </div>
  );
}
