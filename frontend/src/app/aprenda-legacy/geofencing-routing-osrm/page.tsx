import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('geofencing-routing-osrm');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'O que OSRM faz e por que é o engine de roteamento mais usado?',
    options: [
      'É um cliente JS',
      'OSRM (Open Source Routing Machine, Project OSRM, originalmente Karlsruhe) é um engine C++ de cálculo de rotas sobre OpenStreetMap usando Contraction Hierarchies (CH) — algoritmo que pré-processa o grafo em estrutura hierárquica permitindo queries de rota A→B em microsegundos. Roda como serviço HTTP/2. Trade-off: rápido como nada, mas pré-processamento de novo país leva horas, e suporta apenas um modal (carro OU pedestre OU bike, não troca em runtime)',
      'OSRM é um banco de dados',
      'OSRM é um SDK mobile',
    ],
    correct: 1,
    explanation: 'OSRM (project-osrm.org, BSD-2) usa Contraction Hierarchies (Geisberger et al., 2008) — pré-processa o grafo road network ordenando nós por importância e adicionando shortcuts. Resultado: queries Dijkstra-like em microsegundos. Por isso é o engine de delivery, fleet management, ETA realtime. Limitação: cada profile (car, bike, foot) precisa de pré-processamento separado; sem multi-modal nativo.',
  },
  {
    question: 'GraphHopper vs OSRM vs Valhalla — qual a diferença?',
    options: [
      'São idênticos',
      'OSRM (C++, CH): mais rápido para car-only, batch ETA. GraphHopper (Java, CH+Flexible Mode): multi-modal (car/bike/foot), suporta turn restrictions complexas, custom weights. Valhalla (C++, Mapbox/Mapzen): mesh-based (tiles independentes), multi-modal nativo, suporta time-dependent (traffic), usado pelo Mapbox e Tesla',
      'Apenas OSRM existe',
      'Apenas Java é válido',
    ],
    correct: 1,
    explanation: 'Os três cobrem espectros diferentes. OSRM = mais rápido, mas rígido. GraphHopper (graphhopper.com) = balance de velocidade + flexibilidade, popular em Europa (BMW, Outdooractive). Valhalla (originalmente Mapzen, hoje Mapbox open-source) = mesh-based (cada região é um tile independente que se conecta), permite atualizar parte do mapa sem regenerar tudo. Tesla usa Valhalla para navegação onboard.',
  },
  {
    question: 'O que é uma isócrona e como gerar?',
    options: [
      'Uma forma de criptografia',
      'Uma fonte do Word',
      'Isócrona (isochrone) = polígono que mostra "tudo o que está a até X minutos deste ponto", caminhando, dirigindo, etc. Gerada via flood-fill no grafo de routing a partir do source, com limite temporal. Caso real: app de delivery decide quais restaurantes mostrar baseado em isócrona de 30min do endereço do cliente. APIs: GraphHopper, Valhalla, OSRM via plugin "isochrones"',
      'Apenas um nome bonito',
    ],
    correct: 2,
    explanation: 'Isócrona responde "até onde consigo chegar em N minutos". Algoritmo: Dijkstra-like flood-fill no grafo viário com custo = tempo, parando ao atingir o limite. Retorna polygon do convex hull (ou alpha shape) dos nós alcançáveis. Usos: análise de catchment area (delivery, lojas físicas), planejamento urbano, simulação de transit. iFood usa isócronas para definir radius dinâmico de restaurantes por bairro.',
  },
  {
    question: 'Geofence: entry, exit, dwell — o que cada um significa?',
    options: [
      'Todos são iguais',
      'Apenas entry existe',
      'Entry = trigger quando usuário CRUZA o polígono entrando (estava fora, agora dentro). Exit = inverso (estava dentro, agora fora). Dwell = trigger quando permanece dentro por N minutos sem sair. Implementação: cliente envia heartbeat de localização, servidor mantém last_state por (user, fence) e dispara evento na transição. Caso real: notificação push "chegou perto do destino" (entry) ou "ficou 30min na loja, oferecer cupom" (dwell)',
      'São timeouts',
    ],
    correct: 2,
    explanation: 'Os três triggers são canônicos no Apple Core Location e Google Geofencing API. Backend implementa: maintain state machine (OUT, IN, DWELL) por (user, fence) em Redis com TTL. A cada heartbeat: ST_Contains(fence, current_loc) → new_state. Se new_state != old_state, dispara webhook. Dwell adiciona timer ao entrar (após N min ainda dentro = dwell).',
  },
  {
    question: 'ETA realtime: por que não basta distância/velocidade média?',
    options: [
      'Basta sim',
      'Não basta porque tráfego, semáforos, curvas, faixas, restrições temporais (carga só após 22h) afetam o tempo real. ETA decente combina: rota OSRM (tempo livre fluxo) + multiplicador de tráfego histórico por hora/dia/segmento + correção pela velocidade observada de carros em ZONAS PRÓXIMAS recentes (HERE Live Traffic, TomTom, Google traffic) + machine learning local. Uber/iFood treinam modelo de "viagem real" vs "ETA OSRM" e aplicam correção',
      'ETA é sempre exato',
      'Apenas velocidade conta',
    ],
    correct: 1,
    explanation: 'Engineering de ETA é problema próprio. Stack típica: OSRM/Valhalla dá tempo de "free flow" (sem tráfego), multiplicado por fator histórico (este segmento, terça 18h, +35%), corrigido por live traffic (motoristas reportando velocidade). Por isso Uber, iFood, Rappi têm time inteiro de ETA — não é só Dijkstra. Mapbox ETA API combina free-flow + live traffic. Google Maps usa anonimous traffic do Android.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="geofencing-routing-osrm"
      title="Geofencing + routing: OSRM, GraphHopper, Valhalla"
      icon="🛣️"
      xp={65}
      readTime={13}
      trailName="Maps & Geospatial Engineering"
      trailColor={accent}
      nextSlug="spatial-queries-postgres"
      nextTitle="Spatial queries em produção: clusters, h3, S2"
      quiz={quiz}
    >
      <Section title="Routing engines: o trio que importa" accent={accent}>
        <p>
          Calcular &quot;como ir do ponto A ao ponto B em rua aberta&quot; é um problema bem mais difícil do que parece. O grafo de OpenStreetMap tem ~5 bilhões de nós no planeta inteiro. Rodar Dijkstra puro num grafo desse tamanho leva minutos por query — inaceitável para apps de delivery, navegação, fleet management. Três engines open-source resolvem o problema com abordagens distintas:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Engine', 'Linguagem', 'Algoritmo', 'Forte em', 'Fraco em']}
          rows={[
            ['OSRM', 'C++', 'Contraction Hierarchies', 'Velocidade absoluta, batch ETA, escala', 'Multi-modal, mudanças runtime'],
            ['GraphHopper', 'Java', 'CH + Flexible Mode (Dijkstra otimizado)', 'Multi-modal, custom weights, isócronas', 'Latência (Java GC)'],
            ['Valhalla', 'C++', 'Mesh-based (tiles independentes)', 'Multi-modal nativo, time-dependent, mobile offline', 'Setup complexo'],
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'OSRM', v: 'project-osrm.org — BSD-2, mantido pela Mapbox + comunidade. Usado por GraphHopper Cloud, Mapbox Directions API (parcial)' },
            { k: 'GraphHopper', v: 'graphhopper.com — Apache 2.0 (core), proprietário (Directions API). Usado por BMW, Audi, Outdooractive' },
            { k: 'Valhalla', v: 'valhalla.github.io — MIT, originalmente Mapzen (RIP 2018), hoje Mapbox open-source. Usado por Tesla (onboard nav), Komoot, Mapbox Navigation SDK' },
          ]}
        />
      </Section>

      <Section title="Contraction Hierarchies: por que OSRM é tão rápido" accent={accent}>
        <p>
          <strong>Contraction Hierarchies</strong> (Geisberger, Sanders, Schultes, Delling — KIT Karlsruhe, 2008) é o algoritmo que permitiu &quot;Google Maps em microsegundos&quot;. Ideia: pré-processar o grafo ordenando nós por importância (autoestrada &gt; avenida &gt; rua local), e para cada contração adicionar &quot;shortcuts&quot; que preservam menor caminho.
        </p>
        <FlowDiagram
          title="Pipeline CH (OSRM)"
          accent={accent}
          orientation="vertical"
          steps={[
            { label: 'osrm-extract', desc: 'Lê OSM PBF + profile Lua (car.lua, bicycle.lua, foot.lua). Saída: .osrm files (~5GB para Brasil)' },
            { label: 'osrm-contract', desc: 'Ordena nós por importância e adiciona shortcuts. Demora ~30min para Brasil em servidor médio' },
            { label: 'osrm-routed', desc: 'Servidor HTTP. Recebe /route/v1/car/{from};{to} → Dijkstra bidirecional sobre o grafo contratado. Latência: ~5ms' },
          ]}
        />
        <CodeBlock lang="bash">{'# Pipeline completo: OSM PBF → OSRM em produção\nwget https://download.geofabrik.de/south-america/brazil-latest.osm.pbf\n\n# 1. Extract (parse PBF + aplica profile)\ndocker run -t -v $(pwd):/data ghcr.io/project-osrm/osrm-backend \\\n  osrm-extract -p /opt/car.lua /data/brazil-latest.osm.pbf\n\n# 2. Partition + customize (para Multi-Level Dijkstra) OU contract (para CH)\ndocker run -t -v $(pwd):/data ghcr.io/project-osrm/osrm-backend \\\n  osrm-contract /data/brazil-latest.osrm\n\n# 3. Run server\ndocker run -t -i -p 5000:5000 -v $(pwd):/data ghcr.io/project-osrm/osrm-backend \\\n  osrm-routed --algorithm ch /data/brazil-latest.osrm\n\n# Query (rota motoboy)\ncurl "http://localhost:5000/route/v1/driving/-46.6333,-23.5505;-46.6588,-23.5614?overview=full&geometries=geojson"'}</CodeBlock>
        <Callout tone="info" icon="📚">
          Paper original: <em>Contraction Hierarchies: Faster and Simpler Hierarchical Routing in Road Networks</em> (Geisberger et al., 2008). Vale ler — explica por que ordering por &quot;edge difference&quot; é o segredo.
        </Callout>
      </Section>

      <Section title="GraphHopper: flexibilidade Java" accent={accent}>
        <p>
          <strong>GraphHopper</strong> (Peter Karich, 2012) é o engine Java de fato para roteamento europeu. Sua diferença: <em>flexible mode</em> permite mudar weights em runtime (dia/noite, evitar pedágio, preferir ciclovia) sem regenerar o grafo. Trade-off: mais lento que OSRM CH puro, mas muito mais ágil para casos com regras complexas.
        </p>
        <CodeBlock lang="bash">{'# Docker\ndocker run -d --name graphhopper -p 8989:8989 \\\n  -v $(pwd)/data:/data \\\n  israelhikingmap/graphhopper:latest \\\n  --url https://download.geofabrik.de/south-america/brazil-latest.osm.pbf \\\n  --host 0.0.0.0\n\n# Query: rota com profile car + via point\ncurl "http://localhost:8989/route?point=-23.55,-46.63&point=-23.56,-46.65&vehicle=car&type=json"\n\n# Isócrona: até 30min de bike\ncurl "http://localhost:8989/isochrone?point=-23.55,-46.63&time_limit=1800&vehicle=bike"'}</CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Feature', 'OSRM', 'GraphHopper', 'Valhalla']}
          rows={[
            ['Velocidade de query', '⚡⚡⚡ (microseg)', '⚡⚡ (ms)', '⚡⚡ (ms)'],
            ['Multi-modal nativo', 'Não (profile fixo)', 'Sim (vehicle param)', 'Sim'],
            ['Custom weights runtime', 'Não', 'Sim (Flexible Mode)', 'Sim (costing options)'],
            ['Isócronas (built-in)', 'Plugin', 'Sim', 'Sim'],
            ['Map matching (GPS trace)', 'Sim', 'Sim', 'Sim (meili)'],
            ['Time-dependent (traffic)', 'Não', 'Parcial', 'Sim'],
            ['Tile-based (offline mobile)', 'Não', 'Sim (Android lib)', 'Sim (mobile-first)'],
            ['Memória (Brasil)', '~5GB', '~6GB', '~3GB (tile lazy load)'],
          ]}
        />
      </Section>

      <Section title="Valhalla: a stack do Mapbox/Tesla" accent={accent}>
        <p>
          <strong>Valhalla</strong> (Mapzen, 2015; hoje Mapbox open-source) tem uma diferença arquitetural: <em>mesh-based tiles</em>. O grafo do mundo é dividido em tiles (similar a vector tiles) que se conectam nas bordas. Vantagens: atualização parcial (re-gerar só tiles afetados), suporte nativo a multi-modal (transit + walk + bike), e operação offline mobile.
        </p>
        <CodeBlock lang="bash">{'# build tiles para Brasil\ndocker run -e tile_urls=https://download.geofabrik.de/south-america/brazil-latest.osm.pbf \\\n  -v $(pwd)/data:/data \\\n  gisops/valhalla:latest\n\n# Query rota\ncurl http://localhost:8002/route -d \'{\n  "locations": [\n    {"lat": -23.5505, "lon": -46.6333},\n    {"lat": -23.5614, "lon": -46.6588}\n  ],\n  "costing": "auto",\n  "costing_options": {\n    "auto": {\n      "use_tolls": 0.0,\n      "use_highways": 1.0\n    }\n  }\n}\'\n\n# Isócrona (multi-contour)\ncurl http://localhost:8002/isochrone -d \'{\n  "locations": [{"lat": -23.55, "lon": -46.63}],\n  "costing": "pedestrian",\n  "contours": [{"time": 5}, {"time": 10}, {"time": 15}]\n}\''}</CodeBlock>
        <Callout tone="success" icon="✅">
          Para mobile offline (Tesla, Komoot, app de trilha sem internet), <strong>Valhalla é o líder</strong> — seus tiles podem ser baixados parcialmente e atualizados independentemente.
        </Callout>
      </Section>

      <Section title="Geofencing: triggers e arquitetura" accent={accent}>
        <p>
          Geofence é &quot;polígono que dispara eventos quando alguém entra, sai ou permanece dentro&quot;. Stack típica:
        </p>
        <StackFlow
          title="Arquitetura de geofencing escalável"
          accent={accent}
          items={[
            { text: 'Cliente mobile', detail: 'Envia heartbeat de location a cada 10–60s (battery aware) via WebSocket ou HTTP POST' },
            { text: 'Ingestion (NATS/Kafka)', detail: 'Recebe stream de heartbeats, particiona por user_id' },
            { text: 'Worker (Go/Rust)', detail: 'Para cada heartbeat: SELECT fence_id FROM fences WHERE ST_Contains(geom, point). Compara com last_state[user][fence] em Redis' },
            { text: 'State machine', detail: 'OUT→IN = entry. IN→OUT = exit. IN por >N min = dwell timer. Atualiza Redis last_state com TTL' },
            { text: 'Webhook dispatcher', detail: 'Push notification (FCM/APNs), webhook HTTP para serviços downstream' },
            { text: 'Audit log', detail: 'Eventos persistidos em PostgreSQL/ClickHouse para analytics e replay' },
          ]}
        />
        <CodeBlock lang="go">{'// Worker pattern em Go (simplificado)\ntype FenceEvent struct {\n  UserID   string\n  FenceID  string\n  Type     string  // "entry", "exit", "dwell"\n  At       time.Time\n  Lat, Lng float64\n}\n\nfunc processHeartbeat(ctx context.Context, hb Heartbeat) error {\n  // 1. Quais fences contêm este ponto?\n  fences, err := pgx.Query(ctx,\n    `SELECT id FROM fences \n     WHERE geom && ST_SetSRID(ST_MakePoint($1, $2), 4326)\n       AND ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))`,\n    hb.Lng, hb.Lat)\n  if err != nil { return err }\n  defer fences.Close()\n\n  insideNow := map[string]bool{}\n  for fences.Next() {\n    var fid string\n    fences.Scan(&fid)\n    insideNow[fid] = true\n  }\n\n  // 2. Compara com estado anterior em Redis\n  prev, _ := redis.SMembers(ctx, "user:"+hb.UserID+":fences").Result()\n  prevSet := setOf(prev)\n\n  // 3. Diff = transições\n  for fid := range insideNow {\n    if !prevSet[fid] {\n      emit(FenceEvent{hb.UserID, fid, "entry", time.Now(), hb.Lat, hb.Lng})\n    }\n  }\n  for fid := range prevSet {\n    if !insideNow[fid] {\n      emit(FenceEvent{hb.UserID, fid, "exit", time.Now(), hb.Lat, hb.Lng})\n    }\n  }\n\n  // 4. Atualiza estado\n  redis.Del(ctx, "user:"+hb.UserID+":fences")\n  if len(insideNow) > 0 {\n    members := keysOf(insideNow)\n    redis.SAdd(ctx, "user:"+hb.UserID+":fences", members...)\n    redis.Expire(ctx, "user:"+hb.UserID+":fences", 5*time.Minute)\n  }\n\n  return nil\n}'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>Dwell</strong> não pode ser implementado &quot;naturalmente&quot; — precisa de timer separado. Ao entrar (entry), agende job em N minutos. Se na hora do job o usuário ainda está dentro → dwell. Use Redis sorted set ou tabela <code>dwell_pending</code>.
        </Callout>
      </Section>

      <Section title="ETA real: por que OSRM puro mente" accent={accent}>
        <p>
          OSRM retorna tempo de viagem em <em>free flow</em>: estimativa baseada em velocidade máxima de cada segmento, sem tráfego. Para um app de delivery, ETA &quot;15 min&quot; do OSRM pode virar &quot;25 min&quot; reais. Stack séria combina:
        </p>
        <FlowDiagram
          title="ETA híbrido em produção"
          accent={accent}
          orientation="vertical"
          steps={[
            { label: 'OSRM /route', desc: 'Tempo free flow do segmento (T_base)' },
            { label: 'Multiplicador histórico', desc: 'Tabela: segmento × dia da semana × hora → fator (ex: BR-101, terça 18h, fator 1.4)' },
            { label: 'Live traffic', desc: 'API HERE/TomTom/INRIX OU agregação de heartbeat dos motoristas da própria frota nos últimos 5 min' },
            { label: 'ML correction', desc: 'Modelo treinado em (T_predicted vs T_real) últimos 90 dias por região, ajusta sazonalidade' },
            { label: 'Output', desc: 'ETA final = T_base × fator_historico × fator_live × ml_correction' },
          ]}
        />
        <Callout tone="info" icon="📊">
          O <strong>Uber</strong> publicou (Eng Blog, 2018) que o erro médio de ETA caiu de 30% (Dijkstra puro) para 8% após inclusão de live traffic via heartbeat da própria frota. Self-traffic é o &quot;moat&quot;: quanto mais motoristas você tem, melhor seu ETA fica.
        </Callout>
      </Section>

      <Section title="Caso: app de delivery real (iFood-like)" accent={accent}>
        <CodeBlock lang="tsx">{'// Fluxo no checkout — cliente verifica se endereço é entregável\nasync function checkDeliverable(addressLat: number, addressLng: number) {\n  // 1. Geofence: está em alguma zona de cobertura?\n  const zonas = await fetch("/api/zonas/contains", {\n    method: "POST",\n    body: JSON.stringify({ lat: addressLat, lng: addressLng }),\n  }).then(r => r.json());\n  if (zonas.length === 0) return { ok: false, reason: "fora_cobertura" };\n\n  // 2. Isócrona: tem restaurante a até 30min de bike?\n  const isochrone = await fetch(\n    `https://valhalla/isochrone?lat=${addressLat}&lng=${addressLng}&minutes=30&vehicle=bicycle`\n  ).then(r => r.json());\n\n  // 3. PostGIS: quais restaurantes caem dentro da isócrona?\n  const restaurantes = await fetch("/api/restaurantes/within", {\n    method: "POST",\n    body: JSON.stringify({ geojson: isochrone }),\n  }).then(r => r.json());\n\n  return { ok: true, restaurantes };\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Esse pattern (geofence + isócrona + ST_Within) é a base do &quot;mostrar só restaurantes que entregam aqui&quot;. iFood, Rappi, 99Food usam variações disso.
        </Callout>
      </Section>

      <Section title="Decisão prática" accent={accent}>
        <DecisionBox
          scenario="Vou construir o backend de routing para um app de delivery brasileiro (entrega de carro/moto/bike)"
          winner="Valhalla self-host + PostGIS + Redis"
          winnerColor={accent}
          why="Valhalla suporta multi-modal nativo (carro de manhã, bike à tarde), tem isócronas built-in, e seu modelo mesh permite atualizar parte do mapa (ex: nova rua em São Paulo) sem regenerar tudo. Self-host elimina custo por request."
          alternatives={[
            { name: 'OSRM', when: 'Você precisa de velocidade extrema (frota de milhões), profile único, e dados raramente mudam. Mais simples de operar.' },
            { name: 'Google Directions API', when: 'Você está começando, valor de ETA preciso é crítico (Google tem o melhor live traffic mundialmente), e aceita pagar $5/1k requests.' },
            { name: 'Mapbox Directions', when: 'Você já é Mapbox stack. Combina bem com Mapbox Navigation SDK mobile.' },
            { name: 'GraphHopper Cloud', when: 'Time Java existente, precisa de matrices grandes (10x10 ETAs simultâneos para otimização de rota).' },
          ]}
        />
      </Section>

      <Section title="Referências" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'OSRM', v: 'project-osrm.org / github.com/Project-OSRM/osrm-backend' },
            { k: 'GraphHopper', v: 'graphhopper.com / github.com/graphhopper/graphhopper' },
            { k: 'Valhalla', v: 'valhalla.github.io / github.com/valhalla/valhalla' },
            { k: 'Paper CH', v: 'Geisberger et al., Contraction Hierarchies (2008) — algorithmica' },
            { k: 'Uber ETA blog', v: 'eng.uber.com/forecasting-arrival-times/ (2018)' },
            { k: 'OSM routing wiki', v: 'wiki.openstreetmap.org/wiki/Routing' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
