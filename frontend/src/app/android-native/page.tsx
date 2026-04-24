import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail57')!;

export const metadata: Metadata = {
  title: 'Android Native: Kotlin + Compose — FFV Academy',
  description:
    'Android nativo 2026 em PT-BR: Kotlin 2.0 (K2 compiler), Jetpack Compose, coroutines + Flow, MVVM + UDF, Room, Retrofit, tests, publish Play Store com bundle AAB.',
  keywords:
    'android native, kotlin 2 k2 compiler, jetpack compose, kotlin coroutines flow, mvvm udf android, room android, retrofit android',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
