import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiMapPin, FiUser } from 'react-icons/fi';
import ArticleCard from '@/components/news/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import { formatNumber } from '@/utils/helpers';
import { getReporterLocations } from '@/utils/reporter';
import mongoose from 'mongoose';

async function getReporter(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/reporters/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

async function getReporterArticles(reporterId) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(
      `${baseUrl}/api/articles?reporter=${reporterId}&limit=50`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return { title: 'रिपोर्टर नहीं मिला' };
  const reporter = await getReporter(id);
  if (!reporter) return { title: 'रिपोर्टर नहीं मिला' };
  return {
    title: `${reporter.name} - CGFILE रिपोर्टर`,
    description: reporter.bio || `${reporter.name} द्वारा लिखे गए समाचार लेख`,
  };
}

export default async function ReporterPage({ params }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  const reporter = await getReporter(id);
  if (!reporter) notFound();

  const articles = await getReporterArticles(id);
  const reporterLocations = getReporterLocations(reporter);
  const articleLocations = [...new Set(articles.map((a) => a.location).filter(Boolean))];
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 flex-shrink-0">
              <FiUser className="w-9 h-9" />
            </div>

            <div className="flex-1">
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
                रिपोर्टर
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {reporter.name}
              </h1>
              {reporterLocations.length > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-1 flex-wrap">
                  <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  लोकेशन: {reporterLocations.join(', ')}
                </p>
              )}
              {reporter.bio && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 max-w-2xl">{reporter.bio}</p>
              )}
              {articleLocations.length > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  लेखों में लोकेशन: {articleLocations.slice(0, 5).join(', ')}
                </p>
              )}
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</div>
                <div className="text-xs text-gray-500">लेख</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(totalViews)}
                </div>
                <div className="text-xs text-gray-500">कुल दृश्य</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-7 bg-red-600 rounded-full" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {reporter.name} के लेख
              </h2>
            </div>

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {articles.map((article, i) => (
                  <ArticleCard key={article.slug || i} article={article} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">इस रिपोर्टर के कोई प्रकाशित लेख नहीं मिले।</p>
                <Link href="/" className="mt-4 inline-block text-sm text-red-600 hover:underline font-medium">
                  होमपेज पर जाएं →
                </Link>
              </div>
            )}
          </div>

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
