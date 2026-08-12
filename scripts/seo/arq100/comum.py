#!/usr/bin/env python3
"""DSL das 100 arquiteturas — uma por solução do catálogo.

## Divisão de propriedade

O `docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md` é a **fonte** do problema, da cadeia
de serviços, da decisão que ensina e da origem da informação. Os arquivos
`familia_*.py` acrescentam **o desenho**: grupos, nós, arestas e os passos
percorríveis. Nada é declarado duas vezes, e o gerador falha se a cadeia do
catálogo mudar por baixo do desenho (campo `checagem`).

Essa separação é o que impede o defeito que já custou uma correção neste repo:
número escrito de cabeça divergindo do artefato. Aqui não há como divergir —
problema e decisão são LIDOS do catálogo em tempo de geração.

## Por que validar limites aqui

`ArchDiagramSchema` recusa `caption` acima de 600 caracteres, `note` acima de 200
e `detail` acima de 500. Zod recusando devolve `null`, e o `BlockRenderer` não
renderiza nada — **sem erro**. Um diagrama estourando limite não aparece como
diagrama quebrado: aparece como diagrama ausente. Falhar na geração é a única
forma de descobrir isso enquanto ainda dá para consertar.
"""
from __future__ import annotations

from dataclasses import dataclass, field

# Limites reais do schema (frontend/src/components/article/blocks/schemas.ts).
LIM = {
    'title': 200, 'caption': 600, 'grupo_label': 120, 'no_label': 120,
    'no_note': 200, 'aresta_label': 160, 'passo_label': 160, 'passo_detail': 500,
    'id': 60, 'service': 60,
}
MAX_GRUPOS = 8
# O teto do gate (`validate_servicos_diagrama.py`) é 7, e o DSL tem de concordar:
# se ele aceitasse 12, o gerador produziria diagramas que reprovam no CI — spec e
# gate discordando é a deriva que os dois existem para impedir. Subiu de 6 para 7
# em 07/ago/2026, olhando quatro playbooks em que cada passo nomeia uma alavanca
# distinta e fundir dois juntaria decisões diferentes.
MAX_PASSOS = 7

# Serviços que podem morar DENTRO de uma VPC do cliente.
#
# Existe porque `kind: 'vpc'` desenha a borda roxa com o selo "VPC", e isso
# afirma isolamento de rede. Bedrock, Knowledge Bases, S3, Glue e Athena são
# regionais: alcançá-los de dentro de uma VPC se faz por endpoint, e eles não
# ficam lá. Usar `vpc` como agrupamento visual ensina errado justamente a
# distinção que a prova de certificação cobra — e o leitor não tem como
# desconfiar, porque o desenho parece autoritativo.
#
# Lambda entra na lista por decisão editorial: função anexada a subrede privada é
# o padrão de produção para alcançar recurso privado, e é a convenção que o resto
# da base já usa.
EM_VPC = {
    'lambda', 'ec2', 'ecs', 'eks', 'fargate', 'batch',
    'rds', 'aurora', 'postgres', 'replica', 'elasticache', 'memorydb', 'redis',
    'opensearch', 'pgvector', 'mongodb', 'clickhouse', 'neptune', 'kafka',
    'efs', 'privatelink', 'alb', 'nlb', 'vpc', 'transitgateway', 'firewall', 'waf',
    # `targetgroup` é vinculado a uma VPC (`vpc_id` é obrigatório na declaração) e
    # os alvos registrados nele moram em sub-rede — mesma lógica que já incluiu
    # `routetable`: objeto da VPC, mesmo sem ENI próprio. Achado ao escrever o L11,
    # cujo segundo diagrama tinha NLB + grupo de destino sem nenhum dos dois na
    # lista — o gate reprovava conteúdo correto porque a lista, não o desenho,
    # estava incompleta.
    'targetgroup',
    # Primitivas de rede (L02). `natgateway` e `subnet` moram numa sub-rede por
    # definição; `internetgateway` e `routetable` são objetos da VPC. Todos são
    # elegíveis, então um grupo com o selo "VPC" que contenha só eles é honesto.
    'natgateway', 'internetgateway', 'routetable', 'subnet', 'eip',
    # Conceituais que representam componente que você hospeda.
    'servidor', 'ferramenta', 'orquestrador', 'subagente', 'retriever',
    'reranker', 'embedder', 'chunker', 'llm', 'bm25',
    # Chaves genéricas de categoria. Elas entram porque são AMBÍGUAS, não porque
    # sejam boas: em `storage-s3-ebs-efs` o nó `storage` representa EBS, que mora
    # numa subrede; em `rede-hibrida-saa`, `network` representa o concentrador de
    # trânsito. Aplicar esta checagem sobre elas produziu três correções ERRADAS
    # na base antiga — e gate que força mudança errada em caso ambíguo é pior que
    # gate ausente. O defeito de fundo dessas chaves é outro, e tem gate próprio:
    # `validate_servicos_diagrama.py`.
    'storage', 'network', 'compute', 'container', 'db', 'database',
}


class ErroDeForma(SystemExit):
    """Estourar limite do schema faz o bloco desaparecer em silêncio na página."""


def _cabe(valor: str, limite: str, onde: str) -> str:
    if len(valor) > LIM[limite]:
        raise ErroDeForma(
            f'{onde}: {limite} com {len(valor)} caracteres (máximo {LIM[limite]}). '
            f'Acima do limite o Zod devolve null e o bloco não renderiza.\n  {valor[:90]}…')
    return valor


@dataclass
class Sol:
    """Uma das cem soluções, com o desenho da arquitetura.

    `n`         — número no catálogo; é a chave que liga ao problema e à decisão.
    `titulo`    — título da seção no módulo (o problema em forma de título).
    `problema`  — o problema em termos de negócio: o que quebra e qual a restrição.
    `checagem`  — trechos que TÊM de continuar na cadeia do catálogo. Guarda de
                  deriva: renomear serviço no catálogo sem redesenhar falha aqui.
    `grupos`    — [(label, kind, [(id, service, label, note)])]
    `arestas`   — [(de, para, label|None, style|None)]
    `passos`    — [(label, detail, [ids], [(de, para)])]
    `legenda`   — o `caption`: a decisão a levar, não a descrição do desenho.
    """
    n: int
    titulo: str
    problema: str
    checagem: tuple[str, ...]
    grupos: list
    arestas: list
    passos: list
    legenda: str
    titulo_diagrama: str = ''
    servicos_extra: str = field(default='')

    # ─── construção do bloco ────────────────────────────────────────────────
    def diagrama(self) -> dict:
        onde = f'solução {self.n}'
        if not 1 <= len(self.grupos) <= MAX_GRUPOS:
            raise ErroDeForma(f'{onde}: {len(self.grupos)} grupos (o schema aceita 1 a {MAX_GRUPOS})')
        if not self.legenda:
            raise ErroDeForma(f'{onde}: sem `caption` — o gate exige, e é onde a decisão mora')
        if not 5 <= len(self.passos) <= MAX_PASSOS:
            raise ErroDeForma(
                f'{onde}: {len(self.passos)} passos. O PADRAO_ENSINO.md exige 5 a {MAX_PASSOS} — '
                f'diagrama que não se percorre é figura.')

        ids: set[str] = set()
        gs = []
        for label, kind, nos in self.grupos:
            if kind not in ('account', 'vpc', 'region', 'plain'):
                raise ErroDeForma(f'{onde}: kind de grupo inválido: {kind!r}')
            if kind == 'vpc' and not any(no[1] in EM_VPC for no in nos):
                raise ErroDeForma(
                    f'{onde}: grupo {label!r} marcado como VPC sem nenhum serviço que '
                    f'more numa VPC ({[no[1] for no in nos]}). A borda roxa afirma '
                    f'isolamento de rede — use `plain` para agrupamento visual.')
            if not nos:
                raise ErroDeForma(f'{onde}: grupo {label!r} sem nó')
            if len(nos) > 5:
                raise ErroDeForma(
                    f'{onde}: grupo {label!r} com {len(nos)} nós. Acima de 5 vira parede '
                    f'de ícone — quebre em camadas (antipadrão registrado na skill).')
            ns = []
            for no in nos:
                nid, svc = no[0], no[1]
                if nid in ids:
                    raise ErroDeForma(f'{onde}: id de nó repetido: {nid!r}')
                ids.add(_cabe(nid, 'id', onde))
                d = {'id': nid, 'service': _cabe(svc, 'service', onde)}
                if len(no) > 2 and no[2]:
                    d['label'] = _cabe(no[2], 'no_label', onde)
                # A `note` é onde mora "o que este serviço decide AQUI". Sem ela o
                # diagrama mostra a topologia e não explica o uso de cada peça —
                # e o nó fica sendo só um ícone com nome. Era o caso de 93 nós
                # (63 deles serviço AWS) antes de a regra existir.
                if len(no) < 4 or not no[3]:
                    raise ErroDeForma(
                        f'{onde}: nó {nid!r} ({svc}) sem `note`. A nota diz o que o '
                        f'serviço decide neste ponto — é o que explica o uso dele.')
                d['note'] = _cabe(no[3], 'no_note', onde)
                ns.append(d)
            gs.append({'label': _cabe(label, 'grupo_label', onde), 'kind': kind, 'nodes': ns})

        pares = set()
        es = []
        for ar in self.arestas:
            de, para = ar[0], ar[1]
            for lado in (de, para):
                if lado not in ids:
                    raise ErroDeForma(
                        f'{onde}: aresta cita nó inexistente {lado!r} — ela sumiria no render')
            d = {'from': de, 'to': para}
            # O rótulo é a LIGAÇÃO: o que trafega ali. Aresta sem rótulo desenha
            # a seta e deixa o leitor supondo o que passa — e supor errado num
            # diagrama de arquitetura é o defeito que ele existia para evitar.
            if len(ar) < 3 or not ar[2]:
                raise ErroDeForma(
                    f'{onde}: aresta {de}>{para} sem rótulo. Diga o que trafega: '
                    f'requisição, trecho, evento, resultado, decisão.')
            d['label'] = _cabe(ar[2], 'aresta_label', onde)
            if len(ar) > 3 and ar[3]:
                if ar[3] not in ('solid', 'dashed'):
                    raise ErroDeForma(f'{onde}: style de aresta inválido: {ar[3]!r}')
                d['style'] = ar[3]
            pares.add(f'{de}>{para}')
            es.append(d)

        ps = []
        for label, detalhe, nos, eds in self.passos:
            for nid in nos:
                if nid not in ids:
                    raise ErroDeForma(f'{onde}: passo {label!r} acende nó inexistente {nid!r}')
            refs = []
            for a, b in eds:
                # O renderizador compara a string literal `origem>destino`. Com
                # `->` o passo acende sem aresta, em silêncio.
                ref = f'{a}>{b}'
                if ref not in pares:
                    raise ErroDeForma(
                        f'{onde}: passo {label!r} acende aresta {ref!r} que não foi declarada')
                refs.append(ref)
            ps.append({'label': _cabe(label, 'passo_label', onde),
                       'detail': _cabe(detalhe, 'passo_detail', onde),
                       'nodes': list(nos), 'edges': refs})

        titulo = self.titulo_diagrama or self.titulo
        return {'type': 'arch_diagram', 'data': {
            'title': _cabe(titulo, 'title', onde),
            'groups': gs, 'edges': es,
            'caption': _cabe(self.legenda, 'caption', onde),
            'steps': ps,
        }}

    def servicos_no_desenho(self) -> list[str]:
        return [no[1] for _, _, nos in self.grupos for no in nos]


# ─── blocos comuns ───────────────────────────────────────────────────────────

def p(txt: str) -> dict:
    """`paragraph.content` é ARRAY de nós de texto rico, não string.

    Zod recusa string e o bloco desaparece. `**assim**` vira nó com `bold`.
    """
    nos = []
    for i, parte in enumerate(txt.split('**')):
        if not parte:
            continue
        no = {'text': parte}
        if i % 2 == 1:
            no['bold'] = True
        nos.append(no)
    return {'type': 'paragraph', 'data': {'content': nos or [{'text': txt}]}}


def sec(titulo: str, filhos: list) -> dict:
    return {'type': 'section', 'data': {'title': titulo}, 'children': filhos}


def callout(variante: str, titulo: str, txt: str) -> dict:
    return {'type': 'callout', 'data': {'variant': variante, 'title': titulo, 'content': txt}}


def tabela(colunas: list[str], linhas: list[list[str]]) -> dict:
    return {'type': 'comparison_table', 'data': {'columns': colunas, 'rows': linhas}}


def chave_valor(itens: list[tuple[str, str]]) -> dict:
    """`key_value` lê `k`/`v` (ou `key`/`value`). Outro nome sai da tela."""
    return {'type': 'key_value', 'data': {'items': [{'k': k, 'v': v} for k, v in itens]}}


def quiz(q: str, opcoes: list[str], correta: int, expl: str) -> dict:
    return {'type': 'quiz', 'data': {'question': q, 'options': opcoes,
                                     'correctIndex': correta, 'explanation': expl}}


def qa(q: str, a: str) -> dict:
    return {'type': 'qa_item', 'data': {'question': q, 'answer': a}}
