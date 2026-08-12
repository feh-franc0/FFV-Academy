#!/usr/bin/env python3
"""Extrai o currículo (hub -> trilha -> módulo, com `keywords`) para JSON.

Entrada do gerador de corpus de busca. Roda sozinho:

    python3 scripts/seo/extrair_curriculo.py

Escreve `scripts/seo/.dados/curriculo.json`. Não é fonte de verdade de nada —
é cache de leitura de `frontend/src/lib/curriculum/`.
"""
from __future__ import annotations
import json, pathlib, re

REPO = pathlib.Path(__file__).resolve().parents[2]
RAIZ = REPO / 'frontend' / 'src' / 'lib' / 'curriculum'
DADOS = pathlib.Path(__file__).parent / '.dados'
TRILHAS = RAIZ / 'trails'

def campo(bloco: str, nome: str):
    m = re.search(rf"{nome}:\s*'((?:[^'\\]|\\.)*)'", bloco)
    if m:
        return m.group(1).replace("\\'", "'")
    m = re.search(rf'{nome}:\s*"((?:[^"\\]|\\.)*)"', bloco)
    return m.group(1).replace('\\"', '"') if m else None

# ordem de import = ordem do currículo
ordem = re.findall(r"from '\./(trail[a-z0-9-]*)'", (TRILHAS / 'index.ts').read_text(encoding='utf-8'))

trilhas = []
for nome in ordem:
    src = (TRILHAS / f'{nome}.ts').read_text(encoding='utf-8')
    cab = src[:src.index('modules:')]
    t = {
        'file': nome,
        'id': campo(cab, 'id'),
        'name': campo(cab, 'name'),
        'desc': campo(cab, 'desc'),
        'href': campo(cab, 'href'),
        'level': campo(cab, 'level'),
        'modules': [],
    }
    corpo = src[src.index('modules:'):]
    # cada módulo começa em `slug:`
    # Duas convenções convivem no repositório: módulo em bloco multilinha e
    # módulo em uma linha só (`{ slug: ..., title: ... }`). Delimitar por
    # `slug:` cobre as duas — a primeira versão só cobria a multilinha e
    # perdeu 129 módulos em silêncio.
    pos = [m.start() for m in re.finditer(r'\bslug:', corpo)]
    for i, p in enumerate(pos):
        f = pos[i + 1] if i + 1 < len(pos) else len(corpo)
        b = corpo[p:f]
        t['modules'].append({
            'slug': campo(b, 'slug'),
            'title': campo(b, 'title'),
            'desc': campo(b, 'desc'),
            'keywords': campo(b, 'keywords') or '',
            'level': campo(b, 'level'),
            'readTime': int(re.search(r'readTime:\s*(\d+)', b).group(1)) if re.search(r'readTime:\s*(\d+)', b) else None,
        })
    trilhas.append(t)

hubsrc = (RAIZ / 'hubs.ts').read_text(encoding='utf-8')
hubs = []
for bloco in re.split(r'\n  \{', hubsrc)[1:]:
    ids = re.search(r"trailIds:\s*\[([^\]]*)\]", bloco)
    hubs.append({
        'id': campo(bloco, 'id'),
        'name': campo(bloco, 'name'),
        'slug': campo(bloco, 'slug'),
        'tagline': campo(bloco, 'tagline'),
        'trailIds': re.findall(r"'([^']+)'", ids.group(1)) if ids else [],
    })

saida = {'hubs': hubs, 'trails': trilhas}
DADOS.mkdir(exist_ok=True)
p = DADOS / 'curriculo.json'
p.write_text(json.dumps(saida, ensure_ascii=False, indent=1))
tot = sum(len(t['modules']) for t in trilhas)
print(f'{len(hubs)} hubs · {len(trilhas)} trilhas · {tot} módulos → {p}')
faltando = [m['slug'] for t in trilhas for m in t['modules'] if not m['title'] or not m['desc']]
print('sem título/desc:', faltando or 'nenhum')
