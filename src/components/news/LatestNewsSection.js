'use client';

import { useState } from 'react';
import { FiGrid, FiList } from 'react-icons/fi';
import ArticleCard from './ArticleCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

export default function LatestNewsSection({ articles = SAMPLE_ARTICLES }) {
  const [view, setView] = useState('grid');

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
          {articles.slice(0, 6).map((article, i) => (
            <ArticleCard key={article.slug || i} article={article} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.slice(0, 8).map((article, i) => (
            <ArticleCard key={article.slug || i} article={article} variant="horizontal" />
          ))}
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
