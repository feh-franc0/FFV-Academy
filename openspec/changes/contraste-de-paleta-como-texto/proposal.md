## Why

A dívida de contraste caiu de **479 para 308 nós** em 07/ago/2026, aplicando
`.ffv-acento-texto` onde ele faltava. `/mapa` foi de 82 para 2, `/aws-bedrock` de 39
para 3, `/ia` de 31 para 1. Isso resolveu **um** padrão: cor de trilha e de hub usada
como texto.

Sobra outro padrão, e ele é diferente em natureza. Não é cor de identidade aplicada como
texto — é **variável da própria paleta do sistema** ficando abaixo de 4,5:1 em tema
claro:

| Padrão | Contraste | Onde |
|---|---|---|
| Rótulo de passo de `flow_diagram` em `--ffv-blue` | **4,25:1** | todo módulo com `flow_diagram` |
| Botão de sumário com `aria-pressed` | **4,17:1** | todo módulo |
| Atalho "Meta diária" no cabeçalho | **4,14:1** | toda página |

Faltam 0,25 no primeiro caso. Não é um erro de aplicação de utilitário: é a definição da
variável no tema claro. Corrigir mexe nos dois temas e é decisão de paleta, o que é
justamente por que não foi feito junto com o resto.

E há a concentração por rota, que não é sistêmica e sim local:

| Rota | Nós | Natureza |
|---|---|---|
| `/glossario` | 68 | termo colorido por categoria, em lista longa |
| `/explorar` | 61 | rótulo de trilha por módulo, em lista longa |
| `/simulados` | 45 | cor por certificação |
| `/perguntas` | 34 | cor por tema |
| `/temas` | 24 | cor por tema |

As cinco somam 232 dos 308. São páginas de listagem, onde a cor é o que dá varredura
visual — trocar por cinza resolveria o contraste e destruiria a função.

## What Changes

**As variáveis de paleta usadas como texto são recalculadas para o tema claro**, com o
mesmo método que produziu o fator de 57% do `.ffv-acento-texto`: o menor ajuste que leva
todas a 4,5:1 contra `#ffffff` e `#f6f8fa`, preservando a aparência no tema escuro, que
é o padrão e o que roda sem JavaScript.

**As cinco páginas de listagem recebem o utilitário de acento** nos rótulos coloridos.
São 232 nós num punhado de componentes de item de lista.

**O teto por rota desce junto com cada correção**, no mesmo commit — deixá-lo alto depois
de consertar devolve o espaço para a dívida voltar sem ninguém notar.

**A regra de tema continua falhando em segurança:** o escuro é o padrão do arquivo, e o
claro é opt-in por `[data-theme="light"]`. A ordem inversa já derrubou o contraste de
7,49:1 para 2,87:1 com JavaScript desligado, e há teste travando isso.

### Non-goals

- **Não** trocar a paleta de identidade por cinza. A cor por categoria é o que dá
  varredura visual às páginas de listagem.
- **Não** exigir zero nós de contraste. O teto por rota existe porque exigir zero faria
  desligarem a checagem, e isso está registrado.

## Capabilities

### New Capabilities
- `acessibilidade-de-cor`: como a plataforma usa cor de identidade e variável de paleta
  como texto sem falhar WCAG AA em nenhum dos dois temas, e como a dívida é medida.

## Impact

- **CSS:** `globals.css`, definição das variáveis no tema claro.
- **Componentes:** itens de lista de `/glossario`, `/explorar`, `/simulados`,
  `/perguntas`, `/temas`; rótulo de passo de `flow_diagram`; botão de sumário.
- **Teste:** a tabela `TETO` em `e2e/todas-as-rotas.spec.ts` desce a cada correção.
- **Medição:** sempre sobre o **build**, nunca sobre `next dev` — os números diferem, e
  comparar dev contra build já fez sete rotas parecerem regressão sem nenhuma ter
  regredido.
