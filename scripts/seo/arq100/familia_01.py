#!/usr/bin/env python3
"""Família 1 — Atendimento e experiência do cliente (soluções 1 a 10)."""
from __future__ import annotations

from comum import Sol, p, qa, quiz

SLUG = 'arq-ia-aws-atendimento'
NOME = 'Atendimento e experiência do cliente'

ABERTURA = [
    p('As dez arquiteturas desta família resolvem problemas de atendimento, e todas '
      'batem na mesma restrição: **alguém está esperando**. Isso muda a engenharia. '
      'Onde não há usuário na frente, o lote resolve por metade do preço; aqui o '
      'prazo até a primeira resposta é requisito de produto, e é ele que elimina '
      'candidatos de modelo antes de qualquer discussão de qualidade.'),
    p('A segunda restrição é o custo do erro. Atendimento é a superfície pública da '
      'empresa: uma resposta errada com tom confiante vira captura de tela. Por isso '
      'aparece em quase todos os dez desenhos uma **saída explícita para o humano** — '
      'não como exceção de falha, mas como caminho de primeira classe que o desenho '
      'prevê, instrumenta e mede.'),
]

SOLUCOES = [
    Sol(
        n=1,
        titulo='1. Contact center com fila alta e resposta inconsistente',
        titulo_diagrama='Atendimento de voz com prazo de 2,5 s até a primeira resposta',
        problema='A fila cresce porque cada atendente resolve o mesmo caso de um jeito '
                 'diferente, e o tempo médio reflete isso. O requisito que a operação '
                 'impõe não é "responder bem": é responder em até 2,5 segundos, porque '
                 'acima disso o cliente percebe silêncio na linha e desiste.',
        checagem=('Connect', 'Haiku', 'Knowledge Bases'),
        grupos=[
            ('Canal de voz', 'plain', [
                ('tel', 'connect', 'Amazon Connect', 'fila, gravação e transferência'),
                ('asr', 'transcribe', 'Transcribe', 'fala → texto em fluxo, sem esperar o fim'),
                ('nlu', 'lex', 'Amazon Lex', 'resolve a intenção rotineira sem gerar texto'),
            ]),
            ('Modelo', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'porta única de modelo, sem endpoint para gerenciar'),
                ('hai', 'claude', 'Claude Haiku', 'escolhido pelo prazo, não pelo teto de qualidade'),
            ]),
            ('Conhecimento', 'plain', [
                ('kb', 'knowledgebases', 'Knowledge Bases', 'procedimento e política vigentes'),
            ]),
            ('Saída e medida', 'plain', [
                ('hum', 'user', 'Atendente humano', 'recebe a conversa com resumo'),
                ('lat', 'metrica', 'p95 até o 1º som', 'o requisito que decide o modelo'),
            ]),
        ],
        arestas=[
            ('tel', 'asr', 'áudio em fluxo'),
            ('asr', 'nlu', 'transcrição parcial'),
            ('nlu', 'br', 'só o que exige geração'),
            ('br', 'hai', 'perfil de inferência'),
            ('hai', 'kb', 'consulta'),
            ('kb', 'hai', 'trecho citável'),
            ('hai', 'tel', 'áudio sintetizado em streaming'),
            ('hai', 'hum', 'transfere com resumo'),
            ('hai', 'lat', 'mede cada resposta', 'dashed'),
        ],
        passos=[
            ('O prazo entra antes do modelo',
             'O requisito de 2,5 s até o primeiro som é declarado antes de escolher o '
             'modelo — e é ele que elimina candidatos. Escolher o modelo primeiro e '
             'depois tentar caber no prazo é a ordem que faz o projeto voltar do começo.',
             ['lat', 'hai'], [('hai', 'lat')]),
            ('Lex resolve o que não precisa de geração',
             'Saldo, status de pedido e horário de funcionamento são consulta, não '
             'redação. Classificar a intenção antes evita a chamada mais cara e é a '
             'alavanca de custo mais ignorada em atendimento.',
             ['nlu', 'br'], [('asr', 'nlu'), ('nlu', 'br')]),
            ('Modelo pequeno ganha por prazo',
             'Haiku não foi escolhido por ser barato: foi escolhido porque cabe no '
             'orçamento de latência. Quando o requisito é tempo, o modelo grande é '
             'tecnicamente melhor e operacionalmente inviável.',
             ['br', 'hai'], [('br', 'hai')]),
            ('A consistência vem do acervo, não do modelo',
             'O que fazia cada atendente responder diferente era a política estar em '
             'seis lugares. Recuperar do acervo vigente é o que torna a resposta '
             'uniforme — e trocar de modelo não resolveria isso.',
             ['kb', 'hai'], [('hai', 'kb'), ('kb', 'hai')]),
            ('A transferência humana é caminho, não falha',
             'Quando a confiança cai ou o assunto sai do escopo, o desenho transfere '
             'com o resumo do que já foi dito. Transferência sem contexto faz o cliente '
             'repetir tudo, e é aí que a satisfação cai mais que na espera.',
             ['hum', 'tel'], [('hai', 'hum')]),
        ],
        legenda='Modelo pequeno com recuperação boa vence modelo grande sem ela quando o '
                'requisito é tempo. E a consistência que faltava não estava no modelo: '
                'estava em ter uma fonte única de política para recuperar.',
    ),
    Sol(
        n=2,
        titulo='2. Chamada de voz em volume, com risco de resposta errada',
        titulo_diagrama='Quinze mil chamadas por dia com escalonamento como caminho de primeira classe',
        problema='Em volume de dezenas de milhares de chamadas por dia, a pergunta deixa '
                 'de ser "o modelo acerta?" e passa a ser "o que acontece nas que ele '
                 'erra?". Um por cento de erro em 15 mil chamadas são 150 clientes por '
                 'dia — e sem caminho de saída eles viram reclamação pública.',
        checagem=('Connect', 'Guardrails', 'escalonamento'),
        grupos=[
            ('Canal', 'plain', [
                ('tel', 'connect', 'Amazon Connect', 'fluxo de contato e fila'),
                ('asr', 'transcribe', 'Transcribe em fluxo', 'devolve parcial, para o modelo começar antes do ponto final'),
            ]),
            ('Modelo com barreira', 'plain', [
                ('gr', 'guardrails', 'Guardrails', 'entrada e saída, com registro da recusa'),
                ('br', 'bedrock', 'Bedrock', 'a porta; o perfil de inferência fixa o modelo'),
                ('cl', 'claude', 'Claude', 'responde ou declara que não sabe'),
            ]),
            ('Escalonamento', 'plain', [
                ('reg', 'politica', 'Regra de saída', 'confiança baixa, tema sensível, pedido do cliente'),
                ('hum', 'user', 'Atendente humano', 'com transcrição e resumo em tela'),
            ]),
            ('Operação', 'plain', [
                ('cw', 'cloudwatch', 'CloudWatch', 'taxa de escalonamento por motivo'),
            ]),
        ],
        arestas=[
            ('tel', 'asr', 'áudio em fluxo'),
            ('asr', 'gr', 'antes do modelo'),
            ('gr', 'br', 'entrada aprovada'),
            ('br', 'cl', 'perfil de inferência'),
            ('cl', 'gr', 'antes de falar'),
            ('gr', 'reg', 'avalia a saída'),
            ('reg', 'hum', 'escalona'),
            ('reg', 'tel', 'responde'),
            ('reg', 'cw', 'motivo do escalonamento', 'dashed'),
        ],
        passos=[
            ('Guardrails nas duas pontas',
             'Na entrada ele barra o que não deveria virar contexto; na saída, o que não '
             'deveria ser falado. Só na saída é tarde: o dado sensível já entrou no '
             'prompt, no registro e no cache.',
             ['gr'], [('asr', 'gr'), ('cl', 'gr')]),
            ('A regra de saída é explícita e nomeada',
             'Três motivos disparam humano: confiança baixa, tema na lista sensível e '
             'pedido direto do cliente. Regra nomeada é regra auditável — "quando o bot '
             'não souber" não é implementável.',
             ['reg'], [('gr', 'reg')]),
            ('O humano recebe contexto, não uma linha zerada',
             'A transcrição e o resumo chegam junto. É o que evita o pior momento do '
             'atendimento automatizado: o cliente contar tudo de novo depois de já ter '
             'contado.',
             ['hum'], [('reg', 'hum')]),
            ('A taxa de escalonamento é métrica de produto',
             'Ela sobe quando o acervo envelhece e cai quando o escopo cresce. Medida '
             'por motivo, ela diz o que corrigir; medida no agregado, só diz que algo '
             'piorou.',
             ['cw', 'reg'], [('reg', 'cw')]),
            ('O volume é o que torna o desenho obrigatório',
             'Em cem chamadas por dia, a exceção cabe no improviso. Em quinze mil, o '
             'caminho de exceção é o que define a operação — e por isso ele é desenhado '
             'primeiro, não depois.',
             ['tel', 'reg', 'hum'], [('reg', 'tel')]),
        ],
        legenda='Escalonamento não é o que acontece quando a arquitetura falha: é parte '
                'da arquitetura. Em volume alto, o caminho de exceção precisa de '
                'instrumentação, contexto e regra nomeada — igual ao caminho felizy.',
    ),
    Sol(
        n=3,
        titulo='3. Escalonamento excessivo do agente virtual',
        titulo_diagrama='Ferramenta de leitura no sistema de atendimento reduz a transferência',
        problema='O agente virtual transfere quase tudo para humano, e a economia não '
                 'aparece. A causa quase nunca é o modelo: é ele não ter acesso ao '
                 'estado real do pedido, então qualquer pergunta concreta ("onde está '
                 'minha entrega?") só pode terminar em transferência.',
        checagem=('ferramentas de sistema de atendimento', 'memória de sessão'),
        grupos=[
            ('Canal', 'plain', [
                ('cli', 'cliente', 'Cliente', 'já autenticado — o escopo da consulta sai da sessão'),
                ('api', 'apigateway', 'API Gateway', 'autenticação e limite de taxa'),
            ]),
            ('Laço do agente', 'plain', [
                ('cl', 'claude', 'Claude com ferramentas', 'decide qual ferramenta chamar'),
                ('mem', 'dynamodb', 'Memória de sessão', 'o que já foi perguntado e resolvido'),
            ]),
            ('Ferramentas de leitura', 'vpc', [
                ('t1', 'lambda', 'consultarPedido', 'só leitura, escopo por cliente'),
                ('t2', 'lambda', 'consultarFatura', 'só leitura'),
                ('crm', 'erp', 'Sistema de atendimento', 'a fonte do estado real'),
            ]),
            ('Medida', 'plain', [
                ('esc', 'metrica', 'Taxa de transferência', 'por intenção, não no agregado'),
            ]),
        ],
        arestas=[
            ('cli', 'api', 'pergunta + sessão'),
            ('api', 'cl', 'sessão autenticada'),
            ('cl', 'mem', 'lê e grava'),
            ('cl', 't1', 'pedido'),
            ('cl', 't2', 'fatura'),
            ('t1', 'crm', 'consulta por cliente'),
            ('t2', 'crm', 'consulta por cliente'),
            ('crm', 'cl', 'estado real'),
            ('cl', 'esc', 'transferiu ou resolveu', 'dashed'),
        ],
        passos=[
            ('A causa é falta de ferramenta, não prompt ruim',
             'Sem ferramenta, o agente só tem duas saídas para pergunta concreta: '
             'inventar ou transferir. Um prompt melhor faz ele transferir com mais '
             'elegância — o número não muda.',
             ['cl', 't1', 't2'], [('cl', 't1'), ('cl', 't2')]),
            ('Ferramenta de leitura primeiro',
             'Consultar não tem efeito colateral: erra sem estragar. Começar por leitura '
             'entrega a maior parte da redução com a menor parte do risco.',
             ['t1', 't2', 'crm'], [('t1', 'crm'), ('t2', 'crm')]),
            ('O escopo mora na ferramenta',
             'A ferramenta recebe o identificador da sessão autenticada e consulta só '
             'aquele cliente. Deixar o filtro para o prompt é o que transforma pergunta '
             'esperta em vazamento entre clientes.',
             ['t1', 'api'], [('api', 'cl')]),
            ('Memória de sessão evita a repetição',
             'Sem ela, o agente pergunta o número do pedido três vezes na mesma '
             'conversa — e o cliente pede humano por irritação, não por incapacidade '
             'do modelo.',
             ['mem'], [('cl', 'mem')]),
            ('A métrica é por intenção',
             'A taxa agregada esconde o padrão: em geral duas ou três intenções '
             'concentram as transferências, e é nelas que a próxima ferramenta rende.',
             ['esc'], [('cl', 'esc')]),
        ],
        legenda='Agente que consulta o estado real transfere menos. O ganho vem de dar '
                'ferramenta, não de escrever prompt melhor — e a próxima ferramenta a '
                'construir é a que a taxa de transferência por intenção aponta.',
    ),
    Sol(
        n=4,
        titulo='4. Assistente sem acesso à informação oficial',
        titulo_diagrama='RAG sobre manual e boletim técnico, com citação obrigatória',
        problema='O assistente responde sobre produto usando o que o modelo aprendeu na '
                 'internet — que está desatualizado e, em alguns pontos, errado. O '
                 'acervo oficial (manual, boletim técnico, tabela de preço) muda toda '
                 'semana, e nenhum treino acompanha esse ritmo.',
        checagem=('AgentCore', 'Knowledge Bases', 'citação'),
        grupos=[
            ('Canal', 'plain', [
                ('cli', 'cliente', 'Cliente ou vendedor', 'pergunta sobre produto, preço e disponibilidade'),
                ('api', 'apigateway', 'API Gateway', 'autenticação, cota e limite de taxa'),
            ]),
            ('Runtime do agente', 'plain', [
                ('ac', 'agentcore', 'AgentCore Runtime', 'sessão, identidade e rastro gerenciados'),
                ('cl', 'claude', 'Claude', 'responde só com o que recuperou'),
            ]),
            ('Acervo oficial', 'plain', [
                ('s3', 's3', 'S3 — manuais e boletins', 'a fonte de verdade versionada'),
                ('kb', 'knowledgebases', 'Knowledge Bases', 'ingestão incremental por evento'),
                ('cit', 'doc', 'Citação verificada', 'o trecho existe no documento apontado'),
            ]),
            ('Frescor', 'plain', [
                ('ev', 'eventbridge', 'EventBridge', 'boletim novo entra na mesma hora'),
            ]),
        ],
        arestas=[
            ('cli', 'api', 'pergunta sobre o produto'),
            ('api', 'ac', 'sessão'),
            ('ac', 'cl', 'contexto da sessão'),
            ('cl', 'kb', 'consulta'),
            ('kb', 'cl', 'trechos + fonte'),
            ('cl', 'cit', 'valida antes de devolver'),
            ('cit', 'cli', 'resposta com fonte'),
            ('s3', 'ev', 'documento novo'),
            ('ev', 'kb', 'ingestão incremental'),
        ],
        passos=[
            ('Treinar não resolve acervo que muda toda semana',
             'Ajuste fino congela o conhecimento no momento do treino. Quando o boletim '
             'de quinta contradiz o manual de janeiro, só a recuperação sabe disso.',
             ['kb', 's3'], [('s3', 'ev'), ('ev', 'kb')]),
            ('A ingestão é por evento, não agendada',
             'Documento novo no S3 dispara a ingestão. "Sincroniza toda noite" é uma '
             'decisão legítima — mas é uma decisão, e o usuário precisa saber que a '
             'resposta pode ter um dia de atraso.',
             ['ev', 'kb'], [('ev', 'kb')]),
            ('Citação é o que torna o erro detectável',
             'Sem fonte, alucinação e acerto são indistinguíveis para quem lê. Com '
             'fonte, quem duvida confere — e o erro para de se propagar como verdade.',
             ['cit', 'cl'], [('cl', 'cit')]),
            ('Validar que o trecho existe',
             'Modelo cita documento que não contém o trecho. Conferir a citação contra o '
             'texto recuperado transforma alucinação em falha que o código pega, sem '
             'julgamento humano.',
             ['cit'], [('cit', 'cli')]),
            ('O runtime gerenciado é encanamento, não a solução',
             'AgentCore entrega sessão, identidade e rastro sem você construir. O que '
             'ele não entrega é o critério de qualidade da resposta — esse continua sendo '
             'trabalho seu.',
             ['ac'], [('api', 'ac'), ('ac', 'cl')]),
        ],
        legenda='RAG sobre documento oficial substitui treinar modelo quando o acervo '
                'muda mais rápido que o ciclo de treino. E a citação não é enfeite: é o '
                'que transforma alucinação em erro que dá para detectar.',
    ),
    Sol(
        n=5,
        titulo='5. Atendimento fora do horário sem cobertura humana',
        titulo_diagrama='Agente autônomo de escopo estreito, com trilha de tudo que agiu',
        problema='Entre 22h e 7h não há ninguém, e o cliente que quer reagendar uma '
                 'entrega fica para o dia seguinte. Autonomia real exige que o agente '
                 '*aja* — e agir sem supervisão humana só é aceitável se o escopo do que '
                 'ele pode fazer for pequeno e nomeado.',
        checagem=('AgentCore', 'agendamento', 'trilha'),
        grupos=[
            ('Canal', 'plain', [
                ('cli', 'cliente', 'Cliente', 'fora do horário comercial'),
                ('wa', 'whatsapp', 'Canal de mensagem', 'onde o cliente já está, fora do horário comercial'),
            ]),
            ('Agente autônomo', 'plain', [
                ('ac', 'agentcore', 'AgentCore', 'teto de passos e de gasto por sessão'),
                ('cl', 'claude', 'Claude', 'decide qual ferramenta e se pede confirmação'),
            ]),
            ('Ações permitidas', 'vpc', [
                ('ag', 'lambda', 'reagendarEntrega', 'escrita, com confirmação do cliente'),
                ('cn', 'lambda', 'consultarStatus', 'leitura'),
                ('crm', 'erp', 'CRM e logística', 'o sistema de registro da entrega'),
            ]),
            ('Trilha e limite', 'plain', [
                ('tr', 'cloudtrail', 'Trilha de ação', 'quem, o quê, quando, com qual argumento'),
                ('fila', 'sqs', 'Fila para o humano', 'o que sai do escopo espera as 7h'),
            ]),
        ],
        arestas=[
            ('cli', 'wa', 'mensagem às 3h'),
            ('wa', 'ac', 'texto + identidade'),
            ('ac', 'cl', 'sessão com teto de passos'),
            ('cl', 'cn', 'leitura'),
            ('cl', 'ag', 'escrita'),
            ('cn', 'crm', 'consulta o status'),
            ('ag', 'crm', 'grava o reagendamento'),
            ('ag', 'tr', 'registra a ação'),
            ('cl', 'fila', 'fora do escopo'),
        ],
        passos=[
            ('Autonomia se conquista por escopo estreito',
             'O agente só age no que tem ferramenta. Duas ações permitidas e nada mais: '
             'a lista de ferramentas É a fronteira de autonomia, e ela é lida no código, '
             'não inferida do prompt.',
             ['ag', 'cn'], [('cl', 'ag'), ('cl', 'cn')]),
            ('Leitura e escrita são ferramentas separadas',
             'Separar permite permissão diferente para cada uma — e permite liberar a '
             'leitura para todos os casos enquanto a escrita fica em dois. Uma '
             'ferramenta que lê e escreve não dá para autorizar pela metade.',
             ['cn', 'ag'], [('cn', 'crm'), ('ag', 'crm')]),
            ('O que sai do escopo espera, e o cliente sabe',
             'A fila para humano é a resposta honesta: "isso eu não resolvo, alguém te '
             'responde às 7h". Melhor que tentar e errar às 3h da manhã sem ninguém para '
             'corrigir.',
             ['fila'], [('cl', 'fila')]),
            ('Trilha por ação, com o argumento',
             'De manhã alguém vai perguntar por que a entrega do cliente X mudou de dia. '
             'Sem argumento registrado, a resposta é "o agente decidiu" — que não é '
             'resposta.',
             ['tr'], [('ag', 'tr')]),
            ('O teto de gasto mora no runtime',
             'Sessão sem teto de passos é orçamento sem teto. Agente noturno em laço '
             'roda oito horas sem ninguém olhando — o limite precisa ser do código, não '
             'da vigilância.',
             ['ac'], [('wa', 'ac'), ('ac', 'cl')]),
        ],
        legenda='Autonomia não vem de confiar mais no modelo: vem de reduzir o que ele '
                'pode fazer. Duas ferramentas, teto de passos e trilha por ação — e o que '
                'não cabe nisso espera o humano, dito ao cliente sem rodeio.',
    ),
    Sol(
        n=6,
        titulo='6. Assistente de compras que não conhece o catálogo',
        titulo_diagrama='Conhecimento e estado: duas fontes, porque sugerir esgotado é pior que não sugerir',
        problema='O assistente recomenda produto que não existe mais ou está esgotado. A '
                 'causa é ele ter só uma fonte: o catálogo indexado, que descreve o '
                 'produto mas não sabe quantos há em estoque agora. Conhecimento e '
                 'estado são coisas diferentes, e confundi-las gera recomendação inútil.',
        checagem=('Bedrock Agents', 'Knowledge Bases', 'estoque'),
        grupos=[
            ('Canal', 'plain', [
                ('u', 'user', 'Comprador', 'quer o produto, não a busca'),
                ('api', 'apigateway', 'API Gateway', 'sessão e limite de taxa'),
                ('fn', 'lambda', 'Lambda', 'monta a sessão'),
            ]),
            ('Agente', 'plain', [
                ('ag', 'bedrock', 'Bedrock Agents', 'orquestra as duas fontes'),
                ('cl', 'claude', 'Claude', 'orquestra as duas fontes e filtra o esgotado'),
            ]),
            ('Conhecimento (o quê)', 'plain', [
                ('kb', 'knowledgebases', 'Knowledge Bases', 'descrição, ficha técnica, resenha'),
            ]),
            ('Estado (agora)', 'vpc', [
                ('est', 'lambda', 'Grupo de ação: estoque', 'consulta em tempo real'),
                ('db', 'dynamodb', 'Estoque', 'muda a cada pedido'),
            ]),
        ],
        arestas=[
            ('u', 'api', 'o que estou procurando'),
            ('api', 'fn', 'sessão'),
            ('fn', 'ag', 'pedido do comprador'),
            ('ag', 'cl', 'ferramentas disponíveis'),
            ('cl', 'kb', 'o que combina com o pedido'),
            ('kb', 'cl', 'candidatos'),
            ('cl', 'est', 'tem em estoque?'),
            ('est', 'db', 'quantidade agora'),
            ('db', 'cl', 'disponibilidade'),
            ('cl', 'u', 'só o que existe e está disponível'),
        ],
        passos=[
            ('Duas fontes, dois papéis',
             'O acervo indexado responde "o que combina"; o estoque responde "o que '
             'existe agora". Só a primeira gera a sugestão perfeita de um produto '
             'esgotado.',
             ['kb', 'db'], [('cl', 'kb'), ('cl', 'est')]),
            ('Estado não entra no índice vetorial',
             'Indexar quantidade é indexar algo que muda a cada minuto — o índice fica '
             'errado assim que é escrito. Estado se consulta; conhecimento se indexa.',
             ['db', 'est'], [('est', 'db')]),
            ('A ordem economiza chamada',
             'Recuperar candidatos primeiro e conferir estoque só dos poucos que sobraram '
             'é mais barato que conferir o catálogo inteiro. A ordem das duas consultas é '
             'decisão de custo.',
             ['kb', 'est'], [('kb', 'cl'), ('db', 'cl')]),
            ('O filtro final é do código',
             'Pedir ao modelo "não sugira esgotado" é confiar em instrução. Remover o '
             'esgotado da lista antes de montar a resposta é garantia.',
             ['cl', 'u'], [('cl', 'u')]),
            ('O grupo de ação é o adaptador',
             'Quem chama o serviço de estoque é a sua função, com o argumento validado. '
             'O modelo pede; o código decide se aquilo é um pedido legítimo.',
             ['est', 'ag'], [('fn', 'ag')]),
        ],
        legenda='Recomendação precisa de duas fontes: conhecimento indexado para o que '
                'combina e estado consultado para o que existe. Indexar estado é a '
                'confusão que gera a sugestão perfeita de um produto esgotado.',
    ),
    Sol(
        n=7,
        titulo='7. Cliente pergunta em português, acervo está em inglês',
        titulo_diagrama='Traduzir o acervo uma vez, não toda consulta',
        problema='A documentação de produto está em inglês e os clientes perguntam em '
                 'português. Traduzir cada pergunta e cada resposta em tempo de consulta '
                 'multiplica latência e custo por chamada — e degrada justamente o termo '
                 'técnico, que é o que precisava chegar inteiro.',
        checagem=('Translate', 'acervo indexado'),
        grupos=[
            ('Ingestão (uma vez)', 'plain', [
                ('s3', 's3', 'S3 — acervo em inglês', 'documentação como o fornecedor publica, em inglês'),
                ('tr', 'translate', 'Translate + glossário', 'termo técnico e nome de produto preservados'),
                ('kb', 'knowledgebases', 'Índice bilíngue', 'trecho original e traduzido, mesmo id'),
            ]),
            ('Consulta (toda vez)', 'plain', [
                ('cli', 'cliente', 'Cliente em PT-BR', 'digita na língua dele, sem tradutor no caminho'),
                ('cl', 'claude', 'Claude multilíngue', 'entende a pergunta sem tradutor no caminho'),
            ]),
            ('Resposta', 'plain', [
                ('resp', 'doc', 'Resposta em PT-BR', 'cita o documento original'),
            ]),
        ],
        arestas=[
            ('s3', 'tr', 'lote, uma vez'),
            ('tr', 'kb', 'indexa as duas versões'),
            ('cli', 'cl', 'pergunta em PT-BR'),
            ('cl', 'kb', 'busca nas duas línguas'),
            ('kb', 'cl', 'trechos'),
            ('cl', 'resp', 'texto em PT-BR'),
            ('resp', 'cli', 'resposta + fonte original'),
        ],
        passos=[
            ('O custo está no lugar errado',
             'Traduzir na consulta paga por chamada, para sempre. Traduzir na ingestão '
             'paga uma vez por documento. O acervo muda devagar; a consulta, não.',
             ['tr', 's3'], [('s3', 'tr')]),
            ('Glossário vence prompt para terminologia',
             'Nome de produto e termo técnico não devem ser traduzidos. Glossário é '
             'determinístico: não depende de o modelo lembrar a instrução naquela '
             'chamada.',
             ['tr'], [('tr', 'kb')]),
            ('Indexar as duas versões, com o mesmo identificador',
             'A busca acha pelo português; a citação aponta o documento original em '
             'inglês. Quem quiser conferir vai à fonte, não à tradução.',
             ['kb'], [('cl', 'kb'), ('kb', 'cl')]),
            ('O modelo já é multilíngue',
             'Não é preciso tradutor entre o cliente e o modelo: ele entende a pergunta '
             'em português e responde em português. O tradutor existe para o ACERVO, não '
             'para a conversa.',
             ['cl', 'cli'], [('cli', 'cl')]),
            ('A resposta cita o original',
             'Traduzir a citação esconde a fonte de quem precisa verificar. A resposta é '
             'em português; a referência aponta o documento como ele existe.',
             ['resp'], [('cl', 'resp'), ('resp', 'cli')]),
        ],
        legenda='Traduzir o acervo uma vez custa menos que traduzir toda consulta — e '
                'preserva o termo técnico, que é justamente o que a tradução em tempo de '
                'consulta estraga.',
    ),
    Sol(
        n=8,
        titulo='8. Resumo de conversa para o próximo atendente',
        titulo_diagrama='Resumo é trabalho de fundo: em lote, por cerca de metade do preço',
        problema='Quando o cliente volta, o atendente novo lê trinta minutos de '
                 'transcrição ou pergunta tudo de novo. O resumo resolve — e ninguém '
                 'está esperando por ele no momento em que a chamada termina, o que muda '
                 'completamente a engenharia e o preço.',
        checagem=('Contact Lens', 'lote', 'CRM'),
        grupos=[
            ('Origem', 'plain', [
                ('tel', 'connect', 'Amazon Connect', 'fluxo de contato, fila e gravação'),
                ('lens', 'contactlens', 'Contact Lens', 'transcrição e sentimento já prontos'),
                ('s3', 's3', 'S3', 'transcrição do dia'),
            ]),
            ('Processamento de fundo', 'plain', [
                ('lote', 'lote', 'Inferência em lote', 'janela de horas, sem ninguém esperando'),
                ('br', 'bedrock', 'Bedrock', 'resumo com ação pendente e tom'),
            ]),
            ('Destino', 'plain', [
                ('crm', 'erp', 'CRM', 'resumo na ficha do cliente'),
                ('cw', 'cloudwatch', 'CloudWatch', 'custo por resumo'),
            ]),
        ],
        arestas=[
            ('tel', 'lens', 'áudio da chamada'),
            ('lens', 's3', 'transcrição'),
            ('s3', 'lote', 'acumula a janela'),
            ('lote', 'br', 'lote de transcrições'),
            ('br', 'crm', 'resumo estruturado'),
            ('lote', 'cw', 'custo por resumo', 'dashed'),
        ],
        passos=[
            ('Ninguém está esperando — então é lote',
             'O resumo é lido horas depois, quando o cliente volta. Latência não é '
             'requisito, e a inferência em lote custa cerca de metade da sob demanda.',
             ['lote', 'br'], [('s3', 'lote'), ('lote', 'br')]),
            ('A transcrição já existe',
             'Contact Lens já transcreve e analisa sentimento. Reprocessar áudio com '
             'outro serviço é pagar duas vezes pelo mesmo dado.',
             ['lens'], [('tel', 'lens'), ('lens', 's3')]),
            ('O resumo tem forma, não é texto livre',
             'Três campos: o que o cliente queria, o que foi resolvido e o que ficou '
             'pendente. Resumo em prosa livre o atendente não lê — ele tem 20 segundos.',
             ['br', 'crm'], [('br', 'crm')]),
            ('O destino é o sistema que o atendente já abre',
             'Resumo em painel separado não é lido. Ele precisa aparecer na ficha do '
             'cliente, no sistema onde o atendimento acontece.',
             ['crm'], [('br', 'crm')]),
            ('O custo por resumo é a métrica que decide o escopo',
             'Com o número por resumo, dá para decidir se resume toda chamada ou só as '
             'que passaram de cinco minutos. Sem ele, a decisão é chute.',
             ['cw'], [('lote', 'cw')]),
        ],
        legenda='O que ninguém espera não deve ser feito sob demanda. Reconhecer que o '
                'resumo é trabalho de fundo corta o custo pela metade — e a economia vem '
                'da janela de entrega, não de trocar o modelo.',
    ),
    Sol(
        n=9,
        titulo='9. Detecção de intenção antes do modelo grande',
        titulo_diagrama='Classificar com serviço especializado antes de gerar',
        problema='Toda mensagem que entra vira chamada ao modelo de linguagem, inclusive '
                 '"obrigado", "ok" e "qual o horário de vocês". A conta cresce '
                 'proporcional ao volume, e a maior parte desse volume não exigia '
                 'geração de texto nenhuma.',
        checagem=('Comprehend', 'roteamento'),
        grupos=[
            ('Entrada', 'plain', [
                ('msg', 'cliente', 'Mensagem do cliente', 'metade é saudação, status ou agradecimento'),
                ('cmp', 'comprehend', 'Comprehend', 'classificação, entidade, sentimento'),
            ]),
            ('Roteamento', 'vpc', [
                ('rot', 'lambda', 'Roteador', 'decide por classe, no código'),
                ('tpl', 'doc', 'Resposta de modelo fixo', 'saudação, horário, status'),
            ]),
            ('Geração', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'só o que exige redação'),
                ('cl', 'claude', 'Claude', 'só o que exige redação chega aqui'),
            ]),
            ('Medida', 'plain', [
                ('pct', 'metrica', '% que chega ao modelo', 'a alavanca de custo desta arquitetura'),
            ]),
        ],
        arestas=[
            ('msg', 'cmp', 'texto cru'),
            ('cmp', 'rot', 'classe + confiança'),
            ('rot', 'tpl', 'rotina'),
            ('rot', 'br', 'exige geração'),
            ('br', 'cl', 'perfil de inferência'),
            ('rot', 'pct', 'fração roteada ao modelo', 'dashed'),
        ],
        passos=[
            ('Classificar é ordens de magnitude mais barato que gerar',
             'Comprehend cobra por unidade de texto classificado; o modelo cobra por '
             'token gerado. Para decidir se a mensagem é uma saudação, o segundo é '
             'desperdício.',
             ['cmp'], [('msg', 'cmp'), ('cmp', 'rot')]),
            ('O roteador é código, com a classe e a confiança',
             'A decisão não pode ser do modelo — seria pagar a chamada que se quer '
             'evitar. É uma condicional no seu código sobre a classe devolvida.',
             ['rot'], [('cmp', 'rot')]),
            ('Resposta fixa para o que é fixo',
             'Horário de funcionamento não muda por cliente. Modelo fixo é mais rápido, '
             'mais barato e não erra — três vantagens que geração nenhuma oferece aqui.',
             ['tpl'], [('rot', 'tpl')]),
            ('Confiança baixa vai para o modelo, não para o modelo fixo',
             'Quando o classificador não tem certeza, o caminho seguro é gerar. Errar a '
             'classe e responder com texto fixo produz a resposta errada com aparência '
             'de resposta oficial.',
             ['rot', 'br'], [('rot', 'br')]),
            ('A métrica é a fração que chega ao modelo',
             'Ela é a alavanca: cair de 100% para 35% corta dois terços do custo de '
             'inferência sem tocar em modelo, prompt ou cache.',
             ['pct'], [('rot', 'pct')]),
        ],
        legenda='Classificar com serviço especializado antes de gerar é a alavanca de '
                'custo mais ignorada em atendimento. A métrica que mede o ganho é a '
                'fração de mensagens que chega ao modelo — e ela cabe num painel.',
    ),
    Sol(
        n=10,
        titulo='10. Agente de voz com interrupção do usuário',
        titulo_diagrama='O que define a percepção é o tempo até o primeiro som',
        problema='O agente de voz responde certo, e o cliente desliga. O motivo é ritmo: '
                 'dois segundos de silêncio numa ligação parecem uma eternidade, e um '
                 'agente que não pode ser interrompido soa como gravação — que é '
                 'exatamente o que o cliente aprendeu a evitar.',
        checagem=('Polly', 'fluxo', 'corte na fala'),
        grupos=[
            ('Áudio', 'plain', [
                ('tel', 'connect', 'Amazon Connect', 'áudio bidirecional'),
                ('asr', 'transcribe', 'Transcribe em fluxo', 'parciais, não só o final'),
                ('vad', 'mic', 'Detecção de fala', 'dispara o corte quando o cliente fala'),
            ]),
            ('Geração em fluxo', 'vpc', [
                ('br', 'bedrock', 'Bedrock em fluxo', 'primeiros tokens já saem'),
                ('seg', 'lambda', 'Segmentador', 'corta a resposta em frases'),
            ]),
            ('Voz', 'plain', [
                ('pol', 'polly', 'Polly', 'sintetiza frase por frase'),
                ('cache', 'elasticache', 'Cache de frase fixa', 'saudação e confirmação já prontas'),
            ]),
        ],
        arestas=[
            ('tel', 'asr', 'áudio do cliente'),
            ('asr', 'br', 'parcial'),
            ('br', 'seg', 'tokens em fluxo'),
            ('seg', 'pol', 'frase 1, frase 2…'),
            ('cache', 'pol', 'frase já sintetizada'),
            ('pol', 'tel', 'áudio'),
            ('vad', 'seg', 'CORTA'),
            ('tel', 'vad', 'energia do canal'),
        ],
        passos=[
            ('Otimize o primeiro som, não o total',
             'A resposta inteira levar três segundos é aceitável; o silêncio inicial '
             'passar de um é o que soa como queda de ligação. São métricas diferentes e '
             'só uma delas o cliente percebe.',
             ['seg', 'pol'], [('seg', 'pol'), ('pol', 'tel')]),
            ('Segmentar por frase é o que permite começar antes de terminar',
             'Esperar a resposta completa para sintetizar soma as duas latências. Cortar '
             'na primeira frase faz a síntese começar enquanto o modelo ainda escreve.',
             ['seg', 'br'], [('br', 'seg')]),
            ('Interromper exige poder descartar',
             'Quando o cliente fala, o que está na fila de áudio precisa ser jogado fora. '
             'Agente que termina a frase por cima do cliente é pior que agente lento.',
             ['vad', 'seg'], [('tel', 'vad'), ('vad', 'seg')]),
            ('Frase fixa é cacheada, não sintetizada',
             '"Um momento, vou verificar" é sempre igual. Sintetizar de novo é gastar '
             'tempo e dinheiro no trecho onde a latência mais aparece: o começo.',
             ['cache', 'pol'], [('cache', 'pol')]),
            ('Transcrição parcial alimenta o modelo antes do ponto final',
             'Esperar o cliente terminar a frase inteira para começar a pensar adiciona '
             'a duração da fala à latência percebida. A parcial deixa o trabalho começar '
             'junto.',
             ['asr', 'br'], [('asr', 'br')]),
        ],
        legenda='Em voz, a percepção é definida pelo tempo até o primeiro som e pela '
                'capacidade de ser interrompido — não pela latência total nem pela '
                'qualidade do texto. As duas exigem fluxo em todo o caminho.',
    ),
]

PERGUNTAS = [
    ('Qual modelo usar em atendimento de voz com IA na AWS?',
     'Use o menor modelo que cabe no orçamento de latência — em voz, tipicamente um '
     'modelo rápido como Claude Haiku no Bedrock. O requisito manda: acima de cerca de '
     'dois segundos até o primeiro som, o cliente percebe silêncio e desliga, então o '
     'modelo grande é tecnicamente melhor e operacionalmente inviável. A qualidade que '
     'falta vem da recuperação do acervo oficial e do escalonamento para humano, não de '
     'trocar por um modelo maior.'),
    ('Como reduzir o custo de IA em atendimento ao cliente?',
     'A maior alavanca é classificar antes de gerar: mandar toda mensagem ao modelo de '
     'linguagem é o desperdício típico, porque saudação, horário e status de pedido são '
     'consulta, não redação. Um classificador especializado como o Comprehend roteia, e '
     'só o que exige geração chega ao modelo. A métrica a acompanhar é a fração de '
     'mensagens que chega ao modelo — cair de 100% para 35% corta dois terços do custo '
     'sem mexer em modelo nem em prompt.'),
    ('Por que o agente virtual transfere tanto para o atendente humano?',
     'Quase sempre porque ele não tem acesso ao estado real do pedido, e não porque o '
     'modelo seja fraco. Sem ferramenta que consulte o sistema de atendimento, qualquer '
     'pergunta concreta como "onde está minha entrega" só pode terminar em transferência '
     'ou invenção. Dar ferramentas de leitura com escopo por cliente autenticado reduz a '
     'transferência de verdade; melhorar o prompt só faz o agente transferir com mais '
     'elegância.'),
]

QUIZZES = [
    quiz('Um agente de voz precisa responder em até 2,5 s até o primeiro som. Qual '
         'decisão de arquitetura vem PRIMEIRO?',
         ['Escolher o modelo mais capaz e depois otimizar o caminho até caber no prazo',
          'Declarar o prazo como requisito e usá-lo para eliminar modelos candidatos',
          'Aumentar o limite de taxa da conta para o modelo não enfileirar',
          'Trocar a síntese de voz por uma voz padrão mais leve'],
         1,
         'O prazo é o filtro, e ele age antes da escolha do modelo. A primeira opção '
         'inverte a ordem: é o caminho que faz o projeto voltar ao começo quando se '
         'descobre que nenhuma otimização cabe o modelo escolhido no orçamento de '
         'latência. Aumentar o limite de taxa trata enfileiramento por cota, que é outro '
         'problema — não reduz o tempo de geração de uma chamada isolada. Trocar a voz '
         'ataca a ponta final e rende pouco: o silêncio inicial vem de esperar a resposta '
         'inteira antes de sintetizar, o que se resolve com fluxo e segmentação por '
         'frase, não com voz mais leve.'),
    quiz('Um assistente de compras recomenda produtos esgotados. Onde está o defeito?',
         ['O índice vetorial precisa ser reconstruído com um modelo de embedding melhor',
          'Falta a segunda fonte: conhecimento indexado responde "o que combina", não "o que existe agora"',
          'O prompt precisa instruir o modelo a não sugerir item sem estoque',
          'O modelo é pequeno demais para a tarefa de recomendação'],
         1,
         'São dois tipos de dado com ciclos de vida diferentes: descrição de produto muda '
         'raramente e se indexa; quantidade em estoque muda a cada pedido e se consulta. '
         'Reindexar com embedding melhor melhora a relevância da descrição e não sabe '
         'nada sobre estoque. Instruir no prompt confia em o modelo lembrar de uma regra '
         'sobre um dado que ele não tem — ele não tem como saber o que está esgotado. '
         'Trocar por modelo maior não cria informação ausente do contexto: nenhum tamanho '
         'de modelo adivinha o estoque de agora.'),
    quiz('Numa operação de 15 mil chamadas por dia, por que o escalonamento para humano '
         'é desenhado como caminho de primeira classe?',
         ['Porque a legislação exige atendimento humano em todo canal automatizado',
          'Porque o modelo ainda não é bom o bastante, e será removido quando melhorar',
          'Porque no volume, a fração que o modelo erra é grande em número absoluto e precisa de caminho instrumentado',
          'Porque o escalonamento é mais barato que a inferência'],
         2,
         'Um por cento de erro em 15 mil chamadas são 150 clientes por dia — a exceção em '
         'porcentagem é regra em volume, e caminho de exceção sem contexto e sem métrica '
         'é onde a satisfação despenca. A opção legal inverte causa: pode existir '
         'exigência setorial, mas o motivo de engenharia é o volume absoluto. Tratar o '
         'escalonamento como provisório supõe que existe qualidade suficiente para '
         'eliminá-lo, o que nenhum modelo oferece em domínio aberto. E escalonar é mais '
         'caro que inferir, não mais barato: envolve tempo de pessoa.'),
]
