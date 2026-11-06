import React from 'react';
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
import { Footer } from './components/Footer';

export const PublicApp: React.FC = () => {
  const { theme, activeInvoiceOrder, setActiveInvoiceOrder } = useStore();

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

export default PublicApp;
