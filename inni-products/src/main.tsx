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
        style: {
          background: '#111',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    />
  </StrictMode>,
);
