import React from 'react';
import { useTranslation } from 'react-i18next';

const CookiePolicy: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '50px' }}>
      <h1>{t('cookie_policy')}</h1>
      <p>{t('cookie_policy_content_p1')}</p>
      <p>{t('cookie_policy_content_p2')}</p>
    </div>
  );
};

export default CookiePolicy;