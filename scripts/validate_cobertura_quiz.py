#!/usr/bin/env python3
"""Cobertura de quiz por trilha — e, por consequência, de cartas de SRS.

Existe porque `addCardsFromQuiz` é a ÚNICA fonte de cartas de revisão espaçada da
plataforma. Módulo sem quiz não gera carta, e o leitor nunca revisa aquele
conteúdo. Na auditoria de jul/2026, 357 de 393 módulos (90%) estavam sem nenhum
quiz — o SM-2, descrito como diferencial central da escola, estava inerte.

Regra do PADRAO_ENSINO.md: mínimo de 3 quizzes por módulo, numa seção `Fixando`.

Uso:
    python3 scripts/validate_cobertura_quiz.py           # relatório
    python3 scripts/validate_cobertura_quiz.py --strict  # falha abaixo do mínimo
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TRILHAS = RAIZ / 'frontend' / 'src' / 'lib' / 'curriculum' / 'trails'
ARTIGOS = RAIZ / 'scripts' / 'seeds' / 'articles'

MIN_POR_MODULO = 3

# Em 04/ago/2026 a cobertura chegou a 415/415 módulos com conteúdo. Com isso, a
# regra se inverteu: em vez de listar quem JÁ está coberto, o gate agora exige
# cobertura de todo módulo com seed e mantém uma lista de exceções — hoje vazia.
#
# A inversão importa. Na forma antiga, um módulo novo entrava sem quiz e nada
# avisava até alguém lembrar de promover a trilha à lista. Agora o silêncio é o
# estado bom: adicionar módulo sem quiz quebra o CI no mesmo commit, que é onde
# custa menos consertar. Módulo sem quiz não gera carta de SM-2, e o leitor lê
# aquele conteúdo uma vez e nunca revisa.
#
# Só adicione um slug aqui com a razão escrita e uma data para tirar. Exceção sem
# prazo vira permanente por inércia — foi assim que 90% dos módulos ficaram sem
# quiz até jul/2026.
EXCECOES: dict[str, str] = {}


# O currículo deixou de ser um arquivo único em ago/2026: virou
# `curriculum/trails/<trailId>.ts`, um por trilha. Concatenar na ordem dos
# imports reproduz exatamente o texto que este script lia antes — inclusive a
# ORDEM, que importa para a navegação e para os relatórios daqui.
def _fonte_curriculo() -> str:
    indice = (TRILHAS / 'index.ts').read_text(encoding='utf-8')
    ordem = re.findall(r"from '\./(trail[a-z0-9-]*)'", indice)
    partes = [(TRILHAS / f'{t}.ts').read_text(encoding='utf-8') for t in ordem]
    # Sentinela: o parser original delimitava as trilhas até `export const HUBS`.
    return '\n'.join(partes) + '\nexport const HUBS'


def trilhas():
    src = _fonte_curriculo()
    fim = src.index('export const HUBS')
    marcas = [(m.start(), m.group(1)) for m in re.finditer(r"id: '(trail[a-z0-9-]*)'", src)]
    saida = []
    for k, (pos, tid) in enumerate(marcas):
        if pos >= fim:
            break
        prox = marcas[k + 1][0] if k + 1 < len(marcas) else fim
        blk = src[pos:min(prox, fim)]
        nome = re.search(r"name: '([^']+)'", blk)
        slugs = re.findall(r"slug: '([a-z0-9-]+)'", blk)
        saida.append((tid, nome.group(1) if nome else tid, slugs))
    return saida


def contar_quiz(slug: str) -> int:
    p = ARTIGOS / f'{slug}.json'
    if not p.exists():
        return -1  # sem conteúdo
    n = [0]

    def andar(bs):
        for b in bs:
            if b.get('type') == 'quiz':
                n[0] += 1
            andar(b.get('children', []))

    andar(json.loads(p.read_text(encoding='utf-8'))['blocks'])
    return n[0]


def main() -> None:
    strict = '--strict' in sys.argv
    erros = []

    # Exceção que aponta para slug inexistente é exceção esquecida: ela deixou de
    # proteger nada e some da vista. Falha alto para forçar a limpeza.
    todos = {s for _, _, slugs in trilhas() for s in slugs}
    orfas = sorted(set(EXCECOES) - todos)
    if orfas:
        print(f'❌ exceção(ões) sem módulo correspondente: {", ".join(orfas)}')
        sys.exit(1)

    tot_cont = tot_com = tot_quiz = 0
    print(f"{'TRILHA':<44} {'c/QUIZ':>8} {'QUIZZES':>8}")
    print('─' * 64)

    for tid, nome, slugs in trilhas():
        cont = [s for s in slugs if (ARTIGOS / f'{s}.json').exists()]
        if not cont:
            continue
        contagens = {s: contar_quiz(s) for s in cont if s not in EXCECOES}
        com = [s for s, n in contagens.items() if n > 0]
        magros = [f'{s} ({n})' for s, n in contagens.items() if 0 < n < MIN_POR_MODULO]
        tot_cont += len(contagens)
        tot_com += len(com)
        tot_quiz += sum(contagens.values())

        sem = [s for s, n in contagens.items() if n == 0]
        if sem:
            erros.append(f'{nome}: {len(sem)} módulo(s) sem quiz — {", ".join(sem[:4])}')
        if magros:
            erros.append(f'{nome}: abaixo de {MIN_POR_MODULO} quizzes — {", ".join(magros[:4])}')

        marca = ' ✗' if sem or magros else ' ✓'
        print(f'{nome[:43]:<44} {len(com):>3}/{len(contagens):<4} '
              f'{sum(contagens.values()):>8}{marca}')

    print('─' * 64)
    pct = (100 * tot_com // tot_cont) if tot_cont else 0
    print(f'{"TOTAL":<44} {tot_com:>3}/{tot_cont:<4} {tot_quiz:>8}   ({pct}% dos módulos)')
    print(f'\n{tot_quiz} quizzes = {tot_quiz} cartas de SRS possíveis')

    if EXCECOES:
        print(f'\n⚠️  {len(EXCECOES)} módulo(s) dispensado(s) da regra:')
        for slug, motivo in sorted(EXCECOES.items()):
            print(f'   {slug} — {motivo}')

    if erros:
        print(f'\n❌ {len(erros)} trilha(s) abaixo da regra:')
        for e in erros:
            print(f'   {e}')
        if strict:
            sys.exit(1)
    else:
        print(f'\n✅ todos os {tot_cont} módulos com conteúdo têm '
              f'{MIN_POR_MODULO}+ quizzes.')


if __name__ == '__main__':
    main()
