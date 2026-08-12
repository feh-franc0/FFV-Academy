## Why

A demanda de busca foi medida, não estimada: 10.000 consultas rotuladas por origem, 21
temas como terceira classificação do currículo, e **três lacunas reais** — assuntos com
demanda e sem conteúdo na plataforma:

| Lacuna | Estado |
|---|---|
| Busca com IA e visibilidade (GEO/AEO) | **0 módulos** — tema abaixo do limiar, sem página |
| Carreira e mercado | **2 módulos** — abaixo do limiar de 3, sem página |
| Conformidade e regulação de IA | sem trilha |

O tema `busca-ia-geo` tem zero módulos e ficou registrado no gerador de corpus como "em
produção". Isso é honesto na tela e continua sendo demanda não atendida — e é o tema que
descreve exatamente o mecanismo pelo qual a plataforma é encontrada.

Há também formato de captação que a plataforma não usa:

- **Página de comparação.** Existem duas (`claude-code-vs-cursor`,
  `melhores-ferramentas-ia-codigo-2026`) e o corpus indica dezenas de pares com demanda.
  É o formato que responde consulta de decisão, onde a pessoa já sabe o que quer e está
  escolhendo.
- **Glossário por termo.** Hoje `/glossario` é uma página com todos os termos. Consulta de
  definição é a mais volumosa do corpus e a mais específica: quem digita "o que é RRF"
  quer uma resposta, não uma lista de 300 termos.

## What Changes

**Os três temas com lacuna ganham conteúdo até passarem do limiar de página**, começando
por GEO/AEO, que é o mecanismo pelo qual todo o resto é encontrado.

**Páginas de comparação passam a ser um formato com contrato**, e não duas páginas
avulsas: quem compara declara o critério antes do veredito, mede o que afirma, e diz para
quem cada opção serve — sem eleger vencedor absoluto.

**Termos do glossário com demanda medida ganham URL própria**, com a definição como
resposta citável, e a página-índice permanece como navegação.

**Nenhum formato novo entra sem gate.** O contrato de resposta citável já é verificado em
427 módulos; ele passa a valer para os formatos novos no commit em que eles entram.

### Non-goals

- **Não** criar página para todo termo do glossário. Só onde há demanda medida no corpus —
  300 páginas finas prejudicam mais que ajudam.
- **Não** produzir comparação sem medição. Página que compara sem medir é opinião com
  aparência de análise, e a plataforma se posiciona contra exatamente isso.
- **Não** reabrir a decisão de não usar `FAQPage` nos dados estruturados: o Google parou de
  exibir em maio/2026, e a decisão está registrada com teste.

## Capabilities

### New Capabilities
- `formato-de-captacao`: os formatos de conteúdo que respondem consulta de busca —
  comparação, definição, pergunta — e o contrato de cada um.

## Impact

- **Conteúdo:** três frentes de módulo novo (GEO/AEO, carreira, conformidade), páginas de
  comparação por par com demanda, termos de glossário com URL própria.
- **Rotas:** rota nova precisa entrar na tabela de tetos de acessibilidade e no inventário
  de rotas — a lista é explícita e rota nova escapa da auditoria em silêncio.
- **Currículo:** três temas cruzam o limiar de 3 módulos e ganham página; `temas-mapa.ts` é
  **gerado** e precisa ser regerado, o que também regera o corpus e a fila de perguntas.
- **Risco:** página fina em volume é o modo de falha clássico desta estratégia. O contrato
  de resposta citável e o piso de substância existem para impedi-lo, e valem para os
  formatos novos.
