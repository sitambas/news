import { Suspense } from 'react';
import BreakingNewsTicker from '@/components/news/BreakingNewsTicker';
import HeroSection from '@/components/news/HeroSection';
import LatestNewsSection from '@/components/news/LatestNewsSection';
import TrendingSection from '@/components/news/TrendingSection';
import CategoryNewsSection from '@/components/news/CategoryNewsSection';
import Sidebar from '@/components/layout/Sidebar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import AdSlot from '@/components/ads/AdSlot';
import AdSidebarCards from '@/components/ads/AdSidebarCards';
import AdTopStrip from '@/components/ads/AdTopStrip';
import { pickAdsConfig } from '@/lib/ads';
import { getSiteSettings } from '@/lib/siteSettings';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, absoluteUrl } from '@/constants/seo';

export const metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl('/'),
    type: 'website',
    locale: 'hi_IN',
  },
};

async function getArticles() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/articles?status=published&limit=24`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/categories`, {
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
  const [articles, categories, settings] = await Promise.all([
    getArticles(),
    getCategories(),
    getSiteSettings(),
  ]);
  const featuredCategories = categories.slice(0, 2);
  const ads = pickAdsConfig(settings);
  const hasSidebarCards = ads?.adsEnabled && (ads.adCarousel || []).some((b) => b?.imageUrl);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <BreakingNewsTicker news={articles.filter((a) => a.isBreaking)} />

      {/* Top strip — empty space between breaking news and hero */}
      {ads?.adsEnabled && <AdTopStrip ads={ads} />}

      <HeroSection articles={articles} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>}>
              <LatestNewsSection articles={articles} ads={ads} />
            </Suspense>

            {ads?.adsEnabled && (
              <AdSlot
                position="homeMid"
                ads={ads}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1.5 overflow-hidden"
              />
            )}

            <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>}>
              {featuredCategories.map((cat, i) => (
                <div key={cat.slug} className="space-y-6">
                  {i === 1 && ads?.adsEnabled && (
                    <AdSlot
                      position="betweenCategories"
                      ads={ads}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1.5 overflow-hidden"
                    />
                  )}
                  <CategoryNewsSection category={cat} articles={articles} />
                </div>
              ))}
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* All greeting banners as stacked sidebar cards */}
              {hasSidebarCards && <AdSidebarCards ads={ads} />}

              {!hasSidebarCards && ads?.adsEnabled && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 overflow-hidden">
                  <AdSlot position="sidebar" ads={ads} className="min-h-[250px]" format="rectangle" />
                </div>
              )}

              <div className="lg:sticky lg:top-28 space-y-6">
                <Suspense fallback={<div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>}>
                  <TrendingSection articles={articles} />
                </Suspense>
                <Sidebar trending={articles} ads={ads} showSidebarAd={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
