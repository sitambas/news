'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiUserCheck, FiUserX, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { formatDate, formatNumber } from '@/utils/helpers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ROLE_HINDI = { admin: 'व्यवस्थापक', editor: 'संपादक', author: 'लेखक', user: 'उपयोगकर्ता' };

const ROLE_STYLES = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  author: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  user: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

async function fetchUsers(role) {
  const params = new URLSearchParams({ limit: '100', sort: '-createdAt' });
  if (role && role !== 'सभी') params.set('role', role);
  const res = await fetch(`/api/admin/users?${params}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load users');
  return data.data || [];
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('सभी');
  const [updatingId, setUpdatingId] = useState(null);

  const { data: users = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: () => fetchUsers(roleFilter),
  });

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    staff: users.filter((u) => ['admin', 'editor', 'author'].includes(u.role)).length,
    newThisWeek: users.filter((u) => {
      const created = new Date(u.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length,
  };

  const updateUser = async (userId, payload, successMsg) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(successMsg);
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      } else {
        toast.error(data.message || 'अपडेट विफल');
      }
    } catch {
      toast.error('अपडेट विफल');
    }
    setUpdatingId(null);
  };

  const toggleActive = (user) => {
    updateUser(user._id, { isActive: !user.isActive }, user.isActive ? 'उपयोगकर्ता निष्क्रिय किया' : 'उपयोगकर्ता सक्रिय किया');
  };

  const changeRole = (user) => {
    const roles = ['user', 'author', 'editor', 'admin'];
    const current = roles.indexOf(user.role);
    const next = roles[(current + 1) % roles.length];
    if (window.confirm(`${user.name} की भूमिका बदलकर ${ROLE_HINDI[next]} करें?`)) {
      updateUser(user._id, { role: next }, 'भूमिका अपडेट की');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`क्या आप वाकई ${user.name} को हटाना चाहते हैं?`)) return;
    setUpdatingId(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('उपयोगकर्ता हटाया गया');
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      } else {
        toast.error(data.message || 'हटाने में विफल');
      }
    } catch {
      toast.error('हटाने में विफल');
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">उपयोगकर्ता</h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          रीफ़्रेश
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'कुल उपयोगकर्ता', value: formatNumber(stats.total), color: 'text-blue-600' },
          { label: 'सक्रिय', value: formatNumber(stats.active), color: 'text-green-600' },
          { label: 'इस सप्ताह नए', value: formatNumber(stats.newThisWeek), color: 'text-purple-600' },
          { label: 'स्टाफ (लेखक+)', value: formatNumber(stats.staff), color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <div className={`text-xl font-bold ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="उपयोगकर्ता खोजें..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['सभी', 'admin', 'editor', 'author', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                roleFilter === r ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {r === 'सभी' ? r : ROLE_HINDI[r] || r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            <p>उपयोगकर्ता लोड करने में विफल</p>
            <button onClick={() => refetch()} className="mt-2 text-sm underline">पुनः प्रयास करें</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-medium">उपयोगकर्ता</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">ईमेल</th>
                  <th className="px-4 py-3 text-left font-medium">भूमिका</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">स्थिति</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">जुड़े</th>
                  <th className="px-4 py-3 text-right font-medium">क्रियाएं</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-sm overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name?.[0] || '?'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => changeRole(user)}
                        disabled={updatingId === user._id}
                        title="भूमिका बदलने के लिए क्लिक करें"
                        className={`text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 ${ROLE_STYLES[user.role]}`}
                      >
                        {ROLE_HINDI[user.role] || user.role}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                      }`}>
                        {user.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleActive(user)}
                          disabled={updatingId === user._id}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            user.isActive
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.isActive ? 'निष्क्रिय करें' : 'सक्रिय करें'}
                        >
                          {user.isActive ? <FiUserX className="w-3.5 h-3.5" /> : <FiUserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={updatingId === user._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="हटाएं"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>कोई उपयोगकर्ता नहीं मिला</p>
          </div>
        )}
      </div>
    </div>
  );
}
