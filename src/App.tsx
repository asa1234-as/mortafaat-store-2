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
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  const { currentView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-gray-900 selection:bg-brand-gold selection:text-black">
      <Header />

      <main className="flex-1">
        {currentView === 'store' ? (
          <>
            <HeroSlider />
            <CategoryCards />
            <ProductSection />
          </>
        ) : (
          <AdminDashboard />
        )}
      </main>

      {currentView === 'store' && <Footer />}

      {/* Overlays & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <LiveChatWidget />
      <PolicyModal />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
