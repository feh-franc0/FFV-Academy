#!/usr/bin/env python3
"""Gera o corpus de consultas de busca a partir de entidade × arquétipo.

## Por que gerado, e não coletado

Não existe API pública de volume de busca, e a pesquisa de ago/2026 mostrou que
ela também não resolveria o problema: entre 65% e 85% dos prompts feitos a
assistentes de IA NÃO TÊM correspondência em base de palavra-chave nenhuma
(Semrush, 126 mi de prompts analisados). A demanda que mais cresce é justamente
a que ferramenta de keyword não vê.

O que a pesquisa dá com solidez é a ESTRUTURA da demanda:

  - o buscador de IA decompõe uma consulta em 8–12 sub-consultas paralelas
    ("query fan-out"), incluindo variações comparativas e perguntas implícitas;
  - consulta com 8+ palavras tem 7× mais chance de acionar resumo de IA;
  - 60% das consultas iniciadas por palavra interrogativa recebem resumo;
  - por categoria, aparecer em 1 de 5 arquétipos de prompt é penalizado até
    chegar a 3 de 5 — cobertura rasa não vira presença.

Daí o método: cruzar as ENTIDADES reais (as `keywords` que o autor já escreveu
em cada módulo, mais entidades externas de demanda medida) com os ARQUÉTIPOS de
pergunta documentados. Cada linha é rotulada por origem:

  V — entidade com volume publicado em fonte citada
  P — padrão de consulta documentado em fonte (PAA, fan-out, estudo de arquétipo)
  D — derivada por expansão sistemática (entidade real × arquétipo real)

`D` não é invenção: é a mesma expansão que uma ferramenta de keyword faz para
sugerir cauda longa. O que ela não tem é volume medido, e o corpus diz isso em
vez de fingir número.

## Onde a primeira versão errava

Gerava 26.612 linhas e boa parte era lixo: `keywords` como `model context
protocol tutorial`, `aws iam fundamentos`, `postgresql vs mongodb` ou
`observability 3 pilares` não são ENTIDADES, são rótulos de aula. Aplicar
"o que é X?" a elas produz pergunta que ninguém faz — e página que ninguém
busca. O filtro de entidade abaixo existe por causa disso.
"""
from __future__ import annotations

import csv
import json
import pathlib
import re
import sys
import unicodedata
from collections import Counter, defaultdict

AQUI = pathlib.Path(__file__).parent
REPO = AQUI.parents[1]
DESTINO = REPO / 'docs' / 'seo'
FONTE = AQUI / '.dados' / 'curriculo.json'

# Cache que nunca invalida descreve um currículo do passado. A primeira versão só
# extraía quando o arquivo não existia — e com isso um módulo novo ficou fora do
# mapa de temas e do corpus, sem erro nenhum. Compara o tempo de modificação.
_TRILHAS = REPO / 'frontend' / 'src' / 'lib' / 'curriculum'
_mais_novo = max((f.stat().st_mtime for f in _TRILHAS.rglob('*.ts')), default=0)
if not FONTE.exists() or FONTE.stat().st_mtime < _mais_novo:
    import subprocess
    subprocess.run([sys.executable, str(AQUI / 'extrair_curriculo.py')], check=True)
CURRICULO = json.loads(FONTE.read_text(encoding='utf-8'))

# --------------------------------------------------------------------------
# 1. Temas — a classificação transversal proposta
# --------------------------------------------------------------------------
# Hub e trilha são hierarquia de ENSINO (onde o aluno está na jornada). Tema é
# eixo de ASSUNTO, e é o que a busca usa: quem procura "como avaliar alucinação"
# não procura por hub. Um módulo tem 1 hub, 1 trilha e N temas.

TEMAS: list[tuple[str, str, list[str]]] = [
    ('agentes', 'Agentes e orquestração', [
        r'\bagent', r'\btool use\b', r'subagent', r'orquestr', r'\bmcp\b',
        r'multi-?agent', r'harness', r'computer use', r'\bswarm\b', r'tool_choice',
        # Vieram do tema `api-claude`, retirado em ago/2026: chamar função e obter
        # saída estruturada é assunto de agente, não de um fornecedor de API.
        r'function calling', r'structured output', r'agentcore']),
    ('rag-retrieval', 'RAG e retrieval', [
        r'\brag\b', r'embedding', r'\bvetor', r'vector', r'chunk', r'rerank',
        r'retriev', r'busca sem[âa]ntica', r'\bbm25\b', r'\bhnsw\b', r'\bfaiss\b',
        r'pgvector', r'h[íi]brid']),
    ('prompt-contexto', 'Prompt e engenharia de contexto', [
        r'prompt', r'context', r'few-?shot', r'chain of thought',
        r'janela de contexto', r'\btoken']),
    ('avaliacao-evals', 'Avaliação e evals', [
        r'\beval', r'benchmark', r'alucina', r'hallucinat', r'llm as a judge',
        r'\bm[ée]trica', r'\bjuiz\b']),
    ('seguranca-ia', 'Segurança de IA', [
        r'prompt injection', r'jailbreak', r'guardrail', r'red team', r'\bsafety\b',
        r'\bowasp\b', r'sandbox', r'exfiltra', r'\bpii\b', r'modera[çc]']),
    ('modelos-internals', 'Modelos por dentro', [
        r'transformer', r'atten[çc]|attention', r'tokeniz', r'quantiza',
        r'fine-?tun', r'\brlhf\b', r'\bdpo\b', r'\blora\b', r'destila|distill',
        r'\bmoe\b|mixture of experts', r'difus|diffusion', r'\bgpu\b', r'infer[êe]ncia',
        r'kv cache', r'reasoning|racioc[íi]nio', r'\bembed(ding)?s?\b',
        # ML clássico é "modelo por dentro" tanto quanto transformer. Sem estes
        # padrões, `ml-mental-model` ficava SEM TEMA NENHUM — entrava só em
        # `carreira`, pela palavra "mercado", que é falso positivo removido em
        # EXCECOES_TEMA. O teste `todo módulo com conteúdo tem pelo menos um
        # tema` pegou.
        r'machine learning', r'aprendizado de m[áa]quina', r'bias.?variance',
        r'\bxgboost\b', r'clustering', r'feature engineering',
        r'regress[ãa]o|classifica[çc][ãa]o']),
    ('custo-finops', 'Custo e FinOps', [
        r'custo', r'pre[çc]o|pricing', r'finops', r'or[çc]amento|budget',
        r'\bspot\b', r'savings plan', r'reserved instance', r'economi']),
    ('producao-sre', 'Produção, SRE e observabilidade', [
        r'observabil', r'\bsre\b', r'\bslo\b|\bsli\b', r'incident', r'on-?call',
        r'monitora', r'\btrace|tracing', r'deploy', r'kubernetes|\bk8s\b',
        r'escala|scaling', r'\bci/?cd\b', r'\bmlops\b', r'\bllmops\b',
        r'canary|blue-?green', r'postmortem']),
    ('dados-engenharia', 'Dados e engenharia de dados', [
        r'postgres', r'\bsql\b', r'\bmvcc\b', r'pipeline', r'streaming', r'\bkafka\b',
        r'warehouse|lakehouse', r'\betl\b|\belt\b', r'\bdbt\b', r'parquet', r'\bspark\b',
        r'transa[çc][ãa]o|transaction', r'\bíndice\b|\bindice\b', r'\bmongo']),
    ('aws-core', 'Serviços AWS', [
        r'\bvpc\b', r'\biam\b', r'\bs3\b', r'\bec2\b', r'lambda', r'dynamodb',
        r'\brds\b', r'aurora', r'cloudfront', r'route ?53', r'\becs\b|\beks\b',
        r'\bsqs\b|\bsns\b', r'cloudwatch', r'step functions', r'api gateway',
        r'\bkms\b', r'transit gateway', r'organizations', r'well-?architected',
        r'fargate', r'sagemaker']),
    ('bedrock', 'Amazon Bedrock', [r'bedrock', r'amazon nova']),
    ('certificacao', 'Certificação', [
        r'saa-?c03', r'clf-?c02', r'dva-?c02', r'sap-?c03', r'aif-?c01',
        r'certifica', r'\bexame\b', r'simulado', r'\bprova\b']),
    ('linguagens', 'Linguagens', [
        r'\bpython\b', r'\bgo(lang)?\b', r'typescript', r'javascript', r'\brust\b',
        r'\bbash\b', r'\bregex\b', r'\bpydantic\b']),
    ('fundamentos-cs', 'Fundamentos de computação', [
        r'\bhttp', r'\btcp\b|\bdns\b|\btls\b', r'\bgit\b', r'linux', r'kernel',
        r'algoritmo', r'estrutura de dados', r'complexidade', r'compilador',
        r'mem[óo]ria', r'concorr[êe]ncia|thread', r'\bssh\b', r'\bcache\b']),
    ('arquitetura-design', 'Arquitetura e system design', [
        r'system design', r'distribu[íi]d', r'\bsaga', r'\bcap\b', r'consist[êe]nc',
        r'idempot', r'\bfila\b|\bqueue\b', r'circuit breaker', r'microservi',
        r'event-?driven', r'\bcqrs\b', r'rate limit|token bucket']),
    ('carreira', 'Carreira e mercado', [
        r'sal[áa]rio', r'entrevista|interview', r'carreira', r'\bvaga', r'portf[óo]lio',
        r'\bs[êe]nior\b', r'roadmap', r'transi[çc][ãa]o de carreira', r'mercado']),
    # --- Três temas que NÃO existem na plataforma hoje. A lacuna é o achado.
    ('busca-ia-geo', 'Busca com IA e visibilidade (GEO/AEO)', [
        r'ai overview', r'\bgeo\b|generative engine', r'answer engine', r'\bseo\b',
        r'llms\.txt', r'schema\.org|schema markup', r'query fan-?out',
        r'resumo de ia', r'cita[çc][ãa]o em ia']),
    ('conformidade-ia', 'Conformidade e regulação de IA', [
        r'\bai act\b', r'\blgpd\b', r'marco legal', r'governan[çc]a de ia',
        r'\bcompliance\b', r'auditoria de ia', r'\bpl 2338\b', r'regula[çc]']),
    ('ferramentas-ia', 'Ferramentas de IA do mercado', [
        r'chatgpt', r'gemini', r'copilot', r'\bcursor\b', r'perplexity',
        r'\bollama\b', r'\bvllm\b', r'langchain|langgraph|llamaindex', r'\bn8n\b',
        r'vibe coding', r'\bdeepseek\b']),
]

TEMA_NOME = {t: nome for t, nome, _ in TEMAS}
TEMA_RE = {t: [re.compile(p, re.I) for p in pats] for t, _, pats in TEMAS}


def temas_de(texto: str) -> list[str]:
    return [t for t, res in TEMA_RE.items() if any(r.search(texto) for r in res)]


# --------------------------------------------------------------------------
# 2. Arquétipos de pergunta
# --------------------------------------------------------------------------
# Os cinco primeiros são os arquétipos que o estudo de 1.094 categorias em
# ChatGPT usa por categoria (definição, comparação, alternativa, caso de uso,
# decisão). Os demais vêm da busca clássica: "how" é 51% do top 100; diagnóstico
# e custo são a maior fatia da cauda longa em tema técnico.
#
# Todos os moldes são SEM ARTIGO antes da entidade — em português, "o que é o
# RAG" e "o que é a atenção" exigiriam concordância de gênero que geração
# automática erra em silêncio.

ARQUETIPOS: dict[str, dict] = {
    'definicao': {'intencao': 'informacional', 'peso': 3, 'moldes': [
        'O que é {e}?', '{e}: o que é e para que serve?']},
    'funcionamento': {'intencao': 'informacional', 'peso': 3, 'moldes': [
        'Como {e} funciona por dentro?', 'Como {e} funciona na prática?']},
    'decisao': {'intencao': 'comercial-investigativa', 'peso': 3, 'moldes': [
        'Quando usar {e}?', 'Vale a pena usar {e}?']},
    'procedimento': {'intencao': 'transacional', 'peso': 2, 'moldes': [
        'Como {e} passo a passo?', 'Como {e} sem quebrar produção?']},
    'diagnostico': {'intencao': 'transacional', 'peso': 2, 'moldes': [
        'Quais os erros mais comuns com {e}?', 'Por que {e} não funciona como esperado?']},
    'custo': {'intencao': 'comercial-investigativa', 'peso': 2, 'moldes': [
        'Quanto custa {e} em produção?', 'Como reduzir o custo de {e}?']},
    'alternativa': {'intencao': 'comercial-investigativa', 'peso': 2, 'moldes': [
        'Qual alternativa a {e}?', '{e} ainda é a melhor escolha em 2026?']},
    'prerequisito': {'intencao': 'informacional', 'peso': 2, 'moldes': [
        'O que preciso saber antes de estudar {e}?', '{e} é difícil de aprender?']},
    'comparacao': {'intencao': 'comercial-investigativa', 'peso': 3, 'moldes': [
        '{a} ou {b}: qual a diferença?', 'Quando usar {a} em vez de {b}?']},
    'producao': {'intencao': 'informacional', 'peso': 2, 'moldes': [
        'Como levar {e} para produção com segurança?', 'Como testar {e} antes do deploy?']},
    # "how" é 51% das consultas do top 100 do Google. `procedimento` só serve a
    # entidade que já é ação ("configurar X"); para conceito, o molde de ação
    # precisa ser outro, senão o arquétipo de maior volume fica de fora.
    'implementacao': {'intencao': 'transacional', 'peso': 3, 'moldes': [
        'Como implementar {e} do zero?', 'Como usar {e} em um projeto real?']},
    'autoral': {'intencao': 'informacional', 'peso': 3, 'moldes': ['{e}']},
}

POR_CLASSE = {
    # Papel, norma e produto de terceiro não se implementa nem tem "por dentro":
    # "Como implementar engenheiro de IA do zero?" e "Como LGPD funciona por
    # dentro?" são as duas perguntas que a v3 gerava e ninguém faria.
    'papel': ['definicao', 'decisao', 'prerequisito', 'alternativa'],
    'conceito': ['definicao', 'funcionamento', 'implementacao', 'decisao',
                 'alternativa', 'prerequisito', 'diagnostico'],
    'tarefa': ['procedimento', 'diagnostico', 'producao'],
    'servico': ['definicao', 'funcionamento', 'implementacao', 'decisao',
                'custo', 'alternativa', 'producao'],
    'exame': ['definicao', 'prerequisito', 'procedimento', 'decisao', 'custo'],
}

# --------------------------------------------------------------------------
# 3. Filtro de entidade
# --------------------------------------------------------------------------
# Uma `keyword` de módulo pode ser entidade ("pgvector") ou rótulo de aula
# ("aws iam fundamentos"). Só a primeira gera pergunta que alguém faz.

META = re.compile(
    r'\b(tutorial|fundamentos|guia|introdu[çc][ãa]o|overview|b[áa]sico|avan[çc]ado|'
    r'completo|pr[áa]tico|exemplos?|passo a passo|dicas?|checklist|resumo|'
    r'na pr[áa]tica|do zero|para iniciantes|melhores pr[áa]ticas|best practices|'
    r'\d+\s*(pilares|passos|dicas|erros|regras|tipos|n[íi]veis))\b', re.I)
ROTULO = re.compile(
    r'\b(capstone|explicad[oa]|dashboard|panorama|mental model|hands ?on|'
    r'lab|projeto final|revis[ãa]o)\b|\s(ia|aws|claude|python|bedrock)$', re.I)
INTERROGATIVA = re.compile(r'^(o que|como|quando|quais?|qual|por que|porque|onde|quem)\b', re.I)
COMPARATIVA = re.compile(r'\b(vs\.?|versus|ou)\b', re.I)
VERBOS = re.compile(
    r'^(criar|construir|montar|configurar|instalar|implementar|integrar|publicar|'
    r'deployar|migrar|otimizar|escalar|proteger|testar|medir|monitorar|automatizar|'
    r'versionar|autenticar|debugar|depurar|reduzir|ajustar|escrever|rodar|subir)\b', re.I)
ACOES = re.compile(
    r'instala[çc]|configura[çc]|deploy|migra[çc]|otimiza[çc]|tuning|setup|'
    r'integra[çc]|automa[çc]|monitora[çc]|troubleshoot|provision', re.I)
SERVICOS = re.compile(
    r'\baws\b|bedrock|\bs3\b|\bec2\b|lambda|dynamodb|\brds\b|aurora|cloudfront|'
    r'\bsqs\b|\bsns\b|cloudwatch|\bkms\b|\bvpc\b|\biam\b|\becs\b|\beks\b|'
    r'sagemaker|opensearch|postgres|redis|kafka|kubernetes|\bgithub\b|fargate', re.I)
EXAMES = re.compile(r'saa-?c03|clf-?c02|dva-?c02|sap-?c03|aif-?c01|certifica|\bexame\b|simulado', re.I)
PREFIXO_LONGO = ('aws', 'amazon', 'claude', 'google', 'azure', 'openai', 'anthropic')

GENERICAS = {
    'ia', 'ai', 'aws', 'claude', 'llm', 'llms', 'cloud', 'dados', 'api', 'apis',
    'curso', 'aprender', 'estudar', 'iniciante', 'engenharia', 'engenheiro',
    'desenvolvedor', 'dev', 'código', 'sistema', 'sistemas', 'ferramenta',
    'ferramentas', 'modelo', 'modelos', 'produção', 'arquitetura',
}


def sem_acento(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower())
                   if unicodedata.category(c) != 'Mn')


def normalizar(k: str) -> str | None:
    k = re.sub(r'\s+', ' ', k.strip().lower()).strip('.,;:—-')
    if not k or len(k) < 3 or len(k) > 42:
        return None
    if k in GENERICAS or re.fullmatch(r'[\d\s%.,-]+', k):
        return None
    if META.search(k) or ROTULO.search(k) or INTERROGATIVA.match(k) or COMPARATIVA.search(k):
        return None
    palavras = k.split()
    limite = 4 if palavras[0] in PREFIXO_LONGO else 3
    if len(palavras) > limite:
        return None
    return k


PAPEIS = re.compile(
    r'^(engenheiro|engenharia de prompt|cientista|analista|desenvolvedor|'
    r'an[áa]lise de dados)|lgpd|ai act|marco legal|governan[çc]a|'
    r'ai overviews?$|chatgpt|gemini|copilot|cursor|perplexity|deepseek|'
    r'vibe coding|inteligência artificial|machine learning', re.I)


def classe_de(e: str) -> str:
    if PAPEIS.search(e):
        return 'papel'
    if EXAMES.search(e):
        return 'exame'
    if VERBOS.match(e) or ACOES.search(e):
        return 'tarefa'
    if SERVICOS.search(e):
        return 'servico'
    return 'conceito'


# --------------------------------------------------------------------------
# 4. Entidades da plataforma
# --------------------------------------------------------------------------
entidades: dict[str, dict] = {}
mod_por_slug: dict[str, dict] = {}
keywords_por_modulo: dict[str, list[str]] = {}

hub_de_trilha = {tid: h['name'] for h in CURRICULO['hubs'] for tid in h['trailIds']}

for tr in CURRICULO['trails']:
    for m in tr['modules']:
        contexto = f"{m['title']} {m['desc']} {m['keywords']}"
        m['temas'] = temas_de(contexto) or temas_de(f"{tr['name']} {tr['desc']}") or ['fundamentos-cs']
        m['trilha'] = tr['name']
        m['hub'] = hub_de_trilha.get(tr['id'], '—')
        mod_por_slug[m['slug']] = m

        locais = []
        for bruto in m['keywords'].split(','):
            e = normalizar(bruto)
            if not e:
                continue
            locais.append(e)
            chave = sem_acento(e)
            if chave not in entidades:
                entidades[chave] = {
                    'entidade': e, 'slug': m['slug'], 'modulo': m['title'],
                    'trilha': tr['name'], 'hub': m['hub'],
                    'temas': temas_de(e) or m['temas'],
                    'classe': classe_de(e), 'origem': 'plataforma',
                }
        keywords_por_modulo[m['slug']] = locais

# --------------------------------------------------------------------------
# 5. Entidades externas — demanda medida ou documentada em fonte
# --------------------------------------------------------------------------
# (entidade, tier, tema forçado, nota de fonte)
EXTERNAS: list[tuple[str, str, str, str]] = [
    # Cabeças de altíssimo volume (Ahrefs jul/2026, base de 28,7 bi de palavras)
    ('inteligência artificial', 'V', 'modelos-internals', 'what is artificial intelligence — 360.000/mês (US)'),
    ('machine learning', 'V', 'modelos-internals', 'what is machine learning — 290.000/mês (US)'),
    ('api', 'V', 'fundamentos-cs', 'what is an api — 270.000/mês (US)'),
    ('python', 'V', 'linguagens', 'what is python — 200.000/mês (US)'),
    ('javascript', 'V', 'linguagens', 'how to learn javascript — 310.000/mês (US)'),
    ('phishing', 'V', 'seguranca-ia', 'what is phishing — 290.000/mês (US)'),
    ('vpn', 'V', 'fundamentos-cs', 'what is a vpn — 230.000/mês (US)'),
    ('url', 'V', 'fundamentos-cs', 'what is a url — 200.000/mês (US)'),
    ('cache', 'V', 'fundamentos-cs', 'what is cache — 170.000/mês (US)'),
    ('malware', 'V', 'seguranca-ia', 'what is malware — 170.000/mês (US)'),
    ('blockchain', 'V', 'fundamentos-cs', 'what is blockchain — 160.000/mês (US)'),
    # Ferramentas de mercado
    ('chatgpt', 'V', 'ferramentas-ia', 'termo mais buscado do Google em jul/2026'),
    ('gemini', 'V', 'ferramentas-ia', '#2 global, ~15,7 mi/mês'),
    ('copilot', 'V', 'ferramentas-ia', '13,2% do mercado de busca por IA; 68% de adoção entre devs'),
    ('cursor', 'P', 'ferramentas-ia', '18% de adoção entre devs (Stack Overflow 2026)'),
    ('perplexity', 'P', 'ferramentas-ia', '7,23% do tráfego de referência de IA'),
    ('deepseek', 'P', 'ferramentas-ia', 'concorrente de peso em modelo aberto'),
    ('langgraph', 'P', 'agentes', 'framework de agente mais comparado'),
    ('llamaindex', 'P', 'rag-retrieval', 'framework de RAG mais comparado'),
    ('n8n', 'P', 'agentes', 'automação com IA sem código'),
    ('vibe coding', 'P', 'ferramentas-ia', 'termo cunhado em 2025, alta busca e alta controvérsia'),
    # Agentes e protocolo
    ('model context protocol', 'P', 'agentes', 'MCP: 97 mi de downloads/mês em mar/2026, +4.750% em 16 meses'),
    ('mcp server', 'P', 'agentes', '6.400 servidores no registro oficial; >90 mil catalogados'),
    ('agentic ai', 'P', 'agentes', 'uso de agentes dobrou ano a ano (Stack Overflow 2026)'),
    ('context engineering', 'P', 'prompt-contexto', 'apontado como habilidade-chave de 2026'),
    ('agent teams', 'P', 'agentes', 'padrão de subagentes coordenados, guias de 2026'),
    ('agent memory', 'P', 'agentes', 'memória persistente de agente'),
    ('computer use', 'P', 'agentes', 'agente que opera interface gráfica'),
    ('browser agent', 'P', 'agentes', 'automação de navegador por agente'),
    ('voice agent', 'P', 'agentes', 'agente de voz em tempo real'),
    # Busca com IA / GEO — a plataforma vive disso e não ensina
    ('ai overviews', 'V', 'busca-ia-geo', 'presente em 48% das buscas'),
    ('query fan-out', 'P', 'busca-ia-geo', '1 consulta → 8–12 sub-consultas paralelas'),
    ('generative engine optimization', 'P', 'busca-ia-geo', 'GEO/AEO: categoria nova de otimização'),
    ('answer engine optimization', 'P', 'busca-ia-geo', 'idem'),
    ('llms.txt', 'P', 'busca-ia-geo', '~10% de adoção; dúvida frequente se funciona'),
    ('dados estruturados', 'P', 'busca-ia-geo', 'dúvida recorrente: existe schema para resumo de IA?'),
    # LLM em produção
    ('llm evals', 'P', 'avaliacao-evals', '66% dos devs citam "quase certo, mas não" como maior frustração'),
    ('prompt injection', 'P', 'seguranca-ia', 'OWASP LLM Top 10, risco nº 1'),
    ('owasp llm top 10', 'P', 'seguranca-ia', 'referência de segurança de IA'),
    ('guardrails', 'P', 'seguranca-ia', 'categoria de produto e de dúvida'),
    ('red teaming', 'P', 'seguranca-ia', 'teste adversarial de modelo'),
    ('observabilidade de llm', 'P', 'producao-sre', 'tracing de agente, categoria emergente'),
    ('semantic caching', 'P', 'custo-finops', 'redução de custo de inferência'),
    ('model routing', 'P', 'custo-finops', 'escolher modelo por tarefa e por custo'),
    ('token economics', 'P', 'custo-finops', 'custo por token como métrica de produto'),
    ('small language models', 'P', 'modelos-internals', 'contraponto a modelo grande'),
    ('on-device ai', 'P', 'modelos-internals', 'inferência local e privacidade'),
    ('ollama', 'P', 'ferramentas-ia', 'execução local de modelo'),
    ('vllm', 'P', 'producao-sre', 'servidor de inferência'),
    ('quantização', 'P', 'modelos-internals', 'rodar modelo grande em GPU pequena'),
    ('lora', 'P', 'modelos-internals', 'fine-tuning acessível'),
    ('dpo', 'P', 'modelos-internals', 'alinhamento sem RL clássico'),
    ('graphrag', 'P', 'rag-retrieval', 'RAG com grafo de conhecimento'),
    ('structured outputs', 'P', 'api-claude', 'saída validada por schema'),
    ('function calling', 'P', 'api-claude', 'uso de ferramenta pelo modelo'),
    ('prompt caching', 'P', 'prompt-contexto', 'maior alavanca de custo de entrada'),
    ('batch api', 'P', 'api-claude', 'processamento assíncrono mais barato'),
    ('reasoning models', 'P', 'modelos-internals', 'computação em tempo de inferência'),
    ('dados sintéticos', 'P', 'avaliacao-evals', 'gerar dado de treino e de avaliação'),
    ('detecção de alucinação', 'P', 'avaliacao-evals', 'medir alucinação em produção'),
    # Conformidade e regulação
    ('eu ai act', 'P', 'conformidade-ia', 'regulação europeia de IA'),
    ('lgpd', 'P', 'conformidade-ia', 'demanda brasileira específica'),
    ('marco legal da ia', 'P', 'conformidade-ia', 'PL 2338, demanda brasileira específica'),
    ('governança de ia', 'P', 'conformidade-ia', 'exigência corporativa crescente'),
    # Carreira
    ('engenheiro de ia', 'V', 'carreira', 'nº 1 em "Empregos em Alta 2026" do LinkedIn (Brasil)'),
    ('engenharia de prompt', 'V', 'prompt-contexto', '43% dos profissionais brasileiros querem a habilidade'),
    ('análise de dados com ia', 'V', 'carreira', '44,6% — habilidade mais desejada no Brasil'),
    ('system design', 'P', 'arquitetura-design', 'etapa padrão de vaga sênior'),
]

# Texto completo de cada módulo, para achar cobertura por SUBSTRING. Casar só
# `keywords` exatas produziria lacuna falsa: `function calling` aparece na
# descrição de um módulo de API sem estar na lista de palavras-chave, e apontar
# isso como lacuna mandaria o time escrever conteúdo que já existe.
TEXTO_MODULO = {
    m['slug']: sem_acento(f"{m['title']} {m['desc']} {m['keywords']}")
    for tr in CURRICULO['trails'] for m in tr['modules']
}


def cobertura(e: str) -> tuple[str, str]:
    """Devolve (situação, slug) da entidade no currículo atual."""
    alvo = sem_acento(e)
    # Fronteira de palavra é obrigatória: sem ela, `lora` casa dentro de
    # "explorar" e `dpo` dentro de qualquer palavra — e a análise de lacuna
    # passa a dizer que está coberto o que não está.
    inteiro = re.compile(rf'\b{re.escape(alvo)}\b')
    for slug, txt in TEXTO_MODULO.items():
        if inteiro.search(txt):
            return 'coberto', slug
    # Sem o termo inteiro: procura o token mais específico (o mais longo).
    toks = [t for t in re.split(r'[^\w.]+', alvo) if len(t) > 4]
    if toks:
        maior = re.compile(rf'\b{re.escape(max(toks, key=len))}\b')
        for slug, txt in TEXTO_MODULO.items():
            if maior.search(txt):
                return 'parcial', slug
    return 'ausente', ''


for e, tier, tema, nota in EXTERNAS:
    chave = sem_acento(e)
    if chave in entidades:
        entidades[chave]['origem'] = 'plataforma+externa'
        entidades[chave]['tier'] = tier
        entidades[chave]['nota'] = nota
        if tema not in entidades[chave]['temas']:
            entidades[chave]['temas'] = [tema, *entidades[chave]['temas']]
    else:
        sit, slug = cobertura(e)
        m = mod_por_slug.get(slug, {})
        entidades[chave] = {
            'entidade': e, 'slug': slug if sit == 'coberto' else '',
            'modulo': m.get('title', ''), 'trilha': m.get('trilha', ''),
            'hub': m.get('hub', ''),
            'temas': [tema, *[t for t in temas_de(e) if t != tema]],
            'classe': classe_de(e), 'origem': 'externa', 'tier': tier, 'nota': nota,
            'cobertura': sit, 'ancora': slug,
        }

# --------------------------------------------------------------------------
# 6. Consultas autorais — as de maior intenção, escritas à mão
# --------------------------------------------------------------------------
# Molde não alcança estas: são consultas de DECISÃO DE VIDA (carreira, exame,
# dinheiro) e de assunto que a plataforma ainda não tem. Vale escrever uma por
# uma, porque são as que convertem leitor em aluno.
AUTORAIS: list[tuple[str, str, str, str]] = [
    # carreira — dados brasileiros medidos
    ('Quanto ganha um engenheiro de IA no Brasil?', 'carreira', 'V', 'R$ 8 mil–R$ 32 mil/mês; vaga com IA paga 28% mais'),
    ('Como virar engenheiro de IA sem mestrado?', 'carreira', 'V', 'nº 1 em Empregos em Alta 2026 (LinkedIn Brasil)'),
    ('Qual a diferença entre engenheiro de IA e cientista de dados?', 'carreira', 'P', 'confusão de papel recorrente'),
    ('Que habilidades de IA o mercado brasileiro pede em 2026?', 'carreira', 'V', 'análise de dados 44,6%, engenharia de prompt 43%, ferramentas 52%'),
    ('Vale a pena migrar de dev backend para engenharia de IA?', 'carreira', 'P', 'matrícula em curso de IA +866% ao ano (Coursera)'),
    ('Como montar portfólio de IA sem experiência profissional?', 'carreira', 'P', 'obstáculo citado: 27,6% excesso de teoria, 23,4% conteúdo superficial'),
    ('Preciso saber matemática para trabalhar com IA?', 'carreira', 'P', 'barreira de entrada mais citada'),
    ('Quanto tempo leva para aprender IA do zero?', 'carreira', 'P', 'pergunta de decisão inicial'),
    ('Qual roadmap seguir para virar AI engineer em 2026?', 'carreira', 'P', 'consulta de planejamento, alta cauda longa'),
    ('IA vai substituir programador júnior?', 'carreira', 'P', '10,3% das vagas de estágio já pedem IA'),
    ('Como se preparar para entrevista de system design com IA?', 'carreira', 'P', 'etapa padrão de vaga sênior'),
    ('Vale mais certificação AWS ou projeto no GitHub?', 'carreira', 'P', 'dúvida de alocação de tempo'),
    ('Como provar experiência com agentes em entrevista?', 'carreira', 'P', 'uso de agente dobrou ano a ano'),
    ('Que perguntas fazem em entrevista de engenheiro de IA?', 'carreira', 'P', 'consulta de preparação'),
    ('Freelance de IA compensa no Brasil?', 'carreira', 'P', 'consulta de renda alternativa'),
    # certificação — demanda medida por vaga
    ('Qual certificação AWS fazer primeiro?', 'certificacao', 'V', 'Cloud Practitioner é a porta de entrada mais buscada'),
    ('Quanto custa a certificação AWS em reais?', 'certificacao', 'P', 'dúvida de decisão recorrente'),
    ('A SAA-C03 é difícil?', 'certificacao', 'V', '45.000+ vagas pedem Solutions Architect Associate'),
    ('Quantas horas de estudo para passar na SAA-C03?', 'certificacao', 'P', 'consulta de planejamento'),
    ('Vale a pena a certificação AWS AI Practitioner?', 'certificacao', 'V', '+34% de agendamentos ano a ano no Q1/2026'),
    ('AIF-C01 ou CLF-C02: qual fazer antes?', 'certificacao', 'P', 'decisão de ordem de trilha'),
    ('Qual a nota de corte da AIF-C01?', 'certificacao', 'P', 'consulta factual de exame'),
    ('Certificação AWS expira?', 'certificacao', 'P', 'consulta factual recorrente'),
    ('Dá para passar na AWS só com simulado?', 'certificacao', 'P', 'dúvida de método de estudo'),
    ('Certificação AWS aumenta salário no Brasil?', 'certificacao', 'P', 'vaga com IA paga 28% mais'),
    ('Como agendar o exame AWS em português?', 'certificacao', 'P', 'demanda PT-BR específica'),
    ('SAP-C03 vale a pena sem experiência em multi-account?', 'certificacao', 'P', 'consulta de pré-requisito real'),
    ('Existe simulado de AWS gratuito e confiável?', 'certificacao', 'V', 'intenção comercial de alta conversão'),
    ('Quantas questões tem cada exame AWS?', 'certificacao', 'P', 'consulta factual de formato'),
    ('Reprovei no exame AWS: quando posso refazer?', 'certificacao', 'P', 'consulta de recuperação'),
    # busca com IA / GEO — tema novo
    ('Como aparecer no resumo de IA do Google?', 'busca-ia-geo', 'V', 'AI Overviews em 48% das buscas'),
    ('Existe schema.org para resumo de IA?', 'busca-ia-geo', 'P', 'resposta é não — dúvida altamente repetida'),
    ('O llms.txt melhora posicionamento?', 'busca-ia-geo', 'P', '~10% de adoção, nenhuma plataforma se comprometeu a ler'),
    ('Por que meu tráfego caiu com o AI Overviews?', 'busca-ia-geo', 'P', 'queda de 15,5% em cliques quando o resumo aparece'),
    ('O que é query fan-out e por que muda o SEO?', 'busca-ia-geo', 'P', '1 consulta vira 8–12 sub-consultas'),
    ('Como ser citado pelo ChatGPT?', 'busca-ia-geo', 'P', 'média de 15 fontes citadas por resposta'),
    ('FAQPage ainda funciona no Google?', 'busca-ia-geo', 'P', 'deixou de ser exibido em maio de 2026'),
    ('Quantas palavras precisa a consulta para acionar resumo de IA?', 'busca-ia-geo', 'P', '8+ palavras: 7× mais chance; pico em 6–10'),
    ('Como medir visibilidade em busca de IA?', 'busca-ia-geo', 'P', 'categoria nova de métrica'),
    ('Devo bloquear crawler de IA no robots.txt?', 'busca-ia-geo', 'P', 'decisão de publisher'),
    # conformidade — tema novo
    ('A LGPD se aplica a quem usa API de IA?', 'conformidade-ia', 'P', 'demanda brasileira específica'),
    ('Posso mandar dado de cliente para o ChatGPT?', 'conformidade-ia', 'P', 'dúvida corporativa nº 1'),
    ('O que o marco legal da IA no Brasil exige?', 'conformidade-ia', 'P', 'PL 2338'),
    ('O EU AI Act afeta empresa brasileira?', 'conformidade-ia', 'P', 'alcance extraterritorial'),
    ('Como documentar decisão de modelo para auditoria?', 'conformidade-ia', 'P', 'exigência de governança'),
    ('Preciso avisar o usuário que a resposta é de IA?', 'conformidade-ia', 'P', 'requisito de transparência'),
    ('Quem responde por erro de agente autônomo?', 'conformidade-ia', 'P', 'responsabilidade civil'),
    # ferramentas de mercado — comparação de alta intenção
    ('Claude Code ou Cursor: qual usar?', 'ferramentas-ia', 'P', 'Cursor 18% e Claude Code 10% de adoção'),
    ('Claude ou ChatGPT para programar?', 'ferramentas-ia', 'V', 'comparação de maior volume da categoria'),
    ('Copilot ou Claude Code para time grande?', 'ferramentas-ia', 'P', 'Copilot 68% de adoção'),
    ('Vale pagar Claude Max ou usar a API?', 'ferramentas-ia', 'P', 'decisão de custo real'),
    ('Como rodar modelo local em vez de pagar API?', 'ferramentas-ia', 'P', 'Ollama e vLLM'),
    ('Por que só 3% dos devs confiam em código de IA?', 'ferramentas-ia', 'V', '29% confiam na saída; 46% desconfiam ativamente'),
    ('Como revisar código gerado por IA sem perder tempo?', 'ferramentas-ia', 'V', '45% dizem que depurar código de IA leva mais tempo'),
    ('Vibe coding funciona em projeto sério?', 'ferramentas-ia', 'P', 'termo de alta busca e alta controvérsia'),
    # evals e produção — dor medida
    ('Como saber se meu agente está certo antes de subir?', 'avaliacao-evals', 'V', '66% citam "quase certo, mas não" como maior frustração'),
    ('Como medir alucinação em produção?', 'avaliacao-evals', 'P', 'só 29% confiam na precisão da saída'),
    ('Quantos exemplos preciso para um eval confiável?', 'avaliacao-evals', 'P', 'dúvida de método'),
    ('Como colocar eval no CI sem estourar custo?', 'avaliacao-evals', 'P', 'cruzamento eval × custo'),
    ('Por que meu agente entra em loop?', 'agentes', 'P', 'falha operacional mais relatada'),
    ('Como limitar gasto de um agente autônomo?', 'agentes', 'P', 'custo imprevisível por construção'),
    ('Agente ou workflow determinístico: quando cada um?', 'agentes', 'P', 'decisão de arquitetura mais consultada'),
    ('Quantos tokens meu agente gasta por tarefa?', 'custo-finops', 'P', 'token economics'),
    ('Como cortar 80% do custo de LLM sem perder qualidade?', 'custo-finops', 'P', 'prompt caching + roteamento + lote'),
    ('Prompt caching vale a pena com prompt pequeno?', 'custo-finops', 'P', 'pergunta de limiar'),
]

# --------------------------------------------------------------------------
# 7. Pares de comparação
# --------------------------------------------------------------------------
PARES_CURADOS: list[tuple[str, str]] = [
    ('rag', 'fine-tuning'), ('rag', 'contexto longo'), ('fine-tuning', 'prompt engineering'),
    ('embedding', 'busca por palavra-chave'), ('bm25', 'busca vetorial'),
    ('pgvector', 'banco vetorial dedicado'), ('opensearch', 'pgvector'),
    ('graphrag', 'rag clássico'), ('reranker', 'top-k maior'),
    ('mcp', 'function calling'), ('mcp', 'plugin'), ('subagente', 'agente único'),
    ('skill', 'slash command'), ('hook', 'instrução no claude.md'),
    ('agente', 'workflow determinístico'), ('langgraph', 'código próprio'),
    ('claude code', 'cursor'), ('claude code', 'copilot'), ('claude', 'chatgpt'),
    ('api do claude', 'bedrock'), ('bedrock', 'sagemaker'), ('bedrock', 'api direta'),
    ('opus', 'sonnet'), ('sonnet', 'haiku'), ('modelo grande', 'modelo pequeno'),
    ('batch api', 'chamada síncrona'), ('streaming', 'resposta completa'),
    ('prompt caching', 'prompt menor'), ('lora', 'fine-tuning completo'),
    ('dpo', 'rlhf'), ('quantização', 'gpu maior'), ('ollama', 'api hospedada'),
    ('vllm', 'inferência ingênua'), ('reasoning model', 'modelo padrão'),
    ('eval automatizado', 'revisão humana'), ('llm as a judge', 'métrica de string'),
    ('guardrail no prompt', 'guardrail em código'), ('sandbox', 'permissão'),
    ('lambda', 'ecs'), ('ecs', 'eks'), ('fargate', 'ec2'), ('sqs', 'sns'),
    ('sqs', 'kafka'), ('dynamodb', 'rds'), ('aurora', 'rds'), ('s3', 'efs'),
    ('cloudfront', 'load balancer'), ('iam role', 'iam user'),
    ('kms', 'secrets manager'), ('vpc endpoint', 'nat gateway'),
    ('transit gateway', 'vpc peering'), ('spot', 'on-demand'),
    ('savings plan', 'reserved instance'), ('multi-az', 'multi-region'),
    ('saga', 'two-phase commit'), ('consistência forte', 'consistência eventual'),
    ('fila', 'chamada direta'), ('idempotência', 'retentativa simples'),
    ('circuit breaker', 'timeout'), ('microsserviço', 'monólito'),
    ('event-driven', 'requisição-resposta'), ('cqrs', 'crud'),
    ('postgres', 'dynamodb'), ('mvcc', 'lock'), ('btree', 'gin'),
    ('replicação lógica', 'replicação física'), ('etl', 'elt'),
    ('parquet', 'csv'), ('kafka', 'kinesis'),
    ('rebase', 'merge'), ('reset', 'revert'), ('http/2', 'http/3'),
    ('rest', 'grpc'), ('grpc', 'graphql'), ('jwt', 'sessão'),
    ('oauth', 'chave de api'), ('cors', 'csp'),
    ('go', 'python'), ('typescript', 'javascript'), ('rust', 'go'),
    ('slo', 'sla'), ('sre', 'devops'), ('mlops', 'llmops'),
    ('observabilidade', 'monitoramento'), ('trace', 'log'),
    ('canary', 'blue-green'), ('kubernetes', 'serverless'),
    ('saa-c03', 'sap-c03'), ('clf-c02', 'aif-c01'), ('aif-c01', 'dva-c02'),
    ('certificação', 'portfólio'),
    ('ai overviews', 'resultado orgânico'), ('geo', 'seo'),
    ('llms.txt', 'sitemap'), ('dados estruturados', 'texto puro'),
    ('prompt injection', 'sql injection'), ('jailbreak', 'prompt injection'),
    ('eu ai act', 'lgpd'), ('governança de ia', 'comitê de ética'),
    ('engenheiro de ia', 'cientista de dados'), ('engenheiro de ia', 'engenheiro de ml'),
    ('transformer', 'rede recorrente'), ('atenção', 'convolução'),
    ('difusão', 'gan'), ('janela de contexto', 'rag'),
    ('semantic caching', 'cache exato'), ('model routing', 'modelo único'),
]

# --------------------------------------------------------------------------
# 8. Geração
# --------------------------------------------------------------------------
LINHAS: list[dict] = []
vistas: set[str] = set()
FONTE_D = 'expansão entidade × arquétipo'


def emitir(pergunta: str, arq: str, ent: dict, tier: str, fonte: str,
           variante: int = 0) -> None:
    pergunta = re.sub(r'\s+', ' ', pergunta).strip()
    chave = sem_acento(re.sub(r'[^\w\s]', '', pergunta))
    if chave in vistas:
        return
    # Palavra repetida é sintoma de molde aplicado a entidade que já era frase
    # ("Quando usar quando não usar agent?").
    toks = chave.split()
    if len(toks) != len(set(toks)) and arq != 'comparacao':
        return
    vistas.add(chave)
    temas = ent.get('temas') or ['fundamentos-cs']
    LINHAS.append({
        'pergunta': pergunta,
        'palavras': len(pergunta.split()),
        'tema': temas[0],
        'temas': '|'.join(dict.fromkeys(temas)),
        'arquetipo': arq,
        'intencao': ARQUETIPOS[arq]['intencao'],
        'entidade': ent['entidade'],
        'origem': ent['origem'],
        'tier': tier,
        'fonte': fonte,
        'modulo': ent.get('slug') or 'GAP',
        'trilha': ent.get('trilha') or '',
        'hub': ent.get('hub') or '',
        'peso': ARQUETIPOS[arq]['peso'],
        'variante': variante,
    })


for ent in entidades.values():
    tier = ent.get('tier', 'D')
    nota = ent.get('nota', FONTE_D)
    for arq in POR_CLASSE[ent['classe']]:
        moldes = ARQUETIPOS[arq]['moldes']
        for i, molde in enumerate(moldes):
            t = tier if i == 0 else 'D'
            emitir(molde.format(e=ent['entidade']), arq, ent, t,
                   nota if t != 'D' else FONTE_D, variante=i)

for pergunta, tema, tier, nota in AUTORAIS:
    # A consulta autoral é de TEMA, não de módulo. A primeira versão atribuía ao
    # primeiro módulo daquele tema, e o resultado foi "Quanto ganha um engenheiro
    # de IA no Brasil?" virando fila de trabalho de um módulo sobre a linha de
    # produtos da Anthropic. Dono errado é pior que dono nenhum: manda escrever
    # no lugar errado.
    base = {'entidade': '—', 'origem': 'autoral', 'temas': [tema],
            'slug': f'tema:{tema}', 'trilha': '', 'hub': ''}
    emitir(pergunta, 'autoral', base, tier, nota)

for a, b in PARES_CURADOS:
    dono = entidades.get(sem_acento(a)) or entidades.get(sem_acento(b))
    base = dict(dono) if dono else {
        'entidade': a, 'origem': 'externa', 'slug': '', 'trilha': '', 'hub': '',
        'temas': temas_de(f'{a} {b}') or ['fundamentos-cs']}
    base['entidade'] = f'{a} × {b}'
    for i, molde in enumerate(ARQUETIPOS['comparacao']['moldes']):
        emitir(molde.format(a=a, b=b), 'comparacao', base, 'P',
               'fan-out gera variação comparativa explicitamente', variante=i)

for slug, ks in keywords_por_modulo.items():
    unicas = list(dict.fromkeys(ks))
    for i in range(len(unicas) - 1):
        a, b = unicas[i], unicas[i + 1]
        if sem_acento(a) == sem_acento(b) or a in b or b in a:
            continue
        if len(a.split()) > 2 or len(b.split()) > 2:
            continue
        m = mod_por_slug[slug]
        base = {'entidade': f'{a} × {b}', 'origem': 'plataforma', 'temas': m['temas'],
                'slug': slug, 'trilha': m['trilha'], 'hub': m['hub']}
        emitir(ARQUETIPOS['comparacao']['moldes'][0].format(a=a, b=b), 'comparacao',
               base, 'D', 'par de palavras-chave do mesmo módulo')

# --------------------------------------------------------------------------
# 9. Priorização e corte em 10.000
# --------------------------------------------------------------------------
# O gerador produz mais do que se deve publicar. Cortar é a decisão editorial:
# 10.000 linhas é o que o pedido define e o que um time consegue percorrer.
TIER_PESO = {'V': 6, 'P': 4, 'D': 1}


def prioridade(l: dict) -> tuple:
    p = TIER_PESO[l['tier']] * 10 + l['peso'] * 3
    if l['palavras'] >= 6:      # faixa que mais aciona resumo de IA
        p += 4
    if l['modulo'] == 'GAP':    # lacuna vale mais: é conteúdo a criar
        p += 2
    if l['origem'] == 'autoral':
        p += 8
    return (-p, l['tema'], l['pergunta'])


LINHAS.sort(key=prioridade)
TOTAL_GERADO = len(LINHAS)

# Corte ESTRATIFICADO, não por ordem global de prioridade. O achado do estudo de
# 1.094 categorias é que profundidade rasa em muitos arquétipos vence
# profundidade grande em um: aparecer em 1 de 5 prompts é penalizado até chegar
# a 3 de 5. Um corte por prioridade global levaria 3.141 perguntas de
# `implementacao` e 12 de `custo` — exatamente o erro que o estudo descreve.
# Round-robin por entidade garante que cada entidade entre com sua melhor
# pergunta antes de qualquer entidade entrar com a segunda.
# Dentro de uma entidade a ordem é por ARQUÉTIPO, e a segunda variação de um
# arquétipo só entra depois de todos os arquétipos terem entrado uma vez. Sem
# isso, a ordem alfabética da pergunta decide — e "Como ... funciona?" vence
# "O que é ...?" por começar com C, o que não é critério nenhum.
RANK_ARQ = {a: i for i, a in enumerate([
    'autoral', 'definicao', 'comparacao', 'decisao', 'implementacao',
    'funcionamento', 'custo', 'diagnostico', 'alternativa', 'prerequisito',
    'producao', 'procedimento'])}

por_entidade: dict[str, list[dict]] = defaultdict(list)
for l in LINHAS:
    por_entidade[l['entidade']].append(l)
for fila in por_entidade.values():
    fila.sort(key=lambda l: (l['variante'], RANK_ARQ[l['arquetipo']]))
ordem_ent = sorted(por_entidade, key=lambda e: prioridade(por_entidade[e][0]))

SELECAO = [l for l in LINHAS if l['origem'] == 'autoral']
vistos_sel = {l['pergunta'] for l in SELECAO}
rodada = 0
while len(SELECAO) < 10000:
    entrou = False
    for e in ordem_ent:
        fila = por_entidade[e]
        if rodada < len(fila):
            l = fila[rodada]
            entrou = True
            if l['pergunta'] not in vistos_sel:
                SELECAO.append(l)
                vistos_sel.add(l['pergunta'])
                if len(SELECAO) == 10000:
                    break
    if not entrou:
        break
    rodada += 1
SELECAO.sort(key=prioridade)

# O conjunto completo fica em cache local (não versionado): serve para refazer o
# corte com outro limite sem regerar tudo.
(AQUI / '.dados').mkdir(exist_ok=True)
with (AQUI / '.dados' / 'corpus-completo.csv').open('w', newline='', encoding='utf-8') as fh:
    w = csv.DictWriter(fh, fieldnames=list(LINHAS[0].keys()))
    w.writeheader()
    w.writerows(LINHAS)
# --------------------------------------------------------------------------
# 10. Temas por módulo, com as exceções aplicadas
# --------------------------------------------------------------------------
mods_por_tema: dict[str, set] = defaultdict(set)
for tr in CURRICULO['trails']:
    for m in tr['modules']:
        for t in m['temas']:
            mods_por_tema[t].add(m['slug'])


# --------------------------------------------------------------------------
# 10b. Exceções de tema — falso positivo do classificador
# --------------------------------------------------------------------------
# O classificador casa TEXTO de título, descrição e palavras-chave. Ele acerta na
# maioria e erra de um jeito específico: uma palavra do padrão aparece em outro
# sentido. Cada remoção abaixo foi verificada olhando QUAL termo casou.
#
# Sem esta lista, a plataforma anunciaria um tema de visibilidade em busca com IA
# apoiado num módulo de DNS — que é pior que não ter tema nenhum, porque parece
# cobertura.
EXCECOES_TEMA: dict[str, dict[str, str]] = {
    'dns-cdn-edge': {'busca-ia-geo': 'casou "geo" de roteamento geográfico de DNS'},
    'bedrock-arquiteturas-e-cases-reais': {'carreira': 'casou "mercado" de contexto'},
    'go-historia-compilador-diferencial': {'carreira': 'casou "mercado" de contexto'},
    'ml-mental-model': {'carreira': 'casou "mercado" de contexto'},
    'cost-allocation-em-escala': {'carreira': 'casou "portfolio" de custos AWS'},
    'cost-optimization-sap': {'carreira': 'casou "portfolio" de custos AWS'},
    'reservas-savings-plans-spot': {'carreira': 'casou "portfolio" de custos AWS'},
    'sd-back-of-envelope': {'carreira': 'entrou pelo texto da trilha, não do módulo'},
    'monitoramento-cloudwatch': {'conformidade-ia': 'casou "compliance" de retenção de log'},
    's3-dev-features': {'conformidade-ia': 'casou "compliance" de armazenamento'},
}

# O inverso: assunto que o texto do módulo não deixa o classificador enxergar.
# Vazio hoje — a lacuna que existia virou padrão em `modelos-internals`, que é o
# lugar certo quando o caso não é único. Adição à mão é para o caso irredutível.
ADICOES_TEMA: dict[str, dict[str, str]] = {}

_slugs_validos = set(TEXTO_MODULO)
_temas_validos = {t for t, _, _ in TEMAS}
for _slug, _remocoes in EXCECOES_TEMA.items():
    # Exceção que aponta para slug ou tema inexistente é exceção esquecida: ela
    # deixou de proteger algo e ninguém percebeu.
    if _slug not in _slugs_validos:
        raise SystemExit(f'EXCECOES_TEMA: slug inexistente — {_slug}')
    for _t in _remocoes:
        if _t not in _temas_validos:
            raise SystemExit(f'EXCECOES_TEMA: tema inexistente — {_t} ({_slug})')
        if _slug not in mods_por_tema[_t]:
            raise SystemExit(f'EXCECOES_TEMA: {_slug} já não está em {_t} — remova a linha')
        mods_por_tema[_t].discard(_slug)

for _slug, _adicoes in ADICOES_TEMA.items():
    if _slug not in _slugs_validos:
        raise SystemExit(f'ADICOES_TEMA: slug inexistente — {_slug}')
    for _t in _adicoes:
        if _t not in _temas_validos:
            raise SystemExit(f'ADICOES_TEMA: tema inexistente — {_t} ({_slug})')
        if _slug in mods_por_tema[_t]:
            raise SystemExit(f'ADICOES_TEMA: {_slug} já está em {_t} — remova a linha')
        mods_por_tema[_t].add(_slug)

TEMAS_JSON = {t: {'nome': TEMA_NOME[t], 'modulos': sorted(mods_por_tema[t])} for t, _, _ in TEMAS}

# --------------------------------------------------------------------------
# --------------------------------------------------------------------------
# 10d. Relatório
# --------------------------------------------------------------------------
# Impresso DEPOIS das exceções, de propósito: a primeira versão imprimia as
# contagens de antes e dizia que carreira tinha 10 módulos enquanto gerava um
# mapa com 2. Relatório que discorda do artefato que o próprio script escreve é
# pior que relatório nenhum.

gaps = [l for l in SELECAO if l['modulo'] == 'GAP']
longas = sum(1 for l in SELECAO if l['palavras'] >= 6)
print(f'gerado: {TOTAL_GERADO} · selecionado: {len(SELECAO)} · entidades: {len(entidades)}')
print(f'  {len(gaps)} sem módulo dono · {longas} com 6+ palavras ({longas * 100 // len(SELECAO)}%)')
print('tier:', dict(Counter(l['tier'] for l in SELECAO)))
print('intenção:', dict(Counter(l['intencao'] for l in SELECAO)))
print('\narquétipo:')
for k, v in Counter(l['arquetipo'] for l in SELECAO).most_common():
    print(f'  {k:14} {v:5}')
print('\ntema · perguntas · módulos que ensinam:')
for t, nome, _ in TEMAS:
    q = sum(1 for l in SELECAO if l['tema'] == t)
    print(f'  {t:20} {q:5}  {len(mods_por_tema[t]):4}  {nome}')

externas = sorted(
    (e for e in entidades.values() if e['origem'] == 'externa'),
    key=lambda e: ({'ausente': 0, 'parcial': 1, 'coberto': 2}[e['cobertura']],
                   {'V': 0, 'P': 1, 'D': 2}[e.get('tier', 'D')], e['entidade']))
sit_cont = Counter(e['cobertura'] for e in externas)
print(f'\ndemanda externa ({len(externas)} entidades): {dict(sit_cont)}')
for e in externas:
    marca = {'ausente': '✗ AUSENTE', 'parcial': '~ parcial', 'coberto': '✓ coberto'}[e['cobertura']]
    onde = f"→ {e['ancora']}" if e['ancora'] else ''
    print(f"  {marca} [{e.get('tier')}] {e['entidade']:32} {e['temas'][0]:18} {onde}")

sem_dono = [(e['entidade'], e.get('tier', 'D'), e['temas'][0], e.get('nota', ''))
            for e in externas if e['cobertura'] == 'ausente']
# 10c. `temas-mapa.ts` — o mapa que o frontend consome
# --------------------------------------------------------------------------
MAPA_TS = REPO / 'frontend' / 'src' / 'lib' / 'curriculum' / 'temas-mapa.ts'
_linhas_ts = [
    '// GERADO por scripts/seo/gerar_corpus.py — não edite à mão.',
    '//',
    '// Atribuição módulo → temas, derivada de título, descrição e palavras-chave de',
    '// cada módulo do currículo. A definição editorial dos temas está em `temas.ts`;',
    '// aqui é só o mapa.',
    '//',
    '// Falso positivo do classificador se corrige em `EXCECOES_TEMA`, no gerador —',
    '// não neste arquivo, que é sobrescrito. Regerar após mexer em qualquer trilha:',
    '//',
    '//     python3 scripts/seo/gerar_corpus.py',
    '',
    'export const MODULOS_POR_TEMA: Record<string, string[]> = {',
]
for _t, _, _ in TEMAS:
    _mods = sorted(mods_por_tema[_t])
    _linhas_ts.append(f"  '{_t}': [")
    for _m in _mods:
        _linhas_ts.append(f"    '{_m}',")
    _linhas_ts.append('  ],')
_linhas_ts.append('};')
_linhas_ts.append('')
MAPA_TS.write_text('\n'.join(_linhas_ts), encoding='utf-8')
print(f'\n{MAPA_TS.relative_to(REPO)} — {sum(len(mods_por_tema[t]) for t, _, _ in TEMAS)} atribuições')
print('temas com menos de 3 módulos (sem página, por decisão):')
for _t, _n, _ in TEMAS:
    if len(mods_por_tema[_t]) < 3:
        print(f'  {_t:20} {len(mods_por_tema[_t])}  {_n}')
(AQUI / '.dados' / 'temas.json').write_text(
    json.dumps(TEMAS_JSON, ensure_ascii=False, indent=1), encoding='utf-8')
(AQUI / '.dados' / 'gaps.json').write_text(json.dumps(
    [{'entidade': e, 'tier': t, 'tema': tm, 'fonte': n} for e, t, tm, n in sem_dono],
    ensure_ascii=False, indent=1), encoding='utf-8')


# ==========================================================================
# 11. Exportação para `docs/seo/`
# ==========================================================================
DESTINO.mkdir(parents=True, exist_ok=True)
CORPUS = SELECAO

ARQ_NOME = {
    'autoral': 'Consulta autoral (escrita à mão, maior intenção)',
    'definicao': 'Definição — "o que é"',
    'comparacao': 'Comparação — "X ou Y"',
    'decisao': 'Decisão — "quando usar", "vale a pena"',
    'implementacao': 'Implementação — "como fazer"',
    'funcionamento': 'Funcionamento — "como funciona por dentro"',
    'custo': 'Custo — "quanto custa", "como reduzir"',
    'diagnostico': 'Diagnóstico — "erro", "não funciona"',
    'alternativa': 'Alternativa — "qual outra opção"',
    'prerequisito': 'Pré-requisito — "preciso saber antes"',
    'producao': 'Produção — "como levar para produção"',
    'procedimento': 'Procedimento — "passo a passo"',
}
ORDEM_ARQ = list(ARQ_NOME)
TIER_TXT = {'V': '**V**', 'P': 'P', 'D': 'D'}

por_tema: dict[str, list[dict]] = defaultdict(list)
for l in CORPUS:
    por_tema[l['tema']].append(l)

L: list[str] = []
w = L.append

w('# Corpus de 10.000 consultas de busca — FFV Academy')
w('')
w('> **GERADO.** Regenerar com `python3 scripts/seo/gerar_corpus.py`. A metodologia,')
w('> as fontes e o plano de captação estão em')
w('> [`PESQUISA_DEMANDA_BUSCA_2026-08.md`](../../PESQUISA_DEMANDA_BUSCA_2026-08.md).')
w('> Versão legível por máquina: [`corpus-10k.csv`](./corpus-10k.csv).')
w('')
w('## Como ler')
w('')
w('Cada linha é uma consulta que alguém digita — no Google ou num assistente. A')
w('coluna **Origem** diz de onde ela vem, e é a parte honesta do documento:')
w('')
w('| Origem | Significa | Quantas |')
w('|---|---|---|')
cont_tier = Counter(l['tier'] for l in CORPUS)
w(f'| **V** | entidade com **volume publicado** na fonte citada | {cont_tier["V"]} |')
w(f'| P | **padrão de consulta documentado** em fonte (PAA, fan-out, estudo de arquétipo) | {cont_tier["P"]} |')
w(f'| D | **derivada** por expansão sistemática (entidade real × arquétipo real) | {cont_tier["D"]} |')
w('')
w('`D` não é chute: é a mesma expansão de cauda longa que uma ferramenta de')
w('palavra-chave faz para sugerir termo. O que ela **não tem é volume medido**, e')
w('esta tabela diz isso em vez de inventar número. O motivo de `D` dominar está')
w('na pesquisa: 65%–85% dos prompts feitos a assistentes de IA **não têm')
w('correspondência em base de palavra-chave nenhuma**, então a demanda que mais')
w('cresce é justamente a que nenhuma ferramenta mede.')
w('')
w('A coluna **Módulo** diz quem responde hoje. `GAP` significa que nenhum módulo')
w('cobre a entidade — é a fila de conteúdo a escrever.')
w('')

gaps = sum(1 for l in CORPUS if l['modulo'] == 'GAP')
longas = sum(1 for l in CORPUS if l['palavras'] >= 6)
w('## Números')
w('')
w(f'- **{len(CORPUS)} consultas**, de {len({l["entidade"] for l in CORPUS})} entidades distintas')
w(f'- **{gaps}** sem módulo dono ({gaps * 100 // len(CORPUS)}%) — a fila de conteúdo')
w(f'- **{longas}** com 6+ palavras ({longas * 100 // len(CORPUS)}%) — a faixa que mais aciona resumo de IA')
w(f'- **{len(por_tema)} temas**, **{len(ORDEM_ARQ)} arquétipos** de pergunta')
w('')
cont_int = Counter(l['intencao'] for l in CORPUS)
w('| Intenção | Consultas | Para onde a página deve levar |')
w('|---|---|---|')
w(f'| informacional | {cont_int["informacional"]} | módulo → trilha → conta (XP) |')
w(f'| comercial-investigativa | {cont_int["comercial-investigativa"]} | comparação → módulo → simulado |')
w(f'| transacional | {cont_int["transacional"]} | passo a passo → simulado / conta |')
w('')
w('## Índice')
w('')
for tema in sorted(por_tema, key=lambda t: -len(por_tema[t])):
    nome = TEMAS_JSON.get(tema, {}).get('nome', tema)
    ancora = nome.lower().replace(' ', '-').replace('(', '').replace(')', '')
    ancora = ancora.replace('/', '').replace('—', '').replace(',', '').replace('.', '')
    mods = len(TEMAS_JSON.get(tema, {}).get('modulos', []))
    w(f'- [{nome}](#{ancora}) — {len(por_tema[tema])} consultas · {mods} módulos ensinam')
w('')

for tema in sorted(por_tema, key=lambda t: -len(por_tema[t])):
    linhas = por_tema[tema]
    nome = TEMAS_JSON.get(tema, {}).get('nome', tema)
    mods = TEMAS_JSON.get(tema, {}).get('modulos', [])
    por_arq: dict[str, list[dict]] = defaultdict(list)
    for l in linhas:
        por_arq[l['arquetipo']].append(l)
    cobertos = sum(1 for a in ORDEM_ARQ[1:6] if por_arq.get(a))

    w('---')
    w('')
    w(f'## {nome}')
    w('')
    plural = 'módulos ensinam' if len(mods) != 1 else 'módulo ensina'
    w(f'`{tema}` · **{len(linhas)} consultas** · **{len(mods)}** {plural} este tema · '
      f'a demanda aparece em **{cobertos}/5** arquétipos centrais')
    w('')
    if len(mods) < 12:
        w(f'> ⚠️ **Cobertura de ensino rasa: {len(mods)}.** A demanda existe nos cinco')
        w('> arquétipos; o ensino não. O estudo de 1.094 categorias mostra que presença em')
        w('> 1 de 5 arquétipos é penalizada até chegar a 3 de 5, e tema com poucos módulos')
        w('> não sustenta os cinco.')
        w('')

    for arq in ORDEM_ARQ:
        grupo = por_arq.get(arq)
        if not grupo:
            continue
        w(f'### {ARQ_NOME[arq]}')
        w('')
        w('| Consulta | Origem | Módulo |')
        w('|---|---|---|')
        for l in sorted(grupo, key=lambda x: ({'V': 0, 'P': 1, 'D': 2}[x['tier']], x['pergunta'])):
            mod = l['modulo']
            if mod == 'GAP':
                cel = '`GAP`'
            elif mod.startswith('tema:'):
                # Respondida na página do tema, não num módulo.
                cel = f'[/temas/{mod[5:]}](/temas/{mod[5:]})'
            else:
                cel = f'[{mod}](/aprenda/{mod})'
            w(f'| {l["pergunta"]} | {TIER_TXT[l["tier"]]} | {cel} |')
        w('')

# ---------------------------------------------------------------------------
# Fila de trabalho por módulo
# ---------------------------------------------------------------------------
# O corpus organizado por TEMA serve para decidir estratégia. Para escrever a
# seção `Perguntas frequentes` de um módulo, o que serve é o corte por MÓDULO —
# senão cada autor precisa filtrar 10.000 linhas antes de escrever a primeira
# resposta. Só entra módulo que ainda não tem a seção.
FAQ_PRONTO = set()
_seeds = REPO / 'scripts' / 'seeds' / 'articles'
for _p in _seeds.glob('*.json'):
    if '"Perguntas frequentes"' in _p.read_text(encoding='utf-8'):
        FAQ_PRONTO.add(_p.stem)

por_modulo: dict[str, list[dict]] = defaultdict(list)
for l in CORPUS:
    dono = l['modulo']
    if dono != 'GAP' and not dono.startswith('tema:') and dono not in FAQ_PRONTO:
        por_modulo[dono].append(l)

F: list[str] = []
f = F.append
f('# Fila de perguntas frequentes por módulo')
f('')
f('> **GERADO.** Regenerar com `python3 scripts/seo/gerar_corpus.py`.')
f('> Estratégia e contrato de resposta: [`ESTRATEGIA_SEO_ORGANICO_2026-08.md`](../../ESTRATEGIA_SEO_ORGANICO_2026-08.md).')
f('')
f('Para cada módulo **sem** a seção `Perguntas frequentes`, as consultas do corpus')
f('que ele é dono, em ordem de origem. Escolha 3, escreva a resposta começando pela')
f('conclusão, e rode `python3 scripts/validate_respostas_citaveis.py`.')
f('')
f(f'Módulos com a seção pronta: **{len(FAQ_PRONTO)}**. Nesta fila: **{len(por_modulo)}**.')
f('')
_ordem = {'V': 0, 'P': 1, 'D': 2}
for _slug in sorted(por_modulo, key=lambda s: (-len(por_modulo[s]), s)):
    _ls = sorted(por_modulo[_slug], key=lambda x: (_ordem[x['tier']], x['arquetipo'], x['pergunta']))
    _m = mod_por_slug.get(_slug, {})
    f(f'### `{_slug}`')
    f('')
    if _m.get('title'):
        f(f"**{_m['title']}** · {_m.get('trilha', '')}")
        f('')
    for _l in _ls[:8]:
        f(f"- [{_l['tier']}/{_l['arquetipo']}] {_l['pergunta']}")
    if len(_ls) > 8:
        f(f'- _(+{len(_ls) - 8} no CSV)_')
    f('')

# ---------------------------------------------------------------------------
# Índice de perguntas JÁ RESPONDIDAS — insumo de `/perguntas`
# ---------------------------------------------------------------------------
# `/perguntas` é o hub de conhecimento: uma URL que reúne tudo o que a plataforma
# responde por escrito. As respostas dos módulos vivem nos seeds, e seed não é
# legível em runtime (fica fora do contexto de build do Docker) — daí o índice
# gerado, no mesmo padrão de `content-manifest.json`.
import re as _re
RESPONDIDAS: list[dict] = []
for _p in sorted(_seeds.glob('*.json')):
    _doc = json.loads(_p.read_text(encoding='utf-8'))
    for _b in _doc.get('blocks', []):
        if (_b.get('data') or {}).get('title') != 'Perguntas frequentes':
            continue
        for _f in _b.get('children') or []:
            _d = _f.get('data') or {}
            _q = _d.get('question')
            _a = _d.get('answer')
            if isinstance(_q, str) and isinstance(_a, str) and _q.strip().endswith('?'):
                _m = mod_por_slug.get(_p.stem, {})
                RESPONDIDAS.append({
                    'q': _q.strip(),
                    'slug': _p.stem,
                    'modulo': _m.get('title', _p.stem),
                    'tema': (_m.get('temas') or ['fundamentos-cs'])[0],
                })

INDICE_TS = REPO / 'frontend' / 'src' / 'lib' / 'perguntas-respondidas.json'
INDICE_TS.write_text(json.dumps(
    {'geradoDe': 'scripts/seeds/articles/*.json', 'total': len(RESPONDIDAS),
     'perguntas': sorted(RESPONDIDAS, key=lambda x: (x['tema'], x['slug'], x['q']))},
    ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f'{INDICE_TS.relative_to(REPO)} — {len(RESPONDIDAS)} perguntas respondidas em módulo')

fila = DESTINO / 'FILA_PERGUNTAS_POR_MODULO.md'
fila.write_text('\n'.join(F) + '\n', encoding='utf-8')
print(f'{fila} — {len(por_modulo)} módulos na fila')

md = DESTINO / 'CORPUS_10K_CONSULTAS.md'
md.write_text('\n'.join(L) + '\n', encoding='utf-8')

# CSV para máquina
campos = ['pergunta', 'tema', 'temas', 'arquetipo', 'intencao', 'entidade',
          'origem', 'tier', 'fonte', 'modulo', 'trilha', 'hub', 'palavras']
with (DESTINO / 'corpus-10k.csv').open('w', newline='', encoding='utf-8') as fh:
    wr = csv.DictWriter(fh, fieldnames=campos, extrasaction='ignore')
    wr.writeheader()
    wr.writerows(CORPUS)

# o gerador vai para o repositório: documento gerado sem gerador versionado
# apodrece na primeira semana.

print(f'{md} — {len(L)} linhas, {md.stat().st_size // 1024} KB')
print(f'{DESTINO / "corpus-10k.csv"} — {len(CORPUS)} linhas')
