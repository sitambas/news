'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { timeAgo, formatNumber } from '@/utils/helpers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUSES = ['सभी', 'published', 'draft', 'scheduled', 'archived'];

const STATUS_HINDI = { published: 'प्रकाशित', draft: 'ड्राफ्ट', scheduled: 'निर्धारित', archived: 'संग्रहीत' };

const STATUS_STYLES = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

async function fetchArticles(status) {
  const params = new URLSearchParams({
    status: status === 'सभी' ? 'all' : status,
    limit: '50',
    sort: '-createdAt',
  });
  const res = await fetch(`/api/articles?${params}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load articles');
  return data.data || [];
}

export default function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('सभी');
  const [selected, setSelected] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const { data: articles = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-articles', statusFilter],
    queryFn: () => fetchArticles(statusFilter),
  });

  const filtered = articles.filter((a) => {
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'सभी' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDelete = async (article) => {
    if (!window.confirm(`क्या आप वाकई "${article.title}" हटाना चाहते हैं?`)) return;

    const identifier = article.slug || article._id;
    if (!identifier) {
      toast.error('लेख पहचान नहीं मिली');
      return;
    }

    setDeletingId(article._id);
    try {
      const res = await fetch(`/api/articles/${identifier}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('लेख हटाया गया');
        queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      } else {
        toast.error(data.message || 'हटाने में विफल');
      }
    } catch {
      toast.error('हटाने में विफल');
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">लेख</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" /> नया लेख
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="लेख खोजें..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {s === 'सभी' ? s : STATUS_HINDI[s] || s}
              </button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">{selected.length} चुने गए</span>
            <button onClick={() => setSelected([])} className="text-xs text-gray-500 hover:underline">साफ़ करें</button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            <p>लेख लोड करने में विफल</p>
            <button onClick={() => refetch()} className="mt-2 text-sm underline">पुनः प्रयास करें</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => setSelected(e.target.checked ? filtered.map((a) => a._id) : [])}
                      checked={selected.length === filtered.length && filtered.length > 0}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">लेख</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">लेखक</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">श्रेणी</th>
                  <th className="px-4 py-3 text-left font-medium">स्थिति</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">दृश्य</th>
                  <th className="px-4 py-3 text-left font-medium hidden xl:table-cell">तारीख</th>
                  <th className="px-4 py-3 text-right font-medium">क्रियाएं</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((article) => (
                  <tr
                    key={article._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selected.includes(article._id) ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(article._id)}
                        onChange={() => toggleSelect(article._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block bg-gray-100 dark:bg-gray-800">
                          {article.coverImage ? (
                            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                          ) : article.youtubeUrl ? (
                            <div className="w-full h-full flex items-center justify-center text-red-500 text-xs font-bold">▶</div>
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-xs">
                            {article.title}
                          </p>
                          {article.isBreaking && (
                            <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">ब्रेकिंग</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{article.author?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-medium">
                        {article.category?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[article.status] || STATUS_STYLES.draft}`}>
                        {STATUS_HINDI[article.status] || article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(article.views || 0)}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-xs text-gray-400">{timeAgo(article.publishedAt || article.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {article.status === 'published' && article.slug && (
                          <Link
                            href={`/news/${article.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="View"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/articles/new?edit=${article.slug || article._id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article)}
                          disabled={deletingId === article._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FiSearch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="mb-3">कोई लेख नहीं मिला</p>
            <Link href="/admin/articles/new" className="text-sm text-red-600 hover:underline font-medium">
              पहला लेख बनाएं →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
