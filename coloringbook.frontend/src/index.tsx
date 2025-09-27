import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n'; // i18next configuration
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import App from './app/App';
import { BrowserRouter as Router } from 'react-router-dom';

// Import custom index.css
import './index.css'; 
import 'react-toastify/dist/ReactToastify.css'; // Keep toastify CSS

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Router>
        <App />
      </Router>
    </I18nextProvider>
  </React.StrictMode>
);