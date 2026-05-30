const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const CATEGORIES = ['politics', 'technology', 'business', 'science', 'sports', 'entertainment', 'health', 'world'];

export default async function sitemap() {
  const routes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...CATEGORIES.map((cat) => ({
      url: `${baseUrl}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })),
  ];

  // Dynamically add articles if DB is available
  try {
    const res = await fetch(`${baseUrl}/api/articles?status=published&limit=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const articles = data.data || [];
      articles.forEach((article) => {
        routes.push({
          url: `${baseUrl}/news/${article.slug}`,
          lastModified: new Date(article.updatedAt || article.publishedAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }
  } catch {
    // DB unavailable, skip dynamic articles
  }

  return routes;
}
