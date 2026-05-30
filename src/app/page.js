import { Suspense } from 'react';
import BreakingNewsTicker from '@/components/news/BreakingNewsTicker';
import HeroSection from '@/components/news/HeroSection';
import LatestNewsSection from '@/components/news/LatestNewsSection';
import TrendingSection from '@/components/news/TrendingSection';
import CategoryNewsSection from '@/components/news/CategoryNewsSection';
import Sidebar from '@/components/layout/Sidebar';
import SkeletonCard from '@/components/ui/SkeletonCard';
export const metadata = {
  title: 'CGFILE - Breaking News & Latest Stories',
  description: 'Stay up to date with the latest breaking news, world events, technology, business, sports, and more.',
};

async function getArticles() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/articles?status=published&limit=12`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Breaking News Ticker - only shows real breaking news from DB */}
      <BreakingNewsTicker news={articles.filter(a => a.isBreaking)} />

      {/* Hero Section */}
      <HeroSection articles={articles} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-10">
            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>}>
              <LatestNewsSection articles={articles} />
            </Suspense>

            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>}>
              <CategoryNewsSection category="technology" articles={articles.slice(0, 4)} />
            </Suspense>

            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>}>
              <CategoryNewsSection category="politics" articles={articles.slice(2, 6)} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Suspense fallback={<div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>}>
                <TrendingSection articles={articles} />
              </Suspense>
              <div className="mt-6">
                <Sidebar trending={articles} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
