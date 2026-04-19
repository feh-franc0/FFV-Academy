## Reunião de Marketing #7 — 8 Vídeos Hero (validação dura de números e overlays)

**Data:** 2026-04-18
**Tópico:** Gerar as 8 variantes do comercial Hero 60s com regras novas de integridade numérica e validação visual obrigatória pós-render
**Presidente:** VP · **Presentes:** PT, CW, TY, MD, AV, CR · **Convidados on-demand:** crítico-copy, crítico-tipografia
**Duração:** 4 rodadas
**Decisão final:** APROVADO — render das 8 variantes autorizado com gates de validação visual ativos

---

### Brief (VP)

Fernando pediu 8 vídeos referentes à FFV Academy. Escopo já cristalizado no `marketing-diretor-executivo`: 4 variantes sem texto (motion puro) + 4 variantes com texto, cruzando 2 formatos (H/V) × 2 devices (phone/laptop). Diretivas duras do briefing:

1. **Números sobem. Sempre.** Nunca overshoot que ultrapasse o valor real. Nunca > 100% em percentuais.
2. **Valores batem com o produto.** Se o currículo tem X módulos, o vídeo mostra X — não inventa "muito mais".
3. **Overlays validados visualmente.** Quadrados de highlight, cliques, setas, cursor — nenhum pode estar desalinhado. Validação de frame obrigatória antes de declarar vídeo pronto.

Pergunta-chave: **as 8 variantes estão prontas para render end-to-end com os gates novos ativos?**

---

### Pareceres individuais (round-robin)

#### PT — Pitch

- **Observação principal:** Arco H-P-R-D-P-C está sólido. Hook provocativo ("QUER APRENDER IA DE VERDADE?"), Pain com os 3 "SEM", Reveal com logo formation, Demo fire nas 8 features, Proof com 4 números, CTA. Nada a reformular estrategicamente.
- **Ponto forte:** `GRATUITO · SEM CADASTRO · SEM PAYWALL` continua matador no CTA — vende por especificidade.
- **Problema crítico:** O número de `ARTIGOS` estava em 140 na config — obsoleto. Produto tem 157. Desonestidade acidental passa como marketing descuidado.
- **Recomendação:** Corrigir `hero.ts` para `value: 157`. Fundamentar semantic truth: rodar `CURRICULUM.reduce((a,t)=>a+t.modules.length,0)` toda vez que atualizar.
- **Voto:** ✅ aprova (após correção numérica — que já foi aplicada no ato).

#### CW — Copywriter

- **Observação principal:** Captions das 4 variantes com texto já carregam o vídeo em mute. Features, Pain pills e CTA tagline estão no ponto.
- **Ponto forte:** "SEM curso de 2 mil" / "SEM paywall" / "SEM enrolação" — trio que nomeia a dor sem melindre.
- **Problema crítico:** Caption do Reveal ("a plataforma gratuita para devs sérios") tem 42 caracteres — dentro da safe zone, mas no formato vertical phone pode encostar nas bordas. Crítico-tipografia precisa validar após render.
- **Recomendação:** Manter. Validar safe zone frame-a-frame pós-render.
- **Voto:** ⚠️ aprova com ressalva (validar no frame).

#### TY — Typography

- **Observação principal:** `FONTS.heading = Poppins 900`, `FONTS.body = Inter`. Hierarquia clara: hook 132px, pain pills 68px, feature caption 72-88px, numbers 400px.
- **Ponto forte:** `letterSpacing: -12` no NumberExplosion dá peso editorial aos 4 números sem comprometer legibilidade.
- **Problema crítico:** 4 variantes com texto em formato vertical (1080×1920) precisam ter `safeZoneFor` respeitado — top 220px, bottom 380px.
- **Recomendação:** Abrir frame de amostra de cada variante vertical com texto logo após render, checar se captions do Demo ficam dentro de `safeZoneFor('vertical')`.
- **Voto:** ✅ aprova condicionado à inspeção visual pós-render.

#### MD — Motion Designer

- **Observação principal:** `NumberExplosion.tsx` foi corrigido. Agora é estritamente monotônico (0 → target com `Math.floor(target * ease)`), cap em 100 quando suffix é '%'. O "punch de dopamina" agora vive em scale/shake/glow — não no valor numérico.
- **Ponto forte:** A mudança preserva completamente o impacto visual (overshoot no SCALE e no GLOW continua forte) enquanto elimina a mentira numérica.
- **Problema crítico:** `FeatureFireScene.tsx` tem `UIHighlight` e `CursorTrail` com coordenadas HARDCODED (0.5, 0.58 etc.) que dependem do layout real do beat gravado. Se o beat renderizar com UI em posição diferente, o overlay cai no vazio. Esse é exatamente o caso que o Fernando reportou.
- **Recomendação:** Executar render completo. Logo após, extrair frames do Demo (frames 560-900) e verificar se o `UIHighlight` do XP e do Streak enquadra o elemento real da UI. Se desalinhado: (a) ajustar coord, (b) remover aquele highlight específico, (c) reduzir duração.
- **Voto:** ✅ aprova o render, ⚠️ veto de publicação se overlays estiverem desalinhados na inspeção pós-render.

#### AV — Avaliador de retenção

- **Observação principal:** Nota estrutural boa — arco HPRDPC balanceado, particulas em todas as cenas, BeatMarker entre beats do Demo.
- **Ponto forte:** 8 beats do Demo com motion alternado (punchIn/panLeft/panRight/kenBurns/clickZoom) — nenhum plano ultrapassa 1.5s sem mudança visual (RHYTHM.MAX_STATIC_FRAMES = 45).
- **Problema crítico:** Com os novos red flags #8–#15 (números não-monotônicos, percentual > 100, overlays desalinhados, cursor teleportando), qualquer vídeo renderizado hoje pode disparar um desses — ainda não foi validado visualmente.
- **Recomendação:** Após render, abrir frames 42-51 de cada variante (cena Proof) para números, e frames 18-30 (Demo) para overlays/cursor. Qualquer red flag CRÍTICO reprova a variante.
- **Voto:** ✅ aprova o gate, pendente de inspeção.

#### CR — Crítico de ritmo

- **Observação principal:** Cada beat tem 112-116 frames (3.7-3.9s). Aceitável para Demo. Hook 90 frames (3s), Pain 120 frames (4s), Reveal 120 frames (4s), Proof 300 frames (10s = 75 × 4), CTA 270 frames (9s). Total: 1800 frames = 60s. Math confere.
- **Ponto forte:** Transições com BeatMarker no Demo evitam o "corte frio" que mata ritmo.
- **Problema crítico:** `h-09-quiz-xp` usa `playbackRate: 1.3` — acelera 30%. Precisa conferir se o beat gravado tem duração suficiente para compensar o speedup (senão termina em branco).
- **Recomendação:** Verificar `trimEnd: 4.0` em conjunto com playbackRate 1.3 após a gravação.
- **Voto:** ✅ aprova.

#### VP — Presidente

- **Síntese:** 5 aprovações diretas + 2 aprovações condicionadas a validação visual pós-render. Nenhuma rejeição. Unânime sujeito ao gate de inspeção.
- **Decisão:** Autorizar render das 8 variantes imediatamente com inspeção visual obrigatória pós-render antes de declarar "pronto".

---

### Conflitos e resoluções

#### Conflito 1: MD vs VP — Manter ou remover UIHighlights com coordenadas hardcoded

- **MD:** Coordenadas chutadas podem cair no vazio. Melhor remover do que ter highlight errado.
- **VP:** Remover mata sinal de "ferramenta em uso". Melhor renderizar, inspecionar e corrigir cirurgicamente se errar.
- **Resolução:** Render com os highlights atuais. Pós-render, inspeção visual obrigatória. Se qualquer highlight estiver desalinhado em >= 2 variantes, remove o highlight do scene (fallback) e re-renderiza. Vive no radar da próxima iteração.

#### Conflito 2: PT vs CW — Usar "157 artigos" ou "160+ artigos"

- **PT:** "157 artigos" é semantic truth. Nunca mentir.
- **CW:** "160+" tem melhor ritmo oral, mas arredonda pra cima — viola regra nova do Fernando.
- **Resolução:** "157 ARTIGOS" vence. VP override: integridade > cadência retórica. Se futuramente passar de 160, atualiza a config.

---

### Decisões consolidadas

1. **Hero.ts corrigido para `value: 157`** — aplicado no ato. Arbitro: VP.
2. **NumberExplosion.tsx refatorado** — monotônico + cap em 100%. Arbitro: MD. Já aplicado.
3. **Skill `marketing-diretor-executivo` atualizada** — checklist vai de 15 para 19 pontos, com 4 red flags CRÍTICOS (🚨).
4. **Skill `marketing-avaliador-retencao` atualizada** — 8 novos red flags (#8 a #15).
5. **Skill `marketing-iterador` atualizada** — Passo 5.5 obrigatório: inspeção visual pós-render antes de delegar.
6. **Skill `marketing-motion-designer` atualizada** — regras 6-14 (números, overlays, validação).
7. **Render das 8 variantes autorizado** — com gate de inspeção.
8. **Memory atualizada** — `feedback_marketing_numeros.md` e `feedback_marketing_validacao_visual.md` criadas. MEMORY.md indexa. `project_curriculum_status.md` atualizado (135 → 157).

### Action items

| # | Quem | O quê | Status |
|---|------|-------|--------|
| 1 | VP | Autorizar render | ✅ feito |
| 2 | Produção | Build estático + serve 8080 | em curso |
| 3 | Produção | `npm run record-all` (24 beats) | pendente |
| 4 | Produção | `npm run render-all` (8 variantes) | pendente |
| 5 | MD + AV | Extrair frames + validar números e overlays nas 8 variantes | pendente |
| 6 | VP | Aprovar cada variante conforme checklist 19-pontos | pendente |

---

### Próxima reunião

**Número:** 8 (pós-render)
**Tópico:** Revisar os 8 frames de Proof + 8 frames de Demo com overlays. Aprovar ou iterar.
**Trigger:** Quando `record-all` + `render-all` + `extract-frames --id=all` concluírem nas 8 variantes.
