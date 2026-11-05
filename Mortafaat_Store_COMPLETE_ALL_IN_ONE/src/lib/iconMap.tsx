import React from 'react';
import { 
  Smartphone, 
  Tablet, 
  Home, 
  Tv, 
  Flame, 
  Utensils, 
  Coffee, 
  Shirt, 
  ShoppingBag, 
  Watch, 
  Glasses, 
  Sparkles, 
  Smile, 
  Scissors, 
  Heart, 
  HeartPulse, 
  Laptop, 
  Headphones, 
  Camera, 
  Cpu, 
  BatteryCharging, 
  Speaker, 
  Dumbbell, 
  Bike, 
  Car, 
  Truck, 
  Package, 
  Tag, 
  Layers, 
  Grid, 
  Gift, 
  Compass, 
  BookOpen,
  Shield,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  LucideProps
} from 'lucide-react';

export const AVAILABLE_CATEGORY_ICONS: Array<{ id: string; nameAr: string; nameEn: string; icon: React.FC<LucideProps> }> = [
  // Phones & Tablets
  { id: 'Smartphone', nameAr: 'هواتف وموبايلات', nameEn: 'Smartphones', icon: Smartphone },
  { id: 'Tablet', nameAr: 'أجهزة لوحية (تابلت)', nameEn: 'Tablets', icon: Tablet },
  
  // Electronics & Gadgets
  { id: 'Laptop', nameAr: 'لابتوب وكمبيوتر', nameEn: 'Laptops', icon: Laptop },
  { id: 'Headphones', nameAr: 'سماعات وصوتيات', nameEn: 'Headphones', icon: Headphones },
  { id: 'Speaker', nameAr: 'مكبرات صوت (صب)', nameEn: 'Speakers', icon: Speaker },
  { id: 'Camera', nameAr: 'كاميرات وتصوير', nameEn: 'Cameras', icon: Camera },
  { id: 'Tv', nameAr: 'شاشات وتلفزيونات', nameEn: 'TVs & Screens', icon: Tv },
  { id: 'BatteryCharging', nameAr: 'شواحن وباور بانك', nameEn: 'Chargers & Power', icon: BatteryCharging },
  { id: 'Cpu', nameAr: 'معالجات وإلكترونيات دقيقة', nameEn: 'Processors & Tech', icon: Cpu },

  // Home & Kitchen
  { id: 'Home', nameAr: 'أدوات وأجهزة منزلية', nameEn: 'Home Appliances', icon: Home },
  { id: 'Flame', nameAr: 'أجهزة طبخ ومطابخ', nameEn: 'Cooking Appliances', icon: Flame },
  { id: 'Utensils', nameAr: 'أدوات مائدة ومطبخ', nameEn: 'Kitchen Utensils', icon: Utensils },
  { id: 'Coffee', nameAr: 'ماكينات قهوة ومشروبات', nameEn: 'Coffee Makers', icon: Coffee },

  // Fashion & Apparel
  { id: 'Shirt', nameAr: 'ملابس وأزياء', nameEn: 'Fashion & Apparel', icon: Shirt },
  { id: 'ShoppingBag', nameAr: 'حقائب وتسوق', nameEn: 'Bags & Shopping', icon: ShoppingBag },
  { id: 'Watch', nameAr: 'ساعات فاخرة وذكية', nameEn: 'Watches', icon: Watch },
  { id: 'Glasses', nameAr: 'نظارات وإكسسوارات', nameEn: 'Eyewear & Accessories', icon: Glasses },

  // Perfumes & Beauty & Care
  { id: 'Sparkles', nameAr: 'عطور ومستحضرات تجميل', nameEn: 'Perfumes & Beauty', icon: Sparkles },
  { id: 'HeartPulse', nameAr: 'عناية وصحة شخصية', nameEn: 'Personal Care & Health', icon: HeartPulse },
  { id: 'Scissors', nameAr: 'ماكينات حلاقة وعناية رجالي', nameEn: 'Grooming & Shaving', icon: Scissors },
  { id: 'Heart', nameAr: 'منتجات مفضلة ورعاية', nameEn: 'Care & Wellness', icon: Heart },

  // Sports & Outdoor
  { id: 'Dumbbell', nameAr: 'أدوات لياقة وجيم', nameEn: 'Fitness & Gym', icon: Dumbbell },
  { id: 'Bike', nameAr: 'دراجات ورياضة', nameEn: 'Bikes & Sports', icon: Bike },

  // General & Delivery
  { id: 'Truck', nameAr: 'شحن وتوصيل', nameEn: 'Shipping & Delivery', icon: Truck },
  { id: 'Package', nameAr: 'طرود وهدايا مجمعة', nameEn: 'Packages & Bundles', icon: Package },
  { id: 'Gift', nameAr: 'عروض وهدايا ترويجية', nameEn: 'Gifts & Promos', icon: Gift },
  { id: 'Tag', nameAr: 'عروض وتخفيضات عامة', nameEn: 'Special Offers', icon: Tag },
  { id: 'Layers', nameAr: 'تصنيفات متعددة', nameEn: 'Categories', icon: Layers },
  { id: 'Grid', nameAr: 'كتالوج شامل', nameEn: 'General Catalog', icon: Grid }
];

export const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  Camera,
  Tv,
  BatteryCharging,
  Cpu,
  Home,
  Flame,
  Utensils,
  Coffee,
  Shirt,
  ShoppingBag,
  Watch,
  Glasses,
  Sparkles,
  HeartPulse,
  Scissors,
  Heart,
  Dumbbell,
  Bike,
  Truck,
  Package,
  Gift,
  Tag,
  Layers,
  Grid,
  Shield,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Clock,
  Award,
  Zap,
  CheckCircle2
};

export const renderDynamicIcon = (iconName: string, props: LucideProps = {}) => {
  const IconComponent = ICON_MAP[iconName] || Tag;
  return <IconComponent {...props} />;
};
