import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { SmartAdvisor } from '@/components/shared/SmartAdvisor';
import { Toaster } from 'react-hot-toast';
import siteConfig from '@/data/site-config.json';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mufasal.onrender.com';

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
  metadataBase: new URL(APP_URL),
  title: {
    default: siteConfig.seo.titleAr,
    template: '%s | مفصل',
  },
  description: siteConfig.seo.descriptionAr,
  keywords: [...siteConfig.seo.keywordsAr, ...siteConfig.seo.keywordsEn],
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
    languages: {
      'ar-SA': '/',
      'en-US': '/',
    },
  },
  openGraph: {
    title: siteConfig.seo.titleAr,
    description: siteConfig.seo.descriptionAr,
    url: APP_URL,
    siteName: 'مفصل MUFASAL',
    locale: 'ar_SA',
    type: 'website',
    images: [{ url: '/images/logo.png', width: 512, height: 512, alt: 'مفصل' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.titleEn,
    description: siteConfig.seo.descriptionEn,
    images: ['/images/logo.png'],
  },
  robots: { index: true, follow: true },
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
            __html: `(function(){try{var t=localStorage.getItem('mufasal-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();try{var tok=localStorage.getItem('token');if(tok&&tok.indexOf('demo-token-')===0){document.documentElement.setAttribute('data-demo-role',tok.replace('demo-token-',''))}}catch(e){};if('serviceWorker' in navigator){var h=location.hostname;var isLocal=h==='localhost'||h==='127.0.0.1';if(isLocal){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(reg){reg.unregister()})});if(window.caches){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})})}}else{window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}}`,
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
