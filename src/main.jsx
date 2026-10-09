import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ComplaintProvider } from './context/ComplaintContext';
import App from './App';
import './styles/index.css';

// Safe development check: verifies API key presence without logging the secret
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
console.log(
  "Google Maps API key configured:",
  Boolean(apiKey)
);

const rootElement = document.getElementById('root');


if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <ComplaintProvider>
              <App />
            </ComplaintProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('Fatal: #root element not found in DOM.');
}

