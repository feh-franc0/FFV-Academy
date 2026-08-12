## ADDED Requirements

### Requirement: Texto sobre fundo acentuado tem contraste AA

Todo controle com fundo de cor de acento DEVE (MUST) usar a cor de texto legível do token
(`--primary-foreground`, o fundo escuro da marca), atingindo ao menos 4,5:1. Branco sobre
acento claro NÃO PODE (MUST NOT) ser usado.

#### Scenario: botão primário sobre acento
- **WHEN** um botão usa `var(--ffv-blue)`/`--ffv-red` de fundo
- **THEN** a cor do texto é `var(--primary-foreground)`, e o par passa no teste de contraste

#### Scenario: gate de contraste cobre o par
- **WHEN** um novo controle usa branco sobre acento
- **THEN** `paleta-contraste.test.ts` falha apontando o par

### Requirement: Existe um único botão primário e nenhum hex de tema à mão

O botão primário DEVE (MUST) vir de um componente único; cores de tema NÃO PODEM (MUST NOT) ser
escritas como hex literal em `style={{}}`.

#### Scenario: componente de botão único
- **WHEN** uma tela precisa de um botão primário
- **THEN** ela usa o `FfvButton`, não um `background` inline ad-hoc

#### Scenario: gate de hex literal
- **WHEN** alguém escreve um hex de cor de tema em `style={{}}` fora do `opengraph-image`
- **THEN** o lint reprova, pedindo o token

### Requirement: Modais prendem o foco e o devolvem ao fechar

Todo elemento com `role="dialog"`/`aria-modal` DEVE (MUST) conter o foco (Tab cíclico) enquanto
aberto e devolver o foco ao elemento de origem ao fechar.

#### Scenario: navegar por Tab dentro do modal
- **WHEN** um modal está aberto e o usuário navega por Tab
- **THEN** o foco permanece dentro do modal e não vaza para a página atrás

#### Scenario: fechar o modal
- **WHEN** o modal fecha
- **THEN** o foco volta ao controle que o abriu

### Requirement: Foco é sempre visível e alvos de toque têm 44px

Nenhum controle interativo PODE (MUST NOT) suprimir o indicador de foco, e todo alvo clicável
DEVE (MUST) ter ao menos 44px de altura.

#### Scenario: input com foco
- **WHEN** o usuário foca um input de e-mail ou a busca do glossário via teclado
- **THEN** um indicador de foco visível aparece (a regra global não é anulada por `outline:'none'` inline)

#### Scenario: controle pequeno no mobile
- **WHEN** um controle clicável é renderizado
- **THEN** sua área tocável tem ao menos 44×44px

### Requirement: Estrutura semântica correta em rótulos, headings e scroll

Todo input DEVE (MUST) ter nome acessível; a ordem de heading NÃO PODE (MUST NOT) colocar
títulos de rodapé antes do `h1`; contêineres de scroll horizontal DEVEM (MUST) ser focáveis
por teclado.

#### Scenario: textarea de comentário
- **WHEN** o `<textarea>` de comentários é renderizado
- **THEN** ele tem `aria-label` ou `<label htmlFor>`

#### Scenario: ordem de heading
- **WHEN** o HTML de uma rota é inspecionado após hidratação
- **THEN** o `h1` da página precede os rótulos de agrupamento do rodapé (que deixam de ser `h3`)

#### Scenario: tabela larga no mobile
- **WHEN** uma tabela de muitas colunas é vista no mobile
- **THEN** ela rola horizontalmente num contêiner com `tabIndex={0}` e `aria-label`, sem cortar conteúdo
