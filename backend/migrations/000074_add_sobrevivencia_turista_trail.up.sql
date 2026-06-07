-- Adiciona trilha "Inglês de Sobrevivência: Viagem Turista" (10 mód) ao
-- hub-ingles. Foco no TURISTA que viaja eventual mas trava com nativo
-- falando rápido. Diferente das outras 8 trilhas (que são pra quem MORA
-- fora). Estratégia central: defesa conversacional + módulo de "socorro
-- quando não entendi" com hierarquia de pedidos.
--
-- Idempotente.

UPDATE bases SET
    modules = 99,
    trails = 9,
    area_label = 'Gramática · 10 cenários · 80 fluxos + Sobrevivência Turista',
    description = 'Inglês para brasileiros pra gringa com 9 trilhas e 99 módulos. Cada fluxo traz um trecho de DIÁLOGO REAL (4-6 turnos naturais) + 100 trocas: Cotidiano, Vida Prática, Negócios, Corporativo Avançado, Academia, Social, Relacionamento Profundo, Emergências e Sobrevivência Turista (imigração agressiva, perdido sem internet, mercado local, restaurante estrangeiro, hotel pequeno, Uber+metrô, shopping trocar, farmácia, perdi passaporte, SOCORRO quando não entendi).'
WHERE slug = 'ingles';
