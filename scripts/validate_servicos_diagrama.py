#!/usr/bin/env python3
"""Toda chave `service` usada em diagrama existe no catálogo de ícones?

Existe por causa de um defeito real de ago/2026. `serviceDef()` tem um FALLBACK
que devolve um cubo cinza rotulado "Serviço" para qualquer chave desconhecida —
sensato, porque evita quebrar a página. O efeito colateral é que erro de
digitação e chave inexistente NÃO produzem sintoma nenhum no build nem no teste:
só um ícone errado no desenho, que ninguém compara com o pretendido.

Foi assim que 148 nós ficaram cinza. Os autores escreveram `service: 'network'`
querendo dizer "é rede, mas não é um serviço nomeado" — o catálogo não tinha
genéricos por categoria, e os nós de rede, compute e storage de várias trilhas
de certificação renderizavam com a cor de "Fora da AWS". O texto aparecia certo,
porque vem do `label` do nó; só a semântica visual se perdia.

A lição é a mesma que este projeto já pagou quatro vezes: o gate que verifica se
o bloco é VÁLIDO não verifica se ele mostra o que o autor quis mostrar. Fallback
silencioso precisa de gate, senão vira defeito permanente.

Uso:
    python3 scripts/validate_servicos_diagrama.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ICONES = RAIZ / 'frontend' / 'src' / 'components' / 'article' / 'AwsIcon.tsx'
ARTIGOS = RAIZ / 'scripts' / 'seeds' / 'articles'


def catalogo() -> set[str]:
    src = ICONES.read_text(encoding='utf-8')
    ini = src.index('AWS_SERVICES')
    fim = src.index('export type AwsServiceKey')
    return set(re.findall(r'^\s{2}([a-z0-9_]+):\s*\{', src[ini:fim], re.M))


def usados() -> dict[str, list[str]]:
    """service -> slugs que o usam."""
    onde: dict[str, list[str]] = {}

    for caminho in sorted(ARTIGOS.glob('*.json')):
        def andar(blocos):
            for b in blocos:
                dados = b.get('data') or {}
                for grupo in dados.get('groups') or []:
                    for no in grupo.get('nodes') or []:
                        if isinstance(no, dict) and no.get('service'):
                            onde.setdefault(no['service'], []).append(caminho.stem)
                andar(b.get('children') or [])

        andar(json.loads(caminho.read_text(encoding='utf-8'))['blocks'])
    return onde


def vpc_falsa() -> list[tuple[str, str, list[str]]]:
    """Grupos com `kind: 'vpc'` sem nenhum recurso que more numa VPC.

    ─── O segundo defeito da mesma família ───

    `kind: 'vpc'` desenha borda roxa com o selo "VPC". Isso AFIRMA isolamento de
    rede. Bedrock, Knowledge Bases, S3, Glue, Athena e DynamoDB são regionais:
    alcançá-los de dentro de uma VPC se faz por endpoint, e eles não ficam lá.

    Usar `vpc` como agrupamento visual ensina errado exatamente a distinção que as
    provas de certificação concentram — e o leitor não tem como desconfiar, porque
    o desenho parece autoritativo. Era o caso de 104 grupos na trilha de
    arquiteturas e de 17 na base antiga, em ago/2026.

    A lista de serviços elegíveis vive em `scripts/seo/arq100/comum.py`, junto do
    gerador que a usa na hora de escrever — para não haver duas listas divergindo.
    Chaves genéricas de categoria (`storage`, `network`) contam como elegíveis por
    serem ambíguas: aplicar a regra sobre elas produziu três correções ERRADAS na
    primeira execução, e gate que força mudança errada em caso ambíguo é pior que
    gate ausente.
    """
    sys.path.insert(0, str(RAIZ / 'scripts' / 'seo' / 'arq100'))
    from comum import EM_VPC  # noqa: PLC0415

    achados: list[tuple[str, str, list[str]]] = []
    for caminho in sorted(ARTIGOS.glob('*.json')):
        def andar(blocos):
            for b in blocos:
                if b.get('type') in ('arch_diagram', 'aws_diagram'):
                    for grupo in (b.get('data') or {}).get('groups') or []:
                        if grupo.get('kind') != 'vpc':
                            continue
                        svcs = [n.get('service') for n in grupo.get('nodes') or []
                                if isinstance(n, dict)]
                        if not any(s in EM_VPC for s in svcs):
                            achados.append((caminho.stem, grupo.get('label') or '(sem rótulo)',
                                            [s for s in svcs if s]))
                andar(b.get('children') or [])

        andar(json.loads(caminho.read_text(encoding='utf-8'))['blocks'])
    return achados


# ─────────────────────────────────────────────────────────────────────────────
# A barra de QUALIDADE, acima da barra de validade
# ─────────────────────────────────────────────────────────────────────────────
#
# As checagens acima respondem "o diagrama é válido?". Estas respondem "o
# diagrama ensina?" — e são coisas diferentes. Um diagrama com nó sem nota,
# aresta sem rótulo e três passos passa em tudo que existia antes e ainda assim é
# uma figura: o leitor vê caixas ligadas e não sabe o que trafega em cada linha
# nem por que aquela peça está ali.
#
# Números medidos em 07/ago/2026, antes de qualquer correção — é o que torna a
# descida verificável, e é por isso que ficam escritos aqui e não só no relatório:
#
#     871 arestas sem `label`      (de 1.204 arestas em 303 diagramas)
#     218 nós sem `note`           (de 2.497 nós)
#      16 diagramas com menos de 5 passos   (14 com 4 · 2 com 3)
#       3 arestas com rótulo genérico ("resposta", nos três casos)
#
# Modo relatório é o padrão de propósito: ligar em falha antes de pagar a dívida
# reprovaria o CI em todo commit, e a resposta previsível a isso é desligar o
# gate. `--strict` liga a falha, e a tarefa 2.7 da mudança troca o padrão quando
# o contador chegar a zero.

# Rótulo que não diz nada sobre o que trafega. Lista CURTA de propósito: rótulo
# legítimo pode ser curto ("SQL", "gRPC", "token JWT"), e uma lista longa
# reprovaria escrita boa. Só entram aqui palavras que, sozinhas, valem para
# qualquer aresta de qualquer diagrama — e por isso não informam nenhuma.
ROTULOS_GENERICOS = {
    'dados', 'chamada', 'requisição', 'requisicao', 'resposta',
    'informação', 'informacao', 'payload', 'request', 'response', 'data',
}

KINDS_VALIDOS = ('plain', 'vpc', 'region', 'account')


def _diagramas():
    """(slug, título, dados) de todo arch_diagram da base."""
    for caminho in sorted(ARTIGOS.glob('*.json')):
        achados = []

        def andar(blocos):
            for b in blocos:
                if b.get('type') in ('arch_diagram', 'aws_diagram'):
                    achados.append(b.get('data') or {})
                andar(b.get('children') or [])

        andar(json.loads(caminho.read_text(encoding='utf-8'))['blocks'])
        for dados in achados:
            yield caminho.stem, dados.get('title') or '(sem título)', dados


def qualidade() -> dict[str, list[str]]:
    """Violações da barra de qualidade, agrupadas por regra."""
    v: dict[str, list[str]] = {
        'no_sem_nota': [],
        'nota_repete_rotulo': [],
        'aresta_sem_rotulo': [],
        'rotulo_generico': [],
        'passos_abaixo_de_5': [],
        'passos_acima_de_7': [],
        'passo_sem_destaque': [],
        'passo_com_aresta_inexistente': [],
        'kind_invalido': [],
    }

    for slug, titulo, d in _diagramas():
        onde = f'{slug} · "{titulo}"'
        ids: set[str] = set()
        for g in d.get('groups') or []:
            kind = g.get('kind', 'plain')
            if kind not in KINDS_VALIDOS:
                # `edge` chegou a estar documentado na skill da casa e não existe
                # em schema nenhum: o adapter o troca por `plain` em silêncio, e o
                # autor acredita ter desenhado uma borda.
                v['kind_invalido'].append(
                    f'{onde} · grupo "{g.get("label") or "(sem rótulo)"}" usa '
                    f'kind="{kind}" — válidos: {"|".join(KINDS_VALIDOS)}')
            for n in g.get('nodes') or []:
                if not isinstance(n, dict):
                    continue
                if n.get('id'):
                    ids.add(n['id'])
                rotulo = (n.get('label') or '').strip()
                nota = (n.get('note') or '').strip()
                if not nota:
                    v['no_sem_nota'].append(f'{onde} · nó "{n.get("id")}" ({rotulo})')
                    continue
                # Nota que repete o rótulo ocupa o espaço da nota sem acrescentar
                # nada — pior que nota ausente, porque parece preenchida.
                baixa_nota, baixa_rotulo = nota.lower(), rotulo.lower()
                if baixa_nota == baixa_rotulo or (baixa_rotulo and baixa_nota in baixa_rotulo) \
                        or baixa_nota == (n.get('service') or '').lower():
                    v['nota_repete_rotulo'].append(
                        f'{onde} · nó "{n.get("id")}" · nota "{nota}" repete o rótulo')

        arestas = d.get('edges') or []
        declaradas = set()
        for e in arestas:
            if not isinstance(e, dict):
                continue
            par = f'{e.get("from")}>{e.get("to")}'
            declaradas.add(par)
            rotulo = (e.get('label') or '').strip()
            if not rotulo:
                v['aresta_sem_rotulo'].append(f'{onde} · aresta {par}')
            elif rotulo.lower() in ROTULOS_GENERICOS:
                v['rotulo_generico'].append(f'{onde} · aresta {par} · rótulo "{rotulo}"')

        passos = d.get('steps') or []
        # Abaixo de 5 o percurso não chega a cobrir a decisão do diagrama — é o
        # defeito, e é o número que a dívida mede.
        #
        # O teto é 7, e não 6, por uma revisão feita olhando os quatro casos. Os
        # quatro diagramas de 7 passos são playbooks em que cada passo nomeia uma
        # alavanca distinta — "cache de prefixo", "disciplina de saída", "o que
        # cobra parado". Fundir dois deles para caber em 6 juntaria decisões que
        # não são a mesma, e a régua existe para o percurso ensinar, não para o
        # percurso ter um comprimento. Acima de 7 o passo deixa de ser lido.
        if len(passos) < 5:
            v['passos_abaixo_de_5'].append(f'{onde} · {len(passos)} passo(s)')
        elif len(passos) > 7:
            v['passos_acima_de_7'].append(f'{onde} · {len(passos)} passo(s)')
        for p in passos:
            if not isinstance(p, dict):
                continue
            nos_p = [n for n in (p.get('nodes') or []) if n]
            arestas_p = [a for a in (p.get('edges') or []) if a]
            if not nos_p and not arestas_p:
                # Passo que não acende nada é texto solto: o leitor clica e o
                # desenho não muda, então o passo não é percorrível.
                v['passo_sem_destaque'].append(f'{onde} · passo "{p.get("label")}"')
            for a in arestas_p:
                if a.count('>') != 1:
                    v['passo_com_aresta_inexistente'].append(
                        f'{onde} · passo "{p.get("label")}" · "{a}" não tem a forma a>b')
                elif a not in declaradas:
                    v['passo_com_aresta_inexistente'].append(
                        f'{onde} · passo "{p.get("label")}" · aresta "{a}" não está '
                        f'declarada em `edges`')
    return v


def relatar_qualidade(estrito: bool) -> bool:
    """Imprime o estado da barra de qualidade. Devolve True se houver violação."""
    v = qualidade()
    total_diag = sum(1 for _ in _diagramas())
    nomes = {
        'no_sem_nota': 'nó sem `note` — o leitor vê o ícone e não sabe o papel da peça',
        'nota_repete_rotulo': 'nota que repete o rótulo — ocupa o espaço sem informar',
        'aresta_sem_rotulo': 'aresta sem `label` — a linha existe e não diz o que trafega',
        'rotulo_generico': 'rótulo genérico — vale para qualquer aresta, logo informa nenhuma',
        'passos_abaixo_de_5': 'menos de 5 passos — o percurso não cobre a decisão do diagrama',
        'passos_acima_de_7': 'mais de 7 passos — o percurso deixa de ser lido até o fim',
        'passo_sem_destaque': 'passo que não acende nó nem aresta — não é percorrível',
        'passo_com_aresta_inexistente': 'passo apontando aresta que não existe — destaca nada',
    }
    nomes['kind_invalido'] = 'kind fora de plain|vpc|region|account — o adapter troca em silêncio'

    total = sum(len(x) for x in v.values())
    print(f'\n── barra de qualidade · {total_diag} diagramas ──')
    if total == 0:
        print('✅ nota, rótulo, passos e kind: nada a corrigir.')
        return False

    # Linha de base de 07/ago/2026, para a descida ser verificável a olho.
    BASE = {'aresta_sem_rotulo': 871, 'no_sem_nota': 218,
            'passos_abaixo_de_5': 16,
            'rotulo_generico': 3}
    for chave, itens in v.items():
        if not itens:
            continue
        base = BASE.get(chave)
        delta = f'  (base 07/ago: {base})' if base is not None else ''
        print(f'\n  {len(itens):>4}  {nomes[chave]}{delta}')
        for i in itens[:6]:
            print(f'        {i}')
        if len(itens) > 6:
            print(f'        … e {len(itens) - 6} outro(s)')

    print(f'\n  total: {total} violação(ões) da barra de qualidade')
    if not estrito:
        print('  (modo relatório — `--strict` faz falhar)')
    return True


def main() -> None:
    estrito = '--strict' in sys.argv
    conhecidas = catalogo()
    onde = usados()
    total = sum(len(v) for v in onde.values())

    orfas = {k: v for k, v in onde.items() if k not in conhecidas}

    print(f'{len(conhecidas)} chaves no catálogo · '
          f'{len(onde)} distintas usadas em {total} nós de diagrama')

    if orfas:
        print(f'\n❌ {len(orfas)} chave(s) fora do catálogo — renderizam como cubo '
              f'cinza genérico, sem sintoma no build:')
        for chave, slugs in sorted(orfas.items(), key=lambda x: -len(x[1])):
            amostra = ', '.join(sorted(set(slugs))[:3])
            print(f'   {chave}  ×{len(slugs)}  ({amostra})')
        print('\n   Conserto: adicionar a chave em AWS_SERVICES (AwsIcon.tsx) '
              'ou corrigir o seed.')
        sys.exit(1)

    # Entrada de catálogo que ninguém usa não é defeito — pode ser preparo para
    # conteúdo futuro. Só relata, para o catálogo não inchar sem ninguém ver.
    nunca = sorted(conhecidas - set(onde))
    if nunca:
        print(f'\nℹ️  {len(nunca)} chave(s) no catálogo ainda sem uso: '
              f'{", ".join(nunca[:12])}'
              + (' …' if len(nunca) > 12 else ''))

    falsas = vpc_falsa()
    if falsas:
        print(f'\n❌ {len(falsas)} grupo(s) com o selo "VPC" sem nenhum recurso que '
              f'more numa VPC — o desenho afirma isolamento de rede que não existe:')
        for slug, rotulo, svcs in falsas:
            print(f'   {slug}  "{rotulo}"  {svcs}')
        print('\n   Conserto: `kind: "plain"` para agrupamento visual. `vpc` é para '
              'recurso\n   em subrede (Lambda anexada, RDS, ElastiCache, endpoint privado).')
        sys.exit(1)

    print('\n✅ toda chave de diagrama existe no catálogo — nenhum ícone cai no '
          'fallback.')
    print('✅ nenhum grupo afirma isolamento de rede que não existe.')

    if relatar_qualidade(estrito) and estrito:
        sys.exit(1)


if __name__ == '__main__':
    main()
