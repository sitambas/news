'use client';

import { useState } from 'react';
import { FiSearch, FiMoreVertical, FiUserCheck, FiUserX, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { formatDate } from '@/utils/helpers';

const SAMPLE_USERS = [
  { _id: '1', name: 'Sarah Johnson', username: 'sarahjohnson', email: 'sarah@example.com', role: 'author', isActive: true, createdAt: new Date('2023-06-15') },
  { _id: '2', name: 'Mike Chen', username: 'mikechen', email: 'mike@example.com', role: 'editor', isActive: true, createdAt: new Date('2023-04-20') },
  { _id: '3', name: 'Emma Davis', username: 'emmadavis', email: 'emma@example.com', role: 'user', isActive: true, createdAt: new Date('2024-01-10') },
  { _id: '4', name: 'Alex Turner', username: 'alexturner', email: 'alex@example.com', role: 'author', isActive: false, createdAt: new Date('2023-11-05') },
  { _id: '5', name: 'Lisa Park', username: 'lisapark', email: 'lisa@example.com', role: 'user', isActive: true, createdAt: new Date('2024-03-22') },
  { _id: '6', name: 'Tom Brown', username: 'tombrown', email: 'tom@example.com', role: 'admin', isActive: true, createdAt: new Date('2022-09-01') },
];

const ROLE_STYLES = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  author: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  user: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = SAMPLE_USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
          <FiPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '48,320', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
          { label: 'Active Today', value: '1,243', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
          { label: 'New This Week', value: '87', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
          { label: 'Admins/Editors', value: '12', color: 'bg-red-50 dark:bg-red-900/20 text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <div className={`text-xl font-bold ${s.color.split(' ')[2]} mb-0.5`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'admin', 'editor', 'author', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                roleFilter === r ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Status</th>
              <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-sm">
                      {user.name[0]}
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
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_STYLES[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <FiEdit className="w-3.5 h-3.5" />
                    </button>
                    <button className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                      {user.isActive ? <FiUserX className="w-3.5 h-3.5" /> : <FiUserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
