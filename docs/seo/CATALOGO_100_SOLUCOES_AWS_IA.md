# Catálogo de 100 soluções de IA na AWS

> **O que é.** Cem problemas reais com a arquitetura que os resolve na AWS, a
> decisão que cada uma ensina e a origem da informação. É o material de apoio do
> módulo [`100 soluções de IA na AWS`](/aprenda/aws-ia-100-solucoes).
>
> **As cem arquiteturas desenhadas.** A coluna "Arquitetura" abaixo é uma cadeia
> em texto (`A → B → C`), e ela não mostra o que roda em paralelo, o que é
> assíncrono nem onde entra a revisão humana. Cada uma das cem tem um diagrama
> percorrível de cinco passos na trilha
> [100 Arquiteturas de IA na AWS](/arquiteturas-ia-aws) — dez módulos, um por
> família. Os diagramas são **gerados a partir deste documento** por
> `scripts/seo/gerar_arquiteturas_100.py`, que falha se a cadeia mudar por baixo do
> desenho.
>
> **Como ler a coluna Origem** — e essa é a parte honesta do documento:
>
> | Origem | Significa |
> |---|---|
> | **C** | **Caso público documentado**, com fonte citada. Números são os que a fonte publica. |
> | **A** | **Arquitetura de referência da AWS** — Solutions Library, Prescriptive Guidance, Well-Architected ou blog oficial. |
> | **P** | **Padrão composto**, derivado das duas acima. Sem caso público único; é a topologia que se repete. |
>
> `P` não é invenção: é a generalização de arquiteturas publicadas. O que ele não
> tem é um cliente nomeado, e o catálogo diz isso em vez de sugerir que tem.
>
> As fontes estão listadas ao final, numeradas. A contagem por origem, **medida
> pelo gerador** e não estimada: **21 C · 32 A · 47 P**. (O cabeçalho dizia
> "28 · 34 · 38" na primeira versão — número escrito de cabeça, corrigido pela
> contagem real. Se o catálogo mudar de forma, `scripts/seo/gerar_modulo_100.py`
> falha em vez de gerar módulo com número errado.)

---

## Como usar este catálogo

Cada linha responde quatro perguntas na ordem em que elas importam:

1. **Qual o problema** — em termos de negócio, não de serviço.
2. **Qual a arquitetura** — os serviços em sequência, com o que decide entre eles.
3. **O que ela ensina** — a decisão transferível. É a parte que sobrevive quando
   o serviço mudar de nome.
4. **De onde vem** — origem e fonte.

**A armadilha de catálogo de solução:** copiar a topologia sem a decisão. Uma
arquitetura de RAG sem entender que a qualidade é decidida na recuperação produz
um sistema que parece o desenho e responde errado. É por isso que a terceira
coluna existe.

---

## 1. Atendimento e experiência do cliente

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 1 | Contact center com fila alta e respostas inconsistentes | Connect → Lex/Transcribe → Bedrock (Claude Haiku) → Knowledge Bases → transferência humana | Modelo pequeno e rápido vence modelo grande quando a latência é o requisito: o alvo era resposta em ≤2,5 s | **C** [1] |
| 2 | Chamadas de voz em volume, com risco de resposta errada | Connect → Transcribe (fluxo) → Bedrock → Guardrails → escalonamento humano | Escalonamento é caminho de primeira classe, não exceção — 15 mil chamadas/dia exigem que a saída para humano seja parte do desenho | **C** [2] |
| 3 | Escalonamento excessivo do agente virtual para humano | Bedrock (Claude) com ferramentas de sistema de atendimento + memória de sessão | Agente que consulta o estado real do pedido escalona menos: a redução de até 40% vem de ter ferramenta, não de prompt melhor | **C** [3] |
| 4 | Assistente de concessionária sem acesso à informação oficial | Bedrock AgentCore → Knowledge Bases sobre manuais e boletins → resposta com citação | RAG sobre documento oficial substitui treinar modelo: o acervo muda toda semana, e treino não acompanha | **C** [4] |
| 5 | Atendimento fora do horário sem cobertura humana | AgentCore autônomo → ferramentas de agendamento e CRM → registro de trilha | Autonomia se conquista por escopo estreito: o agente só age no que tem ferramenta e permissão | **C** [5] |
| 6 | Assistente de compras que não conhece o catálogo | API Gateway → Lambda → Bedrock Agents → Knowledge Bases de catálogo + grupo de ação de estoque | Recomendação precisa de duas fontes: conhecimento (catálogo) e estado (estoque). Só a primeira gera sugestão de produto esgotado | **A** [6] |
| 7 | Cliente pergunta em português e o acervo está em inglês | Bedrock multilíngue + Translate no acervo indexado, não na consulta | Traduzir o acervo uma vez custa menos que traduzir toda consulta — e preserva o termo técnico | **P** |
| 8 | Resumo de conversa para o próximo atendente | Connect Contact Lens → S3 → Bedrock em lote → CRM | Resumo é trabalho de fundo: ninguém espera, então lote custa metade | **P** |
| 9 | Detecção de intenção antes de acionar o modelo grande | Comprehend (classificação) → roteamento → Bedrock só no que exige geração | Classificar com serviço especializado antes de gerar é a alavanca de custo mais ignorada em atendimento | **P** |
| 10 | Agente de voz com interrupção do usuário | Connect → transcrição em fluxo → Bedrock em fluxo → Polly por frase, com corte na fala do usuário | O que define a percepção é o tempo até o primeiro som, não o total | **P** |

---

## 2. Documento, extração e processamento inteligente

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 11 | Dado estruturado preso em PDF e imagem, em volume | S3 → EventBridge → Lambda → Bedrock Data Automation / Textract → Bedrock (só o campo interpretativo) → DynamoDB | Extração determinística primeiro, modelo depois. Modelo grande lendo nota fiscal padronizada é o desperdício clássico | **A** [7] |
| 12 | Processo de empréstimo com documento manual | AgentCore Runtime orquestrando agentes de classificação, extração e validação, com DynamoDB de rastreamento | Orquestração por agente vale quando o número de passos depende do documento que chegou | **A** [8] |
| 13 | Documento em ERP sem trilha de auditoria | Textract → SDK para ABAP → Bedrock (assistente de auditoria) → registro no ERP | Integração com sistema de registro é o requisito que decide o projeto, não a qualidade da extração | **A** [9] |
| 14 | Prontuário digitalizado que precisa virar dado clínico padronizado | S3 → Bedrock Data Automation → transformação → HealthLake (FHIR) | Padrão de interoperabilidade é o destino: extrair sem normalizar para o padrão não resolve o problema do consumidor | **A** [10] |
| 15 | Documento técnico e legal de seguro agrícola difícil de consultar | Knowledge Bases sobre normas e regras de peritagem → Bedrock com citação | Em domínio regulado, resposta sem citação da norma é inútil: quem lê precisa verificar | **C** [11] |
| 16 | Sinistro com documentos variados e prazo de resposta | Fila por evento → BDA → classificação → extração → revisão humana quando a confiança cai | Limiar de confiança POR CAMPO, não agregado: o campo que alimenta decisão financeira exige revisão que o informativo não exige | **P** |
| 17 | Contrato longo com cláusula que precisa ser achada | Chunk por cláusula com contexto → índice híbrido → reordenação → Bedrock | Corte por unidade semântica (a cláusula) vence corte fixo por tamanho em documento jurídico | **P** |
| 18 | Documento multimodal — texto, tabela e figura no mesmo arquivo | Bedrock Data Automation + Knowledge Bases multimodal → recuperação por modalidade | Extrair texto de documento com layout perde a informação que o layout carregava | **A** [12] |
| 19 | Fila de documentos com pico sazonal | S3 → SQS → Lambda com concorrência reservada → Bedrock em lote | Nivelar com fila protege o limite de taxa do modelo; a alternativa é falhar no pico | **P** |
| 20 | Rastro exigido por auditoria em extração automática | Cada extração grava versão do modelo, entrada, saída e confiança em DynamoDB + CloudTrail | Auditoria não pergunta o acerto médio: pergunta como aquele número específico foi obtido | **P** |

---

## 3. Busca e conhecimento interno

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 21 | Conhecimento espalhado em SharePoint e Confluence | Managed Knowledge Base com conectores → sincronização → agente com recuperação | Conector gerenciado troca controle de corte por tempo de implantação; comece por ele e assuma o controle quando a avaliação exigir | **C** [13] |
| 22 | Busca corporativa que agentes possam consumir | Managed Knowledge Base exposta por gateway MCP → qualquer cliente compatível | Expor por protocolo padrão evita reescrever integração para cada arcabouço de agente | **A** [14] |
| 23 | Resposta que precisa citar a fonte para ser aceita | Knowledge Bases → Bedrock com citação obrigatória → validação de que o trecho existe | Citação verificável transforma alucinação em erro detectável sem julgamento humano | **A** [15] |
| 24 | Pergunta que exige combinar dois documentos | Recuperação agêntica multi-salto: o agente busca, lê, reformula e busca de novo | Recuperação única não responde pergunta que depende de duas fontes — e o custo é mais voltas | **A** [14] |
| 25 | Permissão de acesso ao acervo por usuário | Filtro por metadado na consulta + permissão da fonte na ingestão | Índice único sem filtro por usuário é como dado restrito fica respondível por quem não deveria vê-lo | **P** |
| 26 | Consulta específica (código de erro, sigla) não é achada | Índice híbrido: vetorial + léxico, fusão por posição | Busca vetorial dilui token raro. Em acervo técnico, é o léxico que salva a consulta de maior intenção | **A** [16] |
| 27 | Acervo grande com custo de armazenamento vetorial | S3 Vectors ou pgvector conforme o volume, com classe de armazenamento por frequência de acesso | O índice vetorial mora em memória e passa a definir o tamanho da instância — é ele que dita o custo, não o disco | **A** [17] |
| 28 | Documento novo demora a aparecer na busca | Ingestão incremental disparada por evento no S3, não sincronização agendada | Frescor é requisito de produto: "atualiza toda noite" é decisão, e precisa ser dita ao usuário | **P** |
| 29 | Qualidade da recuperação não é medida | Bedrock Evaluations sobre conjunto de referência anotado, separando recuperação de geração | Sem separar as duas etapas, todo problema parece do modelo — e na maioria dos casos ele não tinha o trecho certo | **A** [15] |
| 30 | Reindexar tudo ao trocar de modelo de embedding | Versão do índice por modelo, com virada por alias após validação | Trocar de embedding é reindexar o acervo inteiro — é a decisão mais difícil de reverter em RAG | **P** |

---

## 4. Agentes operacionais — quando a IA precisa agir

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 31 | Decisão logística que levava horas | AgentCore + Claude Sonnet com ferramentas de roteirização e estoque | Redução de 90% no tempo de decisão vem de o agente ter acesso ao estado real, não de ele "pensar melhor" | **C** [18] |
| 32 | Cinco produtos agênticos que precisam ir do protótipo à produção | AgentCore Runtime com memória, identidade e observabilidade gerenciadas | Runtime gerenciado encurta semanas de infraestrutura; o que ele não resolve é o critério de parada da sua tarefa | **C** [5] |
| 33 | Pesquisa de medicamento com etapas manuais | Bedrock Agents com grupos de ação sobre bases científicas internas | Agente em pesquisa é orquestrador de ferramenta especializada, não substituto do especialista | **C** [19] |
| 34 | Triagem de alerta de segurança consumindo horas de analista | Bedrock (Claude) analisando alerta com contexto + ferramenta de enriquecimento | 23× de economia com 95% de acerto: o ganho é triar o volume, e o analista fica no que sobrou | **C** [20] |
| 35 | Ingestão de fonte de dado que levava semanas | Agente sobre AgentCore inferindo esquema e gerando o pipeline, com observabilidade | De até 8 semanas para cerca de 40 minutos: o ganho é em trabalho repetitivo de descoberta de esquema | **C** [21] |
| 36 | Compliance em saúde com seis produtos separados | Um agente unificado sobre AgentCore, com ferramenta por produto | Consolidar em um agente com muitas ferramentas vence seis agentes com uma cada — menos contexto duplicado | **C** [22] |
| 37 | Agente que precisa agir em sistema legado | Agente → Lambda como adaptador → ERP/mainframe, com validação de argumento | Quem executa a ferramenta é o seu código: a fronteira de segurança é o adaptador, não o prompt | **P** |
| 38 | Agente entra em laço e consome orçamento | Teto de passos e de gasto no código, ferramenta que devolve erro explícito em vez de vazio | Vazio é ambíguo e o modelo tenta de novo. "Nenhum resultado" encerra o laço | **P** |
| 39 | Ação irreversível disparada por decisão automática | Confirmação humana obrigatória na ferramenta de escrita, com registro | Separar ferramenta de leitura e de escrita é o que permite permissão granular | **P** |
| 40 | Agente de evento que precisa reagir a mudança | EventBridge → AgentCore → Knowledge Bases + ferramenta de ação | Agente orientado a evento troca consulta periódica por reação — e reduz custo de ociosidade | **A** [23] |

---

## 5. Copiloto de engenharia e produtividade interna

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 41 | Modernizar aplicação legada com esforço alto | AWS Transform sobre o código, com revisão humana por módulo | 40% menos esforço de desenvolvimento e 300 dias de engenharia economizados — em migração, o ganho é em trabalho mecânico | **C** [24] |
| 42 | Pergunta repetida no canal do time | Knowledge Bases sobre código, runbook e histórico de incidente → Bedrock com citação | Material interno já é digitalizado: é o caso com retorno mais rápido e menos risco de imagem | **P** |
| 43 | Revisão de código que não escala | Agente em CI com diff como entrada e critério de saída explícito | "Revise este PR" produz opinião genérica; "aponte só o que quebra em produção, com arquivo e linha" produz achado acionável | **P** |
| 44 | Geração de código sem barreira de segurança | Bedrock Guardrails aplicado ao fluxo de geração, com política de conteúdo e de segredo | Guardrails em geração de código filtra o que o modelo produz; permissão é que impede o que ele executa | **A** [25] |
| 45 | Documentação que envelhece | Agente em lote sobre o repositório, abrindo pedido de mesclagem com a atualização | Documentação gerada sem revisão humana vira ruído — o padrão é o agente PROPOR, não publicar | **P** |
| 46 | Onboarding lento de quem entra no time | Assistente interno com o contexto do projeto e as convenções da casa | O que reduz tempo até o primeiro commit é convenção acessível, não mais documentação | **P** |
| 47 | Consulta a banco por quem não escreve SQL | Bedrock com esquema no contexto → SQL gerado → execução em réplica de leitura com limite | Gerar SQL é fácil; a parte difícil é limitar o que ele pode consultar e quanto pode varrer | **C** [26] |
| 48 | Análise de conteúdo com revisão manual longa | Bedrock classificando e resumindo em lote, com amostragem humana | Redução de 95% no tempo de revisão vem de triar, não de eliminar o revisor | **C** [26] |
| 49 | Plataforma de IA para milhares de funcionários | Portal interno com cota, roteamento de modelo e atribuição de custo por time | Sem portal, cada aplicação reimplementa autenticação, cota e custo — e nenhuma implementa as três | **C** [27] |
| 50 | Agente de engenharia sem observabilidade | Rastro por chamada de ferramenta com identificador único, em CloudWatch e X-Ray | "O agente travou" só é investigável com um trecho de rastro por ferramenta | **A** [28] |

---

## 6. Dados, analytics e BI conversacional

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 51 | Pergunta de negócio que exige SQL | Bedrock com catálogo de dados no contexto → SQL → Athena/Redshift com limite de varredura | Catálogo bem descrito rende mais que prompt elaborado: o modelo não adivinha o significado da coluna | **P** |
| 52 | Painel que ninguém consulta porque a pergunta muda | Camada conversacional sobre o armazém, com consulta gerada e explicada | Explicar a consulta gerada é o que dá confiança para o usuário aceitar o número | **P** |
| 53 | Custo de consulta gerada sem controle | Limite de dado varrido por consulta, particionamento e formato colunar | Formato colunar com particionamento corta o dado varrido em ordem de magnitude — é a otimização de maior retorno | **P** |
| 54 | Qualidade de dado que quebra o relatório | Testes de volume, unicidade, nulo e integridade na fronteira de cada etapa | Testar só no fim descobre o problema depois de propagado por todas as transformações | **P** |
| 55 | Enriquecimento de acervo existente com classificação | S3 → Batch/Step Functions → Bedrock em lote → S3 → Glue/Athena | Lote custa cerca de metade e entrega em janela de horas: serve para tudo sem usuário na frente | **P** |
| 56 | Detecção de anomalia em série temporal | ML clássico (previsão) + Bedrock só para explicar o desvio em linguagem | Previsão é tarefa de modelo tabular; o modelo de linguagem entra na explicação, não no cálculo | **P** |
| 57 | Catálogo de dado sem descrição utilizável | Bedrock gerando descrição de coluna a partir de amostra, com aprovação humana | Metadado gerado sem revisão propaga erro para toda consulta que confia nele | **P** |
| 58 | Mudança de esquema que quebra o consumidor | Formato de tabela aberto com evolução de esquema e histórico | Viagem no tempo é o recurso que mais salva em incidente de pipeline | **P** |
| 59 | Captura de mudança do banco operacional para o analítico | Registro de transações → captura → fila → destino analítico, com monitoramento de defasagem | A retenção do registro é o risco: consumidor parado tempo suficiente exige recarga completa | **P** |
| 60 | Dado sensível no acervo analítico | Macie para descoberta + mascaramento antes da ingestão + permissão em nível de coluna | O que não entra no acervo não vaza por consulta nenhuma | **P** |

---

## 7. Conteúdo, mídia e personalização

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 61 | Narrativa de evento ao vivo com dado em tempo real | Fluxo de dado → agente sobre AgentCore → geração de texto para a transmissão | Em tempo real, o gargalo é o dado chegar pronto, não o modelo gerar | **C** [21] |
| 62 | Modelo visual de fronteira que exige treino próprio | SageMaker HyperPod para treino distribuído com resiliência de nó | Treino de fronteira é problema de infraestrutura: falha de GPU no meio é rotina, e retomar é o requisito | **C** [29] |
| 63 | Personalização de comunicação em escala | Personalize para o quê + Bedrock para o como, com marca e tom controlados | Recomendação e redação são problemas diferentes: um modelo para escolher, outro para escrever | **P** |
| 64 | Moderação de conteúdo gerado por usuário | Rekognition/Comprehend para o determinístico + Bedrock Guardrails para o resto | Serviço especializado é mais barato e determinístico; o modelo entra no caso ambíguo | **P** |
| 65 | Legenda e transcrição de acervo de vídeo | Transcribe em lote → Bedrock para resumo e capítulo → S3 | Acervo grande é caso de lote: latência não importa e o desconto é grande | **P** |
| 66 | Tradução com terminologia de marca | Translate com glossário customizado + Bedrock para revisão de tom | Glossário resolve terminologia melhor que prompt: ele é determinístico | **P** |
| 67 | Geração de imagem com identidade de marca | Bedrock (modelo de imagem) com condicionamento espacial e adaptador de estilo treinado | Condicionamento controla estrutura de uma geração; adaptador ensina estilo de forma persistente | **P** |
| 68 | Resumo de reunião com ação atribuída | Chime SDK → Transcribe → Bedrock com saída estruturada por schema | Saída que alimenta código exige schema; sem ele, o tratamento de texto quebra em produção | **P** |
| 69 | Busca dentro de vídeo por conteúdo falado | Transcribe → índice híbrido com marca de tempo → Bedrock para responder citando o minuto | Citação com marca de tempo é o que torna a resposta verificável em mídia | **P** |
| 70 | Voz sintética para atendimento em português | Polly com voz neural + fluxo por frase, com cache de frase fixa | Frase fixa cacheada elimina a síntese repetida — a parte variável é a única que precisa ser gerada | **P** |

---

## 8. Risco, fraude, seguro e conformidade

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 71 | Custo de subscrição de seguro alto e lento | Assistente virtual sobre Bedrock com acesso ao histórico e às regras | Redução de até 80% no custo de subscrição, de dias para horas: o ganho é em leitura e conferência de documento | **C** [30] |
| 72 | Análise de risco com regra escrita à mão que não acompanha | Fraud Detector / modelo tabular para o escore + Bedrock para explicar a decisão | Explicabilidade é requisito regulatório: o escore decide, o texto justifica | **P** |
| 73 | Modelo próprio de crédito para público sem histórico | Modelo de fundação próprio treinado em dado transacional, servido em plataforma de ML | Modelo proprietário se justifica quando o dado é o diferencial — e é a exceção, não a regra | **C** [31] |
| 74 | Dado de cliente que não pode sair do perímetro | Bedrock com endpoint privado, sem tráfego pela internet pública, e IAM por modelo | Endpoint privado controla o CAMINHO; IAM controla a AUTORIZAÇÃO. Confundir gera rede fechada com permissão aberta | **A** [32] |
| 75 | Conformidade que precisa ser demonstrável continuamente | Config para avaliação de configuração + Audit Manager para evidência mapeada ao controle | Auditoria de foto anual não diz nada sobre os outros 364 dias | **P** |
| 76 | Decisão automatizada que precisa ser reconstituída | Registro de modelo, versão, prompt, contexto, saída e ator, com retenção definida | "Por que o sistema recusou este caso" é a pergunta da auditoria — e ela só tem resposta se foi registrada | **A** [33] |
| 77 | Habilitação de modelo caro em região não aprovada | Política de controle de serviço com negação condicional por região e por modelo | Negação condicional é preventiva; alarme de custo é detectivo. O incidente típico é de configuração, não de código | **P** |
| 78 | Dado pessoal chegando ao contexto do modelo | Redação antes de montar o prompt, não na saída | O que não entra no contexto não vaza por resposta, por registro nem por cache | **A** [34] |
| 79 | Requisito regulatório sobre onde o dado é processado | Escolha de região com inferência restrita a ela, documentada | Inferência entre regiões melhora disponibilidade e pode violar requisito de residência — a decisão é explícita | **P** |
| 80 | Terceiro com acesso ao acervo interno | Ligação privada expondo o serviço sem juntar as redes, com credencial de menor privilégio | Compartilhar serviço não exige compartilhar rede — é a confusão que gera acesso amplo demais | **P** |

---

## 9. Plataforma de IA corporativa

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 81 | Vários times consumindo modelo sem controle de custo | Portal de IA multi-inquilino com rastreamento de uso e cota por time | Custo de IA é variável por uso: sem atribuição, a conta é um número que ninguém sabe reduzir | **A** [35] |
| 82 | Custo por inquilino invisível na fatura | Perfil de inferência de aplicação por inquilino + etiqueta de alocação | O perfil de inferência é o que faz o gasto aparecer separado — etiqueta sozinha não separa chamada de modelo | **A** [36] |
| 83 | Metadado de requisição para atribuir consumo | Converse API com metadado de requisição → ETL com Glue → painel no QuickSight | Atribuir na chamada é mais confiável que inferir depois pelo registro | **A** [37] |
| 84 | Isolamento entre inquilinos com infraestrutura compartilhada | Modelo de reservatório em AgentCore, com identidade por inquilino | Isolamento por contexto não basta: identidade e permissão por inquilino é o que impede vazamento entre eles | **A** [38] |
| 85 | Muitas contas precisando alcançar o mesmo serviço de IA | Topologia de concentrador e raios com portal de trânsito, rede compartilhada por conta central | Sem compartilhamento de recurso, cada conta recria a rede e a topologia deixa de ser administrável | **A** [39] |
| 86 | Custo de inferência com prompt repetido | Cache semântico persistente em MemoryDB antes de chamar o modelo | Cache semântico responde o quase-igual em milissegundos; o cuidado é o limiar de similaridade | **A** [40] |
| 87 | Modelo grande usado em tarefa simples | Roteamento por dificuldade com classificador, com avaliação própria do roteador | O roteador errar a classificação degrada em silêncio — por isso ele precisa de conjunto de avaliação | **P** |
| 88 | Escolha de modelo sem critério | Bedrock Evaluations com os mesmos casos em dois candidatos, comparando acerto e custo | Ranking público mede outro corpus. A decisão é medir na sua tarefa | **A** [15] |
| 89 | Prompt como texto colado sem versão | Prompt Management com versão e alias, referenciado pela aplicação | Sem versão de prompt não há como investigar regressão — e prompt muda mais que código | **A** [41] |
| 90 | Orquestração que a área de negócio precisa alterar | Bedrock Flows para fluxo estável e visível; código quando há erro fino e teste | Fluxo visual é difícil de versionar em revisão e de testar isolado — a troca é visibilidade por controle | **A** [41] |

---

## 10. Operação, segurança e confiabilidade de IA

| # | Problema | Arquitetura | O que ensina | Origem |
|---|---|---|---|---|
| 91 | Injeção indireta vinda de conteúdo recuperado | Marcar conteúdo externo como entrada de usuário no Guardrails + permissão que limita ação | Filtro de texto não separa dado de comando. O que resolve é o agente não PODER fazer o que a instrução hostil pede | **A** [42] |
| 92 | Agente manipulado a vazar contexto por ferramenta | Lista de destinos de rede permitidos + validação de argumento + nada de segredo no contexto | O dado não é roubado: é enviado pelo próprio agente, com permissão legítima | **A** [43] |
| 93 | Jailbreak em aplicação pública | Guardrails com filtro de ataque de prompt na entrada e na saída, com registro da tentativa | Guardrails corta o caso óbvio e registra; a defesa de fundo continua sendo capacidade limitada | **A** [44] |
| 94 | Qualidade caindo sem ninguém reclamar | Conjunto fixo rodando contra produção + métricas de saída rejeitada e de comprimento | Mudança nessas métricas antecede reclamação — e é o que dá tempo de agir | **P** |
| 95 | Agente com falha em cascata sob carga | Limite de concorrência, disjuntor por ferramenta, degradação com resposta parcial | Agente consome recurso de forma imprevisível: resiliência precisa considerar o laço, não só a chamada | **A** [45] |
| 96 | Custo estourando antes do fim do mês | Orçamento com alarme sobre gasto por período curto, não sobre o total acumulado | A derivada é o sinal útil: gasto por hora fora do padrão aparece dias antes de o total estourar | **P** |
| 97 | Sem visibilidade do que o agente decidiu | Rastro com um trecho por chamada de ferramenta, anotado com contexto de negócio | Rastro sem contexto de negócio aponta o sintoma e não permite reproduzir | **A** [28] |
| 98 | Publicação de prompt novo sem rede de segurança | Canário com fração do tráfego, comparando qualidade e custo, com fixação por sessão | Alternar variante no meio da conversa produz incoerência que parece bug do modelo | **P** |
| 99 | Modelo atualizado pelo fornecedor mudando o comportamento | Versão de modelo fixada + conjunto de avaliação antes de promover a nova | Atualização automática de modelo em produção é mudança sem revisão — e ela chega sem aviso | **P** |
| 100 | Projeto de IA que trava na revisão de conformidade | Quatro respostas prontas: onde processa, quem acessa, o que registra, por quanto tempo retém | Nenhuma das quatro é sobre o modelo. É por isso que "usamos um serviço seguro" não passa | **P** |

---

## O que este catálogo deliberadamente NÃO faz

**Não promete que o número se repete.** Os percentuais em `C` são o que a fonte
publicou, sobre a linha de base daquela empresa — que você não conhece. Ganho
percentual é o dado menos transferível de um caso; a arquitetura e a decisão são
os transferíveis.

**Não infla a contagem de caso público.** Só 21 das 100 linhas são caso com
cliente nomeado e fonte citada. As outras 79 são arquitetura de referência da AWS
ou padrão composto — e chamar tudo de "caso real" seria a distorção mais fácil de
cometer num catálogo como este.

**Não cita caso que não confirmei na AWS.** Itaú tem 150 soluções de IA
generativa em produção e um assistente com centenas de milhares de clientes [46];
Nubank treinou modelo próprio para subscrição [31]; Bradesco construiu plataforma
multiagente **em outra nuvem** [47]. Os três são referência de mercado brasileiro
e nenhum deles aparece nas tabelas como caso de Bedrock, porque a fonte não
confirma isso.

**Não inventa serviço.** Onde a decisão é de arquitetura e não de produto, a linha
diz o padrão em vez de nomear um serviço que resolveria por magia.

---

## Sobre as fontes — o que 200 não prova

Todas as URLs abaixo foram verificadas por
`python3 scripts/validar_links_externos.py` (última execução: 05/ago/2026 —
**67 de 68 respondem 200**; uma recusa requisição de agente e foi conferida à mão).

Mas **responder 200 não prova que a página sustenta a afirmação.** A primeira
versão deste catálogo tinha 15 fontes apontando para página de LISTAGEM ou de
CATEGORIA — o blog de aprendizado de máquina da AWS em vez do post específico, a
página de on-demand do re:Invent em vez da sessão. Link que resolve e não sustenta
é pior que link morto: ele dá aparência de verificabilidade.

O que foi feito com cada caso:

- **Quatro URLs específicas localizadas** e substituídas (Formula 1, Bluesight,
  digitalização de prontuário, endpoints de VPC do Bedrock).
- **Seis casos que vivem na listagem oficial de histórias de clientes da AWS**
  passaram a dizer isso no rótulo — a listagem É a fonte, e ela sustenta "este
  cliente fez isto", não a arquitetura em detalhe.
- **Duas sessões de re:Invent** ficaram identificadas por ID (`IND320`,
  `IND3329`), com a ressalva escrita de que não localizei URL direta.
- **Duas páginas de parceiro** passaram a dizer que são de parceiro, não da AWS.

## Fontes

1. [DoorDash — contact center com Bedrock, Connect e Claude — AWS Case Study](https://aws.amazon.com/solutions/case-studies/doordash-bedrock-case-study/)
2. [EFS Networks — IA de voz em produção, 15 mil chamadas/dia — **página de casos do parceiro**, não da AWS](https://ai.efsnetworks.com/case-studies/)
3. [ASAPP — GenerativeAgent, redução de escalonamento — **listagem de histórias de clientes da AWS**](https://aws.amazon.com/ai/generative-ai/customers/)
4. Toyota Motor North America e Toyota Connected — assistente de concessionária. **Sessão re:Invent `IND320`** — identificada por ID; não localizei URL que abra a sessão diretamente, então busque pelo ID em [reinvent.awsevents.com/on-demand](https://reinvent.awsevents.com/on-demand/)
5. Cox Automotive — cinco produtos agênticos com AgentCore. **Sessão re:Invent `IND3329`** — identificada por ID; não localizei URL que abra a sessão diretamente, então busque pelo ID em [reinvent.awsevents.com/on-demand](https://reinvent.awsevents.com/on-demand/)
6. [Guidance for Generative AI Shopping Assistant using Agents for Amazon Bedrock](https://github.com/aws-solutions-library-samples/guidance-for-generative-ai-shopping-assistant-using-agents-for-amazon-bedrock)
7. [Accelerated Intelligent Document Processing on AWS](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws)
8. [Guidance for Intelligent Document Processing Agents on AWS](https://aws.amazon.com/solutions/guidance/intelligent-document-processing-agents-on-aws)
9. [SAP Intelligent Document Processing and Insights using Generative AI on AWS](https://aws.amazon.com/solutions/guidance/sap-intelligent-document-processing-and-insights-using-generative-ai-on-aws/)
10. [Digitalização de prontuário com Bedrock Data Automation e HealthLake — AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/automate-medical-record-digitization-with-amazon-bedrock-data-automation-and-aws-healthlake/)
11. [Agroseguro — IA generativa em documentos técnicos e legais de seguro agrícola — AWS Case Study](https://aws.amazon.com/solutions/case-studies/agroseguro-case-study/)
12. [RAG multimodal com Bedrock Data Automation e Knowledge Bases — AWS Blog](https://aws.amazon.com/blogs/machine-learning/building-a-multimodal-rag-based-application-using-amazon-bedrock-data-automation-and-amazon-bedrock-knowledge-bases/)
13. [Syngenta Group — Managed Knowledge Base com SharePoint e Confluence — AWS Blog](https://aws.amazon.com/blogs/aws/introducing-amazon-bedrock-managed-knowledge-base-for-faster-more-accurate-enterprise-ai-applications/)
14. [Busca corporativa para agentes com Bedrock Managed Knowledge Base — AWS Blog](https://aws.amazon.com/blogs/machine-learning/build-enterprise-search-for-agents-with-amazon-bedrock-managed-knowledge-base/)
15. [Amazon Bedrock Evaluations](https://aws.amazon.com/bedrock/evaluations/)
16. [RAG totalmente gerenciado com Knowledge Bases — AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-fully-managed-bedrock.html)
17. [Amazon Bedrock Knowledge Bases — opções de armazenamento vetorial](https://aws.amazon.com/bedrock/knowledge-bases/)
18. [OPLOG — logística com AgentCore e Claude Sonnet — AWS Case Study](https://aws.amazon.com/solutions/case-studies/oplog/)
19. [Genentech — Bedrock Agents em pesquisa de medicamento — **listagem de histórias de clientes da AWS**](https://aws.amazon.com/ai/generative-ai/customers/)
20. [Trellix — triagem autônoma de alerta com Claude — **listagem de histórias de clientes da AWS**](https://aws.amazon.com/ai/generative-ai/customers/)
21. [Formula 1 — de semanas a minutos com IA agêntica na AWS](https://aws.amazon.com/blogs/machine-learning/from-weeks-to-minutes-how-formula-1-uses-agentic-ai-on-aws-to-accelerate-data-operations/)
22. [Bluesight — solução agêntica de compliance em saúde com Bedrock](https://aws.amazon.com/blogs/machine-learning/building-an-agentic-ai-solution-at-bluesight-with-amazon-bedrock/)
23. [Agentes de evento com AgentCore e Knowledge Bases — AWS Blog](https://aws.amazon.com/blogs/machine-learning/building-intelligent-event-agents-using-amazon-bedrock-agentcore-and-amazon-bedrock-knowledge-bases/)
24. [Experian — modernização com AWS Transform — **listagem de histórias de clientes da AWS**](https://aws.amazon.com/ai/generative-ai/customers/)
25. [Boas práticas de Guardrails em fluxo de geração de código — AWS Blog](https://aws.amazon.com/blogs/machine-learning/best-practices-for-applying-amazon-bedrock-guardrails-to-code-generation-workflows/)
26. [Casos de produção com Bedrock — análise de conteúdo e BI generativo — **página de casos do parceiro**, não da AWS](https://ai.efsnetworks.com/case-studies/)
27. [Clearwater Analytics — plataforma de IA com Bedrock e SageMaker — **listagem de histórias de clientes da AWS**](https://aws.amazon.com/ai/generative-ai/customers/)
28. [AgentCore — conhecimento mais amplo e aprendizado contínuo (observabilidade de agente) — AWS Blog](https://aws.amazon.com/blogs/machine-learning/new-in-amazon-bedrock-agentcore-build-agents-with-broader-knowledge-and-continuous-learning/)
29. [Luma AI — treino de modelo visual com SageMaker HyperPod — **listagem de histórias de clientes da AWS**](https://aws.amazon.com/ai/generative-ai/customers/)
30. [EXL — redução de 80% no custo de subscrição com Bedrock — AWS Case Study](https://aws.amazon.com/solutions/case-studies/exl-case-study/)
31. [Nubank — modelo próprio NuFormer para subscrição — Evident AI Index LATAM](https://evidentinsights.com/insights/banking-ai-index-latam-2026-report)
32. [Endpoints de interface de VPC para Amazon Bedrock — Documentação AWS](https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html)
33. [AWS Well-Architected Generative AI Lens](https://docs.aws.amazon.com/pdfs/wellarchitected/latest/generative-ai-lens/generative-ai-lens.pdf)
34. [RAG seguro com engenharia de prompt no Amazon Bedrock — AWS Blog](https://aws.amazon.com/blogs/machine-learning/secure-rag-applications-using-prompt-engineering-on-amazon-bedrock/)
35. [Guidance for a Multi-Tenant Generative AI Gateway with Cost and Usage Tracking on AWS](https://docs.aws.amazon.com/solutions/multi-tenant-generative-ai-gateway-with-cost-and-usage-tracking-on-aws/)
36. [Gerenciar custo multi-inquilino com perfis de inferência de aplicação — AWS Blog](https://aws.amazon.com/blogs/machine-learning/manage-multi-tenant-amazon-bedrock-costs-using-application-inference-profiles/)
37. [Rastreamento de custo de inferência multi-inquilino no Bedrock — AWS Blog](https://aws.amazon.com/blogs/machine-learning/cost-tracking-multi-tenant-model-inference-on-amazon-bedrock/)
38. [Multi-inquilino em modelo de reservatório com AgentCore — AWS Blog](https://aws.amazon.com/blogs/machine-learning/shared-infrastructure-isolated-tenants-pool-model-multi-tenancy-with-amazon-bedrock-agentcore/)
39. [Escalar casos de IA generativa: concentrador e raios com Transit Gateway — AWS Blog](https://aws.amazon.com/blogs/machine-learning/scale-generative-ai-use-cases-part-1-multi-tenant-hub-and-spoke-architecture-using-aws-transit-gateway/)
40. [Cache semântico persistente no Amazon MemoryDB — AWS Database Blog](https://aws.amazon.com/blogs/database/improve-speed-and-reduce-cost-for-generative-ai-workloads-with-a-persistent-semantic-cache-in-amazon-memorydb)
41. [Padrões de aplicação repetíveis para casos comuns de IA generativa — AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-enterprise-ready-gen-ai-platform/patterns.html)
42. [Protegendo Bedrock Agents contra injeção indireta de prompt — AWS Blog](https://aws.amazon.com/blogs/machine-learning/securing-amazon-bedrock-agents-a-guide-to-safeguarding-against-indirect-prompt-injections/)
43. [Guardrails — detecção e filtro de conteúdo — Documentação Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)
44. [Guardrails em produção: auditoria e prevenção de jailbreak](https://www.dataa.dev/2026/04/14/guardrails-for-amazon-bedrock-production-audits-jailbreak-prevention/)
45. [AWS Well-Architected Agentic AI Lens](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentic-ai-lens.html)
46. [Itaú Unibanco — assistente de IA generativa para clientes](https://www.riotimesonline.com/itau-genai-assistant-iai-launch-2026/)
47. [Banco Bradesco — plataforma multiagente Bridge (Azure)](https://www.microsoft.com/en/customers/story/25660-banco-bradesco-sa-azure-ai-foundry)
