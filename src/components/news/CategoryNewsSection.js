import Link from 'next/link';
import ArticleCard from './ArticleCard';
import { getCategoryDisplay } from '@/utils/category';

export default function CategoryNewsSection({ category, articles = [] }) {
  const meta = getCategoryDisplay(category);
  const slug = meta.slug || (typeof category === 'string' ? category : '');

  const displayArticles = articles
    .filter((a) => !slug || a.category?.slug === slug)
    .slice(0, 4);

  if (!displayArticles.length || !meta.name) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full" style={{ backgroundColor: meta.color }} />
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.icon}</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{meta.name}</h2>
          </div>
        </div>
        <Link
          href={`/category/${slug}`}
          className="text-sm font-medium hover:underline"
          style={{ color: meta.color }}
        >
          सभी देखें →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {displayArticles.map((article, i) => (
          <ArticleCard key={article._id || article.slug || i} article={article} />
        ))}
      </div>
    </section>
  );
}
