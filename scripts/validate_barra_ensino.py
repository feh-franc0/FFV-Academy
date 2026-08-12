#!/usr/bin/env python3
"""Barra de ENSINO da série de 100 laboratórios — o que os outros gates não veem.

─── Por que este gate existe, e o que ele não promete ────────────────────────

Os gates da plataforma conferem ESTRUTURA: `validate_bedrock_blocks.py` confere
forma de bloco, `validate_cobertura_quiz.py` conta quizzes, `validate_labs_aws.py`
confere as três arquiteturas e a limpeza, `validate_servicos_diagrama.py` exige
`note` em nó e `label` em aresta. Um módulo raso passa em todos: os campos existem,
estão preenchidos, e não ensinam nada.

Este gate mede sinais que se correlacionam com PROFUNDIDADE. Ele não prova que o
módulo ensina — nenhum script prova isso, e é por isso que a revisão humana continua
sendo o critério final. Ele prova que o módulo não caiu em quatro padrões de
superficialidade que já apareceram em conteúdo real da plataforma, e que passariam
verdes em todo o resto.

Toda barra abaixo foi MEDIDA nos três laboratórios escritos à mão (L01, L02, L03)
antes de ser escrita. Nenhuma foi escolhida por parecer razoável: cada uma está
folgada em relação ao pior caso do que já existe, para reprovar degradação e não
reprovar variação de estilo. As bases estão anotadas em cada checagem.

Uso:
    python3 scripts/validate_barra_ensino.py            # relatório
    python3 scripts/validate_barra_ensino.py --strict   # falha
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARTIGOS = RAIZ / 'scripts/seeds/articles'
TRILHA = RAIZ / 'frontend/src/lib/curriculum/trails/trail-labs-aws.ts'

# Palavras que não contam como conteúdo ao medir o que uma `note` acrescenta. Sem
# esta lista, "para o que serve a peça" pareceria informação.
STOPWORDS = {
    'para', 'com', 'que', 'uma', 'dos', 'das', 'aqui', 'isso', 'essa', 'este',
    'esta', 'nao', 'sem', 'por', 'como', 'mais', 'onde', 'qual', 'quando', 'pelo',
    'pela', 'nos', 'nas', 'seu', 'sua', 'ele', 'ela', 'mesmo', 'todo', 'toda',
    'the', 'and', 'ser', 'tem', 'fica', 'vai', 'sao', 'esta', 'entre', 'cada',
}


def palavras(s: str) -> set[str]:
    """Conjunto de palavras de conteúdo, sem acento e sem as curtas."""
    s = unicodedata.normalize('NFD', (s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return {p for p in re.findall(r'[a-z0-9]{3,}', s) if p not in STOPWORDS}


def blocos(doc: dict):
    def andar(bs):
        for b in bs or []:
            yield b
            yield from andar(b.get('children'))
    return andar(doc.get('blocks'))


def blocos_com_secao(doc: dict):
    """(bloco, título da seção que o contém) — a seção dá o contexto da checagem."""
    def andar(bs, ctx=''):
        for b in bs or []:
            titulo = str((b.get('data') or {}).get('title') or '')
            atual = titulo if b.get('type') == 'section' else ctx
            yield b, atual
            yield from andar(b.get('children'), atual)
    return andar(doc.get('blocks'))


def slugs_da_trilha() -> list[str]:
    if not TRILHA.exists():
        return []
    return re.findall(r"slug:\s*'([^']+)'", TRILHA.read_text(encoding='utf-8'))


def conferir(slug: str) -> list[str]:
    caminho = ARTIGOS / f'{slug}.json'
    if not caminho.exists():
        return []  # ausência de seed é problema de outro gate
    doc = json.loads(caminho.read_text(encoding='utf-8'))
    falhas: list[str] = []

    # ── 1. `note` de nó tem de ACRESCENTAR ao rótulo ─────────────────────────
    #
    # `validate_servicos_diagrama.py` exige que a `note` exista. Existir não é
    # dizer nada: `label: "NAT Gateway"` com `note: "o NAT Gateway"` passa naquele
    # gate e ensina zero. A `note` serve para o PAPEL da peça no desenho — por que
    # ela está ali, o que ela decide, o que quebra sem ela.
    #
    # Base medida em 07/ago/2026: 48 nós nos três laboratórios, ZERO com menos de
    # 4 palavras novas. A barra de 4 está folgada e reprova nota decorativa.
    for b in blocos(doc):
        if b.get('type') not in ('arch_diagram', 'aws_diagram'):
            continue
        for g in (b.get('data') or {}).get('groups') or []:
            for n in g.get('nodes') or []:
                novas = palavras(n.get('note')) - palavras(n.get('label'))
                if len(novas) < 4:
                    falhas.append(
                        f'o nó "{n.get("label")}" tem `note` que acrescenta '
                        f'{len(novas)} palavra(s) ao rótulo — nota que repete o nome da '
                        f'peça passa no gate de diagrama e não diz o papel dela')

    # ── 2. Explicação de quiz trata os distratores ───────────────────────────
    #
    # É a parte que mais ensina, e a que mais degrada quando se escreve rápido:
    # "a alternativa B é a correta porque X" não trata os outros três, e o aluno
    # que errou não descobre onde o raciocínio dele furou.
    #
    # Base medida: 9 quizzes, explicação mais curta com 716 caracteres e mínimo de
    # 3 referências a distrator. As barras (350 e nº de opções − 1) ficam abaixo do
    # pior caso existente de propósito.
    for b in blocos(doc):
        if b.get('type') != 'quiz':
            continue
        d = b.get('data') or {}
        exp = d.get('explanation') or ''
        opcoes = len(d.get('options') or [])
        pergunta = (d.get('question') or '')[:60]
        refs = len(re.findall(
            r'\b(primeira|segunda|terceira|quarta|alternativa|distrator)\b', exp, re.I))
        if len(exp) < 350:
            falhas.append(f'o quiz "{pergunta}…" explica em {len(exp)} caracteres — '
                          f'não cabe tratar {max(opcoes - 1, 0)} distratores nisso')
        elif refs < max(opcoes - 1, 1):
            falhas.append(f'o quiz "{pergunta}…" cita {refs} distrator(es) para '
                          f'{max(opcoes - 1, 0)} errado(s) — quem errou não descobre onde '
                          f'o raciocínio dele furou')

    # ── 3. Requisito tem de dizer o que ele MUDA no desenho ──────────────────
    #
    # Lista de requisitos sem essa coluna é lista de desejos. A promessa da série é
    # que cada peça de produção rastreie a um requisito escrito, e essa coluna é o
    # outro lado da rastreabilidade. Os três laboratórios a escrevem como "O que
    # ele acrescenta/decide no desenho".
    achou_requisito = False
    for b, secao in blocos_com_secao(doc):
        if b.get('type') != 'comparison_table' or not re.search(r'requisito', secao, re.I):
            continue
        achou_requisito = True
        cols = ' '.join((b.get('data') or {}).get('columns') or [])
        if not re.search(r'desenho|decide|muda|influencia|acrescenta|arquitetura', cols, re.I):
            falhas.append(f'a tabela de requisitos tem colunas {cols!r} e nenhuma diz o '
                          f'que o requisito MUDA no desenho — sem isso é lista de desejos')
    if not achou_requisito:
        falhas.append('sem tabela na seção de requisitos — é onde cada peça de produção '
                      'ganha o requisito que a justifica')

    # ── 4. Anti-padrão tem de explicar POR QUE alguém faz ────────────────────
    #
    # Sem essa coluna o anti-padrão soa moralista e não muda comportamento. Quase
    # sempre a resposta é "porque é o menor número de linhas que funciona", e é
    # justamente reconhecer isso que faz o leitor se ver na descrição.
    for b, secao in blocos_com_secao(doc):
        if b.get('type') != 'comparison_table' or not re.search(r'anti-padr', secao, re.I):
            continue
        cols = ' '.join((b.get('data') or {}).get('columns') or [])
        if not re.search(r'por que algu[ée]m|por que se faz|por que fazem', cols, re.I):
            falhas.append(f'a tabela de anti-padrões tem colunas {cols!r} e nenhuma explica '
                          f'por que alguém faz — anti-padrão sem isso soa moralista')

    # ── 6. Orçamento de `danger`: o mais forte tem de ser raro ───────────────
    #
    # Achado da primeira leva escrita em PARALELO (07/ago/2026). Os três primeiros
    # laboratórios, escritos um a um, tinham 2, 2 e 3 callouts `danger`. Os seis
    # escritos em paralelo vieram com 4 a 8 — e a deriva não veio de descuido: cada
    # `danger` era substantivo, nomeando um achado real. O problema é de VOZ, não de
    # conteúdo: `danger` é o nível visual mais forte, e quando oito coisas são
    # vermelhas nenhuma é urgente. O leitor deixa de distinguir e passa a rolar.
    #
    # O critério de reserva é explícito: `danger` é para perda irreversível, dinheiro
    # queimando ou exposição de segurança. O resto é `warning` (cuidado que custa
    # retrabalho) ou `info` (explicação que ilumina). Na triagem dos seis, 9 dos 37
    # `danger` eram na verdade explicação ou requisito esquecido.
    #
    # O teto é 5, com folga sobre os 2–3 do trabalho manual, porque há módulos
    # genuinamente mais perigosos — recuperação de desastre e custo têm mais formas
    # de perder dado e queimar dinheiro do que um módulo de rede.
    perigos = [b for b in blocos(doc)
               if b.get('type') == 'callout' and (b.get('data') or {}).get('variant') == 'danger']
    if len(perigos) > 5:
        titulos = ', '.join(f'"{(b.get("data") or {}).get("title", "")[:34]}"' for b in perigos[:3])
        falhas.append(f'{len(perigos)} callouts `danger` (teto 5) — `danger` é para perda '
                      f'irreversível, dinheiro queimando ou exposição de segurança; o resto é '
                      f'`warning` ou `info`. Comece revendo: {titulos}')

    # ── 5. Prova por medição tem número ──────────────────────────────────────
    #
    # "Confirme que está funcionando" não é prova. A série promete entregável
    # verificável, e verificar é comparar com um número. Basta UM dígito na seção,
    # porque a intenção aqui é pegar a seção escrita em prosa vaga — não auditar
    # cada linha.
    for b in blocos(doc):
        if b.get('type') != 'section':
            continue
        titulo = str((b.get('data') or {}).get('title') or '')
        # "Construir: a ferramenta que PROVA a fronteira" é sobre CONSTRUIR, não
        # sobre executar a prova — achado no L43, onde essa seção legitimamente
        # não tem número (é código C# escrevendo um comparador) e a prova de
        # verdade mora, com números, numa seção "Implantar, e provar" separada,
        # que já existe no padrão. Seção que começa por "Construir:" fica de fora
        # daqui, mesmo mencionando "prova" como o que a peça construída FAZ.
        if re.match(r'construir\s*:', titulo, re.I):
            continue
        # Cada alternativa precisa da PRÓPRIA fronteira de palavra. Sem ela,
        # `provar` casava dentro de "aprovar" — e reprovou a seção "Onde mais IA
        # entra neste pipeline, e onde ela não pode aprovar" do L92, que não é
        # seção de prova e não tem por que ter número. Mesmo defeito do `\d`
        # solto que reprovou `lab-cache-redis-invalidacao-p95`: substring sem
        # fronteira encontra a palavra dentro de outra palavra.
        if not re.search(r'\b(prova|provar|implantar|medir|teste)', titulo, re.I):
            continue
        partes: list[str] = []

        def colher(v):
            if isinstance(v, str):
                partes.append(v)
            elif isinstance(v, list):
                for x in v:
                    colher(x)
            elif isinstance(v, dict):
                for k, x in v.items():
                    if k not in ('id', 'service', 'kind', 'src'):
                        colher(x)

        def andar(bs):
            for x in bs or []:
                colher(x.get('data') or {})
                andar(x.get('children'))
        colher(b.get('data') or {})
        andar(b.get('children'))
        texto = '\n'.join(partes)
        if not re.search(r'\d', texto):
            falhas.append(f'a seção "{titulo[:44]}" não tem um único número — prova sem '
                          f'número é afirmação, e a série promete entregável verificável')

    return falhas


def main() -> int:
    estrito = '--strict' in sys.argv
    slugs = slugs_da_trilha()

    print('=' * 74)
    print('BARRA DE ENSINO  série de laboratórios de arquitetura AWS')
    print('=' * 74)
    if not slugs:
        print('trilha não encontrada ou vazia — nada a conferir')
        return 0
    print(f'laboratórios na trilha: {len(slugs)}')
    print('(estrutura é conferida por outros gates; aqui é profundidade —')
    print(' e nenhum script prova que ensina, só que não caiu nos padrões conhecidos)')
    print()

    total = 0
    for slug in slugs:
        falhas = conferir(slug)
        total += len(falhas)
        print(f'  {"✓" if not falhas else "✗"} {slug}')
        for f in falhas[:8]:
            print(f'      {f}')
        if len(falhas) > 8:
            print(f'      … e {len(falhas) - 8} outro(s)')
    print()

    if total:
        print(f'✗ {total} sinal(is) de superficialidade')
        return 1 if estrito else 0
    print('✓ nota de nó acrescenta ao rótulo, quiz trata cada distrator, requisito diz o')
    print('  que muda no desenho, anti-padrão explica por que alguém faz, e prova tem número.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
