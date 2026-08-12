#!/usr/bin/env python3
"""Gate: nenhum conteúdo escrito pode ficar invisível na página.

─── O defeito que este gate existe para impedir ───

Os gates anteriores verificam se o bloco é VÁLIDO. Nenhum verificava se ele tem
CONTEÚDO. A diferença apareceu em ago/2026, varrendo os 393 seeds: mais de 1.300
campos escritos por autor não chegavam a nenhuma página, em mais de 100 módulos.

A mecânica: os primitives em `primitives.tsx` aceitam vários nomes de campo (o
`StackFlow` lê `detail`, `sub`, `icon`, `connector`; o `AnnotatedFormula` lê
`text` e `annotation`; o `ArchFlow` lê `header` e `footer`). Os adapters em
`BlockRenderer.tsx` achatavam o dado para um subconjunto antes de entregar, e o
que ficava fora era descartado em silêncio. Nada quebrava — o bloco renderizava,
só sem parte do conteúdo. O caso mais grave era `annotated_formula`: 148 das 197
anotações saíam com todos os campos visíveis vazios, ou seja, 19 módulos exibiam
a fórmula seguida de uma caixa em branco.

Zod não pega porque a forma é válida. Teste de render não pega porque o
componente monta. Revisão visual não pega porque ninguém abre 393 páginas.

─── O que este gate acusa, e o que ele não acusa ───

ERRO: o campo visível sai vazio E o autor escreveu texto numa chave que o adapter
não lê. Isso é conteúdo perdido — sempre um defeito de código.

OK: o campo sai vazio porque o autor não escreveu nada ali. É uma escolha
editorial (uma alternativa sem desvantagem declarada, por exemplo), não um bug.

Uso:
    python3 scripts/validate_primitives_render.py
    python3 scripts/validate_primitives_render.py --detalhes
"""
from __future__ import annotations

import collections
import json
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SEEDS = RAIZ / 'scripts' / 'seeds' / 'articles'

# tipo -> (campo que contém a lista, [(campo visível, chaves que o adapter lê)])
#
# Espelha o mapeamento de BlockRenderer.tsx. Mudou o adapter? Mude aqui na mesma
# alteração — é a única forma de o gate continuar dizendo a verdade.
CONTRATO: dict[str, tuple[str, list[tuple[str, tuple[str, ...]]]]] = {
    'decision_box': ('alternatives', [
        ('name', ('name', 'label')),
        ('downside', ('downside', 'note', 'when')),
    ]),
    'stack_flow': ('items', [
        # O rótulo assume o corpo quando não há rótulo próprio; basta um dos dois.
        ('label/corpo', ('label', 'layer', 'title',
                         'detail', 'text', 'body', 'desc', 'description')),
        ('sub', ('sub', 'tech')),
    ]),
    'flow_diagram': ('steps', [
        ('label', ('label', 'title', 'text')),
        ('desc', ('desc', 'body', 'subtitle', 'detail')),
    ]),
    'annotated_formula': ('parts', [
        ('text', ('text', 'symbol')),
        ('annotation', ('annotation', 'description')),
        ('name', ('name',)),
        ('label', ('label',)),
        ('note', ('note',)),
    ]),
    'timeline': ('events', [
        ('when', ('when', 'date')),
        ('label', ('label', 'title')),
        ('detail', ('detail', 'body', 'description')),
    ]),
    'arch_flow': ('columns', [
        ('title', ('title', 'header')),
        ('footer', ('footer',)),
    ]),
    'node_graph': ('columns', [
        ('title', ('title', 'label')),
    ]),
    'layer_stack': ('layers', [
        ('label', ('label', 'title')),
        ('corpo', ('instruction', 'body', 'content')),
        ('note', ('note', 'badge')),
    ]),
    'key_value': ('items', [
        ('k', ('k', 'key')),
        ('v', ('v', 'value')),
    ]),
    'qa_item': (None, [
        ('question', ('question',)),
        ('answer', ('answer',)),
    ]),
}

# Nós aninhados que o adapter mapeia dentro de um item da lista.
ANINHADOS: dict[str, tuple[str, str, list[tuple[str, tuple[str, ...]]]]] = {
    # tipo: (campo lista, campo lista interna, campos visíveis)
    'node_graph': ('columns', 'nodes', [
        ('label', ('label', 'title')),
        ('sub', ('sub', 'note')),
    ]),
}


def texto(v: object) -> str:
    return v.strip() if isinstance(v, str) else ''


def achou(item: dict, chaves: tuple[str, ...]) -> bool:
    return any(texto(item.get(k)) for k in chaves)


# Chaves que existem no dado mas são de apresentação, não de conteúdo — não
# aparecem como texto e a ausência delas não é perda.
DECORATIVAS = {'tone', 'color', 'highlight', 'icon', 'headerColor',
               'separatorAfter', 'connector', 'variant'}


def perdidas(item: dict, campos: list[tuple[str, tuple[str, ...]]]) -> list[str]:
    """Chaves com texto que NENHUM campo visível deste item lê.

    A definição importa. Contar `name` como perdido só porque o campo `downside`
    não o lê produziria 72 falsos positivos: `name` é lido, por outro campo do
    mesmo item. Perda é texto que não tem nenhum destino na tela.
    """
    lidas = {k for _, chaves in campos for k in chaves} | DECORATIVAS
    return sorted(k for k, v in item.items() if k not in lidas and texto(v))


def main() -> int:
    detalhes = '--detalhes' in sys.argv
    perdas: list[tuple[str, str, str, list[str]]] = []
    omissoes: collections.Counter[str] = collections.Counter()
    total: collections.Counter[str] = collections.Counter()

    def conferir(slug: str, rotulo: str, item: dict,
                 campos: list[tuple[str, tuple[str, ...]]]) -> None:
        total[rotulo] += 1

        orfas = perdidas(item, campos)
        if orfas:
            perdas.append((slug, rotulo, '', orfas))

        for visivel, chaves in campos:
            if not achou(item, chaves):
                omissoes[f'{rotulo}.{visivel}'] += 1

    for arq in sorted(SEEDS.glob('*.json')):
        if arq.name.startswith('_'):
            continue
        doc = json.loads(arq.read_text())
        slug = arq.stem

        def andar(bs: list[dict]) -> None:
            for b in bs:
                tp = b.get('type')
                dados = b.get('data') or {}

                if tp in CONTRATO:
                    campo_lista, campos = CONTRATO[tp]
                    if campo_lista is None:
                        conferir(slug, tp, dados, campos)
                    else:
                        for item in dados.get(campo_lista) or []:
                            if isinstance(item, dict):
                                conferir(slug, tp, item, campos)

                if tp in ANINHADOS:
                    externo, interno, campos = ANINHADOS[tp]
                    for pai in dados.get(externo) or []:
                        if not isinstance(pai, dict):
                            continue
                        for filho in pai.get(interno) or []:
                            if isinstance(filho, dict):
                                conferir(slug, f'{tp}.{interno}', filho, campos)

                andar(b.get('children') or [])

        andar(doc.get('blocks') or [])

    if perdas:
        print(f'\n\033[31m{len(perdas)} campo(s) com conteúdo escrito que a '
              f'página NÃO mostra:\033[0m\n')
        agrupado: dict[str, list[tuple[str, list[str]]]] = collections.defaultdict(list)
        for slug, chave, _, resto in perdas:
            agrupado[chave].append((slug, resto))
        for chave, casos in sorted(agrupado.items(), key=lambda x: -len(x[1])):
            modulos = sorted({s for s, _ in casos})
            print(f'  {chave}: {len(casos)} item(ns) em {len(modulos)} módulo(s)')
            chaves_ignoradas = collections.Counter(
                tuple(r) for _, r in casos)
            for ks, n in chaves_ignoradas.most_common(3):
                print(f'      {n:4}x o autor escreveu em {list(ks)}')
            if detalhes:
                for m in modulos[:10]:
                    print(f'      · {m}')
        print('\nFix: ampliar o mapeamento do adapter em BlockRenderer.tsx para ler')
        print('essas chaves — os primitives em primitives.tsx costumam já aceitá-las.')
        print('Depois atualize CONTRATO neste script na mesma alteração.\n')
        return 1

    print(f'✅ {sum(total.values())} itens de primitive conferidos — '
          f'nenhum conteúdo escrito fica invisível.')
    if omissoes:
        vazio = sum(omissoes.values())
        print(f'   ({vazio} campos vazios por escolha do autor, não por perda — '
              f'maior: {omissoes.most_common(1)[0][0]})')
    return 0


if __name__ == '__main__':
    sys.exit(main())
