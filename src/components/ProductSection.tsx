import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, PackageX } from 'lucide-react';

export const ProductSection: React.FC = () => {
  const { products, selectedCategory, searchQuery, setSelectedCategory, setSearchQuery } = useStore();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = !onlyInStock || p.inStock;
    return matchesCategory && matchesSearch && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'electronics': return 'الإلكترونيات والذكاء';
      case 'fashion': return 'الملابس والأزياء';
      case 'perfumes': return 'العطور الفاخرة';
      case 'home': return 'الأدوات والأجهزة المنزلية';
      case 'personal-care': return 'العناية والأدوات الشخصية';
      default: return 'جميع المنتجات المتوفرة';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Section Header & Filters Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-black flex items-center gap-2">
            <span className="w-2.5 h-6 bg-brand-gold rounded-full inline-block"></span>
            {getCategoryTitle()}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            عرض {sortedProducts.length} من أصل {products.length} منتج في مرتفعات ستور
          </p>
        </div>

        {/* Sorting and stock filter */}
        <div className="flex items-center gap-3">
          
          {/* Stock toggle */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-brand-gold focus:ring-brand-gold"
            />
            <span>المتوفر فقط بالمخزون</span>
          </label>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-goldDark" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="featured">المميز والأكثر طلباً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 max-w-md mx-auto">
          <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">لم نجد أي منتجات تطابق بحثك</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            جرب كتابة اسم منتج آخر أو اختر قسماً مختلفاً
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyInStock(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-black text-white text-xs font-bold hover:bg-brand-gold hover:text-black transition-colors"
          >
            عرض كافة منتجات المتجر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
