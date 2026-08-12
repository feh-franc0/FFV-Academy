#!/usr/bin/env python3
"""Gate: a seção `Perguntas frequentes` obedece ao contrato de resposta citável.

## O que este gate existe para impedir

A pesquisa de demanda de ago/2026 (`PESQUISA_DEMANDA_BUSCA_2026-08.md`) mediu o
que faz um trecho ser citado por resumo de IA, e não é qualidade percebida — é
FORMA:

  - a pergunta é cabeçalho, e é a pergunta que a pessoa digita;
  - a resposta vem imediatamente abaixo e **começa pela conclusão**;
  - a resposta tem substância suficiente para se sustentar fora da página.

Um texto excelente que começa em "Antes de entender X, vale lembrar que…" tem o
PREÂMBULO extraído em vez da resposta. Isso não quebra build, não quebra teste,
não aparece na página — só aparece em quem lê o HTML para citar. É exatamente a
classe de defeito que os outros oito gates deste diretório existem para pegar.

## O gate foi INVERTIDO em 05/ago/2026

Ele nasceu verificando apenas o que existia, porque a cobertura era de 30 dos 415
módulos e gate que falha por conteúdo futuro só ensina o time a desligar gate.

Com a cobertura em **415 de 415**, a ausência deixou de ser trabalho pendente e
passou a ser **regressão**: módulo novo sem `Perguntas frequentes` quebra o CI no
mesmo commit em que entra, em vez de esperar alguém lembrar. É a mesma inversão
que `validate_cobertura_quiz.py` sofreu quando os quizzes fecharam em 100%, e pelo
mesmo motivo.

`EXCECOES` existe para o caso legítimo — com a razão escrita e uma data para sair.

Também não julga se a resposta está CORRETA. Isso é revisão humana, e o gate não
finge o contrário.

Uso:
    python3 scripts/validate_respostas_citaveis.py            # reporta e falha
    python3 scripts/validate_respostas_citaveis.py --cobertura # só o número
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[1]
ARTIGOS = RAIZ / 'scripts' / 'seeds' / 'articles'
SECAO = 'Perguntas frequentes'

MIN_PERGUNTA = 20   # "Custo?" tem 6 e não captura consulta nenhuma
MAX_PERGUNTA = 90   # acima disso não é o que alguém digita
MIN_RESPOSTA = 180
MAX_PRIMEIRA_FRASE = 300
MIN_PARES = 3

# Módulo que legitimamente não deve ter a seção. Vazio de propósito: nenhum caso
# apareceu. Só entra com razão escrita e data para tirar.
EXCECOES: dict[str, str] = {}

# Aberturas que empurram a conclusão para fora do primeiro trecho — que é
# justamente o trecho extraído. Não é lista de estilo: cada uma tem consequência
# medida na forma como o texto é citado.
PREAMBULOS = [
    (re.compile(r'^antes de\b', re.I), 'começa com "antes de" — a conclusão vem depois'),
    (re.compile(r'^nest[ae]\s+(artigo|m[óo]dulo|se[çc][ãa]o)', re.I), 'fala da página em vez de responder'),
    (re.compile(r'^vamos\b', re.I), 'anuncia o que vai fazer em vez de fazer'),
    (re.compile(r'^[ée] importante (lembrar|entender|notar|destacar)', re.I), 'preâmbulo de importância'),
    (re.compile(r'^existem?\s+(v[áa]rios|v[áa]rias|muitos|muitas)\b', re.I), 'abre em enumeração vaga'),
    (re.compile(r'^(atualmente|hoje em dia|nos dias de hoje)\b', re.I), 'abre em contexto temporal'),
    (re.compile(r'^como (sabemos|todos sabem)\b', re.I), 'pressupõe em vez de responder'),
    (re.compile(r'^primeiro(,|\s+de tudo)', re.I), 'abre em sequência, não em conclusão'),
    (re.compile(r'^depende\.?\s*$', re.I), '"depende" sem dizer de quê não responde'),
    (re.compile(r'^(sim|n[ãa]o)\.?\s*$', re.I), 'resposta de uma palavra não se sustenta fora da página'),
]

# Trocar a resposta por um ponteiro para outro conteúdo é o oposto da estratégia:
# quem cita não segue link, cita o que está na página.
#
# O substantivo de conteúdo é OBRIGATÓRIO no padrão. A primeira versão casava
# "leia o" e acusou "leia o thinking block, identifique onde o raciocínio
# descarrila" — que é instrução de depuração ao leitor, não ponteiro. Gate que
# reclama de prosa correta ensina o time a desligar gate.
PROMESSA = re.compile(
    r'\b(veja|confira|leia|saiba mais em)\s+(o|a|em|no|na|nosso|nossa)?\s*'
    r'(m[óo]dulo|artigo|guia|post|cap[íi]tulo|trilha|se[çc][ãa]o|p[áa]gina|documenta)',
    re.I)


def texto_de(valor) -> str:
    """`content` pode ser string ou lista de trechos ricos."""
    if isinstance(valor, str):
        return valor
    if isinstance(valor, list):
        return ' '.join(texto_de(v) for v in valor)
    if isinstance(valor, dict):
        return texto_de(valor.get('text', ''))
    return ''


def pares_de(doc: dict) -> tuple[list[tuple[str, str]] | None, list[str]]:
    """Pares (pergunta, resposta) da seção, e os erros de TIPO de bloco.

    O tipo importa: um par escrito em bloco `key_value` (que espera `items`) tem
    o texto salvo e **não renderiza nada** — o Zod recusa e o BlockRenderer
    devolve null em silêncio. Aconteceu em `rlhf-fundamentos-ppo` porque o script
    de inserção copiou o tipo do primeiro filho da seção, que era `key_value`.

    A primeira versão deste gate lia `data.question` sem olhar o tipo, então o par
    invisível passava no contrato. Gate que valida o texto e ignora o envelope
    aprova conteúdo que ninguém vê.
    """
    for bloco in doc.get('blocks', []):
        if (bloco.get('data') or {}).get('title') != SECAO:
            continue
        pares, tipos_errados = [], []
        for filho in bloco.get('children') or []:
            d = filho.get('data') or {}
            q = texto_de(d.get('question', '')).strip()
            a = texto_de(d.get('answer', '')).strip()
            if not (q or a):
                continue
            if filho.get('type') != 'qa_item':
                tipos_errados.append(f'par em bloco `{filho.get("type")}` — invisível na página: "{q[:44]}"')
            pares.append((q, a))
        return pares, tipos_errados
    return None, []


def conferir(slug: str, pares: list[tuple[str, str]]) -> list[str]:
    problemas: list[str] = []
    if len(pares) < MIN_PARES:
        problemas.append(f'{len(pares)} pares — mínimo {MIN_PARES}')

    for q, a in pares:
        rotulo = q[:56] if q else '(pergunta vazia)'
        if not q.endswith('?'):
            problemas.append(f'sem interrogação: "{rotulo}"')
        if not (MIN_PERGUNTA <= len(q) <= MAX_PERGUNTA):
            problemas.append(f'pergunta com {len(q)} chars (faixa {MIN_PERGUNTA}–{MAX_PERGUNTA}): "{rotulo}"')
        if len(a) < MIN_RESPOSTA:
            problemas.append(f'resposta com {len(a)} chars: "{rotulo}"')
        for regex, motivo in PREAMBULOS:
            if regex.match(a):
                problemas.append(f'{motivo}: "{rotulo}"')
                break
        primeira = re.match(r'^[^.!?]+[.!?]', a)
        tam = len(primeira.group(0)) if primeira else len(a)
        if tam > MAX_PRIMEIRA_FRASE:
            problemas.append(f'1ª frase com {tam} chars (máx {MAX_PRIMEIRA_FRASE}): "{rotulo}"')
        if PROMESSA.search(a):
            problemas.append(f'manda para outro lugar em vez de responder: "{rotulo}"')
    return problemas


def main() -> int:
    so_cobertura = '--cobertura' in sys.argv
    seeds = sorted(ARTIGOS.glob('*.json'))
    com_secao: list[str] = []
    falhas: dict[str, list[str]] = {}

    for caminho in seeds:
        doc = json.loads(caminho.read_text(encoding='utf-8'))
        pares, tipos_errados = pares_de(doc)
        if pares is None:
            continue
        slug = caminho.stem
        com_secao.append(slug)
        problemas = tipos_errados + conferir(slug, pares)
        if problemas:
            falhas[slug] = problemas

    total = len(seeds)
    pct = len(com_secao) * 100 // total if total else 0
    print(f'Perguntas frequentes: {len(com_secao)} de {total} módulos ({pct}%)')

    if so_cobertura:
        return 0

    # Exceção que aponta para slug inexistente é exceção esquecida.
    fantasmas = sorted(set(EXCECOES) - {p.stem for p in seeds})
    if fantasmas:
        print(f'\n❌ EXCECOES aponta para slug inexistente: {", ".join(fantasmas)}')
        return 1

    ausentes = sorted({p.stem for p in seeds} - set(com_secao) - set(EXCECOES))
    if ausentes:
        print(f'\n❌ {len(ausentes)} módulos SEM a seção `{SECAO}`:\n')
        for slug in ausentes:
            print(f'  {slug}')
        print('\nA cobertura fechou em 100% em 05/ago/2026 — ausência agora é regressão.')
        print('A fila de consultas por módulo está em docs/seo/FILA_PERGUNTAS_POR_MODULO.md.')
        return 1

    if falhas:
        print(f'\n❌ {len(falhas)} módulos fora do contrato de resposta citável:\n')
        for slug, problemas in sorted(falhas.items()):
            print(f'  {slug}')
            for p in problemas:
                print(f'    · {p}')
        print('\nO contrato está em PESQUISA_DEMANDA_BUSCA_2026-08.md e em')
        print('frontend/src/lib/curriculum/temas-perguntas.ts. Resumo: a pergunta é a')
        print('que se digita, a resposta começa pela conclusão e se sustenta sozinha.')
        return 1

    print(f'✅ {len(com_secao)} de {total} módulos com a seção, todos dentro do contrato')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
