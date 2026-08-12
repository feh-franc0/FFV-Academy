#!/usr/bin/env python3
"""Move 1 quiz concentrado no fim do módulo pra logo depois da seção do meio.

## O defeito

Medido em 12/ago/2026: 95,8% dos quizzes ficavam no último quarto do módulo,
**zero** no primeiro quarto. Em 94,7% dos módulos os 3 quizzes ficavam TODOS
acima de 0,75 da posição de leitura — não é prática de recuperação
distribuída, é uma única sessão de 3 perguntas coladas no fim.

*Retrieval practice* distribuída ao longo do material tem evidência melhor que
um bloco único no final — e é exatamente o efeito que a regra 2 do
PADRAO_ENSINO.md invoca para justificar o quiz, enquanto o posicionamento
prescrito ("seção Fixando antes do callout final") produz o oposto.

## Duas formas físicas do mesmo defeito

A maioria dos módulos guarda os 3 quizzes como filhos de uma seção titulada
"Fixando". Um grupo à parte (`bedrock-*`/`mla-*`, ~49 módulos) não usa essa
seção — os quizzes são blocos de TOPO soltos, perto do fim. As duas formas
produzem o mesmo sintoma (posição ≥ 0,75) e este script trata as duas: acha
o PRIMEIRO quiz do módulo (por ordem de leitura) e, se nenhum quiz do módulo
já está antes do limiar, relocaliza esse primeiro — de onde quer que ele
esteja — pra logo depois da seção do meio.

## Por que sempre o PRIMEIRO, e por que a ordem relativa dos outros não muda

`extrairQuizzes()` (`lib/article-extract.ts`) caminha os blocos em ORDEM DE
LEITURA e usa o índice de descoberta como id da carta de SRS
(`${slug}_q${i}`, em `engine.ts`). Mover o quiz que já era o primeiro para uma
posição AINDA MAIS CEDO no documento não muda esse índice — ele continua
sendo o primeiro quiz encontrado na caminhada. Os demais mantêm a ordem
relativa entre si. Verificado por comparação direta da ordem de extração
antes/depois em amostras reais.

## O que fica de fora, de propósito

- Módulos com < 2 quizzes no total.
- Módulos que já têm pelo menos 1 quiz antes do limiar (0,75) — nada a fazer.
- Módulos com < 2 seções de conteúdo no nível superior — não há "meio" que
  signifique alguma coisa.

## Uso
    python3 scripts/distribuir_quiz_no_meio.py --dry-run
    python3 scripts/distribuir_quiz_no_meio.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SEEDS = RAIZ / 'scripts' / 'seeds' / 'articles'

TITULOS_ESTRUTURAIS = {'Perguntas frequentes', 'Fixando'}
LIMIAR_META = 0.75


def contagem_blocos(bs) -> int:
    n = 0
    for b in bs:
        n += 1
        n += contagem_blocos(b.get('children') or [])
    return n


def achar_quizzes(blocos_topo):
    """[(lista_container, indice, bloco)] de todo quiz, em ORDEM DE LEITURA.
    `lista_container` é a lista Python de onde o bloco pode ser removido com
    `.pop(indice)` — ou o array de blocos de topo, ou `children` de uma
    seção."""
    achados = []

    def andar(lista):
        for i, b in enumerate(lista):
            if b.get('type') == 'quiz':
                achados.append((lista, i, b))
            filhos = b.get('children')
            if filhos:
                andar(filhos)

    andar(blocos_topo)
    return achados


def renumerar(lista):
    for pos, b in enumerate(lista):
        b['position'] = pos


def processar(doc: dict) -> tuple[bool, str]:
    blocos = doc.get('blocks') or []
    total_blocos = contagem_blocos(blocos)
    if total_blocos < 2:
        return False, 'módulo pequeno demais'

    quizzes = achar_quizzes(blocos)
    if len(quizzes) < 2:
        return False, f'só {len(quizzes)} quiz(zes) no módulo'

    # Posição de leitura de cada quiz, na mesma régua do gate
    # (validate_recuperacao_distribuida.py): índice na caminhada pre-order
    # completa (incluindo containers), normalizado por total_blocos - 1.
    # Indexado por `id()` (identidade do objeto), não por `==` — dois blocos
    # podem ter conteúdo igual (ex.: dois `quiz` truncados iguais por acaso),
    # e `list.index()` usaria igualdade estrutural e acharia a ocorrência
    # ERRADA.
    ordem_por_id: dict[int, int] = {}

    def caminhar(lista):
        for b in lista:
            ordem_por_id[id(b)] = len(ordem_por_id)
            caminhar(b.get('children') or [])

    caminhar(blocos)
    total_caminhados = len(ordem_por_id)
    posicoes = [ordem_por_id[id(q)] / (total_caminhados - 1) for _, _, q in quizzes]
    if any(p < LIMIAR_META for p in posicoes):
        return False, 'já tem quiz antes do limiar — considerado distribuído'

    secoes_conteudo = [
        i for i, b in enumerate(blocos)
        if b.get('type') == 'section' and b.get('data', {}).get('title') not in TITULOS_ESTRUTURAIS
    ]
    if len(secoes_conteudo) < 2:
        return False, f'só {len(secoes_conteudo)} seção(ões) de conteúdo — sem "meio" que signifique algo'

    meio = secoes_conteudo[len(secoes_conteudo) // 2]

    # Remove o PRIMEIRO quiz (por ordem de leitura) de onde ele estiver.
    lista_origem, idx_origem, quiz_movido = quizzes[0]
    lista_origem.pop(idx_origem)
    renumerar(lista_origem)

    blocos.insert(meio + 1, quiz_movido)
    renumerar(blocos)

    titulo_meio = blocos[meio]['data'].get('title', '?')
    return True, f'movido para depois de "{titulo_meio}" (seção {len(secoes_conteudo)//2 + 1}/{len(secoes_conteudo)})'


def main() -> int:
    dry = '--dry-run' in sys.argv
    tocados = 0
    pulados = 0

    for caminho in sorted(SEEDS.glob('*.json')):
        doc = json.loads(caminho.read_text(encoding='utf-8'))
        mudou, motivo = processar(doc)
        if mudou:
            tocados += 1
            print(f'  {caminho.stem:45s} {motivo}')
            if not dry:
                caminho.write_text(
                    json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        else:
            pulados += 1

    rotulo = 'SIMULAÇÃO' if dry else 'APLICADO'
    print(f'\ndistribuir_quiz_no_meio: {rotulo} — {tocados} módulos alterados, {pulados} pulados')
    return 0


if __name__ == '__main__':
    sys.exit(main())
