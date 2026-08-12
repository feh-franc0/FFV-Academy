#!/usr/bin/env python3
"""A explicação de uma questão trata CADA distrator pelo nome do erro?

─── Por que esta regra existe ────────────────────────────────────────────────

`PADRAO_ENSINO.md`, regra 3: a explicação que mais ensina é a que trata os
distratores. Quem erra escolheu por um motivo, e nomear esse motivo é o que
corrige o modelo mental — dizer só por que a correta é correta deixa o erro
intacto.

A regra já vale para quiz de módulo. Para questão de SIMULADO ela não valia, e o
resultado é medido: das **75 questões do catálogo estático, 75 trazem a explicação
como texto corrido**. Algumas mencionam os distratores de passagem; nenhuma nomeia
a concepção errada que levaria alguém a escolhê-los.

Exemplo do que passa hoje e não deveria:

    "Glue é ETL serverless gerenciado com Spark por baixo… Lambda tem limite de
     15min (inviável para ETL petabyte). Step Functions orquestra workflows."

— cita B e C, e não diz por que alguém escolheria B. O que ensina é:

    "A confusão que a questão testa é tratar Lambda como 'compute genérico': ele
     é, dentro de 15 minutos. Quem escolhe B está raciocinando por familiaridade
     com o serviço, não pelo tempo da tarefa."

─── Como a checagem funciona ─────────────────────────────────────────────────

Não dá para medir "nomeia o erro de raciocínio" automaticamente. O que dá para
medir é a condição NECESSÁRIA: cada alternativa errada é tratada de forma
identificável na explicação. Duas formas contam:

  1. explicação ESTRUTURADA (objeto com `whyWrong` por id) — a forma canônica,
     que é a que o banco entrega e o `EstudoClient` renderiza rico;
  2. texto corrido que menciona explicitamente cada distrator, pelo id `(B)` ou
     pelo texto da alternativa.

A forma 2 conta como transição, não como destino: ela mantém o número medível
enquanto a migração acontece.

Uso:
    python3 scripts/validate_explicacao_simulado.py            # relatório (sai 0)
    python3 scripts/validate_explicacao_simulado.py --strict   # falha
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / 'frontend/src/lib/simulados-catalog.ts'

# Linha de base de 07/ago/2026, para a subida ser verificável.
BASE_TOTAL = 75
# Medido: 8 das 75 já mencionam todos os distratores. Nenhuma delas NOMEIA o erro
# de raciocínio — o gate mede a condição necessária, não a suficiente.
BASE_COM_TRATAMENTO = 8


def questoes() -> list[dict]:
    """Extrai as questões do catálogo TypeScript.

    Usa o próprio Node para avaliar o módulo em vez de uma expressão regular: o
    arquivo é TS com objetos aninhados, e regex sobre ele produziria uma contagem
    que ninguém consegue auditar.
    """
    # Roda pelo `tsx` do próprio repositório, que já é o caminho dos outros
    # geradores — em vez de uma regex sobre TS com objeto aninhado, que produziria
    # uma contagem que ninguém consegue auditar.
    codigo = (
        "import { SIMULADOS_CATALOG } from './frontend/src/lib/simulados-catalog';\n"
        "const out = [];\n"
        "for (const s of SIMULADOS_CATALOG) {\n"
        "  for (const q of s.questions ?? []) {\n"
        "    out.push({ simulado: s.id, id: q.id, correctId: q.correctId,\n"
        "               options: q.options, explanation: q.explanation });\n"
        "  }\n"
        "}\n"
        "process.stdout.write(JSON.stringify(out));\n"
    )
    tmp = RAIZ / '.tmp-extrai-questoes.ts'
    tmp.write_text(codigo, encoding='utf-8')
    try:
        r = subprocess.run(
            ['npx', 'tsx', str(tmp)], cwd=RAIZ, capture_output=True, text=True, timeout=180,
        )
        if r.returncode != 0:
            print('não foi possível carregar o catálogo:', r.stderr[-500:], file=sys.stderr)
            return []
        return json.loads(r.stdout)
    finally:
        tmp.unlink(missing_ok=True)


def trata_distratores(q: dict) -> tuple[bool, list[str]]:
    """(tratou todos?, ids sem tratamento)."""
    exp = q.get('explanation')
    distratores = [o for o in (q.get('options') or []) if o.get('id') != q.get('correctId')]

    # Forma canônica: objeto com `whyWrong` por id de alternativa.
    if isinstance(exp, dict):
        wrong = exp.get('whyWrong') or {}
        faltando = [d['id'] for d in distratores
                    if not str(wrong.get(d['id'], '')).strip()]
        return (not faltando, faltando)

    texto = str(exp or '')
    if not texto.strip():
        return (False, [d['id'] for d in distratores])

    faltando = []
    for d in distratores:
        did = d.get('id', '')
        rotulo = str(d.get('text', '')).strip()
        # Menção pelo id — `(B)`, `B)` ou `alternativa B`.
        por_id = re.search(rf'\(\s*{re.escape(did)}\s*\)|\b{re.escape(did)}\)', texto)
        # Menção pelo texto da alternativa: o nome do serviço/conceito aparece.
        # Casa o trecho mais longo entre as palavras significativas, para não
        # contar "AWS" como se fosse tratamento.
        significativas = [p for p in re.split(r'[^\wÀ-ÿ]+', rotulo)
                          if len(p) >= 4 and p.lower() not in {'aws', 'amazon', 'para', 'para'}]
        por_texto = any(re.search(rf'\b{re.escape(p)}\b', texto, re.I) for p in significativas)
        if not (por_id or por_texto):
            faltando.append(did)
    return (not faltando, faltando)


def main() -> int:
    estrito = '--strict' in sys.argv
    qs = questoes()
    if not qs:
        print('nenhuma questão lida — o gate não tem o que afirmar')
        return 1 if estrito else 0

    ricas = [q for q in qs if isinstance(q.get('explanation'), dict)]
    sem_tratamento: list[tuple[dict, list[str]]] = []
    for q in qs:
        ok, faltando = trata_distratores(q)
        if not ok:
            sem_tratamento.append((q, faltando))

    com = len(qs) - len(sem_tratamento)
    print('=' * 74)
    print('GATE  explicação de questão trata cada distrator')
    print('=' * 74)
    print(f'questões no catálogo ......... {len(qs)}')
    print(f'explicação estruturada ....... {len(ricas)}  (a forma canônica, que o banco entrega)')
    print(f'com tratamento por distrator . {com}   (base 07/ago: {BASE_COM_TRATAMENTO} de {BASE_TOTAL})')
    print(f'sem tratamento ............... {len(sem_tratamento)}')
    print()

    if sem_tratamento:
        for q, faltando in sem_tratamento[:12]:
            print(f'  {q["simulado"]}/{q["id"]}  sem tratamento de: {", ".join(faltando)}')
        if len(sem_tratamento) > 12:
            print(f'  … e {len(sem_tratamento) - 12} outra(s)')
        print()
        print('  A explicação precisa nomear a CONCEPÇÃO ERRADA que levaria alguém a')
        print('  escolher cada alternativa — não só dizer o que o serviço faz.')
        if not estrito:
            print('  (modo relatório — `--strict` faz falhar)')
            return 0
        return 1

    # A cobertura só sobe: cair abaixo do já alcançado é regressão.
    if com < BASE_COM_TRATAMENTO:
        print(f'✗ cobertura caiu de {BASE_COM_TRATAMENTO} para {com}')
        return 1
    print('✓ toda questão trata cada distrator.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
