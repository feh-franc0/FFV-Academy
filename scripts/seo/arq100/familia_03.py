#!/usr/bin/env python3
"""Família 3 — Busca e conhecimento interno (soluções 21 a 30)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-busca'
NOME = 'Busca e conhecimento interno'

ABERTURA = [
    p('Todas as dez arquiteturas desta família são RAG, e todas repetem a mesma '
      'conclusão: **a qualidade é decidida na recuperação, não na geração**. Trocar de '
      'modelo num sistema que recupera o trecho errado melhora a fluência do erro. É a '
      'lição mais caramente aprendida da engenharia de IA aplicada, e a mais ignorada '
      'nos primeiros três meses de qualquer projeto.'),
    p('As decisões que aparecem aqui são as que ninguém desenha no slide: **o corte**, o '
      '**filtro por permissão**, a **fusão entre léxico e vetorial**, o **frescor da '
      'ingestão** e o custo do índice — que mora em memória e passa a definir o tamanho '
      'da instância. A mais difícil de reverter é a escolha do modelo de embedding: '
      'trocá-la significa reindexar o acervo inteiro.'),
]

SOLUCOES = [
    Sol(
        n=21,
        titulo='21. Conhecimento espalhado em SharePoint e Confluence',
        titulo_diagrama='Conector gerenciado troca controle de corte por tempo de implantação',
        problema='O que a empresa sabe está em quatro sistemas diferentes, e ninguém '
                 'acha nada. Construir a ingestão de cada um — autenticação, paginação, '
                 'permissão, atualização incremental — é semanas de trabalho antes de '
                 'existir a primeira resposta.',
        checagem=('conectores', 'sincronização', 'recuperação'),
        grupos=[
            ('Fontes', 'plain', [
                ('sp', 'external', 'SharePoint', 'a permissão por documento vem daqui'),
                ('cf', 'external', 'Confluence', 'espaços com permissão própria'),
                ('s3', 's3', 'S3', 'o que já é arquivo'),
            ]),
            ('Ingestão gerenciada', 'plain', [
                ('con', 'integration', 'Conectores', 'autenticação, paginação e permissão prontos'),
                ('kb', 'knowledgebases', 'Knowledge Base gerenciada', 'corte e embedding padrão'),
            ]),
            ('Consumo', 'plain', [
                ('ag', 'agentcore', 'Agente', 'sessão e identidade do usuário que perguntou'),
                ('cl', 'claude', 'Claude', 'responde citando o sistema de origem'),
            ]),
            ('Medida', 'plain', [
                ('ev', 'bedrockeval', 'Avaliação', 'quando o padrão deixa de servir'),
            ]),
        ],
        arestas=[
            ('sp', 'con', 'documentos + permissão'),
            ('cf', 'con', 'páginas + espaço'),
            ('s3', 'con', 'arquivos do acervo'),
            ('con', 'kb', 'sincronização incremental'),
            ('ag', 'kb', 'consulta'),
            ('kb', 'ag', 'trechos + origem'),
            ('ag', 'cl', 'pergunta + trechos'),
            ('kb', 'ev', 'amostra de recuperação', 'dashed'),
        ],
        passos=[
            ('Comece pelo gerenciado, e saiba o que está trocando',
             'O conector entrega em dias o que a ingestão própria entrega em semanas. O '
             'preço é não escolher o corte nem o modelo de embedding — e isso só importa '
             'quando a avaliação mostrar que importa.',
             ['con', 'kb'], [('con', 'kb')]),
            ('A permissão vem da fonte, na ingestão',
             'O conector traz quem pode ver cada documento. Perder isso na ingestão é como '
             'material restrito passa a ser respondível para quem não deveria vê-lo.',
             ['con'], [('sp', 'con'), ('cf', 'con')]),
            ('Sincronização incremental, não recarga total',
             'Reindexar tudo toda noite custa proporcional ao acervo, não à mudança. Em '
             'acervo corporativo, a mudança diária é uma fração de um por cento.',
             ['con', 'kb'], [('con', 'kb')]),
            ('A resposta diz de qual sistema veio',
             'Saber que o procedimento está no Confluence e não no SharePoint muda o que a '
             'pessoa faz depois. A origem é parte da resposta útil.',
             ['cl', 'kb'], [('kb', 'ag'), ('ag', 'cl')]),
            ('A avaliação é o que autoriza sair do padrão',
             'Assumir o controle do corte é trabalho. Ele se justifica quando a medida '
             'mostra recuperação ruim em um tipo de documento — não por preferência de '
             'arquitetura.',
             ['ev'], [('kb', 'ev')]),
        ],
        legenda='Conector gerenciado é a escolha certa para começar: entrega em dias e '
                'preserva a permissão da fonte. A troca é controle sobre corte e '
                'embedding — e o momento de retomar esse controle é o que a avaliação '
                'aponta, não o gosto.',
    ),
    Sol(
        n=22,
        titulo='22. Busca corporativa que agentes possam consumir',
        titulo_diagrama='Expor por protocolo padrão evita reescrever integração por arcabouço',
        problema='Três times construíram agentes com arcabouços diferentes, e cada um '
                 'reimplementou a integração com a base de conhecimento. Quando o '
                 'esquema da busca mudou, quebrou nos três — em três códigos diferentes, '
                 'com três donos diferentes.',
        checagem=('MCP', 'cliente compatível'),
        grupos=[
            ('Conhecimento', 'plain', [
                ('kb', 'knowledgebases', 'Knowledge Base', 'uma fonte, um esquema'),
            ]),
            ('Fronteira padrão', 'plain', [
                ('mcp', 'mcp', 'Gateway MCP', 'ferramenta descoberta, não codificada'),
                ('iam', 'iam', 'Autorização', 'por cliente e por ferramenta'),
            ]),
            ('Clientes', 'plain', [
                ('c1', 'agentcore', 'Agente de suporte', 'atende o cliente final'),
                ('c2', 'ide', 'Assistente no editor', 'usa o contexto do arquivo aberto'),
                ('c3', 'slack', 'Bot interno', 'onde a pergunta já acontece'),
            ]),
        ],
        arestas=[
            ('c1', 'mcp', 'chama a ferramenta descoberta'),
            ('c2', 'mcp', 'mesma ferramenta, outro cliente'),
            ('c3', 'mcp', 'mesma ferramenta, outro cliente'),
            ('mcp', 'iam', 'quem pode o quê'),
            ('mcp', 'kb', 'consulta'),
            ('kb', 'mcp', 'trechos'),
        ],
        passos=[
            ('Um esquema, não três integrações',
             'A mudança na busca acontece num lugar. Antes, ela acontecia em três códigos '
             'de três times — e a que ficava sem atualizar virava resposta errada '
             'silenciosa.',
             ['mcp', 'kb'], [('mcp', 'kb')]),
            ('Descoberta em vez de codificação',
             'O cliente pergunta ao gateway quais ferramentas existem. Ferramenta nova '
             'fica disponível sem alterar cliente — que é o que torna a plataforma '
             'evolutiva.',
             ['mcp', 'c1'], [('c1', 'mcp')]),
            ('A autorização é do gateway, por cliente',
             'O bot do Slack não deveria alcançar o mesmo acervo que o agente de suporte. '
             'Centralizar a fronteira é o que permite políticas diferentes sem duplicar '
             'lógica.',
             ['iam'], [('mcp', 'iam')]),
            ('Padrão aberto reduz o custo de trocar de arcabouço',
             'O time que quiser mudar de biblioteca de agente troca o cliente, não a '
             'integração. É o que evita o acoplamento que congela decisões por anos.',
             ['c2', 'c3'], [('c2', 'mcp'), ('c3', 'mcp')]),
            ('O gateway não é cache nem lógica de negócio',
             'Ele expõe e autoriza. Colocar regra de negócio ali recria o acoplamento em '
             'outro lugar, agora num componente que todos os times dependem.',
             ['mcp'], [('kb', 'mcp')]),
        ],
        legenda='Fronteira em protocolo padrão troca N integrações por uma. O ganho não é '
                'elegância: é que a mudança de esquema passa a ter um dono e um lugar, em '
                'vez de quebrar em três times ao mesmo tempo.',
    ),
    Sol(
        n=23,
        titulo='23. Resposta que precisa citar a fonte para ser aceita',
        titulo_diagrama='Citação verificável transforma alucinação em erro detectável',
        problema='A resposta é fluente, plausível e ninguém consegue dizer se está '
                 'certa. Em acervo de milhares de documentos, conferir manualmente é '
                 'inviável — e sem forma de conferir, a área que consome não assume o '
                 'risco de usar.',
        checagem=('citação', 'validação', 'trecho'),
        grupos=[
            ('Recuperação', 'plain', [
                ('kb', 'knowledgebases', 'Knowledge Bases', 'devolve trecho + identificador'),
            ]),
            ('Geração', 'plain', [
                ('cl', 'claude', 'Claude', 'obrigado a citar por trecho'),
            ]),
            ('Verificação automática', 'plain', [
                ('val', 'juiz', 'Validador de citação', 'o trecho citado existe na fonte apontada?'),
                ('sem', 'metrica', 'Taxa sem fonte', 'afirmação sem citação é sinal, não estilo'),
            ]),
            ('Saída', 'plain', [
                ('ok', 'doc', 'Resposta publicada', 'com referência clicável'),
                ('nao', 'alerta', 'Recusa explícita', '"não encontrei no acervo"'),
            ]),
        ],
        arestas=[
            ('kb', 'cl', 'trechos com id'),
            ('cl', 'val', 'resposta + citações'),
            ('val', 'ok', 'citação confere'),
            ('val', 'nao', 'citação não confere'),
            ('val', 'sem', 'afirmação sem citação', 'dashed'),
            ('nao', 'kb', 'reconsulta com outra formulação', 'dashed'),
        ],
        passos=[
            ('Sem fonte, acerto e alucinação são indistinguíveis',
             'Quem lê não tem como separar. Com fonte, a verificação custa um clique — e '
             'o erro deixa de se propagar como verdade dentro da empresa.',
             ['cl', 'ok'], [('cl', 'val'), ('val', 'ok')]),
            ('A validação é do código, não do revisor',
             'Comparar o trecho citado com o texto recuperado é operação de string. É o '
             'que permite verificar 100% das respostas em vez de uma amostra.',
             ['val'], [('cl', 'val')]),
            ('Citar documento que não contém o trecho é o erro mais convincente',
             'A referência confere, o documento existe, e o texto não está lá. Só a '
             'conferência do trecho pega esse caso.',
             ['val', 'kb'], [('kb', 'cl')]),
            ('Recusar é resposta válida',
             '"Não encontrei no acervo" é mais útil que uma resposta plausível sem base. E '
             'a taxa de recusa é métrica de cobertura do acervo, não de fracasso do '
             'modelo.',
             ['nao'], [('val', 'nao')]),
            ('Afirmação sem citação é sinal medido',
             'Se a taxa sobe, algo mudou: acervo, corte ou prompt. É indicador que '
             'antecede reclamação de usuário.',
             ['sem'], [('val', 'sem')]),
        ],
        legenda='Citação não melhora a resposta: torna o erro detectável sem julgamento '
                'humano. E é essa detectabilidade — não a fluência — que faz a área de '
                'negócio aceitar depender do sistema.',
    ),
    Sol(
        n=24,
        titulo='24. Pergunta que exige combinar dois documentos',
        titulo_diagrama='Recuperação em vários saltos: buscar, ler, reformular e buscar de novo',
        problema='"A política de reembolso do contrato do cliente X cobre o cenário do '
                 'boletim técnico 42?" exige duas fontes que não se mencionam. Uma busca '
                 'única traz trechos de uma ou de outra, e a resposta sai pela metade — '
                 'com aparência de completa.',
        checagem=('multi-salto', 'reformula'),
        grupos=[
            ('Laço de recuperação', 'plain', [
                ('ag', 'agentcore', 'Agente de busca', 'decide se já tem o suficiente'),
                ('kb', 'knowledgebases', 'Knowledge Bases', 'consultada várias vezes na mesma pergunta'),
                ('teto', 'politica', 'Teto de saltos', '3 voltas, depois responde com o que tem'),
            ]),
            ('Estado da investigação', 'plain', [
                ('ctx', 'contexto', 'O que já sei', 'e o que ainda falta'),
            ]),
            ('Resposta', 'plain', [
                ('cl', 'claude', 'Claude', 'cita as duas fontes'),
                ('cust', 'cost', 'Custo por pergunta', 'mais voltas, mais tokens'),
            ]),
        ],
        arestas=[
            ('ag', 'kb', 'salto 1: contrato'),
            ('kb', 'ctx', 'trechos'),
            ('ctx', 'ag', 'o que falta'),
            ('ag', 'kb', 'salto 2: boletim'),
            ('ag', 'teto', 'já chegou ao limite?'),
            ('teto', 'cl', 'responde'),
            ('ctx', 'cl', 'contexto completo'),
            ('ag', 'cust', 'tokens por volta', 'dashed'),
        ],
        passos=[
            ('A pergunta define quantas fontes precisa',
             'Perguntas de fato único se resolvem em um salto. As de relação entre '
             'documentos precisam de dois ou três — e tratar as duas iguais faz a segunda '
             'sair incompleta.',
             ['ag', 'kb'], [('ag', 'kb')]),
            ('O agente reformula com o que aprendeu',
             'A segunda busca usa o termo que a primeira revelou. É o que a busca única '
             'não consegue: ela não sabe o vocabulário do documento antes de lê-lo.',
             ['ctx', 'ag'], [('kb', 'ctx'), ('ctx', 'ag')]),
            ('O estado guarda o que falta',
             'Sem registrar a lacuna, o agente busca de novo o que já tem. É a causa mais '
             'comum de laço em recuperação agêntica.',
             ['ctx'], [('ctx', 'cl')]),
            ('O teto de saltos é obrigatório',
             'Sem ele, pergunta impossível consome orçamento até o tempo esgotar. Três '
             'voltas e responder com o que tem é melhor que insistir.',
             ['teto'], [('ag', 'teto'), ('teto', 'cl')]),
            ('O custo por pergunta muda de ordem',
             'Uma pergunta multi-salto custa o que três perguntas simples custam. Isso '
             'precisa ser sabido antes de ligar para todos os usuários.',
             ['cust'], [('ag', 'cust')]),
        ],
        legenda='Recuperação única não responde pergunta que depende de duas fontes, e o '
                'preço da correção é mais voltas — logo mais tokens e mais latência. O '
                'teto de saltos é o que impede a correção de virar o problema.',
    ),
    Sol(
        n=25,
        titulo='25. Permissão de acesso ao acervo por usuário',
        titulo_diagrama='Índice único sem filtro por usuário responde o que não deveria',
        problema='O acervo tem material de RH, jurídico e financeiro no mesmo índice. A '
                 'busca funciona bem — inclusive para o estagiário que perguntou sobre a '
                 'faixa salarial da diretoria e recebeu uma resposta completa, com '
                 'citação.',
        checagem=('metadado', 'permissão da fonte', 'ingestão'),
        grupos=[
            ('Ingestão', 'vpc', [
                ('src', 'external', 'Sistema de origem', 'já tem a permissão'),
                ('ing', 'lambda', 'Ingestão', 'copia a permissão para o metadado'),
                ('idx', 'opensearch', 'Índice', 'trecho + quem pode ver'),
            ]),
            ('Identidade', 'plain', [
                ('idc', 'identitycenter', 'Identity Center', 'grupos do usuário'),
                ('tok', 'iam', 'Sessão autorizada', 'os grupos vêm daqui, nunca do corpo da requisição'),
            ]),
            ('Consulta', 'vpc', [
                ('fn', 'lambda', 'Camada de consulta', 'injeta o filtro, não confia no cliente'),
                ('cl', 'claude', 'Claude', 'só vê o que passou pelo filtro'),
            ]),
        ],
        arestas=[
            ('src', 'ing', 'documento + quem pode ver'),
            ('ing', 'idx', 'metadado de permissão'),
            ('idc', 'tok', 'grupos do usuário'),
            ('tok', 'fn', 'grupos'),
            ('fn', 'idx', 'consulta + filtro'),
            ('idx', 'fn', 'só o permitido'),
            ('fn', 'cl', 'contexto filtrado'),
        ],
        passos=[
            ('A permissão é capturada na ingestão',
             'Quem sabe quem pode ver o documento é o sistema de origem. Reconstruir isso '
             'depois, por pasta ou por nome de arquivo, erra — e erra para o lado '
             'permissivo.',
             ['src', 'ing'], [('src', 'ing'), ('ing', 'idx')]),
            ('O filtro é aplicado na consulta, pelo servidor',
             'Filtrar depois de recuperar já vazou: o trecho entrou no contexto do modelo. '
             'E filtrar no cliente é filtro que o cliente pode remover.',
             ['fn', 'idx'], [('fn', 'idx'), ('idx', 'fn')]),
            ('Prompt não é mecanismo de permissão',
             '"Não responda sobre salários" é instrução, e instrução tem taxa de falha. '
             'O que o modelo não recebe, ele não pode revelar.',
             ['cl'], [('fn', 'cl')]),
            ('A identidade vem do provedor, não do pedido',
             'Se o grupo do usuário chega no corpo da requisição, qualquer um se declara '
             'diretor. A sessão autenticada é a única fonte aceitável.',
             ['idc', 'tok'], [('idc', 'tok'), ('tok', 'fn')]),
            ('Permissão muda depois da ingestão',
             'Quem sai do time perde acesso na origem, e o índice precisa acompanhar. '
             'Sincronizar permissão é tão importante quanto sincronizar conteúdo.',
             ['ing', 'idx'], [('ing', 'idx')]),
        ],
        legenda='Índice único é decisão de eficiência; filtro por usuário é o que a torna '
                'aceitável. A permissão se captura na ingestão e se aplica na consulta — '
                'nas duas pontas, porque uma sozinha não resolve.',
    ),
    Sol(
        n=26,
        titulo='26. Consulta específica não é achada (código de erro, sigla)',
        titulo_diagrama='Busca vetorial dilui token raro; é o léxico que salva a consulta de maior intenção',
        problema='Quem digita "ERR_2049" quer aquele código, e a busca devolve trechos '
                 'sobre "erros de conexão em geral". Semanticamente próximos, '
                 'operacionalmente inúteis — e essa é justamente a consulta de quem está '
                 'com o problema na mão.',
        checagem=('híbrido', 'léxico', 'fusão'),
        grupos=[
            ('Índices paralelos', 'vpc', [
                ('emb', 'embedder', 'Embedding', 'sentido geral do trecho'),
                ('bm', 'bm25', 'Índice léxico', 'token exato, peso por raridade'),
            ]),
            ('Fusão', 'vpc', [
                ('fus', 'orquestrador', 'Fusão por posição', 'combina rankings, não notas'),
                ('rr', 'reranker', 'Reordenação', 'pergunta e trecho juntos'),
            ]),
            ('Consulta', 'plain', [
                ('q', 'user', 'Consulta', '"ERR_2049"'),
                ('cl', 'claude', 'Claude', 'responde sobre os cinco melhores trechos'),
            ]),
        ],
        arestas=[
            ('q', 'emb', 'vetor da consulta'),
            ('q', 'bm', 'tokens da consulta'),
            ('emb', 'fus', 'ranking semântico'),
            ('bm', 'fus', 'ranking léxico'),
            ('fus', 'rr', '30 candidatos'),
            ('rr', 'cl', '5 melhores'),
        ],
        passos=[
            ('Token raro é diluído pelo vetor',
             'O embedding representa o trecho inteiro. Um código que aparece uma vez '
             'contribui pouco para esse vetor — e desaparece na comparação.',
             ['emb', 'bm'], [('q', 'emb'), ('q', 'bm')]),
            ('O léxico pesa exatamente o que é raro',
             'Termo que aparece pouco no acervo tem peso alto. É o comportamento oposto '
             'ao do vetor, e é por isso que os dois se completam.',
             ['bm'], [('q', 'bm'), ('bm', 'fus')]),
            ('Fundir por posição, não por nota',
             'As duas notas vivem em escalas incomparáveis, e normalizá-las introduz '
             'parâmetro arbitrário. Combinar as POSIÇÕES é estável e não precisa de '
             'calibração.',
             ['fus'], [('emb', 'fus'), ('bm', 'fus')]),
            ('A consulta específica é a de maior intenção',
             'Quem digita código de erro está com o problema na tela. É a consulta que '
             'mais converte e a que a busca puramente vetorial atende pior.',
             ['q'], [('q', 'bm')]),
            ('Reordenar fecha a conta',
             'A fusão entrega recall; o reordenador entrega precisão nos cinco primeiros — '
             'que é o que cabe no contexto.',
             ['rr'], [('fus', 'rr'), ('rr', 'cl')]),
        ],
        legenda='Em acervo técnico, o índice híbrido não é refinamento: é o que faz '
                'funcionar a consulta de maior intenção. Vetor e léxico erram em '
                'direções opostas, e é isso que torna a fusão eficaz.',
    ),
    Sol(
        n=27,
        titulo='27. Acervo grande com custo de armazenamento vetorial',
        titulo_diagrama='O índice mora em memória — é ele que dita o custo, não o disco',
        problema='O acervo cresceu para dezenas de milhões de trechos e a fatura do '
                 'índice passou a fatura de tudo o resto. A intuição diz "armazenamento é '
                 'barato", e ela está errada aqui: o que custa não é guardar o vetor, é '
                 'mantê-lo pesquisável em memória.',
        checagem=('S3 Vectors', 'pgvector', 'volume'),
        grupos=[
            ('Decisão por volume', 'plain', [
                ('vol', 'metrica', 'Volume e frequência', 'quantos trechos, buscados quantas vezes'),
            ]),
            ('Opções', 'vpc', [
                ('os', 'opensearch', 'OpenSearch', 'baixa latência, índice em memória'),
                ('pg', 'pgvector', 'pgvector', 'junto do dado relacional, volume médio'),
                ('s3v', 's3vectors', 'S3 Vectors', 'acervo frio, custo por armazenamento'),
            ]),
            ('Camadas', 'vpc', [
                ('q', 'elasticache', 'Cache de consulta', 'a cauda repetida'),
                ('cost', 'costexplorer', 'Custo por mil consultas', 'a métrica que compara'),
            ]),
        ],
        arestas=[
            ('vol', 'os', 'quente e sensível a latência'),
            ('vol', 'pg', 'médio, já tem Postgres'),
            ('vol', 's3v', 'frio e volumoso'),
            ('q', 'os', 'evita a busca repetida'),
            ('os', 'cost', 'custo por mil consultas', 'dashed'),
            ('s3v', 'cost', 'custo por volume guardado', 'dashed'),
        ],
        passos=[
            ('O custo do índice não é o custo do disco',
             'A estrutura de busca aproximada precisa estar em memória para responder em '
             'milissegundos. É a memória — não o armazenamento — que define a instância e '
             'a fatura.',
             ['os', 'cost'], [('os', 'cost')]),
            ('Volume e frequência decidem juntos',
             'Acervo grande pouco consultado não justifica memória. Acervo pequeno muito '
             'consultado justifica. Olhar só o tamanho leva à escolha errada nas duas '
             'pontas.',
             ['vol'], [('vol', 'os'), ('vol', 's3v')]),
            ('pgvector quando o dado já é relacional',
             'Se a consulta precisa filtrar por cliente, data e status junto com a '
             'similaridade, ter tudo no mesmo banco elimina duas viagens e um problema de '
             'consistência.',
             ['pg'], [('vol', 'pg')]),
            ('Acervo frio aceita latência maior',
             'Arquivo histórico consultado por auditoria uma vez por semana não precisa '
             'de índice em memória. Aqui o custo por armazenamento é o que manda.',
             ['s3v'], [('vol', 's3v'), ('s3v', 'cost')]),
            ('Cache corta a cauda repetida',
             'Um punhado de consultas concentra boa parte do volume. Cachear elas reduz a '
             'pressão sobre o índice — e é a otimização mais barata da lista.',
             ['q'], [('q', 'os')]),
        ],
        legenda='A escolha do armazenamento vetorial sai de duas medidas: volume de '
                'trechos e frequência de consulta. Sem elas, a decisão é feita pela '
                'intuição de que "armazenamento é barato" — que é falsa quando o índice '
                'vive em memória.',
    ),
    Sol(
        n=28,
        titulo='28. Documento novo demora a aparecer na busca',
        titulo_diagrama='Frescor é requisito de produto, e "atualiza toda noite" é uma decisão',
        problema='O procedimento mudou hoje às 10h e o assistente responde a versão '
                 'antiga até a sincronização da madrugada. Quem usa não sabe disso — e '
                 'age com base numa resposta que estava certa ontem.',
        checagem=('incremental', 'evento', 'agendada'),
        grupos=[
            ('Publicação', 'plain', [
                ('aut', 'user', 'Autor', 'publica a revisão'),
                ('s3', 's3', 'S3', 'nova versão do objeto'),
            ]),
            ('Ingestão por evento', 'vpc', [
                ('ev', 'eventbridge', 'EventBridge', 'objeto criado ou alterado'),
                ('ing', 'lambda', 'Ingestão incremental', 'só o que mudou'),
                ('kb', 'knowledgebases', 'Knowledge Base', 'substitui os trechos do documento que mudou'),
            ]),
            ('Contrato com quem usa', 'plain', [
                ('sel', 'certificado', 'Selo de frescor', '"atualizado há 6 min"'),
                ('cw', 'cloudwatch', 'Atraso de ingestão', 'alarme quando passa do combinado'),
            ]),
        ],
        arestas=[
            ('aut', 's3', 'revisão publicada'),
            ('s3', 'ev', 'objeto criado ou alterado'),
            ('ev', 'ing', 'só o que mudou'),
            ('ing', 'kb', 'substitui os trechos daquele documento'),
            ('kb', 'sel', 'quando foi atualizado'),
            ('ing', 'cw', 'atraso da ingestão', 'dashed'),
        ],
        passos=[
            ('Evento em vez de agenda',
             'A agenda paga pelo acervo inteiro e entrega com atraso de até um ciclo. O '
             'evento paga pela mudança e entrega em minutos.',
             ['ev', 'ing'], [('s3', 'ev'), ('ev', 'ing')]),
            ('Substituir os trechos daquele documento, não acrescentar',
             'Ingestão que só adiciona deixa a versão antiga pesquisável. O resultado é '
             'contradição no mesmo acervo — e o modelo escolhendo qual citar.',
             ['ing', 'kb'], [('ing', 'kb')]),
            ('Atraso aceitável é acordo, não sobra',
             'Vinte minutos pode ser aceitável; oito horas quase nunca é. O número é '
             'negociado com quem depende, e vira alarme.',
             ['cw'], [('ing', 'cw')]),
            ('O selo de frescor é honestidade de interface',
             'Mostrar quando o acervo foi atualizado permite ao usuário calibrar '
             'confiança. É mais útil que prometer tempo real e não cumprir.',
             ['sel'], [('kb', 'sel')]),
            ('O alarme é sobre o atraso, não sobre o erro',
             'A ingestão pode parar sem lançar exceção — fila travada, permissão '
             'revogada. O sintoma é atraso crescendo, e é ele que precisa ser observado.',
             ['cw', 'ing'], [('ing', 'cw')]),
        ],
        legenda='Frescor é requisito, e todo desenho tem um. A diferença entre desenho '
                'bom e ruim não é ser instantâneo: é o número ser escolhido, medido e '
                'dito a quem depende dele.',
    ),
    Sol(
        n=29,
        titulo='29. Qualidade da recuperação não é medida',
        titulo_diagrama='Separar recuperação de geração: sem isso, todo problema parece do modelo',
        problema='As respostas estão ruins e a discussão vira "qual modelo usar". Na '
                 'maioria dos casos o modelo respondeu bem sobre um contexto que não '
                 'continha a informação — e trocar de modelo não muda nada, porque o '
                 'defeito estava duas etapas antes.',
        checagem=('Evaluations', 'referência', 'recuperação'),
        grupos=[
            ('Conjunto de referência', 'plain', [
                ('gs', 'dataset', 'Perguntas anotadas', 'com o trecho correto marcado'),
            ]),
            ('Medida em duas etapas', 'plain', [
                ('m1', 'metrica', 'Recuperação', 'o trecho certo entrou no contexto?'),
                ('m2', 'metrica', 'Geração', 'a resposta usa o que foi recuperado?'),
                ('ev', 'bedrockeval', 'Bedrock Evaluations', 'painel comparável entre versões'),
            ]),
            ('Sistema', 'plain', [
                ('kb', 'knowledgebases', 'Recuperação', 'a etapa que erra na maioria dos casos'),
                ('cl', 'claude', 'Geração', 'a etapa que costuma estar certa'),
            ]),
        ],
        arestas=[
            ('gs', 'kb', 'roda as perguntas'),
            ('kb', 'm1', 'compara com o trecho marcado'),
            ('kb', 'cl', 'contexto'),
            ('cl', 'm2', 'compara com a resposta esperada'),
            ('m1', 'ev', 'acerto de recuperação'),
            ('m2', 'ev', 'acerto de geração'),
        ],
        passos=[
            ('Duas etapas, dois números',
             'Recuperação e geração falham por motivos diferentes e se corrigem com '
             'trabalho diferente. Um número só não diz em qual das duas investir.',
             ['m1', 'm2'], [('kb', 'm1'), ('cl', 'm2')]),
            ('O trecho correto precisa estar anotado',
             'Sem saber qual era a resposta certa e de onde ela vinha, não há como medir '
             'recuperação — só opinar sobre a resposta final.',
             ['gs'], [('gs', 'kb')]),
            ('Recuperação ruim se conserta na ingestão',
             'Corte, metadado, híbrido, reordenação. É trabalho de pipeline, e nenhum '
             'prompt melhor o substitui.',
             ['kb', 'm1'], [('kb', 'm1')]),
            ('Geração ruim com contexto bom é problema de instrução',
             'Aí sim prompt e modelo importam: o contexto tinha a resposta e ela não foi '
             'usada. É o caso minoritário, e o único em que trocar de modelo ajuda.',
             ['cl', 'm2'], [('kb', 'cl'), ('cl', 'm2')]),
            ('O conjunto fica fixo para as versões serem comparáveis',
             'Mudar as perguntas junto com o sistema faz o número subir sem que nada '
             'tenha melhorado. Conjunto estável é o que transforma medida em série '
             'temporal.',
             ['gs', 'ev'], [('m1', 'ev'), ('m2', 'ev')]),
        ],
        legenda='Sem separar recuperação de geração, todo problema de RAG parece ser do '
                'modelo — e na maioria dos casos o modelo não tinha o trecho certo. A '
                'separação é o que direciona o esforço para onde ele rende.',
    ),
    Sol(
        n=30,
        titulo='30. Reindexar tudo ao trocar de modelo de embedding',
        titulo_diagrama='Trocar de embedding é reindexar o acervo — a decisão mais difícil de reverter',
        problema='Um embedding melhor apareceu, e trocá-lo significa recalcular o vetor '
                 'de dezenas de milhões de trechos. Pior: durante a troca, metade do '
                 'índice está num espaço vetorial e metade em outro — e comparar os dois '
                 'não significa nada.',
        checagem=('Versão do índice', 'alias', 'validação'),
        grupos=[
            ('Índice atual', 'vpc', [
                ('v1', 'opensearch', 'índice-v1', 'embedding A, servindo produção'),
            ]),
            ('Construção paralela', 'vpc', [
                ('v2', 'opensearch', 'índice-v2', 'embedding B, ainda invisível'),
                ('job', 'batch', 'Reindexação', 'em lote, sem tocar produção'),
            ]),
            ('Virada', 'plain', [
                ('ali', 'route53', 'Alias', 'aponta para um dos dois'),
                ('ev', 'bedrockeval', 'Avaliação', 'o mesmo conjunto nos dois índices'),
            ]),
        ],
        arestas=[
            ('job', 'v2', 'reprocessa o acervo'),
            ('ali', 'v1', 'hoje'),
            ('ev', 'v1', 'mede'),
            ('ev', 'v2', 'mede'),
            ('ev', 'ali', 'autoriza a virada'),
            ('ali', 'v2', 'depois'),
        ],
        passos=[
            ('Nunca misture dois espaços vetoriais no mesmo índice',
             'Distância entre vetores de modelos diferentes não tem significado. Metade '
             'reindexada é um índice que responde errado sem lançar erro.',
             ['v1', 'v2'], [('job', 'v2')]),
            ('Construir ao lado, invisível',
             'O índice novo se enche em lote enquanto o antigo serve. Nenhum usuário vê a '
             'transição, e ela pode levar dias.',
             ['job', 'v2'], [('job', 'v2')]),
            ('O alias é o que torna a virada reversível',
             'A aplicação aponta para o alias, nunca para o índice. Voltar atrás é mudar '
             'um ponteiro — não reindexar de novo.',
             ['ali'], [('ali', 'v1'), ('ali', 'v2')]),
            ('Medir o mesmo conjunto nos dois',
             'Embedding "melhor" no ranking público pode ser pior no seu acervo. A única '
             'medida que decide é a sua, com as suas perguntas.',
             ['ev'], [('ev', 'v1'), ('ev', 'v2')]),
            ('O custo da reindexação entra na decisão',
             'Não é só o cálculo dos vetores: é a janela de dupla infraestrutura. Saber '
             'isso antes evita começar a troca e abandonar no meio.',
             ['job'], [('ev', 'ali')]),
        ],
        legenda='A escolha do embedding é a mais difícil de reverter em RAG, porque '
                'trocá-la é reindexar o acervo inteiro. Índice versionado com virada por '
                'alias é o que transforma decisão irreversível em decisão testável.',
    ),
]

PERGUNTAS = [
    ('Por que meu RAG responde errado mesmo com um modelo bom?',
     'Porque na maioria dos casos o trecho certo não entrou no contexto, e o modelo '
     'respondeu corretamente sobre um contexto incompleto. A forma de saber é medir as '
     'duas etapas separadamente: recuperação (o trecho correto foi recuperado?) e geração '
     '(a resposta usou o que foi recuperado?). Com um número só, todo problema parece ser '
     'do modelo, e trocar de modelo não corrige defeito de corte, de filtro ou de índice — '
     'que é onde a maior parte dos casos se resolve.'),
    ('Quando usar busca híbrida em vez de só busca vetorial?',
     'Sempre que o acervo tiver token raro que o usuário digita literalmente: código de '
     'erro, sigla interna, número de peça, nome de cláusula. A busca vetorial representa o '
     'trecho inteiro num vetor e dilui o termo que aparece uma vez, enquanto o índice '
     'léxico pesa exatamente o que é raro. Como os dois erram em direções opostas, a fusão '
     'por posição dos rankings — não por nota, que vive em escalas incomparáveis — recupera '
     'justamente a consulta de maior intenção.'),
    ('Como controlar quem pode ver o quê num RAG corporativo?',
     'Capturando a permissão na ingestão e aplicando o filtro na consulta, pelo servidor. '
     'O sistema de origem sabe quem pode ver cada documento, e essa informação vira '
     'metadado do trecho; na consulta, a camada de servidor injeta o filtro com base nos '
     'grupos da sessão autenticada. Filtrar depois de recuperar já vazou, porque o trecho '
     'entrou no contexto do modelo, e instrução no prompt do tipo "não responda sobre '
     'salários" é orientação com taxa de falha, não mecanismo de permissão.'),
]

QUIZZES = [
    quiz('A avaliação mostra recuperação com 45% de acerto e geração com 92%. Onde '
         'investir?',
         ['Trocar por um modelo de geração maior, porque 92% ainda deixa margem',
          'No pipeline de ingestão e recuperação: corte, metadado, híbrido e reordenação',
          'Aumentar o número de trechos enviados ao contexto até a recuperação subir',
          'Aplicar ajuste fino no modelo com as perguntas do conjunto de referência'],
         1,
         'Os números apontam o gargalo: quando o trecho certo é recuperado, a geração o '
         'usa em 92% dos casos. O trabalho está antes. Modelo de geração maior melhora os '
         '92% e não toca nos 45%. Mandar mais trechos aumenta o recall e enche o contexto '
         'de ruído, o que costuma reduzir a precisão da resposta — é remendo, não '
         'correção. Ajuste fino ensina forma de responder, não faz o sistema recuperar o '
         'documento que a busca não encontrou.'),
    quiz('Você vai trocar o modelo de embedding de um acervo de 30 milhões de trechos. '
         'Qual procedimento evita a pior falha?',
         ['Reindexar em lotes no índice existente, para diluir o custo ao longo da semana',
          'Construir um índice novo em paralelo e virar por alias após avaliar os dois',
          'Manter os dois embeddings no mesmo índice e escolher por tipo de consulta',
          'Reindexar apenas os documentos mais consultados e deixar o resto no antigo'],
         1,
         'Distância entre vetores de modelos diferentes não significa nada, então qualquer '
         'estado misto é um índice que responde errado sem lançar erro. Reindexar em lotes '
         'no mesmo índice cria exatamente esse estado misto durante dias. Manter os dois no '
         'mesmo índice tem o mesmo defeito, agravado por decidir na consulta qual espaço '
         'usar. Reindexar só os populares deixa o acervo permanentemente dividido em dois '
         'espaços incomparáveis. O índice paralelo com virada por alias mantém a produção '
         'coerente e torna a decisão reversível.'),
    quiz('O acervo tem 40 milhões de trechos, consultados poucas vezes por dia por '
         'auditoria. O que a escolha de armazenamento vetorial deve considerar?',
         ['Só o volume: acervo grande exige o índice de menor latência disponível',
          'Volume e frequência juntos — acervo frio não justifica índice em memória',
          'Apenas o custo por gigabyte armazenado, porque o volume domina a fatura',
          'A latência mínima possível, já que auditoria não tolera espera'],
         1,
         'O que encarece um índice vetorial é a estrutura de busca aproximada residente em '
         'memória, e ela só se justifica quando há consulta frequente sensível a latência. '
         'Decidir pelo volume sozinho paga memória para um acervo praticamente parado. '
         'Olhar só o custo por gigabyte ignora que a memória — não o disco — é o que define '
         'a instância. E supor que auditoria exige latência mínima inverte o requisito: '
         'consulta semanal tolera segundos, e é justamente esse o caso em que armazenamento '
         'vetorial de custo baixo por volume vence.'),
]
