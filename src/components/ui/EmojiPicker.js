'use client';

import { useEffect, useRef, useState } from 'react';
import { FiSmile } from 'react-icons/fi';

const EMOJI_GROUPS = [
  {
    label: 'समाचार',
    emojis: ['📰', '📺', '📻', '🗞️', '📡', '🔔', '⚡', '🔥', '⭐', '💬'],
  },
  {
    label: 'श्रेणियाँ',
    emojis: ['🏛️', '💻', '📈', '⚽', '🎬', '❤️', '🔬', '🌍', '🚔', '⚖️'],
  },
  {
    label: 'अन्य',
    emojis: ['🎓', '🏥', '💰', '🌾', '🎭', '✈️', '🏠', '🚗', '🌤️', '🎯', '📱', '🎵', '🍽️', '🛡️', '🏆', '📊'],
  },
];

export default function EmojiPicker({ value = '📰', onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const pick = (emoji) => {
    onChange?.(emoji);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-2xl leading-none">{value || '📰'}</span>
        <span className="flex-1 text-left text-gray-500 dark:text-gray-400">इमोजी चुनें</span>
        <FiSmile className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 right-0 sm:right-auto sm:w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 max-h-64 overflow-y-auto">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-0.5">
                {group.label}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => pick(emoji)}
                    className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                      value === emoji ? 'bg-red-100 dark:bg-red-900/30 ring-1 ring-red-400' : ''
                    }`}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
