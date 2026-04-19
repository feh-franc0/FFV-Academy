# Skill: marketing-reuniao

Orquestrador do **time de 7 especialistas de marketing** da FFV Academy. Convoca todos para debate estruturado sobre um topico (variante de video, copy, motion, numero etc), coleta pareceres, resolve conflitos e entrega ata com decisoes e action items. Substituiu a skill antiga `reuniao-marketing` (5 especialistas) pelo time novo (7).

## Os 7 especialistas

| Sigla | Skill | Papel |
|-------|-------|-------|
| **VP** | `marketing-diretor-executivo` | Presidente da reuniao. Decisao final + override |
| **PT** | `marketing-pitch` | Estrategia de mensagem, hook, beneficio vs feature |
| **CW** | `marketing-copywriter` | Escreve a copy final |
| **TY** | `marketing-typography` | Font, hierarquia, size, spacing |
| **MD** | `marketing-motion-designer` | Motion design, transicoes, efeitos, mockup |
| **AV** | `marketing-avaliador-retencao` | Retencao segundo-a-segundo |
| **CR** | `marketing-critico-ritmo` | Root cause de falhas de ritmo |

Criticos especializados (puxados on-demand dentro da reuniao):
- `marketing-critico-pitch` (valida estrategia)
- `marketing-critico-copy` (valida texto)
- `marketing-critico-tipografia` (valida tipografia)

---

## Invocacao

```
/marketing-reuniao <topico>
```

Topicos tipicos:
- `revisar-variante <Hero-V-Phone-Text>` — revisar video especifico
- `aprovar-copy` — validar novo batch de captions
- `resolver-conflito <motion-vs-typography>` — arbitrar impasse
- `planejar-campanha` — alinhar distribuicao multi-canal
- `go-no-go <variante>` — decisao final publicar sim/nao

---

## Protocolo da reuniao

### Fase 1 — Brief (VP abre)

VP define:
- Topico
- Contexto (o que foi feito)
- Pergunta-chave a responder
- Duracao-alvo da reuniao (em "rodadas", simbolicamente)

### Fase 2 — Pareceres individuais (round-robin)

Cada especialista entrega:
1. **Observacao principal** (o que viu)
2. **Ponto forte** do atual
3. **Problema critico** (se existe)
4. **Recomendacao**
5. **Voto** (aprova / aprova com ressalvas / rejeita)

Ordem canonica: PT → CW → TY → MD → AV → CR → VP (ultimo sempre).

### Fase 3 — Conflitos (se existem)

Conflito explicitado: **especialista A vs especialista B em X**.

Template:
```
**Conflito N:** MD vs CW — numero de captions no demo
- **MD:** Quer so 4 captions (motion respira)
- **CW:** Quer 8 (uma por feature, beneficio claro)
- **Impacto:** legibilidade vs saturacao
- **Resolucao proposta:** 8 captions com duracao reduzida (30f cada) — atende CW sem sufocar MD
- **Arbitragem:** VP aprova se AV confirma retencao
- **Votacao:** aprovado 5/7
```

### Fase 4 — Decisoes e action items

VP consolida:

```
## Decisoes da reuniao

1. **Decisao:** 8 captions no demo com duracao 30f cada
   **Arbitro:** VP
   **Action item:** CW gera 8 captions. TY define size e spacing. MD integra.

2. **Decisao:** Accent color para Pain muda de #f78166 para #ff6b35 (mais vibrante)
   **Arbitro:** MD
   **Action item:** atualizar COLORS.accentHot em short-tokens.ts

3. **Decisao:** Adicionar callout arrow no beat 09 (quiz XP)
   **Arbitro:** MD
   **Action item:** FeatureFireScene adicionar Callout visivel 10 frames
```

### Fase 5 — Ata final

```
## Ata Reuniao Marketing — <topico>

**Data:** YYYY-MM-DD
**Presentes:** VP, PT, CW, TY, MD, AV, CR
**Convidados:** [criticos especializados se convocados]
**Duracao:** N rodadas

### Topico
[1 frase]

### Pareceres
[tabela com voto de cada especialista]

### Conflitos
[lista]

### Decisoes
[lista numerada com arbitro + action item]

### Proximo passo
Delegar para `marketing-iterador` para aplicar as decisoes e re-renderizar.
```

---

## Regras de votacao

- **Unanime (7/7):** aprovacao direta sem VP override
- **Maioria simples (4-6):** VP decide (pode seguir maioria ou overrider com justificativa)
- **Empate (3-4 or 4-3):** VP unilateral
- **Rejeicao (5+ contra):** volta pra copywriter/pitch/motion refazer

## Autoridade do VP

VP pode:
- Override uma decisao de maioria com justificativa escrita
- Convocar criticos especializados mid-reuniao
- Encerrar a reuniao sem consensus e decidir sozinho (ultima instancia)

VP NAO pode:
- Pular o parecer dos 6 especialistas (reuniao tem que escutar antes de decidir)
- Decidir tema fora do brief

---

## Exemplo completo

```
/marketing-reuniao revisar-variante Hero-V-Phone-Text

## Brief (VP)
Variante ja renderizada. Retencao do avaliador: 4.2/5. Pain score: 22/30 (borderline).
Pergunta-chave: publicar ou iterar?

## Pareceres

### PT (pitch)
- Observ: pain score 22 causado por caption demo-5 feature-drop
- Ponto forte: hook + cta fortes
- Problema: demo tecnico demais pra audiencia generica
- Recomendacao: reescrever demo-5,6 para beneficio
- Voto: ❌ reject publicacao

### CW (copywriter)
- Observ: 7 das 8 captions aprovadas
- Problema: "artigos com TOC, seções, primitivos" viola regra 1 (>=6 palavras)
- Recomendacao: "leitura fluida em PT-BR" (4 pal)
- Voto: ❌ reject

### TY (typography)
- Observ: todas dentro safe zone
- Problema: demo-5 letter-spacing 1, poderia ser 2 (ALL CAPS padrao)
- Recomendacao: ajustar
- Voto: ⚠️ ressalvas

### MD (motion)
- Observ: motion design 9/10
- Ponto forte: DeviceMockup iPhone 16 Pro Max impecavel
- Voto: ✅ approve

### AV (retention)
- Observ: 4.2/5 — aprovado
- Voto: ✅ approve

### CR (ritmo)
- Observ: ritmo ok
- Voto: ✅ approve

### VP (presidente)
- Observ: 3 approves + 2 rejects + 1 ressalva = maioria nao clara
- **Override:** seguir recomendacao de PT+CW (rejeicao)
- Justificativa: caption demo-5 e critica para conversao

## Decisao
REJEITAR publicacao. Iterar demo-5 e demo-6.

## Action items
1. CW gera 3 variantes para demo-5 e demo-6
2. TY valida size/spacing
3. Iterador aplica + re-render
4. Nova reuniao para aprovar

## Proximo passo
/marketing-iterador Hero-V-Phone-Text
```

---

## Integracao com pipeline

Reuniao acontece depois de:
1. `marketing-video-curto gerar` (video existe)
2. `marketing-avaliador-retencao` (retention metrics)
3. `marketing-critico-ritmo` (pacing findings)

E antes de:
1. `marketing-iterador` (aplica decisoes)
2. Re-render
3. Publicacao

---

## Quando NAO convocar

- Decisao tecnica trivial (so VP basta)
- Ajuste cosmetico (MD sozinho)
- Correcao de typo (CW sozinho)

Reuniao e pra decisoes multi-disciplinares com conflito ou alto impacto.
