'use client';

import { FiTwitter, FiFacebook, FiLinkedin, FiLink } from 'react-icons/fi';
import { generateShareUrls } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function ShareButtons({ url, title }) {
  const shareUrls = generateShareUrls(url, title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Share this article:</p>
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={shareUrls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-sky-500 text-white text-xs font-medium rounded-lg hover:bg-sky-600 transition-colors"
        >
          <FiTwitter className="w-3.5 h-3.5" /> Twitter
        </a>
        <a
          href={shareUrls.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiFacebook className="w-3.5 h-3.5" /> Facebook
        </a>
        <a
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 text-white text-xs font-medium rounded-lg hover:bg-blue-900 transition-colors"
        >
          <FiLinkedin className="w-3.5 h-3.5" /> LinkedIn
        </a>
        <a
          href={shareUrls.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
        >
          📱 WhatsApp
        </a>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <FiLink className="w-3.5 h-3.5" /> Copy Link
        </button>
      </div>
    </div>
  );
}
