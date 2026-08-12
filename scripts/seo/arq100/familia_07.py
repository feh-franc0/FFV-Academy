#!/usr/bin/env python3
"""Família 7 — Conteúdo, mídia e personalização (soluções 61 a 70)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-conteudo'
NOME = 'Conteúdo, mídia e personalização'

ABERTURA = [
    p('Esta família tem a maior variedade de serviços — e um padrão que se repete em '
      'quase todas as dez: **serviço especializado para o determinístico, modelo de '
      'linguagem para o ambíguo**. Transcrição, tradução, moderação de imagem e '
      'recomendação são tarefas com serviço próprio, mais barato e mais previsível. O '
      'modelo generalista entra onde a decisão é de julgamento.'),
    p('O segundo padrão é o **lote**. Acervo de vídeo, catálogo de produto e biblioteca de '
      'documento não têm ninguém esperando, e é justamente onde o volume é maior — o que '
      'faz da janela de entrega a decisão de custo mais relevante da família. Onde há '
      'alguém esperando, como em voz sintética, tudo muda: aí o que conta é o tempo até o '
      'primeiro som e o cache da frase fixa.'),
]

SOLUCOES = [
    Sol(
        n=61,
        titulo='61. Narrativa de evento ao vivo com dado em tempo real',
        titulo_diagrama='Em tempo real, o gargalo é o dado chegar pronto — não o modelo gerar',
        problema='A narração automática de um evento esportivo precisa comentar a '
                 'ultrapassagem no momento em que ela acontece. A geração do texto leva '
                 'menos de um segundo; o dado de telemetria chegar consolidado e confiável '
                 'leva mais — e é onde o atraso percebido nasce.',
        checagem=('Fluxo de dado', 'AgentCore', 'transmissão'),
        grupos=[
            ('Fluxo de dado', 'plain', [
                ('kin', 'kinesis', 'Fluxo de telemetria', 'eventos por segundo'),
                ('jan', 'relogio', 'Janela de agregação', 'o compromisso entre frescor e sentido'),
            ]),
            ('Decisão editorial', 'plain', [
                ('ac', 'agentcore', 'Agente narrador', 'decide o que MERECE comentário'),
                ('ctx', 'contexto', 'Histórico do evento', 'o que já foi narrado'),
            ]),
            ('Saída', 'plain', [
                ('cl', 'claude', 'Claude em fluxo', 'primeiros tokens já saem'),
                ('bc', 'broadcast', 'Transmissão', 'o texto sai falado, ao vivo'),
            ]),
        ],
        arestas=[
            ('kin', 'jan', 'eventos por segundo'),
            ('jan', 'ac', 'fato consolidado'),
            ('ctx', 'ac', 'evita repetir'),
            ('ac', 'cl', 'o que narrar'),
            ('cl', 'bc', 'texto em fluxo'),
            ('cl', 'ctx', 'registra o que narrou'),
        ],
        passos=[
            ('A janela de agregação é a decisão central',
             'Curta demais narra ruído; longa demais narra tarde. Esse número — não o modelo '
             '— define a qualidade percebida da narração.',
             ['jan'], [('kin', 'jan'), ('jan', 'ac')]),
            ('Escolher o que merece comentário',
             'Narrar todo evento é ruído. O agente filtra por relevância editorial, e é '
             'esse filtro que separa narração de despejo de dados.',
             ['ac'], [('jan', 'ac'), ('ac', 'cl')]),
            ('O histórico impede a repetição',
             'Sem memória do que já foi dito, a narração repete o mesmo fato a cada janela. '
             'É o defeito mais perceptível para quem assiste.',
             ['ctx'], [('ctx', 'ac'), ('cl', 'ctx')]),
            ('Geração em fluxo, porque o texto sai falado',
             'Esperar o parágrafo completo soma latência de geração e de síntese. Em fluxo, '
             'a primeira frase já está no ar.',
             ['cl', 'bc'], [('cl', 'bc')]),
            ('O gargalo é a consolidação, não a inferência',
             'Otimizar o modelo quando o atraso vem da janela de dados é otimizar a parte '
             'errada — e é o erro comum neste desenho.',
             ['kin', 'jan'], [('kin', 'jan')]),
        ],
        legenda='Em tempo real, o atraso percebido nasce na consolidação do dado e na '
                'janela de agregação — não na geração. E o filtro editorial do que merece '
                'comentário é o que separa narração de despejo de telemetria.',
    ),
    Sol(
        n=62,
        titulo='62. Modelo visual de fronteira que exige treino próprio',
        titulo_diagrama='Treino de fronteira é problema de infraestrutura: falha de nó é rotina',
        problema='Treinar um modelo visual próprio em centenas de aceleradores por semanas '
                 'não falha por matemática: falha por hardware. Um nó cai no terceiro dia, '
                 'e sem retomada isso significa recomeçar — perdendo dias de computação '
                 'que já foram pagos.',
        checagem=('HyperPod', 'distribuído', 'resiliência'),
        grupos=[
            ('Cluster de treino', 'plain', [
                ('hp', 'sagemaker', 'SageMaker HyperPod', 'substitui nó defeituoso e retoma'),
                ('gpu', 'chip', 'Aceleradores', 'centenas, por semanas'),
            ]),
            ('Estado do treino', 'vpc', [
                ('ck', 'checkpoint', 'Ponto de retomada', 'frequência = quanto se aceita perder'),
                ('fs', 'efs', 'Sistema de arquivos', 'dado e pontos de retomada'),
            ]),
            ('Dado e medida', 'plain', [
                ('s3', 's3', 'Conjunto de treino', 'lido de novo a cada época de treino'),
                ('mt', 'metrica', 'Curva de perda', 'divergência precisa ser vista cedo'),
            ]),
        ],
        arestas=[
            ('s3', 'fs', 'carrega'),
            ('fs', 'gpu', 'lote de treino'),
            ('hp', 'gpu', 'orquestra e substitui'),
            ('gpu', 'ck', 'grava periodicamente'),
            ('ck', 'fs', 'estado gravado'),
            ('hp', 'ck', 'retoma do último'),
            ('gpu', 'mt', 'perda por passo', 'dashed'),
        ],
        passos=[
            ('Falha de nó é rotina, não exceção',
             'Em centenas de aceleradores por semanas, a probabilidade de nenhum falhar é '
             'baixa. O desenho parte disso — não da esperança de que não aconteça.',
             ['hp', 'gpu'], [('hp', 'gpu')]),
            ('A frequência do ponto de retomada é uma troca',
             'Gravar mais custa tempo de treino; gravar menos custa mais quando falha. O '
             'número sai da taxa de falha observada.',
             ['ck'], [('gpu', 'ck'), ('hp', 'ck')]),
            ('Retomar é o requisito, não reiniciar',
             'Reiniciar joga fora dias já pagos. Retomada automática é o que torna o custo '
             'previsível.',
             ['hp', 'ck'], [('hp', 'ck')]),
            ('O sistema de arquivos precisa alimentar todos os nós',
             'Se a leitura do dado não acompanha, os aceleradores ficam ociosos — e ocioso '
             'custa o mesmo que trabalhando.',
             ['fs'], [('s3', 'fs'), ('fs', 'gpu')]),
            ('Ver a divergência cedo economiza semanas',
             'Curva de perda subindo no segundo dia é sinal de parar e corrigir. Descobrir '
             'no fim é jogar a execução inteira fora.',
             ['mt'], [('gpu', 'mt')]),
        ],
        legenda='Treinar modelo de fronteira é engenharia de infraestrutura: falha de nó é '
                'rotina, e retomada automática é o que faz o custo ser previsível. Treinar '
                'do zero é a exceção — só se justifica quando o dado é o diferencial.',
    ),
    Sol(
        n=63,
        titulo='63. Personalização de comunicação em escala',
        titulo_diagrama='Recomendação e redação são problemas diferentes — um escolhe, o outro escreve',
        problema='A campanha precisa recomendar o produto certo e escrever a mensagem com '
                 'o tom da marca. Usar o modelo de linguagem para as duas coisas produz '
                 'recomendação fraca, porque escolher item a partir de comportamento é '
                 'tarefa de outro tipo de modelo.',
        checagem=('Personalize', 'marca', 'tom'),
        grupos=[
            ('O quê — escolha', 'plain', [
                ('ev', 'kinesis', 'Eventos de interação', 'clique, compra, visualização'),
                ('pz', 'personalize', 'Personalize', 'escolhe o item por comportamento'),
            ]),
            ('O como — redação', 'plain', [
                ('mk', 'prompt', 'Guia de marca', 'tom, proibições, exemplos'),
                ('cl', 'claude', 'Claude', 'escreve sobre o item escolhido'),
                ('gr', 'guardrails', 'Guardrails', 'promessa indevida não sai'),
            ]),
            ('Entrega', 'plain', [
                ('ses', 'ses', 'Envio', 'entrega com a variante marcada'),
                ('ab', 'metrica', 'Teste A/B', 'mede conversão, não preferência interna'),
            ]),
        ],
        arestas=[
            ('ev', 'pz', 'clique, compra, visualização'),
            ('pz', 'cl', 'item recomendado'),
            ('mk', 'cl', 'tom e proibições'),
            ('cl', 'gr', 'texto gerado'),
            ('gr', 'ses', 'texto aprovado'),
            ('ses', 'ab', 'variante enviada'),
            ('ab', 'pz', 'realimenta', 'dashed'),
        ],
        passos=[
            ('Escolher item é tarefa de modelo de recomendação',
             'Ele aprende de comportamento agregado e de sinal implícito. Pedir isso ao '
             'modelo de linguagem produz escolha baseada em texto, não em comportamento.',
             ['pz', 'ev'], [('ev', 'pz')]),
            ('Escrever é tarefa do modelo de linguagem',
             'Aqui ele é imbatível: adapta tom, tamanho e contexto para o item já escolhido.',
             ['cl'], [('pz', 'cl'), ('mk', 'cl')]),
            ('Guia de marca no contexto, não no espírito',
             'Tom, proibições e exemplos entram como material. "Escreva no tom da marca" '
             'sem o guia é instrução sem referência.',
             ['mk'], [('mk', 'cl')]),
            ('Barreira contra promessa indevida',
             'Em comunicação comercial, prometer desconto ou prazo que não existe tem '
             'consequência legal. Esse filtro não é opcional.',
             ['gr'], [('cl', 'gr'), ('gr', 'ses')]),
            ('A medida é conversão, e ela realimenta a escolha',
             'O teste compara variantes no que importa. E o resultado volta como sinal para '
             'o modelo de recomendação.',
             ['ab'], [('ses', 'ab'), ('ab', 'pz')]),
        ],
        legenda='Dois modelos, dois papéis: um escolhe o item a partir de comportamento, o '
                'outro escreve sobre o item escolhido. Juntar os dois papéis num modelo só '
                'degrada a escolha, que é a metade que gera receita.',
    ),
    Sol(
        n=64,
        titulo='64. Moderação de conteúdo gerado por usuário',
        titulo_diagrama='Serviço especializado é mais barato e determinístico; o modelo entra no ambíguo',
        problema='Milhões de imagens e comentários por dia, e a moderação precisa ser '
                 'barata, rápida e defensável. Mandar tudo para um modelo generalista é '
                 'caro e não determinístico — o mesmo conteúdo pode ser aprovado hoje e '
                 'recusado amanhã.',
        checagem=('Rekognition', 'Guardrails'),
        grupos=[
            ('Primeira camada — determinística', 'plain', [
                ('rk', 'rekognition', 'Rekognition', 'imagem: categorias com nota'),
                ('cp', 'comprehend', 'Comprehend', 'texto: toxicidade e entidade'),
            ]),
            ('Segunda camada — ambíguo', 'plain', [
                ('gr', 'guardrails', 'Guardrails', 'política escrita, aplicada'),
                ('cl', 'claude', 'Claude', 'contexto e ironia'),
            ]),
            ('Decisão', 'plain', [
                ('reg', 'politica', 'Faixas de decisão', 'aprova · revisa · recusa'),
                ('hum', 'a2i', 'Moderador humano', 'a faixa do meio'),
                ('ap', 'audit', 'Registro de recurso', 'usuário contesta com base'),
            ]),
        ],
        arestas=[
            ('rk', 'reg', 'nota'),
            ('cp', 'reg', 'nota'),
            ('reg', 'cl', 'faixa ambígua'),
            ('cl', 'gr', 'julgamento do caso ambíguo'),
            ('gr', 'reg', 'classificação final'),
            ('reg', 'hum', 'meio'),
            ('reg', 'ap', 'decisão + nota'),
        ],
        passos=[
            ('O determinístico resolve as pontas',
             'Conteúdo claramente aceitável e claramente proibido saem da primeira camada, '
             'barato e reproduzível. É a maior parte do volume.',
             ['rk', 'cp'], [('rk', 'reg'), ('cp', 'reg')]),
            ('O modelo entra só na faixa do meio',
             'Ironia, contexto cultural e sátira. É onde a nota numérica não decide — e é '
             'uma fração pequena do volume total.',
             ['cl'], [('reg', 'cl'), ('cl', 'gr')]),
            ('Faixas explícitas, não limiar único',
             'Três faixas: aprova, revisa, recusa. Com uma linha só, todo caso duvidoso cai '
             'para um dos lados sem revisão.',
             ['reg'], [('gr', 'reg')]),
            ('Reprodutibilidade é requisito de defesa',
             'Quando o usuário contesta, a plataforma precisa explicar. Nota de serviço '
             'especializado é reproduzível; geração livre não é.',
             ['ap'], [('reg', 'ap')]),
            ('O humano fica com o meio, não com tudo',
             'É o que faz a moderação caber no orçamento. Revisar tudo é a decisão que '
             'inviabiliza a operação.',
             ['hum'], [('reg', 'hum')]),
        ],
        legenda='Moderação em volume é arquitetura em camadas: serviço especializado resolve '
                'as pontas de forma barata e reproduzível, o modelo trata a faixa ambígua e '
                'o humano fica com o meio. Reprodutibilidade é requisito, porque o usuário '
                'contesta.',
    ),
    Sol(
        n=65,
        titulo='65. Legenda e transcrição de acervo de vídeo',
        titulo_diagrama='Acervo grande é caso de lote: latência não importa e o desconto é grande',
        problema='Dez mil horas de vídeo sem legenda, sem capítulo e sem resumo — o que '
                 'torna o acervo inteiro praticamente inacessível. Nada disso é urgente '
                 'para nenhum vídeo específico, e essa é a informação que define a '
                 'arquitetura.',
        checagem=('Transcribe', 'lote', 'capítulo'),
        grupos=[
            ('Acervo', 'plain', [
                ('s3', 's3', 'S3 — vídeo', '10 mil horas'),
                ('sf', 'stepfunctions', 'Step Functions', 'um fluxo por vídeo, retomável'),
            ]),
            ('Transcrição', 'plain', [
                ('tr', 'transcribe', 'Transcribe em lote', 'com marca de tempo e falante'),
            ]),
            ('Enriquecimento', 'plain', [
                ('lote', 'lote', 'Bedrock em lote', 'resumo, capítulo, palavras-chave'),
                ('cl', 'claude', 'Claude', 'resumo, capítulo e palavra-chave'),
            ]),
            ('Saída', 'vpc', [
                ('out', 's3', 'Legenda + metadado', 'formato padrão de legenda'),
                ('idx', 'opensearch', 'Índice de busca', 'com o minuto'),
            ]),
        ],
        arestas=[
            ('s3', 'sf', 'dez mil horas'),
            ('sf', 'tr', 'um vídeo por execução'),
            ('tr', 'lote', 'transcrição'),
            ('lote', 'cl', 'transcrição com tempo'),
            ('cl', 'out', 'resumo e capítulos'),
            ('tr', 'out', 'legenda'),
            ('out', 'idx', 'trechos com o minuto'),
        ],
        passos=[
            ('Ninguém espera por um vídeo específico',
             'É o que autoriza o lote nas duas etapas — transcrição e enriquecimento. O '
             'desconto é o que torna dez mil horas viável.',
             ['tr', 'lote'], [('tr', 'lote')]),
            ('Marca de tempo desde a transcrição',
             'Sem ela, o resumo não pode apontar o minuto — e a busca dentro do vídeo, que '
             'é o produto final, não existe.',
             ['tr'], [('sf', 'tr')]),
            ('Um fluxo por vídeo, retomável',
             'Dez mil execuções vão ter falhas. Isolar por vídeo é o que permite '
             'reprocessar só o que falhou.',
             ['sf'], [('s3', 'sf'), ('sf', 'tr')]),
            ('Capítulo é o metadado que mais gera uso',
             'Mais que o resumo: permite pular para a parte relevante. É o que transforma '
             'acervo em conteúdo consultável.',
             ['cl', 'out'], [('lote', 'cl'), ('cl', 'out')]),
            ('Formato padrão de legenda, não texto próprio',
             'Legenda em formato padrão é aceita por qualquer reprodutor. Formato próprio '
             'exige um segundo projeto para ser útil.',
             ['out', 'idx'], [('out', 'idx')]),
        ],
        legenda='Acervo grande sem ninguém esperando é o caso canônico de lote nas duas '
                'etapas. E a marca de tempo desde a transcrição é o que habilita o produto '
                'final: buscar dentro do vídeo e pular para o minuto.',
    ),
    Sol(
        n=66,
        titulo='66. Tradução com terminologia de marca',
        titulo_diagrama='Glossário resolve terminologia melhor que instrução: ele é determinístico',
        problema='A tradução automática traduz o nome do produto, converte o termo técnico '
                 'para um sinônimo popular e troca o tratamento formal por informal. Pedir '
                 'ao modelo que não faça isso funciona na maior parte das vezes — e "a '
                 'maior parte" não serve para nome de marca.',
        checagem=('Translate', 'glossário', 'tom'),
        grupos=[
            ('Terminologia', 'plain', [
                ('gls', 'catalogo', 'Glossário', 'não traduzir, traduzir assim'),
                ('tr', 'translate', 'Translate', 'aplica o glossário sempre'),
            ]),
            ('Tom', 'plain', [
                ('cl', 'claude', 'Claude', 'revisa registro e naturalidade'),
                ('guia', 'prompt', 'Guia de estilo', 'por idioma e por mercado'),
            ]),
            ('Controle', 'plain', [
                ('dif', 'eval', 'Verificação de termo', 'o termo proibido apareceu?'),
                ('hum', 'a2i', 'Revisão humana', 'só material de alta exposição'),
            ]),
        ],
        arestas=[
            ('gls', 'tr', 'termos a preservar'),
            ('tr', 'cl', 'tradução base'),
            ('guia', 'cl', 'registro por mercado'),
            ('cl', 'dif', 'texto revisado'),
            ('dif', 'hum', 'violação de termo'),
            ('dif', 'tr', 'aprovado', 'dashed'),
        ],
        passos=[
            ('Determinístico vence probabilístico em terminologia',
             'O glossário aplica a regra em 100% das ocorrências. A instrução no prompt '
             'aplica na maioria — e nome de marca não tolera maioria.',
             ['gls', 'tr'], [('gls', 'tr')]),
            ('Traduzir primeiro, ajustar tom depois',
             'A ordem importa: o modelo revisando uma tradução é mais barato e mais estável '
             'que o modelo traduzindo do zero.',
             ['tr', 'cl'], [('tr', 'cl')]),
            ('Guia por mercado, não por idioma',
             'Português de Portugal e do Brasil têm registro diferente. Tratar como um só '
             'produz texto que soa estrangeiro nos dois.',
             ['guia'], [('guia', 'cl')]),
            ('Verificar o termo depois da revisão',
             'O modelo pode "melhorar" o texto e desfazer o glossário. A verificação final é '
             'o que garante que o termo sobreviveu.',
             ['dif'], [('cl', 'dif')]),
            ('Revisão humana por exposição',
             'Página inicial e contrato, sim; ajuda interna, não. O critério é consequência '
             'do erro, não volume de texto.',
             ['hum'], [('dif', 'hum')]),
        ],
        legenda='Terminologia se resolve com glossário determinístico, não com instrução — '
                'e a verificação final existe porque o passo de revisão de tom pode desfazer '
                'o glossário sem avisar.',
    ),
    Sol(
        n=67,
        titulo='67. Geração de imagem com identidade de marca',
        titulo_diagrama='Condicionamento controla uma geração; adaptador ensina estilo de forma persistente',
        problema='As imagens geradas são boas e não parecem da marca: paleta errada, '
                 'enquadramento aleatório, iluminação inconsistente. Descrever o estilo no '
                 'texto ajuda pouco e não repete — cada geração interpreta a descrição de '
                 'novo.',
        checagem=('condicionamento espacial', 'adaptador de estilo'),
        grupos=[
            ('Estilo persistente', 'plain', [
                ('ds', 'dataset', 'Acervo da marca', 'imagens aprovadas'),
                ('ad', 'sagemaker', 'Adaptador de estilo', 'treinado uma vez, usado sempre'),
            ]),
            ('Controle por geração', 'plain', [
                ('cond', 'doc', 'Condicionamento espacial', 'esboço, profundidade ou pose'),
                ('br', 'bedrock', 'Modelo de imagem', 'gera sob estilo e estrutura declarados'),
            ]),
            ('Aprovação', 'plain', [
                ('gr', 'guardrails', 'Barreira de conteúdo', 'antes de qualquer aprovação humana'),
                ('rev', 'a2i', 'Aprovação de marca', 'antes de publicar'),
                ('s3', 's3', 'Biblioteca aprovada', 'realimenta o acervo'),
            ]),
        ],
        arestas=[
            ('ds', 'ad', 'treino'),
            ('ad', 'br', 'estilo'),
            ('cond', 'br', 'estrutura'),
            ('br', 'gr', 'imagem gerada'),
            ('gr', 'rev', 'passou no filtro'),
            ('rev', 's3', 'aprovada'),
            ('s3', 'ds', 'volta ao acervo', 'dashed'),
        ],
        passos=[
            ('Duas alavancas diferentes',
             'Condicionamento controla a estrutura de UMA geração. Adaptador ensina estilo '
             'para TODAS. Confundir as duas é pedir consistência ao mecanismo errado.',
             ['cond', 'ad'], [('cond', 'br'), ('ad', 'br')]),
            ('Estilo se treina com o acervo aprovado',
             'As imagens que a marca já aprovou são o material. Descrever o estilo em '
             'palavras é sempre uma aproximação do que as imagens mostram.',
             ['ds', 'ad'], [('ds', 'ad')]),
            ('Condicionamento para enquadramento',
             'Esboço ou mapa de profundidade fixa composição e posição. É o que garante que '
             'o produto apareça no lugar certo, não parecido.',
             ['cond'], [('cond', 'br')]),
            ('Aprovação humana antes de publicar',
             'Imagem de marca em canal público é irreversível na prática. A aprovação é '
             'barata comparada à retratação.',
             ['rev'], [('gr', 'rev'), ('rev', 's3')]),
            ('O aprovado realimenta o acervo',
             'Cada aprovação melhora o material do adaptador. É o laço que faz a '
             'consistência crescer com o uso.',
             ['s3', 'ds'], [('s3', 'ds')]),
        ],
        legenda='Consistência visual vem do adaptador treinado no acervo aprovado; controle '
                'de composição vem do condicionamento espacial. Descrição em texto não '
                'entrega nenhuma das duas de forma repetível.',
    ),
    Sol(
        n=68,
        titulo='68. Resumo de reunião com ação atribuída',
        titulo_diagrama='Saída que alimenta código exige schema — sem ele, o tratamento quebra em produção',
        problema='O resumo da reunião precisa virar tarefa no sistema de gestão, com '
                 'responsável e prazo. O modelo produz um texto ótimo, e o código que tenta '
                 'extrair "responsável" desse texto quebra na primeira reunião em que '
                 'alguém disse "eu cuido disso".',
        checagem=('Chime SDK', 'Transcribe', 'schema'),
        grupos=[
            ('Captura', 'plain', [
                ('ch', 'chime', 'Chime SDK', 'áudio da reunião'),
                ('tr', 'transcribe', 'Transcribe', 'com identificação de falante'),
            ]),
            ('Extração estruturada', 'plain', [
                ('cl', 'claude', 'Claude', 'saída conforme schema'),
                ('sch', 'catalogo', 'Schema', 'ação, responsável, prazo, confiança'),
            ]),
            ('Destino', 'vpc', [
                ('val', 'lambda', 'Validação', 'responsável existe? prazo é data?'),
                ('tk', 'erp', 'Sistema de tarefas', 'tarefa criada errada ocupa a fila de alguém'),
                ('rev', 'a2i', 'Confirmação', 'só o que não resolveu'),
            ]),
        ],
        arestas=[
            ('ch', 'tr', 'áudio da reunião'),
            ('tr', 'cl', 'transcrição com falante'),
            ('sch', 'cl', 'formato obrigatório'),
            ('cl', 'val', 'ações no schema'),
            ('val', 'tk', 'resolvido'),
            ('val', 'rev', 'ambíguo'),
            ('rev', 'tk', 'confirmado pelo responsável'),
        ],
        passos=[
            ('Schema, não prosa, quando o consumidor é código',
             'Saída estruturada elimina a extração por expressão regular — que é onde o '
             'tratamento quebra em produção.',
             ['sch', 'cl'], [('sch', 'cl')]),
            ('Identificação de falante é o que permite atribuir',
             '"Eu cuido disso" só vira responsável se souber quem falou. Sem isso, a '
             'atribuição é chute.',
             ['tr'], [('ch', 'tr'), ('tr', 'cl')]),
            ('Validar contra o mundo real',
             'Responsável tem de existir no diretório; prazo tem de ser data válida. O '
             'schema garante a forma, não a verdade.',
             ['val'], [('cl', 'val')]),
            ('Confiança por item, não pelo resumo',
             'Algumas ações são explícitas, outras inferidas de "seria bom se alguém…". '
             'Marcar isso é o que permite confirmar só o incerto.',
             ['rev'], [('val', 'rev'), ('rev', 'tk')]),
            ('Tarefa criada errada é pior que tarefa não criada',
             'Ela ocupa a fila de alguém e gera desconfiança no sistema todo. Por isso o '
             'ambíguo passa por confirmação.',
             ['tk', 'val'], [('val', 'tk')]),
        ],
        legenda='Quando o consumidor da saída é código, o schema é obrigatório — e a '
                'validação contra o diretório e o calendário é o que separa forma correta de '
                'conteúdo correto.',
    ),
    Sol(
        n=69,
        titulo='69. Busca dentro de vídeo por conteúdo falado',
        titulo_diagrama='Citação com marca de tempo é o que torna a resposta verificável em mídia',
        problema='O acervo tem a resposta, dita no minuto 47 de uma aula de duas horas — e '
                 'não há como encontrar. Um resumo do vídeo não resolve: quem procura quer '
                 'o trecho, e quer poder assistir para confirmar.',
        checagem=('Transcribe', 'marca de tempo', 'minuto'),
        grupos=[
            ('Ingestão', 'vpc', [
                ('tr', 'transcribe', 'Transcribe', 'palavra a palavra com tempo'),
                ('seg', 'chunker', 'Segmentação por tópico', 'não por duração fixa'),
            ]),
            ('Índice', 'vpc', [
                ('emb', 'embedder', 'Vetorial', 'tema do trecho'),
                ('bm', 'bm25', 'Léxico', 'nome próprio e sigla'),
                ('idx', 'opensearch', 'Índice híbrido', 'com início e fim de cada trecho'),
            ]),
            ('Resposta', 'plain', [
                ('cl', 'claude', 'Claude', 'responde e aponta o minuto'),
                ('pl', 'browser', 'Reprodutor', 'abre no instante citado'),
            ]),
        ],
        arestas=[
            ('tr', 'seg', 'palavras com tempo'),
            ('seg', 'emb', 'trecho por tópico'),
            ('seg', 'bm', 'mesmo trecho, termos'),
            ('emb', 'idx', 'vetor + intervalo'),
            ('bm', 'idx', 'posição + intervalo'),
            ('idx', 'cl', 'trechos + tempo'),
            ('cl', 'pl', 'link com o instante'),
        ],
        passos=[
            ('Segmentar por tópico, não por duração',
             'Cortar a cada cinco minutos parte a explicação no meio. A mudança de assunto '
             'é a fronteira natural do trecho.',
             ['seg'], [('tr', 'seg')]),
            ('O tempo viaja com o trecho até o fim',
             'Início e fim de cada trecho no índice são o que permite montar o link. Perder '
             'isso na ingestão não é recuperável depois.',
             ['idx'], [('emb', 'idx'), ('bm', 'idx')]),
            ('Léxico para nome próprio e sigla',
             'Em aula técnica, quem busca o nome de uma biblioteca quer aquele nome. O vetor '
             'traz o assunto parecido.',
             ['bm'], [('seg', 'bm')]),
            ('A resposta é o link, não o parágrafo',
             'Em mídia, verificar significa assistir. O link com o instante é o produto — o '
             'texto é o resumo do que se vai ver.',
             ['pl', 'cl'], [('cl', 'pl')]),
            ('Transcrição imperfeita ainda serve',
             'Erro de transcrição em palavra rara prejudica, mas o trecho continua '
             'recuperável pelo contexto. Exigir transcrição perfeita antes de indexar '
             'atrasa o produto sem necessidade.',
             ['tr', 'idx'], [('idx', 'cl')]),
        ],
        legenda='Em mídia, a resposta útil é o instante: marca de tempo desde a transcrição, '
                'segmentação por tópico e link que abre no minuto citado. Sem isso, o resumo '
                'não é verificável.',
    ),
    Sol(
        n=70,
        titulo='70. Voz sintética para atendimento em português',
        titulo_diagrama='Frase fixa cacheada elimina a síntese repetida — só o variável é gerado',
        problema='A síntese de voz é boa e o atendimento parece lento. Metade do que o '
                 'sistema fala é sempre igual — saudação, confirmação, espera — e está '
                 'sendo sintetizada de novo em toda ligação, justamente no começo, onde a '
                 'latência mais aparece.',
        checagem=('Polly', 'voz neural', 'cache'),
        grupos=[
            ('Composição da fala', 'vpc', [
                ('spl', 'lambda', 'Divisor de trechos', 'separa fixo de variável'),
                ('cache', 'elasticache', 'Cache de áudio', 'frase fixa já sintetizada'),
            ]),
            ('Síntese', 'plain', [
                ('pol', 'polly', 'Polly neural', 'só a parte variável'),
                ('ssml', 'chars', 'Marcação de prosódia', 'número, sigla e pausa'),
            ]),
            ('Entrega', 'plain', [
                ('mix', 'speaker', 'Montagem do áudio', 'concatena na ordem'),
                ('tel', 'connect', 'Ligação', 'áudio bidirecional, com interrupção'),
            ]),
        ],
        arestas=[
            ('spl', 'cache', 'trecho fixo'),
            ('spl', 'pol', 'trecho variável'),
            ('ssml', 'pol', 'prosódia declarada'),
            ('cache', 'mix', 'áudio pronto'),
            ('pol', 'mix', 'áudio novo'),
            ('mix', 'tel', 'áudio contínuo'),
        ],
        passos=[
            ('Separar fixo de variável é a decisão inteira',
             '"Seu pedido" é fixo; "número 8842" é variável. Sintetizar só o segundo corta a '
             'maior parte do tempo e do custo.',
             ['spl'], [('spl', 'cache'), ('spl', 'pol')]),
            ('O cache atua no começo, onde a latência aparece',
             'A saudação é o primeiro som da ligação. Tê-la pronta é o que elimina o '
             'silêncio inicial que faz o cliente pensar que caiu.',
             ['cache'], [('cache', 'mix')]),
            ('Marcação de prosódia para número e sigla',
             'CPF lido como número inteiro é incompreensível. A marcação é o que controla '
             'agrupamento e pausa — e não é o modelo que decide isso.',
             ['ssml'], [('ssml', 'pol')]),
            ('Concatenar exige voz e ritmo iguais',
             'Trechos com configuração diferente soam como colagem. A mesma voz e a mesma '
             'velocidade em todos os pedaços é requisito.',
             ['mix'], [('pol', 'mix'), ('mix', 'tel')]),
            ('Invalidar o cache quando o texto muda',
             'Frase fixa que muda de redação e continua sendo servida do cache produz '
             'discurso desatualizado. A chave inclui a versão do texto.',
             ['cache', 'spl'], [('spl', 'cache')]),
        ],
        legenda='Em voz, o ganho está em não sintetizar o que é sempre igual — e o efeito '
                'aparece no começo da fala, onde a latência é percebida. A marcação de '
                'prosódia é o que torna número e sigla compreensíveis.',
    ),
]

PERGUNTAS = [
    ('Quando usar serviço de IA especializado em vez do modelo de linguagem?',
     'Sempre que a tarefa tiver serviço próprio e resposta determinística: transcrição, '
     'tradução, moderação de imagem, detecção de entidade e recomendação por comportamento. '
     'Eles são mais baratos, mais rápidos e devolvem nota reproduzível — o que importa '
     'quando o usuário contesta a decisão e a plataforma precisa explicar. O modelo de '
     'linguagem entra na faixa ambígua, onde a nota numérica não decide: ironia, contexto '
     'cultural, explicação de um desvio.'),
    ('Como manter identidade visual consistente em geração de imagem?',
     'Com adaptador de estilo treinado no acervo já aprovado pela marca, e condicionamento '
     'espacial para controlar a composição de cada geração. São duas alavancas diferentes: o '
     'adaptador ensina estilo de forma persistente, para todas as gerações; o '
     'condicionamento fixa estrutura, enquadramento e posição em uma geração específica. '
     'Descrever o estilo em texto não entrega nenhuma das duas de forma repetível, porque '
     'cada geração reinterpreta a descrição.'),
    ('Por que o resumo de reunião deve usar saída estruturada por schema?',
     'Porque o consumidor da saída é código, e código não tolera prosa. Extrair '
     'responsável e prazo de um texto livre com expressão regular quebra na primeira reunião '
     'em que alguém disse "eu cuido disso" em vez do próprio nome. Com schema, o modelo '
     'devolve ação, responsável, prazo e confiança em campos nomeados — e a validação '
     'confere se o responsável existe no diretório e se o prazo é data válida, porque o '
     'schema garante a forma e não a verdade.'),
]

QUIZZES = [
    quiz('Uma tradução automática segue traduzindo o nome do produto apesar da instrução no '
         'prompt. O que resolve de forma confiável?',
         ['Repetir a instrução no início e no fim do prompt',
          'Glossário customizado no serviço de tradução, aplicado em todas as ocorrências',
          'Um modelo maior, com melhor aderência a instruções',
          'Revisão humana de toda a saída antes de publicar'],
         1,
         'O glossário é determinístico: aplica a regra em 100% das ocorrências, sem depender '
         'de o modelo lembrar da instrução naquela chamada. Repetir a instrução aumenta a '
         'aderência e não a garante — e nome de marca não tolera "quase sempre". Modelo maior '
         'melhora a média pelo mesmo mecanismo probabilístico. Revisão humana de tudo resolve '
         'a correção ao custo de eliminar o ganho de escala, e ainda deixa passar erro por '
         'cansaço em texto repetitivo.'),
    quiz('Num agente narrador de evento ao vivo, onde está o gargalo de latência percebida?',
         ['No tempo de geração do texto pelo modelo',
          'Na consolidação do dado e no tamanho da janela de agregação',
          'Na largura de banda da transmissão',
          'No número de tokens do prompt de sistema'],
         1,
         'A geração em fluxo entrega os primeiros tokens em fração de segundo; o que atrasa é '
         'o fato chegar consolidado e confiável, e a janela de agregação é onde essa decisão '
         'mora — curta demais narra ruído, longa demais narra tarde. Otimizar o modelo quando '
         'o atraso vem da janela é otimizar a parte errada. Banda raramente é limitante para '
         'texto. E o prompt de sistema afeta custo por chamada muito mais que a latência '
         'percebida.'),
    quiz('Para buscar dentro de vídeo por conteúdo falado, qual decisão de ingestão é '
         'irrecuperável se for tomada errada?',
         ['Escolher o modelo de embedding do índice vetorial',
          'Não preservar a marca de tempo de início e fim de cada trecho',
          'Definir o número de trechos devolvidos por consulta',
          'Escolher entre índice vetorial e índice léxico'],
         1,
         'Sem marca de tempo, não há como montar o link que abre no minuto citado — e isso não '
         'se recupera depois sem reprocessar o acervo inteiro. O modelo de embedding é caro de '
         'trocar mas é reversível com reindexação, sem perder informação da fonte. O número de '
         'trechos por consulta é parâmetro de tempo de execução. E a escolha entre vetorial e '
         'léxico pode ser corrigida acrescentando o índice que falta, porque a transcrição com '
         'tempo continua disponível.'),
]
