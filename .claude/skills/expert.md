# Skill: expert

Analise especializada do FFV Academy por perspectiva unica. Escolha o expert e o alvo.

## Invocacao

```
/expert <tipo> [alvo]
```

**Tipos disponiveis:**

| Tipo | Expert | Pergunta-chave |
|------|--------|---------------|
| `programador` | Engenheiro senior 15+ anos | "O que quebra quando isso crescer?" |
| `pedagogo` | PhD psicologia educacional | "O aluno realmente aprende com isso?" |
| `uiux` | Learning experience designer | "A apresentacao ajuda ou atrapalha?" |
| `produto` | Product strategist senior | "Isso faz sentido como produto?" |
| `gamificacao` | Behavioral designer (Octalysis) | "A gamificacao serve ao aprendizado?" |
| `seo` | SEO tecnico + content strategy PT-BR | "O conteudo e encontravel?" |
| `dados-infra` | Data architect + infra engineer | "A fundacao sustenta o que queremos?" |

**Exemplos:**
- `/expert programador ModuleLayout.tsx`
- `/expert programador all`
- `/expert pedagogo trail13`
- `/expert produto posicionamento`
- `/expert seo all`
- `/expert gamificacao engine.ts`
- `/expert uiux HomeClient.tsx`
- `/expert dados-infra deploy`

---

## Protocolo de Auditoria (todos os experts)

### Passo 1 — Coleta de dados
Leia os arquivos relevantes ao alvo. Cada expert foca no seu dominio:

- **Programador:** codigo, tipagem, acoplamento, performance, re-renders, divida tecnica
- **Pedagogo:** objetivos Bloom, progressao, scaffolding, quiz quality, curriculo macro
- **UI/UX:** hierarquia visual, navegacao, responsividade, consistencia design system
- **Produto:** proposta de valor, posicionamento, funil, segmentacao, competidores
- **Gamificacao:** progressao/recompensa, motivacao intrinseca vs extrinseca, loops, anti-patterns
- **SEO:** keywords, headings/snippets, internal linking, dados estruturados, Core Web Vitals
- **Dados/Infra:** modelo de dados, localStorage schema, caminho para persistencia, deploy, analytics

### Passo 2 — Analise por 5 dimensoes (nota 1-5)

Cada expert tem 5 dimensoes especificas do seu dominio. Use a rubrica abaixo:

#### Programador
1. **Qualidade/DX** — tipagem, naming, separacao de responsabilidades
2. **Performance** — re-renders, dados inline, code splitting, bundle
3. **Divida tecnica** — mapas hardcoded, logica duplicada, valores magicos
4. **Testabilidade** — funcoes puras, validacao de schema, race conditions
5. **Escalabilidade** — caminho para auth/API, abstracoes de dados, deploy

#### Pedagogo
1. **Densidade** — profundidade real vs superficie (linhas, internals, codigo)
2. **Progressao** — calibracao de dificuldade dentro da trilha
3. **Scaffolding** — carga cognitiva, analogias, apoios visuais
4. **Quiz** — distratores realistas, recall vs reconhecimento, explanations
5. **Aplicabilidade** — decisao pratica, quando usar X vs Y, cenarios reais

#### UI/UX
1. **Hierarquia visual** — escaneabilidade, contraste, espacamento
2. **Navegacao** — wayfinding, breadcrumbs, estado de progresso visivel
3. **Interacao** — feedback tatico, microinteracoes, estados de loading
4. **Responsividade** — mobile-first, breakpoints, touch targets
5. **Consistencia** — design system, patterns reutilizados, desvios

#### Produto
1. **Proposta de valor** — clareza do job-to-be-done, diferencial real
2. **Funil** — first-visit → leitor ativo → recorrente, ativacao
3. **Segmentacao** — personas claras, conteudo alinhado com audiencia
4. **Sustentabilidade** — caminhos de monetizacao sem trair "100% gratuito"
5. **Competitividade** — posicionamento vs alternativas no mercado PT-BR

#### Gamificacao
1. **Progressao** — curva de XP, niveis, sensacao de avancar
2. **Motivacao intrinseca** — autonomia, maestria, proposito (SDT)
3. **Loops de retencao** — streak, SRS, habito, re-engajamento
4. **Feedback** — celebracao, badges, momentos de recompensa
5. **Anti-patterns** — overjustification, grind vazio, dopamina sem aprendizado

#### SEO
1. **Keyword targeting** — title tags, meta descriptions, H1/H2
2. **Internal linking** — cross-referencia entre artigos, trilhas, hubs
3. **Dados estruturados** — schema.org, breadcrumbs, FAQ
4. **Core Web Vitals** — LCP, CLS, FID/INP
5. **Content strategy** — topical authority, content gaps, cannibalizacao

#### Dados/Infra
1. **Modelo de dados** — GameState schema, integridade, migracao
2. **Persistencia** — localStorage limits, caminho para backend
3. **Deploy** — automatizacao, rollback, zero-downtime
4. **Analytics** — o que e medido, lacunas de instrumentacao
5. **Resiliencia** — corrupcao de dados, multiplas tabs, recovery

### Passo 3 — Diagnostico

1. **Nota composta** (media ponderada com pesos 1.0–2.0 por relevancia da dimensao)
2. **Classificacao:** >= 4.5 Excelente · 3.5–4.4 Bom · 2.5–3.4 Adequado · < 2.5 Critico
3. **Top 3 riscos** — ordenados por severidade, com evidencia (arquivo, linha, funcao)
4. **Top 3 pontos fortes** — o que funciona e deve ser mantido
5. **Recomendacoes concretas** — acao especifica, nao generica:
   - ❌ "Melhorar a tipagem"
   - ✅ "Extrair `hrefByTrailId` para funcao `getTrailHref()` em curriculum.ts"

### Passo 4 — Para alvos `all` ou `trail`

Adicionar: ranking comparativo, hotspots de complexidade, roadmap de 5 acoes priorizadas (impacto/esforco).

## Formato de saida

```
## [emoji] Auditoria [tipo]: [alvo]

**Contexto:** [1 linha]

| Dimensao | Nota | Justificativa |
|----------|------|---------------|
| ... | X/5 | ... |

**Nota composta: X.X/5 — [Classificacao]**

### Riscos
1. ...

### Pontos fortes
1. ...

### Recomendacoes
1. ...
```

## Principios

- **Honestidade brutal** — nota 2/5 e nota 2/5
- **Evidencia > opiniao** — cite linhas, funcoes, trechos
- **Pragmatismo** — refactor minimo que desbloqueia maximo valor
- **Zero over-engineering** — sugira o que faz sentido AGORA
- **Cada expert fala APENAS do seu dominio** — programador nao opina sobre pedagogia
- **Portugues brasileiro**
