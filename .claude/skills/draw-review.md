# Skill: draw-review

Revisor e corretor de diagramas draw.io para qualidade profissional.  
Analisa o XML, detecta problemas visuais, corrige e reabre o diagrama.

## Invocação

```
/draw-review [caminho-do-arquivo.drawio]
/draw-review docs/architecture/fase1-mvp.drawio
/draw-review                   ← analisa todos os .drawio em docs/architecture/
```

---

## O que esta skill faz

1. **Lê o XML** do arquivo draw.io indicado
2. **Analisa** os problemas visuais conhecidos (lista abaixo)
3. **Corrige** automaticamente com Python
4. **Reabre** o diagrama corrigido via MCP draw.io
5. **Relata** exatamente o que foi alterado

---

## Problemas detectados e como corrigir

### P1 — Texto sobreposto ao ícone AWS (mais comum)

**Sintoma:** Label aparece dentro/em cima do ícone AWS.  
**Causa:** Falta de `labelPosition` e `verticalLabelPosition` no style.  
**Correção:** Adicionar ao style do nó:
```
labelPosition=center;verticalLabelPosition=bottom;verticalAlign=top
```
**Regex para detectar:** `shape=mxgraph.aws4.resourceIcon` sem `verticalLabelPosition=bottom`

---

### P2 — Caixa branca sobre ícone (labelBackgroundColor)

**Sintoma:** Retângulo branco cobre parte do ícone.  
**Causa:** `labelBackgroundColor=#ffffff` pintando o fundo do label que sobrepõe o ícone.  
**Correção:** Remover `labelBackgroundColor=#ffffff` (ou trocar por `none`).

---

### P3 — Fonte muito pequena (< 11px)

**Sintoma:** Texto ilegível em diagramas complexos.  
**Causa:** `fontSize=10` ou menor.  
**Correção:** Substituir por `fontSize=11`.

---

### P4 — Zonas de fundo muito opacas

**Sintoma:** Fundo colorido das zonas encobre os ícones/arestas.  
**Causa:** `opacity=60` ou `opacity=50`.  
**Correção:** Reduzir para `opacity=35`.

---

### P5 — Ícones AWS muito pequenos (< 60px)

**Sintoma:** Ícones ilegíveis ou mal renderizados.  
**Causa:** `width` ou `height` < 60 na geometry de nós com `resourceIcon`.  
**Correção:** Forçar `width="60" height="60"`.

---

### P6 — Arestas sem label

**Sintoma:** Setas sem descrição dificultam compreensão do fluxo.  
**Causa:** `value=""` ou ausência de `value` em arestas de arquitetura.  
**Correção:** Alertar ao usuário (não corrigir automaticamente — requer contexto).

---

### P7 — Nós muito próximos (sobreposição de labels)

**Sintoma:** Labels de nós próximos se sobrepostos após mover labels para baixo do ícone.  
**Causa:** Posicionamento y insuficiente entre nós na mesma coluna.  
**Detecção:** Nós com `shape=mxgraph.aws4.resourceIcon` na mesma coluna (x similar ±20px) com diferença y < 130px.  
**Correção:** Alertar com lista de nós afetados e sugerir novo y.

---

### P8 — Arestas sobrepostas (edges stacking)

**Sintoma:** Múltiplas setas seguem o mesmo caminho, formando uma linha grossa impossível de distinguir.  
**Causa:** Vários edges saindo do mesmo nó para nós na mesma coluna (ex: API Gateway → 7 Lambdas empilhadas).  
**Detecção:** Arestas com mesmo `source` cujos `target` têm x similar (±30px) — rotas ortogonais se sobrepõem.  
**Correção:**
- Aumentar espaçamento vertical entre targets (mín 180px entre centros)
- Distribuir targets em 2 colunas quando > 4 nós no mesmo agrupamento
- Usar `exitX=1;exitY=N` variando N (0.1, 0.3, 0.5, 0.7, 0.9) para espalhar saídas
- Considerar `curved=1` no `edgeStyle` para separação natural de rotas

---

### P9 — Labels de arestas sobrepostos a outros elementos

**Sintoma:** Texto em setas fica por cima de ícones, outros textos ou outras setas. Labels parecem "textos soltos" na tela.  
**Causa:** Falta de `labelBackgroundColor` nas arestas + labels longos demais + espaçamento insuficiente entre nós.  
**Correção:**
- Adicionar `labelBackgroundColor=#FFFFFF` em TODAS as arestas (faz o label ter fundo branco que destaca do caminho)
- Manter labels de arestas curtos: máx 3 palavras (ex: "salva XP" em vez de "salva XP · streak · nível")
- Garantir espaçamento mínimo de 180px entre nós conectados para o label ter espaço
- Se o label descreve uma ação do serviço anterior, mover a informação para o label do nó ou do edge — nunca criar nó de texto solto conectado por aresta

---

### P10 — Contraste de cores (texto vs fundo)

**Sintoma:** Texto ilegível por falta de contraste com o fundo.  
**Causa:** `fontColor` escuro em `fillColor` escuro, ou `fontColor` claro em fundo branco.  
**Regra de contraste:**
- `fillColor` escuro (ex: #232F3E, #0050EF, #B85450, #ED7100) → `fontColor=#FFFFFF`
- `fillColor` claro ou `none` (ex: #F5F5F5, #FFFFFF, none) → `fontColor=#232F3E`
- Labels abaixo de ícones (em fundo branco da página) → `fontColor=#232F3E`
- Badges de fase (fillColor sólido) → `fontColor=#FFFFFF`
**Correção AUTO:** Detectar pares fillColor/fontColor sem contraste e corrigir.

---

### P11 — Star pattern (fan-out extremo)

**Sintoma:** Um nó tem >4 edges saindo, criando "estrela" de setas ilegível. Setas se empilham, se cruzam e é impossível seguir uma rota individual.  
**Causa:** Serviço centralizado (ex: API Gateway) conectado a muitos targets sem distribuição visual.  
**Detecção:** Contar edges por `source`. Se `count > 4` para qualquer nó = red flag.  
**Correção:**
- Distribuir targets em grid (2 colunas x N linhas) com mín 250px entre colunas e 250px entre linhas
- Variar `exitX/exitY` no source para espalhar saídas (0.1, 0.3, 0.5, 0.7, 0.9)
- Se targets pertencem a zonas diferentes (ex: F1 vs F3), criar **edge única para o container** da zona, e dentro da zona usar edges internos
- Nunca mais de 4 edges visíveis saindo de um único nó; agrupar semanticamente se necessário

---

### P12 — Edges cruzando containers estranhos

**Sintoma:** Uma seta entra e sai de um container sem ter source ou target dentro dele. Exemplo: APIGW→LambdaQuiz cruzando toda a zona "Compute F1" verticalmente.  
**Causa:** Layout onde target está abaixo/acima de um container intermediário, e a rota ortogonal atravessa.  
**Detecção:** Para cada edge, verificar se a reta entre source e target cruza o bounding box de algum container que não contém nem source nem target.  
**Correção:**
- Reorganizar o layout para que edges sigam "corredores" entre containers (nunca atravessando)
- Usar waypoints manuais para contornar containers
- Mover targets para que o edge não precise cruzar zonas alheias
- Separar fluxos de diferentes fases/zonas com entry points dedicados

---

### P13 — Canvas oversized

**Sintoma:** O diagrama tem grandes áreas vazias (>30% do canvas sem conteúdo). Faz o diagrama parecer incompleto ou mal distribuído.  
**Causa:** `pageWidth/pageHeight` muito maior que o bounding box do conteúdo.  
**Detecção:** Calcular bounding box de todos os nós (min/max x/y). Se `pageWidth * pageHeight > 1.4 * bbox area` = oversized.  
**Correção:**
- Redimensionar canvas para `bbox + 100px` de margem em cada lado
- Ou redistribuir conteúdo para preencher o canvas existente
- Legenda e cost box devem ficar logo abaixo do último container, não no fundo do canvas

---

### P14 — Edge labels em zona semanticamente errada

**Sintoma:** O label de um edge aparece dentro de um container/zona que não tem relação com o source nem o target. Exemplo: label "POST /quiz" renderiza dentro da zona "Compute F1" porque o edge é longo e o midpoint cai ali.  
**Causa:** Labels sem offset manual ficam no midpoint geométrico do edge. Em edges longos que cruzam zonas, o midpoint frequentemente cai em zona errada.  
**Detecção:** Para edges com comprimento > 300px, calcular o midpoint e verificar se cai dentro de algum container que não contém source nem target.  
**Correção:**
- Usar `<mxGeometry relative="1" as="geometry"><mxPoint as="offset" x="0" y="-15"/></mxGeometry>` para deslocar label
- Ou usar `<mxPoint x="0.2" y="0" as="geometry"/>` para mover o label para 20% do edge (perto do source)
- Preferir labels perto do source (posição 0.1-0.3 do edge) para edges longos
- Em edges curtos (<200px), midpoint default é aceitável

---

### P15 — Legenda incompleta

**Sintoma:** O diagrama usa cores, estilos de edge ou badges que não estão explicados na legenda. O leitor precisa adivinhar o significado.  
**Causa:** Legenda desatualizada ou parcial — não acompanhou a adição de novos elementos.  
**Detecção:** Coletar todos os `strokeColor` de edges, `fillColor` de nós e badges, `dashed` vs sólido. Comparar com o que a legenda explica.  
**Correção:**
- Legenda DEVE explicar:
  - Cores dos nós (laranja=Compute, verde=Storage, rosa=Messaging, etc.)
  - Cores dos badges de fase (se existirem)
  - Estilos de edge (sólido=fluxo principal, dashed=monitoramento/validação)
  - Cores de edge se houver >1 cor (ex: verde=retorno, vermelho=segurança)
- Formato: tabela visual ou ícones + texto no rodapé do diagrama

---

### P16 — Prefixos redundantes em labels

**Sintoma:** Labels como "Lambda Authorizer", "Lambda Modulos" quando o ícone já é um Lambda. Desperdiça espaço, torna label longo, aumenta chance de sobreposição.  
**Causa:** Hábito de nomear com o tipo do serviço, esquecendo que o ícone já comunica isso.  
**Detecção:** Label contém o nome do serviço que o ícone já representa (`Lambda` + `resIcon=lambda`, `S3` + `resIcon=s3`, etc.).  
**Correção:**
- Remover prefixo redundante: "Lambda Authorizer" → "Authorizer"
- Manter prefixo apenas quando ícone é genérico ou ambíguo
- Nomes devem ser descritivos do **papel**, não do **tipo**: "Progresso", "Quiz Worker", "Auth"

---

### P17 — Nós órfãos (sem nenhuma edge)

**Sintoma:** Ícone AWS presente no diagrama mas sem nenhuma seta conectando a ele. Parece decoração ou esquecimento. O leitor pensa "pra que serve isso?".  
**Causa:** Serviço adicionado "para completude" (ex: IAM, CloudWatch, X-Ray) mas sem conexão explícita. Ou edge foi removida em refatoração sem remover o nó.  
**Detecção:** Para cada `mxCell` com `shape=mxgraph.aws4.resourceIcon`, verificar se existe pelo menos 1 edge com `source` ou `target` igual ao ID do nó.  
**Correção:**
- Se o serviço é transversal (IAM, CloudWatch, X-Ray): adicionar edge dashed para pelo menos 1 consumidor, OU usar nota texto explicativa ("habilitado em todos os serviços")
- Se o serviço não tem conexão lógica: remover do diagrama
- Nós órfãos são piores que nós ausentes — presença sem contexto confunde mais que ausência

---

### P18 — Express lanes muito próximas

**Sintoma:** Duas ou mais edges com waypoints manuais (ex: y=160 e y=170) criam linhas horizontais paralelas quase sobrepostas no topo do diagrama. Parecem uma "linha grossa" impossível de distinguir.  
**Causa:** Waypoints com <20px de distância vertical entre express lanes paralelas.  
**Detecção:** Edges com `<Array as="points">` cujos `mxPoint` têm y-values com diferença < 25px entre edges diferentes.  
**Correção:**
- Mínimo 30px de distância vertical entre express lanes paralelas
- Se >2 express lanes: considerar um "corredor de serviços" separado em vez de lanes sobrepostas
- Alternativa: eliminar express lanes quando possível, roteando por caminhos naturais entre containers

---

### P19 — Containers com altura uniforme ignorando conteúdo

**Sintoma:** Todos os containers de uma mesma fila têm a mesma height (ex: 440px) independentemente de quantos ícones contêm. Containers com 1 ícone ficam com >95% de espaço vazio.  
**Causa:** Geração automatizada que força mesmo height para manter alinhamento visual.  
**Detecção:** Para cada container, calcular `(area_icones / area_container)`. Se < 5% = oversized.  
**Correção:**
- Containers devem ter height proporcional ao conteúdo: `max_y_icone + 90px - min_y_container`
- Se container tem 1 ícone: max 180px de height
- Se 2 ícones na vertical: max 280px
- Se 4 ícones (grid 2x2): max 350px
- Alinhamento horizontal entre containers: alinhar pelo topo (y do container), não pelo bottom

---

### P21 — Nota flutuante dentro de container alheio (CRITICO)

**Sintoma:** Um "text note" (ex: "IAM Roles aplicados em todas as Lambdas") é posicionado DENTRO do bounding box de um container que não é o seu destinatário natural, criando conflito visual com os ícones daquele container.
**Causa:** Note criada sem considerar o bounding box dos containers próximos; coordenadas x/y caem dentro de um `grp_*` alheio.
**Detecção:** Para cada célula com `style` contendo `text;` (nota), verificar se o bounding box cai dentro de qualquer container `grp_*`/`swimlane`. Se cair em container alheio → CRITICO.
**Correção:**
- Mover a nota para FORA do container (x + 80px ou y - 30px)
- Se serve como "legenda expandida", realocar para dentro do box da legenda
- Alternativa: converter em callout estilizado (`fillColor=#FFF4CC;strokeColor=#E0A800;rounded=1`) ancorado na borda externa

---

### P22 — Edge labels em cinza-claro sem bold (ALTO)

**Sintoma:** Labels de arestas em cinza médio/claro (#888888, #999999, #CCCCCC) sem bold são ilegíveis em zoom 100%, especialmente quando o edge cruza outros elementos.
**Causa:** Estilo default de edge label sem `fontStyle=1` ou com `fontColor` cinza para "estilo discreto". Resultado: labels desaparecem visualmente.
**Detecção:** Edges com `fontColor=#[89aABC]` E sem `fontStyle=1` E valor não vazio.
**Correção AUTO:**
- `fontColor=#232F3E` (escuro para contraste com branco)
- `fontStyle=1` (bold)
- `labelBackgroundColor=#FFFFFF` (fundo branco sólido, não transparente)
- `fontSize=11` mínimo (badges menores ok em <40px width)

---

### P23 — Legenda truncada ou colada em outros elementos (MEDIO)

**Sintoma:** Caixa de legenda com texto cortado no lado direito, ou colada ao box de custo/info sem margem.
**Causa:** Largura da legenda insuficiente para o conteúdo real; ausência de margem horizontal entre legenda e boxes vizinhos.
**Detecção:**
- Se `leg_colors` ou `leg_edges` tem `width < 900` e conteúdo do value tem > 80 chars visíveis
- Se distância horizontal entre `cost_box` e primeiro elemento da legenda < 20px
**Correção:**
- Expandir legenda para width ≥ 1100px
- Organizar em 2 linhas (cores + estilos) ou 2 colunas
- Margem mínima de 24px entre cost_box e leg_bg
- Usar fontSize=12 uniforme (não 10)

---

### P24 — Headers de container sem peso visual (MEDIO)

**Sintoma:** Títulos dos containers ("Edge / CDN", "Compute", "F3 — IA / Async") ficam pequenos, discretos, com peso igual aos labels dos ícones internos. Leitor não sabe rapidamente onde termina um grupo e começa outro.
**Causa:** Style do container usa `fontSize=11;fontStyle=2` (itálico pequeno) — discreto demais.
**Detecção:** Container com `value` não vazio e `fontSize < 13` OU `fontStyle != 1`.
**Correção:**
- `fontSize=14` mínimo, `fontStyle=1` (bold)
- `spacingLeft=10;spacingTop=6` para padding do header
- Opcional: adicionar pill de fundo colorido (fillColor=<cor do container>20% opacity) no canto superior-esquerdo com o título dentro
- Alinhamento `align=left;verticalAlign=top`

---

### P25 — Express lanes e waypoints em canais não-espaçados (ALTO)

**Sintoma:** Duas ou mais arestas paralelas usam waypoints em y próximos (ex: y=155 e y=170), criando aparência de "linha grossa confusa". Ou arestas cruzando zonas que deveriam ser "corredores limpos".
**Causa:** Waypoints manuais escolhidos sem planejar canais horizontais/verticais reservados.
**Detecção:** Edges com `<Array as="points">` com y-values < 25px de distância entre edges diferentes.
**Correção — canais reservados:**
- **Canal TOP** (y=90-120): para express lanes de segurança/secrets (acima dos containers)
- **Canal MID-UP** (y=220): para edges de auth/session
- **Canal MID-LOW** (y=290): para edges de dados (Lambda→DB)
- **Canal BOTTOM** (y=560-580): para observabilidade (logs/traces)
- **Canal FOOTER** (y=870-880): para fluxos F3 de retorno
- Nunca colocar 2 edges paralelas com mesmo y — aplicar gap de 30px mínimo

---

### P26 — Cruzamento emaranhado em zona central (CRITICO)

**Sintoma:** Entre 2 containers (ex: Compute ↔ Data) há 4+ edges se cruzando no mesmo ponto, criando nó visual ilegível.
**Causa:** Colocação de targets sem considerar a angulação natural dos edges; múltiplos services num container se conectam ao mesmo service no outro container pelo midpoint.
**Detecção:** Para cada par (container_A, container_B), contar edges entre eles. Se > 3 edges e sem distribuição de exit/entry points, alarme.
**Correção:**
- Distribuir `exitX/exitY` no source (0.1, 0.3, 0.5, 0.7, 0.9)
- Distribuir `entryX/entryY` no target
- Considerar mover um target para coluna diferente
- Em último caso: criar "mini-container" intermediário que consolide os edges

---

### P27 — Bounding box overlap entre células text/legenda (CRITICO)

**Sintoma:** Duas células do tipo `text;` (legendas, notas, descrições) têm bounding boxes que se intersectam, fazendo o texto de uma sobrescrever o da outra. Visível como "letras embaralhadas" ou texto borrado no PNG. Real case: `leg_obs` (y=1226, h=20) e `leg_steps` (y=1226, h=22) ocupando exatamente o mesmo retângulo → "Numeraçãoduçãoanos..." ilegível.
**Causa:** Geração automatizada que usa o mesmo `y` para múltiplas legendas sem incrementar entre uma e outra; ou edição manual que duplicou um bloco.
**Detecção:**
- Listar todas as células com `style` contendo `text;` ou ids começando com `leg_`/`note_`/`cost_`/`subtitle`
- Para cada par, computar `bbox_overlap = (x_overlap > 0) and (y_overlap > 0)` onde `x_overlap = min(ax+aw, bx+bw) - max(ax, bx)` (e análogo para y)
- Se overlap > 5% da área de qualquer das duas → CRITICO
**Correção AUTO:**
- Empilhar verticalmente: ordenar pelo y, e a cada célula garantir `y[i] >= y[i-1] + h[i-1] + 6` (gap mínimo 6px)
- Expandir width do `leg_bg` ou container pai se as legendas extrapolarem horizontalmente após reorganização
- Se duas células contêm conteúdo equivalente (duplicata): manter a mais longa, deletar a outra
**Prevenção na geração:** ao adicionar nova legenda dentro de `leg_bg`, sempre calcular `next_y = max(y for cell in leg_bg.children) + h + 6`

---

### P28 — Badges sobrepondo o ícone que eles anotam (ALTO)

**Sintoma:** Pequenos badges de fase ou categoria (`fb_*`, `pill_*`, `tag_*`) — tipicamente 30x18 — colocados em `(icon.x + 42, icon.y - 5)` ficam sobrepondo o canto superior-direito do ícone AWS, escondendo parte do shape. O usuário relata "textos em cima de ícones".
**Causa:** Padrão herdado de UI mobile (badges sobre avatar) aplicado a diagramas técnicos onde o ícone PRECISA estar 100% visível para ser identificável.
**Detecção:**
- Para cada par (badge, icon) com nomes vinculados (ex: `fb_apigw` ↔ `apigw`): calcular bbox overlap
- Se overlap > 0 e badge é menor (área < 25% do ícone) → ALTO
**Correção RESTRUCTURE:**
- **Linha SUPERIOR do diagrama** (icon.y < 290, sem espaço acima por causa do header do container): badge à DIREITA do ícone — `(icon.x + icon.w + 4, icon.y + 2)`
- **Demais linhas**: badge ACIMA do ícone, alinhado ao canto direito — `(icon.x + icon.w - badge.w, icon.y - badge.h - 4)`
- Validar após mover: badge não deve cair dentro de outro container ou sobrepor outro ícone
**Prevenção na geração:** nunca posicionar badge com `x` no intervalo `[icon.x, icon.x + icon.w]` E `y` no intervalo `[icon.y, icon.y + icon.h]` ao mesmo tempo

---

### P29 — Express lanes paralelas no mesmo canal Y (CRITICO quando rotuladas)

**Sintoma:** Duas ou mais arestas com waypoints `<mxPoint y="A"/>` e `<mxPoint y="B"/>` com `|A - B| < 30` rodam paralelas tão próximas que parecem uma única linha grossa, e seus labels (renderizados no midpoint) se sobrepõem. Real case: `e12` (waypoints y=170, label "envia email") e `e13` (waypoints y=155, label "lê segredos") com gap 15px → labels colaram um no outro no topo do diagrama.
**Causa:** Sem reservar canais Y nomeados para edges express (lanes que correm acima/abaixo dos containers), cada edge cai em y arbitrário escolhido na hora de gerar.
**Detecção:**
- Para cada edge com `<Array as="points">`, extrair lista de y-values dos waypoints
- Para cada par de edges, se compartilham X-range (overlap horizontal) E gap mínimo de y < 30 → CRITICO se ambas têm `value` não vazio (labels colidem); ALTO se uma é sem label
**Correção RESTRUCTURE — CANAIS RESERVADOS (regra dura):**
- Definir canais Y fixos no diagrama, com gap ≥ 30px entre canais:
  - **TOP-1** y=125: segurança/secrets (cor vermelha tracejada)
  - **TOP-2** y=165: integrações async (SES, SNS) — fluxo principal
  - **MID-OBS-1** y=548: logs (CloudWatch)
  - **MID-OBS-2** y=583: traces (X-Ray)
  - **BOTTOM-RETURN** y=870: retornos do pipeline F3
- Cada nova edge express deve **reservar** um canal explicitamente; se já há 2 edges em um canal, criar canal +30px
- Nunca colocar 2 edges com mesmo y; se for inevitável (ex: 3+ services indo para o mesmo destino), agrupar visualmente em um único trunk e usar branches curtos no destino
**Prevenção na geração:** manter um dicionário `channel_y = {"top1": 125, "top2": 165, ...}` no gerador e exigir que toda edge express declare `channel="top1"` ou similar — nunca y mágico

---

### P20 — Typos e acentos ausentes em português

**Sintoma:** Labels em português sem acentos corretos: "le" em vez de "lê", "modulo" em vez de "módulo", "Producao" em vez de "Produção", "servicos" em vez de "serviços".  
**Causa:** Digitação rápida sem revisão, ou encoding issues com caracteres especiais.  
**Detecção:** Lista de palavras comuns em diagramas AWS: lê, módulo, produção, serviços, usuários, validação, segurança, notificação.  
**Correção:**
- Revisar todos os labels em português para acentuação correta
- Em valores XML, usar caracteres UTF-8 diretamente (não entities HTML) quando possível

---

## Script Python de correção automática

Execute este script para corrigir P1–P4 automaticamente:

```python
import re, os, sys

def fix_drawio(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fixes = []

    def fix_style(match):
        style = match.group(1)
        changed = False
        
        # P1: label abaixo do ícone AWS
        if 'mxgraph.aws4.resourceIcon' in style or 'mxgraph.aws4.user' in style:
            if 'verticalLabelPosition=bottom' not in style:
                style = re.sub(r';?verticalAlign=[^;]+', '', style)
                style = re.sub(r';?labelPosition=[^;]+', '', style)
                style = re.sub(r';?verticalLabelPosition=[^;]+', '', style)
                style = style.rstrip(';')
                style += ';labelPosition=center;verticalLabelPosition=bottom;verticalAlign=top'
                changed = True
                fixes.append('P1: label movido para abaixo do ícone')
        
        # P2: remove caixa branca sobre ícone
        if 'labelBackgroundColor=#ffffff' in style:
            style = style.replace(';labelBackgroundColor=#ffffff', '').replace('labelBackgroundColor=#ffffff;', '')
            changed = True
            fixes.append('P2: labelBackgroundColor removido')
        
        # P3: fonte mínima 11px
        if re.search(r'fontSize=([1-9]|10)\b', style):
            style = re.sub(r'fontSize=([1-9]|10)\b', 'fontSize=11', style)
            changed = True
            fixes.append('P3: fontSize aumentado para 11')
        
        # P4: opacidade de zonas reduzida
        if re.search(r'opacity=(5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\b', style):
            style = re.sub(r'opacity=\d+', 'opacity=35', style)
            changed = True
            fixes.append('P4: opacity de zona reduzido para 35')
        
        return f'style="{style}"'

    content = re.sub(r'style="([^"]*)"', fix_style, content)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✓ {os.path.basename(path)}: {len(set(fixes))} tipos de fix aplicados')
        for fix in sorted(set(fixes)):
            print(f'  → {fix}')
    else:
        print(f'✓ {os.path.basename(path)}: sem problemas detectados')

# Uso: python3 fix.py arquivo.drawio  OU  python3 fix.py pasta/
target = sys.argv[1] if len(sys.argv) > 1 else '.'
if os.path.isfile(target):
    fix_drawio(target)
elif os.path.isdir(target):
    for f in os.listdir(target):
        if f.endswith('.drawio'):
            fix_drawio(os.path.join(target, f))
```

---

## Checklist de qualidade para diagrama profissional

Após corrigir automaticamente, revise manualmente:

### Estrutura e Layout
- [ ] **Labels abaixo dos ícones** — texto nunca sobrepõe o ícone
- [ ] **Espaçamento mínimo 250px** entre nós na mesma coluna, 300px entre colunas
- [ ] **Containers** com bordas dashed, sem preenchimento pesado (estilo AWS oficial)
- [ ] **Hierarquia AWS** — Region > VPC > containers lógicos (não categorias genéricas)
- [ ] **Canvas proporcional** — conteúdo ocupa ≥70% do canvas, sem áreas vazias grandes
- [ ] **Fundo branco forçado** — `background=#FFFFFF` no `<mxGraphModel>` para garantir legibilidade em dark mode

### Edges e Fluxo
- [ ] **Max 4 edges por nó** — sem star pattern; agrupar semanticamente se necessário
- [ ] **Edges não cruzam containers** — setas nunca atravessam zonas que não contêm source/target
- [ ] **Arestas rotuladas** com ação curta (máx 2 palavras), vocabulário consistente
- [ ] **Labels de edges com offset** — em edges longos (>300px), label perto do source (posição 0.1-0.3)
- [ ] **Labels de arestas** com `labelBackgroundColor=#FFFFFF` para destaque visual
- [ ] **Sem arestas sobrepostas** — edges de mesmo source espaçados por exit/entry points
- [ ] **Setas tracejadas** para validação/monitoramento; sólidas para fluxo principal

### Visual e Legibilidade
- [ ] **Contraste adequado** — fillColor escuro → fontColor branco; fundo claro → fontColor escuro
- [ ] **Cores padronizadas** (laranja=Compute, verde=Storage, rosa=Mensageria, roxo=CDN, vermelho=Segurança)
- [ ] **Ícones AWS reais** para todos os serviços (`shape=mxgraph.aws4.resourceIcon`)
- [ ] **Sem prefixos redundantes** — "Authorizer" (não "Lambda Authorizer") quando ícone já é Lambda
- [ ] **Sem textos soltos** — toda informação de ação no label da aresta ou nó, nunca texto isolado

### Completude e Conectividade
- [ ] **Zero nós órfãos** — todo ícone AWS tem pelo menos 1 edge conectando ou nota explicativa
- [ ] **Containers proporcionais** — height ajustado ao conteúdo (1 ícone → max 180px, 4 ícones → max 350px)
- [ ] **Express lanes espaçadas** — mín 30px vertical entre lanes paralelas; max 2 express lanes
- [ ] **Acentos corretos** — "lê", "módulo", "produção", "serviços", "usuários", "validação"

### Contexto e Documentação
- [ ] **Título claro** no topo com fontSize ≥ 18 e fontStyle=1 (bold)
- [ ] **Legenda completa** — explica cores de nós, badges de fase, estilos de edge, cores de edge
- [ ] **Versão e data** — "v1.0 — 2026-04-18" no rodapé ou header

---

## Procedimento completo de execução

### Passo 1 — Identificar o arquivo

```
Se o usuário não especificou um arquivo:
  → Listar todos os .drawio em docs/architecture/
  → Perguntar qual revisar OU aplicar em todos
```

### Passo 2 — Executar correções automáticas (P1–P4, P10)

Usar o script Python acima. Reportar número de correções por arquivo.

### Passo 3 — Abrir o diagrama corrigido

Usar `mcp__drawio__open_drawio_xml` com o conteúdo do arquivo corrigido.

### Passo 4 — Análise P5–P16 (detectar, alertar, sugerir)

Após abrir, analisar o XML para:

**Detecção automática (alertar):**
- P5: ícones < 60px → listar com coordenadas
- P6: arestas sem label → listar IDs
- P7: nós sobrepostos → listar pares com y-diff < 250px na mesma coluna (x ±30px)
- P8: nó com >4 edges saindo → listar nó + contagem
- P11: star pattern → mesmo que P8, mas também verificar se targets estão em zonas diferentes
- P12: edges cruzando containers → listar edge ID + container cruzado
- P13: canvas oversized → calcular % de uso e sugerir resize
- P14: edge labels em zona errada → listar edge + zona onde label cai
- P15: cores/estilos não explicados na legenda → listar itens faltantes
- P16: prefixos redundantes → listar labels com nome do serviço duplicado
- P17: nós órfãos (sem edges) → listar nó ID + nome. Se >20% dos nós são órfãos = CRITICO
- P18: express lanes paralelas < 25px → listar edges com waypoints e gap real
- P19: containers com ratio ícone/area < 5% → listar container + % de uso
- P20: labels PT-BR sem acentos → listar labels com palavras sem acento

Apresentar resultado ao usuário no formato:
```
Problemas encontrados em [arquivo]:

  CRITICO:
  ⚠️ P11: Star pattern — nó "apigw" tem 7 edges saindo (max recomendado: 4)
  ⚠️ P12: Edge e8 cruza container "Compute F1" sem ter source/target dentro
  ⚠️ P14: Edge e8 label "POST /quiz" renderiza dentro de "Compute F1" (zona errada)

  ALTO:
  ⚠️ P7: Nós lauth(x=800,y=220) e lmod(x=800,y=440) estão a 220px — mín 250px
  ⚠️ P8: APIGW→4 Lambdas F1 com edges sobrepostos

  MEDIO:
  ⚠️ P15: Legenda não explica cores de edges (#DD344C, #01A88D, #3334B9)
  ⚠️ P16: "Lambda Authorizer" → sugerir "Authorizer"
```

### Passo 5 — Relatório final

```
Resumo da revisão:
  AUTO:
  ✅ P1 corrigido: N ícones com label reposicionado
  ✅ P2 corrigido: N labelBackgroundColor removidos
  ✅ P3 corrigido: N fontes aumentadas para 11px
  ✅ P4 corrigido: N opacidades reduzidas para 35
  ✅ P10 corrigido: N pares de contraste ajustados

  ALERTAS:
  ⚠️ CRITICO: N problemas (P11, P12, P14)
  ⚠️ ALTO: N problemas (P7, P8)
  ⚠️ MEDIO: N problemas (P6, P13, P15, P16)

  ✅ Checklist de qualidade: X/26 itens verificados
```

---

## Princípios do revisor

- **Não perguntar antes de corrigir P1–P4, P10** — são correções seguras e sempre corretas
- **Alertar P5–P9, P11–P16** — detectar e reportar com severidade (CRITICO/ALTO/MEDIO)
- **Nunca remover conteúdo** — apenas reposicionar e reformatar
- **Sempre reabrir** o diagrama após correções para validação visual
- **Sempre português brasileiro** em todos os outputs
- **Severidade guia prioridade** — CRITICO primeiro (P11, P12, P14), depois ALTO (P7, P8), depois MEDIO
