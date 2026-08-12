import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';
import { social } from '@/lib/metadata-social';

export const metadata: Metadata = {
  /**
   * SEM barra, e não por escolha: **o Next remove a barra final** ao resolver
   * `alternates.canonical` contra o `metadataBase` quando não há `trailingSlash`.
   * Medido em 06/ago/2026 — escrevi `'https://fernandofrancovalle.com/'` e o HTML
   * servido saiu `href="https://fernandofrancovalle.com"`.
   *
   * A auditoria do mesmo dia achou a discordância pelo outro lado: o sitemap
   * anunciava a raiz COM barra. As duas formas normalizam para a mesma URL, então
   * não havia dano — mas duas formas para a mesma página é o tipo de coisa que
   * auditor externo acusa. Quem cedeu foi o sitemap, porque a forma que o
   * framework emite é a que o buscador realmente vê.
   */
  alternates: { canonical: 'https://fernandofrancovalle.com' },
  // O template do layout raiz NÃO se aplica a este arquivo: `app/page.tsx` está no
  // mesmo segmento que `app/layout.tsx`, e template só desce para segmento filho.
  // Por isso aqui a marca é escrita à mão, e só aqui.
  title: 'FFV Academy — Arquitetura de soluções AWS e IA em produção',
  description:
    'A escola de arquitetura de IA na AWS, em português. Os internals de verdade — Bedrock, Knowledge Bases, RAG, agents e 100 laboratórios em Terraform. Gamificado com XP, streak e revisão espaçada real (SM-2). 100% gratuito, sem paywall.',
  // O cartão social da home mora aqui desde 06/ago/2026. Estava no layout raiz, e
  // de lá era herdado por 58 páginas que passavam a se anunciar como a home.
  ...social({
    titulo: 'FFV Academy — Escola de Engenharia para a Era da IA',
    descricao:
      'Arquitetura de soluções AWS e IA em produção, explicadas por dentro. Zero hype. 38 trilhas gamificadas, 100% gratuito.',
    caminho: '/',
  }),
};

export default function HomePage() {
  return <HomeClient />;
}
