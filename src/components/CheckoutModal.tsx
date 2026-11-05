import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, Order } from '../types';
import { 
  X, 
  CheckCircle2, 
  Banknote, 
  CreditCard,
  MessageCircle, 
  ShieldCheck, 
  Lock, 
  Tag, 
  Truck, 
  RotateCcw, 
  FileText, 
  Printer, 
  User as UserIcon,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../i18n';

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
    discountAmount,
    cartFinalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings, 
    createOrder,
    currentUser,
    setIsAuthModalOpen,
    setActiveInvoiceOrder
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Coupon input
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (!customerName && currentUser.name) setCustomerName(currentUser.name);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isCheckoutOpen) return null;

  const shipping = cartSubtotal >= settings.freeShippingThreshold || cartSubtotal === 0 ? 0 : settings.shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
    if (res.success) setCouponInput('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setSubmitError(null);

    const cleanName = customerName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    if (!cleanName || !cleanPhone || !cleanAddress) {
      setSubmitError(t("يرجى ملء الاسم، رقم الهاتف، والعنوان بالكامل"));
      return;
    }

    // Egyptian phone validation: starts with 01 followed by 0,1,2,5 and 8 digits
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setSubmitError(t("يرجى إدخال رقم هاتف محمول مصري صحيح (مثال: 01012345678)"));
      return;
    }

    if (paymentMethod === 'online-gateway') {
      setSubmitError(t("الدفع الإلكتروني غير مفعّل بعد لعدم ربط بوابة الدفع. يرجى اختيار الدفع عند الاستلام."));
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrder({
        customerName: cleanName,
        phone: cleanPhone,
        governorate,
        address: cleanAddress,
        notes: notes.trim() || undefined,
        paymentMethod: 'cod'
      });

      setCompletedOrder(order);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, gravity: 1.2 });
    } catch (err: any) {
      setSubmitError(err.message || t("حدث خطأ أثناء تسجيل طلبك، يرجى التأكد من توفر المخزون والمحاولة ثانية"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!completedOrder) return;
    const itemsList = completedOrder.items
      .map(i => t("- {0} (عدد: {1})", i.product.name, i.quantity))
      .join('\n');

    const paymentText = completedOrder.paymentMethod === 'cod' 
      ? t("الدفع نقداً عند الاستلام (مع المعاينة)") 
      : t("دفع إلكتروني معتمد ({0})", settings.onlineGatewayName || t("بوابة الدفع"));

    const msg = encodeURIComponent(
      t("مرحباً مرتفعات ستور، قمت بعمل طلب جديد عبر المتجر:\n") +
      t("🔖 رقم الطلب: #{0}\n", completedOrder.orderNumber || completedOrder.id) +
      t("👤 الاسم: {0}\n", completedOrder.customerName) +
      t("📱 الهاتف: {0}\n", completedOrder.phone) +
      t("📍 العنوان: {0} - {1}\n", completedOrder.governorate, completedOrder.address) +
      t("💳 طريقة الدفع: {0}\n\n", paymentText) +
      t("📦 المنتجات:\n{0}\n\n", itemsList) +
      t("💰 الإجمالي النهائي: {0} ج.م", completedOrder.total)
    );

    window.open(`https://wa.me/${settings.whatsapp}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-brand-gold/40 my-6">
        
        {/* Header */}
        <div className="p-4 bg-brand-black text-white flex items-center justify-between border-b border-brand-gold/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-base">
              {completedOrder ? t("تم تأكيد طلبك بنجاح 🎉") : t("إتمام الشراء والدفع المضمون")}
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
              <span className="text-xs font-bold text-gray-500 uppercase">{t("رقم الفاتورة والطلب الخاص بك")}</span>
              <h2 className="text-2xl font-black text-black dark:text-white mt-1">
                #{completedOrder.orderNumber || completedOrder.id}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {t("شكراً لطلبك من مرتفعات ستور! يمكنك الآن تحميل فاتورتك الرسمية PDF أو إرسال تفاصيل الأوردر على واتساب.")}
              </p>
            </div>

            {/* Quick Invoice Download Card */}
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white/30 flex items-center justify-between gap-3 text-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <span className="font-black text-xs block">{t("فاتورة الشراء الإلكترونية الفورية")}</span>
                  <span className="text-[10px] text-gray-500">{t("نسخة معتمدة أبيض وأسود للطباعة والحفظ")}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveInvoiceOrder(completedOrder)}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-brand-gold hover:text-black font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t("عرض وتحميل الفاتورة PDF")}</span>
              </button>
            </div>

            {/* Order details summary */}
            <div className="bg-amber-50/70 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-2xl p-4 text-start text-xs space-y-2">
              <div className="flex justify-between font-bold">
                <span>{t("اسم العميل:")}</span>
                <span>{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t("رقم الهاتف:")}</span>
                <span>{completedOrder.phone}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t("العنوان:")}</span>
                <span>{t(completedOrder.governorate)} - {completedOrder.address}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t("طريقة الدفع:")}</span>
                <span className="font-bold text-black dark:text-white">
                  {completedOrder.paymentMethod === 'cod' ? t("الدفع نقداً عند الاستلام (مع المعاينة)") : settings.onlineGatewayName}
                </span>
              </div>
              <div className="flex justify-between font-black pt-2 border-t border-amber-200 dark:border-zinc-700 text-sm">
                <span>{t("المبلغ المطلوب عند الاستلام:")}</span>
                <span className="text-brand-goldDark">{completedOrder.total.toLocaleString()} {t("ج.م")}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleWhatsAppConfirm}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t("إرسال إشعار فوري وتأكيد للأوردر على واتساب المتجر")}</span>
              </button>

              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedOrder(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 text-xs font-bold transition-colors"
              >
                {t("العودة للتسوق في مرتفعات ستور")}
              </button>
            </div>
          </div>
        ) : !currentUser ? (
          /* Mandatory Customer Authentication Screen (TASK 8) */
          <div className="p-6 text-center space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-brand-gold flex items-center justify-center mx-auto shadow-inner border border-amber-300 dark:border-amber-700">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {t("تسجيل الدخول مطلوب لإتمام الشراء")}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-sm mx-auto leading-relaxed">
                {t("لضمان حقوقك في فحص ومعاينة المنتج قبل الدفع، ومتابعة شحنتك، وإصدار الفاتورة الرسمية باسمك، يرجى تسجيل الدخول أو إنشاء حساب جديد.")}
              </p>
            </div>

            {/* Preserved Cart Notice */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-start text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-brand-gold flex-shrink-0" />
                <div>
                  <span className="font-bold block text-gray-900 dark:text-white">{t("مشترياتك وسلتك محفوظة بالكامل")}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {t("العدد: {0} منتجات | الإجمالي: {1} ج.م", cartCount, cartFinalTotal)}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {t("محفوظة")}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-brand-black text-brand-gold hover:bg-brand-gold hover:text-black font-black text-xs transition-colors shadow-lg flex items-center justify-center gap-2 border border-brand-gold/40"
              >
                <UserIcon className="w-4 h-4" />
                <span>{t("تسجيل الدخول إلى حسابك")}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t("إنشاء حساب عميل جديد (سريع)")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                {t("بيانات التوصيل والاستلام:")}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("الاسم بالكامل *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("مثال: أحمد محمود")}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("رقم الهاتف (الواتساب) *")}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t("مثال: 01012345678")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("المحافظة *")}</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold focus:outline-none"
                  >
                    {EGYPT_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{t(gov)}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("العنوان بالتفصيل *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("المنطقة، اسم الشارع، رقم العمارة، الشقة")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">{t("ملاحظات إضافية للتوصيل (اختياري)")}</label>
                <input
                  type="text"
                  placeholder={t("مثال: التسليم بعد الساعة 5 مساءً")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="p-3 bg-amber-50/50 dark:bg-zinc-800 rounded-2xl border border-amber-200/60 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-goldDark" />
                  {t("هل لديك كوبون خصم؟")}
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[11px] text-red-600 font-bold hover:underline"
                  >
                    {t("إلغاء الكوبون")}
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
                  <span>{t("تم تطبيق الكوبون: (")}{appliedCoupon.code})</span>
                  <span>- {discountAmount} {t("ج.م")}</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("اكتب كود الخصم (جرب MORTAFAAT10)...")}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 focus:border-brand-gold uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-1.5 rounded-xl bg-brand-black text-brand-gold font-bold text-xs hover:bg-brand-gold hover:text-black transition-colors"
                  >
                    {t("تطبيق")}
                  </button>
                </div>
              )}

              {couponFeedback && !appliedCoupon && (
                <p className={`text-[10px] mt-1.5 font-bold ${couponFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {couponFeedback.message}
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-zinc-800">
              <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                {t("طريقة الدفع:")}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Cash on Delivery (ACTIVE & DEFAULT) */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-brand-gold bg-amber-50/50 dark:bg-zinc-800 shadow-sm'
                      : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black">{t("الدفع نقداً عند الاستلام")}</span>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        {t("متاح لجميع المحافظات")}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {t("ادفع للمندوب نقداً بعد استلام شحنتك، مع حقك الكامل في فحص ومعاينة المنتج قبل الدفع.")}
                    </p>
                  </div>
                </div>

                {/* 2. Electronic Payment Gateways Notice */}
                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-800/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-zinc-700 text-gray-500 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">{t("بوابات الدفع الإلكتروني (Paymob / Fawry / Kashier)")}</span>
                    <span className="text-[10px] text-gray-500">
                      {t("سيتم إتاحة الدفع الإلكتروني بالبطاقات فور اعتماد وتفعيل حساب التاجر رسمياً مع الشركة المزودة.")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 grid grid-cols-2 gap-2 text-center text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-brand-goldDark" />
                  <span>{t("معاينة مجانية قبل الاستلام")}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-goldDark" />
                  <span>{t("فاتورة فورية مرفقة مع الشحنة")}</span>
                </div>
              </div>
            </div>

            {/* Total breakdown */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t("إجمالي المنتجات (")}{cart.length} {t("عناصر):")}</span>
                <span className="font-bold text-black dark:text-white">{cartSubtotal.toLocaleString()} {t("ج.م")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>{t("خصم الكوبون (")}{appliedCoupon?.code}):</span>
                  <span>- {discountAmount.toLocaleString()} {t("ج.م")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{t("مصاريف الشحن والتوصيل:")}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {shipping === 0 ? t("مجاني 🎉") : t("{0} ج.م", shipping)}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-brand-black dark:text-white pt-2 border-t border-gray-200 dark:border-zinc-700">
                <span>{t("المبلغ الإجمالي النهائي للدفع:")}</span>
                <span className="text-base text-brand-goldDark">{cartFinalTotal.toLocaleString()} {t("ج.م")}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gold-gradient text-brand-black font-black text-sm hover:brightness-105 shadow-xl shadow-brand-gold/30 flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{t("جاري تأكيد وتسجيل طلبك...")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t("تأكيد وتسجيل الطلب الآن (")}{cartFinalTotal.toLocaleString()} {t("ج.م)")}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
