'use client';

import { useState, useEffect } from 'react';
import { FiBookmark, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import ArticleCard from '@/components/news/ArticleCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import useAuthStore from '@/store/authStore';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const { user, isAuthenticated } = useAuthStore();

  // Use sample data as bookmarks for demo
  const displayBookmarks = (bookmarks.length > 0 ? bookmarks : SAMPLE_ARTICLES.slice(0, 6)).filter(
    (a) => !search || a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <FiBookmark className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Articles</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{displayBookmarks.length} articles saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayBookmarks.length > 0 ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-5' : 'space-y-4'}>
            {displayBookmarks.map((article, i) => (
              <ArticleCard
                key={article.slug || i}
                article={article}
                variant={view === 'list' ? 'horizontal' : 'default'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FiBookmark className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {search ? 'No matching bookmarks' : 'No saved articles'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search ? 'Try a different search term' : 'Save articles by clicking the bookmark icon'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
