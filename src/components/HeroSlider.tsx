import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, ChevronLeft, Sparkles, Shield, Truck, CreditCard } from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const { setSelectedCategory } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "أناقة وفخامة تليق بك",
      subtitle: "تشكيلة الشتاء الفاخرة وعطور شموخ المرتفعات الملكية",
      tag: "وصل حديثاً 2026",
      category: "fashion",
      cta: "تسوق الأزياء والعطور",
      bgGradient: "from-black via-zinc-900 to-amber-950",
      accent: "text-amber-400",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "أقوى عروض الإلكترونيات والذكاء",
      subtitle: "سماعات عازلة للضوضاء، ساعات ذكية، وشواحن فائقة السرعة بخصم حتى 40%",
      tag: "تخفيضات كبرى",
      category: "electronics",
      cta: "اكتشف الإلكترونيات",
      bgGradient: "from-zinc-950 via-slate-900 to-stone-900",
      accent: "text-brand-gold",
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "بيتك يستحق الأفضل دائماً",
      subtitle: "قلايات هوائية ذكية وأجهزة منزلية متطورة تجعل حياتك أسهل",
      tag: "ضمان عامين كاملين",
      category: "home",
      cta: "تسوق الأجهزة المنزلية",
      bgGradient: "from-black via-neutral-900 to-yellow-950",
      accent: "text-yellow-400",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative overflow-hidden bg-brand-black">
      {/* Slide Container */}
      <div className="relative h-[320px] sm:h-[400px] md:h-[460px] w-full">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background image with overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-7000"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center">
              <div className="max-w-2xl space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs sm:text-sm font-bold backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.tag}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                  {slide.title}
                </h1>

                <p className="text-gray-300 text-xs sm:text-base md:text-lg leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCategory(slide.category)}
                    className="px-6 py-2.5 sm:py-3 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-brand-gold/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {slide.cta}
                  </button>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    توصيل سريع متاح الآن
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Controls */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-brand-gold hover:text-black flex items-center justify-center transition-colors border border-white/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-brand-gold hover:text-black flex items-center justify-center transition-colors border border-white/10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? 'w-7 bg-brand-gold' : 'w-2 bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Trust Badges Strip (Under Hero) */}
      <div className="bg-brand-charcoal border-y border-brand-border py-3">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-300 text-xs sm:text-sm font-semibold">
            <Truck className="w-4 h-4 text-brand-gold" />
            <span>شحن لجميع محافظات مصر</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-300 text-xs sm:text-sm font-semibold">
            <Shield className="w-4 h-4 text-brand-gold" />
            <span>منتجات أصلية ومضمونة 100%</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-300 text-xs sm:text-sm font-semibold">
            <CreditCard className="w-4 h-4 text-brand-gold" />
            <span>دفع عند الاستلام + إنستاباي</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>استبدال واسترجاع بكل سهولة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
