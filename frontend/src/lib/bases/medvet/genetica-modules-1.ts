import type { Module } from '../types';

// Módulos 1-4 da trilha Genética Veterinária.
// Conteúdo extraído e adaptado pedagogicamente dos materiais da
// Profa. Dra. Rafaella Olivieri (Zootecnista, Dra. em Ciência Animal).

export const MOD_1_POPULACOES: Module = {
  slug: 'genetica-de-populacoes',
  num: 1,
  icon: '🧬',
  title: 'Genética de Populações — fundamentos',
  summary:
    'Os conceitos básicos que sustentam toda a genética veterinária: DNA, gene, cromossomo, locus, alelos, genótipo, fenótipo, homozigoto, heterozigoto, dominância e recessividade.',
  estimatedMin: 18,
  keyTerms: [
    { term: 'Genética',         definition: 'Área da biologia que estuda a hereditariedade e os mecanismos de transmissão de características.' },
    { term: 'Hereditariedade',  definition: 'Transmissão previsível e calculável de características dos pais para os filhos.' },
    { term: 'Gene',             definition: 'Unidade fundamental da hereditariedade — segmento de DNA que codifica a síntese de proteínas.' },
    { term: 'Cromossomo',       definition: 'Estrutura compactada de DNA que aparece durante a divisão celular (mitose ou meiose).' },
    { term: 'Locus',            definition: 'Posição que um gene ocupa em um cromossomo. Genes alelos compartilham o mesmo locus em cromossomos homólogos.' },
    { term: 'Alelos',           definition: 'Versões diferentes de um mesmo gene que ocupam o mesmo locus em cromossomos homólogos.' },
    { term: 'Genótipo',         definition: 'Constituição genética do indivíduo — conjunto de genes que ele carrega.' },
    { term: 'Fenótipo',         definition: 'Manifestação perceptível do genótipo. Pode ser visível ou detectável e sofre influência do ambiente.' },
    { term: 'Homozigoto',       definition: 'Indivíduo com dois alelos idênticos no mesmo locus (ex.: AA ou aa).' },
    { term: 'Heterozigoto',     definition: 'Indivíduo com dois alelos diferentes no mesmo locus (ex.: Aa).' },
    { term: 'Dominante',        definition: 'Alelo que determina o fenótipo quando presente, mesmo em dose única (Aa).' },
    { term: 'Recessivo',        definition: 'Alelo que só se manifesta em dose dupla (aa) — em heterozigose fica "encoberto".' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Antes de qualquer cruzamento, qualquer prova, qualquer melhoramento de rebanho — precisamos do mesmo vocabulário. Genética é a área da biologia que estuda como características passam de uma geração para a outra. Em medicina veterinária, isso significa entender por que um bezerro nasce mocho ou chifrudo, por que um gato nasce preto ou marrom, por que uma vaca produz mais ou menos leite. Tudo começa com o gene.',
    },
    {
      kind: 'concept',
      title: 'De onde vem a informação genética',
      body:
        'A informação genética está no DNA — armazenada dentro do núcleo de praticamente toda célula. Quando a célula entra em divisão (mitose ou meiose), o DNA se compacta em cromossomos. Cada espécie tem um número fixo de cromossomos: bovinos 60, cães 78, gatos 38, cavalos 64, suínos 38, humanos 46. Esses cromossomos aparecem aos pares nas células diploides — um de origem materna, outro de origem paterna. São os chamados cromossomos homólogos: mesma forma, mesmo tamanho, mesmas regiões codificantes.',
    },
    {
      kind: 'concept',
      title: 'Gene, alelo e locus',
      body:
        'Cada gene é um pedaço de DNA que codifica a síntese de uma proteína — e proteínas, em última instância, são responsáveis pelas características do organismo. Em cromossomos homólogos, o mesmo gene aparece duas vezes, na mesma posição (locus). Essas duas versões do gene são chamadas alelos. Se os dois alelos são iguais, o indivíduo é homozigoto. Se são diferentes, é heterozigoto.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'A distinção que confunde no início',
      body:
        'Genótipo ≠ Fenótipo. O genótipo é o que está escrito no DNA (AA, Aa, aa). O fenótipo é o que se manifesta — a pelagem preta da Aberdeen Angus, o chifre presente ou ausente na vaca. O ambiente influencia o fenótipo: a mesma vaca leiteira de alta genética pode produzir 8.000 litros num clima temperado e 4.000 litros num clima tropical.',
    },
    {
      kind: 'example',
      title: 'Aberdeen Angus — preto vs. vermelho',
      body:
        'O alelo A determina pelagem preta e domina o alelo a (vermelha). Animal AA = preto. Animal Aa = preto (o alelo dominante mascara o recessivo). Animal aa = vermelho. Numa vacaria onde os pais são Aa × Aa, espera-se 75% de bezerros pretos e 25% vermelhos — mesmo que visualmente "todos os pais sejam pretos".',
      metadata: 'Cruzamento Aa × Aa → 1 AA : 2 Aa : 1 aa',
    },
    {
      kind: 'concept',
      title: 'Caracteres específicos vs. individuais',
      body:
        'Caracteres específicos são os que definem a espécie — todos os bovinos têm casco fendido, todos os cães têm 78 cromossomos. Caracteres individuais são os que diferenciam um indivíduo do outro — cor de pelagem, tamanho, produção de leite. Em melhoramento genético, o foco é nos caracteres individuais.',
    },
    {
      kind: 'callout',
      tone: 'note',
      title: 'Caráter adquirido vs. hereditário',
      body:
        'Cuidado: características adquiridas durante a vida do animal (cicatrizes, hábitos, manejo) NÃO são transmitidas geneticamente para a descendência. Só o que está codificado no DNA passa.',
    },
    {
      kind: 'summary',
      title: 'O que você precisa carregar pro próximo módulo',
      bullets: [
        'Genes alelos ocupam o mesmo locus em cromossomos homólogos.',
        'AA e aa = homozigotos. Aa = heterozigoto.',
        'Alelo dominante se expressa em dose única; recessivo só em dose dupla.',
        'Genótipo é o DNA; fenótipo é a manifestação visível, influenciada pelo ambiente.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Numa vaca de pelagem preta (A dominante) heterozigota Aa cruzada com um touro vermelho (aa), quais são as proporções esperadas na progênie?',
      options: [
        '100% pretos',
        '50% pretos (Aa) e 50% vermelhos (aa)',
        '75% pretos e 25% vermelhos',
        '100% vermelhos',
      ],
      correct: 1,
      explanation: 'Aa × aa gera ½ Aa (pretos) e ½ aa (vermelhos). A proporção fenotípica é 1:1.',
      hint: 'Esse é um cruzamento-teste: um heterozigoto (Aa) × um homozigoto recessivo (aa). Monte o quadro de Punnett: o pai aa só pode doar o gameta a — então a proporção dos filhos depende SÓ do que a mãe doar (A ou a, em 50/50). Não é o famoso 3:1 da F2.',
    },
    {
      question: 'O que é um indivíduo heterozigoto?',
      options: [
        'Aquele que possui dois alelos idênticos no mesmo locus',
        'Aquele que possui dois alelos diferentes no mesmo locus',
        'Aquele cujo fenótipo não pode ser observado',
        'Aquele que tem apenas um cromossomo',
      ],
      correct: 1,
      explanation: 'Heterozigoto é o indivíduo que tem alelos diferentes (ex: Aa) no mesmo locus em cromossomos homólogos.',
      hint: 'Quebre a palavra: "hetero" = diferente, "zigoto" = par de alelos no mesmo locus. Compare com homozigoto ("homo" = igual, ex.: AA ou aa). A questão é sobre os DOIS alelos do mesmo gene num indivíduo diploide — não sobre cromossomos diferentes.',
    },
    {
      question: 'Qual a diferença correta entre genótipo e fenótipo?',
      options: [
        'Genótipo é o que se vê; fenótipo é o que está no DNA',
        'Genótipo é o conjunto genético; fenótipo é a manifestação visível e sofre influência do ambiente',
        'São sinônimos',
        'Genótipo só existe em adultos; fenótipo só em embriões',
      ],
      correct: 1,
      explanation: 'Genótipo é a constituição genética. Fenótipo é a manifestação observável, que depende tanto do genótipo quanto do ambiente.',
      hint: 'Pense na regra mnemônica: GENÓtipo → GENes (o que está escrito no DNA). FENÓtipo → o que se vê (do grego "phaínein", "mostrar"). Lembre também que duas vacas geneticamente idênticas podem produzir quantidades diferentes de leite — sinal de que o ambiente entra na conta de qual conceito?',
    },
    {
      question: 'Uma vaca produz 8.000 L de leite em clima temperado e a mesma vaca produziria menos em clima tropical. Isso é um exemplo de:',
      options: [
        'Mutação genética',
        'Influência do ambiente sobre a expressão do fenótipo',
        'Caráter adquirido transmitido à descendência',
        'Cromossomos diferentes',
      ],
      correct: 1,
      explanation: 'O mesmo genótipo pode levar a fenótipos diferentes dependendo do ambiente — o ambiente modula a expressão do gene.',
      hint: 'A vaca é a MESMA — o DNA dela não muda quando ela troca de clima. Então não é mutação nem cromossomo diferente. Caracteres adquiridos (Lamarckismo) já caíram. Sobra qual conceito que explica a mesma genética rendendo fenótipos diferentes?',
    },
  ],
};

export const MOD_2_MENDEL: Module = {
  slug: 'leis-de-mendel',
  num: 2,
  icon: '🌱',
  title: 'Leis de Mendel — o alicerce da genética',
  summary:
    'A 1ª lei (segregação dos fatores) e a 2ª lei (segregação independente). Como Mendel descobriu os padrões de transmissão estudando ervilhas, e como aplicamos isso em cruzamentos veterinários.',
  estimatedMin: 22,
  keyTerms: [
    { term: '1ª Lei de Mendel',  definition: 'Lei da segregação dos fatores: cada característica vem de um dos genitores; quando há dois alelos diferentes, apenas o dominante se manifesta.' },
    { term: '2ª Lei de Mendel',  definition: 'Lei da segregação independente: cada par de alelos é transmitido de forma independente dos demais (válido para genes em cromossomos diferentes).' },
    { term: 'Monoibridismo',     definition: 'Cruzamento que considera UMA característica (um par de alelos).' },
    { term: 'Diibridismo',       definition: 'Cruzamento que considera DUAS características simultaneamente.' },
    { term: 'Geração parental (P)', definition: 'Os indivíduos iniciais do cruzamento — linhagens puras.' },
    { term: 'F1',                definition: 'Primeira geração filial — descendentes diretos da P.' },
    { term: 'F2',                definition: 'Segunda geração — descendentes do cruzamento entre indivíduos da F1.' },
    { term: 'Linhagem pura',     definition: 'Indivíduo que, autofecundado, gera descendentes idênticos a si — homozigoto.' },
    { term: 'Quadro de Punnett', definition: 'Tabela que organiza os gametas dos pais e mostra todas as combinações possíveis da progênie.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Em 1865, um monge austríaco chamado Gregor Mendel publicou um trabalho que ninguém prestou atenção. Só em 1900, 16 anos depois da morte dele, é que redescobriram. Esse trabalho é a base de tudo o que você vai estudar daqui pra frente. Mendel cruzou ervilhas — fáceis de cultivar, ciclo curto, muitos descendentes, linhagens puras. Sem saber o que era cromossomo ou DNA, ele identificou que cada característica era determinada por "fatores" (hoje sabemos: genes) que se separavam e se recombinavam de forma previsível.',
    },
    {
      kind: 'concept',
      title: 'Primeira Lei — segregação dos fatores',
      body:
        'Cada característica é determinada por um par de fatores (alelos) que se separam na formação dos gametas. Cada gameta carrega apenas UM dos dois alelos. Quando dois fatores diferentes se encontram, um dominante se manifesta e o outro fica "encoberto" (recessivo).',
    },
    {
      kind: 'example',
      title: 'Ervilhas amarelas × verdes (Mendel)',
      body:
        'Linhagem pura amarela (AA) × linhagem pura verde (aa). F1: todos Aa = 100% amarelas (o dominante mascara o recessivo). Autofecundação de F1 × F1 (Aa × Aa): F2 = ¼ AA + ½ Aa + ¼ aa. Proporção fenotípica F2: 3 amarelas : 1 verde. Esse é o famoso "3:1" da 1ª Lei.',
      metadata: 'Razão fenotípica F2: 3:1 | Razão genotípica F2: 1:2:1',
    },
    {
      kind: 'concept',
      title: 'Segunda Lei — segregação independente',
      body:
        'Quando consideramos DUAS características ao mesmo tempo (di-hibridismo), cada par de alelos é transmitido independentemente do outro — desde que os genes estejam em cromossomos diferentes. Mendel observou que cor e textura da ervilha se transmitiam separadamente.',
    },
    {
      kind: 'example',
      title: 'Ervilhas amarelas/lisas × verdes/rugosas',
      body:
        'Linhagem pura AABB (amarela e lisa) × aabb (verde e rugosa). F1: 100% AaBb (amarela e lisa). F2 (AaBb × AaBb) gera a proporção fenotípica clássica 9:3:3:1: 9/16 amarelas e lisas (A_B_) + 3/16 amarelas e rugosas (A_bb) + 3/16 verdes e lisas (aaB_) + 1/16 verdes e rugosas (aabb).',
      metadata: 'Razão fenotípica F2 di-híbrida: 9:3:3:1',
    },
    {
      kind: 'table',
      caption: 'Quadro de Punnett — cruzamento AaBb × AaBb',
      headers: ['Gametas', 'AB', 'Ab', 'aB', 'ab'],
      rows: [
        ['AB', 'AABB', 'AABb', 'AaBB', 'AaBb'],
        ['Ab', 'AABb', 'AAbb', 'AaBb', 'Aabb'],
        ['aB', 'AaBB', 'AaBb', 'aaBB', 'aaBb'],
        ['ab', 'AaBb', 'Aabb', 'aaBb', 'aabb'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Quando a 2ª Lei NÃO se aplica',
      body:
        'A segregação independente só funciona se os genes estão em cromossomos diferentes. Quando dois genes estão no mesmo cromossomo (ligados), eles tendem a ser herdados juntos — quebrando a proporção 9:3:3:1. Isso é estudado em "linkage genético", fora do escopo desta aula.',
    },
    {
      kind: 'summary',
      bullets: [
        '1ª Lei: cada caractere é controlado por um par de alelos que se separam na meiose.',
        '2ª Lei: pares de alelos diferentes segregam-se independentemente (para genes em cromossomos distintos).',
        'Cruzamento monohíbrido Aa × Aa → razão fenotípica 3:1, genotípica 1:2:1.',
        'Cruzamento di-híbrido AaBb × AaBb → razão fenotípica 9:3:3:1.',
        'O quadro de Punnett organiza todas as combinações possíveis de gametas.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Numa cruza Aa × Aa, qual a proporção fenotípica esperada na F2 considerando dominância completa?',
      options: ['1:1', '3:1', '9:3:3:1', '1:2:1'],
      correct: 1,
      explanation: 'A razão fenotípica clássica do monoibridismo com dominância completa é 3:1 (3 fenótipos dominantes : 1 recessivo).',
      hint: 'Monte o quadro de Punnett do Aa × Aa: vão sair AA, Aa, Aa, aa (razão genotípica 1:2:1). Com DOMINÂNCIA COMPLETA, os heterozigotos parecem iguais aos AA — junta tudo o que tem pelo menos um A. Sobrou só aa do outro lado.',
    },
    {
      question: 'Por que Mendel escolheu ervilhas para seus experimentos?',
      options: [
        'Porque eram caras e raras',
        'Por terem ciclo curto, muitos descendentes, fácil cultivo e linhagens naturalmente puras',
        'Porque produzem flores grandes',
        'Por causa do clima austríaco',
      ],
      correct: 1,
      explanation: 'Ervilhas têm vantagens experimentais únicas: ciclo curto, fácil cultivo, muitos descendentes por planta e linhagens puras pela autofecundação natural.',
      hint: 'Pense como um cientista do século XIX: o que você precisaria pra estudar herança? Gerações rápidas (pra ver muitas), muitos descendentes (pra ter estatística), linhagens puras (pra controlar o experimento). Quais opções são apenas curiosidades culturais e quais correspondem a critérios METODOLÓGICOS?',
    },
    {
      question: 'Em uma cruza AaBb × AaBb com segregação independente, qual a proporção fenotípica esperada na F2?',
      options: ['3:1', '9:3:3:1', '1:1:1:1', '1:2:1'],
      correct: 1,
      explanation: 'O di-hibridismo com dominância completa em ambos os locos gera a razão 9:3:3:1.',
      hint: 'Pense em duas características independentes (cor E forma). Cada cruzamento Aa × Aa daria 3:1, e Bb × Bb daria 3:1. Combine: (3:1) × (3:1) = 9:3:3:1. Essa é a razão clássica da 2ª Lei.',
    },
    {
      question: 'Qual o pré-requisito da 2ª Lei de Mendel (segregação independente)?',
      options: [
        'Os genes precisam estar no mesmo cromossomo',
        'Os genes precisam estar em cromossomos diferentes',
        'Precisa ser di-hibridismo com 3 características',
        'Precisa de autofecundação obrigatória',
      ],
      correct: 1,
      explanation: 'A segregação independente só funciona quando os genes estão em cromossomos diferentes. Genes ligados (mesmo cromossomo) tendem a ser herdados juntos.',
      hint: 'Para os alelos segregarem INDEPENDENTEMENTE na meiose, eles precisam estar em estruturas físicas que se separam de forma INDEPENDENTE. Cromossomos homólogos se segregam aleatoriamente — mas se dois genes "viajam" no MESMO cromossomo, eles viajam juntos. Esse fenômeno chama-se linkage.',
    },
    {
      question: 'Linhagem pura AABB × aabb produz F1 com qual genótipo?',
      options: ['100% AABB', '100% aabb', '100% AaBb', '25% AABB + 50% AaBb + 25% aabb'],
      correct: 2,
      explanation: 'Linhagens puras (homozigotas) cruzadas geram F1 100% heterozigota — todos AaBb.',
      hint: 'Linhagem pura = homozigota (todos os locos). Pense em quais gametas cada genitor pode formar: AABB só forma AB; aabb só forma ab. Junte um gameta de cada → genótipo único na F1.',
    },
  ],
};

export const MOD_3_ACAO_GENICA: Module = {
  slug: 'acoes-genicas-entre-alelos',
  num: 3,
  icon: '⚖️',
  title: 'Ações Gênicas entre Alelos',
  summary:
    'Nem todo cruzamento segue o "3:1 clássico". Veja os 4 padrões de ação gênica entre alelos: dominância completa, ausência de dominância, dominância parcial e sobredominância.',
  estimatedMin: 20,
  keyTerms: [
    { term: 'Dominância Completa',  definition: 'O heterozigoto (Aa) tem o mesmo fenótipo de um dos homozigotos — não dá pra distinguir AA de Aa pelo olhar.' },
    { term: 'Ausência de Dominância', definition: 'O heterozigoto exibe um fenótipo intermediário entre os dois homozigotos.' },
    { term: 'Co-Dominância',         definition: 'Os dois alelos se manifestam simultaneamente no heterozigoto (ex: pelagem malhada).' },
    { term: 'Dominância Parcial',    definition: 'Heterozigoto tem valor entre o valor médio dos homozigotos e o valor de um deles — sem chegar ao extremo.' },
    { term: 'Sobredominância',       definition: 'Heterozigoto tem valor MAIOR que o homozigoto de maior valor ou MENOR que o de menor valor (heterose).' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Mendel trabalhou com características que tinham dominância completa — preto domina vermelho, amarelo domina verde, liso domina rugoso. Mas a natureza é mais variada. Em vários cruzamentos veterinários, o heterozigoto NÃO se parece com um dos homozigotos. Existem 5 tipos clássicos de ação gênica entre alelos — dominância completa, ausência de dominância, co-dominância, dominância parcial e sobredominância. Entender essa distinção é o que diferencia "estudou genética básica" de "consegue ler um cruzamento real".',
    },
    {
      kind: 'concept',
      title: 'Dominância Completa',
      body:
        'O heterozigoto é fenotipicamente idêntico ao homozigoto dominante. Razão fenotípica F2 = 3:1 (clássica de Mendel). Exemplo veterinário: chifres em bovinos (A1 mocho domina A2 chifrudo). Genótipos A1A1 e A1A2 = mocho. A2A2 = chifrudo. F2 de heterozigotos = 75% mochos : 25% chifrudos.',
      metadata: 'F2: ¾ A1_ (dominante) : ¼ A2A2 (recessivo)',
    },
    {
      kind: 'concept',
      title: 'Ausência de Dominância',
      body:
        'O heterozigoto tem fenótipo INTERMEDIÁRIO. Razão fenotípica F2 = 1:2:1 (igual à genotípica). Exemplo clássico: pelagem na raça Shorthorn. A1A1 = vermelha. A1A2 = rosilha (ruão). A2A2 = branca. O F1 não esconde nenhum dos alelos — exibe os dois "misturados" em intensidade média.',
      metadata: 'F2 Shorthorn: ¼ vermelha : ½ rosilha : ¼ branca',
    },
    {
      kind: 'concept',
      title: 'Co-Dominância',
      body:
        'Fenômeno DISTINTO da ausência de dominância — os dois alelos se manifestam SIMULTANEAMENTE no heterozigoto, mas separados (não misturados). Exemplo clássico: vaca malhada preto-branca. Cada mancha expressa um alelo puro (preto OU branco), não há "mistura" pigmentar. Razão fenotípica F2 = 1:2:1 (igual à da ausência de dominância), mas a distinção é qualitativa: na ausência de dominância o F1 é homogêneo e intermediário (vaca cinza, plumagem azul); na co-dominância o F1 é heterogêneo, com os dois fenótipos lado a lado (vaca malhada, sangue AB).',
      metadata: 'Ausência de dominância: fenótipo intermediário homogêneo · Co-dominância: dois fenótipos expressos lado a lado',
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Como distinguir ausência de dominância de co-dominância',
      body:
        'Os dois fenômenos têm a mesma razão genotípica (1:2:1) e produzem heterozigoto diferente dos pais. A diferença é VISUAL: se o filho parece uma "mistura" dos dois (vaca cinza vinda de preta × branca, plumagem azul de preta × branca), é ausência de dominância. Se o filho mostra os DOIS fenótipos em pontos distintos (malhado, mosaico, tipo sanguíneo AB com os dois antígenos), é co-dominância.',
    },
    {
      kind: 'concept',
      title: 'Dominância Parcial',
      body:
        'O heterozigoto fica num valor entre a média dos homozigotos e o valor de um deles — sem chegar ao extremo. Ex: pais com valores genotípicos 10 e 4 (média = 7). Se F1 (A1A2) = 9, há dominância parcial de A1 sobre A2 (9 está entre 7 e 10).',
      metadata: 'F1 entre média e valor do homozigoto dominante = dominância parcial',
    },
    {
      kind: 'concept',
      title: 'Sobredominância',
      body:
        'O heterozigoto SUPERA o melhor homozigoto. Ex: pais com valores 10 e 4 — F1 com valor 12 (acima do "melhor pai"). Esse fenômeno é a base da heterose (vigor híbrido) — extremamente relevante em melhoramento animal por permitir produzir filhos superiores aos pais.',
      metadata: 'F1 > pai de maior valor = sobredominância de A1 sobre A2',
    },
    {
      kind: 'table',
      caption: 'Resumo: como identificar o tipo de ação gênica (valores A1A1=10, A2A2=4)',
      headers: ['Valor do heterozigoto A1A2', 'Tipo de ação gênica'],
      rows: [
        ['10 (igual ao A1A1)',          'Dominância completa de A1 sobre A2'],
        ['4 (igual ao A2A2)',           'Dominância completa de A2 sobre A1'],
        ['7 (média)',                    'Ausência de dominância'],
        ['Entre 7 e 10',                 'Dominância parcial de A1'],
        ['Entre 4 e 7',                  'Dominância parcial de A2'],
        ['> 10',                         'Sobredominância de A1'],
        ['< 4',                          'Sobredominância de A2'],
      ],
    },
    {
      kind: 'summary',
      bullets: [
        'Dominância completa: heterozigoto = homozigoto dominante. F2 = 3:1.',
        'Ausência de dominância: heterozigoto MISTURA homogênea (cinza, azul, rosilho). F2 = 1:2:1.',
        'Co-dominância: heterozigoto exibe os dois fenótipos LADO A LADO (malhado, AB). F2 = 1:2:1.',
        'Dominância parcial: heterozigoto entre média e um extremo.',
        'Sobredominância: heterozigoto supera o melhor homozigoto — base da heterose.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Numa galinha Andaluza, plumagem preta (AA) × branca (aa) gera filhos AZUIS heterozigotos (Aa). Que tipo de ação gênica é essa?',
      options: ['Dominância completa', 'Ausência de dominância', 'Sobredominância', 'Co-dominância'],
      correct: 1,
      explanation: 'O azul é um fenótipo INTERMEDIÁRIO entre preto e branco. Isso caracteriza ausência de dominância.',
      hint: 'O filho NÃO se parece com nenhum dos pais — ficou num meio-termo (azul, entre preto e branco). Volte na distinção entre dominância completa, ausência de dominância e co-dominância. A chave é: o filho é uma MISTURA homogênea ou mostra os dois fenótipos LADO A LADO?',
    },
    {
      question: 'Considerando A1A1 = 12 e A2A2 = 4, qual valor de A1A2 indica dominância parcial de A1 sobre A2?',
      options: ['12 (igual a A1A1)', '4 (igual a A2A2)', '8 (a média)', 'Entre 8 e 12 (sem chegar ao extremo)'],
      correct: 3,
      explanation: 'Dominância parcial: o heterozigoto está entre a média (8) e o valor do homozigoto dominante (12), sem chegar aos extremos.',
      hint: 'Calcule a média (12+4)/2 = 8. Pense numa régua: 4 (A2A2) à esquerda, 8 (média) no centro, 12 (A1A1) à direita. Para CADA tipo de ação gênica, em que ponto da régua cai o heterozigoto? Dominância parcial não chega ao extremo mas passa da média.',
    },
    {
      question: 'Pelagem rosilha (ruão) na raça Shorthorn é resultado de:',
      options: [
        'Dominância completa do alelo vermelho',
        'Ausência de dominância — fenótipo intermediário entre vermelho e branco',
        'Sobredominância recessiva',
        'Mutação espontânea',
      ],
      correct: 1,
      explanation: 'Em Shorthorn, A1A1=vermelho, A1A2=rosilho (intermediário), A2A2=branco. Clássico exemplo de ausência de dominância.',
      hint: 'Rosilho é literalmente uma MISTURA homogênea de pelos vermelhos e brancos — não é vermelho puro, nem branco puro. Volte na régua das ações gênicas: quando o heterozigoto cai no meio, qual ação gênica é? Compare com a vaca malhada — qual a diferença entre mistura e mosaico?',
    },
    {
      question: 'Quando o heterozigoto Aa SUPERA o homozigoto de maior valor genético, isso é chamado de:',
      options: ['Dominância completa', 'Ausência de dominância', 'Sobredominância', 'Penetrância incompleta'],
      correct: 2,
      explanation: 'Sobredominância: F1 supera o melhor pai. Base do vigor híbrido / heterose, fundamental em melhoramento animal.',
      hint: 'O prefixo "sobre-" entrega o segredo: o heterozigoto fica ACIMA do melhor homozigoto. É a base do vigor híbrido — esse termo está ligado à heterose. Pense: por que cruzar Angus × Nelore frequentemente produz filhos melhores que os dois pais?',
    },
    {
      question: 'Uma vaca preta cruzada com um touro branco gera filhos MALHADOS (manchas pretas e brancas separadas). Qual ação gênica explica esse padrão?',
      options: [
        'Ausência de dominância — fenótipo intermediário',
        'Co-dominância — os dois alelos se expressam separadamente',
        'Dominância completa do alelo branco',
        'Sobredominância',
      ],
      correct: 1,
      explanation: 'Co-dominância: os dois alelos se manifestam SIMULTANEAMENTE, mas em regiões distintas (manchas). Se fosse ausência de dominância, a filha seria toda cinza (mistura homogênea). Como há os DOIS fenótipos lado a lado, é co-dominância.',
      hint: 'Pergunta-chave: o filho mostra os dois fenótipos LADO A LADO (mosaico, manchas separadas) ou MISTURADOS num só (cinza homogêneo)? Esse contraste é o que separa co-dominância da ausência de dominância. Pense também no tipo sanguíneo AB — qual modelo encaixa?',
    },
  ],
};

export const MOD_4_ALELISMO_MULTIPLO: Module = {
  slug: 'alelismo-multiplo',
  num: 4,
  icon: '🐇',
  title: 'Alelismo Múltiplo',
  summary:
    'Mais de 2 alelos para o mesmo locus na população. Pelagem em coelhos com 4 alelos, sistema ABO em humanos com 3 alelos (e o que isso ensina sobre veterinária).',
  estimatedMin: 16,
  keyTerms: [
    { term: 'Alelismo Múltiplo', definition: 'Mecanismo genético em que existem MAIS de 2 alelos para um mesmo locus na população (mas cada indivíduo ainda tem só 2 deles).' },
    { term: 'Série alélica',     definition: 'Sequência hierárquica de dominância entre os múltiplos alelos. Ex: C > c^ch > c^h > c^a.' },
    { term: 'Co-dominância em alelismo múltiplo', definition: 'Dois alelos no mesmo nível hierárquico se manifestam simultaneamente (ex: IA e IB no sistema ABO).' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Até aqui falamos de cruzamentos com 2 alelos por gene (A e a). Mas em vários casos reais, existem 3, 4 ou mais alelos para o mesmo locus — espalhados pela população. Lembrando: cada indivíduo carrega APENAS 2 desses alelos (um do pai, um da mãe). A população é que carrega a variedade toda.',
    },
    {
      kind: 'concept',
      title: 'Cor de pelagem em coelhos — 4 alelos',
      body:
        'O locus C em coelhos tem 4 alelos diferentes: C (selvagem/aguti) > c^ch (chinchila) > c^h (himalaio) > c^a (albino). A hierarquia é estrita: C domina todos os outros, c^ch domina himalaio e albino, c^h domina apenas albino, e c^a (albino) é recessivo a todos.',
      metadata: 'Série alélica: C > c^ch > c^h > c^a',
    },
    {
      kind: 'table',
      caption: 'Pelagem em coelhos — genótipos possíveis',
      headers: ['Genótipo', 'Fenótipo'],
      rows: [
        ['CC, Cc^ch, Cc^h, Cc^a', 'Selvagem (aguti)'],
        ['c^ch c^ch, c^ch c^h, c^ch c^a', 'Chinchila'],
        ['c^h c^h, c^h c^a', 'Himalaio'],
        ['c^a c^a', 'Albino'],
      ],
    },
    {
      kind: 'concept',
      title: 'Sistema ABO — 3 alelos, co-dominância',
      body:
        'O sistema ABO em humanos (e em vários animais, com variações) tem 3 alelos no mesmo locus: I^A, I^B e i. I^A e I^B são CO-DOMINANTES entre si — quando os dois aparecem no mesmo indivíduo, ambos se expressam (grupo AB). i é recessivo aos dois.',
    },
    {
      kind: 'table',
      caption: 'Sistema ABO — genótipos × fenótipos',
      headers: ['Genótipo', 'Tipo Sanguíneo'],
      rows: [
        ['I^A I^A ou I^A i', 'Grupo A'],
        ['I^B I^B ou I^B i', 'Grupo B'],
        ['I^A I^B', 'Grupo AB (co-dominância)'],
        ['ii', 'Grupo O'],
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Aplicação veterinária',
      body:
        'Cães e gatos também têm sistemas de grupos sanguíneos com alelismo múltiplo. Cão: DEA 1.1, DEA 1.2, DEA 3, DEA 4, DEA 5, DEA 7. Gato: A, B, AB. Em transfusões e gestações, a compatibilidade é crítica — eritrólise neonatal em gatinhos AB nascidos de mãe B é exemplo direto.',
    },
    {
      kind: 'summary',
      bullets: [
        'Alelismo múltiplo: 3 ou mais alelos no mesmo locus na POPULAÇÃO. Cada indivíduo carrega só 2.',
        'Hierarquia de dominância: exemplo C > c^ch > c^h > c^a (coelhos).',
        'Co-dominância em alelismo múltiplo: I^A e I^B se expressam juntos (sangue AB).',
        'Em veterinária: grupos sanguíneos caninos (DEA) e felinos (A/B/AB) seguem o mesmo princípio.',
      ],
    },
  ],
  quiz: [
    {
      question: 'O que define alelismo múltiplo?',
      options: [
        'Um indivíduo carregar 3 alelos diferentes no mesmo locus',
        'Existirem mais de 2 alelos para o mesmo locus NA POPULAÇÃO',
        'Genes em cromossomos diferentes',
        'Mutações que duplicam o cromossomo',
      ],
      correct: 1,
      explanation: 'Alelismo múltiplo é definido pela existência de >2 alelos no mesmo locus na população — cada indivíduo continua carregando só 2 (um materno, um paterno).',
      hint: 'Cuidado com a pegadinha: cada indivíduo é DIPLOIDE — só carrega 2 alelos no mesmo locus (um do pai, um da mãe). O conceito de alelismo múltiplo é POPULACIONAL: a variedade está espalhada entre os indivíduos. Pense no coelho: existem 4 alelos para cor, mas cada coelhinho carrega só 2.',
    },
    {
      question: 'No sistema ABO, qual genótipo corresponde ao tipo sanguíneo AB?',
      options: ['I^A I^A', 'I^B i', 'I^A I^B', 'ii'],
      correct: 2,
      explanation: 'AB é o caso clássico de co-dominância: ambos I^A e I^B se expressam quando juntos.',
      hint: 'Pra ter os DOIS antígenos (A e B) na superfície da hemácia ao mesmo tempo, o indivíduo precisa carregar os DOIS alelos. Lembre que I^A e I^B são co-dominantes — nenhum mascara o outro. Qual genótipo combina os dois?',
    },
    {
      question: 'Na série alélica de pelagem em coelhos C > c^ch > c^h > c^a, qual o fenótipo de um animal c^ch c^a?',
      options: ['Selvagem (aguti)', 'Chinchila', 'Himalaio', 'Albino'],
      correct: 1,
      explanation: 'c^ch domina c^a (albino), portanto c^ch c^a expressa o fenótipo chinchila.',
      hint: 'Olhe a hierarquia: C > c^ch > c^h > c^a. Quem ganha quando dois alelos da série estão juntos? O que está mais à esquerda. No genótipo c^ch c^a, qual dos dois aparece mais à esquerda na série?',
    },
    {
      question: 'Por que a compatibilidade sanguínea é crítica em gatos?',
      options: [
        'Porque gatos só têm o tipo O',
        'Porque o sistema A/B/AB segue alelismo múltiplo e gatinhos AB de mãe B sofrem eritrólise neonatal',
        'Porque cães e gatos compartilham os mesmos antígenos',
        'Porque a transfusão felina é proibida',
      ],
      correct: 1,
      explanation: 'No gato, A, B e AB são variantes do mesmo locus. Fêmea B com filhotes AB pode causar eritrólise neonatal — risco clínico real.',
      hint: 'Pense fisiologicamente: gatas tipo B têm anticorpos NATURAIS contra o antígeno A (mesmo sem nunca ter sido expostas). No colostro, esses anticorpos passam para o filhote — se o filhote for AB ou A, vira problema. O sistema funciona como alelismo múltiplo (A, B, AB).',
    },
  ],
};
