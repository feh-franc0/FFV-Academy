import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata = getModuleMetadata('json-yaml-env');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que nunca se deve commitar um arquivo .env no Git?',
    options: [
      'Porque .env é muito grande e deixa o repositório lento',
      'Porque .env contém segredos (senhas de banco, chaves de API, tokens) que, uma vez no histórico do Git, são difíceis de remover completamente e ficam expostos para qualquer pessoa com acesso ao repositório — incluindo histórico antigo mesmo após deletar o arquivo',
      'Porque .env só funciona em desenvolvimento, não em produção',
      'Porque o formato .env não é suportado por todas as ferramentas',
    ],
    correct: 1,
    explanation: 'Segredos no Git são um problema grave: mesmo que você delete o arquivo e faça um novo commit, o segredo ainda existe no histórico. git filter-branch ou BFG Repo Cleaner podem reescrever o histórico, mas se o repo é público ou já foi clonado por alguém — o segredo está comprometido. Sempre: .env no .gitignore, .env.example no repo.',
  },
  {
    question: 'Qual a principal vantagem do YAML sobre JSON para arquivos de configuração?',
    options: [
      'YAML é mais rápido de parsear que JSON',
      'YAML suporta comentários (# comentário), tem sintaxe mais legível para estruturas aninhadas (sem tantos {} e []), e suporta strings multiline. JSON é mais adequado para comunicação entre sistemas (API responses) por ser mais explícito e ter parsers mais rápidos.',
      'YAML é o único formato suportado pelo Docker e Kubernetes',
      'JSON não suporta objetos aninhados',
    ],
    correct: 1,
    explanation: 'JSON não suporta comentários — intencional, para evitar "comentários de configuração" que ficam obsoletos. Para comunicação de dados (APIs), JSON é superior: mais rígido, sem surpresas de indentação. Para config por humanos (docker-compose, k8s manifests, CI), YAML ganha em legibilidade. YAML é um superset de JSON — todo JSON válido é YAML válido.',
  },
  {
    question: 'Um processo filho herda as variáveis de ambiente do pai. Isso significa que...?',
    options: [
      'Mudanças no filho afetam o pai automaticamente',
      'Quando você exporta uma variável no shell (export DATABASE_URL=...), todos os subprocessos iniciados por esse shell recebem uma CÓPIA da variável. Mudanças no filho não propagam de volta ao pai. Isso é por design: isolamento de ambiente entre processos.',
      'Variáveis de ambiente são globais e compartilhadas entre todos os processos',
      'Apenas processos root herdam variáveis de ambiente',
    ],
    correct: 1,
    explanation: 'Herança de variáveis de ambiente é unidirecional (pai → filho) e por cópia. Por isso, um processo de build pode passar configuração para subprocessos via env vars sem afetar outros processos no sistema. Isso é a base do 12-factor app: config via env vars é portável, segura e não vaza entre ambientes.',
  },
];

export default function JsonYamlEnvPage() {
  return (
    <ModuleLayout
      slug="json-yaml-env"
      title="JSON, YAML e variáveis de ambiente: config moderna"
      icon="📄"
      xp={40}
      readTime={8}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="editores-produtividade"
      nextTitle="VSCode/Vim produtivos: atalhos, plugins, multi-cursor"
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
        JSON e YAML são os dois formatos de dados estruturados mais usados em software moderno. Variáveis de ambiente são o padrão para configuração de aplicações. Dominar os três é pré-requisito para trabalhar com qualquer infraestrutura ou API.
      </p>

      <Section accent={accent} title="JSON: o formato universal de dados">
        <p>
          JSON (JavaScript Object Notation) é o formato de troca de dados da web. Leve, legível por humanos, suportado por todas as linguagens. Tem apenas 6 tipos de valor.
        </p>
        <CodeBlock>{`{
  "nome": "Fernando",
  "idade": 32,
  "ativo": true,
  "endereco": null,
  "tags": ["dev", "backend", "cloud"],
  "config": {
    "timeout": 30,
    "retries": 3
  }
}

// Os 6 tipos JSON:
// string   → "texto entre aspas duplas" (nunca simples)
// number   → 42, 3.14, -1, 1e10 (sem distinção int/float)
// boolean  → true, false (minúsculas)
// null     → null
// array    → [1, "dois", true, null]
// object   → {"chave": "valor"}

// Erros comuns:
// ❌ {name: 'Fernando'}    → chaves devem ser strings com aspas duplas
// ❌ {color: #fff}         → strings precisam de aspas duplas
// ❌ [1, 2, 3,]            → trailing comma não é permitido
// ❌ // comentário         → JSON não suporta comentários`}</CodeBlock>
        <CodeBlock>{`# Trabalhar com JSON na linha de comando:
# jq — processador de JSON poderoso
echo '{"name": "Fernando", "xp": 500}' | jq '.name'
# → "Fernando"

cat dados.json | jq '.users[] | select(.active == true) | .email'
cat dados.json | jq 'keys'                    # lista as chaves
cat dados.json | jq '. | length'              # tamanho do objeto/array
cat dados.json | jq '{nome: .name, xp}'      # transforma o objeto

# Python one-liner para formatar JSON bagunçado:
echo '{"a":1,"b":2}' | python3 -m json.tool
# → formatado com indentação`}</CodeBlock>
      </Section>

      <Section accent={accent} title="YAML: configuração legível por humanos">
        <p>
          YAML (YAML Ain't Markup Language) é um superset de JSON otimizado para ser escrito e lido por humanos. É o formato padrão de Docker Compose, Kubernetes, GitHub Actions, Ansible e muitas outras ferramentas de infra.
        </p>
        <CodeBlock>{`# YAML equivalente ao JSON acima:
nome: Fernando
idade: 32
ativo: true
endereco: null        # ou ~
tags:
  - dev
  - backend
  - cloud
config:
  timeout: 30
  retries: 3

# Comentários são suportados (diferente de JSON!)
# debug: false   # desabilitado em produção

# Strings: aspas opcionais para simples, obrigatórias com caracteres especiais
titulo: Meu Projeto               # sem aspas
descricao: "Usa : e # na frase"   # aspas necessárias
url: 'https://exemplo.com/path'   # aspas simples também funcionam

# Strings multiline (muito útil em scripts CI/CD)
script: |
  npm install
  npm run build
  npm run test
# → preserva newlines exatamente como escrito

descricao: >
  Este é um texto longo que vai
  continuar na próxima linha.
# → junta as linhas com espaço (flow scalar)`}</CodeBlock>
        <CodeBlock>{`# Gotchas do YAML:
# 1. Indentação é semântica (como Python) — só espaços, nunca tabs
# 2. Booleanos: yes/no/on/off também são true/false em YAML 1.1
#    (em YAML 1.2 / strictyaml, apenas true/false)
# 3. Números octais: 010 em YAML 1.1 = 8 (decimal) — use strings: "010"
# 4. Anchors e aliases — reutilização:
defaults: &defaults
  timeout: 30
  retries: 3

producao:
  <<: *defaults    # herda defaults
  timeout: 60      # sobrescreve timeout

# Validar YAML:
python3 -c "import yaml; yaml.safe_load(open('config.yaml'))"
# ou:
yamllint config.yaml   # ferramenta de linting`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Variáveis de ambiente: o padrão 12-factor">
        <p>
          O <a href="https://12factor.net" style={{ color: accent }}>12-factor app</a> define que configuração deve vir de variáveis de ambiente — nunca hardcoded, nunca em arquivos commitados. Isso permite que o mesmo código rode em development, staging e produção apenas mudando as env vars.
        </p>
        <CodeBlock>{`# Configurar variáveis de ambiente no shell
export DATABASE_URL="postgresql://user:senha@localhost:5432/myapp"
export SECRET_KEY="s3cr3t-key-super-segura"
export DEBUG="false"
export PORT="8000"

# Variáveis só para um comando (não persiste no shell)
DATABASE_URL="..." PORT=8000 python manage.py runserver

# Ver todas as env vars do ambiente atual
env
printenv                      # idem
printenv DATABASE_URL         # ver uma variável específica
echo $DATABASE_URL            # idem

# Acessar em código:
# Python
import os
db_url = os.environ.get('DATABASE_URL')                  # None se não existir
db_url = os.environ['DATABASE_URL']                      # KeyError se não existir
db_url = os.getenv('DATABASE_URL', 'postgresql://...')   # com default

# Node.js
const dbUrl = process.env.DATABASE_URL;

# Go
dbUrl := os.Getenv("DATABASE_URL")`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Arquivos .env: desenvolvimento local">
        <CodeBlock>{`# .env — carregado por dotenv, nunca commitado
DATABASE_URL=postgresql://user:senha@localhost:5432/myapp_dev
SECRET_KEY=dev-key-pode-ser-simples
DEBUG=true
PORT=3000
REDIS_URL=redis://localhost:6379

# .env.example — commitado, sem valores reais
DATABASE_URL=postgresql://user:senha@host:5432/dbname
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=false
PORT=3000
REDIS_URL=redis://localhost:6379

# .gitignore — OBRIGATÓRIO
.env
.env.local
.env.*.local
*.env

# Carregar .env em Python (python-dotenv)
from dotenv import load_dotenv
load_dotenv()  # carrega .env para os.environ

# Node.js
require('dotenv').config()
# ou no package.json scripts: "dev": "node --env-file=.env server.js"

# Docker: passar env vars para container
docker run -e DATABASE_URL=postgresql://... myapp
docker run --env-file .env myapp           # carrega arquivo inteiro`}</CodeBlock>
        <Callout tone="warn">
          <strong>Hierarquia de segredos:</strong> para desenvolvimento, <code>.env</code> local é OK. Para produção, use um secrets manager: AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault, ou Kubernetes Secrets. Nunca passe segredos como argumentos de linha de comando (ficam visíveis em <code>ps aux</code>).
        </Callout>
      </Section>

      <ComparisonTable
        headers={['Aspecto', 'JSON', 'YAML']}
        rows={[
          ['Comentários', 'Não suportado', 'Suportado (#)'],
          ['Sintaxe', 'Explícita (chaves, colchetes)', 'Baseada em indentação'],
          ['Multiline strings', 'Limitado (\\n escape)', 'Nativo (| e >)'],
          ['Referências internas', 'Não', 'Sim (anchors & aliases)'],
          ['Velocidade de parse', 'Mais rápido', 'Mais lento'],
          ['Uso principal', 'APIs, dados, config simples', 'Config por humanos (k8s, CI/CD, Ansible)'],
          ['Superset de', '—', 'JSON (todo JSON é YAML válido)'],
        ]}
        accent={accent}
      />

      <Callout tone="success">
        <strong>Regras práticas:</strong> use JSON para APIs e dados trocados entre sistemas. Use YAML para config de infra e ferramentas. Use variáveis de ambiente para segredos e config que muda entre ambientes. Nunca comite <code>.env</code> — sempre comite <code>.env.example</code>.
      </Callout>

      <Callout>
        Próximo: <strong>VSCode/Vim produtivos</strong> — os atalhos e configurações que mudam a velocidade de desenvolvimento.
      </Callout>
    </div>
  );
}
