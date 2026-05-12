import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, FlowDiagram, DecisionBox, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('privacy-by-design-arquitetura');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Quem cunhou o termo "Privacy by Design" e em qual contexto histórico?',
    options: [
      'Edward Snowden, após as revelações da NSA em 2013',
      'Ann Cavoukian, Information & Privacy Commissioner de Ontário, nos anos 90 (consolidado em 7 princípios em 2009)',
      'Tim Berners-Lee, ao criar a Web',
      'A própria União Europeia, no draft inicial do GDPR (2012)',
    ],
    correct: 1,
    explanation: 'Ann Cavoukian estruturou o framework. Os 7 princípios viraram referência mundial e foram absorvidos pelo Art. 25 do GDPR ("Data Protection by Design and by Default") e influenciaram o Art. 46 da LGPD.',
  },
  {
    question: 'Qual princípio Cavoukian é tipicamente o MAIS violado por engenheiros sem pensar?',
    options: [
      'Privacidade como configuração padrão',
      'Data minimization — coletar APENAS o estritamente necessário para a finalidade. Engenheiros tendem a coletar "tudo que dê" para "talvez precisar depois".',
      'Funcionalidade total (não trade-off)',
      'Visibilidade e transparência',
    ],
    correct: 1,
    explanation: 'Data minimization é o princípio mais corrosivo na prática. "Vamos guardar o IP por garantia", "vamos pedir o RG também", "vamos logar o request inteiro" — cada decisão default é mais coleta, e mais coleta = mais superfície de risco e LGPD.',
  },
  {
    question: 'Differential Privacy é apropriado para qual cenário?',
    options: [
      'Toda e qualquer operação de tratamento de dados',
      'Análises agregadas ou treinamento de modelos onde a empresa precisa publicar/compartilhar estatísticas mas quer garantia matemática contra reidentificação individual (ex: telemetria de iOS da Apple, modelos federados)',
      'Quando você quer reduzir custo de armazenamento',
      'Apenas em dados financeiros',
    ],
    correct: 1,
    explanation: 'Differential Privacy injeta ruído calibrado (epsilon) em estatísticas agregadas para garantir que a presença/ausência de um indivíduo no dataset não altere significativamente o output. Apple, Google e US Census usam. Para CRUD comum, é overkill.',
  },
  {
    question: 'O que um ADR (Architecture Decision Record) com privacy review deve obrigatoriamente conter?',
    options: [
      'Apenas o desenho técnico da feature',
      'Decisão técnica + base legal LGPD da operação + quais dados pessoais fluem + retention period + riscos identificados + medidas mitigatórias + DPO/sign-off quando aplicável',
      'Apenas a base legal',
      'A lista de bibliotecas usadas',
    ],
    correct: 1,
    explanation: 'O ADR vira artefato de defesa em auditoria. Sem ele, "o time decidiu" não vale nada juridicamente. Com ele, você prova que a decisão foi consciente, fundamentada e aprovada pelos atores certos.',
  },
  {
    question: 'Sobre "Privacy by Default" no contexto de um SaaS B2B:',
    options: [
      'Setting de privacidade mais aberta por default para o usuário "experimentar"',
      'Toda nova feature nasce com a configuração MAIS restritiva por default — usuário precisa explicitamente ativar mais compartilhamento, não desativar. Aplica também para retention (curto por default) e para minimização (campo opcional desligado por default).',
      'Apenas exige checkbox de consentimento',
      'Significa que o produto pode ignorar GDPR/LGPD em modo trial',
    ],
    correct: 1,
    explanation: 'Default seguro é a tradução prática do princípio. Se a feature é "compartilhar projeto com toda a org" e "compartilhar só com convidado", o default é o segundo. Migration de feature existente que afrouxa default = violação direta.',
  },
  {
    question: 'Pseudonimização e anonimização são a mesma coisa?',
    options: [
      'Sim, são sinônimos',
      'Não — pseudonimização é reversível com chave/lookup (ainda é dado pessoal sob LGPD/GDPR); anonimização é irreversível (deixa de ser dado pessoal). K-anonimity e differential privacy são técnicas de anonimização robusta',
      'Anonimização é só hash MD5',
      'Pseudonimização é proibida pela LGPD',
    ],
    correct: 1,
    explanation: 'A diferença é jurídica e técnica. Pseudonimizar (ex: trocar nome por user_42) reduz risco mas continua sendo dado pessoal — você precisa de base legal. Anonimizar de verdade (ex: agregar + adicionar ruído) tira o dado do escopo LGPD. Hash sozinho NÃO anonimiza (rainbow tables).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="privacy-by-design-arquitetura"
      title="Privacy by Design: arquitetura que minimiza desde o ADR"
      icon="🏗️"
      xp={65}
      readTime={13}
      trailName="Privacy & Compliance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="A história — Cavoukian, 1990s, Ontário" accent={accent}>
        <p className="text-sm leading-6">
          <b>Ann Cavoukian</b>, então Information & Privacy Commissioner de Ontário, formalizou nos anos 90 a doutrina que viraria os <b>7 Foundational Principles of Privacy by Design</b>, publicados em 2009. A ideia central: privacidade não é controle <i>post-hoc</i>; é decisão de design desde o primeiro diagrama. Em 2010 a Conferência Internacional de Comissionados de Proteção de Dados adotou os princípios como referência global. O GDPR Art. 25 (<i>Data Protection by Design and by Default</i>) e o Art. 46 da LGPD herdam diretamente.
        </p>
      </Section>

      <Section title="Os 7 princípios — e o que cada um significa no código" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Princípio Cavoukian', 'Tradução para engenheiro']}
          rows={[
            ['1. Proativo, não reativo', 'Antecipe risco antes do incidente — threat modeling antes do PR'],
            ['2. Privacidade como default', 'Setting mais restritivo by default em toda feature nova'],
            ['3. Embutida no design', 'Não é um middleware "no final" — é parte do schema, das APIs, da arquitetura'],
            ['4. Funcionalidade total (não zero-sum)', 'Privacy não é trade-off contra UX/feature; design criativo resolve os dois'],
            ['5. Segurança end-to-end (ciclo de vida)', 'Encrypt at rest + in transit + secure delete + audit em todas as fases'],
            ['6. Visibilidade e transparência', 'Usuário vê o que coletamos, por quê, e por quanto tempo'],
            ['7. Respeito pelo usuário', 'Controle real do usuário sobre seus dados — não dark patterns'],
          ]}
        />
      </Section>

      <Section title="Data minimization — o princípio mais corrosivo na prática" accent={accent}>
        <p className="text-sm leading-6">
          O instinto do engenheiro é guardar tudo: "para debugar", "para analytics", "porque é fácil". O instinto correto é o oposto:
        </p>
        <CodeBlock lang="typescript">{`// ❌ ANTI-PADRÃO — coletar e armazenar tudo "por garantia"
interface UserSignup {
  email: string;
  phone: string;
  cpf: string;          // realmente preciso de CPF para cadastro inicial?
  rg: string;           // não
  birthdate: string;    // a feature pede idade > 18 — não precisa da data exata
  fullAddress: string;  // só CEP basta para shipping inicial
  ip: string;
  userAgent: string;
  fingerprint: string;
  referrer: string;
}

// ✅ Data minimization — só o que serve à finalidade da feature signup
interface UserSignup {
  email: string;        // verificação / canal de comunicação
  isAdult: boolean;     // derivado da entrada, não armazenado em data
  cep: string;          // só CEP, endereço completo só quando comprar
}`}</CodeBlock>
        <Callout tone="warn">
          A pergunta defensiva antes de criar qualquer campo no banco: <b>"Em qual cenário concreto eu vou ler esse campo? Posso derivar quando precisar?"</b> Se a resposta é "talvez no futuro", o campo não deveria existir.
        </Callout>
      </Section>

      <Section title="ADR com privacy review — template" accent={accent}>
        <CodeBlock lang="markdown">{`# ADR-042: Cadastro via OAuth com Google

## Status
Aprovado · 2026-05-15 · DPO: Maria · CISO: João · Tech Lead: Ana

## Contexto
Reduzir fricção no signup. Hoje o usuário preenche 8 campos; queremos ir a 2.

## Decisão
Permitir signup via Google OAuth (escopo: openid, email, profile).

## Privacy Review

**Dados pessoais que fluem**: email, name (do Google), profile picture (URL pública).
**Base legal LGPD**: Art. 7º, IX (legítimo interesse — cadastro do titular no serviço).
**Retention**: enquanto a conta existir + 6 meses pós-cancelamento (logs).
**Transferência internacional**: Google (US) — cláusulas-padrão ANPD nº 19/2024.
**Riscos**:
  - Vazamento da tabela de users (impacto baixo: dados não sensíveis Art. 11)
  - Token Google comprometido (mitigado por refresh rotation + revoke endpoint)
**Medidas mitigatórias**:
  - Pseudonimização: tabela "users" guarda google_sub, não o email no PK
  - Encryption at rest no banco (já existente)
  - Audit log de cada login
**Compliance check**:
  - [x] Política de privacidade atualizada (versão 2026-05)
  - [x] ROPA atualizado (op #042)
  - [x] Banner de consentimento (não necessário — base legal não é consentimento)

## Alternativas consideradas
1. Magic link sem OAuth — descartado: maior taxa de drop-off
2. Signup tradicional com email/senha — mantido como fallback

## Consequências
Aceitas as dependências do Google. Plano de saída: migrar para sub local
caso o usuário queira desvincular Google (feature de "trocar método de login").`}</CodeBlock>
      </Section>

      <Section title="Privacy by Default — a tradução prática" accent={accent}>
        <FlowDiagram
          title="Toda feature nova passa por este filtro"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🟢', label: 'Default mais restritivo', desc: 'Compartilhamento, retention, visibilidade — sempre o menor escopo' },
            { icon: '🔧', label: 'Usuário opta-IN, nunca opta-OUT', desc: 'Para ampliar escopo, ação explícita' },
            { icon: '⏱️', label: 'Retention curto + automação', desc: 'TTL é regra; "para sempre" é exceção justificada' },
            { icon: '📦', label: 'Campos opcionais → desligados', desc: 'Inputs não-essenciais começam ocultos' },
          ]}
        />
      </Section>

      <Section title="Pseudonimização vs anonimização" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Pseudonimização', 'Anonimização']}
          rows={[
            ['Reversível?', 'Sim, com chave', 'Não'],
            ['Continua sendo dado pessoal?', 'Sim — LGPD ainda aplica', 'Não — sai do escopo LGPD'],
            ['Técnica típica', 'Trocar nome por user_42 + lookup table separada', 'k-anonymity, differential privacy, agregação irrestrita'],
            ['Use case', 'Analytics interno, debug', 'Publicar dataset, compartilhar estatística'],
            ['Pegadinha comum', 'Achar que basta hash SHA-256 do email — não basta (rainbow attack + small entropy)', 'Achar que "remover o nome" anonimiza — quasi-identifiers (CEP + idade + gênero) reidentificam'],
          ]}
        />
        <Callout tone="info">
          Latanya Sweeney mostrou em 2000 que 87% da população dos EUA é reidentificável só por (CEP + data de nascimento + gênero). O Massachusetts publicou "anonymized" health records dos funcionários do estado — Sweeney encontrou o registro do governador.
        </Callout>
      </Section>

      <Section title="Differential Privacy — quando vale a complexidade" accent={accent}>
        <p className="text-sm leading-6">
          DP injeta ruído calibrado em estatísticas agregadas. O parâmetro <InlineCode>ε</InlineCode> (epsilon) controla o trade-off privacy ↔ utility — quanto menor, mais privacidade, menos precisão. Apple usa em telemetria do iOS (ε ≈ 2), US Census 2020 usou ε ≈ 19 (e foi criticado por excesso de ruído).
        </p>
        <DecisionBox
          scenario="Quando adotar Differential Privacy?"
          winner="Quando você precisa publicar/treinar com garantia matemática contra reidentificação"
          winnerColor={accent}
          why="DP é a única técnica com prova formal de privacidade. Substitui debates de 'isso é anônimo?' por um número."
          alternatives={[
            { name: 'CRUD interno simples', note: 'overkill — basta minimization + criptografia + access control' },
            { name: 'Compartilhamento com parceiro', note: 'pseudonimização + cláusula contratual já cobre 90% dos casos' },
            { name: 'Modelo ML treinado em dados de clientes', note: 'DP-SGD (TensorFlow Privacy, Opacus) — caso de uso clássico' },
          ]}
        />
      </Section>

      <Section title="Quem revisa o quê — RACI de privacy" accent={accent}>
        <NodeGraph
          title="Responsabilidades por fase"
          accent={accent}
          columns={[
            { label: 'Design / ADR', nodes: [
              { icon: '🏗️', label: 'Engenheiro', sub: 'Escreve ADR + privacy review' },
              { icon: '⚖️', label: 'DPO', sub: 'Aprova base legal + retention', tone: 'emphasis' },
              { icon: '🔐', label: 'CISO', sub: 'Aprova superfície de risco' },
            ]},
            { label: 'Implementação', nodes: [
              { icon: '💻', label: 'Time de produto', sub: 'Executa com defaults seguros' },
              { icon: '🔬', label: 'Security review', sub: 'Threat model, code review' },
              { icon: '🧪', label: 'QA', sub: 'Testes de minimização e retention' },
            ]},
            { label: 'Operação', nodes: [
              { icon: '📋', label: 'DPO', sub: 'Atualiza ROPA + RIPD se mudou', tone: 'emphasis' },
              { icon: '📊', label: 'SRE', sub: 'Audit log + alertas' },
              { icon: '👤', label: 'Suporte', sub: 'Atende solicitações de titular (Art. 18)' },
            ]},
          ]}
        />
      </Section>

      <Section title="Fechando a trilha" accent={accent}>
        <p className="text-sm leading-6">
          Os 9 módulos anteriores cobriram a tubulação: bases legais, DPIA, PII discovery, criptografia, audit log, right to erasure, transferência internacional, secret scanning, incident response. Este 10º é a <b>regra que muda como você projeta sistemas</b>: privacidade entra no diagrama no minuto 1, não no relatório pós-vazamento. A diferença entre uma empresa que paga multa de 2% do faturamento e outra que passa intacta pela ANPD não é a sorte — é <i>arquitetura</i>.
        </p>
        <Callout tone="success" icon="🎓">
          Você acabou a trilha Privacy & Compliance Engineering. Próximo passo: implementar o framework completo no seu produto e treinar o time. O badge <b>Privacy Engineer</b> está desbloqueado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
