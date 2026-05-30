import Link from 'next/link';
import ArticleCard from './ArticleCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

const CATEGORY_META = {
  technology: { label: 'Technology', color: '#3B82F6', emoji: '💻' },
  politics: { label: 'Politics', color: '#EF4444', emoji: '🏛️' },
  business: { label: 'Business', color: '#10B981', emoji: '📈' },
  sports: { label: 'Sports', color: '#F59E0B', emoji: '⚽' },
  health: { label: 'Health', color: '#06B6D4', emoji: '❤️' },
  science: { label: 'Science', color: '#8B5CF6', emoji: '🔬' },
  entertainment: { label: 'Entertainment', color: '#EC4899', emoji: '🎬' },
  world: { label: 'World', color: '#6366F1', emoji: '🌍' },
};

export default function CategoryNewsSection({ category, articles = SAMPLE_ARTICLES }) {
  const meta = CATEGORY_META[category] || { label: category, color: '#6B7280', emoji: '📰' };

  // Format articles to ensure they have a category field for display
  const displayArticles = articles.slice(0, 4).map(a => ({
    ...a,
    category: a.category || { name: meta.label, slug: category, color: meta.color },
  }));

  if (!displayArticles.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full" style={{ backgroundColor: meta.color }} />
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.emoji}</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{meta.label}</h2>
          </div>
        </div>
        <Link
          href={`/category/${category}`}
          className="text-sm font-medium hover:underline"
          style={{ color: meta.color }}
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {displayArticles.map((article, i) => (
          <ArticleCard key={article.slug || i} article={article} />
        ))}
      </div>
    </section>
  );
}
