import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiTwitter, FiFacebook, FiLinkedin, FiGlobe, FiArticle, FiEye } from 'react-icons/fi';
import ArticleCard from '@/components/news/ArticleCard';
import Sidebar from '@/components/layout/Sidebar';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';
import { formatDate, formatNumber } from '@/utils/helpers';

const SAMPLE_AUTHOR = {
  name: 'सारा जॉनसन',
  username: 'sarahjohnson',
  avatar: '',
  bio: 'न्यूज़हब में वरिष्ठ पर्यावरण संवाददाता। 10 से अधिक वर्षों से जलवायु परिवर्तन, स्थिरता और पर्यावरण नीति को कवर कर रही हैं। रॉयटर्स और बीबीसी में पूर्व पत्रकार।',
  role: 'लेखक',
  social: {
    twitter: 'https://twitter.com/sarahjohnson',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    website: 'https://sarahjohnson.com',
  },
  createdAt: new Date('2020-01-15'),
};

async function getAuthor(username) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/users/${username}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const author = await getAuthor(username) || (username === 'sarahjohnson' ? SAMPLE_AUTHOR : null);
  if (!author) return { title: 'लेखक नहीं मिला' };
  return {
    title: `${author.name} - न्यूज़हब लेखक`,
    description: author.bio,
  };
}

export default async function AuthorPage({ params }) {
  const { username } = await params;
  let author = await getAuthor(username);
  if (!author && username === 'sarahjohnson') author = SAMPLE_AUTHOR;
  if (!author) notFound();

  const articles = SAMPLE_ARTICLES.map((a) => ({
    ...a,
    author: { name: author.name, username: author.username, avatar: author.avatar },
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Author Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-black text-3xl flex-shrink-0 overflow-hidden">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                author.name?.[0] || 'A'
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{author.name}</h1>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full capitalize">
                  {author.role}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">@{author.username}</p>
              {author.bio && (
                <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl text-sm leading-relaxed">{author.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-3">
                {author.social?.twitter && (
                  <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors">
                    <FiTwitter className="w-4 h-4" />
                  </a>
                )}
                {author.social?.linkedin && (
                  <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                    <FiLinkedin className="w-4 h-4" />
                  </a>
                )}
                {author.social?.website && (
                  <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors">
                    <FiGlobe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</div>
                <div className="text-xs text-gray-500">लेख</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(articles.reduce((sum, a) => sum + (a.views || 0), 0))}
                </div>
                <div className="text-xs text-gray-500">कुल दृश्य</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatDate(author.createdAt, 'MMM yyyy')}
                </div>
                <div className="text-xs text-gray-500">सदस्य बने</div>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{author.name} के लेख</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.map((article, i) => (
                <ArticleCard key={article.slug || i} article={article} />
              ))}
            </div>
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
