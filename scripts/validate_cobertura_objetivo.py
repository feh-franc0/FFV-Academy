#!/usr/bin/env python3
"""Cobertura do campo `objetivo` (resultado, não conteúdo) por módulo.

## O defeito que este gate mede

Achado da auditoria pedagógica de 12/ago/2026: `curriculum/jornada.ts` já
aplica o contrato certo em 5 etapas — "o que ele consegue fazer ao sair dela —
resultado, não conteúdo" — mas no grão do MÓDULO, onde o aprendizado de fato
acontece, o contrato não existia. Medido: 472 de 490 `desc` (96%) listam
conteúdo ("ls, cd, grep, find, pipe, redireção") em vez de declarar resultado.

`desc` continua existindo como está — é consumido por SEO, busca e cards de
trilha, e não deve virar outra coisa por baixo dos pés de quem já depende do
formato dele. `objetivo` (`Module.objetivo?: string`, `curriculum/types.ts`) é
um campo NOVO, opcional, e a régua deste gate é dupla:

1. **Piso fixo** — os 38 módulos de ENTRADA de trilha (o primeiro módulo de
   cada uma das 38 trilhas) DEVEM ter `objetivo`. É o ponto de maior
   alavanca: o primeiro contato do leitor com aquele assunto. Preenchido em
   12/ago/2026 — regressão aqui é reversão de um trabalho já feito, não dívida
   nova, e por isso é limite fixo, não ratchet.
2. **Ratchet no total** — cobertura geral (0 módulos de saída, hoje 38/490 =
   7,8%) só pode SUBIR. Escrever objetivo pros 452 módulos restantes é
   trabalho de redação real, um por vez — mesma disciplina de
   `check-hex-in-style.mjs` (que só permite a dívida CAIR), invertida: aqui o
   que só pode subir é a cobertura, não a dívida.

Uso:
    python3 scripts/validate_cobertura_objetivo.py           # relatório
    python3 scripts/validate_cobertura_objetivo.py --strict  # aplica o gate
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TRILHAS = RAIZ / 'frontend' / 'src' / 'lib' / 'curriculum' / 'trails'

# Ratchet — só pode SUBIR. Medido em 12/ago/2026, logo após preencher os 38
# módulos de entrada: 38/490 = 7,76%.
MINIMO_COBERTURA = 38


def _fonte_curriculo() -> str:
    indice = (TRILHAS / 'index.ts').read_text(encoding='utf-8')
    ordem = re.findall(r"from '\./(trail[a-z0-9-]*)'", indice)
    partes = [(TRILHAS / f'{t}.ts').read_text(encoding='utf-8') for t in ordem]
    return '\n'.join(partes) + '\nexport const HUBS'


def trilhas():
    """[(trailId, nome, [(slug, tem_objetivo)])], na ordem de `index.ts`."""
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
        mods_pos = [m.start() for m in re.finditer(r"slug: '([a-z0-9-]+)'", blk)]
        slugs_com = []
        for i, mpos in enumerate(mods_pos):
            slug = re.match(r"slug: '([a-z0-9-]+)'", blk[mpos:]).group(1)
            fim_mod = mods_pos[i + 1] if i + 1 < len(mods_pos) else len(blk)
            tem_obj = bool(re.search(r"objetivo:\s*'", blk[mpos:fim_mod]))
            slugs_com.append((slug, tem_obj))
        saida.append((tid, nome.group(1) if nome else tid, slugs_com))
    return saida


def main() -> None:
    strict = '--strict' in sys.argv
    trilhas_ord = trilhas()

    entrada_sem: list[tuple[str, str]] = []
    total = 0
    com = 0

    for tid, nome, slugs in trilhas_ord:
        if not slugs:
            continue
        total += len(slugs)
        com += sum(1 for _, t in slugs if t)
        primeiro_slug, primeiro_tem = slugs[0]
        if not primeiro_tem:
            entrada_sem.append((tid, primeiro_slug))

    pct = (com / total * 100) if total else 0
    print(f'validate_cobertura_objetivo: {com}/{total} módulos com objetivo ({pct:.1f}%)')
    print(f'  piso de módulos de entrada: {len(trilhas_ord) - len(entrada_sem)}/{len(trilhas_ord)}')

    erros = []
    if entrada_sem:
        erros.append(
            f'{len(entrada_sem)} módulo(s) de ENTRADA de trilha sem `objetivo` — '
            f'piso fixo, não ratchet:'
        )
        for tid, slug in entrada_sem:
            erros.append(f'  - {tid}: {slug}')

    if com < MINIMO_COBERTURA:
        erros.append(
            f'cobertura total caiu: {com} < piso de {MINIMO_COBERTURA}. '
            f'`objetivo` só pode ser REMOVIDO se o módulo também sair do currículo.'
        )
    elif com > MINIMO_COBERTURA:
        print(
            f'  cobertura subiu — suba MINIMO_COBERTURA para {com} em '
            f'scripts/validate_cobertura_objetivo.py para travar o ganho.'
        )

    if erros:
        msg = '\n'.join(erros)
        if strict:
            print(f'\nvalidate_cobertura_objetivo: REPROVADO\n\n{msg}', file=sys.stderr)
            sys.exit(1)
        print(f'\n(modo relatório — falharia em --strict)\n{msg}')
    else:
        print('validate_cobertura_objetivo: OK')


if __name__ == '__main__':
    main()
