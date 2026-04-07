'use client';

import { useState } from 'react';
import { sendOtp, verifyOtp } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';
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
    try { await sendOtp(normalized); setStep('otp'); toast.success('Doğrulama kodu gönderildi'); }
    catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyOtp(normalizePhone(phone), otp);
      if (res.data.user.role !== 'ADMIN') { toast.error('Bu alana erişim yetkiniz bulunmuyor'); setLoading(false); return; }
      setUser(res.data.user);
      toast.success('Yönetim paneline hoşgeldiniz!');
      router.push('/admin');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-inverse-surface via-slate-800 to-inverse-surface flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-container/30">
            <Icon name="shield" className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-white">Yönetim Paneli</h1>
          <p className="text-slate-400 mt-2">Köylüoğlu Market - Admin Girişi</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-4xl border border-white/10 p-8 shadow-2xl">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Icon name="phone" size={14} /> Telefon Numarası
              </label>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+90</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5XX XXX XX XX" maxLength={11}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl pl-14 pr-4 py-4 placeholder-slate-500 focus:ring-2 focus:ring-primary-container focus:border-primary-container focus:outline-none transition" required />
              </div>
              <button type="submit" disabled={loading || phone.length < 10}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none transition-all">
                {loading ? <Spinner /> : 'Doğrulama Kodu Gönder'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 flex items-center gap-2">
                <Icon name="lock" className="text-primary-fixed-dim" size={16} />
                <p className="text-sm text-slate-300"><strong className="text-white">{phone}</strong> numarasına gönderilen 6 haneli kodu girin</p>
              </div>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="------" maxLength={6}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-4 mb-6 text-center text-3xl tracking-[0.5em] font-bold placeholder-slate-600 focus:ring-2 focus:ring-primary-container focus:border-primary-container focus:outline-none transition" required autoFocus />
              <button type="submit" disabled={loading || otp.length < 6}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-full font-bold shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none transition-all">
                {loading ? <Spinner /> : 'Giriş Yap'}
              </button>
              <button type="button" onClick={() => { setStep('phone'); setOtp(''); }}
                className="w-full text-slate-400 mt-4 text-sm hover:text-white transition flex items-center justify-center gap-1">
                <Icon name="arrow_back" size={14} /> Telefon numarasını değiştir
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-slate-600 mt-6">Bu alan sadece yetkili personel için erişime açıktır.</p>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Lütfen bekleyin...</span>;
}
