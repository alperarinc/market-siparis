'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getProductsByCategory, getCategories } from '@/lib/api';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/Icon';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const catId = categoryParam ? parseInt(categoryParam) : null;
    setSelectedCategory(catId);
    setPage(0);
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    const fetch = selectedCategory
      ? getProductsByCategory(selectedCategory, page)
      : getProducts(page);

    fetch
      .then((res) => {
        setProducts(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
      })
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory, page]);

  const handleCategoryChange = (catId: number | null) => {
    if (catId) {
      router.push(`/products?category=${catId}`);
    } else {
      router.push('/products');
    }
  };

  const activeCategoryName = categories.find((c: any) => c.id === selectedCategory)?.name;

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="sticky top-28 space-y-8">
          <section>
            <h3 className="font-headline font-bold text-lg mb-4 text-on-surface">Kategoriler</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm transition-all ${
                  !selectedCategory
                    ? 'bg-green-100/50 text-green-800 font-semibold translate-x-1'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon name="grid_view" /> Tüm Ürünler
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-body text-sm transition-all text-left ${
                    selectedCategory === cat.id
                      ? 'bg-green-100/50 text-green-800 font-semibold translate-x-1'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.icon || '📦'}</span> {cat.name}
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="mb-10">
          <h1 className="font-headline font-black text-4xl md:text-5xl text-on-surface tracking-tight mb-2">
            {activeCategoryName || 'Tüm Ürünler'}
          </h1>
          {!loading && (
            <p className="text-slate-500 max-w-xl font-body leading-relaxed">
              {products.length} ürün listeleniyor
            </p>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="inventory_2" className="text-slate-300 text-6xl mb-4" />
            <p className="font-headline font-bold text-slate-600">Bu kategoride ürün bulunamadı</p>
            <p className="text-sm text-slate-400 mt-1">Başka bir kategori seçmeyi deneyin</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <footer className="mt-20 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-40"
                >
                  <Icon name="chevron_left" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-12 h-12 rounded-full font-headline font-bold transition-all ${
                      page === i
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-primary-container'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-40"
                >
                  <Icon name="chevron_right" />
                </button>
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
