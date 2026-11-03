import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, PaymentMethod } from '../types';
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
  ExternalLink,
  Smartphone,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    settings, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateOrderStatus, 
    updateSettings,
    setCurrentView
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'marketplaces' | 'settings'>('products');

  // New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Product Add/Edit
  const [prodName, setProdName] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodCategory, setProdCategory] = useState<Product['category']>('electronics');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | undefined>(undefined);
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodFeatures, setProdFeatures] = useState('');

  // Settings State Form
  const [tempSettings, setTempSettings] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Statistics
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

  // Export functions for Amazon, Noon, Jumia
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

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-16">
      
      {/* Top Admin Bar */}
      <div className="bg-brand-black text-white px-4 py-4 border-b border-brand-gold/40 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl border border-brand-gold bg-black p-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">لوحة تحكم مرتفعات ستور</h1>
                <span className="text-[10px] font-bold bg-brand-gold text-brand-black px-2 py-0.5 rounded-full">
                  تطبيق الإدارة
                </span>
              </div>
              <p className="text-xs text-gray-400">إدارة المنتجات، الطلبات، والتوافق مع الأسواق</p>
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
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-brand-goldDark flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">إجمالي الطلبات</span>
              <p className="text-lg sm:text-2xl font-black text-brand-black mt-1">
                {orders.length} <span className="text-xs text-gray-500">طلب</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold">طلبات قيد المراجعة</span>
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
        <div className="flex border-b border-gray-200 bg-white rounded-2xl px-2 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-brand-gold text-brand-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4 text-brand-goldDark" />
            <span>إدارة المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-brand-gold text-brand-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
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
            onClick={() => setActiveTab('marketplaces')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'marketplaces'
                ? 'border-brand-gold text-brand-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-goldDark" />
            <span>الربط مع أمازون، نون، جوميا</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-brand-gold text-brand-black'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-brand-goldDark" />
            <span>إعدادات المتجر والدفع</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* TAB 1: PRODUCTS */}
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

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-gray-900">إدارة الطلبات الواردة</h3>
              <p className="text-xs text-gray-500">تابع بيانات العملاء وحدث حالات الشحن والتسليم</p>
            </div>

            {orders.length === 0 ? (
              <p className="text-center py-10 text-gray-500 text-xs">لا توجد طلبات حتى الآن.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-brand-black">#{ord.id}</span>
                        <span className="text-xs text-gray-400">({ord.createdAt})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">حالة الطلب:</span>
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
                        <span className="text-gray-400 block text-[10px]">العميل والهاتف:</span>
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
                        <span className="text-gray-400 block text-[10px]">الدفع والإجمالي:</span>
                        <p className="font-black text-sm text-brand-goldDark">{ord.total.toLocaleString()} ج.م</p>
                        <span className="text-[10px] text-gray-500 block">
                          طريقة الدفع: {
                            ord.paymentMethod === 'cod' ? 'دفع عند الاستلام' :
                            ord.paymentMethod === 'vodafone-cash' ? 'فودافون كاش' : 'إنستاباي'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Items inside order */}
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

        {/* TAB 3: MARKETPLACES (AMAZON, NOON, JUMIA) */}
        {activeTab === 'marketplaces' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-gray-900">
                التصدير والربط مع أمازون، نون، وجوميا
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                لا داعي لإعادة إدخال منتجاتك يدوياً في كل منصة! قم بتحميل ملف الـ Excel / CSV المخصص لكل موقع وارفعه في حساب التاجر الخاص بك بنقرة زر.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Amazon Box */}
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md mb-3">
                    A
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">أمازون مصر (Amazon.eg)</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    ملف شيت جاهز متوافق مع نظام الرفع الجماعي (Flat File / Inventory Loader) في لوحة Amazon Seller Central.
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

              {/* Noon Box */}
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

              {/* Jumia Box */}
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

            {/* Instruction Steps */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
              <span className="font-bold text-gray-900 block">خطوات ربط الشيت مع حساباتك:</span>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 leading-relaxed">
                <li>اضغط على زر التصدير للمنصة المطلوبة لتحميل ملف الإكسيل/CSV إلى جهازك.</li>
                <li>ادخل على حساب البائع الخاص بك في أمازون أو نون أو جوميا.</li>
                <li>توجه إلى قسم "إضافة منتجات جماعية" (Add Products via Upload / Bulk Upload).</li>
                <li>اختر الملف الذي قمت بتحميله الآن واضغط "رفع / Submit". ستظهر منتجاتك تلقائياً هناك!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 max-w-2xl">
            <h3 className="text-base font-black text-gray-900 mb-1">إعدادات المتجر وبيانات الدفع</h3>
            <p className="text-xs text-gray-500 mb-5">عدل أرقام المحافظ والواتساب وتكلفة الشحن في أي وقت</p>

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
                <label className="font-bold text-gray-700 block mb-1">رقم الواتساب للطلبات والشات (بالكود الدولي مثل 2010...):</label>
                <input
                  type="text"
                  value={tempSettings.whatsapp}
                  onChange={(e) => setTempSettings({ ...tempSettings, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">رقم محفظة فودافون كاش / المحافظ الإلكترونية للتحويل:</label>
                <input
                  type="text"
                  value={tempSettings.vodafoneCashNumber}
                  onChange={(e) => setTempSettings({ ...tempSettings, vodafoneCashNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">معرف إنستاباي (InstaPay Handle):</label>
                <input
                  type="text"
                  value={tempSettings.instaPayUsername}
                  onChange={(e) => setTempSettings({ ...tempSettings, instaPayUsername: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-gold focus:outline-none"
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
