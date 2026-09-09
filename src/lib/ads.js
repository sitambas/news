/**
 * Pick ads config for public pages.
 * Honours adsExpiresAt — after that time, adsEnabled is forced off.
 */
export function pickAdsConfig(settings) {
  if (!settings) return null;

  const expired = isAdsCampaignExpired(settings.adsExpiresAt);
  const enabled = settings.adsEnabled === true && !expired;

  return {
    adsEnabled: enabled,
    adsExpired: expired,
    adsExpiresAt: settings.adsExpiresAt || null,
    adsenseClientId: settings.adsenseClientId || '',
    adSlotHeader: settings.adSlotHeader || {},
    adSlotSidebar: settings.adSlotSidebar || {},
    adSlotLatest: settings.adSlotLatest || {},
    adSlotHomeMid: settings.adSlotHomeMid || {},
    adSlotBetweenCategories: settings.adSlotBetweenCategories || {},
    adSlotInArticle: settings.adSlotInArticle || {},
    adSlotAfterArticle: settings.adSlotAfterArticle || {},
    adSlotFooter: settings.adSlotFooter || {},
    adCarousel: Array.isArray(settings.adCarousel) ? settings.adCarousel : [],
    adNative: Array.isArray(settings.adNative) ? settings.adNative : [],
  };
}

/**
 * Native ads to render after a given article in a feed section.
 * @param {object|null} ads - pickAdsConfig result
 * @param {number} articleIndex - 0-based index of the article just rendered
 * @param {'latest'|'category'} section
 */
export function getNativeAdsAfterIndex(ads, articleIndex, section = 'latest') {
  if (!ads?.adsEnabled || !Array.isArray(ads.adNative)) return [];
  const after = articleIndex + 1;
  return ads.adNative.filter((item) => {
    if (!item?.imageUrl || !item?.title) return false;
    const place = item.placement || 'latest';
    if (place !== 'both' && place !== section) return false;
    const pos = Number(item.afterArticle);
    const resolved = Number.isFinite(pos) && pos >= 1 ? pos : 1;
    return resolved === after;
  });
}

/** True when now is after adsExpiresAt (YYYY-MM-DD = end of that day IST). */
export function isAdsCampaignExpired(adsExpiresAt) {
  const end = normalizeAdsExpiresAt(adsExpiresAt);
  if (!end) return false;
  return Date.now() > end.getTime();
}

/**
 * Store admin date (YYYY-MM-DD) as end of that day in Asia/Kolkata.
 * Empty / null clears expiry.
 */
export function normalizeAdsExpiresAt(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const s = String(value).trim();
  const day = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (day) {
    return new Date(`${day[1]}-${day[2]}-${day[3]}T23:59:59.999+05:30`);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** YYYY-MM-DD for <input type="date"> in IST calendar day of expiry. */
export function formatAdsExpiresDateInput(adsExpiresAt) {
  if (!adsExpiresAt) return '';
  const d = adsExpiresAt instanceof Date ? adsExpiresAt : new Date(adsExpiresAt);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}
