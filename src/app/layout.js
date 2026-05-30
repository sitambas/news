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
    default: 'न्यूज़हब - ब्रेकिंग न्यूज़ और ताज़ा खबरें',
    template: '%s | न्यूज़हब',
  },
  description: 'ब्रेकिंग न्यूज़, गहन विश्लेषण और दुनिया भर की नवीनतम खबरों के लिए आपका विश्वसनीय स्रोत।',
  keywords: ['समाचार', 'ब्रेकिंग न्यूज़', 'ताज़ा खबरें', 'विश्व समाचार', 'तकनीक', 'राजनीति', 'खेल'],
  authors: [{ name: 'न्यूज़हब' }],
  creator: 'न्यूज़हब',
  publisher: 'न्यूज़हब',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'न्यूज़हब',
    title: 'न्यूज़हब - ब्रेकिंग न्यूज़ और ताज़ा खबरें',
    description: 'ब्रेकिंग न्यूज़, गहन विश्लेषण और नवीनतम खबरों के लिए आपका विश्वसनीय स्रोत।',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'न्यूज़हब' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'न्यूज़हब - ब्रेकिंग न्यूज़',
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

export default function RootLayout({ children }) {
  return (
    <html lang="hi" suppressHydrationWarning>
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
