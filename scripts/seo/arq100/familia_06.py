#!/usr/bin/env python3
"""Família 6 — Dados, analytics e BI conversacional (soluções 51 a 60)."""
from __future__ import annotations

from comum import Sol, p, quiz

SLUG = 'arq-ia-aws-dados'
NOME = 'Dados, analytics e BI conversacional'

ABERTURA = [
    p('Aqui a IA entra num sistema que já tinha regras próprias — e a regra mais dura é '
      'que **o modelo não adivinha o significado da coluna**. Catálogo bem descrito rende '
      'mais que instrução elaborada: uma coluna chamada `dt_ref` com a descrição "data de '
      'competência contábil, não a data do lançamento" muda a consulta gerada; a mesma '
      'coluna sem descrição gera um número errado com aparência de certo.'),
    p('A segunda regra é de divisão de trabalho. Previsão e detecção de anomalia são '
      'tarefas de modelo tabular, não de modelo de linguagem; o modelo de linguagem entra '
      'na **explicação** do desvio, na geração da consulta e na descrição do metadado. '
      'Confundir os dois papéis produz previsão ruim e explicação desnecessária.'),
]

SOLUCOES = [
    Sol(
        n=51,
        titulo='51. Pergunta de negócio que exige SQL',
        titulo_diagrama='Catálogo bem descrito rende mais que instrução elaborada',
        problema='"Quanto vendemos de assinatura recorrente no Nordeste no trimestre?" '
                 'exige saber que `tipo_rec = 2` significa recorrente e que a região vem '
                 'de uma tabela de dimensão. O modelo não tem como adivinhar isso — e '
                 'quando adivinha, devolve um número plausível e errado.',
        checagem=('catálogo de dados', 'Athena', 'varredura'),
        grupos=[
            ('Contexto do dado', 'plain', [
                ('gl', 'glue', 'Catálogo de dados', 'descrição por coluna e valor de domínio'),
                ('dz', 'datazone', 'Glossário de negócio', '"receita recorrente" definida'),
            ]),
            ('Geração', 'plain', [
                ('usu', 'user', 'Área de negócio', 'pergunta em português, sobre o negócio'),
                ('cl', 'claude', 'Claude', 'esquema + glossário no contexto'),
            ]),
            ('Execução contida', 'plain', [
                ('lim', 'politica', 'Limite de varredura', 'por consulta, não por dia'),
                ('at', 'athena', 'Athena', 'partição obrigatória na cláusula'),
            ]),
        ],
        arestas=[
            ('gl', 'cl', 'esquema descrito'),
            ('dz', 'cl', 'termo de negócio'),
            ('usu', 'cl', 'pergunta de negócio'),
            ('cl', 'lim', 'SQL proposto'),
            ('lim', 'at', 'SQL dentro do teto'),
            ('at', 'usu', 'número + consulta'),
        ],
        passos=[
            ('Descrição de coluna é o insumo de maior retorno',
             'Nome de coluna quase nunca diz o significado. Investir uma semana em '
             'descrever colunas rende mais que meses ajustando a instrução.',
             ['gl'], [('gl', 'cl')]),
            ('Valor de domínio no contexto',
             '`tipo_rec = 2` só é traduzível se o catálogo disser o que 2 significa. Sem '
             'isso o modelo inventa o filtro — e o número sai plausível.',
             ['gl', 'cl'], [('gl', 'cl')]),
            ('Termo de negócio é ambíguo por natureza',
             '"Receita recorrente" tem definição na empresa, e ela não está no esquema. O '
             'glossário é o que impede cada consulta usar uma definição diferente.',
             ['dz'], [('dz', 'cl')]),
            ('Partição obrigatória na consulta',
             'Consulta sem filtro de partição varre o histórico inteiro. Exigir a partição '
             'é a contenção de custo mais eficaz — e ela é verificável antes de executar.',
             ['at', 'lim'], [('lim', 'at')]),
            ('Limite por consulta, não por dia',
             'Cota diária permite uma consulta destruir a cota de todos. O teto por '
             'consulta isola o dano.',
             ['lim'], [('cl', 'lim')]),
        ],
        legenda='O modelo não adivinha o significado da coluna nem a definição de negócio: '
                'catálogo descrito e glossário no contexto valem mais que qualquer '
                'refinamento de instrução. A contenção de custo é a partição obrigatória.',
    ),
    Sol(
        n=52,
        titulo='52. Painel que ninguém consulta porque a pergunta muda',
        titulo_diagrama='Explicar a consulta gerada é o que dá confiança para aceitar o número',
        problema='O painel responde as dez perguntas de quando foi construído, e a '
                 'décima primeira exige um pedido ao time de dados com duas semanas de '
                 'espera. A camada conversacional resolve a flexibilidade e cria outro '
                 'problema: por que confiar num número que apareceu do nada?',
        checagem=('conversacional', 'consulta gerada', 'explicada'),
        grupos=[
            ('Camada conversacional', 'plain', [
                ('usu', 'user', 'Analista de negócio', 'vai levar o número para a reunião'),
                ('cl', 'claude', 'Claude', 'gera, executa e EXPLICA'),
            ]),
            ('Transparência', 'plain', [
                ('sql', 'doc', 'Consulta exibida', 'com as tabelas e os filtros'),
                ('exp', 'chars', 'Explicação em prosa', '"contei pedidos com status pago"'),
                ('lin', 'graph', 'Linhagem', 'de onde vem cada tabela usada'),
            ]),
            ('Armazém', 'plain', [
                ('rs', 'redshift', 'Redshift', 'o armazém que a empresa já tem'),
                ('qs', 'quicksight', 'Painel fixo', 'para o que é recorrente'),
            ]),
        ],
        arestas=[
            ('usu', 'cl', 'pergunta nova'),
            ('cl', 'rs', 'consulta'),
            ('rs', 'cl', 'resultado'),
            ('cl', 'sql', 'a consulta que rodou'),
            ('cl', 'exp', 'o que foi contado'),
            ('sql', 'lin', 'tabelas usadas'),
            ('exp', 'usu', 'número + como cheguei'),
            ('usu', 'qs', 'virou recorrente? fixa no painel'),
        ],
        passos=[
            ('Número sem procedência não é usado',
             'Quem vai levar o dado à reunião precisa poder defender como ele foi obtido. '
             'Sem isso, o analista refaz no Excel — e a camada conversacional não é '
             'adotada.',
             ['exp', 'sql'], [('cl', 'exp'), ('exp', 'usu')]),
            ('Explicação em prosa, não só o SQL',
             'Quem faz a pergunta muitas vezes não lê SQL. "Contei pedidos com status pago '
             'entre janeiro e março" é auditável por quem conhece o negócio.',
             ['exp'], [('cl', 'exp')]),
            ('Linhagem responde a pergunta seguinte',
             '"Essa tabela é atualizada quando?" vem sempre depois do número. Ter a '
             'linhagem ali encurta a segunda conversa.',
             ['lin'], [('sql', 'lin')]),
            ('Pergunta recorrente vira painel fixo',
             'Se a mesma pergunta aparece toda semana, gerar a consulta de novo é '
             'desperdício. A camada conversacional serve à cauda longa, não ao recorrente.',
             ['qs'], [('usu', 'qs')]),
            ('O painel não morre — ele muda de papel',
             'Ele passa a servir o que é estável e monitorado. A conversa cobre a pergunta '
             'que ninguém previu, que é onde o painel sempre falhou.',
             ['qs', 'cl'], [('usu', 'qs')]),
        ],
        legenda='A flexibilidade da camada conversacional só é aproveitada se o número vier '
                'com procedência: consulta exibida, explicação em prosa e linhagem. E '
                'pergunta que se repete deve virar painel — a conversa é para a cauda longa.',
    ),
    Sol(
        n=53,
        titulo='53. Custo de consulta gerada sem controle',
        titulo_diagrama='Formato colunar com particionamento corta o dado varrido em ordem de magnitude',
        problema='A primeira fatura depois de abrir o BI conversacional veio dez vezes '
                 'maior. A causa não foi o modelo: foram consultas geradas varrendo '
                 'terabytes porque a tabela estava em CSV, sem partição, e qualquer filtro '
                 'lia tudo.',
        checagem=('varrido', 'particionamento', 'colunar'),
        grupos=[
            ('Antes', 'plain', [
                ('csv', 's3', 'CSV sem partição', 'toda consulta lê tudo'),
            ]),
            ('Depois', 'plain', [
                ('par', 's3', 'Parquet particionado', 'por data e por região'),
                ('gl', 'glue', 'Catálogo', 'partições registradas'),
            ]),
            ('Contenção', 'plain', [
                ('lim', 'politica', 'Teto de dado varrido', 'por consulta'),
                ('at', 'athena', 'Athena', 'grupo de trabalho com limite'),
            ]),
            ('Medida', 'plain', [
                ('cost', 'costexplorer', 'Custo por consulta', 'a série que revela o efeito'),
            ]),
        ],
        arestas=[
            ('csv', 'par', 'conversão'),
            ('par', 'gl', 'partições a registrar'),
            ('gl', 'at', 'plano com poda de partição'),
            ('lim', 'at', 'recusa acima do teto'),
            ('at', 'cost', 'dado varrido por consulta', 'dashed'),
            ('csv', 'cost', 'linha de base', 'dashed'),
        ],
        passos=[
            ('Colunar lê só as colunas pedidas',
             'Consulta que usa 3 de 60 colunas lê 5% do dado. Em CSV, lê 100% — e essa '
             'diferença é a maior alavanca desta arquitetura.',
             ['par'], [('csv', 'par')]),
            ('Partição elimina arquivo inteiro da leitura',
             'Filtro por mês em tabela particionada por mês não abre os outros onze. Sem '
             'partição, o filtro é aplicado depois de ler tudo.',
             ['par', 'gl'], [('par', 'gl')]),
            ('O teto por consulta é a rede de segurança',
             'Otimizar o formato reduz o custo típico; o teto impede o caso patológico. '
             'São proteções diferentes e as duas são necessárias.',
             ['lim', 'at'], [('lim', 'at')]),
            ('A partição precisa estar no catálogo',
             'Partição no caminho do arquivo sem registro no catálogo não é usada pelo '
             'planejador — e a economia não acontece.',
             ['gl'], [('gl', 'at')]),
            ('Medir custo por consulta, não total',
             'O total sobe com o uso, que é bom. Custo por consulta caindo é o que mostra '
             'que a otimização funcionou.',
             ['cost'], [('at', 'cost'), ('csv', 'cost')]),
        ],
        legenda='O custo de consulta gerada é dominado pelo dado varrido, e o dado varrido '
                'é decidido no formato e no particionamento — antes de qualquer prompt. É a '
                'otimização de maior retorno em BI conversacional.',
    ),
    Sol(
        n=54,
        titulo='54. Qualidade de dado que quebra o relatório',
        titulo_diagrama='Testar só no fim descobre o problema depois de propagado',
        problema='O relatório do diretor mostrou receita 30% menor, e a causa foi uma '
                 'carga parcial três etapas antes. Entre a origem do defeito e a '
                 'descoberta houve quatro transformações — e todas rodaram '
                 'silenciosamente sobre dado errado.',
        checagem=('volume', 'unicidade', 'nulo', 'integridade'),
        grupos=[
            ('Camadas', 'plain', [
                ('bz', 'bronze', 'Bruto', 'como chegou'),
                ('sv', 'prata', 'Tratado', 'tipado e deduplicado'),
                ('ou', 'ouro', 'Consumo', 'agregado para relatório'),
            ]),
            ('Testes na fronteira', 'plain', [
                ('t1', 'eval', 'Volume e frescor', 'carga parcial é o defeito mais comum'),
                ('t2', 'eval', 'Unicidade e nulo', 'chave duplicada quebra o agregado'),
                ('t3', 'eval', 'Integridade referencial', 'órfão não vira zero, vira erro'),
            ]),
            ('Reação', 'plain', [
                ('par', 'alerta', 'Interrupção do pipeline', 'melhor não atualizar que atualizar errado'),
            ]),
        ],
        arestas=[
            ('bz', 't1', 'antes de tratar'),
            ('t1', 'sv', 'passou'),
            ('sv', 't2', 'antes de agregar'),
            ('t2', 'ou', 'passou'),
            ('ou', 't3', 'antes de publicar'),
            ('t1', 'par', 'falhou'),
            ('t2', 'par', 'falhou'),
            ('t3', 'par', 'falhou'),
        ],
        passos=[
            ('Teste na fronteira de cada etapa',
             'É o que limita a distância entre causa e sintoma a uma transformação. Teste '
             'só no fim transforma investigação de minutos em investigação de dias.',
             ['t1', 't2', 't3'], [('bz', 't1'), ('sv', 't2'), ('ou', 't3')]),
            ('Volume é o teste que pega carga parcial',
             'É o defeito mais comum e o mais silencioso: o pipeline conclui com sucesso '
             'sobre metade do dado. Comparar com a série histórica pega isso.',
             ['t1'], [('bz', 't1')]),
            ('Interromper é melhor que propagar',
             'Relatório desatualizado é um problema conhecido. Relatório atualizado com '
             'dado errado é um problema que ninguém vê — e alguém decide com base nele.',
             ['par'], [('t1', 'par'), ('t2', 'par')]),
            ('Chave duplicada é o que estraga agregado',
             'Soma dobra sem quebrar nada. Teste de unicidade na camada tratada é barato e '
             'pega o caso que mais gera reunião.',
             ['t2'], [('sv', 't2')]),
            ('Órfão precisa falhar, não virar zero',
             'Junção que não encontra o par produz nulo, que soma como zero. Verificar '
             'integridade transforma isso em erro visível.',
             ['t3'], [('ou', 't3')]),
        ],
        legenda='Teste na fronteira de cada camada mantém a distância entre defeito e '
                'sintoma em uma transformação. E interromper é a decisão certa: dado '
                'desatualizado é problema conhecido, dado errado atualizado é decisão '
                'tomada errado.',
    ),
    Sol(
        n=55,
        titulo='55. Enriquecimento de acervo existente com classificação',
        titulo_diagrama='Lote custa cerca de metade e entrega em janela de horas',
        problema='Há dois milhões de registros históricos sem categoria, e categorizar '
                 'melhora busca, relatório e recomendação. Ninguém está esperando por '
                 'nenhum registro específico — e essa única característica muda o custo '
                 'do projeto pela metade.',
        checagem=('Batch', 'Step Functions', 'lote', 'Athena'),
        grupos=[
            ('Origem', 'plain', [
                ('s3', 's3', 'S3 — acervo', '2 milhões de registros'),
                ('sf', 'stepfunctions', 'Step Functions', 'divide, retoma, controla erro'),
            ]),
            ('Processamento', 'vpc', [
                ('bt', 'batch', 'Batch', 'paralelismo controlado'),
                ('lote', 'lote', 'Bedrock em lote', 'metade do preço, janela de horas'),
            ]),
            ('Consumo', 'plain', [
                ('out', 's3', 'S3 — enriquecido', 'Parquet particionado'),
                ('gl', 'glue', 'Catálogo', 'registra as partições do resultado'),
                ('at', 'athena', 'Athena', 'consulta o resultado'),
            ]),
        ],
        arestas=[
            ('s3', 'sf', 'dois milhões de registros'),
            ('sf', 'bt', 'divide em fatias'),
            ('bt', 'lote', 'fatias em paralelo'),
            ('lote', 'out', 'classificação + versão do modelo'),
            ('out', 'gl', 'partições novas'),
            ('gl', 'at', 'esquema para consultar'),
            ('sf', 'sf', 'retoma da fatia que falhou'),
        ],
        passos=[
            ('Ausência de usuário na frente é o requisito que libera o lote',
             'Não é otimização: é reconhecer que a latência não é requisito. Sob demanda '
             'aqui seria pagar o dobro por urgência inexistente.',
             ['lote'], [('bt', 'lote')]),
            ('Dividir em fatias com retomada',
             'Um trabalho de dois milhões vai falhar no meio. Sem fatia e sem marca de '
             'progresso, a falha custa o trabalho inteiro.',
             ['sf'], [('sf', 'bt'), ('sf', 'sf')]),
            ('Paralelismo controlado, não máximo',
             'Empurrar o máximo esbarra na cota do modelo e derruba tudo. O paralelismo é '
             'calibrado pela cota, não pela vontade.',
             ['bt'], [('bt', 'lote')]),
            ('Saída em formato consultável',
             'Enriquecer e gravar JSON solto obriga um segundo projeto para usar. Parquet '
             'particionado com catálogo é consultável no mesmo dia.',
             ['out', 'gl'], [('lote', 'out'), ('out', 'gl')]),
            ('Reprocessar é parte do plano',
             'O modelo melhora e a taxonomia muda. Guardar a versão que classificou cada '
             'registro é o que permite reprocessar só o necessário.',
             ['at', 'out'], [('gl', 'at')]),
        ],
        legenda='Onde ninguém espera, o lote é a escolha correta — cerca de metade do preço '
                'com entrega em horas. O trabalho de engenharia é fatiar com retomada e '
                'calibrar o paralelismo pela cota do modelo.',
    ),
    Sol(
        n=56,
        titulo='56. Detecção de anomalia em série temporal',
        titulo_diagrama='Previsão é tarefa tabular; o modelo de linguagem entra na explicação',
        problema='Alguém sugeriu usar o modelo de linguagem para prever a série e apontar '
                 'anomalia. Ele produz números plausíveis e erra sistematicamente, porque '
                 'previsão numérica não é a tarefa dele — e o intervalo de confiança, que '
                 'é o que importa, ele não produz.',
        checagem=('ML clássico', 'explicar o desvio'),
        grupos=[
            ('Cálculo', 'plain', [
                ('ts', 'kinesis', 'Série temporal', 'métrica por minuto'),
                ('ml', 'sagemaker', 'Modelo de previsão', 'valor esperado + intervalo'),
                ('det', 'metrica', 'Detector', 'fora do intervalo = anomalia'),
            ]),
            ('Explicação', 'plain', [
                ('cl', 'claude', 'Claude', 'por que desviou, em linguagem'),
                ('ctx', 'contexto', 'Contexto do desvio', 'implantação, feriado, campanha'),
            ]),
            ('Saída', 'plain', [
                ('al', 'alerta', 'Alerta acionável', 'o quê, quanto e a hipótese'),
            ]),
        ],
        arestas=[
            ('ts', 'ml', 'métrica por minuto'),
            ('ml', 'det', 'esperado vs. observado'),
            ('det', 'cl', 'anomalia detectada'),
            ('ctx', 'cl', 'o que aconteceu por volta'),
            ('cl', 'al', 'desvio + hipótese'),
        ],
        passos=[
            ('Cada modelo na tarefa dele',
             'O tabular prevê e entrega intervalo de confiança. O de linguagem não entrega '
             'intervalo — e sem intervalo não existe critério objetivo de anomalia.',
             ['ml', 'det'], [('ts', 'ml'), ('ml', 'det')]),
            ('A detecção é aritmética, não julgamento',
             'Fora do intervalo é anomalia. Determinístico, reproduzível e auditável — três '
             'propriedades que a geração não oferece.',
             ['det'], [('ml', 'det')]),
            ('A explicação é onde o modelo de linguagem ganha',
             'Juntar implantação, campanha e feriado com o desvio produz a hipótese que o '
             'plantonista usaria dez minutos para montar.',
             ['cl', 'ctx'], [('det', 'cl'), ('ctx', 'cl')]),
            ('Hipótese é hipótese, e precisa ser dita como tal',
             'A explicação não é diagnóstico. Apresentá-la como causa confirmada faz o '
             'plantonista parar de investigar no lugar errado.',
             ['al'], [('cl', 'al')]),
            ('Alerta com número e hipótese',
             '"Vendas 22% abaixo do esperado; houve implantação às 14h02" é acionável. '
             '"Anomalia detectada" gera uma investigação do zero.',
             ['al', 'det'], [('cl', 'al')]),
        ],
        legenda='Previsão e detecção são tarefas de modelo tabular, com intervalo de '
                'confiança; o modelo de linguagem entra na explicação do desvio. Trocar os '
                'papéis produz previsão ruim sem critério objetivo de anomalia.',
    ),
    Sol(
        n=57,
        titulo='57. Catálogo de dado sem descrição utilizável',
        titulo_diagrama='Metadado gerado sem revisão propaga erro para toda consulta que confia nele',
        problema='São 4.000 colunas sem descrição, e é por isso que o BI conversacional '
                 'gera consulta errada. Gerar as descrições automaticamente resolve a '
                 'escala — e cria um risco novo: descrição errada é pior que descrição '
                 'ausente, porque ninguém desconfia dela.',
        checagem=('descrição de coluna', 'amostra', 'aprovação humana'),
        grupos=[
            ('Evidência', 'plain', [
                ('am', 'dataset', 'Amostra de valores', 'e estatística por coluna'),
                ('lin', 'graph', 'Linhagem', 'de onde a coluna vem'),
            ]),
            ('Geração', 'plain', [
                ('cl', 'claude', 'Claude', 'propõe descrição com a evidência'),
                ('cnf', 'metrica', 'Confiança declarada', 'coluna óbvia vs. sigla opaca'),
            ]),
            ('Aprovação', 'plain', [
                ('don', 'user', 'Dono do domínio', 'aprova, corrige ou rejeita'),
                ('gl', 'glue', 'Catálogo', 'só descrição aprovada'),
            ]),
        ],
        arestas=[
            ('am', 'cl', 'valores de exemplo'),
            ('lin', 'cl', 'origem da coluna'),
            ('cl', 'cnf', 'descrição + confiança'),
            ('cnf', 'don', 'baixa confiança primeiro'),
            ('don', 'gl', 'aprovado'),
            ('cl', 'gl', 'nunca direto', 'dashed'),
        ],
        passos=[
            ('Evidência antes de geração',
             'Amostra de valores, cardinalidade e linhagem. Sem isso, a descrição sai do '
             'nome da coluna — que é exatamente a informação insuficiente que originou o '
             'problema.',
             ['am', 'lin'], [('am', 'cl'), ('lin', 'cl')]),
            ('Descrição aprovada, nunca publicada direto',
             'Metadado errado se propaga para toda consulta gerada e para todo relatório '
             'construído sobre ela. É erro que se multiplica silenciosamente.',
             ['don', 'gl'], [('don', 'gl')]),
            ('Ordenar a fila pela confiança',
             'As colunas óbvias podem ser aprovadas em lote; as siglas opacas precisam de '
             'atenção. Ordenar por confiança concentra o tempo humano onde ele rende.',
             ['cnf'], [('cl', 'cnf'), ('cnf', 'don')]),
            ('O dono do domínio é quem sabe',
             'Descrição de coluna financeira aprovada por engenheiro de dados vira '
             'suposição oficializada. Roteie por domínio.',
             ['don'], [('cnf', 'don')]),
            ('Aprovação em lote com amostragem para o óbvio',
             'Exigir revisão individual de 4.000 colunas garante que o projeto não termine. '
             'Lote com amostragem é o que faz caber.',
             ['gl', 'don'], [('don', 'gl')]),
        ],
        legenda='Descrição de coluna é insumo de toda consulta gerada, e por isso metadado '
                'errado se multiplica. Gerar com evidência resolve a escala; aprovação pelo '
                'dono do domínio é o que impede oficializar suposição.',
    ),
    Sol(
        n=58,
        titulo='58. Mudança de esquema que quebra o consumidor',
        titulo_diagrama='Viagem no tempo é o recurso que mais salva em incidente de pipeline',
        problema='Alguém acrescentou uma coluna e renomeou outra, e sete painéis pararam '
                 'de funcionar às 8h de segunda. Pior: a carga já sobrescreveu a versão '
                 'anterior, e não há como comparar com o que existia antes.',
        checagem=('esquema', 'histórico'),
        grupos=[
            ('Tabela com histórico', 'plain', [
                ('ice', 'iceberg', 'Formato de tabela aberto', 'versão por escrita'),
                ('s3', 's3', 'S3', 'arquivos + metadado de versão'),
            ]),
            ('Evolução controlada', 'plain', [
                ('evo', 'politica', 'Regras de evolução', 'acrescentar sim, renomear com apelido'),
                ('con', 'catalogo', 'Contrato de dado', 'o que o consumidor pode esperar'),
            ]),
            ('Recuperação', 'plain', [
                ('tt', 'relogio', 'Consulta na versão anterior', 'compara antes e depois'),
                ('rb', 'checkpoint', 'Reversão de versão', 'volta o ponteiro'),
            ]),
        ],
        arestas=[
            ('ice', 's3', 'arquivos + metadado de versão'),
            ('evo', 'ice', 'valida a mudança'),
            ('con', 'evo', 'o que o consumidor espera'),
            ('ice', 'tt', 'qualquer versão'),
            ('tt', 'rb', 'se a nova está errada'),
            ('rb', 'ice', 'ponteiro anterior'),
        ],
        passos=[
            ('Acrescentar é seguro; renomear e apagar não são',
             'Coluna nova não quebra consumidor que não a conhece. Renomear quebra todos. '
             'A regra de evolução é essa assimetria escrita.',
             ['evo'], [('evo', 'ice')]),
            ('Contrato de dado é o que torna a regra exigível',
             'Sem declarar o que o consumidor pode esperar, toda mudança é negociação. Com '
             'contrato, a validação é automática.',
             ['con'], [('con', 'evo')]),
            ('Viagem no tempo responde "o que mudou?"',
             'Comparar a versão de hoje com a de ontem localiza a mudança em minutos. Sem '
             'histórico, a investigação começa por reconstruir o passado.',
             ['tt'], [('ice', 'tt')]),
            ('Reverter é mudar ponteiro, não recarregar',
             'A reversão é imediata e não depende de a origem ainda ter o dado. É o que '
             'transforma incidente de horas em incidente de minutos.',
             ['rb'], [('tt', 'rb'), ('rb', 'ice')]),
            ('O histórico tem custo, e ele é escolhido',
             'Guardar versões custa armazenamento. A política de expiração é decisão '
             'explícita — e ela precisa cobrir a janela de investigação típica.',
             ['s3', 'ice'], [('ice', 's3')]),
        ],
        legenda='Formato de tabela com histórico transforma incidente de pipeline de horas '
                'em minutos: comparar versões localiza a mudança e reverter é mover um '
                'ponteiro. A regra de evolução é a assimetria entre acrescentar e renomear.',
    ),
    Sol(
        n=59,
        titulo='59. Captura de mudança do operacional para o analítico',
        titulo_diagrama='A retenção do registro é o risco: consumidor parado exige recarga completa',
        problema='O analítico precisa refletir o operacional em minutos, e consultar a '
                 'tabela inteira a cada ciclo pressiona o banco de produção. A captura de '
                 'mudança resolve isso — e introduz um risco novo, que quase ninguém '
                 'dimensiona no desenho.',
        checagem=('registro de transações', 'captura', 'defasagem'),
        grupos=[
            ('Origem', 'vpc', [
                ('db', 'postgres', 'Banco operacional', 'a carga dele não pode subir por causa do analítico'),
                ('wal', 'cdc', 'Registro de transações', 'retenção limitada — o risco'),
            ]),
            ('Transporte', 'vpc', [
                ('cap', 'kinesis', 'Captura', 'lê o registro, não a tabela'),
                ('fila', 'kafka', 'Fila durável', 'desacopla produtor de consumidor'),
            ]),
            ('Destino', 'plain', [
                ('lake', 's3', 'Analítico', 'aplica inserção, alteração e exclusão'),
                ('lag', 'metrica', 'Defasagem', 'o alarme que importa'),
            ]),
        ],
        arestas=[
            ('db', 'wal', 'transações confirmadas'),
            ('wal', 'cap', 'lê o registro, não a tabela'),
            ('cap', 'fila', 'eventos de mudança'),
            ('fila', 'lake', 'inserção, alteração e exclusão'),
            ('cap', 'lag', 'atraso em segundos', 'dashed'),
            ('lag', 'wal', 'se passar da retenção: recarga', 'dashed'),
        ],
        passos=[
            ('Ler o registro, não a tabela',
             'A captura não consulta a tabela: ela lê o registro de transações. É o que '
             'elimina a pressão no banco operacional.',
             ['wal', 'cap'], [('db', 'wal'), ('wal', 'cap')]),
            ('A retenção do registro é o teto de tolerância a falha',
             'Se o consumidor ficar parado além da retenção, o registro necessário foi '
             'descartado — e a única saída é recarga completa. Esse número precisa ser '
             'conhecido.',
             ['wal', 'lag'], [('lag', 'wal')]),
            ('Defasagem é o alarme, não erro',
             'A captura pode parar sem lançar exceção. O sintoma é a defasagem crescendo, e '
             'o alarme precisa ser sobre ela.',
             ['lag'], [('cap', 'lag')]),
            ('A fila durável desacopla os ritmos',
             'O destino pode ficar indisponível sem que a captura pare. Sem fila, uma '
             'manutenção no analítico consome a retenção do registro.',
             ['fila'], [('cap', 'fila'), ('fila', 'lake')]),
            ('Exclusão também é evento',
             'Pipeline que só aplica inserção e alteração deixa registro apagado vivo no '
             'analítico. É a divergência mais difícil de descobrir depois.',
             ['lake'], [('fila', 'lake')]),
        ],
        legenda='Captura de mudança tira a pressão do banco operacional e coloca um risco '
                'novo: a retenção do registro é o tempo máximo que o consumidor pode ficar '
                'parado. Passar disso significa recarga completa.',
    ),
    Sol(
        n=60,
        titulo='60. Dado sensível no acervo analítico',
        titulo_diagrama='O que não entra no acervo não vaza por consulta nenhuma',
        problema='O acervo analítico recebeu uma tabela com CPF e endereço, e a partir '
                 'daí toda consulta gerada, todo painel e todo exportação passaram a ser '
                 'um risco. Controlar quem consulta é tratamento; o problema estava na '
                 'ingestão.',
        checagem=('Macie', 'mascaramento', 'nível de coluna'),
        grupos=[
            ('Descoberta', 'plain', [
                ('mc', 'macie', 'Macie', 'acha dado pessoal no que já entrou'),
                ('cls', 'catalogo', 'Classificação', 'coluna marcada como sensível'),
            ]),
            ('Fronteira de ingestão', 'vpc', [
                ('msk', 'lambda', 'Mascaramento', 'antes de gravar, não depois'),
                ('tok', 'kms', 'Pseudonimização', 'junção preservada sem o dado'),
            ]),
            ('Consumo', 'plain', [
                ('lf', 'lakeformation', 'Permissão por coluna', 'quem pode ver o original'),
                ('at', 'athena', 'Consulta', 'vê o mascarado por padrão'),
            ]),
        ],
        arestas=[
            ('mc', 'cls', 'onde há dado pessoal'),
            ('cls', 'msk', 'o que mascarar'),
            ('msk', 'tok', 'quando precisa juntar'),
            ('msk', 'lf', 'coluna mascarada e original'),
            ('lf', 'at', 'por papel'),
            ('mc', 'lf', 'audita o que escapou', 'dashed'),
        ],
        passos=[
            ('Mascarar na ingestão, não na consulta',
             'O que não entra não vaza — por consulta, por exportação, por registro nem por '
             'cache. Filtrar na leitura deixa o dado presente em todos esses lugares.',
             ['msk'], [('cls', 'msk')]),
            ('Pseudonimizar preserva a junção',
             'A análise geralmente precisa juntar por pessoa, não saber quem é a pessoa. '
             'Identificador estável e irreversível atende os dois requisitos.',
             ['tok'], [('msk', 'tok')]),
            ('A descoberta é contínua',
             'Fonte nova entra toda semana e traz campo que ninguém declarou. Varredura '
             'periódica é o que mantém a classificação viva.',
             ['mc', 'cls'], [('mc', 'cls'), ('mc', 'lf')]),
            ('Permissão por coluna para a exceção legítima',
             'Alguns papéis precisam do original. Permissão em nível de coluna atende sem '
             'duplicar a tabela em duas versões.',
             ['lf'], [('lf', 'at')]),
            ('O padrão é o mascarado',
             'Quem consulta sem papel específico vê a versão sem dado pessoal. Padrão '
             'seguro é o que faz o esquecimento não custar caro.',
             ['at'], [('lf', 'at')]),
        ],
        legenda='Dado pessoal se resolve na fronteira de ingestão: o que não entra não vaza '
                'por consulta, exportação, registro nem cache. Permissão por coluna atende '
                'a exceção legítima sem duplicar a tabela.',
    ),
]

PERGUNTAS = [
    ('Como fazer texto-para-SQL funcionar de verdade em produção?',
     'A parte que decide o resultado é o catálogo, não o prompt: descrição por coluna, '
     'valor de domínio explicado e glossário de negócio no contexto. Uma coluna chamada '
     '`tipo_rec` sem descrição gera consulta plausível e errada, porque o modelo não tem '
     'como saber que o valor 2 significa receita recorrente. Do lado da execução, a '
     'contenção é obrigatória: réplica ou grupo de trabalho isolado, lista de tabelas '
     'permitidas, partição exigida na cláusula e teto de dado varrido por consulta.'),
    ('Como reduzir o custo de um BI conversacional na AWS?',
     'Atacando o dado varrido, que domina a fatura: formato colunar com particionamento '
     'corta a leitura em ordem de magnitude, porque uma consulta que usa 3 de 60 colunas '
     'passa a ler uma fração do arquivo em vez de tudo. Exigir filtro de partição na '
     'consulta gerada e impor teto de varredura por consulta cobre o caso patológico. A '
     'métrica a acompanhar é custo por consulta, não custo total — o total sobe com a '
     'adoção, que é o resultado desejado.'),
    ('Devo usar um modelo de linguagem para detectar anomalia em série temporal?',
     'Não para o cálculo: previsão e detecção são tarefas de modelo tabular, que entrega '
     'valor esperado com intervalo de confiança. Sem intervalo não existe critério objetivo '
     'de anomalia, e é justamente isso que o modelo de linguagem não produz. O papel dele é '
     'a explicação: cruzar o desvio com implantações, campanhas e feriados para propor a '
     'hipótese que o plantonista levaria dez minutos montando — apresentada como hipótese, '
     'não como causa confirmada.'),
]

QUIZZES = [
    quiz('O BI conversacional gera consultas erradas sobre uma tabela financeira. Qual '
         'investimento rende mais?',
         ['Trocar por um modelo maior, com mais capacidade de raciocínio',
          'Descrever as colunas e os valores de domínio no catálogo de dados',
          'Aumentar o número de exemplos de consulta no prompt',
          'Reescrever as tabelas com nomes de coluna mais longos'],
         1,
         'O modelo erra porque não sabe o que a coluna significa nem o que cada valor '
         'codifica — é informação ausente, não falta de capacidade. Modelo maior adivinha '
         'com mais fluência sobre a mesma ausência. Exemplos ajudam a forma da consulta e '
         'não ensinam que `tipo_rec = 2` é receita recorrente. Renomear colunas é caro, '
         'quebra consumidores existentes e ainda não cobre valor de domínio nem definição '
         'de negócio, que é onde os erros se concentram.'),
    quiz('Um pipeline de dados de quatro etapas produziu relatório errado. Onde os testes '
         'de qualidade devem ficar?',
         ['Na camada final, comparando o relatório com o número esperado',
          'Na fronteira de cada etapa, para a distância entre causa e sintoma ser de uma transformação',
          'Na origem apenas, porque é onde o dado entra',
          'Num trabalho diário separado que verifica todas as tabelas'],
         1,
         'Teste na fronteira de cada etapa limita a investigação a uma transformação; testar '
         'só no fim significa descobrir o problema depois de ele ter atravessado quatro '
         'transformações, e a busca pela causa passa a ser de dias. Testar só na origem não '
         'pega defeito introduzido por transformação. E verificação diária separada é '
         'detecção tardia: o dado errado já foi consumido e alguém já decidiu com base '
         'nele.'),
    quiz('Uma captura de mudança (CDC) ficou parada por 36 horas durante uma manutenção. '
         'Qual é o risco principal?',
         ['A fila durável descartar as mensagens mais antigas por limite de tamanho',
          'O registro de transações da origem ter descartado o que a captura ainda não leu, exigindo recarga completa',
          'O destino analítico ter divergido por ordenação fora de sequência',
          'O banco operacional ter ficado mais lento durante a parada'],
         1,
         'A retenção do registro de transações é o teto real de tolerância a parada: passado '
         'esse tempo, o que faltava ler foi descartado na origem e a única saída é recarga '
         'completa. A fila durável costuma ter retenção configurável e é justamente o que '
         'protege o trecho seguinte. Divergência por ordenação é um problema de aplicação, '
         'não de parada. E o banco operacional fica menos pressionado com a captura parada, '
         'não mais.'),
]
