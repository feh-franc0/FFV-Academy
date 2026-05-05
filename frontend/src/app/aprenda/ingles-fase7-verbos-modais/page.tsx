import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ingles-fase7-verbos-modais');

const ACCENT = '#22d3ee';

const quiz: QuizQuestion[] = [
  {
    question: 'Como fazer um pedido de forma educada/formal em inglês?',
    options: [
      'Can you help me? (informal)',
      'Could you help me? (educado/formal)',
      'You help me? (sem auxiliar)',
      'Do you help me? (errado)',
    ],
    correct: 1,
    explanation:
      '"Could you + infinitivo" é a forma mais educada e versátil para fazer pedidos. "Can you" também está correto, mas é mais informal. "Could you help me?" soa mais polido e profissional em qualquer contexto.',
  },
  {
    question: '"You ___ smoke here." — como expressar proibição forte?',
    options: [
      "don't have to",
      "mustn't",
      "shouldn't",
      "couldn't",
    ],
    correct: 1,
    explanation:
      '"Mustn\'t" (must not) expressa proibição forte — é absolutamente proibido. "You mustn\'t smoke here." vs "You don\'t have to come" (não é obrigação, mas pode se quiser). Esta é uma das distinções mais importantes: mustn\'t = proibição; don\'t have to = ausência de obrigação.',
  },
  {
    question: '"You ___ come if you don\'t want to." — como expressar ausência de obrigação?',
    options: [
      "mustn't come",
      "don't have to come",
      "shouldn't come",
      "can't come",
    ],
    correct: 1,
    explanation:
      '"Don\'t have to" significa que não é necessário, não é obrigação — mas você pode ir se quiser. ❌ "mustn\'t come" significa que é proibido vir — completamente diferente! "You don\'t have to come" = pode não vir, tudo bem.',
  },
  {
    question: 'Qual é a diferença entre "must" e "have to"?',
    options: [
      'São sinônimos sem diferença',
      'Must = obrigação interna/do falante; have to = obrigação externa/regra de terceiros',
      'Must é mais formal; have to é informal',
      'Must é para o presente; have to para o futuro',
    ],
    correct: 1,
    explanation:
      '"Must" vem de dentro: você mesmo sente que é necessário ("I must call my mother" — sinto que preciso). "Have to" vem de fora: regra, lei, exigência externa ("I have to wear a uniform at work" — meu patrão exige). Na prática cotidiana, muitos falantes usam ambos de forma intercambiável, mas a distinção existe.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ingles-fase7-verbos-modais"
      title="Fase 7 — Verbos modais: can, should, must e mais"
      icon="🎛️"
      xp={55}
      readTime={15}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="ingles-1000-palavras"
      nextTitle="1000 palavras mais usadas do inglês"
      relatedSlugs={['ingles-fase6-preposicoes', 'ingles-1000-palavras', 'ingles-fase3-passado']}
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
        <strong>Verbos modais</strong> são auxiliares que expressam habilidade, permissão, obrigação, conselho e
        possibilidade. São dos verbos mais usados em inglês — e têm regras próprias que diferem dos outros verbos.
        Dominar os modais faz a diferença entre um inglês travado e um inglês natural.
      </p>

      <Section title="Regras gerais dos verbos modais" accent={ACCENT}>
        <Callout tone="info">
          <strong>3 regras universais dos modais:</strong>
          <br />
          1. Modal + <strong>infinitivo sem "to"</strong>: can go, should eat, must work (nunca "can to go")
          <br />
          2. <strong>Nunca flexionam</strong>: sem -s na 3ª pessoa: "she can" (nunca "she cans")
          <br />
          3. <strong>Nunca com do/does</strong> nas perguntas: "Can you?" (nunca "Do you can?")
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modal', 'Negativa', 'Pergunta', 'Exemplo']}
          rows={[
            ['can', "can't / cannot", 'Can you...?', 'Can you swim?'],
            ['could', "couldn't", 'Could you...?', 'Could you help me?'],
            ['should', "shouldn't", 'Should I...?', 'Should I go?'],
            ['must', "mustn't", 'Must I...? (raro)', 'You must be here at 8.'],
            ['will', "won't", 'Will you...?', "Will you come?"],
            ['would', "wouldn't", 'Would you...?', 'Would you like some water?'],
            ['may', "may not", 'May I...?', 'May I leave early?'],
            ['might', "might not", 'Might I...? (muito formal)', 'It might rain.'],
          ]}
        />
      </Section>

      <Section title="Can / Could: habilidade, permissão e pedidos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modal', 'Uso', 'Nível', 'Exemplo', 'Tradução']}
          rows={[
            ['CAN', 'Habilidade presente', 'Neutro', 'I can speak three languages.', 'Falo três idiomas.'],
            ['CAN', 'Permissão informal', 'Informal', 'Can I sit here?', 'Posso sentar aqui?'],
            ['CAN', 'Possibilidade geral', 'Neutro', 'It can get very cold here.', 'Pode ficar muito frio aqui.'],
            ["CAN'T", 'Impossibilidade / certeza negativa', 'Neutro', "That can't be true.", 'Isso não pode ser verdade.'],
            ['COULD', 'Habilidade no passado', 'Neutro', 'I could run fast as a kid.', 'Eu corria rápido quando era criança.'],
            ['COULD', 'Pedido formal/polido', 'Educado', 'Could you open the window?', 'Você poderia abrir a janela?'],
            ['COULD', 'Possibilidade (condicional)', 'Neutro', 'You could try a different approach.', 'Você poderia tentar uma abordagem diferente.'],
            ["COULDN'T", 'Impossibilidade passada', 'Neutro', "I couldn't sleep last night.", 'Não consegui dormir ontem à noite.'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ["Can you help me with this?", 'Você pode me ajudar com isso?'],
            ["I can't find my keys.", 'Não consigo achar minhas chaves.'],
            ["She can play the piano very well.", 'Ela toca piano muito bem.'],
            ["Could you speak more slowly, please?", 'Você poderia falar mais devagar, por favor?'],
            ["Could I borrow your pen?", 'Eu poderia pegar emprestado sua caneta?'],
            ["When I was young, I could run for miles.", 'Quando era jovem, eu corria quilômetros.'],
          ]}
        />
      </Section>

      <Section title="Should / Ought to: conselho e recomendação" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modal', 'Uso', 'Exemplo', 'Tradução']}
          rows={[
            ['SHOULD', 'Conselho / recomendação', 'You should see a doctor.', 'Você deveria ver um médico.'],
            ['SHOULD', 'Obrigação moral fraca', 'We should help each other.', 'Devemos nos ajudar.'],
            ['SHOULD', 'Expectativa', "The package should arrive tomorrow.", 'O pacote deve chegar amanhã.'],
            ["SHOULDN'T", 'Desaconselhamento', "You shouldn't smoke.", 'Você não deveria fumar.'],
            ['OUGHT TO', 'Similar ao should (mais formal)', 'You ought to apologize.', 'Você deveria se desculpar.'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Contexto', 'Inglês', 'Tradução']}
          rows={[
            ['Saúde', 'You should drink more water.', 'Você deveria beber mais água.'],
            ['Saúde', "You shouldn't eat so much junk food.", 'Você não deveria comer tanto fast food.'],
            ['Trabalho', 'You should update your CV.', 'Você deveria atualizar seu currículo.'],
            ['Trabalho', "She shouldn't miss that meeting.", 'Ela não deveria faltar àquela reunião.'],
            ['Relacionamento', 'You should apologize.', 'Você deveria se desculpar.'],
            ['Relacionamento', "He shouldn't say things like that.", 'Ele não deveria dizer coisas assim.'],
            ['Estudo', 'You should practice every day.', 'Você deveria praticar todo dia.'],
            ['Estudo', "You shouldn't give up so easily.", 'Você não deveria desistir tão facilmente.'],
            ['Viagem', 'You should visit Floripa.', 'Você deveria visitar Florianópolis.'],
            ['Geral', "I should have called earlier. (arrependimento)", 'Eu deveria ter ligado antes.'],
            ['Geral', 'You ought to be more careful.', 'Você deveria ser mais cuidadoso.'],
            ['Geral', "He shouldn't worry so much.", 'Ele não deveria se preocupar tanto.'],
          ]}
        />
      </Section>

      <Section title="Must / Have to: obrigação" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modal', 'Tipo de obrigação', 'Exemplo', 'Tradução']}
          rows={[
            ['MUST', 'Obrigação interna (do falante)', 'I must call my mother today.', 'Preciso ligar para minha mãe hoje.'],
            ['MUST', 'Regra do falante', 'You must wear a seatbelt.', 'Você deve usar o cinto.'],
            ['MUST', 'Dedução lógica forte', 'She must be tired.', 'Ela deve estar cansada (tenho certeza).'],
            ['HAVE TO', 'Obrigação externa (regra de terceiros)', 'I have to work on Saturdays.', 'Tenho que trabalhar nos sábados.'],
            ['HAVE TO', 'Necessidade circunstancial', "We have to leave now or we'll be late.", 'Temos que sair agora ou vamos nos atrasar.'],
            ["MUSTN'T", 'Proibição forte', "You mustn't park here.", 'Você não pode estacionar aqui.'],
            ["DON'T HAVE TO", 'Ausência de obrigação (não é proibição!)', "You don't have to come.", 'Você não precisa vir (mas pode se quiser).'],
          ]}
        />
        <Callout tone="warn">
          <strong>A confusão mais perigosa:</strong> MUSTN'T ≠ DON'T HAVE TO
          <br />
          <br />
          "You mustn't tell anyone" = É proibido contar para qualquer pessoa.
          <br />
          "You don't have to tell anyone" = Não é necessário contar, mas pode se quiser.
          <br />
          <br />
          Em uma situação de segredo médico: "You don't have to tell your employer" (não é obrigação). Em uma situação
          de sigilo: "You mustn't tell anyone" (é proibido).
        </Callout>
      </Section>

      <Section title="Will / Would: futuro, condicional e pedidos polidos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modal', 'Uso', 'Exemplo', 'Tradução']}
          rows={[
            ['WILL', 'Futuro e decisão espontânea (revisão)', "I'll be there at 8.", 'Estarei lá às 8.'],
            ['WOULD', 'Condicional (se...)', 'I would travel if I had money.', 'Viajaria se tivesse dinheiro.'],
            ['WOULD', 'Pedido muito educado', 'Would you mind closing the door?', 'Você se importaria em fechar a porta?'],
            ['WOULD LIKE', 'Querer (mais educado que want)', "I'd like a glass of water.", 'Eu gostaria de um copo de água.'],
            ['WOULD', 'Hábito passado (costumava)', 'When I was a kid, I would play outside.', 'Quando criança, eu costumava brincar lá fora.'],
            ["WOULDN'T", 'Recusa no condicional / passado', "She wouldn't listen.", 'Ela não quis ouvir.'],
          ]}
        />
        <Callout tone="info">
          <strong>Would like vs Want:</strong> ambos expressam desejo, mas "would like" é muito mais educado. Em
          restaurantes, lojas e situações formais, sempre prefira "I'd like..." a "I want...". "I want the steak"
          soa direto/abrupto; "I'd like the steak, please" soa educado e natural.
        </Callout>
      </Section>

      <Section title="May / Might: possibilidade e permissão formal" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modal', 'Uso', 'Grau', 'Exemplo', 'Tradução']}
          rows={[
            ['MAY', 'Possibilidade (mais provável)', '~50%+', 'It may rain this afternoon.', 'Pode chover esta tarde.'],
            ['MAY', 'Permissão formal', 'Formal', 'May I leave early today?', 'Posso sair mais cedo hoje?'],
            ['MIGHT', 'Possibilidade (menos provável)', '~30-40%', 'I might go to the party.', 'Talvez eu vá à festa.'],
            ['MIGHT', 'Sugestão tentativa', 'Cauteloso', 'You might want to reconsider.', 'Talvez você queira reconsiderar.'],
            ['MAY NOT', 'Possibilidade negativa', 'Neutro', 'She may not come.', 'Ela pode não vir.'],
            ['MIGHT NOT', 'Possibilidade negativa (menor)', 'Neutro', 'He might not know.', 'Ele pode não saber.'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução', 'Modal']}
          rows={[
            ["It may rain tomorrow.", 'Pode chover amanhã.', 'May (razoavelmente provável)'],
            ["It might rain, but I doubt it.", 'Pode chover, mas duvido.', 'Might (menos provável)'],
            ["She may be at home.", 'Ela pode estar em casa.', 'May'],
            ["He might have forgotten.", 'Ele pode ter esquecido.', 'Might'],
            ["May I use your bathroom?", 'Posso usar seu banheiro?', 'May (permissão formal)'],
            ["This might not work.", 'Isso pode não funcionar.', 'Might'],
            ["We may need more time.", 'Pode ser que precisemos de mais tempo.', 'May'],
            ["I might visit my grandparents.", 'Talvez eu visite meus avós.', 'Might'],
            ["May I come in?", 'Posso entrar?', 'May (formal)'],
            ["She might change her mind.", 'Ela pode mudar de ideia.', 'Might'],
            ["The results may surprise you.", 'Os resultados podem te surpreender.', 'May'],
            ["He might not agree with that.", 'Ele pode não concordar com isso.', 'Might'],
          ]}
        />
      </Section>

      <Section title="Quadro geral dos verbos modais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modal', 'Uso principal', 'Negativa', 'Exemplo prático']}
          rows={[
            ['can', 'Habilidade presente / permissão informal', "can't", "I can help you. / Can I go?"],
            ['could', 'Habilidade passada / pedido polido / possibilidade', "couldn't", "Could you repeat? / I couldn't sleep."],
            ['should', 'Conselho / recomendação', "shouldn't", "You should rest."],
            ['ought to', 'Conselho (formal)', 'ought not to', "You ought to apologize."],
            ['must', 'Obrigação interna / proibição (mustn\'t)', "mustn't", "You must be here. / You mustn't touch that."],
            ['have to', 'Obrigação externa / necessidade', "don't/doesn't have to", "I have to work today."],
            ['will', 'Futuro / decisão espontânea / promessa', "won't", "I'll do it. / She won't come."],
            ['would', 'Condicional / pedido educado / hábito passado', "wouldn't", "I'd like tea. / Would you help?"],
            ['may', 'Possibilidade (~50%) / permissão formal', 'may not', "It may rain. / May I go?"],
            ['might', 'Possibilidade (~30%) / sugestão', 'might not', "I might go. / It might not work."],
          ]}
        />
      </Section>

      <Callout tone="success">
        <strong>Resumo da Fase 7.</strong> Modais seguem 3 regras: modal + infinitivo sem "to", sem -s na 3ª pessoa,
        sem do/does nas perguntas. CAN: habilidade e permissão informal. COULD: passado ou pedido polido.
        SHOULD: conselho. MUST: obrigação interna. HAVE TO: obrigação externa. MUSTN'T: proibição forte. DON'T HAVE
        TO: ausência de obrigação (completamente diferente de mustn't!). WOULD: condicional e pedidos educados
        (would like = querer de forma polida). MAY/MIGHT: possibilidade (may = mais provável, might = menos
        provável). Próximo: as 1000 palavras mais usadas do inglês — o vocabulário que cobre 65% do inglês falado.
      </Callout>
    </div>
  );
}
