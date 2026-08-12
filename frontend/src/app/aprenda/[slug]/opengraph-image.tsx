import { ImageResponse } from 'next/og';
import { CURRICULUM } from '@/lib/curriculum';

/**
 * Imagem social POR MÓDULO, gerada sob demanda.
 *
 * ## O defeito que isto conserta
 *
 * Auditando o `<head>` servido em 05/ago/2026, as 426 páginas de módulo saíam
 * **sem `og:image` nenhum**. Só havia `twitter:image`, herdado do layout raiz —
 * e `twitter:image` serve ao X e a mais nada. Facebook, LinkedIn, WhatsApp,
 * Slack, Telegram e Discord leem `og:image`: todo link de módulo compartilhado
 * em qualquer um deles aparecia sem imagem.
 *
 * A causa era sutil. `generateMetadata` da rota declara o objeto `openGraph`
 * sem `images`, e nesse caso a imagem da convenção do segmento raiz não é
 * propagada para `og:image`. Nada quebra, nada avisa: o defeito só existe no
 * HTML servido, que é onde ninguém olha.
 *
 * ## Por que dinâmico e não 426 PNGs no repositório
 *
 * Existia `scripts/generate-og-images.mjs`, que escrevia em `out/og/` — o
 * diretório do export estático que deixou de existir quando o deploy virou
 * `output: "standalone"`. E `src/lib/metadata.ts` apontava para `/og/<slug>.png`,
 * caminho que nunca foi servido. Duas peças mortas apontando uma para a outra.
 *
 * Gerar sob demanda resolve os três problemas de uma vez: cobre módulo novo sem
 * ninguém rodar script, não coloca 13 MB de PNG no git e não envelhece quando o
 * título do módulo muda.
 */

export const alt = 'Módulo da FFV Academy';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Pré-gera no build para os slugs conhecidos; slug novo cai no caminho dinâmico. */
export function generateStaticParams() {
  return CURRICULUM.flatMap(t => t.modules.map(m => ({ slug: m.slug })));
}

export default async function OgModulo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const trilha = CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
  const modulo = trilha?.modules.find(m => m.slug === slug);

  // Módulo fora do índice ainda ganha um cartão legível: sem imagem é pior.
  const titulo = modulo?.title ?? 'FFV Academy';
  const nomeTrilha = trilha?.name ?? 'Escola de engenharia para a era da IA';
  const cor = trilha?.color ?? '#38bdf8';
  const xp = modulo?.xp;
  const leitura = modulo?.readTime;

  /**
   * SEM emoji no cartão, de propósito.
   *
   * O ícone do módulo é emoji, e `ImageResponse` não tem fonte para emoji: ele
   * BAIXA uma fonte dinâmica de um serviço externo por glifo desconhecido. No
   * build isso apareceu como `Failed to download dynamic font. Status: 400`, e em
   * produção seria uma requisição externa a cada imagem gerada — num app cuja CSP
   * bloqueia host externo por allowlist.
   *
   * O ícone era decoração; o título é o que a pessoa lê e clica. A identidade
   * visual da trilha vem da barra de cor, que não custa fonte nenhuma.
   */

  // Título longo em fonte grande estoura a caixa. O corte é por comprimento
  // porque satori não reflui: 78 caracteres é o que cabe em três linhas de 58px.
  const tituloVisivel = titulo.length > 78 ? `${titulo.slice(0, 76)}…` : titulo;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
          padding: '64px 72px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          position: 'relative',
        }}
      >
        {/* Barra da cor da trilha: identifica a trilha antes de ler o texto. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '10px',
            background: cor,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '520px',
            height: '520px',
            background: `radial-gradient(circle, ${cor}22 0%, transparent 70%)`,
          }}
        />

        {/* Topo: marca + trilha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '14px',
              border: `2px solid ${cor}88`,
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f1f5f9',
              fontSize: '19px',
              fontWeight: 800,
            }}
          >
            FFV
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>
              FFV Academy
            </span>
            <span style={{ fontSize: '15px', color: cor, fontWeight: 600 }}>
              {nomeTrilha.length > 62 ? `${nomeTrilha.slice(0, 60)}…` : nomeTrilha}
            </span>
          </div>
        </div>

        {/* Meio: o título do módulo, que é o que a pessoa clica */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          <div
            style={{
              width: '8px',
              height: '150px',
              borderRadius: '4px',
              background: cor,
              flexShrink: 0,
            }}
          />
          <h1
            style={{
              fontSize: '58px',
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.12,
              // Sem compressão de letra: `letterSpacing` negativo aperta as letras e
              // NÃO os espaços, e o resultado é buraco visível entre palavras.
              margin: 0,
              maxWidth: '960px',
            }}
          >
            {tituloVisivel}
          </h1>
        </div>

        {/* Base: sinais concretos, não slogan */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          {[
            xp ? `${xp} XP` : null,
            leitura ? `${leitura} min de leitura` : null,
            '3 quizzes viram cartas de revisão',
            'Gratuito',
          ]
            .filter(Boolean)
            .map(t => (
              <div
                key={t as string}
                style={{
                  padding: '9px 18px',
                  borderRadius: '999px',
                  border: '1px solid #334155',
                  background: '#1e293b66',
                  color: '#cbd5e1',
                  fontSize: '17px',
                  fontWeight: 600,
                }}
              >
                {t}
              </div>
            ))}
        </div>
      </div>
    ),
    size,
  );
}
