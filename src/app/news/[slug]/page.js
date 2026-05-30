import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiEye, FiCalendar, FiTag, FiShare2 } from 'react-icons/fi';
import { formatDate, timeAgo, formatNumber } from '@/utils/helpers';
import ArticleActions from '@/components/news/ArticleActions';
import CommentSection from '@/components/news/CommentSection';
import RelatedArticles from '@/components/news/RelatedArticles';
import ShareButtons from '@/components/news/ShareButtons';
import Sidebar from '@/components/layout/Sidebar';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';

// Sample article for demo (used when DB article not found)
const SAMPLE_ARTICLE = {
  _id: 'sample-1',
  title: 'Global Leaders Reach Historic Climate Agreement at COP30 Summit',
  slug: 'sample-1',
  excerpt: 'World leaders from 195 countries have signed a landmark climate accord pledging net-zero emissions by 2040, marking the most ambitious global climate commitment in history.',
  content: `
    <p>In a landmark moment for global diplomacy and environmental policy, world leaders from 195 countries gathered in Geneva for the COP30 Climate Summit and emerged with a historic agreement that could fundamentally reshape how humanity addresses climate change.</p>
    
    <h2>Key Provisions of the Agreement</h2>
    <p>The accord, which took three weeks of intensive negotiations to finalize, commits signatory nations to achieving net-zero carbon emissions by 2040 — a full decade earlier than the targets set in the Paris Agreement.</p>
    
    <blockquote>"This is not just an agreement on paper. This is a binding commitment backed by real financial mechanisms and accountability frameworks," said UN Secretary-General at the closing ceremony.</blockquote>
    
    <p>The deal includes several unprecedented provisions:</p>
    <ul>
      <li>A $2 trillion climate finance fund to help developing nations transition to clean energy</li>
      <li>A phase-out of coal power plants by 2035 for developed nations</li>
      <li>Mandatory annual emissions reporting with independent verification</li>
      <li>Carbon border taxes to prevent emissions leakage</li>
      <li>A technology transfer framework to share green innovations</li>
    </ul>
    
    <h2>Global Reactions</h2>
    <p>The agreement was met with cautious optimism from environmental groups, who praised the ambition while noting that implementation would be the true test of political will.</p>
    
    <p>"We've heard ambitious promises before," said the director of a leading climate think tank. "What makes this different is the verification mechanism — countries can no longer simply make pledges and walk away."</p>
    
    <h2>Economic Implications</h2>
    <p>Economists are divided on the economic impact. Some predict significant job losses in fossil fuel industries, particularly in coal-dependent regions, while others point to the massive economic opportunity represented by the clean energy transition.</p>
    
    <p>A study published alongside the agreement estimates that achieving net-zero by 2040 could create 65 million new jobs globally in renewable energy, electric vehicles, and sustainable agriculture.</p>
    
    <h2>What Happens Next</h2>
    <p>Each signatory nation now has 12 months to submit a detailed implementation plan, including specific legislation, investment commitments, and timeline milestones. These plans will be subject to review by an independent international panel.</p>
    
    <p>The agreement will enter into force once ratified by countries representing at least 75% of global emissions, a threshold analysts believe could be reached within six months.</p>
  `,
  coverImage: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=1200',
  coverImageAlt: 'World leaders at the climate summit',
  author: { name: 'Sarah Johnson', username: 'sarahjohnson', avatar: '', bio: 'Senior Environmental Correspondent' },
  category: { name: 'World', slug: 'world', color: '#6366F1' },
  tags: ['climate', 'COP30', 'environment', 'world leaders', 'sustainability'],
  publishedAt: new Date(Date.now() - 1000 * 60 * 30),
  readingTime: 5,
  views: 12450,
  likes: [],
  isBreaking: true,
  aiSummary: 'World leaders signed a historic climate agreement at COP30, committing to net-zero emissions by 2040 with a $2 trillion support fund for developing nations.',
};

async function getArticle(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/articles/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug) || (slug === 'sample-1' ? SAMPLE_ARTICLE : null);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.meta?.title || article.title,
    description: article.meta?.description || article.excerpt,
    keywords: article.meta?.keywords || article.tags,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [{ url: article.coverImage }] : [],
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author?.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  let article = await getArticle(slug);

  // Fallback to sample article for demo
  if (!article && slug === 'sample-1') {
    article = SAMPLE_ARTICLE;
  }
  if (!article) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const articleUrl = `${appUrl}/news/${article.slug}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article Main Content */}
          <article className="lg:col-span-2">
            {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link href="/" className="hover:text-red-600">होम</Link>
              <span>/</span>
              {article.category && (
                <>
                  <Link href={`/category/${article.category.slug}`} className="hover:text-red-600">{article.category.name}</Link>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-700 dark:text-gray-300 line-clamp-1">{article.title}</span>
            </nav>

            {/* Article Header */}
            <header className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {article.isBreaking && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">ब्रेकिंग न्यूज़</span>
                )}
                {article.category && (
                  <Link
                    href={`/category/${article.category.slug}`}
                    className="text-xs font-bold px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                  >
                    {article.category.name}
                  </Link>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed border-l-4 border-red-600 pl-4">
                  {article.excerpt}
                </p>
              )}
            </header>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold overflow-hidden">
                  {article.author?.avatar ? (
                    <img src={article.author.avatar} alt={article.author.name} className="w-full h-full object-cover" />
                  ) : (
                    article.author?.name?.[0] || 'A'
                  )}
                </div>
                <div>
                  <Link href={`/author/${article.author?.username}`} className="font-semibold text-gray-900 dark:text-white hover:text-red-600 text-sm">
                    {article.author?.name || 'NewsHub Staff'}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{article.author?.bio || 'Journalist'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="w-4 h-4" />
                  {article.readingTime} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <FiEye className="w-4 h-4" />
                  {formatNumber(article.views)} views
                </span>
              </div>
            </div>

            {/* AI Summary */}
            {article.aiSummary && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">🤖 AI सारांश</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{article.aiSummary}</p>
              </div>
            )}

            {/* Cover Image */}
            {article.coverImage && (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
                <Image
                  src={article.coverImage}
                  alt={article.coverImageAlt || article.title}
                  fill
                  priority
                  className="object-cover"
                />
                {article.coverImageAlt && (
                  <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center">
                    {article.coverImageAlt}
                  </p>
                )}
              </div>
            )}

            {/* Article Content */}
            <div
              className="article-content prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <FiTag className="w-4 h-4 text-gray-400" />
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Article Actions (Like, Bookmark, Share) */}
            <ArticleActions article={article} articleUrl={articleUrl} />

            {/* Share Buttons */}
            <ShareButtons url={articleUrl} title={article.title} />

            {/* Author Bio */}
            {article.author && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mt-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">लेखक के बारे में</h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-xl flex-shrink-0 overflow-hidden">
                    {article.author.avatar ? (
                      <img src={article.author.avatar} alt={article.author.name} className="w-full h-full object-cover" />
                    ) : (
                      article.author.name?.[0] || 'A'
                    )}
                  </div>
                  <div>
                    <Link href={`/author/${article.author.username}`} className="font-semibold text-gray-900 dark:text-white hover:text-red-600 text-lg">
                      {article.author.name}
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                      {article.author.bio || 'न्यूज़हब के स्टाफ पत्रकार, ब्रेकिंग न्यूज़ और गहन विश्लेषण को कवर करते हैं।'}
                    </p>
                    <Link href={`/author/${article.author.username}`} className="mt-2 inline-block text-sm text-red-600 hover:underline font-medium">
                      सभी लेख देखें →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Related Articles */}
            <RelatedArticles currentSlug={article.slug} category={article.category} />

            {/* Comments */}
            {article.allowComments !== false && (
              <CommentSection articleId={article._id} />
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
