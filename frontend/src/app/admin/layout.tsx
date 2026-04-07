'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/banners', label: 'Bannerlar', icon: 'image' },
  { href: '/admin/categories', label: 'Kategoriler', icon: 'layers' },
  { href: '/admin/orders', label: 'Siparişler', icon: 'local_shipping' },
  { href: '/admin/products', label: 'Ürünler', icon: 'inventory_2' },
  { href: '/admin/pages', label: 'Sayfalar', icon: 'description' },
  { href: '/admin/users', label: 'Kullanıcılar', icon: 'group' },
  { href: '/admin/settings', label: 'Ayarlar', icon: 'settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, clearAuth } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, user, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => { clearAuth(); router.push('/admin/login'); };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-lg">
            <Icon name="shield" className="text-white" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-sm text-white">Köylüoğlu Market</h1>
            <p className="text-xs text-slate-400">Yönetim Paneli</p>
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
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-container text-white shadow-lg shadow-primary-container/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2 mb-3">
          <div className="w-8 h-8 bg-primary-container/20 rounded-lg flex items-center justify-center">
            <span className="text-primary-fixed-dim text-xs font-bold">{user?.fullName?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.phone}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition w-full"
        >
          <Icon name="logout" size={18} />
          Çıkış Yap
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-inverse-surface text-white">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-inverse-surface text-white z-50 flex flex-col">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                <Icon name="close" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden glass-nav shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-on-surface-variant hover:text-on-surface p-1">
            <Icon name="menu" />
          </button>
          <div className="flex items-center gap-2">
            <Icon name="shield" className="text-primary-container" size={18} />
            <span className="font-headline font-bold text-sm">Admin Panel</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
