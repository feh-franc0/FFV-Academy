#!/usr/bin/env python3
"""O question-bank declara o que realmente tem?

─── Por que esta regra existe ────────────────────────────────────────────────

Medido em 09/ago/2026: `aif-c01-ai-ml-fundamentals-v1.json` declarava
`totalQuestions: 100` e tinha **10** questões. O número era usado para planejar
— "a AIF já tem 140 questões" — e a diferença só apareceu quando o gerador de
migration contou os arrays de verdade.

O mesmo arquivo revelou o defeito maior: o gerador lia apenas `clf-c02-*.json`,
então TODAS as questões de AIF eram ignoradas em silêncio e nunca chegavam ao
banco. Arquivo escrito e não lido é conteúdo declarado e não renderizado, do lado
do banco de dados.

─── O que este gate cobra ────────────────────────────────────────────────────

  1. `totalQuestions` bate com o tamanho de `questions`.
  2. Todo arquivo tem um prefixo que o gerador reconhece — senão ele é ignorado
     em silêncio e o trabalho de escrever as questões se perde.
  3. Nenhum id repetido dentro do mesmo arquivo nem entre arquivos da mesma cert.
  4. Toda questão tem `correctId` existente entre as opções.
  5. O gabarito não concentra numa letra: num banco de 20+, nenhuma letra passa
     de 45%. É o vício que permite passar no simulado sem estudar.

Uso:
    python3 scripts/validate_question_bank.py           # relatório
    python3 scripts/validate_question_bank.py --strict  # falha
"""
import collections
import glob
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANCO = os.path.join(RAIZ, 'frontend', 'data', 'question-bank')

GERADOR = os.path.join(RAIZ, 'backend', 'cmd', 'gen-seed-migration', 'main.go')


def prefixos_conhecidos() -> tuple[str, ...]:
    """Lê os prefixos DIRETO da tabela `certs` do gerador.

    A primeira versão deste gate mantinha a lista duplicada aqui, e ela divergiu
    no mesmo dia: `dva-c02-` entrou no Go e não no Python, e o gate reprovou 8
    arquivos corretos. Duas listas que precisam concordar sempre acabam
    discordando — a única correção estável é ter uma.
    """
    with open(GERADOR, encoding='utf-8') as fh:
        fonte = fh.read()
    bloco = re.search(r'var certs = \[\]cert\{(.*?)\n\}', fonte, re.S)
    if not bloco:
        raise SystemExit(
            'não achei a tabela `certs` em gen-seed-migration/main.go — '
            'se ela foi renomeada, ajuste este gate junto'
        )
    achados = tuple(re.findall(r'\{"([a-z0-9-]+-)"', bloco.group(1)))
    if not achados:
        raise SystemExit('tabela `certs` encontrada e vazia — nenhum prefixo para validar')
    return achados


PREFIXOS_CONHECIDOS = prefixos_conhecidos()


def main() -> int:
    estrito = '--strict' in sys.argv
    problemas: list[str] = []
    ids_por_cert: dict[str, dict[str, str]] = collections.defaultdict(dict)
    total = 0
    arquivos = 0

    for caminho in sorted(glob.glob(os.path.join(BANCO, '*.json'))):
        nome = os.path.basename(caminho)
        if nome.endswith('.v1-backup.json'):
            continue
        arquivos += 1

        prefixo = next((p for p in PREFIXOS_CONHECIDOS if nome.startswith(p)), None)
        if not prefixo:
            problemas.append(
                f'{nome}: prefixo desconhecido — o gerador de migration IGNORA este '
                f'arquivo, e as questões nunca chegam ao banco'
            )
            continue

        with open(caminho, encoding='utf-8') as fh:
            doc = json.load(fh)
        questoes = doc.get('questions', [])
        total += len(questoes)

        declarado = doc.get('totalQuestions')
        if declarado != len(questoes):
            problemas.append(
                f'{nome}: declara totalQuestions={declarado} e tem {len(questoes)}'
            )

        for q in questoes:
            qid = q.get('id', '(sem id)')
            anterior = ids_por_cert[prefixo].get(qid)
            if anterior:
                problemas.append(f'{nome}: id repetido {qid} (já em {anterior})')
            ids_por_cert[prefixo][qid] = nome

            letras = {o.get('id') for o in q.get('options', [])}
            if q.get('correctId') not in letras:
                problemas.append(
                    f'{nome}/{qid}: correctId={q.get("correctId")!r} não está entre as opções'
                )

        if len(questoes) >= 20:
            gab = collections.Counter(q.get('correctId') for q in questoes)
            letra, n = gab.most_common(1)[0]
            if n / len(questoes) > 0.45:
                problemas.append(
                    f'{nome}: gabarito concentrado — {n} de {len(questoes)} '
                    f'({n / len(questoes):.0%}) na letra {letra}'
                )

    print('=' * 74)
    print('GATE  question-bank declara o que tem, e o gerador consegue ler')
    print('=' * 74)
    print(f'arquivos ..................... {arquivos}')
    print(f'questões ..................... {total}')
    for prefixo, ids in sorted(ids_por_cert.items()):
        print(f'  {prefixo:12} {len(ids):5} questões')
    print(f'problemas .................... {len(problemas)}')

    if problemas:
        print()
        for p in problemas:
            print(f'  ❌ {p}')
        print()
        print('  Prefixo novo precisa entrar TAMBÉM na tabela `certs` de')
        print('  backend/cmd/gen-seed-migration/main.go, senão o arquivo é lido')
        print('  por este gate e ignorado pelo gerador.')
        return 1 if estrito else 0

    print('\n✅ todo arquivo é legível pelo gerador e declara o que tem.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
