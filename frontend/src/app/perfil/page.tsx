import type { Metadata } from 'next';
import { DevProfileClient } from '@/components/DevProfileClient';
import { ProfilePreferencesForm } from '@/components/profile/ProfilePreferencesForm';

export const metadata: Metadata = {
  title: 'Perfil — FFV Academy',
  description:
    'Seu perfil de aprendizado: preferências, áreas de interesse, ritmo de estudo, conquistas e progresso por trilha.',
  keywords:
    'perfil ffv academy, preferências de aprendizado, base de conhecimento, conquistas, progresso',
};

export default function Page() {
  return (
    <div className="flex flex-col gap-10 pb-16">
      <div className="px-5 md:px-8 pt-8">
        <div className="max-w-4xl mx-auto">
          <ProfilePreferencesForm />
        </div>
      </div>
      <DevProfileClient />
    </div>
  );
}
