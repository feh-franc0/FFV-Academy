import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, AnnotatedFormula, ArchFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('spatial-queries-postgres');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'O que torna o H3 (Uber) atrativo como sistema de indexing espacial discreto?',
    options: [
      'É um logotipo bonito',
      'É proprietário',
      'H3 (Uber, 2018) tessela a Terra em células hexagonais hierárquicas (16 resoluções, de continentes a ~1m²). Hexágonos têm uma propriedade que quadrados não têm: TODOS os vizinhos estão à mesma distância centro-a-centro (6 vizinhos exatamente equidistantes). Isso elimina viés direcional em algoritmos de agregação, density mapping, k-ring expansion. Uber usa para matching motorista-passageiro, surge pricing por hexágono',
      'Não tem aplicação real',
    ],
    correct: 2,
    explanation: 'H3 (Isaac Brodsky / Uber Engineering, 2018, Apache 2.0) é hierarquia hexagonal global. 16 resoluções (res 0 = ~4M km² por célula até res 15 = ~0.9 m²). Vantagens vs quadkey/geohash: vizinhança uniforme (sem "corner neighbors" ambíguos), forma compacta para distance bands, mesh contínua. Uber publicou em eng.uber.com/h3 explicando por que rejeitaram quadtree para o problema de surge pricing.',
  },
  {
    question: 'S2 (Google) vs H3 (Uber) — qual a diferença fundamental?',
    options: [
      'Idênticos',
      'S2 (Google, 2013-2017) projeta a esfera em 6 faces de cubo subdivididas em quadtree, usando Hilbert curve para linearização — chave 64-bit ordenada (CellID). Forte em: range queries (cells próximas têm IDs próximos), inclusão/contenção exata, sistema de coords esférico real. H3 hexagonal, melhor para vizinhança uniforme/agregação. S2 é usado por Google Maps, Foursquare, MongoDB ($geoIntersects). H3 por Uber, OpenStreetMap, AirBnB',
      'S2 não existe',
      'H3 só é triangular',
    ],
    correct: 1,
    explanation: 'S2 é um sistema de cell hierárquico esférico baseado em quadtree por face de cubo + Hilbert curve. A genialidade: cells adjacentes em espaço também são adjacentes em CellID (locality preservation). Indexar S2 cell em B-tree do banco já dá range queries espaciais grátis. Por isso MongoDB e Cassandra usam internamente. Vai a github.com/google/s2geometry para o paper conceptual.',
  },
  {
    question: 'Quadkey (Bing Maps, Microsoft) — quando ainda usar?',
    options: [
      'Sempre',
      'Quadkey (Bing Maps, 2006) é a string que codifica recursivamente a posição num quadtree (cada char ∈ {0,1,2,3} dá um quadrante). 23-30 chars cobre o planeta com precisão sub-métrica. Forte em: legibilidade humana, range prefix queries triviais (LIKE "012%" pega tudo abaixo de um nó), suporte legado MS. Fraco em: vizinhança não uniforme (corners), formato não otimizado para distance. Sobrevive em sistemas legados Bing, Azure Maps',
      'Apenas para o sistema solar',
      'É só pra raster',
    ],
    correct: 1,
    explanation: 'Quadkey é a versão mais primitiva — string de dígitos {0,1,2,3} representando subdivisões recursivas. Geohash (Niemeyer, 2008) é similar mas com alfabeto base32 (32 quadrantes). Geohash + Hilbert curve melhorou a locality. S2 e H3 são gerações posteriores. Quadkey ainda aparece em sistemas que indexam tiles Bing/Azure ou em código legado.',
  },
  {
    question: 'Clustering em zoom-out: qual a abordagem certa?',
    options: [
      'Carregar tudo no client',
      'Pré-computar clusters por H3 cell em resoluções correspondentes a cada zoom level: zoom 4 → H3 res 4 (~1768 km²), zoom 10 → H3 res 7 (~5 km²), zoom 14 → H3 res 9 (~0.1 km²). Backend retorna pontos agregados por cell. Cliente renderiza círculo proporcional à count. Escala para bilhões de pontos sem trazer todos para o cliente',
      'Random sample',
      'Não há solução',
    ],
    correct: 1,
    explanation: 'Density mapping de bilhões de pontos (cabines do 192, GPS de frota, eventos IoT) não cabe no cliente. Server-side aggregation por hexagonal cell é o padrão: GROUP BY h3_cell em PostGIS via h3-pg, retorna ~1000 polígonos coloridos por densidade. Mapbox e MapLibre renderizam hexgrid nativo. Tableau, Kepler.gl, Power BI Maps fazem o mesmo.',
  },
  {
    question: 'Por que rideshare (Uber/99) usa H3 para matching, não PostGIS direto?',
    options: [
      'Por moda',
      'Porque PostGIS ST_DWithin tem overhead de Index Scan + função GEOS, mesmo indexado. Em escala (~10M motoristas online), querying redis-style por h3_cell é 100-1000x mais rápido: motorista atualiza sua célula (1 SET no Redis), pedido pede motoristas em k-ring(5) da sua célula (lookup direto). PostGIS é source-of-truth, H3+Redis é o hot path realtime',
      'PostGIS não funciona',
      'Apenas marketing',
    ],
    correct: 1,
    explanation: 'O blog post canônico é "H3: Uber\'s Hexagonal Hierarchical Spatial Index" (eng.uber.com/h3, 2018). Cada motorista atualiza sua célula H3 a cada heartbeat (1 GEOADD ou HSET no Redis). Pedido vem: calcular h3 do pickup, expandir k-ring(K) (vizinhos a até K hops), buscar motoristas em cada célula. Tempo: ~1ms. PostGIS validaria edge cases mas não está no caminho crítico.',
  },
  {
    question: 'Como integrar H3 com PostGIS de verdade?',
    options: [
      'Não dá',
      'h3-pg (Zachary Asher / Carto, github.com/zachasme/h3-pg) é uma extensão C que adiciona funções H3 nativas ao PostgreSQL: h3_lat_lng_to_cell(point, res), h3_cell_to_boundary(cell), h3_grid_disk(cell, k), h3_polygon_to_cells(polygon, res). Use em CTEs para "para cada pedido, hexágonos a até k cells de distância, com agregação de motoristas". É a melhor coisa da geo-stack de 2024-2026 para Postgres',
      'Apenas em Oracle',
      'Substitui o PostGIS',
    ],
    correct: 1,
    explanation: 'h3-pg expõe a lib C oficial do Uber dentro do Postgres. Performance native — sem callout a serviço externo. Funções essenciais: h3_lat_lng_to_cell, h3_grid_disk (anel de cells vizinhas), h3_polygon_to_cells (qual cells preenchem este polígono?). Combinado com índice GIN ou BRIN na coluna h3_cell, mostra ganho de 10-100x sobre ST_DWithin puro em casos de matching denso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="spatial-queries-postgres"
      title="Spatial queries em produção: clusters, h3, S2"
      icon="📍"
      xp={70}
      readTime={14}
      trailName="Maps & Geospatial Engineering"
      trailColor={accent}
      nextSlug="openstreetmap-pipeline"
      nextTitle="OpenStreetMap pipeline: planet.osm, Overpass, mudança real"
      quiz={quiz}
    >
      <Section title="O problema das queries espaciais em escala" accent={accent}>
        <p>
          PostGIS + GIST é fantástico até alguns milhões de geometrias. Acima disso — e quando o problema vira <em>encontrar vizinhos em tempo real entre milhões de entidades móveis</em> (motoristas, entregadores, navios) — abordagens baseadas em <strong>indexação espacial discreta</strong> (H3, S2, Quadkey, Geohash) começam a ganhar de tudo o resto. Esta aula explica por que e como integrar.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Indexing discreto', v: 'Cada ponto mapeado para uma "célula" finita (string ou int64). Vizinhança e contenção viram lookup ou prefix match' },
            { k: 'Trade-off', v: 'Precisão fixa por nível de resolução. Cells próximas em ID = próximas em espaço (com nuances)' },
            { k: 'Vantagem em escala', v: 'Comparações viram igualdade de chave (O(1) em hash, O(log n) em B-tree) — não geometric operations' },
            { k: 'Usos canônicos', v: 'Matching realtime, surge pricing, heatmaps, supply-demand balancing, distributed sharding' },
          ]}
        />
      </Section>

      <Section title="Os quatro sistemas mais usados" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Sistema', 'Origem', 'Forma', 'Forte em', 'Usuários canônicos']}
          rows={[
            ['Geohash', 'Niemeyer, 2008', 'Retângulo (base32)', 'Prefix match, legibilidade', 'Elasticsearch, Redis Geo'],
            ['Quadkey', 'Bing Maps, 2006', 'Quadrante recursivo', 'Tiles XYZ, legado MS', 'Azure Maps, Bing'],
            ['S2', 'Google, 2013', 'Quadrante esférico + Hilbert curve', 'Range queries B-tree-friendly, contenção exata', 'Google Maps, MongoDB, Foursquare'],
            ['H3', 'Uber, 2018', 'Hexágono hierárquico', 'Vizinhança uniforme, agregação', 'Uber, AirBnB, OSM, INPE (queimadas)'],
          ]}
        />
        <Callout tone="info" icon="📜">
          Antes de escolher, leia: <em>H3: Uber&apos;s Hexagonal Hierarchical Spatial Index</em> (eng.uber.com, 2018) e <em>S2 Geometry — A Quadrilateralized Spherical Cube</em> (s2geometry.io, Google 2017).
        </Callout>
      </Section>

      <Section title="H3 em detalhe: 16 resoluções da Terra" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Res', 'Área média', 'Hex edge', 'Caso típico']}
          rows={[
            ['0', '4.250.546 km²', '1107 km', 'Continente / país inteiro'],
            ['4', '1.770 km²', '22 km', 'Estado / região metropolitana'],
            ['7', '5,16 km²', '1,2 km', 'Bairro grande'],
            ['9', '0,105 km² (10,5 ha)', '174 m', 'Quadra urbana'],
            ['10', '0,015 km² (1,5 ha)', '66 m', 'Lote / endereço'],
            ['12', '0,002 km² (~2000 m²)', '9 m', 'Mesa / sala'],
            ['15', '0,9 m²', '0,5 m', 'Posição precisa'],
          ]}
        />
        <AnnotatedFormula
          accent={accent}
          title="Vizinhança em H3 (k-ring)"
          formula="N_k(cell) = { cells dentro de k hops do centro }     |N_k| = 3·k·(k+1) + 1"
          parts={[
            { text: 'k=0', annotation: 'Apenas a célula central (1 cell)' },
            { text: 'k=1', annotation: 'Centro + 6 vizinhos imediatos = 7 cells' },
            { text: 'k=2', annotation: '7 + 12 = 19 cells' },
            { text: 'k=5', annotation: '91 cells (mesh esférica densa)' },
            { text: 'Uso real', annotation: 'Para "motoristas a até 5 hexágonos do pedido", k-ring(5) na res 9 cobre ~5 km com 91 lookups O(1) em Redis' },
          ]}
        />
      </Section>

      <Section title="h3-pg: a extensão Postgres" accent={accent}>
        <CodeBlock lang="sql">{'-- Instalar (assume Postgres + PGXS)\n-- git clone https://github.com/zachasme/h3-pg && make && make install\nCREATE EXTENSION h3;\nCREATE EXTENSION h3_postgis CASCADE;  -- integração com geometry/geography\n\n-- Schema típico de pedidos\nCREATE TABLE pedidos (\n  id BIGSERIAL PRIMARY KEY,\n  user_id BIGINT,\n  pickup_lat DOUBLE PRECISION,\n  pickup_lng DOUBLE PRECISION,\n  pickup_geom GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS\n    (ST_GeogFromText(\'POINT(\' || pickup_lng || \' \' || pickup_lat || \')\')) STORED,\n  pickup_h3_9 H3INDEX GENERATED ALWAYS AS\n    (h3_lat_lng_to_cell(POINT(pickup_lng, pickup_lat), 9)) STORED,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE INDEX pedidos_pickup_geom_gix ON pedidos USING GIST (pickup_geom);\nCREATE INDEX pedidos_pickup_h3_9_idx  ON pedidos (pickup_h3_9);\n\n-- Tabela de motoristas (atualizada em tempo real via Redis, snapshot em Postgres)\nCREATE TABLE motoristas (\n  id BIGINT PRIMARY KEY,\n  loc_h3_9 H3INDEX NOT NULL,\n  status TEXT NOT NULL,\n  last_seen_at TIMESTAMPTZ NOT NULL\n);\nCREATE INDEX motoristas_h3_9_status_idx ON motoristas (loc_h3_9, status) WHERE status = \'disponivel\';\n\n-- "Motoristas disponíveis a até 5 hexágonos do pedido 12345"\nWITH p AS (\n  SELECT pickup_h3_9 FROM pedidos WHERE id = 12345\n),\nring AS (\n  SELECT unnest(h3_grid_disk((SELECT pickup_h3_9 FROM p), 5)) AS cell\n)\nSELECT m.id, m.last_seen_at\nFROM motoristas m\nJOIN ring r ON m.loc_h3_9 = r.cell\nWHERE m.status = \'disponivel\'\nORDER BY h3_grid_distance(m.loc_h3_9, (SELECT pickup_h3_9 FROM p))\nLIMIT 10;'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Esse pattern (<code>h3_grid_disk</code> + JOIN por cell) tem performance constante mesmo com milhões de motoristas. PostGIS puro com ST_DWithin teria que avaliar geometria em cada candidato.
        </Callout>
      </Section>

      <Section title="Cluster por zoom: heatmap real" accent={accent}>
        <p>
          Para um heatmap de 10 milhões de queimadas (caso INPE/Brasil), o cliente não pode carregar todos os pontos. Solução: agregar server-side por H3 cell na resolução adequada ao zoom.
        </p>
        <ArchFlow
          title="Heatmap H3 multi-resolução"
          accent={accent}
          columns={[
            { header: 'Backend (PostGIS + h3-pg)', items: ['Materialized view por resolução (4, 7, 9)', 'GROUP BY h3_cell + COUNT', 'Atualizado por cron diário', 'Output: GeoJSON FeatureCollection de hexágonos com count'] },
            { header: 'API', items: ['/api/heatmap?z={zoom}&bbox={...}', 'Mapeia zoom → res H3 (z<6→res4, z<11→res7, else res9)', 'Filtra hexágonos por bbox', 'Cache CDN 5 min'] },
            { header: 'Cliente (MapLibre)', items: ['Adiciona source GeoJSON', 'Layer fill com color stop por count', 'Recarrega ao mudar zoom/pan'] },
          ]}
        />
        <CodeBlock lang="sql">{'-- Materialized view de queimadas agregadas em H3 res 7\nCREATE MATERIALIZED VIEW queimadas_h3_7 AS\nSELECT\n  h3_lat_lng_to_cell(POINT(lng, lat), 7) AS cell,\n  COUNT(*) AS total,\n  MAX(detected_at) AS last_event,\n  h3_cell_to_boundary_geometry(\n    h3_lat_lng_to_cell(POINT(lng, lat), 7)\n  ) AS geom\nFROM queimadas\nGROUP BY 1;\n\nCREATE INDEX queimadas_h3_7_cell_idx ON queimadas_h3_7 (cell);\nCREATE INDEX queimadas_h3_7_geom_gix ON queimadas_h3_7 USING GIST (geom);\n\n-- Refresh diário (pg_cron)\nSELECT cron.schedule(\'queimadas-refresh\', \'0 4 * * *\',\n  $$REFRESH MATERIALIZED VIEW CONCURRENTLY queimadas_h3_7$$);\n\n-- Query da API por bbox\nSELECT\n  ST_AsGeoJSON(geom)::json AS geometry,\n  json_build_object(\'count\', total, \'last\', last_event) AS properties\nFROM queimadas_h3_7\nWHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326);'}</CodeBlock>
      </Section>

      <Section title="S2: o quadtree esférico do Google" accent={accent}>
        <p>
          <strong>S2 Geometry</strong> (s2geometry.io, Google open-source 2017) representa pontos na esfera projetando em 6 faces de cubo, dividindo cada face em quadtree, e linearizando via <em>Hilbert curve</em>. Resultado: chave <code>CellID</code> (int64) onde cells adjacentes em espaço têm IDs próximos. Indexar em B-tree do banco já dá range queries espaciais grátis.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'H3 (Uber)', 'S2 (Google)']}
          rows={[
            ['Forma das cells', 'Hexágonos', 'Quadrados curvos sobre esfera'],
            ['Hierarquia', '16 níveis discretos (res 0-15)', '30 níveis (level 0-30)'],
            ['Vizinhança', '6 vizinhos uniformes', '4 vizinhos diretos + 4 diagonais (não uniforme)'],
            ['Linearização', 'Não nativa', 'Hilbert curve nativa'],
            ['Range queries B-tree', 'Indireto', 'Direto (CellID ordenado preserva proximidade)'],
            ['Polygon coverer', 'h3_polygon_to_cells', 'S2RegionCoverer (set mínimo de cells cobre polígono)'],
            ['Casos canônicos', 'Matching realtime, agregação', 'Indexing geográfico em DB transacional, region containment'],
          ]}
        />
        <CodeBlock lang="javascript">{'// S2 em JS (s2.js / nodejs-s2)\nimport { CellId, LatLng } from \'s2geometry\';\n\nconst point = LatLng.fromDegrees(-23.5505, -46.6333);\nconst cell  = CellId.fromLatLng(point);\nconst lvl15 = cell.parentL(15);  // level 15 = ~250m² no equador\nconsole.log(lvl15.toToken());     // ex: "94ce3ff4" (string hex compacta)\n\n// Range para queries em DB:\n// "todos os pontos em cells dentro deste polígono"\n// → coverer.getCovering(polygon) retorna lista de cell ranges\n// → SELECT * FROM tbl WHERE cell_id BETWEEN range_min AND range_max'}</CodeBlock>
      </Section>

      <Section title="Quando usar cada um" accent={accent}>
        <DecisionBox
          scenario="Vou construir matching realtime de motoristas/passageiros"
          winner="H3 (res 9) + Redis sorted set"
          winnerColor={accent}
          why="Vizinhança hexagonal uniforme = sem viés direcional no algoritmo. Performance constante via lookup direto. Uber publicou o playbook."
          alternatives={[
            { name: 'S2', when: 'Sua infra já é B-tree / SQL. Você precisa de range queries simples e indexing em coluna comum.' },
            { name: 'PostGIS + Redis Geo', when: 'Volume médio (até alguns milhões), você quer manter source of truth no Postgres, e Redis Geo (GEORADIUS) é suficiente.' },
            { name: 'Geohash', when: 'Você precisa de prefix queries legíveis (logs, debug, URLs compartilháveis) e aceita vizinhança não uniforme.' },
          ]}
        />
        <DecisionBox
          scenario="Quero fazer heatmap de eventos (queimadas, acidentes, vendas) em escala"
          winner="H3 + materialized view por resolução"
          winnerColor={accent}
          why="Agregação hexagonal é visualmente mais limpa e estatisticamente menos enviesada que grid quadrado. Pré-computar por resolução elimina latência."
          alternatives={[
            { name: 'KDE (Kernel Density Estimation)', when: 'Você quer mapa contínuo (gradient) em vez de hexágonos discretos. Mais caro para computar.' },
            { name: 'PostGIS ST_ClusterDBSCAN', when: 'Você quer clusters semanticamente diferentes (não regulares), tipo "manchas de incêndios".' },
          ]}
        />
      </Section>

      <Section title="Anti-patterns" accent={accent}>
        <Callout tone="danger" icon="🚨">
          <strong>Indexar H3 cells como TEXT.</strong> H3INDEX é uint64 — usar VARCHAR triplica espaço de índice e mata performance. Use o tipo nativo do h3-pg (<code>H3INDEX</code>).
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Misturar resoluções no mesmo índice.</strong> Compare sempre cells na mesma resolução. h3-pg tem <code>h3_cell_to_parent(cell, res)</code> e <code>h3_cell_to_children(cell, res)</code>.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Esquecer que H3 cells &quot;quebram&quot; em pentágonos.</strong> 12 cells especiais no planeta (canto do icosaedro) são pentágonos em vez de hexágonos. Em escala continental raramente importa, mas algoritmos que assumem 6 vizinhos podem quebrar.
        </Callout>
      </Section>

      <Section title="Stack completa: matching realtime" accent={accent}>
        <FlowDiagram
          title="Pedido entra → motorista é matchado em <100ms"
          accent={accent}
          orientation="vertical"
          steps={[
            { label: 'Motoristas mandam heartbeat', desc: 'A cada 5s: POST /loc com lat/lng. Backend computa h3_cell res 9, atualiza Redis HSET motoristas:{cell} {id} {meta}' },
            { label: 'Pedido entra', desc: 'POST /pedidos com pickup. Backend computa pickup_cell.' },
            { label: 'k-ring lookup', desc: 'h3_grid_disk(pickup_cell, 3) retorna 37 cells vizinhas. Para cada cell: HGETALL motoristas:{cell} em Redis (pipeline)' },
            { label: 'Filter + score', desc: 'Aplica filtros (capacidade, rating, distância real). Score = α·proximidade + β·rating - γ·tempo_de_espera_dele' },
            { label: 'Match top-1', desc: 'Envia push notification para top-1. Espera 5s aceite. Senão top-2, ...' },
            { label: 'Persistir', desc: 'INSERT em pedidos+matches (PostGIS) async. Latência total: ~80ms' },
          ]}
        />
      </Section>

      <Section title="Referências" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'H3 docs', v: 'h3geo.org — refs, paper, exemplos' },
            { k: 'H3 paper Uber', v: 'eng.uber.com/h3 (post canônico)' },
            { k: 'h3-pg', v: 'github.com/zachasme/h3-pg' },
            { k: 'S2 Geometry', v: 's2geometry.io + github.com/google/s2geometry' },
            { k: 'Geohash original', v: 'geohash.org — Niemeyer 2008' },
            { k: 'Comparação Uber Eng', v: 'eng.uber.com/h3 — "Why hexagons?" seção mais citada' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
