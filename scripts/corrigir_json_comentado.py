#!/usr/bin/env python3
"""Corrige `code_block` com `language: "json"` cujo comentário-cabeçalho
quebra o parse.

## O defeito

Medido em 12/ago/2026: **97 de 158** blocos `language: "json"` não fazem
`JSON.parse` — a maioria começa com uma ou mais linhas `// explicação antes
do JSON`, formato válido em JS/TS mas inválido em JSON estrito. Quem copia o
bloco e cola recebe erro de sintaxe na primeira tentativa — o oposto de
"prático e bem explicado".

## Escopo desta correção: só o padrão SEGURO

Dos 97, **47** seguem o padrão limpo "N linhas `//` no topo, resto é JSON
válido" — mecanicamente corrigível sem risco de corromper o conteúdo. Os
outros 50 são JSONL (um objeto por linha, não um documento único —
`golden_set.jsonl` é JSON Lines de propósito, não está quebrado), comentário
INLINE no meio do JSON (`"campo": "valor",  // nota` — remover por regex
arriscaria cortar `//` dentro de uma URL como `"https://..."`), ou dois
trechos concatenados no mesmo bloco. Nenhum desses tem correção mecânica
segura — ficam de fora desta rodada, documentados em PENDENCIAS.md.

## Onde o comentário extraído vai

O comentário carrega informação real (o que o JSON representa) — não pode só
desaparecer. Dois destinos, escolhidos por forma:

- **Curto e com cara de nome de arquivo** (`package.json`, `golden_set.jsonl`,
  `tsconfig.base.json (raiz)`) → campo `filename` do `code_block`
  (`CodeBlockSchema`, já existe, renderiza como cabeçalho da caixa de código).
- **Frase explicativa** → vira um `paragraph` novo, logo ANTES do
  `code_block`, na mesma lista de blocos — é exatamente o que já era: uma
  explicação em prosa, só que presa dentro do JSON por engano de formato.

## Uso
    python3 scripts/corrigir_json_comentado.py --dry-run
    python3 scripts/corrigir_json_comentado.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SEEDS = RAIZ / 'scripts' / 'seeds' / 'articles'

# Comentário curto o bastante e com extensão de arquivo reconhecível → filename.
RE_ARQUIVO = re.compile(
    r'^[\w./\-]+\.(json|jsonl|ts|tsx|py|yaml|yml|tf|tfvars|env)(\s*\([^)]*\))?$',
    re.IGNORECASE,
)

def texto_do_paragrafo(texto: str) -> dict:
    return {'type': 'paragraph', 'data': {'content': [{'text': texto}]}}

def extrair_comentario_lider(code: str) -> tuple[str, str] | None:
    """(comentário extraído, JSON restante) se o padrão for "N linhas // no
    topo, resto é JSON válido" — senão None."""
    linhas = code.split('\n')
    i = 0
    while i < len(linhas) and linhas[i].strip().startswith('//'):
        i += 1
    if i == 0:
        return None
    comentario = ' '.join(l.strip().lstrip('/').strip() for l in linhas[:i])
    resto = '\n'.join(linhas[i:]).lstrip('\n')
    try:
        json.loads(resto)
    except (json.JSONDecodeError, ValueError):
        return None
    return comentario, resto


def renumerar(lista):
    for pos, b in enumerate(lista):
        b['position'] = pos


def processar(doc: dict) -> list[str]:
    """Aplica a correção em `doc` (em memória) e devolve a lista de notas do
    que foi feito, para log. Modifica listas de blocos in-place — precisa
    caminhar rastreando (lista_pai, índice) pra poder inserir/renomear."""
    notas: list[str] = []

    def andar(lista):
        i = 0
        while i < len(lista):
            b = lista[i]
            if b.get('type') == 'code_block':
                d = b.get('data', {})
                if (d.get('language') or '').lower() == 'json':
                    code = d.get('code') or ''
                    ja_valido = True
                    try:
                        json.loads(code)
                    except (json.JSONDecodeError, ValueError):
                        ja_valido = False
                    if not ja_valido:
                        achado = extrair_comentario_lider(code)
                        if achado:
                            comentario, resto = achado
                            d['code'] = resto
                            if not d.get('filename') and RE_ARQUIVO.match(comentario):
                                d['filename'] = comentario
                                notas.append(f'{b.get("id")}: comentário → filename ({comentario!r})')
                            else:
                                lista.insert(i, texto_do_paragrafo(comentario))
                                renumerar(lista)
                                notas.append(f'{b.get("id")}: comentário → parágrafo antes do bloco')
                                i += 1  # pula o parágrafo recém-inserido
            filhos = b.get('children')
            if filhos:
                andar(filhos)
            i += 1

    andar(doc.get('blocks') or [])
    return notas


def main() -> int:
    dry = '--dry-run' in sys.argv
    tocados = 0
    total_notas = 0

    for caminho in sorted(SEEDS.glob('*.json')):
        doc = json.loads(caminho.read_text(encoding='utf-8'))
        notas = processar(doc)
        if notas:
            tocados += 1
            total_notas += len(notas)
            print(f'  {caminho.stem}:')
            for n in notas:
                print(f'    - {n}')
            if not dry:
                caminho.write_text(
                    json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    rotulo = 'SIMULAÇÃO' if dry else 'APLICADO'
    print(f'\ncorrigir_json_comentado: {rotulo} — {tocados} módulos, {total_notas} blocos corrigidos')
    return 0


if __name__ == '__main__':
    sys.exit(main())
