#!/usr/bin/env python3
"""Todo módulo do hub Base técnica tem apoio visual, ou uma exceção declarada?

─── Por que esta regra existe ────────────────────────────────────────────────

Medido em 09/ago/2026: o hub Base técnica (trail12 Fundamentos Técnicos, trail14
SQL & Databases, trail16 Redes & Web, trail19 TypeScript, trail36 Python,
trail47 Go) tinha **0,4 bloco visual por módulo**, contra 4,8 do hub AWS — e é
o hub que o iniciante encontra primeiro na jornada. 39 dos 57 módulos não
tinham nenhum diagrama, fluxo, hierarquia, matriz ou fórmula anotada.

A ausência não é defeito em todo lugar: uma aula de atalhos de editor ou de
sintaxe de função de agregação SQL é bem servida por `code_block` comentado, e
forçar figura onde não há fluxo é o mesmo erro documentado em
`.claude/skills/arquitetura-ia-aws.md` para diagrama de arquitetura. Por isso
este gate não exige 100% — exige que a AUSÊNCIA seja uma DECISÃO, registrada
com o motivo, e não um vazio que ninguém notou.

`validate_cobertura_diagramas.py` NÃO cobre este caso: aquele gate mede
`arch_diagram` (o diagrama de ícones de serviço AWS), que não se aplica a git,
SQL ou Go. Este gate mede a família ampla de visual estrutural: `arch_diagram`,
`flow_diagram`, `stack_flow`, `layer_stack`, `node_graph`, `arch_flow`,
`timeline`, `comparison_flow`, `matrix_diagram`, `hierarchy_diagram`,
`split_flow`, `annotated_formula` — qualquer um conta.

─── Como a checagem funciona ─────────────────────────────────────────────────

Só o hub Base técnica entra no escopo (`TRILHAS_DO_HUB`). Para cada módulo,
conta blocos da família VISUAL em qualquer profundidade do seed. Módulo com
zero precisa estar em `EXCECOES`, com o motivo escrito. Exceção que aponta
para slug que ganhou visual depois vira erro — força quem lembrar de tirar da
lista, e impede que a lista relaxe sozinha por inércia (mesma disciplina de
`EXCECOES` em `validate_cobertura_quiz.py`).

Uso:
    python3 scripts/validate_apoio_visual_fundamentos.py           # relatório
    python3 scripts/validate_apoio_visual_fundamentos.py --strict  # falha
"""
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRILHAS_DIR = os.path.join(RAIZ, 'frontend', 'src', 'lib', 'curriculum', 'trails')
SEEDS_DIR = os.path.join(RAIZ, 'scripts', 'seeds', 'articles')

TRILHAS_DO_HUB = {
    'trail12': 'Fundamentos Técnicos',
    'trail14': 'SQL & Databases',
    'trail16': 'Redes & Web',
    'trail19': 'TypeScript Profissional',
    'trail36': 'Python para Engenheiros',
    'trail47': 'Go Profissional',
}

VISUAL = {
    'arch_diagram', 'flow_diagram', 'stack_flow', 'layer_stack', 'node_graph',
    'arch_flow', 'timeline', 'comparison_flow', 'matrix_diagram',
    'hierarchy_diagram', 'split_flow', 'annotated_formula',
}

# Módulos onde a AUSÊNCIA de visual é decisão, não vazio — triados em
# 09/ago/2026 (openspec/changes/apoio-visual-fundamentos). O conteúdo é
# procedimento, referência ou conceito abstrato de sistema de tipos: o
# `code_block` comentado já é o apoio certo, e forçar diagrama aqui seria
# ilustrar por ilustrar.
EXCECOES: dict[str, str] = {
    'editores-produtividade': 'atalho e configuração — referência de comando, não fluxo',
    'json-yaml-env': 'sintaxe de formato — referência, não fluxo',
    'linux-terminal-basico': 'referência de comando — code_block já é o apoio certo',
    'group-by-agregacoes': 'sintaxe de função SQL — referência, não fluxo',
    'window-functions': 'sintaxe + saída tabular — o code_block com dado real ensina melhor que diagrama',
    'erros-como-valores': 'padrão de código (Result<T,E> vs throw) — comparação é de sintaxe, não de fluxo',
    'generics-de-verdade': 'sistema de tipos abstrato — code_block é o meio natural',
    'narrowing-discriminated-unions': 'sistema de tipos abstrato — code_block é o meio natural',
    'tipos-utilitarios-e-quando-nao-usar': 'referência de utilitário de tipo — catálogo, não fluxo',
    'typescript-como-mental-model': 'introdução conceitual — prosa e code_block, sem topologia a desenhar',
    'jupyter-pra-engenharia': 'uso de ferramenta — procedimento, não fluxo',
    'pydantic-v2-serio': 'uso de biblioteca — code_block é o meio natural',
    'type-hints-rigorosos': 'sistema de tipos abstrato — code_block é o meio natural',
    'uv-e-python-moderno': 'workflow de ferramenta — procedimento, não fluxo',
    'error-handling-explicito': 'padrão de código (erros como valor) — comparação é de sintaxe',
    'generics-go': 'sistema de tipos abstrato — code_block é o meio natural',
    'go-mental-model': 'introdução conceitual — prosa e code_block, sem topologia a desenhar',
    'interfaces-pequenas': 'princípio de design ensinado por contraste de código, não por diagrama',
}


def contar_visual(no) -> int:
    total = 0
    if isinstance(no, dict):
        if no.get('type') in VISUAL:
            total += 1
        for v in no.values():
            total += contar_visual(v)
    elif isinstance(no, list):
        for item in no:
            total += contar_visual(item)
    return total


def slugs_do_hub() -> dict[str, str]:
    """slug -> nome da trilha, só para as trilhas do hub Base técnica."""
    out = {}
    for tid, nome in TRILHAS_DO_HUB.items():
        caminho = os.path.join(TRILHAS_DIR, f'{tid}.ts')
        if not os.path.exists(caminho):
            raise SystemExit(f'{tid}: arquivo de trilha não encontrado — hub Base técnica mudou de forma?')
        with open(caminho, encoding='utf-8') as fh:
            fonte = fh.read()
        for slug in re.findall(r"slug: '([^']+)'", fonte):
            out[slug] = nome
    return out


def main() -> int:
    estrito = '--strict' in sys.argv
    slugs = slugs_do_hub()

    sem_visual: list[tuple[str, str]] = []
    exececoes_usadas: set[str] = set()

    for slug, trilha in sorted(slugs.items()):
        caminho = os.path.join(SEEDS_DIR, f'{slug}.json')
        if not os.path.exists(caminho):
            continue  # módulo declarado sem seed é assunto de outro gate
        with open(caminho, encoding='utf-8') as fh:
            doc = json.load(fh)
        n = contar_visual(doc)
        if n == 0:
            if slug in EXCECOES:
                exececoes_usadas.add(slug)
            else:
                sem_visual.append((slug, trilha))

    # Exceção obsoleta: está na lista mas o módulo JÁ TEM visual (ganhou depois)
    # ou não existe mais no hub — os dois casos precisam de alguém revisando.
    exececoes_obsoletas = sorted(s for s in EXCECOES if s not in exececoes_usadas)

    total = sum(1 for slug in slugs if os.path.exists(os.path.join(SEEDS_DIR, f'{slug}.json')))
    com_visual = total - len(sem_visual) - len(exececoes_usadas)

    print('=' * 78)
    print('GATE  apoio visual no hub Base técnica — visual ou exceção declarada')
    print('=' * 78)
    print(f'módulos no hub .............. {total}')
    print(f'com visual estrutural ........ {com_visual}')
    print(f'sem visual, com exceção ...... {len(exececoes_usadas)}')
    print(f'sem visual, SEM exceção ...... {len(sem_visual)}')

    problemas = False
    if sem_visual:
        problemas = True
        print('\n❌ módulos sem visual e sem exceção declarada:')
        for slug, trilha in sem_visual:
            print(f'   [{trilha}] {slug}')

    if exececoes_obsoletas:
        problemas = True
        print('\n❌ exceções obsoletas — o módulo já tem visual ou não existe mais no hub:')
        for slug in exececoes_obsoletas:
            print(f'   {slug}')

    if problemas:
        print('\n  Módulo novo sem visual precisa OU ganhar um bloco da família VISUAL')
        print('  OU entrar em EXCECOES com o motivo — a ausência tem de ser decisão.')
        return 1 if estrito else 0

    print('\n✅ todo módulo do hub tem visual estrutural ou exceção com motivo.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
