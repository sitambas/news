'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isIndependenceDay } from '@/lib/independenceDay';

function AshokaChakra({ className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="6" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 24;
        const x2 = 50 + Math.cos(a) * 42;
        const y2 = 50 + Math.sin(a) * 42;
        return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="currentColor" strokeWidth="2.5" />;
      })}
    </svg>
  );
}

/**
 * Applies html.theme-15aug from 15–17 Aug IST and shows a festive strip.
 * Hidden on admin/auth.
 */
export default function IndependenceDayTheme() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const on = isIndependenceDay();
    setActive(on);
    document.documentElement.classList.toggle('theme-15aug', on);
    return () => {
      document.documentElement.classList.remove('theme-15aug');
    };
  }, []);

  if (!active) return null;
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) return null;

  return (
    <div className="fixed top-[88px] left-0 right-0 z-40 pointer-events-none" aria-hidden="false">
      <div className="pointer-events-auto bg-gradient-to-r from-[#FF9933] via-white to-[#138808] border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center gap-2 sm:gap-3 text-center">
          <AshokaChakra className="w-4 h-4 sm:w-5 sm:h-5 text-[#000080] flex-shrink-0" />
          <p className="text-[11px] sm:text-sm font-semibold text-gray-900 leading-snug">
            <span className="text-[#BF360C]">स्वतंत्रता दिवस</span>
            {' '}की हार्दिक शुभकामनाएँ —{' '}
            <span className="font-black tracking-tight">
              CG<span className="text-red-600">FILE</span>
            </span>
          </p>
          <AshokaChakra className="w-4 h-4 sm:w-5 sm:h-5 text-[#000080] flex-shrink-0 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
