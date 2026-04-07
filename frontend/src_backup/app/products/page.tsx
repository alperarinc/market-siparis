'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getProductsByCategory, getCategories } from '@/lib/api';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import { FiGrid } from 'react-icons/fi';

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

  // Kategorileri yükle
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // URL değişince kategoriyi güncelle
  useEffect(() => {
    const catId = categoryParam ? parseInt(categoryParam) : null;
    setSelectedCategory(catId);
    setPage(0);
  }, [categoryParam]);

  // Ürünleri yükle
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
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-brand-orange-50 rounded-xl flex items-center justify-center">
          <FiGrid className="text-brand-orange-500" size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {activeCategoryName || 'Tüm Ürünler'}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-400">{products.length} ürün listeleniyor</p>
          )}
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-orange-500 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-semibold text-gray-700">Bu kategoride ürün bulunamadı</p>
          <p className="text-sm text-gray-400 mt-1">Başka bir kategori seçmeyi deneyin</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-brand-orange-300 transition"
              >
                Önceki
              </button>
              <span className="px-4 py-2 text-sm text-gray-500 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-brand-orange-300 transition"
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
