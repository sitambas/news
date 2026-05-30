'use client';

import { FiTrendingUp, FiEye, FiUsers, FiFileText, FiArrowUp, FiArrowDown, FiGlobe } from 'react-icons/fi';
import { formatNumber } from '@/utils/helpers';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

const MONTHLY_VIEWS = [
  { month: 'Jan', views: 180000 }, { month: 'Feb', views: 210000 }, { month: 'Mar', views: 195000 },
  { month: 'Apr', views: 280000 }, { month: 'May', views: 320000 }, { month: 'Jun', views: 290000 },
  { month: 'Jul', views: 350000 }, { month: 'Aug', views: 380000 }, { month: 'Sep', views: 410000 },
  { month: 'Oct', views: 390000 }, { month: 'Nov', views: 430000 }, { month: 'Dec', views: 480000 },
];

const TOP_COUNTRIES = [
  { country: 'United States', flag: '🇺🇸', views: 840000, percent: 35 },
  { country: 'United Kingdom', flag: '🇬🇧', views: 480000, percent: 20 },
  { country: 'India', flag: '🇮🇳', views: 360000, percent: 15 },
  { country: 'Canada', flag: '🇨🇦', views: 240000, percent: 10 },
  { country: 'Australia', flag: '🇦🇺', views: 168000, percent: 7 },
];

const TRAFFIC_SOURCES = [
  { source: 'Organic Search', percent: 45, color: 'bg-green-500' },
  { source: 'Social Media', percent: 28, color: 'bg-blue-500' },
  { source: 'Direct', percent: 15, color: 'bg-purple-500' },
  { source: 'Referral', percent: 8, color: 'bg-orange-500' },
  { source: 'Email', percent: 4, color: 'bg-red-500' },
];

export default function AnalyticsPage() {
  const maxViews = Math.max(...MONTHLY_VIEWS.map((m) => m.views));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Page Views', value: '2.4M', change: '+24.3%', up: true, icon: FiEye, color: 'blue' },
          { label: 'Unique Visitors', value: '840K', change: '+18.7%', up: true, icon: FiUsers, color: 'green' },
          { label: 'Articles Published', value: '1,284', change: '+12.1%', up: true, icon: FiFileText, color: 'purple' },
          { label: 'Avg. Time on Page', value: '3m 42s', change: '-0:12', up: false, icon: FiTrendingUp, color: 'orange' },
        ].map((kpi) => {
          const bgColors = { blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', green: 'bg-green-50 dark:bg-green-900/20 text-green-600', purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600', orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' };
          return (
            <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${bgColors[kpi.color]}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.up ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Views Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Monthly Page Views</h2>
          <div className="flex items-end gap-1 h-40">
            {MONTHLY_VIEWS.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-red-500 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ height: `${(m.views / maxViews) * 100}%` }}
                  title={`${m.month}: ${formatNumber(m.views)}`}
                />
                <span className="text-xs text-gray-400">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
            Total 2025: <span className="font-semibold text-gray-900 dark:text-white">
              {formatNumber(MONTHLY_VIEWS.reduce((s, m) => s + m.views, 0))}
            </span> views
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Traffic Sources</h2>
          <div className="space-y-3">
            {TRAFFIC_SOURCES.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{source.source}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{source.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className={`h-2 rounded-full ${source.color}`} style={{ width: `${source.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiGlobe className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Top Countries</h2>
          </div>
          <div className="space-y-3">
            {TOP_COUNTRIES.map((country, i) => (
              <div key={country.country} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{country.flag}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{country.country}</span>
                    <span className="text-gray-500 dark:text-gray-400">{formatNumber(country.views)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-red-500 opacity-80" style={{ width: `${country.percent}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top Articles</h2>
          <div className="space-y-3">
            {SAMPLE_ARTICLES.slice(0, 5).map((article, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl font-black text-gray-200 dark:text-gray-700 w-8 flex-shrink-0 text-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{article.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>{formatNumber(article.views)} views</span>
                    <span>·</span>
                    <span>{article.readingTime} min read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
