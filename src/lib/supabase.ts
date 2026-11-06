/**
 * Mortafaat Store - Supabase Client & REST Data Access Layer
 * 
 * Works with zero npm bloat using standard Fetch API for GoTrue, PostgREST, and Storage.
 * Safe for client-side execution with RLS (Row Level Security).
 * Never exposes service-role keys or payment provider secrets.
 */

import { Product, Category, HeroSlide, Coupon, StoreSettings, Order, User, UserRole } from '../types';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
const SESSION_KEY = 'mortafaat_supabase_session';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('YOUR_PROJECT_REF')
);

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    phone?: string;
    user_metadata?: Record<string, unknown>;
    role?: UserRole;
  };
};

function getHeaders(customToken?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY || ''
  };

  const token = customToken || getSupabaseSession()?.access_token;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function baseUrl(): string {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase غير مهيأ. يرجى إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY إلى ملف البيئة.');
  }
  return SUPABASE_URL!.replace(/\/$/, '');
}

// ==========================================
// 1. AUTHENTICATION (GoTrue REST)
// ==========================================

export function getSupabaseSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SupabaseSession;
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: SupabaseSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function refreshSupabaseSession(): Promise<SupabaseSession | null> {
  const current = getSupabaseSession();
  if (!current) return null;
  if (current.expires_at && current.expires_at * 1000 > Date.now() + 60_000) return current;
  if (!current.refresh_token) {
    saveSession(null);
    return null;
  }
  try {
    const data = await authRequest('token?grant_type=refresh_token', { refresh_token: current.refresh_token });
    const next: SupabaseSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || current.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
      user: data.user || current.user
    };
    saveSession(next);
    return next;
  } catch {
    saveSession(null);
    return null;
  }
}

export async function restoreSupabaseUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  const session = await refreshSupabaseSession();
  if (!session) return null;
  try {
    const response = await fetch(`${baseUrl()}/auth/v1/user`, {
      headers: getHeaders(session.access_token)
    });
    if (!response.ok) {
      saveSession(null);
      return null;
    }
    const authUser = await response.json();
    const role = await getUserRole(authUser.id, session.access_token);
    return {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      phone: authUser.phone || '',
      role,
      isVerified: Boolean(authUser.email_confirmed_at || authUser.confirmed_at)
    };
  } catch {
    return null;
  }
}

async function authRequest(endpoint: string, body: unknown) {
  const url = baseUrl();
  const response = await fetch(`${url}/auth/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY || ''
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.msg || data.message || data.error_description || 'فشل التحقق من الحساب';
    throw new Error(msg);
  }
  return data;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const data = await authRequest('token?grant_type=password', { email, password });
  const session: SupabaseSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
    user: data.user
  };
  saveSession(session);

  // Fetch user role from profiles table
  const role = await getUserRole(data.user.id, data.access_token);
  return {
    id: data.user.id,
    name: data.user.user_metadata?.full_name || email.split('@')[0],
    email: data.user.email || email,
    phone: data.user.phone || '',
    role,
    isVerified: true
  };
}

export async function signUpWithEmail(email: string, password: string, metadata: { full_name?: string; phone?: string } = {}): Promise<User> {
  const data = await authRequest('signup', { email, password, data: metadata });
  if (data.access_token) {
    const session: SupabaseSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
      user: data.user
    };
    saveSession(session);
  }
  return {
    id: data.user.id,
    name: metadata.full_name || email.split('@')[0],
    email: data.user.email || email,
    phone: metadata.phone || '',
    role: 'customer',
    isVerified: true
  };
}

export async function signOutSupabase(): Promise<void> {
  const session = getSupabaseSession();
  if (session && isSupabaseConfigured) {
    try {
      const url = baseUrl();
      await fetch(`${url}/auth/v1/logout`, {
        method: 'POST',
        headers: getHeaders(session.access_token)
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  saveSession(null);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const url = baseUrl();
  const response = await fetch(`${url}/auth/v1/recover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY || ''
    },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    throw new Error('تعذر إرسال رابط استعادة كلمة المرور، يرجى التأكد من البريد المدخل.');
  }
}

export async function getUserRole(userId: string, customToken?: string): Promise<UserRole> {
  if (!isSupabaseConfigured) return 'customer';
  try {
    const url = baseUrl();
    const response = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role`, {
      headers: getHeaders(customToken)
    });
    if (!response.ok) return 'customer';
    const rows = await response.json();
    return rows[0]?.role || 'customer';
  } catch {
    return 'customer';
  }
}

export async function hasAdminRole(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'owner';
}

export async function signInAdmin(email: string, password: string): Promise<User> {
  const user = await signInWithEmail(email, password);
  const isAdmin = await hasAdminRole(user.id);
  if (!isAdmin) {
    await signOutSupabase();
    throw new Error('غير مصرح: هذا الحساب ليس لديه صلاحيات مدير متجر أو مالك.');
  }
  return user;
}

// ==========================================
// 2. PRODUCTS CRUD
// ==========================================

export async function fetchProductsDB(): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/products?select=*&order=created_at.asc`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('فشل جلب المنتجات من الخادم');
  const rows = await res.json();
  return rows.map((r: any): Product => ({
    id: r.id,
    sku: r.sku,
    name: r.name_ar,
    nameEn: r.name_en || r.name_ar,
    category: r.category_id || 'electronics',
    price: Number(r.price),
    originalPrice: r.compare_at_price ? Number(r.compare_at_price) : undefined,
    stockCount: Number(r.stock_quantity),
    inStock: Number(r.stock_quantity) > 0,
    description: r.description || '',
    images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ['/logo.png'],
    videoUrl: r.video_url,
    rating: Number(r.rating || 0),
    reviewsCount: Number(r.reviews_count || 0),
    features: Array.isArray(r.features) ? r.features : [],
    sizes: Array.isArray(r.sizes) ? r.sizes : [],
    colors: Array.isArray(r.colors) ? r.colors : [],
    isFeatured: Boolean(r.is_featured),
    isDeal: Boolean(r.is_deal),
    dealDiscount: r.deal_discount ? Number(r.deal_discount) : undefined
  }));
}

export async function saveProductDB(product: Product): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const payload = {
    id: product.id,
    sku: product.sku || null,
    name_ar: product.name,
    name_en: product.nameEn,
    category_id: product.category,
    price: product.price,
    compare_at_price: product.originalPrice || null,
    stock_quantity: product.stockCount,
    description: product.description,
    images: product.images,
    video_url: product.videoUrl || null,
    features: product.features,
    sizes: product.sizes || [],
    colors: product.colors || [],
    is_featured: Boolean(product.isFeatured),
    is_deal: Boolean(product.isDeal),
    deal_discount: product.dealDiscount || null,
    is_active: true
  };

  const res = await fetch(`${url}/rest/v1/products`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'فشل حفظ المنتج في قاعدة البيانات');
  }
}

export async function deleteProductDB(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('فشل حذف المنتج');
}

// ==========================================
// 3. CATEGORIES CRUD
// ==========================================

export async function fetchCategoriesDB(): Promise<Category[]> {
  if (!isSupabaseConfigured) return [];
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/categories?select=*&order=sort_order.asc`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('فشل جلب التصنيفات');
  const rows = await res.json();
  return rows.map((r: any): Category => ({
    id: r.id,
    nameAr: r.name_ar,
    nameEn: r.name_en || r.name_ar,
    icon: r.icon || 'Tag',
    image: r.image_url,
    itemCount: Number(r.item_count || 0),
    sortOrder: Number(r.sort_order || 0),
    isActive: Boolean(r.is_active)
  }));
}

export async function saveCategoryDB(category: Category): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const payload = {
    id: category.id,
    name_ar: category.nameAr,
    name_en: category.nameEn,
    icon: category.icon,
    image_url: category.image || null,
    sort_order: category.sortOrder || 0,
    item_count: category.itemCount || 0,
    is_active: category.isActive !== false
  };

  const res = await fetch(`${url}/rest/v1/categories`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('فشل حفظ التصنيف');
}

export async function deleteCategoryDB(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/categories?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('فشل حذف التصنيف');
}

// ==========================================
// 4. HERO SLIDES CRUD
// ==========================================

export async function fetchHeroSlidesDB(): Promise<HeroSlide[]> {
  if (!isSupabaseConfigured) return [];
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/hero_slides?select=*&order=sort_order.asc`, {
    headers: getHeaders()
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.map((r: any): HeroSlide => ({
    id: r.id,
    title: r.title_ar,
    subtitle: r.subtitle_ar,
    tag: r.tag_ar,
    ctaText: r.cta_text_ar,
    targetCategory: r.target_category || 'all',
    image: r.image_url,
    isActive: Boolean(r.is_active)
  }));
}

export async function saveHeroSlideDB(slide: HeroSlide): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const payload = {
    id: slide.id,
    title_ar: slide.title,
    subtitle_ar: slide.subtitle,
    tag_ar: slide.tag,
    cta_text_ar: slide.ctaText,
    target_category: slide.targetCategory,
    image_url: slide.image,
    is_active: slide.isActive !== false
  };

  await fetch(`${url}/rest/v1/hero_slides`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(payload)
  });
}

export async function deleteHeroSlideDB(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  await fetch(`${url}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
}

// ==========================================
// 5. COUPONS CRUD
// ==========================================

export async function fetchCouponsDB(): Promise<Coupon[]> {
  if (!isSupabaseConfigured) return [];
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/coupons?select=*&order=created_at.desc`, {
    headers: getHeaders()
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.map((r: any): Coupon => ({
    id: r.id,
    code: r.code,
    discountType: r.discount_type,
    discountValue: Number(r.discount_value),
    minOrderValue: r.min_order_value ? Number(r.min_order_value) : 0,
    maxUses: r.max_uses,
    usesCount: r.uses_count,
    isActive: Boolean(r.is_active)
  }));
}

export async function saveCouponDB(coupon: Coupon): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const payload = {
    code: coupon.code.toUpperCase().trim(),
    discount_type: coupon.discountType,
    discount_value: coupon.discountValue,
    min_order_value: coupon.minOrderValue || 0,
    is_active: coupon.isActive
  };

  const res = await fetch(`${url}/rest/v1/coupons`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('فشل حفظ الكوبون في قاعدة البيانات');
}

export async function deleteCouponDB(code: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  await fetch(`${url}/rest/v1/coupons?code=eq.${encodeURIComponent(code)}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
}

// ==========================================
// 6. STORE SETTINGS
// ==========================================

export async function fetchSettingsDB(): Promise<Partial<StoreSettings> | null> {
  if (!isSupabaseConfigured) return null;
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/store_settings?id=eq.1&select=*`, {
    headers: getHeaders()
  });
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    storeNameAr: r.store_name_ar,
    storeNameEn: r.store_name_en,
    phone: r.phone,
    whatsapp: r.whatsapp,
    shippingFee: Number(r.shipping_fee),
    freeShippingThreshold: Number(r.free_shipping_threshold),
    announcementText: r.announcement_text_ar,
    sliderIntervalSeconds: Number(r.slider_interval_seconds || 5),
    isOnlinePaymentEnabled: Boolean(r.online_payment_enabled),
    onlineGatewayName: r.online_gateway_name,
    onlineGatewayEnvironment: r.online_gateway_environment || 'test',
    returnPolicyText: r.return_policy_text || '',
    shippingPolicyText: r.shipping_policy_text || '',
    privacyPolicyText: r.privacy_policy_text || ''
  };
}

export async function updateSettingsDB(settings: StoreSettings): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const payload = {
    store_name_ar: settings.storeNameAr,
    store_name_en: settings.storeNameEn,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    shipping_fee: settings.shippingFee,
    free_shipping_threshold: settings.freeShippingThreshold,
    announcement_text_ar: settings.announcementText,
    slider_interval_seconds: settings.sliderIntervalSeconds,
    online_payment_enabled: settings.isOnlinePaymentEnabled,
    online_gateway_name: settings.onlineGatewayName,
    online_gateway_environment: settings.onlineGatewayEnvironment,
    return_policy_text: settings.returnPolicyText,
    shipping_policy_text: settings.shippingPolicyText,
    privacy_policy_text: settings.privacyPolicyText,
    updated_at: new Date().toISOString()
  };

  const res = await fetch(`${url}/rest/v1/store_settings?id=eq.1`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('فشل حفظ إعدادات المتجر في الخادم');
}

// ==========================================
// 7. ORDERS & CHECKOUT (TRANSACTIONAL COD)
// ==========================================

export async function createCodOrderRPC(params: {
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  governorate: string;
  address: string;
  notes?: string;
  items: Array<{ product_id: string; quantity: number; selected_size?: string; selected_color?: string }>;
  couponCode?: string;
}): Promise<{
  success: boolean;
  order_id: string;
  order_number: number;
  total: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  message: string;
}> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase غير متصل');
  }

  const url = baseUrl();
  const payload = {
    p_order_id: params.orderId,
    p_customer_name: params.customerName,
    p_phone: params.phone,
    p_email: params.email || null,
    p_governorate: params.governorate,
    p_address: params.address,
    p_notes: params.notes || null,
    p_items: params.items,
    p_coupon_code: params.couponCode || null
  };

  const res = await fetch(`${url}/rest/v1/rpc/create_cod_order`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || data.details || data.hint || 'فشل تسجيل الطلب في الخادم';
    throw new Error(errorMsg);
  }

  return data;
}

export async function fetchOrdersDB(userId?: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  const url = baseUrl();

  let query = 'select=*,order_items(*)&order=created_at.desc';
  if (userId) {
    query += `&user_id=eq.${encodeURIComponent(userId)}`;
  }

  const res = await fetch(`${url}/rest/v1/orders?${query}`, {
    headers: getHeaders()
  });

  if (!res.ok) return [];
  const rows = await res.json();

  return rows.map((r: any): Order => ({
    id: r.id,
    orderNumber: Number(r.order_number),
    userId: r.user_id,
    customerName: r.customer_name,
    phone: r.phone,
    email: r.email,
    governorate: r.governorate,
    address: r.shipping_address,
    notes: r.notes,
    subtotal: Number(r.subtotal),
    discountAmount: r.discount_amount ? Number(r.discount_amount) : undefined,
    couponCode: r.coupon_code,
    shippingFee: Number(r.shipping_fee),
    total: Number(r.total),
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    status: r.status,
    createdAt: new Date(r.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
    items: (r.order_items || []).map((item: any) => ({
      product: {
        id: item.product_id,
        name: item.product_name,
        nameEn: item.product_name,
        category: 'general',
        price: Number(item.unit_price),
        stockCount: 0,
        inStock: true,
        description: '',
        images: ['/logo.png'],
        rating: 0,
        reviewsCount: 0,
        features: []
      },
      quantity: Number(item.quantity),
      selectedSize: item.selected_size,
      selectedColor: item.selected_color
    }))
  }));
}

export async function updateOrderStatusDB(orderId: string, status: Order['status']): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error('فشل تحديث حالة الطلب');
}

export async function updatePaymentStatusDB(orderId: string, paymentStatus: Order['paymentStatus']): Promise<void> {
  if (!isSupabaseConfigured) return;
  const url = baseUrl();
  const res = await fetch(`${url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error('فشل تحديث حالة الدفع');
}

// ==========================================
// 8. STORAGE (IMAGE UPLOADS)
// ==========================================

export async function uploadProductImage(file: File): Promise<string> {
  return uploadMediaFile(file, 'product-images');
}

export async function uploadMediaFile(file: File, bucket = 'product-images'): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase غير مهيأ لرفع الملفات');
  }

  const url = baseUrl();
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${Date.now()}-${cleanName}`;

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY || '',
      'Authorization': `Bearer ${getSupabaseSession()?.access_token}`,
      'Content-Type': file.type
    },
    body: file
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'فشل رفع الملف إلى Supabase Storage. تأكد من صلاحية المدير.');
  }

  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

// ==========================================
// 9. REALTIME LISTENERS / POLLING
// ==========================================

export function subscribeToOrders(onNewOrder: (order: Order) => void): () => void {
  if (!isSupabaseConfigured) return () => {};

  let lastCheckedTime = new Date().toISOString();
  
  // Realtime polling fallback: highly reliable across all browsers & firewalls
  const interval = setInterval(async () => {
    try {
      const url = baseUrl();
      const res = await fetch(
        `${url}/rest/v1/orders?select=*,order_items(*)&created_at=gt.${encodeURIComponent(lastCheckedTime)}&order=created_at.asc`,
        { headers: getHeaders() }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          lastCheckedTime = new Date().toISOString();
          rows.forEach((r: any) => {
            onNewOrder({
              id: r.id,
              orderNumber: Number(r.order_number),
              userId: r.user_id,
              customerName: r.customer_name,
              phone: r.phone,
              email: r.email,
              governorate: r.governorate,
              address: r.shipping_address,
              notes: r.notes,
              subtotal: Number(r.subtotal),
              discountAmount: r.discount_amount ? Number(r.discount_amount) : undefined,
              couponCode: r.coupon_code,
              shippingFee: Number(r.shipping_fee),
              total: Number(r.total),
              paymentMethod: r.payment_method,
              paymentStatus: r.payment_status,
              status: r.status,
              createdAt: new Date(r.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
              items: (r.order_items || []).map((item: any) => ({
                product: {
                  id: item.product_id,
                  name: item.product_name,
                  nameEn: item.product_name,
                  category: 'general',
                  price: Number(item.unit_price),
                  stockCount: 0,
                  inStock: true,
                  description: '',
                  images: ['/logo.png'],
                  rating: 0,
                  reviewsCount: 0,
                  features: []
                },
                quantity: Number(item.quantity)
              }))
            });
          });
        }
      }
    } catch {
      // Ignore background polling transient errors
    }
  }, 10000); // Poll every 10s for new orders

  return () => clearInterval(interval);
}
