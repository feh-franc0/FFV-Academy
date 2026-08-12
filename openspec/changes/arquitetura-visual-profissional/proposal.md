## Why

A plataforma vende **profundidade técnica real** e ensina arquitetura. Hoje ela ensina
arquitetura em prosa na maior parte do currículo, e onde desenha, desenha pela metade.

Três números medidos em 07/ago/2026, em toda a base de 427 módulos:

| Medida | Valor |
|---|---|
| Módulos com `arch_diagram` | **207 de 427 (48%)** |
| Arestas **sem `label`** nos diagramas que existem | **871**, em 172 módulos |
| Nós **sem `note`** nos diagramas que existem | **218**, em 104 módulos |
| Diagramas com menos de 5 passos | **16** |

O segundo e o terceiro números são o problema mais grave, e é o menos visível: o
Zod aceita `note` e `label` como opcionais, e o `AwsDiagram` desenha bonito sem
eles. O resultado passa em todos os gates e chega à tela como **topologia sem
explicação** — o nó vira um ícone com nome, e a seta deixa o leitor supondo o que
trafega. Um diagrama assim mostra *que* as peças se conectam e não ensina *o que
cada uma decide ali*, que é a única coisa que transfere.

A trilha `trail-arq-ia-aws` já opera no padrão certo, porque seus 100 diagramas são
**gerados** por um DSL que recusa nó sem nota e aresta sem rótulo na hora de gerar.
Os outros 107 diagramas foram escritos à mão antes dessa regra existir. A diferença
de qualidade entre os dois conjuntos é visível ao leitor e não é intencional.

Sobre cobertura: `PADRAO_ENSINO.md` proíbe **forçar** diagrama onde não há fluxo, e
essa regra está certa — figura decorativa é pior que ausência. Mas a consequência
prática hoje é que "sem diagrama" é indistinguível de "ninguém olhou ainda". Dos 220
módulos sem diagrama, 13 são logística de prova (simulado, precificação) e **207
tratam de assunto onde pode haver fluxo, topologia ou espectro de decisão** — e
nenhum deles tem uma decisão escrita dizendo que não tem.

## What Changes

**1. Toda módulo passa a ter um veredito registrado**, não uma ausência. Ou tem
`arch_diagram`, ou tem uma exceção declarada com o motivo escrito — e o gate exige
que o conjunto `módulos = com diagrama ∪ exceções declaradas` seja completo. Isso
troca "48% de cobertura" por "100% de decisão tomada", que é a métrica honesta.

**2. A barra de qualidade sobe para o padrão da trilha gerada e passa a ter gate:**
todo nó tem `note` dizendo o que ele decide ali, toda aresta tem `label` dizendo o
que trafega, 5 a 6 passos percorríveis, e `caption` que entrega a conclusão. Os 871
rótulos e as 218 notas que faltam são escritos.

**3. Os 30 módulos das três trilhas com exceção registrada** (Claude Code do zero,
API Claude & Agents, Harness Engineering) são **reexaminados um a um** em vez de
mantidos ou revogados em bloco. O `arch_diagram` deixou de ser só topologia AWS em
jul/2026 — o catálogo tem 55 chaves de conceito (`laco_agente`, `ferramenta`,
`contexto`, `orquestrador`), e um laço de agente com teto de voltas **é** fluxo. A
decisão registrada foi tomada quando essas chaves eram novas, e merece releitura;
o que ela não merece é ser ignorada em silêncio.

**4. O DSL de geração deixa de ser exclusivo da trilha das 100 arquiteturas.** Hoje
`scripts/seo/arq100/comum.py` valida limites de schema na hora de gerar — que é a
única chance de descobrir bloco que desapareceria calado. Ele é extraído para uso
por qualquer autoria em volume.

### Non-goals

- **Não** forçar diagrama em módulo cujo objeto de estudo é sintaxe de linguagem,
  peso de domínio de exame, lista de preço ou glossário. Regra 1 do
  `PADRAO_ENSINO.md` continua valendo, e esta mudança a reforça exigindo que a
  exceção seja *escrita* em vez de presumida.
- **Não** trocar `arch_diagram` por outro bloco nem introduzir Mermaid. O bloco
  atual é percorrível; Mermaid é estático e não renderiza nesta plataforma.

## Capabilities

### New Capabilities
- `diagrama-de-arquitetura`: o contrato do apoio visual de arquitetura da
  plataforma — quando um módulo precisa de diagrama, o que faz um diagrama ensinar
  em vez de decorar, e como isso é verificado no CI.

### Modified Capabilities
<!-- Nenhuma: `openspec/specs/` está vazio; esta é a primeira spec desta área. -->

## Impact

- **Conteúdo:** 207 módulos elegíveis sem diagrama · 871 rótulos de aresta · 218
  notas de nó · 16 diagramas abaixo de 5 passos. É a maior massa de trabalho
  pedagógico aberta na plataforma.
- **Código:** `scripts/validate_servicos_diagrama.py` (nova regra de nota e
  rótulo), `scripts/validate_cobertura_diagramas.py` (troca mínimo por trilha por
  veredito completo), `scripts/seo/arq100/comum.py` (extração do DSL).
- **Documentos normativos:** `PADRAO_ENSINO.md` regra 1 (o veredito registrado) e
  `.claude/skills/arquitetura-ia-aws.md` (a barra de qualidade como obrigatória,
  não recomendada).
- **Nenhuma mudança de rota, de schema de bloco ou de banco.** O `arch_diagram`
  já aceita tudo o que esta mudança exige; o que falta é conteúdo e gate.
