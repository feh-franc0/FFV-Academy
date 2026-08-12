#!/usr/bin/env python3
"""Gate: recuperação (quiz) não pode estar 100% concentrada no fim do módulo.

## O defeito que este gate previne

Medido em 12/ago/2026: 95,8% dos 1.472 quizzes estavam no último quarto do
módulo, e 94,7% dos módulos tinham OS TRÊS quizzes acima de 0,75 da posição
de leitura — não é prática de recuperação distribuída, é uma sessão única de
3 perguntas coladas no fim. A regra 2 do PADRAO_ENSINO.md justifica o quiz
por *retrieval practice*, e o posicionamento prescrito ("Fixando antes do
callout final") produzia o oposto do que a própria regra invoca.

Corrigido em 12/ago/2026 por `scripts/distribuir_quiz_no_meio.py`: move 1 dos
3 quizzes de "Fixando" pra logo depois da seção do meio do módulo, preservando
a ordem relativa entre os 3 (e portanto o id da carta de SRS — ver a docstring
daquele script).

## O que este gate cobra

Para todo módulo com ≥2 quizzes: pelo menos 1 deles precisa estar ANTES do
limiar (posição relativa < `LIMIAR_META`). Não cobra TODOS distribuídos — só
que a recuperação não seja 100% massada no fim.

## Exceções

- Módulos com < 2 quizzes: fora de escopo deste gate (é o
  `validate_cobertura_quiz.py` que cobra o mínimo de 3).
- `bedrock-*`/`mla-*` cujos quizzes já nascem espalhados fora de uma seção
  "Fixando" — verificado que já passam, sem exceção declarada: a régua é
  sobre o RESULTADO (posição), não sobre a forma de como se chegou lá.

Uso:
    python3 scripts/validate_recuperacao_distribuida.py           # relatório
    python3 scripts/validate_recuperacao_distribuida.py --strict  # aplica o gate
"""
from __future__ import annotations

import glob
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SEEDS = RAIZ / 'scripts' / 'seeds' / 'articles'

# Nenhum quiz precisa estar ANTES de 75% da leitura — mas pelo menos 1 dos
# quizzes do módulo precisa. Mesmo corte usado na medição original ("último
# quarto").
LIMIAR_META = 0.75


def blocos(bs):
    for b in bs:
        yield b
        for c in b.get('children') or []:
            yield from blocos([c])


def main() -> int:
    strict = '--strict' in sys.argv
    massados: list[str] = []
    total_modulos = 0
    total_com_2mais = 0

    for caminho in sorted(SEEDS.glob('*.json')):
        doc = json.loads(caminho.read_text(encoding='utf-8'))
        todos = list(blocos(doc.get('blocks') or []))
        quiz_idx = [i for i, b in enumerate(todos) if b.get('type') == 'quiz']
        total_modulos += 1
        if len(quiz_idx) < 2:
            continue
        total_com_2mais += 1

        n = len(todos)
        posicoes = [i / (n - 1) for i in quiz_idx] if n > 1 else [0.0]
        if all(p >= LIMIAR_META for p in posicoes):
            massados.append(f'{caminho.stem}: todas as {len(posicoes)} posições ≥ {LIMIAR_META} '
                             f'(menor: {min(posicoes):.2f})')

    pct = (1 - len(massados) / total_com_2mais) * 100 if total_com_2mais else 100
    print(f'validate_recuperacao_distribuida: {total_com_2mais - len(massados)}/{total_com_2mais} '
          f'módulos com ≥1 quiz antes de {LIMIAR_META:.0%} da leitura ({pct:.1f}%)')

    if massados:
        msg = '\n'.join(f'  - {m}' for m in massados)
        if strict:
            print(f'\nvalidate_recuperacao_distribuida: REPROVADO — '
                  f'{len(massados)} módulo(s) com recuperação 100% massada no fim:\n{msg}', file=sys.stderr)
            sys.exit(1)
        print(f'\n(modo relatório — falharia em --strict)\n{msg}')
        return 0

    print('validate_recuperacao_distribuida: OK')
    return 0


if __name__ == '__main__':
    sys.exit(main())
