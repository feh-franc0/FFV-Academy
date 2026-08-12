# Estratégia de SEO orgânico — ago/2026

> **A tese, em uma frase:** a plataforma deixa de disputar posição de link e passa
> a **ser a resposta** — cada consulta do corpus tem um lugar na plataforma onde é
> respondida por escrito, em formato citável, com link interno que amarra o
> assunto inteiro.
>
> **Insumos:** [`PESQUISA_DEMANDA_BUSCA_2026-08.md`](./PESQUISA_DEMANDA_BUSCA_2026-08.md)
> (a demanda) · [`docs/seo/CORPUS_10K_CONSULTAS.md`](./docs/seo/CORPUS_10K_CONSULTAS.md)
> (as 10.000 consultas) · [`docs/seo/FILA_PERGUNTAS_POR_MODULO.md`](./docs/seo/FILA_PERGUNTAS_POR_MODULO.md)
> (a fila de trabalho, por módulo)
>
> Este documento é o **sistema operacional** dessa captação: os formatos, o
> contrato de escrita, o grafo de links, a medição e os gates que impedem tudo
> isso de apodrecer.

---

## 1. O que mudou, e por que a tática antiga não serve

Três achados da pesquisa derrubam a prática comum de SEO:

**O buscador devolve resposta, não lista.** Resumo de IA aparece em 48% das
buscas, e o clique cai 15,5% quando ele aparece. Otimizar para "posição 1" é
otimizar para um lugar que encolheu.

**Uma consulta vira 8 a 12 sub-consultas.** É o *query fan-out*: o buscador
decompõe a pergunta e busca em paralelo, incluindo variações comparativas que ele
mesmo inventa. **Não se captura um assunto com uma página** — captura-se cobrindo
a superfície de sub-consultas que o assunto gera.

**Cobertura rasa não vira presença.** No estudo de 1.094 categorias, quem aparece
em 1 de 5 arquétipos de prompt carrega penalidade que só desaparece em 3 de 5. Meia
cobertura de um tema não rende meio resultado: rende zero.

**A consequência prática:** a unidade de trabalho passa a ser o **tema**, não a
página. E a unidade de qualidade passa a ser o **trecho citável**, não o artigo.

---

## 2. Os quatro ativos de captação

Cada arquétipo de pergunta precisa de um formato que o responda. A plataforma
tinha um formato só — o módulo — e portanto uma superfície incompleta.

| Ativo | Arquétipo que responde | Estado |
|---|---|---|
| **Módulo** (`/aprenda/<slug>`) | funcionamento, implementação, diagnóstico | 415 no ar |
| **Página de tema** (`/temas/<tema>`) | o assunto como um todo + perguntas de decisão | **19 no ar** |
| **Comparação** (`/vs/<a>-vs-<b>`) | comparação, alternativa | 1 no ar, 106 na fila |
| **Verbete** (`/glossario/<termo>`) | definição | 44 numa única URL |

Regra que organiza os quatro: **um arquétipo, um formato, uma URL**. Responder
definição dentro de um módulo de 14 minutos não captura "o que é X", porque a URL
tem outro assunto principal. Responder comparação numa lista de recursos não
captura "X ou Y", pelo mesmo motivo.

### Por que a página de tema é o centro

Ela é a única URL que representa o **tópico**, que é a unidade que o estudo de
topicalidade mede. Sem ela, existem 415 artigos e nenhum lugar que diga "isto aqui
é o assunto agentes, e a plataforma cobre estes 78 módulos dele".

Ela também é onde as perguntas de **decisão** cabem melhor — "agente ou fluxo
determinístico?" não é assunto de um módulo, é de um tema.

---

## 3. O contrato de resposta citável

Três regras, e nenhuma é estética. Todas têm gate.

### Regra 1 — A pergunta é a pergunta que se digita, e é cabeçalho

Vira `<h3>` no HTML. Cabeçalho genérico ("Sobre agentes", "Quiz rápido") gasta o
sinal mais forte que a página tem.

> **Defeito real:** até ago/2026 as 1.247 perguntas de fixação eram `<p>`, e o
> `<h3>` dizia "Quiz rápido". Três cabeçalhos idênticos por página, e o sinal
> gasto num rótulo.

### Regra 2 — A resposta começa pela conclusão

Primeira frase responde. Contexto vem depois. Resposta que abre em "Antes de
entender X, é importante lembrar que…" tem o **preâmbulo** extraído em vez da
resposta.

O gate `validate_respostas_citaveis.py` recusa dez aberturas de preâmbulo, cada
uma com o motivo escrito na linha.

### Regra 3 — A resposta se sustenta fora da página

Mínimo de 180 caracteres, primeira frase com no máximo 300. Resposta que só faz
sentido com a pergunta ao lado não sobrevive à extração — e é extraída que ela é
citada.

Corolário: **nunca trocar a resposta por um ponteiro.** "Veja o módulo sobre isso"
não responde nada. Quem cita não segue link.

> **Defeito real:** 18 respostas estavam entre 111 e 179 caracteres, e uma tinha
> só dois pares. Todas expandidas em 05/ago/2026 — a expansão acrescentou a
> ressalva que faltava, não texto de enchimento.

### O que NÃO se marca, e por quê

**Sem `FAQPage`.** O resultado enriquecido de FAQ saiu do Google em maio de 2026.
Marcar é trabalho para recurso inexistente. O que faz efeito é a estrutura do
HTML, e ela está feita.

**Sem `QAPage`.** É para página com resposta de usuário — fórum. Usar em conteúdo
editorial descreve algo que não existe.

Há teste registrando as duas decisões, para ninguém "corrigir" isso de boa-fé no
ano que vem.

---

## 4. O grafo de links internos

Link interno é o que faz o buscador associar 78 módulos a um assunto. Quatro
regras, todas verificáveis:

1. **Todo módulo aponta para seus temas.** Chips no fim dos 415 módulos. É o que
   dá ao tema autoridade acumulada em vez de uma página órfã.
2. **Toda página de tema aponta para os módulos e para as trilhas de origem.**
   `ItemList` em JSON-LD e links no corpo.
3. **Todo tema aponta para outros temas.** Oito no rodapé, para que o rastreador
   alcance o conjunto a partir de qualquer ponto.
4. **Nenhum link para rota não publicada.** Tema abaixo do limiar não recebe link
   — chip que aponta para rota não gerada é 404 com aparência de navegação.

A quarta regra é a que mais se esquece, e é a única com custo real: URL que
responde 404 gasta rastreamento de quem confiou no mapa.

---

## 5. O limiar de publicação — a regra que dói

**Tema com menos de 3 módulos não ganha página.** `MINIMO_PARA_PAGINA = 3`.

O número vem do achado de 3-de-5: dois módulos não sustentam três arquétipos. E
página fina **não é neutra** — ela dilui a autoridade do domínio inteiro. Publicar
21 páginas de tema quando duas estão vazias piora as 19 boas.

O que a plataforma faz com a lacuna: mostra. `/temas` tem uma seção **"Em
produção"** com o nome do tema, a promessa e a contagem à vista. A lacuna fica
visível no produto em vez de escondida num documento — o que é, também, um jeito
honesto de dizer ao leitor o que ainda não existe.

---

## 6. O que já está no ar

| Entregue em 05/ago/2026 | Número |
|---|---|
| Páginas de tema com `CollectionPage` + `BreadcrumbList` | **19** |
| Perguntas respondidas nas páginas de tema | **57** (3 por tema) |
| Módulos com chips de tema | **415** |
| Atribuições módulo → tema (geradas) | **982** |
| Módulos com seção `Perguntas frequentes` | **415 de 415 (100%)** |
| **Perguntas respondidas no total** | **1323** — 57 em tema, 1266 em módulo |
| Hub de conhecimento `/perguntas` | **1 URL**, 1323 âncoras descritivas |
| Rotas com canônica declarada | **de 21 para 75** (mais 7 com `noindex` na página e 3 subárvores por header) |
| Gates de conteúdo no CI | **11** |
| Checagens da varredura | **10** — inclui as **524 telas** renderizadas em navegador |

**Dois defeitos encontrados no caminho, ambos invisíveis para todo teste que
existia:**

**23 textos com código inline perdido**, em 14 arquivos. O que estava no ar:

```
"Sim. , , . API aceita campo (lista base64)."
"Em CUDA: divide tensores entre 2 GPUs. Para 4 GPUs: ."
"Endpoints suportados (≈parity com OpenAI): , , , ."
```

Passava por tudo — build, `validate_substancia` (conta caracteres),
`validate_primitives_render` (o bloco é válido), varredura (a página responde 200
com conteúdo). Só um leitor humano vê. Corrigido nos 23, e agora há
`validate_texto_sem_lacuna.py`.

A correção seguiu uma regra: **restaurar só o identificador de que eu tinha
certeza** — comando de CLI documentado, chave de IAM, campo de API estável — e no
resto reescrever a frase para não depender do trecho ausente. Reconstruir de
memória o nome de uma flag ensina algo falso, que é pior que a lacuna.

**18 respostas abaixo do piso de substância**, e uma seção com dois pares. Todas
corrigidas.

---

## 6b. Indexação técnica — a auditoria de 05/ago/2026

Os formatos e o texto resolvem o que é dito. Esta seção é sobre o que o buscador
**consegue processar** — e aqui havia sete defeitos, nenhum visível de dentro.

### O pior: canônica apontando para redirect, em 415 páginas

O servidor **não** usa `trailingSlash`. Medido contra o build de produção:

```
GET /aprenda/o-que-e-ia    → 200
GET /aprenda/o-que-e-ia/   → 308 → /aprenda/o-que-e-ia
```

E as 415 páginas de módulo declaravam:

```html
<link rel="canonical" href="https://fernandofrancovalle.com/aprenda/o-que-e-ia/">
```

**A canônica apontava para uma URL que redireciona.** Canônica-para-redirect é
sinal conflitante: o buscador descarta a declaração e escolhe a URL sozinho. A
plataforma estava entregando de graça a decisão mais importante que uma página
toma sobre si mesma.

A mesma forma com barra estava no `Article` em JSON-LD (`url` e
`mainEntityOfPage.@id`) e nos 415 links do `llms.txt` — enquanto o **sitemap**
publicava a forma sem barra. Sitemap e canônica discordando é o cenário em que o
buscador ignora as duas.

**Convenção adotada: sem barra final**, porque é a que o servidor já aplica.
Mudar o servidor moveria 415 URLs de uma vez, sem ganho nenhum.

### Os outros seis

| Defeito | Escala | Correção |
|---|---|---|
| Rotas indexáveis **sem canônica** | **71**, incluindo a home, os 7 hubs e as 39 trilhas | canônica declarada em todas |
| Rotas de `/admin` **indexáveis** | 13 | `X-Robots-Tag: noindex` por header + `disallow` no robots.txt |
| Rotas pessoais indexáveis (`/progresso`, `/perfil`, `/revisar`) | 3 | `noindex` na página |
| `/progresso` e `/revisar` **no sitemap** pedindo noindex | 2 | fora do sitemap |
| **Nenhuma entidade do site** — só `publisher` inline sem `@id` | 415 páginas | `@graph` no layout raiz |
| `/perguntas` nasceu **órfã** — 168 links de saída, nenhum de entrada | 1 | link no rodapé |

### Duas decisões que exigiram cuidado

**`/admin` é client component.** `src/app/admin/layout.tsx` tem `'use client'`, e
client component **não pode exportar `metadata`**. As 13 rotas não tinham controle
de indexação nenhum. A solução é `X-Robots-Tag` por header, que é o único
mecanismo que alcança a subárvore inteira e é autoritativo mesmo em página que só
existe depois da hidratação. `robots.txt` também passou a proibir — e os dois
fazem trabalhos diferentes: o robots impede o **rastreamento**, o header impede a
**indexação de URL descoberta por outro caminho**.

**Rota pessoal NÃO entra no `disallow`.** `/progresso`, `/perfil` e `/revisar`
declaram `noindex` na própria página. Bloquear o rastreamento delas impediria o
buscador de **ler** esse noindex — a URL ficaria no índice sem descrição, que é o
pior dos dois mundos. Há teste registrando essa distinção, porque ela é
contraintuitiva e alguém vai querer "reforçar" a proteção adicionando ao robots.

### O grafo de entidades

Antes: um `publisher: {'@type': 'Organization', name: 'FFV Academy'}` repetido em
cada artigo, sem `@id`. Para o buscador, **415 organizações homônimas**, não uma
escola com 415 artigos.

Agora, `src/lib/site-jsonld.ts` declara um `@graph` uma única vez no layout raiz:

- **`EducationalOrganization`** — a escola, com logo e `@id` estável;
- **`Person`** — o autor, com `sameAs` para GitHub, LinkedIn e X. É o sinal de
  experiência mais direto que um site de autor único tem;
- **`WebSite`** — o site, com `publisher` apontando para a escola por `@id`.

As páginas passam a **referenciar** por `@id` em vez de redeclarar. O `Article`
mantém `name` e `logo` junto do `@id` porque o validador de artigo os pede na
própria declaração — declarar os dois não é redundância, é o que faz passar na
validação **e** somar ao grafo.

**Sem `SearchAction`**, de propósito: a caixa de busca em resultado exige uma URL
de busca com parâmetro, e a rota `/search` foi removida no pivot de jul/2026.
Declarar apontaria para 404. Quando existir `/busca?q=`, entra.

### A nona checagem da varredura

Teste de código prova que a string da canônica não tem barra. **Só a requisição
prova que a URL não redireciona.** A checagem nova pega a canônica no HTML servido
e faz `GET` nela com `maxRedirects: 0`, exigindo 200 — em amostra que inclui home,
hubs, temas, `/perguntas` e módulos. Também confere o `@graph` na home, o
`X-Robots-Tag` em `/admin` e a âncora descritiva em `/perguntas`.

Essa última pegou um defeito meu: a âncora incluía o nome do módulo **depois** da
pergunta, então o texto do link não era a pergunta. O nome do destino saiu para
fora do `<a>`.

---

## 7. A fila, em ordem

A ordem não é de esforço — é de **retorno por unidade de trabalho**, dado que os
formatos já existem.

| # | Trabalho | Volume | Por que aqui |
|---|---|---|---|
| ~~**1**~~ | ~~`Perguntas frequentes` nos módulos~~ — **415 de 415 feitos**, gate invertido | — | A fonte está pronta: [`FILA_PERGUNTAS_POR_MODULO.md`](./docs/seo/FILA_PERGUNTAS_POR_MODULO.md) já lista as consultas de cada um. Cada módulo ganha 3 respostas citáveis sem página nova. |
| **2** | Trilha de **busca com IA (GEO/AEO)** | 10 módulos | Cobertura zero, concorrência zero em PT-BR, e a plataforma tem o caso real — esta rodada inteira é material de aula. Desbloqueia o 20º tema. |
| **3** | **Comparações** `/vs/` | 106 páginas | Arquétipo que o fan-out gera sozinho. O molde existe e é bom; falta virar dado + template. |
| **4** | **Verbetes** com URL própria | 44 → ~200 | Atende 1.497 consultas de definição. Depois das comparações porque é o mais próximo da fronteira de conteúdo raso. |
| **5** | Trilha de **carreira** (8) e de **conformidade** (8) | 16 módulos | Maior intenção de conversão do corpus. Exige pesquisa de dado brasileiro atualizado, que envelhece — por isso não é o primeiro. |
| **6** | 14 módulos das entidades "só mencionadas" | 14 | Fecha as lacunas de assunto quase-coberto. |

### Como executar o item 1 (o de maior volume)

```bash
# 1. a fila, por módulo, já ordenada por origem da consulta
open docs/seo/FILA_PERGUNTAS_POR_MODULO.md

# 2. escreva 3 pares no seed do módulo, seção "Perguntas frequentes"
#    antes da seção "Fixando" (pergunta aberta vem antes do exercício)

# 3. o contrato é verificado por gate
python3 scripts/validate_respostas_citaveis.py
python3 scripts/validate_texto_sem_lacuna.py

# 4. regenerar a fila remove o módulo dela
python3 scripts/seo/gerar_corpus.py
```

---

## 8. O que não fazer

Cada item aqui é uma tentação real que aumentaria tráfego de curto prazo e
custaria o que a plataforma tem de defensável.

**Não perseguir volume fora do eixo.** `phishing` (290 mil/mês), `malware` (170
mil) e `blockchain` (160 mil) somam 620 mil buscas mensais e **não devem ser
cobertos**. Estão fora do eixo IA/Claude/AWS escolhido em jul/2026. Volume não é
argumento suficiente.

**Não gerar conteúdo por molde sem revisão.** O corpus tem 9.310 consultas
derivadas por expansão. Transformá-las em páginas automaticamente produziria
milhares de textos plausíveis e vazios — que é exatamente o que os resumos de IA
aprenderam a descartar, e o oposto do motivo pelo qual a plataforma existe.

**Não publicar página fina para "cobrir" um tema.** Ver a regra do limiar. A
plataforma prefere admitir a lacuna.

**Não criar página de porta de entrada** — variação de cidade, de sinônimo, de
"melhor X para Y" sem conteúdo próprio. É violação explícita de diretriz e o
retorno some no primeiro ajuste de algoritmo.

**Não empilhar palavra-chave em `keywords`.** O campo não tem peso de
posicionamento há mais de uma década. Ele sobrevive aqui porque alimenta a busca
interna e o corpus de demanda — usos reais, não posicionamento.

**Não trocar resposta por CTA.** "Quer saber mais? Faça nossa trilha" no lugar da
resposta é o padrão que faz o buscador citar o concorrente.

---

## 9. Medição

Sem isto, a estratégia é fé.

### Painel externo, mensal

1. **Search Console agrupado pelos 21 temas.** A métrica que importa é
   **impressão por tema**, não posição média — com resumo de IA no topo, posição
   virou proxy ruim.
2. **Tráfego por referenciador de IA:** `chatgpt.com`, `perplexity.ai`,
   `gemini.google.com`, `claude.ai`. É o único sinal direto de citação disponível
   sem ferramenta paga.
3. **Conjunto fixo de 40 prompts** — 2 por tema — rodados mensalmente contra
   ChatGPT, Claude e Gemini, registrando se a FFV é citada. Amostra pequena, mas
   repetível e comparável no tempo, que é o que falta em toda métrica de IA hoje.

### Painel interno, a cada geração

4. **Consultas sem dono:** 371 de 10.000 hoje. Cai conforme a fila avança.
5. **Cobertura de `Perguntas frequentes`:** 30 de 415. É o número que o item 1 da
   fila move.
6. **Módulos por tema:** nenhum tema publicado abaixo de 3; meta de 8.

### Os gates — e o que deliberadamente não é gate

Onze gates de conteúdo travam o que é verificável por máquina. Os dois novos:

| Gate | O que impede |
|---|---|
| `validate_respostas_citaveis.py` | resposta com preâmbulo, curta, sem interrogação, ou que aponta para outro lugar |
| `validate_texto_sem_lacuna.py` | frase com trecho de código inline perdido |

**As três primeiras métricas não viram gate**, de propósito: dependem de dado
externo que muda por razão alheia ao repositório. Gate sobre número que o time não
controla ensina o time a ignorar gate.

E nenhum gate julga se a resposta está **correta**. Isso é revisão humana, e os
gates não fingem o contrário.

---

## 10. Cronograma de 90 dias

| Semanas | Foco | Resultado verificável |
|---|---|---|
| ~~1–2~~ | ~~6 trilhas de maior intenção~~ — **feito em 05/ago/2026**: Claude Code, Claude Code Pro, API Claude & Agents, Anthropic Practitioner, Fundamentos da IA, Engenharia AI-Native, AIF-C01, Bedrock e CLF-C02 | cobertura de 30 → **156** módulos |
| 3–4 | Trilha de GEO/AEO (10 módulos) | 20º tema publicado; `temas.test.ts` falha na linha da lacuna e ela sai |
| 5–7 | Comparações: dado + template + 40 primeiras páginas | `/vs/` no ar, com índice e `ItemList` |
| 8–9 | `Perguntas frequentes` nas trilhas AWS restantes (SAA, SAP, DVA) e nos fundamentos | cobertura em ~230 |
| 10–11 | Verbetes com URL própria: 80 primeiros | arquétipo de definição com formato próprio |
| 12–13 | Trilha de carreira (8 módulos) + primeira medição comparativa | 21º tema; painel com 3 meses de série |

A primeira medição comparável só existe no fim — indexação e citação têm inércia
de semanas. Prometer resultado antes disso seria inventar.

---

## 11. Limites desta estratégia

1. **Não há volume de busca em português.** A priorização usa volume publicado em
   inglês como ordenador, nunca como previsão de tráfego.
2. **A citação em resposta de IA não é auditável.** Não existe relatório oficial.
   O conjunto de 40 prompts é amostra, e amostra pequena.
3. **9.310 das 10.000 consultas são derivadas.** Cada uma passa por juízo humano
   antes de virar conteúdo. O corpus é fila de trabalho, não pauta aprovada.
4. **O item de maior volume da fila está fechado.** Os 415 módulos respondem, e o
   gate impede regressão. O que resta são os formatos novos — comparações,
   verbetes com URL própria — e as três trilhas de assunto ausente.
5. **`validate_texto_sem_lacuna.py` pega lacuna com pontuação órfã**, não toda
   lacuna. Um caso encontrado nesta rodada — "ExecuTorch tem o que delega partes
   do graph" — perdeu o substantivo e continuou gramatical; nenhum gate pegaria.
   Revisão humana continua sendo a única defesa contra frase que ficou plausível.
