# Skill: marketing-iterador

Aplica os edits propostos pelo `marketing-critico-ritmo`, re-renderiza o short, re-extrai frames e entrega de volta para re-avaliacao. E o "operador" do loop — nao toma decisoes criativas, apenas executa com rigor.

## Invocacao

```
/marketing-iterador <ShortA|ShortB|ShortC>
```

## Pre-requisitos

Lista de edits propostos pelo critico (arquivo:linha → mudanca antes/depois).

## Protocolo de Iteracao

### Passo 1 — Validar lista de edits

Antes de aplicar qualquer coisa:
- Cada edit tem arquivo + conteudo antes/depois?
- Se edit envolve re-gravacao de beat (mudanca em `scripts/record-beats.ts`), avisar que isso e operacao cara (~60s por beat)
- Se arquivo nao existir, parar e reportar

### Passo 2 — Aplicar edits com Edit tool

Para cada edit (ordem de aplicacao definida pelo critico):

1. Ler arquivo com Read (obrigatorio antes de Edit)
2. Aplicar Edit com `old_string` = antes, `new_string` = depois
3. Se Edit falhar (string nao unica, arquivo nao encontrado) → reportar qual edit travou e pular para o proximo
4. Apos todos os edits, rodar type check rapido:
   ```bash
   cd marketing && npx tsc --noEmit 2>&1 | head -20
   ```
   Se erro → reportar, nao prosseguir com render (iteracao quebraria tudo)

### Passo 3 — Re-gravar beats se necessario

Se algum edit foi em `scripts/record-beats.ts` (mudanca de selector, acao, duracao):

```bash
cd marketing
# So re-grava o short afetado, nao os 3
npm run record-beats -- --short=<tema>
```

Verificar:
- Novos `.mp4` em `public/beats/<tema>/`
- Tamanho > 100KB
- `manifest.json` atualizado

### Passo 4 — Re-renderizar

```bash
cd marketing
npm run render-short -- --id=<ShortA|B|C>
```

Otimizacao: se o edit afetou apenas uma cena (ex: so a HookScene), pode renderizar com range `--frames=0-90` para teste rapido, depois render completo antes de aprovar.

Verificar:
- `out/short-<tema>.mp4` existe
- Duracao 45s
- Tamanho < 25MB (se passar de 25MB, investigar — codec pode estar errado)

### Passo 5 — Re-extrair frames

```bash
npm run extract-frames-short -- --id=<id>
```

Verificar 45 `.png` em `out/review-<id>/`.

### Passo 5.5 — VALIDACAO VISUAL OBRIGATORIA (gate antes de "pronto")

Antes de delegar qualquer re-avaliacao ou declarar o render como completo, este skill DEVE abrir frames-chave com Read tool e verificar cada uma destas 4 categorias. Se qualquer uma falhar, NAO reportar "pronto" — iterar.

**1) Numeros monotonicos e dentro do dominio**
- Ler frame do meio de cada numero exibido (ex: s-42, s-44, s-46, s-48 na cena Proof de 45s)
- Para cada numero N na config: verificar que o MAIOR valor exibido ≤ N
- Para numeros com `suffix === '%'`: verificar que nenhum frame mostra valor > 100
- Entre frames consecutivos do mesmo numero: valor NUNCA pode diminuir

**2) Overlays alinhados com alvo**
- Em cada frame com `UIHighlight` ativo, confirmar que a borda envolve o elemento real da UI (nao metade, nao flutuando)
- Em cada `Callout`, verificar que a seta termina em elemento visivel
- Em cada frame com `CursorTrail` + ripple, confirmar que o ripple cai sobre botao/link/CTA, nao em area vazia

**3) Cursor com trajetoria humana**
- Pegar 3 frames consecutivos durante interacao (ex: s-20, s-21, s-22)
- Cursor deve deslocar em direcao continua — nao pode sumir ou teleportar

**4) Texto visivel e dentro de safe zone**
- Nenhum caption cortado, saindo da tela, ou sobreposto a UI fixa do TikTok (top 220px, bottom 380px em vertical)

Se 1 frame reprovar: listar o defeito, aplicar correcao especifica (ajustar coordenada do overlay, corrigir config, reduzir countFrames), re-render, refazer passo 5.5. So apos passar as 4 categorias, delegar para re-avaliador.

### Passo 6 — Delegar re-avaliacao

Invocar `/marketing-avaliador-retencao <id>` para novo round.

### Passo 7 — Controle de iteracao

Rastrear contador de iteracao:
- Iteracao 1: aplicou N edits criticos. Re-avaliar.
- Iteracao 2: aplicou M edits high. Re-avaliar.
- Iteracao 3: aplicou K edits medium. Re-avaliar.
- Iteracao 4+: **parar** e reportar que nao convergiu.

Se a iteracao 3 ainda nao atingiu 4.0: reportar que o short precisa de intervencao manual (provavel problema estrutural nos beats gravados — nao ajustavel so por config).

### Output estruturado

```
## Iteracao N — ShortX

**Edits aplicados:** M/M
**Falhas:** [lista se houver]
**Re-gravacao de beats:** [sim/nao]
**Render:** ✓ out/short-<tema>.mp4 (Xs, YMB)
**Frames:** ✓ 45 frames em out/review-<id>/

### Proximo passo
Delegar para /marketing-avaliador-retencao <id>
```

---

## Principios

- **Executar, nao julgar** — criticas vem do `marketing-critico-ritmo`; este skill so aplica
- **Fail-fast** — se algum edit falha, reportar imediatamente; nao continuar cegamente
- **Type-safe** — rodar `tsc --noEmit` apos edits em arquivos .ts/.tsx
- **Nao recriar o mundo** — edits cirurgicos, nao reescritas de arquivo inteiro
- **Re-gravacao e custo real** — so re-gravar beats quando o critico marcar explicitamente (aplicar edits em config primeiro sempre que possivel)
- **Limite de 3 iteracoes** — alem disso, problema e estrutural e precisa intervencao humana
