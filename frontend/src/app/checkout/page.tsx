'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { createOrder } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, isAuthenticated, clearCart } = useStore();
  const router = useRouter();

  const [address, setAddress] = useState({
    title: 'Ev',
    fullAddress: '',
    district: '',
    city: '',
    buildingNo: '',
    floorNo: '',
    doorNo: '',
    directions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [step, setStep] = useState<'address' | 'payment' | 'confirm'>('address');

  const total = getCartTotal();
  const deliveryFee = total >= 200 ? 0 : 29.9;
  const grandTotal = total + deliveryFee;

  const steps = [
    { key: 'address', label: 'Adres', icon: 'location_on' },
    { key: 'payment', label: 'Kargo', icon: 'local_shipping' },
    { key: 'confirm', label: 'Ödeme', icon: 'payments' },
  ];
  const currentStepIndex = steps.findIndex(s => s.key === step);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-slate-500 mb-4">Siparis vermek icin giris yapin</p>
        <Link href="/login" className="btn-primary inline-block">Giris Yap</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <Icon name="shopping_cart" className="text-slate-300 text-6xl mb-4" />
        <h2 className="text-xl font-headline font-bold text-on-surface mb-4">Sepetiniz bos</h2>
        <Link href="/" className="btn-primary inline-block">Alisverise Basla</Link>
      </div>
    );
  }

  const handleSaveAddress = async () => {
    if (!address.fullAddress.trim()) {
      toast.error('Adres alani zorunludur');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/addresses`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...address, isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        setAddressId(data.data.id);
        setStep('payment');
        toast.success('Adres kaydedildi');
      } else {
        toast.error(data.message || 'Adres kaydedilemedi');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConfirmOrder = async () => {
    if (!addressId) {
      toast.error('Lütfen adres bilgisi girin');
      return;
    }
    setLoading(true);
    try {
      await createOrder({ addressId, paymentMethod, note: note || undefined });
      clearCart();
      toast.success('Siparisiniz alindi!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-surface-container-lowest border-0 focus:ring-2 focus:ring-primary rounded-lg py-3 px-4 transition-all text-sm";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Progress */}
          <nav className="flex items-center gap-4 mb-8">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 ${i <= currentStepIndex ? 'text-primary font-semibold' : 'text-outline'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i <= currentStepIndex ? 'bg-primary text-white' : 'border border-outline'
                  }`}>
                    {i < currentStepIndex ? <Icon name="check" size={16} /> : i + 1}
                  </span>
                  <span className="text-sm hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="h-px w-8 bg-outline-variant/30" />}
              </div>
            ))}
          </nav>

          {/* Address Step */}
          {step === 'address' && (
            <section className="bg-surface-container-low rounded-xl p-8 transition-all">
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-6">Teslimat Adresi</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant">Il</label>
                  <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} placeholder="Istanbul" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant">Ilce</label>
                  <input type="text" value={address.district} onChange={(e) => setAddress({...address, district: e.target.value})} placeholder="Kadiköy" className={inputClass} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant">Adres Basligi</label>
                  <input type="text" value={address.title} onChange={(e) => setAddress({...address, title: e.target.value})} placeholder="Ev, Is vb." className={inputClass} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant">Tam Adres *</label>
                  <textarea value={address.fullAddress} onChange={(e) => setAddress({...address, fullAddress: e.target.value})} placeholder="Sokak, Mahalle, Bina No, Kat, Daire..." rows={3} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant">Bina No</label>
                  <input type="text" value={address.buildingNo} onChange={(e) => setAddress({...address, buildingNo: e.target.value})} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant">Adres Tarifi</label>
                  <input type="text" value={address.directions} onChange={(e) => setAddress({...address, directions: e.target.value})} placeholder="Apartman ismi, yol tarifi..." className={inputClass} />
                </div>
              </form>
              <button onClick={handleSaveAddress} className="w-full mt-6 bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all">
                Devam Et
              </button>
            </section>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <section className="bg-surface-container-low rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-6">Ödeme Secenekleri</h2>
              <div className="space-y-4">
                <div
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`relative flex items-center p-4 rounded-xl bg-surface-container-lowest cursor-pointer transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY' ? 'border-2 border-primary' : 'border-2 border-transparent hover:border-primary-container'
                  }`}
                >
                  <Icon name="local_shipping" className={paymentMethod === 'CASH_ON_DELIVERY' ? 'text-primary mr-4' : 'text-on-surface-variant mr-4'} />
                  <div className="flex-grow">
                    <p className="font-bold text-on-surface">Kapida Ödeme</p>
                    <p className="text-xs text-on-surface-variant">Nakit veya kart ile kapida ödeme</p>
                  </div>
                  {paymentMethod === 'CASH_ON_DELIVERY' && <Icon name="check_circle" className="text-primary" />}
                </div>

                <div
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`flex items-center p-4 rounded-xl bg-surface-container-lowest cursor-pointer transition-all ${
                    paymentMethod === 'CREDIT_CARD' ? 'border-2 border-primary' : 'border-2 border-transparent hover:border-primary-container'
                  }`}
                >
                  <Icon name="credit_card" className={paymentMethod === 'CREDIT_CARD' ? 'text-primary mr-4' : 'text-on-surface-variant mr-4'} />
                  <div className="flex-grow">
                    <p className="font-bold text-on-surface">Online Ödeme</p>
                    <p className="text-xs text-on-surface-variant">Kredi/banka karti (Yakinda)</p>
                  </div>
                  {paymentMethod === 'CREDIT_CARD' && <Icon name="check_circle" className="text-primary" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Siparis Notu (Opsiyonel)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Kapiyi calmayin, meyveleri az olgun secin vb." rows={2} className={inputClass} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="flex-1 py-4 border border-outline-variant rounded-full font-bold text-on-surface-variant hover:bg-surface-container-low transition">
                  Geri
                </button>
                <button onClick={() => setStep('confirm')} className="flex-1 bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all">
                  Devam Et
                </button>
              </div>
            </section>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <section className="bg-surface-container-low rounded-xl p-8 space-y-6">
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight mb-6">Siparis Onayi</h2>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-3 border-b border-surface-variant last:border-0">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.quantity} {item.unit} x {formatPrice(item.price)} TL</p>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)} TL</p>
                  </div>
                ))}
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 text-sm space-y-1.5">
                <p><strong className="text-on-surface-variant">Adres:</strong> {address.fullAddress}, {address.district}/{address.city}</p>
                <p><strong className="text-on-surface-variant">Ödeme:</strong> {paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapida Ödeme' : 'Online Ödeme'}</p>
                {note && <p><strong className="text-on-surface-variant">Not:</strong> {note}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="flex-1 py-4 border border-outline-variant rounded-full font-bold text-on-surface-variant hover:bg-surface-container-low transition">
                  Geri
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-container text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Isleniyor...
                    </span>
                  ) : (
                    <>
                      Ödemeyi Tamamla
                      <Icon name="arrow_forward" />
                    </>
                  )}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-4">
          <aside className="sticky top-24">
            <div className="bg-surface-container-lowest rounded-xl shadow-lg shadow-on-surface/5 p-8 border border-outline-variant/10">
              <h3 className="text-xl font-headline font-bold mb-6">Siparis Özeti</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-on-surface-variant text-sm">
                  <span>Ürünler ({cartItems.length})</span>
                  <span>{formatPrice(total)} TL</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant text-sm">
                  <span>Kargo Ücreti</span>
                  <span className={deliveryFee === 0 ? 'text-secondary font-bold' : ''}>{deliveryFee === 0 ? 'Ücretsiz' : `${formatPrice(deliveryFee)} TL`}</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-lg font-bold">Toplam</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(grandTotal)} TL</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
