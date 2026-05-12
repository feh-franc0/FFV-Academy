import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-maps-geospatial')!;

export const metadata: Metadata = {
  title: 'Maps & Geospatial Engineering — FFV Academy',
  description:
    'Mapas e geo como engenharia: Mapbox vs MapLibre, Leaflet profissional, PostGIS profundo (GIST, KNN, ST_DWithin), vector tiles (tippecanoe + Martin), routing (OSRM/GraphHopper/Valhalla), spatial indexing (H3 Uber, S2 Google), OpenStreetMap pipeline, mapas em React Native.',
  keywords: 'mapbox maplibre, postgis gist, vector tiles tippecanoe, osrm routing, h3 uber hexagonal, openstreetmap, react native maps',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
