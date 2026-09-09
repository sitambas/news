'use client';

import AdBannerImage from '@/components/ads/AdBannerImage';

/**
 * Shows all ad carousel banners as stacked sidebar cards (no rotation).
 * Mobile uses the same readable banner treatment as top/mid slots.
 */
export default function AdSidebarCards({ ads, className = '' }) {
  const items = (ads?.adCarousel || []).filter((b) => b?.imageUrl);
  if (!ads?.adsEnabled || !items.length) return null;

  return (
    <div className={`space-y-4 ${className}`} data-ad="sidebar-cards">
      <div className="text-[10px] uppercase tracking-wide text-gray-400 text-center">
        विज्ञापन
      </div>
      {items.map((item, i) => (
        <div
          key={`${item.imageUrl}-${i}`}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 overflow-hidden"
        >
          <AdBannerImage
            src={item.imageUrl}
            alt={item.alt || `विज्ञापन ${i + 1}`}
            linkUrl={item.linkUrl}
            loading={i < 3 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </div>
  );
}
