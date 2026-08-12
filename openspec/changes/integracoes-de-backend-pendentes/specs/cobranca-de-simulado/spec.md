## ADDED Requirements

### Requirement: Conteúdo educacional permanece sem paywall

A cobrança DEVE (MUST) alcançar somente o anel de simulados de certificação. Artigo, trilha,
quiz, badge, ranking e revisão espaçada NÃO DEVEM ficar atrás de pagamento.

É o diferencial declarado da plataforma, e um paywall em conteúdo o contradiria no
produto.

#### Scenario: tentativa de bloquear módulo
- **WHEN** uma implementação envolve rota de `/aprenda` em verificação de assinatura
- **THEN** é recusada

#### Scenario: simulado pago
- **WHEN** um simulado de certificação faz parte do anel pago
- **THEN** ele pode exigir pagamento, e a página diz isso antes de o usuário investir
  tempo

---

### Requirement: O preço e o que ele inclui aparecem antes do checkout

A tela DEVE (MUST) informar preço, o que está incluído e a política de reembolso **antes** de
levar ao provedor de pagamento.

#### Scenario: botão que leva direto ao provedor
- **WHEN** o `PaywallCard` envia ao Stripe sem exibir preço nem escopo
- **THEN** é recusado

---

### Requirement: A concessão de acesso vem do webhook, nunca do retorno do navegador

O acesso DEVE (MUST) ser concedido a partir do evento verificado do provedor no backend. Retorno
de navegador para uma URL de sucesso NÃO DEVE conceder acesso.

#### Scenario: usuário abre a URL de sucesso sem ter pagado
- **WHEN** alguém navega direto para a rota de sucesso
- **THEN** nenhum acesso é concedido

#### Scenario: webhook com assinatura inválida
- **WHEN** chega uma requisição no endpoint de webhook com assinatura que não confere
- **THEN** é rejeitada e registrada

#### Scenario: webhook duplicado
- **WHEN** o mesmo evento chega duas vezes
- **THEN** o processamento é idempotente e o usuário não é cobrado nem creditado em
  dobro

---

### Requirement: Nenhum segredo de pagamento no cliente

Chave secreta e segredo de webhook NÃO DEVEM (MUST NOT) existir no bundle do frontend nem em
variável exposta ao navegador.

#### Scenario: chave no bundle
- **WHEN** uma chave secreta aparece em variável com prefixo público
- **THEN** o CI falha

---

### Requirement: O usuário consegue ver e encerrar o que contratou

DEVE (MUST) existir caminho para o usuário ver o que contratou e encerrar, sem abrir suporte.

#### Scenario: usuário quer cancelar
- **WHEN** o usuário procura encerrar a assinatura
- **THEN** existe caminho na própria interface
