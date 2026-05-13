import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mapbox-maplibre-fundamentos');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o MapLibre existe e qual sua relação com o Mapbox GL JS?',
    options: [
      'É um produto comercial da Mapbox',
      'É um fork comunitário do Mapbox GL JS v1.13 (último commit BSD, dezembro/2020), criado depois que a Mapbox relicensou a v2 sob licença proprietária. MapLibre mantém compatibilidade ampla com o Mapbox Style Spec e roda os mesmos vector tiles em MVT/PMTiles, mas é 100% open-source (BSD-3) e self-hostable sem token Mapbox',
      'É um wrapper do Leaflet',
      'É o sucessor oficial do Google Maps API',
    ],
    correct: 1,
    explanation: 'Em dezembro/2020 a Mapbox mudou a licença do mapbox-gl-js v2 (commit a4b5c54) de BSD para uma licença proprietária que exige token + cobrança por map load. A comunidade — incluindo Stadia Maps, MapTiler, Microsoft, Meta, Amazon (depois) — bifurcou a última versão BSD (v1.13.0) e fundou a MapLibre Organization. Hoje MapLibre GL JS é mantido independentemente, com features novas (globe view, 3D terrain, async sources) que Mapbox não tem.',
  },
  {
    question: 'O que define um vector tile do tipo MVT (Mapbox Vector Tile)?',
    options: [
      'Um PNG de 256x256px',
      'Um GeoJSON inteiro do mundo',
      'Um buffer protobuf (.pbf) seguindo a spec MVT 2.1 — contém geometrias em coordenadas locais ao tile (0..4096 por padrão, o "extent"), agrupadas em camadas (layers) com atributos. O cliente decodifica, projeta e estiliza no GPU. A vantagem sobre raster: zoom suave, restyling dinâmico, rotação, pitch 3D, e tamanho de 10–100x menor que PNG equivalente',
      'Um shapefile zipado',
    ],
    correct: 2,
    explanation: 'A spec MVT (github.com/mapbox/vector-tile-spec) define um protobuf compacto onde cada tile (z/x/y) carrega features vetoriais em coord locais. O cliente (Mapbox GL / MapLibre GL) projeta via WebGL. Style Spec separa dados (source) de visual (layer), permitindo trocar o estilo sem regerar tiles — diferença fundamental versus tiles raster (Google Maps API clássico, Stamen pré-2020).',
  },
  {
    question: 'Quando o custo de Mapbox justifica fugir para MapLibre self-host?',
    options: [
      'Nunca, Mapbox é sempre mais barato',
      'Quando você tem volume previsível alto (>500k map loads/mês), precisa de privacidade total (sem token enviar telemetria) ou compliance (LGPD, dados militares). Mapbox cobra ~$5/1k loads acima do free tier; MapLibre + Martin/Tegola + tiles próprios no S3/CloudFront custa fixo ~$50–200/mês independente de volume. Foursquare migrou em 2022 e relatou redução de custos de 6 dígitos/ano',
      'Sempre que possível, sem critério',
      'Apenas para apps mobile',
    ],
    correct: 1,
    explanation: 'Mapbox cobra por map load (sessão de uso) acima de 50k/mês free. Para um app B2C com milhões de usuários, isso vira centenas de milhares de dólares/ano. Self-host (MapLibre GL JS + Martin + PostGIS + tiles em S3) tem custo marginal próximo de zero por load — você paga storage e CDN. O Foursquare (2022) e a AWS Location Service (que usa MapLibre internamente) são os exemplos canônicos.',
  },
  {
    question: 'O que é um "source" e um "layer" no Style Spec?',
    options: [
      'Source é cor, layer é fonte',
      'São sinônimos',
      'Source = origem dos dados (vector tiles, GeoJSON, raster, image, video). Layer = regra visual aplicada a um source-layer específico, com paint/layout properties data-driven (expressões). Você pode ter 1 source servindo 20 layers (mesmo dado renderizado de jeitos diferentes) — o que torna trivial trocar tema dark/light sem refetch',
      'Source é HTML, layer é CSS',
    ],
    correct: 2,
    explanation: 'Source declara DE ONDE vêm os dados; Layer declara COMO renderizar. Um source vector pode expor vários source-layers (ex: water, roads, buildings). Cada layer no estilo seleciona um source-layer e aplica fill/line/symbol/circle/heatmap/fill-extrusion/raster com expressões data-driven (interpolate, match, case). Esse desacoplamento é o que diferencia fundamentalmente do raster clássico.',
  },
  {
    question: 'PMTiles vs MBTiles — qual a diferença prática?',
    options: [
      'São idênticos',
      'MBTiles é um SQLite com tiles dentro (precisa de servidor que faça SELECT por z/x/y — ex: Martin, Tegola). PMTiles (Protomaps, 2022) é um arquivo único acessível via HTTP Range requests — você joga no S3/R2 e o navegador busca byte-ranges direto, sem servidor. Ótimo para sites estáticos e edge (Cloudflare Workers)',
      'PMTiles é só para Apple, MBTiles para Android',
      'MBTiles é o sucessor de PMTiles',
    ],
    correct: 1,
    explanation: 'MBTiles (criado pela Mapbox em 2011) é SQLite — exige um tile server (Martin, TileServer GL) que faça query por z/x/y. PMTiles (Brandon Liu / Protomaps, 2022) é cloud-native: índice + tiles em um arquivo, lido via HTTP 206 (Range). Zero servidor: dropa em S3, configura CORS, plugin pmtiles no MapLibre faz o resto. Cloudflare R2 + PMTiles é stack popular para mapas estáticos baratos.',
  },
  {
    question: 'O que são expressions no Mapbox/MapLibre Style Spec?',
    options: [
      'Strings literais',
      'Pequena DSL declarativa em JSON-array que avalia properties da feature em tempo de render: ["match", ["get", "highway"], "motorway", "#f00", "primary", "#fa0", "#888"]. Permite estilos data-driven sem regerar tiles e zoom-dependent (interpolate, step) — base do "vector tiles é diferente de raster"',
      'Expressões regulares Perl',
      'SQL embutido',
    ],
    correct: 1,
    explanation: 'Expressions (introduzidas no Mapbox GL JS v0.41, 2017) substituíram as antigas "functions" e "filters". É uma linguagem AST em JSON que avalia properties em GPU/CPU — get, has, ==, !=, in, match, case, coalesce, interpolate (linear, exponential, cubic-bezier), step. É o que permite "estilo escuro" trocar 100 layers atualizando um único setPaintProperty.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mapbox-maplibre-fundamentos"
      title="Mapbox vs MapLibre: o fork e qual escolher"
      icon="🌍"
      xp={60}
      readTime={12}
      trailName="Maps & Geospatial Engineering"
      trailColor={accent}
      nextSlug="leaflet-pratica"
      nextTitle="Leaflet profissional: plugins, performance, mobile"
      quiz={quiz}
    >
      <Section title="A bifurcação de dezembro de 2020" accent={accent}>
        <p>
          Em <strong>10 de dezembro de 2020</strong>, a Mapbox publicou o commit <code>a4b5c54f</code> no repositório <code>mapbox-gl-js</code>: mudou a licença da v2 de <strong>BSD-3-Clause</strong> (permissiva, qualquer um podia self-hostar) para uma <strong>licença proprietária</strong> que exige token Mapbox e cobra por <em>map load</em> (sessão de visualização). Foi um evento que marcou a comunidade GIS open-source.
        </p>
        <p>
          A reação foi rápida. Em poucos dias, engenheiros do <strong>Stadia Maps</strong>, <strong>MapTiler</strong>, <strong>Microsoft</strong>, <strong>Meta</strong> e <strong>Elastic</strong> bifurcaram o último commit BSD (<code>v1.13.0</code>) e criaram o <strong>MapLibre GL JS</strong>. A AWS aderiu em 2021, contribuindo o code do <strong>AWS Location Service</strong>. Hoje a <a href="https://maplibre.org">MapLibre Organization</a> é mantida por uma coalizão de empresas + comunidade — modelo similar ao OpenSearch (fork do Elastic) e Valkey (fork do Redis).
        </p>
        <Callout tone="info" icon="📜">
          Discussão histórica no GitHub: <code>mapbox/mapbox-gl-js#10162</code> (relicenciamento) e <code>maplibre/maplibre-gl-js#1</code> (fork inicial, 11/dez/2020). Vale ler — é case-study de governance open-source.
        </Callout>
      </Section>

      <Section title="Anatomia: tiles, sources, layers, style" accent={accent}>
        <p>
          Antes de comparar, é preciso entender o modelo arquitetural compartilhado. Mapbox GL JS e MapLibre GL JS são <strong>WebGL renderers</strong> que consomem <strong>vector tiles</strong> via uma especificação JSON declarativa chamada <strong>Style Spec</strong>.
        </p>
        <StackFlow
          title="Stack de renderização de um mapa vetorial"
          accent={accent}
          items={[
            { text: 'Style JSON', detail: 'Arquivo declarativo (style.json) — declara sources, layers, light, terrain, projection. É o "CSS do mapa"' },
            { text: 'Sources', detail: 'Origem dos dados: vector (MVT pbf), geojson, raster (XYZ tiles PNG/JPEG), image, video, raster-dem (terreno)' },
            { text: 'Layers', detail: 'Regras de paint+layout. Tipos: fill, line, symbol, circle, heatmap, fill-extrusion (3D), raster, sky, hillshade' },
            { text: 'Expressions', detail: 'DSL em JSON-array para data-driven styling: ["interpolate", ["linear"], ["zoom"], 8, 0.5, 14, 2]' },
            { text: 'WebGL Renderer', detail: 'GPU desenha geometrias projetadas (Mercator, Globe). 60fps com pan/zoom/rotate/pitch suave' },
          ]}
        />
        <CodeBlock lang="json">{'// style.json mínimo (compatível Mapbox e MapLibre)\n{\n  "version": 8,\n  "sources": {\n    "osm-vector": {\n      "type": "vector",\n      "tiles": ["https://tiles.exemplo.com/{z}/{x}/{y}.pbf"],\n      "minzoom": 0,\n      "maxzoom": 14\n    }\n  },\n  "layers": [\n    { "id": "bg", "type": "background", "paint": { "background-color": "#0b0d10" } },\n    {\n      "id": "roads",\n      "type": "line",\n      "source": "osm-vector",\n      "source-layer": "transportation",\n      "paint": {\n        "line-color": ["match",\n          ["get", "class"],\n          "motorway", "#f59e0b",\n          "primary",  "#84cc16",\n          /* default */ "#374151"\n        ],\n        "line-width": ["interpolate", ["linear"], ["zoom"],\n          8, 0.5,\n          14, 3,\n          18, 8\n        ]\n      }\n    }\n  ]\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          O mesmo <code>style.json</code> roda em Mapbox GL JS, MapLibre GL JS, Mapbox iOS/Android, MapLibre Native, e até no MapTiler Cloud. Esse é o ativo real da spec — não a engine.
        </Callout>
      </Section>

      <Section title="Vector tiles vs raster tiles" accent={accent}>
        <p>
          O salto do Google Maps clássico (raster, 2005) para o Mapbox/MapLibre (vetorial) é o equivalente de PDF para HTML: mesma informação, mas <em>reflowable</em>. Vector tiles (MVT) são binários protobuf que contêm geometrias em coordenadas locais ao tile (0..4096), tipadas em layers (water, roads, buildings, places). O cliente projeta e estiliza no GPU.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Raster (PNG XYZ)', 'Vector (MVT pbf)']}
          rows={[
            ['Tamanho típico', '20–50 KB por tile', '5–30 KB por tile (10x menor em zoom alto)'],
            ['Restyling', 'Regerar todos os tiles', 'Trocar style.json (instantâneo)'],
            ['Rotação / pitch 3D', 'Não suporta', 'Suporta nativo (WebGL)'],
            ['Zoom suave', 'Tile-jumping', 'Interpolação contínua'],
            ['Acessibilidade (DOM)', 'Imagem opaca', 'Features queryáveis (queryRenderedFeatures)'],
            ['Servidor', 'TileServer simples (mod_tile, MapProxy)', 'Tile server (Martin, Tegola) ou PMTiles estático'],
            ['Geração', 'mapnik, GDAL', 'tippecanoe, openmaptiles, planetiler'],
          ]}
        />
      </Section>

      <Section title="Mapbox vs MapLibre: a tabela honesta" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Mapbox GL JS v3', 'MapLibre GL JS v4']}
          rows={[
            ['Licença', 'Proprietária (Mapbox Terms)', 'BSD-3-Clause'],
            ['Custo', '$5/1k map loads acima de 50k/mês', '$0 (self-host) + custo de CDN/storage'],
            ['Token obrigatório', 'Sim (telemetria + billing)', 'Não'],
            ['Globe projection', 'Sim (v3, 2023)', 'Sim (v4, 2024)'],
            ['3D terrain', 'Sim', 'Sim'],
            ['Atlas (Studio)', 'Mapbox Studio (visual editor)', 'Maputnik (OSS)'],
            ['Tiles oficiais', 'Mapbox tiles (mundo, premium)', 'Você escolhe: OpenMapTiles, Protomaps, MapTiler'],
            ['Suporte mobile', 'Mapbox iOS/Android (proprietário)', 'MapLibre Native (BSD)'],
            ['Compatibilidade Style Spec', '100% (origem)', '~95% (algumas extensions proprietárias do Mapbox ausentes)'],
          ]}
        />
        <DecisionBox
          scenario="Vou começar um app web/mobile com mapa em 2026 — Mapbox ou MapLibre?"
          winner="MapLibre + Protomaps (PMTiles) ou MapTiler Cloud"
          winnerColor={accent}
          why="A spec é a mesma, o ecossistema OSS amadureceu, e o custo cresce linear com sucesso do produto. Lock-in num vendor que já mudou a licença uma vez é risco evitável."
          alternatives={[
            { name: 'Mapbox', when: 'Você precisa do Mapbox Studio (visual), tem time pequeno sem GIS expertise e quer SaaS turnkey. Aceita pagar e o produto tem volume previsível baixo (<50k loads/mês free tier).' },
            { name: 'Google Maps Platform', when: 'Seu produto depende de POIs ricos (Google Places), reviews, Street View. Aceita preço alto (~$7/1k loads no Maps Embed avançado) em troca de qualidade de dados.' },
            { name: 'AWS Location Service', when: 'Você já é AWS-native e quer billing consolidado. Por baixo usa HERE/Esri/OpenData; SDK fala MapLibre.' },
          ]}
        />
      </Section>

      <Section title="Foursquare: o case do self-host" accent={accent}>
        <p>
          O <strong>Foursquare</strong>, em 2022, publicou um post (<em>&quot;Why we&apos;re moving to MapLibre&quot;</em>) detalhando a migração de toda sua stack de visualização (incluindo o produto <strong>Studio</strong>, antigo Mapbox Studio open-sourced) de Mapbox GL JS para MapLibre GL JS. O motivo principal: <em>controle</em> e <em>custo</em>.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Volume', v: 'Múltiplos produtos com dezenas de milhões de map loads/mês' },
            { k: 'Custo Mapbox estimado', v: '6 dígitos USD/ano só em map loads' },
            { k: 'Custo MapLibre self-host', v: 'CloudFront + S3 + ECS Fargate para Martin = baixos 5 dígitos USD/ano' },
            { k: 'Tempo de migração', v: '~3 meses (style.json era 95% compatível)' },
            { k: 'Quebras encontradas', v: 'Algumas paint properties exclusivas (sky-atmosphere v3) — reimplementadas em PRs upstream' },
          ]}
        />
        <Callout tone="info" icon="📚">
          O Foursquare também doou seu produto <strong>Unfolded Studio</strong> à comunidade — virou base de ferramentas como <a href="https://kepler.gl">kepler.gl</a>. Ver: github.com/foursquare/fsq-studio.
        </Callout>
      </Section>

      <Section title="Como você efetivamente usa em código" accent={accent}>
        <CodeBlock lang="bash">{'# Instalar MapLibre GL JS (drop-in para Mapbox GL JS)\nnpm install maplibre-gl\n\n# Tipos\nnpm install -D @types/maplibre-gl  # já vem embutido em maplibre-gl@4+'}</CodeBlock>
        <CodeBlock lang="tsx">{'// React + MapLibre — componente client (use client)\n"use client";\nimport { useEffect, useRef } from "react";\nimport maplibregl from "maplibre-gl";\nimport "maplibre-gl/dist/maplibre-gl.css";\n\nexport function CityMap({ lat, lng, zoom = 12 }: { lat: number; lng: number; zoom?: number }) {\n  const ref = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    if (!ref.current) return;\n    const map = new maplibregl.Map({\n      container: ref.current,\n      style: "https://demotiles.maplibre.org/style.json", // troque pelo seu\n      center: [lng, lat],\n      zoom,\n      pitch: 30,\n      bearing: -10,\n    });\n\n    new maplibregl.Marker({ color: "#84cc16" })\n      .setLngLat([lng, lat])\n      .addTo(map);\n\n    map.on("load", () => {\n      // adicionar source + layer programaticamente\n      map.addSource("alertas", {\n        type: "geojson",\n        data: "/api/alertas.geojson",\n      });\n      map.addLayer({\n        id: "alertas-circle",\n        type: "circle",\n        source: "alertas",\n        paint: {\n          "circle-radius": ["interpolate", ["linear"], ["get", "severity"], 1, 4, 5, 16],\n          "circle-color": ["match",\n            ["get", "type"],\n            "incendio", "#ef4444",\n            "alagamento", "#3b82f6",\n            "#6b7280",\n          ],\n          "circle-opacity": 0.7,\n        },\n      });\n    });\n\n    return () => map.remove();\n  }, [lat, lng, zoom]);\n\n  return <div ref={ref} style={{ width: "100%", height: 480 }} />;\n}'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          MapLibre/Mapbox GL JS são <strong>WebGL</strong> e <em>não</em> server-renderizam. Em Next.js App Router, o componente DEVE ser client component (<code>&quot;use client&quot;</code>). Para SEO de mapa estático (Open Graph image), gere um PNG no build com puppeteer ou static-maps API.
        </Callout>
      </Section>

      <Section title="Pipeline de tiles próprios (sem Mapbox)" accent={accent}>
        <FlowDiagram
          title="Do OSM bruto ao mapa renderizado"
          accent={accent}
          orientation="vertical"
          steps={[
            { label: 'planet.osm.pbf', desc: 'Download (~80 GB) de planet.openstreetmap.org' },
            { label: 'osm2pgsql / planetiler', desc: 'Importa para PostGIS ou gera direto MBTiles em paralelo' },
            { label: 'tippecanoe', desc: 'Gera tiles MVT zoom 0..14 a partir de GeoJSON/PostGIS' },
            { label: 'MBTiles → PMTiles', desc: 'pmtiles convert input.mbtiles output.pmtiles (Brandon Liu)' },
            { label: 'S3 / R2 + CORS', desc: 'Upload do .pmtiles. Custo: ~$0.023/GB/mês storage' },
            { label: 'MapLibre GL JS + pmtiles plugin', desc: 'protomaps.com/docs/pmtiles/maplibre' },
          ]}
        />
        <Callout tone="success" icon="💡">
          Com <strong>Protomaps</strong> (planetiler + PMTiles), você consegue rodar &quot;Google Maps do mundo inteiro&quot; servido do Cloudflare R2 por ~$10/mês. Ver: <a href="https://protomaps.com">protomaps.com</a>.
        </Callout>
      </Section>

      <Section title="Quando MapLibre NÃO é a resposta" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>Se você precisa de POIs ricos</strong> (nomes de restaurantes, horários, reviews), OSM é incompleto fora dos EUA/UE. Google Places API ainda lidera. Foursquare Places, HERE, Mapbox Search API são alternativas.
        </Callout>
        <Callout tone="warn" icon="⚠️">
          <strong>Se você não tem GIS expertise no time</strong>, self-host (Martin + PostGIS + tile pipeline + monitoramento) tem custo escondido em pessoas. Mapbox/MapTiler como SaaS pode sair mais barato no TCO real.
        </Callout>
        <Callout tone="danger" icon="🚨">
          <strong>Não use Mapbox tiles com MapLibre.</strong> O ToS da Mapbox proíbe acessar seus tiles fora do SDK oficial. Se for self-host, use OpenMapTiles, Protomaps ou MapTiler tiles (esse último explicitamente permite MapLibre).
        </Callout>
      </Section>

      <Section title="Referências para aprofundar" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Mapbox Style Spec', v: 'maplibre.org/maplibre-style-spec — referência canônica (cobre ambos)' },
            { k: 'MVT spec', v: 'github.com/mapbox/vector-tile-spec — versão 2.1' },
            { k: 'OGC API Tiles', v: 'ogc.org/standards/ogcapi-tiles — emergente, padrão aberto multi-vendor' },
            { k: 'MapLibre source', v: 'github.com/maplibre/maplibre-gl-js' },
            { k: 'Protomaps PMTiles', v: 'github.com/protomaps/PMTiles — spec + tools' },
            { k: 'Foursquare migration post', v: 'medium.com/foursquare-direct (2022)' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
