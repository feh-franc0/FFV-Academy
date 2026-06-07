-- Expande contagem da base psicologia-do-consumo após +6 trilhas (jun/2026)
-- preenchendo a mente humana além de consumo:
--   1. Mente Humana Cognitiva (memória/atenção/Big Five/Jung/van der Kolk)
--   2. Estágios da Vida (Erikson 8 fases — vontades/medos/riqueza por idade)
--   3. Felicidade & Sentido (Aristóteles/Frankl/Csíkszentmihályi/Seligman/ikigai/Harvard 85a)
--   4. Status & Jogo Social (Veblen/Bourdieu/Girard mimesis/Storr 3 games)
--   5. Atração & Carisma (Cabane/Brené Brown/Kelly 1000 fans/Ganz)
--   6. Construir Movimentos (Campbell hero journey/Sinek/Ganz Obama/Alinsky/Gladwell)
--
-- Total +60 módulos. Trilhas pré-existentes (6): Cialdini, Neuroeconomia,
-- Cérebro, 48 Leis Greene, Influência/Tribos, Riqueza.
--
-- Idempotente.

UPDATE bases SET
    modules = 120,
    trails = 12,
    area_label = 'Mente · Estágios da Vida · Felicidade · Status · Atração · Movimentos · Cérebro · Poder · Riqueza',
    description = 'Mente humana inteira em 12 trilhas. Consumo (Cialdini 7 gatilhos, Neuroeconomia Kahneman/Ariely/Thaler), Cérebro (Damasio/Eagleman/Ramachandran), Poder (48 Leis Greene), Influência (Carnegie + Godin + Sinek + BITE Hassan), Riqueza (Hill/Stanley/Housel/Bourdieu), Mente Cognitiva (Big Five OCEAN, Jung sombra, van der Kolk trauma), Estágios da Vida (Erikson 8 fases por idade — 20s/30s/40s/50s/60s+), Felicidade & Sentido (Aristóteles eudaimonia, Frankl Auschwitz, Csíkszentmihályi flow, Seligman PERMA, ikigai, Harvard Study 85 anos), Jogo Social (Veblen, Bourdieu, Girard mimesis, Storr 3 status games), Atração & Carisma (Cabane presença-poder-calor, Brené Brown vulnerabilidade, Kelly 1000 true fans), Construir Movimentos (Campbell hero journey, Sinek why, Ganz Obama 2008, Alinsky organizing, Gladwell tipping point).'
WHERE slug = 'psicologia-do-consumo';
