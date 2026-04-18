import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { ScreenFrame } from '../components/ScreenFrame';
import { SceneTransition, BottomBar } from '../components/SceneTransition';
import { COLORS, FONTS, FEATURE_SCENES } from '../styles/tokens';

/**
 * Cena 4 — Features (27s–62s, 1050 frames)
 * Beat emocional: exploracao → encantamento crescente
 * 7 sub-cenas de 5s cada, mostrando a plataforma em acao
 */
export function FeaturesScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* 4A — Hubs Tematicos */}
      <Sequence from={FEATURE_SCENES.hubs.from} durationInFrames={FEATURE_SCENES.hubs.duration}>
        <FeatureSlide
          screenshot="04-hub-ia.png"
          headline="4 hubs temáticos"
          tag="IA · AWS · Engenharia · Claude"
          tagColor={COLORS.blue}
        />
      </Sequence>

      {/* 4B — Trilhas Guiadas */}
      <Sequence from={FEATURE_SCENES.trails.from} durationInFrames={FEATURE_SCENES.trails.duration}>
        <FeatureSlide
          screenshot="08-trilha-ia.png"
          headline="16 trilhas estruturadas"
          tag="Do zero ao avançado · progresso visível"
          tagColor={COLORS.green}
        />
      </Sequence>

      {/* 4C — Artigo com TOC */}
      <Sequence from={FEATURE_SCENES.article.from} durationInFrames={FEATURE_SCENES.article.duration}>
        <FeatureSlide
          screenshot="11-artigo-llm.png"
          headline="168 artigos técnicos"
          tag="Conteúdo profundo · TOC interativo"
          tagColor={COLORS.purple}
        />
      </Sequence>

      {/* 4D — Quiz Interativo */}
      <Sequence from={FEATURE_SCENES.quiz.from} durationInFrames={FEATURE_SCENES.quiz.duration}>
        <QuizFeatureSlide />
      </Sequence>

      {/* 4E — Dashboard de Progresso */}
      <Sequence from={FEATURE_SCENES.progress.from} durationInFrames={FEATURE_SCENES.progress.duration}>
        <FeatureSlide
          screenshot="18-progresso-hero.png"
          headline="Seu progresso visível"
          tag="XP · Níveis · Badges · Streak"
          tagColor={COLORS.orange}
        />
      </Sequence>

      {/* 4F — Revisao Espacada */}
      <Sequence from={FEATURE_SCENES.srs.from} durationInFrames={FEATURE_SCENES.srs.duration}>
        <SRSFeatureSlide />
      </Sequence>

      {/* 4G — Dark/Light Theme */}
      <Sequence from={FEATURE_SCENES.darkLight.from} durationInFrames={FEATURE_SCENES.darkLight.duration}>
        <ThemeToggleSlide />
      </Sequence>
    </AbsoluteFill>
  );
}

/** Slide generico de feature */
function FeatureSlide({
  screenshot,
  headline,
  tag,
  tagColor,
}: {
  screenshot: string;
  headline: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <SceneTransition
      type="slide-left"
      enterDuration={9}
      exitDuration={9}
      durationInFrames={150}
    >
      <ScreenFrame screenshot={screenshot} kenBurns={[1.0, 1.05]} />
      <BottomBar height={140}>
        <div style={{
          fontFamily: FONTS.heading, fontSize: 48, fontWeight: 700,
          color: COLORS.text, textShadow: '0 2px 20px rgba(0,0,0,0.8)', marginBottom: 4,
        }}>
          {headline}
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 28, fontWeight: 400, color: tagColor }}>
          {tag}
        </div>
      </BottomBar>
    </SceneTransition>
  );
}

/** Quiz: crossfade perguntas → respondendo → resultado */
function QuizFeatureSlide() {
  const frame = useCurrentFrame();

  // 3 frames: perguntas (0-50), respondendo (50-100), resultado (100-150)
  const phase1 = interpolate(frame, [0, 45, 50], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const phase2 = interpolate(frame, [45, 50, 95, 100], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const phase3 = interpolate(frame, [95, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <SceneTransition type="slide-left" enterDuration={9} exitDuration={9} durationInFrames={150}>
      <AbsoluteFill style={{ opacity: phase1 }}>
        <ScreenFrame screenshot="15-quiz-perguntas.png" kenBurns={[1.0, 1.02]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: phase2 }}>
        <ScreenFrame screenshot="16-quiz-respondendo.png" kenBurns={[1.0, 1.02]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: phase3 }}>
        <ScreenFrame screenshot="17-quiz-resultado.png" kenBurns={[1.0, 1.02]} />
      </AbsoluteFill>
      <BottomBar height={140}>
        <div style={{
          fontFamily: FONTS.heading, fontSize: 48, fontWeight: 700,
          color: COLORS.text, textShadow: '0 2px 20px rgba(0,0,0,0.8)', marginBottom: 4,
        }}>
          Quiz interativo com XP
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 28, fontWeight: 400, color: COLORS.orange }}>
          Responda · Ganhe XP · Suba de nível
        </div>
      </BottomBar>
    </SceneTransition>
  );
}

/** SRS: crossfade card → resposta revelada */
function SRSFeatureSlide() {
  const frame = useCurrentFrame();
  const cardOpacity = interpolate(frame, [0, 70, 75], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const answerOpacity = interpolate(frame, [70, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <SceneTransition type="slide-left" enterDuration={9} exitDuration={9} durationInFrames={150}>
      <AbsoluteFill style={{ opacity: cardOpacity }}>
        <ScreenFrame screenshot="20-srs-card.png" kenBurns={[1.0, 1.03]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: answerOpacity }}>
        <ScreenFrame screenshot="21-srs-resposta.png" kenBurns={[1.0, 1.03]} />
      </AbsoluteFill>
      <BottomBar height={140}>
        <div style={{
          fontFamily: FONTS.heading, fontSize: 48, fontWeight: 700,
          color: COLORS.text, textShadow: '0 2px 20px rgba(0,0,0,0.8)', marginBottom: 4,
        }}>
          Revisão inteligente
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 28, fontWeight: 400, color: COLORS.blue }}>
          Espaçada SM-2 · Nunca esqueça o que aprendeu
        </div>
      </BottomBar>
    </SceneTransition>
  );
}

/** Theme toggle: crossfade dark → light */
function ThemeToggleSlide() {
  const frame = useCurrentFrame();
  const darkOpacity = interpolate(frame, [0, 60, 70], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lightOpacity = interpolate(frame, [60, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <SceneTransition type="fade" enterDuration={9} exitDuration={9} durationInFrames={150}>
      <AbsoluteFill style={{ opacity: darkOpacity }}>
        <ScreenFrame screenshot="01-home-hero.png" kenBurns={[1.0, 1.03]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: lightOpacity }}>
        <ScreenFrame screenshot="23-light-home.png" kenBurns={[1.0, 1.03]} />
      </AbsoluteFill>
      <BottomBar height={140}>
        <div style={{
          fontFamily: FONTS.heading, fontSize: 48, fontWeight: 700,
          color: COLORS.text, textShadow: '0 2px 20px rgba(0,0,0,0.8)', marginBottom: 4,
        }}>
          Dark & Light mode
        </div>
        <div style={{ fontFamily: FONTS.body, fontSize: 28, fontWeight: 400, color: COLORS.yellow }}>
          Estude do seu jeito · dia ou noite
        </div>
      </BottomBar>
    </SceneTransition>
  );
}
