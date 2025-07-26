// src/store/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: true,
      
      toggleTheme: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      setTheme: (isDark: boolean) =>
        set({ isDarkMode: isDark })
    }),
    {
      name: 'theme-storage',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Theme loaded:', state.isDarkMode ? 'dark' : 'light');
        }
      },
    }
  )
);