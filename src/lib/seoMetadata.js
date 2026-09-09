import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
  getDefaultOgImage,
} from '@/constants/seo';

const siteUrl = absoluteUrl('/');
const ogImage = getDefaultOgImage();

export const siteMetadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cgfile.in'),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'news',
  alternates: {
    canonical: siteUrl,
    languages: { 'hi-IN': siteUrl },
    types: {
      'application/rss+xml': absoluteUrl('/rss.xml'),
    },
  },
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: siteUrl,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'CGFILE - ब्रेकिंग न्यूज़',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [ogImage],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};
