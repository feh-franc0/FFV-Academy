import type { Hub } from './types';

/**
 * Os hubs, no eixo AWS + IA (ago/2026).
 *
 * ## O eixo, escrito uma vez
 *
 * A plataforma ensina **arquitetura de soluções na AWS e IA em produção sobre
 * serviços AWS**. Tudo aqui existe para servir a junção das duas coisas: saber
 * desenhar a arquitetura E saber o que os serviços de IA da AWS fazem por baixo.
 *
 * ## Por que a ordem é esta
 *
 * A lista não é alfabética nem histórica — ela é a resposta a "onde eu começo?".
 * `ia-aws` vem primeiro porque é o destino: é lá que arquitetura e IA se
 * encontram. `aws` vem em seguida porque é o pré-requisito prático. `ia` é o que
 * você precisa saber para que a chamada ao Bedrock seja uma decisão e não um
 * chute. `engenharia` e `fundamentos` sustentam os três de baixo.
 *
 * ## O que saiu, e por quê (ago/2026)
 *
 * O hub `claude-anthropic` foi **retirado**: 49 módulos sobre Claude Code,
 * harness engineering e a certificação Anthropic. Nenhum deles ensinava a
 * desenhar solução de IA na AWS — Claude, no eixo atual, é um modelo que se
 * consome via Bedrock, e `bedrock-claude-na-aws-ecossistema` é onde esse assunto
 * mora. Quatro módulos daquele hub tinham lacuna correspondente do lado AWS
 * (engenharia de prompt, MCP, reasoning) e foram reescritos como conteúdo
 * Bedrock em vez de apagados. Disposição de cada rota em `src/lib/rotas-retiradas.ts`.
 *
 * `dados` foi absorvido por `engenharia` e `programacao` por `fundamentos`: os
 * dois eram hub de quatro e três trilhas cujo assunto é apoio, e hub raso dilui
 * a navegação em vez de organizá-la.
 */
export const HUBS: Hub[] = [
  {
    id: 'hub-ia-aws',
    slug: 'ia-aws',
    name: 'IA na AWS',
    shortName: 'IA na AWS',
    href: '/ia-aws',
    color: '#ff9900',
    icon: '◈',
    tagline:
      'O centro da escola: desenhar, construir e operar soluções de IA sobre Amazon Bedrock e os serviços de IA da AWS.',
    desc: 'Onde arquitetura e IA se encontram. Amazon Bedrock de ponta a ponta (Converse API, Knowledge Bases, Agents e AgentCore, Guardrails, Flows, FinOps), 100 arquiteturas de IA na AWS com a decisão que cada uma ensina, e as duas certificações de IA na AWS: AI Practitioner (AIF-C01) e Machine Learning Engineer Associate (MLA-C01). É o hub que responde "como coloco IA em produção na AWS de forma profissional".',
    trailIds: ['trail-bedrock', 'trail-arq-ia-aws', 'trail-aws-aif', 'trail-mla'],
  },
  {
    id: 'hub-aws',
    slug: 'aws',
    name: 'Arquitetura de Soluções AWS',
    shortName: 'Arquitetura AWS',
    href: '/aws',
    color: '#f78166',
    icon: '☁️',
    tagline:
      'Os 100 laboratórios reproduzíveis de arquitetura AWS, do primeiro deploy à solução com IA — e as certificações que a comprovam.',
    desc: 'A competência de arquiteto, construída laboratório a laboratório: 100 labs em Terraform e .NET 8, do app em ECS Fargate com RDS até arquitetura de IA multirregional, cada um com segurança, observabilidade, escala, custo, injeção de falha e revisão Well-Architected. Mais as certificações que a comprovam: Cloud Practitioner (CLF-C02), Developer Associate (DVA-C02), Solutions Architect Associate (SAA-C03) e Professional (SAP-C03).',
    trailIds: ['trail-labs-aws', 'trail4', 'trail23', 'trail5', 'trail27'],
  },
  {
    id: 'hub-ia',
    slug: 'ia',
    name: 'Fundamentos de IA para construir na AWS',
    shortName: 'Fundamentos de IA',
    href: '/ia',
    color: '#58a6ff',
    icon: '🧠',
    tagline:
      'O que você precisa entender de IA para que a escolha de serviço na AWS seja decisão, e não chute.',
    desc: 'A camada de conhecimento por baixo de toda solução de IA na AWS: como um LLM funciona por dentro, RAG e chunking, padrões agênticos, evals, fine-tuning contra RAG contra prompt, safety e red teaming, multimodal, diffusion, quantização e LLMs locais, e ML clássico. Sem isso, escolher entre Knowledge Bases e retrieval próprio, ou entre fine-tune e prompt, vira sorteio.',
    trailIds: [
      'trail1',
      'trail9',
      'trail25',
      'trail26',
      'trail30',
      'trail-ai-rlhf-agents',
      'trail2',
      'trail3',
      'trail29',
      'trail-diffusion-multimodal',
      'trail-local-llms-edge',
      'trail50',
      'trail55',
    ],
  },
  {
    id: 'hub-engenharia',
    slug: 'engenharia',
    name: 'Produção e Dados para IA',
    shortName: 'Produção',
    href: '/engenharia',
    color: '#e3b341',
    icon: '⚙️',
    tagline:
      'O que sustenta uma solução de IA depois do deploy: SRE, distribuídos, FinOps, segurança e a camada de dados que alimenta o retrieval.',
    desc: 'A engenharia por baixo da arquitetura: MLOps, observabilidade e SRE, sistemas distribuídos, security engineering, FinOps e system design — mais a camada de dados de qualquer RAG: Postgres internals, NoSQL e vector databases, search e information retrieval, e data engineering. Absorveu o antigo hub de Dados, porque dado e operação são o mesmo problema visto de dois lados.',
    trailIds: [
      'trail51',
      'trail11',
      'trail10',
      'trail22',
      'trail28',
      'trail52',
      'trail38',
      'trail54',
      'trail-search-ir-deep',
      'trail24',
    ],
  },
  {
    id: 'hub-fundamentos',
    slug: 'fundamentos',
    name: 'Base técnica',
    shortName: 'Base',
    href: '/fundamentos',
    color: '#8b949e',
    icon: '🧱',
    tagline:
      'Terminal, Git, HTTP, redes, SQL e as linguagens do dia a dia — a base sem a qual nada em cima faz sentido.',
    desc: 'O chão de quem vai construir na AWS: fundamentos técnicos (terminal, filesystem, SSH, Git, HTTP, DNS), SQL e bancos, redes e web (TCP, TLS, HTTPS, WebSocket, CORS), e as linguagens do stack — Python, TypeScript e Go. É hub de apoio: você volta aqui quando falta base, não passa por aqui para chegar lá.',
    trailIds: ['trail12', 'trail14', 'trail16', 'trail36', 'trail19', 'trail47'],
  },
];
