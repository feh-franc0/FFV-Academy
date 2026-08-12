#!/usr/bin/env python3
"""
Redistribui a posição do gabarito dos quizzes dos seeds.

## O defeito

Medido em 12/ago/2026: 1.363 de 1.472 quizzes (92,6%) tinham a resposta
correta no índice 1; o índice 3 aparecia 2 vezes (0,1%). Em 410 dos 490
módulos as TRÊS corretas estavam na mesma posição. Quem marcasse sempre a
segunda alternativa acertava 93% sem ler o enunciado — e como o quiz é a
única fonte de cartas do SRS (`addCardsFromQuiz`, e `createCard` guarda
`options`/`correct` na ordem original), cada revisão espaçada reforçava o
artefato.

## O que este script NÃO resolve

O segundo vazamento, independente: a correta é a alternativa mais longa em
93,4% dos casos (135 caracteres contra 51 dos distratores). Isso é
redacional — a correta carrega o mecanismo, o distrator é frase nominal
curta — e exige reescrever 4.416 distratores, um a um. Embaralhar a posição
NÃO ajuda nisso. O ratchet em `validate_quiz_respondivel.py` mede essa
dívida separadamente.

## Determinismo E IDEMPOTÊNCIA (a segunda é a que quase me escapou)

O índice de destino vem de um SHA-256 de (slug + texto da pergunta), não de
`random` sem semente. Mas determinismo sozinho NÃO basta: a primeira versão
deste script aplicava uma PERMUTAÇÃO determinística sobre a ordem atual, e
rodar duas vezes compunha a permutação consigo mesma — resultado diferente a
cada execução, diff novo nos 490 arquivos toda vez, e `content_hash`
oscilando sem que o conteúdo tivesse mudado de fato.

A versão correta não permuta: ela CALCULA UM DESTINO e move a alternativa
correta para lá, preservando a ordem relativa das outras. Se a correta já
está no destino, nada muda. Rodar N vezes tem o mesmo efeito de rodar uma —
verificável com `--check`.

## Efeito colateral que você precisa saber

Reordenar `options` muda o conteúdo normalizado do bloco, logo muda o
`content_hash` calculado por `backend/cmd/importer/hash.go` e move o
`updated_at` do artigo — ou seja, o `lastmod` de ~490 URLs no sitemap.
É uma mudança real de conteúdo (a alternativa mudou de lugar), então o
sinal é verdadeiro, mas ele chega de uma vez para o acervo inteiro.

## Uso
    python3 scripts/corrigir_gabarito_quiz.py --dry-run   # mostra o efeito
    python3 scripts/corrigir_gabarito_quiz.py             # aplica
"""

import glob
import hashlib
import json
import os
import sys
from collections import Counter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEEDS = os.path.join(RAIZ, "scripts", "seeds", "articles")


def destino(chave: str, n: int) -> int:
    """
    Índice de destino da alternativa correta, derivado de `chave`.

    SHA-256 em vez de `hash()`: `hash()` de str é aleatorizado por processo
    (PYTHONHASHSEED) e daria resultado diferente a cada execução.
    """
    h = hashlib.sha256(chave.encode("utf-8")).digest()
    return int.from_bytes(h[:4], "big") % n


def blocos(bs):
    for b in bs:
        yield b
        for filho in b.get("children") or []:
            yield from blocos([filho])


def main():
    dry = "--dry-run" in sys.argv
    antes, depois = Counter(), Counter()
    arquivos_tocados = 0
    quizzes = 0

    for caminho in sorted(glob.glob(os.path.join(SEEDS, "*.json"))):
        slug = os.path.basename(caminho)[:-5]
        doc = json.load(open(caminho, encoding="utf-8"))
        mudou = False

        for b in blocos(doc.get("blocks") or []):
            if b.get("type") != "quiz":
                continue
            d = b.get("data") or {}
            opts, ci = d.get("options"), d.get("correctIndex")
            if not opts or ci is None or not (0 <= ci < len(opts)):
                continue

            quizzes += 1
            antes[ci] += 1
            n = len(opts)
            # A chave inclui a pergunta: dois quizzes do mesmo módulo caem em
            # destinos independentes, e editar a pergunta pode remanejar
            # (aceitável — é conteúdo novo).
            alvo = destino(f"{slug}::{d.get('question', '')}", n)

            # Move a correta para `alvo` preservando a ordem relativa das
            # demais. Idempotente: se ela já está lá, `novas == opts`.
            correta = opts[ci]
            resto = [o for i, o in enumerate(opts) if i != ci]
            novas = resto[:alvo] + [correta] + resto[alvo:]
            depois[alvo] += 1

            if novas != opts or alvo != ci:
                d["options"] = novas
                d["correctIndex"] = alvo
                mudou = True

        if mudou:
            arquivos_tocados += 1
            if not dry:
                with open(caminho, "w", encoding="utf-8") as f:
                    json.dump(doc, f, ensure_ascii=False, indent=2)
                    f.write("\n")

    rotulo = "SIMULAÇÃO (nada escrito)" if dry else "APLICADO"
    print(f"corrigir_gabarito_quiz: {rotulo}")
    print(f"  quizzes: {quizzes}   arquivos afetados: {arquivos_tocados}\n")
    print("  índice | antes            | depois")
    for i in range(4):
        a, dd = antes.get(i, 0), depois.get(i, 0)
        print(f"    {i}    | {a:5d} ({a/quizzes*100:5.1f}%) | {dd:5d} ({dd/quizzes*100:5.1f}%)")
    pior = max(depois.values()) / quizzes
    print(f"\n  maior concentração depois: {pior*100:.1f}%  (acaso = 25%)")


if __name__ == "__main__":
    main()
