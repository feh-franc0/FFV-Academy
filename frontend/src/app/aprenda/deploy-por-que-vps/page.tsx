import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('deploy-por-que-vps');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a principal vantagem do modelo IaaS (VPS) em comparação com PaaS como Railway?',
    options: [
      'O IaaS é sempre mais barato que qualquer PaaS',
      'O IaaS dá controle total sobre o sistema operacional, rede e runtime, permitindo configurações que PaaS não expõe',
      'O IaaS não exige conhecimento de Linux',
      'O IaaS tem deploy automático incluído por padrão',
    ],
    correct: 1,
    explanation:
      'No IaaS você gerencia tudo desde o SO até o runtime — mais responsabilidade, mas controle total. PaaS abstrai essa camada: você entrega código e a plataforma cuida do resto. A desvantagem do PaaS é a perda de controle e o custo que escala rapidamente.',
  },
  {
    question: 'Uma startup com tráfego imprevisível que precisa escalar de zero a milhares de requisições em segundos. Qual modelo é mais indicado?',
    options: [
      'VPS dedicada com 8 CPUs sempre ligada',
      'Serverless (Lambda, Vercel Functions) — paga por invocação, escala automaticamente para zero e para picos',
      'Shared hosting pois é o mais barato',
      'Docker Swarm em bare metal',
    ],
    correct: 1,
    explanation:
      'Serverless é ideal para tráfego altamente variável: você não paga quando não há requisições e escala automaticamente. A desvantagem é o cold start e o vendor lock-in. Para carga constante e previsível, VPS ou containers são mais econômicos.',
  },
  {
    question: 'Uma VPS de €5/mês na Hostinger vs Railway no plano Starter ($5/mês). Qual a diferença prática?',
    options: [
      'São equivalentes em tudo',
      'A VPS dá uma máquina Linux completa com recursos fixos; Railway dá uma plataforma gerenciada mas com limites de horas de execução e recursos compartilhados',
      'Railway é sempre mais caro que VPS',
      'VPS inclui domínio e SSL automático',
    ],
    correct: 1,
    explanation:
      'A VPS tem recursos fixos (RAM, CPU, disco) garantidos e disponíveis 24h. Railway e similares cobram por uso e têm limites de horas de execução no plano gratuito/starter. Para aplicações que rodam continuamente, a VPS costuma ser mais previsível em custo.',
  },
  {
    question: 'Qual é o principal risco do Serverless para uma API que faz queries pesadas no banco?',
    options: [
      'Serverless não suporta banco de dados',
      'Cold start e timeout de execução curto — funções ficam "frias" e a primeira invocação pode demorar, além de limites de tempo de execução (ex: 30s no Vercel)',
      'Serverless só funciona com JavaScript',
      'Custo fixo muito alto independente de uso',
    ],
    correct: 1,
    explanation:
      'Cold start ocorre quando a função não foi invocada recentemente e precisa ser inicializada — pode adicionar 500ms a vários segundos de latência. Queries pesadas + timeout curto é uma combinação perigosa. Para APIs com queries longas, VPS ou containers são mais adequados.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="deploy-por-que-vps"
      title="Por que VPS? IaaS vs PaaS vs Serverless"
      icon="🤔"
      xp={45}
      readTime={10}
      trailName="Deploy Full Stack: VPS, Docker e CI/CD"
      trailColor={ACCENT}
      nextSlug="vps-primeiro-servidor"
      nextTitle="Provisionando sua primeira VPS na Hostinger"
      relatedSlugs={['vps-primeiro-servidor', 'docker-completo', 'github-actions-cicd']}
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
        Antes de provisionar qualquer servidor, você precisa entender o <strong>mapa do território</strong>. O mercado de cloud tem
        três modelos fundamentais — IaaS, PaaS e Serverless — e escolher o errado significa pagar muito mais do que deveria,
        ou ter menos controle do que precisa. Este módulo explica a diferença real entre cada modelo, quando cada um faz sentido
        e por que a VPS (IaaS) ainda é a melhor escola para quem quer entender deploy de verdade.
      </p>

      <Section title="Os três modelos: o que você gerencia em cada um" accent={ACCENT}>
        <p>
          A forma mais clara de entender IaaS, PaaS e Serverless é olhar para o que <strong>você</strong> gerencia versus o que
          o provedor gerencia:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Camada', 'IaaS (VPS)', 'PaaS (Railway/Render)', 'Serverless (Lambda/Vercel)']}
          rows={[
            ['Hardware físico', 'Provedor', 'Provedor', 'Provedor'],
            ['Rede física', 'Provedor', 'Provedor', 'Provedor'],
            ['Virtualização', 'Provedor', 'Provedor', 'Provedor'],
            ['Sistema operacional', '✅ Você', 'Provedor', 'Provedor'],
            ['Runtime (Node, Python…)', '✅ Você', 'Você define, provedor gerencia', 'Provedor (versão limitada)'],
            ['Middleware / Servidor web', '✅ Você', 'Opcional', 'Abstraído'],
            ['Deploy e scaling', '✅ Você', 'Provedor', 'Provedor'],
            ['Código da aplicação', '✅ Você', '✅ Você', '✅ Você'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra geral:</strong> quanto mais o provedor gerencia, menos você aprende — mas menos você precisa se preocupar
          com infraestrutura. IaaS é a escola; PaaS é a produtividade; Serverless é a especialização.
        </Callout>
      </Section>

      <Section title="IaaS: Infrastructure as a Service (VPS)" accent={ACCENT}>
        <p>
          Uma VPS (Virtual Private Server) é uma máquina virtual Linux alocada exclusivamente para você. Você recebe um IP,
          acesso root via SSH e recursos garantidos (CPU, RAM, disco). O que acontece a partir daí é responsabilidade sua:
          instalar pacotes, configurar serviços, gerenciar usuários, aplicar patches de segurança.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Exemplos', v: 'Hostinger VPS, DigitalOcean Droplets, Linode, Hetzner, AWS EC2, GCP Compute Engine, Azure VMs' },
            { k: 'Controle', v: 'Total — root access, qualquer distro Linux, qualquer software' },
            { k: 'Preço', v: '€3–€20/mês para projetos pequenos/médios — custo fixo e previsível' },
            { k: 'Responsabilidade', v: 'Segurança do SO, atualizações, backups, monitoramento, scaling manual' },
            { k: 'Ideal para', v: 'Aprendizado, MVPs com custo controlado, apps com carga previsível, projetos que precisam de controle fino' },
          ]}
        />
        <CodeBlock lang="bash">{`# Tudo que você pode fazer numa VPS que PaaS não deixa:
# Instalar qualquer software (fail2ban, ffmpeg, sqlite, etc.)
apt install fail2ban ffmpeg sqlite3

# Configurar Nginx manualmente (rate limiting customizado, headers de segurança)
vim /etc/nginx/sites-available/meu-app

# Rodar Docker com configurações específicas
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE meu-app:1.0

# Gerenciar firewall no nível do kernel
ufw allow 443/tcp
ufw deny 22/tcp

# Agendar tarefas (cron, systemd timers)
crontab -e`}</CodeBlock>
      </Section>

      <Section title="PaaS: Platform as a Service" accent={ACCENT}>
        <p>
          No PaaS você entrega código (ou um Dockerfile) e a plataforma cuida do deploy, scaling, roteamento e certificados SSL.
          O trade-off é claro: menos controle, menos configuração, mais velocidade.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Exemplos', v: 'Railway, Render, Heroku, Fly.io, Google App Engine, AWS Elastic Beanstalk' },
            { k: 'Deploy', v: 'git push → deploy automático (Railway/Heroku) ou Dockerfile detectado automaticamente' },
            { k: 'SSL', v: 'Automático e gratuito em quase todos' },
            { k: 'Scaling', v: 'Horizontal automático em alguns planos, mas custa mais' },
            { k: 'Limitações', v: 'Não tem acesso root, não pode instalar pacotes do sistema, configurações de rede limitadas' },
            { k: 'Preço', v: 'Escala com uso — pode surpreender no final do mês com picos de tráfego' },
          ]}
        />
        <Callout tone="warn">
          <strong>Armadilha do PaaS:</strong> Railway e Render têm planos gratuitos com limites de horas de execução (ex: 500h/mês).
          Uma aplicação que roda 24/7 usa ~720h/mês — já passa o limite. No plano pago, o preço por hora de uso pode sair mais caro
          que uma VPS dedicada para aplicações com carga constante.
        </Callout>
      </Section>

      <Section title="Serverless: paga por invocação" accent={ACCENT}>
        <p>
          Serverless é o modelo onde seu código roda em resposta a eventos (requisições HTTP, mensagens de fila, etc.) e você
          paga por invocação e tempo de execução, não por servidor ligado. Não existe &ldquo;servidor ocioso&rdquo; — quando não
          há tráfego, não há custo.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Exemplos', v: 'AWS Lambda, Vercel Functions, Cloudflare Workers, Google Cloud Functions, Azure Functions' },
            { k: 'Escala para zero', v: 'Sem tráfego = sem custo. Ideal para cargas muito intermitentes.' },
            { k: 'Cold start', v: 'Primeira invocação após período sem uso tem latência extra (100ms a vários segundos dependendo da runtime)' },
            { k: 'Limite de tempo', v: 'Vercel: 10–60s. Lambda: até 15min. Não é para tarefas longas.' },
            { k: 'Vendor lock-in', v: 'Alto — APIs proprietárias dificultam migração' },
            { k: 'Ideal para', v: 'Webhooks, APIs com tráfego muito variável (zero a picos), edge computing' },
          ]}
        />
        <CodeBlock lang="javascript">{`// Vercel Function — arquivo src/app/api/webhook/route.ts
// Deploy automático, SSL automático, zero config de servidor
export async function POST(request: Request) {
  const payload = await request.json();
  // Processa webhook...
  return Response.json({ ok: true });
}

// Problema: se o processamento demorar > 10s (plano Hobby) ou
// > 60s (plano Pro), a função é encerrada abruptamente.
// Para webhooks simples: perfeito. Para processamento pesado: ruim.`}</CodeBlock>
      </Section>

      <Section title="Comparativo de custo real" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Cenário', 'VPS €5/mês', 'PaaS (Railway Starter)', 'Serverless']}
          rows={[
            ['App rodando 24/7, baixo tráfego', '€5 fixo ✅', '~$5–15 (horas de compute)', 'Quase zero (poucas invocações)'],
            ['API com picos esporádicos', '€5 fixo (recurso ocioso)', 'Escala automático', 'Ideal — paga só pelo pico ✅'],
            ['10 apps diferentes', '€5 total (multi-app no mesmo servidor) ✅', '$50+ (um serviço por app)', 'Paga por função separada'],
            ['Precisar de PostgreSQL', 'Instala no servidor (grátis) ✅', '$5–15 adicional por banco', 'Banco separado obrigatório'],
            ['Precisar de cron jobs', 'Crontab nativo ✅', 'Serviço separado ou pago', 'EventBridge (AWS) ou workaround'],
          ]}
        />
        <Callout tone="success">
          <strong>Insight prático:</strong> uma VPS de €5/mês pode rodar uma API Go, um banco PostgreSQL, Redis, Nginx e até 3-4
          apps pequenas ao mesmo tempo. No PaaS, cada serviço tem seu próprio custo. Para MVPs que têm múltiplos componentes,
          a VPS costuma ser 3-5× mais barata.
        </Callout>
      </Section>

      <Section title="Quando escolher cada modelo" accent={ACCENT}>
        <DecisionBox
          scenario="Quero aprender deploy e entender como tudo funciona por baixo"
          winner="VPS (IaaS)"
          winnerColor={ACCENT}
          why="Você gerencia o SO, configura o Nginx, instala certificados, escreve o pipeline CI/CD. É mais trabalho, mas você aprende de verdade. PaaS abstrai tudo isso — ótimo para produtividade, ruim para aprendizado."
          alternatives={[
            { name: 'PaaS', note: 'você entrega código e pronto — mas não sabe o que aconteceu.' },
          ]}
        />
        <DecisionBox
          scenario="MVP de SaaS com equipe pequena, prazo curto, precisa ir ao ar essa semana"
          winner="PaaS (Railway ou Render)"
          winnerColor={ACCENT}
          why="Deploy em minutos com git push, SSL automático, banco de dados gerenciado. Foco no produto, não na infra. Migre para VPS quando fizer sentido economicamente."
          alternatives={[
            { name: 'VPS', note: 'possível, mas leva dias para configurar corretamente.' },
            { name: 'Serverless', note: 'se a arquitetura se encaixar, pode ser ótimo.' },
          ]}
        />
        <DecisionBox
          scenario="Webhook que recebe notificações do Stripe/GitHub — pouquíssimas chamadas por dia"
          winner="Serverless"
          winnerColor={ACCENT}
          why="5000 invocações/mês no Lambda custam cents. Manter uma VPS ligada para processar 10 webhooks por dia é desperdício. Serverless é perfeito para cargas muito esparsas."
          alternatives={[
            { name: 'VPS já existente', note: 'se já tem uma VPS rodando outros serviços, adicione o webhook lá.' },
          ]}
        />
      </Section>

      <Section title="Por que VPS é a melhor escola" accent={ACCENT}>
        <p>
          Este módulo faz parte de uma trilha que usa VPS como base de aprendizado — não por ideologia, mas por pedagogia.
          Quando você configura tudo manualmente, você entende:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Por que o Nginx existe', v: 'Porque você vai precisar dele para servir o frontend estático e rotear para a API' },
            { k: 'Por que SSL é complexo', v: 'Porque você vai renovar certificados manualmente e entender o protocolo ACME' },
            { k: 'Por que CI/CD importa', v: 'Porque fazer deploy manual na VPS via SSH é doloroso e propenso a erros' },
            { k: 'Por que Docker ajuda', v: 'Porque você vai ver o caos de gerenciar dependências diretamente no SO' },
            { k: 'Por que segurança é crítica', v: 'Porque bots varrem seu IP em minutos depois que a VPS sobe' },
          ]}
        />
        <Callout tone="info">
          Ao final desta trilha, você vai entender o que Railway, Render e Vercel fazem por baixo dos panos. Isso te torna
          um profissional melhor — independente de qual plataforma você use no trabalho.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Preciso saber Linux para usar VPS?"
          a="Sim, o mínimo. Mas o mínimo é menos do que você imagina: navegação de diretórios (cd, ls), edição de arquivos (nano ou vim básico), gerenciamento de pacotes (apt) e leitura de logs. Esta trilha vai te ensinar tudo que você precisa conforme avança."
        />
        <QAItem
          q="VPS é segura? Meu servidor vai ser hackeado?"
          a="Bots varrem IPs novos em minutos. Sem configurações mínimas (desativar root SSH, fail2ban, firewall), você vai ver tentativas de invasão nos logs em poucas horas. O próximo módulo de segurança cobre exatamente isso."
        />
        <QAItem
          q="Devo usar DigitalOcean, Hetzner ou Hostinger?"
          a="Para aprendizado, a diferença é pequena. Hostinger tem planos mais baratos para iniciantes (€3-5/mês), Hetzner tem ótimo custo-benefício para Europa, DigitalOcean tem a melhor documentação. Esta trilha usa Hostinger nos exemplos, mas os comandos são idênticos em qualquer provedor Linux."
        />
      </Section>

      <Callout tone="success">
        <strong>Resumo.</strong> IaaS (VPS) = controle total + responsabilidade total + custo fixo e previsível. PaaS = abstração,
        velocidade, mas custo que escala e menos controle. Serverless = ideal para cargas esporádicas, zero custo em repouso, mas
        cold start e vendor lock-in. Para aprender deploy de verdade: VPS. Para ir ao ar rápido: PaaS. Para webhooks e eventos
        esporádicos: Serverless. O próximo módulo: mão na massa — provisionar a VPS.
      </Callout>
    </div>
  );
}
