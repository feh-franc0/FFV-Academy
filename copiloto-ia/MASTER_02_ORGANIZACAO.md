# MASTER 02 — Estrutura Organizacional e Governança

> Quem faz o quê, quem decide o quê, em que ritmo o time se encontra, e como o projeto não vira "projeto do Fulano". Sem essa estrutura, projeto de IA interna vira shelfware em 6 meses.

---

## 1. Princípios de organização

1. **Patrocinador ≠ Product Owner ≠ Tech Lead.** São 3 papéis, podem ser 3 pessoas ou 2, mas nunca 1.
2. **Operação dentro do time, não fora.** Sem alguém da operação **dedicado** (não consultivo), o bot vira tecnicamente bom e operacionalmente irrelevante.
3. **Decisão tem dono único.** Comitê pode aconselhar, mas alguém assina.
4. **Reuniões com agenda, não rituais sociais.** Cada cerimônia tem propósito mensurável.
5. **Bus factor ≥ 2** em todo papel crítico. Se cair um, projeto continua.

---

## 2. Organograma

```
                    ┌──────────────────────────┐
                    │   PATROCINADOR EXECUTIVO │
                    │   (Diretor / VP)         │
                    │   - Aprova orçamento     │
                    │   - Remove bloqueios     │
                    │   - Defende projeto      │
                    └────────────┬─────────────┘
                                 │
                                 │ accountable a
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
   ┌─────────────────┐ ┌──────────────────┐ ┌────────────────┐
   │ PRODUCT OWNER   │ │   TECH LEAD      │ │ DPO / JURÍDICO │
   │ (operação)      │ │   (engenharia)   │ │ (advisory)     │
   │ - Define escopo │ │ - Arquitetura    │ │ - LGPD         │
   │ - Prioriza      │ │ - Qualidade      │ │ - Termos uso   │
   │ - Valida        │ │ - Entrega        │ │ - Risco legal  │
   └────────┬────────┘ └────────┬─────────┘ └────────────────┘
            │                   │
            │                   │
   ┌────────┴────────┐    ┌─────┴───────────────┐
   │                 │    │                     │
   ▼                 ▼    ▼                     ▼
┌────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐
│ ESPECIA-   │ │ DESIGNER │ │ DEV SR       │ │ DEV PL   │
│ LISTA NEG. │ │ UX       │ │ (full-stack) │ │ (apoio)  │
│ (operação) │ │ (cons.)  │ │              │ │          │
└────────────┘ └──────────┘ └──────────────┘ └──────────┘
```

### 2.1 Stakeholders externos ao time (consultados, não membros)

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ DBA / Infra    │  │ Segurança      │  │ Atendimento    │
│ (RDS, redes)   │  │ (revisão)      │  │ (handoff bot   │
│                │  │                │  │  → humano)     │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## 3. Papéis detalhados

### 3.1 Patrocinador Executivo

**Quem:** Diretor com poder de decisão de orçamento e de remover bloqueios entre áreas.

**Responsabilidade primária:** O projeto não morrer por motivos políticos.

**O que faz:**
- Aprova marcos e libera tranches de orçamento.
- Decide D1 (build vs buy) com base em recomendação do Tech Lead + PO.
- Defende o projeto em reuniões executivas.
- Remove bloqueios entre operação, TI, jurídico, marketing.

**O que NÃO faz:**
- Decisão técnica.
- Decisão de escopo do dia a dia.
- Code review.

**Tempo dedicado:** 2h/mês fixas + ad hoc para desbloqueios.

**Entrada esperada:** relatório mensal de 1 página com KPIs, riscos top 3, pedidos.

---

### 3.2 Product Owner (PO) — Operação

**Quem:** Pessoa **da operação** (não TI), com 5+ anos no negócio, que conhece os fluxos repetitivos na pele. Idealmente alguém que treina novos colaboradores.

**Responsabilidade primária:** O bot resolver problema real, não problema imaginado.

**O que faz:**
- Define os 10 primeiros fluxos cobertos.
- Prioriza backlog semanal.
- Escreve playbooks YAML (com auxílio do Tech Lead).
- Revisa sugestões em modo shadow.
- Conduz validação com usuários piloto.
- Rotula casos do dataset de eval.
- Recebe e categoriza feedback.

**O que NÃO faz:**
- Decisão técnica de stack.
- Code, infra, deploy.

**Tempo dedicado:** **Mínimo 8h/semana, dedicação formal.** Sem isso o projeto não funciona. Negociar liberação com gestor original.

**Critério de aceite do papel:** consegue dizer com convicção "o fluxo X vale automatizar e o Y não vale" e justificar.

---

### 3.3 Tech Lead

**Quem:** Engenheiro sênior fullstack com experiência em AWS Lambda + integração de LLM. Não precisa ser ML engineer — não há treinamento de modelo neste projeto.

**Responsabilidade primária:** Arquitetura sólida, código sustentável, segurança correta.

**O que faz:**
- Decide arquitetura e stack.
- Code review de tudo que vai pra main.
- Monta CI/CD e pipeline de eval.
- Define padrões de prompt, playbook e tool.
- Owner do incidente (on-call primário no início).
- Entrevista e onboarda devs adicionais.

**O que NÃO faz:**
- Define escopo de produto.
- Conversa com usuário final (faz com PO presente).

**Tempo dedicado:** 100% durante v0–v6 (6 meses). Depois pode cair pra 50%.

---

### 3.4 Dev Pleno (apoio)

**Quem:** Engenheiro pleno com experiência em backend + algum frontend.

**Responsabilidade primária:** Bus factor + aceleração. Se Tech Lead some, projeto continua.

**O que faz:**
- Implementa tools, lambdas, componentes do widget.
- Mantém ambientes de staging.
- Escreve testes.
- Rotina de monitoramento.
- Aprende tudo que o Tech Lead sabe → bus factor 2.

**Tempo dedicado:** 50–100% conforme fase.

---

### 3.5 Especialista de Negócio (suporte ao PO)

**Quem:** Outra pessoa da operação, complementar ao PO.

**Responsabilidade primária:** Bus factor do PO + capilaridade.

**O que faz:**
- Backup do PO em férias/ausências.
- Coleta feedback de outros times de operação.
- Apoia rotulagem de eval dataset.

**Tempo dedicado:** 4h/semana.

---

### 3.6 DPO / Jurídico (advisory, não dedicado)

**Quem:** Encarregado de Dados (LGPD) da empresa. Se não existe, **resolva isso primeiro** — é exigência legal.

**Responsabilidade primária:** Garantir que o bot opere dentro da LGPD e contratos.

**O que faz:**
- Revisa Relatório de Impacto à Proteção de Dados (RIPD) antes da v3.
- Valida termos de uso para usuários do bot.
- Aprova fluxo de retenção e eliminação de dados.
- Define resposta a pedidos de titulares (acesso, exclusão).
- Avalia integrações externas (WhatsApp BSP, etc).

**Tempo dedicado:** 4h no setup + 1h/mês de revisão.

Detalhamento completo no `MASTER_05`.

---

### 3.7 Designer UX (consultoria pontual)

**Quem:** UX/UI designer, idealmente com experiência em produtos conversacionais.

**O que faz:**
- Wireframes e protótipo da v0.
- Revisão de fluxos conversacionais da v1.
- Padrão visual (cores, tipografia, micro-animações).
- Heurísticas de UX revisadas a cada nova versão.

**Tempo dedicado:** ~40h totais, distribuídas em sprints.

---

### 3.8 DBA / Infra (consultoria pontual)

**Quem:** DBA do sistema atual.

**O que faz:**
- Configura réplica de leitura do RDS.
- Revisa queries do bot pra garantir que não tombam o banco.
- Define backups da nova infra.

**Tempo dedicado:** ~24h totais.

---

### 3.9 Segurança (review obrigatório)

**Quem:** Time/responsável por segurança da informação.

**O que faz:**
- Threat model do bot antes da v3.
- Pen test antes de exposição a usuário externo.
- Revisão de gestão de segredos.

**Tempo dedicado:** ~16h totais, mais o pen test (terceirizado se necessário).

---

## 4. Matriz RACI por entregável

> R = Responsável (faz), A = Aprovador (responde por), C = Consultado, I = Informado.

| Entregável | Patroc. | PO | Tech Lead | Dev Pl | DPO | Designer | DBA | Segurança |
|---|---|---|---|---|---|---|---|---|
| Decisão build vs buy | A | C | R | I | C | I | I | C |
| Definição de escopo MVP | A | R | C | I | C | I | I | I |
| Arquitetura técnica | I | C | R/A | C | C | I | C | C |
| Documentação interna (input pra RAG) | I | R/A | C | I | C | I | I | I |
| Playbooks YAML | I | R | A | C | C | I | I | I |
| Implementação do widget | I | C | A | R | I | C | I | I |
| Implementação do backend | I | I | R/A | R | I | I | C | C |
| Eval dataset | I | R | C | I | I | I | I | I |
| RIPD / LGPD | A | C | C | I | R | I | I | C |
| Lançamento piloto | A | R | C | I | C | I | I | I |
| On-call em produção | I | I | R | R | I | I | I | C |
| KPIs mensais | A | R | C | I | I | I | I | I |

---

## 5. Comitês e ritmo de governança

### 5.1 Comitê Diretor (mensal, 60 min)
**Participantes:** Patrocinador + PO + Tech Lead + (DPO se houver tema).

**Propósito:** Vai/não vai. Decisões de orçamento, escopo macro, riscos.

**Pauta fixa:**
1. KPIs do mês (10 min)
2. Status dos gates de versão (10 min)
3. Riscos top 3 (15 min)
4. Decisões pendentes (15 min)
5. Orçamento próximo mês (10 min)

**Output:** ata com decisões e responsáveis.

### 5.2 Stand-up técnico (diário, 15 min)
**Participantes:** Tech Lead + devs.
**Propósito:** Desbloqueio operacional.

### 5.3 Refinamento com PO (semanal, 60 min)
**Participantes:** PO + Tech Lead + Dev Pleno.
**Propósito:** Refinar próximas histórias, validar critérios de aceite, revisar playbooks.

### 5.4 Review de qualidade (semanal, 30 min)
**Participantes:** PO + Tech Lead.
**Propósito:**
- Revisar amostra de 20 conversas reais (após v6).
- Categorizar feedback 👎 acumulado.
- Decidir ajustes em prompts/playbooks.

### 5.5 Review de modo shadow (semanal durante v5, 60 min)
**Participantes:** PO + Especialista de Negócio.
**Propósito:** Revisar 50 sugestões proativas geradas pelo bot, marcar 👍/👎/🤔.

### 5.6 Postmortem (após qualquer incidente, 60 min)
**Participantes:** quem foi envolvido + Tech Lead.
**Propósito:** Causa raiz + ação corretiva + atualização de runbook.

### 5.7 Retrospectiva trimestral (90 min)
**Participantes:** time inteiro.
**Propósito:** O que parar, começar, continuar. Saúde do time.

---

## 6. Decisões: quem assina o quê

| Tipo de decisão | Quem assina | Quem é consultado obrigatoriamente |
|---|---|---|
| Orçamento mensal > R$ 30k | Patrocinador | CFO |
| Stack técnica core | Tech Lead | Patrocinador (informado) |
| Escopo de produto (o que entra/sai) | PO | Tech Lead |
| Lançamento de versão para usuário real | PO + Tech Lead em conjunto | Patrocinador, DPO |
| Mudança de modelo LLM em produção | Tech Lead | PO (impacto qualidade) |
| Adição/remoção de tool | Tech Lead | PO, Segurança |
| Mudança em fluxo que toca cliente final | PO | DPO, Patrocinador |
| Concessão de acesso ao bot a novo usuário | PO | — |
| Kill switch (desligar bot) | Tech Lead | Patrocinador (notificado em ≤ 1h) |

---

## 7. Comunicação e canais

| Canal | Uso | Quem participa |
|---|---|---|
| Slack/Teams `#copiloto-dev` | Dia a dia técnico | Devs + Tech Lead |
| Slack/Teams `#copiloto-produto` | Decisões de escopo, feedback de usuário | Time inteiro |
| Slack/Teams `#copiloto-incidentes` | Alertas de produção | Devs + on-call + PO |
| Email mensal "Copiloto News" | Resumo de progresso | Stakeholders amplos |
| Notion/Confluence "Copiloto Hub" | Documentação viva | Time + leitura ampla |
| Linear/Jira projeto "COPILOT" | Backlog, sprints | Time interno |

---

## 8. On-call e operação após produção

### 8.1 Estrutura de plantão (pós v6)

| Severidade | Definição | Resposta esperada | Quem aciona |
|---|---|---|---|
| **SEV1** | Bot enviou mensagem errada a cliente real, ou vazamento de dados | < 15 min, qualquer hora | PagerDuty → Tech Lead + Patrocinador + DPO |
| **SEV2** | Bot fora do ar, todos usuários afetados | < 30 min, horário comercial estendido | PagerDuty → On-call |
| **SEV3** | Funcionalidade degradada, alguns usuários | < 4h, horário comercial | Triagem manhã seguinte |
| **SEV4** | Cosmético, não-bloqueante | Próximo sprint | Backlog |

### 8.2 Rotação on-call

- 1 semana por vez, alternando entre Tech Lead e Dev Pleno.
- Plantão fora de horário comercial só após 30 dias de produção estável.
- Compensação financeira ou folga conforme política da empresa.

### 8.3 Runbooks obrigatórios antes de produção

- Bot fora do ar (Bedrock indisponível) → fallback
- Vazamento de dados detectado → comunicação ao DPO em < 15 min
- Tool com bug enviando mensagens erradas → kill switch
- Custo AWS disparou > 3x baseline → alarme + investigação
- Dataset de eval falhou em PR → rollback

---

## 9. Onboarding de novos membros

Checklist de 1ª semana de qualquer novo membro:

- [ ] Acesso a AWS, repo, Slack, Notion.
- [ ] Leitura obrigatória: `MASTER_00` a `MASTER_05`.
- [ ] Pareamento com Tech Lead em 1 deploy.
- [ ] Pareamento com PO em 1 conversa com usuário.
- [ ] Resolução de 1 issue marcada `good-first-issue`.
- [ ] Apresentação à operação em uma stand-up.

---

## 10. Indicadores de saúde organizacional

Não são KPIs do produto — são **KPIs do time**. Se ficarem ruins, projeto está em risco mesmo que produto esteja bem.

| Indicador | Meta | Frequência |
|---|---|---|
| Disponibilidade do PO (horas/sem dedicadas reais) | ≥ 8h | Semanal |
| Bus factor (mín. 2 pessoas por componente crítico) | ≥ 2 | Mensal |
| Backlog de feedback não triado | < 20 itens | Semanal |
| Atraso de decisões em comitê (D+ dias) | < 5 dias | Mensal |
| Reuniões canceladas / total | < 15% | Mensal |
| Onboarding novo membro até produtivo | ≤ 2 semanas | Por evento |
| Tempo médio de PR aberto | < 3 dias | Semanal |

---

## 11. Plano de evolução do time por fase

| Fase do produto | Time mínimo | Time ideal |
|---|---|---|
| v0 (mock visual) | 1 dev | 1 dev + designer pontual |
| v1 (mock interativo) | 1 dev | 1 dev + designer + PO part-time |
| v2 (chat real) | 1 dev sênior + PO | + Dev pleno |
| v3 (RAG + playbooks) | Sênior + Pleno + PO | + Especialista negócio |
| v4 (ações) | Sênior + Pleno + PO | + Segurança consultiva |
| v5 (proatividade) | Mesmo | + Especialista negócio dedicado |
| v6 (qualidade + lançamento) | Mesmo | + DPO ativo |
| v7+ (produção e escala) | Sênior + Pleno + PO | + 1 dev adicional, on-call rotativo |

---

## 12. O risco organizacional #1

> **Não é técnico. É o PO da operação não conseguir dedicar 8h/semana de verdade.**

Sinais de alarme:
- PO falta a refinamento 2 semanas seguidas → escalar pro Patrocinador.
- Backlog de playbooks parado por > 2 sprints → trocar PO.
- Sugestões em modo shadow não revisadas por > 1 semana → projeto entra em hold.

**Antes de aprovar a v3, exija:**
- Carta formal do gestor do PO liberando 8h/sem.
- Sucessão definida (especialista negócio em standby).
- Critério de troca acordado (3 strikes e troca).

Sem isso, qualquer outra coisa neste documento é decoração.
