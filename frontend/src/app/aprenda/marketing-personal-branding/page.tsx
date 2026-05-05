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
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('marketing-personal-branding');

const ACCENT = '#a78bfa';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é personal branding e por que importa para profissionais técnicos?',
    options: [
      'Apenas para influencers e criadores de conteúdo',
      'É a percepção que outros têm sobre você profissionalmente. Em mercado saturado, especialista reconhecido pelo nome ganha mais oportunidades, cobra mais caro, e tem capital social transferível entre empresas. "Pessoa anônima excelente" perde para "pessoa visível boa"',
      'Postar selfies e momentos pessoais nas redes sociais',
      'Substituto para currículo tradicional',
    ],
    correct: 1,
    explanation:
      'Personal branding é capital intangível: profissionais com presença reconhecida têm CAC (custo de aquisição de oportunidade) próximo de zero — recrutadores, clientes e parceiros chegam até eles. Para tech: dev anônimo competente compete com 500 candidatos por vaga. Dev com presença reconhecida no nicho recebe 3-5 oportunidades por trimestre sem aplicar. Diferença salarial: 30-80% para mesmo nível técnico (LinkedIn Salary Insights 2024).',
  },
  {
    question: 'Qual é o erro fundamental que destrói a maioria das tentativas de personal brand?',
    options: [
      'Não postar com frequência suficiente',
      'Querer agradar todo mundo — diluir a mensagem para não ofender ninguém. Personal brand forte tem opinião clara, especialidade definida, e público-alvo específico. "Tudo para todos" não atrai ninguém em particular',
      'Não investir em design profissional do perfil',
      'Postar conteúdo técnico demais',
    ],
    correct: 1,
    explanation:
      'A regra dos 1000 fãs verdadeiros: melhor 1.000 pessoas que te conhecem profundamente que 100k seguidores indiferentes. Para isso, você precisa POLARIZAR — ter opiniões, escolher lados, dizer "eu acredito X mesmo se X for impopular". Quem tenta agradar todos vira ruído de fundo. Exemplos: "Vamos contra microsserviços para times pequenos", "TDD é overrated em startups", "Português brasileiro precisa de mais conteúdo técnico avançado".',
  },
  {
    question: 'Como descobrir seu posicionamento único como profissional?',
    options: [
      'Copiar o posicionamento de criadores de sucesso na sua área',
      'Cruzar 3 elementos: (1) o que você sabe fazer melhor que 90%; (2) sobre o que você fala com energia genuína; (3) qual problema específico você resolve para que público específico. Posicionamento = interseção dos três',
      'Escolher o nicho com maior demanda no mercado',
      'Tentar ser conhecido em múltiplas áreas',
    ],
    correct: 1,
    explanation:
      'Posicionamento = competência única + paixão + demanda. Sem competência, vira impostor. Sem paixão, abandona em 6 meses. Sem demanda, ninguém liga. Exemplo prático: "Ensino devs sêniors a falar de carreira sem soar arrogante" é melhor que "ajudo profissionais a crescer". Frase de posicionamento: "Eu ajudo [PÚBLICO] a [RESULTADO] através de [MÉTODO]". Refinar essa frase em 1 parágrafo é exercício mais importante de personal brand.',
  },
  {
    question: 'Quanto tempo leva para construir personal brand reconhecida?',
    options: [
      'Em 30 dias com posts diários é possível',
      '12-24 meses de consistência para reconhecimento no nicho. Crescimento exponencial: meses 1-6 quase invisível, meses 7-12 começa a ganhar tração, meses 13-24 oportunidades começam a chegar sem esforço. Quem desiste no mês 6 perde o investimento — é exatamente quando começaria a render',
      'Apenas com investimento em ads pagos',
      'Personal branding é instantâneo se o conteúdo for bom',
    ],
    correct: 1,
    explanation:
      'Curva real de personal branding: meses 1-3 (zero engagement, sensação de gritar no vazio), meses 4-6 (começa a ter pequena audiência fiel), meses 7-12 (algoritmos começam a empurrar, posts viralizam ocasionalmente), meses 13-24 (oportunidades chegam sem esforço, reconhecimento no nicho). 80% das pessoas desistem antes do mês 6 — exatamente quando começaria a render. Consistência é mais importante que talento.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="marketing-personal-branding"
      title="Personal Branding: construir autoridade profissional em 2026"
      icon="✨"
      xp={70}
      readTime={13}
      trailName="Marketing Digital"
      trailColor={ACCENT}
      nextSlug="marketing-conteudo-autoridade"
      nextTitle="Conteúdo de Autoridade: virar referência no nicho"
      relatedSlugs={['conteudo-linkedin-criador', 'comunicacao-storytelling', 'carreira-portfolio-digital']}
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
        Personal branding em 2026 não é vaidade — é estratégia profissional. Pesquisa da Edelman 2024:
        78% dos compradores B2B confiam mais em pessoas que em marcas. Para profissionais técnicos,
        personal brand é o multiplicador silencioso da carreira: mesma habilidade técnica, salário
        50%+ maior. Esta aula mostra como construir presença autêntica e estratégica.
      </p>

      <Section title="Encontrando seu posicionamento único" accent={ACCENT}>
        <CodeBlock lang="markdown">{`# Framework de Posicionamento (responda em 1 frase cada)

[1] PARA QUEM você fala?
"Eu ajudo desenvolvedores backend brasileiros..."

[2] QUAL transformação você entrega?
"...a sair de pleno para sênior..."

[3] COMO você é diferente?
"...através de internals e fundamentos profundos, não atalhos."

# Frase de posicionamento completa
"Eu ajudo desenvolvedores backend brasileiros a sair de pleno
para sênior através de internals e fundamentos profundos —
sem cair na armadilha dos atalhos e dicas superficiais."

# Teste de qualidade do posicionamento
✓ Específico: público (não "todos os devs")
✓ Diferente: método (não "geral")
✓ Contraste: o que você NÃO faz
✓ Crível: você tem credenciais para isso?`}</CodeBlock>
        <Callout tone="info">
          <strong>Reposicionamento:</strong> seu posicionamento vai evoluir. Tudo bem. Comece com algo
          claro mesmo que imperfeito. Refine a cada 6 meses com base em feedback real (quem te
          procura, sobre o quê, e por quê).
        </Callout>
      </Section>

      <Section title="Os 4 pilares de personal brand profissional" accent={ACCENT}>
        <LayerStack
          title="Pilares essenciais para autoridade no nicho"
          accent={ACCENT}
          separatorLabel="constrói sobre →"
          layers={[
            { label: 'Posicionamento claro', content: 'Frase de 1 linha que diz o que você faz e para quem', note: 'fundação', tone: 'writable' },
            { label: 'Conteúdo consistente', content: '3-5 posts/semana sobre seu tema central + ocasionais variações', tone: 'writable' },
            { label: 'Provas concretas', content: 'Casos, resultados, depoimentos, projetos — não só opinião', tone: 'writable' },
            { label: 'Rede ativa', content: 'Comentários genuínos em posts da área, conexões com pares e mentores', tone: 'writable' },
            { label: 'Produto signature', content: 'Curso, livro, framework, ferramenta que carrega seu nome', note: 'topo da pirâmide', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Plano de conteúdo dos 4 quadrantes" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', '% do conteúdo', 'Exemplo']}
          rows={[
            ['Educacional (HOW)', '40%', '"Como X resolve Y" — gera saves e autoridade'],
            ['Opinião (WHY)', '30%', '"Por que penso diferente sobre X" — gera comentários'],
            ['Pessoal/Story', '20%', '"Errei em X, aprendi Y" — gera conexão humana'],
            ['Promocional', '10%', 'Curso, mentoria, projeto — gera vendas'],
          ]}
        />
        <DecisionBox
          scenario="Começar personal brand do zero como profissional técnico"
          winner="LinkedIn como canal principal + 3 posts/semana + 12 meses de compromisso"
          winnerColor={ACCENT}
          why="LinkedIn tem maior ROI para técnicos B2B (recrutadores, clientes empresariais). 3 posts/semana é sustentável e suficiente para crescimento. 12 meses é quando resultados começam — antes disso é construção. Outras redes (Twitter/X, YouTube) podem ser secundárias."
          alternatives={[
            { name: 'Newsletter (Substack/Beehiv)', note: 'Para quem prefere texto longo e profundo, audiência mais engajada mas crescimento mais lento' },
            { name: 'YouTube como canal principal', note: 'Maior potencial de receita, mas exige produção visual — não comece aqui se nunca gravou' },
          ]}
        />
      </Section>

      <Section title="Métricas de saúde de personal brand" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'Como medir', 'Meta saudável']}
          rows={[
            ['Crescimento de seguidores', 'Mês a mês', '+10-30% MoM nos primeiros 12 meses'],
            ['Engagement rate', '(likes+comentários+shares) / impressions', '3-8% é bom para LinkedIn'],
            ['Quality of comments', 'Comentários longos vs curtos', '60%+ com {'>'} 10 palavras'],
            ['DMs recebidas', '"Cheguei aqui pelo seu post X..."', '3-10 por semana após mês 6'],
            ['Oportunidades inbound', 'Vagas, parcerias, palestras propostas', '1-3 por mês após mês 12'],
            ['Search volume do nome', 'Google Trends, AppFigures', 'Crescente após 6 meses'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="E se eu não me sinto à vontade me expondo publicamente?"
          a={<>Personal branding não exige exposição pessoal. Você pode construir autoridade compartilhando trabalho técnico, frameworks, opiniões fundamentadas — sem mostrar rosto, sem contar vida pessoal. Casos reais: muitos engenheiros sêniors brasileiros têm 50k+ seguidores sem foto pessoal, focando em conteúdo técnico profundo. Comece pelo que você é confortável. Aumente exposição gradualmente — mas nunca é obrigatório expor o privado para construir autoridade profissional.</>}
        />
        <QAItem
          q="Como evitar parecer arrogante ou vendedor agressivo?"
          a={<>Regra "give before take": para cada pedido (curso, contratação, atenção), entregue 5-10 doses de valor (insights, ajuda gratuita, recursos). Tom de "professor compartilhando" supera tom de "guru ensinando". Use mais "eu aprendi que..." do que "você precisa fazer X". Vulnerabilidade autêntica (compartilhar erros e processo de aprendizado) constrói mais autoridade que aparente perfeição. As pessoas seguem quem eles podem se identificar, não quem está em pedestal.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Personal brand = 30-80% de diferença salarial para mesma habilidade.
        Polarize — opinião clara {'>'} tentar agradar todos. Frase de posicionamento: "Eu ajudo X a Y
        através de Z". 4 quadrantes de conteúdo: educacional 40%, opinião 30%, pessoal 20%, promocional
        10%. Tempo realista para autoridade: 12-24 meses. 80% desistem no mês 6 — exatamente quando
        começaria a render. Quality {'>'} quantity nos comentários e oportunidades inbound.
      </Callout>
    </div>
  );
}
