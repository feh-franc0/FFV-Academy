#!/usr/bin/env python3
"""
Gate: o quiz não pode ser acertável sem ler o enunciado.

## O defeito que este gate previne

Medido em 12/ago/2026, sobre os 1.472 quizzes dos seeds, DOIS vazamentos
independentes tornavam o gabarito adivinhável:

  1. POSIÇÃO — 92,6% das corretas no índice 1 (1.363 de 1.472). O índice 3
     tinha 2 ocorrências em 1.472 (0,1%). Em 410 dos 490 módulos (83,7%) as
     TRÊS corretas estavam na mesma posição.
  2. COMPRIMENTO — a correta era a alternativa mais longa em 93,4% dos casos
     (acaso = 25%): 135 caracteres de média contra 51 dos distratores. Causa
     redacional: a correta carrega o mecanismo embutido ("...porque o custo
     cresce com o quadrado da conversa") enquanto os distratores são frases
     nominais de 4 palavras.

Combinados, "marque a B ou a mais longa" acertava ~98% dos quizzes.

Por que isso é grave nesta plataforma especificamente: o quiz é a ÚNICA
fonte de cartas do SRS (`addCardsFromQuiz` em `engine.ts`), e `createCard`
guarda `options` e `correct` na ORDEM ORIGINAL. Cada revisão espaçada
re-apresentava o mesmo artefato — o SM-2, vendido como o diferencial da
escola, treinava reconhecimento de formato em vez de conteúdo.

O `frontend/CLAUDE.md` já registra um banco de simulados com 87% das
corretas numa letra como defeito conhecido e corrigido. Os SEEDS estavam
pior (92,6%) e ninguém media — o gate de simulado (`validate_question_bank.py`)
cobre `frontend/data/question-bank/`, não os quizzes de módulo.

## O que este gate cobra

- POSIÇÃO: nenhum índice pode concentrar mais que MAX_POSICAO dos gabaritos.
  Limite fixo, não ratchet — é mecanicamente corrigível (embaralhar).
- COMPRIMENTO: % em que a correta é a mais longa. É RATCHET (TETO_MAIS_LONGA),
  porque corrigir exige reescrever distrator por distrator — 4.416 deles — e
  é trabalho de redação técnica, não conversão mecânica. O teto só desce.

## Uso
    python3 scripts/validate_quiz_respondivel.py            # relatório + gate
    python3 scripts/validate_quiz_respondivel.py --verbose  # pior caso por módulo
"""

import json
import glob
import os
import sys
from collections import Counter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEEDS = os.path.join(RAIZ, "scripts", "seeds", "articles")

# Nenhuma posição pode passar disto. Com 4 alternativas o acaso é 25%; 35% dá
# folga para variação honesta sem permitir concentração.
MAX_POSICAO = 0.35

# Ratchet — só pode DESCER. Medido em 12/ago/2026: 1.375/1.472 = 93,41%.
TETO_MAIS_LONGA = 0.935


def blocos(bs):
    """Achata a árvore de blocos em ordem de leitura."""
    for b in bs:
        yield b
        for filho in b.get("children") or []:
            yield from blocos([filho])


def coletar():
    quizzes = []
    for caminho in sorted(glob.glob(os.path.join(SEEDS, "*.json"))):
        slug = os.path.basename(caminho)[:-5]
        try:
            doc = json.load(open(caminho, encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"validate_quiz_respondivel: JSON inválido em {slug}: {e}", file=sys.stderr)
            sys.exit(1)
        for b in blocos(doc.get("blocks") or []):
            if b.get("type") != "quiz":
                continue
            d = b.get("data") or {}
            opts, ci = d.get("options"), d.get("correctIndex")
            if not opts or ci is None or ci >= len(opts):
                continue
            quizzes.append((slug, [str(o) for o in opts], int(ci)))
    return quizzes


def main():
    verbose = "--verbose" in sys.argv
    quizzes = coletar()
    if not quizzes:
        print("validate_quiz_respondivel: nenhum quiz encontrado — seeds movidos?", file=sys.stderr)
        sys.exit(1)

    n = len(quizzes)
    pos = Counter(ci for _, _, ci in quizzes)
    mais_longa = 0
    por_modulo = Counter()
    for slug, opts, ci in quizzes:
        tamanhos = [len(o) for o in opts]
        if tamanhos[ci] == max(tamanhos) and tamanhos.count(max(tamanhos)) == 1:
            mais_longa += 1
            por_modulo[slug] += 1

    frac_longa = mais_longa / n
    falhas = []

    print(f"validate_quiz_respondivel: {n} quizzes em {len(set(s for s, _, _ in quizzes))} módulos\n")
    print("  Distribuição do gabarito (acaso = 25%):")
    for i in sorted(pos):
        frac = pos[i] / n
        marca = "  <-- CONCENTRADO" if frac > MAX_POSICAO else ""
        print(f"    índice {i}: {pos[i]:5d}  {frac*100:5.1f}%{marca}")
        if frac > MAX_POSICAO:
            falhas.append(
                f"índice {i} concentra {frac*100:.1f}% dos gabaritos (máximo {MAX_POSICAO*100:.0f}%). "
                f"Quem marca sempre a mesma posição acerta {frac*100:.0f}% sem ler."
            )
    for i in range(4):
        if pos.get(i, 0) == 0:
            falhas.append(f"índice {i} nunca é a resposta correta — a posição vira informação.")

    print(f"\n  Correta é a alternativa MAIS LONGA: {mais_longa}/{n} = {frac_longa*100:.1f}%  (teto {TETO_MAIS_LONGA*100:.1f}%)")
    if frac_longa > TETO_MAIS_LONGA:
        falhas.append(
            f"regressão no vazamento por comprimento: {frac_longa*100:.1f}% > teto {TETO_MAIS_LONGA*100:.1f}%. "
            f"Distrator novo precisa ter o mesmo peso da correta — frase nominal de 4 palavras contra "
            f"explicação com mecanismo entrega o gabarito."
        )
    elif frac_longa < TETO_MAIS_LONGA - 0.005:
        print(
            f"    dívida caiu — desça TETO_MAIS_LONGA para {frac_longa:.3f} "
            f"em scripts/validate_quiz_respondivel.py para travar o ganho."
        )

    if verbose and por_modulo:
        print("\n  Módulos com os 3 quizzes vazando por comprimento:")
        for slug, c in sorted(por_modulo.items(), key=lambda x: -x[1])[:25]:
            if c >= 3:
                print(f"    {slug} ({c})")

    if falhas:
        print("\nvalidate_quiz_respondivel: REPROVADO\n", file=sys.stderr)
        for f in falhas:
            print(f"  - {f}", file=sys.stderr)
        print(
            "\n  O quiz é a única fonte de cartas do SRS (regra 2 do PADRAO_ENSINO.md). "
            "Gabarito adivinhável faz o SM-2 treinar reconhecimento de formato, não de conteúdo.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("\nvalidate_quiz_respondivel: OK")


if __name__ == "__main__":
    main()
