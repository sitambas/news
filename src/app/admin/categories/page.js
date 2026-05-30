'use client';

import { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const INITIAL_CATEGORIES = [
  { _id: '1', name: 'Politics', slug: 'politics', color: '#EF4444', icon: '🏛️', description: 'Political news and analysis', order: 1, isActive: true },
  { _id: '2', name: 'Technology', slug: 'technology', color: '#3B82F6', icon: '💻', description: 'Tech news and innovations', order: 2, isActive: true },
  { _id: '3', name: 'Business', slug: 'business', color: '#10B981', icon: '📈', description: 'Business and finance', order: 3, isActive: true },
  { _id: '4', name: 'Science', slug: 'science', color: '#8B5CF6', icon: '🔬', description: 'Scientific discoveries', order: 4, isActive: true },
  { _id: '5', name: 'Sports', slug: 'sports', color: '#F59E0B', icon: '⚽', description: 'Sports and athletics', order: 5, isActive: true },
  { _id: '6', name: 'Entertainment', slug: 'entertainment', color: '#EC4899', icon: '🎬', description: 'Entertainment and pop culture', order: 6, isActive: true },
  { _id: '7', name: 'Health', slug: 'health', color: '#06B6D4', icon: '❤️', description: 'Health and wellness', order: 7, isActive: true },
  { _id: '8', name: 'World', slug: 'world', color: '#6366F1', icon: '🌍', description: 'International news', order: 8, isActive: true },
];

function CategoryForm({ category, onSave, onCancel }) {
  const [form, setForm] = useState(category || { name: '', description: '', color: '#3B82F6', icon: '📰', order: 0 });
  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">{category ? 'Edit Category' : 'New Category'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Icon (emoji)</label>
          <input
            type="text"
            value={form.icon}
            onChange={(e) => update('icon', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Color</label>
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
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sort Order</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => update('order', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => { onSave(form); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiSave className="w-4 h-4" /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <FiX className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleSave = (data) => {
    if (editingId) {
      setCategories((prev) => prev.map((c) => c._id === editingId ? { ...c, ...data } : c));
      toast.success('Category updated');
    } else {
      setCategories((prev) => [...prev, { ...data, _id: Date.now().toString(), slug: data.name.toLowerCase().replace(/\s+/g, '-'), isActive: true }]);
      toast.success('Category created');
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this category?')) {
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success('Category deleted');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" /> New Category
        </button>
      </div>

      {showForm && (
        <CategoryForm
          category={editingId ? categories.find((c) => c._id === editingId) : null}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingId(cat._id); setShowForm(true); }}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                >
                  <FiEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
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
                {cat.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
