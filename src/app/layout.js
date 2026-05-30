import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/common/QueryProvider';
import AuthInitializer from '@/components/common/AuthInitializer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: {
    default: 'NewsHub - Breaking News & Latest Stories',
    template: '%s | NewsHub',
  },
  description: 'Your trusted source for breaking news, in-depth analysis, and the latest stories from around the world.',
  keywords: ['news', 'breaking news', 'latest news', 'world news', 'technology', 'politics', 'sports'],
  authors: [{ name: 'NewsHub' }],
  creator: 'NewsHub',
  publisher: 'NewsHub',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'NewsHub',
    title: 'NewsHub - Breaking News & Latest Stories',
    description: 'Your trusted source for breaking news, in-depth analysis, and the latest stories.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'NewsHub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NewsHub - Breaking News',
    description: 'Your trusted source for breaking news and latest stories.',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthInitializer />
            <Navbar />
            <main className="pt-[88px] min-h-screen">
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '10px', background: '#1f2937', color: '#fff' },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
