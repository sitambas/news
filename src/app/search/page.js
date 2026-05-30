'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import ArticleCard from '@/components/news/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import SkeletonCard from '@/components/ui/SkeletonCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';
import { debounce } from '@/utils/helpers';

const CATEGORIES = ['सभी', 'राजनीति', 'तकनीक', 'व्यापार', 'विज्ञान', 'खेल', 'स्वास्थ्य', 'विश्व'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'सबसे प्रासंगिक' },
  { value: 'date', label: 'सबसे नया' },
  { value: 'views', label: 'सर्वाधिक देखा' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('सभी');
  const [sortBy, setSortBy] = useState('relevance');
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (q, cat, sort) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q, sort });
      if (cat && cat !== 'सभी') params.set('category', cat.toLowerCase());
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setTotal(data.pagination?.total || 0);
      } else {
        // Fallback to sample data filtered by query
        const filtered = SAMPLE_ARTICLES.filter(
          (a) => a.title.toLowerCase().includes(q.toLowerCase()) || a.excerpt?.toLowerCase().includes(q.toLowerCase())
        );
        setResults(filtered);
        setTotal(filtered.length);
      }
    } catch {
      setResults([]);
      setTotal(0);
    }
    setLoading(false);
  }, []);

  const debouncedSearch = useCallback(debounce(performSearch, 500), [performSearch]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, selectedCategory, sortBy);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    router.push(url.pathname + url.search);
    performSearch(query, selectedCategory, sortBy);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Search Hero */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            न्यूज़हब पर खोजें
          </h1>
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                debouncedSearch(e.target.value, selectedCategory, sortBy);
              }}
              placeholder="खबरें, विषय, लोग खोजें..."
              className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Results */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      performSearch(query, cat, sortBy);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-red-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  performSearch(query, selectedCategory, e.target.value);
                }}
                className="ml-auto px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Results Info */}
            {searched && !loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {total > 0
                  ? `"${query}" के लिए ${total} परिणाम मिले`
                  : `"${query}" के लिए कोई परिणाम नहीं मिला`}
              </p>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Results Grid */}
            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {results.map((article, i) => (
                  <ArticleCard key={article.slug || i} article={article} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">कोई परिणाम नहीं मिला</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  अलग कीवर्ड आज़माएं या हमारी श्रेणियां ब्राउज़ करें
                </p>
              </div>
            )}

            {/* Initial State */}
            {!searched && !loading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">खोजना शुरू करें</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  हमारे न्यूज़ डेटाबेस को खोजने के लिए कीवर्ड दर्ज करें
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
