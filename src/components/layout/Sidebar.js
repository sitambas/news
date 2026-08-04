'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiTag, FiBookmark, FiClock } from 'react-icons/fi';
import { timeAgo, formatNumber } from '@/utils/helpers';
import SkeletonCard from '@/components/ui/SkeletonCard';
import AdSlot from '@/components/ads/AdSlot';

function TrendingItem({ article, rank }) {
  return (
    <Link href={`/news/${article.slug}`} className="flex items-start gap-3 group py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-2xl font-black text-gray-200 dark:text-gray-700 group-hover:text-red-300 transition-colors leading-none mt-0.5">
        {String(rank).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2 transition-colors">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <FiClock className="w-3 h-3" />
          <span>{timeAgo(article.publishedAt)}</span>
          <span>·</span>
          <span>{formatNumber(article.views)} views</span>
        </div>
      </div>
    </Link>
  );
}

function TagCloud({ tags }) {
  const colors = [
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <Link
          key={tag}
          href={`/search?q=${encodeURIComponent(tag)}&type=tag`}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80 ${colors[i % colors.length]}`}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}

export default function Sidebar({ trending = [], tags = [], ads = null }) {
  const [isLoading, setIsLoading] = useState(false);

  const defaultTrending = [
    { slug: 'sample-1', title: 'विश्व नेताओं ने ऐतिहासिक जलवायु समझौते पर हस्ताक्षर किए', publishedAt: new Date(Date.now() - 3600000), views: 12450 },
    { slug: 'sample-2', title: 'Apple ने AI MacBook का अनावरण किया', publishedAt: new Date(Date.now() - 7200000), views: 8920 },
    { slug: 'sample-3', title: 'फेडरल रिजर्व ने ब्याज दर कटौती के संकेत दिए', publishedAt: new Date(Date.now() - 10800000), views: 6750 },
    { slug: 'sample-4', title: 'वैज्ञानिकों ने 12 प्रकाश-वर्ष दूर पृथ्वी जैसा ग्रह खोजा', publishedAt: new Date(Date.now() - 14400000), views: 15320 },
    { slug: 'sample-5', title: 'चैंपियंस लीग फाइनल: रियल मैड्रिड बनाम मैन सिटी', publishedAt: new Date(Date.now() - 18000000), views: 9840 },
  ];

  const defaultTags = ['जलवायु', 'AI', 'अर्थव्यवस्था', 'खेल', 'स्वास्थ्य', 'तकनीक', 'राजनीति', 'विज्ञान', 'नवाचार', 'चुनाव'];

  const displayTrending = trending.length > 0 ? trending : defaultTrending;
  const displayTags = tags.length > 0 ? tags : defaultTags;

  return (
    <aside className="space-y-6">
      {/* Trending */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">अभी ट्रेंडिंग</h3>
        </div>
        <div>
          {displayTrending.slice(0, 5).map((article, i) => (
            <TrendingItem key={article.slug} article={article} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Ad Space */}
      {ads?.adsEnabled ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 overflow-hidden">
          <AdSlot position="sidebar" ads={ads} className="min-h-[250px]" format="rectangle" />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white text-center">
          <div className="text-xs text-gray-400 mb-2">विज्ञापन</div>
          <div className="text-lg font-bold mb-1">जुड़े रहें</div>
          <p className="text-gray-300 text-sm mb-3">हमारे दैनिक न्यूज़लेटर की सदस्यता लें</p>
          <Link
            href="/newsletter"
            className="block w-full py-2 bg-red-600 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            मुफ़्त सदस्यता
          </Link>
        </div>
      )}

      {/* Tags */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiTag className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">लोकप्रिय टैग</h3>
        </div>
        <TagCloud tags={displayTags} />
      </div>
    </aside>
  );
}
