import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
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
    updateProduct 
  } = useStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
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
    setIsCheckoutOpen(true);
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
      customerName: newReviewAuthor || currentUser?.name || 'عميل مشتري',
      rating: newReviewRating,
      comment: newReviewComment,
      createdAt: new Date().toLocaleDateString('ar-EG')
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
    alert('شكراً لتقييمك! تم نشر تقييمك الحقيقي للمنتج بنجاح.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-brand-gold/30 my-8">
        
        {/* Close Button */}
        <button
          onClick={() => { setSelectedProduct(null); setShowVideo(false); }}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Gallery / Media Column */}
          <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm relative flex items-center justify-center">
              {showVideo && selectedProduct.videoUrl ? (
                selectedProduct.videoUrl.includes('youtube') || selectedProduct.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={selectedProduct.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    title="Product Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-2xl"
                  />
                ) : (
                  <video 
                    src={selectedProduct.videoUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )
              ) : (
                <img
                  src={selectedProduct.images[selectedImage] || selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain p-2"
                />
              )}

              {selectedProduct.originalPrice && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                  تخفيض خاص
                </span>
              )}
            </div>

            {/* Thumbnails + Video selector */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedImage(idx); setShowVideo(false); }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-white dark:bg-zinc-900 ${
                    !showVideo && selectedImage === idx ? 'border-brand-gold ring-2 ring-brand-gold/40' : 'border-gray-200 dark:border-zinc-800'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}

              {selectedProduct.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`w-14 h-14 rounded-xl border-2 flex-shrink-0 bg-black text-white flex flex-col items-center justify-center text-[10px] font-bold ${
                    showVideo ? 'border-brand-gold ring-2 ring-brand-gold/40' : 'border-zinc-700'
                  }`}
                >
                  <Play className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  <span>فيديو</span>
                </button>
              )}
            </div>

            {/* Trust strip */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs text-gray-600 dark:text-gray-400">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-brand-gold" />
                <span>شحن سريع</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-brand-gold" />
                <span>معاينة قبل الدفع</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <span>ضمان أصلي</span>
              </div>
            </div>
          </div>

          {/* Product Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Rating Section (Starts empty waiting for real purchases!) */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          selectedProduct.reviewsCount > 0 && i < Math.floor(selectedProduct.rating) 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-gray-300 dark:text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {selectedProduct.reviewsCount > 0 
                      ? `${selectedProduct.rating} (${selectedProduct.reviewsCount} تقييم)` 
                      : 'بانتظار أول تقييم للمنتج'}
                  </span>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-[11px] text-brand-goldDark hover:underline font-bold flex items-center gap-1"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>أضف تقييمك</span>
                </button>
              </div>

              {/* Review Input Box */}
              {showReviewForm && (
                <form onSubmit={handleAddReview} className="p-3 rounded-2xl bg-amber-50/70 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-xs space-y-2 mb-4">
                  <span className="font-bold block text-gray-800 dark:text-gray-200">أضف تقييمك وتجربتك الحقيقية:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">التقييم:</span>
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
                    placeholder="رأيك الصريح في جودة المنتج..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 text-xs"
                  />
                  <button type="submit" className="px-4 py-1.5 rounded-xl bg-brand-black text-brand-gold font-bold text-xs">
                    نشر التقييم
                  </button>
                </form>
              )}

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white mb-1">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-gray-400 font-sans mb-4">
                {selectedProduct.nameEn}
              </p>

              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-3 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-black dark:text-white">
                  {selectedProduct.price.toLocaleString()} <span className="text-sm font-bold text-gray-600 dark:text-gray-300">جنيه مصري</span>
                </span>
                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through">
                      {selectedProduct.originalPrice.toLocaleString()} ج.م
                    </span>
                    <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                      وفر {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {selectedProduct.description}
              </p>

              {/* Features list */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">أبرز المميزات:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedProduct.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">الكمية:</span>
                <div className="flex items-center border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs: Add to Cart & Buy Now (اشتري الآن) */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={handleAddToCart}
                className="py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-brand-gold" />
                <span>إضافة إلى السلة</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 rounded-2xl bg-gold-gradient text-brand-black font-black text-xs hover:brightness-105 shadow-lg shadow-brand-gold/30 flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>اشتري الآن ({selectedProduct.price * quantity} ج.م)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
