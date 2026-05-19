import type { Module } from '../types';

// Módulos 5-8 da trilha Genética Veterinária.

export const MOD_5_GENES_LETAIS: Module = {
  slug: 'genes-letais',
  num: 5,
  icon: '⚠️',
  title: 'Genes Letais',
  summary:
    'Quando um gene não só altera o fenótipo — ele mata. Os 3 tipos de genes letais, exemplos veterinários reais (Manx, Dexter, DUMPS), e conceitos críticos: fenocópias, penetrância e expressividade.',
  estimatedMin: 22,
  keyTerms: [
    { term: 'Gene Letal',                definition: 'Gene cuja presença leva à morte do portador — antes da fertilização (gamético) ou após (zigótico).' },
    { term: 'Gene letal dominante com efeito letal dominante', definition: 'AA e Aa morrem; aa vive. Extremamente raro porque a mutação se elimina rapidamente.' },
    { term: 'Gene letal dominante com efeito letal recessivo', definition: 'AA morre; Aa vive (geralmente com problemas); aa vive normal. Caso mais comum.' },
    { term: 'Gene letal recessivo',      definition: 'aa morre; AA e Aa vivem normalmente. Heterozigotos podem ser portadores assintomáticos.' },
    { term: 'Fenocópia',                 definition: 'Fenótipo de causa AMBIENTAL que copia um fenótipo de origem genética. Não é hereditário.' },
    { term: 'Penetrância',               definition: '% de indivíduos com o gene que de fato expressam o fenótipo. Vai de 0% a 100%.' },
    { term: 'Expressividade',            definition: 'Variação na INTENSIDADE com que o gene se manifesta entre indivíduos.' },
    { term: 'Pleiotropia',               definition: 'Quando um único gene afeta mais de uma característica simultaneamente.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Em 1905, Cuénot fez um cruzamento de ratos amarelos × amarelos e esperou ¾ amarelos : ¼ não amarelos (proporção 3:1 clássica). Mas obteve 2/3 amarelos : 1/3 não amarelos. Castle e Little, anos depois, descobriram por quê: os homozigotos AyAy MORRIAM antes do nascimento. Esse foi o primeiro gene letal descrito. Em medicina veterinária, identificar genes letais em rebanhos é fundamental — eles geram aborto, natimorto, deformações graves e perdas econômicas significativas.',
    },
    {
      kind: 'concept',
      title: 'Gene letal dominante com efeito letal dominante',
      body:
        'O alelo dominante A é letal. AA e Aa morrem. Apenas aa sobrevive. Esses casos são EXTREMAMENTE raros porque, ao matar o portador, o alelo se elimina rapidamente da população — não há tempo para identificá-lo.',
    },
    {
      kind: 'concept',
      title: 'Gene letal dominante com efeito letal recessivo',
      body:
        'Aqui é o tipo mais "estudável" e clinicamente relevante. AA morre. Aa SOBREVIVE, mas geralmente com alguma anomalia. aa é normal. Diversos exemplos veterinários conhecidos:',
    },
    {
      kind: 'example',
      title: 'Acondroplasia em bovinos da raça Dexter',
      body:
        'Genótipo AA: morte embrionária ("bulldog calves"). Aa: sobrevive com coluna vertebral curta, hérnia inguinal, face arredondada e proeminente, palato fendido, patas muito curtas. aa: animal normal. Por isso a raça Dexter mantém o típico fenótipo "perna curta" — todos os Dexters reconhecidos são Aa.',
    },
    {
      kind: 'example',
      title: 'Galinha rastejante (gene C)',
      body:
        'CC: letal (morte embrionária). Cc: aves com pernas curtas e tortas ("rastejantes"). cc: aves normais. Cruzamentos entre rastejantes × rastejantes geram 2/3 rastejantes : 1/3 normais (por causa da perda dos CC).',
    },
    {
      kind: 'example',
      title: 'Síndrome Manx em gatos',
      body:
        'Alelo M dominante letal em homozigose. MM: feto morre na 5ª semana com malformações no SNC. Mm: gato Manx (sem cauda ou com cauda deformada). mm: cauda normal. Classificações de Manx pelo grau de deformidade: rumpy (sem vértebras), rumpy riser, stumpy (toco), longie (cauda curta).',
    },
    {
      kind: 'concept',
      title: 'Gene letal recessivo com efeito letal recessivo',
      body:
        'AA e Aa vivem normalmente. Apenas aa morre. Esse padrão é muito comum em doenças metabólicas hereditárias. Exemplo: DUMPS em bovinos Holandeses.',
    },
    {
      kind: 'example',
      title: 'DUMPS — Deficiência da Uridina Monofosfato Sintetase',
      body:
        'Bovinos da raça Holandesa. A enzima UMPS é crucial para a síntese de DNA e RNA (via dos nucleotídeos pirimidínicos). Animais aa não a produzem — morrem na fase embrionária entre 30 e 60 dias de gestação, gerando retorno ao estro. Heterozigotos Aa são portadores: têm deficiência parcial da enzima e acumulam ácido orótico no sangue, urina e leite.',
      metadata: 'Identificação clínica: ácido orótico elevado em portadores Aa.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Fenocópia — cuidado pra não confundir',
      body:
        'Fenótipo de causa ambiental que IMITA o fenótipo genético. Exemplo: injeção de ácido bórico em ovos galados em fase específica do desenvolvimento gera aves "rastejantes" idênticas ao fenótipo Cc — mas a alteração NÃO é hereditária. Em pastos da Austrália, sementes do gênero Swainsona contêm um inibidor da enzima alfa-manosidase, causando sintomas idênticos à manosidose hereditária bovina (homozigose aa). Em clínica veterinária, distinguir fenocópia de doença genética muda totalmente o prognóstico e a conduta.',
    },
    {
      kind: 'concept',
      title: 'Penetrância e Expressividade',
      body:
        'Penetrância é QUANTOS portadores manifestam o gene. Polidactilia em aves: gene dominante mas com penetrância de ~60% — só 60% das aves que carregam o gene manifestam dedos extras. Expressividade é a INTENSIDADE da manifestação — uniforme (todos iguais) ou variável (intensidades diferentes em indivíduos diferentes). Exemplo: sindactilia ("casco de mula") em suínos e bovinos — autossômica dominante em suíno, recessiva em bovino, com expressividade variável.',
    },
    {
      kind: 'concept',
      title: 'Pleiotropia',
      body:
        'Um único gene afeta mais de uma característica. Clássico exemplo veterinário: gene "Polled" (mocho) em bovinos — afeta presença/ausência de chifres E intersexualidade. Vacas PP são estéreis e apresentam características de intersexualidade. Vacas Pp são férteis. Vacas pp (chifrudas) são normais e férteis. A escolha por mocho como característica desejável exige cruzamento controlado pra evitar PP estéreis.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Aconselhamento genético — aplicação prática',
      body:
        'Suponha gene dominante com penetrância 60%. Se um animal afetado é heterozigoto (Aa), passa o gene para 50% dos filhos. Mas só 60% desses 50% vai manifestar a doença. Risco real de filho afetado = 50% × 60% = 30%. Esse cálculo é essencial em aconselhamento genético para criadores.',
    },
    {
      kind: 'summary',
      bullets: [
        'Gene letal dominante c/ efeito dominante: AA, Aa morrem (raro).',
        'Gene letal dominante c/ efeito recessivo: AA morre, Aa vive c/ anomalia (Dexter, Manx, rastejante).',
        'Gene letal recessivo: só aa morre (DUMPS).',
        'Fenocópia: fenótipo ambiental indistinguível do genético — NÃO é hereditário.',
        'Penetrância: % de portadores que expressam. Expressividade: intensidade da expressão.',
        'Pleiotropia: um gene afeta múltiplas características (Polled bovino).',
      ],
    },
  ],
  quiz: [
    {
      question: 'Em ratos, cruzamentos amarelos (Aya) × amarelos (Aya) geram 2/3 amarelos : 1/3 não amarelos. Por quê?',
      options: [
        'Mutação durante a gestação',
        'Genótipo AyAy é letal — morre no embrião',
        'O alelo Ay é recessivo',
        'A meiose não funciona em homozigotos',
      ],
      correct: 1,
      explanation: 'AyAy é letal embrionário. Por isso a proporção 1:2:1 esperada vira 0:2:1 → 2/3 Aya : 1/3 aa.',
      hint: 'Comece pelo esperado: cruzamento Aya × Aya deveria dar 1 AyAy : 2 Aya : 1 aa. Agora pense — se uma das classes some, a proporção 1:2:1 vira algo diferente. Faça a conta: tirando os AyAy (=0), sobra 2 Aya : 1 aa entre os nascidos = 2/3 amarelos : 1/3 não-amarelos.',
    },
    {
      question: 'Em bovinos Dexter com acondroplasia, qual o genótipo dos animais comerciais ("Dexter típico")?',
      options: ['AA (homozigoto dominante)', 'Aa (heterozigoto)', 'aa (homozigoto recessivo)', 'XX/XY'],
      correct: 1,
      explanation: 'AA morre (bulldog calf). aa é animal normal sem o fenótipo Dexter. Todos os Dexters reconhecidos são Aa.',
      hint: 'A acondroplasia do Dexter é classificada como "gene letal dominante COM EFEITO LETAL RECESSIVO" — só os homozigotos dominantes morrem; os heterozigotos sobrevivem com o fenótipo característico. Quem sobrevive com fenótipo "Dexter típico" tem qual genótipo?',
    },
    {
      question: 'DUMPS em bovinos Holandeses se classifica como:',
      options: [
        'Gene letal dominante com efeito letal dominante',
        'Gene letal dominante com efeito letal recessivo',
        'Gene letal recessivo com efeito letal recessivo',
        'Mutação somática não hereditária',
      ],
      correct: 2,
      explanation: 'DUMPS é recessivo: apenas aa morre. Aa é portador (com acúmulo de ácido orótico detectável no leite/sangue).',
      hint: 'Quem morre na DUMPS? Apenas os homozigotos recessivos (aa) — os heterozigotos Aa são portadores assintomáticos (com ácido orótico elevado no leite/sangue, detectável em teste). Quando SÓ os recessivos em homozigose morrem, classifica-se o gene como letal recessivo.',
    },
    {
      question: 'Um gato Manx vivo é necessariamente:',
      options: ['MM', 'Mm', 'mm', 'Pode ser qualquer um dos três'],
      correct: 1,
      explanation: 'MM é letal embrionário. mm é cauda normal. Todo Manx vivo é heterozigoto Mm.',
      hint: 'Mesma lógica do Dexter: o alelo M é dominante mas letal em homozigose. MM morre na 5ª semana. mm não tem o fenótipo Manx (cauda normal). Se o gato está VIVO E é Manx, sobra qual genótipo?',
    },
    {
      question: 'O que é fenocópia?',
      options: [
        'Cópia exata do genótipo materno',
        'Fenótipo de causa ambiental que imita um fenótipo de origem genética — sem ser hereditário',
        'Mutação espontânea',
        'Sinônimo de pleiotropia',
      ],
      correct: 1,
      explanation: 'Fenocópia é fenótipo de origem AMBIENTAL idêntico ao genético — NÃO é hereditário. Crucial distinguir em clínica.',
      hint: 'Decomponha a palavra: feno- (fenótipo) + -cópia (imitação). É algo que IMITA o aspecto, mas a causa é outra. Pense no exemplo das galinhas: injeção de ácido bórico produz fenótipo "rastejante" idêntico ao genético — mas o animal não passa isso pra prole. Não confunda com pleiotropia (1 gene, vários efeitos).',
    },
    {
      question: 'Penetrância de 60% significa:',
      options: [
        'O gene se manifesta com 60% de intensidade em cada portador',
        '60% dos indivíduos que carregam o gene manifestam o fenótipo correspondente',
        'O gene é 60% dominante',
        'Há 60% de chance de o filho herdar',
      ],
      correct: 1,
      explanation: 'Penetrância é a % de PORTADORES do gene que de fato exibem o fenótipo. Expressividade é a intensidade.',
      hint: 'Penetrância responde uma pergunta de "quantos?": dos animais que CARREGAM o gene, quantos MOSTRAM o fenótipo? É binário (mostra ou não mostra). Não confunda com expressividade, que pergunta "quão forte?" (a INTENSIDADE em quem manifestou).',
    },
  ],
};

export const MOD_6_NAO_ALELOS: Module = {
  slug: 'interacao-genica-entre-nao-alelos',
  num: 6,
  icon: '🧩',
  title: 'Interação Gênica entre Não Alelos',
  summary:
    'Quando dois ou mais genes em LOCI DIFERENTES interagem para gerar um fenótipo. Os 4 tipos clássicos: complementar, multiplicada, epistática dominante e epistática recessiva.',
  estimatedMin: 24,
  keyTerms: [
    { term: 'Interação gênica entre não-alelos', definition: 'Quando dois ou mais pares de genes (em loci diferentes) atuam juntos para determinar uma característica.' },
    { term: 'Interação complementar',            definition: 'Dois genes COMPLEMENTAM-SE para gerar fenótipos novos. Razão F2: 9:3:3:1.' },
    { term: 'Complementar com fusão',            definition: 'Variante onde as duas classes "3" se fundem num único fenótipo intermediário. Razão F2: 9:6:1 (pelagem em suínos).' },
    { term: 'Interação multiplicada',            definition: 'Os dois genes têm o mesmo efeito; juntos ou separados produzem o mesmo fenótipo. F2: 15:1.' },
    { term: 'Epistasia',                         definition: 'Um gene MASCARA a expressão de outro gene não-alelo.' },
    { term: 'Epistasia dominante (inibidora)',   definition: 'O alelo DOMINANTE de um gene impede a expressão de outro. F2: 13:3.' },
    { term: 'Epistasia recessiva (suplementar)', definition: 'O genótipo HOMOZIGOTO RECESSIVO de um gene impede a expressão de outro. F2: 9:3:4.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Até agora, cada característica vinha de UM par de alelos. Mas muitas características reais resultam da interação entre MÚLTIPLOS genes em loci diferentes. O exemplo clássico é o tipo de crista em galinhas: 4 fenótipos diferentes (rosa, ervilha, noz, serra) surgem da interação entre apenas 2 pares de genes.',
    },
    {
      kind: 'concept',
      title: 'Interação Complementar — razão 9:3:3:1',
      body:
        'Dois genes se COMPLEMENTAM gerando fenótipos novos. Em galinhas: gene R (crista rosa) × gene E (crista ervilha). RrEe → crista NOZ (forma totalmente nova). rree → crista SERRA. F2: 9/16 noz (R_E_) + 3/16 rosa (R_ee) + 3/16 ervilha (rrE_) + 1/16 serra (rree).',
      metadata: 'Razão fenotípica F2: 9:3:3:1',
    },
    {
      kind: 'example',
      title: 'Cor de pelagem em equinos — interação complementar',
      body:
        'Genes A (preto) e B (alazã). aaBB = preto. AAbb = alazã. AaBb (F1) = baio (cor nova). F2: 9/16 baio (A_B_) + 3/16 preto (aaB_) + 3/16 alazã (A_bb) + 1/16 castanho (aabb). Quatro fenótipos a partir de 2 pares de genes.',
    },
    {
      kind: 'concept',
      title: 'Interação Complementar com Fusão — razão 9:6:1',
      body:
        'Variante da interação complementar onde TRÊS classes fenotípicas resultam de pares de combinações que se "fundem" — qualquer dominante ISOLADO produz o MESMO fenótipo intermediário. As duas classes 3 (A_bb e aaB_) fundem-se numa única classe fenotípica de tamanho 6/16. Razão F2 distintiva: 9:6:1.',
      metadata: 'Razão fenotípica F2: 9:6:1 (3 fenótipos, não 4)',
    },
    {
      kind: 'example',
      title: 'Cor de pelagem em suínos — complementar com fusão (9:6:1)',
      body:
        'Genes A e B. AABB = pelagem vermelha. aabb = pelagem branca. F1 (AaBb) = 100% vermelha. F2 = 9/16 vermelha (A_B_) + 6/16 amarelo-suja (A_bb + aaB_) + 1/16 branca (aabb). Note que A_bb e aaB_ caem na MESMA classe (amarelo-suja) — daí a "fusão" e a razão 9:6:1 em vez de 9:3:3:1.',
    },
    {
      kind: 'concept',
      title: 'Interação Multiplicada — razão 15:1',
      body:
        'Genes têm efeitos REDUNDANTES — basta UM deles estar presente em forma dominante para gerar o fenótipo. Exemplo: presença de penas nos pés das galinhas. Gene A ou Gene B causa presença. F2: 15/16 com penas (qualquer combinação com pelo menos 1 dominante) + 1/16 sem penas (aabb).',
      metadata: 'Razão fenotípica F2: 15:1',
    },
    {
      kind: 'concept',
      title: 'Epistasia Dominante (Inibidora) — razão 13:3',
      body:
        'O alelo dominante de um gene IMPEDE a expressão de outro gene não-alelo. Em galinhas Leghorn: gene C (penas coloridas) é mascarado pelo gene dominante I (inibidor). C_I_ = brancas (I inibe a cor). C_ii = coloridas. cc__ = brancas (sem C, nada a manifestar). F2: 13/16 brancas + 3/16 coloridas.',
      metadata: 'Razão fenotípica F2: 13:3',
    },
    {
      kind: 'example',
      title: 'Plumagem em galinhas — epistasia dominante',
      body:
        'Gene A: plumagem preta/vermelha. Gene B: inibidor — quando dominante, força plumagem BRANCA, independente do gene A. AAbb (preta/vermelha) × aaBB (branca pelo inibidor). F1 = 100% branca (AaBb, com B inibidor). F2 = 13/16 branca + 3/16 preta/vermelha (A_bb).',
    },
    {
      kind: 'concept',
      title: 'Epistasia Recessiva (Suplementar) — razão 9:3:4',
      body:
        'O genótipo HOMOZIGOTO RECESSIVO de um gene impede a expressão de outro. Exemplo: pelagem em cães Labrador. Gene C (preto > marrom): C_ preto, cc marrom. Gene E (permite expressão da cor): ee impede toda cor — cão fica DOURADO independente do gene C. F2: 9/16 pretos (C_E_) + 3/16 marrons (ccE_) + 4/16 dourados (C_ee + ccee).',
      metadata: 'Razão fenotípica F2: 9:3:4',
    },
    {
      kind: 'table',
      caption: 'Resumo: razões fenotípicas F2 por tipo de interação',
      headers: ['Tipo de interação', 'Razão F2', 'Exemplo'],
      rows: [
        ['Sem interação (Mendel)',            '9:3:3:1', 'Ervilhas amarelas/lisas vs verdes/rugosas'],
        ['Complementar',                       '9:3:3:1', 'Crista em galinhas (rosa, ervilha, noz, serra)'],
        ['Complementar c/ fusão',              '9:6:1',   'Pelagem em suínos'],
        ['Multiplicada',                       '15:1',    'Penas nas patas em galinhas'],
        ['Epistasia dominante (inibidora)',    '13:3',    'Plumagem branca em galinhas'],
        ['Epistasia recessiva (suplementar)',  '9:3:4',   'Pelagem Labrador (preto/marrom/dourado)'],
      ],
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Por que isso importa em prática veterinária',
      body:
        'Criadores frequentemente cruzam dois animais com pelagens X e Y esperando filhotes intermediários — e ficam surpresos quando nasce uma cor "inesperada". A maioria desses casos é interação gênica entre não-alelos. Entender a razão da interação ajuda a planejar acasalamentos com previsibilidade de cor.',
    },
    {
      kind: 'summary',
      bullets: [
        'Interação gênica = >1 par de genes determina UMA característica.',
        'Complementar (9:3:3:1): genes complementam-se gerando 4 fenótipos (crista em galinhas).',
        'Complementar com fusão (9:6:1): 3 fenótipos — as duas classes "3" fundem-se (pelagem em suínos).',
        'Multiplicada (15:1): qualquer dominante gera o fenótipo.',
        'Epistasia dominante (13:3): alelo dominante de um gene inibe o outro.',
        'Epistasia recessiva (9:3:4): genótipo recessivo de um gene impede o outro.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Em galinhas, qual a razão fenotípica F2 esperada na interação entre cristas rosa e ervilha?',
      options: ['3:1', '9:3:3:1', '15:1', '13:3'],
      correct: 1,
      explanation: 'Interação complementar gera razão 9:3:3:1 (noz, rosa, ervilha, serra).',
      hint: 'Repare: a interação complementar mantém a mesma RAZÃO da 2ª Lei (9:3:3:1), mas o significado dos 4 fenótipos muda — em vez de "duplo dominante/dominante de um/dominante de outro/duplo recessivo", aparecem 4 tipos QUALITATIVAMENTE diferentes de crista (noz, rosa, ervilha, serra). Memorize as razões: 9:3:3:1, 9:6:1, 9:3:4, 13:3, 15:1 — cada uma é assinatura de um tipo de interação.',
    },
    {
      question: 'Em Labrador, um cão de genótipo ccee é:',
      options: ['Preto', 'Marrom', 'Dourado', 'Branco'],
      correct: 2,
      explanation: 'ee mascara a expressão de C — independente de C ou c, o cão fica dourado. Epistasia recessiva.',
      hint: 'No Labrador, o gene E é o "gatekeeper" da cor. Quando ee aparece, ele BLOQUEIA a expressão do gene C, não importa se for CC, Cc ou cc — o cão vira dourado. Esse é o conceito de epistasia recessiva (volte na seção sobre epistasia no módulo 6).',
    },
    {
      question: 'A razão 13:3 na F2 é característica de:',
      options: [
        'Interação multiplicada',
        'Epistasia dominante (gene inibidor dominante)',
        'Epistasia recessiva',
        'Complementar com fusão',
      ],
      correct: 1,
      explanation: '13:3 é a assinatura da epistasia dominante: o alelo dominante de um gene inibe outro gene não-alelo.',
      hint: 'Quando o alelo DOMINANTE de um gene inibe a expressão do outro, qualquer classe que contenha esse dominante (I_) cai junto com a duplo-recessiva (iicc) num fenótipo só. Some 9 (C_I_) + 3 (ccI_) + 1 (ccii) e veja qual a razão resultante. As outras razões correspondem a outras interações.',
    },
    {
      question: 'Em galinhas, presença ou ausência de penas nas patas gera F2 com razão 15:1. Esse é um exemplo de:',
      options: ['Complementar', 'Multiplicada', 'Epistasia dominante', 'Epistasia recessiva'],
      correct: 1,
      explanation: 'Quando qualquer dominante de A ou B gera o mesmo fenótipo, há interação multiplicada — F2 = 15 com penas : 1 sem penas.',
      hint: 'Pense em REDUNDÂNCIA: os dois genes fazem a mesma coisa, então basta UM deles ter alelo dominante para o fenótipo aparecer. Quantas classes do quadro de Punnett têm pelo menos um dominante? 15/16. Quantas são duplo-recessivas (aabb)? 1/16. Daí o 15:1.',
    },
    {
      question: 'Por que um criador de cães Labrador pode obter filhotes dourados de pais marrons?',
      options: [
        'Mutação ambiental',
        'Pais marrons (ccE_) podem ser heterozigotos para E. Se ambos forem ccEe, geram ¼ ccee (dourados)',
        'Os filhotes não são daquele pai',
        'A genética dourada só vem de mãe',
      ],
      correct: 1,
      explanation: 'Em Labrador, o dourado (ee) mascara C/c. Pais ccEe x ccEe podem gerar ccee = dourados, mesmo sendo marrons.',
      hint: 'Marrom no Labrador é ccE_ — o E_ "permitiu" a cor aparecer. O "_" pode estar escondendo um Ee. Se ambos pais forem ccEe, monte o Punnett apenas para o gene E (Ee × Ee). Vai sair 1/4 ee, que combinado com cc do gene C, gera o fenótipo dourado.',
    },
    {
      question: 'Em suínos, o cruzamento entre vermelhos AaBb × AaBb (F1) gera F2 com pelagem vermelha, amarelo-suja e branca em razão 9:6:1. Que tipo de interação explica essa razão (e por que NÃO é 9:3:3:1)?',
      options: [
        'Epistasia recessiva — ee mascara C',
        'Interação multiplicada — qualquer dominante gera o mesmo fenótipo',
        'Complementar com fusão — A_bb e aaB_ produzem o MESMO fenótipo intermediário (amarelo-suja), fundindo-se em 6/16',
        'Codominância — A e B se expressam separadamente',
      ],
      correct: 2,
      explanation: 'Complementar com fusão (9:6:1): A_B_ vermelha (9/16), A_bb e aaB_ fundem-se em amarelo-suja (6/16), aabb branca (1/16). Diferente da complementar pura (9:3:3:1), aqui um dominante isolado produz fenótipo intermediário idêntico em ambos os casos — por isso as duas classes "3" se fundem em uma "6".',
      hint: 'Compare com a razão clássica da 2ª Lei: 9:3:3:1 tem QUATRO fenótipos distintos. Aqui só aparecem TRÊS (vermelha, amarelo-suja, branca). Quando duas classes "3" caem no mesmo fenótipo intermediário, elas se fundem em uma "6" — daí 9:6:1. Reveja as razões-assinatura: 9:3:3:1 (complementar pura), 9:6:1 (com fusão), 9:3:4 (epistasia recessiva), 13:3 (epistasia dominante), 15:1 (multiplicada).',
    },
  ],
};

export const MOD_7_GATOS: Module = {
  slug: 'interacao-genica-pelagem-gatos',
  num: 7,
  icon: '🐈',
  title: 'Interação Gênica em Gatos — herança da cor de pelagem',
  summary:
    'O sistema de 8 loci que determina cor, padrão e desenho da pelagem felina. Loco B, A, D, S, T, C, W, O — e por que a casco-de-tartaruga é quase sempre fêmea.',
  estimatedMin: 20,
  keyTerms: [
    { term: 'Loco B',     definition: 'Cor base: B_ = preto, bb = marrom.' },
    { term: 'Loco A',     definition: 'Padrão aguti: A_ = aguti (selvagem); aa = não aguti.' },
    { term: 'Loco D',     definition: 'Diluição: D_ = cor intensa; dd = cor diluída.' },
    { term: 'Loco S',     definition: 'Manchas brancas: S_ = irregulares; ss = sem manchas.' },
    { term: 'Loco T',     definition: 'Tabby (tigrado): determina o padrão de listras/manchas escuras.' },
    { term: 'Loco C',     definition: 'Pigmentação total: C > c^ch > c^b ≥ c^s > c. Inclui colourpoint siamês.' },
    { term: 'Loco W',     definition: 'Branco dominante: W = branco total (epistático), ww = cor.' },
    { term: 'Loco O',     definition: 'Laranja ligado ao X: O = laranja, o = preto/marrom.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'O gato é o melhor "exercício de genética" da medicina veterinária — porque sua pelagem combina interação gênica entre não-alelos, alelismo múltiplo, epistasia, herança ligada ao sexo e diluição. Tudo num só animal. Entender os 8 loci principais resolve 95% dos cruzamentos felinos do dia a dia.',
    },
    {
      kind: 'concept',
      title: 'Loco B — preto ou marrom',
      body:
        'O loco mais básico. B (preto) domina b (marrom/chocolate). B_ = pelagem preta. bb = pelagem marrom (chocolate). Não confundir: este loco define a COR pigmentar (eumelanina). Outros loci modulam intensidade, distribuição e padrão.',
    },
    {
      kind: 'concept',
      title: 'Loco A — aguti vs. não aguti',
      body:
        'O padrão aguti é a pelagem selvagem com faixas alternadas de eumelanina e feomelanina em cada pelo (típico do gato-de-bengala). A_ = aguti (com bandas). aa = não aguti (cor sólida sem bandas). Para o tabby aparecer, é necessário ter A_ — em aa, as listras ficam mascaradas.',
    },
    {
      kind: 'concept',
      title: 'Loco D — diluição',
      body:
        'Determina a INTENSIDADE da cor. D_ = cor intensa. dd = cor diluída. Preto + dd = azul (cinza-azulado). Marrom + dd = lilás. Laranja + dd = creme. A diluição vale para qualquer cor de base.',
    },
    {
      kind: 'concept',
      title: 'Loco S — manchas brancas',
      body:
        'S_ = manchas brancas irregulares (peito, patas, barriga, focinho). ss = pelagem sem manchas brancas. O grau das manchas é influenciado por outros modificadores — desde "bicolor" até "manchinha discreta no peito".',
    },
    {
      kind: 'concept',
      title: 'Loco T — tabby (tigrado/rajado)',
      body:
        'Determina o padrão de listras escuras transversais. Alelos: T^a > T > t^b. T^aT^a = mackerel (listras finas paralelas). T^aT = listras nas patas e cauda. t^b t^b = blotched (manchas largas tipo mármore). Esse loco SÓ se manifesta em gatos com A_ (aguti).',
    },
    {
      kind: 'concept',
      title: 'Loco C — pigmentação total (alelismo múltiplo)',
      body:
        'Série alélica: C > c^ch > c^b ≥ c^s > c. C_ = pigmentação total (preto ou marrom uniforme). c^ch = chinchila (prateado). c^b = birmanês (extremidades pigmentadas). c^s = siamês (acromelanismo — só as pontas pigmentadas, sensível à temperatura). cc = albino (sem pigmento, olhos vermelhos).',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Siamês — acromelanismo (curiosidade clínica)',
      body:
        'O alelo c^s do siamês codifica uma tirosinase termo-sensível: funciona apenas em temperaturas mais baixas. Por isso só as EXTREMIDADES (orelhas, focinho, patas, cauda) são pigmentadas — onde o corpo é mais frio. Gatinhos siameses nascem TODOS brancos (útero quente) e vão escurecendo as extremidades. Em climas frios, o siamês fica MAIS escuro; em climas quentes, MAIS claro.',
    },
    {
      kind: 'concept',
      title: 'Loco W — branco dominante (epistático)',
      body:
        'W = branco TOTAL com olhos amarelos, verdes ou azuis. ww = cor normal. W é epistático: mascara TODOS os outros loci. Gato Ww parece branco mesmo se for geneticamente preto, marrom ou laranja. Surdez é comum em gatos brancos com olhos azuis devido à associação do gene W com defeitos na cóclea.',
    },
    {
      kind: 'concept',
      title: 'Loco O — laranja ligado ao cromossomo X',
      body:
        'Localizado no cromossomo X. O = laranja. o = preto/marrom. Macho X^O Y = laranja. Macho X^o Y = preto. Fêmea X^O X^O = laranja. Fêmea X^o X^o = preta. Fêmea X^O X^o = CASCO DE TARTARUGA — mosaico de manchas pretas e laranjas devido à inativação aleatória de um dos cromossomos X (corpúsculo de Barr / lyonização).',
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Por que macho casco-de-tartaruga é quase impossível',
      body:
        'Para um macho ser casco-de-tartaruga ele precisaria de DOIS cromossomos X (X^O X^o Y) — uma síndrome rara similar a Klinefelter, geralmente associada à esterilidade. Por isso, regra clínica: gato calico/tortie macho = ESTÉRIL na quase totalidade dos casos.',
    },
    {
      kind: 'summary',
      bullets: [
        '8 loci principais: B, A, D, S, T, C, W, O.',
        'B define cor base (preto/marrom). D modula intensidade (intensa/diluída).',
        'A controla padrão aguti — necessário pro tabby aparecer.',
        'C tem alelismo múltiplo (C > c^ch > c^b > c^s > c) — inclui siamês termo-sensível.',
        'W é epistático: mascara tudo. Gato branco c/ olho azul → risco de surdez.',
        'O é ligado ao X: explica por que casco-de-tartaruga é (quase) sempre fêmea.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Por que um gato siamês nasce branco e fica com extremidades escuras conforme cresce?',
      options: [
        'Mutação durante o crescimento',
        'O alelo c^s codifica tirosinase termo-sensível — só pigmenta áreas mais frias do corpo',
        'Pelo desgaste das extremidades',
        'Apenas dieta',
      ],
      correct: 1,
      explanation: 'O acromelanismo siamês é uma tirosinase termo-sensível: pigmenta só onde a temperatura corporal é mais baixa (extremidades).',
      hint: 'Pergunta-chave: o que as ÁREAS QUE PIGMENTAM têm em comum (orelhas, focinho, patas, cauda)? Todas são MAIS FRIAS que o tronco. O alelo c^s codifica uma enzima sensível à TEMPERATURA — funciona melhor em áreas frias. No útero quente, o filhote nasce todo branco. Não é mutação somática nem dieta — é bioquímica do alelo.',
    },
    {
      question: 'Qual o genótipo correspondente ao gato casco-de-tartaruga (calico/tortie)?',
      options: [
        'X^O Y (macho)',
        'X^O X^O (fêmea homozigota)',
        'X^O X^o (fêmea heterozigota)',
        'ww X^O X^o',
      ],
      correct: 2,
      explanation: 'Casco-de-tartaruga = fêmea heterozigota X^O X^o. A inativação aleatória de um X gera o mosaico característico.',
      hint: 'O gene O (laranja) está no cromossomo X. Para ter manchas PRETAS e LARANJAS no mesmo animal, é preciso ter os dois alelos (O e o) — ou seja, dois cromossomos X com alelos diferentes. Em qual sexo isso é comum? E qual fenômeno (lyonização / corpúsculo de Barr) gera o mosaico?',
    },
    {
      question: 'Gato W_ é:',
      options: [
        'Sempre cinza',
        'Branco — W é dominante e epistático, mascara qualquer cor',
        'Apenas albino',
        'Sempre estéril',
      ],
      correct: 1,
      explanation: 'W é epistático sobre todos os outros loci. Gato Ww já parece branco. Diferente de albino (cc) — o branco W ainda produz melanina.',
      hint: 'W é dominante E epistático — basta um alelo W para o gato ficar branco, mascarando TODOS os outros loci de cor. Não confunda com albino (cc), que tem deficiência de tirosinase e olhos vermelhos. O gato W_ produz melanina, mas ela não chega ao pelo. Lembre da associação clínica: W_ + olhos azuis = risco de surdez.',
    },
    {
      question: 'Por que macho calico é raro?',
      options: [
        'Por causa do clima',
        'Precisa de 2 cromossomos X (X^O X^o Y) — síndrome similar a Klinefelter, geralmente estéril',
        'Mutação somática',
        'Não existe',
      ],
      correct: 1,
      explanation: 'Casco-de-tartaruga requer X^O e X^o no mesmo animal — fêmeas XX normais ou machos com X extra (geralmente estéreis).',
      hint: 'O macho normal é XY — só tem UM cromossomo X. Mas o gene O fica no X. Logo, para um macho ter dois alelos diferentes (O e o), ele precisaria de DOIS X. Que síndrome em humanos tem cariótipo XXY? Esse padrão também ocorre em gatos e geralmente vem com esterilidade.',
    },
    {
      question: 'O padrão tabby (listras/manchas) SÓ aparece em gatos com genótipo:',
      options: ['A_ (aguti)', 'aa (não aguti)', 'bb (marrom)', 'ww (não branco)'],
      correct: 0,
      explanation: 'O loco T só se manifesta se o gato for A_ (aguti). Em aa o padrão tabby fica mascarado pela cor sólida.',
      hint: 'O padrão aguti é a "tela" sobre a qual o tabby pinta as listras. Sem aguti (aa = não-aguti = cor sólida), não tem o efeito de bandas alternadas em cada pelo onde o tabby pode aparecer. Pense em série: aguti (loco A) é PRÉ-REQUISITO para o tabby (loco T) aparecer.',
    },
  ],
};

export const MOD_8_MAMIFEROS: Module = {
  slug: 'cor-pelagem-mamiferos',
  num: 8,
  icon: '🐕',
  title: 'Cor de Pelagem em Mamíferos — caso cães',
  summary:
    'Os 10 loci principais que determinam a cor de pelagem em cães (e mamíferos em geral). Eumelanina, feomelanina, máscara, merle, brindle, diluição, manchas — explicados.',
  estimatedMin: 22,
  keyTerms: [
    { term: 'Eumelanina',  definition: 'Pigmento responsável pelas cores PRETO e CASTANHO/MARROM.' },
    { term: 'Feomelanina', definition: 'Pigmento responsável pelas cores AMARELO, BRONZE/TAN e VERMELHO.' },
    { term: 'Melanócitos', definition: 'Células que produzem os melanossomas (depósitos de melanina) — depositados nos pelos.' },
    { term: 'Loco C (TYR)',  definition: 'Produção de tirosinase. C > c^ch > c. Alelos: C_ pigmento normal, c^ch_ diluído, cc albino.' },
    { term: 'Loco B (TYRP1)', definition: 'Concentração de eumelanina. B_ preto, bb marrom/chocolate.' },
    { term: 'Loco A (ASIP)',  definition: 'Distribuição de eumelanina e feomelanina. Série alélica: a^y > a^w > a^t > a.' },
    { term: 'Loco E (MC1R)',  definition: 'Extensão da eumelanina. E^m = máscara preta. E = normal. e = bloqueia eumelanina.' },
    { term: 'Loco K',         definition: 'Cor preta dominante e brindle. K^B = preto dominante, K^br = brindle (tigrado), k^y = expressão do loco A.' },
    { term: 'Loco D',         definition: 'Diluição. D_ intensa, dd diluída (azul ou isabela).' },
    { term: 'Loco I',         definition: 'Diluição de feomelanina (em animais ee). I_ normal, ii diluído (creme).' },
    { term: 'Loco S',         definition: 'Manchas brancas. S > S^i > S^p > s^W (de uniforme a animal todo branco).' },
    { term: 'Loco T',         definition: 'Aparecimento de pintas pigmentadas em áreas brancas (ticking).' },
    { term: 'Loco M',         definition: 'Merle — distribuição aleatória do pigmento. MM letal/sub-letal. Mm = merle saudável. mm = normal.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Os mamíferos produzem dois pigmentos: eumelanina (preto/marrom) e feomelanina (amarelo/vermelho). Tudo o que vemos como "cor de pelagem" é resultado de QUAIS pigmentos foram produzidos, em QUE QUANTIDADE e em QUE DISTRIBUIÇÃO no pelo. Cerca de 10 loci controlam isso em mamíferos — e a interação entre eles gera centenas de combinações de pelagem possíveis. Vamos focar nos cães porque são o caso mais estudado.',
    },
    {
      kind: 'concept',
      title: 'Eumelanina × Feomelanina',
      body:
        'Eumelanina = preto/marrom. Feomelanina = amarelo/vermelho/bronze. Ambas são produzidas por melanócitos via tirosinase. Quase todos os 10 loci atuam regulando: 1) se há produção, 2) qual tipo, 3) onde no corpo, 4) quanto.',
    },
    {
      kind: 'concept',
      title: 'Loco B — preto ou chocolate',
      body:
        'B_ = preto. bb = marrom/chocolate/fígado. É o equivalente direto ao loco B dos gatos, mas pra cães. Labrador chocolate (raça que ficou famosa) = bb.',
    },
    {
      kind: 'concept',
      title: 'Loco A — distribuição de pigmentos (série alélica)',
      body:
        'Hierarquia: a^y > a^w > a^t > a. a^y = "sable" — pelos com feomelanina dominante, eumelanina restrita a íris, lábios, nariz, coxins. a^w = aguti (faixas alternadas eumelanina/feomelanina em cada pelo). a^t = bicolor (preto em cima, tan/marrom embaixo — clássico do Doberman, Rottweiler, Pastor Alemão). aa = preto sólido.',
    },
    {
      kind: 'concept',
      title: 'Loco E — extensão e máscara',
      body:
        'E^m = MÁSCARA PRETA (eumelanina restrita ao focinho/face). E = normal. e = BLOQUEIA toda eumelanina. Animal ee não tem preto/marrom em lugar nenhum — pelagem fica creme/amarelo/vermelho (Golden Retriever, Labrador amarelo). Cocker spaniel preto = E_B_. Cocker dourado = eeB_ ou eebb (a cor de B nem importa porque ee já bloqueou eumelanina).',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Por que Golden e Labrador amarelo "não passam preto"',
      body:
        'Tanto Golden Retriever quanto Labrador amarelo são ee. Mesmo carregando alelo B (preto), o ee bloqueia eumelanina por completo — só produz feomelanina (amarelo/dourado). Por isso esses dois cães amarelos cruzados raramente geram filhotes pretos: ee × ee = 100% ee. Mas se Golden ee × Labrador chocolate (Ee) → 50% Ee (preto/chocolate possível) + 50% ee (amarelo).',
    },
    {
      kind: 'concept',
      title: 'Loco K — preto dominante e brindle',
      body:
        'K^B = preto dominante (mascara o loco A). K^br = brindle (tigrado) — listras escuras sobre fundo amarelado. k^y = permite expressão do loco A. K^B é dominante sobre tudo: mesmo a^y a^y K^B = cão preto.',
    },
    {
      kind: 'concept',
      title: 'Loco D — diluição',
      body:
        'D_ = cor intensa. dd = diluída. Preto + dd = AZUL/CINZA (típico Weimaraner não, Doberman azul sim). Marrom + dd = isabela/marrom-claro. dd está associado a alopecia em algumas raças (Color Dilution Alopecia — CDA).',
    },
    {
      kind: 'concept',
      title: 'Loco I — diluição da feomelanina',
      body:
        'Diluição APENAS da feomelanina, em cães ee. I_ = feomelanina normal (vermelho/dourado intenso). ii = feomelanina diluída (creme claro a quase branco). Golden Retriever, Labrador creme, Bichon amarelo claro = ee ii.',
    },
    {
      kind: 'concept',
      title: 'Loco S — manchas brancas (série alélica)',
      body:
        'Hierarquia: S > S^i > S^p > s^W. S_ = coloração uniforme, sem manchas. S^i_ = "colar irlandês" (focinho, patas, ponta da cauda, peito). S^p_ = malhado de branco. s^W s^W = animal QUASE TODO BRANCO (uma orelha ou mancha discreta na cauda).',
    },
    {
      kind: 'concept',
      title: 'Loco M — Merle (cuidado clínico)',
      body:
        'Merle = distribuição aleatória de pigmento, manchas cinza-azuladas tipo mármore. MM (homozigoto) = problemas SÉRIOS: surdez, cegueira, esterilidade, alta mortalidade. Mm = merle saudável típico. mm = normal. PROIBIDO cruzar merle × merle por gerar 25% MM com problemas graves.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Merle × Merle — ética e clínica',
      body:
        'Cruzamento Mm × Mm gera: 25% MM (problemas graves — surdez, cegueira, alta mortalidade), 50% Mm (merle saudável), 25% mm. Várias entidades caninas PROIBEM esse cruzamento por motivos éticos. Em consulta veterinária, ao identificar criação irregular, o vet tem papel ativo de orientação.',
    },
    {
      kind: 'example',
      title: 'Decodificando um Golden Retriever clássico',
      body:
        'Genótipo provável: C_ a^y _ ee ii (loco A com sable, ee bloqueando eumelanina, ii diluindo a feomelanina). Resultado: cor dourada uniforme, sem máscara preta, sem manchas, sem listras. A combinação dos 4 alelos explica TUDO o que vemos.',
    },
    {
      kind: 'summary',
      bullets: [
        'Eumelanina = preto/marrom. Feomelanina = amarelo/vermelho.',
        'Loco B = preto vs marrom. Loco D = intenso vs diluído.',
        'Loco E: ee bloqueia TODA eumelanina → cão amarelo/dourado.',
        'Loco K^B mascara o loco A → cão preto sólido.',
        'Loco A: a^y sable, a^w aguti, a^t bicolor, a recessivo preto.',
        'Loco M (merle): MM = grave (surdez/cegueira). Mm saudável. NUNCA cruzar Mm × Mm.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Por que um cão ee é sempre amarelo/dourado, mesmo carregando alelo B (preto)?',
      options: [
        'Porque B é recessivo',
        'Porque ee bloqueia a produção de eumelanina por completo — só produz feomelanina',
        'Porque ele é albino',
        'Porque o ambiente impede o pigmento',
      ],
      correct: 1,
      explanation: 'Loco E é o gatekeeper da eumelanina. Em ee, nenhuma eumelanina é depositada — sobra só feomelanina (amarela/dourada).',
      hint: 'Pense no loco E como uma "chave geral" da eumelanina (preto/marrom). Se a chave está desligada (ee), nenhuma eumelanina é produzida — não importa se o gene B é B (preto) ou b (marrom), nada disso pode aparecer. O cão produz apenas feomelanina (amarelo). Esse é um caso clássico de epistasia recessiva.',
    },
    {
      question: 'Cruzamento Mm × Mm gera 25% de filhotes MM. Qual o problema clínico desses MM?',
      options: [
        'Cauda enrolada',
        'Surdez, cegueira, esterilidade, alta mortalidade — proibido eticamente',
        'Pelagem laranja',
        'Crescimento mais rápido',
      ],
      correct: 1,
      explanation: 'MM merle homozigoto causa problemas graves de SNC e olho (surdez, cegueira, esterilidade). Cruzamentos Mm × Mm são proibidos eticamente.',
      hint: 'O alelo M (merle) é um caso clássico de "letal dominante com efeito recessivo": Mm gera animal saudável com padrão merle, MAS MM tem efeitos graves no desenvolvimento neural e ocular (porque "dose dupla" do gene desregula a pigmentação dos melanócitos, que migram com tecidos do SNC e do ouvido interno). Por isso o cruzamento Mm × Mm é proibido eticamente.',
    },
    {
      question: 'O que diferencia um Doberman preto-e-marrom (a^t a^t) de um Pastor Alemão preto sólido (aa)?',
      options: [
        'O peso',
        'Ambos a^t a^t = bicolor (preto dorsal + tan ventral). aa = preto sólido sem tan. O loco A determina o padrão',
        'Apenas a raça',
        'O tamanho da orelha',
      ],
      correct: 1,
      explanation: 'Loco A determina o padrão: a^t a^t é bicolor (preto/tan típico Doberman/Rottweiler), aa é preto sólido completo.',
      hint: 'O loco A controla a DISTRIBUIÇÃO de eumelanina vs. feomelanina pelo corpo. a^t cria o padrão "black-and-tan" (preto no dorso, marcas tan no focinho/peito/patas/sobrancelhas). aa é preto sólido — sem marcas tan. Compare visualmente Doberman vs. Pastor Alemão preto puro — a diferença está nesse loco.',
    },
    {
      question: 'Um Labrador chocolate é geneticamente:',
      options: ['ee', 'bb (e não é ee)', 'B_E_', 'cc'],
      correct: 1,
      explanation: 'Chocolate = bb (sem dominância de B) E precisa NÃO ser ee (porque ee bloquearia eumelanina e o cão seria amarelo).',
      hint: 'Pra ser chocolate, o cão precisa de DUAS condições: 1) que o loco B seja bb (eumelanina marrom em vez de preta) E 2) que o loco E seja E_ (permitindo eumelanina aparecer). Se ee, vira amarelo (Labrador amarelo). Combine os dois requisitos.',
    },
    {
      question: 'O alelo K^B atua de forma:',
      options: [
        'Recessiva — só aparece em homozigose',
        'Epistática dominante — mascara a expressão do loco A, gerando preto sólido',
        'Co-dominante com o loco B',
        'Letal em homozigose',
      ],
      correct: 1,
      explanation: 'K^B é epistático dominante sobre o loco A. Mesmo a^y a^y, se houver K^B, o cão é preto sólido.',
      hint: 'O K^B "sobrescreve" todos os padrões do loco A — mesmo um cão geneticamente sable (a^y a^y) vira preto sólido se carregar K^B. Por ser DOMINANTE (basta uma cópia) e MASCARAR outro gene não-alelo, classifica-se como epistasia dominante.',
    },
  ],
};
