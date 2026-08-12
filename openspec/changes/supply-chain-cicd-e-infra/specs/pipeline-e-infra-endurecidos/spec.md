## ADDED Requirements

### Requirement: Actions e imagens de terceiros são pinadas de forma imutável

Toda GitHub Action de terceiro usada nos workflows, e toda imagem Docker base, DEVEM (MUST) ser referenciadas
por um identificador imutável (SHA de commit para actions, digest para imagens), não por tag mutável.

#### Scenario: action que recebe segredo de deploy
- **WHEN** um workflow usa `appleboy/ssh-action` com a chave SSH da VPS
- **THEN** a referência da action é um SHA de commit, não uma tag como `@v1.0.3`

### Requirement: Scan de segredos bloqueia o build

Um achado do scanner de segredos (gitleaks) no histórico do repositório DEVE (MUST) falhar o workflow de CI,
não apenas ser reportado.

#### Scenario: segredo commitado no histórico
- **WHEN** gitleaks encontra um padrão de segredo em qualquer commit do histórico
- **THEN** o workflow de segurança falha (não `continue-on-error`)

### Requirement: X-Forwarded-For é tratado de forma consistente entre vhosts

Todo vhost Nginx que faz proxy para uma aplicação Go DEVE (MUST) sobrescrever `X-Forwarded-For` com
`$remote_addr`, nunca anexar o valor enviado pelo cliente.

#### Scenario: XFF no vhost do frontend
- **WHEN** um cliente envia `X-Forwarded-For` forjado para o vhost do frontend
- **THEN** o Nginx sobrescreve o header com o IP real de conexão, igual ao vhost da API
