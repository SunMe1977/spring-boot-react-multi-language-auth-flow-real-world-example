import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ACCESS_TOKEN } from '@constants';
import { toast } from 'react-toastify';
import { getCurrentUser } from '@util/APIUtils';
import { useTranslation } from 'react-i18next';

interface OAuth2RedirectHandlerProps {
  onLoginSuccess: (user: any) => void;
}

const OAuth2RedirectHandler: React.FC<OAuth2RedirectHandlerProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('login');
  const hasProcessedToken = useRef(false); // Add a ref to track if token has been processed

  useEffect(() => {
    const getUrlParameter = (name: string) => {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const token = getUrlParameter('token');
    const error = getUrlParameter('error');

    // Only proceed if there's a token or an error in the URL AND we haven't processed it yet
    if ((token || error) && !hasProcessedToken.current) {
      hasProcessedToken.current = true; // Mark as processed

      // Clear the URL parameters immediately to prevent re-processing on re-renders/re-visits
      // This navigate should happen first to ensure the URL is clean for subsequent renders
      navigate(location.pathname, { replace: true, state: {} });

      if (token) {
        localStorage.setItem(ACCESS_TOKEN, token);
        
        getCurrentUser()
          .then((user) => {
            onLoginSuccess(user);
            toast.success(t('oauth_login_success'), { autoClose: 3000 });
            navigate('/', { replace: true });
          })
          .catch((err) => {
            console.error('OAuth2RedirectHandler: Failed to fetch user after token:', err);
            toast.error(t('oauth_fetch_profile_error'), { autoClose: 5000 });
            navigate('/login', { state: { error: t('oauth_fetch_profile_error') }, replace: true });
          });
      } else {
        const errorMessage = error || t('oauth_generic_error');
        toast.error(errorMessage, { autoClose: 5000 });
        navigate('/login', { state: { error: errorMessage }, replace: true });
      }
    } else if (!token && !error && location.pathname === '/oauth2/redirect') {
      // If no token or error, and we are on the redirect path, navigate away
      // This handles cases where the user might directly access /oauth2/redirect without params
      navigate('/', { replace: true });
    }
  }, [location, navigate, onLoginSuccess, t]);

  return (
    <div className="oauth2-redirect-handler-container">
      <p>{t('oauth_processing')}</p>
    </div>
  );
};

export default OAuth2RedirectHandler;