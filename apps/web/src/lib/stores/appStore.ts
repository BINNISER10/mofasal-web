import { create } from 'zustand';

type Language = 'ar' | 'en';
type Theme = 'light' | 'dark';

interface AppState {
  language: Language;
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('mufasal-theme') as Theme | null;
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('mufasal-theme', theme);
};

export const useAppStore = create<AppState>((set, get) => ({
  language: 'ar',
  theme: 'light',
  sidebarOpen: false,
  sidebarCollapsed: false,
  isRTL: true,
  setLanguage: (language) =>
    set({ language, isRTL: language === 'ar' }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    set({ theme: next });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
