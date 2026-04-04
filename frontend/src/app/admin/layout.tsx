'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiShield, FiPackage, FiGrid, FiBox, FiUsers, FiLogOut, FiMenu, FiX, FiLayers, FiImage, FiSettings, FiFileText } from 'react-icons/fi';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/banners', label: 'Bannerlar', icon: FiImage },
  { href: '/admin/categories', label: 'Kategoriler', icon: FiLayers },
  { href: '/admin/orders', label: 'Siparişler', icon: FiPackage },
  { href: '/admin/products', label: 'Ürünler', icon: FiBox },
  { href: '/admin/pages', label: 'Sayfalar', icon: FiFileText },
  { href: '/admin/users', label: 'Kullanıcılar', icon: FiUsers },
  { href: '/admin/settings', label: 'Ayarlar', icon: FiSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clearAuth } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  // Auth kontrolu
  useEffect(() => {
    if (!isLoginPage && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, user, router, isLoginPage]);

  // Login sayfasinda layout gosterme
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-orange-100 border-t-brand-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <FiShield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-sm">Köylüoğlu Fresh</h1>
              <p className="text-xs text-gray-400">Yönetim Paneli</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-orange-500 text-white shadow-lg shadow-brand-orange-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <div className="w-8 h-8 bg-brand-orange-500/20 rounded-lg flex items-center justify-center">
              <span className="text-brand-orange-400 text-xs font-bold">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition w-full"
          >
            <FiLogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 text-white z-50 flex flex-col">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-orange-500 rounded-xl flex items-center justify-center">
                  <FiShield className="text-white" size={20} />
                </div>
                <span className="font-bold text-sm">Yönetim</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <FiX size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-orange-500 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 transition w-full"
              >
                <FiLogOut size={18} />
                Çıkış Yap
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900">
            <FiMenu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <FiShield className="text-brand-orange-500" size={18} />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <div className="w-6" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
