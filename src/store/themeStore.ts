import { create } from 'zustand';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDarkMode: true, // Default to dark theme
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode }))
}));