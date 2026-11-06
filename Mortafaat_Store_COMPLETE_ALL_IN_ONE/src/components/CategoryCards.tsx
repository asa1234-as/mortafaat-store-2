import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft } from 'lucide-react';
import { renderDynamicIcon } from '../lib/iconMap';
import { t } from '../i18n';

export const CategoryCards: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products, language } = useStore();

  const getProductCount = (catId: string) => {
    return products.filter(p => p.category === catId).length;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-black flex items-center gap-2">
            <span className="w-2.5 h-6 bg-brand-gold rounded-full inline-block"></span>
            {t("تسوق حسب الأقسام")}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t("اختر القسم المفضل لديك وتصفح أفضل منتجات مرتفعات ستور")}
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs sm:text-sm font-bold text-brand-goldDark hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t("عرض كل الأقسام")}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getProductCount(cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer p-4 transition-all duration-300 border ${
                isSelected
                  ? 'bg-brand-black text-white border-brand-gold shadow-xl scale-[1.02]'
                  : 'bg-white hover:bg-zinc-50 border-gray-200 hover:border-brand-gold/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner ${
                  isSelected 
                    ? 'bg-brand-gold text-brand-black' 
                    : 'bg-brand-black text-brand-gold'
                }`}>
                  {renderDynamicIcon(cat.icon || cat.id, { className: "w-7 h-7" })}
                </div>

                <div>
                  <h3 className={`font-bold text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-900 group-hover:text-brand-goldDark'}`}>
                    {language === 'ar' ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                  </h3>
                  <span className={`text-[11px] block mt-0.5 ${isSelected ? 'text-brand-gold' : 'text-gray-500'}`}>
                    {count} {t("منتجات متوفرة")}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-brand-gold animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
