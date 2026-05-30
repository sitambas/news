'use client';

import { useEffect } from 'react';
import { FiAlertCircle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiAlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">कुछ गलत हुआ</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" /> पुनः प्रयास करें
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FiHome className="w-4 h-4" /> होम जाएं
          </Link>
        </div>
      </div>
    </div>
  );
}
