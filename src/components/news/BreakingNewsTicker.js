'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiChevronLeft, FiAlertCircle } from 'react-icons/fi';

export default function BreakingNewsTicker({ news = [] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || news.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, news.length]);

  if (!news.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + news.length) % news.length);
  const next = () => setCurrent((c) => (c + 1) % news.length);

  const item = news[current];
  const title = typeof item === 'string' ? item : item?.title;
  const href = typeof item === 'object' && item?.slug ? `/news/${item.slug}` : null;

  return (
    <div
      className="bg-red-600 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-9 gap-3">
          <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-md flex-shrink-0">
            <FiAlertCircle className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase">ब्रेकिंग</span>
          </div>

          <div className="flex-1 overflow-hidden">
            {href ? (
              <Link href={href} className="text-sm font-medium truncate block hover:underline">
                {title}
              </Link>
            ) : (
              <p className="text-sm font-medium truncate">{title}</p>
            )}
          </div>

          {news.length > 1 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={prev} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Previous">
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-white/70">{current + 1}/{news.length}</span>
              <button onClick={next} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Next">
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
