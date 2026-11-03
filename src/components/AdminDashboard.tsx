import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Coupon, BotKnowledgeRule, StoreSettings } from '../types';
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
  Smartphone,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  CreditCard,
  Tag,
  Lock,
  Search,
  MessageSquare,
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  Sliders
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    settings, 
    coupons,
    botRules,
    chatMessages,
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
    deleteBotRule,
    toggleBotRule,
    adminSendReply,
    setCurrentView
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'live-chat' | 'bot-training' | 'gateway' | 'coupons' | 'policies' | 'marketplaces' | 'settings'>('products');

  // Product Add/Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodCategory, setProdCategory] = useState<Product['category']>('electronics');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | undefined>(undefined);
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodFeatures, setProdFeatures] = useState('');

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Settings State Form
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

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
    setProdCategory('electronics');
    setProdPrice(0);
    setProdOriginalPrice(undefined);
    setProdStock(10);
    setProdDescription('');
    setProdImageUrl('');
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
    setProdImageUrl(prod.images[0] || '');
    setProdFeatures(prod.features ? prod.features.join('\n') : '');
    setIsAddModalOpen(true);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGatewayLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTempSettings(prev => ({ ...prev, onlineGatewayLogoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = prodFeatures.split('\n').map(f => f.trim()).filter(Boolean);
    const finalImage = prodImageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

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
        images: [finalImage],
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
        images: [finalImage],
        features: featuresList,
        rating: 5.0,
        reviewsCount: 1,
        isFeatured: true
      });
    }

    setIsAddModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(tempSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
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
  };

  // Export orders to CSV
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

  // Export Marketplace CSV
  const exportMarketplaceCSV = (platform: 'amazon' | 'noon' | 'jumia') => {
    let headers = '';
    let rows = '';

    if (platform === 'amazon') {
      headers = 'item_sku,item_name,external_product_id,standard_price,quantity,category,description\n';
      rows = products.map(p => 
        `"${p.id}","${p.name}","EAN-${p.id}","${p.price}","${p.stockCount}","${p.category}","${p.description.replace(/"/g, '""')}"`
      ).join('\n');
    } else if (platform === 'noon') {
      headers = 'partner_sku,product_title,price_egp,available_quantity,category_code,warranty\n';
      rows = products.map(p => 
        `"${p.id}","${p.name}","${p.price}","${p.stockCount}","${p.category}","1 Year"`
      ).join('\n');
    } else {
      headers = 'SellerSKU,Name,Price,Stock,Category,Description\n';
      rows = products.map(p => 
        `"${p.id}","${p.name}","${p.price}","${p.stockCount}","${p.category}","${p.description.replace(/"/g, '""')}"`
      ).join('\n');
    }

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mortafaat-${platform}-catalog.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch = !orderSearch.trim() || 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-16">
      
      {/* Top Admin Sub-Header */}
      <div className="bg-brand-charcoal text-white px-4 py-3 border-b border-brand-border shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-300">
              متصل بالمتجر كمسؤول إداري | الدفع الحالي: <span className="text-brand-gold">الدفع عند الاستلام (مع المعاينة)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>رقم التواصل المعتمد:</span>
            <strong className="text-white font-mono">{settings.phone}</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">إجمالي المبيعات</span>
              <p className="text-lg sm:text-2xl font-black text-brand-black mt-1">
                {totalSales.toLocaleString()} <span className="text-xs text-gray-500">ج.م</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-brand-goldDark flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">طلبات جديدة معلقة</span>
              <p className="text-lg sm:text-2xl font-black text-amber-600 mt-1">
                {pendingOrders} <span className="text-xs text-gray-500">جديد</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">رسائل شات الزوار</span>
              <p className="text-lg sm:text-2xl font-black text-blue-600 mt-1">
                {chatMessages.length} <span className="text-xs text-gray-500">رسالة</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">المنتجات المعروضة</span>
              <p className="text-lg sm:text-2xl font-black text-brand-black mt-1">
                {products.length} <span className="text-xs text-gray-500">منتج</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-200 bg-white rounded-2xl px-2 shadow-xs overflow-x-auto scrollbar-none">
          
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'products' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4 text-brand-goldDark" />
            <span>إدارة المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-brand-goldDark" />
            <span>الطلبات الواردة ({orders.length})</span>
            {pendingOrders > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('live-chat')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'live-chat' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-brand-goldDark" />
            <span>محادثات الزوار الحية</span>
            <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bot-training')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bot-training' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bot className="w-4 h-4 text-brand-goldDark" />
            <span>تعليم وبرمجة البوت ({botRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'gateway' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-brand-goldDark" />
            <span>بوابة الدفع واللوجو (كاشير / فوري)</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'coupons' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4 text-brand-goldDark" />
            <span>كوبونات الخصم ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'policies' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 text-brand-goldDark" />
            <span>سياسات تفعيل الدفع</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplaces')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'marketplaces' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-goldDark" />
            <span>تصدير أمازون ونون</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings' ? 'border-brand-gold text-brand-black bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-brand-goldDark" />
            <span>إعدادات المتجر و PIN</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* TAB 1: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-black text-gray-900">قائمة منتجات المتجر</h3>
                <p className="text-xs text-gray-500">أضف، عدل، أو احذف أي منتج في أي قسم</p>
              </div>

              <button
                onClick={openAddProduct}
                className="px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 shadow-md shadow-brand-gold/30 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد الآن</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-600 border-y border-gray-200">
                  <tr>
                    <th className="py-3 px-3">المنتج</th>
                    <th className="py-3 px-3">القسم</th>
                    <th className="py-3 px-3">السعر</th>
                    <th className="py-3 px-3">المخزون</th>
                    <th className="py-3 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0 border" />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{p.name}</p>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {p.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-[11px] font-semibold text-gray-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-black">
                        {p.price} ج.م
                        {p.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through block">
                            {p.originalPrice} ج.م
                          </span>
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
                            title="تعديل المنتج"
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
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-gray-900">سجل الطلبات الواردة</h3>
                <p className="text-xs text-gray-500">إدارة وشحن طلبات العملاء</p>
              </div>

              <button
                onClick={exportOrdersCSV}
                className="px-4 py-2 rounded-xl bg-brand-black text-white hover:bg-brand-gold hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>تصدير الطلبات إلى إكسيل (CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <input
                  type="text"
                  placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full px-3 py-2 pr-9 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              </div>

              <div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none bg-white font-semibold"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="processing">جاري التجهيز</option>
                  <option value="shipped">تم الشحن مع المندوب</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-center py-12 text-gray-500 text-xs">لا توجد طلبات تطابق بحثك حالياً.</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-3 hover:border-brand-gold transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-brand-black">#{ord.id}</span>
                        <span className="text-xs text-gray-400">({ord.createdAt})</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          {ord.paymentMethod === 'cod' ? '💵 دفع عند الاستلام' : '💳 دفع إلكتروني'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">حالة الشحن:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order['status'])}
                          className={`text-xs font-bold px-3 py-1 rounded-xl border focus:outline-none ${
                            ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            ord.status === 'shipped' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                            ord.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="pending">قيد المراجعة</option>
                          <option value="processing">جاري التجهيز</option>
                          <option value="shipped">تم الشحن مع المندوب</option>
                          <option value="delivered">تم التسليم بنجاح</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">العميل:</span>
                        <p className="font-bold text-gray-900">{ord.customerName}</p>
                        <a href={`tel:${ord.phone}`} className="text-brand-goldDark font-mono font-bold hover:underline">
                          {ord.phone}
                        </a>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px]">عنوان التوصيل:</span>
                        <p className="font-semibold text-gray-800">{ord.governorate} - {ord.address}</p>
                        {ord.notes && <p className="text-gray-500 italic mt-0.5">ملاحظة: {ord.notes}</p>}
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px]">المبلغ الإجمالي:</span>
                        <p className="font-black text-sm text-brand-goldDark">{ord.total.toLocaleString()} ج.م</p>
                        {ord.couponCode && (
                          <span className="text-[10px] text-emerald-700 block">
                            كوبون: {ord.couponCode} (خصم {ord.discountAmount} ج.م)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-700 block mb-1">المنتجات:</span>
                      <div className="space-y-1">
                        {ord.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-600">
                            <span>- {item.product.name} (عدد: {item.quantity})</span>
                            <span className="font-semibold">{item.product.price * item.quantity} ج.م</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE CUSTOMER CHAT DESK */}
        {activeTab === 'live-chat' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>غرفة محادثات وخدمة عملاء المتجر المباشرة</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  تظهر هنا جميع رسائل العملاء لحظياً في المتجر، ويمكنك الرد عليهم مباشرة من هنا!
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                قناة متصلة حية
              </span>
            </div>

            {/* Messages Stream */}
            <div className="h-[360px] overflow-y-auto bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`p-3 rounded-2xl max-w-lg text-xs ${
                    msg.sender === 'user' 
                      ? 'bg-brand-black text-white ml-auto' 
                      : msg.sender === 'support'
                      ? 'bg-emerald-600 text-white mr-auto'
                      : 'bg-white border border-gray-200 text-gray-800 mr-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                    <span className="font-bold">
                      {msg.sender === 'user' ? 'العميل الزائر' : msg.sender === 'support' ? 'أنت (إدارة المتجر)' : 'البوت التلقائي'}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Admin Direct Reply Box */}
            <form onSubmit={handleSendAdminReply} className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب ردك للعميل كـ (إدارة مرتفعات ستور)..."
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-brand-gold focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرد</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: BOT TRAINING & KNOWLEDGE */}
        {activeTab === 'bot-training' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7">
              <div className="border-b border-gray-100 pb-4 mb-5">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-brand-goldDark" />
                  <span>مركز تعليم وبرمجة المساعد الذكي (Smart Bot Training)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  علم البوت ما يجب أن يرد به عند ذكر كلمات مفتاحية معينة (مثل: عروض المنتجات، الهدايا، الشحن المجاني، أو أسعار محددة).
                </p>
              </div>

              {/* Add New Rule Form */}
              <form onSubmit={handleAddBotRule} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-3 mb-6">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-goldDark" />
                  <span>إضافة قاعدة رد وتوجيه جديدة للبوت:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">عنوان القاعدة (للتنظيم):</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: عرض اشتري 2 واحصل على هدية"
                      value={newRuleTitle}
                      onChange={(e) => setNewRuleTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">الكلمات المفتاحية (افصل بينها بفاصلة):</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: قطعتين, هدية, عرض, اثنين"
                      value={newRuleKeywords}
                      onChange={(e) => setNewRuleKeywords(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">الرد الذي سيقوله البوت للعميل عند مطابقة الكلمات:</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="اكتب رد البوت بالتفصيل هنا..."
                    value={newRuleReply}
                    onChange={(e) => setNewRuleReply(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs shadow-md hover:brightness-105"
                >
                  + حفظ وتعليم البوت هذه القاعدة
                </button>
              </form>

              {/* Rules List */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900">القواعد والتعليمات النشطة للبوت:</h4>
                {botRules.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{r.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                          {r.isActive ? 'مفعل' : 'معطل'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] text-gray-500 font-bold">الكلمات:</span>
                        {r.keywords.map((kw, i) => (
                          <span key={i} className="bg-white border border-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded">
                            {kw}
                          </span>
                        ))}
                      </div>

                      <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 text-[11px] leading-relaxed">
                        💬 <strong>الرد:</strong> {r.replyText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleBotRule(r.id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold bg-gray-200 hover:bg-gray-300 text-gray-700"
                      >
                        {r.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => deleteBotRule(r.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
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

        {/* TAB 5: DYNAMIC PAYMENT GATEWAY (KASHIER / FAWRY / PAYMOB) */}
        {activeTab === 'gateway' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-goldDark" />
                <span>إعدادات بوابة الدفع الإلكتروني المعتمدة (كاشير / فوري)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                تُترك هذه الخانة معطلة أو فارغة الآن كما طلبت لحين تواصلك مع شركة الدفع ومعاينة موقعك، ثم تفعّلها وتلصق شعارهم بضغطة زر واحدة.
              </p>
            </div>

            {/* Educational Help Notice for Kashier/Fawry Approval */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span>معلومة هامة جداً عن شروط موافقة فوري وكاشير على متجرك:</span>
              </p>
              <p className="leading-relaxed text-[11px]">
                شركات الدفع الإلكتروني (كاشير، فوري، باي موب) تدعم المواقع المبرمجة بالكامل (Custom Code / API) مثل متجرك هذا تماماً!
                طلبهم الوحيد لتفعيل الحساب هو: أن يكون الموقع <strong>يعمل ومتاحاً على النت وفيه منتجات حقيقية، مع وجود سياسة استرجاع وشحن واضحة</strong>.
                متجرك الآن يستوفي كافة هذه الشروط بنسبة 100%!
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-sm text-gray-900 block">تفعيل بوابة الدفع الإلكتروني في صفحة الشراء:</span>
                  <span className="text-[11px] text-gray-500">إذا كانت معطلة، سيظهر للعملاء فقط (الدفع عند الاستلام مع المعاينة).</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSettings.isOnlinePaymentEnabled}
                    onChange={(e) => setTempSettings({ ...tempSettings, isOnlinePaymentEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">اسم بوابة الدفع التي اخترتها (مثال: كاشير أو فوري):</label>
                  <input
                    type="text"
                    placeholder="مثال: كاشير (Kashier) / فوري باي (FawryPay)"
                    value={tempSettings.onlineGatewayName}
                    onChange={(e) => setTempSettings({ ...tempSettings, onlineGatewayName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">لوجو الشركة (سيظهر للعملاء في صفحة الدفع):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="رابط لوجو الشركة..."
                      value={tempSettings.onlineGatewayLogoUrl}
                      onChange={(e) => setTempSettings({ ...tempSettings, onlineGatewayLogoUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-[11px]"
                    />
                    <label className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer flex items-center gap-1 border border-gray-300 flex-shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع اللوجو</span>
                      <input type="file" accept="image/*" onChange={handleGatewayLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Merchant ID (معرف التاجر):</label>
                  <input
                    type="text"
                    placeholder="يتم استلامه من فوري أو كاشير بعد الموافقة"
                    value={tempSettings.onlineGatewayMerchantId}
                    onChange={(e) => setTempSettings({ ...tempSettings, onlineGatewayMerchantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">API Key / Secret Key:</label>
                  <input
                    type="password"
                    placeholder="المفتاح السري المشفر"
                    value={tempSettings.onlineGatewayApiKey}
                    onChange={(e) => setTempSettings({ ...tempSettings, onlineGatewayApiKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs shadow-md hover:brightness-105 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ إعدادات بوابة الدفع</span>
                </button>
                {settingsSaved && (
                  <span className="text-emerald-600 font-bold text-xs mt-2 block animate-fade-in">
                    ✓ تم حفظ إعدادات البوابة بنجاح!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-base font-black text-gray-900">إنشاء كود خصم جديد</h3>
              <p className="text-xs text-gray-500">أضف كوبونات لتحفيز المبيعات</p>

              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">رمز الكوبون *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: SALE20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono uppercase focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">نوع الخصم</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (ج.م)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">القيمة *</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">حد أدنى للطلب (ج.م):</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs shadow-md"
                >
                  إضافة الكوبون الآن
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-base font-black text-gray-900">الكوبونات النشطة في المتجر</h3>
              <div className="space-y-2.5">
                {coupons.map((c) => (
                  <div key={c.code} className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-brand-goldDark flex items-center justify-center font-bold">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono font-black text-sm text-brand-black">{c.code}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>الخصم: {c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} ج.م`}</span>
                          {c.minOrderValue && <span>• حد أدنى: {c.minOrderValue} ج.م</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCoupon(c.code)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {c.isActive ? 'مفعل' : 'معطل'}
                      </button>
                      <button onClick={() => deleteCoupon(c.code)} className="p-1.5 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: STORE POLICIES (REQUIRED FOR APPROVAL) */}
        {activeTab === 'policies' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7 max-w-3xl space-y-5">
            <div>
              <h3 className="text-base font-black text-gray-900">
                سياسات المتجر (الشرط الأساسي لاعتماد بوابات الدفع)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                عند تقديمك لشركة كاشير أو فوري، يدخل فريق المراجعة للتأكد من وجود هذه السياسات. يمكنك تعديلها في أي وقت.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">سياسة الاستبدال والاسترجاع:</label>
                <textarea
                  rows={3}
                  value={tempSettings.returnPolicyText}
                  onChange={(e) => setTempSettings({ ...tempSettings, returnPolicyText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">سياسة الشحن والتوصيل لكافة المحافظات:</label>
                <textarea
                  rows={3}
                  value={tempSettings.shippingPolicyText}
                  onChange={(e) => setTempSettings({ ...tempSettings, shippingPolicyText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">سياسة الخصوصية وشروط الاستخدام:</label>
                <textarea
                  rows={3}
                  value={tempSettings.privacyPolicyText}
                  onChange={(e) => setTempSettings({ ...tempSettings, privacyPolicyText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs shadow-md"
              >
                تحديث وحفظ السياسات
              </button>
            </form>
          </div>
        )}

        {/* TAB 8: MARKETPLACES */}
        {activeTab === 'marketplaces' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-gray-900">
                تصدير شيتات أمازون ونون وجوميا
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                حمل شيت الإكسيل المتوافق وارفعه في حساب البائع بضغطة زر واحدة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">أمازون مصر (Amazon.eg)</h4>
                  <p className="text-xs text-gray-600 mt-1">ملف Flat File للرفع الجماعي في Seller Central.</p>
                </div>
                <button
                  onClick={() => exportMarketplaceCSV('amazon')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير شيت أمازون (.CSV)</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border-2 border-yellow-300 bg-yellow-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">نون مصر (Noon Partner)</h4>
                  <p className="text-xs text-gray-600 mt-1">قالب الرفع الجماعي المعتمد لشركاء نون.</p>
                </div>
                <button
                  onClick={() => exportMarketplaceCSV('noon')}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير شيت نون (.CSV)</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border-2 border-orange-300 bg-orange-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">جوميا مصر (Jumia Vendor)</h4>
                  <p className="text-xs text-gray-600 mt-1">قالب إنشاء الأصناف لبوابة بائعي جوميا.</p>
                </div>
                <button
                  onClick={() => exportMarketplaceCSV('jumia')}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير شيت جوميا (.CSV)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: GENERAL SETTINGS & PIN */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-2xl space-y-5">
            <div>
              <h3 className="text-base font-black text-gray-900">إعدادات الإدارة ورمز الدخول (PIN)</h3>
              <p className="text-xs text-gray-500">عدل رمز المرور الخاص بلوحة الإدارة لضمان الخصوصية التامة</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                <label className="font-bold text-gray-900 block mb-1">
                  رمز المرور السري للدخول للإدارة (Admin PIN):
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={tempSettings.adminPin}
                  onChange={(e) => setTempSettings({ ...tempSettings, adminPin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-center text-base tracking-widest font-black focus:border-brand-gold bg-white"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  الرمز الحالي للدخول: {tempSettings.adminPin || '1234'}
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">اسم المتجر بالعربي:</label>
                <input
                  type="text"
                  value={tempSettings.storeNameAr}
                  onChange={(e) => setTempSettings({ ...tempSettings, storeNameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">رقم هاتف المتجر الأساسي والواتساب:</label>
                <input
                  type="text"
                  value={tempSettings.phone}
                  onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value, whatsapp: `2${e.target.value}` })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">تكلفة الشحن الافتراضية (ج.م):</label>
                  <input
                    type="number"
                    value={tempSettings.shippingFee}
                    onChange={(e) => setTempSettings({ ...tempSettings, shippingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">حد الشحن المجاني (ج.م):</label>
                  <input
                    type="number"
                    value={tempSettings.freeShippingThreshold}
                    onChange={(e) => setTempSettings({ ...tempSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">شريط الإعلانات أعلى المتجر:</label>
                <input
                  type="text"
                  value={tempSettings.announcementText}
                  onChange={(e) => setTempSettings({ ...tempSettings, announcementText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs shadow-md"
              >
                حفظ التعديلات
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ADD/EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-brand-gold/40 my-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h3 className="font-black text-sm sm:text-base text-gray-900">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد لمرتفعات ستور'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">اسم المنتج بالعربي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ساعة ذكية ألترا مقاومة للماء"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">اسم المنتج بالإنجليزي (اختياري)</label>
                <input
                  type="text"
                  placeholder="Example: Ultra Smartwatch"
                  value={prodNameEn}
                  onChange={(e) => setProdNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">القسم *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as Product['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="electronics">إلكترونيات</option>
                    <option value="fashion">ملابس وأزياء</option>
                    <option value="perfumes">عطور فاخرة</option>
                    <option value="home">أدوات منزلية</option>
                    <option value="personal-care">عناية شخصية</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">الكمية المتوفرة (المخزون) *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">سعر البيع الحالي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">السعر الأصلي قبل الخصم (ج.م):</label>
                  <input
                    type="number"
                    placeholder="اختياري لإظهار الخصم"
                    value={prodOriginalPrice || ''}
                    onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">صورة المنتج:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ضع رابط صورة من الإنترنت..."
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-[11px]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer flex items-center gap-1 border border-gray-300">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة</span>
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                  </label>
                </div>
                {prodImageUrl && (
                  <div className="mt-2 w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                    <img src={prodImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">وصف المنتج:</label>
                <textarea
                  rows={2}
                  placeholder="اكتب مواصفات المنتج وتفاصيله..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">المميزات (اكتب كل ميزة في سطر منفصل):</label>
                <textarea
                  rows={2}
                  placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                  value={prodFeatures}
                  onChange={(e) => setProdFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gold-gradient text-brand-black font-extrabold text-xs hover:brightness-105 shadow-md"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'نشر المنتج الآن في المتجر'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-xs"
                >
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
