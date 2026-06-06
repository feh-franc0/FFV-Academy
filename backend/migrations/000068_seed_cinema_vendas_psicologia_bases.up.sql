-- Seed das 3 bases novas (cinema, vendas, psicologia-do-consumo) + UPDATE
-- de marketing e ingles com contagens novas após expansão.
--
-- Cinema (jun/2026): 10 trilhas, 100 módulos (linguagem cinematográfica,
-- roteiro, storytelling visual, câmera/lente, DP, direção, edição Walter
-- Murch, som & trilha, produção, VLOG + comunidade).
--
-- Vendas (jun/2026): 3 trilhas, 30 módulos (consultivas SPIN/Challenger/
-- MEDDIC, fechamento Chris Voss, vendas via cérebro Renvoise).
--
-- Psicologia do Consumo (jun/2026): 6 trilhas, 60 módulos (Cialdini,
-- Neuroeconomia, Como o Cérebro Funciona, 48 Leis do Poder, Influência &
-- Liderança de Comunidades, Psicologia da Riqueza).
--
-- Marketing (atualização): de 1→4 trilhas, 5→35 módulos.
-- Inglês (atualização): de 1→4 trilhas, 19→49 módulos.
--
-- Idempotente: ON CONFLICT (slug) DO UPDATE — pode ser reaplicado.

INSERT INTO bases (
    slug, name, area_label, description, icon, status, url,
    modules, trails, hubs,
    theme, nav_items, hide_global_content_nav, sort_order
) VALUES
(
    'cinema',
    'Cinematografia',
    'Linguagem · Roteiro · DP · Direção · Edição · Som · Produção · VLOG',
    'Cinema com profundidade de conservatório, em PT-BR: linguagem (Kuleshov/Eisenstein/Bazin), roteiro (Save the Cat/McKee), storytelling visual (Storaro/Damasio), câmera ARRI Alexa 35 / Sony Venice 2 / RED V-Raptor, direção de fotografia (Deakins/Lubezki/Khondji), mise-en-scène (Villeneuve/Fincher), edição (Walter Murch — Regra dos Seis), som & trilha (Williams/Zimmer/Greenwood), produção (ANCINE/Cannes/agente/reel) e VLOG cinemático + construção de comunidade (Casey Neistat/Peter McKinnon/Mr Beast/David Spinks).',
    '🎬',
    'live',
    '/cinema',
    100, 10, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#ec4899","accentLight":"#f9a8d4","success":"#15803d","hubColors":["#ec4899"]}'::jsonb,
    '[
      {"href":"/cinema","label":"Cinema","color":"#ec4899","iconName":"film"}
    ]'::jsonb,
    FALSE,
    36
),
(
    'vendas',
    'Vendas Consultivas & Negociação',
    'SPIN · Challenger · Sandler · MEDDIC · Chris Voss · Renvoise',
    'Vendas B2B com método: SPIN de Neil Rackham (35.000 ligações analisadas), Challenger Sale de Dixon & Adamson, Sandler, MEDDIC/MEDDPICC, fechamento via tactical empathy de Chris Voss (FBI hostage), e Vendas via Cérebro (Patrick Renvoise SalesBrain — 3 cérebros + 6 estímulos reptilianos). Para SDR, AE, founder vendendo, account manager.',
    '🎯',
    'live',
    '/vendas',
    30, 3, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#0ea5e9","accentLight":"#7dd3fc","success":"#15803d","hubColors":["#0ea5e9"]}'::jsonb,
    '[
      {"href":"/vendas","label":"Vendas","color":"#0ea5e9","iconName":"target"}
    ]'::jsonb,
    FALSE,
    37
),
(
    'psicologia-do-consumo',
    'Psicologia do Consumo',
    'Cérebro · Poder · Influência · Riqueza · Cialdini · Kahneman · Greene',
    'Por que humanos compram, desejam, cedem ao poder, seguem líderes e acumulam ou perdem riqueza — com evidência. Cialdini (7 gatilhos), Neuroeconomia (Kahneman/Ariely/Thaler/Damasio), Como o Cérebro Funciona (Eagleman/Ramachandran/MacLean/Rizzolatti), As 48 Leis do Poder (Robert Greene), Influência & Liderança de Comunidades (Carnegie + Godin + Sinek + ética anti-seita via modelo BITE de Hassan) e Psicologia da Riqueza (Hill + Stanley + Housel + Bourdieu + Dweck).',
    '🧲',
    'live',
    '/psicologia-do-consumo',
    60, 6, 1,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#a855f7","accentLight":"#d8b4fe","success":"#15803d","hubColors":["#a855f7"]}'::jsonb,
    '[
      {"href":"/psicologia-do-consumo","label":"Psicologia","color":"#a855f7","iconName":"brain"}
    ]'::jsonb,
    FALSE,
    38
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

-- Atualizar contagens de marketing e ingles após expansão de trilhas.
UPDATE bases SET
    modules = 35,
    trails = 4,
    area_label = 'Posicionamento · Growth · Neuromarketing · Branding · SEO · CAC/LTV',
    description = 'Marketing como engenharia. Branding pessoal e SEO + Posicionamento Estratégico (Trout/Ries/Kotler/Dunford/Raskin) + Growth (AARRR, CAC/LTV, funnel, PLG/SLG/MLG, k-factor) + Neuromarketing & Attention Economy (Lindstrom, Nir Eyal Hooked, BJ Fogg, Tristan Harris, Paul Zak).'
WHERE slug = 'marketing';

UPDATE bases SET
    modules = 49,
    trails = 4,
    area_label = 'Gramática · 10 cenários do dia a dia · 30 fluxos de conversação',
    description = 'Inglês para brasileiros pra gringa: gramática essencial + 10 cenários do cotidiano com 100 trocas cada (aeroporto, moradia, médico, banco, etc.) + 30 fluxos de conversação avançada — Negócios (standup, 1:1, pitch, FAANG, negociação salarial), Social (Tinder, dating, amizade, luto, crise emocional) e Emergências (911, ER, polícia, ICE, IRS, fraude, saúde mental).'
WHERE slug = 'ingles';
