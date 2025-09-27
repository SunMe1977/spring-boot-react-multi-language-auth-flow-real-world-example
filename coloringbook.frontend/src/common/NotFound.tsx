import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="container text-center" style={{ marginTop: '50px', padding: '40px', border: '1px solid #c8c8c8', borderRadius: '4px' }}>
      <h1 className="text-danger" style={{ fontSize: '50px', letterSpacing: '10px', marginBottom: '10px' }}>404</h1>
      <div className="lead" style={{ fontSize: '20px', marginBottom: '20px' }}>{t('notfound')}</div>
      <Link to="/">
        <button className="btn btn-primary btn-lg" type="button">
          {t('goback')}
        </button>
      </Link>
    </div>
  );
};

export default NotFound;