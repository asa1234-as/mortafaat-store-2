import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  ShoppingCart, 
  Phone, 
  Menu, 
  X, 
  Flame, 
  Smartphone,
  Shirt,
  Sparkles,
  Home,
  HeartPulse,
  Grid,
  LogOut,
  Store
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    settings, 
    cartCount, 
    setIsCartOpen, 
    currentView, 
    setCurrentView,
    logoutAdmin,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'الكل', icon: Grid },
    { id: 'electronics', name: 'إلكترونيات', icon: Smartphone },
    { id: 'fashion', name: 'ملابس وأزياء', icon: Shirt },
    { id: 'perfumes', name: 'عطور فاخرة', icon: Sparkles },
    { id: 'home', name: 'أدوات منزلية', icon: Home },
    { id: 'personal-care', name: 'عناية شخصية', icon: HeartPulse },
  ];

  // If currently in Admin Mode, show Admin Top Navbar
  if (currentView === 'admin') {
    return (
      <header className="sticky top-0 z-40 bg-brand-black text-white shadow-xl border-b border-brand-gold/40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl border border-brand-gold bg-black p-0.5" />
            <div>
              <span className="font-black text-sm text-white">لوحة تحكم مرتفعات ستور (بوابة الإدارة)</span>
              <span className="text-[10px] text-brand-gold block font-mono">Mortafaat Admin Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('store')}
              className="px-3.5 py-1.5 rounded-xl bg-brand-charcoal hover:bg-brand-darkGray text-xs font-bold text-gray-200 border border-brand-border flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-brand-gold" />
              <span>معاينة المتجر</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Customer Storefront Header
  return (
    <header className="sticky top-0 z-40 bg-brand-black text-white shadow-xl border-b border-brand-gold/30">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-brand-goldDark via-brand-gold to-brand-goldDark text-brand-black px-4 py-1.5 text-xs md:text-sm font-bold text-center flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2">
          <Phone className="w-3.5 h-3.5" />
          <span>خدمة العملاء والطلبات: {settings.phone}</span>
        </div>
        <div className="mx-auto flex items-center gap-2">
          <span>{settings.announcementText}</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="bg-brand-black/20 px-2 py-0.5 rounded text-xs">شحن سريع</span>
          <span className="bg-brand-black/20 px-2 py-0.5 rounded text-xs">دفع عند الاستلام مع المعاينة</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => { setSelectedCategory('all'); }}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-xl overflow-hidden border-2 border-brand-gold shadow-lg shadow-brand-gold/20 bg-brand-black flex items-center justify-center p-0.5">
              <img 
                src="/logo.png" 
                alt="مرتفعات ستور" 
                className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-brand-gold transition-colors">
                  مرتفعات
                </span>
                <span className="text-xl md:text-2xl font-black text-brand-gold">
                  ستور
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-gray-400 block -mt-1 font-sans">
                Mortafaat Store
              </span>
            </div>
          </div>

          {/* Search Bar (More Shopping Style) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="ابحث عن منتج، كود، ماركة، أو قسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-charcoal text-white placeholder-gray-400 text-sm rounded-full py-2.5 pr-11 pl-4 border border-brand-border focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all"
              />
              <Search className="w-5 h-5 text-brand-gold absolute right-3.5 pointer-events-none" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 text-gray-400 hover:text-white text-xs bg-gray-700 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* WhatsApp Fast Order Direct Button */}
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md"
              title="تواصل مباشر عبر واتساب"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>واتساب المتجر</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl bg-brand-gold text-brand-black hover:bg-brand-goldAccent transition-all shadow-md shadow-brand-gold/20"
              title="سلة المشتريات"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-brand-charcoal text-gray-300 border border-brand-border"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="ابحث عن أي منتج في مرتفعات ستور..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-charcoal text-white placeholder-gray-400 text-xs rounded-full py-2 pr-10 pl-4 border border-brand-border focus:border-brand-gold focus:outline-none"
            />
            <Search className="w-4 h-4 text-brand-gold absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <div className="bg-brand-charcoal border-t border-brand-border/60 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none">
            <div className="flex items-center gap-1 lg:gap-2">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-gold text-brand-black shadow-md shadow-brand-gold/20'
                        : 'text-gray-300 hover:text-white hover:bg-brand-darkGray'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-brand-black' : 'text-brand-gold'}`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                تخفيضات تصل إلى 50%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-charcoal border-t border-brand-border px-4 py-4 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">أقسام المتجر:</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-brand-gold text-brand-black font-bold'
                      : 'bg-brand-darkGray text-gray-200 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4 text-brand-gold" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
