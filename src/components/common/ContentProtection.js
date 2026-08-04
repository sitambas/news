'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  const el = target.closest('input, textarea, select, [contenteditable="true"]');
  return Boolean(el);
}

function isProtectedPath(pathname) {
  if (!pathname) return true;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/auth')) return false;
  return true;
}

/**
 * Soft content protection for public pages:
 * blocks casual copy/paste, right-click save, and image drag.
 * Does not affect admin/auth, or form fields (comments, search, login).
 */
export default function ContentProtection() {
  const pathname = usePathname();
  const enabled = isProtectedPath(pathname);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('content-protected');
      return undefined;
    }

    document.body.classList.add('content-protected');

    const blockIfNotEditable = (e) => {
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      return false;
    };

    const onKeyDown = (e) => {
      if (isEditableTarget(e.target)) return;
      const key = e.key?.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      // Block common copy / select-all / save / view-source shortcuts
      if (['c', 'x', 'a', 's', 'u', 'p'].includes(key)) {
        e.preventDefault();
      }
    };

    const onDragStart = (e) => {
      const t = e.target;
      if (t instanceof HTMLImageElement || t?.closest?.('img, picture, [data-protect-media]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', blockIfNotEditable);
    document.addEventListener('copy', blockIfNotEditable);
    document.addEventListener('cut', blockIfNotEditable);
    document.addEventListener('paste', blockIfNotEditable);
    document.addEventListener('selectstart', blockIfNotEditable);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('content-protected');
      document.removeEventListener('contextmenu', blockIfNotEditable);
      document.removeEventListener('copy', blockIfNotEditable);
      document.removeEventListener('cut', blockIfNotEditable);
      document.removeEventListener('paste', blockIfNotEditable);
      document.removeEventListener('selectstart', blockIfNotEditable);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled]);

  return null;
}
