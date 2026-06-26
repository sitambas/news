'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  FiTrendingUp, FiEye, FiUsers, FiFileText, FiArrowUp, FiArrowDown,
  FiRefreshCw, FiTag,
} from 'react-icons/fi';
import { formatNumber } from '@/utils/helpers';
import { getArticleBylineName } from '@/utils/reporter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

async function fetchAnalytics() {
  const res = await fetch('/api/admin/analytics');
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load analytics');
  return data.data;
}

const BAR_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500'];

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: fetchAnalytics,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16 text-red-500">
        विश्लेषण लोड करने में विफल
        <button onClick={() => refetch()} className="block mx-auto mt-3 text-sm text-gray-500 hover:text-red-600">
          पुनः प्रयास करें
        </button>
      </div>
    );
  }

  const { stats, monthlyChart, topArticles, categoryBreakdown } = data;
  const maxMonthlyViews = Math.max(...monthlyChart.map((m) => m.views), 1);

  const kpis = [
    {
      label: 'कुल पृष्ठ दृश्य',
      value: formatNumber(stats.totalViews),
      change: '—',
      up: true,
      icon: FiEye,
      color: 'blue',
    },
    {
      label: 'पंजीकृत उपयोगकर्ता',
      value: formatNumber(stats.totalUsers),
      change: stats.usersChange.text,
      up: stats.usersChange.up,
      icon: FiUsers,
      color: 'green',
    },
    {
      label: 'प्रकाशित लेख',
      value: formatNumber(stats.publishedCount),
      change: stats.publishedChange.text,
      up: stats.publishedChange.up,
      icon: FiFileText,
      color: 'purple',
    },
    {
      label: 'औसत पढ़ने का समय',
      value: stats.avgReadingTime,
      change: '—',
      up: true,
      icon: FiTrendingUp,
      color: 'orange',
    },
  ];

  const bgColors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">विश्लेषण</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">वास्तविक डेटाबेस से आँकड़े</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${bgColors[kpi.color]}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              {kpi.change !== '—' && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.up ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Views Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">मासिक दृश्य ({stats.year})</h2>
          {stats.yearViewsTotal > 0 ? (
            <>
              <div className="flex items-end gap-1 h-40">
                {monthlyChart.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      className="w-full bg-red-500 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer min-h-[4px]"
                      style={{ height: `${Math.max((m.views / maxMonthlyViews) * 100, m.views > 0 ? 8 : 0)}%` }}
                      title={`${m.month}: ${formatNumber(m.views)} दृश्य, ${m.articles} लेख`}
                    />
                    <span className="text-xs text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                कुल {stats.year}: <span className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(stats.yearViewsTotal)}
                </span> दृश्य
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">
              इस वर्ष अभी कोई प्रकाशित लेख नहीं
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiTag className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">श्रेणी अनुसार दृश्य</h2>
          </div>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => (
                <div key={cat.slug || cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      {cat.icon} {cat.name}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cat.percent}% · {formatNumber(cat.views)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">कोई प्रकाशित लेख नहीं</div>
          )}
        </div>
      </div>

      {/* Top Articles */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">शीर्ष लेख</h2>
        {topArticles.length > 0 ? (
          <div className="space-y-3">
            {topArticles.map((article, i) => (
              <div key={article._id} className="flex items-center gap-3">
                <span className="text-2xl font-black text-gray-200 dark:text-gray-700 w-8 flex-shrink-0 text-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/articles/new?edit=${article.slug}`}
                    className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 hover:text-red-600"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                    <span>{formatNumber(article.views)} दृश्य</span>
                    <span>·</span>
                    <span>{article.readingTime} मिनट</span>
                    {article.category?.name && (
                      <>
                        <span>·</span>
                        <span>{article.category.name}</span>
                      </>
                    )}
                    {getArticleBylineName(article) && (
                      <>
                        <span>·</span>
                        <span>{getArticleBylineName(article)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">कोई प्रकाशित लेख नहीं</div>
        )}
      </div>
    </div>
  );
}
