'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  FiSave, FiSend, FiEye, FiImage, FiTag, FiCalendar,
  FiToggleLeft, FiToggleRight, FiChevronDown, FiUpload, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center"><LoadingSpinner /></div>,
});

const CATEGORIES = ['Politics', 'Technology', 'Business', 'Science', 'Sports', 'Entertainment', 'Health', 'World'];

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('write');
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft',
    coverImage: '',
    coverImageAlt: '',
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

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const updateMeta = (field, val) => setForm((p) => ({ ...p, meta: { ...p.meta, [field]: val } }));

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
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    if (!form.category) { toast.error('Category is required'); return; }

    setSaving(true);
    const payload = { ...form, status: publishStatus || form.status };

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(publishStatus === 'published' ? 'Article published!' : 'Article saved!');
        router.push('/admin/articles');
      } else {
        toast.error(data.message || 'Failed to save article');
      }
    } catch {
      toast.error('Failed to save article');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Article</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <FiSave className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving ? <LoadingSpinner size="sm" /> : <FiSend className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="xl:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Enter article title..."
              className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none placeholder-gray-300 dark:placeholder-gray-700"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Article Excerpt / Summary
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              placeholder="Brief summary of the article (shown in previews)..."
              rows={2}
              maxLength={500}
              className="w-full text-sm text-gray-700 dark:text-gray-300 bg-transparent border-0 focus:outline-none placeholder-gray-400 resize-none"
            />
            <div className="text-right text-xs text-gray-400">{form.excerpt.length}/500</div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Content
              </label>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{wordCount} words</span>
                <span>~{readingTime} min read</span>
              </div>
            </div>
            <RichTextEditor content={form.content} onChange={handleContentChange} />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Publish Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Schedule Date/Time</label>
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
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Cover Image</h3>
            <div className="space-y-2">
              {form.coverImage && (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => update('coverImage', '')}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}
              <input
                type="url"
                value={form.coverImage}
                onChange={(e) => update('coverImage', e.target.value)}
                placeholder="Image URL..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                value={form.coverImageAlt}
                onChange={(e) => update('coverImageAlt', e.target.value)}
                placeholder="Image alt text..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Category</h3>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Tags</h3>
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
              placeholder="Add tag + Enter..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Flags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Article Flags</h3>
            <div className="space-y-2">
              {[
                { key: 'isBreaking', label: 'Breaking News', color: 'red' },
                { key: 'isFeatured', label: 'Featured Article', color: 'blue' },
                { key: 'isTrending', label: 'Trending', color: 'orange' },
                { key: 'allowComments', label: 'Allow Comments', color: 'green' },
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
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">SEO Settings</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={form.meta.title}
                onChange={(e) => updateMeta('title', e.target.value)}
                placeholder="Meta title..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <textarea
                value={form.meta.description}
                onChange={(e) => updateMeta('description', e.target.value)}
                placeholder="Meta description..."
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
