import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('conteudo-setup-gravacao');

const ACCENT = '#fb923c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a hierarquia correta de importância em um setup de gravação?',
    options: [
      'Câmera (50%) > iluminação (30%) > áudio (20%)',
      'Áudio (50%) > iluminação (30%) > câmera (20%) — áudio ruim desengaja imediatamente, câmera cara não compensa som ruim',
      'Iluminação (50%) > câmera (30%) > áudio (20%)',
      'Todos têm igual importância',
    ],
    correct: 1,
    explanation:
      'Áudio ruim faz o espectador desistir nos primeiros segundos — o cérebro processa áudio como credibilidade. Iluminação ruim é tolerada se o áudio for bom. Câmera de última geração com microfone interno de notebook produz conteúdo amador. A ordem de investimento deve sempre seguir: áudio primeiro.',
  },
  {
    question: 'Qual microfone tem melhor custo-benefício para iniciantes em gravação?',
    options: [
      'Microfone interno do notebook — já está incluído',
      'BOYA BY-M1 (lapela, R$80-150) — captura voz diretamente da fonte, elimina eco do ambiente e custa menos que um jantar para dois',
      'Microfone condensador de estúdio (R$2.000+)',
      'Headset gamer com microfone boom',
    ],
    correct: 1,
    explanation:
      'O microfone de lapela captura o áudio muito próximo da boca, o que elimina a maioria dos problemas de eco e ruído ambiente. Por R$80-150 o BOYA BY-M1 entrega qualidade muito superior ao microfone interno de qualquer laptop. Para evoluir depois: microfone condensador USB para mesa (Blue Yeti Nano ou Rode NT-USB Mini).',
  },
  {
    question: 'Como resolver eco num ambiente sem tratamento acústico?',
    options: [
      'Comprar um microfone mais caro',
      'Gravar no closet — as roupas absorvem reflexo sonoro e eliminam eco sem custo nenhum',
      'Usar filtros de software depois da gravação',
      'Aumentar o volume do microfone',
    ],
    correct: 1,
    explanation:
      'O closet com roupas é o melhor estúdio improvisado que existe: roupas absorvem as reflexões de som que causam eco e reverberação. Alternativas: tapetes no chão, espuma acústica atrás da câmera, gravar longe de paredes duras. Filtros de software (noise suppression no OBS) complementam mas não substituem tratamento físico.',
  },
  {
    question: 'Qual configuração de exportação do OBS garante compatibilidade máxima para edição?',
    options: [
      'MKV com codec VP9',
      'MP4 H.264, 1920x1080, 60fps, bitrate 8-12Mbps — compatível com DaVinci Resolve, CapCut, Premiere e qualquer plataforma de upload',
      'AVI sem compressão',
      'MOV ProRes para máxima qualidade',
    ],
    correct: 1,
    explanation:
      'MP4 H.264 é o formato mais universalmente suportado: abre em qualquer editor, sobe em qualquer plataforma, ocupa espaço razoável. ProRes e AVI sem compressão geram arquivos enormes desnecessários para quem não precisa de cor profissional. MKV com VP9 tem problemas de compatibilidade em alguns editores.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="conteudo-setup-gravacao"
      title="Setup de gravação profissional com o que você tem"
      icon="🎙️"
      xp={50}
      readTime={13}
      trailName="Criação de Conteúdo Digital"
      trailColor={ACCENT}
      nextSlug="conteudo-edicao-video"
      nextTitle="Edição de vídeo prática"
      relatedSlugs={['conteudo-edicao-video', 'conteudo-tutorial-tecnico', 'conteudo-youtube']}
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
        Em 2026, um smartphone com boa câmera e microfone de lapela de R$150 supera qualquer setup
        de R$10k com iluminação ruim. A maioria dos criadores gasta ao contrário: investem na câmera
        e gravam com o microfone interno do notebook. Este módulo corrige essa ordem de prioridade e
        te dá um checklist prático para gravar conteúdo profissional com o que você já tem.
      </p>

      <Section title="Por que a maioria dos setups são caros desnecessariamente" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A hierarquia de importância em produção de conteúdo é contraintuitiva para quem vem do
          mundo tech: áudio vale metade da equação. O espectador tolera vídeo tremido, mas abandona
          em 10 segundos se o som for ruim. O erro mais cometido: comprar câmera cara e gravar com
          microfone interno do notebook, que captura o ventilador, a digitação e o eco do ambiente.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Setup', 'Investimento', 'Áudio', 'Iluminação', 'Câmera', 'Resultado']}
          rows={[
            ['Básico', 'R$500', 'Lapela BOYA BY-M1', 'Janela natural na frente', 'Celular 2022+', 'Profissional suficiente para YouTube e LinkedIn'],
            ['Intermediário', 'R$2.500', 'Rode NT-USB Mini', 'Ring light + janela', 'Logitech C920 ou ZV-E10', 'Canal técnico sólido, qualidade consistente'],
            ['Profissional', 'R$8.000+', 'Rode NT1 + interface', 'Key light + fill light + backdrop', 'Mirrorless Sony/Fujifilm', 'Nível de produtora — necessário apenas para monetização direta'],
          ]}
        />
        <Callout tone="info">
          O setup básico de R$500 produz resultados <strong>melhores que 90% do conteúdo técnico</strong> no
          YouTube e LinkedIn brasileiros. O salto do básico para o intermediário vale quando você publica
          consistentemente por 3+ meses e quer profissionalizar. O salto para o profissional raramente vale
          antes de 10k inscritos.
        </Callout>
      </Section>

      <Section title="Áudio: a prioridade número 1" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O cérebro humano processa áudio como sinal de confiança e credibilidade antes mesmo de
          processar o conteúdo visual. Áudio com eco soa como "gravado no banheiro" e faz o espectador
          questionar a qualidade do conteúdo antes de ouvir uma palavra. É injusto, mas é real.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Microfone', 'Tipo', 'Preço (2026)', 'Melhor para']}
          rows={[
            ['BOYA BY-M1', 'Lapela P2/USB', 'R$80-150', 'Iniciante — melhor custo-benefício absoluto, captura voz na fonte'],
            ['Blue Yeti Nano', 'Condensador USB', 'R$400', 'Gravação em mesa, setup fixo, podcast e screencasts'],
            ['Rode NT-USB Mini', 'Condensador USB', 'R$600', 'Qualidade profissional em mesa, menos coleta de ambiente'],
            ['Rode NT1 + Focusrite', 'XLR + interface', 'R$1.800+', 'Estúdio dedicado, qualidade broadcast'],
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Tratamento acústico caseiro</strong> — nesta ordem de custo-benefício:
        </p>
        <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--ffv-muted)' }}>
          <li><strong>Closet com roupas:</strong> grátis, elimina 80% do eco — as roupas absorvem reflexão sonora</li>
          <li><strong>Tapetes no chão e sofá:</strong> superfícies macias absorvem, paredes duras refletem</li>
          <li><strong>Espuma acústica atrás da câmera:</strong> R$50-100, reduz reverb nas primeiras reflexões</li>
          <li><strong>Estúdio improvisado com cobertores:</strong> funciona surpreendentemente bem em gravações esporádicas</li>
        </ul>
        <Callout tone="warn">
          <strong>O teste do eco:</strong> bata palmas no ambiente e ouça. Se houver reverberação audível,
          o microfone vai capturar. Resolva o ambiente antes de comprar equipamento mais caro — um microfone
          de R$3.000 em sala com eco soa pior que lapela de R$150 no closet.
        </Callout>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>OBS Studio para melhorar áudio na gravação:</strong> ative os filtros na fonte de áudio —
          Noise Suppression (remove ruído de fundo constante como ventilador), Compressor (equaliza volume
          entre falas mais altas e mais baixas) e Noise Gate (corta quando você para de falar, elimina ruído
          residual).
        </p>
      </Section>

      <Section title="Iluminação: o que transforma qualidade visual" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Iluminação natural de janela é o setup mais bonito que existe — de graça. O segredo é
          posicionamento: a janela deve ficar <em>na frente</em> de você, nunca atrás. Janela atrás
          cria silhueta escura, arruína a imagem mesmo com câmera de alta qualidade.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Solução', 'Custo', 'Resultado', 'Limitação']}
          rows={[
            ['Janela natural na frente', 'R$0', 'A mais bonita e natural possível', 'Depende de horário e clima'],
            ['Ring light', 'R$150-300', 'Iluminação uniforme, elimina sombras', 'Reflexo circular nos olhos — alguns não gostam'],
            ['Key light + fill light', 'R$500-800', 'Setup profissional, sem sombras duras', 'Mais espaço e configuração'],
            ['Softbox', 'R$200-400', 'Luz difusa e natural artificialmente', 'Volumoso, precisa de espaço'],
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Posicionamento correto:</strong> luz principal a 45° na frente e ligeiramente acima dos
          olhos — imita a luz natural do sol. Luz de preenchimento (fill) do outro lado a intensidade
          menor, suaviza as sombras. Luz de fundo (back light) opcional, destaca você do background.
        </p>
        <Callout tone="info">
          <strong>Temperatura de cor:</strong> use 5000-6500K (luz do dia) para aparência limpa e profissional
          — o que a maioria do conteúdo técnico usa. 3000-4000K (amarelado) fica bem para podcasts e conteúdo
          mais relaxado. Misturar temperaturas diferentes no mesmo frame parece amador.
        </Callout>
      </Section>

      <Section title="Câmera: último na lista de prioridade" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Com áudio e iluminação resolvidos, qualquer câmera moderna entrega qualidade suficiente para
          conteúdo profissional. A câmera é o investimento que mais impressiona quem está comprando
          e menos impacta quem está assistindo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Câmera', 'Custo', 'Resolução', 'Quando faz sentido']}
          rows={[
            ['Celular (iPhone 14+, S22+, Pixel 7+)', 'Já tem', '4K/60fps', 'Para começar — câmera excelente, use horizontal'],
            ['Webcam Logitech C920', 'R$400', '1080p/30fps', 'Setup fixo de mesa, screencasts e calls'],
            ['Sony ZV-E10', 'R$3.500', '4K/30fps', 'Após 6 meses publicando consistentemente'],
            ['Fujifilm X-S10', 'R$5.000', '4K/30fps', 'Qualidade cinematográfica, autofoco excelente'],
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Enquadramento:</strong> olhos no terço superior da imagem (regra dos terços), câmera
          na altura dos olhos — nunca abaixo, que cria perspectiva desfavorável. Background deve ser
          limpo e não distrair. Não precisa ser estúdio: uma parede neutra ou estante organizada funciona
          perfeitamente.
        </p>
        <Callout tone="success">
          Se você tem iPhone 14 ou superior: grava em 4K 30fps no modo Cinematic, depois converte para
          1080p na edição. A qualidade supera a maioria das webcams intermediárias. Use um tripé de celular
          (R$50-100) para estabilizar.
        </Callout>
      </Section>

      <Section title="Software de gravação: OBS Studio" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          OBS Studio é gratuito, profissional e usado por streamers, produtores e jornalistas. Disponível
          para Windows, Mac e Linux. Para gravação de tela com câmera, é a melhor opção disponível
          independente de orçamento.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Configuração', 'Valor recomendado', 'Por quê']}
          rows={[
            ['Resolução de saída', '1920x1080', 'Padrão universal, compatível com todas as plataformas'],
            ['FPS', '60', 'Movimentos de mouse e scroll ficam muito mais suaves'],
            ['Encoder', 'x264 (software) ou NVENC/AMF (hardware)', 'Hardware encoder libera CPU, use se tiver GPU NVIDIA/AMD'],
            ['Bitrate (gravação)', '8.000-12.000 kbps', 'Alta qualidade para edição sem arquivo gigante'],
            ['Formato de saída', 'MP4', 'Compatibilidade máxima com editores e plataformas'],
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Cenas no OBS</strong> — crie 3 cenas básicas para alternar durante a gravação:
        </p>
        <ul className="list-disc pl-5 space-y-1" style={{ color: 'var(--ffv-muted)' }}>
          <li><strong>Tela cheia:</strong> captura do monitor inteiro para demos e código</li>
          <li><strong>Câmera:</strong> só você falando — para introdução, conclusão e explicações conceituais</li>
          <li><strong>Lado a lado:</strong> câmera pequena no canto + tela — para tutoriais onde presença importa</li>
        </ul>
        <Callout tone="info">
          Sempre grave em modo <strong>Recording</strong>, nunca em Streaming acidentalmente. Crie um atalho
          de teclado para iniciar/parar gravação (Ctrl+Shift+R por padrão) e um indicador visual para confirmar
          que está gravando.
        </Callout>
      </Section>

      <Section title="Checklist antes de gravar" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O teste dos 10 segundos: grave 10 segundos, assista com fone de ouvido e com a tela longe dos
          olhos. É exatamente isso que seu público vai ver e ouvir. Resolva agora, não depois de gravar
          40 minutos.
        </p>
        <LayerStack
          title="Fluxo de gravação em 3 fases"
          accent={ACCENT}
          separatorLabel="→"
          layers={[
            {
              label: 'Pré-gravação',
              content: 'Ambiente silencioso testado (30s de silêncio gravado), iluminação verificada, fundo ok, microfone conectado e testado, câmera focada e enquadrada, notificações desativadas (Mac: Não Perturbe; Windows: Focus Assist), telefone no modo silencioso, OBS aberto e em modo Recording',
              tone: 'default',
            },
            {
              label: 'Durante a gravação',
              content: 'Verificar indicador de gravação ativo, falar devagar (20% mais devagar que o normal), pausar antes de recomeçar um trecho errado (facilita edição), não editar em tempo real — apenas grave, manter água por perto',
              tone: 'writable',
            },
            {
              label: 'Pós-gravação',
              content: 'Assistir 2 minutos antes de editar para verificar qualidade, salvar backup antes de editar original, anotar timestamps de erros para corte rápido',
              tone: 'success',
            },
          ]}
        />
        <Callout tone="success">
          <strong>Regra de ouro:</strong> consistência supera perfeição. Um vídeo por semana com setup
          básico por 6 meses vale mais que um vídeo perfeito por semestre. O canal que cresce é o que
          publica regularmente.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes sobre setup" accent={ACCENT}>
        <QAItem
          q="Vale a pena comprar câmera mirrorless antes de ter audiência?"
          a={
            <>
              Não. O ciclo correto é: (1) comece com celular + lapela barata, (2) publique por 3-6 meses,
              (3) avalie se a câmera é o gargalo real da qualidade. Na maioria dos casos, o gargalo é
              roteiro, consistência ou distribuição — não câmera. Invista em equipamento quando você tiver
              clareza de que ele é o limitante.
            </>
          }
        />
        <QAItem
          q="Como gravar tela do Mac sem OBS?"
          a={
            <>
              QuickTime Player (nativo) grava tela em alta qualidade. Para captura de área específica com
              áudio: Cmd+Shift+5. Mas OBS é superior porque permite misturar câmera + tela, controlar bitrate
              e usar filtros de áudio. Para quem publica frequentemente, OBS vale o tempo de configuração
              inicial de 1 hora.
            </>
          }
        />
        <QAItem
          q="Fundo verde (chroma key) faz diferença?"
          a={
            <>
              Para tutoriais técnicos, não é necessário. Um background neutro ou estante organizada funciona
              perfeitamente. Green screen faz sentido se você quer sobrepor tela ao fundo de câmera, mas exige
              iluminação uniforme do fundo (sem sombras) para funcionar bem. Com iluminação inadequada, o
              resultado é pior que um fundo simples.
            </>
          }
        />
        <QAItem
          q="Qual a melhor resolução para gravar tutoriais de código?"
          a={
            <>
              1080p 60fps é o padrão recomendado. 4K é excelente mas gera arquivos enormes e requer mais
              CPU na edição. Para mostrar código, o que importa mais é a fonte grande no editor (mínimo 20px)
              e o tema de alto contraste (One Dark, Dracula) — isso tem mais impacto que resolução na
              legibilidade do código em vídeo.
            </>
          }
        />
      </Section>

      <Callout tone="success">
        <strong>Resumo prático.</strong> A ordem de investimento: microfone de lapela (R$150) {'>'}
        tratamento acústico caseiro (R$0 no closet) {'>'} iluminação natural ou ring light (R$200) {'>'}
        câmera melhor (depois de 6 meses publicando). OBS Studio para gravar: gratuito, profissional,
        MP4 H.264 1080p 60fps. O checklist de 10 segundos antes de cada gravação evita retrabalho.
        Próximo: DaVinci Resolve e CapCut para transformar o material bruto em conteúdo publicável.
      </Callout>
    </div>
  );
}
