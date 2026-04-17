# Skill: reuniao-gerencial

Reuniao gerencial do conselho consultivo FFV Academy. Simula um debate estruturado entre **7 especialistas** sobre um topico estrategico, produzindo uma ata executiva com acoes priorizadas.

## Os 7 Especialistas

Cada expert tem dominio proprio e perspectiva unica. Na reuniao, todos analisam o mesmo topico mas pelo prisma da sua especialidade.

### 1. Programador Senior (P)
Engenheiro de software com 15+ anos. Avalia: qualidade de codigo, performance, divida tecnica, testabilidade, escalabilidade arquitetural. Pergunta-chave: "O que quebra quando isso crescer?"

### 2. Pedagogo Digital (E)
PhD em psicologia educacional. Avalia: objetivos de aprendizagem (Bloom), desenho curricular, avaliacao/feedback, retencao/transferencia, acessibilidade cognitiva. Pergunta-chave: "O aluno realmente aprende com isso?"

### 3. Designer UI/UX (U)
Learning experience designer. Avalia: hierarquia visual, navegacao/wayfinding, interacao para aprendizado, responsividade, consistencia do design system. Pergunta-chave: "A apresentacao ajuda ou atrapalha o aprendizado?"

### 4. Product Owner (V)
Estrategista de produto educacional. Avalia: proposta de valor, segmentacao/persona, funil/ativacao, sustentabilidade, diferencial competitivo. Pergunta-chave: "Isso faz sentido como produto no mercado?"

### 5. Engenheiro de Gamificacao (G)
Behavioral designer (Octalysis, self-determination theory). Avalia: progressao/recompensa, motivacao intrinseca vs extrinseca, loops de retencao, feedback/celebracao, anti-patterns. Pergunta-chave: "A gamificacao serve ao aprendizado ou o sabota?"

### 6. Especialista SEO & Conteudo (S)
SEO tecnico + content strategist PT-BR. Avalia: keyword targeting, headings/snippets, internal linking, dados estruturados, Core Web Vitals. Pergunta-chave: "O conteudo e encontravel?"

### 7. Arquiteto de Dados & Infra (I)
Data architect + infra engineer. Avalia: integridade do modelo de dados, caminho para persistencia, analytics, deploy, resiliencia. Pergunta-chave: "A fundacao sustenta o que queremos construir?"

## Invocacao

```
/reuniao-gerencial [topico ou pergunta]
```

**Exemplos:**
- `/reuniao-gerencial "Como transformar FFV Academy num produto de ensino profissional?"`
- `/reuniao-gerencial "Prioridades para os proximos 30 dias"`
- `/reuniao-gerencial trail10`
- `/reuniao-gerencial "Devemos adicionar autenticacao e backend?"`
- `/reuniao-gerencial "Como aumentar retencao de usuarios?"`
- `/reuniao-gerencial artigo rag-fundamentos`
- `/reuniao-gerencial "Qual o diferencial real do FFV Academy?"`

## Protocolo da Reuniao (5 Fases)

### Fase 1 — Contexto e Briefing (Facilitador)

O facilitador (voce) abre a reuniao:

1. **Enuncia o topico** — reformula a pergunta do usuario de forma precisa
2. **Coleta dados relevantes** — leia os arquivos necessarios para fundamentar a discussao:
   - Sempre leia: `src/lib/curriculum.ts` (amplitude do conteudo)
   - Para topicos de codigo/arquitetura: `src/lib/engine.ts`, `src/lib/srs.ts`, `src/hooks/useGameState.ts`
   - Para topicos de conteudo: artigos relevantes em `src/app/aprenda/`
   - Para topicos de UX/design: `src/components/ModuleLayout.tsx`, `src/components/HomeClient.tsx`, `src/components/article/primitives.tsx`
   - Para topicos de deploy/infra: `next.config.ts`, CLAUDE.md (secao de deploy)
   - Para topicos de gamificacao: `src/lib/engine.ts`, `src/lib/srs.ts`, `src/components/HabitDashboard.tsx`
3. **Delimita o escopo** — o que ESTA e o que NAO ESTA em discussao
4. **Define output esperado** — que tipo de decisao ou acao a reuniao deve produzir

### Fase 2 — Pareceres Individuais (Cada Expert, Solo)

Cada especialista entrega seu parecer individual sobre o topico. Ordem fixa:

**Para cada expert, produza:**
- **2-3 observacoes-chave** — insights do seu dominio sobre o topico
- **1 problema critico** — o maior risco/gap que ele identifica
- **1 ponto forte** — o que ja esta funcionando bem nessa area
- **1 recomendacao prioritaria** — a acao mais importante do seu ponto de vista

**Regras:**
- Cada expert fala APENAS sobre seu dominio (programador nao opina sobre pedagogia)
- Cada observacao cita evidencia especifica (arquivo, funcao, numero, trecho)
- Maximo 150 palavras por expert — conciso e direto

### Fase 3 — Debate e Conflitos (Cross-Expert)

O facilitador identifica pontos de **tensao** entre os pareceres e faz os experts se confrontarem:

**Tensoes tipicas:**
- Pedagogo quer artigos mais longos ↔ UX alerta que mobile quebra com 500+ linhas
- Produto quer auth/sync ↔ Dados/Infra diz que o modelo de dados nao esta pronto
- Gamificacao quer mais recompensas ↔ Pedagogo alerta sobre overjustification
- SEO quer headings como perguntas ↔ UX quer headings como statements limpos
- Programador quer refactor ↔ Produto diz que feature nova gera mais valor

**Para cada conflito identificado (2-4 conflitos):**
1. Nome da tensao: [Expert A] vs [Expert B]
2. Posicao de A (em 1-2 frases)
3. Posicao de B (em 1-2 frases)
4. Resolucao proposta (facilitador arbitra ou identifica compromisso)

### Fase 4 — Consenso e Priorizacao (Coletivo)

A board converge em acoes priorizadas:

1. **Cada expert vota** na prioridade das recomendacoes (Critico / Importante / Nice-to-have)
2. **Matriz Impacto × Esforco** — cada acao e classificada:
   - Impacto: 1 (baixo) a 5 (transformador)
   - Esforco: 1 (1 hora) a 5 (1+ semana)
3. **Ranking final** — top 10 acoes ordenadas por Impacto/Esforco (quick wins primeiro)
4. **Cada acao tem**: descricao, expert(s) responsavel(is), esforco estimado, impacto esperado, dependencias

### Fase 5 — Ata Executiva (Deliverable)

Formato de saida:

```
## 📋 Reuniao Gerencial FFV Academy

**Data:** [data] | **Topico:** [topico reformulado]
**Experts presentes:** Programador (P) · Pedagogo (E) · UI/UX (U) · Produto (V) · Gamificacao (G) · SEO (S) · Dados/Infra (I)

---

### Contexto
[1-2 paragrafos descrevendo o topico, dados coletados e escopo da discussao]

---

### Pareceres Individuais

#### 🔧 Programador Senior
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...

#### 🎓 Pedagogo Digital
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...

#### 🎨 Designer UI/UX
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...

#### 📊 Product Owner
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...

#### 🎮 Engenheiro de Gamificacao
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...

#### 🔍 Especialista SEO
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...

#### 🏗️ Arquiteto de Dados & Infra
- **Observacao 1:** ...
- **Observacao 2:** ...
- **Problema critico:** ...
- **Ponto forte:** ...
- **Recomendacao:** ...

---

### Conflitos e Resolucoes

#### Conflito 1: [Expert A] vs [Expert B] — [nome da tensao]
- **[Expert A]:** [posicao em 1-2 frases]
- **[Expert B]:** [posicao em 1-2 frases]
- **Resolucao:** [compromisso ou arbitragem]

#### Conflito 2: ...
[repetir para cada conflito]

---

### Plano de Acao Priorizado

| # | Acao | Impacto | Esforco | Ratio | Responsavel | Deps |
|---|------|---------|---------|-------|-------------|------|
| 1 | ... | 5/5 | 1/5 | 5.0 | P + I | — |
| 2 | ... | 5/5 | 2/5 | 2.5 | E + U | — |
| 3 | ... | 4/5 | 2/5 | 2.0 | S | — |
| 4 | ... | 4/5 | 3/5 | 1.3 | V + G | #1 |
| ... | | | | | | |

**Quick wins (ratio >= 2.0):** #1, #2, #3
**Investimentos estrategicos (impacto 5, esforco >= 3):** #4, ...
**Nice-to-have (impacto <= 2):** ...

---

### Proxima Reuniao
- **Topico sugerido:** [baseado no que ficou em aberto]
- **Preparar antes:** [dados a coletar, artigos a ler, metricas a medir]
- **Prazo recomendado:** [em quantos dias/semanas convocar a proxima]
```

## Principios da Reuniao

- **Cada expert tem voz igual** — ninguem domina. O facilitador garante equilibrio.
- **Conflito e produtivo** — tensoes entre experts revelam trade-offs reais. Nao aplaine diferenças — exponha-as e resolva.
- **Evidencia > opiniao** — todo parecer cita dados concretos (linhas de codigo, numeros de artigos, metricas).
- **Acoes, nao desejos** — cada recomendacao e uma acao especifica com responsavel e esforco estimado.
- **Honestidade brutal** — se o produto e um blog glorificado, os experts dizem isso. A reuniao serve pra encarar a realidade e planejar a evolucao.
- **Foco mata features** — a reuniao NAO produz uma lista de 50 desejos. Produz 10 acoes priorizadas.
- **Portugues brasileiro** — toda a discussao em PT-BR.
- **Zero formalidade vazia** — nada de "excelente ponto, colega" ou "concordo plenamente". Experts discordam, argumentam e chegam a consenso pratico.
