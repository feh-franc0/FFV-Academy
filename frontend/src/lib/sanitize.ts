/**
 * Sanitização de HTML vindo de fontes externas (backend, URL params, localStorage).
 *
 * Usa DOMPurify para bloquear XSS. Aplicar em qualquer dado renderizado via
 * dangerouslySetInnerHTML. Nunca renderize HTML não sanitizado diretamente.
 *
 * SSR-safe: quando rodando em Node (sem window), retorna o valor sem processar.
 * Em produção, todos os caminhos críticos passam pelo browser onde DOMPurify atua.
 */
import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML permitindo apenas tags seguras de formatação inline.
 *
 * Use para conteúdo que precisa de formatação (ex: descrições do backend,
 * feedbacks do quiz). Bloqueia <script>, event handlers e URLs javascript:.
 *
 * Tags permitidas: b, i, em, strong, a, code
 * Atributos permitidos: href, target
 */
export function sanitizeHTML(dirty: string): string {
  // SSR safe: no servidor não há DOM, retorna string sem processar.
  // DOMPurify precisa do DOM do browser para funcionar corretamente.
  if (typeof window === 'undefined') return dirty;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'code'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Sanitiza texto puro — remove qualquer HTML completamente.
 *
 * Use para inputs de usuário que devem ser texto simples: nomes, IDs de
 * referência, campos de formulário onde HTML não é esperado.
 */
export function sanitizeText(dirty: string): string {
  // SSR safe: sem DOM, retorna o valor diretamente.
  if (typeof window === 'undefined') return dirty;
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
