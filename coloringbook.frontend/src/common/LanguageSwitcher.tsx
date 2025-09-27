import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="form-group" style={{ marginBottom: '0', display: 'inline-block', verticalAlign: 'middle' }}>
      <select className="form-control" onChange={handleChange} value={i18n.language} style={{ height: '34px', padding: '6px 12px', fontSize: '14px' }}>
        <option value="en">{t('english')}</option>
        <option value="de">{t('german')}</option>
        <option value="it">{t('italian')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;