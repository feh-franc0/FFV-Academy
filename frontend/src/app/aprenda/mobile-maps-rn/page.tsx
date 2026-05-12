import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mobile-maps-rn');

const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  { question: '@rnmapbox/maps vs react-native-maps:', options: ['Idênticos', '@rnmapbox/maps: usa Mapbox SDK nativo (vector tiles, styling rico, offline first-class). react-native-maps: usa Google Maps SDK (Android) ou Apple Maps (iOS) — base do sistema, gratuito, menos custom', 'Apenas RN-Maps funciona', 'Apenas Mapbox suporta marker'], correct: 1, explanation: '@rnmapbox/maps é a escolha quando quer controle total (styling Mapbox, OSM via MapLibre Native, offline regions sérias). react-native-maps é o "default rápido" que usa o SDK do sistema — UX nativa, integração Google/Apple direta.' },
  { question: 'Marker performance em listas longas:', options: ['Sempre OK', 'Crítico — renderizar 1000+ markers React individualmente trava. Use clustering (supercluster), simbol layer do Mapbox (renderer nativo), ou MarkerView pooling. Threshold típico: > 100 markers visíveis = cluster', 'Apenas iOS sofre', 'Apenas Android sofre'], correct: 1, explanation: 'Cada Marker React é um component nativo. 1000 markers = 1000 native views = jank. Solução: clustering com supercluster JS lib + sourceLayer style do Mapbox. Em volume alto, considere Mapbox Symbol Layer puro (sem React) que renderiza no GPU.' },
  { question: 'Offline maps no celular:', options: ['Impossível', '@rnmapbox/maps tem OfflineManager — download regions específicas (bounds + zoom range), tiles armazenados em SQLite local. Tamanho típico: cidade ~100-300MB com vector tiles', 'Apenas no iOS', 'Apenas em Wi-Fi'], correct: 1, explanation: 'Offline first-class em Mapbox/MapLibre. OfflineRegionManager.createPack({ name, bounds, minZoom, maxZoom, styleURL }). Útil para apps de travel, field operations, delivery rural. Quota e download em background.' },
  { question: 'Expo dev client para usar @rnmapbox/maps:', options: ['Não funciona em Expo', 'Funciona com Expo dev client (custom dev client com native modules). Expo Go puro não — só JS. Adicione plugin no app.json, npx expo prebuild, npx expo run:ios/android', 'Apenas Expo SDK 40-', 'Sempre eject'], correct: 1, explanation: 'Expo dev client (não confundir com Expo Go) suporta native modules custom como @rnmapbox/maps. Adiciona plugin no app.json com mapbox download token; prebuild gera ios/ e android/; run nativo. Não precisa ejetar.' },
  { question: 'Geolocalização mobile patterns:', options: ['Sempre alta precisão', 'Trade-off bateria vs precisão: ROUGH (~1km, cell tower, baixa bateria) vs BALANCED (~100m, Wi-Fi assist) vs HIGH_ACCURACY (~10m, GPS direto, drena bateria). Escolha por feature; permissões iOS/Android cada vez mais granulares', 'Sempre baixa', 'GPS é grátis em bateria'], correct: 1, explanation: 'iOS/Android oferecem precisão configurável. App de delivery em rua precisa HIGH; app de "cidade próxima" basta ROUGH. Sempre peça permissão "while in use" antes de "always".' },
];

export default function Page() {
  return (
    <ModuleLayout slug="mobile-maps-rn" title="Mapas em React Native: Mapbox, Maps SDK, native modules" icon="📱" xp={60} readTime={12}
      trailName="Maps & Geospatial Engineering" trailColor={accent} quiz={quiz}>
      <Section title="O stack mobile maps 2026" accent={accent}>
        <p className="text-sm leading-6">Em React Native, duas escolhas dominam: <b>@rnmapbox/maps</b> (Mapbox/MapLibre SDK, custom styling, offline) ou <b>react-native-maps</b> (Google/Apple Maps nativo, mais simples, menos custom). Para iOS native + Android native fora de RN, MapKit / Maps SDK direto.</p>
      </Section>
      <Section title="Comparativo" accent={accent}>
        <ComparisonTable accent={accent} headers={['Lib', 'SDK', 'Custom styling', 'Offline', 'Custo']} rows={[
          ['@rnmapbox/maps', 'Mapbox Native / MapLibre Native', 'Total (style spec)', 'First-class', 'Mapbox: por tile load; MapLibre: free'],
          ['react-native-maps', 'Google Maps / Apple Maps', 'Limitado', 'Limitado', 'Google: Maps API; Apple: free'],
          ['MapKit (iOS native)', 'Apple Maps', 'Médio', 'Sim', 'Free com Apple Developer'],
          ['Maps SDK Android', 'Google Maps', 'Médio', 'Sim', 'Pago em volume alto'],
        ]} />
      </Section>
      <Section title="Setup @rnmapbox/maps com Expo" accent={accent}>
        <CodeBlock lang="bash">{`# Expo dev client (NÃO Expo Go)
npx create-expo-app my-app
cd my-app
npm install @rnmapbox/maps

# app.json
{
  "expo": {
    "plugins": [
      ["@rnmapbox/maps", {
        "RNMapboxMapsImpl": "mapbox",
        "RNMapboxMapsDownloadToken": "sk.eyJ1Ij..."
      }]
    ]
  }
}

# Prebuild + run
npx expo prebuild
npx expo run:ios`}</CodeBlock>
      </Section>
      <Section title="Componente básico" accent={accent}>
        <CodeBlock lang="tsx">{`import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

export default function MapScreen() {
  return (
    <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}>
      <Mapbox.Camera
        zoomLevel={14}
        centerCoordinate={[-46.6333, -23.5505]}  // São Paulo
      />
      <Mapbox.PointAnnotation id="store" coordinate={[-46.6333, -23.5505]}>
        <View style={styles.pin} />
      </Mapbox.PointAnnotation>
    </Mapbox.MapView>
  );
}`}</CodeBlock>
      </Section>
      <Section title="Clustering em listas grandes" accent={accent}>
        <CodeBlock lang="tsx">{`<Mapbox.ShapeSource id="stores" cluster clusterRadius={50}
  shape={{ type: 'FeatureCollection', features: stores.map(s => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    properties: { id: s.id },
  })) }}>
  <Mapbox.SymbolLayer id="cluster-count"
    filter={['has', 'point_count']}
    style={{ textField: ['get', 'point_count'], textSize: 14 }}
  />
  <Mapbox.CircleLayer id="cluster-circles"
    filter={['has', 'point_count']}
    style={{ circleRadius: 18, circleColor: '#22c55e' }}
  />
  <Mapbox.SymbolLayer id="unclustered"
    filter={['!', ['has', 'point_count']]}
    style={{ iconImage: 'pin-icon', iconSize: 1.2 }}
  />
</Mapbox.ShapeSource>`}</CodeBlock>
        <Callout tone="info">SymbolLayer + CircleLayer rendem 10.000+ pontos a 60fps porque rendering é GPU nativo, não React component por marker.</Callout>
      </Section>
      <Section title="Offline regions" accent={accent}>
        <CodeBlock lang="tsx">{`import Mapbox from '@rnmapbox/maps';

// Download de uma região
await Mapbox.offlineManager.createPack({
  name: 'sao-paulo',
  styleURL: Mapbox.StyleURL.Street,
  bounds: [
    [-46.83, -23.36],  // SW
    [-46.36, -23.74],  // NE
  ],
  minZoom: 10,
  maxZoom: 16,
}, (region, status) => {
  console.log('progress:', status.percentage);
});

// Listar packs
const packs = await Mapbox.offlineManager.getPacks();

// Deletar
await Mapbox.offlineManager.deletePack('sao-paulo');`}</CodeBlock>
      </Section>
      <Section title="Permissões e geolocalização" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'expo-location', v: 'API canônica em Expo. Permission flow: requestForegroundPermissionsAsync() → requestBackgroundPermissionsAsync()' },
          { k: 'iOS 14+ accuracy', v: 'Usuário pode dar "precise" ou "approximate" — handle ambos' },
          { k: 'Android 12+ approximate location', v: 'Mesmo pattern — request precise mas funcione com approximate' },
          { k: 'Battery patterns', v: 'Background: tasks com geofencing, não polling contínuo. Foreground: pode pedir HIGH_ACCURACY' },
        ]} />
      </Section>
      <Callout tone="success" icon="🎓">Trilha Maps & Geospatial Engineering concluída. Badge <b>Geospatial Engineer</b> desbloqueado.</Callout>
    </ModuleLayout>
  );
}
