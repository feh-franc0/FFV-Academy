#!/usr/bin/env python3
"""Gera os 10 módulos de arquitetura — uma arquitetura para cada uma das 100 soluções.

## O que este gerador resolve

O módulo `aws-ia-100-solucoes` é um CATÁLOGO: cem linhas de tabela com problema,
cadeia de serviços e a decisão que ensina. Catálogo responde "o que existe". Não
responde "como se desenha" — e era isso que faltava, porque a cadeia em texto
(`A → B → C`) não mostra o que é paralelo, o que é assíncrono, onde entra a
revisão humana nem o que a camada de governança envolve.

Aqui cada uma das cem soluções ganha um `arch_diagram` de verdade, com grupos,
arestas rotuladas, legenda que entrega a decisão e 5 passos percorríveis.

## Quem é dono do quê

O catálogo é a **fonte** do problema, da cadeia, da decisão e da origem da
informação. Os `arq100/familia_*.py` acrescentam o **desenho** e a prosa do
problema. Cada solução declara em `checagem` os trechos que têm de continuar na
cadeia do catálogo: renomear serviço lá sem redesenhar aqui falha na geração, em
vez de produzir desenho que contradiz a tabela ao lado.

Uso:
    python3 scripts/seo/gerar_arquiteturas_100.py            # gera os seeds
    python3 scripts/seo/gerar_arquiteturas_100.py --conferir  # só confere, não escreve
"""
from __future__ import annotations

import importlib
import json
import pathlib
import re
import sys

AQUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI / 'arq100'))

from comum import callout, chave_valor, p, qa, sec, tabela  # noqa: E402

REPO = AQUI.parents[1]

# A sequência das 10 famílias na trilha (`frontend/.../trails/trail-arq-ia-aws.ts`)
# é atendimento → documentos → busca → agentes → copiloto → dados → conteúdo →
# risco → plataforma → operação — a mesma ordem alfabética dos arquivos
# `familia_01..10.py`. O último módulo da trilha já declara
# `nextSuggested: ['aif-intro']` lá (contrato de `jornada-ligacao.test.ts`: toda
# trilha aponta pra a seguinte da jornada). Repetido aqui só como STRING de
# destino do callout de fechamento — não é fonte nova, é o mesmo fato dito no
# corpo do artigo, que é onde o achado de 12/ago/2026 mediu ausência: 0 de 10
# módulos desta trilha tinham QUALQUER callout, contra 100 de 100 dos labs.
PROXIMA_TRILHA_NOME = 'AWS AI Practitioner (AIF-C01)'
PROXIMA_TRILHA_MODULO = 'aif-intro'
CAT = REPO / 'docs' / 'seo' / 'CATALOGO_100_SOLUCOES_AWS_IA.md'
SEEDS = REPO / 'scripts' / 'seeds' / 'articles'

ORIGEM_LONGA = {
    'C': 'Caso público documentado, com fonte citada no catálogo',
    'A': 'Arquitetura de referência publicada pela AWS',
    'P': 'Padrão composto — a topologia que se repete, sem cliente nomeado',
}


# ─── Fonte: o catálogo ───────────────────────────────────────────────────────

def ler_catalogo() -> dict[int, dict]:
    texto = CAT.read_text(encoding='utf-8')
    linhas: dict[int, dict] = {}
    familias: list[str] = []
    for m in re.finditer(r'^## \d+\. (.+?)\n\n\| # \|.*?\n\|[-| ]+\|\n((?:\|.*\n)+)',
                         texto, re.M):
        familias.append(m.group(1).strip())
        for ln in m.group(2).strip().split('\n'):
            cols = [c.strip() for c in ln.strip().strip('|').split(' | ')]
            if len(cols) != 5:
                continue
            n = int(cols[0])
            marca = re.sub(r'[^CAP]', '', cols[4])[:1]
            fonte = re.search(r'\[(\d+)\]', cols[4])
            linhas[n] = {
                'familia': m.group(1).strip(),
                'problema': cols[1], 'cadeia': cols[2], 'ensina': cols[3],
                'origem': marca, 'fonte': fonte.group(1) if fonte else None,
            }
    if len(familias) != 10 or len(linhas) != 100:
        raise SystemExit(
            f'catálogo mudou de forma: {len(familias)} famílias, {len(linhas)} soluções. '
            f'Este gerador deriva do catálogo — corrija lá ou ajuste o leitor aqui.')
    return linhas


# ─── Montagem de um módulo ───────────────────────────────────────────────────

def montar(mod, catalogo: dict[int, dict], proxima_familia: str | None) -> tuple[str, list[dict]]:
    blocos: list[dict] = []
    nums = [s.n for s in mod.SOLUCOES]

    if len(nums) != 10:
        raise SystemExit(f'{mod.SLUG}: {len(nums)} soluções (esperado 10)')
    if len(set(nums)) != 10:
        raise SystemExit(f'{mod.SLUG}: número de solução repetido')

    familias = {catalogo[n]['familia'] for n in nums}
    if familias != {mod.NOME}:
        raise SystemExit(
            f'{mod.SLUG}: as soluções {nums} pertencem a {familias} no catálogo, '
            f'mas o módulo declara {mod.NOME!r}')

    # Abertura: o que une as dez, e o índice das dez pela decisão que ensinam.
    blocos.append(sec('O que une estas dez arquiteturas', [
        *mod.ABERTURA,
        tabela(['#', 'Problema', 'A decisão que transfere'],
               [[str(n), catalogo[n]['problema'], catalogo[n]['ensina']] for n in nums]),
    ]))

    # Uma seção por solução: problema, desenho, cadeia e origem.
    for s in mod.SOLUCOES:
        linha = catalogo[s.n]
        for trecho in s.checagem:
            if trecho.lower() not in linha['cadeia'].lower():
                raise SystemExit(
                    f'solução {s.n}: a checagem esperava {trecho!r} na cadeia do '
                    f'catálogo, e a cadeia hoje é:\n  {linha["cadeia"]}\n'
                    f'O desenho pode ter ficado desatualizado — confira antes de mudar '
                    f'a checagem.')
        origem = ORIGEM_LONGA[linha['origem']]
        if linha['fonte']:
            origem += f' — fonte [{linha["fonte"]}]'
        blocos.append(sec(s.titulo, [
            p(s.problema),
            s.diagrama(),
            chave_valor([
                ('Cadeia de serviços', linha['cadeia']),
                ('A decisão que transfere', linha['ensina']),
                ('Origem da informação', origem),
            ]),
        ]))

    blocos.append(sec('Perguntas frequentes', [qa(q, a) for q, a in mod.PERGUNTAS]))
    blocos.append(sec('Fixando', list(mod.QUIZZES)))

    # Callout de fechamento (achado da auditoria pedagógica de 12/ago/2026:
    # 0 dos 10 módulos desta trilha tinham QUALQUER callout — o gerador nunca
    # emitiu um, contra 100/100 dos laboratórios escritos à mão). Aponta um
    # destino real e nomeado, igual ao padrão "Próximo passo"/"Próximo
    # laboratório" já usado nos módulos escritos — não um resumo genérico.
    if proxima_familia:
        blocos.append(callout(
            'info', 'Próximo passo',
            f'A próxima família de arquiteturas é **{proxima_familia}** — mesma '
            f'estrutura: dez soluções, cada uma com o desenho completo e a '
            f'decisão que ela transfere. Se o que falta é praticar em vez de '
            f'ler — nenhum destes desenhos tem código, de propósito, porque '
            f'quem constrói é a trilha 100 Laboratórios de Arquitetura AWS —, '
            f'comece por um laboratório da família equivalente.',
        ))
    else:
        blocos.append(callout(
            'info', 'Próximo passo',
            f'Esta é a última das dez famílias. A trilha seguinte da jornada é '
            f'{PROXIMA_TRILHA_NOME}, que começa em **{PROXIMA_TRILHA_MODULO}** — '
            f'a certificação de IA na AWS que cobra exatamente as decisões que '
            f'estas 100 arquiteturas ensinaram a reconhecer.',
        ))
    return mod.SLUG, blocos


def numerar(blocos: list[dict], prefixo: str) -> None:
    """Ids e posições — o importador e o renderizador dependem dos dois."""
    cont = [0]

    def andar(bs):
        for pos, b in enumerate(bs):
            b['id'] = f'{prefixo}-{cont[0]}'
            cont[0] += 1
            b['position'] = pos
            if 'children' in b:
                andar(b['children'])

    andar(blocos)


def main() -> int:
    conferir = '--conferir' in sys.argv
    catalogo = ler_catalogo()
    print(f'catálogo lido: 10 famílias · 100 soluções')

    arquivos = sorted((AQUI / 'arq100').glob('familia_*.py'))
    if not arquivos:
        raise SystemExit('nenhum arq100/familia_*.py encontrado')

    # Importa TODOS antes de montar qualquer um — o callout de fechamento do
    # módulo i precisa do nome da família do módulo i+1, que só existe depois
    # do import dele.
    modulos = [importlib.import_module(arq.stem) for arq in arquivos]

    vistos: set[int] = set()
    servicos: set[str] = set()
    total_diag = 0

    for i, mod in enumerate(modulos):
        proxima_familia = modulos[i + 1].NOME if i + 1 < len(modulos) else None
        slug, blocos = montar(mod, catalogo, proxima_familia)
        repetidos = vistos & {s.n for s in mod.SOLUCOES}
        if repetidos:
            raise SystemExit(f'{slug}: soluções já usadas em outra família: {sorted(repetidos)}')
        vistos |= {s.n for s in mod.SOLUCOES}
        for s in mod.SOLUCOES:
            servicos |= set(s.servicos_no_desenho())
        total_diag += 10

        numerar(blocos, slug.replace('arq-ia-aws-', 'a'))
        doc = {'slug': slug, 'title': None, 'blocks': blocos}
        caracteres = len(json.dumps(doc, ensure_ascii=False))
        print(f'  {slug:32} 10 arquiteturas · {caracteres:>7,} caracteres de JSON')
        if not conferir:
            (SEEDS / f'{slug}.json').write_text(
                json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    faltam = sorted(set(range(1, 101)) - vistos)
    print(f'\n{total_diag} arquiteturas em {len(arquivos)} módulos · '
          f'{len(servicos)} chaves de serviço distintas')
    if faltam:
        print(f'⚠️  {len(faltam)} solução(ões) do catálogo ainda sem arquitetura: '
              f'{faltam[:12]}{" …" if len(faltam) > 12 else ""}')
        return 0 if conferir else 0
    print('✅ as 100 soluções do catálogo têm arquitetura desenhada.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
