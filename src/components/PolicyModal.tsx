import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

import { t } from '../i18n';
export const PolicyModal: React.FC = () => {
  const { activePolicyModal, setActivePolicyModal, settings, language } = useStore();

  if (!activePolicyModal) return null;

  const getTitle = () => {
    switch (activePolicyModal) {
      case 'return': return t("سياسة الاستبدال والاسترجاع");
      case 'shipping': return t("سياسة الشحن والتسليم");
      case 'privacy': return t("سياسة الخصوصية وشروط الاستخدام");
    }
  };

  const getIcon = () => {
    switch (activePolicyModal) {
      case 'return': return RotateCcw;
      case 'shipping': return Truck;
      case 'privacy': return Lock;
    }
  };

  const getContent = () => {
    const isEn = language === 'en';
    switch (activePolicyModal) {
      case 'return': return (isEn && settings.returnPolicyTextEn) ? settings.returnPolicyTextEn : (settings.returnPolicyTextAr || settings.returnPolicyText);
      case 'shipping': return (isEn && settings.shippingPolicyTextEn) ? settings.shippingPolicyTextEn : (settings.shippingPolicyTextAr || settings.shippingPolicyText);
      case 'privacy': return (isEn && settings.privacyPolicyTextEn) ? settings.privacyPolicyTextEn : (settings.privacyPolicyTextAr || settings.privacyPolicyText);
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-brand-gold/40 space-y-4">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-brand-goldDark flex items-center justify-center">
              <IconComponent className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-gray-900">{getTitle()}</h3>
          </div>
          <button
            onClick={() => setActivePolicyModal(null)}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-gray-200">
          <p className="whitespace-pre-line">{getContent()}</p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{t("مرتفعات ستور يضمن حقوق المستهلك بنسبة 100% وفقاً لأحكام القانون المصري لحماية المستهلك.")}</span>
        </div>

        <button
          onClick={() => setActivePolicyModal(null)}
          className="w-full py-2.5 rounded-xl bg-brand-black text-white text-xs font-bold hover:bg-brand-gold hover:text-black transition-colors"
        >
          {t("فهمت وموافق")}
        </button>
      </div>
    </div>
  );
};
