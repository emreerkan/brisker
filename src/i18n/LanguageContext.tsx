import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { availableLanguages, SUPPORTED_LANGUAGE_CODES, DEFAULT_LANGUAGE } from './config';

type CatalogModule = { messages: Record<string, unknown> };

const catalogLoaders: Record<string, () => Promise<CatalogModule>> = import.meta.glob<CatalogModule>(
  '../locales/*/messages.mjs',
);

// Helper function to check if a language is RTL
const isRTLLanguage = (languageCode: string): boolean => {
  const lang = availableLanguages.find(l => l.code === languageCode);
  return lang?.rtl ?? false;
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  formatNumber: (num: number) => string;
  formatTime: (date: Date) => string;
  availableLanguages: typeof availableLanguages;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const loadCatalog = async (locale: string) => {
  const normalized = SUPPORTED_LANGUAGE_CODES.includes(locale) ? locale : DEFAULT_LANGUAGE;

  const isRTL = isRTLLanguage(normalized);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = normalized;

  if (i18n.locale === normalized && Object.keys(i18n.messages).length > 0) {
    return normalized;
  }

  const loaderKey = `../locales/${normalized}/messages.mjs`;
  let loader = catalogLoaders[loaderKey];
  let targetLocale = normalized;

  if (!loader) {
    targetLocale = DEFAULT_LANGUAGE;
    loader = catalogLoaders[`../locales/${DEFAULT_LANGUAGE}/messages.mjs`];
  }

  if (!loader) {
    throw new Error('Missing compiled translation catalog for default locale.');
  }

  const catalog = await loader();

  i18n.load(targetLocale, catalog.messages as Record<string, string>);
  i18n.activate(targetLocale);

  return targetLocale;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [loading, setLoading] = useState<boolean>(true);
  const isMountedRef = useRef(false);

  const applyLanguage = useCallback(async (locale: string) => {
    const resolved = await loadCatalog(locale);
    setLanguageState(resolved);
    setLoading(false);
    return resolved;
  }, []);

  // Initial language selection
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;

    const initialise = async () => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('bezique-language') : null;
      if (saved && SUPPORTED_LANGUAGE_CODES.includes(saved)) {
        await applyLanguage(saved);
        return;
      }

      if (typeof window !== 'undefined') {
        const browserLanguages = window.navigator.languages && window.navigator.languages.length > 0
          ? window.navigator.languages
          : [window.navigator.language];

        for (const lang of browserLanguages) {
          const baseLang = lang?.split('-')[0]?.toLowerCase();
          if (baseLang && SUPPORTED_LANGUAGE_CODES.includes(baseLang)) {
            await applyLanguage(baseLang);
            return;
          }
        }
      }

      await applyLanguage(DEFAULT_LANGUAGE);
    };

    void initialise();
  }, [applyLanguage]);

  const setLanguage = useCallback((locale: string) => {
    const normalized = SUPPORTED_LANGUAGE_CODES.includes(locale) ? locale : DEFAULT_LANGUAGE;
    localStorage.setItem('bezique-language', normalized);
    void applyLanguage(normalized);
  }, [applyLanguage]);

  useEffect(() => {
    if (loading) return;
    document.documentElement.lang = language;
  }, [language, loading]);

  const formatNumber = useCallback((num: number): string => {
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    return num.toLocaleString(locale);
  }, [language]);

  const formatTime = useCallback((date: Date): string => {
    if (language === 'tr') {
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [language]);

  const contextValue = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    formatNumber,
    formatTime,
    availableLanguages,
    loading,
  }), [language, setLanguage, formatNumber, formatTime, loading]);

  if (loading && i18n.locale !== DEFAULT_LANGUAGE) {
    // Wait until initial catalog is loaded
    return null;
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
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
