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
import NotificationPrompt from '@/components/notifications/NotificationPrompt';
import IndependenceDayTheme from '@/components/theme/IndependenceDayTheme';
import JsonLd, { buildWebsiteJsonLd } from '@/components/seo/JsonLd';
import { pickAdsConfig } from '@/lib/ads';
import { isIndependenceDay } from '@/lib/independenceDay';
import { siteMetadata } from '@/lib/seoMetadata';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = siteMetadata;

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const { appDownloadEnabled, googleAnalyticsId } = settings;
  const ads = pickAdsConfig(settings);
  const aug15 = isIndependenceDay();

  return (
    <html lang="hi" className={aug15 ? 'theme-15aug' : undefined} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <JsonLd data={buildWebsiteJsonLd()} />
        <GoogleAnalytics measurementId={googleAnalyticsId} />
        {ads?.adsEnabled && <AdSenseScript clientId={ads.adsenseClientId} />}
        <ThemeProvider>
          <QueryProvider>
            <IndicTypingProvider>
              <AuthInitializer />
              <ContentProtection />
              <NotificationPrompt />
              <IndependenceDayTheme />
              <GlobalIndicTyping />
              <Navbar />
            <main className={`main-shell min-h-screen ${aug15 ? 'pt-[124px]' : 'pt-[88px]'}`}>
              {children}
            </main>
            <Footer appDownloadEnabled={appDownloadEnabled} ads={ads} />
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
