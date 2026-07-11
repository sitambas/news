'use client';

import { useEffect, useState } from 'react';
import { FiZap, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const WORD_PRESETS = [300, 500, 800, 1000, 1200, 1500];
const DEFAULT_WORDS = {
  article_content: 800,
  article_excerpt: 80,
};

function needsWordPopup(type) {
  return type === 'article_content' || type === 'article_excerpt';
}

export default function AiWriteButton({
  type,
  context = {},
  onResult,
  disabled,
  label = 'AI से लिखें',
  className = '',
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [wordCount, setWordCount] = useState(DEFAULT_WORDS[type] || 800);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const runAi = async (words) => {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          context: {
            ...context,
            wordCount: words,
          },
        }),
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

  const handleClick = () => {
    if (needsWordPopup(type)) {
      setWordCount(DEFAULT_WORDS[type] || 800);
      setOpen(true);
      return;
    }
    runAi(undefined);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const words = Math.min(2000, Math.max(50, Number(wordCount) || DEFAULT_WORDS[type] || 800));
    runAi(words);
  };

  return (
    <>
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

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI शब्द संख्या</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  कितने शब्दों में लिखना है?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  शब्द संख्या
                </label>
                <input
                  type="number"
                  min={50}
                  max={2000}
                  step={50}
                  value={wordCount}
                  onChange={(e) => setWordCount(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">50 से 2000 तक</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {WORD_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setWordCount(n)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                      Number(wordCount) === n
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium"
                >
                  लिखें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
