# Skill: marketing-avaliador-retencao

Avalia um short 9:16 da FFV Academy **segundo-a-segundo** sob a otica de retencao em TikTok/Reels. Diferente do avaliador do pipeline institucional (`marketing-producao`) que analisa frame-por-cena, este opera com granularidade de 1 frame/segundo (45 amostras em 45s).

## Invocacao

```
/marketing-avaliador-retencao <ShortA|ShortB|ShortC>
```

## Pre-requisitos

Frames ja extraidos em `out/review-<id>/s-01.png` ... `s-45.png` (roda `npm run extract-frames-short -- --id=<id>` antes).

## Protocolo de Avaliacao

### Criterios ponderados

| # | Criterio | Peso | O que avaliar |
|---|----------|------|---------------|
| 1 | **Hook** (segundos 0-3) | 30% | Caption grande nos primeiros 3s? Pergunta ou afirmacao de impacto? Visual interessante ja no frame 1? |
| 2 | **Ritmo de cortes** | 20% | Frames consecutivos mostram mudanca visual? Ha beat/flash/zoom perceptivel a cada <=2s? |
| 3 | **Clareza de caption** | 15% | Texto legivel (tamanho, contraste, safe zone)? Sem cortar em borda? Suficiente para consumo mute? |
| 4 | **Demo real / valor** | 20% | Mostra o produto em USO (nao parado)? Da pra entender o que a plataforma faz sem audio? |
| 5 | **CTA** (segundos 42-45) | 15% | URL visivel? "Gratuito" claro? Motivo de acao explicito? |

### Passo 1 — Amostragem segundo-a-segundo

Para cada frame `s-NN.png` (N=01 a 45):
1. Ler com a ferramenta Read (Claude ve imagem)
2. Anotar o que aparece: beat em uso, caption (se houver), slot da cena
3. Comparar com o segundo anterior: mudou algo visualmente?

### Passo 2 — Tabela por segundo

Montar tabela em formato:

```
| s | Slot | Mudanca visual vs s-1? | Caption visivel? | Red flag |
|---|------|------------------------|------------------|----------|
| 01 | hook | — (frame inicial) | sim "VOCÊ SABE?" | — |
| 02 | hook | sim (zoom progride) | sim | — |
| 03 | hook | sim (caption troca para "IA FRACA vs FORTE") | sim | — |
| 04 | context | sim (beat novo) | nao | possivel — contexto precisa caption |
...
```

### Passo 3 — Red flags automaticos

Marcar e enumerar separadamente:

1. **Frame estatico >2s**: dois segundos consecutivos sem mudanca visual alem de movimento organico do video
2. **Caption cortada**: texto entra ou sai de tela (safe zone violada)
3. **Contraste ruim**: texto branco sobre fundo claro ou texto escuro sobre fundo escuro
4. **Clique sem zoom**: beat com `zoomOnClick` mas nenhum zoom perceptivel no frame
5. **Transicao sem BeatMarker**: corte de beat para outro sem flash de 1 frame
6. **Hook fraco**: seg 1-3 sem caption grande OU sem visual de impacto
7. **CTA incompleto**: seg 42-45 sem URL OU sem "gratuito"
8. **Numero ultrapassa o valor real (CRITICO)**: em algum frame, o numero exibido e MAIOR que o valor final na config. Exemplo: config diz 140 artigos, mas em s-42 ve-se "152". REPROVA automatica.
9. **Numero regride (CRITICO)**: numero diminui entre frames consecutivos. Exemplo: s-43 mostra "152", s-44 mostra "140". REPROVA automatica.
10. **Percentual > 100 (CRITICO)**: qualquer frame mostrando "110%", "112%" ou similar. REPROVA automatica.
11. **Numero inconsistente com produto**: valor na tela diverge do que o produto realmente tem (ex: "200 artigos" quando CURRICULUM tem 140). REPROVA automatica.
12. **Overlay desalinhado (CRITICO)**: `UIHighlight` box/circle com borda visivelmente fora do elemento que deveria destacar. Ex: caixa em volta de "nada" ou metade-cortada. REPROVA.
13. **Seta apontando pra nada**: `Callout` com linha terminando em area vazia da UI.
14. **Cursor/clique sem alvo**: `CursorTrail` com ripple disparando em area onde nao ha botao/link visivel. REPROVA.
15. **Cursor teleportando**: cursor aparece num frame em X, no proximo frame salta varios pixels sem trajetoria visivel.

### Passo 4 — Nota por criterio (1-5)

Para cada criterio, calcular nota considerando os segundos relevantes + red flags:

```
Criterio 1 Hook:
  Segundos 1-3: [notas individuais]
  Red flags: [lista]
  Nota: X/5

Criterio 2 Ritmo:
  Segundos 1-45: [% de segundos com mudanca vs total]
  Red flags: [lista de frames estaticos >2s]
  Nota: X/5
...
```

### Passo 5 — Nota ponderada final

```
Nota final = 0.30·Hook + 0.20·Ritmo + 0.15·Caption + 0.20·Demo + 0.15·CTA
```

Criterio de aprovacao: **>= 4.0 E zero red flags criticos** (hook fraco, CTA incompleto, ou >3 segundos estaticos consecutivos).

### Passo 6 — Output estruturado

```
## Avaliacao ShortX — Retencao

**Nota final:** X.X/5 — [APROVADO | REPROVADO]

### Por criterio
| Criterio | Nota | Peso | Contribuicao |
|----------|------|------|--------------|
| Hook | X/5 | 30% | X.X |
| Ritmo | X/5 | 20% | X.X |
| Caption | X/5 | 15% | X.X |
| Demo | X/5 | 20% | X.X |
| CTA | X/5 | 15% | X.X |

### Red flags
- [s-XX] [descricao]
- ...

### Recomendacao
[Se REPROVADO] delegar para /marketing-critico-ritmo para identificar root cause.
[Se APROVADO] short pronto para distribuicao.
```

---

## Principios

- **Evidencia visual, nao suposicao** — toda nota e baseada em frame real lido com Read
- **Granularidade de segundo** — TikTok perde 40% de viewers nos primeiros 3s; avaliar com essa resolucao
- **Red flags antes de nota** — vale mais pegar 1 problema estrutural do que calcular decimais precisos
- **Mute-first** — avaliar como se o video estivesse sem som (captions sao o conteudo)
