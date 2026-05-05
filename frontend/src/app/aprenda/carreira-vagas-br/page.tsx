import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('carreira-vagas-br');

const ACCENT = '#34d399';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que aplicar diretamente para vagas publicadas é a estratégia menos eficaz?',
    options: [
      'Porque o LinkedIn não mostra vagas reais',
      'Porque 62% das vagas são preenchidas antes de serem publicadas (mercado oculto) — via indicação, networking, ou recrutadores ativos. Quem só aplica para vagas abertas compete com 100-500 candidatos por posição',
      'Porque empresas brasileiras preferem indicações de consultorias',
      'Porque o processo de aplicação online raramente chega a um humano',
    ],
    correct: 1,
    explanation:
      'O "mercado oculto" de vagas existe porque contratar via indicação é mais rápido, mais barato e tem menor risco percebido para a empresa. A estratégia mais eficaz: networking direto com pessoas nas empresas alvo + sinalização de disponibilidade para recrutadores no LinkedIn. Aplicar para vagas abertas ainda vale — mas como complemento, não como estratégia principal.',
  },
  {
    question: 'Qual configuração do LinkedIn aumenta mais a visibilidade para recrutadores?',
    options: [
      'Ter mais de 500 conexões — o algoritmo prioriza perfis com mais conexões',
      '"Open to Work" visível para recrutadores (não público), headline com palavras-chave específicas da vaga alvo, e seção de skills com as 5 mais relevantes para a área — esses três elementos alimentam o algoritmo de matching do LinkedIn Recruiter',
      'Publicar conteúdo todos os dias para aumentar engajamento do perfil',
      'Premium do LinkedIn — recrutadores só conseguem ver perfis premium',
    ],
    correct: 1,
    explanation:
      'LinkedIn Recruiter usa busca por palavras-chave + filtros. Se sua headline diz "Desenvolvedor" mas a vaga busca "Backend Engineer Go", você não aparece. Solução: pesquise 10 vagas do seu alvo, identifique as palavras-chave comuns, e incorpore nas seções de headline, About, e skills. "Open to Work" para recrutadores (não público) sinaliza disponibilidade sem alertar empregador atual.',
  },
  {
    question: 'Como personalizar o currículo para cada vaga de forma eficiente?',
    options: [
      'Enviar o mesmo currículo para todas as vagas — personalização não vale o tempo',
      'Manter um currículo base e ajustar: headline (espelhar título da vaga), bullet points de experiência (priorizar os mais relevantes para a vaga), e skills (ordenar por relevância). 15-20 minutos por aplicação vs horas reescrevendo do zero',
      'Reescrever o currículo completamente para cada vaga',
      'Personalização só vale para vagas em empresas grandes — startups não ligam',
    ],
    correct: 1,
    explanation:
      'ATS (Applicant Tracking Systems) usados por 98% das grandes empresas brasileiras fazem matching por palavras-chave. Se a vaga pede "experiência com microsserviços" e seu currículo diz "arquitetura distribuída", pode não fazer match mesmo sendo equivalente. Estratégia: use as palavras exatas da descrição da vaga nos seus bullets. Mantenha versão base + template de personalização.',
  },
  {
    question: 'Qual a melhor abordagem para vagas em empresas que você realmente quer trabalhar?',
    options: [
      'Aplicar pelo site oficial e aguardar contato — processo padrão garante igualdade',
      'Aplicar pela plataforma oficial + entrar em contato direto com alguém da empresa no LinkedIn (não o recrutador — um engenheiro ou PM da área) + mencionar algo específico sobre o produto ou trabalho deles',
      'Só aplicar quando tiver indicação interna — sem indicação a taxa de sucesso é próxima de zero',
      'Enviar e-mail direto para o CEO ou CTO — demonstra proatividade',
    ],
    correct: 1,
    explanation:
      'Aplicação dupla: processo oficial garante que você está no sistema; contato direto com engenheiro da área cria contexto humano. A mensagem ideal: "Vi a vaga de X, apliquei pelo site. Trabalhei em [projeto relacionado] que resolve um problema similar ao Y que vocês têm — posso compartilhar? Seria útil ouvir sua perspectiva sobre como a equipe trabalha." Taxa de resposta: 25-40% vs ~3% de aplicação sozinha.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="carreira-vagas-br"
      title="Vagas no Brasil: onde procurar e como se destacar em 2026"
      icon="🎯"
      xp={65}
      readTime={11}
      trailName="Carreira Digital"
      trailColor={ACCENT}
      nextSlug="carreira-trabalho-remoto"
      nextTitle="Trabalho Remoto: produtividade e visibilidade"
      relatedSlugs={['carreira-portfolio-digital', 'comunicacao-networking', 'carreira-entrevista-br']}
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
        O mercado tech brasileiro tem mais de 800 mil vagas abertas com escassez crônica de profissionais
        qualificados (Brasscom 2025). Mesmo assim, muita gente não consegue entrevistas — porque usa
        estratégia errada. Este módulo mostra onde encontrar vagas reais, como aparecer para recrutadores,
        e como aumentar a taxa de conversão de aplicação para entrevista.
      </p>

      <Section title="Onde as vagas estão no Brasil" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Plataforma', 'Tipo de vaga', 'Dica específica']}
          rows={[
            ['LinkedIn Jobs', 'Todas — mais completa', 'Alertas com palavras-chave + aplicar nos primeiros 10min de publicação'],
            ['Gupy', 'Grandes empresas BR (Nubank, iFood, etc)', 'Criar perfil completo — ATS interno usa ele diretamente'],
            ['VAGAS.com', 'Mercado nacional consolidado', 'Vagas mais antigas mas empresas tradicionais que não usam LinkedIn'],
            ['GeekHunter', 'Devs — matching automático', 'Perfil completo com stack → recrutadores chegam até você'],
            ['Programathor', 'Dev BR + remoto', 'Foco em startups e empresas de produto'],
            ['Turing / Toptal', 'Remoto internacional $$$', 'Processo seletivo rigoroso — prepare-se com meses de antecedência'],
            ['Twitter/X #vagas', 'Startups early-stage', 'Seguir founders e CTOs de startups do BR'],
            ['Indicação direta', '62% das contratações', 'A estratégia mais eficaz — construir networking antes de precisar'],
          ]}
        />
      </Section>

      <Section title="Como o ATS funciona e como passar pelo filtro" accent={ACCENT}>
        <Callout tone="info">
          98% das grandes empresas brasileiras usam ATS (Gupy, Greenhouse, Lever). O sistema faz
          matching por palavras-chave entre a descrição da vaga e seu currículo. Solução: identifique
          as 5-10 palavras-chave mais frequentes na vaga e certifique-se de que aparecem no seu currículo.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Erro comum no currículo', 'Impacto', 'Solução']}
          rows={[
            ['Palavras diferentes para mesma habilidade', 'ATS não faz match', 'Use os termos exatos da vaga'],
            ['PDF com tabelas complexas', 'ATS extrai texto incorretamente', 'PDF simples, uma coluna'],
            ['Responsabilidades sem resultado', 'Não diferencia dos outros 500', '"Reduzi X em Y% implementando Z"'],
            ['Skills genéricas', 'Não aparece em buscas específicas', 'Liste frameworks e versões: "Go 1.22, gRPC, Kafka"'],
            ['Foto no currículo (EUA/Europa)', 'Viés inconsciente ou requisito legal', 'No BR é comum; fora do BR evite'],
          ]}
        />
      </Section>

      <Section title="Estratégia de candidatura por tipo de empresa" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de empresa', 'O que mais importa', 'Estratégia']}
          rows={[
            ['Big Tech (Google, Meta, AWS BR)', 'Algoritmos, system design, cultura', 'LeetCode medium/hard + system design 3 meses antes'],
            ['Unicórnio BR (Nubank, iFood)', 'Projeto real, ownership, impacto', 'Portfólio com métricas + narrativa de impacto'],
            ['Startup série A/B', 'Versatilidade, velocidade, fit cultural', 'GitHub ativo + conversa direta com CTO ou eng sênior'],
            ['Consultoria/SI (Accenture, CI&T)', 'Certificações, comunicação com cliente', 'AWS/Google certs + experiência com cliente'],
            ['Remoto internacional', 'Inglês fluente + fuso horário', 'Turing, Toptal, LinkedIn em inglês'],
          ]}
        />
        <DecisionBox
          scenario="Conseguir primeira entrevista em empresa de produto (não consultoria)"
          winner="Candidatura dupla: aplicação oficial + contato direto com engenheiro da área"
          winnerColor={ACCENT}
          why="A aplicação garante que você está no sistema. O contato humano cria contexto e contexto aumenta 8x a chance de chegar na entrevista vs aplicação fria sozinha."
          alternatives={[
            { name: 'Indicação interna', note: 'Mais eficaz de todas — peça a um conhecido que trabalha lá para fazer indicação formal' },
            { name: 'Hackathon/evento da empresa', note: 'Muitas empresas recrutam participantes de hackathons diretamente — acesso sem ATS' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Quantas vagas devo aplicar por semana para ter resultado?"
          a={<>Qualidade supera quantidade. 5 aplicações bem feitas (currículo personalizado + pesquisa da empresa + contato direto) superam 50 aplicações genéricas. Métricas a monitorar: taxa de resposta (mínimo 20% significa que seu perfil e currículo estão alinhados com o alvo), taxa de conversão para entrevista técnica, e tempo médio até oferta. Se taxa de resposta for abaixo de 10%, revise posicionamento e palavras-chave antes de aplicar mais.</>}
        />
        <QAItem
          q="Vale a pena aplicar para vagas que pedem requisitos que não tenho completamente?"
          a={<>Sim — estudos mostram que mulheres aplicam apenas quando atendem 100% dos requisitos; homens aplicam quando atendem 60%. A realidade: listas de requisitos são ideais, não obrigatórias. Se você atende 70-80% do que é realmente essencial (não "desejável"), aplique. Identifique os 3-4 requisitos inegociáveis da vaga e certifique-se de que você os tem. O restante pode ser compensado com portfólio forte e vontade de aprender.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> 62% das vagas são preenchidas antes de serem publicadas — networking
        é a estratégia principal, não complementar. ATS usa palavras-chave: espelhe os termos da vaga
        no currículo. Candidatura dupla (aplicação oficial + contato direto) multiplica chances em 8x.
        5 aplicações personalizadas superam 50 genéricas. Para grandes empresas: prepare-se 3 meses antes,
        não espere a vaga abrir.
      </Callout>
    </div>
  );
}
