import { Product, Category, StoreSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'electronics',
    nameAr: 'الإلكترونيات والذكاء',
    nameEn: 'Electronics',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    itemCount: 24
  },
  {
    id: 'fashion',
    nameAr: 'الملابس والأزياء',
    nameEn: 'Fashion & Apparel',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    itemCount: 38
  },
  {
    id: 'perfumes',
    nameAr: 'العطور الفاخرة',
    nameEn: 'Perfumes',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    itemCount: 19
  },
  {
    id: 'home',
    nameAr: 'الأدوات المنزلية',
    nameEn: 'Home Appliances',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    itemCount: 31
  },
  {
    id: 'personal-care',
    nameAr: 'العناية والأدوات الشخصية',
    nameEn: 'Personal Care',
    icon: 'HeartPulse',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    itemCount: 22
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'سماعات بلوتوث لاسلكية برو عازلة للضوضاء ANC',
    nameEn: 'Wireless ANC Pro Earbuds',
    category: 'electronics',
    price: 890,
    originalPrice: 1350,
    description: 'سماعات أذن لاسلكية بتقنية البلوتوث 5.3 مع خاصية إلغاء الضوضاء النشط (Active Noise Cancellation) وبطارية تدوم حتى 36 ساعة مع علبة الشحن. صوت نقي بيز عميق مع ميكروفون مدمج مزدوج للمكالمات الواضحة.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 45,
    rating: 4.9,
    reviewsCount: 128,
    features: ['إلغاء الضوضاء الفعال ANC', 'بطارية 36 ساعة تشغيل', 'مقاومة لرذاذ الماء IPX5', 'شحن سريع عبر Type-C'],
    isFeatured: true,
    isDeal: true,
    dealDiscount: 34
  },
  {
    id: 'p-2',
    name: 'ساعة ذكية ألترا بشاشة AMOLED رياضية مقاومة للماء',
    nameEn: 'Ultra AMOLED Smartwatch',
    category: 'electronics',
    price: 1450,
    originalPrice: 2100,
    description: 'ساعة ذكية بتصميم معدني فخم وشاشة AMOLED عالية السطوع تحت الشمس، تدعم إجراء واستقبال المكالمات، قياس نبضات القلب ونسبة الأكسجين وتتبع الأنشطة الرياضية مع سوار إضافي هدية.',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 28,
    rating: 4.8,
    reviewsCount: 94,
    features: ['إجراء واستقبال المكالمات Bluetooth', 'شاشة AMOLED Always-on', 'بطارية تدوم 7 أيام', 'مقاومة الماء بالكامل'],
    isFeatured: true,
    isDeal: true,
    dealDiscount: 31
  },
  {
    id: 'p-3',
    name: 'هودي شتوي قطن أوفر سايز فاخر بطباعة حصرية',
    nameEn: 'Premium Oversized Winter Hoodie',
    category: 'fashion',
    price: 650,
    originalPrice: 850,
    description: 'هودي شتوي ميلتون ثقيل مبطن بوبرة داخلية ناعمة لتدفئة فائقة، خامات قطنية مصرية 100% عالية الجودة لا تنكمش مع الغسيل بتطريز أنيق يحمل روح مرتفعات ستور.',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 60,
    rating: 4.9,
    reviewsCount: 156,
    features: ['قطن مصري 100% مبطن', 'قصة Oversized عصرية', 'جيوب كانغارو مريحة', 'ألوان ثابتة تماماً'],
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'أسود فحمي', hex: '#0F172A' },
      { name: 'أبيض لؤلؤي', hex: '#F8FAFC' },
      { name: 'رمادي داكن', hex: '#475569' }
    ],
    isFeatured: true
  },
  {
    id: 'p-4',
    name: 'جاكيت بامب ووتر بروف شتوي مقاوم للأمطار والرياح',
    nameEn: 'Waterproof Winter Puffer Jacket',
    category: 'fashion',
    price: 1190,
    originalPrice: 1600,
    description: 'جاكيت شتوي أنيق بتقنية العزل الحراري ومقاومة المياه والرياح، مزود بغطاء رأس قابل للفك وسوست متينة مستوردة مع جيوب جانبية دافئة.',
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 18,
    rating: 4.7,
    reviewsCount: 42,
    features: ['مقاوم للأمطار والرياح Waterproof', 'حشوة فايبر حراري خفيف الوزن', 'سحابات YKK متينة', 'كابيشون قابل للفصل'],
    sizes: ['L', 'XL', '2XL', '3XL'],
    isFeatured: false
  },
  {
    id: 'p-5',
    name: 'عطر "شموخ المرتفعات" الفاخر ثبات وفوحان 24 ساعة (100 مل)',
    nameEn: 'Shomookh Al-Mortafaat Luxury Perfume 100ml',
    category: 'perfumes',
    price: 980,
    originalPrice: 1400,
    description: 'توليفة عطرية ملكية خاصة بمرتفعات ستور تجمع بين نفحات العود الملكي، العنبر الدافئ، والتوابل الشرقية مع لمسة انتعاش البرغموت. ثبات وفوحان استثنائي يدوم لأكثر من 24 ساعة.',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 35,
    rating: 5.0,
    reviewsCount: 210,
    features: ['ثبات مضمون لأكثر من 24 ساعة', 'مكونات زيوت فرنسية نقية', 'زجاجة كرستالية أنيقة 100 مل', 'مناسب لجميع المناسبات'],
    isFeatured: true,
    isDeal: true,
    dealDiscount: 30
  },
  {
    id: 'p-6',
    name: 'قلاية هوائية رقمية ذكية سعة 6.5 لتر بدون زيت بتقنية 360 Air',
    nameEn: 'Smart Digital Air Fryer 6.5L',
    category: 'home',
    price: 2750,
    originalPrice: 3500,
    description: 'قلاية هوائية عائلية كبيرة شاشة لمس ديجيتال بـ 8 برامج طهي ذكية مسبقة الإعداد، تقلي وتشوي وتخبز بدهون أقل بنسبة 85% مع طلاء غير لاصق وسهلة التنظيف بغسالة الأطباق.',
    images: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 15,
    rating: 4.8,
    reviewsCount: 77,
    features: ['سعة عائلية ضخمة 6.5 لتر', 'شاشة لمس LED مع 8 برامج', 'قلي صحي بدون دهون', 'ضمان عامين كاملين'],
    isFeatured: true
  },
  {
    id: 'p-7',
    name: 'ماكينة حلاقة وتشذيب رجالية متطورة 7 في 1 مضادة للماء',
    nameEn: 'Professional 7-in-1 Grooming Shaver Kit',
    category: 'personal-care',
    price: 720,
    originalPrice: 950,
    description: 'طقم متكامل للعناية الشخصية للرجال يضم شفرات ستانلس ستيل حادة ذاتية الشحذ، رؤوس لتشذيب الذقن وشعر الأنف والأذن، بطارية ليثيوم تدوم 90 دقيقة وشاشة لعرض نسبة الشحن.',
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 50,
    rating: 4.9,
    reviewsCount: 112,
    features: ['7 رؤوس تبديل مختلفة', 'شفرات ستانلس ستيل ذاتية الشحذ', 'شاشة رقمية لنسبة البطارية', 'مقاومة للماء وسهلة الغسيل'],
    isFeatured: true,
    isDeal: true,
    dealDiscount: 24
  },
  {
    id: 'p-8',
    name: 'فرشاة تصفيف وفرد الشعر الحرارية سيراميك بالأيونات',
    nameEn: 'Ceramic Ionic Hair Straightener Brush',
    category: 'personal-care',
    price: 640,
    originalPrice: 850,
    description: 'فرشاة فرد الشعر الاحترافية بألواح سيراميك تورمالين توزع الحرارة بتساوٍ لحماية بصيلات الشعر وتوليد ملايين الأيونات السالبة لمنع الهيشان والحصول على شعر حريري في دقائق.',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    stockCount: 30,
    rating: 4.8,
    reviewsCount: 65,
    features: ['تسخين فوري خلال 30 ثانية', 'درجات حرارة قابلة للتعديل', 'تقنية الأيونات ضد الهيشان', 'سلك دوار 360 درجة'],
    isFeatured: false
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeNameAr: 'مرتفعات ستور',
  storeNameEn: 'Mortafaat Store',
  phone: '01099887766',
  whatsapp: '201099887766',
  vodafoneCashNumber: '01099887766',
  instaPayUsername: 'mortafaat@instapay',
  shippingFee: 50,
  freeShippingThreshold: 1000,
  announcementText: '🔥 عروض افتتاح مرتفعات ستور: شحن مجاني لأي طلب أكثر من 1000 جنيه + هدايا مع أول 100 طلب! 🔥'
};
