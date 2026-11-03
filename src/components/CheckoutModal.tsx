import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, Order } from '../types';
import { 
  X, 
  CheckCircle2, 
  Banknote, 
  Smartphone, 
  Building2, 
  Copy, 
  Check, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الدقهلية',
  'الشرقية',
  'المنوفية',
  'الغربية',
  'كفر الشيخ',
  'البحيرة',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'مطروح',
  'الوادي الجديد'
];

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    settings, 
    createOrder 
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const shipping = cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const grandTotal = cartSubtotal + shipping;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) {
      alert('يرجى ملء الاسم، رقم الهاتف، والعنوان بالكامل');
      return;
    }

    const order = createOrder({
      customerName,
      phone,
      governorate,
      address,
      notes,
      paymentMethod
    });

    setCompletedOrder(order);

    // Fire celebration confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleWhatsAppConfirm = () => {
    if (!completedOrder) return;
    const itemsList = completedOrder.items
      .map(i => `- ${i.product.name} (عدد: ${i.quantity})`)
      .join('\n');

    const paymentText = 
      completedOrder.paymentMethod === 'cod' ? 'الدفع عند الاستلام' :
      completedOrder.paymentMethod === 'vodafone-cash' ? 'محفظة إلكترونية (فودافون كاش)' : 'إنستاباي / تحويل بنكي';

    const msg = encodeURIComponent(
      `مرحباً مرتفعات ستور، قمت بعمل طلب جديد عبر المتجر:\n` +
      `🔖 رقم الطلب: #${completedOrder.id}\n` +
      `👤 الاسم: ${completedOrder.customerName}\n` +
      `📱 الهاتف: ${completedOrder.phone}\n` +
      `📍 العنوان: ${completedOrder.governorate} - ${completedOrder.address}\n` +
      `💳 طريقة الدفع: ${paymentText}\n\n` +
      `📦 المنتجات:\n${itemsList}\n\n` +
      `💰 الإجمالي المطلوب: ${completedOrder.total} ج.م`
    );

    window.open(`https://wa.me/${settings.whatsapp}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-brand-gold/40 my-6">
        
        {/* Header */}
        <div className="p-4 bg-brand-black text-white flex items-center justify-between border-b border-brand-gold/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-base">
              {completedOrder ? 'تم تأكيد طلبك بنجاح 🎉' : 'إتمام الشراء والدفع الآمن'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCompletedOrder(null);
            }}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          /* Order Confirmation View */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">رقم الطلب الخاص بك</span>
              <h2 className="text-2xl font-black text-brand-black mt-1">#{completedOrder.id}</h2>
              <p className="text-xs text-gray-600 mt-1">
                شكراً لثقتك في مرتفعات ستور! تم استلام طلبك بنجاح وجارٍ تجهيزه الآن للشحن.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-right text-xs space-y-2">
              <div className="flex justify-between font-bold text-gray-800">
                <span>اسم العميل:</span>
                <span>{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>رقم الهاتف:</span>
                <span>{completedOrder.phone}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>العنوان:</span>
                <span>{completedOrder.governorate} - {completedOrder.address}</span>
              </div>
              <div className="flex justify-between font-black text-brand-black pt-2 border-t border-amber-200 text-sm">
                <span>المبلغ الإجمالي للدفع:</span>
                <span className="text-brand-goldDark">{completedOrder.total.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleWhatsAppConfirm}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إرسال وتأكيد الطلب عبر واتساب فوراً</span>
              </button>

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedOrder(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
              >
                العودة للتسوق في مرتفعات ستور
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5">
            
            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                بيانات التوصيل والاستلام:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد أحمد"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">رقم الهاتف (الواتساب) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">المحافظة *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none bg-white"
                  >
                    {EGYPT_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">العنوان بالتفصيل (المنطقة - الشارع - رقم العمارة) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الحي الأول، شارع النصر، عمارة 12، شقة 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">ملاحظات إضافية للتوصيل (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: التسليم بعد الساعة 5 مساءً"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                اختر طريقة الدفع المناسبة:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-brand-gold bg-amber-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-900">الدفع عند الاستلام</span>
                  </div>
                  <span className="text-[10px] text-gray-500">ادفع نقداً بعد فحص ومعاينة الأوردر</span>
                </div>

                {/* Vodafone Cash / Wallets */}
                <div
                  onClick={() => setPaymentMethod('vodafone-cash')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'vodafone-cash'
                      ? 'border-brand-gold bg-amber-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-gray-900">محفظة إلكترونية</span>
                  </div>
                  <span className="text-[10px] text-gray-500">فودافون كاش / أورنج / اتصالات / وي</span>
                </div>

                {/* InstaPay */}
                <div
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'instapay'
                      ? 'border-brand-gold bg-amber-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-gray-900">إنستاباي / بنكي</span>
                  </div>
                  <span className="text-[10px] text-gray-500">تحويل فوري عبر تطبيق InstaPay</span>
                </div>
              </div>

              {/* Instructions Box depending on selected method */}
              {paymentMethod === 'vodafone-cash' && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">رقم تحويل المحفظة (فودافون كاش):</span>
                    <span className="font-mono text-sm font-black text-red-700">{settings.vodafoneCashNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.vodafoneCashNumber, 'vodafone')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700"
                  >
                    {copiedField === 'vodafone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'vodafone' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                  </button>
                </div>
              )}

              {paymentMethod === 'instapay' && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">معرف إنستاباي (InstaPay Handle):</span>
                    <span className="font-mono text-sm font-black text-purple-700">{settings.instaPayUsername}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.instaPayUsername, 'instapay')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700"
                  >
                    {copiedField === 'instapay' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'instapay' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Total breakdown */}
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>إجمالي المنتجات ({cart.length} عناصر):</span>
                <span className="font-bold text-gray-900">{cartSubtotal.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>مصاريف الشحن والتوصيل:</span>
                <span className="font-bold text-emerald-600">
                  {shipping === 0 ? 'مجاني 🎉' : `${shipping} ج.م`}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-brand-black pt-2 border-t border-gray-200">
                <span>المبلغ الإجمالي النهائي:</span>
                <span className="text-base text-brand-goldDark">{grandTotal.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gold-gradient text-brand-black font-black text-sm hover:brightness-105 shadow-xl shadow-brand-gold/30 flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>تأكيد وتسجيل الطلب الآن ({grandTotal.toLocaleString()} ج.م)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
