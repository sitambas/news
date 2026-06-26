'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import IndicInput from '@/components/ui/IndicInput';
import IndicTextarea from '@/components/ui/IndicTextarea';
import EmojiPicker from '@/components/ui/EmojiPicker';
import AiWriteButton, { FieldLabelWithAi } from '@/components/ui/AiWriteButton';

async function fetchCategories() {
  const res = await fetch('/api/categories?all=1');
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load categories');
  return data.data || [];
}

function CategoryForm({ category, onSave, onCancel }) {
  const [form, setForm] = useState(
    category || { name: '', slug: '', description: '', color: '#3B82F6', icon: '📰', order: 0, isActive: true }
  );
  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">
        {category ? 'श्रेणी संपादित करें' : 'नई श्रेणी'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!category && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              स्लग (अंग्रेज़ी, जैसे politics)
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="politics"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">नाम (हिंदी)</label>
          <IndicInput
            type="text"
            value={form.name}
            onChange={(val) => update('name', val)}
            placeholder="राजनीति"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">आइकन (इमोजी)</label>
          <EmojiPicker value={form.icon} onChange={(emoji) => update('icon', emoji)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">रंग</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.color}
              onChange={(e) => update('color', e.target.value)}
              className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
            />
            <input
              type="text"
              value={form.color}
              onChange={(e) => update('color', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">क्रम</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => update('order', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabelWithAi
            label="विवरण (हिंदी)"
            aiButton={
              <AiWriteButton
                type="category_description"
                context={{ name: form.name, slug: form.slug }}
                onResult={(text) => update('description', text)}
                disabled={!form.name?.trim()}
              />
            }
          />
          <IndicTextarea
            value={form.description}
            onChange={(val) => update('description', val)}
            placeholder="राजनीतिक समाचार और विश्लेषण"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{(form.description || '').length}/500</p>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isActive !== false}
              onChange={(e) => update('isActive', e.target.checked)}
              className="rounded border-gray-300"
            />
            सक्रिय
          </label>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiSave className="w-4 h-4" /> सहेजें
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <FiX className="w-4 h-4" /> रद्द करें
        </button>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  });

  const handleSave = async (form) => {
    if (!form.name?.trim()) {
      toast.error('नाम आवश्यक है');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description || '',
      color: form.color,
      icon: form.icon,
      order: form.order ?? 0,
      isActive: form.isActive !== false,
    };
    if (!editing) payload.slug = form.slug;

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/categories/${encodeURIComponent(editing.slug)}` : '/api/categories',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(editing ? 'श्रेणी अपडेट हुई' : 'श्रेणी बनाई गई');
        setShowForm(false);
        setEditing(null);
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      } else {
        toast.error(data.message || 'सहेजने में विफल');
      }
    } catch {
      toast.error('सहेजने में विफल');
    }
    setSaving(false);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`क्या आप "${category.name}" हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(category.slug)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('श्रेणी हटाई गई');
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      } else {
        toast.error(data.message || 'हटाने में विफल');
      }
    } catch {
      toast.error('हटाने में विफल');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">श्रेणियाँ</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" /> नई श्रेणी
          </button>
        </div>
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">श्रेणियाँ लोड करने में विफल</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(cat); setShowForm(true); }}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  >
                    <FiEdit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{cat.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400">/{cat.slug}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                  {cat.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {saving && <p className="text-xs text-gray-400">सहेजा जा रहा है...</p>}
    </div>
  );
}
