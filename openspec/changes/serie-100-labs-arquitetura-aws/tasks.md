## 1. Preparar antes de escrever em volume

- [ ] 1.1 Escrever `L02` e `L03` e comparar com `L01` — três laboratórios é o mínimo para saber se o padrão da skill se sustenta ou se ele descreve só o primeiro caso
- [x] 1.2 Criar gate `validate_labs_aws.py`: duas arquiteturas com topologias diferentes, seção de limpeza presente, entregável declarado, slug sem número
- [x] 1.3 Fazer o gate verificar que toda peça da arquitetura de produção aparece na tabela "requisito que a justifica" do próprio módulo
- [x] 1.4 Prova negativa do gate: duplicar um diagrama, remover a limpeza, numerar um slug — cada um reprova a checagem certa
- [ ] 1.5 Decidir e registrar o ponto de quebra da trilha: acima de quantos módulos a trilha vira uma trilha por banda

## 2. Banda 1 — a primeira aplicação completa (L02–L10)

Cada laboratório descasca um concern da aplicação de `L01`, e é isso que os torna
encadeados em vez de dez `terraform apply` diferentes.

- [ ] 2.1 `L02` A rede por baixo: sub-rede pública vs privada, NAT vs endpoint, plano de endereçamento
- [ ] 2.2 `L03` Da imagem ao deploy sem indisponibilidade: ECR, rolling update, drenagem
- [ ] 2.3 `L04` Segredo fora do código, com rotação
- [ ] 2.4 `L05` Domínio, TLS e estático na borda — inclui o certificado que precisa estar em `us-east-1`
- [ ] 2.5 `L06` Escalar quando chega gente: target tracking e a métrica que decide
- [ ] 2.6 `L07` O banco sob carga: Multi-AZ, réplica de leitura, pool de conexão
- [ ] 2.7 `L08` Enxergar o que quebrou: log estruturado, métrica, trace correlacionado
- [ ] 2.8 `L09` A conta no fim do mês: dimensão de custo, tag, budget
- [ ] 2.9 `L10` Voltar de um desastre — com ensaio cronometrado
- [ ] 2.10 Atualizar a tabela "Estado de execução" do catálogo e regenerar manifesto e índice leve

## 3. Bandas 2 e 3 — API, dados e desacoplamento (L11–L30)

- [ ] 3.1 `L11`–`L20`: API Gateway vs ALB, Cognito, cache, banco pela carga, Aurora, DynamoDB, upload direto, migração sem parar, busca, SPA vs SSR
- [ ] 3.2 `L21`–`L30`: Lambda .NET 8 e cold start, fila com DLQ e idempotência, fanout, EventBridge, Step Functions vs código, API serverless, agendamento, evento de objeto, CDC, limites do serverless
- [ ] 3.3 Atualizar catálogo e artefatos gerados ao fim de cada banda

## 4. Bandas 4 a 6 — distribuir, proteger, operar (L31–L60)

- [ ] 4.1 `L31`–`L40`: primeiro corte do monolito, síncrono vs assíncrono, descoberta e malha, EKS quando ECS não basta, saga, retry e disjuntor, consistência eventual, multi-tenant, canário, teste de carga
- [ ] 4.2 `L41`–`L50`: menor privilégio derivado do uso, identidade de workload, multi-conta com SCP, rede privada, rede híbrida, KMS, WAF, detecção, dado pessoal, resposta a incidente
- [ ] 4.3 `L51`–`L60`: OpenTelemetry no .NET, SLO e error budget, painel que responde pergunta, pipeline sem chave estática, Terraform em módulo, ambiente por conta, chaos com FIS, DR multi-região, FinOps, revisão Well-Architected
- [ ] 4.4 Verificar o encadeamento: cada laboratório aqui consome ambiente das bandas 1 a 3, e não reconstrói

## 5. Bandas 7 e 8 — dados e ML (L61–L80)

- [ ] 5.1 `L61`–`L70`: operacional vs analítico, lake em camadas, streaming com shard e ordem, formato e partição, catálogo e ETL, custo por byte varrido, Iceberg, Redshift, governança por coluna, qualidade de dado
- [ ] 5.2 `L71`–`L80`: quando ML resolve e quando regra resolve, feature store, treino rastreável, quatro modos de inferência, registry com rollback, pipeline, drift, avaliação ligada ao negócio, consumo do .NET com fallback, custo de ML
- [ ] 5.3 Confirmar que o lake da banda 7 é o mesmo que a banda 9 vai consumir

## 6. Bandas 9 e 10 — IA generativa e solução integrada (L81–L100)

- [ ] 6.1 `L81`–`L90`: primeira chamada ao Bedrock do .NET, prompt versionado, RAG com citação, quatro bancos vetoriais medidos, recuperação híbrida e rerank, guardrails e seu limite, agente com permissão por ferramenta, avaliação com golden set, custo e latência, prompt injection e isolamento
- [ ] 6.2 Cada um da banda 9 cita o `S##` correspondente do catálogo de soluções
- [ ] 6.3 `L91`–`L99`: atendimento, IDP, copiloto interno, busca com IA, lote, agente de operação, conformidade de decisão, plataforma multi-time, multi-região para IA
- [ ] 6.4 `L100` projeto final: integra os 99, com revisão Well-Architected e DR ensaiado
- [ ] 6.5 Revisar a série inteira contra os 20 essenciais para portfólio: eles precisam ser os mais completos

## 7. Fechar

- [ ] 7.1 Reavaliar a estrutura da trilha com 100 módulos e executar a quebra por banda decidida em 1.5
- [ ] 7.2 Conferir no navegador uma amostra de cada banda: dois diagramas percorríveis, limpeza legível, sem overflow a 375 px
- [ ] 7.3 Atualizar `CLAUDE.md`, `PENDENCIAS.md` e a memória de projeto com os números finais
- [ ] 7.4 Rodar todos os gates de conteúdo, a suíte e a varredura completa
