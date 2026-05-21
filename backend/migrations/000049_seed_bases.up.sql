-- seed inicial das bases: espelha exatamente o que estava hardcoded em
-- `bases_handler.go` -> `buildBases()` até a migration 47.
--
-- Idempotente: usa ON CONFLICT (slug) DO UPDATE — pode ser reaplicado em
-- ambientes que já têm dados (segue o padrão das migrations 41/42 do CLF).

INSERT INTO bases (
    slug, name, area_label, description, icon, status, url,
    modules, trails, hubs,
    theme, nav_items, hide_global_content_nav, sort_order
) VALUES
(
    'tecnologia',
    'Tecnologia',
    'Programação · IA · AWS · Engenharia',
    'Sistemas distribuídos, IA aplicada, AWS, frontend, backend, dados. Trilhas completas com revisão espaçada e gamificação.',
    '💻',
    'live',
    '/tecnologia',
    157, 16, 8,
    '{"ink":"#1c1917","paper":"#faf7f2","cream":"#ffffff","border":"#e7e0d0","muted":"#57534e","accent":"#1e3a8a","accentLight":"#3b82f6","success":"#15803d","hubColors":["#1e3a8a","#0e7490","#15803d","#b45309"]}'::jsonb,
    '[
      {"href":"/ia","label":"IA","color":"#58a6ff","iconName":"brain"},
      {"href":"/aws","label":"AWS","color":"#ff9900","iconName":"cloud"},
      {"href":"/engenharia","label":"Engenharia","color":"#e3b341","iconName":"wrench"},
      {"href":"/claude-anthropic","label":"Claude","color":"#cc785c","iconName":"bot"}
    ]'::jsonb,
    FALSE,
    10
),
(
    'medicina-veterinaria',
    'Medicina Veterinária',
    'Genética · Anatomia · Clínica · Farmacologia',
    'Trilha completa de Genética Veterinária: 12 módulos sobre Mendel, alelismo, genes letais, padrões de herança, Hardy-Weinberg, melhoramento e endogamia.',
    '🐾',
    'live',
    '/medicina-veterinaria',
    12, 1, 1,
    '{"ink":"#2d4a3e","paper":"#fbf7f0","cream":"#fdfbf6","border":"#e0d4ba","muted":"#6b6358","accent":"#8a9b7e","accentLight":"#d4a574","success":"#6b9080","hubColors":["#8a9b7e","#b08968","#a07775","#c19a78"]}'::jsonb,
    '[
      {"href":"/medicina-veterinaria/simulado-genetica","label":"Simulado","color":"#b08968","iconName":"target"}
    ]'::jsonb,
    TRUE,
    20
),
('medicina',           'Medicina',                       'Residência · Disciplinas básicas · Especialidades',     'Aguardando demanda. Pode ser a próxima base no ar.', '🩺', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 100),
('engenharia',         'Engenharia',                     'Cálculo · Estruturas · Mecânica · NRs',                 'Aguardando demanda. Pode ser a próxima base no ar.', '🏗️', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 110),
('direito',            'Direito',                        'OAB · Constitucional · Civil · Penal',                  'Aguardando demanda. Pode ser a próxima base no ar.', '⚖️', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 120),
('administracao',      'Administração & Negócios',       'Marketing · Finanças · MBA · Gestão',                   'Aguardando demanda. Pode ser a próxima base no ar.', '📊', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 130),
('design',             'Design',                         'UX · Motion · Design Systems · Branding',               'Aguardando demanda. Pode ser a próxima base no ar.', '🎨', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 140),
('saude',              'Outras áreas da saúde',          'Enfermagem · Fisio · Nutrição · Odontologia',           'Aguardando demanda. Pode ser a próxima base no ar.', '🧪', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 150),
('concursos',          'Concursos públicos',             'Federais · Estaduais · Municipais',                     'Aguardando demanda. Pode ser a próxima base no ar.', '🎓', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 160),
('faculdade-geral',    'Faculdade em geral',             'Qualquer curso superior',                               'Aguardando demanda. Pode ser a próxima base no ar.', '🏛️', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 170),
('curso-livre',        'Curso livre / Aperfeiçoamento',  'Especializações · Workshops · MBAs',                    'Aguardando demanda. Pode ser a próxima base no ar.', '📈', 'queued', '', 0, 0, 0, '{}'::jsonb, '[]'::jsonb, FALSE, 180)
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
