// src/pages/ProductsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { getProducts } from '@/services/productService';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '@/components/user/ProductCard';

const SORTS = [
  { label: 'Newest', value: 'createdAt-desc' },
  { label: 'Price: Low', value: 'price-asc' },
  { label: 'Price: High', value: 'price-desc' },
  { label: 'Most Popular', value: 'sales-desc' },
  { label: 'Top Rated', value: 'rating-desc' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('createdAt-desc');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    getDocs(collection(db, 'categories')).then(snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortDir] = sort.split('-');
      const { products: prods } = await getProducts({
        category: category || undefined,
        sortBy,
        sortDir,
        pageSize: 40,
      });
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Client-side search + price filter
  const filtered = products.filter(p => {
    const matchSearch = !debouncedSearch ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchSearch && matchPrice;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-sm text-gray-400 mt-1">{filtered.length} products found</p>
        </div>
        <div className="flex-1 flex items-center gap-3 sm:justify-end">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Sort */}
          <select className="input w-auto text-sm" value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {/* Filter toggle */}
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="btn-secondary gap-2">
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        {filtersOpen && (
          <aside className="w-56 flex-shrink-0 space-y-6 animate-slide-in">
            <div className="card p-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Category</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setCategory('')}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!category ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >All Categories</button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.slug)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${category === cat.slug ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span>{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Price Range <span className="text-brand-600 font-normal normal-case">$0 – ${priceRange[1]}</span>
                </h3>
                <input
                  type="range" min={0} max={3000} step={50}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>
          </aside>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-3/4" /><div className="skeleton h-3 w-1/2" /><div className="skeleton h-6 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Search size={40} className="mb-4 opacity-30" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
