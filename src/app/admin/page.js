'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  FiFileText, FiUsers, FiEye, FiPlus, FiEdit,
  FiArrowUp, FiArrowDown, FiActivity,
  FiBarChart2, FiRefreshCw,
} from 'react-icons/fi';
import { formatDate, timeAgo, formatNumber } from '@/utils/helpers';
import { getArticleBylineName } from '@/utils/reporter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_HINDI = {
  published: 'प्रकाशित',
  draft: 'ड्राफ्ट',
  scheduled: 'निर्धारित',
  archived: 'संग्रहीत',
};

async function fetchDashboard() {
  const res = await fetch('/api/admin/dashboard');
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load dashboard');
  return data.data;
}

function BarChart({ data }) {
  if (!data?.length) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-gray-400">
        कोई डेटा नहीं
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-red-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity min-h-[4px]"
            style={{ height: `${Math.max((bar.value / max) * 100, 4)}%` }}
            title={`${bar.label}: ${formatNumber(bar.value)} दृश्य${bar.published ? `, ${bar.published} लेख` : ''}`}
          />
          <span className="text-xs text-gray-400">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 60_000,
  });

  const stats = data?.stats;
  const weeklyChart = data?.weeklyChart || [];
  const recentArticles = data?.recentArticles || [];

  const statCards = stats
    ? [
        {
          label: 'कुल लेख',
          value: formatNumber(stats.totalArticles),
          change: stats.articlesChange.text,
          up: stats.articlesChange.up,
          icon: FiFileText,
          color: 'blue',
        },
        {
          label: 'कुल उपयोगकर्ता',
          value: formatNumber(stats.totalUsers),
          change: stats.usersChange.text,
          up: stats.usersChange.up,
          icon: FiUsers,
          color: 'green',
        },
        {
          label: 'कुल दृश्य',
          value: formatNumber(stats.totalViews),
          change: '—',
          up: true,
          icon: FiEye,
          color: 'purple',
        },
        {
          label: 'आज प्रकाशित',
          value: formatNumber(stats.publishedToday),
          change: stats.todayChange.text,
          up: stats.todayChange.up,
          icon: FiActivity,
          color: 'orange',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">डैशबोर्ड</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {formatDate(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-red-500">
          <p>डैशबोर्ड लोड करने में विफल</p>
          <button onClick={() => refetch()} className="mt-2 text-sm underline">पुनः प्रयास करें</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const colorClasses = {
                blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
              };
              return (
                <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    {stat.change !== '—' && (
                      <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.up ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white">साप्ताहिक गतिविधि</h2>
                <span className="text-xs text-gray-400">पिछले 7 दिन</span>
              </div>
              <BarChart data={weeklyChart} />
              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2 bg-red-500 rounded-sm inline-block" />
                  दैनिक दृश्य (प्रकाशित लेख)
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">त्वरित क्रियाएं</h2>
              <div className="space-y-2">
                {[
                  { label: 'नया लेख लिखें', href: '/admin/articles/new', icon: FiEdit, color: 'red' },
                  { label: 'रिपोर्टर प्रबंधित करें', href: '/admin/reporters', icon: FiUsers, color: 'blue' },
                  { label: 'विश्लेषण देखें', href: '/admin/analytics', icon: FiBarChart2, color: 'purple' },
                  { label: 'उपयोगकर्ता प्रबंधित करें', href: '/admin/users', icon: FiUsers, color: 'green' },
                  { label: 'वेबसाइट देखें', href: '/', icon: FiEye, color: 'gray' },
                ].map((action) => {
                  const colors = {
                    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
                    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                    gray: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                  };
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg ${colors[action.color]}`}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">हालिया लेख</h2>
              <Link href="/admin/articles" className="text-sm text-red-600 hover:underline">सभी देखें</Link>
            </div>
            <div className="overflow-x-auto">
              {recentArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">कोई लेख नहीं</p>
                  <Link href="/admin/articles/new" className="text-sm text-red-600 hover:underline">पहला लेख बनाएं →</Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-5 py-3 font-medium">लेख</th>
                      <th className="text-left px-5 py-3 font-medium hidden md:table-cell">रिपोर्टर</th>
                      <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">श्रेणी</th>
                      <th className="text-left px-5 py-3 font-medium">स्थिति</th>
                      <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">दृश्य</th>
                      <th className="text-left px-5 py-3 font-medium hidden xl:table-cell">तारीख</th>
                      <th className="text-left px-5 py-3 font-medium">क्रियाएं</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {recentArticles.map((article) => (
                      <tr key={article._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                              {article.coverImage ? (
                                <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">📰</div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                              {article.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{getArticleBylineName(article) || '—'}</span>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                            {article.category?.name || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[article.status] || STATUS_COLORS.draft}`}>
                            {STATUS_HINDI[article.status] || article.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(article.views || 0)}</span>
                        </td>
                        <td className="px-5 py-3 hidden xl:table-cell">
                          <span className="text-xs text-gray-400">{timeAgo(article.publishedAt || article.createdAt)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/articles/new?edit=${article.slug || article._id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <FiEdit className="w-3.5 h-3.5" />
                            </Link>
                            {article.status === 'published' && article.slug && (
                              <Link
                                href={`/news/${article.slug}`}
                                target="_blank"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
