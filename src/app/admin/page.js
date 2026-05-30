'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FiFileText, FiUsers, FiEye, FiTrendingUp, FiPlus, FiEdit,
  FiArrowUp, FiArrowDown, FiCalendar, FiClock, FiActivity,
  FiBarChart2, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';
import { formatDate, timeAgo, formatNumber } from '@/utils/helpers';

const STATS = [
  { label: 'Total Articles', value: '1,284', change: '+12%', up: true, icon: FiFileText, color: 'blue' },
  { label: 'Total Users', value: '48,320', change: '+8.2%', up: true, icon: FiUsers, color: 'green' },
  { label: 'Total Views', value: '2.4M', change: '+24%', up: true, icon: FiEye, color: 'purple' },
  { label: 'Published Today', value: '18', change: '-3', up: false, icon: FiActivity, color: 'orange' },
];

const RECENT_ARTICLES = SAMPLE_ARTICLES.map((a, i) => ({
  ...a,
  status: i < 2 ? 'published' : i < 4 ? 'draft' : 'scheduled',
  author: { name: ['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'Alex Turner', 'Lisa Park', 'Tom Brown'][i] || 'Staff' },
  category: { name: ['World', 'Technology', 'Business', 'Science', 'Sports', 'Health'][i] || 'News' },
}));

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-red-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
            style={{ height: `${(bar.value / max) * 100}%` }}
            title={`${bar.label}: ${formatNumber(bar.value)}`}
          />
          <span className="text-xs text-gray-400 writing-mode-vertical">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const chartData = [
    { label: 'Mon', value: 4200 },
    { label: 'Tue', value: 6800 },
    { label: 'Wed', value: 5400 },
    { label: 'Thu', value: 8900 },
    { label: 'Fri', value: 7300 },
    { label: 'Sat', value: 3100 },
    { label: 'Sun', value: 2800 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {formatDate(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" /> New Article
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => {
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
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.up ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Weekly Traffic</h2>
            <select className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 rounded-lg px-2 py-1 focus:outline-none">
              <option>This Week</option>
              <option>Last Week</option>
              <option>Last Month</option>
            </select>
          </div>
          <BarChart data={chartData} />
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-500 rounded-sm inline-block"></span>Page Views</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Write New Article', href: '/admin/articles/new', icon: FiEdit, color: 'red' },
              { label: 'Manage Categories', href: '/admin/categories', icon: FiFileText, color: 'blue' },
              { label: 'View Analytics', href: '/admin/analytics', icon: FiBarChart2, color: 'purple' },
              { label: 'Manage Users', href: '/admin/users', icon: FiUsers, color: 'green' },
              { label: 'View Website', href: '/', icon: FiEye, color: 'gray' },
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

      {/* Recent Articles */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Articles</h2>
          <Link href="/admin/articles" className="text-sm text-red-600 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-5 py-3 font-medium">Article</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Author</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Views</th>
                <th className="text-left px-5 py-3 font-medium hidden xl:table-cell">Date</th>
                <th className="text-left px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {RECENT_ARTICLES.map((article, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={article.coverImage || `https://picsum.photos/seed/${i}/80/80`}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                        {article.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{article.author?.name}</span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                      {article.category?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[article.status] || STATUS_COLORS.draft}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(article.views)}</span>
                  </td>
                  <td className="px-5 py-3 hidden xl:table-cell">
                    <span className="text-xs text-gray-400">{timeAgo(article.publishedAt)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/articles/${i + 1}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <FiEdit className="w-3.5 h-3.5" />
                      </Link>
                      <Link href={`/news/${article.slug || 'sample-1'}`} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                        <FiEye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
