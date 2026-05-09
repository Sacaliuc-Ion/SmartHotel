import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '../languages';

export type Language = 'ro' | 'en' | 'ru';
export type ThemeMode = 'light' | 'dark';

interface PreferencesContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('smart-hotel-language');
  return stored === 'en' || stored === 'ru' || stored === 'ro' ? stored : 'ro';
};

const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem('smart-hotel-theme');
  return stored === 'dark' || stored === 'light' ? stored : 'light';
};

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('smart-hotel-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('smart-hotel-language', language);
    void i18n.changeLanguage(language);
  }, [language]);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [language, theme]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};
