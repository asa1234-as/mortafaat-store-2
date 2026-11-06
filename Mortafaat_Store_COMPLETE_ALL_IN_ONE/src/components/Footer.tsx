import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MessageCircle, MapPin, Shield, Truck, Award } from 'lucide-react';

import { t } from '../i18n';
export const Footer: React.FC = () => {
  const { settings, setSelectedCategory, setActivePolicyModal } = useStore();

  return (
    <footer className="bg-brand-black text-white border-t border-brand-gold/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-gold bg-black p-0.5">
                <img src="/logo.png" alt={t("مرتفعات ستور")} className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{t("مرتفعات ستور")}</h3>
                <span className="text-xs text-brand-gold font-sans font-semibold">Mortafaat Store</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {t("متجرك الشامل والمتخصص في أرقى الأزياء، الإلكترونيات، العطور الملكية، ومستلزمات المنزل والعناية الشخصية في مصر مع خدمة الدفع عند الاستلام والمعاينة قبل الدفع.")}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-brand-gold" /> {t("شحن سريع")}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-brand-gold" /> {t("ضمان الجودة")}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-brand-gold" /> {t("أصلي 100%")}
              </span>
            </div>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-brand-gold tracking-wide">{t("أقسام المتجر")}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button 
                  onClick={() => setSelectedCategory('electronics')} 
                  className="hover:text-white transition-colors"
                >
                  {t("الإلكترونيات والذكاء")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('fashion')} 
                  className="hover:text-white transition-colors"
                >
                  {t("الملابس والأزياء الشتوية والصيفية")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('perfumes')} 
                  className="hover:text-white transition-colors"
                >
                  {t("عطور شموخ المرتفعات")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('home')} 
                  className="hover:text-white transition-colors"
                >
                  {t("الأجهزة والأدوات المنزلية")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setSelectedCategory('personal-care')} 
                  className="hover:text-white transition-colors"
                >
                  {t("العناية والأدوات الشخصية")}
                </button>
              </li>
            </ul>
          </div>

          {/* Store Policies (For Fawry / Kashier Compliance) */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-brand-gold tracking-wide">{t("سياسات المتجر والضمان")}</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => setActivePolicyModal('return')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5"
                >
                  <span>{t("✓ سياسة الاستبدال والاسترجاع (14 يوماً)")}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('shipping')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5"
                >
                  <span>{t("✓ سياسة الشحن والتوصيل لكافة المحافظات")}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-brand-gold transition-colors flex items-center gap-1.5"
                >
                  <span>{t("✓ سياسة الخصوصية والشروط والأحكام")}</span>
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-gray-300 block mb-1">{t("طريقة الدفع المعتمدة حالياً:")}</span>
              <span className="inline-block bg-brand-charcoal text-xs font-bold px-3 py-1 rounded-lg border border-brand-border text-emerald-400">
                {t("💵 الدفع عند الاستلام مع المعاينة المجانية")}
              </span>
            </div>
          </div>

          {/* Contact & Admin Portal Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-brand-gold tracking-wide">{t("تواصل معنا")}</h4>
            
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold" />
                <span>{t("الخط الساخن:")} {settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{t("واتساب المبيعات:")} {settings.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span>{t("جمهورية مصر العربية - توصيل لكل المحافظات")}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Copyright Bottom */}
        <div className="pt-6 border-t border-brand-charcoal flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>{t("© 2026 جميع الحقوق محفوظة لـ")} <strong>{t("مرتفعات ستور (Mortafaat Store)")}</strong></p>
          <p className="flex items-center gap-1">
            {t("مبني بأحدث معايير الأمان والتوافق مع بوابات الدفع الإلكتروني")}
          </p>
        </div>
      </div>

    </footer>
  );
};
