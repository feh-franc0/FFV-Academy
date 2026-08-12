#!/usr/bin/env python3
"""Gate de cobertura das seções profissionais da série `trail-labs-aws`.

─── Por que este gate existe ─────────────────────────────────────────────────

Um laboratório desta série promete mais que "montar o recurso e ver funcionar".
O que separa o conteúdo daqui de um tutorial é o conjunto de perguntas que ele
responde DEPOIS que a coisa sobe: quem pode chamar isto, como eu vejo que
quebrou, o que acontece a 1 milhão, quanto custa, onde os seis pilares dizem que
ainda está frágil, o que acontece quando eu derrubo de propósito, o que fazer
quando o sintoma aparece às 3h, onde IA ajuda de verdade e onde não ajuda, e
qual é o erro que alguém comete aqui e por quê.

Nove seções. As bandas 1 a 8 as têm em praticamente 100% dos 80 laboratórios —
por disciplina de quem escreveu, não por garantia do sistema. Medição de
09/ago/2026: as bandas 9 e 10, escritas por último, largaram. A média de seções
por laboratório caiu de 27,7 para 22,2, e 11 laboratórios perderam três ou mais
das nove — nove deles perderam sete ou oito. Custos/FinOps sobrevivia em 35% da
banda 10; injeção de falha, em 15%.

Nenhum gate viu, porque `validate_labs_aws.py` confere que existe diagrama, quiz
e tabela na FORMA certa e `validate_barra_ensino.py` confere a qualidade dentro
deles — nenhum dos dois pergunta se a seção existe. O sinal quantitativo que
denunciava sozinho: XP por 1000 caracteres subiu 4,1x ao longo da série (3,47 na
banda 1, 14,24 na banda 10). Recompensa subindo enquanto volume cai é régua
caindo.

Regra normativa sem gate é convenção, e convenção sobrevive só enquanto quem a
escreveu está escrevendo.

─── Duas decisões de desenho, as duas por reprovação passada ─────────────────

1. **Cobre a seção pelo TÍTULO, e o vocabulário vem do corpus, não da cabeça.**
   Cada seção aceita a forma canônica mais as variantes que labs corretos já
   usam ("Custos e FinOps", "Observabilidade e operação", "Anti-patterns",
   "Extensão com IA", "Troubleshooting"). A lista foi extraída dos 100 seeds
   reais, não antecipada — foi assim que gates anteriores desta base reprovaram
   conteúdo correto três vezes seguidas, por conhecer o termo em um só idioma.

2. **Não confere o BLOCO dentro da seção.** Uma tabela de risco e uma lista de
   alarmes ensinam observabilidade igualmente bem; exigir um tipo de bloco
   empurraria o autor à forma errada. O gate cobra que a PERGUNTA seja
   respondida, e deixa a forma para quem escreve.

Uso:
    python3 scripts/validate_cobertura_secoes.py            # relatório
    python3 scripts/validate_cobertura_secoes.py --strict   # falha
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARTIGOS = RAIZ / 'scripts/seeds/articles'
TRILHA = RAIZ / 'frontend/src/lib/curriculum/trails/trail-labs-aws.ts'

# As nove seções, cada uma com a pergunta que ela responde (aparece na mensagem
# de falha — dizer "falta Observabilidade" não ensina nada a quem vai escrever)
# e os padrões de título aceitos.
#
# Os padrões são ancorados no início do título porque toda seção da série começa
# pelo assunto e detalha depois dos dois pontos ("Custo: as dimensões, três
# cenários e o que ninguém nota"). Well-Architected é a exceção: aparece tanto
# como "Well-Architected nos seis pilares" quanto no meio de outra frase.
SECOES = [
    ('Segurança',
     'quem pode chamar isto, e o que vaza se a credencial escapar',
     [r'^seguran']),
    ('Observabilidade',
     'como você vê que quebrou antes do cliente ver',
     [r'^observabilidade', r'^monitorament']),
    ('Escala',
     'o que muda a 10, a 10 mil, a 1 milhão, e na perda de uma zona',
     [r'^escala', r'^escalabilidade']),
    ('Custo',
     'quanto custa em três ordens de grandeza, e o que ninguém nota na fatura',
     [r'^custos?\b', r'finops']),
    ('Well-Architected',
     'onde os seis pilares dizem que este desenho ainda está frágil',
     [r'well.?architected', r'seis pilares']),
    ('Injeção de falha',
     'o que acontece quando você derruba de propósito — e o que o painel mostra',
     [r'^quebrar', r'\bcaos\b', r'\bchaos\b', r'injeç\w+ de falha',
      r'^falhar de prop']),
    ('Troubleshooting',
     'o sintoma às 3h da manhã, a causa provável e onde olhar',
     [r'^quando ', r'^troubleshoot', r'^diagnostic', r'^diagnóstic']),
    # `^onde .*\bia\b` em vez de `^onde (a )?ia\b`: nos laboratórios da banda 9 a
    # seção se chama "Onde MAIS IA entra" — porque o módulo inteiro já é IA e a
    # pergunta honesta passa a ser onde cabe mais. Variante legítima que a forma
    # estreita reprovava. O `\b` impede casar "dia", "garantia", "vigia".
    ('Onde IA entra',
     'onde IA resolve de verdade aqui — e, se não resolve, dizer isso',
     [r'^onde .*\bia\b', r'^extens\w+ com ia\b', r'^ia\b']),
    ('Anti-padrões',
     'o erro que alguém comete aqui, por que comete, e o sintoma em produção',
     [r'^anti.?padr', r'^anti.?pattern', r'^antipadr']),
]

# A décima seção — "Desafio — sem roteiro" — não é das nove acima: ela não
# documenta o que o laboratório já fez, pede que quem estudou construa uma
# EXTENSÃO da arquitetura sem passo a passo. Por isso é cobrada só dos 20
# labs-âncora ("essenciais para portfólio" em
# docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md) — os outros 80 nunca tiveram
# esse contrato prometido, e cobrar de todos inventaria uma dívida que nunca
# existiu (ver [[feedback_regra_sem_gate]]).
SECAO_DESAFIO = (
    'Desafio',
    'requisito novo derivado da arquitetura do laboratório, com critério de '
    'aceite executável — não "verifique se funcionou"',
    [r'^desafio'],
)

LABS_ANCORA = frozenset([
    'lab-app-web-ecs-fargate-rds',
    'lab-rede-vpc-subrede-privada-nat',
    'lab-segredo-secrets-manager-rotacao',
    'lab-observabilidade-trace-correlacao',
    'lab-api-gateway-cota-versao-ou-alb',
    'lab-escolher-banco-pela-carga',
    'lab-fila-sqs-dlq-idempotencia',
    'lab-step-functions-orquestracao-ou-codigo',
    'lab-extrair-servico-fronteira-transacao',
    'lab-retry-backoff-jitter-circuit-breaker-polly',
    'lab-iam-policy-menor-privilegio-auditoria',
    'lab-multi-conta-organizations-scp-control-tower',
    'lab-opentelemetry-tres-pilares-dotnet',
    'lab-pipeline-cicd-oidc-sem-chave',
    'lab-dr-multiregiao-quatro-estrategias',
    'lab-data-lake-bronze-prata-ouro',
    'lab-servir-modelo-quatro-modos-inferencia',
    'lab-rag-minimo-com-citacao',
    'lab-agente-com-ferramenta-quem-executa',
    'lab-projeto-final-plataforma-dotnet-aws-ia',
])


def slugs_da_trilha() -> list[str]:
    if not TRILHA.exists():
        return []
    texto = TRILHA.read_text(encoding='utf-8')
    return re.findall(r"slug:\s*'([^']+)'", texto)


def titulos(slug: str) -> list[str] | None:
    caminho = ARTIGOS / f'{slug}.json'
    if not caminho.exists():
        return None
    dados = json.loads(caminho.read_text(encoding='utf-8'))
    return [
        (bloco.get('data', {}).get('title') or '').strip().lower()
        for bloco in dados.get('blocks', [])
    ]


def conferir(slug: str) -> list[str]:
    ts = titulos(slug)
    if ts is None:
        return [f'seed não encontrado em {ARTIGOS.name}/']

    faltando = []
    for nome, pergunta, padroes in SECOES:
        if not any(re.search(p, t) for t in ts for p in padroes):
            faltando.append(f'sem seção "{nome}" — {pergunta}')

    if slug in LABS_ANCORA:
        nome, pergunta, padroes = SECAO_DESAFIO
        if not any(re.search(p, t) for t in ts for p in padroes):
            faltando.append(f'sem seção "{nome}" — {pergunta}')
    return faltando


def main() -> int:
    estrito = '--strict' in sys.argv
    slugs = slugs_da_trilha()

    print('=' * 74)
    print('GATE  cobertura das nove seções profissionais (trail-labs-aws)')
    print('=' * 74)
    if not slugs:
        print('trilha não encontrada ou vazia — nada a conferir')
        return 0
    print(f'laboratórios declarados na trilha: {len(slugs)}')
    print()

    total = 0
    labs_com_falha = 0
    for slug in slugs:
        falhas = conferir(slug)
        if falhas:
            labs_com_falha += 1
            total += len(falhas)
            print(f'  ✗ {slug}')
            for f in falhas:
                print(f'      {f}')
    print()

    if total:
        print(f'✗ {total} seção(ões) ausente(s) em {labs_com_falha} de {len(slugs)} '
              f'laboratórios')
        return 1 if estrito else 0
    print(f'✓ os {len(slugs)} laboratórios respondem às nove perguntas que separam')
    print('  um laboratório de arquitetura de um tutorial: segurança, observabilidade,')
    print('  escala, custo, Well-Architected, injeção de falha, troubleshooting,')
    print('  onde IA entra e anti-padrões.')
    print(f'✓ os {len(LABS_ANCORA)} labs-âncora ("essenciais para portfólio") também')
    print('  têm a décima seção — Desafio sem roteiro.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
