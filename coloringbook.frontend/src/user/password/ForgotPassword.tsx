import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '@util/APIUtils';
import LoadingIndicator from '@common/LoadingIndicator';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t: tCommon, i18n } = useTranslation('common'); // Get i18n instance
  const { t } = useTranslation('login'); // Using login namespace for password reset related strings

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPassword(email, i18n.language); // Pass current language
      toast.success(response.message || t('forgot_password_email_sent'), { autoClose: 5000 });
      setEmail(''); // Clear email field
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      toast.error(error.message || t('forgot_password_error_sending'), { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <div className="auth-card">
            <h1 className="auth-card-title">{t('forgot_password_title')}</h1>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder={t('email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-block btn-primary" disabled={isLoading}>
                  {isLoading ? <LoadingIndicator /> : t('forgot_password_send_link')}
                </button>
              </div>
            </form>
            <span className="help-block text-center">
              <Link to="/login">{tCommon('login')}</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;