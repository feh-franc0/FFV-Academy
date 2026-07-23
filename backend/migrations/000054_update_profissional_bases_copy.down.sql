-- Reverte para os textos originais da migration 000053.

UPDATE bases
SET
    area_label = 'Portfólio · Vagas · Interview · Promoção',
    description = 'Como entrar, crescer e se posicionar no mercado tech brasileiro e na gringa. Carreira Digital BR + Career Engineering: resume tech, LinkedIn, behavioral interview, negotiation, promo docs.'
WHERE slug = 'carreira';

UPDATE bases
SET
    area_label = 'Falar em público · Technical Writing · RFCs',
    description = 'Falar bem, escrever bem, influenciar — a habilidade que multiplica engenheiros. Comunicação Humana + Technical Writing & RFCs com templates reais de Google/Meta/Stripe.'
WHERE slug = 'comunicacao';

UPDATE bases
SET
    area_label = 'SEO · Branding · CAC/LTV · Funil',
    description = 'Marketing digital sem hype: posicionamento, branding, SEO técnico, conteúdo estratégico, métricas que importam (CAC, LTV, conversão), funil end-to-end.'
WHERE slug = 'marketing';

UPDATE bases
SET
    area_label = 'YouTube · LinkedIn · Gravação · Monetização',
    description = 'Criação de conteúdo digital ponta-a-ponta: estratégia editorial, gravação áudio+vídeo, edição, publicação multi-plataforma, métricas e monetização.'
WHERE slug = 'conteudo';

UPDATE bases
SET
    area_label = 'Solo SaaS · Indie Hacker · MVP · Freelance',
    description = 'Produtos digitais, indie hacking e Solo SaaS — sair do CLT virando founder. Empreendedorismo Digital + Solo SaaS / Indie Hacker Stack 2026 (Stripe, multi-tenancy, CAC/LTV, pricing, LLC americana).'
WHERE slug = 'empreendedorismo';

UPDATE bases
SET
    area_label = 'Gramática · 10 cenários reais · Trabalho na gringa',
    description = 'Inglês para Brasileiros na Gringa — gramática essencial + 10 cenários reais (entrevista, daily, code review, design discussion, negociação, conference talk) com 100 trocas cada.'
WHERE slug = 'ingles';
