import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, Order, StoreSettings, ChatMessage, PaymentMethod, Coupon } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_COUPONS } from '../data/initialData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  chatMessages: ChatMessage[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: 'store' | 'admin';
  setCurrentView: (view: 'store' | 'admin') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  toggleCoupon: (code: string) => void;
  createOrder: (orderInfo: {
    customerName: string;
    phone: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    transactionId?: string;
  }) => Order;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  updateSettings: (newSettings: StoreSettings) => void;
  sendChatMessage: (text: string) => void;
  cartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  cartFinalTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mortafaat_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Categories
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mortafaat_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mortafaat_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-9821',
        customerName: 'أحمد محمود',
        phone: '01067906474',
        governorate: 'القاهرة',
        address: 'مدينة نصر - الحي السابع',
        items: [
          { product: INITIAL_PRODUCTS[0], quantity: 1 }
        ],
        subtotal: 890,
        shippingFee: 50,
        total: 940,
        paymentMethod: 'paymob-card',
        paymentStatus: 'paid',
        transactionId: 'PM-9218402',
        status: 'processing',
        createdAt: '2026-11-03 08:30'
      }
    ];
  });

  // Store Settings (Merge with latest initial settings to ensure 01067906474 and Paymob are default)
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('mortafaat_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_SETTINGS, ...parsed, phone: '01067906474', whatsapp: '201067906474', vodafoneCashNumber: '01067906474', instaPayUsername: '01067906474' };
    }
    return INITIAL_SETTINGS;
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('mortafaat_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: 'مرحباً بك في مرتفعات ستور (Mortafaat Store)! متواجدون لمساعدتك عبر الدعم أو واتساب على 01067906474.',
      time: 'الآن'
    }
  ]);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('mortafaat_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mortafaat_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mortafaat_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mortafaat_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mortafaat_coupons', JSON.stringify(coupons));
  }, [coupons]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const next = [...prev];
      next[index].quantity = quantity;
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Coupon calculations
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, cartSubtotal);
    }
  }

  const shipping = cartSubtotal >= settings.freeShippingThreshold || cartSubtotal === 0 ? 0 : settings.shippingFee;
  const cartFinalTotal = Math.max(0, cartSubtotal - discountAmount) + shipping;

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find(c => c.code === trimmed && c.isActive);
    if (!found) {
      return { success: false, message: 'كوبون الخصم غير صحيح أو منتهي الصلاحية' };
    }
    if (found.minOrderValue && cartSubtotal < found.minOrderValue) {
      return { success: false, message: `هذا الكوبون يتطلب مشتريات بحد أدنى ${found.minOrderValue} ج.م` };
    }
    setAppliedCoupon(found);
    return { success: true, message: `تم تفعيل خصم ${found.discountType === 'percentage' ? found.discountValue + '%' : found.discountValue + ' ج.م'} بنجاح!` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev.filter(c => c.code !== newCoupon.code)]);
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    if (appliedCoupon?.code === code) setAppliedCoupon(null);
  };

  const toggleCoupon = (code: string) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, isActive: !c.isActive } : c));
  };

  // Orders
  const createOrder = (orderInfo: {
    customerName: string;
    phone: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    transactionId?: string;
  }): Order => {
    const shippingFee = cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    
    // Determine payment status
    let paymentStatus: Order['paymentStatus'] = 'unpaid';
    if (orderInfo.paymentMethod === 'paymob-card') {
      paymentStatus = 'paid';
    } else if (orderInfo.paymentMethod === 'vodafone-cash' || orderInfo.paymentMethod === 'instapay' || orderInfo.paymentMethod === 'bank-transfer') {
      paymentStatus = 'pending_verification';
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderInfo.customerName,
      phone: orderInfo.phone,
      governorate: orderInfo.governorate,
      address: orderInfo.address,
      notes: orderInfo.notes,
      items: [...cart],
      subtotal: cartSubtotal,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      shippingFee,
      total: cartFinalTotal,
      paymentMethod: orderInfo.paymentMethod,
      paymentStatus,
      transactionId: orderInfo.transactionId || (orderInfo.paymentMethod === 'paymob-card' ? `PM-${Date.now().toString().slice(-7)}` : undefined),
      status: 'pending',
      createdAt: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Admin operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, paymentStatus } : o)));
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  };

  // Chat
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);

    // Automated smart reply
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: 'support',
        text: 'شكراً لتواصلك مع مرتفعات ستور! ممثل خدمة العملاء متواجد لمساعدتك، أو تواصل فوراً على واتساب: 01067906474.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, replyMsg]);
    }, 1000);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        settings,
        coupons,
        appliedCoupon,
        chatMessages,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isChatOpen,
        setIsChatOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        addCoupon,
        deleteCoupon,
        toggleCoupon,
        createOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updatePaymentStatus,
        updateSettings,
        sendChatMessage,
        cartCount,
        cartSubtotal,
        discountAmount,
        cartFinalTotal
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
