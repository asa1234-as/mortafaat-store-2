import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  ShoppingCart, 
  MessageCircle, 
  Star, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, settings } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  if (!selectedProduct) return null;

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(
      `مرحباً مرتفعات ستور، أريد طلب هذا المنتج:\n` +
      `📦 ${selectedProduct.name}\n` +
      `🔢 الكمية: ${quantity}\n` +
      `${selectedSize ? `📏 المقاس: ${selectedSize}\n` : ''}` +
      `${selectedColor ? `🎨 اللون: ${selectedColor}\n` : ''}` +
      `💰 الإجمالي: ${selectedProduct.price * quantity} ج.م`
    );
    window.open(`https://wa.me/${settings.whatsapp}?text=${message}`, '_blank');
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, selectedSize || undefined, selectedColor || undefined);
    setSelectedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-brand-gold/30 my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Gallery Column */}
          <div className="p-4 sm:p-6 bg-zinc-50 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm relative">
              <img
                src={selectedProduct.images[selectedImage] || selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-contain p-2"
              />
              {selectedProduct.originalPrice && (
                <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                  تخفيض خاص
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {selectedProduct.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-white ${
                      selectedImage === idx ? 'border-brand-gold ring-2 ring-brand-gold/40' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees Box */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
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
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {selectedProduct.rating} ({selectedProduct.reviewsCount} تقييم حقيقي)
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black text-gray-950 mb-1">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-gray-400 font-sans mb-4">
                {selectedProduct.nameEn}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-brand-black">
                  {selectedProduct.price.toLocaleString()} <span className="text-sm font-bold text-gray-700">جنيه مصري</span>
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {selectedProduct.originalPrice.toLocaleString()} ج.م
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4">
                {selectedProduct.description}
              </p>

              {/* Features list */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  <span className="text-xs font-bold text-gray-900 block">أبرز المميزات:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedProduct.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes if available */}
              {selectedProduct.sizes && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-900 block mb-1.5">المقاس:</span>
                  <div className="flex gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          selectedSize === s
                            ? 'bg-brand-black text-brand-gold border-brand-gold'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors if available */}
              {selectedProduct.colors && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-900 block mb-1.5">اللون:</span>
                  <div className="flex gap-2">
                    {selectedProduct.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          selectedColor === c.name
                            ? 'bg-brand-black text-brand-gold border-brand-gold'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-gray-900">الكمية:</span>
                <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-200 text-gray-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-black text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-200 text-gray-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-2xl bg-gold-gradient text-brand-black font-extrabold text-sm hover:brightness-105 shadow-lg shadow-brand-gold/30 flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>إضافة إلى سلة المشتريات ({selectedProduct.price * quantity} ج.م)</span>
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>طلب سريع وتأكيد فوري عبر واتساب</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
