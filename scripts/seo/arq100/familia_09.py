#!/usr/bin/env python3
"""Família 9 — Plataforma de IA corporativa (soluções 81 a 90)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-plataforma'
NOME = 'Plataforma de IA corporativa'

ABERTURA = [
    p('Custo de IA é **variável por uso**, e isso quebra o modelo mental de infraestrutura '
      'que a maior parte das empresas tem. Não há uma instância para desligar: há milhões '
      'de chamadas de origens diferentes. Sem atribuição, a fatura é um número agregado que '
      'ninguém sabe atacar — e a primeira reação, cortar o uso, elimina o valor junto com o '
      'custo.'),
    p('As dez arquiteturas desta família constroem a plataforma que falta: **atribuição por '
      'inquilino**, cota, roteamento por dificuldade, cache semântico, versão de prompt e '
      'avaliação para escolher modelo. A decisão que mais se repete: **atribuir na chamada é '
      'mais confiável que inferir depois** pelo registro.'),
]

SOLUCOES = [
    Sol(
        n=81,
        titulo='81. Vários times consumindo modelo sem controle de custo',
        titulo_diagrama='Sem atribuição, a fatura é um número que ninguém sabe reduzir',
        problema='A conta de IA cresceu 400% em um trimestre e a diretoria pediu redução. '
                 'Ninguém sabe qual aplicação gastou o quê, então a única alavanca '
                 'disponível é reduzir o uso — o que elimina o valor junto com o custo.',
        checagem=('multi-inquilino', 'rastreamento de uso', 'cota'),
        grupos=[
            ('Porta única', 'plain', [
                ('api', 'apigateway', 'Portal de IA', 'toda chamada passa aqui'),
                ('idt', 'iam', 'Identidade do inquilino', 'time, aplicação, usuário'),
            ]),
            ('Controle', 'vpc', [
                ('cota', 'politica', 'Cota por inquilino', 'diária e por minuto'),
                ('rot', 'lambda', 'Roteador', 'modelo conforme a tarefa'),
            ]),
            ('Medida', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'o mesmo modelo para todos os times'),
                ('use', 'metrica', 'Uso por inquilino', 'tokens de entrada e de saída'),
                ('qs', 'quicksight', 'Painel por time', 'cada dono vê o próprio número'),
            ]),
        ],
        arestas=[
            ('idt', 'api', 'time, aplicação, usuário'),
            ('api', 'cota', 'consulta a cota'),
            ('cota', 'rot', 'dentro do limite'),
            ('rot', 'br', 'modelo escolhido'),
            ('br', 'use', 'tokens de entrada e de saída'),
            ('use', 'qs', 'gasto por inquilino'),
            ('cota', 'api', 'excedeu'),
        ],
        passos=[
            ('Toda chamada por uma porta',
             'É o pré-requisito de tudo o resto: sem ponto único, a medição tem buracos e a '
             'cota é contornável.',
             ['api'], [('idt', 'api'), ('api', 'cota')]),
            ('Identidade de inquilino em cada chamada',
             'Time, aplicação e usuário. Sem isso, o consumo é atribuível apenas à conta — '
             'que é o problema original.',
             ['idt'], [('idt', 'api')]),
            ('Cota antes do gasto, não relatório depois',
             'Cota é preventiva: ela impede o estouro. Relatório é detectivo: informa que '
             'aconteceu.',
             ['cota'], [('cota', 'rot'), ('cota', 'api')]),
            ('Tokens de entrada e de saída separados',
             'Eles têm preços diferentes e otimizações diferentes: entrada se reduz com '
             'cache e contexto menor, saída com instrução de tamanho.',
             ['use'], [('br', 'use')]),
            ('Custo visível ao dono é custo que cai',
             'O time que vê o próprio gasto otimiza. A conta agregada não tem dono, e por '
             'isso não tem redução.',
             ['qs'], [('use', 'qs')]),
        ],
        legenda='Custo de IA é variável por uso, e sem atribuição por inquilino a única '
                'alavanca é cortar o uso. Porta única, identidade em cada chamada, cota '
                'preventiva e painel por dono — nessa ordem.',
    ),
    Sol(
        n=82,
        titulo='82. Custo por inquilino invisível na fatura',
        titulo_diagrama='O perfil de inferência separa o gasto; etiqueta sozinha não separa chamada de modelo',
        problema='O time etiquetou todos os recursos e a fatura continuou trazendo o '
                 'consumo de modelo num só bloco. A razão é que a chamada de inferência não '
                 'é um recurso etiquetável — ela é uma operação, e a etiqueta do chamador '
                 'não a acompanha.',
        checagem=('Perfil de inferência de aplicação', 'etiqueta de alocação'),
        grupos=[
            ('Por inquilino', 'plain', [
                ('p1', 'bedrock', 'Perfil — inquilino A', 'etiquetado'),
                ('p2', 'bedrock', 'Perfil — inquilino B', 'etiquetado'),
            ]),
            ('Chamada', 'plain', [
                ('app', 'lambda', 'Aplicação', 'escolhe o perfil pelo inquilino'),
                ('br', 'bedrock', 'Modelo', 'o mesmo para os dois'),
            ]),
            ('Fatura', 'plain', [
                ('cur', 'costexplorer', 'Relatório de custo', 'linha por perfil'),
                ('tag', 'cost', 'Etiqueta de alocação', 'ativada no faturamento'),
            ]),
        ],
        arestas=[
            ('app', 'p1', 'inquilino A'),
            ('app', 'p2', 'inquilino B'),
            ('p1', 'br', 'mesma família de modelo'),
            ('p2', 'br', 'mesma família de modelo'),
            ('p1', 'cur', 'custo separado'),
            ('p2', 'cur', 'custo separado'),
            ('tag', 'cur', 'habilita a quebra', 'dashed'),
        ],
        passos=[
            ('A chamada de modelo não herda etiqueta do chamador',
             'É a descoberta que custa um trimestre: etiquetar a função não separa o consumo '
             'de inferência que ela provocou.',
             ['tag', 'br'], [('tag', 'cur')]),
            ('O perfil é a entidade etiquetável',
             'Criar um perfil por inquilino dá ao faturamento algo a que atribuir. É o '
             'mecanismo, não uma convenção de nome.',
             ['p1', 'p2'], [('app', 'p1'), ('app', 'p2')]),
            ('A aplicação escolhe o perfil pelo inquilino',
             'A decisão acontece no código, no momento da chamada. Errar o perfil é atribuir '
             'custo ao inquilino errado — e isso não se corrige depois.',
             ['app'], [('app', 'p1')]),
            ('A etiqueta precisa estar ativada no faturamento',
             'Etiqueta existente e não ativada como etiqueta de alocação não aparece no '
             'relatório. É a pegadinha de configuração mais comum aqui.',
             ['tag', 'cur'], [('tag', 'cur')]),
            ('O modelo continua sendo um só',
             'Não há duplicação de infraestrutura: os perfis apontam para o mesmo modelo. O '
             'que muda é a contabilidade.',
             ['br'], [('p1', 'br'), ('p2', 'br')]),
        ],
        legenda='Atribuir custo de inferência exige uma entidade etiquetável: o perfil de '
                'inferência por inquilino. Etiquetar o chamador não separa a chamada de '
                'modelo, e é por isso que a fatura chega agregada.',
    ),
    Sol(
        n=83,
        titulo='83. Metadado de requisição para atribuir consumo',
        titulo_diagrama='Atribuir na chamada é mais confiável que inferir depois pelo registro',
        problema='A tentativa de atribuir consumo cruzando registros por horário e origem '
                 'produz números que não fecham: chamadas concorrentes, repetições e '
                 'chamadas internas se misturam. A atribuição por inferência sempre tem '
                 'margem de erro — e ela cresce com o volume.',
        checagem=('Converse API', 'metadado de requisição', 'QuickSight'),
        grupos=[
            ('Na chamada', 'plain', [
                ('app', 'lambda', 'Aplicação', 'escolhe o metadado no momento da chamada'),
                ('meta', 'span', 'Metadado da requisição', 'inquilino, caso de uso, usuário'),
                ('br', 'bedrock', 'Converse API', 'grava o metadado junto da invocação'),
            ]),
            ('Coleta', 'plain', [
                ('log', 's3', 'Registro de invocação', 'com o metadado dentro'),
                ('etl', 'glue', 'ETL', 'normaliza e agrega por dia'),
            ]),
            ('Consumo', 'plain', [
                ('qs', 'quicksight', 'Painel', 'custo por caso de uso'),
                ('alr', 'alerta', 'Alarme por inquilino', 'desvio do padrão dele'),
            ]),
        ],
        arestas=[
            ('app', 'meta', 'inquilino e caso de uso'),
            ('meta', 'br', 'viaja com a requisição'),
            ('br', 'log', 'invocação + metadado'),
            ('log', 'etl', 'registros do dia'),
            ('etl', 'qs', 'agregado por dia'),
            ('etl', 'alr', 'desvio do padrão'),
        ],
        passos=[
            ('O metadado viaja com a requisição',
             'Ele é gravado junto da invocação, não correlacionado depois. Isso elimina a '
             'margem de erro da atribuição por horário.',
             ['meta'], [('app', 'meta'), ('meta', 'br')]),
            ('Caso de uso, não só inquilino',
             'Saber que o time X gastou não diz o que reduzir. Saber que foi o resumo '
             'automático de tickets diz.',
             ['meta', 'qs'], [('etl', 'qs')]),
            ('O registro de invocação é a fonte',
             'Ele traz tokens de entrada e de saída por chamada. É a granularidade que '
             'permite custo por caso de uso.',
             ['log'], [('br', 'log')]),
            ('Agregar por dia, guardar o detalhe',
             'O painel usa o agregado; a investigação usa o detalhe. Guardar só o agregado '
             'impede responder "qual chamada custou isso?".',
             ['etl'], [('log', 'etl')]),
            ('Alarme relativo ao padrão do inquilino',
             'Limite absoluto igual para todos alarma o time grande e ignora o pequeno que '
             'dobrou de consumo.',
             ['alr'], [('etl', 'alr')]),
        ],
        legenda='Atribuição confiável se faz na chamada, com metadado que viaja junto da '
                'requisição — e por caso de uso, não só por inquilino, porque é o caso de uso '
                'que se otimiza.',
    ),
    Sol(
        n=84,
        titulo='84. Isolamento entre inquilinos com infraestrutura compartilhada',
        titulo_diagrama='Isolamento por contexto não basta: identidade e permissão por inquilino',
        problema='A plataforma atende trinta clientes com a mesma infraestrutura, e o '
                 'isolamento é feito injetando o identificador do inquilino no prompt. '
                 'Basta uma pergunta bem formulada, ou um erro de montagem de contexto, '
                 'para um cliente ver dado de outro.',
        checagem=('reservatório', 'AgentCore', 'identidade por inquilino'),
        grupos=[
            ('Requisição', 'plain', [
                ('cli', 'cliente', 'Cliente do inquilino', 'de um dos trinta inquilinos'),
                ('aut', 'cognito', 'Autenticação', 'inquilino vem do token, não do corpo'),
            ]),
            ('Reservatório compartilhado', 'plain', [
                ('ac', 'agentcore', 'Runtime compartilhado', 'sessão isolada por inquilino'),
                ('cred', 'iam', 'Credencial por inquilino', 'assume papel específico'),
            ]),
            ('Dado por inquilino', 'plain', [
                ('kb', 'knowledgebases', 'Acervo', 'partição por inquilino'),
                ('db', 'dynamodb', 'Estado', 'chave com o inquilino no prefixo'),
            ]),
        ],
        arestas=[
            ('cli', 'aut', 'credencial do usuário'),
            ('aut', 'ac', 'inquilino autenticado'),
            ('ac', 'cred', 'assume o papel do inquilino'),
            ('cred', 'kb', 'só a partição dele'),
            ('cred', 'db', 'chave com o inquilino no prefixo'),
            ('kb', 'ac', 'trechos daquele inquilino'),
        ],
        passos=[
            ('O inquilino vem do token, nunca do corpo da requisição',
             'Se chega no corpo, qualquer cliente se declara outro. A autenticação é a única '
             'fonte aceitável dessa informação.',
             ['aut'], [('cli', 'aut'), ('aut', 'ac')]),
            ('Credencial por inquilino, não credencial da plataforma',
             'O runtime assume um papel restrito à partição daquele cliente. É o que '
             'transforma isolamento lógico em isolamento imposto.',
             ['cred'], [('ac', 'cred')]),
            ('Prompt não isola nada',
             '"Responda só sobre o cliente 42" é instrução. Permissão que não alcança os '
             'dados dos outros é garantia.',
             ['ac', 'kb'], [('cred', 'kb')]),
            ('A chave de dado carrega o inquilino',
             'Prefixo no identificador impede consulta acidental atravessar. É defesa em '
             'profundidade, junto da credencial.',
             ['db'], [('cred', 'db')]),
            ('Compartilhar infraestrutura é decisão de custo, não de isolamento',
             'O reservatório reduz custo por cliente. O isolamento vem de identidade e '
             'permissão — e precisa ser explícito.',
             ['ac'], [('kb', 'ac')]),
        ],
        legenda='Em multi-inquilino, isolamento por contexto é instrução com taxa de falha. O '
                'que isola é identidade autenticada, credencial que assume papel por inquilino '
                'e partição de dado com o inquilino na chave.',
    ),
    Sol(
        n=85,
        titulo='85. Muitas contas precisando alcançar o mesmo serviço de IA',
        titulo_diagrama='Sem compartilhamento de recurso, cada conta recria a rede',
        problema='Vinte contas precisam alcançar o serviço interno de IA, e cada uma criou '
                 'seus próprios endpoints, rotas e regras. O custo se multiplica por vinte, '
                 'e a topologia deixa de ser administrável — ninguém sabe quem alcança o '
                 'quê.',
        checagem=('concentrador', 'trânsito', 'conta central'),
        grupos=[
            ('Contas consumidoras', 'plain', [
                ('c1', 'vpc', 'Conta A', 'não recria endpoint nem tabela de rotas'),
                ('c2', 'vpc', 'Conta B', 'usa o que a conta central publica'),
                ('c3', 'vpc', 'Conta C…', 'vinte contas'),
            ]),
            ('Rede central', 'account', [
                ('tg', 'transitgateway', 'Concentrador de trânsito', 'um lugar para as rotas'),
                ('pl', 'privatelink', 'Endpoints compartilhados', 'criados uma vez'),
            ]),
            ('Serviço', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'um endpoint para vinte contas'),
                ('r53', 'route53', 'Resolução compartilhada', 'nome único para todos'),
            ]),
        ],
        arestas=[
            ('c1', 'tg', 'rota para o serviço'),
            ('c2', 'tg', 'mesma rota'),
            ('c3', 'tg', 'mesma rota'),
            ('tg', 'pl', 'tráfego concentrado'),
            ('pl', 'br', 'chamada privada'),
            ('r53', 'tg', 'nome resolve igual', 'dashed'),
        ],
        passos=[
            ('Endpoint criado uma vez, usado por todas',
             'Vinte endpoints iguais custam vinte vezes e divergem em configuração. O '
             'compartilhamento elimina os dois problemas.',
             ['pl'], [('tg', 'pl'), ('pl', 'br')]),
            ('O concentrador dá um lugar para as rotas',
             'Malha ponto a ponto entre vinte contas é combinatória. Concentrador troca isso '
             'por vinte ligações e uma tabela.',
             ['tg'], [('c1', 'tg'), ('c2', 'tg')]),
            ('Resolução de nome compartilhada',
             'Sem ela, cada conta configura o próprio nome e a mudança de endereço exige '
             'vinte alterações coordenadas.',
             ['r53'], [('r53', 'tg')]),
            ('A conta central é dona da rede, não do dado',
             'A separação de responsabilidade é o que evita a conta de rede virar depósito '
             'de tudo.',
             ['tg', 'br'], [('pl', 'br')]),
            ('Administrável significa auditável',
             'Com um ponto de trânsito, "quem alcança o serviço de IA?" é uma consulta. Com '
             'vinte topologias, é um projeto.',
             ['tg', 'pl'], [('c3', 'tg')]),
        ],
        legenda='Compartilhar endpoint e centralizar trânsito troca custo multiplicado por '
                'vinte e topologia combinatória por uma tabela de rotas — e transforma "quem '
                'alcança o quê" de projeto em consulta.',
    ),
    Sol(
        n=86,
        titulo='86. Custo de inferência com prompt repetido',
        titulo_diagrama='Cache semântico responde o quase-igual em milissegundos',
        problema='Metade das perguntas ao assistente são variações da mesma dúvida — '
                 '"como cancelo?", "posso cancelar?", "qual o processo de cancelamento?". '
                 'Cada uma paga uma inferência completa, e o cache por texto exato não pega '
                 'nenhuma delas.',
        checagem=('Cache semântico', 'MemoryDB'),
        grupos=[
            ('Consulta', 'plain', [
                ('q', 'user', 'Pergunta', 'metade é variação da mesma dúvida'),
                ('emb', 'embedder', 'Embedding da pergunta', 'barato comparado à geração'),
            ]),
            ('Cache semântico', 'vpc', [
                ('md', 'memorydb', 'MemoryDB', 'vetor + resposta, com validade'),
                ('lim', 'politica', 'Limiar de similaridade', 'o parâmetro que decide tudo'),
            ]),
            ('Geração', 'plain', [
                ('br', 'bedrock', 'Bedrock', 'só quando não há acerto'),
                ('tx', 'metrica', 'Taxa de acerto', 'e o custo evitado'),
            ]),
        ],
        arestas=[
            ('q', 'emb', 'vetor da pergunta'),
            ('emb', 'md', 'busca o mais próximo'),
            ('md', 'lim', 'distância'),
            ('lim', 'q', 'acerto: responde do cache'),
            ('lim', 'br', 'erro: gera'),
            ('br', 'md', 'guarda'),
            ('md', 'tx', 'acerto e custo evitado', 'dashed'),
        ],
        passos=[
            ('Cache exato não pega variação de redação',
             'É por isso que ele tem taxa de acerto quase nula em linguagem natural. O '
             'semântico compara sentido, não string.',
             ['emb', 'md'], [('emb', 'md')]),
            ('O limiar é o parâmetro perigoso',
             'Frouxo demais responde a pergunta errada com resposta parecida. Apertado '
             'demais não acerta nada. Ele se calibra medindo, não estimando.',
             ['lim'], [('md', 'lim')]),
            ('Embedding é ordens de magnitude mais barato que geração',
             'É o que faz a economia existir: paga-se um cálculo pequeno para evitar um '
             'grande.',
             ['emb'], [('q', 'emb')]),
            ('Validade obrigatória',
             'Resposta cacheada sobre política que mudou é resposta errada servida rápido. '
             'A validade precisa acompanhar o ritmo do acervo.',
             ['md'], [('br', 'md')]),
            ('Medir acerto e custo evitado',
             'Sem o número, o cache é fé. Com ele, dá para decidir se vale afrouxar o '
             'limiar — e quanto risco isso adiciona.',
             ['tx'], [('md', 'tx')]),
        ],
        legenda='Cache semântico captura a variação de redação que o cache exato não pega, e a '
                'economia vem de o embedding ser muito mais barato que a geração. O limiar de '
                'similaridade é o parâmetro que precisa ser medido, não estimado.',
    ),
    Sol(
        n=87,
        titulo='87. Modelo grande usado em tarefa simples',
        titulo_diagrama='O roteador que erra a classificação degrada em silêncio',
        problema='Todas as chamadas usam o modelo mais capaz, inclusive as de classificar '
                 'sentimento e extrair um campo. Rotear por dificuldade corta o custo — e '
                 'introduz um componente novo que pode errar sem que ninguém veja.',
        checagem=('Roteamento por dificuldade', 'classificador', 'avaliação'),
        grupos=[
            ('Roteamento', 'vpc', [
                ('cls', 'comprehend', 'Classificador de dificuldade', 'rápido e barato'),
                ('rot', 'lambda', 'Roteador', 'decide o destino'),
            ]),
            ('Destinos', 'plain', [
                ('pq', 'claude', 'Modelo pequeno', 'tarefa simples'),
                ('gr', 'claude', 'Modelo grande', 'tarefa que exige raciocínio'),
            ]),
            ('Rede de segurança', 'plain', [
                ('ev', 'bedrockeval', 'Avaliação do roteador', 'conjunto próprio, com rótulo'),
                ('esc', 'checkpoint', 'Escalonamento', 'resposta insuficiente sobe de modelo'),
            ]),
        ],
        arestas=[
            ('cls', 'rot', 'classe + confiança'),
            ('rot', 'pq', 'simples'),
            ('rot', 'gr', 'difícil'),
            ('pq', 'esc', 'não resolveu'),
            ('esc', 'gr', 'refaz no grande'),
            ('ev', 'rot', 'mede o acerto', 'dashed'),
        ],
        passos=[
            ('O roteador é um componente com erro próprio',
             'Ele acrescenta uma fonte de falha que não existia. E o erro dele é silencioso: '
             'a resposta sai, só é pior.',
             ['rot', 'cls'], [('cls', 'rot')]),
            ('Conjunto de avaliação para o roteador',
             'Perguntas rotuladas com a dificuldade real. Sem isso, não há como saber se ele '
             'está mandando caso difícil para o modelo pequeno.',
             ['ev'], [('ev', 'rot')]),
            ('Escalonamento como segunda chance',
             'Quando a resposta do modelo pequeno não atende ao critério, refazer no grande '
             'custa duas chamadas — e ainda sai mais barato que usar o grande sempre.',
             ['esc'], [('pq', 'esc'), ('esc', 'gr')]),
            ('Confiança baixa vai para o grande',
             'Na dúvida, o caminho seguro é o modelo capaz. O ganho vem do volume '
             'claramente simples, não de forçar os casos limítrofes.',
             ['rot', 'gr'], [('rot', 'gr')]),
            ('Medir qualidade junto com custo',
             'Custo caindo com qualidade caindo não é otimização. As duas séries precisam ser '
             'lidas juntas.',
             ['ev', 'esc'], [('ev', 'rot')]),
        ],
        legenda='Roteamento por dificuldade é a maior alavanca de custo e introduz um '
                'componente que erra em silêncio. Ele precisa de conjunto de avaliação próprio '
                'e de escalonamento quando a resposta do modelo pequeno não atende.',
    ),
    Sol(
        n=88,
        titulo='88. Escolha de modelo sem critério',
        titulo_diagrama='Ranking público mede outro corpus; a decisão é medir na sua tarefa',
        problema='A escolha do modelo foi feita por posição em ranking público e por '
                 'impressão de quem testou dez perguntas. Meses depois, ninguém sabe dizer '
                 'se o modelo em uso é melhor que a alternativa — porque nunca houve '
                 'comparação com os mesmos casos.',
        checagem=('Evaluations', 'dois candidatos', 'custo'),
        grupos=[
            ('Conjunto próprio', 'plain', [
                ('gs', 'dataset', 'Casos da sua tarefa', 'com resposta esperada'),
                ('cri', 'juiz', 'Critério de acerto', 'definido antes de rodar'),
            ]),
            ('Comparação', 'plain', [
                ('ev', 'bedrockeval', 'Bedrock Evaluations', 'os mesmos casos nos dois'),
                ('a', 'claude', 'Candidato A', 'medido nos SEUS casos, não em ranking'),
                ('b', 'bedrock', 'Candidato B', 'medido nos mesmos casos'),
            ]),
            ('Decisão', 'plain', [
                ('mat', 'metrica', 'Acerto × custo × latência', 'três eixos, não um'),
            ]),
        ],
        arestas=[
            ('gs', 'ev', 'casos + resposta esperada'),
            ('cri', 'ev', 'o que conta como acerto'),
            ('ev', 'a', 'os mesmos casos'),
            ('ev', 'b', 'os mesmos casos'),
            ('a', 'mat', 'acerto, custo, latência'),
            ('b', 'mat', 'acerto, custo, latência'),
        ],
        passos=[
            ('Ranking público mede outro corpus',
             'Ele responde "qual é melhor em média, em tarefas gerais". A sua pergunta é '
             '"qual é melhor na minha tarefa" — e as respostas divergem com frequência.',
             ['gs'], [('gs', 'ev')]),
            ('Critério de acerto definido antes',
             'Decidir o que conta como acerto depois de ver os resultados é escolher o '
             'vencedor e chamar de medição.',
             ['cri'], [('cri', 'ev')]),
            ('Os mesmos casos nos dois candidatos',
             'Comparar em conjuntos diferentes não compara nada. É o erro mais comum em '
             'avaliação caseira.',
             ['ev', 'a', 'b'], [('ev', 'a'), ('ev', 'b')]),
            ('Três eixos: acerto, custo e latência',
             'O melhor em acerto pode ser inviável em custo ou em prazo. A decisão é o '
             'ponto que atende ao requisito, não o topo de um eixo.',
             ['mat'], [('a', 'mat'), ('b', 'mat')]),
            ('O conjunto fica, e serve para a próxima troca',
             'O investimento no conjunto se paga na segunda decisão — e modelo novo aparece a '
             'cada poucos meses.',
             ['gs', 'ev'], [('gs', 'ev')]),
        ],
        legenda='A decisão de modelo se toma medindo na sua tarefa, com critério definido '
                'antes e os mesmos casos nos candidatos — em três eixos. Ranking público '
                'responde a outra pergunta.',
    ),
    Sol(
        n=89,
        titulo='89. Prompt como texto colado sem versão',
        titulo_diagrama='Sem versão de prompt não há como investigar regressão',
        problema='A qualidade caiu na terça e ninguém sabe o que mudou. O prompt vive '
                 'colado em três lugares do código, foi ajustado por duas pessoas na '
                 'semana, e não há histórico — o que faz a investigação começar por '
                 'arqueologia de mensagem de commit.',
        checagem=('Prompt Management', 'versão', 'alias'),
        grupos=[
            ('Gestão', 'plain', [
                ('pm', 'promptmgmt', 'Prompt Management', 'versão imutável'),
                ('ali', 'route53', 'Alias', 'produção aponta para uma versão'),
            ]),
            ('Uso', 'plain', [
                ('app', 'lambda', 'Aplicação', 'referencia o alias, nunca o texto'),
                ('br', 'bedrock', 'Bedrock', 'recebe a versão de prompt já resolvida'),
            ]),
            ('Investigação', 'plain', [
                ('log', 'audit', 'Registro', 'versão usada em cada chamada'),
                ('ev', 'bedrockeval', 'Avaliação por versão', 'compara antes de promover'),
            ]),
        ],
        arestas=[
            ('pm', 'ali', 'versão promovida'),
            ('ali', 'app', 'resolve para uma versão'),
            ('app', 'br', 'prompt resolvido'),
            ('br', 'log', 'com a versão'),
            ('pm', 'ev', 'candidata'),
            ('ev', 'ali', 'autoriza promover'),
        ],
        passos=[
            ('Prompt muda mais que código',
             'E muda sem revisão, por quem não é engenheiro. É a razão de ele precisar de '
             'versionamento próprio em vez de viver dentro do código.',
             ['pm'], [('pm', 'ali')]),
            ('A aplicação referencia o alias',
             'Trocar a versão em produção passa a ser mover um ponteiro — sem implantação e '
             'com reversão imediata.',
             ['ali', 'app'], [('ali', 'app')]),
            ('A versão usada entra no registro da chamada',
             'É o que transforma "a qualidade caiu na terça" em "a versão 7 entrou às 14h de '
             'terça".',
             ['log'], [('br', 'log')]),
            ('Avaliar a candidata antes de promover',
             'Prompt novo é mudança de comportamento. Compará-lo no mesmo conjunto é o que '
             'evita a regressão chegar ao usuário.',
             ['ev'], [('pm', 'ev'), ('ev', 'ali')]),
            ('Versão imutável, não editável',
             'Editar a versão em uso destrói a capacidade de comparar. Nova redação é nova '
             'versão.',
             ['pm', 'ali'], [('pm', 'ali')]),
        ],
        legenda='Prompt muda mais que código e por mais gente: sem versão imutável, alias e '
                'registro da versão usada em cada chamada, investigar regressão é arqueologia '
                'de commit.',
    ),
    Sol(
        n=90,
        titulo='90. Orquestração que a área de negócio precisa alterar',
        titulo_diagrama='Fluxo visual troca controle por visibilidade — e a troca é consciente',
        problema='A área de negócio quer ajustar a sequência do processo sem esperar '
                 'implantação. O fluxo visual entrega isso — e cobra: versionar em revisão '
                 'de código fica difícil, testar um trecho isolado fica difícil, e o erro '
                 'fino de tratamento não cabe.',
        checagem=('Bedrock Flows', 'fluxo estável', 'código'),
        grupos=[
            ('Fluxo visual', 'plain', [
                ('fl', 'bedrockflows', 'Bedrock Flows', 'a área de negócio altera'),
                ('viz', 'window', 'Visibilidade', 'o desenho É a documentação'),
            ]),
            ('Código', 'vpc', [
                ('cod', 'lambda', 'Passo em código', 'erro fino, teste isolado, versão'),
                ('tst', 'eval', 'Teste automatizado', 'só existe do lado do código'),
            ]),
            ('Critério', 'plain', [
                ('est', 'politica', 'É estável e simples?', 'a pergunta que decide'),
            ]),
        ],
        arestas=[
            ('est', 'fl', 'sim: visual'),
            ('est', 'cod', 'não: código'),
            ('fl', 'cod', 'chama passo específico'),
            ('fl', 'viz', 'o desenho é a documentação'),
            ('cod', 'tst', 'trecho testável isolado'),
        ],
        passos=[
            ('A troca é visibilidade por controle',
             'O visual ganha em quem pode alterar e em documentação viva. Perde em '
             'versionamento, teste isolado e tratamento fino de erro.',
             ['fl', 'cod'], [('est', 'fl'), ('est', 'cod')]),
            ('O critério é estabilidade e simplicidade',
             'Fluxo que muda toda semana por decisão de negócio: visual. Fluxo com muitos '
             'caminhos de erro e regra sutil: código.',
             ['est'], [('est', 'fl')]),
            ('Misturar é o padrão que funciona',
             'Fluxo visual chamando passos em código junta as duas vantagens: a sequência é '
             'visível e alterável, a lógica difícil é testável.',
             ['fl', 'cod'], [('fl', 'cod')]),
            ('Teste automatizado só existe do lado do código',
             'É a perda mais séria do visual, e é ela que precisa ser pesada antes de mover '
             'lógica crítica para lá.',
             ['tst'], [('cod', 'tst')]),
            ('A visibilidade tem valor real',
             'Em processo que várias áreas discutem, o desenho ser a documentação evita a '
             'divergência entre o que se pensa e o que roda.',
             ['viz'], [('fl', 'viz')]),
        ],
        legenda='Fluxo visual e código não são níveis de maturidade: são uma troca entre '
                'visibilidade e controle. O padrão que sustenta é o híbrido — sequência '
                'visível chamando passos testáveis em código.',
    ),
]

PERGUNTAS = [
    ('Como saber quanto cada time gasta com IA na AWS?',
     'Criando um perfil de inferência de aplicação por inquilino e ativando a etiqueta como '
     'etiqueta de alocação de custo — porque a chamada de inferência não herda a etiqueta do '
     'recurso que a fez. É a descoberta que costuma custar um trimestre: o time etiqueta as '
     'funções, e a fatura continua trazendo o consumo de modelo num bloco só. Vale também '
     'mandar metadado de requisição na própria chamada, com inquilino e caso de uso, porque '
     'atribuir na chamada é mais confiável que correlacionar registros por horário depois.'),
    ('Vale a pena rotear entre modelo pequeno e modelo grande?',
     'Vale, e é a maior alavanca de custo — desde que o roteador tenha conjunto de avaliação '
     'próprio. Ele é um componente novo com erro próprio, e o erro dele é silencioso: manda '
     'caso difícil para o modelo pequeno, a resposta sai, e só é pior. As duas proteções são '
     'perguntas rotuladas com a dificuldade real, para medir o acerto do roteador, e '
     'escalonamento quando a resposta do modelo pequeno não atende ao critério — duas '
     'chamadas ainda saem mais baratas que usar o grande sempre.'),
    ('Como escolher entre dois modelos para uma aplicação?',
     'Medindo os dois nos mesmos casos da sua tarefa, com critério de acerto definido antes de '
     'ver os resultados, e comparando em três eixos: acerto, custo e latência. Ranking público '
     'responde a outra pergunta — qual é melhor em média num corpus geral — e divergir da sua '
     'tarefa é comum. Definir o critério depois de olhar os resultados é escolher o vencedor e '
     'chamar de medição; e o conjunto construído se paga na próxima troca, porque modelo novo '
     'aparece a cada poucos meses.'),
]

QUIZZES = [
    quiz('Você etiquetou todas as funções Lambda por time e a fatura continua trazendo o '
         'consumo de Bedrock agregado. Por quê?',
         ['A etiqueta leva até 24 horas para aparecer no relatório de custo',
          'A chamada de inferência não herda a etiqueta do chamador — é preciso um perfil de inferência etiquetado por inquilino',
          'Falta ativar o relatório detalhado de uso na conta pagadora',
          'Etiquetas em Lambda não são suportadas para alocação de custo'],
         1,
         'A inferência é uma operação, não um recurso etiquetável, e a etiqueta de quem chamou '
         'não a acompanha na fatura. O que dá ao faturamento algo a que atribuir é um perfil de '
         'inferência de aplicação por inquilino, com a etiqueta ativada como etiqueta de '
         'alocação. Atraso de propagação existe mas é de horas e não explica agregação '
         'permanente. O relatório detalhado ajuda a investigar e não cria a quebra que não '
         'existe. E etiquetas em Lambda são suportadas — o problema é que elas descrevem a '
         'função, não a chamada de modelo.'),
    quiz('Numa plataforma multi-inquilino, o isolamento é feito injetando o identificador do '
         'inquilino no prompt. Qual é o defeito?',
         ['O prompt fica maior e aumenta o custo por chamada',
          'Isolamento por instrução tem taxa de falha; o que isola é credencial que não alcança o dado dos outros',
          'O modelo pode não entender o formato do identificador',
          'O identificador aparece nos registros de invocação'],
         1,
         'Instrução no contexto é orientação com taxa de falha, e basta um erro de montagem de '
         'contexto ou uma pergunta bem formulada para um cliente ver dado de outro. O que isola '
         'é o runtime assumir um papel restrito à partição daquele inquilino, com o inquilino '
         'vindo do token autenticado e não do corpo da requisição. O custo extra de tokens é '
         'irrelevante diante do risco. Formato do identificador não é o problema. E aparecer '
         'nos registros é até desejável, para auditoria.'),
    quiz('A qualidade das respostas caiu ontem e o prompt vive colado em três lugares do '
         'código. O que teria evitado a investigação por arqueologia?',
         ['Um teste automatizado rodando a cada implantação',
          'Versão imutável de prompt com alias, e a versão usada registrada em cada chamada',
          'Registrar todas as respostas geradas em armazenamento imutável',
          'Fixar a versão do modelo no perfil de inferência'],
         1,
         'Com versão imutável e o identificador da versão gravado por chamada, "a qualidade caiu '
         'ontem" vira "a versão 7 entrou às 14h" — e a reversão é mover um ponteiro. Teste a '
         'cada implantação não cobre a mudança de prompt feita fora do código, que é justamente '
         'o caso. Guardar as respostas mostra o sintoma sem identificar a causa entre três '
         'trechos editados por duas pessoas. Fixar a versão do modelo elimina outra fonte de '
         'variação, real mas diferente: aqui o que mudou foi o prompt.'),
]
