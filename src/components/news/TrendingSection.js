import Link from 'next/link';
import Image from 'next/image';
import { FiTrendingUp, FiClock, FiEye } from 'react-icons/fi';
import { timeAgo, formatNumber } from '@/utils/helpers';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

export default function TrendingSection({ articles = SAMPLE_ARTICLES }) {
  const trending = articles.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <FiTrendingUp className="w-5 h-5 text-red-600" />
        <h3 className="font-bold text-gray-900 dark:text-white">ट्रेंडिंग खबरें</h3>
        <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">लाइव</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {trending.map((article, i) => (
          <Link
            key={article.slug || i}
            href={`/news/${article.slug || 'sample'}`}
            className="flex items-start gap-3 p-4 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-xl font-black text-gray-200 dark:text-gray-700 group-hover:text-red-300 transition-colors flex-shrink-0 leading-none mt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {timeAgo(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FiEye className="w-3 h-3" />
                  {formatNumber(article.views || 0)}
                </span>
              </div>
            </div>
            <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={article.coverImage || `https://picsum.photos/seed/${i + 20}/100/80`}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
