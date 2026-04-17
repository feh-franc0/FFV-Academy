# Skill: audit-pedagogico

Auditoria pedagógica profissional do conteúdo FFV Academy. Combina a perspectiva de um **professor de programação sênior** com a de um **psicólogo especialista em educação digital e ciência da aprendizagem**.

## Invocação

```
/audit-pedagogico [alvo]
```

**Alvos possíveis:**
- `/audit-pedagogico serializacao-endianness` — audita um artigo específico
- `/audit-pedagogico trail15` — audita uma trilha completa (todos os artigos)
- `/audit-pedagogico all` — auditoria panorâmica de todas as trilhas (resumo executivo)

## Processo de Auditoria

### Passo 1 — Coleta de dados
Para cada artigo auditado, leia o arquivo `page.tsx` completo e extraia:
- Número de linhas totais e linhas de conteúdo real (excluindo imports, metadata, boilerplate JSX)
- Quantidade de `Section`, `CodeBlock`, `ComparisonTable`, `DecisionBox`, `Callout`, `ArchDiagram`
- Número de perguntas do quiz e qualidade das opções
- Presença de nextSlug/nextTitle (costura)
- Presença de briefing introdutório

### Passo 2 — Análise por 7 dimensões (nota 1-5)

Avalie cada dimensão com nota de 1 a 5 e justificativa curta:

#### D1. Densidade de conteúdo (Professor)
- 1: < 150 linhas, superficial, "o que é X" sem profundidade
- 3: 250-350 linhas, cobre conceitos mas sem internals
- 5: 400+ linhas, explica "como funciona por dentro" com código real, diagramas, trade-offs

#### D2. Progressão didática dentro da trilha (Psicólogo educacional)
- O artigo assume conhecimento que deveria ter sido coberto antes na trilha?
- O artigo prepara o leitor para o próximo artigo?
- A dificuldade cresce gradualmente ou há saltos abruptos?
- 1: salto brutal sem preparação
- 3: progressão razoável com lacunas pontuais
- 5: escada perfeitamente calibrada — cada conceito novo se apoia no anterior

#### D3. Carga cognitiva e scaffolding (Psicólogo educacional)
- Conceitos abstratos são ancorados em exemplos concretos?
- Há comparações, tabelas, analogias que reduzem carga cognitiva?
- O artigo usa "desirable difficulty" (desafio produtivo) ou "undesirable difficulty" (confusão)?
- 1: parede de texto sem apoio visual ou conceitual
- 3: alguns apoios mas inconsistentes
- 5: cada conceito novo tem andaime (diagrama, exemplo, comparação) antes de avançar

#### D4. Qualidade do quiz — recall ativo (Psicólogo educacional)
- Opções erradas são verossímeis (um iniciante genuinamente pensaria isso)?
- A pergunta exige reconstrução do conhecimento (recall) ou apenas reconhecimento?
- A explicação da resposta correta ensina algo NOVO além da resposta?
- 1: opções absurdas, reconhecimento trivial
- 3: opções razoáveis mas pergunta superficial
- 5: distratores realistas, recall profundo, explicação que expande

#### D5. Profundidade técnica — "como funciona por dentro" (Professor)
- Explica o mecanismo interno ou apenas a API/uso?
- Mostra código real executável ou pseudocódigo vago?
- Cita números reais (latência, tamanho, throughput)?
- 1: "use a função X" sem explicar o que acontece
- 3: explica conceito mas sem código/números reais
- 5: internals detalhados com código real, números de benchmark, trade-offs medidos

#### D6. Costura e contexto curricular (Professor)
- O briefing conecta com o artigo anterior?
- O Callout final indica claramente o próximo passo e por quê?
- Conceitos de outras trilhas são referenciados quando relevantes?
- 1: artigo isolado, sem conexão com o currículo
- 3: tem nextSlug mas sem justificativa do porquê
- 5: briefing contextualiza na jornada, callout final motiva o próximo passo com razão clara

#### D7. Aplicabilidade profissional (Professor)
- O conteúdo é útil no dia a dia de um desenvolvedor?
- Ensina decisão (quando usar X vs Y) ou apenas descrição?
- Tem "Callout success" com take-aways acionáveis?
- 1: teoria pura sem aplicação
- 3: exemplos mas sem decisão prática
- 5: decision boxes, comparações de quando usar cada opção, cenários reais

### Passo 3 — Diagnóstico pedagógico

Após as 7 notas, produza:

1. **Nota composta** (média ponderada):
   - D1 (Densidade): peso 1.5
   - D2 (Progressão): peso 2.0
   - D3 (Scaffolding): peso 2.0
   - D4 (Quiz): peso 1.5
   - D5 (Profundidade): peso 1.5
   - D6 (Costura): peso 1.0
   - D7 (Aplicabilidade): peso 1.5

2. **Classificação**:
   - ≥ 4.5: **Excelente** — pronto para publicação profissional
   - 3.5–4.4: **Bom** — melhorias pontuais recomendadas
   - 2.5–3.4: **Adequado** — precisa de revisão significativa
   - < 2.5: **Insuficiente** — reescrita necessária

3. **Top 3 problemas** — os 3 pontos mais críticos que reduzem a qualidade pedagógica, ordenados por impacto

4. **Top 3 pontos fortes** — o que está funcionando bem e deve ser mantido como padrão

5. **Recomendações concretas** — para cada problema, uma ação específica (não genérica):
   - ❌ "Melhorar a profundidade" (vago)
   - ✅ "Adicionar Section sobre como o struct.pack monta bytes em memória, com visualização hex passo a passo" (acionável)

### Passo 4 — Para auditorias de trilha completa (trail)

Adicione análise de coerência da trilha:

1. **Gráfico de dificuldade**: lista os artigos em ordem com a nota D5 (profundidade) — a curva deve ser crescente ou em platôs, nunca decrescente
2. **Lacunas de pré-requisito**: conceitos usados em artigos posteriores que não foram cobertos em artigos anteriores
3. **Redundâncias**: conceitos repetidos em múltiplos artigos sem necessidade
4. **Artigo mais fraco e mais forte**: com justificativa para priorização de revisão

### Passo 5 — Para auditoria panorâmica (all)

Resumo executivo com:
1. Ranking das 16 trilhas por nota composta média
2. Top 5 artigos mais fortes do currículo inteiro (referência de qualidade)
3. Top 5 artigos mais fracos (prioridade de revisão)
4. Análise de cobertura: conceitos fundamentais que faltam no currículo
5. Progressão inter-trilhas: as trilhas "fundacionais" realmente preparam para as "avançadas"?

## Formato de saída

### Para artigo individual:
```
## 🔍 Auditoria Pedagógica: [título do artigo]

**Trilha:** [nome] | **Posição:** [N de M] | **Linhas:** [total] | **Componentes:** [lista]

| Dimensão | Nota | Justificativa |
|----------|------|---------------|
| D1. Densidade | X/5 | ... |
| D2. Progressão | X/5 | ... |
| D3. Scaffolding | X/5 | ... |
| D4. Quiz | X/5 | ... |
| D5. Profundidade | X/5 | ... |
| D6. Costura | X/5 | ... |
| D7. Aplicabilidade | X/5 | ... |

**Nota composta: X.X/5 — [Classificação]**

### Pontos fortes
1. ...
2. ...
3. ...

### Problemas críticos
1. ...
2. ...
3. ...

### Recomendações
1. ...
2. ...
3. ...
```

## Princípios da auditoria

- **Honestidade brutal** — a nota serve para melhorar, não para validar. Se um artigo é 2/5, diga 2/5.
- **Perspectiva do leitor iniciante** — avalie como alguém que está aprendendo pela primeira vez, não como alguém que já sabe o assunto.
- **Evidência, não opinião** — cite linhas específicas do artigo para justificar cada nota.
- **Calibração** — use como referência os artigos das Trilhas 9-11 (Observabilidade, Distribuídos, AI-Native) que são os mais densos e profissionais do currículo. Nota 5 = nível desses artigos.
- **Zero condescendência** — não diga "está bom para um início". Diga o que falta para estar profissional.
- **Português brasileiro** — toda a análise em PT-BR.
