import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail46')!;

export const metadata: Metadata = {
  title: 'Java Moderno (17/21 LTS) — FFV Academy',
  description:
    'Java 2026 sem nostalgia: records, sealed classes, pattern matching, virtual threads (Project Loom), Spring Boot 3 com GraalVM native image, JPA sem N+1, reactive vs virtual threads, alternativas Micronaut/Quarkus, tuning de JVM (G1/ZGC/Shenandoah) e capstone production-ready em PT-BR.',
  keywords:
    'java 21 lts, virtual threads loom, records sealed pattern matching, spring boot 3 graalvm, jpa hibernate n+1, micronaut quarkus, jvm gc g1 zgc',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
