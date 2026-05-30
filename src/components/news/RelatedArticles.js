import Link from 'next/link';
import Image from 'next/image';
import { FiClock } from 'react-icons/fi';
import { timeAgo } from '@/utils/helpers';

export default function RelatedArticles({ articles = [], currentSlug }) {
  const related = articles.filter((a) => a.slug !== currentSlug).slice(0, 4);

  if (!related.length) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-red-600 rounded-full" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">संबंधित लेख</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map((article, i) => (
          <Link
            key={article._id || article.slug || i}
            href={`/news/${article.slug}`}
            className="group flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all"
          >
            <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.title || ''}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
                {article.title}
              </h4>
              <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <FiClock className="w-3 h-3" />
                {timeAgo(article.publishedAt)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
