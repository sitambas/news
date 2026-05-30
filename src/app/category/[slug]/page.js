import { notFound } from 'next/navigation';
import ArticleCard from '@/components/news/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

const CATEGORY_META = {
  politics: { name: 'राजनीति', description: 'दुनिया भर से नवीनतम राजनीतिक समाचार और विश्लेषण।', color: '#EF4444', emoji: '🏛️' },
  technology: { name: 'तकनीक', description: 'टेक न्यूज़, नवाचार और डिजिटल रुझान।', color: '#3B82F6', emoji: '💻' },
  business: { name: 'व्यापार', description: 'व्यापार समाचार, बाजार और आर्थिक अपडेट।', color: '#10B981', emoji: '📈' },
  science: { name: 'विज्ञान', description: 'वैज्ञानिक खोजें और शोध सफलताएं।', color: '#8B5CF6', emoji: '🔬' },
  sports: { name: 'खेल', description: 'खेल समाचार, परिणाम और खिलाड़ी प्रोफाइल।', color: '#F59E0B', emoji: '⚽' },
  entertainment: { name: 'मनोरंजन', description: 'सेलेब्रिटी खबरें, फिल्में, संगीत और पॉप संस्कृति।', color: '#EC4899', emoji: '🎬' },
  health: { name: 'स्वास्थ्य', description: 'स्वास्थ्य सुझाव, चिकित्सा समाचार और तंदुरुस्ती सलाह।', color: '#06B6D4', emoji: '❤️' },
  world: { name: 'विश्व', description: 'अंतर्राष्ट्रीय समाचार और वैश्विक घटनाएं।', color: '#6366F1', emoji: '🌍' },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  if (!meta) return { title: 'श्रेणी नहीं मिली' };
  return {
    title: `${meta.name} समाचार - नवीनतम अपडेट`,
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
                  श्रेणी
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
              <div className="text-xs text-gray-500">लेख</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">24K</div>
              <div className="text-xs text-gray-500">पाठक</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">प्रतिदिन</div>
              <div className="text-xs text-gray-500">अपडेट</div>
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
              {['नवीनतम', 'ट्रेंडिंग', 'सर्वाधिक पढ़ा', 'इस सप्ताह'].map((filter, i) => (
                <button
                  key={filter}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    i === 0
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={i === 0 ? { backgroundColor: meta.color } : {}}
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
                और {meta.name} समाचार लोड करें
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
