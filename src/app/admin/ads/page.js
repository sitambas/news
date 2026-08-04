'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FiSave, FiRefreshCw, FiDollarSign, FiUpload, FiTrash2, FiMonitor,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AD_SLOT_LIST, EMPTY_AD_SLOT } from '@/constants/ads';

function AdSlotFields({ meta, value, onChange }) {
  const slot = value || EMPTY_AD_SLOT;
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const set = (key, v) => onChange({ ...slot, [key]: v });

  const uploadBanner = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('केवल इमेज फ़ाइलें अनुमत हैं');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'ad');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success || !data.url) {
        throw new Error(data.message || 'अपलोड विफल');
      }
      onChange({ ...slot, imageUrl: data.url });
      toast.success('बैनर अपलोड हो गया');
    } catch (err) {
      toast.error(err.message || 'अपलोड विफल');
    }
    setUploading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{meta.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{meta.hint}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold font-mono">
            <FiMonitor className="w-3.5 h-3.5" />
            {meta.size}
          </span>
          <p className="text-[11px] text-gray-400 mt-1">
            {meta.sizeLabel} · {meta.altSizes}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
        अनुशंसित साइज़: <strong>{meta.size}</strong> ({meta.sizeLabel}). {meta.maxHint}.
        JPG / PNG / WebP / GIF, अधिकतम 5MB.
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block">
          कस्टम बैनर अपलोड
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            uploadBanner(file);
          }}
        />
        {slot.imageUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.imageUrl}
              alt={slot.alt || meta.title}
              className="w-full max-h-40 object-contain mx-auto"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <FiUpload className="w-3.5 h-3.5" />
                बदलें
              </button>
              <button
                type="button"
                onClick={() => set('imageUrl', '')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                हटाएँ
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
          >
            {uploading ? <LoadingSpinner size="sm" /> : <FiUpload className="w-5 h-5 text-gray-400" />}
            <span className="text-xs text-gray-500">
              {uploading ? 'अपलोड हो रहा है...' : `बैनर अपलोड करें — ${meta.size}`}
            </span>
            <span className="text-[11px] text-gray-400">Ads banner place here</span>
          </button>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">क्लिक लिंक (विज्ञापनदाता URL)</label>
        <input
          type="url"
          value={slot.linkUrl || ''}
          onChange={(e) => set('linkUrl', e.target.value)}
          placeholder="https://advertiser.com"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Alt text</label>
        <input
          type="text"
          value={slot.alt || ''}
          onChange={(e) => set('alt', e.target.value)}
          placeholder="विज्ञापन विवरण"
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        />
      </div>

      <details>
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
          वैकल्पिक: AdSense Slot ID / इमेज URL
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">AdSense Slot ID</label>
            <input
              type="text"
              value={slot.adsenseSlot || ''}
              onChange={(e) => set('adsenseSlot', e.target.value)}
              placeholder="1234567890"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">या इमेज URL पेस्ट करें</label>
            <input
              type="url"
              value={slot.imageUrl || ''}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://... या /uploads/..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
        </div>
      </details>
    </div>
  );
}

export default function AdminAdsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsenseClientId, setAdsenseClientId] = useState('');
  const [slots, setSlots] = useState({
    adSlotHeader: { ...EMPTY_AD_SLOT },
    adSlotSidebar: { ...EMPTY_AD_SLOT },
    adSlotInArticle: { ...EMPTY_AD_SLOT },
    adSlotAfterArticle: { ...EMPTY_AD_SLOT },
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setAdsEnabled(data.data?.adsEnabled === true);
        setAdsenseClientId(data.data?.adsenseClientId || '');
        setSlots({
          adSlotHeader: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotHeader || {}) },
          adSlotSidebar: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotSidebar || {}) },
          adSlotInArticle: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotInArticle || {}) },
          adSlotAfterArticle: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotAfterArticle || {}) },
        });
      } else {
        toast.error(data.message || 'लोड विफल');
      }
    } catch {
      toast.error('विज्ञापन सेटिंग्स लोड नहीं हुईं');
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
        body: JSON.stringify({
          adsEnabled,
          adsenseClientId: adsenseClientId.trim(),
          ...slots,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('विज्ञापन सेटिंग्स सहेजी गईं');
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
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiDollarSign className="w-6 h-6 text-red-600" />
            विज्ञापन
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            कस्टम बैनर अपलोड करें या AdSense जोड़ें — हर स्लॉट का अनुशंसित साइज़ नीचे है
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="रीफ़्रेश"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'सहेजा जा रहा है...' : 'सहेजें'}
          </button>
        </div>
      </div>

      {/* Size guide */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">बैनर साइज़ गाइड</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 font-medium">स्थान</th>
                <th className="pb-2 font-medium">अनुशंसित साइज़</th>
                <th className="pb-2 font-medium hidden sm:table-cell">वैकल्पिक</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {AD_SLOT_LIST.map((s) => (
                <tr key={s.key}>
                  <td className="py-2.5 text-gray-800 dark:text-gray-200">{s.title}</td>
                  <td className="py-2.5 font-mono text-red-600 dark:text-red-400 font-medium">{s.size}</td>
                  <td className="py-2.5 text-xs text-gray-500 hidden sm:table-cell">{s.altSizes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">विज्ञापन चालू करें</p>
            <p className="text-xs text-gray-500 mt-1">
              बंद होने पर साइट पर कोई विज्ञापन/placeholder नहीं दिखेगा।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdsEnabled((v) => !v)}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 mt-1 ${
              adsEnabled ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-pressed={adsEnabled}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                adsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <details>
          <summary className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-red-600">
            वैकल्पिक: Google AdSense Publisher ID
          </summary>
          <div className="mt-2">
            <input
              type="text"
              value={adsenseClientId}
              onChange={(e) => setAdsenseClientId(e.target.value)}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              AdSense approve होने पर भरें। अभी कस्टम बैनर अपलोड करें।
            </p>
          </div>
        </details>
      </div>

      {AD_SLOT_LIST.map((meta) => (
        <AdSlotFields
          key={meta.key}
          meta={meta}
          value={slots[meta.key]}
          onChange={(next) => setSlots((prev) => ({ ...prev, [meta.key]: next }))}
        />
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        <FiSave className="w-4 h-4" />
        {saving ? 'सहेजा जा रहा है...' : 'सभी विज्ञापन सहेजें'}
      </button>
    </div>
  );
}
