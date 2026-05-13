import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  KeyValue,
  QAItem,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('frontend-deploy-ftp');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que faz a configuração `output: "export"` no next.config.ts?',
    options: [
      'Exporta o projeto para outro repositório Git',
      'Faz o Next.js gerar arquivos HTML/CSS/JS estáticos na pasta out/ em vez de um servidor Node.js — o resultado pode ser hospedado em qualquer servidor de arquivos estáticos',
      'Habilita o modo de exportação de dados da API',
      'Exporta as configurações do projeto para um arquivo JSON',
    ],
    correct: 1,
    explanation:
      'Com output: "export", o Next.js pre-renderiza todas as páginas em HTML estático durante o build. O resultado na pasta out/ é um site estático que não precisa de Node.js para rodar — funciona em Hostinger shared, S3, GitHub Pages, Cloudflare Pages, etc.',
  },
  {
    question: 'Por que o FTP-Deploy-Action usa comparação de hash ao invés de enviar todos os arquivos?',
    options: [
      'Porque FTP não suporta arquivos grandes',
      'Para deploy incremental: só os arquivos que mudaram são enviados, reduzindo o tempo de deploy de minutos para segundos quando poucas páginas foram alteradas',
      'Porque o servidor FTP da Hostinger tem limite de arquivos por upload',
      'Para verificar a integridade dos arquivos após o upload',
    ],
    correct: 1,
    explanation:
      'Com 900+ páginas estáticas geradas pelo Next.js, enviar tudo via FTP a cada deploy levaria vários minutos. O FTP-Deploy-Action mantém um arquivo de estado com hash de cada arquivo. No próximo deploy, só os arquivos cujo hash mudou são enviados — deploy de segundos mesmo em projetos grandes.',
  },
  {
    question: 'Qual é a principal limitação de hospedar um site Next.js com `output: "export"` em shared hosting?',
    options: [
      'Arquivos estáticos não podem ser servidos em shared hosting',
      'Funcionalidades que dependem de servidor (Server Components com data fetching dinâmico, Route Handlers como API, middleware de borda) não funcionam — precisam de ambiente Node.js',
      'O CSS do Tailwind não é compatível com shared hosting',
      'O Next.js com static export não gera arquivos HTML',
    ],
    correct: 1,
    explanation:
      'Static export = sem servidor Node.js. Isso significa: sem API routes dinâmicas, sem Server Components com fetch dinâmico (só estático), sem middleware de borda, sem ISR (Incremental Static Regeneration). Funciona para sites com data fetching em build time ou client-side.',
  },
  {
    question: 'Por que colocar `trailingSlash: true` no next.config.ts para deploy em Hostinger?',
    options: [
      'Por razões de SEO — o Google prefere URLs com barra no final',
      'A Hostinger serve arquivos de diretórios por padrão (index.html dentro de pastas). Com trailingSlash, /sobre/ → /sobre/index.html, que o servidor encontra corretamente. Sem isso, /sobre retorna 404.',
      'Para melhorar a velocidade de carregamento das páginas',
      'Para habilitar o gzip no servidor da Hostinger',
    ],
    correct: 1,
    explanation:
      'Shared hosting Apache/Nginx serve /sobre/ procurando /sobre/index.html. Com trailingSlash: true, o Next.js gera arquivos em pastas (about/index.html) em vez de arquivos na raiz (about.html). Isso garante que todas as URLs funcionem corretamente no shared hosting.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="frontend-deploy-ftp"
      title="Deploy do frontend estático: FTP e hospedagem compartilhada"
      icon="📤"
      xp={50}
      readTime={11}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="capstone-mvp-fullstack"
      nextTitle="Capstone: MVP full stack do zero à produção"
      relatedSlugs={['github-actions-deploy-vps', 'secrets-env-producao', 'capstone-mvp-fullstack']}
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
        Enquanto o backend roda em containers Docker na VPS, o frontend pode ser hospedado de forma muito mais simples
        e barata: em hospedagem compartilhada via FTP. O Next.js com <InlineCode>output: &quot;export&quot;</InlineCode>{' '}
        gera um site estático completo que funciona em qualquer servidor de arquivos — sem Node.js, sem containers, sem
        complexidade. Neste módulo você configura o build estático, o workflow de deploy via FTP e o sync incremental
        que só envia arquivos que mudaram.
      </p>

      <Section title="Por que hospedagem compartilhada para o frontend?" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Opção', 'Custo/mês', 'Complexidade', 'Latência BR', 'Quando usar']}
          rows={[
            ['Shared hosting (Hostinger)', '~R$12', 'Mínima', 'Ótima (datacenter BR)', 'Frontend estático — padrão desta trilha'],
            ['Vercel', 'Grátis (hobby)', 'Mínima', 'Boa (CDN global)', 'Projetos pessoais, sem backend próprio'],
            ['VPS mesma da API', '€5 (já pago)', 'Média (Nginx)', 'Ótima', 'Quando já tem VPS e quer centralizar'],
            ['Cloudflare Pages', 'Grátis', 'Mínima', 'Ótima (edge)', 'Sites com tráfego global intenso'],
          ]}
        />
        <Callout tone="info">
          <strong>Shared hosting para estáticos é imbatível em custo:</strong> se você já tem um plano de hospedagem
          compartilhada (como o plano Business da Hostinger que inclui domínio), o frontend fica praticamente de graça.
          A VPS fica para o backend (que precisa de Node.js/Go/Docker), e o shared hosting serve o HTML estático.
        </Callout>
      </Section>

      <Section title="Configurando o Next.js para export estático" accent={ACCENT}>
        <CodeBlock lang="typescript">{`// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Gerar arquivos estáticos em vez de servidor Node.js
  output: 'export',

  // Necessário para shared hosting (Apache/Nginx serve /pagina/index.html)
  trailingSlash: true,

  // Imagens externas não são otimizadas no static export
  images: {
    unoptimized: true,
  },

  // Variáveis de ambiente de build (injetadas no bundle pelo CI)
  // Acessíveis no código como process.env.NEXT_PUBLIC_*
  // O valor vem do secret NEXT_PUBLIC_API_BASE_URL no GitHub Actions
}`}</CodeBlock>
        <Callout tone="warn">
          <strong>Limitações do static export:</strong> sem <InlineCode>output: &apos;export&apos;</InlineCode> dinâmico.
          Não funcionam: Route Handlers (<InlineCode>app/api/route.ts</InlineCode>), Server Components com{' '}
          <InlineCode>fetch</InlineCode> dinâmico, middleware de borda, ISR. Use client-side fetch (com SWR/React Query)
          para dados que mudam frequentemente, ou pre-render em build time para dados estáticos.
        </Callout>
        <CodeBlock lang="bash">{`# Testar o build local antes de configurar o CI
npm run build

# Verificar o que foi gerado
ls out/
# _next/         ← assets JS/CSS com hash
# images/        ← imagens públicas
# index.html     ← home page
# sobre/         ← trailingSlash: true → sobre/index.html
# aprenda/       ← nested pages

# Servir localmente para testar (instale npx serve se não tiver)
npx serve out/ -l 3001
# Acesse http://localhost:3001 para testar o site estático`}</CodeBlock>
      </Section>

      <Section title="Configurando o FTP na Hostinger" accent={ACCENT}>
        <p>
          No painel da Hostinger, crie um usuário FTP dedicado para o CI:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Painel Hostinger', v: 'Sites → seudominio.com → Painel de Controle → FTP Accounts' },
            { k: 'Crie um novo usuário', v: 'Nome: ci-deploy, senha forte gerada com openssl rand. NÃO use o usuário principal.' },
            { k: 'Diretório home', v: '/public_html — é onde o conteúdo do site fica no servidor' },
            { k: 'Servidor FTP', v: 'Geralmente ftp.seudominio.com ou o IP do servidor — disponível nos detalhes da conta FTP' },
          ]}
        />
        <Callout tone="warn">
          <strong>War story — a Hostinger NÃO mostra a senha FTP atual.</strong> Diferente de outras hospedagens, o
          painel da Hostinger não exibe nem permite copiar a senha já cadastrada de uma conta FTP — eles guardam só o
          hash. Quando for cadastrar <InlineCode>HOSTINGER_FTP_PASSWORD</InlineCode> nos GitHub Secrets e não lembrar
          mais qual era, vá em <strong>FTP Accounts → ⋮ (menu) → &quot;Esqueceu sua senha FTP?&quot;</strong>{' '}
          (literalmente esse texto) e gere uma nova. Não existe &quot;mostrar senha&quot; — só reset. Salve a nova
          senha imediatamente no gerenciador de senhas + GitHub Secret antes de fechar o modal.
        </Callout>
        <CodeBlock lang="bash">{`# Adicione os secrets no GitHub Actions (Settings → Secrets):
# HOSTINGER_FTP_SERVER   = ftp.seudominio.com
# HOSTINGER_FTP_USERNAME = ci-deploy
# HOSTINGER_FTP_PASSWORD = (senha do usuário FTP)
# HOSTINGER_FTP_DIR      = /public_html/

# Testar a conexão FTP manualmente (opcional, requer ftp instalado)
ftp -n $HOSTINGER_FTP_SERVER << 'EOF'
user ci-deploy SENHA
ls
quit
EOF`}</CodeBlock>
      </Section>

      <Section title="Workflow de deploy do frontend" accent={ACCENT}>
        <CodeBlock lang="yaml">{`# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'       # só dispara quando há mudanças no frontend
  workflow_dispatch:

jobs:
  build-deploy:
    name: Build & Deploy Frontend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend   # comandos rodam dentro de /frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Build estático
        env:
          # Variável pública — a URL da API vai no bundle JS do browser
          NEXT_PUBLIC_API_BASE_URL: ${'$'}{{ vars.NEXT_PUBLIC_API_BASE_URL }}
        run: npm run build

      - name: Verificar build
        run: |
          ls -la out/
          echo "Arquivos gerados: $(find out -type f | wc -l)"

      - name: Deploy via FTP (sync incremental)
        if: vars.DEPLOY_ENABLED == 'true'
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${'$'}{{ secrets.HOSTINGER_FTP_SERVER }}
          username: ${'$'}{{ secrets.HOSTINGER_FTP_USERNAME }}
          password: ${'$'}{{ secrets.HOSTINGER_FTP_PASSWORD }}
          local-dir: frontend/out/      # pasta gerada pelo next build
          server-dir: ${'$'}{{ secrets.HOSTINGER_FTP_DIR }}
          # Sincroniza apenas arquivos modificados (compara hash SHA-256)
          # Na primeira execução, envia tudo; depois, só o que mudou
          state-name: .ftp-deploy-sync-state.json
          # Não deletar arquivos no servidor que não existem localmente
          # (seguro para a primeira configuração — mude para true depois)
          dangerous-clean-slate: false
          log-level: standard`}</CodeBlock>
      </Section>

      <Section title="Como o sync incremental funciona" accent={ACCENT}>
        <p>
          O FTP-Deploy-Action mantém um arquivo de estado (<InlineCode>.ftp-deploy-sync-state.json</InlineCode>) no
          servidor com o hash SHA-256 de cada arquivo enviado. Na próxima execução:
        </p>
        <CodeBlock lang="text">{`# Fluxo do deploy incremental:

1. Action baixa o arquivo de estado do servidor via FTP
   └─ .ftp-deploy-sync-state.json (JSON com hash de cada arquivo)

2. Calcula o hash SHA-256 de cada arquivo local em out/

3. Compara: local ≠ estado?
   ├─ Arquivo novo → UPLOAD
   ├─ Hash diferente → UPLOAD (arquivo mudou)
   └─ Hash igual → SKIP (não envia — economiza tempo e banda)

4. Atualiza o arquivo de estado no servidor

# Na prática (900+ páginas):
# Primeira execução: ~5-10 min (envia tudo)
# Deploy com 2 páginas alteradas: ~15-30s (só envia os 2 arquivos + assets alterados)`}</CodeBlock>
        <Callout tone="success">
          <strong>Por que isso importa:</strong> um site Next.js com 900 módulos gera ~3000-5000 arquivos (HTML + assets por página).
          Sem sync incremental, cada deploy levaria vários minutos de FTP. Com sync, deploys rápidos são a norma.
        </Callout>
      </Section>

      <Section title="Troubleshooting comum" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Páginas retornam 404', v: 'Verifique trailingSlash: true no next.config.ts. O shared hosting procura /pagina/index.html, não /pagina.html.' },
            { k: 'Imagens não carregam', v: 'Confirme images: { unoptimized: true } no next.config.ts. Static export não usa o otimizador de imagens do Next.js.' },
            { k: 'API URL errada no browser', v: 'A variável NEXT_PUBLIC_API_BASE_URL deve ser definida no momento do BUILD, não do deploy. Verifique que está no step de build do workflow.' },
            { k: 'FTP timeout na primeira execução', v: 'Normal — está enviando milhares de arquivos. Aumente o timeout no workflow ou faça o primeiro upload manual.' },
            { k: 'CSS/JS 404 depois do deploy', v: 'Provável que o dangerous-clean-slate esteja apagando assets antigos que ainda são referenciados. Configure exclude patterns para _next/static.' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso usar este mesmo setup com Vercel ou Netlify?"
          a="Não é necessário — Vercel e Netlify têm integração nativa com GitHub e fazem deploy automático por conta própria. O FTP-Deploy-Action é para quando você tem um servidor FTP tradicional (como shared hosting da Hostinger, GoDaddy, etc.)."
        />
        <QAItem
          q="O que colocar no `dangerous-clean-slate`?"
          a="Na primeira configuração, deixe false — não apaga nada no servidor. Depois que o site estiver funcionando corretamente, mude para true para que arquivos removidos localmente também sejam removidos do servidor. Evita acúmulo de arquivos obsoletos."
        />
        <QAItem
          q="Minha API está no backend (VPS) e o frontend estático na Hostinger. Como o frontend faz requisições para a API?"
          a="Via NEXT_PUBLIC_API_BASE_URL. O browser do usuário faz fetch direto para a URL da sua API (ex: https://api.seudominio.com). O frontend estático só serve HTML/JS — as requisições de dados vêm do browser, não do servidor da Hostinger."
        />
      </Section>

      <Callout tone="success">
        <strong>Frontend deployado.</strong> O Next.js com output: export gera um site estático que roda em qualquer servidor.
        O FTP-Deploy-Action sincroniza apenas os arquivos alterados, mantendo deploys rápidos mesmo com centenas de páginas.
        O próximo e último módulo é o Capstone — unindo todos os componentes desta trilha em um checklist de produção completo.
      </Callout>
    </div>
  );
}
