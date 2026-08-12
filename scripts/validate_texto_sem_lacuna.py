#!/usr/bin/env python3
"""Gate: nenhum texto de bloco tem lacuna de trecho removido.

## O defeito real que este gate existe para pegar

Em 05/ago/2026, ao escrever o contrato de resposta citável, apareceram frases
assim nos seeds — e portanto no site:

    "Sim. , , . API aceita campo (lista base64)."
    "Em CUDA: divide tensores entre 2 GPUs. Para 4 GPUs: ."
    "Endpoints suportados (≈parity com OpenAI): , , , ."

São trechos de **código inline que se perderam** em alguma conversão, deixando a
pontuação órfã. O texto continua existindo, com tamanho plausível, então:

  - o build passa;
  - `validate_substancia.py` passa, porque conta caracteres;
  - `validate_primitives_render.py` passa, porque o bloco é válido;
  - a varredura passa, porque a página responde 200 com `<h1>` e conteúdo.

Só um leitor humano vê. E para a estratégia de captação de busca é pior que um
erro visível: uma resposta que depende de um identificador que não está lá não se
sustenta fora da página, e é justamente fora da página que ela precisa se
sustentar para ser citada.

## Os três sinais

Pontuação isolada entre espaços, espaço duplo antes de palavra, e dois-pontos
seguido direto de ponto ou vírgula. Nenhum aparece em texto escrito com cuidado;
todos aparecem quando um `<code>` é apagado do meio da frase.

Uso:
    python3 scripts/validate_texto_sem_lacuna.py
    python3 scripts/validate_texto_sem_lacuna.py --lista   # só os arquivos
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[1]
ARTIGOS = RAIZ / 'scripts' / 'seeds' / 'articles'

# Campos que carregam prosa lida pelo usuário. `code` fica de fora de propósito:
# dentro de bloco de código, espaço duplo e pontuação solta são legítimos.
CAMPOS = ('text', 'answer', 'question', 'content', 'caption', 'label', 'title', 'desc')

SINAIS = [
    (re.compile(r'(?<=\s)[.,;](?=\s|$)'), 'pontuação isolada entre espaços'),
    (re.compile(r'\S\s{2,}\S'), 'espaço duplo no meio da frase'),
    (re.compile(r':\s*[.,](?=\s|$)'), 'dois-pontos seguido de pontuação vazia'),
]

# ─── Quarto sinal: começo perdido ────────────────────────────────────────────
#
# Achado em 05/ago/2026, varrendo os 426 seeds: DUAS respostas de `qa_item`
# começavam sem o começo.
#
#     "ou use Data Lifecycle Manager com policy cross-region…"
#     ". Fornece o host físico dedicado, permitindo reuso de licenças…"
#
# A segunda perdeu o nome do serviço que ERA a resposta ("Dedicated Host"), e a
# primeira perdeu a primeira alternativa de um "faça X ou Y". Nos dois casos a
# resposta continua com tamanho plausível e sintaxe válida — os três sinais
# acima não pegam, porque a lacuna está na borda e não no meio.
#
# Este sinal só se aplica a campo que é o valor COMPLETO de um texto. Em
# `paragraph.content` o texto é fatiado para marcar negrito, então nó começando
# com ". " é normal ali — aplicar a regra sobre esses fragmentos produziu
# centenas de falsos positivos na primeira tentativa.
COMPLETOS = ('answer', 'question', 'explanation', 'caption', 'detail', 'desc')
COMECO_PERDIDO = re.compile(r'^\s*(?:[.,;:)\]}]\s|(?:ou|mas|que)\s+[a-zA-Z])')


def campos_completos(dados) -> list[tuple[str, str]]:
    """(chave, texto) dos campos que são o valor inteiro, não fragmento."""
    saida: list[tuple[str, str]] = []

    def anda(v, chave=''):
        if isinstance(v, str):
            if chave in COMPLETOS and len(v) > 20:
                saida.append((chave, v))
        elif isinstance(v, list):
            for x in v:
                anda(x, chave)
        elif isinstance(v, dict):
            for k, x in v.items():
                anda(x, k)

    anda(dados)
    return saida

# Exceções com razão escrita. Fórmula matemática legitimamente usa espaçamento
# incomum, e notação de intervalo usa vírgula solta.
EXCECOES: dict[str, str] = {}


def prosa(valor) -> list[str]:
    if isinstance(valor, str):
        return [valor]
    if isinstance(valor, list):
        return [t for x in valor for t in prosa(x)]
    if isinstance(valor, dict):
        return [t for k, x in valor.items() if k in CAMPOS for t in prosa(x)]
    return []


def main() -> int:
    so_lista = '--lista' in sys.argv
    achados: dict[str, list[tuple[str, str, str]]] = {}

    for caminho in sorted(ARTIGOS.glob('*.json')):
        slug = caminho.stem
        if slug in EXCECOES:
            continue
        doc = json.loads(caminho.read_text(encoding='utf-8'))

        def anda(blocos):
            for b in blocos:
                for t in prosa(b.get('data') or {}):
                    for regex, motivo in SINAIS:
                        if regex.search(t):
                            achados.setdefault(slug, []).append((b.get('type', '?'), motivo, t))
                            break
                for chave, t in campos_completos(b.get('data') or {}):
                    if COMECO_PERDIDO.match(t):
                        achados.setdefault(slug, []).append(
                            (b.get('type', '?'), f'`{chave}` começa sem o começo', t))
                if b.get('children'):
                    anda(b['children'])

        anda(doc.get('blocks', []))

    if not achados:
        print('✅ nenhum texto com lacuna de trecho removido')
        return 0

    total = sum(len(v) for v in achados.values())
    print(f'❌ {total} textos com lacuna, em {len(achados)} arquivos\n')
    for slug, itens in sorted(achados.items(), key=lambda x: -len(x[1])):
        print(f'  {slug} ({len(itens)})')
        if so_lista:
            continue
        for tipo, motivo, texto in itens:
            recorte = re.sub(r'\s+', ' ', texto)[:110]
            print(f'    · [{tipo}] {motivo}')
            print(f'      {recorte}')
    print('\nO trecho de código inline foi perdido em conversão. Corrigir reescrevendo a')
    print('frase para não depender do identificador ausente — reconstruir de memória um')
    print('nome de flag ou de endpoint ensina algo falso, que é pior que a lacuna.')
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
