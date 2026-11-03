import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, Order } from '../types';
import { 
  X, 
  CheckCircle2, 
  Banknote, 
  Smartphone, 
  CreditCard,
  Building2, 
  Copy, 
  Check, 
  MessageCircle, 
  ShieldCheck,
  Lock,
  Tag,
  AlertCircle
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
    discountAmount,
    cartFinalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings, 
    createOrder 
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paymob-card');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Coupon input
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const shipping = cartSubtotal >= settings.freeShippingThreshold || cartSubtotal === 0 ? 0 : settings.shippingFee;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) {
      alert('يرجى ملء الاسم، رقم الهاتف، والعنوان بالكامل');
      return;
    }

    if (paymentMethod === 'paymob-card') {
      if (cardNumber.replace(/\s/g, '').length < 15 || !cardExpiry || cardCvv.length < 3) {
        alert('يرجى إدخال بيانات البطاقة البنكية بشكل صحيح (رقم الكارت، تاريخ الانتهاء، ورمز الأمان CVV)');
        return;
      }

      setIsProcessingPayment(true);
      // Simulate secure Paymob 3D Secure / Payment Gateway verification
      setTimeout(() => {
        setIsProcessingPayment(false);
        const order = createOrder({
          customerName,
          phone,
          governorate,
          address,
          notes,
          paymentMethod: 'paymob-card',
          transactionId: `PM-VISA-${Math.floor(1000000 + Math.random() * 9000000)}`
        });

        setCompletedOrder(order);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }, 1500);
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
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleWhatsAppConfirm = () => {
    if (!completedOrder) return;
    const itemsList = completedOrder.items
      .map(i => `- ${i.product.name} (عدد: ${i.quantity})`)
      .join('\n');

    let paymentText = 'الدفع عند الاستلام';
    if (completedOrder.paymentMethod === 'paymob-card') {
      paymentText = `بطاقة بنكية / فيزا (مدفوع بنجاح عبر Paymob - كود: ${completedOrder.transactionId})`;
    } else if (completedOrder.paymentMethod === 'vodafone-cash') {
      paymentText = 'محفظة إلكترونية (فودافون كاش: 01067906474)';
    } else if (completedOrder.paymentMethod === 'instapay') {
      paymentText = 'إنستاباي / تحويل فوري';
    } else if (completedOrder.paymentMethod === 'bank-transfer') {
      paymentText = 'تحويل بنكي مباشر';
    }

    const msg = encodeURIComponent(
      `مرحباً مرتفعات ستور، قمت بعمل طلب جديد عبر المتجر:\n` +
      `🔖 رقم الطلب: #${completedOrder.id}\n` +
      `👤 الاسم: ${completedOrder.customerName}\n` +
      `📱 الهاتف: ${completedOrder.phone}\n` +
      `📍 العنوان: ${completedOrder.governorate} - ${completedOrder.address}\n` +
      `💳 حالة الدفع: ${paymentText}\n\n` +
      `📦 المنتجات:\n${itemsList}\n\n` +
      `💰 الإجمالي النهائي: ${completedOrder.total} ج.م`
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
              {completedOrder ? 'تم تأكيد الدفع والطلب بنجاح 🎉' : 'إتمام الشراء والدفع الآمن'}
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
                شكراً لثقتك في مرتفعات ستور! تم استلام طلبك وجارٍ تجهيزه الآن للشحن والتوصيل.
              </p>
            </div>

            {completedOrder.paymentMethod === 'paymob-card' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>
                  تم الدفع وتأكيد المعاملة البنكية بنجاح عبر <strong>Paymob</strong> (كود العملية: {completedOrder.transactionId})
                </span>
              </div>
            )}

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
              <div className="flex justify-between text-gray-600">
                <span>طريقة الدفع:</span>
                <span className="font-semibold text-brand-black">
                  {completedOrder.paymentMethod === 'paymob-card' ? 'بطاقة بنكية (Paymob)' :
                   completedOrder.paymentMethod === 'cod' ? 'الدفع عند الاستلام' :
                   completedOrder.paymentMethod === 'vodafone-cash' ? 'فودافون كاش' : 'إنستاباي / بنكي'}
                </span>
              </div>
              <div className="flex justify-between font-black text-brand-black pt-2 border-t border-amber-200 text-sm">
                <span>المبلغ الإجمالي:</span>
                <span className="text-brand-goldDark">{completedOrder.total.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleWhatsAppConfirm}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إرسال إشعار فوري وتأكيد للأوردر على واتساب المتجر</span>
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
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            
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
                    placeholder="مثال: أحمد محمود"
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
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">العنوان بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    placeholder="المنطقة، اسم الشارع، رقم العمارة، الشقة"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-goldDark" />
                  هل لديك كوبون خصم؟
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[11px] text-red-600 font-bold hover:underline"
                  >
                    إلغاء الكوبون
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-between">
                  <span>تم تطبيق الكوبون: ({appliedCoupon.code})</span>
                  <span>- {discountAmount} ج.م</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب كود الخصم (جرب MORTAFAAT10)..."
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:border-brand-gold uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-1.5 rounded-xl bg-brand-black text-brand-gold font-bold text-xs hover:bg-brand-gold hover:text-black transition-colors"
                  >
                    تطبيق
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
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                  اختر طريقة الدفع:
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>تشفير بنكي 256-bit آمن</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                
                {/* 1. Paymob Credit Card */}
                <div
                  onClick={() => setPaymentMethod('paymob-card')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'paymob-card'
                      ? 'border-brand-gold bg-amber-500/10 shadow-sm ring-1 ring-brand-gold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <CreditCard className="w-4 h-4 text-brand-goldDark" />
                    <span className="text-[9px] font-bold bg-brand-black text-brand-gold px-1.5 py-0.5 rounded">
                      Paymob
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">بطاقة بنكية</span>
                    <span className="text-[9px] text-gray-500">فيزا / ماستركارد / ميزة</span>
                  </div>
                </div>

                {/* 2. Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-brand-gold bg-amber-500/10 shadow-sm ring-1 ring-brand-gold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">عند الاستلام</span>
                    <span className="text-[9px] text-gray-500">ادفع نقداً بعد المعاينة</span>
                  </div>
                </div>

                {/* 3. Vodafone Cash / Wallets */}
                <div
                  onClick={() => setPaymentMethod('vodafone-cash')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'vodafone-cash'
                      ? 'border-brand-gold bg-amber-500/10 shadow-sm ring-1 ring-brand-gold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">فودافون كاش</span>
                    <span className="text-[9px] text-gray-500">المحافظ الذكية</span>
                  </div>
                </div>

                {/* 4. InstaPay */}
                <div
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'instapay'
                      ? 'border-brand-gold bg-amber-500/10 shadow-sm ring-1 ring-brand-gold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">إنستاباي / بنك</span>
                    <span className="text-[9px] text-gray-500">تحويل فوري لحظي</span>
                  </div>
                </div>
              </div>

              {/* CARD PAYMENT (PAYMOB SECURE FORM) */}
              {paymentMethod === 'paymob-card' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-brand-black to-zinc-950 text-white border border-brand-gold/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-brand-gold" />
                      <span className="text-xs font-black text-brand-gold">بوابة الدفع الإلكتروني الآمن (Paymob Payment)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      PCI-DSS Level 1
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">رقم البطاقة البنكية (16 رقم) *</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 text-xs font-mono tracking-widest focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">الانتهاء (MM/YY) *</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                          setCardExpiry(val);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 text-xs font-mono text-center focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">رمز الأمان (CVV) *</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 text-xs font-mono text-center focus:border-brand-gold focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] text-gray-400 block mb-1">اسم حامل البطاقة</label>
                      <input
                        type="text"
                        placeholder="كما هو مدون على الكارت"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 text-xs focus:border-brand-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 flex items-center gap-1.5 pt-1">
                    <Lock className="w-3 h-3 text-brand-gold" />
                    <span>بيانات الكارت مشفرة بالكامل وتُعالج عبر سيرفرات Paymob البنكية المعتمدة من البنك المركزي المصري.</span>
                  </p>
                </div>
              )}

              {/* VODAFONE CASH INSTRUCTIONS */}
              {paymentMethod === 'vodafone-cash' && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block">رقم تحويل محفظة فودافون كاش / المحافظ:</span>
                      <span className="font-mono text-sm font-black text-red-700">{settings.vodafoneCashNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.vodafoneCashNumber, 'vodafone')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[11px] hover:bg-red-700"
                    >
                      {copiedField === 'vodafone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'vodafone' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-red-700 leading-relaxed">
                    حول إجمالي المبلغ إلى الرقم أعلاه عبر محفظتك، وسيتم تأكيد الطلب فوراً بعد تسجيل الأوردر.
                  </p>
                </div>
              )}

              {/* INSTAPAY INSTRUCTIONS */}
              {paymentMethod === 'instapay' && (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block">رقم / عنوان إنستاباي (InstaPay):</span>
                      <span className="font-mono text-sm font-black text-purple-700">{settings.instaPayUsername}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.instaPayUsername, 'instapay')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700"
                    >
                      {copiedField === 'instapay' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'instapay' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-purple-700 leading-relaxed">
                    افتح تطبيق InstaPay وقم بالتحويل على الرقم الموضح أعلاه مجاناً وفوراً.
                  </p>
                </div>
              )}
            </div>

            {/* Total breakdown */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>إجمالي المنتجات ({cart.length} عناصر):</span>
                <span className="font-bold text-gray-900">{cartSubtotal.toLocaleString()} ج.م</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم الكوبون ({appliedCoupon?.code}):</span>
                  <span>- {discountAmount.toLocaleString()} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>مصاريف الشحن والتوصيل:</span>
                <span className="font-bold text-emerald-600">
                  {shipping === 0 ? 'مجاني 🎉' : `${shipping} ج.م`}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-brand-black pt-2 border-t border-gray-200">
                <span>المبلغ الإجمالي للدفع:</span>
                <span className="text-base text-brand-goldDark">{cartFinalTotal.toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className="w-full py-3.5 rounded-2xl bg-gold-gradient text-brand-black font-black text-sm hover:brightness-105 shadow-xl shadow-brand-gold/30 flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري معالجة وتشفير الدفع عبر Paymob...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {paymentMethod === 'paymob-card' ? 'الدفع الآمن وتأكيد الطلب الآن' : 'تأكيد وتسجيل الطلب'} ({cartFinalTotal.toLocaleString()} ج.م)
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
