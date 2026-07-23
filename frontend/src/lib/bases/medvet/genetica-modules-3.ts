import type { Module } from '../types';

// Módulos 9-12 da trilha Genética Veterinária.

export const MOD_9_PADROES: Module = {
  slug: 'padroes-de-heranca',
  num: 9,
  icon: '🧪',
  title: 'Padrões de Herança — Doenças Hereditárias e Multifatoriais',
  summary:
    'Como identificar herança autossômica dominante/recessiva, ligada ao X, restrita ao Y, limitada e influenciada pelo sexo. Leitura de heredogramas e doenças multifatoriais.',
  estimatedMin: 26,
  keyTerms: [
    { term: 'Doença Hereditária',     definition: 'Doença causada por mutações em um único gene (monogênica/mendeliana), transmitida de geração em geração.' },
    { term: 'Doença Multifatorial',   definition: 'Doença com múltiplos fatores: várias mutações em genes diferentes + influência ambiental.' },
    { term: 'Autossômica Recessiva',  definition: 'Pais podem ser portadores sem manifestar. Doença aparece apenas em aa.' },
    { term: 'Autossômica Dominante',  definition: 'Basta uma cópia do alelo mutado (Aa) para manifestar. Passa por todas as gerações.' },
    { term: 'Ligada ao X',            definition: 'Gene mutado na porção não homóloga do cromossomo X.' },
    { term: 'Hemizigoto',             definition: 'Macho (XY) tem apenas UMA cópia do cromossomo X — manifesta qualquer alelo nele presente.' },
    { term: 'Restrita ao Y (holândrica)', definition: 'Gene na porção não homóloga do Y — só se manifesta em machos.' },
    { term: 'Limitada pelo sexo',     definition: 'Genes autossômicos regulados por hormônios sexuais — manifesta-se em apenas um sexo (produção de leite, ovos, circunferência escrotal).' },
    { term: 'Influenciada pelo sexo', definition: 'Dominância depende do sexo do portador (calvície humana, chifres em Dorset).' },
    { term: 'Heredograma',            definition: 'Diagrama genealógico de uma família para análise de herança. Círculo = fêmea, quadrado = macho. Preenchido = afetado.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Identificar o padrão de herança de uma doença é o ponto de partida pra qualquer aconselhamento genético em rebanho ou clínica. Será autossômica recessiva (cuidado: pais portadores assintomáticos)? Ligada ao X (machos sempre afetados)? Multifatorial (várias mutações + ambiente)? A resposta muda a estratégia de manejo, de cruzamento e de prognóstico.',
    },
    {
      kind: 'concept',
      title: 'Herança Autossômica Recessiva',
      body:
        'Ambos os sexos podem transmitir. Doença manifesta APENAS em aa. Os pais são geralmente Aa (portadores assintomáticos). Em heredograma: doença "salta gerações" — aparece em filhos de pais aparentemente normais. Risco em consanguinidade: alta probabilidade de juntar dois portadores.',
    },
    {
      kind: 'example',
      title: 'Doenças autossômicas recessivas comuns em veterinária',
      body:
        'Acrodermatite letal (Bull Terrier — defeito metabolismo do zinco). Atrofia progressiva de retina (várias raças — cegueira progressiva). Albinismo. Epiteliogênese imperfeita (potros e leitões — ausência de pele em regiões do corpo, geralmente fatal). Síndrome de Chediak-Higashi em gatos (albinismo parcial + plaquetas defeituosas + susceptibilidade a infecções).',
    },
    {
      kind: 'concept',
      title: 'Herança Autossômica Dominante',
      body:
        'Basta UMA cópia do alelo mutado (Aa) pra manifestar. Animal afetado transmite pra ~50% da prole. Passa por TODAS as gerações (não "salta"). Geralmente cada afetado tem pelo menos um pai afetado.',
    },
    {
      kind: 'example',
      title: 'Doenças autossômicas dominantes em veterinária',
      body:
        'Acondroplasia em Dexter (homozigotos dominantes morrem). Rim Policístico em Gatos Persas (PKD — cistos progressivos no rim). Cardiomiopatia Hipertrófica Felina (espessamento ventricular — Persas mais afetados, machos mais frequentes). Entrópio em algumas raças. Merle MM letal em cães.',
    },
    {
      kind: 'concept',
      title: 'Herança ligada ao cromossomo X',
      body:
        'Gene na porção não homóloga do X. Machos são HEMIZIGOTOS (XY) — uma cópia já manifesta. Fêmeas são XX — precisam de 2 cópias mutadas pra manifestar (recessivo). Padrão típico: machos afetados, fêmeas portadoras assintomáticas.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Regras práticas — ligada ao X recessiva',
      body:
        '1) Frequência de machos afetados >> fêmeas afetadas. 2) Macho afetado transmite gene pra TODAS suas filhas (que viram portadoras). 3) Macho NUNCA transmite pro filho (passa o Y). 4) Filho afetado herdou da mãe (portadora ou afetada).',
    },
    {
      kind: 'example',
      title: 'Distrofia Muscular Progressiva ligada ao X (cães)',
      body:
        'Presente em Golden Retrievers e Terriers Irlandeses. Aos 8-10 semanas: CK elevada no soro, andar cambaleante rígido, abdução das patas, adução de joelhos e jarretes. Progride para prostração e morte. Análogo veterinário da Distrofia Muscular de Duchenne em humanos.',
    },
    {
      kind: 'concept',
      title: 'Herança Restrita ao sexo (ligada ao Y / holândrica)',
      body:
        'Gene na porção não homóloga do Y. Só se manifesta em MACHOS (fêmeas não têm Y). Passa de pai pra filho sempre. Exemplo: hipertricose auricular (pelos longos nas orelhas) em humanos. Em veterinária, exemplos raros mas existentes — características de juba.',
    },
    {
      kind: 'concept',
      title: 'Herança Limitada pelo sexo',
      body:
        'Gene AUTOSSÔMICO mas que só se manifesta em UM dos sexos por ser regulado por hormônios sexuais. Produção de leite e ovos = fêmeas. Circunferência escrotal = machos. Importante em melhoramento: você seleciona vacas pra produção de leite, mas o touro também carrega os genes — e os transmite pras filhas.',
    },
    {
      kind: 'concept',
      title: 'Herança Influenciada pelo sexo',
      body:
        'Gene AUTOSSÔMICO em que a dominância depende do sexo. Exemplo clássico: calvície humana — autossômica, dominante em homens, recessiva em mulheres (por isso homens calvos são muito mais frequentes). Em veterinária: chifres na raça Dorset (ovinos) — dominante em machos, recessivo em fêmeas.',
    },
    {
      kind: 'concept',
      title: 'Doenças Multifatoriais (Poligênicas)',
      body:
        'Determinadas por MUITOS pares de genes (50, 100, 200, 500 pares) MAIS influência ambiental. O grau de severidade está relacionado ao número de alelos deletérios E ao ambiente. Importante: animal com muitos genes deletérios pode ser MENOS afetado que outro com poucos genes — dependendo do ambiente.',
    },
    {
      kind: 'example',
      title: 'Displasia Coxofemoral (DCF) — multifatorial clássica',
      body:
        'Desenvolvimento anormal da articulação coxofemoral nos primeiros 6 meses de vida. Genes envolvidos: dezenas. Influência ambiental: peso, exercício, dieta, superfície de piso. Animais com predisposição genética que crescem em ambiente controlado podem nunca desenvolver sintomas. Outros com menos predisposição mas em ambiente errado desenvolvem severamente.',
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Outras doenças multifatoriais comuns',
      body:
        'Obesidade canina e felina. Dermatites alérgicas. Diabetes tipo II. Hipertireoidismo em gatos. Todas com componente genético + ambiental significativo. Mensagem clínica: manejo (dieta, ambiente, peso) pode COMPENSAR significativamente predisposição genética.',
    },
    {
      kind: 'table',
      caption: 'Resumo: como identificar o padrão pelo heredograma',
      headers: ['Padrão', 'Pistas no heredograma'],
      rows: [
        ['Autossômica Recessiva', 'Salta gerações. Pais portadores normais. Ambos os sexos afetados igualmente.'],
        ['Autossômica Dominante', 'Não salta. Cada afetado tem pai/mãe afetado(a). Ambos os sexos.'],
        ['Ligada ao X Recessiva', 'Machos muito mais afetados. Macho afetado → filhas portadoras. Pula filhos.'],
        ['Ligada ao X Dominante', 'Pai afetado → 100% filhas afetadas, 0% filhos. Sem skip.'],
        ['Ligada ao Y',           'Só machos. Pai → todos os filhos.'],
        ['Limitada pelo sexo',    'Só um sexo manifesta (mesmo gene autossômico).'],
      ],
    },
    {
      kind: 'summary',
      bullets: [
        'Recessiva autossômica: salta gerações, pais portadores normais.',
        'Dominante autossômica: não salta, todo afetado tem pai afetado.',
        'Ligada ao X recessiva: machos >> fêmeas afetadas.',
        'Restrita ao Y: só machos, passa de pai pra filho.',
        'Limitada pelo sexo: gene autossômico, manifestação em só um sexo (leite, ovos).',
        'Multifatorial: muitos genes + ambiente. Manejo pode compensar predisposição.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Numa família, uma doença aparece em filhos de pais aparentemente normais e afeta ambos os sexos igualmente. Padrão de herança mais provável:',
      options: ['Autossômica Dominante', 'Autossômica Recessiva', 'Ligada ao X Dominante', 'Restrita ao Y'],
      correct: 1,
      explanation: 'Pais normais + filhos afetados + sexos iguais → autossômica recessiva (pais são portadores Aa, filhos afetados aa).',
      hint: 'Duas pistas para descartar: 1) ambos os sexos igualmente afetados → não é ligada ao sexo. 2) pais aparentemente NORMAIS mas filhos afetados → o alelo está "escondido" nos pais como heterozigose, e só aparece quando coincide em dose dupla. Que padrão "pula gerações"?',
    },
    {
      question: 'Em distrofia muscular ligada ao X recessiva, qual a chance de um filho macho de mãe portadora ser afetado?',
      options: ['0%', '25%', '50%', '100%'],
      correct: 2,
      explanation: 'Mãe X^A X^a × pai normal. Filhos: 50% X^a Y (afetados) + 50% X^A Y (normais). Filhas: 50% portadoras + 50% normais.',
      hint: 'Os filhos machos recebem o Y do pai e o X da mãe. A mãe é X^A X^a — então o X que ela passa é 50% X^A (saudável) e 50% X^a (doente). Como o macho é hemizigoto (só tem 1 X), basta receber X^a para manifestar a doença.',
    },
    {
      question: 'Displasia coxofemoral é classificada como:',
      options: [
        'Doença monogênica autossômica dominante',
        'Doença ligada ao X recessiva',
        'Doença multifatorial — muitos genes + ambiente',
        'Doença restrita ao Y',
      ],
      correct: 2,
      explanation: 'DCF é clássica multifatorial: dezenas de genes envolvidos + grande influência ambiental (peso, dieta, exercício).',
      hint: 'A DCF é o exemplo CANÔNICO de doença multifatorial em medicina veterinária. Pergunta-chave: dois cães geneticamente "predispostos" desenvolvem DCF de jeitos diferentes dependendo de peso, exercício, dieta, piso — isso indica componente ambiental forte. Doenças monogênicas (dominantes ou recessivas) não têm essa variabilidade tão dependente do ambiente.',
    },
    {
      question: 'Produção de leite em vacas é exemplo de:',
      options: [
        'Herança limitada pelo sexo (gene autossômico regulado por hormônios — só fêmeas manifestam)',
        'Herança ligada ao X',
        'Herança ligada ao Y',
        'Mutação somática',
      ],
      correct: 0,
      explanation: 'Produção de leite é limitada pelo sexo: genes autossômicos, mas só fêmeas lactam. Touros transmitem os genes para suas filhas.',
      hint: 'Pergunta-chave: o gene é autossômico (ambos os sexos têm) OU está em cromossomo sexual? Os touros CARREGAM e TRANSMITEM os alelos para produção de leite — mas só as filhas EXPRESSAM (porque só fêmeas lactam, sob regulação hormonal). Quando o gene é autossômico mas só se manifesta num sexo, classifica-se como LIMITADA pelo sexo. Não confunda com INFLUENCIADA pelo sexo (dominância muda com sexo).',
    },
    {
      question: 'PKD (Rim Policístico) em gatos Persas: como classifica?',
      options: ['Recessiva ligada ao X', 'Autossômica recessiva', 'Autossômica DOMINANTE', 'Multifatorial'],
      correct: 2,
      explanation: 'PKD é autossômica dominante. Basta uma cópia mutada pra desenvolver cistos progressivos. Filhos têm 50% de chance.',
      hint: 'Pista clínica: PKD aparece em CADA geração de gatos Persas afetados, transmitida diretamente do pai/mãe afetado pra ~50% dos filhotes — sinal de herança dominante. Em raças que vão eliminando portadores, a prevalência cai rapidamente (típico de dominante: você vê todos os afetados, não fica escondido em portadores assintomáticos como o recessivo).',
    },
    {
      question: 'Por que machos calicos (casco-de-tartaruga) são quase sempre estéreis?',
      options: [
        'Sem motivo genético',
        'Precisam de 2 cromossomos X (XXY) — síndrome Klinefelter-like associada a esterilidade',
        'Mutação no Y',
        'Hormônio errado',
      ],
      correct: 1,
      explanation: 'Casco-de-tartaruga requer X^O e X^o. Em macho, isso significa XXY (cromossomo X extra), análogo a Klinefelter — esterilidade frequente.',
      hint: 'Volte ao módulo 7: o gene O (laranja) fica no X. Para ter manchas laranjas E pretas no mesmo animal, é preciso ter X^O E X^o. Em fêmeas isso é normal (XX). Em machos seria XXY — uma aneuploidia análoga à síndrome de Klinefelter humana, geralmente com esterilidade.',
    },
  ],
};

export const MOD_10_HARDY: Module = {
  slug: 'frequencia-genica-hardy-weinberg',
  num: 10,
  icon: '📊',
  title: 'Frequência Gênica e Equilíbrio de Hardy-Weinberg',
  summary:
    'Como medir a frequência dos alelos numa população, a fórmula clássica p² + 2pq + q² = 1, e as condições para uma população estar em equilíbrio.',
  estimatedMin: 18,
  keyTerms: [
    { term: 'População Mendeliana', definition: 'Grupo de indivíduos da mesma espécie que se reproduzem sexuadamente e compartilham um pool gênico.' },
    { term: 'Frequência Gênica (alélica)', definition: 'Proporção de cada alelo no pool gênico da população. Soma p + q = 1.' },
    { term: 'Frequência Genotípica', definition: 'Proporção de cada genótipo (AA, Aa, aa) na população. p² + 2pq + q² = 1.' },
    { term: 'Equilíbrio de Hardy-Weinberg', definition: 'Estado em que as frequências alélicas e genotípicas se mantêm constantes ao longo das gerações.' },
    { term: 'Panmixia',                definition: 'Acasalamento aleatório — pré-requisito do equilíbrio H-W.' },
    { term: 'Pool gênico',             definition: 'Conjunto de todos os alelos presentes na população.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Até agora trabalhamos com cruzamentos individuais (pai × mãe → filhos). Mas em rebanho, em raça, em manejo populacional — interessa o COLETIVO. Hardy e Weinberg, em 1908, criaram uma fórmula matemática simples que permite, a partir do fenótipo de uma população, calcular as frequências dos alelos e dos genótipos. É a base da genética de populações aplicada ao melhoramento.',
    },
    {
      kind: 'concept',
      title: 'Frequência alélica — como calcular',
      body:
        'Considere população com 10.000 indivíduos: 3.600 AA, 4.800 Aa, 1.600 aa. Total de alelos = 20.000 (cada indivíduo carrega 2). Alelos A: AA contribui com 2 cada (3.600 × 2 = 7.200) + Aa contribui com 1 cada (4.800 × 1 = 4.800) = 12.000. Alelos a: aa × 2 (3.200) + Aa × 1 (4.800) = 8.000. f(A) = 12.000/20.000 = 0,6 (60%). f(a) = 8.000/20.000 = 0,4 (40%). Sempre f(A) + f(a) = 1.',
    },
    {
      kind: 'formula',
      title: 'Equação de Hardy-Weinberg',
      formula: 'p² + 2pq + q² = 1',
      explanation:
        'Onde p = freq. alelo dominante (A), q = freq. alelo recessivo (a). p² = freq. AA. 2pq = freq. Aa. q² = freq. aa. p + q = 1 (sempre).',
    },
    {
      kind: 'example',
      title: 'Calculando frequências em rebanho',
      body:
        'População em equilíbrio com f(A) = 0,6 e f(a) = 0,4. f(AA) = p² = 0,6² = 0,36 (36%). f(Aa) = 2pq = 2 × 0,6 × 0,4 = 0,48 (48%). f(aa) = q² = 0,4² = 0,16 (16%). Soma: 36% + 48% + 16% = 100%. ✓',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Exercício comum em prova',
      body:
        'Numa população em equilíbrio, 81% são homozigotos dominantes (AA). Calcule as frequências alélicas. Solução: f(AA) = p² = 0,81 → p = √0,81 = 0,9. q = 1 − 0,9 = 0,1. f(Aa) = 2pq = 2 × 0,9 × 0,1 = 0,18 (18%). f(aa) = q² = 0,01 (1%).',
    },
    {
      kind: 'concept',
      title: 'Condições para o equilíbrio',
      body:
        'Pra Hardy-Weinberg valer, a população precisa estar em equilíbrio. As condições são quatro: 1) população GRANDE (sem deriva genética); 2) acasalamento PANMÍTICO (aleatório, sem preferência); 3) sem mutação significativa; 4) sem seleção (natural ou artificial); 5) sem migração (imigração ou emigração).',
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Por que H-W RARAMENTE vale exatamente em pecuária',
      body:
        'Rebanhos comerciais NÃO satisfazem H-W: há seleção (escolhe-se os melhores), há cruzamentos direcionados (não panmixia), populações são fechadas (sem migração). Isso quer dizer que as frequências MUDAM de geração em geração — exatamente o objetivo do melhoramento. H-W serve como BASELINE: você compara a frequência observada com o esperado pra detectar a ação evolutiva.',
    },
    {
      kind: 'concept',
      title: 'Aplicação em portadores assintomáticos',
      body:
        'Numa doença recessiva com prevalência de 1 a cada 10.000 nascimentos (q² = 0,0001), qual a frequência de portadores Aa no rebanho? q = √0,0001 = 0,01. p = 0,99. f(Aa) = 2 × 0,99 × 0,01 ≈ 0,02 (2%). Ou seja: pra cada 1 animal afetado, há ~200 portadores assintomáticos. Por isso doenças recessivas raramente são erradicadas só removendo os afetados.',
    },
    {
      kind: 'summary',
      bullets: [
        'p + q = 1 (frequência dos alelos).',
        'p² + 2pq + q² = 1 (frequência dos genótipos).',
        'p² = AA. 2pq = Aa. q² = aa.',
        'Equilíbrio H-W exige população grande, panmixia, sem mutação/seleção/migração.',
        'Em melhoramento, H-W é baseline pra detectar o efeito da seleção.',
        'Doenças recessivas: 1 afetado ↔ centenas de portadores assintomáticos.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Numa população em equilíbrio H-W com f(A) = 0,7, qual a frequência de heterozigotos?',
      options: ['0,21', '0,49', '0,42', '0,30'],
      correct: 2,
      explanation: 'f(Aa) = 2pq = 2 × 0,7 × 0,3 = 0,42 (42%).',
      hint: 'Lembre que a equação de Hardy-Weinberg expandida é p² + 2pq + q² = 1. Heterozigotos correspondem ao termo do MEIO (representa o cruzamento de gametas com alelos DIFERENTES — um carrega p, outro q). Não esqueça do "2" multiplicando: tem dois caminhos (A do pai + a da mãe, OU a do pai + A da mãe). Calcule q = 1 - 0,7 e aplique.',
    },
    {
      question: 'Se 16% de uma população é homozigota recessiva (aa), qual a frequência do alelo recessivo?',
      options: ['0,4', '0,16', '0,08', '0,84'],
      correct: 0,
      explanation: 'q² = 0,16 → q = √0,16 = 0,4. Portanto f(a) = 0,4 (40%).',
      hint: 'A frequência dos homozigotos recessivos é q² (não q). Você tem o produto e quer o fator — então precisa da operação INVERSA do quadrado. Lembre que se q² = 0,16, então q = √0,16.',
    },
    {
      question: 'Qual NÃO é uma condição para o equilíbrio de Hardy-Weinberg?',
      options: [
        'População grande',
        'Acasalamento aleatório (panmixia)',
        'Seleção artificial favorecendo um alelo',
        'Ausência de migração',
      ],
      correct: 2,
      explanation: 'Seleção QUEBRA o equilíbrio. As condições exigem AUSÊNCIA de seleção, mutação significativa e migração.',
      hint: 'A pergunta é qual NÃO é condição. As 4 condições do equilíbrio H-W exigem AUSÊNCIA de fatores evolutivos: sem seleção, sem mutação, sem migração, sem deriva (população pequena), com acasalamento aleatório. Selecionar artificialmente um alelo é justamente o que o melhoramento faz pra MUDAR as frequências — exatamente o oposto do equilíbrio.',
    },
    {
      question: 'Numa doença recessiva onde 1 em 10.000 nasce afetado (q² = 0,0001), aproximadamente quantos animais são portadores Aa?',
      options: ['1 em 10.000', '1 em 5.000', '~2% da população (~1 em 50)', '50%'],
      correct: 2,
      explanation: 'q = 0,01. f(Aa) = 2pq ≈ 0,02 = 2% da população. Para cada afetado, ~200 portadores. Por isso doenças recessivas custam tanto pra erradicar.',
      hint: 'Sequência de passos: 1) afetados aa = q². Você tem q² = 0,0001. 2) Tire a raiz: q = 0,01. 3) p ≈ 0,99. 4) Portadores Aa = 2pq ≈ 2 × 0,99 × 0,01. Faça a conta — vai dar um número MUITO maior do que 1/10.000, mostrando por que doenças recessivas raras são difíceis de erradicar.',
    },
  ],
};

export const MOD_11_MELHORAMENTO: Module = {
  slug: 'introducao-ao-melhoramento-genetico',
  num: 11,
  icon: '🐄',
  title: 'Introdução ao Melhoramento Genético',
  summary:
    'Características quantitativas vs qualitativas, ação gênica aditiva, herdabilidade (h²), repetibilidade, correlação e progresso genético. A matemática que sustenta a escolha de reprodutores.',
  estimatedMin: 28,
  keyTerms: [
    { term: 'Característica Quantitativa', definition: 'Mensurada numericamente, poligênica (muitos genes), forte influência ambiental. F = G + A.' },
    { term: 'Característica Qualitativa',  definition: 'Não mensurada numericamente, monogênica ou poucos genes, pouca influência ambiental. F = G.' },
    { term: 'Ação Gênica Aditiva',         definition: 'Cada alelo soma um valor ao fenótipo, independente dos outros. Sem dominância.' },
    { term: 'Herdabilidade (h²)',          definition: 'Proporção da variação fenotípica que é genética. Vai de 0 a 1. Alta h² = ambiente influencia pouco.' },
    { term: 'Repetibilidade (t)',          definition: 'Quanto a mesma característica se mantém em diferentes momentos da vida do animal. 0 a 1.' },
    { term: 'Correlação Genética (r)',     definition: 'Associação entre duas características (ou a mesma em momentos diferentes). De −1 a +1.' },
    { term: 'Acurácia',                    definition: 'Precisão da estimativa do valor genético — depende de h², número de informações e parentesco.' },
    { term: 'Diferencial de Seleção (DS)', definition: 'Diferença entre a média dos indivíduos selecionados e a média da população.' },
    { term: 'Progresso Genético (ΔG)',     definition: 'Ganho esperado ao usar animais selecionados. ΔG = DS × h².' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Melhoramento genético é o processo de ESCOLHER quais animais reproduzem, com base em parâmetros genéticos, pra aumentar a frequência dos genes desejáveis e diminuir a dos indesejáveis na próxima geração. Tudo isso passa por matemática: herdabilidade, diferencial de seleção, correlações. Sem entender isso, você "melhora no olho" — e o resultado é imprevisível.',
    },
    {
      kind: 'concept',
      title: 'Quantitativas × Qualitativas',
      body:
        'Quantitativas: mensuráveis numericamente (peso, produção de leite, ganho diário, conversão alimentar). Controladas por MUITOS genes (poligênicas). Cada gene individual tem efeito PEQUENO. Sofrem GRANDE influência ambiental. Fórmula: F = G + A. Qualitativas: NÃO mensuráveis numericamente (cor de pelagem, presença/ausência de chifres). Controladas por POUCOS genes (mono ou oligogênicas). Cada gene tem efeito GRANDE. Pouca influência ambiental. Fórmula: F = G.',
    },
    {
      kind: 'concept',
      title: 'Ação Gênica Aditiva',
      body:
        'Cada alelo SOMA um valor ao fenótipo, sem dominância. Exemplo: produção de leite controlada por 2 pares (A e B). Base = 2.000 kg. Cada letra maiúscula adiciona 100 kg. aabb = 2.000 kg. Aabb = 2.100. AaBb = 2.200. AABB = 2.400. Essa lógica é predominante em características quantitativas — por isso a soma de muitos genes pequenos gera variação contínua.',
    },
    {
      kind: 'formula',
      title: 'Modelo geral do fenótipo',
      formula: 'F = G + A + GA',
      explanation:
        'F (Fenótipo) = G (Genótipo) + A (Ambiente) + GA (Interação Genótipo-Ambiente). A interação é importante: animais zebuínos rendem mais em clima tropical, taurinos em temperado. O mesmo genótipo dá fenótipos diferentes em ambientes diferentes.',
    },
    {
      kind: 'concept',
      title: 'Herdabilidade (h²) — o parâmetro mais importante',
      body:
        'h² é a fração da variação fenotípica que é GENÉTICA (aditiva). 0 ≤ h² ≤ 1. h² = 0,0 a 0,2: BAIXA (caracteres reprodutivos como fertilidade — muito ambiente). h² = 0,2 a 0,4: MÉDIA (caracteres produtivos como ganho de peso). h² > 0,4: ALTA (qualidade de produto como espessura de toucinho). Quanto mais alta a h², MAIS rápido o melhoramento via seleção fenotípica.',
    },
    {
      kind: 'table',
      caption: 'Herdabilidade típica de parâmetros zootécnicos (suínos)',
      headers: ['Parâmetro', 'h²'],
      rows: [
        ['Tamanho e peso da leitegada', '0,01 – 0,24'],
        ['Ganho de Peso Diário (GPD)',  '0,13 – 0,40'],
        ['Conversão Alimentar',         '0,19 – 0,42'],
        ['Espessura de Toucinho',       '0,11 – 0,62'],
        ['Área de Lombo',               '0,23 – 0,96'],
        ['Resposta Imune',              '0,25 – 0,35'],
      ],
    },
    {
      kind: 'formula',
      title: 'Progresso Genético',
      formula: 'ΔG = DS × h²',
      explanation:
        'Ganho genético esperado por geração. DS é o quanto os selecionados estão acima da média; h² é o quanto disso é herdável. Quanto maior DS e h², mais rápido o progresso.',
    },
    {
      kind: 'formula',
      title: 'Diferencial de Seleção',
      formula: 'DS = i × σp',
      explanation:
        'i = intensidade de seleção (quão "duro" você escolhe). σp = desvio padrão fenotípico da característica. Selecionar 5% dos animais (i ≈ 2,06) gera DS muito maior que selecionar 50% (i ≈ 0,8).',
    },
    {
      kind: 'example',
      title: 'Cálculo prático de ΔG',
      body:
        'Rebanho bovino: peso à desmama médio 200 kg. σp = 30 kg. Seleção de 50% dos animais (i = 0,8). h² = 0,3. DS = 0,8 × 30 = 24 kg. ΔG = 24 × 0,3 = 7,2 kg por geração. Se ao invés selecionar só 5% dos machos (i = 2,06): DS = 2,06 × 30 = 61,8. ΔG = 18,5 kg/geração (2,5× mais rápido).',
    },
    {
      kind: 'concept',
      title: 'Repetibilidade (t)',
      body:
        'Quanto a mesma característica se REPETE no mesmo animal em momentos diferentes. Vaca leiteira: produção de leite na 1ª lactação é parecida com a 3ª? Alta repetibilidade = sim. Baixa = não. Importante: estabelece quantas medidas precisamos para uma estimativa confiável. 0 ≤ t ≤ 1.',
    },
    {
      kind: 'concept',
      title: 'Correlação Genética (r)',
      body:
        'Mede a associação entre duas características — ou a mesma característica em momentos diferentes. Vai de −1 a +1. Correlação positiva: selecionar uma melhora a outra (ex: peso aos 12 meses e peso aos 24 meses). Correlação negativa: selecionar uma piora a outra (cuidado!). Em melhoramento, ignorar correlação leva a ganhos numa característica e perdas em outras.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Por que correlação importa tanto',
      body:
        'Seleção pra produção de leite alta sem considerar correlações: pode resultar em vacas com fertilidade reduzida (correlação genética negativa entre produção e fertilidade em algumas raças). Melhoramento "monocular" é uma das principais razões de problemas reprodutivos em rebanhos de alta produção.',
    },
    {
      kind: 'summary',
      bullets: [
        'Quantitativas: poligênicas, com ambiente; F = G + A.',
        'Qualitativas: poucos genes, pouco ambiente; F = G.',
        'h² alta = ambiente influencia pouco = melhoramento mais rápido por seleção fenotípica.',
        'ΔG = DS × h². Selecionar mais rigorosamente (i alto) acelera o progresso.',
        'Repetibilidade ajuda a planejar quantas medidas tomar.',
        'Correlação negativa: cuidar para não piorar uma característica enquanto melhora outra.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Característica com h² = 0,1 indica:',
      options: [
        'Alta influência genética',
        'Baixa influência genética — ambiente determina a maior parte da variação',
        'Mutação espontânea',
        'Característica qualitativa',
      ],
      correct: 1,
      explanation: 'h² baixa (0,0-0,2) significa que apenas uma pequena parte da variação é hereditária. Seleção fenotípica direta pouco ajuda.',
      hint: 'Pense no que h² mede: a FRAÇÃO da variação fenotípica que é genética (aditiva). Vai de 0 a 1. Se está perto de 0 (0,1), quase nada da variação é genética — sobra ambiente. Se perto de 1, ambiente influencia pouco. Por isso seleção fenotípica funciona bem em h² alta e mal em h² baixa.',
    },
    {
      question: 'Calcule o progresso genético: DS = 30 kg, h² = 0,4.',
      options: ['12 kg', '7,5 kg', '40 kg', '120 kg'],
      correct: 0,
      explanation: 'ΔG = DS × h² = 30 × 0,4 = 12 kg de progresso esperado por geração.',
      hint: 'A fórmula é simples: ΔG = DS × h². Aplique direto: 30 × 0,4. Cuidado para não dividir nem somar — é multiplicação. Reveja a seção sobre Progresso Genético no módulo 11.',
    },
    {
      question: 'Selecionar 5% dos animais (i ≈ 2,06) ao invés de 50% (i ≈ 0,8) com σp = 20 kg gera quanto a mais de DS?',
      options: ['Mesmo DS', 'DS aumenta de 16 kg para 41,2 kg (~2,5× mais)', 'DS diminui', 'DS triplica'],
      correct: 1,
      explanation: 'DS = i × σp. 0,8 × 20 = 16. 2,06 × 20 = 41,2. Selecionar mais rigorosamente acelera o progresso significativamente.',
      hint: 'Use a fórmula DS = i × σp. Calcule os dois cenários: DS₁ = 0,8 × σp e DS₂ = 2,06 × σp. Compare. Quanto mais "duro" você seleciona (i alto), maior o DS — e maior o progresso por geração.',
    },
    {
      question: 'Características quantitativas:',
      options: [
        'Monogênicas com forte efeito individual',
        'Poligênicas com pequeno efeito individual e grande influência ambiental',
        'Sempre ligadas ao X',
        'Sem influência ambiental',
      ],
      correct: 1,
      explanation: 'Quantitativas são poligênicas (muitos genes pequenos) + grande influência ambiental. F = G + A.',
      hint: 'Pense em peso, produção de leite, ganho diário — variam de forma CONTÍNUA (qualquer valor numérico). Variação contínua exige MUITOS genes pequenos somando seus efeitos (poligenia) + influência ambiental. Compare com qualitativas (cor de pelagem, presença de chifre) — monogênicas, descontínuas, sem ambiente significativo.',
    },
    {
      question: 'Por que a fertilidade tem h² baixa em muitas raças?',
      options: [
        'Porque é uma característica qualitativa',
        'Porque a maior parte da variação é determinada pelo ambiente (manejo, nutrição, sanidade)',
        'Porque é ligada ao Y',
        'Porque tem dominância completa',
      ],
      correct: 1,
      explanation: 'Reprodução sofre enorme influência ambiental (estresse, dieta, manejo). Por isso h² baixa — o ambiente faz a maior parte.',
      hint: 'Pense no que afeta fertilidade no campo: estresse térmico, nutrição, sanidade, manejo reprodutivo, condição corporal. Tudo isso é AMBIENTE. Quando o ambiente determina a maior parte da variação, sobra pouco para o componente genético — o que define h² alta ou baixa? Veja a tabela de h² típicos no módulo: fertilidade fica no extremo baixo.',
    },
  ],
};

export const MOD_12_ENDOGAMIA: Module = {
  slug: 'endogamia-x-exogamia',
  num: 12,
  icon: '🔁',
  title: 'Endogamia × Exogamia — cruzamentos e heterose',
  summary:
    'Quando juntar parentes ajuda e quando atrapalha. Coeficiente de consanguinidade, tipos de cruzamento (contínuo, rotacional, terminal), heterose e complementariedade.',
  estimatedMin: 24,
  keyTerms: [
    { term: 'Endogamia (Consanguinidade)', definition: 'Acasalamento entre animais aparentados.' },
    { term: 'Exogamia (Cruzamento)',        definition: 'Acasalamento entre animais de raças diferentes (com pelo menos uma raça pura).' },
    { term: 'Mestiço',                      definition: 'Produto da exogamia.' },
    { term: 'Heterose (vigor híbrido)',     definition: 'Superioridade dos filhos em relação à média dos pais.' },
    { term: 'Complementariedade',           definition: 'Reunir num animal as características desejáveis de duas ou mais raças.' },
    { term: 'Coeficiente de Parentesco (R)',definition: 'Probabilidade de dois indivíduos compartilharem genes idênticos por ancestral comum. R = Σ(0,5)^n.' },
    { term: 'Coeficiente de Consanguinidade (F)', definition: 'Probabilidade de um indivíduo ser homozigoto por descendência. F = R/2.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Tudo o que vimos até aqui — leis de Mendel, ação gênica, alelismo, herdabilidade — converge nessa pergunta prática: COM QUEM acasalar este animal? Parente ou estranho? Mesma raça ou diferente? A resposta muda completamente o resultado da próxima geração e, no longo prazo, o futuro do rebanho.',
    },
    {
      kind: 'concept',
      title: 'Endogamia (Consanguinidade)',
      body:
        'Acasalamento entre parentes. Aumenta a HOMOZIGOSE (alelos iguais nos dois cromossomos) — incluindo alelos deletérios recessivos que ficavam mascarados. Vantagens: mantém padrão racial, fixa características desejáveis. Desvantagens: aumenta expressão de doenças recessivas, reduz vigor. Regra prática: nunca permitir consanguinidade > 13% num rebanho comercial.',
    },
    {
      kind: 'concept',
      title: 'Tipos de consanguinidade',
      body:
        'Estreita: parentesco ≥ 50% (pai × filha, mãe × filho, irmãos completos). Larga: parentesco < 50% (primos, meio-irmãos). Ambas concentram a homozigose, mas a estreita acelera muito o processo (e os riscos).',
    },
    {
      kind: 'formula',
      title: 'Coeficiente de Parentesco (R)',
      formula: 'R(x,y) = Σ (0,5)^n',
      explanation:
        'Onde n é o número de gerações entre x e y passando pelo ancestral comum. Pai-filho: n=1, R=0,5 (50%). Irmãos completos: dois caminhos de n=2 cada, R = (0,5)² + (0,5)² = 0,5. Avós-netos: n=2, R=0,25 (25%).',
    },
    {
      kind: 'formula',
      title: 'Coeficiente de Consanguinidade (F)',
      formula: 'F(x) = R(pai, mãe) / 2',
      explanation:
        'F do indivíduo x = metade do parentesco entre os pais. Filho de irmãos completos: R(pais) = 0,5, F = 0,25 (25%). Filho de primos primeiros: R(pais) = 0,125, F = 0,0625 (6,25%).',
    },
    {
      kind: 'concept',
      title: 'Exogamia (Cruzamento)',
      body:
        'Acasalamento entre raças diferentes (pelo menos uma pura). Aumenta a HETEROZIGOSE. Vantagens: mascara genes deletérios recessivos, permite COMPLEMENTARIEDADE (juntar virtudes das raças), gera HETEROSE (filhos superiores aos pais). Produto: mestiço.',
    },
    {
      kind: 'formula',
      title: 'Avaliação da Heterose',
      formula: 'H = ((MF1 − MP) / MP) × 100',
      explanation:
        'H = coeficiente de heterose (%). MF1 = média de produção dos filhos F1. MP = média de produção dos pais. Se F1 supera a média dos pais → heterose positiva.',
    },
    {
      kind: 'concept',
      title: 'Tipos de cruzamentos em pecuária',
      body:
        'CONTÍNUO (ou absorvente): mesmo touro de raça pura usado por várias gerações. A raça do touro "absorve" a outra ao longo das gerações. Objetivo: produzir animal puro adaptado. ROTACIONAL: alternância de 2, 3 ou + raças entre gerações. Manutenção das fêmeas no rebanho — machos vão pro abate, fêmeas pra reposição. TERMINAL (Industrial): 2 raças puras cruzadas → F1 todo abatido (carne). Maximiza heterose pra produção de carne.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Heterose em prática — exemplo real',
      body:
        'Cruza Nelore × Angus: F1 ("baldio") apresenta heterose significativa em ganho de peso, qualidade de carne, fertilidade. Por isso a cruza industrial Angus × Nelore é tão usada no Brasil — combina rusticidade Nelore com qualidade de carne Angus, com superioridade do F1.',
    },
    {
      kind: 'concept',
      title: 'Mestiçagem',
      body:
        'Mestiço × Mestiço → Mestiço. Diferente da exogamia (uma raça pura + uma de outra). A mestiçagem reduz progressivamente a heterose porque com o tempo a homozigose retorna. Por isso, em sistemas comerciais, é importante manter pelo menos uma fonte pura no acasalamento.',
    },
    {
      kind: 'table',
      caption: 'Endogamia × Exogamia — comparação direta',
      headers: ['Aspecto', 'Endogamia', 'Exogamia'],
      rows: [
        ['Acasalamento entre',         'Parentes (mesma raça/linhagem)', 'Raças diferentes (1 pura)'],
        ['Efeito genético',            '↑ Homozigose',                   '↑ Heterozigose'],
        ['Genes deletérios',           '↑ Expressão',                    'Mascarados'],
        ['Padrão racial',              'Fixa (vantagem)',                'Não preserva'],
        ['Vigor',                      '↓ (depressão endogâmica)',       '↑ (heterose)'],
        ['Uso típico',                 'Linhagens elite, manutenção raça', 'Produção comercial, cruza industrial'],
      ],
    },
    {
      kind: 'summary',
      bullets: [
        'Endogamia ↑ homozigose, fixa padrão, mas eleva risco de doenças recessivas.',
        'Exogamia ↑ heterozigose, gera heterose, mascara deletérios.',
        'F (consanguinidade do filho) = R (parentesco dos pais) / 2.',
        '3 tipos de cruzamento: contínuo (absorvente), rotacional, terminal (industrial).',
        'Heterose = (MF1 − MP) / MP × 100. Positiva: F1 supera os pais.',
        'Regra prática: consanguinidade num rebanho comercial NÃO deve passar de 13%.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Filhos de irmãos completos têm coeficiente de consanguinidade (F) de:',
      options: ['0% (zero)', '12,5%', '25%', '50%'],
      correct: 2,
      explanation: 'R(irmãos completos) = 0,5. F = R/2 = 0,25 = 25%.',
      hint: 'Dois passos: 1) calcule o parentesco R entre os pais (irmãos completos compartilham os MESMOS dois progenitores → R = 0,5). 2) Aplique a fórmula F = R(pais)/2. Não confunda R com F: R mede parentesco entre dois indivíduos, F mede a probabilidade de homozigose por descendência no filho.',
    },
    {
      question: 'Heterose é mais explorada em:',
      options: [
        'Cruzamento contínuo (absorvente)',
        'Cruzamento terminal (industrial — 2 raças puras → F1 abatido)',
        'Acasalamento entre irmãos',
        'Mestiçagem mestiço × mestiço',
      ],
      correct: 1,
      explanation: 'Cruzamento terminal maximiza heterose: 2 raças puras geram F1 100% heterozigoto com vigor híbrido máximo, todo abatido.',
      hint: 'Heterose depende de HETEROZIGOSE máxima. Em qual sistema o F1 é mais heterozigoto possível? Pense: duas raças PURAS (homozigotas em loci diferentes) cruzadas → F1 100% heterozigoto, com vigor híbrido máximo. Esse F1 vai todo pro abate (terminal). Compare com endogamia (vai pro lado oposto: aumenta homozigose) e mestiço × mestiço (heterose já reduzida).',
    },
    {
      question: 'Por que mestiçagem prolongada (mestiço × mestiço) REDUZ a heterose ao longo do tempo?',
      options: [
        'Mutações genéticas',
        'Porque a homozigose retorna progressivamente — a heterose depende da heterozigose',
        'Mudança de ambiente',
        'Erro de manejo',
      ],
      correct: 1,
      explanation: 'A heterose vem da heterozigose. Mestiçagem entre mestiços faz alelos se "encontrarem" de novo em homozigose, perdendo a vantagem do F1.',
      hint: 'Pergunta de causa: o que GERA heterose? A heterozigose máxima do F1. Quando você cruza mestiço × mestiço, os filhos voltam a ter parte do genoma em homozigose (porque mestiço já carrega alelos repetidos). Resultado: heterose diminui geração a geração. Por isso sistemas industriais mantêm pelo menos uma raça pura no esquema.',
    },
    {
      question: 'Uma fazenda mediu produção média de leite: pais = 4.000 L. Filhos F1 = 5.200 L. Qual a heterose?',
      options: ['12%', '20%', '30%', '50%'],
      correct: 2,
      explanation: 'H = (MF1 − MP)/MP × 100 = (5.200 − 4.000)/4.000 × 100 = 30%.',
      hint: 'Use a fórmula H = ((MF1 − MP) / MP) × 100. Substitua direto: MP = 4.000, MF1 = 5.200. O numerador é o GANHO em relação aos pais (1.200); divida pela média parental e multiplique por 100 pra ter %.',
    },
    {
      question: 'Qual o limite máximo prático de consanguinidade num rebanho comercial?',
      options: ['25%', '13%', '5%', '0%'],
      correct: 1,
      explanation: 'Regra prática: F nunca deve passar de 13% num rebanho comercial — acima disso, depressão endogâmica e expressão de doenças recessivas começa a comprometer produção e bem-estar.',
      hint: 'Lembre que F entre irmãos completos é 25% — acima disso já é claramente prejudicial. A regra prática consagrada na zootecnia define um limite mais conservador, em torno da metade desse valor, pra deixar margem antes de aparecer depressão endogâmica significativa.',
    },
    {
      question: 'Cruzamento Angus × Nelore visando produção de carne se classifica como:',
      options: [
        'Endogamia estreita',
        'Mestiçagem mestiço × mestiço',
        'Cruzamento industrial / terminal — explora heterose e complementariedade',
        'Restrita ao sexo',
      ],
      correct: 2,
      explanation: 'Angus × Nelore (raças puras cruzadas) → F1 com heterose máxima, sendo todo abatido. Combina rusticidade Nelore + qualidade carne Angus = cruzamento industrial.',
      hint: 'Pista 1: Angus e Nelore são DUAS raças PURAS diferentes — descarte endogamia (mesma raça) e mestiço × mestiço. Pista 2: cruzamento Bos taurus × Bos indicus pra carne combina virtudes (rusticidade + qualidade) e maximiza heterose, com F1 todo abatido. Como se classifica esse tipo de cruzamento na pecuária?',
    },
  ],
};
