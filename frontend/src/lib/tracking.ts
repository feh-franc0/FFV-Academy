/**
 * tracking.ts — client unificado de envio de eventos `view` ao backend.
 *
 * Responsabilidades:
 *   1. Gerar e persistir `anonId` (localStorage) + `sessionId` (sessionStorage)
 *      pra que o backend correlacione visitas mesmo anônimas.
 *   2. Coletar identidade do usuário logado (email/nome) do localStorage do
 *      AuthProvider quando disponível, sem acoplar a este módulo o `useAuth`
 *      hook (queremos chamar tracking fora de componentes React também).
 *   3. Enviar o evento via `POST /api/v1/events/view` com:
 *      - Headers `X-FFV-*` (identidade — fonte preferida no backend)
 *      - Body JSON (slug, baseSlug, path, kind — payload do evento)
 *
 * Decisão de produto (2026-05-21): admin precisa ver "quem acessou o quê",
 * incluindo páginas globais (ranking, admin) — não só módulos /aprenda. Por
 * isso `kind` foi adicionado e `path` é capturado direto do `window.location`.
 *
 * Dedupe: cada chamada decide se é primeira do dia/sessão (vide trackView).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const ANON_KEY = 'ffv_anon_id';
const SESSION_KEY = 'ffv_session_id';

// AuthProvider salva o profile no localStorage; lemos snapshot direto pra
// evitar acoplamento com hook React. A key bate com STORAGE_KEYS.USER.
const USER_PROFILE_KEY = 'ffv_user_profile';

/** Cria ou recupera o anonId persistente (localStorage). */
function getOrCreateAnonId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

/** Cria ou recupera o sessionId (sessionStorage — zera ao fechar a aba). */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

interface UserIdentitySnapshot {
  id?: string;
  email?: string;
  name?: string;
}

/** Lê o snapshot do user profile do localStorage (sem hook React). */
function readUserIdentity(): UserIdentitySnapshot {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { id?: string; email?: string; name?: string };
    return {
      id: typeof parsed.id === 'string' ? parsed.id : undefined,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Monta o conjunto de headers X-FFV-* que o backend lê via middleware
 * IdentityHeaders. Logado: inclui email/nome/id. Anônimo: só anon+session.
 */
export function buildTrackingHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const anon = getOrCreateAnonId();
  if (anon) headers['X-FFV-Anon-Id'] = anon;
  const session = getOrCreateSessionId();
  if (session) headers['X-FFV-Session-Id'] = session;
  const user = readUserIdentity();
  if (user.email) headers['X-FFV-User-Email'] = user.email;
  if (user.id) headers['X-FFV-User-Id'] = user.id;
  if (user.name) headers['X-FFV-User-Name'] = user.name;
  return headers;
}

export type ViewKind = 'module' | 'page' | 'simulado' | 'admin' | 'other';

interface TrackViewInput {
  /** Slug do módulo OU id da página. Para kind=module é obrigatório. */
  slug?: string;
  hubId?: string;
  trailId?: string;
  /** Slug da base de conhecimento ativa no momento da view. */
  baseSlug?: string;
  /** URL completa (ex.: /tecnologia/postgres-mvcc). Default: window.location.pathname. */
  path?: string;
  kind?: ViewKind;
  /** Dedupe key — se o mesmo (sessionId+kind+key) já foi enviado nesta sessão, ignora. */
  dedupeKey?: string;
}

/**
 * Envia um evento de view ao backend. Fire-and-forget (não retorna erro).
 *
 * Estratégia de transporte:
 *   - sendBeacon ainda é preferido em unload, mas NÃO suporta headers
 *     customizados. Usamos fetch com `keepalive` que aceita headers e
 *     sobrevive a unload em navegadores modernos.
 */
export function trackView(input: TrackViewInput): void {
  if (!API_BASE || typeof window === 'undefined') return;

  const kind: ViewKind = input.kind ?? 'module';
  // Dedupe por sessão — evita inflar contagem em re-renders do mesmo módulo.
  if (input.dedupeKey) {
    try {
      const key = `ffv_track_${kind}_${input.dedupeKey}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* segue sem dedupe */
    }
  }

  const path = input.path ?? window.location.pathname + window.location.search;

  const body = JSON.stringify({
    slug: input.slug ?? '',
    hubId: input.hubId ?? '',
    trailId: input.trailId ?? '',
    baseSlug: input.baseSlug ?? '',
    path,
    kind,
    // anonId no body é fallback retrocompat — header é a fonte preferida.
    anonId: getOrCreateAnonId(),
  });

  const headers = buildTrackingHeaders();

  fetch(`${API_BASE}/api/v1/events/view`, {
    method: 'POST',
    headers,
    body,
    keepalive: true,
  }).catch(() => {
    // Tracking nunca afeta UX. Erros de rede são silenciosos.
  });
}

/**
 * Persiste o profile do usuário em localStorage pra que `buildTrackingHeaders`
 * encontre o snapshot. Chamado pelo AuthProvider após login/refresh.
 */
export function snapshotUserForTracking(profile: { id?: string; email?: string; name?: string } | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!profile || (!profile.id && !profile.email)) {
      localStorage.removeItem(USER_PROFILE_KEY);
      return;
    }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify({
      id: profile.id,
      email: profile.email,
      name: profile.name,
    }));
  } catch {
    /* storage bloqueado */
  }
}

// ─────────────────────────────────────────────────────────────────────────
// trackEvent — interações deliberadas (mapeamento de comportamento)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Convenção de event types — namespace.action snake_case. Mesma regex que o
 * backend valida (eventTypeRegex em user_events.go).
 *
 * Catálogo aprovado (qualquer evento NOVO precisa ser adicionado aqui):
 */
export type EventType =
  // Auth / signup
  | 'auth.signup_started'        // submit do form de criar conta
  | 'auth.signup_completed'      // magic link confirmado, conta criada
  | 'auth.login_started'         // request de magic link (login)
  | 'auth.login_completed'       // token verificado, sessão iniciada
  | 'auth.logout'                // logout manual
  // CTAs
  | 'cta.click'                  // clique genérico em CTA (identifica via targetId)
  | 'cta.shown'                  // CTA contextual entrou em viewport (gatilho funil)
  | 'cta.dismissed'              // user fechou CTA sem converter (props: id, time_visible_sec)
  // Conteúdo — telemetria de profundidade de leitura
  | 'module.scroll_milestone'    // user atingiu marco 25/50/75/100% scroll no módulo
  // Search
  | 'search.submit'              // enter na busca
  | 'search.result_click'        // clique em um resultado
  // Conteúdo
  | 'module.completed'           // markComplete disparado
  | 'module.bookmarked'          // bookmark adicionado
  | 'module.rated'               // rating dado (👍/👎)
  | 'quiz.answered'              // resposta submetida
  | 'quiz.completed'             // quiz finalizado
  // Simulado
  | 'simulado.started'           // tentativa iniciada
  | 'simulado.finished'          // tentativa finalizada
  // Compartilhamento
  | 'share.click'                // clique em compartilhar
  // Demais (catch-all controlado)
  | 'app.other';

interface TrackEventInput {
  eventType: EventType;
  /** Tipo do alvo (module|trail|quiz|simulado|cta|base|none). */
  targetType?: string;
  /** ID/slug do alvo. */
  targetId?: string;
  /** Slug da base ativa no momento. */
  baseSlug?: string;
  /** URL completa (default: window.location.pathname + search). */
  path?: string;
  /** Métrica numérica opcional (XP ganho, score, latência). */
  valueNum?: number;
  /** Props adicionais — máximo 4KB. Nunca PII (phone, senha, endereço). */
  metadata?: Record<string, unknown>;
  /** Dedupe por sessão (igual trackView). */
  dedupeKey?: string;
}

/**
 * Envia um evento de interação ao backend (POST /api/v1/events/track).
 * Fire-and-forget — falhas de rede são silenciosas.
 *
 * Identidade vem dos mesmos headers X-FFV-* que trackView usa.
 */
export function trackEvent(input: TrackEventInput): void {
  if (!API_BASE || typeof window === 'undefined') return;

  if (input.dedupeKey) {
    try {
      const key = `ffv_event_${input.eventType}_${input.dedupeKey}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* segue sem dedupe */
    }
  }

  const path = input.path ?? window.location.pathname + window.location.search;

  const body = JSON.stringify({
    eventType: input.eventType,
    targetType: input.targetType ?? '',
    targetId: input.targetId ?? '',
    baseSlug: input.baseSlug ?? '',
    path,
    valueNum: input.valueNum,
    metadata: input.metadata ?? {},
  });

  fetch(`${API_BASE}/api/v1/events/track`, {
    method: 'POST',
    headers: buildTrackingHeaders(),
    body,
    keepalive: true,
  }).catch(() => {
    /* tracking nunca afeta UX */
  });
}
