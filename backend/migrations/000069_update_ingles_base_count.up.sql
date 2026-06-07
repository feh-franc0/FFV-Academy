-- Atualiza contagem da base ingles após +4 trilhas de cenários expandidos
-- com diálogos reais (jun/2026): vida prática, corporativo avançado,
-- academia/pesquisa, relacionamento profundo. +40 módulos.
--
-- Idempotente.

UPDATE bases SET
    modules = 89,
    trails = 8,
    area_label = 'Gramática · 10 cenários · 70 fluxos de conversação real com diálogos',
    description = 'Inglês para brasileiros pra gringa com 8 trilhas e 89 módulos. Cada fluxo traz um trecho de DIÁLOGO REAL (4-6 turnos naturais — começo, pivot, fechamento) mais 100 trocas covering variações: Cotidiano (gramática + aeroporto/moradia/médico/banco), Vida Prática (mecânico/contratante/vet/mudança), Negócios (standup/pitch/feedback/FAANG/salário), Corporativo Avançado (VC pitch/boardroom/aumento/demissão/burnout), Academia (office hours/conference/tese/orientador/rec letter), Social (Tinder/dating/conflito/luto), Relacionamento Profundo (Thanksgiving/pedido casamento/terapia/USCIS/sogro difícil) e Emergências (911/ER/polícia/ICE/IRS/saúde mental).'
WHERE slug = 'ingles';
