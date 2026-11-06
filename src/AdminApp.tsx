import React, { useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPortal } from './components/AdminLoginPortal';
import { InvoiceModal } from './components/InvoiceModal';

const PUBLIC_STORE_URL = 'https://mortafaat-store-2new.ahmedorabi753.workers.dev';

export const AdminApp: React.FC = () => {
  const {
    currentView,
    isAdminAuthenticated,
    activeInvoiceOrder,
    setActiveInvoiceOrder
  } = useStore();

  useEffect(() => {
    if (currentView !== 'admin') {
      window.location.assign(PUBLIC_STORE_URL);
    }
  }, [currentView]);

  if (!isAdminAuthenticated) return <AdminLoginPortal />;

  return (
    <div className="min-h-screen flex flex-col bg-[#07090E] text-gray-100 selection:bg-brand-gold selection:text-black">
      <Header />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <InvoiceModal
        order={activeInvoiceOrder}
        onClose={() => setActiveInvoiceOrder(null)}
      />
    </div>
  );
};

export default AdminApp;
