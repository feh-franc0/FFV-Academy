# Skill: marketing-producao

Pipeline completo de producao do video promocional FFV Academy. Um unico comando gera o video, e um loop critico com 5 experts analisa e auto-corrige ate ficar profissional.

## Invocacao

```
/marketing-producao [comando]
```

| Comando | O que faz |
|---------|-----------|
| `all` | **Pipeline institucional 80s 16:9**: gera video + review + auto-correcao. Resultado: promo.mp4 pronto. |
| `video` | So gera o video 80s (sem review). Equivale a `npm run video`. |
| `review` | Analisa video 80s existente com 5 experts e corrige problemas. |
| `short [quiz\|progresso\|srs\|all]` | **Pipeline short 9:16** (TikTok/Reels). Delega para `/marketing-video-curto` — gera shorts de 45s com gravacao real. Ver skill dedicada para detalhes. |
| `status` | Estado dos dois pipelines (institucional + shorts). |

---

## Comando `short` — Pipeline Short-form 9:16

Delega totalmente para a skill `/marketing-video-curto` que orquestra gravacao real (Playwright), composicao 9:16 (Remotion), e loop de avaliacao (`marketing-avaliador-retencao` → `marketing-critico-ritmo` → `marketing-iterador`).

Exemplos:
- `/marketing-producao short quiz` → gera + itera o Short A (Quiz Hook)
- `/marketing-producao short all` → gera + itera os 3 shorts

Pipeline institucional 80s e shorts 9:16 sao independentes — geracao de shorts nao afeta `out/promo.mp4`.

---

## Comando `all` — Pipeline Institucional (80s 16:9) com Auto-Correcao

### O que faz automaticamente:

```
PASSO 1: GERAR VIDEO
│
├── Roda: cd marketing && bash scripts/one-click.sh
│   (inicia server → captura 25 screenshots → renderiza 90s MP4 → para server)
│
├── Verifica: out/promo.mp4 existe e tem > 5MB
│   ├── Se SIM → vai pro passo 2
│   └── Se NAO → diagnostica erro, corrige, retenta (max 3x)
│
PASSO 2: EXTRAIR FRAMES PARA REVIEW
│
├── Roda: bash scripts/extract-frames.sh
│   (extrai 14 frames-chave do video: 1 por cena + transicoes)
│
├── Verifica: 14 PNGs em out/review/
│
PASSO 3: REVIEW CRITICO (5 EXPERTS)
│
├── Le cada frame extraido com a ferramenta Read (Claude ve imagens)
│
├── Para CADA frame, os 5 experts avaliam:
│   ├── DC (Diretor Criativo): "O beat emocional esta correto?"
│   ├── CW (Copywriter): "O texto esta legivel, correto e impactante?"
│   ├── DM (Designer Motion): "Composicao, contraste e cores estao profissionais?"
│   ├── PT (Produtor Tecnico): "Resolucao, artefatos, frames pretos?"
│   └── ES (Estrategista): "Isso converte? O hook para o scroll?"
│
├── Nota 1-5 por expert por frame
│   ├── Media >= 4.0 por frame → APROVADO ✅
│   └── Media < 4.0 → REPROVAR e identificar problema
│
PASSO 4: AUTO-CORRECAO (se necessario)
│
├── Para cada frame reprovado:
│   ├── Identifica a CENA com problema (Hook? Features? CTA?)
│   ├── Identifica o TIPO de problema:
│   │   ├── Screenshot ruim → re-captura SO esse screenshot
│   │   ├── Texto ilegivel → ajusta TextOverlay (fontSize, posicao, shadow)
│   │   ├── Transicao brusca → ajusta spring/interpolate no SceneTransition
│   │   ├── Timing errado → ajusta frameIn/frameOut na cena
│   │   ├── Cores erradas → corrige nos tokens ou no componente
│   │   └── Tela preta → corrige Sequence timing no Root.tsx
│   │
│   ├── Aplica correcao (edita o arquivo TSX correspondente)
│   ├── Re-renderiza o video: npm run render
│   └── Re-extrai frames e re-avalia
│
├── Loop de correcao: max 3 iteracoes
│   ├── Iteracao 1: Correcoes maiores (layout, screenshots, timing)
│   ├── Iteracao 2: Ajustes finos (contraste, posicao de texto)
│   └── Iteracao 3: Polimento final (detalhes minimos)
│
PASSO 5: APROVACAO FINAL
│
├── Se todos os frames >= 4.0/5 → VIDEO APROVADO 🎉
├── Gera relatorio final com nota por cena
├── Lista: out/promo.mp4, out/thumbnail.png
└── Mostra copy de distribuicao (LinkedIn, YouTube, Twitter)
```

---

## Protocolo de Execucao Detalhado

### Ao receber `/marketing-producao all`:

#### 1. Gerar video
```bash
cd /Users/fernandofranco/Developer/fernandofrancovalledotcom/marketing
bash scripts/one-click.sh
```

Se falhar, ler o erro e corrigir:
- "Dev server nao iniciou" → verificar se porta 3000 esta ocupada (`lsof -i :3000`)
- "Screenshot falhou" → aumentar delay no capture.ts, verificar seletor
- "Bundle failed" → ler erro TypeScript, corrigir componente
- "Render failed" → verificar ffmpeg, tentar CRF diferente

#### 2. Extrair frames
```bash
bash scripts/extract-frames.sh
```

#### 3. Review critico — COMO ANALISAR CADA FRAME

Para cada frame em `out/review/`, usar a ferramenta Read para ver a imagem.

**Checklist por frame:**

| Criterio | O que verificar | Acao se falhar |
|----------|----------------|----------------|
| Tela preta? | Frame e 100% preto ou quase preto | Corrigir timing da Sequence no Root.tsx |
| Texto visivel? | Headline aparece e e legivel | Ajustar frameIn/frameOut no TextOverlay |
| Texto correto? | Sem erros de portugues, acentos ok | Corrigir texto no componente da cena |
| Screenshot aparece? | A tela da plataforma e visivel | Verificar nome do arquivo em ScreenFrame |
| Contraste ok? | Texto legivel sobre screenshot | Aumentar overlay opacity ou text shadow |
| Cores on-brand? | Azul #58a6ff, verde #3fb950, etc | Corrigir cor no componente |
| Composicao limpa? | Nao esta poluido nem vazio | Ajustar posicao/tamanho do texto |
| Transicao suave? | Sem corte brusco entre cenas | Ajustar enterDuration/exitDuration |

**Formato de avaliacao por frame:**

```
### Frame XX — [nome da cena] (Xs do video)

[Ler imagem com Read tool]

| Expert | Nota | Observacao |
|--------|------|-----------|
| DC | X/5 | ... |
| CW | X/5 | ... |
| DM | X/5 | ... |
| PT | X/5 | ... |
| ES | X/5 | ... |
| **Media** | **X.X/5** | **APROVADO/REPROVADO** |

[Se reprovado]
**Problema:** [descricao]
**Correcao:** [acao no arquivo X, linha Y]
```

#### 4. Auto-correcao

Quando um frame e reprovado:

1. Identificar o arquivo fonte:
   - Hook → `src/scenes/HookScene.tsx`
   - Problema → `src/scenes/ProblemScene.tsx`
   - Revelacao → `src/scenes/RevealScene.tsx`
   - Features → `src/scenes/FeaturesScene.tsx`
   - Prova → `src/scenes/ProofScene.tsx`
   - CTA → `src/scenes/CTAScene.tsx`
   - Qualquer → `src/styles/tokens.ts` (timing), `src/Root.tsx` (sequencing)

2. Aplicar a correcao com Edit tool

3. Re-renderizar:
```bash
cd marketing
npx remotion render src/index.tsx PromoVideo out/promo.mp4 --codec h264 --crf 18
```

4. Re-extrair frame especifico:
```bash
ffmpeg -ss [SEGUNDO] -i out/promo.mp4 -frames:v 1 -y out/review/[NOME].png
```

5. Re-avaliar o frame

#### 5. Aprovacao final

Quando TODOS os 14 frames tem media >= 4.0:

```
## 🎬 Video Promocional FFV Academy — APROVADO

**Status:** ✅ Aprovado pelos 5 experts
**Iteracoes:** [N] correcoes realizadas
**Nota media final:** X.X/5

### Notas por Cena
| Cena | Nota | Status |
|------|------|--------|
| Hook | X.X/5 | ✅ |
| Problema | X.X/5 | ✅ |
| Revelacao | X.X/5 | ✅ |
| Features (7) | X.X/5 | ✅ |
| Prova | X.X/5 | ✅ |
| CTA | X.X/5 | ✅ |

### Arquivos Finais
- 📹 marketing/out/promo.mp4 (~90s, 1080p)
- 🖼️ marketing/out/thumbnail.png

### Copy de Distribuicao

**LinkedIn:**
Passei meses criando algo que gostaria que existisse quando comecei.
168 artigos tecnicos. 16 trilhas. IA, AWS, Engenharia, Claude.
Sem cadastro. Sem paywall. Gamificacao que funciona.
FFV Academy — de curioso a especialista.
fernandofrancovalle.com

**YouTube titulo:**
FFV Academy — Plataforma Gratuita para Devs | IA, AWS, Engenharia

**Twitter:**
168 artigos. 16 trilhas. 100% gratuito. Sem cadastro.
IA, AWS, Docker, Kubernetes, Claude — tudo em PT-BR.
fernandofrancovalle.com
```

---

## Comando `review` — Analisa Video Existente

Se o video ja existe (`out/promo.mp4`), pula direto para:
1. Extrair frames
2. Review critico
3. Auto-correcao
4. Re-render se necessario

Uso: quando voce ja gerou o video e quer melhorar a qualidade.

---

## Comando `status` — Estado Atual

Verifica e reporta:
- [ ] Dev server rodando?
- [ ] Screenshots capturados? Quantos? Tamanho?
- [ ] Remotion compila?
- [ ] Video existe? Duracao? Tamanho?
- [ ] Thumbnail existe?
- [ ] Frames de review extraidos?

---

## Mapa de Arquivos do Pipeline

```
marketing/
├── scripts/
│   ├── one-click.sh          ← ENTRY POINT: gera video completo
│   ├── capture.ts            ← Puppeteer: 25 screenshots com interacao
│   ├── extract-frames.sh     ← Extrai 14 frames para review
│   ├── build-all.ts          ← Pipeline tecnico com validacao
│   ├── validate.ts           ← Funcoes de validacao por fase
│   └── validate-cli.ts       ← CLI de validacao standalone
├── src/
│   ├── index.tsx             ← Entry Remotion (registerRoot)
│   ├── Root.tsx              ← Composicao: 6 Sequences, 90s
│   ├── components/           ← ScreenFrame, TextOverlay, SceneTransition
│   ├── scenes/               ← 6 cenas (Hook→Problema→Reveal→Features→Proof→CTA)
│   └── styles/tokens.ts      ← Cores, fontes, timing
├── public/screenshots/        ← 25 screenshots reais (Puppeteer output)
├── out/
│   ├── promo.mp4             ← VIDEO FINAL
│   ├── thumbnail.png         ← Frame 24s para plataformas
│   └── review/               ← 14 frames-chave para analise
└── package.json              ← npm run video = one-click.sh
```

## Principios

- **Um comando, um video** — `bash scripts/one-click.sh` faz tudo
- **Review visual real** — Claude le cada frame como imagem e avalia
- **Auto-correcao** — identifica problema, edita codigo, re-renderiza
- **Max 3 iteracoes** — nao loop infinito
- **5 experts, cada um no seu dominio** — DC narrativa, CW copy, DM visual, PT tecnico, ES conversao
- **Evidencia visual** — toda decisao e baseada em frame real, nao em suposicao
