import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import fbLogo from '../../img/fb-logo.png';
import googleLogo from '../../img/google-logo.png';
import githubLogo from '../../img/github-logo.png';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { login, getCurrentUser } from '../../util/APIUtils';
import { ACCESS_TOKEN, GOOGLE_AUTH_URL, FACEBOOK_AUTH_URL, GITHUB_AUTH_URL } from '../../constants';
import LoadingIndicator from '../../common/LoadingIndicator';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

interface LoginProps {
  authenticated: boolean;
  onLoginSuccess: (user: any) => void;
}

interface LocationState {
  error?: string;
}

function Login({ authenticated, onLoginSuccess }: LoginProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('login');

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.error) {
      toast.error(state.error, { autoClose: 5000 });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <div className="auth-card">
            <h1 className="auth-card-title">{t('title', { appname: tCommon('appname') })}</h1>
            <SocialLogin />
            <div className="or-separator">
              <span className="or-text">{t('or')}</span>
            </div>
            <LoginForm onLoginSuccess={onLoginSuccess} />
            <span className="help-block text-center auth-link-block">
              {t('new_user')} <Link to="/signup">{tCommon('signup')}</Link>
            </span>
            <span className="help-block text-center auth-link-block">
              <Link to="/forgot-password">{t('forgot_password_link')}</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLogin() {
  const { t } = useTranslation('login');

  return (
    <div className="social-login">
      <a className="btn btn-block btn-social btn-google" href={GOOGLE_AUTH_URL} style={{ marginBottom: '15px', fontWeight: '400', fontSize: '16px' }}>
        <img src={googleLogo} alt="Google" style={{ height: '32px', float: 'left', marginTop: '10px' }} /> {t('login_with_google')}
      </a>
      <a className="btn btn-block btn-social btn-facebook" href={FACEBOOK_AUTH_URL} style={{ marginBottom: '15px', fontWeight: '400', fontSize: '16px' }}>
        <img src={fbLogo} alt="Facebook" style={{ height: '24px', float: 'left', marginLeft: '3px', marginTop: '10px' }} /> {t('login_with_facebook')}
      </a>
      <a className="btn btn-block btn-social btn-github" href={GITHUB_AUTH_URL} style={{ marginBottom: '15px', fontWeight: '400', fontSize: '16px' }}>
        <img src={githubLogo} alt="Github" style={{ height: '24px', float: 'left', marginLeft: '3px', marginTop: '10px' }} /> {t('login_with_github')}
      </a>
    </div>
  );
}

function LoginForm({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('login');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response && response.accessToken) {
        localStorage.setItem(ACCESS_TOKEN, response.accessToken);
        toast.success(t('login_success'), { autoClose: 3000 });

        const user = await getCurrentUser();
       
        if (user) {
          onLoginSuccess(user);
        } else {
          console.error('LoginForm: getCurrentUser returned no user data.');
          toast.error(t('fetch_profile_error'), { autoClose: 5000 });
        }
      } else {
        console.error('LoginForm: Login response did not contain accessToken:', response);
        toast.error(t('no_access_token_error'), { autoClose: 5000 });
      }
    } catch (error: any) {
      console.error('LoginForm: Login failed:', error);
      toast.error(error.message || t('login_failed_generic'), { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      <div className="form-group" style={{ position: 'relative' }}> {/* Added relative positioning for icon */}
        <input
          type={showPassword ? 'text' : 'password'} // Toggle type based on state
          name="password"
          className="form-control"
          placeholder={t('password_placeholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="btn btn-link"
          style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', padding: '0 10px', height: 'auto', minWidth: 'auto' }}
          disabled={isLoading}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <div className="form-group">
        <button type="submit" className="btn btn-block btn-primary" disabled={isLoading}>
          {isLoading ? <LoadingIndicator /> : tCommon('login')}
        </button>
      </div>
    </form>
  );
}

export default Login;