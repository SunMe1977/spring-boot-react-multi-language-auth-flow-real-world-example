import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AppFooter: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/impressum">{t('impressum')}</Link>
            <Link to="/privacy-policy">{t('privacy_policy')}</Link>
            <Link to="/user-data-deletion">{t('user_data_deletion')}</Link>
            <Link to="/terms-of-service">{t('terms_of_service')}</Link>
            <Link to="/cookie-policy">{t('cookie_policy')}</Link>
          </div>
          <div className="footer-copyright">
            <strong>Copyright © 2025 <a href="https://aiselfpubcoloringbookstudio.netlify.app/" target="_blank" rel="noopener noreferrer">{t('appname')}</a>.</strong> All rights reserved.
            <span className="d-none d-sm-inline float-right">
              {t('footer_anything_you_want')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;