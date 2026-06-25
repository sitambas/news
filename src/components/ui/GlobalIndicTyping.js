'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getTransliterateSuggestions } from 'react-transliterate';
import 'react-transliterate/dist/index.css';
import { useIndicTyping } from './IndicTypingProvider';

const SKIP_TYPES = new Set([
  'password', 'email', 'number', 'tel', 'url', 'hidden', 'checkbox', 'radio',
  'file', 'date', 'datetime-local', 'time', 'month', 'week', 'color', 'range',
  'button', 'submit', 'reset',
]);

function isEligible(el) {
  if (!el || el.dataset.indicManaged === 'true' || el.dataset.noIndic === 'true') return false;
  if (el.disabled || el.readOnly) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea') return true;
  if (tag !== 'input') return false;
  return !SKIP_TYPES.has((el.type || 'text').toLowerCase());
}

function getWordAtCaret(el) {
  const value = el.value;
  const caret = el.selectionStart ?? value.length;
  const indexOfLastSpace = Math.max(
    value.lastIndexOf(' ', caret - 1),
    value.lastIndexOf('\n', caret - 1)
  );
  const start = indexOfLastSpace + 1;
  const word = value.slice(start, caret);
  return { start, end: caret - 1, word, caret };
}

export default function GlobalIndicTyping() {
  const { enabled } = useIndicTyping();
  const stateRef = useRef({
    activeEl: null,
    options: [],
    selection: 0,
    matchStart: 0,
    matchEnd: 0,
    position: { top: 0, left: 0 },
  });
  const listRef = useRef(null);
  const rafRef = useRef(null);

  const renderList = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const { options, selection, position } = stateRef.current;

    if (!options.length) {
      list.style.display = 'none';
      return;
    }

    list.style.display = 'block';
    list.style.top = `${position.top}px`;
    list.style.left = `${position.left}px`;
    list.innerHTML = options
      .map(
        (item, i) =>
          `<li class="${i === selection ? '_Active_1b0d4b' : ''}" data-index="${i}">${item}</li>`
      )
      .join('');
  }, []);

  const clearSuggestions = useCallback(() => {
    stateRef.current.options = [];
    stateRef.current.selection = 0;
    renderList();
  }, [renderList]);

  const applySuggestion = useCallback((text, addSpace = true) => {
    const el = stateRef.current.activeEl;
    if (!el) return;

    const value = el.value;
    const { matchStart, matchEnd } = stateRef.current;
    const suffix = addSpace ? ' ' : '';
    const newValue = value.slice(0, matchStart) + text + suffix + value.slice(matchEnd + 1);
    const caretPos = matchStart + text.length + (addSpace ? 1 : 0);

    el.value = newValue;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.setSelectionRange(caretPos, caretPos);
    clearSuggestions();
  }, [clearSuggestions]);

  const updateSuggestions = useCallback(async (el) => {
    const { start, end, word } = getWordAtCaret(el);
    if (!word || !/[a-zA-Z]/.test(word)) {
      clearSuggestions();
      return;
    }

    const suggestions = await getTransliterateSuggestions(word, { lang: 'hi', numOptions: 5 });
    if (stateRef.current.activeEl !== el) return;

    const rect = el.getBoundingClientRect();
    stateRef.current.matchStart = start;
    stateRef.current.matchEnd = end;
    stateRef.current.options = suggestions;
    stateRef.current.selection = 0;
    stateRef.current.position = {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    };
    renderList();
  }, [clearSuggestions, renderList]);

  useEffect(() => {
    if (!enabled) {
      stateRef.current.activeEl = null;
      clearSuggestions();
      return;
    }

    const handleFocusIn = (e) => {
      if (isEligible(e.target)) {
        stateRef.current.activeEl = e.target;
      }
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        if (listRef.current?.matches(':hover')) return;
        stateRef.current.activeEl = null;
        clearSuggestions();
      }, 120);
    };

    const handleInput = (e) => {
      if (!isEligible(e.target) || stateRef.current.activeEl !== e.target) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => updateSuggestions(e.target));
    };

    const handleKeyDown = (e) => {
      const el = e.target;
      if (!isEligible(el) || stateRef.current.activeEl !== el) return;

      const { options, selection } = stateRef.current;
      if (!options.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        stateRef.current.selection = (selection + 1) % options.length;
        renderList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stateRef.current.selection = (options.length + selection - 1) % options.length;
        renderList();
      } else if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(options[stateRef.current.selection], e.key === ' ');
      } else if (e.key === 'Escape') {
        clearSuggestions();
      }
    };

    const handleListMouseDown = (e) => {
      const li = e.target.closest('li[data-index]');
      if (!li || !listRef.current?.contains(li)) return;
      e.preventDefault();
      const index = parseInt(li.dataset.index, 10);
      applySuggestion(stateRef.current.options[index], true);
    };

    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    document.addEventListener('input', handleInput, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleListMouseDown, true);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleListMouseDown, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, applySuggestion, clearSuggestions, renderList, updateSuggestions]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <ul
      ref={listRef}
      className="_ReactTransliterate_1b0d4b"
      style={{
        display: 'none',
        position: 'absolute',
        zIndex: 99999,
        minWidth: 120,
      }}
    />,
    document.body
  );
}
