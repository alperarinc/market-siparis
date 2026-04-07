'use client';

import { useStore } from '@/lib/store';
import { logout as apiLogout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Icon from '@/components/Icon';

export default function ProfilePage() {
  const { user, isAuthenticated, clearAuth } = useStore();
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="person" className="text-primary text-3xl" />
        </div>
        <p className="text-xl text-slate-500 mb-4">Profil sayfası için giriş yapın</p>
        <Link href="/login" className="btn-primary inline-block">Giriş Yap</Link>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {}
    clearAuth();
    toast.success('Çıkış yapıldı');
    router.push('/');
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 max-w-5xl mx-auto">
      {/* Sidebar */}
      <aside className="w-full md:w-72 shrink-0">
        <div className="bg-surface-container-low p-6 rounded-xl space-y-2 sticky top-28">
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-fixed border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {(user.fullName || 'K')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">{user.fullName || 'Kullanıcı'}</h2>
              <p className="text-xs font-label uppercase tracking-widest text-slate-500">{user.phone}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link href="/orders" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold shadow-sm transition-all">
              <Icon name="receipt_long" />
              <span className="font-label">Siparişlerim</span>
            </Link>
            <Link href="/checkout" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-white/50 transition-colors">
              <Icon name="location_on" />
              <span className="font-label">Adreslerim</span>
            </Link>
            <Link href="/cart" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-white/50 transition-colors">
              <Icon name="favorite" />
              <span className="font-label">Favorilerim</span>
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-white/50 transition-colors">
                <Icon name="admin_panel_settings" />
                <span className="font-label">Admin Paneli</span>
              </Link>
            )}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-error hover:bg-error/5 transition-colors w-full"
              >
                <Icon name="logout" />
                <span className="font-label">Oturumu Kapat</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-grow">
        <div className="mb-10">
          <h1 className="text-4xl font-headline font-black tracking-tighter text-on-surface mb-2">Hesabım</h1>
          <p className="text-slate-500 font-body">Hesap bilgilerinizi ve siparişlerinizi yönetin.</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link href="/orders" className="block bg-surface-container-lowest editorial-shadow rounded-xl p-6 border border-slate-100 hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon name="local_shipping" size={28} />
              </div>
              <div className="flex-grow">
                <h3 className="font-headline font-bold text-lg mb-1">Siparişlerim</h3>
                <p className="text-sm text-slate-500">Tüm geçmiş ve aktif siparişlerinizi buradan takip edebilirsiniz.</p>
              </div>
              <Icon name="arrow_forward" className="text-slate-400" />
            </div>
          </Link>

          <Link href="/products" className="block bg-surface-container-lowest editorial-shadow rounded-xl p-6 border border-slate-100 hover:scale-[1.01] transition-transform duration-300">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Icon name="shopping_basket" size={28} />
              </div>
              <div className="flex-grow">
                <h3 className="font-headline font-bold text-lg mb-1">Alışverişe Devam Et</h3>
                <p className="text-sm text-slate-500">Taze ürünlerimize göz atın.</p>
              </div>
              <Icon name="arrow_forward" className="text-slate-400" />
            </div>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-secondary/5 p-8 rounded-2xl flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Icon name="support_agent" size={28} />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg mb-1">Yardıma mı ihtiyacınız var?</h3>
              <p className="text-sm text-slate-500 mb-3">Siparişinizle ilgili bir sorun mu yaşıyorsunuz?</p>
              <Link href="/sayfa/iletisim" className="text-secondary font-bold text-sm flex items-center gap-1 hover:underline">
                İletişim <Icon name="arrow_forward" size={14} />
              </Link>
            </div>
          </div>
          <div className="bg-orange-50 p-8 rounded-2xl flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-primary">
              <Icon name="star_rate" filled size={28} />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg mb-1">Deneyiminizi Paylaşın</h3>
              <p className="text-sm text-slate-500 mb-3">Geri bildiriminiz bizim için önemli.</p>
              <Link href="/sayfa/iletisim" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                Görüş Bildirin <Icon name="arrow_forward" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
