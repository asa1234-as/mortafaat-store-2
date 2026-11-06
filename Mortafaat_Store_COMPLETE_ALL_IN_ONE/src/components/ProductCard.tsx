import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Star, Zap } from 'lucide-react';

import { t } from '../i18n';
interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, 
    setSelectedProduct, 
    currentUser, 
    setIsAuthModalOpen, 
    setIsCheckoutOpen,
    language 
  } = useStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Switch to another image on hover/touch smoothly
  const handleImageSwitch = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    
    // Check if user is logged in
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const displayImages = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'];

  return (
    <div 
      onClick={() => setSelectedProduct(product)}
      className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-brand-gold overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Product Image Box */}
      <div 
        onMouseEnter={handleImageSwitch}
        onMouseLeave={handleImageLeave}
        onTouchStart={handleImageSwitch}
        className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-zinc-800"
      >
        {displayImages.map((imgUrl, i) => (
          <img
            key={i}
            src={imgUrl}
            alt={language === 'ar' ? product.name : (product.nameEn || product.name)}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
              i === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            loading="lazy"
          />
        ))}

        {/* Multiple images indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 flex gap-1 z-10 pointer-events-none">
            {displayImages.map((_, i) => (
              <span 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentImageIndex ? 'bg-brand-gold w-3' : 'bg-black/40'
                }`} 
              />
            ))}
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 z-10 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md pointer-events-none">
            {t("خصم")} {discountPercent}%
          </span>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {t("نفذت الكمية")}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between dark:text-white">
        <div>
          {/* Rating: 5 empty outline stars waiting for real customer ratings! */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${
                    product.reviewsCount > 0 && i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-gray-300 dark:text-zinc-600'
                  }`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500">
              {product.reviewsCount > 0 ? `(${product.reviewsCount})` : t("(0 تقييم)")}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100 group-hover:text-brand-goldDark line-clamp-2 transition-colors mb-2 leading-snug">
            {language === 'ar' ? product.name : (product.nameEn || product.name)}
          </h3>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-black text-black dark:text-white">
              {product.price.toLocaleString()} <span className="text-xs font-bold text-gray-500">{language === 'ar' ? t("ج.م") : 'EGP'}</span>
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString()} {language === 'ar' ? t("ج.م") : 'EGP'}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now (اشتري الآن) */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              disabled={!product.inStock}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="py-2 px-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-brand-gold" />
              <span>{language === 'ar' ? t("أضف للسلة") : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="py-2 px-2 rounded-xl bg-gold-gradient text-brand-black hover:brightness-105 font-black text-[11px] flex items-center justify-center gap-1 transition-all shadow-sm"
              title={t("شراء فوري مع المعاينة")}
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>{language === 'ar' ? t("اشتري الآن") : 'Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
