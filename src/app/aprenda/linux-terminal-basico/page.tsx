import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata: Metadata = {
  title: 'Linux no terminal: os 30 comandos que valem por 300 — FFV Academy',
  description: 'ls, cd, grep, find, pipe, redireção — os comandos Linux que você usará todo dia, com a lógica por trás de cada um para fixar de verdade.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre `>` e `>>` em redireção de saída no bash?',
    options: [
      'São equivalentes — ambos adicionam ao arquivo',
      '`>` sobrescreve o arquivo (ou cria se não existir). `>>` adiciona ao final (append). Ex: `echo "linha" > arq` apaga o conteúdo anterior; `echo "linha" >> arq` preserva e adiciona.',
      '`>` é para erros, `>>` é para saída normal',
      '`>>` é mais rápido porque não limpa o arquivo antes',
    ],
    correct: 1,
    explanation: 'Redireção é uma das primitivas mais importantes do shell. `>` trunca (zero bytes) o arquivo antes de escrever. `>>` abre em modo append. Para redirecionar stderr: `2>`. Para redirecionar stdout e stderr juntos: `&>` ou `2>&1`.',
  },
  {
    question: 'O que faz `grep -r "TODO" src/ | sort | uniq -c | sort -rn`?',
    options: [
      'Procura "TODO" em src/ e mostra tudo sem ordem',
      'Busca todas as linhas com "TODO" recursivamente em src/, conta quantas vezes cada linha aparece (uniq -c), e ordena por frequência decrescente (sort -rn) — pipeline de análise',
      'Remove todos os arquivos com TODO no nome',
      'Edita os arquivos para remover os comentários TODO',
    ],
    correct: 1,
    explanation: 'Pipelines são o superpoder do shell: cada comando lê stdin e escreve stdout. grep filtra, sort ordena lexicograficamente (necessário para uniq funcionar), uniq -c conta repetições, sort -rn ordena numericamente em ordem reversa. Compor comandos simples resolve problemas complexos.',
  },
  {
    question: 'Qual comando encontra todos os arquivos .py modificados nos últimos 7 dias e maiores que 10KB, em uma só linha?',
    options: [
      'ls -la src/ | grep .py',
      'find . -name "*.py" -mtime -7 -size +10k',
      'grep -r "*.py" . --newer=7days',
      'ls --filter=py --time=7 --size=10k',
    ],
    correct: 1,
    explanation: '`find` é o comando de busca de arquivos no Linux. `-name "*.py"` filtra por extensão, `-mtime -7` significa modificado em menos de 7 dias (o `-` significa "menos que"), `-size +10k` significa maior que 10 kilobytes. Os flags se combinam com AND implícito.',
  },
];

export default function LinuxTerminalBasicoPage() {
  return (
    <ModuleLayout
      slug="linux-terminal-basico"
      title="Linux no terminal: os 30 comandos que valem por 300"
      icon="🐧"
      xp={60}
      readTime={12}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="filesystem-permissions"
      nextTitle="Filesystem e permissões: rwx, chown, symlink, hardlink"
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
        O terminal intimida pela aparência, mas sua lógica é elegante: tudo é texto, comandos compõem via pipe, e o conjunto de ~30 comandos resolve 90% dos problemas reais. Não é decoreba — é entender o modelo mental por trás.
      </p>

      <Section accent={accent} title="O modelo mental: tudo é texto, tudo é arquivo">
        <p>
          No Unix (e Linux é Unix-like), tudo tem uma interface de texto: arquivos, processos, dispositivos, sockets de rede. Isso permite que ferramentas simples se componham em pipelines poderosos.
        </p>
        <p>
          Todo processo tem 3 streams padrão: <strong>stdin</strong> (entrada, fd=0), <strong>stdout</strong> (saída, fd=1), e <strong>stderr</strong> (erros, fd=2). O pipe (<code>|</code>) conecta o stdout de um comando ao stdin do próximo — sem arquivo temporário, em memória, em paralelo.
        </p>
        <CodeBlock>{`# Sem pipe: você precisaria de arquivos temporários
grep "ERROR" app.log > /tmp/erros.txt
sort /tmp/erros.txt > /tmp/erros_sorted.txt
uniq /tmp/erros_sorted.txt > /tmp/erros_unique.txt
cat /tmp/erros_unique.txt

# Com pipe: mesmo resultado, sem arquivos temporários
grep "ERROR" app.log | sort | uniq

# Os comandos rodam em paralelo — grep produz enquanto sort consome`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Navegação e listagem">
        <CodeBlock>{`# Onde estou?
pwd                    # Print Working Directory

# Navegar
cd /etc                # vai para /etc (caminho absoluto)
cd ..                  # sobe um nível
cd -                   # volta para o diretório anterior
cd ~                   # vai para home ($HOME)
cd ~/projects/meu-app  # absoluto a partir da home

# Listar
ls                     # lista básica
ls -l                  # formato longo (permissões, dono, tamanho, data)
ls -la                 # inclui arquivos ocultos (começam com .)
ls -lh                 # tamanho humano-legível (KB, MB, GB)
ls -lt                 # ordena por tempo de modificação
ls -lS                 # ordena por tamanho
ls src/**/*.py         # glob: todos os .py em subdiretórios de src/

# Ver conteúdo
cat arquivo.txt        # imprime tudo (bom para arquivos pequenos)
less arquivo.log       # paginado: setas p/ navegar, /termo p/ buscar, q p/ sair
head -n 20 arquivo.log # primeiras 20 linhas
tail -n 20 arquivo.log # últimas 20 linhas
tail -f app.log        # segue o arquivo em tempo real (log streaming)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Criação, cópia e remoção">
        <CodeBlock>{`# Criar
touch arquivo.txt      # cria vazio ou atualiza timestamp
mkdir pasta            # cria diretório
mkdir -p a/b/c         # cria diretórios aninhados sem erro se existirem

# Copiar
cp origem destino      # copia arquivo
cp -r src/ dest/       # copia diretório recursivamente
cp -p origem destino   # preserva permissões e timestamps

# Mover / renomear
mv origem destino      # move ou renomeia (mesma operação)
mv *.log /var/logs/    # move todos os .log

# Remover (CUIDADO — não tem lixeira)
rm arquivo.txt         # remove arquivo
rm -r pasta/           # remove diretório recursivamente
rm -rf pasta/          # força sem confirmação (muito perigoso)
# Regra: nunca use rm -rf sem ls antes para confirmar o que está removendo`}</CodeBlock>
        <Callout tone="warn">
          <code>rm -rf /</code> apaga o sistema inteiro. <code>rm -rf ./</code> apaga o diretório atual. Sempre confirme o path com <code>ls</code> antes de remover recursivamente.
        </Callout>
      </Section>

      <Section accent={accent} title="Busca: grep e find">
        <p>
          São dois comandos diferentes com propósitos distintos: <code>find</code> busca <em>arquivos</em> por nome/propriedade; <code>grep</code> busca <em>conteúdo</em> dentro de arquivos.
        </p>
        <CodeBlock>{`# grep — busca padrão em conteúdo de arquivos
grep "erro"  app.log          # linhas que contêm "erro"
grep -i "erro" app.log        # case-insensitive
grep -n "erro" app.log        # mostra número de linha
grep -r "TODO" src/           # recursivo em diretório
grep -v "DEBUG" app.log       # inverte: linhas que NÃO contêm "DEBUG"
grep -E "error|warn" app.log  # regex estendida (OU)
grep -c "erro" app.log        # conta linhas com match
grep -l "TODO" src/**/*.py    # lista apenas nomes de arquivos com match
grep -A 3 "CRITICAL" app.log  # 3 linhas após o match (After)
grep -B 2 "CRITICAL" app.log  # 2 linhas antes (Before)
grep -C 2 "CRITICAL" app.log  # 2 antes e 2 depois (Context)

# find — busca de arquivos por metadados
find . -name "*.log"           # por extensão
find . -name "config*"         # por prefixo de nome
find /var -type f -size +100M  # arquivos maiores que 100MB
find . -mtime -7               # modificados nos últimos 7 dias
find . -newer referencia.txt   # mais novo que um arquivo
find . -perm 644               # com permissão exata
find . -user www-data          # do usuário www-data
find . -name "*.py" -exec wc -l {} \;   # executa wc -l em cada resultado
find . -name "*.tmp" -delete   # deleta todos os .tmp encontrados`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Redireção e pipelines avançados">
        <CodeBlock>{`# Redireção de saída
comando > arquivo.txt    # sobrescreve (cria se não existir)
comando >> arquivo.txt   # adiciona ao final (append)
comando 2> erros.txt     # redireciona stderr para arquivo
comando &> tudo.txt      # redireciona stdout E stderr
comando > /dev/null      # descarta saída (black hole)
comando 2>/dev/null      # descarta erros
comando &>/dev/null      # descarta tudo

# Redireção de entrada
comando < arquivo.txt    # lê stdin de arquivo
comando <<EOF            # here-doc: stdin inline até EOF
linha 1
linha 2
EOF

# Pipelines úteis no dia-a-dia
cat app.log | grep ERROR | tail -50      # últimos 50 erros
ps aux | grep python | grep -v grep      # processos python (sem o grep em si)
du -sh */ | sort -rh | head -10          # top 10 diretórios por tamanho
history | grep git | tail -20            # últimos 20 comandos git usados
cat requirements.txt | wc -l            # quantas dependências
ls -la | awk '{print $5, $9}' | sort -rn # nome e tamanho, ordenado

# Comandos de texto essenciais
wc -l arquivo.txt        # conta linhas
wc -w arquivo.txt        # conta palavras
sort arquivo.txt         # ordena linhas
sort -n nums.txt         # ordena numericamente
sort -rn nums.txt        # ordena numericamente reverso
uniq lista.txt           # remove linhas duplicadas CONSECUTIVAS (precisa sort antes)
uniq -c lista.txt        # conta repetições
cut -d',' -f1,3 csv.txt  # extrai colunas 1 e 3 de CSV (delimitador ,)
tr 'a-z' 'A-Z'           # transforma minúsculas em maiúsculas (via pipe)
sed 's/foo/bar/g' arq    # substitui "foo" por "bar" em todas as linhas
awk '{print $2}' arq     # imprime coluna 2 de cada linha`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Variáveis, aliases e configuração do shell">
        <CodeBlock>{`# Variáveis
export NOME="Fernando"      # cria variável de ambiente (disponível para subprocessos)
echo $NOME                  # Fernando
echo \${NOME:-"padrão"}      # Fernando (ou "padrão" se vazia)
unset NOME                  # remove a variável

# Variáveis especiais
echo $?        # exit code do último comando (0 = sucesso, ≠0 = erro)
echo $0        # nome do script atual
echo $#        # número de argumentos
echo $@        # todos os argumentos
echo $$        # PID do shell atual
echo $!        # PID do último processo em background

# Aliases (atalhos permanentes no ~/.bashrc ou ~/.zshrc)
alias ll='ls -lah'
alias gs='git status'
alias dc='docker compose'
alias k='kubectl'
alias ..='cd ..'
alias ...='cd ../..'

# Funções
mkcd() { mkdir -p "$1" && cd "$1"; }  # cria e entra no diretório

# Após editar ~/.bashrc:
source ~/.bashrc   # ou: . ~/.bashrc  — recarrega sem reiniciar shell`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Referência rápida: os 30 comandos essenciais">
        <ComparisonTable
          headers={['Comando', 'O que faz', 'Exemplo']}
          rows={[
            ['pwd', 'Diretório atual', 'pwd'],
            ['cd', 'Navegar', 'cd ~/projects'],
            ['ls', 'Listar', 'ls -lah'],
            ['cat', 'Ver arquivo', 'cat config.yaml'],
            ['less', 'Paginar arquivo', 'less app.log'],
            ['head/tail', 'Início/fim', 'tail -f app.log'],
            ['touch', 'Criar arquivo', 'touch .env'],
            ['mkdir', 'Criar dir', 'mkdir -p a/b/c'],
            ['cp', 'Copiar', 'cp -r src/ backup/'],
            ['mv', 'Mover/renomear', 'mv old.py new.py'],
            ['rm', 'Remover', 'rm -r dist/'],
            ['grep', 'Buscar conteúdo', 'grep -r "TODO" src/'],
            ['find', 'Buscar arquivo', 'find . -name "*.log"'],
            ['wc', 'Contar', 'wc -l arquivo.txt'],
            ['sort', 'Ordenar', 'sort -rn nums.txt'],
            ['uniq', 'Deduplicar', 'sort lista | uniq -c'],
            ['cut', 'Extrair colunas', 'cut -d, -f1 data.csv'],
            ['sed', 'Substituir', 'sed s/foo/bar/g arq'],
            ['awk', 'Processar colunas', "awk '{print $2}' arq"],
            ['echo', 'Imprimir', 'echo $HOME'],
            ['export', 'Variável env', 'export DEBUG=1'],
            ['which', 'Caminho do cmd', 'which python3'],
            ['man', 'Manual', 'man grep'],
            ['history', 'Histórico', 'history | grep git'],
            ['ps', 'Processos', 'ps aux | grep python'],
            ['kill', 'Sinalizar processo', 'kill -9 1234'],
            ['chmod', 'Permissões', 'chmod +x script.sh'],
            ['chown', 'Dono', 'chown user:group arq'],
            ['df', 'Espaço em disco', 'df -h'],
            ['du', 'Tamanho dir', 'du -sh */'],
          ]}
          accent={accent}
        />
      </Section>

      <Callout tone="success">
        <strong>Regra de ouro:</strong> quando travar num comando, use <code>man comando</code> ou <code>comando --help</code>. O manual está sempre disponível offline — não precisa de Google.
      </Callout>

      <Callout>
        Próximo: <strong>Filesystem e permissões</strong> — rwx, chmod, chown, symlinks e hardlinks. O que quebra deploys e como evitar.
      </Callout>
    </div>
  );
}
