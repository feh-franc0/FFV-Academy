// Simulado de Genética Veterinária — 100 questões cobrindo os 12 módulos da trilha.
// Conteúdo baseado nas aulas da Profa. Dra. Rafaella Olivieri e nos módulos
// `genetica-modules-{1,2,3}.ts`. Distribuição calibrada para a prova final da
// disciplina (sem timer, nota mínima 70%).

export interface SimuladoQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Dica opcional — clicável; aponta o conceito sem entregar a resposta. */
  hint?: string;
}

export const SIMULADO_GENETICA: SimuladoQuestion[] = [
  // ============================================================
  // GENÉTICA DE POPULAÇÕES (5 questões) — q001 a q005
  // ============================================================
  {
    id: 'q001',
    question: 'Qual é a unidade fundamental da hereditariedade?',
    options: [
      'O cromossomo',
      'A célula',
      'O gene',
      'A proteína',
    ],
    correct: 2,
    explanation:
      'O gene é a unidade fundamental — segmento de DNA que codifica proteínas. O cromossomo é a estrutura compactada que carrega muitos genes (não é a unidade). A célula é a unidade de vida, não de hereditariedade. Proteínas são produto da expressão gênica, não a unidade hereditária.',
    hint: 'Pergunte: qual a menor estrutura que CODIFICA uma característica hereditária? Cromossomo carrega muitos genes (é maior, não é a unidade). Célula é unidade de vida, não de hereditariedade. Proteína é o produto, não a unidade hereditária.',
    topic: 'Genética de Populações',
    difficulty: 'easy',
  },
  {
    id: 'q002',
    question: 'Cromossomos homólogos podem ser definidos como:',
    options: [
      'Cromossomos idênticos do mesmo progenitor',
      'Pares de cromossomos com mesma forma e tamanho, um de origem materna e outro paterna, presentes em células diploides',
      'Cromossomos sexuais X e Y',
      'Cromossomos que aparecem apenas na meiose',
    ],
    correct: 1,
    explanation:
      'Homólogos são pares com mesma forma/tamanho, um materno e um paterno, em células diploides. A alternativa 1 confunde — homólogos vêm de progenitores diferentes. X e Y NÃO são homólogos completos (apenas pareiam em região pseudoautossômica). Homólogos aparecem em mitose também, não só meiose.',
    hint: 'Pense no que define um par de homólogos: 1) mesma forma/tamanho, 2) mesmos loci na mesma ordem, 3) UM vem do pai e OUTRO da mãe (não do mesmo progenitor). Existem em todas as células diploides — não só na meiose. Cuidado com X/Y: são sexuais, mas NÃO homólogos completos (só pareiam em uma pequena região pseudoautossômica).',
    topic: 'Genética de Populações',
    difficulty: 'medium',
  },
  {
    id: 'q003',
    question: 'Uma vaca leiteira com alto potencial genético produz 8.000 L em clima temperado, mas a mesma vaca produziria menos em clima tropical. Este fenômeno demonstra que:',
    options: [
      'O fenótipo é determinado apenas pelo genótipo',
      'O fenótipo resulta da interação entre genótipo e ambiente',
      'A vaca sofreu mutação ao mudar de clima',
      'Caracteres adquiridos são transmitidos à descendência',
    ],
    correct: 1,
    explanation:
      'Mesmo genótipo gera fenótipos distintos conforme o ambiente — clássica interação G × A. Genótipo sozinho não determina o fenótipo nessas condições. Mutação não ocorre por mudança climática. Caracteres adquiridos NÃO são transmitidos (Lamarckismo refutado).',
    hint: 'A vaca é a MESMA — seu DNA não muda quando ela troca de clima. Então não é mutação. Caracteres adquiridos (Lamarck) já foram refutados. Sobra a ideia de que F = G + A (o ambiente modula a expressão). Esse é o conceito que a questão pede.',
    topic: 'Genética de Populações',
    difficulty: 'easy',
  },
  {
    id: 'q004',
    question: 'Sobre caracteres adquiridos durante a vida do animal (ex.: cicatrizes, manejo, alterações fisiológicas pós-nascimento), assinale a afirmativa CORRETA:',
    options: [
      'São transmitidos integralmente aos descendentes',
      'NÃO são transmitidos geneticamente — apenas o que está codificado no DNA passa',
      'São transmitidos apenas por fêmeas',
      'São transmitidos apenas se atingirem células germinativas via mutação',
    ],
    correct: 1,
    explanation:
      'Caracteres adquiridos durante a vida não estão no DNA das células germinativas — não passam para a descendência. Lamarck achava que sim, mas isso foi refutado. A alternativa 3 não tem base. A 4 é tecnicamente possível só se houver mutação somática que atinja a linhagem germinativa, mas isso seria uma mutação nova, não "transmissão do caráter adquirido".',
    hint: 'Princípio central: só passa para a prole o que está no DNA das células germinativas. Cicatrizes, treino, manejo — nada disso altera o DNA germinativo. Esse foi o erro do Lamarckismo, refutado pela genética mendeliana. Cuidado com a alternativa que confunde o tema com mutação somática.',
    topic: 'Genética de Populações',
    difficulty: 'medium',
  },
  {
    id: 'q005',
    question: 'O conjunto de genes que um indivíduo carrega no seu DNA é chamado de:',
    options: [
      'Fenótipo',
      'Genótipo',
      'Locus',
      'Gameta',
    ],
    correct: 1,
    explanation:
      'Genótipo é a constituição genética (DNA do indivíduo). Fenótipo é a manifestação observável. Locus é a posição de UM gene no cromossomo, não o conjunto. Gameta é a célula reprodutiva haploide.',
    hint: 'Repare na palavra "GEN-" no início: GENótipo = conjunto dos GENes. Compare com FENótipo (do grego phaínein = mostrar). Locus é apenas a POSIÇÃO de um gene; gameta é célula reprodutiva (não conjunto genético).',
    topic: 'Genética de Populações',
    difficulty: 'easy',
  },

  // ============================================================
  // LEIS DE MENDEL (12 questões) — q006 a q017
  // ============================================================
  {
    id: 'q006',
    question: 'Por que Gregor Mendel escolheu ervilhas para seus experimentos?',
    options: [
      'Porque eram caras e raras na época',
      'Porque tinham ciclo curto, eram de fácil cultivo, geravam muitos descendentes e formavam linhagens naturalmente puras por autofecundação',
      'Porque eram mais belas',
      'Porque era a única planta disponível na Áustria do século XIX',
    ],
    correct: 1,
    explanation:
      'Ervilhas oferecem todas as vantagens experimentais que Mendel precisava: ciclo curto, fácil cultivo, autofecundação (gera linhagens puras), muitos descendentes por planta. Não eram caras; havia outras plantas disponíveis; beleza não era critério.',
    hint: 'Pense como cientista experimental: o que você precisaria pra estudar herança com rigor? Gerações rápidas, muitos descendentes (estatística), linhagens puras (controle), variáveis claras (discretas). Quais alternativas tratam de critério METODOLÓGICO e quais são só curiosidades?',
    topic: 'Leis de Mendel',
    difficulty: 'easy',
  },
  {
    id: 'q007',
    question: 'A 1ª Lei de Mendel (Lei da Segregação dos Fatores) afirma que:',
    options: [
      'Genes em cromossomos diferentes sempre se segregam juntos',
      'Cada característica é determinada por um par de fatores que se separam na formação dos gametas — cada gameta carrega apenas UM dos dois alelos',
      'Características adquiridas são transmitidas hereditariamente',
      'A descendência é sempre idêntica aos pais',
    ],
    correct: 1,
    explanation:
      'A 1ª Lei: cada característica vem de UM par de alelos que se separam na meiose — cada gameta carrega 1 só. A alternativa 1 inverte a 2ª Lei. A 3 é Lamarckismo. A 4 contradiz toda variabilidade observada.',
    hint: 'O nome entrega: "Lei da SEGREGAÇÃO dos fatores". Pense na meiose: os dois alelos de um indivíduo se SEPARAM, indo um para cada gameta. Não confunda com a 2ª Lei (segregação INDEPENDENTE entre genes diferentes). Caracteres adquiridos e descendência idêntica são erros conceituais clássicos.',
    topic: 'Leis de Mendel',
    difficulty: 'easy',
  },
  {
    id: 'q008',
    question: 'Cruzando duas plantas heterozigotas Aa × Aa com dominância completa, qual a proporção FENOTÍPICA esperada na F2?',
    options: ['1:1', '3:1', '9:3:3:1', '1:2:1'],
    correct: 1,
    explanation:
      '3:1 é a razão fenotípica clássica do monoibridismo (3 dominantes : 1 recessivo). 1:1 é cruzamento teste (Aa × aa). 9:3:3:1 é di-hibridismo. 1:2:1 é a razão GENOTÍPICA (não fenotípica) ou ausência de dominância.',
    hint: 'Monte o Punnett do Aa × Aa: 1 AA + 2 Aa + 1 aa (razão GENOTÍPICA 1:2:1). Com dominância completa, AA e Aa parecem iguais → fenotipicamente, junta os 3 dominantes contra 1 recessivo. CUIDADO para não trocar a razão fenotípica pela genotípica nessa cruza.',
    topic: 'Leis de Mendel',
    difficulty: 'easy',
  },
  {
    id: 'q009',
    question: 'Cruzando Aa × Aa com dominância completa, qual a proporção GENOTÍPICA esperada na F2?',
    options: ['3:1', '9:3:3:1', '1:2:1', '1:1'],
    correct: 2,
    explanation:
      '1:2:1 — ¼ AA : ½ Aa : ¼ aa. A razão 3:1 é fenotípica (dominantes vs recessivos). 9:3:3:1 é di-hibridismo. 1:1 é Aa × aa.',
    hint: 'Pra GENÓTIPO, não junte os heterozigotos com os homozigotos dominantes! Monte o Punnett do Aa × Aa: cada quadrante representa um genótipo distinto: AA, Aa, Aa, aa = 1:2:1. A razão 3:1 só aparece quando você funde AA+Aa pelo FENÓTIPO.',
    topic: 'Leis de Mendel',
    difficulty: 'medium',
  },
  {
    id: 'q010',
    question: 'A 2ª Lei de Mendel (segregação independente) só é válida quando:',
    options: [
      'Os genes estão no mesmo cromossomo',
      'Os genes estão em cromossomos diferentes (ou muito distantes no mesmo cromossomo)',
      'O cruzamento é di-híbrido obrigatoriamente',
      'Há autofecundação garantida',
    ],
    correct: 1,
    explanation:
      'Segregação independente exige genes em cromossomos diferentes. Se estão no mesmo cromossomo (linkage), são herdados juntos e quebram a razão 9:3:3:1. Di-hibridismo é o cenário típico, mas a regra vale a qualquer número de genes desde que separados.',
    hint: 'Para os genes se segregarem INDEPENDENTEMENTE, eles precisam estar em estruturas físicas que se separam de forma independente na meiose. Se dois genes estão no MESMO cromossomo, eles tendem a viajar juntos (linkage) — e a razão 9:3:3:1 quebra. Pense em qual é o pré-requisito FÍSICO da 2ª Lei.',
    topic: 'Leis de Mendel',
    difficulty: 'medium',
  },
  {
    id: 'q011',
    question: 'Em um cruzamento di-híbrido AaBb × AaBb com dominância completa nos dois locos, qual a proporção fenotípica esperada na F2?',
    options: ['3:1', '1:2:1', '9:3:3:1', '15:1'],
    correct: 2,
    explanation:
      '9:3:3:1 — clássica razão di-híbrida (9 A_B_, 3 A_bb, 3 aaB_, 1 aabb). 3:1 é monoibridismo. 1:2:1 é razão genotípica do mono. 15:1 é interação multiplicada.',
    hint: 'Quando dois locos segregam independentemente, multiplique as razões individuais. Cada loco em Aa × Aa dá 3:1. (3:1) × (3:1) = 9:3:3:1. Essa é a assinatura da 2ª Lei aplicada a di-hibridismo com dominância completa, SEM interação gênica entre não-alelos.',
    topic: 'Leis de Mendel',
    difficulty: 'easy',
  },
  {
    id: 'q012',
    question: 'Linhagens puras AABB × aabb produzem qual genótipo na F1?',
    options: ['100% AABB', '100% aabb', '100% AaBb', '25% AABB + 50% AaBb + 25% aabb'],
    correct: 2,
    explanation:
      'Cada genitor produz um único tipo de gameta (AB ou ab). Todos F1 = AaBb. As outras opções confundem F1 com F2 ou ignoram que linhagens puras são homozigotas.',
    hint: 'Linhagem pura = homozigota em todos os locos. AABB só forma o gameta AB; aabb só forma ab. Junte um gameta de cada → genótipo único na F1. A variabilidade só aparece a partir da F2 (cruzando F1 × F1).',
    topic: 'Leis de Mendel',
    difficulty: 'easy',
  },
  {
    id: 'q013',
    question: 'Em um cruzamento monoibridismo, a F1 (Aa × Aa = F1) gera uma F2 com 240 indivíduos dominantes e 80 recessivos. Esses números aproximam a razão:',
    options: ['1:1', '3:1', '9:3:3:1', '1:2:1'],
    correct: 1,
    explanation:
      '240:80 = 3:1 — consistente com monoibridismo de dominância completa. A 1:1 seria 160:160. A 9:3:3:1 envolveria 2 características. A 1:2:1 é genotípica.',
    hint: 'Simplifique a razão: 240/80 = 3. Logo 240:80 = 3:1. Essa é a razão fenotípica clássica do monoibridismo com dominância completa. 1:1 daria valores iguais; 9:3:3:1 exigiria 2 características; 1:2:1 é GENOTÍPICA (não distinguível só pela contagem fenotípica).',
    topic: 'Leis de Mendel',
    difficulty: 'medium',
  },
  {
    id: 'q014',
    question: 'Qual é o nome do recurso (tabela) que organiza todos os gametas possíveis dos pais e mostra todas as combinações da progênie?',
    options: [
      'Quadro de Mendel',
      'Quadro de Punnett',
      'Tabela de Hardy-Weinberg',
      'Tábua de Cuénot',
    ],
    correct: 1,
    explanation:
      'O quadro de Punnett (Reginald Punnett, século XX) organiza gametas em linhas/colunas. As demais opções são fictícias ou nomeiam outras áreas (H-W é uma fórmula populacional, não tabela de cruzamento).',
    hint: 'O nome é de Reginald Punnett, geneticista britânico. Mendel é o autor das leis, mas não criou a tabela. Hardy-Weinberg é uma EQUAÇÃO populacional, não um quadro de cruzamento. Cuénot é o nome ligado aos genes letais (ratos amarelos), não a tabelas.',
    topic: 'Leis de Mendel',
    difficulty: 'easy',
  },
  {
    id: 'q015',
    question: 'No cruzamento di-híbrido AaBb × AaBb, qual a probabilidade de obter um descendente com genótipo aabb (duplo recessivo)?',
    options: ['1/4', '1/8', '1/16', '9/16'],
    correct: 2,
    explanation:
      'aabb = (¼ aa) × (¼ bb) = 1/16. A opção 1/4 é o duplo recessivo em monoibridismo. 1/8 não corresponde. 9/16 é A_B_ (duplo dominante).',
    hint: 'Em di-hibridismo, com segregação independente, multiplique as probabilidades individuais: P(aa) × P(bb). Cada um vale ¼ no cruzamento Aa × Aa (e Bb × Bb). Faça ¼ × ¼.',
    topic: 'Leis de Mendel',
    difficulty: 'medium',
  },
  {
    id: 'q016',
    question: 'Em um teste de cruzamento (test cross) Aa × aa, qual a proporção fenotípica esperada na progênie?',
    options: ['100% dominante', '3:1 (3 dominantes : 1 recessivo)', '1:1 (50% dominante : 50% recessivo)', '100% recessivo'],
    correct: 2,
    explanation:
      'Aa × aa: gametas A/a do heterozigoto × a do recessivo → ½ Aa (dominante) + ½ aa (recessivo) = 1:1. As outras opções correspondem a outros tipos de cruzamento.',
    hint: 'O teste-cruzamento é uma técnica clássica para descobrir se um indivíduo de fenótipo dominante é AA ou Aa: cruza-se com aa. O recessivo só pode doar "a", então a prole reflete diretamente o gameta do heterozigoto. ½ vão herdar A (fenótipo dominante) e ½ vão herdar a (fenótipo recessivo).',
    topic: 'Leis de Mendel',
    difficulty: 'medium',
  },
  {
    id: 'q017',
    question: 'Mendel publicou seu trabalho em 1865, mas só foi reconhecido em 1900. Quem foi Mendel e em que organismo trabalhou?',
    options: [
      'Médico francês, trabalhou com ratos',
      'Monge austríaco (1822-1884), trabalhou com ervilhas em Brünn',
      'Engenheiro alemão, trabalhou com Drosophila',
      'Botânico inglês, trabalhou com girassóis',
    ],
    correct: 1,
    explanation:
      'Mendel foi monge agostiniano em Brünn (hoje Brno, República Tcheca), realizou experimentos com Pisum sativum (ervilhas). Drosophila virou modelo só com Morgan. As outras opções são inventadas.',
    hint: 'Lembre: monge, austríaco, ervilhas. Drosophila (mosca-da-fruta) é Morgan, não Mendel. Mendel trabalhou em Brünn (atual Brno, na República Tcheca) — não na França nem na Alemanha. Pista visual: a foto clássica de Mendel é com hábito religioso.',
    topic: 'Leis de Mendel',
    difficulty: 'easy',
  },

  // ============================================================
  // AÇÕES GÊNICAS ENTRE ALELOS (8 questões) — q018 a q025
  // ============================================================
  {
    id: 'q018',
    question: 'Em bovinos da raça Aberdeen Angus, A1 (preto) é dominante sobre A2 (vermelho). Qual o fenótipo de um animal A1A2?',
    options: ['Vermelho', 'Preto', 'Cinza intermediário', 'Malhado'],
    correct: 1,
    explanation:
      'Em dominância completa, A1A2 manifesta o fenótipo do alelo dominante (preto). Cinza seria ausência de dominância. Malhado seria co-dominância. Vermelho só ocorre em A2A2.',
    hint: 'A questão entrega: "A1 é dominante sobre A2". Em dominância completa, o heterozigoto fica idêntico ao homozigoto dominante. Cinza/intermediário seria ausência de dominância. Malhado seria co-dominância. Vermelho exigiria A2A2 (homozigoto recessivo).',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'easy',
  },
  {
    id: 'q019',
    question: 'Em bovinos da raça Shorthorn, cruzamento de animal vermelho (A1A1) × animal branco (A2A2) gera filhos rosilhos (ruão, A1A2). Esse fenômeno caracteriza:',
    options: [
      'Dominância completa de A1',
      'Ausência de dominância — heterozigoto com fenótipo intermediário',
      'Sobredominância de A1',
      'Epistasia recessiva',
    ],
    correct: 1,
    explanation:
      'Rosilho é fenótipo INTERMEDIÁRIO entre vermelho e branco — clássica ausência de dominância. Dominância completa daria vermelho ou branco. Sobredominância exigiria superar o melhor pai. Epistasia envolve genes em loci diferentes.',
    hint: 'Pelagem rosilha é uma MISTURA homogênea de pelos vermelhos e brancos — não é vermelho puro, nem branco puro. Quando o heterozigoto fica num "meio-termo" entre os homozigotos, qual o tipo de ação gênica? Compare com a galinha azul (preto × branco → azul intermediário).',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'easy',
  },
  {
    id: 'q020',
    question: 'Na galinha da raça Andaluza, plumagem preta (AA) × branca (aa) gera 100% azuis (Aa). Qual o tipo de ação gênica?',
    options: [
      'Dominância completa',
      'Ausência de dominância',
      'Sobredominância',
      'Epistasia dominante',
    ],
    correct: 1,
    explanation:
      'Azul é fenótipo intermediário entre preto e branco — ausência de dominância. Em dominância completa, F1 seria todo preto OU todo branco. Sobredominância exigiria F1 superando o melhor pai. Epistasia envolve genes não-alelos.',
    hint: 'Mesmo padrão do bovino rosilho: filho não se parece com nenhum dos pais, fica num meio-termo (azul, entre preto e branco). É uma mistura HOMOGÊNEA — não malhado. Compare com co-dominância (mosaico) e dominância completa (filho idêntico a um dos pais).',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'easy',
  },
  {
    id: 'q021',
    question: 'Considerando A1A1 com valor genotípico 10 e A2A2 com valor 4 (média = 7), um heterozigoto A1A2 com valor 12 indica:',
    options: [
      'Dominância completa de A1',
      'Ausência de dominância',
      'Dominância parcial de A1',
      'Sobredominância de A1 sobre A2',
    ],
    correct: 3,
    explanation:
      'Quando o heterozigoto SUPERA o melhor homozigoto (12 > 10), há sobredominância — base do vigor híbrido / heterose. Dominância completa daria valor 10. Ausência daria 7. Dominância parcial daria entre 7 e 10.',
    hint: 'Faça a régua: 4 (A2A2) — 7 (média) — 10 (A1A1). O heterozigoto teve valor 12. Onde 12 cai na régua? ACIMA do melhor pai. O prefixo "sobre-" entrega o tipo de ação gênica — base da heterose / vigor híbrido.',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'medium',
  },
  {
    id: 'q022',
    question: 'Considerando A1A1 valor 10 e A2A2 valor 4, um heterozigoto A1A2 com valor 8 caracteriza:',
    options: [
      'Dominância completa de A1',
      'Sobredominância',
      'Dominância parcial de A1 sobre A2',
      'Ausência de dominância',
    ],
    correct: 2,
    explanation:
      'Valor 8 está entre a média (7) e o homozigoto dominante (10), sem alcançar o extremo — dominância parcial de A1. Dominância completa daria 10. Sobredominância daria >10. Ausência daria exatamente 7.',
    hint: 'Régua: 4 — 7 (média) — 10. O heterozigoto deu 8: está ENTRE a média e o melhor homozigoto, mas sem chegar a 10. Esse "meio caminho com tendência para um dos lados" é o padrão de qual ação gênica? Não confunda com sobredominância (que ultrapassaria 10).',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'medium',
  },
  {
    id: 'q023',
    question: 'A diferença essencial entre AUSÊNCIA de dominância e CO-DOMINÂNCIA é:',
    options: [
      'Não há diferença — são sinônimos',
      'Ausência: heterozigoto mostra fenótipo intermediário (mistura). Co-dominância: os dois alelos se expressam simultaneamente, mas separados (mosaico/malhado)',
      'Co-dominância só ocorre em humanos',
      'Ausência de dominância só ocorre em flores',
    ],
    correct: 1,
    explanation:
      'Ausência (Shorthorn rosilho) = mistura de pigmentos gerando cor intermediária homogênea. Co-dominância (vaca malhada preto/branco; sistema ABO em AB) = ambos alelos manifestam-se distintamente. As outras opções estão erradas.',
    hint: 'A pergunta-chave: o filho parece uma MISTURA (cor única intermediária, como rosilho) ou um MOSAICO (manchas separadas, como vaca malhada)? Ambos têm razão 1:2:1 — mas a expressão é qualitativamente diferente. Lembre que o sistema ABO em AB é o exemplo médico clássico de co-dominância.',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'medium',
  },
  {
    id: 'q024',
    question: 'Sobredominância é a base genética da:',
    options: [
      'Albinismo',
      'Heterose (vigor híbrido) — F1 superior aos pais homozigotos',
      'Pleiotropia',
      'Inativação do cromossomo X',
    ],
    correct: 1,
    explanation:
      'Sobredominância (heterozigoto > melhor homozigoto) explica o vigor híbrido — chave do cruzamento industrial em melhoramento animal. Albinismo é gene recessivo. Pleiotropia é um gene → vários fenótipos. Inativação X é lyonização.',
    hint: 'Heterose (vigor híbrido) é quando o F1 supera os pais. Para isso, o heterozigoto precisa ter valor MAIOR que o melhor homozigoto — esse é exatamente o conceito de sobredominância. Os outros termos: albinismo (gene recessivo), pleiotropia (1 gene → vários efeitos), lyonização (inativação aleatória do X).',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'medium',
  },
  {
    id: 'q025',
    question: 'Numa cruza Aa × Aa com AUSÊNCIA de dominância, qual a proporção fenotípica esperada na F2?',
    options: ['3:1', '1:2:1', '9:3:3:1', '1:1'],
    correct: 1,
    explanation:
      'Em ausência de dominância, cada genótipo tem fenótipo distinto: ¼ AA, ½ Aa, ¼ aa = razão FENOTÍPICA = razão genotípica = 1:2:1. A 3:1 vale apenas em dominância completa.',
    hint: 'A razão 3:1 só vale quando AA e Aa parecem iguais (dominância completa). Se cada genótipo tem fenótipo distinto (como acontece em ausência de dominância e co-dominância), a razão fenotípica é IGUAL à genotípica. Qual é a razão genotípica clássica de Aa × Aa?',
    topic: 'Ações Gênicas entre Alelos',
    difficulty: 'medium',
  },

  // ============================================================
  // ALELISMO MÚLTIPLO (8 questões) — q026 a q033
  // ============================================================
  {
    id: 'q026',
    question: 'Alelismo múltiplo é definido como:',
    options: [
      'Um indivíduo carregar mais de dois alelos no mesmo locus',
      'Mais de dois alelos para o mesmo locus existindo NA POPULAÇÃO (cada indivíduo carrega só 2)',
      'Cromossomos que se duplicam',
      'Mutação em vários loci ao mesmo tempo',
    ],
    correct: 1,
    explanation:
      'Alelismo múltiplo é uma característica POPULACIONAL — há mais de 2 versões do mesmo gene espalhadas na população. Cada indivíduo, por ser diploide, carrega no máximo 2 alelos. As outras opções confundem o conceito.',
    hint: 'Pegadinha clássica: alelismo múltiplo é POPULACIONAL — a variedade está espalhada entre indivíduos. Cada animal continua diploide e carrega só 2 alelos por locus (um do pai, um da mãe). É a população que pode conter 3, 4 ou mais alelos diferentes circulando.',
    topic: 'Alelismo Múltiplo',
    difficulty: 'easy',
  },
  {
    id: 'q027',
    question: 'Em coelhos, a série alélica para cor de pelagem é C > c^ch > c^h > c^a. Qual o fenótipo de um coelho c^ch c^a?',
    options: [
      'Selvagem (aguti)',
      'Chinchila',
      'Himalaio',
      'Albino',
    ],
    correct: 1,
    explanation:
      'c^ch domina c^a, então o fenótipo é chinchila. Selvagem só com C presente. Himalaio é c^h c^h ou c^h c^a. Albino é c^a c^a.',
    hint: 'Use a hierarquia da série alélica: C > c^ch > c^h > c^a. Em séries alélicas, quem manda é o que está mais à ESQUERDA. No genótipo c^ch c^a, qual dos dois está mais à esquerda na hierarquia? Esse define o fenótipo.',
    topic: 'Alelismo Múltiplo',
    difficulty: 'medium',
  },
  {
    id: 'q028',
    question: 'No sistema ABO humano, o tipo sanguíneo AB resulta de qual genótipo?',
    options: ['IA IA', 'IB i', 'IA IB', 'ii'],
    correct: 2,
    explanation:
      'AB ocorre quando o indivíduo carrega IA e IB simultaneamente — caso clássico de co-dominância no alelismo múltiplo. IA IA = grupo A. IB i = grupo B. ii = grupo O.',
    hint: 'Pra ter os DOIS antígenos A e B na superfície da hemácia, o indivíduo precisa carregar OS DOIS alelos correspondentes. IA e IB são co-dominantes — nenhum mascara o outro quando estão juntos. Qual genótipo combina ambos?',
    topic: 'Alelismo Múltiplo',
    difficulty: 'easy',
  },
  {
    id: 'q029',
    question: 'No sistema ABO, qual a relação de dominância entre IA, IB e i?',
    options: [
      'IA domina IB; ambos dominam i',
      'IB domina IA; ambos dominam i',
      'IA e IB são co-dominantes; ambos dominam i',
      'i domina IA e IB',
    ],
    correct: 2,
    explanation:
      'IA e IB são co-dominantes (no genótipo IAIB, ambos se expressam = AB). Ambos dominam o alelo i. i é totalmente recessivo. As outras opções inventam hierarquias inexistentes.',
    hint: 'Há dois fatos no sistema ABO: 1) IA e IB ficam no MESMO nível hierárquico — quando juntos, ambos se expressam (= grupo AB, co-dominância). 2) i é recessivo aos dois (precisa estar em homozigose ii pra dar grupo O). Não existe hierarquia entre IA e IB.',
    topic: 'Alelismo Múltiplo',
    difficulty: 'easy',
  },
  {
    id: 'q030',
    question: 'Por que a compatibilidade sanguínea é crítica em gatos, particularmente em filhotes AB nascidos de mãe B?',
    options: [
      'Porque gatos só têm sangue tipo O',
      'Porque o sistema A/B/AB felino segue alelismo múltiplo e a fêmea B produz anticorpos contra antígenos A no colostro, causando eritrólise neonatal',
      'Porque gatos não toleram transfusão',
      'Porque o sangue AB é tóxico em qualquer animal',
    ],
    correct: 1,
    explanation:
      'Em gatos, fêmeas tipo B possuem altos títulos de anticorpos anti-A naturais. Quando amamentam filhotes AB ou A, esses anticorpos atravessam pelo colostro e causam hemólise neonatal grave. Os outros itens são incorretos: gatos têm vários tipos, transfusão é possível com compatibilidade, AB não é tóxico per se.',
    hint: 'Pense fisiologicamente: gatas tipo B têm anticorpos anti-A em altos títulos NATURALMENTE (mesmo sem exposição prévia). No colostro, esses anticorpos passam para o filhote. Se o filhote tem antígeno A (tipo A ou AB), os anticorpos maternos atacam suas hemácias — eritrólise neonatal isoeritrolítica.',
    topic: 'Alelismo Múltiplo',
    difficulty: 'hard',
  },
  {
    id: 'q031',
    question: 'O sistema de grupos sanguíneos canino utiliza qual nomenclatura?',
    options: [
      'ABO (igual humanos)',
      'A/B/AB (igual felinos)',
      'DEA (Dog Erythrocyte Antigen) — DEA 1.1, 1.2, 3, 4, 5, 7',
      'Rh+/Rh-',
    ],
    correct: 2,
    explanation:
      'Em cães, o sistema é DEA com múltiplos antígenos (1.1, 1.2, 3, 4, 5, 7), cada um seguindo padrão de alelismo múltiplo. Cães NÃO usam ABO nem A/B/AB nem Rh — esses são humanos/felinos/humanos respectivamente.',
    hint: 'Cada espécie tem nomenclatura própria: humanos usam ABO/Rh, gatos usam A/B/AB, cães usam DEA (Dog Erythrocyte Antigen). A nomenclatura DEA inclui antígenos numerados (DEA 1.1, 1.2, 3, 4, 5, 7) — base para tipagem transfusional em cães.',
    topic: 'Alelismo Múltiplo',
    difficulty: 'hard',
  },
  {
    id: 'q032',
    question: 'Quantos alelos diferentes do gene C podem existir simultaneamente em UM coelho individual?',
    options: ['1', '2', '3', '4'],
    correct: 1,
    explanation:
      'Cada indivíduo diploide carrega exatamente 2 alelos (um materno, um paterno) em qualquer locus, mesmo que a população contenha 4 ou mais alelos diferentes. Esse é o ponto-chave do alelismo múltiplo: variabilidade está na população, não no indivíduo.',
    hint: 'Coelho é diploide — tem cromossomos em pares (homólogos). Logo, em CADA locus, carrega exatamente 2 alelos (um materno, um paterno). A quantidade de alelos no locus C na POPULAÇÃO pode ser 4, mas cada animal individualmente carrega só 2 deles.',
    topic: 'Alelismo Múltiplo',
    difficulty: 'medium',
  },
  {
    id: 'q033',
    question: 'Um coelho de pelagem himalaia pode ter qual(is) genótipo(s)?',
    options: [
      'Apenas c^h c^h',
      'c^h c^h ou c^h c^a',
      'C c^h ou c^ch c^h',
      'Apenas c^a c^a',
    ],
    correct: 1,
    explanation:
      'Himalaio é o terceiro da série. c^h domina apenas o albino (c^a). Logo, c^h c^h e c^h c^a manifestam himalaio. C c^h seria selvagem (C domina); c^ch c^h seria chinchila (c^ch domina); c^a c^a é albino.',
    hint: 'Use a hierarquia: C > c^ch > c^h > c^a. Para o fenótipo ser HIMALAIO, é preciso que c^h seja o alelo mais alto na hierarquia presente no genótipo. Isso significa: c^h c^h (homozigoto) OU c^h combinado com algo MAIS BAIXO (c^a, único alelo dominado por c^h).',
    topic: 'Alelismo Múltiplo',
    difficulty: 'medium',
  },

  // ============================================================
  // GENES LETAIS (8 questões) — q034 a q041
  // ============================================================
  {
    id: 'q034',
    question: 'Em 1905, Cuénot cruzou ratos amarelos × amarelos e obteve 2/3 amarelos : 1/3 não amarelos (esperava-se 3:1 = 75% : 25%). Por quê?',
    options: [
      'Mutação espontânea durante a gestação',
      'O genótipo homozigoto AyAy é letal embrionário — morre antes do nascimento',
      'A meiose falha em homozigotos',
      'O alelo Ay é recessivo',
    ],
    correct: 1,
    explanation:
      'AyAy é letal no embrião — só sobrevivem ½ Aya (amarelos) + ¼ aa (não amarelos), resultando em 2/3 : 1/3 entre os nascidos vivos. A meiose funciona normalmente; Ay é dominante para cor; mutação não explica resultados consistentes.',
    hint: 'Esperado: Aya × Aya daria 1 AyAy : 2 Aya : 1 aa (razão 1:2:1). Observado: só 2/3 amarelos. Pergunta: qual classe SUMIU? Se você "removesse" os AyAy, sobraria 2 Aya : 1 aa = exatamente 2/3 : 1/3 dos nascidos vivos. Esse é o primeiro gene letal descrito.',
    topic: 'Genes Letais',
    difficulty: 'medium',
  },
  {
    id: 'q035',
    question: 'Em bovinos da raça Dexter (acondroplasia), qual o genótipo dos animais comercializados como "Dexter típico"?',
    options: [
      'AA (homozigoto dominante — bulldog calf)',
      'Aa (heterozigoto)',
      'aa (homozigoto recessivo)',
      'XX/XY (depende do sexo)',
    ],
    correct: 1,
    explanation:
      'AA é letal embrionário (bulldog calf — morte fetal grave). aa é animal de pernas normais. Apenas Aa expressa o fenótipo Dexter típico (pernas curtas, sem ser letal). Por isso a raça só sobrevive como heterozigotos. O genótipo XX/XY é sexual, não relevante aqui.',
    hint: 'A acondroplasia do Dexter é "gene letal dominante com efeito recessivo": só morre quem é homozigoto dominante (AA = bulldog calf). aa é animal de pernas NORMAIS (sem o fenótipo Dexter). Quem fica vivo E com fenótipo Dexter (pernas curtas) tem qual genótipo?',
    topic: 'Genes Letais',
    difficulty: 'medium',
  },
  {
    id: 'q036',
    question: 'A DUMPS (Deficiência da Uridina Monofosfato Sintetase) em bovinos da raça Holandesa classifica-se como:',
    options: [
      'Gene letal dominante com efeito dominante',
      'Gene letal dominante com efeito recessivo',
      'Gene letal recessivo com efeito recessivo',
      'Mutação somática não hereditária',
    ],
    correct: 2,
    explanation:
      'DUMPS é recessivo: apenas aa morre (embrião 30-60 dias). Aa é portador assintomático com ácido orótico acumulado em sangue/leite/urina (utilizado para identificação). AA é normal. Mutação somática não é transmitida.',
    hint: 'Quem morre na DUMPS? Apenas os homozigotos RECESSIVOS (aa). Heterozigotos Aa são portadores assintomáticos (com ácido orótico elevado no leite — detectável em teste laboratorial). Quando só os homozigotos recessivos morrem, classifica-se como letal recessivo.',
    topic: 'Genes Letais',
    difficulty: 'medium',
  },
  {
    id: 'q037',
    question: 'O que é uma FENOCÓPIA?',
    options: [
      'Cópia exata do genótipo materno',
      'Fenótipo de causa AMBIENTAL que imita um fenótipo de origem genética, sem ser hereditário',
      'Mutação espontânea',
      'Sinônimo de pleiotropia',
    ],
    correct: 1,
    explanation:
      'Fenocópia é fenótipo ambiental que MIMETIZA um genético, mas NÃO é herdável. Exemplos: ácido bórico em ovos gera "rastejantes" sem ser genético; sementes de Swainsona causam manosidose-like em bovinos. Importante diferenciar em clínica — prognóstico/conduta mudam.',
    hint: 'Quebre a palavra: feno- (fenótipo) + -cópia (imitação). Algo que IMITA um aspecto, mas a causa é ambiental, não genética. Lembre do exemplo do ácido bórico em ovos de galinha (gera "rastejantes" idênticos ao Cc, mas a alteração não é hereditária). É crucial distinguir em clínica.',
    topic: 'Genes Letais',
    difficulty: 'medium',
  },
  {
    id: 'q038',
    question: 'Penetrância de um gene é definida como:',
    options: [
      'A intensidade com que o gene se manifesta em cada portador',
      'A porcentagem de indivíduos que CARREGAM o gene e que de fato EXPRESSAM o fenótipo',
      'A taxa de mutação espontânea',
      'A profundidade da inserção do DNA na cromatina',
    ],
    correct: 1,
    explanation:
      'Penetrância é % de portadores que MANIFESTAM o gene (0-100%). Polidactilia em aves tem penetrância ~60%. Intensidade é EXPRESSIVIDADE (diferente de penetrância). Taxa de mutação e inserção no cromossomo são outros conceitos.',
    hint: 'Penetrância responde "quantos?" (dos portadores, quantos manifestam o gene — binário, mostra ou não). Não confunda com EXPRESSIVIDADE, que responde "quão forte?" (intensidade da manifestação em quem manifestou).',
    topic: 'Genes Letais',
    difficulty: 'medium',
  },
  {
    id: 'q039',
    question: 'Em pleiotropia, um único gene afeta MAIS DE UMA característica. O gene "Polled" (mocho) em bovinos é exemplo clássico porque:',
    options: [
      'Causa apenas ausência de chifres',
      'Afeta presença/ausência de chifres E está associado a intersexualidade nas fêmeas homozigotas PP',
      'Causa cor de pelagem preta',
      'É letal em homozigose',
    ],
    correct: 1,
    explanation:
      'Polled é pleiotrópico: vacas PP são estéreis com características de intersexualidade; Pp normais e férteis; pp chifrudas normais. Não é apenas ausência de chifre nem está ligado à cor. Não é letal — apenas estéril em PP.',
    hint: 'Pleiotropia = 1 gene afeta VÁRIAS características. No gene Polled, além de ausência de chifres, o homozigoto dominante (PP) tem problemas reprodutivos sérios (intersexualidade, esterilidade). Se fosse só "ausência de chifres", seria efeito único — não pleiotrópico.',
    topic: 'Genes Letais',
    difficulty: 'hard',
  },
  {
    id: 'q040',
    question: 'Um gato Manx vivo é necessariamente:',
    options: [
      'MM (homozigoto dominante)',
      'Mm (heterozigoto)',
      'mm (homozigoto recessivo)',
      'Pode ser qualquer um dos três',
    ],
    correct: 1,
    explanation:
      'MM é letal embrionário com malformações no SNC. mm tem cauda normal (não é Manx). Todo Manx vivo é heterozigoto Mm — exibe deformidade na cauda (rumpy, rumpy riser, stumpy, longie) mas sobrevive.',
    hint: 'Mesma lógica do Dexter: o alelo M é letal em dose dupla. MM morre embrionário. mm não tem o fenótipo Manx (cauda normal). Se o gato está VIVO E é Manx (sem cauda ou cauda deformada), sobra qual genótipo?',
    topic: 'Genes Letais',
    difficulty: 'medium',
  },
  {
    id: 'q041',
    question: 'Aconselhamento genético: um gene dominante causador de doença tem penetrância de 60%. Se um animal afetado é heterozigoto e cruza com um normal, qual o risco aproximado de um descendente apresentar a doença?',
    options: [
      '60% (chance de penetrar)',
      '50% (chance de herdar o alelo)',
      '30% (chance de herdar × chance de penetrar = 0,5 × 0,6)',
      '100%',
    ],
    correct: 2,
    explanation:
      'O cálculo combina os dois passos: 50% de chance de herdar (Aa × aa) × 60% de penetrância = 30%. Apenas 50% ignora penetrância; apenas 60% ignora a probabilidade de transmissão; 100% supõe penetrância e dominância perfeitas.',
    hint: 'Pense em DOIS passos independentes: 1) probabilidade do filho HERDAR o alelo (Aa × aa → 50%). 2) Dos que herdaram, quantos MANIFESTAM (penetrância de 60%). Multiplique as duas: 0,5 × 0,6. Esquecer um dos passos é o erro clássico das outras opções.',
    topic: 'Genes Letais',
    difficulty: 'hard',
  },

  // ============================================================
  // INTERAÇÃO GÊNICA ENTRE NÃO-ALELOS (10 questões) — q042 a q051
  // ============================================================
  {
    id: 'q042',
    question: 'Em galinhas, cruzamento de crista rosa (RRee) × crista ervilha (rrEE) gera F1 100% crista NOZ (RrEe). Qual o tipo de interação?',
    options: [
      'Dominância completa simples',
      'Interação complementar — dois genes complementam-se gerando um fenótipo NOVO',
      'Epistasia dominante',
      'Pleiotropia',
    ],
    correct: 1,
    explanation:
      'Quando dois genes não-alelos juntos geram um fenótipo NOVO (noz), há interação complementar — razão F2 = 9:3:3:1 (noz, rosa, ervilha, serra). Dominância simples não cria fenótipo novo. Epistasia mascara, não complementa. Pleiotropia é 1 gene → vários efeitos.',
    hint: 'A pista é o aparecimento de um fenótipo NOVO (noz) quando os dois dominantes se encontram — algo que NENHUM dos pais tinha. Esse "fenótipo emergente" caracteriza interação COMPLEMENTAR. Não confunda com epistasia (que MASCARA um gene) nem com pleiotropia (1 gene → vários efeitos).',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'medium',
  },
  {
    id: 'q043',
    question: 'Qual a razão fenotípica F2 esperada em interação complementar (ex.: crista em galinhas)?',
    options: ['3:1', '1:2:1', '9:3:3:1', '13:3'],
    correct: 2,
    explanation:
      'Complementar mantém a 9:3:3:1 — mas os 4 fenótipos têm SIGNIFICADOS distintos (noz, rosa, ervilha, serra). 3:1 e 1:2:1 são monoibridismo. 13:3 é epistasia dominante.',
    hint: 'A interação complementar mantém a mesma razão da 2ª Lei (9:3:3:1) — o que muda é o significado das classes (em vez de combinações de dominante/recessivo, são 4 fenótipos qualitativamente diferentes). Memorize as razões-assinatura: 9:3:3:1, 9:6:1, 9:3:4, 13:3, 15:1.',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'easy',
  },
  {
    id: 'q044',
    question: 'Em cães Labrador, o gene C controla preto/marrom (C_ preto, cc marrom) e o gene E permite a expressão do C (E_ permissivo, ee bloqueia). Qual o fenótipo de um cão com genótipo ccee?',
    options: ['Preto', 'Marrom', 'Dourado', 'Branco'],
    correct: 2,
    explanation:
      'ee bloqueia a expressão do gene C, gerando fenótipo dourado independentemente de C ser CC ou cc. Esta é a definição de epistasia recessiva. Para preto seria C_E_; para marrom ccE_; branco não é fenótipo do sistema Labrador.',
    hint: 'No Labrador, o gene E é "gatekeeper" da cor. Quando ee aparece, ele BLOQUEIA a expressão do gene C — não importa se C é CC, Cc ou cc, o cão fica dourado. Isso é epistasia recessiva (volte na seção sobre epistasia no módulo 6).',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'medium',
  },
  {
    id: 'q045',
    question: 'A razão fenotípica F2 de 9:3:4 (ex.: Labrador preto:marrom:dourado) caracteriza:',
    options: [
      'Interação complementar',
      'Epistasia dominante (inibidora)',
      'Epistasia recessiva (suplementar)',
      'Interação multiplicada',
    ],
    correct: 2,
    explanation:
      '9:3:4 é assinatura da epistasia recessiva: 9 duplo-dominante + 3 cc com E_ + 4 (todos os ee, somando C_ee e ccee). Complementar = 9:3:3:1; epistasia dominante = 13:3; multiplicada = 15:1.',
    hint: 'A razão 9:3:4 indica que duas classes se fundiram numa só pelo "4". No Labrador, o homozigoto recessivo ee (em qualquer combinação com C) gera o mesmo fenótipo dourado: 3 C_ee + 1 ccee = 4. Esse padrão (recessivo de um gene mascarando outro) é a assinatura de qual tipo de epistasia?',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'medium',
  },
  {
    id: 'q046',
    question: 'Em galinhas Leghorn, o gene I é dominante e INIBE a expressão do gene C (penas coloridas). Genótipos C_I_ são brancos, C_ii coloridos, cc__ brancos. Qual a razão F2 esperada?',
    options: ['9:3:3:1', '15:1', '13:3', '9:3:4'],
    correct: 2,
    explanation:
      '13:3 é a assinatura da epistasia dominante (inibidora): 9 C_I_ + 3 ccI_ + 1 ccii (brancos) = 13 brancos; 3 C_ii = 3 coloridos. As demais razões correspondem a outras interações.',
    hint: 'Quando o alelo DOMINANTE de um gene (I) inibe a expressão do outro, qualquer classe que tenha I_ vira branca (mascara). Some: 9 (C_I_) + 3 (ccI_) + 1 (ccii por não ter C) = 13 brancos. Sobra só 3 (C_ii) coloridos. Essa razão é a assinatura da epistasia dominante.',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'medium',
  },
  {
    id: 'q047',
    question: 'Em galinhas, presença de penas nos pés ocorre quando há pelo menos UM alelo dominante em qualquer dos dois loci A ou B. F2 gera 15/16 com penas : 1/16 sem penas. Qual a interação?',
    options: [
      'Complementar',
      'Multiplicada (redundância — qualquer dominante gera o fenótipo)',
      'Epistasia recessiva',
      'Pleiotropia',
    ],
    correct: 1,
    explanation:
      'Multiplicada (ou redundante): A ou B isoladamente dominante já gera o fenótipo. Só aabb (1/16) não tem penas. Complementar daria 9:3:3:1. Epistasia recessiva daria 9:3:4. Pleiotropia é um gene afetando múltiplos fenótipos, não dois genes redundantes.',
    hint: 'Pense em REDUNDÂNCIA: os dois genes fazem a mesma coisa. Basta ter pelo menos um alelo dominante em qualquer um dos dois locos para gerar o fenótipo. Só uma classe (a duplo-recessiva aabb = 1/16) NÃO terá penas — todas as outras 15/16 terão. Daí o 15:1.',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'medium',
  },
  {
    id: 'q048',
    question: 'Em equinos, cruzamento de preto (aaBB) × alazã (AAbb) gera F1 100% baio (AaBb). A F2 segrega 9 baio : 3 preto : 3 alazã : 1 castanho. Esse é um exemplo de:',
    options: [
      'Dominância completa simples',
      'Interação complementar (4 fenótipos a partir de 2 pares de genes)',
      'Epistasia dominante',
      'Sobredominância',
    ],
    correct: 1,
    explanation:
      'A interação complementar gera 4 fenótipos distintos em razão 9:3:3:1 — exatamente o observado em equinos. Dominância simples não cria fenótipo novo (baio é novo). Epistasia daria 13:3 ou 9:3:4. Sobredominância é dentro do mesmo locus.',
    hint: 'Observe os indicadores: 1) F1 com cor NOVA (baio — nem preto nem alazã); 2) razão F2 igual à da 2ª Lei (9:3:3:1). Esses dois critérios juntos apontam para qual tipo de interação? Epistasia daria razões diferentes (13:3 ou 9:3:4). Sobredominância é entre alelos do mesmo locus.',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'medium',
  },
  {
    id: 'q049',
    question: 'Em cruzamento de suínos cor de pelagem (interação complementar com fusão), F2 gera 9 vermelha : 6 amarelo-suja : 1 branca. A razão 9:6:1 é uma variação da:',
    options: [
      'Epistasia recessiva (9:3:4)',
      'Epistasia dominante (13:3)',
      'Interação complementar com FUSÃO de fenótipos intermediários (A_bb e aaB_ têm o mesmo fenótipo)',
      'Multiplicada (15:1)',
    ],
    correct: 2,
    explanation:
      'Em 9:6:1, as classes A_bb e aaB_ se fundem no mesmo fenótipo amarelo-suja (3+3=6). É uma variação da complementar — não é epistasia (não há mascaramento) nem multiplicada (15:1 fundiria também a aabb). A 9:3:4 envolve dois alelos recessivos formando um único fenótipo.',
    hint: 'Compare 9:3:3:1 (complementar pura) com 9:6:1: a diferença é que as duas classes "3" (A_bb e aaB_) caem no MESMO fenótipo intermediário (amarelo-suja). Por isso somam: 3 + 3 = 6. Não há mascaramento (não é epistasia) — é "fusão" das classes intermediárias.',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'hard',
  },
  {
    id: 'q050',
    question: 'Um criador de Labrador cruzou dois cães marrons e obteve filhotes dourados. Como isso é possível?',
    options: [
      'Mutação ambiental espontânea',
      'Os pais marrons (ccE_) podem ser heterozigotos para E. Se ambos forem ccEe, o cruzamento ccEe × ccEe gera 1/4 ccee (dourados)',
      'Houve troca de filhotes',
      'A genética dourada só vem da mãe',
    ],
    correct: 1,
    explanation:
      'Pais marrons ccE_ podem mascarar Ee heterozigoto. Cruzamento ccEe × ccEe gera ¼ ccEE + 2/4 ccEe (marrons) + ¼ ccee (dourados). A genética é simétrica entre pai e mãe (a alternativa 4 é falsa). Mutação espontânea não explica resultados consistentes.',
    hint: 'Marrom no Labrador é ccE_ — o "_" pode estar escondendo Ee (heterozigoto). Se ambos pais forem ccEe, cruze só o gene E: Ee × Ee = ¼ ee. Combinado com cc do gene C, dá fenótipo dourado. Esse é o caso clássico de heterozigotos portadores de um alelo recessivo escondido.',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'hard',
  },
  {
    id: 'q051',
    question: 'A diferença entre EPISTASIA e DOMINÂNCIA é:',
    options: [
      'São sinônimos',
      'Dominância ocorre entre alelos do MESMO locus; epistasia ocorre entre genes não-alelos em LOCI DIFERENTES (um mascara o outro)',
      'Dominância só em plantas; epistasia só em animais',
      'Dominância só em recessivos; epistasia só em dominantes',
    ],
    correct: 1,
    explanation:
      'Dominância é a relação entre alelos do mesmo gene (Aa expressa A). Epistasia é interação ENTRE genes diferentes — o produto de um gene mascara o do outro. As outras opções são falsas.',
    hint: 'Pergunta-chave: o "mascaramento" é entre alelos do MESMO gene (mesmo locus) ou entre genes DIFERENTES (loci diferentes)? Dominância age dentro de um locus (A mascara a). Epistasia age entre loci diferentes (gene 1 mascara gene 2).',
    topic: 'Interação Gênica entre não-alelos',
    difficulty: 'medium',
  },

  // ============================================================
  // INTERAÇÃO GÊNICA EM GATOS (5 questões) — q052 a q056
  // ============================================================
  {
    id: 'q052',
    question: 'Por que um gato siamês nasce todo branco e desenvolve pigmentação escura nas extremidades (orelhas, focinho, patas, cauda) conforme cresce?',
    options: [
      'Mutação somática durante o crescimento',
      'O alelo c^s codifica uma tirosinase TERMO-SENSÍVEL — funciona apenas em áreas mais frias do corpo (extremidades)',
      'Apenas alimentação',
      'Os pelos das extremidades crescem mais lentamente',
    ],
    correct: 1,
    explanation:
      'Acromelanismo siamês: tirosinase ativa só em baixa temperatura (extremidades). No útero quente, o gatinho nasce branco; depois, ao expor extremidades ao frio relativo, pigmenta. Em climas frios o siamês fica mais escuro; quentes mais claro. Não é mutação somática nem dieta.',
    hint: 'Observação chave: o que as áreas pigmentadas têm em comum (orelhas, focinho, patas, cauda)? Todas são mais FRIAS que o tronco. O alelo c^s codifica uma enzima sensível à TEMPERATURA — é por isso que no útero quente o gatinho nasce branco, e só pigmenta as extremidades depois.',
    topic: 'Interação Gênica em Gatos',
    difficulty: 'medium',
  },
  {
    id: 'q053',
    question: 'O genótipo correspondente ao gato CASCO-DE-TARTARUGA (calico/tortie) é tipicamente:',
    options: [
      'X^O Y (macho laranja)',
      'X^O X^O (fêmea homozigota laranja)',
      'X^O X^o (fêmea heterozigota — mosaico de manchas pretas e laranjas)',
      'X^o X^o Y (macho preto com Y extra)',
    ],
    correct: 2,
    explanation:
      'Casco-de-tartaruga é fêmea heterozigota X^O X^o — inativação aleatória de um dos X (corpúsculo de Barr / lyonização) gera mosaico. X^O Y é macho laranja. X^O X^O é fêmea laranja sólida. Macho tortie precisa de XXY (Klinefelter-like, geralmente estéril).',
    hint: 'O gene O fica no cromossomo X. Para ter manchas pretas E laranjas no mesmo animal, precisa carregar OS DOIS alelos (X^O e X^o). Em qual sexo isso é normal? E qual fenômeno (lyonização / corpúsculo de Barr) garante o mosaico?',
    topic: 'Interação Gênica em Gatos',
    difficulty: 'medium',
  },
  {
    id: 'q054',
    question: 'O loco W em gatos é EPISTÁTICO. Isso significa que:',
    options: [
      'W é recessivo a todos os outros loci',
      'W (branco) MASCARA a expressão de todos os outros loci de cor — gato W_ é branco independente do genótipo nos demais loci',
      'W só age nos olhos',
      'W é letal em homozigose',
    ],
    correct: 1,
    explanation:
      'W dominante mascara todos os outros genes de cor: mesmo um gato W_ geneticamente "preto" parece branco. Diferente de albino (cc — sem melanina nenhuma), o gato W produz melanina, mas ela não chega ao pelo. Surdez é frequente em W_ com olhos azuis. Não é letal em homozigose isoladamente.',
    hint: 'Epistático = mascara outros genes não-alelos. No gato, W dominante mascara TODOS os outros loci de cor. Não confunda com albino (cc) — esse não tem tirosinase e tem olhos vermelhos. O gato W_ produz melanina, mas ela não chega ao pelo. Lembre: W_ + olhos azuis = risco de surdez.',
    topic: 'Interação Gênica em Gatos',
    difficulty: 'medium',
  },
  {
    id: 'q055',
    question: 'Por que machos calicos (casco-de-tartaruga) são extremamente raros e quase sempre estéreis?',
    options: [
      'Por causa de fatores ambientais',
      'Precisam ter dois cromossomos X (X^O X^o Y) — uma síndrome similar a Klinefelter, associada a esterilidade',
      'Não existem, é mito',
      'Apenas em raças orientais',
    ],
    correct: 1,
    explanation:
      'Casco-de-tartaruga exige X^O e X^o no mesmo animal. Em machos, isso implica XXY (cromossomo X extra) — análogo à síndrome de Klinefelter em humanos, associada à esterilidade. Existem, mas são raros e geralmente estéreis. Não há relação com raça.',
    hint: 'Macho normal é XY — só tem 1 cromossomo X. Mas o gene O está no X. Para um macho ter os DOIS alelos (X^O e X^o), ele precisa de DOIS X — um cariótipo XXY. Lembre: em humanos, XXY = síndrome de Klinefelter, com esterilidade frequente. Em gatos, o mecanismo é análogo.',
    topic: 'Interação Gênica em Gatos',
    difficulty: 'medium',
  },
  {
    id: 'q056',
    question: 'O padrão tabby (listras/manchas escuras) em gatos só aparece em animais com qual genótipo no loco A?',
    options: [
      'aa (não aguti)',
      'A_ (aguti)',
      'Independe do loco A',
      'Apenas em gatos brancos',
    ],
    correct: 1,
    explanation:
      'O padrão tabby (loco T) só se manifesta sobre fundo aguti (A_). Em aa (não aguti), a pelagem fica sólida e o padrão tabby fica mascarado. Em gatos brancos (W_), todos os outros padrões são mascarados.',
    hint: 'O padrão aguti é a "tela" sobre a qual o tabby pinta as listras. Sem aguti (aa = cor sólida), não há onde aparecer o padrão de bandas. O loco A é PRÉ-REQUISITO para o loco T se expressar — pense em uma relação de série, onde aguti precede tabby.',
    topic: 'Interação Gênica em Gatos',
    difficulty: 'medium',
  },

  // ============================================================
  // COR DE PELAGEM EM MAMÍFEROS / CÃES (8 questões) — q057 a q064
  // ============================================================
  {
    id: 'q057',
    question: 'Os pigmentos da pelagem dos mamíferos são:',
    options: [
      'Eumelanina (preto/castanho) e feomelanina (amarelo/vermelho)',
      'Apenas melanina',
      'Hemoglobina e mioglobina',
      'Carotenoides apenas',
    ],
    correct: 0,
    explanation:
      'Os dois pigmentos principais são eumelanina (preto/marrom) e feomelanina (amarelo/vermelho/bronze), ambos produzidos por melanócitos via tirosinase. Hemoglobina/mioglobina estão no sangue/músculo, não em pelos. Carotenoides aparecem em algumas espécies (aves, peixes), mas não são os principais em mamíferos.',
    hint: 'Mamíferos têm DOIS tipos de melanina: EU- (preta/marrom) e FEO- (amarela/vermelha). Os melanócitos sintetizam ambas via tirosinase, depositando-as nos pelos. Hemoglobina é só no sangue (não em pelos). Carotenoides são típicos de aves e peixes — não dão a cor base dos mamíferos.',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'easy',
  },
  {
    id: 'q058',
    question: 'Em cães, o loco E (gene MC1R) tem alelos E^m, E e e. Qual o efeito do genótipo ee?',
    options: [
      'Gera máscara preta no focinho',
      'BLOQUEIA totalmente a produção de eumelanina — o animal fica amarelo/dourado',
      'Diluição da cor',
      'Branco com olhos azuis',
    ],
    correct: 1,
    explanation:
      'ee bloqueia eumelanina por completo: o cão fica amarelo/dourado (Golden Retriever, Labrador amarelo) independentemente do genótipo no loco B. E^m gera máscara preta. Diluição é do loco D. Branco com olhos azuis seria W ou outros.',
    hint: 'O loco E é "gatekeeper" da eumelanina. Em ee, a chave está DESLIGADA — nenhuma eumelanina é depositada, sobra só feomelanina (amarelo/dourado). É o caso de Golden e Labrador amarelo. E^m é a máscara preta (eumelanina concentrada no focinho); diluição é do loco D.',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'medium',
  },
  {
    id: 'q059',
    question: 'O cruzamento entre dois Golden Retriever (ambos ee) raramente gera filhotes pretos. Por quê?',
    options: [
      'Mutação aleatória',
      'Ambos ee — ee × ee = 100% ee (sem produção de eumelanina). Para preto, precisaria E_ em pelo menos um dos pais',
      'Apenas dieta',
      'Inativação do cromossomo X',
    ],
    correct: 1,
    explanation:
      'Goldens são todos ee. Cruzamento ee × ee gera 100% ee — nenhum descendente produzirá eumelanina. Para um filhote preto, precisaríamos cruzar Golden ee com um cão E_ (ex.: Labrador chocolate Ee → 50% E_ pretos/marrons + 50% ee dourados).',
    hint: 'Goldens são TODOS ee (por isso são dourados). Faça o cruzamento mental ee × ee → 100% ee. Pra cor preta aparecer, precisaria pelo menos um alelo E em algum dos pais. Como ambos são ee, fica impossível. Lembre que o loco E é gatekeeper da eumelanina.',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'medium',
  },
  {
    id: 'q060',
    question: 'Um Labrador chocolate é geneticamente:',
    options: [
      'ee (qualquer B)',
      'bb E_ (precisa de eumelanina presente E ser marrom)',
      'B_E_',
      'cc (albino)',
    ],
    correct: 1,
    explanation:
      'Chocolate exige bb (marrom no loco B) E não pode ser ee (ee bloquearia eumelanina, virando amarelo). Logo bb E_. ee daria amarelo independente de B. B_E_ daria preto. cc seria albino.',
    hint: 'Pra ser chocolate, o cão precisa de DUAS condições simultâneas: 1) eumelanina marrom (bb no loco B) E 2) permissão para produzir eumelanina (E_ no loco E). Se ee, vira amarelo (bloqueia eumelanina); se B_, vira preto.',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'medium',
  },
  {
    id: 'q061',
    question: 'O alelo K^B em cães atua de forma:',
    options: [
      'Recessiva — só aparece em homozigose',
      'Epistática DOMINANTE sobre o loco A — mascara o padrão do loco A, gerando cor preta sólida',
      'Co-dominante com o loco B',
      'Letal em homozigose',
    ],
    correct: 1,
    explanation:
      'K^B é epistático dominante. Mesmo cães geneticamente a^y a^y (sable) ou a^t a^t (bicolor), se carregam K^B, expressam preto sólido. Não é letal nem co-dominante com B. Não é recessivo.',
    hint: 'K^B "sobrescreve" o loco A — mesmo cão geneticamente sable (a^y a^y) ou bicolor (a^t a^t), se carregar K^B, vira preto sólido. Por ser DOMINANTE (basta uma cópia) e MASCARAR outro gene não-alelo, é classificado como epistasia dominante.',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'medium',
  },
  {
    id: 'q062',
    question: 'Por que cruzamentos Merle × Merle (Mm × Mm) são proibidos eticamente em várias raças?',
    options: [
      'Por causa de cor inadequada',
      'Geram 25% MM (homozigotos), com problemas graves: surdez, cegueira, esterilidade e alta mortalidade',
      'Mm é letal isoladamente',
      'Não há base científica para a proibição',
    ],
    correct: 1,
    explanation:
      'Mm × Mm gera ¼ MM + ½ Mm + ¼ mm. Os MM têm sérias anomalias (SNC, audição, visão, fertilidade) e alta mortalidade. Mm é saudável. mm é normal. Por isso a proibição em entidades caninas. Cor não é o problema; é bem-estar animal.',
    hint: 'O alelo M (merle) é um "letal dominante com efeito recessivo": Mm gera cão saudável com padrão merle, MAS MM em homozigose desregula a migração dos melanócitos, que compartilham tecidos embrionários com SNC e ouvido interno — daí cegueira, surdez, esterilidade. Cruzar Mm × Mm produz ¼ MM, eticamente inaceitável.',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'medium',
  },
  {
    id: 'q063',
    question: 'Um Doberman tipicamente apresenta pelagem preta com marcas tan (focinho, peito, patas). Qual o genótipo provável no loco A?',
    options: [
      'a^y a^y (sable)',
      'a^w a^w (aguti)',
      'a^t a^t (bicolor — preto dorsal + tan ventral)',
      'aa (preto sólido)',
    ],
    correct: 2,
    explanation:
      'a^t a^t (bicolor) é o padrão clássico de Doberman, Rottweiler, Pastor Alemão tipo black-and-tan. a^y é sable (Pequinês, Akita); a^w é aguti selvagem; aa é preto SÓLIDO (sem tan).',
    hint: 'Pense na hierarquia do loco A: a^y (sable, dourado com pelos pretos esparsos) > a^w (aguti selvagem, faixas em cada pelo) > a^t (bicolor preto/tan, padrão Doberman/Rottweiler) > a (preto sólido). Doberman tem MARCAS tan distintas — qual desses padrões encaixa?',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'hard',
  },
  {
    id: 'q064',
    question: 'O genótipo provável de um Golden Retriever creme claro (quase branco) é:',
    options: [
      'B_E_II',
      'C_a^y _ ee ii (sable + ee bloqueando eumelanina + ii diluindo feomelanina)',
      'cc (albino)',
      'MM (merle homozigoto)',
    ],
    correct: 1,
    explanation:
      'Golden creme: C_ pigmentado, a^y restrita, ee bloqueia eumelanina, ii dilui a feomelanina restante → quase branco. B_E_II daria preto/marrom intenso. cc seria albino com olhos vermelhos. MM teria problemas graves.',
    hint: 'Pra ser quase branco mas NÃO albino, combine: 1) ee bloqueia eumelanina (sem preto/marrom); 2) ii dilui a feomelanina restante (do dourado intenso pra creme claro). Cobre os dois efeitos. cc seria albino verdadeiro (olhos vermelhos); MM teria problemas graves de SNC.',
    topic: 'Cor de Pelagem em Mamíferos',
    difficulty: 'hard',
  },

  // ============================================================
  // PADRÕES DE HERANÇA (12 questões) — q065 a q076
  // ============================================================
  {
    id: 'q065',
    question: 'Em um heredograma, uma doença aparece em filhos de pais aparentemente normais e afeta machos e fêmeas igualmente. Qual o padrão MAIS provável?',
    options: [
      'Autossômica dominante',
      'Autossômica recessiva (pais portadores Aa, filhos afetados aa)',
      'Ligada ao X dominante',
      'Restrita ao Y',
    ],
    correct: 1,
    explanation:
      'Pais normais + filhos afetados + sexos igualmente afetados → padrão recessivo autossômico. AD não pula gerações. X dominante mostraria todos os filhos de pai afetado afetados (filhas). Y só macho.',
    hint: 'Duas pistas no heredograma: 1) ambos os sexos igualmente afetados → exclui ligada ao sexo. 2) pais NORMAIS com filhos AFETADOS → o alelo estava "escondido" como heterozigoto. Que padrão "pula gerações" e tem pais portadores assintomáticos?',
    topic: 'Padrões de Herança',
    difficulty: 'medium',
  },
  {
    id: 'q066',
    question: 'Distrofia Muscular Progressiva ligada ao X em cães (Golden Retriever, Terrier Irlandês) é ligada ao X recessiva. Se a mãe é portadora (X^A X^a) e o pai normal (X^A Y), qual a chance de um FILHO MACHO ser afetado?',
    options: ['0%', '25%', '50%', '100%'],
    correct: 2,
    explanation:
      'Mãe X^A X^a × pai X^A Y. Filhos machos: 50% X^A Y (normais) + 50% X^a Y (afetados). Filhas: 50% X^A X^A + 50% X^A X^a (portadoras). 0% seria impossível para esse cenário; 25% seria recessiva autossômica.',
    hint: 'Os filhos machos recebem o Y do pai e o X da mãe. A mãe é heterozigota X^A X^a → metade dos gametas X dela carregam o alelo mutado. Como o macho é hemizigoto (só tem 1 X), basta receber X^a pra manifestar. Não tem o "mascaramento" da segunda cópia que existe em fêmeas.',
    topic: 'Padrões de Herança',
    difficulty: 'medium',
  },
  {
    id: 'q067',
    question: 'Em ligada ao X recessiva, um macho afetado (X^a Y) cruzado com uma fêmea normal homozigota (X^A X^A) gera:',
    options: [
      '50% filhas afetadas',
      '100% filhas portadoras assintomáticas, 100% filhos normais (machos recebem Y do pai e X^A da mãe)',
      '50% filhos afetados',
      '100% afetados',
    ],
    correct: 1,
    explanation:
      'X^a Y (pai afetado) × X^A X^A → filhas X^A X^a (todas portadoras) + filhos X^A Y (todos normais, herdam Y do pai e X^A da mãe). Macho NUNCA transmite X-linked ao filho macho (passa o Y).',
    hint: 'Regra de ouro X-linked: filhas SEMPRE recebem o X do pai. Filhos NUNCA recebem o X do pai (recebem o Y). Pai X^a Y afetado passa: X^a para todas as filhas (todas viram portadoras X^A X^a) e Y para todos os filhos (que recebem X^A da mãe normal). Pula entre gerações masculinas.',
    topic: 'Padrões de Herança',
    difficulty: 'hard',
  },
  {
    id: 'q068',
    question: 'Displasia Coxofemoral (DCF) em cães é classificada como:',
    options: [
      'Doença monogênica autossômica dominante',
      'Doença ligada ao X recessiva',
      'Doença multifatorial — muitos genes envolvidos + grande influência ambiental (peso, exercício, dieta)',
      'Doença restrita ao Y',
    ],
    correct: 2,
    explanation:
      'DCF é multifatorial clássica: dezenas de genes + ambiente (peso, dieta, exercício, piso). Animais com predisposição em ambiente controlado podem não desenvolver sintomas; ambiente errado piora mesmo com menos predisposição. Não é monogênica nem ligada ao sexo.',
    hint: 'DCF é o exemplo canônico de doença multifatorial em medicina veterinária. Pista: dois cães geneticamente predispostos desenvolvem DCF de jeitos muito diferentes conforme peso, exercício, dieta. Esse forte componente ambiental é o que diferencia multifatorial de doenças monogênicas.',
    topic: 'Padrões de Herança',
    difficulty: 'medium',
  },
  {
    id: 'q069',
    question: 'Produção de leite em vacas é exemplo clássico de herança:',
    options: [
      'Limitada pelo sexo — gene autossômico regulado por hormônios sexuais; só fêmeas manifestam, mas touros transmitem aos descendentes',
      'Ligada ao X',
      'Ligada ao Y',
      'Restrita ao sexo',
    ],
    correct: 0,
    explanation:
      'Produção de leite envolve genes AUTOSSÔMICOS que só se expressam em fêmeas (regulação hormonal). Touros carregam e transmitem os alelos para as filhas. Não é ligada ao X (X seria diferente padrão); Y exclui fêmeas; restrita ao sexo é só Y/holândrica.',
    hint: 'Pergunta-chave: o gene é AUTOSSÔMICO (presente em ambos os sexos no cromossomo somático) ou está num cromossomo sexual? Os touros CARREGAM os alelos pra produção de leite e os TRANSMITEM pras filhas — só as filhas EXPRESSAM (regulação hormonal). Quando gene é autossômico mas só um sexo manifesta, chamamos de LIMITADA pelo sexo.',
    topic: 'Padrões de Herança',
    difficulty: 'medium',
  },
  {
    id: 'q070',
    question: 'PKD (Rim Policístico) em gatos Persas tem padrão de herança:',
    options: [
      'Recessiva ligada ao X',
      'Autossômica recessiva',
      'Autossômica DOMINANTE — basta uma cópia para desenvolver cistos progressivos',
      'Multifatorial',
    ],
    correct: 2,
    explanation:
      'PKD é AD: cada portador afetado tem 50% de chance de passar à prole. Aparece em gerações consecutivas, ambos os sexos afetados. Recessiva exigiria homozigose. Ligada ao X teria padrão sexual diferente. Multifatorial envolveria ambiente significativo.',
    hint: 'PKD aparece em CADA geração de gatos Persas afetados — sinal típico de dominante (não pula gerações). Cada afetado tem 50% de risco de passar à prole. Recessiva exigiria pais portadores e "saltos" entre gerações; ligada ao X teria padrão dependente do sexo; multifatorial envolveria forte componente ambiental.',
    topic: 'Padrões de Herança',
    difficulty: 'medium',
  },
  {
    id: 'q071',
    question: 'Acrodermatite letal em cães Bull Terrier classifica-se como:',
    options: [
      'Autossômica dominante',
      'Autossômica recessiva (animais aa não metabolizam zinco e morrem)',
      'Ligada ao X',
      'Restrita ao Y',
    ],
    correct: 1,
    explanation:
      'Acrodermatite letal Bull Terrier é AR: animais aa não metabolizam zinco, apresentam alopecia esfoliativa e morrem precocemente. Não respondem a suplementos orais de zinco. Pais portadores são assintomáticos. Os outros padrões não se aplicam.',
    hint: 'A acrodermatite letal aparece em filhotes de pais aparentemente normais (portadores Aa). Doenças metabólicas hereditárias graves (defeito enzimático grave) costumam ser autossômicas recessivas — só aparecem em homozigose. Ambos os sexos igualmente afetados confirma autossômica.',
    topic: 'Padrões de Herança',
    difficulty: 'hard',
  },
  {
    id: 'q072',
    question: 'Em padrão ligado ao X recessivo, qual das regras abaixo é FALSA?',
    options: [
      'Machos afetados são mais frequentes que fêmeas afetadas',
      'Macho afetado transmite o alelo a TODAS as filhas (que se tornam portadoras)',
      'Macho afetado transmite o alelo aos filhos (que se tornam afetados)',
      'Fêmea afetada exige duas cópias do alelo (homozigota X^a X^a)',
    ],
    correct: 2,
    explanation:
      'FALSA: macho NUNCA transmite gene X-linked ao filho macho (passa o Y, não o X com a mutação). As demais regras são verdadeiras: machos hemizigotos → mais afetados; pai afetado → filhas portadoras; fêmea afetada precisa de 2 X^a.',
    hint: 'Cuidado — a pergunta pede o que é FALSO. Pai macho passa Y para o filho macho (que vem do pai), NÃO X. Logo, um gene X-linked do pai NUNCA chega ao filho macho. Reveja as 3 regras das ligadas ao X recessivas do módulo 9.',
    topic: 'Padrões de Herança',
    difficulty: 'hard',
  },
  {
    id: 'q073',
    question: 'Chifres na raça Dorset (ovinos) — dominante em machos, recessivo em fêmeas. Este é exemplo de:',
    options: [
      'Herança ligada ao X',
      'Herança restrita ao Y',
      'Herança influenciada pelo sexo (dominância depende do sexo)',
      'Herança limitada pelo sexo',
    ],
    correct: 2,
    explanation:
      'Influenciada pelo sexo: mesmo gene autossômico tem DOMINÂNCIA diferente conforme sexo (heterozigoto Hh = chifrudo em macho, mocho em fêmea). Limitada pelo sexo só manifesta num sexo (não muda dominância). Ligada ao X teria padrão de cromossomo sexual. Y exclui fêmeas.',
    hint: 'Note o detalhe: a DOMINÂNCIA do alelo MUDA com o sexo (dominante em machos, recessivo em fêmeas). Os dois sexos manifestam, mas com regras de expressão diferentes. Quando a dominância depende do sexo (sem ser cromossomo sexual), o termo correto é "influenciada pelo sexo". LIMITADA pelo sexo é diferente (só um sexo manifesta — caso do leite).',
    topic: 'Padrões de Herança',
    difficulty: 'hard',
  },
  {
    id: 'q074',
    question: 'A diferença entre herança LIMITADA pelo sexo e INFLUENCIADA pelo sexo é:',
    options: [
      'Não há diferença',
      'Limitada: gene autossômico só se expressa em UM sexo (leite, ovos). Influenciada: gene autossômico tem DOMINÂNCIA diferente conforme o sexo do portador (calvície, chifres Dorset)',
      'Limitada é só em mamíferos; influenciada só em aves',
      'Ambas são ligadas ao X',
    ],
    correct: 1,
    explanation:
      'Limitada = manifestação em apenas um sexo (produção de leite/ovos). Influenciada = mesmo gene tem dominância diferente conforme sexo (Hh em Dorset macho expressa chifre dominante; Hh em fêmea = recessivo, sem chifre). Ambas são autossômicas, não ligadas ao X.',
    hint: 'LIMITADA = manifesta em apenas UM sexo (o outro sexo não manifesta, mesmo carregando — caso do leite). INFLUENCIADA = ambos manifestam, mas com DOMINÂNCIA diferente (calvície, chifres Dorset). As duas são autossômicas — não estão em cromossomo sexual. Não confunda com ligada ao X.',
    topic: 'Padrões de Herança',
    difficulty: 'hard',
  },
  {
    id: 'q075',
    question: 'A Cardiomiopatia Hipertrófica Felina (CMH) tem caráter autossômico DOMINANTE, sendo mais comum em Persas e mais frequente em MACHOS. Como compatibilizar dominância autossômica com maior frequência em um sexo?',
    options: [
      'Erro de classificação — deve ser ligada ao X',
      'Possível influência hormonal/sexo nos heterozigotos OU efeito estatístico de viés diagnóstico — a dominância é autossômica mas a EXPRESSÃO pode sofrer influência do sexo',
      'Machos sempre herdam mais alelos',
      'Não há explicação possível',
    ],
    correct: 1,
    explanation:
      'AD autossômica explica a transmissão; a maior frequência em machos pode envolver INFLUÊNCIA do sexo na expressão (penetrância maior em machos, modificadores hormonais) ou viés diagnóstico. Não é ligada ao X. Machos não recebem mais alelos autossômicos do que fêmeas.',
    hint: 'A herança pode ser autossômica dominante (TRANSMISSÃO 50/50) MAS a expressão (penetrância, intensidade) ser modulada por hormônios sexuais. É como a calvície: gene autossômico, mas mais frequente em homens. Não é "erro de classificação" — é como conceitos se sobrepõem (autossômica na transmissão, influenciada pelo sexo na expressão).',
    topic: 'Padrões de Herança',
    difficulty: 'hard',
  },
  {
    id: 'q076',
    question: 'Atrofia Progressiva de Retina (PRA) em várias raças de cães tem padrão de herança:',
    options: [
      'Autossômico dominante',
      'Autossômico recessivo (pais portadores assintomáticos, filhos afetados em homozigose)',
      'Ligada ao Y',
      'Multifatorial',
    ],
    correct: 1,
    explanation:
      'A maioria das PRA segue AR: portadores assintomáticos transmitem; cegueira aparece em aa. AD seria identificada em cada geração. Y excluiria fêmeas. Multifatorial envolveria ambiente — PRA é monogênica em quase todas as raças identificadas.',
    hint: 'PRA típica em criações puras: aparece subitamente em filhotes de pais aparentemente normais, "salta gerações" e afeta machos e fêmeas igualmente. Esses 3 sinais clássicos no heredograma apontam para qual padrão de herança? Os outros padrões mostrariam comportamentos diferentes.',
    topic: 'Padrões de Herança',
    difficulty: 'medium',
  },

  // ============================================================
  // HARDY-WEINBERG (10 questões) — q077 a q086
  // ============================================================
  {
    id: 'q077',
    question: 'A equação de Hardy-Weinberg é:',
    options: [
      'p + q + r = 1',
      'p² + 2pq + q² = 1',
      'p × q = 1',
      'p / q = constante',
    ],
    correct: 1,
    explanation:
      'p² + 2pq + q² = 1, onde p² = AA, 2pq = Aa, q² = aa. Para 3 alelos seria p² + q² + r² + 2pq + 2pr + 2qr = 1. As outras formas estão erradas.',
    hint: 'Lembre: a equação é a expansão de (p + q)² = 1, onde p e q são as frequências dos dois alelos. Como (p + q)² = p² + 2pq + q², isso descreve as frequências dos 3 genótipos: AA, Aa, aa. As outras opções não correspondem a fórmulas reais de equilíbrio populacional.',
    topic: 'Hardy-Weinberg',
    difficulty: 'easy',
  },
  {
    id: 'q078',
    question: 'Numa população em equilíbrio H-W com f(A) = 0,7, qual a frequência esperada de heterozigotos (Aa)?',
    options: ['0,21', '0,49', '0,42', '0,30'],
    correct: 2,
    explanation:
      'f(Aa) = 2pq = 2 × 0,7 × 0,3 = 0,42. f(AA) = p² = 0,49. f(aa) = q² = 0,09. Soma = 1,00. As outras opções correspondem a outros componentes (0,49 = AA; 0,21 = p×q; 0,30 = q).',
    hint: 'Heterozigotos correspondem ao termo do meio: 2pq. Não esqueça do "2" — há dois caminhos (A do pai + a da mãe, OU a do pai + A da mãe). Calcule q = 1 - 0,7 = 0,3 e aplique 2 × 0,7 × 0,3.',
    topic: 'Hardy-Weinberg',
    difficulty: 'easy',
  },
  {
    id: 'q079',
    question: 'Se 16% de uma população é homozigota recessiva (aa) e está em equilíbrio H-W, qual a frequência do alelo recessivo?',
    options: ['0,4', '0,16', '0,08', '0,84'],
    correct: 0,
    explanation:
      'q² = 0,16 → q = √0,16 = 0,4. Então f(a) = 0,4 (40%); f(A) = 0,6. Os outros valores: 0,16 é q²; 0,84 = p²+2pq; 0,08 não corresponde a nenhuma grandeza relevante.',
    hint: 'A frequência de homozigotos recessivos é q² (não q). Para passar de q² para q (alelo), faça a operação INVERSA do quadrado — tire a raiz quadrada. √0,16 = 0,4.',
    topic: 'Hardy-Weinberg',
    difficulty: 'medium',
  },
  {
    id: 'q080',
    question: 'Em uma população em equilíbrio H-W onde 81% são homozigotos dominantes (AA), qual a frequência do alelo dominante?',
    options: ['0,81', '0,9', '0,19', '0,1'],
    correct: 1,
    explanation:
      'p² = 0,81 → p = √0,81 = 0,9. Logo f(A) = 0,9; f(a) = 0,1; f(Aa) = 2 × 0,9 × 0,1 = 0,18; f(aa) = 0,01. As outras opções confundem p com p² ou com q.',
    hint: 'Homozigotos dominantes correspondem a p². Você tem p² = 0,81 e quer p. Tire a raiz quadrada: √0,81. Cuidado pra não confundir p (alelo dominante) com q (alelo recessivo).',
    topic: 'Hardy-Weinberg',
    difficulty: 'medium',
  },
  {
    id: 'q081',
    question: 'Qual das seguintes NÃO é uma condição necessária para o equilíbrio de Hardy-Weinberg?',
    options: [
      'População numerosa',
      'Acasalamento panmítico (aleatório)',
      'SELEÇÃO ARTIFICIAL favorecendo um alelo',
      'Ausência de migração',
    ],
    correct: 2,
    explanation:
      'Seleção (natural ou artificial) QUEBRA o equilíbrio — alelos vantajosos/desvantajosos mudam de frequência. As três outras (grande, panmixia, sem migração) são exigências. Também: ausência de mutação significativa.',
    hint: 'Cuidado — a pergunta é qual NÃO é condição. As condições do equilíbrio exigem AUSÊNCIA de fatores evolutivos (seleção, mutação, migração, deriva) e PRESENÇA de acasalamento panmítico em população grande. Seleção artificial é o que o melhoramento faz pra MUDAR frequências — é justamente o oposto do equilíbrio.',
    topic: 'Hardy-Weinberg',
    difficulty: 'medium',
  },
  {
    id: 'q082',
    question: 'Numa doença autossômica recessiva onde 1 a cada 10.000 nascidos é afetado (q² = 0,0001) em uma população em equilíbrio H-W, aproximadamente quantos são portadores Aa?',
    options: [
      '1 em 10.000',
      '1 em 5.000',
      '~2% da população (~1 em 50)',
      '50%',
    ],
    correct: 2,
    explanation:
      'q² = 0,0001 → q = 0,01 → p ≈ 0,99 → f(Aa) = 2 × 0,99 × 0,01 ≈ 0,02 = 2%. Logo ~1 em 50 carrega o alelo. Para CADA afetado, há ~200 portadores assintomáticos. Por isso erradicar doença recessiva só removendo afetados é praticamente impossível.',
    hint: 'Sequência: 1) afetados aa = q² = 0,0001. 2) Tire a raiz: q = 0,01. 3) p ≈ 0,99. 4) Portadores Aa = 2pq ≈ 2 × 0,99 × 0,01 ≈ 0,02 (2% da população). Compare 2% com 1/10.000 — há centenas de portadores assintomáticos para cada afetado.',
    topic: 'Hardy-Weinberg',
    difficulty: 'hard',
  },
  {
    id: 'q083',
    question: 'O conceito de POPULAÇÃO MENDELIANA refere-se a:',
    options: [
      'Grupo de animais geneticamente idênticos',
      'Conjunto de indivíduos da mesma espécie que se reproduzem sexuadamente e compartilham um pool gênico',
      'Apenas linhagens puras',
      'Animais em cativeiro',
    ],
    correct: 1,
    explanation:
      'População mendeliana compartilha pool gênico via reprodução sexuada. Não são geneticamente idênticos (existe variabilidade), não precisa ser linhagem pura nem cativeiro.',
    hint: 'Pense no termo "população" em ecologia/genética: grupo de indivíduos da MESMA ESPÉCIE, que se reproduzem entre si (sexuada) e portanto compartilham um conjunto comum de alelos (pool gênico). Não tem nada a ver com serem geneticamente idênticos ou estarem em cativeiro.',
    topic: 'Hardy-Weinberg',
    difficulty: 'easy',
  },
  {
    id: 'q084',
    question: 'Por que o equilíbrio de Hardy-Weinberg RARAMENTE vale em rebanhos comerciais?',
    options: [
      'Porque as equações são imprecisas',
      'Porque há seleção (escolha dos melhores), cruzamentos direcionados (sem panmixia) e populações fechadas (sem migração) — exatamente o que o melhoramento BUSCA fazer',
      'Porque o ambiente não influencia',
      'Porque o número de cromossomos varia muito',
    ],
    correct: 1,
    explanation:
      'Melhoramento é seleção dirigida, cruzamentos direcionados, populações fechadas — todos quebrando as premissas de H-W. H-W serve como baseline: comparar frequências observadas com esperadas detecta o efeito da seleção. As outras explicações não procedem.',
    hint: 'O melhoramento genético FAZ exatamente o que H-W exige NÃO fazer: seleciona os melhores (= seleção), cruza dirigido (= não panmítico), mantém população fechada (= sem migração). Quebra TRÊS das 4 premissas. H-W vira baseline teórico — você compara o observado com o esperado e mede o efeito da seleção.',
    topic: 'Hardy-Weinberg',
    difficulty: 'medium',
  },
  {
    id: 'q085',
    question: 'Numa população com 10.000 animais (3.600 AA, 4.800 Aa, 1.600 aa), qual a frequência alélica f(A)?',
    options: [
      '0,36',
      '0,48',
      '0,60',
      '0,80',
    ],
    correct: 2,
    explanation:
      'Total alelos: 20.000. Alelos A: 2×3.600 (AA) + 1×4.800 (Aa) = 7.200 + 4.800 = 12.000. f(A) = 12.000 / 20.000 = 0,60 (60%). f(a) = 0,40. As outras opções correspondem a f(AA), f(Aa) e outros.',
    hint: 'Conte os alelos no "pool gênico". Cada indivíduo carrega 2 alelos — total = 2 × N. AA contribui com 2 As cada; Aa contribui com 1 A cada; aa não contribui com A. Some os As e divida pelo total de alelos. Não confunda com a frequência GENOTÍPICA de AA (que é p², não p).',
    topic: 'Hardy-Weinberg',
    difficulty: 'medium',
  },
  {
    id: 'q086',
    question: 'Em uma população em equilíbrio H-W, se a frequência do alelo A é 0,5 e do alelo a é 0,5, qual a proporção de heterozigotos?',
    options: [
      '0,25 (25%)',
      '0,50 (50%)',
      '0,75 (75%)',
      '1,00 (100%)',
    ],
    correct: 1,
    explanation:
      '2pq = 2 × 0,5 × 0,5 = 0,50 (50%). Esse é o MÁXIMO de heterozigotos possível em H-W (atingido quando p = q = 0,5). Os outros valores são f(AA), uma sobre-estimativa, ou impossível em equilíbrio com 2 alelos.',
    hint: 'Aplique direto: 2pq = 2 × 0,5 × 0,5. Curiosidade: 50% é o MÁXIMO de heterozigotos possível em H-W com 2 alelos — atingido exatamente quando p = q = 0,5. Se p ou q se afastam de 0,5, a frequência de heterozigotos cai.',
    topic: 'Hardy-Weinberg',
    difficulty: 'medium',
  },

  // ============================================================
  // MELHORAMENTO GENÉTICO (8 questões) — q087 a q094
  // ============================================================
  {
    id: 'q087',
    question: 'Características QUANTITATIVAS são tipicamente:',
    options: [
      'Monogênicas, com pouca influência ambiental, fenótipo F = G',
      'Poligênicas, com forte influência ambiental, fenótipo F = G + A',
      'Sempre ligadas ao X',
      'Inexistentes em mamíferos',
    ],
    correct: 1,
    explanation:
      'Quantitativas: muitos genes (poligênicas) com pequeno efeito cada + ambiente importante (F = G + A). Ex.: peso, produção de leite, ganho diário. Qualitativas (monogênicas, F = G) são o oposto. As outras opções são incorretas.',
    hint: 'Peso, produção de leite, ganho diário — todas variam de forma CONTÍNUA (qualquer valor numérico). Variação contínua exige muitos genes pequenos somando efeitos (poligenia) + influência ambiental relevante. Compare com qualitativas (presença/ausência de chifre): monogênicas, fenótipo discreto, sem influência ambiental.',
    topic: 'Melhoramento Genético',
    difficulty: 'easy',
  },
  {
    id: 'q088',
    question: 'A herdabilidade (h²) com valor 0,1 indica:',
    options: [
      'Alta influência genética',
      'BAIXA influência genética — ambiente determina a maior parte da variação',
      'Característica qualitativa',
      'Característica letal',
    ],
    correct: 1,
    explanation:
      'h² < 0,2 é baixa: ambiente domina. Seleção fenotípica direta produz progresso lento. Caracteres reprodutivos (fertilidade) tipicamente têm h² baixa. As outras opções são incorretas: alta seria > 0,4; qualitativa não usa h² da mesma forma; letal não é parâmetro de h².',
    hint: 'h² mede a FRAÇÃO da variação fenotípica que é genética (aditiva). Vai de 0 a 1. Perto de 0 → ambiente domina (pouca influência genética). Perto de 1 → ambiente influencia pouco. Por isso seleção fenotípica funciona bem em h² alta e mal em h² baixa.',
    topic: 'Melhoramento Genético',
    difficulty: 'easy',
  },
  {
    id: 'q089',
    question: 'Calcule o progresso genético (ΔG): diferencial de seleção DS = 30 kg, herdabilidade h² = 0,4.',
    options: ['12 kg', '7,5 kg', '40 kg', '120 kg'],
    correct: 0,
    explanation:
      'ΔG = DS × h² = 30 × 0,4 = 12 kg de ganho esperado por geração. 7,5 seria 30 / 4. 40 seria 30 + 10. 120 seria 30 × 4. A fórmula correta é multiplicação.',
    hint: 'Fórmula direta: ΔG = DS × h². Aplique: 30 × 0,4 = 12 kg. Cuidado pra não dividir nem somar — é uma multiplicação. Volte na seção sobre Progresso Genético no módulo 11.',
    topic: 'Melhoramento Genético',
    difficulty: 'medium',
  },
  {
    id: 'q090',
    question: 'Em um rebanho com σp (desvio padrão fenotípico) = 20 kg, selecionar 5% (i ≈ 2,06) dos animais ao invés de 50% (i ≈ 0,8) altera o diferencial de seleção (DS) como?',
    options: [
      'Mantém o mesmo DS',
      'DS aumenta de 16 kg (0,8 × 20) para 41,2 kg (2,06 × 20) — aproximadamente 2,5× maior',
      'DS diminui',
      'DS triplica',
    ],
    correct: 1,
    explanation:
      'DS = i × σp. 0,8 × 20 = 16 kg vs 2,06 × 20 = 41,2 kg. Selecionar mais rigorosamente (i alto) aumenta o DS, acelerando ΔG. Não triplica (seria 3×). Não diminui (i maior → DS maior). Não mantém.',
    hint: 'Use DS = i × σp duas vezes (uma para cada cenário): DS₁ = 0,8 × 20 e DS₂ = 2,06 × 20. Compare. Quanto mais rígido você seleciona (5% vs 50%), maior i e maior DS — daí acelera o progresso por geração.',
    topic: 'Melhoramento Genético',
    difficulty: 'medium',
  },
  {
    id: 'q091',
    question: 'Por que a fertilidade tem h² baixa em muitas raças?',
    options: [
      'É uma característica qualitativa',
      'A maior parte da variação na fertilidade é determinada pelo AMBIENTE (manejo, nutrição, sanidade, estresse) — pouco resta para o componente genético aditivo',
      'É ligada ao Y',
      'Tem dominância completa',
    ],
    correct: 1,
    explanation:
      'Fertilidade é poligênica + fortemente ambiental. Estresse, dieta, manejo influenciam mais do que o genótipo. Por isso h² baixa. Não é qualitativa (é quantitativa contínua), não é ligada ao Y. Dominância completa não se aplica.',
    hint: 'Pense no que afeta fertilidade no campo: estresse, nutrição, sanidade, manejo reprodutivo, condição corporal. Tudo isso é AMBIENTE. Quando o ambiente domina a variação, h² fica baixa por definição (h² = variância genética / variância fenotípica total).',
    topic: 'Melhoramento Genético',
    difficulty: 'medium',
  },
  {
    id: 'q092',
    question: 'A repetibilidade (t) mede:',
    options: [
      'Quantos genes diferentes afetam a característica',
      'O grau em que a mesma característica se REPETE no mesmo animal em diferentes momentos da vida',
      'A probabilidade de mutação',
      'A herdabilidade',
    ],
    correct: 1,
    explanation:
      'Repetibilidade quantifica consistência da característica em medições repetidas no mesmo animal (ex.: produção de leite em lactações sucessivas). Alta t = poucas medidas necessárias. Não é herdabilidade (que mede componente genético da variação) nem mutação.',
    hint: 'A pista está na palavra "repetibilidade": REPETIR a mesma medida no mesmo indivíduo em momentos diferentes. Mede a CONSISTÊNCIA temporal. Não confunda com herdabilidade (que mede o peso genético na variação ENTRE indivíduos) — são parâmetros diferentes.',
    topic: 'Melhoramento Genético',
    difficulty: 'medium',
  },
  {
    id: 'q093',
    question: 'Por que ignorar correlações genéticas pode causar problemas em programas de melhoramento?',
    options: [
      'Porque correlações sempre são positivas',
      'Selecionar para UMA característica pode INVOLUNTARIAMENTE piorar outra correlacionada negativamente — ex.: produção de leite alta x fertilidade em algumas raças',
      'Porque correlações não existem',
      'Porque sempre aumentam o tamanho do animal',
    ],
    correct: 1,
    explanation:
      'Correlação negativa entre produção e fertilidade existe em várias raças leiteiras de alta produção. Selecionar só por leite reduz fertilidade. Por isso os índices de seleção modernos consideram MÚLTIPLAS características. Correlações podem ser positivas ou negativas; existem; nem sempre afetam tamanho.',
    hint: 'Correlação pode ser positiva OU negativa. Quando é negativa entre características de interesse (ex.: produção alta de leite ↘ fertilidade), selecionar uma piora a outra. Por isso o melhoramento moderno usa índices de seleção que ponderam VÁRIAS características simultaneamente.',
    topic: 'Melhoramento Genético',
    difficulty: 'hard',
  },
  {
    id: 'q094',
    question: 'Em uma característica quantitativa controlada por ação gênica aditiva com 2 pares de genes, onde aabb produz 2.000 kg e cada letra maiúscula adiciona 100 kg, qual a produção esperada de um animal AABb?',
    options: [
      '2.100 kg',
      '2.200 kg',
      '2.300 kg',
      '2.400 kg',
    ],
    correct: 2,
    explanation:
      'AABb tem 3 letras maiúsculas: 2.000 + 3 × 100 = 2.300 kg. aabb = 2.000; Aabb = 2.100; AAbb = 2.200; AABb = 2.300; AABB = 2.400. Cada alelo "soma" um valor — ação aditiva pura, sem dominância.',
    hint: 'Em ação gênica aditiva pura, CADA alelo maiúsculo "soma" um valor (não há dominância — não importa se é homozigoto ou heterozigoto, só o número de alelos dominantes). Conte quantos maiúsculos tem em AABb. Some à base (2.000) × o valor de cada (100).',
    topic: 'Melhoramento Genético',
    difficulty: 'medium',
  },

  // ============================================================
  // ENDOGAMIA x EXOGAMIA (6 questões) — q095 a q100
  // ============================================================
  {
    id: 'q095',
    question: 'Filhos de irmãos completos têm coeficiente de consanguinidade (F) de:',
    options: [
      '0%',
      '12,5%',
      '25%',
      '50%',
    ],
    correct: 2,
    explanation:
      'R(irmãos completos) = 0,5 (dois caminhos via pai e mãe, n=2 cada). F = R/2 = 0,25 = 25%. Filhos de primos-primeiros: R = 0,125 → F = 6,25% (12,5% é R, não F). 0% seria sem parentesco. 50% impossível em irmãos.',
    hint: 'Dois passos: 1) parentesco R entre os pais (irmãos completos compartilham os dois progenitores → R = 0,5). 2) F = R(pais) / 2. Cuidado pra não confundir R com F. F = 0,25 = 25% em filhos de irmãos completos é um número clássico que vale memorizar.',
    topic: 'Endogamia x Exogamia',
    difficulty: 'medium',
  },
  {
    id: 'q096',
    question: 'Cruzamento Angus × Nelore para produção de carne classifica-se como:',
    options: [
      'Endogamia estreita',
      'Mestiçagem mestiço × mestiço',
      'Cruzamento industrial (terminal) — explora HETEROSE e complementariedade',
      'Herança restrita ao sexo',
    ],
    correct: 2,
    explanation:
      'Angus × Nelore: duas raças puras geram F1 100% heterozigoto, com vigor híbrido máximo, todo F1 abatido. Combina rusticidade Nelore + qualidade de carne Angus. Não é endogamia (raças diferentes). Não é mestiçagem (envolve pelo menos uma raça pura). Restrita ao sexo é Y.',
    hint: 'Pista 1: DUAS raças PURAS diferentes — descarta endogamia (mesma linhagem) e mestiço × mestiço. Pista 2: cruzamento Bos taurus × Bos indicus pra produção de carne, com F1 todo abatido — combina virtudes (complementariedade) e maximiza heterose. Como se chama esse tipo de cruzamento na pecuária?',
    topic: 'Endogamia x Exogamia',
    difficulty: 'medium',
  },
  {
    id: 'q097',
    question: 'A heterose (vigor híbrido) na cruza industrial pode ser calculada por H = ((MF1 − MP) / MP) × 100. Se a produção média dos pais é 4.000 L e a F1 produz 5.200 L, qual a heterose?',
    options: [
      '12%',
      '20%',
      '30%',
      '50%',
    ],
    correct: 2,
    explanation:
      'H = (5.200 − 4.000) / 4.000 × 100 = 1.200 / 4.000 × 100 = 30%. 12% e 20% subestimam; 50% superestima. A fórmula sempre compara o ganho relativo da F1 sobre a média parental.',
    hint: 'Aplique a fórmula passo a passo: 1) ganho absoluto = MF1 − MP = 5.200 − 4.000 = 1.200. 2) ganho relativo = 1.200 / MP = 1.200 / 4.000. 3) converta para % multiplicando por 100.',
    topic: 'Endogamia x Exogamia',
    difficulty: 'medium',
  },
  {
    id: 'q098',
    question: 'Por que mestiçagem prolongada (mestiço × mestiço) REDUZ a heterose ao longo do tempo?',
    options: [
      'Mutações genéticas espontâneas',
      'A heterose depende da HETEROZIGOSE. Mestiçagem mestiço × mestiço reintroduz homozigose progressivamente, perdendo a vantagem do F1',
      'Mudança climática',
      'Erro de manejo',
    ],
    correct: 1,
    explanation:
      'O F1 é 100% heterozigoto — máximo vigor. Cruzando mestiços entre si, alelos se reencontram em homozigose (cerca de metade da heterose se perde a cada geração de mestiçagem). Por isso sistemas industriais mantêm pelo menos uma fonte pura. Mutação e ambiente não explicam.',
    hint: 'Pergunta de causa: o que GERA heterose? A heterozigose máxima do F1. Quando mestiços cruzam entre si, alelos voltam a se encontrar em homozigose (mestiço já carrega alelos repetidos). Cerca de metade da heterose se perde por geração. Por isso sistemas industriais mantêm pelo menos uma fonte pura no esquema.',
    topic: 'Endogamia x Exogamia',
    difficulty: 'hard',
  },
  {
    id: 'q099',
    question: 'Qual a regra prática para o limite máximo de consanguinidade em um rebanho comercial?',
    options: [
      '25%',
      '13% (acima desse limite a depressão endogâmica e a expressão de doenças recessivas começam a comprometer produção e bem-estar)',
      '5% sem exceção',
      'Sem limite, é desejável aumentar a homozigose',
    ],
    correct: 1,
    explanation:
      'Regra prática zootécnica: F não deve passar de 13% em rebanho comercial. Acima disso, depressão endogâmica e expressão de deletérios prejudicam significativamente. 25% (irmãos completos) é alto demais. 5% é conservador demais para muitos sistemas. Sem limite é incorreto — endogamia descontrolada é deletéria.',
    hint: 'Lembre que filhos de irmãos completos têm F = 25% — claramente alto demais (depressão endogâmica). A regra prática define um teto mais conservador, em torno da metade desse valor, pra criar margem antes de aparecer endogamia significativa. Pense num número entre 10-15%.',
    topic: 'Endogamia x Exogamia',
    difficulty: 'medium',
  },
  {
    id: 'q100',
    question: 'A diferença entre o cruzamento CONTÍNUO (absorvente) e o cruzamento TERMINAL (industrial) é:',
    options: [
      'São sinônimos',
      'Contínuo: uso repetido do mesmo touro de raça pura por várias gerações para "absorver" outra raça e gerar PCs (puros por cruza). Terminal: 2 raças puras cruzadas, F1 100% abatido para carne, maximizando heterose',
      'Contínuo é só para leite; terminal só para corte',
      'Contínuo é só ovino; terminal só bovino',
    ],
    correct: 1,
    explanation:
      'Contínuo/absorvente: gerações sucessivas com mesmo reprodutor puro → raça pura "absorve" outra (~5 gerações). Terminal/industrial: 2 raças puras → F1 todo abatido, máxima heterose. Não são sinônimos; ambos podem servir leite/corte; ambos aplicáveis a múltiplas espécies.',
    hint: 'Contraste os objetivos: CONTÍNUO/absorvente quer TRANSFORMAR uma raça em outra ao longo de gerações (usando o mesmo touro puro repetidamente). TERMINAL/industrial quer MAXIMIZAR a heterose num só cruzamento F1 que vai todo pro abate. Os dois usam raças puras, mas com finalidades opostas.',
    topic: 'Endogamia x Exogamia',
    difficulty: 'medium',
  },
];

export const SIMULADO_META = {
  title: 'Simulado de Genética Veterinária',
  description: '100 questões sem timer cobrindo todos os 12 módulos da trilha.',
  totalQuestions: 100,
  passingScore: 70,
  estimatedMinutes: 180,
};
