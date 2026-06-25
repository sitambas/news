'use client';

import { FiType } from 'react-icons/fi';
import { useIndicTyping } from './IndicTypingProvider';
import { useEffect, useState } from 'react';

export default function IndicTypingToggle({ className = '', compact = false }) {
  const { enabled, toggle } = useIndicTyping();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={`w-9 h-9 ${className}`} />;

  return (
    <button
      type="button"
      onClick={toggle}
      title={enabled ? 'हिंदी टाइपिंग बंद करें' : 'हिंदी टाइपिंग चालू करें'}
      aria-label={enabled ? 'Disable Hindi typing' : 'Enable Hindi typing'}
      aria-pressed={enabled}
      className={`flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
        compact ? 'p-2' : 'px-2.5 py-1.5'
      } ${
        enabled
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${className}`}
    >
      <FiType className="w-4 h-4" />
      {!compact && <span className="hidden sm:inline">{enabled ? 'हिंदी ⌨' : 'EN ⌨'}</span>}
    </button>
  );
}
