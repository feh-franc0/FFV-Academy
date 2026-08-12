#!/usr/bin/env python3
"""Cobertura de diagrama de arquitetura por trilha.

Existe porque nada media isso, e foi assim que 8% de cobertura passou meses sem
ninguém notar — inclusive nas 4 trilhas de certificação AWS, onde o exame é
literalmente desenho de arquitetura e havia ZERO diagramas.

Cada trilha declara um mínimo esperado em MINIMOS. Trilha conceitual pode
declarar 0, e isso é legítimo e explícito — o que não é legítimo é ninguém saber.

Uso:
    python3 scripts/validate_cobertura_diagramas.py           # relatório
    python3 scripts/validate_cobertura_diagramas.py --strict  # falha se abaixo do mínimo
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TRILHAS = RAIZ / 'frontend' / 'src' / 'lib' / 'curriculum' / 'trails'
ARTIGOS = RAIZ / 'scripts' / 'seeds' / 'articles'

# Mínimo de módulos COM diagrama por trilha.
#
# Trilha de arquitetura (certificação AWS, produção, dados) precisa de diagrama
# porque topologia é o objeto de estudo. Trilha de linguagem ou conceito pode não
# precisar — mas a decisão fica registrada aqui, não implícita.
MINIMOS = {
    # Atualizado em 04/ago/2026: TODA trilha passou a ter ao menos um diagrama,
    # e o mínimo de cada uma é o que ela tem hoje. Isso trava o que existe sem
    # obrigar ninguém a forçar figura onde não há fluxo — a regra 1 do
    # PADRAO_ENSINO.md continua sendo "onde há topologia", não "em todo módulo".
    # Trilha inteiramente feita de diagramas: dez módulos, dez arquiteturas cada.
    # O mínimo é 10 porque um módulo sem diagrama aqui não é módulo curto — é
    # módulo que perdeu a razão de existir.
    'trail-arq-ia-aws':        10,                  # 100 Arquiteturas de IA na AWS
    'trail-bedrock':           29,                  # AWS Bedrock — GenAI em Produção
    'trail5':                  18,                  # AWS Solutions Architect Associate
    'trail27':                 16,                  # AWS Solutions Architect Professional (SAP-C0
    'trail4':                  15,                  # AWS Cloud Practitioner
    'trail23':                 13,                  # AWS Developer Associate (DVA-C02)
    'trail-aws-aif':           12,                  # AWS AI Practitioner (AIF-C01)
    'trail9':                  7,                   # Engenharia AI-Native
    'trail16':                 7,                   # Redes & Web
    'trail10':                 6,                   # Sistemas Distribuídos
    'trail11':                 4,                   # Observabilidade & SRE
    'trail51':                 4,                   # MLOps — ML em produção
    'trail-ai-rlhf-agents':    4,                   # AI Engineering Avançado: RLHF & Agents em Pr
    'trail2':                  3,                   # IA Além do LLM
    'trail22':                 3,                   # Security Engineering
    'trail24':                 3,                   # Data Engineering Moderna
    'trail52':                 3,                   # System Design Interview Prep
    'trail54':                 3,                   # NoSQL + Vector Databases
    'trail-search-ir-deep':    3,                   # Search & Information Retrieval Profundo
    'trail12':                 2,                   # Fundamentos Técnicos
    'trail38':                 2,                   # Database Deep — Postgres Internals
    'trail1':                  1,                   # Fundamentos da IA
    'trail3':                  1,                   # Ferramentas de IA para Código
    'trail14':                 1,                   # SQL & Databases
    'trail19':                 1,                   # TypeScript Profissional
    'trail36':                 1,                   # Python para Engenheiros
    'trail25':                 1,                   # Fine-tuning & Customização de LLMs
    'trail26':                 1,                   # LLM Evals Profissional
    'trail28':                 1,                   # FinOps & Cost Engineering
    'trail29':                 1,                   # Voice, Vision & Multimodal
    'trail30':                 1,                   # AI Safety, Red Teaming & Alinhamento
    'trail47':                 1,                   # Go Profissional
    'trail50':                 1,                   # Machine Learning Clássico
    'trail55':                 1,                   # Computer Vision Clássico
    'trail-diffusion-multimodal': 1,                   # Diffusion Models & Geração Multimodal
    'trail-local-llms-edge':   1,                   # Local LLMs & Edge AI
}

# Débito de conteúdo NOMEADO: módulos com fluxo real que ainda não têm diagrama,
# dentro de trilhas que já começaram. Zerar esta lista é trabalho de conteúdo —
# mantê-la é o que impede o débito de virar invisível outra vez.
#
# Cada linha nomeia o MÓDULO, não o assunto: "falta diagrama" sem endereço é
# recado que ninguém consegue executar.
PENDENTES = {
    'trail9': 'AI-Native — falta: rag-evaluation, hybrid-search-reranking, context-engineering',
    'trail-ai-rlhf-agents': 'falta: dpo-vs-ipo-vs-kto, reasoning-models-internals, langgraph-state-machines',
    'trail10': 'Distribuídos — falta: event-sourcing-cqrs, postgres-mvcc-isolation, rate-limiting-distribuido',
    'trail51': 'MLOps — falta: model-registry-mlflow, training-pipelines-kubeflow, ci-cd-para-modelos',
    'trail11': 'Obs & SRE — falta: slos-error-budgets, incident-response-postmortem',
    'trail-search-ir-deep': 'Search — falta: bm25-tfidf-fundamentos, embeddings-busca-bge, semantic-search-prod',
    'trail24': 'Data Eng — falta: kafka-fundamentos, iceberg-delta-hudi, airflow-vs-dagster-vs-prefect',
    'trail54': 'NoSQL — falta: redis-avancado-serio, mongodb-producao, vector-dbs-pgvector-pinecone',
}


# O currículo deixou de ser um arquivo único em ago/2026: virou
# `curriculum/trails/<trailId>.ts`, um por trilha. Concatenar na ordem dos
# imports reproduz exatamente o texto que este script lia antes — inclusive a
# ORDEM, que importa para a navegação e para os relatórios daqui.
def _fonte_curriculo() -> str:
    indice = (TRILHAS / 'index.ts').read_text(encoding='utf-8')
    ordem = re.findall(r"from '\./(trail[a-z0-9-]*)'", indice)
    partes = [(TRILHAS / f'{t}.ts').read_text(encoding='utf-8') for t in ordem]
    # Sentinela: o parser original delimitava as trilhas até `export const HUBS`.
    return '\n'.join(partes) + '\nexport const HUBS'


def trilhas():
    src = _fonte_curriculo()
    fim = src.index('export const HUBS')
    marcas = [(m.start(), m.group(1)) for m in re.finditer(r"id: '(trail[a-z0-9-]*)'", src)]
    saida = []
    for k, (pos, tid) in enumerate(marcas):
        if pos >= fim:
            break
        prox = marcas[k + 1][0] if k + 1 < len(marcas) else fim
        blk = src[pos:min(prox, fim)]
        nome = re.search(r"name: '([^']+)'", blk)
        slugs = re.findall(r"slug: '([a-z0-9-]+)'", blk)
        saida.append((tid, nome.group(1) if nome else tid, slugs))
    return saida


def tem_diagrama(slug: str) -> bool:
    p = ARTIGOS / f'{slug}.json'
    if not p.exists():
        return False
    fonte = p.read_text(encoding='utf-8')
    # aceita o alias legado enquanto houver seed não migrado
    return '"arch_diagram"' in fonte or '"aws_diagram"' in fonte


def main() -> None:
    strict = '--strict' in sys.argv
    erros, avisos = [], []
    tot_mod = tot_cont = tot_diag = 0

    # Guarda contra id fantasma: eu mesmo escrevi 'trail-mlops', 'trail-obs-sre' e
    # 'trail-search-ir' aqui e nenhum dos três existe no curriculum.ts. Entrada
    # que não casa com trilha real vira débito invisível — o gate reporta como
    # pronto porque não encontra nada para cobrar.
    reais = {tid for tid, _, _ in trilhas()}
    fantasmas = sorted((set(MINIMOS) | set(PENDENTES)) - reais)
    if fantasmas:
        print(f'❌ {len(fantasmas)} id(s) declarado(s) neste script sem trilha correspondente:')
        for f in fantasmas:
            print(f'   {f}')
        print('\nCorrija o id ou remova a entrada — declaração que não casa não valida nada.')
        sys.exit(1)

    print(f"{'TRILHA':<44} {'CONT':>5} {'DIAG':>5} {'MÍN':>5}")
    print('─' * 66)

    for tid, nome, slugs in trilhas():
        cont = [s for s in slugs if (ARTIGOS / f'{s}.json').exists()]
        diag = [s for s in cont if tem_diagrama(s)]
        tot_mod += len(slugs)
        tot_cont += len(cont)
        tot_diag += len(diag)

        minimo = MINIMOS.get(tid)
        marca = ''
        if minimo is not None:
            if len(diag) < minimo:
                erros.append(f'{nome}: {len(diag)} diagramas, mínimo {minimo}')
                marca = ' ✗'
            else:
                marca = ' ✓'
        elif tid in PENDENTES and diag:
            avisos.append(f'{nome}: já tem diagrama — promova a MINIMOS e saia de PENDENTES')

        if minimo is not None or diag or tid in PENDENTES:
            print(f'{nome[:43]:<44} {len(cont):>5} {len(diag):>5} '
                  f'{(minimo if minimo is not None else "—"):>5}{marca}')

    print('─' * 66)
    pct = (100 * tot_diag // tot_cont) if tot_cont else 0
    print(f'{"TOTAL":<44} {tot_cont:>5} {tot_diag:>5}   {pct}%')

    if PENDENTES:
        print(f'\n📋 {len(PENDENTES)} trilha(s) com diagrama iniciado e módulos restantes:')
        for tid, o_que in PENDENTES.items():
            print(f'   {tid}: {o_que}')

    for a in avisos:
        print(f'\n⚠️  {a}')

    if erros:
        print(f'\n❌ {len(erros)} trilha(s) abaixo do mínimo declarado:')
        for e in erros:
            print(f'   {e}')
        if strict:
            sys.exit(1)
    else:
        print('\n✅ toda trilha com mínimo declarado está no alvo.')


if __name__ == '__main__':
    main()
