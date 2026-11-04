import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

import { t, pn } from '../i18n';
export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    cartSubtotal,
    discountAmount,
    cartFinalTotal,
    appliedCoupon,
    settings,
    setIsCheckoutOpen
  } = useStore();

  if (!isCartOpen) return null;

  const shipping = cartSubtotal >= settings.freeShippingThreshold || cartSubtotal === 0 ? 0 : settings.shippingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 bg-brand-black text-white flex items-center justify-between border-b border-brand-gold/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-base">{t("سلة مشتريات مرتفعات ستور")}</h3>
            <span className="text-xs bg-brand-gold text-brand-black px-2 py-0.5 rounded-full font-bold">
              {cart.length}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="bg-amber-50 p-3 border-b border-amber-200 text-xs">
          {cartSubtotal >= settings.freeShippingThreshold ? (
            <p className="text-emerald-700 font-bold text-center">
              {t("🎉 مبروك! لقد حصلت على شحن مجاني لطلبك.")}
            </p>
          ) : (
            <div>
              <p className="text-gray-700 text-center font-semibold mb-1">
                {t("أضف منتجات بقيمة")} <span className="font-bold text-amber-700">{settings.freeShippingThreshold - cartSubtotal} {t("ج.م")}</span> {t("للحصول على شحن مجاني!")}
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-gold h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cartSubtotal / settings.freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-3" />
              <p className="font-bold text-gray-700 text-base">{t("سلة المشتريات فارغة")}</p>
              <p className="text-xs text-gray-400 mt-1">{t("تصفح أقسام المتجر وأضف منتجاتك المفضلة الآن")}</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2 rounded-xl bg-brand-black text-white text-xs font-bold hover:bg-brand-gold hover:text-black transition-colors"
              >
                {t("تصفح المنتجات")}
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div 
                key={`${item.product.id}-${idx}`}
                className="flex gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <img
                  src={item.product.images[0]}
                  alt={pn(item.product)}
                  className="w-16 h-16 rounded-xl object-cover bg-white border border-gray-200 flex-shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {pn(item.product)}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      {item.selectedSize && <span>{t("المقاس:")} {item.selectedSize}</span>}
                      {item.selectedColor && <span>{t("اللون:")} {item.selectedColor}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-black text-brand-black">
                      {(item.product.price * item.quantity).toLocaleString()} {t("ج.م")}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(idx, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t("قيمة المنتجات:")}</span>
                <span className="font-bold text-gray-900">{cartSubtotal.toLocaleString()} {t("ج.م")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t("خصم الكوبون (")}{appliedCoupon?.code}):</span>
                  <span>- {discountAmount.toLocaleString()} {t("ج.م")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{t("مصاريف الشحن والتوصيل:")}</span>
                <span className="font-bold text-emerald-600">
                  {shipping === 0 ? t("مجاني 🎉") : t("{0} ج.م", shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-brand-black pt-2 border-t border-gray-200">
                <span>{t("الإجمالي النهائي:")}</span>
                <span className="text-base text-brand-goldDark">{cartFinalTotal.toLocaleString()} {t("ج.م")}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-gold-gradient text-brand-black font-black text-sm hover:brightness-105 shadow-xl shadow-brand-gold/25 flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span>{t("متابعة إتمام الطلب")}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
