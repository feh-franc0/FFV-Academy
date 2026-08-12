#!/usr/bin/env python3
"""Família 2 — Documento, extração e processamento inteligente (soluções 11 a 20)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-documentos'
NOME = 'Documento, extração e processamento inteligente'

ABERTURA = [
    p('Estas dez arquiteturas tiram dado estruturado de documento não estruturado — e '
      'todas repetem a mesma ordem: **extração determinística primeiro, modelo depois**. '
      'Nota fiscal padronizada, CNH e formulário têm posição fixa de campo; ler isso com '
      'modelo de linguagem é pagar caro por uma tarefa que serviço especializado resolve '
      'melhor e com confiança numérica por campo.'),
    p('O modelo entra onde a interpretação é o trabalho: a cláusula ambígua, o laudo '
      'escrito em prosa, a divergência entre dois documentos do mesmo processo. E entra '
      'com uma saída explícita: **limiar de confiança por campo**, não agregado. O campo '
      'que alimenta decisão financeira exige revisão que o campo informativo não exige — '
      'tratar os dois igual é caro de um lado e arriscado do outro.'),
]

SOLUCOES = [
    Sol(
        n=11,
        titulo='11. Dado estruturado preso em PDF e imagem, em volume',
        titulo_diagrama='IDP orientado a evento: extração determinística primeiro, modelo no que sobra',
        problema='Milhares de documentos por dia chegam como PDF escaneado e foto de '
                 'celular, e alguém digita o conteúdo num sistema. O volume torna o '
                 'trabalho manual inviável, mas a tentação de resolver tudo com um '
                 'modelo grande lendo o documento inteiro é o desperdício clássico desta '
                 'família.',
        checagem=('S3', 'EventBridge', 'Textract', 'DynamoDB'),
        grupos=[
            ('Chegada', 'plain', [
                ('s3', 's3', 'S3', 'documento como chegou, imutável'),
                ('ev', 'eventbridge', 'EventBridge', 'um evento por objeto novo'),
                ('fn', 'lambda', 'Lambda', 'roteia por tipo de documento'),
            ]),
            ('Extração determinística', 'plain', [
                ('bda', 'dataautomation', 'Data Automation', 'campo com posição conhecida, com confiança'),
                ('tex', 'textract', 'Textract', 'formulário e tabela'),
            ]),
            ('Interpretação', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'só o campo que exige leitura'),
                ('cl', 'claude', 'Claude', 'lê o campo que exige interpretação'),
            ]),
            ('Destino', 'plain', [
                ('db', 'dynamodb', 'DynamoDB', 'dado estruturado + confiança por campo'),
            ]),
        ],
        arestas=[
            ('s3', 'ev', 'objeto criado'),
            ('ev', 'fn', 'evento do objeto criado'),
            ('fn', 'bda', 'padronizado'),
            ('fn', 'tex', 'formulário'),
            ('bda', 'br', 'campo ambíguo'),
            ('tex', 'br', 'campo em prosa'),
            ('br', 'cl', 'perfil de inferência'),
            ('bda', 'db', 'campo resolvido'),
            ('tex', 'db', 'campos de formulário'),
            ('cl', 'db', 'campo interpretado + confiança'),
        ],
        passos=[
            ('O evento substitui a varredura',
             'Nada consulta a pasta procurando arquivo novo. O objeto criado no S3 emite '
             'o evento, e o custo passa a ser proporcional ao volume real em vez de ao '
             'intervalo de consulta.',
             ['s3', 'ev'], [('s3', 'ev'), ('ev', 'fn')]),
            ('Extração especializada primeiro',
             'Campo com posição conhecida sai do serviço de extração, com confiança '
             'numérica. Modelo grande lendo nota fiscal padronizada custa mais, é mais '
             'lento e não entrega esse número.',
             ['bda', 'tex'], [('fn', 'bda'), ('fn', 'tex')]),
            ('O modelo lê só o que sobrou',
             'Observação em prosa, divergência entre campos, cláusula ambígua. É onde a '
             'interpretação é o trabalho — e onde o custo por documento se justifica.',
             ['br', 'cl'], [('bda', 'br'), ('tex', 'br')]),
            ('Confiança viaja com o dado',
             'Gravar o valor sem a confiança que o produziu impede qualquer decisão '
             'posterior de revisão. Quem consome precisa saber se aquele campo saiu de '
             'extração com 0,99 ou de interpretação com 0,71.',
             ['db'], [('bda', 'db'), ('cl', 'db')]),
            ('O documento original nunca é sobrescrito',
             'O S3 guarda o que chegou. Toda reextração parte da fonte, e é o que '
             'permite reprocessar o acervo quando o modelo melhora sem perder o '
             'histórico.',
             ['s3'], [('s3', 'ev')]),
        ],
        legenda='A ordem é a decisão: extração determinística resolve a maior parte dos '
                'campos com confiança numérica, e o modelo fica com o que exige leitura. '
                'Invertida, essa ordem multiplica o custo por documento sem melhorar o '
                'resultado.',
    ),
    Sol(
        n=12,
        titulo='12. Processo de empréstimo com documento manual',
        titulo_diagrama='Orquestração por agente quando o número de passos depende do documento',
        problema='Cada proposta de crédito chega com um conjunto diferente de '
                 'documentos: uns têm holerite, outros declaração de imposto, outros '
                 'contrato social. Um fluxo fixo não cobre isso — ele precisaria prever '
                 'toda combinação. É o caso em que a sequência de passos é decidida pelo '
                 'que chegou.',
        checagem=('AgentCore', 'classificação', 'DynamoDB'),
        grupos=[
            ('Entrada', 'plain', [
                ('up', 'user', 'Envio do cliente', 'conjunto variável de documentos'),
                ('s3', 's3', 'S3', 'os documentos como o cliente enviou, sem alterar'),
            ]),
            ('Orquestração', 'vpc', [
                ('ac', 'agentcore', 'AgentCore Runtime', 'decide o próximo passo pelo que já leu'),
                ('a1', 'subagente', 'Classificador', 'que documento é este?'),
                ('a2', 'subagente', 'Extrator', 'campos daquele tipo'),
                ('a3', 'subagente', 'Validador', 'confere entre documentos'),
            ]),
            ('Estado do processo', 'plain', [
                ('db', 'dynamodb', 'Rastreamento', 'o que falta, o que já validou'),
                ('hum', 'a2i', 'Analista', 'entra na divergência, não em tudo'),
            ]),
        ],
        arestas=[
            ('up', 's3', 'conjunto variável de documentos'),
            ('s3', 'ac', 'evento de proposta nova'),
            ('ac', 'a1', 'primeiro: o que é'),
            ('a1', 'a2', 'depois: extrai'),
            ('a2', 'a3', 'por fim: confere'),
            ('a3', 'db', 'estado'),
            ('db', 'ac', 'o que ainda falta'),
            ('a3', 'hum', 'divergência'),
        ],
        passos=[
            ('O fluxo fixo não cobre entrada variável',
             'Com dez tipos de documento e combinações livres, um fluxo declarado teria '
             'de prever todas. O agente decide o próximo passo pelo que acabou de '
             'classificar.',
             ['ac', 'a1'], [('ac', 'a1')]),
            ('Um agente por tarefa, não um agente para tudo',
             'Classificar, extrair e validar têm critérios de acerto diferentes. '
             'Separados, cada um é avaliável isoladamente — e é isso que permite '
             'descobrir qual dos três está errando.',
             ['a1', 'a2', 'a3'], [('a1', 'a2'), ('a2', 'a3')]),
            ('O estado mora fora do agente',
             'O que já foi validado e o que falta ficam no banco, não no contexto da '
             'conversa. Processo de crédito dura dias e atravessa sessões; contexto não '
             'sobrevive a isso.',
             ['db'], [('a3', 'db'), ('db', 'ac')]),
            ('A validação é entre documentos',
             'O nome no holerite tem de bater com o do documento de identidade. Esse tipo '
             'de conferência é o que nenhuma extração isolada faz — e é o passo que mais '
             'pega fraude simples.',
             ['a3'], [('a2', 'a3')]),
            ('O humano entra na divergência',
             'Não em todo processo: no que tem conflito entre fontes ou confiança baixa. '
             'É a diferença entre reduzir trabalho humano e apenas mudar o formato dele.',
             ['hum'], [('a3', 'hum')]),
        ],
        legenda='Orquestração por agente se justifica quando o número de passos depende '
                'do que chegou — não quando a sequência é conhecida. Se você consegue '
                'desenhar o fluxograma inteiro, um fluxo declarado é mais barato, mais '
                'testável e mais previsível.',
    ),
    Sol(
        n=13,
        titulo='13. Documento em ERP sem trilha de auditoria',
        titulo_diagrama='O requisito que decide o projeto é a gravação no sistema de registro',
        problema='A extração funciona no laboratório e o projeto não entra em produção: '
                 'o dado precisa ser gravado no ERP, com quem gravou, quando e com base '
                 'em qual documento. Sem isso, o time de auditoria bloqueia — e a '
                 'qualidade da extração deixa de ser o assunto.',
        checagem=('Textract', 'ABAP', 'ERP'),
        grupos=[
            ('Extração', 'plain', [
                ('doc', 'doc', 'Documento fiscal', 'nota fiscal, boleto ou contrato digitalizado'),
                ('tex', 'textract', 'Textract', 'campos com confiança'),
                ('cl', 'claude', 'Claude', 'assistente de conferência'),
            ]),
            ('Adaptador', 'vpc', [
                ('sdk', 'lambda', 'Camada de integração', 'SDK para ABAP, argumento validado'),
                ('idem', 'dynamodb', 'Chave de idempotência', 'o mesmo documento não lança duas vezes'),
            ]),
            ('Sistema de registro', 'account', [
                ('erp', 'erp', 'ERP', 'onde o lançamento vale'),
                ('tr', 'cloudtrail', 'Trilha', 'documento, versão do modelo, ator, horário'),
            ]),
        ],
        arestas=[
            ('doc', 'tex', 'imagem do documento'),
            ('tex', 'cl', 'campo em prosa'),
            ('cl', 'sdk', 'proposta de lançamento'),
            ('tex', 'sdk', 'campos diretos'),
            ('sdk', 'idem', 'confere se já lançou'),
            ('sdk', 'erp', 'grava'),
            ('sdk', 'tr', 'registra'),
        ],
        passos=[
            ('O requisito que trava o projeto não é técnico de IA',
             'É integração e rastreabilidade. Times passam meses melhorando a extração '
             'de 94% para 96% enquanto o bloqueio real era não haver caminho auditável '
             'até o ERP.',
             ['erp', 'tr'], [('sdk', 'erp'), ('sdk', 'tr')]),
            ('O adaptador é a fronteira',
             'Nenhum componente de IA fala com o ERP direto. A camada de integração valida '
             'tipo, faixa e obrigatoriedade antes de gravar — o modelo propõe, o código '
             'autoriza.',
             ['sdk'], [('cl', 'sdk'), ('tex', 'sdk')]),
            ('Idempotência, porque reprocessamento acontece',
             'Fila reentrega, alguém reenvia o mesmo PDF, o lote roda duas vezes. Sem '
             'chave de idempotência, o resultado é lançamento duplicado no sistema '
             'financeiro.',
             ['idem'], [('sdk', 'idem')]),
            ('A trilha guarda a versão do modelo',
             'Meses depois, a pergunta da auditoria é sobre um lançamento específico. '
             'Responder exige saber qual versão leu qual documento e o que ela devolveu.',
             ['tr'], [('sdk', 'tr')]),
            ('O modelo confere, não lança',
             'O papel dele aqui é apontar divergência entre o documento e o pedido de '
             'compra. Quem lança é o fluxo, com regra de negócio explícita.',
             ['cl', 'tex'], [('tex', 'cl')]),
        ],
        legenda='Em processo com sistema de registro, a integração auditável decide o '
                'projeto — não a acurácia da extração. É por isso que provas de conceito '
                'de IDP com métrica excelente morrem sem ir a produção.',
    ),
    Sol(
        n=14,
        titulo='14. Prontuário digitalizado que precisa virar dado clínico',
        titulo_diagrama='O destino é o padrão de interoperabilidade, não o JSON que você inventou',
        problema='O prontuário escaneado é extraído com sucesso e ninguém consegue usar '
                 'o resultado: cada sistema clínico espera um formato, e o JSON próprio '
                 'não é aceito por nenhum. Extrair sem normalizar para o padrão do '
                 'domínio resolve metade do problema — a metade fácil.',
        checagem=('Data Automation', 'HealthLake', 'FHIR'),
        grupos=[
            ('Chegada', 'plain', [
                ('s3', 's3', 'S3', 'prontuário digitalizado'),
                ('kms', 'kms', 'KMS', 'chave gerenciada pelo cliente'),
            ]),
            ('Extração', 'plain', [
                ('bda', 'dataautomation', 'Data Automation', 'texto, tabela e layout'),
                ('cmp', 'comprehend', 'NLP clínico', 'entidade, medicamento, negação'),
            ]),
            ('Normalização', 'vpc', [
                ('map', 'lambda', 'Mapeamento para o padrão', 'terminologia e recurso FHIR'),
                ('val', 'juiz', 'Validação do recurso', 'recusa o que não é FHIR válido'),
            ]),
            ('Destino clínico', 'plain', [
                ('hl', 'healthlake', 'HealthLake', 'consultável por qualquer cliente FHIR'),
            ]),
        ],
        arestas=[
            ('s3', 'bda', 'prontuário digitalizado'),
            ('kms', 's3', 'em repouso', 'dashed'),
            ('bda', 'cmp', 'texto clínico'),
            ('cmp', 'map', 'entidades'),
            ('bda', 'map', 'campos de layout'),
            ('map', 'val', 'recurso montado'),
            ('val', 'hl', 'recurso válido'),
            ('val', 's3', 'rejeitado, para revisão'),
        ],
        passos=[
            ('O consumidor define o formato de saída',
             'Quem vai ler é sistema clínico, e ele fala FHIR. O formato de saída se '
             'decide no começo do projeto, olhando o consumidor — não no fim, olhando o '
             'extrator.',
             ['hl', 'map'], [('map', 'val'), ('val', 'hl')]),
            ('Negação é parte do significado clínico',
             '"Sem histórico de diabetes" contém a palavra diabetes. Extração que ignora '
             'negação produz prontuário que inverte o quadro do paciente.',
             ['cmp'], [('bda', 'cmp'), ('cmp', 'map')]),
            ('Validar contra o padrão, não contra o próprio esquema',
             'Recurso que não passa na validação do padrão não entra. É o que impede o '
             'acervo clínico de encher de registro tecnicamente presente e '
             'clinicamente inutilizável.',
             ['val'], [('val', 'hl'), ('val', 's3')]),
            ('O layout carrega informação',
             'Em prontuário, coluna e cabeçalho de tabela dizem a que exame o valor '
             'pertence. Extrair só o texto corrido perde a associação — e o número fica '
             'órfão.',
             ['bda'], [('s3', 'bda'), ('bda', 'map')]),
            ('Chave própria e destino dedicado',
             'Dado de saúde exige controle de chave e trilha de acesso por registro. Isso '
             'entra no desenho na primeira versão: retroencaixar depois costuma exigir '
             'reingestão inteira.',
             ['kms', 'hl'], [('kms', 's3')]),
        ],
        legenda='Extrair sem normalizar para o padrão do domínio não resolve o problema '
                'do consumidor. O destino — FHIR, aqui — é requisito de entrada do '
                'projeto, e é ele que define o que a extração precisa produzir.',
    ),
    Sol(
        n=15,
        titulo='15. Documento técnico e legal difícil de consultar',
        titulo_diagrama='Em domínio regulado, resposta sem citação da norma é inútil',
        problema='Peritos consultam normas técnicas e regras de peritagem para decidir '
                 'casos, e a consulta leva horas em documentos de centenas de páginas. '
                 'Um resumo gerado não resolve: quem decide precisa apontar a norma que '
                 'sustenta a decisão, com número de cláusula.',
        checagem=('Knowledge Bases', 'normas', 'citação'),
        grupos=[
            ('Acervo normativo', 'plain', [
                ('s3', 's3', 'S3 — normas e regras', 'versionado por vigência'),
                ('kb', 'knowledgebases', 'Knowledge Bases', 'corte por cláusula, metadado de vigência'),
            ]),
            ('Consulta', 'plain', [
                ('per', 'user', 'Perito', 'decide o caso e assina o laudo'),
                ('br', 'bedrock', 'Bedrock', 'a porta; o perfil fixa o modelo e a região'),
                ('cl', 'claude', 'Claude', 'responde com o número da cláusula'),
            ]),
            ('Verificação', 'plain', [
                ('cit', 'juiz', 'Conferência de citação', 'o trecho existe naquela cláusula?'),
                ('vig', 'relogio', 'Filtro de vigência', 'norma revogada não responde'),
            ]),
        ],
        arestas=[
            ('s3', 'kb', 'ingestão'),
            ('per', 'br', 'pergunta do caso'),
            ('br', 'cl', 'perfil de inferência'),
            ('cl', 'kb', 'consulta com filtro'),
            ('vig', 'kb', 'só o que está em vigor', 'dashed'),
            ('kb', 'cl', 'cláusulas + referência'),
            ('cl', 'cit', 'resposta + cláusulas citadas'),
            ('cit', 'per', 'resposta com norma citada'),
        ],
        passos=[
            ('A citação é o produto, não o enfeite',
             'O perito não precisa da resposta: precisa da norma que a sustenta. Resposta '
             'sem referência não é aproveitável no laudo, por correta que esteja.',
             ['cit', 'cl'], [('cl', 'cit'), ('cit', 'per')]),
            ('Corte por cláusula, não por tamanho',
             'Cortar a cada 800 caracteres parte a cláusula no meio e recupera metade da '
             'regra. A unidade semântica do documento normativo é a cláusula, e é ela que '
             'define o corte.',
             ['kb'], [('s3', 'kb')]),
            ('Vigência é filtro, não bom senso',
             'Norma revogada continua no acervo — e continua sendo recuperada, porque é '
             'textualmente parecida. O metadado de vigência no filtro é o que impede '
             'resposta baseada em regra que não vale mais.',
             ['vig'], [('vig', 'kb')]),
            ('Conferir que o trecho existe na cláusula apontada',
             'O erro mais convincente é citar a cláusula certa com texto que ela não tem. '
             'Comparar o trecho citado com o recuperado pega isso sem revisor humano.',
             ['cit'], [('cl', 'cit')]),
            ('O acervo é versionado, porque a pergunta é histórica',
             'Um caso de 2023 se julga pela norma de 2023. Guardar só a versão vigente '
             'torna impossível reconstituir a decisão antiga.',
             ['s3'], [('s3', 'kb'), ('kb', 'cl')]),
        ],
        legenda='Em domínio regulado a resposta útil é a verificável: cláusula citada, '
                'vigência conferida e trecho confrontado com a fonte. Sem isso, quem '
                'decide não pode usar — e a economia de tempo não se realiza.',
    ),
    Sol(
        n=16,
        titulo='16. Sinistro com documentos variados e prazo de resposta',
        titulo_diagrama='Limiar de confiança POR CAMPO, não agregado',
        problema='O sinistro chega com foto, laudo, boletim de ocorrência e nota fiscal, '
                 'e existe prazo regulatório para responder. Mandar tudo para revisão '
                 'humana estoura o prazo; automatizar tudo aprova valor errado. A '
                 'decisão é onde exatamente o humano entra.',
        checagem=('evento', 'BDA', 'revisão humana', 'confiança'),
        grupos=[
            ('Nivelamento', 'plain', [
                ('ev', 'eventbridge', 'EventBridge', 'sinistro aberto'),
                ('fila', 'sqs', 'Fila', 'protege o limite de taxa no pico'),
            ]),
            ('Extração e classificação', 'plain', [
                ('bda', 'dataautomation', 'Data Automation', 'confiança por campo'),
                ('cls', 'comprehend', 'Classificador', 'tipo de documento e de sinistro'),
            ]),
            ('Decisão por campo', 'plain', [
                ('reg', 'politica', 'Limiar por campo', 'valor: 0,95 · descrição: 0,80'),
                ('hum', 'a2i', 'Revisão humana', 'só nos campos abaixo do limiar'),
                ('db', 'dynamodb', 'Sinistro estruturado', 'campos + confiança, prontos para o cálculo'),
            ]),
            ('Prazo', 'plain', [
                ('slo', 'slo', 'Prazo regulatório', 'o que define o desenho'),
            ]),
        ],
        arestas=[
            ('ev', 'fila', 'sinistro aberto'),
            ('fila', 'bda', 'no ritmo que a cota aceita'),
            ('bda', 'cls', 'texto e campos extraídos'),
            ('cls', 'reg', 'campos + confiança'),
            ('reg', 'hum', 'abaixo do limiar'),
            ('reg', 'db', 'acima do limiar'),
            ('hum', 'db', 'corrigido'),
            ('reg', 'slo', 'quanto foi para revisão', 'dashed'),
        ],
        passos=[
            ('O limiar é por campo porque a consequência é por campo',
             'Errar o valor indenizado custa dinheiro; errar a descrição do veículo custa '
             'uma correção. Um limiar único ou revisa demais ou arrisca no lugar errado.',
             ['reg'], [('cls', 'reg')]),
            ('A revisão humana é parcial',
             'O analista confere três campos, não o sinistro inteiro. É o que faz a '
             'revisão caber no prazo — revisar tudo é a decisão que estoura o prazo com '
             'a melhor das intenções.',
             ['hum'], [('reg', 'hum'), ('hum', 'db')]),
            ('A fila protege o limite de taxa',
             'Granizo em capital gera pico de dez vezes o volume normal. Sem nivelamento, '
             'o pico não fica lento: ele falha, e a falha chega ao cliente.',
             ['fila'], [('ev', 'fila'), ('fila', 'bda')]),
            ('O prazo é o requisito que fecha o desenho',
             'Ele determina quantos campos podem ir para revisão. O limiar não é escolhido '
             'por gosto: é calibrado para a capacidade de revisão caber no prazo.',
             ['slo', 'reg'], [('reg', 'slo')]),
            ('Classificar o tipo antes de extrair',
             'Boletim de ocorrência e nota fiscal têm campos diferentes. Sem classificação, '
             'a extração procura campo que não existe e devolve confiança baixa em tudo.',
             ['cls', 'bda'], [('bda', 'cls')]),
        ],
        legenda='O limiar de confiança é decisão de negócio por campo, calibrada pela '
                'capacidade de revisão e pelo prazo. Limiar agregado é a escolha que '
                'revisa o barato e automatiza o caro.',
    ),
    Sol(
        n=17,
        titulo='17. Contrato longo com cláusula que precisa ser achada',
        titulo_diagrama='Corte por unidade semântica vence corte fixo em documento jurídico',
        problema='A pergunta é "existe cláusula de rescisão antecipada neste contrato?" e '
                 'a busca devolve trechos que mencionam rescisão sem ser a cláusula. A '
                 'causa é o corte: partir o contrato a cada mil caracteres separa o '
                 'título da cláusula do corpo dela.',
        checagem=('cláusula', 'híbrido', 'reordenação'),
        grupos=[
            ('Ingestão', 'vpc', [
                ('doc', 'doc', 'Contrato', 'estrutura numerada'),
                ('chk', 'chunker', 'Corte por cláusula', 'título + corpo juntos, com o pai no contexto'),
            ]),
            ('Índice', 'vpc', [
                ('emb', 'embedder', 'Embedding', 'semântica da cláusula'),
                ('bm', 'bm25', 'Índice léxico', 'termo exato: "rescisão antecipada"'),
                ('idx', 'opensearch', 'Índice híbrido', 'fusão por posição'),
            ]),
            ('Resposta', 'plain', [
                ('rr', 'reranker', 'Reordenação', 'poucos candidatos, ordem que importa'),
                ('cl', 'claude', 'Claude', 'responde citando cláusula e página'),
            ]),
        ],
        arestas=[
            ('doc', 'chk', 'texto com a numeração'),
            ('chk', 'emb', 'cláusula + cabeçalho'),
            ('chk', 'bm', 'mesma cláusula, termo exato'),
            ('emb', 'idx', 'vetor da cláusula'),
            ('bm', 'idx', 'posição léxica'),
            ('idx', 'rr', '30 candidatos'),
            ('rr', 'cl', '5 melhores'),
        ],
        passos=[
            ('A unidade de corte é a unidade de sentido',
             'Em contrato, é a cláusula. Corte fixo separa "Cláusula 12 — Rescisão" do '
             'texto que a define, e a busca recupera um pedaço que não responde nada.',
             ['chk'], [('doc', 'chk')]),
            ('O contexto do pai vai no trecho',
             'Uma cláusula que diz "o prazo do item anterior" é ininteligível sozinha. '
             'Levar o cabeçalho da seção junto é o que torna o trecho recuperado '
             'autossuficiente.',
             ['chk', 'emb'], [('chk', 'emb')]),
            ('Léxico para o termo jurídico exato',
             'Busca vetorial dilui expressão consagrada. Em contrato, quem procura '
             '"rescisão antecipada" quer aquela expressão, não algo semanticamente '
             'próximo.',
             ['bm', 'idx'], [('chk', 'bm'), ('bm', 'idx')]),
            ('Reordenar é onde a precisão aparece',
             'A fusão traz trinta candidatos com recall bom e ordem ruim. O reordenador '
             'lê pergunta e trecho juntos, e é o passo que mais melhora a resposta final.',
             ['rr'], [('idx', 'rr'), ('rr', 'cl')]),
            ('A resposta aponta cláusula e página',
             'Quem lê vai conferir no contrato. Sem a referência posicional, a resposta '
             'obriga a reler o documento — e o ganho de tempo desaparece.',
             ['cl'], [('rr', 'cl')]),
        ],
        legenda='Em documento estruturado, o corte é a decisão de maior impacto na '
                'qualidade — mais que o modelo de embedding e mais que o modelo de '
                'geração. Cortar por cláusula é escolher recuperar unidades que '
                'respondem sozinhas.',
    ),
    Sol(
        n=18,
        titulo='18. Documento multimodal — texto, tabela e figura',
        titulo_diagrama='Extrair só o texto perde a informação que o layout carregava',
        problema='O manual técnico tem o diagrama que explica a montagem, a tabela de '
                 'torque e o texto de advertência — e a resposta correta depende dos '
                 'três. Converter o PDF em texto corrido joga fora a tabela e a figura, '
                 'que eram a parte mais informativa.',
        checagem=('Data Automation', 'multimodal', 'modalidade'),
        grupos=[
            ('Documento', 'plain', [
                ('pdf', 'doc', 'PDF com layout', 'texto, tabela e figura'),
            ]),
            ('Extração por modalidade', 'plain', [
                ('bda', 'dataautomation', 'Data Automation', 'separa texto, tabela e imagem'),
                ('tab', 'catalogo', 'Tabela preservada', 'linha e coluna, não texto achatado'),
                ('img', 'rekognition', 'Figura com descrição', 'legenda e referência no texto'),
            ]),
            ('Índice', 'plain', [
                ('kb', 'knowledgebases', 'Knowledge Bases multimodal', 'trecho por modalidade, com a página'),
            ]),
            ('Resposta', 'plain', [
                ('cl', 'claude', 'Claude', 'vê a figura e lê a tabela'),
            ]),
        ],
        arestas=[
            ('pdf', 'bda', 'arquivo com layout'),
            ('bda', 'tab', 'linhas e colunas'),
            ('bda', 'img', 'figura + legenda'),
            ('bda', 'kb', 'texto'),
            ('tab', 'kb', 'tabela indexada como tabela'),
            ('img', 'kb', 'imagem indexada pela legenda'),
            ('kb', 'cl', 'trechos das três modalidades'),
        ],
        passos=[
            ('Tabela achatada em texto perde a relação',
             '"250 300 350" sem cabeçalho não diz a que modelo cada torque pertence. A '
             'estrutura da tabela É o dado; extrair como prosa a destrói.',
             ['tab'], [('bda', 'tab'), ('tab', 'kb')]),
            ('A figura entra como figura, com legenda',
             'O diagrama de montagem responde perguntas que o texto não responde. '
             'Indexar a legenda e a referência permite recuperá-la; enviá-la ao modelo '
             'permite interpretá-la.',
             ['img', 'cl'], [('bda', 'img'), ('img', 'kb')]),
            ('Recuperação por modalidade',
             'A pergunta sobre torque quer a tabela; a de montagem quer a figura. '
             'Recuperar tudo como texto trata as três como iguais e devolve a menos '
             'informativa.',
             ['kb'], [('kb', 'cl')]),
            ('A página viaja com o trecho',
             'Em manual técnico, apontar a página é o que permite ao técnico conferir no '
             'papel que ele tem na bancada.',
             ['kb', 'cl'], [('kb', 'cl')]),
            ('O modelo precisa ser multimodal para isso servir',
             'Extrair a figura e mandar só a legenda é meio caminho. O ganho aparece '
             'quando o modelo recebe a imagem e responde sobre o que está desenhado.',
             ['cl'], [('kb', 'cl')]),
        ],
        legenda='Layout é informação. Documento técnico convertido em texto corrido perde '
                'a tabela e a figura, que costumam ser a parte que responde — e nenhum '
                'ajuste de modelo recupera o que a ingestão jogou fora.',
    ),
    Sol(
        n=19,
        titulo='19. Fila de documentos com pico sazonal',
        titulo_diagrama='Nivelar com fila protege o limite de taxa; a alternativa é falhar no pico',
        problema='No fim do mês o volume de documentos multiplica por dez. Chamar o '
                 'modelo direto da função que recebe o arquivo funciona no dia normal e '
                 'produz uma parede de erro de limite de taxa no dia de pico — justamente '
                 'quando o processo importa mais.',
        checagem=('SQS', 'concorrência reservada', 'lote'),
        grupos=[
            ('Chegada', 'plain', [
                ('s3', 's3', 'S3', 'pico de dez vezes'),
                ('fila', 'sqs', 'SQS', 'absorve o pico, com fila de descarte'),
            ]),
            ('Consumo controlado', 'vpc', [
                ('fn', 'lambda', 'Lambda', 'concorrência reservada = teto de chamadas'),
                ('br', 'bedrock', 'Bedrock', 'sob demanda para o urgente'),
                ('lote', 'lote', 'Inferência em lote', 'para o que pode esperar'),
            ]),
            ('Destino e sinal', 'plain', [
                ('db', 'dynamodb', 'Resultado', 'com a marca de qual caminho processou'),
                ('cw', 'cloudwatch', 'CloudWatch', 'idade da mensagem mais antiga'),
            ]),
        ],
        arestas=[
            ('s3', 'fila', 'um evento por documento'),
            ('fila', 'fn', 'no ritmo do consumo'),
            ('fn', 'br', 'urgente'),
            ('fn', 'lote', 'pode esperar'),
            ('br', 'db', 'resultado do urgente'),
            ('lote', 'db', 'resultado do que esperou'),
            ('fila', 'cw', 'idade da fila', 'dashed'),
        ],
        passos=[
            ('A fila transforma erro em espera',
             'Sem ela, o pico devolve erro de limite de taxa ao usuário. Com ela, o pico '
             'devolve resultado mais tarde — que é degradação aceitável, não falha.',
             ['fila'], [('s3', 'fila'), ('fila', 'fn')]),
            ('A concorrência reservada é o teto real',
             'É o número que impede a função de escalar além do que a cota do modelo '
             'aceita. Sem ele, o auto-escalonamento da função ataca o próprio limite de '
             'taxa.',
             ['fn'], [('fila', 'fn')]),
            ('Separar o urgente do que pode esperar',
             'Nem todo documento tem prazo. Mandar o que espera para lote libera a cota '
             'sob demanda para o que tem gente aguardando — e custa metade.',
             ['br', 'lote'], [('fn', 'br'), ('fn', 'lote')]),
            ('A idade da fila é o alarme certo',
             'Tamanho da fila oscila normalmente. Idade da mensagem mais antiga crescendo '
             'é o sinal de que a capacidade de consumo não dá conta.',
             ['cw'], [('fila', 'cw')]),
            ('Fila de descarte, porque documento ruim existe',
             'PDF corrompido tenta, falha, volta e tenta de novo, para sempre. Sem '
             'destino de descarte, uma mensagem envenenada consome a capacidade do pico.',
             ['fila', 'db'], [('br', 'db')]),
        ],
        legenda='Pico não se resolve com mais capacidade: resolve-se desacoplando. A fila '
                'converte falha em latência, e a concorrência reservada é o que garante '
                'que o consumo respeite a cota do modelo.',
    ),
    Sol(
        n=20,
        titulo='20. Rastro exigido por auditoria em extração automática',
        titulo_diagrama='Auditoria não pergunta o acerto médio: pergunta como AQUELE número foi obtido',
        problema='O time apresenta 96% de acurácia e a auditoria pergunta por que o campo '
                 'de valor daquele contrato específico ficou com R$ 12.400. A métrica '
                 'agregada não responde, e sem registro por extração a resposta é "não '
                 'temos como saber".',
        checagem=('versão do modelo', 'confiança', 'CloudTrail'),
        grupos=[
            ('Extração', 'plain', [
                ('ext', 'dataautomation', 'Extração', 'campo com posição conhecida, com confiança'),
                ('cl', 'claude', 'Claude', 'campo interpretativo'),
            ]),
            ('Registro por extração', 'plain', [
                ('reg', 'dynamodb', 'Registro', 'versão, entrada, saída, confiança, ator'),
                ('s3', 's3', 'Documento original', 'imutável, com soma de verificação'),
            ]),
            ('Governança', 'account', [
                ('tr', 'cloudtrail', 'CloudTrail', 'quem leu e quem alterou'),
                ('ret', 'politica', 'Política de retenção', 'quanto tempo, decidido antes'),
            ]),
        ],
        arestas=[
            ('ext', 'reg', 'grava o traço'),
            ('cl', 'reg', 'saída + confiança'),
            ('s3', 'ext', 'insumo com soma de verificação'),
            ('reg', 's3', 'aponta o original', 'dashed'),
            ('reg', 'tr', 'quem leu e quem alterou'),
            ('ret', 'reg', 'expira o que venceu', 'dashed'),
        ],
        passos=[
            ('O registro é por extração, não por lote',
             'A pergunta da auditoria é sobre um caso. Registro agregado por execução não '
             'reconstitui um campo específico de um documento específico.',
             ['reg'], [('ext', 'reg'), ('cl', 'reg')]),
            ('A versão do modelo é parte do traço',
             'O fornecedor atualiza o modelo; o comportamento muda. Sem a versão '
             'registrada, não há como explicar por que o mesmo documento daria outro '
             'resultado hoje.',
             ['reg', 'cl'], [('cl', 'reg')]),
            ('A confiança precisa estar lá',
             'É ela que distingue "extraiu com 0,99" de "interpretou com 0,62". Sem esse '
             'número, todo campo parece ter a mesma solidez.',
             ['reg'], [('ext', 'reg')]),
            ('O original é imutável e endereçável',
             'O traço aponta para o documento como ele chegou, com soma de verificação. '
             'Reconstituir sem o insumo original é opinião.',
             ['s3'], [('s3', 'ext'), ('reg', 's3')]),
            ('A retenção é decidida antes, não depois',
             'Guardar para sempre é custo e risco; guardar de menos é não ter resposta. O '
             'prazo sai da exigência aplicável e entra como política, não como esquecimento.',
             ['ret', 'tr'], [('ret', 'reg')]),
        ],
        legenda='Métrica agregada responde "funciona?"; auditoria pergunta "como este '
                'número apareceu?". São perguntas diferentes, e só a segunda exige '
                'registro por extração, com versão, confiança e insumo original.',
    ),
]

PERGUNTAS = [
    ('Como extrair dados de PDF com IA na AWS?',
     'O caminho de produção é orientado a evento, com extração especializada antes do '
     'modelo: o arquivo chega ao S3, o EventBridge dispara a função, e o Textract ou o '
     'Bedrock Data Automation resolvem os campos de posição conhecida devolvendo '
     'confiança numérica. O modelo de linguagem entra apenas nos campos que exigem '
     'interpretação, como observação em prosa e divergência entre documentos. Ler o '
     'documento inteiro com modelo grande custa mais, é mais lento e não entrega '
     'confiança por campo.'),
    ('Quando usar revisão humana em extração automática de documentos?',
     'Quando a confiança do campo fica abaixo do limiar definido para aquele campo — e o '
     'limiar é por campo, não agregado. O campo que alimenta decisão financeira, como o '
     'valor a indenizar, exige limiar alto; o campo informativo tolera bem menos. Limiar '
     'único produz o pior dos dois mundos: revisa manualmente o que era barato de errar e '
     'automatiza justamente o que custa caro. A revisão também é parcial: o analista '
     'confere os campos duvidosos, não o documento inteiro.'),
    ('Por que a prova de conceito de extração de documentos não vai para produção?',
     'Na maioria dos casos porque falta o caminho auditável até o sistema de registro, e '
     'não porque a acurácia seja insuficiente. Gravar no ERP exige adaptador que valide o '
     'argumento, chave de idempotência para reprocessamento não duplicar lançamento, e '
     'registro por extração com versão do modelo, entrada, saída e confiança. Times '
     'passam meses subindo a acurácia de 94% para 96% enquanto o bloqueio real era '
     'integração e rastreabilidade.'),
]

QUIZZES = [
    quiz('Num fluxo de extração de nota fiscal padronizada, qual a ordem correta e por quê?',
         ['Modelo de linguagem lê o documento inteiro; extração especializada só se ele falhar',
          'Extração especializada resolve os campos de posição conhecida; o modelo lê o que exige interpretação',
          'As duas em paralelo, comparando os resultados campo a campo',
          'Só o modelo, porque manter dois serviços dobra a complexidade'],
         1,
         'Campo com posição conhecida sai da extração especializada mais barato, mais '
         'rápido e com confiança numérica por campo — que é o número que decide revisão '
         'humana. A primeira opção é o desperdício clássico: paga geração para ler um '
         'formulário. Rodar as duas em paralelo dobra o custo em todo documento para '
         'ganhar comparação apenas onde há divergência, e ainda deixa sem resposta o que '
         'fazer quando divergem. A quarta troca complexidade de arquitetura por custo '
         'recorrente e perde a confiança por campo, sem a qual o limiar de revisão não '
         'existe.'),
    quiz('A auditoria pergunta por que um campo específico foi extraído com determinado '
         'valor há seis meses. O que responde?',
         ['A métrica de acurácia agregada do período, que estava em 96%',
          'O registro daquela extração: versão do modelo, entrada, saída, confiança e ator',
          'O relatório de execução do lote em que o documento foi processado',
          'A revisão humana por amostragem feita naquele mês'],
         1,
         'A pergunta é sobre um caso, e só registro por extração reconstitui um caso. A '
         'acurácia agregada responde "o sistema funciona?", que é outra pergunta — e '
         '96% de acerto não diz nada sobre o documento em questão. O relatório de lote '
         'identifica a execução, mas não a entrada, a saída nem a confiança daquele campo. '
         'Amostragem cobre uma fração: a chance de o documento questionado estar nela é '
         'pequena, e a auditoria não aceita "provavelmente conferimos".'),
    quiz('Documento jurídico está sendo recuperado em pedaços que mencionam o tema sem '
         'ser a cláusula. Qual mudança rende mais?',
         ['Trocar o modelo de embedding por um de dimensão maior',
          'Aumentar o número de trechos recuperados de 5 para 20',
          'Cortar por cláusula, levando o cabeçalho da seção no trecho',
          'Usar um modelo de geração maior para interpretar melhor os trechos'],
         2,
         'O defeito está na ingestão: corte fixo separa o título da cláusula do corpo, e '
         'nenhuma etapa posterior recupera o que foi partido errado. Embedding de dimensão '
         'maior representa melhor o pedaço errado. Recuperar mais trechos aumenta a chance '
         'de o certo aparecer e enche o contexto de ruído, o que costuma piorar a resposta. '
         'Modelo de geração maior interpreta melhor um contexto que continua não contendo '
         'a cláusula inteira — não há como interpretar o que não foi recuperado.'),
]
