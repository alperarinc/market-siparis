'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { createOrder } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiTruck, FiCheck } from 'react-icons/fi';

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
    { key: 'address', label: 'Adres', icon: <FiMapPin size={16} /> },
    { key: 'payment', label: 'Ödeme', icon: <FiCreditCard size={16} /> },
    { key: 'confirm', label: 'Onay', icon: <FiCheck size={16} /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500 mb-4">Sipariş vermek için giriş yapın</p>
        <Link href="/login" className="inline-block bg-brand-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-orange-600 transition">Giriş Yap</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl text-gray-600 mb-4">Sepetiniz boş</h2>
        <Link href="/" className="inline-block bg-brand-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-orange-600 transition">Alışverişe Başla</Link>
      </div>
    );
  }

  const handleSaveAddress = async () => {
    if (!address.fullAddress.trim()) {
      toast.error('Adres alanı zorunludur');
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
      const res = await createOrder({ addressId, paymentMethod, note: note || undefined });
      clearCart();
      toast.success('Siparişiniz alındı!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 focus:outline-none transition text-sm";

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Siparişi Tamamla</h1>

      {/* Adım Göstergesi */}
      <div className="flex items-center gap-0 mb-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                i === currentStepIndex
                  ? 'bg-brand-orange-500 text-white shadow-sm'
                  : i < currentStepIndex
                  ? 'bg-brand-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {i < currentStepIndex ? <FiCheck size={16} /> : s.icon}
              </div>
              <span className={`text-sm ${i === currentStepIndex ? 'font-bold text-gray-800' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div className={`h-0.5 w-full mx-2 rounded ${i < currentStepIndex ? 'bg-brand-green-500' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Adres Adımı */}
          {step === 'address' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-brand-orange-50 rounded-lg flex items-center justify-center">
                  <FiMapPin className="text-brand-orange-500" size={16} />
                </span>
                Teslimat Adresi
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">İl</label>
                    <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})}
                      placeholder="İstanbul" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">İlçe</label>
                    <input type="text" value={address.district} onChange={(e) => setAddress({...address, district: e.target.value})}
                      placeholder="Kadıköy" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Açık Adres *</label>
                  <textarea value={address.fullAddress} onChange={(e) => setAddress({...address, fullAddress: e.target.value})}
                    placeholder="Mahalle, sokak, bina bilgileri..." rows={3}
                    className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bina No</label>
                    <input type="text" value={address.buildingNo} onChange={(e) => setAddress({...address, buildingNo: e.target.value})}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kat</label>
                    <input type="text" value={address.floorNo} onChange={(e) => setAddress({...address, floorNo: e.target.value})}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Daire</label>
                    <input type="text" value={address.doorNo} onChange={(e) => setAddress({...address, doorNo: e.target.value})}
                      className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adres Tarifi</label>
                  <input type="text" value={address.directions} onChange={(e) => setAddress({...address, directions: e.target.value})}
                    placeholder="Apartman ismi, yol tarifi vb." className={inputClass} />
                </div>
                <button onClick={handleSaveAddress}
                  className="w-full bg-brand-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-brand-orange-600 transition shadow-sm">
                  Devam Et →
                </button>
              </div>
            </div>
          )}

          {/* Ödeme Adımı */}
          {step === 'payment' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-brand-orange-50 rounded-lg flex items-center justify-center">
                  <FiCreditCard className="text-brand-orange-500" size={16} />
                </span>
                Ödeme Yöntemi
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === 'CASH_ON_DELIVERY' ? 'border-brand-orange-500 bg-brand-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="CASH_ON_DELIVERY" checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={(e) => setPaymentMethod(e.target.value)} className="accent-brand-orange-500 w-4 h-4" />
                  <FiTruck className="text-brand-orange-500" size={24} />
                  <div>
                    <p className="font-bold text-sm">Kapıda Ödeme</p>
                    <p className="text-xs text-gray-500">Nakit veya kart ile kapıda ödeme yapın</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                  paymentMethod === 'CREDIT_CARD' ? 'border-brand-orange-500 bg-brand-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="CREDIT_CARD" checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)} className="accent-brand-orange-500 w-4 h-4" />
                  <FiCreditCard className="text-brand-orange-500" size={24} />
                  <div>
                    <p className="font-bold text-sm">Online Ödeme</p>
                    <p className="text-xs text-gray-500">Kredi/banka kartı ile güvenli ödeme (Yakında)</p>
                  </div>
                </label>
              </div>
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sipariş Notu (Opsiyonel)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Kapıyı çalmayın, meyveleri az olgun seçin vb." rows={2}
                  className={inputClass} />
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep('address')} className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">← Geri</button>
                <button onClick={() => setStep('confirm')} className="flex-1 bg-brand-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-brand-orange-600 transition shadow-sm">
                  Devam Et →
                </button>
              </div>
            </div>
          )}

          {/* Onay Adımı */}
          {step === 'confirm' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-brand-green-50 rounded-lg flex items-center justify-center">
                  <FiCheck className="text-brand-green-600" size={16} />
                </span>
                Sipariş Onayı
              </h2>
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit} x {formatPrice(item.price)} TL</p>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)} TL</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1.5">
                <p><strong className="text-gray-600">📍 Adres:</strong> {address.fullAddress}, {address.district}/{address.city}</p>
                <p><strong className="text-gray-600">💳 Ödeme:</strong> {paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Ödeme' : 'Online Ödeme'}</p>
                {note && <p><strong className="text-gray-600">📝 Not:</strong> {note}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">← Geri</button>
                <button onClick={handleConfirmOrder} disabled={loading}
                  className="flex-1 bg-brand-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-green-700 disabled:bg-gray-200 disabled:text-gray-400 transition shadow-sm">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      İşleniyor...
                    </span>
                  ) : 'Siparişi Onayla ✓'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sipariş Özeti */}
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit lg:sticky lg:top-24 border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Sipariş Özeti</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ürünler ({cartItems.length})</span>
              <span className="font-medium">{formatPrice(total)} TL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Teslimat</span>
              <span className={deliveryFee === 0 ? 'text-brand-green-600 font-bold' : 'font-medium'}>
                {deliveryFee === 0 ? 'Ücretsiz' : `${formatPrice(deliveryFee)} TL`}
              </span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between text-lg font-extrabold">
              <span>Toplam</span>
              <span className="text-brand-orange-600">{formatPrice(grandTotal)} TL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
