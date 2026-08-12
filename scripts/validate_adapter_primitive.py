#!/usr/bin/env python3
"""
Gate do segundo elo da cadeia de render: adapter → primitive.

A cadeia tem três elos, e cada um pode quebrar sozinho:

    seed JSON  →  adapter (BlockRenderer.tsx)  →  primitive (primitives.tsx)  →  tela
               ↑                              ↑
               |                              └── ESTE GATE
               └── validate_primitives_render.py

O elo do meio ficou sem cobertura até 07/ago/2026, e três defeitos passaram por
ele — todos com a mesma forma: o adapter entrega uma prop, o primitive não a
declara, e o conteúdo escrito pelo autor **desaparece da tela sem erro**.

    decision_box      adapter entrega `downside`, primitive lia `note ?? when`
                      → 82 de 391 alternativas em 120 módulos, com travessão pendurado
    annotated_formula adapter entregava `symbol`/`description`/`color`
                      → 148 de 197 anotações com todos os campos vazios
    stack_flow        adapter passava `text`, o primitive desenha `detail`
                      → 282 de 367 itens com card sem corpo

Nenhum teste de componente pega isso: quem testa o primitive passa props tipadas
à mão e acerta o nome por construção. O erro só existe na junção.

Assimetria proposital das duas direções:

    prop entregue e NÃO declarada  → ERRO. O autor escreveu, e não aparece.
    prop declarada e NÃO entregue  → aviso. O primitive também é usado direto em
                                     JSX nas páginas antigas, então prop sem uso
                                     pelo CMS pode ser legítima.

Uso:
    python3 scripts/validate_adapter_primitive.py            # modo relatório (sai 0)
    python3 scripts/validate_adapter_primitive.py --strict   # falha em divergência
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PRIMITIVES = RAIZ / 'frontend/src/components/article/primitives.tsx'
BLOCK_RENDERER = RAIZ / 'frontend/src/components/article/BlockRenderer.tsx'

# Props que todo componente React aceita e que não pertencem ao contrato do bloco.
PROPS_UNIVERSAIS = {'key', 'children', 'className', 'style', 'ref'}

# Componentes que aparecem no JSX dos adapters e NÃO entram na comparação prop a
# prop. Cada um precisa de motivo escrito: sem isso a lista viraria o lugar onde
# se esconde a divergência que o gate deveria acusar.
NAO_PRIMITIVES = {
    'Tag': 'const Tag = ordered ? \'ol\' : \'ul\' — elemento HTML, não primitive',
    'AwsDiagram': 'recebe a topologia inteira; contrato coberto por diagramas-de-seed.test.tsx',
    'QuizBlock': 'recebe `data` inteiro e valida pelo próprio tipo QuizBlockData — '
                 'não há prop a prop para comparar',
}


def remover_comentarios(texto: str) -> str:
    """Tira comentário de bloco e de linha, preservando a contagem de linhas.

    A contagem tem de ser preservada porque a mensagem de erro cita o número da
    linha, e um gate que aponta a linha errada custa mais tempo que não existir.
    """
    def _bloco(m: re.Match[str]) -> str:
        return '\n' * m.group(0).count('\n')

    texto = re.sub(r'/\*.*?\*/', _bloco, texto, flags=re.DOTALL)
    # `//` dentro de string ('https://…') não é comentário. O caso que importa
    # aqui é comentário em linha própria ou depois de código; exigir que não haja
    # aspas antes na mesma linha cobre os dois sem falso positivo em URL.
    linhas = []
    for linha in texto.split('\n'):
        pos = linha.find('//')
        if pos >= 0 and linha.count("'", 0, pos) % 2 == 0 and linha.count('"', 0, pos) % 2 == 0:
            linha = linha[:pos]
        linhas.append(linha)
    return '\n'.join(linhas)


# ─────────────────────────────────────────────────────────────────────────────
# Lado do primitive: quais props o tipo declara
# ─────────────────────────────────────────────────────────────────────────────

class Primitive:
    """O contrato de um primitive: o que ele declara e o que ele já resolve sozinho."""

    def __init__(self, nome: str, topo: set[str], itens: dict[str, set[str]], com_default: set[str]):
        self.nome = nome
        self.topo = topo
        self.itens = itens
        # Prop com valor padrão na desestruturação não é exigida do CMS: o
        # primitive já sabe o que fazer sem ela. Distinguir isso é o que separa
        # aviso com sinal de ruído — sem a distinção, 18 dos 20 avisos eram
        # `accent = 'var(--ffv-blue)'`, e ninguém leria os outros 2.
        self.com_default = com_default


def props_dos_primitives(texto: str) -> dict[str, Primitive]:
    """Para cada primitive exportado, o contrato declarado pelo tipo.

    O tipo é um literal inline logo depois da desestruturação, em duas formas:

        export function LayerStack({ title, layers }: {      ← tipo em várias linhas
          title?: string;
          layers: { label: string; note?: string }[];
        }) {

        export function QAItem({ q, a }: { q: string; a: ReactNode }) {   ← tudo numa linha

    A segunda forma existia e o gate a ignorava, deixando `QAItem` fora da
    comparação — exatamente o buraco silencioso que este gate existe para não ter.

    As props de item de array são o que mais importa: os três defeitos conhecidos
    moraram todos dentro de `alternatives[]`, `parts[]` e `items[]` — nunca no
    primeiro nível.
    """
    resultado: dict[str, Primitive] = {}
    linhas = texto.split('\n')

    multilinha = re.compile(r'^export (?:async )?function (\w+)\(\{(.*)\}: \{\s*$')
    umalinha = re.compile(r'^export (?:async )?function (\w+)\(\{(.*?)\}: \{(.*)\}\) \{\s*$')

    for i, linha in enumerate(linhas):
        m = umalinha.match(linha)
        if m:
            nome, desestruturacao, tipo = m.group(1), m.group(2), m.group(3)
            topo, itens = _parsear_tipo([t.strip() + ';' for t in tipo.split(';') if t.strip()])
            resultado[nome] = Primitive(nome, topo, itens, _com_default(desestruturacao))
            continue

        m = multilinha.match(linha)
        if not m:
            continue
        nome, desestruturacao = m.group(1), m.group(2)
        corpo: list[str] = []
        for j in range(i + 1, len(linhas)):
            if linhas[j].rstrip() == '}) {':
                break
            corpo.append(linhas[j])
        topo, itens = _parsear_tipo(corpo)
        resultado[nome] = Primitive(nome, topo, itens, _com_default(desestruturacao))
    return resultado


def _com_default(desestruturacao: str) -> set[str]:
    """Props que trazem valor padrão: `{ tone = 'info', icon, children }` → {'tone'}."""
    return {m.group(1) for m in re.finditer(r'(\w+)\s*=', desestruturacao)}


def _parsear_tipo(corpo: list[str]) -> tuple[set[str], dict[str, set[str]]]:
    topo: set[str] = set()
    itens: dict[str, set[str]] = {}

    prop_aberta: str | None = None
    acumulado: list[str] = []
    profundidade = 0

    for linha in corpo:
        nu = linha.strip()
        if not nu:
            continue

        if prop_aberta is not None:
            acumulado.append(nu)
            profundidade += nu.count('{') - nu.count('}')
            if profundidade <= 0:
                itens[prop_aberta] = _chaves_de_objeto(' '.join(acumulado))
                prop_aberta = None
                acumulado = []
                profundidade = 0
            continue

        m = re.match(r'^(\w+)\??\s*:\s*(.*)$', nu)
        if not m:
            continue
        nome, resto = m.group(1), m.group(2)
        topo.add(nome)

        # Objeto de item numa única linha: `alternatives?: { a?: string }[];`
        if '{' in resto and resto.count('{') == resto.count('}'):
            itens[nome] = _chaves_de_objeto(resto)
        # Objeto de item aberto em várias linhas: `layers: {`
        elif resto.rstrip().endswith('{'):
            prop_aberta = nome
            acumulado = [resto]
            profundidade = resto.count('{') - resto.count('}')

    return topo, itens


def _chaves_de_objeto(texto: str) -> set[str]:
    """Chaves de um tipo-objeto, incluindo as de união (`{a} | {b}`).

    Não tenta entender aninhamento além de um nível: nenhum primitive tem item de
    item, e inventar suporte para um caso inexistente é a abstração errada.
    """
    return set(re.findall(r'(?:^|[{;|(]|\s)(\w+)\??\s*:', texto))


# ─────────────────────────────────────────────────────────────────────────────
# Lado do adapter: quais props ele entrega
# ─────────────────────────────────────────────────────────────────────────────

def props_dos_adapters(texto: str) -> dict[str, list[tuple[str, set[str], dict[str, set[str]], int]]]:
    """Para cada tipo de bloco, a lista de (primitive, props, props de item, linha)."""
    linhas = texto.split('\n')
    inicio = next(
        (i for i, l in enumerate(linhas) if l.startswith('const ADAPTERS')),
        None,
    )
    if inicio is None:
        raise SystemExit('ADAPTERS não encontrado em BlockRenderer.tsx')

    blocos: dict[str, tuple[int, int]] = {}
    atual: str | None = None
    linha_inicial = 0
    for i in range(inicio + 1, len(linhas)):
        m = re.match(r'^  (\w+): \{\s*$', linhas[i])
        if m:
            if atual:
                blocos[atual] = (linha_inicial, i)
            atual = m.group(1)
            linha_inicial = i
        elif linhas[i] == '};' and atual:
            blocos[atual] = (linha_inicial, i)
            atual = None
            break

    resultado: dict[str, list[tuple[str, set[str], dict[str, set[str]], int]]] = {}
    for tipo, (ini, fim) in blocos.items():
        trecho = '\n'.join(linhas[ini:fim])
        resultado[tipo] = _elementos_jsx(trecho, deslocamento=ini + 1)
    return resultado


def _elementos_jsx(trecho: str, deslocamento: int) -> list[tuple[str, set[str], dict[str, set[str]], int]]:
    achados: list[tuple[str, set[str], dict[str, set[str]], int]] = []
    for m in re.finditer(r'<([A-Z]\w*)', trecho):
        nome = m.group(1)
        if nome in NAO_PRIMITIVES:
            continue
        props, itens = _atributos(trecho, m.end())
        linha = deslocamento + trecho.count('\n', 0, m.start())
        achados.append((nome, props, itens, linha))
    return achados


def _atributos(trecho: str, pos: int) -> tuple[set[str], dict[str, set[str]]]:
    """Lê os atributos de uma tag JSX a partir do fim do nome do componente.

    Percorre caractere a caractere porque o valor de um atributo pode conter
    `>` (arrow function), `{`/`}` (objeto) e aspas — nenhuma expressão regular
    razoável separa isso corretamente.
    """
    props: set[str] = set()
    itens: dict[str, set[str]] = {}
    i = pos
    n = len(trecho)

    while i < n:
        c = trecho[i]
        if c == '/' and i + 1 < n and trecho[i + 1] == '>':
            break
        if c == '>':
            break
        m = re.match(r'([A-Za-z_]\w*)\s*=\s*\{', trecho[i:])
        if m:
            nome = m.group(1)
            props.add(nome)
            fim = _fechar_chave(trecho, i + m.end() - 1)
            valor = trecho[i + m.end() - 1:fim]
            chaves = _chaves_de_mapeamento(valor)
            if chaves:
                itens[nome] = chaves
            i = fim
            continue
        m = re.match(r'([A-Za-z_]\w*)\s*=\s*"', trecho[i:])
        if m:
            props.add(m.group(1))
            i += m.end()
            fim = trecho.find('"', i)
            i = fim + 1 if fim >= 0 else n
            continue
        # Atributo booleano abreviado (`ordered`), sem valor.
        m = re.match(r'([A-Za-z_]\w*)(?=[\s/>])', trecho[i:])
        if m and trecho[i - 1] in ' \n\t':
            props.add(m.group(1))
            i += m.end()
            continue
        i += 1

    return props - PROPS_UNIVERSAIS, itens


def _fechar_chave(texto: str, i: int) -> int:
    profundidade = 0
    while i < len(texto):
        if texto[i] == '{':
            profundidade += 1
        elif texto[i] == '}':
            profundidade -= 1
            if profundidade == 0:
                return i + 1
        i += 1
    return len(texto)


def _chaves_de_mapeamento(valor: str) -> set[str]:
    """Chaves do objeto que o `.map()` de um atributo constrói.

    É aqui que mora o risco: `alternatives={xs.map(a => ({ name: …, downside: … }))}`
    entrega `name` e `downside` como campos de ITEM, e é exatamente o nível em que
    os três defeitos conhecidos aconteceram.
    """
    chaves: set[str] = set()
    for m in re.finditer(r'=>\s*\(\{', valor):
        fim = _fechar_chave(valor, m.end() - 1)
        corpo = valor[m.end() - 1:fim]
        chaves |= set(re.findall(r'(?:^\{|[{,])\s*(\w+)\s*:', corpo))
    for m in re.finditer(r'\breturn \{', valor):
        fim = _fechar_chave(valor, m.end() - 1)
        corpo = valor[m.end() - 1:fim]
        chaves |= set(re.findall(r'(?:^\{|[{,])\s*(\w+)\s*:', corpo))
    return chaves


# ─────────────────────────────────────────────────────────────────────────────

def main() -> int:
    estrito = '--strict' in sys.argv

    prim = props_dos_primitives(remover_comentarios(PRIMITIVES.read_text()))
    adap = props_dos_adapters(remover_comentarios(BLOCK_RENDERER.read_text()))

    erros: list[str] = []
    avisos: list[str] = []
    conferidos: list[str] = []
    desconhecidos: set[str] = set()

    for tipo in sorted(adap):
        for componente, props, itens, linha in adap[tipo]:
            if componente in NAO_PRIMITIVES:
                continue
            if componente not in prim:
                desconhecidos.add(f'{componente} (bloco `{tipo}`, linha {linha})')
                continue
            declaradas = prim[componente].topo
            itens_declarados = prim[componente].itens

            sobrando = props - declaradas
            for p in sorted(sobrando):
                erros.append(
                    f'`{tipo}` → <{componente}> entrega `{p}`, que o tipo do primitive '
                    f'não declara.\n'
                    f'    BlockRenderer.tsx:{linha}  →  primitives.tsx (tipo de {componente})\n'
                    f'    O conteúdo escrito nesse campo não chega à tela.'
                )

            for prop, chaves in sorted(itens.items()):
                if prop not in itens_declarados:
                    # O primitive declara a prop, mas não como objeto — pode ser
                    # array de string, e aí não há chave de item para conferir.
                    continue
                faltando = chaves - itens_declarados[prop]
                for c in sorted(faltando):
                    erros.append(
                        f'`{tipo}` → <{componente}> entrega `{prop}[].{c}`, que o tipo do '
                        f'item não declara.\n'
                        f'    BlockRenderer.tsx:{linha}  →  primitives.tsx (tipo de {componente})\n'
                        f'    É o nível exato dos três defeitos de ago/2026.'
                    )

            # Prop com valor padrão não conta: o primitive já resolve sem ela.
            nao_entregues = declaradas - props - PROPS_UNIVERSAIS - prim[componente].com_default
            for p in sorted(nao_entregues):
                avisos.append(
                    f'`{tipo}` → <{componente}> nunca entrega `{p}`, que o primitive declara '
                    f'sem valor padrão — o campo pode estar inalcançável pelo CMS.'
                )
            conferidos.append(f'{tipo} → {componente} ({len(props)} props)')

    print('=' * 78)
    print('GATE  adapter → primitive   (2º elo da cadeia de render)')
    print('=' * 78)
    print(f'primitives lidos ......... {len(prim)}')
    print(f'tipos de bloco lidos ..... {len(adap)}')
    print(f'junções conferidas ....... {len(conferidos)}')
    print()

    if NAO_PRIMITIVES:
        print(f'— fora da comparação, com motivo ({len(NAO_PRIMITIVES)}):')
        for nome, motivo in sorted(NAO_PRIMITIVES.items()):
            print(f'    {nome}: {motivo}')
        print()

    if desconhecidos:
        print(f'✗ componente usado por adapter e não encontrado em primitives.tsx '
              f'({len(desconhecidos)}):')
        for d in sorted(desconhecidos):
            print(f'    {d}')
        print('    Declare em NAO_PRIMITIVES com motivo, ou o gate fica com um buraco')
        print('    silencioso — que é o defeito que ele existe para não ter.')
        print()
        erros.append(f'{len(desconhecidos)} componente(s) fora do contrato sem motivo declarado')

    if avisos:
        print(f'— AVISOS: prop declarada e nunca entregue ({len(avisos)})')
        for a in avisos:
            print(f'    {a}')
        print()

    if erros:
        print(f'✗ ERROS: prop entregue e não declarada ({len(erros)})')
        print()
        for e in erros:
            print(f'  {e}')
            print()
        if estrito:
            return 1
        print('  (modo relatório — rode com --strict para falhar)')
        return 0

    print('✓ nenhuma prop entregue fica sem declaração no primitive.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
