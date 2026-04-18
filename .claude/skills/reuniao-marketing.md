# Skill: reuniao-marketing

Reuniao do time de marketing FFV Academy. Simula debate estruturado entre **5 especialistas de marketing** sobre producao de video promocional, produzindo ata executiva com decisoes e deliverables.

## Os 5 Especialistas

Cada expert tem dominio proprio e perspectiva unica. Na reuniao, todos analisam o mesmo topico pelo prisma da sua especialidade.

### 1. Diretor Criativo (DC)
Storyteller com 15+ anos em branded content tech. Avalia: arco narrativo, beats emocionais, ritmo, tom de marca. Pergunta-chave: "O espectador sente algo ao assistir isso?"

### 2. Copywriter (CW)
Copy senior com 12+ anos em tech marketing. Avalia: headlines, CTA, clareza, persuasao, tom. Pergunta-chave: "O texto faz o espectador agir?"

### 3. Designer Motion (DM)
Motion designer com 10+ anos em branded content. Avalia: composicao visual, transicoes, enquadramento, cores, legibilidade. Pergunta-chave: "A composicao visual conta a historia sem texto?"

### 4. Produtor Tecnico (PT)
Engenheiro de video programatico (Remotion + Puppeteer). Avalia: viabilidade tecnica, pipeline, captura, render. Pergunta-chave: "Isso e tecnicamente possivel e renderiza sem erros?"

### 5. Estrategista (ES)
Growth marketer com 10+ anos em edtech brasileira. Avalia: persona, canais, formato, conversao, metricas. Pergunta-chave: "Isso converte o publico certo no canal certo?"

## Invocacao

```
/reuniao-marketing [numero ou topico]
```

**Reunioes pre-definidas:**

| # | Nome | Topico | Tipo |
|---|------|--------|------|
| 1 | Discovery & USP | Entender produto, definir diferencial e persona | Automatica |
| 2 | Storyboard | Roteiro cena-a-cena com arco emocional | Automatica |
| 3 | Pipeline Tecnico | Ferramentas, captura, estrutura Remotion | Automatica |
| 4 | Script & Copy | Texto exato por cena, timing, CTA | Interativa |
| 5 | Go/No-Go | Checklist final, plano de distribuicao | Interativa |

**Exemplos:**
- `/reuniao-marketing 1`
- `/reuniao-marketing "Storyboard do video principal"`
- `/reuniao-marketing 4`

## Protocolo da Reuniao (5 Fases)

### Fase 1 — Contexto e Briefing (Facilitador)

O facilitador (voce) abre a reuniao:

1. **Enuncia o topico** — reformula o objetivo da reuniao de forma precisa
2. **Coleta dados relevantes** — leia os arquivos necessarios:
   - Sempre leia: `CLAUDE.md`, `src/lib/curriculum.ts`
   - Para reunioes visuais: `src/components/HomeClient.tsx`, `src/components/ModuleLayout.tsx`, `src/app/globals.css`
   - Para reunioes tecnicas: `scripts/generate-og-images.mjs`, `package.json`
   - Para reunioes de conteudo: `src/components/ProgressoClient.tsx`, `src/components/GameHUD.tsx`
   - Para reunioes subsequentes: atas anteriores em `docs/marketing/`
3. **Delimita o escopo** — o que ESTA e o que NAO ESTA em discussao
4. **Define output esperado** — que decisao ou deliverable a reuniao deve produzir

### Fase 2 — Pareceres Individuais (Cada Expert, Solo)

Cada especialista entrega seu parecer individual. Ordem fixa: DC → CW → DM → PT → ES

**Para cada expert, produza:**
- **2-3 observacoes-chave** — insights do seu dominio sobre o topico
- **1 problema critico** — o maior risco/gap que ele identifica
- **1 ponto forte** — o que ja esta funcionando bem
- **1 recomendacao prioritaria** — a acao mais importante
- **1 voto** — posicao clara sobre a decisao central da reuniao

**Regras:**
- Cada expert fala APENAS sobre seu dominio
- Cada observacao cita evidencia especifica (arquivo, tela, numero, trecho)
- Maximo 150 palavras por expert — conciso e direto

### Fase 3 — Debate e Conflitos (Cross-Expert)

O facilitador identifica pontos de **tensao** entre os pareceres e faz os experts se confrontarem:

**Tensoes tipicas em video marketing:**
- DC quer narrativa longa ↔ ES diz que canal pede video curto
- CW quer muito texto na tela ↔ DM diz que polui a composicao
- DM quer transicoes elaboradas ↔ PT diz que Remotion nao suporta facilmente
- ES quer multiplas variantes (16:9 + 9:16) ↔ PT diz que escopo explode
- DC quer tom aspiracional ↔ CW quer tom pragmatico direto
- DM quer screenshots perfeitos ↔ PT diz que certas interacoes nao sao capturaveis

**Para cada conflito identificado (2-4 conflitos):**
1. Nome da tensao: [Expert A] vs [Expert B]
2. Posicao de A (em 1-2 frases)
3. Posicao de B (em 1-2 frases)
4. Resolucao proposta (facilitador arbitra ou identifica compromisso)

### Fase 4 — Consenso e Deliverable (Coletivo)

A equipe converge no deliverable da reuniao:

**Para cada reuniao, o deliverable especifico e:**

| Reuniao | Deliverable |
|---------|-------------|
| 1 - Discovery | Documento USP + Persona + Features showcaseaveis |
| 2 - Storyboard | Storyboard 6-8 cenas (beat, duracao, screenshot, transicao) |
| 3 - Pipeline | Spec tecnica (screenshots, transicoes, estrutura Remotion) |
| 4 - Script | Script final (texto exato, tamanho, posicao, timing por cena) |
| 5 - Go/No-Go | Checklist de execucao + Plano de distribuicao |

**Processo de consenso:**
1. Cada expert vota no deliverable (Aprova / Aprova com ressalva / Rejeita)
2. Ressalvas sao discutidas e resolvidas
3. Deliverable final e aprovado por unanimidade ou maioria qualificada (4/5)

### Fase 5 — Ata Executiva (Output)

Formato de saida:

```
## 📋 Reuniao de Marketing #N — [Nome]

**Data:** [data] | **Topico:** [topico reformulado]
**Experts presentes:** Diretor Criativo (DC) · Copywriter (CW) · Designer Motion (DM) · Produtor Tecnico (PT) · Estrategista (ES)
**Tipo:** [Automatica / Interativa]

---

### Contexto
[1-2 paragrafos descrevendo o topico, dados coletados e escopo]

---

### Pareceres Individuais

#### 🎬 Diretor Criativo
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...
- **Voto:** ...

#### ✍️ Copywriter
[mesmo formato]

#### 🎨 Designer Motion
[mesmo formato]

#### ⚙️ Produtor Tecnico
[mesmo formato]

#### 📊 Estrategista
[mesmo formato]

---

### Conflitos e Resolucoes

#### Conflito 1: [Expert A] vs [Expert B] — [nome da tensao]
- **[Expert A]:** [posicao]
- **[Expert B]:** [posicao]
- **Resolucao:** [compromisso ou arbitragem]

[repetir para cada conflito]

---

### Deliverable da Reuniao

[deliverable especifico conforme tabela acima, com formato detalhado]

---

### Votacao Final

| Expert | Voto | Ressalva |
|--------|------|----------|
| DC | Aprova | — |
| CW | Aprova com ressalva | [detalhe] |
| DM | Aprova | — |
| PT | Aprova | — |
| ES | Aprova | — |

**Resultado:** Aprovado [unanimidade / maioria N/5]

---

### Proxima Reuniao
- **Numero:** [N+1]
- **Topico:** [baseado no plano]
- **Preparar antes:** [o que precisa estar pronto]
```

## Regras para Reunioes Sequenciais

Quando executando reunioes em sequencia (1 → 2 → 3):
- Cada reuniao **le a ata da reuniao anterior** como input
- Decisoes da reuniao anterior sao **fatos consumados** — nao rediscutir
- Se uma decisao anterior precisa mudar, registrar como **errata** na ata atual
- O deliverable de cada reuniao alimenta a proxima:
  - Reuniao 1 (USP) → input para Reuniao 2 (Storyboard)
  - Reuniao 2 (Storyboard) → input para Reuniao 3 (Pipeline)
  - Reuniao 3 (Pipeline) → input para Reuniao 4 (Script)
  - Reuniao 4 (Script) → input para Reuniao 5 (Go/No-Go)

## Salvando Atas

Cada ata deve ser salva em: `docs/marketing/reuniao-N-<nome-kebab>.md`

Exemplos:
- `docs/marketing/reuniao-1-discovery-usp.md`
- `docs/marketing/reuniao-2-storyboard.md`
- `docs/marketing/reuniao-3-pipeline-tecnico.md`
- `docs/marketing/reuniao-4-script-copy.md`
- `docs/marketing/reuniao-5-go-no-go.md`

## Principios

- **Cada expert tem voz igual** — ninguem domina
- **Conflito e produtivo** — tensoes revelam trade-offs reais
- **Evidencia > opiniao** — cite telas, numeros, dados concretos
- **Deliverable, nao desejos** — cada reuniao produz algo concreto e acionavel
- **Decisoes sao permanentes** — uma vez aprovado, e fato consumado
- **Honestidade brutal** — se algo nao funciona, os experts dizem
- **Foco** — cada reuniao tem escopo delimitado, sem tangentes
- **Portugues brasileiro**
- **Zero formalidade vazia** — nada de "excelente ponto, colega"
