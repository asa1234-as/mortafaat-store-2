import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Coupon, BotKnowledgeRule, HeroSlide, Category, StoreSettings, StoreTrustBadge, AnnouncementOffer } from '../types';
import { t } from '../i18n';
import { isSupabaseConfigured, uploadProductImage, uploadMediaFile } from '../lib/supabase';
import { AVAILABLE_CATEGORY_ICONS, renderDynamicIcon } from '../lib/iconMap';
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
  Video,
  Users,
  Lock,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
  Printer,
  X
} from 'lucide-react';

class SettingsPanelErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-6 text-center space-y-3">
          <h3 className="font-black text-red-700 dark:text-red-300">تعذر تحميل الإعدادات والأمان</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">حدث خطأ أثناء عرض بعض بيانات الإعدادات. باقي لوحة الإدارة ما زالت متاحة.</p>
          <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold">إعادة تحميل الصفحة</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    updatePaymentStatus,
    updateSettings,
    addCoupon,
    deleteCoupon,
    toggleCoupon,
    addBotRule,
    updateBotRule,
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
    triggerSaveFeedback,
    isAdminAuthenticated,
    currentUser,
    newOrderNotification,
    clearNewOrderNotification,
    setActiveInvoiceOrder
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'slides' | 'categories' | 'products' | 'orders' | 'customers' | 'live-chat' | 'bot-training' | 'coupons' | 'settings'>('overview');

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
  const [prodDescriptionEn, setProdDescriptionEn] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodNewImageInput, setProdNewImageInput] = useState('');
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [prodFeatures, setProdFeatures] = useState('');
  const [prodFeaturesEn, setProdFeaturesEn] = useState('');
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [isUploadingProductVideo, setIsUploadingProductVideo] = useState(false);

  // Slide Form State
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideTitleEn, setSlideTitleEn] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideSubtitleEn, setSlideSubtitleEn] = useState('');
  const [slideTag, setSlideTag] = useState('');
  const [slideTagEn, setSlideTagEn] = useState('');
  const [slideCta, setSlideCta] = useState(t("تسوق الآن"));
  const [slideCtaEn, setSlideCtaEn] = useState('Shop Now');
  const [slideImage, setSlideImage] = useState('');
  const [slideVideoUrl, setSlideVideoUrl] = useState('');
  const [isUploadingSlideVideo, setIsUploadingSlideVideo] = useState(false);
  const [slideCategory, setSlideCategory] = useState('all');

  // Category Edit State
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatNameAr, setEditCatNameAr] = useState('');
  const [editCatNameEn, setEditCatNameEn] = useState('');
  const [editCatIcon, setEditCatIcon] = useState('Sparkles');

  // Orders State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Customers Filter
  const [customerSearch, setCustomerSearch] = useState<string>('');

  // Chat State
  const [adminReplyText, setAdminReplyText] = useState('');

  // Bot Knowledge Rule State
  const [editingBotRule, setEditingBotRule] = useState<BotKnowledgeRule | null>(null);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleKeywords, setNewRuleKeywords] = useState('');
  const [newRuleReply, setNewRuleReply] = useState('');
  const [newRuleReplyEn, setNewRuleReplyEn] = useState('');

  // Trust Badges Form State
  const [newBadgeTitleAr, setNewBadgeTitleAr] = useState('');
  const [newBadgeTitleEn, setNewBadgeTitleEn] = useState('');
  const [newBadgeDescAr, setNewBadgeDescAr] = useState('');
  const [newBadgeDescEn, setNewBadgeDescEn] = useState('');
  const [newBadgeIcon, setNewBadgeIcon] = useState('ShieldCheck');
  // Announcement Offers State (TASK 9)
  const [newOfferTextAr, setNewOfferTextAr] = useState('');
  const [newOfferTextEn, setNewOfferTextEn] = useState('');
  const [newOfferDuration, setNewOfferDuration] = useState<number>(12);

  // Coupon State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(0);

  // Settings Temp State
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);


  // Guard: Admin Authentication Enforcement
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-white flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-brand-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black">{t("منطقة محمية - لوحة الإدارة")}</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            {t("الوصول إلى هذه اللوحة مقتصر حصرياً على مديري ومالكي مرتفعات ستور المصرح لهم في قاعدة البيانات.")}
          </p>
          <button
            onClick={() => setCurrentView('store')}
            className="w-full py-3 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
          >
            {t("العودة إلى المتجر")}
          </button>
        </div>
      </div>
    );
  }

  // Analytics Calculations
  const totalSalesRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.stockCount <= 5);

  // Derived Customers List
  const customersList = useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      governorate: string;
      address: string;
      ordersCount: number;
      totalSpent: number;
      lastOrderDate: string;
    }>();

    orders.forEach(o => {
      const key = o.phone || o.customerName;
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += o.total;
      } else {
        map.set(key, {
          name: o.customerName,
          phone: o.phone,
          governorate: o.governorate,
          address: o.address,
          ordersCount: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt
        });
      }
    });

    return Array.from(map.values());
  }, [orders]);

  const filteredCustomers = customersList.filter(c => {
    if (!customerSearch.trim()) return true;
    const query = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(query) || c.phone.includes(query) || c.governorate.toLowerCase().includes(query);
  });

  // Handlers
  const openAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdNameEn('');
    setProdCategory('electronics');
    setProdPrice(0);
    setProdOriginalPrice(undefined);
    setProdStock(20);
    setProdDescription('');
    setProdDescriptionEn('');
    setProdImages([]);
    setProdNewImageInput('');
    setProdVideoUrl('');
    setProdFeatures('');
    setProdFeaturesEn('');
    setIsAddModalOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.nameAr || prod.name);
    setProdNameEn(prod.nameEn || '');
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalPrice);
    setProdStock(prod.stockCount);
    setProdDescription(prod.descriptionAr || prod.description);
    setProdDescriptionEn(prod.descriptionEn || '');
    setProdImages(prod.images || []);
    setProdNewImageInput('');
    setProdVideoUrl(prod.videoUrl || '');
    setProdFeatures(prod.featuresAr ? prod.featuresAr.join('\n') : (prod.features ? prod.features.join('\n') : ''));
    setProdFeaturesEn(prod.featuresEn ? prod.featuresEn.join('\n') : '');
    setIsAddModalOpen(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProductImage(true);
    try {
      if (isSupabaseConfigured) {
        const publicUrl = await uploadProductImage(file);
        setProdImages(prev => [...prev, publicUrl]);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setProdImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      alert(err.message || t("تعذر رفع الصورة"));
    } finally {
      setIsUploadingProductImage(false);
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

  const handleProductVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingProductVideo(true);
    try {
      if (isSupabaseConfigured) {
        const publicUrl = await uploadMediaFile(file, 'product-images');
        setProdVideoUrl(publicUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setProdVideoUrl(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      alert(err.message || t("فشل رفع ملف الفيديو"));
    } finally {
      setIsUploadingProductVideo(false);
    }
  };

  const handleSlideVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSlideVideo(true);
    try {
      if (isSupabaseConfigured) {
        const publicUrl = await uploadMediaFile(file, 'product-images');
        setSlideVideoUrl(publicUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setSlideVideoUrl(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      alert(err.message || t("فشل رفع ملف الفيديو"));
    } finally {
      setIsUploadingSlideVideo(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice <= 0) {
      alert(t("يرجى إدخال اسم المنتج وسعر صحيح"));
      return;
    }

    const featuresList = prodFeatures.split('\n').map(f => f.trim()).filter(Boolean);
    const featuresEnList = prodFeaturesEn.split('\n').map(f => f.trim()).filter(Boolean);
    const finalImages = prodImages.length > 0 ? prodImages : ['/logo.png'];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: prodName.trim(),
        nameAr: prodName.trim(),
        nameEn: prodNameEn.trim() || prodName.trim(),
        category: prodCategory,
        price: Number(prodPrice),
        originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
        stockCount: Number(prodStock),
        inStock: Number(prodStock) > 0,
        description: prodDescription,
        descriptionAr: prodDescription,
        descriptionEn: prodDescriptionEn.trim() || undefined,
        images: finalImages,
        videoUrl: prodVideoUrl.trim() || undefined,
        features: featuresList,
        featuresAr: featuresList,
        featuresEn: featuresEnList.length > 0 ? featuresEnList : undefined
      });
    } else {
      addProduct({
        name: prodName.trim(),
        nameAr: prodName.trim(),
        nameEn: prodNameEn.trim() || prodName.trim(),
        category: prodCategory,
        price: Number(prodPrice),
        originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
        stockCount: Number(prodStock),
        inStock: Number(prodStock) > 0,
        description: prodDescription,
        descriptionAr: prodDescription,
        descriptionEn: prodDescriptionEn.trim() || undefined,
        images: finalImages,
        videoUrl: prodVideoUrl.trim() || undefined,
        features: featuresList,
        featuresAr: featuresList,
        featuresEn: featuresEnList.length > 0 ? featuresEnList : undefined,
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
      alert(t("يرجى كتابة عنوان البانر واختيار صورة"));
      return;
    }

    const slideData = {
      title: slideTitle,
      titleAr: slideTitle,
      titleEn: slideTitleEn.trim() || undefined,
      subtitle: slideSubtitle,
      subtitleAr: slideSubtitle,
      subtitleEn: slideSubtitleEn.trim() || undefined,
      tag: slideTag || t("عرض خاص"),
      tagAr: slideTag || t("عرض خاص"),
      tagEn: slideTagEn.trim() || undefined,
      ctaText: slideCta || t("تسوق الآن"),
      ctaTextAr: slideCta || t("تسوق الآن"),
      ctaTextEn: slideCtaEn.trim() || undefined,
      targetCategory: slideCategory || 'all',
      image: slideImage,
      videoUrl: slideVideoUrl.trim() || undefined,
      mediaType: (slideVideoUrl.trim() ? 'video' : 'image') as 'image' | 'video'
    };

    if (editingSlide) {
      updateSlide(editingSlide.id, slideData);
      setEditingSlide(null);
    } else {
      addSlide(slideData);
    }

    setSlideTitle('');
    setSlideTitleEn('');
    setSlideSubtitle('');
    setSlideSubtitleEn('');
    setSlideTag('');
    setSlideTagEn('');
    setSlideCta(t("تسوق الآن"));
    setSlideCtaEn('Shop Now');
    setSlideImage('');
    setSlideVideoUrl('');
    triggerSaveFeedback();
  };

  const handleEditSlideClick = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideTitle(slide.titleAr || slide.title);
    setSlideTitleEn(slide.titleEn || '');
    setSlideSubtitle(slide.subtitleAr || slide.subtitle);
    setSlideSubtitleEn(slide.subtitleEn || '');
    setSlideTag(slide.tagAr || slide.tag);
    setSlideTagEn(slide.tagEn || '');
    setSlideCta(slide.ctaTextAr || slide.ctaText);
    setSlideCtaEn(slide.ctaTextEn || 'Shop Now');
    setSlideImage(slide.image);
    setSlideVideoUrl(slide.videoUrl || '');
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
      icon: newCatIcon || 'Layers',
      itemCount: 0
    });
    setNewCatNameAr('');
    setNewCatNameEn('');
    setNewCatId('');
    setNewCatIcon('Sparkles');
    triggerSaveFeedback();
  };

  const handleUpdateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatNameAr) return;
    updateCategory(editingCategory.id, {
      nameAr: editCatNameAr,
      nameEn: editCatNameEn || editCatNameAr,
      icon: editCatIcon || editingCategory.icon
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

  const handleSaveBotRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !newRuleKeywords.trim() || !newRuleReply.trim()) return;
    const kwArray = newRuleKeywords.split(',').map(k => k.trim()).filter(Boolean);
    
    if (editingBotRule) {
      updateBotRule(editingBotRule.id, {
        title: newRuleTitle.trim(),
        keywords: kwArray,
        replyText: newRuleReply.trim(),
        replyTextAr: newRuleReply.trim(),
        replyTextEn: newRuleReplyEn.trim() || undefined
      });
      setEditingBotRule(null);
    } else {
      addBotRule({
        title: newRuleTitle.trim(),
        keywords: kwArray,
        replyText: newRuleReply.trim(),
        replyTextAr: newRuleReply.trim(),
        replyTextEn: newRuleReplyEn.trim() || undefined,
        isActive: true
      });
    }

    setNewRuleTitle('');
    setNewRuleKeywords('');
    setNewRuleReply('');
    setNewRuleReplyEn('');
    triggerSaveFeedback();
  };

  const openEditBotRule = (rule: BotKnowledgeRule) => {
    setEditingBotRule(rule);
    setNewRuleTitle(rule.title);
    setNewRuleKeywords(rule.keywords.join(', '));
    setNewRuleReply(rule.replyTextAr || rule.replyText);
    setNewRuleReplyEn(rule.replyTextEn || '');
  };

  const cancelEditBotRule = () => {
    setEditingBotRule(null);
    setNewRuleTitle('');
    setNewRuleKeywords('');
    setNewRuleReply('');
    setNewRuleReplyEn('');
  };

  const handleDeleteBotRule = (id: string) => {
    if (window.confirm(t("هل أنت متأكد من حذف هذه القاعدة التعليمية للبوت؟"))) {
      deleteBotRule(id);
      triggerSaveFeedback();
    }
  };

  const handleAddTrustBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeTitleAr.trim()) return;
    const currentBadges = tempSettings.trustBadges || [];
    const newBadge: StoreTrustBadge = {
      id: `b-${Date.now()}`,
      icon: newBadgeIcon || 'ShieldCheck',
      titleAr: newBadgeTitleAr.trim(),
      titleEn: newBadgeTitleEn.trim() || newBadgeTitleAr.trim(),
      descAr: newBadgeDescAr.trim() || undefined,
      descEn: newBadgeDescEn.trim() || undefined
    };
    setTempSettings({
      ...tempSettings,
      trustBadges: [...currentBadges, newBadge]
    });
    setNewBadgeTitleAr('');
    setNewBadgeTitleEn('');
    setNewBadgeDescAr('');
    setNewBadgeDescEn('');
    setNewBadgeIcon('ShieldCheck');
  };

  
  // Announcement Offers Handlers (TASK 9)
  const handleAddAnnouncementOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTextAr.trim()) {
      alert(t("يرجى كتابة نص الإعلان الترويجي بالعربي"));
      return;
    }
    const newOffer: AnnouncementOffer = {
      id: `offer_${Date.now()}`,
      textAr: newOfferTextAr.trim(),
      textEn: newOfferTextEn.trim() || newOfferTextAr.trim(),
      isActive: true,
      durationSeconds: Number(newOfferDuration) || 12
    };

    const currentOffers = tempSettings.announcementOffers || [];
    const updated = [...currentOffers, newOffer];
    setTempSettings({ ...tempSettings, announcementOffers: updated });
    updateSettings({ ...tempSettings, announcementOffers: updated });
    setNewOfferTextAr('');
    setNewOfferTextEn('');
  };

  const handleToggleAnnouncementOffer = (offerId: string) => {
    const currentOffers = tempSettings.announcementOffers || [];
    const updated = currentOffers.map(o => o.id === offerId ? { ...o, isActive: !o.isActive } : o);
    setTempSettings({ ...tempSettings, announcementOffers: updated });
    updateSettings({ ...tempSettings, announcementOffers: updated });
  };

  const handleDeleteAnnouncementOffer = (offerId: string) => {
    if (window.confirm(t("هل أنت متأكد من حذف هذا الإعلان الترويجي؟"))) {
      const currentOffers = tempSettings.announcementOffers || [];
      const updated = currentOffers.filter(o => o.id !== offerId);
      setTempSettings({ ...tempSettings, announcementOffers: updated });
      updateSettings({ ...tempSettings, announcementOffers: updated });
    }
  };

  // Full Store Backup & Restore Handlers (TASK 12)
  const exportStoreBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      storeName: settings.storeNameAr,
      products,
      categories,
      slides,
      coupons,
      orders,
      settings,
      botRules
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mortafaat_Store_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(t("تم تصدير النسخة الاحتياطية بنجاح وحفظها كملف JSON على جهازك."));
  };

  const importStoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data || typeof data !== 'object') {
          throw new Error('ملف النسخة الاحتياطية غير صالح.');
        }

        if (window.confirm(t("هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم تحديث المنتجات والإعدادات وفقاً للنسخة المستعادة."))) {
          if (Array.isArray(data.products)) {
            localStorage.setItem('mortafaat_products_v2', JSON.stringify(data.products));
          }
          if (Array.isArray(data.categories)) {
            localStorage.setItem('mortafaat_categories', JSON.stringify(data.categories));
          }
          if (Array.isArray(data.slides)) {
            localStorage.setItem('mortafaat_slides', JSON.stringify(data.slides));
          }
          if (Array.isArray(data.coupons)) {
            localStorage.setItem('mortafaat_coupons', JSON.stringify(data.coupons));
          }
          if (Array.isArray(data.orders)) {
            localStorage.setItem('mortafaat_orders', JSON.stringify(data.orders));
          }
          if (data.settings && typeof data.settings === 'object') {
            updateSettings(data.settings);
            setTempSettings(data.settings);
          }
          if (Array.isArray(data.botRules)) {
            localStorage.setItem('mortafaat_bot_rules', JSON.stringify(data.botRules));
          }
          alert(t("تمت استعادة النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة لتطبيق البيانات."));
          window.location.reload();
        }
      } catch (err: any) {
        alert(t("فشل استعادة النسخة الاحتياطية: ") + (err.message || 'الملف تالف'));
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteTrustBadge = (id: string) => {
    if (window.confirm(t("هل أنت متأكد من حذف هذه الميزة؟"))) {
      const currentBadges = tempSettings.trustBadges || [];
      setTempSettings({
        ...tempSettings,
        trustBadges: currentBadges.filter(b => b.id !== id)
      });
    }
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
    const headers = t("رقم الطلب,اسم العميل,رقم الهاتف,المحافظة,العنوان,طريقة الدفع,حالة الدفع,حالة الطلب,الإجمالي,التاريخ\n");
    const rows = orders.map(o => 
      `"${o.orderNumber || o.id}","${o.customerName}","${o.phone}","${o.governorate}","${o.address.replace(/"/g, '""')}","${o.paymentMethod}","${o.paymentStatus}","${o.status}","${o.total}","${o.createdAt}"`
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

  const exportCustomersCSV = () => {
    const headers = t("اسم العميل,رقم الهاتف,المحافظة,العنوان,عدد الطلبات,إجمالي المشتريات,تاريخ آخر طلب\n");
    const rows = customersList.map(c =>
      `"${c.name}","${c.phone}","${c.governorate}","${c.address.replace(/"/g, '""')}","${c.ordersCount}","${c.totalSpent}","${c.lastOrderDate}"`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mortafaat-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch = !orderSearch.trim() || 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.orderNumber && String(o.orderNumber).includes(orderSearch)) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#07090E] text-black dark:text-white pb-16 transition-colors">
      
      {/* Save Feedback Toast Alert */}
      {saveFeedbackToast && (
        <div className="fixed bottom-6 end-6 z-50 bg-emerald-700/95 backdrop-blur text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs border border-emerald-500/40 transition-all duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{t("تم الحفظ بنجاح ✓")}</span>
        </div>
      )}

      {/* Realtime New Order Notification Banner */}
      {newOrderNotification && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-amber-500/20 border-2 border-brand-gold text-brand-black dark:text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
              </span>
              <div>
                <p className="font-black text-sm">
                  {t("🔔 طلب جديد وارد الآن من العميل: {0} بقيمة {1} ج.م!", newOrderNotification.customerName, newOrderNotification.total)}
                </p>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t("رقم الطلب:")} #{newOrderNotification.orderNumber || newOrderNotification.id} • {newOrderNotification.governorate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('orders');
                  clearNewOrderNotification();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-brand-gold text-black font-extrabold text-xs hover:brightness-105"
              >
                {t("عرض الطلب فوراً")}
              </button>
              <button
                onClick={clearNewOrderNotification}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
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
            <span>{t("نظرة عامة وإحصائيات")}</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'slides' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-brand-goldDark" />
            <span>{t("البانرات والسلايدر (")}{slides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'categories' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Layers className="w-4 h-4 text-brand-goldDark" />
            <span>{t("الأقسام (")}{categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'products' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Package className="w-4 h-4 text-brand-goldDark" />
            <span>{t("المنتجات والمخزون (")}{products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-brand-goldDark" />
            <span>{t("الطلبات (")}{orders.length})</span>
            {pendingOrders > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'customers' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Users className="w-4 h-4 text-brand-goldDark" />
            <span>{t("متابعة العملاء (")}{customersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'coupons' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Tag className="w-4 h-4 text-brand-goldDark" />
            <span>{t("الكوبونات (")}{coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('live-chat')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'live-chat' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-brand-goldDark" />
            <span>{t("شات الدعم")}</span>
          </button>

          <button
            onClick={() => setActiveTab('bot-training')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bot-training' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Bot className="w-4 h-4 text-brand-goldDark" />
            <span>{t("تعليم البوت")}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings' ? 'border-brand-gold text-brand-black dark:text-brand-gold bg-amber-50/50 dark:bg-zinc-800' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-brand-goldDark" />
            <span>{t("الإعدادات والأمان")}</span>
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
                <span className="text-brand-gold text-xs font-bold uppercase tracking-wider">{t("مرحباً بك في لوحة تحكم")}</span>
                <h2 className="text-2xl sm:text-3xl font-black mt-1">{t("مرتفعات ستور (Mortafaat Store)")}</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  {t("تحكم كامل في المنتجات، المخزون، الأسعار، الكوبونات، وتفاصيل الطلبات الواردة بصورها الحقيقية.")}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('store')}
                  className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                >
                  {t("معاينة المتجر للعملاء")}
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">{t("إجمالي الإيرادات والمبيعات")}</span>
                  <span className="text-2xl font-black text-brand-goldDark mt-1 block">
                    {totalSalesRevenue.toLocaleString()} {t("ج.م")}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-brand-goldDark flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">{t("إجمالي الطلبات")}</span>
                  <span className="text-2xl font-black text-black dark:text-white mt-1 block font-mono">
                    {orders.length}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">{t("طلبات بانتظار التأكيد")}</span>
                  <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">
                    {pendingOrders}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">{t("تنبيه انخفاض المخزون")}</span>
                  <span className="text-2xl font-black text-red-600 mt-1 block font-mono">
                    {lowStockProducts.length}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black">{t("إجراءات سريعة لإدارة المتجر:")}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={openAddProduct}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-start hover:border-brand-gold transition-colors"
                >
                  <Plus className="w-5 h-5 text-brand-goldDark mb-2" />
                  <span className="font-bold text-xs block">{t("إضافة منتج جديد")}</span>
                  <span className="text-[10px] text-gray-500">{t("صور، فيديو، أسعار، ومخزون")}</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-start hover:border-brand-gold transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 text-brand-goldDark mb-2" />
                  <span className="font-bold text-xs block">{t("متابعة الطلبات")}</span>
                  <span className="text-[10px] text-gray-500">{t("تحديث الحالة وطباعة الفواتير")}</span>
                </button>

                <button
                  onClick={() => setActiveTab('customers')}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-start hover:border-brand-gold transition-colors"
                >
                  <Users className="w-5 h-5 text-brand-goldDark mb-2" />
                  <span className="font-bold text-xs block">{t("قائمة العملاء")}</span>
                  <span className="text-[10px] text-gray-500">{t("بيانات التواصل وسجل الشراء")}</span>
                </button>

                <button
                  onClick={() => setActiveTab('coupons')}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-start hover:border-brand-gold transition-colors"
                >
                  <Tag className="w-5 h-5 text-brand-goldDark mb-2" />
                  <span className="font-bold text-xs block">{t("إنشاء كوبون خصم")}</span>
                  <span className="text-[10px] text-gray-500">{t("نسبة مئوية أو مبلغ ثابت")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO SLIDES & SLIDER SPEED */}
        {activeTab === 'slides' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-goldDark" />
                <span>{editingSlide ? t("تعديل البانر:") : t("إضافة بانر جديد للسلايدر الرئيسي")}</span>
              </h3>

              <form onSubmit={handleSaveSlide} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold block mb-1">{t("عنوان البانر الرئيسي بالعربي *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("مثال: أقوى عروض الشتاء 2026")}
                    value={slideTitle}
                    onChange={(e) => setSlideTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("عنوان البانر بالإنجليزي (English)")}</label>
                  <input
                    type="text"
                    placeholder="e.g. Winter Mega Deals 2026"
                    value={slideTitleEn}
                    onChange={(e) => setSlideTitleEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("العنوان الفرعي بالعربي")}</label>
                  <input
                    type="text"
                    placeholder={t("مثال: خصومات حصرية تصل حتى 40%")}
                    value={slideSubtitle}
                    onChange={(e) => setSlideSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("العنوان الفرعي بالإنجليزي (English)")}</label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 40% exclusive discount"
                    value={slideSubtitleEn}
                    onChange={(e) => setSlideSubtitleEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("الشارة بالعربي (Badge Tag)")}</label>
                  <input
                    type="text"
                    placeholder={t("مثال: وصل حديثاً")}
                    value={slideTag}
                    onChange={(e) => setSlideTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("الشارة بالإنجليزي (Badge Tag EN)")}</label>
                  <input
                    type="text"
                    placeholder="e.g. New Arrival"
                    value={slideTagEn}
                    onChange={(e) => setSlideTagEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("نص الزر بالعربي")}</label>
                  <input
                    type="text"
                    value={slideCta}
                    onChange={(e) => setSlideCta(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("نص الزر بالإنجليزي (Button Text EN)")}</label>
                  <input
                    type="text"
                    value={slideCtaEn}
                    onChange={(e) => setSlideCtaEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold text-left"
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">{t("رابط صورة البانر (أساسي أو خلفية بديلة) *")}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder={t("رابط الصورة https://...")}
                      value={slideImage}
                      onChange={(e) => setSlideImage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <label className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold cursor-pointer hover:bg-black transition-colors flex items-center gap-1.5 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t("رفع من جهازك")}</span>
                      <input type="file" accept="image/*" onChange={handleSlideImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">{t("فيديو البانر (اختياري - رابط أو ارفع من جهازك إلى السحابة):")}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://... (mp4 / webm)"
                      value={slideVideoUrl}
                      onChange={(e) => setSlideVideoUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs"
                      dir="ltr"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 transition-colors flex items-center gap-1.5 flex-shrink-0 text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingSlideVideo ? t("جاري الرفع...") : t("رفع فيديو")}</span>
                      <input type="file" accept="video/mp4,video/webm,video/*" onChange={handleSlideVideoUpload} disabled={isUploadingSlideVideo} className="hidden" />
                    </label>
                    {slideVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setSlideVideoUrl('')}
                        className="px-3 py-2 text-xs bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl hover:bg-red-200"
                      >
                        {t("إزالة الفيديو")}
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                  >
                    {editingSlide ? t("✓ حفظ تعديلات البانر") : t("+ إضافة هذا البانر للسلايدر")}
                  </button>
                  {editingSlide && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlide(null);
                        setSlideTitle('');
                        setSlideTitleEn('');
                        setSlideSubtitle('');
                        setSlideSubtitleEn('');
                        setSlideTag('');
                        setSlideTagEn('');
                        setSlideCta(t("تسوق الآن"));
                        setSlideCtaEn('Shop Now');
                        setSlideImage('');
                        setSlideVideoUrl('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                    >
                      {t("إلغاء")}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Current Slides */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black">{t("البانرات المعروضة حالياً (")}{slides.length}):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {slides.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-gray-50 dark:bg-zinc-800/60 flex flex-col justify-between">
                    <div className="h-32 w-full overflow-hidden relative">
                      <img src={s.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {s.videoUrl && (
                          <span className="bg-amber-500 text-black text-[10px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow">
                            <Video className="w-3 h-3" />
                            <span>فيديو</span>
                          </span>
                        )}
                        <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {s.tagAr || s.tag}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 space-y-1 text-xs">
                      <h4 className="font-bold line-clamp-1">{s.titleAr || s.title}</h4>
                      {s.titleEn && <p className="text-[10px] text-gray-400 font-mono line-clamp-1">{s.titleEn}</p>}
                      <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-2">{s.subtitleAr || s.subtitle}</p>
                    </div>

                    <div className="p-2.5 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                      <button
                        onClick={() => handleEditSlideClick(s)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{t("تعديل")}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (slides.length <= 1) {
                            alert(t("يجب أن يتبقى بانر واحد على الأقل في السلايدر"));
                            return;
                          }
                          deleteSlide(s.id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
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

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-goldDark" />
                <span>{t("إضافة قسم جديد لمتجر مرتفعات ستور")}</span>
              </h3>

              <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">{t("اسم القسم بالعربي *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("مثال: ساعات وإكسسوارات")}
                    value={newCatNameAr}
                    onChange={(e) => setNewCatNameAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("اسم القسم بالإنجليزي")}</label>
                  <input
                    type="text"
                    placeholder="e.g. Watches & Accessories"
                    value={newCatNameEn}
                    onChange={(e) => setNewCatNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("معرّف القسم (ID) *")}</label>
                  <input
                    type="text"
                    placeholder="e.g. watches"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("أيقونة القسم")}</label>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold font-bold"
                  >
                    {AVAILABLE_CATEGORY_ICONS.map(ic => (
                      <option key={ic.id} value={ic.id}>
                        {ic.nameAr} ({ic.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                  >
                    {t("+ إضافة القسم")}
                  </button>
                </div>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black">{t("الأقسام الحالية (")}{categories.length}):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-brand-goldDark shadow-sm">
                        {renderDynamicIcon(cat.icon, { className: 'w-5 h-5' })}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{cat.nameAr}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{cat.id} • {cat.nameEn}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setEditCatNameAr(cat.nameAr);
                          setEditCatNameEn(cat.nameEn);
                          setEditCatIcon(cat.icon || 'Sparkles');
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (categories.length <= 1) {
                            alert(t("يجب أن يتبقى قسم واحد على الأقل في المتجر!"));
                            return;
                          }
                          deleteCategory(cat.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
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
                    <h3 className="font-bold text-sm">{t("تعديل اسم وأيقونة القسم:")} {editingCategory.nameAr}</h3>
                    <button onClick={() => setEditingCategory(null)}>✕</button>
                  </div>

                  <form onSubmit={handleUpdateCategorySubmit} className="space-y-3">
                    <div>
                      <label className="font-bold block mb-1">{t("الاسم بالعربي:")}</label>
                      <input
                        type="text"
                        required
                        value={editCatNameAr}
                        onChange={(e) => setEditCatNameAr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">{t("الاسم بالإنجليزي:")}</label>
                      <input
                        type="text"
                        value={editCatNameEn}
                        onChange={(e) => setEditCatNameEn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">{t("أيقونة القسم:")}</label>
                      <select
                        value={editCatIcon}
                        onChange={(e) => setEditCatIcon(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                      >
                        {AVAILABLE_CATEGORY_ICONS.map(ic => (
                          <option key={ic.id} value={ic.id}>
                            {ic.nameAr} ({ic.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 py-2 bg-gold-gradient text-black font-extrabold rounded-xl shadow">
                        {t("حفظ التعديل")}
                      </button>
                      <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-xl">
                        {t("إلغاء")}
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
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{t("قائمة منتجات المتجر")}</h3>
                <p className="text-xs text-gray-500">{t("تحكم بالأسعار، نسب الخصومات، والصور والمخزون")}</p>
              </div>

              <button
                onClick={openAddProduct}
                className="px-4 py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{t("إضافة منتج جديد الآن")}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-y border-gray-200 dark:border-zinc-700">
                  <tr>
                    <th className="py-3 px-3">{t("المنتج")}</th>
                    <th className="py-3 px-3">{t("القسم")}</th>
                    <th className="py-3 px-3">{t("السعر الحالي")}</th>
                    <th className="py-3 px-3">{t("السعر الأصلي / الخصم")}</th>
                    <th className="py-3 px-3">{t("المخزون")}</th>
                    <th className="py-3 px-3 text-center">{t("إجراءات")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {products.map((p) => {
                    const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img src={p.images[0] || '/logo.png'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0 border" />
                          <div>
                            <p className="font-bold line-clamp-1">{p.name}</p>
                            <span className="text-[10px] text-gray-400 font-mono">{t("صور:")} {p.images?.length || 1} {p.videoUrl ? t("• مع فيديو") : ''}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-[11px] font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-brand-goldDark">
                          {p.price} {t("ج.م")}
                        </td>
                        <td className="py-3 px-3">
                          {p.originalPrice ? (
                            <div className="flex items-center gap-1.5">
                              <span className="line-through text-gray-400">{p.originalPrice} {t("ج.م")}</span>
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
                            p.stockCount > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                          }`}>
                            {p.stockCount > 0 ? t("{0} متوفر", p.stockCount) : t("نفذت الكمية")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t("هل أنت متأكد من حذف المنتج: \"{0}\"؟", p.name))) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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

        {/* TAB 5: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{t("سجل الطلبات الواردة")}</h3>
                <p className="text-xs text-gray-500">{t("اضغط على أي طلب لعرض تفاصيل المنتجات والأسعار وطباعة الفاتورة")}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportOrdersCSV}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-brand-gold hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{t("تصدير الطلبات (CSV)")}</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute top-2.5 right-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("بحث برقم الطلب، اسم العميل، أو الهاتف...")}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
              >
                <option value="all">{t("جميع حالات الطلب")}</option>
                <option value="pending">{t("قيد الانتظار (جديد)")}</option>
                <option value="processing">{t("جارٍ التجهيز")}</option>
                <option value="shipped">{t("تم الشحن")}</option>
                <option value="delivered">{t("تم التسليم بنجاح")}</option>
                <option value="cancelled">{t("ملغي")}</option>
              </select>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">
                  {t("لا توجد طلبات مطابقة حالياً")}
                </div>
              ) : (
                filteredOrders.map((ord) => {
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
                            <span className="font-mono font-black text-sm block">#{ord.orderNumber || ord.id}</span>
                            <span className="text-[10px] text-gray-500">{ord.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[10px]">{t("العميل:")}</span>
                            <span className="font-bold">{ord.customerName}</span>
                            <span className="text-gray-500 block font-mono text-[10px]">{ord.phone}</span>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px]">{t("الإجمالي:")}</span>
                            <span className="font-black text-brand-goldDark">{ord.total} {t("ج.م")}</span>
                          </div>

                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                            {ord.paymentMethod === 'cod' ? t("الدفع عند الاستلام") : t("دفع إلكتروني")}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Order Details */}
                      {isExpanded && (
                        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-4 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{t("حالة الطلب:")}</span>
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                                className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold text-xs"
                              >
                                <option value="pending">{t("قيد الانتظار")}</option>
                                <option value="processing">{t("جارٍ التجهيز")}</option>
                                <option value="shipped">{t("تم الشحن")}</option>
                                <option value="delivered">{t("تم التسليم")}</option>
                                <option value="cancelled">{t("ملغي")}</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-bold">{t("حالة الدفع:")}</span>
                              <select
                                value={ord.paymentStatus}
                                onChange={(e) => updatePaymentStatus(ord.id, e.target.value as any)}
                                className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold text-xs"
                              >
                                <option value="unpaid">{t("غير مدفوع (عند الاستلام)")}</option>
                                <option value="pending_verification">{t("قيد التحقق")}</option>
                                <option value="paid">{t("تم الدفع")}</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveInvoiceOrder(ord)}
                                className="px-3 py-1 rounded-lg bg-black text-white hover:bg-brand-gold hover:text-black font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>{t("عرض الفاتورة")}</span>
                              </button>

                              <a
                                href={`https://wa.me/2${ord.phone.replace(/^0/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{t("واتساب")}</span>
                              </a>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-500 font-bold block mb-1">{t("عنوان التوصيل وملاحظات العميل:")}</span>
                            <p className="bg-gray-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 font-medium">
                              {ord.governorate} - {ord.address} {ord.notes ? `(${t("ملاحظات:")} ${ord.notes})` : ''}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">{t("المنتجات المطلوبة (")}{ord.items.length}):</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40">
                                  <img 
                                    src={item.product.images?.[0] || '/logo.png'} 
                                    alt={item.product.name} 
                                    className="w-12 h-12 rounded-lg object-cover border" 
                                  />
                                  <div className="flex-1">
                                    <h5 className="font-bold line-clamp-1">{item.product.name}</h5>
                                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                      <span>{t("الكمية:")} <b>{item.quantity}</b></span>
                                      <span>•</span>
                                      <span>{t("السعر:")} <b>{item.product.price} ج.م</b></span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{t("متابعة العملاء وسجل الشراء")}</h3>
                <p className="text-xs text-gray-500">{t("بيانات العملاء الذين قاموا بالطلب، إجمالي مشترياتهم، وروابط التواصل المباشر")}</p>
              </div>

              <button
                onClick={exportCustomersCSV}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-brand-gold hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t("تصدير العملاء (CSV)")}</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute top-2.5 right-3 text-gray-400" />
              <input
                type="text"
                placeholder={t("بحث باسم العميل، رقم الهاتف، أو المحافظة...")}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
              />
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-y border-gray-200 dark:border-zinc-700">
                  <tr>
                    <th className="py-3 px-3">{t("اسم العميل")}</th>
                    <th className="py-3 px-3">{t("رقم الهاتف")}</th>
                    <th className="py-3 px-3">{t("المحافظة والعنوان")}</th>
                    <th className="py-3 px-3 text-center">{t("عدد الطلبات")}</th>
                    <th className="py-3 px-3">{t("إجمالي المشتريات")}</th>
                    <th className="py-3 px-3 text-center">{t("تواصل مباشر")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        {t("لا توجد بيانات عملاء مسجلة بعد")}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust, i) => (
                      <tr key={i} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold">
                          {cust.name}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {cust.phone}
                        </td>
                        <td className="py-3 px-3 max-w-[200px] truncate text-gray-500">
                          {cust.governorate} - {cust.address}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-mono">
                            {cust.ordersCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black text-brand-goldDark">
                          {cust.totalSpent.toLocaleString()} {t("ج.م")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <a
                            href={`https://wa.me/2${cust.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{t("واتساب")}</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-goldDark" />
                <span>{t("إنشاء كوبون خصم جديد")}</span>
              </h3>

              <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">{t("كود الكوبون *")}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SALE20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-mono uppercase focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("نوع الخصم")}</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                  >
                    <option value="percentage">{t("نسبة مئوية (%)")}</option>
                    <option value="fixed">{t("مبلغ ثابت (ج.م)")}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("قيمة الخصم *")}</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("حد أدنى للطلب (ج.م)")}</label>
                  <input
                    type="number"
                    min={0}
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                  >
                    {t("+ تفعيل وإضافة الكوبون")}
                  </button>
                </div>
              </form>
            </div>

            {/* Coupons List */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black">{t("الكوبونات النشطة (")}{coupons.length}):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.code} className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-sm block">{c.code}</span>
                      <span className="text-[11px] text-brand-goldDark font-bold">
                        {c.discountType === 'percentage' ? `${c.discountValue}% خصم` : `${c.discountValue} ج.م خصم`}
                      </span>
                      {c.minOrderValue ? (
                        <span className="text-[10px] text-gray-500 block">
                          {t("حد أدنى:")} {c.minOrderValue} ج.م
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCoupon(c.code)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {c.isActive ? t("مفعّل") : t("معطّل")}
                      </button>

                      <button
                        onClick={() => deleteCoupon(c.code)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
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

        {/* TAB 8: LIVE CHAT */}
        {activeTab === 'live-chat' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-black">{t("شات خدمة عملاء مرتفعات ستور")}</h3>
            <div className="h-96 overflow-y-auto p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 space-y-3 text-xs">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'user' ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl font-medium ${
                      m.sender === 'user'
                        ? 'bg-white dark:bg-zinc-700 text-black dark:text-white border'
                        : 'bg-brand-black text-brand-gold'
                    }`}
                  >
                    <span className="text-[10px] opacity-70 block mb-0.5">
                      {m.sender === 'user' ? t("العميل") : m.senderName || t("بوت مرتفعات")} ({m.time})
                    </span>
                    <p>{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendAdminReply} className="flex gap-2">
              <input
                type="text"
                placeholder={t("اكتب رد الإدارة على العميل الآن...")}
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t("إرسال")}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 9: BOT TRAINING */}
        {/* TAB 8: BOT TRAINING */}
        {activeTab === 'bot-training' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-brand-goldDark" />
                  <span>{editingBotRule ? t("تعديل قاعدة ذكاء البوت:") + ' ' + editingBotRule.title : t("إضافة قاعدة ذكاء وتدريب للبوت")}</span>
                </div>
                {editingBotRule && (
                  <button
                    type="button"
                    onClick={cancelEditBotRule}
                    className="text-xs text-gray-500 hover:text-red-500 font-bold"
                  >
                    {t("إلغاء التعديل")} ✕
                  </button>
                )}
              </h3>

              <form onSubmit={handleSaveBotRule} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">{t("عنوان القاعدة *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("مثال: الرد على استفسار مدة الضمان")}
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("الكلمات المفتاحية (مفصولة بفاصلة) *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("مثال: ضمان, صيانة, عطل, warranty, guarantee")}
                    value={newRuleKeywords}
                    onChange={(e) => setNewRuleKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">{t("نص الرد بالعربي *")}</label>
                    <textarea
                      required
                      rows={3}
                      placeholder={t("اكتب الإجابة التي سيرد بها البوت تلقائياً عند السؤال بالعربية...")}
                      value={newRuleReply}
                      onChange={(e) => setNewRuleReply(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("نص الرد بالإنجليزي (English Reply)")}</label>
                    <textarea
                      rows={3}
                      placeholder="Automatic English response when customer asks in English..."
                      value={newRuleReplyEn}
                      onChange={(e) => setNewRuleReplyEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:border-brand-gold text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
                  >
                    {editingBotRule ? t("✓ حفظ تعديلات القاعدة") : t("+ تدريب وحفظ القاعدة")}
                  </button>
                  {editingBotRule && (
                    <button
                      type="button"
                      onClick={cancelEditBotRule}
                      className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                    >
                      {t("إلغاء")}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Rules List */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-black">{t("القواعد النشطة المدربة (")}{botRules.length}):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {botRules.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs">{r.title}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditBotRule(r)}
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          title={t("تعديل القاعدة")}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBotRule(r.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title={t("حذف")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {r.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-zinc-700 text-brand-goldDark text-[10px] font-bold">
                          #{kw}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800">
                        {r.replyTextAr || r.replyText}
                      </p>
                      {r.replyTextEn && (
                        <p className="text-[10px] text-gray-400 font-mono bg-white dark:bg-zinc-900 p-2 rounded-xl border border-gray-100 dark:border-zinc-800 text-left" dir="ltr">
                          EN: {r.replyTextEn}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <SettingsPanelErrorBoundary>
          <div className="space-y-6">
            
            {/* Store Information & Shipping Settings */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-base font-black">{t("إعدادات المتجر وبيانات الشحن")}</h3>
                <p className="text-xs text-gray-500">{t("تحكم بأسعار الشحن والحد الأدنى للشحن المجاني وبيانات التواصل")}</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold block mb-1">{t("اسم المتجر بالعربي:")}</label>
                    <input
                      type="text"
                      value={tempSettings.storeNameAr}
                      onChange={(e) => setTempSettings({ ...tempSettings, storeNameAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("اسم المتجر بالإنجليزي:")}</label>
                    <input
                      type="text"
                      value={tempSettings.storeNameEn}
                      onChange={(e) => setTempSettings({ ...tempSettings, storeNameEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("رقم الهاتف للتواصل والواتساب:")}</label>
                    <input
                      type="text"
                      value={tempSettings.phone}
                      onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value, whatsapp: `2${e.target.value}` })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("ثواني تغيير السلايدر التلقائي:")}</label>
                    <input
                      type="number"
                      min={2}
                      max={30}
                      value={tempSettings.sliderIntervalSeconds || 5}
                      onChange={(e) => setTempSettings({ ...tempSettings, sliderIntervalSeconds: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">{t("درجة تعتيم البانر الرئيسي (Overlay):")}</label>
                      <span className="text-xs font-mono font-bold text-brand-goldDark dark:text-brand-gold">
                        {Math.round((tempSettings.heroOverlayOpacity ?? 0.35) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={tempSettings.heroOverlayOpacity ?? 0.35}
                      onChange={(e) => setTempSettings({ ...tempSettings, heroOverlayOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                      <span>0% ({t("شفاف")})</span>
                      <span>35% ({t("الافتراضي")})</span>
                      <span>100% ({t("معتم")})</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("تكلفة الشحن الافتراضية (ج.م) *")}</label>
                    <input
                      type="number"
                      min={0}
                      value={tempSettings.shippingFee}
                      onChange={(e) => setTempSettings({ ...tempSettings, shippingFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("الحد الأدنى للشحن المجاني (ج.م) *")}</label>
                    <input
                      type="number"
                      min={0}
                      value={tempSettings.freeShippingThreshold}
                      onChange={(e) => setTempSettings({ ...tempSettings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">{t("شريط الإعلانات أعلى المتجر بالعربي:")}</label>
                    <input
                      type="text"
                      value={tempSettings.announcementText || tempSettings.announcementTextAr || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, announcementText: e.target.value, announcementTextAr: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("شريط الإعلانات بالإنجليزي (English Announcement):")}</label>
                    <input
                      type="text"
                      placeholder="e.g. Free shipping on orders over 1500 EGP"
                      value={tempSettings.announcementTextEn || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, announcementTextEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-xs text-gray-700 dark:text-gray-300">{t("سياسات المتجر (ثنائية اللغة):")}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1">{t("سياسة الاستبدال والاسترجاع (عربي):")}</label>
                      <textarea
                        rows={3}
                        value={tempSettings.returnPolicyText}
                        onChange={(e) => setTempSettings({ ...tempSettings, returnPolicyText: e.target.value, returnPolicyTextAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">{t("سياسة الاستبدال والاسترجاع (إنجليزي):")}</label>
                      <textarea
                        rows={3}
                        placeholder="Return & Exchange policy in English..."
                        value={tempSettings.returnPolicyTextEn || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, returnPolicyTextEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1">{t("سياسة الشحن والتسليم (عربي):")}</label>
                      <textarea
                        rows={3}
                        value={tempSettings.shippingPolicyText}
                        onChange={(e) => setTempSettings({ ...tempSettings, shippingPolicyText: e.target.value, shippingPolicyTextAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">{t("سياسة الشحن والتسليم (إنجليزي):")}</label>
                      <textarea
                        rows={3}
                        placeholder="Shipping & Delivery policy in English..."
                        value={tempSettings.shippingPolicyTextEn || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, shippingPolicyTextEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1">{t("سياسة الخصوصية (عربي):")}</label>
                      <textarea
                        rows={3}
                        value={tempSettings.privacyPolicyText}
                        onChange={(e) => setTempSettings({ ...tempSettings, privacyPolicyText: e.target.value, privacyPolicyTextAr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">{t("سياسة الخصوصية (إنجليزي):")}</label>
                      <textarea
                        rows={3}
                        placeholder="Privacy policy in English..."
                        value={tempSettings.privacyPolicyTextEn || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, privacyPolicyTextEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Trust Badges Management */}
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-brand-goldDark" />
                        <span>{t("مميزات الثقة والأمان تحت البانر الرئيسي (Trust Badges):")}</span>
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {t("البطاقات الأربعة المعروضة مباشرة أسفل البانر الرئيسي في الصفحة الرئيسية")}
                      </p>
                    </div>
                  </div>

                  {/* Badges List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(tempSettings.trustBadges || []).map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-brand-goldDark flex items-center justify-center">
                            {renderDynamicIcon(b.icon, { className: 'w-4 h-4' })}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{b.titleAr}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{b.titleEn}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTrustBadge(b.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                          title={t("حذف")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Trust Badge Mini-Form */}
                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-zinc-800/40 border border-amber-200/60 dark:border-zinc-700/60 space-y-2">
                    <p className="font-bold text-[11px] text-brand-goldDark">{t("+ إضافة ميزة ثقة جديدة:")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder={t("العنوان بالعربي *")}
                        value={newBadgeTitleAr}
                        onChange={(e) => setNewBadgeTitleAr(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Title (English)"
                        value={newBadgeTitleEn}
                        onChange={(e) => setNewBadgeTitleEn(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs text-left"
                        dir="ltr"
                      />
                      <select
                        value={newBadgeIcon}
                        onChange={(e) => setNewBadgeIcon(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs font-bold"
                      >
                        {AVAILABLE_CATEGORY_ICONS.map(ic => (
                          <option key={ic.id} value={ic.id}>{ic.nameAr} ({ic.id})</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddTrustBadge}
                        className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-xs"
                      >
                        {t("+ إضافة الميزة")}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3 rounded-2xl bg-gold-gradient text-black font-black text-xs hover:brightness-105 shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>{t("جاري حفظ وتفعيل التعديلات...")}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t("حفظ وتفعيل كافة الإعدادات الآن")}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* TASK 9: PROMOTIONAL ANNOUNCEMENT OFFERS MANAGEMENT */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="text-base font-black text-black dark:text-white">{t("إدارة العروض الترويجية وعروض الافتتاح (شريط الإعلانات المتحرك)")}</h3>
                    <p className="text-xs text-gray-500">{t("تحكم بالعروض التي تظهر في الشريط المتحرك أعلى واجهة المتجر والهاتف")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 dark:bg-zinc-800 p-2 rounded-xl border border-amber-200 dark:border-zinc-700">
                  <Timer className="w-4 h-4 text-brand-goldDark" />
                  <span className="text-xs font-bold">{t("مدة ظهور العرض:")}</span>
                  <select
                    value={tempSettings.announcementSpeedSeconds || 12}
                    onChange={(e) => {
                      const speed = Number(e.target.value);
                      setTempSettings({ ...tempSettings, announcementSpeedSeconds: speed });
                      updateSettings({ ...tempSettings, announcementSpeedSeconds: speed });
                    }}
                    className="text-xs font-bold rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 px-2 py-1"
                  >
                    <option value={6}>6 {t("ثوانٍ (سريع)")}</option>
                    <option value={10}>10 {t("ثوانٍ")}</option>
                    <option value={14}>14 {t("ثانية (متوسط)")}</option>
                    <option value={20}>20 {t("ثانية")}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                {(tempSettings.announcementOffers || []).map((offer) => (
                  <div 
                    key={offer.id} 
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      offer.isActive 
                        ? 'bg-amber-50/50 dark:bg-zinc-800/80 border-amber-300 dark:border-amber-700/60' 
                        : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 opacity-60'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          offer.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {offer.isActive ? t("نشط ومفعل ✓") : t("معطل")}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {t("مدة العرض: {0} ثانية", offer.durationSeconds || 12)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{offer.textAr}</p>
                      {offer.textEn && <p className="text-[11px] font-sans text-gray-500">{offer.textEn}</p>}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAnnouncementOffer(offer.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          offer.isActive 
                            ? 'bg-amber-600/20 text-amber-900 dark:text-amber-300 hover:bg-amber-600/30' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {offer.isActive ? t("تعطيل") : t("تفعيل")}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncementOffer(offer.id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title={t("حذف")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddAnnouncementOffer} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-brand-goldDark dark:text-brand-gold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>{t("إضافة إعلان ترويجي أو عرض افتتاح جديد:")}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">{t("نص الإعلان بالعربي *")}</label>
                    <input
                      type="text"
                      required
                      placeholder={t("مثال: خصم 20% على الأحذية الرياضية بكود SPORT20")}
                      value={newOfferTextAr}
                      onChange={(e) => setNewOfferTextAr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t("نص الإعلان بالإنجليزي (اختياري)")}</label>
                    <input
                      type="text"
                      placeholder="e.g. 20% OFF on sports shoes with code SPORT20"
                      value={newOfferTextEn}
                      onChange={(e) => setNewOfferTextEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-xs hover:bg-brand-gold hover:text-black transition-colors"
                >
                  {t("+ إضافة العرض إلى الشريط")}
                </button>
              </form>
            </div>

            {/* TASK 12: FULL STORE BACKUP & RESTORATION CENTER */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-brand-goldDark">
                <Download className="w-5 h-5 text-brand-goldDark" />
                <div>
                  <h3 className="text-base font-black text-black dark:text-white">{t("مركز النسخ الاحتياطي واستعادة البيانات (Backup & Restore)")}</h3>
                  <p className="text-xs text-gray-500">{t("حفظ نسخة كاملة من المنتجات، الطلبات، الكوبونات، والإعدادات واستعادتها بضغطة زر")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-zinc-800/60 border border-amber-200 dark:border-zinc-700 space-y-2.5">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-brand-goldDark" />
                    <span>{t("تصدير نسخة احتياطية فورية (JSON Snapshot)")}</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("يقوم بتوليد ملف JSON رسمي يتضمن كافة المنتجات، الأقسام، الكوبونات، الطلبات، إعدادات المتجر، وقواعد البوت الذكي.")}
                  </p>
                  <button
                    type="button"
                    onClick={exportStoreBackup}
                    className="w-full py-2.5 rounded-xl bg-black text-brand-gold font-black text-xs hover:bg-zinc-800 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t("تحميل النسخة الاحتياطية الآن")}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 space-y-2.5">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>{t("استعادة المتجر من نسخة سابقة")}</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t("اختر ملف النسخة الاحتياطية (JSON) المحفوظ على جهازك لاستعادة كافة بيانات المتجر بدقة وأمان تام.")}
                  </p>
                  <label className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t("رفع ملف النسخة الاحتياطية (Restore)")}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importStoreBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Admin Role & Security Center */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-brand-goldDark">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-base font-black text-black dark:text-white">{t("مركز أمان لوحة الإدارة والصلاحيات")}</h3>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span>{t("الحساب الإداري الحالي:")}</span>
                  <span className="font-mono text-black dark:text-white">{currentUser?.email || t("غير مسجل")}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t("الصلاحية الموثقة:")}</span>
                  <span className="font-bold text-emerald-600">{currentUser?.role?.toUpperCase() || 'OWNER'}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t("حالة أمان قاعدة البيانات (RLS):")}</span>
                  <span className="font-bold text-emerald-600">{t("مفعّلة ومحمية بالكامل ✓")}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{t("منع العملاء من تعديل الصلاحيات:")}</span>
                  <span className="font-bold text-emerald-600">{t("مفعل بـ Trigger خادمي ✓")}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/20 p-4 space-y-2 text-xs">
                <p className="font-black text-emerald-800 dark:text-emerald-300">المالك الوحيد المعتمد للمتجر</p>
                <p className="font-mono font-bold text-gray-900 dark:text-white" dir="ltr">ahmedorabi753@gmail.com</p>
                <p className="text-gray-600 dark:text-gray-300">هذا البريد وحده يملك صلاحية OWNER. أي حساب آخر يظل عميلًا ولا يمكنه فتح لوحة الإدارة أو تعديل بيانات المتجر.</p>
              </div>
            </div>

          </div>
          </SettingsPanelErrorBoundary>
        )}

      </div>

      {/* ADD/EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-brand-gold/40 my-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="font-black text-sm">
                {editingProduct ? t("تعديل المنتج:") + ' ' + editingProduct.name : t("إضافة منتج جديد لمتجر مرتفعات ستور")}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="font-bold block mb-1">{t("اسم المنتج بالعربي *")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("مثال: ساعة ألترا ذكية ضد الماء")}
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">{t("الاسم بالإنجليزي")}</label>
                  <input
                    type="text"
                    placeholder="e.g. Ultra Smartwatch"
                    value={prodNameEn}
                    onChange={(e) => setProdNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("القسم التابع له *")}</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">{t("سعر البيع (ج.م) *")}</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("السعر قبل الخصم (ج.م)")}</label>
                  <input
                    type="number"
                    min={0}
                    placeholder={t("اختياري")}
                    value={prodOriginalPrice || ''}
                    onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">{t("الكمية بالمخزون *")}</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">{t("وصف تفصيلي للمنتج بالعربي:")}</label>
                  <textarea
                    rows={3}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">{t("وصف تفصيلي للمنتج بالإنجليزي (English):")}</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed product description in English..."
                    value={prodDescriptionEn}
                    onChange={(e) => setProdDescriptionEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Product Video URL or Upload */}
              <div>
                <label className="font-bold block mb-1">
                  {t("فيديو المنتج (اختياري - رابط أو ارفع من جهازك إلى السحابة):")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... (mp4 / webm / youtube)"
                    value={prodVideoUrl}
                    onChange={(e) => setProdVideoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs"
                    dir="ltr"
                  />
                  <label className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-300 dark:border-zinc-700 transition-colors flex items-center gap-1.5 flex-shrink-0 text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingProductVideo ? t("جاري الرفع...") : t("رفع فيديو")}</span>
                    <input type="file" accept="video/mp4,video/webm,video/*" onChange={handleProductVideoUpload} disabled={isUploadingProductVideo} className="hidden" />
                  </label>
                  {prodVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setProdVideoUrl('')}
                      className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 text-xs font-bold"
                    >
                      {t("إزالة")}
                    </button>
                  )}
                </div>
              </div>

              {/* Images & Storage Upload */}
              <div>
                <label className="font-bold block mb-1">{t("صور المنتج (أضف روابط أو ارفع من جهازك إلى التخزين):")}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={t("رابط صورة https://...")}
                    value={prodNewImageInput}
                    onChange={(e) => setProdNewImageInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-xs"
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
                    {t("+ إضافة")}
                  </button>
                  <label className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 cursor-pointer border border-gray-300 dark:border-zinc-700 flex items-center gap-1 font-bold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingProductImage ? t("جاري الرفع...") : t("رفع صورة")}</span>
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} disabled={isUploadingProductImage} className="hidden" />
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

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">{t("المميزات الرئيسية بالعربي (ميزة في كل سطر):")}</label>
                  <textarea
                    rows={2}
                    placeholder={t("بطارية تدوم 3 أيام\nمقاومة للمياه IP68")}
                    value={prodFeatures}
                    onChange={(e) => setProdFeatures(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">{t("المميزات بالإنجليزي (ميزة في كل سطر):")}</label>
                  <textarea
                    rows={2}
                    placeholder={"3-day battery life\nIP68 Water resistant"}
                    value={prodFeaturesEn}
                    onChange={(e) => setProdFeaturesEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gold-gradient text-black font-extrabold text-xs shadow-md hover:brightness-105"
              >
                {editingProduct ? t("✓ حفظ كافة تعديلات المنتج") : t("+ إضافة المنتج ونشره الآن")}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
