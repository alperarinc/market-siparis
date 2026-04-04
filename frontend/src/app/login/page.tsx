'use client';

import { useState } from 'react';
import { sendOtp, verifyOtp, register } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiPhone, FiLock, FiUser, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { normalizePhone } from '@/lib/format';

const TOKAT_MERKEZ_MAHALLELER = [
  'Akdeğirmen', 'Ali Paşa', 'Ballıca', 'Behzat', 'Büyükbeybağı',
  'Cami-i Kebir', 'Çay', 'Çerçi', 'Deveci', 'Erenler',
  'Ertuğrul', 'Fevzi Çakmak', 'Gazi Osman Paşa', 'Güneşli',
  'Güryıldız', 'Hoca Ahmet Yesevi', 'Karşıyaka', 'Kemer',
  'Küçükbeybağı', 'Mahmut Paşa', 'Nusrettin', 'Örtmeliönü',
  'Seyit Ahmet', 'Solmaz', 'Süleymaniye', 'Şeyh Nasreddin',
  'Topçam', 'Yeni', 'Yeşilırmak', 'Yıldıztepe',
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'register-form'>('phone');
  const [loading, setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    fullAddress: '',
    district: '',
  });
  const { setUser } = useStore();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    setPhone(normalized);
    setLoading(true);
    try {
      await sendOtp(normalized);
      setStep('otp');
      toast.success('Doğrulama kodu gönderildi');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(normalizePhone(phone), otp);
      setUser(res.data.user);
      toast.success('Giriş başarılı!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // OTP doğrula ama giriş yapma, kayıt formuna geç
      setStep('register-form');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register({
        phone: normalizePhone(phone),
        otp,
        fullName: registerForm.fullName,
        fullAddress: registerForm.fullAddress,
        district: registerForm.district,
      });
      setUser(res.data.user);
      toast.success('Kaydınız tamamlandı! Hoşgeldiniz!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep('phone');
    setOtp('');
    setPhone('');
    setRegisterForm({ fullName: '', fullAddress: '', district: '' });
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetAll();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-brand-orange-200">
            <img src="/logo.png" alt="Köylüoğlu Fresh" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Tab: Giriş Yap / Kayıt Ol */}
        {step === 'phone' && (
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === 'login' ? 'bg-white text-brand-orange-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === 'register' ? 'bg-white text-brand-orange-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              Kayıt Ol
            </button>
          </div>
        )}

        {/* Step: Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp}>
            <p className="text-sm text-gray-500 mb-4 text-center">
              {mode === 'login'
                ? 'Kayıtlı telefon numaranızla giriş yapın'
                : 'Yeni hesap oluşturmak için telefon numaranızı girin'}
            </p>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <FiPhone className="inline mr-1.5" size={14} />
              Telefon Numarası
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+90</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="5XX XXX XX XX"
                maxLength={11}
                className="w-full border border-gray-200 rounded-xl pl-14 pr-4 py-3.5 mb-4 focus:ring-1 focus:ring-brand-orange-300 focus:border-brand-orange-300 focus:outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full bg-brand-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-brand-orange-600 disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              {loading ? <Spinner /> : 'Doğrulama Kodu Gönder'}
            </button>
          </form>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <form onSubmit={mode === 'login' ? handleVerifyLogin : handleVerifyRegister}>
            <h2 className="text-lg font-bold text-gray-800 text-center mb-1">
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>
            <p className="text-sm text-gray-500 mb-4 bg-gray-50 rounded-lg p-3">
              <FiLock className="inline mr-1.5" size={14} />
              <strong>{phone}</strong> numarasına gönderilen 6 haneli kodu girin
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="------"
              maxLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-4 mb-4 text-center text-2xl tracking-[0.5em] font-bold focus:ring-1 focus:ring-brand-orange-300 focus:border-brand-orange-300 focus:outline-none transition"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-brand-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-brand-orange-600 disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              {loading ? <Spinner /> : mode === 'login' ? 'Giriş Yap' : 'Devam Et'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); }}
              className="w-full text-gray-400 mt-3 text-sm hover:text-brand-orange-600 transition flex items-center justify-center gap-1"
            >
              <FiArrowLeft size={14} /> Geri dön
            </button>
          </form>
        )}

        {/* Step: Register Form */}
        {step === 'register-form' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Bilgilerinizi Tamamlayın</h2>
            <p className="text-sm text-gray-500 text-center mb-2">Teslimat için bilgilerinize ihtiyacımız var</p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <FiUser className="inline mr-1.5" size={14} />
                Ad Soyad *
              </label>
              <input
                type="text"
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                placeholder="Adınız Soyadınız"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-brand-orange-300 focus:border-brand-orange-300 focus:outline-none transition"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <FiMapPin className="inline mr-1.5" size={14} />
                Mahalle *
              </label>
              <select
                value={registerForm.district}
                onChange={(e) => setRegisterForm({ ...registerForm, district: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-brand-orange-300 focus:border-brand-orange-300 focus:outline-none transition bg-white"
                required
              >
                <option value="">Mahalle seçin</option>
                {TOKAT_MERKEZ_MAHALLELER.map((m) => (
                  <option key={m} value={m}>{m} Mahallesi</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <FiMapPin className="inline mr-1.5" size={14} />
                Açık Adres *
              </label>
              <textarea
                value={registerForm.fullAddress}
                onChange={(e) => setRegisterForm({ ...registerForm, fullAddress: e.target.value })}
                placeholder="Sokak, bina no, daire no..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-1 focus:ring-brand-orange-300 focus:border-brand-orange-300 focus:outline-none transition resize-none"
                required
              />
            </div>

            <div className="bg-brand-orange-50 rounded-lg p-3 text-sm text-brand-orange-700">
              <strong>📍 Tokat Merkez</strong> — Şu an sadece Tokat Merkez mahallelerine teslimat yapıyoruz.
            </div>

            <button
              type="submit"
              disabled={loading || !registerForm.fullName || !registerForm.district || !registerForm.fullAddress}
              className="w-full bg-brand-orange-500 text-white py-3.5 rounded-xl font-bold hover:bg-brand-orange-600 disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              {loading ? <Spinner /> : 'Kaydı Tamamla'}
            </button>

            <button
              type="button"
              onClick={() => setStep('otp')}
              className="w-full text-gray-400 text-sm hover:text-brand-orange-600 transition flex items-center justify-center gap-1"
            >
              <FiArrowLeft size={14} /> Geri dön
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Giriş yaparak{' '}
          <a href="/sayfa/kullanim-kosullari" target="_blank" className="text-brand-orange-500 hover:underline">Kullanım Koşullarını</a> ve{' '}
          <a href="/sayfa/kvkk" target="_blank" className="text-brand-orange-500 hover:underline">KVKK Aydınlatma Metnini</a> kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Lütfen bekleyin...
    </span>
  );
}
