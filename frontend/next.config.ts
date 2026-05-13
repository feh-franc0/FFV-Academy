import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Desabilita otimizações de imagem para export estático
  images: {
    unoptimized: true,
  },

  /**
   * trailingSlash: true gera /aprenda/<slug>/index.html em vez de
   * /aprenda/<slug>.html. Necessário para hosting LiteSpeed/Apache da
   * Hostinger Cloud Startup — o servidor força barra final em URLs sem
   * extensão e, se o destino for um .html simples, redireciona 301 para a
   * pasta correspondente e bate em 403 (diretório não existe).
   *
   * Resultado: todas as rotas precisam terminar com / (Next.js cuida disso
   * nos <Link> internos automaticamente).
   */
  trailingSlash: true,

  /**
   * ATENÇÃO: headers() NÃO funciona com `output: "export"` (site estático).
   * Esta configuração é incluída para referência e para quando o site for
   * servido via Vercel ou Caddy (proxy reverso) com suporte a headers HTTP.
   *
   * Para habilitar na Hostinger/Caddy: configure os headers diretamente no
   * servidor web (ex: Caddyfile com `header Content-Security-Policy "..."`)
   * ou via middleware de edge function.
   *
   * Ref: https://nextjs.org/docs/app/api-reference/next-config-js/headers
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-inline e unsafe-eval necessários para Next.js (chunks inline)
              // blob: e data: para Pyodide e esbuild-wasm no CodePlayground
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              // connect-src inclui a URL do backend Go se configurada
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || ""}`,
              // Impede que esta página seja embutida em iframes externos (clickjacking)
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
