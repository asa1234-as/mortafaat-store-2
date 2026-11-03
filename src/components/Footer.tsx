import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MessageCircle, MapPin, Shield, Truck, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setSelectedCategory, setCurrentView } = useStore();

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
              متجرك الشامل والمتخصص في تقديم أرقى الأزياء، أحدث الإلكترونيات الذكية، العطور الفاخرة، ومستلزمات المنزل والعناية الشخصية بأعلى جودة وأفضل سعر في مصر.
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
                  onClick={() => { setSelectedCategory('electronics'); setCurrentView('store'); }} 
                  className="hover:text-white transition-colors"
                >
                  الإلكترونيات والذكاء
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('fashion'); setCurrentView('store'); }} 
                  className="hover:text-white transition-colors"
                >
                  الملابس والأزياء الشتوية والصيفية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('perfumes'); setCurrentView('store'); }} 
                  className="hover:text-white transition-colors"
                >
                  عطور شموخ المرتفعات
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('home'); setCurrentView('store'); }} 
                  className="hover:text-white transition-colors"
                >
                  الأجهزة والأدوات المنزلية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setSelectedCategory('personal-care'); setCurrentView('store'); }} 
                  className="hover:text-white transition-colors"
                >
                  العناية والأدوات الشخصية
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-brand-gold tracking-wide">طرق الدفع والضمان</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <p>✓ الدفع عند الاستلام بعد المعاينة والفحص</p>
              <p>✓ التحويل عبر محافظ فودافون كاش والمحافظ البنكية</p>
              <p>✓ الدفع الفوري عبر تطبيق إنستاباي (InstaPay)</p>
              <p>✓ سياسة استبدال واسترجاع مرنة خلال 14 يوماً</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="bg-brand-charcoal text-[11px] font-bold px-2.5 py-1 rounded-lg border border-brand-border text-gray-300">
                Cash on Delivery
              </span>
              <span className="bg-brand-charcoal text-[11px] font-bold px-2.5 py-1 rounded-lg border border-brand-border text-red-400">
                Vodafone Cash
              </span>
              <span className="bg-brand-charcoal text-[11px] font-bold px-2.5 py-1 rounded-lg border border-brand-border text-purple-400">
                InstaPay
              </span>
            </div>
          </div>

          {/* Contact Col */}
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

            <div className="pt-2">
              <button
                onClick={() => setCurrentView('admin')}
                className="text-[11px] text-gray-400 hover:text-brand-gold font-semibold transition-colors underline"
              >
                دخول لوحة تحكم الإدارة (Admin App)
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Bottom */}
        <div className="pt-6 border-t border-brand-charcoal flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 جميع الحقوق محفوظة لـ <strong>مرتفعات ستور (Mortafaat Store)</strong></p>
          <p className="flex items-center gap-1">
            صُمم بأعلى معايير السرعة والأمان
          </p>
        </div>
      </div>
    </footer>
  );
};
