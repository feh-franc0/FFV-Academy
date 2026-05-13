/**
 * safeJsonLd — escapa caracteres que podem fechar a tag <script> ou
 * iniciar comentário HTML quando JSON é embebido inline em HTML.
 *
 * Sem isso, um dado dinâmico contendo "</script>" ou "<!--" permitiria
 * escape do contexto <script type="application/ld+json">, abrindo XSS.
 *
 * Substitui também U+2028 e U+2029 que quebram parsers JSON-in-script legacy.
 */
const U2028 = ' ';
const U2029 = ' ';

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(U2028).join("\\u2028")
    .split(U2029).join("\\u2029");
}
