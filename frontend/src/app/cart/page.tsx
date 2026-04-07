'use client';

import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import Link from 'next/link';
import Icon from '@/components/Icon';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, isAuthenticated } = useStore();

  const total = getCartTotal();
  const deliveryFee = total >= 200 ? 0 : 29.9;
  const grandTotal = total + deliveryFee;
  const freeDeliveryRemaining = 200 - total;

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="shopping_bag" className="text-slate-400 text-3xl" />
        </div>
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Sepetiniz Boş</h2>
        <p className="text-slate-500 mb-6">Hadi alışverişe başlayalım!</p>
        <Link href="/products" className="btn-primary inline-block">
          Ürünlere Göz At
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">Sepetim</h1>
        <p className="text-slate-500">Taze ve doğal ürünler kapınıza gelmeye hazır.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          {freeDeliveryRemaining > 0 && (
            <div className="bg-secondary-container/20 p-4 rounded-xl flex items-start gap-3">
              <Icon name="info" className="text-secondary" />
              <p className="text-xs text-on-secondary-container leading-relaxed">
                Ücretsiz teslimat için <strong>{formatPrice(freeDeliveryRemaining)} TL</strong> daha ekleyin!
              </p>
            </div>
          )}
          {freeDeliveryRemaining <= 0 && (
            <div className="bg-secondary-container/20 p-4 rounded-xl flex items-start gap-3">
              <Icon name="info" className="text-secondary" />
              <p className="text-xs text-on-secondary-container leading-relaxed">
                Tebrikler! Ücretsiz teslimat hakkı kazandınız. <strong>Harika seçim!</strong>
              </p>
            </div>
          )}

          {cartItems.map((item) => (
            <div key={item.productId} className="bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:scale-[1.01] transition-transform duration-300">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="shopping_bag" className="text-slate-300 text-2xl" />
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-1 block">{item.unit}</span>
                <h3 className="text-xl font-headline font-bold">{item.name}</h3>
                <p className="text-sm text-slate-500">{formatPrice(item.price)} TL / {item.unit}</p>
              </div>

              <div className="flex items-center space-x-4 bg-surface-container-low rounded-full px-4 py-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="text-primary hover:bg-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  <Icon name="remove" size={16} />
                </button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.stockQuantity}
                  className="text-primary hover:bg-white rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:text-slate-300"
                >
                  <Icon name="add" size={16} />
                </button>
              </div>

              <div className="text-right min-w-[80px]">
                <p className="text-lg font-black text-on-surface">{formatPrice(item.price * item.quantity)} TL</p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-xs text-error font-medium hover:underline mt-1"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-4 sticky top-28">
          <div className="bg-surface-container-low rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-headline font-bold tracking-tight mb-4">Sipariş Özeti</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Ara Toplam</span>
                <span className="font-semibold text-on-surface">{formatPrice(total)} TL</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Kargo Ücreti</span>
                <span className={`font-semibold ${deliveryFee === 0 ? 'text-secondary' : 'text-on-surface'}`}>
                  {deliveryFee === 0 ? 'Bedava' : `${formatPrice(deliveryFee)} TL`}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
              <span className="text-lg font-bold">Toplam</span>
              <div className="text-right">
                <p className="text-3xl font-black text-primary leading-none">{formatPrice(grandTotal)} TL</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">KDV Dahil</p>
              </div>
            </div>

            {isAuthenticated ? (
              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 rounded-full text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Alışverişi Tamamla
                <Icon name="arrow_forward" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 rounded-full text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Satın Almak İçin Giriş Yap
                <Icon name="arrow_forward" />
              </Link>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <Icon name="lock" className="text-slate-400 text-xl" />
              <p className="text-[10px] text-slate-400 text-center max-w-[200px]">
                Güvenli ödeme altyapısı ile bilgileriniz 256-bit SSL koruması altındadır.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
