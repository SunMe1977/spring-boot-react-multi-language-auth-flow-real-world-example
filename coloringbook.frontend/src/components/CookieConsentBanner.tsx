"use client";

import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CookieConsentBanner: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <CookieConsent
      location="bottom"
      buttonText={t('cookie_consent_accept')}
      enableDeclineButton
      declineButtonText={t('cookie_consent_decline')}
      cookieName="aiSelfPubCookieConsent"
      style={{ background: "#2B373B", zIndex: 9999 }}
      buttonStyle={{ color: "#4e503b", fontSize: "13px", background: "#40a9ff", borderRadius: "4px", padding: "10px 20px" }}
      declineButtonStyle={{ color: "#fff", fontSize: "13px", background: "#f5222d", borderRadius: "4px", padding: "10px 20px" }}
      expires={150}
      onAccept={() => {
        console.log("User accepted cookies");
      }}
      onDecline={() => {
        console.log("User declined cookies");
      }}
    >
      {t('cookie_consent_text')}{" "}
      <Link to="/cookie-policy" style={{ color: "#40a9ff", textDecoration: "underline" }}>
        {t('cookie_consent_learn_more')}
      </Link>
    </CookieConsent>
  );
};

export default CookieConsentBanner;