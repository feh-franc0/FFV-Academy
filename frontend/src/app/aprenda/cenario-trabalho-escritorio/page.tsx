import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-trabalho-escritorio');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'Em uma reunião, você discorda de uma proposta do seu manager. Como você expressa isso de forma profissional?',
    options: [
      '"That is wrong."',
      '"I see your point, but I have a different perspective — could I share it?"',
      '"I disagree completely."',
      '"No, that will not work."',
    ],
    correct: 1,
    explanation:
      '"I see your point" = reconhece o argumento do outro antes de discordar (crucial na cultura americana). "But I have a different perspective" = introduz sua visão com suavidade. "Could I share it?" = pede permissão (aumenta chance de ser ouvido). Discordância direta sem suavização pode ser vista como rude ou confrontacional em muitos ambientes americanos.',
  },
  {
    question: 'Você precisa pedir ajuda a um colega mas não quer parecer incompetente. Qual frase funciona melhor?',
    options: [
      '"I do not know how to do this."',
      '"Hey, I want to make sure I am doing this right — do you have 5 minutes to walk me through it?"',
      '"Can you do this for me?"',
      '"Help me with this."',
    ],
    correct: 1,
    explanation:
      '"I want to make sure I am doing this right" mostra que você está sendo diligente, não ignorante. "Walk me through it" = me explique passo a passo — expressão profissional comum. "5 minutes" = você está sendo respeitoso com o tempo do colega. Pedir ajuda de forma estruturada é sinal de profissionalismo, não fraqueza.',
  },
  {
    question: 'Seu manager te dá feedback negativo. Qual é a resposta mais profissional?',
    options: [
      '"I disagree with your assessment."',
      '"You are right, I could have done better. I will [ação específica] to improve."',
      '"Okay." (sem dizer nada mais)',
      '"That was not entirely my fault."',
    ],
    correct: 1,
    explanation:
      'A resposta ideal: aceita o feedback (mesmo que discorde internamente), reconhece a oportunidade de melhoria e propõe uma ação concreta. "I will [ação específica]" mostra ownership (responsabilidade). Se você realmente discordar, faça-o em momento separado e com dados — nunca no calor do momento.',
  },
  {
    question: 'Você quer negociar seu salário após uma oferta. Qual é a melhor abertura?',
    options: [
      '"That salary is too low."',
      '"I am really excited about this opportunity. Based on my experience and market research, I was hoping for something closer to [valor]. Is there flexibility there?"',
      '"I need more money."',
      '"Can you offer me more?"',
    ],
    correct: 1,
    explanation:
      'A estrutura vencedora: (1) entusiasmo genuíno pela oportunidade, (2) referência objetiva (market research), (3) número específico, (4) pergunta aberta que convida negociação. "Is there flexibility?" = existe margem? — muito menos agressivo que "I want X". Sempre negocie — 70% das ofertas têm margem.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-trabalho-escritorio"
      title="Cenário: Trabalho e Escritório"
      icon="💼"
      xp={95}
      readTime={38}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="cenario-aeroporto-alfandega"
      nextTitle="Cenário: Aeroporto e Alfândega"
      relatedSlugs={['cenario-aeroporto-alfandega', 'cenario-moradia-vizinhanca', 'ingles-1000-palavras']}
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
        O inglês do trabalho tem suas próprias regras não escritas: como discordar sem ofender, como pedir ajuda
        sem parecer incompetente, como negociar salário, como mandar emails que não soam frios. Este módulo cobre
        100 trocas reais em 10 sub-situações para você navegar o ambiente profissional americano com confiança.
      </p>

      <Section title="1. Entrevista de emprego em inglês" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Fale sobre você.', '"Tell me about yourself."', 'Responda com: passado relevante → conquista → por que essa empresa. 90 segundos.'],
            ['Por que você quer trabalhar aqui?', '"Why do you want to work here?"', 'Pesquise a empresa. Conecte seus valores aos dela. Nunca diga "pelo salário"'],
            ['Qual é seu maior defeito?', '"What is your biggest weakness?"', 'Diga um defeito real + o que você está fazendo para melhorar. Não diga "sou perfeccionista"'],
            ['Onde você se vê em 5 anos?', '"Where do you see yourself in 5 years?"', 'Mostre ambição alinhada com a empresa. "Growing within this company" funciona bem'],
            ['Tem alguma pergunta para nós?', '"Do you have any questions for us?"', 'SEMPRE tenha. "What does success look like in this role in 90 days?" é excelente'],
            ['Qual é sua pretensão salarial?', '"What are your salary expectations?"', '"Based on my research, I am targeting [range]. Is that aligned with your budget?"'],
            ['Pode me contar sobre um desafio que superou?', '"Tell me about a challenge you overcame."', 'Use o framework STAR: Situation, Task, Action, Result'],
            ['Tem experiência com trabalho remoto?', '"Do you have experience working remotely?"', 'Mencione: auto-organização, comunicação assíncrona, ferramentas que usa'],
            ['Qual é sua experiência com [tecnologia]?', '"What is your experience with [technology]?"', 'Seja honesto sobre o nível. "I have intermediate experience and learn fast" é válido'],
            ['Quando pode começar?', '"When are you available to start?"', '"I can be available with [X] weeks notice" ou "I can start as soon as [data]"'],
          ]}
        />
        <Callout tone="info">
          <strong>Framework STAR:</strong> para responder perguntas comportamentais ("Tell me about a time when..."):
          Situation (contexto) → Task (sua responsabilidade) → Action (o que você fez especificamente) →
          Result (resultado mensurável). Pratique 5 histórias STAR antes de qualquer entrevista.
        </Callout>
      </Section>

      <Section title="2. Primeiros dias: apresentações e onboarding" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Olá, sou o novo desenvolvedor.', 'Hi, I am the new developer — I just started today!', 'Seja entusiasmado — primeiras impressões importam'],
            ['Prazer em conhecer vocês.', 'Great to meet everyone!', '"Great to meet you" é mais caloroso que "nice to meet you"'],
            ['Estou ainda me acostumando com tudo.', 'I am still finding my feet around here.', '"Finding my feet" = expressão idiomática para se adaptar'],
            ['Pode me mostrar como funciona o sistema?', 'Could you walk me through how the system works?', '"Walk me through" = explicar passo a passo — expressão essencial'],
            ['Qual é o processo para isso?', 'What is the process for this?', 'Pergunte sobre processo — mostra que você respeita como as coisas são feitas'],
            ['A quem devo reportar isso?', 'Who should I reach out to about this?', '"Reach out to" = contatar, procurar'],
            ['Tem documentação sobre isso?', 'Is there documentation available for this?', 'Procure antes de perguntar — mostra proatividade'],
            ['Posso marcar uma conversa com você essa semana?', 'Could we find time for a quick chat this week?', '"Quick chat" = conversa rápida — sem agenda formal'],
            ['Como prefere se comunicar — Slack ou email?', 'Do you prefer Slack or email for day-to-day communication?', 'Adapte-se ao estilo do colega — isso cria relacionamento'],
            ['Obrigado pela ajuda — isso foi muito útil.', 'Thank you so much — that was really helpful!', 'Gratidão genuína constrói relacionamento rápido'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra dos primeiros 90 dias:</strong> observe mais do que fale. Entenda o contexto antes de
          propor mudanças. Faça boas perguntas. Cumpra o que prometer. Mostre resultados pequenos rapidamente.
          "Listen, learn, then lead" é o mantra americano para novos colaboradores.
        </Callout>
      </Section>

      <Section title="3. Reuniões: participar, discordar, propor ideias" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Posso acrescentar algo?', 'Can I jump in here?', '"Jump in" = participar. Use quando quiser falar sem interromper'],
            ['Para resumir o que foi discutido...', 'Just to summarize what we discussed...', 'Resumir mostra que você ouviu e organiza o pensamento do grupo'],
            ['Concordo com o ponto anterior.', 'I agree with what was said — and I would add...', '"And I would add" = você concorda E traz algo novo'],
            ['Discordo com respeito.', 'I respectfully disagree — here is my thinking.', '"Respectfully disagree" = discordar com respeito. Funciona nos EUA'],
            ['Tenho uma perspectiva diferente.', 'I see it a bit differently.', '"See it differently" = suave e profissional'],
            ['Podemos revisitar esse ponto?', 'Could we circle back to this point?', '"Circle back" = revisitar, voltar a um assunto'],
            ['Tem dados que apoiam isso?', 'Do we have data to support this?', 'Pedir dados é respeitado — mostra rigor analítico'],
            ['Qual é o próximo passo?', 'What are the next steps?', 'SEMPRE pergunte isso antes da reunião terminar'],
            ['Quem é o responsável por isso?', 'Who is the owner of this action item?', '"Owner" = responsável. "Action item" = tarefa a fazer'],
            ['Pode compartilhar os slides depois?', 'Could you share the slides after the meeting?', '"After the meeting" — não espere para pedir. Pergunte na hora'],
          ]}
        />
        <Callout tone="warn">
          <strong>Armadilha cultural:</strong> Nos EUA, falar muito em reunião sem dizer nada de conteúdo
          (chamado de "talking just to talk") é visto negativamente. Mas ficar em silêncio total também é ruim.
          A estratégia: contribua com 1-2 pontos sólidos e bem pensados por reunião. Qualidade sobre quantidade.
        </Callout>
      </Section>

      <Section title="4. Pedir ajuda a colegas sem parecer incompetente" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Você tem 5 minutos?', 'Do you have 5 minutes?', 'Sempre pergunte antes — respeita o tempo do colega'],
            ['Quero garantir que estou fazendo certo.', 'I want to make sure I am doing this correctly.', 'Enquadra o pedido como diligência, não ignorância'],
            ['Pode me explicar passo a passo?', 'Could you walk me through this step by step?', '"Step by step" = passo a passo'],
            ['Tentei [X] mas não funcionou.', 'I tried [X] but it did not work — do you know why?', 'Mostrar que você tentou antes de perguntar é muito respeitado'],
            ['Encontrei a documentação mas não ficou claro.', 'I found the documentation but this part is not clear to me.', 'Referência à documentação mostra que você pesquisou'],
            ['Quem seria a melhor pessoa para me ajudar com isso?', 'Who would be the best person to ask about this?', 'Se não sabe a quem perguntar, pergunte ao mais próximo quem sabe'],
            ['Não quero tomar muito do seu tempo.', 'I do not want to take too much of your time.', '"Take your time" = usar seu tempo. Bom para demonstrar consideração'],
            ['Pode me recomendar um recurso?', 'Do you know of any good resources for this?', 'Pedir recursos em vez de explicação pode ser menos invasivo'],
            ['Posso te mandar uma mensagem se surgir mais dúvidas?', 'Would it be okay to follow up if I have more questions?', '"Follow up" = dar continuidade, fazer acompanhamento'],
            ['Obrigado — isso me ajudou muito.', 'Thank you — this really helped me a lot!', 'Feedback de que ajudou motiva o colega a ajudar de novo'],
          ]}
        />
      </Section>

      <Section title="5. Feedback do manager: receber e dar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Obrigado pelo feedback.', 'Thank you for the feedback.', 'Sempre a primeira resposta — mesmo que doa'],
            ['Entendo. Pode dar um exemplo específico?', 'I understand. Could you give me a specific example?', 'Pedir exemplo concreto = você leva a sério e quer entender'],
            ['O que você sugere que eu melhore?', 'What would you suggest I do differently?', '"Differently" = diferente. Questão construtiva'],
            ['Vou trabalhar especificamente em [ponto].', 'I will specifically work on [point] going forward.', '"Going forward" = daqui para frente — frase profissional muito usada'],
            ['Posso checar com você daqui a 2 semanas?', 'Can I check back with you in 2 weeks to see how I am improving?', 'Proatividade no follow-up de feedback impressiona managers'],
            ['Tenho feedback para compartilhar com você.', 'I have some feedback I would like to share — is this a good time?', 'SEMPRE peça permissão antes de dar feedback ao manager'],
            ['Observei que [situação] e queria mencionar.', 'I noticed [situation] and wanted to bring it to your attention.', '"Bring to your attention" = trazer ao conhecimento — formal e profissional'],
            ['Meu objetivo é [resultado], então estou propondo [solução].', 'My goal is [result], so I am proposing [solution].', 'Apresente solução junto com o problema — nunca só o problema'],
            ['Posso estar enganado — qual é sua leitura?', 'I could be wrong — what is your read on this?', '"Read on this" = como você vê isso? Humildade profissional'],
            ['Fico feliz em ajustar conforme necessário.', 'I am happy to adjust as needed.', '"As needed" = conforme necessário — flexibilidade valorizada'],
          ]}
        />
      </Section>

      <Section title="6. Slack/Email profissional — tom e vocabulário" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Espero que esteja bem.', 'Hope you are doing well.', 'Abertura padrão de email americano — opcional mas educado'],
            ['Escrevendo para perguntar sobre...', 'I am reaching out regarding...', '"Reaching out" = entrando em contato. "Regarding" = a respeito de'],
            ['Por gentileza, confirme o recebimento.', 'Please confirm receipt.', '"Confirm receipt" = confirmar que recebeu — email formal'],
            ['Conforme nossa conversa anterior...', 'As discussed, I wanted to follow up on...', '"As discussed" = conforme discutimos. "Follow up" = acompanhar'],
            ['Peço desculpas pela demora na resposta.', 'Apologies for the delayed response.', '"Delayed response" = resposta demorada. Simples e profissional'],
            ['Fico à disposição para qualquer dúvida.', 'Please feel free to reach out if you have any questions.', '"Feel free to reach out" = frase padrão de fechamento'],
            ['Atenciosamente.', 'Best regards, / Best, / Thanks,', '"Best" é o mais comum hoje. "Thanks" para emails mais informais'],
            ['Preciso disso urgente.', 'I need this ASAP — please prioritize.', '"ASAP" = As Soon As Possible. Seja específico: "by EOD" = by end of day'],
            ['Coloco você em cópia.', 'I will CC you on this.', '"CC" = "síi síi" — cópia. "BCC" = cópia oculta'],
            ['Poderia revisar até sexta?', 'Could you review this by Friday EOD?', '"EOD" = end of day. "EOM" = end of month. Sempre dê deadline'],
          ]}
        />
        <Callout tone="info">
          <strong>Tom de Slack nos EUA:</strong> Slack é mais informal que email mas ainda profissional.
          Emojis são aceitos (🙌✅👍). GIFs com moderação. Respostas curtas como "Got it!" ou "On it!" são
          normais. Escrever parágrafos longos no Slack é incomum — use email para assuntos complexos.
        </Callout>
      </Section>

      <Section title="7. Work from home: comunicação assíncrona" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Estou disponível hoje das 9h às 17h.', 'I am available today from 9 AM to 5 PM ET.', 'Sempre especifique o fuso horário — "ET", "PT", "CT"'],
            ['Estou em reunião até as 14h.', 'I am in meetings until 2 PM — will respond after.', 'Status do Slack: atualizar é sinal de profissionalismo'],
            ['Vou verificar minha mensagem assim que puder.', 'I will get back to you as soon as I can.', '"Get back to you" = responder, retornar'],
            ['Pode me mandar um resumo por escrito?', 'Could you send a written summary?', 'Útil quando o contexto oral foi complexo'],
            ['Estou offline essa tarde.', 'I am offline this afternoon — available tomorrow morning.', 'Avise com antecedência sempre que possível'],
            ['Prefere reunião ou async?', 'Do you prefer to sync up or handle this async?', '"Async" = assíncrono. "Sync up" = reunião rápida para alinhar'],
            ['Vou documentar isso no Confluence/Notion.', 'I will document this in [tool] so the team has reference.', 'Documentar para o time = boa prática valorizada'],
            ['Pode gravar a reunião para quem não pôde participar?', 'Could you record the meeting for those who cannot attend?', '"Record the meeting" — Zoom e Google Meet gravam facilmente'],
            ['Minha conexão está instável.', 'My connection is unstable — I may drop off.', '"Drop off" = cair da reunião. "I dropped" = caí da chamada'],
            ['Pode repetir? Não ouvi bem.', 'Could you repeat that? My audio cut out.', '"Audio cut out" = o áudio cortou — justificativa técnica válida'],
          ]}
        />
      </Section>

      <Section title="8. Networking no trabalho (almoço, happy hour)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Você vai ao happy hour hoje?', 'Are you heading to happy hour tonight?', '"Happy hour" = "héppi áuor" — horário de drinks com preço reduzido, geralmente 16h-19h'],
            ['Trabalha no mesmo andar que eu.', 'We are actually on the same floor!', 'Ponto de conexão — use como abertura de conversa'],
            ['Em que projeto você está trabalhando?', 'What project are you working on right now?', 'Pergunta aberta profissional — mostra interesse genuíno'],
            ['Sou do Brasil — vim há 6 meses.', 'I am from Brazil — I moved here about 6 months ago.', 'Sua história pessoal é interessante — compartilhe sem exagero'],
            ['Podemos nos conectar no LinkedIn?', 'Can we connect on LinkedIn?', 'Diga isso ao final da conversa — não no início'],
            ['Qual é o maior desafio do seu time agora?', 'What is the biggest challenge your team is facing?', 'Pergunta profunda que cria conversa real — use com moderação'],
            ['Você já trabalhou aqui há muito tempo?', 'How long have you been at the company?', '"Been at the company" = está na empresa há quanto tempo'],
            ['Tem alguma dica para quem está começando?', 'Do you have any tips for someone who just started?', 'Pedir conselho é um ato de conexão poderoso'],
            ['Posso te convidar para um café essa semana?', 'Would you be open to grabbing coffee sometime this week?', '"Grabbing coffee" = tomar um café informalmente — muito comum nos EUA'],
            ['Foi ótimo te conhecer melhor.', 'Really great getting to know you better!', '"Getting to know you better" = conhecer melhor. Use ao se despedir'],
          ]}
        />
        <Callout tone="info">
          <strong>Networking americano vs. brasileiro:</strong> Nos EUA, networking é mais formal e estruturado.
          "Coffee chats" (conversas de café) são comuns — você agenda 20-30 min com alguém de outra área para
          aprender sobre o trabalho dela. Não é constrangedor pedir — é esperado e apreciado.
        </Callout>
      </Section>

      <Section title="9. Negociar salário e benefícios" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Estou muito animado com essa oportunidade.', 'I am really excited about this opportunity.', 'Sempre comece com entusiasmo — reduz a tensão da negociação'],
            ['Baseado na minha pesquisa de mercado...', 'Based on my research and experience...', 'Referência objetiva = mais credibilidade que preferência pessoal'],
            ['Estava esperando algo mais próximo de [valor].', 'I was hoping for something closer to [value].', '"Hoping for" = esperando. Suave mas claro'],
            ['Tem flexibilidade nesse número?', 'Is there any flexibility on the salary?', '"Flexibility" = "flékssibiliti" — margem de negociação'],
            ['Posso ter o PTO explicado?', 'Could you explain the PTO policy?', 'PTO = Paid Time Off = férias remuneradas. Negocie isso também'],
            ['O plano de saúde cobre dependentes?', 'Does the health plan cover dependents?', '"Dependents" = dependentes (cônjuge, filhos)'],
            ['Tem bônus anual?', 'Is there an annual bonus?', 'Pergunte sobre: bonus, RSUs (ações), 401k match'],
            ['Tem opção de trabalho remoto?', 'Is there a remote work option?', '"Remote" = home office. "Hybrid" = misturado'],
            ['Posso pensar e responder amanhã?', 'Can I have until tomorrow to think it over?', '"Think it over" = pensar com calma. Sempre ok para ofertas'],
            ['Estou animado e aceito a oferta.', 'I am excited to accept the offer!', 'Seja claro e entusiasmado ao aceitar — define o tom da relação'],
          ]}
        />
        <Callout tone="warn">
          <strong>⚠️ Negocie sempre:</strong> estudos mostram que 70% das ofertas têm margem para negociação.
          Não negociar deixa USD 5.000-10.000 na mesa em média. A empresa nunca vai retirar uma oferta porque
          você pediu mais — pior caso, dizem "esse é o nosso limite" e você aceita ou recusa.
        </Callout>
      </Section>

      <Section title="10. Situações difíceis: mal-entendido cultural, reclamar de algo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['🇧🇷 Português', '🇺🇸 Inglês', '💡 Dica / Pronúncia']}
          rows={[
            ['Acho que houve um mal-entendido.', 'I think there may have been a misunderstanding.', '"May have been" = linguagem suave que não culpa ninguém'],
            ['Não era minha intenção dizer isso.', 'That was not what I intended — let me clarify.', '"Clarify" = esclarecer. Ótimo para situações tensas'],
            ['Percebi que as coisas são feitas diferente aqui.', 'I am learning that things are done differently here.', 'Reconhecer diferença cultural sem criar conflito'],
            ['Pode me ajudar a entender como funciona aqui?', 'Could you help me understand the expectations here?', '"Expectations" = expectativas — palavra-chave no trabalho americano'],
            ['Me sinto desconfortável com essa situação.', 'I am not comfortable with this situation.', 'Assertividade clara mas respeitosa'],
            ['Gostaria de conversar com o RH sobre isso.', 'I would like to speak with HR about this.', '⚠️ HR = Human Resources. Use quando a situação for séria'],
            ['Aconteceu algo que me incomodou e quero mencionar.', 'Something happened that I want to bring to your attention.', '"Bring to your attention" = trazer ao conhecimento formalmente'],
            ['Não me sinto incluído nas decisões.', 'I feel left out of the decision-making process.', '"Left out" = excluído. Sentimento válido de comunicar'],
            ['Quero registrar isso formalmente.', 'I would like to document this formally.', 'Documentação protege você — sempre válido solicitar'],
            ['Posso ter um mediador na conversa?', 'Could we have a mediator present for this conversation?', 'HR ou manager neutro como mediador é prática comum nos EUA'],
          ]}
        />
        <Callout tone="info">
          <strong>Choque cultural brasileiro x americano no trabalho:</strong> brasileiros tendem a ser mais
          diretos em críticas pessoais e menos diretos em críticas profissionais. Americanos são o oposto: muito
          indiretos pessoalmente, mas esperam clareza profissional. "I have a concern" = tenho uma preocupação —
          essa frase abre portas que ficar em silêncio fecha.
        </Callout>
      </Section>
    </div>
  );
}
