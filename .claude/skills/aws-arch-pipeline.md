# Skill: aws-arch-pipeline

Pipeline recursivo de geração, validação e refinamento de diagramas AWS draw.io  
até atingir score ≥ 80/100, calibrado pelas imagens de referência profissionais.

## Invocação

```
/aws-arch-pipeline [caminho.drawio]
/aws-arch-pipeline docs/architecture/minha-arch.drawio
/aws-arch-pipeline          ← usa docs/architecture/completo-todas-fases.drawio
```

---

## Imagens de Referência — O que é 100/100

**Todas as 7 imagens em `docs/architecture/exemples_draws/` são 100 pontos.**  
O scorer e o fixer são calibrados por elas. Leia-as antes de qualquer geração.

---

### `example_draw_100.png` — Distributed Load Testing on AWS
- **Título bold no topo** — "Distributed Load Testing on AWS"
- **Subtítulo descritivo** abaixo do título
- **Containers com bordas e títulos**: "front end" (borda roxa), "backend" (borda laranja), "region" + "VPC"
- **Setas numeradas em círculos laranja** — passos 1 a 14 mostrando sequência exata
- **Labels sempre abaixo dos ícones** — nunca sobrepostos
- **Logo AWS no rodapé** com copyright
- **Background branco limpo** sem grid visível

### `example_draw.png` — Vinci Retirement Services Topology
- **Atores externos separados** — caixa "Clients" (Computer/Mobile/Partners) e "BackOffice VMs" à esquerda
- **Todos serviços com ícone AWS real** — VPN, CloudFront, WAF, Route53, API Gateway, ALB, EKS, etc.
- **Labels abaixo dos ícones** — "Amazon CloudFront", "AWS Lambda"
- **Fluxo de rede** com setas direcionais
- **Título grande** centralizado no diagrama

### `1.png.webp` — Region/VPC close-up (Distributed Load Testing)
- **Números em círculos PRETOS** nas setas — ④ ⑫ ⑬ ⑭ (não sempre laranja)
- **Containers oficiais AWS**: Region = borda laranja dashed, VPC = borda roxa sólida com ícone cloud+shield
- **Background branco absoluto** — zero grid, zero textura
- **Fluxo com arrow simples** — setas finas pretas, sem estilo elaborado
- **Labels em texto limpo abaixo** dos ícones grandes

### `3.png.webp` — AWS Cloud / CloudWatch Metric Streams
- **Logo AWS + "AWS Cloud" como header** do diagrama (canto superior esquerdo)
- **Hierarquia de containers**: AWS Cloud (borda cinza) > Region (borda verde dashed, ícone bandeira) > VPC (borda roxa, ícone cloud+shield)
- **Fluxo esquerda → direita** com setas azuis sem numeração — layout autoexplicativo dispensa números
- **Sem numeração nas setas** — quando o fluxo é linear e óbvio, números são opcionais
- **Background branco** dentro e fora dos containers

### `6.png.webp` — S3 → SNS → SQS → Lambda fanout
- **Diagrama de fluxo puro, sem containers, sem título** — e ainda é 100pts
- **Labels em negrito abaixo dos ícones** — "S3 Bucket", "Lambda Function" (fontStyle=1 bold)
- **Background branco absoluto** — nada além dos ícones e setas
- **Grid de serviços** (layout em linhas paralelas) mostrando fan-out
- **Setas simples** com direção clara, sem rótulos — flow é autoexplicativo pela posição
- **Confirma**: containers e numeração NÃO são obrigatórios — numeração só deve ser adicionada quando o usuário pedir explicitamente

### `001_reinforce2023_TDR352.png` — AWS Forensic Multi-Account
- **Multi-account**: cada container é uma conta AWS com badge `aws` + nome da conta no canto superior
- **Sub-flows como containers nomeados** dentro do principal: "Image Forensic Flow", "Acquisition and Isolation Forensic Flow", "Investigation and Notification Forensic Flow"
- **Números em quadrados coloridos** nas setas (não apenas círculos)
- **Security Group** representado como container dentro do container de conta
- **Step Functions** como serviço de orquestração entre flows
- **Hierarquia profunda** de containers: Conta > Flow > Security Group > Instância

### `icons.png` — AWS Official Icon Library (catálogo de referência)
Define **quais ícones usar** para cada categoria:
- **Formato universal**: square colorido com ícone branco dentro
- **Compute** (Lambda, EC2, ECS, EKS, Fargate, Batch): laranja `#FF9900`
- **Database** (DynamoDB, RDS, Aurora, ElastiCache, Redshift): azul médio/navy
- **Storage** (S3, EFS, FSx): verde `#3F8624`
- **Messaging** (SQS, SNS, EventBridge, Kinesis): rosa `#E7157B`
- **Security** (IAM, WAF, Cognito, Secrets Manager, Shield): vermelho `#DD344C`
- **Network/CDN** (CloudFront, API Gateway, ALB): roxo `#8C4FFF` ou rosa
- **Management/Observability** (CloudWatch, X-Ray): rosa intenso `#FF4F8B`
- **AI/ML** (Bedrock, SageMaker, Rekognition): verde turquesa
- **Cada serviço tem resIcon único** — NUNCA usar ícone genérico para serviço AWS

---

## Padrões Universais (presentes em TODAS as 7 imagens)

Estes são os critérios inegociáveis — toda imagem de referência os respeita:

1. **Label SEMPRE abaixo do ícone** — nunca sobreposto
2. **Ícone AWS específico** por serviço (da biblioteca `icons.png`)
3. **Background branco limpo** — sem textura ou grid visível
4. **Setas direcionais** mostrando fluxo
5. **Espaçamento generoso** entre ícones — sem aglomeração

## Padrões Situacionais (presentes em parte das imagens)

Estes aparecem conforme o tipo de diagrama:

| Padrão | Presente em | Quando usar |
|--------|------------|-------------|
| Containers com títulos | `example_draw_100`, `3.png`, `001_reinforce` | Arquiteturas multi-camada ou multi-conta |
| Setas numeradas | `example_draw_100`, `1.png`, `001_reinforce` | **Opcional** — só quando o usuário pedir ou a sequência for ambígua |
| Atores externos | `example_draw`, `example_draw_100` | Quando o fluxo começa fora da AWS |
| Logo AWS header | `3.png`, `001_reinforce` | Diagramas oficiais / apresentações executivas |
| Hierarquia de containers | `3.png`, `001_reinforce`, `1.png` | Região > VPC > Sub-serviços |
| Grid de fluxo paralelo | `6.png` | Fan-out / processamento em paralelo |

---

## O que esta skill faz

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE LOOP (max 5 iter)                   │
│                                                                 │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│   │  Ler XML  │───▶│  Scorer  │───▶│ Score≥80?│──▶ PASS ✅     │
│   └──────────┘    └──────────┘    └────┬─────┘                 │
│        ▲          (calibrado           │ não                    │
│        │          nas 3 imagens)  ┌────▼─────┐                 │
│        │          de referência   │ Feedback  │                 │
│        │                          └────┬─────┘                 │
│        │                          ┌────▼─────┐                 │
│        └──────────────────────────│  Fixer   │                 │
│                                   └──────────┘                 │
│   Se iter=5 e score<80 → FAIL ❌ (abrir para inspeção manual)  │
└─────────────────────────────────────────────────────────────────┘
```

1. **Lê** o XML do arquivo `.drawio`
2. **Executa** `scripts/drawio/aws-arch-scorer.py` → score + breakdown + issues
3. **Se score ≥ 80:** abre no draw.io via MCP, emite relatório final → encerra
4. **Se score < 80:** gera feedback priorizado, executa `aws-arch-fixer.py`
5. **Repete** com o XML corrigido (máx 5 iterações)

---

## Rubrica — 7 Dimensões Baseadas nas Imagens de Referência

| Dimensão | Max | Origem na referência |
|----------|-----|---------------------|
| D1 — Ícones AWS Corretos | 18 | `icons.png`: catálogo oficial; `example_draw.png`: cada serviço tem seu ícone específico |
| D2 — Labels Abaixo dos Ícones | 12 | Ambas as imagens: texto SEMPRE abaixo, nunca sobreposto |
| D3 — Containers e Agrupamento | 20 | `example_draw_100.png`: front end/backend/VPC/region com bordas e títulos |
| D4 — Fluxo Rotulado | 15 | `example_draw_100.png`: setas rotuladas com protocolo/ação |
| D5 — Título e Contexto | 10 | `example_draw_100.png`: título bold + subtítulo + logo AWS |
| D6 — Atores Externos | 5 | `example_draw.png`: "Clients" e "BackOffice VMs" separados da infra |
| D7 — Qualidade Visual e Roteamento | 24 | Spacing, roteamento, legibilidade, canvas, conectividade — calibrado pelos 7 refs |

**Total: 104 pts | Threshold de aprovação: ≥ 83 pts (80%)**

---

## Detalhamento por Dimensão

### D1 — Ícones AWS Corretos (18 pts)
Referência `icons.png` + `example_draw.png`: todos os serviços usam ícone AWS real (square colorido),
não retângulos genéricos.

| Sub | Pts | Critério |
|-----|-----|---------|
| D1.1 | 8 | % de nós de serviço com `shape=mxgraph.aws4.resourceIcon` |
| D1.2 | 5 | `resIcon=mxgraph.aws4.[serviço]` específico presente |
| D1.3 | 5 | Cores corretas por categoria (laranja=Compute, verde=Storage, rosa=Messaging, vermelho=Security) |

### D2 — Labels Abaixo dos Ícones (12 pts)
Referência AMBAS as imagens: **nenhuma** tem texto sobreposto ao ícone.

| Sub | Pts | Critério |
|-----|-----|---------|
| D2.1 | 6 | `verticalLabelPosition=bottom` em todos os ícones AWS |
| D2.2 | 2 | Sem `labelBackgroundColor=#ffffff` (retângulo branco sobre ícone) |
| D2.3 | 2 | `fontSize >= 11` em todos os elementos |
| D2.4 | 2 | Sem prefixos redundantes — label não repete o tipo do ícone (ex: "Authorizer", não "Lambda Authorizer") |

### D3 — Containers e Agrupamento Lógico (20 pts)
Referência `example_draw_100.png`: boxes "front end", "backend", "region", "VPC" com bordas dashed.
Referência `3.png.webp` e `1.png.webp`: hierarquia AWS Cloud > Region > VPC.

| Sub | Pts | Critério |
|-----|-----|---------|
| D3.1 | 6 | ≥ 3 containers com nome (swimlane, container=1, ou zona de fundo nomeada) |
| D3.2 | 4 | ≥ 3 grupos lógicos distintos |
| D3.3 | 3 | Legenda COMPLETA: explica cores de nós, badges, estilos de edge, cores de edge |
| D3.4 | 3 | Spread horizontal ≥ 400px (layout direcional, não aglomerado) |
| D3.5 | 4 | Hierarquia AWS presente: Region > VPC quando há Lambda/RDS/EC2. DynamoDB/S3 ficam fora do VPC (serviços managed). Usar `shape=mxgraph.aws4.group` com `grIcon` correto |

### D4 — Fluxo Rotulado (15 pts)
Referência `example_draw_100.png`: setas rotuladas com protocolo/ação. Numeração é **opcional** — só adicionar quando o usuário pedir explicitamente.

| Sub | Pts | Critério |
|-----|-----|---------|
| D4.1 | 10 | % de arestas com `value` não vazio (ação curta, max 2 palavras, vocabulário consistente) |
| D4.2 | 5 | Arestas de monitoramento com `dashed=1` |

### D5 — Título e Contexto (10 pts)
Referência `example_draw_100.png`: "Distributed Load Testing on AWS" bold + subtítulo.

| Sub | Pts | Critério |
|-----|-----|---------|
| D5.1 | 6 | Título com `fontSize >= 18` e `fontStyle=1` (bold) |
| D5.2 | 4 | Subtítulo, descrição ou caixa informativa presente |

### D6 — Atores Externos (5 pts)
Referência `example_draw.png`: caixa "Clients" com Computer/Mobile/Partners à esquerda.

| Sub | Pts | Critério |
|-----|-----|---------|
| D6.1 | 3 | Pelo menos 1 ator externo (`mxgraph.aws4.user`, ou label com browser/client/usuário) |
| D6.2 | 2 | Ator externo nas bordas do diagrama (x < 200 ou x > 1400) |

### D7 — Qualidade Visual e Roteamento (20 pts)
Dimensão expandida — calibrada pelo gap entre o diagrama atual e as 7 imagens de referência. Estes critérios são o que separa um diagrama "funcional" de um diagrama "profissional para apresentação".

| Sub | Pts | Critério |
|-----|-----|---------|
| D7.1 | 2 | Containers com `fillColor=none` ou opacity ≤ 35 (sem fundos pesados) |
| D7.2 | 1 | CloudWatch ou X-Ray presente |
| D7.3 | 1 | IAM, Cognito, WAF ou Secrets Manager presente |
| D7.4 | 2 | Espaçamento mínimo 250px entre nós na mesma coluna, 300px entre colunas (refs usam 200-250px com ícones menores) |
| D7.5 | 2 | Sem arestas sobrepostas — edges de mesmo source com exit/entry points variados |
| D7.6 | 2 | `labelBackgroundColor=#FFFFFF` em todas as arestas |
| D7.7 | 1 | Contraste correto — fillColor escuro → fontColor branco; fundo claro → fontColor escuro |
| D7.8 | 3 | **Sem star pattern** — nenhum nó com >4 edges saindo. Fan-out agrupado semanticamente ou distribuído em grid |
| D7.9 | 2 | **Edges não cruzam containers estranhos** — seta nunca atravessa zona que não contém source nem target |
| D7.10 | 2 | **Edge labels posicionados** — em edges >300px, label com offset perto do source (posição 0.1-0.3), nunca no midpoint de zona alheia |
| D7.11 | 1 | **Canvas proporcional** — conteúdo ocupa ≥70% do canvas. Legenda/cost logo abaixo do último container |
| D7.12 | 1 | **Fundo branco forçado** — `background=#FFFFFF` no mxGraphModel para garantir legibilidade em dark mode |
| D7.13 | 1 | **Zero nós órfãos** — todo ícone AWS tem pelo menos 1 edge ou nota explicativa. Nós órfãos são piores que ausentes |
| D7.14 | 1 | **Express lanes espaçadas** — min 30px vertical entre waypoint lanes paralelas. Max 2 express lanes por diagrama |
| D7.15 | 1 | **Containers proporcionais** — height ajustado ao conteúdo (1 ícone ≤ 180px, 4 ícones ≤ 350px). Nunca mesma height para todos |
| D7.16 | 1 | **Acentos corretos em PT-BR** — "lê", "módulo", "produção", "serviços", "usuários", nunca sem acento |

---

## Algoritmo do Loop

### Passo 1 — Identificar e validar o arquivo

```
Se não especificado: usar docs/architecture/completo-todas-fases.drawio
Verificar se existe. Se não: instruir /aws-arch primeiro.
```

### Passo 2 — Loop iterativo (max 5 iterações)

```bash
# Executar scorer
python3 scripts/drawio/aws-arch-scorer.py [arquivo]

# score >= 80? → PASS
# score < 80 e iter < 5? → executar fixer
# score < 80 e iter = 5? → FAIL
```

Antes de cada fixer, emitir feedback estruturado:

```
[Pipeline Iter N/5] Score: X/100 — Gap: Y pts

Comparando com as imagens de referência:
  📌 example_draw_100.png: [o que está diferente]
  📌 example_draw.png: [o que está diferente]

Fixes AUTO aplicados agora:
  → [lista de correções com tipo AUTO]

Alertas — corrigir manualmente ou em próxima geração:
  ⚠ [lista com ALERT/GENERATE + IDs afetados]
```

```bash
# Aplicar correções AUTO
python3 scripts/drawio/aws-arch-fixer.py [arquivo]
```

### Passo 3 — Fixes GENERATE (o Claude injeta XML)

Para issues do tipo `GENERATE`, o Claude deve gerar e injetar o XML diretamente:

**Legenda ausente (D3.3):**
```xml
<mxCell id="leg" value="Legenda: 🟠 Compute  🟢 Banco  🔴 Segurança  🟣 CDN/Edge  ─── principal  - - - monitoramento"
  style="text;html=1;strokeColor=#666666;fillColor=#f5f5f5;align=left;fontSize=11;spacingLeft=8;"
  vertex="1" parent="1">
  <mxGeometry x="20" y="[Y_RODAPE]" width="1000" height="40" as="geometry"/>
</mxCell>
```

**Numeração de passos (D4.3 — OPCIONAL, só quando o usuário pedir):**
Se solicitado, para cada aresta sem número, adicionar badge:
```xml
<mxCell id="badge_1" value="1"
  style="ellipse;whiteSpace=wrap;html=1;fillColor=#FF9900;strokeColor=#d79b00;
         fontColor=#ffffff;fontSize=11;fontStyle=1;"
  vertex="1" parent="1">
  <mxGeometry x="[X_MEDIO_ARESTA]" y="[Y_MEDIO_ARESTA]" width="24" height="24" as="geometry"/>
</mxCell>
```

**Container ausente (D3.1):**
```xml
<mxCell id="bg_frontend" value="🔌 Frontend"
  style="rounded=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=2;
         verticalAlign=top;opacity=35;dashed=1;"
  vertex="1" parent="1">
  <mxGeometry x="[X]" y="[Y]" width="[W]" height="[H]" as="geometry"/>
</mxCell>
```

### Passo 3.4 — Gate Geométrico (obrigatório antes do export PNG)

**Scorer XML não enxerga geometria real.** Antes de gastar tempo no PNG/visual review, rodar o linter de layout que detecta sobreposições reais via bbox:

```bash
python3 scripts/drawio/layout-linter.py [arquivo] --json > /tmp/layout.json
# exit 1 se houver CRITICO
```

**Regras detectadas (calibradas em casos reais):**

| Regra | Detecta | Severidade |
|-------|---------|-----------|
| P27 | Bbox overlap > 20% entre células text/legenda (ex: leg_obs e leg_steps no mesmo y) | CRITICO se >30%, ALTO senão |
| P28 | Badges fb_*/pill_* sobrepondo o ícone que anotam | ALTO se vinculado, MEDIO senão |
| P29 | Express lanes paralelas com gap_y < 30px e x-overlap | CRITICO se ambas têm label, ALTO senão |
| P31 | Step badges (numeração) sobre ícones AWS | ALTO |

**Comportamento:** se houver qualquer CRITICO, aplicar fix RESTRUCTURE imediatamente (Edit no XML) e re-rodar linter. Não exportar PNG até zerar CRITICO. ALTO/MEDIO podem propagar para o gate visual.

**Fix patterns prontos:**
- P27: `cell_b.y = cell_a.y + cell_a.h + 6` (empilhar verticalmente)
- P28: badge ACIMA `(icon.x + icon.w - badge.w, icon.y - badge.h - 4)` se icon.y > 290; senão DIREITA `(icon.x + icon.w + 4, icon.y + 2)`
- P29: realocar para canal Y reservado — TOP1=125, TOP2=165, MID-OBS-1=548, MID-OBS-2=583, BOTTOM-RETURN=870
- P31: mover step para corredor entre ícones (gap horizontal ≥ 30px de qualquer ícone)

---

### Passo 3.5 — Gate Visual (obrigatório após score XML ≥ 80)

**XML passa ≠ visual passa.** Validado empiricamente: um diagrama com XML 100/100 pode ter visual 58/100 (real case baseline). O scorer lê atributos, mas não vê overlap real, cruzamento feio de arestas, densidade ruim, espaço morto. Por isso, após convergência do loop XML, rode o gate visual.

**Progressão típica observada (4 iterações):**
- v0 baseline: 58/100 (XML 100 mas visual ruim)
- v1 tipografia + legenda: 72/100 (+14)
- v2 nota IAM movida + bold edges + canais: 86/100 (+14)
- v3 badges numerados + bold seletivo + AWS pill: 91/100 (+5)
- v4 micro-tune (badges reposicionados, fontSize ícones 13): 93/100 (+2)
- Convergência típica em 3-4 iterações visuais até zero CRITICO.

```bash
# 1. Exportar PNG em alta resolução
bash scripts/drawio/export-png.sh [arquivo.drawio]

# 2. Invocar /drawio-visual-review (lê PNG + 7 refs, compara)
```

A skill `/drawio-visual-review` retorna JSON com `visual_score` (0-100) e issues por severidade.

**Matriz de decisão final (calibrada após 4 rodadas reais):**

| XML Score | Visual Score | Visual CRITICO | Ação |
|-----------|--------------|----------------|------|
| ≥ 80      | ≥ 95         | 0              | **APROVADO FINAL** — abre drawio, encerra |
| ≥ 80      | 85–94        | 0              | **PASSÁVEL** — pode ir para PR/review, fixes são polish |
| ≥ 80      | ≥ 80         | ≥ 1            | LOOP VISUAL — aplica fixes, re-exporta, re-visual |
| ≥ 80      | < 80         | qualquer       | LOOP VISUAL + atualizar skills se padrão recorrente |
| < 80      | —            | —              | Não deve chegar aqui (Passo 2 não convergiu) |

**Threshold ajustado:**
- **Meta dura: 95/100 visual** com zero CRITICO (target enterprise-grade)
- **Meta mínima: 85/100** com zero CRITICO (aceitável para PR interno)
- Cada iteração visual = 1 turno de Edit + export PNG + visual review via Agent

### Loop iterativo visual (max 5 iterações)

```
iter = 1
while iter <= 5 and visual_score < 95:
    1. Aplicar fixes apontados (priorizar CRITICOs, depois ALTOs)
    2. Se houver padrão recorrente → atualizar draw-review.md (P2N) ou aws-arch.md
    3. bash scripts/drawio/export-png.sh [arquivo]
    4. Agent (visual-review) → JSON
    5. Versionar: cp arquivo docs/architecture/versoes/vN-iterN.drawio
    6. Se visual_score ≥ 95 e zero CRITICO: PASS, abrir no drawio
    7. Se visual_score < 70 após iter 3: STOP, invocar /drawio-critico (problema estrutural)
    iter += 1
```

**Após 5 iterações visuais sem passar:** invoca `/drawio-critico` para veredicto final e lista de correções manuais.

### Aprendizados consolidados (das 4 rodadas reais)

Cada iteração que **move ponteiro ≥ +5pts** deve ser absorvida como regra. Lições já consolidadas:

| Aprendizado | Skill atualizada | Fix type |
|-------------|------------------|----------|
| Container headers fracos (fontSize<13) | aws-arch.md (seção containers) | GENERATE na criação |
| Edge labels em cinza não-bold ilegíveis | draw-review.md P22 | AUTO |
| Notas dentro de containers alheios | draw-review.md P21 | RESTRUCTURE |
| Legendas truncadas (width<1100) | draw-review.md P23 | AUTO |
| Sem badges numerados em fluxo >5 passos | aws-arch.md (seção numeração) | GENERATE |
| Bold em TODAS edges fica pesado | aws-arch.md (seção arestas) | RESTRUCTURE |
| Express lanes sem gap ≥30px | draw-review.md P25 | RESTRUCTURE |
| Star pattern em zona central | draw-review.md P26 | RESTRUCTURE |

### Passo 4 — Relatório Final

**PASS ✅:**
```
╔══════════════════════════════════════════════════════════════╗
║  ✅ DIAGRAMA APROVADO — Production Ready                     ║
╠══════════════════════════════════════════════════════════════╣
║  Score Final: 87/100  |  Convergiu em: 3 iterações          ║
╠══════════════════════════════════════════════════════════════╣
║  COMPARAÇÃO COM REFERÊNCIA                                   ║
║  ✅ Ícones AWS corretos (como example_draw.png + icons.png)  ║
║  ✅ Labels abaixo dos ícones (como ambas as referências)     ║
║  ✅ Containers agrupados (como example_draw_100.png)         ║
║  ✅ Fluxo rotulado  ⚠ Numeração de passos: parcial          ║
╠══════════════════════════════════════════════════════════════╣
║  AUDIT TRAIL                                                 ║
║  Iter 1: 52/100 → Iter 2: 71/100 → Iter 3: 87/100 ✅       ║
╚══════════════════════════════════════════════════════════════╝
```

**FAIL ❌:** Emitir relatório + abrir draw.io + listar próximos passos manuais.

---

## Tipos de Fix

| Tipo | Quem executa | Dimensões |
|------|-------------|-----------|
| `AUTO` | `aws-arch-fixer.py` | D1.3 (cores), D2.1-D2.3 (labels), D2.4 (prefixos), D4.2 (dashed), D7.1 (opacity), D7.6 (labelBgColor), D7.7 (contraste), D7.12 (background), D7.16 (acentos) |
| `ALERT` | Claude notifica, usuário decide | D1.1 (ícones genéricos), D4.1 (arestas sem label), D6.2 (posição ator), D7.8 (star pattern), D7.9 (edges cruzando containers), D7.10 (labels em zona errada), D7.13 (nós órfãos) |
| `GENERATE` | Claude gera XML e injeta | D3.3 (legenda completa), D3.1 (containers), D3.5 (VPC), D5.1 (título), D7.13 (edges/notas para nós órfãos) |
| `RESTRUCTURE` | Claude reorganiza layout | D7.4 (espaçamento), D7.8 (star pattern — redistribuir targets), D7.11 (canvas resize), D7.14 (espaçar express lanes), D7.15 (ajustar height containers) |

---

## Estratégias de Convergência

| Estratégia | Trigger | Ação prioritária |
|-----------|---------|-----------------|
| `FOCUS_LABELS` | D2 < 8 | AUTO: `verticalLabelPosition=bottom` + remover prefixos redundantes |
| `FOCUS_ICONS` | D1 < 10 | ALERT: substituir retângulos genéricos por ícones do `icons.png` |
| `FOCUS_FLOW` | D4 < 8 | ALERT: labels faltando nas arestas (numeração só se o usuário pedir) |
| `FOCUS_STRUCTURE` | D3 < 12 | GENERATE: containers com título + legenda completa + VPC |
| `FOCUS_TITLE` | D5 < 6 | GENERATE: título bold + subtítulo |
| `FOCUS_ROUTING` | D7 < 12 | RESTRUCTURE: resolver star patterns, edges cruzando containers, spacing |
| `GENERAL_IMPROVEMENT` | Score 70-79 | Atacar maior gap restante por dimensão |

---

## Evolução Futura (CI/CD Ready)

### Score em PR (GitHub Actions)
```yaml
- name: Validate Architecture Diagram
  run: |
    score=$(python3 scripts/drawio/aws-arch-scorer.py \
      docs/architecture/completo-todas-fases.drawio --quiet)
    echo "Score: $score/100"
    [ "$score" -ge 80 ] || exit 1
```

### Versionamento com score
```bash
# scripts/drawio/version-diagram.sh
SCORE=$(python3 scripts/drawio/aws-arch-scorer.py [arquivo] --quiet)
cp [arquivo] "docs/architecture/versoes/arch-$(date +%Y%m%d)-score${SCORE}.drawio"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),${SCORE}" >> docs/architecture/score-history.csv
```

### Análise visual futura (screenshot + Claude Vision)
```python
# Futuro: comparar screenshot com as imagens de referência via Claude claude-opus-4-6
# para análise visual que vai além do XML
```

---

## Princípios do Pipeline

- **As 3 imagens em `exemples_draws/` são o padrão de 100** — toda decisão de geração e validação parte delas
- **Não abrir draw.io a cada iteração** — apenas na iteração final (PASS ou FAIL)
- **Fixes AUTO nunca removem conteúdo semântico** — apenas reformatam estilo e geometria
- **ALERT = contexto de negócio necessário** — o Claude informa, o usuário decide
- **GENERATE = Claude escreve XML e usa Edit** para injetar antes de `</root>`
- **Máx 5 iterações** — se não convergir, é sinal de problema estrutural
- **Sempre português brasileiro** em todos os outputs
