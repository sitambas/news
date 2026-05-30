'use client';

import { useState } from 'react';
import { FiHeart, FiBookmark, FiShare2, FiMessageSquare } from 'react-icons/fi';
import { formatNumber } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ArticleActions({ article, articleUrl }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(article?.likes?.length || 0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleLike = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to like articles');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${article.slug}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
        toast.success(data.data.liked ? 'Article liked!' : 'Like removed');
      }
    } catch {
      toast.error('Failed to like article');
    }
    setLoading(false);
  };

  const handleBookmark = async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to bookmark articles');
      return;
    }
    try {
      const res = await fetch(`/api/articles/${article.slug}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBookmarked(data.data.bookmarked);
        toast.success(data.data.bookmarked ? 'Article bookmarked!' : 'Bookmark removed');
      }
    } catch {
      toast.error('Failed to bookmark article');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url: articleUrl });
      } else {
        await navigator.clipboard.writeText(articleUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      toast.error('Failed to share');
    }
  };

  return (
    <div className="flex items-center justify-between mt-8 py-4 border-y border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            liked
              ? 'bg-red-50 border-red-300 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-600'
          }`}
        >
          <FiHeart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{formatNumber(likeCount)}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            bookmarked
              ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <FiBookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          <span>{bookmarked ? 'Saved' : 'Save'}</span>
        </button>

        <a href="#comments" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-all">
          <FiMessageSquare className="w-4 h-4" />
          <span>Comments</span>
        </a>
      </div>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <FiShare2 className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}
