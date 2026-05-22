-- Adiciona 6 bases do Profissional Digital — split do antigo hub-profissional-digital
-- do frontend. Cada uma vira uma base "live" independente em /bases.
--
-- Idempotente: ON CONFLICT (slug) DO UPDATE — pode ser reaplicado.

INSERT INTO bases (
    slug, name, area_label, description, icon, status, url,
    modules, trails, hubs,
    theme, nav_items, hide_global_content_nav, sort_order
) VALUES
(
    'carreira',
    'Carreira & Liderança',
    'Portfólio · Vagas · Interview · Promoção',
    'Como entrar, crescer e se posicionar no mercado tech brasileiro e na gringa. Carreira Digital BR + Career Engineering: resume tech, LinkedIn, behavioral interview, negotiation, promo docs.',
    '🎯',
    'live',
    '/carreira',
    13, 2, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#f472b6","accentLight":"#f9a8d4","success":"#15803d","hubColors":["#f472b6"]}'::jsonb,
    '[
      {"href":"/carreira","label":"Carreira","color":"#f472b6","iconName":"target"}
    ]'::jsonb,
    FALSE,
    30
),
(
    'comunicacao',
    'Comunicação',
    'Falar em público · Technical Writing · RFCs',
    'Falar bem, escrever bem, influenciar — a habilidade que multiplica engenheiros. Comunicação Humana + Technical Writing & RFCs com templates reais de Google/Meta/Stripe.',
    '💬',
    'live',
    '/comunicacao',
    14, 2, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#fb7185","accentLight":"#fda4af","success":"#15803d","hubColors":["#fb7185"]}'::jsonb,
    '[
      {"href":"/comunicacao","label":"Comunicação","color":"#fb7185","iconName":"message-circle"}
    ]'::jsonb,
    FALSE,
    31
),
(
    'marketing',
    'Marketing Digital',
    'SEO · Branding · CAC/LTV · Funil',
    'Marketing digital sem hype: posicionamento, branding, SEO técnico, conteúdo estratégico, métricas que importam (CAC, LTV, conversão), funil end-to-end.',
    '📣',
    'live',
    '/marketing',
    5, 1, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#ef4444","accentLight":"#fca5a5","success":"#15803d","hubColors":["#ef4444"]}'::jsonb,
    '[
      {"href":"/marketing","label":"Marketing","color":"#ef4444","iconName":"megaphone"}
    ]'::jsonb,
    FALSE,
    32
),
(
    'conteudo',
    'Criação de Conteúdo',
    'YouTube · LinkedIn · Gravação · Monetização',
    'Criação de conteúdo digital ponta-a-ponta: estratégia editorial, gravação áudio+vídeo, edição, publicação multi-plataforma, métricas e monetização.',
    '🎬',
    'live',
    '/conteudo',
    6, 1, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#ec4899","accentLight":"#f9a8d4","success":"#15803d","hubColors":["#ec4899"]}'::jsonb,
    '[
      {"href":"/conteudo","label":"Conteúdo","color":"#ec4899","iconName":"film"}
    ]'::jsonb,
    FALSE,
    33
),
(
    'empreendedorismo',
    'Empreendedorismo Digital',
    'Solo SaaS · Indie Hacker · MVP · Freelance',
    'Produtos digitais, indie hacking e Solo SaaS — sair do CLT virando founder. Empreendedorismo Digital + Solo SaaS / Indie Hacker Stack 2026 (Stripe, multi-tenancy, CAC/LTV, pricing, LLC americana).',
    '🚀',
    'live',
    '/empreendedorismo',
    15, 2, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#eab308","accentLight":"#fde047","success":"#15803d","hubColors":["#eab308"]}'::jsonb,
    '[
      {"href":"/empreendedorismo","label":"Empreendedorismo","color":"#eab308","iconName":"rocket"}
    ]'::jsonb,
    FALSE,
    34
),
(
    'ingles',
    'Inglês',
    'Gramática · 10 cenários reais · Trabalho na gringa',
    'Inglês para Brasileiros na Gringa — gramática essencial + 10 cenários reais (entrevista, daily, code review, design discussion, negociação, conference talk) com 100 trocas cada.',
    '🌎',
    'live',
    '/ingles',
    19, 1, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#06b6d4","accentLight":"#67e8f9","success":"#15803d","hubColors":["#06b6d4"]}'::jsonb,
    '[
      {"href":"/ingles","label":"Inglês","color":"#06b6d4","iconName":"globe"}
    ]'::jsonb,
    FALSE,
    35
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    area_label = EXCLUDED.area_label,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    status = EXCLUDED.status,
    url = EXCLUDED.url,
    modules = EXCLUDED.modules,
    trails = EXCLUDED.trails,
    hubs = EXCLUDED.hubs,
    theme = EXCLUDED.theme,
    nav_items = EXCLUDED.nav_items,
    hide_global_content_nav = EXCLUDED.hide_global_content_nav,
    sort_order = EXCLUDED.sort_order;
