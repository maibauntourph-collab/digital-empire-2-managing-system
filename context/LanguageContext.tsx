"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ko, LocaleType } from '@/data/locales/ko';
import { en } from '@/data/locales/en';

type Language = 'ko' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof LocaleType) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('ko');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved) setLanguage(saved);
        setMounted(true);
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: keyof LocaleType): string => {
        const dict = language === 'ko' ? ko : en;
        return dict[key] || key;
    };

    if (!mounted) {
        return null; // or a loading spinner
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
