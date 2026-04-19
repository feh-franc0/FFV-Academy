# Skill: marketing-video-curto

Pipeline tecnico de geracao das **4 variantes do comercial FFV Academy** (60s, formato × device). Recebe ordens do `marketing-diretor-executivo`, executa gravacao + render, delega revisao para skills especializadas.

## Invocacao

```
/marketing-video-curto <comando> [alvo]
```

| Comando | O que faz |
|---------|-----------|
| `gerar phone` / `gerar computer` / `gerar all` | Grava 12 beats no viewport correspondente |
| `render <variant>` | Renderiza uma variante especifica (Hero-H-Phone, Hero-H-Computer, Hero-V-Phone, Hero-V-Computer) |
| `render-all` | Renderiza as 4 variantes em sequencia |
| `pipeline` | `gerar all` + `render-all` |
| `avaliar <variant>` | Delega para `marketing-avaliador-retencao` |
| `iterar <variant>` | Loop avaliar → corrigir → re-render (max 3) |
| `status` | Estado: beats gravados, variantes renderizadas, ultimas notas |

---

## Matriz de 4 Variantes

| Variante | Composition ID | Dimensoes | Viewport gravado | Output |
|----------|----------------|-----------|------------------|--------|
| H-Phone | `Hero-H-Phone` | 1920×1080 | 412×915 | `out/hero-horizontal-phone.mp4` |
| H-Computer | `Hero-H-Computer` | 1920×1080 | 1920×1080 | `out/hero-horizontal-computer.mp4` |
| V-Phone | `Hero-V-Phone` | 1080×1920 | 412×915 | `out/hero-vertical-phone.mp4` |
| V-Computer | `Hero-V-Computer` | 1080×1920 | 1920×1080 | `out/hero-vertical-computer.mp4` |

---

## Pre-requisitos

1. Deps: `cd marketing && npm install && npx playwright install chromium`
2. ffmpeg: `ffmpeg -version` (se faltar: `brew install ffmpeg`)
3. Build estatico servindo em :8080:
   ```
   cd <repo-root> && npm run build && npx serve out -p 8080
   ```
   **Nunca** usar dev server Turbopack — hidratacao quebra em Playwright headless.

---

## Comandos npm disponiveis

```bash
# Gravar
npm run record -- --device=phone        # 12 beats phone (412x915)
npm run record -- --device=computer     # 12 beats computer (1920x1080)
npm run record-all                      # ambos (24 beats ~4-5min)

# Renderizar
npm run render -- --id=Hero-V-Phone     # 1 variante
npm run render-all                      # as 4 variantes

# Review
npm run extract-frames -- --id=all      # extrai 60 frames/video
npm run preview                         # Remotion Studio interativo

# Pipeline completo
npm run pipeline                        # record-all + render-all
```

---

## Mapa de Arquivos

```
marketing/
├── scripts/
│   ├── record-beats.ts        ← Playwright: 12 beats × 2 viewports = 24 clipes
│   ├── render-shorts.ts       ← Wrapper de remotion render com 4 ids
│   ├── extract-frames-short.sh
│   └── shared/state.ts        ← GAME_STATE_FULL + helpers
├── src/short/
│   ├── index.tsx              ← registerRoot com 4 Compositions
│   ├── HeroRoot.tsx           ← 60s parametrizado por {config, device, format}
│   ├── config/
│   │   ├── types.ts           ← HeroConfig, BeatRef, CaptionRef, BigNumberRef
│   │   └── hero.ts            ← Config unica com 12 beats + 18 captions + 4 numbers
│   ├── scenes/
│   │   ├── SceneBeats.tsx     ← helper: renderiza beats + captions de um slot
│   │   ├── HookScene.tsx      ← 0-3s  GlitchReveal + Particles
│   │   ├── PainScene.tsx      ← 3-7s  pills "SEM X"
│   │   ├── RevealScene.tsx    ← 7-11s LogoFormation + Spotlight
│   │   ├── FeatureFireScene.tsx  ← 11-41s 8 features em mockup 3D
│   │   ├── ProofScene.tsx     ← 41-51s NumberExplosion × 4
│   │   └── CTAScene.tsx       ← 51-60s Logo + URL pulsante + tagline
│   ├── components/
│   │   ├── DeviceMockup.tsx       ← Phone ou laptop frame 3D com tilt + float + reflexo
│   │   ├── NumberExplosion.tsx    ← Numero com shake + particle burst + glow
│   │   ├── ParticleField.tsx      ← Particulas flutuantes com twinkle
│   │   ├── GlitchReveal.tsx       ← RGB split + chromatic aberration + scanlines
│   │   ├── LogoFormation.tsx      ← Letras convergem de fora da tela com bounce
│   │   ├── SpotlightBeam.tsx      ← Feixe de luz atravessa a cena
│   │   ├── QuickCaption.tsx       ← 7 estilos (hook/normal/reward/feature/number/cta/pill) × 8 entradas
│   │   ├── PunchIn.tsx            ← 5 motions (clickZoom/punchIn/panLeft/panRight/kenBurns)
│   │   ├── VideoBeat.tsx          ← OffthreadVideo com trimStart/trimEnd
│   │   ├── BeatMarker.tsx         ← Flash branco 3 frames entre cortes
│   │   ├── ProgressBar.tsx        ← Barra de progresso no topo
│   │   └── BackgroundTrack.tsx    ← Trilha mp3 @ 0.22
│   └── styles/short-tokens.ts     ← FPS, SCENES, COLORS, FONTS, safeZoneFor, dimsFor
└── public/
    ├── beats/
    │   ├── hero-phone/       ← 12 clipes .mp4 + .json (manifest) de cada
    │   └── hero-computer/    ← 12 clipes .mp4 + .json
    └── audio/background.mp3
```

---

## Diagnostico de Falhas

| Sintoma | Causa | Correcao |
|---------|-------|----------|
| "Servidor nao responde em 8080" | Build estatico nao rodando | Terminal separado: `npm run build && npx serve out -p 8080` |
| Beat vazio (0KB) | Playwright fechou antes de run completar | Aumentar `durationMs` do beat em `scripts/record-beats.ts` |
| Mockup cortado no render | Dimensoes do frame > viewport da Composition | Ajustar `phoneHeight`/`screenWidth` em `DeviceMockup.tsx` |
| Caption fora da safe zone | Safe zone mal calibrado pra formato | Ajustar `safeZoneFor` em `short-tokens.ts` |
| NumberExplosion sem partículas | Frame > countFrames (number ja consolidou) | Aumentar `durationFrames` do BigNumberRef |
| Render com erro OffthreadVideo | MP4 nao esta yuv420p | Rodar ffmpeg manual: `ffmpeg -i beat.webm -pix_fmt yuv420p -c:v libx264 beat.mp4` |
| "anim seguinte nao aparece" | Sequence slot menor que offset + duration da caption | Conferir `SCENES[slot].duration` >= `offsetFrames + durationFrames` |

---

## Principios Tecnicos

1. **Gravacao real, nao prints** — Playwright em 2 viewports com userAgent correto para cada
2. **Config unica, 4 outputs** — HeroConfig parametrizado, 4 Compositions apenas variam `device` + `format`
3. **Trim nativo** — cada beat pode cortar dead time com trimStart/trimEnd
4. **3D reall** — DeviceMockup faz o trabalho de frame (phone ou laptop), nao cropping no browser
5. **Ritmo hardcoded** — RHYTHM.MAX_STATIC_FRAMES = 45 (1.5s). Nenhum plano passa disso
6. **Efeito com proposito** — glitch no hook, particulas no reveal/proof, explosao nos numeros, pulse no CTA
7. **Iteracao barata** — editar config e re-renderizar custa ~5min; re-gravar beats custa ~2min por viewport
