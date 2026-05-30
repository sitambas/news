'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiAtSign, FiTwitter, FiFacebook, FiLinkedin, FiGlobe, FiSave, FiCamera, FiBell, FiLock } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SAMPLE_ARTICLES } from '@/utils/sampleData';
import ArticleCard from '@/components/news/ArticleCard';

const TABS = ['Profile', 'Security', 'Notifications', 'My Articles'];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState('Profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    avatar: '',
    social: { twitter: '', facebook: '', linkedin: '', website: '' },
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        social: {
          twitter: user.social?.twitter || '',
          facebook: user.social?.facebook || '',
          linkedin: user.social?.linkedin || '',
          website: user.social?.website || '',
        },
      });
    }
  }, [user]);

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const updateSocial = (field, val) => setForm((p) => ({ ...p, social: { ...p.social, [field]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        toast.success('Profile updated!');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const inputClass = 'w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-3xl overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0] || 'U'
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700">
                <FiCamera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">@{user?.username}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full capitalize">
                {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-red-400 hover:text-red-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'Profile' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Your name"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="email" value={user?.email || ''} disabled className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  placeholder="Tell readers about yourself..."
                  rows={3}
                  maxLength={500}
                  className={`${inputClass} resize-none`}
                />
                <div className="text-right text-xs text-gray-400 mt-0.5">{form.bio.length}/500</div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Avatar URL</label>
                <input
                  type="url"
                  value={form.avatar}
                  onChange={(e) => update('avatar', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className={inputClass}
                />
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { field: 'twitter', icon: FiTwitter, placeholder: '@username' },
                { field: 'facebook', icon: FiFacebook, placeholder: 'facebook.com/username' },
                { field: 'linkedin', icon: FiLinkedin, placeholder: 'linkedin.com/in/username' },
                { field: 'website', icon: FiGlobe, placeholder: 'https://yoursite.com' },
              ].map(({ field, icon: Icon, placeholder }) => (
                <div key={field} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={field === 'website' || field === 'linkedin' || field === 'facebook' ? 'url' : 'text'}
                    value={form.social[field]}
                    onChange={(e) => updateSocial(field, e.target.value)}
                    placeholder={placeholder}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <LoadingSpinner size="sm" /> : <FiSave className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'Security' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Security Settings</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className={inputClass} />
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                <FiLock className="w-4 h-4" /> Update Password
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'Notifications' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: 'Email notifications', desc: 'Receive updates via email' },
                { label: 'Push notifications', desc: 'Browser push notifications' },
                { label: 'Newsletter', desc: 'Weekly newsletter digest' },
                { label: 'Comment replies', desc: 'When someone replies to your comment' },
                { label: 'New articles in my categories', desc: 'Get notified about new content' },
              ].map(({ label, desc }) => (
                <label key={label} className="flex items-center justify-between cursor-pointer py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                  <button className="w-10 h-5 rounded-full bg-red-600 relative flex-shrink-0">
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* My Articles Tab */}
        {tab === 'My Articles' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {SAMPLE_ARTICLES.slice(0, 4).map((article, i) => (
                <ArticleCard key={i} article={article} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
