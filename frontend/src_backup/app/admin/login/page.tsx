'use client';

import { useState } from 'react';
import { sendOtp, verifyOtp } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiShield, FiPhone, FiLock, FiArrowLeft } from 'react-icons/fi';
import { normalizePhone } from '@/lib/format';

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const normalized = normalizePhone(phone);
    setPhone(normalized);
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(normalizePhone(phone), otp);
      const user = res.data.user;

      if (user.role !== 'ADMIN') {
        toast.error('Bu alana erişim yetkiniz bulunmuyor');
        setLoading(false);
        return;
      }

      setUser(user);
      toast.success('Yönetim paneline hoşgeldiniz!');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-orange-500/30">
            <FiShield className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-white">Yönetim Paneli</h1>
          <p className="text-gray-400 mt-2">Köylüoğlu Fresh - Admin Girişi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <FiPhone className="inline mr-2" size={14} />
                Telefon Numarası
              </label>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+90</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5XX XXX XX XX"
                  maxLength={11}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl pl-14 pr-4 py-4 placeholder-gray-500 focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 focus:outline-none transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full bg-brand-orange-500 text-white py-4 rounded-xl font-bold hover:bg-brand-orange-600 disabled:bg-gray-700 disabled:text-gray-500 transition shadow-lg shadow-brand-orange-500/20 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gönderiliyor...
                  </span>
                ) : 'Doğrulama Kodu Gönder'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <p className="text-sm text-gray-300">
                  <FiLock className="inline mr-2" size={14} />
                  <strong className="text-white">{phone}</strong> numarasına gönderilen 6 haneli kodu girin
                </p>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="------"
                maxLength={6}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-4 mb-6 text-center text-3xl tracking-[0.5em] font-bold placeholder-gray-600 focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 focus:outline-none transition"
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-brand-orange-500 text-white py-4 rounded-xl font-bold hover:bg-brand-orange-600 disabled:bg-gray-700 disabled:text-gray-500 transition shadow-lg shadow-brand-orange-500/20 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Doğrulanıyor...
                  </span>
                ) : 'Giriş Yap'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full text-gray-400 mt-4 text-sm hover:text-white transition flex items-center justify-center gap-1"
              >
                <FiArrowLeft size={14} />
                Telefon numarasını değiştir
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Bu alan sadece yetkili personel için erişime açıktır.
        </p>
      </div>
    </div>
  );
}
