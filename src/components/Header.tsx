import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  ShoppingCart, 
  Phone, 
  Menu, 
  X, 
  Flame, 
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Lock,
  Store,
  Download
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    settings, 
    cartCount, 
    setIsCartOpen, 
    currentView, 
    setCurrentView,
    logoutAdmin,
    loginAdmin,
    theme,
    toggleTheme,
    language,
    setLanguage,
    currentUser,
    setCurrentUser,
    setIsAuthModalOpen,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pinInput)) {
      setIsAdminPinModalOpen(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // If in Admin Dashboard view
  if (currentView === 'admin') {
    return (
      <header className="sticky top-0 z-40 bg-[#0A0D14] text-white shadow-xl border-b border-brand-gold/40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl border border-brand-gold bg-black p-0.5" />
            <div>
              <span className="font-black text-sm text-white">بوابة الإدارة الشاملة (مرتفعات ستور)</span>
              <span className="text-[10px] text-brand-gold block font-mono">Mortafaat Control Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('store')}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-gray-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-brand-gold" />
              <span>معاينة المتجر للعملاء</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج من الإدارة</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Regular Storefront Header
  return (
    <header className="sticky top-0 z-40 bg-[#0A0D14] dark:bg-[#06080D] text-white shadow-xl border-b border-brand-gold/30 transition-colors">
      
      {/* 1. TOP ANNOUNCEMENT & UTILITIES BAR */}
      <div className="bg-gradient-to-r from-amber-600 via-brand-gold to-amber-600 text-black px-4 py-1.5 text-xs font-bold flex items-center justify-between">
        
        {/* Customer Service & Phone */}
        <div className="hidden sm:flex items-center gap-2">
          <Phone className="w-3.5 h-3.5" />
          <span>خدمة العملاء: {settings.phone}</span>
        </div>

        {/* Dynamic Announcement */}
        <div className="mx-auto flex items-center gap-2 text-center truncate px-2">
          <span>{settings.announcementText}</span>
        </div>

        {/* Top Controls: Theme Toggle + Owner Portal */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          
          {/* Theme Toggle: Sun vs Moon (Dream 2000 Style) */}
          <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-full bg-black/25 hover:bg-black/40 text-black flex items-center justify-center transition-all"
            title={theme === 'light' ? 'التحويل للوضع الليلي الداكن' : 'التحويل للوضع النهاري الفاتح'}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-900 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-brand-black" />
            )}
          </button>

          {/* Owner Secret Admin Suite Trigger (Top Header) */}
          <button
            onClick={() => setIsAdminPinModalOpen(true)}
            className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-black flex items-center justify-center transition-colors"
            title="بوابة إدارة المتجر (خاص بالمالك)"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Search, Cart, WhatsApp) */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Brand Logo & Name (All White, Turns Gold on Click) */}
          <div 
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-xl overflow-hidden border-2 border-brand-gold shadow-lg shadow-brand-gold/20 bg-black flex items-center justify-center p-0.5">
              <img 
                src="/logo.png" 
                alt="مرتفعات ستور" 
                className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              {/* BRAND TEXT: Entirely White, turns Golden Yellow upon click/hover */}
              <span className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 group-active:text-amber-400 transition-colors">
                مرتفعات ستور
              </span>
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-gray-400 block -mt-1 font-sans">
                Mortafaat Store
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="ابحث عن منتج، كود، ماركة، أو قسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 text-white placeholder-gray-400 text-sm rounded-full py-2.5 pr-11 pl-4 border border-zinc-700 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all"
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

          {/* Action Buttons: Cart & Mobile Drawer */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* WhatsApp Direct Order Button */}
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
              className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-xl bg-brand-gold text-brand-black hover:bg-amber-400 transition-all shadow-md shadow-brand-gold/20"
              title="سلة المشتريات"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 text-gray-300 border border-zinc-700"
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
              className="w-full bg-zinc-900 text-white placeholder-gray-400 text-xs rounded-full py-2 pr-10 pl-4 border border-zinc-700 focus:border-brand-gold focus:outline-none"
            />
            <Search className="w-4 h-4 text-brand-gold absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. CATEGORIES NAVIGATION BAR (Dynamic from categories state!) */}
      <div className="bg-zinc-900 dark:bg-zinc-950 border-t border-zinc-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none">
            <div className="flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-brand-gold text-brand-black shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                جميع الأقسام
              </button>

              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-gold text-brand-black shadow-md'
                        : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                تخفيضات كبرى 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-4 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">أقسام المتجر:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setSelectedCategory('all'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-lg text-xs font-semibold ${selectedCategory === 'all' ? 'bg-brand-gold text-black font-bold' : 'bg-zinc-800 text-gray-200'}`}
            >
              جميع الأقسام
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setMobileMenuOpen(false); }}
                className={`p-2.5 rounded-lg text-xs font-semibold ${selectedCategory === cat.id ? 'bg-brand-gold text-black font-bold' : 'bg-zinc-800 text-gray-200'}`}
              >
                {language === 'ar' ? cat.nameAr : cat.nameEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Admin PIN Authentication Modal (Triggered by Top Owner Icon) */}
      {isAdminPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 text-white rounded-3xl max-w-sm w-full p-6 border border-brand-gold/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-gold" />
                <h3 className="font-black text-sm text-white">تسجيل دخول مالك المتجر</h3>
              </div>
              <button onClick={() => setIsAdminPinModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-gray-300">
              أدخل رمز المرور السري (الافتراضي: 1234) للوصول للوحة تحكم المتجر الكاملة:
            </p>

            <form onSubmit={handleAdminAuth} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="رمز PIN..."
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-700 text-white font-mono text-center text-lg tracking-widest focus:border-brand-gold focus:outline-none"
              />

              {pinError && (
                <p className="text-red-400 text-xs font-bold text-center">رمز المرور غير صحيح!</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs shadow-md hover:brightness-105 transition-all"
              >
                دخول إلى لوحة التحكم
              </button>
            </form>
          </div>
        </div>
      )}

    </header>
  );
};
