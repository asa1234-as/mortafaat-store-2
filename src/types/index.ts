export interface Product {
  id: string;
  name: string;
  nameEn: string;
  category: 'electronics' | 'fashion' | 'perfumes' | 'home' | 'personal-care';
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  features: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  isFeatured?: boolean;
  isDeal?: boolean;
  dealDiscount?: number;
}

export interface Category {
  id: 'electronics' | 'fashion' | 'perfumes' | 'home' | 'personal-care';
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type PaymentMethod = 'cod' | 'vodafone-cash' | 'instapay';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface StoreSettings {
  storeNameAr: string;
  storeNameEn: string;
  phone: string;
  whatsapp: string;
  vodafoneCashNumber: string;
  instaPayUsername: string;
  shippingFee: number;
  freeShippingThreshold: number;
  announcementText: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'bot';
  text: string;
  time: string;
}
