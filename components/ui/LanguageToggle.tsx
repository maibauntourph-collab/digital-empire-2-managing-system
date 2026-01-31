"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors font-bold text-sm"
            aria-label="Toggle Language"
        >
            {language === 'ko' ? 'EN' : 'KR'}
        </button>
    );
}
