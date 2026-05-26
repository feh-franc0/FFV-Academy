import type { Module } from '../types';

// Módulos 1-4 — Trilha "Neuromarketing — Como o cérebro decide comprar"
// Material curado por FFV Academy para a área Saúde · PUC Neurociência.
// Atende solicitação de estudante que pediu: separação por matéria, resumo
// por seção, exemplos do dia a dia E exemplos lúdicos pra explicar a uma
// criança, com exercícios pra fixar.

// ────────────────────────────────────────────────────────────────────────
// MOD 1 — Os 3 Cérebros do Consumidor (Modelo Triuno de MacLean)
// ────────────────────────────────────────────────────────────────────────
export const MOD_1_TRIUNO: Module = {
  slug: 'triuno-cerebro-do-consumidor',
  num: 1,
  icon: '🧠',
  title: 'Os 3 Cérebros do Consumidor — réptil, límbico, neocórtex',
  summary:
    'Antes de entender marketing, entenda quem decide. O modelo triuno de Paul MacLean divide o cérebro em três camadas evolutivas que decidem juntas — e quase nunca em consenso. Quem compra: o réptil, o límbico ou o neocórtex?',
  estimatedMin: 18,
  keyTerms: [
    { term: 'Cérebro Triuno',          definition: 'Modelo proposto por Paul MacLean (1960s) que divide o cérebro humano em 3 camadas evolutivas: reptiliano (sobrevivência), límbico (emoção) e neocórtex (razão). Hoje é considerado simplificado, mas continua sendo um mapa útil para marketing.' },
    { term: 'Cérebro Reptiliano',      definition: 'Camada mais antiga (tronco encefálico + gânglios da base). Cuida de sobrevivência, instinto, território, "luta ou fuga". Não analisa: reage.' },
    { term: 'Sistema Límbico',         definition: 'Camada intermediária (amígdala, hipocampo, hipotálamo). Sede das emoções, memória emocional e laços afetivos. Decide pelo sentimento antes da razão.' },
    { term: 'Neocórtex',               definition: 'Camada externa, evolutivamente mais recente. Faz raciocínio lógico, linguagem, planejamento e justificativa. Costuma RACIONALIZAR decisões que o límbico já tomou.' },
    { term: 'Amígdala',                definition: 'Pequena estrutura em formato de amêndoa no sistema límbico. Detecta ameaça em milissegundos e dispara respostas emocionais antes que a razão acorde.' },
    { term: 'Decisão Pré-consciente',  definition: 'Escolha que o cérebro toma antes da consciência perceber. Estudos com fMRI (Libet, Soon et al.) mostram que o cérebro decide até 7-10 segundos antes do "eu consciente" achar que decidiu.' },
    { term: 'Racionalização',          definition: 'Processo pelo qual o neocórtex inventa razões lógicas para uma escolha que o sistema límbico já fez emocionalmente. Daí a frase "compre com a emoção, justifique com a razão".' },
    { term: 'Gatilho Reptiliano',      definition: 'Estímulo que ativa diretamente o cérebro mais antigo: contraste forte, movimento, urgência ("acaba em 1h"), risco ("perca essa chance"), ganho de status ou sexo.' },
    { term: 'Marketing Sensorial',     definition: 'Estratégia que ativa os sentidos (cheiro de pão na padaria, cor vermelha do McDonald\'s) para conversar direto com o cérebro límbico antes do neocórtex pensar.' },
    { term: 'Modelo Atualizado',       definition: 'Neurociência moderna mostra que as 3 "camadas" trabalham em rede integrada, não em hierarquia rígida. O triuno é metáfora pedagógica — não anatomia literal.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Toda decisão de compra é tomada por três cérebros ao mesmo tempo — e eles raramente concordam. Quando você escolhe um café no mercado, o cérebro reptiliano olha primeiro ("é seguro? é familiar?"), o límbico sente ("essa embalagem me lembra a infância?") e só por último o neocórtex justifica ("o preço por grama é ótimo"). Este módulo apresenta o modelo triuno de MacLean — a base conceitual de praticamente todo curso sério de neuromarketing — e mostra por que entender essas três camadas muda a forma como você lê qualquer anúncio.',
    },
    {
      kind: 'concept',
      title: 'A história: como surgiu o modelo triuno',
      body:
        'Na década de 1960, o neurocientista americano Paul MacLean propôs que o cérebro humano não é uma estrutura única, mas três cérebros empilhados que evoluíram em momentos diferentes da história biológica. Primeiro veio o reptiliano (compartilhado com lagartos e tartarugas — cerca de 300 milhões de anos). Depois o sistema límbico (com os primeiros mamíferos — cerca de 200 milhões). Por último, o neocórtex (em mamíferos superiores e especialmente em humanos — últimos 2-3 milhões). Cada camada conserva funções da era em que apareceu. Você pode ter um cérebro analítico moderníssimo, mas embaixo dele continua um réptil avaliando ameaças.',
    },
    {
      kind: 'concept',
      title: 'Cérebro reptiliano — o segurança da porta',
      body:
        'Localização anatômica: tronco encefálico, cerebelo e gânglios da base. Função: sobrevivência básica. Respiração, batimento, temperatura, instinto sexual, defesa de território, reação de luta-ou-fuga. Não tem linguagem. Não faz contas. Decide por padrão visual, contraste, movimento e risco. Em marketing, é o cérebro que vê uma promoção "ÚLTIMAS HORAS" em vermelho piscando e injeta cortisol antes do neocórtex perguntar "espera, eu realmente preciso disso?".',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — fila do caixa',
      body:
        'Você está na fila do supermercado e olha pra prateleira de balas e chocolates ao lado. Não tinha planejado comprar nada disso. Mesmo assim, em 70% das vezes, a mão vai. Esse é o cérebro reptiliano funcionando: contraste visual (cores fortes), proximidade (alcance da mão), urgência ("é minha vez logo"), recompensa imediata (açúcar = energia). Supermercados sabem disso há décadas — por isso a área do caixa é a mais cara em aluguel de espaço de prateleira.',
      metadata: 'Reptiliano · contraste + proximidade + urgência',
    },
    {
      kind: 'concept',
      title: 'Sistema límbico — o coração que decide',
      body:
        'Localização: amígdala, hipocampo, hipotálamo, tálamo. Função: emoção, memória emocional, laços afetivos, motivação. Tudo que você ama, teme, sente saudade ou nojo passa por aqui. Não é raciocínio — é sentimento. Em decisões de compra, é o sistema límbico que dispara quando você vê a embalagem do café favorito da avó, ou quando uma música nostálgica toca no anúncio. Estudos com ressonância magnética funcional (fMRI) mostram que as áreas límbicas ATIVAM antes das corticais em decisões de produto — a emoção chega primeiro, o pensamento depois.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'A descoberta de Antonio Damásio',
      body:
        'O neurocientista português Antonio Damásio mostrou em pacientes com lesão no córtex pré-frontal ventromedial (área que conecta emoção e razão) que pessoas SEM acesso emocional ficam INCAPAZES de decidir. Elas conseguem listar prós e contras racionalmente, mas não conseguem ESCOLHER. Conclusão: não existe decisão puramente racional. Toda escolha humana é, em última instância, emocional — depois racionalizada.',
    },
    {
      kind: 'concept',
      title: 'Neocórtex — o porta-voz que justifica',
      body:
        'Localização: córtex cerebral, especialmente lobo frontal e pré-frontal. Função: linguagem, raciocínio lógico, planejamento, abstração matemática, análise comparativa. É a parte do cérebro que escreve currículo, faz planilha de gastos e lê reviews de produto na Amazon. PORÉM — e isso é central no neuromarketing — em ~95% das compras, o neocórtex chega TARDE. A decisão já foi feita pelo reptiliano/límbico em segundos, e o neocórtex só constrói uma narrativa convincente depois: "comprei esse carro porque consome menos combustível" (quando na verdade comprei porque achei bonito).',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança de 7 anos',
      body:
        'Imagine que dentro da sua cabeça moram TRÊS amigos. O primeiro é um dinossauro pequeno chamado Rex — ele só pensa em comer, fugir do leão e proteger a caverna. Quando você vê uma cobra, é o Rex que faz você pular pra trás antes mesmo de pensar. O segundo amigo é um cachorrinho fofo chamado Toby — ele só sente. Fica feliz quando você abraça a vovó, fica triste quando perde um brinquedo, ama chocolate. O terceiro é uma coruja sábia de óculos chamada Profa Filó — ela faz contas, lê livros e explica as coisas. O problema é: quando você quer comprar um doce no mercado, quem grita mais alto? O Rex ("AÇÚCAR! ENERGIA!") e o Toby ("LEMBRA DO ANIVERSÁRIO DO PRIMO?"). A Profa Filó só aparece depois pra inventar uma desculpa boa: "ah, hoje é sábado, mereço". É assim que o cérebro de adultos funciona o tempo todo.',
      metadata: 'Analogia infantil · 3 personagens = 3 cérebros',
    },
    {
      kind: 'concept',
      title: 'Como os 3 cérebros agem juntos numa compra',
      body:
        'Pegue um caso simples: você está pensando em assinar a Netflix. Veja a sequência típica em milissegundos. (1) Reptiliano: vê a tela vermelha, logo familiar, sente "seguro, conhecido". (2) Límbico: lembra das séries que ama, do tempo gostoso com a família no sofá, da saudade do último episódio. Dispara dopamina antecipada. (3) Neocórtex (chega por último): "39,90 por mês, divide com a família, sai a 10 reais cada, é mais barato que cinema". A decisão já está tomada quando o neocórtex faz a conta. Ele apenas confirma e EXPLICA a decisão pra você não se sentir impulsivo.',
    },
    {
      kind: 'table',
      caption: 'Os três cérebros em comparativo direto',
      headers: ['Cérebro', 'Idade evolutiva', 'O que decide', 'Velocidade', 'Linguagem'],
      rows: [
        ['Reptiliano', '~300 milhões de anos', 'Sobrevivência, instinto, território',  'Milissegundos',  'Visual, contraste, movimento'],
        ['Límbico',    '~200 milhões de anos', 'Emoção, vínculo, memória afetiva',     'Segundos',       'Sentimento, imagem, música'],
        ['Neocórtex',  '~2-3 milhões de anos', 'Raciocínio, análise, justificativa',   'Minutos a horas','Palavras, números, lógica'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Cuidado com a simplificação',
      body:
        'O modelo triuno é uma metáfora pedagógica útil, MAS a neurociência moderna mostrou que as áreas não funcionam em "andares" hierárquicos isolados — elas operam em redes neurais integradas (default mode network, salience network, etc). Se você for fazer pós em neurociência, vai aprender que MacLean simplificou demais. Mesmo assim, para marketing prático, o triuno continua sendo o mapa mental mais útil porque torna visível a sequência: instinto → emoção → razão. Use como mapa, não como dogma.',
    },
    {
      kind: 'concept',
      title: 'Aplicação prática — checklist do anúncio triuno',
      body:
        'Quando você cria ou avalia um anúncio, passe por 3 perguntas em ordem. Primeiro: o cérebro reptiliano vai NOTAR? (contraste visual, movimento, gatilho de risco/recompensa imediata). Segundo: o sistema límbico vai SENTIR algo? (memória afetiva, emoção primária — alegria, medo, surpresa, pertencimento). Terceiro: o neocórtex vai ter munição pra JUSTIFICAR a compra? (preço, garantia, prova social, característica técnica). Anúncio bom acerta os 3 na ordem certa. Anúncio que começa pelo neocórtex (cheio de specs técnicas) e ignora o réptil/límbico não vende — por mais correto que esteja.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — Coca-Cola vs Pepsi',
      body:
        'O famoso "Pepsi Challenge" dos anos 1980 mostrou em testes cegos que a maioria das pessoas PREFERE o sabor da Pepsi. Mas no mercado real, a Coca-Cola vende muito mais. Por quê? Read Montague (Baylor College) repetiu o teste em 2004 com fMRI: quando as pessoas não viam a marca, o cérebro respondia mais à Pepsi (córtex pré-frontal ventromedial = preferência de sabor). Quando viam a marca Coca-Cola, ativava também o hipocampo e o córtex pré-frontal dorsolateral — áreas de memória cultural e identidade. A Coca-Cola não vende refrigerante: vende memória afetiva e símbolo cultural. O sabor (neocórtex) perde pra emoção (límbico).',
      metadata: 'Caso clássico · neuromarketing experimental',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'O cérebro humano decide em camadas: reptiliano (instinto/segurança) → límbico (emoção/memória) → neocórtex (razão/justificativa). A ordem importa: emoção chega antes da razão.',
        '~95% das compras são decididas no límbico/reptiliano em segundos. O neocórtex só RACIONALIZA depois — daí a frase "compre com a emoção, justifique com a razão".',
        'O triuno é mapa mental pedagógico — não anatomia literal. A neurociência moderna fala em redes integradas. Use como ferramenta de análise, não como verdade absoluta.',
        'Anúncio eficaz aciona os 3 cérebros NA ORDEM: chama atenção reptiliana (contraste, urgência), dispara emoção límbica (memória, vínculo), e dá munição racional ao neocórtex (preço, prova, garantia).',
        'Estudos de fMRI (caso Coca-Cola/Pepsi de Montague) provam: marcas grandes vendem memória cultural e identidade — não sabor ou função. O cérebro emocional compra antes do racional comparar.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Segundo o modelo triuno de MacLean, qual a ORDEM em que os 3 cérebros respondem a um estímulo de compra?',
      options: [
        'Neocórtex → límbico → reptiliano (a razão decide primeiro)',
        'Reptiliano → límbico → neocórtex (instinto, emoção, razão)',
        'Límbico → neocórtex → reptiliano (emoção, razão, instinto)',
        'Os três respondem simultaneamente, sem ordem temporal',
      ],
      correct: 1,
      explanation:
        'A ordem é reptiliano → límbico → neocórtex. O reptiliano detecta estímulos (contraste, movimento, risco) em milissegundos. O límbico responde emocionalmente em segundos (memória, vínculo, prazer). O neocórtex chega por último (minutos a horas) e geralmente RACIONALIZA uma decisão já tomada pelas camadas anteriores. Por isso anúncios que começam pela razão (specs técnicas, comparativos de preço) sem ativar instinto/emoção tendem a fracassar.',
      hint: 'Pense em ordem evolutiva: o mais antigo responde primeiro.',
    },
    {
      question: 'Você está numa loja e ESCOLHE um carro mais caro do que o orçamento. Depois, em casa, justifica pra família: "é mais seguro, consome menos, vai durar mais". Esse padrão é descrito em neuromarketing como:',
      options: [
        'Decisão puramente racional do neocórtex',
        'Falha de função executiva — você "errou" a escolha',
        'Racionalização — o límbico decidiu, o neocórtex justificou depois',
        'Sobrecarga cognitiva (decision fatigue)',
      ],
      correct: 2,
      explanation:
        'É racionalização clássica. A decisão emocional foi tomada na loja (límbico: "amei esse carro, me sinto importante nele") e o neocórtex constrói depois uma narrativa lógica pra justificar a escolha — pra família, pros amigos e principalmente pra você mesmo (auto-conceito de "eu sou racional"). Antonio Damásio mostrou em pacientes com lesão no córtex pré-frontal ventromedial que sem o canal emoção-razão, a pessoa fica incapaz até de escolher cardápio de restaurante. Toda escolha é, no fundo, emocional.',
      hint: 'A decisão e a justificativa acontecem em momentos diferentes — e por cérebros diferentes.',
    },
    {
      question: 'A famosa pesquisa de Read Montague (2004) sobre Coca-Cola vs Pepsi mostrou que, em testes CEGOS, a maioria prefere o sabor da Pepsi. Mas no mercado real, Coca-Cola domina. A neurociência explica isso como:',
      options: [
        'Coca-Cola tem campanhas mais técnicas (foco em ingredientes)',
        'A marca Coca ativa hipocampo e córtex dorsolateral — memória cultural e identidade — que sobrepujam a preferência de sabor',
        'Pepsi tem distribuição pior — é só logística',
        'Os testes cegos eram metodologicamente errados',
      ],
      correct: 1,
      explanation:
        'A descoberta de Montague mostrou que, sem ver a marca, o cérebro responde apenas pela preferência sensorial (sabor → córtex pré-frontal ventromedial, e a Pepsi vence). Quando a marca Coca-Cola aparece, ativam também hipocampo (memória) e córtex pré-frontal dorsolateral (identidade, símbolo cultural). Esse "valor de marca" emocional supera o sabor objetivo. É o cérebro límbico vencendo o neocórtex sensorial — base conceitual de toda valuation de brand equity em marketing.',
      hint: 'O sabor é função do neocórtex; a marca grande ativa que outra área?',
    },
    {
      question: 'Marketing sensorial (cheiro de pão na padaria, vermelho do McDonald\'s, jingles repetitivos) tem qual objetivo neuroquímico principal?',
      options: [
        'Sobrecarregar o neocórtex pra confundir a análise racional',
        'Ativar o sistema límbico ANTES que o neocórtex pense — disparar emoção e memória afetiva',
        'Causar fadiga visual pra acelerar a decisão',
        'Estimular o cerebelo pra melhorar coordenação motora',
      ],
      correct: 1,
      explanation:
        'Marketing sensorial conversa direto com o sistema límbico (amígdala + hipocampo). Cheiros, cores e sons disparam memória emocional em milissegundos — muito antes do neocórtex analisar. O cheiro de pão fresco ativa nostalgia (família, infância, segurança). O vermelho do McDonald\'s acelera fome e impulso. Jingles instalam-se na memória de longo prazo via repetição emocional. Tudo isso é decisão pré-consciente — você "sente vontade" sem saber por quê.',
      hint: 'Que cérebro responde mais rápido a estímulos não-verbais como cheiro e cor?',
    },
    {
      question: 'Numa campanha publicitária focada APENAS em specs técnicas (megapixels, GHz, anos de garantia, % de juros) sem nenhuma ativação emocional, qual o principal problema neurocientífico?',
      options: [
        'Nenhum — o cérebro adulto decide pela razão na maioria das compras',
        'O anúncio fala só com o neocórtex e ignora reptiliano/límbico — não disparam atenção nem emoção, então a decisão de compra raramente acontece',
        'Excesso de números cansa o cerebelo',
        'O sistema reptiliano traduz mal números em ações',
      ],
      correct: 1,
      explanation:
        'O anúncio falha em ativar atenção (reptiliano) e emoção (límbico). Specs técnicas só conversam com o neocórtex — e o neocórtex sozinho não toma decisão de compra. Estudos clássicos de Damásio mostram que sem entrada emocional, o cérebro fica em paralisia analítica (lista prós/contras infinitamente sem escolher). É por isso que anúncios apenas técnicos vendem muito menos que anúncios com narrativa emocional + specs como apoio. "Compre com emoção, justifique com razão" não é frase de venda — é descrição neurocientífica do processo decisório.',
      hint: 'Damásio provou que decisão sem emoção não acontece — fica em loop analítico.',
    },
    {
      question: 'O modelo triuno de MacLean é considerado hoje pela neurociência moderna como:',
      options: [
        'Cientificamente preciso em todos os aspectos anatômicos',
        'Completamente falso e sem valor pedagógico',
        'Metáfora útil pra marketing, mas simplificação excessiva da anatomia real (cérebro opera em redes integradas, não em camadas isoladas)',
        'A única teoria aceita sobre evolução cerebral',
      ],
      correct: 2,
      explanation:
        'O triuno é metáfora pedagógica útil mas anatomicamente impreciso. Imagens modernas mostram que cérebro opera em REDES (default mode, salience, executive, etc), com áreas das três "camadas" trabalhando integradas. As funções não são tão limpamente segregadas. Para marketing prático, o triuno continua útil como mapa mental — torna visível a sequência instinto→emoção→razão. Para pós em neurociência, você vai aprender que a realidade é mais complexa. Use como ferramenta, sabendo das limitações.',
      hint: 'Tudo na ciência boa é "mapa útil" ou "modelo verdadeiro"?',
    },
    {
      question: 'Você está criando um anúncio pra um curso online de R$ 297. Aplicando o checklist triuno, qual elemento ativaria PRIMEIRAMENTE o cérebro reptiliano (atenção)?',
      options: [
        'Lista detalhada de 23 módulos do curso',
        'Tabela comparativa com 5 concorrentes',
        'Manchete em contraste forte com cronômetro de urgência: "ÚLTIMAS 3 VAGAS · ENCERRA EM 2H"',
        'Depoimento longo em vídeo de 12 minutos',
      ],
      correct: 2,
      explanation:
        'Contraste visual forte + urgência temporal + escassez = combo clássico de gatilhos reptilianos. Eles ativam atenção em milissegundos via amígdala (detecção de risco/oportunidade). Lista de módulos, comparativos e depoimentos longos são munição pro neocórtex — funcionam, mas SÓ depois que o anúncio capturou atenção. Sequência correta: reptiliano (chamada urgente) → límbico (depoimento emocional de transformação) → neocórtex (lista de módulos, preço, garantia). Pular o reptiliano e começar pela razão = anúncio invisível.',
      hint: 'Reptiliano responde a movimento, contraste, urgência e risco/oportunidade.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 2 — Sistema 1 e Sistema 2 (Daniel Kahneman)
// ────────────────────────────────────────────────────────────────────────
export const MOD_2_SISTEMAS: Module = {
  slug: 'sistema-1-sistema-2-kahneman',
  num: 2,
  icon: '⚡',
  title: 'Sistema 1 e Sistema 2 — pensamento rápido e devagar (Kahneman)',
  summary:
    'Daniel Kahneman ganhou o Nobel mostrando que o cérebro tem dois modos de pensar: o rápido (intuitivo, automático, emocional) e o lento (analítico, custoso, racional). O Sistema 1 toma 98% das decisões — e é nele que o marketing entra.',
  estimatedMin: 20,
  keyTerms: [
    { term: 'Sistema 1',                 definition: 'Modo de pensamento rápido, automático, intuitivo e sem esforço consciente. Reconhece padrões, sente emoções e toma 95-98% das decisões do dia.' },
    { term: 'Sistema 2',                 definition: 'Modo lento, analítico, deliberado e custoso em energia. Faz contas, raciocínio lógico, autocrítica. Só ativa quando o S1 sinaliza dificuldade ou conflito.' },
    { term: 'Heurística',                definition: 'Regra mental de atalho que o Sistema 1 usa pra decidir rápido sem analisar tudo. Ex: "marca conhecida = mais segura", "mais caro = melhor qualidade".' },
    { term: 'Viés Cognitivo',            definition: 'Erro sistemático de julgamento que surge quando o Sistema 1 aplica uma heurística em situação onde ela não funciona. Ex: ancoragem, confirmação, disponibilidade.' },
    { term: 'Esforço Cognitivo',         definition: 'Energia metabólica que o cérebro gasta. O Sistema 2 consome muita glicose; o cérebro evita ativá-lo por reflexo evolutivo de economia.' },
    { term: 'Aversão à Perda',           definition: 'Princípio descoberto por Kahneman e Tversky: a dor de perder R$ 100 é psicologicamente ~2x maior que o prazer de ganhar R$ 100. Base da Teoria do Prospecto.' },
    { term: 'Cognitive Ease',            definition: 'Facilidade percebida do cérebro ao processar uma informação. Fontes legíveis, palavras familiares e repetição geram "cognitive ease" — que o S1 confunde com VERDADE e CONFIANÇA.' },
    { term: 'Priming',                   definition: 'Quando uma palavra, imagem ou ideia recente influencia INCONSCIENTEMENTE a próxima escolha. Ex: ver palavras de "velhice" faz pessoas andarem mais devagar (Bargh, 1996).' },
    { term: 'Efeito de Disponibilidade', definition: 'Heurística do S1 que julga a frequência/probabilidade de algo pela facilidade com que exemplos vêm à mente. Acidentes de avião viram "comuns" depois de notícia recente.' },
    { term: 'Pensar Rápido e Devagar',   definition: 'Livro de 2011 onde Kahneman compila 4 décadas de pesquisa em economia comportamental e neurociência cognitiva. Base teórica do neuromarketing moderno.' },
    { term: 'Daniel Kahneman',           definition: 'Psicólogo israelense-americano (1934-2024). Nobel de Economia em 2002 pela Teoria do Prospecto. Único não-economista a receber o Nobel de Economia.' },
    { term: 'Amos Tversky',              definition: 'Parceiro de Kahneman em décadas de pesquisa. Faleceu em 1996 — não pôde dividir o Nobel, mas é metade do legado intelectual.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Em 2002, o psicólogo Daniel Kahneman ganhou o Prêmio Nobel de Economia por uma ideia simples e revolucionária: humanos não são racionais. Temos dois modos de pensar (que ele chama de Sistema 1 e Sistema 2) e quase tudo que fazemos vem do Sistema 1 — o rápido, intuitivo e emocional. Marketing eficaz fala com o Sistema 1. Marketing ruim insiste em falar com o Sistema 2. Este módulo destrincha os dois sistemas e mostra por que entender essa diferença é o requisito mínimo pra criar qualquer campanha hoje.',
    },
    {
      kind: 'concept',
      title: 'Sistema 1 — o piloto automático',
      body:
        'Funciona sem esforço, sem permissão consciente e o tempo todo. Reconhece o rosto da sua mãe em 0,3 segundos. Lê palavras automaticamente (você não consegue NÃO ler uma palavra ao olhar pra ela). Sente medo antes de identificar a cobra. Dirige o carro no trajeto conhecido enquanto você pensa no trabalho. Faz julgamentos rápidos: "essa pessoa é confiável", "esse restaurante parece bom". É emocional, intuitivo, associativo e SEMPRE LIGADO. É também o cérebro que decide ~98% das compras do dia — desde o que comer no almoço até qual marca de pasta de dente pegar na prateleira.',
    },
    {
      kind: 'concept',
      title: 'Sistema 2 — o analista cético',
      body:
        'Lento, deliberado, custoso em energia. É o cérebro que faz 17 × 24 sem calculadora, que lê um contrato palavra por palavra, que compara 5 planos de celular numa planilha. Tem capacidade analítica enorme, mas o cérebro o evita por reflexo evolutivo: pensar gasta muita glicose. Por isso o Sistema 2 só liga quando o Sistema 1 sinaliza "tá complicado aqui" — vê uma palavra estranha, um cálculo difícil, uma situação nova. Mesmo quando liga, é PREGUIÇOSO: confia no S1 sempre que pode. Esse é o calcanhar de Aquiles do "consumidor racional" — ele quase nunca chega a ativar.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'A divisão de trabalho real',
      body:
        'Estima-se que o Sistema 1 toma 95-98% das decisões diárias — incluindo praticamente todas as compras de baixo valor (supermercado, café, app, snack). O Sistema 2 entra em ~2-5%: comprar imóvel, escolher faculdade, contratar plano de saúde. Mesmo nessas decisões grandes, o S2 muitas vezes só CONFIRMA o que o S1 já decidiu emocionalmente — esse é o efeito da racionalização que vimos no módulo anterior.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — o supermercado',
      body:
        'Você entra no mercado com lista. Em 40 minutos pega ~30 produtos. Quantas decisões realmente analíticas você fez? Quase nenhuma. Você pegou a marca de leite "de sempre" (S1 — familiaridade), levou o iogurte na promoção (S1 — gatilho de desconto), trocou de marca de cerveja porque a embalagem era diferente (S1 — novidade visual), e adicionou chocolate no caixa (S1 — gatilho reptiliano). Em 30 produtos, talvez 1 ou 2 você realmente comparou preço por kg ou leu o rótulo nutricional. Esse 1 produto = Sistema 2. Os outros 29 = Sistema 1. Marketing de FMCG (bens de consumo rápido) é desenhado quase 100% pro S1.',
      metadata: 'S1 dominante em compras rotineiras de baixo envolvimento',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança',
      body:
        'Imagina que dentro da sua cabeça moram dois ajudantes. O primeiro se chama Zip — ele é super rápido, parece um esquilo cafeinado. Quando você vê uma bola voando na sua direção, é o Zip que te faz desviar antes mesmo de pensar. Ele adora as coisas que já conhece, gosta de cores fortes e nunca para. O outro é a Profa Lenta — uma tartaruga simpática com óculos e caderno. Ela é MUITO inteligente, mas é vagarosa e fica cansada rápido. Você só chama a Profa Lenta quando tem dever de casa difícil, ou quando precisa decidir qual brinquedo comprar com a mesada de 3 meses. O Zip faz quase TUDO sozinho — escolher o lanche, decidir qual desenho assistir, pegar o suco favorito na geladeira. Quando você cresce, o Zip continua mandando — só que agora ele decide qual celular comprar, qual marca de café, qual restaurante. A Profa Lenta só aparece em decisões grandes. Marketing é como falar com o Zip — ele responde a cores, urgência e coisas que já gosta.',
      metadata: 'Analogia infantil · Zip = S1, Profa Lenta = S2',
    },
    {
      kind: 'concept',
      title: 'Cognitive Ease — a facilidade que vira verdade',
      body:
        'Uma das descobertas mais inquietantes de Kahneman: quanto mais FÁCIL o cérebro processa uma informação, mais ele acredita que ela é verdadeira. Fonte legível, palavras familiares, repetição, rimas — tudo isso gera "cognitive ease". E ease ativa o S1 num modo confiante, relaxado, sem ativar o S2 crítico. Por isso slogans rimam ("um milhão de razões"), por isso anúncios repetem a marca várias vezes, por isso fontes de design ruim despertam desconfiança. A regra prática: tudo que dificulta o processamento ATIVA o Sistema 2 cético. Tudo que facilita DESLIGA o ceticismo.',
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Experimento da rima (McGlone & Tofighbakhsh, 2000)',
      body:
        'Pesquisadores apresentaram aforismos a duas plateias. Versão A: "Woes unite foes" (rima). Versão B: "Woes unite enemies" (sem rima, mesmo significado). Resultado: pessoas julgaram a versão com rima COMO MAIS VERDADEIRA. A rima gerou cognitive ease, que o S1 confundiu com plausibilidade. É por isso que slogans rimam ("Wash and go", "Doutor Oetker"). A rima não é estética — é manipulação de Sistema 1 baseada em pesquisa robusta.',
    },
    {
      kind: 'concept',
      title: 'Aversão à Perda — perder dói o dobro de ganhar',
      body:
        'Descoberta central de Kahneman e Tversky (Teoria do Prospecto, 1979): a dor psicológica de perder R$ 100 é cerca de 2x maior que o prazer de ganhar R$ 100. O cérebro NÃO trata ganhos e perdas com simetria — perdas pesam muito mais. Isso explica por que campanhas com framing de PERDA ("Você está deixando de ganhar R$ 5.000 por mês por não saber inglês") performam melhor que campanhas com framing de GANHO ("Aprenda inglês e ganhe mais"). Não é só semântica — é diferença neuroquímica documentada em fMRI.',
    },
    {
      kind: 'concept',
      title: 'Como o marketing usa S1 e S2 estrategicamente',
      body:
        'Marketing eficaz desenha pra quem está realmente decidindo. Em produto de baixo envolvimento (chiclete, refrigerante, app gratuito), foca 100% no S1: cor, embalagem, jingle, distribuição. Não tenta explicar — tenta ser FAMILIAR e DESEJÁVEL. Em produto de alto envolvimento (imóvel, carro, MBA), precisa dos dois: o S1 capta atenção e gera desejo (foto aspiracional, testimonial emocional), depois oferece material analítico pro S2 (planta, financiamento, ROI) — porque mesmo quando o S1 já decidiu, o S2 precisa de munição pra autorizar e justificar a compra. Anúncio que erra o sistema-alvo é anúncio invisível.',
    },
    {
      kind: 'table',
      caption: 'Sistema 1 vs Sistema 2 — comparativo prático',
      headers: ['Característica', 'Sistema 1 (Rápido)', 'Sistema 2 (Devagar)'],
      rows: [
        ['Velocidade',         'Milissegundos',                'Segundos a minutos'],
        ['Esforço',            'Zero — automático',            'Alto — gasta glicose'],
        ['Tipo de pensamento', 'Intuitivo, associativo',       'Lógico, analítico'],
        ['Estado emocional',   'Sempre presente',              'Tenta neutralizar emoção'],
        ['Erros típicos',      'Vieses, heurísticas',          'Cansaço, erro de conta'],
        ['Dominância',         '95-98% das decisões',          '2-5% das decisões'],
        ['Bom para',           'Reconhecer rosto, dirigir',    'Cálculo, contrato, escolha rara'],
        ['Marketing fala com', 'Embalagem, cor, jingle',       'Planilha, comparativo, garantia'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Erro comum no marketing brasileiro',
      body:
        'Muitas marcas insistem em "educar o consumidor" com anúncios cheios de specs técnicas, gráficos comparativos e argumentos racionais. Funciona pra ~2% das pessoas (quem está em modo S2 ativo, pesquisando profundamente). Para os outros 98%, o anúncio é tecnicamente correto e emocionalmente invisível. A regra: se o consumidor não está em momento de decisão analítica (pesquisa de alto envolvimento), você está falando com o S1 — e o S1 não lê specs. Ele sente.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — escolhendo plano de internet',
      body:
        'Você precisa trocar de internet. Modo S2 ativado (decisão importante, custo fixo, 12 meses). Entra no site da Vivo: tabela com 4 planos, velocidade em Mbps, preço, taxa de instalação, fidelidade. Tudo claro. Vai pro site da Claro: mesma tabela, números parecidos. Sai pro site da TIM: idem. Em 20 minutos, você ESTÁ EXAUSTO. O S2 entrou em fadiga (decision fatigue). O que decide a compra? S1: "ah, vou na Vivo porque já tive antes e funcionou" (familiaridade), ou "vou na Claro porque o representante foi simpático" (afeto), ou "vou na TIM porque vi um anúncio bonito ontem" (priming). Mesmo em decisão "racional", o S1 fecha.',
      metadata: 'Decision fatigue · S2 cansa, S1 fecha',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Sistema 1 é rápido, automático, emocional, sempre ligado — toma 95-98% das decisões. Sistema 2 é lento, analítico, custoso e preguiçoso — só ativa quando o S1 sinaliza dificuldade.',
        'Cognitive Ease: tudo que o cérebro processa fácil (fonte legível, rima, palavra familiar, repetição), o S1 confunde com verdade. Tudo difícil ativa o S2 cético.',
        'Aversão à perda: perder R$ 100 dói ~2x mais que ganhar R$ 100. Framing de PERDA performa melhor que framing de GANHO em quase toda campanha.',
        'Marketing eficaz desenha pro sistema-alvo. Baixo envolvimento (chiclete, app): 100% S1 (cor, embalagem, distribuição). Alto envolvimento (imóvel, MBA): S1 capta + S2 racionaliza.',
        'Falar só com o S2 (specs, planilhas) é receita pra anúncio invisível. O S1 precisa sentir alguma coisa primeiro — depois o S2 entra pra justificar.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Segundo Kahneman, qual é a divisão estimada de decisões diárias entre Sistema 1 (rápido/intuitivo) e Sistema 2 (lento/analítico)?',
      options: [
        '50% S1 / 50% S2 — equilíbrio total',
        '70% S1 / 30% S2 — leve dominância intuitiva',
        '95-98% S1 / 2-5% S2 — S1 absolutamente dominante',
        '20% S1 / 80% S2 — humanos são essencialmente racionais',
      ],
      correct: 2,
      explanation:
        'Estimativas de Kahneman e pesquisas posteriores (Bargh, Damásio) convergem em ~95-98% das decisões diárias sendo do S1. O S2 só ativa em decisões raras de alto envolvimento (imóvel, carro, faculdade) — e mesmo nessas, frequentemente só CONFIRMA o que o S1 já decidiu emocionalmente. Essa é a base por que "consumidor racional" é mito útil pra economia clássica, mas falso na prática neurocientífica.',
      hint: 'O S2 gasta muita glicose. O cérebro evolui evitando esforço.',
    },
    {
      question: 'O experimento de McGlone & Tofighbakhsh (2000) mostrou que aforismos com RIMA são julgados como mais verdadeiros que versões equivalentes sem rima. Que princípio neurocientífico explica isso?',
      options: [
        'Cognitive Ease — o S1 confunde facilidade de processamento com plausibilidade',
        'Aversão à perda — rima cria sensação de continuidade',
        'Heurística da disponibilidade — rima fica mais lembrada',
        'Efeito Stroop — rima conflita com semântica',
      ],
      correct: 0,
      explanation:
        'Cognitive Ease é o princípio: quanto mais FÁCIL o cérebro processa uma informação, mais o S1 a aceita como verdadeira (sem ativar o S2 cético). Rima gera fluência fonética, que o S1 lê como "isso flui, deve fazer sentido". É por isso que slogans rimam ("Wash and go") — não é estética, é design intencional pra desligar o ceticismo. Funciona em qualquer idioma e em contextos surpreendentemente diversos.',
      hint: 'Facilidade de processamento ativa qual sistema, e como o S1 interpreta essa facilidade?',
    },
    {
      question: 'Você cria duas versões de anúncio pra um curso de inglês: A) "Aprenda inglês e ganhe R$ 5.000 a mais por mês". B) "Você está perdendo R$ 5.000 por mês por NÃO saber inglês". Pela Teoria do Prospecto de Kahneman, qual versão tende a converter mais e por quê?',
      options: [
        'Versão A — ganho parece mais atraente que ameaça de perda',
        'Versão B — aversão à perda: perder dói ~2x mais que ganhar o mesmo valor',
        'Ambas convertem igualmente — é só semântica',
        'Versão A — porque pessoas evitam pensamentos negativos',
      ],
      correct: 1,
      explanation:
        'Pela Teoria do Prospecto (Kahneman & Tversky, 1979), perdas pesam ~2x mais que ganhos do mesmo tamanho na decisão humana. O framing de PERDA ("você está perdendo") ativa o sistema de detecção de ameaça (amígdala) com mais intensidade que o framing de GANHO ativa o sistema de recompensa (núcleo accumbens). Por isso campanhas de "evite perder" tendem a converter melhor que "venha ganhar" — em contextos como saúde, dinheiro e tempo, principalmente.',
      hint: 'A diferença não está no que se promete, mas em como o cérebro pesa ganho vs perda.',
    },
    {
      question: 'Em produto de BAIXO envolvimento (chiclete, refrigerante, app gratuito), o anúncio deveria focar primariamente em:',
      options: [
        'Tabela comparativa de specs vs concorrentes',
        'Cor, embalagem, jingle, familiaridade, distribuição — S1 puro',
        'Vídeo longo explicando ROI da compra',
        'Lista de prós e contras detalhada',
      ],
      correct: 1,
      explanation:
        'Em baixo envolvimento (compra rotineira, baixo custo, baixo risco), o consumidor decide 100% em S1 na frente da prateleira ou no app — em segundos, sem ativar o S2. Cor, embalagem, familiaridade, gatilhos sensoriais e distribuição (estar disponível na hora certa) são o que vende. Specs e comparativos são desperdício de espaço — ninguém para pra ler tabela comparativa antes de comprar chiclete. A regra: produto de baixo envolvimento = comunicação de S1.',
      hint: 'O S2 não ativa pra decisões pequenas e rotineiras.',
    },
    {
      question: 'Decision fatigue (fadiga de decisão) é o fenômeno em que:',
      options: [
        'O Sistema 1 acelera após muitas decisões',
        'O Sistema 2 esgota glicose após decisões consecutivas e o cérebro volta a depender do S1 — mesmo em decisões importantes',
        'Apenas pessoas com TDAH sofrem desse efeito',
        'É mito popular sem evidência neurocientífica',
      ],
      correct: 1,
      explanation:
        'Decision fatigue está bem documentada em estudos (Baumeister, Vohs, Tice). O S2 gasta glicose; após sessões de decisão consecutiva (escolher casa, planos, configurações), o S2 entra em fadiga metabólica e o cérebro RECUA pro S1 (intuitivo, emocional, heurístico). É por isso que pessoas no FIM de longa sessão de compras tendem a fechar pela marca conhecida ou pelo vendedor mais simpático — não pela análise mais correta. Aplicação prática: jamais peça decisão complexa ao final de jornada longa.',
      hint: 'O que acontece com o S2 após muito esforço analítico?',
    },
    {
      question: 'Por que campanhas que focam APENAS em "educar o consumidor" com argumentos racionais costumam ter ROI baixo no mercado de massa?',
      options: [
        'Porque consumidores não querem aprender',
        'Porque conversam só com S2 — que está inativo em 95-98% das decisões; o S1 precisa SENTIR primeiro pra que o S2 sequer entre em cena',
        'Porque texto é menos efetivo que imagem',
        'Porque a maioria das pessoas é analfabeta funcional',
      ],
      correct: 1,
      explanation:
        'Campanhas só-racionais falam exclusivamente com o S2 — que está desligado na maioria das decisões. Sem ativação do S1 (emoção, desejo, atenção visual), o anúncio é tecnicamente correto mas neurocientificamente invisível. A sequência funcional é S1 primeiro (capta atenção e gera desejo emocional), DEPOIS o S2 entra com munição racional pra autorizar e justificar a compra. Pular o S1 = pular o gatilho de decisão.',
      hint: 'O S2 só ativa quando o S1 sinaliza interesse ou conflito.',
    },
    {
      question: 'Aplicando S1/S2 a um anúncio de PLANO DE SAÚDE familiar (alto envolvimento), qual abordagem é mais alinhada à neurociência?',
      options: [
        'Apenas tabela de cobertura, preço e rede credenciada — puro S2',
        'Apenas imagem emocional de família feliz, sem nenhum dado — puro S1',
        'Imagem/narrativa emocional de proteção familiar (S1) + tabela clara de cobertura, rede e preço (S2) — ativa desejo, depois dá munição racional',
        'Foco em prêmios da marca e história centenária da empresa',
      ],
      correct: 2,
      explanation:
        'Plano de saúde é alto envolvimento (custo alto, decisão de longo prazo, peso emocional sobre família). A sequência ideal é: S1 primeiro ativa desejo emocional (proteção, segurança, paz mental — imagem ou storytelling de família protegida). Depois, S2 recebe a munição racional necessária pra autorizar a compra (cobertura específica, rede credenciada, preço, condições). Sem o S1, o S2 paralisa em comparativos infinitos. Sem o S2, o cônjuge questiona "mas e o preço, e a rede?" e a venda trava. Os dois sistemas juntos fecham.',
      hint: 'Alto envolvimento = ambos os sistemas precisam ser endereçados, na ordem certa.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 3 — Atenção: o filtro do cérebro
// ────────────────────────────────────────────────────────────────────────
export const MOD_3_ATENCAO: Module = {
  slug: 'atencao-filtro-do-cerebro',
  num: 3,
  icon: '👁️',
  title: 'Atenção — o filtro que decide o que o cérebro vê',
  summary:
    'Você recebe ~11 milhões de bits de informação por segundo. Sua consciência processa ~40. Quem decide o que passa por esse filtro brutal é o sistema de atenção — e é aí que marca briga por espaço cognitivo.',
  estimatedMin: 18,
  keyTerms: [
    { term: 'Atenção',                  definition: 'Processo neural que seleciona um subconjunto de estímulos pra processamento consciente, ignorando os demais. Sem atenção, não há memória nem decisão.' },
    { term: 'Atenção Seletiva',         definition: 'Capacidade de focar num estímulo específico ignorando outros. Ex: ouvir uma conversa numa festa cheia (cocktail party effect, Cherry 1953).' },
    { term: 'Atenção Dividida',         definition: 'Tentativa de prestar atenção em múltiplas tarefas simultaneamente. Neurociência mostra que humanos quase não fazem isso — alternam rapidamente (task switching) com perda de performance.' },
    { term: 'Atenção Sustentada',       definition: 'Manter o foco numa tarefa por tempo prolongado. Decai rapidamente em situações monótonas; estudos mostram queda significativa após ~20 minutos.' },
    { term: 'Bottom-up',                definition: 'Atenção capturada involuntariamente por características do estímulo: contraste, movimento, novidade, brilho, som alto. Resposta reflexa, rápida, do S1.' },
    { term: 'Top-down',                 definition: 'Atenção direcionada voluntariamente por objetivos, intenção e contexto. Você procura ativamente "queijo" no mercado e ignora as outras 4000 SKUs. Requer S2.' },
    { term: 'Banner Blindness',         definition: 'Fenômeno descoberto por Jakob Nielsen: usuários ignoram regiões da tela que historicamente trazem propaganda, mesmo se conteúdo útil estiver ali. O cérebro filtra por aprendizado.' },
    { term: 'Cocktail Party Effect',    definition: 'Habilidade do cérebro de filtrar uma voz numa festa barulhenta enquanto ignora outras — mas ainda capta seu nome se alguém o diz. Mostra que o "ignorado" continua sendo processado em paralelo.' },
    { term: 'Foco Atencional',          definition: 'Região visual ou conceitual onde a atenção está concentrada num dado momento. Estímulos fora dele recebem processamento mínimo.' },
    { term: 'Inattentional Blindness',  definition: 'Cegueira por desatenção. Experimento clássico do "gorila invisível" (Simons & Chabris, 1999): 50% das pessoas contando passes de bola NÃO veem um gorila atravessando a cena.' },
    { term: 'Eye-tracking',             definition: 'Tecnologia que registra para onde o olho vai e por quanto tempo fixa. Ferramenta-base em pesquisas de neuromarketing visual (embalagens, sites, anúncios).' },
    { term: 'Heat Map de Atenção',      definition: 'Visualização agregada de dados de eye-tracking. Mostra zonas quentes (mais olhadas) e frias (ignoradas). Insumo direto pra otimização de layouts.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Os olhos captam aproximadamente 10 milhões de bits de informação visual por segundo. Os outros sentidos somam mais 1 milhão. Total: 11 milhões de bits/s entrando no cérebro. Quanto disso a consciência processa? Cerca de 40 bits/s — menos de 0,0004% do total. Quem decide o que entra nesses 40 bits é o sistema de atenção. E é exatamente aí que o marketing trava sua primeira batalha: se você não chama atenção, você não existe. Este módulo explica como funciona o filtro atencional e por que entender isso muda toda decisão de design de anúncio, embalagem e site.',
    },
    {
      kind: 'concept',
      title: 'O gargalo atencional — por que é tão estreito',
      body:
        'Evolutivamente, o cérebro humano não foi feito pra processar tudo. Foi feito pra filtrar agressivamente e focar no que importa pra sobrevivência. Imagine um ancestral na savana: precisa detectar o leão escondido na grama (movimento, contraste) e ignorar a maioria dos estímulos paralelos (vento, pássaros, folhas). Hoje o "leão" virou notificação de WhatsApp e a "savana" virou feed do Instagram — mas o sistema atencional continua o mesmo. Cérebro evoluído pra savana operando em metrópole digital. Resultado: filtro brutal, fadiga rápida, distração crônica.',
    },
    {
      kind: 'concept',
      title: 'Atenção bottom-up — o que SALTA do ambiente',
      body:
        'Atenção bottom-up é involuntária, reflexa e dominada pelo Sistema 1. Estímulos que ATIVAM ela: contraste de cor (vermelho num mar de cinza), movimento (banner animado, vídeo no feed), novidade (algo diferente do padrão), tamanho (manchete grande), som alto, rosto humano (cérebro tem áreas dedicadas — fusiform face area), olhos olhando direto (gatilho atávico de ameaça/conexão). É a atenção que o reptiliano controla — sequestra você antes do consciente pedir permissão.',
    },
    {
      kind: 'callout',
      tone: 'info',
      title: 'Por que rostos vendem mais',
      body:
        'O cérebro humano dedica uma região inteira (fusiform face area, FFA) só pra reconhecer rostos. Estudos de eye-tracking mostram que a primeira fixação do olho num anúncio com pessoa vai SEMPRE pro rosto, antes de qualquer outro elemento. E se os olhos da pessoa estão olhando pra um produto, o olho do espectador segue (effect of gaze cueing). Anúncio de bebê olhando pra direita = consumidor olha pra direita. Por isso 80% dos pôsteres de filme têm closeup de rosto.',
    },
    {
      kind: 'concept',
      title: 'Atenção top-down — o que VOCÊ procura',
      body:
        'Atenção top-down é voluntária, dirigida por objetivos e dominada pelo Sistema 2. Quando você entra no mercado com "preciso de queijo cottage", seu cérebro ativa um filtro mental: ignora 90% das prateleiras e procura ativamente embalagens brancas com a palavra "cottage". Mesmo um produto excelente em promoção, se NÃO bater com sua intenção ativa, fica invisível. Isso explica por que marcas que conseguem entrar na "lista mental de compra" do consumidor (top-of-mind) ganham desproporcionalmente — você JÁ as procura.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — o gorila invisível',
      body:
        'Em 1999, Simons & Chabris fizeram o experimento mais famoso da psicologia: pediram a voluntários que assistissem um vídeo de jogadores passando bola e CONTASSEM os passes do time branco. No meio do vídeo, uma pessoa fantasiada de gorila atravessa a cena, fica 9 segundos em foco, bate no peito e sai. 50% dos participantes NÃO VERAM o gorila. Eles estavam tão focados em contar passes (atenção top-down) que o cérebro filtrou completamente o resto. Lição pra marketing: pessoa focada em outra coisa NÃO vê seu anúncio, por mais óbvio que ele seja. Você precisa interromper o foco (gatilho bottom-up) ou estar alinhado com o foco (top-down) — não tem terceira via.',
      metadata: 'Inattentional blindness · clássico da psicologia',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança',
      body:
        'Imagina que seu cérebro é um portão de festa com um segurança chamado Foco. A festa é a sua cabeça. Do lado de fora tem MILHARES de pessoas querendo entrar: o cachorro latindo, a TV ligada, o cheiro do almoço, a roupa coçando, o desenho do amigo, a tarefa da escola. O Foco só deixa ENTRAR umas poucas por vez — e quem ele deixa é ele que decide. Tem dois jeitos de furar a fila: 1) Gritando MUITO ALTO e dançando com fantasia colorida (atenção bottom-up — é como o piscapisca do caminhão de bombeiro chama atenção). 2) Sendo o convidado que o Foco está procurando — se ele tá esperando o seu amigo João, quando o João chega, ele entra direto (atenção top-down). Marketing é igualzinho: ou você é tão colorido e diferente que o Foco te puxa pra dentro, ou você é exatamente o que ele estava procurando. Quem tenta entrar sendo "mais ou menos parecido com a multidão" fica na fila pra sempre.',
      metadata: 'Analogia infantil · Foco = sistema atencional',
    },
    {
      kind: 'concept',
      title: 'Banner blindness — quando o cérebro aprende a ignorar',
      body:
        'Jakob Nielsen documentou em 1997 (e revalidou nas décadas seguintes) que usuários da web DESENVOLVEM cegueira automática a regiões da tela onde costumam aparecer anúncios — geralmente no topo e nas laterais direita. Mesmo se você COLOCAR informação útil nessas zonas, o cérebro filtra antes da consciência olhar. É aprendizado em massa: o cérebro aprende padrões de irrelevância e otimiza filtrando. Isso explica por que ad-blockers não são só preguiça do usuário: o cérebro já bloqueia antes do plugin entrar. Aplicação prática: design de página tem zonas "vendíveis" e zonas "queimadas" — e isso muda com a evolução cultural.',
    },
    {
      kind: 'concept',
      title: 'Eye-tracking — medindo o invisível',
      body:
        'Eye-tracking usa câmeras infravermelhas que registram exatamente para onde o olho aponta a cada milissegundo. Gera dois tipos de dado: FIXAÇÕES (onde o olho parou e por quanto tempo — atenção real) e SACADAS (movimentos rápidos entre fixações). Agregando muitos sujeitos, gera um HEATMAP: regiões vermelhas (todo mundo olhou) e regiões frias (ninguém viu). Em embalagens de supermercado, eye-tracking é usado pra otimizar onde colocar logo, claims, prêmios. Em sites, otimiza onde colocar CTA e formulário. Hoje qualquer agência média tem acesso à tecnologia — sai dos R$ 200/sujeito do Tobii ou GazeRecorder.',
    },
    {
      kind: 'table',
      caption: 'Atenção bottom-up vs top-down — comparativo',
      headers: ['Característica', 'Bottom-up', 'Top-down'],
      rows: [
        ['Origem',                  'Estímulo externo',           'Intenção interna'],
        ['Controle',                'Involuntário, reflexo',      'Voluntário, deliberado'],
        ['Sistema',                 'S1 — rápido',                'S2 — esforço'],
        ['Velocidade',              'Milissegundos',              'Segundos'],
        ['Triggers',                'Cor, movimento, novidade',   'Objetivo, palavra-chave, marca'],
        ['Como usar em marketing',  'Disrupção visual, surpresa', 'Estar no top-of-mind, SEO'],
        ['Limite',                  'Fadiga rápida (saturação)',  'Recurso finito (decision fatigue)'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'A guerra pela atenção é zero-sum',
      body:
        'O usuário NÃO tem mais atenção pra te dar. Ele tem 40 bits/s de capacidade consciente — e isso é distribuído entre tudo: trabalho, família, redes sociais, notificações, ansiedade. Se você ganha atenção, alguém perde. E vice-versa. Essa é a economia neurocientífica que estrutura todo o mercado digital hoje (Herbert Simon antecipou isso em 1971: "uma riqueza de informação cria uma pobreza de atenção"). Sua marca compete com a Netflix, com o ex que mandou mensagem, com o boleto vencendo. Subestimar isso = anúncio invisível.',
    },
    {
      kind: 'concept',
      title: 'Aplicação prática — checklist atencional',
      body:
        'Antes de lançar qualquer anúncio, embalagem ou página, passe por 5 perguntas. (1) Tem disruptor BOTTOM-UP claro? (cor contrastante, movimento, rosto, número grande). (2) Esse disruptor é alinhado com a marca ou é só barulho? (cuidado com clickbait que destrói reputação). (3) Tem âncora TOP-DOWN? (palavra/imagem que conecta com necessidade ativa do público — "boleto", "promoção", "férias"). (4) Está em zona aprendida como confiável (centro) ou zona queimada (banner-blindness)? (5) Sobrevive a teste de eye-tracking real? Se tiver orçamento pra rodar com 8-15 sujeitos, você ganha clareza que nenhuma intuição entrega.',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Cérebro recebe 11 milhões de bits/s, processa ~40. O sistema de atenção filtra brutalmente. Quem não chama atenção, não existe — antes da decisão, tem a percepção.',
        'Dois tipos de atenção: bottom-up (capturada pelo estímulo — cor, movimento, rosto) e top-down (dirigida pela intenção — quem procura ativamente seu produto). Estratégias diferentes.',
        'Inattentional blindness (gorila invisível): foco em uma tarefa torna OUTROS estímulos invisíveis. Banner blindness: cérebro aprende a filtrar zonas que historicamente trazem anúncio.',
        'Eye-tracking + heatmaps tornaram visível o invisível. Toda otimização séria de embalagem e site hoje passa por eye-tracking — não é mais opinião subjetiva.',
        'Atenção é recurso finito e disputado em mercado zero-sum. Sua marca compete com Netflix, ex, boleto e ansiedade do usuário. Subestimar essa concorrência é receita pra invisibilidade.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Aproximadamente quantos bits de informação por segundo entram no cérebro pelos sentidos, e quantos a consciência processa?',
      options: [
        '1 milhão entrando · 100 mil processados',
        '11 milhões entrando · ~40 processados',
        '500 mil entrando · 500 mil processados',
        '100 mil entrando · 1 milhão processados (cérebro infere mais que recebe)',
      ],
      correct: 1,
      explanation:
        '~11 milhões de bits/s entram pelos sentidos (visão domina com 10M, restante distribuído entre audição, tato, olfato, paladar). A consciência processa cerca de 40 bits/s — menos de 0,0004% do total. O resto é descartado, processado em paralelo no inconsciente ou comprimido. Esse gargalo é a razão de toda a economia da atenção: o gargalo é fixo, a oferta de estímulos cresce exponencialmente, então a competição por atenção fica cada vez mais brutal.',
      hint: 'O gargalo é dramático — pense em 4 ordens de magnitude.',
    },
    {
      question: 'No experimento do "gorila invisível" (Simons & Chabris, 1999), 50% dos participantes não viram um gorila atravessando a cena enquanto contavam passes de bola. Que fenômeno isso ilustra?',
      options: [
        'Daltonismo cognitivo',
        'Inattentional blindness — cegueira por desatenção. Foco em uma tarefa torna outros estímulos invisíveis mesmo quando estão em frente aos olhos',
        'Banner blindness',
        'Cocktail party effect',
      ],
      correct: 1,
      explanation:
        'É o caso clássico de inattentional blindness. Quando a atenção top-down está focada (contar passes do time branco), o cérebro filtra agressivamente o resto — incluindo estímulos visualmente óbvios como um gorila. Implicação pra marketing: público focado em outra coisa (assistindo vídeo, lendo notícia) NÃO vê seu anúncio, por mais óbvio que seja. Você precisa OU interromper com gatilho bottom-up forte OU estar alinhado com a intenção atual (top-down).',
      hint: 'O que aconteceu foi cegueira específica — não dos olhos, mas da atenção.',
    },
    {
      question: 'Em eye-tracking de anúncios com pessoas, qual elemento captura a PRIMEIRA fixação do olho na grande maioria dos casos?',
      options: [
        'O logo da marca no canto superior',
        'O preço em destaque',
        'O rosto (especialmente os olhos) da pessoa na imagem',
        'O CTA principal ("Compre agora")',
      ],
      correct: 2,
      explanation:
        'O cérebro humano tem uma região dedicada ao reconhecimento de rostos (fusiform face area, FFA). Eye-tracking mostra consistentemente que rostos são SEMPRE a primeira fixação em anúncios que os contêm. Não só isso: se os olhos da pessoa estão olhando pra um produto, o olho do espectador segue (gaze cueing). Por isso anúncios profissionais usam: closeup de rosto pra capturar olhar, pessoa olhando pro produto/CTA pra direcionar o olhar do espectador. Anúncio sem rosto perde poder de atrair primeira fixação.',
      hint: 'O cérebro tem hardware dedicado pra isso — é primitivo e poderoso.',
    },
    {
      question: 'Banner blindness é o fenômeno pelo qual:',
      options: [
        'Usuários idosos têm dificuldade visual com cores fortes',
        'Cérebro APRENDE a filtrar automaticamente regiões da tela onde tradicionalmente aparecem anúncios — mesmo que informação útil esteja ali',
        'Ad-blockers escondem banners',
        'Banners animados causam crise epilética em alguns usuários',
      ],
      correct: 1,
      explanation:
        'Jakob Nielsen documentou em 1997 (e replicou nas décadas seguintes) que usuários da web desenvolvem cegueira automática a zonas historicamente associadas a anúncios — topo e lateral direita, principalmente. O cérebro aprende padrões de irrelevância e otimiza filtrando ANTES da consciência olhar. Implicação prática: design de página tem zonas "queimadas" onde colocar informação importante = desperdício. Mover CTA pra fora dessas zonas pode aumentar conversão sem mudar copy.',
      hint: 'O cérebro aprende padrões — incluindo padrões de o que ignorar.',
    },
    {
      question: 'Você está desenhando uma embalagem nova de iogurte pra prateleira. O concorrente domina o mercado com embalagem azul-claro. Pela neurociência da atenção, qual estratégia tem maior chance de capturar atenção BOTTOM-UP?',
      options: [
        'Usar tons de azul-claro parecidos pra ganhar "guarda-chuva visual" do concorrente',
        'Embalagem em CONTRASTE — laranja vibrante ou roxo escuro, que SALTA no mar de azul-claro',
        'Embalagem branca minimalista pra parecer premium',
        'Embalagem com 4 cores diferentes pra agradar todos os perfis',
      ],
      correct: 1,
      explanation:
        'Atenção bottom-up é capturada por CONTRASTE — diferença em relação ao entorno. Se a prateleira está dominada por azul-claro, qualquer cor distante no espectro (laranja, vermelho, roxo) cria figura/fundo imediato e captura olhar em milissegundos via córtex visual primário. Copiar a cor do líder = se tornar parte do fundo (invisível). É por isso que challengers (Tinder vs Bumble, Apple vs IBM nos anos 80) frequentemente usam paletas opostas ao dominante. Princípio: "ser invisível por imitação é falha de neurociência básica".',
      hint: 'Bottom-up = diferença em relação ao contexto, não atributo absoluto.',
    },
    {
      question: 'A frase "atenção é zero-sum" (Herbert Simon, 1971) significa que:',
      options: [
        'Atenção pode ser estocada e usada depois',
        'Capacidade atencional do usuário é finita — pra você ganhar atenção, alguma outra coisa precisa perder. Sua marca compete com Netflix, ex, boleto e ansiedade',
        'Toda atenção é desperdício de energia',
        'Plataformas digitais criam atenção infinita via algoritmo',
      ],
      correct: 1,
      explanation:
        'Simon antecipou em 1971: "uma riqueza de informação cria uma pobreza de atenção". Capacidade consciente é fixa (~40 bits/s), mas a oferta de estímulos cresce sem parar. Resultado: atenção virou recurso ESCASSO disputado em mercado zero-sum. Sua marca não compete só com concorrentes diretos — compete com todo conteúdo, toda notificação, toda preocupação real do usuário. Subestimar essa concorrência sistêmica é o motivo de tantos anúncios "tecnicamente bons" serem ignorados.',
      hint: 'Zero-sum = o que um ganha, outro perde.',
    },
    {
      question: 'Em produto de ALTO envolvimento (carro, imóvel, MBA), qual abordagem de atenção é mais eficaz?',
      options: [
        'Foco 100% em bottom-up — barulho visual máximo',
        'Foco 100% em top-down — só atinge quem já está pesquisando',
        'Combinação: ATIVAR top-down via SEO/conteúdo (quem já procura) E sustentar atenção com narrativa emocional + dados pra que o usuário PERMANEÇA na página/processo decisório longo',
        'Ignorar atenção — alto envolvimento decide só por preço',
      ],
      correct: 2,
      explanation:
        'Em alto envolvimento, a primeira batalha é TOP-DOWN: o consumidor pesquisa ativamente — você precisa aparecer quando ele procura (SEO, contexto, palavra-chave). Mas conseguir o clique é só o começo: o ciclo decisório é longo (semanas a meses), então você precisa sustentar atenção com narrativa emocional (storytelling, depoimento, vídeo) E dar munição racional (planta, financiamento, garantia). Bottom-up barulhento aqui assusta — parece propaganda agressiva, baixa confiança. Combinação top-down + narrativa sustentada + apoio racional = jornada de alto envolvimento bem desenhada.',
      hint: 'Alto envolvimento = decisão longa, exige atenção CAPTURADA mas também SUSTENTADA.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────
// MOD 4 — Memória, Emoção e por que algumas marcas grudam
// ────────────────────────────────────────────────────────────────────────
export const MOD_4_MEMORIA: Module = {
  slug: 'memoria-emocao-marcas-grudam',
  num: 4,
  icon: '💗',
  title: 'Memória & Emoção — por que algumas marcas grudam',
  summary:
    'Você não lembra do que comeu no almoço de quarta-feira passada, mas lembra do jingle da Casas Bahia dos anos 90. Por quê? Memória sem emoção evapora. Memória com emoção GRUDA. Este módulo explica a neuroquímica disso e como marcas exploram pra construir presença mental duradoura.',
  estimatedMin: 20,
  keyTerms: [
    { term: 'Memória de Curto Prazo',  definition: 'Armazenamento temporário (segundos a minutos). Limitada a ~7±2 itens (Miller, 1956). Sem reforço, dissipa rápido.' },
    { term: 'Memória de Longo Prazo',  definition: 'Armazenamento durável (horas a décadas). Capacidade praticamente ilimitada. Requer consolidação — processo que envolve hipocampo e sono.' },
    { term: 'Memória Episódica',       definition: 'Lembrança de eventos específicos com contexto (quando, onde, com quem). Ex: o aniversário de 8 anos. Altamente emocional.' },
    { term: 'Memória Semântica',       definition: 'Conhecimento factual descontextualizado. Ex: "Brasília é a capital do Brasil". Menos emocional, mais lógica.' },
    { term: 'Hipocampo',               definition: 'Estrutura em formato de cavalo-marinho no lobo temporal. Crítica pra formação de novas memórias e consolidação durante o sono.' },
    { term: 'Amígdala',                definition: 'Estrutura em formato de amêndoa adjacente ao hipocampo. Processa emoções (medo, prazer) e MARCA memórias com intensidade emocional — o que aumenta a chance de consolidação.' },
    { term: 'Consolidação',            definition: 'Processo de transformar memória de curto prazo em longo prazo. Acontece principalmente durante sono REM e profundo. Requer dopamina e norepinefrina.' },
    { term: 'Brand Recall',            definition: 'Capacidade do consumidor de lembrar espontaneamente da marca quando pensa numa categoria. Ex: "refrigerante de cola" → "Coca-Cola". KPI clássico de marketing.' },
    { term: 'Brand Recognition',       definition: 'Capacidade de RECONHECER a marca quando vê (mais fácil que recall). Ex: ver o logo da Nike e identificar. Mede presença visual.' },
    { term: 'Top-of-mind',             definition: 'Primeira marca que vem à cabeça em uma categoria. Posição cobiçada — predispõe escolha automática em decisões S1.' },
    { term: 'Efeito Pico-Fim',         definition: 'Descoberto por Kahneman: pessoas lembram de uma experiência principalmente pelo MOMENTO MAIS INTENSO (pico) e pelo FINAL — não pela média. Crítico em UX e atendimento.' },
    { term: 'Mere Exposure',           definition: 'Robert Zajonc (1968): exposição repetida a um estímulo aumenta o gosto por ele, mesmo sem associação positiva. Base da repetição em mídia e jingles.' },
  ],
  sections: [
    {
      kind: 'intro',
      body:
        'Memória não é gravador — é reconstrução criativa, enviesada pela emoção. Você guarda eventos com peso emocional alto (primeiro beijo, demissão, nascimento de filho) com detalhes vívidos décadas depois. Eventos neutros (o que comeu na quarta) somem em horas. Marcas que dominam essa neuroquímica entram na memória de longo prazo e ficam por décadas — Coca-Cola, McDonald\'s, Bombril, Veja. Marcas que ignoram desaparecem mesmo gastando milhões. Este módulo explica como amígdala e hipocampo decidem o que lembra e como aplicar isso em marketing.',
    },
    {
      kind: 'concept',
      title: 'Os 3 estágios da memória',
      body:
        'Toda memória passa por 3 etapas. (1) Codificação — informação entra pelos sentidos, é processada no córtex e enviada pro hipocampo. Sem atenção (módulo 3), não há codificação. (2) Consolidação — durante horas e principalmente durante o SONO, o hipocampo "reescreve" a informação no córtex em estruturas duradouras. Processo dependente de dopamina, norepinefrina e ondas lentas do sono profundo. (3) Recuperação — quando você "lembra", o cérebro reconstrói a memória a partir de fragmentos. Cada recuperação MODIFICA a memória ligeiramente. Por isso testemunho ocular é tão pouco confiável.',
    },
    {
      kind: 'concept',
      title: 'O papel da amígdala — o "marcador" emocional',
      body:
        'A amígdala é uma estrutura pequena, adjacente ao hipocampo, dedicada a processar emoções (especialmente medo e recompensa). Quando algo emocionalmente intenso acontece, a amígdala libera neurotransmissores (norepinefrina) que INSTRUEM o hipocampo a tratar essa memória como prioridade alta — consolida mais rápido, com mais detalhes, e fica mais resistente ao esquecimento. É por isso que você lembra do 11 de setembro com detalhes do que estava fazendo no momento (flashbulb memory), mas não lembra de uma terça qualquer de 2018. Marketing entendeu isso: anúncio sem emoção = sem etiqueta de prioridade = esquecido em horas.',
    },
    {
      kind: 'callout',
      tone: 'highlight',
      title: 'Flashbulb memories — o caso do 11/09',
      body:
        'Brown & Kulik (1977) introduziram o conceito de "memória de flash": eventos de alto impacto emocional são lembrados com detalhes vívidos do CONTEXTO (onde você estava, com quem, o que vestia). Em estudos sobre o 11 de setembro de 2001, americanos lembraram com precisão muito maior do dia comparado a uma terça-feira normal de uma semana antes. A amígdala marcou o evento como "alta prioridade biológica" — e o hipocampo consolidou com vivacidade. Marca que quer presença mental de décadas precisa criar momentos emocionalmente densos, não apenas exposição.',
    },
    {
      kind: 'concept',
      title: 'Mere Exposure — o gosto da repetição',
      body:
        'Robert Zajonc (1968) descobriu algo contraintuitivo: pessoas começam a GOSTAR mais de estímulos só por terem sido expostos repetidamente — mesmo sem nenhuma associação positiva consciente. Mostrou rostos, palavras inventadas e ideogramas chineses a participantes. Quanto mais exposições, maior o gosto reportado. Mecanismo neural: repetição reduz custo cognitivo de processamento (cognitive ease, módulo 2), e o S1 confunde fluência com qualidade. É a base científica da mídia tradicional: você não precisa AMAR o anúncio de detergente, basta vê-lo 200 vezes pra começar a achar a marca "boa" sem saber por quê.',
    },
    {
      kind: 'example',
      title: 'Exemplo do dia a dia — o jingle que nunca sai',
      body:
        'Você ainda lembra de jingles dos anos 90-2000: "Tomou Doril, a dor sumiu" / "Bombril, Bombril, com mil e uma utilidades" / "Tic-tac é mentolzinho gostosinho". Provavelmente não tomou Doril essa semana, mas o jingle está intacto. Por quê? Combinação perfeita: REPETIÇÃO (mere exposure), MELODIA (música ativa áreas profundas de memória, distintas do texto), RIMA (cognitive ease — módulo 2), e em alguns casos, EMOÇÃO de infância (consolidação amplificada pela amígdala). Marcas que dominam jingle entram na memória de longo prazo e ficam décadas — gerando brand recall que dinheiro novo de propaganda raramente compra.',
      metadata: 'Jingles brasileiros · mere exposure + melodia + rima',
    },
    {
      kind: 'example',
      title: 'Exemplo lúdico — explicando pra uma criança',
      body:
        'Imagina que sua memória é uma estante gigante de gavetinhas. Toda noite enquanto você dorme, vem um cara chamado Sr. Hipocampo arrumar as coisas que aconteceram no dia. Ele tem um tempo curtinho. Olha pra cada coisa e decide: "isso aqui foi importante? Vou guardar na gaveta de cima, fácil de pegar." Ou: "isso foi blá, jogo no porão e ninguém nunca mais acha." Como ele decide o que é importante? Tem uma amiga dele, a Dra. Amígdala, que coloca uma etiqueta colorida em tudo que te fez SENTIR algo forte: felicidade no aniversário, medo no filme, raiva da briga, paixão pelo jogo novo. Tudo etiquetado vai pra gaveta de cima — fica lembrado pra sempre. Coisa sem etiqueta vai pro porão. É por isso que você lembra do aniversário do ano passado mas não do que comeu segunda-feira. Marcas espertas tentam fazer a Dra. Amígdala etiquetar elas — com música legal, com surpresa, com história bonita. Sem etiqueta emocional, a marca vai pro porão da memória e some.',
      metadata: 'Analogia infantil · Sr. Hipocampo + Dra. Amígdala = consolidação',
    },
    {
      kind: 'concept',
      title: 'Efeito Pico-Fim — como pessoas lembram experiências',
      body:
        'Kahneman descobriu que humanos NÃO lembram experiências pela média — lembram pelo MOMENTO MAIS INTENSO (pico) e pelo FINAL. Estudo clássico: pacientes em colonoscopia. Grupo A: procedimento de 8 minutos, dor moderada constante, termina abruptamente. Grupo B: 12 minutos, mesma dor + 4 minutos finais com dor MENOR. Logicamente, o grupo B sofreu MAIS no total. Mas reportaram a experiência como MENOS dolorosa. Por quê? O fim foi melhor (pico menos intenso no final). Aplicações: restaurante que faz "última surpresa do chef" gratuita gera lembrança melhor. App que termina sessão com micro-celebração (XP, badge) é lembrado melhor. Atendimento ao cliente: a última frase do call importa mais que todo o resto.',
    },
    {
      kind: 'concept',
      title: 'Brand recall vs recognition — duas memórias diferentes',
      body:
        'São dois KPIs distintos. RECALL espontâneo: "cite 3 marcas de refrigerante" — quem vem primeiro? Top-of-mind. Requer memória episódica forte e ativação semântica robusta — difícil de conquistar, ouro quando conquistado. RECOGNITION: você reconhece a marca quando vê (logo, embalagem, cor). Mais fácil de construir, mais baseado em exposição visual. A diferença prática: top-of-mind decide categorias amplas (quando alguém pensa "refrigerante", já vai na Coca). Recognition decide na frente da prateleira (entre 10 marcas, escolhe a familiar). Marketing maduro mede e otimiza os dois.',
    },
    {
      kind: 'table',
      caption: 'Memória episódica vs semântica — comparativo',
      headers: ['Característica', 'Episódica', 'Semântica'],
      rows: [
        ['Tipo',                  'Eventos com contexto',         'Conhecimento factual'],
        ['Exemplo',               'Meu aniversário de 10 anos',   'Capital do Brasil = Brasília'],
        ['Carga emocional',       'Alta — alimentada pela amígdala', 'Baixa — neutra'],
        ['Duração',               'Anos a décadas',               'Estável se usado'],
        ['Estrutura cerebral',    'Hipocampo + córtex temporal',  'Córtex temporal + frontal'],
        ['Marketing alavanca',    'Experiências, storytelling',   'Informação clara, repetida'],
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      title: 'Por que rebranding mal feito DESTRÓI valor',
      body:
        'Quando uma marca muda logo, cor ou identidade visual sem aviso, ela QUEBRA o brand recognition acumulado por décadas. O cérebro perde o atalho de identificação rápida (S1) e precisa reaprender via S2 — processo lento, custoso e que muitos consumidores simplesmente não fazem. Casos clássicos de fracasso: Gap (2010, voltou em 6 dias), Tropicana (2009, perdeu 20% de vendas em 2 meses). Lição neurocientífica: brand equity está em padrões visuais consolidados na memória de longo prazo — mexer nisso é apagar décadas de mere exposure. Faça evolução gradual ("face-lift"), nunca disrupção total.',
    },
    {
      kind: 'concept',
      title: 'Aplicação prática — como gravar marca na memória',
      body:
        'Checklist neurocientífico pra construir memória de marca. (1) Crie EMOÇÃO sincera — alegria, surpresa, comoção, nostalgia. Sem emoção, a amígdala não etiqueta, e o hipocampo descarta. (2) Use REPETIÇÃO estratégica — mere exposure funciona, mas só se o ativo visual/sonoro for consistente (mude o logo e zera o efeito). (3) Aposte em MELODIA quando possível — música ativa áreas profundas distintas da semântica verbal e dura mais. (4) Capriche no FINAL de cada touchpoint — efeito pico-fim. Última frase do atendimento, último frame do comercial, última tela do checkout: ponto de alavancagem. (5) Mensure separadamente RECALL e RECOGNITION — são memórias diferentes com táticas diferentes.',
    },
    {
      kind: 'summary',
      title: 'O que levar embora',
      bullets: [
        'Memória passa por codificação → consolidação (durante sono, via hipocampo) → recuperação. Sem emoção, a amígdala não marca prioridade, e o conteúdo se perde.',
        'Flashbulb memories: eventos emocionalmente intensos viram lembranças vivas por décadas. Marcas que criam momentos densos (não só exposição) ganham presença mental durável.',
        'Mere Exposure (Zajonc, 1968): exposição repetida aumenta o gosto, mesmo sem associação positiva. Base científica da repetição em mídia e jingles. Funciona — se o ativo for consistente.',
        'Efeito Pico-Fim (Kahneman): pessoas lembram experiências pelo momento mais intenso e pelo final, não pela média. Otimize o último touchpoint de qualquer jornada.',
        'Brand recall (top-of-mind espontâneo) e recognition (identificação ao ver) são memórias diferentes. Marketing maduro mede e otimiza os dois separadamente.',
      ],
    },
  ],
  quiz: [
    {
      question: 'Qual estrutura cerebral é a principal responsável por "etiquetar" emoções em memórias, fazendo com que eventos emocionalmente intensos sejam lembrados com mais vivacidade?',
      options: [
        'Cerebelo',
        'Amígdala — adjacente ao hipocampo, libera norepinefrina que prioriza consolidação',
        'Lobo occipital',
        'Glândula pineal',
      ],
      correct: 1,
      explanation:
        'A amígdala processa emoções (medo, prazer, surpresa) e ao detectar intensidade emocional libera neurotransmissores (especialmente norepinefrina) que instruem o hipocampo a tratar aquela memória como prioritária — consolidando mais rápido e com mais detalhes. É o motivo de "flashbulb memories" existirem (lembrança vívida do 11/09, do dia da demissão, do primeiro beijo). Marketing eficaz precisa ativar emoção sincera pra que a amígdala marque a marca como memorável.',
      hint: 'Estrutura em forma de amêndoa especializada em emoções.',
    },
    {
      question: 'Robert Zajonc (1968) descobriu o efeito "mere exposure". Em que ele consiste?',
      options: [
        'Pessoas evitam estímulos vistos muitas vezes (efeito tédio)',
        'Exposição repetida a um estímulo AUMENTA o gosto por ele, mesmo sem associação positiva consciente',
        'Pessoas só lembram do primeiro estímulo de uma sequência',
        'Repetição reduz a confiança na fonte',
      ],
      correct: 1,
      explanation:
        'Zajonc mostrou que repetição pura aumenta preferência — mesmo sem nenhum significado positivo associado. Funcionou com rostos, palavras inventadas, ideogramas chineses. Mecanismo neural: repetição reduz custo de processamento (cognitive ease), e o S1 confunde fluência com qualidade. É a base científica da mídia tradicional: você não precisa AMAR o jingle, basta ouvi-lo 200 vezes pra começar a achar a marca "boa". Funciona — desde que o ativo (logo, cor, melodia) seja consistente.',
      hint: 'Familiaridade vira preferência. Estranheza vira desconfiança.',
    },
    {
      question: 'O Efeito Pico-Fim de Kahneman, aplicado a UX/atendimento, sugere que:',
      options: [
        'A média da experiência determina a memória',
        'Pessoas lembram experiências principalmente pelo MOMENTO MAIS INTENSO (pico) e pelo FINAL — então otimizar o final tem alavancagem desproporcional',
        'O começo da experiência determina tudo',
        'Memória é proporcional ao tempo total da experiência',
      ],
      correct: 1,
      explanation:
        'Kahneman demonstrou que humanos não lembram pela média de uma experiência, mas pelo pico (momento mais intenso) e pelo final. Estudo clássico da colonoscopia mostrou que pacientes que sofreram MAIS no total mas tiveram fim menos doloroso reportaram lembrança melhor. Aplicações: terminar atendimento com frase memorável, fechar checkout com micro-celebração, terminar curso com cerimônia. O último touchpoint vale desproporcionalmente. Pequeno detalhe no final compensa muito esforço no meio.',
      hint: 'Pico + fim > média. Onde investir, então?',
    },
    {
      question: 'Por que jingles dos anos 90 (Doril, Bombril, Tic-tac) continuam vívidos décadas depois na memória do brasileiro adulto?',
      options: [
        'Eram tecnicamente mais bem produzidos que jingles atuais',
        'Combinação: REPETIÇÃO massiva (mere exposure) + MELODIA (música ativa áreas profundas distintas do texto) + RIMA (cognitive ease) + EMOÇÃO de contexto infantil (consolidação amplificada pela amígdala)',
        'TV daquela época tinha audiência maior',
        'O cérebro adulto perdeu a capacidade de formar memórias novas',
      ],
      correct: 1,
      explanation:
        'É combinação multifatorial neurocientífica. Repetição (mere exposure) constrói familiaridade. Melodia ativa áreas profundas da memória (núcleos basais, áreas auditivas) distintas das áreas semânticas verbais — duas trilhas paralelas reforçam consolidação. Rima gera cognitive ease (S1 aceita como verdadeiro). Contexto emocional de infância amplifica via amígdala. Tudo isso junto = memória resistente a décadas. Jingles modernos raramente combinam todos esses fatores, daí a saudade nostálgica do "tomou Doril".',
      hint: 'É mais que repetição — é múltiplos mecanismos atuando juntos.',
    },
    {
      question: 'Brand recall espontâneo e brand recognition são duas memórias diferentes. Qual a diferença prática?',
      options: [
        'São sinônimos — o mercado usa indistintamente',
        'Recall: lembra espontaneamente quando pensa na categoria (top-of-mind). Recognition: identifica a marca quando vê. Recall é mais raro/valioso; recognition é mais comum/visual',
        'Recall é só pra produtos premium; recognition é só pra commodities',
        'Recall é medido em pesquisa qualitativa; recognition em quantitativa',
      ],
      correct: 1,
      explanation:
        'Recall espontâneo = "cite 3 marcas de refrigerante" → o que vem primeiro é top-of-mind. Requer memória episódica forte e ativação semântica robusta. É difícil conquistar mas valiosíssimo: predispõe escolha automática (S1) quando alguém pensa na categoria. Recognition = "qual desses logos você reconhece?" → mais fácil, baseado em exposição visual. Os dois requerem táticas diferentes: recall depende de storytelling, awareness ampla, top-of-mind; recognition depende de consistência visual e exposição em pontos de venda. Marketing maduro mede separadamente.',
      hint: 'Lembrar do nome vs reconhecer ao ver — são processos cognitivos distintos.',
    },
    {
      question: 'Casos como o rebranding do Gap (2010, revertido em 6 dias) e Tropicana (2009, queda de 20% em vendas) ilustram que:',
      options: [
        'Rebranding sempre é positivo se for moderno',
        'Mudanças visuais bruscas QUEBRAM o brand recognition consolidado por anos no S1 dos consumidores, exigindo reaprendizado custoso pelo S2 que muitos consumidores simplesmente não fazem',
        'Consumidores são resistentes a mudança por preguiça',
        'Designers gráficos não entendem mercado',
      ],
      correct: 1,
      explanation:
        'Brand equity vive em padrões visuais consolidados na memória de longo prazo via mere exposure repetida. Mudar logo/cor/identidade abruptamente APAGA o atalho de identificação S1 que levou décadas pra construir. O consumidor precisa reaprender via S2 — processo custoso que muitos evitam (escolhem outra marca ou param de comprar). Lição: brand equity é ativo neurocientífico de longo prazo. Evoluções graduais ("face-lift") preservam recognition acumulado. Disrupções totais são destruição de capital intangível raramente recuperável.',
      hint: 'O cérebro investiu décadas memorizando aquele logo — o que acontece quando ele some?',
    },
    {
      question: 'Você está desenhando uma campanha de lançamento de uma nova marca. Quer maximizar a chance de a marca entrar na memória de longo prazo. Que princípios neurocientíficos combinar?',
      options: [
        'Foco apenas em mídia paga massiva',
        'Combinação: emoção sincera (amígdala marca como prioridade) + repetição com ATIVOS VISUAIS/SONOROS CONSISTENTES (mere exposure) + momentos densos pico-fim em touchpoints + storytelling pra consolidar memória episódica',
        'Spam de redes sociais com posts diários genéricos',
        'Apenas conteúdo educacional puramente racional',
      ],
      correct: 1,
      explanation:
        'Memória de longo prazo se constrói pela combinação. Emoção sincera dispara amígdala → prioridade de consolidação. Repetição com ativos visuais E sonoros CONSISTENTES (logo, cor, jingle, tom de voz) explora mere exposure — mas só funciona se for o MESMO ativo (mudar a cada campanha zera). Pico-fim otimizado em cada touchpoint cria lembranças marcantes. Storytelling consolida memória episódica (mais durável que semântica fria). Marketing puramente racional não engaja amígdala, então some em horas, por mais correto que seja tecnicamente.',
      hint: 'Memória de longo prazo = emoção + repetição + consistência + storytelling.',
    },
  ],
};
