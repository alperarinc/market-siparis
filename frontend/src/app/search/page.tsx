'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/lib/api';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import Icon from '@/components/Icon';

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
        <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="search" className="text-primary text-3xl" />
        </div>
        <h2 className="text-xl font-headline font-bold text-on-surface">Aradiginiz ürünü yazin</h2>
        <p className="text-sm text-on-surface-variant mt-1">Meyve, sebze, et, süt ürünleri...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-black tracking-tight text-on-surface mb-2">
          &ldquo;{query}&rdquo; icin sonuclar
        </h1>
        <p className="text-slate-500">{products.length > 0 ? `${products.length} ürün bulundu` : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-4xl">
          <Icon name="search_off" className="text-slate-300 text-6xl mb-4" />
          <h2 className="text-xl font-headline font-bold text-on-surface mb-2">Sonuc bulunamadi</h2>
          <p className="text-on-surface-variant text-sm">Farkli bir arama terimi deneyin</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <footer className="mt-20 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary-container transition-all disabled:opacity-40"
              >
                <Icon name="chevron_left" />
              </button>
              <span className="px-4 py-2 text-sm text-slate-500 font-headline font-bold">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary-container transition-all disabled:opacity-40"
              >
                <Icon name="chevron_right" />
              </button>
            </footer>
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
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
