'use client';

import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountedPrice: number | null;
  effectivePrice: number;
  vatRate: number | null;
  priceIncludesVat: boolean;
  unit: string;
  stockQuantity: number;
  inStock: boolean;
  imageUrl: string | null;
  categoryName: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cartItems } = useStore();
  const cartItem = cartItems.find((i) => i.productId === product.id);
  const cartQty = cartItem?.quantity || 0;
  const remaining = product.stockQuantity - cartQty;

  const handleAddToCart = () => {
    const success = addToCart({
      productId: product.id,
      name: product.name,
      price: product.effectivePrice,
      quantity: 1,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || undefined,
      unit: product.unit,
    });
    if (success) {
      toast.success(`${product.name} sepete eklendi`);
    } else {
      toast.error(`Stok yetersiz! (Stok: ${product.stockQuantity})`);
    }
  };

  const discountPercent = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-300">
              <FiShoppingCart size={32} />
            </div>
          )}
        </div>
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded">
            %{discountPercent}
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded">Tükendi</span>
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">
          {product.categoryName}
        </span>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-orange-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-end gap-1.5 mb-1">
            {product.discountedPrice ? (
              <>
                <span className="text-lg font-black text-brand-orange-600 leading-none">
                  {formatPrice(product.discountedPrice)}
                  <span className="text-xs font-bold ml-0.5">TL</span>
                </span>
                <span className="text-xs text-gray-400 line-through leading-none mb-0.5">
                  {formatPrice(product.price)} TL
                </span>
              </>
            ) : (
              <span className="text-lg font-black text-gray-900 leading-none">
                {formatPrice(product.price)}
                <span className="text-xs font-bold ml-0.5">TL</span>
              </span>
            )}
            <span className="text-[10px] text-gray-400 leading-none mb-0.5">/ {product.unit}</span>
          </div>

          {/* Stok bilgisi */}
          <div className="flex items-center justify-between mb-2">
            {product.priceIncludesVat && product.vatRate != null && (
              <span className="text-[10px] text-gray-300">KDV %{product.vatRate} dahil</span>
            )}
            {product.inStock && (
              <span className={`text-[11px] font-medium ${remaining <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                {remaining <= 0 ? 'Sepette maks.' : remaining <= 5 ? `Son ${remaining} ${product.unit}` : `Stok: ${product.stockQuantity}`}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || remaining <= 0}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              product.inStock && remaining > 0
                ? 'bg-brand-orange-500 text-white hover:bg-brand-orange-600 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {!product.inStock ? 'Tükendi' : remaining <= 0 ? 'Stok doldu' : (
              <>
                <FiPlus size={16} strokeWidth={2.5} />
                Sepete Ekle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
