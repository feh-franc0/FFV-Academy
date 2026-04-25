# MASTER 01 — Análise Crítica Profunda

> Análise honesta e dura de tudo proposto até aqui. Inclui o que provavelmente vai dar errado, o que está sendo subestimado, build vs buy, e as premissas que precisam ser validadas **antes** de gastar R$ 1.

---

## 1. Resumo brutalmente honesto

Os documentos anteriores descrevem um produto **viável e bem desenhado**, mas com viés de otimismo típico de proposta inicial. Os pontos mais frágeis:

1. **Assume que existe documentação interna pronta para indexar.** Em 90% das empresas isso é falso. Sem doc, RAG não funciona, e o projeto trava na v3.
2. **Subestima esforço organizacional.** Trata como se fosse projeto técnico, mas o sucesso depende de 50% técnico + 50% gestão de mudança.
3. **Não compara com soluções prontas.** Pode estar reinventando uma roda que custa US$ 30/usuário/mês comprada vs. R$ 80k de dev pra construir.
4. **Ignora LGPD.** No Brasil isso não é detalhe — é obrigação legal com multa de até 2% do faturamento.
5. **Bus factor 1.** Um dev sênior, sem backup, sem on-call, sem rotação de conhecimento. Se ele sai, projeto para.
6. **"Modo shadow" é mais difícil de operar do que parece.** Quem revisa 200 sugestões/semana?
7. **ROI calculado é arredondado pra cima.** Os 20 min/dia economizados precisam de validação empírica, não de afirmação.

Nada disso é fatal. Mas todos precisam de resposta antes de assinar embaixo.

---

## 2. Análise crítica ponto a ponto

### 2.1 O que foi prometido vs. o que aguenta um interrogatório

| Promessa nos docs | Aguenta interrogatório? | Por quê |
|---|---|---|
| "MVP em 6 semanas" | ❌ Não. | Só se a documentação estiver pronta, infra AWS já liberada, JWT do sistema atual exposto, e dev 100% dedicado. Realista: **8–12 semanas**. |
| "Custo de US$ 1.000–1.500/mês" | ⚠️ Parcial. | Esquece custos hidden: domínio, certificado, monitoramento Datadog/Sentry se quiser real, NAT Gateway pra Lambda em VPC (~US$ 35/mês cada), backups, ambiente de staging (dobra a infra). Real: **US$ 1.800–2.500/mês**. |
| "Economia de 20 min/dia por colaborador" | ❌ Não validado. | É chute. Pode ser 5 min, pode ser 40. **Tem que medir antes** com diário de tempo dos colaboradores nas tarefas-alvo. |
| "Modo shadow elimina risco" | ⚠️ Parcial. | Modo shadow elimina risco *do envio*, não do *bot estar errado em geral*. E exige humano revisando — quem? |
| "Eval suite garante qualidade" | ⚠️ Parcial. | Só se o dataset for grande (200+) e curado por alguém que conhece o domínio. Ou seja: precisa de 40h de trabalho de alguém da operação só pra montar dataset. |
| "Confirmação humana protege contra alucinação" | ⚠️ Parcial. | Protege contra *envio errado*, não contra *informação errada que o usuário acredita e age sobre*. |
| "Bedrock = dados não saem da AWS" | ✅ Sim. | Verdade. Inclusive Bedrock não usa seus dados pra treinar modelo, contratualmente. |
| "Knowledge Base reindexa sozinha" | ✅ Sim. | Verdade, com sync automático configurado. |
| "WhatsApp via Twilio é simples" | ❌ Não. | Verificação de Meta Business pode levar 2–6 semanas. Templates HSM precisam ser pré-aprovados. Não é "plug and play". |

### 2.2 O elefante na sala: documentação interna

> **Se a documentação do sistema não existir em formato textual estruturado, o projeto não sai da v2.**

Isto não é exagero. RAG depende de texto. Se hoje o "manual" do sistema é:
- Conhecimento na cabeça das pessoas → **precisa documentar antes** (4–8 semanas de trabalho de operação).
- Vídeos do YouTube interno → **precisa transcrever e estruturar**.
- Wiki Confluence desorganizada → **precisa curar e padronizar**.
- Tickets antigos do Zendesk → **dados sujos, precisa filtrar**.

**Antes de aprovar o projeto, faça este teste:**
1. Pegue 20 perguntas reais que a operação faz.
2. Para cada uma, encontre a resposta em forma de texto na sua documentação.
3. Se você acha < 70% delas → o projeto começa pela documentação, não pelo código.
4. Se < 40% → primeiro contrate alguém pra escrever o manual; o bot vem depois.

Esse é o **maior preditor de sucesso ou fracasso** do projeto.

### 2.3 O segundo elefante: ninguém tem tempo pra alimentar o bot

Quem mantém os playbooks YAML atualizados? Quem revisa as sugestões em modo shadow? Quem rotula os casos de eval? Quem responde ao 👎 do usuário?

Os docs anteriores assumem implicitamente que existe um "product owner da operação" disponível. **Na prática:**
- A pessoa mais qualificada pra esse papel é também a mais ocupada.
- Sem **liberação formal de tempo** (mín. 8h/semana), ela vai priorizar incêndio do dia.
- Em 3 meses, conteúdo do bot vira obsoleto, qualidade cai, usuário abandona.

**Isso mata mais projetos de IA interna do que problema técnico.**

### 2.4 O terceiro elefante: bus factor

Plano de "1 dev sênior dedicado" tem riscos:
- Dev fica doente 2 semanas → projeto trava.
- Dev pede demissão → 4 meses pra reonboarding.
- Dev de férias → on-call do bot? Quem responde se cair?
- Dev sozinho não tem com quem fazer code review honesto → qualidade degrada.

**Mínimo realista:** 1 sênior + 1 pleno (mesmo que part-time). Custa mais, mas é a diferença entre projeto que dura e projeto que vira lenda interna.

---

## 3. Build vs Buy — a conversa que não foi tida

### 3.1 Existem soluções prontas. Sério.

| Produto | O que faz | Preço aproximado | Cabe aqui? |
|---|---|---|---|
| **Glean** | Assistente IA com RAG sobre todas as fontes da empresa (Notion, Slack, Drive, etc) | US$ 30–50/usuário/mês | Forte em busca/Q&A, fraco em ações customizadas. |
| **Intercom Fin** | Bot de atendimento com IA, foco cliente externo | US$ 0,99/resolução | Bom pra atendimento, não pra colaborador interno. |
| **Forethought** | Assistente IA pra suporte | Enterprise (US$ 10k+/ano) | Customer support, não copiloto interno. |
| **Ada** | Bot conversacional | Enterprise | Customer-facing. |
| **Zendesk AI Agents** | Add-on do Zendesk | US$ 50/agent/mês | Só se já usa Zendesk. |
| **Microsoft Copilot Studio** | Plataforma low-code de copilotos | US$ 200/mês + uso | Bom pra prototipar; lock-in Microsoft. |
| **Botpress / Voiceflow** | Builders de bot | US$ 80–500/mês | Foco em flows determinísticos. |
| **Custom (você construindo)** | Sob medida | R$ 80k upfront + R$ 20k/mês | Total controle, integração funda. |

### 3.2 A pergunta honesta

**Por que não comprar Glean por US$ 30 × 50 usuários = US$ 1.500/mês = R$ 9k/mês?**

Resposta candidata 1: *"Porque Glean não executa ações dentro do nosso sistema."*
→ Válida. **Se** ações executáveis (gerar Excel, enviar cobrança) forem realmente diferenciais. Se for só Q&A sobre documentação, Glean ganha de lavada.

Resposta candidata 2: *"Porque queremos proatividade contextual."*
→ Válida, mas você pode comprar Glean pra Q&A e construir só a parte proativa. Híbrido custa metade.

Resposta candidata 3: *"Porque dados sensíveis."*
→ Glean tem deployment self-hosted. Resolve.

Resposta candidata 4: *"Porque queremos diferencial competitivo."*
→ Válida só se o produto que você vende usa esse copiloto como feature. Se for ferramenta interna, "diferencial" não importa.

### 3.3 Veredicto

**Build é justificável** se, e só se:
1. Pelo menos **3 das 5 ações executáveis** (Excel, cobrança, etc.) forem core do diferencial.
2. A proatividade contextual baseada em regras de negócio é de fato relevante (não é só "seria legal").
3. Existe time técnico para manter (não vira "projeto do Fulano").
4. Há orçamento para 24 meses de iteração (não só 3 meses de MVP).

Se faltar qualquer um dos 4 → **considere Glean ou similar como base + camada custom só pra ações.** Você economiza 60% do esforço.

### 3.4 Caminho híbrido (que ninguém discutiu, mas é o mais sensato)

```
┌─────────────────────────────────────────────┐
│ Glean (ou similar)                          │
│ → Q&A sobre documentação                    │
│ → Busca semântica multi-fonte               │
│ → Onboarding novo colaborador               │
└─────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────┐
│ Camada custom (você constrói)               │
│ → Tools de ação (Excel, cobrança)           │
│ → Proatividade baseada em regras            │
│ → Integração funda no sistema               │
└─────────────────────────────────────────────┘
```

Custo: R$ 9k/mês de Glean + R$ 8k/mês de custom (Lambda + tools) = **R$ 17k/mês**.
vs. Build puro: R$ 20k/mês + R$ 80k upfront.

**Considerar formalmente esta opção é obrigatório antes de aprovar o build.**

---

## 4. Premissas que precisam ser validadas antes de codar

São perguntas com resposta binária (sim/não) ou numérica. Sem todas validadas, não comece.

### 4.1 Validações de negócio

| # | Premissa | Como validar | Resposta esperada |
|---|---|---|---|
| 1 | Existe documentação textual cobrindo > 70% das perguntas frequentes | Pegar 20 perguntas, buscar nas fontes textuais | ≥ 14 encontradas |
| 2 | Existem ≥ 3 fluxos repetitivos que valem ser automatizados | Entrevista com 5 colaboradores, contar fluxos | ≥ 3 mencionados por ≥ 3 pessoas |
| 3 | Operação economizaria ≥ 15 min/dia com o bot | Diário de tempo (1 semana) nas tarefas-alvo | Tempo médio gasto > 15 min/dia |
| 4 | Existe patrocinador executivo claro | Tem nome, email e SLA de aprovação | Sim, com nome |
| 5 | Existe orçamento aprovado para 12 meses | Pedido formal com valor e prazo | Aprovado por escrito |
| 6 | Existe pessoa da operação com 8h/sem livres | Negociar com gestor da pessoa | Liberação formal |

### 4.2 Validações técnicas

| # | Premissa | Como validar | Resposta esperada |
|---|---|---|---|
| 7 | Sistema atual expõe JWT ou tem API auth | Conversar com arquiteto do sistema | Sim |
| 8 | RDS do sistema atual permite réplica de leitura | Verificar com DBA | Sim |
| 9 | Bedrock está acessível na região escolhida | Console AWS, modelos disponíveis | Sonnet 4.6 + Haiku 4.5 liberados |
| 10 | Frontend atual aceita injeção de Web Component | POC de 1 dia | Renderiza sem conflito |
| 11 | Operação tem WhatsApp Business verificado (se for usar) | Verificar com marketing/ops | Sim, com BSP definido |

### 4.3 Validações legais

| # | Premissa | Como validar | Resposta esperada |
|---|---|---|---|
| 12 | DPO do sistema sabe e aprovou o projeto | Email formal | Aprovação por escrito |
| 13 | LGPD: bot processará dados pessoais? | Mapeamento dos dados que o bot vê | Documentado em RIPD |
| 14 | Cliente final está em contato? Tem consentimento? | Termo de uso atual cobre IA? | Revisão jurídica |
| 15 | Bedrock cumpre requisitos de soberania de dados | Verificar região e contratos AWS | Sim, com região definida |

**Score mínimo para começar:** 13/15 com plano claro pros 2 que faltam.

---

## 5. O que a v1 (mock) precisa **realmente** validar

Os docs vendem a v1 como "mostrar pro chefe". Mas a v1 tem função técnica e estratégica muito mais importante:

### 5.1 Validação de UX
- Usuários reais conseguem usar sem instrução? (taxa de tarefa concluída)
- Que tipo de pergunta as pessoas tentam fazer? (descobre escopo real)
- Quanto tempo levam? (linha de base para medir economia depois)

### 5.2 Validação de adoção
- Pessoas voltam ao bot espontaneamente? (mock não responde de verdade, mas mede curiosidade)
- Em qual tela do sistema o bot é mais convidativo?
- Bolinha pulsando irrita ou ajuda?

### 5.3 Validação de escopo
- Lista das **20 perguntas mais comuns que apareceram no mock** vira o backlog priorizado da v3.
- Lista das **5 ações que foram mais pedidas** vira o backlog da v4.

**Não pule essa validação.** Vale 4 semanas de retrabalho economizadas depois.

---

## 6. Métricas que importam de verdade (não as do dashboard)

Os docs listam métricas técnicas (latência, taxa de erro, etc). Essas são higiene. As métricas que importam pro **negócio**:

| Métrica | O que mede | Meta inicial (3 meses) | Meta madura (12 meses) |
|---|---|---|---|
| **Adoção semanal** | % de usuários ativos que usaram o bot ≥ 1x na semana | > 40% | > 70% |
| **Profundidade de uso** | Mensagens por usuário ativo por semana | > 5 | > 15 |
| **Taxa de tarefa concluída** | % de conversas que chegaram a resultado útil (auto-relato + heurística) | > 60% | > 85% |
| **Tempo economizado por tarefa** | Diferença entre fazer "do jeito antigo" vs com bot (medido em sample) | ≥ 30% | ≥ 60% |
| **% de sugestões proativas que viraram ação** | Sugestões clicadas / total | > 15% | > 30% |
| **NPS do bot** | "Você indicaria o bot pra um colega novo?" | > 30 | > 50 |
| **Custo por interação útil** | Custo total / interações que renderam ação | < R$ 0,50 | < R$ 0,15 |

**Defina baseline antes de lançar.** Sem baseline, não dá pra provar ROI.

---

## 7. O que cortei das versões anteriores que não defendo

Listo o que estava nos docs anteriores e que considero **errado, exagerado ou ingênuo**:

1. ❌ **"Bus factor não é problema porque AWS é serverless"** — não estava escrito assim, mas estava implícito. Bus factor é problema sim, e é organizacional, não técnico.
2. ❌ **"Modo shadow elimina risco"** — minimiza, não elimina. Risco residual existe e precisa de plano.
3. ❌ **"Eval pipeline garante qualidade"** — só garante regressão. Qualidade absoluta depende do gabarito, que é trabalho humano contínuo.
4. ❌ **"Em 6 semanas tem MVP em produção"** — é otimista demais para empresa real com burocracia normal.
5. ❌ **"R$ 220k/ano de economia"** — não é mentira, mas é **estimativa não validada**. Tratada como fato no pitch original. Errado.
6. ❌ **"Concorrentes não têm"** — afirmação sem evidência. Hoje (2026) muitos concorrentes têm Glean ou similar. Diferencial é menor do que parecia em 2023.
7. ❌ **"AWS resolve tudo"** — viés de fornecedor. Para Q&A puro, comprar Glean pode ser melhor decisão.
8. ❌ **Ausência total de menção a LGPD** — gravíssimo no Brasil. Coberto agora no `MASTER_05`.
9. ❌ **Onboarding do colaborador novo cai de 4 semanas pra 1** — chute total. Sem evidência. Cortar do pitch ou validar com dado.
10. ❌ **Step Functions "talvez no futuro"** — vago. Decidir agora: usa ou não, e quando.

---

## 8. O que mantenho com confiança

1. ✅ **Tool use no Bedrock como espinha dorsal.** Padrão correto.
2. ✅ **Separar proatividade determinística da geração de linguagem.** Acerto técnico.
3. ✅ **Playbooks YAML versionados.** Acerto de design (assumindo que documentação existe).
4. ✅ **Confirmação humana antes de ação irreversível.** Não-negociável, correto.
5. ✅ **Auditoria completa.** Obrigação legal e operacional.
6. ✅ **SSE em vez de WebSocket.** Decisão técnica certa.
7. ✅ **Modo shadow antes de exposição.** Correto, com a ressalva de quem revisa.
8. ✅ **Versão mocada (v0+v1) antes de gastar com infra.** Acerto estratégico.

---

## 9. Decisões críticas pendentes (versão completa)

Cada uma destas tem que ter **dono, prazo e resposta** antes de começar:

| # | Decisão | Dono sugerido | Prazo |
|---|---|---|---|
| D1 | Build vs Buy vs Híbrido | Patrocinador + Tech Lead | 2 semanas |
| D2 | Escopo: colaborador only ou inclui cliente? | Patrocinador + Jurídico | 1 semana |
| D3 | DPO/responsável LGPD | RH/Jurídico | 1 semana |
| D4 | Patrocinador executivo formal | Diretoria | Imediato |
| D5 | Product owner da operação (8h/sem dedicadas) | Gestor de operação | 2 semanas |
| D6 | Time técnico (1 sênior + 1 pleno) | CTO/Eng Manager | 3 semanas |
| D7 | Orçamento 12 meses aprovado | CFO/Patrocinador | 3 semanas |
| D8 | Documentação interna existe? Se não, plano pra criar | PO + Operação | 2 semanas |
| D9 | Região AWS e estratégia de soberania de dados | Tech Lead + DPO | 1 semana |
| D10 | Métricas de baseline coletadas | PO + Operação | 4 semanas |

**Sem D1–D7 respondidos, não comece a v2.**
**Sem D8–D10 respondidos, não comece a v3.**

---

## 10. Veredicto final

A ideia é **boa, mas a execução proposta é otimista**. O caminho honesto é:

1. **Próximas 2–4 semanas:** validar D1 a D10 acima. Sem código.
2. **Decidir build vs buy vs híbrido** com base em D1.
3. **Se build:** v0+v1 (mock, 2 semanas) **antes** de qualquer AWS.
4. **Reavaliar com dados** da v1: vale continuar pra v2+? Ou pivotar pra híbrido?
5. **Só depois** investir em backend real.

Tempo total honesto até copiloto rodando em produção com 5 usuários piloto: **5–7 meses**, não 3.

Custo total honesto até esse ponto: **R$ 250–400k** (dev + infra + tempo de operação alocado), não R$ 60k.

ROI honesto: **payback em 6–12 meses** após produção, não 2.

Isso ainda é um bom investimento. Mas é um investimento honesto, não vendido.
