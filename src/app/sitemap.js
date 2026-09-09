import connectDB from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://cgfile.in').replace(/\/$/, '');

export default async function sitemap() {
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/advertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/newsletter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/rss.xml`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.3 },
  ];

  try {
    await connectDB();

    const [categories, articles] = await Promise.all([
      Category.find({ isActive: { $ne: false } }).select('slug updatedAt').lean(),
      Article.find({ status: 'published' })
        .select('slug updatedAt publishedAt')
        .sort({ publishedAt: -1 })
        .limit(2000)
        .lean(),
    ]);

    const categoryRoutes = (categories || [])
      .filter((c) => c?.slug)
      .map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(cat.updatedAt || Date.now()),
        changeFrequency: 'hourly',
        priority: 0.85,
      }));

    const articleRoutes = (articles || [])
      .filter((a) => a?.slug)
      .map((article) => ({
        url: `${baseUrl}/news/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.publishedAt || Date.now()),
        changeFrequency: 'daily',
        priority: 0.8,
      }));

    return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
