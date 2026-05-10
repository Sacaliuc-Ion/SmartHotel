import { Languages, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Language, usePreferences } from '../../context/PreferencesContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const languageLabels: Record<Language, string> = {
  ro: 'RO',
  en: 'EN',
  ru: 'RU',
};

export const PreferencesControls = ({ compact = false }: { compact?: boolean }) => {
  const { t } = useTranslation();
  const { language, setLanguage, theme, toggleTheme } = usePreferences();
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div className="flex items-center gap-2">
      <div className={compact ? 'w-[84px]' : 'w-[112px]'}>
        <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
          <SelectTrigger
            size="sm"
            aria-label={t('languageLabel')}
            className="lb-preference-control border px-2"
          >
            <Languages className="h-4 w-4" />
            <SelectValue>{languageLabels[language]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ro">{t('languageNameRo')}</SelectItem>
            <SelectItem value="en">{t('languageNameEn')}</SelectItem>
            <SelectItem value="ru">{t('languageNameRu')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className="lb-preference-control inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
        aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
        title={theme === 'dark' ? t('lightMode') : t('darkMode')}
      >
        <ThemeIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
