-- Atualiza descrições/area_labels das 6 bases profissionais para remover
-- viés tech-only do texto público. Antes: "para devs", "como engineer",
-- "multiplica engenheiros". Agora: textos sobre o tema em si, acessíveis
-- a qualquer profissional.
--
-- Idempotente — pode reaplicar sem efeito colateral.

UPDATE bases
SET
    area_label = 'Portfólio · Vagas · Entrevista · Promoção',
    description = 'Carreira profissional como sistema: portfólio, busca de vagas no Brasil e fora, entrevista comportamental, negociação salarial e promoção. Para qualquer profissional dirigir a própria trajetória.'
WHERE slug = 'carreira';

UPDATE bases
SET
    area_label = 'Falar em público · Escrita profissional · Reuniões · Feedback',
    description = 'Comunicação humana e escrita profissional: falar em público, conduzir reuniões, storytelling, dar e receber feedback, escuta ativa e documentos que convencem.'
WHERE slug = 'comunicacao';

UPDATE bases
SET
    area_label = 'SEO · Branding · CAC/LTV · Funil · Copy',
    description = 'Marketing digital com método: posicionamento, branding, SEO orgânico, copywriting, funil de aquisição e métricas que importam. Para criadores, autônomos, freelancers e empreendedores.'
WHERE slug = 'marketing';

UPDATE bases
SET
    area_label = 'YouTube · LinkedIn · Instagram · Podcast · Edição · Monetização',
    description = 'Criação de conteúdo digital ponta-a-ponta: estratégia editorial, gravação de áudio e vídeo, edição, publicação multi-plataforma (YouTube, LinkedIn, Instagram, TikTok, podcast), métricas e monetização.'
WHERE slug = 'conteudo';

UPDATE bases
SET
    area_label = 'Produtos digitais · Infoprodutos · Freelance · SaaS · MEI',
    description = 'Produtos digitais, infoprodutos, freelance e renda recorrente: validação de ideia, MVP, formalização MEI, primeiras vendas, modelo de assinatura, distribuição internacional. Da primeira ideia ao negócio rodando.'
WHERE slug = 'empreendedorismo';

UPDATE bases
SET
    area_label = 'Gramática · Vocabulário · 10 cenários do dia a dia',
    description = 'Inglês para brasileiros que vão morar, trabalhar ou viajar fora: gramática essencial + 10 cenários reais do dia a dia (aeroporto, moradia, trabalho, médico, banco, transporte e mais) com 100 trocas reais cada.'
WHERE slug = 'ingles';
