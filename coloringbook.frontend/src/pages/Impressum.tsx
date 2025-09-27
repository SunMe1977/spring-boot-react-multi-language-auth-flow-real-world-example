import React from 'react';
import { useTranslation } from 'react-i18next';

const Impressum: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '50px' }}>
      <h1>{t('impressum')}</h1>
      <p>{t('impressum_content_p1')}</p>
      <p>{t('impressum_content_p2')}</p>
    </div>
  );
};

export default Impressum;