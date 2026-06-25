'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { getReporterLocations } from '@/utils/reporter';
import IndicInput, { INDIC_TRIGGER_KEYS_NO_ENTER } from '@/components/ui/IndicInput';
import IndicTextarea from '@/components/ui/IndicTextarea';
import AiWriteButton, { FieldLabelWithAi } from '@/components/ui/AiWriteButton';

async function fetchReporters() {
  const res = await fetch('/api/reporters?all=1');
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to load reporters');
  return data.data || [];
}

function ReporterForm({ reporter, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: reporter?.name || '',
    bio: reporter?.bio || '',
    order: reporter?.order ?? 0,
    isActive: reporter?.isActive !== false,
    locations: getReporterLocations(reporter),
  }));
  const [locationInput, setLocationInput] = useState('');
  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const commitLocation = () => {
    const loc = locationInput.trim();
    if (!loc) return;
    if (!form.locations.includes(loc) && form.locations.length < 20) {
      update('locations', [...form.locations, loc]);
    }
    setLocationInput('');
  };

  const addLocation = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitLocation();
    }
  };

  const removeLocation = (loc) => update('locations', form.locations.filter((l) => l !== loc));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">
        {reporter ? 'रिपोर्टर संपादित करें' : 'नया रिपोर्टर'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">नाम *</label>
          <IndicInput
            type="text"
            value={form.name}
            onChange={(val) => update('name', val)}
            placeholder="अमित श्रीवास्तव"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            लोकेशन (Space = हिंदी, Enter = जोड़ें)
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.locations.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
              >
                {loc}
                <button type="button" onClick={() => removeLocation(loc)} className="text-gray-400 hover:text-red-600">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <IndicInput
              type="text"
              value={locationInput}
              onChange={setLocationInput}
              onKeyDown={addLocation}
              triggerKeys={INDIC_TRIGGER_KEYS_NO_ENTER}
              placeholder="मनेन्द्रगढ़, रायपुर..."
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={commitLocation}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="लोकेशन जोड़ें"
            >
              <FiPlus className="w-4 h-4" />
            </button>
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
                type="reporter_bio"
                context={{ name: form.name, locations: form.locations }}
                onResult={(text) => update('bio', text)}
                disabled={!form.name?.trim()}
              />
            }
          />
          <IndicTextarea
            value={form.bio}
            onChange={(val) => update('bio', val)}
            placeholder="रिपोर्टर का संक्षिप्त परिचय..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isActive}
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

export default function AdminReportersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: reporters = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-reporters'],
    queryFn: fetchReporters,
  });

  const handleSave = async (form) => {
    if (!form.name?.trim()) {
      toast.error('नाम आवश्यक है');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/reporters/${editing._id}` : '/api/reporters', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editing ? 'रिपोर्टर अपडेट हुआ' : 'रिपोर्टर जोड़ा गया');
        setShowForm(false);
        setEditing(null);
        queryClient.invalidateQueries({ queryKey: ['admin-reporters'] });
      } else {
        toast.error(data.message || 'सहेजने में विफल');
      }
    } catch {
      toast.error('सहेजने में विफल');
    }
    setSaving(false);
  };

  const handleDelete = async (reporter) => {
    if (!window.confirm(`क्या आप वाकई "${reporter.name}" हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch(`/api/reporters/${reporter._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('रिपोर्टर हटाया गया');
        queryClient.invalidateQueries({ queryKey: ['admin-reporters'] });
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">रिपोर्टर</h1>
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700"
          >
            <FiPlus className="w-4 h-4" /> नया रिपोर्टर
          </button>
        </div>
      </div>

      {showForm && (
        <ReporterForm
          reporter={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">रिपोर्टर लोड करने में विफल</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left font-medium">नाम</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">लोकेशन</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">क्रम</th>
                <th className="px-4 py-3 text-left font-medium">स्थिति</th>
                <th className="px-4 py-3 text-right font-medium">क्रियाएं</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {reporters.map((reporter) => (
                <tr key={reporter._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{reporter.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{reporter._id}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500">
                    {getReporterLocations(reporter).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{reporter.order}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      reporter.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                    }`}>
                      {reporter.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing(reporter); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"
                        title="Edit"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(reporter)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                        title="Delete"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && reporters.length === 0 && (
          <div className="text-center py-12 text-gray-500">कोई रिपोर्टर नहीं — पहला रिपोर्टर जोड़ें</div>
        )}
      </div>
      {saving && <p className="text-xs text-gray-400">सहेजा जा रहा है...</p>}
    </div>
  );
}
