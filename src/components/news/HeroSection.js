'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { timeAgo, formatNumber, truncateText } from '@/utils/helpers';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection({ articles = SAMPLE_ARTICLES }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featured = articles.slice(0, 5);

  const next = () => setCurrentSlide((c) => (c + 1) % featured.length);
  const prev = () => setCurrentSlide((c) => (c - 1 + featured.length) % featured.length);

  if (!featured.length) return null;

  return (
    <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero Slider */}
          <div className="lg:col-span-2 relative">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={featured[currentSlide].coverImage || `https://picsum.photos/seed/${currentSlide}/800/500`}
                    alt={featured[currentSlide].title}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {featured[currentSlide].isBreaking && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">BREAKING</span>
                      )}
                      <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                        {featured[currentSlide].category?.name || 'Featured'}
                      </span>
                    </div>
                    <Link href={`/news/${featured[currentSlide].slug || 'sample-1'}`}>
                      <h1 className="text-white text-lg md:text-2xl font-bold line-clamp-2 hover:text-red-300 transition-colors">
                        {featured[currentSlide].title}
                      </h1>
                    </Link>
                    <p className="text-gray-300 text-sm mt-1 line-clamp-2 hidden md:block">
                      {truncateText(featured[currentSlide].excerpt, 130)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-white/70 text-xs">
                      {featured[currentSlide].author?.name && (
                        <span className="font-medium text-white/90">{featured[currentSlide].author.name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {featured[currentSlide].readingTime || 3} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FiEye className="w-3 h-3" />
                        {formatNumber(featured[currentSlide].views || 0)}
                      </span>
                      <span>{timeAgo(featured[currentSlide].publishedAt)}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Nav Buttons */}
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
                <FiChevronRight className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 right-6 flex gap-1.5">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`rounded-full transition-all ${i === currentSlide ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Side Articles */}
          <div className="flex flex-col gap-3">
            {featured.slice(0, 3).map((article, i) => (
              <Link
                key={article.slug || i}
                href={`/news/${article.slug || 'sample'}`}
                className={`group flex gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                  i === currentSlide
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={(e) => { e.preventDefault(); setCurrentSlide(i); }}
              >
                <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={article.coverImage || `https://picsum.photos/seed/${i + 10}/200/150`}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {article.category?.name || 'News'}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {timeAgo(article.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
            <Link href="/search?sort=trending" className="mt-auto bg-gray-900 dark:bg-gray-800 text-white rounded-xl p-4 text-center hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
              <div className="text-lg font-black">📈 Trending</div>
              <p className="text-gray-400 text-xs mt-1">See what's trending now</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
