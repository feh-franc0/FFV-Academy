import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('openstreetmap-pipeline');

const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  { question: 'OSM planet.osm tamanho em 2026:', options: ['1GB', '~150GB+ em formato XML descompactado; PBF (Protocol Buffer Format) comprime para ~70-90GB. Atualização incremental via minutely/hourly/daily diffs (planet.openstreetmap.org)', '10GB', '5TB'], correct: 1, explanation: 'Planet OSM cresce ~10% ano. Em 2026, PBF está em ~70-90GB. Para downloads, use mirrors regionais (Geofabrik). Para atualização contínua, use diffs em vez de re-download.' },
  { question: 'Overpass API serve para:', options: ['Editar OSM', 'Queries ad-hoc no OSM, linguagem OverpassQL — ex: "todos cafés em raio de 500m do ponto X". Não precisa download local. Free, com rate limits, mirrors públicos', 'Apenas tiles', 'Apenas no Japão'], correct: 1, explanation: 'Overpass é o "GraphQL do OSM". Use para protótipos, análises pontuais. Para alto volume, monte instância local (overpass-api / Querying OSM data via Overpass Turbo UI: overpass-turbo.eu).' },
  { question: 'osm2pgsql vs imposm vs osmium:', options: ['São idênticos', 'osm2pgsql: carrega PBF em Postgres+PostGIS (esquema flexível com lua). imposm: similar, mais rápido em alguns benchmarks, esquema customizável. osmium: CLI tool para processar PBF (filter, merge, convert). osmium é fundação; osm2pgsql é o produto.', 'Apenas osmium funciona', 'osm2pgsql não suporta tags'], correct: 1, explanation: 'Stack típica: osmium para preparar/recortar PBF → osm2pgsql para carregar Postgres → tippecanoe para gerar tiles. imposm é alternativa a osm2pgsql, com performance ligeiramente melhor em loads enormes.' },
  { question: 'Como contribuir mudança ao OSM?', options: ['Não é possível', 'Via iD editor (web, in-browser, simples) ou JOSM (Java, avançado). Login com conta OSM, faz changeset com descrição, comunidade local pode revisar. Mudanças aparecem na base global em minutos', 'Apenas pagando', 'Apenas via API B2B'], correct: 1, explanation: 'OSM é wiki-style. iD editor (openstreetmap.org/edit) para mudanças rápidas; JOSM para edição em massa/avançada. Boas práticas: presets corretos, sources, respeito ao tagging scheme local.' },
  { question: 'Tag scheme do OSM:', options: ['Idêntico ao Google Maps', 'Sistema livre key=value, com padrões fortemente convencionados (wiki.openstreetmap.org). Ex: highway=primary, amenity=cafe, building=residential. Não é schema rígido; comunidade define.', 'Schema SQL fixo', 'Apenas em XML'], correct: 1, explanation: 'OSM tagging é convenção, não schema. Ler a wiki é arte. Tags badly used = mapa pobre. Para apps em produção, foque em key tags relevantes: highway (estradas), amenity (POIs), building (imóveis), etc.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="openstreetmap-pipeline" title="OpenStreetMap pipeline: planet.osm, Overpass, mudança real" icon="🗺️" xp={60} readTime={12}
      trailName="Maps & Geospatial Engineering" trailColor={accent} nextSlug="mobile-maps-rn" nextTitle="Mapas em React Native" quiz={quiz}>
      <Section title="OSM por dentro" accent={accent}>
        <p className="text-sm leading-6">OpenStreetMap é o "Wikipedia dos mapas" — base global colaborativa, em PT-BR comunidade ativa. Para apps de mapas próprios em 2026, OSM + MapLibre é o stack open-source padrão, oferecendo independência de Google/Mapbox.</p>
      </Section>
      <Section title="Formatos e fontes" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'XML (.osm)', v: 'Formato canônico, verboso. ~150GB descompactado para planet.' },
          { k: 'PBF (.osm.pbf)', v: 'Protocol Buffer binário, ~70-90GB planet. Padrão para download/processing.' },
          { k: 'Diffs', v: 'minutely.osc / hourly.osc / daily.osc — incrementais para sync contínuo' },
          { k: 'Extracts regionais', v: 'Geofabrik (download.geofabrik.de) tem PBF por país/estado (Brasil ~3GB)' },
          { k: 'Overpass API', v: 'Queries ad-hoc sem download (overpass-api.de)' },
        ]} />
      </Section>
      <Section title="Overpass query — exemplo" accent={accent}>
        <CodeBlock lang="text">{`# Todos cafés em São Paulo (Overpass QL)
[out:json][timeout:25];
area["name"="São Paulo"]->.searchArea;
(
  node["amenity"="cafe"](area.searchArea);
  way["amenity"="cafe"](area.searchArea);
);
out body;
>;
out skel qt;`}</CodeBlock>
        <Callout tone="info">Teste no overpass-turbo.eu — UI gráfica para Overpass QL com visualização.</Callout>
      </Section>
      <Section title="Pipeline de produção" accent={accent}>
        <CodeBlock lang="bash">{`# 1. Baixar PBF Brasil
curl -O https://download.geofabrik.de/south-america/brazil-latest.osm.pbf

# 2. Filtrar (osmium) — só estradas e POIs
osmium tags-filter brazil-latest.osm.pbf \\
  highway amenity building \\
  -o brazil-filtered.osm.pbf

# 3. Carregar Postgres+PostGIS
osm2pgsql --create --slim --hstore \\
  --cache 8000 \\
  --number-processes 8 \\
  --database osm brazil-filtered.osm.pbf

# 4. Gerar vector tiles (tippecanoe)
tippecanoe -o brazil.mbtiles \\
  --maximum-zoom=14 --minimum-zoom=4 \\
  --drop-densest-as-needed \\
  brazil-filtered.geojson

# 5. Servir via Martin
martin --pg postgres://localhost/osm

# 6. Sync diário (osmupdate + diffs)
osmupdate brazil-latest.osm.pbf brazil-new.osm.pbf`}</CodeBlock>
      </Section>
      <Section title="Editores e contribuição" accent={accent}>
        <ComparisonTable accent={accent} headers={['Editor', 'Para quem', 'Quando']} rows={[
          ['iD (in-browser)', 'Iniciante', 'Edição rápida, presets guiados'],
          ['JOSM (Java)', 'Avançado', 'Bulk edit, validação rigorosa, offline'],
          ['StreetComplete (Android)', 'Casual mobile', 'Quests micro — adicionar dados faltantes'],
          ['Vespucci (Android)', 'Avançado mobile', 'Edição completa no celular'],
        ]} />
      </Section>
      <Section title="Onde OSM brilha / falha" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: '✅ Brilha em', v: 'Europa (cobertura excelente), cidades grandes globais, dados off-the-beaten-path' },
          { k: '⚠️ Cobertura variável', v: 'Brasil: capitais excelentes, interior depende de comunidade local' },
          { k: '❌ Falha em', v: 'Endereçamento estilo Google (numeração precisa varia), POI atualidade em mercados pequenos' },
          { k: '🤝 Híbrido', v: 'Times maduros combinam OSM com fonte proprietária (Mapbox Streets, HERE) para gaps' },
        ]} />
      </Section>
    </ModuleLayout>
  );
}
