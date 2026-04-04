'use client';

import { useStore } from '@/lib/store';
import { logout as apiLogout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiPackage, FiMapPin, FiLogOut, FiUser, FiPhone, FiShield } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, isAuthenticated, clearAuth } = useStore();
  const router = useRouter();

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-brand-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiUser className="text-brand-orange-500" size={32} />
        </div>
        <p className="text-xl text-gray-500 mb-4">Profil sayfası için giriş yapın</p>
        <Link href="/login" className="inline-block bg-brand-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-orange-600 transition">
          Giriş Yap
        </Link>
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Hesabım</h1>

      {/* Profil Bilgileri */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4 border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-bold">
              {(user.fullName || 'K')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{user.fullName || 'İsimsiz Kullanıcı'}</h2>
            <p className="text-gray-500 flex items-center gap-1.5 text-sm">
              <FiPhone size={13} /> {user.phone}
            </p>
          </div>
        </div>
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="inline-flex items-center gap-2 bg-brand-orange-50 text-brand-orange-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-orange-100 transition">
            <FiShield size={14} />
            Admin Paneli →
          </Link>
        )}
      </div>

      {/* Menü */}
      <div className="space-y-3">
        <Link href="/orders" className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-brand-orange-200 hover:shadow-md transition group">
          <div className="w-10 h-10 bg-brand-orange-50 rounded-xl flex items-center justify-center group-hover:bg-brand-orange-100 transition">
            <FiPackage className="text-brand-orange-500" size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-800">Siparişlerim</p>
            <p className="text-xs text-gray-500">Sipariş geçmişi ve takip</p>
          </div>
          <span className="text-gray-300 group-hover:text-brand-orange-500 transition">→</span>
        </Link>

        <Link href="/checkout" className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-brand-orange-200 hover:shadow-md transition group">
          <div className="w-10 h-10 bg-brand-green-50 rounded-xl flex items-center justify-center group-hover:bg-brand-green-100 transition">
            <FiMapPin className="text-brand-green-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-800">Adreslerim</p>
            <p className="text-xs text-gray-500">Teslimat adreslerini yönet</p>
          </div>
          <span className="text-gray-300 group-hover:text-brand-orange-500 transition">→</span>
        </Link>

        <button onClick={handleLogout}
          className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-red-200 hover:shadow-md transition w-full text-left group">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition">
            <FiLogOut className="text-red-500" size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-600">Çıkış Yap</p>
            <p className="text-xs text-gray-500">Hesabınızdan güvenli çıkış</p>
          </div>
        </button>
      </div>
    </div>
  );
}
