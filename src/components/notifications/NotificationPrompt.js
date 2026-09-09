'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'cgfile_notif_prompt';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // ask again after 7 days if declined
const SHOW_DELAY_MS = 2500;

function shouldSkipPath(pathname) {
  if (!pathname) return true;
  if (pathname.startsWith('/admin')) return true;
  if (pathname.startsWith('/auth')) return true;
  return false;
}

function readPromptState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writePromptState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    return null;
  }
}

/**
 * Soft notification permission prompt (browser-style banner).
 * Asks before the native permission dialog — YES triggers Notification.requestPermission().
 */
export default function NotificationPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldSkipPath(pathname)) {
      setVisible(false);
      return undefined;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return undefined;
    }

    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return undefined;
    }

    const saved = readPromptState();
    if (saved?.status === 'accepted') return undefined;
    if (saved?.status === 'declined' && saved.at && Date.now() - saved.at < SNOOZE_MS) {
      return undefined;
    }

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const dismiss = (status) => {
    writePromptState({ status, at: Date.now() });
    setVisible(false);
  };

  const handleNo = () => {
    dismiss('declined');
  };

  const handleYes = async () => {
    setVisible(false);
    try {
      await registerServiceWorker();
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        writePromptState({ status: 'accepted', at: Date.now() });
        try {
          new Notification('CGFILE', {
            body: 'आपको अब ताज़ा खबरों की सूचनाएँ मिलेंगी।',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'cgfile-welcome',
          });
        } catch {
          // Some browsers require service worker showNotification
          const reg = await navigator.serviceWorker?.ready;
          await reg?.showNotification?.('CGFILE', {
            body: 'आपको अब ताज़ा खबरों की सूचनाएँ मिलेंगी।',
            icon: '/favicon.ico',
            tag: 'cgfile-welcome',
          });
        }
      } else {
        writePromptState({ status: 'declined', at: Date.now() });
      }
    } catch {
      writePromptState({ status: 'declined', at: Date.now() });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Notification permission"
          aria-modal="false"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed top-3 left-1/2 z-[100] w-[min(100%-1.5rem,420px)] -translate-x-1/2"
        >
          <div className="rounded-md bg-[#8B1538] text-white shadow-xl shadow-black/25 ring-1 ring-black/10 overflow-hidden">
            <div className="flex items-start gap-3 p-3 sm:p-3.5">
              <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-md bg-white flex items-center justify-center shadow-sm">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-black text-[11px] sm:text-xs tracking-tight">CG</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[15px] font-semibold leading-tight tracking-tight">
                  CG<span className="text-red-200">FILE</span>
                </p>
                <p className="mt-1 text-[12px] sm:text-[13px] text-white/90 leading-snug">
                  Would you like to receive notifications on latest updates?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-3 pb-3">
              <button
                type="button"
                onClick={handleNo}
                className="min-w-[72px] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-sm bg-[#6F102C] text-white/95 hover:bg-[#5a0d24] transition-colors"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleYes}
                className="min-w-[72px] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-sm bg-black text-white hover:bg-gray-900 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
