## 1. Recalcular as variáveis de paleta usadas como texto

- [x] 1.1 Levantar toda variável CSS que serve de cor de texto e medir contra `#0d1117`, `#ffffff` e `#f6f8fa`
- [x] 1.2 Calcular o menor ajuste que leva todas a 4,5:1 no tema claro sem derrubar nenhuma abaixo de 4,5:1 no escuro — o mesmo método que produziu o fator de 57% do utilitário de acento
- [x] 1.3 Aplicar no tema claro por `[data-theme="light"]`, mantendo o escuro como padrão do arquivo
- [ ] 1.4 Conferir com JavaScript desligado: `data-theme` nulo tem de cair no escuro, que é o padrão
- [x] 1.5 Rodar o teste de tema e confirmar que a ordem continua falhando em segurança

## 2. As três páginas de módulo

- [x] 2.1 Rótulo de passo de `flow_diagram` (4,25:1) — a variável, não o componente
- [x] 2.2 Botão de sumário com `aria-pressed` (4,17:1)
- [x] 2.3 Atalho "Meta diária" do cabeçalho (4,14:1) — aparece em toda página da plataforma
- [x] 2.4 Remedir uma rota de módulo e descer o teto

## 3. As cinco páginas de listagem — 232 dos 308 nós

- [x] 3.1 `/glossario` (68): termo colorido por categoria; aplicar o utilitário no item de lista
- [x] 3.2 `/explorar` (61): rótulo de trilha por módulo
- [x] 3.3 `/simulados` (45): cor por certificação
- [x] 3.4 `/perguntas` (34): cor por tema
- [x] 3.5 `/temas` (24): cor por tema
- [ ] 3.6 Conferir que a cor continua carregando a varredura visual, e que existe rótulo textual da categoria ao lado — corrigir contraste apagando a cor destruiria a função da página

## 4. Fechar a porta para a dívida voltar

- [x] 4.1 Regra de lint: `style={{ color: X }}` com cor de identidade em elemento com texto reprova, apontando o utilitário
- [x] 4.2 Cobrir também `color: 'var(--ffv-border)'` em elemento com texto
- [ ] 4.3 Fazer a tabela de tetos ser conferida quando uma rota nova entra — hoje a lista é explícita e rota nova escapa da auditoria em silêncio
- [x] 4.4 Registrar no gate o procedimento de remedição: zerar os tetos, rodar a varredura, ler a contagem real na mensagem de falha — e que a medição é sobre o build

## 5. Medir e registrar

- [x] 5.1 Remedir as 22 rotas sobre o build e descer todos os tetos no mesmo commit
- [ ] 5.2 Atualizar `PENDENCIAS.md` e `frontend/CLAUDE.md` com o número final
- [ ] 5.3 Rodar a varredura completa e conferir as cinco páginas de listagem no navegador, nos dois temas
