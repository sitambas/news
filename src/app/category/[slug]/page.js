import { notFound } from 'next/navigation';
import ArticleCard from '@/components/news/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import { getCategoryDisplay } from '@/utils/category';
import { findCategoryBySlug, getPublishedArticlesByCategory, normalizeCategorySlug } from '@/lib/categoryQueries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) return { title: 'श्रेणी नहीं मिली' };
  const meta = getCategoryDisplay(category);
  return {
    title: `${meta.name} समाचार - नवीनतम अपडेट`,
    description: meta.description || `${meta.name} की नवीनतम खबरें`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const normalizedSlug = normalizeCategorySlug(slug);
  const category = await findCategoryBySlug(normalizedSlug);
  if (!category || category.isActive === false) notFound();

  const meta = getCategoryDisplay(category);
  const { articles, total } = await getPublishedArticlesByCategory(category._id, { limit: 24 });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{meta.icon}</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md"
                  style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                >
                  श्रेणी
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">{meta.name}</h1>
              {meta.description && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{meta.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-xs text-gray-500">लेख</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {articles.map((article, i) => (
                  <ArticleCard key={article._id || article.slug || i} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="text-4xl mb-3">{meta.icon}</div>
                <p className="text-gray-500 dark:text-gray-400">
                  इस श्रेणी में अभी कोई प्रकाशित लेख नहीं है।
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Sidebar trending={articles} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
