// Simulado de Neuromarketing — 100 questões cobrindo os 8 módulos da trilha.
// Distribuição: ~25 questões por hub (4 hubs × 25). Mix de dificuldade:
// ~25 easy, ~50 medium, ~25 hard. Sem timer; nota mínima 70%.
//
// Fonte primária: os 8 módulos em neuromarketing-modules-{1,2}.ts +
// referências acadêmicas (Kahneman, Cialdini, Schultz, Berridge, Knutson,
// Iyengar, Damásio, Nielsen, Simons & Chabris, Thaler, MacLean).
//
// PADRÃO FFV: todo hub gerado deve ter um simulado de ~100 questões.
// Documentação completa em docs/PIPELINE_GERACAO_CONTEUDO.md §12.

export interface SimuladoQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Dica opcional — aponta o conceito sem entregar a resposta. */
  hint?: string;
}

export const SIMULADO_NEUROMARKETING: SimuladoQuestion[] = [
  // ════════════════════════════════════════════════════════════════════
  // HUB 1 — CÉREBRO & COMPORTAMENTO (q001-q025)
  // ════════════════════════════════════════════════════════════════════
  // ─── Triuno (q001-q012) ──────────────────────────────────────────────
  {
    id: 'q001',
    question: 'Qual neurocientista propôs nos anos 1960 o modelo triuno do cérebro (reptiliano, límbico e neocórtex)?',
    options: ['Paul MacLean', 'Daniel Kahneman', 'Antonio Damásio', 'Robert Cialdini'],
    correct: 0,
    explanation:
      'Paul MacLean propôs o modelo nos anos 1960 dividindo o cérebro em 3 camadas evolutivas. Kahneman é dos Sistemas 1/2 (anos 2000). Damásio descreveu o papel da emoção na decisão (anos 1990). Cialdini é dos 6 princípios de persuasão (1984).',
    hint: 'Modelo dos anos 1960, ainda referenciado em quase todo curso introdutório de neuromarketing.',
    topic: 'Cérebro Triuno',
    difficulty: 'easy',
  },
  {
    id: 'q002',
    question: 'Qual a função primária do cérebro reptiliano segundo o modelo triuno?',
    options: [
      'Linguagem e raciocínio lógico',
      'Sobrevivência, instinto, território e luta-ou-fuga',
      'Emoção e memória afetiva',
      'Justificativa racional de decisões',
    ],
    correct: 1,
    explanation:
      'O reptiliano (tronco encefálico + cerebelo + gânglios da base) cuida de respiração, batimento, instinto, território e luta-ou-fuga. Linguagem/lógica = neocórtex. Emoção = sistema límbico. Justificativa racional = neocórtex.',
    topic: 'Cérebro Triuno',
    difficulty: 'easy',
  },
  {
    id: 'q003',
    question: 'No modelo triuno, em qual ordem evolutiva surgiram as três camadas (mais antiga → mais nova)?',
    options: [
      'Neocórtex → límbico → reptiliano',
      'Reptiliano → neocórtex → límbico',
      'Reptiliano → límbico → neocórtex',
      'Límbico → reptiliano → neocórtex',
    ],
    correct: 2,
    explanation:
      'A ordem é reptiliano (~300 milhões de anos) → límbico (~200 milhões, com primeiros mamíferos) → neocórtex (~2-3 milhões, em mamíferos superiores e especialmente humanos). É também a ordem de RESPOSTA: instinto chega primeiro, depois emoção, por último razão.',
    hint: 'Pense em quem apareceu primeiro: lagartos têm qual cérebro? E mamíferos?',
    topic: 'Cérebro Triuno',
    difficulty: 'medium',
  },
  {
    id: 'q004',
    question: 'A amígdala faz parte de qual estrutura do modelo triuno e qual sua função central?',
    options: [
      'Reptiliano — controle respiratório',
      'Sistema límbico — detecção de ameaça e processamento emocional rápido',
      'Neocórtex — processamento de linguagem',
      'Cerebelo — coordenação motora',
    ],
    correct: 1,
    explanation:
      'Amígdala é parte do sistema límbico (camada emocional). Em formato de amêndoa, detecta ameaça em milissegundos e dispara respostas emocionais (medo, alerta) antes do consciente acordar. É chave em marcas que usam medo de perda, urgência ou recompensa eminente.',
    topic: 'Cérebro Triuno',
    difficulty: 'medium',
  },
  {
    id: 'q005',
    question: 'Antonio Damásio, em estudos com pacientes com lesão no córtex pré-frontal ventromedial, demonstrou que:',
    options: [
      'Pessoas sem acesso emocional fazem decisões MAIS racionais e otimizadas',
      'Pessoas sem acesso emocional ficam INCAPAZES de decidir — ficam presas em análise infinita de prós e contras',
      'Lesão pré-frontal não afeta capacidade de decisão',
      'A racionalidade é independente da emoção em humanos saudáveis',
    ],
    correct: 1,
    explanation:
      'Damásio mostrou que sem o canal emoção-razão (lesão no córtex pré-frontal ventromedial), pacientes conseguem listar prós e contras racionalmente mas não conseguem ESCOLHER — ficam em paralisia analítica. Conclusão: toda decisão humana, em última instância, é emocional — depois racionalizada.',
    hint: 'O resultado foi contraintuitivo: tirou emoção e a pessoa ficou pior pra decidir, não melhor.',
    topic: 'Cérebro Triuno',
    difficulty: 'hard',
  },
  {
    id: 'q006',
    question: 'A descoberta de Read Montague (2004) sobre Coca-Cola vs Pepsi mostrou que:',
    options: [
      'Pepsi vence em sabor cego E na escolha de mercado',
      'Coca-Cola vence em sabor cego E na escolha de mercado',
      'Em testes cegos a Pepsi vence em sabor — mas no mercado a Coca domina porque a marca ativa hipocampo e córtex pré-frontal dorsolateral (memória cultural e identidade)',
      'O sabor não influencia preferência em refrigerantes',
    ],
    correct: 2,
    explanation:
      'Montague mostrou via fMRI que em teste cego o cérebro responde ao SABOR (córtex pré-frontal ventromedial, e a Pepsi vence). Quando a marca Coca aparece, ATIVAM TAMBÉM hipocampo (memória) e córtex pré-frontal dorsolateral (identidade cultural). Esse "valor de marca" emocional supera o sabor objetivo. É a base neurocientífica do brand equity.',
    topic: 'Cérebro Triuno',
    difficulty: 'hard',
  },
  {
    id: 'q007',
    question: 'A frase "compre com a emoção, justifique com a razão" descreve qual processo neurocientífico?',
    options: [
      'Operação simultânea e equilibrada dos 3 cérebros',
      'Decisão tomada pelo sistema límbico, depois racionalizada (post-hoc) pelo neocórtex pra criar narrativa coerente',
      'Erro cognitivo que só ocorre em compradores ingênuos',
      'Falha temporária do córtex pré-frontal',
    ],
    correct: 1,
    explanation:
      'É racionalização clássica: a decisão emocional acontece primeiro (límbico), e o neocórtex constrói depois uma narrativa lógica pra justificar a escolha — pra família, amigos e pra si mesmo (auto-conceito de "eu sou racional"). Esse pattern é universal em humanos, documentado por Damásio, Kahneman e outros.',
    topic: 'Cérebro Triuno',
    difficulty: 'medium',
  },
  {
    id: 'q008',
    question: 'Marketing sensorial (cheiro de pão na padaria, vermelho do McDonald\'s, jingles repetitivos) tem qual objetivo neuroquímico primário?',
    options: [
      'Sobrecarregar o neocórtex pra confundir análise racional',
      'Ativar o sistema límbico ANTES que o neocórtex pense — disparar emoção e memória afetiva pré-conscientes',
      'Estimular o cerebelo pra acelerar reação motora',
      'Cansar o tálamo e diminuir vigilância',
    ],
    correct: 1,
    explanation:
      'Marketing sensorial conversa direto com o sistema límbico (amígdala + hipocampo). Cheiros, cores e sons disparam memória emocional em milissegundos — muito antes do neocórtex analisar. O cheiro de pão fresco ativa nostalgia. O vermelho do McDonald\'s acelera fome. Jingles instalam-se na memória de longo prazo via repetição emocional. Decisão pré-consciente.',
    topic: 'Cérebro Triuno',
    difficulty: 'medium',
  },
  {
    id: 'q009',
    question: 'A neurociência moderna considera o modelo triuno de MacLean como:',
    options: [
      'Cientificamente preciso em todos os aspectos anatômicos',
      'Completamente falso e sem qualquer valor pedagógico',
      'Metáfora útil pra ensino e marketing prático, mas simplificação excessiva da anatomia real (cérebro opera em redes integradas, não em camadas isoladas)',
      'A única teoria aceita sobre evolução cerebral humana',
    ],
    correct: 2,
    explanation:
      'O triuno é útil como mapa mental pedagógico (torna visível a sequência instinto→emoção→razão), mas neurocientificamente impreciso. Imagens modernas mostram redes neurais integradas (default mode, salience, executive) com áreas das três "camadas" trabalhando juntas. Use como ferramenta de análise, sabendo das limitações.',
    topic: 'Cérebro Triuno',
    difficulty: 'medium',
  },
  {
    id: 'q010',
    question: 'Você está criando um anúncio pra um curso online. Aplicando o checklist triuno, qual elemento ativaria PRIMEIRAMENTE o cérebro reptiliano?',
    options: [
      'Lista detalhada de 23 módulos do curso',
      'Tabela comparativa com 5 concorrentes',
      'Manchete em contraste forte com cronômetro de urgência: "ÚLTIMAS 3 VAGAS · ENCERRA EM 2H"',
      'Depoimento longo em vídeo de 12 minutos',
    ],
    correct: 2,
    explanation:
      'Contraste visual + urgência + escassez = combo de gatilhos reptilianos. Ativa atenção em milissegundos via amígdala (detecção de risco/oportunidade). Lista de módulos, comparativos e depoimentos longos são munição pro neocórtex — funcionam SÓ DEPOIS que o anúncio capturou atenção reptiliana.',
    topic: 'Cérebro Triuno',
    difficulty: 'medium',
  },
  {
    id: 'q011',
    question: '"Flashbulb memories" (memórias de flash, como lembrar exatamente onde estava no 11/09 de 2001) são consolidadas com mais vivacidade porque:',
    options: [
      'O cerebelo armazena eventos importantes em alta resolução',
      'A amígdala, ao detectar carga emocional intensa, libera norepinefrina que prioriza a consolidação dessas memórias no hipocampo',
      'O neocórtex prepara backups extras',
      'Apenas em pessoas com inteligência acima da média',
    ],
    correct: 1,
    explanation:
      'Brown & Kulik (1977) introduziram o conceito. Mecanismo: amígdala detecta intensidade emocional → libera norepinefrina → instrui hipocampo a tratar como prioridade alta. Resultado: consolidação rápida com muitos detalhes do CONTEXTO. Implicação pra marketing: marcas que criam momentos densos (não apenas exposição) ganham memória durável de décadas.',
    topic: 'Cérebro Triuno',
    difficulty: 'hard',
  },
  {
    id: 'q012',
    question: 'Anúncios que SÓ apresentam specs técnicas (megapixels, GHz, anos de garantia, % de juros) sem ativar emoção tendem a fracassar porque:',
    options: [
      'Especificações técnicas são sempre inválidas',
      'Falam apenas com o neocórtex, que sem entrada emocional do límbico fica em paralisia analítica (Damásio) e não dispara decisão de compra',
      'Pessoas hoje só compram por preço',
      'O cerebelo bloqueia anúncios sem música',
    ],
    correct: 1,
    explanation:
      'Damásio mostrou que sem entrada emocional, o cérebro fica em loop analítico sem decidir. Specs técnicas só conversam com o neocórtex — e o neocórtex sozinho não toma decisão de compra em 95-98% das situações (Kahneman). Anúncios eficazes ativam emoção (límbico) PRIMEIRO, depois fornecem munição racional pro neocórtex.',
    topic: 'Cérebro Triuno',
    difficulty: 'hard',
  },

  // ─── Sistema 1 e 2 — Kahneman (q013-q025) ──────────────────────────
  {
    id: 'q013',
    question: 'Daniel Kahneman ganhou o Prêmio Nobel de Economia em 2002 por desenvolver, junto com Amos Tversky:',
    options: [
      'A Teoria Geral do Equilíbrio',
      'A Teoria do Prospecto e demonstrar que humanos não são econômicos racionais',
      'A Teoria dos Jogos',
      'A Hipótese dos Mercados Eficientes',
    ],
    correct: 1,
    explanation:
      'Kahneman ganhou o Nobel em 2002 pela Teoria do Prospecto (com Tversky, 1979) e por demonstrar empiricamente que humanos sistematicamente desviam do "homo economicus" racional clássico. Foi o único não-economista a receber o Nobel de Economia. Tversky morreu em 1996 e não pôde dividir o prêmio.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'easy',
  },
  {
    id: 'q014',
    question: 'No modelo de Kahneman, o Sistema 1 caracteriza-se por:',
    options: [
      'Pensamento lento, deliberado e custoso em energia',
      'Pensamento rápido, automático, intuitivo e sempre ligado',
      'Análise lógica de planilhas',
      'Resolução de cálculos complexos',
    ],
    correct: 1,
    explanation:
      'Sistema 1 é rápido (milissegundos), automático, intuitivo, emocional e SEMPRE LIGADO. Reconhece rostos, lê palavras, sente medo antes de identificar a cobra. Toma 95-98% das decisões diárias. O Sistema 2 é o lento, analítico, deliberado e custoso.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'easy',
  },
  {
    id: 'q015',
    question: 'Aproximadamente que percentual das decisões diárias é atribuído ao Sistema 1?',
    options: ['20-30%', '50%', '95-98%', '70%'],
    correct: 2,
    explanation:
      'Estimativas de Kahneman e pesquisas posteriores (Bargh, Damásio) convergem em 95-98% das decisões diárias sendo do S1. O S2 só ativa em decisões raras de alto envolvimento (imóvel, carro, faculdade) — e mesmo nessas, frequentemente só CONFIRMA o que o S1 já decidiu emocionalmente.',
    hint: 'O S2 gasta muita glicose. O cérebro evolui evitando esforço.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },
  {
    id: 'q016',
    question: '"Cognitive ease" é o princípio descoberto por Kahneman segundo o qual:',
    options: [
      'Quanto mais difícil processar uma informação, mais o cérebro acredita nela',
      'Quanto mais FÁCIL o cérebro processa uma informação, mais o Sistema 1 a aceita como VERDADEIRA — sem ativar o Sistema 2 cético',
      'Fontes em itálico são lidas mais rapidamente',
      'Decisões em jejum são mais precisas',
    ],
    correct: 1,
    explanation:
      'Cognitive ease: facilidade de processamento ativa o S1 num modo confiante e relaxado, sem ativar o S2 crítico. Por isso slogans rimam, anúncios repetem a marca, fontes legíveis vendem mais. Tudo que dificulta o processamento ATIVA o S2 cético — daí desconfiança de design ruim.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },
  {
    id: 'q017',
    question: 'O experimento de McGlone & Tofighbakhsh (2000) mostrou que aforismos com RIMA são julgados como mais verdadeiros que versões equivalentes sem rima. Que princípio explica isso?',
    options: [
      'Aversão à perda',
      'Cognitive ease — fluência fonética da rima é confundida pelo S1 com plausibilidade',
      'Heurística da disponibilidade',
      'Efeito Stroop',
    ],
    correct: 1,
    explanation:
      'Cognitive ease em ação: rima gera fluência fonética, e o S1 lê fluência como "isso flui, deve fazer sentido". Por isso slogans rimam ("Wash and go", "Doutor Oetker") — não é estética, é design intencional pra desligar ceticismo do S2.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },
  {
    id: 'q018',
    question: 'Pela Teoria do Prospecto (Kahneman & Tversky, 1979), a dor psicológica de PERDER R$ 100 é aproximadamente:',
    options: [
      'Igual ao prazer de ganhar R$ 100 (simétrica)',
      'Cerca de 2x maior que o prazer de ganhar R$ 100 (aversão à perda)',
      'Cerca de 10x maior',
      'Cerca da metade — pessoas valorizam pouco perdas',
    ],
    correct: 1,
    explanation:
      'Aversão à perda: a dor de perder é ~2x maior que o prazer de ganhar o mesmo valor. Documentado em fMRI: amígdala responde mais intensamente a perdas que núcleo accumbens responde a ganhos. Implicação prática direta: campanhas com framing de PERDA performam melhor que framing de GANHO ("você está perdendo X" > "venha ganhar X").',
    hint: 'O número é menor que você imagina mas significativamente maior que 1.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },
  {
    id: 'q019',
    question: 'Em produto de BAIXO envolvimento (chiclete, refrigerante, app gratuito), o marketing deveria priorizar:',
    options: [
      'Tabela comparativa de specs vs concorrentes',
      'Cor, embalagem, familiaridade, distribuição — comunicação do S1',
      'Vídeo longo explicando ROI',
      'Lista detalhada de prós e contras',
    ],
    correct: 1,
    explanation:
      'Baixo envolvimento = compra rotineira, baixo custo, baixo risco. O consumidor decide 100% em S1, em segundos, sem ativar S2. Cor, embalagem, familiaridade, gatilhos sensoriais e distribuição são o que vende. Specs são desperdício de espaço — ninguém para pra ler tabela comparativa antes de comprar chiclete.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },
  {
    id: 'q020',
    question: 'Decision fatigue (fadiga de decisão) descreve qual fenômeno?',
    options: [
      'O Sistema 1 acelera após muitas decisões',
      'Após decisões consecutivas, o Sistema 2 esgota glicose e o cérebro recua pro S1 mesmo em decisões importantes',
      'Apenas pessoas com TDAH sofrem o efeito',
      'É mito popular sem evidência neurocientífica',
    ],
    correct: 1,
    explanation:
      'Decision fatigue (Baumeister, Vohs, Tice) é bem documentada. O S2 gasta glicose; após sessões longas de decisão, entra em fadiga metabólica e o cérebro RECUA pro S1 (intuitivo, heurístico). Por isso pessoas no fim de longa sessão de compras tendem a fechar pela marca conhecida — não pela análise mais correta. Aplicação: jamais peça decisão complexa ao final de jornada longa.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },
  {
    id: 'q021',
    question: 'Você cria duas versões de anúncio para curso de inglês. Versão A: "Aprenda inglês e ganhe R$ 5.000 a mais por mês". Versão B: "Você está PERDENDO R$ 5.000 por mês por NÃO saber inglês". Pela Teoria do Prospecto:',
    options: [
      'Versão A converte mais — ganho é mais atraente que perda',
      'Versão B tende a converter mais — perda dói ~2x mais que ganho equivalente, ativando amígdala com mais intensidade',
      'Ambas convertem igualmente — é só semântica',
      'Versão A converte mais porque pessoas evitam pensamentos negativos',
    ],
    correct: 1,
    explanation:
      'Framing de PERDA ativa o sistema de detecção de ameaça (amígdala) com mais intensidade que ganho ativa o sistema de recompensa. Por isso campanhas de "evite perder" tendem a converter melhor que "venha ganhar" — em contextos como saúde, dinheiro e tempo. Não é manipulação: é alinhar mensagem com a forma como cérebro REAL pesa ganho vs perda.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },
  {
    id: 'q022',
    question: 'Por que campanhas focadas APENAS em "educar o consumidor" com argumentos racionais frequentemente têm ROI baixo no mercado de massa?',
    options: [
      'Consumidores não querem aprender',
      'Conversam apenas com S2 (inativo em 95-98% das decisões); sem ativar S1 emocionalmente primeiro, o S2 nem entra em cena',
      'Texto é menos efetivo que imagem',
      'A maioria das pessoas é analfabeta funcional',
    ],
    correct: 1,
    explanation:
      'Campanhas só-racionais falam exclusivamente com o S2 — que está desligado na maioria das decisões. Sem ativação do S1 (emoção, desejo, atenção visual), o anúncio é tecnicamente correto mas neurocientificamente invisível. Sequência funcional: S1 PRIMEIRO (capta atenção + gera desejo emocional), DEPOIS o S2 entra com munição racional pra autorizar a compra.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'hard',
  },
  {
    id: 'q023',
    question: 'Aplicando S1/S2 a anúncio de PLANO DE SAÚDE familiar (alto envolvimento), qual abordagem é mais alinhada à neurociência?',
    options: [
      'Apenas tabela de cobertura, preço e rede credenciada — puro S2',
      'Apenas imagem emocional de família feliz, sem nenhum dado — puro S1',
      'Combinação: narrativa emocional de proteção familiar (S1) + tabela clara de cobertura, rede e preço (S2) — desejo primeiro, munição racional depois',
      'Foco em prêmios da marca e história centenária da empresa',
    ],
    correct: 2,
    explanation:
      'Alto envolvimento (custo alto, decisão de longo prazo, peso emocional) precisa dos dois sistemas na ordem certa. S1 ativa desejo (proteção, segurança, paz mental). Depois S2 recebe munição racional pra autorizar (cobertura, rede, preço). Sem S1, S2 paralisa em comparativos. Sem S2, cônjuge questiona "mas e o preço?" e venda trava.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'hard',
  },
  {
    id: 'q024',
    question: 'O caso clássico do "consumidor racional" da economia neoclássica (que sempre maximiza utilidade calculando prós e contras) é considerado hoje:',
    options: [
      'Confirmado por dados empíricos da neurociência',
      'Falso na prática humana — pesquisa empírica (Kahneman, Tversky, Damásio) mostra que humanos são sistematicamente vieses-dependentes, não racionais',
      'Verdadeiro apenas para mulheres',
      'Verdadeiro apenas em situações de baixo estresse',
    ],
    correct: 1,
    explanation:
      'A revolução da economia comportamental (que rendeu o Nobel a Kahneman em 2002, Thaler em 2017) demonstrou empiricamente que humanos desviam SISTEMATICAMENTE do modelo racional clássico. Heurísticas, vieses, framing, ancoragem — tudo influencia decisões mesmo quando "deveria" ser racional. O homo economicus é ficção útil pra modelos, não descrição da realidade.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'hard',
  },
  {
    id: 'q025',
    question: 'O livro "Pensar Rápido e Devagar" (Kahneman, 2011) é considerado base teórica do neuromarketing moderno porque:',
    options: [
      'Define receitas de anúncios eficazes passo a passo',
      'Compila 4 décadas de pesquisa em decisão humana — sistemas 1/2, vieses, heurísticas, aversão à perda, framing — fornecendo o vocabulário conceitual usado em quase toda análise séria de comportamento de consumo',
      'É o único livro autorizado pela Anthropic',
      'Foi escrito por uma agência de marketing',
    ],
    correct: 1,
    explanation:
      'Pensar Rápido e Devagar (2011) compila 4+ décadas da pesquisa Kahneman/Tversky em decisão humana. Trouxe pro mainstream conceitos como Sistemas 1/2, ancoragem, framing, aversão à perda, heurística da disponibilidade. Toda análise séria de comportamento do consumidor hoje usa esse vocabulário. Cialdini (Influence) é complementar — foca em persuasão aplicada; Kahneman foca no mecanismo cognitivo subjacente.',
    topic: 'Sistemas 1 e 2',
    difficulty: 'medium',
  },

  // ════════════════════════════════════════════════════════════════════
  // HUB 2 — ATENÇÃO, MEMÓRIA & EMOÇÃO (q026-q050)
  // ════════════════════════════════════════════════════════════════════
  // ─── Atenção (q026-q037) ────────────────────────────────────────────
  {
    id: 'q026',
    question: 'Aproximadamente quantos bits de informação por segundo entram no cérebro pelos sentidos, e quantos a consciência processa?',
    options: [
      '1 milhão entrando · 100 mil processados',
      '11 milhões entrando · ~40 processados',
      '500 mil entrando · 500 mil processados',
      '100 mil entrando · 1 milhão processados',
    ],
    correct: 1,
    explanation:
      '~11 milhões de bits/s entram pelos sentidos (visão domina com 10M). A consciência processa cerca de 40 bits/s — menos de 0,0004% do total. Esse gargalo brutal é a razão da economia da atenção: gargalo fixo, oferta de estímulos crescendo exponencialmente, competição por atenção cada vez mais brutal.',
    hint: 'O gargalo é dramático — 4 ordens de magnitude.',
    topic: 'Atenção',
    difficulty: 'medium',
  },
  {
    id: 'q027',
    question: 'No experimento do "gorila invisível" (Simons & Chabris, 1999), 50% dos participantes contando passes de bola NÃO viram um gorila atravessando a cena. Esse fenômeno é chamado:',
    options: [
      'Daltonismo cognitivo',
      'Inattentional blindness — cegueira por desatenção',
      'Banner blindness',
      'Cocktail party effect',
    ],
    correct: 1,
    explanation:
      'Inattentional blindness é o efeito clássico: foco em uma tarefa (atenção top-down em "contar passes") torna outros estímulos invisíveis mesmo quando estão em frente aos olhos. Implicação pra marketing: público focado em outra coisa NÃO vê seu anúncio, por mais óbvio. Você precisa OU interromper com gatilho bottom-up forte OU estar alinhado com a intenção ativa.',
    topic: 'Atenção',
    difficulty: 'easy',
  },
  {
    id: 'q028',
    question: 'Atenção bottom-up se caracteriza por ser:',
    options: [
      'Voluntária, dirigida por objetivo conscientes',
      'Involuntária, reflexa, capturada por estímulos do ambiente (cor, movimento, contraste, novidade, rostos)',
      'Apenas auditiva',
      'Limitada a crianças',
    ],
    correct: 1,
    explanation:
      'Bottom-up é a atenção INVOLUNTÁRIA capturada pelo estímulo: contraste de cor, movimento, novidade, brilho, rosto humano, olhos olhando direto. É a atenção que o reptiliano controla — sequestra antes do consciente pedir permissão. Domínio do Sistema 1.',
    topic: 'Atenção',
    difficulty: 'easy',
  },
  {
    id: 'q029',
    question: 'Atenção top-down se caracteriza por:',
    options: [
      'Capturada por contraste e movimento involuntariamente',
      'Voluntária, dirigida por intenção e objetivos — quando você ENTRA no mercado procurando ativamente "queijo cottage"',
      'Sempre dominante sobre bottom-up',
      'Acessível apenas em estado meditativo',
    ],
    correct: 1,
    explanation:
      'Top-down é a atenção VOLUNTÁRIA dirigida por objetivo. Você procura "queijo cottage" e ignora 90% das prateleiras — filtro mental ativo. Domínio do Sistema 2. Implicação: marcas top-of-mind (que entram na lista mental de compra) ganham desproporcionalmente — o consumidor JÁ as procura.',
    topic: 'Atenção',
    difficulty: 'easy',
  },
  {
    id: 'q030',
    question: 'Em eye-tracking de anúncios com pessoas, qual elemento captura a PRIMEIRA fixação do olho na grande maioria dos casos?',
    options: [
      'Logo da marca no canto superior',
      'Preço em destaque',
      'Rosto humano (especialmente os olhos) — cérebro tem região dedicada (fusiform face area)',
      'CTA principal "Compre agora"',
    ],
    correct: 2,
    explanation:
      'Eye-tracking mostra consistentemente que rostos são SEMPRE a primeira fixação em anúncios que os contêm — graças à fusiform face area (FFA), região cerebral dedicada ao reconhecimento facial. Se os olhos da pessoa olham pra um produto, o olho do espectador segue (gaze cueing). Por isso anúncios profissionais usam closeup de rosto e olhar dirigido ao CTA.',
    topic: 'Atenção',
    difficulty: 'medium',
  },
  {
    id: 'q031',
    question: '"Banner blindness" (Jakob Nielsen, 1997) descreve:',
    options: [
      'Dificuldade visual de usuários idosos com cores fortes',
      'Cérebro APRENDE a filtrar automaticamente regiões da tela onde tradicionalmente aparecem anúncios — mesmo que informação útil esteja ali',
      'Banners animados causando crise epilética',
      'Ad-blockers escondendo banners via plugin',
    ],
    correct: 1,
    explanation:
      'Banner blindness é cegueira automática a zonas historicamente associadas a anúncios — topo e lateral direita principalmente. O cérebro aprende padrões de irrelevância e otimiza filtrando ANTES da consciência olhar. Implicação prática: design de página tem zonas "queimadas" onde colocar informação importante = desperdício.',
    topic: 'Atenção',
    difficulty: 'medium',
  },
  {
    id: 'q032',
    question: 'Você desenha uma embalagem de iogurte nova. O concorrente domina com azul-claro. Pela neurociência da atenção bottom-up, qual estratégia tem MAIOR chance de capturar atenção na prateleira?',
    options: [
      'Usar azul-claro parecido pra ganhar "guarda-chuva visual"',
      'Embalagem em CONTRASTE forte — laranja vibrante ou roxo escuro, que SALTA no mar de azul-claro',
      'Embalagem branca minimalista pra parecer premium',
      'Embalagem com 4 cores pra agradar todos os perfis',
    ],
    correct: 1,
    explanation:
      'Atenção bottom-up é capturada por CONTRASTE — diferença em relação ao entorno. Se prateleira é dominada por azul-claro, qualquer cor distante no espectro (laranja, vermelho, roxo) cria figura/fundo imediato e captura olhar em milissegundos via córtex visual primário. Copiar a cor do líder = parte do fundo (invisível). Por isso challengers usam paletas opostas.',
    topic: 'Atenção',
    difficulty: 'medium',
  },
  {
    id: 'q033',
    question: 'O "cocktail party effect" (Cherry, 1953) descreve:',
    options: [
      'Cérebro consegue filtrar uma voz numa festa cheia — mas ainda capta SEU NOME se alguém o diz no outro lado da sala, mostrando que o "ignorado" continua sendo processado em paralelo',
      'Pessoas em festas só percebem música alta',
      'Festas causam queda de QI temporária',
      'É mito antigo sem suporte experimental',
    ],
    correct: 0,
    explanation:
      'Cocktail party effect (Cherry, 1953) demonstra duas coisas notáveis: 1) o cérebro filtra com sucesso uma voz alvo no meio do barulho (atenção seletiva); 2) mas estímulos ignorados continuam sendo processados em background — daí o cérebro detectar seu nome mesmo em conversa que você não estava acompanhando. Implicação: usuário pode "ignorar" anúncio mas o cérebro ainda processa em algum nível.',
    topic: 'Atenção',
    difficulty: 'medium',
  },
  {
    id: 'q034',
    question: 'A frase "atenção é zero-sum" (Herbert Simon, 1971) significa que:',
    options: [
      'Atenção pode ser estocada e usada depois',
      'Capacidade atencional do usuário é finita — pra você ganhar atenção, alguma outra coisa precisa perder. Sua marca compete com Netflix, ex, boleto e ansiedade real',
      'Toda atenção é desperdício de energia',
      'Plataformas digitais criam atenção infinita via algoritmo',
    ],
    correct: 1,
    explanation:
      'Simon antecipou em 1971: "uma riqueza de informação cria uma pobreza de atenção". Capacidade consciente é fixa (~40 bits/s), oferta de estímulos cresce sem parar. Atenção virou recurso ESCASSO em mercado zero-sum. Sua marca compete com todo conteúdo, toda notificação, toda preocupação real do usuário. Subestimar essa concorrência sistêmica é motivo de tantos anúncios "tecnicamente bons" serem ignorados.',
    topic: 'Atenção',
    difficulty: 'hard',
  },
  {
    id: 'q035',
    question: 'Atenção sustentada decai rapidamente em tarefas monótonas. Estudos mostram queda significativa após aproximadamente:',
    options: ['5 minutos', '20 minutos', '60 minutos', '4 horas'],
    correct: 1,
    explanation:
      'Estudos clássicos de vigilância (Mackworth, anos 1940-50 e replicações) mostram queda significativa após ~20 minutos em tarefas monótonas. Por isso treinamentos eficazes quebram em blocos de 15-20 min com pausas; vídeos longos perdem audiência exponencialmente após esse marco; e anúncios de TV evoluíram pra 30s/60s precisamente por isso.',
    topic: 'Atenção',
    difficulty: 'medium',
  },
  {
    id: 'q036',
    question: 'Em produto de ALTO envolvimento (carro, imóvel, MBA), qual abordagem de atenção é mais eficaz?',
    options: [
      'Foco 100% em bottom-up — barulho visual máximo',
      'Foco 100% em top-down — atinge só quem já pesquisa ativamente',
      'Combinação: ATIVAR top-down via SEO/conteúdo (quem já procura) E sustentar atenção com narrativa emocional + dados pra que usuário PERMANEÇA na página/processo decisório longo',
      'Ignorar atenção — alto envolvimento decide só por preço',
    ],
    correct: 2,
    explanation:
      'Alto envolvimento = ciclo decisório longo (semanas a meses). Primeira batalha é TOP-DOWN: consumidor pesquisa ativamente (você precisa aparecer no SEO/contexto). Mas conseguir o clique é só o começo: você precisa SUSTENTAR atenção com narrativa emocional + munição racional. Bottom-up barulhento aqui assusta — parece propaganda agressiva, baixa confiança.',
    topic: 'Atenção',
    difficulty: 'hard',
  },
  {
    id: 'q037',
    question: 'Heatmaps de eye-tracking são úteis em design de embalagem/site porque:',
    options: [
      'Mostram a temperatura literal do produto',
      'Visualizam, agregando dados de 8-15 sujeitos, quais zonas captam fixações oculares (atenção real) e quais ficam frias (ignoradas) — base pra otimizar onde colocar logo, claim, CTA',
      'Substituem completamente focus groups',
      'Funcionam apenas em produtos premium',
    ],
    correct: 1,
    explanation:
      'Heatmaps agregam dados de eye-tracking (fixações onde o olho parou + tempo) em visualização: vermelho = todos olharam muito; frio = ninguém viu. Base direta pra decisões de design: mover CTA pra zona quente, retirar elemento de zona morta, otimizar hierarquia visual. Hoje 5-8 sujeitos via Tobii ou GazeRecorder custa ~R$ 1.500-3.000 — barato comparado a errar campanha inteira.',
    topic: 'Atenção',
    difficulty: 'medium',
  },

  // ─── Memória & Emoção (q038-q050) ───────────────────────────────────
  {
    id: 'q038',
    question: 'A formação de uma memória de longo prazo passa por 3 estágios principais:',
    options: [
      'Codificação → consolidação → recuperação',
      'Audição → visão → escrita',
      'Curto prazo → mediano → eterno',
      'Atenção → distração → repouso',
    ],
    correct: 0,
    explanation:
      'Codificação (informação entra via sentidos e é processada no córtex) → Consolidação (durante o sono, hipocampo "reescreve" no córtex em estruturas duradouras) → Recuperação (reconstrução fragmentada, modifica a memória a cada acesso). Sem atenção, não há codificação. Sem sono REM/profundo, consolidação fraca. Por isso aprendizado sem sono adequado fixa pior.',
    topic: 'Memória',
    difficulty: 'easy',
  },
  {
    id: 'q039',
    question: 'O hipocampo cumpre qual papel central em memória?',
    options: [
      'Apenas armazena memórias antigas',
      'Crítico pra FORMAÇÃO de novas memórias e consolidação (especialmente durante o sono) — sem hipocampo funcional, novas memórias não são formadas (caso H.M.)',
      'Controla movimentos finos',
      'Processa apenas memórias visuais',
    ],
    correct: 1,
    explanation:
      'O hipocampo (formato de cavalo-marinho no lobo temporal) é a "estação de formação" de novas memórias. O famoso paciente H.M. (Henry Molaison), após remoção bilateral do hipocampo, perdeu capacidade de formar memórias novas — vivia em loop de presente. Memórias antigas (já consolidadas no córtex) ficaram preservadas. Consolidação acontece principalmente no sono profundo/REM.',
    topic: 'Memória',
    difficulty: 'medium',
  },
  {
    id: 'q040',
    question: 'A amígdala influencia memória ao:',
    options: [
      'Substituir o hipocampo na consolidação',
      'ETIQUETAR emoção em eventos — quando intensa, libera norepinefrina que prioriza a consolidação dessa memória no hipocampo, aumentando vivacidade e durabilidade',
      'Apagar memórias antigas',
      'Bloquear formação de novas memórias',
    ],
    correct: 1,
    explanation:
      'Amígdala processa emoção (medo, prazer, surpresa) e, ao detectar intensidade, libera norepinefrina que instrui o hipocampo a tratar a memória como prioridade alta. Resultado: consolida rápido, com mais detalhes, resistente ao esquecimento. Por isso lembramos eventos emocionalmente intensos (primeiro beijo, 11/09) com vivacidade e esquecemos terças neutras.',
    topic: 'Memória',
    difficulty: 'medium',
  },
  {
    id: 'q041',
    question: 'Robert Zajonc (1968) descobriu o efeito "mere exposure". Em que consiste?',
    options: [
      'Pessoas evitam estímulos vistos muitas vezes (tédio)',
      'Exposição repetida a um estímulo AUMENTA o gosto por ele — mesmo sem associação positiva consciente',
      'Pessoas só lembram do primeiro estímulo',
      'Repetição reduz confiança na fonte',
    ],
    correct: 1,
    explanation:
      'Mere exposure: repetição pura aumenta preferência — mesmo sem significado positivo associado. Zajonc demonstrou com rostos, palavras inventadas, ideogramas chineses. Mecanismo: repetição reduz custo cognitivo de processamento (cognitive ease), e o S1 confunde fluência com qualidade. Base científica da mídia repetitiva.',
    topic: 'Memória',
    difficulty: 'easy',
  },
  {
    id: 'q042',
    question: 'O Efeito Pico-Fim (Kahneman) aplicado a UX e atendimento sugere que:',
    options: [
      'A média da experiência determina a memória',
      'Pessoas lembram experiências principalmente pelo MOMENTO MAIS INTENSO (pico) e pelo FINAL — não pela média. Otimizar o final tem alavancagem desproporcional',
      'O começo determina tudo',
      'Memória é proporcional ao tempo total',
    ],
    correct: 1,
    explanation:
      'Kahneman demonstrou em vários estudos (colonoscopia, exposição a dor/prazer) que humanos não lembram pela média mas pelo pico (momento mais intenso) e pelo final. Aplicação prática: terminar atendimento com frase memorável, fechar checkout com micro-celebração, terminar curso com cerimônia. Último touchpoint vale desproporcionalmente.',
    topic: 'Memória',
    difficulty: 'medium',
  },
  {
    id: 'q043',
    question: 'A memória de curto prazo (Miller, 1956) tem capacidade aproximada de:',
    options: ['100 itens', '50 itens', '7 ± 2 itens', '1 item por vez'],
    correct: 2,
    explanation:
      'O famoso "número mágico" de Miller: 7 ± 2 chunks de informação cabem na memória de curto prazo simultaneamente. Por isso números de telefone são agrupados (XX-XXXX-XXXX), senhas longas são difíceis, e listas de mais de 7 opções confundem (Lei de Hick também). Aplicação UX: menus com no máximo 5-7 itens principais.',
    topic: 'Memória',
    difficulty: 'easy',
  },
  {
    id: 'q044',
    question: 'Por que jingles dos anos 90 (Doril, Bombril, Tic-tac) continuam vívidos décadas depois na memória do brasileiro adulto?',
    options: [
      'Eram tecnicamente mais bem produzidos',
      'Combinação de mecanismos: REPETIÇÃO massiva (mere exposure) + MELODIA (ativa áreas profundas distintas do texto) + RIMA (cognitive ease) + EMOÇÃO de contexto infantil (consolidação amplificada pela amígdala)',
      'TV daquela época tinha audiência maior',
      'Cérebro adulto perde capacidade de formar memórias novas',
    ],
    correct: 1,
    explanation:
      'Combinação multifatorial neurocientífica. Repetição constrói familiaridade. Melodia ativa áreas profundas (núcleos basais, áreas auditivas) — duas trilhas paralelas reforçam consolidação. Rima gera cognitive ease. Contexto infantil amplifica via amígdala. Tudo junto = memória resistente a décadas. Jingles modernos raramente combinam todos os fatores.',
    topic: 'Memória',
    difficulty: 'medium',
  },
  {
    id: 'q045',
    question: 'Brand recall espontâneo e brand recognition são memórias diferentes. Qual a diferença prática?',
    options: [
      'São sinônimos — o mercado usa indistintamente',
      'Recall: lembra ESPONTANEAMENTE ao pensar na categoria (top-of-mind). Recognition: IDENTIFICA a marca ao VER. Recall é mais raro/valioso; recognition é mais comum/visual',
      'Recall é só pra produtos premium',
      'Recall é qualitativo; recognition quantitativo',
    ],
    correct: 1,
    explanation:
      'Recall espontâneo = "cite 3 marcas de refrigerante" → top-of-mind. Requer memória episódica forte. Difícil de conquistar, predispõe escolha automática (S1). Recognition = identifica logo/embalagem ao ver. Mais fácil, baseado em exposição visual. Marketing maduro mede e otimiza os DOIS — táticas diferentes.',
    topic: 'Memória',
    difficulty: 'medium',
  },
  {
    id: 'q046',
    question: 'O rebranding fracassado da Tropicana em 2009 (queda de 20% em vendas em 2 meses) ilustra que:',
    options: [
      'Rebranding sempre é positivo se for moderno',
      'Mudanças visuais bruscas QUEBRAM o brand recognition consolidado por décadas no S1 dos consumidores, exigindo reaprendizado custoso pelo S2 que muitos simplesmente não fazem',
      'Consumidores são resistentes a mudança por preguiça',
      'Designers gráficos não entendem mercado',
    ],
    correct: 1,
    explanation:
      'Brand equity vive em padrões visuais consolidados na memória de longo prazo via mere exposure repetida. Mudar logo/cor/identidade abruptamente APAGA o atalho de identificação S1 que levou décadas pra construir. Consumidor precisa reaprender via S2 — processo custoso que muitos evitam (escolhem outra marca ou param de comprar). Lição: brand equity é ativo neurocientífico de longo prazo.',
    topic: 'Memória',
    difficulty: 'medium',
  },
  {
    id: 'q047',
    question: 'A diferença entre memória EPISÓDICA e SEMÂNTICA é:',
    options: [
      'Episódica = lembrança de eventos com contexto (com forte carga emocional); Semântica = conhecimento factual descontextualizado',
      'Episódica é só visual; semântica só verbal',
      'Episódica é curta; semântica é longa',
      'Episódica é falsa; semântica é verdadeira',
    ],
    correct: 0,
    explanation:
      'Episódica: meu aniversário de 10 anos (evento, contexto, emoção). Semântica: capital do Brasil é Brasília (fato). Episódica recruta hipocampo + córtex temporal e dura anos/décadas alimentada pela amígdala. Semântica recruta córtex temporal + frontal, estável se usada. Marketing alavanca diferente cada uma: storytelling pra episódica, repetição pra semântica.',
    topic: 'Memória',
    difficulty: 'medium',
  },
  {
    id: 'q048',
    question: 'Você está lançando uma marca nova. Que combinação de princípios neurocientíficos maximiza chance de a marca entrar na memória de longo prazo?',
    options: [
      'Foco apenas em mídia paga massiva',
      'Combinação: emoção sincera (amígdala marca como prioridade) + repetição com ATIVOS VISUAIS/SONOROS CONSISTENTES (mere exposure) + momentos pico-fim em touchpoints + storytelling pra memória episódica',
      'Spam diário genérico em redes sociais',
      'Apenas conteúdo educacional puramente racional',
    ],
    correct: 1,
    explanation:
      'Memória de longo prazo se constrói pela COMBINAÇÃO. Emoção sincera dispara amígdala → prioridade de consolidação. Repetição com ativos CONSISTENTES (logo, cor, jingle) explora mere exposure — só funciona se for o MESMO ativo (mudar zera). Pico-fim otimizado cria lembranças marcantes. Storytelling consolida memória episódica.',
    topic: 'Memória',
    difficulty: 'hard',
  },
  {
    id: 'q049',
    question: 'A insula é importante em neuromarketing porque:',
    options: [
      'Processa apenas cheiros',
      'Processa AVERSÃO, dor física (e dor de pagar — Knutson 2007), nojo e desconforto. É a região que "freia" decisões de compra ao ver preços altos',
      'Controla movimentos voluntários',
      'Não tem papel relevante em decisão',
    ],
    correct: 1,
    explanation:
      'A ínsula processa nojo, dor física, desconforto, aversão. Knutson et al. (2007) mostraram via fMRI que VER PREÇO ativa a ínsula — pagar literalmente dói neurologicamente. Decisão de compra = soma neural: preferência (accumbens, +) MENOS dor de pagar (ínsula, -). Por isso reduzir fricção de pagamento (Apple Pay, recurring) aumenta conversão — suprime ativação insular.',
    topic: 'Memória',
    difficulty: 'hard',
  },
  {
    id: 'q050',
    question: 'O ato de RECUPERAR uma memória (lembrar) é descrito pela neurociência moderna como:',
    options: [
      'Reprodução fiel de um "gravador" mental',
      'RECONSTRUÇÃO criativa a partir de fragmentos — e cada recuperação MODIFICA a memória ligeiramente. Por isso testemunho ocular é tão pouco confiável',
      'Acesso direto a banco de dados imutável',
      'Processo idêntico em todos os humanos',
    ],
    correct: 1,
    explanation:
      'Memória NÃO é gravador — é reconstrução criativa, enviesada pela emoção e por crenças atuais. Cada vez que você "lembra" um evento, você está re-cinstruindo a partir de fragmentos, e a versão reconstruída é a que fica gravada novamente. Por isso testemunho ocular é notoriamente impreciso, falsas memórias são fáceis de implantar (Loftus), e duas pessoas no mesmo evento lembram detalhes diferentes.',
    topic: 'Memória',
    difficulty: 'hard',
  },

  // ════════════════════════════════════════════════════════════════════
  // HUB 3 — PERSUASÃO & VIESES (q051-q075)
  // ════════════════════════════════════════════════════════════════════
  // ─── Heurísticas e Vieses — Cialdini (q051-q063) ──────────────────
  {
    id: 'q051',
    question: 'Robert Cialdini publicou em 1984 o livro Influence sistematizando quantos princípios universais de persuasão?',
    options: ['3', '5', '6', '12'],
    correct: 2,
    explanation:
      'Cialdini sistematizou 6 princípios em 1984: reciprocidade, compromisso/coerência, prova social, autoridade, afeição e escassez. Em 2016 (Pre-Suasion) adicionou um 7º — unidade. A versão clássica de 6 continua sendo a referência operacional de marketing há 40 anos. Décadas depois, fMRI confirmou os mecanismos neurais subjacentes.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'easy',
  },
  {
    id: 'q052',
    question: 'Numa tabela de planos Básico R$ 39 / Pro R$ 89 / Premium R$ 199, o Premium frequentemente é desenhado pra:',
    options: [
      'Ser o mais vendido por ser o mais completo',
      'ANCORAR a percepção de preço — fazendo o Pro parecer "metade do Premium". Efeito decoy (Dan Ariely) que aumenta vendas do plano-meio em 30-50%',
      'Penalizar consumidores com mais dinheiro',
      'Cumprir exigência regulatória',
    ],
    correct: 1,
    explanation:
      'Decoy effect documentado por Dan Ariely (2008). O Premium frequentemente NÃO vende muito — é ÂNCORA. Sem ele, o Pro pareceria caro perto do Básico. Com ele, o Pro vira "metade do Premium", que o S1 percebe como custo-benefício ótimo. Tests A/B mostram aumento de 30-50% nas vendas do plano-meio.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q053',
    question: 'O experimento clássico de Tversky & Kahneman (1974) sobre ancoragem usou:',
    options: [
      'Pesagem de objetos',
      'Uma ROLETA com números aleatórios — antes de perguntar a estimativas (% de países africanos na ONU). Quem viu número alto deu estimativas maiores, mesmo sabendo que a roleta era irrelevante',
      'Testes de QI',
      'Análise grafológica',
    ],
    correct: 1,
    explanation:
      'Tversky & Kahneman demonstraram que o cérebro usa o PRIMEIRO número apresentado como referência mental, mesmo quando ele é OBVIAMENTE irrelevante (uma roleta giratória). Participantes sabiam que era aleatório — mas a âncora pegou mesmo assim. Aplicação direta em pricing: mostrar primeiro "de R$ 599" antes de "por R$ 299" faz o cérebro ancorar no maior.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q054',
    question: 'Por que "Últimas 3 unidades" ou "Promoção termina em 2h" funcionam em e-commerce, do ponto de vista neuroquímico?',
    options: [
      'Ativam o cerebelo, melhorando coordenação motora do clique',
      'Disparam amígdala (medo de perder oportunidade) e sistema dopaminérgico (antecipação de recompensa eminente) — combinação que reduz drasticamente o tempo de decisão',
      'Funcionam só por força do hábito cultural',
      'Apenas afetam consumidores com TDAH',
    ],
    correct: 1,
    explanation:
      'Escassez ativa amígdala (aversão à perda) e sistema dopaminérgico (antecipação da recompensa que pode escapar). Combinação biológica acelera decisão, encurtando o tempo do S2. Estudos com fMRI mostram itens marcados como escassos ativam regiões emocionais mais intensamente. ESCASSEZ REAL é legítima; falsa funciona mas destrói confiança quando descoberta.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q055',
    question: 'O experimento mais polêmico documentando o poder da AUTORIDADE percebida é:',
    options: [
      'Coca vs Pepsi (Montague)',
      'Gorila Invisível (Simons & Chabris)',
      'Choques de Milgram (1961) — 65% dos voluntários aplicaram choques que acreditavam serem mortais APENAS porque um pesquisador de jaleco branco mandou',
      'Caneca de Thaler',
    ],
    correct: 2,
    explanation:
      'Stanley Milgram (1961) é o caso mais perturbador da psicologia. Voluntários comuns aplicaram choques crescentes em outra pessoa SÓ porque um pesquisador de jaleco branco mandou — 65% chegaram ao máximo. Humanos têm tendência DESPROPORCIONAL a obedecer figuras de autoridade percebida (uniforme, título, cenário). Em marketing: dentista recomendando creme dental, médico em ad de suplemento.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q056',
    question: 'A "isca digital" (ebook grátis, mini-curso, calculadora gratuita) em funis B2B explora qual princípio de Cialdini?',
    options: [
      'Escassez',
      'Reciprocidade — quem recebe valor sente OBRIGAÇÃO latente de retribuir, baixando resistência a pedido futuro de compra em 40-60%',
      'Autoridade',
      'Ancoragem',
    ],
    correct: 1,
    explanation:
      'Reciprocidade é reflexo profundo, conservado em todas as culturas — base evolutiva da cooperação social. Cialdini documentou que pessoas que recebem qualquer coisa (mesmo simbólica) sentem obrigação de retribuir. A "isca digital" entrega valor real e cria obrigação latente. Estudos B2B mostram 40-60% melhor conversão. Ético se o produto pago realmente entrega valor.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q057',
    question: 'Foot-in-the-door (Freedman & Fraser, 1966) é a técnica de:',
    options: [
      'Vender produto físico ao bater na porta',
      'Pedir algo PEQUENO primeiro pra criar coerência psicológica, depois fazer o pedido grande — quem disse "sim" ao pequeno tem chance muito maior de aceitar o grande',
      'Forçar entrada em ambientes empresariais',
      'Aumentar pressão de venda em conversa presencial',
    ],
    correct: 1,
    explanation:
      'Freedman & Fraser mostraram que aceitar pedido PEQUENO (assinar petição, adesivo na janela) leva a aceitar pedido GRANDE depois (placa enorme no jardim). Mecanismo: cérebro tem necessidade de manter coerência com decisões anteriores. Funis modernos exploram intensamente: cadastro grátis → quiz → recomendação → trial → compra.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q058',
    question: 'O Endowment Effect (Thaler & Kahneman, 1990 — experimento da caneca) demonstra que:',
    options: [
      'Donos de canecas têm melhor humor',
      'Pessoas valorizam MAIS o que JÁ POSSUEM. Donos pediram US$ 5,78 pela caneca; não-donos ofereciam US$ 2,21. Posse adiciona valor emocional',
      'Canecas têm elasticidade-preço anormal',
      'O efeito só funciona com objetos de cerâmica',
    ],
    correct: 1,
    explanation:
      'Endowment effect: o cérebro adiciona valor emocional/identitário a qualquer coisa que se torna SUA. No experimento, mesma caneca, mesma utilidade — só posse mudou percepção. Aplicação: trial grátis (Netflix 30 dias) explora endowment — uma vez "seu", desinstalar gera sensação de PERDA. Test-drive e devolução fácil exploram baixando barreira de "ser dono temporariamente".',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q059',
    question: 'O Viés de Confirmação descreve a tendência de:',
    options: [
      'Aceitar qualquer informação como verdadeira',
      'Buscar e LEMBRAR seletivamente informação que CONFIRMA crenças prévias, e IGNORAR a que contraria. Por isso fan boy de Apple não troca por Android (e vice-versa)',
      'Confirmar pedidos antes de finalizar',
      'Replicar resultados experimentais',
    ],
    correct: 1,
    explanation:
      'Viés de confirmação é tendência sistemática do S1 a procurar informação que confirma o que já acredita e ignorar/desvalorizar contradição. Implicação prática em marketing: depois que cliente compra Apple, o cérebro filtra informação seletivamente pra confirmar "fiz a escolha certa" — explica fidelidade extrema de fan bases. Vale em política, esporte, religião — tudo.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q060',
    question: 'O Viés de Disponibilidade explica por que pessoas:',
    options: [
      'Sempre escolhem o que está mais disponível em estoque',
      'Julgam probabilidade pela facilidade com que exemplos vêm à mente — assim acidente de avião na TV faz superestimar risco aéreo',
      'Lembram apenas do que estava disponível ontem',
      'Não confiam em estatísticas oficiais',
    ],
    correct: 1,
    explanation:
      'Heurística de disponibilidade (Tversky & Kahneman, 1973): cérebro estima probabilidade pela facilidade com que exemplos vêm à mente. Notícia recente de acidente aéreo → cérebro superestima risco aéreo (estatisticamente um dos meios mais seguros). Implicação: viralizar caso negativo é catastrófico pra marca; manter cobertura positiva mantém percepção de qualidade alta.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'medium',
  },
  {
    id: 'q061',
    question: 'A Black Friday brasileira é um workshop ao vivo de quantos vieses cognitivos operando simultaneamente em um único anúncio típico?',
    options: ['1-2', '8 ou mais (ancoragem, escassez, prova social, reciprocidade, compromisso, aversão à perda, endowment, autoridade)', 'Nenhum — Black Friday é só desconto', 'Apenas escassez'],
    correct: 1,
    explanation:
      'Black Friday tipicamente opera 8+ vieses em coordenação: ancoragem ("de R$ 1.299 por R$ 599"), escassez ("últimas 20 · acaba em 4h"), prova social ("47 vendo agora"), reciprocidade ("frete grátis exclusivo"), compromisso ("já está no carrinho"), aversão à perda ("economiza R$ 700 só hoje"), endowment ("adicionar pra avaliar"), autoridade ("recomendado por especialistas"). Bombardeio coordenado de gatilhos = ~R$ 5,2 bi em 24h no Brasil (2023).',
    topic: 'Heurísticas e Vieses',
    difficulty: 'hard',
  },
  {
    id: 'q062',
    question: 'A diferença ética entre persuasão e manipulação em neuromarketing está em:',
    options: [
      'Persuasão usa só técnicas suaves; manipulação usa técnicas fortes',
      'Persuasão alavanca neurociência pra ACELERAR decisão alinhada ao INTERESSE REAL do consumidor. Manipulação usa as MESMAS técnicas pra FORÇAR decisão CONTRA o interesse real. As ferramentas são idênticas — intenção e alinhamento são opostos',
      'Persuasão é legal; manipulação é sempre ilegal',
      'Não há diferença significativa',
    ],
    correct: 1,
    explanation:
      'A diferença não está nas TÉCNICAS (escassez, ancoragem, prova social — todas podem operar dos dois lados) mas no ALINHAMENTO com interesse real do consumidor. Persuasão ética: você quer um plano de saúde bom, marketing te ajuda escolher o melhor pra você. Manipulação: vender plano caro desnecessário via urgência fake. Marca sustentável escolhe alinhamento — manipulação destrói confiança a longo prazo.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'hard',
  },
  {
    id: 'q063',
    question: 'Numa landing page de curso pago, qual combinação de heurísticas é mais eficaz E ética?',
    options: [
      'Escassez FALSA + autoridade SIMULADA',
      'Combinação real: prova social (depoimentos verificáveis), autoridade legítima (credenciais reais), ancoragem honesta (preço lista vs atual), escassez real (cohort com vagas finitas)',
      'Pitch agressivo + culpa do consumidor',
      'Apenas texto longo descrevendo metodologia',
    ],
    correct: 1,
    explanation:
      'Combinação ética alavanca neurociência sem enganar. Prova social verificável → córtex pré-frontal medial. Autoridade legítima → córtex orbitofrontal. Ancoragem honesta → preço lista real. Escassez real → amígdala sem trair. Resultado: conversão alta E confiança preservada. Alternativa fake funciona no curtíssimo prazo mas vira Reclame Aqui e screenshot viral.',
    topic: 'Heurísticas e Vieses',
    difficulty: 'hard',
  },

  // ─── Dopamina, Recompensa e Expectativa (q064-q075) ────────────────
  {
    id: 'q064',
    question: 'Wolfram Schultz (1997) demonstrou em macacos que dopamina dispara em qual momento da sequência "estímulo → ação → recompensa"?',
    options: [
      'Durante a recompensa em si (no momento do prazer)',
      'Na ANTECIPAÇÃO — quando o cérebro aprende a prever recompensa, dopamina dispara no SINAL que prediz a recompensa, não na recompensa em si',
      'Apenas depois da recompensa (consolidação)',
      'A dopamina não tem relação com recompensa',
    ],
    correct: 1,
    explanation:
      'Schultz mediu neurônios dopaminérgicos da VTA. Após repetições, dopamina passou a disparar no SINAL que prediz a recompensa (som que precede o suco), não na recompensa em si. Conclusão: dopamina é "neurotransmissor da expectativa", não do prazer. Implicação pra marketing: marcas vendem ANTECIPAÇÃO — drop, sneak peek, lista de espera, contagem regressiva alavancam o sistema dopaminérgico antecipatório.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'medium',
  },
  {
    id: 'q065',
    question: 'Kent Berridge mostrou que "wanting" (querer) e "liking" (gostar) são processos cerebrais SEPARADOS. Que implicação isso tem pra entender vício?',
    options: [
      'Vício é alto wanting E alto liking simultâneos',
      'Vício é wanting MUITO alto (dopamínico hiperativo) mas liking frequentemente BAIXO (prazer real diminui). Viciado QUER intensamente algo que nem gosta mais',
      'Vício é apenas falta de força de vontade',
      'Wanting e liking são sinônimos clínicos',
    ],
    correct: 1,
    explanation:
      'Berridge mostrou em ratos com sistema dopamínico destruído: ainda demonstravam "liking" (expressão de prazer ao comer açúcar) mas perderam "wanting" (não buscavam comida). Vício é o inverso: wanting hiperativado, liking diminuído. O viciado QUER intensamente algo que nem dá prazer. Implicação pra marketing: design sustentável cuida dos DOIS — atrair (wanting) E entregar (liking).',
    topic: 'Dopamina e Recompensa',
    difficulty: 'hard',
  },
  {
    id: 'q066',
    question: 'Por que rolar feed do Instagram, Tinder ou TikTok é tão viciante neuroquimicamente?',
    options: [
      'Apenas porque é grátis',
      'Variable reward — nunca se sabe se o próximo scroll trará algo incrível ou nada. Imprevisibilidade gera MUITO mais dopamina que recompensa previsível (mesmo mecanismo do slot machine)',
      'Apenas porque consome tempo',
      'Aditivos químicos na tela',
    ],
    correct: 1,
    explanation:
      'Variable reward schedules (B.F. Skinner) produzem muito mais dopamina que recompensa previsível. Cada scroll PODE trazer recompensa social, drama, foto perfeita — ou nada. Imprevisibilidade ativa o sistema dopaminérgico em modo busca compulsivo. Mesmo mecanismo do slot machine. Documentado em Hooked (Nir Eyal, 2014). Plataformas otimizam pra DAU/MAU usando essa neuroquímica deliberadamente.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'medium',
  },
  {
    id: 'q067',
    question: 'Prediction error em decisão neurológica: você prometeu "entrega em 3 dias" e entregou em 5. Que efeito isso provoca?',
    options: [
      'Spike de dopamina — atraso vivido como surpresa positiva',
      'QUEDA de dopamina — expectativa não atendida gera punição neurológica. Cliente associa marca a frustração — efeito durável de churn',
      'Resposta neutra — cliente não percebe',
      'Aumento de norepinefrina — cliente fica mais alerta',
    ],
    correct: 1,
    explanation:
      'Prediction error funciona dos dois lados. Superar (2 quando prometeu 3) = spike, "efeito uau", recomendação espontânea. Atender (3 quando prometeu 3) = neutro. Frustrar (5 quando prometeu 3) = QUEDA de dopamina, aprendizado negativo, frustração química real. Implicação: subprometer e superentregar é design dopamínico ótimo.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'medium',
  },
  {
    id: 'q068',
    question: 'Por que a mesma promoção "30% off" vista 50 vezes deixa de excitar consumidores?',
    options: [
      'Saturação de propaganda em geral',
      'Tolerância dopamínica — estímulo repetido perde força. Mesmo mecanismo de drogas. Marcas precisam VARIAR criativo e gatilho pra manter resposta neural',
      'Cérebro perde capacidade de processar números',
      'Apenas pessoas idosas têm essa tolerância',
    ],
    correct: 1,
    explanation:
      'Tolerância dopamínica é real. Estímulo igual e repetido produz cada vez menos resposta — vira ruído (banner blindness no nível neuroquímico). Marcas precisam VARIAR formato visual, gatilho, narrativa — mesmo se a oferta é parecida. Black Friday funciona em parte por ser anual (escassez temporal). Se cada semana fosse Black Friday, colapsaria.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'medium',
  },
  {
    id: 'q069',
    question: 'Marketing baseado em "drop" (lançamento com data marcada, lista de espera, contagem regressiva) explora primariamente qual fenômeno?',
    options: [
      'Liking durante a recompensa',
      'WANTING antecipatório — sistema dopaminérgico ativado intensamente nos dias/semanas antes do lançamento. Antecipação frequentemente gera mais dopamina total que a recompensa em si',
      'Recompensa fixa por intervalo',
      'Memória semântica',
    ],
    correct: 1,
    explanation:
      'Drops, listas de espera, contagem regressiva e sneak peeks alavancam o sistema dopaminérgico antecipatório. O cérebro do consumidor ativa wanting durante TODO o período de espera. Pré-venda frequentemente é mais lucrativa que venda pura. Apple Keynote, drops de tênis raros, lançamentos de série — todos exploram esse mecanismo.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'medium',
  },
  {
    id: 'q070',
    question: 'Marketing puramente "dopamínico" (foco em gerar wanting via gatilhos, sem investir em liking real do produto) tende a:',
    options: [
      'Construir marcas duradouras e fidelizadas',
      'Atrair clientes (wanting alto), decepcionar (liking baixo), gerar churn, e exigir gatilhos cada vez mais fortes — espiral de fadiga dopamínica e CAC crescente',
      'Funcionar igual a marketing balanceado',
      'Ser preferível por ter mais "energia"',
    ],
    correct: 1,
    explanation:
      'Marketing só-dopamínico é insustentável no longo prazo. Sequência: gatilho gera wanting → cliente compra → produto não entrega liking → cliente decepciona → churn → próxima campanha precisa de gancho mais forte → tolerância → CAC cresce → margem some. Marcas duradouras (Apple, Lego, Disney) equilibram dopamina (atrair) + liking real (fidelizar).',
    topic: 'Dopamina e Recompensa',
    difficulty: 'hard',
  },
  {
    id: 'q071',
    question: 'Núcleo accumbens dispara mais fortemente em qual momento do ciclo de compra?',
    options: [
      'No momento exato do pagamento',
      'Em ANTECIPAÇÃO do produto/recompensa — antes da posse. Ver foto do produto desejado ativa accumbens mais que ter o produto em mãos',
      'Apenas depois de 24h da compra',
      'Não tem relação com compra',
    ],
    correct: 1,
    explanation:
      'Núcleo accumbens é o centro do sistema dopaminérgico de recompensa. ATIVA FORTEMENTE na ANTECIPAÇÃO (ver produto desejado, imaginar posse), não tanto durante o consumo em si. Por isso planejar a viagem frequentemente é tão prazeroso quanto fazê-la. Marketing alavanca: pre-venda, drop, sneak peek capturam dopamina antecipatória ao longo de dias/semanas.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'medium',
  },
  {
    id: 'q072',
    question: 'A "antecipação hedônica" é o fenômeno em que:',
    options: [
      'Pessoas só ficam felizes consumindo',
      'O prazer da ESPERA pela recompensa frequentemente é MAIOR que o prazer da recompensa em si. Planejar viagem dá mais dopamina que estar lá',
      'Hedonismo causa depressão',
      'É mito psicológico sem evidência',
    ],
    correct: 1,
    explanation:
      'Antecipação hedônica é bem documentada. Estudos mostram que prazer antecipatório (planejar viagem por 3 meses) frequentemente é maior em magnitude total que prazer durante o evento. Mecanismo: sistema dopaminérgico opera continuamente durante antecipação; durante consumo, liking (opioides) chega mas wanting termina. Implicação direta: marketing que vende antecipação é frequentemente mais lucrativo que marketing que vende chegada.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'hard',
  },
  {
    id: 'q073',
    question: 'B.F. Skinner classificou schedules de reforço em 4 tipos. Qual produz MAIS comportamento de busca compulsivo?',
    options: [
      'Fixo por intervalo (recompensa a cada N tempo)',
      'Variável (especialmente VR — variable ratio): recompensa em número imprevisível de ações. Base neuroquímica do slot machine e do scroll infinito',
      'Sem nenhum reforço',
      'Apenas reforço negativo',
    ],
    correct: 1,
    explanation:
      'Skinner demonstrou que reforço VARIÁVEL produz comportamento muito mais persistente que reforço fixo. Pombo que ganha comida em intervalos imprevisíveis bica a alavanca 5-10x mais. Slot machines usam variable ratio (você nunca sabe quantas alavancas até ganhar). Feeds infinitos usam variable interval. Cuidado ético: mecanismo do vício.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'medium',
  },
  {
    id: 'q074',
    question: 'A forma ÉTICA de aplicar variable reward em marketing/produto é:',
    options: [
      'Usar ao máximo, sem limite, pra maximizar engajamento',
      'Aplicar em momentos de surpresa POSITIVA real (brinde imprevisível, frete grátis surpresa, conteúdo extra). Evitar em mecânicas que viciam usuários contra interesse próprio',
      'Nunca usar — toda variável reward é manipulação',
      'Apenas com público adulto educado',
    ],
    correct: 1,
    explanation:
      'Variable reward é arma neuroquímica poderosa — pode ser usada com ou sem ética. Aplicação ética: surpresas pontuais POSITIVAS elevam engajamento E liking. Antiética: loops infinitos otimizados pra aprisionar atenção contra o interesse do usuário. A diferença é o alinhamento com benefício real do consumidor. Tristan Harris e o Center for Humane Technology são leitura essencial sobre essa fronteira.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'hard',
  },
  {
    id: 'q075',
    question: 'Dopamina e norepinefrina trabalham juntas em algumas situações. No contexto de aprendizado emocional, qual a relação?',
    options: [
      'São idênticas — substituem uma à outra',
      'Norepinefrina (liberada pela amígdala em momentos intensos) AMPLIFICA o efeito dopaminérgico de aprendizado — eventos com carga emocional alta são lembrados E reforçam comportamento com mais força',
      'São antagonistas que se cancelam',
      'Norepinefrina bloqueia formação de memória',
    ],
    correct: 1,
    explanation:
      'Em eventos emocionalmente intensos, amígdala libera norepinefrina que potencializa o sistema dopaminérgico de aprendizado. Resultado: comportamento que foi associado a recompensa emocional intensa é gravado e reforçado com muito mais força que comportamento neutro. Em marketing, explica por que campanhas que combinam EMOÇÃO + RECOMPENSA (storytelling emotional + benefício real) fixam tanto.',
    topic: 'Dopamina e Recompensa',
    difficulty: 'hard',
  },

  // ════════════════════════════════════════════════════════════════════
  // HUB 4 — APLICAÇÃO PRÁTICA (q076-q100)
  // ════════════════════════════════════════════════════════════════════
  // ─── Neuromarketing Visual (q076-q088) ─────────────────────────────
  {
    id: 'q076',
    question: 'Aproximadamente em quantos milissegundos o cérebro humano forma uma primeira percepção visual rudimentar de uma imagem (estudo MIT de Mary Potter, 2014)?',
    options: ['500ms', '13ms — quase instantâneo, antes de qualquer participação consciente', '2.000ms', '100ms'],
    correct: 1,
    explanation:
      'O estudo de Mary Potter et al. no MIT (2014) demonstrou que humanos identificam categorias de imagens em apenas 13 milissegundos. Design visual comunica ANTES de qualquer processamento consciente. Em 13ms o córtex visual primário já decompôs em linhas e contrastes, e áreas superiores formaram impressão "isso é X, sinto Y". Design profissional otimiza pra essa janela.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q077',
    question: 'Aproximadamente quanto do córtex cerebral é dedicado a processamento visual?',
    options: ['5%', '15%', '30%', '70%'],
    correct: 2,
    explanation:
      'Cerca de 30% do córtex cerebral é dedicado à visão — mais que a soma de todos os outros sentidos. Imagens são processadas até 60.000 vezes mais rápido que texto. Por isso design visual NÃO é estética secundária — é a primeira camada de comunicação, e frequentemente a decisiva em decisão de compra.',
    topic: 'Neuromarketing Visual',
    difficulty: 'easy',
  },
  {
    id: 'q078',
    question: 'Por que vermelho domina marcas de fast-food (McDonald\'s, Coca-Cola, KFC, Burger King)?',
    options: [
      'Tradição histórica do setor — sem base biológica',
      'Vermelho ATIVA córtex visual mais que outras cores E produz leve ativação fisiológica (batimento, sensação de fome) — gatilho visceral pra impulso de consumo alimentar',
      'Vermelho é a tinta mais barata',
      'Apenas para diferenciar de comida saudável',
    ],
    correct: 1,
    explanation:
      'Vermelho tem efeito neurobiológico documentado (Mehta & Zhu, 2009). Ativa córtex visual mais que outras cores E produz ativação fisiológica leve mas mensurável. Em contexto alimentar, ativa córtex insular e regiões de fome/desejo. McDonald\'s mantém vermelho globalmente — efeito biológico estável supera variação cultural. Restaurantes de luxo, ao contrário, usam frio/neutro pra ativar pré-frontal (sofisticação).',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q079',
    question: 'O experimento da geleia de Iyengar (2000) em supermercado mostrou:',
    options: [
      'Mais variedade sempre converte mais',
      'Stand com 24 sabores atraiu MAIS atenção, mas só 3% compraram. Stand com 6 sabores: menos atenção, mas 30% compraram. Menos opções gerou 10x MAIS conversão',
      'A escolha não influencia venda',
      'Geleia premium vendeu mais que popular',
    ],
    correct: 1,
    explanation:
      'Experimento clássico em ciência da decisão. Mais opções atrai mais atenção inicial mas paralisa decisão por fadiga decisória. 24 opções = 3% conversão. 6 opções = 30%. Lei de Hick: tempo de decisão cresce logaritmicamente com opções. Aplicação direta: cardápios curados vendem mais; landing page com 3 planos converte mais que 8.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q080',
    question: 'O logo do WWF (panda com partes brancas implícitas) e da FedEx (seta entre E e X) exploram qual princípio perceptivo?',
    options: [
      'Mere exposure',
      'Princípios de Gestalt — fechamento (cérebro completa formas incompletas) e figura-fundo (separa objeto de fundo, criando significado adicional)',
      'Lei de Hick',
      'Cognitive Ease',
    ],
    correct: 1,
    explanation:
      'Princípios de Gestalt (escola alemã, 1910s) descrevem como o cérebro organiza percepção automaticamente. Fechamento: completa formas incompletas (panda WWF). Figura-fundo: separa objeto de fundo, gera descoberta lúdica (seta FedEx, brilho entre A e Z em Amazon). Esses "easter eggs" perceptivos criam engajamento via prediction error positivo e são lembrados por décadas.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q081',
    question: 'F-pattern (Jakob Nielsen) é o padrão de leitura em:',
    options: [
      'Apenas formulários longos',
      'Páginas com muito texto (artigos, busca de e-commerce) — usuários escaneiam linha horizontal no topo, depois descem na esquerda lendo só primeiras palavras. Implicação: informação crítica no topo + começo de cada parágrafo',
      'Apenas telas mobile',
      'Apenas sites em inglês',
    ],
    correct: 1,
    explanation:
      'F-pattern é padrão de scanning em páginas densas de texto, descoberto por Nielsen via eye-tracking de milhares de usuários. Olho percorre linha horizontal no topo, depois desce verticalmente lendo só primeiras palavras. Implicação: tudo importante vai no TOPO e no começo de cada bloco. Texto crítico enterrado no meio de parágrafo longo = invisível. Z-pattern é padrão de landing pages mais visuais.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q082',
    question: 'A cor AZUL em branding (Facebook, Visa, Bradesco, Caixa, planos de saúde) é amplamente usada porque:',
    options: [
      'É a cor preferida globalmente',
      'Ativa áreas associadas a CONFIANÇA, ESTABILIDADE e TECNOLOGIA — efeito calmante, baixa estímulo emocional, comunica seriedade e profissionalismo',
      'É a cor mais barata',
      'Apenas por convenção cultural',
    ],
    correct: 1,
    explanation:
      'Azul ativa áreas associadas a confiança, estabilidade, tecnologia. Efeito calmante (oposto do vermelho que acelera). Domina branding de bancos, planos de saúde, empresas de tech onde confiança e seriedade são o que se vende. Por isso Facebook é azul, Visa é azul, Bradesco é azul. Núcleo biológico estável + reforço cultural.',
    topic: 'Neuromarketing Visual',
    difficulty: 'easy',
  },
  {
    id: 'q083',
    question: 'Eye-tracking moderno é acessível mesmo a empresas médias. Aproximadamente quantos sujeitos são suficientes pra dados estatisticamente úteis em teste de embalagem?',
    options: [
      'Mínimo 200 sujeitos',
      '8-15 sujeitos por variante já fornece dados úteis — custo ~R$ 1.500-3.000 com ferramentas como Tobii ou GazeRecorder',
      'Mínimo 1.000 sujeitos',
      'Apenas 1 sujeito',
    ],
    correct: 1,
    explanation:
      'Nielsen popularizou "5 usuários encontram 80% dos problemas" pra usabilidade. Pra eye-tracking, 8-15 sujeitos por variante captura padrões dominantes de fixação (heatmap se estabiliza). Hoje, Tobii Pro Nano ou GazeRecorder web custam R$ 100-300 por sujeito. Total R$ 1.500-3.000 — investimento minúsculo comparado a errar campanha.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q084',
    question: 'Você precisa lançar embalagem de iogurte PREMIUM. Aplicando neurociência da cor, qual estratégia é mais consistente com posicionamento?',
    options: [
      'Vermelho intenso pra ativar urgência e fome',
      'Paleta fria, neutra ou baixa saturação (branco, preto, marrom escuro, gold tones) que ativa córtex pré-frontal — sofisticação, controle, intencionalidade. Vermelho/laranja sinaliza popular, não premium',
      'Multicolorido pra agradar todos os perfis',
      'Verde vibrante porque iogurte é saudável',
    ],
    correct: 1,
    explanation:
      'Premium ativa córtex pré-frontal (controle, sofisticação) — cores frias/neutras, alto contraste, espaço em branco. Vermelho intenso ativa visceral (impulso, urgência) — perfeito pra fast-food popular, oposto de premium. Marcas premium dominam preto/branco/dourado/tons terrosos (Tiffany cyan é exceção icônica). Vermelho neon = sinalização de massa.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q085',
    question: 'Princípios de Gestalt aplicados a menu de restaurante implicam:',
    options: [
      'Listar todos os pratos numa única coluna',
      'Agrupar itens por PROXIMIDADE (entradas juntas, principais juntas, sobremesas juntas) e usar SIMILARIDADE visual (mesma fonte, mesmo estilo) — cérebro organiza automaticamente',
      'Imagens enormes de todos os pratos',
      'Cores diferentes pra cada prato',
    ],
    correct: 1,
    explanation:
      'Gestalt aplicado: proximidade agrupa relacionados (entradas juntas), similaridade visual reforça o agrupamento (mesma fonte, mesmo padrão). Resultado: cérebro organiza sem esforço cognitivo, leitura fluida, decisão rápida. Violar Gestalt força o S2 a trabalhar pra organizar — fadiga decisória, churn da decisão.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q086',
    question: 'Em eye-tracking de anúncio com pessoa olhando pra um produto, o olho do espectador frequentemente:',
    options: [
      'Ignora completamente onde a pessoa olha',
      'SEGUE o olhar da pessoa retratada — efeito "gaze cueing". Por isso anúncios profissionais posicionam pessoa olhando direto pro CTA ou produto',
      'Foca apenas em legendas',
      'Vai sempre pro logo primeiro',
    ],
    correct: 1,
    explanation:
      'Gaze cueing é efeito robusto: o cérebro humano segue automaticamente o olhar de outros (herança evolutiva de detecção de ameaça/oportunidade compartilhada). Anúncios profissionais usam: closeup de rosto pra capturar primeira fixação (FFA), pessoa olhando pro produto ou CTA pra direcionar olho do espectador. Funciona inclusive em bebês — olhar de bebê tem força extra.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q087',
    question: 'A Lei de Hick formaliza qual relação?',
    options: [
      'Tempo de decisão DIMINUI com mais opções',
      'Tempo de decisão AUMENTA LOGARITMICAMENTE com número de opções. Mais opções = mais tempo + mais fadiga decisória',
      'Cor não influencia tempo de decisão',
      'Apenas se aplica a decisões médicas',
    ],
    correct: 1,
    explanation:
      'Lei de Hick (Hick, 1952): tempo de reação/decisão = log₂(N+1) — cresce logaritmicamente com número de opções. Mais opções = mais tempo + mais carga cognitiva. Iyengar replicou empiricamente em supermercado. Aplicação direta: cardápios curados de 12-15 itens vendem mais que de 200; landing pages com 3 planos convertem mais que 8; filtros excessivos diminuem conversão.',
    topic: 'Neuromarketing Visual',
    difficulty: 'medium',
  },
  {
    id: 'q088',
    question: 'Cores têm associações neurobiológicas reais (vermelho ativa, azul acalma) MAS também variam por cultura. Implicação prática:',
    options: [
      'Aplicar associações globalmente sem ajuste',
      'Núcleo biológico é estável (fisiologia das cores), mas SIGNIFICADOS culturais variam (branco = casamento Ocidente, luto China; roxo = luxo Ocidente). Antes de aplicar internacionalmente, fazer research cultural',
      'Cor não importa — só forma e contraste',
      'Sempre usar paleta mais simples possível',
    ],
    correct: 1,
    explanation:
      'Efeito FISIOLÓGICO das cores (vermelho ativa SNS, azul acalma) é universal — base biológica estável. SIGNIFICADOS culturais variam: branco = casamento (Ocidente), luto (China); roxo = luxo (Ocidente), luto parcial (Brasil); vermelho = sorte (China), perigo (Ocidente). Para mercado BR: vermelho/amarelo dominam fast-food; azul domina bancos; verde domina sustentabilidade. Sempre teste com público real do mercado-alvo.',
    topic: 'Neuromarketing Visual',
    difficulty: 'hard',
  },

  // ─── Neuropricing e Ética (q089-q100) ──────────────────────────────
  {
    id: 'q089',
    question: 'O estudo de Brian Knutson (Stanford, 2007) usou fMRI durante decisões reais de compra e descobriu:',
    options: [
      'Pagar é experiência neutra neurologicamente',
      'Preço ativa córtex INSULAR — mesma região que processa dor física. Decisão de compra é "soma neural": preferência (accumbens, +) menos dor de pagar (ínsula, -)',
      'Pagar ativa apenas memória, não dor',
      'Não há correlação entre atividade cerebral e decisão',
    ],
    correct: 1,
    explanation:
      'Knutson mostrou que pagar é experiência ATIVAMENTE aversiva. Ínsula (que processa dor física, nojo) ATIVA quando vemos preço. Decisão emerge da "soma neural": se accumbens > ínsula, compra. Senão, não. Notável: atividade neural prediz a decisão com 60% mais acurácia do que perguntar à pessoa. Consumidor racional clássico é mito.',
    topic: 'Neuropricing',
    difficulty: 'hard',
  },
  {
    id: 'q090',
    question: 'O estudo MIT de Anderson & Simester (2003) testou vestidos de catálogo a US$ 34, 39 e 44. Qual foi o resultado contraintuitivo?',
    options: [
      'US$ 34 venderam mais — preço mais baixo sempre vence',
      'US$ 39 venderam MAIS que US$ 34 — preço terminado em 9 supera preço mais baixo. Charm pricing: cérebro lê dígito esquerdo ("3 e poucos") como ancoragem dominante',
      'Os 3 preços tiveram vendas iguais',
      'US$ 44 vendeu mais por sinalizar qualidade',
    ],
    correct: 1,
    explanation:
      'Resultado clássico do charm pricing: US$ 39 vendeu MAIS que US$ 34, apesar de mais caro. Cérebro lê dígito mais à esquerda primeiro e usa como âncora ("3 e poucos") — mesmo com 9 no fim. Em produtos de baixo envolvimento, 5-25% de aumento de venda. Em premium o efeito INVERTE: Patek Philippe nunca cobra $24.999, cobra $25.000 limpo.',
    topic: 'Neuropricing',
    difficulty: 'medium',
  },
  {
    id: 'q091',
    question: 'Prestige pricing (preços redondos como R$ 100, R$ 500, R$ 2.000) funciona melhor que charm pricing (R$ 99, R$ 499, R$ 1.999) em:',
    options: [
      'Produtos populares de massa',
      'Produtos premium e de luxo — redondez sinaliza CONFIANÇA no valor. Terminação 9 sinaliza promoção/ansiedade pra vender, oposto de luxo',
      'Apenas em supermercado',
      'Apenas online',
    ],
    correct: 1,
    explanation:
      'Em premium, redondez vence: sinaliza "vale isso, ponto" — confiança no valor. Terminação 9 sinaliza popular, promoção. Patek Philippe nunca cobra $24.999 — cobra $25.000. Tiffany, Hermès, Rolex usam redondos. Apple mistura: iPhone usa terminação 9 (massa premium), Apple Watch Hermès usa redondo. Errar isso (Cadillac com "99") desbarata o posicionamento de luxo.',
    topic: 'Neuropricing',
    difficulty: 'medium',
  },
  {
    id: 'q092',
    question: 'Por que serviços de assinatura recorrente (Netflix, Spotify) geram MAIOR satisfação reportada por uso do que modelos pay-per-view do mesmo conteúdo?',
    options: [
      'Por preço efetivo menor',
      'Cobrança recorrente, após configurada, NÃO ativa a ínsula a cada uso. Você assiste sem dor de pagar. Pay-per-view ativa ínsula EXPLICITAMENTE a cada transação — mesma diversão, dor neurológica diferente',
      'Conteúdo é tecnicamente melhor em streaming',
      'Apenas viés cultural',
    ],
    correct: 1,
    explanation:
      'Cobrança recorrente desconecta consumir de pagar. Após configurada, você usa sem ativar dor de pagar. Em pay-per-view, cada compra reativa explicitamente "estou gastando agora" → ativação insular → menos consumo + satisfação reportada mais baixa. Mesmo conteúdo, EXPERIÊNCIA neural totalmente diferente. Explica explosão dos modelos por assinatura. Ética: cancelamento fácil é obrigação moral.',
    topic: 'Neuropricing',
    difficulty: 'medium',
  },
  {
    id: 'q093',
    question: 'Bundling (Microsoft Office: Word + Excel + PowerPoint num pacote) reduz fricção por qual mecanismo?',
    options: [
      'Apenas por desconto matemático',
      'Dispara a ativação insular UMA VEZ em vez de N vezes (se cada software fosse comprado separado). Pagar uma vez "dói" menos neurologicamente que pagar 4 vezes — mesmo se a soma for igual',
      'Bundles fazem softwares funcionarem melhor',
      'Por causa de regulação antitruste',
    ],
    correct: 1,
    explanation:
      'Cada transação ativa a ínsula. Bundling consolida: 1 ativação em vez de N. Cruzeiro all-inclusive aplica o mesmo: dor 1x na compra, depois consume sem reativar. Restaurante combo: preço único, "deal" + dor única. Aplicação: sempre que possível, bundle reduz fricção neural e aumenta valor percebido. Limitação ética: bundle não deve forçar pagar por itens que não quer.',
    topic: 'Neuropricing',
    difficulty: 'medium',
  },
  {
    id: 'q094',
    question: 'Drip pricing (preço inicial baixo + taxas adicionadas gradualmente até checkout) é eticamente problemático porque combina:',
    options: [
      'Apenas problema de comunicação visual',
      'Dois mecanismos psicológicos: (1) sunk cost — consumidor já investiu tempo, fica relutante em desistir; (2) ativação insular incremental — cada taxa pequena passa sob o radar. Resulta em pagamento maior do que aceitaria com transparência',
      'Funciona apenas em e-commerce',
      'Sempre é ilegal em qualquer país',
    ],
    correct: 1,
    explanation:
      'Drip pricing combina sunk cost (já investi tempo, difícil desistir) + ativação insular gradual (cada incremento pequeno passa sob o radar). Resultado: consumidor termina pagando valor que NÃO teria aceitado com transparência inicial. Aumenta conversão no curtíssimo prazo mas destrói confiança a longo prazo. Europa baniu drip em vários setores. CDC brasileiro exige preço final claro — execução varia.',
    topic: 'Neuropricing',
    difficulty: 'hard',
  },
  {
    id: 'q095',
    question: 'A inovação neurocientífica do Uber/Apple Pay/cartão por aproximação está em:',
    options: [
      'Apenas velocidade da transação',
      'SEPARAR o ato de consumir do ato de pagar — Uber: você usa o carro e sai; pagamento acontece automaticamente. Apple Pay: 0,5s sem ver o valor. Cada friction removido reduz ativação insular, aumenta conversão',
      'Tornar pagamento mais visível',
      'Reduzir custo do pagamento em si',
    ],
    correct: 1,
    explanation:
      'Uma das inovações neuropsicológicas mais brutais da última década: separar consumir de pagar. Uber: você usa o serviço, sai. Pagamento automático em segundo plano. Dor de pagar quase zero. Apple Pay: 0,5 segundo, sem digitar senha, sem ver valor. Cada friction removido reduz ativação insular. Checkout 1-click (Amazon), pagamento por aproximação, recurring billing — todos exploram esse princípio.',
    topic: 'Neuropricing',
    difficulty: 'medium',
  },
  {
    id: 'q096',
    question: 'A diferença prática entre persuasão ética e manipulação em neuromarketing está em:',
    options: [
      'Persuasão usa só técnicas suaves; manipulação usa fortes',
      'Persuasão alavanca neurociência pra ACELERAR decisão alinhada ao INTERESSE REAL do consumidor. Manipulação usa as MESMAS técnicas pra FORÇAR decisão CONTRA o interesse',
      'Persuasão é legal; manipulação é sempre ilegal',
      'Não há diferença significativa',
    ],
    correct: 1,
    explanation:
      'Diferença não está nas TÉCNICAS (escassez, ancoragem, prova social — todas dos dois lados) mas no ALINHAMENTO com interesse real do consumidor. Persuasão ética: você quer plano de saúde bom, marketing te ajuda escolher. Manipulação: vender plano caro desnecessário via urgência fake. Marca sustentável escolhe alinhamento — manipulação destrói confiança a longo prazo.',
    topic: 'Ética em Neuromarketing',
    difficulty: 'hard',
  },
  {
    id: 'q097',
    question: 'Você está montando pricing de app fitness premium com plano mensal e anual. Qual estratégia é mais alinhada à neurociência E ética?',
    options: [
      'Charm pricing R$ 29,99 mensal + R$ 199,99 anual + esconder taxa de cancelamento',
      'Pricing transparente: prestige R$ 49/mês ou R$ 399/ano (anchor faz anual parecer "menos de R$ 33/mês"), trial 7 dias (endowment), checkout 1-click (suprime ínsula), cancelamento em 2 cliques',
      'Drip pricing — mostrar R$ 19, adicionar taxas no checkout',
      'Apenas prestige R$ 50 sem nenhum mecanismo',
    ],
    correct: 1,
    explanation:
      'Aplicação completa e ética: prestige pricing (R$ 49 vs R$ 49,99 — premium sinaliza valor), ancoragem honesta no anual (12×R$ 49 = R$ 588 vs R$ 399 mostrado claro), endowment via trial 7 dias, checkout 1-click (suprime ativação insular), MAS cancelamento fácil em 2 cliques (preserva autonomia — padrão UE). Combinação maximiza conversão E mantém ética.',
    topic: 'Ética em Neuromarketing',
    difficulty: 'hard',
  },
  {
    id: 'q098',
    question: 'O risco principal do marketing PURAMENTE "dopamínico" (foco em gatilhos de wanting sem investir em liking real) é:',
    options: [
      'Construir marcas duradouras',
      'Atrair clientes via gatilhos → produto não entrega liking → churn → próxima campanha precisa gancho mais forte → espiral de fadiga dopamínica + CAC crescente até inviabilizar o negócio',
      'Funcionar igual a marketing balanceado',
      'Ser preferível por ter mais "energia"',
    ],
    correct: 1,
    explanation:
      'Marketing só-dopamínico é estruturalmente insustentável. Sequência: gatilho gera wanting → cliente compra → produto não entrega liking → cliente decepciona → churn → próxima campanha precisa gancho mais forte → tolerância dopamínica → CAC cresce → margem some. Marcas duradouras (Apple, Lego, Disney) equilibram: dopamina pra atrair + liking real pra fidelizar.',
    topic: 'Ética em Neuromarketing',
    difficulty: 'hard',
  },
  {
    id: 'q099',
    question: 'Qual livro de Cialdini, publicado em 2016, dedica capítulos inteiros à fronteira ÉTICA do uso de neurociência em persuasão?',
    options: [
      'Influence (1984)',
      'Pre-Suasion (2016)',
      'Thinking Fast and Slow',
      'Hooked',
    ],
    correct: 1,
    explanation:
      'Cialdini publicou Pre-Suasion (2016) — sequência de Influence — dedicando capítulos à ética: "se você não anunciaria com orgulho que está usando a técnica, é manipulação". Reflexão crucial pós-explosão das ferramentas digitais. Outras leituras éticas essenciais: "Hooked" e especialmente "Indistractable" (Nir Eyal); trabalhos de Tristan Harris e do Center for Humane Technology.',
    topic: 'Ética em Neuromarketing',
    difficulty: 'medium',
  },
  {
    id: 'q100',
    question: 'Mensagem final mais importante da neurociência aplicada ao marketing:',
    options: [
      'Neurociência é mágica que faz qualquer produto vender',
      'É caixa de ferramentas poderosa que pode CONSTRUIR (alinhar valor real com decisão acelerada e prazerosa) ou DESTRUIR (manipular contra interesse, gerar dependência, erodir confiança). A escolha é de quem aplica — com consequências reputacionais e regulatórias reais a longo prazo',
      'Apenas pra curso técnico — não precisa preocupar com ética',
      'Ética é problema das próximas gerações',
    ],
    correct: 1,
    explanation:
      'Neurociência aplicada virou ferramenta padrão de marketing profissional — e como toda ferramenta poderosa, carrega responsabilidade. Use pra ALINHAR (entregar valor real, simplificar decisão, gerar prazer cumprido) → constrói NPS alto, fidelidade real, longevidade. Use pra MANIPULAR (urgência fake, taxas escondidas, vícios) → pico curto + dívida reputacional + processo regulatório + fim da marca. Escolha está em quem aplica. Use pra fazer marketing que VOCÊ teria orgulho de receber.',
    topic: 'Ética em Neuromarketing',
    difficulty: 'hard',
  },
];

export const SIMULADO_META = {
  title: 'Simulado de Neuromarketing',
  description: '100 questões sem timer cobrindo os 8 módulos da trilha — cérebro triuno, sistemas 1/2, atenção, memória, dopamina, vieses, design visual e pricing.',
  totalQuestions: 100,
  passingScore: 70,
  estimatedMinutes: 180,
};
