## 1. Unificar a forma antes de escrever conteúdo

- [x] 1.1 Comparar a forma que o banco entrega com a que o catálogo entrega, e escolher a do banco como canônica — ela já é a que o `EstudoClient` renderiza rico
- [x] 1.2 Apagar `parseExplanationString` e os marcadores `TODO_REVIEW`; confirmar por varredura que nada a chamava
- [x] 1.3 Registrar no `PENDENCIAS.md` que os marcadores nunca vazaram ao aluno, porque a função nunca executou — a medição contradisse o diagnóstico inicial
- [x] 1.4 Remover do `EstudoClient` qualquer ramo por origem, se existir

## 2. Gate antes da migração

- [x] 2.1 Gate que exige tratamento por distrator em toda questão, de qualquer fonte, começando em modo relatório
- [x] 2.2 Reportar o número inicial: 0 de 75 no catálogo, e o número do banco medido
- [ ] 2.3 Prova negativa: achatar a explicação de uma questão do banco e conferir que o gate reprova
- [ ] 2.4 Virar para modo falha quando as 75 estiverem migradas

## 3. Migrar as 75 questões

É redação técnica, não conversão mecânica: cada distrator precisa do nome do erro de
raciocínio de quem o escolheria.

- [ ] 3.1 Agrupar as 75 por certificação e por domínio, para escrever com o mesmo contexto na cabeça
- [ ] 3.2 Migrar por grupo, tratando cada distrator e fechando com a regra generalizável quando houver
- [ ] 3.3 Revisar contra as 1015 do banco como referência de qualidade — a mediana de explicação lá é a barra
- [ ] 3.4 Conferir no navegador: a explicação rica renderiza igual às do banco, sem overflow a 375 px

## 4. Travar

- [ ] 4.1 Ligar o gate em modo falha e registrar a cobertura
- [ ] 4.2 Falhar quando a cobertura cair
- [ ] 4.3 Atualizar `PENDENCIAS.md` (B-5 fechada, com a saída escolhida e o motivo) e `PADRAO_ENSINO.md` se a regra de explicação passar a valer também para questão de simulado, e não só para quiz de módulo
