'use client';

import AdUnit from '@/components/ads/AdUnit';

const SLOT_KEYS = {
  header: 'adSlotHeader',
  sidebar: 'adSlotSidebar',
  inArticle: 'adSlotInArticle',
  afterArticle: 'adSlotAfterArticle',
};

/**
 * Client ad placement using ads config from site settings.
 * Empty slots show "Ads banner place here" placeholders.
 */
export default function AdSlot({ position, ads, className = '', format = 'auto' }) {
  if (!ads?.adsEnabled) return null;
  const key = SLOT_KEYS[position];
  if (!key) return null;

  return (
    <AdUnit
      enabled={ads.adsEnabled}
      clientId={ads.adsenseClientId}
      slot={ads[key] || {}}
      className={className}
      format={format}
      position={position}
      showPlaceholder
    />
  );
}
