import type { Module } from '../types';

// Módulos 5-8 — Trilha "Neuromarketing — Como o cérebro decide comprar"
// Hubs 3 (Persuasão & Vieses) e 4 (Aplicação Prática).

// ────────────────────────────────────────────────────────────────────────
// MOD 5 — Heurísticas e Vieses no Marketing
// ────────────────────────────────────────────────────────────────────────
export const MOD_5_HEURISTICAS: Module = {
  slug: 'heuristicas-vieses-marketing',
  num: 5,
  icon: '🎯',
  title: 'Heurísticas e Vieses — atalhos mentais que vendem',
  summary:
    'O Sistema 1 usa atalhos pra decidir rápido. Esses atalhos são heurísticas — quando funcionam, ótimo. Quando falham sistematicamente, viram vieses cognitivos. Marketing aprendeu a tocar nesses vieses como cordas de violão. Veja os 8 mais usados, como detectar e como aplicar com ética.',
  estimatedMin: 22,
  keyTerms: [
    { term: 'Heurística',                definition: 'Regra mental de atalho que reduz tempo/esforço de decisão. Quando funciona em média, é útil. Quando produz erro sistemático em contexto específico, vira viés.' },
    { term: 'Ancoragem',                 definition: 'Tendência de usar o PRIMEIRO número/informação recebido como referência pra julgamentos posteriores, mesmo quando irrelevante. Ex: ver preço "de R$ 599 por R$ 299" muda percepção de valor.' },
    { term: 'Escassez',                  definition: 'Princípio descoberto por Robert Cialdini: quanto mais raro/limitado um item parece, mais valor o cérebro atribui. Ativa medo de perda (amígdala).' },
    { term: 'Prova Social',              definition: 'Tendência de copiar o comportamento da maioria, especialmente em incerteza. "Mais de 1 milhão de clientes confiam" é mais convincente que qualquer descrição técnica.' },
    { term: 'Autoridade',                definition: 'Influência desproporcional de figuras percebidas como especialistas (jaleco branco, título acadêmico, uniforme). Experimento de Milgram (1961) mostrou os limites disso.' },
    { term: 'Reciprocidade',             definition: 'Princípio de devolução: ao receber um favor (sample grátis, conteúdo de valor, brinde), o cérebro sente OBRIGAÇÃO de retribuir. Base do "isca digital".' },
    { term: 'Compromisso e Coerência',   definition: 'Tendência de manter coerência com decisões anteriores. Quem disse "sim" a algo pequeno (cadastro) tem maior chance de dizer sim ao próximo passo (compra). Foot-in-the-door.' },
    { term: 'Aversão à Perda',           definition: 'Já vista no módulo 2: a dor de perder R$ 100 é ~2x maior que o prazer de ganhar R$ 100. Base de scarcity, deadlines e ofertas "por tempo limitado".' },
    { term: 'Efeito Manada',             definition: 'Versão de prova social: tendência de seguir o que muitos fazem, mesmo sem evidência objetiva. Restaurante cheio parece melhor que vazio.' },
    { term: 'Viés de Confirmação',       definition: 'Tendência de buscar/lembrar informação que CONFIRMA crenças prévias e ignorar a que contraria. Por isso fan boy de Apple não troca por Android, e vice-versa.' },
    { term: 'Viés de Disponibilidade',   definition: 'Julgar probabilidade pela facilidade com que exemplos vêm à mente. Acidente de avião na TV faz você superestimar risco aéreo.' },
    { term: 'Endowment Effect',          definition: 'Pessoas valorizam mais o que JÁ POSSUEM. Trial grátis funciona porque uma vez usando, o usuário sente "perda" ao desinstalar.' },
    { term: 'Robert Cialdini',           definition: 'Psicólogo americano. Sistematizou em 1984 (livro Influence) os 6 princípios universais de persuasão. Bíblia operacional de marketing há 40 anos.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Em 1984, o psicólogo americano Robert Cialdini publicou Influence — livro que se tornou a bíblia operacional de marketing. Após anos infiltrando-se em times de vendedores, vendedores de carros, recrutadores de seitas e telemarketing, Cialdini destilou 6 princípios universais de persuasão que ATIVAM heurísticas profundas do cérebro humano. Décadas depois, neurociência confirmou os mecanismos: cada um desses gatilhos ativa estruturas específicas (amígdala, núcleo accumbens, córtex pré-frontal). Este módulo apresenta os 8 vieses mais usados em marketing, com base em Cialdini + Kahneman, e mostra como detectar e aplicar com ética.',
    },
    {
      kind: 'concept',
      title: '1. Ancoragem — o primeiro número manda',
      body:
        'Tversky & Kahneman (1974) demonstraram: o cérebro usa o PRIMEIRO número apresentado como referência mental, mesmo se for irrelevante. Experimento clássico: giraram uma roleta com números aleatórios na frente de participantes, depois perguntaram "qual % de países africanos são membros da ONU?". Quem viu o número alto na roleta deu respostas maiores. Aplicação em pricing: mostrar primeiro o preço "cheio" (R$ 599) antes do "promocional" (R$ 299) faz o S1 ancorar no 599 e perceber 299 como super desconto — mesmo se o valor justo for R$ 250.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Por que tabelas de planos sempre têm 3 colunas',
      body:
        'Padrão clássico: Básico R$ 39 / Pro R$ 89 / Premium R$ 199. O Premium não é desenhado pra vender — é desenhado pra ANCORAR. O cérebro compara o Pro com o Premium e vê "metade do preço". Sem o Premium, o Pro pareceria caro perto do Básico. Esse padrão de "decoy effect" (Dan Ariely, 2008) aumenta vendas do plano-meio em 30-50% em testes A/B controlados.',
    },
    {
      kind: 'concept',
      title: '2. Escassez — o que some, vale mais',
      body:
        'Cérebro reptiliano interpreta escassez como sinal de valor. "Últimas 3 unidades", "Promoção termina em 2h", "Estoque limitado" — todos ativam a amígdala (medo de perda) e o sistema de dopamina antecipada (recompensa eminente). Estudos com fMRI mostram que itens marcados como escassos ATIVAM regiões diferentes (mais emocionais) do que itens abundantes. Aplicação: e-commerce que mostra "12 pessoas estão vendo este item agora" e "só 2 em estoque" não está mentindo (geralmente) — está usando escassez real pra ativar gatilho biológico.',
    },
    {
      kind: 'concept',
      title: '3. Prova Social — o que muitos fazem deve estar certo',
      body:
        'Em situação de incerteza (não sei se esse restaurante presta), o cérebro busca atalho via observação do grupo. Restaurante cheio parece melhor. Filme bem avaliado parece mais interessante. Curso com 12 mil alunos parece mais sério. Mecanismo neural: regiões de processamento social (córtex pré-frontal medial, junção temporoparietal) interpretam comportamento alheio como informação confiável — herança evolutiva (no grupo está a segurança). Aplicação: depoimentos, número de clientes, reviews, "X pessoas compraram nas últimas 24h" são munição direta pra esse viés.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — o cardápio do restaurante',
      body:
        'Você está num restaurante novo, não conhece nada do menu. Como decide? Olha o cardápio: tem pratos descritos com mais detalhe + selo "favorito da casa" + descrição "feito com ingredientes orgânicos do produtor X". São TODAS heurísticas ativadas. (1) Ancoragem: o prato mais caro do menu (R$ 89) faz você ver o prato de R$ 49 como "razoável". (2) Prova social: "favorito da casa" e "mais pedido". (3) Autoridade: nome do chef ou prêmios. (4) Escassez: "edição especial do mês". Em 60 segundos, você decide entre 30 opções usando 4 atalhos cognitivos — sem analisar nenhum prato profundamente. Cardápio bem desenhado vende pratos específicos com 30-40% mais frequência.',
      metadata: 'Cardápio = laboratório de heurísticas aplicadas',
    },
    {
      kind: 'concept',
      title: '4. Autoridade — o jaleco vende',
      body:
        'O experimento mais perturbador da psicologia é o de Stanley Milgram (1961): voluntários comuns aplicaram choques que eles acreditavam ser MORTAIS em outra pessoa SÓ porque um pesquisador de jaleco branco mandou. 65% chegaram à voltagem máxima. Lição: humanos têm tendência DESPROPORCIONAL a obedecer figuras de autoridade percebida — uniforme, título, cenário (laboratório). Em marketing: dentista recomendando creme dental, médico recomendando suplemento, "9 entre 10 especialistas concordam". Funciona — mesmo quando a autoridade é só vestimenta ou contexto, não competência real.',
    },
    {
      kind: 'concept',
      title: '5. Reciprocidade — receba e sentirá obrigação',
      body:
        'Cialdini documentou: pessoas que recebem QUALQUER COISA (mesmo simbólico, como uma flor de Hare Krishna num aeroporto) sentem obrigação de retribuir. É reflexo profundo, conservado em todas as culturas — base evolutiva de cooperação social. Em marketing digital: o "isca digital" (ebook grátis, mini-curso, calculadora gratuita) explora reciprocidade. Você recebe valor real, sente obrigação latente de retribuir. Quando vier o pitch de venda do produto pago, a resistência cai 40-60% (testado em funis B2B). Não é manipulação — é alavancagem do reflexo, desde que o produto entregue valor real.',
    },
    {
      kind: 'concept',
      title: '6. Compromisso e Coerência — quem disse sim 1x, dirá sim 2x',
      body:
        'Pessoas têm necessidade profunda de manter coerência com suas decisões passadas (mesmo as pequenas). Quem aceita um cadastro grátis tem chance maior de aceitar trial paid. Quem aceita trial tem chance maior de continuar pagando. Técnica clássica "foot-in-the-door" (Freedman & Fraser, 1966): pedir algo pequeno primeiro pra criar coerência, depois fazer o pedido grande. Funis modernos exploram isso intensamente: "se cadastre grátis" → "responda 3 perguntas" → "veja seu resultado personalizado" → "agende uma demo" → "compre".',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança',
      body:
        'Imagina que seu cérebro tem 8 botõezinhos coloridos. Eles servem pra DECIDIR rápido sem pensar muito. (1) Botão Âncora: quando vê um número, ele gruda na cabeça e faz outros números parecerem grandes ou pequenos. Se a primeira bala custa 10 reais, uma de 5 parece barata; se a primeira custa 1 real, a de 5 parece cara. (2) Botão Pouco: quando algo é raro, parece MAIS valioso. Se só tem 1 figurinha rara no álbum, todo mundo quer essa, não as 99 comuns. (3) Botão Todo Mundo: se todo mundo está fazendo, deve estar certo — vamos junto! (4) Botão Adulto Importante: se um adulto de jaleco branco diz que é bom, você acredita mais. (5) Botão Recebi: se a vovó te dá um doce, você sente vontade de fazer algo bom pra vovó. (6) Botão Coerência: se você disse "sim, vou treinar", fica difícil dizer "não" depois — o cérebro quer ser coerente. Marcas espertas apertam esses botões o tempo todo nos anúncios. O legal é PERCEBER os botões sendo apertados — assim você decide se quer ou não.',
      metadata: 'Analogia infantil · 6 botões = 6 princípios de Cialdini',
    },
    {
      kind: 'concept',
      title: '7. Aversão à Perda aplicada — framing de PERDA',
      body:
        'Lembre do módulo 2: perder R$ 100 dói ~2x mais que ganhar R$ 100. Em marketing, isso se traduz em FRAMING. "Economize R$ 200" funciona menos que "Não perca R$ 200". "Adquira benefício X" funciona menos que "Pare de perder benefício X". Healthcare e seguros são mestres nisso: "DEIXE de fumar e viva mais" tem menor adesão que "FUMAR REDUZ sua vida em X anos". Não é manipulação — é alinhar a mensagem com a forma como o cérebro humano realmente pesa ganho vs perda.',
    },
    {
      kind: 'concept',
      title: '8. Endowment Effect — o que é meu vale mais',
      body:
        'Thaler & Kahneman (1990) deram canecas a metade dos participantes de um experimento. Pediram pros donos venderem e pros não-donos comprarem. Donos pediram em média US$ 5,78. Compradores ofereciam US$ 2,21. Mesma caneca, mesma utilidade — só posse mudou. Quando algo é SEU, o cérebro adiciona valor emocional. Aplicação: trial grátis (Netflix 30 dias, Spotify Premium 3 meses) — uma vez "seu", desinstalar dá sensação de PERDA. Test-drive em concessionária, devolução fácil em e-commerce — todos exploram endowment effect baixando a barreira de "ser dono temporariamente".',
    },
    {
      kind: 'table',
      caption: 'Os 8 vieses no marketing — gatilho neural e aplicação',
      headers: ['Viés', 'Estrutura cerebral ativada', 'Aplicação prática típica'],
      rows: [
        ['Ancoragem',              'Córtex pré-frontal',                          'Preço de tabela cortado, plano premium decoy'],
        ['Escassez',               'Amígdala (medo de perda)',                    '"Últimas vagas", deadline, edição limitada'],
        ['Prova Social',           'Córtex pré-frontal medial, TPJ',              'Depoimentos, "X usuários", reviews, selos'],
        ['Autoridade',             'Córtex orbitofrontal',                        'Médico, jaleco, prêmio, título acadêmico'],
        ['Reciprocidade',          'Insula, regiões sociais',                     'Isca digital, sample grátis, conteúdo de valor'],
        ['Compromisso',            'Córtex cingulado anterior',                   'Foot-in-the-door, micro-conversões em sequência'],
        ['Aversão à Perda',        'Amígdala + insula',                           'Framing de perda em copy, "não perca"'],
        ['Endowment',              'Córtex pré-frontal ventromedial',             'Trial grátis, test-drive, devolução fácil'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Ética: persuasão vs manipulação',
      body:
        'Onde está a linha? Persuasão ÉTICA usa heurísticas pra acelerar decisões alinhadas ao interesse REAL do consumidor (você quer um curso de inglês, marketing te ajuda a escolher o melhor pra você). Manipulação USA as mesmas heurísticas pra forçar decisões CONTRA o interesse do consumidor (vender plano caro que ele não precisa via escassez fake, prova social inflada, urgência inventada). Neurociência é arma — pode operar pra qualquer lado. Cialdini publicou um livro inteiro depois (Pre-Suasion, 2016) lembrando: usar essas técnicas pra prejudicar o consumidor destrói confiança a longo prazo e tem custo reputacional altíssimo. Use pra ALINHAR — não pra enganar.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — Black Friday',
      body:
        'A Black Friday é workshop ao vivo de 8 vieses operando simultaneamente. (1) Ancoragem: "de R$ 1.299 por R$ 599". (2) Escassez: "Últimas 20 unidades · acaba em 4h". (3) Prova social: "47 pessoas estão vendo agora · 312 venderam na última hora". (4) Reciprocidade: "Frete grátis exclusivo Black Friday". (5) Compromisso: "Você já está no carrinho — não perca". (6) Aversão à perda: "Você economiza R$ 700 só hoje". (7) Endowment: "Adicionar pra avaliar com calma". (8) Autoridade: "Recomendado por X especialistas". O resultado é cérebro do consumidor sob bombardeio coordenado de gatilhos. Em 2023, no Brasil, Black Friday movimentou ~R$ 5,2 bi em 24h — não por mágica, por design neurocientífico.',
      metadata: 'Black Friday · 8 vieses simultâneos',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'O Sistema 1 decide rápido usando heurísticas (atalhos mentais). Quando funcionam, ótimas; quando falham sistematicamente, viram vieses cognitivos exploráveis em marketing.',
        'Os 6 princípios de Cialdini (ancoragem, escassez, prova social, autoridade, reciprocidade, compromisso) + 2 derivações (aversão à perda, endowment) cobrem a maioria do que vê em campanhas.',
        'Cada viés ativa estruturas cerebrais específicas — escassez na amígdala, prova social no córtex pré-frontal medial, ancoragem no córtex pré-frontal. Não são "psicologia mole": são neurociência mensurável.',
        'Decoy effect (Dan Ariely): plano premium colocado pra ANCORAR — não pra vender. Aumenta venda do plano-meio em 30-50% em testes A/B controlados.',
        'Ética importa: as MESMAS técnicas podem alinhar (acelerar decisão de algo útil) ou manipular (forçar contra interesse real). Persuasão sustentável usa pra ALINHAR — manipulação destrói confiança e mata marca a longo prazo.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Numa tabela de planos com Básico R$ 39 / Pro R$ 89 / Premium R$ 199, o plano Premium frequentemente é desenhado pra:',
      options: [
        'Ser o mais vendido por ser o mais completo',
        'ANCORAR a percepção de preço — faz o Pro parecer "metade do preço" do Premium. É efeito decoy (Dan Ariely) que aumenta vendas do plano-meio em 30-50%',
        'Penalizar consumidores com mais dinheiro',
        'Cumprir exigência regulatória',
      ],
      correct: 1,
      explanation:
        'É o decoy effect documentado por Dan Ariely (2008). O Premium frequentemente NÃO é desenhado pra vender — é desenhado pra criar ÂNCORA. Sem ele, o Pro pareceria caro perto do Básico. Com ele, o Pro vira "metade do preço do Premium", o que o S1 percebe como custo-benefício ótimo. Tests A/B sistematicamente mostram aumento de 30-50% nas vendas do plano-meio quando há decoy bem desenhado. É manipulação ética se o Pro REALMENTE atende a necessidade — antiético se o decoy força compra desnecessária.',
      hint: 'Pense em quem é "vendido" e quem é "âncora" na tabela.',
    },
    {
      question: 'Por que "Últimas 3 unidades" ou "Promoção termina em 2h" funcionam em e-commerce, do ponto de vista neuroquímico?',
      options: [
        'Ativam o cerebelo, melhorando coordenação motora do clique',
        'Disparam amígdala (medo de perder oportunidade) e sistema dopaminérgico (antecipação de recompensa eminente) — combinação que reduz drasticamente o tempo de decisão',
        'Funcionam só por força do hábito cultural, sem base biológica',
        'Apenas afetam consumidores com TDAH',
      ],
      correct: 1,
      explanation:
        'Escassez ativa amígdala (medo de perda — aversão à perda, módulo 2) e sistema dopaminérgico (antecipação da recompensa que pode escapar). Essa combinação biológica acelera a decisão de compra, encurtando o tempo de deliberação do S2. Estudos com fMRI mostram que itens marcados como escassos ativam regiões emocionais mais intensamente. Importante: escassez REAL é princípio neurocientífico legítimo. Escassez FALSA (contagens fabricadas) tecnicamente funciona, mas destrói confiança quando descoberta — e a internet hoje descobre.',
      hint: 'Escassez = perda + recompensa eminente. Que estruturas processam cada uma?',
    },
    {
      question: 'Qual o experimento clássico que documentou o poder DESPROPORCIONAL da autoridade percebida sobre o comportamento humano?',
      options: [
        'Coca vs Pepsi (Montague, 2004)',
        'Gorila Invisível (Simons & Chabris, 1999)',
        'Choques de Milgram (1961) — 65% dos voluntários aplicaram choques que acreditavam serem mortais APENAS porque um pesquisador de jaleco branco mandou',
        'Caneca de Thaler (1990)',
      ],
      correct: 2,
      explanation:
        'O experimento de Stanley Milgram em 1961 é o caso mais perturbador da psicologia. Voluntários comuns aplicaram choques crescentes em outra pessoa SÓ porque um pesquisador de jaleco branco mandou — 65% chegaram à voltagem máxima (que acreditavam ser mortal). Lição neurocientífica: humanos têm tendência DESPROPORCIONAL a obedecer figuras de autoridade percebida (uniforme, título, cenário). Em marketing, isso vira: dentista recomendando creme dental, médico em ad de suplemento, "9/10 especialistas". Funciona — pelo mecanismo que Milgram expôs.',
      hint: 'O experimento mais polêmico da história da psicologia.',
    },
    {
      question: 'A "isca digital" (ebook grátis, mini-curso, calculadora gratuita) em funis B2B explora qual princípio de Cialdini?',
      options: [
        'Escassez',
        'Reciprocidade — quem recebe valor sente OBRIGAÇÃO latente de retribuir, baixando resistência a um pedido futuro de compra em 40-60%',
        'Autoridade',
        'Ancoragem',
      ],
      correct: 1,
      explanation:
        'Reciprocidade é reflexo profundo, conservado em todas as culturas humanas — base evolutiva da cooperação social. Cialdini documentou que pessoas que recebem qualquer coisa (mesmo simbólica) sentem obrigação de retribuir. A "isca digital" entrega valor real (conteúdo, ferramenta) e cria essa obrigação latente. Quando vem o pitch do produto pago depois, a resistência cai significativamente (estudos B2B mostram 40-60% melhor conversão). Ético se o produto pago realmente entrega valor — antiético se a isca é só pretexto pra empurrar lixo.',
      hint: 'Receber → sentir vontade/obrigação de retribuir.',
    },
    {
      question: 'Foot-in-the-door (Freedman & Fraser, 1966) é a técnica de:',
      options: [
        'Vender produto físico ao bater na porta do cliente',
        'Pedir algo PEQUENO primeiro pra criar coerência psicológica, depois fazer o pedido grande. Quem disse "sim" ao pequeno tem chance MUITO maior de dizer sim ao grande',
        'Forçar entrada em ambientes empresariais',
        'Aumentar pressão de venda em conversas presenciais',
      ],
      correct: 1,
      explanation:
        'Freedman & Fraser (1966) mostraram que pessoas que aceitam um pedido PEQUENO (assinar uma petição, colocar adesivo na janela) têm probabilidade muito maior de aceitar pedido GRANDE depois (instalar placa enorme no jardim). Mecanismo: o cérebro humano tem necessidade profunda de manter coerência com decisões anteriores — quem disse sim a algo se vê como "tipo de pessoa que apoia X" e tende a manter coerência. Funis modernos exploram intensamente: cadastro grátis → quiz → recomendação personalizada → trial → compra. Cada micro-sim aumenta probabilidade do próximo.',
      hint: 'Sim pequeno → sim grande. Por que isso funciona psicologicamente?',
    },
    {
      question: 'O Endowment Effect (Thaler & Kahneman, 1990 — experimento da caneca) demonstra que:',
      options: [
        'Donos de canecas têm melhor humor',
        'Pessoas valorizam mais o que JÁ POSSUEM. Donos pediram US$ 5,78 pela caneca; não-donos ofereciam US$ 2,21 pela mesma caneca. Posse adiciona valor emocional ao preço de venda',
        'Canecas são produtos com elasticidade-preço anormal',
        'O efeito só funciona com objetos de cerâmica',
      ],
      correct: 1,
      explanation:
        'Endowment effect: o cérebro adiciona valor emocional/identitário a qualquer coisa que se torna SUA. No experimento, mesma caneca, mesma utilidade objetiva — mas posse mudou a percepção. Aplicação prática: trial grátis (Netflix 30 dias, Spotify Premium 3 meses) explora endowment. Uma vez "seu", desinstalar gera sensação de PERDA (que dói 2x mais que ganho, módulo 2). Test-drive em concessionária e devolução fácil em e-commerce exploram isso baixando a barreira de "experimentar ser dono". Conversão pós-trial é geralmente alta por causa desse efeito.',
      hint: 'Pense por que devolver algo emprestado dói mais que não ter pego em primeiro lugar.',
    },
    {
      question: 'A frase ética central sobre uso de heurísticas em marketing é:',
      options: [
        'Use o máximo de gatilhos possíveis sempre — funciona é o que importa',
        'As mesmas técnicas podem ALINHAR (acelerar decisão de algo útil pro consumidor) ou MANIPULAR (forçar decisão contra interesse real). Persuasão sustentável usa pra alinhar; manipulação destrói confiança e marca a longo prazo',
        'Heurísticas só funcionam em consumidores ingênuos',
        'A neurociência é amoral — toda aplicação é igualmente válida',
      ],
      correct: 1,
      explanation:
        'Cialdini publicou em 2016 (Pre-Suasion) um livro inteiro lembrando esse ponto: as MESMAS técnicas que aceleram decisão alinhada ao interesse do consumidor (você quer um curso de inglês, marketing te ajuda escolher o melhor) também podem forçar contra esse interesse (vender plano caro desnecessário via escassez fake). Marketing sustentável escolhe ALINHAMENTO. Manipulação funciona no curto prazo mas erode confiança, gera churn e mata marca a longo prazo. Neurociência é arma — pode ser usada com ou sem ética; a responsabilidade é de quem aplica.',
      hint: 'A diferença é a INTENÇÃO por trás da técnica.',
    },
    {
      question: 'Numa landing page de curso pago, qual combinação de heurísticas é mais eficaz E ética?',
      options: [
        'Escassez FALSA ("últimas 2 vagas" inventadas) + autoridade SIMULADA (selos sem origem)',
        'Combinação real: prova social (depoimentos verificáveis com nomes/fotos), autoridade legítima (credenciais reais do professor), ancoragem honesta (preço lista vs preço atual), escassez real (cohort com vagas finitas)',
        'Pitch agressivo + culpa do consumidor por não comprar',
        'Apenas texto longo descrevendo a metodologia, sem nenhum gatilho',
      ],
      correct: 1,
      explanation:
        'Combinação ética alavanca neurociência sem enganar. Prova social verificável (não inflada) → ativa córtex pré-frontal medial. Autoridade legítima (credenciais reais) → ativa córtex orbitofrontal. Ancoragem honesta (mostra preço lista real, depois desconto real) → não cria expectativa falsa. Escassez real (cohort fechada de fato) → ativa amígdala sem trair. Resultado: conversão alta E confiança preservada a longo prazo. Alternativa 1 funciona no curtíssimo prazo mas vira reclamação no Reclame Aqui e screenshot viral. Alternativa 4 ignora neurociência e tem conversão baixa.',
      hint: 'Ética + ciência: gatilhos reais, comunicação honesta.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 6 — Dopamina, Recompensa e Expectativa
// ────────────────────────────────────────────────────────────────────────
export const MOD_6_DOPAMINA: Module = {
  slug: 'dopamina-recompensa-expectativa',
  num: 6,
  icon: '🎰',
  title: 'Dopamina, Recompensa e Expectativa — o motor da decisão',
  summary:
    'Dopamina não é o "neurotransmissor do prazer" — é o neurotransmissor da EXPECTATIVA de prazer. Esse detalhe muda tudo no marketing. Aprenda como o sistema dopaminérgico decide o que você quer, por que rolar feed é viciante e como marcas constroem desejo durável.',
  estimatedMin: 18,
  keyTerms: [
    { term: 'Dopamina',                  definition: 'Neurotransmissor central no sistema de recompensa cerebral. NÃO produz prazer diretamente — produz EXPECTATIVA e motivação pra buscar recompensa. Falha entender isso é falha conceitual mais comum em marketing.' },
    { term: 'Sistema de Recompensa',     definition: 'Rede neural envolvendo área tegmental ventral (VTA), núcleo accumbens, córtex pré-frontal. Avalia, antecipa e motiva busca por recompensas (comida, sexo, status, novidade).' },
    { term: 'Núcleo Accumbens',          definition: 'Região central no sistema de recompensa. Ativa fortemente ANTES da recompensa (expectativa), não tanto durante. Combustível neurológico do desejo.' },
    { term: 'VTA',                       definition: 'Área Tegmental Ventral — origem dos neurônios dopaminérgicos do sistema de recompensa. Dispara em resposta a sinais que predizem recompensa.' },
    { term: 'Variable Reward',           definition: 'Recompensa imprevisível (você não sabe se virá ou quando). Produz MUITO MAIS dopamina que recompensa previsível. Base neuroquímica do vício em slot machines e em rolar feed infinito.' },
    { term: 'Dopamine Loop',             definition: 'Ciclo: gatilho → ação → recompensa variável → expectativa renovada. Modelos como Nir Eyal (Hooked, 2014) sistematizaram pra design de produtos viciantes.' },
    { term: 'Antecipação Hedônica',      definition: 'Prazer da espera pela recompensa, frequentemente maior que o prazer da recompensa em si. Por isso planejar a viagem é tão prazeroso quanto fazê-la.' },
    { term: 'Tolerância Dopamínica',     definition: 'Diminuição da resposta dopamínica a estímulo repetido. Mesma promoção vista 50x não excita mais. Marcas precisam variar pra manter resposta.' },
    { term: 'Wanting vs Liking',         definition: 'Kent Berridge mostrou que WANTING (desejo, dopamina) e LIKING (prazer real, opioides endógenos) são sistemas separados. Você pode QUERER muito algo que não TE DÁ PRAZER quando vem (caso clássico do vício).' },
    { term: 'Wolfram Schultz',           definition: 'Neurocientista alemão. Demonstrou em macacos (1997) que dopamina dispara em EXPECTATIVA, não em recompensa em si. Base teórica do reinforcement learning em IA.' },
    { term: 'Prediction Error',          definition: 'Diferença entre o esperado e o recebido. Se recompensa é maior que esperada → spike de dopamina. Igual ao esperado → resposta basal. Menor → queda. Sinal central de aprendizado.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Por décadas, dopamina foi chamada de "neurotransmissor do prazer". Estava errado. O neurocientista Wolfram Schultz mostrou em 1997, em estudos com macacos, que dopamina dispara em ANTECIPAÇÃO da recompensa — não na recompensa em si. Essa descoberta refundou a neurociência da motivação e tem implicações diretas em marketing: marcas não vendem produtos, vendem EXPECTATIVA. Quem entende a química da antecipação domina o desejo do consumidor. Quem confunde dopamina com prazer faz campanha que excita pouco e fideliza menos.',
    },
    {
      kind: 'concept',
      title: 'A descoberta de Wolfram Schultz (1997)',
      body:
        'Schultz colocou eletrodos em neurônios dopaminérgicos da VTA (área tegmental ventral) de macacos e mediu disparos durante uma tarefa simples: macaco ouve um som, depois ganha um suco de uva. Resultado em três fases. (1) No início, dopamina disparava NA HORA do suco (recompensa). (2) Após algumas repetições, dopamina passou a disparar no SOM (que prediz o suco). (3) Recompensa em si gerava resposta basal — não mais o spike. Conclusão: dopamina sinaliza ANTECIPAÇÃO baseada em aprendizado. É o "sinal de busca" que motiva a ação. O prazer real (quando o suco chega) vem de outros sistemas (opioides endógenos).',
    },
    {
      kind: 'concept',
      title: 'Wanting vs Liking — Kent Berridge',
      body:
        'Kent Berridge, neurocientista de Michigan, descobriu que QUERER algo e GOSTAR de algo são processos cerebrais DIFERENTES, regulados por sistemas distintos. Wanting = sistema dopaminérgico (VTA, accumbens). Liking = sistema opioide (regiões específicas como pallidum ventral). Em ratos com sistema dopamínico destruído, ainda demonstram "liking" (expressão facial de prazer ao comer açúcar) mas perderam totalmente o "wanting" (não vão atrás de comida — morrem se não forem alimentados). Isso explica o vício: o viciado QUER intensamente algo que muitas vezes não dá mais PRAZER real. Pode ser celular, drogas, jogos. Aplicação em marketing: design de produto deve cuidar dos dois sistemas — gerar wanting (desejo de buscar) E entregar liking (satisfação real).',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Por que rolar feed do Instagram é viciante',
      body:
        'Sistemas de recompensa variável (variable reward) produzem MUITO mais dopamina que recompensa previsível. Estudos de B.F. Skinner com pombos já mostravam isso em 1950: pombo que ganha comida em intervalos imprevisíveis bica a alavanca 5-10x mais que pombo que ganha em intervalos fixos. Aplicado ao Instagram: cada scroll PODE trazer foto incrível, vídeo engraçado, mensagem importante — ou nada. Imprevisibilidade = pico dopamínico a cada scroll. Resultado: comportamento de busca compulsivo. Mesmo mecanismo do slot machine, do jogo de azar, do tinder. Não é coincidência — é design intencional documentado em Hooked (Nir Eyal, 2014).',
    },
    {
      kind: 'concept',
      title: 'Prediction Error — o cérebro aprende com surpresa',
      body:
        'Princípio central da neurociência da recompensa: dopamina codifica ERRO DE PREDIÇÃO. Você esperava prazer X. Recebeu Y. Diferença (Y - X) determina disparo dopamínico. Se Y > X (recompensa maior que esperada): SPIKE de dopamina, aprendizado intenso, comportamento se reforça. Se Y = X: resposta basal, nada novo. Se Y < X: QUEDA de dopamina, aprendizado reverso, comportamento enfraquece. Implicação em marketing: superar expectativa gera memória positiva forte (efeito uau). Atender expectativa = neutro. Frustrar expectativa = punição neurológica. Promessas exageradas que decepcionam causam queda dopamínica = relação destruída, churn ativo.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — a viagem que você ainda não fez',
      body:
        'Você compra passagens pra Lisboa pra daqui 3 meses. Os 3 meses são SISTEMATICAMENTE mais prazerosos que o dia normal: você pesquisa restaurantes (dopamina), olha fotos do bairro (dopamina), planeja roteiros (dopamina), mostra pra amigos (dopamina). Quando finalmente CHEGA em Lisboa, é gostoso — mas frequentemente "esperava mais". Por quê? O sistema dopaminérgico operou a 100% nos 3 meses de antecipação. Na chegada, o liking (prazer real) chegou — mas o wanting (desejo intenso de busca) terminou. Marketing aprendeu: vender ANTECIPAÇÃO frequentemente é mais lucrativo que vender chegada. Pre-venda, drops, contagem regressiva, sneak peek, lista de espera = todos alavancando dopamina antecipada.',
      metadata: 'Hedonic forecasting · antecipação > chegada',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança',
      body:
        'Imagina que dentro da sua cabeça mora um cachorrinho chamado Dops. Ele só sabe sentir UMA coisa: vontade de buscar. Quando você vê o anúncio de sorvete, o Dops fica AGITADO — começa a balançar o rabo: "VAMOS BUSCAR! VAMOS BUSCAR!". Aí você vai pro mercado, compra o sorvete, abre a embalagem, dá a primeira lambida... e adivinha? O Dops PAROU de agitar. Agora quem tá feliz é outro animal que mora aí: o Liki, um gatinho fofo que GOSTA da coisa quando ela chega. Liki ronrona durante o sorvete. Mas é o Dops que faz você sair de casa e gastar dinheiro — não o Liki. Marcas espertas sabem disso e ficam mexendo com o Dops o tempo todo: "olha que sorvete novo! Edição limitada! Só essa semana!" — pra ele continuar agitado, querendo coisas. Quando algo é IMPREVISÍVEL (você não sabe o que vem), o Dops fica MAIS agitado ainda. Por isso adultos rolam Instagram horas e horas — o Dops fica acreditando que a próxima foto vai ser INCRÍVEL.',
      metadata: 'Analogia infantil · Dops (dopamina) vs Liki (opioides)',
    },
    {
      kind: 'concept',
      title: 'Tolerância dopamínica — por que promoções perdem força',
      body:
        'Como em drogas, dopamina desenvolve TOLERÂNCIA. Estímulo igual e repetido produz cada vez menos resposta. Mesma promoção de "30% off" vista 50 vezes não excita mais — vira ruído de fundo. Por isso campanhas precisam VARIAR: novo formato visual, novo gatilho, nova narrativa, mesmo se a oferta é parecida. Black Friday funciona em parte porque acontece UMA vez por ano (escassez temporal + novidade). Se cada semana fosse Black Friday, a resposta dopamínica colapsaria. Aplicação prática: KPI de "exposure novel" importa tanto quanto "reach" — quantos consumidores viram pela PRIMEIRA vez seu criativo nessa semana?',
    },
    {
      kind: 'concept',
      title: 'Variable Reward Schedules — design para viciar (ou engajar)',
      body:
        'B.F. Skinner classificou em 4 schedules de reforço: fixo por intervalo (recompensa a cada N tempo), fixo por razão (a cada N ações), variável por intervalo (recompensa em tempos imprevisíveis), variável por razão (em número imprevisível de ações). VARIÁVEL = mais dopamina. Slot machines usam variable ratio (você nunca sabe quantas alavancas até ganhar). Feeds infinitos usam variable interval (você nunca sabe quantas rolagens até a próxima recompensa). Email marketing pode usar: enviar conteúdo de altíssimo valor em frequência imprevisível treina abertura compulsiva. Cuidado ético: as mesmas técnicas que engajam podem viciar — design responsável pondera os dois lados.',
    },
    {
      kind: 'table',
      caption: 'Sistema dopaminérgico — wanting vs liking',
      headers: ['Aspecto', 'Wanting (Desejo)', 'Liking (Prazer)'],
      rows: [
        ['Neurotransmissor',  'Dopamina',                       'Opioides endógenos (β-endorfina)'],
        ['Estrutura',         'VTA, núcleo accumbens',           'Pallidum ventral, áreas específicas'],
        ['Quando ativa',      'Antes da recompensa (antecipação)', 'Durante a recompensa (consumo)'],
        ['Função',            'Motivação pra buscar',            'Satisfação ao receber'],
        ['Em vício',          'ALTÍSSIMO — busca compulsiva',     'BAIXO — prazer real diminui'],
        ['Marketing alavanca','Antecipação, drop, escassez, novidade', 'Qualidade do produto, experiência real'],
        ['Métrica',           'Engajamento, busca, clique',      'NPS, retenção, recompra'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'O risco do marketing puramente dopamínico',
      body:
        'Marcas que focam APENAS em gerar wanting (antecipação, drop, escassez) sem investir em liking real (qualidade do produto, experiência da promessa cumprida) constroem desejo curto e vivem de churn. O consumidor é atraído (dopamina), compra, experimenta o produto (liking baixo), decepciona, sai. Próxima campanha precisa de gancho ainda mais forte pra reconquistar. Espiral de fadiga dopamínica e custo de aquisição crescente. Marcas sustentáveis equilibram: dopamina pra atrair + opioides pra fidelizar. Apple é mestra nos dois lados — keynote vira hype dopamínico (antecipação) e o produto físico entrega liking durável (qualidade real).',
    },
    {
      kind: 'concept',
      title: 'Aplicação prática — design para wanting + liking',
      body:
        'Checklist neurocientífico pra construir desejo durável. (1) WANTING upstream: drop com data marcada, lista de espera, sneak peek, conteúdo "vazado", contagem regressiva — tudo gera antecipação dopaminérgica. (2) Variável > previsível: surpresas pontuais (frete grátis surpresa, brinde imprevisível) produzem mais engajamento que recompensas previsíveis. (3) LIKING downstream: produto que entrega ou supera a promessa. Onboarding bem desenhado. Pós-venda atencioso. Embalagem com cuidado de unboxing. (4) Renovar criativo pra evitar tolerância dopamínica — mesmo gatilho perde força. (5) Mensurar separadamente: wanting via cliques/engajamento; liking via NPS/recompra/recomendação. Os dois precisam estar altos pra negócio sustentável.',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Dopamina NÃO é o neurotransmissor do prazer — é o neurotransmissor da EXPECTATIVA. Dispara em antecipação, não em recompensa. Schultz (1997) demonstrou em macacos.',
        'Wanting (desejo, dopamina) e Liking (prazer real, opioides) são sistemas SEPARADOS (Berridge). Vício é wanting alto + liking baixo. Marketing puro de dopamina sem liking real cria churn estrutural.',
        'Variable reward schedules produzem MAIS dopamina que recompensa previsível. Base neuroquímica do vício em feeds infinitos, slot machines e jogos de azar. Use com responsabilidade ética.',
        'Prediction Error: dopamina codifica diferença entre esperado e recebido. Superar expectativa = spike (efeito uau). Atender = neutro. Frustrar = queda (relação destruída).',
        'Tolerância dopamínica é real — mesma promoção repetida perde força. Marketing sustentável renova criativo, varia gatilho e equilibra wanting (atrair) com liking (fidelizar).',
      ],
    },
  ],
  quiz: [
    {
      question: 'Wolfram Schultz (1997) demonstrou em macacos que a dopamina dispara em qual momento da sequência "estímulo → ação → recompensa"?',
      options: [
        'Durante a recompensa em si (no momento do prazer)',
        'Na ANTECIPAÇÃO — quando o cérebro aprende a prever recompensa, dopamina dispara no SINAL que prediz a recompensa, não na recompensa em si',
        'Apenas depois da recompensa (consolidação)',
        'A dopamina não tem relação com recompensa',
      ],
      correct: 1,
      explanation:
        'Schultz mediu neurônios dopaminérgicos da VTA. No início, dopamina disparava na recompensa. Após repetições, passou a disparar no SINAL que prediz a recompensa (som que precede o suco). Na recompensa em si, resposta basal. Conclusão: dopamina é "neurotransmissor da expectativa", não do prazer. Implicação central pra marketing: marcas vendem ANTECIPAÇÃO. Drop, sneak peek, lista de espera, contagem regressiva — todos alavancam o sistema dopaminérgico antecipatório, geralmente mais lucrativo que o momento da entrega.',
      hint: 'Foi descoberta que mudou a neurociência. Onde a dopamina realmente atua?',
    },
    {
      question: 'Kent Berridge mostrou que "wanting" (querer) e "liking" (gostar) são processos cerebrais SEPARADOS. Que implicação isso tem pra entender vício?',
      options: [
        'Vício é simultaneamente alto wanting e alto liking',
        'Vício é wanting MUITO alto (sistema dopamínico hiperativo) mas com liking frequentemente BAIXO (prazer real do consumo diminui). Por isso viciado QUER intensamente algo que muitas vezes nem gosta mais',
        'Vício é apenas falta de força de vontade',
        'Wanting e liking são sinônimos clínicos',
      ],
      correct: 1,
      explanation:
        'Berridge mostrou em ratos com sistema dopamínico destruído: ainda demonstravam "liking" (expressão de prazer ao comer açúcar) mas perderam totalmente "wanting" (não buscavam comida — morriam se não alimentados). Vício é o inverso: wanting hiperativado, liking diminuído. O viciado em jogos QUER intensamente jogar mais — mas o prazer real é menor que era. Implicação pra marketing: design de produto sustentável precisa cuidar dos DOIS — atrair (wanting) E entregar (liking). Puro wanting sem liking = churn.',
      hint: 'Pense em algo que você QUER comprar mas não te dá prazer real quando vem.',
    },
    {
      question: 'Por que rolar feed do Instagram, Tinder ou TikTok é tão viciante neuroquimicamente?',
      options: [
        'Apenas porque é grátis',
        'Variable reward — você nunca sabe se o próximo scroll trará foto incrível, vídeo engraçado, mensagem importante ou nada. Imprevisibilidade gera MUITO mais dopamina que recompensa previsível (mesmo mecanismo do slot machine)',
        'Apenas porque consume tempo',
        'Por causa de aditivos químicos na tela',
      ],
      correct: 1,
      explanation:
        'Variable reward schedules (B.F. Skinner) produzem muito mais dopamina que recompensa previsível. No feed infinito, cada scroll PODE trazer recompensa social, novidade, drama, foto perfeita — ou nada. Imprevisibilidade ativa o sistema dopaminérgico em modo busca compulsivo. Mesmo mecanismo do slot machine (você nunca sabe se a próxima alavanca vai ganhar). Não é coincidência — é design intencional documentado em Hooked (Nir Eyal, 2014). Plataformas otimizam pra DAU/MAU usando essa neuroquímica deliberadamente.',
      hint: 'O que produz mais dopamina: recompensa garantida ou imprevisível?',
    },
    {
      question: 'Prediction error: você prometeu "entrega em 3 dias" e entregou em 5. Que efeito neuroquímico isso provoca no cliente?',
      options: [
        'Spike de dopamina — atraso é vivido como surpresa positiva',
        'QUEDA de dopamina — expectativa não atendida gera punição neurológica. Recebido < Esperado = sinal negativo de aprendizado. Cliente associa marca a frustração — efeito durável de churn',
        'Resposta neutra — cliente não percebe diferença',
        'Aumento de norepinefrina — cliente fica mais alerta',
      ],
      correct: 1,
      explanation:
        'Prediction error funciona dos dois lados. Superar expectativa (entregar em 2 quando prometeu 3) = spike de dopamina, "efeito uau", aprendizado positivo, recomendação espontânea. Atender expectativa exata = neutro, sem reforço especial. Frustrar expectativa (5 quando prometeu 3) = QUEDA de dopamina, aprendizado negativo, frustração química real. Implicação prática: subprometer e superentregar é design dopamínico ótimo. Superprometer e entregar minimamente é receita pra destruir lifetime value via punição neurológica repetida.',
      hint: 'Esperado vs recebido: que diferença gera que sinal dopamínico?',
    },
    {
      question: 'Por que a mesma promoção "30% off" vista 50 vezes deixa de excitar consumidores?',
      options: [
        'Saturação de propaganda em geral',
        'Tolerância dopamínica — estímulo repetido perde força. Mesmo mecanismo de drogas: dopamina diminui resposta a estímulos previsíveis. Marcas precisam VARIAR criativo e gatilho pra manter resposta neural',
        'O cérebro perde a capacidade de processar números após exposições',
        'Apenas pessoas idosas desenvolvem essa tolerância',
      ],
      correct: 1,
      explanation:
        'Tolerância dopamínica é real e bem documentada. Estímulo igual e repetido produz cada vez menos resposta dopamínica — vira ruído de fundo (banner blindness no nível neuroquímico, módulo 3). Por isso campanhas precisam VARIAR formato visual, gatilho, narrativa, contexto — mesmo se a oferta é parecida. Black Friday funciona em parte por ser anual (escassez temporal). Se cada semana fosse Black Friday, colapsaria. KPI relevante: "exposure novel" — quantos consumidores viram pela primeira vez essa semana? Não só reach total.',
      hint: 'O cérebro desenvolve tolerância a tudo previsível.',
    },
    {
      question: 'Marketing baseado em "drop" (lançamento marcado com data, lista de espera, contagem regressiva) explora primariamente qual fenômeno neuroquímico?',
      options: [
        'Liking durante a recompensa',
        'WANTING antecipatório — sistema dopaminérgico ativado intensamente nos dias/semanas antes do lançamento. Antecipação frequentemente gera mais dopamina total que a recompensa em si',
        'Recompensa fixa por intervalo',
        'Memória semântica',
      ],
      correct: 1,
      explanation:
        'Drops, listas de espera, contagem regressiva e sneak peeks alavancam o sistema dopaminérgico antecipatório. O cérebro do consumidor ativa wanting durante TODO o período de espera (não só no momento do lançamento). Isso é por que pré-venda frequentemente é mais lucrativa que venda pura — captura dopamina antecipatória ao longo de dias/semanas. Apple Keynote, drops de tênis raros, lançamentos de série — todos exploram esse mecanismo. Importante: o produto precisa entregar liking real depois ou o efeito se perde no próximo lançamento.',
      hint: 'Quando o sistema dopaminérgico está mais ativo: antes ou durante o consumo?',
    },
    {
      question: 'Marketing puramente "dopamínico" (foco total em gerar wanting via gatilhos, sem investir em liking real do produto) tende a:',
      options: [
        'Construir marcas duradouras e fidelizadas',
        'Atrair clientes (wanting alto na campanha), decepcionar (liking baixo no produto), gerar churn, e exigir gatilhos cada vez mais fortes na próxima campanha — espiral de fadiga dopamínica e CAC crescente',
        'Funcionar igual a marketing balanceado',
        'Ser preferível porque tem mais "energia"',
      ],
      correct: 1,
      explanation:
        'Marketing só-dopamínico funciona no curtíssimo prazo mas é estruturalmente insustentável. Sequência: gatilho gera wanting → cliente compra → produto não entrega liking real → cliente decepciona → churn → próxima campanha precisa de gancho ainda mais forte → tolerância dopamínica → custo de aquisição cresce → margem some. Marcas duradouras (Apple, Lego, Disney) equilibram: dopamina pra atrair + liking real durável pra fidelizar. O keynote gera hype, mas o iPhone entrega satisfação física real. NPS alto + recompra alta = liking funcionando.',
      hint: 'O que acontece quando wanting é alto mas liking decepciona?',
    },
    {
      question: 'Qual a forma ÉTICA de aplicar variable reward em marketing/produto?',
      options: [
        'Usar ao máximo, sem limite, pra maximizar engajamento',
        'Aplicar em momentos de surpresa POSITIVA real (brinde imprevisível, frete grátis surpresa, conteúdo extra inesperado) — eleva engajamento e liking. Evitar em mecânicas que viciam usuários contra interesse próprio (loops infinitos)',
        'Nunca usar — toda variável reward é manipulação',
        'Apenas usar com público adulto educado',
      ],
      correct: 1,
      explanation:
        'Variable reward é arma neuroquímica poderosa — pode ser usada com ou sem ética. Aplicação ética: surpresas pontuais POSITIVAS (brinde imprevisível com pedido, conteúdo extra inesperado em curso, frete grátis surpresa) elevam engajamento E liking real simultaneamente. Aplicação antiética: loops infinitos otimizados pra aprisionar atenção contra o interesse do usuário (feeds, jogos predatórios). A diferença é se o variable reward está alinhado com benefício real do consumidor ou se está minerando atenção/dinheiro contra o interesse dele. Tristan Harris e o Center for Humane Technology são leitura essencial sobre essa fronteira.',
      hint: 'Variable reward pode encantar ou viciar — depende do alinhamento com interesse do usuário.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 7 — Neuromarketing Visual: Cores, Embalagem e Eye-tracking
// ────────────────────────────────────────────────────────────────────────
export const MOD_7_VISUAL: Module = {
  slug: 'neuromarketing-visual-cores-embalagem',
  num: 7,
  icon: '🎨',
  title: 'Neuromarketing Visual — cores, embalagem e eye-tracking',
  summary:
    'O cérebro processa imagem 60.000x mais rápido que texto. Em 13 milissegundos, o córtex visual já sabe se gosta da embalagem. Este módulo destrincha a neurociência da cor, da forma, do design de embalagem e como eye-tracking transformou design de "achismo de criativo" em ciência experimental.',
  estimatedMin: 20,
  keyTerms: [
    { term: 'Córtex Visual Primário (V1)', definition: 'Primeira área cortical que processa informação visual, no lobo occipital. Decompõe estímulo em linhas, bordas, contrastes em milissegundos.' },
    { term: 'Processamento Pré-atentivo',  definition: 'Análise visual que acontece em <100ms, antes da atenção consciente. Detecta cor, orientação, movimento, contraste — base da "primeira impressão" de embalagem.' },
    { term: 'Cor Quente',                  definition: 'Vermelho, laranja, amarelo. Associadas a ativação fisiológica (aumenta levemente batimento, alerta), fome, urgência, paixão.' },
    { term: 'Cor Fria',                    definition: 'Azul, verde, roxo. Associadas a calma, confiança, frescor, profundidade. Verde também a natureza e saúde; azul a tecnologia e estabilidade.' },
    { term: 'Lei de Hick',                 definition: 'Tempo de decisão aumenta logaritmicamente com número de opções. Menos opções = decisão mais rápida. Aplicado a menus, layouts, prateleiras.' },
    { term: 'Princípios de Gestalt',       definition: 'Conjunto de leis da percepção visual (proximidade, similaridade, fechamento, continuidade, figura-fundo). Cérebro organiza estímulos em padrões automaticamente.' },
    { term: 'Fixação Visual',              definition: 'Momento em que o olho para sobre um ponto pra processar. Tempo médio: 200-300ms. Em eye-tracking, indica atenção real (não só presença no campo visual).' },
    { term: 'Sacada',                      definition: 'Movimento rápido do olho entre fixações. Não há processamento visual durante a sacada — só nas fixações.' },
    { term: 'Heatmap',                     definition: 'Visualização agregada de eye-tracking. Vermelho = muitos olharam por muito tempo. Frio = ignorado. Insumo direto de otimização.' },
    { term: 'F-pattern',                   definition: 'Padrão clássico de leitura de páginas web descoberto por Nielsen: usuários escaneiam topo horizontal, depois descem na esquerda fazendo "F". Implicação: informação crítica vai no topo-esquerda.' },
    { term: 'Z-pattern',                   definition: 'Outro padrão de leitura, especialmente em landing pages com pouca informação: olho faz "Z" — topo-esquerda → topo-direita → diagonal → base-esquerda → base-direita.' },
    { term: 'Visual Hierarchy',            definition: 'Sequência intencional de elementos visuais por importância. Tamanho, cor, contraste, posição e isolamento criam ordem perceptiva — o olho segue o caminho desenhado.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'O cérebro humano dedica ~30% do córtex ao processamento visual — mais que a soma de todos os outros sentidos. Imagens são processadas até 60.000 vezes mais rápido que texto. Em 13 milissegundos (estudo do MIT, 2014), o cérebro já forma percepção rudimentar de uma imagem. Implicação pra marketing: o design visual de uma embalagem, anúncio ou página NÃO É estética secundária — é a primeira camada de comunicação, e frequentemente a decisiva. Este módulo cobre cores, formas, leis perceptivas e como eye-tracking revolucionou design de embalagem.',
    },
    {
      kind: 'concept',
      title: 'A jornada da imagem no cérebro',
      body:
        'Em 100 milissegundos, eis o que acontece. (1) 0-30ms: luz entra pela retina, sinal viaja pelo nervo óptico ao tálamo (núcleo geniculado lateral). (2) 30-70ms: chega ao córtex visual primário (V1) no lobo occipital. V1 decompõe em linhas, bordas, contrastes, orientações. (3) 70-100ms: áreas visuais superiores (V2, V4, IT) processam cor, forma, reconhecimento de objetos. Nesse ponto, o cérebro já SABE "isso é uma garrafa vermelha" — sem participação consciente. Tudo isso é pré-atentivo. A consciência só "vê" depois, recebendo já o pacote interpretado. Marketing visual eficaz desenha PRA essa camada pré-atentiva: ela é o gargalo de tudo.',
    },
    {
      kind: 'concept',
      title: 'A neurociência da cor',
      body:
        'Cor não é só estética — é gatilho neurológico. Vermelho ativa córtex visual MAIS que outras cores (estudo de Mehta & Zhu, 2009) e produz leve ativação fisiológica (batimento, respiração). Por isso é cor de promoção, urgência, fome (McDonald\'s, Coca, Magalu, KFC). Azul ativa áreas associadas a confiança e estabilidade — domina branding de bancos, planos de saúde e empresas de tech (Facebook, Visa, Caixa, Bradesco). Verde liga-se a natureza, saúde e dinheiro — usado por Whole Foods, Starbucks, BBVA, Banco do Brasil. Amarelo chama atenção em curtíssimo prazo (mais visível no espectro humano) mas cansa rapidamente — usado em CTAs, advertências (taxi, sinais de trânsito). Cores NÃO são universais 100% — variam por cultura — mas têm núcleo biológico estável.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'O caso da Coca-Cola vermelha',
      body:
        'O vermelho da Coca-Cola não é decorativo. Estudos mostram que cor vermelha em contexto alimentar ATIVA córtex insular e regiões associadas a fome/desejo. Restaurantes fast-food dominam vermelho/amarelo pela mesma razão: ativação visceral acelerada, aumento de impulso de consumo. McDonald\'s mantém vermelho mesmo em mercados onde cultura local valoriza outras cores — porque o efeito neurobiológico é mais forte que variação cultural. Por outro lado, marcas de luxo (Tiffany, Apple) preferem cores frias/neutras — ativam córtex pré-frontal (controle, sofisticação), não regiões viscerais.',
    },
    {
      kind: 'concept',
      title: 'Leis de Gestalt — como o cérebro agrupa',
      body:
        'Cérebro NÃO vê pixels — vê padrões. Os princípios de Gestalt (escola alemã, 1910s) descrevem como o sistema visual organiza estímulos automaticamente. (1) Proximidade: elementos próximos são vistos como grupo. (2) Similaridade: elementos parecidos são agrupados. (3) Fechamento: cérebro completa formas incompletas (logo do WWF "panda" tem partes implícitas). (4) Continuidade: o olho segue linhas suaves. (5) Figura-fundo: cérebro separa "objeto" do "fundo" (logo da FedEx tem seta entre E e X — uma vez vista, não desfaz). Aplicação em design: layouts respeitando Gestalt parecem "organizados" sem esforço cognitivo. Layouts violando parecem "bagunçados" — o cérebro força esforço extra de organização e desiste.',
    },
    {
      kind: 'concept',
      title: 'Lei de Hick — menos opções, decisão mais rápida',
      body:
        'Lei de Hick (1952): tempo de decisão aumenta logaritmicamente com número de opções. Mais opções = mais tempo + mais fadiga decisória. Famoso experimento de Iyengar (2000) em supermercado: stand com 24 sabores de geleia atraiu MAIS pessoas, mas só 3% compraram. Stand com 6 sabores atraiu menos, mas 30% compraram. 10x mais conversão com menos opções. Aplicação: cardápios com 200 itens diluem decisão; cardápios curados de 12 itens vendem mais. Página de produto com 50 modelos confunde; jornada com 3 perguntas + recomendação focada converte mais. Menos é mais — neurologicamente comprovado.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — desenho de embalagem',
      body:
        'Você vai lançar uma marca nova de café. Como decidir embalagem? Sequência de decisões neurocientíficas. (1) Posicionamento: premium ou popular? Premium = preto/dourado/marrom escuro (ativa córtex pré-frontal, controle, sofisticação). Popular = vermelho/amarelo (ativa visceral, urgência). (2) Diferenciação na prateleira: que cor domina a categoria? Se concorrentes são todos vermelhos, sua marca azul-marinho ESTOURA visualmente (módulo 3 — bottom-up). (3) Hierarquia visual: o que o olho deve ver primeiro? Logo? Tipo (espresso/coado)? Origem (Minas)? Aplique tamanho/contraste pra desenhar a sequência. (4) Princípios de Gestalt: agrupe informações relacionadas, separe grupos diferentes — evite parede confusa. (5) Teste com eye-tracking real — 10 sujeitos custa ~R$ 2k e dá clareza que 50 reuniões de criativo não dão.',
      metadata: 'Embalagem de café · 5 decisões neurocientíficas',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança',
      body:
        'Imagina que seus olhos são DUAS câmeras superpoderosas mandando 11 milhões de fotos por segundo pro seu cérebro. O cérebro é um chefe muito ocupado e não tem tempo de olhar foto por foto. Então ele tem regras simples pra organizar tudo rápido. (1) "Coisas perto = mesmo grupo": as letras "casa" são vistas como uma palavra, não como 4 letras soltas. (2) "Coisas parecidas = mesmo time": no time de futebol todo mundo vestindo amarelo é o Brasil. (3) "Faltou pedaço? Eu completo": se você vê um círculo com uma parte apagada, ainda vê como círculo. (4) "Cores quentes (vermelho, laranja) = ATENÇÃO, COMIDA!": é por isso que placa de pare é vermelha e batata frita do McDonald\'s tem fundo vermelho. (5) "Cores frias (azul, verde) = calma, confiança": por isso médico usa branco/azul e parques são verdes. Marcas espertas usam essas regras pra fazer seu cérebro "gostar" do produto em 1 segundo, antes de você pensar nada. Por isso embalagem importa pra caramba — ela conversa com seu cérebro ANTES de você ler nada.',
      metadata: 'Analogia infantil · 5 regras visuais simplificadas',
    },
    {
      kind: 'concept',
      title: 'Eye-tracking — medindo o invisível',
      body:
        'Já apresentado no módulo 3, vale aprofundar: eye-tracking moderno usa câmeras infravermelhas (Tobii, GazeRecorder, EyeLink) que capturam posição do olho a 60-1000Hz. Gera dois dados: FIXAÇÕES (onde o olho parou, 200-300ms cada — atenção real) e SACADAS (movimentos rápidos entre fixações, sem processamento). Agregando 8-15 sujeitos, você tem dados estatisticamente úteis pra: otimizar onde colocar logo na embalagem, onde colocar CTA no site, qual ordem o olho percorre uma cena. Empresa pequena pode rodar com 5 sujeitos por ~R$ 1.500 — barato e devastador em clareza versus opinião de criativo. Algumas marcas grandes (Unilever, P&G) têm laboratórios próprios e rodam centenas de testes por ano.',
    },
    {
      kind: 'concept',
      title: 'Padrões de leitura — F-pattern e Z-pattern',
      body:
        'Jakob Nielsen estudou eye-tracking de milhares de usuários web e identificou padrões. F-PATTERN: páginas com muito texto (artigos, busca de e-commerce com lista). Usuários escaneiam linha horizontal no topo, depois descem na esquerda lendo só primeiras palavras de cada linha — formando F. Implicação: informação crítica vai no topo + primeiras palavras de cada parágrafo/título. Z-PATTERN: páginas com pouca informação (landing pages, anúncios). Olho faz Z: topo-esquerda (logo) → topo-direita (CTA secundário) → diagonal → base-esquerda (info importante) → base-direita (CTA principal). Implicação: estrutura sua landing nesse padrão e o olho cumprirá a jornada que você desenhou.',
    },
    {
      kind: 'table',
      caption: 'Cores e suas associações neurocientíficas/culturais',
      headers: ['Cor', 'Associação dominante', 'Categorias clássicas'],
      rows: [
        ['Vermelho',  'Urgência, fome, paixão, perigo, ação',  'Fast-food, promoção, alerta, paixão'],
        ['Laranja',   'Energia, calor, juventude, social',     'Esporte, fitness, social media'],
        ['Amarelo',   'Atenção, otimismo, custo-baixo',        'Sinais, taxi, marcas popular'],
        ['Verde',     'Natureza, saúde, dinheiro, calma',      'Orgânico, sustentável, banco'],
        ['Azul',      'Confiança, estabilidade, tecnologia',   'Bancos, plano de saúde, tech, governo'],
        ['Roxo',      'Luxo, criatividade, mistério',          'Cosmético premium, espiritual, criativo'],
        ['Rosa',      'Feminino, cuidado, açúcar',             'Cosmético, infantil, doce'],
        ['Preto',     'Premium, sofisticação, autoridade',     'Luxo, moda, premium'],
        ['Branco',    'Pureza, simplicidade, espaço',          'Saúde, tech minimalista, casamento'],
        ['Marrom',    'Natural, robusto, terra',               'Café, chocolate, móveis rústicos'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Cuidado com generalizações de cor',
      body:
        'As associações de cor têm núcleo biológico (vermelho ATIVA, azul ACALMA — efeito fisiológico documentado) MAS variam significativamente por cultura. Branco é casamento no Ocidente, luto na China. Vermelho é sorte na China, perigo no Ocidente. Roxo é luxo no Ocidente, luto em Brazil parcial. Antes de aplicar internacionalmente, faça research cultural. Para o mercado brasileiro: vermelho/amarelo dominam fast-food popular; azul domina bancos/saúde; verde domina sustentabilidade/natural. Os padrões são fortes mas não absolutos — sempre teste com público real.',
    },
    {
      kind: 'concept',
      title: 'Aplicação prática — checklist visual',
      body:
        'Pra qualquer ativo visual (embalagem, anúncio, landing). (1) Em 13ms, o cérebro forma impressão. O que ele DEVE captar primeiro? (logo? cor? promessa? produto?). (2) A cor está alinhada ao posicionamento? Premium = frio/neutro; popular = quente. (3) Sobrevive ao teste de contraste contra concorrentes na prateleira? (4) Princípios de Gestalt aplicados? Elementos agrupados por proximidade e similaridade, não amontoados aleatoriamente. (5) Hierarquia visual desenha a sequência: olho deveria ir A → B → C → D. (6) Quantidade de opções respeita Lei de Hick? Mais de 7 elementos competindo confunde. (7) F-pattern ou Z-pattern desenhados? (8) Validado por eye-tracking real, mesmo que com 5-8 sujeitos? Esses 8 passos separam design profissional de design intuitivo.',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Cérebro dedica ~30% do córtex à visão. Imagens são processadas 60.000x mais rápido que texto. Em 13ms já forma percepção rudimentar — design visual é primeira camada de comunicação, não decoração.',
        'Cores têm efeito neurobiológico real: vermelho ATIVA fisiologia (urgência, fome); azul ACALMA (confiança, tech); verde liga natureza/saúde; preto = premium. Variações culturais importam, mas núcleo biológico é estável.',
        'Leis de Gestalt (proximidade, similaridade, fechamento, continuidade, figura-fundo) descrevem como cérebro agrupa estímulos. Design que respeita parece "organizado"; que viola parece "bagunçado".',
        'Lei de Hick: tempo de decisão cresce logaritmicamente com número de opções. Experimento da geleia (Iyengar 2000): 6 opções vendem 10x mais que 24. Menos é mais — comprovadamente.',
        'Eye-tracking transformou design de "achismo de criativo" em ciência experimental acessível. Hoje 5-8 sujeitos custam ~R$ 1.500 e dão clareza que 50 reuniões não dão.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Aproximadamente em quantos milissegundos o cérebro humano forma uma primeira percepção visual rudimentar de uma imagem (segundo o estudo do MIT de 2014)?',
      options: [
        '500ms (meio segundo)',
        '13ms — quase instantâneo, antes de qualquer participação consciente',
        '2.000ms (2 segundos)',
        '100ms',
      ],
      correct: 1,
      explanation:
        'O estudo de Mary Potter et al. no MIT (2014) demonstrou que humanos identificam categorias de imagens (animal, objeto, cena) em apenas 13 milissegundos. Isso significa que design visual de embalagem ou anúncio comunica ANTES de qualquer processamento consciente. Em 13ms, o córtex visual primário já decompôs em linhas, contrastes e cores, e áreas superiores já formaram impressão "isso é X, sinto Y". Implicação prática brutal: você não tem 5 segundos pra explicar visualmente — tem 13ms pra o primeiro impacto. Design profissional otimiza pra essa janela.',
      hint: 'O número surpreende — é abaixo de 1/30 de segundo.',
    },
    {
      question: 'Por que o vermelho domina marcas de fast-food (McDonald\'s, Coca-Cola, KFC, Burger King)?',
      options: [
        'Por tradição histórica do setor — sem base biológica',
        'Vermelho ativa córtex visual mais intensamente que outras cores E produz leve ativação fisiológica (batimento, respiração, sensação de fome). É gatilho visceral pra impulso de consumo alimentar',
        'Vermelho é a cor mais barata de tinta',
        'Apenas para diferenciar de comida saudável (que usa verde)',
      ],
      correct: 1,
      explanation:
        'Vermelho tem efeito neurobiológico documentado (Mehta & Zhu, 2009): ativa córtex visual mais que outras cores E produz ativação fisiológica leve mas mensurável (aumento de batimento, sensação de alerta, urgência). Em contexto alimentar, ativa córtex insular e regiões de fome/desejo. Por isso fast-food usa massivamente vermelho — não é coincidência cultural, é design baseado em efeito biológico estável que funciona em todas as culturas (McDonald\'s mantém vermelho globalmente). Restaurantes de luxo, ao contrário, usam frio/neutro pra ativar córtex pré-frontal (sofisticação, controle).',
      hint: 'Pense no que vermelho faz fisiologicamente, não apenas culturalmente.',
    },
    {
      question: 'O experimento clássico da geleia de Iyengar (2000) em supermercado mostrou:',
      options: [
        'Mais variedade sempre converte mais',
        'Stand com 24 sabores atraiu MAIS atenção, mas só 3% compraram. Stand com 6 sabores: menos atenção, mas 30% compraram. Menos opções gerou 10x MAIS conversão — Lei de Hick em ação',
        'A escolha não influencia a venda',
        'Geleia premium vendeu mais que popular',
      ],
      correct: 1,
      explanation:
        'O experimento de Sheena Iyengar é clássico em ciência da decisão. Mais opções atrai mais atenção inicial (novidade, riqueza visual), mas paralisa decisão por fadiga decisória (S2 esgota — módulo 2). 24 opções = 3% conversão. 6 opções = 30% conversão. Lei de Hick: tempo de decisão cresce logaritmicamente com opções. Aplicação prática direta: cardápios curados de 12-15 itens vendem mais que cardápios de 200; landing page com 3 planos converte mais que 8; e-commerce com filtros excessivos diminui conversão. "Menos é mais" não é frase de design — é ciência da decisão.',
      hint: 'Mais opções convidam mais — mas convertem mais ou menos?',
    },
    {
      question: 'O logo do WWF (panda com partes brancas implícitas) e o logo da FedEx (seta escondida entre E e X) exploram qual princípio perceptivo?',
      options: [
        'Mere exposure',
        'Princípios de Gestalt — especialmente fechamento (cérebro completa formas incompletas) e figura-fundo (cérebro separa objeto de fundo, criando significado adicional)',
        'Lei de Hick',
        'Cognitive Ease',
      ],
      correct: 1,
      explanation:
        'Os princípios de Gestalt descrevem como o cérebro organiza percepção automaticamente. Fechamento: cérebro completa formas incompletas (panda do WWF). Figura-fundo: cérebro separa objeto de fundo, gerando descoberta lúdica (seta da FedEx, brilho entre A e mz no logo Amazon, etc). Esses "easter eggs" perceptivos criam engajamento via prediction error positivo (módulo 6 — surpresa = dopamina) e são lembrados por décadas. Design profissional usa Gestalt deliberadamente.',
      hint: 'Cérebro vê o que NÃO está totalmente desenhado — qual princípio é esse?',
    },
    {
      question: 'F-pattern (Nielsen) é o padrão de leitura em:',
      options: [
        'Apenas formulários longos',
        'Páginas com muito texto (artigos, busca de e-commerce, listas) — usuários escaneiam linha horizontal no topo, depois descem na esquerda lendo só primeiras palavras. Implicação: informação crítica no topo + começo de cada parágrafo',
        'Apenas em telas mobile pequenas',
        'Apenas em sites em inglês',
      ],
      correct: 1,
      explanation:
        'F-pattern é padrão de scanning em páginas densas de texto, descoberto por Jakob Nielsen via eye-tracking de milhares de usuários. Olho percorre linha horizontal no topo, depois desce verticalmente lendo só primeiras palavras de cada linha/parágrafo. Implicação prática: tudo importante vai no TOPO e no começo de cada bloco de texto. Texto importante enterrado no meio de parágrafo longo = invisível. Para landing pages mais visuais com pouca informação, padrão é Z (canto-canto-diagonal-canto-canto) — desenhar a jornada visual desejada.',
      hint: 'F é padrão de TEXTO; Z é padrão de páginas mais visuais.',
    },
    {
      question: 'Eye-tracking moderno é acessível mesmo a empresas médias. Aproximadamente quantos sujeitos são suficientes pra dados estatisticamente úteis em teste de embalagem ou landing?',
      options: [
        'Mínimo 200 sujeitos',
        '8-15 sujeitos por variante já fornece dados úteis pra otimização — custo de ~R$ 1.500-3.000 com ferramentas como Tobii ou GazeRecorder',
        'Mínimo 1.000 sujeitos por variante',
        'Apenas 1 sujeito',
      ],
      correct: 1,
      explanation:
        'Jakob Nielsen popularizou a regra "5 usuários encontram 80% dos problemas" pra usabilidade. Pra eye-tracking, 8-15 sujeitos por variante captura os padrões dominantes de fixação (heatmap se estabiliza). Hoje, ferramentas como Tobii Pro Nano, GazeRecorder web, ou serviços como UseberryEye fornecem sessões a R$ 100-300 por sujeito. Total ~R$ 1.500-3.000 por variante. Comparado a milhões investidos numa campanha que não funciona, é investimento minúsculo com clareza enorme. Décadas atrás eye-tracking custava R$ 200k em equipamento; hoje cabe em qualquer orçamento sério de marketing.',
      hint: 'Pense em economia de design — quanto custa errar uma campanha inteira?',
    },
    {
      question: 'Você precisa lançar embalagem nova de iogurte premium. Aplicando os princípios neurocientíficos do módulo, qual estratégia de cor é mais consistente com o posicionamento?',
      options: [
        'Vermelho intenso pra ativar urgência e fome',
        'Paleta fria, neutra ou de baixa saturação (branco, preto, marrom escuro, gold tones) que ativa córtex pré-frontal — sofisticação, controle, intencionalidade. Vermelho/laranja sinaliza popular, não premium',
        'Multicolorido pra agradar todos os perfis',
        'Verde vibrante porque iogurte é saudável',
      ],
      correct: 1,
      explanation:
        'Posicionamento premium ativa córtex pré-frontal (controle, sofisticação) — cores frias, neutras, baixa saturação, alto contraste e muito espaço em branco fazem isso. Vermelho intenso ativa visceral (impulso, urgência, fome) — perfeito pra fast-food popular, oposto de premium. Por isso marcas premium dominam preto/branco/dourado/tons terrosos sofisticados (Tiffany cyan é exceção icônica). Iogurte premium tipo Activia Premium ou Vigor Selecto seguem esse padrão. Vermelho vibrante ou neon = sinalização visual de massa/popular/promoção.',
      hint: 'Premium ativa que parte do cérebro? Qual paleta combina com isso?',
    },
    {
      question: 'Princípios de Gestalt aplicados num menu de restaurante implicam:',
      options: [
        'Listar todos os pratos numa única coluna corrida',
        'Agrupar itens relacionados por PROXIMIDADE (entradas juntas, principais juntas, sobremesas juntas) e usar SIMILARIDADE visual (mesma fonte, mesmo estilo de descrição) dentro de cada grupo — cérebro organiza automaticamente, leitura fica fácil',
        'Mostrar imagens enormes de todos os pratos',
        'Usar cores diferentes pra cada prato',
      ],
      correct: 1,
      explanation:
        'Gestalt aplicado ao menu: proximidade agrupa o que é relacionado (todas as entradas juntas, separadas das principais), e similaridade visual (mesma fonte, mesmo padrão de descrição) reforça o agrupamento dentro de cada categoria. Resultado: cérebro organiza sem esforço cognitivo — leitura fluida, decisão mais rápida (Lei de Hick mitigada). Violar Gestalt (misturar pratos sem agrupamento, fontes diferentes pra mesma categoria) força o S2 a trabalhar pra organizar — fadiga decisória ativa, churn da decisão, retorno menor. Design profissional de menu = neurociência aplicada de forma quase invisível.',
      hint: 'Que regras o cérebro usa pra agrupar coisas automaticamente?',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 8 — Neuropricing e Ética em Neuromarketing
// ────────────────────────────────────────────────────────────────────────
export const MOD_8_NEUROPRICING: Module = {
  slug: 'neuropricing-etica-neuromarketing',
  num: 8,
  icon: '💸',
  title: 'Neuropricing e Ética — como o cérebro percebe preço',
  summary:
    'Preço NÃO é número objetivo — é experiência neurológica. Estudos com fMRI mostram que pagar ATIVA o córtex da ínsula (dor física). Como reduzir essa "dor de pagar", como ancorar valor e onde está a fronteira ética em neuromarketing — fechando a trilha.',
  estimatedMin: 18,
  keyTerms: [
    { term: 'Pain of Paying',           definition: 'Dor neurológica de pagar, descoberta por Knutson et al. (2007). Ativa córtex insular (mesma região que processa dor física). Quanto mais saliente o pagamento, maior a dor.' },
    { term: 'Núcleo Accumbens',         definition: 'Ativa em ANTECIPAÇÃO da posse do produto. Em decisão de compra, "luta" contra a ativação insular (dor de pagar). Se accumbens > ínsula, comprar; ínsula > accumbens, não comprar.' },
    { term: 'Charm Pricing',            definition: 'Preços terminando em 9 (R$ 9,99 vs R$ 10). Estudos mostram aumento de 24% em vendas em algumas categorias. Mecanismo: cérebro lê dígito mais à esquerda primeiro ("9" não "10").' },
    { term: 'Prestige Pricing',         definition: 'Preços redondos altos (R$ 100, não R$ 99,99). Sinalizam qualidade/luxo. Marcas premium usam — cérebro lê redondez como "confiança no valor".' },
    { term: 'Bundling',                 definition: 'Vender pacote de itens por preço único (geralmente menor que soma). Reduz dor de pagar (1 transação vs N), aumenta valor percebido.' },
    { term: 'Unbundling',               definition: 'Separar itens em compras individuais. Aumenta receita total em alguns contextos (airline ticket sem bagagem) mas eleva dor de pagar.' },
    { term: 'Decoy Pricing',            definition: 'Já visto: plano "premium" caro pra ancorar e fazer plano-meio parecer barato. Aumenta vendas do plano-alvo em 30-50%.' },
    { term: 'Price Anchoring',          definition: 'Mostrar preço alto antes do preço real ("De R$ 599 por R$ 299"). Ancora percepção em R$ 599 — R$ 299 vira "super desconto" neural.' },
    { term: 'Drip Pricing',             definition: 'Preço final aumenta gradualmente em etapas (taxa, frete, serviço, imposto). Cada incremento ativa ínsula incrementalmente. Usado por algumas plataformas — antiético em mercados regulamentados.' },
    { term: 'Knutson et al. (2007)',    definition: 'Estudo seminal de fMRI mostrou que decisão de compra é "soma neural": preferência (accumbens, +) menos dor de pagar (ínsula, -). Prediz decisão com 60% de acurácia mais que perguntar à pessoa.' },
    { term: 'Behavioral Pricing',       definition: 'Disciplina aplicada que usa neurociência e economia comportamental pra otimizar preços. Empresas grandes têm times inteiros dedicados (Disney, Uber, Booking).' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Preço não é só número — é experiência neurológica complexa. Brian Knutson e equipe em Stanford descobriram em 2007, usando fMRI durante decisões reais de compra, algo notável: ver o preço ATIVA o córtex insular — a mesma região que processa dor física. Pagar literalmente dói. E a decisão de comprar é uma "soma neural": preferência pelo produto (núcleo accumbens, positivo) MENOS dor de pagar (ínsula, negativo). Se accumbens > ínsula, compra. Se ínsula > accumbens, não compra. Este módulo fecha a trilha mostrando como aplicar essa neurociência a pricing e onde traçar a linha ética em todo neuromarketing.',
    },
    {
      kind: 'concept',
      title: 'A descoberta de Knutson — preço dói',
      body:
        'Knutson colocou voluntários em scanner fMRI e mostrou produtos seguidos de preços. Mediu ativação em duas regiões: núcleo accumbens (sistema de recompensa, dispara com desejo) e ínsula (processamento de dor, dispara com aversão). Resultado: a decisão de comprar foi PREVISTA com 60% mais acurácia pela atividade neural do que perguntando à pessoa. Quando o preço ativava a ínsula mais que o produto ativava o accumbens, pessoa não comprava — mesmo dizendo querer. Conclusão: pagar é experiência aversiva real, mensurável. Marketing inteligente trabalha pra REDUZIR essa ativação insular sem reduzir o preço (mecanismos abaixo) ou pra aumentar a ativação do accumbens (desejo).',
    },
    {
      kind: 'concept',
      title: 'Charm pricing — o poder do 9',
      body:
        'Preços terminados em 9 (R$ 9,99 vs R$ 10,00; R$ 99 vs R$ 100) consistentemente vendem mais em testes A/B controlados. Estudo clássico do MIT (Anderson & Simester, 2003) testou vestidos a US$ 34, 39 e 44 num catálogo. Resultado: vestidos a US$ 39 venderam MAIS que vestidos a US$ 34 — preço mais alto, venda maior. Mecanismo: cérebro processa o dígito mais à esquerda primeiro (anchor primário). R$ 9,99 é registrado como "9 e poucos", não como "quase 10". Aumento típico de venda: 5-25% dependendo da categoria. Funciona melhor em produtos de baixo envolvimento (S1). Em premium, pode ter efeito INVERSO (parece barato demais — não-sofisticado).',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Prestige pricing — quando 100 vence 99',
      body:
        'Em produtos premium, o oposto frequentemente vale: preços REDONDOS (R$ 100, R$ 500, R$ 2.000) vendem MAIS que terminações em 9. Por quê? Redondez sinaliza CONFIANÇA no valor — "vale isso, ponto". Terminação em 9 sinaliza promoção, ansiedade pra vender, popular. Apple usa terminações em 9 em iPhone (massa premium), mas Patek Philippe nunca vai cobrar $24.999 num relógio — cobra $25.000 limpo. Lição: charm pricing pra massa, prestige pricing pra luxo. Errar isso = posicionamento confuso (Cadillac com preço "promocional 99" desbarata o luxo).',
    },
    {
      kind: 'concept',
      title: 'Bundling — reduzir dor de pagar',
      body:
        'Bundling (vender pacote por preço único) reduz dor de pagar porque dispara a ativação insular UMA VEZ em vez de N vezes. Microsoft Office é o caso clássico — você paga 1x e tem Word + Excel + PowerPoint + Outlook. Se cada um custasse separado, cada compra reativava a ínsula. Cruzeiro all-inclusive: dor 1x na compra do pacote; depois da embarque, você consome sem reativar dor cada drink. Restaurante de combo (lanche + batata + refri): preço único, percepção de "deal" + dor única. Aplicação: sempre que possível, bundle. Reduz fricção neural e aumenta valor percebido.',
    },
    {
      kind: 'concept',
      title: 'Pagamento sem fricção — Uber e Apple Pay',
      body:
        'Uma das inovações neuropsicológicas mais brutais da última década: SEPARAR o ato de consumir do ato de pagar. Uber: você usa o carro, sai. O pagamento acontece automaticamente em segundo plano. Dor de pagar quase ZERO — só revisa o valor depois. Apple Pay e cartões sem contato: pagamento em 0,5 segundo, sem digitar senha, sem ver o valor sair da conta. Cada friction removido reduz ativação insular. Marketing inteligente do início ao fim do funil tem que cuidar disso: checkout 1-click (Amazon), pagamento por aproximação, recurring billing. Cada segundo de "fricção de pagamento" eliminado aumenta conversão mensuravelmente.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — assinatura recorrente',
      body:
        'Por que serviços por assinatura (Netflix, Spotify, gym, jornal) preferem cobrança mensal recorrente em vez de pagamento por uso? Neurociência: cobrança recorrente, depois de configurada, deixa de ativar a ínsula a cada uso. Você assiste 200h de Netflix no mês — nenhuma ativa "tô pagando agora". Compare com modelo pay-per-view: cada filme ativa explicitamente "tô gastando R$ 12,90 nisso". Resultado: assinatura aumenta consumo (e satisfação reportada) E aumenta receita previsível. Trade-off ético: assinatura facilita esquecer pagamento e cobra de quem não usa — daí a importância de cancelar fácil (regulação europeia força isso).',
      metadata: 'Modelo de assinatura · separa consumo de pagamento',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança',
      body:
        'Imagina que dentro da sua cabeça mora um carteiro chamado Sr. Insula. Ele cuida da sua "caixinha de dinheiro" e fica MUITO triste quando vê dinheiro saindo. Cada vez que você gasta, o Sr. Insula chora um pouquinho — DÓI tirar dinheiro. Mas tem uma turminha aliada da sua felicidade: a Família Accumbens. Eles ADORAM quando você pega coisas que QUER (um brinquedo, um sorvete, um jogo). Quando você está pensando em comprar algo, os dois lutam: o Sr. Insula chora ("não gasta, vai doer!") e a Família Accumbens dança ("PEGA, PEGA!"). Se a família dança mais alto que o carteiro chora, você compra. Se o carteiro chora mais alto, você não compra. Marcas espertas tentam fazer dois jeitos: (1) Fazer a Família Accumbens dançar MUITO (anúncios, embalagens lindas, expectativa). (2) Fazer o Sr. Insula chorar MENOS — colocando preços que terminam em 9 (parece menos), juntando coisas em um pacote (chora 1x em vez de 3x), ou fazendo o pagamento ser tão rápido que ele nem percebe (Apple Pay). Adultos fazem isso o tempo todo sem perceber.',
      metadata: 'Analogia infantil · Sr. Insula vs Família Accumbens',
    },
    {
      kind: 'concept',
      title: 'Drip pricing — onde a ética se quebra',
      body:
        'Drip pricing: mostrar preço inicial baixo, depois adicionar taxas gradualmente (taxa de serviço, frete, imposto, "limpeza") até checkout. Cada incremento ativa ínsula incrementalmente — mas o consumidor já investiu tempo e esforço (sunk cost), então tolera incrementos que NÃO toleraria se mostrados de cara. Companhias aéreas, hotéis e Uber-like aplicam intensamente. Lei brasileira (CDC) exige que o preço final seja claro do início — mas execução varia. Eticamente, drip pricing TECNICAMENTE funciona (aumenta conversão) mas destrói confiança a longo prazo (Reclame Aqui, viralização negativa). Europa baniu drip em vários setores. Padrão ético: preço final TRANSPARENTE desde o primeiro toque do consumidor.',
    },
    {
      kind: 'concept',
      title: 'A linha ética em neuromarketing',
      body:
        'A trilha inteira mostrou ferramentas neurocientíficas poderosas: como ativar amígdala, dopamina, accumbens; como suprimir ínsula; como driblar S2 e falar direto com S1. Toda essa caixa de ferramentas pode operar pra DOIS lados. PERSUASÃO ÉTICA: usa pra acelerar decisões alinhadas ao INTERESSE REAL do consumidor (você quer plano de saúde bom — marketing te ajuda escolher o que cabe). MANIPULAÇÃO: usa as mesmas técnicas pra forçar decisões CONTRA o interesse (vender plano caro desnecessário, criar urgência fake, esconder taxa). Diferença prática: persuasão ética é sustentável (NPS alto, recompra, recomendação espontânea). Manipulação destrói: gera reclamação, viralização negativa, churn explosivo, processo regulatório. Cialdini publicou Pre-Suasion (2016) e Influence is Your Superpower (Zoe Chance, 2022) dedicando capítulos inteiros à fronteira ética. Resumo prático: se você não anunciaria com orgulho como sua técnica funciona, é provavelmente manipulação.',
    },
    {
      kind: 'table',
      caption: 'Pricing técnicas + neurociência subjacente + uso ético',
      headers: ['Técnica', 'Mecanismo neural', 'Aplicação ética típica'],
      rows: [
        ['Charm pricing (R$ 9,99)',     'Leitura de dígito esquerdo (S1)',          'Massa, baixo envolvimento'],
        ['Prestige pricing (R$ 100)',   'Sinaliza confiança no valor',              'Premium, luxo'],
        ['Anchoring (de R$ 599)',       'Ancoragem cognitiva',                       'Desconto real claro'],
        ['Decoy plano premium',          'Comparação relativa S1',                    'Tabela honesta de planos'],
        ['Bundling',                     'Reduz dor de pagar (1 vez)',                'Pacote com valor real'],
        ['Pagamento sem fricção',        'Suprime ativação insular',                  'UX clean, com revisão visível'],
        ['Assinatura recorrente',        'Separa consumo de pagamento',               'Cancelamento fácil + lembrete'],
        ['Drip pricing',                 'Sunk cost + ativação incremental insula',   '❌ Antiético — evitar'],
        ['Escassez fake',                'Falsa amígdala-trigger',                    '❌ Antiético — destrói confiança'],
      ],
    },
    {
      kind: 'callout',
      tone: 'note',
      title: 'Onde se aprofundar',
      body:
        'Pra ir além desse curso introdutório: livros essenciais — "Pensar Rápido e Devagar" (Kahneman), "Influence" e "Pre-Suasion" (Cialdini), "Buyology" (Martin Lindstrom — popular mas com ressalvas científicas), "Hooked" (Nir Eyal — para entender design viciante, com discussão ética em "Indistractable"). Pesquisadores e laboratórios pra acompanhar: Stanford Decision Research (Knutson), University of Michigan (Berridge), Université de Lyon (Plassmann, neuromarketing puro). Eventos anuais: Neuromarketing World Forum, ESOMAR Congress. Crítica importante: a "Brain Sells" hype dos anos 2010 exagerou capacidades de neuromarketing — leia também "Neuromarketing: The New Science of Consumer Decisions" (Genco) com olhar crítico.',
    },
    {
      kind: 'concept',
      title: 'Fechamento — o que faz neuromarketing bem usado',
      body:
        'A trilha cobriu 8 grandes blocos: cérebro triuno, sistemas 1 e 2, atenção, memória e emoção, vieses, dopamina, design visual, pricing. Esse é o "kit conceitual mínimo" pra entender qualquer campanha moderna. Mas neurociência é arma — pode ser usada com ou sem ética. Os marqueteiros que aplicam essas técnicas pra ALINHAR (entregar valor real, simplificar decisão, reduzir fricção, gerar prazer cumprido) constroem marcas duradouras de NPS alto e fidelidade real. Os que usam pra MANIPULAR (criar urgência fake, esconder taxa, vender lixo via gatilho, viciar usuários) podem ter pico de receita, mas constroem dívida reputacional que cobra com juros altos. Escolha o lado certo da força — e use a neurociência pra fazer marketing que VOCÊ teria orgulho de receber como consumidor.',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Pagar literalmente dói — Knutson (2007) mostrou em fMRI que preço ativa córtex insular (mesma região da dor física). Decisão de compra = preferência (accumbens, +) MENOS dor de pagar (ínsula, -).',
        'Charm pricing (R$ 9,99): cérebro lê dígito esquerdo primeiro, percebe como "9 e poucos" não "10". Aumento típico 5-25% em vendas. Funciona em massa/baixo envolvimento — não em premium.',
        'Prestige pricing: preços redondos (R$ 100) sinalizam confiança no valor. Premium prefere redondez; massa prefere terminação 9. Errar = posicionamento confuso.',
        'Bundling e pagamento sem fricção (Apple Pay, recurring) reduzem ativação insular ao separar consumo de ato de pagar. Trade-off ético: cancelamento fácil é obrigação moral.',
        'Linha ética: persuasão acelera decisão alinhada ao interesse real; manipulação força contra interesse. As mesmas técnicas, propósitos opostos. Marca sustentável escolhe alinhamento — manipulação destrói confiança e marca a longo prazo.',
      ],
    },
  ],
  quiz: [
    {
      question: 'O estudo de Brian Knutson (Stanford, 2007) usou fMRI durante decisões reais de compra e descobriu:',
      options: [
        'Pagar é experiência neutra neurologicamente',
        'Preço ativa o córtex insular — a MESMA região que processa dor física. Decisão de compra é "soma neural": preferência (accumbens, +) menos dor de pagar (ínsula, -)',
        'Pagar ativa apenas regiões de memória, não de dor',
        'Não há correlação entre atividade cerebral e decisão de compra',
      ],
      correct: 1,
      explanation:
        'Knutson e equipe mostraram que pagar é experiência ATIVAMENTE aversiva. A ínsula — que processa dor física, nojo, aversão — ativa quando vemos preço. A decisão de comprar emerge da "soma neural": se núcleo accumbens (desejo pelo produto) > ínsula (dor de pagar), compra. Senão, não. Notável: a atividade neural prediz a decisão com 60% mais acurácia do que perguntar à pessoa o que ela vai fazer. Isso confirma que decisões são em grande parte automáticas e pré-conscientes — o "consumidor racional" da economia clássica é mito.',
      hint: 'A região é a mesma que processa dor literal.',
    },
    {
      question: 'O estudo do MIT de Anderson & Simester (2003) testou vestidos de catálogo a US$ 34, US$ 39 e US$ 44. Qual foi o resultado contraintuitivo?',
      options: [
        'US$ 34 venderam mais — preço mais baixo sempre vence',
        'US$ 39 venderam MAIS que US$ 34 — preço terminado em 9 supera preço mais baixo. Charm pricing em ação: cérebro lê dígito esquerdo ("3 e poucos") como ancoragem dominante',
        'Os 3 preços tiveram vendas iguais',
        'US$ 44 vendeu mais por sinalizar qualidade',
      ],
      correct: 1,
      explanation:
        'Resultado clássico do charm pricing: US$ 39 vendeu MAIS que US$ 34, apesar de ser mais caro. Mecanismo: cérebro lê dígito mais à esquerda primeiro e usa como âncora ("3 e poucos") — mesmo com 9 no fim. Em produtos de baixo envolvimento (S1 decidindo rápido), 5-25% de aumento típico de venda. Importante: efeito INVERTE em premium — Patek Philippe nunca cobra $24.999, cobra $25.000. Terminação em 9 sinaliza popular/promoção, oposto de luxo. Saber em que ponto da escala aplicar (massa vs premium) é arte de pricing.',
      hint: 'Mais caro vendeu mais — por causa de qual mecanismo?',
    },
    {
      question: 'Por que serviços de assinatura recorrente (Netflix, Spotify) frequentemente geram MAIOR satisfação reportada por uso do que modelos pay-per-view do mesmo conteúdo?',
      options: [
        'Por preço efetivo menor — apenas economia',
        'A cobrança recorrente, após configurada, NÃO ativa a ínsula a cada uso. Você assiste sem dor de pagar. Pay-per-view ativa ínsula EXPLICITAMENTE a cada transação. Mesma diversão, dor neurológica diferente',
        'Conteúdo é técnicamente melhor em streaming',
        'Apenas viés cultural — sem base neurológica',
      ],
      correct: 1,
      explanation:
        'Cobrança recorrente desconecta o ato de consumir do ato de pagar. Após configurada, você usa o serviço sem ativar dor de pagar (ínsula). Em pay-per-view, cada compra reativa explicitamente "estou gastando agora" → ativação insular → menos consumo + satisfação reportada mais baixa. É o mesmo conteúdo, mas a EXPERIÊNCIA neural é totalmente diferente. Isso explica explosão dos modelos por assinatura. Lado ético: facilita esquecer assinatura ativa pagando sem usar. Por isso boas práticas (e regulação européia) exigem cancelamento fácil + lembretes — pra preservar autonomia real.',
      hint: 'O que aconteceu com a ativação insular?',
    },
    {
      question: 'Bundling (Microsoft Office: Word + Excel + PowerPoint num pacote) reduz fricção por qual mecanismo?',
      options: [
        'Apenas por desconto matemático',
        'Dispara a ativação insular UMA VEZ em vez de N vezes (se cada software fosse comprado separado). Pagar uma vez "dói" menos neurologicamente que pagar 4 vezes — mesmo se a soma for igual',
        'Bundles fazem todo software funcionar melhor',
        'Por causa de regulação antitruste',
      ],
      correct: 1,
      explanation:
        'Cada transação ativa a ínsula. Bundling consolida: 1 ativação em vez de N. Cruzeiro all-inclusive aplica o mesmo: dor 1x na compra do pacote, depois embarque consumindo sem reativar dor a cada drink. Restaurante combo (lanche + batata + refri): preço único, sensação de "deal", dor 1x. Aplicação: sempre que possível, bundle reduz fricção neural e aumenta valor percebido. Limitação ética: bundle não deve forçar consumidor a pagar por itens que não quer — princípio do "fair bundling".',
      hint: 'Pense em quantas vezes a ínsula ativa em cada modelo.',
    },
    {
      question: 'Drip pricing (preço inicial baixo + taxas adicionadas gradualmente até checkout) é eticamente problemático porque:',
      options: [
        'Sempre é ilegal em qualquer país',
        'Combina dois mecanismos psicológicos: (1) sunk cost — consumidor já investiu tempo, fica relutante em desistir; (2) ativação insular incremental — cada taxa adicional ativa pouco, então tolera o que não toleraria se mostrado de cara. Resulta em pagamento maior que o consumidor REALMENTE aceitaria com transparência',
        'É só problema de comunicação visual',
        'Funciona apenas em e-commerce, não em outros setores',
      ],
      correct: 1,
      explanation:
        'Drip pricing é eticamente problemático por explorar dois mecanismos: sunk cost (já investi tempo na compra, é difícil desistir agora) + ativação insular gradual (cada incremento pequeno passa sob o radar). Resultado: consumidor termina pagando valor que NÃO teria aceitado com transparência inicial. Aumenta conversão no curtíssimo prazo mas destrói confiança a longo prazo (Reclame Aqui, viralização). Europa baniu drip em vários setores. CDC brasileiro exige preço final transparente — execução varia. Padrão ético: preço final claro desde o primeiro toque do consumidor.',
      hint: 'Dois mecanismos psicológicos combinados — quais?',
    },
    {
      question: 'A diferença prática entre persuasão ética e manipulação em neuromarketing é:',
      options: [
        'Persuasão usa só técnicas suaves; manipulação usa técnicas fortes',
        'Persuasão alavanca neurociência pra ACELERAR decisão alinhada ao INTERESSE REAL do consumidor. Manipulação usa as MESMAS técnicas pra FORÇAR decisão CONTRA o interesse real. As ferramentas são idênticas — a intenção e o alinhamento são opostos',
        'Persuasão é legal; manipulação é sempre ilegal',
        'Não há diferença significativa — toda persuasão é manipulação',
      ],
      correct: 1,
      explanation:
        'A diferença não está nas TÉCNICAS (escassez, ancoragem, prova social — todas podem operar dos dois lados) mas no ALINHAMENTO com o interesse real do consumidor. Persuasão ética: você quer um plano de saúde bom, marketing te ajuda escolher o melhor PRA VOCÊ. Manipulação: vende plano caro desnecessário usando urgência fake e prova social inflada. Cialdini dedicou Pre-Suasion (2016) inteiro a essa fronteira. Marca sustentável escolhe alinhamento — manipulação funciona no curto prazo mas destrói confiança, gera processo regulatório e mata marca. Cialdini resumiu: "se você não anunciaria com orgulho que está usando a técnica, é manipulação".',
      hint: 'A ferramenta é a mesma — o que muda é a INTENÇÃO.',
    },
    {
      question: 'Você está montando pricing de um app de fitness premium com plano mensal e anual. Pelos princípios do módulo, qual estratégia ÉTICA é mais alinhada a neurociência?',
      options: [
        'Charm pricing R$ 29,99 mensal + R$ 199,99 anual + esconder taxa de cancelamento',
        'Pricing transparente: prestige R$ 49/mês ou R$ 399/ano (anchor faz anual parecer "menos de R$ 33/mês"), trial 7 dias grátis (endowment), checkout 1-click pra reduzir fricção (suprime ínsula), cancelamento em 2 cliques sem ligação',
        'Drip pricing — mostrar R$ 19 inicial, adicionar taxas no checkout',
        'Apenas prestige R$ 50 sem nenhum mecanismo de fricção',
      ],
      correct: 1,
      explanation:
        'Aplicação completa e ética dos princípios: prestige pricing (R$ 49 vs R$ 49,99 — premium sinaliza valor), ancoragem honesta no anual (R$ 399 vs 12×R$ 49 = R$ 588 mostrado claro), endowment via trial 7 dias (uma vez "seu", churn cai), checkout 1-click (reduz ativação insular, aumenta conversão), MAS cancelamento fácil em 2 cliques (preserva autonomia do consumidor, padrão UE). Combinação maximiza conversão E mantém ética. Alternativas com taxas escondidas ou cancelamento difícil convertem mais no curto prazo mas geram Reclame Aqui, viralização negativa e churn explosivo a longo prazo.',
      hint: 'Use TODA a neurociência — mas com transparência e respeito à autonomia.',
    },
    {
      question: 'Mensagem final mais importante da trilha de Neuromarketing aplicado:',
      options: [
        'Neurociência é mágica que faz qualquer produto vender',
        'Neurociência aplicada ao marketing é caixa de ferramentas poderosa que pode CONSTRUIR (alinhar valor real com decisão acelerada e prazerosa) ou DESTRUIR (manipular contra interesse, gerar dependência, erodir confiança). A escolha é de quem aplica — e tem custos reputacionais e regulatórios reais a longo prazo',
        'Apenas para curso técnico — não precisa preocupar com ética',
        'A ética é problema das próximas gerações, não do marketing atual',
      ],
      correct: 1,
      explanation:
        'Neurociência aplicada virou ferramenta padrão de marketing profissional — e como toda ferramenta poderosa, sua aplicação carrega responsabilidade. Você pode usá-la pra ALINHAR (entregar valor real, simplificar decisão, reduzir fricção, gerar prazer cumprido) — marcas que fazem isso constroem NPS alto, fidelidade real, recomendação espontânea, longevidade. Pode usar pra MANIPULAR (urgência fake, taxas escondidas, gatilhos predatórios, vícios) — pico de receita curto, mas dívida reputacional crescente: Reclame Aqui, viralização negativa, processo regulatório, fim da marca. A escolha é de quem aplica. Use a neurociência pra fazer marketing que VOCÊ teria orgulho de receber.',
      hint: 'A questão central é responsabilidade — não capacidade técnica.',
    },
  ],
};
