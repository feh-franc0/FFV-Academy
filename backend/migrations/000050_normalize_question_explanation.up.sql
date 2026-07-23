-- Normaliza `explanation.commonMistakes` que foi seedeado como string em vez
-- de array. Causava `Internal Server Error` no /admin/questions porque a
-- struct Go espera `[]string`.
--
-- Idempotente: o UPDATE só atinge linhas onde o campo é string. Linhas
-- ausentes/array já corretas não são tocadas.
--
-- Antes (541 linhas):  "commonMistakes": "Confundir A com B."
-- Depois:              "commonMistakes": ["Confundir A com B."]

UPDATE questions
SET explanation = jsonb_set(
    explanation,
    '{commonMistakes}',
    to_jsonb(ARRAY[explanation->>'commonMistakes'])
)
WHERE jsonb_typeof(explanation->'commonMistakes') = 'string';

-- Defesa em profundidade: o mesmo problema pode existir em `compareWith` ou
-- `tutorSeeds`. A query atual mostra todos como array, mas normalizar
-- preventivamente impede regressão futura.
UPDATE questions
SET explanation = jsonb_set(
    explanation,
    '{compareWith}',
    to_jsonb(ARRAY[explanation->>'compareWith'])
)
WHERE jsonb_typeof(explanation->'compareWith') = 'string';

UPDATE questions
SET explanation = jsonb_set(
    explanation,
    '{tutorSeeds}',
    to_jsonb(ARRAY[explanation->>'tutorSeeds'])
)
WHERE jsonb_typeof(explanation->'tutorSeeds') = 'string';
