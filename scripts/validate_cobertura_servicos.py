#!/usr/bin/env python3
"""
Valida a cobertura do catálogo de serviços AWS pela trilha Bedrock.

O problema que este script resolve: com ~90 serviços distribuídos em 6 módulos,
"falamos de todos" é uma afirmação impossível de verificar no olho. Aqui ela
vira teste.

Checa três coisas:
  1. Toda entrada do catálogo tem módulo declarado e módulo conhecido.
  2. Toda chave de ícone existe em frontend/src/components/article/AwsIcon.tsx
     (ícone faltando não quebra o render — cai no genérico — mas empobrece o
     diagrama em silêncio, então é warning, não erro).
  3. Todo serviço `estrutural` e `padrao` é efetivamente CITADO no conteúdo do
     módulo a que foi atribuído. Serviço listado no catálogo e ausente do texto
     é a falha silenciosa que este script existe para impedir.

Uso:
  python3 scripts/validate_cobertura_servicos.py            # relatório completo
  python3 scripts/validate_cobertura_servicos.py --pendente # só o que falta escrever
"""
from __future__ import annotations  # anotações adiadas: o repo roda Python 3.9

import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / 'scripts' / 'seeds' / '_catalogo-servicos-aws.json'
ARTIGOS = RAIZ / 'scripts' / 'seeds' / 'articles'
ICONES = RAIZ / 'frontend' / 'src' / 'components' / 'article' / 'AwsIcon.tsx'

# Módulo do catálogo → slug do artigo. Módulos ainda não escritos ficam como
# None: o script os reporta como pendentes em vez de falhar.
SLUG_DO_MODULO = {
    'bedrock-core': None,  # coberto pelos módulos 1-14; não valida citação
    'svc-canais-borda': 'bedrock-servicos-canais-borda',
    'svc-compute-orquestracao': 'bedrock-servicos-compute-orquestracao',
    'svc-dados-retrieval': 'bedrock-servicos-dados-retrieval',
    'svc-ia-especializada': 'bedrock-servicos-ia-especializada',
    'svc-seguranca': 'bedrock-servicos-seguranca-conformidade',
    'svc-operacao': 'bedrock-servicos-observabilidade-finops',
}


def normalizar(txt: str) -> str:
    txt = unicodedata.normalize('NFD', txt.lower())
    return ''.join(c for c in txt if unicodedata.category(c) != 'Mn')


def termos_de_busca(servico: dict) -> list[str]:
    """Gera as formas pelas quais o serviço pode aparecer no texto.

    'Amazon Connect' casa com 'Connect'. 'API Gateway (WebSocket)' casa com
    'WebSocket'. 'AWS CDK / CloudFormation / Terraform' casa com qualquer um.
    """
    # Alias explícito no catálogo vence: nome descritivo ("SageMaker treino e
    # hospedagem") nunca aparece literal no texto.
    if servico.get('termos'):
        return [normalizar(t) for t in servico['termos']]

    base = re.sub(r'^(Amazon|AWS)\s+', '', servico['nome'])
    partes = [p.strip() for p in re.split(r'[/]', base)]
    termos = []
    for p in partes:
        m = re.match(r'^(.*?)\s*\((.+)\)$', p)
        if m:
            termos += [m.group(1).strip(), m.group(2).strip()]
        else:
            termos.append(p)
    # 2 caracteres é o piso: "S3" é nome de serviço, não ruído.
    return [normalizar(t) for t in termos if len(t) >= 2]


def texto_do_artigo(slug: str) -> str | None:
    caminho = ARTIGOS / f'{slug}.json'
    if not caminho.exists():
        return None
    return normalizar(caminho.read_text(encoding='utf-8'))


def main() -> int:
    so_pendente = '--pendente' in sys.argv

    catalogo = json.loads(CATALOGO.read_text(encoding='utf-8'))
    servicos = catalogo['servicos']
    modulos = catalogo['modulos']

    icones_fonte = ICONES.read_text(encoding='utf-8') if ICONES.exists() else ''
    chaves_icone = set(re.findall(r'^\s{2}([a-z0-9]+):\s*\{ label:', icones_fonte, re.M))

    erros: list[str] = []
    avisos: list[str] = []
    sem_icone: set[str] = set()
    por_modulo: dict[str, list] = {}

    for s in servicos:
        mod = s.get('modulo')
        if mod not in modulos:
            erros.append(f"{s['nome']}: módulo desconhecido '{mod}'")
            continue
        if s.get('prioridade') not in ('estrutural', 'padrao', 'nicho'):
            erros.append(f"{s['nome']}: prioridade inválida '{s.get('prioridade')}'")
        if s.get('icone') and s['icone'] not in chaves_icone:
            sem_icone.add(s['icone'])
        por_modulo.setdefault(mod, []).append(s)

    # Cobertura: o serviço é citado no artigo do módulo?
    print(f"\n{'MÓDULO':<34} {'SERVIÇOS':>8} {'ESCRITO':>8}  COBERTURA")
    print('─' * 78)
    total_falta = 0

    for mod, lista in por_modulo.items():
        slug = SLUG_DO_MODULO.get(mod)
        if slug is None:
            print(f"{mod:<34} {len(lista):>8} {'n/a':>8}  (coberto pelos módulos 1-14)")
            continue

        texto = texto_do_artigo(slug)
        if texto is None:
            total_falta += len(lista)
            print(f"{mod:<34} {len(lista):>8} {'não':>8}  ⏳ a escrever: {slug}.json")
            if so_pendente:
                for s in lista:
                    print(f"      · [{s['prioridade']:<10}] {s['nome']} — {s['papel']}")
            continue

        ausentes = []
        for s in lista:
            if s['prioridade'] == 'nicho':
                continue  # nicho pode ficar só na tabela; não exigimos citação
            if not any(t in texto for t in termos_de_busca(s)):
                ausentes.append(s['nome'])

        marca = '✓' if not ausentes else f'✗ {len(ausentes)} ausente(s)'
        print(f"{mod:<34} {len(lista):>8} {'sim':>8}  {marca}")
        for nome in ausentes:
            erros.append(f"{slug}: serviço '{nome}' está no catálogo mas não é citado no conteúdo")

    print('─' * 78)
    print(f"{len(servicos)} serviços no catálogo · {total_falta} ainda sem módulo escrito")

    if sem_icone:
        avisos.append(
            f"{len(sem_icone)} chave(s) de ícone fora do AwsIcon.tsx (caem no genérico): "
            + ', '.join(sorted(sem_icone))
        )

    if avisos:
        print(f"\n⚠️  {len(avisos)} aviso(s):")
        for a in avisos:
            print(f"   {a}")

    if erros:
        print(f"\n❌ {len(erros)} erro(s):")
        for e in erros:
            print(f"   {e}")
        return 2

    print("\n✅ catálogo consistente.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
