#!/usr/bin/env python3
"""Família 4 — Agentes operacionais, quando a IA precisa agir (soluções 31 a 40)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-agentes'
NOME = 'Agentes operacionais — quando a IA precisa agir'

ABERTURA = [
    p('A diferença entre assistente e agente não é o modelo: é que o agente **age**. E '
      'agir muda a engenharia por completo, porque o erro deixa de ser uma resposta ruim '
      'e passa a ser um efeito no mundo — um pedido cancelado, um valor alterado, um '
      'e-mail enviado. As dez arquiteturas desta família tratam esse deslocamento.'),
    p('O ponto que quase nenhum diagrama de agente mostra: **quem executa a ferramenta é '
      'o seu código**. O modelo devolve a intenção de chamar; a execução, a validação do '
      'argumento, o limite de permissão e o teto de voltas são todos seus. É por isso que '
      'a fronteira de segurança de um agente é o adaptador, nunca o prompt.'),
]

SOLUCOES = [
    Sol(
        n=31,
        titulo='31. Decisão logística que levava horas',
        titulo_diagrama='O ganho vem de o agente ter o estado real, não de ele "pensar melhor"',
        problema='Decidir como remanejar uma carga levava horas porque a informação '
                 'estava em quatro telas: estoque, rota, prazo e custo de frete. O '
                 'analista não pensava devagar — ele passava o tempo coletando o que '
                 'precisava para pensar.',
        checagem=('AgentCore', 'roteirização', 'estoque'),
        grupos=[
            ('Pedido', 'plain', [
                ('op', 'user', 'Operador logístico', 'decide o remanejo e responde por ele'),
                ('ac', 'agentcore', 'AgentCore', 'sessão, memória e rastro'),
            ]),
            ('Ferramentas de estado', 'vpc', [
                ('rt', 'lambda', 'roteirizar', 'tempo e custo por rota'),
                ('es', 'lambda', 'consultarEstoque', 'por centro de distribuição'),
                ('pz', 'lambda', 'prazoPrometido', 'o que o cliente contratou'),
            ]),
            ('Sistemas', 'plain', [
                ('wms', 'erp', 'WMS e TMS', 'a fonte do estado'),
                ('cl', 'claude', 'Claude Sonnet', 'compara opções e justifica'),
            ]),
        ],
        arestas=[
            ('op', 'ac', 'carga atrasada em X'),
            ('ac', 'cl', 'sessão + ferramentas'),
            ('cl', 'rt', 'origem e destino'),
            ('cl', 'es', 'centro de distribuição'),
            ('cl', 'pz', 'número do pedido'),
            ('rt', 'wms', 'consulta de rota'),
            ('es', 'wms', 'consulta de saldo'),
            ('pz', 'wms', 'consulta de prazo'),
            ('wms', 'cl', 'estado real'),
            ('cl', 'op', 'opção recomendada + justificativa'),
        ],
        passos=[
            ('O gargalo era coleta, não raciocínio',
             'Quatro telas, quatro logins, dados que não batem. O agente com ferramentas '
             'faz a coleta em segundos — e é daí que vem a redução de tempo, não de o '
             'modelo raciocinar melhor que a pessoa.',
             ['rt', 'es', 'pz'], [('cl', 'rt'), ('cl', 'es'), ('cl', 'pz')]),
            ('Uma ferramenta por pergunta, não uma que faz tudo',
             'Ferramentas de escopo estreito são testáveis, cacheáveis e autorizáveis '
             'separadamente. A ferramenta genérica "consultarSistema" transfere a decisão '
             'de escopo para o prompt.',
             ['rt', 'es'], [('rt', 'wms'), ('es', 'wms')]),
            ('A justificativa é parte da saída',
             'Recomendação sem o porquê não é aceita por quem responde pela decisão. O '
             'agente devolve a opção e o raciocínio comparativo entre as alternativas.',
             ['cl', 'op'], [('cl', 'op')]),
            ('Leitura antes de escrita',
             'Nesta primeira etapa o agente recomenda e a pessoa executa. Ganha-se a '
             'maior parte do tempo com uma fração do risco — e cria-se o histórico que '
             'justifica automatizar depois.',
             ['op', 'cl'], [('op', 'ac')]),
            ('Modelo intermediário é o ponto de equilíbrio',
             'A tarefa exige comparar alternativas com trade-off, o que pede capacidade; '
             'mas roda dezenas de vezes por hora, o que pede custo. Sonnet fica no meio '
             'por isso.',
             ['cl', 'ac'], [('ac', 'cl')]),
        ],
        legenda='Agente decide rápido porque tem acesso ao estado real em segundos — o '
                'ganho é de coleta, não de raciocínio. E começar por recomendar, com o '
                'humano executando, entrega a maior parte do valor com uma fração do '
                'risco.',
    ),
    Sol(
        n=32,
        titulo='32. Produtos agênticos que precisam sair do protótipo',
        titulo_diagrama='Runtime gerenciado encurta a infraestrutura, não o critério de parada',
        problema='Cinco protótipos funcionam no notebook e nenhum vai a produção. O que '
                 'falta não é o modelo: é sessão que sobrevive a reinício, identidade por '
                 'usuário, rastro por chamada de ferramenta, isolamento entre execuções e '
                 'teto de gasto. Cada time estava construindo os cinco de novo.',
        checagem=('AgentCore Runtime', 'memória', 'observabilidade'),
        grupos=[
            ('O que o runtime entrega', 'plain', [
                ('ac', 'agentcore', 'AgentCore Runtime', 'um encanamento para os cinco produtos'),
                ('mem', 'contexto', 'Memória de sessão', 'sobrevive a reinício'),
                ('idt', 'identitycenter', 'Identidade', 'por usuário, não por serviço'),
                ('obs', 'xray', 'Rastro', 'um trecho por chamada de ferramenta'),
            ]),
            ('O que continua sendo seu', 'plain', [
                ('par', 'politica', 'Critério de parada', 'quando a tarefa está pronta'),
                ('ava', 'eval', 'Avaliação da tarefa', 'o que é uma boa execução'),
                ('fer', 'ferramenta', 'Suas ferramentas', 'e a validação dos argumentos'),
            ]),
            ('Produtos', 'plain', [
                ('p1', 'browser', 'Cinco agentes', 'compartilham o mesmo encanamento'),
            ]),
        ],
        arestas=[
            ('p1', 'ac', 'os cinco usam o mesmo runtime'),
            ('ac', 'mem', 'estado da sessão'),
            ('ac', 'idt', 'identidade do usuário'),
            ('ac', 'obs', 'um trecho por ferramenta'),
            ('ac', 'fer', 'executa'),
            ('par', 'ac', 'define o fim', 'dashed'),
            ('ava', 'p1', 'mede', 'dashed'),
        ],
        passos=[
            ('Cinco times construíam o mesmo encanamento',
             'Sessão, identidade, rastro e isolamento não são diferencial de produto '
             'nenhum. Centralizar isso é a economia real — semanas por produto.',
             ['ac', 'p1'], [('p1', 'ac')]),
            ('Memória que sobrevive a reinício',
             'Agente que perde o estado quando o contêiner recicla obriga o usuário a '
             'recomeçar. É o defeito que mais mata adoção depois do lançamento.',
             ['mem'], [('ac', 'mem')]),
            ('Identidade por usuário, não por serviço',
             'Se todas as chamadas usam a mesma credencial de serviço, o rastro não diz '
             'quem pediu e a permissão não pode ser por pessoa.',
             ['idt'], [('ac', 'idt')]),
            ('O critério de parada continua sendo seu',
             'O runtime não sabe quando a sua tarefa está concluída. Sem esse critério '
             'explícito, o agente para por teto de passos — que é acidente, não decisão.',
             ['par'], [('par', 'ac')]),
            ('Avaliação por produto, não pela plataforma',
             'Cada agente tem sua definição de boa execução. Plataforma comum não produz '
             'critério comum de qualidade.',
             ['ava', 'fer'], [('ava', 'p1'), ('ac', 'fer')]),
        ],
        legenda='Runtime gerenciado resolve o encanamento que cinco times estavam '
                'construindo cinco vezes. O que ele não resolve — critério de parada, '
                'avaliação da tarefa e validação de argumento — é justamente o que '
                'diferencia um agente que funciona.',
    ),
    Sol(
        n=33,
        titulo='33. Pesquisa com etapas manuais repetitivas',
        titulo_diagrama='Agente como orquestrador de ferramenta especializada, não como especialista',
        problema='O pesquisador gasta a maior parte do tempo buscando em bases '
                 'científicas internas, cruzando resultados e formatando tabelas — não '
                 'interpretando. O trabalho intelectual é o menor pedaço do dia, e é o '
                 'único que não deveria ser automatizado.',
        checagem=('Bedrock Agents', 'grupos de ação', 'bases científicas'),
        grupos=[
            ('Pedido', 'plain', [
                ('pes', 'user', 'Pesquisador', 'formula a hipótese'),
                ('ag', 'bedrock', 'Bedrock Agents', 'grupos de ação por base'),
            ]),
            ('Ferramentas especializadas', 'vpc', [
                ('b1', 'lambda', 'Base de compostos', 'consulta estruturada'),
                ('b2', 'lambda', 'Base de ensaios', 'filtro por protocolo'),
                ('b3', 'lambda', 'Literatura interna', 'busca semântica'),
            ]),
            ('Síntese', 'plain', [
                ('cl', 'claude', 'Claude', 'organiza e aponta divergência'),
                ('rev', 'a2i', 'Revisão do especialista', 'a interpretação é dele'),
            ]),
        ],
        arestas=[
            ('pes', 'ag', 'hipótese a investigar'),
            ('ag', 'b1', 'consulta estruturada'),
            ('ag', 'b2', 'filtro por protocolo'),
            ('ag', 'b3', 'busca semântica'),
            ('b1', 'cl', 'resultados de composto'),
            ('b2', 'cl', 'resultados de ensaio'),
            ('b3', 'cl', 'trechos de literatura'),
            ('cl', 'rev', 'tabela + divergências'),
            ('rev', 'pes', 'tabela revisada'),
        ],
        passos=[
            ('O agente coleta; o especialista interpreta',
             'Automatizar a coleta libera o dia para a interpretação. Automatizar a '
             'interpretação produz conclusão que ninguém assina.',
             ['rev', 'cl'], [('cl', 'rev'), ('rev', 'pes')]),
            ('Cada base é uma ferramenta com o filtro dela',
             'Consulta estruturada por composto e busca semântica em literatura são '
               'operações diferentes. Uma ferramenta genérica perderia o filtro que '
                 'cada base oferece.',
             ['b1', 'b2', 'b3'], [('ag', 'b1'), ('ag', 'b2'), ('ag', 'b3')]),
            ('Divergência entre fontes é o achado mais valioso',
             'Quando duas bases discordam, é isso que o pesquisador quer ver primeiro. '
             'Resumo que harmoniza a diferença esconde exatamente o que importa.',
             ['cl'], [('b1', 'cl'), ('b2', 'cl')]),
            ('A saída é tabela, não prosa',
             'O produto do trabalho é comparável e conferível. Prosa fluente exige releitura '
             'da fonte para conferir cada linha.',
             ['cl', 'rev'], [('cl', 'rev')]),
            ('Grupo de ação é o adaptador para a base',
             'Quem consulta é a sua função, com o argumento validado contra o esquema da '
             'base. O modelo pede; o código monta a consulta.',
             ['ag'], [('pes', 'ag'), ('ag', 'b3')]),
        ],
        legenda='Em pesquisa, o agente é orquestrador de ferramenta especializada — não '
                'substituto do especialista. O ganho está no trabalho repetitivo de '
                'coleta e formatação, e a divergência entre fontes é o que ele deve '
                'destacar.',
    ),
    Sol(
        n=34,
        titulo='34. Triagem de alerta de segurança consumindo horas',
        titulo_diagrama='Triar o volume para o analista ficar com o que sobrou',
        problema='Chegam milhares de alertas por dia e a maioria é ruído conhecido. O '
                 'analista gasta o turno abrindo alerta, consultando três sistemas para '
                 'saber se é real e fechando como falso positivo — e o alerta que '
                 'importava fica na fila.',
        checagem=('alerta', 'enriquecimento'),
        grupos=[
            ('Alertas', 'plain', [
                ('gd', 'guardduty', 'Detecção', 'milhares de achados por dia'),
                ('sh', 'securityhub', 'Security Hub', 'fila unificada'),
            ]),
            ('Enriquecimento', 'vpc', [
                ('en', 'lambda', 'Enriquecer', 'ativo, dono, exposição, histórico'),
                ('cmdb', 'erp', 'Inventário', 'dono, criticidade e exposição do ativo'),
            ]),
            ('Triagem', 'plain', [
                ('cl', 'claude', 'Claude', 'classifica com o contexto na mão'),
                ('reg', 'politica', 'Regra de encaminhamento', 'confiança + criticidade do ativo'),
            ]),
            ('Saída', 'plain', [
                ('an', 'user', 'Analista', 'recebe o que exige julgamento'),
                ('auto', 'checkpoint', 'Fechamento automático', 'com justificativa registrada'),
            ]),
        ],
        arestas=[
            ('gd', 'sh', 'achado bruto'),
            ('sh', 'en', 'alerta da fila'),
            ('en', 'cmdb', 'consulta o ativo'),
            ('cmdb', 'cl', 'contexto do ativo'),
            ('en', 'cl', 'alerta + contexto'),
            ('cl', 'reg', 'classe + confiança'),
            ('reg', 'an', 'exige julgamento'),
            ('reg', 'auto', 'ruído conhecido'),
        ],
        passos=[
            ('O enriquecimento é o que torna a triagem possível',
             'Alerta cru não diz se o ativo é crítico nem se aquilo já aconteceu antes. '
             'Sem contexto, a triagem é chute — do modelo e do humano.',
             ['en', 'cmdb'], [('sh', 'en'), ('en', 'cmdb'), ('cmdb', 'cl')]),
            ('O ganho é de volume, não de substituição',
             'O analista continua decidindo os casos difíceis. O que muda é que ele para '
             'de gastar o turno fechando ruído conhecido.',
             ['an', 'reg'], [('reg', 'an')]),
            ('Fechamento automático com justificativa',
             'Fechar sem registrar o porquê é apagar a trilha. A justificativa é o que '
             'permite auditar a triagem e corrigir a regra depois.',
             ['auto'], [('reg', 'auto')]),
            ('A criticidade do ativo entra na regra',
             'O mesmo alerta em servidor de teste e em base de produção tem consequências '
             'diferentes. A regra combina confiança do modelo com criticidade.',
             ['reg', 'cmdb'], [('cl', 'reg')]),
            ('Falso negativo é o risco que se monitora',
             'Amostrar o que foi fechado automaticamente e revisar é o que mede o erro '
             'perigoso — o que não aparece na fila de ninguém.',
             ['auto', 'an'], [('reg', 'an')]),
        ],
        legenda='Em triagem, o ganho é triar: o volume de ruído sai da fila e o analista '
                'fica com o que exige julgamento. O risco a monitorar não é o falso '
                'positivo que sobrou — é o falso negativo que foi fechado sozinho.',
    ),
    Sol(
        n=35,
        titulo='35. Ingestão de fonte de dados que levava semanas',
        titulo_diagrama='O ganho está na descoberta de esquema, que é trabalho repetitivo',
        problema='Integrar cada nova fonte levava semanas, e a maior parte do tempo era '
                 'descobrir o que os campos significam, que tipo têm, onde vêm nulos e '
                 'como se relacionam. Trabalho de detetive, repetido do zero em cada '
                 'fonte nova.',
        checagem=('AgentCore', 'esquema', 'observabilidade'),
        grupos=[
            ('Fonte nova', 'plain', [
                ('src', 'external', 'Fonte', 'esquema desconhecido'),
                ('am', 'dataset', 'Amostra', 'poucos milhares de linhas'),
            ]),
            ('Agente de descoberta', 'vpc', [
                ('ac', 'agentcore', 'AgentCore', 'rastro de cada inferência'),
                ('cl', 'claude', 'Claude', 'infere tipo, chave e relação'),
                ('prof', 'lambda', 'Perfilagem', 'nulos, cardinalidade, faixa'),
            ]),
            ('Saída', 'plain', [
                ('gl', 'glue', 'Pipeline gerado', 'código, não configuração opaca'),
                ('rev', 'a2i', 'Revisão do engenheiro', 'aprova antes de rodar'),
            ]),
        ],
        arestas=[
            ('src', 'am', 'poucos milhares de linhas'),
            ('am', 'prof', 'valores para perfilar'),
            ('prof', 'cl', 'estatística por coluna'),
            ('ac', 'cl', 'sessão com rastro'),
            ('cl', 'gl', 'proposta de pipeline'),
            ('gl', 'rev', 'pipeline proposto'),
            ('rev', 'gl', 'aprovado'),
        ],
        passos=[
            ('Perfilagem antes de inferência',
             'Nulos, cardinalidade e faixa de valor são fatos calculáveis. Dar esses '
             'números ao modelo é diferente de pedir que ele adivinhe pelo nome da coluna.',
             ['prof'], [('am', 'prof'), ('prof', 'cl')]),
            ('A saída é código revisável',
             'Pipeline gerado como código entra em revisão, versionamento e teste. '
             'Configuração gerada dentro de uma ferramenta opaca não entra em nenhum dos '
             'três.',
             ['gl'], [('cl', 'gl')]),
            ('O engenheiro aprova, o agente propõe',
             'Inferência de esquema erra em caso de borda — a coluna que é texto em 99% '
             'das linhas e número em 1%. Aprovação humana é o que impede isso de virar '
             'pipeline em produção.',
             ['rev'], [('gl', 'rev'), ('rev', 'gl')]),
            ('Amostra, não o volume inteiro',
             'Alguns milhares de linhas revelam o esquema. Ler tudo custa caro e não '
             'acrescenta informação sobre estrutura.',
             ['am'], [('src', 'am')]),
            ('O rastro da inferência é o que permite corrigir',
             'Quando o esquema inferido está errado, é preciso saber em que evidência o '
             'agente se baseou. Sem isso, a correção é adivinhação sobre adivinhação.',
             ['ac'], [('ac', 'cl')]),
        ],
        legenda='O ganho é em trabalho repetitivo de descoberta — perfilar, inferir tipo, '
                'propor transformação. A revisão humana continua no caminho porque '
                'inferência de esquema erra justamente no caso de borda que quebra o '
                'pipeline meses depois.',
    ),
    Sol(
        n=36,
        titulo='36. Vários produtos separados fazendo o mesmo',
        titulo_diagrama='Um agente com muitas ferramentas vence seis agentes com uma cada',
        problema='Seis produtos de conformidade, seis agentes, seis prompts que repetem o '
                 'mesmo contexto regulatório. O usuário precisa saber em qual falar, e a '
                 'atualização de uma regra tem de ser feita em seis lugares — sendo que '
                 'geralmente é feita em quatro.',
        checagem=('agente unificado', 'AgentCore', 'ferramenta por produto'),
        grupos=[
            ('Antes', 'plain', [
                ('a1', 'subagente', 'Seis agentes', 'contexto duplicado seis vezes'),
            ]),
            ('Depois', 'plain', [
                ('ac', 'agentcore', 'Um agente', 'contexto regulatório único'),
                ('cl', 'claude', 'Claude', 'escolhe a ferramenta pelo pedido'),
            ]),
            ('Ferramentas por produto', 'vpc', [
                ('f1', 'lambda', 'Produto A', 'permissão restrita ao produto A'),
                ('f2', 'lambda', 'Produto B', 'permissão restrita ao produto B'),
                ('f3', 'lambda', 'Produto C…', 'uma por produto, permissão própria'),
            ]),
            ('Governança', 'plain', [
                ('kb', 'knowledgebases', 'Regras', 'atualiza num lugar'),
            ]),
        ],
        arestas=[
            ('a1', 'ac', 'consolidação'),
            ('ac', 'cl', 'contexto regulatório único'),
            ('cl', 'f1', 'chamada ao produto A'),
            ('cl', 'f2', 'chamada ao produto B'),
            ('cl', 'f3', 'chamada ao produto C'),
            ('kb', 'cl', 'contexto regulatório'),
        ],
        passos=[
            ('Contexto duplicado é regra que envelhece em ritmos diferentes',
             'Seis prompts com o mesmo trecho normativo divergem na primeira atualização. '
             'Um acervo consultado por um agente não tem como divergir de si mesmo.',
             ['kb', 'ac'], [('kb', 'cl'), ('a1', 'ac')]),
            ('Uma ferramenta por produto, com permissão própria',
             'Consolidar o agente não é consolidar a autorização. Cada ferramenta mantém '
             'o escopo do produto que ela representa.',
             ['f1', 'f2', 'f3'], [('cl', 'f1'), ('cl', 'f2'), ('cl', 'f3')]),
            ('O usuário deixa de escolher a porta',
             'Ter de saber em qual dos seis perguntar é fricção que reduz uso. Uma porta '
             'que roteia internamente resolve isso sem juntar os sistemas.',
             ['ac', 'cl'], [('ac', 'cl')]),
            ('O limite da consolidação é o contexto',
             'Muitas ferramentas descritas no mesmo pedido encarecem cada chamada e '
             'confundem a escolha. Passando de algumas dezenas, roteie antes de listar.',
             ['cl', 'f3'], [('cl', 'f3')]),
            ('Um lugar para atualizar a regra',
             'É o ganho operacional que sobrevive: mudança regulatória entra uma vez e '
             'vale para todos os produtos no mesmo instante.',
             ['kb'], [('kb', 'cl')]),
        ],
        legenda='Consolidar em um agente com muitas ferramentas elimina contexto '
                'duplicado e o dever de o usuário escolher a porta. O limite é o tamanho '
                'do contexto: passando de algumas dezenas de ferramentas, roteie antes de '
                'descrever todas.',
    ),
    Sol(
        n=37,
        titulo='37. Agente que precisa agir em sistema legado',
        titulo_diagrama='A fronteira de segurança é o adaptador, não o prompt',
        problema='O sistema que precisa ser alterado é um ERP de vinte anos, sem API '
                 'moderna, onde uma escrita errada não tem desfazer. Dar ao agente acesso '
                 'direto é inaceitável; não dar acesso nenhum torna o agente inútil.',
        checagem=('adaptador', 'validação de argumento'),
        grupos=[
            ('Agente', 'plain', [
                ('cl', 'claude', 'Claude', 'devolve a INTENÇÃO de chamar'),
            ]),
            ('Adaptador — a fronteira', 'vpc', [
                ('val', 'lambda', 'Validação', 'tipo, faixa, obrigatório, valor permitido'),
                ('aut', 'iam', 'Autorização', 'papel por ferramenta, não por agente'),
                ('idem', 'dynamodb', 'Idempotência', 'a mesma intenção não executa duas vezes'),
            ]),
            ('Legado', 'account', [
                ('erp', 'legado', 'ERP / mainframe', 'sem desfazer'),
                ('log', 'cloudtrail', 'Registro da escrita', 'antes e depois'),
            ]),
        ],
        arestas=[
            ('cl', 'val', 'intenção + argumentos'),
            ('val', 'aut', 'passou na forma'),
            ('aut', 'idem', 'pode executar'),
            ('idem', 'erp', 'executa uma vez'),
            ('erp', 'log', 'antes e depois da escrita'),
            ('val', 'cl', 'recusa explícita com o motivo'),
        ],
        passos=[
            ('O modelo não executa — ele pede',
             'A saída do modelo é dado: nome da ferramenta e argumentos. Quem executa é o '
             'seu código, e é ali que toda decisão de segurança cabe.',
             ['cl', 'val'], [('cl', 'val')]),
            ('Validar a forma antes da permissão',
             'Argumento fora de faixa é recusado sem consultar autorização. Barato, '
             'determinístico e imune a qualquer instrução hostil no contexto.',
             ['val'], [('val', 'aut')]),
            ('Papel por ferramenta',
             'Se todas as ferramentas usam a mesma credencial, a permissão é a união de '
             'tudo que o agente pode fazer. Uma credencial por ferramenta é o que torna o '
             'menor privilégio possível.',
             ['aut'], [('aut', 'idem')]),
            ('Idempotência porque a repetição é certa',
             'Tempo esgotado, reentrega de fila, nova tentativa do agente. Sem chave, a '
             'mesma escrita acontece duas vezes num sistema sem desfazer.',
             ['idem'], [('idem', 'erp')]),
            ('Recusa explícita, com o motivo',
             'Devolver vazio faz o modelo tentar de novo. Devolver "campo X fora da faixa '
             'permitida" encerra o laço e ainda ensina a próxima tentativa.',
             ['val', 'cl'], [('val', 'cl')]),
        ],
        legenda='Quem executa a ferramenta é o seu código: validação, autorização e '
                'idempotência moram no adaptador. Nenhuma instrução no prompt substitui '
                'isso — e num sistema sem desfazer, a diferença é permanente.',
    ),
    Sol(
        n=38,
        titulo='38. Agente entra em laço e consome orçamento',
        titulo_diagrama='Vazio é ambíguo: "nenhum resultado" encerra o laço',
        problema='A conta de inferência triplicou num dia. A causa: uma ferramenta que '
                 'devolvia lista vazia quando não achava nada, o modelo interpretava como '
                 'falha transitória e tentava de novo — dezenas de vezes, na mesma '
                 'sessão, até o tempo esgotar.',
        checagem=('Teto de passos', 'erro explícito'),
        grupos=[
            ('Laço', 'vpc', [
                ('cl', 'claude', 'Claude', 'repete a chamada quando a resposta é ambígua'),
                ('fer', 'ferramenta', 'Ferramenta', 'devolve resposta EXPLÍCITA'),
            ]),
            ('Limites no código', 'plain', [
                ('pas', 'politica', 'Teto de passos', 'por sessão'),
                ('gas', 'budgets', 'Teto de gasto', 'por sessão e por dia'),
                ('rep', 'checkpoint', 'Detector de repetição', 'mesma chamada, mesmos argumentos'),
            ]),
            ('Saída', 'plain', [
                ('fim', 'alerta', 'Encerramento', 'com o que conseguiu até aqui'),
                ('cw', 'cloudwatch', 'Passos por sessão', 'a métrica que revela o laço'),
            ]),
        ],
        arestas=[
            ('cl', 'fer', 'chama'),
            ('fer', 'cl', '"nenhum resultado" — não vazio'),
            ('pas', 'cl', 'interrompe', 'dashed'),
            ('gas', 'cl', 'interrompe', 'dashed'),
            ('rep', 'cl', 'interrompe', 'dashed'),
            ('cl', 'fim', 'resultado parcial'),
            ('cl', 'cw', 'passos e tokens da sessão', 'dashed'),
        ],
        passos=[
            ('Vazio e "não existe" são coisas diferentes',
             'Lista vazia pode significar falha, filtro errado ou ausência real. O modelo '
             'escolhe a interpretação otimista e tenta de novo. Dizer "nenhum resultado '
             'para este filtro" fecha a questão.',
             ['fer', 'cl'], [('fer', 'cl')]),
            ('O teto é do código, não da vigilância',
             'Ninguém está olhando o painel às três da manhã. Teto de passos e de gasto '
             'por sessão são a única proteção que funciona sem alguém acordado.',
             ['pas', 'gas'], [('pas', 'cl'), ('gas', 'cl')]),
            ('Repetição idêntica é sinal de laço',
             'Mesma ferramenta, mesmos argumentos, terceira vez. Interromper aí é mais '
             'preciso que esperar o teto de passos — e mais barato.',
             ['rep'], [('rep', 'cl')]),
            ('Encerrar com resultado parcial é melhor que encerrar seco',
             '"Não consegui confirmar o estoque, mas a rota é esta" é útil. Interromper '
             'sem devolver nada joga fora o trabalho já pago.',
             ['fim'], [('cl', 'fim')]),
            ('Passos por sessão é a métrica que revela',
             'Custo total sobe por muitos motivos. Distribuição de passos por sessão '
             'mostra o laço no dia em que ele começa, não no fim do mês.',
             ['cw'], [('cl', 'cw')]),
        ],
        legenda='Laço de agente é quase sempre ferramenta ambígua, não modelo confuso. '
                'Resposta explícita encerra a decisão; teto de passos e de gasto no código '
                'são a rede que impede o resto de virar fatura.',
    ),
    Sol(
        n=39,
        titulo='39. Ação irreversível disparada por decisão automática',
        titulo_diagrama='Separar leitura de escrita é o que permite permissão granular',
        problema='O agente cancelou um pedido de verdade durante um teste, porque a mesma '
                 'ferramenta que consultava também alterava. Não havia como liberar a '
                 'consulta sem liberar a alteração — a ferramenta era uma só.',
        checagem=('Confirmação humana', 'ferramenta de escrita', 'registro'),
        grupos=[
            ('Agente', 'plain', [
                ('cl', 'claude', 'Claude', 'propõe a ação; não executa'),
            ]),
            ('Ferramentas de leitura', 'vpc', [
                ('r1', 'lambda', 'consultar', 'liberada para todos os casos'),
            ]),
            ('Ferramentas de escrita', 'vpc', [
                ('w1', 'lambda', 'cancelar', 'exige confirmação'),
                ('conf', 'a2i', 'Confirmação humana', 'mostra o efeito ANTES'),
                ('log', 'cloudtrail', 'Registro', 'quem confirmou, com quais argumentos'),
            ]),
            ('Sistema', 'plain', [
                ('sis', 'erp', 'Sistema de pedidos', 'cancelamento aqui não tem desfazer'),
            ]),
        ],
        arestas=[
            ('cl', 'r1', 'sempre'),
            ('r1', 'sis', 'consulta de pedido'),
            ('cl', 'w1', 'propõe'),
            ('w1', 'conf', 'aguarda'),
            ('conf', 'w1', 'confirmado'),
            ('w1', 'sis', 'executa'),
            ('w1', 'log', 'ação + quem confirmou'),
        ],
        passos=[
            ('Uma ferramenta que lê e escreve não se autoriza pela metade',
             'É a razão técnica de separar: permissão é por ferramenta. Juntas, liberar a '
             'consulta libera a alteração.',
             ['r1', 'w1'], [('cl', 'r1'), ('cl', 'w1')]),
            ('A confirmação mostra o efeito antes de acontecer',
             '"Cancelar pedido 8842, valor R$ 4.310, cliente X" é confirmável. "Executar '
             'ação?" não é — e quem confirma sem entender confirma tudo.',
             ['conf'], [('w1', 'conf'), ('conf', 'w1')]),
            ('Irreversível exige humano; reversível pode não exigir',
             'O critério não é a importância: é a possibilidade de desfazer. Ação com '
             'desfazer barato pode ser automática, com alarme.',
             ['w1', 'sis'], [('w1', 'sis')]),
            ('Quem confirmou entra no registro',
             'A trilha precisa do ator humano, não só do agente. É a diferença entre '
             '"o sistema cancelou" e "o supervisor autorizou o cancelamento proposto".',
             ['log'], [('w1', 'log')]),
            ('Leitura liberada é o que mantém o agente útil',
             'Restringir tudo por causa da escrita mata o valor. A separação é o que '
             'permite ser permissivo onde não há dano.',
             ['r1'], [('r1', 'sis')]),
        ],
        legenda='Separar leitura de escrita é pré-requisito de permissão granular — e a '
                'confirmação humana só funciona se mostrar o efeito concreto antes. '
                'O critério para exigir confirmação é reversibilidade, não importância.',
    ),
    Sol(
        n=40,
        titulo='40. Agente que precisa reagir a mudança',
        titulo_diagrama='Agente orientado a evento troca consulta periódica por reação',
        problema='O agente rodava a cada quinze minutos verificando se algo mudou. Na '
                 'maior parte das execuções nada havia mudado — e ele pagava a chamada '
                 'para descobrir isso. Quando algo mudava, a reação chegava com até '
                 'quinze minutos de atraso.',
        checagem=('EventBridge', 'AgentCore', 'Knowledge Bases'),
        grupos=[
            ('Origem do evento', 'plain', [
                ('src', 'external', 'Sistema de origem', 'estado mudou'),
                ('ev', 'eventbridge', 'EventBridge', 'filtro por padrão de evento'),
            ]),
            ('Reação', 'vpc', [
                ('ac', 'agentcore', 'AgentCore', 'acorda só quando há o que fazer'),
                ('kb', 'knowledgebases', 'Knowledge Bases', 'o procedimento para aquele caso'),
                ('fer', 'lambda', 'Ferramenta de ação', 'age no que o procedimento recuperado manda'),
            ]),
            ('Controle', 'plain', [
                ('dlq', 'sqs', 'Fila de descarte', 'evento que falhou não desaparece'),
                ('cw', 'cloudwatch', 'Execuções por hora', 'e o custo de ociosidade zerado'),
            ]),
        ],
        arestas=[
            ('src', 'ev', 'mudança de estado'),
            ('ev', 'ac', 'só o que casa com o padrão'),
            ('ac', 'kb', 'qual o procedimento?'),
            ('kb', 'ac', 'procedimento do caso'),
            ('ac', 'fer', 'age'),
            ('ac', 'dlq', 'falhou'),
            ('ac', 'cw', 'execuções e custo', 'dashed'),
        ],
        passos=[
            ('Consulta periódica paga pelo intervalo, não pelo trabalho',
             'Rodar a cada quinze minutos custa 96 execuções por dia mesmo em dia sem '
             'mudança nenhuma. O evento custa proporcional ao que aconteceu.',
             ['ev', 'ac'], [('src', 'ev'), ('ev', 'ac')]),
            ('O filtro fica no barramento, não no agente',
             'Filtrar por padrão de evento antes de acordar o agente é ordens de magnitude '
             'mais barato que acordá-lo para ele decidir que não era relevante.',
             ['ev'], [('ev', 'ac')]),
            ('O procedimento é recuperado, não codificado',
             'O que fazer em cada tipo de mudança está no acervo de procedimentos. Muda '
             'sem alterar o agente.',
             ['kb'], [('ac', 'kb'), ('kb', 'ac')]),
            ('Evento que falhou precisa de destino',
             'Sem fila de descarte, a falha desaparece — e ninguém sabe que a reação não '
             'aconteceu. É pior que o atraso da consulta periódica.',
             ['dlq'], [('ac', 'dlq')]),
            ('A latência de reação cai para segundos',
             'É o ganho de produto, além do custo: a ação acontece quando o fato acontece, '
             'não no próximo ciclo.',
             ['cw', 'fer'], [('ac', 'fer'), ('ac', 'cw')]),
        ],
        legenda='Reagir a evento troca custo proporcional ao intervalo por custo '
                'proporcional ao que aconteceu — e derruba a latência de reação para '
                'segundos. O que a consulta periódica dava de graça e agora precisa ser '
                'desenhado é o destino do evento que falhou.',
    ),
]

PERGUNTAS = [
    ('Quem executa a ferramenta que o agente de IA chama?',
     'O seu código, sempre. O modelo devolve apenas a intenção de chamar — nome da '
     'ferramenta e argumentos — como dado estruturado; quem executa, valida o argumento, '
     'aplica a permissão e conta as voltas é o adaptador que você escreveu. Essa é a razão '
     'de a fronteira de segurança de um agente ser o adaptador e nunca o prompt: instrução '
     'no contexto tem taxa de falha, e validação de tipo e faixa no código não tem.'),
    ('Como evitar que um agente de IA entre em laço e estoure o orçamento?',
     'Devolvendo resposta explícita nas ferramentas e pondo teto de passos e de gasto no '
     'código. A causa mais comum de laço é ferramenta que devolve lista vazia quando não '
     'encontra nada: o modelo lê isso como falha transitória e tenta de novo. Trocar por '
     '"nenhum resultado para este filtro" encerra a decisão. Além disso, teto de passos por '
     'sessão, teto de gasto e detector de chamada repetida com os mesmos argumentos — '
     'porque às três da manhã ninguém está olhando o painel.'),
    ('Quando um agente de IA precisa de confirmação humana antes de agir?',
     'Quando a ação não tem desfazer barato — o critério é reversibilidade, não '
     'importância. Ação reversível pode ser automática com alarme; ação irreversível, como '
     'cancelar pedido ou emitir pagamento, passa por confirmação que mostre o efeito '
     'concreto antes: "cancelar pedido 8842, valor R$ 4.310, cliente X". Isso exige que '
     'leitura e escrita sejam ferramentas separadas, porque permissão é concedida por '
     'ferramenta e uma que faz as duas coisas não se autoriza pela metade.'),
]

QUIZZES = [
    quiz('Uma ferramenta de agente devolve lista vazia quando não encontra registro. Qual '
         'a consequência mais provável?',
         ['O agente responde que não há informação, o que é o comportamento correto',
          'O modelo interpreta como falha transitória e repete a chamada, consumindo orçamento',
          'A validação de argumento rejeita a próxima chamada automaticamente',
          'O teto de gasto impede qualquer efeito, então não é um problema real'],
         1,
         'Vazio é ambíguo: pode ser falha, filtro errado ou ausência real, e o modelo tende '
         'à leitura otimista de tentar novamente. A primeira opção descreve o que se '
         'gostaria que acontecesse, e é justamente o que não acontece sem resposta '
         'explícita. A validação de argumento olha a forma da chamada, e a chamada repetida '
         'é formalmente válida — ela passa. O teto de gasto limita o dano, mas o dano já '
         'ocorreu: chegar ao teto por laço significa ter pago o laço inteiro e ainda '
         'terminar sem resposta.'),
    quiz('Por que separar ferramentas de leitura e de escrita num agente?',
         ['Para reduzir o número de tokens gastos na descrição das ferramentas',
          'Porque permissão é concedida por ferramenta, e uma que lê e escreve não se autoriza pela metade',
          'Porque o modelo escolhe melhor entre ferramentas de nome curto',
          'Para permitir cache do resultado da leitura sem invalidar a escrita'],
         1,
         'A permissão é o motivo estrutural: com uma ferramenta única, liberar a consulta '
         'libera a alteração, e não existe meio de conceder só metade. Separar não reduz '
         'tokens — descrever duas ferramentas custa um pouco mais que descrever uma. O nome '
         'influencia pouco a escolha comparado à descrição. E o cache é um benefício '
         'secundário real, mas ele não é o que impede o agente de cancelar um pedido de '
         'verdade durante um teste.'),
    quiz('Um agente roda a cada 15 minutos verificando se algo mudou. Qual mudança melhora '
         'custo E latência ao mesmo tempo?',
         ['Aumentar o intervalo para 60 minutos e usar um modelo menor',
          'Disparar o agente por evento, com filtro por padrão no barramento',
          'Manter a consulta periódica, mas cachear a última resposta',
          'Rodar as verificações em lote uma vez por dia'],
         1,
         'A consulta periódica paga pelo intervalo, não pelo trabalho: 96 execuções por dia '
         'mesmo sem mudança nenhuma, e até 15 minutos de atraso quando há. O evento inverte '
         'os dois — custo proporcional ao que aconteceu e reação em segundos. Aumentar o '
         'intervalo reduz custo e piora a latência; é troca, não melhoria dupla. Cachear '
         'não elimina a execução ociosa, que é o custo. E o lote diário reduz custo ao '
         'preço da pior latência de todas as opções.'),
]
