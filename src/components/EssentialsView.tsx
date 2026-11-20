import { useMemo, useState } from 'react';
import { Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { Product, ProductCategory } from '../types/campus';
import { ProductCard } from './ProductCard';

interface EssentialsViewProps {
  products: Product[];
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (category: ProductCategory | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  getProductQuantity: (productId: string) => number;
  onAddToCart: (productId: string) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onInspectProduct: (product: Product) => void;
}

type SortOption = 'recommended' | 'price_asc' | 'price_desc';

const CATEGORY_TABS: (ProductCategory | 'All')[] = [
  'All',
  ProductCategory.STATIONERY,
  ProductCategory.SNACKS,
  ProductCategory.PERSONAL_CARE,
  ProductCategory.MEDICINES,
];

export function EssentialsView({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  getProductQuantity,
  onAddToCart,
  onUpdateQty,
  onInspectProduct,
}: EssentialsViewProps) {
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const allCategoryMatchesCount = useMemo(() => {
    if (!trimmedQuery) return products.length;
    return products.filter((product) => {
      if (availableOnly && !product.available) return false;
      const hay =
        `${product.name} ${product.category} ${product.description} ${product.unit}`.toLowerCase();
      return hay.includes(trimmedQuery);
    }).length;
  }, [products, availableOnly, trimmedQuery]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
      if (availableOnly && !product.available) return false;
      if (trimmedQuery) {
        const hay =
          `${product.name} ${product.category} ${product.description} ${product.unit}`.toLowerCase();
        if (!hay.includes(trimmedQuery)) return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, selectedCategory, availableOnly, trimmedQuery, sortBy]);

  const showOtcDisclaimer =
    selectedCategory === 'All' || selectedCategory === ProductCategory.MEDICINES;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="pb-8 border-b border-[#E8E2F4]">
        <p className="text-xs font-semibold text-[#0369A1]">DBS Global University Catalog</p>
        <div className="mt-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#2A1254] tracking-tight">
              Everyday Student Essentials
            </h1>
            <p className="text-sm text-[#52476A] mt-2 max-w-2xl leading-relaxed">
              Browse stationery, snacks, personal care, and basic first-aid supplies stocked with
              campus-friendly prices in Indian Rupees (₹).
            </p>
          </div>
          <p className="text-xs font-medium text-[#6B5E84] tabular-nums shrink-0">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      {/* Category Filter Bar + Search & Sort Controls */}
      <div className="py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F5F2FB] rounded-xl border border-[#E8E2F4] w-full lg:w-fit">
          {CATEGORY_TABS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#3B1D6E] text-white shadow-xs'
                    : 'text-[#52476A] hover:text-[#2A1254] hover:bg-white/80'
                }`}
              >
                {cat === 'All' ? 'All Essentials' : cat}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7A6F93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notebooks, noodles, bandages, shampoo..."
              aria-label="Search products"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#DDD4F2] bg-white text-sm text-[#1A132B] placeholder:text-[#8E82A6] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7A6F93] hover:text-[#2A1254] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & Availability Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#453B5E] cursor-pointer select-none px-3 py-2 rounded-xl border border-[#E4DCF4] bg-white hover:bg-[#FAF8FE]">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-[#C8BCE4] text-[#3B1D6E] focus:ring-[#3B1D6E]"
              />
              <span className="whitespace-nowrap">In stock only</span>
            </label>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E4DCF4] bg-white">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B5E84]" />
              <label htmlFor="product-sort" className="sr-only">
                Sort products
              </label>
              <select
                id="product-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs sm:text-sm text-[#2A1254] font-medium bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="recommended">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
        {trimmedQuery && selectedCategory !== 'All' && allCategoryMatchesCount > filteredProducts.length && (
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-[#52476A]">
            <span>
              Filtering &ldquo;{searchQuery.trim()}&rdquo; within <strong>{selectedCategory}</strong>.
            </span>
            <button
              type="button"
              onClick={() => onSelectCategory('All')}
              className="font-semibold text-[#3B1D6E] hover:underline cursor-pointer"
            >
              Show all {allCategoryMatchesCount} matches across all categories
            </button>
          </div>
        )}
      </div>

      {/* Responsible OTC Medicines Notice */}
      {showOtcDisclaimer && (
        <div className="mb-7 rounded-2xl bg-[#EEF8FF] border border-[#CBE7FA] px-5 py-3.5 flex items-start gap-3 text-xs sm:text-sm text-[#0C4A6E]">
          <ShieldCheck className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">Medicines &amp; First-Aid Policy:</strong> CampusEase
            lists only basic first-aid supplies, bandages, antiseptics, and permitted
            over-the-counter essentials. Prescription medicines are never supplied without licensed
            medical and pharmacy verification.
          </p>
        </div>
      )}

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E2F4] bg-[#FAF8FE] py-16 px-6 text-center">
          <h2 className="font-display text-lg font-bold text-[#2A1254]">
            No matching essentials found
          </h2>
          <p className="text-sm text-[#655A7C] mt-2 max-w-md mx-auto">
            {selectedCategory !== 'All' && allCategoryMatchesCount > 0
              ? `No matches in ${selectedCategory}, but ${allCategoryMatchesCount} matching products exist across other categories.`
              : 'Try clearing your search term or switching back to all product categories.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {selectedCategory !== 'All' && allCategoryMatchesCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectCategory('All')}
                className="px-5 py-2.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Search All Categories ({allCategoryMatchesCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setAvailableOnly(false);
                onSelectCategory('All');
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                selectedCategory !== 'All' && allCategoryMatchesCount > 0
                  ? 'border border-[#DDD4F2] bg-white hover:bg-[#F7F5FC] text-[#2A1254]'
                  : 'bg-[#3B1D6E] hover:bg-[#2A1254] text-white'
              }`}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getProductQuantity(product.id)}
              onAdd={onAddToCart}
              onUpdateQty={onUpdateQty}
              onInspect={onInspectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
