import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { translations } from './languages';
import type { Translation } from './types';

const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = new Set(Object.keys(translations));
const FALLBACK_LANGUAGE = translations[DEFAULT_LANGUAGE]
  ? DEFAULT_LANGUAGE
  : Object.keys(translations)[0] || DEFAULT_LANGUAGE;

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translation;
  formatNumber: (num: number) => string;
  formatTime: (date: Date) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(FALLBACK_LANGUAGE);

  const setLanguage = useCallback((lang: string) => {
    const nextLanguage = SUPPORTED_LANGUAGES.has(lang) ? lang : FALLBACK_LANGUAGE;
    setLanguageState(nextLanguage);
    localStorage.setItem('bezique-language', nextLanguage);
  }, []);

  // Initialize language from localStorage
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('bezique-language');
    if (savedLanguage && SUPPORTED_LANGUAGES.has(savedLanguage)) {
      setLanguageState(savedLanguage);
      return;
    }

    // Fall back to browser preference when no saved language exists
    if (typeof window !== 'undefined') {
      const browserLanguages = window.navigator.languages && window.navigator.languages.length > 0
        ? window.navigator.languages
        : [window.navigator.language];

      for (const lang of browserLanguages) {
        const baseLang = lang?.split('-')[0]?.toLowerCase();
        if (baseLang && SUPPORTED_LANGUAGES.has(baseLang)) {
          setLanguageState(baseLang);
          return;
        }
      }
    }

    setLanguageState(FALLBACK_LANGUAGE);
  }, []);

  const t = translations[language] || translations[FALLBACK_LANGUAGE];

  // Update document title and lang attribute when language changes
  React.useEffect(() => {
    document.title = t.appName;
    document.documentElement.lang = language;
  }, [t.appName, language]);

  const formatNumber = useCallback((num: number): string => {
    if (language === 'tr') {
      // Turkish uses dot as thousands separator
      return num.toLocaleString('tr-TR');
    } else {
      // English uses comma as thousands separator
      return num.toLocaleString('en-US');
    }
  }, [language]);

  const formatTime = useCallback((date: Date): string => {
    if (language === 'tr') {
      // Turkish uses 24-hour format
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
    } else {
      // English uses 12-hour format
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    formatNumber,
    formatTime
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
