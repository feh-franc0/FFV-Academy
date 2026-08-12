#!/usr/bin/env python3
"""Verifica se os links externos citados na documentação de fato resolvem.

## Por que existe

Em 05/ago/2026 o catálogo de 100 soluções e os documentos de pesquisa passaram a
citar dezenas de URLs externas como fonte. Nenhuma tinha sido verificada — e link
de fonte que responde 404 é pior que fonte ausente: ele dá aparência de
verificabilidade a uma afirmação que ninguém pode conferir.

## Por que NÃO está no CI

Ele depende de rede externa, de disponibilidade de terceiro e de bloqueio por
agente. Gate que falha porque um blog está fora do ar hoje ensina o time a
desligar gate. A verificação é sob demanda, e o que ENTRA no CI é o teste de
FORMA (`links-citados.test.ts`): sem placeholder, sem página de categoria
sustentando afirmação específica, e data de última verificação registrada.

Uso:
    python3 scripts/validar_links_externos.py            # verifica tudo
    python3 scripts/validar_links_externos.py --arquivo docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md
"""
from __future__ import annotations

import argparse
import concurrent.futures
import pathlib
import re
import sys
import urllib.error
import urllib.request

RAIZ = pathlib.Path(__file__).resolve().parents[1]

# Documentos que citam fonte externa e devem ser verificados.
DOCS = [
    'docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md',
    'PESQUISA_DEMANDA_BUSCA_2026-08.md',
    'ESTRATEGIA_SEO_ORGANICO_2026-08.md',
]

# Alguns hosts recusam requisição sem navegador. Não é link morto: é bloqueio.
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')

LINK = re.compile(r'\[([^\]]+)\]\((https?://[^)\s]+)\)')


def conferir(url: str) -> tuple[str, int | str]:
    """Devolve (url, status). Status é int de HTTP ou string de erro."""
    req = urllib.request.Request(url, headers={'User-Agent': UA}, method='GET')
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return url, r.status
    except urllib.error.HTTPError as e:
        return url, e.code
    except Exception as e:  # rede, TLS, DNS, timeout
        return url, type(e).__name__


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--arquivo', action='append')
    args = ap.parse_args()
    docs = args.arquivo or DOCS

    citacoes: dict[str, list[tuple[str, str]]] = {}
    for rel in docs:
        p = RAIZ / rel
        if not p.exists():
            print(f'⚠️  {rel} não existe')
            continue
        for texto, url in LINK.findall(p.read_text(encoding='utf-8')):
            citacoes.setdefault(url, []).append((rel, texto))

    print(f'{len(citacoes)} URLs distintas em {len(docs)} documentos\n')

    resultados: dict[str, int | str] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        for url, status in ex.map(conferir, citacoes):
            resultados[url] = status

    ok, bloqueado, quebrado = [], [], []
    for url, status in sorted(resultados.items()):
        if status == 200:
            ok.append(url)
        elif status in (403, 401, 429) or isinstance(status, str):
            bloqueado.append((url, status))
        else:
            quebrado.append((url, status))

    print(f'✅ {len(ok)} respondem 200')

    if bloqueado:
        print(f'\n🟡 {len(bloqueado)} inconclusivos (bloqueio de agente, TLS ou tempo esgotado):')
        for url, s in bloqueado:
            print(f'   [{s}] {url}')
        print('   → conferir à mão; não é prova de link morto')

    if quebrado:
        print(f'\n❌ {len(quebrado)} QUEBRADOS:')
        for url, s in quebrado:
            print(f'   [{s}] {url}')
            for rel, texto in citacoes[url]:
                print(f'        {rel} → "{texto[:70]}"')
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
