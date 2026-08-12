## 1. Honestidade primeiro — não depende de backend

- [ ] 1.1 Ler o texto que `peer-stats.ts` alimenta hoje e listar cada frase que afirma comparação com outros alunos
- [ ] 1.2 Reescrever para falar do próprio progresso, ou declarar que o número é local, enquanto o endpoint não existir
- [ ] 1.3 Teste que reprova se voltar texto de comparação alimentado por dado local
- [ ] 1.4 Registrar em `PENDENCIAS.md` que esta parte foi feita antes do endpoint, e por quê

## 2. Estatística agregada por módulo

- [ ] 2.1 Decidir a fonte da agregação: ler de `progress` ou manter tabela de contadores — pesar custo de consulta contra frescor
- [ ] 2.2 Definir e registrar o piso de agregação que impede reidentificação, com o raciocínio (base pequena, ranking público, módulo recém-publicado)
- [ ] 2.3 `GET /api/v1/module/:id/stats` público, cacheável, sem identificador de usuário na resposta
- [ ] 2.4 Testes Go: abaixo do piso não devolve contagem; resposta não contém campo de identidade
- [ ] 2.5 Religar a interface, agora medindo, com a janela de tempo à vista

## 3. Tutor com pergunta livre

- [ ] 3.1 `POST /api/v1/tutor/ask` recebendo pergunta e módulo de origem
- [ ] 3.2 Ancorar a resposta no conteúdo do módulo e citar a parte que a sustenta
- [ ] 3.3 Tratar conteúdo do módulo como dado, não como instrução — inclusive bloco de código
- [ ] 3.4 Limite por usuário autenticado e limite mais estrito para origem anônima, com 429 e tempo de espera visível na interface
- [ ] 3.5 Recusar citação de slug que não existe no currículo, antes de a resposta sair
- [ ] 3.6 Registrar tokens, latência e módulo por chamada; alarme de custo diário
- [ ] 3.7 Ligar o `TutorAsk.tsx` e conferir o caminho de erro, não só o de sucesso

## 4. Cobrança do anel de simulados

- [ ] 4.1 Conferir que nenhuma rota de `/aprenda` entra em verificação de assinatura
- [ ] 4.2 Exibir preço, escopo e política de reembolso antes do checkout
- [ ] 4.3 Sessão de checkout criada no backend; nenhum segredo no cliente
- [ ] 4.4 Webhook com verificação de assinatura e processamento idempotente
- [ ] 4.5 Concessão de acesso somente pelo webhook — a rota de sucesso não concede nada
- [ ] 4.6 Caminho de cancelamento na própria interface
- [ ] 4.7 Teste que falha se chave secreta aparecer em variável exposta ao navegador
- [ ] 4.8 Exercitar em ambiente de teste do provedor: pagamento aprovado, recusado, webhook duplicado e webhook forjado
