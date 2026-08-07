import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import id from '../locales/id.json';

const LanguageContext = createContext();

const translations = { en, id };

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lang') || 'id'; // default to ID
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => {
    if (newLang === 'en' || newLang === 'id') {
      setLangState(newLang);
    }
  };

  const t = (key) => {
    const parts = key.split('.');
    let result = translations[lang] || translations['id'];
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        // Fallback to English if not found in current language
        let fallback = translations['en'];
        for (const p of parts) {
          if (fallback && fallback[p] !== undefined) {
            fallback = fallback[p];
          } else {
            fallback = null;
            break;
          }
        }
        return fallback !== null ? fallback : key;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
};
