'use client';

import { useState } from 'react';
import { sendOtp, verifyOtp, register } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';
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
    if (otp.length < 6) return;
    // Kayıt modunda OTP doğrulamasını register endpoint'e bırakıyoruz.
    // OTP'yi frontend'de saklıyoruz, kullanıcı formu doldurunca register çağrısında gönderilecek.
    // Böylece OTP tek seferde tüketilir (register endpoint'inde).
    setStep('register-form');
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

  const inputClass = "w-full bg-surface-container-lowest border-0 focus:ring-2 focus:ring-primary rounded-xl py-3.5 px-4 transition-all text-sm";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-surface-container-lowest rounded-4xl shadow-xl p-10 w-full max-w-md border border-outline-variant/10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold tracking-tighter text-orange-800 font-headline">
            Köylüoğlu Market
          </div>
        </div>

        {/* Tabs */}
        {step === 'phone' && (
          <div className="flex rounded-full bg-surface-container-low p-1 mb-8">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition ${
                mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition ${
                mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Kayıt Ol
            </button>
          </div>
        )}

        {/* Phone Step */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp}>
            <p className="text-sm text-on-surface-variant mb-6 text-center">
              {mode === 'login'
                ? 'Kayıtlı telefon numaranızla giriş yapın'
                : 'Yeni hesap oluşturmak için telefon numaranızı girin'}
            </p>
            <label className="block text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
              <Icon name="phone" size={16} /> Telefon Numarası
            </label>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">+90</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="5XX XXX XX XX"
                maxLength={11}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl pl-14 pr-4 py-3.5 transition-all text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
            >
              {loading ? <Spinner /> : 'Doğrulama Kodu Gönder'}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={mode === 'login' ? handleVerifyLogin : handleVerifyRegister}>
            <h2 className="text-xl font-headline font-bold text-on-surface text-center mb-2">
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>
            <p className="text-sm text-on-surface-variant mb-6 bg-surface-container-low rounded-xl p-4 flex items-center gap-2">
              <Icon name="lock" size={16} className="text-primary" />
              <strong>{phone}</strong> numarasına gönderilen kodu girin
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="------"
              maxLength={6}
              className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 mb-6 text-center text-2xl tracking-[0.5em] font-bold transition-all"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
            >
              {loading ? <Spinner /> : mode === 'login' ? 'Giriş Yap' : 'Devam Et'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); }}
              className="w-full text-on-surface-variant mt-3 text-sm hover:text-primary transition flex items-center justify-center gap-1"
            >
              <Icon name="arrow_back" size={14} /> Geri dön
            </button>
          </form>
        )}

        {/* Register Form */}
        {step === 'register-form' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-xl font-headline font-bold text-on-surface text-center mb-1">Bilgilerinizi Tamamlayın</h2>
            <p className="text-sm text-on-surface-variant text-center mb-4">Teslimat için bilgilerinize ihtiyacımız var</p>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                <Icon name="person" size={16} /> Ad Soyad *
              </label>
              <input
                type="text"
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                placeholder="Adınız Soyadınız"
                className={inputClass}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                <Icon name="location_on" size={16} /> Mahalle *
              </label>
              <select
                value={registerForm.district}
                onChange={(e) => setRegisterForm({ ...registerForm, district: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Mahalle seçin</option>
                {TOKAT_MERKEZ_MAHALLELER.map((m) => (
                  <option key={m} value={m}>{m} Mahallesi</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                <Icon name="home" size={16} /> Açık Adres *
              </label>
              <textarea
                value={registerForm.fullAddress}
                onChange={(e) => setRegisterForm({ ...registerForm, fullAddress: e.target.value })}
                placeholder="Sokak, bina no, daire no..."
                rows={3}
                className={inputClass}
                required
              />
            </div>

            <div className="bg-primary-fixed rounded-xl p-4 text-sm text-on-primary-fixed-variant">
              <strong>Tokat Merkez</strong> — Şu an sadece Tokat Merkez mahallelerine teslimat yapıyoruz.
            </div>

            <button
              type="submit"
              disabled={loading || !registerForm.fullName || !registerForm.district || !registerForm.fullAddress}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
            >
              {loading ? <Spinner /> : 'Kaydı Tamamla'}
            </button>

            <button
              type="button"
              onClick={() => setStep('otp')}
              className="w-full text-on-surface-variant text-sm hover:text-primary transition flex items-center justify-center gap-1"
            >
              <Icon name="arrow_back" size={14} /> Geri dön
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-8">
          Giriş yaparak{' '}
          <a href="/sayfa/kullanim-kosullari" target="_blank" className="text-primary hover:underline">Kullanım Koşullarını</a> ve{' '}
          <a href="/sayfa/kvkk" target="_blank" className="text-primary hover:underline">KVKK Aydınlatma Metnini</a> kabul etmiş olursunuz.
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
