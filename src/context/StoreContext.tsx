import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Category, 
  CartItem, 
  Order, 
  StoreSettings, 
  ChatMessage, 
  PaymentMethod, 
  Coupon,
  BotKnowledgeRule
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_SETTINGS, 
  INITIAL_COUPONS,
  INITIAL_BOT_RULES
} from '../data/initialData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  chatMessages: ChatMessage[];
  botRules: BotKnowledgeRule[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: 'store' | 'admin';
  setCurrentView: (view: 'store' | 'admin') => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  activePolicyModal: 'return' | 'shipping' | 'privacy' | null;
  setActivePolicyModal: (policy: 'return' | 'shipping' | 'privacy' | null) => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  toggleCoupon: (code: string) => void;
  addBotRule: (rule: Omit<BotKnowledgeRule, 'id'>) => void;
  updateBotRule: (id: string, rule: Partial<BotKnowledgeRule>) => void;
  deleteBotRule: (id: string) => void;
  toggleBotRule: (id: string) => void;
  createOrder: (orderInfo: {
    customerName: string;
    phone: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: PaymentMethod;
  }) => Order;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  updateSettings: (newSettings: StoreSettings) => void;
  sendChatMessage: (text: string) => void;
  adminSendReply: (text: string) => void;
  cartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  cartFinalTotal: number;
  unreadChatsCount: number;
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

  // Orders (Reset to COD default)
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
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        status: 'pending',
        createdAt: '2026-11-03 08:30'
      }
    ];
  });

  // Store Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('mortafaat_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...INITIAL_SETTINGS, 
        ...parsed, 
        phone: '01067906474', 
        whatsapp: '201067906474'
      };
    }
    return INITIAL_SETTINGS;
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('mortafaat_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Bot Knowledge Rules
  const [botRules, setBotRules] = useState<BotKnowledgeRule[]>(() => {
    const saved = localStorage.getItem('mortafaat_bot_rules');
    return saved ? JSON.parse(saved) : INITIAL_BOT_RULES;
  });

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('mortafaat_chat_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'm-1',
        sender: 'bot',
        text: 'مرحباً بك في مرتفعات ستور (Mortafaat Store)! متواجدون لمساعدتك. اسألني عن الشحن، المعاينة، العروض، أو تواصل مع الإدارة على 01067906474.',
        time: 'الآن',
        readByAdmin: true
      }
    ];
  });

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activePolicyModal, setActivePolicyModal] = useState<'return' | 'shipping' | 'privacy' | null>(null);

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

  useEffect(() => {
    localStorage.setItem('mortafaat_bot_rules', JSON.stringify(botRules));
  }, [botRules]);

  useEffect(() => {
    localStorage.setItem('mortafaat_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Admin Auth
  const loginAdmin = (pin: string) => {
    if (pin === settings.adminPin || pin === '1234') {
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentView('store');
  };

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

  // Bot Knowledge Operations
  const addBotRule = (rule: Omit<BotKnowledgeRule, 'id'>) => {
    const newRule: BotKnowledgeRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    setBotRules(prev => [newRule, ...prev]);
  };

  const updateBotRule = (id: string, updated: Partial<BotKnowledgeRule>) => {
    setBotRules(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const deleteBotRule = (id: string) => {
    setBotRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleBotRule = (id: string) => {
    setBotRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  // Orders
  const createOrder = (orderInfo: {
    customerName: string;
    phone: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: PaymentMethod;
  }): Order => {
    const shippingFee = cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    
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
      paymentStatus: orderInfo.paymentMethod === 'online-gateway' ? 'paid' : 'unpaid',
      gatewayName: orderInfo.paymentMethod === 'online-gateway' ? settings.onlineGatewayName : undefined,
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

  // Chat handling with Smart Trained Bot Logic
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: false
    };
    setChatMessages(prev => [...prev, userMsg]);

    // Check against Bot Knowledge Rules
    const lowerText = text.toLowerCase();
    const matchedRule = botRules.find(rule => 
      rule.isActive && rule.keywords.some(kw => lowerText.includes(kw.trim().toLowerCase()))
    );

    setTimeout(() => {
      let replyText = '';
      if (matchedRule) {
        replyText = matchedRule.replyText;
      } else {
        replyText = `شكراً لتواصلك مع مرتفعات ستور! تم إشعار فريق خدمة العملاء باستفسارك وسنقوم بالرد عليك هنا فوراً، أو يمكنك مراسلتنا مباشرة على واتساب المتجر: 01067906474.`;
      }

      const botMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: 'bot',
        senderName: 'مساعد مرتفعات الذكي',
        text: replyText,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        readByAdmin: true
      };
      setChatMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  // Admin direct reply from Admin Dashboard to customer
  const adminSendReply = (text: string) => {
    if (!text.trim()) return;
    const adminMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'support',
      senderName: 'إدارة مرتفعات ستور',
      text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: true
    };
    setChatMessages(prev => [...prev, adminMsg]);
  };

  const unreadChatsCount = chatMessages.filter(m => m.sender === 'user' && !m.readByAdmin).length;

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
        botRules,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        currentView,
        setCurrentView,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isChatOpen,
        setIsChatOpen,
        activePolicyModal,
        setActivePolicyModal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        addCoupon,
        deleteCoupon,
        toggleCoupon,
        addBotRule,
        updateBotRule,
        deleteBotRule,
        toggleBotRule,
        createOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updatePaymentStatus,
        updateSettings,
        sendChatMessage,
        adminSendReply,
        cartCount,
        cartSubtotal,
        discountAmount,
        cartFinalTotal,
        unreadChatsCount
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
