import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, DecisionBox, StackFlow, ArchFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vector-tiles-pipeline');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'O que tippecanoe (Mapbox/Felt) faz e por que é o padrão para gerar vector tiles?',
    options: [
      'É um servidor web',
      'É um cliente JavaScript',
      'tippecanoe (Eric Fischer / Mapbox, hoje mantido pela Felt) é um CLI que pega GeoJSON e gera tileset MBTiles MVT (Mapbox Vector Tiles) com zoom adaptativo, simplificação de geometria por zoom (Douglas-Peucker), filtragem de features por importância, e múltiplas camadas. É o gerador de tiles de fato — usado por OpenStreetMap, Felt, Mapbox internamente, e qualquer pipeline OSS sério',
      'Substitui o PostgreSQL',
    ],
    correct: 2,
    explanation: 'tippecanoe (anagrama de "tile" e nome de chefe Shawnee) lê GeoJSON streaming, simplifica geometrias por zoom level (Douglas-Peucker com tolerância proporcional ao tile size), gerencia overzoom, e empacota em MBTiles (SQLite). Opções críticas: --drop-densest-as-needed (limite de bytes por tile), --coalesce, --reorder, --no-feature-limit. Tippecanoe + PMTiles = pipeline básico de mapas vetoriais self-hosted.',
  },
  {
    question: 'O que é MBTiles e qual sua estrutura interna?',
    options: [
      'Um formato de imagem',
      'MBTiles (Mapbox, 2011) é um SQLite com schema fixo: tabela "tiles" (zoom_level, tile_column, tile_row, tile_data BLOB) + metadata (name, format, minzoom, maxzoom, bounds, vector_layers). Universal entre Mapbox, MapLibre, Tegola, Martin, QGIS. O blob pode ser PNG (raster) ou pbf gzipped (vector MVT)',
      'Um formato XML',
      'Uma extensão do PostgreSQL',
    ],
    correct: 1,
    explanation: 'MBTiles é só SQLite com convention: SELECT tile_data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?. Simplicidade extrema — qualquer linguagem com SQLite driver pode servir. Limitação: arquivo monolítico (movimento e replicação são pesados). Por isso o PMTiles surgiu como evolução: index + tiles num arquivo único acessível via HTTP Range.',
  },
  {
    question: 'PMTiles vs MBTiles: qual a diferença de operação?',
    options: [
      'São iguais',
      'MBTiles é SQLite e exige servidor (Martin, TileServer GL) para fazer SELECT por z/x/y. PMTiles (Protomaps, 2022) é cloud-native: layout otimizado para HTTP Range requests — você dropa o arquivo em S3/R2/qualquer object storage com CORS e o cliente busca byte-ranges direto via plugin maplibre-pmtiles. Zero servidor, custo marginal próximo de zero, perfeito para sites estáticos',
      'PMTiles só roda em Windows',
      'MBTiles não suporta vetorial',
    ],
    correct: 1,
    explanation: 'PMTiles (Brandon Liu / Protomaps) usa header + diretórios + dados arranjados de forma que o cliente faz 1-3 HTTP 206 Range requests para encontrar o tile certo. Servir do Cloudflare R2 (egress grátis): planet de OSM em vetorial por ~$5/mês. CDN cacheia ranges. É a evolução natural de MBTiles para a era cloud-native.',
  },
  {
    question: 'O que Martin (PostGIS) faz que tippecanoe não?',
    options: [
      'Martin (MapLibre Organization, originalmente da Urbica) é um tile server escrito em Rust que gera vector tiles MVT em tempo real DIRETO de PostGIS — você não pré-gera, ele faz SELECT ST_AsMVT por request. Vantagem: dados sempre fresquíssimos (mostrar entregadores se movendo). Trade-off: load no PostGIS para cada tile request — cacheável via CDN com TTL curto',
      'Martin é um cliente JS',
      'Martin substitui o Postgres',
      'Martin é só pra raster',
    ],
    correct: 0,
    explanation: 'Martin (github.com/maplibre/martin) é a stack escolhida quando dados mudam constantemente: rastreamento de frota, dashboards de IoT, mapas de cidade smart. Suporta múltiplos backends (PostGIS, PMTiles, MBTiles, raw functions). Configuração simples: aponta para Postgres, ele introspect tabelas com coluna geometry e expõe rota /{schema}.{table}/{z}/{x}/{y}. Roda em ~10MB RAM, alta concorrência.',
  },
  {
    question: 'Quando usar Tegola vs Martin vs tippecanoe?',
    options: [
      'tippecanoe = batch (pré-gera MBTiles/PMTiles a partir de GeoJSON, ideal para dados estáticos como bairros do IBGE). Martin = real-time direto de PostGIS (dados que mudam constantemente). Tegola = real-time em Go, similar ao Martin, com configuração via TOML e suporte legado a PostGIS — usado por OpenStreetMap US e algumas agências federais americanas',
      'São idênticos',
      'tippecanoe é o único válido',
      'Apenas Martin funciona em Linux',
    ],
    correct: 0,
    explanation: 'O critério é dados estáticos vs mutáveis e a linguagem do time. tippecanoe = workflow batch (gera uma vez, serve estático). Martin (Rust) e Tegola (Go) = tile servers dinâmicos. Stack pragmática: tippecanoe para dados imutáveis (limites administrativos, ruas OSM), Martin para o que se mexe (entregadores, sensores). PMTiles também roda em modo dinâmico via Martin.',
  },
  {
    question: 'Como você lida com tiles que ficam grandes demais (>500KB)?',
    options: [
      'Comprar mais RAM',
      'tippecanoe tem flags: --drop-densest-as-needed (drop features menos importantes para caber), --coalesce-densest-as-needed (merge), --extend-zooms-if-still-dropping (gera zooms extras), --simplification (Douglas-Peucker), --layer-priorities. Limit recomendado: 500KB por tile MVT comprimido. Acima disso, GPU client trava em zoom out',
      'Não há solução',
      'Aumentar maxzoom para 30',
    ],
    correct: 1,
    explanation: 'Tiles grandes = mapas lentos. MapLibre/Mapbox recomendam <500KB gzipped por tile (Mapbox impõe 500KB no SaaS deles). tippecanoe oferece estratégias declarativas: drop, coalesce, simplification. Em pipelines reais, você roda com --drop-densest-as-needed + --base-zoom + --layer-priorities para garantir que tiles não estourem.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vector-tiles-pipeline"
      title="Vector tiles: tippecanoe, MBTiles, Tegola, Martin"
      icon="🧩"
      xp={70}
      readTime={14}
      trailName="Maps & Geospatial Engineering"
      trailColor={accent}
      nextSlug="geofencing-routing-osrm"
      nextTitle="Geofencing + routing: OSRM, GraphHopper, Valhalla"
      quiz={quiz}
    >
      <Section title="Por que vector tiles dominaram" accent={accent}>
        <p>
          Em 2014, a Mapbox publicou a <strong>Vector Tile Spec 2.0</strong>: tiles MVT em protobuf, indexáveis por z/x/y, com geometrias em coordenadas locais (extent 4096) e atributos arbitrários por feature. A mudança em relação a raster (PNG por z/x/y) foi categórica:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Raster tiles (PNG)', 'Vector tiles (MVT pbf)']}
          rows={[
            ['Tamanho', '20–50 KB por tile', '5–30 KB (10x menor em zoom alto)'],
            ['Restyling', 'Regerar tudo', 'Trocar style.json'],
            ['Rotação/pitch 3D', 'Não', 'Sim'],
            ['Querying client-side', 'Não (imagem opaca)', 'Sim (queryRenderedFeatures)'],
            ['Anti-aliasing', 'Pixelado em zoom intermediário', 'Vetorial perfeito'],
            ['Geração', 'mapnik / gdal2tiles', 'tippecanoe / planetiler / openmaptiles'],
            ['Servir', 'Apache/Nginx simples', 'Tile server (Martin, Tegola) ou PMTiles estático'],
          ]}
        />
        <Callout tone="info" icon="📜">
          MVT spec oficial: <code>github.com/mapbox/vector-tile-spec</code> (versão 2.1, 2016). Implementado em mapbox-gl, MapLibre, Tegola, Martin, OpenLayers, Leaflet.VectorGrid, QGIS, ArcGIS Pro.
        </Callout>
      </Section>

      <Section title="A stack canônica" accent={accent}>
        <StackFlow
          title="Pipeline de vector tiles em produção"
          accent={accent}
          items={[
            { text: 'Dados fonte', detail: 'OpenStreetMap (planet.osm.pbf, ~80GB), IBGE shapefiles, dados internos (entregadores, sensores)' },
            { text: 'ETL', detail: 'osm2pgsql / ogr2ogr / planetiler — importa para PostGIS ou gera direto tileset' },
            { text: 'Generator (batch)', detail: 'tippecanoe (Felt/Mapbox) ou planetiler (Onthegomap, Java) — geram MBTiles MVT' },
            { text: 'Container', detail: 'MBTiles → PMTiles (pmtiles convert) para servir estático, ou manter MBTiles + tile server' },
            { text: 'Serving', detail: 'Estático: S3/R2/CDN + plugin pmtiles. Dinâmico: Martin (Rust) ou Tegola (Go) com PostGIS' },
            { text: 'Cliente', detail: 'MapLibre GL JS / Mapbox GL JS / OpenLayers — consome MVT via Style Spec' },
          ]}
        />
      </Section>

      <Section title="tippecanoe: o gerador de fato" accent={accent}>
        <CodeBlock lang="bash">{'# instalar (macOS via brew)\nbrew install tippecanoe\n\n# Linux (build from source)\ngit clone https://github.com/felt/tippecanoe\ncd tippecanoe && make -j && sudo make install\n\n# Geração básica: GeoJSON → MBTiles MVT\ntippecanoe \\\n  -o bairros.mbtiles \\\n  --layer=bairros \\\n  --minimum-zoom=4 \\\n  --maximum-zoom=14 \\\n  --drop-densest-as-needed \\\n  --extend-zooms-if-still-dropping \\\n  bairros_brasil.geojson\n\n# Multi-input (várias camadas no mesmo tileset)\ntippecanoe \\\n  -o brasil.mbtiles \\\n  -L estados:estados.geojson \\\n  -L municipios:municipios.geojson \\\n  -L bairros:bairros.geojson \\\n  --minimum-zoom=2 \\\n  --maximum-zoom=14 \\\n  --simplification=10 \\\n  --layer-priorities=estados,municipios,bairros'}</CodeBlock>
        <Callout tone="info" icon="💡">
          Sugestão para datasets do IBGE: gere por &quot;malha&quot; (estados, municípios, setores censitários) com <code>-L</code> nomeando cada camada. Style consome cada um separadamente.
        </Callout>
      </Section>

      <Section title="Flags críticas que você vai usar" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Flag', 'Efeito', 'Quando usar']}
          rows={[
            ['--drop-densest-as-needed', 'Remove features menos importantes para caber em 500KB/tile', 'Sempre (default safe)'],
            ['--coalesce-densest-as-needed', 'Merge features adjacentes em vez de dropar', 'Polígonos contíguos (bairros, parcelas)'],
            ['--extend-zooms-if-still-dropping', 'Gera zoom extras se ainda drop em maxzoom', 'Datasets densos'],
            ['--simplification=N', 'Douglas-Peucker tolerance em pixels do tile', '5–10 para shapes naturais (rios)'],
            ['--layer-priorities=a,b,c', 'Ordem de drop quando tile estoura', 'Múltiplas camadas'],
            ['--no-feature-limit', 'Permite >200k features/tile', 'Pontos densos (POIs)'],
            ['--no-tile-size-limit', 'Permite >500KB/tile', 'Use só em desenvolvimento'],
            ['--read-parallel', 'Leitura paralela de input', 'Speedup ~2x em GeoJSON grande'],
            ['--cluster-distance=N', 'Agrupa pontos próximos em zooms baixos', 'POIs densos (restaurantes)'],
          ]}
        />
      </Section>

      <Section title="planetiler: a alternativa Java escalável" accent={accent}>
        <p>
          <strong>planetiler</strong> (Onthegomap, 2021) é alternativa em Java/JVM para gerar tiles do planet.osm inteiro em ~1h num laptop. Faz integração direta com OSM PBF, sem precisar passar por PostGIS. Tornou-se referência para projetos como Protomaps e OpenStreetMap Carto v2.
        </p>
        <CodeBlock lang="bash">{'# planetiler: planet OSM → MBTiles em ~1h\nwget https://planet.openstreetmap.org/pbf/planet-latest.osm.pbf\n\njava -Xmx20g -jar planetiler.jar \\\n  --download \\\n  --area=brazil \\\n  --output=brazil.mbtiles'}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'tippecanoe', 'planetiler']}
          rows={[
            ['Linguagem', 'C++', 'Java'],
            ['Input típico', 'GeoJSON / FlatGeobuf', 'OSM PBF direto'],
            ['Velocidade planet', 'Lento (precisa converter PBF→GeoJSON primeiro)', '~1h em laptop'],
            ['Flexibilidade de schema', 'Total (você define camadas)', 'Profile-driven (OpenMapTiles, etc)'],
            ['Casos típicos', 'Dados próprios, custom layers', 'Mapa-mundi tipo Google Maps'],
            ['Usuários canônicos', 'Felt, Foursquare, mapbox', 'Protomaps, Stadia Maps' ],
          ]}
        />
      </Section>

      <Section title="PMTiles: o formato cloud-native" accent={accent}>
        <p>
          <strong>PMTiles</strong> (Brandon Liu / Protomaps, 2022) é a evolução cloud-native de MBTiles. Em vez de SQLite, é um arquivo único com layout específico: header → root directory → leaf directories → tile data. Cliente faz 1-3 HTTP Range requests para chegar ao tile certo.
        </p>
        <ArchFlow
          title="PMTiles vs MBTiles em produção"
          accent={accent}
          columns={[
            { header: 'MBTiles (servidor)', items: ['Arquivo SQLite no servidor', 'Tile server (Martin/Tegola) escuta HTTP', 'Para cada request: SELECT tile WHERE z=? x=? y=?', 'Custo: VM + monitoramento', 'Latência: 5–20ms + DB query'] },
            { header: 'PMTiles (estático)', items: ['Arquivo .pmtiles em S3/R2/CDN', 'Plugin pmtiles-protocol no MapLibre/Mapbox', 'Cliente faz HTTP 206 Range request', 'Custo: storage + egress (CDN cacheia)', 'Latência: 10–50ms HTTP + zero DB'] },
          ]}
        />
        <CodeBlock lang="bash">{'# CLI oficial (Go)\nbrew install protomaps/tap/pmtiles\n# OU\ngo install github.com/protomaps/go-pmtiles@latest\n\n# Converter MBTiles → PMTiles\npmtiles convert input.mbtiles output.pmtiles\n\n# Inspecionar\npmtiles show output.pmtiles\n\n# Servir local para desenvolvimento\npmtiles serve output.pmtiles --port 8080 --cors=\'*\'\n\n# Deploy: upload para R2 / S3 com CORS habilitado\naws s3 cp output.pmtiles s3://meus-tiles/brasil.pmtiles \\\n  --content-type application/octet-stream \\\n  --metadata-directive REPLACE \\\n  --acl public-read'}</CodeBlock>
        <CodeBlock lang="tsx">{'// Cliente MapLibre + PMTiles\nimport maplibregl from "maplibre-gl";\nimport * as pmtiles from "pmtiles";\n\nconst protocol = new pmtiles.Protocol();\nmaplibregl.addProtocol("pmtiles", protocol.tile);\n\nconst map = new maplibregl.Map({\n  container: "map",\n  style: {\n    version: 8,\n    sources: {\n      brasil: {\n        type: "vector",\n        url: "pmtiles://https://tiles.exemplo.com/brasil.pmtiles",\n      },\n    },\n    layers: [\n      { id: "bg", type: "background", paint: { "background-color": "#0b0d10" } },\n      {\n        id: "estados",\n        type: "line",\n        source: "brasil",\n        "source-layer": "estados",\n        paint: { "line-color": "#84cc16", "line-width": 1 },\n      },\n    ],\n  },\n  center: [-46.6, -23.5],\n  zoom: 6,\n});'}</CodeBlock>
      </Section>

      <Section title="Martin: tile server em Rust" accent={accent}>
        <CodeBlock lang="bash">{'# instalar\nbrew install martin\n# OU baixar binário de github.com/maplibre/martin/releases\n\n# rodar apontando para PostGIS (descobre tabelas automaticamente)\nmartin postgresql://user:pass@localhost/ffvgis\n\n# config explícito (martin.yaml)\ncat > martin.yaml <<EOF\nlisten_addresses: \'0.0.0.0:3000\'\npostgres:\n  connection_string: postgresql://user:pass@db.internal/ffvgis\n  pool_size: 20\n  tables:\n    bairros:\n      schema: public\n      table: bairros\n      srid: 4326\n      geometry_column: geom\n      id_column: id\n      properties:\n        nome: text\n        populacao: int4\nEOF\n\nmartin --config martin.yaml'}</CodeBlock>
        <p>
          Martin expõe rotas REST: <code>/&lt;table&gt;/&lt;z&gt;/&lt;x&gt;/&lt;y&gt;</code> retornando MVT. Suporta funções customizadas em PostGIS via <code>ST_AsMVT</code>, composite sources, e PMTiles estático. Roda em ~10MB de RAM, throughput de milhares de tiles/segundo num servidor médio.
        </p>
        <Callout tone="success" icon="✅">
          Para dashboards realtime (frota de delivery, sensores IoT), Martin + PostGIS + MapLibre é a stack canônica em 2026.
        </Callout>
      </Section>

      <Section title="Tegola: a alternativa Go" accent={accent}>
        <CodeBlock lang="toml">{'# config.toml\n[webserver]\nport = ":8080"\n\n[[providers]]\nname = "ffv_gis"\ntype = "postgis"\nhost = "db.internal"\nport = 5432\ndatabase = "ffvgis"\nuser = "tegola"\npassword = "..."\nsrid = 4326\n\n  [[providers.layers]]\n  name = "bairros"\n  geometry_fieldname = "geom"\n  id_fieldname = "id"\n  sql = "SELECT id, nome, ST_AsBinary(geom) AS geom FROM bairros WHERE geom && !BBOX!"\n\n[[maps]]\nname = "brasil"\n  [[maps.layers]]\n  provider_layer = "ffv_gis.bairros"\n  min_zoom = 6\n  max_zoom = 14'}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'Martin (Rust)', 'Tegola (Go)']}
          rows={[
            ['Linguagem', 'Rust', 'Go'],
            ['Discovery automático', 'Sim (introspect Postgres)', 'Não (TOML explícito)'],
            ['Performance', 'Marginalmente mais rápido em P99', 'Mais simples de operar com Go-team'],
            ['PMTiles native', 'Sim', 'Não'],
            ['Mantenedor', 'MapLibre Org (governance neutra)', 'Originalmente Esri Solutions, hoje gocp.io'],
            ['Quando preferir', 'Greenfield 2026, integração PMTiles', 'Stack Go existente, time familiar'],
          ]}
        />
      </Section>

      <Section title="Decisão prática" accent={accent}>
        <DecisionBox
          scenario="Vou construir um mapa de bairros do Brasil para um produto SaaS"
          winner="tippecanoe (batch) → PMTiles → R2 + MapLibre"
          winnerColor={accent}
          why="Dados são estáticos (limites administrativos mudam raramente). PMTiles em R2 (egress grátis) = ~$0.50/mês de custo. MapLibre client = $0 de licença. Performance superior a qualquer tile server, zero ops."
          alternatives={[
            { name: 'Martin + PostGIS', when: 'Dados se atualizam de hora em hora (loteamentos novos, edição colaborativa). Você precisa que o tile reflita o último UPDATE em segundos.' },
            { name: 'Mapbox SaaS', when: 'Sem GIS expertise no time, volume previsível baixo (<50k loads/mês), aceita lock-in.' },
            { name: 'MapTiler Cloud', when: 'Quer tiles globais do OSM prontos (não só Brasil) e prefere SaaS open-source friendly (MapLibre-compatible).' },
          ]}
        />
      </Section>

      <Section title="Geração reproduzível: Makefile real" accent={accent}>
        <CodeBlock lang="makefile">{'# Makefile — pipeline reprodutível\n.PHONY: download import tiles deploy\n\nBR_BBOX = -74,-34,-34,5\n\ndownload:\n\twget -O data/brasil.osm.pbf \\\n\t  https://download.geofabrik.de/south-america/brazil-latest.osm.pbf\n\nimport: download\n\tosm2pgsql -d ffvgis \\\n\t  --slim \\\n\t  --cache 4000 \\\n\t  data/brasil.osm.pbf\n\nexport-geojson: import\n\togr2ogr -f GeoJSONSeq data/bairros.geojson \\\n\t  PG:"dbname=ffvgis" \\\n\t  -sql "SELECT osm_id, name, way FROM planet_osm_polygon WHERE place=\'suburb\'"\n\ntiles: export-geojson\n\ttippecanoe \\\n\t  -o data/brasil.mbtiles \\\n\t  -L bairros:data/bairros.geojson \\\n\t  --minimum-zoom=6 \\\n\t  --maximum-zoom=14 \\\n\t  --drop-densest-as-needed \\\n\t  --extend-zooms-if-still-dropping \\\n\t  --force\n\n\tpmtiles convert data/brasil.mbtiles data/brasil.pmtiles\n\ndeploy: tiles\n\taws s3 cp data/brasil.pmtiles s3://$(BUCKET)/brasil.pmtiles \\\n\t  --content-type application/octet-stream\n\taws cloudfront create-invalidation \\\n\t  --distribution-id $(CF_DIST) \\\n\t  --paths "/brasil.pmtiles"'}</CodeBlock>
      </Section>

      <Section title="Anti-patterns" accent={accent}>
        <Callout tone="danger" icon="🚨">
          <strong>Servir MBTiles direto via NGINX como arquivo estático.</strong> Não funciona — MBTiles é SQLite, navegador não fala SQL. Use PMTiles para servir estático, ou tile server (Martin/Tegola) para MBTiles.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>--no-tile-size-limit em produção.</strong> Permite tiles &gt;500KB e GPU client trava em zoom out. Use --drop-densest-as-needed.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Não habilitar gzip no servidor.</strong> MVT é binário mas comprime ~30%. CDN deve servir com <code>Content-Encoding: gzip</code> ou <code>br</code>.
        </Callout>
      </Section>

      <Section title="Referências" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'tippecanoe', v: 'github.com/felt/tippecanoe (fork ativo da Felt; o de mapbox/tippecanoe está em manutenção)' },
            { k: 'planetiler', v: 'github.com/onthegomap/planetiler' },
            { k: 'PMTiles spec + tools', v: 'github.com/protomaps/PMTiles' },
            { k: 'Martin', v: 'github.com/maplibre/martin' },
            { k: 'Tegola', v: 'tegola.io / github.com/go-spatial/tegola' },
            { k: 'MVT spec', v: 'github.com/mapbox/vector-tile-spec/tree/master/2.1' },
            { k: 'OGC API Tiles', v: 'ogc.org/standards/ogcapi-tiles — padrão emergente multi-vendor' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
