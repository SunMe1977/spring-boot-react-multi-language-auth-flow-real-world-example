import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signup, getCurrentUser } from '@util/APIUtils';
import { ACCESS_TOKEN } from '@constants';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

interface SignupProps {
  onSignupSuccess?: (user: any) => void;
}

function Signup({ onSignupSuccess }: SignupProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('signup');
  const { t: tLogin } = useTranslation('login'); // For forgot password link

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      toast.error(t('passwords_do_not_match'), { autoClose: 5000 });
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('password_too_short'), { autoClose: 5000 });
      return;
    }

    try {
      const response = await signup(formData);
      if (response && response.accessToken) {
        localStorage.setItem(ACCESS_TOKEN, response.accessToken);
        toast.success(t('success'));

        const user = await getCurrentUser();
        if (user) {
          if (onSignupSuccess) onSignupSuccess(user);
          navigate('/profile');
        } else {
          console.error('Signup: getCurrentUser returned no user data after signup.');
          toast.error(t('fetch_profile_error_after_signup'), { autoClose: 5000 });
          navigate('/');
        }
      } else {
        console.error('Signup: Signup response did not contain accessToken:', response);
        toast.error(t('no_access_token_error'), { autoClose: 5000 });
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error?.message || t('error'));
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <div className="auth-card">
            <h1 className="auth-card-title">{t('title')}</h1>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder={t('name')}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder={t('email')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group password-input-container"> {/* Added container for positioning */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder={t('password')}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="btn btn-link password-toggle-btn"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', height: 'auto', padding: '0 5px', color: '#6c757d' }}
                >
                  {showPassword ? t('hide') : t('show')}
                </button>
              </div>
              <div className="form-group password-input-container"> {/* Added container for positioning */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder={t('confirm_password')}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="btn btn-link password-toggle-btn"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', height: 'auto', padding: '0 5px', color: '#6c757d' }}
                >
                  {showPassword ? t('hide') : t('show')}
                </button>
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-block btn-primary">
                  {tCommon('signup')}
                </button>
              </div>
            </form>
            <span className="help-block text-center auth-link-block">
              {t('already')} <Link to="/login">{tCommon('login')}</Link>
            </span>
            <span className="help-block text-center auth-link-block">
              <Link to="/forgot-password">{tLogin('forgot_password_link')}</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;