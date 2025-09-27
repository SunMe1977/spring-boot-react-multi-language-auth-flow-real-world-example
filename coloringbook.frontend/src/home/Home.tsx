import React from 'react';
import { useTranslation } from 'react-i18next';
import page_under_construction from '../img/page_under_construction.png';

const Home: React.FC = () => {
  const { t } = useTranslation('home');

  return (
    <div className="container text-center" style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '60px' }}>
      <div className="jumbotron"> {/* Using Jumbotron for prominent content */}
        <h1 className="display-4">{t('welcome')}</h1>
        <p className="lead">{t('description')}</p>
        <img src={page_under_construction} width="300px" alt="Page under construction" className="img-responsive center-block" />
      </div>
    </div>
  );
};

export default Home;