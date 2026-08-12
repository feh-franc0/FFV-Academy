"""Insere `arch_diagram` em seed existente, renumerando id/position.

Recriado depois de o scratchpad ser perdido. Segue o contrato do PADRAO_ENSINO.md:
caption dizendo o que concluir, 5-6 passos percorríveis, 3-4 grupos.
"""
from __future__ import annotations

import json
import os
import pathlib

SEEDS = str(pathlib.Path(__file__).resolve().parents[2] / 'scripts' / 'seeds' / 'articles')


def diagrama(titulo, grupos, arestas, passos=None, legenda=None):
    """grupos:  [(label, kind, [(id, service, label|None, note|None)])]
       arestas: [(from, to, label|None, style|None)]
       passos:  [(label, detail, [ids], [(a, b), ...])]"""
    gs = []
    for label, kind, nos in grupos:
        ns = []
        for no in nos:
            d = {'id': no[0], 'service': no[1]}
            if len(no) > 2 and no[2]:
                d['label'] = no[2]
            if len(no) > 3 and no[3]:
                d['note'] = no[3]
            ns.append(d)
        gs.append({'label': label, 'kind': kind, 'nodes': ns})

    es = []
    for ar in arestas:
        d = {'from': ar[0], 'to': ar[1]}
        if len(ar) > 2 and ar[2]:
            d['label'] = ar[2]
        if len(ar) > 3 and ar[3]:
            d['style'] = ar[3]
        es.append(d)

    data = {'title': titulo, 'groups': gs, 'edges': es}
    if legenda:
        data['caption'] = legenda
    if passos:
        data['steps'] = [{'label': l, 'detail': det, 'nodes': ns,
                          'edges': [f'{x}>{y}' for x, y in eds]}
                         for l, det, ns, eds in passos]
    return {'type': 'arch_diagram', 'data': data}


def _renumerar(blocos, prefixo, cont):
    for pos, b in enumerate(blocos):
        b['id'] = f'{prefixo}-{cont[0]}'
        cont[0] += 1
        b['position'] = pos
        if 'children' in b:
            _renumerar(b['children'], prefixo, cont)


def inserir_em_secao(slug, titulo_secao, bloco, depois_de=0):
    caminho = os.path.join(SEEDS, f'{slug}.json')
    with open(caminho, encoding='utf-8') as f:
        doc = json.load(f)

    alvo = None
    for b in doc['blocks']:
        if b.get('type') == 'section' and b.get('data', {}).get('title') == titulo_secao:
            alvo = b
            break
    if alvo is None:
        disp = [b.get('data', {}).get('title') for b in doc['blocks'] if b['type'] == 'section']
        raise AssertionError(f'{slug}: seção {titulo_secao!r} não achada. Existentes: {disp}')

    filhos = alvo.setdefault('children', [])
    filhos.insert(min(depois_de + 1, len(filhos)), bloco)

    _renumerar(doc['blocks'], 'd' + str(abs(hash(slug)) % 9973), [0])
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    return f'{slug} · "{titulo_secao}"'
