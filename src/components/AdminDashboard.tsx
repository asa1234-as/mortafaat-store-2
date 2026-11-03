import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Coupon, StoreSettings } from '../types';
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
  Truck,
  XCircle,
  FileSpreadsheet,
  CreditCard,
  Building2,
  Tag,
  Lock,
  BarChart3,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    settings, 
    coupons,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus, 
    updatePaymentStatus,
    updateSettings,
    addCoupon,
    deleteCoupon,
    toggleCoupon,
    setCurrentView
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'paymob' | 'coupons' | 'analytics' | 'marketplaces' | 'settings'>('paymob');

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

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMin, setNewCouponMin] = useState<number>(300);

  // KPI Calculations
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const paidSales = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const paymobOrdersCount = orders.filter(o => o.paymentMethod === 'paymob-card').length;

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
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter || o.paymentMethod === orderStatusFilter;
    const matchesSearch = !orderSearch.trim() || 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-16">
      
      {/* Top Admin Header Bar */}
      <div className="bg-brand-black text-white px-4 py-4 border-b border-brand-gold/40 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl border border-brand-gold bg-black p-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">لوحة تحكم مرتفعات ستور الشاملة</h1>
                <span className="text-[10px] font-bold bg-brand-gold text-brand-black px-2 py-0.5 rounded-full">
                  Admin Control Suite
                </span>
              </div>
              <p className="text-xs text-gray-400">إدارة المدفوعات وباي موب، الحساب البنكي، والطلبات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('store')}
              className="px-4 py-2 rounded-xl bg-brand-charcoal hover:bg-brand-darkGray text-xs font-bold text-gray-200 border border-brand-border flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-brand-gold" />
              <span>مشاهدة المتجر كعميل</span>
            </button>
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
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                {paidSales.toLocaleString()} ج.م مدفوعة إلكترونياً
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-brand-goldDark flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">مدفوعات Paymob بالفيزا</span>
              <p className="text-lg sm:text-2xl font-black text-blue-600 mt-1">
                {paymobOrdersCount} <span className="text-xs text-gray-500">عملية</span>
              </p>
              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                ربط مشفر ومباشر للبنك
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">طلبات جديدة معلقة</span>
              <p className="text-lg sm:text-2xl font-black text-amber-600 mt-1">
                {pendingOrders} <span className="text-xs text-gray-500">طلب</span>
              </p>
              <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                تحتاج مراجعة وشحن
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">المنتجات المعروضة</span>
              <p className="text-lg sm:text-2xl font-black text-brand-black mt-1">
                {products.length} <span className="text-xs text-gray-500">منتج</span>
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                موزعة على 5 أقسام
              </span>
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
            onClick={() => setActiveTab('paymob')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'paymob'
                ? 'border-brand-gold text-brand-black bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-brand-goldDark" />
            <span>باي موب والمدفوعات البنكية</span>
            <span className="bg-brand-black text-brand-gold text-[9px] px-1.5 py-0.5 rounded font-bold">
              Paymob
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-brand-gold text-brand-black bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-brand-goldDark" />
            <span>إدارة الطلبات ({orders.length})</span>
            {pendingOrders > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-brand-gold text-brand-black bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4 text-brand-goldDark" />
            <span>إدارة المنتجات والمخزون ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-brand-gold text-brand-black bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4 text-brand-goldDark" />
            <span>كوبونات الخصم ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplaces')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'marketplaces'
                ? 'border-brand-gold text-brand-black bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-goldDark" />
            <span>تصدير أمازون ونون وجوميا</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-brand-gold text-brand-black bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-brand-goldDark" />
            <span>إعدادات المتجر والتواصل</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* TAB 1: PAYMOB & BANK GATEWAY CONTROL */}
        {activeTab === 'paymob' && (
          <div className="space-y-6">
            
            {/* Paymob Credentials Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-black text-brand-gold flex items-center justify-center font-black shadow-md">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      <span>إعدادات بوابة الدفع Paymob (الفيزا والكروت والمحافظ)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        مباشر ومحمي
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      أدخل بيانات حسابك في Paymob هنا لتوجيه أموال المبيعات مباشرة لحسابك البنكي
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                    <input
                      type="checkbox"
                      checked={tempSettings.isPaymobCardEnabled}
                      onChange={(e) => setTempSettings({ ...tempSettings, isPaymobCardEnabled: e.target.checked })}
                      className="rounded text-brand-gold focus:ring-brand-gold"
                    />
                    <span>تفعيل الدفع بالفيزا عبر Paymob</span>
                  </label>
                </div>
              </div>

              {/* Explanatory Help Box */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1.5 mb-6">
                <p className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-700" />
                  <span>كيف تحصل على هذه البيانات من حسابك في Paymob (accept.paymob.com)؟</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-[11px] leading-relaxed">
                  <li><strong>API Key:</strong> ادخل على لوحة تحكم Paymob ➔ ثم الإعدادات (Settings) ➔ ثم Account Info وانسخ الـ API Key.</li>
                  <li><strong>Integration ID:</strong> توجه إلى Developers ➔ Integrations وانسخ الـ ID الخاص بـ (Online Card) للفيزا و (Mobile Wallets) للمحافظ.</li>
                  <li><strong>Iframe ID:</strong> من Developers ➔ Iframes أنشئ أو انسخ رقم الـ Iframe المخصص لصفحة الدفع.</li>
                  <li><strong>HMAC Secret:</strong> تجده في صفحة Settings في لوحة تحكم Paymob للتحقق من سلامة العمليات وتشفيرها.</li>
                </ol>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      Paymob API Key (مفتاح الـ API الأساسي):
                    </label>
                    <input
                      type="password"
                      placeholder="ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI..."
                      value={tempSettings.paymobApiKey}
                      onChange={(e) => setTempSettings({ ...tempSettings, paymobApiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      بيئة العمل (Environment):
                    </label>
                    <select
                      value={tempSettings.paymobEnvironment}
                      onChange={(e) => setTempSettings({ ...tempSettings, paymobEnvironment: e.target.value as 'live' | 'test' })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-xs focus:border-brand-gold focus:outline-none bg-white"
                    >
                      <option value="live">Live Mode (الوضع الحقيقي - استقبال أموال حقيقية في البنك)</option>
                      <option value="test">Test Mode (وضع التجربة والاختبار)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      معرف ربط الكروت (Card Integration ID):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 458921"
                      value={tempSettings.paymobCardIntegrationId}
                      onChange={(e) => setTempSettings({ ...tempSettings, paymobCardIntegrationId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      معرف ربط المحافظ (Wallet Integration ID):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 458922"
                      value={tempSettings.paymobWalletIntegrationId}
                      onChange={(e) => setTempSettings({ ...tempSettings, paymobWalletIntegrationId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      معرف نموذج الدفع (Iframe ID):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 842109"
                      value={tempSettings.paymobIframeId}
                      onChange={(e) => setTempSettings({ ...tempSettings, paymobIframeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    مفتاح التشفير والتحقق (HMAC Secret):
                  </label>
                  <input
                    type="password"
                    placeholder="مفتاح التشفير السري للتحقق من أمان المعاملة"
                    value={tempSettings.paymobHmacSecret}
                    onChange={(e) => setTempSettings({ ...tempSettings, paymobHmacSecret: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs hover:brightness-105 shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ وتفعيل إعدادات Paymob</span>
                  </button>

                  {settingsSaved && (
                    <span className="text-emerald-600 font-bold text-xs animate-fade-in">
                      ✓ تم الحفظ وتأمين بوابة الدفع بنجاح!
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Bank Account Details Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    بيانات الحساب البنكي الرسمي (لإيداعات المبيعات والتحويل البنكي)
                  </h3>
                  <p className="text-xs text-gray-500">
                    هذه البيانات تستقبل عليها أرباح Paymob ويمكن للعملاء التحويل المباشر إليها
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">اسم البنك:</label>
                    <input
                      type="text"
                      placeholder="مثال: البنك الأهلي المصري / بنك مصر / CIB"
                      value={tempSettings.bankName}
                      onChange={(e) => setTempSettings({ ...tempSettings, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">اسم صاحب الحساب بالكامل:</label>
                    <input
                      type="text"
                      placeholder="كما هو مدون في كشف الحساب البنكي"
                      value={tempSettings.bankAccountHolder}
                      onChange={(e) => setTempSettings({ ...tempSettings, bankAccountHolder: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">رقم الحساب البنكي:</label>
                    <input
                      type="text"
                      placeholder="رقم الحساب الداخلي"
                      value={tempSettings.bankAccountNumber}
                      onChange={(e) => setTempSettings({ ...tempSettings, bankAccountNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:border-brand-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">رقم الآيبان الدولي (IBAN):</label>
                    <input
                      type="text"
                      placeholder="EG..."
                      value={tempSettings.bankIban}
                      onChange={(e) => setTempSettings({ ...tempSettings, bankIban: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:border-brand-gold focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">كود السويفت (SWIFT Code):</label>
                    <input
                      type="text"
                      placeholder="مثال: NBEGEGCX"
                      value={tempSettings.bankSwiftCode}
                      onChange={(e) => setTempSettings({ ...tempSettings, bankSwiftCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:border-brand-gold focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>تحديث بيانات الحساب البنكي</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile Wallets & InstaPay Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-7">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black shadow-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    أرقام فودافون كاش وإنستاباي للتحويلات المباشرة
                  </h3>
                  <p className="text-xs text-gray-500">الرقم المعتمد المربوط بالمحافظ الإلكترونية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">رقم محفظة فودافون كاش / المحافظ:</label>
                  <input
                    type="text"
                    value={tempSettings.vodafoneCashNumber}
                    onChange={(e) => setTempSettings({ ...tempSettings, vodafoneCashNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-sm text-red-600 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">رقم / عنوان إنستاباي (InstaPay):</label>
                  <input
                    type="text"
                    value={tempSettings.instaPayUsername}
                    onChange={(e) => setTempSettings({ ...tempSettings, instaPayUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-sm text-purple-700 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-gray-900">سجل الطلبات والمبيعات</h3>
                <p className="text-xs text-gray-500">تابع وأدر جميع الطلبات الواردة وطرق دفعها</p>
              </div>

              <button
                onClick={exportOrdersCSV}
                className="px-4 py-2 rounded-xl bg-brand-black text-white hover:bg-brand-gold hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>تصدير الطلبات إلى إكسيل (CSV)</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
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
                  <option value="all">جميع الحالات وطرق الدفع</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="processing">جاري التجهيز</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="paymob-card">مدفوع عبر Paymob (فيزا)</option>
                  <option value="vodafone-cash">فودافون كاش</option>
                  <option value="cod">دفع عند الاستلام</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
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
                        {ord.transactionId && (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded font-bold">
                            Ref: {ord.transactionId}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Payment Status Dropdown */}
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-gray-500">حالة الدفع:</span>
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) => updatePaymentStatus(ord.id, e.target.value as Order['paymentStatus'])}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none ${
                              ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              ord.paymentStatus === 'pending_verification' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            <option value="paid">مدفوع بنجاح ✓</option>
                            <option value="pending_verification">قيد مراجعة التحويل</option>
                            <option value="unpaid">غير مدفوع (كاش)</option>
                          </select>
                        </div>

                        {/* Order Fulfillment Status Dropdown */}
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-gray-500">الشحن:</span>
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order['status'])}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none ${
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
                        <span className="text-gray-400 block text-[10px]">طريقة الدفع والمبلغ:</span>
                        <p className="font-black text-sm text-brand-goldDark">{ord.total.toLocaleString()} ج.م</p>
                        <span className="text-[10px] text-gray-600 font-bold block">
                          {ord.paymentMethod === 'paymob-card' ? '💳 بطاقة بنكية (Paymob)' :
                           ord.paymentMethod === 'vodafone-cash' ? '📱 فودافون كاش' :
                           ord.paymentMethod === 'instapay' ? '🏦 إنستاباي' : '💵 كاش عند الاستلام'}
                        </span>
                        {ord.couponCode && (
                          <span className="text-[10px] text-emerald-700 block">
                            كوبون: {ord.couponCode} (خصم: {ord.discountAmount} ج.م)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-700 block mb-1">المنتجات المطلوبة:</span>
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

        {/* TAB 3: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-black text-gray-900">قائمة منتجات المتجر</h3>
                <p className="text-xs text-gray-500">أضف، عدل، أو احذف منتجاتك بسهولة</p>
              </div>

              <button
                onClick={openAddProduct}
                className="px-4 py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-105 shadow-md shadow-brand-gold/30 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد الآن</span>
              </button>
            </div>

            {/* Products Table */}
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

        {/* TAB 4: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Create Coupon Form */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-base font-black text-gray-900">إنشاء كود خصم جديد</h3>
              <p className="text-xs text-gray-500">أضف كوبونات لتحفيز العملاء على الشراء وزيادة مبيعاتك</p>

              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">كود الكوبون (رمز الخصم) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: SUMMER20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono uppercase focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">نوع الخصم</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold bg-white"
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">قيمة الخصم *</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">الحد الأدنى لقيمة الطلب (ج.م):</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold"
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

            {/* Coupons List */}
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
                          <span>
                            الخصم: {c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} ج.م`}
                          </span>
                          {c.minOrderValue && (
                            <span>• حد أدنى: {c.minOrderValue} ج.م</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCoupon(c.code)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {c.isActive ? 'مفعل' : 'معطل'}
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

        {/* TAB 5: MARKETPLACES (AMAZON, NOON, JUMIA) */}
        {activeTab === 'marketplaces' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-gray-900">
                التصدير والربط مع أمازون، نون، وجوميا
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                قم بتحميل ملف الـ Excel / CSV المخصص لكل موقع وارفعه في حساب التاجر الخاص بك بنقرة زر.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Amazon */}
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md mb-3">
                    A
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">أمازون مصر (Amazon.eg)</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    ملف شيت جاهز متوافق مع نظام الرفع الجماعي (Flat File) في Amazon Seller Central.
                  </p>
                </div>
                <button
                  onClick={() => exportMarketplaceCSV('amazon')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير شيت أمازون (.CSV)</span>
                </button>
              </div>

              {/* Noon */}
              <div className="p-5 rounded-2xl border-2 border-yellow-300 bg-yellow-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black font-black flex items-center justify-center text-sm shadow-md mb-3">
                    N
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">نون مصر (Noon Partner)</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    ملف مهيأ لبوابة شركاء نون لرفع الأصناف وتحديث الأسعار والمخزون دفعة واحدة.
                  </p>
                </div>
                <button
                  onClick={() => exportMarketplaceCSV('noon')}
                  className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير شيت نون (.CSV)</span>
                </button>
              </div>

              {/* Jumia */}
              <div className="p-5 rounded-2xl border-2 border-orange-300 bg-orange-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-md mb-3">
                    J
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">جوميا مصر (Jumia Vendor)</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    قالب إنشاء المنتجات السريع متوافق مع لوحة تحكم بائعي جوميا (Vendor Hub).
                  </p>
                </div>
                <button
                  onClick={() => exportMarketplaceCSV('jumia')}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير شيت جوميا (.CSV)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GENERAL SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-2xl">
            <h3 className="text-base font-black text-gray-900 mb-1">إعدادات المتجر وبيانات التواصل</h3>
            <p className="text-xs text-gray-500 mb-5">عدل رقم الهاتف والواتساب وتكلفة الشحن</p>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">اسم المتجر بالعربي:</label>
                <input
                  type="text"
                  value={tempSettings.storeNameAr}
                  onChange={(e) => setTempSettings({ ...tempSettings, storeNameAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">رقم هاتف المتجر الأساسي:</label>
                <input
                  type="text"
                  value={tempSettings.phone}
                  onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">رقم الواتساب للطلبات (مثل 201067906474):</label>
                <input
                  type="text"
                  value={tempSettings.whatsapp}
                  onChange={(e) => setTempSettings({ ...tempSettings, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">تكلفة الشحن الافتراضية (ج.م):</label>
                  <input
                    type="number"
                    value={tempSettings.shippingFee}
                    onChange={(e) => setTempSettings({ ...tempSettings, shippingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">حد الشحن المجاني (ج.م):</label>
                  <input
                    type="number"
                    value={tempSettings.freeShippingThreshold}
                    onChange={(e) => setTempSettings({ ...tempSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">شريط الإعلانات أعلى المتجر:</label>
                <input
                  type="text"
                  value={tempSettings.announcementText}
                  onChange={(e) => setTempSettings({ ...tempSettings, announcementText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-brand-black font-extrabold text-xs hover:brightness-105 shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
                {settingsSaved && (
                  <span className="text-emerald-600 font-bold text-xs mt-2 block animate-fade-in">
                    ✓ تم حفظ إعدادات المتجر بنجاح!
                  </span>
                )}
              </div>
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">اسم المنتج بالإنجليزي (اختياري)</label>
                <input
                  type="text"
                  placeholder="Example: Ultra Smartwatch"
                  value={prodNameEn}
                  onChange={(e) => setProdNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">القسم *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as Product['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none bg-white"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">السعر الأصلي قبل الخصم (ج.م):</label>
                  <input
                    type="number"
                    placeholder="اختياري لإظهار الخصم"
                    value={prodOriginalPrice || ''}
                    onChange={(e) => setProdOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Input (URL or Upload from device) */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">صورة المنتج:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ضع رابط صورة من الإنترنت..."
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none text-[11px]"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">المميزات (اكتب كل ميزة في سطر منفصل):</label>
                <textarea
                  rows={2}
                  placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3"
                  value={prodFeatures}
                  onChange={(e) => setProdFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
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
