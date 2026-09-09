'use client';

import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Auto-rotating banner carousel for multiple greeting/promo ads.
 */
export default function AdCarousel({
  ads,
  intervalMs = 5000,
  className = '',
  aspectClass = 'aspect-[16/7] sm:aspect-[16/6]',
}) {
  const items = (ads?.adCarousel || []).filter((b) => b?.imageUrl);
  const enabled = ads?.adsEnabled && items.length > 0;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || items.length < 2) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, items.length, intervalMs]);

  if (!enabled) return null;

  const current = items[Math.min(index, items.length - 1)];
  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % items.length);

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current.imageUrl}
      alt={current.alt || 'विज्ञापन'}
      className="w-full h-full object-contain"
      loading={index === 0 ? 'eager' : 'lazy'}
    />
  );

  return (
    <div className={`ad-carousel relative ${className}`} data-ad="carousel">
      <div className="text-[10px] uppercase tracking-wide text-gray-400 text-center mb-1">
        विज्ञापन
      </div>
      <div className={`relative ${aspectClass} rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800`}>
        {current.linkUrl ? (
          <a
            href={current.linkUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="absolute inset-0 flex items-center justify-center p-1"
          >
            {img}
          </a>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-1">{img}</div>
        )}

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
              aria-label="Previous ad"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
              aria-label="Next ad"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === index ? 'bg-red-600' : 'bg-white/70'
                  }`}
                  aria-label={`Ad ${i + 1}`}
                />
              ))}
            </div>
            <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/55 text-white">
              {index + 1}/{items.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
