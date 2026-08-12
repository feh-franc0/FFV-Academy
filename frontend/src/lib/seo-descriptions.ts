import 'server-only';

/**
 * Descrições de SEO por módulo — SÓ SERVIDOR.
 *
 * Estavam em `curriculum.ts`, que é importado por 35 componentes de cliente:
 * 38 KB de texto (≈16 KB comprimidos, ~19% do chunk do currículo) baixados por
 * todo visitante sem nenhum componente de cliente ler. São meta tags — só o
 * `generateMetadata` no servidor precisa delas.
 *
 * GERADO a partir do curriculum.ts. Ao criar módulo novo, adicione a entrada
 * aqui; `src/tests/integration/seo-descriptions.test.ts` cobra a cobertura.
 */
export const SEO_DESCRIPTIONS: Record<string, string> = {
  'mla-intro': 'O que a MLA-C01 mede e por que difere da AIF-C01: os quatro domínios com seus pesos e a régua de decisão que elimina alternativas antes da memória.',
  'mla-ingestao-dados': 'Por que o formato do arquivo decide o custo do treino: Parquet contra CSV, particionamento no S3, o problema de muitos arquivos pequenos e o mapa de ingestão.',
  'mla-transformacao-features': 'As quatro formas de vazamento de dados e o sintoma de cada uma, por que separar antes de transformar, e quando usar Glue, EMR, Processing ou Data Wrangler.',
  'mla-feature-store': 'A divergência entre treino e serviço, os armazenamentos online e offline do Feature Store, e por que a viagem no tempo é correção e não conveniência.',
  'mla-qualidade-vies-dados': 'Por que 99% de acurácia pode ser um modelo inútil: escolher a métrica pelo custo do erro, tratar desbalanceamento e medir viés com o Clarify.',
  'mla-escolha-modelo': 'Os quatro caminhos para ter um modelo na AWS em ordem de esforço, quando treinar de fato compensa, e como ler sobreajuste e subajuste nas curvas.',
  'mla-treinamento-sagemaker': 'Os três termos da conta de treino, capacidade pontual com checkpoint como maior alavanca, e o que fazer quando a GPU fica ociosa em 12%.',
  'mla-tuning-avaliacao': 'Grade, aleatória, bayesiana e Hyperband: qual estratégia aproveita o orçamento, e por que usar o conjunto de teste para escolher configuração o contamina.',
  'mla-implantacao-inferencia': 'Tempo real, sem servidor, assíncrono e lote: a árvore de três perguntas que decide o modo, e por que endpoint ocioso é o desperdício mais comum.',
  'mla-pipelines-orquestracao': 'Procedência importa mais que automação: os cinco passos de um pipeline de ML, o passo de condição como portão, e quando ir para Step Functions.',
  'mla-monitoramento-drift': 'Por que um modelo degrada sem gerar erro: deriva de dado contra deriva de conceito, o que o Model Monitor observa e os quatro gatilhos de retreino.',
  'mla-seguranca-governanca': 'Por que colocar o treino na VPC não elimina o tráfego público, as quatro peças de isolamento, e o acesso negado que vem da política da chave.',
  'mla-estrategia-prova': 'Os cinco padrões de enunciado que a MLA-C01 repete, a revisão dos quatro domínios em uma página e como decidir entre duas alternativas quase idênticas.',
  'bedrock-prompt-engineering': 'Como escrever prompt no Bedrock quando o modelo é variável: as quatro alavancas que migram entre Nova, Claude e Llama, e por que o cache dita a ordem das partes.',
  'bedrock-reasoning-converse': 'Quando o modo de raciocínio da Converse compensa e quando é desperdício: o orçamento sai do maxTokens, e a decisão certa é rotear por tipo de pergunta.',
  'bedrock-mcp-fundamentos': 'O Model Context Protocol pela ótica de quem constrói na AWS: por que M vezes N vira M mais N, e o que o AgentCore Gateway resolve do protocolo.',
  'bedrock-agentcore-gateway-producao': 'O Gateway como ponto de controle da arquitetura agêntica: as duas identidades que não podem ser a mesma, o rastro que explica a escolha e o gargalo de cota.',
  'o-que-e-ia': 'Entenda o que é Inteligência Artificial de verdade, sem buzzwords. Definição clara, exemplos práticos e histórico.',
  'dados-o-combustivel': 'Entenda por que dados são essenciais para a IA funcionar, como datasets são criados e o que é qualidade de dados.',
  'como-ia-aprende': 'Como machine learning funciona na prática: treinamento, gradiente descendente e otimização explicados de forma simples.',
  'redes-neurais': 'O que são redes neurais artificiais, como funcionam neurônios artificiais, camadas e funções de ativação.',
  'o-que-e-llm': 'O que é um LLM (Large Language Model), como funciona o ChatGPT, Claude e Gemini. Explicação completa.',
  'tokens': 'O que são tokens em IA, como funciona tokenização BPE, por que contexto é medido em tokens e como isso afeta o custo.',
  'transformers': 'Como funciona o Transformer e mecanismo de atenção. A arquitetura por trás de GPT, Claude e BERT explicada.',
  'kv-cache': 'O que é KV Cache em transformers, como funciona Key-Value Cache, por que é essencial para inferência eficiente.',
  'mixture-of-experts': 'O que é Mixture of Experts (MoE), como funciona o roteamento de experts, Mixtral e modelos MoE explicados.',
  'tool-calling': 'O que é tool calling em IA, como agentes usam ferramentas, function calling na API do Claude e OpenAI.',
  'ia-alem-do-llm': 'O que é um coding harness para agentes de IA, os 6 componentes de um agente de programação, Claude Code vs Cursor.',
  'como-avaliar-modelos': 'Como avaliar modelos de IA, o que são benchmarks MMLU HumanEval, como LM Eval Harness funciona.',
  'coding-agents-panorama': 'O que são coding agents, diferença entre autocomplete e agentes de IA para código, histórico e evolução.',
  'claude-code-arquitetura': 'Como Claude Code funciona internamente, loop agêntico, ferramentas bash/read/write, arquitetura do agente de terminal.',
  'openai-codex-cloud': 'Como funciona o OpenAI Codex 2025, sandbox cloud, execução assíncrona, diferença do Claude Code.',
  'cursor-copilot-ides': 'Como Cursor e GitHub Copilot funcionam, diferenças entre IDEs com IA e agentes de terminal, comparação técnica.',
  'amazon-q-kiro': 'O que é Amazon Q Developer, o que é Kiro AWS, spec-driven development, diferença entre Q e Kiro.',
  'qual-coding-agent-usar': 'Comparação técnica entre coding agents de IA: Claude Code vs Codex vs Cursor vs Copilot vs Kiro. Quando usar cada um.',
  'o-que-e-cloud': 'O que é cloud computing, modelos IaaS PaaS SaaS, cloud pública privada híbrida, vantagens e desvantagens da nuvem.',
  'aws-global-infra': 'Como a AWS se organiza no mundo: o que é uma região, por que uma AZ é um domínio de falha, e o que muda ao servir pela borda.',
  'modelo-responsabilidade-compartilhada': 'Modelo de responsabilidade compartilhada AWS, segurança da nuvem vs segurança na nuvem, shared responsibility model.',
  'iam-fundamentos': 'AWS IAM explicado: usuários, grupos, roles, policies JSON, MFA, diferença entre user e role, root account boas práticas.',
  'compute-ec2-lambda': 'As três formas de rodar código na AWS: EC2 quando você quer a máquina, Lambda quando quer o evento, container quando quer o meio.',
  'storage-s3-ebs-efs': 'AWS storage: S3 classes standard IA glacier, EBS SSD HDD, EFS file system, storage gateway, quando usar cada um.',
  'databases-aws-basico': 'Qual banco a AWS oferece para cada problema: RDS e Aurora no relacional, DynamoDB na chave-valor, Redshift no analítico.',
  'networking-vpc-route53': 'A rede na AWS de fora para dentro: VPC com sub-rede e gateway, Route 53 resolvendo o nome, CloudFront servindo na borda.',
  'seguranca-aws-servicos': 'Os serviços de segurança da AWS e o que cada um defende: KMS a chave, GuardDuty a ameaça, Shield o volume, WAF a requisição.',
  'monitoramento-cloudwatch': 'AWS monitoring: CloudWatch metrics logs, CloudTrail api audit, AWS Config compliance, diferença entre CloudWatch e CloudTrail.',
  'well-architected-framework': 'Os seis pilares do Well-Architected e a pergunta que cada um força você a responder antes de dizer que a arquitetura está pronta.',
  'cloud-adoption-framework': 'O Cloud Adoption Framework e os 7 Rs de migração: o que significa rehost, replatform e refactor, e o custo de escolher errado.',
  'precificacao-suporte': 'Como a AWS cobra: o que cabe no free tier, como estimar antes de criar recurso, e o que cada plano de suporte entrega.',
  'migracao-aws-servicos': 'As ferramentas de migração da AWS e o que cada uma move: servidor com MGN, banco de dados com DMS, arquivo com DataSync.',
  'ai-ml-aws-servicos': 'O catálogo de IA da AWS sem confusão: quando Bedrock, quando SageMaker, e quando um serviço pronto como Rekognition já resolve.',
  'developer-tools-aws': 'As ferramentas de desenvolvimento da AWS: a esteira com CodePipeline, e infra como código com CloudFormation, SAM ou CDK.',
  'simulado-practitioner': 'Simulado AWS Cloud Practitioner CLF-C02 comentado, 20 questões com respostas explicadas, preparação para o exame.',
  'saa-c03-intro': 'AWS SAA-C03 Solutions Architect Associate, domínios do exame, diferença Practitioner vs Associate, preparação SAA.',
  'iam-avancado-organizations': 'IAM além do básico: como ler uma policy JSON, assumir papel com STS entre contas, e o que uma SCP consegue barrar de fato.',
  'vpc-avancado': 'VPC a fundo: quando NAT Gateway em vez de instância, peering contra Transit Gateway, e onde PrivateLink evita sair para a internet.',
  'dns-cdn-edge': 'Levar o usuário ao lugar certo: políticas de roteamento do Route 53, comportamento de cache no CloudFront e o papel do Accelerator.',
  'ec2-autoscaling-elb': 'EC2 em produção: grupo de auto scaling que reage à métrica certa, e a diferença prática entre balanceador de camada 4 e de camada 7.',
  'containers-ecs-eks': 'ECS ou EKS, Fargate ou EC2: o que cada combinação cobra em operação, e quando Kubernetes gerenciado se justifica de fato.',
  'serverless-lambda-avancado': 'Serverless além do exemplo: concorrência e cold start no Lambda, API Gateway na frente, e Step Functions quando existe estado.',
  's3-avancado': 'S3 a fundo: qual classe por padrão de acesso, regra de ciclo de vida que corta custo, e Object Lock quando a retenção é exigida.',
  'block-file-storage': 'Armazenamento de bloco e de arquivo na AWS: EBS preso a uma instância, EFS compartilhado, FSx quando o protocolo importa.',
  'rds-aurora-dynamodb': 'Disponibilidade e leitura em banco na AWS: o que Multi-AZ garante, o que a réplica de leitura resolve, e o modelo do DynamoDB.',
  'caching-performance': 'Onde colocar cache na AWS: ElastiCache junto da aplicação, DAX na frente do DynamoDB, CloudFront antes de tudo isso.',
  'messaging-eventos': 'Fila, tópico, barramento e fluxo: o que separa SQS, SNS, EventBridge e Kinesis, e como combiná-los sem duplicar entrega.',
  'seguranca-avancada': 'Segurança de arquitetura na AWS: envelope encryption com KMS, segredo que rotaciona sozinho, e regra de WAF que barra o ataque real.',
  'disaster-recovery': 'Definir RPO e RTO antes de escolher: as quatro estratégias de recuperação na AWS e o custo mensal que cada uma realmente cobra.',
  'cost-optimization-saa': 'Cortar custo na AWS com compromisso e risco medidos: Reserved Instances, Savings Plans e Spot, e onde cada um se encaixa.',
  'analytics-bigdata': 'Analytics na AWS: Athena consultando o S3, Glue catalogando, EMR processando em escala e Kinesis recebendo o fluxo.',
  'migracao-transferencia-saa': 'Migração pela ótica do arquiteto: DMS e SCT quando o banco troca de motor, MGN para servidor e DRS para recuperação.',
  'rede-hibrida-saa': 'Ligar seu datacenter à AWS: Direct Connect, VPN, e como endpoint de VPC e PrivateLink mantêm o tráfego fora da internet.',
  'ml-ia-arquiteto-saa': 'IA na prova de arquiteto: onde SageMaker entra, onde Bedrock basta, e como o pipeline se encaixa no resto da arquitetura.',
  'simulado-saa-c03': 'Simulado AWS SAA-C03 Solutions Architect Associate, 25 questões comentadas, preparação para o exame oficial AWS.',
  'rag-fundamentos': 'RAG (Retrieval-Augmented Generation) profissional em PT-BR: arquitetura, limites de contexto, falhas comuns, quando usar vs fine-tuning.',
  'chunking-embeddings': 'Chunking e embeddings em RAG profissional: estratégias, contextual retrieval, overlap, escolha de modelo de embedding, métricas de similaridade.',
  'hybrid-search-reranking': 'Hybrid search e reranking em RAG: BM25 + vetor, RRF, cross-encoder rerank, HyDE, query expansion — stack de retrieval profissional.',
  'rag-evaluation': 'Como avaliar RAG em produção: recall@k, MRR, nDCG, RAGAS, faithfulness, LLM-as-judge, golden dataset — métricas que importam.',
  'agentes-padroes': 'Agent patterns em produção: ReAct, Reflexion, Tree of Thoughts, Plan-and-Execute, Router — análise profunda dos padrões de agent modernos.',
  'multi-agent-systems': 'Multi-agent systems em produção: orchestrator-worker, swarms, handoffs, CrewAI, hierarquias — quando múltiplos agents valem o custo.',
  'context-engineering': 'Context engineering para LLMs: prompt caching, compaction, subagents, skills, CLAUDE.md — como gerenciar janela de contexto profissionalmente.',
  'mcp-servers': 'Construir um servidor MCP do zero: tools, resources e prompts, mais autenticação e implantação para uso de verdade.',
  'llm-apis-producao': 'LLM APIs em produção: streaming, tool use, structured output, batch API, prompt caching, retry — padrões profissionais OpenAI/Anthropic/Google.',
  'llmops-drift-canary': 'LLMOps profissional: eval harness, drift detection, canary de prompts, cost attribution, SLO de qualidade — operando LLMs em escala.',
  'capstone-ai-native-rag-producao': 'Capstone da trilha: um RAG de produção completo, com pgvector, reranker, harness de avaliação, Langfuse e implantação em canário.',
  'cap-pacelc': 'Teorema CAP e PACELC explicados a fundo: partition, availability, consistency, latência. Decisões reais em bancos distribuídos.',
  'consistency-models': 'Modelos de consistência em sistemas distribuídos: linearizability, causal, eventual, read-your-writes, bounded staleness — quando usar cada um.',
  'consensus-raft': 'Consensus distribuído e Raft em PT-BR: FLP, Paxos, Raft (leader, log, safety), etcd e Kubernetes — como sistemas concordam com falhas.',
  'idempotencia-retries': 'Idempotência e retries profissionais: idempotency keys, backoff com jitter, circuit breaker, dedup — como sobreviver a redes não confiáveis.',
  'sagas-2pc': 'Transação distribuída sem perder o sono: por que 2PC travou, como a saga compensa, e o padrão outbox que evita evento perdido.',
  'event-sourcing-cqrs': 'Event Sourcing e CQRS em PT-BR: event log, projections, command vs query, event store, Kafka, armadilhas e quando não usar.',
  'postgres-mvcc-isolation': 'Postgres MVCC, isolation levels, locks e VACUUM explicados a fundo — o que todo engenheiro precisa saber antes de escalar Postgres.',
  'rate-limiting-distribuido': 'Rate limiting distribuído: token bucket contra sliding window, contagem atômica em Redis com Lua, e o que fazer se o Redis cair.',
  'capstone-sistemas-distribuidos-saga': 'Capstone da trilha: uma saga distribuída ponta a ponta, com outbox, compensação e idempotência em cada um dos passos.',
  'observability-pilares': 'Observability em 2026: 3 pilares (logs, métricas, traces), cardinalidade, events, profiles — o que separa monitoring tradicional de observability moderna.',
  'metricas-red-use': 'Frameworks de métricas RED, USE e Golden Signals explicados em PT-BR: o que medir em serviços, recursos e APIs em produção.',
  'opentelemetry-stack': 'OpenTelemetry de ponta a ponta: SDK na aplicação, Collector no meio, e como o contexto se propaga entre os serviços.',
  'logs-estruturados': 'Log estruturado com propósito: JSON, identificador de correlação e nível que significa algo — para a busca achar o incidente.',
  'distributed-tracing': 'Tracing distribuído: o que é um span, como o baggage viaja, e por que amostrar na cauda acha o que amostrar na cabeça perde.',
  'slos-error-budgets': 'SLOs, error budgets e burn rate alerts explicados em PT-BR: como medir confiabilidade sem viver em 100% e o que fazer quando o orçamento estoura.',
  'incident-response-postmortem': 'Resposta a incidente com papéis claros: quem comanda, quem comunica, e como escrever um postmortem sem culpar pessoa.',
  'capstone-sre-slo-runbook': 'Capstone de SRE: definir SLI e SLO reais, orçamento de erro, alerta por taxa de queima em duas janelas, runbook e um gameday.',
  'como-computador-roda-codigo': 'Como o computador realmente executa código: CPU, memória RAM, SO, processos e chamadas de sistema explicados.',
  'linux-terminal-basico': 'Comandos Linux essenciais explicados em PT-BR: ls, cd, grep, find, pipe, redireção, man — do zero à fluência real.',
  'filesystem-permissions': 'Permissões Linux explicadas em PT-BR: rwx, chmod, chown, symlink, hardlink — o que quebra em produção e como evitar.',
  'processos-jobs-sinais': 'Processos Linux: PID, fork, exec, jobs, sinais (SIGTERM/SIGKILL), ps, top — como o SO gerencia execução de programas.',
  'ssh-chaves-acesso-remoto': 'SSH do zero: gerar chave Ed25519, entender authorized_keys e o agente, e usar port forwarding sem expor a máquina.',
  'git-de-verdade': 'Git profissional em PT-BR: modelo mental de commits, DAG, staging area, branch, merge, rebase, reflog — do zero ao avançado.',
  'github-fluxo-profissional': 'GitHub como um time trabalha: pull request que dá para revisar, uso real de issue e milestone, e um CI mínimo em Actions.',
  'http-do-zero': 'HTTP explicado em PT-BR: métodos, status codes, headers, cookies, CORS — o protocolo da web do zero ao avançado.',
  'dns-tls-certificados': 'DNS e TLS explicados em PT-BR: resolução DNS, handshake TLS 1.3, certificados X.509, HTTPS — o que acontece antes do request chegar.',
  'json-yaml-env': 'JSON, YAML e variáveis de ambiente em PT-BR: formatos de config, .env, 12-factor app — como configurar sistemas modernos.',
  'editores-produtividade': 'VSCode e Vim produtivos em PT-BR: atalhos, plugins, multi-cursor, terminal integrado — configuração para desenvolvimento real.',
  'relacional-vs-nao-relacional': 'Relacional ou NoSQL: o que PostgreSQL, MongoDB, Redis e DynamoDB assumem sobre seus dados, e o trade-off de cada escolha.',
  'select-join-na-pratica': 'SQL JOIN na prática PT-BR: INNER JOIN, LEFT JOIN, self-join, CTE — exemplos reais com PostgreSQL.',
  'group-by-agregacoes': 'GROUP BY que resolve a maioria dos casos: COUNT, SUM e AVG, o papel do HAVING, e por que ROLLUP economiza uma consulta.',
  'window-functions': 'Window functions em SQL: ranking com ROW_NUMBER e RANK, total corrente com SUM OVER, e comparação de linhas com LAG e LEAD.',
  'indices-que-funcionam': 'Índices PostgreSQL PT-BR: B-tree, hash, GIN, índice composto, covering index — quando cada um funciona.',
  'explain-analyze': 'EXPLAIN ANALYZE PostgreSQL PT-BR: como ler plano de execução e otimizar queries lentas.',
  'transacoes-isolation-levels': 'Transação sem decoreba: o que ACID promete, e qual leitura suja ou fantasma cada nível de isolamento realmente permite.',
  'normalizacao-modelagem': 'Normalização de banco de dados PT-BR: 1NF, 2NF, 3NF, quando desnormalizar — modelagem relacional.',
  'migrations-profissionais': 'Database migrations PT-BR: Alembic Python, zero-downtime migrations PostgreSQL — como não quebrar produção.',
  'connection-pool-n-plus-1': 'N+1 query problem PT-BR: connection pool PostgreSQL, PgBouncer, como detectar N+1 — performance de banco.',
  'modelo-osi-tcp-ip': 'Modelo OSI TCP/IP PT-BR: as camadas de rede que explicam como a internet funciona.',
  'tcp-handshake-congestao': 'TCP PT-BR: handshake, congestion control, sliding window — como TCP funciona por dentro.',
  'udp-quic-http3': 'UDP vs QUIC vs HTTP3 PT-BR: por que QUIC supera TCP, head-of-line blocking, protocolo QUIC.',
  'http-1-vs-2-vs-3': 'HTTP/1.1, HTTP/2 e HTTP/3 comparados: multiplexação, compressão de cabeçalho com HPACK e QPACK, e por que server push não pegou.',
  'tls-handshake-detalhe': 'TLS 1.3 PT-BR: handshake, certificados, SNI, ALPN — como HTTPS funciona por dentro.',
  'dns-recursivo-autoritativo': 'DNS PT-BR: como funciona resolução DNS, registros A CNAME MX, TTL, DNSSEC — guia completo.',
  'proxies-load-balancers': 'Proxy, proxy reverso e balanceador: a diferença entre camada 4 e camada 7, algoritmos de distribuição e sessão presa.',
  'websocket-sse-streaming': 'WebSocket vs SSE PT-BR: streaming, long polling, HTTP upgrade — comunicação em tempo real.',
  'cors-csrf-cookies-seguros': 'Segurança web na base: o que a same-origin policy impede, como CORS a relaxa, e por que HttpOnly, Secure e SameSite importam.',
  'typescript-como-mental-model': 'Tipo é prova, não anotação: o modelo mental do sistema estrutural do TypeScript e o que a inferência já sabe sem você escrever nada.',
  'narrowing-discriminated-unions': 'Narrowing e união discriminada em TypeScript: como o compilador estreita o tipo, e como garantir exaustividade sem esquecer um caso.',
  'generics-de-verdade': 'Generics de verdade em TypeScript: variância, constraints, tipos condicionais e infer — quando eles simplificam e quando só ofuscam.',
  'tipos-utilitarios-e-quando-nao-usar': 'Partial, Pick, Omit e Record resolvem casos específicos — e este módulo é sobre quando NÃO usá-los, porque escondem o tipo real.',
  'type-safety-em-boundaries': 'Segurança de tipo termina na fronteira: validar com Zod ou io-ts o que vem de API, localStorage e formulário, em vez de confiar no cast.',
  'async-await-sem-pegadinha': 'Async/await sem pegadinha: AbortController para cancelar de verdade, Promise.all contra allSettled, e por que erro em paralelo se perde.',
  'erros-como-valores': 'Erro como valor em TypeScript: o tipo Result e a neverthrow, e por que throw quebra justamente o contrato que o tipo prometia.',
  'performance-em-node': 'Performance em Node medindo, não adivinhando: event loop, streams com backpressure e quando worker thread é a única saída de verdade.',
  'monorepo-pnpm-turbo': 'Monorepo TypeScript que não trava o time: pnpm workspaces, Turbo para cache de build e configuração compartilhada de verdade.',
  'capstone-cli-tool-ts': 'Capstone da trilha: uma CLI em TypeScript ponta a ponta, com Zod na entrada, Result no fluxo de erro, testes em vitest e changesets.',
  'threat-modeling-stride': 'Threat modeling com STRIDE para engenheiro: desenhar o DFD, achar de onde vêm os ataques e levar isso para o design review.',
  'authn-vs-authz': 'Autenticação não é autorização: RBAC, ABAC e ReBAC comparados, o modelo do Zanzibar, e as armadilhas de confundir os dois.',
  'oauth2-oidc-do-zero': 'OAuth2 e OIDC do zero: Authorization Code com PKCE, Device Code, e o que cada claim do token realmente autoriza no seu sistema.',
  'jwt-paseto-sessions': 'JWT, Paseto e sessão no servidor comparados: rotação de refresh token, revogação — e por que revogar JWT é o problema difícil.',
  'password-hashing-moderno': 'Hash de senha hoje: argon2id contra bcrypt, o papel do pepper, e como migrar a base sem deslogar todo mundo de uma vez.',
  'owasp-top-10-com-exemplo-em-codigo': 'O OWASP Top 10 de 2024 com código que falha de verdade: injeção, SSRF e má configuração, cada um com a correção ao lado.',
  'secrets-management': 'Gestão de segredo sem improviso: Vault, SOPS e AWS Secrets Manager, e por que segredo dinâmico é melhor que rotação manual.',
  'supply-chain-security': 'Segurança de cadeia de suprimentos: SBOM, assinatura com sigstore, confusão de dependência e varredura com Trivy.',
  'zero-trust-e-mtls': 'Zero Trust na prática: verificar sempre em vez de confiar na rede, com mTLS, identidade via SPIFFE e SPIRE e service mesh.',
  'capstone-pentest-em-app-proprio': 'Capstone: um pentest ético no seu próprio app com Burp, ffuf, nuclei e sqlmap, pontuando por CVSS e abrindo PR de correção.',
  'dva-c02-intro': 'Os quatro domínios do DVA-C02 com o peso real de cada um na prova, e um plano de quatro semanas que ataca primeiro o que mais pontua.',
  'lambda-profundo': 'Lambda por dentro: o que causa cold start, o que layers e SnapStart resolvem, e quando provisioned concurrency realmente se paga.',
  'api-gateway-rest-http-ws': 'API Gateway da AWS: o que muda entre REST, HTTP e WebSocket em preço e recurso, mais authorizer e WAF na frente.',
  'dynamodb-para-dev': 'DynamoDB para quem desenvolve: escolher partition key, quando GSI ou LSI, Streams para reagir, TTL e transação.',
  's3-dev-features': 'Os recursos de S3 que o desenvolvedor usa: URL pré-assinada, upload multipart, evento na escrita e replicação entre regiões.',
  'step-functions-workflows': 'Step Functions para orquestrar: quando a máquina de estado vale mais que código, e o custo por transição que ela cobra.',
  'eventbridge-sqs-sns-para-dev': 'EventBridge, SQS e SNS: qual serve a qual caso, como combinar em fan-out, e por que fila morta não é opcional.',
  'cognito-fluxos': 'Cognito sem confusão: user pool contra identity pool, o fluxo SRP, e quando um Lambda de autenticação custom se justifica.',
  'kms-encryption-dev': 'Como funciona envelope encryption no KMS, quando a chave gerenciada pela AWS basta e quando você precisa de CMK própria, com rotação e grants.',
  'cicd-aws-nativo': 'CI/CD nativo da AWS com CodeBuild, CodeDeploy e CodePipeline, incluindo implantação blue/green e canário.',
  'x-ray-observability': 'Tracing distribuído com X-Ray: o que é um segmento, como instrumentar via ADOT e OpenTelemetry, e o que a amostragem esconde.',
  'secrets-parameter-store': 'Secrets Manager contra Parameter Store: a diferença real em custo, rotação automática e a extensão de cache no Lambda.',
  'ecs-fargate-para-dev': 'ECS com Fargate para desenvolvedor: task e service, e o critério honesto para escolher container em vez de Lambda.',
  'cloudformation-sam-cdk': 'Infra como código na AWS: CloudFormation, SAM e CDK comparados, detecção de drift e StackSets em várias contas.',
  'simulado-dva-c02': 'Quinze questões no estilo DVA-C02 comentadas uma a uma, mais o checklist de véspera: o que revisar, o que ignorar e como administrar o tempo.',
  'python-pra-dev-ts': 'Python para quem vem de TypeScript: o GIL, duck typing, list comprehension e as regras de escopo que pegam todo mundo.',
  'uv-e-python-moderno': 'uv no lugar de pip e venv manual: pyproject, lockfile, múltiplas versões de Python e o que isso muda no seu fluxo de trabalho.',
  'type-hints-rigorosos': 'Type hints que pegam erro de verdade: PEP 695, Protocol, TypedDict e mypy em modo estrito — o que exatamente cada um verifica.',
  'pydantic-v2-serio': 'Pydantic v2 a sério: BaseModel, validadores, BaseSettings e união discriminada — validação na borda em vez de checagem espalhada.',
  'async-em-python': 'Async em Python de verdade: asyncio, trio e anyio, concorrência estruturada e to_thread — mais os trade-offs frente ao Node.',
  'fastapi-na-pratica': 'FastAPI na prática: APIRouter para organizar, Depends como injeção de dependência, OAuth2 com JWT e teste assíncrono que roda rápido.',
  'jupyter-pra-engenharia': 'Notebook reprodutível de verdade: nbdev, papermill, jupytext e Marimo — como sair do notebook que só roda na sua máquina.',
  'capstone-agent-python-completo': 'Capstone da trilha: um agente Python completo com Pydantic, FastAPI e o SDK do Claude, com tool use e implantação de verdade.',
  'mvcc-e-isolation-levels-de-verdade': 'MVCC no Postgres sem simplificação: snapshot, xmin e xmax, e o que cada nível de isolamento realmente garante — inclusive SSI.',
  'query-planner-e-explain-analyze-ninja': 'Ler EXPLAIN ANALYZE como quem sabe: custo estimado contra o real, nested loop contra hash join, e o que a contagem de buffers revela.',
  'indices-avancados': 'Além do B-tree: BRIN, GIN, GiST, índice parcial e covering com INCLUDE — qual estrutura serve qual consulta, e o custo na escrita.',
  'vacuum-autovacuum-bloat': 'Vacuum e autovacuum no Postgres: como o bloat aparece, por que ele mata banco em produção, e o que ajustar antes disso.',
  'connection-pooling': 'Connection pooling no Postgres: pgbouncer em transaction mode, e por que serverless esgota conexão mesmo com pool configurado.',
  'replication-primary-replica': 'Replicação no Postgres: streaming contra lógica, o atraso da réplica, e o que um failover realmente promete garantir.',
  'particionamento-e-sharding': 'Particionamento e sharding no Postgres: RANGE, LIST e HASH declarativos, Citus para distribuir, e o que cada escolha custa depois.',
  'capstone-tuning-de-workload-real': 'Capstone: derrubar uma consulta de 30 s para 50 ms usando EXPLAIN ANALYZE, o índice certo, reescrita e pg_stat_statements.',
  'batch-vs-stream-mental-model': 'Batch ou stream: o modelo mental para decidir, e os trade-offs reais em latência, custo e complexidade de operação.',
  'dbt-transformacao-como-codigo': 'dbt trata transformação como código testável: models, sources, tests, macros e a linhagem que documenta o pipeline.',
  'airflow-vs-dagster-vs-prefect': 'Airflow, Dagster e Prefect comparados por cenário: o que cada um assume sobre seus dados e sua infraestrutura antes de você escolher.',
  'duckdb-e-polars': 'DuckDB e Polars fazem analytics no próprio processo e substituem Spark em escala média — onde essa troca vale e onde ela quebra.',
  'data-lake-lakehouse-warehouse': 'Data lake, lakehouse e warehouse: o que cada arquitetura assume sobre esquema e consulta, e quando migrar de uma para outra.',
  'cdc-com-debezium': 'Change data capture a sério com Debezium: replicação lógica, Kafka Connect e o padrão outbox para não perder evento.',
  'kafka-fundamentos': 'Kafka na base: partição, consumer group, entrega exactly-once e event sourcing — e o que cada garantia cobra em complexidade.',
  'iceberg-delta-hudi': 'Iceberg, Delta e Hudi comparados: como um formato de tabela aberto traz ACID ao data lake, e o que de fato difere entre os três.',
  'qualidade-de-dados': 'Qualidade de dado com Great Expectations, Soda e dbt tests: onde colocar a checagem para o erro parar antes de chegar ao painel.',
  'capstone-pipeline-analytics-completo': 'Capstone da trilha: um pipeline de analytics ponta a ponta com Kafka, Iceberg, dbt, Dagster e Great Expectations até o painel.',
  'quando-fine-tune-vs-rag-vs-prompt': 'Uma árvore de decisão entre fine-tune, RAG e prompt engineering: qual sinal indica cada caminho, e o custo de escolher errado.',
  'sft-supervised-fine-tuning': 'Supervised fine-tuning na prática com Hugging Face TRL e as APIs de OpenAI e Anthropic: o que preparar antes de treinar.',
  'lora-qlora-peft': 'LoRA, QLoRA e PEFT: como afinar um LLM com pouca VRAM, o que cada técnica congela e quanto de qualidade isso realmente custa.',
  'dpo-rlhf-simplificado': 'DPO contra RLHF: como o Direct Preference Optimization dispensa o modelo de recompensa, e quando ainda vale usar PPO mesmo assim.',
  'datasets-para-fine-tuning': 'Dataset de fine-tuning é onde o resultado se decide: curadoria, deduplicação com MinHash, contaminação e dado sintético.',
  'avaliando-fine-tune': 'Avaliar fine-tune sem se enganar: golden set fixo, LLM como juiz com suas ressalvas, e teste de regressão antes de promover.',
  'deploy-modelo-customizado': 'Três caminhos para servir um modelo próprio — vLLM, TGI e Bedrock Custom Model Import — e o que decide entre eles: latência, custo e operação.',
  'capstone-fine-tune-modelo-especialista': 'Capstone da trilha: afinar um modelo especialista de domínio com LoRA sobre Llama ou Mistral e servi-lo com vLLM em produção.',
  'evals-como-disciplina': 'Testar LLM é mais parecido com pesquisa que com CI: por que a saída não é determinística e o que isso exige do seu processo.',
  'golden-sets-curadoria': 'Golden set que serve: curadoria estratificada, concordância entre anotadores e como fazer o conjunto crescer sem perder o sentido.',
  'llm-as-judge-armadilhas': 'LLM como juiz tem viés de posição e premia verbosidade: as armadilhas já medidas e as mitigações, como inverter a ordem dos pares.',
  'eval-frameworks': 'Braintrust, Langfuse, Inspect e Promptfoo comparados: o que cada um facilita, e o que você acaba escrevendo à mão de qualquer jeito.',
  'ab-testing-de-prompt-em-producao': 'Testar prompt em produção com feature flag e feedback do usuário — e a estatística mínima para não ler ruído como se fosse melhoria.',
  'regression-testing-para-agents': 'Teste de regressão para agente: cenário multi-turno, escolha de ferramenta, e transformar cada falha observada em caso fixo.',
  'capstone-eval-harness-completo': 'Capstone da trilha: um harness de avaliação completo com golden set, comparação par a par, teste A/B e painel no Langfuse.',
  'sap-c03-intro': 'Os domínios do SAP-C03 e seus pesos, o que a prova de arquiteto profissional cobra além da associate, e como montar o estudo a partir disso.',
  'organizations-control-tower': 'Organizations, Control Tower e Landing Zone: como estruturar várias contas AWS com IAM Identity Center e guardrail.',
  'advanced-networking-sap': 'Rede avançada na AWS: compartilhar sub-rede com RAM, Cloud WAN, e Transit Gateway como concentrador entre várias contas.',
  'migracao-7rs-sap': 'Os 7 Rs de migração para a AWS: rehost, replatform, refactor e os demais, com DMS e SCT no que envolve banco de dados.',
  'cost-allocation-em-escala': 'Alocar custo em escala na AWS: estratégia de tag que sobrevive ao time crescer, e Cost Categories para o que a tag não cobre.',
  'well-architected-aplicado': 'O Well-Architected Framework aplicado em review de verdade: os 6 pilares, que pergunta fazer e o que a WA Tool entrega.',
  'disaster-recovery-estrategias': 'As quatro estratégias de DR na AWS, de backup e restore a multi-site ativo, com o RTO e o RPO que cada uma sustenta.',
  'edge-hibrido-sap': 'Edge e híbrido na AWS: Outposts no seu datacenter, Local Zones perto do usuário e Wavelength dentro da rede móvel.',
  'analytics-bigdata-sap': 'Analytics em escala na AWS pela ótica do arquiteto: Redshift, EMR, Athena, Lake Formation e Kinesis, e o que decide entre eles.',
  'seguranca-sap-avancada': 'Segurança enterprise na AWS: GuardDuty, Detective, Security Hub, Macie e Network Firewall — que sinal cada um dá e como se somam.',
  'ml-ia-arquiteto-sap': 'O que o SAP-C03 espera que um arquiteto decida sobre IA: quando Bedrock, quando SageMaker e quando um serviço pronto como Comprehend resolve.',
  'containers-serverless-sap': 'Container e serverless em arquitetura enterprise: ECS, EKS, Fargate e App Runner, e o que decide entre eles no SAP-C03.',
  'hibrido-direct-connect': 'Arquitetura híbrida na AWS: Direct Connect, VPN site-to-site, Storage Gateway e DataSync, e a redundância que cada uma pede.',
  'cicd-enterprise-sap': 'CI/CD enterprise em várias contas com CDK Pipelines: implantação cross-account, aprovação manual e separação de ambiente.',
  'governance-compliance-sap': 'Governança e conformidade na AWS: Config para detectar desvio, Audit Manager, Artifact e Service Catalog para padronizar.',
  'observability-enterprise': 'Observabilidade enterprise na AWS: CloudWatch, X-Ray e OpenSearch juntos, e onde cada um se torna caro sem retorno.',
  'cost-optimization-sap': 'Otimização de custo avançada: rightsizing com dado de uso, estratégia de compra por perfil de carga, e alerta que funciona.',
  'simulado-sap-c03': 'Simulado do SAP-C03 com explicação de cada alternativa — inclusive por que as erradas atraem — para fechar a trilha medindo o que ficou de fato.',
  'unit-economics-em-software': 'CAC, LTV e custo por requisição: como ligar a conta da nuvem ao valor que o produto gera, e por que margem bruta é a métrica que importa.',
  'cost-anomaly-detection': 'Detecção de anomalia de custo: o que AWS, Datadog, Vantage e CloudZero enxergam, e quando alertar sem virar ruído.',
  'rightsizing-sem-medo': 'Metodologia para cortar recurso superprovisionado sem derrubar nada: quais métricas olhar, que folga manter e como reverter se errar.',
  'reservas-savings-plans-spot': 'Compromisso de capacidade como portfólio: Savings Plans, Reserved Instances e Spot, e quanto risco cada fatia realmente carrega.',
  'finops-cultura-e-time': 'FinOps é cultura antes de ferramenta: showback e chargeback, responsabilidade por time e o processo que sustenta a economia.',
  'observability-de-custo': 'Como enxergar custo por equipe e por feature: estratégia de tags, alocação de gasto compartilhado e os painéis que fazem alguém agir.',
  'capstone-reducao-de-30-custo': 'Capstone de FinOps: aplicar a metodologia da trilha para tirar 30% do custo de uma aplicação real, medindo antes e depois sem quebrar SLO.',
  'multimodal-mental-model': 'O modelo mental do multimodal: modelo unificado contra especializado, e o que Claude, GPT-4o e Gemini entregam além do texto.',
  'speech-to-text-whisper': 'Transcrição com Whisper e alternativas: precisão por idioma, custo por hora de áudio, e o que muda quando é tempo real.',
  'text-to-speech-tts': 'Síntese de voz em produção: o que diferencia ElevenLabs, OpenAI e Cartesia em latência, naturalidade e preço, e onde cada uma se paga.',
  'realtime-apis-voice': 'Voz conversacional de verdade: APIs realtime, WebRTC, detecção de fala e o turn-taking que decide se a conversa parece natural ou travada.',
  'vision-models-claude-gpt': 'O que modelos de visão realmente acertam: leitura de documento, interpretação de gráfico e de interface — e onde ainda erram de forma perigosa.',
  'ocr-doc-intelligence': 'OCR moderno vale a pena quando o layout importa: Azure Document Intelligence, Textract e abordagens com LLM, comparados por tipo de documento.',
  'capstone-voice-assistant': 'Capstone da trilha: um assistente de voz ponta a ponta com Whisper, Claude, ElevenLabs e WebRTC, medindo a latência de turno.',
  'ai-safety-introducao': 'Por que safety é problema de engenharia e não de filosofia: uso indevido, desalinhamento e o que o EU AI Act passa a exigir de quem constrói.',
  'jailbreaks-prompt-injection': 'Taxonomia de jailbreak e prompt injection com as defesas que funcionam de fato — e por que filtro de entrada sozinho nunca foi suficiente.',
  'data-exfiltration-tools': 'Exfiltração de dado via ferramenta é o vetor principal em agentes: como o ataque funciona, e o que escopo e sandbox contêm.',
  'constitutional-ai-rlhf': 'Constitutional AI: como a Anthropic troca rótulo humano por autocrítica guiada por princípios, e o que o RLAIF muda no custo do alinhamento.',
  'guardrails-nemo-llamaguard': 'Guardrails na prática com NeMo, Llama Guard e Bedrock Guardrails: onde colocar a checagem e por que ela precisa existir na entrada e na saída.',
  'red-team-playbook': 'Playbook para atacar o seu próprio LLM: categorias de dano, métodos de ataque e o PyRIT — antes que alguém faça isso por você.',
  'capstone-red-team-agent': 'Capstone da trilha: fazer red team no seu próprio agente, tentando jailbreak, injeção e exfiltração de dado em cenário real.',
  'go-historia-compilador-diferencial': 'De onde Go vem e por que se parece com isso: Pike e Thompson, o compilador gc, e o que mudou nas versões até chegar em generics.',
  'go-mental-model': 'O modelo mental de Go: por que a linguagem prefere simplicidade explícita a abstração, e o que isso muda no código que você escreve.',
  'goroutines-channels': 'Concorrência em Go de verdade: goroutine, channel e select, mais o race detector — e por que canal não é fila de mensagem genérica.',
  'context-cancelation': 'O pacote context como contrato de cancelamento: prazo, deadline e propagação, e por que passar valor por context quase sempre é erro.',
  'interfaces-pequenas': 'Interface pequena e composição em Go: por que o consumidor declara a interface, e como isso torna teste e substituição triviais.',
  'error-handling-explicito': 'Tratamento de erro explícito em Go: erro sentinela, errors.Is e errors.As, e quando embrulhar em vez de propagar sem contexto.',
  'generics-go': 'Generics em Go a partir do 1.18: parâmetro de tipo, constraint e os casos em que generics ajudam — e os muitos em que interface já bastava.',
  'go-performance-pprof': 'Otimizar Go com medida, não palpite: pprof para achar o gargalo, escape analysis para entender alocação e sync.Pool onde ela pesa.',
  'capstone-go-cli-api': 'Capstone da trilha: uma CLI com Cobra e uma API com net/http e chi, escritas do jeito idiomático, com teste e build reprodutível.',
  'ml-mental-model': 'ML clássico ainda ganha em muitos problemas: o modelo mental de quando usar tabular em vez de LLM, e o que cada família de algoritmo assume.',
  'regressao-classificacao': 'Regressão linear e logística na prática com scikit-learn: o que cada uma modela, como ler os coeficientes e onde a fronteira linear falha.',
  'feature-engineering-serio': 'Feature engineering é onde o ganho real aparece: codificação de categoria, target encoding sem vazamento e o cuidado com dado do futuro.',
  'arvores-rf-xgboost': 'Random Forest, XGBoost e LightGBM comparados no que importa: viés e variância, custo de treino e quais hiperparâmetros movem o resultado.',
  'cross-validation-metricas': 'Validação cruzada e métricas honestas: por que acurácia engana em base desbalanceada, e como escolher entre precisão, recall e AUC.',
  'time-series-arima-prophet': 'Previsão de série temporal com ARIMA, Prophet e modelos neurais: sazonalidade, tendência e por que a validação não pode embaralhar o tempo.',
  'recommender-systems-basico': 'Recomendação na base: filtragem colaborativa e fatoração de matriz — o que cada uma resolve, e o problema do usuário novo.',
  'capstone-ml-pipeline-completo': 'Capstone da trilha: um pipeline de ML ponta a ponta, do dado cru ao endpoint em FastAPI, com validação e métrica registrada.',
  'mlops-ciclo-completo': 'O ciclo de vida completo de um modelo em produção e os níveis de maturidade de MLOps — para saber em qual você está antes de comprar ferramenta.',
  'feature-stores-feast': 'Feature store resolve um problema específico: a mesma feature no treino e na inferência. Feast, Tecton e Hopsworks, e quando não precisa.',
  'model-registry-mlflow': 'MLflow para rastrear experimento e versionar modelo: o que registrar para conseguir reproduzir um resultado seis meses depois.',
  'training-pipelines-kubeflow': 'Pipeline de treino orquestrado com Airflow, Kubeflow ou Prefect: o que cada um assume sobre sua infraestrutura e o custo de cada escolha.',
  'model-serving-triton': 'Servir modelo com Triton, TorchServe, BentoML ou Ray Serve: batching dinâmico, uso de GPU e o que decide entre eles em latência e custo.',
  'data-versioning-dvc': 'Versionar dado com DVC e lakeFS: por que versionar código sem versionar dado não dá reprodutibilidade, e como amarrar os dois.',
  'ci-cd-para-modelos': 'CI/CD para modelo é diferente de CI/CD de código: teste de dado, detecção de drift com Evidently e o gatilho que decide retreinar.',
  'capstone-mlops-plataforma': 'Capstone da trilha: montar uma plataforma de MLOps ponta a ponta, do experimento ao modelo servido, com registro e monitoramento.',
  'sd-framework-completo': 'Um framework para conduzir entrevista de system design: que perguntas fazer antes de desenhar, em que ordem, e como fechar em trade-off.',
  'sd-back-of-envelope': 'Cálculo de guardanapo que convence: estimar QPS, armazenamento e banda em voz alta, e usar latência de referência para justificar escolha.',
  'sd-url-shortener': 'Case de encurtador de URL: geração de chave, leitura muito maior que escrita, cache e o que muda quando o volume passa de bilhões.',
  'sd-twitter-feed': 'Case de timeline: fanout na escrita contra fanout na leitura, o problema da celebridade e a solução híbrida que a prática impôs.',
  'sd-rate-limiter': 'Case de rate limiter distribuído: token bucket sobre Redis, o problema de contagem entre instâncias e o que fazer quando o Redis cai.',
  'sd-chat-system': 'Case de mensageria tipo WhatsApp: conexão persistente, entrega e ordenação, presença, e o que criptografia ponta a ponta impede de fazer.',
  'sd-notification-system': 'Case de notificação em escala: push, e-mail e SMS por um mesmo canal de eventos, com preferência do usuário, retentativa e deduplicação.',
  'sd-distributed-cache': 'Case de cache distribuído: hashing consistente para não invalidar tudo ao adicionar nó, política de expiração e o risco de estampida.',
  'sd-search-system': 'Case de busca tipo Google: índice invertido, BM25 para ordenar, e como Elasticsearch resolve o que um banco relacional não resolve.',
  'capstone-sd-mock-interview': 'Capstone da trilha: uma entrevista simulada completa, do requisito ao desenho e ao trade-off, com o critério de avaliação exposto.',
  'nosql-mental-model': 'O modelo mental de NoSQL: as quatro famílias, o que cada uma abandona para ganhar escala, e quando relacional continua sendo a resposta.',
  'mongodb-producao': 'MongoDB em produção: modelar documento pelo padrão de acesso, pipeline de agregação e os índices sem os quais a consulta varre a coleção.',
  'redis-avancado-serio': 'Redis além de cache: streams como log, pub/sub, e script Lua para operação atômica — com o que cada estrutura custa em memória.',
  'dynamodb-design-patterns': 'Single-table design no DynamoDB: modelar a partir do padrão de acesso, chave composta e índice secundário — e por que junção não existe.',
  'clickhouse-analytics': 'ClickHouse para analytics de alto volume: MergeTree, armazenamento colunar e por que a consulta que voa aqui trava num banco de linha.',
  'sqlite-embedded-moderno': 'SQLite deixou de ser banco de brinquedo: Turso, libSQL e D1 levam o arquivo ao edge — e o modelo de escrita única que isso impõe.',
  'vector-dbs-pgvector-pinecone': 'pgvector, Pinecone, Weaviate e Qdrant comparados: quando o Postgres que você já tem basta, e o que justifica um banco vetorial dedicado.',
  'capstone-multi-db-arquitetura': 'Capstone da trilha: uma arquitetura com Postgres, Redis, MongoDB e pgvector convivendo, cada um no papel em que realmente ganha.',
  'cv-basico-opencv': 'Visão computacional na base com OpenCV: filtro, contorno e transformação — as operações que ainda resolvem problema sem rede neural.',
  'image-processing-pipelines': 'Pipeline de processamento de imagem que aguenta volume: augmentation com Albumentations e aceleração em GPU com CuPy, medindo o ganho.',
  'cnns-resnet-efficientnet': 'ResNet, EfficientNet e ConvNeXt: o que cada arquitetura resolveu, e por que transfer learning quase sempre vence treinar do zero.',
  'object-detection-yolo': 'Detecção de objeto com YOLO, DETR e RT-DETR: como ler mAP sem se enganar, o papel do NMS e o que decide entre precisão e latência.',
  'segmentation-unet-sam': 'Segmentação de imagem com U-Net, Mask R-CNN e SAM: a diferença entre semântica e por instância, e quando o modelo aberto já resolve.',
  'ocr-pratico': 'OCR na prática com Tesseract, PaddleOCR, TrOCR e Textract: qual acerta em documento torto, em tabela e em manuscrito — e a que custo.',
  'capstone-cv-production-pipeline': 'Capstone da trilha: um pipeline de visão em produção, exportando para ONNX e servindo com Triton, com latência medida ponta a ponta.',
  'rlhf-fundamentos-ppo': 'RLHF do zero: o papel do PPO, por que existe a penalidade de KL, e como reward hacking aparece justamente quando ela falta.',
  'rlaif-anthropic-claude': 'RLAIF Constitutional AI Anthropic: como Claude é treinado com AI feedback.',
  'dpo-vs-ipo-vs-kto': 'DPO IPO KTO comparados: alinhamento de LLM sem reward model. TRL HuggingFace.',
  'grpo-deepseek-r1': 'GRPO DeepSeek-R1: reasoning emergente sem reward model. Reprodução Unsloth.',
  'reasoning-models-internals': 'Modelos de raciocínio por dentro: o que o1, o3, R1 e Gemini Thinking fazem com o tempo extra, e onde isso não ajuda em nada.',
  'agent-swarms-crewai-autogen': 'CrewAI, AutoGen e OpenAI Swarm comparados: como cada framework divide papel entre agentes, e por que mais agentes raramente é mais resultado.',
  'langgraph-state-machines': 'LangGraph: agentes como state machines com cycles, human-in-loop, time travel.',
  'multi-agent-orchestration': 'Padrões de orquestração multi-agente: hierárquico, debate, votação e planejador-executor, com o custo em tokens e latência de cada um.',
  'agent-observability-langsmith': 'Observabilidade de agente com LangSmith, Helicone e Phoenix: que rastro guardar para conseguir depurar depois do incidente.',
  'agent-evaluation-prod': 'Agent evaluation produção: golden sets, LLM-as-judge, regression CI, agent arena.',
  'agent-cost-optimization': 'Custo de agente AI: prompt cache 90% off, cascade routing, custo por action.',
  'agent-security-prompt-injection': 'Segurança de agente: injeção de prompt, jailbreak e abuso de ferramenta — os três vetores e o que realmente contém cada um.',
  'diffusion-score-matching-math': 'A matemática da difusão sem atalho: score matching, a formulação em SDE e ODE, e o que separa DDPM de DDIM na prática de amostragem.',
  'vae-unet-internals': 'A arquitetura por trás do Stable Diffusion: o que o VAE comprime e o que a U-Net prevê em cada passo de remoção de ruído.',
  'stable-diffusion-3-flux': 'Stable Diffusion 3.5 e Flux por dentro: o que MMDiT e DiT mudam frente à U-Net, e o efeito prático na fidelidade ao prompt.',
  'controlnet-condicionamento': 'ControlNet para condicionar a geração com precisão espacial: pose, profundidade e borda, e quanta liberdade sobra ao modelo.',
  'lora-imagem-treino': 'Treinar LoRA de imagem em meia hora: quantas fotos, que legenda usar, e como saber se o estilo aprendeu ou apenas decorou.',
  'comfyui-engineering': 'ComfyUI tratado como código: versionar o workflow, parametrizar nó e rodar em lote sem depender de ninguém na interface.',
  'video-generation-sora': 'Geração de vídeo com Sora, Runway Gen-4, Kling e Veo: como o transformer de difusão trata o tempo, e onde a coerência ainda quebra.',
  'api-replicate-fal': 'APIs de geração comparadas: Replicate, fal.ai, RunPod e Modal em latência de partida a frio, preço e limite de fila.',
  'eval-fid-clip': 'Avaliar geração de imagem: o que FID e CLIP score medem de fato, por que DPG-Bench existe, e onde julgamento humano segue insubstituível.',
  'modelos-3d-mesh': 'Gerar malha 3D a partir de prompt ou foto com TripoSR, Stable Fast 3D e Hunyuan3D: qualidade de topologia e o que ainda exige retrabalho.',
  'quantizacao-gguf-awq-gptq': 'Quantização explicada: o que GGUF, AWQ e GPTQ fazem de diferente, e quanta qualidade INT8 e INT4 custam de verdade.',
  'llama-cpp-internals': 'llama.cpp por dentro: como o ggml organiza o tensor, onde o KV cache pesa na memória, e o que o FlashAttention economiza.',
  'ollama-production-deploy': 'Ollama em produção: gerenciar modelo em disco, empacotar em Docker e monitorar o que a GPU está realmente fazendo.',
  'vllm-paged-attention': 'vLLM e PagedAttention: como paginar o KV cache multiplica a vazão, e qual o limite quando o contexto começa a crescer.',
  'speculative-decoding': 'Decodificação especulativa dá 2 a 3 vezes mais velocidade quase de graça: como o modelo rascunho funciona e quando ele falha.',
  'mlx-apple-silicon': 'MLX para rodar LLM nativo em Apple Silicon: o que a memória unificada permite, e qual o teto real em um M3 ou M4.',
  'on-device-inference-mobile': 'Inferência no dispositivo com ExecuTorch, MediaPipe e Core ML: o que cabe na memória do celular e o que a bateria cobra por token gerado.',
  'rag-local-private': 'RAG cem por cento local: LanceDB ou Qdrant no disco com Ollama servindo — e o que se perde em qualidade sem a nuvem.',
  'eval-offline-local': 'Avaliar modelo local sem depender de serviço: lm-eval-harness e deepeval com MMLU, GSM8K e HumanEval, e como comparar sem se enganar.',
  'hardware-llm-comparativo': 'Hardware para LLM em 2026: Mac M3 Ultra, RTX 5090 e DGX comparados em memória, vazão e custo por token gerado.',
  'bm25-tfidf-fundamentos': 'A matemática de BM25 e TF-IDF: frequência de termo, IDF e o que os parâmetros k1 e b realmente controlam na ordenação do resultado.',
  'elasticsearch-internals': 'Elasticsearch por dentro: o índice invertido do Lucene, segmento e shard, e por que o refresh define a latência de escrita.',
  'opensearch-meilisearch-typesense': 'OpenSearch, Meilisearch e Typesense comparados: o que cada um assume sobre volume, e onde a operação começa a ficar caro.',
  'hybrid-search-rerank': 'Busca híbrida com reordenação: somar BM25 e vetor denso, e quanto um cross-encoder melhora antes de pesar na latência.',
  'embeddings-busca-bge': 'Modelos de embedding para busca: BGE-M3, e5, Voyage e Cohere comparados, e como Matryoshka deixa cortar dimensão sem retreinar nada.',
  'semantic-search-prod': 'Busca semântica em produção: indexação incremental, sharding e frescor do índice — os problemas que aparecem após o demo.',
  'vector-dbs-comparados': 'Bancos vetoriais em 2026: Qdrant, Weaviate, Pinecone e pgvector comparados em custo, filtro por metadado e operação.',
  'search-eval-mrr-ndcg': 'Avaliar busca com MRR, NDCG e P@K: como montar um golden dataset que não mente, e por que teste A/B de ranking exige disciplina.',
  'aif-intro': 'AWS AI Practitioner AIF-C01: blueprint completo, 5 domínios, formato de prova, scoring e por que vale a pena em 2026.',
  'aif-ai-ml-fundamentos': 'AI vs ML vs DL vs GenAI explicado: supervised, unsupervised, reinforcement learning, e quando usar cada paradigma.',
  'aif-sagemaker-overview': 'SageMaker para a prova AIF: o que Studio, Canvas e JumpStart fazem, e onde os AI Services já resolvem sem treinar nada.',
  'aif-genai-conceitos': 'Generative AI fundamentos: transformers, attention, foundation models, prompt engineering, hallucinations e mitigação.',
  'aif-bedrock-overview': 'Amazon Bedrock na prova AIF: quais modelos existem, como se invoca cada um, e o que entra na conta em cada chamada.',
  'aif-bedrock-knowledge-bases': 'Knowledge Bases do Bedrock: RAG gerenciado de verdade — o que ele faz por você e o que continua sendo a sua decisão.',
  'aif-bedrock-agents': 'Bedrock Agents: action groups Lambda, multi-turn orchestration, traces. Comparação com Step Functions e custom agent loop.',
  'aif-prompt-engineering': 'Prompt engineering na prova AIF: as técnicas que a AWS cobra e como elas aparecem redigidas nas alternativas da questão.',
  'aif-responsible-ai': 'Responsible AI na AWS: bias detection SageMaker Clarify, Bedrock Guardrails, Model Cards, Amazon A2I para human-in-the-loop.',
  'aif-security-governance': 'Segurança e governança de carga de IA na AWS: quem acessa o modelo, o que fica registrado, e onde o dado de fato repousa.',
  'aif-fine-tuning-eval': 'Customização e avaliação: fine-tuning LoRA QLoRA CPT, data prep, Bedrock Model Evaluation, SageMaker Clarify FMEval.',
  'aif-mlops-monitoramento': 'MLOps na prova AIF: SageMaker Pipelines, Model Monitor, e o que observar no Bedrock depois que o modelo já está no ar.',
  'aif-simulado-final': 'Estratégia AIF-C01: como atacar cada domínio, pegadinhas, time management 65 questões em 90 minutos.',
  'bedrock-o-que-e-e-por-que': 'O que é o Amazon Bedrock: serviço serverless multi-modelo de GenAI da AWS. Definição, quando usar, privacidade de dados e posicionamento.',
  'bedrock-vs-api-direta-quando-usar': 'Amazon Bedrock vs API direta (Anthropic, OpenAI): governança IAM, VPC, privacidade, multi-modelo e trade-offs de features. Guia de decisão.',
  'bedrock-primeira-chamada-converse': 'Primeira chamada ao Amazon Bedrock com a Converse API: exemplos boto3 e AWS SDK JS, IAM mínima, streaming e InvokeModel.',
  'bedrock-modalidades-texto-imagem-doc-video': 'Multimodal no Amazon Bedrock: enviar imagem, PDF, vídeo e áudio pela Converse API, limites, S3 vs bytes e reasoning content',
  'bedrock-catalogo-modelos-qual-escolher': 'Catálogo de modelos do Amazon Bedrock em 2026: Claude, Nova, Llama, Mistral, Cohere, DeepSeek, embeddings e imagem — qual usar em cada caso.',
  'bedrock-tool-use-function-calling': 'Tool use / function calling no Amazon Bedrock Converse API: toolConfig, toolUse/toolResult, tool_choice e structured outputs — exemplos.',
  'bedrock-knowledge-bases-rag': 'Knowledge Bases de ponta a ponta: conectar a fonte, escolher o embedding, e o que muda quando o documento é atualizado.',
  'bedrock-agents-agentcore': 'Agents e AgentCore no Bedrock: colocar agente em produção com ferramenta, memória, e o teto que impede laço infinito.',
  'bedrock-guardrails-seguranca-ia': 'Amazon Bedrock Guardrails: filtros de conteúdo, PII, contextual grounding, automated reasoning e ApplyGuardrail — responsible AI.',
  'bedrock-flows-prompt-management-routing': 'Amazon Bedrock Flows, Prompt Management e Intelligent Prompt Routing: orquestração visual, versionamento e roteamento de modelos',
  'bedrock-data-automation-e-customizacao': 'Bedrock Data Automation (IDP) e customização: fine-tuning, distillation, custom model import, marketplace e model evaluation',
  'bedrock-precos-e-cobranca': 'Preços do Amazon Bedrock em 2026: on-demand, batch, provisioned throughput, prompt caching e tabela por modelo — como o Bedrock cobra.',
  'bedrock-finops-roi-controle-de-custo': 'FinOps do Amazon Bedrock: custo por request, inference profiles, Cost Explorer, ROI e os erros que explodem a conta — controle de custo.',
  'bedrock-arquiteturas-e-cases-reais': 'Arquiteturas de referência do Amazon Bedrock e cases reais (DoorDash, Pfizer, iFood, C6 Bank): RAG serverless, IDP, agents, streaming',
  'bedrock-arquitetura-referencia-ia-corporativa': 'Arquitetura de referência de IA corporativa sobre Amazon Bedrock: as 7 camadas, AI gateway, política de modelos, governança e implantação',
  'bedrock-claude-na-aws-ecossistema': 'Claude na AWS: Bedrock Converse, cliente Mantle, Claude Platform on AWS e Claude Code via Bedrock — model IDs, features e trade-offs.',
  'bedrock-servicos-ia-especializada': 'IA especializada da AWS junto do Bedrock: Textract, Comprehend, Transcribe, Rekognition e SageMaker Ground Truth — quando não usar o LLM.',
  'bedrock-servicos-seguranca-conformidade': 'Segurança e conformidade para IA na AWS: IAM, KMS, PrivateLink, WAF, Macie e Organizations junto do Amazon Bedrock.',
  'bedrock-servicos-observabilidade-finops': 'Observabilidade e FinOps de IA na AWS: CloudWatch, X-Ray, CloudTrail, invocation logging, Cost Explorer e Budgets com Bedrock',
  'bedrock-servicos-canais-borda': 'Canais e borda para IA na AWS: Amazon Connect, Lex, API Gateway WebSocket, AppSync e CloudFront com Amazon Bedrock.',
  'bedrock-servicos-compute-orquestracao': 'Compute e orquestração para IA na AWS: Lambda, Fargate, Step Functions, EventBridge, SQS e DynamoDB com Amazon Bedrock.',
  'bedrock-servicos-dados-retrieval': 'Dados e retrieval para IA na AWS: vector stores comparados, Kendra, Athena e Glue com Amazon Bedrock.',
  'bedrock-rag-producao-padroes': 'RAG em produção no Amazon Bedrock: chunking, busca híbrida, contextual retrieval, reranking, métricas recall@k/MRR/nDCG e custo.',
  'bedrock-tool-use-producao': 'Tool use profissional no Amazon Bedrock: design de ferramentas, schema estrito, paralelismo, idempotência, segurança e custo de cache',
  'bedrock-padroes-agenticos': 'Padrões agênticos com Amazon Bedrock: workflow vs agent, chaining, routing, orchestrator-workers, evaluator-optimizer e context engineering',
  'bedrock-evals-qualidade-producao': 'Evals de LLM em produção: golden set, LLM-as-judge, vieses do juiz, métricas, gate de regressão e canário de modelo no Bedrock',
  'bedrock-playbook-reducao-custo': 'Playbook de redução de custo de IA no Amazon Bedrock: 14 alavancas com economia típica, cascata de modelos, cache semântico e distillation',
  'bedrock-catalogo-cases-setor': 'Catálogo de cases reais de Amazon Bedrock por setor: banco, varejo, saúde, logística e indústria, cruzados com padrões arquiteturais',
  'bedrock-case-atendimento-inteligente': 'Case visual de atendimento com Amazon Bedrock: arquitetura RAG + contact center, baseline, decisões, erros e como replicar',
  'bedrock-case-documentos-setor-regulado': 'Case visual de IDP com Amazon Bedrock em setor regulado: pipeline event-driven, confidence routing, auditoria e custo por documento',
  'bedrock-case-copiloto-interno-engenharia': 'Case visual de copiloto interno com Amazon Bedrock: conhecimento corporativo, agents de engenharia, adoção e ROI por funcionário',
  'aws-ia-100-solucoes':
    'Cem problemas reais resolvidos com IA na AWS: a arquitetura de cada um, a decisão que ele ensina e a origem — 21 casos públicos, 32 arquiteturas AWS e 47 padrões.',

  // 100 Arquiteturas de IA na AWS — o desenho de cada uma das cem soluções.
  'arq-ia-aws-atendimento':
    'Dez arquiteturas de atendimento na AWS: Connect com Transcribe e Claude no orçamento de 2,5 s, escalonamento humano de primeira classe e classificar antes de gerar.',
  'arq-ia-aws-documentos':
    'Dez arquiteturas de extração de documentos na AWS: Textract e Bedrock Data Automation por evento, modelo só no campo interpretativo e limiar por campo.',
  'arq-ia-aws-busca':
    'Dez arquiteturas de RAG na AWS: Knowledge Bases com conectores, índice híbrido para token raro, filtro de permissão na ingestão e na consulta, e o custo do índice.',
  'arq-ia-aws-agentes':
    'Dez arquiteturas de agentes na AWS: AgentCore com ferramentas, adaptador como fronteira de segurança no legado, teto de passos e confirmação em ação irreversível.',
  'arq-ia-aws-copiloto':
    'Dez arquiteturas de copiloto interno na AWS: assistente sobre runbook e histórico de incidente, revisão de código com critério de saída e texto-para-SQL em réplica.',
  'arq-ia-aws-dados':
    'Dez arquiteturas de BI conversacional na AWS: catálogo descrito como insumo do texto-para-SQL, partição e formato colunar para conter o dado varrido, e CDC medido.',
  'arq-ia-aws-conteudo':
    'Dez arquiteturas de mídia e personalização na AWS: moderação em camadas com Rekognition e Guardrails, acervo de vídeo em lote e adaptador de estilo para a marca.',
  'arq-ia-aws-risco':
    'Dez arquiteturas de risco e conformidade na AWS: escore reproduzível com explicação em linguagem, PrivateLink e IAM por modelo, e redação antes do prompt.',
  'arq-ia-aws-plataforma':
    'Dez arquiteturas de plataforma de IA na AWS: perfil de inferência por inquilino para atribuir custo, cache semântico em MemoryDB e roteamento por dificuldade.',
  'arq-ia-aws-operacao':
    'Dez arquiteturas de operação e segurança de IA na AWS: defesa de injeção indireta por permissão, contenção de exfiltração, sonda contra a produção e alarme de gasto.',

  // 100 Laboratórios de Arquitetura AWS — ver docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md
  'lab-app-web-ecs-fargate-rds':
    'Suba uma aplicação .NET 8 em ECS Fargate com RDS em sub-rede privada e front na borda, com o Terraform inteiro e a decisão de cada peça explicada.',
  'lab-rede-vpc-subrede-privada-nat':
    'Entenda por que uma sub-rede é privada pela tabela de rotas, e não por uma flag: duas camadas, NAT do lado certo e o banco sem endereço público.',
  'lab-deploy-ecr-rolling-update-drenagem':
    'Publique uma versão nova sem tirar a aplicação do ar: tag imutável por SHA, excedente durante a troca e prazo de drenagem derivado do p99 medido.',
  'lab-segredo-secrets-manager-rotacao':
    'Tire a senha do repositório sem trocar vazamento por indisponibilidade: rotação, envelope encryption e a aplicação relendo a credencial sem reiniciar.',
  'lab-dominio-tls-cloudfront-estatico':
    'Ponha domínio próprio e HTTPS na frente da aplicação, com o estático em cache e a API no mesmo domínio, entendendo o que decide a taxa de acerto.',
  'lab-escala-automatica-ecs-metrica':
    'Escale o ECS pela métrica que antecede o pico, não pela que o retrata tarde, e meça os quatro atrasos entre a carga chegar e a capacidade chegar.',
  'lab-banco-replica-multiaz-pool':
    'Separe o que Multi-AZ resolve do que a réplica resolve, e descubra por que a latência vinha da consulta sem índice e da conta tasks × pool.',
  'lab-api-gateway-cota-versao-ou-alb':
    'API Gateway não substitui ALB: administra contrato com terceiro (cota, chave, versão). Prova por aritmética por que cota em memória de cada task falha ao escalar.',
  'lab-autenticacao-cognito-sessao-sem-estado':
    'Tire a sessão da memória do contêiner com Cognito e JWT: valide a assinatura localmente, entenda os três tokens, e o preço de a revogação deixar de ser imediata.',
  'lab-escolher-banco-pela-carga':
    'Não escolha banco por tipo de dado: escolha pelo padrão de acesso. A mesma feature em RDS, Aurora e DynamoDB, medida, prova quando cada um vence e quando perde feio.',
  'lab-cache-redis-invalidacao-p95':
    'Cache não é cópia mais rápida do banco: é uma segunda fonte de verdade. Padrões, debandada de cache e a corrida que o TTL só limita, nunca elimina.',
  'lab-upload-direto-s3-url-assinada':
    'Tire o upload de dentro do contêiner com URL assinada do S3: o que realmente limita tamanho, o custo de multipart incompleto, e a validação que muda de lugar.',
  'lab-migration-expand-contract-sem-janela':
    'Migre schema em produção sem parar: expand/contract em três fases, qual DDL trava o quê no PostgreSQL, e a fila de bloqueio que transforma 200ms em minutos.',
  'lab-observabilidade-trace-correlacao':
    'Torne uma requisição rastreável ponta a ponta: log estruturado com o identificador que o balanceador já injeta, trace amostrado e métrica que nasce do log.',
  'lab-custo-tags-orcamento-rateio':
    'Instrumente a fatura antes de ela crescer: tag de alocação, orçamento com alerta por previsão e o rateio por ambiente que explica cada componente.',
  'lab-spa-na-borda-ou-ssr-no-conteiner':
    'SPA na borda ou SSR no contêiner: onde o HTML é montado decide o que a borda cacheia, o TTFB e o custo por visita. As duas versões publicadas, medidas.',
  'lab-restauracao-ensaiada-rto-rpo':
    'Meça RTO e RPO restaurando de verdade, e descubra que as maiores parcelas não estão na AWS: estão em detectar o incidente e em repontar a aplicação.',
  'lab-aurora-serverless-v2-endpoint-failover':
    'Aurora Serverless v2 escala em ACUs sem esperar transação terminar. O que decide piso e teto é carga medida — e o comportamento que trava pertence à v1, não à v2.',
  'lab-dynamodb-modelagem-tabela-unica':
    'A chave do DynamoDB é a resposta compilada à consulta, não o nome da entidade. Modele por padrão de acesso e sirva quatro consultas sem um único Scan.',
  'lab-busca-catalogo-opensearch-vs-like':
    'LIKE com curinga à esquerda não usa índice. Veja até onde o full-text nativo do PostgreSQL basta antes de OpenSearch se justificar, com o limite de cada um medido.',
  'lab-lambda-dotnet8-cold-start':
    'Fargate cobra por existir, Lambda cobra por rodar. Meça o cold start real do .NET 8, compare com Native AOT, e descubra por que job raro sofre mais, não menos.',
  'lab-fila-sqs-dlq-idempotencia':
    'SQS entrega ao menos uma vez: a duplicata é o contrato, não o bug. Consumidor idempotente por escrita condicional, DLQ e reprocessamento provado por medição.',
  'lab-fanout-sns-sqs-multiplos-consumidores':
    'Adicione um terceiro consumidor sem tocar no produtor: SNS move a lista de quem recebe para as assinaturas, e publish com sucesso não é entrega garantida.',
  'lab-eventbridge-espinha-dorsal':
    'Troque a teia de integrações ponto a ponto por um barramento com regra nomeada e contrato de evento versionado — com replay provado recuperando um consumidor.',
  'lab-step-functions-orquestracao-ou-codigo':
    'O try/catch de 400 linhas vira máquina de estados visível, com retry e catch declarados por passo. Mesmo fluxo nas duas formas, mesma falha injetada nos dois.',
  'lab-api-serverless-onde-nao-serve':
    'Compare a mesma API em ECS sempre ligado contra API Gateway + Lambda + DynamoDB, e ache o ponto exato em que uma curva de custo cruza a outra.',
  'lab-eventbridge-scheduler-sem-ec2-cron':
    'Desligue a EC2 que só existe para o cron: EventBridge Scheduler com fuso horário correto, janela de flexibilidade e DLQ que torna o silêncio observável.',
  'lab-pipeline-s3-evento-processamento':
    'Pare de rodar script à mão quando o arquivo chega: S3 dispara EventBridge, Lambda valida e enfileira, e cada arquivo tem uma trilha de estado rastreável.',
  'lab-streaming-mudanca-dynamodb-streams':
    'Troque polling por streaming: DynamoDB Streams avisa cada mudança do banco com ordem preservada por chave de partição, sem perder transição intermediária.',
  'lab-limites-serverless-medidos':
    'Meça os cinco limites que o job de 20 minutos esbarra ao mesmo tempo no Lambda, e veja quando Step Functions com Fargate é a resposta, não a gambiarra.',
  'lab-extrair-servico-fronteira-transacao':
    'Extraia o serviço certo do monolito: o teste é se ele termina a própria transação sem depender de outro no mesmo commit — com outbox e fila provados.',
  'lab-sincrono-ou-assincrono-entre-servicos':
    'Numa cadeia síncrona a disponibilidade é o produto, não a média. Meça o efeito real e desacople só o que não precisa de resposta imediata.',
  'lab-descoberta-servico-connect-lattice':
    'Pare de gravar IP de task em variável de ambiente. Service Connect, Cloud Map e VPC Lattice resolvem problemas diferentes — veja qual é o seu.',
  'lab-eks-quando-ecs-nao-basta':
    'EKS acrescenta um segundo plano de operação sobre o mesmo Fargate do ECS. Veja o custo operacional medido e o único critério que justifica trocar.',
  'lab-saga-transacao-distribuida-compensacao':
    'Sem transação ACID entre serviços, a saga usa transações locais com compensação explícita. Fluxo orquestrado em Step Functions, falha injetada de propósito.',
  'lab-retry-backoff-jitter-circuit-breaker-polly':
    'Retry sem backoff vira apagão em cascata. Configure exponential backoff, jitter decorrelacionado e circuit breaker no .NET, e reproduza o retry storm.',
  'lab-consistencia-eventual-ponto-de-vista-usuario':
    'O usuário que salvou e não vê a própria mudança acha que é bug. Resolva com leitura-própria-escrita, deixando os outros usuários eventualmente consistentes.',
  'lab-multi-tenant-linha-schema-conta':
    'Isolamento multi-tenant não é feature — é decisão de fronteira. Os três modelos (linha, schema, conta) implementados, com teste de vazamento executável.',
  'lab-blue-green-canario-codedeploy-ecs':
    'Blue/green cria uma frota nova inteira antes de expor tráfego. Rollback é reapontar o listener para a frota que nunca parou de existir, com alarme disparando.',
  'lab-teste-de-carga-gargalo-real':
    'Suba a carga em degraus até achar o gargalo real — quase nunca é o que a intuição aponta primeiro. Curva de carga até a quebra, com o ponto exato nomeado.',
  'lab-iam-policy-menor-privilegio-auditoria':
    'Troque AdministratorAccess por uma policy derivada do uso real via IAM Access Analyzer sobre o CloudTrail, testada até não quebrar nenhum caminho de código.',
  'lab-identidade-workload-task-role-irsa':
    'Elimine toda chave de acesso estática: task role, execution role e IRSA explicados com precisão, e por que a chave vazada é testada antes da role correta.',
  'lab-multi-conta-organizations-scp-control-tower':
    'SCP não concede — só recorta o teto do que o IAM já permite. Duas OUs com SCP provando que uma ação destrutiva em produção fica impossível, não só desencorajada.',
  'lab-endpoint-vpc-privatelink-sem-nat':
    'Pare de pagar NAT para tráfego que nunca devia sair da AWS: endpoint Gateway grátis para S3/DynamoDB, Interface via PrivateLink para o resto, com a economia medida.',
  'lab-rede-hibrida-vpn-direct-connect-transit-gateway':
    'Conecte o datacenter à VPC com redundância de verdade: Direct Connect como caminho físico primário, VPN como contingência, Transit Gateway como hub central.',
  'lab-kms-envelope-cmk-rotacao':
    'A CMK nunca cifra o byte — cifra a chave de dados efêmera que cifra o byte. CMK própria muda quem controla a política, com rotação e trilha de uso por chave.',
  'lab-waf-shield-bloqueio-na-borda':
    'O custo de um bot nasce antes da resposta: a task já rodou para dizer não. WAF na borda com regras gerenciadas e rate limit bloqueia antes de custar computação.',
  'lab-deteccao-guardduty-security-hub-config':
    'GuardDuty e Config já detectam sozinhos. O que falta é prazo: Security Hub agrega, EventBridge dispara automação, e o achado vira ticket com SLA por severidade.',
  'lab-dado-pessoal-minimizar-mascarar-macie':
    'O log É um banco de dados de CPF que ninguém tratou como banco de dados. Minimize antes de mascarar: allowlist de campos, Macie varrendo sem achado.',
  'lab-resposta-incidente-blast-radius':
    'Desativar a chave vazada não mata a sessão temporária já emitida. CloudTrail via Athena mede o blast radius real — contenção cronometrada, não suposição.',
  'lab-opentelemetry-tres-pilares-dotnet':
    'Log, métrica e trace param de exigir disciplina para se correlacionar quando nascem da mesma biblioteca. Trocar de backend vira reconfigurar o coletor.',
  'lab-slo-error-budget-alarme-acionavel':
    '40 alarmes de causa técnica são excesso sem priorização. Burn rate com duas janelas separa pico transiente de consumo sustentado antes de acordar o plantão.',
  'lab-dashboard-pergunta-operacional':
    'Um painel bonito com métrica disponível não responde nada. Escreva as 6 perguntas de operação primeiro, depois desenhe o widget que responde cada uma.',
  'lab-pipeline-cicd-oidc-sem-chave':
    'Publique sem nenhuma chave estática: GitHub Actions troca um JWT por credencial STS via OIDC, restrita ao repositório e branch — a chave nunca existiu.',
  'lab-terraform-modulo-estado-remoto-drift':
    'Tire o tfstate do laptop: estado remoto com lock elimina a corrida entre applies, e um plano agendado detecta o drift que ninguém pergunta sozinho.',
  'lab-ambiente-por-conta-sem-copiar-colar':
    'Pare de copiar a pasta do Terraform entre ambientes: um módulo, chamado uma vez por conta, com a mesma imagem promovida — diferença só em variável.',
  'lab-chaos-derrubar-az-fis':
    'Teste a alta disponibilidade que só existe no desenho: derrube uma AZ de verdade com FIS, hipótese escrita, stop condition, e o SLO como critério.',
  'lab-dr-multiregiao-quatro-estrategias':
    'As quatro estratégias de DR, do backup/restore ao multi-site ativo-ativo, com failover regional ensaiado de verdade — RTO e RPO medidos, não estimados.',
  'lab-finops-rightsizing-antes-compromisso':
    'Meça com Compute Optimizer antes de comprar Savings Plans: compromisso sobre o tamanho errado só torna o desperdício mais barato, não o corrige.',
  'lab-well-architected-review-seis-pilares':
    'Revise os seis pilares da sua própria arquitetura: risco alto ou médio por pergunta, com plano de melhoria priorizado — não uma auditoria abstrata.',
  'lab-operacional-analitico-extracao-incremental':
    'Réplica de leitura reduz carga, não contenção. Extraia via CDC para um armazenamento separado — a resposta estrutural ao relatório que trava o banco.',
  'lab-data-lake-bronze-prata-ouro':
    'Estruture o S3 em três camadas com contrato: bruto, limpo e pronto para consumo. Lake Formation concede acesso por tabela e coluna, não por objeto solto.',
  'lab-kinesis-shard-ordem-reprocesso':
    'Evite o hot shard: chave de partição de alta cardinalidade distribui a carga, e a ordem só é garantida dentro do shard — nunca entre shards.',
  'lab-parquet-particao-arquivo-pequeno':
    'Pare de escanear 400 GB para responder um dia: Parquet colunar, partição por data e buffer ajustado reduzem bytes varridos, medidos antes e depois.',
  'lab-glue-catalog-crawler-job-idempotente':
    'Tire o schema da cabeça de uma pessoa: Glue Data Catalog central, crawler que infere schema sem ser mágico, job ETL idempotente por partição.',
  'lab-athena-consulta-barata-workgroup':
    'Athena cobra por byte varrido: cada otimização de formato e partição já reduz custo. Workgroup trava consulta cara antes de rodar, CTAS materializa scan pesado.',
  'lab-iceberg-upsert-time-travel':
    'Corrigir dado histórico em Parquet exige reescrever a partição inteira. Tabela Iceberg traz UPDATE, DELETE e consulta a um estado passado, sem tocar no presente.',
  'lab-redshift-dashboard-lento':
    'Athena resolve consulta ad-hoc, não painel com concorrência. Redshift Serverless com DISTKEY certo e materialized view tira o painel de baixo de 3 segundos.',
  'lab-lake-formation-permissao-coluna':
    'Catálogo pronto também deixa um analista ver CPF e margem de custo. Lake Formation restringe por coluna e linha, com teste de negativa provando o bloqueio.',
  'lab-qualidade-dado-contrato-quarentena':
    'Um produtor upstream muda a unidade de uma coluna sem avisar, e um modelo aprende sobre números errados. Glue Data Quality barra o registro e alerta quem produziu.',
  'lab-regra-ou-modelo-baseline':
    'Um classificador foi publicado sem medir contra as três condições que já decidiam a mesma coisa. Regra como baseline, modo sombra, e quem venceu de verdade.',
  'lab-feature-store-treino-inferencia':
    'Acurácia boa no notebook e ruim em produção: a mesma feature calculada duas vezes, de jeitos diferentes. Feature Store centraliza o cálculo, skew medido em zero.',
  'lab-sagemaker-treino-experimento-rastreavel':
    'Um modelo treinado num notebook local está em produção e ninguém reproduz o resultado. Training Job com Experiments rastreia commit, dado e hiperparâmetro.',
  'lab-servir-modelo-quatro-modos-inferencia':
    'Endpoint de GPU ligado 24 horas para 200 inferências por dia — o resto é custo parado. Os quatro modos de servir um modelo, medidos lado a lado, custo real.',
  'lab-model-registry-promocao-rollback':
    'Modelo promovido direto do notebook porque a métrica offline melhorou, e pior em produção, sem versão para voltar. Registry, aprovação e rollback exercitado.',
  'lab-pipeline-ml-ponta-a-ponta':
    'Mesmo com Model Registry pronto, o retreino ainda é disparado à mão. Pipeline orquestrado, disparado por dado novo, com cache de passo e linhagem completa.',
  'lab-drift-dado-conceito-model-monitor':
    'Um modelo serve há dois meses, o log técnico está limpo, e mesmo assim errou. Model Monitor distingue drift de dado do de conceito, com alarme.',
  'lab-metrica-modelo-vs-negocio':
    'AUC melhor no teste offline, receita igual em produção — um segmento pode estar pior, mascarado pela média. Clarify mede viés, teste A/B liga à realidade.',
  'lab-consumir-modelo-dotnet-fallback':
    'Chamada ao endpoint sem timeout: sob pico ou cold start, ela trava, e a requisição do usuário trava junto. Polly dá timeout, retry e caminho degradado.',
  'lab-custo-ml-onde-vaza':
    'Notebook ligado 24h, endpoint maior do que o tráfego pede, GPU ociosa no modo errado — quatro vazamentos, uma fatura. Cost Explorer acha o custo parado.',
  'lab-bedrock-primeira-chamada-dotnet':
    'Time quer usar um LLM e ninguém sabe onde a chamada mora. Cliente .NET 8 com streaming, retry seletivo, IAM escopada ao modelo e custo por chamada logado.',
  'lab-prompt-versionado-teste-regressao':
    'Prompt editado direto no console para melhorar, e a qualidade caiu por dias sem ninguém achar a causa. Prompt como código, com golden set que barra a promoção ruim.',
  'lab-rag-minimo-com-citacao':
    'LLM plugado direto responde algo plausível e errado, sem indicar de onde tirou. RAG recupera o trecho certo, cita a fonte, e a taxa de acerto vai de 35% a 92,5%.',
  'lab-onde-guardar-vetor-quatro-opcoes':
    'Knowledge Bases com OpenSearch foi escolhido por ser o padrão da documentação, nunca comparado. Quatro opções de banco vetorial medidas no mesmo acervo, custo real.',
  'lab-recuperacao-hibrida-reranking':
    'Os erros do RAG não eram de geração, eram de recuperação: busca vetorial generaliza um código exato. BM25 + vetor, com reranking, sobem o acerto.',
  'lab-guardrails-limite-do-controle':
    'Guardrail configurado virou sinônimo de está seguro — e 3 de 10 tentativas de contorno passaram. O limite real do controle, com o caso documentado.',
  'lab-agente-com-ferramenta-quem-executa':
    'IAM role ampla para o agente agir e sem teto de voltas — um pedido foi reembolsado três vezes. Lambda por ferramenta, teto no código, idempotência antes da ação.',
  'lab-avaliar-sistema-llm-juiz':
    'Golden set determinístico não avalia geração aberta, e melhorou virou impressão de quem leu exemplos. LLM como juiz com critério explícito, e o viés do juiz medido.',
  'lab-custo-latencia-genai':
    'Fatura de token cresceu 6x num mês: contexto repetido sem cache, modelo caro para tarefa simples. Cache de prompt, modelo por tarefa e batch, com a mesma qualidade.',
  'lab-prompt-injection-vazamento-inquilinos':
    'Documento do lojista A citado na resposta ao lojista B: filtro de tenant só no prompt, não na busca. Filtro vira obrigatório na query, dado nunca é comando.',
  'lab-atendimento-voz-prazo-escalonamento':
    'Em voz, 3 segundos de silêncio derruba a ligação — latência é requisito que elimina o modelo mais capaz. Modelo pelo prazo, escalonamento instrumentado.',
  'lab-idp-extracao-confianca-revisao-humana':
    'PDF mandado direto pro LLM extrair tudo trocou um valor e aprovou R$ 45 mil em vez de R$ 1.284. Textract extrai o determinístico; LLM interpreta; humano revisa.',
  'lab-copiloto-interno-permissao-por-fonte':
    'Um engenheiro perguntou sobre reembolso e recebeu dado financeiro confidencial. Identity Center filtra na recuperação — resposta muda por quem pergunta.',
  'lab-busca-produto-hibrida-rerank-geracao':
    'Parafuso 3/4 não achava o produto certo, e a busca ruim derrubava conversão. Recuperação híbrida decide o que aparece; geração só apresenta. A/B mediu 55% de ganho.',
  'lab-enriquecimento-lote-acervo':
    'Classificar 2 milhões de itens no Bedrock síncrono esbarra em limite de taxa e nunca termina. Batch com Step Functions faz o mesmo pela metade do custo, em horas.',
  'lab-agente-diagnostica-incidente-somente-leitura':
    'Plantão levanta às 3h para o mesmo roteiro manual. Agente com ferramentas somente-leitura por IAM, não por prompt, produz hipótese com evidência, sem poder agir.',
  'lab-trilha-imutavel-decisao-automatizada':
    'O veredito de um reembolso recusado foi sobrescrito, e o log expirou em 14 dias. Object Lock em modo Compliance torna a trilha imutável — nem admin apaga.',
  'lab-plataforma-ia-multi-time-cota-chargeback':
    'Um job de lote consumiu 91% da cota compartilhada, e a latência do atendimento disparou. Conta por time, cota isolada, chargeback por LINKED_ACCOUNT.',
  'lab-multi-regiao-ia-residencia-de-dado':
    'O modelo preferido só existe numa região, e o dado do cliente não pode sair da dele. Route 53 roteia por origem, IAM barra o pior caso.',
  'lab-projeto-final-plataforma-dotnet-aws-ia':
    'Os 99 laboratórios viram UM sistema: Well-Architected sobre o todo, e um DR ensaiado de verdade — RTO e RPO medidos, sustentabilidade ainda em risco alto.',
};

/** Descrição de SEO do módulo, ou undefined se não houver. */
export function getSeoDescription(slug: string): string | undefined {
  return SEO_DESCRIPTIONS[slug];
}
