#!/usr/bin/env python3
"""Módulo tem conteúdo suficiente para ensinar alguma coisa?

Este é o quarto gate da mesma família, e o mais desconfortável de escrever.

Os anteriores perguntam se o bloco é VÁLIDO (`validate_bedrock_blocks`), se o
que foi escrito CHEGA À TELA (`validate_primitives_render`), e se o ícone
EXISTE (`validate_servicos_diagrama`). Nenhum deles pergunta se há conteúdo.

Em ago/2026, seis dos dez módulos da trilha System Design eram esboços
telegráficos. O de feed social, inteiro, era: "Fan-out on write vs read vs
hybrid. Celebrity problem." — três seções, um parágrafo cada, nenhuma
explicação. Todos os gates passavam. Os blocos eram válidos, o Zod aceitava, o
quiz existia, o slug tinha seed, o manifesto contava o módulo como conteúdo. A
home exibia o número, o sitemap publicava a URL, e quem clicasse encontraria
uma anotação de reunião.

## O que este gate NÃO faz

Contar caracteres não mede qualidade. Um módulo de 6.000 caracteres pode ser
ruim, e um de 1.500 pode ser excelente se o assunto for estreito. Este gate
detecta ESBOÇO — texto que nem tenta explicar —, e nada além disso. Fingir que
mede pedagogia seria pior que não medir.

O piso é deliberadamente baixo, bem abaixo da mediana da base (~6.000), para
que ele só dispare no que é indefensável. Gate que reclama do razoável é gate
que o time aprende a ignorar.

Quiz não conta: ele verifica o aprendizado, não o entrega. Um módulo com três
quizzes ricos e nenhuma explicação continua sendo um módulo que não ensina.

Uso:
    python3 scripts/validate_substancia.py
"""
from __future__ import annotations

import json
import statistics
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARTIGOS = RAIZ / 'scripts' / 'seeds' / 'articles'

# Piso em caracteres de texto que ensina. Abaixo disto não é "módulo curto" —
# é anotação. Referência: em ago/2026 a mediana da base era ~6.000 e o menor
# módulo defensável, ~1.100.
PISO = 900

# Chaves que não carregam texto de ensino: identificador, tipo, cor, linguagem.
# Contá-las inflaria a medida com metadado.
IGNORA = {'id', 'type', 'icon', 'variant', 'language', 'position', 'href', 'url'}

# Exceções, com motivo escrito. Módulo legitimamente curto existe — landing de
# trilha, por exemplo. O que não existe é exceção sem justificativa.
EXCECOES: dict[str, str] = {}


def texto_util(bloco: dict) -> int:
    total = 0

    def contar(v) -> None:
        nonlocal total
        if isinstance(v, str):
            total += len(v)
        elif isinstance(v, list):
            for x in v:
                contar(x)
        elif isinstance(v, dict):
            for k, x in v.items():
                if k not in IGNORA:
                    contar(x)

    if bloco.get('type') == 'quiz':
        return 0
    contar(bloco.get('data') or {})
    return total


def medir(caminho: Path) -> int:
    doc = json.loads(caminho.read_text(encoding='utf-8'))
    total = 0

    def andar(blocos) -> None:
        nonlocal total
        for b in blocos:
            total += texto_util(b)
            andar(b.get('children') or [])

    andar(doc['blocks'])
    return total


def main() -> None:
    medidas = {p.stem: medir(p) for p in sorted(ARTIGOS.glob('*.json'))}

    orfas = sorted(set(EXCECOES) - set(medidas))
    if orfas:
        print(f'❌ exceção(ões) sem módulo: {", ".join(orfas)}')
        sys.exit(1)

    valores = sorted(medidas.values())
    print(f'{len(medidas)} módulos · mediana {statistics.median(valores):,.0f} '
          f'caracteres de texto que ensina · menor {valores[0]:,}')

    magros = sorted(
        ((n, s) for s, n in medidas.items() if n < PISO and s not in EXCECOES),
    )

    if magros:
        print(f'\n❌ {len(magros)} módulo(s) abaixo de {PISO} caracteres — são esboço, '
              f'não conteúdo:')
        for n, slug in magros:
            print(f'   {n:5}  {slug}')
        print('\n   Um módulo assim passa em todos os outros gates: os blocos são '
              'válidos,\n   o quiz existe e o manifesto o conta como conteúdo. O leitor '
              'é quem\n   descobre que não há nada ali.')
        sys.exit(1)

    if EXCECOES:
        print(f'\n⚠️  {len(EXCECOES)} módulo(s) dispensado(s):')
        for slug, motivo in sorted(EXCECOES.items()):
            print(f'   {slug} — {motivo}')

    print(f'\n✅ todo módulo tem ao menos {PISO} caracteres de conteúdo que ensina.')


if __name__ == '__main__':
    main()
