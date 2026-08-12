import type { TemaId } from './temas';

/**
 * Perguntas frequentes por tema — a resposta na página, não a promessa dela.
 *
 * ## O contrato de resposta citável
 *
 * Cada par obedece a três regras, e nenhuma é estética:
 *
 *  1. **A pergunta é a pergunta que se digita.** Ela vira `<h3>` no HTML.
 *     Cabeçalho em forma de pergunta com resposta imediatamente abaixo é o
 *     formato que resumo de IA cita; cabeçalho genérico ("Sobre agentes") gasta
 *     o sinal.
 *  2. **A resposta começa pela conclusão.** Primeira frase responde; o contexto
 *     vem depois. Resposta que começa em "Antes de entender X, é importante
 *     lembrar que…" não é citada, porque o trecho extraído seria o preâmbulo.
 *  3. **A resposta tem substância e limite.** Mínimo de 180 caracteres, e sempre
 *     que houver ressalva ela é dita. "Depende" sem dizer de quê não responde.
 *
 * As três são verificadas por `temas-perguntas.test.ts` e pela varredura, que lê
 * o HTML servido — teste de dado prova que o texto existe, só o HTML prova que a
 * página o emite.
 *
 * ## Por que NÃO há FAQPage aqui
 *
 * O resultado enriquecido de FAQ deixou de ser exibido pelo Google em maio de
 * 2026. Marcar seria trabalho para um recurso inexistente. O que faz efeito é a
 * estrutura do HTML — pergunta em cabeçalho, resposta em seguida —, e é isso que
 * está feito. Ver `PESQUISA_DEMANDA_BUSCA_2026-08.md`.
 *
 * ## Como as perguntas foram escolhidas
 *
 * Do corpus de 10.000 consultas (`docs/seo/corpus-10k.csv`), por tema, em ordem
 * de origem: primeiro as de volume publicado (`V`), depois as de padrão
 * documentado (`P`). Duas exceções deliberadas: em `seguranca-ia` e
 * `fundamentos-cs` as consultas de maior volume eram `phishing`, `malware` e
 * `blockchain` — fora do eixo IA/Claude/AWS da plataforma. Volume não é
 * argumento suficiente, e a alternativa escolhida foi a pergunta de maior
 * intenção DENTRO do eixo.
 */

export interface PerguntaDeTema {
  /** Termina em `?`. Vira `<h3>`. */
  q: string;
  /** Começa pela conclusão. Mínimo de 180 caracteres. */
  a: string;
}

export const PERGUNTAS_POR_TEMA: Partial<Record<TemaId, PerguntaDeTema[]>> = {
  agentes: [
    {
      q: 'Agente ou fluxo determinístico: quando usar cada um?',
      a: 'Use fluxo determinístico sempre que você souber os passos de antemão — ele é mais barato, mais rápido e testável. O agente ganha quando o caminho depende do que se encontra no meio: quantos arquivos existem, o que a consulta devolveu, se o teste passou. A pergunta que decide é se você consegue escrever o fluxograma; se consegue, escreva o fluxograma.',
    },
    {
      q: 'Por que um agente entra em loop?',
      a: 'Quase sempre porque uma ferramenta devolve resultado vazio ou ambíguo e o modelo interpreta isso como "tente de outra forma". Sem critério de parada verificável, o laço gira até alguém olhar a fatura. As duas defesas são estruturais, não de prompt: teto de passos e ferramenta que devolve erro explícito em vez de vazio — "nenhum resultado" é informação, string vazia não é.',
    },
    {
      q: 'Como limitar o gasto de um agente autônomo?',
      a: 'Com teto de passos e teto de gasto configurados fora do prompt, porque o custo de um agente é imprevisível por construção: o número de voltas depende do que ele encontra. Instrução do tipo "seja econômico" é pedido, não garantia. Some a isso cache da parte estável do prompt e roteamento por tarefa, que atacam o valor de cada volta em vez da quantidade.',
    },
  ],

  'rag-retrieval': [
    {
      q: 'Quando usar RAG em vez de fine-tuning?',
      a: 'RAG quando o problema é FATO — o modelo não sabe o que está no seu banco. Fine-tuning quando o problema é COMPORTAMENTO: formato de saída, tom, convenção de domínio. A confusão custa caro nas duas direções: fine-tuning não resolve falta de conhecimento, e RAG não conserta um modelo que responde no formato errado.',
    },
    {
      q: 'Quando usar RAG em vez de janela de contexto grande?',
      a: 'Contexto grande basta quando o material é pequeno, estável e cabe inteiro — jogar tudo na janela é mais simples e não tem etapa de recuperação para errar. RAG passa a valer quando o acervo não cabe, muda com frequência ou precisa de rastro da fonte. O contrapeso é o custo: contexto grande é reenviado a cada chamada e vira o maior item da conta de entrada.',
    },
    {
      q: 'Busca vetorial ou busca por palavra-chave?',
      a: 'As duas, na maioria dos casos reais. A busca vetorial acha o que significa a mesma coisa com outras palavras; a busca léxica acha o termo exato — nome de produto, código de erro, sigla — que o vetor costuma perder. Busca híbrida com reordenação é o padrão porque cada uma falha onde a outra acerta, e a qualidade da resposta é decidida na recuperação, não na geração.',
    },
  ],

  'prompt-contexto': [
    {
      q: 'O que é engenharia de prompt?',
      a: 'É decidir o que o modelo recebe e em que ordem, para obter comportamento previsível. Na prática se divide em duas partes com destinos diferentes: instrução de sistema, que é regra permanente e não muda entre chamadas, e a mensagem daquela tarefa. Escrever regra permanente na mensagem do usuário é o erro mais comum — ela se perde na chamada seguinte e não se beneficia de cache.',
    },
    {
      q: 'Cache de prompt vale a pena?',
      a: 'Vale sempre que a parte estável do seu prompt for grande e reenviada com frequência — instrução de sistema e definição de ferramenta costumam ser o maior item da conta de entrada. A ordem importa mais que o resto: o trecho estável precisa vir primeiro, senão o cache não se forma. Com prompt pequeno e muito variável o ganho desaparece e não compensa a complexidade.',
    },
    {
      q: 'Exemplos funcionam melhor que instruções?',
      a: 'Para FORMATO, quase sempre sim: dois ou três exemplos da saída desejada ensinam mais que um parágrafo descrevendo-a. Para REGRA, a instrução é melhor — exemplo não comunica "nunca faça X". A combinação que funciona na prática é instrução curta para as regras e exemplos para a forma, nessa ordem.',
    },
  ],

  'avaliacao-evals': [
    {
      q: 'Como saber se meu agente está certo antes de subir?',
      a: 'Com um conjunto fixo de casos e critério de acerto verificável rodando a cada mudança — é a única forma de transformar "parece bom" em número. A frustração nº 1 de quem programa com IA é a resposta quase certa, e ela só aparece em volume: um caso passa, cinquenta revelam o padrão. Sem eval, cada deploy é aposta com resultado descoberto pelo usuário.',
    },
    {
      q: 'Quantos exemplos preciso para um eval confiável?',
      a: 'Menos do que se imagina para detectar regressão, e mais do que se imagina para medir qualidade absoluta. Algumas dezenas de casos bem escolhidos — cobrindo o caminho comum e as bordas conhecidas — já pegam a maior parte das quebras. O que não funciona é conjunto montado só com casos fáceis: ele passa sempre e não informa nada.',
    },
    {
      q: 'Como medir alucinação em produção?',
      a: 'Exigindo que a resposta cite o trecho de origem e verificando essa citação contra o material — se o trecho não existe ou não sustenta a afirmação, é alucinação, e isso é checável sem julgamento humano. Modelo como juiz ajuda a escalar, com a ressalva de que ele tem os próprios vieses. Onde a resposta errada tem custo alto, a verificação precisa estar fora do modelo.',
    },
  ],

  'seguranca-ia': [
    {
      q: 'O que é prompt injection e por que filtrar texto não resolve?',
      a: 'É instrução hostil que chega ao modelo dentro de dado que ele foi mandado ler — uma página, um documento, um comentário. Filtrar não resolve porque a entrada é linguagem e linguagem instrui: não existe lista de palavras que separe "leia isto" de "ignore o que mandaram antes". O que resolve é limitar o que o sistema PODE fazer, por permissão e sandbox.',
    },
    {
      q: 'Qual a diferença entre jailbreak e prompt injection?',
      a: 'No jailbreak é o próprio usuário tentando fazer o modelo violar as regras dele; no prompt injection é um terceiro escondendo instrução em conteúdo que o sistema vai ler. A distinção importa porque a defesa é outra: jailbreak é problema de alinhamento e política de uso, injection é problema de arquitetura — quem confia em qual entrada, e com que privilégio.',
    },
    {
      q: 'Onde colocar o guardrail: no prompt ou no código?',
      a: 'No código, sempre que a regra não puder falhar. Guardrail no prompt é pedido: funciona na maioria das vezes e falha silenciosamente quando o modelo é convencido do contrário. Em código — validação de saída, permissão de ferramenta, gancho de pós-execução — é fato verificável. A regra prática: prompt para preferência, código para requisito.',
    },
  ],

  'modelos-internals': [
    {
      q: 'O que é inteligência artificial?',
      a: 'É o campo que constrói sistemas capazes de executar tarefas que exigiriam decisão humana, e hoje sua vertente dominante é o aprendizado de máquina: em vez de escrever a regra, mostra-se exemplos e o sistema ajusta parâmetros até acertar. Modelo de linguagem é um caso particular disso — treinado para prever o próximo pedaço de texto, o que explica tanto a fluência quanto os erros.',
    },
    {
      q: 'Qual a diferença entre IA, machine learning e LLM?',
      a: 'São três círculos concêntricos: IA é o campo, aprendizado de máquina é a abordagem que aprende de dados em vez de regra escrita, e modelo de linguagem grande é um tipo específico de modelo de aprendizado de máquina. Confundir os níveis leva a decisão errada de ferramenta — muito problema tratado como caso de LLM é caso de ML tabular, que é mais barato, mais rápido e explicável.',
    },
    {
      q: 'O que se perde ao quantizar um modelo?',
      a: 'Precisão numérica dos pesos, em troca de memória e velocidade — o modelo passa a caber em GPU menor e responde mais rápido. A perda de qualidade costuma ser pequena até certo ponto e depois desaba, e o ponto varia por modelo e por tarefa. Por isso quantização é decisão que se MEDE com o seu próprio conjunto de avaliação, não que se escolhe por recomendação genérica.',
    },
  ],

  'custo-finops': [
    {
      q: 'Como reduzir o custo de LLM sem perder qualidade?',
      a: 'Nesta ordem, porque é a ordem do retorno: cache da parte estável do prompt, que costuma ser o maior item da entrada; roteamento por tarefa, mandando o que é simples para modelo menor; processamento em lote onde ninguém está esperando resposta; e só então encurtar prompt. As três primeiras não mexem na qualidade — a última mexe, e é por isso que vem por último.',
    },
    {
      q: 'Quantos tokens um agente gasta por tarefa?',
      a: 'Não há número fixo, e é justamente essa a característica que precisa ser administrada: o gasto depende de quantas voltas o laço dá, e isso depende do que o agente encontra. O que se faz é medir por tarefa real, estabelecer teto de passos e de gasto, e tratar tokens por tarefa como métrica de produto — do mesmo jeito que latência.',
    },
    {
      q: 'Processamento em lote ou chamada direta?',
      a: 'Lote quando ninguém está esperando: classificar histórico, gerar resumo de arquivo, rodar conjunto de avaliação. Custa significativamente menos e entrega em janela de horas. Chamada direta com resposta em fluxo para qualquer coisa com usuário na frente. O erro caro é usar chamada síncrona em trabalho de fundo só porque o código já estava escrito assim.',
    },
  ],

  'producao-sre': [
    {
      q: 'Qual a diferença entre observabilidade e monitoramento?',
      a: 'Monitoramento responde perguntas que você já sabia fazer — painel com as métricas previstas. Observabilidade é conseguir responder pergunta nova sem subir código: por que ESTA requisição demorou. A diferença aparece no incidente, quando a causa não estava no painel, e é a razão de trace com contexto valer mais que mais um gráfico de média.',
    },
    {
      q: 'O que medir em um sistema com LLM em produção?',
      a: 'Além de latência e erro, três coisas que só existem aqui: tokens por requisição (custo), quantas voltas o laço deu (comportamento do agente) e taxa de resposta rejeitada pela validação de saída (qualidade). Trace com um span por chamada de ferramenta é o que transforma "o agente travou" em "a terceira busca devolveu vazio e ele tentou dezoito vezes".',
    },
    {
      q: 'Como testar sistema com IA se a saída muda a cada chamada?',
      a: 'Testando propriedade em vez de igualdade: o formato é válido, a resposta cita fonte existente, o número está na faixa possível, a ferramenta proibida não foi chamada. Igualdade de texto só serve onde a saída é fechada. Para o resto, conjunto de avaliação com critério verificável rodando no CI é o equivalente de teste de regressão — com a diferença de que ele tem custo por execução.',
    },
  ],

  'dados-engenharia': [
    {
      q: 'Postgres ou DynamoDB?',
      a: 'Postgres quando a consulta é imprevisível — junção, agregação, filtro por campo que ninguém previu — e quando transação com várias tabelas importa. DynamoDB quando o padrão de acesso é conhecido e estável, e a escala de escrita é o problema. A escolha se paga ou se cobra no dia em que chega uma pergunta nova: no relacional é uma consulta, no chave-valor é uma migração.',
    },
    {
      q: 'O que é MVCC e por que o Postgres usa em vez de trava?',
      a: 'MVCC é manter versões da mesma linha para que quem lê não espere quem escreve. O Postgres usa porque trava de leitura transforma leitura concorrente em fila, e leitura é a maior parte da carga de quase todo sistema. O preço é a versão antiga que fica no disco até ser recolhida — daí o vacuum existir, e daí tabela com muita atualização inchar quando ele não dá conta.',
    },
    {
      q: 'ETL ou ELT: qual usar no meu pipeline?',
      a: 'ELT quando o destino aguenta transformar — data warehouse moderno tem poder de processamento sobrando, e carregar o dado bruto primeiro preserva a possibilidade de reprocessar com regra nova. ETL continua certo quando a transformação reduz volume drasticamente antes do transporte, ou quando o dado bruto não pode ser armazenado por restrição legal.',
    },
  ],

  'aws-core': [
    {
      q: 'Lambda, ECS ou EKS: qual escolher?',
      a: 'Lambda para carga intermitente e tarefa curta, em que pagar por invocação vence pagar por hora ociosa. ECS quando você quer contêiner sem administrar plano de controle. EKS quando já existe Kubernetes no time ou a portabilidade entre nuvens é requisito real. O erro mais caro é escolher EKS pela expectativa de escala que não chegou — o custo de operação vem antes dela.',
    },
    {
      q: 'IAM role ou IAM user?',
      a: 'Role em praticamente tudo. Role entrega credencial temporária, rotacionada automaticamente e assumível por serviço; user carrega chave de longa duração que vaza em repositório, em imagem de contêiner e em variável de ambiente esquecida. Restam poucos casos legítimos de user, e todos envolvem sistema externo que não sabe assumir role.',
    },
    {
      q: 'Aurora ou RDS: qual banco escolher na AWS?',
      a: 'Aurora quando importa escalar leitura e reduzir tempo de recuperação: o armazenamento é replicado em três zonas e a réplica de leitura sobe sem cópia integral. RDS quando a carga é modesta e o custo por hora manda, ou quando você precisa de versão ou extensão que o Aurora não acompanha. Nos dois casos o gargalo real quase nunca é o motor — é o índice ausente.',
    },
  ],

  bedrock: [
    {
      q: 'Bedrock ou API direta do fornecedor?',
      a: 'Bedrock quando a conta AWS é o perímetro: permissão por IAM, tráfego por VPC, custo no mesmo faturamento e vários modelos por trás de uma interface. API direta quando você precisa do recurso mais novo no dia em que ele sai, ou de detalhe de comportamento que a camada gerenciada ainda não expõe. A troca é conveniência de operação contra proximidade da fonte.',
    },
    {
      q: 'Bedrock ou SageMaker?',
      a: 'Bedrock para consumir modelo pronto por API, sem infraestrutura para provisionar. SageMaker quando você treina, ajusta ou serve modelo próprio e precisa controlar a máquina. A confusão aparece em fine-tuning, que existe nos dois: no Bedrock é gerenciado e limitado ao catálogo; no SageMaker é você quem monta o treino, com a liberdade e o trabalho que isso implica.',
    },
    {
      q: 'Como escolher modelo no catálogo do Bedrock?',
      a: 'Pela tarefa e pelo custo por token, medidos no seu próprio conjunto de avaliação — nunca por posição em ranking público, que mede outra coisa. O procedimento que funciona: escolha dois candidatos de portes diferentes, rode os mesmos casos, compare acerto e custo. Modelo grande em tarefa simples é o desperdício mais comum, e ele não aparece na fatura como erro.',
    },
  ],

  certificacao: [
    {
      q: 'Qual certificação AWS fazer primeiro?',
      a: 'Cloud Practitioner (CLF-C02) se você está começando na nuvem, porque ela organiza o vocabulário antes de exigir arquitetura. Se você já trabalha com AWS, pule direto para Solutions Architect Associate (SAA-C03) — é a credencial mais pedida em vaga, e a Practitioner não acrescenta muito a quem já opera. Para quem vem de IA, a AI Practitioner (AIF-C01) é a porta com mais afinidade.',
    },
    {
      q: 'A SAA-C03 é difícil?',
      a: 'É a prova que exige decidir, não decorar: quase toda questão apresenta um cenário com restrição de custo, disponibilidade ou latência, e mais de uma alternativa tecnicamente possível. Quem estudou serviço por serviço sem praticar escolha entre eles sente a diferença. Simulado comentado é o que mais move a agulha, porque o que ensina é entender por que a alternativa errada é errada.',
    },
    {
      q: 'Certificação AWS aumenta salário no Brasil?',
      a: 'Ela abre triagem mais do que aumenta salário diretamente — muita vaga usa a credencial como filtro automático, e vaga que exige alguma habilidade de IA paga em média 28% mais. O ganho real vem da combinação: certificação para passar pelo filtro, projeto demonstrável para passar pela entrevista técnica. Sozinha, nenhuma das duas sustenta a negociação.',
    },
  ],

  linguagens: [
    {
      q: 'Python ou Go para serviço de IA em produção?',
      a: 'Python onde está o ecossistema — treino, avaliação, manipulação de dado, biblioteca de modelo. Go onde o serviço precisa de concorrência previsível, binário único e consumo de memória estável, tipicamente na camada que fica na frente do modelo. Time pequeno costuma acertar mantendo Python e movendo para Go só o ponto que doeu, medido.',
    },
    {
      q: 'O que preciso saber de Python para trabalhar com IA?',
      a: 'Menos biblioteca e mais o que faz código durar: tipagem com verificação real, estrutura de dados adequada, tratamento de erro explícito e teste. A parte específica de IA é uma camada fina sobre isso — chamar API, tratar resposta, medir. O gargalo de quem trava não é desconhecer a biblioteca da moda, é escrever código que ninguém consegue depurar depois.',
    },
    {
      q: 'Por que tipagem importa em código que chama modelo?',
      a: 'Porque a resposta do modelo é a fronteira menos confiável do sistema: ela vem como texto e pode vir diferente do esperado a cada chamada. Tipo com validação em runtime — não só anotação — é o que transforma formato inesperado em erro claro no lugar certo, em vez de um `KeyError` três funções adiante, quando a informação de origem já se perdeu.',
    },
  ],

  'fundamentos-cs': [
    {
      q: 'O que acontece quando digito uma URL no navegador?',
      a: 'O nome é resolvido para um endereço, abre-se conexão, negocia-se cifragem, e só então a requisição HTTP é enviada com método, caminho e cabeçalhos. O servidor responde com código de estado, cabeçalhos e corpo. Quase toda decisão de comportamento — cache, formato, autenticação, permissão de origem — viaja em cabeçalho, e não no corpo. É por isso que depurar HTTP é ler cabeçalho.',
    },
    {
      q: 'Por que uma requisição funciona no terminal e é bloqueada no navegador?',
      a: 'Porque a restrição de origem é do NAVEGADOR, não do servidor. Ela existe para proteger o usuário de código que roda na página dele, e nenhuma ferramenta de linha de comando a aplica. Quem autoriza é o servidor de destino, pelo cabeçalho de permissão na resposta — configurar isso do lado de quem chama simplesmente não existe.',
    },
    {
      q: 'Qual a diferença entre reverter e redefinir no Git?',
      a: 'Reverter cria um commit novo que desfaz o anterior, então é seguro em histórico compartilhado. Redefinir move o ponteiro do ramo e pode descartar trabalho. A regra que evita estrago: em ramo publicado, reverta; redefina com descarte só no que ninguém mais baixou. Reescrever histórico compartilhado obriga todo o time a consertar a própria cópia.',
    },
  ],

  'arquitetura-design': [
    {
      q: 'Saga ou two-phase commit?',
      a: 'Saga quando os participantes são serviços independentes, porque 2PC exige coordenador e trava recurso até todos responderem — o que transforma indisponibilidade de um em indisponibilidade de todos. O preço da saga é que o desfazer é uma transação NOVA, com efeito visível: o estorno aparece no extrato ao lado da cobrança, e o histórico não é apagado.',
    },
    {
      q: 'Consistência forte ou eventual?',
      a: 'Forte onde ler valor velho causa dano — saldo, estoque, permissão. Eventual onde o atraso de alguns segundos é invisível para o usuário, que é a maioria das telas de leitura. A decisão não é global: o mesmo sistema costuma precisar das duas em lugares diferentes, e tratá-la como escolha única de arquitetura é o que gera latência desnecessária ou bug de dado obsoleto.',
    },
    {
      q: 'Quando a fila resolve e quando ela só esconde o problema?',
      a: 'Resolve quando o consumidor é mais lento que o produtor por natureza e o trabalho pode esperar — ela absorve pico e desacopla falha. Esconde quando o consumidor é lento por defeito: a fila cresce, a latência percebida aumenta e o alarme só toca quando já há acúmulo de horas. O sinal para observar é o tamanho da fila ao longo do tempo, não a taxa de erro.',
    },
  ],

  'conformidade-ia': [
    {
      q: 'Posso mandar dado de cliente para uma API de IA?',
      a: 'Depende de três coisas verificáveis: se há base legal para esse tratamento, se o contrato com o fornecedor cobre o uso e a retenção, e se o dado poderia ser minimizado ou anonimizado antes de sair. Enviar dado pessoal para um modelo é tratamento de dado como qualquer outro — a novidade é o destino, não a obrigação. A resposta prática costuma ser: pode, com base legal, contrato e minimização.',
    },
    {
      q: 'O EU AI Act afeta empresa brasileira?',
      a: 'Afeta quando o resultado do sistema é usado na União Europeia, porque o alcance da norma segue o efeito e não a sede — o mesmo desenho da LGPD em relação a dado de brasileiro. Na prática isso apanha produto vendido para cliente europeu e serviço cujo resultado é consumido lá. Ignorar por estar no Brasil é a leitura errada mais comum.',
    },
    {
      q: 'O que precisa ficar registrado para auditar uma decisão de modelo?',
      a: 'O suficiente para reconstruir a decisão: qual modelo e versão, qual prompt e contexto entraram, qual saída veio, quem ou o que agiu a partir dela, e quando. Sem isso não há como responder "por que o sistema recusou este caso" seis meses depois — e essa pergunta é exatamente a que auditoria e reclamação de usuário fazem. Registro é decisão de arquitetura, não de conformidade.',
    },
  ],

  'ferramentas-ia': [
    {
      q: 'Por que só 3% dos desenvolvedores confiam muito em código gerado por IA?',
      a: 'Porque o modo de falha é o pior possível para revisão: o código parece certo. A maior frustração relatada em 2026 é a resposta "quase certa, mas não" — 66% —, e 45% dizem que depurar código gerado leva mais tempo que escrever. O problema não é a taxa de erro em si, é que o erro não se anuncia, então a revisão não pode ser por amostragem.',
    },
    {
      q: 'Como revisar código gerado por IA sem perder tempo?',
      a: 'Revisando o diff, não o arquivo, e em commits pequenos — uma sessão que muda quarenta arquivos é irrevisável na prática, e é aí que erro passa. Antes da revisão humana, deixe o que é mecânico para a máquina: teste, lint, tipo, gancho de pós-execução. O que sobra para você é a decisão de projeto, que é justamente o que o agente erra sem avisar.',
    },
    {
      q: 'Claude ou ChatGPT para programar?',
      a: 'A pergunta útil não é qual modelo, é qual harness: o que decide o resultado em tarefa de código é o conjunto de ferramentas, permissões e contexto em volta do modelo, não o nome dele. Compare pelo que o produto faz — lê o repositório inteiro? roda comando? tem gancho e permissão? — e meça na sua base com tarefa real. Ranking público mede outra coisa.',
    },
  ],
};
