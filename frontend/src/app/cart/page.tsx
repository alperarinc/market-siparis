'use client';

import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, isAuthenticated } = useStore();

  const total = getCartTotal();
  const deliveryFee = total >= 200 ? 0 : 29.9;
  const grandTotal = total + deliveryFee;
  const freeDeliveryRemaining = 200 - total;
  const freeDeliveryProgress = Math.min((total / 200) * 100, 100);

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShoppingBag className="text-gray-400" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Sepetiniz Boş</h2>
        <p className="text-gray-500 mb-6">Hadi alışverişe başlayalım!</p>
        <Link href="/products" className="inline-block bg-brand-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-orange-600 transition">
          Ürünlere Göz At
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sepet Ürünleri */}
      <div className="lg:col-span-2 space-y-3">
        <h1 className="text-xl font-bold mb-2">Sepetim ({cartItems.length} ürün)</h1>

        {freeDeliveryRemaining > 0 && (
          <div className="bg-brand-orange-50 rounded-lg p-4 mb-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-brand-orange-700 font-medium">
                Ücretsiz teslimat için <strong>{formatPrice(freeDeliveryRemaining)} TL</strong> daha ekleyin
              </span>
              <span className="text-brand-orange-500 font-bold text-xs">{freeDeliveryProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-brand-orange-100 rounded-full h-2">
              <div className="bg-brand-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${freeDeliveryProgress}%` }} />
            </div>
          </div>
        )}
        {freeDeliveryRemaining <= 0 && (
          <div className="bg-green-50 rounded-lg p-3 text-green-700 font-medium text-sm">
            Tebrikler! Ücretsiz teslimat hakkı kazandınız.
          </div>
        )}

        {cartItems.map((item) => (
          <div key={item.productId} className="bg-white rounded-lg p-4 flex items-center gap-4 border border-gray-100">
            <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <FiShoppingBag className="text-gray-300" size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
              <p className="text-brand-orange-600 font-bold text-sm">{formatPrice(item.price)} TL / {item.unit}</p>
              {item.quantity >= item.stockQuantity && (
                <p className="text-[10px] text-red-500 font-medium">Maks. stok</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-brand-orange-50 hover:text-brand-orange-600 transition">
                <FiMinus size={16} />
              </button>
              <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stockQuantity}
                className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-brand-orange-50 hover:text-brand-orange-600 disabled:text-gray-300 disabled:hover:bg-gray-100 transition">
                <FiPlus size={16} />
              </button>
            </div>
            <p className="font-bold text-gray-800 w-20 text-right text-sm">
              {formatPrice(item.price * item.quantity)} TL
            </p>
            <button onClick={() => removeFromCart(item.productId)}
              className="text-gray-300 hover:text-red-500 p-1.5 transition">
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Sipariş Özeti */}
      <div className="bg-white rounded-lg p-6 h-fit lg:sticky lg:top-24 border border-gray-100">
        <h2 className="text-lg font-bold mb-4">Sipariş Özeti</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Ara Toplam</span>
            <span className="font-medium">{formatPrice(total)} TL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Teslimat</span>
            <span className={deliveryFee === 0 ? 'text-green-600 font-bold' : 'font-medium'}>
              {deliveryFee === 0 ? 'Ücretsiz' : `${formatPrice(deliveryFee)} TL`}
            </span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between text-lg font-extrabold">
            <span>Toplam</span>
            <span className="text-brand-orange-600">{formatPrice(grandTotal)} TL</span>
          </div>
        </div>

        {isAuthenticated ? (
          <Link
            href="/checkout"
            className="w-full bg-brand-orange-500 text-white py-3.5 rounded-lg font-bold mt-5 block text-center hover:bg-brand-orange-600 transition"
          >
            Siparişi Tamamla
          </Link>
        ) : (
          <Link
            href="/login"
            className="w-full bg-brand-orange-500 text-white py-3.5 rounded-lg font-bold mt-5 block text-center hover:bg-brand-orange-600 transition"
          >
            Satın Almak İçin Giriş Yap
          </Link>
        )}
      </div>
    </div>
  );
}
