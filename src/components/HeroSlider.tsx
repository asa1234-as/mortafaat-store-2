import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, ChevronLeft, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { renderDynamicIcon } from '../lib/iconMap';
import { t } from '../i18n';

export const HeroSlider: React.FC = () => {
  const { slides, settings, setSelectedCategory, language } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const intervalDuration = (settings.sliderIntervalSeconds || 5) * 1000;
  const overlayOpacity = settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 0.35;

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, intervalDuration);
    return () => clearInterval(timer);
  }, [slides, intervalDuration]);

  if (!slides || slides.length === 0) return null;

  // Fallback default trust badges if none configured
  const trustBadges = settings.trustBadges && settings.trustBadges.length > 0 
    ? settings.trustBadges 
    : [
        {
          id: 'tb-1',
          icon: 'Truck',
          titleAr: 'شحن لجميع محافظات مصر',
          titleEn: 'Shipping to all Egypt Governorates'
        },
        {
          id: 'tb-2',
          icon: 'ShieldCheck',
          titleAr: 'منتجات أصلية ومضمونة 100%',
          titleEn: '100% Guaranteed Authentic Products'
        },
        {
          id: 'tb-3',
          icon: 'CreditCard',
          titleAr: 'دفع عند الاستلام مع المعاينة',
          titleEn: 'Cash on Delivery with Inspection'
        },
        {
          id: 'tb-4',
          icon: 'Sparkles',
          titleAr: 'استبدال واسترجاع بكل سهولة',
          titleEn: 'Hassle-Free Returns & Exchanges'
        }
      ];

  return (
    <div className="relative overflow-hidden bg-brand-black">
      {/* Slide Container */}
      <div className="relative h-[320px] sm:h-[400px] md:h-[460px] w-full">
        {slides.map((slide, idx) => {
          const slideTitle = language === 'ar' 
            ? (slide.titleAr || slide.title) 
            : (slide.titleEn || slide.titleAr || slide.title);

          const slideSubtitle = language === 'ar' 
            ? (slide.subtitleAr || slide.subtitle) 
            : (slide.subtitleEn || slide.subtitleAr || slide.subtitle);

          const slideTag = language === 'ar' 
            ? (slide.tagAr || slide.tag) 
            : (slide.tagEn || slide.tagAr || slide.tag);

          const slideCta = language === 'ar' 
            ? (slide.ctaTextAr || slide.ctaText || "تسوق الآن") 
            : (slide.ctaTextEn || slide.ctaTextAr || slide.ctaText || "Shop Now");

          const hasVideo = Boolean(slide.videoUrl);

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Media Layer (Image or Video) */}
              <div className="absolute inset-0 overflow-hidden">
                {hasVideo ? (
                  <video
                    src={slide.videoUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <img
                    src={slide.image}
                    alt={slideTitle}
                    className="w-full h-full object-cover object-center banner-image-drift"
                  />
                )}

                {/* Controlled Dark Overlay Layer */}
                <div 
                  className="absolute inset-0 transition-all duration-300 pointer-events-none"
                  style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
                />

                {/* Subtle base gradient for aesthetic depth */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-black/20 pointer-events-none"
                  style={{ opacity: Math.max(0.15, overlayOpacity) }}
                />

                {/* Subtle side gradient to emphasize text */}
                <div 
                  className={`absolute inset-0 ${language === 'ar' ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black/80 via-black/40 to-transparent pointer-events-none`}
                  style={{ opacity: Math.max(0.2, overlayOpacity) }}
                />
              </div>

              {/* Sound toggle button for video banners */}
              {hasVideo && idx === currentSlide && (
                <button
                  type="button"
                  onClick={() => setIsMuted(prev => !prev)}
                  className="absolute top-4 end-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-brand-gold hover:text-black transition-colors backdrop-blur-xs border border-white/10"
                  title={isMuted ? t("تشغيل الصوت") : t("كتم الصوت")}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              {/* Content */}
              <div className="relative max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center">
                <div className="max-w-2xl space-y-3 sm:space-y-4">
                  {slideTag && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs sm:text-sm font-bold backdrop-blur-md drop-shadow">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{slideTag}</span>
                    </div>
                  )}

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                    {slideTitle}
                  </h1>

                  <p className="text-gray-100 text-xs sm:text-base md:text-lg leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] max-w-xl">
                    {slideSubtitle}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedCategory(slide.targetCategory || 'all')}
                      className="px-6 py-2.5 sm:py-3 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-brand-gold/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      {slideCta}
                    </button>
                    <span className="text-xs text-gray-200 font-medium hidden sm:inline drop-shadow">
                      {t("توصيل سريع ومعاينة قبل الدفع")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-brand-gold hover:text-black flex items-center justify-center transition-colors border border-white/10"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-brand-gold hover:text-black flex items-center justify-center transition-colors border border-white/10"
            aria-label="Next Slide"
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
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Dynamic Trust Badges Strip (Under Hero) */}
      <div className="bg-zinc-900 border-y border-zinc-800 py-3.5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {trustBadges.map((badge) => {
            const badgeTitle = language === 'ar' ? badge.titleAr : (badge.titleEn || badge.titleAr);
            return (
              <div 
                key={badge.id} 
                className="flex items-center justify-center gap-2 text-gray-200 text-xs sm:text-sm font-semibold"
              >
                <span className="text-brand-gold flex-shrink-0">
                  {renderDynamicIcon(badge.icon, { className: "w-4 h-4" })}
                </span>
                <span className="line-clamp-1">{badgeTitle}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
