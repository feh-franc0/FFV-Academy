#!/usr/bin/env python3
"""Família 5 — Copiloto de engenharia e produtividade interna (soluções 41 a 50)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-copiloto'
NOME = 'Copiloto de engenharia e produtividade interna'

ABERTURA = [
    p('Esta é a família com mais retorno e menos apresentação: **IA voltada para '
      'dentro**. O material já está digitalizado — código, runbook, histórico de '
      'incidente, decisão de arquitetura —, o usuário é colega e não cliente, e o custo '
      'de um erro é uma correção em vez de uma captura de tela no Twitter. É o melhor '
      'lugar para começar, e quase sempre não é onde as empresas começam.'),
    p('A decisão que atravessa as dez: **o agente propõe, o humano publica**. Revisão de '
      'código, atualização de documentação, geração de SQL, modernização de legado — em '
      'todos os casos o padrão que funciona coloca a saída num pedido de mesclagem, num '
      'painel de aprovação ou numa réplica de leitura, e não direto no destino final.'),
]

SOLUCOES = [
    Sol(
        n=41,
        titulo='41. Modernizar aplicação legada com esforço alto',
        titulo_diagrama='Em migração, o ganho está no trabalho mecânico — a revisão continua humana',
        problema='Migrar uma aplicação de vinte anos é sobretudo trabalho mecânico: '
                 'traduzir sintaxe, trocar biblioteca, reescrever acesso a dados. O '
                 'trabalho difícil — decidir o que a regra de negócio realmente faz — é a '
                 'menor parte do esforço e a que mais custa errar.',
        checagem=('AWS Transform', 'revisão humana'),
        grupos=[
            ('Entrada', 'plain', [
                ('rep', 'ide', 'Repositório legado', 'código, dependências, testes'),
                ('inv', 'lambda', 'Inventário', 'módulos, acoplamento, cobertura'),
            ]),
            ('Transformação', 'plain', [
                ('tf', 'transform', 'AWS Transform', 'tradução mecânica por módulo'),
                ('cl', 'claude', 'Claude', 'explica o que a regra faz'),
            ]),
            ('Revisão', 'plain', [
                ('pr', 'codepipeline', 'Pedido de mesclagem', 'um por módulo, revisável'),
                ('tst', 'eval', 'Testes existentes', 'o critério de equivalência'),
                ('eng', 'user', 'Engenheiro', 'aprova módulo por módulo'),
            ]),
        ],
        arestas=[
            ('rep', 'inv', 'código e dependências'),
            ('inv', 'tf', 'ordem por acoplamento'),
            ('tf', 'pr', 'código traduzido'),
            ('tf', 'cl', 'regra obscura'),
            ('cl', 'pr', 'explicação anexada'),
            ('pr', 'tst', 'roda a suíte do legado'),
            ('tst', 'eng', 'passou / falhou'),
            ('eng', 'rep', 'mescla'),
        ],
        passos=[
            ('Inventariar antes de traduzir',
             'A ordem da migração sai do acoplamento: módulo folha primeiro. Traduzir na '
             'ordem alfabética garante conflito no meio do caminho.',
             ['inv'], [('rep', 'inv'), ('inv', 'tf')]),
            ('Um pedido de mesclagem por módulo',
             'Migração inteira num pedido só não é revisável — ninguém lê 40 mil linhas. '
             'Fatiar é o que transforma a revisão em trabalho possível.',
             ['pr'], [('tf', 'pr')]),
            ('O teste existente é o critério de equivalência',
             'A pergunta não é "o código novo é bonito?": é "faz a mesma coisa?". Sem '
             'suíte, o primeiro trabalho da migração é escrever teste sobre o legado.',
             ['tst'], [('pr', 'tst'), ('tst', 'eng')]),
            ('O modelo explica a regra obscura',
             'Aquele bloco de 1998 sem comentário. Fazer o modelo descrever o que ele faz '
             'acelera a revisão mais que a tradução em si.',
             ['cl'], [('tf', 'cl'), ('cl', 'pr')]),
            ('O ganho é mecânico e é grande',
             'Centenas de dias de engenharia economizados em tradução repetitiva. A '
             'decisão de negócio continua sendo humana — e é ela que define se a migração '
             'foi correta.',
             ['eng', 'tf'], [('eng', 'rep')]),
        ],
        legenda='Em migração, o retorno vem do trabalho mecânico e repetitivo — e a '
                'revisão humana por módulo é o que impede a tradução de mudar o '
                'comportamento sem ninguém perceber. Sem suíte de teste, o primeiro passo '
                'é escrevê-la.',
    ),
    Sol(
        n=42,
        titulo='42. Pergunta repetida no canal do time',
        titulo_diagrama='O caso de retorno mais rápido: material interno já é digitalizado',
        problema='A mesma pergunta aparece no canal toda semana, e a resposta está num '
                 'incidente de oito meses atrás que ninguém acha. O engenheiro sênior '
                 'responde de novo, e o conhecimento continua não sendo recuperável.',
        checagem=('Knowledge Bases', 'runbook', 'citação'),
        grupos=[
            ('Acervo interno', 'plain', [
                ('cod', 'ide', 'Código e ADRs', 'e as decisões de arquitetura registradas'),
                ('run', 'doc', 'Runbooks', 'o procedimento que o time já escreveu'),
                ('inc', 'audit', 'Histórico de incidente', 'a fonte mais subaproveitada'),
                ('kb', 'knowledgebases', 'Knowledge Bases', 'ingestão por evento no repositório'),
            ]),
            ('Canal', 'plain', [
                ('sl', 'slack', 'Canal do time', 'onde a pergunta já acontece'),
                ('cl', 'claude', 'Claude', 'responde com link do trecho'),
            ]),
            ('Aprendizado', 'plain', [
                ('nao', 'metrica', 'Perguntas sem resposta', 'a lista do que documentar'),
            ]),
        ],
        arestas=[
            ('cod', 'kb', 'código e ADRs indexados'),
            ('run', 'kb', 'procedimentos indexados'),
            ('inc', 'kb', 'incidentes indexados'),
            ('sl', 'cl', 'pergunta'),
            ('cl', 'kb', 'consulta do canal'),
            ('kb', 'cl', 'trechos + origem'),
            ('cl', 'sl', 'resposta com link'),
            ('cl', 'nao', 'não encontrei', 'dashed'),
        ],
        passos=[
            ('O acervo já existe — é o diferencial deste caso',
             'Nada precisa ser escrito antes: código, runbook e incidente estão '
             'digitalizados. É por isso que este é o caso de retorno mais rápido da lista.',
             ['cod', 'run', 'inc'], [('cod', 'kb'), ('inc', 'kb')]),
            ('O histórico de incidente é a fonte mais valiosa',
             'Ele contém o que deu errado, por que e como foi resolvido — exatamente o que '
             'a pergunta repetida procura. E é o que ninguém indexa.',
             ['inc'], [('inc', 'kb')]),
            ('Onde a pergunta já acontece',
             'Assistente em portal separado não é usado. Responder no canal em que a '
             'pergunta já é feita elimina a fricção que mata a adoção.',
             ['sl'], [('sl', 'cl'), ('cl', 'sl')]),
            ('Link do trecho, não resumo solto',
             'Quem pergunta muitas vezes precisa do documento inteiro depois. O link é '
             'metade do valor da resposta.',
             ['cl', 'kb'], [('kb', 'cl')]),
            ('O que ele não responde é a lista de tarefas',
             'Pergunta sem resposta no acervo indica lacuna real de documentação. Essa '
             'lista vale mais que a taxa de acerto.',
             ['nao'], [('cl', 'nao')]),
        ],
        legenda='É o caso com retorno mais rápido e menor risco de imagem: material '
                'interno já digitalizado, usuário colega, erro corrigível. E o que o '
                'assistente NÃO consegue responder é a melhor lista de documentação que '
                'você vai ter.',
    ),
    Sol(
        n=43,
        titulo='43. Revisão de código que não escala',
        titulo_diagrama='"Revise este PR" produz opinião; critério de saída produz achado acionável',
        problema='Quatro pessoas revisam o que quarenta escrevem, e a revisão vira '
                 'gargalo. Ligar um revisor automático genérico piora: ele comenta estilo '
                 'em vinte linhas por pedido, e o time aprende a ignorar todos os '
                 'comentários — inclusive os certos.',
        checagem=('CI', 'diff', 'critério de saída'),
        grupos=[
            ('Gatilho', 'plain', [
                ('pr', 'codepipeline', 'CI no pedido de mesclagem', 'roda a cada pedido de mesclagem, não a cada commit'),
                ('dif', 'doc', 'Diff + contexto', 'arquivos vizinhos e testes tocados'),
            ]),
            ('Revisão', 'plain', [
                ('cl', 'claude', 'Claude', 'critério estreito e explícito'),
                ('cri', 'politica', 'Critério de saída', 'só o que quebra em produção'),
            ]),
            ('Saída', 'plain', [
                ('com', 'ide', 'Comentário com arquivo e linha', 'acionável ou nada'),
                ('sup', 'metrica', 'Taxa de supressão', 'quantos achados o time descarta'),
            ]),
        ],
        arestas=[
            ('pr', 'dif', 'só o que mudou'),
            ('dif', 'cl', 'diff + vizinhança'),
            ('cri', 'cl', 'define o que reportar', 'dashed'),
            ('cl', 'com', 'achado com endereço'),
            ('com', 'sup', 'quantos foram descartados', 'dashed'),
        ],
        passos=[
            ('O critério de saída é a peça de engenharia',
             '"Aponte só o que quebra em produção, com arquivo e linha" produz achado '
             'acionável. "Revise este PR" produz parágrafo genérico que ninguém aplica.',
             ['cri', 'cl'], [('cri', 'cl')]),
            ('Diff mais contexto, não o repositório inteiro',
             'O modelo precisa dos arquivos vizinhos e dos testes tocados. Mandar o '
             'repositório encarece e dilui a atenção no que mudou.',
             ['dif'], [('pr', 'dif'), ('dif', 'cl')]),
            ('Comentário sem endereço não é revisão',
             'Arquivo e linha são o que permite agir. Achado sem localização o revisor '
             'humano tem de reencontrar — e não reencontra.',
             ['com'], [('cl', 'com')]),
            ('A taxa de supressão mede o revisor',
             'Se o time descarta a maior parte dos achados, o revisor está gastando '
             'atenção. É o sinal para estreitar o critério, não para insistir.',
             ['sup'], [('com', 'sup')]),
            ('Ruído destrói a confiança de forma permanente',
             'Depois que o time aprende a ignorar o robô, o achado correto também é '
             'ignorado. Recuperar essa confiança é mais difícil que ligar a ferramenta.',
             ['sup', 'cri'], [('com', 'sup')]),
        ],
        legenda='Revisão automática vive ou morre pelo critério de saída. Comentário sem '
                'endereço e achado de estilo ensinam o time a ignorar o robô — e a partir '
                'daí o achado correto também é ignorado.',
    ),
    Sol(
        n=44,
        titulo='44. Geração de código sem barreira de segurança',
        titulo_diagrama='Guardrails filtra o que o modelo produz; permissão impede o que ele executa',
        problema='O assistente de código sugere trechos com credencial em texto puro, '
                 'chamada insegura e dependência abandonada. Filtrar a saída ajuda — mas '
                 'confundir esse filtro com controle de execução é o erro que deixa a '
                 'porta aberta.',
        checagem=('Guardrails', 'política de conteúdo', 'segredo'),
        grupos=[
            ('Geração', 'plain', [
                ('ide', 'ide', 'Editor', 'onde a sugestão aparece para o desenvolvedor'),
                ('br', 'bedrock', 'Bedrock', 'gera sob a política de conteúdo declarada'),
                ('gr', 'guardrails', 'Guardrails', 'padrão de segredo e conteúdo'),
            ]),
            ('O que impede execução', 'plain', [
                ('iam', 'iam', 'Permissão do ambiente', 'o que o código PODE fazer'),
                ('sec', 'secretsmanager', 'Segredo gerenciado', 'não existe credencial para colar'),
                ('sca', 'securityhub', 'Varredura no CI', 'dependência e padrão inseguro'),
            ]),
            ('Registro', 'plain', [
                ('cw', 'cloudwatch', 'Bloqueios por tipo', 'o que o time mais tenta gerar'),
            ]),
        ],
        arestas=[
            ('ide', 'br', 'trecho pedido'),
            ('br', 'gr', 'antes de exibir'),
            ('gr', 'ide', 'sugestão filtrada'),
            ('gr', 'cw', 'bloqueio por tipo', 'dashed'),
            ('ide', 'sca', 'no pedido de mesclagem'),
            ('sec', 'iam', 'não há credencial para colar', 'dashed'),
            ('sca', 'iam', 'confere permissão pedida'),
        ],
        passos=[
            ('Guardrails atua na saída do modelo',
             'Ele impede que um trecho com credencial ou padrão proibido apareça. É filtro '
             'de conteúdo — e para isso funciona bem.',
             ['gr'], [('br', 'gr'), ('gr', 'ide')]),
            ('O que impede dano é a permissão do ambiente',
             'Código que pede acesso amplo falha por falta de permissão, não por filtro '
             'de texto. Confundir os dois é achar que o filtro protege a produção.',
             ['iam'], [('sca', 'iam')]),
            ('Credencial gerenciada elimina a tentação',
             'Se não existe credencial em variável de ambiente para copiar, não há o que '
             'colar no código. Remover a possibilidade vence filtrar a ocorrência.',
             ['sec'], [('sec', 'iam')]),
            ('A varredura no CI é a rede de baixo',
             'Filtro na geração pega o que passa pelo assistente. A varredura pega também '
             'o que a pessoa escreveu à mão — que continua sendo a maior parte.',
             ['sca'], [('ide', 'sca')]),
            ('Bloqueio por tipo é sinal de treinamento',
             'Se o time tenta gerar o mesmo padrão proibido toda semana, falta '
             'biblioteca interna ou falta clareza — não falta filtro.',
             ['cw'], [('gr', 'cw')]),
        ],
        legenda='Filtro de conteúdo e controle de execução resolvem problemas diferentes: '
                'um decide o que aparece na tela, o outro o que acontece na conta. Tratar '
                'o primeiro como se fosse o segundo é o erro que deixa a porta aberta.',
    ),
    Sol(
        n=45,
        titulo='45. Documentação que envelhece',
        titulo_diagrama='O padrão é o agente PROPOR, não publicar',
        problema='A documentação descreve o sistema de dois anos atrás, e cada '
                 'divergência descoberta custa uma hora de alguém. Gerar documentação '
                 'automaticamente parece a solução óbvia — e publicar sem revisão troca '
                 'documentação velha por documentação errada, que é pior.',
        checagem=('lote', 'pedido de mesclagem'),
        grupos=[
            ('Gatilho', 'plain', [
                ('cron', 'relogio', 'Semanal', 'ou por mudança relevante'),
                ('rep', 'ide', 'Repositório', 'código + documentação atual'),
            ]),
            ('Detecção de divergência', 'vpc', [
                ('dif', 'lambda', 'Comparador', 'o que o código faz vs. o que o doc diz'),
                ('lote', 'lote', 'Bedrock em lote', 'ninguém está esperando'),
            ]),
            ('Proposta', 'plain', [
                ('pr', 'codepipeline', 'Pedido de mesclagem', 'com o antes e o depois'),
                ('don', 'user', 'Dono do módulo', 'aprova ou descarta'),
            ]),
        ],
        arestas=[
            ('cron', 'dif', 'dispara a comparação'),
            ('rep', 'dif', 'código e documentação atual'),
            ('dif', 'lote', 'só o divergente'),
            ('lote', 'pr', 'texto proposto'),
            ('pr', 'don', 'proposta com o antes e o depois'),
            ('don', 'rep', 'mesclado'),
        ],
        passos=[
            ('Propor, não publicar',
             'Documentação gerada sem revisão vira ruído com aparência de oficial. Um '
             'pedido de mesclagem preserva o controle e mantém o histórico.',
             ['pr', 'don'], [('lote', 'pr'), ('pr', 'don')]),
            ('Só o que divergiu',
             'Regerar a documentação inteira produz um pedido de mesclagem impossível de '
             'revisar. Detectar divergência primeiro é o que torna a proposta pequena.',
             ['dif'], [('dif', 'lote')]),
            ('Em lote, porque não há ninguém esperando',
             'Esse trabalho roda de madrugada. Sob demanda seria pagar o dobro por '
             'urgência que não existe.',
             ['lote'], [('dif', 'lote')]),
            ('O dono do módulo é quem aprova',
             'Documentação sem dono acumula proposta aberta. Roteamento por dono é o que '
             'faz a proposta ser lida.',
             ['don'], [('don', 'rep')]),
            ('O antes e o depois no mesmo lugar',
             'Revisar texto novo sem ver o antigo esconde o que mudou. O diff é o que '
             'torna a revisão de minutos em vez de horas.',
             ['pr'], [('lote', 'pr')]),
        ],
        legenda='Documentação gerada sem revisão troca conteúdo velho por conteúdo errado. '
                'O padrão sustentável é agente que propõe divergências, em lote, com dono '
                'nomeado para aprovar.',
    ),
    Sol(
        n=46,
        titulo='46. Onboarding lento de quem entra no time',
        titulo_diagrama='O que reduz tempo até o primeiro commit é convenção acessível',
        problema='Quem entra leva semanas para o primeiro commit útil, e a maior parte '
                 'desse tempo não é aprender o domínio: é descobrir a convenção da casa — '
                 'onde mora o quê, como se roda o teste, qual padrão de nome, por que '
                 'aquela biblioteca e não a outra.',
        checagem=('contexto do projeto', 'convenções'),
        grupos=[
            ('Convenção da casa', 'plain', [
                ('adr', 'doc', 'Decisões registradas', 'por que, não só o quê'),
                ('conv', 'catalogo', 'Convenções', 'nome, camada, teste'),
                ('kb', 'knowledgebases', 'Knowledge Base', 'convenção e exemplo do próprio repositório'),
            ]),
            ('Onde a dúvida aparece', 'plain', [
                ('ide', 'ide', 'Editor', 'com o arquivo aberto como contexto'),
                ('cl', 'claude', 'Claude', 'responde com o exemplo do próprio repositório'),
            ]),
            ('Medida', 'plain', [
                ('t1', 'metrica', 'Tempo até o 1º commit', 'a métrica que importa'),
            ]),
        ],
        arestas=[
            ('adr', 'kb', 'o porquê das decisões'),
            ('conv', 'kb', 'padrão de nome e camada'),
            ('ide', 'cl', 'dúvida + arquivo aberto'),
            ('cl', 'kb', 'dúvida de convenção'),
            ('kb', 'cl', 'convenção + exemplo real'),
            ('cl', 'ide', 'resposta com o exemplo real'),
            ('cl', 't1', 'tempo até o commit', 'dashed'),
        ],
        passos=[
            ('A dúvida é de convenção, não de domínio',
             'Domínio se aprende com o time. Convenção é o que trava o dia: onde criar o '
             'arquivo, qual padrão seguir, como rodar. E é isso que está espalhado.',
             ['conv', 'adr'], [('conv', 'kb'), ('adr', 'kb')]),
            ('Exemplo do próprio repositório vence texto genérico',
             'Apontar o arquivo que já faz aquilo é mais útil que descrever o padrão. '
             'Copiar o vizinho é como se aprende convenção de verdade.',
             ['kb', 'cl'], [('kb', 'cl')]),
            ('O "por quê" evita a segunda discussão',
             'Decisão registrada com motivo impede que o novato proponha, de boa-fé, o que '
             'já foi descartado por razão que ninguém lembra de contar.',
             ['adr'], [('adr', 'kb')]),
            ('No editor, com o arquivo como contexto',
             'A dúvida acontece com o código na tela. Assistente que não vê o arquivo '
             'aberto responde genérico e obriga a reformular.',
             ['ide'], [('ide', 'cl'), ('cl', 'ide')]),
            ('Mais documentação não é a resposta',
             'A métrica é tempo até o primeiro commit. O que a move é acessibilidade da '
             'convenção — não volume de texto que ninguém lê.',
             ['t1'], [('cl', 't1')]),
        ],
        legenda='O gargalo do onboarding é convenção inacessível, não falta de '
                'documentação. Responder com o exemplo que já existe no repositório é o '
                'que encurta o tempo até o primeiro commit.',
    ),
    Sol(
        n=47,
        titulo='47. Consulta a banco por quem não escreve SQL',
        titulo_diagrama='Gerar SQL é fácil; limitar o que ele consulta e quanto varre é o trabalho',
        problema='A área de negócio espera dias por um número que é uma consulta de três '
                 'linhas. Gerar o SQL com um modelo funciona na primeira demonstração — e '
                 'a segunda derruba o banco de produção com uma varredura completa de '
                 'tabela.',
        checagem=('esquema no contexto', 'réplica de leitura', 'limite'),
        grupos=[
            ('Pergunta', 'plain', [
                ('usu', 'user', 'Área de negócio', 'sabe a pergunta e não escreve SQL'),
                ('cl', 'claude', 'Claude', 'esquema descrito no contexto'),
            ]),
            ('Contenção', 'vpc', [
                ('val', 'lambda', 'Validador de SQL', 'só SELECT, tabelas da lista'),
                ('lim', 'politica', 'Limites', 'tempo, linhas e dado varrido'),
            ]),
            ('Execução isolada', 'vpc', [
                ('rep', 'replica', 'Réplica de leitura', 'nunca a instância primária'),
                ('exp', 'doc', 'Consulta exibida', 'quem lê o número vê o SQL'),
            ]),
        ],
        arestas=[
            ('usu', 'cl', 'pergunta em português'),
            ('cl', 'val', 'SQL proposto'),
            ('val', 'lim', 'aprovado'),
            ('lim', 'rep', 'executa com teto'),
            ('rep', 'exp', 'resultado'),
            ('exp', 'usu', 'número + consulta'),
            ('val', 'cl', 'recusado, com o motivo'),
        ],
        passos=[
            ('A réplica é o que protege a produção',
             'Consulta gerada é imprevisível por natureza. Executar na primária é apostar '
             'que nenhuma vai varrer a tabela inteira — e uma vai.',
             ['rep'], [('lim', 'rep')]),
            ('Lista de tabelas permitidas, não lista de proibidas',
             'Permitir explicitamente é o padrão seguro. Proibir tabela por tabela sempre '
             'esquece a que foi criada na semana passada.',
             ['val'], [('cl', 'val'), ('val', 'lim')]),
            ('Teto de tempo, de linhas e de dado varrido',
             'Três limites, porque a consulta pode ser custosa de três formas diferentes. '
             'Um só deixa as outras duas abertas.',
             ['lim'], [('lim', 'rep')]),
            ('O esquema descrito é o que mais melhora o SQL',
             'Nome de coluna raramente diz o significado. Descrição de coluna no contexto '
             'rende mais que qualquer refinamento de instrução.',
             ['cl'], [('usu', 'cl')]),
            ('Mostrar a consulta é o que dá confiança',
             'Quem vai defender o número precisa poder conferir como ele foi obtido. '
             'Número sem consulta não é aceito por quem responde por ele.',
             ['exp'], [('rep', 'exp'), ('exp', 'usu')]),
        ],
        legenda='O difícil em texto-para-SQL não é gerar: é conter. Réplica de leitura, '
                'lista de tabelas permitidas e três tetos de custo — e a consulta exibida, '
                'porque número sem consulta ninguém assume.',
    ),
    Sol(
        n=48,
        titulo='48. Análise de conteúdo com revisão manual longa',
        titulo_diagrama='Redução de tempo vem de triar, não de eliminar o revisor',
        problema='Uma equipe lê e classifica todo o conteúdo que entra, e a fila cresce '
                 'mais rápido que a capacidade. Automatizar tudo é tentador e '
                 'inaceitável: o erro tem custo. A questão é onde exatamente o humano '
                 'continua.',
        checagem=('lote', 'amostragem humana'),
        grupos=[
            ('Fila', 'plain', [
                ('s3', 's3', 'Conteúdo a analisar', 'fila que cresce mais rápido que a capacidade'),
                ('lote', 'lote', 'Bedrock em lote', 'classifica e resume'),
            ]),
            ('Triagem', 'plain', [
                ('cnf', 'politica', 'Confiança por classe', 'alta vai direto, baixa vai a humano'),
                ('rev', 'a2i', 'Revisor', 'os duvidosos, integralmente'),
                ('am', 'dataset', 'Amostragem', 'dos automáticos, para medir o erro'),
            ]),
            ('Saída', 'plain', [
                ('db', 'dynamodb', 'Classificação final', 'com a marca de automático ou revisado'),
                ('mt', 'metrica', 'Erro na amostra', 'calibra o limiar'),
            ]),
        ],
        arestas=[
            ('s3', 'lote', 'fila do dia'),
            ('lote', 'cnf', 'classe + confiança'),
            ('cnf', 'rev', 'baixa confiança'),
            ('cnf', 'db', 'alta confiança'),
            ('rev', 'db', 'os duvidosos, corrigidos'),
            ('db', 'am', 'sorteia os automáticos'),
            ('am', 'mt', 'erro medido na amostra'),
            ('mt', 'cnf', 'ajusta o limiar', 'dashed'),
        ],
        passos=[
            ('Triar, não substituir',
             'O revisor continua — só para de ler o que é evidente. É de onde vem a '
             'redução de tempo, e é o que mantém o erro sob controle.',
             ['rev', 'cnf'], [('cnf', 'rev')]),
            ('Em lote porque a fila não tem alguém aguardando',
             'Conteúdo entra durante o dia e é analisado em janela. Custa metade da '
             'inferência sob demanda.',
             ['lote'], [('s3', 'lote'), ('lote', 'cnf')]),
            ('A amostragem mede o que passou direto',
             'Sem amostrar os automáticos, o erro perigoso é invisível: ele não gera '
             'reclamação porque ninguém o vê.',
             ['am'], [('db', 'am'), ('am', 'mt')]),
            ('O limiar é calibrado pelo erro medido',
             'Ele não é escolhido uma vez: sobe quando o erro na amostra sobe, desce '
             'quando a capacidade de revisão sobra.',
             ['mt', 'cnf'], [('mt', 'cnf')]),
            ('Confiança por classe, não global',
             'Algumas classes são fáceis e outras ambíguas por natureza. Um limiar único '
             'revisa demais nas fáceis e de menos nas difíceis.',
             ['cnf'], [('lote', 'cnf')]),
        ],
        legenda='A economia vem de triar: o revisor lê o duvidoso e a amostra, não a fila '
                'inteira. E amostrar o que passou automaticamente é o único jeito de ver '
                'o erro que não gera reclamação.',
    ),
    Sol(
        n=49,
        titulo='49. Plataforma de IA para milhares de funcionários',
        titulo_diagrama='Sem portal, cada aplicação reimplementa autenticação, cota e custo',
        problema='Dez times construíram dez integrações com o modelo, e nenhuma tem cota, '
                 'atribuição de custo e registro de uso ao mesmo tempo. A conta chega '
                 'agregada, ninguém sabe reduzir, e o time de segurança descobre uma '
                 'credencial compartilhada em produção.',
        checagem=('Portal interno', 'cota', 'atribuição de custo'),
        grupos=[
            ('Porta única', 'plain', [
                ('api', 'apigateway', 'Portal de IA', 'uma porta, um contrato'),
                ('idc', 'identitycenter', 'Identidade corporativa', 'quem é, de que time'),
                ('cota', 'politica', 'Cota por time', 'e limite de taxa por usuário'),
            ]),
            ('Roteamento', 'vpc', [
                ('rot', 'lambda', 'Roteador de modelo', 'tarefa simples → modelo pequeno'),
                ('br', 'bedrock', 'Bedrock', 'uma porta para dez times'),
            ]),
            ('Custo e uso', 'plain', [
                ('tag', 'cost', 'Atribuição por time', 'metadado na chamada'),
                ('qs', 'quicksight', 'Painel de consumo', 'cada time vê o próprio gasto'),
            ]),
        ],
        arestas=[
            ('idc', 'api', 'quem é e de que time'),
            ('api', 'cota', 'consome a cota do time'),
            ('cota', 'rot', 'dentro da cota'),
            ('rot', 'br', 'chamada roteada'),
            ('br', 'tag', 'tokens da chamada'),
            ('tag', 'qs', 'gasto por time'),
            ('cota', 'api', 'excedeu: recusa clara'),
        ],
        passos=[
            ('Uma porta implementa as três coisas uma vez',
             'Autenticação, cota e atribuição de custo. Dez integrações implementam em '
             'média uma delas cada — e nunca as três.',
             ['api', 'cota', 'tag'], [('api', 'cota'), ('br', 'tag')]),
            ('Identidade corporativa, não credencial compartilhada',
             'Chave única entre times impede cota por time e destrói o rastro. É o achado '
             'clássico da primeira auditoria.',
             ['idc'], [('idc', 'api')]),
            ('Cota com recusa clara',
             'Estourar a cota tem de devolver mensagem que o time entenda, com o número. '
             'Erro genérico gera ticket e pedido de aumento sem análise.',
             ['cota'], [('cota', 'api')]),
            ('Roteamento por dificuldade dentro do portal',
             'Centralizar permite trocar o modelo padrão de tarefa simples sem alterar '
             'dez aplicações.',
             ['rot'], [('cota', 'rot'), ('rot', 'br')]),
            ('Cada time vê o próprio gasto',
             'Custo visível é custo que o dono reduz. Conta agregada é número que ninguém '
             'sabe atacar.',
             ['qs'], [('tag', 'qs')]),
        ],
        legenda='O portal existe para implementar uma vez o que toda aplicação precisa e '
                'nenhuma implementa inteiro: identidade, cota e atribuição de custo. Sem '
                'ele, a conta chega agregada e ninguém consegue reduzi-la.',
    ),
    Sol(
        n=50,
        titulo='50. Agente de engenharia sem observabilidade',
        titulo_diagrama='"O agente travou" só é investigável com um trecho de rastro por ferramenta',
        problema='O relato é sempre o mesmo: "o agente travou" ou "ele fez uma coisa '
                 'estranha". Sem rastro, a investigação começa pedindo à pessoa que '
                 'reproduza — e ela não sabe o que fez. O caso é fechado como não '
                 'reproduzível e volta na semana seguinte.',
        checagem=('rastro', 'identificador único', 'X-Ray'),
        grupos=[
            ('Execução', 'vpc', [
                ('ac', 'agentcore', 'Agente', 'id de correlação por sessão'),
                ('f1', 'ferramenta', 'Ferramenta A', 'um trecho de rastro por chamada'),
                ('f2', 'ferramenta', 'Ferramenta B', 'com o argumento e a duração'),
            ]),
            ('Rastro', 'plain', [
                ('xr', 'xray', 'X-Ray', 'um trecho por chamada de ferramenta'),
                ('cw', 'cloudwatch', 'CloudWatch', 'tokens, passos, duração'),
                ('an', 'span', 'Anotação de negócio', 'usuário, caso, decisão'),
            ]),
            ('Investigação', 'plain', [
                ('dev', 'user', 'Quem investiga', 'reconstrói a sessão pelo id'),
            ]),
        ],
        arestas=[
            ('ac', 'f1', 'chamada com id de correlação'),
            ('ac', 'f2', 'mesma sessão, outro trecho'),
            ('f1', 'xr', 'trecho'),
            ('f2', 'xr', 'trecho'),
            ('ac', 'cw', 'métricas'),
            ('an', 'xr', 'enriquece', 'dashed'),
            ('xr', 'dev', 'a sessão inteira'),
        ],
        passos=[
            ('Um trecho por chamada de ferramenta',
             'É a granularidade que permite ver onde parou: qual ferramenta, com que '
             'argumento, quanto tempo. Rastro por requisição inteira não distingue nada.',
             ['xr', 'f1', 'f2'], [('f1', 'xr'), ('f2', 'xr')]),
            ('Identificador de correlação por sessão',
             'Uma sessão de agente são dezenas de chamadas. Sem id comum, elas são eventos '
             'soltos que não se juntam.',
             ['ac'], [('ac', 'f1'), ('ac', 'f2')]),
            ('Anotação de negócio no rastro',
             'Saber que a chamada demorou não permite reproduzir. Saber que era o caso do '
             'cliente X pedindo o relatório Y permite.',
             ['an'], [('an', 'xr')]),
            ('Passos e tokens por sessão como métrica',
             'É o que revela laço e crescimento de custo antes de a fatura chegar. Duração '
             'sozinha não distingue tarefa difícil de laço.',
             ['cw'], [('ac', 'cw')]),
            ('A investigação parte do id, não do relato',
             'Com o rastro, "travou ontem à tarde" vira uma sessão específica. Sem ele, '
             'toda investigação depende da memória de quem reclamou.',
             ['dev'], [('xr', 'dev')]),
        ],
        legenda='Agente é sistema distribuído com laço: sem um trecho de rastro por '
                'ferramenta e um id por sessão, "travou" não é investigável. E rastro sem '
                'anotação de negócio mostra o sintoma sem permitir reproduzir.',
    ),
]

PERGUNTAS = [
    ('Por onde começar a usar IA numa empresa de engenharia?',
     'Comece por dentro: assistente sobre código, runbook e histórico de incidente. O '
     'material já está digitalizado, o usuário é colega e não cliente, e o custo de um erro '
     'é uma correção em vez de uma captura de tela pública. É o caso com retorno mais '
     'rápido e menor risco de imagem da lista inteira — e o histórico de incidente, que '
     'quase ninguém indexa, é justamente a fonte que responde a pergunta repetida do canal '
     'do time.'),
    ('Como fazer revisão automática de código sem o time ignorar os comentários?',
     'Estreitando o critério de saída e exigindo endereço. "Revise este PR" produz '
     'parágrafo genérico; "aponte só o que quebra em produção, com arquivo e linha" produz '
     'achado acionável. A métrica a acompanhar é a taxa de supressão: se o time descarta a '
     'maior parte dos achados, o critério está largo demais. Isso importa porque ruído '
     'destrói a confiança de forma permanente — depois que o time aprende a ignorar o robô, '
     'o achado correto também é ignorado.'),
    ('É seguro deixar um modelo gerar SQL sobre o banco da empresa?',
     'Somente com contenção no código: execução em réplica de leitura, lista de tabelas '
     'permitidas, e teto de tempo, de linhas e de dado varrido. Gerar SQL é a parte fácil e '
     'funciona na primeira demonstração; a segunda derruba a produção com uma varredura '
     'completa de tabela. Vale mostrar a consulta gerada junto do número, porque quem vai '
     'defender o resultado precisa poder conferir como ele foi obtido — e descrição de '
     'coluna no contexto melhora o SQL mais que qualquer refinamento de instrução.'),
]

QUIZZES = [
    quiz('Um revisor automático de código comenta estilo em 20 linhas por pedido de '
         'mesclagem. Qual é o risco maior?',
         ['O custo de inferência por pedido de mesclagem',
          'O time aprende a ignorar todos os comentários, inclusive os corretos',
          'O tempo adicionado ao pipeline de CI',
          'O modelo pode expor trechos do código em registros'],
         1,
         'A perda de confiança é permanente e contamina o achado válido: depois que a '
         'equipe internaliza que o robô fala demais, o comentário que apontava uma falha '
         'real passa junto. O custo de inferência é real mas pequeno e reversível. O tempo '
         'de CI incomoda e se resolve rodando em paralelo. Vazamento em registro é problema '
         'de configuração, não a consequência de comentar estilo — e é o único dos quatro '
         'que não tem relação com o volume de ruído.'),
    quiz('Guardrails está filtrando sugestões de código com credencial em texto puro. Isso '
         'protege contra o quê?',
         ['Contra o código gerado executar ações amplas na conta',
          'Contra a sugestão com o padrão proibido aparecer para o desenvolvedor',
          'Contra dependências abandonadas entrarem no projeto',
          'Contra o desenvolvedor escrever a credencial manualmente'],
         1,
         'Guardrails atua na saída do modelo: ele impede a exibição, e é bom nisso. O que '
         'impede o código de fazer estrago é a permissão do ambiente — confundir os dois é '
         'achar que filtro de texto protege a produção. Dependência abandonada é trabalho '
         'de varredura no CI, que também cobre o código escrito à mão. E nada no filtro de '
         'geração alcança o que a pessoa digita: para isso, o que funciona é não existir '
         'credencial para copiar, com segredo gerenciado.'),
    quiz('Numa análise de conteúdo em lote, por que amostrar o que foi classificado '
         'automaticamente com alta confiança?',
         ['Para reduzir o custo total da inferência em lote',
          'Porque o erro nesse grupo não gera reclamação e é invisível sem amostragem',
          'Para treinar o modelo com os casos revisados',
          'Porque o serviço exige revisão humana em uma fração das inferências'],
         1,
         'O erro no grupo automático é o perigoso justamente porque ninguém o vê: não gera '
         'ticket, não vira reclamação, e o painel mostra tudo verde. Amostrar é o que '
         'transforma esse erro em número — e é o número que calibra o limiar. Amostrar '
         'acrescenta custo em vez de reduzir. Usar os casos para treinar é possível mas é '
         'outro objetivo, e não substitui a medição. E não há exigência do serviço nesse '
         'sentido: a decisão de amostrar é de engenharia.'),
]
