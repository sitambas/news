'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const IndicTypingContext = createContext({
  enabled: true,
  setEnabled: () => {},
  toggle: () => {},
});

const STORAGE_KEY = 'cgfile-indic-typing';

export function IndicTypingProvider({ children }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setEnabled(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = () => setEnabled((v) => !v);

  return (
    <IndicTypingContext.Provider value={{ enabled, setEnabled, toggle }}>
      {children}
    </IndicTypingContext.Provider>
  );
}

export function useIndicTyping() {
  return useContext(IndicTypingContext);
}
