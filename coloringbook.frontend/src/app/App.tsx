import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@util/APIUtils';
import { ACCESS_TOKEN } from '@constants';

import AppHeader from '@common/AppHeader';
import AppFooter from '@common/AppFooter';
import Login from '@user/login/Login';
import Signup from '@user/signup/Signup';
import Profile from '@user/profile/Profile';
import Home from '@home/Home';
import NotFound from '@common/NotFound';
import OAuth2RedirectHandler from '@user/oauth2/OAuth2RedirectHandler';
import ForgotPassword from '@user/password/ForgotPassword';
import ResetPassword from '@user/password/ResetPassword';
import VerifyEmail from '@user/email/VerifyEmail'; // Import new component
import Impressum from '@pages/Impressum';
import PrivacyPolicy from '@pages/PrivacyPolicy';
import UserDataDeletion from '@pages/UserDataDeletion';
import TermsOfService from '@pages/TermsOfService';
import CookiePolicy from '@pages/CookiePolicy';
import CookieConsentBanner from '../components/CookieConsentBanner';
import { ToastContainer } from 'react-toastify';


function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      getCurrentUser()
        .then((user) => {
          setCurrentUser(user);
          setAuthenticated(true);
        })
        .catch((error) => {
          console.error('❌ getCurrentUser failed:', error);
          setAuthenticated(false);
          localStorage.removeItem(ACCESS_TOKEN); // Clear invalid token
        });
    } else {
      setAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (authenticated && currentUser) {
      if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/' || location.pathname === '/forgot-password' || location.pathname.startsWith('/reset-password') || location.pathname.startsWith('/verify-email')) {
        navigate('/profile', { replace: true });
      }
    } else if (!authenticated && (location.pathname === '/profile')) {
      navigate('/login', { replace: true });
    }
  }, [authenticated, currentUser, location.pathname, navigate]);


  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setAuthenticated(true);
  };

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  return (
    <div className="app">
      <AppHeader authenticated={authenticated} onLogout={handleLogout} />
      <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={authenticated ? <Navigate to="/" replace /> : <Login authenticated={authenticated} onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route path="/signup" element={<Signup onSignupSuccess={handleLoginSuccess} />} />
            <Route 
              path="/profile" 
              element={authenticated && currentUser ? <Profile currentUser={currentUser} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" replace />} 
            />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} /> {/* New route for email verification */}
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/user-data-deletion" element={<UserDataDeletion />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </div>
      <AppFooter />
      <CookieConsentBanner />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;