'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/lib/api';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import { FiSearch } from 'react-icons/fi';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchProducts(query, page)
      .then((res) => {
        setProducts(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
      })
      .catch((err: any) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [query, page]);

  if (!query.trim()) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-brand-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiSearch className="text-brand-orange-500" size={32} />
        </div>
        <h2 className="text-xl text-gray-600 font-semibold">Aradığınız ürünü yazın</h2>
        <p className="text-sm text-gray-400 mt-1">Meyve, sebze, et, süt ürünleri...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-orange-50 rounded-xl flex items-center justify-center">
          <FiSearch className="text-brand-orange-500" size={18} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">&ldquo;{query}&rdquo; için sonuçlar</h1>
          <p className="text-sm text-gray-400">{products.length > 0 ? `${products.length} ürün bulundu` : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange-100 border-t-brand-orange-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-5xl mb-4">😔</p>
          <h2 className="text-xl text-gray-600 mb-2 font-semibold">Sonuç bulunamadı</h2>
          <p className="text-gray-400 text-sm">Farklı bir arama terimi deneyin</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-brand-orange-300 transition">
                ← Önceki
              </button>
              <span className="px-4 py-2 text-sm text-gray-500 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold disabled:opacity-40 hover:border-brand-orange-300 transition">
                Sonraki →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange-100 border-t-brand-orange-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
