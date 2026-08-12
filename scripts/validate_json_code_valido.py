#!/usr/bin/env python3
"""Gate ratchet: blocos `code_block` com `language: "json"` que não fazem parse.

## O defeito

Medido em 12/ago/2026: 97 de 158 blocos `language: "json"` não faziam
`JSON.parse` — a maioria começava com `// comentário explicativo` antes do
JSON, formato inválido em JSON estrito. Quem copia o bloco pra testar recebe
erro de sintaxe na primeira tentativa.

## O que já foi corrigido, e o que não foi

`scripts/corrigir_json_comentado.py` consertou os **47** casos do padrão
seguro (só comentário-cabeçalho, resto é JSON válido) — moveu o comentário
pra `filename` (se tinha cara de nome de arquivo) ou pra um parágrafo antes
do bloco. Ficaram **48** que não têm correção mecânica segura: comentário
INLINE no meio do JSON (`"campo": "valor",  // nota` — remover por regex
arriscaria cortar `//` dentro de uma URL) ou trechos concatenados no mesmo
bloco. Documentado em PENDENCIAS.md.

## Por que ratchet, e a exceção do JSONL

Corrigir os 48 restantes é edição por bloco, não script — mesmo argumento de
`TETO_MAIS_LONGA` em `validate_quiz_respondivel.py`. O teto só desce.

JSON Lines (`golden_set.jsonl` etc. — um objeto por LINHA, não um documento
único) não é um defeito: é um formato legítimo marcado com a linguagem
"json" por falta de opção melhor no destaque de sintaxe. Este gate reconhece
o padrão (cada linha não-comentário faz parse individualmente) e não conta
como quebrado.

Uso:
    python3 scripts/validate_json_code_valido.py           # relatório
    python3 scripts/validate_json_code_valido.py --strict  # aplica o gate
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SEEDS = RAIZ / 'scripts' / 'seeds' / 'articles'

# Ratchet — só pode DESCER. Medido em 12/ago/2026, depois de
# corrigir_json_comentado.py: 48 blocos sem correção mecânica segura.
TETO = 48


def walk(bs):
    for b in bs:
        yield b
        for c in b.get('children') or []:
            yield from walk([c])


def eh_jsonl(code: str) -> bool:
    linhas = [l for l in code.split('\n') if l.strip() and not l.strip().startswith('//')]
    if len(linhas) < 2:
        return False
    for l in linhas:
        try:
            json.loads(l)
        except (json.JSONDecodeError, ValueError):
            return False
    return True


def main() -> int:
    strict = '--strict' in sys.argv
    quebrados: list[str] = []
    total = 0

    for caminho in sorted(SEEDS.glob('*.json')):
        doc = json.loads(caminho.read_text(encoding='utf-8'))
        for b in walk(doc.get('blocks') or []):
            if b.get('type') != 'code_block':
                continue
            d = b.get('data', {})
            if (d.get('language') or '').lower() != 'json':
                continue
            total += 1
            code = d.get('code') or ''
            try:
                json.loads(code)
                continue
            except (json.JSONDecodeError, ValueError):
                pass
            if eh_jsonl(code):
                continue
            quebrados.append(f'{caminho.stem}:{b.get("id")}')

    n = len(quebrados)
    print(f'validate_json_code_valido: {n}/{total} blocos "json" não fazem parse (teto {TETO})')

    if n > TETO:
        print(f'\nvalidate_json_code_valido: REPROVADO — regressão de {n - TETO}\n', file=sys.stderr)
        for q in quebrados:
            print(f'  - {q}', file=sys.stderr)
        if strict:
            sys.exit(1)
        return 0

    if n < TETO:
        print(f'  dívida caiu — desça TETO para {n} em scripts/validate_json_code_valido.py '
              f'para travar o ganho.')
    print('validate_json_code_valido: OK')
    return 0


if __name__ == '__main__':
    sys.exit(main())
