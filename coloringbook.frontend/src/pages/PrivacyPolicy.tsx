import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '50px' }}>
      <h1>{t('privacy_policy')}</h1>
      <p>{t('privacy_policy_content_p1')}</p>
      <p>{t('privacy_policy_content_p2')}</p>
    </div>
  );
};

export default PrivacyPolicy;