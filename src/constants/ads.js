/** Recommended banner sizes for each ad placement */
export const AD_SLOTS = {
  header: {
    key: 'adSlotHeader',
    position: 'header',
    title: 'Top strip (ब्रेकिंग के नीचे)',
    hint: 'ब्रेकिंग न्यूज़ बार और हीरो के बीच — चौड़ी जगह',
    size: '1200 × 400 या 728 × 90',
    sizeLabel: 'Desktop',
    altSizes: '1200×400, 970×250, 728×90',
    maxHint: 'डेस्कटॉप बैनर',
    supportsMobile: true,
    mobileSize: '320 × 100 या 300 × 250',
    mobileHint: 'मोबाइल के लिए अलग इमेज (अनुशंसित)',
  },
  sidebar: {
    key: 'adSlotSidebar',
    position: 'sidebar',
    title: 'Sidebar',
    hint: 'दायाँ कॉलम — वर्गाकार/छोटे बैनर',
    size: '300 × 250 px',
    sizeLabel: 'Medium Rectangle',
    altSizes: '300×600, 160×600',
    maxHint: 'चौड़े शुभकामना बैनर यहाँ टेक्स्ट छोटे दिखेंगे',
    supportsMobile: false,
  },
  latest: {
    key: 'adSlotLatest',
    position: 'latest',
    title: 'ताज़ा खबरें (मध्य)',
    hint: 'ताज़ा खबरें सूची के बीच में',
    size: '728 × 90 px',
    sizeLabel: 'Desktop',
    altSizes: '970×90, 728×90',
    maxHint: '2–4 लेखों के बाद',
    supportsMobile: true,
    mobileSize: '320 × 100 या 300 × 250',
    mobileHint: 'मोबाइल फीड के लिए अलग इमेज',
  },
  homeMid: {
    key: 'adSlotHomeMid',
    position: 'homeMid',
    title: 'होम मध्य (श्रेणियों से पहले)',
    hint: 'ताज़ा खबरें के बाद, श्रेणी सेक्शन से पहले',
    size: '1200 × 400 px',
    sizeLabel: 'Wide Banner',
    altSizes: '970×250, 728×90',
    maxHint: 'शुभकामना / प्रचार बैनर',
    supportsMobile: true,
    mobileSize: '320 × 100 या 300 × 250',
    mobileHint: 'मोबाइल के लिए अलग इमेज (अनुशंसित)',
  },
  betweenCategories: {
    key: 'adSlotBetweenCategories',
    position: 'betweenCategories',
    title: 'श्रेणियों के बीच',
    hint: 'होमपेज पर दो श्रेणी ब्लॉकों के बीच',
    size: '728 × 90 px',
    sizeLabel: 'Desktop',
    altSizes: '970×90, 728×90',
    maxHint: 'फीड में ब्रेक',
    supportsMobile: true,
    mobileSize: '320 × 100 या 300 × 250',
    mobileHint: 'मोबाइल फीड के लिए अलग इमेज',
  },
  inArticle: {
    key: 'adSlotInArticle',
    position: 'inArticle',
    title: 'In-article',
    hint: 'लेख कवर इमेज के बाद',
    size: '728 × 90 px',
    sizeLabel: 'Desktop',
    altSizes: '336×280, 300×250',
    maxHint: 'लेख चौड़ाई के अंदर',
    supportsMobile: true,
    mobileSize: '300 × 250 या 320 × 100',
    mobileHint: 'मोबाइल लेख के लिए अलग इमेज',
  },
  afterArticle: {
    key: 'adSlotAfterArticle',
    position: 'afterArticle',
    title: 'After article',
    hint: 'लेख सामग्री के बाद',
    size: '728 × 90 px',
    sizeLabel: 'Desktop',
    altSizes: '300×250, 336×280',
    maxHint: 'लेख चौड़ाई के अंदर',
    supportsMobile: true,
    mobileSize: '300 × 250 या 320 × 100',
    mobileHint: 'मोबाइल लेख के लिए अलग इमेज',
  },
  footer: {
    key: 'adSlotFooter',
    position: 'footer',
    title: 'Footer (साइट नीचे)',
    hint: 'फ़ुटर न्यूज़लेटर से ठीक ऊपर — सभी पेज',
    size: '1200 × 200 px',
    sizeLabel: 'Footer Strip',
    altSizes: '970×90, 728×90',
    maxHint: 'चौड़ा बैनर',
    supportsMobile: false,
  },
};

export const AD_SLOT_LIST = Object.values(AD_SLOTS);

export const EMPTY_AD_SLOT = {
  adsenseSlot: '',
  imageUrl: '',
  mobileImageUrl: '',
  linkUrl: '',
  alt: '',
};

export const EMPTY_CAROUSEL_ITEM = {
  imageUrl: '',
  linkUrl: '',
  alt: '',
};

export const EMPTY_NATIVE_AD = {
  imageUrl: '',
  linkUrl: '',
  title: '',
  excerpt: '',
  sponsor: '',
  afterArticle: 1,
  placement: 'latest',
};

export const NATIVE_AD_PLACEMENTS = [
  { value: 'latest', label: 'ताज़ा खबरें (होम)' },
  { value: 'category', label: 'श्रेणी पेज' },
  { value: 'both', label: 'दोनों जगह' },
];

/** Placement guide for wide Independence Day / greeting banners */
export const AD_PLACEMENT_TIPS = [
  {
    place: 'मोबाइल अलग इमेज',
    where: 'Top strip / ताज़ा / श्रेणियों के बीच / In-article / After article',
    best: '320×100 या 300×250 — डेस्कटॉप 728×90 के साथ अलग अपलोड करें',
  },
  {
    place: 'न्यूज़ जैसा नेटिव विज्ञापन',
    where: 'ताज़ा खबरें फीड में लेख कार्ड जैसा',
    best: 'इमेज + शीर्षक + छोटा विवरण — “प्रायोजित” लेबल दिखेगा',
  },
  {
    place: 'साइडबार कार्ड्स (कई बैनर)',
    where: 'दायाँ कॉलम — हर बैनर अलग कार्ड',
    best: 'आपकी 15 अगस्त जैसी सभी इमेजें यहाँ एक साथ',
  },
  {
    place: 'Header / होम मध्य / Footer',
    where: 'चौड़े स्लॉट',
    best: '1200×400 या 1013×675 लैंडस्केप',
  },
];
