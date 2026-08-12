import type { Metadata } from 'next';

import { BASE_URL } from './site-jsonld';

/**
 * Par `openGraph` + `twitter` para páginas que declaram metadados próprios.
 *
 * ## O defeito que este arquivo existe para impedir
 *
 * No Next, `openGraph` declarado numa página **substitui** o do layout raiz — não
 * faz merge campo a campo. Então um bloco assim:
 *
 * ```ts
 * openGraph: { title: '…', description: '…', type: 'website', url: '…' }
 * ```
 *
 * apaga o `images` da raiz e a página sai **sem `og:image`**. E `twitter` não
 * herda de `openGraph`: página sem bloco `twitter` fica com o cartão genérico do
 * site, dizendo o nome da escola em vez do nome da página.
 *
 * Auditoria de 06/ago/2026, medindo o HTML servido de 100 rotas: **11 rotas sem
 * `og:image`** — `/temas`, `/temas/<tema>`, `/news`, `/perguntas`, `/simulados`,
 * `/certificacoes`, `/cheatsheet`, as duas landings de aquisição e mais. Todas
 * pelo mesmo motivo. `/aprenda/<slug>` já havia sido consertada à mão em
 * 05/ago/2026, e o conserto à mão não impediu as outras onze.
 *
 * Daí o helper: quem chama não tem como esquecer o campo, porque não escreve o
 * campo. `metadados-sociais.test.ts` reprova bloco `openGraph` escrito à mão sem
 * `images`.
 */

/**
 * Reexportado de `site-jsonld.ts`, que já era a definição. Duas constantes com a
 * mesma URL derivam no dia em que o domínio muda — este é um apelido, não uma
 * segunda fonte.
 */
export const BASE = BASE_URL;

/** Cartão padrão do site, gerado por `src/app/opengraph-image.tsx`. */
const IMAGEM_PADRAO = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'FFV Academy — Escola de Engenharia para a Era da IA',
};

export interface Social {
  /** Título do cartão. Recebe o sufixo da marca aqui, porque `openGraph.title` NÃO passa pelo template do layout. */
  titulo: string;
  descricao: string;
  /** Caminho absoluto do site, começando com `/`. */
  caminho: string;
  tipo?: 'website' | 'article';
  /** Caminho de uma imagem própria — use quando a página gera o cartão dela. */
  imagem?: { url: string; width?: number; height?: number; alt?: string };
}

/**
 * Devolve `openGraph` e `twitter` completos e coerentes entre si.
 *
 * Espalhe no objeto de metadados:
 * ```ts
 * export const metadata: Metadata = {
 *   title: 'Temas',                     // SEM sufixo: o template do layout o aplica
 *   description: '…',
 *   alternates: { canonical: `${BASE}/temas` },
 *   ...social({ titulo: 'Temas — FFV Academy', descricao: '…', caminho: '/temas' }),
 * };
 * ```
 */
export function social({ titulo, descricao, caminho, tipo = 'website', imagem }: Social): Pick<Metadata, 'openGraph' | 'twitter'> {
  const img = imagem ?? IMAGEM_PADRAO;
  return {
    openGraph: {
      title: titulo,
      description: descricao,
      type: tipo,
      url: `${BASE}${caminho}`,
      siteName: 'FFV Academy',
      locale: 'pt_BR',
      images: [img],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: [img.url],
    },
  };
}
