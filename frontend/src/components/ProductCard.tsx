'use client';

import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Icon from '@/components/Icon';

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
    <div className="group relative bg-surface-container-lowest rounded-4xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block">
        <div className="aspect-square overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-surface-container-low flex items-center justify-center">
              <Icon name="shopping_cart" className="text-slate-300 text-4xl" />
            </div>
          )}
        </div>
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4">
            <span className="bg-error text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              %{discountPercent}
            </span>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full">Tükendi</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
          {product.categoryName}
        </span>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-headline font-bold text-on-surface text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-end gap-1.5 mb-3">
            {product.discountedPrice ? (
              <>
                <span className="text-primary font-headline font-black text-lg">
                  {formatPrice(product.discountedPrice)} TL
                </span>
                <span className="text-xs text-slate-400 line-through mb-0.5">
                  {formatPrice(product.price)} TL
                </span>
              </>
            ) : (
              <span className="text-primary font-headline font-black text-lg">
                {formatPrice(product.price)} TL
              </span>
            )}
          </div>

          <p className="text-slate-400 text-xs font-medium mb-4">
            {product.unit}
            {product.inStock && remaining <= 5 && remaining > 0 && (
              <span className="text-error ml-2">Son {remaining}</span>
            )}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1">
              <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors text-sm">
                —
              </button>
              <span className="w-6 text-center text-xs font-bold">{cartQty || 1}</span>
              <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary transition-colors text-sm">
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || remaining <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                product.inStock && remaining > 0
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Icon name="add_shopping_cart" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
