'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiChevronLeft, FiAlertCircle } from 'react-icons/fi';
import { BREAKING_NEWS } from '@/utils/sampleData';

export default function BreakingNewsTicker({ news = BREAKING_NEWS }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || news.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, news.length]);

  const prev = () => setCurrent((c) => (c - 1 + news.length) % news.length);
  const next = () => setCurrent((c) => (c + 1) % news.length);

  return (
    <div
      className="bg-red-600 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-9 gap-3">
          {/* Label */}
          <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-md flex-shrink-0">
            <FiAlertCircle className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase">ब्रेकिंग</span>
          </div>

          {/* Ticker Content */}
          <div className="flex-1 overflow-hidden relative">
            <div className="flex items-center">
              <p className="text-sm font-medium truncate">
                {news[current]}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={prev} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Previous">
              <FiChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-white/70">
              {current + 1}/{news.length}
            </span>
            <button onClick={next} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Next">
              <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
