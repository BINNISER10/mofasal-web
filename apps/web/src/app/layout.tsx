import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { SmartAdvisor } from '@/components/shared/SmartAdvisor';
import { Toaster } from 'react-hot-toast';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'مفصل | MUFASAL - Premium Tailoring & Fabric Marketplace',
  description: 'منصتك المتكاملة للخياطة الراقية وبيع الأقمشة. أسهل طريقة لطلب خياطة ملابسك مع أفضل الخياطين.',
  keywords: ['خياطة', 'أقمشة', 'ملابس رجالية', 'ملابس أطفال', 'تفصيل', 'MUFASAL', 'مفصل'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'مفصل | MUFASAL',
    description: 'Premium Tailoring & Fabric Marketplace',
    locale: 'ar_SA',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00373E' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibmPlexArabic.variable} ${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="مفصل" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        {/* Anti-FOUC: apply saved theme before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mufasal-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
          }}
        />
      </head>
      <body className="font-arabic antialiased bg-white text-[var(--text-primary)] transition-colors duration-300 leading-relaxed">
        <ThemeProvider>
          {children}
          <SmartAdvisor />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'inherit', direction: 'rtl' },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
