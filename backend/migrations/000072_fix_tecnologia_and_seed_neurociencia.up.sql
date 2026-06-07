-- Auditoria jun/2026 detectou 2 buracos:
--
-- 1. Tecnologia subcontada: DB dizia 215 módulos / 22 trilhas / 8 hubs.
--    Soma REAL via curriculum.ts dos 9 hubs tech:
--      hub-ia              113 mód · 14 trail
--      hub-aws              90 mód ·  6 trail
--      hub-engenharia      211 mód · 26 trail
--      hub-claude-anthropic 53 mód ·  4 trail
--      hub-fundamentos      67 mód ·  7 trail
--      hub-programacao      96 mód · 11 trail
--      hub-dados            41 mód ·  5 trail
--      hub-construcao       89 mód · 11 trail
--      hub-seguranca-hw     20 mód ·  1 trail
--    TOTAL: 780 mód · 85 trail · 9 hubs
--
-- 2. Neurociência ausente do DB embora exista no frontend (BASE_REGISTRY +
--    rota /neurociencia + módulos curados em lib/bases/neurociencia/).
--    INSERT idempotente — 1 trilha (Neuromarketing), 8 módulos, 4 hubs.

UPDATE bases SET
    modules = 780,
    trails = 85,
    hubs = 9,
    area_label = 'IA · AWS · Engenharia · Programação · Hardware · OS · Compiladores · Mercado Tech · Hardware Hacking',
    description = 'Sistemas distribuídos, IA aplicada, AWS, backend, frontend, dados, paradigmas além de OOP (funcional/Lispian/Elixir/Prolog), compiladores deep (Lexer/Parser/AST/JIT/LLVM/GC), OS por dentro (schedulers EEVDF/syscalls/containers internals/eBPF), hardware moderno (CPU superscalar/cache coherency/GPU CUDA/ARM vs x86 vs RISC-V), end-to-end full-stack 2026 (ideia ao no ar), mercado tech (FAANG levels.fyi/comp packages/H1B vs O-1) e hardware hacking ético (Flipper Zero).'
WHERE slug = 'tecnologia';

INSERT INTO bases (
    slug, name, area_label, description, icon, status, url,
    modules, trails, hubs,
    theme, nav_items, hide_global_content_nav, sort_order
) VALUES (
    'neurociencia',
    'Neurociência',
    'Cérebro · Comportamento · Neuromarketing · Decisão',
    'Base de Neurociência aplicada — comece pela trilha Neuromarketing, que cobre como o cérebro humano decide comprar: dos modelos triunos (MacLean) e sistemas duplos (Kahneman) à dopamina, vieses, design visual e pricing. 1 trilha curada com 8 módulos sequenciais, baseada em pesquisa de PhDs em Neurociência da PUC.',
    '🧠',
    'live',
    '/neurociencia',
    8, 1, 4,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#a855f7","accentLight":"#d8b4fe","success":"#15803d","hubColors":["#a855f7","#7c3aed","#6d28d9","#5b21b6"]}'::jsonb,
    '[
      {"href":"/neurociencia/simulado-neuromarketing","label":"Simulado","color":"#a855f7","iconName":"target"}
    ]'::jsonb,
    TRUE,
    25
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
