## ADDED Requirements

### Requirement: Cor de identidade como texto passa pelo utilitário de acento

Cor de trilha, de hub, de tema ou de nível usada como cor de **texto** DEVE (MUST) passar pelo
utilitário `.ffv-acento-texto`, com a cor entregue na variável `--ffv-acento`. Escrever
`style={{ color: cor }}` direto em elemento com texto é falha.

A razão é medida: as paletas vêm da linhagem GitHub **dark** e 41 das 43 cores ficam
entre 1,57:1 e 4,35:1 como texto sobre fundo claro.

#### Scenario: cor de trilha aplicada direto
- **WHEN** um componente novo escreve `style={{ color: trail.color }}` num elemento com
  texto
- **THEN** o lint falha, apontando o utilitário

#### Scenario: cor de identidade em borda ou fundo
- **WHEN** a cor é usada em `border`, `background` ou gradiente
- **THEN** é permitida sem o utilitário: a regra vale para texto, onde WCAG se aplica

---

### Requirement: Variável de paleta usada como texto atinge 4,5:1 nos dois temas

Toda variável CSS que sirva de cor de texto DEVE (MUST) atingir contraste mínimo de 4,5:1
contra os fundos de ambos os temas — `#0d1117` no escuro, `#ffffff` e `#f6f8fa` no
claro.

#### Scenario: variável a 4,25:1 no tema claro
- **WHEN** `--ffv-blue` é usada como cor de texto e mede 4,25:1 sobre branco
- **THEN** a definição da variável no tema claro é ajustada, e não o componente — o
  problema é da paleta, não do uso

#### Scenario: ajuste que quebra o tema escuro
- **WHEN** um ajuste eleva o contraste no claro e reduz abaixo de 4,5:1 no escuro
- **THEN** o ajuste é recusado: os dois temas são requisito, não um deles

---

### Requirement: O tema escuro é o padrão, e o claro é opt-in

A definição padrão de toda variável de cor DEVE (MUST) ser a do tema **escuro**, e o tema claro
DEVE ser aplicado por `[data-theme="light"]` explícito.

A ordem inversa é falha de segurança, não de estilo: `data-theme` só existe depois do
script de tema, que precisa de JavaScript. Medido com JS desligado na primeira versão do
utilitário de acento: `data-theme` nulo, fundo escuro, acento escurecido, contraste de
7,49:1 para **2,87:1**.

#### Scenario: escurecimento como padrão
- **WHEN** uma regra escurece por padrão e restaura em `[data-theme="dark"]`
- **THEN** o teste de tema falha, porque sem JavaScript o resultado é texto escuro sobre
  fundo escuro

---

### Requirement: Teto de contraste por rota, medido sobre o build

O CI DEVE (MUST) declarar um teto de nós com violação `color-contrast` por rota e falhar acima
dele. O teto DEVE ser medido sobre o **build de produção**, que é a condição em que a
varredura roda.

O teto DEVE descer no mesmo commit que reduz a dívida. Deixá-lo alto depois de corrigir
devolve o espaço para a dívida voltar sem sintoma.

#### Scenario: rota nova sem teto declarado
- **WHEN** uma rota é criada e não é acrescentada à tabela de tetos
- **THEN** ela escapa da auditoria — por isso a tabela DEVE ser revisada quando uma rota
  entra, e o gate imprime quantas rotas audita

#### Scenario: teto medido no dev
- **WHEN** alguém remede os tetos rodando `next dev`
- **THEN** os números divergem do build e rotas parecem regredir sem ter regredido; o
  procedimento correto é zerar os tetos e ler a contagem real na falha da varredura

#### Scenario: dívida reduzida sem descer o teto
- **WHEN** uma correção leva `/mapa` de 82 para 2 nós e o teto permanece em 82
- **THEN** a revisão recusa: a correção e a descida do teto são o mesmo commit

---

### Requirement: Violação estrutural de acessibilidade nunca tem teto

Violação grave ou crítica do axe que **não** seja `color-contrast` DEVE (MUST) reprovar sempre.
Não existe teto para violação estrutural.

#### Scenario: contêiner de rolagem sem foco
- **WHEN** um elemento com `overflow-x-auto` que de fato rola não tem `tabIndex`
- **THEN** `scrollable-region-focusable` reprova a varredura, sem teto

---

### Requirement: Cor não é o único portador de informação em página de listagem

Em página de listagem, a cor por categoria DEVE (MUST) ser acompanhada de rótulo em texto.
Corrigir contraste trocando cor por cinza é recusado: a cor é o que dá varredura visual.

#### Scenario: categoria só por cor
- **WHEN** um item de lista distingue categoria apenas pela cor do texto
- **THEN** acrescenta-se o rótulo textual da categoria, e a cor passa pelo utilitário
