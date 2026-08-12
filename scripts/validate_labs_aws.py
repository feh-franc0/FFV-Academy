#!/usr/bin/env python3
"""Gate da série de 100 laboratórios de arquitetura AWS (`trail-labs-aws`).

─── O que separa um laboratório de um `terraform apply` narrado ──────────────

A série tem uma promessa específica, escrita em `.claude/skills/lab-arquitetura-aws.md`
(regra nº 1) e no catálogo `docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md`: cada
laboratório mostra **TRÊS arquiteturas** — a mínima, para aprender; a de produção; e a
evolução em níveis até dados e IA. As duas primeiras são desenho e precisam ter
topologias diferentes; a terceira é escada de níveis, não desenho. Com as três, o aluno
entende não só como montar, mas QUANDO a solução precisa mudar. É o raciocínio que se
espera de um arquiteto, e é o que distingue esta série de um tutorial.

Sem gate, a promessa se dissolve em silêncio: o segundo diagrama vira uma cópia do
primeiro com uma caixa a mais, a terceira arquitetura simplesmente não é escrita, a
seção de limpeza some (e o aluno paga NAT Gateway por um mês), e o entregável vira
"você aprendeu sobre ECS".

A checagem da terceira arquitetura entrou depois das outras, em 07/ago/2026, e o vão
na numeração (havia 1, 2, 3, 5) era o rastro da ausência: o contrato estava escrito em
dois documentos e cobrado por nenhum.

Cada checagem abaixo corresponde a uma dessas dissoluções.

Uso:
    python3 scripts/validate_labs_aws.py            # relatório
    python3 scripts/validate_labs_aws.py --strict   # falha
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARTIGOS = RAIZ / 'scripts/seeds/articles'
TRILHA = RAIZ / 'frontend/src/lib/curriculum/trails/trail-labs-aws.ts'

# Recursos que continuam cobrando depois que o aluno "terminou". Cada um já
# apareceu em fatura de alguém que seguiu um tutorial e fechou o navegador.
#
# `cria` é o tipo de recurso do Terraform, e é ele que decide se o laboratório
# CRIA a coisa. Detectar uso pela prosa era frouxo: o L01 explica por que usou
# endpoint de VPC EM VEZ de NAT Gateway, e a menção fazia o gate exigir que a
# limpeza falasse de um recurso que o laboratório não cria. Gate que reprova
# conteúdo correto é gate que alguém desliga.
#
# `menciona` são os termos que contam como cobertura na seção de limpeza — ali a
# prosa vale, porque o que importa é o leitor encontrar o recurso pelo nome que
# ele conhece.
#
# Cada entrada de `menciona` carrega TRÊS vocabulários, e a razão é concreta: o L03
# foi reprovado por escrever "grupo de logs" e `delete-log-group` numa plataforma
# em português, enquanto o gate só conhecia "log group". Exigir o termo inglês
# empurraria o autor a escrever inglês no meio da prosa em PT-BR — o gate estaria
# ditando estilo em vez de cobrar cobertura. Então:
#   · o nome em inglês, que é como a documentação da AWS o chama;
#   · o nome em português, que é como o módulo o escreve;
#   · o tipo do Terraform e o verbo da CLI, que não têm idioma e são a âncora
#     mais confiável das três.
COBRA_PARADO = {
    'nat_gateway': {
        'cria': ['aws_nat_gateway'],
        'menciona': ['nat gateway', 'aws_nat_gateway', 'describe-nat-gateways'],
    },
    'elastic_ip': {
        'cria': ['aws_eip'],
        'menciona': ['elastic ip', 'aws_eip', 'describe-addresses', 'release-address'],
    },
    'banco_rds': {
        'cria': ['aws_db_instance', 'aws_rds_cluster'],
        'menciona': ['rds', 'snapshot', 'aurora'],
    },
    # Só o de INTERFACE cobra (por hora e por AZ). O de GATEWAY (S3, DynamoDB) é
    # gratuito — a checagem 2 detecta isso pelo `vpc_endpoint_type` declarado, e o
    # L14 foi o caso que expôs a lacuna: exigir menção na limpeza com a frase
    # "continua cobrando 24 h por dia" sobre um endpoint Gateway seria o gate
    # afirmando um preço que verificou errado. Ver checagem 2.
    'endpoint_de_vpc_interface': {
        'cria': ['aws_vpc_endpoint'],
        'menciona': ['vpc endpoint', 'aws_vpc_endpoint', 'endpoint de vpc', 'describe-vpc-endpoints'],
    },
    'load_balancer': {
        'cria': ['aws_lb'],
        # "ALB" é a sigla que todo módulo da série usa desde o L01 — achado no
        # L55, cuja tabela de limpeza já dizia "ALB, serviço ECS" e reprovava
        # porque a lista só reconhecia a forma por extenso ou o tipo do
        # Terraform. Mesmo padrão do "grupo de logs" no L03: o gate cobrando o
        # termo que ELE conhece, não o que o módulo escreve.
        'menciona': ['load balancer', 'balanceador', 'aws_lb', 'alb',
                     'describe-load-balancers', 'delete-load-balancer', 'elbv2'],
    },
    'opensearch': {
        'cria': ['aws_opensearch_domain'],
        'menciona': ['opensearch', 'describe-domain', 'delete-domain'],
    },
    'log_group': {
        'cria': ['aws_cloudwatch_log_group'],
        'menciona': ['log group', 'grupo de logs', 'aws_cloudwatch_log_group',
                     'describe-log-groups', 'delete-log-group', 'retention', 'retenção'],
    },
    'registro_ecr': {
        'cria': ['aws_ecr_repository'],
        'menciona': ['ecr', 'repositório', 'repositorio', 'delete-repository',
                     'batch-delete-image'],
    },
}


def blocos(doc: dict):
    def andar(bs):
        for b in bs or []:
            yield b
            yield from andar(b.get('children'))
    return andar(doc.get('blocks'))


# Chaves de `data` que não são prosa: identificador, nome de ícone, tipo de grupo
# e caminho de imagem. Entram no texto e produzem casamento falso — `kind: "vpc"`
# faria qualquer busca por "vpc" achar rede onde não há.
NAO_E_PROSA = ('id', 'service', 'kind', 'src')


def colher(v, partes: list[str]) -> None:
    """Acumula em `partes` toda string de um `data`, menos as que não são prosa."""
    if isinstance(v, str):
        partes.append(v)
    elif isinstance(v, list):
        for x in v:
            colher(x, partes)
    elif isinstance(v, dict):
        for k, x in v.items():
            if k not in NAO_E_PROSA:
                colher(x, partes)


def texto_visivel(doc: dict) -> str:
    partes: list[str] = []
    for b in blocos(doc):
        colher(b.get('data') or {}, partes)
    return '\n'.join(partes)


def secao(doc: dict, padrao: str) -> tuple[str, list[dict]]:
    """(texto em minúsculas, blocos internos) da seção cujo TÍTULO casa `padrao`.

    Localizar a seção pelo título, e não pela primeira aparição da palavra no texto,
    é a lição que este helper carrega. A primeira versão da checagem de limpeza usava
    `baixo.find('limpeza')` e caía num comentário de Terraform que dizia "ver a
    limpeza": a janela passava a cobrir o código em vez da seção, e o gate acusava
    ausência de menção num laboratório que mencionava tudo. Gate que reprova conteúdo
    correto é gate que alguém desliga.
    """
    for b in blocos(doc):
        if b.get('type') != 'section':
            continue
        titulo = str((b.get('data') or {}).get('title') or '')
        if not re.search(padrao, titulo, re.I):
            continue
        partes: list[str] = []
        internos: list[dict] = []

        def andar(bs):
            for x in bs or []:
                internos.append(x)
                colher(x.get('data') or {}, partes)
                andar(x.get('children'))

        colher(b.get('data') or {}, partes)
        andar(b.get('children'))
        return '\n'.join(partes).lower(), internos
    return '', []


def niveis_declarados(bloco: dict) -> list[str]:
    """Os níveis que um bloco enumera, seja `layer_stack` ou `comparison_table`.

    Os dois formatos estão em uso e os dois ensinam: o L01 usa `layer_stack`, porque
    cada nível tem uma frase e uma nota; o L02 usa `comparison_table`, porque as três
    dimensões viram três colunas e ficam comparáveis lado a lado. O gate cobra a
    INFORMAÇÃO, não o bloco — cobrar o bloco empurraria o autor para a forma errada
    justamente quando a outra ensina melhor.
    """
    d = bloco.get('data') or {}
    if bloco.get('type') == 'layer_stack':
        return [str(c.get('label') or '') for c in d.get('layers') or []]
    if bloco.get('type') == 'comparison_table':
        return [str((linha or [''])[0]) for linha in d.get('rows') or []]
    return []


def slugs_da_trilha() -> list[str]:
    if not TRILHA.exists():
        return []
    return re.findall(r"slug:\s*'([^']+)'", TRILHA.read_text(encoding='utf-8'))


def topologia(d: dict) -> tuple[frozenset, frozenset]:
    """Assinatura de um diagrama: (conjunto de nós, conjunto de arestas)."""
    nos = frozenset(
        (n.get('service', ''), (n.get('label') or '').strip().lower())
        for g in d.get('groups') or [] for n in g.get('nodes') or []
    )
    arestas = frozenset(
        f'{e.get("from")}>{e.get("to")}' for e in d.get('edges') or []
    )
    return nos, arestas


def conferir(slug: str) -> list[str]:
    falhas: list[str] = []

    # A forma do slug se confere ANTES de abrir o seed, e não depois: as duas
    # coisas falham por motivos independentes, e sair cedo escondia a segunda.
    # Descoberto na própria prova negativa — a mutação que numerava o slug produzia
    # só "módulo fantasma", e a checagem de número nunca rodava.
    #
    # `\d` sozinho pegava QUALQUER dígito, e o L13 tem termo técnico legítimo com
    # dígito no meio — `p95`, percentil de latência. O que a regra realmente proíbe
    # é um SEGMENTO inteiro sendo o número de série (`lab-04-...`), não um termo como
    # `p95`/`p99`/`s3`/`ec2` que mistura letra e número. Checa segmento puramente
    # numérico entre hifens.
    if any(re.fullmatch(r'\d+', seg) for seg in slug.split('-')):
        falhas.append(f'o slug `{slug}` tem segmento puramente numérico — renumerar a série '
                      f'quebraria a URL, e a ordem pertence à trilha, não ao endereço')

    caminho = ARTIGOS / f'{slug}.json'
    if not caminho.exists():
        falhas.append(f'a trilha declara `{slug}` e não existe seed — módulo fantasma, '
                      f'que anuncia URL respondendo 404')
        return falhas
    doc = json.loads(caminho.read_text(encoding='utf-8'))
    texto = texto_visivel(doc)
    baixo = texto.lower()

    # ── 1. Duas arquiteturas, com topologias DIFERENTES ──────────────────────
    diagramas = [b['data'] for b in blocos(doc)
                 if b.get('type') in ('arch_diagram', 'aws_diagram')]
    if len(diagramas) < 2:
        falhas.append(f'{len(diagramas)} diagrama(s) — a série promete a mínima E a de '
                      f'produção, e é a comparação entre as duas que ensina quando mudar')
    else:
        assinaturas = [topologia(d) for d in diagramas]
        for i in range(len(assinaturas)):
            for j in range(i + 1, len(assinaturas)):
                (ni, ei), (nj, ej) = assinaturas[i], assinaturas[j]
                if ni == nj and ei == ej:
                    falhas.append(
                        f'os diagramas #{i + 1} e #{j + 1} têm a MESMA topologia — '
                        f'"evoluir para produção" com o mesmo desenho não mostra evolução')
                elif len(ni & nj) == len(ni) == len(nj) - 1:
                    # Uma caixa a mais e nada mais: é o atalho que a regra impede.
                    falhas.append(
                        f'o diagrama #{j + 1} é o #{i + 1} com UM nó a mais — produção '
                        f'muda o desenho, não acrescenta uma caixa')

    # ── 2. Seção de limpeza, e ela cobre o que cobra parado ──────────────────
    secao_limpeza, _ = secao(doc, r'\blimpeza\b|\bdestruir\b|remover os recursos')

    if not secao_limpeza:
        falhas.append('sem seção de limpeza — recurso que cobra parado fica ligado '
                      'depois que o aluno fecha o navegador, e a fatura chega no fim do mês')
    else:
        for nome, regra in COBRA_PARADO.items():
            # `resource "tipo" "nome" {` é DECLARAÇÃO — o laboratório cria o recurso.
            # `tipo.nome.atributo` é REFERÊNCIA a algo que outro laboratório já criou
            # (o L18 lê `aws_ecr_repository.api.repository_url` do L01/L03 sem criar
            # repositório nenhum). Bastava a substring `aws_ecr_repository` aparecer
            # em QUALQUER lugar — inclusive numa referência — para o gate exigir
            # limpeza de um recurso que o módulo não cria. Reprovar conteúdo correto
            # é o defeito que faz gate ser desligado; a exigência de `resource "…"`
            # é o mesmo princípio da checagem 2 (limpeza pela SEÇÃO, não pela palavra).
            cria = any(re.search(rf'resource\s+"{re.escape(t)}"', baixo) for t in regra['cria'])

            # Endpoint de VPC só cobra se for do tipo Interface. O L14 criava um
            # Gateway (DynamoDB, gratuito) e o gate exigia limpeza com a frase
            # "continua cobrando 24 h por dia" — falso para este tipo específico.
            # Sem o atributo, o provedor Terraform assume Gateway por padrão, então
            # só a presença EXPLÍCITA de `"Interface"` perto da declaração conta.
            if cria and nome == 'endpoint_de_vpc_interface':
                # Janela de 300 caracteres, não de "até o próximo `}`": a interpolação
                # `${var.regiao}` do Terraform tem `}` DENTRO do valor, e uma classe
                # `[^}]` cortava a janela ali — a primeira versão desta correção
                # nunca via o `vpc_endpoint_type` por causa disso.
                # `baixo` já está em minúsculas (é `texto.lower()`) — o literal do
                # regex tem de casar "interface", não "Interface", senão nunca bate.
                cria = bool(re.search(
                    r'resource\s+"aws_vpc_endpoint".{0,300}?vpc_endpoint_type\s*=\s*"interface"',
                    baixo, re.S))

            limpa = (any(t in secao_limpeza for t in regra['menciona'])
                     or nome.replace('_', ' ') in secao_limpeza)
            if cria and not limpa:
                falhas.append(f'cria {nome.replace("_", " ")} (via '
                              f'{regra["cria"][0].strip(chr(34))}) e a seção de limpeza não '
                              f'o menciona — é dos que continuam cobrando 24 h por dia')

    # ── 3. Entregável declarado ──────────────────────────────────────────────
    if not re.search(r'ao final|você terá|entregável|o que você construiu', baixo):
        falhas.append('sem entregável declarado — "o que você terá ao final" é o que '
                      'transforma o laboratório em item de portfólio')

    # ── 4. A TERCEIRA arquitetura: a evolução em níveis ──────────────────────
    #
    # O contrato da série é de TRÊS arquiteturas — mínima, produção e evolução — e
    # está escrito em dois lugares: `.claude/skills/lab-arquitetura-aws.md` (regra
    # nº 1) e a abertura do catálogo. Só que o gate conferia duas e nunca olhava a
    # terceira. Que o L01 e o L02 a tenham era disciplina de quem escreveu, não
    # garantia do sistema — e o vão na numeração das checagens (havia 1, 2, 3, 5)
    # era o rastro disso.
    #
    # A terceira é a que ensina a arquitetar, porque é a única que responde QUANDO
    # mudar. Sem ela o laboratório mostra um desenho e para ali — que é exatamente
    # o tutorial do qual a série tenta se distinguir.
    texto_evol, blocos_evol = secao(doc, r'evolu[çc]|n[íi]veis')
    if not texto_evol:
        falhas.append('sem seção de evolução — a série promete TRÊS arquiteturas, e a '
                      'terceira é a única que responde quando a solução precisa mudar')
    else:
        niveis = [n for b in blocos_evol for n in niveis_declarados(b) if re.search(r'\d', n)]
        if len(niveis) < 5:
            falhas.append(f'a evolução enumera {len(niveis)} nível(is) — o contrato vai do '
                          f'protótipo até dados e IA, e cortar o topo tira justamente a '
                          f'parte que mostra para onde a arquitetura cresce')
        # Nível sem risco e sem custo é rótulo numerado: o leitor vê que existe um
        # nível acima e não sabe o que ele cobra nem o que ele quebra.
        for dimensao, padrao in (('novo risco', r'risco'),
                                 ('impacto de custo', r'custo|fatura|cobran')):
            if not re.search(padrao, texto_evol):
                falhas.append(f'a evolução não fala de {dimensao} — sem isso o nível é um '
                              f'rótulo numerado, e o leitor não sabe o que ele troca')
        if niveis and not re.search(r'\bia\b|intelig[êe]ncia|dados|modelo|lake', texto_evol):
            falhas.append('a evolução não chega a dados nem a IA — é o último nível do '
                          'contrato, e é onde a série se liga ao resto da escola')

    # ── 5. A arquitetura de produção é justificada por requisito ─────────────
    if len(diagramas) >= 2 and not re.search(
            r'requisito|não funcional|rto|rpo|disponibilidade', baixo):
        falhas.append('a arquitetura de produção não é ligada a nenhum requisito — '
                      'peça sem requisito que a justifique é peça por hábito')

    return falhas


def main() -> int:
    estrito = '--strict' in sys.argv
    slugs = slugs_da_trilha()

    print('=' * 74)
    print('GATE  série de laboratórios de arquitetura AWS')
    print('=' * 74)
    if not slugs:
        print('trilha não encontrada ou vazia — nada a conferir')
        return 0
    print(f'laboratórios declarados na trilha: {len(slugs)}')
    print()

    total = 0
    for slug in slugs:
        falhas = conferir(slug)
        total += len(falhas)
        marca = '✓' if not falhas else '✗'
        print(f'  {marca} {slug}')
        for f in falhas:
            print(f'      {f}')
    print()

    if total:
        print(f'✗ {total} problema(s) na série')
        return 1 if estrito else 0
    print('✓ toda a série tem as TRÊS arquiteturas (duas topologias distintas + a evolução')
    print('  em níveis com risco, custo e o topo em dados/IA), limpeza que cobre o que cobra')
    print('  parado, entregável declarado e slug sem número.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
