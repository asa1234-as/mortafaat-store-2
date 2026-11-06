import React, { useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { CategoryCards } from './components/CategoryCards';
import { ProductSection } from './components/ProductSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { PolicyModal } from './components/PolicyModal';
import { AuthModal } from './components/AuthModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginPortal } from './components/AdminLoginPortal';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    isAdminAuthenticated, 
    activeInvoiceOrder, 
    setActiveInvoiceOrder, 
    theme 
  } = useStore();

  const isPublicBuild = import.meta.env.VITE_PUBLIC_BUILD === 'true' || import.meta.env.MODE === 'public';

  // Check URL path or hash for dedicated /admin route (TASK 11)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (!isPublicBuild && (path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || search.includes('view=admin'))) {
      setCurrentView('admin');
    }

    const handleHashChange = () => {
      if (!isPublicBuild && window.location.hash.toLowerCase() === '#admin') {
        setCurrentView('admin');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isPublicBuild, setCurrentView]);

  // Dedicated Admin Interface (TASK 11)
  if (!isPublicBuild && currentView === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLoginPortal />;
    }

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
  }

  // Customer-Facing Storefront
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#07090E] text-gray-100' 
        : 'bg-[#FDFBF7] text-gray-900'
    } selection:bg-brand-gold selection:text-black`}>
      <Header />

      <main className="flex-1">
        <HeroSlider />
        <CategoryCards />
        <ProductSection />
      </main>

      <Footer />

      {/* Customer Overlays & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <LiveChatWidget />
      <PolicyModal />
      <AuthModal />
      <InvoiceModal 
        order={activeInvoiceOrder} 
        onClose={() => setActiveInvoiceOrder(null)} 
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
