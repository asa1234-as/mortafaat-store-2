import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInAdmin as supabaseSignInAdmin, 
  signOutSupabase, 
  restoreSupabaseUser,
  hasAdminRole,
  isSupabaseConfigured,
  fetchProductsDB,
  saveProductDB,
  deleteProductDB,
  fetchCategoriesDB,
  saveCategoryDB,
  deleteCategoryDB,
  fetchHeroSlidesDB,
  saveHeroSlideDB,
  deleteHeroSlideDB,
  fetchCouponsDB,
  saveCouponDB,
  deleteCouponDB,
  fetchSettingsDB,
  updateSettingsDB,
  fetchOrdersDB,
  updateOrderStatusDB,
  updatePaymentStatusDB,
  createCodOrderRPC,
  subscribeToOrders
} from '../lib/supabase';
import { t, setCurrentLanguage, locale } from '../i18n';
import { getSavedCustomerSession } from '../lib/authService';
import { 
  Product, 
  Category, 
  CartItem, 
  Order, 
  StoreSettings, 
  ChatMessage, 
  PaymentMethod, 
  Coupon, 
  BotKnowledgeRule, 
  HeroSlide, 
  User, 
  ThemeMode, 
  Language 
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_SETTINGS, 
  INITIAL_COUPONS, 
  INITIAL_BOT_RULES, 
  INITIAL_SLIDES 
} from '../data/initialData';

interface StoreContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  products: Product[];
  categories: Category[];
  slides: HeroSlide[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  chatMessages: ChatMessage[];
  botRules: BotKnowledgeRule[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: 'store' | 'admin';
  setCurrentView: (view: 'store' | 'admin') => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (emailOrPin: string, password?: string) => Promise<boolean>;
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
  activeInvoiceOrder: Order | null;
  setActiveInvoiceOrder: (order: Order | null) => void;
  saveFeedbackToast: boolean;
  triggerSaveFeedback: () => void;
  newOrderNotification: Order | null;
  clearNewOrderNotification: () => void;
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
  addSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateSlide: (id: string, slide: Partial<HeroSlide>) => void;
  deleteSlide: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  createOrder: (orderInfo: {
    customerName: string;
    phone: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Order>;
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
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('mortafaat_theme') as ThemeMode) || 'light';
  });

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('mortafaat_lang') as Language) || 'ar';
  });
  setCurrentLanguage(language);

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mortafaat_products_v2');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mortafaat_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Hero Slides
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('mortafaat_slides');
    return saved ? JSON.parse(saved) : INITIAL_SLIDES;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mortafaat_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mortafaat_orders');
    return saved ? JSON.parse(saved) : [];
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
        whatsapp: '201067906474',
        sliderIntervalSeconds: parsed.sliderIntervalSeconds || 5
      };
    }
    return INITIAL_SETTINGS;
  });

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return isSupabaseConfigured ? null : getSavedCustomerSession();
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        text: t("مرحباً بك في مرتفعات ستور (Mortafaat Store)! متواجدون لمساعدتك. اسألني عن الشحن، المعاينة، العروض، أو تواصل مع الإدارة على 01067906474."),
        time: t("الآن"),
        readByAdmin: true
      }
    ];
  });

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => import.meta.env.MODE === 'admin' ? 'admin' : 'store');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activePolicyModal, setActivePolicyModal] = useState<'return' | 'shipping' | 'privacy' | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [saveFeedbackToast, setSaveFeedbackToast] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState<Order | null>(null);

  // Handle Theme
  useEffect(() => {
    localStorage.setItem('mortafaat_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Handle Language
  useEffect(() => {
    localStorage.setItem('mortafaat_lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    document.title = language === 'ar' ? 'مرتفعات ستور | Mortafaat Store' : 'Mortafaat Store';
  }, [language]);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('mortafaat_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mortafaat_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mortafaat_slides', JSON.stringify(slides));
  }, [slides]);

  useEffect(() => {
    localStorage.setItem('mortafaat_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mortafaat_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mortafaat_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('mortafaat_bot_rules', JSON.stringify(botRules));
  }, [botRules]);

  useEffect(() => {
    localStorage.setItem('mortafaat_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Restore and validate the Supabase session with Auth before granting any UI access.
  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setIsAdminAuthenticated(false);
      setCurrentUser(null);
      return;
    }
    restoreSupabaseUser().then(async user => {
      if (!active) return;
      setCurrentUser(user);
      if (!user) {
        setIsAdminAuthenticated(false);
        return;
      }
      const isAdmin = await hasAdminRole(user.id);
      if (!active) return;
      setIsAdminAuthenticated(isAdmin);
      if (isAdmin) {
        const dbOrders = await fetchOrdersDB();
        if (active && dbOrders.length > 0) setOrders(dbOrders);
      }
    }).catch(() => {
      if (active) {
        setCurrentUser(null);
        setIsAdminAuthenticated(false);
      }
    });
    return () => { active = false; };
  }, []);

  // Sync data with Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;

    // Fetch Products from Supabase
    fetchProductsDB()
      .then(dbProducts => {
        if (isMounted && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      })
      .catch(() => undefined);

    // Fetch Categories
    fetchCategoriesDB()
      .then(dbCategories => {
        if (isMounted && dbCategories.length > 0) {
          setCategories(dbCategories);
        }
      })
      .catch(() => undefined);

    // Fetch Hero Slides
    fetchHeroSlidesDB()
      .then(dbSlides => {
        if (isMounted && dbSlides.length > 0) {
          setSlides(dbSlides);
        }
      })
      .catch(() => undefined);

    // Fetch Coupons
    fetchCouponsDB()
      .then(dbCoupons => {
        if (isMounted && dbCoupons.length > 0) {
          setCoupons(dbCoupons);
        }
      })
      .catch(() => undefined);

    // Fetch Settings
    fetchSettingsDB()
      .then(dbSettings => {
        if (isMounted && dbSettings) {
          setSettings(prev => ({ ...prev, ...dbSettings }));
        }
      })
      .catch(() => undefined);

    // Fetch Orders if admin or logged in user
    fetchOrdersDB(currentUser?.role === 'admin' || currentUser?.role === 'owner' ? undefined : currentUser?.id)
      .then(dbOrders => {
        if (isMounted && dbOrders.length > 0) {
          setOrders(dbOrders);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Subscribe to real-time incoming orders for Admin
  useEffect(() => {
    if (!isSupabaseConfigured || !isAdminAuthenticated) return;

    const unsubscribe = subscribeToOrders((newOrder) => {
      setOrders(prev => {
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      setNewOrderNotification(newOrder);

      // Play audio notification chime if supported
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => undefined);
      } catch {
        // Audio playback error or autoplay policy
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAdminAuthenticated]);

  const clearNewOrderNotification = () => setNewOrderNotification(null);

  const triggerSaveFeedback = () => {
    setSaveFeedbackToast(true);
    setTimeout(() => setSaveFeedbackToast(false), 2500);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stockCount > 0 ? product.stockCount : 99)
        };
        return updated;
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
      const updated = [...prev];
      if (updated[index]) {
        const maxStock = updated[index].product.stockCount;
        updated[index] = { 
          ...updated[index], 
          quantity: maxStock > 0 ? Math.min(quantity, maxStock) : quantity 
        };
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!found) {
      return { success: false, message: t("كوبون الخصم غير صحيح أو منتهي الصلاحية") };
    }
    if (found.minOrderValue && cartSubtotal < found.minOrderValue) {
      return { success: false, message: t("هذا الكوبون يتطلب مشتريات بحد أدنى {0} ج.م", found.minOrderValue) };
    }
    setAppliedCoupon(found);
    return { 
      success: true, 
      message: t("تم تفعيل خصم {0} بنجاح!", found.discountType === 'percentage' ? found.discountValue + '%' : found.discountValue + t(" ج.م")) 
    };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev.filter(c => c.code !== newCoupon.code)]);
    saveCouponDB(newCoupon).catch(() => undefined);
    triggerSaveFeedback();
  };

  const deleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    if (appliedCoupon?.code === code) setAppliedCoupon(null);
    deleteCouponDB(code).catch(() => undefined);
    triggerSaveFeedback();
  };

  const toggleCoupon = (code: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.code === code) {
        const updated = { ...c, isActive: !c.isActive };
        saveCouponDB(updated).catch(() => undefined);
        return updated;
      }
      return c;
    }));
    triggerSaveFeedback();
  };

  // Bot Rules
  const addBotRule = (rule: Omit<BotKnowledgeRule, 'id'>) => {
    const newRule: BotKnowledgeRule = { ...rule, id: `rule-${Date.now()}` };
    setBotRules(prev => [newRule, ...prev]);
    triggerSaveFeedback();
  };

  const updateBotRule = (id: string, updated: Partial<BotKnowledgeRule>) => {
    setBotRules(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    triggerSaveFeedback();
  };

  const deleteBotRule = (id: string) => {
    setBotRules(prev => prev.filter(r => r.id !== id));
    triggerSaveFeedback();
  };

  const toggleBotRule = (id: string) => {
    setBotRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    triggerSaveFeedback();
  };

  // Slides
  const addSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = { ...slide, id: `slide-${Date.now()}` };
    setSlides(prev => [...prev, newSlide]);
    saveHeroSlideDB(newSlide).catch(() => undefined);
    triggerSaveFeedback();
  };

  const updateSlide = (id: string, updated: Partial<HeroSlide>) => {
    setSlides(prev => prev.map(s => {
      if (s.id === id) {
        const u = { ...s, ...updated };
        saveHeroSlideDB(u).catch(() => undefined);
        return u;
      }
      return s;
    }));
    triggerSaveFeedback();
  };

  const deleteSlide = (id: string) => {
    setSlides(prev => prev.filter(s => s.id !== id));
    deleteHeroSlideDB(id).catch(() => undefined);
    triggerSaveFeedback();
  };

  // Categories
  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
    saveCategoryDB(category).catch(() => undefined);
    triggerSaveFeedback();
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        const u = { ...c, ...updated };
        saveCategoryDB(u).catch(() => undefined);
        return u;
      }
      return c;
    }));
    triggerSaveFeedback();
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    deleteCategoryDB(id).catch(() => undefined);
    triggerSaveFeedback();
  };

  // Create Order (Atomic Server-Side RPC with Local Fallback)
  const createOrder = async (orderInfo: {
    customerName: string;
    phone: string;
    governorate: string;
    address: string;
    notes?: string;
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error(t("سلة المشتريات فارغة"));
    }

    // Verify stock availability
    for (const item of cart) {
      if (item.quantity > item.product.stockCount) {
        throw new Error(t(`عفواً، الكمية المطلوبة من "${item.product.name}" غير متوفرة في المخزون (المتاح: ${item.product.stockCount})`));
      }
    }

    // Generate secure cryptographically strong UUID
    const orderId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const shippingFee = cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;

    // Check if connected to Supabase
    if (isSupabaseConfigured) {
      try {
        const rpcItems = cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          selected_size: item.selectedSize || null,
          selected_color: item.selectedColor || null
        }));

        const result = await createCodOrderRPC({
          orderId,
          customerName: orderInfo.customerName,
          phone: orderInfo.phone,
          email: currentUser?.email,
          governorate: orderInfo.governorate,
          address: orderInfo.address,
          notes: orderInfo.notes,
          items: rpcItems as any,
          couponCode: appliedCoupon?.code
        });

        const newOrder: Order = {
          id: result.order_id,
          orderNumber: result.order_number,
          userId: currentUser?.id,
          customerName: orderInfo.customerName,
          phone: orderInfo.phone,
          email: currentUser?.email,
          governorate: orderInfo.governorate,
          address: orderInfo.address,
          notes: orderInfo.notes,
          items: [...cart],
          subtotal: result.subtotal,
          discountAmount: result.discount_amount > 0 ? result.discount_amount : undefined,
          couponCode: appliedCoupon?.code,
          shippingFee: result.shipping_fee,
          total: result.total,
          paymentMethod: orderInfo.paymentMethod,
          paymentStatus: 'unpaid',
          status: 'pending',
          createdAt: new Date().toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })
        };

        // Update local stock immediately
        setProducts(prev => prev.map(p => {
          const itemInCart = cart.find(ci => ci.product.id === p.id);
          if (itemInCart) {
            const newStock = Math.max(0, p.stockCount - itemInCart.quantity);
            return { ...p, stockCount: newStock, inStock: newStock > 0 };
          }
          return p;
        }));

        setOrders(prev => [newOrder, ...prev]);
        clearCart();
        return newOrder;
      } catch (err: any) {
        throw new Error(err.message || 'فشل إتمام الطلب على الخادم');
      }
    }

    // Local Storage fallback mode (when offline / demo)
    const localOrderNumber = orders.length > 0
      ? Math.max(...orders.map(o => o.orderNumber || 1000)) + 1
      : 1001;

    const newOrder: Order = {
      id: orderId,
      orderNumber: localOrderNumber,
      userId: currentUser?.id,
      customerName: orderInfo.customerName,
      phone: orderInfo.phone,
      email: currentUser?.email,
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
      paymentStatus: 'unpaid',
      status: 'pending',
      createdAt: new Date().toLocaleString(locale(), { dateStyle: 'short', timeStyle: 'short' })
    };

    // Deduct stock locally
    setProducts(prev => prev.map(p => {
      const itemInCart = cart.find(ci => ci.product.id === p.id);
      if (itemInCart) {
        const newStock = Math.max(0, p.stockCount - itemInCart.quantity);
        return { ...p, stockCount: newStock, inStock: newStock > 0 };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
    saveProductDB(newProduct).catch(() => undefined);
    triggerSaveFeedback();
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const u = { ...p, ...updated };
        saveProductDB(u).catch(() => undefined);
        return u;
      }
      return p;
    }));
    triggerSaveFeedback();
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteProductDB(id).catch(() => undefined);
    triggerSaveFeedback();
  };

  // Orders Management
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    updateOrderStatusDB(orderId, status).catch(() => undefined);
    triggerSaveFeedback();
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: Order['paymentStatus']) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, paymentStatus } : o)));
    updatePaymentStatusDB(orderId, paymentStatus).catch(() => undefined);
    triggerSaveFeedback();
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    updateSettingsDB(newSettings).catch(() => undefined);
    triggerSaveFeedback();
  };

  // Authentication
  const loginAdmin = async (emailOrPin?: string, password?: string): Promise<boolean> => {
    // If Supabase is configured and credentials provided: authenticate against Supabase Auth & Role
    if (isSupabaseConfigured && emailOrPin && password) {
      try {
        const user = await supabaseSignInAdmin(emailOrPin, password);
        setCurrentUser(user);
        setIsAdminAuthenticated(true);
        setCurrentView('admin');
        fetchOrdersDB().then(dbOrders => {
          if (dbOrders.length > 0) setOrders(dbOrders);
        }).catch(() => undefined);
        return true;
      } catch (err: any) {
        alert(err.message || t("فشل تسجيل دخول المدير: تأكد من صحة البيانات ووجود صلاحية admin أو owner."));
        return false;
      }
    }

    // Fail closed: never grant admin access when Supabase Auth is unavailable.
    setIsAdminAuthenticated(false);
    setCurrentView('admin');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('store');
    signOutSupabase().catch(() => undefined);
  };

  // Chat handling
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: false
    };
    setChatMessages(prev => [...prev, userMsg]);

    const lowerText = text.toLowerCase();
    const matchedRule = botRules.find(r => 
      r.isActive && r.keywords.some(k => lowerText.includes(k.toLowerCase()))
    );

    setTimeout(() => {
      let reply = t("شكراً لتواصلك معنا! ممثل خدمة عملاء مرتفعات ستور سيرد عليك في أقرب وقت. يمكنك أيضاً الاتصال بنا مباشرة على 01067906474.");
      if (matchedRule) {
        if (language === 'en') {
          reply = matchedRule.replyTextEn || matchedRule.replyText;
        } else {
          reply = matchedRule.replyTextAr || matchedRule.replyText;
        }
      }
      setChatMessages(prev => [
        ...prev,
        {
          id: `m-bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }),
          readByAdmin: true
        }
      ]);
    }, 600);
  };

  const adminSendReply = (text: string) => {
    if (!text.trim()) return;
    const adminMsg: ChatMessage = {
      id: `m-admin-${Date.now()}`,
      sender: 'support',
      senderName: t("إدارة المتجر"),
      text,
      time: new Date().toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }),
      readByAdmin: true
    };
    setChatMessages(prev => [...prev, adminMsg]);
  };

  // Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);
  }

  const shipping = cartSubtotal >= settings.freeShippingThreshold || cartSubtotal === 0 ? 0 : settings.shippingFee;
  const cartFinalTotal = Math.max(0, cartSubtotal - discountAmount + shipping);
  const unreadChatsCount = chatMessages.filter(m => m.sender === 'user' && !m.readByAdmin).length;

  return (
    <StoreContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        products,
        categories,
        slides,
        cart,
        orders,
        settings,
        coupons,
        appliedCoupon,
        chatMessages,
        botRules,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
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
        activeInvoiceOrder,
        setActiveInvoiceOrder,
        saveFeedbackToast,
        triggerSaveFeedback,
        newOrderNotification,
        clearNewOrderNotification,
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
        addSlide,
        updateSlide,
        deleteSlide,
        addCategory,
        updateCategory,
        deleteCategory,
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

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
