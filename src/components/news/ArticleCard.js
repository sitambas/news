'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiEye, FiBookmark, FiHeart, FiShare2 } from 'react-icons/fi';
import { timeAgo, formatNumber, truncateText } from '@/utils/helpers';
import { motion } from 'framer-motion';

export default function ArticleCard({ article, variant = 'default', priority = false }) {
  if (!article) return null;

  const categoryStyle = article.category?.color
    ? { backgroundColor: article.category.color + '20', color: article.category.color }
    : {};

  if (variant === 'featured') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group rounded-2xl overflow-hidden bg-gray-900 aspect-[16/9] md:aspect-[21/9]"
      >
        <Link href={`/news/${article.slug}`}>
          <div className="absolute inset-0">
            <Image
              src={article.coverImage || `https://picsum.photos/seed/${article.slug}/1200/630`}
              alt={article.coverImageAlt || article.title}
              fill
              priority={priority}
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {article.isBreaking && (
              <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded mb-2 animate-pulse">
                BREAKING
              </span>
            )}
            {article.category && (
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded mb-2 ml-1 backdrop-blur-sm">
                {article.category.name}
              </span>
            )}
            <h2 className="text-white text-xl md:text-2xl font-bold leading-tight line-clamp-2 mb-2">
              {article.title}
            </h2>
            <p className="text-gray-300 text-sm line-clamp-2 mb-3 hidden md:block">
              {truncateText(article.excerpt, 120)}
            </p>
            <div className="flex items-center gap-4 text-white/70 text-xs">
              {article.author && <span className="font-medium text-white/90">{article.author.name}</span>}
              <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {article.readingTime} min read</span>
              <span className="flex items-center gap-1"><FiEye className="w-3 h-3" /> {formatNumber(article.views)}</span>
              <span>{timeAgo(article.publishedAt)}</span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="group flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all"
      >
        <Link href={`/news/${article.slug}`} className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={article.coverImage || `https://picsum.photos/seed/${article.slug}/200/150`}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-xs font-semibold" style={categoryStyle}>
              {article.category.name}
            </span>
          )}
          <Link href={`/news/${article.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 mt-0.5 transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <FiClock className="w-3 h-3" />
            <span>{timeAgo(article.publishedAt)}</span>
            <span>·</span>
            <span>{article.readingTime} min</span>
          </div>
        </div>
      </motion.article>
    );
  }

  // Default card
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300"
    >
      <Link href={`/news/${article.slug}`} className="block relative overflow-hidden aspect-[16/9]">
        <Image
          src={article.coverImage || `https://picsum.photos/seed/${article.slug}/600/400`}
          alt={article.coverImageAlt || article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {article.isBreaking && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
            BREAKING
          </span>
        )}
        {article.isTrending && !article.isBreaking && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            TRENDING
          </span>
        )}
      </Link>
      <div className="p-4">
        {article.category && (
          <Link href={`/category/${article.category.slug}`}>
            <span className="text-xs font-bold uppercase tracking-wider" style={categoryStyle}>
              {article.category.name}
            </span>
          </Link>
        )}
        <Link href={`/news/${article.slug}`}>
          <h3 className="mt-1 text-base font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {truncateText(article.excerpt, 100)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {article.author?.avatar ? (
              <img src={article.author.avatar} alt={article.author.name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-xs font-bold">
                {article.author?.name?.[0] || 'A'}
              </div>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{article.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {article.readingTime}m</span>
            <span className="flex items-center gap-1"><FiEye className="w-3 h-3" /> {formatNumber(article.views)}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>{timeAgo(article.publishedAt)}</span>
          <div className="flex items-center gap-2">
            <button className="hover:text-red-600 transition-colors" aria-label="Bookmark">
              <FiBookmark className="w-3.5 h-3.5" />
            </button>
            <button className="hover:text-red-600 transition-colors" aria-label="Like">
              <FiHeart className="w-3.5 h-3.5" />
            </button>
            <button className="hover:text-red-600 transition-colors" aria-label="Share">
              <FiShare2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
