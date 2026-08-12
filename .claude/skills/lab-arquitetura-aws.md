# Skill: lab-arquitetura-aws

Escrever um laboratório completo da série **100 laboratórios de arquitetura AWS** —
do básico (aplicação .NET 8 em ECS Fargate com RDS e front na borda) até
arquitetura de solução com IA — no formato que a plataforma renderiza, com
Terraform/YAML como IaC e C# / .NET 8 como linguagem de aplicação.

## Invocação

```
/lab-arquitetura-aws L01            # escreve o laboratório L01 do catálogo
/lab-arquitetura-aws L22 --revisar  # revisa um que já existe
/lab-arquitetura-aws                # lista os próximos elegíveis por dependência
```

O catálogo é
[`docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md`](../../docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md).
Ele é a **fonte** do problema, do nível, dos serviços, do entregável e das
dependências. Não invente laboratório fora dele; se falta um, adicione a linha no
catálogo primeiro — assim a numeração, a dependência e o grafo continuam
coerentes.

---

## Por que esta skill existe

Ela nasceu de um prompt mestre de 25 seções, muito bom, que produziria conteúdo
**impublicável nesta plataforma**. Dois defeitos concretos, medidos antes de
escrever qualquer módulo:

1. **A plataforma não renderiza Mermaid.** `grep -ri mermaid frontend/src` volta
   vazio. O prompt pede 2–3 diagramas Mermaid por módulo; eles apareceriam como
   texto de código cru, ou — pior — dentro de um `code_block` que valida, renderiza
   e não desenha nada. O bloco de diagrama desta plataforma é `arch_diagram`, e ele
   é **percorrível**: o leitor clica no passo e só aquele caminho acende. Mermaid
   é estático. A troca não é perda, é ganho — mas tem de ser feita de propósito.

2. **"Perguntas e respostas" e "Exercícios" não fecham o laço de gamificação.**
   `addCardsFromQuiz` é a **única** fonte de cartas de SRS (SM-2) da plataforma.
   Prosa de pergunta e resposta não gera carta nenhuma. Um módulo com 12 dúvidas
   excelentes e nenhum bloco `quiz` entrega conteúdo que ninguém revisa — e
   `validate_cobertura_quiz.py --strict` reprova no commit em que entra.

A lição que essas duas compartilham, e que é a de toda esta base: **conteúdo pode
estar escrito, válido e na tela, e ainda assim não fazer o trabalho.** Ver
[`PADRAO_ENSINO.md`](../../PADRAO_ENSINO.md), regra 4.

---

## Como as 25 seções do prompt mestre viram um módulo desta plataforma

Nenhuma seção do prompt foi descartada por preguiça. As que saíram, saíram com
motivo escrito.

| # | Seção do prompt | Como entra aqui | Bloco |
|---|---|---|---|
| — | Título orientado ao problema | Título do módulo em `trails/*.ts`. Nunca "Introdução ao ECS" | — |
| 1 | Visão geral | `paragraph` de abertura (o problema, não o resumo) + `key_value` com nível, tempo, custo relativo, pré-requisitos | `paragraph`, `key_value` |
| 2 | História do problema | 1–2 `paragraph` dentro da seção de abertura. Empresa fictícia, números plausíveis, hipóteses rotuladas | `paragraph` |
| 3 | Objetivos de aprendizagem | `list` com 5–8 objetivos **verificáveis** ("restaurar com RTO medido", não "entender backup") | `list` |
| 4 | Relação com certificações | `comparison_table` de 4 colunas: Conceito · Certificação · Como aparece no laboratório · O que dominar | `comparison_table` |
| 5 | Requisitos funcionais e não funcionais | `comparison_table` Requisito · Valor · Como influencia a arquitetura. A terceira coluna é obrigatória — requisito que não muda o desenho é enfeite | `comparison_table` |
| 6 | Arquitetura inicial | **`arch_diagram` nº 1** — a mínima didática, 3–4 grupos, 5–7 passos | `arch_diagram` |
| 7 | Arquitetura para produção | **`arch_diagram` nº 2** — a mesma solução com AZ dupla, segredo, observabilidade e caminho de falha. `dashed` no que é controle/observação | `arch_diagram` |
| 8 | Como funciona ponta a ponta | `flow_diagram` (numerado) + um `code_block` `json` com payload real quando há evento ou API | `flow_diagram`, `code_block` |
| 9 | Decisões arquiteturais | `decision_box` para a decisão central + `comparison_table` para as alternativas com trade-off | `decision_box`, `comparison_table` |
| 10 | Construção passo a passo | Seções com `code_block` de Terraform (`hcl`), YAML e C#. Árvore de arquivos em `code_block` `bash` | `code_block` |
| 11 | Segurança | `comparison_table` Risco · Probabilidade · Impacto · Prevenção · Detecção · Resposta + `code_block` da policy IAM mínima | `comparison_table`, `code_block` |
| 12 | Observabilidade e operação | `list` das perguntas que o painel responde + `comparison_table` de alarme e limiar inicial | `list`, `comparison_table` |
| 13 | Escala e resiliência | `comparison_table` por ordem de grandeza: 10 · 10 mil · 1 milhão · pico · falha de AZ | `comparison_table` |
| 14 | Custos e FinOps | `comparison_table` de 3 cenários (protótipo · produção pequena · alta escala) + `annotated_formula` quando o custo tem fórmula | `comparison_table`, `annotated_formula` |
| 15 | Well-Architected | `comparison_table` dos seis pilares: Pilar · Situação · Risco · Melhoria · Prioridade | `comparison_table` |
| 16 | Evolução em níveis | `layer_stack` ou `timeline` com os níveis 1→6, cada um com o que muda e o novo risco | `layer_stack` |
| 17 | Extensão com IA | `callout` `info` — e **se IA não agrega, diga isso** e aponte o laboratório da banda 9 que trata. Ver regra nº 4 abaixo | `callout` |
| 18 | Anti-patterns | `comparison_table` Erro · Por que alguém faz · Sintoma em produção · Forma correta | `comparison_table` |
| 19 | Troubleshooting | `comparison_table` Sintoma · Causa provável · Como investigar · Log/métrica · Correção | `comparison_table` |
| 19b | **Quebrar de propósito** | Não estava no prompt mestre; nasceu na banda 1 e a série inteira adotou. Três falhas induzidas, cada uma com o comando que provoca, o que o painel mostra e o diagnóstico. É o que transforma a seção 12 de lista de alarmes em alarme testado | `comparison_table`, `code_block` |
| 20 | Perguntas e respostas | seção **`Perguntas frequentes`** com `qa_item`, sob o contrato de resposta citável (regra nº 3) | `qa_item` |
| 21 | Exercícios e gabarito | **vira `Fixando` com 3 `quiz`** — porque só `quiz` gera carta de SRS. Desafio de arquitetura aberto entra como `callout` | `quiz`, `callout` |
| 22 | Checklist de produção | `list` objetiva, agrupada | `list` |
| 23 | Limpeza do laboratório | `code_block` com a ordem exata + `callout` `warning` do que cobra depois de "destruir" | `code_block`, `callout` |
| 24 | Resumo visual | `comparison_table` "problema → serviço → motivo". **Não** repita o diagrama | `comparison_table` |
| 25 | Próximo módulo | `callout` final apontando o próximo laboratório por dependência do catálogo | `callout` |

**O que saiu, e por quê:**

- **Diagrama Mermaid** → `arch_diagram`. Motivo no topo desta skill.
- **Segundo diagrama de troubleshooting (árvore de decisão)** → a árvore vira a
  tabela da seção 19. Um terceiro diagrama num módulo já longo compete com os dois
  que carregam a arquitetura, e o `arch_diagram` não é a ferramenta certa para
  árvore de decisão.
- **12 perguntas** → 6 a 8 em `Perguntas frequentes`. O gate exige ≥3; acima de 8 a
  seção deixa de ser respondível e vira apêndice. Qualidade da forma citável vale
  mais que a contagem.
- **"Data da última verificação técnica"** → entra no `callout` final. Não invente
  data; use a data real em que você conferiu.
- **Checklist de produção (22)** → absorvido pelo `Resumo` (24) e pela tabela de
  Well-Architected (15), que já dizem o que falta e com que prioridade. Nenhum dos
  80 laboratórios das bandas 1–8 escreveu a seção separada, e o conteúdo não
  sumiu — só parou de ser repetido três vezes. Se você escrever, não é erro; só
  não é exigido.

### As nove seções que o gate cobra

Das seções acima, **nove têm gate** — `scripts/validate_cobertura_secoes.py`:
Segurança (11), Observabilidade (12), Escala (13), Custos/FinOps (14),
Well-Architected (15), Quebrar de propósito (19b), Troubleshooting (19),
Extensão com IA (17) e Anti-patterns (18).

Elas são o que separa um laboratório de arquitetura de um `terraform apply`
narrado: respondem o que acontece **depois** que a coisa sobe. O gate nasceu de
uma medição em 09/ago/2026 que achou 88 dessas seções ausentes em 21 dos 100
laboratórios — todas nas bandas 9 e 10, escritas por último, quando o padrão já
parecia óbvio demais para reconferir. As bandas 1–8 as tinham em ~100% dos 80
laboratórios por disciplina de quem escreveu, e disciplina não é garantia.

O gate cobra o **título** da seção, aceitando as variantes que o corpus real usa
("Custos e FinOps", "Observabilidade e operação", "Anti-patterns", "Extensão com
IA"), e **não** cobra o bloco de dentro — tabela e lista ensinam observabilidade
igualmente bem, e exigir um tipo empurraria você à forma errada.

**Em laboratório de IA, a seção continua obrigatória mas a pergunta muda.** Custo
é por 1000 tokens de entrada e saída, não por hora de instância; Escala esbarra
em limite de taxa do Bedrock e tamanho de janela antes de esbarrar em CPU;
Quebrar de propósito derruba o modelo, estoura o limite de taxa e injeta
documento envenenado, em vez de derrubar uma AZ. Responder "não se aplica" é
resposta legítima **quando vem com o motivo** — o que não é legítimo é a seção
não existir.

---

## Regra nº 1 — as três arquiteturas, e a do meio é a que ensina

Todo laboratório apresenta **mínima → produção → evolução**. Não é formato: é a
diferença entre quem monta e quem arquiteta, que é *saber quando a solução precisa
mudar*.

- A **mínima** (seção 6) tem de ser realmente implantável. Se ela já traz
  Multi-AZ, WAF, KMS e X-Ray, o leitor não vê o que cada um resolve.
- A **de produção** (seção 7) é o mesmo desenho com as restrições que a seção 5
  declarou. Cada peça nova tem de rastrear a um requisito não funcional escrito. Se
  você não consegue apontar o requisito, a peça é adorno.
- A **evolução** (seção 16) é `layer_stack`, não desenho: níveis 1→6, com "o que
  muda", "novo risco" e "impacto de custo".

**Antipadrão que isso impede:** dois `arch_diagram` idênticos com rótulos
diferentes. Se a topologia da mínima e a da produção são a mesma, uma das duas está
errada.

**As três têm gate desde 07/ago/2026** (`validate_labs_aws.py`, checagens 1 e 4).
Antes disso só as duas primeiras eram cobradas, e a terceira sobrevivia por
disciplina de autor. A checagem 4 cobra a INFORMAÇÃO, não o bloco: `layer_stack` e
`comparison_table` são os dois formatos em uso e os dois ensinam — o L01 usa a
escada, porque cada nível tem uma frase e uma nota; o L02 usa a tabela, porque as
três dimensões viram três colunas comparáveis lado a lado. O que ela exige é que
existam pelo menos 5 níveis numerados, que o texto fale de **risco** e de **custo**,
e que o topo chegue a dados ou IA. Nível sem "novo risco" e sem "impacto de custo" é
rótulo numerado: o leitor vê que existe um nível acima e não sabe o que ele troca.

---

## Regra nº 2 — o diagrama segue a skill de arquitetura, sem exceção

`arch_diagram` tem contrato próprio e um gate que falha por chave errada. **Leia
[`.claude/skills/arquitetura-ia-aws.md`](arquitetura-ia-aws.md)** antes de desenhar.
O resumo do que mais custa quando se erra:

- `service` vem do catálogo de `frontend/src/components/article/AwsIcon.tsx`. Nome
  de **categoria** (`compute`, `network`, `storage`) e nome de **glifo**
  (`container`, `workflow`, `doc`) renderizam cubo cinza sem erro nenhum. Foi assim
  que 148 nós ficaram errados até ago/2026.
- `kind: "vpc"` é **afirmação técnica** de isolamento de rede. ECS/Fargate, RDS,
  ElastiCache e EC2 estão em sub-rede — podem. Bedrock, S3, DynamoDB, Athena e
  Glue são regionais e **não moram na VPC**; você os alcança por endpoint. Usar
  `vpc` como agrupamento visual ensina errado justamente a distinção que a prova
  concentra.
- Aresta de passo é `"origem>destino"` com **um** `>`, e tem de casar com uma
  aresta declarada. `->` não casa com nada e o passo acende sem aresta, em
  silêncio.
- Todo nó tem `note` (o que ele **decide ali**) e toda aresta tem `label` (o que
  **trafega**). `'dados'` não é rótulo; `'credencial temporária da task role'` é.

Chaves que este catálogo de laboratórios mais usa, todas conferidas no catálogo:
`ecs` · `fargate` · `ecr` · `alb` · `rds` · `aurora` · `postgres` · `dynamodb` ·
`elasticache` · `s3` · `cloudfront` · `route53` · `waf` · `apigateway` · `lambda` ·
`sqs` · `sns` · `eventbridge` · `stepfunctions` · `secretsmanager` · `kms` · `iam` ·
`vpc` · `privatelink` · `cloudwatch` · `xray` · `otel` · `budgets` · `costexplorer` ·
`cloudtrail` · `organizations` · `identitycenter` · `cognito` · `bedrock` ·
`knowledgebases` · `guardrails` · `agentcore` · `opensearch` · `pgvector` ·
`sagemaker` · `glue` · `athena` · `kinesis` · `redshift`.

Antes de usar uma chave que não está nessa lista:

```bash
grep -oE "^  '?[a-z0-9_.-]+'?:" frontend/src/components/article/AwsIcon.tsx | tr -d " ':" | sort
```

---

## Regra nº 3 — `Perguntas frequentes` obedece ao contrato de resposta citável

A seção precisa se chamar **exatamente** `Perguntas frequentes`, e cada par é um
bloco `qa_item` — não `key_value` (que espera `items` e renderiza vazio, o que já
aconteceu em `rlhf-fundamentos-ppo`).

O contrato, cobrado por `scripts/validate_respostas_citaveis.py`:

- **Pergunta:** 20 a 90 caracteres, e é **o que a pessoa digita**. "Preciso de NAT
  Gateway para o Fargate puxar imagem do ECR?" captura consulta; "Sobre rede"
  não.
- **Resposta:** ≥180 caracteres e **começa pela conclusão**. A primeira frase é o
  trecho que um resumo de IA extrai; se ela é preâmbulo, o preâmbulo é o que
  aparece citado.
- **Proibido abrir com:** "Antes de…", "Neste módulo…", "Vamos…", "É importante
  lembrar…", "Existem várias…", "Atualmente…", "Depende." sozinho, "Sim."/"Não."
  sozinho.
- **Proibido responder com ponteiro:** "veja o módulo X", "leia a documentação".
  Quem cita não segue link — cita o que está na página.
- Mínimo de 3 pares; nesta série, alvo de **6 a 8**.

Exemplo que passa, e por quê:

> **Preciso de NAT Gateway para a task no Fargate puxar imagem do ECR?**
>
> Não, se você criar VPC endpoints para o ECR (`ecr.api` e `ecr.dkr`), para o S3 e
> para o CloudWatch Logs — o `pull` da imagem passa por dentro da rede da AWS e a
> task fica em sub-rede privada sem rota de saída. Com NAT Gateway funciona
> também, e é o caminho que a maioria dos tutoriais mostra, mas você paga hora
> ligada mais byte processado por um tráfego que não precisava sair. Em ambiente de
> não-produção, é uma das maiores linhas de custo que ninguém nota.

Começa pela conclusão ("Não, se…"), sustenta-se fora da página, nomeia os
endpoints, e diz o custo do caminho alternativo em vez de proibi-lo.

---

## Regra nº 4 — IA só entra onde IA resolve

O prompt mestre pede uma seção de extensão com IA em todo módulo. **Aqui ela é
condicional**, e essa é uma decisão editorial registrada para não ser reaberta.

- **Se IA agrega:** diga qual problema ela resolve, **por que uma regra
  tradicional não resolveria**, de onde vem o dado, e o que acontece quando ela
  erra (fallback e revisão humana). Sem isso, é IA decorativa.
- **Se IA não agrega:** escreva isso, em uma frase, e aponte o laboratório da banda
  9 ou 10 que trata do assunto. Num laboratório de NAT Gateway, "poderíamos usar IA
  para prever tráfego" é exatamente o hype que a plataforma existe para não
  vender.

O `CLAUDE.md` diz que a escola ensina IA "sem hype". Enfiar IA em L02 seria
contradizê-lo no próprio conteúdo.

---

## Regra nº 5 — código que roda, IAM que passa auditoria

**Terraform (`language: "hcl"`)**

- Recurso com nome previsível e `tags` que suportem o rateio de L09.
- **Nunca** `0.0.0.0/0` em security group de banco. O security group do RDS
  referencia o **security group** da task, não faixa de IP.
- Variável para o que muda por ambiente; nada de valor mágico embutido.
- Todo recurso criado aparece na seção de limpeza. `terraform destroy` **não**
  remove snapshot final, log group com retenção, Elastic IP órfão nem bucket com
  objeto — diga isso no `callout` `warning`.

**YAML** — use onde YAML é a linguagem nativa do artefato: workflow de CI,
`buildspec` do CodeBuild, manifesto de Kubernetes, template CloudFormation nos
laboratórios em que CFN *é* o objeto de estudo. Não converta Terraform em YAML por
gosto.

**C# / .NET 8**

- `Npgsql` com pool; nunca uma conexão por requisição.
- Configuração por `IConfiguration` + variável de ambiente; segredo lido do Secrets
  Manager em tempo de execução, **não** injetado na imagem.
- `/health` para o ALB que responde sem tocar o banco, e `/ready` que toca — são
  perguntas diferentes, e confundi-las faz o ALB derrubar task sadia quando o banco
  oscila.
- Resiliência com `Microsoft.Extensions.Http.Resilience` ou Polly: retry com
  backoff **e jitter**. Retry sem backoff transforma instabilidade em apagão (é o
  assunto de L36).
- `OpenTelemetry` com exportador OTLP para o ADOT collector.

**IAM**

- Policy derivada do uso real, com `Resource` específico. `"Resource": "*"` só
  aparece onde a ação **não suporta** recurso — e aí a linha vem com comentário
  dizendo isso.
- Distinga `execution role` (o que o agente do ECS usa para puxar imagem e escrever
  log) de `task role` (o que **a sua aplicação** usa). Trocá-las é o erro mais
  comum da banda 1.

---

## Regra nº 6 — números voláteis apontam para a fonte

Preço, cota e limite mudam, e nenhum número decorado sobrevive ao ciclo de uma
certificação. O que a prova cobra e o que a decisão exige é o **modelo** de
cobrança: por requisição, por hora ligada, por byte varrido, por token, com
desconto em lote.

- ✅ "NAT Gateway cobra por hora ligada **e** por GB processado — as duas dimensões,
  e é a segunda que surpreende. Calcule no AWS Pricing Calculator."
- ❌ "NAT Gateway custa US$ 0,045/h."
- Cota: diga que existe e onde ver (`Service Quotas`), não o valor.

---

## Procedimento

1. **Leia a linha do catálogo.** Problema, nível, serviços, entregável,
   dependências, evolui-para. O módulo tem de entregar aquele entregável.
2. **Escreva o entregável primeiro**, numa frase verificável. Se você não consegue
   dizer como alguém prova que terminou, o laboratório não está pronto para ser
   escrito.
3. **Desenhe as duas arquiteturas** (regra 1) antes da prosa. A `caption` de cada
   uma é a decisão que o leitor leva.
4. **Escreva o laboratório** e rode os comandos. Trecho de Terraform que você não
   leu com atenção é trecho que não aplica.
5. **Escreva os 3 quizzes por último**, a partir do que o módulo de fato ensinou —
   e cada `explanation` trata **cada** distrator, nomeando o erro de raciocínio.
   Essa é a parte que mais ensina (`PADRAO_ENSINO.md`, regra 2).
6. **Registre o módulo:**
   - `frontend/src/lib/curriculum/trails/trail-labs-aws.ts` — slug, título, `xp`,
     `readTime`, `desc`, `keywords`, `prerequisites`
   - `frontend/src/lib/seo-descriptions.ts` — descrição de 70 a 165 caracteres, em
     **forma de frase**, não salada de palavra-chave
   - `scripts/seeds/articles/<slug>.json` — o conteúdo
   - a tabela **Estado de execução** do catálogo
7. **Rode os gates até zerar:**

```bash
python3 scripts/validate_bedrock_blocks.py 'scripts/seeds/articles/<slug>.json'
python3 scripts/validate_servicos_diagrama.py
python3 scripts/validate_cobertura_quiz.py --strict
python3 scripts/validate_respostas_citaveis.py
python3 scripts/validate_substancia.py
python3 scripts/validate_primitives_render.py
python3 scripts/validate_texto_sem_lacuna.py
node scripts/check-curriculum-seed-drift.mjs --strict
cd frontend && npm test && npx tsc --noEmit && npm run lint
```

8. **Veja renderizado.** `npm run dev`, abra `/aprenda/<slug>`, **clique nos passos
   dos dois diagramas** e confira a 375 px. Bloco válido pode ficar ilegível, e
   diagrama que não acende passo é figura que passou no gate.

---

## Slug: sem número

O título diz "Laboratório 03"; o slug **não**. Renumerar o catálogo é previsível —
inserir um laboratório na banda 1 empurra os outros nove — e número no slug
transforma reordenação em URL quebrada, redirect e perda de posição orgânica.

- ✅ `lab-app-web-ecs-fargate-rds`
- ❌ `lab-01-app-web`

---

## Antipadrões

| Antipadrão | Por que dói |
|---|---|
| Diagrama Mermaid | não renderiza; vira texto de código |
| "Exercícios" sem `quiz` | zero carta de SRS; o gate reprova |
| Mínima já com WAF, KMS e Multi-AZ | o leitor não vê o que cada peça resolve |
| Peça na arquitetura de produção sem requisito que a justifique | é adorno com aparência de rigor |
| Preço em número | envelhece antes de ser lido |
| `Resource: "*"` sem justificativa | ensina o hábito que L41 existe para corrigir |
| Laboratório que termina em "agora você entende" | não tem entregável verificável |
| Seção de limpeza incompleta | deixa NAT Gateway e snapshot cobrando depois da aula |
| `kind: "vpc"` em Bedrock, S3 ou DynamoDB | afirma isolamento de rede que não existe |
| Título com nome de serviço | "Introdução ao ECS" não é problema real |
| Copiar a topologia de `S##` sem a decisão | é a armadilha que o catálogo de IA nomeia na abertura |

---

## Referências

- [`docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md`](../../docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md) — os 100, com dependência e entregável
- [`PADRAO_ENSINO.md`](../../PADRAO_ENSINO.md) — **normativo**; as 5 regras e o gate de cada uma
- [`.claude/skills/arquitetura-ia-aws.md`](arquitetura-ia-aws.md) — contrato do `arch_diagram` e os 5 padrões de IA na AWS
- [`scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md`](../../scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md) — shape exato de `data` por tipo de bloco
- [`docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md`](../../docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md) — as 100 soluções de IA (`S##`), citadas pelas bandas 9 e 10
- [`ESTRATEGIA_SEO_ORGANICO_2026-08.md`](../../ESTRATEGIA_SEO_ORGANICO_2026-08.md) — contrato de resposta citável, com a medição por trás
