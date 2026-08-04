export function pickAdsConfig(settings) {
  if (!settings) return null;
  return {
    adsEnabled: settings.adsEnabled === true,
    adsenseClientId: settings.adsenseClientId || '',
    adSlotHeader: settings.adSlotHeader || {},
    adSlotSidebar: settings.adSlotSidebar || {},
    adSlotInArticle: settings.adSlotInArticle || {},
    adSlotAfterArticle: settings.adSlotAfterArticle || {},
  };
}
