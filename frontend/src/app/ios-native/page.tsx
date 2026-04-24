import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail56')!;

export const metadata: Metadata = {
  title: 'iOS Native: Swift + SwiftUI — FFV Academy',
  description:
    'iOS nativo 2026 em PT-BR: Swift 6 moderno (macros, strict concurrency), SwiftUI declarativo, async/await + actors, SwiftData, URLSession, XCTest + Swift Testing, build/publish App Store via fastlane.',
  keywords:
    'ios native, swift 6, swiftui, swiftdata, ios async await, swift actors, ios testing, app store publish fastlane',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
