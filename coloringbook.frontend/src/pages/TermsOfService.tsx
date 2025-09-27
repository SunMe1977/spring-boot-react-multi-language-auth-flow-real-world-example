import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '50px' }}>
      <h1>{t('terms_of_service')}</h1>
      <p>{t('terms_of_service_content_p1')}</p>
      <p>{t('terms_of_service_content_p2')}</p>
    </div>
  );
};

export default TermsOfService;