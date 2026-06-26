'use client';

import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NewsletterForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('ईमेल दर्ज करें');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('न्यूज़लेटर की सदस्यता सफल!');
        setEmail('');
      } else {
        toast.error(data.message || 'सदस्यता विफल');
      }
    } catch {
      toast.error('सदस्यता विफल');
    }
    setSending(false);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="अपना ईमेल दर्ज करें"
          data-no-indic="true"
          className="flex-1 md:w-64 px-4 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          disabled={sending}
          className="px-4 py-2 bg-white text-red-600 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {sending ? '...' : 'सदस्यता लें'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
          <FiMail className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">ईमेल से जुड़ें</p>
          <p className="text-xs text-gray-500">प्रतिदिन की महत्वपूर्ण खबरें</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          data-no-indic="true"
          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={sending}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {sending ? 'जोड़ा जा रहा है...' : 'सदस्यता लें'}
        </button>
      </div>
    </form>
  );
}
