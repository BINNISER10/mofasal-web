'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/appStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useAppStore();

  useEffect(() => {
    const saved = localStorage.getItem('mufasal-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
  }, [setTheme]);

  return <>{children}</>;
}
