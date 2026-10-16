import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: () => {},
  toggleLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('porto_lang');
        if (saved === 'id' || saved === 'en') return saved;
      } catch {}
    }
    return 'id';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('porto_lang', newLang);
        document.documentElement.lang = newLang;
      } catch {}
    }
  };

  const toggleLang = () => {
    setLangState((prev) => {
      const next = prev === 'id' ? 'en' : 'id';
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('porto_lang', next);
          document.documentElement.lang = next;
        } catch {}
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
