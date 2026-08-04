/** Recommended banner sizes for each ad placement */
export const AD_SLOTS = {
  header: {
    key: 'adSlotHeader',
    position: 'header',
    title: 'Header (होमपेज)',
    hint: 'हीरो सेक्शन के नीचे',
    size: '728 × 90 px',
    sizeLabel: 'Leaderboard',
    altSizes: '970×90, 320×50 (मोबाइल)',
    maxHint: 'अधिकतम चौड़ाई 1200px',
  },
  sidebar: {
    key: 'adSlotSidebar',
    position: 'sidebar',
    title: 'Sidebar',
    hint: 'होम और लेख साइडबार',
    size: '300 × 250 px',
    sizeLabel: 'Medium Rectangle',
    altSizes: '300×600, 160×600',
    maxHint: 'वर्ग/लंबवत बैनर बेहतर',
  },
  inArticle: {
    key: 'adSlotInArticle',
    position: 'inArticle',
    title: 'In-article',
    hint: 'कवर इमेज के बाद',
    size: '728 × 90 px',
    sizeLabel: 'In-article Banner',
    altSizes: '336×280, 300×250',
    maxHint: 'लेख चौड़ाई के अंदर',
  },
  afterArticle: {
    key: 'adSlotAfterArticle',
    position: 'afterArticle',
    title: 'After article',
    hint: 'लेख सामग्री के बाद',
    size: '728 × 90 px',
    sizeLabel: 'Footer Banner',
    altSizes: '300×250, 336×280',
    maxHint: 'लेख चौड़ाई के अंदर',
  },
};

export const AD_SLOT_LIST = Object.values(AD_SLOTS);

export const EMPTY_AD_SLOT = {
  adsenseSlot: '',
  imageUrl: '',
  linkUrl: '',
  alt: '',
};
