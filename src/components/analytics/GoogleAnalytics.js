'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 (gtag) — measurement ID like G-XXXXXXXXXX
 */
export default function GoogleAnalytics({ measurementId }) {
  const id = (measurementId || '').trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
