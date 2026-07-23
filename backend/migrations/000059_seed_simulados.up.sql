-- Seed dos simulados extraídos de catalog.json.
-- Idempotente via ON CONFLICT DO UPDATE.

INSERT INTO simulados (id, base_slug, certification, title, description, price_cents, question_count, time_limit_min, passing_score, topics, status, position)
VALUES
(
    'aws-clf',
    'tecnologia',
    'AWS Certified Cloud Practitioner',
    'Simulado AWS Cloud Practitioner (CLF-C02)',
    'Valide seus conhecimentos fundamentais de AWS com questões no formato do exame real.',
    4700,
    65,
    90,
    70,
    '["Cloud Concepts", "Security", "Technology", "Billing"]',
    'active',
    1
),
(
    'aws-aif',
    'tecnologia',
    'AWS Certified AI Practitioner',
    'Simulado AWS AI Practitioner (AIF-C01)',
    'Prove seu domínio dos fundamentos de IA, GenAI, foundation models (Bedrock), responsible AI e segurança em AWS.',
    4700,
    65,
    90,
    70,
    '["AI/ML Fundamentals", "Generative AI", "Foundation Models", "Responsible AI", "Security & Governance"]',
    'active',
    2
),
(
    'anthropic-ai',
    'tecnologia',
    'Anthropic Claude AI Practitioner',
    'Simulado Anthropic AI Practitioner (FFV)',
    'Teste seus conhecimentos sobre Claude, context engineering, MCP, Anthropic API e AI safety.',
    4700,
    60,
    90,
    70,
    '["Claude Models", "Context Engineering", "MCP", "Anthropic API", "AI Safety"]',
    'active',
    3
)
ON CONFLICT (id) DO UPDATE SET
    base_slug      = EXCLUDED.base_slug,
    certification  = EXCLUDED.certification,
    title          = EXCLUDED.title,
    description    = EXCLUDED.description,
    price_cents    = EXCLUDED.price_cents,
    question_count = EXCLUDED.question_count,
    time_limit_min = EXCLUDED.time_limit_min,
    passing_score  = EXCLUDED.passing_score,
    topics         = EXCLUDED.topics,
    status         = EXCLUDED.status,
    position       = EXCLUDED.position,
    updated_at     = now();
