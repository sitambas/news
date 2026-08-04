import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/common/QueryProvider';
import AuthInitializer from '@/components/common/AuthInitializer';
import { IndicTypingProvider } from '@/components/ui/IndicTypingProvider';
import GlobalIndicTyping from '@/components/ui/GlobalIndicTyping';
import { getSiteSettings } from '@/lib/siteSettings';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import AdSenseScript from '@/components/ads/AdSenseScript';
import ContentProtection from '@/components/common/ContentProtection';
import { pickAdsConfig } from '@/lib/ads';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: {
    default: 'CGFILE - ब्रेकिंग न्यूज़ और ताज़ा खबरें',
    template: '%s | CGFILE',
  },
  description: 'ब्रेकिंग न्यूज़, गहन विश्लेषण और दुनिया भर की नवीनतम खबरों के लिए आपका विश्वसनीय स्रोत।',
  keywords: ['समाचार', 'ब्रेकिंग न्यूज़', 'ताज़ा खबरें', 'विश्व समाचार', 'तकनीक', 'राजनीति', 'खेल'],
  authors: [{ name: 'CGFILE' }],
  creator: 'CGFILE',
  publisher: 'CGFILE',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'CGFILE',
    title: 'CGFILE - ब्रेकिंग न्यूज़ और ताज़ा खबरें',
    description: 'ब्रेकिंग न्यूज़, गहन विश्लेषण और नवीनतम खबरों के लिए आपका विश्वसनीय स्रोत।',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'CGFILE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CGFILE - ब्रेकिंग न्यूज़',
    description: 'ब्रेकिंग न्यूज़ और ताज़ा खबरों के लिए आपका विश्वसनीय स्रोत।',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const { appDownloadEnabled, googleAnalyticsId } = settings;
  const ads = pickAdsConfig(settings);

  return (
    <html lang="hi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <GoogleAnalytics measurementId={googleAnalyticsId} />
        {ads?.adsEnabled && <AdSenseScript clientId={ads.adsenseClientId} />}
        <ThemeProvider>
          <QueryProvider>
            <IndicTypingProvider>
              <AuthInitializer />
              <ContentProtection />
              <GlobalIndicTyping />
              <Navbar />
            <main className="pt-[88px] min-h-screen">
              {children}
            </main>
            <Footer appDownloadEnabled={appDownloadEnabled} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '10px', background: '#1f2937', color: '#fff' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
              }}
            />
            </IndicTypingProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
