'use client';

import Script from 'next/script';

/**
 * Loads Google AdSense script once when publisher ID is set (ca-pub-XXXX).
 */
export default function AdSenseScript({ clientId }) {
  const id = (clientId || '').trim();
  if (!id || !/^ca-pub-\d+$/i.test(id)) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
