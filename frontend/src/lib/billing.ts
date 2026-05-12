'use client';

/**
 * Billing adapter — integração com Stripe Checkout via backend.
 *
 * Fluxo:
 * 1. createCheckout(productId) → POST /api/v1/billing/checkout → { checkoutUrl }
 * 2. Redirect para checkoutUrl (Stripe Checkout hosted)
 * 3. Stripe redireciona para /simulados?payment=success
 * 4. Backend webhook processou checkout.session.completed → grantProduct no DB
 * 5. Frontend chama syncProfileFromServer() pra atualizar paidProducts em cache
 */

import { hasBackend, apiPost } from './api-client';
import { FEATURES } from './features';

/** Inicia checkout Stripe e retorna a URL para redirect. */
export async function createCheckout(productId: string): Promise<string> {
  if (!FEATURES.billing) {
    throw new Error('Billing temporariamente desabilitado.');
  }
  if (!hasBackend()) {
    throw new Error('Checkout real requer backend configurado.');
  }
  const res = await apiPost<{ checkoutUrl: string }>('/api/v1/billing/checkout', { productId });
  return res.checkoutUrl;
}
