import React from 'react';
import { useTranslation } from 'react-i18next';

const UserDataDeletion: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '50px' }}>
      <h1>{t('user_data_deletion')}</h1>
      <p>{t('user_data_deletion_content_p1')}</p>
      <p>{t('user_data_deletion_content_p2')}</p>
    </div>
  );
};

export default UserDataDeletion;