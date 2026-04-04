'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FiPlus, FiMinus, FiShoppingCart, FiPackage, FiMapPin, FiInfo, FiShield } from 'react-icons/fi';

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
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600 transition">Anasayfa</Link><span>/</span>
        <Link href="/products" className="hover:text-gray-600 transition">Ürünler</Link><span>/</span>
        <Link href={`/products?category=${product.categoryId}`} className="hover:text-gray-600 transition">{product.categoryName}</Link><span>/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center relative">
            {allImages.length > 0 ? <img src={allImages[selectedImage]} alt={product.name} className="w-full h-full object-contain p-4" /> : <div className="text-gray-300 flex flex-col items-center gap-2"><FiShoppingCart size={48} /><span className="text-sm">Görsel yok</span></div>}
            {discountPercent > 0 && <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">%{discountPercent} İndirim</div>}
            {!product.inStock && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><span className="bg-gray-900 text-white font-bold px-4 py-2 rounded-lg">Tükendi</span></div>}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3">{allImages.map((img: string, i: number) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden transition ${selectedImage === i ? 'border-brand-orange-500' : 'border-gray-200'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>
            ))}</div>
          )}
        </div>

        <div>
          <span className="text-xs text-brand-orange-500 font-semibold uppercase tracking-wider">{product.categoryName}</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{product.name}</h1>
          {product.brand && <p className="text-sm text-gray-500 mb-4">Marka: <span className="font-medium text-gray-700">{product.brand}</span>{product.origin && <> · Menşei: <span className="font-medium text-gray-700">{product.origin}</span></>}</p>}

          <div className="bg-gray-50 rounded-xl p-5 mb-5">
            <div className="flex items-end gap-3 mb-1">
              {product.discountedPrice ? (<><span className="text-3xl font-black text-brand-orange-600">{formatPrice(product.discountedPrice)} <span className="text-lg">TL</span></span><span className="text-lg text-gray-400 line-through">{formatPrice(product.price)} TL</span></>) : (<span className="text-3xl font-black text-gray-900">{formatPrice(product.price)} <span className="text-lg">TL</span></span>)}
            </div>
            <p className="text-xs text-gray-400">{product.unit} başına fiyat{product.priceIncludesVat && product.vatRate != null && ` · KDV %${product.vatRate} dahil`}</p>
          </div>

          <div className="mb-4">
            {product.inStock ? (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${remaining <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${remaining <= 5 ? 'bg-red-500' : 'bg-green-500'}`} />
                  {remaining <= 0 ? 'Sepette maksimuma ulaşıldı' : remaining <= 5 ? `Son ${remaining} ${product.unit} kaldı` : `Stokta: ${product.stockQuantity} ${product.unit}`}
                </span>
                {cartQty > 0 && <span className="text-xs text-gray-400">(Sepette: {cartQty})</span>}
              </div>
            ) : <span className="inline-flex items-center gap-1 text-sm font-medium text-red-500"><span className="w-2 h-2 rounded-full bg-red-500" />Tükendi</span>}
          </div>

          {product.inStock && remaining > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-brand-orange-600 transition"><FiMinus size={16} /></button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(remaining, quantity + 1))} disabled={quantity >= remaining} className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-brand-orange-600 disabled:text-gray-300 transition"><FiPlus size={16} /></button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-brand-orange-500 text-white py-3 rounded-lg font-bold hover:bg-brand-orange-600 transition flex items-center justify-center gap-2"><FiShoppingCart size={18} />Sepete Ekle ({quantity} {product.unit})</button>
            </div>
          )}

          <div className="space-y-4">
            {product.description && <div className="bg-white rounded-xl border border-gray-100 p-5"><h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FiInfo size={16} className="text-brand-orange-500" />Ürün Açıklaması</h3><p className="text-sm text-gray-600 leading-relaxed">{product.description}</p></div>}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FiPackage size={16} className="text-brand-orange-500" />Ürün Detayları</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {product.brand && <div><span className="text-gray-400">Marka</span><p className="font-medium text-gray-800">{product.brand}</p></div>}
                {product.origin && <div><span className="text-gray-400">Menşei</span><p className="font-medium text-gray-800">{product.origin}</p></div>}
                {product.weightInfo && <div><span className="text-gray-400">Ağırlık / Miktar</span><p className="font-medium text-gray-800">{product.weightInfo}</p></div>}
                <div><span className="text-gray-400">Birim</span><p className="font-medium text-gray-800">{product.unit}</p></div>
                {product.barcode && <div><span className="text-gray-400">Barkod</span><p className="font-medium text-gray-800 font-mono">{product.barcode}</p></div>}
                {product.vatRate != null && <div><span className="text-gray-400">KDV Oranı</span><p className="font-medium text-gray-800">%{product.vatRate}</p></div>}
              </div>
            </div>
            {product.storageConditions && <div className="bg-white rounded-xl border border-gray-100 p-5"><h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FiShield size={16} className="text-brand-orange-500" />Saklama Koşulları</h3><p className="text-sm text-gray-600">{product.storageConditions}</p></div>}
            {product.ingredients && <div className="bg-white rounded-xl border border-gray-100 p-5"><h3 className="font-semibold text-gray-900 mb-2">İçindekiler</h3><p className="text-sm text-gray-600">{product.ingredients}</p></div>}
          </div>

          <div className="mt-5 bg-brand-orange-50 rounded-xl p-4 flex items-start gap-3">
            <FiMapPin className="text-brand-orange-500 mt-0.5 shrink-0" size={18} />
            <div className="text-sm"><p className="font-semibold text-brand-orange-800">Tokat Merkez'e Teslimat</p><p className="text-brand-orange-600 text-xs">Siparişleriniz en kısa sürede kapınıza teslim edilir.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
