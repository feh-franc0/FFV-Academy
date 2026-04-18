import { registerRoot, Composition } from 'remotion';
import { PromoVideo } from './Root';
import { VIDEO } from './styles/tokens';

// Registrar fontes Google
import '@remotion/google-fonts/Poppins';
import '@remotion/google-fonts/Inter';
import '@remotion/google-fonts/RobotoMono';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoVideo"
        component={PromoVideo}
        durationInFrames={VIDEO.TOTAL_FRAMES}
        fps={VIDEO.FPS}
        width={VIDEO.WIDTH}
        height={VIDEO.HEIGHT}
      />
    </>
  );
};

registerRoot(RemotionRoot);
