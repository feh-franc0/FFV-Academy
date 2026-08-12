## Why

Três defeitos da mesma família apareceram na plataforma, e os três foram achados por
acidente:

| Bloco | O que aconteceu | Alcance |
|---|---|---|
| `matrix_diagram` | primitive chamava `.toFixed()` em célula de texto | derrubava a **página inteira** em 6 artigos |
| `node_graph` | legenda `[{label,color}]` renderizada como filho React | derrubava a página |
| `decision_box` | adapter entrega `downside`, primitive lê `note ?? when` | **82 de 391** alternativas, em 120 módulos, renderizavam vazio |

O terceiro foi medido em 07/ago/2026, lendo o HTML servido para validar um módulo novo.
O sintoma era `<span class="font-semibold">EC2 com Auto Scaling</span> — </p>`: o nome
da alternativa, o travessão, e nada depois. A `DecisionBox` existe para mostrar **o que
se perde** em cada alternativa, e era exatamente essa parte que não chegava à tela.

A causa foi um conserto feito na metade do caminho. O adapter normaliza a desvantagem
para a prop `downside` — o comentário dele registra que corrigiu "286 de 355
alternativas" —, mas o primitive nunca declarou `downside` no seu tipo.

**Nenhum gate cobre esse salto.** `validate_primitives_render.py` compara seed contra
**adapter** e é excelente nisso: distingue campo vazio por escolha do autor de campo
vazio porque o código não lê a chave. `primitives-cms-contract.test.tsx` cobria os dois
casos que derrubavam a *página*. O `decision_box` não derrubava nada — só emudecia o
conteúdo, o que é pior, porque parece que está tudo certo.

A cadeia tem três elos e só dois estão verificados:

```
seed JSON  →  adapter (BlockRenderer)  →  primitive (primitives.tsx)  →  tela
           ✓ validate_primitives_render         ✗ nada                 ✓ diagramas-de-seed
```

## What Changes

**Um gate passa a comparar as props que o adapter entrega com as props que o primitive
declara**, por tipo de bloco. Prop entregue e não declarada é erro; prop declarada e
nunca entregue é aviso, porque pode ser uso legítimo em JSX direto.

**O teste de contrato de render passa a cobrir todo tipo de bloco com adapter**, e não
apenas os que já quebraram. Hoje cobre 2 de 25.

**A ordem de leitura fica registrada como regra**: a forma de um bloco vem do adapter,
e a do adapter tem de casar com o primitive. É a regra 4b do `PADRAO_ENSINO.md`
estendida um elo adiante — ela hoje diz "fonte de verdade é o adapter" e para ali.

### Non-goals

- **Não** unificar adapter e primitive. Eles têm razão de existir separados: o primitive
  serve também a módulos escritos em JSX, com props tipadas; o adapter traduz JSON do
  CMS, que é fracamente tipado por natureza.
- **Não** apertar os schemas Zod. Bloco que falha o Zod desaparece da página; este
  problema é de prop, não de validação de entrada.

## Capabilities

### New Capabilities
- `contrato-de-render-de-bloco`: a cadeia seed → adapter → primitive → tela, e como cada
  elo é verificado.

## Impact

- **Código:** `scripts/validate_primitives_render.py` ganha a comparação adapter ↔
  primitive, ou nasce um gate irmão; `src/tests/render/primitives-cms-contract.test.tsx`
  cresce de 2 para ~25 tipos cobertos.
- **Conteúdo:** nenhum seed muda. O conteúdo já está escrito — ele só não chegava à tela.
- **Correção já aplicada em 07/ago/2026:** `DecisionBox` passou a ler `downside`, e o
  travessão só aparece quando há texto depois dele (72 das 391 alternativas
  legitimamente não têm desvantagem escrita e mostravam `Nome — ` pendurado). Três
  testes com prova negativa. Esta mudança generaliza o que ali foi consertado à mão.
