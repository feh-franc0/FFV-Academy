import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dotfiles-managed');

const accent = '#F59E0B';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o problema central que ferramentas como chezmoi, GNU Stow e yadm resolvem?',
    options: [
      'Acelerar a inicialização do shell',
      'Versionar, sincronizar e aplicar dotfiles (.zshrc, .gitconfig, .config/nvim/*) entre múltiplas máquinas mantendo cada arquivo no path correto (~/.zshrc, ~/.config/nvim/init.lua) — sem copiar manualmente, sem virar mantenedor de scripts bash, e idealmente com suporte a diferenças por host/OS, secrets e templates',
      'Compilar shell scripts para binários nativos',
      'Substituir o homebrew',
    ],
    correct: 1,
    explanation: 'Dotfile managers resolvem o problema de "como manter meus arquivos de config em git versionados, sincronizados entre Mac de casa, Mac do trabalho e Linux dev, com pequenas diferenças por host, secrets que não devem ir pro repo público, e bootstrap em 1 comando numa máquina nova". As três soluções principais (chezmoi, GNU Stow, yadm) abordam o problema com filosofias diferentes mas o objetivo é o mesmo: dotfiles versionados como código, sem rodar scripts customizados frágeis.',
  },
  {
    question: 'Qual é a diferença fundamental entre o approach do chezmoi e do GNU Stow?',
    options: [
      'Não há diferença — ambos fazem o mesmo',
      'GNU Stow usa SYMLINKS — você mantém ~/.dotfiles/zsh/.zshrc no repo, stow cria symlink ~/.zshrc → ~/.dotfiles/zsh/.zshrc; simples, transparente, sem features extras. chezmoi NÃO usa symlinks por default — mantém source state em ~/.local/share/chezmoi/ e RENDERIZA arquivos para ~/ via templates Go (suporta condicionais por OS/host, secrets via Bitwarden/1Password/age, encryption, run scripts on apply); mais complexo mas resolve problemas que Stow não resolve',
      'chezmoi é só para Linux e Stow só para macOS',
      'chezmoi é GUI e Stow é CLI',
    ],
    correct: 1,
    explanation: 'Diferença filosófica: GNU Stow (gnu.org/software/stow, escrito em Perl, ~30 anos de existência) é symlink farm — você organiza dotfiles por "package" (~/.dotfiles/zsh/, ~/.dotfiles/nvim/) e stow cria symlinks para $HOME respeitando a estrutura. Simples como "ln -s". Não suporta templates, secrets, diferenças por host — você lida com tudo via branches git ou scripts. chezmoi (chezmoi.io, escrito em Go, Tom Payne) é renderizador: source state em ~/.local/share/chezmoi/ tem arquivos que podem ser templates (.tmpl) com Go template syntax, condicionais por OS/host, secrets puxados runtime de 1Password/Bitwarden/Vault/age; chezmoi apply renderiza pra $HOME. Mais setup, mas resolve heterogeneidade entre máquinas.',
  },
  {
    question: 'O que torna o yadm interessante e quando preferir sobre chezmoi/Stow?',
    options: [
      'yadm é GUI cross-platform',
      'yadm (Yet Another Dotfiles Manager, yadm.io, shell script wrapping git) usa o $HOME diretamente como working tree git — não tem source state separado, não cria symlinks; git status mostra alterações em ~/, git commit comita; suporta alt files por classe (Linux/Darwin, hostname), encryption via gpg, hooks pre/post; ideal pra quem já é fluente em git e quer "git no $HOME sem ferramentas extras"',
      'yadm é fork do chezmoi',
      'yadm não é mais mantido',
    ],
    correct: 1,
    explanation: 'yadm (Tim Byrne, github.com/TheLocehiliosan/yadm) é um shell script wrapper sobre git que faz $HOME ser working tree do repositório dotfiles, sem mexer com symlinks ou source state. Comandos: yadm init, yadm add ~/.zshrc, yadm commit, yadm push. Diferenciais: (1) "alt files" (~/.zshrc##os.Linux, ~/.gitconfig##class.work, ~/.aws/credentials##hostname.macbook-pro) escolhidos automaticamente por OS/class/hostname; (2) encryption via gpg embutida pra secrets; (3) hooks pre/post pra cada comando; (4) bootstrap script. Para sêniors fluentes em git que querem simplicidade sem virtualização de paths, yadm é o sweet spot.',
  },
  {
    question: 'Em chezmoi, qual é o approach idiomático para gerenciar SECRETS (API keys, tokens) que não podem ir pro repositório git?',
    options: [
      'Commitar os secrets criptografados com chave global do time',
      'chezmoi integra com password managers — você escreve no template {{ (bitwarden "item" "github-token").login.password }} ou {{ (onepasswordRead "op://vault/item/field") }} ou usa age encryption com chave local; na hora de chezmoi apply, ele puxa o secret runtime do 1Password/Bitwarden/Vault/age, renderiza o arquivo final em ~/, e NUNCA persiste o secret em git ou na source state',
      'Você deve manter secrets fora do dotfiles manager — sempre manualmente',
      'chezmoi não suporta secrets',
    ],
    correct: 1,
    explanation: 'chezmoi tem first-class secret management. Você define templates em arquivos .tmpl: {{ (bitwarden "item" "github").login.password }}, {{ onepasswordRead "op://vault/item/section/field" }}, {{ vault "secret/data/github" }}, ou usa age encryption (chezmoi encrypt/decrypt). Na hora do chezmoi apply, integra com o CLI do password manager (bw, op, vault), puxa o segredo runtime, renderiza ~/.netrc / ~/.aws/credentials final, e o secret nunca toca o git. Bonus: chezmoi auto-detecta password manager configurado em ~/.config/chezmoi/chezmoi.toml. Esse é o feature killer do chezmoi vs Stow/yadm pra times sêniors.',
  },
  {
    question: 'Você está numa máquina nova (Mac fresh), quer aplicar todos os dotfiles em 1 comando. Como ficaria com chezmoi?',
    options: [
      'Não é possível — precisa setup manual de cada arquivo',
      'curl -sfL get.chezmoi.io | sh -s -- init --apply seu-usuario/dotfiles — o oneliner instala chezmoi, clona o repo do GitHub, executa chezmoi apply renderizando todos os templates para $HOME, e roda scripts run_once_ marcados (instalar brew, instalar pacotes, configurar Touch ID sudo); em ~10 minutos a máquina está com sua config completa',
      'Você precisa instalar manualmente cada arquivo via cp',
      'É preciso ter macOS Server licenciado',
    ],
    correct: 1,
    explanation: 'Bootstrap one-liner é o killer feature de chezmoi: curl -sfL https://get.chezmoi.io | sh -s -- init --apply username/dotfiles. Isso: (1) baixa e instala chezmoi; (2) clona seu repo dotfiles (público no GitHub funciona, privado pede SSH key); (3) chezmoi init lê .chezmoi.toml.tmpl e prompta variáveis necessárias (nome, email, classe); (4) chezmoi apply renderiza tudo. Scripts marcados run_once_install-brew.sh.tmpl rodam UMA vez na primeira aplicação — você bootstraps brew, instala pacotes, configura sudo TouchID, instala fonts, tudo declarativo. Em 10min uma máquina nova vira sua máquina dev pronta. yadm tem bootstrap similar via $HOME/.config/yadm/bootstrap script.',
  },
  {
    question: 'Para o time/empresa, qual é a melhor escolha de dotfiles manager em 2026?',
    options: [
      'Forçar Stow — todo mundo precisa entender symlinks',
      'Não existe "melhor" absoluto; padrão pragmático sênior 2026: chezmoi pra quem tem heterogeneidade de máquinas (Mac casa + Mac work + Linux dev + WSL), secrets a gerenciar e templates por OS; Stow pra quem tem 1-2 máquinas idênticas e prefere simplicidade transparente (sabe exatamente onde cada symlink aponta); yadm pra quem é git-native e quer commit direto no $HOME sem virtualização',
      'Todos devem usar yadm sem exceção',
      'Cada dev escolhe o seu, mas o time deve padronizar UM',
    ],
    correct: 1,
    explanation: 'Não é uma escolha de "melhor" técnico — é trade-off de complexidade vs features. chezmoi: máxima funcionalidade (templates, secrets, multi-OS, scripts), curva de aprendizado real, source state separado pode confundir; bom pra sênior com 3+ máquinas heterogêneas. Stow: simplicidade radical (symlinks visíveis no FS, debuggable com ls -la), zero magia, sem secrets nem templates; bom pra 1-2 máquinas iguais ou pra quem já automatiza secrets fora do dotfiles. yadm: $HOME como working tree git, comandos git diretos, alt files cobrem 80% dos casos de heterogeneidade; sweet spot pra git-natives que querem mínimo de abstração nova. Estima 2026: chezmoi ~50%, yadm ~25%, Stow ~20% entre sêniors. Time não precisa padronizar — desde que cada um saiba aplicar a sua config.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dotfiles-managed"
      title="Dotfiles managed: chezmoi, GNU Stow, yadm — versionando sua máquina como código"
      icon="📁"
      xp={55}
      readTime={11}
      trailName="DevTools & Productivity Sênior"
      trailColor={accent}
      nextSlug="terminal-multiplex-zellij-tmux"
      nextTitle="Terminal multiplex: tmux clássico vs Zellij moderno"
      quiz={quiz}
    >
      <Section title="Por que dotfiles managed em 2026" accent={accent}>
        <p>
          Você passa anos refinando <InlineCode>.zshrc</InlineCode>, configurações
          Neovim, aliases git, scripts em <InlineCode>~/bin</InlineCode>. Aí compra um Mac
          novo, ou troca de emprego, ou precisa configurar um Linux dev — e perde 2-3
          dias reconstruindo manualmente. Dotfiles managers resolvem isso: seus arquivos
          de config viram repositório git versionado, com bootstrap em um comando,
          diferenças por host/OS resolvidas declarativamente, e secrets gerenciados sem
          vazar pro repo público.
        </p>
        <Callout tone="info" icon="📁">
          &quot;Dotfiles&quot; são os arquivos que começam com ponto no <InlineCode>$HOME</InlineCode>:{' '}
          <InlineCode>.zshrc</InlineCode>, <InlineCode>.gitconfig</InlineCode>,{' '}
          <InlineCode>.ssh/config</InlineCode>, <InlineCode>.config/nvim/</InlineCode>,
          etc. A convenção surgiu no Unix: ferramentas como <InlineCode>ls</InlineCode>{' '}
          escondem por padrão arquivos com ponto, então usar &quot;.&quot; virou
          equivalente a &quot;config invisível&quot;.
        </Callout>
        <p>
          Em 2026, há três ferramentas dominantes: <strong>chezmoi</strong> (Go, full
          featured, templates+secrets), <strong>GNU Stow</strong> (Perl, símbólico,
          minimalista) e <strong>yadm</strong> (shell+git, pragmático). Vamos comparar e
          mostrar quando cada uma faz sentido.
        </p>
      </Section>

      <Section title="GNU Stow: simplicidade radical por symlinks" accent={accent}>
        <p>
          Stow (<InlineCode>gnu.org/software/stow</InlineCode>) existe desde 1996 — escrito
          em Perl, criado originalmente para gerenciar instalações de software local
          (compilar em <InlineCode>/usr/local/stow/foo-1.0/</InlineCode> e symlinkar para{' '}
          <InlineCode>/usr/local/bin</InlineCode>). Dotfile community adotou pra organizar
          configs.
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Como Stow funciona"
          steps={[
            { label: 'Organize por package', desc: '~/.dotfiles/zsh/.zshrc, ~/.dotfiles/nvim/.config/nvim/init.lua, ~/.dotfiles/git/.gitconfig' },
            { label: 'Stow do dir pai', desc: 'cd ~/.dotfiles && stow zsh nvim git — cria symlinks ~/.zshrc → ~/.dotfiles/zsh/.zshrc, etc' },
            { label: 'Versiona', desc: 'git add . && git commit && git push — push pra GitHub privado/público' },
            { label: 'Máquina nova', desc: 'git clone seu/dotfiles ~/.dotfiles && cd ~/.dotfiles && stow zsh nvim git — pronto' },
            { label: 'Edita normalmente', desc: 'vim ~/.zshrc edita o arquivo no repo via symlink — git status detecta mudança' },
          ]}
        />
        <CodeBlock lang="bash">{`# Estrutura típica
~/.dotfiles/
├── zsh/
│   └── .zshrc                    # symlink target: ~/.zshrc
├── nvim/
│   └── .config/
│       └── nvim/
│           └── init.lua          # symlink target: ~/.config/nvim/init.lua
├── git/
│   └── .gitconfig                # symlink target: ~/.gitconfig
└── tmux/
    └── .tmux.conf                # symlink target: ~/.tmux.conf

# Aplicar
cd ~/.dotfiles
stow zsh nvim git tmux            # cria todos os symlinks

# Listar o que vai mudar antes (dry-run)
stow -n -v zsh

# Remover symlinks de um package
stow -D zsh`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Stow é <strong>transparente</strong>: <InlineCode>ls -la ~/.zshrc</InlineCode>{' '}
          mostra o symlink, você sabe exatamente para onde aponta, debug é trivial. Sem
          magia, sem templates, sem state escondido. Trade-off: zero suporte a diferenças
          por host (você gerencia via branches git) e zero secrets management.
        </Callout>
      </Section>

      <Section title="chezmoi: full featured (templates, secrets, multi-OS)" accent={accent}>
        <p>
          chezmoi (<InlineCode>chezmoi.io</InlineCode>, Tom Payne, escrito em Go) é a
          ferramenta mais poderosa em 2026. Resolve heterogeneidade entre máquinas,
          secrets management, bootstrap one-command, e scripts declarativos
          run_once/run_onchange.
        </p>
        <StackFlow
          accent={accent}
          title="Modelo do chezmoi"
          items={[
            'Source state — ~/.local/share/chezmoi/ — repositório git com arquivos brutos, templates (.tmpl), encrypted (.age), scripts (run_once_*.sh.tmpl)',
            'Config state — ~/.config/chezmoi/chezmoi.toml — variáveis (name, email, class, hostname overrides), password manager config',
            'Target state — O que vai aparecer em $HOME — renderizado dinamicamente a partir do source + config + secrets externos',
            'Destination — $HOME real — chezmoi apply renderiza, chezmoi diff mostra delta, chezmoi update pull + apply',
          ]}
        />
        <CodeBlock lang="bash">{`# Setup inicial
brew install chezmoi
chezmoi init                            # cria ~/.local/share/chezmoi/ vazio

# Adicionar arquivo existente ao tracking
chezmoi add ~/.zshrc                    # copia ~/.zshrc para source state como dot_zshrc

# Editar pelo chezmoi (abre $EDITOR no source, não no target)
chezmoi edit ~/.zshrc

# Ver o que mudará no $HOME
chezmoi diff

# Aplicar
chezmoi apply

# Inicializar de repo remoto (máquina nova!)
chezmoi init --apply username/dotfiles

# Bootstrap one-liner (máquina sem chezmoi instalado)
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply username/dotfiles`}</CodeBlock>
        <p>
          Templates são o killer feature. Um arquivo <InlineCode>dot_gitconfig.tmpl</InlineCode>{' '}
          no source vira <InlineCode>~/.gitconfig</InlineCode> renderizado conforme contexto:
        </p>
        <CodeBlock lang="text">{`# ~/.local/share/chezmoi/dot_gitconfig.tmpl
[user]
    name = {{ .name }}
    email = {{ if eq .class "work" }}{{ .work_email }}{{ else }}{{ .personal_email }}{{ end }}
    signingkey = {{ .gpg_signingkey }}

[commit]
{{- if eq .chezmoi.os "darwin" }}
    gpgsign = true
{{- else }}
    gpgsign = false
{{- end }}

[github]
    token = {{ (bitwarden "item" "github-personal").login.password }}`}</CodeBlock>
        <Callout tone="warn" icon="🔐">
          Secrets via password manager: o token github acima é puxado{' '}
          <em>runtime</em> da sua Bitwarden vault (chezmoi chama <InlineCode>bw</InlineCode>{' '}
          CLI). Nunca vai pro git. Suporta também 1Password, Vault, KeePassXC, age, gpg.
        </Callout>
      </Section>

      <Section title="yadm: $HOME como working tree git" accent={accent}>
        <p>
          yadm (<InlineCode>yadm.io</InlineCode>, Tim Byrne) é uma terceira via: shell
          script wrapper sobre git que faz <InlineCode>$HOME</InlineCode> ser working tree
          do repositório dotfiles diretamente — sem source state separado, sem symlinks.
        </p>
        <CodeBlock lang="bash">{`# Instalar
brew install yadm

# Iniciar (cria ~/.local/share/yadm/repo.git)
yadm init

# Adicionar arquivos
yadm add ~/.zshrc ~/.gitconfig ~/.config/nvim/init.lua
yadm commit -m "initial dotfiles"

# Conectar a remote
yadm remote add origin git@github.com:user/dotfiles.git
yadm push -u origin main

# Status, log, diff — exatamente git
yadm status
yadm log --oneline
yadm diff

# Em máquina nova
yadm clone git@github.com:user/dotfiles.git    # popula direto no $HOME`}</CodeBlock>
        <p>
          A killer feature do yadm são <strong>alt files</strong> — convenção de
          nomenclatura que escolhe automaticamente o arquivo certo por OS, classe ou
          hostname:
        </p>
        <CodeBlock lang="text">{`# Você mantém variantes do mesmo arquivo
~/.gitconfig                            # default
~/.gitconfig##os.Darwin                 # usado em macOS
~/.gitconfig##os.Linux                  # usado em Linux
~/.gitconfig##class.work                # usado se yadm class = work
~/.gitconfig##hostname.macbook-fernando # usado nesse hostname específico

# yadm alt seleciona automaticamente conforme contexto:
yadm alt

# Config de classe
yadm config local.class work`}</CodeBlock>
        <Callout tone="success" icon="🐍">
          yadm tem encryption embutida (via gpg): você marca arquivos com{' '}
          <InlineCode>.config/yadm/encrypt</InlineCode>, roda <InlineCode>yadm encrypt</InlineCode>,
          e os files viram <InlineCode>files.gpg</InlineCode> no repo. Mais simples que
          chezmoi+age, menos versátil que chezmoi+1Password.
        </Callout>
      </Section>

      <Section title="Comparação direta: chezmoi vs Stow vs yadm" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'chezmoi', 'GNU Stow', 'yadm']}
          rows={[
            ['Mecanismo', 'Renderiza source → target', 'Cria symlinks', '$HOME é git working tree'],
            ['Linguagem implementação', 'Go (binário único)', 'Perl', 'Shell script + git'],
            ['Templates por host/OS', 'Sim (Go templates ricos)', 'Não (via branches)', 'Sim (alt files por sufixo)'],
            ['Secrets', '1Password, Bitwarden, Vault, age, gpg', 'Não', 'gpg embutido'],
            ['Bootstrap one-liner', 'Sim (curl get.chezmoi.io)', 'Não nativo', 'Sim (yadm bootstrap script)'],
            ['Scripts run_once / run_onchange', 'Sim', 'Não', 'Hooks pre/post comando'],
            ['Curva de aprendizado', 'Médio-alta (templates, source state)', 'Baixíssima', 'Baixa (git-fluentes)'],
            ['Debug', 'chezmoi doctor, diff, verify', 'ls -la symlinks (trivial)', 'git commands diretos'],
            ['Footprint', '~30MB Go binary', '~1MB Perl deps', '~50KB shell scripts'],
            ['Cross-platform', 'macOS, Linux, Windows, WSL', 'Unix-like', 'macOS, Linux, WSL'],
          ]}
        />
      </Section>

      <Section title="Decisão: qual escolher" accent={accent}>
        <DecisionBox
          scenario="Você é sênior com 3+ máquinas heterogêneas (Mac casa, Mac work, Linux dev/server), API keys/tokens espalhados, quer bootstrap em 10min em máquina nova"
          winner="chezmoi"
          winnerColor={accent}
          why="Templates resolvem heterogeneidade (work email no Mac work, personal no de casa), secrets via 1Password/Bitwarden evitam vazar tokens no git, run_once_install-brew.sh.tmpl bootstrapa toda a máquina, e curl get.chezmoi.io | sh é o killer feature."
          alternatives={[
            { name: 'GNU Stow', when: 'Tem 1-2 máquinas idênticas, gerencia secrets fora dotfiles (1Password manual), prefere ver symlinks transparentes' },
            { name: 'yadm', when: 'É git-native, quer mínima abstração, alt files cobrem 80% das diferenças por host, gpg cobre seus secrets' },
          ]}
        />
      </Section>

      <Section title="Repositórios públicos de dotfiles para estudo" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'twpayne/dotfiles', v: 'Tom Payne, criador do chezmoi — referência absoluta de uso idiomático' },
            { k: 'felipec/dotfiles', v: 'Felipe Contreras (contributor de Git, autor do git-cinnabar) — Stow + scripts minimalistas' },
            { k: 'mathiasbynens/dotfiles', v: 'Mathias Bynens (Google V8) — clássico macOS-centric, defaults write para tudo' },
            { k: 'holman/dotfiles', v: 'Zach Holman (ex-GitHub) — autodocumentado, popularizou estrutura "topics/"' },
            { k: 'thoughtbot/dotfiles', v: 'Thoughtbot (consultoria Ruby) — production-grade compartilhado entre time' },
            { k: 'cyrus-and/dotfiles', v: 'Reference moderna com chezmoi 2024+, secrets via age, scripts declarativos' },
          ]}
        />
        <Callout tone="info" icon="📚">
          Boa prática: estude 2-3 repos públicos, faça fork do que mais ressoa, e
          customize gradualmente. Não copie inteiro sem entender — config alheia tem
          decisões contextuais que não se aplicam à sua máquina.
        </Callout>
      </Section>

      <Section title="Bootstrap one-liner: do zero a produtivo em 10min" accent={accent}>
        <CodeBlock lang="bash">{`# Máquina nova, macOS fresh — o ritual completo
# 1. Instalar Command Line Tools
xcode-select --install

# 2. Bootstrap chezmoi + clonar dotfiles + aplicar
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply fernando-feh/dotfiles

# Que isso faz:
# - Baixa chezmoi binary
# - Clona github.com/fernando-feh/dotfiles em ~/.local/share/chezmoi/
# - Pergunta variáveis (nome, email, classe: personal/work) via chezmoi.toml.tmpl
# - Renderiza ~/.zshrc, ~/.gitconfig, ~/.config/nvim/, etc
# - Executa scripts run_once_install-brew.sh.tmpl, run_once_install-packages.sh.tmpl
#   (instala Homebrew, brew bundle install, fish/zsh plugins, fonts, etc)
# - Configura Touch ID pra sudo, defaults write pra preferências macOS
# - Em ~10min você tem ambiente completo

# 3. Reload shell
exec zsh

# 4. Verificar
chezmoi doctor`}</CodeBlock>
      </Section>

      <Section title="FAQ rápido" accent={accent}>
        <QAItem
          q="Posso migrar de Stow pra chezmoi mais tarde?"
          a="Sim. chezmoi import e chezmoi add fazem trabalho de pegar arquivos atuais (incluindo symlinks Stow) e trazer pra source state. Reverso também é viável."
        />
        <QAItem
          q="E secrets no repositório público?"
          a="NUNCA commite plaintext. chezmoi: use age encryption ou password manager. yadm: use yadm encrypt + gpg. Stow: mantenha secrets fora do repo (1Password manual)."
        />
        <QAItem
          q="Como lidar com config de aplicações que mudam arquivo automaticamente (VSCode settings, navegador)?"
          a="Truque comum: dotfiles manager gerencia ARQUIVO inicial; depois da primeira aplicação, atualiza source rodando chezmoi re-add periodicamente, ou aceita drift e re-aplica manualmente."
        />
        <QAItem
          q="Funciona em Windows?"
          a="chezmoi sim, full support. WSL também. yadm e Stow funcionam em WSL mas não em PowerShell nativo."
        />
        <QAItem
          q="E se eu tiver 1 arquivo de 50 linhas só pra config de cor do shell — vale dotfile manager?"
          a="Vale. Custo é baixo (5min setup), benefício compõe com tempo. Você adiciona ~/.gitconfig depois, ~/.ssh/config, etc — e em 6 meses tem 30 arquivos versionados."
        />
      </Section>

      <Callout tone="success" icon="🎯">
        <strong>Próximo passo</strong>: escolha uma ferramenta (recomendo chezmoi pra
        quem está começando do zero hoje), crie repo dotfiles privado no GitHub, adicione
        seus 3-5 arquivos principais (<InlineCode>.zshrc</InlineCode>,{' '}
        <InlineCode>.gitconfig</InlineCode>, <InlineCode>.config/nvim/</InlineCode>) e
        commite. No próximo módulo: terminal multiplex — tmux clássico vs Zellij moderno.
      </Callout>
    </ModuleLayout>
  );
}
