# Versões do Produto — Do Mock ao Copiloto em Produção

> Plano de versões incrementais. Cada versão é um **entregável testável** por si só. A v0 e a v1 são focadas em **experiência e UX** (sem AWS, sem custo). Da v2 em diante, entra backend real.

---

## Visão geral

| Versão | Objetivo | Backend | LLM real? | Tempo | Custo infra |
|---|---|---|---|---|---|
| **v0** | Protótipo visual estático | Nenhum | Não | 2–3 dias | R$ 0 |
| **v1** | Mock interativo com animações | Mock local (JSON) | Não | 3–5 dias | R$ 0 |
| **v2** | Chat real com LLM, sem ações | AWS mínimo | Sim (Bedrock) | 1 semana | ~US$ 50/mês |
| **v3** | + Conhecimento (RAG) e playbooks | + Knowledge Base | Sim | 1–2 semanas | ~US$ 800/mês |
| **v4** | + Ações reais (Excel, email) | + Tools + S3 + SES | Sim | 1–2 semanas | ~US$ 900/mês |
| **v5** | + Proatividade (modo shadow) | + Scanner + DynamoDB | Sim | 1–2 semanas | ~US$ 1k/mês |
| **v6** | + Qualidade e produção | + Evals + métricas + auditoria | Sim | 1–2 semanas | ~US$ 1.2k/mês |
| **v7+** | Iteração contínua | — | — | contínuo | escala com uso |

---

# 🎨 v0 — Protótipo visual estático

**Objetivo:** ver a bolinha na tela, abrir o chat, ver o layout. Ainda nada interativo.

### O que tem
- Componente de bolinha no canto inferior direito.
- Hover/clique abre painel de chat (com animação de slide).
- Layout do chat: header, área de mensagens, input, botão enviar.
- Mensagens estáticas hardcoded (uma do bot, uma do usuário) só pra ver o visual.
- Tema claro/escuro.
- Avatar e nome do bot ("Aria", "Helio", o nome que escolher — algo humano).

### O que NÃO tem
- Nenhuma interação real.
- Nenhuma animação de digitação.
- Nenhum backend.

### Stack
- React (ou framework do sistema atual) + TailwindCSS ou CSS Modules.
- Framer Motion para animações de abrir/fechar.
- Componente isolado em Storybook (opcional, mas ajuda).

### Entregável
Um arquivo HTML/JSX que abre num navegador e mostra o widget bonito. Pra mostrar pro chefe e validar visual.

---

# 🎬 v1 — Mock interativo com animações profissionais

**Objetivo:** **a experiência completa, sem nada por trás.** Você consegue conversar com o "bot", ele responde com mensagens pré-programadas, e parece **completamente real**. Isso é fundamental — vende a ideia melhor que slides.

### O que tem (a parte UX que diferencia de bot de 2020)

**Animações de chat profissionais:**
- ✍️ **Indicador "digitando..."** com 3 bolinhas pulsando (estilo iMessage/WhatsApp) antes de cada resposta.
- 🔤 **Streaming de texto caractere a caractere** simulado — a resposta aparece como se estivesse sendo escrita em tempo real.
- ⏱️ **Delay variável** entre 800ms e 2.5s antes de começar a "digitar", proporcional ao tamanho da resposta. Faz parecer que o bot está pensando.
- 📨 **Animação de entrada** das mensagens (fade + slide de baixo pra cima).
- 🔔 **Bolinha pulsando** quando há sugestão proativa nova (ripple effect azul).
- 💬 **Balão de sugestão proativa** que aparece flutuando ao lado da bolinha mesmo com chat fechado.
- ⚡ **Botões de ação rápida** dentro das mensagens ("Sim, gerar Excel", "Cancelar", "Editar mensagem").
- 📎 **Cards ricos** dentro do chat (preview de Excel gerado, preview de mensagem que será enviada ao cliente).
- ✅ **Estado de "mensagem enviada"** com checks (igual WhatsApp).
- 🎯 **Auto-scroll suave** quando nova mensagem chega.
- 🔄 **Animação de "executando ação..."** quando uma tool é "chamada" (skeleton loader).

**Fluxos mocados a implementar:**
1. Pergunta sobre regra de negócio → bot "consulta documentação" (loader) → responde com markdown + citação.
2. "Gera o Excel do cliente 123" → bot "gera arquivo" (loader) → responde com card de download.
3. "Manda cobrança pro cliente 123" → bot mostra preview da mensagem → botões [Confirmar] [Editar] [Cancelar] → loader → confirmação.
4. Sugestão proativa: ao "abrir" certa tela, bolinha pulsa → balão "Vi que esse cliente está atrasado há 30 dias…".
5. "Falar com humano" → animação de transferência → "Fernanda da equipe vai te atender".

### O que NÃO tem
- Backend real. Tudo é JSON local com `setTimeout()` simulando latência.
- LLM. Respostas são scripts pré-escritos.
- Persistência. Recarregar a página zera a conversa.

### Como mocar bem

```javascript
// fakeBot.js — exemplo de orquestração mock
const responses = {
  "como dou baixa em fatura": {
    delay: 1200,
    typingTime: 2800,
    text: "Pra dar baixa numa fatura, vai em **Financeiro → Faturas**, abre a fatura e clica em **Registrar Pagamento**...",
    citation: "Manual Financeiro v3.2 — seção 4.1"
  },
  "gerar excel cliente 123": {
    delay: 800,
    typingTime: 1500,
    text: "Beleza, gerando agora...",
    action: { type: "loader", duration: 2000, label: "Montando planilha..." },
    followUp: {
      delay: 500,
      text: "Pronto! 👇",
      card: { type: "file", name: "cliente_123.xlsx", size: "24 KB", url: "#" }
    }
  }
};

async function fakeRespond(userMessage) {
  const intent = matchIntent(userMessage);
  const response = responses[intent];

  await sleep(response.delay);
  showTypingIndicator();
  await sleep(response.typingTime);
  hideTypingIndicator();
  await streamText(response.text, 25); // 25ms por caractere
  if (response.action) await runFakeAction(response.action);
  if (response.followUp) await fakeRespond(response.followUp);
}
```

### Stack
- React + Framer Motion (animações).
- `react-markdown` para renderizar resposta.
- `lucide-react` para ícones.
- Zustand ou Context API para estado do chat.
- JSON local com 15–20 fluxos pré-roteirizados.

### Entregável
Um link de demo (Vercel/Netlify) que **engana** quem testa. A pessoa interage, o bot responde, parece real. Esse é o protótipo que você leva pro chefe pra aprovar o investimento da v2+.

> **Por que isso importa tanto:** investir 5 dias em UX mocada economiza meses de retrabalho de backend. Você descobre o que **realmente** funciona pro usuário antes de gastar com Bedrock.

---

# 🤖 v2 — Chat real com LLM (mínimo viável)

**Objetivo:** trocar o mock por LLM real. Mesma UX da v1, mas agora as respostas vêm do Claude.

### O que tem
- Tudo da v1 (animações, streaming, layout).
- API Gateway REST + Lambda Orchestrator.
- Chamada ao **Bedrock Claude Haiku 4.5** (escolha barata pro início).
- System prompt com persona definida ("você é o copiloto do sistema X, responda em português, seja direto").
- **Streaming SSE real** — agora o caractere-a-caractere vem do LLM de verdade.
- DynamoDB de sessão (histórico das últimas 10 mensagens).
- Auth via JWT do sistema atual.

### O que NÃO tem ainda
- RAG / conhecimento da empresa (bot só sabe o que está no system prompt).
- Tools / ações.
- Proatividade.
- Auditoria.

### Stack AWS mínima
- API Gateway REST
- 1 Lambda (Node.js ou Python)
- Bedrock (Haiku 4.5)
- DynamoDB (1 tabela)
- CloudWatch básico

### Custo estimado
~US$ 50/mês (10 usuários teste, baixo volume).

### Entregável
Bot responde perguntas genéricas com qualidade de Claude. Não sabe nada específico do seu sistema ainda — mas a infra está de pé.

---

# 📚 v3 — Conhecimento (RAG + playbooks)

**Objetivo:** o bot finalmente sabe **as regras da empresa**.

### O que adiciona
- Bedrock Knowledge Base com a documentação real do sistema (markdown no S3).
- Tool `consultar_conhecimento(query)` integrada via tool use.
- 2–3 **playbooks YAML** para fluxos críticos (cobrança inicial, cadastro, baixa de fatura).
- Engine de execução de playbook no Orchestrator (passo-a-passo guiado).
- Citação automática da fonte ("segundo o Manual Financeiro v3.2…").
- Upgrade do modelo: **Sonnet 4.6** para conversa, **Haiku 4.5** para classificação de intent.

### Stack AWS adicionada
- Bedrock Knowledge Base
- OpenSearch Serverless (gerenciado pela KB)
- S3 (bucket de docs)
- Bucket S3 separado para playbooks YAML versionados

### Custo
+US$ 750/mês (OpenSearch Serverless tem custo mínimo).

### Entregável
Bot responde perguntas específicas do sistema com precisão e cita fontes. Segue playbooks sem alucinar.

---

# ⚡ v4 — Ações reais (faz, não só fala)

**Objetivo:** bot executa tarefas no sistema.

### O que adiciona
- Lambdas de tools:
  - `get_cliente_info(id)` → lê RDS
  - `gerar_excel(filtros)` → monta xlsx, sobe S3, devolve URL pré-assinada
  - `enviar_email(template, destinatario, vars)` → SES
  - `abrir_tela(rota, params)` → devolve deep link pro frontend abrir
- Fluxo de **confirmação humana** com cards interativos (preview do Excel, preview do email).
- Tabela `audit_log` no RDS — toda tool call registrada.
- Validação de permissão por tool (ex.: estagiário não dispara cobrança).
- Idempotency keys para evitar envio duplicado.

### Stack AWS adicionada
- 4–6 Lambdas (uma por tool)
- S3 (bucket de artefatos com lifecycle de 7 dias)
- SES (sandbox primeiro, produção depois)
- RDS (tabela de auditoria — usa o banco existente)
- Secrets Manager (credenciais SES, DB)

### Custo
+US$ 100/mês.

### Entregável
"Manda o Excel do cliente 123 pro meu email" funciona de verdade. Email chega na sua caixa.

---

# 🔮 v5 — Proatividade (modo shadow)

**Objetivo:** bot fala primeiro, mas com rede de segurança.

### O que adiciona
- EventBridge Scheduler (a cada 1h).
- Lambda Scanner que aplica regras determinísticas no RDS:
  - Cliente sem pagamento há 30+ dias
  - Fatura vencendo em 3 dias
  - Cadastro incompleto
  - Cliente que abriu plataforma 5x sem fazer ação X
- Lambda Suggestion Generator usa Haiku para formular a mensagem em linguagem natural.
- DynamoDB `proactive_suggestions` armazena sugestões pendentes.
- Endpoint `GET /suggestions` consultado pelo widget (polling de 60s).
- **MODO SHADOW LIGADO:** sugestões são geradas e logadas, mas o widget **não exibe** ainda.
- Dashboard interno (CloudWatch + uma tela admin) onde você revisa as sugestões geradas e marca: 👍 boa / 👎 ruim / 🤔 dúbia.
- Quando a taxa de aprovação humana atingir **>80% por 1 semana**, liga modo real para usuários piloto.

### Stack AWS adicionada
- EventBridge Scheduler
- 2 Lambdas (Scanner + Generator)
- DynamoDB (tabela de sugestões com TTL)

### Custo
+US$ 50/mês (mais chamadas de Haiku).

### Entregável
Bolinha pulsa, balão aparece "Notei que o cliente Acme não fez pagamento — quer ajuda pra cobrar?". Mas só pra usuários internos no início.

---

# 📊 v6 — Qualidade e produção

**Objetivo:** garantir que está bom e fica bom com o tempo.

### O que adiciona

**Sistema de eval:**
- Dataset com 100+ casos rotulados (`pergunta` → `resposta esperada` ou `tool esperada`).
- Pipeline em GitHub Actions que roda em todo PR de prompt/playbook.
- LLM-as-judge (Sonnet 4.6) compara resposta nova com gabarito.
- Bloqueia merge se score cair abaixo do baseline.

**Feedback do usuário:**
- 👍 / 👎 em cada resposta do bot.
- Campo opcional "o que estava errado?".
- Respostas marcadas como ruins entram numa fila de revisão semanal.
- Respostas com 👍 viram candidatas a entrar no dataset de eval.

**Telemetria:**
- Dashboard CloudWatch:
  - Latência p50/p95/p99
  - Taxa de erro de tool
  - % de feedback positivo
  - Tools mais chamadas
  - Perguntas mais frequentes (cluster por embedding)
  - % de sugestões proativas que viraram ação
  - Custo por usuário/dia

**Robustez:**
- Rate limit por usuário no API Gateway.
- Bedrock Guardrails ativados (PII, tópicos proibidos, prompt injection).
- Fallback gracioso quando Bedrock cai ("estou com problemas, fala com humano?").
- Botão "falar com humano" abre ticket no sistema atual com histórico anexado.
- Onboarding in-app: primeira vez que o usuário abre, vê tour de 30s.
- Limite explícito de escopo no system prompt ("você só ajuda com X, Y, Z — recuse o resto").

**Lançamento:**
- Modo shadow → real para 5 usuários piloto.
- Reunião semanal de review com a operação.
- Subir gradualmente: 5 → 20 → 50 → 100 usuários.

### Custo
+US$ 200/mês (eval pipeline + mais tráfego).

### Entregável
Bot em produção, métricas correndo, qualidade medida e em melhoria contínua.

---

# 🚀 v7+ — Iteração contínua

**Objetivo:** virar parte indispensável do sistema.

### O que evolui

- **Mais playbooks** conforme demanda real (cada fluxo manual repetitivo vira um playbook).
- **WhatsApp** via Twilio/Meta BSP (após validar com email).
- **Memória persistente do usuário** ("você sempre prefere Excel sem cabeçalho colorido, vou gerar assim").
- **Sugestões personalizadas** baseadas em padrão de uso ("você sempre faz X às segundas, quer já preparar?").
- **Multi-modal:** subir print de erro → bot identifica e ajuda.
- **Integração com calendário** ("agenda follow-up com cliente Acme em 7 dias").
- **Resumo diário automático** ("aqui está o que aconteceu enquanto você estava fora").
- **Treinamento de novo colaborador:** modo "tutorial guiado" pra recém-contratados.
- **Voice mode** (opcional) — falar com o bot em vez de digitar.

### Sinal de sucesso
Quando alguém da operação fala "esquece, deixa eu perguntar pro [nome do bot]" antes de te interromper. Aí virou produto de verdade.

---

# 📋 Resumo das decisões por versão

| Decisão | v0 | v1 | v2 | v3 | v4 | v5 | v6 |
|---|---|---|---|---|---|---|---|
| Animação de digitação | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Streaming de texto | ❌ | ✅ (fake) | ✅ (real) | ✅ | ✅ | ✅ | ✅ |
| Backend AWS | ❌ | ❌ | ✅ mínimo | ✅ + KB | ✅ + tools | ✅ + scanner | ✅ completo |
| LLM real | ❌ | ❌ | ✅ Haiku | ✅ Sonnet+Haiku | ✅ | ✅ | ✅ |
| Conhecimento da empresa | ❌ | hardcoded | ❌ | ✅ RAG | ✅ | ✅ | ✅ |
| Executa ações reais | ❌ | fake | ❌ | ❌ | ✅ | ✅ | ✅ |
| Proatividade | ❌ | fake | ❌ | ❌ | ❌ | ✅ shadow | ✅ real |
| Métricas e evals | ❌ | ❌ | básico | básico | básico | básico | ✅ completo |
| Pronto pra produção | ❌ | ❌ | ❌ | ❌ | ❌ | piloto | ✅ |

---

# 🎯 Recomendação de execução

**Comece pela v0 + v1.** Sério. São 5–8 dias de trabalho que:
1. Validam visual e UX antes de qualquer custo de infra.
2. Geram um demo que vende a ideia internamente.
3. Te dão clareza de quais fluxos são prioritários (você descobre testando).

**Depois pule pra v2** (1 semana) só pra provar que a integração com Bedrock funciona ponta-a-ponta com SSE real. Não tente fazer mais.

**v3 e v4 podem ser combinadas** se você tiver pressa — RAG + tools básicas em 3 semanas.

**v5 é a que diferencia o produto.** Não pule, mesmo que pareça secundária. É proatividade que faz colaborador adotar.

**v6 é não-negociável antes de abrir pra usuário externo.** Sem evals e métricas, você está voando às cegas.

---

# 💡 Dica final sobre as animações da v1

O que faz parecer profissional vs. amador:

| Amador | Profissional |
|---|---|
| Resposta aparece instantânea | Delay variável (800ms–2.5s) + indicador de digitação |
| Texto inteiro aparece de uma vez | Streaming caractere a caractere (20–40ms por char) |
| Botões quadrados sem feedback | Botões com hover, ripple, estado disabled durante ação |
| Sem indicação de progresso | "Consultando documentação..." / "Gerando arquivo..." |
| Bolinha estática | Pulsing suave quando idle, bounce ao chegar sugestão |
| Mensagens aparecem sem transição | Fade + slide-up de 200ms |
| Cores genéricas | Paleta consistente, dark mode, contraste AA |
| Erro = "algo deu errado" | "Hmm, não consegui gerar agora. Quer tentar de novo ou prefere falar com humano?" |
| Sem persona | Nome, avatar, tom de voz consistente |
| Sem memória visual | Histórico claro, separadores de sessão, timestamps suaves |

**Bibliotecas que ajudam muito na v1:**
- `framer-motion` — animações fluidas
- `react-type-animation` ou implementação própria de typewriter
- `react-markdown` + `remark-gfm` — renderização rica
- `sonner` — toasts elegantes
- `cmdk` — comandos rápidos (estilo Linear)
- `radix-ui` — componentes acessíveis sem visual imposto

---

## TL;DR

**v0** (3 dias) → você vê o widget bonito.
**v1** (5 dias) → você (e o chefe) testa a UX como se fosse real, sem AWS.
**v2** (1 semana) → backend real básico, infra de pé.
**v3** (1–2 semanas) → bot sabe das regras da empresa.
**v4** (1–2 semanas) → bot executa tarefas.
**v5** (1–2 semanas) → bot fala primeiro (modo shadow).
**v6** (1–2 semanas) → qualidade medida, pronto pra produção.

Total até produção real: **~8–10 semanas** com 1 dev focado.

A v1 é a versão mais subestimada e a mais importante pra vender a ideia. Investe nela.
