import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Coupon, BotKnowledgeRule, HeroSlide, Category, StoreSettings } from '../types';
import { 
  Package, 
  ShoppingCart, 
  Download, 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  TrendingUp, 
  Upload, 
  Eye, 
  Clock, 
  FileSpreadsheet, 
  CreditCard, 
  Tag, 
  Search, 
  MessageSquare, 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Sliders, 
  Layers, 
  LayoutTemplate,
  CheckCircle2,
  Image as ImageIcon,
  Timer,
  ChevronDown,
  ChevronUp,
  Video
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    settings, 
    coupons,
    botRules,
    chatMessages,
    slides,
    categories,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus, 
    updateSettings,
    addCoupon,
    deleteCoupon,
    toggleCoupon,
    addBotRule,
    deleteBotRule,
    toggleBotRule,
    addSlide,
    updateSlide,
    deleteSlide,
    addCategory,
    updateCategory,
    deleteCategory,
    adminSendReply,
    setCurrentView,
    saveFeedbackToast,
    triggerSaveFeedback
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'slides' | 'categories' | 'products' | 'orders' | 'live-chat' | 'bot-training' | 'coupons' | 'settings'>('overview');

  // Product Add/Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodCategory, setProdCategory] = useState<string>('electronics');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | undefined>(undefined);
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodNewImageInput, setProdNewImageInput] = useState('');
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [prodFeatures, setProdFeatures] = useState('');

  // Slide Form State (Add / Edit)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideTag, setSlideTag] = useState('');
  const [slideCta, setSlideCta] = useState('تسوق الآن');
  const [slideImage, setSlideImage] = useState('');
  const [slideCategory, setSlideCategory] = useState('all');

  // Category Edit State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatNameAr, setEditCatNameAr] = useState('');
  const [editCatNameEn, setEditCatNameEn] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatId, setNewCatId] = useState('');

  // Orders Filter & Expandable Details
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Settings State Form
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  // Live Chat Reply in Admin
  const [adminReplyText, setAdminReplyText] = useState('');

  // New Bot Rule State
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleKeywords, setNewRuleKeywords] = useState('');
  const [newRuleReply, setNewRuleReply] = useState('');

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(300);

  // KPI Calculations
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const openAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdNameEn('');
    setProdCategory(categories[0]?.id || 'electronics');
    setProdPrice(0);
    setProdOriginalPrice(undefined);
    setProdStock(10);
    setProdDescription('');
    setProdImages([]);
    setProdVideoUrl('');
    setProdFeatures('');
    setIsAddModalOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdNameEn(prod.nameEn);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice);
    setProdStock(prod.stockCount);
    setProdDescription(prod.description);
    setProdImages(prod.images || []);
    setProdVideoUrl(prod.videoUrl || '');
    setProdFeatures(prod.features ? prod.features.join('\n') : '');
    setIsAddModalOpen(true);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdVideoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSlideImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = prodFeatures.split('\n').map(f => f.trim()).filter(Boolean);
    const finalImages = prodImages.length > 0 ? prodImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: prodName,
        nameEn: prodNameEn || prodName,
        category: prodCategory,
        price: Number(prodPrice),
        originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
        stockCount: Number(prodStock),
        inStock: Number(prodStock) > 0,
        description: prodDescription,
        images: finalImages,
        videoUrl: prodVideoUrl.trim() || undefined,
        features: featuresList
      });
    } else {
      addProduct({
        name: prodName,
        nameEn: prodNameEn || prodName,
        category: prodCategory,
        price: Number(prodPrice),
        originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
        stockCount: Number(prodStock),
        inStock: Number(prodStock) > 0,
        description: prodDescription,
        images: finalImages,
        videoUrl: prodVideoUrl.trim() || undefined,
        features: featuresList,
        rating: 0,
        reviewsCount: 0,
        isFeatured: true
      });
    }

    setIsAddModalOpen(false);
    triggerSaveFeedback();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      updateSettings(tempSettings);
    }, 300);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle || !slideImage) {
      alert('يرجى كتابة عنوان البانر واختيار صورة');
      return;
    }

    if (editingSlide) {
      updateSlide(editingSlide.id, {
        title: slideTitle,
        subtitle: slideSubtitle,
        tag: slideTag || 'عرض خاص',
        ctaText: slideCta || 'تسوق الآن',
        targetCategory: slideCategory || 'all',
        image: slideImage
      });
      setEditingSlide(null);
    } else {
      addSlide({
        title: slideTitle,
        subtitle: slideSubtitle,
        tag: slideTag || 'عرض خاص',
        ctaText: slideCta || 'تسوق الآن',
        targetCategory: slideCategory || 'all',
        image: slideImage
      });
    }

    setSlideTitle('');
    setSlideSubtitle('');
    setSlideTag('');
    setSlideImage('');
    triggerSaveFeedback();
  };

  const handleEditSlideClick = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle);
    setSlideTag(slide.tag);
    setSlideCta(slide.ctaText);
    setSlideImage(slide.image);
    setSlideCategory(slide.targetCategory || 'all');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr) return;
    const catId = newCatId.trim().toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`;
    addCategory({
      id: catId,
      nameAr: newCatNameAr,
      nameEn: newCatNameEn || newCatNameAr,
      icon: 'Layers',
      itemCount: 0
    });
    setNewCatNameAr('');
    setNewCatNameEn('');
    setNewCatId('');
    triggerSaveFeedback();
  };

  const handleUpdateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatNameAr) return;
    updateCategory(editingCategory.id, {
      nameAr: editCatNameAr,
      nameEn: editCatNameEn || editCatNameAr
    });
    setEditingCategory(null);
    triggerSaveFeedback();
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim()) return;
    adminSendReply(adminReplyText);
    setAdminReplyText('');
  };

  const handleAddBotRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !newRuleKeywords.trim() || !newRuleReply.trim()) return;
    const kwArray = newRuleKeywords.split(',').map(k => k.trim()).filter(Boolean);
    addBotRule({
      title: newRuleTitle,
      keywords: kwArray,
      replyText: newRuleReply,
      isActive: true
    });
    setNewRuleTitle('');
    setNewRuleKeywords('');
    setNewRuleReply('');
    triggerSaveFeedback();
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minOrderValue: Number(newCouponMin) || undefined,
      isActive: true
    });
    setNewCouponCode('');
    triggerSaveFeedback();
  };

  const exportOrdersCSV = () => {
    const headers = 'رقم الطلب,اسم العميل,رقم الهاتف,المحافظة,العنوان,طريقة الدفع,حالة الدفع,حالة الطلب,الإجمالي,التاريخ\n';
    const rows = orders.map(o => 
      `"${o.id}","${o.customerName}","${o.phone}","${o.governorate}","${o.address.replace(/"/g, '""')}","${o.paymentMethod}","${o.paymentStatus}","${o.status}","${o.total}","${o.createdAt}"`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mortafaat-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch = !orderSearch.trim() || 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#07090E] text-black dark:text-white pb-16 transition-colors">
      
      {/* Save Feedback Toast Alert */}
      {saveFeedbackToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>✓ تم حفظ كافة التعديلات وتفعيلها بنجاح في المتجر!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl px-2 shadow-xs overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <LayoutTemplate className="w-4 h-4 text-brand-goldDark" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'slides' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-brand-goldDark" />
            <span>البانرات والسلايدر ({slides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'categories' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Layers className="w-4 h-4 text-brand-goldDark" />
            <span>تعديل وإضافة الأقسام ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'products' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Package className="w-4 h-4 text-brand-goldDark" />
            <span>المنتجات والمخزون ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-brand-goldDark" />
            <span>تفاصيل الطلبات ({orders.length})</span>
            {pendingOrders > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('live-chat')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'live-chat' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-brand-goldDark" />
            <span>شات الزوار الحي</span>
          </button>

          <button
            onClick={() => setActiveTab('bot-training')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bot-training' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Bot className="w-4 h-4 text-brand-goldDark" />
            <span>تعليم البوت ({botRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'coupons' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Tag className="w-4 h-4 text-brand-goldDark" />
            <span>الكوبونات ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-brand-goldDark" />
            <span>إعدادات المتجر والسلايدر</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-950 via-brand-black to-zinc-900 text-white border border-brand-gold/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-brand-gold text-xs font-bold uppercase tracking-wider">مرحباً بك في لوحة تحكم</span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">مرتفعات ستور (Mortafaat Store)</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  تحكم كامل في صور السلايدر، المنتجات، الأسعار والخصومات، وتفاصيل الطلبات الواردة بصورها الحقيقية.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('store')}
                  className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                >
                  معاينة المتجر المباشر
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <span className="text-xs text-gray-500">إجمالي المبيعات</span>
                <p className="text-xl font-black text-brand-goldDark mt-1">{totalSales.toLocaleString()} ج.م</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <span className="text-xs text-gray-500">الطلبات المعلقة</span>
                <p className="text-xl font-black text-amber-600 mt-1">{pendingOrders} طلبات</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <span className="text-xs text-gray-500">الأقسام النشطة</span>
                <p className="text-xl font-black text-purple-600 mt-1">{categories.length} أقسام</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <span className="text-xs text-gray-500">إجمالي المنتجات</span>
                <p className="text-xl font-black text-emerald-600 mt-1">{products.length} منتجات</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO SLIDES & SLIDER SPEED CONTROL (Upload from device + Edit existing) */}
        {activeTab === 'slides' && (
          <div className="space-y-6">
            
            {/* Slider Duration Control Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold text-black flex items-center justify-center font-bold">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">سرعة تبديل صور السلايدر تلقائياً:</h4>
                  <p className="text-xs text-gray-500">حدد كم ثانية تظل الصورة معروضة قبل الانتقال للتالية</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={tempSettings.sliderIntervalSeconds}
                  onChange={(e) => setTempSettings({ ...tempSettings, sliderIntervalSeconds: Number(e.target.value) })}
                  className="w-20 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-center font-bold text-sm"
                />
                <span className="text-xs font-bold">ثوانٍ</span>

                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md"
                >
                  حفظ السرعة
                </button>
              </div>
            </div>

            {/* Add/Edit Slide Form */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-goldDark" />
                  <span>{editingSlide ? `تعديل البانر: "${editingSlide.title}"` : 'إضافة بانر جديد في أول المتجر'}</span>
                </h3>
                {editingSlide && (
                  <button
                    onClick={() => {
                      setEditingSlide(null);
                      setSlideTitle('');
                      setSlideSubtitle('');
                      setSlideTag('');
                      setSlideImage('');
                    }}
                    className="text-xs text-gray-500 hover:text-red-500 underline"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveSlide} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">العنوان الرئيسي للبانر *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عروض الشتاء الكبرى"
                    value={slideTitle}
                    onChange={(e) => setSlideTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">الوصف التوضيحي للبانر</label>
                  <input
                    type="text"
                    placeholder="مثال: خصومات حصرية حتى 50% على الملابس"
                    value={slideSubtitle}
                    onChange={(e) => setSlideSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">الوسم الصغير (Tag)</label>
                  <input
                    type="text"
                    placeholder="مثال: وصل حديثاً 2026"
                    value={slideTag}
                    onChange={(e) => setSlideTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">صورة البانر (من الجهاز أو رابط ويب) *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="رابط الصورة https://..."
                      value={slideImage}
                      onChange={(e) => setSlideImage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <label className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold cursor-pointer hover:bg-black transition-colors flex items-center gap-1.5 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع من جهازك</span>
                      <input type="file" accept="image/*" onChange={handleSlideImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                  >
                    {editingSlide ? '✓ حفظ تعديلات البانر' : '+ إضافة هذا البانر للسلايدر'}
                  </button>
                </div>
              </form>
            </div>

            {/* Current Slides List */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black">البانرات المعروضة حالياً ({slides.length}):</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {slides.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-800/60 flex flex-col justify-between">
                    <div className="h-32 w-full overflow-hidden relative">
                      <img src={s.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {s.tag}
                      </span>
                    </div>

                    <div className="p-3 space-y-1 text-xs">
                      <h4 className="font-bold line-clamp-1">{s.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-2">{s.subtitle}</p>
                    </div>

                    <div className="p-2.5 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                      <button
                        onClick={() => handleEditSlideClick(s)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => {
                          if (slides.length <= 1) {
                            alert('يجب أن يتبقى بانر واحد على الأقل في السلايدر');
                            return;
                          }
                          deleteSlide(s.id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                        title="حذف هذا البانر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: DYNAMIC CATEGORIES MANAGER (With Edit Option) */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            {/* Add Category Form */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-goldDark" />
                <span>إضافة قسم جديد لمتجر مرتفعات ستور</span>
              </h3>

              <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">اسم القسم بالعربي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ساعات وإكسسوارات"
                    value={newCatNameAr}
                    onChange={(e) => setNewCatNameAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">اسم القسم بالإنجليزي</label>
                  <input
                    type="text"
                    placeholder="Watches & Accessories"
                    value={newCatNameEn}
                    onChange={(e) => setNewCatNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">كود القسم بالإنجليزية (ID)</label>
                  <input
                    type="text"
                    placeholder="watches"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                  >
                    + إنشاء وتفعيل القسم
                  </button>
                </div>
              </form>
            </div>

            {/* Categories List (With Edit Trigger) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black">الأقسام المتوفرة حالياً في المتجر ({categories.length}):</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/70 dark:bg-zinc-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-goldDark flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{cat.nameAr}</h4>
                        <span className="text-[10px] text-gray-500 font-mono">{cat.nameEn}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditCatNameAr(cat.nameAr);
                          setEditCatNameEn(cat.nameEn);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                        title="تعديل اسم القسم"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (categories.length <= 1) {
                            alert('يجب أن يتبقى قسم واحد على الأقل في المتجر!');
                            return;
                          }
                          deleteCategory(cat.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        title="حذف هذا القسم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Category Modal */}
            {editingCategory && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-brand-gold/40 space-y-4 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-zinc-800">
                    <h3 className="font-bold text-sm">تعديل اسم القسم: {editingCategory.nameAr}</h3>
                    <button onClick={() => setEditingCategory(null)}>✕</button>
                  </div>

                  <form onSubmit={handleUpdateCategorySubmit} className="space-y-3">
                    <div>
                      <label className="font-bold block mb-1">الاسم بالعربي:</label>
                      <input
                        type="text"
                        required
                        value={editCatNameAr}
                        onChange={(e) => setEditCatNameAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">الاسم بالإنجليزي:</label>
                      <input
                        type="text"
                        value={editCatNameEn}
                        onChange={(e) => setEditCatNameEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 py-2 bg-gold-gradient text-black font-extrabold rounded-xl shadow">
                        حفظ التعديل
                      </button>
                      <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-black">قائمة منتجات المتجر</h3>
                <p className="text-xs text-gray-500">تحكم بالأسعار، نسب الخصومات، والصور والفيديو</p>
              </div>

              <button
                onClick={openAddProduct}
                className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد الآن</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-y border-gray-200 dark:border-zinc-700">
                  <tr>
                    <th className="py-3 px-3">المنتج</th>
                    <th className="py-3 px-3">القسم</th>
                    <th className="py-3 px-3">السعر الحالي</th>
                    <th className="py-3 px-3">السعر الأصلي / الخصم</th>
                    <th className="py-3 px-3">المخزون</th>
                    <th className="py-3 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {products.map((p) => {
                    const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0 border" />
                          <div>
                            <p className="font-bold line-clamp-1">{p.name}</p>
                            <span className="text-[10px] text-gray-400 font-mono">صور: {p.images?.length || 1} {p.videoUrl ? '• مع فيديو' : ''}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-[11px] font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-brand-goldDark">
                          {p.price} ج.م
                        </td>
                        <td className="py-3 px-3">
                          {p.originalPrice ? (
                            <div className="flex items-center gap-1.5">
                              <span className="line-through text-gray-400">{p.originalPrice} ج.م</span>
                              {discount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                  -{discount}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stockCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {p.stockCount > 0 ? `${p.stockCount} متوفر` : 'نفذت الكمية'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف المنتج: "${p.name}"؟`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS (With Expandable Product Details & Real Images) */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black">سجل الطلبات الواردة</h3>
                <p className="text-xs text-gray-500">اضغط على أي طلب لعرض المنتجات المطلوبة وصورها وأسعارها بالتفصيل</p>
              </div>

              <button
                onClick={exportOrdersCSV}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-brand-gold hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>تصدير الطلبات (CSV)</span>
              </button>
            </div>

            <div className="space-y-3">
              {filteredOrders.map((ord) => {
                const isExpanded = expandedOrderId === ord.id;
                return (
                  <div key={ord.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/50 overflow-hidden transition-all">
                    
                    {/* Header Row */}
                    <div 
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-100/70 dark:hover:bg-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-goldDark flex items-center justify-center font-bold text-xs">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-mono font-black text-sm block">#{ord.id}</span>
                          <span className="text-[10px] text-gray-500">{ord.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px]">العميل:</span>
                          <span className="font-bold">{ord.customerName}</span>
                          <span className="text-gray-500 block font-mono text-[10px]">{ord.phone}</span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px]">الإجمالي:</span>
                          <span className="font-black text-brand-goldDark">{ord.total} ج.م</span>
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          {ord.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Order Items List with REAL Images */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3 text-xs">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300">المنتجات المطلوبة في هذا الأوردر ({ord.items.length}):</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40">
                              <img 
                                src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'} 
                                alt={item.product.name} 
                                className="w-14 h-14 rounded-lg object-cover border" 
                              />
                              <div className="flex-1">
                                <h5 className="font-bold line-clamp-1">{item.product.name}</h5>
                                <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                  <span>الكمية: <b>{item.quantity}</b></span>
                                  <span>السعر: <b>{item.product.price} ج.م</b></span>
                                </div>
                                {(item.selectedSize || item.selectedColor) && (
                                  <span className="text-[10px] text-brand-goldDark block mt-0.5">
                                    {item.selectedSize ? `المقاس: ${item.selectedSize} ` : ''}
                                    {item.selectedColor ? `اللون: ${item.selectedColor}` : ''}
                                  </span>
                                )}
                              </div>
                              <span className="font-black text-sm text-black dark:text-white">
                                {item.product.price * item.quantity} ج.م
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-amber-50/50 dark:bg-zinc-800/60 rounded-xl border border-amber-200/60 dark:border-zinc-700 text-[11px] flex justify-between items-center">
                          <span>عنوان التوصيل: <b>{ord.governorate} - {ord.address}</b></span>
                          <span>مصاريف الشحن: <b>{ord.shippingFee === 0 ? 'مجاني' : `${ord.shippingFee} ج.م`}</b></span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: LIVE CHAT */}
        {activeTab === 'live-chat' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-7 space-y-4">
            <h3 className="text-base font-black">غرفة الرد المباشر على الزوار</h3>
            <div className="h-72 overflow-y-auto bg-gray-50 dark:bg-zinc-950 rounded-2xl p-4 border border-gray-200 dark:border-zinc-800 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`p-3 rounded-2xl max-w-md text-xs ${msg.sender === 'user' ? 'bg-black text-white ml-auto' : 'bg-emerald-600 text-white mr-auto'}`}>
                  <span className="text-[10px] block opacity-75">{msg.sender === 'user' ? 'العميل' : 'الإدارة'} • {msg.time}</span>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendAdminReply} className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب ردك للعميل..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
                إرسال الرد
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: BOT TRAINING */}
        {activeTab === 'bot-training' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-7 space-y-5">
            <h3 className="text-base font-black">تعليم وتدريب المساعد الذكي</h3>
            <form onSubmit={handleAddBotRule} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-zinc-800/60 border border-amber-200 dark:border-zinc-700 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="عنوان القاعدة (مثال: عروض الهدايا)"
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <input
                  type="text"
                  required
                  placeholder="الكلمات المفتاحية مفصولة بفاصلة (مثال: عروض تانية, هدية, خصم)"
                  value={newRuleKeywords}
                  onChange={(e) => setNewRuleKeywords(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <textarea
                rows={2}
                required
                placeholder="الرد الذي سيقوله البوت للعميل..."
                value={newRuleReply}
                onChange={(e) => setNewRuleReply(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button type="submit" className="px-6 py-2 bg-gold-gradient text-black font-extrabold text-xs rounded-xl shadow">
                + تعليم البوت هذه القاعدة
              </button>
            </form>
          </div>
        )}

        {/* TAB 8: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 space-y-4">
            <h3 className="text-base font-black">كوبونات الخصم النشطة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {coupons.map((c) => (
                <div key={c.code} className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-black text-sm">{c.code}</span>
                    <p className="text-gray-500 text-[11px]">{c.discountValue}% خصم</p>
                  </div>
                  <button onClick={() => deleteCoupon(c.code)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-7 max-w-2xl space-y-5">
            <div>
              <h3 className="text-base font-black">إعدادات المتجر العامة ورمز الـ PIN</h3>
              <p className="text-xs text-gray-500">تحكم ببيانات المتجر ورقم الهاتف وأي نص معروض</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700">
                <label className="font-bold block mb-1">رمز الدخول للإدارة (Admin PIN):</label>
                <input
                  type="text"
                  maxLength={6}
                  value={tempSettings.adminPin}
                  onChange={(e) => setTempSettings({ ...tempSettings, adminPin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 font-mono text-center text-lg tracking-widest font-black"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">اسم المتجر بالعربي:</label>
                <input
                  type="text"
                  value={tempSettings.storeNameAr}
                  onChange={(e) => setTempSettings({ ...tempSettings, storeNameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">رقم هاتف المتجر الأساسي والواتساب:</label>
                <input
                  type="text"
                  value={tempSettings.phone}
                  onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value, whatsapp: `2${e.target.value}` })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">شريط الإعلانات أعلى المتجر:</label>
                <input
                  type="text"
                  value={tempSettings.announcementText}
                  onChange={(e) => setTempSettings({ ...tempSettings, announcementText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 rounded-2xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>جاري حفظ وتفعيل التعديلات...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>حفظ وتفعيل كافة التعديلات الآن</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ADD/EDIT PRODUCT MODAL (Supports Multi-images + Video Upload or Link) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-brand-gold/40 my-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="font-black text-sm">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد مع صور وفيديو'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">اسم المنتج بالعربي *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">القسم *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">الكمية المتوفرة بالمخزون *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Price and Original Price (Discount calculation) */}
              <div className="grid grid-cols-2 gap-3 bg-amber-50/50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-amber-200/60 dark:border-zinc-700">
                <div>
                  <label className="font-bold block mb-1">سعر البيع الحالي (بعد الخصم) ج.م *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">السعر الأصلي قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    placeholder="مثال: 1200"
                    value={prodOriginalPrice || ''}
                    onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  {prodOriginalPrice && prodOriginalPrice > prodPrice && (
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                      نسبة الخصم المحسوبة: {Math.round(((prodOriginalPrice - prodPrice) / prodOriginalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-images manager */}
              <div>
                <label className="font-bold block mb-1">صور المنتج المتعددة (ستتبدل عشوائياً عند لمس الكارت):</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ضع رابط صورة إضافية..."
                    value={prodNewImageInput}
                    onChange={(e) => setProdNewImageInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (prodNewImageInput.trim()) {
                        setProdImages(prev => [...prev, prodNewImageInput.trim()]);
                        setProdNewImageInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black text-white font-bold"
                  >
                    + إضافة
                  </button>
                  <label className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 cursor-pointer border border-gray-300 dark:border-zinc-700 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع من جهازك</span>
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                  </label>
                </div>

                {/* Previews */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {prodImages.map((img, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg border overflow-hidden flex-shrink-0">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProdImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-red-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-bl"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video URL or Upload from device */}
              <div>
                <label className="font-bold block mb-1">فيديو المنتج (رفع من الجهاز أو رابط منصة خارجية):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="رابط فيديو MP4 أو يوتيوب..."
                    value={prodVideoUrl}
                    onChange={(e) => setProdVideoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-[11px]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 cursor-pointer border border-gray-300 dark:border-zinc-700 flex items-center gap-1.5 flex-shrink-0">
                    <Video className="w-3.5 h-3.5 text-brand-goldDark" />
                    <span>رفع فيديو من الجهاز</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                </div>
                {prodVideoUrl && (
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ تم إرفاق الفيديو بنجاح</span>
                )}
              </div>

              <div>
                <label className="font-bold block mb-1">الوصف:</label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-gold-gradient text-black font-extrabold rounded-xl shadow">
                  نشر وتحديث المنتج
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
