'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Icon from '@/components/Icon';

export default function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart, cartItems } = useStore();
  const cartItem = cartItems.find((i) => i.productId === product.id);
  const cartQty = cartItem?.quantity || 0;
  const remaining = product.stockQuantity - cartQty;
  const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean);
  const discountPercent = product.discountedPrice ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (quantity > remaining) { toast.error(`Stok yetersiz! Eklenebilecek: ${remaining} ${product.unit}`); return; }
    const success = addToCart({ productId: product.id, name: product.name, price: product.effectivePrice, quantity, stockQuantity: product.stockQuantity, imageUrl: product.imageUrl || undefined, unit: product.unit });
    if (success) { toast.success(`${product.name} sepete eklendi`); setQuantity(1); }
    else { toast.error(`Stok yetersiz! (Stok: ${product.stockQuantity})`); }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm text-slate-500 font-medium">
        <Link className="hover:text-primary transition-colors" href="/">Ana Sayfa</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link className="hover:text-primary transition-colors" href="/products">Ürünler</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link className="hover:text-primary transition-colors" href={`/products?category=${product.categoryId}`}>{product.categoryName}</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product Visuals */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="col-span-2 relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-low group">
            {allImages.length > 0 ? (
              <img
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={allImages[selectedImage]}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="shopping_cart" className="text-slate-300 text-6xl" />
              </div>
            )}
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-error text-white px-3 py-1 rounded-full text-xs font-bold">
                %{discountPercent} Indirim
              </div>
            )}
            {product.categoryName && (
              <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {product.categoryName}
              </div>
            )}
          </div>
          {allImages.length > 1 && allImages.slice(1, 3).map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i + 1)}
              className={`aspect-square rounded-xl overflow-hidden bg-surface-container-low ${selectedImage === i + 1 ? 'ring-2 ring-primary' : ''}`}
            >
              <img alt="" className="w-full h-full object-cover" src={img} />
            </button>
          ))}
        </div>

        {/* Product Details */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-headline font-black text-on-surface leading-tight mb-2">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-secondary font-semibold flex items-center gap-2">
                  <Icon name="eco" filled className="text-secondary" />
                  {product.brand}
                  {product.origin && ` · ${product.origin}`}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-headline font-bold text-primary">
                {formatPrice(product.effectivePrice)} TL
              </span>
              {product.discountedPrice && (
                <span className="text-on-surface-variant line-through text-lg">
                  {formatPrice(product.price)} TL
                </span>
              )}
            </div>

            {/* Stock info */}
            <div>
              {product.inStock ? (
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${remaining <= 5 ? 'text-error' : 'text-secondary'}`}>
                    <span className={`w-2 h-2 rounded-full ${remaining <= 5 ? 'bg-error' : 'bg-secondary'}`} />
                    {remaining <= 0 ? 'Sepette maksimuma ulasildi' : remaining <= 5 ? `Son ${remaining} ${product.unit} kaldi` : `Stokta: ${product.stockQuantity} ${product.unit}`}
                  </span>
                  {cartQty > 0 && <span className="text-xs text-slate-400">(Sepette: {cartQty})</span>}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-error">
                  <span className="w-2 h-2 rounded-full bg-error" />Tükendi
                </span>
              )}
            </div>

            {/* Add to Cart */}
            {product.inStock && remaining > 0 && (
              <div className="bg-surface-container-low p-6 rounded-xl space-y-6">
                <div className="flex gap-3">
                  <div className="flex items-center bg-white rounded-full border border-outline-variant px-4 py-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-primary hover:bg-primary/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Icon name="remove" />
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(remaining, quantity + 1))}
                      disabled={quantity >= remaining}
                      className="text-primary hover:bg-primary/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:text-slate-300"
                    >
                      <Icon name="add" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Icon name="shopping_cart" />
                    Sepete Ekle
                  </button>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-4">
                <h3 className="text-lg font-headline font-bold border-b border-surface-container-high pb-2">Ürün Hikayesi</h3>
                <p className="text-on-surface-variant leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-surface-container-high">
                <Icon name="nest_eco_leaf" className="text-secondary" />
                <div className="text-xs">
                  <p className="font-bold">Sürdürülebilir</p>
                  <p className="text-on-surface-variant">Toprak Dostu</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-surface-container-high">
                <Icon name="local_shipping" className="text-primary" />
                <div className="text-xs">
                  <p className="font-bold">Hizli Teslimat</p>
                  <p className="text-on-surface-variant">24 Saatte Kapinda</p>
                </div>
              </div>
            </div>

            {/* Product Details Table */}
            <div className="space-y-3">
              {product.weightInfo && (
                <div className="flex justify-between items-center border-b border-surface-variant pb-2 text-sm">
                  <span className="text-on-surface-variant">Agirlik</span>
                  <span className="font-bold">{product.weightInfo}</span>
                </div>
              )}
              {product.unit && (
                <div className="flex justify-between items-center border-b border-surface-variant pb-2 text-sm">
                  <span className="text-on-surface-variant">Birim</span>
                  <span className="font-bold">{product.unit}</span>
                </div>
              )}
              {product.barcode && (
                <div className="flex justify-between items-center border-b border-surface-variant pb-2 text-sm">
                  <span className="text-on-surface-variant">Barkod</span>
                  <span className="font-bold font-mono">{product.barcode}</span>
                </div>
              )}
              {product.vatRate != null && (
                <div className="flex justify-between items-center border-b border-surface-variant pb-2 text-sm">
                  <span className="text-on-surface-variant">KDV Orani</span>
                  <span className="font-bold">%{product.vatRate}</span>
                </div>
              )}
            </div>

            {product.storageConditions && (
              <div className="bg-surface-container-low p-4 rounded-xl">
                <h4 className="font-bold text-sm mb-1">Saklama Kosullari</h4>
                <p className="text-sm text-on-surface-variant">{product.storageConditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
