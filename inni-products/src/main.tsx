import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4500,
        style: {
          background: '#171717',
          color: '#fafafa',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '420px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        },
        success: {
          iconTheme: {
            primary: '#f97316',
            secondary: '#171717',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: '#171717',
          },
        },
      }}
    />
  </StrictMode>,
);
