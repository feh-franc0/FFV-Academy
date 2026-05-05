import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-medico-emergencia');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'No ER (Emergency Room), você precisa informar uma alergia a penicilina. Qual frase é mais precisa e segura?',
    options: [
      "I don't like penicillin.",
      "⚠️ I'm allergic to penicillin — it causes anaphylaxis.",
      'Penicillin is bad for me.',
      'I had a bad experience with penicillin.',
    ],
    correct: 1,
    explanation:
      '"I\'m allergic to penicillin — it causes anaphylaxis" é a forma mais segura: nomeia a droga E o tipo de reação. Médicos americanos precisam saber a severidade da reação (anaphylaxis = anafilaxia, a mais grave). Nunca diga apenas "I don\'t like" — eles podem ignorar.',
  },
  {
    question: 'O médico disse "Take two tablets twice a day with food for 10 days." Qual é a dosagem correta?',
    options: [
      '2 comprimidos uma vez ao dia por 10 dias',
      '2 comprimidos duas vezes ao dia com comida por 10 dias',
      '1 comprimido duas vezes ao dia por 10 dias',
      '2 comprimidos duas vezes ao dia sem comida',
    ],
    correct: 1,
    explanation:
      '"Two tablets twice a day" = 2 comprimidos, 2× por dia. "With food" = junto com comida. "For 10 days" = por 10 dias. Sempre repita de volta ao médico: "So, two tablets in the morning and two at night with meals for 10 days — is that right?" ⚠️ Confirmar em voz alta evita erros de medicação.',
  },
  {
    question: 'Você está no Urgent Care e o atendente pergunta "What\'s your copay?" O que ela quer saber?',
    options: [
      'Qual é o seu número de seguro',
      'Quanto você vai pagar de sua parte nesta consulta',
      'Se você tem cobertura para medicamentos',
      'Qual é o nome do seu médico de família',
    ],
    correct: 1,
    explanation:
      'Copay (co-payment) é a sua parte fixa por visita médica — geralmente $20–$50 para Urgent Care, $150–$350 para ER. É separado do deductible. A resposta: "I believe it\'s $30 — let me check my insurance card." ⚠️ Sempre confirme o copay ANTES de entrar para evitar surpresas.',
  },
  {
    question: '⚠️ Você está descrevendo uma emergência pelo 911. Qual resposta começa corretamente?',
    options: [
      '"Hello, I have a problem at my house, can you help?"',
      '"There\'s a medical emergency at [address]. A man is unconscious and not breathing."',
      '"I need ambulance, please, my friend is sick."',
      '"Call doctor please, emergency!"',
    ],
    correct: 1,
    explanation:
      'No 911: comece com (1) tipo de emergência, (2) endereço COMPLETO, (3) estado da vítima. O despachante vai guiar o resto. Nunca espere para dar o endereço — se a ligação cair, eles precisam saber onde você está. "There\'s a medical emergency at 123 Oak Street, apartment 4B. A man is unconscious and not breathing."',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-medico-emergencia"
      title="Cenário: Médico, Hospital e Emergências"
      icon="🏥"
      xp={75}
      readTime={20}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="cenario-banco-financas"
      nextTitle="Cenário: Banco, Crédito e Finanças Pessoais"
      relatedSlugs={['cenario-trabalho-escritorio', 'cenario-banco-financas', 'ingles-1000-frases']}
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
        Este é o módulo mais importante da trilha. Você pode travar no supermercado e sobreviver — no hospital ou
        numa emergência, não saber o que dizer pode custar caro. Aqui você aprende o inglês médico real: como
        descrever sintomas com precisão, entender o sistema de saúde americano, lidar com seguro, e o que dizer
        quando ligar para o 911. Frases marcadas com ⚠️ são críticas para segurança.
      </p>

      <Callout tone="warn">
        <strong>⚠️ Sistema de saúde americano — 3 portas de entrada:</strong> (1){' '}
        <strong>Primary Care / Family Doctor</strong> — seu médico regular, para consultas não urgentes, precisa de
        agendamento; (2) <strong>Urgent Care</strong> — sem agendamento, para problemas reais mas não fatais (corte,
        febre alta, infecção, torção), copay menor; (3) <strong>ER (Emergency Room)</strong> — emergências graves
        (dor no peito, dificuldade de respirar, perda de consciência, osso quebrado), copay muito alto. Ir ao ER
        para gripe te custa $500+.
      </Callout>

      <Section title="1. Urgent Care vs ER vs Primary Care — quando ir a cada um" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Preciso de atendimento hoje, não é emergência.', 'I need to be seen today — it\'s not an emergency.', 'Urgent Care aceita walk-in (sem agendamento)'],
            ['Qual é o tempo de espera?', 'What\'s the wait time?', '"Wait time" — weyt taym'],
            ['Tenho febre alta desde ontem.', 'I\'ve had a high fever since yesterday.', '"High fever" = febre acima de 38.5°C / 101.3°F'],
            ['Torci o tornozelo — está inchado.', 'I sprained my ankle — it\'s swollen.', '"Sprained" = torcido; "swollen" = inchado — swoh-len'],
            ['Preciso de uma declaração médica para o trabalho.', 'I need a doctor\'s note for work.', '"Doctor\'s note" é o atestado médico'],
            ['⚠️ Tenho dor no peito e falta de ar.', '⚠️ I have chest pain and I\'m short of breath.', 'Vá direto ao ER — não espere'],
            ['⚠️ Ela perdeu a consciência.', '⚠️ She lost consciousness / she passed out.', 'Chame 911 imediatamente'],
            ['Meu filho tem convulsão.', 'My child is having a seizure.', '"Seizure" = sí-zhur — sempre ER'],
            ['É uma overdose de medicamento.', '⚠️ It\'s a drug overdose.', '911 — Good Samaritan Law protege quem liga'],
            ['Posso ir ao Urgent Care ou preciso do ER?', 'Should I go to Urgent Care or the ER?', 'Ligue para o 911 se estiver em dúvida'],
          ]}
        />
      </Section>

      <Section title="2. Marcando consulta e chegando ao médico" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Gostaria de marcar uma consulta.', 'I\'d like to schedule an appointment.', '"Appointment" = eh-POINT-ment'],
            ['Sou novo paciente.', 'I\'m a new patient.', 'New patient = primeira vez nessa clínica'],
            ['Tenho seguro — aqui está meu cartão.', 'I have insurance — here\'s my insurance card.', 'Sempre mostre o cartão antes de sentar'],
            ['Qual é o meu copay hoje?', 'What\'s my copay for today\'s visit?', '"Copay" = sua parte fixa por visita'],
            ['Posso preencher os formulários online antes?', 'Can I fill out the intake forms online beforehand?', '"Intake forms" = ficha de admissão'],
            ['Estou com dor há três dias.', 'I\'ve been in pain for three days.', 'Use "for" para duração'],
            ['O médico está dentro da rede do meu plano?', 'Is this doctor in-network with my insurance?', '"In-network" = credenciado no seu plano'],
            ['Preciso de encaminhamento para especialista?', 'Do I need a referral to see a specialist?', '"Referral" = encaminhamento — reh-FER-el'],
            ['Quando posso ligar para obter resultados?', 'When can I call for my test results?', 'Pergunte sempre — eles não ligam automaticamente'],
            ['Posso pagar parcelado?', 'Do you offer a payment plan?', 'Hospitais americanos geralmente oferecem'],
          ]}
        />
      </Section>

      <Section title="3. Descrevendo sintomas (dor, febre, mal-estar)" accent={ACCENT}>
        <Callout tone="info">
          <strong>Escala de dor americana:</strong> o médico vai perguntar "On a scale of 1 to 10, how bad is the
          pain?" (1 = quase nada, 10 = pior dor da vida). Seja honesto — isso afeta o tratamento. Também descreva
          o tipo: sharp (aguda), dull (surda/latejante), burning (ardência), throbbing (pulsante), constant
          (constante) ou comes and goes (vai e vem).
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['É uma dor aguda, como uma facada.', 'It\'s a sharp, stabbing pain.', '"Sharp" = dor cortante/aguda'],
            ['É uma dor surda, que vai e vem.', 'It\'s a dull, throbbing pain that comes and goes.', '"Throbbing" = tró-bing (latejante)'],
            ['Estou com náusea e tontura.', 'I feel nauseous and dizzy.', '"Nauseous" = nó-shus; "dizzy" = dí-zi'],
            ['Tenho febre de 39 graus.', 'I have a fever of 102.2°F.', 'Converta: (°C × 9/5) + 32'],
            ['Tenho dificuldade para respirar.', '⚠️ I\'m having trouble breathing / I\'m short of breath.', 'Sintoma de alerta — informe o nível de gravidade'],
            ['Minha garganta está muito inflamada.', 'My throat is really sore / inflamed.', '"Sore throat" = dor de garganta'],
            ['Está piorando desde ontem.', 'It\'s been getting worse since yesterday.', '"Getting worse" = piorando'],
            ['Não consigo dormir por causa da dor.', 'The pain is keeping me up at night.', '"Keeping me up" = não deixando dormir'],
            ['Tomei ibuprofeno mas não adiantou.', 'I took ibuprofen but it didn\'t help.', 'Mencione medicamentos que já tentou'],
            ['Nunca tive isso antes.', 'I\'ve never experienced this before.', 'Ajuda o médico a avaliar urgência'],
          ]}
        />
      </Section>

      <Section title="4. Entendendo o diagnóstico e as instruções" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Pode repetir isso de forma mais simples?', 'Can you explain that in simpler terms?', 'Médicos americanos são obrigados a esclarecer'],
            ['⚠️ Quais são os efeitos colaterais desse remédio?', '⚠️ What are the side effects of this medication?', 'Sempre pergunte — mesmo que pareça óbvio'],
            ['Posso tomar com outros remédios?', '⚠️ Can I take this with my other medications?', 'Interações medicamentosas são sérias'],
            ['Quando devo voltar?', 'When should I come back / follow up?', '"Follow-up" = consulta de retorno'],
            ['O que devo evitar comer ou fazer?', 'What should I avoid eating or doing?', 'Dieta, exercício, álcool — pergunte tudo'],
            ['Isso é sério?', 'How serious is this?', 'Pergunta válida — você tem o direito de saber'],
            ['Quais são os sinais de alerta para voltar?', '⚠️ What are the warning signs to watch for?', '"Warning signs" = sinais de piora'],
            ['Você pode escrever isso para mim?', 'Can you write that down for me?', 'Peça sempre — não confie só na memória'],
            ['Preciso de exames de sangue?', 'Do I need blood work?', '"Blood work" = exame de sangue'],
            ['Posso trabalhar normalmente?', 'Am I okay to work / return to normal activities?', 'Importante para atestado e seguro'],
          ]}
        />
      </Section>

      <Section title="5. Farmácia: pegar receita e entender a embalagem" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Vim buscar minha receita.', 'I\'m here to pick up a prescription.', '"Prescription" = preh-SKRIP-shun'],
            ['O médico enviou eletronicamente.', 'The doctor sent it over electronically.', 'Maioria das farmácias recebe direto do médico'],
            ['Quanto tempo para ficar pronto?', 'How long will it take to fill?', '"Fill" = preparar a receita'],
            ['Tem genérico disponível?', 'Is there a generic version available?', 'Genérico = much cheaper — sempre pergunte'],
            ['⚠️ Tomo isso com ou sem comida?', '⚠️ Should I take this with or without food?', 'Importa para absorção e efeitos colaterais'],
            ['Não beber álcool com esse remédio?', '⚠️ Should I avoid alcohol with this medication?', 'Farmacêutico pode responder — não o médico'],
            ['Quanto de copay?', 'What\'s my copay for this prescription?', 'Medicamentos têm copay separado'],
            ['Posso repor sem nova receita?', 'Can I get a refill without a new prescription?', '"Refill" = reposição'],
            ['Como armazenar esse remédio?', 'How should I store this medication?', 'Alguns precisam de geladeira'],
            ['Isso pode causar sonolência?', 'Will this make me drowsy?', '"Drowsy" = dró-zi (sonolento)'],
          ]}
        />
      </Section>

      <Section title="6. Health insurance: copay, deductible, in-network" accent={ACCENT}>
        <Callout tone="info">
          <strong>Glossário financeiro de saúde americano:</strong> Premium = mensalidade do plano. Deductible =
          franquia anual que você paga antes do plano cobrir. Copay = valor fixo por consulta ($20–$50 Urgent Care,
          $150–$350 ER). Coinsurance = % que você paga após o deductible (ex: 20%). Out-of-pocket maximum = teto
          anual do seu gasto. In-network = médico credenciado (mais barato). Out-of-network = não credenciado
          (muito mais caro).
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Esse médico está na rede do meu plano?', '⚠️ Is this provider in-network with my insurance?', 'SEMPRE pergunte antes — out-of-network = caro'],
            ['Quanto fica minha parte do ER?', 'What\'s my ER copay?', 'ER copay: típico $150–$350 + deductible'],
            ['Ainda não atingi minha franquia anual.', 'I haven\'t met my deductible yet.', '"Met my deductible" = atingiu a franquia'],
            ['Isso é coberto pelo meu plano?', 'Is this covered by my insurance?', 'Ligue para seu seguro antes de procedimentos eletivos'],
            ['Preciso de autorização prévia?', 'Do I need prior authorization?', '"Prior auth" = aprovação prévia do plano'],
            ['Meu benefício de saúde mental cobre?', 'Does my mental health benefit cover this?', 'A lei exige paridade de saúde mental nos EUA'],
            ['Recebi uma cobrança que não esperava.', 'I got a bill I wasn\'t expecting.', 'Comum — sempre revise o Explanation of Benefits (EOB)'],
            ['Quero contestar essa cobrança.', 'I\'d like to appeal this charge.', '"Appeal" = contestação formal'],
            ['Qual é meu out-of-pocket máximo?', 'What\'s my out-of-pocket maximum?', 'Após esse valor, o plano cobre 100%'],
            ['Posso usar meu HSA?', 'Can I use my HSA for this?', 'HSA = Health Savings Account (conta pré-imposto)'],
          ]}
        />
      </Section>

      <Section title="7. Emergência: chamando 911 e descrevendo a situação" accent={ACCENT}>
        <Callout tone="warn">
          <strong>⚠️ Como funciona o 911:</strong> O despachante fará perguntas. Responda com calma e clareza.
          Sequência: (1) endereço completo, (2) o que está acontecendo, (3) condição da vítima, (4) seu nome e
          telefone. Não desligue antes de o despachante mandar. Se você não fala bem inglês, diga "I need an
          interpreter — Portuguese" e aguarde.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['⚠️ Tenho uma emergência médica.', '⚠️ There\'s a medical emergency.', 'Primeira coisa a dizer'],
            ['⚠️ O endereço é 123 Oak Street.', '⚠️ The address is 123 Oak Street, apartment 4B.', 'Dê o endereço ANTES de tudo mais'],
            ['Ele não está respirando.', '⚠️ He\'s not breathing.', 'Despachante vai iniciar instruções de RCP'],
            ['Ela está inconsciente.', '⚠️ She\'s unconscious and unresponsive.', '"Unresponsive" = não responde a estímulos'],
            ['Ela está sangrando muito.', '⚠️ She\'s bleeding heavily.', 'Informe onde está sangrando'],
            ['Precisamos de intérprete de português.', 'We need a Portuguese interpreter.', 'Disponível 24/7 no 911'],
            ['Não sei RCP.', 'I don\'t know CPR — please guide me.', 'Despachante vai te instruir passo a passo'],
            ['A criança engoliu algo.', '⚠️ A child swallowed something — possibly [substance].', 'Ligue também para Poison Control: 1-800-222-1222'],
            ['É uma reação alérgica grave.', '⚠️ She\'s having a severe allergic reaction / anaphylaxis.', 'Pergunte se tem EpiPen — ep-ih-PEN'],
            ['Manterei a linha aberta.', 'I\'ll stay on the line.', 'Nunca desligue antes do despachante mandar'],
          ]}
        />
      </Section>

      <Section title="8. Hospital: internação, visitas e alta" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Estou sendo internado(a).', 'I\'m being admitted to the hospital.', '"Admitted" = internado(a)'],
            ['Qual é o quarto dele?', 'What room is she/he in?', 'Recepção do hospital informa — "Patient information"'],
            ['Horário de visitas é até quando?', 'What are the visiting hours?', 'Geralmente 8am–8pm, mas varia'],
            ['Quero falar com o médico responsável.', 'I\'d like to speak with the attending physician.', '"Attending" = médico principal do caso'],
            ['⚠️ Quem pode receber informações médicas?', '⚠️ Who is authorized to receive medical information?', 'HIPAA: só pessoas autorizadas pelo paciente'],
            ['Quando ele recebe alta?', 'When is she/he being discharged?', '"Discharged" = dar alta'],
            ['Quais são as instruções de alta?', 'What are the discharge instructions?', 'Peça por escrito — eles são obrigados a dar'],
            ['Preciso de atendimento em casa depois?', 'Will I need home health care after discharge?', 'Seguro pode cobrir — pergunte ao social worker'],
            ['Posso pedir um intérprete?', 'Can I request a medical interpreter?', 'Direito garantido por lei nos EUA'],
            ['Quero contestar a conta do hospital.', 'I\'d like to review and dispute my hospital bill.', 'Até 60% das contas têm erros — sempre revise'],
          ]}
        />
      </Section>

      <Section title="9. Dentista: rotina e emergência" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Gostaria de marcar uma limpeza.', 'I\'d like to schedule a cleaning / routine checkup.', '"Cleaning" = limpeza; "checkup" = revisão'],
            ['Tenho dor de dente desde ontem.', 'I\'ve had a toothache since yesterday.', '"Toothache" = tú-theyk'],
            ['Acho que estou com cárie.', 'I think I have a cavity.', '"Cavity" = cárie — CÆ-vih-tee'],
            ['Estou com sensibilidade no dente.', 'My tooth is sensitive to hot and cold.', 'Informe se é quente, frio ou pressão'],
            ['Preciso de canal?', 'Do I need a root canal?', '"Root canal" = tratamento de canal'],
            ['Quanto custa sem seguro?', 'What\'s the cost without insurance?', 'Dental é frequentemente separado do health plan'],
            ['Meu dente do siso está saindo.', 'My wisdom tooth is coming in.', '"Wisdom tooth" = dente do siso'],
            ['Preciso extrair o dente?', 'Does the tooth need to be extracted?', '"Extracted" = extraído/arrancado'],
            ['Pode anestesiar bem? Tenho medo.', 'Please make sure I\'m fully numb — I\'m nervous about pain.', '"Numb" = anestesiado/dormente'],
            ['Tenho seguro odontológico?', 'Does my plan include dental coverage?', 'Geralmente é plano separado — confirme com HR'],
          ]}
        />
      </Section>

      <Section title="10. Saúde mental: encontrar terapeuta e falar sobre o que você sente" accent={ACCENT}>
        <Callout tone="info">
          <strong>Saúde mental nos EUA:</strong> Buscar terapia é normalizado e até esperado. Ninguém vai te julgar.
          Terapeuta = therapist ou counselor. Psiquiatra (prescribe meds) = psychiatrist. Psicólogo = psychologist.
          A lei Mental Health Parity obriga seguros a cobrir saúde mental como saúde física. Muitas apps (BetterHelp,
          Talkspace) são mais baratas que plano tradicional.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Estou procurando um terapeuta.', 'I\'m looking for a therapist / counselor.', '"Therapist" = thér-uh-pist'],
            ['Você atende pelo meu plano de saúde?', 'Do you accept my insurance?', 'Ou: "Do you offer a sliding scale fee?"'],
            ['Estou passando por ansiedade e estresse.', 'I\'ve been dealing with anxiety and stress.', '"Anxiety" = eng-ZAY-eh-tee'],
            ['Estou me sentindo muito sobrecarregado.', 'I\'ve been feeling really overwhelmed.', '"Overwhelmed" = oh-ver-WELMD'],
            ['Tenho dificuldade para dormir por preocupação.', 'I\'ve been having trouble sleeping due to worry.', 'Sintoma clássico de ansiedade'],
            ['Estou passando por depressão.', 'I\'ve been struggling with depression.', 'Não hesite — médico americano não vai julgar'],
            ['⚠️ Estou tendo pensamentos de me machucar.', '⚠️ I\'ve been having thoughts of hurting myself.', '988 Suicide & Crisis Lifeline — ligue ou mande texto'],
            ['Preciso de medicação?', 'Do I need medication?', 'Psicólogos não prescrevem — psiquiatras sim'],
            ['Como imigrante, tenho dificuldades de adaptação.', 'As an immigrant, I\'m struggling with the cultural transition.', '"Culture shock" e saudade são reais e tratáveis'],
            ['Sessões online funcionam para você?', 'Do you offer online / telehealth sessions?', 'Telehealth expandiu muito pós-COVID'],
          ]}
        />
      </Section>

      <Callout tone="success">
        <strong>Você dominou o inglês médico.</strong> Com essas frases, você consegue navegar o sistema de saúde
        americano — o mais complexo e caro do mundo. Lembre: sempre pergunte sobre copay antes de entrar, confirme
        in-network, e peça instruções por escrito. ⚠️ Em emergências: endereço primeiro, depois situação. Próximo:
        banco e finanças — o segundo maior desafio do imigrante.
      </Callout>
    </div>
  );
}
