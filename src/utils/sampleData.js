// Sample data for development and demo purposes
export const SAMPLE_CATEGORIES = [
  { name: 'Politics', color: '#EF4444', icon: 'FiFlag', description: 'Political news and analysis' },
  { name: 'Technology', color: '#3B82F6', icon: 'FiCpu', description: 'Tech news and innovations' },
  { name: 'Business', color: '#10B981', icon: 'FiBriefcase', description: 'Business and finance news' },
  { name: 'Science', color: '#8B5CF6', icon: 'FiZap', description: 'Scientific discoveries' },
  { name: 'Sports', color: '#F59E0B', icon: 'FiActivity', description: 'Sports and athletics' },
  { name: 'Entertainment', color: '#EC4899', icon: 'FiStar', description: 'Entertainment and pop culture' },
  { name: 'Health', color: '#06B6D4', icon: 'FiHeart', description: 'Health and wellness' },
  { name: 'World', color: '#6366F1', icon: 'FiGlobe', description: 'International news' },
];

export const BREAKING_NEWS = [
  'Breaking: Major climate summit reaches historic agreement on carbon emissions',
  'Stock markets hit record highs amid strong economic data',
  'Scientists discover potential breakthrough in cancer treatment',
  'World leaders gather for emergency UN Security Council meeting',
  'Tech giant announces revolutionary AI-powered smartphone',
];

export const SAMPLE_ARTICLES = [
  {
    title: 'Global Leaders Reach Historic Climate Agreement at COP30 Summit',
    excerpt: 'World leaders from 195 countries have signed a landmark climate accord pledging net-zero emissions by 2040.',
    coverImage: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800',
    readingTime: 5,
    views: 12450,
    publishedAt: new Date(Date.now() - 1000 * 60 * 30),
    isBreaking: true,
    isFeatured: true,
  },
  {
    title: 'Apple Unveils Revolutionary AI-Powered MacBook with 72-Hour Battery Life',
    excerpt: 'The new MacBook features a custom neural processing unit delivering unprecedented performance.',
    coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    readingTime: 3,
    views: 8920,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isTrending: true,
  },
  {
    title: 'Federal Reserve Signals Rate Cuts as Inflation Hits 2-Year Low',
    excerpt: 'The Fed chair indicated potential rate reductions in upcoming meetings as economic indicators improve.',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    readingTime: 4,
    views: 6750,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    title: 'Scientists Discover Earth-Like Planet in Habitable Zone Just 12 Light-Years Away',
    excerpt: 'Astronomers using the James Webb Telescope have identified a planet with strong biosignatures.',
    coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    readingTime: 6,
    views: 15320,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isFeatured: true,
  },
  {
    title: 'Champions League Final: Real Madrid vs Manchester City Preview',
    excerpt: 'Both teams are set for an epic showdown in the most anticipated football final in decades.',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    readingTime: 3,
    views: 9840,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    isTrending: true,
  },
  {
    title: 'New Study Shows Mediterranean Diet Reduces Heart Disease Risk by 30%',
    excerpt: 'A comprehensive 10-year study published in the New England Journal of Medicine confirms the benefits.',
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
    readingTime: 4,
    views: 5210,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
  },
];
