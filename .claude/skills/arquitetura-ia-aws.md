# Skill: arquitetura-ia-aws

Desenhar diagramas de arquitetura profissionais para módulos de IA e AWS da FFV Academy — no formato `arch_diagram` que a plataforma renderiza, com os padrões de referência de sistemas com IA sobre Bedrock e infraestrutura AWS.

## Invocação

```
/arquitetura-ia-aws [slug-do-módulo | assunto]
```

**Exemplos:**
- `/arquitetura-ia-aws bedrock-rag-producao-padroes` — diagrama para um módulo específico
- `/arquitetura-ia-aws` — varre os módulos de IA/AWS sem diagrama e propõe os que rendem
- `/arquitetura-ia-aws IDP em setor regulado` — parte do padrão, não do módulo

---

## Por que esta skill existe

Três defeitos reais, todos medidos neste repositório:

1. **148 nós renderizavam como cubo cinza de "Fora da AWS".** A causa: o campo
   `service` recebia o nome da CATEGORIA (`network`, `compute`) ou o nome do
   DESENHO (`workflow`, `doc`, `search`) em vez da chave do serviço. `serviceDef()`
   tem fallback silencioso, então nada quebrava — o rótulo aparecia certo, porque
   vem do `label` do nó, e só a cor e o glifo se perdiam. Em trilha de
   certificação, onde topologia é o objeto de estudo, isso é conteúdo errado com
   aparência de conteúdo certo.

2. **Diagrama sem `steps` é figura.** O `PADRAO_ENSINO.md` é normativo:
   diagrama que não pode ser percorrido não ensina, decora. O gate exige
   `caption`, e a regra da casa exige 5–7 passos.

3. **Bloco inválido desaparece em silêncio.** O Zod devolve `null` e o
   `BlockRenderer` não renderiza nada, sem erro. Diagrama malformado não aparece
   como diagrama quebrado: aparece como diagrama ausente.

---

## O formato, exato

```json
{
  "type": "arch_diagram",
  "data": {
    "title": "Frase que diz o que o diagrama mostra",
    "groups": [
      {
        "label": "Nome da camada",
        "kind": "plain",
        "nodes": [
          { "id": "curto", "service": "CHAVE_DO_CATALOGO", "label": "Nome exibido", "note": "o que ele decide aqui" }
        ]
      }
    ],
    "edges": [
      { "from": "id_origem", "to": "id_destino", "label": "o que trafega", "style": "dashed" }
    ],
    "caption": "O que CONCLUIR do diagrama — não o que ele contém.",
    "steps": [
      { "label": "Passo curto", "detail": "por que este passo existe", "nodes": ["id"], "edges": ["id_origem>id_destino"] }
    ]
  }
}
```

**Limites do schema** (violar faz o bloco desaparecer):
- `groups`: 1 a **8**; cada um com no mínimo 1 nó
- `kind`: `plain` | `vpc` | `region` | `account` — use `vpc` para o que está dentro
  da rede privada; é o que comunica isolamento sem escrever "privado". **Não existe
  `edge`**: esta linha listava o valor até 07/ago/2026, e ele não está no `z.enum`
  do schema, nem na tupla do `validate_bedrock_blocks.py`, nem no `AwsDiagram.tsx`.
  Serviço de borda (CloudFront, WAF, Global Accelerator) vai em `plain`, que é o
  que o componente sabe desenhar. O gate reprova em voz alta, então isso custa uma
  execução — mas custa a quem seguiu a documentação da casa.
- `service`: string de 1 a 60 caracteres, e **tem de existir em `AWS_SERVICES`**
  (`frontend/src/components/article/AwsIcon.tsx`)
- `note`: até 200 caracteres · `label` de nó: até 120 · `label` de aresta: até 160
- `steps`: até 12; `detail` até 500
- `style` de aresta: só `solid` ou `dashed`

---

## Regra nº 1 — `service` vem do catálogo, sempre

O gate `scripts/validate_servicos_diagrama.py` falha quando a chave não existe.
Ele foi escrito justamente por causa dos 148 nós cinzas.

**Nunca use como `service`:** nome de categoria (`compute`, `network`, `ai`,
`storage`, `database`, `security`) nem nome de glifo (`workflow`, `doc`, `search`,
`brain`, `globe`, `key`, `cube`, `chars`, `wave`). Eles existem no catálogo como
conceito genérico e vão renderizar — só que sem a semântica do serviço.

**Chaves de IA e dados que você mais vai usar:**

| Precisa mostrar | `service` |
|---|---|
| Bedrock (a porta de modelos) | `bedrock` |
| Claude especificamente | `claude` |
| RAG gerenciado | `knowledgebases` |
| Guardrails | `guardrails` |
| Runtime de agente | `agentcore` |
| Extração de documento/imagem/vídeo | `dataautomation` |
| Treino/serving de modelo próprio | `sagemaker` |
| OCR de documento | `textract` |
| NLP clássico (entidade, sentimento) | `comprehend` |
| Transcrição / síntese de voz | `transcribe` / `polly` |
| Busca vetorial gerenciada | `opensearch`, `s3vectors` |
| Vetor no Postgres | `pgvector` |
| Cache de sessão/resultado | `elasticache` |

**Chaves conceituais** (para diagrama de pipeline de IA que não é serviço AWS):
`chunker`, `embedder`, `retriever`, `reranker`, `bm25`, `indice_ann`, `hnsw`,
`llm`, `prompt`, `contexto`, `laco_agente`, `ferramenta`, `orquestrador`,
`subagente`, `eval`, `golden_set`, `juiz`, `metrica`, `drift`.

Antes de escrever uma chave nova, confira:

```bash
grep -o "^  '\?[a-z0-9_.-]\+'\?:" frontend/src/components/article/AwsIcon.tsx | tr -d " ':" | sort
```

---

## Regra nº 1b — `kind: "vpc"` afirma isolamento de rede

A borda roxa com o selo "VPC" é uma **afirmação técnica**, não um recurso de
diagramação. Bedrock, Knowledge Bases, S3, Glue, Athena, DynamoDB e os serviços de
IA são regionais: você os alcança de dentro de uma VPC por endpoint, e eles não
moram lá.

Usar `vpc` como agrupamento visual ensina errado justamente a distinção que as
provas de certificação concentram — e o leitor não tem como desconfiar, porque o
desenho parece autoritativo.

- ✅ `vpc` quando o grupo tem recurso em subrede: Lambda anexada, RDS, Aurora,
  ElastiCache, MemoryDB, OpenSearch provisionado, EC2/ECS/EKS, endpoint privado.
- ✅ `account` quando a fronteira que importa é a conta (sistema de registro,
  governança, conta de rede compartilhada).
- ❌ `vpc` só para separar "camada de conhecimento" de "camada de modelo" — isso é
  `plain`.

O gate é `scripts/validate_servicos_diagrama.py`, e a lista de serviços elegíveis
mora em `scripts/seo/arq100/comum.py` (`EM_VPC`), uma só, compartilhada entre o
gerador e o gate. Em ago/2026 esta regra pegou **104 grupos** na trilha das 100
arquiteturas e **17** na base antiga.

Uma ressalva registrada: chaves genéricas de categoria (`storage`, `network`)
contam como elegíveis porque são ambíguas — em `storage-s3-ebs-efs` o nó `storage`
representa EBS, que está numa subrede. Aplicar a regra sobre elas produziu três
correções ERRADAS na primeira execução, e gate que força mudança errada em caso
ambíguo é pior que gate ausente.

---

## Regra nº 2 — `caption` diz o que concluir

Não descreva o desenho: o leitor já o vê. A legenda entrega a decisão.

- ❌ "O diagrama mostra o CloudFront, o ALB, o ECS e o RDS."
- ✅ "Cada camada que a requisição não atravessa é latência e custo economizados —
  a questão diz qual problema existe, e a camada certa segue disso."

---

## Regra nº 2b — todo nó tem `note` e toda aresta tem `label`

O `note` do nó é **o que aquele serviço decide ALI**. O `label` da aresta é a
LIGAÇÃO: o que trafega. Zod aceita os dois como opcionais e o componente desenha
bonito sem eles — então nada cobra, e o resultado é diagrama que mostra a topologia
sem explicar o uso de cada peça. O nó vira um ícone com nome; a seta deixa o
leitor supondo o que passa.

Medido em ago/2026 na trilha das 100 arquiteturas, antes da regra existir: **93 de
668 nós sem nota** (63 deles serviço AWS) e **320 de 685 arestas sem rótulo**.

- ✅ nota: `'devolve parcial, para o modelo começar antes do ponto final'`
- ✅ rótulo: `'trecho citável'`, `'evento do objeto criado'`, `'campo interpretado + confiança'`
- ❌ nota que repete o nome: `service: 'textract'` com `note: 'Textract'`
- ❌ rótulo genérico: `'dados'`, `'chamada'` — diga QUAIS dados, qual chamada

O DSL em `scripts/seo/arq100/comum.py` **recusa** nó sem nota e aresta sem rótulo, e
`arquiteturas-100.test.ts` cobra o mesmo sobre os seeds.

**Desde 07/ago/2026 a regra vale para TODA a base, não só para a trilha gerada.**
`scripts/validate_servicos_diagrama.py` mede os 303 diagramas e reprova, além de
nota e rótulo ausentes: nota que só repete o rótulo ou a chave de `service`,
rótulo genérico (lista curta e fechada — `dados`, `chamada`, `requisição`,
`resposta`, `informação`, `payload`), passo que não acende nó nem aresta, passo
apontando aresta não declarada, e `kind` fora de `plain|vpc|region|account`.

Ele roda em **modo relatório** por enquanto, e isso é decisão: a dívida medida no
dia é de **871 arestas sem rótulo e 218 nós sem nota**, em 172 módulos escritos à
mão (a trilha gerada está em zero, porque o DSL já cobrava). Ligar em falha antes
de pagar a dívida reprovaria todo commit, e a resposta previsível a isso é
desligar o gate. Os números da linha de base estão no cabeçalho do script,
justamente para a descida ser verificável a olho.

---

## Regra nº 3 — 5 a 7 passos percorríveis

> O teto era 6 e passou a 7 em 07/ago/2026, olhando os quatro casos reais que
> excediam. São playbooks em que cada passo nomeia uma alavanca distinta — "cache
> de prefixo", "disciplina de saída", "o que cobra parado". Fundir dois para caber
> em 6 juntaria decisões que não são a mesma. A régua existe para o percurso
> ensinar, não para ele ter um comprimento. **Abaixo de 5 continua sendo defeito**:
> ali o percurso não chega a cobrir a decisão do diagrama.

Cada passo tem `label` curto, `detail` que explica **por que aquele passo existe**,
e os `nodes`/`edges` que ele acende. Aresta em `steps` usa a forma **`"origem>destino"`**
— com um `>` só, e os mesmos `id` das arestas. (O renderizador compara a string
literal: `->` não casa com nada e o passo acende sem aresta, em silêncio. Foi o
primeiro erro que esta skill cometeu ao ser escrita.)

O teste de um bom conjunto de passos: quem leu os passos consegue **reconstruir a
decisão de arquitetura** sem o texto do módulo em volta.

---

## Padrões de referência — sistemas com IA na AWS

Os cinco arquétipos que cobrem quase todo caso real. Comece por um e adapte; não
invente topologia nova quando um destes serve.

### 1. RAG sem servidor sobre acervo interno

**Quando:** perguntar sobre documento que a empresa já tem.

```
Canal (user, browser) → apigateway → lambda
  → knowledgebases (ou: embedder → indice_ann/opensearch/pgvector)
  → bedrock/claude → guardrails → resposta
Observação: cloudwatch + xray em toda chamada
```

Grupos: `Canal` (plain) · `Aplicação` (vpc) · `Recuperação` (vpc) · `Modelo`
(plain) · `Observabilidade` (plain).

O que o diagrama tem de ensinar: **a qualidade é decidida na recuperação**, não na
geração. A aresta que mais importa é a que devolve trecho ao contexto.

### 2. Extração de documento orientada a evento (IDP)

**Quando:** dado estruturado preso em PDF, imagem ou nota fiscal.

```
s3 (chegada) → eventbridge → lambda
  → textract/dataautomation (extração determinística)
  → bedrock/claude (só o campo que exige interpretação)
  → a2i (revisão humana quando a confiança cai)
  → dynamodb/rds (dado estruturado)
```

Ensina duas coisas: **extração especializada primeiro, modelo depois** — e o
caminho explícito de revisão humana como parte do desenho, não como exceção.

### 3. Agente com ferramentas em produção

**Quando:** a tarefa exige agir, não só responder.

```
canal → apigateway → agentcore (ou lambda com laco_agente)
  → ferramenta (lambda) → rds/dynamodb/erp
  → bedrock/claude decide o próximo passo
  guardrails na entrada e na saída · iam por ferramenta · cloudwatch/xray no laço
```

Ensina o ponto que ninguém desenha: **quem executa a ferramenta é o seu código**,
e o teto de voltas é do seu código também. Marque isso num passo.

### 4. Copiloto interno de engenharia

**Quando:** o caso com mais retorno e menos apresentação.

```
ide/slack → apigateway → lambda
  → knowledgebases (código, runbook, incidente)
  → bedrock/claude → resposta com citação da fonte
  identitycenter para quem pode ver o quê
```

Ensina que **material interno já é digitalizado** — e que a permissão da fonte é o
que impede resposta vazar entre times.

### 5. Enriquecimento em lote

**Quando:** classificar, resumir ou rotular acervo sem ninguém esperando.

```
s3 → batch (ou stepfunctions) → bedrock em lote
  → s3 (resultado) → athena/glue para consultar
  budgets + costexplorer no caminho
```

Ensina a alavanca de custo: **lote custa cerca de metade e entrega em janela de
horas** — e por isso só serve onde não há usuário na frente.

### Camadas transversais (entram como grupo, não como nó solto)

- **Segurança:** `iam`, `kms`, `secretsmanager`, `privatelink`, `guardrails`
- **Observabilidade e custo:** `cloudwatch`, `xray`, `otel`, `budgets`,
  `costexplorer`
- **Governança:** `cloudtrail`, `config`, `auditmanager`, `organizations`

Regra editorial: em módulo de certificação, a camada de segurança **entra**, porque
é onde a prova concentra as questões de cenário.

---

## Procedimento

1. **Identifique o padrão.** Qual dos cinco arquétipos o módulo descreve? Se
   nenhum, o módulo provavelmente não precisa de diagrama de arquitetura — pode
   ser caso de `flow_diagram` ou `comparison_table`.

2. **Escreva a decisão primeiro.** Antes de desenhar, escreva a `caption`: qual
   decisão o leitor deve levar. Diagrama sem decisão a comunicar não deveria
   existir.

3. **Monte os grupos por camada**, no máximo 8, com `kind: "vpc"` no que está na
   rede privada.

4. **Confira cada `service` no catálogo** com o `grep` acima. Este é o passo que
   as pessoas pulam e é o que gerou os 148 nós cinzas.

5. **Escreva 5–7 passos.** Cada um acende nós e arestas e explica por que existe.

6. **Rode os gates:**

```bash
python3 scripts/validate_servicos_diagrama.py     # chave fora do catálogo
python3 scripts/validate_bedrock_blocks.py        # bloco inválido = invisível
python3 scripts/validate_primitives_render.py     # campo escrito que não chega à tela
python3 scripts/validate_cobertura_diagramas.py --strict
```

7. **Veja renderizado.** Bloco válido pode ficar ilegível — nove nós num grupo
   viram parede de ícone. `npm run dev` e abra `/aprenda/<slug>`.

---

## Antipadrões

| Antipadrão | Por que dói |
|---|---|
| `service: "network"` | é categoria, não serviço — vira cubo cinza |
| `service: "workflow"` | é nome de glifo — renderiza, sem semântica |
| Diagrama sem `steps` | é figura; o `PADRAO_ENSINO.md` proíbe |
| `caption` que descreve o desenho | desperdiça o único lugar que carrega a conclusão |
| 9+ nós num grupo | parede de ícone; quebre em camadas |
| Todo serviço da AWS no diagrama | diagrama de catálogo não ensina decisão |
| Diagrama igual em dois módulos | se a topologia é a mesma, o módulo é o mesmo |
| Camada de segurança ausente em módulo de certificação | é onde a prova concentra cenário |

---

## Onde procurar exemplo bom no repositório

```bash
# módulos com diagrama, para ler como referência
grep -l '"arch_diagram"' scripts/seeds/articles/*.json | head -20
```

Comece por `caching-performance` (três camadas com dono diferente, legenda que
entrega decisão) e pelos módulos `bedrock-case-*` (arquétipos de front-office,
back-office e interno).

Para **volume com consistência**, a referência é a trilha `trail-arq-ia-aws`: 100
diagramas gerados por `scripts/seo/gerar_arquiteturas_100.py` a partir dos arquivos
`scripts/seo/arq100/familia_*.py`. Ali cada solução declara grupos, arestas, cinco
passos e a legenda num DSL que **valida os limites do schema na hora de gerar** —
estourar `caption` de 600 caracteres ou `note` de 200 faz o bloco desaparecer em
silêncio, e falhar na geração é a única chance de descobrir isso.

O DSL também cobra, em tempo de geração: 5 a 7 passos, no máximo 5 nós por grupo,
aresta de passo que casa com aresta declarada, `vpc` só com recurso em subrede, e
`checagem` — trechos que têm de continuar na cadeia do catálogo, para renomear
serviço lá sem redesenhar aqui falhar em vez de produzir desenho que contradiz a
tabela ao lado.
