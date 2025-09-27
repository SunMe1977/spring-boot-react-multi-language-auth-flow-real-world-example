import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/common.json';
import de from './locales/de/common.json';
import it from './locales/it/common.json';
import enLogin from './locales/en/login.json';
import deLogin from './locales/de/login.json';
import itLogin from './locales/it/login.json';
import enHome from './locales/en/home.json';
import deHome from './locales/de/home.json';
import itHome from './locales/it/home.json';
import enSignup from './locales/en/signup.json';
import deSignup from './locales/de/signup.json';
import itSignup from './locales/it/signup.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
    en: { common: en, login: enLogin , home: enHome, signup: enSignup },
    de: { common: de, login: deLogin , home: deHome, signup: deSignup },
    it: { common: it, login: itLogin , home: itHome, signup: itSignup  },
    },
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    ns: ['login', 'common', 'home', 'signup'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;