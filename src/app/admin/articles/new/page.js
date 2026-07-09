'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  FiSave, FiSend, FiImage, FiUpload, FiX, FiLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import YouTubeVideoField from '@/components/admin/YouTubeVideoField';
import { isValidYouTubeUrl } from '@/utils/youtube';
import { getReporterLocations } from '@/utils/reporter';
import IndicInput from '@/components/ui/IndicInput';
import IndicTextarea from '@/components/ui/IndicTextarea';
import AiWriteButton, { FieldLabelWithAi } from '@/components/ui/AiWriteButton';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center"><LoadingSpinner /></div>,
});

function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ArticleEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');
  const isEditing = Boolean(editSlug);

  const [loadingArticle, setLoadingArticle] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [coverTab, setCoverTab] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    location: '',
    reporter: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft',
    coverImage: '',
    coverImageAlt: '',
    youtubeUrl: '',
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    allowComments: true,
    scheduledAt: '',
    meta: { title: '', description: '' },
  });
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [reporters, setReporters] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/reporters?all=1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReporters(data.data || []);
      })
      .catch(() => {});

    fetch('/api/categories?all=1')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const active = (data.data || []).filter((c) => c.isActive !== false);
          setCategories(active.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editSlug) return;

    setLoadingArticle(true);
    fetch(`/api/articles/${editSlug}?admin=1`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          toast.error(data.message || 'लेख लोड करने में विफल');
          router.push('/admin/articles');
          return;
        }

        const article = data.data;
        const text = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean);

        setForm({
          title: article.title || '',
          location: article.location || '',
          reporter: article.reporter?._id || article.reporter || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          category: article.category?.slug || '',
          tags: article.tags || [],
          status: article.status || 'draft',
          coverImage: article.coverImage || '',
          coverImageAlt: article.coverImageAlt || '',
          youtubeUrl: article.youtubeUrl || '',
          isBreaking: article.isBreaking || false,
          isFeatured: article.isFeatured || false,
          isTrending: article.isTrending || false,
          allowComments: article.allowComments !== false,
          scheduledAt: toDatetimeLocal(article.scheduledAt),
          meta: {
            title: article.meta?.title || '',
            description: article.meta?.description || '',
          },
        });
        setWordCount(text.length);
        setReadingTime(article.readingTime || Math.ceil(text.length / 200));
        if (article.coverImage?.startsWith('http')) setCoverTab('url');
      })
      .catch(() => {
        toast.error('लेख लोड करने में विफल');
        router.push('/admin/articles');
      })
      .finally(() => setLoadingArticle(false));
  }, [editSlug, router]);

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const updateMeta = (field, val) => setForm((p) => ({ ...p, meta: { ...p.meta, [field]: val } }));

  const handleReporterChange = (reporterId) => {
    setForm((p) => {
      const selected = reporters.find((r) => r._id === reporterId);
      const options = getReporterLocations(selected);
      const nextLocation = options.includes(p.location) ? p.location : (options[0] || '');
      return { ...p, reporter: reporterId, location: nextLocation };
    });
  };

  const selectedReporter = reporters.find((r) => r._id === form.reporter);
  const locationOptions = (() => {
    const options = getReporterLocations(selectedReporter);
    if (form.location && !options.includes(form.location)) {
      return [...options, form.location];
    }
    return options;
  })();

  const uploadImage = useCallback(async (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('केवल JPG, PNG, WebP, GIF फ़ाइलें अनुमत हैं');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('फ़ाइल 5MB से बड़ी नहीं होनी चाहिए');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        update('coverImage', data.url);
        toast.success('छवि अपलोड हो गई!');
      } else {
        toast.error(data.message || 'अपलोड विफल');
      }
    } catch {
      toast.error('अपलोड विफल हुआ');
    }
    setUploading(false);
  }, []);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadImage(file);
  }, [uploadImage]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  };

  const handleContentChange = (content) => {
    update('content', content);
    const text = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean);
    setWordCount(text.length);
    setReadingTime(Math.ceil(text.length / 200));
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!form.tags.includes(tag) && form.tags.length < 10) {
        update('tags', [...form.tags, tag]);
      }
      setTagInput('');
    }
  };
  const removeTag = (tag) => update('tags', form.tags.filter((t) => t !== tag));

  const handleSave = async (publishStatus) => {
    if (!form.title.trim()) { toast.error('शीर्षक आवश्यक है'); return; }
    if (!form.content.trim()) { toast.error('सामग्री आवश्यक है'); return; }
    if (!form.category) { toast.error('श्रेणी आवश्यक है'); return; }
    if (form.youtubeUrl.trim() && !isValidYouTubeUrl(form.youtubeUrl)) {
      toast.error('मान्य YouTube URL दर्ज करें');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      status: publishStatus || form.status,
      youtubeUrl: form.youtubeUrl.trim(),
      reporter: form.reporter || null,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/articles/${editSlug}` : '/api/articles',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          isEditing
            ? 'लेख अपडेट हुआ!'
            : publishStatus === 'published'
              ? 'लेख प्रकाशित हुआ!'
              : 'लेख सहेजा गया!'
        );
        router.push('/admin/articles');
      } else {
        toast.error(data.message || 'लेख सहेजने में विफल');
      }
    } catch {
      toast.error('लेख सहेजने में विफल');
    }
    setSaving(false);
  };

  if (loadingArticle) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'लेख संपादित करें' : 'नया लेख बनाएं'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FiSave className="w-4 h-4" />
            ड्राफ्ट सहेजें
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving ? <LoadingSpinner size="sm" /> : <FiSend className="w-4 h-4" />}
            प्रकाशित करें
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="xl:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <IndicInput
              type="text"
              value={form.title}
              onChange={(val) => update('title', val)}
              placeholder="लेख का शीर्षक दर्ज करें... (English में टाइप करें → हिंदी)"
              className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none placeholder-gray-300 dark:placeholder-gray-700"
            />
          </div>

          {/* Reporter & location */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                  रिपोर्टर
                </label>
                <select
                  value={form.reporter}
                  onChange={(e) => handleReporterChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">रिपोर्टर चुनें...</option>
                  {reporters.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {reporters.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    कोई रिपोर्टर नहीं।{' '}
                    <a href="/admin/reporters" className="text-red-600 hover:underline">रिपोर्टर जोड़ें</a>
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">
                  लोकेशन
                </label>
                <select
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  disabled={!form.reporter || locationOptions.length === 0}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!form.reporter
                      ? 'पहले रिपोर्टर चुनें'
                      : locationOptions.length === 0
                        ? 'इस रिपोर्टर की कोई लोकेशन नहीं'
                        : 'लोकेशन चुनें...'}
                  </option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {form.reporter && locationOptions.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    <a href="/admin/reporters" className="text-red-600 hover:underline">रिपोर्टर में लोकेशन जोड़ें</a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <FieldLabelWithAi
              label="लेख का सारांश"
              aiButton={
                <AiWriteButton
                  type="article_excerpt"
                  context={{ title: form.title, category: form.category }}
                  onResult={(text) => update('excerpt', text)}
                  disabled={!form.title?.trim()}
                />
              }
            />
            <IndicTextarea
              value={form.excerpt}
              onChange={(val) => update('excerpt', val)}
              placeholder="लेख का संक्षिप्त सारांश..."
              rows={2}
              maxLength={500}
              className="w-full text-sm text-gray-700 dark:text-gray-300 bg-transparent border-0 focus:outline-none placeholder-gray-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400">{form.excerpt.length}/500</div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                सामग्री
              </label>
              <div className="flex items-center gap-2">
                <AiWriteButton
                  type="article_content"
                  context={{
                    title: form.title,
                    category: form.category,
                    location: form.location,
                  }}
                  onResult={(text, data) => update('content', data?.html || text)}
                  disabled={!form.title?.trim()}
                  label="AI से लेख लिखें"
                />
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{wordCount} शब्द</span>
                  <span>~{readingTime} मिनट पढ़ें</span>
                </div>
              </div>
            </div>
            <RichTextEditor key={editSlug || 'new'} content={form.content} onChange={handleContentChange} />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">प्रकाशन सेटिंग्स</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">स्थिति</label>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="draft">ड्राफ्ट</option>
                  <option value="published">प्रकाशित</option>
                  <option value="scheduled">निर्धारित</option>
                  <option value="archived">संग्रहीत</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">तारीख/समय निर्धारित करें</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => update('scheduledAt', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <FiImage className="w-4 h-4 text-red-600" />
              कवर छवि
            </h3>

            {/* Preview */}
            {form.coverImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => update('coverImage', '')}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs truncate">{form.coverImage.split('/').pop()}</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-3">
              <button
                onClick={() => setCoverTab('upload')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                  coverTab === 'upload'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiUpload className="w-3.5 h-3.5" />
                फ़ाइल अपलोड
              </button>
              <button
                onClick={() => setCoverTab('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                  coverTab === 'url'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FiLink className="w-3.5 h-3.5" />
                URL लिंक
              </button>
            </div>

            {coverTab === 'upload' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner size="md" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">अपलोड हो रहा है...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                      <FiUpload className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        क्लिक करें या यहाँ खींचें
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        JPG, PNG, WebP, GIF • अधिकतम 5MB
                      </p>
                      <p className="text-xs text-gray-400">
                        1200×675px में optimize होगी
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => update('coverImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            )}

            <input
              type="text"
              value={form.coverImageAlt}
              onChange={(e) => update('coverImageAlt', e.target.value)}
              placeholder="छवि का विवरण (alt टेक्स्ट)..."
              className="w-full mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <YouTubeVideoField
            value={form.youtubeUrl}
            onChange={(url) => update('youtubeUrl', url)}
            articleTitle={form.title}
            articleExcerpt={form.excerpt}
          />

          {/* Category */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">श्रेणी</h3>
              <a href="/admin/categories" className="text-xs text-red-600 hover:underline">+ नई श्रेणी</a>
            </div>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">श्रेणी चुनें...</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.slug} value={cat.slug}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">
                कोई श्रेणी नहीं — <a href="/admin/categories" className="text-red-600 hover:underline">पहली श्रेणी बनाएं</a>
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">टैग</h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-600"><FiX className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="टैग जोड़ें + Enter..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Flags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">लेख फ्लैग</h3>
            <div className="space-y-2">
              {[
                { key: 'isBreaking', label: 'ब्रेकिंग न्यूज़', color: 'red' },
                { key: 'isFeatured', label: 'विशेष लेख', color: 'blue' },
                { key: 'isTrending', label: 'ट्रेंडिंग', color: 'orange' },
                { key: 'allowComments', label: 'टिप्पणियाँ अनुमति दें', color: 'green' },
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  <button
                    type="button"
                    onClick={() => update(key, !form[key])}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form[key] ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">SEO सेटिंग्स</h3>
            <div className="space-y-2">
              <IndicInput
                type="text"
                value={form.meta.title}
                onChange={(val) => updateMeta('title', val)}
                placeholder="मेटा शीर्षक..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FieldLabelWithAi
                label="मेटा विवरण"
                aiButton={
                  <AiWriteButton
                    type="article_meta"
                    context={{ title: form.title || form.meta.title, excerpt: form.excerpt }}
                    onResult={(text) => updateMeta('description', text)}
                    disabled={!form.title?.trim() && !form.meta.title?.trim()}
                  />
                }
              />
              <IndicTextarea
                value={form.meta.description}
                onChange={(val) => updateMeta('description', val)}
                placeholder="मेटा विवरण..."
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ArticleEditor />
    </Suspense>
  );
}
