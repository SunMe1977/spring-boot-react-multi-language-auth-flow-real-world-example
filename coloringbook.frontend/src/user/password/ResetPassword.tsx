import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '@util/APIUtils';
import LoadingIndicator from '@common/LoadingIndicator';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('login'); // Using login namespace for password reset related strings

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error(t('reset_password_no_token'), { autoClose: 5000 });
      navigate('/login', { replace: true });
    }
  }, [location, navigate, t]);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('passwords_do_not_match'), { autoClose: 5000 });
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('password_too_short'), { autoClose: 5000 });
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      toast.success(t('reset_password_success'), { autoClose: 5000 });
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Reset password failed:', error);
      toast.error(error.message || t('reset_password_error_generic'), { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <div className="auth-card">
            <h1 className="auth-card-title">{t('reset_password_title')}</h1>
            <form onSubmit={handleSubmit}>
              <div className="form-group password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  className="form-control"
                  placeholder={t('reset_password_new_password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="btn btn-link password-toggle-btn"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="form-group password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder={t('reset_password_confirm_password')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="btn btn-link password-toggle-btn"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-block btn-primary" disabled={isLoading}>
                  {isLoading ? <LoadingIndicator /> : t('reset_password_submit')}
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

export default ResetPassword;