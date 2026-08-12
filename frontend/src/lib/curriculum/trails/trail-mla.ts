import type { Trail } from '../types';

/**
 * AWS Machine Learning Engineer Associate (MLA-C01).
 *
 * A certificação DO EIXO: "engenheiro de ML na AWS" é literalmente o que a
 * plataforma ensina. Ela estava citada 91 vezes no conteúdo e não existia como
 * trilha — a lacuna de produto mais cara do currículo, medida em ago/2026.
 *
 * Complementa a AIF-C01 sem repeti-la: a AIF verifica entendimento conceitual de
 * IA e do catálogo; esta verifica capacidade de OPERAR um modelo em produção —
 * ingerir, treinar, implantar, monitorar degradação e proteger. Os `readTime`
 * são derivados do volume real na razão praticada pela trilha AIF (0,848
 * min/1000 caracteres), e não digitados à mão.
 *
 * ## Calendário — verificado na fonte oficial em 09/ago/2026
 *
 * A AWS anunciou a **MLA-C02**: registro abre em 1º/set/2026, último dia da C01
 * em inglês é 28/set/2026, disponibilidade geral da C02 no início de 2027. A C02
 * ACRESCENTA IA generativa, IA agêntica e cargas de foundation model/LLM ao
 * escopo — os quatro domínios desta trilha continuam válidos, e a camada nova é
 * exatamente o que `trail-bedrock` e `trail-arq-ia-aws` já cobrem.
 *
 * Quando a C02 sair em disponibilidade geral, o trabalho é acrescentar os
 * módulos da camada generativa e renomear a trilha — não reescrever.
 * Fonte: aws.amazon.com/blogs/training-and-certification/updates-to-aws-certified-machine-learning-engineer-associate-mla-c02/
 */
export const trilha_trail_mla: Trail = {
  id: 'trail-mla',
  name: 'AWS ML Engineer Associate (MLA-C01)',
  color: '#ff9900',
  icon: '🎓',
  desc: 'A certificação de engenharia de ML na AWS: os quatro domínios com profundidade real em preparação de dados, treinamento no SageMaker, os quatro modos de inferência, pipelines, deriva de modelo e segurança. 13 módulos com cenário, decisão e armadilha de prova. Atenção ao calendário: a MLA-C02 substitui esta versão a partir de setembro de 2026.',
  level: 'intermediate',
  href: '/aws-mla-c01',
  prerequisites: ['trail-aws-aif'],
  modules: [
    {
      slug: 'mla-intro',
      title: 'MLA-C01 — domínios, pesos e a régua que responde metade das questões',
      icon: '🎓',
      xp: 50,
      readTime: 10,
      desc: 'O que a prova mede e por que é diferente da AIF-C01, os quatro domínios com seus pesos, e a sequência de perguntas que elimina alternativas antes de você lembrar de qualquer serviço.',
        objetivo: 'Você conhece os quatro domínios da MLA-C01 e a sequência de perguntas que elimina alternativas antes de lembrar o nome do serviço.',
      level: 'intermediate',
      keywords: 'mla-c01, aws machine learning engineer associate, dominios mla c01, aws ml certificacao, mla vs aif',
      nextSuggested: ['mla-ingestao-dados'],
    },
    {
      slug: 'mla-ingestao-dados',
      title: 'Ingestão e armazenamento: onde o dado mora decide o custo do treino',
      icon: '🗄️',
      xp: 65,
      readTime: 10,
      desc: 'Os quatro formatos que a prova cobra, por que Parquet muda a ordem de grandeza do custo de leitura, particionamento e o problema de muitos arquivos pequenos, e o mapa origem → serviço de ingestão.',
      level: 'intermediate',
      keywords: 'parquet ml treinamento, particionamento s3, muitos arquivos pequenos, dms datasync snow, ingestao dados ml aws',
      prerequisites: ['mla-intro'],
      nextSuggested: ['mla-transformacao-features'],
    },
    {
      slug: 'mla-transformacao-features',
      title: 'Transformação e atributos: o defeito que nenhum ajuste de modelo conserta',
      icon: '🧪',
      xp: 70,
      readTime: 11,
      desc: 'As quatro formas de vazamento de dado e o sintoma de cada uma, por que separar antes de transformar, o critério entre Glue, EMR, Processing e Data Wrangler, e por que árvore não precisa de normalização.',
      level: 'intermediate',
      keywords: 'vazamento de dados ml, data leakage, glue emr sagemaker processing, data wrangler, codificacao categorica, normalizacao arvore',
      prerequisites: ['mla-ingestao-dados'],
      nextSuggested: ['mla-feature-store'],
    },
    {
      slug: 'mla-feature-store',
      title: 'Feature Store: a divergência entre treino e serviço',
      icon: '🏪',
      xp: 70,
      readTime: 10,
      desc: 'Por que o mesmo atributo calculado duas vezes diverge, os armazenamentos online e offline, a viagem no tempo como correção de vazamento temporal, e os três casos em que o serviço não se paga.',
      level: 'intermediate',
      keywords: 'sagemaker feature store, training serving skew, divergencia treino servico, armazenamento online offline, viagem no tempo atributo',
      prerequisites: ['mla-transformacao-features'],
      nextSuggested: ['mla-qualidade-vies-dados'],
    },
    {
      slug: 'mla-qualidade-vies-dados',
      title: 'Desbalanceamento e viés: quando 99% de acurácia é um modelo inútil',
      icon: '⚖️',
      xp: 70,
      readTime: 10,
      desc: 'A métrica como decisão de negócio disfarçada de escolha técnica, as três formas de tratar desbalanceamento, as três perguntas que o Clarify responde, e por que remover o atributo sensível não remove o viés.',
      level: 'intermediate',
      keywords: 'desbalanceamento classes, precisao revocacao auc-pr, smote peso de classe, sagemaker clarify, vies pre pos treinamento',
      prerequisites: ['mla-feature-store'],
      nextSuggested: ['mla-escolha-modelo'],
    },
    {
      slug: 'mla-escolha-modelo',
      title: 'Serviço pronto, Bedrock, JumpStart ou script próprio: a escada',
      icon: '🪜',
      xp: 65,
      readTime: 10,
      desc: 'Os quatro caminhos para ter um modelo na AWS em ordem de esforço, as quatro condições que justificam treinar, e a tabela que diagnostica sobreajuste e subajuste pela leitura das curvas.',
      level: 'intermediate',
      keywords: 'jumpstart sagemaker, algoritmo nativo sagemaker, quando treinar modelo proprio, sobreajuste subajuste, overfitting underfitting curvas',
      prerequisites: ['mla-qualidade-vies-dados'],
      nextSuggested: ['mla-treinamento-sagemaker'],
    },
    {
      slug: 'mla-treinamento-sagemaker',
      title: 'Infraestrutura de treinamento: spot, checkpoint e a GPU ociosa',
      icon: '⚙️',
      xp: 70,
      readTime: 10,
      desc: 'Os três termos da conta de custo e por que o terceiro engana, capacidade pontual como maior alavanca e o checkpoint que a viabiliza, escolha de família de instância, e o que fazer quando a GPU fica em 12%.',
      level: 'intermediate',
      keywords: 'spot training sagemaker, checkpoint treinamento, gpu ociosa treino, treinamento distribuido, trainium inferentia, instancia treinamento ml',
      prerequisites: ['mla-escolha-modelo'],
      nextSuggested: ['mla-tuning-avaliacao'],
    },
    {
      slug: 'mla-tuning-avaliacao',
      title: 'Ajuste de hiperparâmetros e avaliação honesta',
      icon: '🎚️',
      xp: 70,
      readTime: 10,
      desc: 'As quatro estratégias de busca e quando cada uma compensa, parada antecipada olhando validação e não treino, e os quatro erros de avaliação — a começar por usar o teste para escolher configuração.',
      level: 'intermediate',
      keywords: 'hyperparameter tuning sagemaker, busca bayesiana grade aleatoria, hyperband, parada antecipada, conjunto de teste imparcial, validacao cruzada',
      prerequisites: ['mla-treinamento-sagemaker'],
      nextSuggested: ['mla-implantacao-inferencia'],
    },
    {
      slug: 'mla-implantacao-inferencia',
      title: 'Os quatro modos de inferência e a árvore de três perguntas',
      icon: '🚀',
      xp: 75,
      readTime: 11,
      desc: 'Tempo real, sem servidor, assíncrono e lote: o que cada um cobra, a armadilha de cada um, a diferença entre sem servidor e assíncrono, endpoint com vários modelos, e as estratégias de implantação gradual.',
      keywords: 'modos inferencia sagemaker, serverless inference, inferencia assincrona, batch transform, multi model endpoint, canary blue green ml',
      prerequisites: ['mla-tuning-avaliacao'],
      nextSuggested: ['mla-pipelines-orquestracao'],
      level: 'advanced',
    },
    {
      slug: 'mla-pipelines-orquestracao',
      title: 'Pipelines, Model Registry e o passo de condição',
      icon: '🔗',
      xp: 75,
      readTime: 10,
      desc: 'Por que procedência importa mais que automação, os cinco passos de um pipeline de ML, o estado de aprovação como fronteira entre automático e humano, e quando a orquestração passa do SageMaker para Step Functions.',
      keywords: 'sagemaker pipelines, model registry aprovacao, linhagem modelo, step functions ml, eventbridge retreinamento, portao de qualidade modelo',
      prerequisites: ['mla-implantacao-inferencia'],
      nextSuggested: ['mla-monitoramento-drift'],
      level: 'advanced',
    },
    {
      slug: 'mla-monitoramento-drift',
      title: 'Deriva: a falha que não gera erro',
      icon: '📉',
      xp: 75,
      readTime: 11,
      desc: 'As quatro derivas e o que cada uma exige, por que deriva de conceito não se detecta pela entrada, o que o Model Monitor observa e a linha de base que ele precisa, e os quatro gatilhos de retreinamento.',
      keywords: 'model monitor sagemaker, drift de dados, drift de conceito, deriva de atribuicao, linha de base modelo, gatilho retreinamento',
      prerequisites: ['mla-pipelines-orquestracao'],
      nextSuggested: ['mla-seguranca-governanca'],
      level: 'advanced',
    },
    {
      slug: 'mla-seguranca-governanca',
      title: 'Segurança e governança: VPC não basta, e KMS é a segunda autorização',
      icon: '🔐',
      xp: 75,
      readTime: 10,
      desc: 'As três perguntas de segurança do domínio 4, por que colocar na VPC não elimina o tráfego público, as quatro peças de isolamento de rede, e o acesso negado que vem da política da chave e não da do bucket.',
      keywords: 'sagemaker vpc endpoint, isolamento de rede treinamento, kms chave gerenciada cliente, acesso negado kms, papel de execucao sagemaker, linhagem auditoria ml',
      prerequisites: ['mla-monitoramento-drift'],
      nextSuggested: ['mla-estrategia-prova'],
      level: 'advanced',
    },
    {
      slug: 'mla-estrategia-prova',
      title: 'Estratégia de prova: os cinco padrões de enunciado',
      icon: '🏁',
      xp: 60,
      readTime: 10,
      desc: 'Os cinco padrões que a MLA-C01 reaproveita e a reação a cada um, a revisão dos quatro domínios em uma página, o que fazer nos últimos dias, e como decidir entre duas alternativas quase idênticas.',
      level: 'intermediate',
      keywords: 'estrategia prova mla-c01, dicas mla c01, revisao mla c01, simulado machine learning engineer, como passar mla c01',
      prerequisites: ['mla-seguranca-governanca'],
      nextSuggested: ['bedrock-o-que-e-e-por-que', 'mlops-ciclo-completo'],
    },
  ],
};
