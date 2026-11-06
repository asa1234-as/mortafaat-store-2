import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { t, pn, locale } from '../i18n';
import { 
  X, 
  ShoppingCart, 
  Star, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Plus,
  Minus,
  Play,
  Zap,
  Volume2,
  VolumeX,
  MessageSquarePlus
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    addToCart, 
    currentUser, 
    setIsAuthModalOpen, 
    setIsCheckoutOpen, 
    updateProduct,
    language
  } = useStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Review Form
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!selectedProduct) return null;

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, selectedSize || undefined, selectedColor || undefined);
    setSelectedProduct(null);
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, selectedSize || undefined, selectedColor || undefined);
    setSelectedProduct(null);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const review = {
      id: `rev-${Date.now()}`,
      customerName: newReviewAuthor || currentUser?.name || t("عميل مشتري"),
      rating: newReviewRating,
      comment: newReviewComment,
      createdAt: new Date().toLocaleDateString(locale())
    };

    const updatedReviews = [...(selectedProduct.reviews || []), review];
    const totalScore = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalScore / updatedReviews.length).toFixed(1));

    updateProduct(selectedProduct.id, {
      reviews: updatedReviews,
      rating: avgRating,
      reviewsCount: updatedReviews.length
    });

    setNewReviewComment('');
    setShowReviewForm(false);
    alert(t("شكراً لتقييمك! تم نشر تقييمك الحقيقي للمنتج بنجاح."));
  };

  // Helper to extract clean YouTube embed URL
  const getEmbedVideoUrl = (url: string) => {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('watch?v=')) {
          videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
        } else if (url.includes('/shorts/')) {
          videoId = url.split('/shorts/')[1]?.split('?')[0] || '';
        } else if (url.includes('/embed/')) {
          videoId = url.split('/embed/')[1]?.split('?')[0] || '';
        }
        if (videoId) {
          return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`;
        }
      }
    } catch {
      // Fallback
    }
    return url;
  };

  const isYouTube = selectedProduct.videoUrl && (
    selectedProduct.videoUrl.includes('youtube') || selectedProduct.videoUrl.includes('youtu.be')
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      {/* Modal Container with Responsive Constraints */}
      <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white rounded-3xl max-w-4xl w-[96vw] sm:w-full max-h-[92vh] overflow-y-auto shadow-2xl border-2 border-brand-gold/30 my-auto">
        
        {/* Prominent Accessible Close Button */}
        <button
          onClick={() => { setSelectedProduct(null); setShowVideo(false); }}
          className="absolute top-3 left-3 z-30 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white hover:text-brand-gold flex items-center justify-center transition-all shadow-xl border border-white/20 active:scale-90"
          title={t("إغلاق نافذة تفاصيل المنتج")}
          aria-label={t("إغلاق")}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Gallery / Media Column */}
          <div className="p-3 sm:p-6 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between border-b md:border-b-0 md:border-l md:border-r border-gray-200 dark:border-zinc-800">
            <div className="w-full aspect-square max-h-[340px] sm:max-h-[420px] rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm relative flex items-center justify-center mx-auto">
              {showVideo && selectedProduct.videoUrl ? (
                isYouTube ? (
                  <iframe
                    src={getEmbedVideoUrl(selectedProduct.videoUrl)}
                    title={pn(selectedProduct)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-2xl border-0"
                  />
                ) : (
                  <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
                    <video 
                      src={selectedProduct.videoUrl} 
                      controls 
                      autoPlay 
                      muted={isVideoMuted}
                      playsInline 
                      preload="metadata"
                      onError={() => setShowVideo(false)}
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                      className="absolute bottom-12 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                      title={isVideoMuted ? t("تشغيل الصوت") : t("كتم الصوت")}
                    >
                      {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-gold" />}
                    </button>
                  </div>
                )
              ) : (
                <img
                  src={selectedProduct.images[selectedImage] || selectedProduct.images[0]}
                  alt={pn(selectedProduct)}
                  className="w-full h-full object-contain p-2 transition-all duration-300"
                />
              )}

              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md z-10">
                  {t("تخفيض خاص")}
                </span>
              )}
            </div>

            {/* Thumbnails + Video Selector */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 max-w-full">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedImage(idx); setShowVideo(false); }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-white dark:bg-zinc-900 transition-all ${
                    !showVideo && selectedImage === idx ? 'border-brand-gold ring-2 ring-brand-gold/40' : 'border-gray-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}

              {selectedProduct.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex-shrink-0 bg-black text-white flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                    showVideo ? 'border-brand-gold ring-2 ring-brand-gold/40 bg-zinc-900' : 'border-zinc-700 opacity-80 hover:opacity-100'
                  }`}
                  title={t("مشاهدة فيديو المنتج")}
                >
                  <Play className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  <span className="text-[9px] mt-0.5">{t("فيديو")}</span>
                </button>
              )}
            </div>

            {/* Trust Badges Strip */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800 grid grid-cols-3 gap-1.5 text-center text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex flex-col items-center gap-0.5">
                <Truck className="w-3.5 h-3.5 text-brand-gold" />
                <span>{t("شحن سريع")}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <RotateCcw className="w-3.5 h-3.5 text-brand-gold" />
                <span>{t("معاينة قبل الدفع")}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                <span>{t("ضمان معتمد")}</span>
              </div>
            </div>
          </div>

          {/* Product Details Column */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Rating Section */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          selectedProduct.reviewsCount > 0 && i < Math.floor(selectedProduct.rating) 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-gray-300 dark:text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {selectedProduct.reviewsCount > 0 
                      ? t("{0} ({1} تقييم)", selectedProduct.rating, selectedProduct.reviewsCount) 
                      : t("بانتظار أول تقييم للمنتج")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-[11px] text-brand-goldDark hover:underline font-bold flex items-center gap-1"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>{t("أضف تقييمك")}</span>
                </button>
              </div>

              {/* Review Input Box */}
              {showReviewForm && (
                <form onSubmit={handleAddReview} className="p-3 rounded-2xl bg-amber-50/70 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-xs space-y-2 mb-3">
                  <span className="font-bold block text-gray-800 dark:text-gray-200">{t("أضف تقييمك وتجربتك الحقيقية:")}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">{t("التقييم:")}</span>
                    <div className="flex gap-1 text-amber-400 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={t("رأيك الصريح في جودة المنتج...")}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 text-xs"
                  />
                  <button type="submit" className="px-4 py-1.5 rounded-xl bg-brand-black text-brand-gold font-bold text-xs">
                    {t("نشر التقييم")}
                  </button>
                </form>
              )}

              {/* Product Title */}
              <h2 className="text-base sm:text-xl font-black text-gray-950 dark:text-white mb-1 leading-snug">
                {pn(selectedProduct)}
              </h2>
              <p className="text-xs text-gray-400 font-sans mb-3">
                {language === 'ar' ? selectedProduct.nameEn : ''}
              </p>

              {/* Price Block */}
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-3">
                <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                  {selectedProduct.price.toLocaleString()} <span className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">{t("جنيه مصري")}</span>
                </span>
                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm text-gray-400 line-through">
                      {selectedProduct.originalPrice.toLocaleString()} {t("ج.م")}
                    </span>
                    <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                      {t("وفر")} {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Description (Bilingual) */}
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                {language === 'ar' 
                  ? (selectedProduct.descriptionAr || selectedProduct.description)
                  : (selectedProduct.descriptionEn || selectedProduct.descriptionAr || selectedProduct.description)}
              </p>

              {/* Features list (Bilingual) */}
              {((language === 'en' && selectedProduct.featuresEn && selectedProduct.featuresEn.length > 0) 
                ? selectedProduct.featuresEn 
                : (selectedProduct.featuresAr || selectedProduct.features || [])).length > 0 && (
                <div className="space-y-1 mb-3">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">{t("أبرز المميزات:")}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    {((language === 'en' && selectedProduct.featuresEn && selectedProduct.featuresEn.length > 0)
                      ? selectedProduct.featuresEn
                      : (selectedProduct.featuresAr || selectedProduct.features || [])
                    ).map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{t("الكمية:")}</span>
                <div className="flex items-center border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200"
                    aria-label={t("تقليل الكمية")}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 sm:px-4 text-xs font-black">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200"
                    aria-label={t("زيادة الكمية")}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs: Add to Cart & Buy Now */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-2.5 sm:py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <ShoppingCart className="w-4 h-4 text-brand-gold" />
                <span>{t("إضافة للسلة")}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="py-2.5 sm:py-3 rounded-2xl bg-gold-gradient text-brand-black font-black text-xs hover:brightness-105 shadow-lg shadow-brand-gold/30 flex items-center justify-center gap-1.5 transition-transform active:scale-98"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>{t("اشتري الآن (")}{selectedProduct.price * quantity} {t("ج.م)")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
