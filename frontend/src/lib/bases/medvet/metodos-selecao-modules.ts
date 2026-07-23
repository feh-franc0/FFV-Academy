import type { Module } from '../types';

// Módulos 13-16 — Trilha "Métodos de Seleção e Testes de Avaliação Genética".
// Conteúdo da Aula 13 da Profa. Dra. Rafaella Olivieri (Zootecnista).
// Cobre: métodos de seleção, repetibilidade, capacidade provável de produção
// e transmissão, teste de pedigree e teste de progênie.

// ────────────────────────────────────────────────────────────────────────
// MOD 13 — Métodos de Seleção
// ────────────────────────────────────────────────────────────────────────
export const MOD_13_METODOS_SELECAO: Module = {
  slug: 'metodos-de-selecao-melhoramento',
  num: 13,
  icon: '🎯',
  title: 'Métodos de Seleção em Melhoramento Animal',
  summary:
    'Os três caminhos pra escolher reprodutores: Tandem (uma característica por vez), Níveis Independentes (mínimos simultâneos) e Índice de Seleção (combinação ponderada). Como decidir entre eles em rebanho real.',
  estimatedMin: 16,
  keyTerms: [
    { term: 'Seleção',                  definition: 'Escolha intencional de animais pra serem pais da próxima geração — define a velocidade e a direção do progresso genético do rebanho.' },
    { term: 'Tandem (Unitário)',        definition: 'Seleciona-se UMA característica por vez. Quando ela atinge o nível desejado, troca-se pra próxima característica.' },
    { term: 'Níveis Independentes',     definition: 'Estipula-se um mínimo pra CADA característica simultaneamente. Animal abaixo de qualquer mínimo é descartado, independente do desempenho nas outras.' },
    { term: 'Índice de Seleção',        definition: 'Cada característica recebe um peso econômico e fenotípico — gera-se uma nota única ponderada. Animais são ordenados por esse score.' },
    { term: 'Progresso Genético',       definition: 'Mudança média do valor genético do rebanho de uma geração pra outra. Métrica que define se o programa de melhoramento está funcionando.' },
    { term: 'Correlação Genética',      definition: 'Quanto duas características variam juntas geneticamente. Positiva: melhorar uma melhora a outra. Negativa: ganhar em uma faz perder na outra.' },
    { term: 'Acurácia',                 definition: 'Quão perto a estimativa do valor genético está do valor real. Quanto mais informações (animal, parentes, descendentes), maior a acurácia.' },
    { term: 'Característica Selecionada', definition: 'Atributo mensurável que serve de critério de escolha — produção de leite, peso ao desmame, conversão alimentar, ganho de peso, etc.' },
    { term: 'Pressão de Seleção',       definition: 'Proporção de animais escolhidos pra reproduzir. Quanto mais rigorosa (menor proporção escolhida), maior o ganho genético potencial — mas menor o efetivo populacional.' },
    { term: 'Peso Econômico',           definition: 'Valor em R$ que um ponto de melhoria na característica gera no rebanho. Insumo central pra calcular Índice de Seleção.' },
    { term: 'Descarte',                 definition: 'Eliminar um animal do programa de reprodução. Em Níveis Independentes, basta falhar UM critério para ser descartado.' },
    { term: 'BLUP',                     definition: 'Best Linear Unbiased Prediction — método estatístico moderno usado pra calcular Índices de Seleção corrigindo efeitos ambientais. Padrão internacional, ainda pouco usado em melhoramento de pequena escala no Brasil.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'O melhorista enfrenta uma decisão concreta a cada geração: dado um rebanho com várias características importantes (produção de leite, fertilidade, ganho de peso, conversão alimentar, longevidade), quais animais escolho como pais da próxima geração? Não dá pra ser o melhor em tudo ao mesmo tempo — então existem três caminhos clássicos pra fazer essa escolha, cada um com vantagens e armadilhas. Esse módulo cobre os três e te ensina quando usar cada um.',
    },
    {
      kind: 'concept',
      title: 'Por que precisamos de um método?',
      body:
        'Imagine um rebanho leiteiro: você quer vacas que produzam muito leite, que tenham boa fertilidade, que sejam longevas, que tenham mastite baixa, que tenham bom temperamento. Cinco características. Algumas correlacionadas positivamente (boa estrutura mamária ↔ mais leite), outras negativamente (alta produção ↔ menos fertilidade). Selecionar "no olho" é estatisticamente perdedor — em pouco tempo o rebanho regride em alguma característica. Os três métodos abaixo são respostas estruturadas a esse problema.',
    },
    {
      kind: 'concept',
      title: 'Método 1: Tandem (Unitário)',
      body:
        'Foca em UMA característica por vez. Selecionamos animais com o melhor desempenho NAQUELA característica única até o rebanho atingir o nível desejado. Depois mudamos pra próxima característica. É como melhorar produção de leite por 5 anos, depois trabalhar fertilidade por mais 5, depois ganho de peso. Vantagem: progresso máximo na característica em foco. Desvantagem: ENQUANTO trabalha a característica A, as outras podem REGREDIR (especialmente as correlacionadas negativamente).',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Por que Tandem é caro',
      body:
        'Para melhorar 4 características distintas com Tandem em bovinos (intervalo de gerações ~5 anos), você precisa de ~20 anos. Durante esse tempo, características já trabalhadas podem regredir se correlacionadas negativamente com a nova característica em foco. Em frangos (intervalo de gerações ~1 ano) o método é viável. Em bovinos, raramente.',
    },
    {
      kind: 'concept',
      title: 'Método 2: Níveis Independentes de Eliminação',
      body:
        'Estipula-se um valor MÍNIMO pra CADA característica simultaneamente. Exemplo prático em vacas leiteiras: produção > 5.000 L/ano, taxa de prenhez > 60%, contagem de células somáticas < 200 mil, longevidade > 4 partos. Animal que falhe em UM critério é descartado, mesmo se for excepcional nos outros. Como avalia múltiplas características de uma vez, é muito mais rápido e barato que Tandem.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'A armadilha dos Níveis Independentes',
      body:
        'Você pode descartar animais GENETICAMENTE SUPERIORES por causa de UMA característica abaixo do mínimo. Imagine uma vaca que produz 8.000 L/ano (excepcional) mas tem taxa de prenhez de 58% (logo abaixo do mínimo de 60%). Ela é descartada — mas seus genes pra produção altíssima ficam fora do rebanho. Esse é o custo de simplicidade do método.',
    },
    {
      kind: 'concept',
      title: 'Método 3: Índice de Seleção',
      body:
        'Cada característica recebe um peso econômico (quanto vale 1 unidade de melhoria em R$) e um peso fenotípico (acurácia da medição). Combinam-se em uma fórmula única que gera um SCORE pra cada animal. Os animais são então ordenados por esse score — os de maior nota são selecionados, independente de "falharem" em qualquer característica individual. Vacas com produção altíssima compensam taxa de prenhez ligeiramente abaixo do ideal, e vice-versa.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Por que o Índice é tecnicamente o mais correto',
      body:
        'O Índice CONSIDERA todas as características importantes simultaneamente E PERMITE compensação entre elas. Animais excepcionais em quase tudo não são descartados por uma única falha menor. Matematicamente, é o método com maior progresso genético global (soma dos ganhos em todas as características). É o padrão em programas modernos de seleção (BLUP).',
    },
    {
      kind: 'callout',
      tone: 'note',
      title: 'Por que pouco usado no Brasil',
      body:
        'O Índice exige: 1) saber o peso econômico de cada característica (cálculo de mercado regional), 2) bancos de dados consistentes com registros de várias gerações, 3) softwares e zootecnistas treinados em BLUP. Em rebanhos pequenos, sem registro genealógico organizado, o investimento não compensa. Programas como ABCZ (Associação Brasileira dos Criadores de Zebu) e a Embrapa fornecem índices prontos pra raças específicas.',
    },
    {
      kind: 'table',
      caption: 'Comparativo direto: os três métodos de seleção',
      headers: ['Critério', 'Tandem', 'Níveis Independentes', 'Índice de Seleção'],
      rows: [
        ['Quantas características', '1 por vez',                'Várias com mínimos',           'Todas, ponderadas'],
        ['Velocidade global',      'Lenta',                    'Rápida',                       'Rápida'],
        ['Custo',                  'Alto',                     'Baixo',                        'Médio-Alto'],
        ['Risco de regressão',     'Alto nas outras chars',    'Médio (descarta superiores)',  'Baixo'],
        ['Progresso genético total','Máximo em UMA',           'Médio em várias',              'Máximo global'],
        ['Adequado pra',           'Espécies geração curta',   'Rebanho pequeno, sem dados',   'Programas profissionais com BLUP'],
        ['Uso no Brasil',          'Raro',                     'Mais comum em rebanho médio',  'Cresce com tecnificação'],
      ],
    },
    {
      kind: 'concept',
      title: 'Como escolher o método na prática',
      body:
        'Não existe método único certo. A decisão depende: 1) Quantas características são economicamente relevantes? Se uma só domina (ex: produção de leite em rebanho leiteiro), Tandem pode funcionar. Se 4+ são relevantes, prefira Níveis ou Índice. 2) Você tem dados confiáveis e suficientes? Sem registro genealógico de várias gerações, não há como rodar Índice — vai pra Níveis. 3) Qual seu intervalo de gerações? Em frangos e suínos, Tandem é viável. Em bovinos, não. 4) Qual o nível de tecnificação? Pequenos produtores tendem a Níveis. Programas profissionais e raças puras usam Índice via BLUP.',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Tandem maximiza progresso em UMA característica mas é caro e lento. Bom só em espécies de geração curta.',
        'Níveis Independentes é o método mais comum em rebanhos brasileiros — rápido e barato, mas descarta animais geneticamente superiores por falha em UM critério.',
        'Índice de Seleção é tecnicamente o melhor: combina todas as características com pesos econômicos. Permite compensação entre características.',
        'No Brasil, Índice via BLUP cresce em programas profissionais (ABCZ, Embrapa) mas ainda é minoria em rebanhos pequenos.',
        'A escolha do método depende do número de características relevantes, qualidade dos dados, intervalo de gerações e tecnificação.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Um produtor leiteiro quer trabalhar 5 características simultaneamente em seu rebanho (produção, fertilidade, mastite, longevidade e temperamento). Qual método é INVIÁVEL pra ele com bovinos?',
      options: [
        'Tandem — porque o intervalo de gerações em bovinos (~5 anos) torna 5 características × 5 anos = 25 anos',
        'Níveis Independentes',
        'Índice de Seleção',
        'Qualquer método funciona igual',
      ],
      correct: 0,
      explanation: 'Tandem trata UMA característica por vez. Em bovinos, com intervalo de gerações de ~5 anos, melhorar 5 características levaria ~25 anos — durante os quais características já melhoradas podem regredir. Por isso Tandem é inviável em espécies de geração longa. Em frangos (geração ~1 ano), seria viável.',
      hint: 'Tandem faz uma de cada vez. Multiplique o intervalo de gerações em bovinos pela quantidade de características.',
    },
    {
      question: 'Em Níveis Independentes de Eliminação, uma vaca produz 9.000 L/ano (mínimo do rebanho: 5.000 L) mas tem taxa de prenhez de 58% (mínimo: 60%). O que acontece com ela?',
      options: [
        'É selecionada — a produção excepcional compensa',
        'É DESCARTADA — falhou em UM critério, independente dos outros',
        'Entra em zona de avaliação adicional',
        'O método não permite essa decisão',
      ],
      correct: 1,
      explanation: 'A característica central dos Níveis Independentes é: falhou um mínimo, está descartada. Não há compensação entre características. Essa é exatamente a armadilha do método — você perde animais geneticamente superiores que falharam por pouco em UM critério.',
      hint: 'Pensa no nome do método: "Níveis INDEPENDENTES de eliminação". Cada critério é avaliado independente. Falha = eliminação.',
    },
    {
      question: 'Qual método PERMITE que uma alta produção compense uma taxa de prenhez ligeiramente abaixo do desejado?',
      options: [
        'Tandem',
        'Níveis Independentes',
        'Índice de Seleção',
        'Nenhum permite',
      ],
      correct: 2,
      explanation: 'O Índice gera um SCORE PONDERADO por características. Excelência em uma característica (peso econômico alto) pode compensar matematicamente falhas em outras. É essa "compensação interna" que torna o Índice tecnicamente superior — não descarta animais geneticamente excepcionais por uma única falha.',
      hint: 'O Índice gera UMA nota única, então excelência numa característica pode somar pontos suficientes pra compensar uma falha em outra.',
    },
    {
      question: 'Por que o Índice de Seleção é "tecnicamente o mais correto" mas pouco usado em pequenos produtores brasileiros?',
      options: [
        'Porque não funciona em bovinos',
        'Exige pesos econômicos calculados, banco de dados de várias gerações e zootecnistas treinados em BLUP',
        'Porque o método ainda não foi validado cientificamente',
        'Porque só funciona em fêmeas',
      ],
      correct: 1,
      explanation: 'O Índice exige insumos sofisticados: pesos econômicos regionais por característica (R$ por ponto de melhoria), banco de dados genealógico de várias gerações, e softwares estatísticos rodando BLUP. Sem esses pré-requisitos (comum em rebanhos pequenos), o método não roda. Por isso programas como ABCZ/Embrapa fornecem índices prontos pra raças específicas — democratizando o acesso.',
      hint: 'Pensa no que precisa pra calcular um Índice: dados históricos, valores econômicos por característica, software específico. Pequeno produtor tem isso?',
    },
    {
      question: 'Você está iniciando seleção em um rebanho zebuíno comercial, com 200 matrizes, sem registro genealógico organizado e sem acesso a softwares BLUP. Qual método é MAIS REALISTA pra começar?',
      options: [
        'Tandem em produção de leite',
        'Níveis Independentes em ganho de peso e fertilidade',
        'Índice de Seleção completo via BLUP',
        'Esperar implantar todo o registro genealógico antes de selecionar',
      ],
      correct: 1,
      explanation: 'Em rebanho de 200 matrizes sem dados históricos, Níveis Independentes é o método mais realista: você define mínimos pra 2-3 características críticas (peso ao desmame, taxa de prenhez), descarta animais abaixo desses mínimos e seleciona dos que passam. Funciona com dados mínimos e gera progresso real. Tandem seria muito lento (geração de zebuínos ~5 anos). Índice via BLUP exige base de dados e técnicos especializados. Adiar seleção é pior — você perde tempo.',
      hint: 'Sem registro genealógico e sem BLUP, o Índice é inviável. Tandem é lento demais em bovinos. Qual sobra que funciona com dados mínimos?',
    },
    {
      question: 'Programas brasileiros como ABCZ (Associação Brasileira dos Criadores de Zebu) e Embrapa publicam ÍNDICES DE SELEÇÃO prontos pra cada raça. Por quê isso é importante?',
      options: [
        'Porque elimina a necessidade de selecionar',
        'Porque democratiza o uso do método Índice — pequeno produtor tem acesso a pesos econômicos calculados profissionalmente',
        'Porque substitui o trabalho do zootecnista',
        'Porque é obrigatório por lei',
      ],
      correct: 1,
      explanation: 'O maior gargalo do Índice é calcular pesos econômicos por característica (R$/ponto de ganho de peso, R$/ponto de prenhez, etc) e ter banco de dados de várias gerações. ABCZ e Embrapa fazem esse trabalho centralizadamente pra cada raça e publicam os índices prontos. O produtor consegue usar esses números sem ter time próprio de melhoristas. É democratização tecnológica.',
      hint: 'O obstáculo do Índice é ter pesos econômicos e dados de gerações. Quem tem essa estrutura pode fornecer "pra todos".',
    },
    {
      question: 'Em rebanho comercial, qual característica do método de Níveis Independentes torna ele PIOR cientificamente que o Índice?',
      options: [
        'Velocidade — é mais lento',
        'Custo — é mais caro',
        'Descartar animais GENETICAMENTE SUPERIORES por falha em um único critério',
        'Exigir BLUP',
      ],
      correct: 2,
      explanation: 'A grande crítica científica aos Níveis Independentes é que o método pode descartar animais com VALOR GENÉTICO TOTAL muito alto (ex: produzem 50% acima da média em quase tudo) por falhar marginalmente em UM critério. Esses genes superiores ficam de fora do rebanho. O Índice, ao ponderar, captura esses animais. Em termos de progresso genético GLOBAL, o Índice ganha sempre.',
      hint: 'Pensa na pior consequência genética: animal SUPERIOR sendo eliminado por UMA falha. Qual método tem esse vício?',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 14 — Repetibilidade, Capacidade Provável de Produção e Transmissão
// ────────────────────────────────────────────────────────────────────────
export const MOD_14_REPETIBILIDADE_CPP: Module = {
  slug: 'repetibilidade-capacidade-provavel-producao',
  num: 14,
  icon: '📏',
  title: 'Repetibilidade, Capacidade Provável de Produção e Transmissão',
  summary:
    'Avaliação NO PRÓPRIO ANIMAL usando medidas repetidas. Quando vale a pena (herdabilidade baixa), como calcular Capacidade Provável de Produção (CPP) pro animal e Capacidade Provável de Transmissão (CPT) pra prole. Com exercícios resolvidos.',
  estimatedMin: 20,
  keyTerms: [
    { term: 'Avaliação no Próprio Animal',  definition: 'Estimativa do valor genético usando medidas REPETIDAS no mesmo indivíduo (várias lactações, várias leitegadas, várias safras).' },
    { term: 'Medidas Repetidas',            definition: 'Mensurações da mesma característica em momentos diferentes da vida do animal. Quanto mais medidas, maior a acurácia da estimativa.' },
    { term: 'Repetibilidade (t)',           definition: 'Quanto a produção do animal SE REPETE ao longo da vida. Valor de 0 a 1 (ou 0 a 100%). Alta repetibilidade = produção consistente.' },
    { term: 'Capacidade Provável de Produção (CPP)', definition: 'Estimativa da PRODUÇÃO FUTURA do mesmo animal, usando suas produções passadas + média do rebanho.' },
    { term: 'Capacidade Provável de Transmissão (CPT)', definition: 'Estimativa do que o animal vai TRANSMITIR pra prole — leva em conta repetibilidade E herdabilidade.' },
    { term: 'Herdabilidade (h²)',           definition: 'Quanto da variação fenotípica é devida à variação genética aditiva. Vai de 0 a 1. Característica com h² baixa: ambiente domina.' },
    { term: 'Seleção Precoce',              definition: 'Selecionar antes de o animal completar todas as medições da vida. Útil quando intervalo de gerações é longo (bovinos, equinos).' },
    { term: 'Acurácia',                     definition: 'Quão próxima a estimativa está do valor genético real. Aumenta com: mais medidas repetidas, h² maior, registros de melhor qualidade.' },
    { term: 'Lactação Corrigida',           definition: 'Produção de leite ajustada por fatores ambientais (idade, ordem de parição, duração da lactação) — torna lactações de animais diferentes comparáveis.' },
    { term: 'Média do Rebanho (R)',         definition: 'Produção média de todos os animais comparáveis no mesmo rebanho/ambiente — referência pra avaliar se o indivíduo está acima ou abaixo.' },
    { term: 'Média do Animal (A)',          definition: 'Média das produções repetidas do indivíduo avaliado. Quanto mais medições, mais robusta.' },
    { term: 'Regressão à Média',            definition: 'Tendência estatística: animais com produção extrema em uma medição tendem a se aproximar da média do rebanho nas medições seguintes. CPP e CPT incorporam essa regressão via a fórmula.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'O jeito mais direto de avaliar um animal pra seleção é olhar pro QUE ELE PRODUZ. Em vaca leiteira, cada lactação é uma medição. Em porca, cada leitegada. Em galinha poedeira, cada ciclo de postura. Quando uma característica é medida várias vezes na vida do animal, podemos usar TODAS as medições pra estimar o valor genético — e prever produção futura (CPP) e o que ele vai transmitir pra prole (CPT). Esse método é especialmente útil quando a herdabilidade da característica é BAIXA, porque uma única medição é "ruído".',
    },
    {
      kind: 'concept',
      title: 'Quando usar medidas repetidas',
      body:
        'Três cenários onde esse método brilha. 1) Herdabilidade BAIXA: uma única medição é estatisticamente ruim — várias medições "média" o ambiente e aproxima do valor genético real. 2) Seleção PRECOCE: você quer descartar/selecionar animais antes do fim da vida produtiva (intervalo de gerações curto = mais progresso). 3) AUMENTAR ACURÁCIA: mesmo em característica com h² média, mais medições = estimativa mais confiável.',
    },
    {
      kind: 'concept',
      title: 'Repetibilidade (t) — o conceito central',
      body:
        'A repetibilidade mede ATÉ QUE PONTO a produção do animal se repete ao longo da vida. Vai de 0 (cada medição é independente) a 1 (medições idênticas). Mede a CONSISTÊNCIA do desempenho. Característica com repetibilidade ALTA: o que você mede uma vez é bom indicador do que verá nas próximas medições. Característica com repetibilidade BAIXA: a primeira medição diz pouco — você precisa de várias.',
    },
    {
      kind: 'table',
      caption: 'Valores típicos de repetibilidade em diferentes espécies/características',
      headers: ['Espécie · Característica', 'Repetibilidade (t)', 'Interpretação'],
      rows: [
        ['Bovinos · Peso ao desmame',          't = 0,50',     'Razoavelmente repetível'],
        ['Suínos · Tamanho de leitegada',      't = 0,15',     'BAIXA — precisa muitas leitegadas'],
        ['Bovinos · Produção de leite',        't = 0,40',     'Repetível mas com variação'],
        ['Aves · Postura anual',               't = 0,30–0,50','Razoável — várias safras ajudam'],
        ['Bovinos · Período de gestação',      't = 0,10',     'Muito baixa — ambiente domina'],
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Repetibilidade vs Herdabilidade',
      body:
        'Repetibilidade (t) é "quanto o desempenho do MESMO animal se repete". Herdabilidade (h²) é "quanto da variação é genética e passa pra prole". São coisas diferentes. Repetibilidade SEMPRE é MAIOR ou IGUAL à herdabilidade — porque inclui variação genética + efeitos ambientais permanentes (idade do animal, status sanitário, manejo da fazenda). Por isso h² < t sempre.',
    },
    {
      kind: 'formula',
      title: 'Capacidade Provável de Produção (CPP)',
      formula: 'CPP = R + [n·t / (1 + (n−1)·t)] × (A − R)',
      explanation:
        'CPP = capacidade provável de produção futura do animal. R = média do rebanho (referência). A = média das produções já registradas do animal. n = número de lactações/medições já feitas. t = repetibilidade da característica. A fórmula puxa o animal pra perto da média do rebanho (R) ou pra perto da sua própria média (A) dependendo de QUANTAS medições já foram feitas E da repetibilidade da característica. Mais medições + alta repetibilidade → estimativa puxa mais pra A (a própria média do animal).',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Vaca leiteira (2 lactações)',
      body:
        'Uma vaca produziu em duas lactações corrigidas 3.200 e 3.000 Kg de leite. O rebanho tem média de 2.800 Kg. A repetibilidade da produção é t = 0,4. Qual a Capacidade Provável de Produção?\n\nDados: R = 2.800 · A = (3.200 + 3.000)/2 = 3.100 · n = 2 · t = 0,4\n\nCálculo do fator de ponderação: n·t / (1+(n−1)·t) = (2 × 0,4) / (1 + (2−1) × 0,4) = 0,8 / 1,4 ≈ 0,571\n\nCPP = 2.800 + 0,571 × (3.100 − 2.800) = 2.800 + 0,571 × 300 = 2.800 + 171,3 ≈ 3.171 Kg\n\nInterpretação: a CPP fica entre a média do rebanho (2.800) e a média do animal (3.100), puxada pra perto da média do animal mas não tanto, porque só temos 2 lactações.',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Porca (2 leitegadas, repetibilidade baixa)',
      body:
        'Uma porca, oriunda de um rebanho cuja média é 8 leitões/leitegada, produziu 6 e 10 leitões respectivamente na 1ª e 2ª leitegadas. Qual sua capacidade provável na 3ª leitegada? Considere t = 0,2.\n\nDados: R = 8 · A = (6 + 10)/2 = 8 · n = 2 · t = 0,2\n\nFator: (2 × 0,2)/(1 + (2−1) × 0,2) = 0,4 / 1,2 ≈ 0,333\n\nCPP = 8 + 0,333 × (8 − 8) = 8 + 0,333 × 0 = 8 leitões\n\nObserve: como A = R, o resultado é a própria média — não há informação adicional pra prever desempenho diferente do rebanho. Esse caso destaca que medidas repetidas só ajudam quando o animal É consistentemente diferente do rebanho.',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Vaca leiteira (1 só lactação)',
      body:
        'Uma vaca produziu 6.000 Kg em uma lactação. Pertence a rebanho de média 5.000 Kg. t = 0,5. Qual a CPP?\n\nDados: R = 5.000 · A = 6.000 · n = 1 · t = 0,5\n\nFator: (1 × 0,5)/(1 + (1−1) × 0,5) = 0,5 / 1 = 0,5\n\nCPP = 5.000 + 0,5 × (6.000 − 5.000) = 5.000 + 500 = 5.500 Kg\n\nObservação importante: com apenas 1 lactação, o fator de ponderação é exatamente igual à repetibilidade (t = 0,5). A CPP fica exatamente no meio entre rebanho e animal. À medida que mais lactações forem registradas, o fator cresce e a CPP se aproxima da média do próprio animal.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'CPP prevê PRODUÇÃO. CPT prevê TRANSMISSÃO.',
      body:
        'CPP responde: "Quanto esse animal vai produzir nas próximas medições?" Útil pra decidir manter ou descartar pra produção. CPT responde: "Quanto a PROLE desse animal vai produzir?" Útil pra decidir se usa como reprodutor. Os dois são diferentes — porque uma boa produção pessoal pode não ser totalmente transmitida (parte é ambiente + dominância). A fórmula da CPT usa herdabilidade h² em vez de só repetibilidade t.',
    },
    {
      kind: 'formula',
      title: 'Capacidade Provável de Transmissão (CPT)',
      formula: 'CPT = R + [n·h² / (1 + (n−1)·t)] × (A − R)',
      explanation:
        'Mesma estrutura da CPP, mas o NUMERADOR do fator de ponderação usa h² (herdabilidade) em vez de t (repetibilidade). O denominador continua com t. Como h² ≤ t sempre, a CPT puxa o animal menos pra sua própria média e mais pra média do rebanho — porque nem tudo que ele PRODUZ é GENÉTICO transmissível.',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Capacidade Provável de Transmissão',
      body:
        'Uma vaca produziu em três lactações 3.200, 3.400 e 3.600 Kg. Rebanho tem média de 3.000 Kg. Considere t = 0,4 e h² = 0,3. Qual a CPT?\n\nDados: R = 3.000 · A = (3.200+3.400+3.600)/3 = 3.400 · n = 3 · t = 0,4 · h² = 0,3\n\nFator: (3 × 0,3)/(1 + (3−1) × 0,4) = 0,9 / 1,8 = 0,5\n\nCPT = 3.000 + 0,5 × (3.400 − 3.000) = 3.000 + 0,5 × 400 = 3.200 Kg\n\nInterpretação: A vaca produz em média 3.400 (acima do rebanho), mas a expectativa pra suas filhas é 3.200 — porque h² = 0,3 significa que só ~30% da variação é genética e transmissível.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Resumo prático: CPP vs CPT',
      body:
        'Se você quer DECIDIR DESCARTAR ou MANTER um animal pra produção (vaca leiteira em ordenha, porca em maternidade, galinha poedeira) → use CPP. Se você quer DECIDIR USAR como REPRODUTOR (transmitir genes pra prole) → use CPT. As duas estimativas diferem quanto mais h² < t (ou seja, quanto mais a característica sofre influência ambiental).',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Medidas repetidas no próprio animal são úteis quando h² é baixa (uma medição é "ruído") e quando queremos selecionar precocemente.',
        'Repetibilidade (t) mede o quanto a produção SE REPETE ao longo da vida — vai de 0 a 1. SEMPRE t ≥ h².',
        'CPP = R + [n·t/(1+(n−1)·t)] × (A−R) — prevê PRODUÇÃO futura do MESMO animal.',
        'CPT = R + [n·h²/(1+(n−1)·t)] × (A−R) — prevê TRANSMISSÃO pra prole. Usa h² no numerador, t no denominador.',
        'CPT é sempre menor (ou igual à) CPP, porque nem tudo da variação fenotípica é genético transmissível.',
        'Mais medições (n maior) puxam a estimativa mais pra média do próprio animal e menos pra média do rebanho.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Em qual situação medidas repetidas são MAIS importantes?',
      options: [
        'Característica com herdabilidade alta (h² > 0,5)',
        'Característica com herdabilidade BAIXA — uma medição sozinha é "ruído" estatístico',
        'Características que só ocorrem uma vez na vida',
        'Características pós-mortem',
      ],
      correct: 1,
      explanation: 'Quando h² é baixa, uma única medição reflete muito ruído ambiental e pouco do valor genético. Medidas repetidas "mediam" o ambiente, aproximando da estimativa real. Em h² alta, uma medição já é informativa.',
      hint: 'Quando uma única medição é confiável, várias adicionais agregam pouco. Quando é "ruído", várias ajudam muito.',
    },
    {
      question: 'Vaca produziu em 2 lactações: 4.000 e 4.200 Kg. Rebanho médio: 3.500 Kg. Repetibilidade t = 0,4. Calcule a CPP.',
      options: [
        'CPP = 3.500 Kg (mesmo do rebanho)',
        'CPP = 4.100 Kg (mesmo da vaca)',
        'CPP ≈ 3.843 Kg',
        'CPP = 4.500 Kg',
      ],
      correct: 2,
      explanation: 'A = (4.000+4.200)/2 = 4.100. Fator = (2 × 0,4)/(1 + (2−1) × 0,4) = 0,8/1,4 ≈ 0,571. CPP = 3.500 + 0,571 × (4.100 − 3.500) = 3.500 + 0,571 × 600 ≈ 3.500 + 343 ≈ 3.843 Kg. A CPP fica entre a média do rebanho e da vaca, puxada um pouco mais pra vaca por causa do fator > 0,5.',
      hint: 'Calcule A primeiro, depois aplique a fórmula CPP = R + [n·t/(1+(n−1)·t)] × (A−R).',
    },
    {
      question: 'Por que a CPT (transmissão) usa h² no numerador em vez de t (repetibilidade)?',
      options: [
        'Porque h² é um número maior',
        'Porque a CPT estima o que PASSA pra prole — apenas a variação GENÉTICA transmissível, e essa é dada pela herdabilidade',
        'Porque é uma convenção arbitrária',
        'Porque t não existe pra reprodução',
      ],
      correct: 1,
      explanation: 'A CPP olha pro animal: quanto ele vai produzir nas próximas medições — repetibilidade (t) é o que importa. A CPT olha pra prole: quanto vai HERDAR — e o que herdamos é só a parcela GENÉTICA, capturada pela herdabilidade (h²). Por isso h² entra na fórmula da CPT mas não da CPP.',
      hint: 'CPT é sobre transmissão genética. O que mede "quanto da variação é genética e transmissível"?',
    },
    {
      question: 'CPT é SEMPRE menor (ou igual) à CPP do mesmo animal. Por quê?',
      options: [
        'Porque a fórmula é incompleta',
        'Porque h² ≤ t sempre — nem tudo da variação fenotípica é transmissível geneticamente',
        'Porque CPT considera a mortalidade da prole',
        'Porque depende da estação do ano',
      ],
      correct: 1,
      explanation: 'Repetibilidade (t) inclui variação genética aditiva + efeitos ambientais permanentes (manejo, status sanitário, etc). Herdabilidade (h²) é só a parcela genética aditiva (transmissível). Logo t ≥ h² sempre. Como a CPT usa h² no numerador, ela puxa MENOS o animal pra própria média e MAIS pra média do rebanho — resultado é menor que CPP.',
      hint: 'O que diferencia t de h² é que t inclui efeitos ambientais permanentes. Genes vão pra prole, ambiente permanente NÃO.',
    },
    {
      question: 'O efeito de N (número de medições) na fórmula é:',
      options: [
        'Não tem efeito — fórmula independe de N',
        'Quanto MAIOR o N, MAIS o resultado se aproxima da MÉDIA DO PRÓPRIO ANIMAL',
        'Quanto maior o N, mais o resultado se aproxima da média do rebanho',
        'Quanto maior o N, MAIOR a CPP independente de A vs R',
      ],
      correct: 1,
      explanation: 'O fator de ponderação n·t/(1+(n−1)·t) cresce com N (limite assintótico = 1 quando N→∞). Quanto maior o fator, mais peso a fórmula dá pra A (média do próprio animal) e menos peso pra R (rebanho). Intuitivamente: muitas medições do mesmo animal dão certeza sobre o desempenho dele, então ignora o rebanho.',
      hint: 'Quando você tem muitas medições do animal, você sabe muito sobre ELE. A média do rebanho fica menos relevante.',
    },
    {
      question: 'Vaca de rebanho cuja média é 3.000 Kg. Vaca tem A = 3.500 Kg em 3 lactações. t = 0,4 e h² = 0,3. Qual a CPT?',
      options: [
        'CPT = 3.000 Kg',
        'CPT = 3.500 Kg',
        'CPT = 3.250 Kg',
        'CPT = 3.350 Kg',
      ],
      correct: 2,
      explanation: 'Fator CPT = (3 × 0,3)/(1 + (3−1) × 0,4) = 0,9/1,8 = 0,5. CPT = 3.000 + 0,5 × (3.500 − 3.000) = 3.000 + 250 = 3.250 Kg. Compare com a CPP da mesma vaca: fator = (3 × 0,4)/(1+2×0,4) = 1,2/1,8 = 0,667. CPP = 3.000 + 0,667 × 500 = 3.333. CPT (3.250) é menor que CPP (3.333) — exatamente porque h² < t.',
      hint: 'CPT usa h² no numerador. Aplique a fórmula e compare com a CPP pra ver a diferença.',
    },
    {
      question: 'Quando uma característica tem repetibilidade MUITO ALTA (t = 0,9), o que isso significa pra decisão de selecionar precocemente?',
      options: [
        'Não muda nada',
        'Significa que a PRIMEIRA medição já é muito informativa — pode selecionar com poucas medições',
        'Significa que precisa de muitas medições',
        'Significa que não vale a pena selecionar',
      ],
      correct: 1,
      explanation: 'Alta repetibilidade significa que a primeira medição prediz BEM as próximas. Você pode confiar em poucas medições pra decidir. Isso reduz o tempo até a decisão de seleção (= reduz o intervalo de gerações). Em característica com baixa repetibilidade (t = 0,1), você precisa esperar muitas medições antes de confiar na estimativa.',
      hint: 'Alta repetibilidade = consistência. Consistência alta significa que poucas medições já contam a história.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 15 — Teste de Pedigree
// ────────────────────────────────────────────────────────────────────────
export const MOD_15_TESTE_PEDIGREE: Module = {
  slug: 'teste-de-pedigree-avaliacao-genetica',
  num: 15,
  icon: '🧾',
  title: 'Teste de Pedigree — Avaliando pelo Ascendente',
  summary:
    'Estimar o valor genético de um animal usando informações dos PARENTES (ascendentes). Útil pra animais jovens, características que se manifestam tarde ou só em um sexo. Inclui a fórmula PVG = Mci + b²(Ma − Mcr) com exercícios resolvidos.',
  estimatedMin: 16,
  keyTerms: [
    { term: 'Teste de Pedigree',         definition: 'Avaliação do valor genético de um animal a partir das informações fenotípicas dos PARENTES (ascendentes — pais, avós, bisavós).' },
    { term: 'Ascendente',                definition: 'Animal das gerações anteriores que contribui geneticamente — pai, mãe, avós, bisavós, etc.' },
    { term: 'Provável Valor Genotípico (PVG)', definition: 'Estimativa do valor genético do animal sob avaliação, calculada a partir dos ascendentes.' },
    { term: 'Coeficiente de Regressão (b²)', definition: 'Fator de ponderação na fórmula do PVG. Para pais, b² = 0,5 × h² (cada pai contribui ~50% do genoma).' },
    { term: 'Mci (Média do Indivíduo)',  definition: 'Média do rebanho ao qual o INDIVÍDUO sob avaliação pertence — referência ambiental dele.' },
    { term: 'Ma (Média do Ascendente)',  definition: 'Média de desempenho do ascendente (ex: produção média da mãe).' },
    { term: 'Mcr (Média dos Companheiros)', definition: 'Média dos contemporâneos do ascendente no mesmo rebanho/ambiente — referência pra ajustar o ascendente.' },
    { term: 'Pedigree Documentado',      definition: 'Registro genealógico com nomes, datas, raça, paternidade comprovada. Pode ser puramente nominal ou conter informações produtivas.' },
    { term: 'Pedigree Produtivo',        definition: 'Pedigree que inclui dados produtivos dos ascendentes (lactações, ganho de peso, postura). É o que serve pra Teste de Pedigree.' },
    { term: 'Seleção de Características Tardias', definition: 'Características que só se manifestam adultas (longevidade, fertilidade total ao longo da vida). Teste de Pedigree permite estimar valor mesmo em animais jovens.' },
    { term: 'Seleção em Características Restritas a um Sexo', definition: 'Característica que só se manifesta em fêmeas (leite, ovos) ou só em machos (circunferência escrotal). Em machos pra leite, só pedigree (mãe, avós) informa.' },
    { term: 'Acurácia Limitada',         definition: 'O Teste de Pedigree é menos acurado que avaliar o próprio animal ou seus descendentes. Cada ascendente contribui só ~50% do genoma — informação parcial.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Imagine: você comprou um tourinho de 8 meses pra ser reprodutor de leite. O animal ainda não produziu nada (é macho — produção de leite só fêmeas) e nunca produzirá. Como avaliar geneticamente esse animal? A resposta clássica: olhe pra MÃE e pras AVÓS. Mais especificamente, pra produção delas comparada com as companheiras no mesmo rebanho. Esse é o Teste de Pedigree — avaliação via ascendentes. Útil em animais jovens, características tardias e características que só se manifestam em um sexo.',
    },
    {
      kind: 'concept',
      title: 'Quando usar Teste de Pedigree',
      body:
        'Quatro cenários típicos. 1) HERDABILIDADE BAIXA — quando o desempenho próprio sofre muito do ambiente, olhar pros parentes ajuda a "mediar" essas oscilações. 2) ANIMAIS JOVENS — touros, varrões, garanhões avaliados antes de produzirem descendentes. 3) CARACTERÍSTICAS QUE SE MANIFESTAM TARDIAMENTE — longevidade, fertilidade total, etc. 4) CARACTERÍSTICAS RESTRITAS A UM SEXO — produção de leite em machos, circunferência escrotal em fêmeas. Só ascendentes contam.',
    },
    {
      kind: 'concept',
      title: 'O pedigree nominal vs o pedigree produtivo',
      body:
        'No Brasil, é muito comum o pedigree NOMINAL — registra-se nome, raça, RGN (registro genealógico nacional), prêmios em exposições, beleza racial. Esse tipo de pedigree é importante pra registro de raça mas NÃO serve diretamente pra Teste de Pedigree. O que precisamos é PEDIGREE PRODUTIVO: produção de leite das mães, ganho de peso dos avôs, postura das avós. Em países como EUA, Holanda, Israel, registros produtivos são padrão. No Brasil, isso ainda é luxo de programas como ABCZ e algumas associações.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Pedigree caro no Brasil',
      body:
        'A maior dificuldade de aplicar Teste de Pedigree em massa no Brasil é o custo: registros produtivos consistentes exigem zootecnista, controle leiteiro mensal, identificação confiável de animais, banco de dados de várias gerações. Pequenos produtores raramente têm. Por isso programas centralizados (ABCZ, ANGUS, etc) são tão valorizados — eles agregam dados de muitas fazendas e publicam médias confiáveis.',
    },
    {
      kind: 'formula',
      title: 'Provável Valor Genotípico (PVG) — Informação do Ascendente',
      formula: 'PVG = Mci + b² × (Ma − Mcr)',
      explanation:
        'PVG = Provável Valor Genotípico do animal sob avaliação. Mci = média do rebanho do indivíduo (ambiente atual). Ma = média do ascendente (ex: produção da mãe). Mcr = média dos companheiros do ascendente no rebanho original. b² = coeficiente de regressão (pra cada pai contribuindo ~50% do genoma, b² = 0,5 × h²). A fórmula AJUSTA o ascendente subtraindo o efeito ambiental do rebanho dele (Ma − Mcr), pega a fração GENÉTICA dessa diferença (b²), e adiciona à média do rebanho do animal avaliado (Mci).',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Tourinho A (avaliando pela mãe)',
      body:
        'Calcular o provável valor genotípico do tourinho A, pertencente a um rebanho de média 2.000 Kg/leite. Sua mãe apresentou média de produção de 1.900 Kg/leite. Suas companheiras (mãe + outras vacas do mesmo rebanho original) média de 1.800 Kg. Considere h² = 0,36.\n\nDados: Mci = 2.000 · Ma = 1.900 · Mcr = 1.800 · h² = 0,36 → b² = 0,5 × 0,36 = 0,18\n\nPVG = 2.000 + 0,18 × (1.900 − 1.800) = 2.000 + 0,18 × 100 = 2.000 + 18 = 2.018 Kg\n\nInterpretação: a mãe produzia 100 Kg acima das companheiras dela. Como apenas 18% (b² = 0,18) dessa diferença é geneticamente transmissível, esperamos que o tourinho transmita só ~18 Kg acima da média do rebanho atual dele.',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Tourinho B (mãe abaixo das companheiras)',
      body:
        'Calcular o provável valor genotípico do tourinho B, pertencente a um rebanho de média 5.000 Kg/leite. Sua mãe apresentou média de produção de 4.000 Kg. Suas companheiras média de 4.500 Kg. h² = 0,3.\n\nDados: Mci = 5.000 · Ma = 4.000 · Mcr = 4.500 · h² = 0,3 → b² = 0,5 × 0,3 = 0,15\n\nPVG = 5.000 + 0,15 × (4.000 − 4.500) = 5.000 + 0,15 × (−500) = 5.000 − 75 = 4.925 Kg\n\nInterpretação CRÍTICA: A mãe produzia ABAIXO das companheiras (4.000 vs 4.500 Kg). Genético abaixo da média do rebanho dela em −500. Como h² é 0,3, esperamos que 15% disso (b² = 0,15) seja transmissível — ou seja, o tourinho B tende a transmitir uma produção de ~75 Kg ABAIXO da média do rebanho atual dele. Não é um bom reprodutor pra leite.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'A grande sacada: Mci pode ser DIFERENTE do rebanho original do ascendente',
      body:
        'Note que no exercício do Tourinho A, o rebanho ATUAL dele (Mci = 2.000) era diferente do rebanho da MÃE (companheiras 1.800). Por que isso é tão importante? Porque a mãe estava num ambiente PIOR (produção média 1.800) e ainda assim performou acima das companheiras dela (1.900 Kg) — isso indica BOA genética. Quando movemos o filho pra um rebanho MELHOR (Mci = 2.000), esperamos que ele HERDE essa boa genética e produza acima dos pares. A fórmula captura isso ao adicionar a fração genética (b² × diferença ajustada) à nova média do rebanho.',
    },
    {
      kind: 'concept',
      title: 'Limitações importantes',
      body:
        'O Teste de Pedigree é o método de MENOR ACURÁCIA dos três (próprio animal, ascendentes, descendentes). Por quê? Porque cada ascendente contribui só ~50% do genoma do indivíduo. O pai compartilha 50% dos genes. A avó paterna, ~25%. O bisavô, ~12,5%. Quanto mais distante, menos informativo. Por isso PVG calculado só com pais é melhor que só com avós. Em programas modernos, BLUP combina ascendentes + animal próprio + descendentes em um único índice.',
    },
    {
      kind: 'table',
      caption: 'Coeficiente de regressão b² para diferentes parentes',
      headers: ['Parente avaliado', 'Fração de genes compartilhados', 'b² no PVG'],
      rows: [
        ['Pai/Mãe (1 progenitor)',     '50% (1/2)',     'b² = 0,5 × h²'],
        ['Pai + Mãe combinados',       '100% (1/2 + 1/2)', 'b² = h² (pra média parental)'],
        ['Avô/Avó',                    '25% (1/4)',     'b² = 0,25 × h²'],
        ['Bisavô/Bisavó',              '12,5% (1/8)',   'b² = 0,125 × h²'],
        ['Irmão completo (sib)',       '~50% (1/2)',    'b² = 0,5 × h²'],
        ['Meio-irmão (half-sib)',      '~25% (1/4)',    'b² = 0,25 × h²'],
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Combinando informações de múltiplos ascendentes',
      body:
        'Em programas profissionais, BLUP combina informações de pai + mãe + avós + irmãos + companheiros em um único PVG. A fórmula simples do módulo (PVG = Mci + b²(Ma − Mcr)) usa só UM ascendente — é didática. Na prática, softwares ajustam pesos pra cada parente conforme parentesco e confiabilidade dos dados. O Brasil usa BLUP em programas de elite (raças zebuínas via ABCZ, Holandês via ANGV, etc).',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Teste de Pedigree avalia um animal pela informação dos PARENTES — útil pra jovens, características tardias ou restritas a um sexo.',
        'PVG = Mci + b² × (Ma − Mcr) — usa ascendente ajustado pelo ambiente dele e adiciona à média atual do animal.',
        'b² para um parente (pai OU mãe) é 0,5 × h² — porque cada um contribui ~50% dos genes.',
        'A acurácia do método é MENOR que avaliar o próprio animal ou seus descendentes — usa só ~50% do genoma do indivíduo.',
        'Pedigree NOMINAL (nome, raça, prêmios) NÃO serve — precisa de pedigree PRODUTIVO (dados de produção). Por isso é caro no Brasil.',
        'Em programas modernos, ascendentes + animal + descendentes são combinados em BLUP.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Por que Teste de Pedigree é especialmente útil pra avaliar TOUROS jovens pra produção de leite?',
      options: [
        'Porque o teste é gratuito',
        'Porque o touro nunca vai produzir leite (característica restrita a fêmeas) — só dá pra avaliar pela MÃE e AVÓS',
        'Porque touros têm pedigree mais completo',
        'Porque a herdabilidade do leite é 100%',
      ],
      correct: 1,
      explanation: 'Produção de leite é característica LIMITADA AO SEXO — só fêmeas lactam. Para avaliar um touro pra produção de leite, NÃO dá pra olhar pra ele (não produz). NÃO dá pra esperar as filhas (teste de progênie demora anos). A solução é Teste de Pedigree — olhar a produção da MÃE, avós, irmãs.',
      hint: 'Touro não dá leite. Como avaliar então? Olha pra alguém que dá — quem da família dele?',
    },
    {
      question: 'Calcule o PVG: animal num rebanho de média 3.500 Kg. Mãe produzia 4.000 Kg, companheiras dela 3.800 Kg, h² = 0,4. b² = ?',
      options: [
        'b² = 0,4 e PVG = 3.580',
        'b² = 0,2 e PVG = 3.540',
        'b² = 0,2 e PVG = 4.000',
        'b² = 0,5 e PVG = 3.600',
      ],
      correct: 1,
      explanation: 'b² (um progenitor) = 0,5 × h² = 0,5 × 0,4 = 0,2. PVG = 3.500 + 0,2 × (4.000 − 3.800) = 3.500 + 0,2 × 200 = 3.500 + 40 = 3.540 Kg. A mãe produzia 200 Kg acima das companheiras → o ganho transmissível é 20% disso (b² = 0,2) → 40 Kg.',
      hint: 'b² = 0,5 × h² pra um progenitor. Aplique a fórmula PVG = Mci + b² × (Ma − Mcr).',
    },
    {
      question: 'Qual cenário NÃO é apropriado pra Teste de Pedigree?',
      options: [
        'Avaliar um touro de 8 meses pra produção de leite',
        'Avaliar características que só se manifestam após 5 anos de vida',
        'Avaliar um animal ADULTO que já tem múltiplas medições produtivas próprias',
        'Avaliar características restritas a um sexo',
      ],
      correct: 2,
      explanation: 'Quando o animal JÁ TEM produções próprias (múltiplas medições), o melhor método é AVALIAR O PRÓPRIO ANIMAL (CPP/CPT). Teste de Pedigree é útil quando NÃO temos info próprio (jovens, sexo errado, característica tardia).',
      hint: 'Teste de Pedigree é "supletivo" — usado quando NÃO conseguimos avaliar diretamente o animal. Se já dá pra avaliar diretamente, por que usar pedigree?',
    },
    {
      question: 'Por que pedigree NOMINAL no Brasil (registro com nome, raça, prêmios em exposição) não basta pra Teste de Pedigree?',
      options: [
        'Porque é ilegal',
        'Porque o Teste de Pedigree requer DADOS PRODUTIVOS (lactações, ganho de peso) dos ascendentes — não apenas nominais',
        'Porque o pedigree precisa ter selo',
        'Porque tem que ser feito no exterior',
      ],
      correct: 1,
      explanation: 'Pedigree nominal documenta linhagem (nomes, registros, raças, prêmios em exposição) mas NÃO inclui dados de produção. Pra calcular PVG = Mci + b²(Ma − Mcr), precisamos saber QUANTO Ma (mãe) produziu e QUANTO Mcr (companheiras dela) produziram. Isso é PEDIGREE PRODUTIVO — caro no Brasil porque exige controle de produção sistemático.',
      hint: 'A fórmula do PVG usa MÉDIAS DE PRODUÇÃO da mãe e das companheiras. Pedigree nominal tem isso?',
    },
    {
      question: 'A mãe produzia 5.000 Kg de leite. Suas companheiras médias de 5.500 Kg (acima da mãe). Considerando h² = 0,3 e o filho está num rebanho cuja média é 4.000 Kg, qual o PVG dele?',
      options: [
        'PVG = 4.075 Kg (acima do rebanho)',
        'PVG = 3.925 Kg (abaixo do rebanho)',
        'PVG = 4.000 Kg (igual ao rebanho)',
        'PVG = 5.000 Kg (mesmo da mãe)',
      ],
      correct: 1,
      explanation: 'b² = 0,5 × 0,3 = 0,15. PVG = 4.000 + 0,15 × (5.000 − 5.500) = 4.000 + 0,15 × (−500) = 4.000 − 75 = 3.925 Kg. A mãe era PIOR que as companheiras (−500 Kg). 15% disso é transmissível → o filho herda ~75 Kg abaixo da média do rebanho atual.',
      hint: 'Cuidado: a mãe está ABAIXO das companheiras (Ma < Mcr). O resultado dá negativo na subtração, então PVG fica ABAIXO de Mci.',
    },
    {
      question: 'Em ordem decrescente de ACURÁCIA, os 3 grandes métodos de avaliação genética são:',
      options: [
        'Pedigree > Próprio animal > Progênie',
        'Próprio animal > Pedigree > Progênie',
        'Progênie > Próprio animal > Pedigree',
        'Todos têm a mesma acurácia',
      ],
      correct: 2,
      explanation: 'O Teste de Progênie (descendentes) é o MAIS ACURADO porque vários descendentes "filtram" o ambiente e capturam só genética transmissível. Em segundo, avaliar o próprio animal (mais medições, alta acurácia mas inclui efeitos ambientais). Pedigree é o MENOS acurado — usa só ~50% do genoma do indivíduo via parentes. Por isso programas modernos COMBINAM os três via BLUP.',
      hint: 'Quanto mais perto do indivíduo (animal próprio > parente próximo > parente distante), mais acurado. Mas progênies (muitos descendentes) "promediam" o ambiente, então ganham.',
    },
    {
      question: 'Por que b² (coeficiente de regressão) é APENAS 0,5 × h² quando usamos UM progenitor (ex: só a mãe)?',
      options: [
        'Porque a herdabilidade vale 50% pro filho',
        'Porque cada progenitor contribui 50% dos genes — então transmite só METADE do seu valor genético',
        'Convenção arbitrária',
        'Porque o filho herda só do pai biológico',
      ],
      correct: 1,
      explanation: 'Geneticamente, cada filho herda 50% dos genes do pai + 50% dos genes da mãe (em organismos diplóides). Quando usamos só a MÃE no PVG, ela contribui só 50% do que será o filho — então o coeficiente regride pela metade: b² = 0,5 × h². Se usássemos AMBOS pais (média parental), b² = h². Se usássemos avó (1/4 dos genes), b² = 0,25 × h².',
      hint: 'Cada pai/mãe contribui com 50% do genoma. Quanto disso é genético? Metade do h².',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 16 — Teste de Progênie
// ────────────────────────────────────────────────────────────────────────
export const MOD_16_TESTE_PROGENIE: Module = {
  slug: 'teste-de-progenie-avaliacao-genetica',
  num: 16,
  icon: '🐶',
  title: 'Teste de Progênie — Avaliando pelos Descendentes',
  summary:
    'Estimar o valor genético de um animal a partir do desempenho dos FILHOS (descendentes). O método mais ACURADO mas o mais CARO e DEMORADO. Inclui a fórmula da eficiência r_AP = (h/2)·√(n/(1+(n−1)·T)) e dois exercícios resolvidos.',
  estimatedMin: 18,
  keyTerms: [
    { term: 'Teste de Progênie',         definition: 'Avaliação do valor genético de um animal a partir do DESEMPENHO de seus DESCENDENTES (filhos, netos).' },
    { term: 'Progênie',                  definition: 'Conjunto de descendentes do animal avaliado. Plural: progênies (em casos específicos) ou também referida no singular.' },
    { term: 'Reprodutor de Prova',       definition: 'Touro/varrão/galo cuja progênie está sendo testada antes de uso em massa no rebanho — "prova de produção".' },
    { term: 'Eficiência do Teste (r_AP)', definition: 'Acurácia do Teste de Progênie. Vai de 0 a 1. Aumenta com mais descendentes (n) e com h² maior.' },
    { term: 'Diluição da Herdabilidade (T)', definition: 'T = h²/4. Reflete que cada descendente recebe só metade dos genes do reprodutor, e a outra metade vem de mãe diferente (variação aleatória).' },
    { term: 'Estimativa Genotípica',     definition: 'Valor genético estimado do reprodutor com base na média dos descendentes — interpretada como "quanto o pai TRANSMITE".' },
    { term: 'Acurácia Crescente',        definition: 'Quanto mais descendentes (n maior), maior a acurácia. Mas o ganho é decrescente — passar de 20 pra 30 progênies não dobra a acurácia.' },
    { term: 'Custo do Teste',            definition: 'Manter reprodutores até gerarem progênie suficiente + esperar progênie atingir idade de medição. Em bovinos: 5-7 anos por teste.' },
    { term: 'Demora do Teste',           definition: 'Em bovinos, esperar progênie produzir = 4-6 anos depois do nascimento da progênie. Total: 5-8 anos desde monta do reprodutor até resultados.' },
    { term: 'Não Omissão',               definition: 'REGRA CRÍTICA: incluir TODOS os descendentes do reprodutor, mesmo os pouco produtivos. Omitir os ruins INFLA artificialmente o valor estimado.' },
    { term: 'Característica Pós-Mortem', definition: 'Característica que só pode ser medida após o abate (rendimento de carcaça, marmoreio, espessura de gordura). Teste de Progênie é o ÚNICO método viável.' },
    { term: 'BLUP em Progênie',          definition: 'Em programas profissionais, BLUP combina dados do reprodutor + ascendentes + progênie pra um índice integrado. Padrão da pecuária moderna.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Se você quiser ter ALTA CERTEZA do valor genético de um reprodutor, o melhor método é olhar pros FILHOS dele. Vários filhos. De várias mães diferentes. Em vários ambientes. Tudo isso "media" o ruído ambiental e revela o que o reprodutor REALMENTE transmite. É o método mais acurado dos três — mas também o mais caro e mais demorado. Em bovinos pode levar 5-7 anos entre montar o touro e ter resultados. Esse módulo cobre quando vale a pena, como calcular a eficiência e a regra de ouro: NÃO omitir progênie ruim.',
    },
    {
      kind: 'concept',
      title: 'A lógica fundamental',
      body:
        'Cada filho recebe 50% dos genes do pai e 50% da mãe. Se cruzarmos o pai com 20 mães DIFERENTES, cada filhote terá um conjunto diferente de "metade do pai". Quando MEDIMOS a produção média de TODOS esses 20 filhos, o efeito das 20 mães diferentes e dos 20 ambientes diferentes "soma a zero" — restando apenas a CONTRIBUIÇÃO DO PAI. Por isso o teste de progênie é matematicamente o método mais acurado pra estimar VALOR GENÉTICO transmissível.',
    },
    {
      kind: 'concept',
      title: 'Quando usar Teste de Progênie',
      body:
        'Quatro situações justificam o custo elevado. 1) HERDABILIDADE BAIXA — quando o animal próprio é pouco informativo. 2) CARACTERÍSTICAS RESTRITAS A UM SEXO — touros pra leite, fêmeas pra circunferência escrotal. 3) MAIOR ACURÁCIA NECESSÁRIA — em programas de inseminação artificial (sêmen vai pra milhares de vacas), errar custa milhões; precisa de progênie testada. 4) CARACTERÍSTICAS PÓS-MORTEM — rendimento de carcaça, marmoreio, espessura de gordura só medem após abate. Não dá pra avaliar o reprodutor diretamente nem o pedigree dele de forma confiável — só os descendentes abatidos contam.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'REGRA DE OURO: não omitir progênie pouco produtiva',
      body:
        'A maior armadilha do Teste de Progênie. Se você AVALIA só os filhos BONS de um touro, "esquecendo" os ruins, o resultado fica artificialmente inflado. Esse viés ocorre na prática quando: 1) Filhos com problemas morrem cedo (mortalidade neonatal); 2) Filhos pouco produtivos são vendidos/descartados antes da medição; 3) Filhos com defeitos não são incluídos no registro. CONSEQUÊNCIA: o touro parece transmitir excelência, mas na verdade transmite média + dispersão grande (alguns ótimos, vários ruins descartados). Em programas profissionais, TODA progênie deve ser registrada e medida, independente de aparência.',
    },
    {
      kind: 'concept',
      title: 'Por que é caro e demorado',
      body:
        'Cronograma típico em bovinos. Ano 1: Touro de 18 meses é montado em 20-30 vacas. Ano 2: nascem 20-30 filhotes (taxa de prenhez ~70%). Anos 3-5: filhotes crescem, fêmeas amadurecem. Ano 5-6: filhotes (agora vacas) parem pela primeira vez e começam a produzir leite. Ano 6-7: primeira lactação completa — resultados do teste finalmente disponíveis. Durante esse tempo, o touro foi mantido (custo) E o uso comercial dele foi SUSPENSO até resultados (custo de oportunidade). Em frangos, esse cronograma é ~1 ano. Em suínos, ~2-3 anos. Em bovinos, 5-7 anos.',
    },
    {
      kind: 'formula',
      title: 'Eficiência do Teste de Progênie',
      formula: 'r_AP = (h/2) × √( n / (1 + (n−1)·T) ),  onde T = h²/4',
      explanation:
        'r_AP é a ACURÁCIA do teste — vai de 0 a 1 (ou 0 a 100%). h = raiz quadrada de h². n = número de progênies testadas por reprodutor. T = h²/4 (diluição: cada progênie recebe só 50% dos genes do pai, e o resto varia aleatoriamente entre mães). A fórmula cresce com n mas com retornos decrescentes — passar de 20 pra 100 progênies aumenta acurácia mas cada vez menos.',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Touro com 20 progênies (h² = 0,3)',
      body:
        'Avaliar o valor genético de um touro que pertence a um rebanho com média de 3.000 Kg. Sabendo que valor genotípico das filhas apresenta média de 3.200 Kg e o número de progênies em teste é de 20 animais. Considerar h² = 0,3.\n\nPasso 1 — Calcular T (diluição): T = h²/4 = 0,3/4 = 0,075\n\nPasso 2 — Calcular fator dentro da raiz: n / (1 + (n−1)·T) = 20 / (1 + 19 × 0,075) = 20 / (1 + 1,425) = 20 / 2,425 ≈ 8,25\n\nPasso 3 — Tirar a raiz: √8,25 ≈ 2,87\n\nPasso 4 — Multiplicar por h/2: h = √0,3 ≈ 0,548. h/2 ≈ 0,274\n\nr_AP = 0,274 × 2,87 ≈ 0,786 (ou 78,6% de acurácia)\n\nInterpretação: com 20 filhas testadas, temos ~79% de certeza do valor genético do touro. Filhas produzem 200 Kg acima da média do rebanho → o touro TRANSMITE essa superioridade com alta acurácia. Ótimo reprodutor.',
    },
    {
      kind: 'example',
      title: 'Exercício resolvido — Touro com 10 progênies e h² baixa (h² = 0,10)',
      body:
        'Mesmo touro: rebanho 3.000 Kg, filhas com média 3.200 Kg. Mas agora apenas 10 progênies e h² = 0,10 (característica mais influenciada pelo ambiente).\n\nPasso 1: T = 0,10/4 = 0,025\n\nPasso 2: n / (1+(n−1)·T) = 10 / (1 + 9 × 0,025) = 10 / 1,225 ≈ 8,16\n\nPasso 3: √8,16 ≈ 2,86\n\nPasso 4: h = √0,10 ≈ 0,316. h/2 ≈ 0,158\n\nr_AP = 0,158 × 2,86 ≈ 0,452 (ou 45% de acurácia)\n\nInterpretação: com apenas 10 filhas E característica de baixa herdabilidade, a acurácia cai pra ~45%. As filhas produzem o mesmo "200 Kg acima" mas NÃO sabemos com certeza se isso vem do touro — pode ser efeito ambiental ou das mães. Resultado pouco confiável.',
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Lição central dos dois exercícios',
      body:
        'Dois fatores ditam a acurácia: NÚMERO de progênies e HERDABILIDADE da característica. Quando h² é alta E n é grande, acurácia próxima de 1. Quando h² é baixa OU n é pequeno, acurácia despenca. Em programas modernos de inseminação artificial, touros premium são testados com 50-100 filhas (e várias gerações). Por isso o sêmen de touros "comprovados" custa 10-100× mais que o de touros "sem prova".',
    },
    {
      kind: 'concept',
      title: 'Por que ainda é o método mais usado em programas profissionais',
      body:
        'Apesar do custo e da demora, Teste de Progênie é o PADRÃO em programas de inseminação artificial e raças de elite. Razões: 1) Acurácia próxima de 1 com n grande — o ROI compensa o investimento; 2) Dose de sêmen testado pode ser usada em milhares de fêmeas — divide o custo do teste; 3) Permite testar características PÓS-MORTEM (rendimento de carcaça, marmoreio); 4) BLUP combina progênie + ascendentes + animal próprio em índice único, maximizando confiabilidade. ABCZ, EmbrapaGado de Leite e Holstein Brasil usam todos esse modelo.',
    },
    {
      kind: 'table',
      caption: 'Comparativo final: os três grandes métodos de avaliação',
      headers: ['Critério', 'Próprio Animal (CPP/CPT)', 'Ascendentes (Pedigree)', 'Descendentes (Progênie)'],
      rows: [
        ['Quando usar',         'Animal adulto com produção própria', 'Animal jovem, sem produção',     'Acurácia máxima desejada'],
        ['Tempo',               'Disponível imediatamente',     'Disponível ao nascer',             '5-7 anos em bovinos'],
        ['Custo',               'Baixo (registro próprio)',     'Médio (pedigree produtivo)',       'ALTO (manter reprodutor)'],
        ['Acurácia típica',     '~60-70%',                       '~40-50%',                          '~70-95%'],
        ['Característica restrita a um sexo', 'Não funciona se o animal não tem o sexo',  'Funciona (avalia o pai pela mãe)', 'Funciona (avalia pai pelas filhas)'],
        ['Características pós-mortem', 'Não funciona (animal vivo)', 'Limitado',                     'ÚNICO viável (mede descendentes abatidos)'],
        ['Uso em IA comercial', 'Touro próprio em fazenda',     'Touro jovem em prova',            'Touro consagrado, sêmen vendido a milhares'],
      ],
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Resumo estratégico: quando usar qual método',
      body:
        'PROGRAMA INTEGRADO MODERNO: 1) Avalie o touro JOVEM pelo Teste de Pedigree (estimativa inicial). 2) Use ele em algumas vacas pra gerar progênie de teste. 3) Mantenha medições do próprio touro se aplicável (peso, escroto, etc). 4) Conforme progênie se desenvolve, atualize o índice com Teste de Progênie. 5) Combine os três via BLUP no software de melhoramento. Esse pipeline garante: avaliação imediata (pedigree), confirmação dela (próprio), validação definitiva (progênie). É o padrão da pecuária de elite mundial.',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Teste de Progênie estima valor genético pela média dos DESCENDENTES — o método mais acurado dos três.',
        'Mais caro e demorado: em bovinos, 5-7 anos do touro até resultados.',
        'r_AP = (h/2)·√(n/(1+(n−1)·T)) com T = h²/4 — acurácia cresce com n e com h², mas com retornos decrescentes.',
        'REGRA DE OURO: NÃO omitir progênie pouco produtiva — omitir gera viés artificial pra cima.',
        'Único método viável pra características PÓS-MORTEM (carcaça, marmoreio).',
        'Padrão em IA comercial: touros premium são vendidos pelo sêmen depois de "prova" com 50-100 filhas.',
        'Programas modernos combinam Próprio Animal + Pedigree + Progênie em índice único via BLUP.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Por que Teste de Progênie é matematicamente o método MAIS ACURADO?',
      options: [
        'Porque usa mais animais',
        'Porque a média de muitos descendentes (com mães diferentes em ambientes diferentes) "promediа" o ruído ambiental e capta apenas a contribuição genética do pai',
        'Porque é o mais caro',
        'Porque demora mais',
      ],
      correct: 1,
      explanation: 'Quando um touro cruza com 20 mães diferentes, cada filho herda 50% dele + 50% de uma mãe diferente, em um ambiente diferente. A média dos filhos "soma a zero" a variação das mães e dos ambientes, restando apenas a contribuição GENÉTICA do pai. É o princípio estatístico que torna o teste matematicamente superior.',
      hint: 'Pensa numa média estatística: com 20 mães e 20 ambientes diferentes, esses fatores "se anulam". O que sobra?',
    },
    {
      question: 'Touro testado com 20 progênies, h² = 0,3. Calcule a acurácia r_AP. (T = h²/4 = 0,075)',
      options: [
        'r_AP ≈ 0,45',
        'r_AP ≈ 0,79',
        'r_AP ≈ 0,30',
        'r_AP ≈ 1,00',
      ],
      correct: 1,
      explanation: 'r_AP = (h/2)·√(n/(1+(n−1)·T)). h = √0,3 ≈ 0,548. h/2 ≈ 0,274. n/(1+(n−1)·T) = 20/(1+19×0,075) = 20/2,425 ≈ 8,25. √8,25 ≈ 2,87. r_AP = 0,274 × 2,87 ≈ 0,786 ou 79%.',
      hint: 'Passos: T = h²/4 = 0,075. h/2 = √h²/2. Calcule n/(1+(n−1)T), tire a raiz, multiplique por h/2.',
    },
    {
      question: 'A REGRA DE OURO do Teste de Progênie diz:',
      options: [
        'Use só os filhos mais produtivos pra avaliar',
        'NÃO OMITIR progênie pouco produtiva — todos os filhos devem entrar na avaliação',
        'Avaliar apenas o melhor filho',
        'Apenas filhos do mesmo sexo',
      ],
      correct: 1,
      explanation: 'Omitir filhos ruins INFLA ARTIFICIALMENTE o valor estimado do reprodutor. Se você só conta os filhos bons, parece que o touro transmite excelência — mas na verdade ele transmite média + dispersão (alguns bons, vários ruins descartados). A regra é INCLUIR TODA progênie, mesmo os pouco produtivos, mortos cedo ou descartados — pra estimativa não enviesar.',
      hint: 'Imagine: você só conta os filhos bons de um touro. Os filhos ruins "não existem". Como vai parecer o touro?',
    },
    {
      question: 'Por que Teste de Progênie é o ÚNICO viável pra características pós-mortem (rendimento de carcaça, marmoreio)?',
      options: [
        'Porque é o mais barato',
        'Porque o reprodutor vivo não pode ter sua carcaça medida — só os descendentes abatidos podem',
        'Porque é uma regra arbitrária',
        'Porque o pedigree não funciona pra carcaça',
      ],
      correct: 1,
      explanation: 'Rendimento de carcaça, marmoreio, espessura de gordura — só podem ser medidos APÓS o abate. O reprodutor vivo não pode ser avaliado (matá-lo elimina a razão de existir). Mas seus FILHOS podem ser abatidos e medidos. A média dos filhos abatidos revela o valor genético do reprodutor pra essas características.',
      hint: 'Pra medir carcaça, o animal tem que estar abatido. Quem dos três pode ser abatido sem perder o reprodutor?',
    },
    {
      question: 'Mesmo touro, mesma progênie de 20 filhas com média 3.200 vs rebanho 3.000. Comparando dois cenários: (A) h² = 0,3 vs (B) h² = 0,1. Qual cenário dá MAIOR acurácia r_AP?',
      options: [
        'Cenário A (h² = 0,3) — porque maior h² gera maior h/2 e menor T relativo',
        'Cenário B (h² = 0,1) — porque T menor',
        'Igual nos dois',
        'Não dá pra saber',
      ],
      correct: 0,
      explanation: 'h² = 0,3: h = √0,3 ≈ 0,548 → h/2 ≈ 0,274. T = 0,075. r_AP ≈ 0,79. h² = 0,1: h = √0,1 ≈ 0,316 → h/2 ≈ 0,158. T = 0,025. r_AP ≈ 0,45. O h/2 dominado pelo h² na frente da fórmula faz toda diferença. Característica de h² alta dá acurácia muito maior pro mesmo n.',
      hint: 'A fórmula tem h/2 multiplicando tudo. Se h² é menor, h é menor, h/2 é menor — o resultado final é menor.',
    },
    {
      question: 'Quanto tempo aproximadamente leva um teste de progênie completo em BOVINOS?',
      options: [
        '1 ano',
        '2-3 anos',
        '5-7 anos',
        '15+ anos',
      ],
      correct: 2,
      explanation: 'Cronograma típico em bovinos: ano 1 monta o touro; ano 2 nascem filhotes; anos 3-5 filhotes crescem; ano 5-6 começam a parir; ano 6-7 primeira lactação completa, resultados disponíveis. Em frangos seria ~1 ano, em suínos ~2-3 anos. Bovinos têm o cronograma mais longo dos grandes grupos zootécnicos.',
      hint: 'Bovinos têm intervalo de gerações longo. Vaca pari aos 2-3 anos, depois primeira lactação completa demora mais alguns meses.',
    },
    {
      question: 'Sêmen de "touros comprovados" via teste de progênie custa 10-100× mais que touros sem prova. Por quê?',
      options: [
        'Porque é raro',
        'Porque alta acurácia genética + uso em milhares de vacas via inseminação artificial gera ROI altíssimo pra criador comprador — vale pagar prêmio',
        'Por convenção do mercado',
        'Porque é importado',
      ],
      correct: 1,
      explanation: 'Quando uma fazenda usa sêmen de touro NÃO comprovado em 100 vacas, está apostando na sorte — se o touro for ruim, 100 bezerros ruins. Sêmen comprovado (com r_AP > 0,7) entrega genética PREVISÍVEL e SUPERIOR — cada bezerro nasce já com vantagem genética. Em centenas/milhares de bezerros, esse ganho de produtividade vale muito mais que o prêmio pago no sêmen.',
      hint: 'Sêmen vai pra muitas vacas. Acurácia alta = todos os bezerros saem como esperado. Pensa em ROI por mil vacas.',
    },
  ],
};
