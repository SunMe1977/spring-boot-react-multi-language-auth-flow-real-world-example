import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { confirmEmailVerification } from '@util/APIUtils';
import LoadingIndicator from '@common/LoadingIndicator';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setMessage(t('email.verification.no_token_found'));
      toast.error(t('email.verification.no_token_found'), { autoClose: 5000 });
      // Optionally redirect after a short delay
      setTimeout(() => navigate('/profile', { replace: true }), 3000);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await confirmEmailVerification(token);
        setVerificationStatus('success');
        setMessage(response.message || t('email.verification.success'));
        toast.success(response.message || t('email.verification.success'), { autoClose: 5000 });
        setTimeout(() => navigate('/profile', { replace: true }), 3000);
      } catch (error: any) {
        setVerificationStatus('error');
        setMessage(error.message || t('email.verification.error_generic'));
        toast.error(error.message || t('email.verification.error_generic'), { autoClose: 5000 });
        setTimeout(() => navigate('/profile', { replace: true }), 3000);
      }
    };

    verifyEmail();
  }, [location, navigate, t]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <div className="auth-card text-center">
            <h1 className="auth-card-title">{t('email.verification.title')}</h1>
            {verificationStatus === 'loading' && (
              <>
                <p>{t('email.verification.processing')}</p>
                <LoadingIndicator />
              </>
            )}
            {verificationStatus === 'success' && (
              <>
                <p className="text-success" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{message}</p>
                <Link to="/profile" className="btn btn-primary" style={{ marginTop: '20px' }}>
                  {t('profile')}
                </Link>
              </>
            )}
            {verificationStatus === 'error' && (
              <>
                <p className="text-danger" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{message}</p>
                <Link to="/profile" className="btn btn-primary" style={{ marginTop: '20px' }}>
                  {t('profile')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;