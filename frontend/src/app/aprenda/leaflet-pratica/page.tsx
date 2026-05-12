import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, DecisionBox, StackFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('leaflet-pratica');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando o Leaflet 1.9 ainda é a escolha certa em 2026?',
    options: [
      'Nunca, Leaflet está morto',
      'Sempre, ele é melhor que MapLibre',
      'Quando você precisa de mapa raster (Esri, IBGE, OpenStreetMap PNG tiles), zero dependência WebGL, bundle <50KB, ampla compatibilidade com browsers antigos, ou quando seu uso é "marcador num mapa" sem 3D/rotação. Setor público brasileiro (DETRAN, INMET) e GIS legado usam massivamente — ainda é o tile renderer mais portável',
      'Apenas em apps Android',
    ],
    correct: 2,
    explanation: 'Leaflet (Vladimir Agafonkin, 2011) é DOM-based: cada marker é um <img> ou SVG. Não usa WebGL. Por isso roda em qualquer browser, tem bundle minúsculo (~42KB gzipped) e suporta plugins de uma década. Limitação: não escala para >5k markers sem cluster, não tem rotação/pitch, vector tiles só via plugin (Leaflet.VectorGrid). Para BI corporativo, prefeituras, dashboards GIS clássicos — perfeito.',
  },
  {
    question: 'Para qual cenário Leaflet.markercluster foi feito?',
    options: [
      'Renderizar 5 markers',
      'Quando você tem >500 markers e o mapa fica lento ou ilegível. O plugin agrupa markers próximos em "clusters" com contador, recalcula dinâmico em pan/zoom usando um quad-tree no client. É o plugin de plugin do Leaflet — usado em quase todo dashboard GIS BR (siscom, agências reguladoras)',
      'Apenas mapas 3D',
      'Apenas tiles raster',
    ],
    correct: 1,
    explanation: 'Leaflet.markercluster (Dave Leaver, mainline desde 2012) implementa clustering hierárquico via quad-tree no client. Em zoom alto vê marcadores individuais; em zoom baixo, círculos coloridos com contador. Sem ele, 10k markers DOM matam o browser. Configurável: spiderfyOnMaxZoom, chunkedLoading (carrega progressivo sem travar UI), disableClusteringAtZoom.',
  },
  {
    question: 'Quando trocar o renderer SVG default pelo Canvas no Leaflet?',
    options: [
      'Nunca',
      'Quando você tem >1000 vetores (paths/polígonos) — o renderer Canvas (L.canvas()) desenha tudo em um <canvas> só, eliminando milhares de nós SVG no DOM. Trade-off: perde interatividade fácil (hover por feature precisa hit-testing manual). Default SVG é melhor para <500 features com tooltips ricos',
      'Apenas em apps mobile',
      'Sempre, Canvas é sempre superior',
    ],
    correct: 1,
    explanation: 'Leaflet permite trocar renderer por layer: L.geoJSON(data, { renderer: L.canvas() }). SVG dá um <path> por feature (cada um interativo via DOM events), excelente até ~500 features. Canvas é um buffer só — pinta milhares em ms, mas hover/click exige você mesmo implementar hit-testing via getBounds ou L.PointInLayer.',
  },
  {
    question: 'O que faz Leaflet.draw?',
    options: [
      'Desenha gráficos de barras',
      'Plugin (Jacob Toye / mainline em manutenção) que adiciona toolbar de desenho: polígono, retângulo, círculo, polyline, marker. Resultado é uma FeatureGroup com geometrias editáveis (drag de vértices). Base de quase todo editor GIS web — agricultura de precisão, definição de polígonos de geofence, áreas de cobertura',
      'Renderiza tile raster',
      'Compila CSS',
    ],
    correct: 1,
    explanation: 'Leaflet.draw é o editor visual mais usado da web GIS. Hooks: draw:created (geometria nova), draw:edited (vértice movido), draw:deleted. Exporta GeoJSON pronto para enviar ao backend / PostGIS. Concorrentes: terraformer-arcgis-parser (legacy Esri), Mapbox GL Draw (para Mapbox/MapLibre — mesma ideia, outra engine).',
  },
  {
    question: 'Performance em mobile (especialmente iOS Safari): qual o killer?',
    options: [
      'Markers SVG demais (>2000) no DOM, sem cluster — iOS Safari fica com >300ms input lag, scroll trava. Solução: markercluster + canvas renderer para vetores + lazy loading de tiles (preload em zoom adjacente) + evitar layer com >1000 features visíveis simultâneas',
      'O CSS do Leaflet',
      'O viewport meta tag',
      'O fetch das tiles raster',
    ],
    correct: 0,
    explanation: 'iOS Safari tem garbage collector agressivo em DOM grande — milhares de <img> de marker ou <path> SVG matam scroll. Stack mobile-friendly: L.markercluster (chunkedLoading: true), L.canvas() para geoJSON denso, preferCanvas: true na criação do mapa. Para >50k features, deixe Leaflet e vá pra MapLibre + vector tiles.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="leaflet-pratica"
      title="Leaflet profissional: plugins, performance, mobile"
      icon="🍃"
      xp={55}
      readTime={11}
      trailName="Maps & Geospatial Engineering"
      trailColor={accent}
      nextSlug="postgis-deep"
      nextTitle="PostGIS profundo: GIST, ST_Intersects, KNN"
      quiz={quiz}
    >
      <Section title="Por que Leaflet ainda importa em 2026" accent={accent}>
        <p>
          O <strong>Leaflet</strong> (Vladimir Agafonkin, 2011) é a biblioteca de mapas DOM-based mais usada do mundo. Em 2026, com MapLibre/Mapbox dominando o &quot;mapa moderno&quot;, parece tentador descartar Leaflet. Mas ele permanece a escolha certa em três cenários: <strong>mapas raster legados</strong> (Esri, IBGE, INMET, ArcGIS Online tiles), <strong>aplicações com bundle mínimo</strong> (PWA, embeds, widgets), e <strong>BI corporativo / governo</strong> onde browsers ainda variam.
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Versão atual', v: 'Leaflet 1.9.x (estável desde 2022, manutenção ativa via mainline)' },
            { k: 'Bundle gzipped', v: '~42 KB (vs MapLibre GL JS ~250 KB)' },
            { k: 'Renderização', v: 'DOM (SVG ou Canvas) — não usa WebGL' },
            { k: 'Suporte browser', v: 'Chrome, Firefox, Safari, Edge — funciona em IE11 com polyfill (relevante em GIS estatal)' },
            { k: 'Plugins', v: '~600+ plugins indexados em leafletjs.com/plugins.html' },
            { k: 'Licença', v: 'BSD-2-Clause (permissiva total)' },
          ]}
        />
        <Callout tone="info" icon="📜">
          Vladimir Agafonkin é também autor do Mapbox GL JS (antes do fork) — Leaflet é o &quot;pai&quot; arquitetural de várias bibliotecas modernas.
        </Callout>
      </Section>

      <Section title="Setup mínimo correto" accent={accent}>
        <CodeBlock lang="bash">{'npm install leaflet\nnpm install -D @types/leaflet'}</CodeBlock>
        <CodeBlock lang="tsx">{'"use client";\nimport { useEffect, useRef } from "react";\nimport L from "leaflet";\nimport "leaflet/dist/leaflet.css";\n\n// fix: ícones do default marker quebram com bundlers (caminho relativo perdido)\ndelete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;\nL.Icon.Default.mergeOptions({\n  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",\n  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",\n  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",\n});\n\nexport function BasicMap() {\n  const ref = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    if (!ref.current) return;\n    const map = L.map(ref.current, {\n      center: [-23.5505, -46.6333],\n      zoom: 12,\n      preferCanvas: true, // canvas renderer global — chave para perf\n    });\n\n    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {\n      attribution: "© OpenStreetMap contributors",\n      maxZoom: 19,\n      detectRetina: true, // baixa @2x onde disponível\n    }).addTo(map);\n\n    L.marker([-23.5505, -46.6333])\n      .addTo(map)\n      .bindPopup("São Paulo");\n\n    return () => { map.remove(); };\n  }, []);\n\n  return <div ref={ref} style={{ width: "100%", height: 480 }} />;\n}'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          O bug do ícone default quebrado com Webpack/Vite/Turbopack é o erro #1 de quem usa Leaflet em React. Sempre faça o <code>mergeOptions</code> apontando para o CDN ou copie os PNGs para <code>public/</code>.
        </Callout>
      </Section>

      <Section title="Plugins que importam" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Plugin', 'O que faz', 'Quando usar']}
          rows={[
            ['Leaflet.markercluster', 'Agrupa markers próximos com contadores', 'Sempre que tiver >500 markers visíveis'],
            ['Leaflet.draw', 'Toolbar para desenhar polígonos/círculos/linhas', 'Editor de áreas (geofence, talhão agrícola, áreas de cobertura)'],
            ['Leaflet.heat', 'Heatmap a partir de pontos com intensidade', 'Densidade de eventos (acidentes, vendas, queimadas)'],
            ['leaflet.locatecontrol', 'Botão "minha localização" + tracking', 'Apps de campo (delivery, motorista, técnico)'],
            ['Leaflet.MarkerCluster.Freezable', 'Cluster com toggle freeze/unfreeze', 'Análise comparativa'],
            ['leaflet-routing-machine', 'Rotas com instruções (usa OSRM/Mapbox/Graphhopper)', 'POC de roteamento sem backend próprio'],
            ['Leaflet.VectorGrid', 'Renderiza vector tiles MVT no Leaflet', 'Migração gradual para vetorial sem largar Leaflet'],
            ['leaflet-geosearch', 'Caixa de busca com geocoding (Nominatim/Esri/Google)', 'Search por endereço'],
            ['leaflet.fullscreen', 'Botão de fullscreen do mapa', 'Dashboards e BI'],
            ['Leaflet.MiniMap', 'Mini-mapa de contexto no canto', 'Mapas grandes onde o usuário se perde'],
          ]}
        />
      </Section>

      <Section title="markercluster: o plugin canônico" accent={accent}>
        <CodeBlock lang="bash">{'npm install leaflet.markercluster\nnpm install -D @types/leaflet.markercluster'}</CodeBlock>
        <CodeBlock lang="tsx">{'import "leaflet.markercluster";\nimport "leaflet.markercluster/dist/MarkerCluster.css";\nimport "leaflet.markercluster/dist/MarkerCluster.Default.css";\n\n// cria cluster — config tuned para 50k+ markers\nconst cluster = L.markerClusterGroup({\n  chunkedLoading: true,           // carrega em chunks de 200 — não trava UI\n  chunkInterval: 200,\n  chunkDelay: 50,\n  removeOutsideVisibleBounds: true, // não renderiza markers fora do viewport\n  spiderfyOnMaxZoom: true,        // em zoom máximo, espalha cluster em flor\n  showCoverageOnHover: false,     // hover não desenha hull (custoso)\n  maxClusterRadius: 60,           // px — menor = mais clusters menores\n  disableClusteringAtZoom: 17,    // a partir de zoom 17 mostra individual\n});\n\n// adicionar 50.000 ocorrências (estilo eventos do 190 SP)\nfetch("/api/ocorrencias.geojson")\n  .then(r => r.json())\n  .then((geojson: GeoJSON.FeatureCollection<GeoJSON.Point>) => {\n    const markers = geojson.features.map(f => {\n      const [lng, lat] = f.geometry.coordinates;\n      return L.marker([lat, lng]).bindPopup(\n        `<strong>${f.properties?.tipo}</strong><br/>${f.properties?.data}`\n      );\n    });\n    cluster.addLayers(markers);\n    map.addLayer(cluster);\n  });'}</CodeBlock>
        <Callout tone="success" icon="✅">
          <strong>chunkedLoading: true</strong> é a chave para evitar &quot;UI travada por 8s&quot; ao adicionar 50k markers. O plugin processa em event loop quebrado por <code>setTimeout</code>.
        </Callout>
      </Section>

      <Section title="Perf: SVG vs Canvas renderer" accent={accent}>
        <p>
          Leaflet usa SVG por default para <code>L.GeoJSON</code>, <code>L.Polyline</code>, <code>L.Polygon</code>, <code>L.Circle</code>, <code>L.Rectangle</code>. Cada feature vira um <code>&lt;path&gt;</code> no DOM. Bom até ~500 features. Acima disso, troque para Canvas.
        </p>
        <CodeBlock lang="tsx">{'// Renderer canvas global (preferCanvas: true no map options)\nconst map = L.map(el, { preferCanvas: true });\n\n// OU por layer (mais flexível)\nconst canvasRenderer = L.canvas({ padding: 0.5 });\n\nfetch("/api/bairros.geojson")\n  .then(r => r.json())\n  .then((data: GeoJSON.FeatureCollection) => {\n    L.geoJSON(data, {\n      renderer: canvasRenderer,\n      style: feature => ({\n        color: "#84cc16",\n        weight: 1,\n        fillOpacity: 0.2,\n        fillColor: feature?.properties?.cor ?? "#374151",\n      }),\n      onEachFeature: (feature, layer) => {\n        // hover em canvas: feature precisa de eventos manualmente\n        layer.on({\n          mouseover: e => e.target.setStyle({ weight: 3 }),\n          mouseout: e => e.target.setStyle({ weight: 1 }),\n        });\n      },\n    }).addTo(map);\n  });'}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Cenário', 'SVG (default)', 'Canvas']}
          rows={[
            ['< 500 features estáticas', 'Ótimo, interatividade trivial', 'Overkill'],
            ['500–5000 features', 'Lento em mobile', 'Bom — usar sempre'],
            ['5000+ features', 'Browser trava', 'Limítrofe — considerar vector tiles'],
            ['Hover/click rico (popup, mudança de cor)', 'Trivial via DOM', 'Possível mas precisa registrar manual'],
            ['Animação CSS (transition)', 'Funciona', 'Não funciona (canvas é bitmap)'],
            ['Export para SVG/PDF', 'Direto', 'Precisa converter'],
          ]}
        />
      </Section>

      <Section title="Mobile: o tier de problemas reais" accent={accent}>
        <StackFlow
          title="Stack mobile-friendly para Leaflet em PWA"
          accent={accent}
          items={[
            { text: 'preferCanvas: true', detail: 'Default global em canvas — economiza DOM e GC do Safari iOS' },
            { text: 'markercluster + chunkedLoading', detail: 'Obrigatório acima de 500 markers. Sem ele, scroll trava no iPhone' },
            { text: 'detectRetina: true', detail: 'Tile @2x onde disponível, sem dobrar volume em devices não-retina' },
            { text: 'maxZoom moderado', detail: 'Limitar a 17–18 evita carregar tiles enormes que não cabem na RAM mobile' },
            { text: 'tap: true (default) + tapTolerance: 15', detail: 'Aumentar tolerância de toque — dedos não acertam pixel exato' },
            { text: 'no-drag em scroll vertical', detail: 'dragging: false condicionalmente se mapa estiver em página com scroll, ou usar L.Control.scrollWheelZoom apenas em zoom-in deliberado' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          iOS Safari tem um bug histórico: <strong>mapas com altura 100vh dentro de container com overflow-scroll</strong> não recebem gestos corretamente. Solução: usar <code>height: 100dvh</code> (dynamic viewport, suportado iOS 16+) ou fixar altura em <code>px</code>.
        </Callout>
      </Section>

      <Section title="Quando trocar Leaflet por MapLibre" accent={accent}>
        <DecisionBox
          scenario="Tenho um app Leaflet que cresceu — vale migrar para MapLibre?"
          winner="Migre se: precisar de rotação/pitch 3D, vector tiles próprios, ou >50k features simultâneas"
          winnerColor={accent}
          why="Leaflet escala até onde DOM/canvas conseguem. Acima disso, WebGL é a única saída — e MapLibre é nativamente otimizado para isso. O custo da migração é não-trivial: plugins, popup ricos e hover-by-DOM precisam ser reescritos."
          alternatives={[
            { name: 'Continuar em Leaflet', when: 'Seu uso é raster (Esri, IBGE), você tem <5k markers, e bundle pequeno importa. Custo de migrar = 1–3 meses dev, ganho marginal.' },
            { name: 'Leaflet + VectorGrid plugin', when: 'Você quer vector tiles SEM largar Leaflet/plugins. Compromisso aceitável: VectorGrid é menos performático que MapLibre, mas mantém ecossistema.' },
            { name: 'OpenLayers', when: 'Você precisa de projeções não-Mercator (EPSG:31983 SIRGAS 2000, comum no Brasil oficial), WMS/WFS OGC nativo, ou GIS pesado de servidor estatal.' },
          ]}
        />
      </Section>

      <Section title="Referências" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Site oficial', v: 'leafletjs.com — docs, tutoriais, plugins indexados' },
            { k: 'Source', v: 'github.com/Leaflet/Leaflet' },
            { k: 'markercluster', v: 'github.com/Leaflet/Leaflet.markercluster' },
            { k: 'Leaflet.draw', v: 'github.com/Leaflet/Leaflet.draw' },
            { k: 'Leaflet.heat', v: 'github.com/Leaflet/Leaflet.heat' },
            { k: 'Awesome-Leaflet', v: 'github.com/onury/awesome-leaflet — curadoria' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
