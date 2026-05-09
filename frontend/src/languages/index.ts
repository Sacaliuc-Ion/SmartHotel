import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ro from './locales/ro.json';
import ru from './locales/ru.json';

const storedLanguage = localStorage.getItem('smart-hotel-language');
const initialLanguage = storedLanguage === 'en' || storedLanguage === 'ru' || storedLanguage === 'ro'
  ? storedLanguage
  : 'ro';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ro: { translation: ro },
    ru: { translation: ru },
  },
  lng: initialLanguage,
  fallbackLng: 'ro',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
