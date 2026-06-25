'use client';

import { useState } from 'react';
import { FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AiWriteButton({
  type,
  context = {},
  onResult,
  disabled,
  label = 'AI से लिखें',
  className = '',
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context }),
      });
      const data = await res.json();
      if (data.success && data.data?.text) {
        onResult?.(data.data.text, data.data);
        toast.success('AI ने टेक्स्ट लिख दिया');
      } else {
        toast.error(data.message || 'AI लेखन विफल');
      }
    } catch {
      toast.error('AI सेवा उपलब्ध नहीं है');
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      title={label}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <FiZap className={`w-3 h-3 ${loading ? 'animate-pulse' : ''}`} />
      {loading ? 'लिख रहा है...' : label}
    </button>
  );
}

export function FieldLabelWithAi({ label, children, aiButton }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-1">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {aiButton}
    </div>
  );
}
