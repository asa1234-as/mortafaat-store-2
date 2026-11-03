import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, CartItem, Order, StoreSettings, ChatMessage, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from '../data/initialData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
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
  updateSettings: (newSettings: StoreSettings) => void;
  sendChatMessage: (text: string) => void;
  cartCount: number;
  cartSubtotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products from localStorage or default
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mortafaat_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Load categories
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Load cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mortafaat_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Load orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mortafaat_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-9821',
        customerName: 'أحمد محمود',
        phone: '01012345678',
        governorate: 'القاهرة',
        address: 'مدينة نصر - الحي السابع',
        items: [
          { product: INITIAL_PRODUCTS[0], quantity: 1 }
        ],
        subtotal: 890,
        shippingFee: 50,
        total: 940,
        paymentMethod: 'cod',
        status: 'pending',
        createdAt: '2026-11-03 08:30'
      }
    ];
  });

  // Store Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('mortafaat_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: 'مرحباً بك في مرتفعات ستور (Mortafaat Store)! كيف يمكننا مساعدتك اليوم؟',
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

  // Persist to localStorage
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

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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
      shippingFee,
      total: cartSubtotal + shippingFee,
      paymentMethod: orderInfo.paymentMethod,
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
        text: 'شكراً لتواصلك مع مرتفعات ستور! ممثل خدمة العملاء سيجيبك خلال دقيقة. يمكنك أيضاً مراسلتنا مباشرة على واتساب للرد الفوري.',
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
        createOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updateSettings,
        sendChatMessage,
        cartCount,
        cartSubtotal
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
