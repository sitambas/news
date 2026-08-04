'use client';

import { useEffect, useRef } from 'react';
import { AD_SLOTS } from '@/constants/ads';

const PLACEHOLDER_SIZES = {
  header: 'min-h-[90px] sm:min-h-[100px]',
  sidebar: 'min-h-[250px]',
  inArticle: 'min-h-[120px] sm:min-h-[140px]',
  afterArticle: 'min-h-[120px] sm:min-h-[140px]',
  default: 'min-h-[100px]',
};

function AdPlaceholder({ position = 'default', label = 'विज्ञापन' }) {
  const sizeClass = PLACEHOLDER_SIZES[position] || PLACEHOLDER_SIZES.default;
  const meta = AD_SLOTS[position];
  const sizeText = meta?.size || '';
  return (
    <div
      className={`ad-unit-placeholder relative flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-900 ${sizeClass} px-4 py-6 select-none`}
      data-ad="placeholder"
      aria-label="Advertisement placeholder"
    >
      <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
        {label}
      </span>
      {sizeText && (
        <span className="absolute top-2 right-2 text-[10px] font-mono text-gray-400 bg-white/80 dark:bg-gray-900/80 px-1.5 py-0.5 rounded">
          {sizeText}
        </span>
      )}
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-lg font-bold">
        Ad
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">
        Ads banner place here
      </p>
      <p className="text-[11px] text-gray-400 text-center">
        {sizeText ? `अनुशंसित: ${sizeText}` : 'विज्ञापन स्थान'}
        {' · '}
        Admin → विज्ञापन
      </p>
    </div>
  );
}

/**
 * Renders a custom banner, Google AdSense unit, or placeholder for one slot.
 */
export default function AdUnit({
  enabled = false,
  clientId = '',
  slot = {},
  className = '',
  label = 'विज्ञापन',
  format = 'auto',
  fullWidthResponsive = true,
  position = 'default',
  showPlaceholder = true,
}) {
  const pushed = useRef(false);
  const adsenseSlot = (slot?.adsenseSlot || '').trim();
  const imageUrl = (slot?.imageUrl || '').trim();
  const linkUrl = (slot?.linkUrl || '').trim();
  const alt = (slot?.alt || label || 'Advertisement').trim();
  const pubId = (clientId || '').trim();

  const hasCustom = Boolean(imageUrl);
  const hasAdsense = Boolean(pubId && adsenseSlot && /^ca-pub-\d+$/i.test(pubId));

  useEffect(() => {
    if (!enabled || !hasAdsense || hasCustom || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense may block or fail offline — ignore
    }
  }, [enabled, hasAdsense, hasCustom, adsenseSlot]);

  if (!enabled) return null;

  if (!hasCustom && !hasAdsense) {
    if (!showPlaceholder) return null;
    return (
      <div className={`ad-unit ${className}`}>
        <AdPlaceholder position={position} label={label} />
      </div>
    );
  }

  if (hasCustom) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-auto max-h-[280px] object-contain mx-auto"
        loading="lazy"
      />
    );
    return (
      <div className={`ad-unit ad-unit-custom ${className}`} data-ad="custom">
        <div className="text-[10px] uppercase tracking-wide text-gray-400 text-center mb-1">
          {label}
        </div>
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  }

  return (
    <div className={`ad-unit ad-unit-adsense ${className}`} data-ad="adsense">
      <div className="text-[10px] uppercase tracking-wide text-gray-400 text-center mb-1">
        {label}
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={pubId}
        data-ad-slot={adsenseSlot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
