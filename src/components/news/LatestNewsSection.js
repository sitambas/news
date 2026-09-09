'use client';

import { useState } from 'react';
import { FiGrid, FiList } from 'react-icons/fi';
import ArticleCard from './ArticleCard';
import AdSlot from '@/components/ads/AdSlot';
import NativeAdCard from '@/components/ads/NativeAdCard';
import { getNativeAdsAfterIndex } from '@/lib/ads';

export default function LatestNewsSection({ articles = [], ads = null }) {
  const [view, setView] = useState('grid');
  const list = view === 'grid' ? articles.slice(0, 6) : articles.slice(0, 8);
  const bannerAfter = view === 'grid' ? 2 : 3;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-red-600 rounded-full" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">ताज़ा खबरें</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {list.map((article, i) => {
            const natives = getNativeAdsAfterIndex(ads, i, 'latest');
            return (
              <div key={article.slug || i} className="contents">
                <ArticleCard article={article} />
                {natives.map((ad, ni) => (
                  <NativeAdCard key={`native-${i}-${ni}-${ad.title}`} ad={ad} />
                ))}
                {ads?.adsEnabled && i === bannerAfter - 1 && (
                  <div className="sm:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1.5 overflow-hidden">
                    <AdSlot position="latest" ads={ads} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((article, i) => {
            const natives = getNativeAdsAfterIndex(ads, i, 'latest');
            return (
              <div key={article.slug || i}>
                <ArticleCard article={article} variant="horizontal" />
                {natives.map((ad, ni) => (
                  <div key={`native-${i}-${ni}-${ad.title}`} className="mt-4">
                    <NativeAdCard ad={ad} variant="horizontal" />
                  </div>
                ))}
                {ads?.adsEnabled && i === bannerAfter - 1 && (
                  <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1.5 overflow-hidden">
                    <AdSlot position="latest" ads={ads} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <button className="px-6 py-2.5 border-2 border-red-600 text-red-600 font-semibold rounded-xl hover:bg-red-600 hover:text-white transition-all text-sm">
          और लेख लोड करें
        </button>
      </div>
    </section>
  );
}
