import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MessageCircle, MapPin, Shield, Truck, Award, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setSelectedCategory, setActivePolicyModal, loginAdmin } = useStore();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pinInput)) {
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <footer className="bg-brand-black text-white border-t border-brand-gold/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-gold bg-black p-0.5">
                <img src="/logo.png" alt="مرتفعات ستور" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">مرتفعات ستور</h3>
                <span className="text-xs text-brand-gold font-sans font-semibold">Mortafaat Store</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              متجرك الشامل والمتخصص في أرقى الأزياء، الإلكترونيات، العطور الملكية، ومستلزمات المنزل والعناية الشخصية في مصر مع خدمة الدفع عند الاستلام والمعاينة قبل الدفع.
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-brand-gold" /> شحن سريع
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-brand-gold" /> ضمان الجودة
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-brand-gold" /> أصلي 100%
              </span>
            </div>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-brand-gold tracking-wide">أقسام المتجر</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button 
                  onClick={() => setSelectedCategory('electronics')} 
                  className="hover:text-white transition-colors"
                >
                  الإلكترونيات والذكاء
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('fashion')} 
                  className="hover:text-white transition-colors"
                >
                  الملابس والأزياء الشتوية والصيفية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('perfumes')} 
                  className="hover:text-white transition-colors"
                >
                  عطور شموخ المرتفعات
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('home')} 
                  className="hover:text-white transition-colors"
                >
                  الأجهزة والأدوات المنزلية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('personal-care')} 
                  className="hover:text-white transition-colors"
                >
                  العناية والأدوات الشخصية
                </button>
              </li>
            </ul>
          </div>

          {/* Store Policies (For Fawry / Kashier Compliance) */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-brand-gold tracking-wide">سياسات المتجر والضمان</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => setActivePolicyModal('return')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5"
                >
                  <span>✓ سياسة الاستبدال والاسترجاع (14 يوماً)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('shipping')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5"
                >
                  <span>✓ سياسة الشحن والتوصيل لكافة المحافظات</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5"
                >
                  <span>✓ سياسة الخصوصية والشروط والأحكام</span>
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-gray-300 block mb-1">طريقة الدفع المعتمدة حالياً:</span>
              <span className="inline-block bg-brand-charcoal text-xs font-bold px-3 py-1 rounded-lg border border-brand-border text-emerald-400">
                💵 الدفع عند الاستلام مع المعاينة المجانية
              </span>
            </div>
          </div>

          {/* Contact & Admin Portal Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-brand-gold tracking-wide">تواصل معنا</h4>
            
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>الخط الساخن: {settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>واتساب المبيعات: {settings.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span>جمهورية مصر العربية - توصيل لكل المحافظات</span>
              </div>
            </div>

            {/* Discreet Admin Login Trigger */}
            <div className="pt-4 border-t border-brand-border/40">
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="text-[11px] text-gray-500 hover:text-brand-gold font-semibold transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>بوابة إدارة المتجر (Admin Suite)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Bottom */}
        <div className="pt-6 border-t border-brand-charcoal flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 جميع الحقوق محفوظة لـ <strong>مرتفعات ستور (Mortafaat Store)</strong></p>
          <p className="flex items-center gap-1">
            مبني بأحدث معايير الأمان والتوافق مع بوابات الدفع الإلكتروني
          </p>
        </div>
      </div>

      {/* Admin PIN Authentication Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal text-white rounded-3xl max-w-sm w-full p-6 border border-brand-gold/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-gold" />
                <h3 className="font-black text-sm text-white">تسجيل دخول الإدارة</h3>
              </div>
              <button onClick={() => setIsPinModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-gray-300">
              أدخل رمز المرور السري للدخول إلى برنامج التحكم وإدارة المتجر (الرمز الافتراضي: 1234):
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="رمز PIN السري..."
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-gray-600 text-white font-mono text-center text-lg tracking-widest focus:border-brand-gold focus:outline-none"
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
    </footer>
  );
};
