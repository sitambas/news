'use client';

import { useEffect, useState } from 'react';
import { FiSave, FiMessageSquare, FiRefreshCw, FiSmartphone, FiYoutube, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DEFAULT_YOUTUBE_CHANNEL_URL } from '@/constants/youtube';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [appDownloadEnabled, setAppDownloadEnabled] = useState(false);
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(DEFAULT_YOUTUBE_CHANNEL_URL);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeApiConfigured, setYoutubeApiConfigured] = useState(false);
  const [redirectUris, setRedirectUris] = useState([]);
  const [redirectUriUsed, setRedirectUriUsed] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [settingsRes, youtubeRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/youtube/status'),
      ]);
      const data = await settingsRes.json();
      const yt = await youtubeRes.json();
      if (data.success) {
        setCommentsEnabled(data.data?.commentsEnabled === true);
        setAppDownloadEnabled(data.data?.appDownloadEnabled === true);
        setYoutubeChannelUrl(data.data?.youtubeChannelUrl || DEFAULT_YOUTUBE_CHANNEL_URL);
      } else {
        toast.error(data.message || 'सेटिंग्स लोड करने में विफल');
      }
      if (yt.success) {
        setYoutubeConnected(yt.data?.connected === true);
        setYoutubeApiConfigured(yt.data?.apiConfigured === true);
        setRedirectUris(yt.data?.redirectUris || []);
        setRedirectUriUsed(yt.data?.redirectUriUsed || '');
        setGoogleClientId(yt.data?.clientId || '');
      }
    } catch {
      toast.error('सेटिंग्स लोड करने में विफल');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const youtube = params.get('youtube');
    const msg = params.get('msg');
    if (youtube && msg) {
      if (youtube === 'success') toast.success(decodeURIComponent(msg));
      else toast.error(decodeURIComponent(msg));
      window.history.replaceState({}, '', '/admin/settings');
      load();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentsEnabled,
          appDownloadEnabled,
          youtubeChannelUrl: youtubeChannelUrl.trim(),
        }),
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

  const handleDisconnectYoutube = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch('/api/youtube/status', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setYoutubeConnected(false);
        toast.success('YouTube डिस्कनेक्ट हो गया');
      } else {
        toast.error(data.message || 'विफल');
      }
    } catch {
      toast.error('विफल');
    }
    setDisconnecting(false);
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

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <FiYoutube className="w-4 h-4 text-red-600" />
          YouTube (CGFile चैनल)
        </h2>

        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1.5">
            <FiLink className="w-3.5 h-3.5" />
            चैनल URL
          </label>
          <input
            type="url"
            value={youtubeChannelUrl}
            onChange={(e) => setYoutubeChannelUrl(e.target.value)}
            placeholder={DEFAULT_YOUTUBE_CHANNEL_URL}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            फ़ुटर और लेख संपादक में यही चैनल लिंक दिखेगा।
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">सीधे वीडियो अपलोड</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Google अकाउंट कनेक्ट करें ताकि मोबाइल से वीडियो सीधे CGFile चैनल पर अपलोड हो सके।
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                youtubeConnected
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {youtubeConnected ? 'कनेक्टेड' : 'डिस्कनेक्टेड'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {youtubeApiConfigured ? (
              <>
                <a
                  href="/api/youtube/auth"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiYoutube className="w-4 h-4" />
                  {youtubeConnected ? 'फिर से कनेक्ट करें' : 'Google से कनेक्ट करें'}
                </a>
                {youtubeConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnectYoutube}
                    disabled={disconnecting}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    {disconnecting ? '...' : 'डिस्कनेक्ट'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                सीधे अपलोड के लिए सर्वर .env में GOOGLE_CLIENT_ID और GOOGLE_CLIENT_SECRET जोड़ें (YouTube Data API v3)।
                अभी लेख संपादक में &quot;YouTube Studio खोलें&quot; से मैन्युअल अपलोड कर सकते हैं।
              </p>
            )}
          </div>

          {redirectUriUsed && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs space-y-2">
              <p className="font-semibold text-red-700 dark:text-red-400">
                redirect_uri_mismatch fix — Google Console में यही URI जोड़ें:
              </p>
              <code className="block px-2 py-2 bg-white dark:bg-gray-900 border rounded text-[11px] break-all select-all font-mono">
                {redirectUriUsed}
              </code>
              {googleClientId && (
                <p className="text-gray-600 dark:text-gray-400">
                  Client ID (इसी client में URI जोड़ें):{' '}
                  <code className="text-[10px] break-all select-all">{googleClientId}</code>
                </p>
              )}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-red-600 hover:underline font-medium"
              >
                Google Credentials खोलें →
              </a>
            </div>
          )}

          {redirectUris.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Google Cloud सेटअप (सभी ज़रूरी):
              </p>
              <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                <li>
                  <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                    YouTube Data API v3
                  </a>{' '}
                  — Enable करें
                </li>
                <li>
                  OAuth consent screen → <strong>Branding</strong> → Authorized domains में{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">cgfile.in</code> जोड़ें
                </li>
                <li>
                  OAuth consent screen → <strong>Audience</strong> → Testing हो तो अपना Gmail Test users में जोड़ें
                </li>
                <li>
                  Credentials → Client type <strong>Web application</strong> होना चाहिए (Desktop नहीं)
                </li>
                <li>नीचे दिए Redirect URI कॉपी करके Client में जोड़ें → Save</li>
              </ol>
              <p className="font-medium text-gray-700 dark:text-gray-300 pt-1">
                Authorized redirect URIs (बिल्कुल यही):
              </p>
              {redirectUris.map((uri) => (
                <code
                  key={uri}
                  className="block px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-[11px] break-all select-all"
                >
                  {uri}
                </code>
              ))}
              <p className="text-amber-600 dark:text-amber-400">
                Authorized JavaScript origins में भी जोड़ें:{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">https://cgfile.in</code>
                {', '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">https://www.cgfile.in</code>
              </p>
            </div>
          )}
        </div>

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
