import type { NextConfig } from "next";
import { REDIRECTS_RETIRADOS } from "./src/lib/rotas-retiradas";

const nextConfig: NextConfig = {
  output: "standalone",

  /**
   * Redirects permanentes das rotas retiradas no pivot.
   *
   * A tabela mora em `src/lib/rotas-retiradas.ts`, que é a fonte única: cada
   * rota apagada tem disposição (`sucessor`, `hub` ou `removido`) e o motivo
   * escrito. Aqui só entram as duas primeiras — `removido` responde 404 de
   * propósito, porque redirect para página que não fala do assunto é soft 404.
   *
   * Auditoria de 05/ago/2026 encontrou **6 redirects para 55 rotas apagadas**:
   * 49 URLs que o site serve hoje iam virar 404 sem aviso. Dois dos 6 destinos
   * também estavam errados — `/python-profundo` ia para `/claude-anthropic`
   * existindo `/python-engenheiros`, e `/como-computador-funciona` ia para o hub
   * existindo a trilha homônima. Ambos corrigidos no inventário.
   */
  async redirects() {
    return REDIRECTS_RETIRADOS;
  },

  // Headers HTTP agora funcionam com SSR — CSP ativo
  async headers() {
    // Decisão deliberada (revisada na auditoria de segurança de 11/ago/2026,
    // achado P-07): CSP só em produção, de propósito, não um descuido.
    // `next dev` usa Fast Refresh, que injeta `eval()` no bundle do cliente
    // pra HMR — aplicar esta CSP (sem `unsafe-eval`) em dev quebraria hot
    // reload. `next dev` também não é exposto à internet, então o CSP não
    // protege nada ali que já não esteja atrás do isolamento da máquina do
    // dev. Manter os headers de segurança ausentes em dev é o trade-off
    // certo — não vale duplicar a política com uma variante mais permissiva
    // só pra dev, que divergiria da política real e mascararia regressões.
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        /**
         * Painel administrativo fora de qualquer índice de busca.
         *
         * `src/app/admin/layout.tsx` é client component e não pode exportar
         * `metadata`, então as 13 rotas de `/admin` não tinham controle de
         * indexação nenhum — auditoria de 05/ago/2026. `X-Robots-Tag` é o único
         * mecanismo que alcança a subárvore inteira de uma vez, e é autoritativo
         * mesmo em página que só existe depois da hidratação.
         *
         * `robots.txt` também passa a proibir `/admin`, mas as duas coisas fazem
         * trabalhos diferentes: o robots impede o rastreamento, o header impede a
         * indexação de URL que o buscador descobriu por link ou por histórico.
         */
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        /**
         * Rotas que são client component e por isso não podem exportar
         * `metadata` — a única via de `noindex` nelas é o header. `/revisar` e
         * `/perfil` conseguem declarar na página porque são server component;
         * estas duas, não.
         */
        source: "/revisar/maratona",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/dev-preview/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/(.*)",
        headers: [
          {
            /**
             * ÚNICA política de segurança de conteúdo do projeto.
             *
             * Até ago/2026 existia também um `<meta http-equiv>` no layout raiz,
             * herdado da época do export estático — quando não havia header HTTP
             * e a meta era a única forma. Duas políticas simultâneas não se
             * somam: o navegador aplica a INTERSEÇÃO, e a mais restritiva vence
             * em cada diretiva. Duas consequências medidas com a varredura de
             * rotas:
             *
             *  - a meta fixava `https://api.fernandofrancovalle.com` no código,
             *    então qualquer ambiente com outra URL de API — local, teste,
             *    prévia, ou o dia em que o domínio mudar — tinha as chamadas
             *    bloqueadas, com erro só no console do navegador;
             *  - o script do Stripe estava em `script-src` na meta e ausente
             *    no header. Interseção: ausente. Ou seja, bloqueado.
             *
             * A meta foi removida e este header passou a ser completo. Uma
             * política só, derivada do ambiente, é a diferença entre saber e
             * torcer.
             */
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // js.stripe.com precisa estar aqui para o checkout carregar.
              //
              // `unsafe-eval`/`data:`/`blob:` removidos em 11/ago/2026
              // (achado P-07 da auditoria de segurança): `data:` em
              // `script-src` anula boa parte do valor da política — qualquer
              // conteúdo que consiga injetar um `data:` URI executa como
              // script de primeira parte. Confirmado que nada no build de
              // produção precisa de `unsafe-eval`: o único `new Function()`
              // do projeto (`CodePlayground.tsx`) não tem nenhum importador
              // e foi tirado do caminho de build (ver hardening-residual).
              //
              // `'unsafe-inline'` FICA — testado remover (hash SHA-256 do
              // script de tema em layout.tsx) e o build quebrou: o App
              // Router do Next injeta MÚLTIPLOS `<script>` inline por
              // requisição pra entregar o payload RSC de hidratação
              // (`self.__next_f.push(...)`), com conteúdo que muda a cada
              // build/rota — um hash estático nunca cobre isso. A alternativa
              // real (nonce por request) exige middleware, e middleware
              // desliga o cache estático/ISR das rotas que passam por ele —
              // trade-off maior que o achado justifica sozinho. Verificado
              // com Playwright contra o build de produção antes de decidir
              // (achados de contrato, não suposição).
              "script-src 'self' 'unsafe-inline' https://plausible.io https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // A URL da API vem do ambiente — nunca fixa no código.
              `connect-src 'self' https://plausible.io https://api.stripe.com ${process.env.NEXT_PUBLIC_API_BASE_URL || ""}`,
              // `frame-ancestors` é ignorado em <meta> — só funciona em header,
              // que é mais um motivo para o header ser a fonte única.
              "frame-ancestors 'none'",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
