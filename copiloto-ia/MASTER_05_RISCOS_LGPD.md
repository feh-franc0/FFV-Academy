# MASTER 05 — Riscos, LGPD e Plano de Contingência

> A parte que os docs anteriores ignoraram. No Brasil, ignorar LGPD em projeto que processa dados pessoais é exposição direta a multa de até **R$ 50 milhões ou 2% do faturamento** por infração. Além disso, listamos riscos sérios além de compliance — operacionais, reputacionais, técnicos.

---

## 1. Por que este documento existe separado

Os docs de arquitetura tratam LGPD como rodapé ("usar Bedrock Guardrails"). Insuficiente. LGPD não é feature de produto — é **conformidade legal contínua** com obrigações específicas, papéis definidos por lei, e direitos do titular que precisam estar implementados antes do lançamento.

Riscos não-LGPD (operacionais, técnicos, reputacionais) também merecem tratamento dedicado, não buried em "considerações finais".

---

## 2. LGPD — Visão geral aplicada ao projeto

### 2.1 Quais dados pessoais o bot vai tocar

| Categoria | Origem | Exemplos |
|---|---|---|
| Dados do colaborador (usuário do bot) | JWT do sistema atual | nome, email, cargo, role |
| Dados do cliente (alvo das ações) | RDS via tools | nome, CPF/CNPJ, telefone, endereço, histórico financeiro |
| Conteúdo da conversa | Input do usuário no chat | qualquer coisa que o usuário digite |
| Metadados de uso | Telemetria | timestamps, tela, ações |

**Conclusão:** o bot é controlador conjunto (com a empresa) de dados pessoais sensíveis e financeiros. **LGPD aplicável em todos os artigos relevantes.**

### 2.2 Bases legais a invocar (Art. 7º LGPD)

| Uso | Base legal sugerida | Observação |
|---|---|---|
| Bot tirando dúvida do colaborador | Legítimo interesse (Art. 7º, IX) | Empresa precisa demonstrar |
| Bot processando dados de cliente para gerar Excel | Execução de contrato (Art. 7º, V) | Já coberto se contrato com cliente prevê uso de sistemas |
| Bot enviando cobrança ao cliente | Execução de contrato + obrigação legal | Pré-existente |
| Treinamento/melhoria do bot com conversas | **Consentimento** | Difícil; melhor não fazer ou usar dados sintéticos |
| Logs de auditoria | Cumprimento de obrigação legal | Retenção alinhada à exigência |

**Decisão crítica:** **NÃO usar conversas reais para fine-tuning de modelo.** Isso exige consentimento específico que ninguém vai dar. Usar dados sintéticos pra eval e treinamento.

### 2.3 Princípios da LGPD aplicados (Art. 6º)

| Princípio | O que significa aqui | Como cumprir |
|---|---|---|
| **Finalidade** | Cada uso deve ter propósito claro | Documentar no RIPD |
| **Adequação** | Coleta deve casar com finalidade | Não pedir CPF se não precisa |
| **Necessidade** | Mínimo de dados necessário | Tools só recebem ID, não dump completo do cliente |
| **Livre acesso** | Titular pode acessar seus dados | Endpoint de exportação de conversas |
| **Qualidade dos dados** | Dados precisos, atualizados | Sync com fonte de verdade (RDS) |
| **Transparência** | Informar uso de IA | Aviso visível no widget |
| **Segurança** | Medidas técnicas e administrativas | Criptografia, IAM, auditoria |
| **Prevenção** | Evitar danos | Confirmação humana, modo shadow |
| **Não discriminação** | Não usar IA para fins discriminatórios | Análise de viés nos prompts |
| **Responsabilização** | Demonstrar conformidade | Logs, RIPD, treinamento |

### 2.4 Direitos do titular (Art. 18) — implementação obrigatória

Antes do lançamento (GATE F), implementar:

| Direito | Implementação no produto |
|---|---|
| Confirmação da existência de tratamento | Aviso visível no widget + documento público |
| Acesso aos dados | Endpoint que exporta conversas + dados do perfil em JSON |
| Correção | Edição de perfil pelo próprio usuário |
| Anonimização/eliminação | Endpoint de "esquecer-me" que apaga conversa e perfil |
| Portabilidade | Exportação em formato estruturado (JSON) |
| Eliminação após fim do tratamento | TTL automático em DynamoDB + job de purge |
| Informação sobre compartilhamento | Lista de subprocessadores (AWS, Twilio, etc) na política |
| Revogação de consentimento | Botão "desativar bot" que para de processar |

**Cada um precisa de:** endpoint + UI + documentação + teste.

### 2.5 RIPD — Relatório de Impacto à Proteção de Dados

**Obrigatório** antes de processar dados sensíveis em escala (Art. 38). Estrutura mínima:

1. Descrição dos tratamentos (quem coleta, o que, por que, como)
2. Necessidade e proporcionalidade
3. Riscos aos direitos do titular (mapeados, quantificados)
4. Salvaguardas técnicas e administrativas
5. Mecanismos de mitigação
6. Avaliação residual de risco

**Quem produz:** DPO + Tech Lead + PO.
**Quem aprova:** DPO.
**Quando atualizar:** a cada nova fase + a cada novo dado processado.

### 2.6 Direito à explicação sobre decisões automatizadas (Art. 20)

Se o bot **toma decisão automatizada** que afeta o titular (ex.: priorizar cobrança X em vez de Y), o titular tem direito a:
- Saber que decisão foi automatizada.
- Pedir revisão humana.
- Receber explicação sobre os critérios.

**Implementação:** se uma sugestão proativa do bot resulta em ação que afeta cliente final (ex.: cobrança), registrar:
- Que regra disparou.
- Que critérios foram aplicados.
- Como pedir revisão humana (escalonamento).

Isso vai além de "auditoria interna" — é direito do cliente, e deve estar documentado em política pública.

### 2.7 Comunicação ao titular sobre uso de IA

A ANPD recomenda transparência sobre uso de IA. Texto sugerido para aviso no widget na primeira interação:

> "Olá! Sou um assistente baseado em inteligência artificial. Posso te ajudar com dúvidas sobre o sistema e executar algumas tarefas. Suas mensagens são armazenadas para histórico e qualidade do serviço, e podem ser revisadas por humanos para melhoria. Não compartilhe informações sensíveis que não seriam necessárias para sua tarefa. Saiba mais em [link política]."

**Aceite explícito** na primeira vez. Botão "Entendi". Não vira modal nas próximas vezes.

### 2.8 Subprocessadores e transferência internacional

| Subprocessador | Dado processado | Localização | Base legal |
|---|---|---|---|
| AWS (Bedrock, Lambda, etc) | Tudo | EUA (Bedrock) ou Brasil (RDS) | Cláusulas contratuais padrão |
| Twilio (WhatsApp) | Mensagens enviadas a cliente | EUA + Brasil | Idem |
| Anthropic (via Bedrock) | Conteúdo das mensagens | EUA (sem treinamento) | Contrato AWS exclui treinamento |

**Atenção:** Bedrock processa em região EUA por padrão para alguns modelos. **Verificar e documentar** transferência internacional. Pode exigir cláusulas adicionais ou escolher região onde o modelo está disponível em data center brasileiro/europeu.

### 2.9 Retenção de dados

| Dado | Retenção sugerida | Justificativa |
|---|---|---|
| Conversa do bot | 90 dias | Operacional + revisão de qualidade |
| Logs de auditoria de tools | 5 anos | Obrigação contábil/fiscal |
| Telemetria agregada (sem PII) | Indefinida | Não é dado pessoal após anonimização |
| Perfil do usuário | Enquanto usuário ativo + 1 ano | Inatividade libera eliminação |
| Sugestões proativas | 30 dias | Operacional |
| Eval dataset (sintético/anonimizado) | Indefinida | Não tem dado pessoal |

**Implementar via:** TTL DynamoDB + jobs Lambda agendados de purge.

---

## 3. Mapa de riscos (priorizado)

Cada risco tem: probabilidade × impacto × mitigação × dono.

### 3.1 Riscos críticos (vermelhos)

#### R1 — Bot envia mensagem errada a cliente real (alucinação ou bug)
- **Probabilidade:** alta (sem mitigação) / baixa (com confirmação)
- **Impacto:** dano à relação com cliente, possível dano financeiro
- **Mitigação:**
  - Confirmação humana obrigatória antes de envio (não-negociável).
  - Templates pré-aprovados (variáveis, não texto livre).
  - Modo shadow antes de exposição.
  - Log de auditoria para reverter.
  - Botão "kill switch" da tool de envio.
- **Dono:** Tech Lead + PO

#### R2 — Vazamento de dados de cliente A para cliente B (cross-tenant)
- **Probabilidade:** baixa, mas catastrófica
- **Impacto:** multa LGPD + ANPD + reputação
- **Mitigação:**
  - Filtro tenant_id no backend, derivado do JWT, **nunca do prompt**.
  - Bedrock Guardrails ativo.
  - Pen test antes de exposição externa.
  - Testes de injeção semanais.
- **Dono:** Tech Lead + Segurança

#### R3 — PO sem dedicação real → bot vira shelfware
- **Probabilidade:** alta (sempre)
- **Impacto:** projeto morre lentamente
- **Mitigação:**
  - Carta formal de liberação de 8h/sem.
  - Sucessão definida (especialista em standby).
  - 3 strikes e troca.
  - Monitoramento mensal pelo Patrocinador.
- **Dono:** Patrocinador

#### R4 — Documentação interna não existe → RAG não funciona
- **Probabilidade:** alta
- **Impacto:** trava na v3, retrabalho de 4–8 semanas
- **Mitigação:**
  - Auditar documentação na FASE 0.
  - Plano de criação se cobertura < 70%.
  - PO + especialista escrevem em paralelo às fases iniciais.
- **Dono:** PO

#### R5 — Custo AWS dispara descontrolado
- **Probabilidade:** média
- **Impacto:** custo > orçamento, projeto perde sponsorship
- **Mitigação:**
  - Rate limit por usuário no API Gateway.
  - Bedrock Guardrails (token limits).
  - Alarme de billing em 50%, 80%, 100%, 150% do orçamento.
  - Haiku para classificação, Sonnet só quando necessário.
  - Prompt caching ativado (corta 50–90% de tokens repetidos).
- **Dono:** Tech Lead

### 3.2 Riscos altos (laranjas)

#### R6 — Bedrock fora do ar (incidente AWS)
- **Probabilidade:** baixa (SLA AWS)
- **Impacto:** bot indisponível
- **Mitigação:**
  - Fallback gracioso ("estou com problemas, fala com humano?").
  - Retry com backoff exponencial.
  - Circuit breaker.
  - Fallback opcional para outro modelo (Haiku se Sonnet cair).
- **Dono:** Tech Lead

#### R7 — Eval dataset insuficiente → não detecta regressão
- **Probabilidade:** alta no início
- **Impacto:** qualidade cai sem aviso
- **Mitigação:**
  - Mínimo 100 casos no dataset antes de produção.
  - Adicionar caso a cada bug de qualidade encontrado.
  - Sampling manual semanal pra validar o eval.
- **Dono:** PO + Tech Lead

#### R8 — Bus factor 1 → dev sai e projeto trava
- **Probabilidade:** média
- **Impacto:** alto
- **Mitigação:**
  - Time de 2 (sênior + pleno) desde a v3.
  - Documentação de runbooks atualizada.
  - Rotação on-call.
  - Pareamento ≥ 2x/semana.
- **Dono:** Tech Lead + Patrocinador

#### R9 — Adoção baixa após lançamento (< 30%)
- **Probabilidade:** média
- **Impacto:** ROI não materializa, projeto cancelado
- **Mitigação:**
  - Onboarding in-app (tour 30s).
  - Embaixadores: 2–3 colaboradores entusiastas evangelizam.
  - Apresentação em todas as áreas.
  - Métrica de adoção semanal monitorada.
  - Iteração rápida em fluxos pedidos e não cobertos.
- **Dono:** PO

#### R10 — Prompt injection (usuário malicioso ou cliente externo)
- **Probabilidade:** alta se cliente final usar
- **Impacto:** bot expõe dados, executa ação não autorizada
- **Mitigação:**
  - Bedrock Guardrails ativos.
  - Validação de permissão **no backend**, sem confiar em prompt.
  - Tools não recebem IDs do prompt (recebem do contexto autenticado).
  - Sanitização de input.
  - Pen test específico de prompt injection.
- **Dono:** Tech Lead + Segurança

### 3.3 Riscos médios (amarelos)

#### R11 — Mudança de preço do Bedrock
- Mitigação: orçamento com margem 30%, monitoramento.

#### R12 — Modelo Claude descontinuado / atualizado
- Mitigação: abstrair chamadas, eval suite captura regressão.

#### R13 — Frontend do sistema atual conflita com widget
- Mitigação: Web Component isolado (Shadow DOM), POC na FASE 0.

#### R14 — Operação rejeita o bot ("vai roubar meu emprego")
- Mitigação: comunicação clara de propósito (eliminar tarefa repetitiva, não pessoa). Embaixadores.

#### R15 — WhatsApp BSP bloqueia conta
- Mitigação: opt-in explícito, templates aprovados, monitoramento de bounces.

### 3.4 Riscos baixos (verdes)

- Cold start de Lambda — mitigável com provisioned concurrency se necessário.
- DynamoDB throttling — usar on-demand, ajustar se tabelas crescerem.
- S3 storage cresce — lifecycle policy pra mover arquivos antigos.

---

## 4. Plano de resposta a incidente

### 4.1 Severidades

Já listadas no `MASTER_02 §8.1`. Reforçando processo de resposta:

### 4.2 Fluxo SEV1 (vazamento ou mensagem errada a cliente)

```
Detecção (alerta ou usuário)
    ↓
Notificação automática:
  - Tech Lead (PagerDuty)
  - PO (Slack)
  - Patrocinador (email + SMS)
  - DPO (email)
    ↓
Tech Lead (em < 15 min):
  - Aciona kill switch da tool envolvida
  - Confirma escopo do incidente
    ↓
Em < 1h:
  - DPO avalia se há vazamento de dados pessoais
  - Se sim: contagem do prazo legal de comunicação à ANPD começa
    ↓
Em < 24h:
  - Postmortem inicial
  - Comunicação interna
    ↓
Em < 72h (se vazamento de PII):
  - Comunicação à ANPD (Art. 48 LGPD)
  - Comunicação aos titulares afetados
    ↓
Pós-incidente:
  - Postmortem completo
  - Ação corretiva
  - Atualização de runbook
```

### 4.3 Comunicação a titulares e ANPD (LGPD Art. 48)

Em caso de incidente que cause risco aos direitos:
- ANPD notificada em prazo razoável (ANPD tem regulamentado: 3 dias úteis).
- Titulares afetados notificados.
- Conteúdo da notificação inclui: descrição, dados afetados, pessoas afetadas, riscos, medidas tomadas.

**Template pré-aprovado pelo DPO** deve existir antes do lançamento.

---

## 5. Auditoria contínua

### 5.1 Logs obrigatórios e imutáveis

| Evento | Conteúdo | Retenção |
|---|---|---|
| Tool call | userId, tool, input (sanitizado), output, timestamp | 5 anos |
| Sugestão proativa gerada | userId, regra, conteúdo, exibida? clicada? | 1 ano |
| Acesso a dado de cliente | userId, clienteId, contexto | 5 anos |
| Login/sessão | userId, IP, user-agent | 1 ano |
| Pedido de titular (LGPD) | titular, tipo de pedido, atendimento | indefinida |

**Onde:** RDS audit_log + S3 (cópia imutável com Object Lock).
**Acesso:** restrito a Tech Lead + DPO + Auditoria.

### 5.2 Auditoria periódica

- **Semanal:** Tech Lead revisa amostra de logs por anomalia.
- **Mensal:** PO + DPO revisam pedidos de titular atendidos.
- **Trimestral:** auditoria interna formal (segurança).
- **Anual:** auditoria externa (se aplicável por porte da empresa).

---

## 6. Política de uso aceitável (interna e externa)

### 6.1 Para colaboradores (interna)

Documento de 1 página assinado no onboarding:
- O bot é ferramenta de trabalho, não substituto de julgamento.
- Decisões impactantes exigem revisão humana.
- Não inserir dados confidenciais de clientes além do necessário.
- Reportar comportamento anômalo do bot.
- Conversas são auditáveis.

### 6.2 Para cliente final (se aplicável)

Termo de uso atualizado:
- Existência do bot, finalidade.
- Limitações (não substitui atendimento humano em todos os casos).
- Direitos LGPD e como exercer.
- Lista de subprocessadores.

---

## 7. Integração com programas existentes

Verificar e integrar com:

- [ ] **Política de Segurança da Informação** da empresa (atualizar com bot).
- [ ] **Programa de LGPD** já existente (DPO já atua).
- [ ] **Política de Gestão de Crise** (incluir bot).
- [ ] **Treinamento de colaboradores** (módulo sobre uso do bot).
- [ ] **Política de Backup e Recuperação** (DynamoDB, S3).
- [ ] **Plano de Continuidade de Negócio** (impacto se bot cair).
- [ ] **Catálogo de fornecedores** (AWS, Twilio cadastrados).

---

## 8. Checklist legal antes de qualquer lançamento

Antes de **qualquer** usuário (mesmo interno) usar o bot com dados reais:

- [ ] DPO informado e ciente do escopo.
- [ ] RIPD elaborado e aprovado.
- [ ] Bases legais documentadas para cada uso.
- [ ] Aviso de IA implementado no widget.
- [ ] Endpoints de direitos do titular implementados (acesso, eliminação).
- [ ] Política de retenção implementada (TTL + jobs).
- [ ] Logs de auditoria funcionando e imutáveis.
- [ ] Subprocessadores listados em política pública.
- [ ] Plano de resposta a incidente aprovado.
- [ ] Termo de uso interno (colaborador) revisado e ativo.
- [ ] Pen test (mínimo internal review) sem severidades altas abertas.
- [ ] Treinamento da operação (incluindo escalonamento) realizado.

Antes de **cliente final** usar:

- [ ] Tudo acima +
- [ ] Termo de uso externo atualizado (revisão jurídica formal).
- [ ] Política de privacidade pública atualizada.
- [ ] Pen test externo formal.
- [ ] Comunicação prévia aos clientes sobre nova funcionalidade.
- [ ] Canal de denúncia/reclamação acessível.
- [ ] Capacitação do atendimento humano para receber escalonamentos.

---

## 9. Quando NÃO lançar

Lista clara de condições que devem **bloquear** lançamento:

1. ❌ DPO não aprovou RIPD.
2. ❌ Algum direito do titular não está implementado.
3. ❌ Pen test com severidade alta aberta.
4. ❌ Plano de resposta a incidente não testado em simulação.
5. ❌ Confirmação humana obrigatória pode ser bypass-ada (testar ativamente).
6. ❌ Tool de envio para cliente externo não tem kill switch funcionando.
7. ❌ Logs de auditoria não estão imutáveis.

**Qualquer um dos 7 pendente = lançamento adiado.** Sem exceção.

---

## 10. Veredicto

LGPD e gestão de risco neste projeto **não são opcionais nem após-pensamento**. São pré-condição de existência do produto em ambiente regulado como o brasileiro.

Custo da conformidade: ~10% do esforço total do projeto.
Custo da não-conformidade: até 2% do faturamento da empresa por infração + reputação.

A escolha é trivial. Faça certo desde o início.
