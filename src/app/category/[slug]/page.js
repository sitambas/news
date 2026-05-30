import { notFound } from 'next/navigation';
import ArticleCard from '@/components/news/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

const CATEGORY_META = {
  politics: { name: 'Politics', description: 'Latest political news and analysis from around the world.', color: '#EF4444', emoji: '🏛️' },
  technology: { name: 'Technology', description: 'Tech news, innovations, and digital trends.', color: '#3B82F6', emoji: '💻' },
  business: { name: 'Business', description: 'Business news, markets, and economic updates.', color: '#10B981', emoji: '📈' },
  science: { name: 'Science', description: 'Scientific discoveries and research breakthroughs.', color: '#8B5CF6', emoji: '🔬' },
  sports: { name: 'Sports', description: 'Sports news, results, and athlete profiles.', color: '#F59E0B', emoji: '⚽' },
  entertainment: { name: 'Entertainment', description: 'Celebrity news, movies, music, and pop culture.', color: '#EC4899', emoji: '🎬' },
  health: { name: 'Health', description: 'Health tips, medical news, and wellness advice.', color: '#06B6D4', emoji: '❤️' },
  world: { name: 'World', description: 'International news and global events.', color: '#6366F1', emoji: '🌍' },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  if (!meta) return { title: 'Category Not Found' };
  return {
    title: `${meta.name} News - Latest Updates`,
    description: meta.description,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  if (!meta) notFound();

  const articles = SAMPLE_ARTICLES.map((a) => ({
    ...a,
    category: { name: meta.name, slug, color: meta.color },
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Category Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{meta.emoji}</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                  Category
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">{meta.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{meta.description}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}+</div>
              <div className="text-xs text-gray-500">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">24K</div>
              <div className="text-xs text-gray-500">Readers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Daily</div>
              <div className="text-xs text-gray-500">Updates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles Grid */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {['Latest', 'Trending', 'Most Read', 'This Week'].map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filter === 'Latest'
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={filter === 'Latest' ? { backgroundColor: meta.color } : {}}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.map((article, i) => (
                <ArticleCard key={article.slug || i} article={article} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <button className="px-6 py-3 border-2 text-sm font-semibold rounded-xl transition-all hover:text-white" style={{ borderColor: meta.color, color: meta.color }}>
                Load More {meta.name} News
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
