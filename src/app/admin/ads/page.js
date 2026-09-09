'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FiSave, FiRefreshCw, FiDollarSign, FiUpload, FiTrash2, FiMonitor, FiSmartphone,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AD_SLOT_LIST, AD_PLACEMENT_TIPS, EMPTY_AD_SLOT, EMPTY_NATIVE_AD, NATIVE_AD_PLACEMENTS } from '@/constants/ads';

function BannerUploadBox({
  label,
  sizeHint,
  imageUrl,
  uploading,
  onPick,
  onClear,
  fileRef,
  icon: Icon = FiMonitor,
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          onPick(file);
        }}
      />
      {imageUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full max-h-36 object-contain mx-auto" />
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
              onClick={onClear}
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
          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
        >
          {uploading ? <LoadingSpinner size="sm" /> : <FiUpload className="w-5 h-5 text-gray-400" />}
          <span className="text-xs text-gray-500">
            {uploading ? 'अपलोड हो रहा है...' : `अपलोड — ${sizeHint}`}
          </span>
        </button>
      )}
    </div>
  );
}

function AdSlotFields({ meta, value, onChange }) {
  const slot = value || EMPTY_AD_SLOT;
  const desktopFileRef = useRef(null);
  const mobileFileRef = useRef(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const set = (key, v) => onChange({ ...slot, [key]: v });
  const supportsMobile = meta.supportsMobile === true;

  const uploadBanner = async (file, field) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('केवल इमेज फ़ाइलें अनुमत हैं');
      return;
    }
    const setUploading = field === 'mobileImageUrl' ? setUploadingMobile : setUploadingDesktop;
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
      onChange({ ...slot, [field]: data.url });
      toast.success(field === 'mobileImageUrl' ? 'मोबाइल बैनर अपलोड हो गया' : 'डेस्कटॉप बैनर अपलोड हो गया');
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
        <div className="text-right space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold font-mono">
            <FiMonitor className="w-3.5 h-3.5" />
            {meta.size}
          </span>
          {supportsMobile && (
            <span className="flex justify-end">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-semibold font-mono">
                <FiSmartphone className="w-3.5 h-3.5" />
                {meta.mobileSize}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
        डेस्कटॉप: <strong>{meta.size}</strong>.
        {supportsMobile ? (
          <>
            {' '}मोबाइल: <strong>{meta.mobileSize}</strong> — {meta.mobileHint}.
          </>
        ) : (
          <> {meta.maxHint}.</>
        )}{' '}
        JPG / PNG / WebP / GIF, अधिकतम 5MB.
      </div>

      <div className={`grid gap-4 ${supportsMobile ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
        <BannerUploadBox
          label="डेस्कटॉप बैनर"
          sizeHint={meta.size}
          imageUrl={slot.imageUrl}
          uploading={uploadingDesktop}
          onPick={(file) => uploadBanner(file, 'imageUrl')}
          onClear={() => set('imageUrl', '')}
          fileRef={desktopFileRef}
          icon={FiMonitor}
        />
        {supportsMobile && (
          <BannerUploadBox
            label="मोबाइल बैनर"
            sizeHint={meta.mobileSize}
            imageUrl={slot.mobileImageUrl}
            uploading={uploadingMobile}
            onPick={(file) => uploadBanner(file, 'mobileImageUrl')}
            onClear={() => set('mobileImageUrl', '')}
            fileRef={mobileFileRef}
            icon={FiSmartphone}
          />
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
            <label className="text-xs text-gray-500 mb-1 block">डेस्कटॉप इमेज URL</label>
            <input
              type="url"
              value={slot.imageUrl || ''}
              onChange={(e) => set('imageUrl', e.target.value)}
              placeholder="https://... या /uploads/..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          {supportsMobile && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">मोबाइल इमेज URL</label>
              <input
                type="url"
                value={slot.mobileImageUrl || ''}
                onChange={(e) => set('mobileImageUrl', e.target.value)}
                placeholder="https://... या /uploads/..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

export default function AdminAdsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [adsExpiresAt, setAdsExpiresAt] = useState('2026-08-15');
  const [adsenseClientId, setAdsenseClientId] = useState('');
  const [slots, setSlots] = useState({
    adSlotHeader: { ...EMPTY_AD_SLOT },
    adSlotSidebar: { ...EMPTY_AD_SLOT },
    adSlotLatest: { ...EMPTY_AD_SLOT },
    adSlotHomeMid: { ...EMPTY_AD_SLOT },
    adSlotBetweenCategories: { ...EMPTY_AD_SLOT },
    adSlotInArticle: { ...EMPTY_AD_SLOT },
    adSlotAfterArticle: { ...EMPTY_AD_SLOT },
    adSlotFooter: { ...EMPTY_AD_SLOT },
  });
  const [carousel, setCarousel] = useState([]);
  const carouselFileRef = useRef(null);
  const [carouselUploading, setCarouselUploading] = useState(false);
  const [nativeAds, setNativeAds] = useState([]);
  const nativeFileRef = useRef(null);
  const [nativeUploading, setNativeUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setAdsEnabled(data.data?.adsEnabled === true);
        setAdsExpiresAt(data.data?.adsExpiresAt || '');
        setAdsenseClientId(data.data?.adsenseClientId || '');
        setSlots({
          adSlotHeader: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotHeader || {}) },
          adSlotSidebar: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotSidebar || {}) },
          adSlotLatest: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotLatest || {}) },
          adSlotHomeMid: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotHomeMid || {}) },
          adSlotBetweenCategories: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotBetweenCategories || {}) },
          adSlotInArticle: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotInArticle || {}) },
          adSlotAfterArticle: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotAfterArticle || {}) },
          adSlotFooter: { ...EMPTY_AD_SLOT, ...(data.data?.adSlotFooter || {}) },
        });
        setCarousel(
          Array.isArray(data.data?.adCarousel)
            ? data.data.adCarousel.filter((b) => b?.imageUrl)
            : []
        );
        setNativeAds(
          Array.isArray(data.data?.adNative)
            ? data.data.adNative.filter((b) => b?.imageUrl && b?.title)
            : []
        );
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
          adsExpiresAt: adsExpiresAt || null,
          adsenseClientId: adsenseClientId.trim(),
          ...slots,
          adCarousel: carousel,
          adNative: nativeAds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('विज्ञापन सेटिंग्स सहेजी गईं');
        if (data.data?.adsExpiresAt !== undefined) {
          setAdsExpiresAt(data.data.adsExpiresAt || '');
        }
        if (Array.isArray(data.data?.adNative)) {
          setNativeAds(data.data.adNative.filter((b) => b?.imageUrl && b?.title));
        }
      } else {
        toast.error(data.message || 'सहेजने में विफल');
      }
    } catch {
      toast.error('सहेजने में विफल');
    }
    setSaving(false);
  };

  const uploadCarouselFiles = async (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'));
    if (!list.length) {
      toast.error('केवल इमेज फ़ाइलें अनुमत हैं');
      return;
    }
    if (carousel.length + list.length > 30) {
      toast.error('अधिकतम 30 बैनर');
      return;
    }
    setCarouselUploading(true);
    try {
      const uploaded = [];
      for (const file of list) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('purpose', 'ad');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.success || !data.url) throw new Error(data.message || 'अपलोड विफल');
        uploaded.push({ imageUrl: data.url, linkUrl: '', alt: file.name.replace(/\.[^.]+$/, '') });
      }
      setCarousel((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} बैनर अपलोड हुए`);
    } catch (err) {
      toast.error(err.message || 'अपलोड विफल');
    }
    setCarouselUploading(false);
  };

  const addNativeAd = () => {
    if (nativeAds.length >= 12) {
      toast.error('अधिकतम 12 नेटिव विज्ञापन');
      return;
    }
    const nextPos = Math.min(20, nativeAds.length * 2 + 1);
    setNativeAds((prev) => [
      ...prev,
      { ...EMPTY_NATIVE_AD, afterArticle: nextPos, placement: 'latest' },
    ]);
  };

  const updateNativeAd = (index, patch) => {
    setNativeAds((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const uploadNativeImage = async (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('केवल इमेज फ़ाइलें अनुमत हैं');
      return;
    }
    setNativeUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', 'ad');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.success || !data.url) throw new Error(data.message || 'अपलोड विफल');
      updateNativeAd(index, { imageUrl: data.url });
      toast.success('इमेज अपलोड हो गई');
    } catch (err) {
      toast.error(err.message || 'अपलोड विफल');
    }
    setNativeUploading(false);
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

      {/* Placement tips for wide greeting banners */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
          आपकी शुभकामना बैनर कहाँ लगाएँ?
        </h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {AD_PLACEMENT_TIPS.map((t) => (
            <li key={t.place} className="flex gap-2">
              <span className="text-red-600 font-medium flex-shrink-0">•</span>
              <span>
                <strong className="text-gray-900 dark:text-white">{t.place}</strong>
                {' — '}
                {t.where}. <span className="text-xs text-gray-500">{t.best}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Size guide */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">बैनर साइज़ गाइड</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-2 font-medium">स्थान</th>
                <th className="pb-2 font-medium">डेस्कटॉप</th>
                <th className="pb-2 font-medium">मोबाइल</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {AD_SLOT_LIST.map((s) => (
                <tr key={s.key}>
                  <td className="py-2.5 text-gray-800 dark:text-gray-200">{s.title}</td>
                  <td className="py-2.5 font-mono text-red-600 dark:text-red-400 font-medium text-xs">{s.size}</td>
                  <td className="py-2.5 font-mono text-sky-600 dark:text-sky-400 font-medium text-xs">
                    {s.supportsMobile ? s.mobileSize : '—'}
                  </td>
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

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            ऑटो बंद तारीख
          </label>
          <input
            type="date"
            value={adsExpiresAt}
            onChange={(e) => setAdsExpiresAt(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            इस तारीख के अंत (रात 11:59 IST) के बाद सभी विज्ञापन अपने आप छिप जाएंगे। खाली छोड़ने पर मैन्युअल बंद ही काम करेगा।
            {adsExpiresAt === '2026-08-15' ? ' · स्वतंत्रता दिवस अभियान: 15 अगस्त तक' : ''}
          </p>
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

      {/* Native news-like ads */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
              न्यूज़ जैसा विज्ञापन (नेटिव)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              लेख कार्ड जैसा दिखेगा — हर ऐड की पोज़िशन चुनें (कौन-से लेख के बाद)
            </p>
          </div>
          <button
            type="button"
            onClick={addNativeAd}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            + नेटिव ऐड जोड़ें
          </button>
        </div>

        <input
          ref={nativeFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const idx = Number(e.target.dataset.index || -1);
            const file = e.target.files?.[0];
            e.target.value = '';
            if (idx >= 0) uploadNativeImage(idx, file);
          }}
        />

        {nativeAds.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            अभी कोई नेटिव विज्ञापन नहीं — ऊपर से जोड़ें (इमेज + शीर्षक ज़रूरी)
          </p>
        ) : (
          <div className="space-y-4">
            {nativeAds.map((item, i) => (
              <div
                key={`native-${i}`}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3 bg-gray-50/50 dark:bg-gray-800/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setNativeAds((prev) => prev.filter((_, idx) => idx !== i))}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    हटाएँ
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="sm:w-40 flex-shrink-0">
                    {item.imageUrl ? (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt="" className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          disabled={nativeUploading}
                          onClick={() => {
                            if (nativeFileRef.current) {
                              nativeFileRef.current.dataset.index = String(i);
                              nativeFileRef.current.click();
                            }
                          }}
                          className="w-full py-1 text-[11px] border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          इमेज बदलें
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={nativeUploading}
                        onClick={() => {
                          if (nativeFileRef.current) {
                            nativeFileRef.current.dataset.index = String(i);
                            nativeFileRef.current.click();
                          }
                        }}
                        className="w-full h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-500 hover:border-red-400"
                      >
                        <FiUpload className="w-4 h-4" />
                        कवर इमेज
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateNativeAd(i, { title: e.target.value })}
                      placeholder="शीर्षक (खबर जैसा)"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={item.excerpt || ''}
                      onChange={(e) => updateNativeAd(i, { excerpt: e.target.value })}
                      placeholder="छोटा विवरण (वैकल्पिक)"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.sponsor || ''}
                        onChange={(e) => updateNativeAd(i, { sponsor: e.target.value })}
                        placeholder="स्पॉन्सर नाम (जैसे ब्रांड)"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      />
                      <input
                        type="url"
                        value={item.linkUrl || ''}
                        onChange={(e) => updateNativeAd(i, { linkUrl: e.target.value })}
                        placeholder="https://advertiser.com"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">पोज़िशन — लेख # के बाद</label>
                        <select
                          value={Number(item.afterArticle) >= 1 ? Number(item.afterArticle) : 1}
                          onChange={(e) => updateNativeAd(i, { afterArticle: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        >
                          {Array.from({ length: 12 }, (_, n) => n + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}वें लेख के बाद
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">कहाँ दिखाएँ</label>
                        <select
                          value={item.placement || 'latest'}
                          onChange={(e) => updateNativeAd(i, { placement: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        >
                          {NATIVE_AD_PLACEMENTS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multi-banner carousel */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
              साइडबार बैनर कार्ड्स (कई)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              कई बैनर अपलोड करें — दाएँ साइडबार में अलग-अलग कार्ड के रूप में दिखेंगे (कैरोसेल नहीं)
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold font-mono">
            <FiMonitor className="w-3.5 h-3.5" />
            1200 × 400+
          </span>
        </div>

        <input
          ref={carouselFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            e.target.value = '';
            uploadCarouselFiles(files);
          }}
        />

        <button
          type="button"
          disabled={carouselUploading}
          onClick={() => carouselFileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-red-50/40 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
        >
          {carouselUploading ? <LoadingSpinner size="sm" /> : <FiUpload className="w-5 h-5 text-gray-400" />}
          <span className="text-xs text-gray-500">
            {carouselUploading ? 'अपलोड हो रहा है...' : 'कई बैनर एक साथ चुनें (multi-select)'}
          </span>
        </button>

        {carousel.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {carousel.map((item, i) => (
              <div
                key={`${item.imageUrl}-${i}`}
                className="relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 p-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.alt || `Banner ${i + 1}`} className="w-full h-24 object-contain" />
                <button
                  type="button"
                  onClick={() => setCarousel((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white"
                  title="हटाएँ"
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
                <p className="text-[10px] text-center text-gray-400 mt-1">{i + 1}/{carousel.length}</p>
              </div>
            ))}
          </div>
        )}
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
