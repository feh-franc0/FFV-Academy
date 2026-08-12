import type { Metadata } from 'next';
import { DevCardClient } from '@/components/DevCardClient';

export const metadata: Metadata = {
  // Cartão DO usuário — nível, XP, streak dele. Um rastreador anônimo vê o
  // estado vazio, então o resultado de busca seria página em branco. Mesmo
  // princípio de `/progresso` e `/perfil`: conteúdo do usuário, não do site.
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://fernandofrancovalle.com/devcard' },
  title: 'Meu Dev Card',
  description: 'Seu card de desenvolvedor com nível, XP, streak e conquistas. Compartilhe no LinkedIn.',
};

export default function Page() {
  return <DevCardClient />;
}
