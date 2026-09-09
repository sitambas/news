'use client';

import AdBannerImage from '@/components/ads/AdBannerImage';

/**
 * Full-width top strip banner (between breaking news and hero).
 * Supports separate desktop + mobile creatives on the header slot.
 */
export default function AdTopStrip({ ads, className = '' }) {
  if (!ads?.adsEnabled) return null;

  const header = ads.adSlotHeader || {};
  const hasHeader = Boolean(header.imageUrl || header.mobileImageUrl);
  const carousel = (ads.adCarousel || []).filter((b) => b?.imageUrl);

  if (hasHeader) {
    return (
      <div className={`w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-400 text-center mb-1">विज्ञापन</div>
          <AdBannerImage
            src={header.imageUrl}
            mobileSrc={header.mobileImageUrl}
            alt={header.alt}
            linkUrl={header.linkUrl}
            loading="eager"
          />
        </div>
      </div>
    );
  }

  if (carousel.length > 0) {
    const item = carousel[0];
    return (
      <div className={`w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-400 text-center mb-1">विज्ञापन</div>
          <AdBannerImage
            src={item.imageUrl}
            alt={item.alt}
            linkUrl={item.linkUrl}
            loading="eager"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="w-full min-h-[90px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center gap-1 px-4 py-4">
          <span className="text-[10px] uppercase tracking-wide text-gray-400">विज्ञापन</span>
          <p className="text-sm font-semibold text-gray-500">Ads banner place here</p>
          <p className="text-[11px] text-gray-400">Desktop 728×90 · Mobile 320×100 · Admin → विज्ञापन</p>
        </div>
      </div>
    </div>
  );
}
