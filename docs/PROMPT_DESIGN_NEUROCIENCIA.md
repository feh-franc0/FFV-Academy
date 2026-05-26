# 🧠 Princípios neurocientíficos pra design de prompts de signup

> **Regra de ouro:** todo prompt deve ALAVANCAR o cérebro do usuário no sentido dos interesses dele (acelerar uma decisão útil) — nunca MANIPULAR (forçar contra o interesse). Persuasão sustentável vs manipulação destruidora de marca. Cialdini, Pre-Suasion (2016).

Este documento é a referência canônica de como projetamos pedidos de login / signup / captura de lead na FFV Academy. Baseado nas evidências da trilha `/neurociencia` (Schultz, Berridge, Kahneman, Cialdini, Knutson, Damásio).

---

## 1. Os 5 momentos fisiologicamente certos de pedir signup

| Momento | Mecanismo neural | Por que funciona |
|---------|------------------|------------------|
| **Pós-leitura (≥75% scroll)** | Efeito Pico-Fim + Reciprocidade | User absorveu conhecimento gratuito → cérebro límbico em estado positivo + sente leve obrigação de retribuir |
| **Pós-onboarding personalizado** | Dopamina antecipatória + Endowment | A "trilha personalizada" já parece SUA → perdê-la dói (aversão à perda 2x) |
| **Bookmark/curtida anônimo** | Endowment + cognitive ease | Ato de "salvar" já criou pertencimento → criar conta é só formalizar |
| **Streak 3+ dias anônimo** | Aversão à perda | "Vou perder esse streak se mudar de dispositivo" — perda dói mais que ganho |
| **Quiz inline pós-aprendizado** | Cognitive ease + dopamina de recompensa | Quer marcar o XP que acabou de "ganhar" |

---

## 2. Os 5 anti-padrões PROIBIDOS

> Todo anti-padrão abaixo funciona no curtíssimo prazo (clique conta) mas DESTRÓI confiança a longo prazo. Causa: viola o alinhamento "interesse real do consumidor" (Pre-Suasion §10).

1. **❌ Pop-up modal que bloqueia conteúdo**
   *Bug neural:* ativa reptiliano em modo ameaça (cortisol). User aprende a fechar reflexivamente — banner blindness institucional. Solução: prompts inline no fluxo do conteúdo.

2. **❌ Urgência fake ("Últimas 3h pra criar conta")**
   *Bug neural:* funciona se for REAL; destrói confiança se descoberto fake. Detecção é trivial: user volta no dia seguinte e vê mesmo banner. Solução: zero urgência artificial em CTAs grátis.

3. **❌ Dark pattern de dismiss escondido (X minúsculo / linguagem culposa)**
   *Bug neural:* user clicou no CTA não-desejado → cria associação negativa com a marca (amígdala etiqueta como armadilha). Solução: dismiss tão visível quanto o CTA, copy neutro ("agora não" / "explorar sem conta").

4. **❌ Repetir o MESMO prompt em loop sem cooldown**
   *Bug neural:* tolerância dopamínica — mesmo estímulo repetido perde força E gera irritação (límbico negativo). Solução: cooldown de 72h+ após dismiss; máximo 1 prompt por sessão.

5. **❌ Linguagem técnica/imperativa ("Cadastre-se!", "Crie conta!")**
   *Bug neural:* neocórtex em alerta — soa como demanda. Cognitive ease zero. Solução: linguagem de BENEFÍCIO ("Salve seu progresso") + reforço gratuito ("30s · sem cartão").

---

## 3. Receita de copy — fórmula validada

```
HEADLINE (gancho — 1 linha, captura pico-fim emocional)
   ↓
BENEFÍCIOS CONCRETOS (3 bullets — neocórtex, alivia ínsula de pagar)
   ↓
PROVA SOCIAL OPCIONAL (1 linha — Cialdini)
   ↓
CTA PRIMÁRIO + CTA SECUNDÁRIO (escolha respeitosa)
   ↓
ANCORAGEM DE BAIXO CUSTO (1 linha — "30s · sem cartão · sem senha")
```

### Exemplo aplicado: post-leitura

```
🎯 Que tal salvar esse progresso de leitura?
                                       [pico-fim — celebra ação concluída]

   Crie conta gratuita pra:
   ✓ Ganhar XP por cada artigo lido      [dopamina antecipatória]
   ✓ Continuar de onde parou em qualquer dispositivo
                                       [aversão à perda implícita]
   ✓ Receber trilha personalizada       [endowment futuro]

   Mais de 1.200 devs já estão acompanhando seu progresso aqui.
                                       [prova social — número real]

   [Criar conta grátis →]   [continuar sem conta]
                                       [escolha respeitosa]

   30 segundos · sem cartão · sem senha
                                       [ancoragem de baixo custo]
```

### Por que cada palavra:

- **"Que tal"** — convite, não imperativo. Neocórtex relaxa.
- **"salvar"** — verbo de PROTEÇÃO. Ativa aversão à perda sem mencionar perda explicitamente.
- **"esse progresso"** — possessivo. Endowment effect (Thaler 1990): user já trata como SEU.
- **"gratuita"** — palavra-chave anti-dor-de-pagar (Knutson 2007). Suprime ínsula.
- **3 bullets exatos** — Lei de Hick: mais que 7 paralisa, 3 é digerível em S1.
- **Número real** — prova social verificável. Mentir aqui é catastrófico se descoberto.
- **"continuar sem conta"** — não "cancelar" (negativo) nem "fechar" (frio). Linguagem positiva pra ambos os caminhos.
- **"30 segundos"** — ancoragem temporal. Reduz dor antecipada de "ficar preenchendo cadastro".

---

## 4. Timing — quando exibir (e quando NÃO)

### Pós-leitura (PostReadSignupCta)

✅ **MOSTRA** se TODAS as condições:
- User anônimo (não logado)
- Atingiu ≥75% do scroll do módulo
- Permaneceu ≥30 segundos no módulo (filtra scroll automático/bot)
- Houve pausa de ≥3 segundos sem interação (não interrompe leitura ativa)
- Não dismissou nas últimas 72h (cooldown)
- Não mostrou outro prompt na mesma sessão

❌ **NÃO MOSTRA** se:
- User já logou
- Já completou o módulo (SyncBanner cobre esse caso)
- User está em rota admin/marketing (`/admin`, `/sobre`, etc.)
- `prefers-reduced-motion: reduce` está ativo E o usuário desativou prompts (futuro: respeitar)

### Pós-onboarding

✅ Aparece SEMPRE no fim do OnboardingModal de 3 passos.
✅ É o ÚNICO ponto onde push é justificado (user voluntariamente entrou no wizard).
❌ Mas SE dismissar, não voltar a aparecer (1 chance só — Cialdini §3 compromisso).

---

## 5. Métricas obrigatórias por prompt

Todo prompt novo DEVE rastrear:

| Evento | Quando | Props |
|--------|--------|-------|
| `cta.shown` | Componente entra em viewport | `id: 'post_read_signup'`, `trigger: 'scroll_75'`, `module_slug` |
| `cta.clicked` | User clica no CTA primário | `id`, `outcome: 'signup_started'` |
| `cta.dismissed` | User clica em dismiss/cancel | `id`, `time_visible_sec: 12` |
| `cta.converted` | User completou signup vindo desse prompt | `id` (via funnel join em backend) |

Com isso, calculamos:
- **CTR**: `clicked / shown`
- **Conversion rate**: `converted / shown`
- **Dismiss rate**: `dismissed / shown`
- **Tempo médio até dismiss**: distribuição de `time_visible_sec`

---

## 6. Hierarquia de prompts — qual prevalece se múltiplos elegíveis

Ordem decrescente de prioridade (apenas 1 visível por vez):

1. **Pós-onboarding** (intenção explícita)
2. **Streak threatened** (urgência REAL)
3. **Pós-leitura** (oportunidade)
4. **Sync banner** (já tem progresso)
5. **PWA install** (nivel de polish)

`<ActivePromptManager>` (futuro) seleciona um e silencia os demais.

---

## 7. Checklist antes de mergear novo prompt

- [ ] Headline em formato de BENEFÍCIO (não imperativo)
- [ ] CTA primário menciona "grátis" ou equivalente
- [ ] CTA secundário existe e é tão visível quanto primário
- [ ] Cooldown configurado (mínimo 72h)
- [ ] Max 1x por sessão
- [ ] Trackeia `cta.shown`, `cta.clicked`, `cta.dismissed`
- [ ] Não bloqueia scroll/conteúdo
- [ ] Funciona com `prefers-reduced-motion`
- [ ] A11y: aria-label, role="dialog" se modal, focus management
- [ ] Testado em mobile (não corta viewport)
- [ ] Copy revisado por alguém DIFERENTE de quem implementou

---

## 8. Referências acadêmicas

- Kahneman & Tversky (1979) — Aversão à perda · Teoria do Prospecto
- Schultz (1997) — Dopamina antecipatória em macacos
- Berridge & Robinson (1998) — Wanting vs Liking
- Kahneman (2002) — Sistemas 1 e 2 (Nobel)
- Knutson et al. (2007) — Pain of paying via fMRI (Stanford)
- Cialdini (1984, 2016) — 6 princípios + ética em Pre-Suasion
- Thaler & Kahneman (1990) — Endowment effect (caneca)
- Iyengar (2000) — Paradox of choice (geleias)
- Nielsen — Banner blindness (1997-2020)
- Damásio (1994) — Razão sem emoção = paralisia decisória

---

**Versão:** 1.0 (mai/2026)
**Autor:** FFV Engineering · baseado na trilha `/neurociencia` que vendemos como produto.
**Reviewer:** todo PR de novo prompt deve referenciar este doc.
