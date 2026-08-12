#!/usr/bin/env python3
"""Família 8 — Risco, fraude, seguro e conformidade (soluções 71 a 80)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-risco'
NOME = 'Risco, fraude, seguro e conformidade'

ABERTURA = [
    p('Nesta família a arquitetura precisa responder a uma auditoria, não só funcionar. E '
      'isso reorganiza as prioridades: **o escore decide, o texto justifica**. Modelo '
      'tabular ou serviço de detecção calcula o risco de forma reproduzível; o modelo de '
      'linguagem explica a decisão em linguagem que o regulador e o cliente entendem. '
      'Inverter isso produz decisão que ninguém consegue defender.'),
    p('A segunda distinção que atravessa as dez: **endpoint privado controla o CAMINHO; '
      'IAM controla a AUTORIZAÇÃO**. Confundir as duas produz o padrão mais comum de falso '
      'conforto em projeto de IA regulado — rede fechada com permissão aberta, que passa na '
      'revisão de rede e falha na de acesso.'),
]

SOLUCOES = [
    Sol(
        n=71,
        titulo='71. Custo de subscrição de seguro alto e lento',
        titulo_diagrama='O ganho é em leitura e conferência de documento, não em decidir o risco',
        problema='A subscrição de uma apólice complexa leva dias porque o subscritor lê '
                 'dezenas de documentos, confere contra as regras internas e compara com '
                 'casos anteriores. A decisão de risco em si leva minutos — o resto é '
                 'leitura.',
        checagem=('assistente virtual', 'histórico', 'regras'),
        grupos=[
            ('Insumos', 'plain', [
                ('doc', 'doc', 'Documentos da proposta', 'dezenas por proposta'),
                ('kb', 'knowledgebases', 'Regras + casos anteriores', 'norma interna e precedente'),
            ]),
            ('Assistente', 'plain', [
                ('cl', 'claude', 'Claude', 'resume, confere e aponta divergência'),
                ('chk', 'eval', 'Lista de conferência', 'o que precisa estar presente'),
            ]),
            ('Decisão', 'plain', [
                ('sub', 'user', 'Subscritor', 'decide e assina'),
                ('reg', 'audit', 'Registro da análise', 'o que foi conferido e por quem'),
            ]),
        ],
        arestas=[
            ('doc', 'cl', 'proposta completa'),
            ('kb', 'cl', 'regra aplicável + precedente'),
            ('chk', 'cl', 'itens obrigatórios', 'dashed'),
            ('cl', 'sub', 'dossiê com divergências'),
            ('sub', 'reg', 'decisão assinada'),
            ('cl', 'reg', 'o que a máquina conferiu'),
        ],
        passos=[
            ('O gargalo é leitura, e é o que se automatiza',
             'Resumir documento, conferir presença de item e localizar precedente. A decisão '
             'de aceitar o risco continua sendo do subscritor.',
             ['cl', 'doc'], [('doc', 'cl')]),
            ('Lista de conferência explícita',
             '"Analise a proposta" não é executável. A lista de itens obrigatórios é o que '
             'transforma leitura em verificação auditável.',
             ['chk'], [('chk', 'cl')]),
            ('Precedente é o que acelera a decisão difícil',
             'Casos parecidos já decididos são o material mais útil e o mais mal indexado '
             'nas seguradoras.',
             ['kb'], [('kb', 'cl')]),
            ('Divergência é a saída, não o resumo',
             'O subscritor não precisa do resumo do que está certo. Precisa da lista do que '
             'falta e do que conflita.',
             ['sub'], [('cl', 'sub')]),
            ('Registrar o que a máquina conferiu',
             'A auditoria vai perguntar o que foi verificado automaticamente e o que foi '
             'verificado por pessoa. São responsabilidades diferentes.',
             ['reg'], [('cl', 'reg'), ('sub', 'reg')]),
        ],
        legenda='Em subscrição, o tempo está em ler e conferir — e é isso que se automatiza. '
                'A decisão de risco permanece humana, e o registro separa o que a máquina '
                'conferiu do que a pessoa decidiu.',
    ),
    Sol(
        n=72,
        titulo='72. Análise de risco com regra escrita à mão',
        titulo_diagrama='O escore decide, o texto justifica',
        problema='As regras de risco foram escritas há anos e não acompanham o padrão '
                 'novo de fraude. Substituí-las por um modelo é o caminho — e cria um '
                 'requisito imediato: explicar cada recusa em linguagem que o cliente e o '
                 'regulador aceitem.',
        checagem=('Fraud Detector', 'escore', 'explicar'),
        grupos=[
            ('Cálculo do risco', 'plain', [
                ('fd', 'frauddetector', 'Detecção de fraude', 'escore reproduzível'),
                ('feat', 'dataset', 'Atributos', 'e a importância de cada um'),
            ]),
            ('Explicação', 'plain', [
                ('cl', 'claude', 'Claude', 'traduz o escore em texto'),
                ('tpl', 'prompt', 'Modelo de justificativa', 'linguagem aprovada pelo jurídico'),
            ]),
            ('Decisão e registro', 'plain', [
                ('reg', 'politica', 'Faixas de decisão', 'aprova · analisa · recusa'),
                ('log', 'audit', 'Registro', 'escore, atributos, versão, texto'),
            ]),
        ],
        arestas=[
            ('feat', 'fd', 'atributos da transação'),
            ('fd', 'reg', 'escore'),
            ('fd', 'cl', 'atributos que mais pesaram'),
            ('tpl', 'cl', 'estrutura aprovada pelo jurídico'),
            ('cl', 'reg', 'justificativa'),
            ('reg', 'log', 'escore + justificativa'),
        ],
        passos=[
            ('O escore é a decisão, e ele é reproduzível',
             'Mesmo insumo, mesmo escore, sempre. É essa propriedade que permite defender a '
             'decisão — e é justamente o que geração livre não tem.',
             ['fd'], [('feat', 'fd'), ('fd', 'reg')]),
            ('A explicação parte da importância dos atributos',
             'Não é o modelo de linguagem adivinhando o motivo: é ele traduzindo quais '
             'atributos pesaram, que vêm do modelo de risco.',
             ['cl', 'feat'], [('fd', 'cl')]),
            ('Linguagem aprovada, não livre',
             'Justificativa de recusa tem implicação legal. O modelo preenche uma estrutura '
             'revisada pelo jurídico, não escreve do zero.',
             ['tpl'], [('tpl', 'cl')]),
            ('Faixas com análise humana no meio',
             'Recusa automática de caso limítrofe gera contestação. A faixa intermediária é '
             'onde a analista decide.',
             ['reg'], [('cl', 'reg')]),
            ('Registrar escore E texto',
             'Meses depois, a pergunta é sobre aquele caso. Sem os dois, não há como mostrar '
             'que a justificativa correspondia ao cálculo.',
             ['log'], [('reg', 'log')]),
        ],
        legenda='Separar cálculo de explicação é o que torna a decisão defensável: o escore é '
                'reproduzível e decide; o texto traduz os atributos que pesaram, dentro de '
                'linguagem aprovada.',
    ),
    Sol(
        n=73,
        titulo='73. Modelo próprio de crédito para público sem histórico',
        titulo_diagrama='Modelo proprietário se justifica quando o dado é o diferencial — e é a exceção',
        problema='O público-alvo não tem histórico nos birôs tradicionais, e nenhum modelo '
                 'de mercado avalia esse risco. A empresa tem, porém, anos de dado '
                 'transacional próprio — que é exatamente a condição em que treinar vale a '
                 'pena.',
        checagem=('Modelo de fundação próprio', 'dado transacional', 'plataforma de ML'),
        grupos=[
            ('Dado — o diferencial', 'plain', [
                ('tx', 's3', 'Histórico transacional', 'o ativo que ninguém mais tem'),
                ('fs', 'dataset', 'Atributos derivados', 'versionados junto do modelo'),
            ]),
            ('Treino e serviço', 'plain', [
                ('sm', 'sagemaker', 'Plataforma de ML', 'treino, registro e serviço'),
                ('reg', 'catalogo', 'Registro de modelo', 'versão, dado, métrica, aprovação'),
            ]),
            ('Governança do modelo', 'plain', [
                ('drf', 'drift', 'Desvio de distribuição', 'o público muda com o tempo'),
                ('fair', 'juiz', 'Avaliação de disparidade', 'por grupo, antes de publicar'),
            ]),
        ],
        arestas=[
            ('tx', 'fs', 'histórico bruto'),
            ('fs', 'sm', 'treino'),
            ('sm', 'reg', 'versão treinada'),
            ('reg', 'fair', 'antes de promover'),
            ('fair', 'sm', 'aprovado'),
            ('sm', 'drf', 'distribuição em produção', 'dashed'),
            ('drf', 'sm', 'retreino', 'dashed'),
        ],
        passos=[
            ('O dado justifica o treino — não a ambição',
             'Treinar do zero se paga quando o dado é o diferencial e não existe modelo de '
             'mercado. Fora disso, é custo alto com resultado pior.',
             ['tx'], [('tx', 'fs')]),
            ('Atributos versionados junto do modelo',
             'Modelo servido com atributo calculado diferente do treino é a causa clássica '
             'de degradação silenciosa em produção.',
             ['fs'], [('fs', 'sm')]),
            ('Registro com dado, métrica e aprovação',
             'Em crédito, a pergunta do regulador é sobre a versão que decidiu aquele caso. '
             'O registro é o que responde.',
             ['reg'], [('sm', 'reg')]),
            ('Disparidade avaliada antes de promover',
             'Modelo de crédito tem consequência sobre pessoas. Medir por grupo é requisito, '
             'e é mais fácil antes de publicar que depois de contestado.',
             ['fair'], [('reg', 'fair'), ('fair', 'sm')]),
            ('Desvio de distribuição é o alarme de longo prazo',
             'O comportamento do público muda. Sem monitorar o desvio, o modelo envelhece '
             'sem sintoma até o prejuízo aparecer.',
             ['drf'], [('sm', 'drf'), ('drf', 'sm')]),
        ],
        legenda='Modelo próprio é a exceção que se justifica quando o dado é o diferencial. O '
                'trabalho que vem com ele — atributos versionados, registro, avaliação de '
                'disparidade e monitoramento de desvio — é permanente, não do projeto.',
    ),
    Sol(
        n=74,
        titulo='74. Dado de cliente que não pode sair do perímetro',
        titulo_diagrama='Endpoint privado controla o CAMINHO; IAM controla a AUTORIZAÇÃO',
        problema='O requisito é que a chamada ao modelo não atravesse a internet pública. '
                 'O time entrega o endpoint privado, comemora, e a revisão de acesso '
                 'descobre que qualquer papel da conta pode invocar qualquer modelo — rede '
                 'fechada com permissão aberta.',
        checagem=('endpoint privado', 'internet pública', 'IAM por modelo'),
        grupos=[
            ('Caminho', 'vpc', [
                ('app', 'lambda', 'Aplicação', 'dentro da rede privada'),
                ('pl', 'privatelink', 'Endpoint privado', 'tráfego não sai para a internet'),
            ]),
            ('Autorização', 'plain', [
                ('iam', 'iam', 'Política IAM', 'por modelo e por ação'),
                ('scp', 'organizations', 'Política de organização', 'nega o que nem devia ser possível'),
            ]),
            ('Serviço e prova', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'alcançado sem sair para a internet pública'),
                ('tr', 'cloudtrail', 'CloudTrail', 'quem invocou qual modelo'),
                ('kms', 'kms', 'KMS', 'chave própria onde se aplica'),
            ]),
        ],
        arestas=[
            ('app', 'pl', 'chamada pela rede privada'),
            ('pl', 'br', 'sem internet'),
            ('iam', 'br', 'autoriza a ação', 'dashed'),
            ('scp', 'iam', 'teto da conta', 'dashed'),
            ('br', 'tr', 'quem invocou qual modelo'),
            ('kms', 'br', 'chave própria no que se aplica', 'dashed'),
        ],
        passos=[
            ('Caminho e autorização são controles independentes',
             'Endpoint privado impede o tráfego de sair. Ele não decide quem pode chamar o '
             'quê — e essa confusão é o falso conforto mais comum nesses projetos.',
             ['pl', 'iam'], [('pl', 'br'), ('iam', 'br')]),
            ('Permissão por modelo, não por serviço',
             'Autorizar "invocar modelo" libera todos. Restringir por identificador de '
             'modelo é o que separa o aprovado do não aprovado.',
             ['iam'], [('iam', 'br')]),
            ('Política de organização como teto',
             'Ela nega no nível da conta, independente do que o administrador local '
             'conceda. É o controle preventivo que sobrevive a erro de configuração.',
             ['scp'], [('scp', 'iam')]),
            ('A trilha é a prova, não a intenção',
             'Dizer que só o serviço X chama o modelo Y não é evidência. O registro de quem '
             'invocou o quê é.',
             ['tr'], [('br', 'tr')]),
            ('Chave própria onde o requisito exige',
             'Ela adiciona controle sobre o dado em repouso nos artefatos e nos registros. '
             'Não substitui nenhum dos dois controles anteriores.',
             ['kms'], [('kms', 'br')]),
        ],
        legenda='Rede privada e autorização resolvem problemas diferentes, e passar na revisão '
                'de rede não é passar na de acesso. Permissão por identificador de modelo e '
                'política de organização como teto são o que fecha a segunda.',
    ),
    Sol(
        n=75,
        titulo='75. Conformidade que precisa ser demonstrável continuamente',
        titulo_diagrama='Auditoria de foto anual não diz nada sobre os outros 364 dias',
        problema='A empresa passa na auditoria anual arrumando tudo na semana anterior. '
                 'Durante o ano, configurações mudam, exceções são criadas e ninguém sabe. '
                 'A pergunta que a certificação faz não é "está conforme hoje?": é "esteve '
                 'conforme o tempo todo?".',
        checagem=('Config', 'Audit Manager', 'evidência'),
        grupos=[
            ('Avaliação contínua', 'vpc', [
                ('cfg', 'config', 'Config', 'regra avaliada a cada mudança'),
                ('reme', 'lambda', 'Remediação', 'corrige o desvio conhecido'),
            ]),
            ('Evidência', 'plain', [
                ('am', 'auditmanager', 'Audit Manager', 'evidência mapeada ao controle'),
                ('tr', 'cloudtrail', 'CloudTrail', 'a fonte do que aconteceu'),
            ]),
            ('Uso', 'plain', [
                ('pain', 'quicksight', 'Painel de conformidade', 'desvio por controle e por conta'),
                ('aud', 'user', 'Auditor', 'recebe evidência, não promessa'),
            ]),
        ],
        arestas=[
            ('cfg', 'am', 'resultado da avaliação'),
            ('tr', 'am', 'ação registrada'),
            ('cfg', 'reme', 'desvio conhecido'),
            ('reme', 'cfg', 'reavalia'),
            ('am', 'pain', 'desvio por controle'),
            ('am', 'aud', 'pacote de evidência'),
        ],
        passos=[
            ('Avaliar a cada mudança, não a cada ano',
             'A configuração muda em terça-feira. Avaliação contínua transforma desvio de '
             'meses em desvio de minutos.',
             ['cfg'], [('cfg', 'am')]),
            ('Evidência mapeada ao controle',
             'Registro solto não é evidência: precisa estar ligado ao controle que ele '
             'demonstra. É a diferença entre ter dado e ter prova.',
             ['am'], [('tr', 'am'), ('am', 'aud')]),
            ('Remediar o desvio conhecido automaticamente',
             'Se a correção é sabida, esperar alguém agir é escolher ficar em desvio. '
             'Remediação automática encurta a janela.',
             ['reme'], [('cfg', 'reme'), ('reme', 'cfg')]),
            ('O painel mostra tendência, não foto',
             'Desvio por controle ao longo do tempo revela o processo que está falhando — '
             'que é o achado que a auditoria realmente cobra.',
             ['pain'], [('am', 'pain')]),
            ('O pacote de evidência é o produto',
             'Auditor pedindo evidência e recebendo acesso ao console é retrabalho. O pacote '
             'pronto é o que encurta a auditoria de semanas para dias.',
             ['aud'], [('am', 'aud')]),
        ],
        legenda='Conformidade demonstrável é série temporal, não foto: avaliação a cada '
                'mudança, remediação do desvio conhecido e evidência mapeada ao controle. '
                'Arrumar na semana anterior responde à pergunta errada.',
    ),
    Sol(
        n=76,
        titulo='76. Decisão automatizada que precisa ser reconstituída',
        titulo_diagrama='"Por que o sistema recusou este caso" só tem resposta se foi registrada',
        problema='Seis meses depois, o cliente contesta uma recusa. O prompt mudou três '
                 'vezes, o modelo foi atualizado pelo fornecedor e o contexto veio de um '
                 'acervo que também mudou. Sem registro, a resposta honesta é "não temos '
                 'como saber".',
        checagem=('Registro de modelo', 'versão', 'prompt', 'retenção'),
        grupos=[
            ('No momento da decisão', 'vpc', [
                ('cl', 'claude', 'Claude', 'a saída é registrada antes de sair'),
                ('cap', 'lambda', 'Captura da decisão', 'antes de responder ao cliente'),
            ]),
            ('O que se registra', 'plain', [
                ('r1', 'catalogo', 'Modelo e versão', 'identificador exato'),
                ('r2', 'promptmgmt', 'Versão do prompt', 'referência, não texto colado'),
                ('r3', 'doc', 'Contexto e saída', 'o que entrou e o que saiu'),
                ('r4', 'identity', 'Ator e horário', 'humano ou automático'),
            ]),
            ('Guarda', 'plain', [
                ('s3', 's3', 'Armazenamento imutável', 'com retenção definida'),
                ('ret', 'politica', 'Política de retenção', 'prazo escolhido, não esquecido'),
            ]),
        ],
        arestas=[
            ('cl', 'cap', 'saída antes de sair'),
            ('cap', 'r1', 'identificador do modelo'),
            ('cap', 'r2', 'referência da versão'),
            ('cap', 'r3', 'trechos e resposta'),
            ('cap', 'r4', 'humano ou automático'),
            ('r3', 's3', 'grava imutável'),
            ('ret', 's3', 'ciclo de vida', 'dashed'),
        ],
        passos=[
            ('Registrar no momento, não depois',
             'Reconstituir a partir de registros dispersos falha: o prompt já mudou, o '
             'acervo já mudou. A captura acontece na decisão.',
             ['cap'], [('cl', 'cap')]),
            ('Versão do modelo é o campo mais esquecido',
             'O fornecedor atualiza; o comportamento muda. Sem a versão, não há como '
             'explicar por que hoje o resultado seria outro.',
             ['r1'], [('cap', 'r1')]),
            ('Prompt por referência versionada',
             'Colar o texto do prompt em cada registro é caro e diverge. Referência a uma '
             'versão gerenciada aponta o texto exato.',
             ['r2'], [('cap', 'r2')]),
            ('Contexto recuperado faz parte da decisão',
             'A resposta dependeu dos trechos que entraram. Sem eles, o registro mostra a '
             'saída sem mostrar a base.',
             ['r3'], [('cap', 'r3'), ('r3', 's3')]),
            ('Retenção é decisão, com prazo',
             'Guardar para sempre é risco e custo; guardar de menos é não ter resposta. O '
             'prazo sai da exigência aplicável.',
             ['ret', 's3'], [('ret', 's3')]),
        ],
        legenda='Reconstituir uma decisão exige capturar, no momento dela, modelo e versão, '
                'versão do prompt, contexto, saída e ator. Nenhuma dessas informações é '
                'recuperável meses depois.',
    ),
    Sol(
        n=77,
        titulo='77. Habilitação de modelo em região não aprovada',
        titulo_diagrama='Negação condicional é preventiva; alarme de custo é detectivo',
        problema='Um time habilitou um modelo caro numa região não aprovada para testar, '
                 'esqueceu ligado, e a descoberta veio pela fatura. O incidente típico de '
                 'IA corporativa não é de código: é de configuração feita por quem tinha '
                 'permissão para fazê-la.',
        checagem=('política de controle de serviço', 'negação condicional', 'região'),
        grupos=[
            ('Controle preventivo', 'account', [
                ('org', 'organizations', 'Organizations', 'hierarquia de contas'),
                ('scp', 'politica', 'Negação condicional', 'por região e por modelo'),
            ]),
            ('Tentativa', 'plain', [
                ('dev', 'user', 'Engenheiro', 'com permissão local'),
                ('br', 'bedrock', 'Bedrock', 'em região não aprovada'),
            ]),
            ('Controle detectivo', 'plain', [
                ('bud', 'budgets', 'Alarme de gasto', 'por período curto'),
                ('cfg', 'config', 'Config', 'detecta habilitação fora do padrão'),
            ]),
        ],
        arestas=[
            ('org', 'scp', 'aplica no nível da conta'),
            ('dev', 'br', 'tenta habilitar'),
            ('scp', 'br', 'NEGA antes de acontecer'),
            ('br', 'cfg', 'se passar, detecta'),
            ('br', 'bud', 'gasto por hora', 'dashed'),
            ('cfg', 'org', 'relata', 'dashed'),
        ],
        passos=[
            ('Preventivo nega; detectivo avisa depois',
             'A negação condicional impede o gasto existir. O alarme de custo informa que '
             'ele já existiu — e a diferença é a fatura.',
             ['scp', 'bud'], [('scp', 'br')]),
            ('A condição é região E modelo',
             'Negar região inteira quebra serviços legítimos. A condição precisa ser '
             'específica para ser adotável.',
             ['scp'], [('org', 'scp')]),
            ('O teto vale mesmo com permissão local',
             'É o que distingue política de organização de política de conta: o '
               'administrador local não consegue conceder o que o teto nega.',
             ['org', 'dev'], [('dev', 'br')]),
            ('Detecção continua necessária',
             'Nem tudo cabe em negação — modelo novo, região nova, exceção aprovada. A '
             'detecção cobre o que a prevenção não previu.',
             ['cfg'], [('br', 'cfg'), ('cfg', 'org')]),
            ('Alarme sobre gasto por período curto',
             'Alarme sobre o acumulado do mês avisa quando já estourou. Sobre gasto por '
             'hora, avisa no dia em que começou.',
             ['bud'], [('br', 'bud')]),
        ],
        legenda='O incidente típico de custo em IA é de configuração, não de código — e quem '
                'o causa tinha permissão. Negação condicional por região e modelo impede; '
                'alarme sobre gasto de período curto avisa cedo o que passou.',
    ),
    Sol(
        n=78,
        titulo='78. Dado pessoal chegando ao contexto do modelo',
        titulo_diagrama='Redigir antes de montar o prompt — não na saída',
        problema='O ticket do cliente traz CPF, endereço e telefone, e ele vai inteiro '
                 'para o contexto do modelo. Filtrar a resposta parece resolver, e não '
                 'resolve: o dado já entrou no prompt, no registro da chamada, no rastro e '
                 'possivelmente no cache.',
        checagem=('Redação antes', 'prompt'),
        grupos=[
            ('Entrada', 'plain', [
                ('tk', 'doc', 'Ticket do cliente', 'com dado pessoal'),
            ]),
            ('Fronteira de redação', 'vpc', [
                ('cmp', 'comprehend', 'Detecção de dado pessoal', 'entidade com tipo e posição'),
                ('red', 'lambda', 'Redação', 'substitui por marcador estável'),
                ('map', 'dynamodb', 'Mapa reversível', 'guardado fora do contexto'),
            ]),
            ('Uso', 'plain', [
                ('cl', 'claude', 'Claude', 'nunca vê o dado original'),
                ('out', 'lambda', 'Reidratação', 'só na resposta ao titular'),
            ]),
        ],
        arestas=[
            ('tk', 'cmp', 'texto com dado pessoal'),
            ('cmp', 'red', 'entidades encontradas'),
            ('red', 'map', 'guarda o original'),
            ('red', 'cl', 'texto redigido'),
            ('cl', 'out', 'resposta com marcador'),
            ('map', 'out', 'reidrata'),
        ],
        passos=[
            ('O que não entra não vaza',
             'Por resposta, por registro, por rastro nem por cache. Redigir na entrada '
             'elimina quatro superfícies de exposição de uma vez.',
             ['red', 'cl'], [('red', 'cl')]),
            ('Marcador estável preserva o sentido',
             'Substituir por `[CLIENTE_1]` mantém a coerência do texto. Apagar o trecho '
             'produz contexto truncado e resposta pior.',
             ['red'], [('cmp', 'red')]),
            ('O mapa fica fora do contexto',
             'Se a correspondência viaja no prompt, a redação não redigiu nada. Ela mora em '
             'armazenamento próprio, com acesso restrito.',
             ['map'], [('red', 'map')]),
            ('Reidratar só na entrega ao titular',
             'A resposta ao próprio cliente pode conter o dado dele. O que não pode é o dado '
             'atravessar o modelo.',
             ['out'], [('map', 'out'), ('cl', 'out')]),
            ('Detecção com tipo e posição',
             'Saber que há um CPF e onde ele está é o que permite substituir sem destruir o '
             'restante do texto.',
             ['cmp'], [('tk', 'cmp')]),
        ],
        legenda='Redigir na entrada elimina de uma vez a exposição por resposta, registro, '
                'rastro e cache. Marcador estável preserva a coerência do texto, e o mapa '
                'reversível fica fora do contexto.',
    ),
    Sol(
        n=79,
        titulo='79. Requisito regulatório sobre onde o dado é processado',
        titulo_diagrama='Inferência entre regiões melhora disponibilidade e pode violar residência',
        problema='O recurso que roteia a inferência para outra região quando a primeira '
                 'está saturada melhora a disponibilidade — e move o processamento para '
                 'fora da jurisdição exigida. É um ganho técnico que pode ser um '
                 'descumprimento contratual.',
        checagem=('região', 'inferência restrita', 'documentada'),
        grupos=[
            ('Decisão explícita', 'plain', [
                ('req', 'politica', 'Requisito de residência', 'contrato ou norma setorial'),
                ('dec', 'doc', 'Decisão documentada', 'o que se escolheu e por quê'),
            ]),
            ('Configuração', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'perfil restrito à região'),
                ('scp', 'organizations', 'Negação de outras regiões', 'preventivo'),
            ]),
            ('Consequência aceita', 'plain', [
                ('slo', 'slo', 'Disponibilidade menor', 'sem transbordo entre regiões'),
                ('cap', 'metrica', 'Capacidade reservada', 'a mitigação que sobra'),
            ]),
        ],
        arestas=[
            ('req', 'dec', 'exigência aplicável'),
            ('dec', 'br', 'configura'),
            ('dec', 'scp', 'regiões negadas'),
            ('br', 'slo', 'aceita o efeito'),
            ('slo', 'cap', 'mitiga com capacidade'),
        ],
        passos=[
            ('A decisão é explícita e escrita',
             'Deixar o padrão valendo é decidir por omissão — e ninguém sabe que decidiu. O '
             'documento é o que permite defender a escolha.',
             ['dec', 'req'], [('req', 'dec')]),
            ('Restringir na configuração, não na intenção',
             'O perfil de inferência limitado à região é o controle efetivo. Combinar não '
             'usar outra região não é controle.',
             ['br'], [('dec', 'br')]),
            ('Negar as outras regiões preventivamente',
             'É o que impede alguém reabrir o transbordo meses depois sem saber do '
             'requisito.',
             ['scp'], [('dec', 'scp')]),
            ('A perda de disponibilidade é aceita, não ignorada',
             'Sem transbordo, saturação regional vira indisponibilidade. Isso entra no '
             'acordo de nível de serviço com quem depende.',
             ['slo'], [('br', 'slo')]),
            ('Capacidade reservada é a mitigação que resta',
             'Se não se pode sair da região, garantir capacidade dentro dela é o caminho — e '
             'tem custo.',
             ['cap'], [('slo', 'cap')]),
        ],
        legenda='Roteamento entre regiões é um ganho de disponibilidade que pode custar '
                'conformidade. A escolha precisa ser explícita, imposta por configuração e '
                'documentada — e a perda de disponibilidade, assumida no acordo.',
    ),
    Sol(
        n=80,
        titulo='80. Terceiro com acesso ao acervo interno',
        titulo_diagrama='Compartilhar serviço não exige compartilhar rede',
        problema='O parceiro precisa consultar um serviço interno de IA. A saída mais '
                 'rápida é interligar as redes — e ela concede alcance a tudo que está '
                 'roteável dos dois lados, não só ao serviço combinado.',
        checagem=('Ligação privada', 'menor privilégio'),
        grupos=[
            ('Parceiro', 'plain', [
                ('ext', 'external', 'Rede do parceiro', 'não precisa ser conhecida'),
            ]),
            ('Fronteira', 'vpc', [
                ('pl', 'privatelink', 'Ligação privada', 'expõe UM serviço, não a rede'),
                ('api', 'apigateway', 'Contrato de API', 'só as operações combinadas'),
            ]),
            ('Interno', 'vpc', [
                ('svc', 'lambda', 'Serviço de IA', 'exposto por um endpoint, não pela rede'),
                ('iam', 'iam', 'Credencial do parceiro', 'escopo mínimo, com validade'),
                ('cw', 'cloudwatch', 'Uso por parceiro', 'cota e anomalia'),
            ]),
        ],
        arestas=[
            ('ext', 'pl', 'chamada do parceiro'),
            ('pl', 'api', 'só o endpoint publicado'),
            ('api', 'svc', 'operação permitida'),
            ('iam', 'api', 'autoriza', 'dashed'),
            ('api', 'cw', 'chamadas por parceiro'),
        ],
        passos=[
            ('Expor serviço, não rede',
             'A ligação privada publica um endpoint. Interligar redes concede alcance a tudo '
             'que for roteável — e ninguém consegue enumerar o que isso significa.',
             ['pl'], [('ext', 'pl'), ('pl', 'api')]),
            ('O contrato limita as operações',
             'Mesmo com o caminho restrito, o parceiro só pode as operações declaradas. Duas '
             'camadas, dois tipos de erro cobertos.',
             ['api'], [('api', 'svc')]),
            ('Credencial com escopo e validade',
             'Credencial de parceiro sem prazo é a que sobra em produção depois do fim do '
             'contrato. Validade é parte do desenho.',
             ['iam'], [('iam', 'api')]),
            ('Cota por parceiro',
             'Sem cota, um parceiro consome a capacidade de todos. E o incidente parece '
             'falha do serviço, não excesso de um cliente.',
             ['cw'], [('api', 'cw')]),
            ('Não precisar conhecer a rede do outro lado é a vantagem',
             'Nenhuma coordenação de faixas de endereço, nenhuma rota. É o que torna esse '
             'desenho administrável com dezenas de parceiros.',
             ['ext', 'pl'], [('ext', 'pl')]),
        ],
        legenda='Compartilhar serviço com terceiro não exige juntar redes — e juntar redes '
                'concede alcance que ninguém consegue enumerar. Endpoint privado, contrato de '
                'API, credencial com validade e cota por parceiro.',
    ),
]

PERGUNTAS = [
    ('Endpoint privado no Bedrock garante que só quem deve pode chamar o modelo?',
     'Não: endpoint privado controla o caminho, e IAM controla a autorização. Ele impede o '
     'tráfego de sair para a internet pública, mas não decide quem pode invocar qual modelo — '
     'e é comum o time entregar a rede privada e a revisão de acesso descobrir que qualquer '
     'papel da conta invoca qualquer modelo. O que fecha esse lado é política por '
     'identificador de modelo e por ação, com política de organização como teto que o '
     'administrador local não consegue afrouxar.'),
    ('Como explicar uma decisão de risco tomada com IA para o regulador?',
     'Separando cálculo de explicação: o escore vem de modelo tabular ou serviço de detecção, '
     'que é reproduzível — mesmo insumo, mesmo resultado, sempre —, e o modelo de linguagem '
     'traduz em texto quais atributos pesaram, dentro de uma estrutura de justificativa '
     'aprovada pelo jurídico. Registrar escore, atributos, versão do modelo e o texto gerado é '
     'o que permite responder meses depois; sem isso, "por que o sistema recusou este caso" '
     'não tem resposta.'),
    ('Como impedir que um time habilite modelo caro em região não aprovada?',
     'Com negação condicional por região e por modelo em política de organização — controle '
     'preventivo, que impede a habilitação acontecer mesmo quando o engenheiro tem permissão '
     'local. Alarme de custo é detectivo: ele informa depois que o gasto existiu, e sobre '
     'gasto acumulado do mês costuma avisar quando já estourou. O par correto é prevenção '
     'específica por região e modelo, mais alarme sobre gasto de período curto para o que a '
     'prevenção não previu.'),
]

QUIZZES = [
    quiz('Um projeto entregou Bedrock com endpoint privado. O que ainda pode estar aberto?',
         ['O tráfego pode sair para a internet em caso de falha do endpoint',
          'A autorização: sem política por modelo, qualquer papel da conta pode invocar qualquer modelo',
          'A criptografia em trânsito, que exige configuração adicional',
          'O registro das chamadas, que só funciona em endpoints públicos'],
         1,
         'Caminho e autorização são controles independentes, e passar na revisão de rede não é '
         'passar na de acesso — rede fechada com permissão aberta é o falso conforto mais '
         'comum nesses projetos. O endpoint não cai para a internet como alternativa: a '
         'chamada falha. Criptografia em trânsito é padrão no serviço. E o registro das '
         'chamadas funciona independentemente do tipo de endpoint — inclusive é a evidência '
         'que revela o problema de autorização.'),
    quiz('Para atender a um requisito de residência de dados, qual configuração é o controle '
         'efetivo?',
         ['Documentar na política interna que o time não deve usar outras regiões',
          'Restringir o perfil de inferência à região e negar as outras por política de organização',
          'Marcar os recursos com etiqueta de região aprovada',
          'Ativar alarme de custo na região não aprovada'],
         1,
         'Controle efetivo é o que impede, não o que orienta ou detecta. Política interna sem '
         'imposição técnica é combinação, e o transbordo entre regiões pode ser reativado por '
         'quem não conhece o requisito. Etiqueta é metadado: útil para custo e inventário, '
         'sem poder de negar chamada. Alarme de custo avisa depois de o processamento já ter '
         'ocorrido fora da jurisdição — que é exatamente o descumprimento que se queria '
         'evitar.'),
    quiz('Qual conjunto de dados precisa ser capturado NO MOMENTO de uma decisão automatizada '
         'para ela ser reconstituível depois?',
         ['A saída do modelo e o horário, que já identificam a decisão',
          'Modelo e versão, versão do prompt, contexto recuperado, saída e ator',
          'O prompt de sistema e a temperatura usada na chamada',
          'O registro de acesso do usuário que recebeu a decisão'],
         1,
         'Cada um desses campos muda com o tempo por conta própria: o fornecedor atualiza o '
         'modelo, o prompt é reescrito, o acervo é reindexado. Reconstituir depois é '
         'impossível, então a captura é no momento. Saída e horário mostram o resultado sem a '
         'base que o produziu. Prompt de sistema e temperatura são parte da configuração, mas '
         'sozinhos não incluem o contexto recuperado, que foi o que determinou a resposta. E '
         'registro de acesso diz quem recebeu, não como a decisão se formou.'),
]
