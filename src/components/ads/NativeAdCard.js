'use client';

import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';

/**
 * Native ad card — same layout as ArticleCard so it blends into the news feed.
 * Clearly labeled "प्रायोजित" / sponsor name.
 */
export default function NativeAdCard({ ad, variant = 'default' }) {
  if (!ad?.imageUrl || !ad?.title) return null;

  const href = (ad.linkUrl || '#').trim() || '#';
  const sponsor = (ad.sponsor || 'प्रायोजित').trim();
  const excerpt = (ad.excerpt || '').trim();

  const media = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ad.imageUrl}
      alt={ad.title}
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
    />
  );

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="group flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all"
        data-ad="native"
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
        >
          {media}
        </a>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            {sponsor}
          </span>
          <a href={href} target="_blank" rel="noopener noreferrer sponsored">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 mt-0.5 transition-colors">
              {ad.title}
            </h3>
          </a>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <FiExternalLink className="w-3 h-3" />
            <span>विज्ञापन</span>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300"
      data-ad="native"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block relative overflow-hidden aspect-[16/9] bg-gray-100 dark:bg-gray-800"
      >
        {media}
        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
          प्रायोजित
        </span>
      </a>
      <div className="p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          {sponsor}
        </span>
        <a href={href} target="_blank" rel="noopener noreferrer sponsored">
          <h3 className="mt-1 text-base font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
            {ad.title}
          </h3>
        </a>
        {excerpt ? (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{excerpt}</p>
        ) : null}
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span className="inline-flex items-center gap-1">
            <FiExternalLink className="w-3.5 h-3.5" />
            विज्ञापन
          </span>
          <span className="text-amber-600/80 dark:text-amber-400/80 font-medium">और जानें →</span>
        </div>
      </div>
    </motion.article>
  );
}
