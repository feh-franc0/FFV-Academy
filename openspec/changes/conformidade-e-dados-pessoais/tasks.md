## 1. Bloquear a publicação incompleta — primeiro, e independe de terceiros

- [x] 1.1 Gate que falha quando página servida ao público contém `[PREENCHER]`, `TODO`, `XXX` ou `lorem ipsum` no conteúdo visível
- [x] 1.2 Ignorar marcador em comentário que não chega ao HTML — a regra é sobre o que o usuário lê
- [x] 1.3 Prova negativa: acrescentar um marcador numa página e conferir que reprova
- [x] 1.4 Conferir que hoje o gate reprova por causa de `/privacidade`, que é o comportamento correto

## 2. Levantar o que a plataforma realmente coleta

Antes de escrever a política, medir — política que descreve coleta imaginária é pior que
ausência.

- [ ] 2.1 Login por link mágico: e-mail e telefone; onde ficam, por quanto tempo
- [ ] 2.2 Sincronização de progresso: XP, streak, módulos concluídos, respostas de quiz, cartas de SRS
- [ ] 2.3 Ranking público: apelido e posição, e se é opt-in de fato
- [ ] 2.4 Análise de uso sem cookies: o que é enviado
- [ ] 2.5 Preferências e estado local no navegador
- [ ] 2.6 Produzir a tabela categoria → finalidade → base → retenção, que é o insumo da redação

## 3. Preencher e revisar — dono: o responsável legal

- [ ] 3.1 Preencher os quatro campos: controlador, entidade legal, documento, canal do encarregado
- [ ] 3.2 Revisão jurídica da política completa, com a tabela da etapa 2 anexa
- [ ] 3.3 Publicar somente depois da revisão

## 4. Retenção e exclusão, escritas e implementadas

- [ ] 4.1 Definir, por categoria, o que sai na exclusão, o que fica agregado sem identificação e o que fica por obrigação legal, com prazo
- [ ] 4.2 Decidir explicitamente o que acontece com a entrada no ranking público
- [ ] 4.3 Implementar o fluxo no backend, com teste que confirma que dado identificável sai e agregado permanece
- [ ] 4.4 Caminho na interface para ver, exportar e pedir exclusão — sem depender de troca de e-mail
- [ ] 4.5 Varrer log de aplicação por dado identificável e remover na origem

## 5. Iconografia

- [ ] 5.1 Registrar a origem de cada uma das 216 entradas do catálogo: própria, derivada de conjunto oficial, ou de terceiro com licença nomeada
- [ ] 5.2 Verificar os termos do conjunto de origem para as famílias derivadas, considerando que a plataforma tem anel de monetização
- [ ] 5.3 Substituir por desenho próprio o que os termos não permitirem
- [ ] 5.4 Conferir que nenhuma entrada conceitual imita marca de produto — elas não representam produto nenhum
- [ ] 5.5 Gate que exige origem declarada em entrada nova
- [ ] 5.6 Conferir que nenhum ícone vem de host externo

## 6. Fechar

- [ ] 6.1 Fechar E-1, E-2 e E-4 em `PENDENCIAS.md`
- [ ] 6.2 Registrar a decisão de retenção onde ela não se perca — a política publicada é a fonte, e o código tem de citá-la
