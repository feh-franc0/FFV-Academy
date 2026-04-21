import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail45')!;

export const metadata: Metadata = {
  title: 'C# & .NET Moderno — FFV Academy',
  description:
    'C# e .NET em 2026 em PT-BR: C# 12+ (records, pattern matching, primary constructors), async/await rigoroso, LINQ produtivo, ASP.NET Core Minimal APIs, EF Core moderno, Span<T> e performance crítica, ecosystem .NET e capstone de API production-ready.',
  keywords:
    'c# 12, dotnet 8, records pattern matching, async await, linq, aspnet core minimal apis, ef core, span memory, native aot, blazor',
};

export default function CSharpDotnetPage() {
  return <TrailBlogClient trail={trail} />;
}
