## Why

A plataforma tem 100 arquiteturas de IA **desenhadas** e nenhuma **construída**. O
catálogo `S01`–`S100` entrega, para cada solução, a topologia e a decisão que ela
ensina — um parágrafo e um diagrama percorrível de cinco passos. Isso responde "qual é
o desenho" e não responde "como eu faço isso funcionar, como sei que funcionou, e o
que quebra".

A distância entre as duas coisas é onde mora a competência que o mercado paga. Um
catálogo de solução tem uma armadilha nomeada no próprio documento: **copiar a
topologia sem a decisão** produz um sistema que parece o desenho e responde errado.

A série `L01`–`L100` fecha essa distância. Cada laboratório é reproduzível: laboratório
com Terraform, IAM de menor privilégio, código de aplicação, teste funcional, injeção
de falha, FinOps com três cenários, revisão Well-Architected nos seis pilares,
troubleshooting, e uma seção de limpeza — porque laboratório de arquitetura deixa NAT
Gateway, Elastic IP e snapshot cobrando depois que a aula termina.

`L01` foi escrito e está no ar como prova de que o padrão funciona: 105 blocos, dois
`arch_diagram` percorríveis, 13 tabelas, 9 blocos de código, 7 perguntas frequentes e
3 quizzes, com todos os gates verdes. Faltam **99**.

## What Changes

**Os 99 laboratórios restantes são escritos**, na ordem das dez bandas do catálogo, com
o padrão de autoria já normatizado em `.claude/skills/lab-arquitetura-aws.md`.

O que cada laboratório entrega, e que nenhum módulo da plataforma entregava antes:

- **Três arquiteturas** — mínima para aprender, recomendada para produção, evolução em
  níveis. É a diferença entre quem monta e quem arquiteta: saber *quando* a solução
  precisa mudar.
- **Entregável verificável.** "Entendeu" não é entregável; "RTO medido em 14 minutos" é.
- **Terraform e YAML** onde YAML é a linguagem nativa do artefato, com **C# / .NET 8**
  como linguagem de aplicação.
- **Seção de limpeza completa**, com o que o `terraform destroy` **não** leva.
- **IA só na banda 9**, e onde IA não agrega, o módulo diz isso em uma frase e aponta o
  laboratório que trata. A plataforma vende "sem hype"; enfiar IA num laboratório de
  NAT Gateway contradiria isso no próprio conteúdo.

A trilha cresce **um módulo por vez**: slug declarado sem seed é 404 anunciado no
sitemap, e o gate de drift reprova.

### Non-goals

- **Não** renumerar o catálogo `S01`–`S100`. Os 100 diagramas daquela trilha são
  gerados, e o gerador falha de propósito quando a cadeia muda por baixo do desenho.
  Onde um `L` implementa uma solução, ele **cita** o `S`.
- **Não** produzir os 99 num único esforço. Cada banda é uma entrega, e a tabela
  "Estado de execução" do catálogo separa o planejado do construído.
- **Não** usar Mermaid: não renderiza nesta plataforma.

## Capabilities

### New Capabilities
- `serie-labs-arquitetura-aws`: o contrato de um laboratório da série — o que ele tem
  de conter para ser publicável, como as três arquiteturas se relacionam, e o que o CI
  verifica.

## Impact

- **Conteúdo:** 99 módulos. Cada um da ordem de 100 blocos e ~110 KB de seed. É a maior
  entrega de conteúdo já planejada na plataforma.
- **Currículo:** `frontend/src/lib/curriculum/trails/trail-labs-aws.ts` cresce; cada
  módulo precisa de entrada em `seo-descriptions.ts` e de regeneração do manifesto.
- **Trilhas:** quando a trilha passar de ~20 módulos, avaliar quebra por banda — 100
  módulos numa página de trilha é lista que ninguém percorre.
- **Documentos:** a tabela "Estado de execução" do catálogo é atualizada a cada banda.
- **Nenhuma mudança de schema, rota ou banco.**
