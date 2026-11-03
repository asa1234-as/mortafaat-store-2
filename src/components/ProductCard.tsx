import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Star, MessageCircle, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, settings } = useStore();

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `السلام عليكم، أريد طلب هذا المنتج من مرتفعات ستور:\n` +
      `📦 اسم المنتج: ${product.name}\n` +
      `💰 السعر: ${product.price} جنيه مصري\n` +
      `رابط الصورة: ${product.images[0] || ''}`
    );
    window.open(`https://wa.me/${settings.whatsapp}?text=${message}`, '_blank');
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-2xl border border-gray-200 hover:border-brand-gold overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-md">
            خصم {discountPercent}%
          </span>
        )}

        {/* In Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              نفذت الكمية
            </span>
          </div>
        )}

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="w-10 h-10 rounded-full bg-white text-brand-black hover:bg-brand-gold flex items-center justify-center shadow-lg transition-colors"
            title="معاينة سريعة"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-gray-500">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-brand-goldDark line-clamp-2 transition-colors mb-2 leading-snug">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-black text-brand-black">
              {product.price.toLocaleString()} <span className="text-xs font-bold text-gray-500">ج.م</span>
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString()} ج.م
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button
              disabled={!product.inStock}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="col-span-3 py-2 px-2 rounded-xl bg-brand-black text-white hover:bg-brand-gold hover:text-brand-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>أضف للسلة</span>
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="col-span-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
              title="اطلب عبر واتساب فوراً"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
