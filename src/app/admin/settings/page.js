'use client';

import { useEffect, useState } from 'react';
import { FiSave, FiMessageSquare, FiRefreshCw, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [appDownloadEnabled, setAppDownloadEnabled] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setCommentsEnabled(data.data?.commentsEnabled === true);
        setAppDownloadEnabled(data.data?.appDownloadEnabled === true);
      } else {
        toast.error(data.message || 'सेटिंग्स लोड करने में विफल');
      }
    } catch {
      toast.error('सेटिंग्स लोड करने में विफल');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentsEnabled, appDownloadEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('सेटिंग्स सहेजी गईं');
      } else {
        toast.error(data.message || 'सहेजने में विफल');
      }
    } catch {
      toast.error('सहेजने में विफल');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">सेटिंग्स</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">वेबसाइट की सामान्य सेटिंग्स प्रबंधित करें</p>
        </div>
        <button
          onClick={load}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          title="रीफ़्रेश"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">साइट फीचर्स</h2>

        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 flex-shrink-0">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">टिप्पणियाँ (Comments)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                चालू करने पर लेख पृष्ठ पर टिप्पणी अनुभाग दिखेगा। बंद होने पर पूरे साइट पर टिप्पणियाँ छिपी रहेंगी।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCommentsEnabled((v) => !v)}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 mt-1 ${
              commentsEnabled ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-pressed={commentsEnabled}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                commentsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
              <FiSmartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">ऐप डाउनलोड (Footer)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                चालू करने पर फ़ुटर में App Store और Google Play बटन दिखेंगे।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAppDownloadEnabled((v) => !v)}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 mt-1 ${
              appDownloadEnabled ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-pressed={appDownloadEnabled}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                appDownloadEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-gray-400 space-y-0.5">
          <span className="block">
            टिप्पणियाँ: <span className={commentsEnabled ? 'text-green-600' : 'text-gray-500'}>
              {commentsEnabled ? 'चालू' : 'बंद (छिपी)'}
            </span>
          </span>
          <span className="block">
            ऐप डाउनलोड: <span className={appDownloadEnabled ? 'text-green-600' : 'text-gray-500'}>
              {appDownloadEnabled ? 'चालू' : 'बंद (छिपा)'}
            </span>
          </span>
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <FiSave className="w-4 h-4" />
          {saving ? 'सहेजा जा रहा है...' : 'सहेजें'}
        </button>
      </div>
    </div>
  );
}
