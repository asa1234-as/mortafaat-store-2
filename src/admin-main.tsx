import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';
import { StoreProvider } from './context/StoreContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <AdminApp />
    </StoreProvider>
  </React.StrictMode>,
);
