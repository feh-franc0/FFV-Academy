import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, ArchFlow, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('postgis-deep');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença prática entre os tipos geometry e geography no PostGIS?',
    options: [
      'São sinônimos',
      'geometry trabalha em coordenadas planares (Cartesianas) — rápido, exato para áreas pequenas, sensível à projeção (SRID). geography trabalha sobre o esferóide WGS84 (EPSG:4326) — mais lento (~10–20x), mas calcula distâncias reais em metros sobre a superfície curva da Terra, correto em escala continental. Use geometry com SRID local (UTM, SIRGAS-Polyconic) para análise dentro de um país; use geography para "encontre tudo num raio de X metros" globalmente',
      'geography não existe',
      'geometry só serve para pontos',
    ],
    correct: 1,
    explanation: 'PostGIS implementa ambos. geometry usa álgebra 2D plana (R² ou R³), exige reprojeção para distâncias corretas. geography executa cálculos sobre o esferóide WGS84 usando algoritmos esféricos (geodésicas) — ST_Distance retorna metros reais. Trade-off: geography só suporta um subset de funções (ST_Within, ST_DWithin, ST_Intersects, ST_Distance) e é mais lento. Convenção comum: armazenar em geography(Point, 4326) para "lat/lng raw" e converter sob demanda.',
  },
  {
    question: 'O que é o índice GIST e por que é central no PostGIS?',
    options: [
      'É só um nome bonito',
      'Um B-tree comum',
      'GIST (Generalized Search Tree) é uma estrutura de índice extensível do Postgres que suporta operadores espaciais via R-tree-like de bounding boxes. Quando você indexa uma coluna geometry com GIST (CREATE INDEX ... USING GIST), queries com && (overlap), <-> (KNN distance), ST_Intersects (que usa && internamente) escapam do seq scan O(n) e ficam O(log n). Sem GIST, ST_Intersects num table com 10M de geometrias = 30 minutos. Com GIST = 50 ms',
      'Índice exclusivo para texto',
    ],
    correct: 2,
    explanation: 'GIST é o coração da performance espacial no Postgres. Internamente é uma R-tree de bounding boxes (MBR — Minimum Bounding Rectangle). O planner usa o operador && (bbox overlap) para filtrar candidatos rapidamente; depois ST_Intersects faz o teste exato. Por isso o pattern correto é WHERE geom && bbox AND ST_Intersects(geom, polygon). EXPLAIN ANALYZE deve mostrar "Index Scan using ... USING gist".',
  },
  {
    question: 'Como você implementa "encontre as 10 pizzarias mais próximas deste ponto"?',
    options: [
      'SELECT * FROM pizzarias',
      'SELECT *, ST_Distance(loc, ponto) AS d FROM pizzarias ORDER BY d LIMIT 10 — sem índice',
      'SELECT *, loc <-> ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography AS d FROM pizzarias ORDER BY loc <-> ST_SetSRID(ST_MakePoint($lng,$lat),4326)::geography LIMIT 10. O operador <-> (KNN-distance) com GIST suporta "Index Scan + ORDER BY <->" — busca top-K em O(log n) sem ordenar toda a tabela. É o building block do "nearby" em apps de delivery',
      'Não é possível em SQL',
    ],
    correct: 2,
    explanation: 'O operador <-> (KNN) foi introduzido no PostGIS 2.0 (2012) e é a magia por trás de "nearest neighbor" eficiente. Com GIST no campo geom, o planner faz "Index Scan ordering by distance" — não precisa calcular ST_Distance para todos e ordenar. Esse é o pattern do iFood, Uber, Rappi, 99 para encontrar restaurantes/motoristas próximos. ST_Distance no ORDER BY sem KNN faz full scan.',
  },
  {
    question: 'Quando usar ST_DWithin vs ST_Distance < raio?',
    options: [
      'São idênticos',
      'ST_Distance < raio força calcular distância para TODOS antes de filtrar (full scan). ST_DWithin(geom, ponto, raio) usa o índice GIST: expande o bbox em raio metros, filtra candidatos, depois testa exato. É a função de geofence: 100x mais rápida em tabelas grandes',
      'ST_DWithin não existe',
      'ST_Distance sempre é mais rápido',
    ],
    correct: 1,
    explanation: 'Regra de ouro: SEMPRE use ST_DWithin para "raio de X metros". Internamente faz expand-bbox + index scan + teste exato. ST_Distance < raio no WHERE força avaliação por linha. Diferença em produção: 5ms vs 5s numa tabela de 1M geometrias.',
  },
  {
    question: 'Por que ST_MakeValid existe?',
    options: [
      'Para imprimir geometria bonita',
      'Para converter para JSON',
      'Geometrias do mundo real (shapefiles, OSM, KML) frequentemente são "inválidas" topologicamente: polígonos auto-intersectantes, anéis no sentido errado, vértices duplicados. Operações como ST_Intersects retornam erros ou resultados errados nessas geometrias. ST_MakeValid (PostGIS 2.0+) usa GEOS make_valid para reparar — preservando área e forma quando possível',
      'Para deletar registros',
    ],
    correct: 2,
    explanation: 'GEOS (Geometry Engine Open Source, lib que o PostGIS usa por baixo) define topologia OGC estrita. Polígono inválido = bug. ST_MakeValid lida com auto-intersections, ringed-self-touching, duplicate vertices. Sempre rode em dados importados (osm2pgsql, ogr2ogr): UPDATE tbl SET geom = ST_MakeValid(geom) WHERE NOT ST_IsValid(geom).',
  },
  {
    question: 'Qual o segredo do "supply-demand matching" do iFood/Uber em PostGIS?',
    options: [
      'Magia',
      'Indexar geometry em GIST + usar ST_DWithin para filtrar entregadores num raio + ORDER BY <-> para top-K por proximidade real (geodésica) + materializar em redis com TTL curto. Para escala muito alta, particionar por região (city, h3 cell) e usar PostGIS apenas como verificador final do match — o broker (Redis/Kafka) faz o roteamento principal',
      'Usar MongoDB',
      'Apenas SQL puro sem extensões',
    ],
    correct: 1,
    explanation: 'O iFood (Brasil, 70M+ pedidos/mês) usa PostGIS como source-of-truth de geometria de estabelecimentos + entregadores. Hot path real (encontrar entregador próximo) vai para Redis Geo (GEORADIUS) ou h3-pg precomputado, atualizado a cada heartbeat. PostGIS confirma e persiste. Esse split "tier-2 (PostGIS) para consulta complexa + tier-1 (Redis/H3) para realtime" é o padrão de produção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="postgis-deep"
      title="PostGIS profundo: GIST, ST_Intersects, KNN"
      icon="🐘"
      xp={75}
      readTime={15}
      trailName="Maps & Geospatial Engineering"
      trailColor={accent}
      nextSlug="vector-tiles-pipeline"
      nextTitle="Vector tiles: tippecanoe, MBTiles, Tegola, Martin"
      quiz={quiz}
    >
      <Section title="PostGIS: o database espacial de referência" accent={accent}>
        <p>
          <strong>PostGIS</strong> (Refractions Research, 2001; hoje OSGeo) é a extensão espacial do PostgreSQL — &quot;Oracle Spatial gratuito&quot;. Adiciona tipos <code>geometry</code> e <code>geography</code>, ~600+ funções (<code>ST_*</code>), índices GIST/SP-GIST/BRIN espaciais, e suporte a OGC SFA, SQL/MM, GeoJSON, WKT, WKB, KML, GML.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Versão atual', v: 'PostGIS 3.5 (lançado out/2024, requer PostgreSQL 12+)' },
            { k: 'Libs internas', v: 'GEOS (topologia OGC), PROJ (projeções), GDAL (raster), SFCGAL (3D)' },
            { k: 'Specs implementadas', v: 'OGC Simple Features SQL 1.2.1, SQL/MM Spatial' },
            { k: 'Tipos principais', v: 'geometry, geography, raster, topology, hash (H3 via h3-pg, S2 via pgs2)' },
            { k: 'Usuários produção', v: 'iFood, Uber (antes do migration), Rappi, IBGE, OpenStreetMap (oficial), Foursquare' },
            { k: 'Licença', v: 'GPLv2+' },
          ]}
        />
      </Section>

      <Section title="geometry vs geography: a escolha que muda tudo" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'geometry', 'geography']}
          rows={[
            ['Espaço', 'Plano cartesiano R² (ou R³)', 'Esferóide WGS84 (terra curva real)'],
            ['SRID típico', '4326 (lat/lng), 31983 (SIRGAS BR), 3857 (Web Mercator)', '4326 sempre'],
            ['Distância', 'Unidade da projeção (graus, metros)', 'Sempre metros geodésicos'],
            ['Performance', 'Rápida (álgebra 2D direta)', '10–20x mais lenta (cálculos esféricos)'],
            ['Funções suportadas', '600+ (toda a stack PostGIS)', 'Subset: ST_Intersects, ST_Within, ST_DWithin, ST_Distance, ST_Area, ST_Length, ST_Covers'],
            ['Erros comuns', 'Esquecer projeção → distância em graus (errada)', 'Performance ruim em joins enormes'],
            ['Caso típico', 'Análise dentro de país (SP, BR) com SRID local', '"Tudo num raio de 500m" global'],
          ]}
        />
        <CodeBlock lang="sql">{'-- Padrão Brasil oficial (IBGE): SIRGAS 2000 em UTM zona 23S\n-- EPSG:31983 — distâncias em metros, área em m²\n\nCREATE TABLE talhoes (\n  id BIGSERIAL PRIMARY KEY,\n  nome TEXT NOT NULL,\n  area_calc DOUBLE PRECISION GENERATED ALWAYS AS (ST_Area(geom)) STORED,\n  geom GEOMETRY(Polygon, 31983) NOT NULL\n);\n\nCREATE INDEX talhoes_geom_gix ON talhoes USING GIST (geom);\n\n-- Para "estabelecimentos com raio de 500m do usuário" global, prefira geography:\nCREATE TABLE estabelecimentos (\n  id BIGSERIAL PRIMARY KEY,\n  nome TEXT NOT NULL,\n  loc GEOGRAPHY(Point, 4326) NOT NULL\n);\n\nCREATE INDEX estab_loc_gix ON estabelecimentos USING GIST (loc);'}</CodeBlock>
      </Section>

      <Section title="GIST: o índice que muda 30 minutos em 50 ms" accent={accent}>
        <p>
          <strong>GIST</strong> (Generalized Search Tree, Hellerstein et al., 1995) é uma estrutura de índice extensível do Postgres. Para geometria, a implementação é uma <strong>R-tree-like</strong> de Minimum Bounding Rectangles (MBR). O planner usa o operador <code>&amp;&amp;</code> (bbox overlap) para filtrar candidatos antes de chamar funções caras como <code>ST_Intersects</code>.
        </p>
        <ArchFlow
          title="Como GIST acelera ST_Intersects"
          accent={accent}
          columns={[
            { header: 'Sem GIST', items: ['Seq scan da tabela inteira', 'Para cada linha, executa ST_Intersects (CPU caro)', 'Tempo: O(n) — 30 min em 10M linhas'] },
            { header: 'Com GIST', items: ['Index scan: encontra bboxes que se sobrepõem', 'Subset candidato (~0.1% das linhas)', 'ST_Intersects exato apenas no subset', 'Tempo: O(log n) — 50 ms'] },
          ]}
        />
        <CodeBlock lang="sql">{'-- Criar GIST\nCREATE INDEX estab_loc_gix ON estabelecimentos USING GIST (loc);\n\n-- Forçar análise (refresh estatísticas)\nVACUUM ANALYZE estabelecimentos;\n\n-- Query bem feita: && primeiro, ST_Intersects depois\nEXPLAIN ANALYZE\nSELECT id, nome\nFROM estabelecimentos\nWHERE loc && ST_MakeEnvelope(-46.7, -23.6, -46.5, -23.5, 4326)\n  AND ST_Intersects(loc, ST_MakeEnvelope(-46.7, -23.6, -46.5, -23.5, 4326));\n\n-- Plano esperado:\n--  Bitmap Heap Scan on estabelecimentos (cost=...)\n--    Recheck Cond: (loc && ...)\n--    Filter: ST_Intersects(loc, ...)\n--    -> Bitmap Index Scan on estab_loc_gix (cost=...)\n--         Index Cond: (loc && ...)'}</CodeBlock>
        <Callout tone="info" icon="💡">
          <strong>SP-GIST</strong> (Space-Partitioned GIST) é alternativa baseada em quadtree/k-d tree — bom para pontos densos. <strong>BRIN</strong> espacial existe desde Postgres 14: índice tiny para tabelas enormes ordenadas no disco (ex: log de GPS por timestamp).
        </Callout>
      </Section>

      <Section title="KNN: o operador <-> e nearest neighbor real" accent={accent}>
        <p>
          O operador <code>&lt;-&gt;</code> (PostGIS 2.0+, 2012) é o &quot;nearest neighbor&quot; indexável. Combinado com GIST, permite que o planner faça <strong>&quot;Index Scan ordering by distance&quot;</strong> — top-K em <code>O(log n)</code> sem ordenar a tabela inteira.
        </p>
        <CodeBlock lang="sql">{'-- Top 10 pizzarias mais próximas do usuário (lng=-46.6333, lat=-23.5505)\nSELECT id, nome,\n       loc <-> ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326)::geography AS dist_m\nFROM estabelecimentos\nWHERE categoria = \'pizzaria\'\nORDER BY loc <-> ST_SetSRID(ST_MakePoint(-46.6333, -23.5505), 4326)::geography\nLIMIT 10;\n\n-- Plano:\n--  Limit (cost=...)\n--    -> Index Scan using estab_loc_gix on estabelecimentos (cost=...)\n--         Order By: (loc <-> ...)\n--         Filter: (categoria = \'pizzaria\')\n--\n-- O planner percorre o GIST em ordem de proximidade — pára quando tem 10.'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          O ORDER BY precisa ser EXATAMENTE a mesma expressão do operador <code>&lt;-&gt;</code> para o planner usar Index Scan ordering. Mudou o tipo (esqueceu o <code>::geography</code>)? Vira sort em memória.
        </Callout>
      </Section>

      <Section title="ST_DWithin: o geofence canônico" accent={accent}>
        <p>
          &quot;Encontre tudo num raio de X metros&quot; é a query mais comum em geo. <strong>ST_DWithin</strong> é a forma indexável correta — internamente expande o bounding box em X metros, faz index scan, depois testa exato.
        </p>
        <CodeBlock lang="sql">{'-- ERRADO (full scan, calcula distância em todas as linhas):\nSELECT id FROM entregadores\nWHERE ST_Distance(loc, ST_GeogFromText(\'POINT(-46.63 -23.55)\')) < 1500;\n\n-- CERTO (usa GIST):\nSELECT id FROM entregadores\nWHERE ST_DWithin(\n  loc,\n  ST_GeogFromText(\'POINT(-46.63 -23.55)\'),\n  1500  -- metros (em geography sempre metros)\n);\n\n-- Combinado com KNN para "10 entregadores num raio de 1500m, ordenados por distância":\nSELECT id, nome,\n       loc <-> ST_GeogFromText(\'POINT(-46.63 -23.55)\') AS dist_m\nFROM entregadores\nWHERE ST_DWithin(loc, ST_GeogFromText(\'POINT(-46.63 -23.55)\'), 1500)\n  AND status = \'disponivel\'\nORDER BY loc <-> ST_GeogFromText(\'POINT(-46.63 -23.55)\')\nLIMIT 10;'}</CodeBlock>
      </Section>

      <Section title="Geofencing: dentro/fora de polígono" accent={accent}>
        <p>
          Para &quot;está dentro deste polígono?&quot; (zona de entrega, área de cobertura, talhão), use <code>ST_Contains</code> ou <code>ST_Within</code> (inversos), ou <code>ST_Intersects</code> (qualquer toque).
        </p>
        <CodeBlock lang="sql">{'-- Tabela de zonas de cobertura (bairros que entregamos)\nCREATE TABLE zonas_cobertura (\n  id SERIAL PRIMARY KEY,\n  nome TEXT,\n  geom GEOMETRY(MultiPolygon, 4326)\n);\nCREATE INDEX zonas_geom_gix ON zonas_cobertura USING GIST (geom);\n\n-- Endereço do cliente cai em alguma zona?\nSELECT z.id, z.nome\nFROM zonas_cobertura z\nWHERE ST_Contains(z.geom, ST_SetSRID(ST_MakePoint(-46.63, -23.55), 4326));\n\n-- Para "qual bairro contém este ponto" indexado:\nSELECT z.nome\nFROM zonas_cobertura z\nWHERE z.geom && ST_SetSRID(ST_MakePoint(-46.63, -23.55), 4326)\n  AND ST_Contains(z.geom, ST_SetSRID(ST_MakePoint(-46.63, -23.55), 4326))\nLIMIT 1;'}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Função', 'Significado topológico OGC']}
          rows={[
            ['ST_Equals(A, B)', 'A = B (mesmas geometrias)'],
            ['ST_Disjoint(A, B)', 'Nenhuma interseção'],
            ['ST_Intersects(A, B)', 'Pelo menos um ponto em comum (oposto de Disjoint)'],
            ['ST_Touches(A, B)', 'Tocam apenas na borda (não no interior)'],
            ['ST_Crosses(A, B)', 'Atravessam (line através de polygon)'],
            ['ST_Within(A, B)', 'A está totalmente dentro de B'],
            ['ST_Contains(A, B)', 'A contém totalmente B (inverso de Within)'],
            ['ST_Overlaps(A, B)', 'Sobrepõem mas não containment'],
            ['ST_Covers(A, B) / CoveredBy', 'Como Contains mas inclui boundary touching'],
          ]}
        />
      </Section>

      <Section title="ST_MakeValid: reparando o mundo real" accent={accent}>
        <p>
          Geometrias do mundo real (shapefiles, OSM, KML, dados de prefeitura) são <em>frequentemente inválidas</em> topologicamente: polígonos auto-intersectantes, anéis no sentido errado, vértices duplicados. PostGIS detecta com <code>ST_IsValid</code> e repara com <code>ST_MakeValid</code> (usa GEOS make_valid).
        </p>
        <CodeBlock lang="sql">{'-- Encontrar inválidos\nSELECT id, ST_IsValidReason(geom)\nFROM bairros\nWHERE NOT ST_IsValid(geom);\n--  id |              reason\n-- ----+----------------------------------\n--  42 | Self-intersection[-46.621 -23.55]\n--  87 | Ring Self-intersection[-46.7 -23.6]\n\n-- Reparar in-place (atômico em transação)\nBEGIN;\nUPDATE bairros\n  SET geom = ST_MakeValid(geom)\n  WHERE NOT ST_IsValid(geom);\nCOMMIT;\n\n-- Em pipelines de ingestão sempre rodar:\nUPDATE staging.bairros_raw\n  SET geom = ST_Multi(ST_CollectionExtract(ST_MakeValid(geom), 3))\n  WHERE NOT ST_IsValid(geom);\n-- ST_CollectionExtract extrai só polygons (tipo 3) caso make_valid retorne GeometryCollection'}</CodeBlock>
      </Section>

      <Section title="Fórmulas: por que geography é mais lento" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="Distância plana (geometry) vs geodésica (geography)"
          formula="d_plana = √((x₂-x₁)² + (y₂-y₁)²)     vs     d_geodésica = 2·R·asin(√(sin²(Δφ/2) + cos(φ₁)·cos(φ₂)·sin²(Δλ/2)))"
          parts={[
            { text: 'd_plana', annotation: 'Distância euclidiana 2D — duas multiplicações + sqrt. ~5ns por par' },
            { text: 'R', annotation: 'Raio da Terra (~6371 km no esferoide WGS84)' },
            { text: 'φ₁, φ₂', annotation: 'Latitudes em radianos' },
            { text: 'Δλ', annotation: 'Diferença de longitude em radianos' },
            { text: 'asin, sin, cos', annotation: 'Funções trigonométricas — ~50ns cada. Total da fórmula Haversine: ~300ns por par. PostGIS usa Vincenty para geography (mais preciso, mais caro ~600ns)' },
          ]}
        />
        <p>
          Para 1M comparações: <code>geometry</code> demora ~5ms; <code>geography</code> demora ~600ms. Por isso a regra: <strong>geometry com SRID projetado dentro de um país, geography para escala global onde a curvatura importa</strong>.
        </p>
      </Section>

      <Section title="EXPLAIN espacial: lendo o plano" accent={accent}>
        <CodeBlock lang="sql">{'EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT id FROM entregadores\nWHERE ST_DWithin(loc, ST_GeogFromText(\'POINT(-46.63 -23.55)\'), 1500);\n\n-- BOM:\n--  Index Scan using entregadores_loc_gix on entregadores  (cost=0.41..8.43 rows=12 width=8) (actual time=0.12..0.34 rows=15 loops=1)\n--    Index Cond: (loc && _st_expand(\'..\'::geography, 1500))\n--    Filter: ST_DWithin(loc, \'...\'::geography, 1500)\n--    Buffers: shared hit=8\n--  Planning Time: 0.18 ms\n--  Execution Time: 0.41 ms\n\n-- RUIM:\n--  Seq Scan on entregadores  (cost=0.00..245000 rows=12 width=8) (actual time=8200..8200 rows=15 loops=1)\n--    Filter: ST_DWithin(loc, \'...\'::geography, 1500)\n--    Buffers: shared hit=120000\n--  Execution Time: 8203 ms'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Se você ver <strong>Seq Scan</strong> em query espacial com WHERE de proximidade: provavelmente esqueceu o GIST, ou a estatística está desatualizada (rodar <code>VACUUM ANALYZE</code>), ou misturou tipo (geom vs geography sem cast).
        </Callout>
      </Section>

      <Section title="iFood: arquitetura real de matching" accent={accent}>
        <FlowDiagram
          title="Fluxo de matching pedido → entregador (simplificado)"
          accent={accent}
          orientation="vertical"
          steps={[
            { label: 'Pedido confirmado', desc: 'Webhook do checkout cria registro com loc do estabelecimento + loc do cliente' },
            { label: 'Redis Geo (hot)', desc: 'GEORADIUS busca entregadores num raio inicial de 1km, ordenados por distância. P50: 2ms' },
            { label: 'Filtros de negócio', desc: 'Em Go service: capacidade (mochila), avaliação, distância máxima da rota, score do entregador' },
            { label: 'PostGIS (cold path)', desc: 'Se Redis vazio (área seca), fallback para SELECT em PostGIS com ST_DWithin + KNN ampliando raio. P95: 80ms' },
            { label: 'Push notification', desc: 'FCM/APNs para top-3, aceita primeiro' },
            { label: 'Persistir trip', desc: 'INSERT em trips com geom da rota (gerada por OSRM ou Google Directions). Async para warehouse de analytics' },
          ]}
        />
        <Callout tone="info" icon="📊">
          <strong>Por que Redis + PostGIS?</strong> Redis Geo (sorted set de geohash) é O(log n) para GEORADIUS, mas é cache — eventualmente consistente. PostGIS é source-of-truth com integridade transacional, mas latência maior. O split é deliberado: hot path no Redis, source-of-truth + analytics no Postgres.
        </Callout>
      </Section>

      <Section title="Anti-patterns frequentes" accent={accent}>
        <Callout tone="danger" icon="🚨">
          <strong>SRID 0 (sem projeção).</strong> Ingerir geometria sem SRID quebra todas as funções de distância. Sempre defina explicitamente: <code>ST_SetSRID(ST_MakePoint(lng, lat), 4326)</code>.
        </Callout>
        <Callout tone="danger" icon="🚨">
          <strong>Misturar SRIDs sem ST_Transform.</strong> <code>ST_Intersects(geom_4326, geom_31983)</code> lança erro. Use <code>ST_Transform</code> ou padronize tudo em um SRID na ingestão.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>ST_Buffer em geography.</strong> Funciona mas é lento. Para "área de cobertura", prefira pré-computar polygon de buffer em geometry projetada (UTM/SIRGAS) e armazenar.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Esquecer VACUUM ANALYZE após bulk insert.</strong> O planner usa estatísticas das colunas geometry. Sem ANALYZE recente, ele estima errado e escolhe seq scan.
        </Callout>
      </Section>

      <Section title="Quando NÃO usar PostGIS" accent={accent}>
        <DecisionBox
          scenario="Vou armazenar 10 bilhões de pontos GPS (telemetria de veículos)"
          winner="PostGIS particionado por tempo + h3-pg + ClickHouse para analytics"
          winnerColor={accent}
          why="PostGIS escala muito bem até dezenas de milhões de pontos com GIST. Acima de bilhões, o planejamento custa mais que a query. Particione por dia + index só os últimos N dias. Para analytics OLAP (heatmap mensal), exporte para ClickHouse com tipo Geo nativo."
          alternatives={[
            { name: 'Apenas Redis Geo', when: 'Você só precisa de "nearest neighbor realtime" e os dados são efêmeros. Sem persistência analítica complexa.' },
            { name: 'ElasticSearch geo_point', when: 'Você precisa de search full-text + geo no mesmo motor (Airbnb-like). Aceita custo de duplicação de dados.' },
            { name: 'BigQuery GIS', when: 'Você é GCP-native, dados em escala petabytes, análise batch (não realtime). Sintaxe similar (ST_*), latência de segundos a minutos.' },
          ]}
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Docs oficiais', v: 'postgis.net/documentation — referência completa de cada ST_*' },
            { k: 'Boundless workshop', v: 'workshops.boundlessgeo.com/postgis-intro — tutorial canônico (gratuito)' },
            { k: 'PostGIS in Action (Obe & Hsu)', v: 'Livro de referência prática, 3rd edition (Manning)' },
            { k: 'OGC SFA-SQL 1.2.1', v: 'ogc.org/standards/sfs — spec implementada' },
            { k: 'GEOS', v: 'libgeos.org — engine topológica usada por baixo' },
            { k: 'h3-pg', v: 'github.com/zachasme/h3-pg — extension para H3 dentro de Postgres' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
