#!/usr/bin/env python3
"""Gera o seed do módulo `aws-ia-100-solucoes` a partir do catálogo.

O catálogo em `docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md` é a fonte: o módulo é
derivado dele, e não o contrário. Assim as duas peças não divergem — e o gerador
falha se o catálogo mudar de forma.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from diaghelper import diagrama  # noqa

REPO = pathlib.Path(__file__).resolve().parents[2]
CAT = REPO / 'docs' / 'seo' / 'CATALOGO_100_SOLUCOES_AWS_IA.md'
SEED = REPO / 'scripts' / 'seeds' / 'articles' / 'aws-ia-100-solucoes.json'

# ─── Lê o catálogo ───────────────────────────────────────────────────────────
texto = CAT.read_text(encoding='utf-8')
grupos: list[tuple[str, list[list[str]]]] = []
for m in re.finditer(r'^## \d+\. (.+?)\n\n\| # \|.*?\n\|[-| ]+\|\n((?:\|.*\n)+)', texto, re.M):
    titulo = m.group(1).strip()
    linhas = []
    for ln in m.group(2).strip().split('\n'):
        cols = [c.strip() for c in ln.strip().strip('|').split(' | ')]
        if len(cols) == 5:
            linhas.append(cols)
    grupos.append((titulo, linhas))

total = sum(len(l) for _, l in grupos)
if total != 100 or len(grupos) != 10:
    raise SystemExit(f'catálogo mudou de forma: {len(grupos)} grupos, {total} soluções')

origens = {'C': 0, 'A': 0, 'P': 0}
for _, linhas in grupos:
    for l in linhas:
        origens[re.sub(r'[^CAP]', '', l[4])[:1]] += 1
print(f'catálogo lido: {len(grupos)} grupos · {total} soluções · {origens}')


def p(txt):
    """`paragraph.content` é ARRAY de nós de texto rico, não string.

    O Zod recusa string e o bloco desaparece em silêncio — foi o primeiro erro
    deste gerador. `**negrito**` no texto vira nó com `bold: true`.
    """
    nos = []
    for i, parte in enumerate(txt.split('**')):
        if not parte:
            continue
        no = {'text': parte}
        if i % 2 == 1:
            no['bold'] = True
        nos.append(no)
    return {'type': 'paragraph', 'data': {'content': nos or [{'text': txt}]}}


def sec(titulo, filhos):
    return {'type': 'section', 'data': {'title': titulo}, 'children': filhos}


def callout(variante, titulo, txt):
    return {'type': 'callout', 'data': {'variant': variante, 'title': titulo, 'content': txt}}


def tabela(colunas, linhas):
    return {'type': 'comparison_table', 'data': {'columns': colunas, 'rows': linhas}}


def quiz(q, opcoes, correta, expl):
    return {'type': 'quiz', 'data': {'question': q, 'options': opcoes,
                                     'correctIndex': correta, 'explanation': expl}}


def qa(q, a):
    return {'type': 'qa_item', 'data': {'question': q, 'answer': a}}


blocos: list[dict] = []

# ─── Abertura ────────────────────────────────────────────────────────────────
blocos.append(sec('Cem soluções, e a decisão que cada uma ensina', [
    p('Este módulo é um catálogo de cem problemas reais resolvidos com IA na AWS — '
      'com a arquitetura que os resolve e, principalmente, a decisão que cada um '
      'ensina. A arquitetura envelhece quando o serviço muda de nome; a decisão, não.'),
    p(f'A distribuição por origem da informação é a parte honesta do catálogo: '
      f'**{origens["C"]} casos públicos documentados** com fonte citada, '
      f'**{origens["A"]} arquiteturas de referência publicadas pela AWS** '
      f'(Solutions Library, Prescriptive Guidance, Well-Architected e blog oficial) e '
      f'**{origens["P"]} padrões compostos** — a topologia que se repete nas duas '
      f'primeiras, sem um cliente nomeado.'),
    callout('warning', 'A armadilha de catálogo de solução',
            'Copiar a topologia sem a decisão. Uma arquitetura de RAG desenhada sem '
            'entender que **a qualidade é decidida na recuperação** produz um sistema '
            'que parece o diagrama e responde errado. É por isso que a coluna "o que '
            'ensina" existe em cada uma das cem linhas — e é a única que vale decorar.'),
    callout('info', 'Sobre os números percentuais',
            'Todo ganho citado é o que a fonte publicou, medido contra a linha de base '
            'daquela empresa — que você não conhece. Percentual é o dado MENOS '
            'transferível de um caso. A arquitetura e a decisão são os transferíveis.'),
]))

# ─── Os cinco arquétipos, com diagramas ──────────────────────────────────────
blocos.append(sec('Os cinco arquétipos que cobrem quase tudo', [
    p('Antes das cem linhas: as cem soluções se reduzem a cinco topologias. '
      'Reconhecer em qual delas o seu caso cai economiza semanas de arquitetura '
      'original — e a maior parte dos projetos que travam estava reinventando uma '
      'destas cinco.'),
    tabela(['Arquétipo', 'Quando', 'Serviços no eixo', 'O que decide o resultado'], [
        ['RAG sem servidor', 'Perguntar sobre documento que a empresa já tem',
         'API Gateway · Lambda · Knowledge Bases · Bedrock · Guardrails',
         'A recuperação, não a geração'],
        ['Extração por evento (IDP)', 'Dado estruturado preso em PDF ou imagem',
         'S3 · EventBridge · Bedrock Data Automation · Bedrock · A2I · DynamoDB',
         'Extração determinística primeiro; limiar de confiança por campo'],
        ['Agente com ferramentas', 'A tarefa exige agir, não só responder',
         'AgentCore · Lambda como adaptador · RDS/ERP · Guardrails · X-Ray',
         'Quem executa é o seu código; o teto de voltas também'],
        ['Copiloto interno', 'Conhecimento da casa, usuário é colega',
         'IDE/Slack · Lambda · Knowledge Bases · Bedrock · Identity Center',
         'Permissão da fonte — é o que impede resposta vazar entre times'],
        ['Enriquecimento em lote', 'Classificar ou resumir acervo, sem ninguém esperando',
         'S3 · Step Functions/Batch · Bedrock em lote · Glue/Athena',
         'Custa cerca de metade e entrega em janela de horas'],
    ]),
    diagrama(
        'Arquétipo 1 — RAG sem servidor sobre acervo interno',
        [('Canal', 'plain', [('u', 'user', 'Usuário', None),
                             ('api', 'apigateway', 'API Gateway', 'autenticação e limite de taxa')]),
         # `vpc` só onde há recurso que MORA numa subrede — Lambda anexada, aqui.
         # O selo roxo afirma isolamento de rede, e usá-lo como agrupamento visual
         # sobre serviço regional (Bedrock, Knowledge Bases, S3) ensina errado
         # justamente a distinção que a prova cobra. Ver `arq100/comum.py`.
         ('Aplicação', 'vpc', [('fn', 'lambda', 'Lambda', 'monta o contexto')]),
         ('Recuperação', 'plain', [('kb', 'knowledgebases', 'Knowledge Bases', 'corte, embedding e índice gerenciados'),
                                 ('idx', 'opensearch', 'Índice vetorial', 'híbrido com filtro por metadado')]),
         ('Modelo', 'plain', [('br', 'bedrock', 'Bedrock', None),
                              ('cl', 'claude', 'Claude', 'responde citando a fonte'),
                              ('gr', 'guardrails', 'Guardrails', 'entrada e saída')]),
         ('Operação', 'plain', [('cw', 'cloudwatch', 'CloudWatch', 'tokens por requisição'),
                                ('xr', 'xray', 'X-Ray', 'rastro por chamada')])],
        [('u', 'api', None), ('api', 'fn', None), ('fn', 'kb', 'consulta'),
         ('kb', 'idx', None), ('idx', 'kb', 'trechos'), ('kb', 'fn', 'contexto'),
         ('fn', 'gr', 'antes do modelo'), ('gr', 'br', None), ('br', 'cl', None),
         ('cl', 'gr', 'antes de devolver'), ('gr', 'fn', None),
         ('fn', 'cw', None), ('fn', 'xr', None)],
        [('A qualidade é decidida na recuperação',
          'Se o trecho certo não entra no contexto, nenhum ajuste de prompt salva. É por isso que corte, índice e filtro pesam mais que a instrução de geração.',
          ['kb', 'idx'], [('fn', 'kb'), ('idx', 'kb')]),
         ('Filtro por metadado é permissão, não refinamento',
          'Buscar só nos documentos que aquele usuário pode ver é requisito. Índice único sem filtro é como dado restrito fica respondível por quem não deveria vê-lo.',
          ['idx'], [('kb', 'idx')]),
         ('Guardrails nas duas direções',
          'Na entrada corta pedido fora do escopo e registra a tentativa; na saída impede conteúdo indevido e vazamento. Só numa direção deixa metade do risco.',
          ['gr'], [('fn', 'gr'), ('cl', 'gr')]),
         ('Citação transforma alucinação em erro detectável',
          'Se o trecho citado não existe ou não sustenta a afirmação, você detecta sem julgamento humano. Sem citação, a verificação depende de alguém que conheça o acervo.',
          ['cl'], [('br', 'cl')]),
         ('Tokens por requisição é métrica de produto',
          'Ao lado de latência e erro. Sem ela, o custo de IA é um número no fim do mês que ninguém sabe explicar nem reduzir.',
          ['cw', 'xr'], [('fn', 'cw'), ('fn', 'xr')])],
        legenda='Cinco camadas e uma conclusão: o que decide o resultado está na recuperação e na permissão, não no modelo. Trocar de modelo num RAG com recuperação ruim melhora a fluência do erro.'),
    diagrama(
        'Arquétipo 2 — Extração de documento orientada a evento (IDP)',
        [('Chegada', 'plain', [('s3', 's3', 'S3 de entrada', 'evento por objeto novo'),
                               ('eb', 'eventbridge', 'EventBridge', 'roteia por tipo')]),
         ('Extração determinística', 'vpc', [('fn', 'lambda', 'Lambda', 'orquestra a etapa'),
                                             ('bda', 'dataautomation', 'Data Automation', 'documento, imagem, vídeo'),
                                             ('tx', 'textract', 'Textract', 'OCR e formulário')]),
         ('Interpretação', 'plain', [('br', 'bedrock', 'Bedrock', 'só o campo ambíguo'),
                                     ('conf', 'metrica', 'Confiança por campo', 'limiar POR campo')]),
         ('Humano no circuito', 'plain', [('a2i', 'a2i', 'Revisão humana', 'quando a confiança cai')]),
         ('Destino', 'plain', [('ddb', 'dynamodb', 'Dado estruturado', None),
                             ('ct', 'cloudtrail', 'Trilha de auditoria', 'modelo, versão, entrada, saída')])],
        [('s3', 'eb', None), ('eb', 'fn', None), ('fn', 'bda', None), ('fn', 'tx', None),
         ('bda', 'br', 'campo que exige julgamento'), ('tx', 'br', None),
         ('br', 'conf', None), ('conf', 'a2i', 'abaixo do limiar', 'dashed'),
         ('conf', 'ddb', 'acima do limiar'), ('a2i', 'ddb', 'corrigido'),
         ('ddb', 'ct', None)],
        [('Evento em vez de consulta periódica',
          'O objeto novo dispara o processamento. Varrer a lista de arquivos custa, atrasa e não escala com o número de documentos.',
          ['s3', 'eb'], [('s3', 'eb')]),
         ('Extração determinística primeiro',
          'Serviço especializado é mais barato, mais rápido e reprodutível. Modelo grande lendo nota fiscal padronizada é o desperdício mais caro da área.',
          ['bda', 'tx'], [('fn', 'bda'), ('fn', 'tx')]),
         ('O modelo entra só no campo ambíguo',
          'Onde o valor exige interpretação — cláusula, descrição livre, classificação por contexto. O resto já saiu estruturado da etapa anterior.',
          ['br'], [('bda', 'br')]),
         ('Limiar de confiança POR CAMPO',
          'O campo que alimenta decisão financeira exige revisão que o campo informativo não exige. Limiar agregado inviabiliza o projeto sem reduzir risco.',
          ['conf', 'a2i'], [('br', 'conf'), ('conf', 'a2i')]),
         ('Rastro é requisito, não refinamento',
          'Auditoria não pergunta o acerto médio: pergunta como aquele número específico foi obtido. Modelo, versão, entrada e saída, gravados por extração.',
          ['ct'], [('ddb', 'ct')])],
        legenda='A ordem é a decisão: determinístico primeiro, modelo no que sobrou, humano onde a confiança cai. Inverter essa ordem multiplica o custo e introduz variabilidade onde ela é defeito.'),
    diagrama(
        'Arquétipo 4 e 5 — Copiloto interno e enriquecimento em lote',
        [('Interno', 'plain', [('ide', 'ide', 'IDE / Slack', 'usuário é colega'),
                               ('idc', 'identitycenter', 'Identity Center', 'quem pode ver o quê')]),
         ('Conhecimento da casa', 'plain', [('kb', 'knowledgebases', 'Knowledge Bases', 'código, runbook, incidente'),
                                          ('fn', 'lambda', 'Lambda', None)]),
         ('Modelo', 'plain', [('br', 'bedrock', 'Bedrock', 'resposta com citação')]),
         ('Lote — sem ninguém esperando', 'plain', [('s3', 's3', 'Acervo', None),
                                                    ('sf', 'stepfunctions', 'Step Functions', 'orquestra as etapas'),
                                                    ('lote', 'bedrock', 'Bedrock em lote', 'metade do custo, janela de horas')]),
         ('Consumo', 'plain', [('glue', 'glue', 'Catálogo', None),
                               ('ath', 'athena', 'Consulta', None),
                               ('bud', 'budgets', 'Orçamento', 'alarme por período curto')])],
        [('ide', 'fn', None), ('idc', 'fn', 'permissão da fonte'), ('fn', 'kb', None),
         ('kb', 'br', 'trechos'), ('br', 'ide', 'resposta citando'),
         ('s3', 'sf', None), ('sf', 'lote', None), ('lote', 's3', 'resultado'),
         ('s3', 'glue', None), ('glue', 'ath', None), ('lote', 'bud', None)],
        [('O copiloto interno é o caso de melhor relação risco-retorno',
          'O usuário é colega, o material já é digitalizado e o erro não vira incidente de imagem. É o que menos aparece em apresentação e mais paga a conta.',
          ['ide', 'kb'], [('ide', 'fn')]),
         ('A permissão da fonte é o que impede vazar entre times',
          'Identidade corporativa decide quais documentos entram na recuperação daquele usuário. Índice único sem filtro responde o que não deveria.',
          ['idc'], [('idc', 'fn')]),
         ('Resposta com citação, sempre',
          'Em conhecimento interno, o leitor precisa verificar. Citação transforma alucinação em erro detectável sem depender de quem conhece o acervo.',
          ['br'], [('br', 'ide')]),
         ('O lote é para o que ninguém está esperando',
          'Classificar histórico, resumir acervo, rodar avaliação. Custa cerca de metade e entrega em janela de horas — e é a alavanca de custo mais subusada.',
          ['sf', 'lote'], [('sf', 'lote')]),
         ('Alarme sobre gasto por período curto',
          'A derivada é o sinal útil: gasto por hora fora do padrão aparece dias antes de o total estourar. Alarme só no total avisa quando não há o que fazer.',
          ['bud'], [('lote', 'bud')])],
        legenda='Os dois arquétipos que sobram compartilham a mesma lição: o valor está em quem consome. Interno tolera erro e paga rápido; lote troca latência por metade do custo, e só serve onde a latência não importa.'),
    diagrama(
        'Arquétipo 3 — Agente com ferramentas em produção',
        [('Entrada', 'plain', [('canal', 'user', 'Canal', None),
                               ('api', 'apigateway', 'API Gateway', None)]),
         ('Agente', 'plain', [('ac', 'agentcore', 'AgentCore', 'laço, memória e identidade'),
                              ('br', 'bedrock', 'Bedrock', 'decide o próximo passo'),
                              ('teto', 'firewall', 'Teto de passos e gasto', 'no seu código')]),
         ('Ferramentas', 'vpc', [('adap', 'lambda', 'Adaptador', 'valida argumento e permissão'),
                                 ('db', 'rds', 'Banco', None),
                                 ('erp', 'erp', 'Sistema legado', None)]),
         ('Contenção', 'plain', [('iam', 'iam', 'IAM por ferramenta', 'menor privilégio'),
                                 ('rede', 'waf', 'Destinos permitidos', 'fecha exfiltração')]),
         ('Operação', 'plain', [('xr', 'xray', 'Rastro por ferramenta', None)])],
        [('canal', 'api', None), ('api', 'ac', None), ('ac', 'br', None),
         ('br', 'ac', 'pedido de ferramenta'), ('ac', 'adap', None),
         ('adap', 'db', None), ('adap', 'erp', None), ('adap', 'ac', 'resultado'),
         ('iam', 'adap', 'autoriza'), ('ac', 'teto', 'conta a volta'),
         ('ac', 'rede', 'tentativa de saída'), ('ac', 'xr', None)],
        [('O modelo pede; o adaptador executa',
          'É a fronteira de segurança do agente. Tratar o pedido do modelo como autorizado é o erro mais comum — e o adaptador é onde a validação cabe.',
          ['br', 'adap'], [('br', 'ac'), ('ac', 'adap')]),
         ('Permissão por ferramenta, não por agente',
          'Leitura e escrita não têm o mesmo peso. Ferramenta genérica com parâmetro de operação impede permissionar por caso, e é o antipadrão que mais aparece.',
          ['iam'], [('iam', 'adap')]),
         ('O teto de voltas mora no código',
          '"Seja econômico" é pedido. Contador que interrompe é fato — sem ele, ferramenta que devolve vazio faz o laço girar até alguém olhar a fatura.',
          ['teto'], [('ac', 'teto')]),
         ('Fechar o destino de rede fecha a exfiltração',
          'Instrução hostil vinda de dado lido pede ao agente que coloque o contexto num argumento que sai. Lista de destinos permitidos corta o canal.',
          ['rede'], [('ac', 'rede')]),
         ('Rastro por chamada de ferramenta',
          'É o que transforma "o agente travou" em "a terceira busca devolveu vazio e ele tentou dezoito vezes". Sem isso, o incidente não é investigável.',
          ['xr'], [('ac', 'xr')])],
        legenda='O dano possível de um agente é definido pela permissão das ferramentas, não pela qualidade do prompt. Se existe ação irreversível que uma instrução hostil consiga disparar, o desenho não está pronto.'),
]))

# ─── As dez famílias ─────────────────────────────────────────────────────────
COLUNAS = ['#', 'Problema', 'Arquitetura', 'O que ensina', 'Origem']
NOTAS = {
    'Atendimento e experiência do cliente':
        'A família com mais caso público — e a que mais engana. O ganho vem de o agente '
        'consultar o ESTADO real (pedido, conta, estoque) por ferramenta; não de prompt melhor. '
        'Latência é requisito de produto aqui: modelo pequeno e rápido vence modelo grande.',
    'Documento, extração e processamento inteligente':
        'A regra que organiza a família inteira: extração especializada primeiro, modelo '
        'generativo só no campo que exige interpretação. Modelo grande lendo nota fiscal '
        'padronizada é o desperdício mais caro da área.',
    'Busca e conhecimento interno':
        'Aqui a permissão é parte da arquitetura, não configuração posterior. Índice único '
        'sem filtro por usuário é como dado restrito passa a ser respondível por quem não '
        'deveria vê-lo — e o sintoma aparece na primeira auditoria.',
    'Agentes operacionais — quando a IA precisa agir':
        'A família em que o erro custa dinheiro de verdade, porque o sistema AGE. Três coisas '
        'não são negociáveis: permissão por ferramenta, teto de voltas no código e rastro por '
        'chamada.',
    'Copiloto de engenharia e produtividade interna':
        'O arquétipo com melhor relação entre retorno e risco, e o que menos aparece em '
        'apresentação. O usuário é colega, o material já é digitalizado e o erro não vira '
        'incidente de imagem.',
    'Dados, analytics e BI conversacional':
        'Gerar SQL é a parte fácil. O que decide é limitar o que a consulta pode varrer e '
        'descrever o catálogo — o modelo não adivinha o significado de uma coluna mal nomeada.',
    'Conteúdo, mídia e personalização':
        'A família em que serviço especializado ganha do modelo generativo com mais frequência: '
        'transcrição, tradução com glossário e moderação por classificador são determinísticos '
        'e custam uma fração.',
    'Risco, fraude, seguro e conformidade':
        'Aqui o requisito raramente é acerto: é rastro. As quatro perguntas que travam projeto '
        'são onde o dado é processado, quem acessa, o que fica registrado e por quanto tempo — '
        'e nenhuma é sobre o modelo.',
    'Plataforma de IA corporativa':
        'A camada que falta em quase todo projeto que passou do segundo caso. Sem portal com '
        'cota e atribuição de custo, cada aplicação reimplementa autenticação, limite e '
        'medição — e nenhuma implementa as três.',
    'Operação, segurança e confiabilidade de IA':
        'A família que não aparece no diagrama de apresentação e decide se o sistema sobrevive. '
        'A defesa contra injeção não é detectar intenção: é limitar capacidade.',
}

for titulo, linhas in grupos:
    nota = next((v for k, v in NOTAS.items() if k in titulo), None)
    filhos = [p(nota)] if nota else []
    filhos.append(tabela(COLUNAS, linhas))
    blocos.append(sec(titulo, filhos))

# ─── O que não fazer ─────────────────────────────────────────────────────────
# ─── Ponte para as arquiteturas desenhadas ───────────────────────────────────
#
# Este módulo é o catálogo: cem linhas com problema, cadeia e decisão. A cadeia em
# texto (`A → B → C`) não mostra o que é paralelo, o que é assíncrono nem onde
# entra revisão humana — e era essa a lacuna. A trilha de arquiteturas desenha as
# cem, uma a uma, com passos percorríveis.
blocos.append(sec('As cem arquiteturas, desenhadas uma por uma', [
    p('A coluna "arquitetura" das tabelas acima é uma **cadeia em texto**, e ela tem um '
      'limite: não mostra o que roda em paralelo, o que é assíncrono, onde entra a revisão '
      'humana nem o que a camada de governança envolve. Duas soluções com a mesma cadeia '
      'podem ser desenhos bem diferentes.'),
    p('Por isso cada uma das cem soluções tem um diagrama próprio, percorrível em cinco '
      'passos, na trilha **100 Arquiteturas de IA na AWS** — dez módulos, um por família, '
      'dez arquiteturas cada:'),
    tabela(['Módulo', 'Soluções', 'A decisão que a família repete'], [
        ['Atendimento ao cliente', '1 a 10',
         'Há alguém esperando: o prazo elimina modelos antes da discussão de qualidade'],
        ['Extração de documentos', '11 a 20',
         'Extração determinística primeiro; limiar de confiança por campo'],
        ['Busca e conhecimento (RAG)', '21 a 30',
         'A qualidade é decidida na recuperação, não na geração'],
        ['Agentes que agem', '31 a 40',
         'Quem executa a ferramenta é o seu código — a fronteira é o adaptador'],
        ['Copiloto interno', '41 a 50',
         'O agente propõe, o humano publica'],
        ['Dados e BI conversacional', '51 a 60',
         'O modelo não adivinha o significado da coluna'],
        ['Conteúdo e mídia', '61 a 70',
         'Serviço especializado no determinístico, modelo no ambíguo — e lote onde ninguém espera'],
        ['Risco e conformidade', '71 a 80',
         'O escore decide, o texto justifica'],
        ['Plataforma corporativa', '81 a 90',
         'Custo é variável por uso: sem atribuição, ninguém sabe reduzir'],
        ['Operação e segurança', '91 a 100',
         'Filtro de texto não separa dado de comando — o que limita é a permissão'],
    ]),
    callout('info', 'Por que a separação existe',
            'O catálogo responde **o que existe** e é feito para ser varrido com os olhos. '
            'As arquiteturas respondem **como se desenha** e são feitas para serem '
            'percorridas passo a passo. Os diagramas são gerados a partir deste catálogo, '
            'que continua sendo a fonte do problema, da cadeia e da decisão.'),
]))

blocos.append(sec('O que este catálogo deliberadamente não faz', [
    p('Um catálogo de solução tem duas formas de enganar, e vale dizer as duas.'),
    callout('warning', 'Não promete que o número se repete',
            'Todo percentual citado é o que a fonte publicou, sobre a linha de base daquela '
            'empresa. Ganho percentual é o dado menos transferível de um caso — a arquitetura '
            'e a decisão são os transferíveis.'),
    callout('warning', 'Não cita caso que não foi confirmado na fonte',
            'O mercado brasileiro tem referências fortes de IA generativa em produção — um '
            'banco com 150 soluções no ar e assistente para centenas de milhares de clientes, '
            'outro com modelo próprio para subscrição, um terceiro com plataforma multiagente '
            'em OUTRA nuvem. Nenhum dos três aparece nas tabelas como caso de Bedrock, porque '
            'a fonte pública não confirma isso. Referência de mercado e caso de arquitetura '
            'são coisas diferentes.'),
    p('A lista completa de fontes, numerada por solução, está no catálogo de apoio em '
      '`docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md` — com o link de cada caso público, '
      'de cada guidance da AWS e de cada documento do Well-Architected citado.'),
]))

# ─── Perguntas frequentes ────────────────────────────────────────────────────
blocos.append(sec('Perguntas frequentes', [
    qa('Por onde começar quando tudo parece prioridade?',
       'Pelo caso que tem material já digitalizado, dono claro e critério de sucesso '
       'verificável. Falta de qualquer um dos três é o que trava projeto de IA — não o '
       'modelo. Caso sem dono não é validado, caso sem critério não é aprovado, e caso sem '
       'material digitalizado é projeto de dado disfarçado de projeto de IA.'),
    qa('Qual arquétipo dá retorno mais rápido?',
       'O copiloto interno. O usuário é colega, então o retorno chega em dias; o erro não '
       'vira incidente de imagem; e o material — código, documentação, histórico de '
       'incidente — já está digitalizado. É também o que menos aparece em apresentação, '
       'porque não rende foto bonita.'),
    qa('Posso copiar uma dessas arquiteturas direto?',
       'A topologia sim, a decisão não — ela precisa ser entendida. Copiar o desenho de RAG '
       'sem saber que a qualidade é decidida na recuperação produz um sistema que parece o '
       'diagrama e responde errado. É por isso que cada linha do catálogo traz a decisão ao '
       'lado da arquitetura.'),
    qa('Por que tantas soluções são padrão composto em vez de caso público?',
       'Porque empresa não publica arquitetura de tudo o que constrói, e a que publica '
       'costuma omitir o que deu errado. O padrão composto é a generalização de arquiteturas '
       'que a AWS publicou como referência — mais honesto que atribuir a um cliente uma '
       'topologia que a fonte não descreve.'),
]))

# ─── Fixando ─────────────────────────────────────────────────────────────────
blocos.append(sec('Fixando', [
    quiz('Numa arquitetura de RAG sem servidor, o que mais decide a qualidade da resposta?',
         ['O tamanho do modelo escolhido no catálogo do Bedrock',
          'A etapa de recuperação — corte, índice e filtro',
          'O tamanho da janela de contexto do modelo',
          'A instrução de sistema usada na geração'],
         1,
         'A recuperação. Se o trecho certo não entra no contexto, nenhum ajuste na geração '
         'salva — o modelo responde com o que recebeu. **Modelo maior** aumenta a fluência do '
         'erro, não o acerto. **Janela maior** permite carregar mais ruído, o que dilui a '
         'atenção e encarece cada chamada. **Instrução de sistema** ajusta forma e tom, e é a '
         'última etapa de uma fila cujo problema está no começo. É por isso que a métrica de '
         'RAG separa recuperação de geração: sem separar, todo defeito parece do modelo.'),
    quiz('Num agente que executa ações em sistemas internos, onde fica a fronteira de segurança?',
         ['No prompt, instruindo o modelo a não fazer ações perigosas',
          'No Guardrails, filtrando a saída do modelo',
          'No adaptador que executa a ferramenta, com validação e permissão',
          'No modelo escolhido, preferindo o mais alinhado'],
         2,
         'No adaptador. O modelo apenas PEDE a execução com argumentos; quem executa é o seu '
         'código, e é ali que cabem validação de argumento e checagem de permissão. '
         '**Instrução no prompt** é pedido: falha em silêncio quando o modelo é convencido por '
         'um dado que leu. **Guardrails** trabalha com texto e não impede ação — se o agente '
         'tem permissão de escrita, nenhum filtro de linguagem segura. **Modelo mais alinhado** '
         'resiste melhor a jailbreak do usuário e não protege contra injeção indireta, que '
         'chega por dado e não depende do usuário.'),
    quiz('Uma empresa vai processar 50 mil notas fiscais padronizadas por dia. Qual desenho é o certo?',
         ['Modelo generativo multimodal lendo cada nota inteira',
          'Extração especializada primeiro, modelo só no campo que exige interpretação',
          'Ajuste fino de um modelo de fundação no formato da nota',
          'RAG com as notas indexadas num banco vetorial'],
         1,
         'Extração especializada primeiro. Documento padronizado é caso de serviço de extração '
         'determinístico — mais rápido, mais barato e reprodutível; o modelo generativo entra '
         'apenas onde há campo ambíguo. **Modelo multimodal em tudo** custa ordens de magnitude '
         'mais e introduz variabilidade onde ela é defeito. **Ajuste fino** trata o problema '
         'como comportamento quando ele é de extração estruturada — e ainda exige capacidade '
         'provisionada para servir. **RAG** responde pergunta sobre acervo; aqui o objetivo é '
         'produzir dado estruturado, que é tarefa diferente.'),
]))

# ─── Renumera e grava ────────────────────────────────────────────────────────
def renumerar(bs, pref, cont):
    for pos, b in enumerate(bs):
        b['id'] = f'{pref}-{cont[0]}'
        cont[0] += 1
        b['position'] = pos
        if b.get('children'):
            renumerar(b['children'], pref, cont)


# `title` fica null: o título humano vem de `trails/*.ts`, e duplicá-lo aqui é
# como as duas fontes divergem.
doc = {
    'slug': 'aws-ia-100-solucoes',
    'title': None,
    'blocks': blocos,
}
renumerar(doc['blocks'], 'sol', [0])
SEED.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

n = sum(1 for _ in json.dumps(doc))
print(f'{SEED.relative_to(REPO)} — {len(blocos)} seções, {n} caracteres')
