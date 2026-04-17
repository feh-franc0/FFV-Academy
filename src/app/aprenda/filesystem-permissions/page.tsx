import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata: Metadata = {
  title: 'Filesystem e permissões: rwx, chown, symlink, hardlink — FFV Academy',
  description: 'Como o Linux organiza arquivos, o que significa rwxr-xr-x, chmod, chown, symlinks vs hardlinks — e por que isso quebra deploys.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Um arquivo tem permissão `-rwxr-x---`. Quem pode executá-lo?',
    options: [
      'Qualquer usuário do sistema',
      'O dono do arquivo e membros do grupo. Outros usuários não têm nenhuma permissão (---). O dono tem rwx (leitura+escrita+execução), o grupo tem r-x (leitura+execução).',
      'Somente o dono do arquivo',
      'Somente o root',
    ],
    correct: 1,
    explanation: 'Permissões Linux têm 3 grupos de 3 bits: dono (rwx), grupo (r-x), outros (---). O primeiro caractere indica o tipo (- = arquivo regular, d = diretório, l = link). Neste caso: dono pode ler/escrever/executar, membros do grupo podem ler/executar, outros não têm acesso nenhum.',
  },
  {
    question: 'Qual a diferença entre symlink e hardlink?',
    options: [
      'São a mesma coisa — apenas nomes diferentes',
      'Symlink (ln -s) é um arquivo especial que aponta para um caminho — se o original for deletado, o link quebra. Hardlink (ln) aponta para o mesmo inode — ambos são "o arquivo", e deletar um não afeta o outro',
      'Hardlinks só funcionam para diretórios',
      'Symlinks são mais rápidos porque não copiam dados',
    ],
    correct: 1,
    explanation: 'Um inode é a estrutura do filesystem que contém os dados do arquivo. Hardlinks são múltiplos nomes no filesystem para o mesmo inode — o arquivo só é apagado quando o contador de links chega a zero. Symlinks são arquivos especiais cujo conteúdo é um caminho — podem apontar para diretórios e para outros filesystems, mas quebram se o destino some.',
  },
  {
    question: 'Por que `chmod 777 -R /var/www/html` é uma péssima ideia em produção?',
    options: [
      'Porque o comando está com a flag errada',
      'Porque 777 dá read+write+execute para TODOS os usuários (dono, grupo, outros) recursivamente — qualquer processo comprometido no sistema pode ler, modificar ou executar qualquer arquivo do site, incluindo configs com senhas',
      'Porque chmod não funciona recursivamente',
      'Porque 777 não existe como permissão válida',
    ],
    correct: 1,
    explanation: 'Princípio do menor privilégio: dar apenas as permissões necessárias. Web apps geralmente precisam: arquivos lidos pelo servidor (644 = rw-r--r--), executáveis (755 = rwxr-xr-x), sem write para others. 777 é um sinal de alerta imediato em qualquer auditoria de segurança.',
  },
];

export default function FilesystemPermissionsPage() {
  return (
    <ModuleLayout
      slug="filesystem-permissions"
      title="Filesystem e permissões: rwx, chown, symlink, hardlink"
      icon="📁"
      xp={45}
      readTime={9}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="processos-jobs-sinais"
      nextTitle="Processos, jobs, sinais: como o SO organiza execução"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Permissões quebradas causam mais incidentes de segurança e deploy do que quase qualquer outro erro de configuração. Entender rwx, inodes, e a diferença entre symlinks e hardlinks não é opcional — é o básico do básico.
      </p>

      <Section accent={accent} title="Inodes: o que é um arquivo de verdade">
        <p>
          No Linux, um "arquivo" é na verdade duas coisas separadas: o <strong>inode</strong> (que contém metadados: permissões, dono, tamanho, timestamps, ponteiros para blocos de dados) e a <strong>entrada de diretório</strong> (que mapeia um nome para um número de inode).
        </p>
        <CodeBlock>{`# Ver o inode de um arquivo
ls -i arquivo.txt      # mostra número do inode
stat arquivo.txt       # metadados completos do inode

# Exemplo de stat output:
#   File: arquivo.txt
#   Size: 1234          Blocks: 8       IO Block: 4096
# Inode: 393217         Links: 1
# Access: -rw-r--r--    Uid: 1000 / fernando   Gid: 1000 / fernando
# Access: 2025-01-15 10:23:45
# Modify: 2025-01-14 09:11:22
# Change: 2025-01-14 09:11:22  ← mtime vs ctime: importante para backups`}</CodeBlock>
        <p>
          O diretório é apenas uma tabela: nome → número de inode. Por isso você pode ter múltiplos nomes apontando para o mesmo inode (hardlinks), e por isso renomear um arquivo no mesmo filesystem é instantâneo (só muda a entrada na tabela de diretório, não move dados).
        </p>
      </Section>

      <Section accent={accent} title="Permissões: lendo rwxr-xr-x">
        <p>
          A saída de <code>ls -l</code> mostra algo como: <code>-rwxr-xr-x 1 fernando devs 4096 jan 15 script.sh</code>
        </p>
        <CodeBlock>{`-  rwx  r-x  r-x   1  fernando devs  4096  jan 15  script.sh
│   │    │    │    │     │      │      │       │        │
│   │    │    │    │     │      │      │       │        └─ nome
│   │    │    │    │     │      │      │       └─ data modificação
│   │    │    │    │     │      │      └─ tamanho (bytes)
│   │    │    │    │     │      └─ grupo
│   │    │    │    │     └─ dono
│   │    │    │    └─ número de hardlinks
│   │    │    └─ permissões de outros (others)
│   │    └─ permissões do grupo
│   └─ permissões do dono (user)
└─ tipo: - arquivo, d diretório, l symlink, p pipe, s socket`}</CodeBlock>
        <p>
          Cada grupo de 3 letras significa: <strong>r</strong> (read=4), <strong>w</strong> (write=2), <strong>x</strong> (execute=1). <code>-</code> significa ausência. A notação octal soma os valores:
        </p>
        <ComparisonTable
          headers={['Octal', 'Simbólico', 'Significado']}
          rows={[
            ['7', 'rwx', 'leitura + escrita + execução'],
            ['6', 'rw-', 'leitura + escrita'],
            ['5', 'r-x', 'leitura + execução'],
            ['4', 'r--', 'somente leitura'],
            ['0', '---', 'nenhuma permissão'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Permissões mais comuns em produção
chmod 644 arquivo.html    # rw-r--r--: servidor lê, outros lêem, só dono escreve
chmod 755 script.sh       # rwxr-xr-x: executável por todos, escrita só dono
chmod 600 .env            # rw-------: só o dono lê/escreve (chaves privadas)
chmod 700 ~/.ssh          # rwx------: só dono acessa o diretório ~/.ssh
chmod 400 chave.pem       # r--------: SSH key — só leitura pelo dono

# Modificações relativas (sem precisar saber o octal atual)
chmod +x script.sh        # adiciona execute para todos
chmod -w arquivo.txt      # remove write de todos
chmod u+x,g-w script.sh   # dono ganha x, grupo perde w
chmod o= arquivo.txt      # others ficam sem nenhuma permissão

# Recursivo (cuidado — não use em /!)
chmod -R 755 public/      # recursivo em diretório`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Dono e grupo: chown e chgrp">
        <CodeBlock>{`# Ver dono e grupo
ls -l arquivo.txt
stat arquivo.txt

# Mudar dono
chown fernando arquivo.txt         # muda só o dono
chown fernando:devs arquivo.txt    # muda dono e grupo
chown :devs arquivo.txt            # muda só o grupo
chown -R www-data:www-data /var/www/html/  # recursivo

# Mudar só o grupo
chgrp devs projeto/

# Ver grupos do usuário atual
id                # uid=1000(fernando) gid=1000(fernando) groups=...
groups            # lista grupos do usuário corrente

# Adicionar usuário a um grupo
sudo usermod -aG docker fernando   # adiciona ao grupo docker
# Após isso, fazer logout+login para o grupo aparecer em \`groups\``}</CodeBlock>
        <Callout tone="info">
          <code>www-data</code> é o usuário padrão do Apache/Nginx. Arquivos do site devem pertencer a <code>www-data</code> ou ter permissão de leitura para ele. Configurar dono errado é a causa mais comum de erros 403 Forbidden em produção.
        </Callout>
      </Section>

      <Section accent={accent} title="Symlinks vs Hardlinks: quando usar cada um">
        <CodeBlock>{`# Hardlink — dois nomes para o mesmo inode
ln original.txt hardlink.txt
ls -li  # ambos têm o mesmo número de inode e Links: 2
# Deletar um não afeta o outro
# Limitação: não pode cruzar filesystems, não funciona para diretórios

# Symlink (soft link) — arquivo que aponta para um caminho
ln -s /etc/nginx/sites-available/meu-site /etc/nginx/sites-enabled/meu-site
ln -s /home/fernando/projects projeto  # link relativo ou absoluto
ls -la  # mostra: projeto -> /home/fernando/projects

# Verificar se é link
ls -la arquivo     # l no início do tipo (lrwxrwxrwx)
readlink link.txt  # mostra o alvo do symlink
realpath link.txt  # resolve symlinks e mostra caminho absoluto real

# Remover symlink (NÃO use rm -rf link/ — o / faz remover o conteúdo do alvo!)
rm symlink         # correto
unlink symlink     # alternativa`}</CodeBlock>
        <ComparisonTable
          headers={['Aspecto', 'Hardlink', 'Symlink']}
          rows={[
            ['Inode', 'Mesmo inode', 'Inode próprio'],
            ['Deletar original', 'Arquivo persiste', 'Link quebra'],
            ['Cross-filesystem', 'Não', 'Sim'],
            ['Para diretórios', 'Não (na prática)', 'Sim'],
            ['Caso de uso', 'Backups incrementais', 'Alias de config, versionamento'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Casos práticos que quebram deploys">
        <CodeBlock>{`# PROBLEMA 1: script não executa
$ ./deploy.sh
bash: ./deploy.sh: Permission denied
# SOLUÇÃO:
chmod +x deploy.sh

# PROBLEMA 2: app não consegue ler config
# (app roda como www-data, config pertence a root com chmod 600)
ls -la /etc/myapp/config.yaml
# -rw------- 1 root root 512 jan 15 config.yaml
sudo chown www-data /etc/myapp/config.yaml
# ou: sudo chmod 640 /etc/myapp/config.yaml && sudo chgrp www-data /etc/myapp/config.yaml

# PROBLEMA 3: upload de arquivos falha
# (diretório de uploads com dono root, app roda como node)
ls -la /var/www/uploads/
# drwxr-xr-x 2 root root 4096 uploads/
sudo chown -R node:node /var/www/uploads/

# PROBLEMA 4: symlink quebrado após deploy
ls -la /etc/nginx/sites-enabled/
# meu-site -> /etc/nginx/sites-available/meu-site  (em vermelho = quebrado)
# O arquivo de origem foi deletado ou está no caminho errado
ln -sf /etc/nginx/sites-available/meu-site /etc/nginx/sites-enabled/meu-site`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Checklist de permissões para produção:</strong> arquivos de config com segredos → 600 (só dono lê). Executáveis → 755. Uploads/static → 644. Diretórios → 755 ou 750. Nunca 777 em produção.
      </Callout>

      <Callout>
        Próximo: <strong>Processos, jobs e sinais</strong> — PID, fork, kill, SIGTERM vs SIGKILL, e o que roda no seu sistema.
      </Callout>
    </div>
  );
}
